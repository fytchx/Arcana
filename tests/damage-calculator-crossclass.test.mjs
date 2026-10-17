import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateRetaliation} from '../src/retaliation-damage-engine.js';
import {skillRanks,calculateSkillOutputs,sharedSkillCap,OBSERVED_SKILL_CASES} from '../src/class-skill-effect-model.js';
import {RETALIATION_WARRIOR_2026_10_17 as W,ATTACK_MAGE_2026_10_17 as M} from '../src/damage-calculator-crossclass-fixtures.js';
import {calculateAttack} from '../src/damage-calculator-engine.js';

const near=(got,expected,tolerance=.007)=>{
 assert.ok(Math.abs(got-expected)/expected<=tolerance,
 `got ${got}, reference ${expected} (tolerance ${tolerance})`);
};
test('Warrior retaliation is 0.60 × defense × (83.4+40+15)% base, not +100%',()=>{
 const r=calculateRetaliation(W.retaliation);
 near(r.basePool,15370000,.002);
 near(r.max,W.references.retaliationMax,.005);
 near(r.min,W.references.retaliationMin,.005);
 near(r.displayMidpoint,W.references.retaliationAvg,.005);
 assert.equal(r.appliedBlockFactorToBaseRange,false);
 near(r.blockedRange.max/r.max,1.75,1e-12);
});
test('Mage attack 23.33–34.12B matches independently',()=>{
 const r=calculateAttack(M.attack);
 near(r.min,M.references.attackMin,.005);
 near(r.max,M.references.attackMax,.005);
});
test('Warrior attack 26.1–36.94M independently matches',()=>{
 const r=calculateAttack(W.attack);
 near(r.min,W.references.attackMin,.005);
 near(r.max,W.references.attackMax,.005);
});
test('Deflection has SEPARATE caps for retaliation and block chance',()=>{
 const s=calculateSkillOutputs(OBSERVED_SKILL_CASES.warriorDeflection);
 assert.equal(s.effective,19);
 assert.deepEqual(s.effects.map(x=>[x.raw,x.value]),[[38,25],[76,40]]);
});
test('Magic Blast + Unstable Energy, Cascade and Pyroclasm have 100% effects caps',()=>{
 const blast=calculateSkillOutputs(OBSERVED_SKILL_CASES.mageMagicBlastTrigger);
 const cascade=calculateSkillOutputs(OBSERVED_SKILL_CASES.mageArcaneCascade);
 const pyro=calculateSkillOutputs(OBSERVED_SKILL_CASES.magePyroclasm);
 assert.equal(blast.effects[0].raw,140);
 assert.equal(blast.effects[0].value,100);
 assert.equal(cascade.effects[0].raw,144);
 assert.equal(cascade.effects[0].value,100);
 assert.equal(pyro.effects[0].raw,110);
 assert.equal(pyro.effects[0].value,100);
});
test('Mighty Strikes still scales above allocatable rank without an invented effect cap',()=>{
 const s=calculateSkillOutputs(OBSERVED_SKILL_CASES.warriorMightyStrikes);
 assert.equal(s.effective,27);
 assert.equal(s.effects[0].value,135);
});
test('Locked/zero rank without unlocked flag does NOT incorrectly acquire ACS',()=>{
 const s=skillRanks({allocated:0,maxAllocated:5,acs:17,unlocked:false});
 assert.equal(s.effective,0);
});
test('Shared trap damage cap is applied to SUM not per skill alone',()=>{
 const combined=sharedSkillCap([15,9],35);
 assert.equal(combined.value,24);
 assert.equal(sharedSkillCap([30,27],35).value,35);
});
