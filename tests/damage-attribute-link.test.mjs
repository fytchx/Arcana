import test from 'node:test';
import assert from 'node:assert/strict';
import {previewLinkedAttributeChange} from '../src/damage-attribute-link.js';
import {HUNTER_2026_10_17 as H} from '../src/damage-calculator-reference.js';
import {blankDamageBuild} from '../src/damage-calculator-engine.js';

test('INT gained from non-items projects independently into Attack, Pet and Double Damage chance',()=>{
 const original=structuredClone(H),result=previewLinkedAttributeChange(original,
  {stat:'INT',origin:'other',effectivePoints:100});
 assert.equal(result.measured,true);
 assert.equal(result.full,true);
 assert.equal(result.applied.length,3);
 const byPath=Object.fromEntries(result.applied.map(row=>[row.path,row]));
 assert.equal(byPath['attack.layers.intelligenceOther'].change,38);
 assert.equal(byPath['pet.layers.intelligence'].change,5);
 assert.equal(byPath['combat.doubleDamageChance'].change,20);
 assert.equal(byPath['attack.layers.intelligenceOther'].original,19.2);
 assert.equal(byPath['combat.doubleDamageChance'].proposed,109);
 assert.ok(result.heroAttack.changeMin.percentChange>0);
 assert.ok(result.petMultiplier.change.percentChange>0);
 assert.ok(Math.abs(result.doubleDamage.baseline.expected-1.89)<1e-10);
 assert.ok(Math.abs(result.doubleDamage.proposed.expected-2.09)<1e-10);
 assert.deepEqual(original,H,'never mutate original game screenshot');
});

test('item INT goes into additive Attack stage, not non-item multiplier',()=>{
 const x=previewLinkedAttributeChange(H,{stat:'INT',origin:'item',effectivePoints:10});
 assert.equal(x.applied.find(row=>row.kind==='attack').path,'attack.additive.intelligenceFromItems');
 assert.equal(x.applied.find(row=>row.kind==='attack').change,3.8);
 assert.equal(x.applied.filter(row=>row.kind==='pet').length,1);
});

test('item STR increases additive Attack while non-item STR increases independent Attack layer',()=>{
 const item=previewLinkedAttributeChange(H,{stat:'STR',origin:'item',effectivePoints:100});
 const nonitem=previewLinkedAttributeChange(H,{stat:'STR',origin:'other',effectivePoints:100});
 assert.equal(item.applied[0].path,'attack.additive.strengthFromItems');
 assert.equal(nonitem.applied[0].path,'attack.layers.strengthOther');
 assert.equal(item.knownRates.retaliationStrengthPctPoints,50);
 assert.equal(item.petMultiplier,null);
 assert.equal(item.doubleDamage,null);
 assert.notEqual(item.heroAttack.proposed.min,nonitem.heroAttack.proposed.min);
});

test('DEX only affects measured Pet layer; Dodge reported but not guessed into DPS',()=>{
 const x=previewLinkedAttributeChange(H,{stat:'DEX',effectivePoints:40});
 assert.equal(x.applied.length,1);
 assert.equal(x.applied[0].path,'pet.layers.dexterity');
 assert.equal(x.applied[0].change,4);
 assert.equal(x.knownRates.dodgeChancePoints,2);
 assert.equal(x.heroAttack,null);
 assert.equal(x.doubleDamage,null);
});

test('missing measured sources are excluded, never silently reset to zero',()=>{
 const b=blankDamageBuild();
 const x=previewLinkedAttributeChange(b,{stat:'INT',origin:'other',effectivePoints:50});
 assert.equal(x.applied.length,0);
 assert.equal(x.skipped.length,3);
 assert.equal(x.measured,false);
 assert.equal(x.heroAttack,null);
 assert.equal(x.petMultiplier,null);
 assert.equal(x.doubleDamage,null);
});

test('input options and negative point deltas are guarded',()=>{
 assert.throws(()=>previewLinkedAttributeChange(H,{stat:'INT',origin:'unknown',effectivePoints:1}),RangeError);
 assert.throws(()=>previewLinkedAttributeChange(H,{stat:'WIS',origin:'item',effectivePoints:1}),RangeError);
 assert.throws(()=>previewLinkedAttributeChange(H,{stat:'INT',origin:'item',effectivePoints:''}),RangeError);
 const neg=previewLinkedAttributeChange(H,{stat:'INT',origin:'other',effectivePoints:-210});
 assert.equal(neg.applied.length,2,'invalid stages are rejected without changing the original');
 assert.equal(neg.skipped.length,1);
 assert.equal(neg.applied[0].path,'pet.layers.intelligence');
 assert.ok(Math.abs(neg.applied[0].proposed)<1e-10);
 assert.equal(H.pet.layers.intelligence,10.5);
});

test('zero-valued measured sources are valid, unlike null or empty ones',()=>{
 const b=blankDamageBuild();
 b.pet.layers.intelligence=0;
 b.combat.doubleDamageChance=0;
 const x=previewLinkedAttributeChange(b,{stat:'INT',origin:'item',effectivePoints:10});
 assert.equal(x.applied.length,2);
 assert.equal(x.skipped.length,1);
 assert.equal(x.petMultiplier.baseline,1);
 assert.equal(x.petMultiplier.proposed,1.005);
});
