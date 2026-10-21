import http from 'node:http';
import {gunzipSync,gzipSync} from 'node:zlib';
import {applyVerifiedUpgradeCosts} from './src/pathfinder-upgrade-materials.mjs';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { handleWikiRequest } from './src/wiki-server.mjs';
import {handleJournalRequest} from './src/journal-server.mjs';
import {seoPageByPath,renderSeoPage} from './src/seo-pages.mjs';
import {handleTrafficRequest} from './src/traffic-server.mjs';
import { safeAccountRequest } from './src/account-server.mjs';
import {safeSiteAdminRequest} from './src/site-admin-server.mjs';
import { safeAccountBuildRequest } from './src/account-builds.mjs';
import {safeFarmingListRequest} from './src/farming-lists-server.mjs';
import { safeCommunityRequest } from './src/community-server.mjs';
import { safeGuildHubRequest } from './src/guild-hub-server.mjs';
import { safeGeneralChatRequest } from './src/general-chat-server.mjs';
import { betaFeedbackRequest } from './src/beta-feedback-server.mjs';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.PORT || 3000);
const REVISION = 'arcana-real-accounts-beta-2026-10-13';
const BASES = Object.freeze({
  catalog: 'https://arcana-guild-directory-beta-production.up.railway.app',
  lfg: 'https://lfg.arcanacompanion.xyz',
  legacyArt: 'https://arcana.up.railway.app',
  officialArt: 'https://arcana-v4-official-art-production.up.railway.app',
  codexArt: 'https://arcana-v3-preview-production.up.railway.app',
});
const LOCAL_ART = resolve(ROOT,'assets','official-art');
const REQUIRE_LOCAL_ART=process.env.ARCANA_REQUIRE_LOCAL_ART==='1';
const localArtAudit=(async()=>{
 try{
  const manifestBytes=await readFile(resolve(LOCAL_ART,'manifest.json'));
  const manifest=JSON.parse(manifestBytes.toString('utf8'));
  const checksums=JSON.parse(await readFile(resolve(LOCAL_ART,'checksums.json'),'utf8'));
  const categories=Object.keys(manifest.categories||{});
  if(categories.length<10)throw Error('Incomplete local image manifest');
  for(const name of ['manifest.json',...categories.map(c=>c+'.webp')]){
   if(!/^[a-z][a-z0-9.-]*$/.test(name)||!checksums[name])throw Error('Missing checksum for '+name);
   const bytes=name==='manifest.json'?manifestBytes:await readFile(resolve(LOCAL_ART,name));
   if(bytes.length!==checksums[name].bytes||createHash('sha256').update(bytes).digest('hex')!==checksums[name].sha256)throw Error('Artwork checksum mismatch '+name);
  }
  console.log('ARCANA_LOCAL_ART_VERIFIED',categories.length,'sprite sheets');
  return {ready:true,groups:categories.length,version:manifest.version};
 }catch(e){console.warn('ARCANA_LOCAL_ART_UNAVAILABLE',String(e));return {ready:false,groups:0,error:String(e)};}
})();
const TYPES = Object.freeze({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json; charset=utf-8'});
function send(res,status,body,headers={}) {res.writeHead(status,{'x-content-type-options':'nosniff',...headers});res.end(body);}
function json(res,status,payload,headers={}) {send(res,status,JSON.stringify(payload),{'content-type':'application/json; charset=utf-8',...headers});}
async function get(url, ms=9000) {const r=await fetch(url,{signal:AbortSignal.timeout(ms),headers:{accept:'*/*'}});return r;}
async function pipe(res,url,{mime=null,timeout=9000,limit=0,cache='no-store'}={}) {
 try {
  const upstream=await get(url,timeout);
  if(!upstream.ok){json(res,502,{error:'Upstream unavailable',status:upstream.status});return;}
  const bytes=Buffer.from(await upstream.arrayBuffer());
  if(limit && bytes.length>limit){json(res,502,{error:'Upstream response too large'});return;}
  send(res,200,bytes,{'content-type':mime || upstream.headers.get('content-type') || 'application/octet-stream','cache-control':cache});
 } catch(e){json(res,502,{error:'Upstream request failed',message:String(e.message||e)});}
}
async function lfgFeed(res) {
 const endpoints=[['listings','/api/listings'],['plans','/api/plans']];
 const scalar=['id','kind','title','leader','guild','notes','tier','minMight','maxMight','mode','status','startAt','createdAt','bumpedAt','time','timezone','applicationsCount'];
 function safeItem(x){if(!x||typeof x!=='object')return null;const o={};for(const k of scalar)if(x[k]!==undefined)o[k]=x[k];o.allowedClasses=Array.isArray(x.allowedClasses)?x.allowedClasses.slice(0,5):[];o.days=Array.isArray(x.days)?x.days.slice(0,7):[];o.members=Array.isArray(x.members)?x.members.slice(0,4).map(m=>({name:m?.name,characterClass:m?.characterClass})):[];return o;}
 const result={listings:[],plans:[],retrievedAt:new Date().toISOString(),issues:[]};
 const checks=await Promise.allSettled(endpoints.map(async([key,path])=>{const r=await get(BASES.lfg+path,7500);if(!r.ok)throw Error('status '+r.status);const txt=await r.text();if(txt.length>1500000)throw Error('Response too large');const data=JSON.parse(txt);if(!Array.isArray(data[key]))throw Error('Invalid feed');return [key,data[key]]}));
 checks.forEach((check,i)=>{const key=endpoints[i][0];if(check.status==='fulfilled')result[key]=check.value[1].slice(0,1500).map(safeItem).filter(Boolean);else result.issues.push(key+' unavailable');});
 json(res,result.issues.length===2?502:200,result,{'cache-control':'public,max-age=15'});
}
// Recover missing Codex categories from the existing verified sprite index.
// Only names and category labels are added. No invented numeric mechanics.
let catalogCache=null,catalogCachedAt=0;
async function verifiedCatalog(){
 if(catalogCache&&Date.now()-catalogCachedAt<120000)return catalogCache;
 const r=await get(BASES.catalog+'/api/search/catalog',13000);
 if(!r.ok)throw Error('Game catalog HTTP '+r.status);
 const payload=await r.json();
 if(!Array.isArray(payload.entries))throw Error('Invalid game catalog');
 let extras=[];
 try{
  const indexRes=await get(BASES.legacyArt+'/assets/atlas-map.json',9000);
  if(!indexRes.ok)throw Error('Legacy sprite index HTTP '+indexRes.status);
  const atlas=await indexRes.json();
  const existing=new Set(payload.entries.map(e=>e.id));
  for(const key of Object.keys(atlas.mapping||{})){
   const match=key.match(/^(currency|pet):([a-z0-9-]+)$/);
   if(!match)continue;
   const [,kind,slug]=match,id='game:'+kind+':'+slug;
   if(existing.has(id))continue;
   const title=slug.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ');
   extras.push({id,kind,title,subtitle:kind==='currency'?'Currency':'Pet Companion',description:kind==='currency'?'Game currency':'Pet companion',keywords:[title,slug,kind].join(' '),facts:[['Category',kind==='currency'?'Currency':'Pet companion']]});
   existing.add(id);
  }
 }catch(e){console.warn('ARCANA_CATALOG_LEGACY_ART_UNAVAILABLE',String(e));}
 catalogCache={...payload,entries:[...payload.entries,...extras]};
 catalogCachedAt=Date.now();
 console.log('ARCANA_CATALOG_COUNTS',JSON.stringify({original:payload.entries.length,additional:extras.length,currencies:extras.filter(e=>e.kind==='currency').length,pets:extras.filter(e=>e.kind==='pet').length}));
 return catalogCache;
}
let previewRecipe=null,previewRecipeTime=0;
let recipeZip=null,recipeZipRef=null;
async function sourceBackedRecipes(){
 if(previewRecipe&&Date.now()-previewRecipeTime<3600000)return previewRecipe;
 const response=await get(BASES.legacyArt+'/assets/data.b64',12000);
 if(!response.ok)throw Error('Verified reference HTTP '+response.status);
 const source=(await response.text()).trim();
 if(source.length<20000||source.length>300000||!/^[A-Za-z0-9+/=]+$/.test(source))throw Error('Invalid reference encoding');
 const raw=gunzipSync(Buffer.from(source,'base64'),{maxOutputLength:1800000});
 const data=JSON.parse(raw.toString('utf8')),cd=data.codex;
 if(!cd?.tiers?.['6']?.rows||!cd.awaken?.rows?.['30']||!Array.isArray(data.materials))throw Error('Upgrade data incomplete');
 const verifiedCosts=applyVerifiedUpgradeCosts(cd,data.materials);
 previewRecipe={source:'Arcana game-cost snapshot',sourceVersion:String(cd.source_version||'')+' / upgrade materials '+verifiedCosts.sourceVersion,verifiedDate:String(cd.verified_date||''),
 codex:{tiers:Object.fromEntries(Object.entries(cd.tiers).map(([k,v])=>[k,{name:v.name,max_level:v.max_level,rows:v.rows}])),
 tier_upgrades:cd.tier_upgrades,awaken:{rows:Object.fromEntries(Object.entries(cd.awaken.rows).filter(([k])=>Number(k)>=1&&Number(k)<=30)),transitions:cd.awaken.transitions.filter(x=>Number(x.rank)<=30)}},
 materials:data.materials.map(m=>({slug:m.slug,name:m.name,type:m.type,monster_id:m.monster_id??null,
  sourceBiome:typeof (m.sourceBiome??m.biome_name??m.biome)==='string'?(m.sourceBiome??m.biome_name??m.biome):'',
  sourceMonster:typeof (m.sourceMonster??m.monster_name)==='string'?(m.sourceMonster??m.monster_name):'',
  tier:typeof (m.tier??m.biome_tier)==='string'||typeof (m.tier??m.biome_tier)==='number'?String(m.tier??m.biome_tier):''}))};
 // Pathfinder costs are independent of the remote monster catalog.
 previewRecipeTime=Date.now();return previewRecipe;
}

const server=http.createServer(async(req,res)=>{
 try {
  const parsedUrl=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  const {pathname}=parsedUrl;
  // One canonical customer-facing origin. Keep preview health checks available,
  // but prevent www sessions and staging logins from creating separate identities.
  const host=String(req.headers.host||'').toLowerCase().replace(/:[0-9]+$/,'');
  const primary=String(process.env.ARCANA_AUTH_BASE_URL||'').replace(/[/]$/,'');
  const isPublicDomain=primary==='https://arcanacompanion.xyz';
  if(isPublicDomain&&host==='www.arcanacompanion.xyz'){
   res.writeHead(308,{'location':primary+(req.url||'/'),'cache-control':'no-store'});res.end();return;
  }
  if(isPublicDomain&&host==='arcana-stable-app-staging.up.railway.app'&&pathname==='/api/account/login'){
   res.writeHead(302,{'location':primary+'/#/account','cache-control':'no-store'});res.end();return;
  }
  if(pathname==='/__ui-debug'&&req.method==='GET'){send(res,200,"<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Arcana UI Check</title><style>\nbody{background:#0d1019;color:#f3efff;font:14px/1.5 system-ui;margin:0 auto;padding:18px;max-width:620px}h1{font-size:21px}\np{color:#c7c4d5}pre{padding:13px;overflow-wrap:anywhere;white-space:pre-wrap;border:1px solid #52456d;border-radius:12px;background:#1c1a2d;font:12px/1.55 monospace}button{color:#100c17;background:#b79aff;border:0;padding:12px 16px;border-radius:10px;font-weight:750;font-size:14px}iframe{display:block;margin-top:14px;width:100%;height:650px;border:1px solid #52456d;border-radius:12px;background:#0d1019}\n</style></head><body><h1>Arcana Browser Check</h1><p>Your server is healthy. This checks whether the actual app can load in this browser. Nothing is changed or saved.</p><pre id=\"report\" aria-live=\"polite\">Starting browser test…</pre><button id=\"copy\">Copy results</button> <button id=\"open\" type=\"button\">Open full Arcana</button><iframe id=\"sample\" src=\"/?arcana-diagnostic=1#/home\" title=\"Arcana test screen\"></iframe><script>\nconst report=document.getElementById('report'),sample=document.getElementById('sample');const out=[];let started=false;function print(m){out.push(m);report.textContent=out.join('\\n')}\nasync function resource(path){try{const r=await fetch(path,{cache:'no-store',signal:AbortSignal.timeout(8000)});print(path+' -> '+r.status)}catch(e){print(path+' -> '+String(e))}}\nasync function check(){if(started)return;started=true;print('Browser: '+navigator.userAgent.replace(/\\([^)]*\\)/g,'(device)').slice(0,125));await Promise.all(['/health','/src/app.js','/src/theme.js','/src/launch-navigation.js','/src/general-chat.js','/arcana-contour.css'].map(resource));\nawait new Promise(r=>setTimeout(r,1400));let doc;try{doc=sample.contentDocument}catch(e){print('Cannot inspect app frame: '+e);return;}if(!doc){print('App document unavailable');return;}\nconst main=doc.getElementById('content'),hero=doc.querySelector('.launchHero'),dock=doc.getElementById('arcanaDock');print('Page status: '+doc.readyState);print('Hero present: '+!!hero);if(hero){const rect=hero.getBoundingClientRect(),style=doc.defaultView.getComputedStyle(hero);print('Hero visible: '+(rect.width>100&&rect.height>100&&style.display!=='none'&&style.visibility!=='hidden')+' ('+Math.round(rect.width)+'x'+Math.round(rect.height)+')');}print('Dock present: '+!!dock+', buttons: '+(dock?.querySelectorAll('button').length||0));print('Text: '+(main?.innerText||'').trim().slice(0,220));print('Load recovery: '+(doc.querySelector('#arcanaLoadRecovery')?.innerText||'none').slice(0,240));\nif(!hero){print('Rechecking app module import…');const id='arcana-check-'+Date.now();await new Promise(resolve=>{const handler=e=>{if(e.data?.id!==id)return;window.removeEventListener('message',handler);print('Import result: '+String(e.data.message).slice(0,1500));resolve()};window.addEventListener('message',handler);const script=doc.createElement('script');script.type='module';script.textContent='import(\"/src/app.js?arcana-ui-check='+Date.now()+'\").then(()=>parent.postMessage({id:'+JSON.stringify(id)+',message:\"module imported successfully\"},\"*\")).catch(e=>parent.postMessage({id:'+JSON.stringify(id)+',message:String(e.stack||e.message||e)},\"*\"))';doc.body.append(script);setTimeout(()=>{window.removeEventListener('message',handler);resolve()},7000)})}\nelse{const tab=doc.querySelector('#arcanaDock [data-route=\"featured\"]');tab?.click();await new Promise(r=>setTimeout(r,500));print('Featured button works: '+!!doc.querySelector('.arcanaFeaturedPage'));doc.querySelector('#arcanaDock [data-route=\"home\"]')?.click();}\nprint('Browser check complete.')}\nsample.addEventListener('load',check);setTimeout(check,11000);document.getElementById('open').addEventListener('click',()=>location.assign('/?arcana-direct='+Date.now()+'#/home'));document.getElementById('copy').addEventListener('click',()=>navigator.clipboard.writeText(report.textContent).then(()=>document.getElementById('copy').textContent='Copied').catch(()=>window.prompt('Copy results',report.textContent)));\n</script></body></html>",{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return;}
   if(pathname.startsWith('/api/account/builds')&&await safeAccountBuildRequest(req,res,parsedUrl))return;
   if(pathname.startsWith('/api/account/farming-lists')&&await safeFarmingListRequest(req,res,parsedUrl))return;
  if((pathname.startsWith('/api/account/')||pathname.startsWith('/api/profiles/')||pathname.startsWith('/api/admin/roles/'))&&await safeAccountRequest(req,res,parsedUrl))return;
  if(pathname.startsWith('/api/community/')&&await safeCommunityRequest(req,res,parsedUrl))return;
  if(pathname.startsWith('/api/guild-hub')&&await safeGuildHubRequest(req,res,parsedUrl))return;
   if(pathname.startsWith('/api/chat/')&&await safeGeneralChatRequest(req,res,parsedUrl))return;
  if(pathname.startsWith('/api/beta/')&&await betaFeedbackRequest(req,res,parsedUrl))return;
  if(await handleWikiRequest(req,res,pathname))return;
  if(await handleTrafficRequest(req,res,parsedUrl))return;
  if(await safeSiteAdminRequest(req,res,parsedUrl))return;
  if((req.method==='GET'||req.method==='HEAD')&&seoPageByPath(pathname)){
   const indexable=host==='arcanacompanion.xyz';
   const page=renderSeoPage(seoPageByPath(pathname),{indexable});
   send(res,200,req.method==='HEAD'?null:page,{'content-type':'text/html; charset=utf-8','cache-control':'no-store',...(indexable?{}:{'x-robots-tag':'noindex, nofollow'})});
   return;
  }
  if((req.method==='GET'||req.method==='HEAD')&&pathname.length>1&&pathname.endsWith('/')&&seoPageByPath(pathname.slice(0,-1))){
   res.writeHead(308,{'location':pathname.slice(0,-1),'cache-control':'no-store'});res.end();return;
  }
  if(await handleJournalRequest(req,res,parsedUrl))return;
  if(req.method!=='GET'&&req.method!=='HEAD'){send(res,405,'Method not allowed');return;}
  if(pathname==='/health'||pathname==='/__health') {const art=await localArtAudit;const ok=!REQUIRE_LOCAL_ART||art.ready;json(res,ok?200:503,{ok,release:REVISION,source:'tracked frontend files',artwork:{local:art.ready,groups:art.groups,version:art.version||null},dependencyEndpoints:Object.keys(BASES)});return;}
  if(pathname==='/api/lfg/public'){await lfgFeed(res);return;}
  if(pathname==='/api/pathfinder/recipes'){
   try{
    const recipe=await sourceBackedRecipes();
    const headers={'cache-control':'public,max-age=900','vary':'Accept-Encoding'};
    if(String(req.headers['accept-encoding']||'').includes('gzip')){
     if(recipeZipRef!==recipe){recipeZip=gzipSync(Buffer.from(JSON.stringify(recipe)));recipeZipRef=recipe;}
     send(res,200,req.method==='HEAD'?null:recipeZip,{'content-type':'application/json; charset=utf-8','content-encoding':'gzip',...headers});
    }else json(res,200,recipe,headers);
   }
   catch(error){console.warn('PATHFINDER_SOURCE_UNAVAILABLE',String(error));json(res,503,{error:'Verified upgrade data unavailable. Costs hidden to avoid guesses.'},{'cache-control':'no-store'});}
   return;
  }
  if(pathname==='/api/search/catalog'){try{json(res,200,await verifiedCatalog(),{'cache-control':'no-store'});}catch(e){json(res,502,{error:'Verified catalog unavailable'});}return;}
  if(pathname==='/api/guilds'){await pipe(res,BASES.catalog+pathname,{mime:'application/json; charset=utf-8',limit:500000});return;}
  if(pathname==='/game-assets/map'||pathname==='/game-assets/atlas'||pathname==='/game-assets/skill-tree'){
    const mapping={'/game-assets/map':'/assets/atlas-map.json','/game-assets/atlas':'/assets/atlas.webp','/game-assets/skill-tree':'/assets/skill-tree.json'};
    await pipe(res,BASES.legacyArt+mapping[pathname],{timeout:10000,cache:'public,max-age=180'});return;
  }
  if(/^\/codex-art\/(?:status|manifest\.json|skills\.webp|monsters\.webp|biomes\.webp|materials\.webp)$/.test(pathname)) {
    await pipe(res,BASES.codexArt+pathname,{timeout:10000,cache:'public,max-age=180'});return;
  }
  if(/^\/official-art\/(?:manifest\.json|[a-z][a-z0-9-]*\.webp)$/.test(pathname)) {
    const art=await localArtAudit;
    if(art.ready){
      const name=pathname.slice('/official-art/'.length), bytes=await readFile(resolve(LOCAL_ART,name));
      send(res,200,req.method==='HEAD'?null:bytes,{'content-type':TYPES[extname(name)]||'application/octet-stream','x-arcana-art-origin':'verified-git-source','cache-control':name.endsWith('.json')?'no-store':'public,max-age=300'});
      return;
    }
    if(REQUIRE_LOCAL_ART){json(res,503,{error:'Validated artwork bundle unavailable'});return;}
    await pipe(res,BASES.officialArt+pathname.slice('/official-art'.length),{timeout:14000,cache:'public,max-age=180'});return;
  }
  const normalized=pathname==='/'?'/index.html':pathname;
  // Serve only public frontend assets. Never expose account/session files or local Wiki data.
  const publicPage=new Set(['/index.html','/privacy.html','/beta-rules.html','/styles.css','/wiki-studio.css','/community.css','/guild-hub.css','/beta.css','/launch-navigation.css','/pathfinder-timeline.css','/quick-tools.css','/home-three.css','/arcana-contour.css','/theme-studio-finishes.css','/signature-themes.css','/theme-seamless.css','/psychedelic-themes.css','/desktop-home-refinement.css','/arcana-connected-ux.css','/home-atlas.css','/atlas-atelier-textures.css','/traffic.css','/admin.css','/journal.css','/journal-widgets.css','/journal-studio.js','/googledcf6cfe1a260efea.html']).has(normalized);
  const publicModule=/^\/src\/[a-z][a-z0-9-]*\.js$/.test(normalized);
  const publicAsset=/^\/assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:webp|svg|png|jpg|jpeg|json)$/.test(normalized);
  if(!publicPage&&!publicModule&&!publicAsset){send(res,404,'Not found');return;}
  const filename=resolve(ROOT,'.'+normalized);
  if(filename!==ROOT&&!filename.startsWith(ROOT+sep)){send(res,403,'Forbidden');return;}
  try {
   const info=await stat(filename);
   if(!info.isFile()){send(res,404,'Not found');return;}
   const bytes=await readFile(filename);
   const cacheControl=/\.html$/.test(filename)?'no-store':/\.(?:js|css)$/.test(filename)?'no-cache, must-revalidate':'public,max-age=300';
   const etag='"'+createHash('sha256').update(bytes).digest('hex').slice(0,22)+'"';
   const headers={'content-type':TYPES[extname(filename)]||'application/octet-stream','cache-control':cacheControl,'etag':etag};
   if(cacheControl!=='no-store'&&req.headers['if-none-match']===etag){send(res,304,null,headers);return;}
   send(res,200,req.method==='HEAD'?null:bytes,headers);
  }catch{send(res,404,'Not found');}
 }catch(error){console.error('Arcana server error:',error);json(res,500,{error:'Internal error'});}
});
server.listen(PORT,'0.0.0.0',()=>{
 console.log(`Arcana ${REVISION} listening on port ${PORT}`);
 if(process.env.ARCANA_ART_AUDIT==='1'){
  import('./scripts/art-audit.mjs').then(({runArtAudit})=>runArtAudit({catalogOrigin:`http://127.0.0.1:${PORT}`,officialOrigin:BASES.officialArt}))
   .catch(e=>console.error('ARCANA_STAGING_ART_AUDIT_ERROR',String(e)));
 }
});
