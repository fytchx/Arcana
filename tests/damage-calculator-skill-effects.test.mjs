import test from 'node:test';
import assert from 'node:assert/strict';
import {SKILL_CATALOG,CONFIGURED_SKILL_CAPS} from '../src/damage-calculator-config-caps.js';
import {SKILL_EFFECT_DEFINITIONS,SKILL_RATE_SOURCE,MODELED_SKILL_STATS,
 evaluateSkillDamageEffects,compareSkillDamageEffects} from '../src/damage-calculator-skill-effects.js';
import {calculateAttack,calculatePet} from '../src/damage-calculator-engine.js';
import {HUNTER_2026_10_17 as H} from '../src/damage-calculator-reference.js';
import {RETALIATION_WARRIOR_2026_10_17 as W,
 ATTACK_MAGE_2026_10_17 as M} from '../src/damage-calculator-crossclass-fixtures.js';
const given=(...pairs)=>Object.fromEntries(pairs.map(([id,points])=>[id,{allocated:points}]));
const plan=(classId,allClassSkills,...pairs)=>
 evaluateSkillDamageEffects({classId,allClassSkills,skills:given(...pairs)});
test('52 documented uncapped damage/stat output rates map to real current skill IDs',()=>{
 assert.equal(SKILL_EFFECT_DEFINITIONS.length,52);
 assert.equal(MODELED_SKILL_STATS.length,new Set(SKILL_EFFECT_DEFINITIONS.map(x=>x.key)).size);
 assert.ok(SKILL_RATE_SOURCE.includes('2026-10-09'));
 for(const d of SKILL_EFFECT_DEFINITIONS) {
  assert.ok(SKILL_CATALOG[d.skillId],d.skillId);
  assert.ok(Number.isFinite(d.perRank)&&d.perRank>0,d.skillId);
 }
 const cappedIds=new Set(CONFIGURED_SKILL_CAPS.map(x=>x.key));
 assert.ok(!MODELED_SKILL_STATS.some(key=>cappedIds.has(key)),
  'shared/individual cap outputs must not appear as uncapped stages');
});
test('Hunter screenshot reproduces class skill Attack +58% and Pet +120%',()=>{
 const x=plan(2,5,[3,3],[12,1],[14,1],[15,1]);
 assert.equal(x.sheetStages.attackClassPct,58);
 assert.equal(x.sheetStages.petClassPct,120);
 assert.equal(x.sheetStages.petClassFlat,0);
 assert.equal(H.attack.additive.classSkills,x.sheetStages.attackClassPct);
 assert.equal(H.pet.layers.classSkills,x.sheetStages.petClassPct);
});
test('Warrior screenshot reproduces Attack +201% without counting caps as Attack',()=>{
 const x=plan(1,17,[8,10],[50,5],[53,2],[7,5],[23,2]);
 assert.equal(x.sheetStages.attackClassPct,W.attack.additive.classSkills);
 assert.equal(x.totals.critDamage,0);
 assert.equal(x.totals.bossDamageBonus,undefined);
});
test('Mage screenshot reproduces Attack +245%, while Magic Blast damage stays conditional',()=>{
 const x=plan(3,17,[5,10],[17,5],[19,5],[4,10]);
 assert.equal(x.sheetStages.attackClassPct,M.attack.additive.classSkills);
 assert.equal(x.totals.magicBlastProcBonus,81);
 assert.equal(x.totals.attackPct,245);
 assert.equal(x.effects.find(e=>e.skillId===4).conditional,true);
});
test('ACS beyond max allocated ranks affects each unlocked class skill output',()=>{
 const x=compareSkillDamageEffects({
  classId:2,allClassSkills:5,skills:given([3,3],[12,1],[14,1],[15,1]),
 });
 assert.equal(x.gainsOneACS.attackPct,8);
 assert.equal(x.gainsOneACS.petPct,20);
 assert.equal(x.afterOneACS.attackPct,66);
 assert.equal(x.afterOneACS.petPct,140);
});
test('Locked skill is zero even with ACS; explicitly unlocked zero-point skill receives ACS',()=>{
 const locked=evaluateSkillDamageEffects({
  classId:1,allClassSkills:17,skills:{8:{allocated:10,unlocked:false}},
 });
 assert.equal(locked.totals.attackPct,0);
 const unlocked=evaluateSkillDamageEffects({
  classId:1,allClassSkills:17,skills:{8:{allocated:0,unlocked:true}},
 });
 assert.equal(unlocked.totals.attackPct,85);
 assert.equal(unlocked.effects.find(x=>x.skillId===8).allocated,0);
});
test('Druid flat pet output is not a Pet Damage percentage or attack conversion',()=>{
 const x=plan(5,2,[73,5],[74,2],[90,1],[85,10]);
 assert.equal(x.sheetStages.petClassPct,71);
 assert.equal(x.sheetStages.petClassFlat,60);
 assert.equal(x.sheetStages.attackClassPct,0);
 const pet=calculatePet({base:{min:100,max:100},flat:{classSkills:x.sheetStages.petClassFlat},layers:{classSkills:x.sheetStages.petClassPct}});
 assert.equal(pet.min,160*1.71);
});
test('Rogue conditional first strike and double hit bonuses do not inflate Attack sheet',()=>{
 const x=plan(4,3,[57,5],[64,5],[62,5],[61,3]);
 assert.equal(x.totals.attackPct,40);
 assert.equal(x.totals.aboveHalfTargetBonus,32);
 assert.equal(x.totals.doubleHitConditionalBonus,24);
 assert.equal(x.totals.doubleHitChance,18);
});
test('Cross-class entries supplied to one build do not contribute',()=>{
 const x=plan(2,5,[3,3],[8,10],[90,5]);
 assert.equal(x.totals.attackPct,40);
 assert.equal(x.totals.petPct,0);
});
test('Invalid input and oversized allocations cannot invent unlimited spendable points',()=>{
 assert.throws(()=>plan(0,0),RangeError);
 const x=evaluateSkillDamageEffects({
  classId:1,allClassSkills:0,skills:{8:{allocated:9000000},50:{allocated:'bad'}},
 });
 assert.equal(x.totals.attackPct,50);
});
test('Opt-in sheet replacement is stage-preserving: never add to the old subtotal',()=>{
 const p=plan(2,5,[3,3],[12,1],[14,1],[15,1]);
 const next=structuredClone(H);
 next.attack.additive.classSkills=p.sheetStages.attackClassPct;
 next.pet.layers.classSkills=p.sheetStages.petClassPct;
 assert.equal(next.attack.additive.classSkills,58);
 assert.equal(next.pet.layers.classSkills,120);
 assert.equal(calculateAttack(next.attack).min,calculateAttack(H.attack).min);
 assert.equal(calculatePet(next.pet).layerFactor,calculatePet(H.pet).layerFactor);
});

