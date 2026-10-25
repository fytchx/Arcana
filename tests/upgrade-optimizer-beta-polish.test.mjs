import test from 'node:test';
import assert from 'node:assert/strict';
import {upgradeOptimizerSliderView,optimizerBaseItemPicker,normalizeOptimizerSliders} from '../src/upgrade-optimizer-v2.js';
test('community beta onboarding includes a start action, feedback route and tester checklist',()=>{
 const html=upgradeOptimizerSliderView(null,[]);
 assert.match(html,/ARCANA LABS · TEST BUILD/);
 assert.match(html,/data-route="beta"/);
 assert.match(html,/Choose your first item/);
 assert.match(html,/Quick checklist/);
 assert.doesNotMatch(html,/<div class="uoRangeGrid">/);
});
test('visual picker exposes real base families and filters',()=>{
 const html=optimizerBaseItemPicker(0);
 assert.match(html,/data-uo-search/);
 assert.match(html,/data-uo-filter="all"/);
 assert.match(html,/STEP 01/);
 assert.match(html,/data-uo-family=/);
});
test('beta defaults to empty equipment',()=>assert.deepEqual(normalizeOptimizerSliders().items,[]));
