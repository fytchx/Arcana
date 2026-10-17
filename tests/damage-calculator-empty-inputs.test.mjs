import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blankDamageBuild, calculateAttack, calculatePet, compareBuilds,
} from '../src/damage-calculator-engine.js';
import {calculateRetaliation} from '../src/retaliation-damage-engine.js';

test('clear starts with truly unknown inputs, not leftover Hunter modifiers', () => {
  const blank = blankDamageBuild();
  assert.equal(blank.className, 'Custom');
  assert.equal(blank.attack.weapon.min, null);
  assert.equal(blank.pet.base.max, null);
  assert.deepEqual(blank.attack.layers, {});
  assert.deepEqual(blank.pet.layers, {});
  assert.deepEqual(blank.combat, {});
  assert.deepEqual(blank.retaliation, {});
  const attack = calculateAttack(blank.attack);
  assert.equal(attack.known, false);
  assert.equal(attack.complete, false);
  assert.equal(calculatePet(blank.pet).min, null);
  assert.equal(calculatePet(blank.pet).max, null);
  assert.equal(calculateRetaliation(blank.retaliation).known, false);
  assert.equal(compareBuilds(blank, blank).changes.attack.min, null);
});

test('partial attack remains labeled partial until all weapon and jewelry endpoints supplied', () => {
  const build = blankDamageBuild();
  build.attack.weapon.min = 100;
  let result = calculateAttack(build.attack);
  assert.equal(result.known, true);
  assert.equal(result.complete, false);
  assert.equal(result.min, 100);
  build.attack.weapon.max = 200;
  build.attack.jewelry.min = 0;
  build.attack.jewelry.max = 0;
  result = calculateAttack(build.attack);
  assert.equal(result.complete, true);
  assert.equal(result.min, 100);
  assert.equal(result.max, 200);
});

test('an explicit zero is measured input; empty pet base is unknown', () => {
  const build = blankDamageBuild();
  build.attack.weapon = {min:0,max:0};
  build.attack.jewelry = {min:0,max:0};
  assert.equal(calculateAttack(build.attack).known, true);
  assert.equal(calculateAttack(build.attack).complete, true);
  assert.equal(calculatePet(build.pet).min, null);
  build.pet.base.min = 0;
  build.pet.base.max = 0;
  assert.equal(calculatePet(build.pet).min, 0);
});

test('Retaliation requires observed numbers and structured pools, but permits explicit zero', () => {
  const base = {defense:0,globalRatio:0,baseBonuses:{deflection:0},
    layers:{guild:0},combatStanceFactor:1,rollMinFactor:0.7};
  assert.equal(calculateRetaliation(base).known, true);
  assert.equal(calculateRetaliation({...base,defense:null}).known, false);
  assert.equal(calculateRetaliation({...base,globalRatio:''}).known, false);
  assert.equal(calculateRetaliation({...base,combatStanceFactor:null}).known, false);
  assert.equal(calculateRetaliation({...base,layers:null}).known, false);
});
