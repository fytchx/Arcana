import test from 'node:test';
import assert from 'node:assert/strict';
import {
 AFFIX_SCALING,EQUIPMENT_AFFIXES,affixesForItem,affixScale,parseStatAmount,
 projectItemBreakdown,normalizeAffixInputs,maxAffixSlots
} from '../src/upgrade-optimizer-projections.js';
import {compareUpgradeChoices} from '../src/upgrade-optimizer-decisions.js';
import {projectedStats} from '../src/upgrade-family.js';
import {renderStatProjection,renderAffixEditor,renderDecisionBoard} from '../src/upgrade-optimizer-panels.js';
import {normalizeOptimizerSliders} from '../src/upgrade-optimizer-v2.js';

const t6={rarity:6,awaken:0,level:0};
const t6plus={rarity:6,awaken:0,level:1};
const a1={rarity:6,awaken:1,level:0};
const a1plus={rarity:6,awaken:1,level:1};
const mat=(slug,quantity)=>({slug,name:slug,quantity:BigInt(quantity)});
const candidate=(index,name,stats,materials,gold)=>({index,name,route:'T6 +0 → T6 +1',item:{itemKey:'sandals-of-starszy',current:t6},
 breakdown:{rows:Object.keys(stats).map(stat=>({stat,label:stat})),gains:new Map(Object.entries(stats))},
 cost:{gold:BigInt(gold),materials}});

