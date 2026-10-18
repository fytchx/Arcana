/**
 * Arcana Labs v8: verified loadout schema shared by Studio and Labs workspaces.
 * The numeric simulation of Hatch Bonus scaling is intentionally NOT implemented
 * until per-pet rarity / base bonus values are available.
 */
import {VERIFIED_GAME_DATA} from './verified-game-data.js';
import {normalizedPetBonusTargets} from './pet-simple-math.js';
import {normalizeTalismanLoadout} from './talisman-model.js';
const DATA=VERIFIED_GAME_DATA;
// Grid growth milestones read from the in-game Rune Grid expansion table (monster level, not character level).
export const RUNE_GRID_STAGES=Object.freeze([
 {ml:1,cols:2,rows:2},{ml:10,cols:3,rows:3},{ml:30,cols:4,rows:3},
 {ml:45,cols:5,rows:3},{ml:65,cols:6,rows:3},{ml:90,cols:6,rows:4},
 {ml:150,cols:6,rows:5},{ml:220,cols:6,rows:6},{ml:300,cols:6,rows:7}
]);
export const RUNE_COLS=6, RUNE_ROWS=7;
export const monsterLevelGrid=level=>{
 const lv=Math.max(1,Math.floor(Number(level)||1));
 return RUNE_GRID_STAGES.reduce((found,stage)=>lv>=stage.ml?stage:found,RUNE_GRID_STAGES[0]);
};
export const runeFitsBoard=(r,ml)=>{const {cols,rows}=monsterLevelGrid(ml);return r.x>=0&&r.y>=0&&r.x+r.w<=cols&&r.y+r.h<=rows;};
export const activeRuneBoard=(placed,ml)=>({active:(placed||[]).filter(r=>runeFitsBoard(r,ml)),inactive:(placed||[]).filter(r=>!runeFitsBoard(r,ml))});
export const RUNE_SHAPES=Object.freeze(Object.fromEntries(DATA.runeShapes.map(x=>[x.slug,{w:x.width,h:x.height,label:`${x.name} · ${x.width}×${x.height}` }])));
export const RUNE_FAMILIES=Object.freeze(DATA.runeFamilies.map(x=>x.name));
export const RUNE_FAMILY_DETAILS=Object.freeze(Object.fromEntries(DATA.runeFamilies.map(x=>[x.name,x])));
export const RUNE_SECONDARIES=Object.freeze([...DATA.runeSecondaryStats]);
export const PET_AFFIX_DEFS=Object.freeze(DATA.petAffixes);
export const PET_HATCH_BONUSES=Object.freeze(DATA.petHatchBonuses);
export const PET_AFFIX_MAX=DATA.petAffixCapacity;
export const PET_DEFAULT_AFFIX_SLOTS=DATA.petDefaultAffixSlots;
export const PET_EQUIPPED_MAX=DATA.petEquippedSlots;
export const PET_AFFIX_LABELS=Object.freeze(['None',...PET_AFFIX_DEFS.map(x=>x.display_name)]);
export const statName=key=>String(key||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()).replace('Exp Gain','EXP Gain').replace('Hp','HP');
const bounded=(val,defaultVal=0,max=999)=>{const n=Number(val);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):defaultVal};
const firstSecondary=family=>RUNE_FAMILY_DETAILS[family]?.suggestedSecondary||'critical_damage';
export function emptyPetSlot(){return {equipped:false,name:'',dropBonus:null,hatchBonus:'',compound:0,unlockedAffixSlots:PET_DEFAULT_AFFIX_SLOTS,affixes:Array.from({length:PET_AFFIX_MAX},()=>({slug:'',level:0}))};}
function normalizeAffix(x){let slug=typeof x==='string'?x:(x?.slug||x?.name||'');const def=PET_AFFIX_DEFS.find(a=>a.name===slug||a.display_name===slug);return {slug:def?.name||'',level:def?Math.max(1,bounded(x?.level,1,Number.isFinite(def.max_level)?def.max_level:999)):0};}
export function normalizePetSlot(raw,legacyName=''){
 const p=raw&&typeof raw==='object'?raw:{},old=typeof p.affix==='string'&&p.affix!=='None'?p.affix:'';
 // v7's single "affix" was actually used as a main bonus. Migrate as Hatch Bonus, never as an evolved affix.
 const oldWasEvolvedAffix=['All Class Skills','Extra Kill Chance'].includes(old);
 const hatchBonus=String(p.hatchBonus||(oldWasEvolvedAffix?'':old)||legacyName||'').trim();
 const known=PET_HATCH_BONUSES.find(k=>k===hatchBonus||statName(k)===hatchBonus);
 const normalizedBonus=known||hatchBonus;
 const affixes=Array.from({length:PET_AFFIX_MAX},(_,i)=>normalizeAffix(p.affixes?.[i]||(oldWasEvolvedAffix&&i===0?old:null)));
 const name=String(p.name||'').slice(0,90),compound=bounded(p.compound);
 const rawDrop=p.dropBonus;const dropBonus=(rawDrop===null||rawDrop===undefined||rawDrop==='')?null:(Number.isFinite(Number(rawDrop))&&Number(rawDrop)>=0?Math.min(100000000,Number(rawDrop)):null);
 const inferred=!!(name||dropBonus!==null||normalizedBonus||affixes.some(a=>a.slug)||compound);
 return {equipped:typeof p.equipped==='boolean'?p.equipped:inferred,name,dropBonus,hatchBonus:normalizedBonus,compound,unlockedAffixSlots:Math.max(PET_DEFAULT_AFFIX_SLOTS,Math.min(PET_AFFIX_MAX,bounded(p.unlockedAffixSlots,PET_DEFAULT_AFFIX_SLOTS,PET_AFFIX_MAX))),affixes};
}
export function normalizeRune(r,i){const family=RUNE_FAMILIES.includes(r?.family)?r.family:'Fury',sh=RUNE_SHAPES[r?.shape]||RUNE_SHAPES.small;
 return {id:String(r?.id||`rune-${i+1}`).slice(0,48),family,primary:RUNE_FAMILY_DETAILS[family].primary,
 secondary:RUNE_SECONDARIES.includes(r?.secondary)?r.secondary:firstSecondary(family),
 shape:r?.shape in RUNE_SHAPES?r.shape:'small',x:bounded(r?.x,0,RUNE_COLS-1),y:bounded(r?.y,0,RUNE_ROWS-1),w:sh.w,h:sh.h,level:bounded(r?.level,1,999)};
}
export function runeIssue(placed,candidate,ignoredId=null,monsterLevel=300){
 if(!candidate||!Number.isInteger(candidate.x)||!Number.isInteger(candidate.y)||!candidate.w||!candidate.h)return 'Invalid rune placement';
 if(!runeFitsBoard(candidate,monsterLevel))return `That rune does not fit the ${monsterLevelGrid(monsterLevel).cols}×${monsterLevelGrid(monsterLevel).rows} grid unlocked at ML ${monsterLevel}`;
 if(placed.some(r=>r.id!==ignoredId&&candidate.x<r.x+r.w&&candidate.x+candidate.w>r.x&&candidate.y<r.y+r.h&&candidate.y+candidate.h>r.y))return 'Another rune already occupies those squares';
 return null;
}
export function putRune(placed,candidate,monsterLevel=300){const issue=runeIssue(placed,candidate,null,monsterLevel);if(issue)return {ok:false,reason:issue,placements:placed};return {ok:true,placements:[...placed,normalizeRune(candidate,placed.length)]};}
export function removeRune(placed,id){return placed.filter(r=>r.id!==id)};
export function nextRuneId(placed){let i=1;while(placed.some(r=>r.id===`rune-${i}`))i++;return `rune-${i}`;}
export function normalizeBuild(build){
 const b=structuredClone(build||{});b.equipment=b.equipment||{};
 b.talismans=normalizeTalismanLoadout(b.talismans);
 if(!Array.isArray(b.runes))b.runes=[];
 if(!Array.isArray(b.pets))b.pets=[];
 b.runeBoard=Array.isArray(b.runeBoard)?b.runeBoard.map(normalizeRune).filter((r,i,a)=>!runeIssue(a.slice(0,i),r,null,300)):[];
 // Keep old v8 6×5 drafts usable: infer the earliest grid stage that contains their existing placements.
 const minimum=RUNE_GRID_STAGES.find(stage=>b.runeBoard.every(r=>runeFitsBoard(r,stage.ml)))?.ml||300;
 b.monsterLevel=(Number.isInteger(Number(b.monsterLevel))&&Number(b.monsterLevel)>=1)?Math.min(100000,Math.floor(Number(b.monsterLevel))):minimum;
 b.petSetup=Array.from({length:PET_EQUIPPED_MAX},(_,i)=>normalizePetSlot(b.petSetup?.[i],typeof b.pets[i]==='string'?b.pets[i]:''));
 b.pets=b.petSetup.filter(p=>p.equipped).map(p=>p.name||statName(p.hatchBonus)||'Equipped pet');
 b.petBonusTargets=normalizedPetBonusTargets(b);
 b.petMode=b.petMode==='permanent'?'permanent':'seasonal';b.schemaVersion=9;
 b.passiveAlloc=b.passiveAlloc&&typeof b.passiveAlloc==='object'?b.passiveAlloc:{};
 b.passiveFreeMode=b.passiveFreeMode===true;
 b.classAllocById=b.classAllocById&&typeof b.classAllocById==='object'?b.classAllocById:{};
 return b;
}
export function petSummary(pets,mode='seasonal'){
 const slots=Array.from({length:PET_EQUIPPED_MAX},(_,i)=>normalizePetSlot(pets?.[i]));
 const equipped=slots.filter(p=>p.equipped),minimum=equipped.length?Math.min(...equipped.map(p=>p.compound)):null;
 const spread=DATA.petEqualisation[mode==='permanent'?'permanent':'seasonal'],cap=minimum===null?null:minimum+spread;
 return {minimum,spread,cap,equippedCount:equipped.length,slots:slots.map(p=>({...p,effective:p.equipped?Math.min(p.compound,cap):null,limited:p.equipped&&p.compound>cap}))};
}
export function validateBuildData(build){const b=normalizeBuild(build),errors=[];if(b.runeBoard.length>RUNE_COLS*RUNE_ROWS)errors.push('Too many runes');
 b.runeBoard.forEach((r,i)=>{const issue=runeIssue(b.runeBoard.slice(0,i),r);if(issue)errors.push(`${r.id}: ${issue}`);if(!RUNE_SECONDARIES.includes(r.secondary))errors.push('Invalid rune secondary')});
 if(b.petSetup.length!==PET_EQUIPPED_MAX)errors.push('Expected four pet slots');
 if(!Number.isInteger(b.monsterLevel)||b.monsterLevel<1)errors.push('Invalid monster level');
 b.petSetup.forEach((p,i)=>{if(p.affixes.length!==PET_AFFIX_MAX)errors.push(`Pet ${i+1} requires ${PET_AFFIX_MAX} affix slots`);if(p.affixes.some((a,j)=>j>=p.unlockedAffixSlots&&a.slug))errors.push(`Pet ${i+1} has affixes in locked slots`)});
 return errors;
}
