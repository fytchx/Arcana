import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ATTRIBUTE_RATES, attributePercent, calculateAttack, calculatePet,
  combatReference, overflowRoll, relativeDifference, compareBuilds,
} from '../src/damage-calculator-engine.js';
import {HUNTER_2026_10_17 as H} from '../src/damage-calculator-reference.js';

test('hunter attack 175.6k–243.8k reproduces source screenshot within rounded inputs', () => {
  const damage = calculateAttack(H.attack);
  assert.equal(damage.flatBonus, 690);
  assert.ok(Math.abs(damage.additiveFactor - 3.841) < 1e-6);
  assert.ok(Math.abs(damage.layerFactor - H.references.attackLayerProduct) < 0.02);
  assert.ok(Math.abs(damage.min - H.references.attackMin) < 1500);
  assert.ok(Math.abs(damage.max - H.references.attackMax) < 1500);
});

test('attack flat bonuses apply after summed additive layer', () => {
  const x = calculateAttack({
    weapon: {min:100,max:100}, jewelry:{min:0,max:0},
    additive:{a:100,b:50}, flat:{rune:10}, layers:{guild:100},
  });
  assert.equal(x.min, 520); // (100 * 2.5 + 10) * 2
  assert.equal(x.max, 520);
});

test('pet 132.24 layer reference reproduced from rounded game-display percentages', () => {
  const pet = calculatePet(H.pet);
  assert.equal(pet.flatBonus, 690);
  assert.equal(pet.min, null);
  assert.ok(Math.abs(pet.layerFactor - H.references.petLayerProduct) / H.references.petLayerProduct < 0.002);
});

test('pet base required for full pet damage; per-pet base, not 198k UI final', () => {
  const pet = calculatePet({base:{min:800,max:1000},flat:{guild:500},layers:{a:100,b:50}});
  assert.equal(pet.min, 3900);
  assert.equal(pet.max, 4500);
});

test('stat screen confirmed rates and distinct source layers', () => {
  assert.equal(attributePercent(148, ATTRIBUTE_RATES.dexterityPet), 14.8);
  assert.equal(attributePercent(210, ATTRIBUTE_RATES.intelligencePet), 10.5);
  assert.equal(attributePercent(137, ATTRIBUTE_RATES.strengthAttack), 102.75);
});

test('critical chance overflow and uncapped hits/damage', () => {
  const x = combatReference(H.combat);
  assert.equal(x.crit.effectiveChance, 100);
  assert.ok(Math.abs(x.crit.overflowCritDamage - 23.3) < 1e-9);
  assert.ok(Math.abs(x.crit.adjustedCritDamage - 276.3) < 1e-9);
  assert.equal(overflowRoll(250).guaranteed, 3);
  assert.equal(overflowRoll(250).chanceOfNext, 50);
  assert.equal(overflowRoll(250).expected, 3.5);
  assert.ok(Math.abs(x.doubleDamage.expected - 1.89) < 1e-10);
  assert.equal(x.alphaStrike.conditionalExpectedFactor, 1.18);
});

test('what-if comparison is independent; no accidental percentage double counting', () => {
  const altered = structuredClone(H);
  altered.pet.layers.companionDrop += 10;
  altered.attack.layers.dropBonus += 10;
  const result = compareBuilds(H, altered);
  assert.ok(result.changes.petMultiplier.percentChange > 0);
  assert.ok(result.changes.attack.min.percentChange > 0);
  assert.equal(result.baseline.pet.layerFactor, calculatePet(H.pet).layerFactor);
  assert.equal(result.changes.petDamage, null);
  assert.equal(relativeDifference(0,10), null);
});

test('missing and invalid entries never leak NaN', () => {
  assert.equal(calculateAttack().min, 0);
  assert.equal(calculatePet().layerFactor, 1);
  assert.equal(calculateAttack({layers:{z:'invalid'}}).min, 0);
});
