import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const data=JSON.parse(await readFile(new URL('../docs/idle-arc-icon-source-map.json',import.meta.url),'utf8'));
const atlas=JSON.parse(await readFile(new URL('../assets/official-art/manifest.json',import.meta.url),'utf8'));
const expected={equipment:13,classes:5,features:12,tokens:12,stats:18};

test('game-inspired icon production map contains exactly the planned 60 unique targets',()=>{
 assert.equal(data.targets.length,60);
 assert.equal(new Set(data.targets.map(x=>x.family+':'+x.id)).size,60);
 for(const [family,count] of Object.entries(expected)){
  assert.equal(data.targets.filter(x=>x.family===family).length,count,family);
 }
 assert.equal(data.sourceVersion,atlas.version);
});
test('every game-art reference resolves to an actual source sprite and stable tile geometry',()=>{
 for(const icon of data.targets){
  assert.ok(icon.label&&icon.emphasis&&icon.usage);
  assert.ok(icon.source.length&&icon.atlasRefs.length===icon.source.length,icon.id);
  assert.ok(['P0','P1','P2'].includes(icon.priority));
  for(let i=0;i<icon.source.length;i++){
   const token=icon.source[i],pos=token.indexOf(':'),category=token.slice(0,pos),key=token.slice(pos+1);
   const atlasCategory=atlas.categories[category],reference=icon.atlasRefs[i];
   assert.ok(atlasCategory,'Unknown official category '+category);
   assert.ok(Object.hasOwn(atlasCategory.mapping,key),'No game artwork: '+token);
   assert.equal(reference.category,category);
   assert.equal(reference.key,key);
   assert.equal(reference.index,atlasCategory.mapping[key]);
   assert.equal(reference.atlas,'/assets/official-art/'+(atlasCategory.file||category+'.webp').replace(/^\//,''));
   assert.equal(reference.cols,atlasCategory.cols);
   assert.equal(reference.rows,atlasCategory.rows);
   assert.equal(reference.tile,atlasCategory.tile);
   assert.ok(reference.index<reference.cols*reference.rows,'Out of bounds '+token);
  }
 }
});
test('currency/material tokens keep original game art while equipment uses derived silhouettes',()=>{
 assert.ok(data.targets.filter(x=>x.family==='tokens').every(x=>x.treatment==='direct-token'));
 assert.ok(data.targets.filter(x=>x.family==='equipment').every(x=>x.treatment.includes('silhouette')));
 for(const className of ['warrior','archer','mage','rogue','druid']){
  assert.ok(data.targets.some(x=>x.family==='classes'&&x.id===className));
 }
 for(const gear of ['torch','head','neck','weapon','chest','offhand','ring','belt','ring2','charm','hands','feet','charm2']){
  assert.ok(data.targets.some(x=>x.family==='equipment'&&x.id===gear));
 }
});
