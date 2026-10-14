import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {REFINED_REFERENCE,REFINED_ITEM_REFERENCES,refinedIcon,resolvedGearArtwork} from '../src/idlearc-refined-icons.js';
import {slotSilhouette,classEmblem} from '../src/studio-visuals.js';
import {homeScreen} from '../src/launch-navigation.js';
const art=JSON.parse(await readFile(new URL('../assets/official-art/manifest.json',import.meta.url),'utf8'));
const map=JSON.parse(await readFile(new URL('../docs/idle-arc-icon-source-map.json',import.meta.url),'utf8'));
test('all first-wave icons point at actual game art rather than invented glyph names',()=>{
 assert.equal(Object.keys(REFINED_REFERENCE).length,60);
 for(const t of map.targets){
  const key=t.family+':'+t.id,source=REFINED_REFERENCE[key];
  assert.ok(source,'missing '+key);
  const atlas=art.categories[source.c];
  assert.ok(atlas,'missing category '+source.c);
  assert.equal(source.i,atlas.mapping[source.key],'wrong sprite '+key);
  assert.ok(source.i<source.cols*source.rows,'out of bounds '+key);
  assert.match(refinedIcon(t.family,t.id),/data-refined-source=/);
 }
});
test('equipment names show the exact matched in-game equipment tile',()=>{
 const cap=resolvedGearArtwork('Leather Cap');
 assert.equal(cap.key,'leather-cap');
 const vest=resolvedGearArtwork('Bloodweave Vest');
 assert.equal(vest.key,'bloodweave-vest');
 assert.equal(resolvedGearArtwork('Invented Helmet'),null);
 assert.match(slotSilhouette('head','Leather Cap'),/data-refined-source="equipment:leather-cap"/);
 assert.match(slotSilhouette('chest','Bloodweave Vest'),/data-refined-source="equipment:bloodweave-vest"/);
 assert.match(slotSilhouette('chest','Not a real item'),/data-refined-source="equipment:leather-armor"/);
 assert.match(slotSilhouette('offhand'),/data-refined-source="equipment:wooden-shield"/);
});
test('game-themed emblems coexist with user-uploaded avatar and stable classes',()=>{
 for(const cls of ['warrior','archer','mage','rogue','druid']){
  assert.match(classEmblem(cls),new RegExp('data-kind="'+cls+'"'));
  assert.match(classEmblem(cls),/data-refined-family="classes"/);
 }
});
test('home features have actual sprite art and brand customization remains independent',()=>{
 const page=homeScreen();
 assert.equal((page.match(/data-refined-family="features"/g)||[]).length,10);
 assert.match(page,/data-refined-source="icons:runic-core"/);
 assert.match(page,/data-refined-source="materials:prism-stone"/);
 assert.equal((page.match(/class="launchQuickCard"/g)||[]).length,6);
 assert.match(page,/launchHeroArcaneSeal/);
});
test('sprite sizes and URLs keep the original artwork colors, not hue rotated',async()=>{
 const css=await readFile(new URL('../launch-navigation.css',import.meta.url),'utf8');
 assert.match(css,/IDLEARC REFINED/);
 assert.match(css,/\.refinedOfficialSprite/);
 const section=css.slice(css.indexOf('IDLEARC REFINED'));
 assert.doesNotMatch(section,/hue-rotate\(/);
 assert.doesNotMatch(section,/filter:\s*grayscale/);
 assert.match(refinedIcon('equipment','head',45),/\/official-art\/equipment\.webp/);
 assert.match(refinedIcon('classes','mage'),/\/official-art\/skills\.webp/);
});
