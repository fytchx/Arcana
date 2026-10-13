import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { handleWikiRequest } from './src/wiki-server.mjs';
import { safeAccountRequest } from './src/account-server.mjs';
import { safeAccountBuildRequest } from './src/account-builds.mjs';
import { safeCommunityRequest } from './src/community-server.mjs';
import { betaFeedbackRequest } from './src/beta-feedback-server.mjs';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.PORT || 3000);
const REVISION = 'arcana-beta-candidate-2026-10-12';
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
const server=http.createServer(async(req,res)=>{
 try {
  const parsedUrl=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  const {pathname}=parsedUrl;
  if(pathname.startsWith('/api/account/builds')&&await safeAccountBuildRequest(req,res,parsedUrl))return;
  if((pathname.startsWith('/api/account/')||pathname.startsWith('/api/profiles/')||pathname.startsWith('/api/admin/roles/'))&&await safeAccountRequest(req,res,parsedUrl))return;
  if(pathname.startsWith('/api/community/')&&await safeCommunityRequest(req,res,parsedUrl))return;
  if(pathname.startsWith('/api/beta/')&&await betaFeedbackRequest(req,res,parsedUrl))return;
  if(await handleWikiRequest(req,res,pathname))return;
  if(req.method!=='GET'&&req.method!=='HEAD'){send(res,405,'Method not allowed');return;}
  if(pathname==='/health'||pathname==='/__health') {const art=await localArtAudit;const ok=!REQUIRE_LOCAL_ART||art.ready;json(res,ok?200:503,{ok,release:REVISION,source:'tracked frontend files',artwork:{local:art.ready,groups:art.groups,version:art.version||null},dependencyEndpoints:Object.keys(BASES)});return;}
  if(pathname==='/api/lfg/public'){await lfgFeed(res);return;}
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
  const publicPage=new Set(['/index.html','/privacy.html','/beta-rules.html','/styles.css','/wiki-studio.css','/community.css','/beta.css']).has(normalized);
  const publicModule=/^\/src\/[a-z][a-z0-9-]*\.js$/.test(normalized);
  const publicAsset=/^\/assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:webp|svg|png|jpg|jpeg|json)$/.test(normalized);
  if(!publicPage&&!publicModule&&!publicAsset){send(res,404,'Not found');return;}
  const filename=resolve(ROOT,'.'+normalized);
  if(filename!==ROOT&&!filename.startsWith(ROOT+sep)){send(res,403,'Forbidden');return;}
  try {
   const info=await stat(filename);
   if(!info.isFile()){send(res,404,'Not found');return;}
   const bytes=await readFile(filename);
   send(res,200,req.method==='HEAD'?null:bytes,{'content-type':TYPES[extname(filename)]||'application/octet-stream','cache-control':/\.(?:html|js|css)$/.test(filename)?'no-store':'public,max-age=300'});
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
