// Arcana Guidebook storage and API. Pages are edited inside the site:
//  - guidebook:edit    can save drafts and send them for review
//  - guidebook:publish can publish, hide, and restore earlier versions
// Every published version is kept (last 25 per page). Editorial seed text stays server-side.
import {resolve} from 'node:path';
import {readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dataRoot,readJSON,saveAtomic,sendJSON,accountUser,checkOrigin,parseJSON,publicProfile} from './account-server.mjs';
import {can} from './account-policy.js';
import {CHAPTERS} from '../next/guidebook-content.js';
import {PAGES as ORIGINAL_SEED} from './guidebook-seed.mjs';
import {NEW_SEED_PAGES,SEED_UPDATES} from './guidebook-seed-updates.mjs';

const file=()=>resolve(dataRoot(),'guidebook','pages.json');
const CHAPTER_IDS=new Set(CHAPTERS.map(c=>c.id));
const TRUST=new Set(['verified','config','estimated','legacy']);
const ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ACCOUNT_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SEED=ORIGINAL_SEED.map(p=>({...p,...(SEED_UPDATES[p.id]||{})})).concat(NEW_SEED_PAGES);
const SEED_STRUCTURE_VERSION=4;
const contentFingerprint=p=>p?createHash('sha256').update(JSON.stringify({title:p.title,answer:p.answer,body:p.body})).digest('hex'):'';
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
  author:text(raw.author||'Zane',100).trim(),status:['review','awaiting','planned','ready'].includes(raw.status)?raw.status:'review',related:Array.isArray(raw.related)?raw.related.filter(x=>ID.test(String(x))).slice(0,5):[],order:Number.isInteger(raw.order)?Math.max(0,Math.min(999,raw.order)):100,icon:text(raw.icon||'',40).replace(/[^a-z0-9-]/g,''),cls:['warrior','archer','mage','rogue','druid'].includes(raw.cls)?raw.cls:'',
  next:ID.test(String(raw.next||''))?raw.next:null};
 if(page.trust==='verified'&&raw.verifiedBy)page.verifiedBy=text(raw.verifiedBy,60);
 if(page.trust==='verified'&&raw.verifiedAt)page.verifiedAt=text(raw.verifiedAt,40);
 return page;
}
const editorPage=(p,i)=>({published:null,draft:{...p,order:Number.isFinite(p.order)?p.order:i*10},review:p.status==='review',hidden:false,history:[]});
function syncStructure(page,seed){
 if(!page||!seed)return page;
 // Keep every saved word. Only move pages into the new approved chapter sequence.
 return {...page,chapter:seed.chapter,order:seed.order,related:Array.isArray(page.related)?page.related:(seed.related||[]),...(seed.status==='planned'?{status:'planned'}:{})};
}
async function load(){
 const saved=await readJSON(file());
 if(saved&&saved.pages){
  // New pages enter the editor as private drafts. The reader only receives explicitly approved pages.
  const savedStructureVersion=Number(saved.structureVersion||0),seeds=new Map(SEED.map(p=>[p.id,p])),migrateStructure=savedStructureVersion<3,migrateHarmonyOverview=savedStructureVersion<SEED_STRUCTURE_VERSION;
  const originals=new Map(ORIGINAL_SEED.map(p=>[p.id,p])),migrateApprovedCopy=Number(saved.contentVersion||0)<1;
  // Fold existing saved drafts into the compact page structure while preserving their text
  // alongside the original source copy.
  if(migrateStructure&&!saved.pages['systems-progression']){
   const source=['systems-overview','grind-ml'].map(id=>saved.pages[id]?.draft||saved.pages[id]?.published).filter(Boolean);
   if(source.length){const merged={...seeds.get('systems-progression'),body:source.map(p=>'## '+p.title+'\n\n'+(p.answer||'')+'\n\n'+(p.body||'')).join('\n\n')};saved.pages['systems-progression']=editorPage(merged,0);}
  }
  SEED.forEach((p,i)=>{if(!saved.pages[p.id]&&!(saved.removed||[]).includes(p.id))saved.pages[p.id]=editorPage(p,i);});
  if(migrateHarmonyOverview){
   const harmony=saved.pages['harmony-overview'];
   for(const version of [harmony?.draft,harmony?.published])if(version?.chapter==='player-guides')version.chapter='classes';
  }
  Object.entries(saved.pages).forEach(([id,e])=>{
   const seed=seeds.get(id);
   const original=originals.get(id),update=SEED_UPDATES[id];
   // Refresh only untouched seed copies. Any text the owner has edited stays exactly as saved.
   if(migrateApprovedCopy&&update&&e.draft&&original&&contentFingerprint(e.draft)===contentFingerprint(original)){
    e.history=[{at:new Date().toISOString(),by:'Seed refresh · original draft preserved',page:{...e.draft}},...(e.history||[])].slice(0,25);
    e.draft={...e.draft,title:seed.title,answer:seed.answer,body:seed.body};
   }
   if(seed&&migrateStructure){e.draft=syncStructure(e.draft,seed);e.published=syncStructure(e.published,seed);}
   // Older preview builds exposed working drafts. Retain their complete text in the editor/history,
   // but remove them from the public reader until an authorized publisher approves them.
   if(e.published&&e.published.status!=='ready'){
    if(!e.draft)e.draft=e.published;
    else e.history=[{at:e.publishedAt||new Date(0).toISOString(),by:e.publishedBy||'Preview migration',page:e.published},...(e.history||[])].slice(0,25);
    e.published=null;e.review=e.draft?.status==='review';
   }
   if(!e.draft&&!e.published&&seed)e.draft={...seed};
  });
  saved.structureVersion=SEED_STRUCTURE_VERSION;
  saved.contentVersion=1;
  if(!Array.isArray(saved.contributors))saved.contributors=[];
  return saved;
 }
 const pages={};SEED.forEach((p,i)=>{pages[p.id]=editorPage(p,i);});
 return {revision:0,structureVersion:SEED_STRUCTURE_VERSION,contentVersion:1,pages,contributors:[]};
}
const publicList=store=>Object.values(store.pages).filter(e=>e.published&&!e.hidden&&e.published.status==='ready').map(e=>e.published).sort((a,b)=>(a.order??100)-(b.order??100));
const byline=user=>publicProfile(user).displayName;
const owner=user=>user?.isCreator===true;
const accountFile=id=>resolve(dataRoot(),'users',id+'.json');
async function guidebookContributors(raw,includeIds=false){
 const people=Array.isArray(raw)?raw:[];
 const resolved=await Promise.all(people.slice(0,30).map(async item=>{
  if(!ACCOUNT_ID.test(String(item?.userId||'')))return null;
  const account=await readJSON(accountFile(item.userId));
  if(!account||account.suspended)return null;
  const profile=publicProfile(account),displayName=text(item.creditName,80).trim()||profile.displayName||'Arcana player';
  return includeIds?{userId:item.userId,displayName:profile.displayName,creditName:text(item.creditName,80).trim()}:{displayName};
 }));
 return resolved.filter(Boolean);
}
async function findContributorAccounts(query){
 const q=String(query||'').trim().toLocaleLowerCase();if(q.length<2)return [];
 let files=[];try{files=(await readdir(resolve(dataRoot(),'users'))).filter(f=>ACCOUNT_ID.test(f.slice(0,-5))).slice(0,5000);}catch(e){if(e.code!=='ENOENT')throw e;}
 const matches=[];
 for(const filename of files){
  const id=filename.slice(0,-5),account=await readJSON(accountFile(id));
  if(!account||account.suspended)continue;
  const name=publicProfile(account).displayName;
  if(name.toLocaleLowerCase().includes(q))matches.push({id,displayName:name});
 }
 return matches.sort((a,b)=>a.displayName.localeCompare(b.displayName)).slice(0,20);
}

