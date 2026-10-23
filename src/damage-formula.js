// Manual tooltip calculator. No character fixtures or build state belong here.
// Stage order: archived Attack/Pet tooltips and retaliation-damage-engine.js,
// rechecked against the October 23 supplied breakdowns. See docs/damage-formula.md.
export const FORMULA_KEY='arcana-damage-formula-v1';
const group=(id,title,rows)=>({id,title,fields:rows.map(([key,label,unit='percent'])=>({key,label,unit,group:id}))});
const shared=[['guild','Guild Bonus'],['echo','Echo Blessings'],['sets','Gear Sets'],['gems','Gems'],['time','Time Boost'],['stance','Combat Stance']];
export const FORMULAS={
 attack:{name:'Attack',groups:[
  group('base','Base damage', [['weaponMin','Weapon minimum','flat'],['weaponMax','Weapon maximum','flat'],['jewelryMin','Jewelry minimum','flat'],['jewelryMax','Jewelry maximum','flat']]),
  group('additive','Additive bonuses — summed together',[['equipment','Equipment attack bonus'],['class','Class skills'],['strength','Strength (from items)'],['intelligence','Intelligence (from items)'],['talisman','Talisman attack power']]),
  group('flat','Flat bonuses — after additive bonuses',[['tree','Skill tree flat','flat'],['runes','Runes flat','flat'],['guild','Guild flat','flat']]),
  group('layers','Multiplicative layers — each stacks separately',[['inscription','Talisman Inscription'],['tree','Skill tree %'],['strength','Strength (from tree, pet, runes, gems)'],['petStrength','Pet increased strength'],['intelligence','Intelligence (from tree, pet, runes, gems)'],['petIntelligence','Pet increased intelligence'],['pet','Pet Attack bonus'],['drop','Drop Bonus'],['runes','Runes'],...shared])]},
 retaliation:{name:'Retaliation',groups:[
  group('base','Base pool',[['defense','Defense','flat'],['reflecting','Reflecting bonuses (gear)'],['deflection','Deflection (class skill)'],['bulwark','Bulwark Stance'],['ratio','Global ratio','factor']]),
  group('layers','Multiplicative layers',[['strength','Strength'],['petStrength','Pet increased strength'],['pet','Pet Retaliation bonus'],['inscription','Talisman Inscription'],['runes','Runes'],['guild','Guild Skill Tree'],['echo','Echo Blessings'],['sets','Gear Sets'],['gems','Gems'],['time','Time boost']]),
  group('event','Per enemy attack',[['minimum','Minimum roll (% of maximum)','percentOf'],['stance','Combat Stance','factor'],['blocked','Blocked attacks','factor']])]},
 pet:{name:'Pet damage',groups:[
  group('base',"One pet’s base damage",[['min','Pet base minimum','flat'],['max','Pet base maximum','flat'],['levelMin','Level scaling minimum','flat'],['levelMax','Level scaling maximum','flat']]),
  group('flat',"Flat bonuses — added to this pet’s base",[['runes','Runes','flat'],['guild','Guild Bonus','flat'],['tree','Skill Tree','flat'],['class','Class Skills','flat'],['converted','Converted attack damage','flat']]),
  group('layers','Multiplicative layers',[['equipment','Equipment Affixes'],['inscription','Talisman Inscription'],['dexterity','Dexterity'],['petDexterity','Pet increased dexterity'],['intelligence','Intelligence'],['petIntelligence','Pet increased intelligence'],['companion','Companion / Drop Bonus'],['shards','Pet Shards'],['class','Class Skills'],['tree','Skill Tree'],['runes','Runes'],...shared.slice(0,-1),['mastery','Pet Mastery (post-100)'],['stance','Combat Stance']])]}
};
export const fieldsFor=mode=>(FORMULAS[mode]||FORMULAS.attack).groups.flatMap(g=>g.fields.map(f=>({...f,id:g.id+'.'+f.key})));
export function parseNumber(raw){
 if(raw===null||raw===undefined||String(raw).trim()==='')return null;
 const s=String(raw).trim().replaceAll(',','').replace(/\s/g,'');
 const m=s.match(/^([+\-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+\-]?\d+)?)([kmbtq])?%?$/i);
 if(!m)return NaN;
 const n=Number(m[1])*({k:1e3,m:1e6,b:1e9,t:1e12,q:1e15}[m[2]?.toLowerCase()]||1);
 return Number.isFinite(n)?n:NaN;
}
export function fieldNumber(raw,unit){
 const text=String(raw??'').trim(),factor=/^[x×]/i.test(text);
 const n=parseNumber(factor?text.slice(1):text);
 if(n===null||!Number.isFinite(n))return n;
 if(factor&&unit!=='percent'&&unit!=='factor')return NaN;
 return factor&&unit==='percent'?(n-1)*100:n;
}
export function blankFormulaState(){return {mode:'attack',values:{attack:{},retaliation:{},pet:{}}};}
export function normalizeFormulaState(raw){
 const out=blankFormulaState();
 if(FORMULAS[raw?.mode])out.mode=raw.mode;
 for(const mode of Object.keys(FORMULAS))for(const f of fieldsFor(mode)){
  const v=raw?.values?.[mode]?.[f.id];
  if(typeof v==='string'&&v.length<=80)out.values[mode][f.id]=v;
 }
 return out;
}
export function readFormulaState(storage=globalThis.localStorage){try{return normalizeFormulaState(JSON.parse(storage?.getItem(FORMULA_KEY)||'null'));}catch{return blankFormulaState();}}
export function saveFormulaState(state,storage=globalThis.localStorage){try{storage?.setItem(FORMULA_KEY,JSON.stringify(normalizeFormulaState(state)));return true;}catch{return false;}}
export function calculateFormula(mode,values={}){
 const errors=[],stages=[],parsed={};
 for(const f of fieldsFor(mode)){
  const n=fieldNumber(values[f.id],f.unit);parsed[f.id]=n;
  if(n!==null&&(!Number.isFinite(n)||n<0))errors.push(f.label+' must be a valid non-negative number.');
 }
 const n=(id,otherwise=0)=>parsed[id]??otherwise;
 const sum=group=>fieldsFor(mode).filter(f=>f.group===group).reduce((a,f)=>a+n(f.id),0);
 const layers=fieldsFor(mode).filter(f=>f.group==='layers').map(f=>({label:f.label,percent:n(f.id),factor:1+n(f.id)/100}));
 const layerFactor=layers.reduce((a,f)=>a*f.factor,1);
 let min=null,max=null,blocked=null;
 const need=ids=>ids.filter(id=>parsed[id]===null).map(id=>fieldsFor(mode).find(f=>f.id===id).label);
 let missing=[];
 if(mode==='attack'){
  // A jewelry-only input is also valid; a partially entered range is not.
  const hasWeapon=parsed['base.weaponMin']!==null||parsed['base.weaponMax']!==null;
  const hasJewelry=parsed['base.jewelryMin']!==null||parsed['base.jewelryMax']!==null;
  missing=need([...(hasWeapon||!hasJewelry?['base.weaponMin','base.weaponMax']:[]),...(hasJewelry?['base.jewelryMin','base.jewelryMax']:[])]);
  min=n('base.weaponMin')+n('base.jewelryMin');max=n('base.weaponMax')+n('base.jewelryMax');
  stages.push({label:'Base total',min,max});
  const additive=1+sum('additive')/100;min*=additive;max*=additive;stages.push({label:'After additive bonuses (×'+additive.toLocaleString('en-US',{maximumFractionDigits:6})+')',min,max});
  min+=sum('flat');max+=sum('flat');stages.push({label:'After flat bonuses',min,max});
 }else if(mode==='pet'){
  missing=need(['base.min','base.max']);
  if((parsed['base.levelMin']===null)!==(parsed['base.levelMax']===null))missing.push(...need(['base.levelMin','base.levelMax']));
  min=n('base.min')+n('base.levelMin')+sum('flat');max=n('base.max')+n('base.levelMax')+sum('flat');
  stages.push({label:'Pet base + level scaling + flat bonuses',min,max});
 }else{
  missing=need(['base.defense','base.ratio','event.minimum','event.stance']);
  const pool=(n('base.reflecting')+n('base.deflection')+n('base.bulwark'))/100;
  min=max=n('base.defense')*n('base.ratio')*pool;
  if(n('event.minimum')>100)errors.push('Minimum roll must be between 0 and 100%.');
  stages.push({label:'Defense × global ratio × base pool ('+(pool*100).toLocaleString('en-US')+'%)',min,max});
 }
 for(const layer of layers){min*=layer.factor;max*=layer.factor;stages.push({label:layer.label+' ×'+layer.factor.toLocaleString('en-US',{maximumFractionDigits:6}),min,max});}
 if(mode==='retaliation'){
  max*=n('event.stance');min=max*n('event.minimum')/100;
  stages.push({label:'Combat Stance + damage range',min,max});
  if(parsed['event.blocked']!==null)blocked={min:min*n('event.blocked'),max:max*n('event.blocked')};
 }
 for(const g of FORMULAS[mode].groups.filter(g=>g.id==='base')){
  for(const [lo,hi] of mode==='attack'?[['weaponMin','weaponMax'],['jewelryMin','jewelryMax']]:mode==='pet'?[['min','max'],['levelMin','levelMax']]:[])
   if(n(g.id+'.'+lo)>n(g.id+'.'+hi))errors.push('Minimum cannot exceed maximum: '+g.fields.find(f=>f.key===lo).label+'.');
 }
 if(!Number.isFinite(min)||!Number.isFinite(max)||!Number.isFinite(layerFactor)||blocked&&(!Number.isFinite(blocked.min)||!Number.isFinite(blocked.max)))errors.push('These values exceed the supported numeric range.');
 const ready=!missing.length&&!errors.length;
 return {ready,missing,errors,min:ready?min:null,max:ready?max:null,average:ready?(min+max)/2:null,layerFactor,stages,blocked:ready?blocked:null};
}
