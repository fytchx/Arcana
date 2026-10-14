import test from 'node:test';
import assert from 'node:assert/strict';
import {quoteUpgrade,planGearUpgrades,normalizePathfinderPlan,stagesFor} from '../src/pathfinder-engine.js';
import {pathfinderView,buildProgressionView,readPathfinderPlan,savePathfinderPlan} from '../src/pathfinder-views.js';

const data={source:'Unit source',codex:{tiers:Object.fromEntries(Array.from({length:6},(_,i)=>[String(i+1),{name:'Tier '+(i+1),max_level:1,rows:[{current:0,gold:'100',fragment_slug:'iron-fragment',fragments:2,monster_materials:{'spider-fang':4},fail:.5,success:.5}]}])),
tier_upgrades:Array.from({length:5},(_,i)=>({from_tier:i+1,gold:'50',essence:{slug:'uncommon-essence',quantity:1},monster_materials:{}})),
awaken:{rows:Object.fromEntries(Array.from({length:30},(_,i)=>[String(i+1),[{current:0,gold:'1000',fragment_slug:'infernal-fragment',fragments:3,monster_materials:{'ogre-bone':5}}]])),
transitions:Array.from({length:30},(_,i)=>({rank:i+1,gold:'300',materials:[{slug:'eternal-sigil',quantity:1}]}))}},
materials:[{slug:'spider-fang',name:'Spider Fang',type:'monster_material',monster_id:12},{slug:'iron-fragment',name:'Iron Fragment',type:'fragment'},{slug:'eternal-sigil',name:'Eternal Sigil'}]};
const gear={weapon:{id:'game:item:starter',rarity:1,awaken:0},chest:{id:'game:item:body',rarity:1,awaken:0}};
test('all-gear engine computes every upgrade stage and aggregates quantities',()=>{
 assert.equal(stagesFor(data).length,36);
 const plan=normalizePathfinderPlan({targets:{weapon:{stage:'T1',level:1},chest:{stage:'T1',level:1}},inventory:{'spider-fang':'3'}});
 const result=planGearUpgrades(gear,plan,data);
 assert.equal(result.steps,2);
 assert.equal(result.gold,200n);
 assert.equal(result.materials.find(x=>x.slug==='spider-fang').required,8n);
 assert.equal(result.materials.find(x=>x.slug==='spider-fang').missing,5n);
 assert.equal(result.equipment.length,2);
});
test('transition and awakening include all source materials and never project beyond A30',()=>{
 const route=quoteUpgrade(data,'T6',1,'A1',1);
 assert.equal(route.gold,1300n);
 assert.equal(route.materials['eternal-sigil'].quantity,1n);
 assert.equal(route.materials['ogre-bone'].quantity,5n);
 assert.equal(quoteUpgrade(data,'T6',1,'A31',0).ok,false);
 assert.equal(quoteUpgrade(data,'A2',0,'A1',0).ok,false);
});
test('failed attempts estimate is separate from exact base recipe and preserves 30% refund',()=>{
 const q=quoteUpgrade(data,'T1',0,'T1',1,true);
 assert.equal(q.gold,200n);
 assert.equal(q.goldBase,100n);
 assert.equal(q.materials['spider-fang'].base,4n);
 assert.equal(q.materials['spider-fang'].quantity,7n);
});
test('missing recipe never silently becomes a zero-cost upgrade',()=>{
 const clone=structuredClone(data);clone.codex.tiers['1'].rows=[];
 const q=quoteUpgrade(clone,'T1',0,'T1',1);
 assert.ok(q.incomplete);
 assert.match(q.warnings.join(' '),/Missing verified cost/);
});
test('measured rates produce estimates without inventing drop rates',()=>{
 const p=normalizePathfinderPlan({targets:{weapon:{stage:'T1',level:1}},inventory:{'spider-fang':2},rates:{'spider-fang':{perMinute:2}}});
 const result=planGearUpgrades(gear,p,data);
 assert.equal(result.materials.find(x=>x.slug==='spider-fang').minutes,1);
 assert.ok(result.unknownRates>0);
});
test('local persistence roundtrips and view renders shared targets',()=>{
 const m=new Map();
 const store={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)};
 const p=savePathfinderPlan({targets:{weapon:{stage:'A1',level:0}},currentLevels:{weapon:1}},store);
 assert.deepEqual(readPathfinderPlan(store),p);
 assert.match(buildProgressionView(gear,p,data),/data-pf-stage="weapon"/);
 assert.match(pathfinderView(gear,p,data),/data-pf-owned="spider-fang"/);
});
