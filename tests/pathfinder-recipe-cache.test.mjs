import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPathfinderRecipeCache,isVerifiedPathfinderRecipe} from '../src/pathfinder-recipe-cache.mjs';
const sample=()=>({
 sourceVersion:'verified-fixture-v1',
 codex:{
  tiers:{'6':{rows:Array.from({length:30},(_,i)=>({current:i,target:i+1,gold:'12'}))}},
  tier_upgrades:Array.from({length:5},(_,i)=>({from_tier:i+1,to_tier:i+2,gold:'100'})),
  awaken:{rows:{'30':Array.from({length:30},(_,i)=>({current:i,target:i+1,gold:'13'}))},transitions:Array.from({length:30},(_,i)=>({rank:i+1,gold:'150'}))}
 },
 materials:Array.from({length:40},(_,i)=>({slug:'material-'+i,name:'Material '+i}))
});
test('verified source creates a durable cache and restart serves it offline',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'pf-cache-'));
 try{
  const file=join(dir,'cache','recipes.json'),original=sample();
  const first=createPathfinderRecipeCache({file,fetchFresh:async()=>original});
  assert.deepEqual(await first.get(),original);
  assert.deepEqual(JSON.parse(await readFile(file,'utf8')),original);
  const logs=[];
  const second=createPathfinderRecipeCache({file,fetchFresh:async()=>{throw Error('Upstream down')},warn:(...parts)=>logs.push(parts)});
  assert.deepEqual(await second.get(),original);
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(logs.some(([label])=>label==='PATHFINDER_CACHE_USING_VERIFIED_SNAPSHOT'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('invalid partial data cannot be labeled a verified snapshot',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'pf-cache-'));
 try{
  const file=join(dir,'recipes.json');
  assert.equal(isVerifiedPathfinderRecipe({sourceVersion:'test',codex:{},materials:[]}),false);
  const cache=createPathfinderRecipeCache({file,fetchFresh:async()=>({codex:{},materials:[]})});
  await assert.rejects(cache.get(),/Incomplete verified Pathfinder source/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('expired verified snapshot remains available when refresh fails',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'pf-cache-'));
 try{
  let now=100,call=0;
  const file=join(dir,'recipes.json'),data=sample();
  const cache=createPathfinderRecipeCache({file,clock:()=>now,refreshMs:100,fetchFresh:async()=>{call++;if(call>1)throw Error('offline');return data;}});
  await cache.get();now=300;
  assert.deepEqual(await cache.get(),data);
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(await cache.get(),data);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('concurrent misses fetch exactly once',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'pf-cache-'));
 try{
  let count=0;
  const cache=createPathfinderRecipeCache({file:join(dir,'recipes.json'),fetchFresh:async()=>{count++;return sample();}});
  await Promise.all(Array.from({length:8},()=>cache.get()));
  assert.equal(count,1);
 }finally{await rm(dir,{recursive:true,force:true});}
});
