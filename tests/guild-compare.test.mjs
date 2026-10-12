import test from 'node:test';
import assert from 'node:assert/strict';
import {freshGuildTree,allocateGuildPoint,GUILD_BASE_NODES} from '../src/guild-tree-engine.js';
import {readGuildBaseline,saveGuildBaseline,clearGuildBaseline,guildPlanDifference,guildCompareView} from '../src/guild-tree-compare.js';
import {guildTreeView} from '../src/guild-tree-views.js';
const first=GUILD_BASE_NODES[0].id,second=GUILD_BASE_NODES[1].id;
const add=(plan,id)=>{const result=allocateGuildPoint(plan,id);assert.equal(result.reason,null);return result.plan};

test('Baseline comparison is independent of the mutable current allocation',()=>{
 const original=add(freshGuildTree(25),first);
 const current=add(original,second);
 const snapshot=JSON.stringify(original);
 const diff=guildPlanDifference(current,original);
 assert.equal(diff.changes.length,11);
 assert.equal(diff.gained,1);
 assert.equal(diff.lost,0);
 assert.equal(diff.unchanged,10);
 assert.ok(diff.changes.find(x=>x.id===second).delta>0);
 assert.equal(JSON.stringify(original),snapshot);
});

test('Comparisons include the chosen Bonus Boost without confusing it with rank changes',()=>{
 const base=add(freshGuildTree(25),first);
 const current={...base,boost:1.5};
 const diff=guildPlanDifference(current,base);
 const attack=diff.changes.find(x=>x.id===first);
 assert.ok(attack.after>attack.before);
 assert.equal(attack.delta,2.595);
 assert.equal(diff.current.events,diff.baseline.events);
 assert.equal(diff.gained,1);
});

test('Saving and clearing a comparison baseline works independently of the guild draft',()=>{
 const mem=new Map();
 const storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
 assert.equal(readGuildBaseline(storage),null);
 const baseline=add(freshGuildTree(38),first);
 assert.deepEqual(saveGuildBaseline(baseline,storage),baseline);
 assert.deepEqual(readGuildBaseline(storage),baseline);
 assert.equal(clearGuildBaseline(storage),null);
 assert.equal(readGuildBaseline(storage),null);
 assert.equal(readGuildBaseline({getItem:()=>{throw Error('blocked')}}),null);
 assert.doesNotThrow(()=>saveGuildBaseline(baseline,{setItem:()=>{throw Error('blocked')}}));
});

test('Comparison view offers meaningful next actions and accessible bonus values',()=>{
 const baseline=add(freshGuildTree(30),first);
 const current=add(baseline,second);
 const empty=guildCompareView(current,null);
 assert.match(empty,/Save current plan as baseline/);
 assert.doesNotMatch(empty,/data-action="guildbaselineclear"/);
 const markup=guildCompareView(current,baseline);
 assert.match(markup,/Plan versus baseline/);
 assert.match(markup,/data-action="guildbaselineclear"/);
 assert.match(markup,/Pet Damage/);
 assert.match(markup,/Baseline/);
 assert.match(markup,/Current/);
 assert.match(markup,/Change/);
 assert.match(markup,/5\.19%/);
 assert.match(guildTreeView(current,'comparison',{},baseline),/guildCompareTable/);
 assert.match(guildTreeView(current,'vanguard',{},baseline),/data-arg="comparison"/);
});

test('Cross-level comparisons disclose when allocation and guild level are both different',()=>{
 const baseline=freshGuildTree(25),other=add(freshGuildTree(40),first);
 assert.match(guildCompareView(other,baseline),/different guild levels/);
 assert.equal(guildPlanDifference(other,null).baseline,null);
});
