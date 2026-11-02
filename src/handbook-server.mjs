// Arcana Handbook storage and API. Pages are edited inside the site:
//  - handbook:edit    can save drafts and send them for review
//  - handbook:publish can publish, hide, and restore earlier versions
// Every published version is kept (last 25 per page). The seed content ships in next/handbook-content.js.
import {resolve} from 'node:path';
import {dataRoot,readJSON,saveAtomic,sendJSON,accountUser,checkOrigin,parseJSON,publicProfile} from './account-server.mjs';
import {can} from './account-policy.js';
import {PAGES as SEED,CHAPTERS} from '../next/handbook-content.js';

const file=()=>resolve(dataRoot(),'handbook','pages.json');
const CHAPTER_IDS=new Set(CHAPTERS.map(c=>c.id));
const TRUST=new Set(['verified','config','estimated','legacy']);
const ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const text=(v,max)=>String(v??'').replace(/\r\n/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').slice(0,max);
let chain=Promise.resolve();
const serialized=task=>{const work=chain.then(task);chain=work.catch(()=>{});return work;};

// Validates a page from an editor. Throws a plain message the editor shows.
export function normalizePage(raw){
 if(!raw||typeof raw!=='object')throw new Error('Invalid page.');
 const id=text(raw.id,60).trim();
 if(!ID.test(id))throw new Error('Page address must be lowercase words joined by dashes.');
 if(!CHAPTER_IDS.has(raw.chapter))throw new Error('Pick a chapter.');
 const title=text(raw.title,80).trim(),answer=text(raw.answer,400).trim(),body=text(raw.body,30000).trim();
 if(title.length<2)throw new Error('Add a title.');
 if(answer.length<10)throw new Error('Add a one-line answer at the top (at least 10 characters).');
 const page={id,chapter:raw.chapter,title,answer,body,trust:TRUST.has(raw.trust)?raw.trust:'config',version:text(raw.version||'',20).trim()||'1.3.13',
  order:Number.isInteger(raw.order)?Math.max(0,Math.min(999,raw.order)):100,icon:text(raw.icon||'',40).replace(/[^a-z0-9-]/g,''),cls:['warrior','archer','mage','rogue','druid'].includes(raw.cls)?raw.cls:'',
  next:ID.test(String(raw.next||''))?raw.next:null};
 if(page.trust==='verified'&&raw.verifiedBy)page.verifiedBy=text(raw.verifiedBy,60);
 if(page.trust==='verified'&&raw.verifiedAt)page.verifiedAt=text(raw.verifiedAt,40);
 return page;
}
async function load(){
 const saved=await readJSON(file());
 if(saved&&saved.pages){
  // New pages added to the seed file appear for readers even after the Handbook has been edited.
  // A page an editor removed is remembered and never comes back.
  SEED.forEach((p,i)=>{if(!saved.pages[p.id]&&!(saved.removed||[]).includes(p.id))saved.pages[p.id]={published:{...p,order:i},draft:null,review:false,hidden:false,history:[]};});
  return saved;
 }
 const pages={};SEED.forEach((p,i)=>{pages[p.id]={published:{...p,order:i},draft:null,review:false,hidden:false,history:[]};});
 return {revision:0,pages};
}
const publicList=store=>Object.values(store.pages).filter(e=>e.published&&!e.hidden).map(e=>e.published).sort((a,b)=>(a.order??100)-(b.order??100));
const byline=user=>publicProfile(user).displayName;

export async function handleHandbookRequest(req,res,url){
 const path=url.pathname;
 if(path==='/api/handbook'&&req.method==='GET'){const s=await load();sendJSON(res,200,{revision:s.revision,pages:publicList(s)});return true;}
 if(path!=='/api/admin/handbook')return false;
 const user=await accountUser(req);
 if(!user){sendJSON(res,401,{error:'Sign in to continue.'});return true;}
 if(!can(user,'handbook:edit')){sendJSON(res,403,{error:'Your role cannot edit the Handbook.'});return true;}
 if(req.method==='GET'){
  const s=await load();
  sendJSON(res,200,{revision:s.revision,canPublish:can(user,'handbook:publish'),entries:Object.entries(s.pages).map(([id,e])=>({id,published:e.published,draft:e.draft,review:e.review,hidden:e.hidden,draftBy:e.draftBy||'',draftAt:e.draftAt||'',history:(e.history||[]).map((h,i)=>({i,at:h.at,by:h.by,title:h.page.title}))}))});
  return true;
 }
 if(req.method!=='PUT'){sendJSON(res,405,{error:'Method not allowed.'});return true;}
 try{checkOrigin(req);}catch{sendJSON(res,403,{error:'Invalid request origin.'});return true;}
 const body=await parseJSON(req,40000).catch(()=>null);
 if(!body||!Number.isInteger(body.expectedRevision)){sendJSON(res,422,{error:'A current revision is required.'});return true;}
 const action=body.action, publishing=['publish','hide','unhide','restore'].includes(action);
 if(!['draft','review','discard',...(publishing?[action]:[])].includes(action)){sendJSON(res,422,{error:'Unknown action.'});return true;}
 if(publishing&&!can(user,'handbook:publish')){sendJSON(res,403,{error:'Your role can save drafts but not publish.'});return true;}
 let page=null;
 if(action==='draft'||action==='review'||action==='publish'){try{page=normalizePage(body.page);}catch(e){sendJSON(res,422,{error:e.message});return true;}}
 const id=page?page.id:text(body.id,60);
 return serialized(async()=>{
  const s=await load();
  if(s.revision!==body.expectedRevision){sendJSON(res,409,{error:'Someone else changed the Handbook. Reload, then save again.'});return true;}
  const now=new Date().toISOString(),e=s.pages[id]||(s.pages[id]={published:null,draft:null,review:false,hidden:false,history:[]});
  if(action==='draft'||action==='review'){e.draft=page;e.review=action==='review';e.draftBy=byline(user);e.draftAt=now;}
  else if(action==='discard'){e.draft=null;e.review=false;}
  else if(action==='publish'){
   if(page.trust==='verified'&&!page.verifiedBy){page.verifiedBy=byline(user);page.verifiedAt=now;}
   if(e.published)e.history=[{at:now,by:byline(user),page:e.published},...(e.history||[])].slice(0,25);
   e.published=page;e.draft=null;e.review=false;e.publishedBy=byline(user);e.publishedAt=now;
  }
  else if(action==='hide'||action==='unhide')e.hidden=action==='hide';
  else if(action==='restore'){
   const h=(e.history||[])[Number(body.index)];
   if(!h){sendJSON(res,404,{error:'That version is gone.'});return true;}
   e.history=[{at:now,by:byline(user),page:e.published},...e.history.filter(x=>x!==h)].slice(0,25);e.published=h.page;
  }
  if(!e.published&&!e.draft){delete s.pages[id];s.removed=[...new Set([...(s.removed||[]),id])];}
  s.revision++;
  await saveAtomic(file(),s);
  sendJSON(res,200,{revision:s.revision});return true;
 });
}
export async function safeHandbookRequest(req,res,url){
 try{return await handleHandbookRequest(req,res,url);}
 catch(e){console.error('Arcana handbook:',e);sendJSON(res,500,{error:'Handbook unavailable.'});return true;}
}
