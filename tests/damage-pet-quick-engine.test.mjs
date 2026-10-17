import test from 'node:test';
import assert from 'node:assert/strict';
import {
 blankQuickPetSetup,normalizeQuickPetSetup,compareQuickPetSetups,QUICK_PET_SOURCES,
} from '../src/damage-pet-quick-engine.js';
import {HUNTER_2026_10_17 as H} from '../src/damage-calculator-reference.js';
const slot=(source,value)=>({source,value});
const four=(...rows)=>[...rows,...blankQuickPetSetup()].slice(0,4);
test('four slots have only supported, source-attributed comparison modes',()=>{
 assert.equal(blankQuickPetSetup().length,4);
 assert.equal(QUICK_PET_SOURCES.length,5);
 assert.equal(normalizeQuickPetSetup([{source:'invalid',value:999}])[0].source,'none');
 assert.equal(normalizeQuickPetSetup([{source:'petEquipmentPct',value:''}])[0].value,null);
});
test('2 pet % vs 4 pet % replaces already-included current totals, not stacks two sets',()=>{
 const A=four(slot('petEquipmentPct',20),slot('petEquipmentPct',20));
 const B=four(slot('petEquipmentPct',20),slot('petEquipmentPct',20),
              slot('petEquipmentPct',20),slot('petEquipmentPct',20));
 const result=compareQuickPetSetups(H,A,B);
 assert.equal(result.known,true);
 assert.equal(result.stages[0].source,'equipmentAffixes');
 assert.equal(result.stages[0].measuredBaseline,182);
 assert.equal(result.stages[0].currentContribution,40);
 assert.equal(result.stages[0].proposedContribution,80);
 assert.equal(result.stages[0].proposedStage,222);
 assert.ok(Math.abs(result.ratio-3.22/2.82)<1e-12);
 assert.equal(result.damageRange,null,'raw pet base still unknown');
 assert.equal(H.pet.layers.equipmentAffixes,182,'fixture must remain immutable');
});
test('effective flat INT and DEX stat points only enter their verified pet stat channels',()=>{
 const A=four(slot('effectiveInt',20),slot('effectiveDex',10));
 const B=four(slot('effectiveInt',40),slot('effectiveDex',10));
 const result=compareQuickPetSetups(H,A,B);
 assert.equal(result.known,true);
 assert.equal(result.stages.find(x=>x.source==='intelligence').delta,1);
 assert.equal(result.stages.find(x=>x.source==='dexterity').delta,0);
 assert.ok(Math.abs(result.ratio-(1+11.5/100)/(1+10.5/100))<1e-10);
});
test('unknown breakdown cannot be forged into a damage result',()=>{
 const A=four(slot('petEquipmentPct',20));
 assert.equal(compareQuickPetSetups({},A,A).known,false);
 assert.equal(compareQuickPetSetups({pet:{layers:{}}},A,A).known,false);
 const missing=compareQuickPetSetups(H,four(slot('petEquipmentPct',null)),A);
 assert.equal(missing.known,false);
 assert.ok(missing.missing.some(x=>x.includes('value')));
});
test('invalid old loadout larger than actual breakdown is rejected rather than clamped',()=>{
 const bad=four(slot('petEquipmentPct',200),slot('petEquipmentPct',100));
 const result=compareQuickPetSetups(H,bad,four());
 assert.equal(result.known,false);
 assert.match(result.reason,/exceed/);
});
test('retains pet flat sources and base range when verified',()=>{
 const build=structuredClone(H);
 build.pet.base={min:100,max:200};
 const result=compareQuickPetSetups(build,four(),four());
 assert.equal(result.known,true);
 assert.equal(result.ratio,1);
 assert.equal(result.damageRange.min,(100+690)*result.proposedMultiplier);
});
test('switching a slot from pet % to effective INT changes BOTH source groups appropriately',()=>{
 const result=compareQuickPetSetups(H,four(slot('petEquipmentPct',15)),
  four(slot('effectiveInt',100)));
 assert.equal(result.known,true);
 assert.equal(result.stages.find(x=>x.source==='equipmentAffixes').delta,-15);
 assert.equal(result.stages.find(x=>x.source==='intelligence').delta,5);
});
