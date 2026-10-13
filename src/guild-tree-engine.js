import {GUILD_TREE_SOURCE as SOURCE} from './guild-tree-data.js';

export const GUILD_TREE=SOURCE.skill_tree;
export const GUILD_GROUPS=[
  {id:'vanguard',title:'Vanguard',description:'Attack, pet damage, Retaliation and flat damage'},
  {id:'finesse',title:'Finesse',description:'Critical strikes, dodge and defense'},
  {id:'fortune',title:'Fortune',description:'Gold, EXP and guild boss damage'}
];
export const GUILD_NODE_LABELS={
  attack_damage:'Attack Damage',pet_damage:'Pet Damage',retaliation_damage:'Retaliation Damage',
  flat_attack_damage:'Flat Attack Damage',flat_pet_damage:'Flat Pet Damage',
  critical_strike_chance:'Critical Strike Chance',dodge_chance:'Dodge Chance',
  defense_percent:'Defense',gold_gain:'Gold Gain',exp_gain:'EXP Gain',
  guild_boss_damage:'Guild Boss Damage'
};
export const GUILD_BASE_NODES=GUILD_TREE.rows.flatMap(row=>row.nodes.map(n=>({...n,family:row.id})));
export const GUILD_BONUS_BOOSTS=[1,...SOURCE.arcstone_boost.tiers.map(t=>t.multiplier)];
const EVENT_IDS='abcdefghijkmVFO';
const BASE_IDS=Object.fromEntries(GUILD_BASE_NODES.map((n,i)=>[n.id,EVENT_IDS[i]]));
const DECODE=new Map(GUILD_BASE_NODES.map((n,i)=>[EVENT_IDS[i],n.id]));
DECODE.set('m','mastery');
for(const [i,family] of GUILD_TREE.endgame.families.entries())DECODE.set('VFO'[i],'family:'+family.id);
const CODES=new Map([...DECODE].map(([k,v])=>[v,k]));
const STORAGE_KEY='arcana-guild-tree-draft-v1';
const int=(v,base,min,max)=>{
 if(v===null||v===undefined||v==='')return base;
 const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.trunc(n))):base;
};
export const guildPointBudget=level=>{
 const l=int(level,25,1,99999),start=GUILD_TREE.endgame.from_level;
 return l*GUILD_TREE.points_per_level+Math.max(0,l-start)*(GUILD_TREE.endgame.points_per_level-GUILD_TREE.points_per_level);
};
export const freshGuildTree=(level=25)=>({level:int(level,25,1,99999),events:'',boost:1});
export const guildTreeCounts=events=>{
 const result={};for(const k of CODES.keys())result[k]=0;
 for(const ch of events||''){const id=DECODE.get(ch);if(id)result[id]++;}
 return result;
};
export const guildTreeSpent=plan=>String(plan?.events||'').length;
const familyCounts=counts=>GUILD_GROUPS.map(g=>counts['family:'+g.id]||0);
export function guildTreeRule(plan,key){
 const counts=guildTreeCounts(plan.events),spent=guildTreeSpent(plan),budget=guildPointBudget(plan.level);
 if(spent>=budget)return 'All guild points are spent';
 const target=GUILD_BASE_NODES.find(n=>n.id===key);
 if(target){
  const rank=counts[key];
  if(rank>=target.ranks.length)return 'Maximum rank reached';
  const next=rank+1;
  const gate=GUILD_TREE.tier_gates.filter(t=>t.from_rank<=next).at(-1);
  if(spent<gate.unlock_spent)return 'Spend '+(gate.unlock_spent-spent)+' more points to unlock rank '+next;
  return null;
 }
 if(key==='mastery'){
  if(spent<GUILD_TREE.mastery.unlock_spent)return 'Ascension unlocks after 68 points spent';
  const max=Math.max(0,plan.level-GUILD_TREE.endgame.from_level)*GUILD_TREE.mastery.max_ranks_per_level;
  if((counts.mastery||0)>=max)return 'Mastery is capped at one rank per guild level above 68';
  return null;
 }
 if(key.startsWith('family:')){
  if(spent<GUILD_TREE.endgame.unlock_spent)return 'Ascension unlocks after 68 points spent';
  const id=key.slice('family:'.length),index=GUILD_GROUPS.findIndex(g=>g.id===id);
  if(index<0)return 'Unknown family';
  const ranks=familyCounts(counts),current=ranks[index],next=current+1;
  const step=GUILD_TREE.endgame.family_step;
  const crossed=Math.floor((next-1)/step)*step;
  if(crossed===0)return null;
  const others=ranks.filter((_,i)=>i!==index).sort((a,b)=>b-a);
  if(others[0]<crossed)return 'Another family must reach rank '+crossed+' first';
  if(crossed>=step*2&&others[1]<crossed-step)return 'Third family must reach rank '+(crossed-step)+' first';
  return null;
 }
 return 'Unknown guild skill';
}
export function allocateGuildPoint(plan,key){
 const code=CODES.get(key);if(!code)return {plan,reason:'Unknown guild skill'};
 const reason=guildTreeRule(plan,key);if(reason)return {plan,reason};
 return {plan:{...plan,events:plan.events+code},reason:null};
}
export function validateGuildEvents(level,events){
 const clean=freshGuildTree(level);
 if(typeof events!=='string'||events.length>4096||/[^a-kmVFO]/.test(events))return clean;
 let state=clean;
 for(const code of events){
  const key=DECODE.get(code);
  if(!key)break;
  const result=allocateGuildPoint(state,key);
  if(result.reason)break;
  state=result.plan;
 }
 return state;
}
export function removeGuildPoint(plan,key){
 const code=CODES.get(key),index=plan.events.lastIndexOf(code);
 if(!code||index<0)return {plan,reason:'No ranks to refund'};
 const events=plan.events.slice(0,index)+plan.events.slice(index+1);
 const candidate=validateGuildEvents(plan.level,events);
 if(candidate.events!==events)return {plan,reason:'Other ranks depend on that point. Refund dependent ranks first.'};
 return {plan:{...plan,events},reason:null};
}
export function maxGuildPoints(plan,key){
 let candidate=plan;
 const max=key==='mastery'?Math.min(Math.max(0,plan.level-68),4096):key.startsWith('family:')?100:GUILD_BASE_NODES.find(n=>n.id===key)?.ranks.length||0;
 for(let i=0;i<max;i++){
  const next=allocateGuildPoint(candidate,key);if(next.reason)break;
  candidate=next.plan;
 }
 return {plan:candidate,added:candidate.events.length-plan.events.length,reason:candidate.events.length===plan.events.length?guildTreeRule(plan,key):null};
}
export const normalizeGuildTree=raw=>{
 const level=int(raw?.level,25,1,99999),boost=GUILD_BONUS_BOOSTS.includes(Number(raw?.boost))?Number(raw.boost):1;
 return {...validateGuildEvents(level,String(raw?.events||'')),boost};
};
export function readGuildTree(storage=null){
 try{return normalizeGuildTree(JSON.parse((storage||globalThis.localStorage).getItem(STORAGE_KEY)||'null'))}
 catch{return freshGuildTree();}
}
export function saveGuildTree(plan,storage=null){
 const clean=normalizeGuildTree(plan);
 try{(storage||globalThis.localStorage).setItem(STORAGE_KEY,JSON.stringify(clean))}catch{}
 return clean;
}
export function guildTreeFromLink(query){
 const level=int(query.get('l'),25,1,99999),boost=Number(query.get('b')||1);
 return normalizeGuildTree({level,events:query.get('p')||'',boost});
}
export const guildTreeLinkParams=plan=>({l:plan.level,p:plan.events,b:plan.boost===1?'':plan.boost});
export function guildTreeWithLevel(plan,level){
 const nextLevel=int(level,plan.level,1,99999);
 const migrated=validateGuildEvents(nextLevel,plan.events);
 return {...migrated,boost:plan.boost};
}
export function guildBonusTotals(plan){
 const counts=guildTreeCounts(plan.events),all={},boost=GUILD_BONUS_BOOSTS.includes(plan.boost)?plan.boost:1;
 for(const n of GUILD_BASE_NODES){
  const original=n.ranks.slice(0,counts[n.id]||0).reduce((a,b)=>a+b,0);
  const mastery=(counts.mastery||0)*(GUILD_TREE.mastery.per_rank[n.id]||0);
  const family=(counts['family:'+n.family]||0)*(GUILD_TREE.endgame.families.find(f=>f.id===n.family)?.per_rank[n.id]||0);
  all[n.id]={base:original+mastery+family,total:(original+mastery+family)*boost,rank:counts[n.id]||0,group:n.family};
 }
 return all;
}
export function remainingGuildPoints(plan){return guildPointBudget(plan.level)-guildTreeSpent(plan);}
