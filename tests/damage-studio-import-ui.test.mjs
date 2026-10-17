import test from 'node:test';
import assert from 'node:assert/strict';
import {damageStudioImportView} from '../src/damage-studio-import-ui.js';
import {projectBuildStudioDamage,buildStudioScenarioChanges} from '../src/damage-build-studio-bridge.js';

test('Build Studio import is discoverable, explicit, and mobile friendly',()=>{
 const html=damageStudioImportView();
 assert.match(html,/data-dc-panel="studio"/);
 assert.match(html,/Build Studio → Damage Calculator/);
 assert.match(html,/id="dcStudioImportContent" aria-live="polite"/);
 assert.match(html,/data-route="labs\/build"/);
 assert.match(html,/min-height:44px/);
 assert.ok(!html.includes('onClick='));
});
test('valid exact gear roll has stage-consistent replacement, without inventing attack base',()=>{
 const saved={
  className:'Warrior',
  equipment:{ring:{id:'game:item:warriors-ring',rarity:5,awaken:0,
   bonusId:'fierce',bonusTier:5,roll:14}},
 };
 const importResult=projectBuildStudioDamage(saved);
 assert.equal(importResult.known,true);
 const scenario=buildStudioScenarioChanges(importResult,{className:'Warrior'});
 assert.equal(scenario.ok,true);
 assert.deepEqual(scenario.changes,{'attack.layers.dropBonus':14});
 assert.ok(!('attack.weapon.min' in scenario.changes));
 assert.equal(importResult.blockers.length,0);
});
