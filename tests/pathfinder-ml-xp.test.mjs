import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PATHFINDER_ML_MIN,PATHFINDER_ML_MAX,PATHFINDER_ML_BIOMES,
 PATHFINDER_ML_OBSERVED,requiredMlXp,calculatePathfinderMlXp,
 pathfinderMlXpView,pathfinderMlXpResults,readPathfinderMlXp,
 savePathfinderMlXp,normalizePathfinderMlXp} from '../src/pathfinder-ml-xp.js';

test('one-shot ML XP is strictly bounded to levels 185 through 500',()=>{
 assert.equal(PATHFINDER_ML_MIN,185);
 assert.equal(PATHFINDER_ML_MAX,500);
 assert.equal(requiredMlXp(184),null);
 assert.equal(requiredMlXp(501),null);
 assert.equal(normalizePathfinderMlXp({level:10}).level,185);
 assert.equal(normalizePathfinderMlXp({level:900}).level,500);
 assert.equal(PATHFINDER_ML_BIOMES.length,12);
 let prev=0;
 for(let ml=185;ml<=500;ml++){
  const xp=requiredMlXp(ml);
  assert.ok(Number.isInteger(xp)&&xp>prev,'ML '+ml+' requirement must be positive and increasing');
  prev=xp;
 }
});
test('requirements match player screenshots within their display precision',()=>{
 const checks={210:189520,216:207520,234:268890,250:333270,285:508620,
 290:537670,312:677490,329:798800,332:821380,337:859790,
 355:1010000,400:1420000,420:1620000,482:2300000};
 for(const [ml,value] of Object.entries(checks)){
  const tolerance=value>=1000000?5000:6;
  assert.ok(Math.abs(requiredMlXp(Number(ml))-value)<=tolerance,
   'ML '+ml+' is within screenshot rounding');
  assert.ok(PATHFINDER_ML_OBSERVED[ml]);
 }
});
test('one-shot comparison shows three mutually ordered outcomes for every ML and eligible biome',()=>{
 for(let ml=185;ml<=500;ml++){
  for(const biome of PATHFINDER_ML_BIOMES.slice(2)){
   const {variants,required}=calculatePathfinderMlXp({level:ml,biome:biome.id});
   assert.equal(variants.length,3);
   assert.ok(variants[0].xpPerKill<variants[1].xpPerKill);
   assert.ok(variants[1].xpPerKill<variants[2].xpPerKill);
   assert.ok(variants[0].kills>=variants[1].kills&&variants[1].kills>=variants[2].kills);
   for(const result of variants){
    assert.equal(result.kills,Math.ceil(required/result.xpPerKill));
   }
  }
 }
});
test('ML 332 crown matches screenshot-grounded biome XP and rounded one-shot kill counts',()=>{
 const result=calculatePathfinderMlXp({level:332,biome:'crown'});
 assert.equal(result.requiredDisplay,'821.38K');
 assert.deepEqual(result.variants.map(x=>x.xpPerKill),[40.28,44.75,49.23]);
 assert.deepEqual(result.variants.map(x=>x.kills),[20392,18355,16685]);
 assert.equal(result.observed,'821.38K');
 const html=pathfinderMlXpResults({level:332,biome:'crown'});
 assert.match(html,/≈20,390/);
 assert.match(html,/≈18,360/);
 assert.match(html,/≈16,690/);
});
test('first two biomes do not invent a ±10% monster position modifier',()=>{
 for(const biome of ['verdant','scorched']){
  const {variants,modifiersAvailable}=calculatePathfinderMlXp({level:300,biome});
  assert.equal(modifiersAvailable,false);
  assert.equal(variants[0].xpPerKill,variants[1].xpPerKill);
  assert.equal(variants[1].kills,variants[2].kills);
 }
 assert.match(pathfinderMlXpResults({level:300,biome:'verdant'}),/do not use the ±10%/);
});
test('ML and biome persist independently, invalid inputs are sanitized',()=>{
 const mem=new Map(),storage={getItem:k=>mem.get(k)||null,setItem:(k,value)=>mem.set(k,value)};
 const saved=savePathfinderMlXp({level:486,biome:'rift'},storage);
 assert.deepEqual(readPathfinderMlXp(storage),saved);
 assert.deepEqual(normalizePathfinderMlXp({level:'nonsense',biome:'void'}),{level:300,biome:'crown'});
});
test('compact Pathfinder UI has only the ML and biome controls and three results',()=>{
 const html=pathfinderMlXpView({level:332,biome:'crown'});
 assert.match(html,/id="pathMlXpPanel"/);
 assert.match(html,/data-path-ml-range/);
 assert.match(html,/data-path-ml-level/);
 assert.match(html,/data-path-ml-biome/);
 assert.match(html,/data-path-ml-step="-1"/);
 assert.match(html,/data-path-ml-preset="500"/);
 assert.equal((html.match(/class="pathMlCard pathMlCard--/g)||[]).length,3);
 assert.doesNotMatch(html,/killsPerSecond|data-mlxp="measured"|data-mlxp="current"|Estimated farming time/);
 assert.match(html,/one-shotting/);
 assert.match(html,/not a recovered game formula/);
});
test('ML XP tab is integrated into existing Pathfinder navigation and theme, not a new standalone route',async()=>{
 const files=await Promise.all(['../src/app.js','../src/launch-navigation.js','../quick-tools.css'].map(path=>readFile(new URL(path,import.meta.url),'utf8')));
 const [app,nav,css]=files;
 assert.match(app,/import \{pathfinderMlXpView,pathfinderMlXpResults,readPathfinderMlXp,savePathfinderMlXp\}/);
 assert.match(app,/\['ml','ML XP','sword'\]/);
 assert.match(app,/selected==='ml'\?pathfinderMlXpView\(state\.pathfinderMlXp\)/);
 assert.match(app,/wirePathfinderMlXp\(\)/);
 assert.match(nav,/\{view:'ml'\}/);
 assert.match(css,/\.pathMlXp\{/);
 assert.match(css,/@media\(max-width:620px\)/);
});
