import {resolve} from 'node:path';
import {accountUser,requireCapability,dataRoot,readJSON,saveAtomic,queued,parseJSON,checkOrigin,sendJSON,publicProfile} from './account-server.mjs';
import {can} from './account-policy.js';
const store=()=>resolve(dataRoot(),'general-chat','messages.json');
const MAX_STORED=250;
const MAX_MESSAGE=400;
const cooldown=new Map();
const error=(status,message)=>Object.assign(new Error(message),{status});
const tidy=text=>String(text||'').trim().replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g,' ').slice(0,MAX_MESSAGE);
async function allMessages(){const value=await readJSON(store());return Array.isArray(value?.messages)?value.messages:[];}
export async function handleGeneralChat(req,res,url){
 const path=url.pathname,method=req.method;
 if(path==='/api/chat/messages'&&method==='GET'){
  const list=await allMessages(),limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit'))||70));
  const visible=list.filter(x=>!x.deleted).slice(-limit);
  const ids=[...new Set(visible.map(x=>x.authorId))];
  const people=new Map(await Promise.all(ids.map(async id=>[id,await readJSON(resolve(dataRoot(),'users',id+'.json')))])));
  sendJSON(res,200,{messages:visible.map(({id,authorId,name,message,createdAt})=>({id,authorId,name,message,createdAt,guildTag:people.get(authorId)?.profile?.guildTag||'',guildId:people.get(authorId)?.profile?.guildId||''})),updatedAt:new Date().toISOString()});return true;
 }
 if(path==='/api/chat/messages'&&method==='POST'){
  checkOrigin(req);
  const member=await requireCapability(req);
  const payload=await parseJSON(req,1500);
  const message=tidy(payload?.message);
  if(message.length<2)throw error(422,'Write at least two characters.');
  const now=Date.now(),last=cooldown.get(member.id)||{at:0,hour:now,count:0};
  if(now-last.at<7000)throw error(429,'Please wait a few seconds between messages.');
  if(now-last.hour<3600000&&last.count>=40)throw error(429,'You have reached the hourly message limit.');
  const saved=await queued(async()=>{
   const list=await allMessages();
   const item={id:cryptoRandom(),authorId:member.id,name:tidy(publicProfile(member).displayName).slice(0,50)||'Player',message,createdAt:new Date(now).toISOString()};
   list.push(item);await saveAtomic(store(),{messages:list.slice(-MAX_STORED)});return item;
  });
  cooldown.set(member.id,{at:now,hour:now-last.hour>=3600000?now:last.hour,count:now-last.hour>=3600000?1:last.count+1});
  sendJSON(res,201,{message:saved});return true;
 }
 const matched=path.match(/^\/api\/chat\/messages\/([0-9a-f-]{36})$/);
 if(matched&&method==='DELETE'){
  checkOrigin(req);const member=await requireCapability(req);
  await queued(async()=>{
   const list=await allMessages(),item=list.find(x=>x.id===matched[1]);
   if(!item||item.deleted)throw error(404,'Message not found.');
   if(item.authorId!==member.id&&!can(member,'community:hide'))throw error(403,'Not allowed to remove this message.');
   item.deleted=true;item.message='';item.name='';await saveAtomic(store(),{messages:list});
  });
  sendJSON(res,200,{ok:true});return true;
 }
 if(path==='/api/chat/report'&&method==='POST'){
  checkOrigin(req);const member=await requireCapability(req);
  const payload=await parseJSON(req,700),id=String(payload?.id||'');
  if(!/^[0-9a-f-]{36}$/.test(id))throw error(422,'Choose a valid message.');
  const result=await queued(async()=>{
   const list=await allMessages();const item=list.find(x=>x.id===id&&!x.deleted);
   if(!item)throw error(404,'Message not found.');
   if(!Array.isArray(item.reports))item.reports=[];
   if(!item.reports.includes(member.id))item.reports.push(member.id);
   if(item.reports.length>=3){item.deleted=true;item.message='';item.name='';}
   await saveAtomic(store(),{messages:list});return {reported:true,hidden:item.deleted===true};
  });
  sendJSON(res,200,result);return true;
 }
 return false;
}
import {randomUUID} from 'node:crypto';
function cryptoRandom(){return randomUUID();}
export async function safeGeneralChatRequest(req,res,url){
 try{return await handleGeneralChat(req,res,url);}
 catch(e){if(e.status>=400&&e.status<500)sendJSON(res,e.status,{error:e.message});else{console.error('Arcana general chat',e);sendJSON(res,503,{error:'Chat is temporarily unavailable.'});}return true;}
}
