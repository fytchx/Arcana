/* Pathfinder quick-reference engine.
 * Pure functions, no DOM, no per-character inventory and no guessed recipes.
 * The same tier/rank progression is displayed for all equipment slots because
 * this snapshot does not document slot-specific cost differences. */
import {stagesFor,REAL_EQUIPMENT_SLOTS} from './pathfinder-engine.js';

export const PATHFINDER_SLOTS=Object.freeze([
 ['head','Helmet'],['chest','Chest'],['neck','Necklace'],
 ['weapon','Main hand'],['offhand','Off hand'],['hands','Gloves'],
 ['feet','Boots'],['belt','Belt'],['ring','Ring 1'],
 ['ring2','Ring 2'],['torch','Torch']
].filter(([id])=>REAL_EQUIPMENT_SLOTS.includes(id)).map(([id,label])=>Object.freeze({id,label})));
export const MODE_LABELS=Object.freeze({normal:'Non-Awakened',awakened:'Awakened'});
export const VIEW_KEY='arcana-pathfinder-quick-reference-v1';
const safeAmount=n=>{try{const x=BigInt(String(n??'0'));return x>=0n?x:0n}catch{return 0n}};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(value))?Math.floor(Number(value)):min));
const stageIds=mode=>mode==='awakened'?Array.from({length:30},(_,i)=>'A'+(i+1)):Array.from({length:6},(_,i)=>'T'+(i+1));
export const money=n=>safeAmount(n).toLocaleString('en-US');
export function normalizeQuickView(raw={}){
 const x=raw&&typeof raw==='object'?raw:{};
 const mode=x.mode==='awakened'?'awakened':'normal';
 const ids=stageIds(mode);
 return {
  slot:PATHFINDER_SLOTS.some(s=>s.id===x.slot)?x.slot:'head',
  mode,
  stage:ids.includes(x.stage)?x.stage:ids[0],
  level:clamp(x.level,0,30)
 };
}
export function readQuickView(store=globalThis.localStorage){
 try{return normalizeQuickView(JSON.parse(store?.getItem(VIEW_KEY)||'{}'))}
 catch{return normalizeQuickView()}
}
export function saveQuickView(view,store=globalThis.localStorage){
 const v=normalizeQuickView(view);
 try{store?.setItem(VIEW_KEY,JSON.stringify(v))}catch{}
 return v;
}
export function timelineStages(snapshot,mode){
 return stagesFor(snapshot).filter(s=>mode==='awakened'?s.id.startsWith('A'):s.id.startsWith('T'));
}
export function normalizeSelection(view,snapshot){
 const v=normalizeQuickView(view),stages=timelineStages(snapshot,v.mode);
 const found=stages.find(s=>s.id===v.stage)||stages[0];
 return {...v,stage:found?.id||v.stage,level:clamp(v.level,0,found?.max??30)};
}
function recipeRow(snapshot,stage,level){
 if(!snapshot||!stage)return null;
 if(level===0){
  if(stage.id==='T1')return {gold:'0',materials:[],failure:0,free:true};
  if(stage.tier){
   return snapshot.codex?.tier_upgrades?.find(x=>Number(x.to_tier)===stage.tier)||null;
  }
  return snapshot.codex?.awaken?.transitions?.find(x=>Number(x.rank)===stage.rank)||null;
 }
 const rows=stage.tier?snapshot.codex?.tiers?.[String(stage.tier)]?.rows:snapshot.codex?.awaken?.rows?.[String(stage.rank)];
 return rows?.find(x=>Number(x.current)===level-1&&Number(x.target)===level)||null;
}
export function stepCost(snapshot,stage,level){
 if(!stage||!Number.isInteger(level)||level<0||level>stage.max)return null;
 const row=recipeRow(snapshot,stage,level);
 if(!row)return null;
 const raw=new Map(),add=(slug,value)=>{
  if(!slug||typeof slug!=='string')return;
  const qty=safeAmount(value);
  if(qty>0n)raw.set(slug,(raw.get(slug)||0n)+qty);
 };
 add(row.fragment_slug,row.fragments);
 for(const [slug,qty] of Object.entries(row.monster_materials||{}))add(slug,qty);
 if(row.essence)add(row.essence.slug,row.essence.quantity);
 const extras=row.extra_materials||row.materials||[];
 if(Array.isArray(extras))for(const mat of extras)add(mat.slug,mat.quantity);
 else for(const [slug,qty] of Object.entries(extras))add(slug,qty);
 const names=new Map((snapshot.materials||[]).map(m=>[m.slug,m.name]));
 const materials=[...raw].map(([slug,quantity])=>({slug,quantity,name:names.get(slug)||slug.replaceAll('-',' ')})).sort((a,b)=>a.name.localeCompare(b.name));
 const fail=Number(row.fail??row.failure??(row.success===undefined?0:1-Number(row.success)));
 const failureChance=Number.isFinite(fail)?Math.min(1,Math.max(0,fail)):null;
 return {stage:stage.id,level,label:level===0?'Tier / rank transition':'Enhancement +'+level,gold:safeAmount(row.gold),materials,failureChance,free:row.free===true};
}
export function chapterTotal(snapshot,stage){
 if(!stage)return null;
 let gold=0n,known=true;
 const mat=new Map();
 for(let level=0;level<=stage.max;level++){
  const cost=stepCost(snapshot,stage,level);
  if(!cost){known=false;continue}
  gold+=cost.gold;
  for(const m of cost.materials){
   const old=mat.get(m.slug)||{slug:m.slug,name:m.name,quantity:0n};
   mat.set(m.slug,{...old,quantity:old.quantity+m.quantity});
  }
 }
 return {gold,complete:known,materials:[...mat.values()].sort((a,b)=>a.name.localeCompare(b.name)),steps:stage.max+(stage.id==='T1'?0:1)};
}
export function stageStepLabel(stage,level){
 if(level>0)return stage.id+' +'+(level-1)+' → +'+level;
 if(stage.id==='T1')return 'Normal · Starting equipment';
 if(stage.id==='A1')return 'Infernal → A1';
 if(stage.tier)return 'Tier '+(stage.tier-1)+' → Tier '+stage.tier;
 return 'A'+(stage.rank-1)+' → '+stage.id;
}
export function timelineModel(snapshot,raw){
 if(!snapshot)return null;
 const view=normalizeSelection(raw,snapshot),stages=timelineStages(snapshot,view.mode),active=stages.find(s=>s.id===view.stage);
 if(!active)return null;
 const steps=Array.from({length:active.max+1},(_,level)=>stepCost(snapshot,active,level));
 return {view,stages,active,steps,step:steps[view.level],chapter:chapterTotal(snapshot,active)};
}
