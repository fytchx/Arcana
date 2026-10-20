import test from 'node:test';
import assert from 'node:assert/strict';
import {pityStepModel,quoteFailureScenarios,PITY_MODEL} from '../src/pathfinder-failures.js';
import {quoteRange,readRange,saveRange} from '../src/pathfinder-range.js';
import {quickUpgradeContent} from '../src/quick-tools-view.js';
import {readFile} from 'node:fs/promises';

const snapshot={
 source:'Regression fixture',
 codex:{
  tiers:Object.fromEntries(Array.from({length:6},(_,i)=>[String(i+1),{name:'Tier '+(i+1),max_level:1,
   rows:[{current:0,target:1,gold:'885000000',fragment_slug:'infernal-fragment',fragments:135,monster_materials:{'grubs-eye':10},fail:.63,success:.37}]}])),
  tier_upgrades:Array.from({length:5},(_,i)=>({from_tier:i+1,to_tier:i+2,gold:'50',failure:0,materials:[]})),
  awaken:{rows:Object.fromEntries(Array.from({length:30},(_,i)=>[String(i+1),[
   {current:0,target:1,gold:'885000000',fragment_slug:'infernal-fragment',fragments:135,monster_materials:{'grubs-eye':10},
     extra_materials:[{slug:'abyssal-ember',quantity:1}],fail:.63,success:.37}
  ]])),transitions:Array.from({length:30},(_,i)=>({rank:i+1,gold:'50',failure:0,materials:[]}))}
 },
 materials:[{slug:'infernal-fragment',name:'Infernal Fragment',type:'fragment'},
 {slug:'grubs-eye',name:"Grub's Eye",type:'monster_material',monster_id:1,sourceBiome:'Verdant Woods'},
 {slug:'abyssal-ember',name:'Abyssal Ember',type:'forge'}]
};
const fromTo={fromStage:'A1',fromLevel:0,toStage:'A1',toLevel:1};
const qty=(result,slug)=>result.materials.find(m=>m.slug===slug)?.quantity??0n;

test('pity progression matches observed 63% failed Infernal upgrade',()=>{
 const s=pityStepModel(.63);
 assert.ok(s);
 assert.ok(Math.abs(s.pityDelta-.555)<1e-12);
 assert.equal(s.maxAttempts,2);
 assert.equal(s.pityCap,2);
 assert.ok(Math.abs(s.expectedAttempts-1.63)<1e-10);
 assert.equal(pityStepModel(.785).pityCap,4);
 assert.equal(pityStepModel(.785).maxAttempts,4);
 assert.equal(pityStepModel(.785,1).maxAttempts,3);
 assert.equal(pityStepModel(0)?.maxAttempts,1);
 assert.equal(pityStepModel(.63,1)?.maxAttempts,1);
 assert.match(PITY_MODEL.note,/not independently verified/i);
});
test('failure refund matches observed 135 -> 95, and expected and modeled ceiling preserve minimum',()=>{
 const q=quoteRange(snapshot,fromTo),r=quoteFailureScenarios(snapshot,q);
 assert.equal(r.available,true);
 assert.equal(r.min.gold,885000000n);
 assert.equal(r.expected.gold,885000000n+390285000n);
 assert.equal(r.pity.gold,885000000n+619500000n);
 assert.equal(qty(r.min,'infernal-fragment'),135n);
 assert.equal(qty(r.expected,'infernal-fragment'),195n); // 135 + ceil(95*.63)
 assert.equal(qty(r.pity,'infernal-fragment'),230n);
 assert.equal(qty(r.pity,'grubs-eye'),17n); // 10 + round(7)
 assert.equal(r.pity.attempts,2);
});
test('quantity multiplies each scenario independently without removing biome and forge costs',()=>{
 const one=quoteFailureScenarios(snapshot,quoteRange(snapshot,fromTo));
 const ten=quoteFailureScenarios(snapshot,quoteRange(snapshot,{...fromTo,quantity:10,costMode:'expected'}));
 for(const mode of ['min','expected','pity']){
  assert.equal(ten[mode].gold,one[mode].gold*10n);
  assert.equal(ten[mode].attempts,one[mode].attempts*10);
  for(const m of one[mode].materials)assert.equal(qty(ten[mode],m.slug),m.quantity*10n);
 }
 const h=quickUpgradeContent(snapshot,{...fromTo,quantity:10,costMode:'expected'});
 for(const str of ['data-path-cost-mode="min"','data-path-cost-mode="expected"','data-path-cost-mode="pity"',
 'data-path-pity-count','Already failed this upgrade','Pity 0 / 2','Grub', 'Abyssal Ember',
 'Minimum','Expected','Pity maximum','10 items'])assert.ok(h.includes(str),str);
 assert.ok(h.indexOf('Monster materials')<h.indexOf('Gold & rare materials'));
 assert.match(h,/data-material-section="monsters"/);assert.match(h,/data-material-section="special"/);
 assert.doesNotMatch(h,/<details[^>]*data-material-section="(?:monsters|special)"[^>]*open/);
 assert.match(h,/1,950/); // Estimated fragments = 195 * 10.
 const maxH=quickUpgradeContent(snapshot,{...fromTo,quantity:10,costMode:'pity'});
 assert.match(maxH,/2,300/);
});
test('starting pity reduces modeled risk only for the first step and is preserved with quantity',()=>{
 const zero=quoteFailureScenarios(snapshot,quoteRange(snapshot,fromTo));
 const high=quoteFailureScenarios(snapshot,quoteRange(snapshot,{...fromTo,pityCount:1}));
 assert.equal(high.pity.attempts,1);
 assert.ok(high.expected.gold<zero.expected.gold);
 const storeData=new Map(),storage={getItem:k=>storeData.get(k),setItem:(k,v)=>storeData.set(k,v)};
 const input={...fromTo,quantity:12,costMode:'pity',pityCount:1};
 assert.deepEqual(readRange((saveRange(input,storage),storage)),input);
 const old={...fromTo,quantity:12};
 assert.deepEqual(saveRange(old,storage),old);
});
test('no failure probabilities means no false pity guarantee and base costs remain visible',()=>{
 const missing=structuredClone(snapshot);delete missing.codex.awaken.rows['1'][0].fail;delete missing.codex.awaken.rows['1'][0].success;
 const base=quoteRange(missing,fromTo),r=quoteFailureScenarios(missing,base);
 assert.equal(r.available,false);assert.match(r.reason,/not verified/);
 const html=quickUpgradeContent(missing,{...fromTo,costMode:'pity'});
 assert.match(html,/Failure\/pity scenarios unavailable/);
 assert.match(html,/885,000,000/);
 assert.doesNotMatch(html,/data-path-cost-mode="pity"/);
});
test('native site wire-up preserves quantity handlers, starting pity, scenario and checklist',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../quick-tools.css',import.meta.url),'utf8');
 for(const needle of ['data-path-cost-mode','data-path-quantity-step','d.pathPityCount','quoteFailureScenarios','selected.materials','selected.gold'])
  assert.ok(app.includes(needle),needle);
 for(const needle of ['.quickScenarioCard','var(--theme-main)','var(--theme-highlight)','@media(max-width:650px)'])
  assert.ok(css.includes(needle),needle);
});
