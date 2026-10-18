import test from 'node:test';
import assert from 'node:assert/strict';
import {GEAR_ITEMS,DROP_BONUSES,RARITIES,CLASS_CODES,baseItem,equipmentId,allowedItem,allowedGearForSlot,asGear,newGear,bonusRange,bonusUnit,gearIssues,gearLabel} from '../src/build-studio-data.js';

test('verified equipment and Drop Bonus catalogs are complete',()=>{
 assert.equal(GEAR_ITEMS.filter(g=>g.source==='2026-10-09 verified config').length,40);
 assert.equal(GEAR_ITEMS.filter(g=>g.source==='2026-10-17 Warrior screenshot').length,4);
 assert.equal(DROP_BONUSES.length,21);
 assert.equal(RARITIES.length,6);
 assert.equal(new Set(GEAR_ITEMS.map(x=>x.id)).size,44);
 for(const item of GEAR_ITEMS){
  assert.ok(item.id.startsWith('game:item:'));
  assert.ok(['main_hand','off_hand','head','chest','hands','feet','belt','ring','amulet','torch'].includes(item.slot));
 }
});
test('item picker restricts base equipment to slot and selected class',()=>{
 const weapon=allowedGearForSlot('weapon','Warrior');
 assert.ok(weapon.some(i=>i.name==='Greatsword'));
 assert.ok(!weapon.some(i=>i.name==='Crossbow'));
 assert.equal(allowedItem('game:item:wooden-bow','weapon','Mage'),false);
 assert.equal(allowedItem('game:item:wooden-bow','weapon','Archer'),true);
 assert.equal(allowedItem('game:item:gnarled-stick','weapon','Druid'),true);
 assert.equal(allowedItem('game:item:old-book','offhand','Mage'),true);
 assert.equal(allowedItem('game:item:old-book','offhand','Warrior'),false);
 assert.equal(allowedItem('game:item:adventurers-ring','ring2','Druid'),true);
 assert.equal(allowedItem('game:item:adventurers-ring','ring','Druid'),true);
 assert.equal(allowedGearForSlot('charm','Warrior').length,0);
 assert.equal(Object.keys(CLASS_CODES).length,5);
});
test('two-handed weapons block offhand and dual item configurations',()=>{
 const weapon=newGear('game:item:greatsword'),offhand=newGear('game:item:wooden-shield');
 assert.ok(baseItem(weapon).twoHanded);
 assert.equal(gearIssues(offhand,'offhand','Warrior',{weapon})[0],'A two-handed main-hand weapon occupies the off-hand slot');
 assert.deepEqual(gearIssues(weapon,'weapon','Warrior',{}),[]);
});
test('Drop Bonus values match source tiers without fake interpolation',()=>{
 assert.deepEqual(bonusRange('fierce',6),[18,26]);
 assert.deepEqual(bonusRange('frenzy',6),[4,6]);
 assert.deepEqual(bonusRange('slayers',3),null);
 assert.deepEqual(bonusRange('resilient',3),[0.5,1]);
 assert.deepEqual(bonusRange('fierce',9),[42,50]);
 assert.equal(bonusUnit('life_on_kill'),'');
 assert.equal(bonusUnit('crit_damage'),'%');
});
test('every supported bonus tier is a real configured range',()=>{
 for(const bonus of DROP_BONUSES){
  assert.equal(bonusRange(bonus.id,bonus.minTier-1),null);
  for(let tier=bonus.minTier;tier<=9;tier++){
   const range=bonusRange(bonus.id,tier);
   assert.ok(Array.isArray(range)&&range.length===2,bonus.id+' tier '+tier);
   assert.ok(range[0]<=range[1],bonus.id+' tier '+tier);
  }
 }
});
test('saved gear roundtrip stores unique tier, awakening and bonus per slot',()=>{
 const raw={...newGear('game:item:wooden-bow'),rarity:6,awaken:17,bonusId:'fierce',bonusTier:8,roll:37};
 const result=asGear(JSON.parse(JSON.stringify(raw)));
 assert.deepEqual(result,raw);
 assert.equal(equipmentId(result),raw.id);
 assert.equal(gearLabel(result),'A17');
 assert.deepEqual(gearIssues(result,'weapon','Archer'),[]);
});
test('cannot save a Drop Bonus roll outside the source range',()=>{
 const gear={...newGear('game:item:wooden-bow'),rarity:6,bonusId:'frenzy',bonusTier:6,roll:14};
 assert.ok(gearIssues(gear,'weapon','Archer').some(x=>x.includes('outside')));
 gear.roll=5;
 assert.deepEqual(gearIssues(gear,'weapon','Archer'),[]);
});
test('legacy string builds remain inspectable but do not invent a rarity',()=>{
 const gear=asGear('broken-sword');
 assert.equal(gear.id,'game:item:broken-sword');
 assert.equal(gear.rarity,null);
 assert.equal(gearLabel(gear),'Tier not selected');
});
test('normal gear cannot be assigned ordinary rarity Drop Bonuses',()=>{
 const gear={...newGear('game:item:rags'),rarity:1,bonusId:'fierce',bonusTier:2,roll:3};
 assert.ok(gearIssues(gear,'chest','Warrior').some(x=>x.includes('Normal-item')));
});
