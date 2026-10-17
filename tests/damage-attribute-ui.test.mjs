import test from 'node:test';
import assert from 'node:assert/strict';
import {damageAttributeView} from '../src/damage-attribute-ui.js';
import {linkedAttributeStageFields,previewLinkedAttributeChange} from '../src/damage-attribute-link.js';
import {blankDamageBuild} from '../src/damage-calculator-engine.js';

test('linked stat lab is a mobile first independent tab with exact attribute inputs',()=>{
 const html=damageAttributeView();
 assert.match(html,/id="dcAttributeLab"/);
 assert.match(html,/data-dc-panel="attributes"/);
 assert.match(html,/data-dc-attr-stat/);
 assert.match(html,/data-dc-attr-origin/);
 assert.match(html,/data-dc-attr-points/);
 assert.match(html,/id="dcAttributePreview" aria-live="polite"/);
 assert.match(html,/min-height:44px/);
 assert.match(html,/Increased INT\/STR\/DEX/);
 assert.ok(!html.includes('data-dc-field="attack.additive.strengthFromItems"'),
  'source inputs are generated only after a user selects the stat and origin');
});

test('linked stat field list is the exact same routing used by the engine',()=>{
 assert.deepEqual(linkedAttributeStageFields('INT','item').map(x=>x.path),[
  'attack.additive.intelligenceFromItems','pet.layers.intelligence','combat.doubleDamageChance',
 ]);
 assert.deepEqual(linkedAttributeStageFields('INT','other').map(x=>x.path),[
  'attack.layers.intelligenceOther','pet.layers.intelligence','combat.doubleDamageChance',
 ]);
 assert.deepEqual(linkedAttributeStageFields('STR','other').map(x=>x.path),[
  'attack.layers.strengthOther',
 ]);
 assert.deepEqual(linkedAttributeStageFields('DEX','item').map(x=>x.path),[
  'pet.layers.dexterity',
 ]);
});

test('a partial measured reference must never silently become a complete attribute projection',()=>{
 const x=blankDamageBuild();
 x.pet.layers.intelligence=15;
 const preview=previewLinkedAttributeChange(x,{stat:'INT',origin:'other',effectivePoints:100});
 assert.equal(preview.measured,true);
 assert.equal(preview.full,false);
 assert.equal(preview.applied.length,1);
 assert.equal(preview.skipped.length,2);
 assert.equal(x.pet.layers.intelligence,15);
});
