import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.PORT || 3000);
const REVISION = 'arcana-stabilization-2026-10-12';
const BASES = Object.freeze({
  catalog: 'https://arcana-guild-directory-beta-production.up.railway.app',
  lfg: 'https://lfg.arcanacompanion.xyz',
  legacyArt: 'https://arcana.up.railway.app',
  officialArt: 'https://arcana-v4-official-art-production.up.railway.app',
  codexArt: 'https://arcana-v3-preview-production.up.railway.app',
});
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
const server=http.createServer(async(req,res)=>{
 try {
  if(req.method!=='GET'&&req.method!=='HEAD'){send(res,405,'Method not allowed');return;}
  const {pathname}=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  if(pathname==='/health'||pathname==='/__health') {json(res,200,{ok:true,release:REVISION,source:'tracked frontend files',dependencyEndpoints:Object.keys(BASES)});return;}
  if(pathname==='/api/lfg/public'){await lfgFeed(res);return;}
  if(pathname==='/api/search/catalog'||pathname==='/api/guilds'){await pipe(res,BASES.catalog+pathname,{mime:'application/json; charset=utf-8',limit:500000});return;}
  if(pathname==='/game-assets/map'||pathname==='/game-assets/atlas'||pathname==='/game-assets/skill-tree'){
    const mapping={'/game-assets/map':'/assets/atlas-map.json','/game-assets/atlas':'/assets/atlas.webp','/game-assets/skill-tree':'/assets/skill-tree.json'};
    await pipe(res,BASES.legacyArt+mapping[pathname],{timeout:10000,cache:'public,max-age=180'});return;
  }
  if(/^\/codex-art\/(?:status|manifest\.json|skills\.webp|monsters\.webp|biomes\.webp|materials\.webp)$/.test(pathname)) {
    await pipe(res,BASES.codexArt+pathname,{timeout:10000,cache:'public,max-age=180'});return;
  }
  if(/^\/official-art\/(?:manifest\.json|[a-z][a-z0-9-]*\.webp)$/.test(pathname)) {
    await pipe(res,BASES.officialArt+pathname.slice('/official-art'.length),{timeout:14000,cache:'public,max-age=180'});return;
  }
  const normalized=pathname==='/'?'/index.html':pathname;
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
server.listen(PORT,'0.0.0.0',()=>console.log(`Arcana ${REVISION} listening on port ${PORT}`));
