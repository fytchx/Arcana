import test from 'node:test';
import assert from 'node:assert/strict';
import {OPTIMIZER_ITEMS,OPTIMIZER_CHOICES,optimizerChoice,optimizerStatLabel} from '../src/upgrade-optimizer-data.js';
import {normalizeOptimizerPlan,readOptimizerPlan,saveOptimizerPlan,upgradeOptimizerView} from '../src/upgrade-optimizer.js';

test('October 21 equipment catalog preserves game item identities',()=>{
 assert.equal(OPTIMIZER_ITEMS.length,40);
 assert.equal(optimizerChoice('sandals-of-starszy|Chainmail Boots')?.itemId,'sandals-of-starszy');
 assert.equal(optimizerChoice('greatsword|Arcane Steel Greatsword')?.tier,6);
 assert.equal(optimizerChoice('rags|Chainmail Armor')?.itemId,'rags');
 assert.equal(optimizerStatLabel('gold_exp_gain'),'Gold Gain & Exp Gain');
 assert.ok(OPTIMIZER_CHOICES.length>100);
});
test('optimizer validates ranges and never forces estimated stat projections',()=>{
 const normalized=normalizeOptimizerPlan({mode:'invalid',candidates:[{itemKey:'wardplate|Wardplate',fromStage:'A6',fromLevel:40,toStage:'A6',toLevel:-7,primaryFrom:'',primaryTo:''}]});
 assert.equal(normalized.mode,'expected');
 assert.equal(normalized.candidates[0].fromLevel,30);
 assert.equal(normalized.candidates[0].toLevel,0);
 assert.equal(normalized.candidates[0].primaryTo,'');
});
test('optimizer saves candidate differences independent of Damage Calculator',()=>{
 const bag=new Map(),store={getItem:k=>bag.get(k),setItem:(k,v)=>bag.set(k,v)};
 const original=normalizeOptimizerPlan();
 const saved=saveOptimizerPlan(original,store);
 assert.deepEqual(readOptimizerPlan(store),saved);
 assert.match([...bag.keys()][0],/upgrade-optimizer/);
});
test('optimizer renders observed examples and a clear sourcing note',()=>{
 const html=upgradeOptimizerView(null);
 assert.match(html,/Chainmail Boots/);
 assert.match(html,/Chainmail Armor/);
 assert.match(html,/Forge preview/);
 assert.match(html,/Affixes and Drop Bonuses are excluded/);
 assert.match(html,/Loading Pathfinder costs/);
});
