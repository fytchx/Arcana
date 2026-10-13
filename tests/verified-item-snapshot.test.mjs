import test from 'node:test';
import assert from 'node:assert/strict';
import {VERIFIED_ITEM_SNAPSHOT,verifiedEquipmentByName,verifiedRange,verifiedCompare,verifiedTierUpgrade} from '../src/verified-item-snapshot.js';
import {verifiedComparisonPanel,verifiedUpgradeReferencePanel} from '../src/verified-item-views.js';
test('October 9 Season 2 snapshot has all 40 distinct equipment bases',()=>{
 const rows=VERIFIED_ITEM_SNAPSHOT.equipment;
 assert.equal(rows.length,40);
 assert.equal(new Set(rows.map(x=>x.name)).size,40);
 assert.equal(VERIFIED_ITEM_SNAPSHOT.snapshotDate,'2026-10-09');
 assert.ok(VERIFIED_ITEM_SNAPSHOT.configVersion.startsWith('2026-10-06-002'));
 for(const r of rows){
  assert.equal(Object.keys(r.tiers).length,6,r.name);
  for(let i=1;i<=6;i++){
   const tier=r.tiers[i];
   assert.ok(Number.isFinite(tier.min)&&tier.min>=0&&tier.max>=tier.min,r.name+' tier '+i);
   assert.equal(tier.affixSlots,i-1,r.name+' tier '+i);
  }
 }
});
test('actual Claws, Quiver and Torch values match supplied reference config',()=>{
 assert.deepEqual(verifiedRange('Claws',1).primary,{stat:'claw_physical_damage',min:3,max:13});
 assert.deepEqual(verifiedRange('Claws',1).secondary,{stat:'claw_crit_chance',min:50,max:50});
 assert.deepEqual(verifiedRange('Quiver',6).secondary,{stat:'strength_dexterity',min:25,max:31});
 assert.deepEqual(verifiedRange('Torch',4).primary,{stat:'all_skills',min:2,max:2});
 assert.equal(verifiedRange('Sandals of Starszy',3).primary.max,202);
});
test('compare only directly corresponding primary stat keys',()=>{
 const a=verifiedCompare('Rags','Wardplate',1);
 assert.equal(a.comparable,true);
 assert.deepEqual(a.delta,{min:-11,max:-29});
 assert.equal(verifiedCompare('Claws','Grand Staff',4).comparable,false);
 assert.equal(verifiedCompare('Unknown', 'Rags',1).left,null);
 assert.equal(verifiedRange('Claws',7),null);
});
test('config tier transitions remain base values, not guessed totals',()=>{
 assert.deepEqual(verifiedTierUpgrade(1),{from:1,to:2,cost:7500,material:{slug:'uncommon-essence',quantity:1},failureChance:0});
 assert.deepEqual(verifiedTierUpgrade(5),{from:5,to:6,cost:5250000,material:{slug:'infernal-essence',quantity:10},failureChance:0.5});
 assert.equal(verifiedTierUpgrade(6),null);
});
test('source-backed comparison escapes untrusted item names and discloses provenance',()=>{
 const v=verifiedComparisonPanel('Rags','Wardplate',1);
 assert.match(v,/Same primary stat/);
 assert.match(v,/October 9, 2026/);
 assert.match(v,/data-action="comparetier"/);
 const safe=verifiedComparisonPanel('<script>alert(1)</script>',null,1);
 assert.equal(safe.includes('<script>'),false);
 assert.ok(safe.includes('&lt;script&gt;'));
 assert.match(verifiedUpgradeReferencePanel('Claws'),/5,250,000 base gold/);
 assert.match(verifiedUpgradeReferencePanel('Claws'),/not a total-cost/i);
});
