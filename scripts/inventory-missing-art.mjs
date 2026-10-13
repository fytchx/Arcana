import {writeFileSync,mkdirSync} from 'node:fs';
import {resolveOfficialSprite,resolveOfficialEmblem} from '../src/assets.js';
const site = process.env.ARCANA_STAGING_URL||'https://arcana-stable-app-staging.up.railway.app';
const fetchJSON=async path=>{const r=await fetch(site+path,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(path+' HTTP '+r.status);return r.json()};
const [catalog,manifest]=await Promise.all([fetchJSON('/api/search/catalog'),fetchJSON('/official-art/manifest.json')]);
if(!Array.isArray(catalog.entries)||catalog.entries.length<480||!manifest.categories||Object.keys(manifest.categories).length<19)throw Error('Incomplete live catalog or sprite inventory');
const items=[];
for(const entry of catalog.entries){
  if(!entry||!entry.title||!entry.kind)continue;
  const sprite=resolveOfficialSprite(entry,manifest.categories);
  const emblem=sprite?null:resolveOfficialEmblem(entry,manifest);
  const status=sprite?(sprite.matchType||'exact'):(emblem?'category-emblem':'unmatched');
  items.push({kind:entry.kind,title:entry.title,id:entry.id||'',status,spriteKey:sprite?sprite.category+':'+sprite.key:emblem?emblem.category+':'+emblem.key:''});
}
const priorities=items.filter(x=>x.status==='unmatched'||x.status==='category-emblem'||x.status==='representative-pet');
const counts={};for(const x of items){(counts[x.kind]??={})[x.status]=(counts[x.kind][x.status]||0)+1;}
const doc={source:site,manifestVersion:manifest.version,inventoryTotal:items.length,counts,missing:items.filter(x=>x.status==='unmatched'),categoryEmblems:items.filter(x=>x.status==='category-emblem'),representative:items.filter(x=>x.status==='representative-pet')};
mkdirSync('qa-output',{recursive:true});
writeFileSync('qa-output/artwork-triage.json',JSON.stringify(doc,null,2)+'\n');
const groups=Object.groupBy(priorities,x=>x.kind);
const md=['# Arcana artwork review checklist','','Source: live staging Codex. Status is either no verified image, category emblem, or representative pet variant.','',...Object.entries(groups).sort(([a],[b])=>a.localeCompare(b)).flatMap(([kind,records])=>['## '+kind+' ('+records.length+')','','| Entry | Current status | Decision (Keep / Get art / Remove) |','|---|---|---|',...records.map(x=>'| '+x.title.replaceAll('|','\\|')+' | '+x.status+' | |'),''])];
writeFileSync('qa-output/artwork-triage.md',md.join('\n'));
const csv=['Category,Name,Status,Current Sprite,Decision (Keep/Get art/Remove)'];
for(const x of priorities)csv.push([x.kind,x.title,x.status,x.spriteKey,''].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','));
writeFileSync('qa-output/artwork-triage.csv',csv.join('\n')+'\n');
console.log('ARTWORK_FULL_REPORT_JSON '+JSON.stringify(doc));
console.log('ARTWORK_TOTALS '+JSON.stringify({all:items.length,needsReview:priorities.length,unmatched:doc.missing.length,categoryEmblems:doc.categoryEmblems.length,representative:doc.representative.length}));
