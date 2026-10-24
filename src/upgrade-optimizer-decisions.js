/* Compare competing upgrade plans without equating unrelated stats or
 * pretending each biome's materials have the same farming difficulty. */
import {parseStatAmount} from './upgrade-optimizer-projections.js';

const toBig=value=>{
 const parsed=parseStatAmount(value);
 return parsed===null?null:BigInt(Math.trunc(parsed));
};
const materialCount=cost=>(cost?.materials||[]).reduce((n,m)=>n+Number(m.quantity),0);
const greater=(a,b)=>a>b+1e-9;

export function compareUpgradeChoices(candidates,focus,stock={},goldStock=''){
 const full=candidates.filter(x=>x?.breakdown&&x?.cost&&!x?.error);
 const focusStats=[...new Map(full.flatMap(x=>x.breakdown.rows.map(row=>[row.stat,row.label]))).entries()]
  .map(([stat,label])=>({stat,label})).sort((a,b)=>a.label.localeCompare(b.label));
 const objective=focusStats.some(x=>x.stat===focus)?focus:focusStats.find(x=>x.stat==='defense')?.stat||focusStats[0]?.stat||'';
 const ranked=full.map(candidate=>{
  const gain=candidate.breakdown.gains.get(objective)||0;
  const units=materialCount(candidate.cost),required=candidate.cost.materials||[];
  const known=required.filter(m=>toBig(stock[m.slug])!==null).length;
  const missing=required.map(m=>{
   const owned=toBig(stock[m.slug]);if(owned===null)return null;
   return {slug:m.slug,name:m.name,required:m.quantity,owned,short:owned<m.quantity?m.quantity-owned:0n};
  }).filter(Boolean);
  const goldOwned=toBig(goldStock);
  const missingGold=goldOwned===null?null:goldOwned<candidate.cost.gold?candidate.cost.gold-goldOwned:0n;
  const budgetComplete=known===required.length&&goldOwned!==null;
  const affordable=budgetComplete&&missing.every(m=>m.short===0n)&&missingGold===0n;
  return {...candidate,gain,units,density:gain>0?(units>0?gain/units:Infinity):0,
   missing,missingGold,known,requiredCount:required.length,budgetComplete,affordable};
 }).sort((a,b)=>b.density-a.density||b.gain-a.gain||a.index-b.index);

 const relevant=ranked.filter(x=>x.gain>0);
 const stockRequired=[...new Set(relevant.flatMap(x=>x.cost.materials.map(m=>m.slug)))];
 const allBudgetKnown=!!relevant.length&&toBig(goldStock)!==null&&stockRequired.every(k=>toBig(stock[k])!==null);
 let bestSet=null;
 if(allBudgetKnown&&relevant.length<=12){
  const owned=Object.fromEntries(stockRequired.map(slug=>[slug,toBig(stock[slug])]));
  const gold=toBig(goldStock),count=relevant.length;
  // Twelve entries = 4095 nonempty choices. Exact subset search respects
  // each distinct material instead of replacing rarities with fake exchange rates.
  for(let mask=1;mask<(1<<count);mask++){
   const chosen=[],costs=new Map();let gain=0,totalGold=0n,units=0;
   for(let i=0;i<count;i++)if(mask&(1<<i)){
    const c=relevant[i];chosen.push(c);gain+=c.gain;totalGold+=c.cost.gold;units+=c.units;
    for(const m of c.cost.materials)costs.set(m.slug,(costs.get(m.slug)||0n)+m.quantity);
   }
   if(totalGold>gold||[...costs].some(([slug,amount])=>amount>owned[slug]))continue;
   if(!bestSet||greater(gain,bestSet.gain)||Math.abs(gain-bestSet.gain)<1e-9&&(units<bestSet.units||units===bestSet.units&&totalGold<bestSet.gold)){
    bestSet={indices:chosen.map(x=>x.index),names:chosen.map(x=>x.name),gain,units,gold:totalGold,materials:costs};
   }
  }
 }
 return {objective,focusStats,ranked,relevant,allBudgetKnown,bestSet};
}
