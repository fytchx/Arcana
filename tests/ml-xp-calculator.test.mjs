import test from 'node:test';
import assert from 'node:assert/strict';
import {ML_XP_BIOMES,ML_XP_RANGE,ML_XP_SCREENSHOTS,parseMlXpNumber,modelRequiredXp,projectMlXp,normalizeMlXpPlan,saveMlXpPlan,readMlXpPlan,mlXpCalculatorView} from '../src/ml-xp-calculator.js';

test('data range is bounded, and compact input accepts familiar game suffixes',()=>{
 assert.deepEqual(ML_XP_RANGE,{min:184,max:482});
 assert.equal(modelRequiredXp(183),null);
 assert.equal(modelRequiredXp(483),null);
 assert.equal(parseMlXpNumber('309.79K'),309790);
 assert.equal(parseMlXpNumber('2.25m'),2250000);
 assert.equal(parseMlXpNumber('xyz'),null);
});
test('estimated requirement stays consistent with rounded screenshots',()=>{
 const expected={184:124490,247:320470,260:378440,262:387940,285:508620,290:537670,291:543600,304:624390,312:677490,328:791350,329:798800,332:821380,420:1620000,482:2300000};
 for(const [level,v] of Object.entries(expected)){
  const model=modelRequiredXp(Number(level));
  const tolerance=Number(level)>=420?10000:80;
  assert.ok(Math.abs(model-v)<tolerance,`ML ${level}: ${model} vs ${v}`);
  assert.ok(ML_XP_SCREENSHOTS[level]);
 }
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
 const unknown=projectMlXp({level:184,biome:'glass'});
 assert.equal(unknown.perKill,null);
 assert.equal(unknown.kills,null);
 const observed=projectMlXp({level:184,biome:'glass',measured:'15',position:'strongest'});
 assert.equal(observed.perKill,16.5);
 assert.ok(observed.kills>0);
});
test('storage saves and reads independently of the existing comparator',()=>{
 const fake=new Map(),storage={getItem:key=>fake.get(key)||null,setItem:(key,value)=>fake.set(key,value)};
 saveMlXpPlan({level:328,biome:'rift',measured:'40.32'},storage);
 assert.equal(readMlXpPlan(storage).level,328);
 assert.equal(readMlXpPlan(storage).measured,'40.32');
 assert.equal(normalizeMlXpPlan({level:1000}).level,482);
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
