/* Verified IdleArc Season 2 class/passive skill rules and source-backed data adapters. */
import {VERIFIED_CLASS_SKILL_TREES,VERIFIED_CLASS_SKILL_SOURCE} from './verified-class-skills.js';
import {VERIFIED_PASSIVE_TREE,VERIFIED_PASSIVE_SOURCE} from './verified-passive-tree.js';
const num=(x,f=0)=>Number.isFinite(Number(x))?Number(x):f;
const arr=x=>Array.isArray(x)?x:Object.values(x||{});
const text=x=>String(x??'');
const first=(x,...keys)=>{for(const k of keys)if(x?.[k]!=null)return x[k];return undefined};
export const TREE_DATA_URL='/game-assets/skill-tree';
export const classPointBudget=level=>Math.max(0,Math.floor((Math.max(1,num(level,1))-1)/3)+1);
export const passivePointBudget=level=>Math.max(0,Math.floor(num(level,0)));
export const allocatedTotal=a=>Object.values(a||{}).reduce((s,x)=>s+Math.max(0,num(x)),0);
function skillRank(s){return num(first(s,'max_level','max_points','max_rank','max_points_per_skill','maxLevel','maxRank'),0)}
function skillReqs(s){const r=first(s,'prerequisites','requires','required_skills','dependencies');return arr(r).map(x=>text(typeof x==='object'?first(x,'id','skill_id','skillId'):x)).filter(Boolean)}
function normalizeSkill(s,i){return {...s,id:text(first(s,'id','skill_id','key')??i),name:text(first(s,'name','title','display_name')||`Skill ${i+1}`),tier:num(first(s,'tier','tier_number','tier_index'),-1),row:num(first(s,'row','row_index','row_number'),-1),pointsToUnlock:num(first(s,'points_required_to_unlock','pointsRequiredToUnlock','required_points'),0),maxRank:skillRank(s),prereqs:skillReqs(s)} }
function normalizeBranch(b,i){const skills=arr(first(b,'skills','nodes','abilities')).map(normalizeSkill);return {...b,id:text(first(b,'id','key')??i),name:text(first(b,'name','title','branch_name')||`Branch ${i+1}`),skills}}
function normalizeClass(c,i){return {...c,id:text(first(c,'id','class_id','key')??i),name:text(first(c,'name','title','class_name')||`Class ${i+1}`),icon:first(c,'icon','icon_url','iconUrl','icon_path','image'),branches:arr(first(c,'branches','specializations','trees')).map(normalizeBranch)}}
const PASSIVE_STATS=VERIFIED_PASSIVE_TREE.stat_display||{};
export const passiveStatDisplay=key=>PASSIVE_STATS[String(key)]||null;
export function passiveValue(node,rank=1){
 const display=passiveStatDisplay(node?.stat);
 if(!display)return String(node?.value??0);
 const v=Number(node?.value||0)*Number(rank);
 const formatted=Number(v.toFixed(5)).toLocaleString('en-US',{maximumFractionDigits:5});
 return String(display.format||'+{value}').replace('{value}',formatted);
}
function normalizeNode(n,row,col,milestone=false){
 const key=String(first(n,'stat','name','stat_name')||'');
 const display=passiveStatDisplay(key);
 return {...n,row,col,key:`${row}:${col}`,id:text(first(n,'id','node_id')??`${row}:${col}`),
  stat:key,name:String(display?.name||first(n,'name','stat_name','label','title')||key),
  description:String(display?.name||key)+' · per point: '+String(display?.format||'+{value}').replace('{value}',String(n.per_point??0)),
  value:first(n,'per_point','value_per_point','value','amount_per_point'),
  maxRank:num(first(n,'max_points','max_rank','max_level','points_max','max'),0),
  milestone:!!milestone,
  icon:display?.icon||'',
  unitFormat:display?.format||'+{value}'
 };
}
function normalizeRows(p){
 const raw=first(p,'rows','tree','nodes');if(!raw)return [];
 return arr(raw).map((record,index)=>{
  const row=num(first(record,'index','row','row_number'),index);
  const m=!!first(record,'milestone','is_milestone','isMilestone');
  const nodes=arr(first(record,'nodes','passives','skills')).map((n,col)=>normalizeNode(n,row,col,m));
  return {index:row,milestone:m,nodes};
 });
}
const CLASS_LABELS={1:'Warrior',2:'Archer',3:'Mage',4:'Rogue',5:'Druid'};
export function verifiedClassTrees(){
 return Object.entries(VERIFIED_CLASS_SKILL_TREES).map(([id,branches])=>normalizeClass({
  id,name:CLASS_LABELS[id],branches:branches.map(b=>({...b,skills:b.skills.map(s=>({...s,tier:Number(s.points_required_to_unlock)/5}))}))
 },Number(id)-1));
}
export function normalizeTree(raw){
 const p=VERIFIED_PASSIVE_TREE,rows=normalizeRows(p);
 let tiers=arr(first(p,'tiers','tier_config','tierConfig')).map((t,i)=>({index:i,start:num(first(t,'start_row','startRow'),i*10),end:num(first(t,'end_row','endRow'),i*10+9),required:i===0?0:num(first(t,'unlock_threshold','unlockThreshold'),20),milestone:!!first(t,'is_milestone','milestone')}));
 if(!tiers.length&&rows.length)tiers=Array.from({length:Math.ceil(rows.length/10)},(_,i)=>({index:i,start:i*10,end:i*10+9,required:i===0?0:20,milestone:false}));
 return {classes:verifiedClassTrees(),classSource:VERIFIED_CLASS_SKILL_SOURCE,passive:{tiers,rows,stat_display:PASSIVE_STATS},passiveSource:VERIFIED_PASSIVE_SOURCE,source:'Class skills: '+VERIFIED_CLASS_SKILL_SOURCE+' · Passives: '+VERIFIED_PASSIVE_SOURCE,verifiedVersion:true};
}
export function getClass(tree,id){return tree.classes.find(c=>c.id===String(id))||tree.classes[0]}
export function getBranch(cls,id){return cls?.branches?.find(b=>b.id===String(id))||cls?.branches?.[0]}
export function rowTier(tree,row){return tree.passive.tiers.findIndex(t=>row>=t.start&&row<=t.end)}
export function passiveTierSpend(tree,allocation,i){const t=tree.passive.tiers[i];if(!t)return 0;return Object.entries(allocation||{}).reduce((sum,[key,v])=>{const row=+key.split(':')[0];return sum+(row>=t.start&&row<=t.end?Math.max(0,num(v)):0)},0)}
/** Returns every game-rule violation in an allocation.
 * All rows remain inspectable regardless of lock status; only point edits are restricted.
 * A tier's first row is gated by the prior tier's 20-point threshold, NOT by
 * selecting that prior tier's milestone (milestones are optional).
 */
