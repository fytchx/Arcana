import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeItemQuantity,quoteRange,saveRange,readRange} from '../src/pathfinder-range.js';
import {quickUpgradeContent,quickUpgradePanel} from '../src/quick-tools-view.js';
import {readFile} from 'node:fs/promises';
// Synthetic fixtures verify arithmetic and markup; no game prices are invented.
const fixture={source:'Unit-test fixture',codex:{tiers:Object.fromEntries(Array.from({length:6},(_,i)=>[String(i+1),{name:'Tier '+(i+1),max_level:1,rows:[{current:0,target:1,gold:'100',fragment_slug:'iron',fragments:2}]}])),tier_upgrades:[],awaken:{rows:Object.fromEntries(Array.from({length:30},(_,i)=>[String(i+1),[{current:0,target:1,gold:'1000',monster_materials:{alpha:3,beta:2,gamma:4},extra_materials:[{slug:'abyssal-ember',quantity:1}]}]])),transitions:Array.from({length:30},(_,i)=>({rank:i+1,gold:'500',materials:[]}))}},materials:[{slug:'alpha',name:'Alpha',type:'monster_material',sourceBiome:'First Biome',monster_id:1},{slug:'beta',name:'Beta',type:'monster_material',sourceBiome:'Second Biome',monster_id:2},{slug:'gamma',name:'Gamma',type:'monster_material',sourceBiome:'Third Biome',monster_id:3},{slug:'abyssal-ember',name:'Abyssal Ember',type:'rare'}]};
const catalog=[{id:'game:biome:1',gameKind:'biome',title:'First Biome',facts:[['Unlock Monster Level','10']]},{id:'game:biome:2',gameKind:'biome',title:'Second Biome',facts:[['Unlock Monster Level','20']]},{id:'game:biome:3',gameKind:'biome',title:'Third Biome',facts:[['Unlock Monster Level','30']]}];
const range={fromStage:'A4',fromLevel:0,toStage:'A5',toLevel:1};
test('quantity scales all route costs and retains per-item costs',()=>{
 const one=quoteRange(fixture,range),many=quoteRange(fixture,{...range,quantity:10});
 assert.equal(many.itemCount,10);assert.equal(many.gold,one.gold*10n);assert.equal(many.steps,one.steps*10);
 for(const m of one.materials)assert.equal(many.materials.find(x=>x.slug===m.slug).quantity,m.quantity*10n);
 assert.equal(many.perItem.gold,one.gold);
});
test('quantity bounds and old saved plans work',()=>{
 assert.equal(normalizeItemQuantity(undefined),1);assert.equal(normalizeItemQuantity(-2),1);assert.equal(normalizeItemQuantity(10000),100);
 const v=new Map(),store={getItem:k=>v.get(k),setItem:(k,d)=>v.set(k,d)};
 assert.deepEqual(saveRange(range,store),range);assert.deepEqual(readRange(store),range);
 assert.equal(saveRange({...range,quantity:10},store).quantity,10);
});
test('native calculator alphabetizes monster drops before collapsed gold and rare materials',()=>{
 const html=quickUpgradePanel(fixture,{...range,quantity:10},{page:true,catalog});
 for(const x of ['pathItemQuantity','data-path-quantity-step="1"','10 items','First Biome','Second Biome','Third Biome','Other upgrade materials','Abyssal Ember','data-pf-save-list','data-route="wiki/reference"'])assert.ok(html.includes(x),x);
 assert.ok(html.indexOf('Alpha')<html.indexOf('Beta'));assert.ok(html.indexOf('Beta')<html.indexOf('Gamma'));
 assert.ok(html.indexOf('Gamma')<html.indexOf('Other upgrade materials'));
 assert.match(html,/data-material-section="monsters"/);assert.match(html,/data-material-section="special"/);
 assert.match(html,/<details[^>]*data-material-section="monsters"[^>]*open/);
 assert.doesNotMatch(html,/<details[^>]*data-material-section="special"[^>]*open/);
 assert.match(html,/data-path-accordion="route" open/);
});
test('incomplete recipe prevents total display',()=>{
 const bad=structuredClone(fixture);bad.codex.awaken.transitions=[];
 const html=quickUpgradeContent(bad,{...range,quantity:10},{page:true,catalog});
 assert.match(html,/Some verified upgrade costs are missing/);assert.doesNotMatch(html,/quickFarmFirst|quickGoldBlock/);
});
test('new UI consumes native site theme and designer CSS tokens',async()=>{
 const css=await readFile(new URL('../quick-tools.css',import.meta.url),'utf8');
 const theme=await readFile(new URL('../src/theme.js',import.meta.url),'utf8');
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 for(const x of ['--theme-main','--theme-secondary','--theme-highlight','--arcana-card-radius'])assert.ok(css.includes('var('+x),x);
 assert.match(theme,/applyDesign\(root\)/);assert.match(app,/catalog:verifiedState\.entries/);assert.match(app,/data-path-quantity-step/);
});
