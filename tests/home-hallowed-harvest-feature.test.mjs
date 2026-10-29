import test from 'node:test';
import assert from 'node:assert/strict';
import {homeScreen} from '../src/launch-navigation.js';
import {seasonalFeatureState} from '../src/journal-home.js';
import {readFile} from 'node:fs/promises';

test('The Arcana home event feature is prominent and directly opens the published guide',()=>{
 const html=homeScreen();
 assert.match(html,/class="atlasUpdate" data-seasonal-feature/);
 assert.match(html,/href="\/#\/journal\/article\?slug=hallowed-harvest-2026-guide"/);
 assert.match(html,/Hallowed Harvest 2026/);
 assert.ok(html.indexOf('data-seasonal-feature')<html.indexOf('class="atlasTileGrid"'));
 assert.equal((html.match(/class="atlasTile"/g)||[]).length,6);
 assert.match(html,/class="atlasHero atlasGuideHighlight"/);
});

test('Halloween feature deadlines update through the final shop closure',()=>{
 const phase=date=>seasonalFeatureState(Date.parse(date));
 assert.match(phase('2026-10-28T20:00:00Z').phase,/LIVE EVENT/);
 assert.match(phase('2026-11-05T00:00:00Z').phase,/PUMPKIN SHOP/);
 assert.match(phase('2026-11-08T00:00:00Z').phase,/HALLOWEEN SHOP/);
 assert.equal(phase('2026-11-15T00:00:00Z'),null);
});

test('Expired banner cannot linger on the homepage',async()=>{
 const css=await readFile(new URL('../home-atlas.css',import.meta.url),'utf8');
 assert.match(css,/\.atlasHome \.atlasUpdate\[data-seasonal-feature\]\[hidden\]\{display:none!important\}/);
 assert.match(css,/@media\(max-width:759px\)/);
});
