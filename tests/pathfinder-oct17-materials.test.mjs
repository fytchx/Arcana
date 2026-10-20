import test from 'node:test';
import assert from 'node:assert/strict';
import {oct17MaterialRules,applyOct17MaterialRules,PATHFINDER_MATERIAL_SOURCE} from '../src/pathfinder-oct17-materials.mjs';
import {quoteUpgrade} from '../src/pathfinder-engine.js';
import {stepCost,timelineStages} from '../src/pathfinder-timeline.js';
import {quoteRange} from '../src/pathfinder-range.js';

const sumEntries=source=>Object.values(source).reduce((sum,levels)=>sum+Object.values(levels).reduce((n,row)=>n+Object.keys(row).length,0),0);
function oldFixture(){
 const tiers=Object.fromEntries([[1,4],[2,9],[3,14],[4,19],[5,24],[6,30]].map(([tier,max])=>
  [String(tier),{name:['Normal','Uncommon','Rare','Epic','Legendary','Infernal'][tier-1],max_level:max,
   rows:Array.from({length:max},(_,i)=>({current:i,target:i+1,gold:'100',fragment_slug:'iron-fragment',fragments:1,monster_materials:{'spider-fang':999},extra_materials:[{slug:'bogus-duplicate',quantity:1}]}))}]));
 const awakenRows=Object.fromEntries(Array.from({length:30},(_,idx)=>[String(idx+1),Array.from({length:30},(_,i)=>({current:i,target:i+1,gold:'100',fragment_slug:'infernal-fragment',fragments:1,monster_materials:{'ogre-bone':999},extra_materials:[{slug:'bogus-duplicate',quantity:2}],materials:[{slug:'bogus-duplicate',quantity:3}]}))]));
 return {sourceVersion:'Legacy verified base costs',materials:[],codex:{tiers,
  tier_upgrades:Array.from({length:5},(_,i)=>({from_tier:i+1,to_tier:i+2,gold:'1000',monster_materials:{'ogre-bone':999},essence:{slug:'old-essence',quantity:9}})),
  awaken:{rows:awakenRows,transitions:Array.from({length:30},(_,i)=>({rank:i+1,gold:'10000',materials:[{slug:'old-transition',quantity:999}]}))}}};
}
test('all 5222 spreadsheet monster-material entries come from pinned Oct 17 datamine',async()=>{
 const r=await oct17MaterialRules();
 assert.match(r.v,/^2026-10-17-001/);
 assert.equal(sumEntries(r.t),542);
 assert.equal(sumEntries(r.a),4680);
 assert.equal(r.m.length,79);
 for(let tier=1;tier<=6;tier++)assert.ok(r.t[tier][1]);
 for(let rank=1;rank<=30;rank++)for(let lv=1;lv<=30;lv++)assert.ok(r.a[rank][lv]);
 assert.deepEqual(r.t['1']['1'],{'grubs-eye':2});
 assert.deepEqual(r.t['1']['4'],{'heartwood-core':3});
 assert.deepEqual(r.t['2']['1'],{'scarab-carapace':2,'scorpion-stinger':1,'grubs-eye':1});
 assert.deepEqual(r.c['1'],{'ogre-bone':5,'heartwood-core':3});
 assert.equal(r.a['1']['1']['glass-carapace'],86);
 assert.equal(r.a['1']['1']['crystal-stinger'],81);
 assert.deepEqual(r.e['1'],[{slug:'abyssal-ember',quantity:1}]);
 assert.deepEqual(r.x['1'],[{slug:'eternal-sigil',quantity:3},{slug:'primeval-core',quantity:1},{slug:'warlord-totem',quantity:8}]);
});
test('merge replaces old monster tables exactly without inventing gold/fragments',async()=>{
 const rules=await oct17MaterialRules(),legacy=oldFixture(),patched=applyOct17MaterialRules(legacy,rules);
 assert.equal(patched.materialSourceVersion,PATHFINDER_MATERIAL_SOURCE);
 assert.equal(patched.codex.tiers['1'].rows[0].gold,'100');
 assert.equal(patched.codex.awaken.rows['1'][0].fragments,1);
 assert.deepEqual(patched.codex.tiers['1'].rows[0].monster_materials,{'grubs-eye':2});
 assert.deepEqual(patched.codex.tiers['1'].rows[0].materials,[]);
 assert.deepEqual(patched.codex.awaken.rows['1'][0].extra_materials,[{slug:'abyssal-ember',quantity:1}]);
 assert.deepEqual(patched.codex.awaken.rows['1'][0].materials,[]);
 assert.deepEqual(patched.codex.tier_upgrades[0].monster_materials,{'ogre-bone':5,'heartwood-core':3});
 assert.deepEqual(patched.codex.tier_upgrades[0].essence,{slug:'uncommon-essence',quantity:1});
 assert.deepEqual(patched.codex.awaken.transitions[0].materials,rules.x['1']);
 assert.deepEqual(patched.codex.awaken.transitions[1].materials,rules.x['2']);
 assert.equal(patched.materials.length,79);
 assert.ok(patched.materials.some(x=>x.slug==='grubs-eye'&&x.sourceBiome==='Verdant Woods'));
 assert.equal(legacy.codex.tiers['1'].rows[0].monster_materials['spider-fang'],999,'must not mutate base snapshot');
});
test('Pathfinder instant cost, range and transition totals agree with the spreadsheet',async()=>{
 const rules=await oct17MaterialRules(),data=applyOct17MaterialRules(oldFixture(),rules);
 const t1=timelineStages(data,'normal')[0];
 const s1=stepCost(data,t1,1);
 assert.equal(s1.materials.find(m=>m.slug==='grubs-eye').quantity,2n);
 assert.equal(s1.materials.find(m=>m.slug==='spider-fang'),undefined);
 const normal=quoteRange(data,{fromStage:'T1',fromLevel:0,toStage:'T1',toLevel:4});
 assert.equal(normal.complete,true);
 for(const lv of [1,2,3,4])for(const [slug,count] of Object.entries(rules.t['1'][lv]))assert.equal(normal.materials.find(m=>m.slug===slug).quantity,BigInt(count));
 const trans=quoteRange(data,{fromStage:'T1',fromLevel:4,toStage:'T2',toLevel:0});
 for(const [slug,count] of Object.entries(rules.c['1']))assert.equal(trans.materials.find(m=>m.slug===slug).quantity,BigInt(count));
 assert.equal(trans.materials.find(m=>m.slug==='uncommon-essence').quantity,1n);
 const awaken=quoteRange(data,{fromStage:'A1',fromLevel:0,toStage:'A1',toLevel:1});
 assert.equal(awaken.materials.find(m=>m.slug==='glass-carapace').quantity,86n);
 assert.equal(awaken.materials.find(m=>m.slug==='abyssal-ember').quantity,1n);
 assert.equal(awaken.materials.some(m=>m.slug==='bogus-duplicate'),false);
 const aggregate=quoteUpgrade(data,'T1',0,'T1',4);
 assert.equal(aggregate.materials['grubs-eye'].quantity,2n);
 assert.equal(aggregate.materials['spider-fang'].quantity,2n);
 const a25=quoteUpgrade(data,'A1',24,'A1',25);
 for(const [slug,count] of Object.entries(rules.a['1']['25']))assert.equal(a25.materials[slug].quantity,BigInt(count));
});
test('missing/changed source row map fails closed rather than displaying wrong costs',async()=>{
 const rules=await oct17MaterialRules();
 const incomplete=oldFixture();incomplete.codex.awaken.rows['30'].pop();
 assert.throws(()=>applyOct17MaterialRules(incomplete,rules),/shape changed/);
 const bad=oldFixture();bad.codex.tiers['2'].rows[1].target=1;
 assert.throws(()=>applyOct17MaterialRules(bad,rules),/mapping invalid/);
});
