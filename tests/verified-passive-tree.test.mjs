import test from 'node:test';
import assert from 'node:assert/strict';
import {VERIFIED_PASSIVE_TREE,VERIFIED_PASSIVE_SOURCE} from '../src/verified-passive-tree.js';
import {normalizeTree,passiveAllowed,passiveValue,passiveTierSpend,passiveStatDisplay,passivePointBudget,allocatedTotal} from '../src/tree-engine.js';
import {passiveBoard} from '../src/core-boards.js';

const tree=normalizeTree({}),rows=tree.passive.rows,tiers=tree.passive.tiers;
test('200 source-backed rows and 500 exact nodes across 20 tiers',()=>{
 assert.match(VERIFIED_PASSIVE_SOURCE,/2026-10-09/);
 assert.equal(rows.length,200);
 assert.equal(tiers.length,20);
 assert.equal(rows.reduce((n,row)=>n+row.nodes.length,0),500);
 assert.equal(rows.filter(r=>r.milestone).length,20);
 assert.deepEqual(rows.filter(r=>r.milestone).map(r=>r.index),Array.from({length:20},(_,i)=>i*10+9));
 assert.deepEqual(tiers.map(t=>t.start),Array.from({length:20},(_,i)=>i*10));
 assert.equal(tiers[0].required,0);
 assert.ok(tiers.slice(1).every(t=>t.required===20));
 assert.equal(Object.keys(VERIFIED_PASSIVE_TREE.stat_display).length,23);
});
test('exact source stats, rank caps, and milestone bonuses are preserved',()=>{
 assert.deepEqual(rows[0].nodes.map(n=>[n.stat,n.value,n.maxRank]),[['strength',1,3],['dexterity',1,3],['intelligence',1,3]]);
 assert.equal(rows[9].milestone,true);
 assert.deepEqual(rows[9].nodes.map(n=>[n.stat,n.value,n.maxRank]),
 [['double_hit_chance',3.8,1],['max_hp_percent',4.7,1],['exp_gain',13.6,1]]);
 assert.equal(rows[199].nodes[1].value,23);
 assert.equal(passiveValue(rows[9].nodes[0],1),'+3.8%');
 assert.equal(passiveValue(rows[0].nodes[0],3),'+3');
 assert.equal(passiveValue(rows[199].nodes[1],1),'+23%');
 assert.equal(passiveStatDisplay('thorns_effectiveness').name,'Thorns Effectiveness');
});
test('20 points in previous tier are required to unlock the next one',()=>{
 const tier2Node=rows[10].nodes[0];
 assert.match(passiveAllowed(tree,{},tier2Node,1,100).reason,/20 points in Tier 1/);
 const allocated={};let remaining=20;
 for(const row of rows.slice(0,10))for(const n of row.nodes){
  const v=Math.min(remaining,n.maxRank);
  if(v){allocated[n.key]=v;remaining-=v;}
 }
 assert.equal(remaining,0);
 assert.equal(passiveTierSpend(tree,allocated,0),20);
 const opened=passiveAllowed(tree,allocated,tier2Node,1,100);
 assert.equal(opened.ok,true,opened.reason);
 assert.equal(passiveAllowed(tree,opened.allocation,rows[0].nodes[0],-1,100).ok,false,'cannot refund below unlock threshold');
});
test('rank caps and character level budget are enforced',()=>{
 assert.equal(passivePointBudget(1),1);
 const first=rows[0].nodes[0];
 assert.equal(passiveAllowed(tree,{},first,1,1).ok,true);
 assert.equal(passiveAllowed(tree,{[first.key]:1},first,1,1).ok,false);
 assert.equal(passiveAllowed(tree,{[first.key]:first.maxRank},first,1,100).ok,false);
 assert.equal(passiveAllowed(tree,{},first,-1,100).ok,false);
});
test('first and last tier show correct rows and milestone cards in the UI',()=>{
 const state={passiveTier:0,passiveAlloc:{},characterLevel:200,treeStatus:'ready'};
 const first=passiveBoard(state,tree);
 assert.equal((first.match(/data-action="passivetier"/g)||[]).length,20);
 assert.equal((first.match(/class="passiveRow /g)||[]).length,10);
 assert.equal((first.match(/milestoneRow/g)||[]).length,1);
 assert.equal((first.match(/class="passiveNode /g)||[]).length,rows.slice(0,10).reduce((n,row)=>n+row.nodes.length,0));
 assert.ok(first.includes('Rows 1–10'));
 assert.ok(first.includes('Strength'));
 assert.ok(first.includes('+1'));
 state.passiveTier=19;
 const last=passiveBoard(state,tree);
 assert.ok(last.includes('Rows 191–200'));
 assert.ok(last.includes('+23%'));
});
test('node identifiers remain unique and deterministic for saved Build Studio allocations',()=>{
 const keys=rows.flatMap(row=>row.nodes.map(n=>n.key));
 assert.equal(keys.length,500);
 assert.equal(new Set(keys).size,500);
 assert.equal(rows[0].nodes[0].key,'0:0');
 assert.equal(rows[199].nodes[2].key,'199:2');
 assert.equal(allocatedTotal({'0:0':2,'9:1':1}),3);
});
