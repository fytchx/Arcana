
/**
 * One user-owned IdleArc character for Studio and calculators.
 * This file is intentionally pure and knows nothing about browsers, endpoints
 * or screenshot references. New API adapters can normalize to this model.
 */
import {normalizeBuild} from './labs-engine.js';
import {blankDamageBuild,calculateAttack,calculatePet,relativeDifference} from './damage-calculator-engine.js';
import {calculateRetaliation} from './retaliation-damage-engine.js';
import {compareTalismanLoadouts} from './talisman-model.js';

const clone=value=>structuredClone(value);
const num=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value));
const same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
const MAX_NAME=80;
const label=(name)=>String(name||'Sandbox build').slice(0,MAX_NAME);
export const SANDBOX_SCHEMA=1;

export function emptySandboxCharacter(className='Warrior'){
 return normalizeSandboxCharacter({
  id:'local-draft',title:'My Sandbox',className,version:'LOCAL',
  summary:'An editable character to experiment with.',equipment:{},
  runes:[],runeBoard:[],pets:[],skills:[],petSetup:[],
  talismans:[],monsterLevel:1,passiveAlloc:{},classAllocById:{}
 });
}
export function normalizeDamageProfile(raw){
 const blank=blankDamageBuild(),input=raw&&typeof raw==='object'?raw:{};
 const source=(obj,template,depth=0)=>{
  const out={};
  for(const [key,defaultValue] of Object.entries(template)){
   const value=obj?.[key];
   if(defaultValue&&typeof defaultValue==='object'&&!Array.isArray(defaultValue))
    out[key]=source(value,defaultValue,depth+1);
   else out[key]=num(value)?Number(value):null;
  }
  // Explicit data channels in the verified damage-engine fixture vocabulary.
  // Allow known numeric named sources, not arbitrary object keys/strings.
  if(depth>0)for(const [key,value] of Object.entries(obj||{})){
   if(!Object.hasOwn(out,key)&&/^[a-zA-Z][a-zA-Z0-9_]{0,60}$/.test(key)&&num(value)&&typeof value!=='object')
    out[key]=Number(value);
  }
  return out;
 };
 return {
  className:'Custom',
  attack:source(input.attack,blank.attack),
  pet:source(input.pet,blank.pet),
  combat:source(input.combat,blank.combat),
  retaliation:source(input.retaliation,blank.retaliation),
 };
}
/** Character snapshots preserve entered parts without inventing missing stats. */
export function normalizeSandboxCharacter(input){
 const raw=input&&typeof input==='object'?input:{};
 const build=normalizeBuild(raw);
 build.title=label(build.title);
 build.damageProfile=normalizeDamageProfile(build.damageProfile);
 build.sandboxSchema=SANDBOX_SCHEMA;
 return build;
}
export function sandboxCharacterSummary(raw){
 const build=normalizeSandboxCharacter(raw);
 const equipment=Object.values(build.equipment||{}).filter(Boolean).length;
 const pets=build.petSetup.filter(p=>p.equipped).length;
 const runes=build.runeBoard.length;
 const talismans=build.talismans.filter(t=>t.slug).length;
 const allocations=Object.values(build.classAllocById||{}).reduce((n,v)=>{
  if(!v||typeof v!=='object')return n;
  return n+Object.values(v).filter(x=>num(x?.allocated)&&Number(x.allocated)>0||num(x)&&Number(x)>0).length;
 },0);
 const knownInputCount=(function collect(node){return Object.values(node||{}).reduce((n,v)=>n+(v&&typeof v==='object'?collect(v):num(v)?1:0),0)})(build.damageProfile.attack)+
 (function collect(node){return Object.values(node||{}).reduce((n,v)=>n+(v&&typeof v==='object'?collect(v):num(v)?1:0),0)})(build.damageProfile.pet)+
 (function collect(node){return Object.values(node||{}).reduce((n,v)=>n+(v&&typeof v==='object'?collect(v):num(v)?1:0),0)})(build.damageProfile.combat)+
 (function collect(node){return Object.values(node||{}).reduce((n,v)=>n+(v&&typeof v==='object'?collect(v):num(v)?1:0),0)})(build.damageProfile.retaliation);
 return {title:build.title,className:build.className||'Warrior',equipment,pets,runes,talismans,allocations,knownInputCount,
  monsterLevel:build.monsterLevel};
}
const SLOTS=['weapon','offhand','head','chest','hands','feet','belt','ring','ring2','neck','torch'];
export function sandboxChangeLedger(rawBefore,rawAfter){
 const a=normalizeSandboxCharacter(rawBefore),b=normalizeSandboxCharacter(rawAfter),rows=[];
 const add=(category,label,before,after)=>{
  if(!same(before,after))rows.push({category,label,before:clone(before??null),after:clone(after??null)});
 };
 if(a.className!==b.className)add('character','Class',a.className,b.className);
 for(const key of SLOTS)add('gear',key,a.equipment?.[key],b.equipment?.[key]);
 for(let i=0;i<4;i++)add('pets','Pet '+(i+1),a.petSetup[i],b.petSetup[i]);
 for(let i=0;i<2;i++)add('talismans','Talisman '+(i+1),a.talismans[i],b.talismans[i]);
 add('runes','Rune grid',a.runeBoard,b.runeBoard);
 add('skills','Class skill allocations',a.classAllocById,b.classAllocById);
 add('skills','Skill list',a.skills,b.skills);
 add('passives','Passive allocations',a.passiveAlloc,b.passiveAlloc);
 // Damage fields are manually measured from tooltips, not automatically derived
 // from gear/pets/runes unless their exact provenance can be established.
 for(const key of ['attack','pet','combat','retaliation'])
  add('stats',key+' observations',a.damageProfile[key],b.damageProfile[key]);
 return rows;
}
const total=rows=>rows.reduce((n,row)=>n+Number(row.amount||0),0);
export function compareSandboxCharacters(rawBefore,rawAfter){
 const a=normalizeSandboxCharacter(rawBefore),b=normalizeSandboxCharacter(rawAfter);
 const changes=sandboxChangeLedger(a,b),changedCategories=[...new Set(changes.map(row=>row.category))];
 const talismans=compareTalismanLoadouts(a.talismans,b.talismans);
 const independentChanges=changedCategories.filter(x=>x!=='stats');
 const aAttack=calculateAttack(a.damageProfile.attack),bAttack=calculateAttack(b.damageProfile.attack);
 const aPet=calculatePet(a.damageProfile.pet),bPet=calculatePet(b.damageProfile.pet);
 const aRet=calculateRetaliation(a.damageProfile.retaliation),bRet=calculateRetaliation(b.damageProfile.retaliation);
 const measuredStats=changedCategories.includes('stats');
 const compare=(before,after,known)=>known?relativeDifference(before,after)?.percentChange??null:null;
 const numbers={
  // Do not attribute a gear or pet change to unrelated unchanged screenshot
  // aggregates. Each displayed number describes only MANUALLY edited fields.
  attack:compare(aAttack.min,bAttack.min,measuredStats&&aAttack.complete&&bAttack.complete),
  petMultiplier:compare(aPet.layerFactor,bPet.layerFactor,measuredStats&&
   Object.keys(a.damageProfile.pet.layers||{}).length>0&&Object.keys(b.damageProfile.pet.layers||{}).length>0),
  retaliation:compare(aRet.max,bRet.max,measuredStats&&aRet.known&&bRet.known),
 };
 const knownNumberCount=Object.values(numbers).filter(x=>x!==null).length;
 const warn=independentChanges.length?
  'Gear, pets, runes, skills and talismans are reported as source changes. Their full damage contribution is not invented from incomplete tooltips.':'';
 return {before:sandboxCharacterSummary(a),after:sandboxCharacterSummary(b),
  changes,changedCategories,numbers,knownNumberCount,talismans,
  coverage:knownNumberCount?'partial':'sources',
  warning:warn,
  hasChanges:changes.length>0};
}

