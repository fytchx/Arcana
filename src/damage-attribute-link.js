/**
 * Linked attribute changes for the Arcana Damage Calculator.
 *
 * The *effective points* are player-confirmed character stat changes,
 * AFTER pet Increased INT/STR/DEX and other scaling has happened. This
 * does not infer any hidden scaling or auto-convert %INT hatch bonuses.
 *
 * Item and non-item STR/INT go into DIFFERENT attack tooltip stages.
 * Pet INT/DEX use their own separate measured total-stat layers.
 * Combat chance changes are shown separately, NEVER multiplied into DPS.
 */
import {ATTRIBUTE_RATES,calculateAttack,calculatePet,combatReference,relativeDifference} from './damage-calculator-engine.js';

const CHANNELS=Object.freeze({
 STR:{item:'attack.additive.strengthFromItems',other:'attack.layers.strengthOther',
      attackRate:ATTRIBUTE_RATES.strengthAttack,retaliationRate:ATTRIBUTE_RATES.strengthRetaliation},
 INT:{item:'attack.additive.intelligenceFromItems',other:'attack.layers.intelligenceOther',
      attackRate:ATTRIBUTE_RATES.intelligenceAttack,
      pet:'pet.layers.intelligence',petRate:ATTRIBUTE_RATES.intelligencePet,
      combat:'combat.doubleDamageChance',combatRate:ATTRIBUTE_RATES.intelligenceDoubleDamageChance},
 DEX:{pet:'pet.layers.dexterity',petRate:ATTRIBUTE_RATES.dexterityPet,
      dodgeRate:ATTRIBUTE_RATES.dexterityDodgeChance},
});
const measured=value=>value!==null&&value!==undefined&&value!==''&&
 Number.isFinite(Number(value));
const get=(object,path)=>path.split('.').reduce((obj,key)=>obj?.[key],object);
const set=(object,path,value)=>{
 const segments=path.split('.');let cursor=object;
 for(const part of segments.slice(0,-1))cursor=cursor[part] ||= {};
 cursor[segments[segments.length-1]]=value;
};
const clone=object=>JSON.parse(JSON.stringify(object));

/**
 * Returns a pure source-preserving proposal, not a mutation or validated
 * in-game build. A missing stage is always skipped, never filled with zero.
 * Origin is required for STR/INT hero attack to choose the correct stage.
 */
export function previewLinkedAttributeChange(build={},input={}){
 const stat=String(input.stat||'').toUpperCase();
 if(!CHANNELS[stat])throw new RangeError('Choose STR, INT, or DEX');
 const delta=Number(input.effectivePoints);
 if(!measured(input.effectivePoints)||delta===0||Math.abs(delta)>1000000)
  throw new RangeError('Enter a nonzero effective stat-point change within 1,000,000 points');
 const origin=stat==='DEX'?'total':input.origin;
 if(stat!=='DEX'&&origin!=='item'&&origin!=='other')
  throw new RangeError('Select item or non-item source for STR/INT');
 const config=CHANNELS[stat];
 const paths=[];
 if(config.attackRate)paths.push({
  path:config[origin],rate:config.attackRate,kind:'attack',
  detail:'Source-aware Attack Damage tooltip stage'});
 if(config.petRate)paths.push({
  path:config.pet,rate:config.petRate,kind:'pet',
  detail:'Total effective stat Pet Damage layer'});
 if(config.combatRate)paths.push({
  path:config.combat,rate:config.combatRate,kind:'combat',
  detail:'Double Damage chance only, not unconditional damage'});
 const candidate=clone(build);
 const applied=[],skipped=[];
 for(const {path,rate,kind,detail} of paths){
  const before=get(build,path);
  if(!measured(before)){
   skipped.push({path,kind,reason:'Baseline source not measured; enter this tooltip field first'});
   continue;
  }
  const after=Number(before)+delta*rate;
  if(!Number.isFinite(after)||after<0){
   skipped.push({path,kind,reason:'Result would be below zero or invalid'});
   continue;
  }
  set(candidate,path,after);
  applied.push({path,kind,detail,original:Number(before),
    proposed:after,change:delta*rate,unit:'percentage points'});
 }
 const a=calculateAttack(build.attack),b=calculateAttack(candidate.attack);
 const petA=calculatePet(build.pet),petB=calculatePet(candidate.pet);
 const petMeasured=Object.values(build.pet?.layers||{}).some(measured);
 const heroAttack=applied.some(x=>x.kind==='attack')&&a.known ? {
  baseline:{min:a.min,max:a.max},
  proposed:{min:b.min,max:b.max},
  changeMin:relativeDifference(a.min,b.min),
  changeMax:relativeDifference(a.max,b.max),
  complete:a.complete,
 }:null;
 const petMultiplier=applied.some(x=>x.kind==='pet')&&petMeasured ? {
  baseline:petA.layerFactor,proposed:petB.layerFactor,
  change:relativeDifference(petA.layerFactor,petB.layerFactor),
 }:null;
 const ddChange=applied.find(x=>x.path==='combat.doubleDamageChance');
 const overflow=ddChange?{
  baseline:combatReference(build.combat).doubleDamage,
  proposed:combatReference(candidate.combat).doubleDamage,
 }:null;
 return {
  stat,effectivePoints:delta,origin,
  // These are verified per-effective-point rates, NOT an automatic projection
  // of the source stat's percentage bonuses through a hidden base pool.
  knownRates:{
   attackPctPoints:config.attackRate?delta*config.attackRate:null,
   petPctPoints:config.petRate?delta*config.petRate:null,
   doubleDamageChancePoints:config.combatRate?delta*config.combatRate:null,
   retaliationStrengthPctPoints:config.retaliationRate?delta*config.retaliationRate:null,
   dodgeChancePoints:config.dodgeRate?delta*config.dodgeRate:null,
  },
  applied,skipped,heroAttack,petMultiplier,doubleDamage:overflow,
  measured:applied.length>0,full:applied.length===paths.length,
  notes:[
   'Inputs are effective character stat points after all Increased Stat scaling.',
   'Effects are added only to existing measured sources; other stages are never invented.',
   'Retaliation STR and DEX dodge rates are shown as reference deltas, not silently added to unverified screen stages.',
   'Double Damage chance is not an unconditional attack multiplier or real DPS.',
  ],
 };
}
