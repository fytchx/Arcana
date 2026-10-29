import test from 'node:test';
import assert from 'node:assert/strict';
import {ML_XP_BIOMES,ML_XP_RANGE,ML_XP_SCREENSHOTS,parseMlXpNumber,modelRequiredXp,projectMlXp,normalizeMlXpPlan,saveMlXpPlan,readMlXpPlan,mlXpCalculatorView} from '../src/ml-xp-calculator.js';

test('data range is bounded, and compact input accepts familiar game suffixes',()=>{
 assert.deepEqual(ML_XP_RANGE,{min:184,max:571});
 assert.equal(modelRequiredXp(183),null);
 assert.equal(modelRequiredXp(572),null);
 assert.equal(parseMlXpNumber('309.79K'),309790);
 assert.equal(parseMlXpNumber('2.25m'),2250000);
 assert.equal(parseMlXpNumber('xyz'),null);
});
test('estimated requirements remain inside the actual screenshot display precision across ML 184–571',()=>{
 const measured={
  184:124490,210:189520,216:207520,234:268890,247:320470,
  250:333270,260:378440,262:387940,271:432650,284:502930,
  285:508620,290:537670,291:543600,297:580040,303:617930,
  304:624390,307:644000,310:663970,312:677490,315:698070,
  317:711980,328:791350,329:798800,332:821380,337:859790,
  355:1010000,356:1010000,377:1200000,400:1420000,
  420:1620000,482:2300000,559:3190000,571:3330000
 };
 for(const [level,v] of Object.entries(measured)){
  const model=modelRequiredXp(Number(level));
  const tolerance=Number(level)<350?6:5000; // .01K vs .01M on the screenshots
  assert.ok(Math.abs(model-v)<=tolerance,`ML ${level}: ${model} vs ${v}`);
  assert.ok(ML_XP_SCREENSHOTS[level]);
 }
 for(let lv=184;lv<571;lv++)assert.ok(modelRequiredXp(lv+1)>modelRequiredXp(lv),'Monotone curve at '+lv);
});
test('biome scaling reproduces the observed crown XP per kill',()=>{
 const levels={312:42.77,329:44.45,332:44.75,420:53.46,482:59.6};
 for(const [level,value] of Object.entries(levels)){
  const result=projectMlXp({level:Number(level),biome:'crown'});
  assert.equal(result.perKill,value);
 }
 const result=projectMlXp({level:332,biome:'rift',position:'strongest',current:'309.79K',killsPerSecond:'2'});
 assert.ok(Math.abs(result.perKill-44.748)<.001);
 assert.equal(result.remaining,result.needed-309790);
 assert.equal(result.kills,Math.ceil(result.remaining/result.perKill));
 assert.ok(result.timeSeconds>0);
});
test('unvalidated fighting levels require user-entered observed xp per kill',()=>{
 const unknown=projectMlXp({level:571,biome:'glass'});
 assert.equal(unknown.perKill,null);
 assert.equal(unknown.kills,null);
 const observed=projectMlXp({level:571,biome:'glass',measured:'15',position:'strongest'});
 assert.equal(observed.perKill,16.5);
 assert.ok(observed.kills>0);
});
test('fighting ML is independent from current ML, with no unverified auto-cap above 500',()=>{
 const fight180=projectMlXp({level:216,biome:'glass',fighting:'180'});
 assert.equal(fight180.perKill,20.25);
 assert.equal(fight180.needed,modelRequiredXp(216));
 const fight500=projectMlXp({level:559,biome:'crown',fighting:'500'});
 assert.equal(fight500.perKill,61.38);
 assert.ok(Math.abs(fight500.needed-3190000)<5000);
 const noCapClaim=projectMlXp({level:571,biome:'crown'});
 assert.equal(noCapClaim.perKill,null,'Do not assume an unverified fighting-level cap');
 assert.ok(Math.abs(noCapClaim.needed-3330000)<5000);
});
test('storage saves and reads independently of the existing comparator',()=>{
 const fake=new Map(),storage={getItem:key=>fake.get(key)||null,setItem:(key,value)=>fake.set(key,value)};
 saveMlXpPlan({level:328,biome:'rift',measured:'40.32'},storage);
 assert.equal(readMlXpPlan(storage).level,328);
 assert.equal(readMlXpPlan(storage).measured,'40.32');
 assert.equal(normalizeMlXpPlan({level:1000}).level,571);
});
test('rendered research UI labels uncertainty and exposes controls',()=>{
 const html=mlXpCalculatorView({level:332});
 assert.match(html,/not a recovered game formula/);
 assert.match(html,/data-mlxp="level"/);
 assert.match(html,/data-mlxp="measured"/);
 assert.match(html,/mlxpreset/);
 assert.match(html,/821.38K/);
 assert.equal(ML_XP_BIOMES.length,12);
});
