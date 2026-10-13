import test from 'node:test';
import assert from 'node:assert/strict';
import {WIKI_ARTICLES} from '../src/wiki-data.js';
import {demoBuilds} from '../src/catalog.js';
import {normalizeBuild,validateBuildData} from '../src/labs-engine.js';
test('Retaliation Warrior guide and build stay consistent with the submitted in-game snapshot',()=>{
 const guide=WIKI_ARTICLES.find(x=>x.id==='retaliation-warrior-zane');
 assert.ok(guide,'Player guide must be published to ArcanaWiki guide directory');
 assert.equal(guide.category,'Build Guides');
 assert.equal(guide.source,'player-submitted');
 const content=guide.sections.map(s=>(s.body||'')+' '+(s.table||[]).flat().join(' ')).join(' ');
 for(const expected of ['Retaliation %','Defense','Block Chance','Strength','8.21B','6.76B','9.66B','2,145','7.67M','84%','Increased Strength','Legendary','Crit Chance','Crit Damage','Torch','Red','Blue','Bulwark Stance']){
  assert.ok(content.includes(expected),'Guide dropped source detail: '+expected);
 }
 const action=guide.actions.find(x=>x.route==='labs/build?build=warrior-retaliation-zane');
 assert.ok(action,'Matching Build Studio action missing');
 const build=demoBuilds['warrior-retaliation-zane'];
 assert.ok(build);
 assert.equal(build.className,'Warrior');
 assert.equal(build.monsterLevel,208);
 assert.equal(build.version,'PLAYER GUIDE');
 assert.deepEqual(build.equipment,{},'Must not guess specific named game equipment');
 assert.equal(build.runeBoard.length,0,'Must not invent precise rune positions');
 assert.deepEqual(build.petSetup.map(x=>x.hatchBonus),['defense','increased_strength','retaliation','retaliation']);
 const normalized=normalizeBuild(build);
 assert.equal(normalized.petSetup.filter(x=>x.equipped).length,4);
 assert.deepEqual(validateBuildData(normalized),[]);
 assert.match(build.notes,/unset planner default/,'Unprovided compound levels must not be represented as verified');
});
