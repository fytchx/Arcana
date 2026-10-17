import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {quickUpgradePanel,quickUpgradeContent,initialQuickRange} from '../src/quick-tools-view.js';
import {quoteRange,saveRange,readRange} from '../src/pathfinder-range.js';
import {DEFAULT_DAMAGE_LAB,normalizeDamageLab,estimateDamageLab,damageLabView,saveDamageLab,readDamageLab} from '../src/damage-lab.js';
import {homeScreen} from '../src/launch-navigation.js';
const fixture={
 source:'Fixture',sourceVersion:'Fixtures',
 codex:{tiers:Object.fromEntries(Array.from({length:6},(_,i)=>[String(i+1),{name:'Tier '+(i+1),max_level:2,rows:[{current:0,target:1,gold:'100',fragment_slug:'iron',fragments:1},{current:1,target:2,gold:'200',fragment_slug:'iron',fragments:2}]}])),
 tier_upgrades:Array.from({length:5},(_,i)=>({from_tier:i+1,to_tier:i+2,gold:'100',monster_materials:{'stone':1}})),
 awaken:{rows:Object.fromEntries(Array.from({length:30},(_,i)=>[String(i+1),[
  {current:0,target:1,gold:'1000',fragment_slug:'silver',fragments:1},
  {current:1,target:2,gold:'2000',fragment_slug:'silver',fragments:2}
 ]])),transitions:Array.from({length:30},(_,i)=>({rank:i+1,gold:'300',materials:[{slug:'core',quantity:3}]}))}},
 materials:[{slug:'iron',name:'Iron'},{slug:'silver',name:'Silver'},{slug:'stone',name:'Stone'},{slug:'core',name:'Core'}]
};
test('homepage preserves Build Studio and presents only three destinations',()=>{
 const home=homeScreen();
 assert.ok(home.indexOf('class="launchHero"')<home.indexOf('class="launchQuick"'));
 assert.equal((home.match(/class="launchQuickCard"/g)||[]).length,3);
 assert.doesNotMatch(home,/quickDashboard|quickActions|id="pathRangeContent"|data-route="calculators\/pet"|data-route="calculators\/damage"/);
 for(const id of ['pathfinder','tools','builds'])assert.match(home,new RegExp('data-arg="'+id+'"'));
});
test('first-use calculator defaults to A1 +0 → A2 +0 while preserving saved checkpoints',()=>{
 const full=structuredClone(fixture);for(const level of Object.values(full.codex.awaken.rows)){
  while(level.length<30)level.push({...level.at(-1),current:level.length,target:level.length+1});
 }
 const q=initialQuickRange(full,{});
 assert.equal(q.fromStage,'A1');assert.equal(q.toStage,'A2');
 assert.equal(q.fromLevel,0);assert.equal(q.toLevel,0);
 const saved=initialQuickRange(full,{fromStage:'A3',fromLevel:9,toStage:'A9',toLevel:16});
 assert.deepEqual({fromStage:saved.fromStage,fromLevel:saved.fromLevel,toStage:saved.toStage,toLevel:saved.toLevel},{fromStage:'A3',fromLevel:9,toStage:'A9',toLevel:16});
});
test('quick upgrade rendering uses source-backed quote and clear failure guards',()=>{
 const html=quickUpgradePanel(fixture,{fromStage:'T1',fromLevel:0,toStage:'T1',toLevel:2});
 const result=quoteRange(fixture,{fromStage:'T1',fromLevel:0,toStage:'T1',toLevel:2});
 assert.equal(result.gold,300n);
 for(const token of ['data-path-from-stage','data-path-from-level','data-path-to-stage','data-path-to-level','Gold','300','Iron','Recipe material and Gold totals'])assert.ok(html.includes(token),token);
 assert.match(quickUpgradeContent(null,{}),/Loading game upgrade recipes/);
 const back=quickUpgradeContent(fixture,{fromStage:'A2',fromLevel:1,toStage:'A1',toLevel:1});
 assert.match(back,/target must be after/);
 assert.doesNotMatch(back,/quickTotals/);
});
test('damage lab explicitly models uncertain behavior and remains no-setup',()=>{
 const baseline=estimateDamageLab({...DEFAULT_DAMAGE_LAB,base:1000,attackBonus:0,critChance:0,doubleHit:0,doubleDamage:0,aStat:'attackBonus',aValue:20,bStat:'doubleDamage',bValue:10});
 assert.equal(baseline.baseline,1000);assert.ok(Math.abs(baseline.a.gain-20)<1e-9);assert.ok(Math.abs(baseline.b.gain-10)<1e-9);
 assert.equal(estimateDamageLab({base:100,critChance:50,critBonus:50,doubleHit:0,doubleDamage:0}).baseline,125);
 assert.equal(estimateDamageLab({scope:'retaliation',base:1000,attackBonus:500,aStat:'attackBonus',aValue:600,bStat:'doubleDamage',bValue:10}).a.gain,0,'Retaliation cannot inherit normal weapon AD as a multiplier');
 const html=damageLabView({});
 for(const phrase of ['hypothetical','not IdleArc','INT%','Double Hit Chance','Double Damage Chance','Option A','Option B','damage per trigger'])assert.ok(html.includes(phrase),phrase);
 assert.ok(!html.includes('Verified DPS'));
});
test('damage inputs are bounded and stored independently of Build Studio',()=>{
 const normalized=normalizeDamageLab({base:'Infinity',critChance:9999,doubleDamage:-9,aStat:'notallowed',aValue:55});
 assert.equal(normalized.base,DEFAULT_DAMAGE_LAB.base);assert.equal(normalized.critChance,100);assert.equal(normalized.doubleDamage,0);assert.equal(normalized.aStat,'attackBonus');
 const saved=new Map(),store={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
 saveDamageLab({base:123456,doubleHit:20},store);
 assert.equal(readDamageLab(store).base,123456);
 assert.equal(readDamageLab(store).doubleHit,20);
});
test('Pathfinder uses verified recipes and the homepage has no calculator',async()=>{
 const [app,page,server]=await Promise.all(['../src/app.js','../index.html','../server.mjs'].map(x=>readFile(new URL(x,import.meta.url),'utf8')));
 assert.match(app,/function home\(\)\{return homeScreen\(\);\}/);
 assert.match(app,/quickUpgradePanel\(recipeState.data,state.pathfinderRange/);
 assert.match(app,/quickUpgradeContent\(recipeState\.data,current/);
 assert.match(app,/initialQuickRange\(payload,state\.pathfinderRange\)/);
 assert.match(app,/case 'calculators\/damage':return layout\('Damage Calculator','ARCANA LABS',damageCalculatorView\(\),'calculator'\)/);
 assert.match(app,/function pathfinderHub\(legacyView='range'\)/);
 assert.match(page,/quick-tools\.css/);assert.match(server,/quick-tools\.css/);
 assert.match(page,/home-three\.css/);assert.match(server,/home-three\.css/);
});

test('upgrade checkpoints persist after leaving the calculator and reloading the site',()=>{
 const cache=new Map(),store={getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)};
 const input={fromStage:'A4',fromLevel:25,toStage:'A5',toLevel:30};
 saveRange(input,store);
 const restored=readRange(store);
 assert.deepEqual(restored,input);
 const full=structuredClone(fixture);
 for(const row of Object.values(full.codex.awaken.rows)){
  while(row.length<30)row.push({...row.at(-1),current:row.length,target:row.length+1});
 }
 assert.deepEqual(initialQuickRange(full,restored),input);
});
test('homepage navigation keeps wiki and guild recruitment accessible from global menu',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const nav=await readFile(new URL('../src/launch-navigation.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../home-three.css',import.meta.url),'utf8');
 for(const section of ["{id:'pathfinder'","{id:'tools'","{id:'builds'"])assert.ok(nav.includes(section));
 assert.match(nav,/Damage Calculator/);
 assert.match(app,/\['wiki','ArcanaWiki'/);
 assert.match(app,/\['lfg','Guild & Raid Finder'/);
 assert.doesNotMatch(app,/function calcDamage\(/);
 assert.doesNotMatch(app,/return damageLabView/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/overflow-y:visible!important/);
});
