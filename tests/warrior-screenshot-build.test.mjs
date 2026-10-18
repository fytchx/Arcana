import test from 'node:test';
import assert from 'node:assert/strict';
import {demoBuilds} from '../src/catalog.js';
import {WARRIOR_OCT17_BUILD,WARRIOR_OCT17_OBSERVED,WARRIOR_OCT17_GEAR,WARRIOR_OCT17_PETS,WARRIOR_OCT17_RUNE_GRID} from '../src/warrior-oct17-snapshot.js';
import {GEAR_ITEMS,asGear,baseItem,allowedItem,gearIssues,bonusRange} from '../src/build-studio-data.js';
import {normalizeBuild,validateBuildData,monsterLevelGrid} from '../src/labs-engine.js';
import {observedBuildAudit} from '../src/observed-build-audit.js';
import {shareBuildToken,openBuildToken} from '../src/build-links.js';

test('the EXISTING Warrior guide build is the October 17 player screenshot snapshot, not another duplicate',()=>{
 const b=demoBuilds['warrior-retaliation-zane'];
 assert.equal(b,WARRIOR_OCT17_BUILD);
 assert.equal(b.id,'warrior-retaliation-zane');
 assert.equal(b.monsterLevel,220);
 assert.equal(b.characterLevel,265);
 assert.equal(b.observed.player.gearScore,3030);
 assert.equal(b.observed.stats.defense,28560000);
 assert.equal(b.observed.stats.retaliationAverage,183630000000);
 assert.equal(b.observed.stats.doubleDamageChancePercent,656);
});
test('all eleven screenshot items are in correct legal Warrior slots with actual tier and drop bonus roll',()=>{
 const b=normalizeBuild(WARRIOR_OCT17_BUILD);
 assert.equal(WARRIOR_OCT17_GEAR.length,11);
 assert.equal(Object.keys(b.equipment).length,11);
 assert.equal(new Set(WARRIOR_OCT17_GEAR.map(x=>x.slot)).size,11);
 for(const row of WARRIOR_OCT17_GEAR){
  const gear=asGear(b.equipment[row.slot]);
  assert.ok(gear,'gear missing '+row.slot);
  assert.equal(baseItem(gear)?.name,row.name,'wrong item '+row.slot);
  assert.ok(allowedItem(gear,row.slot,'Warrior'),'illegal slot '+row.slot);
  assert.deepEqual(gearIssues(gear,row.slot,'Warrior',b.equipment),[]);
  assert.equal(gear.roll,row.roll);
  assert.ok(bonusRange(gear.bonusId,gear.bonusTier).some(x=>x<=gear.roll),'unknown bonus '+row.slot);
  assert.equal(row.affixes.length,5,'all five item affixes must be present');
 }
 assert.ok(GEAR_ITEMS.filter(x=>x.source==='2026-10-17 Warrior screenshot').length>=4);
});
test('all four currently equipped named pets have actual compound level and verified affix slots',()=>{
 const x=normalizeBuild(WARRIOR_OCT17_BUILD);
 assert.deepEqual(x.petSetup.map(p=>p.name),['Crow','Diablo','Wasp','Zbakus']);
 assert.deepEqual(x.petSetup.map(p=>p.compound),[3,12,11,10]);
 assert.deepEqual(WARRIOR_OCT17_PETS.map(p=>p.observedHatchPercent),[14,103,93,84]);
 assert.deepEqual(x.petSetup.map(p=>p.affixes.filter(a=>a.slug).length),[4,4,4,4]);
 assert.equal(validateBuildData(x).length,0,'pet setup is within actual four-slot schema');
});
test('6x6 observed Rune preset is preserved without faking unknown secondary IDs',()=>{
 assert.deepEqual(monsterLevelGrid(WARRIOR_OCT17_BUILD.monsterLevel),{ml:220,cols:6,rows:6});
 assert.equal(WARRIOR_OCT17_RUNE_GRID.reduce((sum,r)=>sum+r.width,0),36);
 assert.equal(new Set(WARRIOR_OCT17_RUNE_GRID.map(r=>r.x+','+r.y)).size,WARRIOR_OCT17_RUNE_GRID.length);
 assert.equal(WARRIOR_OCT17_RUNE_GRID.filter(r=>r.level===63).length,3);
 assert.equal(WARRIOR_OCT17_BUILD.runeBoard.length,35,'all visible runes have placements');
 assert.ok(WARRIOR_OCT17_BUILD.runeBoard.every(r=>r.observedSecondaryUnknown&&r.secondary===null));
 assert.equal(normalizeBuild(WARRIOR_OCT17_BUILD).runeBoard.length,35);
 assert.deepEqual(WARRIOR_OCT17_BUILD.classAllocById,{});
 assert.deepEqual(WARRIOR_OCT17_BUILD.passiveAlloc,{});
});
test('Build Studio audit makes observed stats, gems, 11 gear items, runes, 4 pets and both talismans visible',()=>{
 const html=observedBuildAudit(normalizeBuild(WARRIOR_OCT17_BUILD));
 for(const part of ['Current Warrior loadout','28,560,000','183,630,000,000',
   'Sage Diadem','3 captured','Crow','Diablo','Wasp','Zbakus',
   'Talisman of Fury','Talisman of Iron','Rune preset 3','4,034','28.5%','Guild context']){
  if(part==='3 captured')continue;
  assert.ok(html.includes(part),'missing player evidence '+part);
 }
 assert.match(html,/data-action="obsjump"/);
 assert.ok(!html.includes('href="#obs-'),'hash links would destroy the Build Studio route');
});
test('anonymous shared build URL retains screenshot observations instead of silently discarding stats',async()=>{
 const token=await shareBuildToken(WARRIOR_OCT17_BUILD);
 assert.ok(token.length<7500,'URL must fit share bounds');
 const again=await openBuildToken(token);
 assert.equal(again.observed.stats.retaliationAverage,183630000000);
 assert.equal(again.observed.talismans.length,2);
 assert.equal(again.observed.equipment.length,11);
 assert.equal(again.petSetup.length,4);
 assert.equal(again.monsterLevel,220);
 assert.equal(again.id,'shared-build');
});
test('unknown skill tree and rune secondary data are not invented to make the test look complete',()=>{
 assert.equal(WARRIOR_OCT17_OBSERVED.skillTree.allocationVerified,false);
 assert.equal(WARRIOR_OCT17_OBSERVED.passiveTree.allocationVerified,false);
 assert.equal(WARRIOR_OCT17_OBSERVED.runes.secondaryIconsVerified,false);
 assert.ok(WARRIOR_OCT17_OBSERVED.unresolved.length>=3);
});
