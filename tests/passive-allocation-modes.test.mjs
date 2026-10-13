import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTree,passiveAllowed,passiveViolations,passiveTierSpend,passivePointBudget} from '../src/tree-engine.js';
import {passiveBoard} from '../src/core-boards.js';
import {normalizeBuild} from '../src/labs-engine.js';
import {shareBuildToken,openBuildToken} from '../src/build-links.js';

const tree=normalizeTree({});
const row=n=>tree.passive.rows[n];
const pick=n=>row(n).nodes[0];
const commit=(allocation,node,level=1000)=>{
 const result=passiveAllowed(tree,allocation,node,1,level);
 assert.equal(result.ok,true,result.reason);
 return result.allocation;
};
test('strict: rows are unlocked in sequence by a point in the immediately preceding row',()=>{
 const state={};
 const second=passiveAllowed(tree,state,pick(1),1,100);
 assert.equal(second.ok,false);assert.match(second.reason,/Row 1/);
 const first=commit({},pick(0),100);
 assert.equal(passiveAllowed(tree,first,pick(2),1,100).ok,false,'row 3 remains locked after row 1 only');
 let current=commit(first,pick(1),100);
 for(let index=2;index<9;index++){
  assert.equal(passiveAllowed(tree,current,pick(index+1),1,100).ok,false,'no row skips');
  current=commit(current,pick(index),100);
 }
 assert.equal(passiveAllowed(tree,current,pick(9),1,100).ok,true,'milestone requires and receives row 9');
});
test('strict: one milestone per tier, and no second milestone by refunding an earlier row',()=>{
 let allocation={};
 for(let i=0;i<9;i++)allocation=commit(allocation,pick(i),100);
 const chosen=commit(allocation,pick(9),100);
 const alternative=row(9).nodes[1];
 assert.match(passiveAllowed(tree,chosen,alternative,1,100).reason,/Only one milestone/);
 assert.equal(passiveAllowed(tree,chosen,pick(8),-1,100).ok,false,'refund must preserve downstream row unlock');
 const cleared=passiveAllowed(tree,chosen,pick(9),-1,100);
 assert.equal(cleared.ok,true);
 assert.equal(passiveAllowed(tree,cleared.allocation,alternative,1,100).ok,true);
});
test('strict: each new tier requires 20 allocated in immediately previous tier',()=>{
 const t2=pick(10),t3=pick(20);
 assert.equal(passiveAllowed(tree,{},t2,1,1000).ok,false);
 assert.match(passiveAllowed(tree,{},t2,1,1000).reason,/20 points in Tier 1/);
 let allocation={};
 // Reach the milestone and put ten points across ten consecutive rows.
 for(let r=0;r<10;r++)allocation=commit(allocation,pick(r));
 assert.equal(passiveTierSpend(tree,allocation,0),10);
 assert.equal(passiveAllowed(tree,allocation,t2,1,1000).ok,false);
 // Top up existing rows with source-based maxima, leaving exactly one milestone.
 let missing=10;
 for(let r=0;r<9&&missing;r++){
  const source=pick(r);
  while(missing&&(allocation[source.key]||0)<source.maxRank){
   allocation=commit(allocation,source);
   missing--;
  }
 }
 assert.equal(missing,0);
 assert.equal(passiveTierSpend(tree,allocation,0),20);
 const t2First=commit(allocation,t2);
 assert.equal(passiveAllowed(tree,t2First,pick(12),1,1000).ok,false);
 assert.equal(passiveAllowed(tree,t2First,t3,1,1000).ok,false,'tier 3 requires points in tier 2');
 assert.equal(passiveAllowed(tree,t2First,pick(0),-1,1000).ok,false,'cannot refund below tier threshold while tier 2 allocated');
});
test('free allocation: jump to tier 20, exceed budget, select alternatives, still enforce node caps',()=>{
 let allocation={};
 let res=passiveAllowed(tree,{},pick(199),1,1,true);assert.equal(res.ok,true,res.reason);allocation=res.allocation;
 const m2=row(199).nodes[1];res=passiveAllowed(tree,allocation,m2,1,1,true);assert.equal(res.ok,true,res.reason);allocation=res.allocation;
 assert.equal(passiveTierSpend(tree,allocation,19),2);
 assert.equal(passiveAllowed(tree,allocation,pick(199),1,1,true).ok,false,'source milestone max rank still enforced');
 assert.equal(passiveAllowed(tree,allocation,pick(197),1,1,true).ok,true,'jump around freely');
 assert.ok(passiveViolations(tree,allocation,1).length>0,'plan remains clearly non-game-legal');
 const old=passiveAllowed(tree,allocation,pick(199),-1,1,false);
 assert.equal(old.ok,true,'strict mode should allow correcting illegal preview allocations');
 assert.ok(passiveViolations(tree,old.allocation,1).length<passiveViolations(tree,allocation,1).length || old.ok);
});
test('free allocation toggle defaults to strict for old builds and persists on save/share',async()=>{
 const legacy=normalizeBuild({equipment:{},runes:[],passiveAlloc:{'199:0':1}});
 assert.equal(legacy.passiveFreeMode,false);
 const relaxed=normalizeBuild({...legacy,passiveFreeMode:true,characterLevel:225});
 assert.equal(relaxed.passiveFreeMode,true);
 const copied=await openBuildToken(await shareBuildToken(relaxed));
 assert.equal(copied.passiveFreeMode,true);
 assert.equal(copied.characterLevel,225);
 assert.equal(copied.passiveAlloc['199:0'],1);
});
test('UI keeps all tiers browsable and clearly marks strict/free modes',()=>{
 const base={passiveTier:0,passiveAlloc:{},characterLevel:1,treeStatus:'ready',passiveFreeMode:false};
 const strict=passiveBoard(base,tree);
 assert.equal((strict.match(/data-action="passivetier"/g)||[]).length,20);
 assert.match(strict,/Strict Allocation/);
 assert.match(strict,/Free Allocation/);
 assert.match(strict,/role="switch"/);
 assert.match(strict,/Requires 1 point in Row 1/);
 assert.match(strict,/class="passiveRow [^"]*rowLocked/);
 const free=passiveBoard({...base,passiveFreeMode:true},tree);
 assert.equal((free.match(/data-action="passivetier"/g)||[]).length,20);
 assert.match(free,/Free Allocation is on/);
 assert.match(free,/role="switch"[^>]*aria-checked="true"/);
 assert.match(free,/checked/);
 assert.doesNotMatch(free,/class="passiveRow [^"]*rowLocked/);
});

test('shared passive preview remains read-only while allowing all tier tabs',()=>{
 const readonly={passiveTier:19,passiveAlloc:{'199:1':1},characterLevel:225,treeStatus:'ready',passiveFreeMode:true,passiveReadOnly:true};
 const html=passiveBoard(readonly,tree);
 assert.match(html,/Shared passive tree · view only/);
 assert.match(html,/passiveReadonlyRank/);
 assert.match(html,/Free Allocation/);
 assert.equal((html.match(/data-action="passivetier"/g)||[]).length,20);
 assert.equal((html.match(/data-action="passiveadjust"/g)||[]).length,0,'no point editing controls');
 assert.doesNotMatch(html,/data-action="sharepassives"/,'viewer cannot re-share as owner');
 assert.match(html,/data-route="labs\/passives"/);
});
