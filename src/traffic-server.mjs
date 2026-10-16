/**
 * First-party, privacy-minimal Arcana traffic aggregation.
 * Counts SPA route views and approximate browsing sessions. No IP addresses,
 * Discord identities, full URLs, referrers or user agents are stored.
 * Aggregates survive restarts via the existing account data volume.
 */
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {accountUser,dataRoot,saveAtomic,readJSON,sendJSON} from './account-server.mjs';
import {can} from './account-policy.js';

const file=()=>resolve(process.env.ARCANA_TRAFFIC_DATA_DIR||resolve(dataRoot(),'traffic'),'traffic-v1.json');
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const ROUTES=new Set([
 'home','directory','featured','user','recent','settings','icons','account','profile',
 'wiki','wiki/about','wiki/topics','wiki/topic','wiki/guides','wiki/article','wiki/library',
 'wiki/items','wiki/mechanics','wiki/studio','wiki/guide','wiki/item','wiki/mechanic','wiki/reference',
 'reference/detail','labs','labs/build','labs/runes','labs/skills','labs/passives','labs/pets','labs/guild-tree',
 'calculators','calculators/upgrade','calculators/pathfinder','calculators/compare',
 'calculators/pet','calculators/affixes','calculators/ml-farm',
 'lfg','lfg/raids','lfg/guilds','lfg/guild','lfg/guild/new','lfg/guild/edit','lfg/listing','lfg/guild-tree',
 'community','community/post','community/create','beta','beta/reports'
]);
const DAY=86400000;
const isoDay=ms=>new Date(ms).toISOString().slice(0,10);
const cleanRoute=route=>typeof route==='string'&&ROUTES.has(route)?route:null;
const hashed=(session,day)=>createHash('sha256').update(day+'|'+session).digest('hex').slice(0,32);
let cached=null;
let queue=Promise.resolve();
const active=new Map(); // in-memory five-minute activity; never stored on disk
const currentRoute=new Map(); // tiny anti-duplicate window for repeated render events

async function store(){
 if(cached)return cached;
 const data=await readJSON(file());
 cached=data&&data.version===1&&data.days&&data.seen?data:{version:1,startedAt:new Date().toISOString(),days:{},seen:{}};
 return cached;
}
function prune(s,now){
 const first=isoDay(now-89*DAY),yesterday=isoDay(now-DAY);
 for(const date of Object.keys(s.days))if(date<first)delete s.days[date];
 for(const date of Object.keys(s.seen))if(date<yesterday)delete s.seen[date];
 for(const [hash,last] of active)if(now-last>5*60000)active.delete(hash);
 for(const [hash,last] of currentRoute)if(now-last.at>5000)currentRoute.delete(hash);
}
function sameOrigin(req){
 try{
  const origin=new URL(String(req.headers.origin||''));
  return (origin.protocol==='https:'||origin.protocol==='http:')&&origin.host===String(req.headers.host||'');
 }catch{return false;}
}
async function parseEvent(req){
 if(!String(req.headers['content-type']||'').startsWith('application/json'))return null;
 let size=0, chunks=[];
 for await(const part of req){size+=part.length;if(size>512)return null;chunks.push(part);}
 try{const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if(!UUID.test(value?.session)||!cleanRoute(value?.route)||!['view','heartbeat'].includes(value?.type))return null;
  return {session:value.session.toLowerCase(),route:value.route,type:value.type};
 }catch{return null;}
}
export function trafficSnapshot(s,now=Date.now()){
 prune(s,now);
 const days=Array.from({length:30},(_,i)=>{
  const date=isoDay(now-(29-i)*DAY),data=s.days[date]||{};
  return {date,views:data.views||0,sessions:data.sessions||0};
 });
 const last=days.slice(-7);
 const pages={};
 for(const date of days){
  const entries=s.days[date.date]?.pages||{};
  for(const [route,n] of Object.entries(entries))if(cleanRoute(route))pages[route]=(pages[route]||0)+n;
 }
 const sum=(arr,key)=>arr.reduce((total,day)=>total+day[key],0);
 return {status:'collecting',startedAt:s.startedAt,updatedAt:new Date(now).toISOString(),timezone:'UTC',
  today:days[29],last7:{views:sum(last,'views'),sessions:sum(last,'sessions')},
  last30:{views:sum(days,'views'),sessions:sum(days,'sessions')},
  activeSessions:active.size,days,
  topPages:Object.entries(pages).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,12)
    .map(([route,views])=>({route,views}))};
}
export async function recordTraffic({session,route,type},now=Date.now()){
 if(!UUID.test(session)||!cleanRoute(route)||!['view','heartbeat'].includes(type))return false;
 const task=queue.then(async()=>{
  const s=await store(),day=isoDay(now),hash=hashed(session,day);
  prune(s,now);
  active.set(hash,now);
  if(type==='heartbeat')return true;
  const recentKey=hash+'|'+route;
  const last=currentRoute.get(recentKey);
  if(last&&now-last.at<3000)return true;
  currentRoute.set(recentKey,{at:now});
  const data=s.days[day]||(s.days[day]={views:0,sessions:0,pages:{}});
  const seen=s.seen[day]||(s.seen[day]={});
  data.views++;
  data.pages[route]=(data.pages[route]||0)+1;
  if(!seen[hash]){seen[hash]=1;data.sessions++;}
  await saveAtomic(file(),s);
  return true;
 });
 queue=task.catch(()=>{});
 return task;
}
export async function handleTrafficRequest(req,res,url){
 const {pathname}=url,method=req.method;
 if(pathname==='/api/admin/traffic'){
  if(method!=='GET'){sendJSON(res,405,{error:'Method not allowed'});return true;}
  const user=await accountUser(req);
  if(!user){sendJSON(res,401,{error:'Sign in with Discord to view site analytics.'});return true;}
  if(!can(user,'analytics:view')){sendJSON(res,403,{error:'Admin or Creator role required.'});return true;}
  try{sendJSON(res,200,trafficSnapshot(await store()));}
  catch(e){console.error('Traffic read failed:',e);sendJSON(res,503,{error:'Traffic statistics unavailable.'});}
  return true;
 }
 if(pathname==='/api/traffic/event'){
  if(method!=='POST'){sendJSON(res,405,{error:'Method not allowed'});return true;}
  if(!sameOrigin(req)){sendJSON(res,403,{error:'Invalid origin'});return true;}
  const event=await parseEvent(req);
  if(!event){sendJSON(res,422,{error:'Invalid traffic event'});return true;}
  try{await recordTraffic(event);res.writeHead(204,{'cache-control':'no-store'});res.end();}
  catch(e){console.error('Traffic write failed:',e);sendJSON(res,503,{error:'Traffic tracking unavailable.'});}
  return true;
 }
 return false;
}
