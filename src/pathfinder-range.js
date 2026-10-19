/* Pure cost totals for any two verified rarity/awakening checkpoints.
   Reads the same unmodified recipe model as Pathfinder's single-step viewer. */
import {timelineStages,timelineModel} from './pathfinder-timeline.js';
export const RANGE_KEY='arcana-pathfinder-checkpoints-v1';
const clamp=(v,max)=>Math.max(0,Math.min(max,Number.isFinite(Number(v))?Math.trunc(Number(v)):0));
export const normalizeItemQuantity=value=>Math.max(1,Math.min(100,Number.isFinite(Number(value))?Math.trunc(Number(value)):1));
export const allStages=snapshot=>[...timelineStages(snapshot,'normal'),...timelineStages(snapshot,'awakened')];
export function normalizeRange(raw={},snapshot=null,quick={}){
 const input=raw&&typeof raw==='object'?raw:{};
 const stages=snapshot?allStages(snapshot):[];
 const quickStage=stages.find(x=>x.id===quick.stage)||stages[0];
 const from=stages.find(s=>s.id===input.fromStage)||quickStage;
 const to=stages.find(s=>s.id===input.toStage)||from;
 return {
  fromStage:from?.id||'',fromLevel:clamp(input.fromLevel,from?.max||0),
  toStage:to?.id||'',toLevel:clamp(input.toLevel??to?.max??0,to?.max||0),
  ...(input.quantity===undefined?{}:{quantity:normalizeItemQuantity(input.quantity)})
 };
}
export function readRange(store=globalThis.localStorage){
 try{return JSON.parse(store?.getItem(RANGE_KEY)||'{}')||{}}
 catch{return {}}
}
export function saveRange(raw,store=globalThis.localStorage){
 const value={fromStage:String(raw.fromStage||''),fromLevel:Number(raw.fromLevel)||0,
  toStage:String(raw.toStage||''),toLevel:Number(raw.toLevel)||0,
  ...(raw.quantity===undefined?{}:{quantity:normalizeItemQuantity(raw.quantity)})};
 try{store?.setItem(RANGE_KEY,JSON.stringify(value))}catch{}
 return value;
}
export function quoteRange(snapshot,raw,quick={}){
 const stages=allStages(snapshot),range=normalizeRange(raw,snapshot,quick);
 const itemCount=normalizeItemQuantity(range.quantity);
 const start=stages.findIndex(x=>x.id===range.fromStage);
 const stop=stages.findIndex(x=>x.id===range.toStage);
 const base={range,stages,itemCount,perItem:null,steps:0,gold:0n,materials:[],complete:false,missing:[],error:''};
 if(start<0||stop<0)return {...base,error:'Upgrade costs are unavailable.'};
 if(stop<start||(stop===start&&range.toLevel<range.fromLevel))
  return {...base,error:'The target must be after the starting upgrade.'};
 const tally=new Map(),missing=[];
 let gold=0n,steps=0;
 for(let i=start;i<=stop;i++){
  const stage=stages[i],initial=i===start?range.fromLevel+1:0;
  const final=i===stop?range.toLevel:stage.max;
  const cached=timelineModel(snapshot,{mode:stage.tier?'normal':'awakened',stage:stage.id,level:0});
  for(let level=initial;level<=final;level++){
   const cost=cached?.steps[level];
   if(!cost){missing.push(stage.id+' '+(level===0?'transition':'+'+level));continue}
   gold+=cost.gold;
   for(const m of cost.materials){
    const previous=tally.get(m.slug);
    tally.set(m.slug,{slug:m.slug,name:m.name,quantity:(previous?.quantity||0n)+m.quantity});
   }
   if(!cost.free)steps++;
  }
 }
 const perItemMaterials=[...tally.values()].sort((a,b)=>a.name.localeCompare(b.name));
 const factor=BigInt(itemCount);
 return {...base,steps:steps*itemCount,gold:gold*factor,
  materials:perItemMaterials.map(m=>({...m,quantity:m.quantity*factor})),
  perItem:{steps,gold,materials:perItemMaterials},
  complete:missing.length===0,missing,error:missing.length?'Some verified upgrade costs are missing. An incomplete total will not be presented.':''};
}