export function passiveViolations(tree,allocation,level=Infinity){
 const rows=tree?.passive?.rows||[],tiers=tree?.passive?.tiers||[],a=allocation||{},issues=[];
 for(const tier of tiers){
  const activeRows=rows.filter(row=>row.index>=tier.start&&row.index<=tier.end);
  if(tier.index>0&&activeRows.some(row=>row.nodes.some(node=>num(a[node.key])>0))){
   const previous=passiveTierSpend(tree,a,tier.index-1);
   if(previous<tier.required)issues.push({id:'tier:'+tier.index,reason:`Tier ${tier.index+1} requires ${tier.required} points in Tier ${tier.index}`});
  }
  for(let i=1;i<activeRows.length;i++){
   const current=activeRows[i],previous=activeRows[i-1];
   if(current.nodes.some(node=>num(a[node.key])>0)&&!previous.nodes.some(node=>num(a[node.key])>0)){
    issues.push({id:'row:'+current.index,reason:`Row ${current.index+1} requires at least 1 point in Row ${previous.index+1}`});
   }
  }
  const chosen=activeRows.filter(row=>row.milestone).flatMap(row=>row.nodes).filter(node=>num(a[node.key])>0);
  if(chosen.length>1)issues.push({id:'milestone:'+tier.index,reason:`Only one milestone can be selected in Tier ${tier.index+1}`});
 }
 if(Number.isFinite(level)&&allocatedTotal(a)>passivePointBudget(level)){
  issues.push({id:'budget',reason:`The allocation exceeds the ${passivePointBudget(level)} passive points available at character level ${level}`});
 }
 return issues;
}
/** In Free Allocation mode skip all progression rules and the level budget.
 * Still honor source-backed per-node rank caps. In Strict mode, forbid any
 * newly introduced invalid state while allowing players to repair an older
 * sandbox build one removal at a time without discarding their setup.
 */
