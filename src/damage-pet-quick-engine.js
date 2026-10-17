/**
 * Four-slot Pet damage what-if comparison against an ALREADY MEASURED sheet.
 * The baseline includes CURRENT bonuses, so only the difference between
 * proposed/current entries is applied. No fake pet base or item rarity math.
 *
 * Inputs are damage BREAKDOWN sources, not an attempt to convert arbitrary
 * hatch bonuses into undocumented game stages. INT/DEX numbers are effective
 * additional character-sheet points (after any % stat scaling).
 */
import {calculatePet,relativeDifference,ATTRIBUTE_RATES} from './damage-calculator-engine.js';

export const QUICK_PET_SOURCES=Object.freeze([
 {id:'none',label:'No damage bonus',path:null,rate:0,unit:''},
 {id:'petEquipmentPct',label:'Pet Damage % · equipment row',path:'equipmentAffixes',rate:1,unit:'percentage points'},
 {id:'companionDropPct',label:'Companions drop bonus %',path:'companionDrop',rate:1,unit:'percentage points'},
 {id:'effectiveInt',label:'Effective INT added · character points',path:'intelligence',rate:ATTRIBUTE_RATES.intelligencePet,unit:'INT points'},
 {id:'effectiveDex',label:'Effective DEX added · character points',path:'dexterity',rate:ATTRIBUTE_RATES.dexterityPet,unit:'DEX points'},
]);
const SOURCE_BY_ID=new Map(QUICK_PET_SOURCES.map(x=>[x.id,x]));
const supplied=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value));
const deepClone=value=>JSON.parse(JSON.stringify(value));
export const blankQuickPetSetup=()=>Array.from({length:4},()=>({source:'none',value:0}));

export function normalizeQuickPetSetup(input){
 const rows=Array.isArray(input)?input:[];
 return Array.from({length:4},(_,i)=>{
  const row=rows[i]||{};
  const source=SOURCE_BY_ID.has(row.source)?row.source:'none';
  const value=source==='none'?0:supplied(row.value)?Number(row.value):null;
  return {source,value:value===null?null:Math.min(1e9,Math.max(0,value))};
 });
}

/**
 * A/B comparison: The measured reference is the currently equipped setup.
 * Current A is already in the sheet; proposed B is a replacement, NOT extra
 * stacked pets. Shared source percentage points add within their one row.
 */
export function compareQuickPetSetups(build={},current=[],proposed=[]){
 const a=normalizeQuickPetSetup(current),b=normalizeQuickPetSetup(proposed);
 const pet=build?.pet;
 const missing=[];
 if(!pet || !pet.layers || typeof pet.layers!=='object' ||
    !Object.values(pet.layers).some(supplied))
   return {known:false,reason:'Enter your measured Pet Damage breakdown first.',missing:['pet.layers']};
 const contributions=setup=>{
  const changes={};
  for(const row of setup){
   if(row.source==='none')continue;
   const type=SOURCE_BY_ID.get(row.source);
   if(row.value===null){missing.push(type.label+' value');continue;}
   changes[type.path]=(changes[type.path]||0)+row.value*type.rate;
  }
  return changes;
 };
 const before=contributions(a),after=contributions(b);
 const paths=new Set([...Object.keys(before),...Object.keys(after)]);
 for(const path of paths)if(!supplied(pet.layers[path]))missing.push('Pet breakdown: '+path);
 if(missing.length)return {known:false,reason:'Missing or unmeasured bonus inputs.',missing:[...new Set(missing)]};
 const scenario=deepClone(pet);
 const stageChanges=[];
 for(const path of paths){
  const baseline=Number(pet.layers[path]);
  const oldContribution=before[path]||0;
  const nextContribution=after[path]||0;
  // All listed sources use a nonnegative percentage layer. If the current
  // four slots exceed the measured whole row, the setup is inconsistent.
  if(baseline+1e-9<oldContribution){
   return {known:false,reason:'Current four-pet contributions exceed the measured '+path+' source.',missing:[path]};
  }
  const newTotal=baseline-oldContribution+nextContribution;
  scenario.layers[path]=Math.max(0,newTotal);
  stageChanges.push({source:path,measuredBaseline:baseline,currentContribution:oldContribution,
    proposedContribution:nextContribution,delta:nextContribution-oldContribution,
    proposedStage:scenario.layers[path]});
 }
 const original=calculatePet(pet),changed=calculatePet(scenario);
 const ratio=relativeDifference(original.layerFactor,changed.layerFactor);
 if(!ratio)return {known:false,reason:'The baseline pet multiplier must be positive.',missing:[]};
 return {known:true,current:a,proposed:b,measuredMultiplier:original.layerFactor,
   proposedMultiplier:changed.layerFactor,ratio:ratio.ratio,percentChange:ratio.percentChange,
   damageRange:changed.min===null?null:{min:changed.min,max:changed.max},
   stages:stageChanges,metric:'Pet tooltip multiplier, not DPS',
   notes:['INT/DEX inputs are effective stat points after other scaling.',
     'All changes replace CURRENT contributions within their measured breakdown rows.',
     'This does not infer rarity rolls, actual pet level scaling, ACS or real DPS.']};
}
