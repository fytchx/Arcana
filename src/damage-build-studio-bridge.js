/**
 * Conservative import of VERIFIED EXACT ROLLS from an existing Build Studio draft.
 * There is no direct live-game API, no inference from rarity/awaken tier, and no
 * invention of raw weapon/jewelry damage, STR/INT, ACS, runes or pet hatch stats.
 *
 * A complete equipment draft is needed to claim an equipment-subtotal stage.
 * Item roll values replace the corresponding measured stage; never add to a
 * preexisting screenshot aggregate.
 */
import {DRAFT_KEY,loadDraft} from './session.js';
import {baseItem,asGear,allowedItem,bonusRange,gearIssues,DROP_BONUSES,CLASS_CODES} from './build-studio-data.js';

const SLOT_KEYS=['torch','head','neck','weapon','chest','offhand','ring','belt','ring2','hands','feet'];
const TARGETS=Object.freeze({
 fierce:{path:'attack.layers.dropBonus',channel:'Hero Attack · equipment Drop Bonus %'},
 companions:{path:'pet.layers.equipmentAffixes',channel:'Pet Damage · equipment affix %'},
 precise:{path:'combat.critChance',channel:'Critical Chance · equipment %'},
 brutal:{path:'combat.critDamage',channel:'Critical Damage · equipment %'},
 relentless:{path:'combat.doubleHitChance',channel:'Double Hit Chance · equipment %'},
 devastating:{path:'combat.doubleDamageChance',channel:'Double Damage Chance · equipment %'},
 thorned:{path:'retaliation.baseBonuses.reflectingGear',channel:'Retaliation base · Reflecting gear %'},
});
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const configured=new Map(DROP_BONUSES.map(x=>[x.id,x]));
export const BUILD_STUDIO_DAMAGE_SOURCE='Arcana Build Studio; exact October 9 item Drop Bonus roll snapshot';
export const BUILD_STUDIO_DRAFT_KEY=DRAFT_KEY;
export const SUPPORTED_BUILD_STUDIO_DAMAGE_BONUSES=Object.freeze(Object.keys(TARGETS));
export function projectBuildStudioDamage(build){
 const result={known:false,className:null,title:null,source:BUILD_STUDIO_DAMAGE_SOURCE,
  rows:[],skipped:[],blockers:[],slotCount:0,rollCount:0,
  warning:'Only precisely entered, verified equipment Drop Bonus rolls can be imported. No inferred item stats, pet hatch values, ACS, or DPS.'};
 if(!build||typeof build!=='object'||!build.equipment||typeof build.equipment!=='object'){
  result.blockers.push('No Build Studio equipment draft is available.');
  return result;
 }
 const className=String(build.className||'');
 result.className=className;
 result.title=String(build.title||'My Build').slice(0,100);
 if(!CLASS_CODES[className]){
  result.blockers.push('Choose a valid character class in Build Studio.');
  return result;
 }
 const contributions=new Map();
 for(const slot of SLOT_KEYS){
  const raw=build.equipment[slot];
  if(raw===null||raw===undefined||raw==='')continue;
  result.slotCount++;
  const entry=asGear(raw);
  const base=baseItem(entry);
  if(!entry||!base){
   result.blockers.push(slot+': unrecognized item in saved equipment draft.');
   continue;
  }
  if(!allowedItem(base,slot,className)){
   result.blockers.push(slot+': '+base.name+' is not valid in this slot for '+className+'.');
   continue;
  }
  const issues=gearIssues(entry,slot,className,build.equipment);
  if(issues.length){
   result.blockers.push(slot+': '+issues.join('; '));
   continue;
  }
  if(!entry.bonusId){
   if(raw&&typeof raw==='object'&&raw.bonusId)
    result.blockers.push(slot+': unrecognized bonus ID '+String(raw.bonusId).slice(0,50));
   continue;
  }
  const bonus=configured.get(entry.bonusId);
  if(!bonus){
   result.blockers.push(slot+': unknown bonus '+entry.bonusId+'.');
   continue;
  }
  if(!finite(entry.roll)){
   result.blockers.push(slot+': '+bonus.name+' has no exact roll. The tier min/max is not the actual value.');
   continue;
  }
  const range=bonusRange(entry.bonusId,entry.bonusTier);
  if(!range||entry.roll<range[0]||entry.roll>range[1]){
   result.blockers.push(slot+': '+bonus.name+' roll is outside the verified range.');
   continue;
  }
  const target=TARGETS[entry.bonusId];
  if(!target){
   result.skipped.push({slot,item:base.name,bonus:bonus.name,
    reason:'This verified bonus does not map to an established Damage Calculator stage.'});
   continue;
  }
  result.rollCount++;
  const row=contributions.get(target.path)||{path:target.path,channel:target.channel,total:0,parts:[],status:'exact-equipment-roll'};
  row.total+=entry.roll;
  row.parts.push({slot,item:base.name,bonus:bonus.name,roll:entry.roll,tier:entry.bonusTier});
  contributions.set(target.path,row);
 }
 result.rows=[...contributions.values()].sort((a,b)=>a.path.localeCompare(b.path));
 result.known=result.blockers.length===0 && result.rows.length>0;
 return result;
}
export function readBuildStudioDamage(store=null){
 try{
  const storage=store||globalThis.localStorage;
  if(!storage)return projectBuildStudioDamage(null);
  const raw=storage.getItem(DRAFT_KEY);
  if(!raw)return projectBuildStudioDamage(null);
  const obj=JSON.parse(raw);
  return projectBuildStudioDamage(obj);
 }catch{
  const result=projectBuildStudioDamage(null);
  result.blockers=['Could not read the saved Build Studio draft.'];
  return result;
 }
}
/**
 * Stage replacement candidate. The caller must explicitly confirm imported
 * rows and can only apply a candidate if it contains no blocking issue.
 */
export function buildStudioScenarioChanges(importPreview,baseline={}){
 if(!importPreview?.known||importPreview.blockers?.length)
  return {ok:false,changes:{},reason:'Build Studio draft requires verification before applying.'};
 const changes={},unmeasured=[];
 for(const row of importPreview.rows||[]){
  // Do not mix source provenance by adding to an existing screenshot total.
  // Even absent baseline values are safe if we explicitly replace the whole
  // equipment subtotal, with no other equipment contributing to that stage.
  if(!finite(row.total)||row.total<0||!TARGETS[Object.keys(TARGETS).find(k=>TARGETS[k].path===row.path)]){
   return {ok:false,changes:{},reason:'An import row is invalid.'};
  }
  changes[row.path]=row.total;
  if(row.path.split('.').reduce((obj,key)=>obj?.[key],baseline)===undefined)
   unmeasured.push(row.path);
 }
 return {ok:true,changes,unmeasured,
  note:'These exact equipment subtotal rows REPLACE existing same-stage totals, not add on top. Other damage sources remain untouched.'};
}
