import test from 'node:test';
import assert from 'node:assert/strict';
import {VERIFIED_CLASS_SKILL_TREES,VERIFIED_CLASS_SKILL_SOURCE} from '../src/verified-class-skills.js';
import {normalizeTree,verifiedClassTrees,classPointBudget,classAllowed,allocatedTotal,getClass,getBranch} from '../src/tree-engine.js';
import {classBoard} from '../src/core-boards.js';

const tree=normalizeTree({});
const byName=n=>tree.classes.find(x=>x.name===n);
const findSkill=(cls,name)=>cls.branches.flatMap(b=>b.skills).find(s=>s.name===name);
test('complete source-backed class trees survive a missing passive export',()=>{
 assert.equal(VERIFIED_CLASS_SKILL_SOURCE,'IdleArc 2026-10-09 config');
 assert.equal(tree.classes.length,5);
 assert.equal(verifiedClassTrees().length,5);
 assert.equal(tree.passive.rows.length,0);
 assert.deepEqual(tree.classes.map(c=>c.name),['Warrior','Archer','Mage','Rogue','Druid']);
 assert.equal(new Set(tree.classes.flatMap(c=>c.branches.flatMap(b=>b.skills.map(s=>s.id)))).size,90);
 for(const cls of tree.classes){
  assert.equal(cls.branches.length,3,cls.name+' branches');
  for(const branch of cls.branches){
   assert.equal(branch.skills.length,6,cls.name+' '+branch.name+' skills');
   assert.deepEqual([...new Set(branch.skills.map(s=>s.pointsToUnlock))].sort((a,b)=>a-b),[0,5,10]);
   for(const skill of branch.skills){
    assert.ok(skill.maxRank>0,skill.name+' rank cap');
    assert.ok(skill.description&&skill.description.length>10,skill.name+' game description');
    assert.ok(/^\w+\/\w+\.webp$/.test(skill.image),skill.name+' sprite source');
   }
  }
 }
});
test('Warrior revision includes Counterstrike and reworked defense skills',()=>{
 const w=byName('Warrior'),m=getBranch(w,w.branches[0].id);
 assert.ok(m.skills.some(s=>s.name==='Counterstrike'));
 assert.equal(findSkill(w,'Counterstrike').id,'48');
 assert.ok(findSkill(w,'Battle Recovery').description.includes('defense'));
 assert.ok(findSkill(w,'Iron Constitution').description.includes('defense'));
});
test('Druid Lodge, Tunnels, Symbiosis all include complete skills',()=>{
 assert.deepEqual(byName('Druid').branches.map(x=>x.name),['Lodge','Tunnels','Symbiosis']);
 assert.equal(findSkill(byName('Druid'),'One Soul').id,'90');
});
test('class points follow actual level cadence',()=>{
 assert.equal(classPointBudget(1),1);
 assert.equal(classPointBudget(3),1);
 assert.equal(classPointBudget(4),2);
 assert.equal(classPointBudget(7),3);
 assert.equal(classPointBudget(31),11);
});
test('tier 2 skill needs five other branch points and enforces rank cap',()=>{
 const warrior=byName('Warrior'),might=warrior.branches[0],first=might.skills.find(s=>s.pointsToUnlock===0),second=might.skills.find(s=>s.pointsToUnlock===5);
 assert.equal(classAllowed(warrior,{},second,1,100).ok,false);
 const one={[first.id]:5};
 const yes=classAllowed(warrior,one,second,1,100);
 assert.equal(yes.ok,true,yes.reason);
 const full={...one,[second.id]:second.maxRank};
 assert.equal(classAllowed(warrior,full,second,1,100).ok,false);
});
test('Mage skill prerequisite is enforced on add and refund',()=>{
 const mage=byName('Mage'),blast=findSkill(mage,'Magic blast'),siphon=findSkill(mage,'Arcane Siphon'),unstable=findSkill(mage,'Unstable Energy');
 assert.deepEqual(unstable.prereqs,[blast.id]);
 assert.equal(classAllowed(mage,{[siphon.id]:5},unstable,1,100).ok,false);
 assert.equal(classAllowed(mage,{[siphon.id]:4,[blast.id]:1},unstable,1,100).ok,true);
 const active={[siphon.id]:4,[blast.id]:1,[unstable.id]:1};
 assert.equal(classAllowed(mage,active,blast,-1,100).ok,false);
});
test('Rogue Shadow Echo gates Umbral Cascade',()=>{
 const rogue=byName('Rogue'),shadow=findSkill(rogue,'Shadow Echo'),cascade=findSkill(rogue,'Umbral Cascade');
 assert.deepEqual(cascade.prereqs,[shadow.id]);
});
test('source nodes use unique IDs across classes and match raw snapshot keys',()=>{
 const raw=Object.entries(VERIFIED_CLASS_SKILL_TREES).flatMap(([id,bs])=>bs.flatMap(b=>b.skills.map(s=>[id,String(s.id)])));
 assert.equal(raw.length,90);
 assert.equal(new Set(raw.map(x=>x[1])).size,90);
 assert.equal(allocatedTotal({7:5,22:3}),8);
 assert.equal(getClass(tree,'5').name,'Druid');
});

test('full class tree renders all six verified nodes and three tiers without paginating',()=>{
 const state={treeClassId:'1',treeBranchId:'7',classAlloc:{},characterLevel:100,treeStatus:'partial'};
 const markup=classBoard(state,tree);
 assert.equal((markup.match(/classTierBlock /g)||[]).length,3);
 assert.equal((markup.match(/classSkillNode /g)||[]).length,6);
 assert.ok(markup.includes('Counterstrike'));
 assert.ok(markup.includes('Culling strike'));
 assert.ok(markup.includes('data-node="48"'));
 assert.ok(markup.includes('classTierCards'));
 assert.ok(markup.includes('5 points required')||markup.includes('5 more points'));
 assert.ok(markup.includes('Official skill reference'));
});
test('every class can render a full branch independently of legacy passive API',()=>{
 for(const cls of tree.classes){
  const state={treeClassId:cls.id,treeBranchId:cls.branches[0].id,classAlloc:{},characterLevel:100,treeStatus:'partial'};
  const html=classBoard(state,tree);
  assert.equal((html.match(/classSkillNode /g)||[]).length,6,cls.name);
  assert.ok(html.includes('Class Skill Simulator')||html.includes('CLASS SKILL SIMULATOR'),cls.name);
 }
});
