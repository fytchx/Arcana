/*
 * Verified October 9, 2026 pet-affix reference extracted from the user's game config.
 * The linear level projection is an interpretation of base_value/scaling_per_level,
 * NOT a verified server implementation or a reroll probability calculation.
 */
export const PET_AFFIX_SNAPSHOT=Object.freeze({
 source:'IdleArc_2026-10-09_game_config.json',
 snapshotDate:'2026-10-09',
 affixes:[
  {name:'exp_gain',display_name:'Experience Gain',base_value:1,scaling_per_level:0.2,max_level:null,value_type:'percent',weight:1000},
  {name:'gold_gain',display_name:'Gold Gain',base_value:1,scaling_per_level:0.2,max_level:null,value_type:'percent',weight:1000},
  {name:'item_quantity',display_name:'Item Quantity',base_value:1,scaling_per_level:0.1,max_level:null,value_type:'percent',weight:800},
  {name:'material_quantity',display_name:'Material Quantity',base_value:1,scaling_per_level:0.1,max_level:null,value_type:'percent',weight:700},
  {name:'damage_conversion',display_name:'Damage converted to {pet_element}',base_value:5,scaling_per_level:0.5,max_level:null,value_type:'percent',weight:600},
  {name:'ruby_drops',display_name:'Ruby Drops',base_value:1,scaling_per_level:0.1,max_level:null,value_type:'percent',weight:600},
  {name:'rune_drops',display_name:'Rune Drops',base_value:1,scaling_per_level:0.1,max_level:null,value_type:'percent',weight:600},
  {name:'all_skills',display_name:'All Class Skills',base_value:1,scaling_per_level:1,max_level:2,value_type:'flat',weight:48},
  {name:'extra_kill_chance',display_name:'Extra Kill Chance',base_value:3,scaling_per_level:0,max_level:1,value_type:'percent',weight:48}
 ],
 evolve:{enabled:true,max_slots:4,default_slots:2,ruby_cost:100,ruby_cost_second:500,level_gate:100,add_affix_cost:5,reroll_affix_cost:5,level_cost_divisor:20,all_skills_upgrade_cost:1000}
});
export const AFFIX_PLANNER_STORAGE='arcana-affix-planner-v1';
export const AFFIX_PLANNER_MAX_INPUT_LEVEL=999;
const BY_NAME=new Map(PET_AFFIX_SNAPSHOT.affixes.map(x=>[x.name,x]));
export const petAffixDefinition=name=>BY_NAME.get(String(name))||null;
export const petAffixLabel=x=>String(x?.display_name||'').replace('{pet_element}','pet element');
const integer=(v,defaultValue)=>{const n=Number(v);return Number.isFinite(n)?Math.floor(n):defaultValue};
export function normalizePetAffixPlan(raw){
 const requested=petAffixDefinition(raw?.affix)||PET_AFFIX_SNAPSHOT.affixes[0];
 const cap=requested.max_level===null?AFFIX_PLANNER_MAX_INPUT_LEVEL:Math.min(AFFIX_PLANNER_MAX_INPUT_LEVEL,requested.max_level);
 return {affix:requested.name,level:Math.max(1,Math.min(cap,integer(raw?.level,1)))};
}
export const defaultPetAffixPlan=()=>({affix:PET_AFFIX_SNAPSHOT.affixes[0].name,level:1});
export function readPetAffixPlan(store=globalThis.localStorage){
 try{return normalizePetAffixPlan(JSON.parse(store.getItem(AFFIX_PLANNER_STORAGE)||'null'))}
 catch{return defaultPetAffixPlan()}
}
export function savePetAffixPlan(plan,store=globalThis.localStorage){
 const normalized=normalizePetAffixPlan(plan);
 try{store.setItem(AFFIX_PLANNER_STORAGE,JSON.stringify(normalized))}catch{}
 return normalized;
}
export function projectPetAffix(name,level){
 const d=petAffixDefinition(name);
 if(!d)return null;
 const cap=d.max_level===null?AFFIX_PLANNER_MAX_INPUT_LEVEL:Math.min(AFFIX_PLANNER_MAX_INPUT_LEVEL,d.max_level);
 const clamped=Math.max(1,Math.min(cap,integer(level,1)));
 const raw=d.base_value+(clamped-1)*d.scaling_per_level;
 return {definition:d,level:clamped,cap:d.max_level,raw,display:parseFloat(raw.toFixed(3)),unit:d.value_type==='percent'?'%':''};
}
