import {PET_RULES_2026_10_09 as RULES} from './pet-rule-snapshot.js';
import {PET_AFFIX_SNAPSHOT} from './verified-pet-affixes.js';
export const PET_HATCH_RARITIES=['uncommon','rare','epic','legendary'];
export const PET_HATCH_BONUSES=[...new Set(Object.values(RULES.pet_bonuses).flatMap(rows=>rows.map(row=>row.type)))].sort();
const byRarity=r=>RULES.pet_bonuses[r]||[];
const MAX_PREVIEW_LEVEL=300;
const safeInt=(v,min,max,defaultValue)=>{if(v===null||v===''||v===undefined)return defaultValue;const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):defaultValue};
const accurateCeil=n=>Math.ceil(n-1e-9);
export const bonusName=s=>({
 attack_damage:'Attack Damage',pet_damage:'Pet Damage',retaliation:'Retaliation',max_health:'Max Health',dodge:'Dodge',
 exp_gain:'EXP Gain',gold_gain:'Gold Gain',item_find:'Item Find',crit_chance:'Crit Chance',
 critical_damage:'Critical Damage',strength:'Strength',dexterity:'Dexterity',intelligence:'Intelligence',
 increased_strength:'Increased Strength',increased_dexterity:'Increased Dexterity',increased_intelligence:'Increased Intelligence',
 all_skills:'All Class Skills',double_hit_chance:'Double Hit Chance',double_damage_chance:'Double Damage Chance',
 life_on_hit:'Life on Hit',life_on_kill:'Life on Kill',block_chance:'Block Chance',
 defense:'Defense',pet_mastery:'Pet Mastery'
})[s]||String(s||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
export function petBonusEntries(rarity){return byRarity(rarity).map(({type,value,value_type})=>({type,value,valueType:value_type}));}
export const defaultCompoundPlan=()=>({rarity:'legendary',bonus:'pet_damage',level:10});
export function normalizeCompoundPlan(input){
 const rarity=PET_HATCH_RARITIES.includes(input?.rarity)?input.rarity:'legendary';
 const list=petBonusEntries(rarity),bonus=list.some(x=>x.type===input?.bonus)?input.bonus:list[0]?.type||'';
 const allowed=RULES.pet_compound.max_compound_level_by_rarity[rarity];
 const cap=Number.isFinite(allowed)?allowed:MAX_PREVIEW_LEVEL;
 const level=safeInt(input?.level,0,cap,0);
 return {rarity,bonus,level};
}
export function compoundBonus(raw){
 const plan=normalizeCompoundPlan(raw),row=byRarity(plan.rarity).find(x=>x.type===plan.bonus);
 if(!row)return null;
 const config=RULES.pet_compound,base=row.value,level=plan.level;
 let amount=base,method='';
 if(plan.rarity!=='legendary'){
  const pct=config.additive_pct_by_rarity[plan.rarity];
  // Config describes additive, fixed-base growth. Each Compound level adds at least 1.
  amount=base+level*Math.max(1,accurateCeil(base*pct));
  method='Rarity-based additive step';
 }else if(config.legendary_tiered_chain.bonus_types.includes(row.type)){
  const band=config.legendary_tiered_chain;
  for(let i=1;i<=level;i++)amount=accurateCeil(amount*(i<=10?band.multipliers['10']:i<=30?band.multipliers['30']:band.tail_multiplier));
  method='Legendary tiered chain · per-level rounded';
 }else if(config.legendary_two_band_chain.bonus_types.includes(row.type)){
  const band=config.legendary_two_band_chain;
  for(let i=1;i<=level;i++)amount=accurateCeil(amount*(i<=10?band.multipliers['10']:band.tail_multiplier));
  method='Legendary two-band chain · per-level rounded';
 }else if(config.legendary_increased_stat_bonus_types.includes(row.type)){
  amount=base+level*config.legendary_increased_stat_step;method='Legendary increased-attribute fixed step';
 }else if(config.flat_plus_one_bonus_types.includes(row.type)){
  amount=base+level;method='Configured flat +1 per Compound';
 }else if(config.legendary_linear_tail.bonus_types.includes(row.type)){
  const {after_level,step}=config.legendary_linear_tail;
  for(let i=1;i<=level;i++)amount=i<=after_level?accurateCeil(amount*config.legendary_multiplier):amount+step;
  method='Legendary multiplicative start, then linear tail';
 }else return null;
 return {...plan,base,amount,unit:row.value_type==='percent'?'%':'',method,source:RULES.source.file};
}
export const defaultAffixCostPlan=()=>({affix:'item_quantity',currentLevel:1,targetLevel:10});
const AFFIX_MAP=new Map(PET_AFFIX_SNAPSHOT.affixes.map(d=>[d.name,d]));
export function normalizeAffixCostPlan(raw){
 const affix=AFFIX_MAP.has(raw?.affix)?raw.affix:'item_quantity',definition=AFFIX_MAP.get(affix);
 const cap=definition.max_level||999;
 const currentLevel=safeInt(raw?.currentLevel??1,1,cap,1);
 const targetLevel=safeInt(raw?.targetLevel??raw?.level??currentLevel,1,cap,currentLevel);
 return {affix,currentLevel,targetLevel:Math.max(targetLevel,currentLevel)};
}
export function affixCost(raw){
 const p=normalizeAffixCostPlan(raw),r=RULES.pet_evolve,d=AFFIX_MAP.get(p.affix);
 if(!r||!d)return null;
 const levelCost=next=>{
  if(p.affix==='all_skills')return r.all_skills_upgrade_cost;
  return Math.ceil(next/r.level_cost_divisor);
 };
 let shards=0;
 for(let next=p.currentLevel+1;next<=p.targetLevel;next++)shards+=levelCost(next);
 return {...p,shards,nextUpgrade:p.currentLevel<(d.max_level||999)?levelCost(p.currentLevel+1):null,
  addSlotShards:r.add_affix_cost,rerollShards:r.reroll_affix_cost,
  currentValue:d.base_value+(p.currentLevel-1)*d.scaling_per_level,
  targetValue:d.base_value+(p.targetLevel-1)*d.scaling_per_level,
  valueUnit:d.value_type==='percent'?'%':'',label:d.display_name.replace('{pet_element}','pet element'),
  method:'Sum of ceil(next level / '+r.level_cost_divisor+')',source:RULES.source.file};
}
export const PET_BONUS_OPTIONS=PET_HATCH_BONUSES.map(type=>({type,label:bonusName(type)}));
export const normalizedPetBonusTargets=build=>{
 const raw=Array.isArray(build?.petBonusTargets)?build.petBonusTargets:Array.from({length:4},(_,i)=>build?.petSetup?.[i]?.hatchBonus||'');
 return Array.from({length:4},(_,i)=>PET_HATCH_BONUSES.includes(raw[i])?raw[i]:'');
};

// Both calculators save separate local preferences. Existing pet loadouts remain untouched.
const COMPOUND_KEY='arcana-pet-compound-quick-v1';
const AFFIX_COST_KEY='arcana-pet-affix-target-v1';
export function readCompoundPlan(store=null){
 try{const s=store||globalThis.localStorage;return normalizeCompoundPlan(JSON.parse(s.getItem(COMPOUND_KEY)||'null')||defaultCompoundPlan())}
 catch{return defaultCompoundPlan()}
}
export function saveCompoundPlan(plan,store=null){
 const p=normalizeCompoundPlan(plan);try{(store||globalThis.localStorage).setItem(COMPOUND_KEY,JSON.stringify(p))}catch{}
 return p;
}
export function readAffixCostPlan(store=null){
 try{
  const s=store||globalThis.localStorage;
  const latest=s.getItem(AFFIX_COST_KEY);
  if(latest)return normalizeAffixCostPlan(JSON.parse(latest));
  const prior=s.getItem('arcana-affix-planner-v1');
  if(prior){const old=JSON.parse(prior);return normalizeAffixCostPlan({affix:old.affix,currentLevel:1,targetLevel:old.level||1});}
  return defaultAffixCostPlan();
 }catch{return defaultAffixCostPlan()}
}
export function saveAffixCostPlan(raw,store=null){
 const p=normalizeAffixCostPlan(raw);try{(store||globalThis.localStorage).setItem(AFFIX_COST_KEY,JSON.stringify(p))}catch{}
 return p;
}
