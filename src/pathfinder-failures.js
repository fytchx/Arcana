/* Pathfinder planning scenarios. Base recipes are unchanged.
 * Failure/refund parameters: IdleArc /api/config/game 2026-10-17-001.
 * Pity reset/guarantee semantics are NOT independently verified. The displayed
 * ceiling and expected counts are conditional on the explicit model below.
 * Never present these estimates as guaranteed game-server outcomes. */
import {timelineModel} from './pathfinder-timeline.js';
export const PITY_MODEL=Object.freeze({
 source:'IdleArc game config 2026-10-17-001 + observed Oct 9 forge attempt',
 refundPercent:30,accelerationThreshold:0.5,accelerationMultiplier:1.5,
 note:'Modeled: a failed attempt advances pity by its base success chance (×1.5 when failure is at least 50%). The next attempt is treated as guaranteed when pity reaches 100%; pity resets after each successful upgrade. The exact server guarantee/reset behavior is not independently verified.'
});
const SCALE=1000000000n;
const netFailedCost=value=>(value*7n+5n)/10n; // Observed 135 fragments -> 95 on failure.
const approxCeil=(value,failures)=>value+((netFailedCost(value)*BigInt(Math.round(failures*1e9))+SCALE-1n)/SCALE);
const clamp=(n,min,max)=>Number.isFinite(Number(n))?Math.max(min,Math.min(max,Number(n))):min;
export const normalizeCostMode=value=>['min','expected','pity'].includes(value)?value:'min';
export const normalizePityProgress=value=>Math.round(clamp(value,0,100)*100)/100;
/** An explicitly conditional model, not a claim that the game's pity guarantee is proven. */
export function pityStepModel(failureChance,startingPity=0){
 if(!Number.isFinite(failureChance)||failureChance<0||failureChance>=1)return null;
 const fail=clamp(failureChance,0,0.999999),success=1-fail;
 if(fail===0||startingPity>=1)return {expectedFailures:0,maxFailures:0,expectedAttempts:1,maxAttempts:1,pityDelta:0};
 const pityDelta=success*(fail>=PITY_MODEL.accelerationThreshold?PITY_MODEL.accelerationMultiplier:1);
 if(pityDelta<=0)return null;
 // After K failed attempts, pity reaches one and the next attempt succeeds.
 // Do not overstate a guarantee: this is only the planning model.
 const maxFailures=Math.max(0,Math.ceil((1-clamp(startingPity,0,1)-1e-12)/pityDelta));
 let expectedFailures=0,stillFailing=1;
 for(let i=0;i<maxFailures;i++){stillFailing*=fail;expectedFailures+=stillFailing;}
 return {expectedFailures,maxFailures,expectedAttempts:1+expectedFailures,maxAttempts:1+maxFailures,pityDelta};
}
const mapOf=()=>new Map();
const add=(map,m,qty)=>{if(!qty)return;const old=map.get(m.slug);map.set(m.slug,{slug:m.slug,name:m.name,quantity:(old?.quantity||0n)+qty});};
const sorted=map=>[...map.values()].sort((a,b)=>a.name.localeCompare(b.name));
const multiplied=(v,count)=>({...v,gold:v.gold*count,materials:v.materials.map(m=>({...m,quantity:m.quantity*count})),attempts:v.attempts*Number(count),failedAttempts:v.failedAttempts*Number(count)});
/** Accepts the already-computed base quote; does not change source material math. */
export function quoteFailureScenarios(snapshot,base){
 if(!base?.complete||base.error||!base.perItem)return {available:false,reason:'Complete base upgrade costs are required.'};
 const {range,stages}=base,count=BigInt(base.itemCount);
 const start=stages.findIndex(s=>s.id===range.fromStage),stop=stages.findIndex(s=>s.id===range.toStage);
 if(start<0||stop<start)return {available:false,reason:'Invalid upgrade range.'};
 const min={gold:base.perItem.gold,materials:base.perItem.materials,attempts:base.perItem.steps,failedAttempts:0};
 let expectedGold=0n,ceilingGold=0n,expectedSteps=0,ceilingSteps=0,expectedFails=0,ceilingFails=0;
 const expectedMats=mapOf(),ceilingMats=mapOf(),perStep=[];
 let firstPaid=true;
 for(let i=start;i<=stop;i++){
  const stage=stages[i],initial=i===start?range.fromLevel+1:0,final=i===stop?range.toLevel:stage.max;
  const model=timelineModel(snapshot,{mode:stage.tier?'normal':'awakened',stage:stage.id,level:0});
  for(let level=initial;level<=final;level++){
   const cost=model?.steps[level];
   if(!cost)return {available:false,reason:'Missing upgrade recipe at '+stage.id+' +'+level+'.'};
   if(cost.free)continue;
   if(cost.failureChance===null||cost.failureChance===undefined)
    return {available:false,reason:'Failure odds are not verified for '+stage.id+' +'+level+'.'};
   const startingPity=firstPaid?normalizePityProgress(range.pityProgress)/100:0;
   const odds=pityStepModel(cost.failureChance,startingPity);
   if(!odds)return {available:false,reason:'Unsupported failure chance at '+stage.id+' +'+level+'.'};
   firstPaid=false;
   expectedGold+=approxCeil(cost.gold,odds.expectedFailures);
   ceilingGold+=cost.gold+netFailedCost(cost.gold)*BigInt(odds.maxFailures);
   expectedSteps+=odds.expectedAttempts;ceilingSteps+=odds.maxAttempts;
   expectedFails+=odds.expectedFailures;ceilingFails+=odds.maxFailures;
   for(const m of cost.materials){
    add(expectedMats,m,approxCeil(m.quantity,odds.expectedFailures));
    add(ceilingMats,m,m.quantity+netFailedCost(m.quantity)*BigInt(odds.maxFailures));
   }
   perStep.push({stage:stage.id,level,failChance:cost.failureChance,
    expectedAttempts:odds.expectedAttempts,maxAttempts:odds.maxAttempts,pityDelta:odds.pityDelta});
  }
 }
 const estimated={gold:expectedGold,materials:sorted(expectedMats),attempts:expectedSteps,failedAttempts:expectedFails};
 const pity={gold:ceilingGold,materials:sorted(ceilingMats),attempts:ceilingSteps,failedAttempts:ceilingFails};
 return {available:true,modeled:true,source:PITY_MODEL.source,note:PITY_MODEL.note,
  min:multiplied(min,count),expected:multiplied(estimated,count),pity:multiplied(pity,count),
  perItem:{min,expected:estimated,pity},perStep};
}
