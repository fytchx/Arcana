/* Private, durable account farming checklists. Never expose through a public
 * player-card route. Source numbers are snapshots of user-selected recipes. */
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import {requireCapability,parseJSON,queued,readJSON,saveAtomic,checkOrigin,sendJSON,dataRoot} from './account-server.mjs';
const UUID=/^[a-f0-9-]{36}$/;
const SLUG=/^[a-z0-9][a-z0-9-]{0,89}$/;
const MAX_LISTS=12;
const bad=(status,message)=>Object.assign(new Error(message),{status});
const clean=(v,n)=>String(v??'').replace(/[\u0000-\u001f\u007f<>]/g,' ').trim().slice(0,n);
const filename=user=>resolve(dataRoot(),'farming-lists',user.id+'.json');
export function normalizeSavedFarmingList(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw bad(422,'Farming checklist is required.');
 const slot=clean(raw.slot,18);
 if(!['torch','head','neck','weapon','chest','offhand','ring','belt','ring2','hands','feet'].includes(slot))throw bad(422,'Choose an equipment slot.');
 if(!Array.isArray(raw.groups)||!raw.groups.length||raw.groups.length>35)throw bad(422,'The checklist requires verified material groups.');
 const seen=new Set(),groups=raw.groups.map(g=>{
  if(!g||!Array.isArray(g.items)||g.items.length>60)throw bad(422,'Invalid material group.');
  const items=g.items.map(m=>{
   if(!SLUG.test(String(m?.slug||''))||seen.has(m.slug)||!/^[1-9][0-9]{0,17}$/.test(String(m.quantity??'')))throw bad(422,'Invalid material or quantity.');
   seen.add(m.slug);return {slug:m.slug,name:clean(m.name,95)||m.slug,quantity:String(m.quantity),completed:false};
  });
  return {name:clean(g.name,90)||'Unverified source',tier:clean(g.tier,55),items};
 });
 if(seen.size===0||seen.size>70)throw bad(422,'Checklist must contain 1 to 70 unique materials.');
 const gold=String(raw.gold??'0');
 if(!/^(0|[1-9][0-9]{0,24})$/.test(gold))throw bad(422,'Invalid Gold total.');
 return {title:clean(raw.title,110)||'Pathfinder material run',slot,from:clean(raw.from,45),to:clean(raw.to,45),gold,sourceVersion:clean(raw.sourceVersion,100),groups};
}
async function rows(user){
 const v=await readJSON(filename(user));
 return Array.isArray(v?.lists)?v.lists:[];
}
export async function handleFarmingListRequest(req,res,url){
 if(!url.pathname.startsWith('/api/account/farming-lists'))return false;
 const user=await requireCapability(req);
 const base=url.pathname==='/api/account/farming-lists';
 if(base&&req.method==='GET'){sendJSON(res,200,{lists:await rows(user),limit:MAX_LISTS});return true;}
 if(base&&req.method==='POST'){
  checkOrigin(req);const body=await parseJSON(req,27000),cleaned=normalizeSavedFarmingList(body?.list);
  const row=await queued(async()=>{
   const list=await rows(user);
   if(list.length>=MAX_LISTS)throw bad(409,'You have reached the 12-checklist limit. Finish or delete one first.');
   const now=new Date().toISOString(),item={...cleaned,id:randomUUID(),createdAt:now,updatedAt:now};
   list.unshift(item);await saveAtomic(filename(user),{lists:list});return item;
  });
  sendJSON(res,201,{list:row});return true;
 }
 const match=url.pathname.match(/^\/api\/account\/farming-lists\/([a-f0-9-]{36})$/);
 if(!match||!UUID.test(match[1]))return false;
 if(req.method==='PATCH'){
  checkOrigin(req);const body=await parseJSON(req,3000);
  if(!SLUG.test(String(body?.slug||''))||typeof body.completed!=='boolean')throw bad(422,'Select a valid material checkbox.');
  const updated=await queued(async()=>{
   const list=await rows(user),row=list.find(r=>r.id===match[1]);
   if(!row)throw bad(404,'Farming checklist not found.');
   if(row.updatedAt!==body.baseUpdatedAt)throw bad(409,'Checklist changed on another device. Reload before editing.');
   const mat=row.groups.flatMap(g=>g.items).find(m=>m.slug===body.slug);
   if(!mat)throw bad(404,'Material not found in this checklist.');
   mat.completed=body.completed;
   row.updatedAt=new Date().toISOString();
   await saveAtomic(filename(user),{lists:list});return row;
  });
  sendJSON(res,200,{list:updated});return true;
 }
 if(req.method==='DELETE'){
  checkOrigin(req);
  await queued(async()=>{
   const list=await rows(user);
   if(!list.some(r=>r.id===match[1]))throw bad(404,'Farming checklist not found.');
   await saveAtomic(filename(user),{lists:list.filter(r=>r.id!==match[1])});
  });
  sendJSON(res,200,{ok:true});return true;
 }
 return false;
}
export async function safeFarmingListRequest(req,res,url){
 try{return await handleFarmingListRequest(req,res,url);}
 catch(e){sendJSON(res,e.status>=400&&e.status<500?e.status:503,{error:e.status?e.message:'Farming checklist storage unavailable.'});return true;}
}
