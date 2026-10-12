import { readdir, readFile, mkdir, writeFile, rename, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { timingSafeEqual, randomUUID } from 'node:crypto';
import { publicWikiArticle, validateWikiDraft } from './wiki-studio-model.js';
import { WIKI_ARTICLES } from './wiki-data.js';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE = /^image-[a-z0-9-]{1,60}$/;
const ROOT = resolve(process.env.ARCANA_WIKI_DATA_DIR || '.arcana-wiki-data');
const LIMIT = 12 * 1024 * 1024;
const RESERVED = new Set(WIKI_ARTICLES.map(a => a.id));
export const wikiPublishingEnabled = () => Boolean(process.env.ARCANA_WIKI_OWNER_KEY && process.env.ARCANA_WIKI_DATA_DIR);
const send = (res, status, value, headers = {}) => {
  res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers});
  res.end(JSON.stringify(value));
};
const authorized = req => {
  const secret = process.env.ARCANA_WIKI_OWNER_KEY || '';
  const provided = String(req.headers['x-arcana-wiki-key'] || '');
  if (!secret || !provided || Buffer.byteLength(secret)!==Buffer.byteLength(provided)) return false;
  return timingSafeEqual(Buffer.from(secret), Buffer.from(provided));
};
async function rawArticle(id) {
  if (!SLUG.test(id) || id.length > 70) return null;
  try { return JSON.parse(await readFile(resolve(ROOT,id+'.json'),'utf8')); }
  catch (e) { if (e.code==='ENOENT') return null; throw e; }
}
export function wikiPublicArticle(raw) {
  const out=publicWikiArticle(raw);
  out.images=out.images.map(image=>({
    id:image.id,name:image.name,alt:image.alt,caption:image.caption,
    src:'/content/wiki/images/'+out.id+'/'+image.id+'.webp'
  }));
  return out;
}
export async function wikiPublicIndex() {
  let names=[];
  try { names=await readdir(ROOT); } catch(e) { if(e.code==='ENOENT')return {articles:[]};throw e; }
  const articles=[];
  for(const name of names.filter(x=>/^[a-z0-9-]+\.json$/.test(x)).sort().slice(0,1000)) {
    try {
      const draft=await rawArticle(name.slice(0,-5));
      if(draft && !RESERVED.has(draft.id)) articles.push(wikiPublicArticle(draft));
    } catch(e) { console.warn('Skipping invalid Wiki article:',name,e.message); }
  }
  return {articles};
}
async function bodyJSON(req) {
  let size=0;const chunks=[];
  for await (const chunk of req) {
    size+=chunk.length;
    if(size>LIMIT)throw Object.assign(Error('Article exceeds the 12 MB limit'),{status:413});
    chunks.push(chunk);
  }
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
  catch{throw Object.assign(Error('Invalid article JSON'),{status:400});}
}
async function persist(raw) {
  if(!wikiPublishingEnabled())throw Object.assign(Error('Publishing not configured'),{status:503});
  const check=validateWikiDraft(raw,{existingIds:[...RESERVED]});
  if(!check.valid)throw Object.assign(Error(check.errors.join(' ')),{status:422});
  const draft=check.draft;
  await mkdir(ROOT,{recursive:true});
  const temporary=resolve(ROOT,'.'+draft.id+'-'+randomUUID()+'.tmp');
  await writeFile(temporary,JSON.stringify(draft),{flag:'wx',mode:0o600});
  try { await rename(temporary,resolve(ROOT,draft.id+'.json')); }
  catch(e){await unlink(temporary).catch(()=>{});throw e;}
  return draft;
}
export async function handleWikiRequest(req,res,pathname) {
  const method=req.method;
  if (pathname==='/api/wiki/publishing' && (method==='GET'||method==='HEAD')) {
    send(res,200,{enabled:wikiPublishingEnabled()});return true;
  }
  if (pathname==='/api/wiki/articles' && (method==='GET'||method==='HEAD')) {
    try { send(res,200,await wikiPublicIndex()); }
    catch(e){console.error('Wiki index unavailable:',e);send(res,503,{error:'Wiki storage unavailable'});}
    return true;
  }
  const imagePath=pathname.match(/^\/content\/wiki\/images\/([a-z0-9-]+)\/(image-[a-z0-9-]+)\.webp$/);
  if(imagePath && (method==='GET'||method==='HEAD')){
    try{
      const [,id,imageId]=imagePath;
      if(!SLUG.test(id)||id.length>70||!IMAGE.test(imageId)) { send(res,404,{error:'Not found'});return true; }
      const draft=await rawArticle(id),image=draft?.images?.find(x=>x.id===imageId);
      const match=image?.dataUrl?.match(/^data:image\/(webp|png|jpeg);base64,([a-z0-9+/=]+)$/i);
      if(!match){send(res,404,{error:'Image not found'});return true;}
      const bytes=Buffer.from(match[2],'base64');
      if(bytes.length>700000){send(res,404,{error:'Invalid image'});return true;}
      res.writeHead(200,{'content-type':'image/'+match[1].toLowerCase(),'cache-control':'public,max-age=60','x-content-type-options':'nosniff'});
      res.end(method==='HEAD'?null:bytes);
    }catch(e){console.error('Wiki image unavailable:',e);send(res,503,{error:'Wiki storage unavailable'});}
    return true;
  }
  if(pathname==='/api/wiki/publish' && method==='POST'){
    if(!authorized(req)){send(res,401,{error:'Invalid owner publishing key'});return true;}
    if(!String(req.headers['content-type']||'').startsWith('application/json')){send(res,415,{error:'JSON required'});return true;}
    try{
      const input=await bodyJSON(req);
      const draft=await persist(input?.draft);
      send(res,200,{ok:true,id:draft.id,url:'#/wiki/article?id='+encodeURIComponent(draft.id)});
    }catch(e){console.error('Wiki publish failed:',e.message);send(res,e.status||500,{error:e.status?e.message:'Could not save article'});}
    return true;
  }
  return false;
}
