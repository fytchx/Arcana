/* Skill allocations use verified Season 2 class rules; passive tree remains separate and pending correction. */
import {VERIFIED_CLASS_SKILL_TREES,VERIFIED_CLASS_SKILL_SOURCE} from './verified-class-skills.js';
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
function normalizeNode(n,row,col){return {...n,row,col,key:`${row}:${col}`,id:text(first(n,'id','node_id')??`${row}:${col}`),name:text(first(n,'name','stat','stat_name','label','title')||'Passive'),description:text(first(n,'description','details','effect')||''),value:first(n,'value_per_point','value','amount_per_point','per_point'),maxRank:num(first(n,'max_points','max_rank','max_level','points_max','max'),0),milestone:!!first(n,'is_milestone','milestone','isMilestone')}}
function normalizeRows(p){const raw=first(p,'rows','tree','nodes');if(!raw)return [];if(Array.isArray(raw)&&raw.length&&Array.isArray(raw[0]))return raw.map((n,r)=>({index:r,nodes:n.map((x,i)=>normalizeNode(x,r,i))}));
 if(Array.isArray(raw)&&raw.length&&(raw[0]?.nodes||raw[0]?.passives||raw[0]?.skills)){return raw.map((record,r)=>({index:num(first(record,'index','row','row_number'),r),nodes:arr(first(record,'nodes','passives','skills')).map((n,i)=>normalizeNode(n,num(first(record,'index','row','row_number'),r),i))}))}
 if(Array.isArray(raw)&&raw[0]&&(raw[0]?.row!=null||raw[0]?.row_index!=null)){const map=new Map;raw.forEach((node,i)=>{const row=num(first(node,'row','row_index','row_number'));if(!map.has(row))map.set(row,[]);map.get(row).push(normalizeNode(node,row,map.get(row).length))});return [...map].map(([index,nodes])=>({index,nodes})).sort((a,b)=>a.index-b.index)}
 return []}
const CLASS_LABELS={1:'Warrior',2:'Archer',3:'Mage',4:'Rogue',5:'Druid'};
export function verifiedClassTrees(){
 return Object.entries(VERIFIED_CLASS_SKILL_TREES).map(([id,branches])=>normalizeClass({
  id,name:CLASS_LABELS[id],branches:branches.map(b=>({...b,skills:b.skills.map(s=>({...s,tier:Number(s.points_required_to_unlock)/5}))}))
 },Number(id)-1));
}
export function normalizeTree(raw){
 const p=first(raw,'passive','passive_tree','passiveTree')||{},rows=normalizeRows(p);
 let tiers=arr(first(p,'tiers','tier_config','tierConfig')).map((t,i)=>({index:i,start:num(first(t,'start_row','startRow'),i*10),end:num(first(t,'end_row','endRow'),i*10+9),required:i===0?0:num(first(t,'unlock_threshold','unlockThreshold'),20),milestone:!!first(t,'is_milestone','milestone')}));
 if(!tiers.length&&rows.length)tiers=Array.from({length:Math.ceil(rows.length/10)},(_,i)=>({index:i,start:i*10,end:i*10+9,required:i===0?0:20,milestone:false}));
 return {classes:verifiedClassTrees(),classSource:VERIFIED_CLASS_SKILL_SOURCE,passive:{tiers,rows},source:'Class skill data: '+VERIFIED_CLASS_SKILL_SOURCE+' · Passive tree: external legacy export (not yet corrected)',verifiedVersion:true,raw};
}
export function getClass(tree,id){return tree.classes.find(c=>c.id===String(id))||tree.classes[0]}
export function getBranch(cls,id){return cls?.branches?.find(b=>b.id===String(id))||cls?.branches?.[0]}
export function rowTier(tree,row){return tree.passive.tiers.findIndex(t=>row>=t.start&&row<=t.end)}
export function passiveTierSpend(tree,allocation,i){const t=tree.passive.tiers[i];if(!t)return 0;return Object.entries(allocation||{}).reduce((sum,[key,v])=>{const row=+key.split(':')[0];return sum+(row>=t.start&&row<=t.end?Math.max(0,num(v)):0)},0)}
export function passiveAllowed(tree,allocation,node,delta,level){if(!node||!Number.isInteger(delta)||Math.abs(delta)!==1)return {ok:false,reason:'Invalid node or adjustment'};
 if(node.maxRank<=0)return {ok:false,reason:'Point limit unavailable in source data'};
 const a={...allocation},old=num(a[node.key]);const next=old+delta;if(next<0||next>node.maxRank)return {ok:false,reason:'Node point cap reached'};
 if(delta>0&&allocatedTotal(a)>=passivePointBudget(level))return {ok:false,reason:'No passive points remaining for this level'};
 if(next)a[node.key]=next;else delete a[node.key];
 const tiers=tree.passive.tiers;
 for(let i=1;i<tiers.length;i++){const spent=passiveTierSpend(tree,a,i);if(spent===0)continue;const previous=passiveTierSpend(tree,a,i-1);const required=tiers[i].required;
  if(previous<required)return {ok:false,reason:`Tier ${i+1} requires ${required} points spent in tier ${i}`};}
 return {ok:true,allocation:a};}
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
