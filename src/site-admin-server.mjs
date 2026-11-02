import {resolve} from 'node:path';
import {readdir} from 'node:fs/promises';
import {dataRoot,readJSON,saveAtomic,sendJSON,accountUser,checkOrigin,parseJSON,publicProfile} from './account-server.mjs';
import {can,capabilityGrid,setCapabilityOverrides,normalizeCapabilityOverrides,EDITABLE_CAPS,GRID_ROLES,ROLE_NAMES} from './account-policy.js';
import {DEFAULT_DESIGN,DESIGN_FIELDS,validateDesignField} from './design-controls.js';
import {normalizeNextDesign,safeNextDesign} from '../next/design-model.js';

// Design publishing and member directory share the existing persistent Arcana data volume.
// Access control always uses authenticated server identity, never submitted role claims.
const configPath=()=>resolve(dataRoot(),'admin','site-config.json');
const historyPath=()=>resolve(dataRoot(),'admin','site-history.json');
const response=(res,status,payload)=>sendJSON(res,status,payload);
// Role permissions the Creator can adjust (Admin › Roles). Loaded once at start, replaced on save.
const permissionsPath=()=>resolve(dataRoot(),'admin','permissions.json');
let permissionsRevision=0;
readJSON(permissionsPath()).then(saved=>{if(saved){permissionsRevision=Number(saved.revision)||0;setCapabilityOverrides(saved.overrides);}}).catch(()=>{});
const fail=(res,status,error)=>{response(res,status,{error});return true;};
let chain=Promise.resolve();
const serialized=task=>{
 const work=chain.then(task);
 chain=work.catch(()=>{});
 return work;
};
const defaultConfig=()=>({revision:0,updatedAt:null,updatedBy:null,design:null,next:null,notice:{enabled:false,text:''}});
function safeConfig(raw){
 if(!raw||typeof raw!=='object'||!Number.isSafeInteger(raw.revision)||raw.revision<0)return defaultConfig();
 return {...defaultConfig(),...raw,notice:normalizeNotice(raw.notice),design:raw.design?normalizeDesign({...DEFAULT_DESIGN,...raw.design}):null,next:raw.next?safeNextDesign(raw.next):null};
}
export function normalizeDesign(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid theme.');
 const design={};
 for(const key of DESIGN_FIELDS){
  const normalized=validateDesignField(key,value[key]);
  if(normalized===null)throw new Error('Invalid design field: '+key);
  design[key]=normalized;
 }
 if(Object.keys(value).some(key=>!DESIGN_FIELDS.includes(key)))throw new Error('Unknown design setting.');
 return design;
}
export function normalizeNotice(raw){
 if(!raw||typeof raw!=='object')return {enabled:false,text:''};
 const text=String(raw.text||'').trim();
 if(text.length>180||/[\u0000-\u001f\u007f]/.test(text))throw new Error('Notice must be plain text under 180 characters.');
 return {enabled:raw.enabled===true&&text.length>0,text};
}
async function current(){return safeConfig(await readJSON(configPath()));}
const featuredPath=()=>resolve(dataRoot(),'admin','featured-builds.json');
const POST_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export function normalizeFeaturedItems(raw){
 if(!Array.isArray(raw))throw new Error('Featured builds must be a list.');
 if(raw.length>12)throw new Error('Feature at most 12 builds.');
 const seen=new Set(),items=[];
 for(const x of raw){
  const postId=String(x?.postId||'').toLowerCase();
  if(!POST_ID.test(postId))throw new Error('Invalid build id.');
  if(seen.has(postId))continue;seen.add(postId);
  const note=String(x?.note||'').trim();
  if(note.length>140||/[\u0000-\u001f\u007f]/.test(note))throw new Error('Notes must be plain text under 140 characters.');
  items.push({postId,note});
 }
 return items;
}
export function safeFeatured(raw){
 if(!raw||typeof raw!=='object'||!Number.isSafeInteger(raw.revision)||raw.revision<0)return {revision:0,updatedAt:null,items:[]};
 let items=[];try{items=normalizeFeaturedItems(raw.items||[]);}catch{items=[];}
 return {revision:raw.revision,updatedAt:raw.updatedAt||null,items};
}
function publicData(config){
 return {revision:config.revision,updatedAt:config.updatedAt,design:config.design,next:config.next||null,notice:config.notice};
}
async function requireAdmin(req,res,permission='site:manage'){
 const user=await accountUser(req);
 if(!user){fail(res,401,'Sign in with Discord to continue.');return null;}
 if(!can(user,permission)){fail(res,403,'Admin or Creator access required.');return null;}
 return user;
}
export async function handleSiteAdminRequest(req,res,url){
 const {pathname}=url;
 if(pathname==='/api/site/theme'){
  if(req.method!=='GET')return fail(res,405,'Method not allowed.');
  const config=await current();
  res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});
  res.end(JSON.stringify(publicData(config)));return true;
 }
 if(pathname==='/api/admin/site'){
  if(req.method==='GET'){
   if(!await requireAdmin(req,res,'site:manage'))return true;
   response(res,200,{...publicData(await current()),history:(await readJSON(historyPath()))||[]});return true;
  }
  if(req.method==='PUT'){
   if(!await requireAdmin(req,res,'site:manage'))return true;
   try{checkOrigin(req);}catch{return fail(res,403,'Invalid request origin.');}
   const payload=await parseJSON(req,12000).catch(()=>null);
   if(!payload||!Number.isInteger(payload.expectedRevision)||!['design','notice','next'].includes(payload.section))
    return fail(res,422,'A current revision and valid section are required.');
   let proposed;
   try{proposed=payload.section==='design'?normalizeDesign(payload.design):payload.section==='next'?normalizeNextDesign(payload.next):normalizeNotice(payload.notice);}
   catch(e){return fail(res,422,e.message);}
   return serialized(async()=>{
    const old=await current();
    if(old.revision!==payload.expectedRevision)return fail(res,409,'Site settings changed. Reload before publishing.');
    const before={...old},now=new Date().toISOString();
    const next={...old,revision:old.revision+1,updatedAt:now,updatedBy:(await accountUser(req))?.id||'admin'};
    if(payload.section==='design')next.design=proposed;
    else if(payload.section==='next')next.next=proposed;
    else next.notice=proposed;
    const history=Array.isArray(await readJSON(historyPath()))?await readJSON(historyPath()):[];
    await saveAtomic(historyPath(),[...history,{...before,reason:payload.section}].slice(-20));
    await saveAtomic(configPath(),next);
    response(res,200,publicData(next));return true;
   });
  }
  return fail(res,405,'Method not allowed.');
 }
 if(pathname==='/api/admin/site/rollback'){
  if(req.method!=='POST')return fail(res,405,'Method not allowed.');
  if(!await requireAdmin(req,res,'site:manage'))return true;
  try{checkOrigin(req);}catch{return fail(res,403,'Invalid request origin.');}
  const payload=await parseJSON(req,500).catch(()=>null);
  if(!payload||!Number.isInteger(payload.expectedRevision)||!Number.isInteger(payload.targetRevision))return fail(res,422,'Revision required.');
  return serialized(async()=>{
   const now=await current();
   if(now.revision!==payload.expectedRevision)return fail(res,409,'Settings changed. Reload first.');
   const history=await readJSON(historyPath())||[];
   const target=history.find(v=>v.revision===payload.targetRevision);
   if(!target)return fail(res,404,'Selected previous version not found.');
   const copy=safeConfig(target);
   const next={...now,revision:now.revision+1,updatedAt:new Date().toISOString(),updatedBy:(await accountUser(req))?.id||'admin',design:copy.design,next:copy.next,notice:copy.notice};
   await saveAtomic(historyPath(),[...history,{...now,reason:'rollback'}].slice(-20));
   await saveAtomic(configPath(),next);
   response(res,200,publicData(next));return true;
  });
 }
 // Featured builds (Arcana Next). Stores only community post ids and a short note; visitors load
 // the posts through the public community route, so hidden or deleted posts never show.
 if(pathname==='/api/featured'){
  if(req.method!=='GET')return fail(res,405,'Method not allowed.');
  const f=safeFeatured(await readJSON(featuredPath()));
  res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});
  res.end(JSON.stringify(f));return true;
 }
 if(pathname==='/api/admin/featured'){
  if(req.method!=='PUT')return fail(res,405,'Method not allowed.');
  if(!await requireAdmin(req,res,'site:manage'))return true;
  try{checkOrigin(req);}catch{return fail(res,403,'Invalid request origin.');}
  const payload=await parseJSON(req,8000).catch(()=>null);
  if(!payload||!Number.isInteger(payload.expectedRevision))return fail(res,422,'A current revision is required.');
  let items;try{items=normalizeFeaturedItems(payload.items);}catch(e){return fail(res,422,e.message);}
  return serialized(async()=>{
   const old=safeFeatured(await readJSON(featuredPath()));
   if(old.revision!==payload.expectedRevision)return fail(res,409,'Featured builds changed. Reload before saving.');
   const next={revision:old.revision+1,updatedAt:new Date().toISOString(),items};
   await saveAtomic(featuredPath(),next);
   response(res,200,next);return true;
  });
 }
 if(pathname==='/api/admin/permissions'){
  if(!await requireAdmin(req,res,'roles:privileged'))return true;
  if(req.method==='GET'){response(res,200,{revision:permissionsRevision,grid:capabilityGrid(),roles:GRID_ROLES.map(id=>({id,label:ROLE_NAMES[id]}))});return true;}
  if(req.method==='PUT'){
   try{checkOrigin(req);}catch{return fail(res,403,'Invalid request origin.');}
   const payload=await parseJSON(req,6000).catch(()=>null);
   if(!payload||payload.expectedRevision!==permissionsRevision)return fail(res,409,'Permissions changed. Reload, then save again.');
   const overrides=normalizeCapabilityOverrides(payload.overrides);
   return serialized(async()=>{
    permissionsRevision++;
    await saveAtomic(permissionsPath(),{revision:permissionsRevision,updatedAt:new Date().toISOString(),overrides});
    setCapabilityOverrides(overrides);
    response(res,200,{revision:permissionsRevision,grid:capabilityGrid()});return true;
   });
  }
  return fail(res,405,'Method not allowed.');
 }
 if(pathname==='/api/admin/members'){
  if(req.method!=='GET')return fail(res,405,'Method not allowed.');
  if(!await requireAdmin(req,res,'roles:manage'))return true;
  const members=[];
  let files=[];try{files=(await readdir(resolve(dataRoot(),'users'))).filter(f=>/^[0-9a-f-]{36}\.json$/i.test(f)).slice(0,5000);}catch(e){if(e.code!=='ENOENT')throw e;}
  for(const file of files){
   const member=await readJSON(resolve(dataRoot(),'users',file));
   if(!member||member.suspended)continue;
   const visible=publicProfile(member);
   members.push({id:visible.id,displayName:visible.displayName,inGameName:visible.inGameName,guild:visible.guild,roles:visible.roles,awards:visible.awards,joinedAt:visible.joinedAt,betaTesterSince:visible.betaTesterSince});
  }
  members.sort((a,b)=>String(b.joinedAt).localeCompare(String(a.joinedAt)));
  const page=Math.max(1,Math.min(10000,Number(url.searchParams.get('page'))||1));
  const limit=30;
  response(res,200,{total:members.length,page,pages:Math.max(1,Math.ceil(members.length/limit)),members:members.slice((page-1)*limit,page*limit)});
  return true;
 }
 return false;
}
export async function safeSiteAdminRequest(req,res,url){
 try{return await handleSiteAdminRequest(req,res,url);}
 catch(e){console.error('Arcana admin site:',e);response(res,500,{error:'Admin settings unavailable.'});return true;}
}
