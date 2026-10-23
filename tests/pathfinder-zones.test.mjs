import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PATHFINDER_ZONES,pathfinderZone,pathfinderZoneOrder,pathfinderZoneIcon} from '../src/pathfinder-zones.js';
import {sourceMaterialGroups} from '../src/pathfinder-material-groups.js';
import {quickUpgradeContent} from '../src/quick-tools-view.js';
const names=['Verdant Woods','Scorched Sands','Murky Depths','Frozen Peaks','Shadow Realm','Infernal Pits',
 'Elderwood','Glasslands','Drowned Abyss','Shattered Summit','Umbral Rift',"Oblivion's Crown"];
const atlas={ 'Verdant Woods':23,'Scorched Sands':19,'Murky Depths':17,'Frozen Peaks':14,
 'Shadow Realm':20,'Infernal Pits':16,'Elderwood':11,'Glasslands':15,
 'Drowned Abyss':10,'Shattered Summit':21,'Umbral Rift':22,"Oblivion's Crown":18};
test('the twelve real IdleArc zones retain screenshot progression, game emblems, official artwork and distinct palette',()=>{
 assert.deepEqual(PATHFINDER_ZONES.map(x=>x.name),names);
 assert.deepEqual(PATHFINDER_ZONES.map(x=>x.tier),[1,1,2,3,4,5,6,7,8,9,10,11]);
 assert.deepEqual(PATHFINDER_ZONES.map(x=>x.symbol),['tree','sun','waves','snow','moon','flame','tree','sun','waves','snow','moon','flame']);
 assert.equal(new Set(PATHFINDER_ZONES.map(x=>x.slug)).size,12);
 for(const z of PATHFINDER_ZONES){
  assert.equal(z.tile,atlas[z.name]);
  assert.match(z.color,/^#[0-9A-F]{6}$/);
  assert.ok(z.atlasX>=0&&z.atlasX<=100);
  assert.ok(z.atlasY>=0&&z.atlasY<=100);
  assert.match(pathfinderZoneIcon(z.name),/<svg/);
  assert.equal(pathfinderZoneOrder(z.name),names.indexOf(z.name));
 }
 assert.equal(pathfinderZone('arbitrary made-up zone'),null);
 assert.equal(pathfinderZoneOrder('arbitrary made-up zone'),Number.MAX_SAFE_INTEGER);
});
test('materials remain source-attributed, grouped in verified biome progression, then A-Z per biome',()=>{
 const mats=[
  {slug:'x',name:'Zulu Tooth',quantity:4n},
  {slug:'e',name:'Ember',quantity:8n},
  {slug:'b',name:'Beta Bone',quantity:9n},
  {slug:'a',name:'Alpha Claw',quantity:5n},
  {slug:'u',name:'Unknown Scale',quantity:1n},
  {slug:'rare',name:'Rare Sigil',quantity:3n}
 ];
 const source=[
  {slug:'x',type:'monster_material',sourceBiome:'Verdant Woods'},
  {slug:'e',type:'monster_material',sourceBiome:'Frozen Peaks'},
  {slug:'b',type:'monster_material',sourceBiome:'Verdant Woods'},
  {slug:'a',type:'monster_material',sourceBiome:'Verdant Woods'},
  {slug:'u',type:'monster_material'},
  {slug:'rare',type:'currency'}
 ];
 const groups=sourceMaterialGroups(mats,source,[]);
 assert.deepEqual(groups.map(g=>g.name),['Verdant Woods','Frozen Peaks','Biome not verified','Forge & special materials']);
 assert.deepEqual(groups[0].materials.map(m=>m.name),['Alpha Claw','Beta Bone','Zulu Tooth']);
 assert.equal(groups[2].materials[0].sourceVerified,false);
 assert.equal(groups[0].materials[0].sourceVerified,true);
});
test('monster materials follow the game monster listing order instead of alphabetical or numeric-ID order',()=>{
 const mats=[
  {slug:'second-drop',name:'Alpha Claw',quantity:1n},
  {slug:'first-drop',name:'Zulu Tooth',quantity:1n}
 ];
 const source=[
  {slug:'second-drop',type:'monster_material',monster_id:102,sourceBiome:'Verdant Woods'},
  {slug:'first-drop',type:'monster_material',monster_id:901,sourceBiome:'Verdant Woods'}
 ];
 const catalog=[
  {id:'game:monster:901',title:'First Monster',gameKind:'monster',facts:[['Monster ID','901'],['Biome','Verdant Woods']]},
  {id:'game:monster:102',title:'Second Monster',gameKind:'monster',facts:[['Monster ID','102'],['Biome','Verdant Woods']]}
 ];
 const groups=sourceMaterialGroups(mats,source,catalog);
 assert.deepEqual(groups[0].materials.map(m=>m.name),['Zulu Tooth','Alpha Claw']);
 const snapshot={codex:{tiers:{},awaken:{rows:{'1':[{current:0,target:1,gold:'1000',monster_materials:{'second-drop':1,'first-drop':1},extra_materials:[],failure:0.63}]}},transitions:[]},materials:[
  {...mats[0],type:'monster_material',monster_id:102,sourceBiome:'Verdant Woods'},
  {...mats[1],type:'monster_material',monster_id:901,sourceBiome:'Verdant Woods'}
 ]};
 const html=quickUpgradeContent(snapshot,{fromStage:'A1',fromLevel:0,toStage:'A1',toLevel:1,quantity:1},{catalog});
 assert.ok(html.indexOf('Zulu Tooth')<html.indexOf('Alpha Claw'));
});
test('primary material list uses per-zone accordion cards, official sprite strip, emblem and tinted card styles',async()=>{
 const monster_materials={'ice-bone':2,'wood-zulu':3,'wood-alpha':4,'dark-eye':1};
 const mats=[
  {slug:'wood-zulu',name:'Zulu Root',type:'monster_material',sourceBiome:'Verdant Woods'},
  {slug:'ice-bone',name:'Ice Bone',type:'monster_material',sourceBiome:'Frozen Peaks'},
  {slug:'wood-alpha',name:'Alpha Root',type:'monster_material',sourceBiome:'Verdant Woods'},
  {slug:'dark-eye',name:'Dark Eye',type:'monster_material',sourceBiome:'Umbral Rift'},
  {slug:'abyssal-ember',name:'Abyssal Ember',type:'rare'}
 ];
 const snapshot={codex:{tiers:{},awaken:{rows:{'1':[{current:0,target:1,gold:'1000',monster_materials,
  extra_materials:[{slug:'abyssal-ember',quantity:1}],failure:0.63}]},transitions:[]}},materials:mats};
 const html=quickUpgradeContent(snapshot,{fromStage:'A1',fromLevel:0,toStage:'A1',toLevel:1,quantity:3});
 assert.ok(html.includes('data-material-section="monsters" open'));
 assert.ok(html.includes('data-material-section="special"'));
 assert.match(html,/data-path-zone="verdant-woods"/);
 assert.match(html,/data-path-zone="frozen-peaks"/);
 assert.match(html,/data-path-zone="umbral-rift"/);
 assert.ok(html.indexOf('data-path-zone="verdant-woods"')<html.indexOf('data-path-zone="frozen-peaks"'));
 assert.ok(html.indexOf('data-path-zone="frozen-peaks"')<html.indexOf('data-path-zone="umbral-rift"'));
 assert.ok(html.indexOf('Alpha Root')<html.indexOf('Zulu Root'));
 assert.ok(html.indexOf('data-path-zone="umbral-rift"')<html.indexOf('Gold &amp; rare materials'));
 assert.match(html,/--path-zone-color:#65BD75/);
 assert.match(html,/--path-zone-color:#78C9F3/);
 assert.match(html,/--path-zone-color:#AD80F0/);
 assert.match(html,/<span class="quickZoneGlyph"><svg aria-hidden="true"/);
 assert.match(html,/<details class="quickZoneGroup"[^>]+ open>/);
 const css=await readFile(new URL('../quick-tools.css',import.meta.url),'utf8');
 assert.match(css,/url\('\/assets\/official-art\/biomes\.webp'\)/);
 assert.match(css,/\.quickZoneHead/);
 assert.match(css,/\.quickZoneContents/);
 assert.match(css,/var\(--path-zone-color\)/);
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/details\[data-path-zone\]/);
 assert.match(app,/panelKey\(d\)/);
});
