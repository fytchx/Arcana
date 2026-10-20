/* Oct 17 IdleArc game-config material facts, independently cross-checked
 * against every row in IdleArc_Upgrade_Materials.xlsx.
 *
 * Do not extrapolate these tables: 542 normal enhancement entries, 4680
 * awakening enhancement entries, 5 rarity transitions and 30 rank transitions.
 * Gold, fragments and chance estimates remain from the existing verified
 * legacy reference until their formulas can be validated separately. */
import {readFile} from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
const sourceFile=new URL('../data/pathfinder-monster-materials-2026-10-17.b64',import.meta.url);
export const PATHFINDER_MATERIAL_SOURCE='2026-10-17-001';
let cached=null;
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validTable=(row)=>plain(row)&&Object.entries(row).every(([slug,n])=>/^[a-z0-9-]+$/.test(slug)&&Number.isSafeInteger(n)&&n>0);
export async function oct17MaterialRules(){
 if(cached)return cached;
 const encoded=(await readFile(sourceFile,'utf8')).trim();
 if(!/^[A-Za-z0-9+/=]+$/.test(encoded)||encoded.length<10000||encoded.length>50000)throw Error('Invalid pinned material reference');
 const raw=inflateSync(Buffer.from(encoded,'base64'),{maxOutputLength:220000});
 const rules=JSON.parse(raw.toString('utf8'));
 if(!String(rules.v||'').startsWith(PATHFINDER_MATERIAL_SOURCE))throw Error('Material source version mismatch');
 for(const [tier,max] of [[1,4],[2,9],[3,14],[4,19],[5,24],[6,30]]){
  const levels=rules.t?.[tier];
  if(Object.keys(levels||{}).length!==max)throw Error('Tier '+tier+' material levels missing');
  for(let n=1;n<=max;n++)if(!validTable(levels[n]))throw Error('Incomplete T'+tier+' +'+n);
 }
 for(let rank=1;rank<=30;rank++){
  const levels=rules.a?.[rank];
  if(Object.keys(levels||{}).length!==30)throw Error('A'+rank+' material levels missing');
  for(let n=1;n<=30;n++)if(!validTable(levels[n]))throw Error('Incomplete A'+rank+' +'+n);
 }
 for(let tier=1;tier<=5;tier++)if(!validTable(rules.c?.[tier]))throw Error('Tier transition '+tier+' missing');
 if(!plain(rules.e)||!plain(rules.x))throw Error('Missing awakening supplemental materials');
 cached=Object.freeze(rules);
 return cached;
}
const copy=x=>JSON.parse(JSON.stringify(x));
const listMats=m=>Object.entries(m||{}).map(([slug,quantity])=>({slug,quantity}));
/** Replace *only material facts* in old codex rows, fail closed if indexing changes. */
export function applyOct17MaterialRules(snapshot,rules){
 if(!snapshot?.codex?.tiers||!snapshot.codex.awaken?.rows||!Array.isArray(snapshot.codex.tier_upgrades))throw Error('Legacy upgrade data unavailable');
 const next=copy(snapshot),codex=next.codex;
 for(let tier=1;tier<=6;tier++){
  const rows=codex.tiers[String(tier)]?.rows;
  const current=rules.t[String(tier)];
  if(!Array.isArray(rows)||rows.length!==Object.keys(current).length)throw Error('Tier '+tier+' recipe shape changed');
  const seen=new Set();
  for(const row of rows){
   const level=Number(row.target??Number(row.current)+1);
   if(!Number.isSafeInteger(level)||!current[String(level)]||seen.has(level))throw Error('Tier '+tier+' target mapping invalid');
   seen.add(level);row.monster_materials=copy(current[String(level)]);
   delete row.unknown_monster_materials;
  }
 }
 for(let rank=1;rank<=30;rank++){
  const rows=codex.awaken.rows[String(rank)],current=rules.a[String(rank)];
  if(!Array.isArray(rows)||rows.length!==30)throw Error('Awaken '+rank+' recipe shape changed');
  const seen=new Set();
  for(const row of rows){
   const level=Number(row.target??Number(row.current)+1);
   if(!Number.isSafeInteger(level)||!current[String(level)]||seen.has(level))throw Error('Awaken '+rank+' target mapping invalid');
   seen.add(level);row.monster_materials=copy(current[String(level)]);
   // Extra material thresholds are specified per enhancement level, not rank.
   row.extra_materials=copy(rules.e[String(level)]||[]);
   delete row.unknown_monster_materials;
  }
 }
 for(let tier=1;tier<=5;tier++){
  const step=codex.tier_upgrades.find(x=>Number(x.from_tier)===tier);
  if(!step)throw Error('Tier '+tier+' transition missing');
  step.monster_materials=copy(rules.c[String(tier)]);
  delete step.unknown_monster_materials;
 }
 const transitions=codex.awaken.transitions;
 if(!Array.isArray(transitions)||transitions.length<30)throw Error('Awaken transition reference incomplete');
 for(let rank=1;rank<=30;rank++){
  const row=transitions.find(x=>Number(x.rank)===rank);
  if(!row)throw Error('A'+rank+' transition missing');
  // Actual config uses only these transition materials, with fallback thresholds.
  const available=Object.keys(rules.x).map(Number).filter(x=>x<=rank).sort((a,b)=>b-a);
  const key=available[0];
  if(!key||!Array.isArray(rules.x[String(key)]))throw Error('A'+rank+' transition material level unavailable');
  row.materials=copy(rules.x[String(key)]);
  row.extra_materials=[];row.monster_materials={};
 }
 next.materialSourceVersion=PATHFINDER_MATERIAL_SOURCE;
 next.materialSource='IdleArc /api/config/game itemization, verified 2026-10-17';
 next.sourceVersion=(snapshot.sourceVersion||'legacy cost snapshot')+' · materials '+PATHFINDER_MATERIAL_SOURCE;
 return next;
}
