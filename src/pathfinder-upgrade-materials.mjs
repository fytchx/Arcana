/* IdleArc upgrade material costs, source /api/config/game version 2026-10-17-001.
 * Generated from IdleArc_Upgrade_Materials.xlsx. Do not estimate or round material costs.
 * Awakening multiplier representation was exhaustively validated against all 4,680
 * spreadsheet rows before publication. Currency and other source-only fields survive.
 */
import {inflateSync} from 'node:zlib';
const REF=JSON.parse(inflateSync(Buffer.from('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','base64')).toString('utf8'));
const toMats=pairs=>Object.fromEntries((pairs||[]).map(([idx,qty])=>[REF.s[idx],qty]));
const toList=pairs=>(pairs||[]).map(([idx,quantity])=>({slug:REF.s[idx],quantity}));
const findEnhancement=(rows,lv)=>rows?.find(row=>Number(row.current)===lv-1&&Number(row.target)===lv);
function ensureRow(rows,level,stage){
 const row=findEnhancement(rows,level);
 if(!row)throw Error('Pathfinder source missing '+stage+' enhancement '+level+'; refusing partial patch');
 return row;
}
// Direct Forge observations from IdleArc 1.3.9 (2026-10-28), four screenshots.
// These override only the four observed awakening steps. Never extrapolate
// them across A1-A30 without a verified full server recipe export.
export const VERIFIED_FORGE_RARE_STEPS_20261028=Object.freeze([
 {rank:5,level:26,ember:2,sigil:1},
 {rank:5,level:27,ember:2,sigil:1},
 {rank:6,level:3,ember:2,sigil:1},
 {rank:6,level:7,ember:2,sigil:1}
]);
export const UPGRADE_SOURCE_VERSION=REF.v;
export function applyVerifiedUpgradeCosts(cd,materialDefinitions=[]){
 if(!cd?.tiers?.['6']?.rows||!cd?.awaken?.rows?.['30'])throw Error('Pathfinder source is incomplete');
 let tierSteps=0,awakenSteps=0,monsterEntries=0;
 for(const [tier,levels] of Object.entries(REF.l)){
  const rows=cd.tiers[tier]?.rows;
  for(const [lv,pairs] of Object.entries(levels)){
   ensureRow(rows,Number(lv),'T'+tier).monster_materials=toMats(pairs);
   tierSteps++;monsterEntries+=pairs.length;
  }
 }
 for(const [first,last,multiplier,levels] of REF.a){
  for(let rank=first;rank<=last;rank++)for(let i=0;i<levels.length;i++){
   const materialPairs=levels[i].map(([idx,base])=>[idx,Math.round(base*Math.pow(multiplier,rank-first))]);
   const row=ensureRow(cd.awaken.rows[String(rank)],i+1,'A'+rank);
   row.monster_materials=toMats(materialPairs);
   awakenSteps++;monsterEntries+=materialPairs.length;
   // Sparse 2026-10-17 source: only explicitly listed enhancement levels
   // require these rare materials. Clear stale 2026-09-29 amounts from
   // all other levels instead of accidentally preserving old per-level costs.
   const extras=REF.x[String(i+1)]||[];
   const sourceControlled=new Set(Object.values(REF.x).flat().map(([idx])=>REF.s[idx]));
   const previous=Array.isArray(row.extra_materials)?row.extra_materials:[];
   row.extra_materials=[...previous.filter(x=>!sourceControlled.has(String(x?.slug||''))),...toList(extras)];
   if(Array.isArray(row.materials))row.materials=row.materials.filter(x=>!sourceControlled.has(String(x?.slug||'')));
  }
 }
 // A small newer source of truth: verified Forge screens take precedence
 // over the sparse 2026-10-17 enhancement-material overlay.
 const rareSlugs=new Set(['abyssal-ember','eternal-sigil','primeval-core']);
 for(const step of VERIFIED_FORGE_RARE_STEPS_20261028){
  const row=ensureRow(cd.awaken.rows[String(step.rank)],step.level,'A'+step.rank);
  const keep=x=>!rareSlugs.has(String(x?.slug||''));
  const previous=Array.isArray(row.extra_materials)?row.extra_materials:[];
  row.extra_materials=[...previous.filter(keep),
   {slug:'abyssal-ember',quantity:step.ember},
   {slug:'eternal-sigil',quantity:step.sigil}];
  if(Array.isArray(row.materials))row.materials=row.materials.filter(keep);
 }
 for(const [fromTier,updated] of Object.entries(REF.t)){
  const row=cd.tier_upgrades?.find(x=>Number(x.from_tier)===Number(fromTier));
  if(!row)throw Error('Pathfinder tier transition missing '+fromTier);
  row.monster_materials=toMats(updated.m);
  if(updated.e)row.essence={slug:updated.e[0],quantity:updated.e[1]};
  if(updated.g!==null)row.gold=updated.g;
 }
 for(const [rank,pairs] of Object.entries(REF.tr)){
  const row=cd.awaken.transitions?.find(x=>Number(x.rank)===Number(rank));
  if(!row)throw Error('Pathfinder awaken transition missing '+rank);
  const slugs=new Set(pairs.map(([idx])=>REF.s[idx]));
  const previous=Array.isArray(row.materials)?row.materials:[];
  row.materials=[...previous.filter(x=>!slugs.has(String(x?.slug||''))),...toList(pairs)];
  if(Array.isArray(row.extra_materials))row.extra_materials=row.extra_materials.filter(x=>!slugs.has(String(x?.slug||'')));
 }
 const bySlug=new Map(materialDefinitions.map(x=>[x.slug,x]));
 for(const [index,meta] of Object.entries(REF.m)){
  const slug=REF.s[Number(index)],record=bySlug.get(slug);
  if(record){record.name=meta[0];record.sourceMonster=meta[1];record.sourceBiome=meta[2];record.tier=String(meta[3]);record.biome_unlock_ml=meta[4];}
 }
 if(tierSteps!==100||awakenSteps!==900||monsterEntries!==5222)throw Error('Pathfinder spreadsheet coverage mismatch: '+[tierSteps,awakenSteps,monsterEntries]);
 return {sourceVersion:REF.v,tierSteps,awakenSteps,monsterEntries};
}