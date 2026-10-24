import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {endpointStage,normalizeOptimizerSliders,readOptimizerSliders,saveOptimizerSliders,totalUpgradeMaterials,upgradeOptimizerSliderView} from '../src/upgrade-optimizer-v2.js';
import {optimizerTierRanges,OPTIMIZER_TIER_DATA} from '../src/upgrade-optimizer-tier-data.js';

const fixture={
 codex:{
  tiers:Object.fromEntries(Array.from({length:6},(_,i)=>[String(i+1),{name:'Tier '+(i+1),max_level:i===0?4:i===1?9:i===2?14:i===3?19:i===4?24:30,
   rows:[{current:0,target:1,gold:'500',fragment_slug:'infernal-fragment',fragments:10,monster_materials:{'grubs-eye':2},fail:0,success:1}]}])),
  tier_upgrades:Array.from({length:5},(_,i)=>({from_tier:i+1,to_tier:i+2,gold:'20',failure:0,materials:[]})),
  awaken:{rows:Object.fromEntries(Array.from({length:30},(_,i)=>[String(i+1),[{current:0,target:1,gold:'500',fragment_slug:'infernal-fragment',fragments:10,monster_materials:{'grubs-eye':2},fail:0,success:1}]])),
   transitions:Array.from({length:30},(_,i)=>({rank:i+1,gold:'25',failure:0,materials:[]}))}
 },
 materials:[{slug:'infernal-fragment',name:'Infernal Fragment',type:'fragment'}, {slug:'grubs-eye',name:"Grub's Eye",type:'monster_material',monster_id:1,sourceBiome:'Verdant Woods'}]
};
test('rarity and awakening sliders map precisely to Pathfinder checkpoint IDs',()=>{
 assert.equal(endpointStage({rarity:5,awaken:0,level:24}),'T5');
 assert.equal(endpointStage({rarity:6,awaken:0,level:0}),'T6');
 assert.equal(endpointStage({rarity:6,awaken:5,level:24}),'A5');
 const p=normalizeOptimizerSliders({items:[{itemKey:'sandals-of-starszy|Chainmail Boots',current:{rarity:5,awaken:8,level:47},target:{rarity:6,awaken:6,level:30}}]});
 assert.deepEqual(p.items[0].current,{rarity:5,awaken:0,level:24});
 assert.deepEqual(p.items[0].target,{rarity:6,awaken:6,level:30});
});
test('combined materials sum matching slugs from multiple items',()=>{
 const items=[0,1].map(()=>({itemKey:'sandals-of-starszy|Chainmail Boots',current:{rarity:6,awaken:1,level:0},target:{rarity:6,awaken:1,level:1}}));
 const q=totalUpgradeMaterials(fixture,items,'min');
 assert.equal(q.ready,2);
 assert.equal(q.materials.find(m=>m.slug==='grubs-eye').quantity,4n);
 assert.equal(q.materials.find(m=>m.slug==='infernal-fragment').quantity,20n);
 assert.equal(q.gold,1000n);
});
test('planner starts genuinely empty and only presents material totals after adding gear',()=>{
 const html=upgradeOptimizerSliderView(fixture,[]);
 assert.match(html,/No equipment added/);
 assert.match(html,/Add equipment/);
 assert.match(html,/Clear all/);
 assert.doesNotMatch(html,/Chainmail Boots/);
 assert.doesNotMatch(html,/Farming list/);
 assert.doesNotMatch(html,/data-uo-field="rarity"/);
});
test('sliders save independently from the damage calculator and preserve multiple candidates',()=>{
 const map=new Map(),store={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 const initial=normalizeOptimizerSliders();
 assert.deepEqual(saveOptimizerSliders(initial,store),readOptimizerSliders(store));
 assert.equal(initial.items.length,0);
 assert.ok([...map.keys()][0].includes('upgrade-optimizer'));
 // Previously saved sample entries must not be imported from the old version.
 const old=new Map([['arcana-upgrade-optimizer-sliders-v2',JSON.stringify({items:[{itemKey:'sandals-of-starszy|Chainmail Boots'}]})]]);
 assert.deepEqual(readOptimizerSliders({getItem:key=>old.get(key)}).items,[]);

});
test('app points to latest optimizer without changing damage calculator route',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/upgradeOptimizerSliderView/);
 assert.match(app,/wireUpgradeOptimizerSliders/);
 assert.match(app,/case 'calculators\/damage':return calcDamage\(\)/);
});

test('October 21 source ranges include all forty base items and newer special implicits',()=>{
 assert.equal(OPTIMIZER_TIER_DATA.size,40);
 assert.deepEqual(optimizerTierRanges('pathfinder-treads',6).secondary,{stat:'gold_exp_gain',min:18,max:20});
 assert.deepEqual(optimizerTierRanges('wardplate',6).secondary,{stat:'flat_damage_reduction',min:4,max:5});
});

test('clear-all state can persist as an empty list and the last item can be removed',()=>{
 const bag=new Map(),store={getItem:key=>bag.get(key),setItem:(key,value)=>bag.set(key,value)};
 const withOne=normalizeOptimizerSliders({items:[{itemKey:'rags|Chainmail Armor',current:{rarity:6,awaken:3,level:10},target:{rarity:6,awaken:4,level:0}}]});
 assert.equal(withOne.items.length,1);
 withOne.items.splice(0,1);
 saveOptimizerSliders(withOne,store);
 assert.deepEqual(readOptimizerSliders(store).items,[]);
});
