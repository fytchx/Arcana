import test from 'node:test';
import assert from 'node:assert/strict';
import {
 CAP_CONFIG_VERSION, SKILL_CLASS_NAMES, SKILL_CATALOG, CONFIGURED_SKILL_CAPS,
 classCapSkills, evaluateConfiguredSkillCaps, compareConfiguredSkillCaps,
} from '../src/damage-calculator-config-caps.js';

const outputs=(classId,allClassSkills,skills={})=>
 Object.fromEntries(evaluateConfiguredSkillCaps({classId,allClassSkills,skills}).map(row=>[row.key,row]));
const invested=(...pairs)=>Object.fromEntries(pairs.map(([id,allocated])=>[id,{allocated}]));

test('October 17 config manifest has exactly 90 unique skills and 24 valid cap outputs',()=>{
 assert.equal(CAP_CONFIG_VERSION,'2026-10-17-001');
 assert.equal(Object.keys(SKILL_CATALOG).length,90);
 assert.equal(CONFIGURED_SKILL_CAPS.length,24);
 assert.equal(new Set(CONFIGURED_SKILL_CAPS.map(c=>c.key)).size,24);
 assert.equal(Object.keys(SKILL_CLASS_NAMES).length,5);
 for(const id of [1,2,3,4,5])assert.equal(Object.values(SKILL_CATALOG).filter(s=>s.classId===id).length,18);
 for(const group of CONFIGURED_SKILL_CAPS){
   assert.ok(group.cap>0,group.key);
   for(const id of group.displaySkillIds)assert.ok(SKILL_CATALOG[id],group.key+' display '+id);
   for(const c of group.contributions)assert.ok(SKILL_CATALOG[c.skillId],group.key+' contributor '+c.skillId);
   if(group.gateSkillId!==null)assert.ok(SKILL_CATALOG[group.gateSkillId],group.key+' gate');
 }
});

test('Warrior shared Culling and Executioner 41% clips ONCE at 35%',()=>{
 const x=outputs(1,17,invested([7,5],[23,2]));
 assert.equal(x.execute_threshold.raw,41);
 assert.equal(x.execute_threshold.applied,35);
 assert.equal(x.execute_threshold.wasted,6);
 assert.equal(x.execute_threshold.contributions.length,2);
});
test('Warrior Deflection has separate 25% block and 40% retaliation output caps',()=>{
 const x=outputs(1,17,invested([53,2],[47,1]));
 assert.deepEqual([x.deflection_block.raw,x.deflection_block.applied],[38,25]);
 assert.deepEqual([x.deflection_retaliation.raw,x.deflection_retaliation.applied],[76,40]);
 assert.deepEqual([x.bloodthirst_extra_kill.raw,x.bloodthirst_extra_kill.applied],[18,10]);
});
test('Mage Magic Blast gate must be unlocked before base 50% plus Unstable Energy',()=>{
 const onlyEnergy=outputs(3,17,invested([38,1]));
 assert.equal(onlyEnergy.magic_blast_chance.applied,0);
 const withBlast=outputs(3,17,invested([4,10],[38,1],[39,1],[42,5],[21,5]));
 assert.deepEqual([withBlast.magic_blast_chance.raw,withBlast.magic_blast_chance.applied],[140,100]);
 assert.deepEqual([withBlast.arcane_cascade_chance.raw,withBlast.arcane_cascade_chance.applied],[144,100]);
 assert.deepEqual([withBlast.pyroclasm_damage.raw,withBlast.pyroclasm_damage.applied],[110,100]);
 assert.deepEqual([withBlast.boss_damage_bonus.raw,withBlast.boss_damage_bonus.applied],[110,100]);
});
test('Archer trap skills share 35% total and Alpha Strike caps at 60%',()=>{
 const x=outputs(2,5,invested([2,5],[32,4],[36,1],[13,1]));
 assert.equal(x.trap_damage.raw,24);
 assert.equal(x.trap_damage.applied,24);
 assert.equal(x.alpha_strike_chance.applied,18);
 assert.equal(x.boss_damage_bonus.applied,30);
 assert.equal(outputs(2,25,invested([36,1])).alpha_strike_chance.applied,60);
});
test('Rogue Shadow Echo chance and damage independently cap, gated by skill 63',()=>{
 const x=outputs(4,17,invested([63,1],[65,5]));
 assert.deepEqual([x.shadow_echo_chance.raw,x.shadow_echo_chance.applied],[134,100]);
 assert.deepEqual([x.shadow_echo_damage.raw,x.shadow_echo_damage.applied],[84,80]);
 const gated=outputs(4,17,invested([65,5]));
 assert.equal(gated.shadow_echo_chance.raw,0);
 assert.equal(gated.shadow_echo_damage.applied,0);
});
test('Druid pet conversion shares cap across Kinship and Feral Bond, no phantom stacking',()=>{
 const x=outputs(5,17,invested([85,10],[87,5],[75,1],[84,1]));
 assert.deepEqual([x.attack_pet_conversion.raw,x.attack_pet_conversion.applied],[169,75]);
 assert.equal(x.alpha_strike_chance.applied,54);
 assert.equal(x.deep_roots_pet_xp.applied,15);
});
test('Shared cross-class cap group never leaks skills from another class',()=>{
 const input={34:{allocated:5},80:{allocated:5}};
 const archer=outputs(2,5,input),druid=outputs(5,5,input);
 assert.equal(archer.pet_egg_drop.raw,10);
 assert.equal(druid.pet_egg_drop.raw,10);
 assert.equal(archer.pet_egg_drop.contributions.length,1);
 assert.equal(druid.pet_egg_drop.contributions.length,1);
});
test('ACS does not grant effects to locked zero-point skills; explicit unlock is supported',()=>{
 const locked=outputs(1,17,{53:{allocated:0,unlocked:false}});
 assert.equal(locked.deflection_block.applied,0);
 const unlocked=outputs(1,17,{53:{allocated:0,unlocked:true}});
 assert.equal(unlocked.deflection_block.applied,25);
 assert.equal(unlocked.deflection_retaliation.applied,40);
 const clamped=outputs(1,17,{53:{allocated:800,unlocked:true}});
 assert.equal(clamped.deflection_block.raw,44);
});
test('+1 ACS comparison reports applied output gain, not raw excess',()=>{
 const x=compareConfiguredSkillCaps({classId:2,allClassSkills:4,skills:invested([36,1],[2,5],[32,4])});
 const alpha=x.find(v=>v.key==='alpha_strike_chance');
 const trap=x.find(v=>v.key==='trap_damage');
 assert.equal(alpha.gainOneACS,3);
 assert.equal(trap.gainOneACS,2.5);
 const capped=compareConfiguredSkillCaps({classId:2,allClassSkills:30,skills:invested([36,1])}).find(v=>v.key==='alpha_strike_chance');
 assert.equal(capped.gainOneACS,0);
});
test('class controls list only cap-relevant skills, normal 90-skill catalog untouched',()=>{
 for(const classId of [1,2,3,4,5]){
  const relevant=classCapSkills(classId);
  assert.ok(relevant.length>0);
  assert.ok(relevant.every(s=>s.classId===classId));
 }
 assert.throws(()=>evaluateConfiguredSkillCaps({classId:0}),RangeError);
});