export async function handleGuidebookRequest(req,res,url){
 const path=url.pathname;
 if(path==='/api/guidebook'&&req.method==='GET'){
  const s=await load(),user=await accountUser(req),isEditor=!!user&&can(user,'handbook:edit');
  sendJSON(res,200,{revision:s.revision,pages:publicList(s),contributors:await guidebookContributors(s.contributors),...(isEditor?{editorDrafts:Object.values(s.pages).filter(e=>e.draft||e.published).map(e=>e.draft||e.published).filter(Boolean).sort((a,b)=>(a.order??100)-(b.order??100))}:{})});return true;
 }
 if(path==='/api/admin/guidebook/contributors'&&req.method==='GET'){
  const user=await accountUser(req);
  if(!owner(user)){sendJSON(res,user?403:401,{error:user?'Only the Playbook owner can manage contributors.':'Sign in to continue.'});return true;}
  sendJSON(res,200,{matches:await findContributorAccounts(url.searchParams.get('q'))});return true;
 }
 if(path!=='/api/admin/guidebook'&&path!=='/api/admin/guidebook/export')return false;
 const user=await accountUser(req);
 if(!user){sendJSON(res,401,{error:'Sign in to continue.'});return true;}
 if(!can(user,'handbook:edit')){sendJSON(res,403,{error:'Your role cannot edit pages. Ask for Handbook Editor access.'});return true;}
 if(path==='/api/admin/guidebook/export'&&req.method==='GET'){
  const s=await load(),backup=owner(user)?s:{...s,contributors:undefined};res.writeHead(200,{'content-type':'application/json; charset=utf-8','content-disposition':'attachment; filename="arcana-guidebook-backup.json"','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(backup,null,2));return true;
 }
 if(req.method==='GET'){
  const s=await load();
  sendJSON(res,200,{revision:s.revision,canPublish:can(user,'handbook:publish'),isOwner:owner(user),...(owner(user)?{contributors:await guidebookContributors(s.contributors,true)}:{}),entries:Object.entries(s.pages).map(([id,e])=>({id,published:e.published,draft:e.draft,review:e.review,hidden:e.hidden,draftBy:e.draftBy||'',draftAt:e.draftAt||'',history:(e.history||[]).map((h,i)=>({i,at:h.at,by:h.by,title:h.page.title}))}))});
  return true;
 }
 if(req.method!=='PUT'){sendJSON(res,405,{error:'Method not allowed.'});return true;}
 try{checkOrigin(req);}catch{sendJSON(res,403,{error:'Invalid request origin.'});return true;}
 const body=await parseJSON(req,40000).catch(()=>null);
 if(!body||!Number.isInteger(body.expectedRevision)){sendJSON(res,422,{error:'A current revision is required.'});return true;}
 const action=body.action, publishing=['publish','hide','unhide','restore'].includes(action);
 if(action==='contributors'&&!owner(user)){sendJSON(res,403,{error:'Only the Playbook owner can manage contributors.'});return true;}
 if(!['draft','review','discard','contributors',...(publishing?[action]:[])].includes(action)){sendJSON(res,422,{error:'Unknown action.'});return true;}
 if(publishing&&!can(user,'handbook:publish')){sendJSON(res,403,{error:'Your role can save drafts but not publish.'});return true;}
 let page=null;
 if(action==='draft'||action==='review'||action==='publish'){try{page=normalizePage(body.page);}catch(e){sendJSON(res,422,{error:e.message});return true;}}
 const id=page?page.id:text(body.id,60);
 return serialized(async()=>{
  const s=await load();
  if(s.revision!==body.expectedRevision){sendJSON(res,409,{error:'Someone else changed the Guidebook. Reload, then save again.'});return true;}
  if(action==='contributors'){
   if(!Array.isArray(body.contributors)||body.contributors.length>30){sendJSON(res,422,{error:'Choose up to 30 contributors.'});return true;}
   const ids=new Set();
   for(const item of body.contributors){
    const id=String(item?.userId||'');
    if(!ACCOUNT_ID.test(id)||ids.has(id)){sendJSON(res,422,{error:'Each contributor must be a unique registered Arcana user.'});return true;}
    ids.add(id);
    if(text(item?.creditName,80).trim().length>80){sendJSON(res,422,{error:'Credit names must be 80 characters or fewer.'});return true;}
    const account=await readJSON(accountFile(id));
    if(!account||account.suspended){sendJSON(res,422,{error:'A selected account is no longer available.'});return true;}
   }
   s.contributors=body.contributors.map(item=>({userId:String(item.userId),creditName:text(item.creditName,80).trim()}));
   s.revision++;
   await saveAtomic(file(),s);
   sendJSON(res,200,{revision:s.revision,contributors:await guidebookContributors(s.contributors,true)});return true;
  }
  const now=new Date().toISOString(),e=s.pages[id]||(s.pages[id]={published:null,draft:null,review:false,hidden:false,history:[]});
  if(action==='draft'||action==='review'){e.draft=page;e.review=action==='review';e.draftBy=byline(user);e.draftAt=now;}
  else if(action==='discard'){e.draft=null;e.review=false;}
  else if(action==='publish'){
   page.status='ready';
   if(page.trust==='verified'&&!page.verifiedBy){page.verifiedBy=byline(user);page.verifiedAt=now;}
   if(e.published)e.history=[{at:now,by:byline(user),page:e.published},...(e.history||[])].slice(0,25);
   e.published=page;e.draft=null;e.review=false;e.publishedBy=byline(user);e.publishedAt=now;
  }
  else if(action==='hide'||action==='unhide')e.hidden=action==='hide';
  else if(action==='restore'){
   const h=(e.history||[])[Number(body.index)];
   if(!h){sendJSON(res,404,{error:'That version is gone.'});return true;}
   e.history=[{at:now,by:byline(user),page:e.published},...e.history.filter(x=>x!==h)].slice(0,25);e.published={...h.page,status:'ready'};
  }
  if(!e.published&&!e.draft){delete s.pages[id];s.removed=[...new Set([...(s.removed||[]),id])];}
  s.revision++;
  await saveAtomic(file(),s);
  sendJSON(res,200,{revision:s.revision});return true;
 });
}
export async function safeGuidebookRequest(req,res,url){
 try{return await handleGuidebookRequest(req,res,url);}
 catch(e){console.error('Arcana guidebook:',e);sendJSON(res,500,{error:'Guidebook unavailable.'});return true;}
}
