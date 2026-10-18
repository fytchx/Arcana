import test from 'node:test';
import assert from 'node:assert/strict';
import {WIKI_ARTICLES} from '../src/wiki-data.js';
import {demoBuilds} from '../src/catalog.js';
import {normalizeBuild,validateBuildData} from '../src/labs-engine.js';

test('existing Retaliation Warrior guide follows the new October 17 in-game build',()=>{
 const guide=WIKI_ARTICLES.find(x=>x.id==='retaliation-warrior-zane');
 assert.ok(guide,'Existing player guide must still be present');
 assert.equal(guide.category,'Build Guides');
 assert.equal(guide.source,'player-authored');
 assert.equal(guide.author,'Zane');
 const content=guide.sections.map(s=>(s.body||'')+' '+(s.table||[]).flat().join(' ')).join(' ');
 for(const expected of ['Retaliation %','Defense','Block Chance','Strength','183.63B','151.2B','216B','3,030','28.56M','97%','Increased Strength',
  'Critical Chance','Crit Damage','Torch','Red','Blue','Bulwark Stance']){
  assert.ok(content.includes(expected),'Guide dropped current source detail: '+expected);
 }
 assert.ok(guide.sections.some(s=>s.title.startsWith('Build snapshot · October 17')));
 assert.match(guide.sections.find(s=>s.title==='Damage interactions').body,/Double Damage/);
 assert.match(guide.sections.find(s=>s.title==='Where the build can go next').body,/best balance could change/);
 const action=guide.actions.find(x=>x.route==='labs/build?build=warrior-retaliation-zane');
 assert.ok(action,'Original existing player build link was lost');

 const build=demoBuilds['warrior-retaliation-zane'];
 assert.ok(build);
 assert.equal(build.id,'warrior-retaliation-zane');
 assert.equal(build.className,'Warrior');
 assert.equal(build.characterLevel,265);
 assert.equal(build.monsterLevel,220);
 assert.equal(build.version,'PLAYER SCREENSHOT');
 assert.equal(Object.keys(build.equipment).length,11);
 assert.equal(build.observed.stats.retaliationAverage,183630000000);
 assert.deepEqual(build.petSetup.map(p=>p.name),['Crow','Diablo','Wasp','Zbakus']);
 // A screenshot of a rune board does not show skill-point allocation; preserve
 // honesty and make that limitation explicit instead of filling fantasy values.
 assert.equal(build.runeBoard.length,35);
 assert.ok(build.runeBoard.every(r=>r.observedSecondaryUnknown&&r.secondary===null),'never guess the secondary stat icon');
 assert.deepEqual(build.classAllocById,{});
 assert.deepEqual(build.passiveAlloc,{});
 const normalized=normalizeBuild(build);
 assert.equal(normalized.petSetup.filter(p=>p.equipped).length,4);
 assert.deepEqual(validateBuildData(normalized),[]);
});