export function passiveAllowed(tree,allocation,node,delta,level,free=false){
 if(!tree?.passive?.tiers?.length||!node||!Number.isInteger(delta)||Math.abs(delta)!==1)return {ok:false,reason:'Invalid node or adjustment'};
 if(!Number.isInteger(node.maxRank)||node.maxRank<=0)return {ok:false,reason:'Point limit unavailable in source data'};
 const a={...allocation},old=num(a[node.key]),next=old+delta;
 if(next<0||next>node.maxRank)return {ok:false,reason:'Node point cap reached'};
 if(next)a[node.key]=next;else delete a[node.key];
 if(free)return {ok:true,allocation:a};
 const before=passiveViolations(tree,allocation,level),after=passiveViolations(tree,a,level);
 if(delta>0){
  if(allocatedTotal(a)>passivePointBudget(level))return {ok:false,reason:'No passive points remaining for this level'};
  const tierIndex=rowTier(tree,node.row),tier=tree.passive.tiers[tierIndex];
  if(!tier)return {ok:false,reason:'Passive row has no verified tier'};
  if(tierIndex>0&&passiveTierSpend(tree,allocation,tierIndex-1)<tier.required){
   return {ok:false,reason:`Tier ${tierIndex+1} requires ${tier.required} points in Tier ${tierIndex}`};
  }
  if(node.row>tier.start){
   const previous=tree.passive.rows.find(row=>row.index===node.row-1);
   if(!previous?.nodes.some(n=>num(allocation?.[n.key])>0)){
    return {ok:false,reason:`Allocate at least 1 point in Row ${node.row} before unlocking Row ${node.row+1}`};
   }
  }
  if(node.milestone&&old===0){
   const row=tree.passive.rows.find(row=>row.index===node.row);
   if(row?.nodes.some(n=>n.key!==node.key&&num(allocation?.[n.key])>0)){
    return {ok:false,reason:`Only one milestone can be selected in Tier ${tierIndex+1}`};
   }
  }
 }
 const existing=new Set(before.map(issue=>issue.id));
 const newlyInvalid=after.find(issue=>!existing.has(issue.id));
 if(newlyInvalid)return {ok:false,reason:newlyInvalid.reason};
 return {ok:true,allocation:a};
}
export function classAllowed(cls,allocation,skill,delta,level){if(!cls||!skill||!Number.isInteger(delta)||Math.abs(delta)!==1)return {ok:false,reason:'Invalid skill or adjustment'};
 const a={...allocation},old=num(a[skill.id]);if(!skill.maxRank)return {ok:false,reason:'Skill cap unavailable in source data'};
 const next=old+delta;if(next<0||next>skill.maxRank)return {ok:false,reason:'Skill rank cap reached'};
 if(delta>0&&allocatedTotal(a)>=classPointBudget(level))return {ok:false,reason:'Not enough class points for your character level'};
 if(next)a[skill.id]=next;else delete a[skill.id];
 for(const branch of cls.branches){const skills=branch.skills;for(const candidate of skills){const rank=num(a[candidate.id]);if(rank<=0)continue;
  if(candidate.prereqs.some(id=>num(a[id])===0))return {ok:false,reason:`${candidate.name} requires its prerequisite skill`};
  const otherSpend=skills.reduce((sum,s)=>sum+num(a[s.id]),0)-rank;
  if(otherSpend<candidate.pointsToUnlock)return {ok:false,reason:`${candidate.name} requires ${candidate.pointsToUnlock} other points in ${branch.name}`};
 }}
 return {ok:true,allocation:a};}
export function allocationsValid(tree,passive,classAlloc,cls,level){const p=Object.entries(passive||{});const c=Object.entries(classAlloc||{});return {passiveCount:p.length,classCount:c.length,passiveTotal:allocatedTotal(passive),classTotal:allocatedTotal(classAlloc),passiveBudget:passivePointBudget(level),classBudget:classPointBudget(level)};}