export function normalizeSandboxWorkspace(raw){
 const x=raw&&typeof raw==='object'?raw:{};
 const entry=v=>v&&typeof v==='object'?normalizeSandboxCharacter(v):null;
 const variants=Array.isArray(x.variants)?x.variants.slice(0,12).filter(v=>v&&typeof v==='object'&&typeof v.id==='string').map(v=>({
  id:v.id.slice(0,80),name:label(v.name),createdAt:typeof v.createdAt==='string'?v.createdAt.slice(0,40):'',
  character:entry(v.character)||emptySandboxCharacter(),
 })):[];
 const chosen=typeof x.compareId==='string'?x.compareId:'original';
 return {schema:SANDBOX_SCHEMA,original:entry(x.original),variants,
  compareId:chosen==='original'||variants.some(v=>v.id===chosen)?chosen:'original'};
}
export function saveSandboxStartingPoint(workspace,character){
 const w=normalizeSandboxWorkspace(workspace);
 return {...w,original:normalizeSandboxCharacter(character)};
}
export function saveSandboxVariant(workspace,character,name,id=''){
 const w=normalizeSandboxWorkspace(workspace);
 if(w.variants.length>=12)return {ok:false,workspace:w,error:'Maximum 12 variants. Delete one to save another.'};
 const ident=/^[a-zA-Z0-9_-]{1,80}$/.test(id)?id:'v'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
 const variant={id:ident,name:label(name||character?.title||'Experiment'),createdAt:new Date().toISOString(),
  character:normalizeSandboxCharacter(character)};
 return {ok:true,workspace:{...w,variants:[variant,...w.variants],compareId:variant.id},variant};
}
export function deleteSandboxVariant(workspace,id){
 const w=normalizeSandboxWorkspace(workspace);
 return {...w,variants:w.variants.filter(v=>v.id!==id),compareId:w.compareId===id?'original':w.compareId};
}
