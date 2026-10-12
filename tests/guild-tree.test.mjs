import test from 'node:test';
import assert from 'node:assert/strict';
import {
 GUILD_BASE_NODES, freshGuildTree, guildPointBudget, guildTreeRule,
 allocateGuildPoint, removeGuildPoint, maxGuildPoints, guildTreeSpent,
 guildTreeCounts, validateGuildEvents, guildTreeFromLink,
 guildTreeLinkParams, guildBonusTotals, guildTreeWithLevel,
 saveGuildTree, readGuildTree, remainingGuildPoints
} from '../src/guild-tree-engine.js';

const allocate=(plan,id)=>{
 const out=allocateGuildPoint(plan,id);
 assert.equal(out.reason,null,'Expected '+id+' to be allocatable, got '+out.reason);
 return out.plan;
};
const first=GUILD_BASE_NODES[0].id;
const buildTo=(level,target)=>{
 let plan=freshGuildTree(level),guard=0;
 while(guildTreeSpent(plan)<target&&guard++<600){
  let progressed=false;
  for(const node of GUILD_BASE_NODES){
   if(guildTreeSpent(plan)>=target)break;
   const step=allocateGuildPoint(plan,node.id);
   if(!step.reason){plan=step.plan;progressed=true}
  }
  assert.equal(progressed,true,'No legal point allocation to '+target);
 }
 assert.equal(guildTreeSpent(plan),target);
 return plan;
};

test('Guild points match standard and Ascension progression',()=>{
 assert.equal(guildPointBudget(25),25);
 assert.equal(guildPointBudget(68),68);
 assert.equal(guildPointBudget(69),70);
 assert.equal(guildPointBudget(80),92);
 assert.equal(remainingGuildPoints(freshGuildTree(25)),25);
});

test('Rank four requires 15 spent, rank seven requires 35',()=>{
 let plan=freshGuildTree(80);
 for(let i=0;i<3;i++)plan=allocate(plan,first);
 assert.match(guildTreeRule(plan,first),/12 more points/);
 plan=buildTo(80,15);
 assert.equal(guildTreeRule(plan,first),null);
 for(let i=0;i<3;i++)plan=allocate(plan,first);
 assert.match(guildTreeRule(plan,first),/more points to unlock rank 7/);
 plan=buildTo(80,35);
 assert.equal(guildTreeRule(plan,first),null);
});

test('Maximum action stops at unlock gates instead of exceeding rank limits',()=>{
 let plan=freshGuildTree(80);
 const full=maxGuildPoints(plan,first);
 assert.equal(full.added,3);
 assert.equal(guildTreeCounts(full.plan.events)[first],3);
 assert.equal(guildTreeRule(full.plan,first)!==null,true);
 assert.equal(guildTreeSpent(full.plan),3);
});

test('Share links restore allocation, level and selected boost',()=>{
 let plan=buildTo(80,21);
 plan={...plan,boost:1.5};
 const url=new URLSearchParams(guildTreeLinkParams(plan));
 const imported=guildTreeFromLink(url);
 assert.deepEqual(imported,plan);
 assert.equal(validateGuildEvents(80,'unknown').events,'');
 assert.equal(guildTreeFromLink(new URLSearchParams('l=4&p=ZZZZ')).events,'');
});

test('Lowering level safely drops points beyond the new budget',()=>{
 const plan=buildTo(80,60);
 const reduced=guildTreeWithLevel(plan,18);
 assert.ok(guildTreeSpent(reduced)<=18);
 assert.equal(reduced.level,18);
});

test('Undo-friendly deterministic refunds reject invalid dependent allocations',()=>{
 let plan=buildTo(80,21);
 const id=GUILD_BASE_NODES[3].id;
 const count=guildTreeCounts(plan.events)[id];
 const refund=removeGuildPoint(plan,id);
 if(!refund.reason){
  assert.equal(guildTreeCounts(refund.plan.events)[id],count-1);
  assert.equal(guildTreeSpent(refund.plan),20);
 }
 assert.equal(removeGuildPoint(freshGuildTree(20),id).reason,'No ranks to refund');
});

test('Ascension mastery unlock and rank caps respect Guild level',()=>{
 let plan=buildTo(80,68);
 assert.equal(guildTreeRule(plan,'mastery'),null);
 for(let i=0;i<12;i++)plan=allocate(plan,'mastery');
 assert.match(guildTreeRule(plan,'mastery'),/capped/);
 assert.equal(guildTreeCounts(plan.events).mastery,12);
});

test('Boost scales computed bonuses without changing rank allocation',()=>{
 const plan=allocate(freshGuildTree(30),first);
 const base=guildBonusTotals(plan)[first];
 const boosted=guildBonusTotals({...plan,boost:1.5})[first];
 assert.equal(base.rank,1);
 assert.ok(Math.abs(boosted.total/base.total-1.5)<0.00001);
 assert.equal(boosted.rank,base.rank);
});

test('Local autosave round-trips and gracefully handles blocked storage',()=>{
 const saved=new Map();
 const storage={setItem:(key,value)=>saved.set(key,value),getItem:key=>saved.get(key)||null};
 const plan={...buildTo(80,23),boost:1.25};
 assert.deepEqual(readGuildTree(storage),freshGuildTree());
 assert.deepEqual(readGuildTree(storage),saveGuildTree(plan,storage));
 assert.deepEqual(readGuildTree({getItem:()=>{throw Error('blocked')}}),freshGuildTree());
});

test('Every base Guild stat has complete ten-rank data',()=>{
 assert.equal(GUILD_BASE_NODES.length,11);
 for(const n of GUILD_BASE_NODES){
  assert.equal(n.ranks.length,10,n.id);
  assert.ok(n.ranks.every(x=>Number.isFinite(x)&&x>=0),n.id);
 }
});
