/* Pathfinder planning scenarios. Base recipes are unchanged.
 * Failure/refund parameters: IdleArc /api/config/game 2026-10-17-001.
 * Pity reset/guarantee semantics are NOT independently verified. The displayed
 * ceiling and expected counts are conditional on the explicit model below.
 * Never present these estimates as guaranteed game-server outcomes. */
import {timelineModel} from './pathfinder-timeline.js';
export const PITY_MODEL=Object.freeze({
 source:'IdleArc game config 2026-10-17-001 + observed Oct 9 forge attempt',
 refundPercent:30,accelerationThreshold:0.5,accelerationMultiplier:1.5,
 note:'The game displays a guaranteed attempt cap such as 1/4: success happens ON the last counted attempt. The configured acceleration determines that cap. Existing pity is entered as completed attempts, not a percentage. New upgrade steps are modeled with fresh pity until carry-over behavior is verified.'
});
const SCALE=1000000000n;
const netFailedCost=value=>(value*7n+5n)/10n; // Observed 135 fragments -> 95 on failure.
const approxCeil=(value,failures)=>value+((netFailedCost(value)*BigInt(Math.round(failures*1e9))+SCALE-1n)/SCALE);
const clamp=(n,min,max)=>Number.isFinite(Number(n))?Math.max(min,Math.min(max,Number(n))):min;
export const normalizeCostMode=value=>['min','expected','pity'].includes(value)?value:'min';
export const normalizePityProgress=value=>Math.round(clamp(value,0,100)*100)/100;
/** An explicitly conditional model, not a claim that the game's pity guarantee is proven. */
export function pityStepModel(failureChance,startingPityCount=0){
 if(!Number.isFinite(failureChance)||failureChance<0||failureChance>=1)return null;
 const fail=clamp(failureChance,0,0.999999),success=1-fail;
 if(fail===0)return {expectedFailures:0,maxFailures:0,expectedAttempts:1,maxAttempts:1,pityCap:1,startingPityCount:0,pityDelta:0};
 const pityDelta=success*(fail>=PITY_MODEL.accelerationThreshold?PITY_MODEL.accelerationMultiplier:1);
 if(pityDelta<=0)return null;
 // An N-attempt pity bar guarantees success ON attempt N, not attempt N+1.
 // Verified against the A4 +27 -> +28 game UI: 78.5% fail -> 4 attempts.
 const pityCap=Math.max(1,Math.ceil((1-1e-12)/pityDelta));
 const progressed=Math.trunc(clamp(startingPityCount,0,pityCap-1));
 const maxAttempts=Math.max(1,pityCap-progressed);
 const maxFailures=maxAttempts-1;
 let expectedFailures=0,stillFailing=1;
 for(let i=1;i<=maxFailures;i++){stillFailing*=fail;expectedFailures+=stillFailing;}
 return {expectedFailures,maxFailures,expectedAttempts:1+expectedFailures,maxAttempts,pityCap,startingPityCount:progressed,pityDelta};
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
   const startingPity=firstPaid&&cost.failureChance>0?Math.max(0,Math.trunc(Number(range.pityCount)||0)):0;
   const odds=pityStepModel(cost.failureChance,startingPity);
   if(!odds)return {available:false,reason:'Unsupported failure chance at '+stage.id+' +'+level+'.'};
   if(cost.failureChance>0)firstPaid=false;
   expectedGold+=approxCeil(cost.gold,odds.expectedFailures);
   ceilingGold+=cost.gold+netFailedCost(cost.gold)*BigInt(odds.maxFailures);
   expectedSteps+=odds.expectedAttempts;ceilingSteps+=odds.maxAttempts;
   expectedFails+=odds.expectedFailures;ceilingFails+=odds.maxFailures;
   for(const m of cost.materials){
    add(expectedMats,m,approxCeil(m.quantity,odds.expectedFailures));
    add(ceilingMats,m,m.quantity+netFailedCost(m.quantity)*BigInt(odds.maxFailures));
   }
   perStep.push({stage:stage.id,level,failChance:cost.failureChance,
    expectedAttempts:odds.expectedAttempts,maxAttempts:odds.maxAttempts,pityCap:odds.pityCap,pityCount:odds.startingPityCount,pityDelta:odds.pityDelta});
  }
 }
 const estimated={gold:expectedGold,materials:sorted(expectedMats),attempts:expectedSteps,failedAttempts:expectedFails};
 const pity={gold:ceilingGold,materials:sorted(ceilingMats),attempts:ceilingSteps,failedAttempts:ceilingFails};
 return {available:true,modeled:true,source:PITY_MODEL.source,note:PITY_MODEL.note,
  min:multiplied(min,count),expected:multiplied(estimated,count),pity:multiplied(pity,count),
  perItem:{min,expected:estimated,pity},perStep};
}
