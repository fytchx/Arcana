// Public beta feedback: write-only for guests, reviewable only by approved staff.
// Stores no login secrets, raw IP addresses, cookies or browser fingerprint.
import {randomUUID,createHash,timingSafeEqual} from 'node:crypto';
import {mkdir,readdir,readFile,rename,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {accountUser,authAvailable,betaEnrollmentOpen} from './account-server.mjs';
import {can} from './account-policy.js';

const categories=new Set(['bug','usability','incorrect-data','missing-art','feature-request','other']);
const root=()=>resolve(process.env.ARCANA_BETA_FEEDBACK_DIR||process.env.ARCANA_WIKI_DATA_DIR||'.arcana-wiki-data','beta-feedback');
const short=(x,max)=>typeof x==='string'?x.trim().slice(0,max).replace(/[\u0000-\u001f\u007f]/g,' '):'';
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(value));};
const hash=x=>createHash('sha256').update(x).digest('hex');
const rateMap=new Map();let writeQueue=Promise.resolve();
const queue=fn=>{const work=writeQueue.then(fn);writeQueue=work.catch(()=>{});return work;};
const file=id=>resolve(root(),id+'.json');
function sameOrigin(req){
 const origin=String(req.headers.origin||'');
 const host=String(req.headers['x-forwarded-host']||req.headers.host||'');
 if(!origin||!host) return false;
 try{const url=new URL(origin);
  return (url.protocol==='https:'||((url.hostname==='localhost'||url.hostname==='127.0.0.1')&&url.protocol==='http:'))&&url.host===host&&url.pathname==='/'&&url.search===''&&url.hash==='';
 }catch{return false;}
}
function ownerKey(req){
 const expected=String(process.env.ARCANA_WIKI_OWNER_KEY||''),actual=String(req.headers['x-arcana-wiki-key']||'');
 if(!expected||!actual||Buffer.byteLength(expected)!==Buffer.byteLength(actual))return false;
 return timingSafeEqual(Buffer.from(expected),Buffer.from(actual));
}
async function isStaff(req){
 if(ownerKey(req))return true;
 const user=await accountUser(req);
 return can(user,'community:hide');
}
async function parse(req){
 if(!String(req.headers['content-type']||'').startsWith('application/json'))throw Object.assign(Error('JSON required'),{status:415});
 const chunks=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>9000)throw Object.assign(Error('Feedback is too large'),{status:413});chunks.push(chunk);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
 catch{throw Object.assign(Error('Invalid feedback'),{status:400});}
}
const validate=body=>{
 const category=short(body?.category,32),details=short(body?.details,2400),
 title=short(body?.title,110),page=short(body?.page,180),
 contact=short(body?.contact,120);
 if(!categories.has(category)||title.length<6||details.length<15)throw Object.assign(Error('Add a category, a descriptive title and at least 15 characters describing the issue'),{status:422});
 if(!/^#\/[a-z0-9/?&=_.%-]*$/i.test(page)&&page!=='')throw Object.assign(Error('Invalid page reference'),{status:422});
 if(contact&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)||contact.length>120))throw Object.assign(Error('Contact email is invalid'),{status:422});
 return {category,title,details,page,contact,clientVersion:short(body?.clientVersion,70)};
};
const rateKey=req=>{
 const forwarded=String(req.headers['x-forwarded-for']||'').split(',')[0].trim().slice(0,80);
 const remote=String(req.socket.remoteAddress||'');
 // IP is used in volatile rate-limit state only and not saved to feedback records.
 return hash(forwarded||remote);
};
function checkRate(req){
 const key=rateKey(req),now=Date.now();
 for(const [k,v] of rateMap)if(v.until<now)rateMap.delete(k);
 const prev=rateMap.get(key)||{count:0,until:now+3600000};
 if(prev.count>=6)throw Object.assign(Error('Feedback limit reached for this hour. Please try again later.'),{status:429});
 prev.count++;rateMap.set(key,prev);
}
export async function betaFeedbackRequest(req,res,url){
 if(url.pathname==='/api/beta/status'&&req.method==='GET'){
  send(res,200,{release:'arcana-real-accounts-beta-2026-10-13',guestTools:true,
   accountsConfigured:!!(process.env.ARCANA_DISCORD_CLIENT_ID&&process.env.ARCANA_DISCORD_CLIENT_SECRET&&process.env.ARCANA_AUTH_BASE_URL&&process.env.ARCANA_CREATOR_DISCORD_ID),
   wikiStorageConfigured:!!process.env.ARCANA_WIKI_DATA_DIR,
   betaEnrollmentOpen:betaEnrollmentOpen(),accountSignInEnabled:authAvailable(),feedbackEnabled:true,contentDate:'2026-10-09',note:'Game configuration snapshots and external directories may change independently of this release.'});return true;
 }
 if(url.pathname==='/api/beta/feedback'&&req.method==='POST'){
  if(!sameOrigin(req)){send(res,403,{error:'Submit feedback from Arcana itself.'});return true;}
  try{
   const body=await parse(req);
   // Hidden trap against trivial bot form submissions.
   if(body?.website){send(res,202,{ok:true,reference:'received'});return true;}
   const input=validate(body);
   checkRate(req);
   const id=randomUUID(),now=new Date().toISOString();
   const report={...input,id,createdAt:now,state:'new'};
   await queue(async()=>{
    await mkdir(root(),{recursive:true,mode:0o700});
    const temp=resolve(root(),'.'+id+'.tmp');
    await writeFile(temp,JSON.stringify(report),{flag:'wx',mode:0o600});
    try{await rename(temp,file(id));}catch(e){throw e;}
   });
   send(res,201,{ok:true,reference:id.slice(0,8)});return true;
  }catch(e){send(res,e.status||503,{error:e.status?e.message:'Feedback service unavailable.'});return true;}
 }
 if(url.pathname==='/api/beta/reports'&&req.method==='GET'){
  if(!await isStaff(req)){send(res,403,{error:'Staff access required'});return true;}
  try{
   const names=(await readdir(root())).filter(x=>/^[0-9a-f-]{36}\.json$/.test(x)).slice(-500);
   const reports=(await Promise.all(names.map(async n=>{
    try{return JSON.parse(await readFile(resolve(root(),n),'utf8'));}catch{return null;}
   }))).filter(Boolean).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
   send(res,200,{reports:reports.slice(0,200),total:reports.length});return true;
  }catch(e){if(e.code==='ENOENT')send(res,200,{reports:[],total:0});else send(res,503,{error:'Review queue unavailable'});return true;}
 }
 const match=url.pathname.match(/^\/api\/beta\/reports\/([0-9a-f-]{36})$/);
 if(match&&req.method==='PATCH'){
  if(!sameOrigin(req)||!await isStaff(req)){send(res,403,{error:'Staff access required'});return true;}
  try{
   const body=await parse(req),next=String(body?.state||'');
   if(!['new','reviewing','resolved','closed'].includes(next)){send(res,422,{error:'Invalid review status'});return true;}
   await queue(async()=>{
    const previous=JSON.parse(await readFile(file(match[1]),'utf8'));
    previous.state=next;previous.reviewedAt=new Date().toISOString();
    const temp=resolve(root(),'.'+randomUUID()+'.tmp');
    await writeFile(temp,JSON.stringify(previous),{flag:'wx',mode:0o600});
    await rename(temp,file(match[1]));
   });
   send(res,200,{ok:true});return true;
  }catch(e){send(res,e.code==='ENOENT'?404:503,{error:'Unable to update this report'});return true;}
 }
 return false;
}
