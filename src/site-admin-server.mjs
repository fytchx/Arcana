import {resolve} from 'node:path';
import {readdir} from 'node:fs/promises';
import {dataRoot,readJSON,saveAtomic,sendJSON,accountUser,checkOrigin,parseJSON,publicProfile} from './account-server.mjs';
import {can} from './account-policy.js';
import {DEFAULT_DESIGN,DESIGN_FIELDS,validateDesignField} from './design-controls.js';

// Design publishing and member directory share the existing persistent Arcana data volume.
// Access control always uses authenticated server identity, never submitted role claims.
const configPath=()=>resolve(dataRoot(),'admin','site-config.json');
const historyPath=()=>resolve(dataRoot(),'admin','site-history.json');
const response=(res,status,payload)=>sendJSON(res,status,payload);
const fail=(res,status,error)=>{response(res,status,{error});return true;};
let chain=Promise.resolve();
const serialized=task=>{
 const work=chain.then(task);
 chain=work.catch(()=>{});
 return work;
};
const defaultConfig=()=>({revision:0,updatedAt:null,updatedBy:null,design:null,notice:{enabled:false,text:''}});
function safeConfig(raw){
 if(!raw||typeof raw!=='object'||!Number.isSafeInteger(raw.revision)||raw.revision<0)return defaultConfig();
 return {...defaultConfig(),...raw,notice:normalizeNotice(raw.notice),design:raw.design?normalizeDesign(raw.design):null};
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
function publicData(config){
 return {revision:config.revision,updatedAt:config.updatedAt,design:config.design,notice:config.notice};
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
   if(!payload||!Number.isInteger(payload.expectedRevision)||!['design','notice'].includes(payload.section))
    return fail(res,422,'A current revision and valid section are required.');
   let proposed;
   try{proposed=payload.section==='design'?normalizeDesign(payload.design):normalizeNotice(payload.notice);}
   catch(e){return fail(res,422,e.message);}
   return serialized(async()=>{
    const old=await current();
    if(old.revision!==payload.expectedRevision)return fail(res,409,'Site settings changed. Reload before publishing.');
    const before={...old},now=new Date().toISOString();
    const next={...old,revision:old.revision+1,updatedAt:now,updatedBy:(await accountUser(req))?.id||'admin'};
    if(payload.section==='design')next.design=proposed;
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
   const next={...now,revision:now.revision+1,updatedAt:new Date().toISOString(),updatedBy:(await accountUser(req))?.id||'admin',design:copy.design,notice:copy.notice};
   await saveAtomic(historyPath(),[...history,{...now,reason:'rollback'}].slice(-20));
   await saveAtomic(configPath(),next);
   response(res,200,publicData(next));return true;
  });
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
   members.push({id:visible.id,displayName:visible.displayName,inGameName:visible.inGameName,guild:visible.guild,roles:visible.roles,joinedAt:visible.joinedAt,betaTesterSince:visible.betaTesterSince});
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
