import test from 'node:test';
import assert from 'node:assert/strict';
import {PET_AFFIX_SNAPSHOT,petAffixDefinition,petAffixLabel,projectPetAffix,normalizePetAffixPlan,readPetAffixPlan,savePetAffixPlan} from '../src/verified-pet-affixes.js';
import {petAffixPlannerView} from '../src/verified-pet-affix-views.js';
test('all nine affix definitions and source date match supplied October 9 game data',()=>{
 assert.equal(PET_AFFIX_SNAPSHOT.snapshotDate,'2026-10-09');
 assert.equal(PET_AFFIX_SNAPSHOT.affixes.length,9);
 assert.deepEqual(PET_AFFIX_SNAPSHOT.affixes.map(x=>x.name),[
 'exp_gain','gold_gain','item_quantity','material_quantity','damage_conversion',
 'ruby_drops','rune_drops','all_skills','extra_kill_chance']);
 assert.equal(PET_AFFIX_SNAPSHOT.evolve.default_slots,2);
 assert.equal(PET_AFFIX_SNAPSHOT.evolve.max_slots,4);
});
test('affix scaling is expressly a projection from base and per-level terms',()=>{
 assert.equal(projectPetAffix('exp_gain',1).display,1);
 assert.equal(projectPetAffix('exp_gain',11).display,3);
 assert.equal(projectPetAffix('material_quantity',51).display,6);
 assert.equal(projectPetAffix('damage_conversion',5).display,7);
 assert.equal(projectPetAffix('all_skills',2).display,2);
 assert.equal(projectPetAffix('all_skills',500).level,2);
 assert.equal(projectPetAffix('extra_kill_chance',999).level,1);
 assert.equal(projectPetAffix('extra_kill_chance',999).display,3);
 assert.equal(projectPetAffix('unknown_affix',10),null);
});
test('pet element stays unresolved rather than guessing which element',()=>{
 assert.equal(petAffixLabel(petAffixDefinition('damage_conversion')),'Damage converted to pet element');
});
test('planner normalization clamps invalid and oversized input',()=>{
 assert.deepEqual(normalizePetAffixPlan({affix:'all_skills',level:999}),{affix:'all_skills',level:2});
 assert.deepEqual(normalizePetAffixPlan({affix:'extra_kill_chance',level:20}),{affix:'extra_kill_chance',level:1});
 assert.deepEqual(normalizePetAffixPlan({affix:'gold_gain',level:-10}),{affix:'gold_gain',level:1});
 assert.deepEqual(normalizePetAffixPlan({affix:'nope',level:'x'}),{affix:'exp_gain',level:1});
});
test('planner state saves independently from Build Studio and survives reload',()=>{
 const data=new Map();const store={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 assert.deepEqual(readPetAffixPlan(store),{affix:'exp_gain',level:1});
 savePetAffixPlan({affix:'ruby_drops',level:35},store);
 assert.deepEqual(readPetAffixPlan(store),{affix:'ruby_drops',level:35});
});
test('affix view renders selected value, nine reference entries, caveat and controls',()=>{
 const output=petAffixPlannerView({affix:'all_skills',level:2});
 assert.match(output,/All Class Skills/);
 assert.match(output,/2 initial affix slots|Initial affix slots/);
 assert.match(output,/role="status"/);
 assert.match(output,/data-action="petaffixstep" data-arg="100"/);
 assert.match(output,/configured scaling/);
 assert.match(output,/not a verified server calculation/);
 assert.doesNotMatch(output,/Data integration comes next/);
});
