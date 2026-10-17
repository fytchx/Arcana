import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {REFINED_IDS,REFINED_CATEGORIES,REFINED_SHAPES,refinedSvg} from '../src/idlearc-refined-vectors.js';
import {classEmblem,slotSilhouette} from '../src/studio-visuals.js';
import {homeScreen,homeSubmenu,refinedIconGalleryView} from '../src/launch-navigation.js';
import {labsTabs} from '../src/labs-views.js';

test('IdleArc Refined pack is 62 real individual downloadable SVG illustrations',async()=>{
 assert.equal(REFINED_IDS.length,62);
 assert.equal(new Set(REFINED_IDS).size,62);
 assert.deepEqual(Object.fromEntries(Object.entries(REFINED_CATEGORIES).map(([category,ids])=>[category,ids.length])),
 {equipment:13,classes:5,features:14,tokens:12,stats:18});
 const manifest=JSON.parse(await readFile(new URL('../assets/icons/idlearc-refined/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.iconCount,62);
 for(const [category,ids] of Object.entries(REFINED_CATEGORIES)){
  for(const id of ids){
   assert.ok(REFINED_SHAPES[id]?.length>120,'Missing drawn art for '+id);
   const file=await readFile(new URL('../assets/icons/idlearc-refined/'+category+'/'+id+'.svg',import.meta.url),'utf8');
   assert.match(file,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
   assert.match(file,/<linearGradient/,'illustrated metallic layers expected for '+id);
   assert.match(file,/<g filter="url\(#rf-ds\)">/);
   assert.doesNotMatch(file,/<image\b|<foreignObject\b|<script\b|data:image|\/official-art\//i,id);
   assert.match(refinedSvg(id,37),new RegExp('data-refined-icon="'+id+'"'));
  }
 }
 assert.equal(refinedSvg('not-real'),'');
});
test('all genuine equipment slots and class default avatars render approved custom art',()=>{
 for(const slot of ['torch','head','neck','weapon','chest','offhand','ring','ring2','belt','hands','feet'])
  assert.match(slotSilhouette(slot),new RegExp('data-refined-icon="equipment-'+slot+'"'));
 for(const cls of ['warrior','archer','mage','rogue','druid'])
  assert.match(classEmblem(cls),new RegExp('data-refined-icon="class-'+cls+'"'));
});
test('all six homepage cards, hero, featured links and submenu destinations use one asset family',()=>{
 const home=homeScreen();
 assert.equal((home.match(/class="launchQuickCard"/g)||[]).length,6);
 assert.equal((home.match(/data-refined-icon="feature-/g)||[]).length,11);
 assert.match(home,/data-refined-icon="feature-wiki"/);
 assert.match(home,/data-refined-icon="feature-tools"/);
 assert.match(home,/data-refined-icon="feature-guild-raid"/);
 const submenu=homeSubmenu('tools');
 assert.equal((submenu.match(/class="launchNavRow"/g)||[]).length,7);
 assert.equal((submenu.match(/data-refined-icon="feature-/g)||[]).length,7);
});
test('Build Studio tabs and browsable gallery render the actual 62 icons',async()=>{
 const tabs=labsTabs();
 for(const id of ['build-studio','rune-forge','class-skills','passive-tree'])
  assert.match(tabs,new RegExp('data-refined-icon="feature-'+id+'"'));
 const gallery=refinedIconGalleryView();
 assert.equal((gallery.match(/class="refinedGalleryTile"/g)||[]).length,62);
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/case 'refined-icons':return refinedIconGalleryView\(\)/);
});
