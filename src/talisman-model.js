import {TALISMAN_TYPES,TALISMAN_INSCRIPTIONS,TALISMAN_STAT_LABELS} from './talisman-reference.js';
const BY_SLUG=new Map(TALISMAN_TYPES.map(t=>[t.slug,t]));
const isNum=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
export const emptyTalisman=()=>({slug:'',level:null,inscriptions:{}});
export function normalizeTalisman(input){
 const raw=input&&typeof input==='object'?input:{};
 const slug=BY_SLUG.has(raw.slug)?raw.slug:'';
 const level=isNum(raw.level)&&Number.isInteger(Number(raw.level))&&Number(raw.level)>=0&&Number(raw.level)<=9?Number(raw.level):null;
 const inscriptions={};
 for(const stat of Object.keys(TALISMAN_INSCRIPTIONS)){
  const value=raw.inscriptions?.[stat];
  if(isNum(value)&&Number(value)>=0&&Number(value)<=1e9)inscriptions[stat]=Number(value);
 }
 return {slug,level,inscriptions};
}
export function normalizeTalismanLoadout(input){
 return Array.from({length:2},(_,i)=>normalizeTalisman(Array.isArray(input)?input[i]:null));
}
/**
 * API-ready pure adapter. Takes a previously supplied JSON response, never
 * fetches from IdleArc. Drops item IDs, personal metadata and raw history.
 * Inscription totals are trusted as reported totals, NOT reconstructed rolls.
 */
export function talismansFromResponse(response){
 const items=Array.isArray(response?.talismans)?response.talismans:[];
 const seen=new Set();const result=[];
 for(const item of items){
  if(!BY_SLUG.has(item?.slug)||seen.has(item.slug)||result.length===2)continue;
  const inscriptions={};
  for(const key of Object.keys(TALISMAN_INSCRIPTIONS)){
   const value=item.inscription_totals?.[key]?.total;
   if(isNum(value)&&Number(value)>=0)inscriptions[key]=Number(value);
  }
  result.push(normalizeTalisman({slug:item.slug,level:item.level,inscriptions}));
  seen.add(item.slug);
 }
 return normalizeTalismanLoadout(result);
}
export function summarizeTalismans(loadout){
 const entries=normalizeTalismanLoadout(loadout),totals={},parts=[],unresolved=[];
 for(let i=0;i<entries.length;i++){
  const item=entries[i],ref=BY_SLUG.get(item.slug);
  if(!ref){if(item.level!==null||Object.keys(item.inscriptions).length)unresolved.push('Slot '+(i+1)+' has no valid talisman type.');continue;}
  if(item.level===null)unresolved.push(ref.name+' has no level: base stats unknown.');
  else for(const [stat,values] of Object.entries(ref.stats)){
   const value=values[item.level];
   totals[stat]=(totals[stat]||0)+value;
   parts.push({slot:i+1,slug:item.slug,stat,amount:value,origin:'configured base'});
  }
  for(const [stat,value] of Object.entries(item.inscriptions)){
   totals[stat]=(totals[stat]||0)+value;
   parts.push({slot:i+1,slug:item.slug,stat,amount:value,origin:'entered inscription total'});
  }
 }
 return {items:entries,totals,parts,unresolved,knownSources:parts.length};
}
export function compareTalismanLoadouts(current,proposed){
 const a=summarizeTalismans(current),b=summarizeTalismans(proposed);
 const keys=new Set([...Object.keys(a.totals),...Object.keys(b.totals)]);
 const rows=[...keys].sort().map(stat=>{
  const before=Object.hasOwn(a.totals,stat)?a.totals[stat]:null;
  const after=Object.hasOwn(b.totals,stat)?b.totals[stat]:null;
  return {stat,label:TALISMAN_STAT_LABELS[stat]||stat,current:before,proposed:after,
   delta:before!==null&&after!==null?after-before:null,
   suffix:TALISMAN_INSCRIPTIONS[stat]?.suffix??(stat==='pet_mastery_level'?'':'')};
 });
 return {current:a,proposed:b,rows,hasMeasuredComparison:rows.some(r=>r.delta!==null)};
}
