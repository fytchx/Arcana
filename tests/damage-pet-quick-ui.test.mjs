import test from 'node:test';
import assert from 'node:assert/strict';
import {petQuickCompareView,petQuickSnapshotKey} from '../src/damage-pet-quick-ui.js';
import {HUNTER_2026_10_17 as H} from '../src/damage-calculator-reference.js';

test('mobile pet comparison provides four inline measured breakpoint inputs',()=>{
 const html=petQuickCompareView();
 const fields=[...html.matchAll(/data-dc-field="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(fields,[
  'pet.layers.equipmentAffixes','pet.layers.companionDrop',
  'pet.layers.intelligence','pet.layers.dexterity',
 ]);
 assert.match(html,/data-dc-pet-observed/);
 assert.match(html,/data-dc-pet-demo-mixed/);
 assert.match(html,/data-dc-pet-copy/);
 assert.match(html,/data-dc-pet-reset/);
 assert.match(html,/id="dcPetQuickResult" aria-live="polite"/);
 assert.match(html,/data-dc-panel="pet"/);
 assert.match(html,/min-height:44px/);
});

test('observed pet multiplier snapshot changes when source baseline changes',()=>{
 const current=structuredClone(H);
 const original=petQuickSnapshotKey(current);
 assert.equal(original,petQuickSnapshotKey(structuredClone(H)));
 current.pet.layers.intelligence+=0.5;
 assert.notEqual(petQuickSnapshotKey(current),original);
});

test('snapshot comparison ignores irrelevant hero Attack sources but tracks raw Pet changes',()=>{
 const build=structuredClone(H);
 const original=petQuickSnapshotKey(build);
 build.attack.layers.guild+=100;
 assert.equal(petQuickSnapshotKey(build),original);
 build.pet.flat.runes+=10;
 assert.notEqual(petQuickSnapshotKey(build),original);
});
