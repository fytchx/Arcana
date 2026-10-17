import test from 'node:test';
import assert from 'node:assert/strict';
import {rankPercentagePointGains} from '../src/damage-calculator-marginals.js';
import {blankDamageBuild} from '../src/damage-calculator-engine.js';

test('ranked pet gains compare percentage points within each independent layer',()=>{
 const pet={pet:{layers:{equipmentAffixes:100,companionDrop:300}}};
 const original=structuredClone(pet);
 const x=rankPercentagePointGains(pet,'pet',10);
 assert.equal(x.known,true);
 assert.equal(x.baseline,8);
 assert.equal(x.rows.length,2);
 assert.equal(x.rows[0].source,'equipmentAffixes');
 assert.ok(Math.abs(x.rows[0].percentGain-5)<1e-10);
 assert.ok(Math.abs(x.rows[1].percentGain-2.5)<1e-10);
 assert.deepEqual(pet,original,'what-if ranking may not mutate the saved build');
});

test('attack additive stage is not silently treated as a separate multiplier',()=>{
 const input={attack:{
  weapon:{min:100,max:100},jewelry:{min:0,max:0},
  additive:{classSkills:100},flat:{guild:100},layers:{pets:100},
 }};
 const x=rankPercentagePointGains(input,'attack',10);
 assert.equal(x.baseline,600);
 assert.equal(x.rows[0].path,'attack.layers.pets');
 assert.ok(Math.abs(x.rows[0].percentGain-5)<1e-10);
 assert.ok(Math.abs(x.rows[1].percentGain-100/30)<1e-10);
});

test('unknown builds never produce imaginary rankings',()=>{
 const blank=blankDamageBuild();
 assert.equal(rankPercentagePointGains(blank,'attack').known,false);
 assert.equal(rankPercentagePointGains(blank,'pet').known,false);
 assert.equal(rankPercentagePointGains({pet:{layers:{a:null}}},'pet').known,false);
 assert.ok(Math.abs(rankPercentagePointGains({pet:{layers:{a:0}}},'pet').rows[0].percentGain-10)<1e-10);
});

test('reject wrong stage or misleading extreme changes',()=>{
 assert.throws(()=>rankPercentagePointGains({},'crit'),RangeError);
 assert.throws(()=>rankPercentagePointGains({},'pet',0),RangeError);
 assert.throws(()=>rankPercentagePointGains({},'pet',Infinity),RangeError);
 assert.throws(()=>rankPercentagePointGains({},'pet',1001),RangeError);
});
