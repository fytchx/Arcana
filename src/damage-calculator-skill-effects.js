/**
 * Source-backed, non-capped damage-adjacent class skill outputs.
 *
 * October 17 /config/game supplies the current 90 IDs and rank limits from
 * damage-calculator-config-caps.js. Per-rank descriptions here are from the
 * October 9 class skill tree snapshot, independently screenshot-checked for
 * the Archer (3,12,14,15), Warrior (8,50), and Mage (5,17,19,21) benchmarks.
 *
 * These are *outputs of skills*, not a replacement for a game combat engine.
 * Proc and target-conditional bonuses remain distinct, NEVER folded into
 * sheet Attack/Pet damage or assumed to trigger every hit.
 * Capped effects, including boss damage, are evaluated exclusively by
 * damage-calculator-config-caps.js so they cannot be counted twice.
 */
import {SKILL_CATALOG,SKILL_CLASS_NAMES} from './damage-calculator-config-caps.js';
export const SKILL_RATE_SOURCE = 'IdleArc 2026-10-09 skill descriptions; class IDs/max ranks from 2026-10-17-001';

/** [skill ID, output key, gain per effective rank].
 * attackPct belongs to the additive class-skill Attack stage.
 * petPct is the additive class-skill Pet Damage percentage stage.
 * petFlat adds to a pet's pre-multiplier base (NOT petPct).
 * Other numerical channels are separately additive within their own stat.
 */
const ROWS = [
 // Warrior
 [8,'attackPct',5],[50,'attackPct',3],
 [24,'critDamage',3],[24,'defensePct',2],[25,'doubleDamageChance',2],
 [49,'critChance',2],[9,'doubleHitChance',2],[26,'critDamage',8],
 [27,'doubleDamageChance',2],[46,'defensePct',2],[22,'defenseFlat',50],
 // Archer
 [3,'attackPct',5],[10,'critChance',4],[11,'critDamage',10],
 [28,'doubleDamageChance',2],[29,'doubleHitChance',2],
 [30,'critChance',3],[12,'attackPct',3],[12,'doubleDamageChance',1],
 [13,'belowHalfTargetBonus',3],[14,'petPct',12],[15,'petPct',8],
 [1,'petMasteryLevels',1],
 // Mage
 [4,'magicBlastProcBonus',3],[16,'doubleDamageChance',2],
 [17,'attackPct',3],[37,'doubleDamageChance',1],[5,'attackPct',5],
 [18,'critDamage',8],[19,'attackPct',2],[40,'doubleDamageChance',2],
 [41,'critChance',2],[6,'critChance',2],[6,'critDamage',1],
 [20,'critDamage',10],[21,'doubleHitChance',2],
 [45,'critChance',2],[45,'doubleHitChance',2],[45,'doubleDamageChance',2],
 // Rogue
 [55,'critChance',3],[56,'critDamage',5],[57,'aboveHalfTargetBonus',4],
 [59,'doubleDamageChance',4],[61,'doubleHitChance',3],[62,'attackPct',5],
 [64,'doubleHitConditionalBonus',3],
 // Druid
 [73,'petPct',8],[74,'petFlat',15],[76,'petMasteryLevels',1],
 [82,'critChance',3],[86,'critDamage',10],[90,'petPct',5],
];
export const SKILL_EFFECT_DEFINITIONS = Object.freeze(ROWS.map(([skillId,key,perRank])=>{
 if(!SKILL_CATALOG[skillId])throw new Error('Unknown class skill '+skillId);
 return Object.freeze({skillId,key,perRank,
  conditional:['magicBlastProcBonus','belowHalfTargetBonus',
   'aboveHalfTargetBonus','doubleHitConditionalBonus'].includes(key),
  unit:['petFlat','defenseFlat','petMasteryLevels'].includes(key)?'flat':'percent',
  source:SKILL_RATE_SOURCE});
}));
const max0=(value,max=10000)=>{
 if(value===null||value===undefined||value==='')return 0;
 const n=Number(value);
 return Number.isFinite(n)?Math.min(max,Math.max(0,n)):0;
};
const stats = [...new Set(SKILL_EFFECT_DEFINITIONS.map(x=>x.key))];
export const MODELED_SKILL_STATS = Object.freeze(stats);

/** True when explicit unlock flag is set, or (if absent) points are spent.
 * +ACS never unlocks a locked skill by itself.
 */
export function evaluateSkillDamageEffects({classId,allClassSkills=0,skills={}}={}) {
 const cid=Number(classId);
 if(!SKILL_CLASS_NAMES[cid])throw new RangeError('A valid class ID (1..5) is required');
 const acs=Math.floor(max0(allClassSkills));
 const totals=Object.fromEntries(stats.map(key=>[key,0]));
 const effects=[];
 for(const def of SKILL_EFFECT_DEFINITIONS){
  const skill=SKILL_CATALOG[def.skillId];
  if(skill.classId!==cid)continue;
  const input=skills?.[skill.id]||{};
  const allocated=Math.floor(Math.min(skill.maxAllocated,max0(input.allocated)));
  const unlocked=input.unlocked===undefined?allocated>0:input.unlocked===true;
  const effectiveRank=unlocked?allocated+acs:0;
  const amount=effectiveRank*def.perRank;
  effects.push({...def,name:skill.name,maxAllocated:skill.maxAllocated,
   allocated,unlocked,effectiveRank,amount});
  totals[def.key]+=amount;
 }
 return {classId:cid,allClassSkills:acs,totals,effects,
  // Only these stages are candidates for matching/replacing a tooltip subtotal.
  sheetStages:{attackClassPct:totals.attackPct,petClassPct:totals.petPct,
   petClassFlat:totals.petFlat},
  source:SKILL_RATE_SOURCE};
}
/** The extra ACS point is applied to ALL unlocked skills, independently of
 * their capped outputs (compareConfiguredSkillCaps handles those).
 */
export function compareSkillDamageEffects(input={}) {
 const before=evaluateSkillDamageEffects(input);
 const after=evaluateSkillDamageEffects({...input,allClassSkills:before.allClassSkills+1});
 const gains=Object.fromEntries(stats.map(key=>[key,after.totals[key]-before.totals[key]]));
 return {...before,afterOneACS:after.totals,gainsOneACS:gains};
}