test('config-backed ordinary affixes are slot-aware and never treated as pet affixes',()=>{
 assert.equal(EQUIPMENT_AFFIXES.length,26);
 assert.equal(AFFIX_SCALING.enhancementPerLevel,.03);
 assert.equal(AFFIX_SCALING.boostPerAffixRank,.1);
 const boots=affixesForItem('sandals-of-starszy');
 assert.ok(boots.some(x=>x.name==='of Fortification'));
 assert.ok(!boots.some(x=>x.name==='Blazing'));
 assert.ok(affixesForItem('crossbow').some(x=>x.name==='Blazing'));
 assert.ok(affixesForItem('torch').some(x=>x.name==='of Bloodthirst'));
 assert.equal(maxAffixSlots({rarity:2}),1);
 assert.equal(maxAffixSlots(t6),5);
});
test('game-number inputs support shorthand, reject garbage and preserve zero',()=>{
 assert.equal(parseStatAmount('1,250'),1250);
 assert.equal(parseStatAmount('2.5k'),2500);
 assert.equal(parseStatAmount('1.2M'),1200000);
 assert.equal(parseStatAmount('0'),0);
 assert.equal(parseStatAmount('18%'),null);
 assert.equal(parseStatAmount('not a stat'),null);
 assert.equal(parseStatAmount(''),null);
});
test('projected implicit enhancement rises, but the fixed Torch skill does not become +333',()=>{
 const start=projectedStats('sandals-of-starszy',t6);
 const enhanced=projectedStats('sandals-of-starszy',t6plus);
 const awakened=projectedStats('sandals-of-starszy',a1);
 assert.ok(enhanced.primary.min>start.primary.min);
 assert.ok(awakened.primary.min>enhanced.primary.min);
 assert.equal(projectedStats('torch',a1).primary.min,3);
 assert.equal(projectedStats('torch',{rarity:6,awaken:10,level:30}).primary.max,3);
 const torch=projectItemBreakdown('torch',t6,a1);
 assert.equal(torch.implicits[0].unmodeled,true);
 assert.equal(torch.gains.has('all_skills'),false);
});
test('Gnarled Stick pet damage secondary stays at 50% through enhancement and awakening',()=>{
 const stick={rarity:6,awaken:10,level:24};
 const next={rarity:6,awaken:11,level:0};
 assert.equal(projectedStats('gnarled-stick',stick).secondary.min,50);
 assert.equal(projectedStats('gnarled-stick',next).secondary.max,50);
 const result=projectItemBreakdown('gnarled-stick',stick,next);
 assert.equal(result.implicits[1].delta,0);
 assert.equal(result.implicits[1].confidence,'verified-fixed');
 assert.equal(result.rows.some(row=>row.kind==='drop-bonus'),false);
});
test('entered actual roll anchors the range preview and entered affix scales into A1',()=>{
 const base=projectItemBreakdown('sandals-of-starszy',t6,a1,{primary:'1600'},[{id:13,value:'35',plannedBoosts:1}]);
 assert.equal(base.implicits[0].from,1600);
 assert.ok(base.implicits[0].to>1600);
 assert.ok(base.implicits[0].percentGain>0);
 assert.equal(base.affixes[0].name,'of Fortification');
 assert.equal(base.affixes[0].from,35);
 assert.ok(base.affixes[0].to>35);
 assert.ok(base.affixes[0].percentGain>0);
 assert.ok(Math.abs(base.affixes[0].delta-(base.affixes[0].to-35))<1e-9);
 assert.equal(normalizeAffixInputs([{id:999,value:'2.5k'}])[0].id,0);
 assert.ok(affixScale(a1,0)>affixScale(t6,0));
 const noUpgrade=projectItemBreakdown('sandals-of-starszy',a1,a1,{primary:'2k'},[{id:13,value:'35'}]);
 assert.equal(noUpgrade.implicits[0].delta,0);
 assert.equal(noUpgrade.affixes[0].delta,0);
});
test('affix Awakening is allocated per affix, never blanket-applied to every affix',()=>{
 const current={rarity:6,awaken:10,level:24},target={rarity:6,awaken:11,level:0};
 const inputs=[{id:6,value:'969',rank:4,plannedBoosts:1,reference:current,referenceRank:4},
  {id:30,value:'415',rank:2,plannedBoosts:0,reference:current,referenceRank:2}];
 const result=projectItemBreakdown('gnarled-stick',current,target,{},inputs);
 assert.equal(result.plannedBoosts,1);
 assert.equal(result.unassignedBoosts,0);
 assert.equal(result.affixes[0].rank,4);
 assert.equal(result.affixes[1].rank,2);
 assert.ok(result.affixes[0].percentGain>result.affixes[1].percentGain);
 const unassigned=projectItemBreakdown('gnarled-stick',current,target,{},inputs.map(x=>({...x,plannedBoosts:0})));
 assert.equal(unassigned.affixes[0].uncertain,true);
 assert.equal(unassigned.affixes[0].delta,null);
 assert.equal(unassigned.gains.has('pet_damage_bonus'),false);
 const noValue=projectItemBreakdown('gnarled-stick',current,current,{},[{id:6,value:'',rank:4}]);
 assert.equal(noValue.affixes[0].needsValue,true);
 assert.equal(noValue.affixes[0].delta,null);
});
test('an affix roll stays anchored to its captured gear rank when current equipment changes',()=>{
 const input=[{id:13,value:'35',reference:t6}];
 const first=projectItemBreakdown('sandals-of-starszy',t6,a1,{},input).affixes[0];
 const later=projectItemBreakdown('sandals-of-starszy',t6plus,a1,{},input).affixes[0];
 assert.equal(first.from,35);
 assert.ok(later.from>35,'same roll must grow with current gear rank');
 assert.equal(later.to,first.to,'target projection must not change when start slider moves');
 const advanced=projectItemBreakdown('sandals-of-starszy',a1,a1plus,{},input).affixes[0];
 assert.ok(advanced.from>35);
 assert.ok(advanced.to>advanced.from);
 assert.equal(advanced.referenceValue,35);
 assert.deepEqual(advanced.reference,t6);
});
test('projected outcome appears on an actual item and affix input renders five legal slots',()=>{
 const raw={itemKey:'sandals-of-starszy',current:t6,target:a1,observed:{primary:'1600'},affixes:[{id:13,value:'35'}]};
 const item=normalizeOptimizerSliders({items:[raw]}).items[0];
 const preview=projectItemBreakdown(item.itemKey,item.current,item.target,item.observed,item.affixes);
 const stats=renderStatProjection(preview,item,0),affixes=renderAffixEditor(item,0,preview);
 assert.match(stats,/What changes\?/);
 assert.match(stats,/data-uo-observed="primary"/);
 assert.match(stats,/Affix growth/);
 assert.match(affixes,/of Fortification/);
 assert.match(affixes,/data-uo-affix="value"/);
 assert.match(affixes,/Actual value at Infernal \+0/);
 assert.match(affixes,/Current affix rank/);
 assert.match(affixes,/4? \/ 5 slots/);
});
test('comparison chooses a single stat and cannot compare defense as if it were gold gain',()=>{
 const choices=[candidate(0,'Boots',{defense:200},[mat('one',15)],100),candidate(1,'Ring',{gold_gain:500},[mat('one',1)],100)];
 const result=compareUpgradeChoices(choices,'defense');
 assert.equal(result.objective,'defense');
 assert.equal(result.ranked[0].name,'Boots');
 assert.equal(result.ranked.find(x=>x.name==='Ring').gain,0);
 const html=renderDecisionBoard(result,{stock:{},goldStock:''},[]);
 assert.match(html,/Where should the materials go\?/);
 assert.match(html,/Outside selected stat/);
 assert.match(html,/data-uo-stock="one"/);
 assert.match(html,/Materials for this path/);
 assert.match(html,/Gold:/);
});
test('exact affordable subset respects different materials and gold instead of a fake exchange rate',()=>{
 const choices=[
  candidate(0,'A',{defense:100},[mat('red',5)],80),
  candidate(1,'B',{defense:80},[mat('blue',8)],60),
  candidate(2,'C',{defense:160},[mat('red',7),mat('blue',8)],90)
 ];
 const enough=compareUpgradeChoices(choices,'defense',{red:'5',blue:'8'},'150','set');
 assert.equal(enough.allBudgetKnown,true);
 assert.deepEqual(enough.bestSet.indices.sort(),[0,1]);
 assert.equal(enough.bestSet.gain,180);
 const single=compareUpgradeChoices(choices,'defense',{red:'5',blue:'8'},'150');
 assert.deepEqual(single.bestSet.indices,[0]);
 assert.equal(single.bestSet.gain,100);
 const noGold=compareUpgradeChoices(choices,'defense',{red:'5',blue:'8'},'');
 assert.equal(noGold.allBudgetKnown,false);
 assert.equal(noGold.bestSet,null);
 const tooLittle=compareUpgradeChoices(choices,'defense',{red:'0',blue:'0'},'0');
 assert.equal(tooLittle.bestSet,null);
});
test('partial inventory recommends only fully specified paths and marks the caveat',()=>{
 const choices=[
  candidate(0,'Affordable Boots',{defense:100},[mat('red',4)],20),
  candidate(1,'Unknown Chest',{defense:500},[mat('blue',7)],20)
 ];
 const partial=compareUpgradeChoices(choices,'defense',{red:'5'},'1M','set');
 assert.equal(partial.allBudgetKnown,false);
 assert.deepEqual(partial.bestSet.indices,[0]);
 const board=renderDecisionBoard(partial,{strategy:'set',stock:{red:'5'},goldStock:'1M'},[]);
 assert.match(board,/BEST CONFIRMED COMBINATION/);
 assert.match(board,/overall winner may change/);
 const all=compareUpgradeChoices(choices,'defense',{red:'5',blue:'7'},'1M','set');
 assert.equal(all.allBudgetKnown,true);
 assert.deepEqual(all.bestSet.indices.sort(),[0,1]);
});
test('two alternative target paths for one item cannot both be recommended together',()=>{
 const choices=[
  {...candidate(0,'Boots +1',{defense:100},[mat('red',2)],10),pathGroup:'alt-one'},
  {...candidate(1,'Same boots +2',{defense:180},[mat('red',3)],10),pathGroup:'alt-one'},
  candidate(2,'Independent ring',{defense:60},[mat('blue',1)],10)
 ];
 const result=compareUpgradeChoices(choices,'defense',{red:'50',blue:'50'},'1M','set');
 assert.deepEqual(result.bestSet.indices.sort(),[1,2]);
 assert.equal(result.bestSet.gain,240);
});
test('optimizer persistence retains affixes, observed stats, inventory and objective',()=>{
 const plan=normalizeOptimizerSliders({focus:'defense',strategy:'set',stock:{'grubs-eye':'1.2k'},goldStock:'3B',
  items:[{itemKey:'sandals-of-starszy',current:t6,target:a1,observed:{primary:'1.6k'},affixes:[{id:13,value:'37'}],pathGroup:'alt-shared'}]});
 assert.equal(plan.focus,'defense');
 assert.equal(plan.strategy,'set');
 assert.equal(plan.stock['grubs-eye'],'1.2k');
 assert.equal(plan.goldStock,'3B');
 assert.deepEqual(plan.items[0].affixes,[{id:13,value:'37',rank:0,plannedBoosts:0,reference:t6,referenceRank:0}]);
 assert.equal(plan.items[0].observed.primary,'1.6k');
 assert.equal(plan.items[0].pathGroup,'alt-shared');
});