test('Hunter +1 ACS updates hero stage by ~1.77%, pet multiplier by ~9.09%',()=>{
 const x=compareSkillDamageEffects({classId:2,allClassSkills:5,
  skills:given([3,3],[12,1],[14,1],[15,1])});
 const base=calculateAttack(H.attack);
 const nextAttack=structuredClone(H.attack);
 nextAttack.additive.classSkills=x.afterOneACS.attackPct;
 const after=calculateAttack(nextAttack);
 const attackDelta=(after.min/base.min-1)*100;
 assert.ok(attackDelta>1.7 && attackDelta<1.9);
 const oldPet=calculatePet(H.pet);
 const nextPet=structuredClone(H.pet);
 nextPet.layers.classSkills=x.afterOneACS.petPct;
 const newPet=calculatePet(nextPet);
 assert.ok(Math.abs(100*(newPet.layerFactor/oldPet.layerFactor-1)-9.090909)<.0001);
});
test('Mage and Warrior +1 ACS projection uses independent multiplier stack unchanged',()=>{
 for(const [classId,pairs,fixture,expectedPoints] of [
  [1,[[8,10],[50,5]],W,8],
  [3,[[5,10],[17,5],[19,5]],M,10],
 ]){
  const x=compareSkillDamageEffects({classId,allClassSkills:17,skills:given(...pairs)});
  assert.equal(x.gainsOneACS.attackPct,expectedPoints);
  const attack=structuredClone(fixture.attack);
  attack.additive.classSkills=x.afterOneACS.attackPct;
  assert.ok(calculateAttack(attack).min>calculateAttack(fixture.attack).min);
  assert.deepEqual(attack.layers,fixture.attack.layers,'ACS changes class-skill stage, not other layers');
 }
});
