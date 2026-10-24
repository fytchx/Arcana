/* Item projections for the Upgrade Optimizer.
 * Implicit tier ranges are from the 2026-10-21-003 equipment snapshot.
 * Ordinary affix definitions and scaling parameters were verified against
 * the complete 2026-09-30-001 game configuration. The executable server-side
 * rounding/capping order is not available: values are ESTIMATES, never exact. */
import {OPTIMIZER_ITEM_BY_ID,optimizerStatLabel} from './upgrade-optimizer-data.js';
import {projectedStats} from './upgrade-family.js';

export const AFFIX_SOURCE='IdleArc game configuration 2026-09-30-001';
export const AFFIX_SCALING=Object.freeze({
 tierMultipliers:[1,1.2,1.4,1.7,2,2.5],
 enhancementPerLevel:0.03,
 boostPerAffixRank:0.1,
 softcapStart:90,
 softcapRate:0.5,
 frozenCapStats:['damage_reduction'],
 growingCapStats:['bloodthirst_percent']
});
// [id, in-game name, kind, stat, base min, base max, valid item types]
const RAW_AFFIXES=[
 [21,'Blazing','prefix','damage_conversion_fire',3,5,['weapon']],
 [24,'Earthen','prefix','damage_conversion_earth',3,5,['weapon']],
 [29,'Evasive','prefix','dodge_chance',0.5,1,['chest_armor','helmet','boots','gloves','shield','torch']],
 [3,'of Ambulance','prefix','max_health',10,50,['chest_armor','helmet','boots','gloves','amulet','ring','belt']],
 [13,'of Fortification','prefix','local_flat_defense',3,10,['chest_armor','helmet','boots','gloves']],
 [6,'of Pet Damage','prefix','pet_damage_bonus',2,8,['all']],
 [14,'of the Bulwark','prefix','local_percent_defense',10,30,['chest_armor','helmet','boots','gloves']],
 [20,'of Warding','prefix','damage_reduction',1,3,['chest_armor','helmet','shield','torch']],
 [22,'Tidal','prefix','damage_conversion_water',3,5,['weapon']],
 [25,'Venomous','prefix','damage_conversion_poison',3,5,['weapon']],
 [26,'Verdant','prefix','damage_conversion_nature',3,5,['weapon']],
 [23,'Voltaic','prefix','damage_conversion_air',3,5,['weapon']],
 [31,'of Bloodthirst','suffix','bloodthirst_percent',1,2,['torch']],
 [4,'of Crit Chance','suffix','critical_strike_chance',1,2,['all']],
 [2,'of Crit Damage','suffix','crit_damage',1,3,['all']],
 [18,'of Devastation','suffix','double_damage_chance',1,2,['all']],
 [28,'of Dexterity','suffix','dexterity',2,4,['weapon','ring','amulet','belt']],
 [5,'of Double Hit','suffix','double_hit_chance',1,2,['weapon','amulet','ring','belt']],
 [7,'of Experience','suffix','exp_gain',1,3,['all']],
 [30,'of Intelligence','suffix','intelligence',2,4,['weapon','ring','amulet','belt']],
 [11,'of Regeneration','suffix','life_on_hit',1,1,['weapon','ring','amulet']],
 [27,'of Strength','suffix','strength',2,4,['weapon','ring','amulet','belt']],
 [16,'of Striking','suffix','jewelry_flat_damage',4,10,['ring','amulet','belt']],
 [19,'of the Fortress','suffix','defense_percent',3,8,['belt','ring','amulet']],
 [12,'of Vampirism','suffix','life_on_kill',3,10,['weapon','ring','amulet']],
 [8,'of Wealth','suffix','gold_gain',2,5,['all']]
];
export const EQUIPMENT_AFFIXES=Object.freeze(RAW_AFFIXES.map(([id,name,kind,stat,min,max,types])=>Object.freeze({id,name,kind,stat,min,max,types:Object.freeze(types)})));
const AFFIX_BY_ID=new Map(EQUIPMENT_AFFIXES.map(x=>[x.id,x]));
const SLOT_ITEM_TYPE={main_hand:'weapon',off_hand:'shield',chest:'chest_armor',head:'helmet',hands:'gloves',feet:'boots',belt:'belt',ring:'ring',amulet:'amulet',torch:'torch'};
export const affixById=id=>AFFIX_BY_ID.get(Number(id))||null;
export const affixesForItem=id=>{
 const item=OPTIMIZER_ITEM_BY_ID.get(id),type=SLOT_ITEM_TYPE[item?.slot];
 return type?EQUIPMENT_AFFIXES.filter(x=>x.types.includes('all')||x.types.includes(type)):[];
};
export const maxAffixSlots=point=>Math.max(0,Math.min(5,Number(point?.rarity||6)-1));
export const affixStatLabel=stat=>({
 damage_conversion_fire:'Fire Conversion',damage_conversion_earth:'Earth Conversion',
 damage_conversion_water:'Water Conversion',damage_conversion_poison:'Poison Conversion',
 damage_conversion_nature:'Nature Conversion',damage_conversion_air:'Air Conversion',
 local_flat_defense:'Local Flat Defense',local_percent_defense:'Local Defense %',
 max_health:'Max Health',pet_damage_bonus:'Pet Damage %',
 critical_strike_chance:'Critical Chance',jewelry_flat_damage:'Flat Damage',
 defense_percent:'Defense %',damage_reduction:'Damage Reduction %',
 bloodthirst_percent:'Bloodthirst %',dodge_chance:'Dodge Chance %',
 double_damage_chance:'Double Damage Chance %',double_hit_chance:'Double Hit Chance %',
 gold_gain:'Gold Gain %',exp_gain:'Experience Gain %',crit_damage:'Critical Damage %',
 strength:'Strength',dexterity:'Dexterity',intelligence:'Intelligence',
 life_on_hit:'Life on Hit',life_on_kill:'Life on Kill'
 })[stat]||optimizerStatLabel(stat);

