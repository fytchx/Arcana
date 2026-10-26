import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {REFINED_IDS,REFINED_CATEGORIES,REFINED_SHAPES,refinedSvg} from '../src/idlearc-refined-vectors.js';
import {ICON_IDS} from '../src/arcana-icons.js';
import {classEmblem,slotSilhouette} from '../src/studio-visuals.js';
import {homeScreen,homeSubmenu,iconGalleryView} from '../src/launch-navigation.js';
import {labsTabs} from '../src/labs-views.js';

test('archived IdleArc Refined illustrations remain preserved for later review',async()=>{
 assert.equal(REFINED_IDS.length,62);
 assert.equal(new Set(REFINED_IDS).size,62);
 assert.deepEqual(Object.fromEntries(Object.entries(REFINED_CATEGORIES).map(([category,ids])=>[category,ids.length])),
 {equipment:13,classes:5,features:14,tokens:12,stats:18});
 const manifest=JSON.parse(await readFile(new URL('../assets/icons/idlearc-refined/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.iconCount,62);
 for(const [category,ids] of Object.entries(REFINED_CATEGORIES)){
  for(const id of ids){
   assert.ok(REFINED_SHAPES[id]?.length>120,'Missing artwork '+id);
   const file=await readFile(new URL('../assets/icons/idlearc-refined/'+category+'/'+id+'.svg',import.meta.url),'utf8');
   assert.match(file,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
   assert.doesNotMatch(file,/<image\b|<foreignObject\b|<script\b|data:image|\/official-art\//i,id);
   assert.match(refinedSvg(id,37),new RegExp('data-refined-icon="'+id+'"'));
  }
 }
});
test('all genuine equipment slots and class default avatars render approved custom art',()=>{
 for(const slot of ['torch','head','neck','weapon','chest','offhand','ring','ring2','belt','hands','feet'])
  assert.match(slotSilhouette(slot),new RegExp('data-arcana-icon="equipment-'+slot+'"'));
 for(const cls of ['warrior','archer','mage','rogue','druid'])
  assert.match(classEmblem(cls),new RegExp('data-arcana-icon="class-'+cls+'"'));
});
test('preview homepage and menus use Arcana Minimal instead of Refined',()=>{
 const home=homeScreen();
 assert.equal((home.match(/class="atlasTile"/g)||[]).length,6);
 assert.match(home,/data-arcana-icon="feature-build-studio"/);
 assert.doesNotMatch(home,/data-refined-icon=/);
 const submenu=homeSubmenu('tools');
 assert.equal((submenu.match(/class="launchNavRow"/g)||[]).length,4);
  assert.equal((homeSubmenu('tools',true).match(/class="launchNavRow"/g)||[]).length,5);
 assert.match(submenu,/data-arcana-icon=/);
 assert.doesNotMatch(submenu,/data-refined-icon=/);
});
test('Build Studio tabs and 144-icon library remain on Arcana Minimal',()=>{
 const tabs=labsTabs();
 assert.match(tabs,/data-arcana-icon=/);
 assert.doesNotMatch(tabs,/data-refined-icon=/);
 const gallery=iconGalleryView();
 assert.equal((gallery.match(/class="arcanaIconCatalogItem"/g)||[]).length,144);
});
