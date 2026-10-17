/**
 * Explicit, conservative ACS / effect-cap mathematics.
 *
 * An allocated max rank of 5 or 10 limits SKILL POINTS, not ACS.
 * An output cap is independent of the allocated rank maximum.
 * A multi-output skill such as Deflection has separate block/retaliation caps.
 * Skills that trigger other skills or effects MUST be modeled at the output
 * level and/or with combined cap groups, not as one damage multiplier.
 */
const nonnegative=v=>Number.isFinite(Number(v))?Math.max(0,Math.min(Number(v),1e9)):0;
export function skillRanks({allocated=0,maxAllocated=5,acs=0,unlocked=false}={}) {
  const max=nonnegative(maxAllocated);
  const invested=Math.min(max,Math.floor(nonnegative(allocated)));
  const extra=Math.floor(nonnegative(acs));
  return {allocated:invested,maxAllocated:max,acs:extra,unlocked:Boolean(unlocked),effective:Boolean(unlocked)?invested+extra:0};
}
export function calculateSkillOutputs(skill={}) {
  const ranks=skillRanks(skill);
  const effects=(skill.effects||[]).map(effect=>{
    const base=Number(effect.base||0),perLevel=Number(effect.perLevel||0);
    if(!Number.isFinite(base)||!Number.isFinite(perLevel))throw Error('Invalid skill effect rate');
    const raw=ranks.unlocked?base+ranks.effective*perLevel:0;
    const capped=effect.cap!==null&&effect.cap!==undefined;
    const value=capped?Math.min(raw,Number(effect.cap)):raw;
    return {id:effect.id,raw,value,cap:capped?Number(effect.cap):null,
      capped:capped&&raw>Number(effect.cap),
      stage:effect.stage||'unclassified',
      unit:effect.unit||'percent',
      scope:effect.scope||'unspecified'};
  });
  return {...ranks,effects};
}
export function sharedSkillCap(outputs=[],cap=null) {
  const raw=outputs.reduce((total,item)=>total+Number(item.value??item),0);
  return {raw,value:cap===null?raw:Math.min(raw,Number(cap)),cap};
}
/** Only outputs observed directly in uploaded October 17 screenshots. */
export const OBSERVED_SKILL_CASES=Object.freeze({
  warriorDeflection:{allocated:2,maxAllocated:5,acs:17,unlocked:true,effects:[
    {id:'block-chance',perLevel:2,cap:25,stage:'combat-block'},
    {id:'retaliation',perLevel:4,cap:40,stage:'retaliation-base'},
  ]},
  mageUnstableEnergyTrigger:{allocated:1,maxAllocated:5,acs:17,unlocked:true,effects:[
    {id:'trigger-chance',base:50,perLevel:5,cap:100,stage:'proc'},
  ]},
  mageArcaneCascade:{allocated:1,maxAllocated:5,acs:17,unlocked:true,effects:[
    {id:'trigger-chance',perLevel:8,cap:100,stage:'proc'},
  ]},
  // Mage Reality Warp 2026-10-17: 5 allocated +17 ACS = 22 effective.
  // Double Hit increases 2%/level; Boss Damage capped at 100%.
  mageRealityWarp:{allocated:5,maxAllocated:5,acs:17,unlocked:true,effects:[
    {id:'double-hit-chance',perLevel:2,cap:null,stage:'combat-double-hit'},
    {id:'boss-damage',perLevel:5,cap:100,stage:'combat-boss-damage'},
  ]},
  magePyroclasm:{allocated:5,maxAllocated:5,acs:17,unlocked:true,effects:[
    {id:'crit-explosion-extra',perLevel:5,cap:100,stage:'crit-only'},
  ]},
  warriorMightyStrikes:{allocated:10,maxAllocated:10,acs:17,unlocked:true,effects:[
    {id:'attack-pct',perLevel:5,cap:null,stage:'attack-additive'},
  ]},
  warriorCullingStrike:{allocated:5,maxAllocated:5,acs:17,unlocked:true,effects:[
    {id:'culling-part',perLevel:1,cap:null,stage:'execute'},
  ]},
  warriorExecutioner:{allocated:2,maxAllocated:5,acs:17,unlocked:true,effects:[
    {id:'executioner-part',perLevel:1,cap:null,stage:'execute'},
  ]},
});