// Accept 150, 1,250, 2.5k, 3M, 1.2B, etc. Do not silently treat invalid text as zero.
export function parseStatAmount(raw){
 const v=String(raw??'').trim().replaceAll(',','').replaceAll(' ','');
 if(!v)return null;
 const match=v.match(/^(\d+(?:\.\d+)?|\.\d+)(k|m|b|t|qa)?$/i);
 if(!match)return null;
 const amount=Number(match[1])*({k:1e3,m:1e6,b:1e9,t:1e12,qa:1e15}[match[2]?.toLowerCase()]||1);
 return Number.isFinite(amount)&&amount>=0?amount:null;
}
const softLevels=count=>count<=AFFIX_SCALING.softcapStart?count:AFFIX_SCALING.softcapStart+(count-AFFIX_SCALING.softcapStart)*AFFIX_SCALING.softcapRate;
const stageLevels=point=>{
 const rarity=Math.max(1,Math.min(6,Number(point?.rarity)||6));
 const rank=rarity===6?Math.max(0,Math.min(30,Number(point?.awaken)||0)):0;
 const level=Math.max(0,Math.min(30,Number(point?.level)||0));
 return {rarity,rank,effective:softLevels(rank*30+level)};
};
export function affixScale(point,affixRank=0){
 const {rarity,effective}=stageLevels(point);
 const ownRank=Math.max(0,Math.min(30,Math.trunc(Number(affixRank)||0)));
 // Equipment enhancement affects every affix. The extra 10% is allocated
 // to one affix at a time, as shown by the Roman ranks on an A10 item
 // summing to 10; it is not a blanket 10% on all five affixes per A-rank.
 return AFFIX_SCALING.tierMultipliers[rarity-1]*(1+effective*AFFIX_SCALING.enhancementPerLevel)*(1+ownRank*AFFIX_SCALING.boostPerAffixRank);
}
const normalizeReference=raw=>{
 if(!raw||typeof raw!=='object')return null;
 const rarity=Math.max(1,Math.min(6,Math.trunc(Number(raw.rarity)||6)));
 return {rarity,awaken:rarity===6?Math.max(0,Math.min(30,Math.trunc(Number(raw.awaken)||0))):0,
  level:Math.max(0,Math.min(rarity===6?30:[4,9,14,19,24][rarity-1],Math.trunc(Number(raw.level)||0)))};
};
export const normalizeAffixInputs=raw=>Array.isArray(raw)?raw.slice(0,5).map(v=>{
 const count=n=>Math.max(0,Math.min(30,Math.trunc(Number(n)||0)));
 const entry={id:affixById(v?.id)?.id||0,value:String(v?.value??'').slice(0,32),
  rank:count(v?.rank),plannedBoosts:count(v?.plannedBoosts)};
 const reference=normalizeReference(v?.reference);
 if(reference){entry.reference=reference;entry.referenceRank=count(v?.referenceRank??v?.rank)}
 return entry;
}):[];
export const normalizeObserved=raw=>({primary:String(raw?.primary??'').slice(0,32),secondary:String(raw?.secondary??'').slice(0,32)});
const rounded=x=>Math.round((x+Number.EPSILON)*100)/100;
const midpoint=range=>(range.min+range.max)/2;
const projectImplicit=(stat,from,to,observedRaw,unmodeled=false)=>{
 if(!stat||!from||!to)return null;
 const observed=parseStatAmount(observedRaw);
 const fromMid=midpoint(from),toMid=midpoint(to);
 if(unmodeled)return {stat,label:optimizerStatLabel(stat),kind:'implicit',confidence:from.confidence,
  fromMin:from.min,fromMax:from.max,toMin:to.min,toMax:to.max,
  from:observed??fromMid,to:null,delta:null,observed:observed!==null,unmodeled:true};
 let projected=null;
 if(observed!==null){
  // Keep the apparent roll percentile when it fits the source range. If it
  // doesn't, use a relative projection, since a real in-game value wins over
  // a snapshot range. Neither path is exact server-side rounding.
  const width=from.max-from.min;
  const percentile=width?(observed-from.min)/width:0.5;
  projected=percentile>=0&&percentile<=1?
   to.min+percentile*(to.max-to.min):observed*(fromMid>0?toMid/fromMid:1);
 }
 const gainMin=to.min-from.min,gainMax=to.max-from.max;
 return {stat,label:optimizerStatLabel(stat),kind:'implicit',confidence:from.confidence,fromMin:from.min,fromMax:from.max,
  toMin:to.min,toMax:to.max,from:observed??fromMid,to:projected===null?toMid:rounded(projected),
  delta:rounded((projected===null?toMid:projected)-(observed??fromMid)),
  percentGain:(observed??fromMid)>0?rounded(100*((projected===null?toMid:projected)-(observed??fromMid))/(observed??fromMid)):null,
  deltaMin:Math.min(gainMin,gainMax),deltaMax:Math.max(gainMin,gainMax),observed:observed!==null};
};
export function projectItemBreakdown(id,current,target,observed={},inputs=[]){
 const from=projectedStats(id,current),to=projectedStats(id,target);
 if(!from||!to)return null;
 const item=OPTIMIZER_ITEM_BY_ID.get(id),legal=new Set(affixesForItem(id).map(x=>x.id));
 const rolls=normalizeObserved(observed);
 const sameRarity=current.rarity===target.rarity,sameRank=(current.awaken||0)===(target.awaken||0);
 const unresolved=(part)=>part?.confidence==='tier-only'&&(sameRarity&&(!sameRank||current.level!==target.level))||
  part?.confidence==='awakening-estimate'&&sameRarity&&sameRank&&current.level!==target.level;
 const implicits=[projectImplicit(item.primary,from.primary,to.primary,rolls.primary,unresolved(from.primary))];
 if(from.secondary&&to.secondary)implicits.push(projectImplicit(item.secondary,from.secondary,to.secondary,rolls.secondary,unresolved(from.secondary)));
 const limit=maxAffixSlots(current),targetLimit=maxAffixSlots(target);
 const normalizedInputs=normalizeAffixInputs(inputs);
 const availableBoosts=Math.max(0,(target.awaken||0)-(current.awaken||0));
 const plannedBoosts=normalizedInputs.reduce((sum,entry)=>sum+entry.plannedBoosts,0);
 const unassignedBoosts=Math.max(0,availableBoosts-plannedBoosts);
 const invalidBoostPlan=plannedBoosts>availableBoosts||normalizedInputs.some(entry=>
  entry.rank>(current.awaken||0)||entry.rank+entry.plannedBoosts>(target.awaken||0));
 const affixes=normalizedInputs.slice(0,limit).map((input,index)=>{
  const def=affixById(input.id),value=parseStatAmount(input.value),valid=!!def&&legal.has(def.id);
  if(!valid)return null;
  const persists=index<targetLimit;
  // A rerolled affix retains its roll quality as the equipment advances. A
  // displayed stat captured at A1+0 is *not* reinterpreted as an A5+20 value
  // when the user moves the current-rank slider. Store the reference stage and
  // project both endpoints from that same observed roll.
  const reference=input.reference||current;
  const referenceRank=input.referenceRank??input.rank;
  const base=affixScale(reference,referenceRank);
  const fromFactor=affixScale(current,input.rank)/base;
  const targetRank=input.rank+input.plannedBoosts;
  const lowFactor=persists?affixScale(target,targetRank)/base:0;
  const highFactor=persists?affixScale(target,Math.min(target.awaken||0,targetRank+unassignedBoosts))/base:0;
  const from=value===null?null:rounded(value*fromFactor);
  const low=value===null?null:rounded(value*lowFactor);
  const high=value===null?null:rounded(value*highFactor);
  const uncertain=invalidBoostPlan||unassignedBoosts>0;
  const predicted=uncertain?null:low;
  const capped=AFFIX_SCALING.frozenCapStats.includes(def.stat)||AFFIX_SCALING.growingCapStats.includes(def.stat);
  return {index,id:def.id,name:def.name,label:affixStatLabel(def.stat),stat:def.stat,kind:'affix',from,to:predicted,
   toMin:low,toMax:high,delta:from!==null&&predicted!==null?rounded(predicted-from):null,
   percentGain:from>0&&predicted!==null?rounded(100*(predicted-from)/from):null,
   percentGainMin:fromFactor>0?rounded(100*(lowFactor-fromFactor)/fromFactor):null,
   percentGainMax:fromFactor>0?rounded(100*(highFactor-fromFactor)/fromFactor):null,
   reference,referenceRank,referenceValue:value,rank:input.rank,plannedBoosts:input.plannedBoosts,
   needsValue:value===null,uncertain,invalid:invalidBoostPlan,unassignedBoosts,approx:true,persists,capped};
 }).filter(Boolean);
 const rows=[...implicits,...affixes];
 const gains=new Map();
 for(const row of rows)if(typeof row.delta==='number')gains.set(row.stat,rounded((gains.get(row.stat)||0)+row.delta));
 return {implicits,affixes,rows,gains,availableBoosts,plannedBoosts,unassignedBoosts,invalidBoostPlan,
  hasUnenteredAffixes:inputs.length>affixes.length,hasObservedRoll:implicits.some(x=>x.observed),
  caveat:'Projected values are estimates based on configured scaling and range behavior, not verified in-game outcomes. Affix caps and rounding can change the final result.'};
}
