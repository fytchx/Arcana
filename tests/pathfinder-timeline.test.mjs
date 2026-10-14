import test from 'node:test';
import assert from 'node:assert/strict';
import {PATHFINDER_SLOTS,readQuickView,saveQuickView,normalizeQuickView,timelineStages,timelineModel,stepCost,chapterTotal,stageStepLabel} from '../src/pathfinder-timeline.js';
import {pathfinderView,pathfinderStepDetail} from '../src/pathfinder-timeline-view.js';
import {readFile} from 'node:fs/promises';

const fixture={
 source:'Verified example',sourceVersion:'Test snapshot',
 codex:{
  tiers:Object.fromEntries(Array.from({length:6},(_,i)=>[String(i+1),{
   name:['Normal','Uncommon','Rare','Epic','Legendary','Infernal'][i],max_level:2,
   rows:[
    {current:0,target:1,gold:'1000',fragment_slug:'iron-fragment',fragments:5,monster_materials:{'spider-fang':10},fail:.2,success:.8},
    {current:1,target:2,gold:'2000',fragment_slug:'iron-fragment',fragments:8,monster_materials:{'spider-fang':12},extra_materials:[{slug:'stormglass-shard',quantity:2}],fail:.3,success:.7}
   ]}])),
  tier_upgrades:Array.from({length:5},(_,i)=>({from_tier:i+1,to_tier:i+2,gold:'5000',essence:{slug:'rare-essence',quantity:3},monster_materials:{'ogre-bone':4},failure:.1})),
  awaken:{
   rows:Object.fromEntries(Array.from({length:30},(_,i)=>[String(i+1),[
    {current:0,target:1,gold:'1200000',fragment_slug:'infernal-fragment',fragments:12,monster_materials:{'ogre-bone':3},extra_materials:[{slug:'eternal-sigil',quantity:1}],fail:.25,success:.75},
    {current:1,target:2,gold:'1500000',fragment_slug:'infernal-fragment',fragments:18,monster_materials:{'ogre-bone':7},fail:.25,success:.75}
   ]])),
   transitions:Array.from({length:30},(_,i)=>({rank:i+1,gold:'500000',materials:[{slug:'primeval-core',quantity:2}],failure:0}))
  }
 },
 materials:[
  {slug:'iron-fragment',name:'Iron Fragment'},
  {slug:'spider-fang',name:'Spider Fang'},
  {slug:'stormglass-shard',name:'Stormglass Shard'},
  {slug:'ogre-bone',name:'Ogre Bone'},
  {slug:'rare-essence',name:'Rare Essence'},
  {slug:'infernal-fragment',name:'Infernal Fragment'},
  {slug:'eternal-sigil',name:'Eternal Sigil'},
  {slug:'primeval-core',name:'Primeval Core'}
 ]
};
test('quick reference has eleven real slots and no inventory setup',()=>{
 assert.equal(PATHFINDER_SLOTS.length,11);
 assert.deepEqual(PATHFINDER_SLOTS.map(x=>x.id).includes('head'),true);
 assert.ok(!PATHFINDER_SLOTS.some(s=>s.id.includes('charm')||/utility/i.test(s.label)));
 assert.deepEqual(Object.keys(normalizeQuickView()),['slot','mode','stage','level']);
});
test('every normal tier and all 30 awakened ranks are browsable',()=>{
 assert.equal(timelineStages(fixture,'normal').length,6);
 assert.equal(timelineStages(fixture,'awakened').length,30);
 assert.equal(timelineStages(fixture,'awakened').at(-1).id,'A30');
 assert.equal(timelineModel(fixture,{mode:'awakened',stage:'A30',level:2}).steps.length,3);
});
test('individual upgrade lists all fragments, monster drops, extras and exact gold',()=>{
 const m=timelineModel(fixture,{mode:'normal',stage:'T1',level:2});
 assert.equal(m.step.gold,2000n);
 assert.equal(m.step.materials.find(x=>x.slug==='spider-fang').quantity,12n);
 assert.equal(m.step.materials.find(x=>x.slug==='stormglass-shard').quantity,2n);
 assert.equal(m.step.failureChance,.3);
 assert.match(pathfinderStepDetail(m),/2,000/);
 assert.match(pathfinderStepDetail(m),/Spider Fang/);
});
test('rarity transitions are part of the map and stage totals',()=>{
 const normal=timelineModel(fixture,{mode:'normal',stage:'T2',level:0});
 assert.equal(normal.step.gold,5000n);
 assert.equal(normal.step.materials.find(x=>x.slug==='ogre-bone').quantity,4n);
 assert.equal(normal.step.materials.find(x=>x.slug==='rare-essence').quantity,3n);
 assert.match(stageStepLabel(normal.active,0),/Tier 1 → Tier 2/);
 assert.equal(chapterTotal(fixture,normal.active).gold,8000n);
});
test('A1 begins with Infernal awakening; A2 begins with previous rank transition',()=>{
 const first=timelineModel(fixture,{mode:'awakened',stage:'A1',level:0});
 assert.equal(first.step.gold,500000n);
 assert.match(stageStepLabel(first.active,0),/Infernal → A1/);
 const second=timelineModel(fixture,{mode:'awakened',stage:'A2',level:0});
 assert.match(stageStepLabel(second.active,0),/A1 → A2/);
 assert.equal(second.step.materials.find(x=>x.slug==='primeval-core').quantity,2n);
});
test('no missing recipe is silently converted to zero cost',()=>{
 const broken=structuredClone(fixture);broken.codex.awaken.rows['2']=[];
 const stage=timelineStages(broken,'awakened').find(x=>x.id==='A2');
 assert.equal(stepCost(broken,stage,1),null);
 assert.equal(chapterTotal(broken,stage).complete,false);
 assert.match(pathfinderView({mode:'awakened',stage:'A2',level:1},broken),/Verified recipe unavailable/);
});
test('renders swipe map, level slider, mode switch and complete stage summary',()=>{
 const html=pathfinderView({mode:'awakened',stage:'A2',level:1,slot:'neck'},fixture);
 assert.match(html,/data-path-slot/);
 assert.match(html,/data-action="path-stage"/);
 assert.match(html,/data-action="path-mode"/);
 assert.match(html,/data-path-range/);
 assert.match(html,/id="pathStepRail"/);
 assert.match(html,/A2 \+0 → \+1/);
 assert.match(html,/Full A2 costs/);
 assert.doesNotMatch(html,/data-pf-owned|data-pf-rate|Current enhancement level/);
});
test('selected quick-view preferences survive refresh without affecting the build',()=>{
 const map=new Map();
 const store={getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value)};
 const pref=saveQuickView({slot:'chest',mode:'awakened',stage:'A30',level:23},store);
 assert.deepEqual(readQuickView(store),pref);
 assert.equal(normalizeQuickView({slot:'fake-utility',mode:'unexpected',stage:'A31',level:999}).stage,'T1');
 assert.equal(normalizeQuickView({slot:'fake-utility'}).slot,'head');
});
test('preview HTML and server serve timeline stylesheet; main logo remains intact',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const page=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../pathfinder-timeline.css',import.meta.url),'utf8');
 assert.match(app,/pathfinder-timeline-view\.js/);
 assert.match(app,/wirePathfinderQuick\(\)/);
 assert.match(page,/pathfinder-timeline\.css/);
 assert.match(server,/pathfinder-timeline\.css/);
 assert.match(page,/brandHome/);
 assert.match(css,/var\(--theme-highlight/);
});
