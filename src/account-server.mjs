import {randomBytes, randomUUID, createHash, timingSafeEqual, createPublicKey, verify} from 'node:crypto';
import {mkdir, readFile, writeFile, rename, unlink} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {can, rolesOf, publicRoles, mayChangeRoles,AWARD_LABELS} from './account-policy.js';

const ACCOUNT_ID=/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/;
const DISCORD_ID=/^[0-9]{16,22}$/;
const SESSION_LIFETIME=14*86400;
export const betaEnrollmentOpen=()=>process.env.ARCANA_BETA_COHORT_OPEN==='1';
const MAX_PROFILE_BYTES=80000;
let writeQueue=Promise.resolve();
export const dataRoot=()=>resolve(process.env.ARCANA_ACCOUNT_DATA_DIR || resolve(process.env.ARCANA_WIKI_DATA_DIR||'.arcana-wiki-data','accounts'));
const oauthBaseReady=()=>{
 try{const url=new URL(process.env.ARCANA_AUTH_BASE_URL||'');return url.protocol==='https:'||(url.hostname==='localhost'&&url.protocol==='http:');}
 catch{return false;}
};
export const discordAuthAvailable=()=>Boolean(oauthBaseReady()&&process.env.ARCANA_DISCORD_CLIENT_ID&&process.env.ARCANA_DISCORD_CLIENT_SECRET);
export const googleAuthAvailable=()=>Boolean(oauthBaseReady()&&process.env.ARCANA_GOOGLE_CLIENT_ID&&process.env.ARCANA_GOOGLE_CLIENT_SECRET);
export const authAvailable=()=>discordAuthAvailable()||googleAuthAvailable();
const baseUrl=()=>new URL(process.env.ARCANA_AUTH_BASE_URL||'http://localhost:3000');
const cookieName=()=>baseUrl().protocol==='https:'?'__Host-arcana-session':'arcana-session';
const stateName=()=>baseUrl().protocol==='https:'?'__Host-arcana-oauth':'arcana-oauth';
const googleStateName=()=>baseUrl().protocol==='https:'?'__Host-arcana-google-oauth':'arcana-google-oauth';
const cookieFlags=age=>'Path=/; HttpOnly; SameSite=Lax; '+(baseUrl().protocol==='https:'?'Secure; ':'')+'Max-Age='+age;
const sha=value=>createHash('sha256').update(String(value)).digest('hex');
export const sendJSON=(res,code,data)=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data));};
const error=(status,txt)=>Object.assign(new Error(txt),{status});
export const readJSON=async(filename)=>{
 try{return JSON.parse(await readFile(filename,'utf8'));}
 catch(e){if(e.code==='ENOENT')return null;throw e;}
};
export async function saveAtomic(filename,data){
 await mkdir(dirname(filename),{recursive:true,mode:0o700});
 const temp=filename+'.'+randomUUID()+'.tmp';
 await writeFile(temp,JSON.stringify(data),{flag:'wx',mode:0o600});
 try{await rename(temp,filename);}catch(e){await unlink(temp).catch(()=>{});throw e;}
}
export const queued=task=>{
 const work=writeQueue.then(task);
 writeQueue=work.then(()=>undefined,()=>undefined);
 return work;
};
export async function parseJSON(req,limit=MAX_PROFILE_BYTES){
 let size=0;const chunks=[];
 if(!String(req.headers['content-type']||'').startsWith('application/json'))throw error(415,'JSON body required.');
 for await (const chunk of req){size+=chunk.length;if(size>limit)throw error(413,'Request too large.');chunks.push(chunk);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
 catch{throw error(400,'Invalid JSON.');}
}
export const checkOrigin=req=>{
 const origin=String(req.headers.origin||'');
 if(!authAvailable()||origin!==baseUrl().origin)throw error(403,'Request origin not permitted.');
};
const cookies=req=>Object.fromEntries(String(req.headers.cookie||'').split(';').map(pair=>{
 const i=pair.indexOf('=');return i<0?['','']:[pair.slice(0,i).trim(),pair.slice(i+1).trim()];
}).filter(([k])=>k));
const safeText=(value,max)=>String(value||'').trim().slice(0,max).replace(/[\u0000-\u001f\u007f]/g,' ');
const asCreator=account=>({...account,isCreator:DISCORD_ID.test(process.env.ARCANA_CREATOR_DISCORD_ID||'')&&account.discordId===process.env.ARCANA_CREATOR_DISCORD_ID});
const ARCANA_BANNERS=['nebula','frost','ember','forest','royal'];
export function publicProfile(account){
 const a=asCreator(account),earned=new Set(rolesOf(a));for(const award of a.awards||[])if(AWARD_LABELS[award])earned.add(award);if(a.profile?.verifiedCharacter?.status==='approved')earned.add('verified-character');
 const featured=Array.isArray(a.profile?.featuredBadges)?a.profile.featuredBadges.filter(id=>earned.has(id)).slice(0,3):[];
 return {id:a.id,displayName:a.profile?.displayName||a.discordName||a.googleName||'Arcana player',
 inGameName:a.profile?.inGameName||'',guild:a.profile?.guild||'',guildTag:a.profile?.guildTag||'',guildId:a.profile?.guildId||'',favoriteClass:a.profile?.favoriteClass||'',
 description:a.profile?.description||'',tagline:a.profile?.tagline||'',bannerTheme:ARCANA_BANNERS.includes(a.profile?.bannerTheme)?a.profile.bannerTheme:'nebula',featuredBadges:featured,avatarDataUrl:a.profile?.avatarDataUrl||'',raidStatus:a.profile?.raidStatus||'',guildStatus:a.profile?.guildStatus||'',
 verifiedCharacter:a.profile?.verifiedCharacter?.status==='approved'?{name:a.profile.verifiedCharacter.name,approvedAt:a.profile.verifiedCharacter.approvedAt}:null,
 awards:(a.awards||[]).filter(id=>AWARD_LABELS[id]).map(id=>({id,label:AWARD_LABELS[id]})),
 roles:publicRoles(a),joinedAt:a.joinedAt||'',betaTesterSince:a.betaTesterSince||'',suspended:!!a.suspended};
}
export const selfProfile=account=>({...publicProfile(account),authProviders:{discord:Boolean(account.discordId),google:Boolean(account.googleSub)},isOwner:asCreator(account).isCreator===true,permissions:{
 createCommunity:can(asCreator(account),'community:create'),publishWiki:can(asCreator(account),'wiki:publish'),
 hideContent:can(asCreator(account),'community:hide'),deleteContent:can(asCreator(account),'community:delete'),
 manageRoles:can(asCreator(account),'roles:manage'),viewAnalytics:can(asCreator(account),'analytics:view'),manageSite:can(asCreator(account),'site:manage'),reviewCharacters:can(asCreator(account),'character:review'),manageRecords:can(asCreator(account),'records:manage'),staffAccess:can(asCreator(account),'staff:access')},verificationStatus:account.profile?.characterClaim?.status||'none'});
const accountFile=id=>resolve(dataRoot(),'users',id+'.json');
const sessionFile=token=>resolve(dataRoot(),'sessions',sha(token)+'.json');
export async function accountUser(req){
 const token=cookies(req)[cookieName()]||'';
 if(!/^[a-zA-Z0-9_-]{40,100}$/.test(token))return null;
 const session=await readJSON(sessionFile(token));
 if(!session||session.expires<Date.now()||!ACCOUNT_ID.test(session.id))return null;
 const account=await readJSON(accountFile(session.id));
 return account&&!account.suspended?asCreator(account):null;
}
const requireUser=async(req,permission)=>{
 const account=await accountUser(req);
 if(!account)throw error(401,'Sign in to continue.');
 if(permission&&!can(account,permission))throw error(403,'Your Arcana role does not allow this action.');
 return account;
};
export const requireCapability=requireUser;
async function createSession(res,account){
 const token=randomBytes(32).toString('base64url');
 await saveAtomic(sessionFile(token),{id:account.id,expires:Date.now()+SESSION_LIFETIME*1000});
 return cookieName()+'='+token+'; '+cookieFlags(SESSION_LIFETIME);
}
async function discordIdentity(user){
 if(!user||!DISCORD_ID.test(String(user.id||'')))throw error(502,'Unable to verify Discord identity.');
 return queued(async()=>{
  const indexPath=resolve(dataRoot(),'discord',user.id+'.json');
  const indexed=await readJSON(indexPath);
  let account=indexed&&ACCOUNT_ID.test(indexed.id)?await readJSON(accountFile(indexed.id)):null;
  if(!account){
   account={id:randomUUID(),discordId:user.id,discordName:safeText(user.global_name||user.username,70),roles:[],betaTesterSince:betaEnrollmentOpen()?new Date().toISOString():'',
    profile:{displayName:safeText(user.global_name||user.username,50),inGameName:'',guild:'',favoriteClass:'',description:'',raidStatus:'',guildStatus:''},
    joinedAt:new Date().toISOString(),suspended:false};
   await saveAtomic(accountFile(account.id),account);
   await saveAtomic(indexPath,{id:account.id});
  } else {
   // Returning members who first join during the beta receive the permanent
   // award once. Turning off enrollment never removes previously earned roles.
   if(betaEnrollmentOpen()&&!account.betaTesterSince)account.betaTesterSince=new Date().toISOString();
   account.discordName=safeText(user.global_name||user.username,70);
   await saveAtomic(accountFile(account.id),account);
  }
  return account;
 });
}
// A Google user is identified only by the verified OIDC subject, never by email.
const GOOGLE_SUB=/^[A-Za-z0-9_-]{10,128}$/;
const GOOGLE_JWKS='https://www.googleapis.com/oauth2/v3/certs';
let jwksCache=null;
async function googleKeys(){
 if(jwksCache&&jwksCache.until>Date.now())return jwksCache.keys;
 const response=await fetch(GOOGLE_JWKS,{signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw error(502,'Google verification keys unavailable.');
 const data=await response.json();
 if(!Array.isArray(data.keys)||!data.keys.length)throw error(502,'Google verification keys unavailable.');
 const keys=data.keys.filter(k=>k.kty==='RSA'&&k.alg==='RS256'&&typeof k.kid==='string'&&k.n&&k.e);
 if(!keys.length)throw error(502,'Google verification keys unavailable.');
 jwksCache={keys,until:Date.now()+15*60*1000};return keys;
}
async function verifyGoogleIdToken(jwt,nonce){
 const parts=String(jwt||'').split('.');
 if(parts.length!==3||parts.some(x=>!x||x.length>12000))throw error(401,'Invalid Google identity token.');
 let header,payload;
 try{
  header=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));
  payload=JSON.parse(Buffer.from(parts[1],'base64url').toString('utf8'));
 }catch{throw error(401,'Invalid Google identity token.');}
 if(header.alg!=='RS256'||typeof header.kid!=='string'||header.kid.length>200)throw error(401,'Invalid Google identity signature.');
 const key=(await googleKeys()).find(k=>k.kid===header.kid);
 if(!key||!verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),createPublicKey({key,format:'jwk'}),Buffer.from(parts[2],'base64url')))
  throw error(401,'Google identity signature could not be verified.');
 const now=Math.floor(Date.now()/1000);
 if(!['accounts.google.com','https://accounts.google.com'].includes(payload.iss)||
  payload.aud!==process.env.ARCANA_GOOGLE_CLIENT_ID||
  typeof payload.exp!=='number'||payload.exp<=now||
  typeof payload.iat!=='number'||payload.iat>now+60||payload.iat<now-3600||
  !equal(payload.nonce,nonce)||!GOOGLE_SUB.test(String(payload.sub||''))||
  payload.email_verified!==true)
  throw error(401,'Google identity could not be verified.');
 return {sub:payload.sub,name:safeText(payload.name||payload.given_name||'Arcana player',70)};
}
async function googleIdentity(identity,{linkAccount=null}={}){
 if(!GOOGLE_SUB.test(identity.sub))throw error(401,'Invalid Google identity.');
 return queued(async()=>{
  const indexPath=resolve(dataRoot(),'google',identity.sub+'.json');
  const indexed=await readJSON(indexPath);
  const linkedId=indexed?.id;
  if(linkAccount){
   const existing=linkedId&&ACCOUNT_ID.test(linkedId)?await readJSON(accountFile(linkedId)):null;
   if(linkedId&&(!existing||linkedId!==linkAccount.id))throw error(409,'This Google login belongs to another Arcana account.');
   const account=await readJSON(accountFile(linkAccount.id));
   if(!account||account.suspended)throw error(403,'Account unavailable.');
   if(account.googleSub&&account.googleSub!==identity.sub)throw error(409,'This Arcana account already has a different Google login.');
   account.googleSub=identity.sub;account.googleName=identity.name;
   await saveAtomic(accountFile(account.id),account);
   await saveAtomic(indexPath,{id:account.id});
   return account;
  }
  let account=linkedId&&ACCOUNT_ID.test(linkedId)?await readJSON(accountFile(linkedId)):null;
  if(linkedId&&!account)throw error(409,'Google identity is linked to an unavailable account.');
  if(!account){
   const name=safeText(identity.name||'Arcana player',50)||'Arcana player';
   account={id:randomUUID(),googleSub:identity.sub,googleName:identity.name,roles:[],
    betaTesterSince:betaEnrollmentOpen()?new Date().toISOString():'',
    profile:{displayName:name,inGameName:'',guild:'',favoriteClass:'',description:'',raidStatus:'',guildStatus:''},
    joinedAt:new Date().toISOString(),suspended:false};
   await saveAtomic(accountFile(account.id),account);
   await saveAtomic(indexPath,{id:account.id});
  }else{
   if(account.suspended)throw error(403,'Account unavailable.');
   if(betaEnrollmentOpen()&&!account.betaTesterSince)account.betaTesterSince=new Date().toISOString();
   account.googleName=identity.name;await saveAtomic(accountFile(account.id),account);
  }
  return account;
 });
}
async function linkDiscordIdentity(user,linkAccount){
 if(!user||!DISCORD_ID.test(String(user.id||'')))throw error(502,'Unable to verify Discord identity.');
 return queued(async()=>{
  const path=resolve(dataRoot(),'discord',user.id+'.json');
  const indexed=await readJSON(path);
  if(indexed?.id&&indexed.id!==linkAccount.id)throw error(409,'This Discord login belongs to another Arcana account.');
  const account=await readJSON(accountFile(linkAccount.id));
  if(!account||account.suspended)throw error(403,'Account unavailable.');
  if(account.discordId&&account.discordId!==user.id)throw error(409,'This Arcana account already has another Discord login.');
  account.discordId=user.id;account.discordName=safeText(user.global_name||user.username,70);
  await saveAtomic(accountFile(account.id),account);
  await saveAtomic(path,{id:account.id});
  return account;
 });
}
const redirect=(res,url,cookie=null)=>{
 res.writeHead(303,{'location':url,'cache-control':'no-store',...(cookie?{'set-cookie':cookie}:{})});res.end();
};
const equal=(a,b)=>{
 const x=Buffer.from(String(a)),y=Buffer.from(String(b));
 return x.length===y.length&&timingSafeEqual(x,y);
};
const profileFields=['displayName','inGameName','guild','favoriteClass','description','raidStatus','guildStatus','tagline'];
const fieldLengths={displayName:50,inGameName:48,guild:70,favoriteClass:45,description:500,raidStatus:90,guildStatus:90,tagline:100};
function validAvatar(value){
 if(value==='')return '';
 if(typeof value!=='string'||value.length>64000)throw error(422,'Avatar is too large (maximum 45 KB).');
 const match=value.match(/^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/);
 if(!match)throw error(422,'Upload a JPG, PNG or WebP image.');
 const b=Buffer.from(match[2],'base64');
 if(b.length>46000||b.length<16)throw error(422,'Avatar must be smaller than 45 KB.');
 const mime=match[1],valid=mime==='png'?b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
 mime==='webp'?b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP':
 b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;
 if(!valid)throw error(422,'Image format is not valid.');
 return value;
}
export async function handleAccountRequest(req,res,url){
 const {pathname}=url, method=req.method;
 if(pathname==='/api/account/me'&&method==='GET'){
  const user=await accountUser(req);
  sendJSON(res,200,{enabled:authAvailable(),providers:{discord:discordAuthAvailable(),google:googleAuthAvailable()},betaEnrollmentOpen:betaEnrollmentOpen(),user:user?selfProfile(user):null});return true;
 }
 if((pathname==='/api/account/login'||pathname==='/api/account/discord/link')&&method==='GET'){
  if(!discordAuthAvailable()){sendJSON(res,503,{error:'Account sign-in is not configured on this environment.'});return true;}
  const link=pathname==='/api/account/discord/link';
  const member=link?await requireUser(req):null;
  const state=randomBytes(28).toString('base64url');
  const authorize=new URL('https://discord.com/oauth2/authorize');
  authorize.searchParams.set('response_type','code');
  authorize.searchParams.set('client_id',process.env.ARCANA_DISCORD_CLIENT_ID);
  authorize.searchParams.set('redirect_uri',new URL('/api/account/callback',baseUrl()).href);
  authorize.searchParams.set('scope','identify');
  authorize.searchParams.set('state',state);
  redirect(res,authorize.href,stateName()+'='+state+(link?'~'+member.id:'')+'; '+cookieFlags(600));return true;
 }
 if(pathname==='/api/account/callback'&&method==='GET'){
  const clear=stateName()+'=; '+cookieFlags(0);
  const callbackState=url.searchParams.get('state'),cookieState=cookies(req)[stateName()]||'';
  const [expectedState,linkId]=cookieState.split('~');
  if(!discordAuthAvailable()||!url.searchParams.get('code')||!callbackState||!expectedState||!equal(callbackState,expectedState)){
   redirect(res,'/#/account?error=sign-in',clear);return true;
  }
  try{
   const body=new URLSearchParams({grant_type:'authorization_code',code:url.searchParams.get('code'),
    redirect_uri:new URL('/api/account/callback',baseUrl()).href});
   const auth=Buffer.from(process.env.ARCANA_DISCORD_CLIENT_ID+':'+process.env.ARCANA_DISCORD_CLIENT_SECRET).toString('base64');
   const response=await fetch('https://discord.com/api/v10/oauth2/token',{method:'POST',headers:{authorization:'Basic '+auth,'content-type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error('OAuth token exchange failed');
   const token=await response.json();
   if(!token.access_token)throw Error('Missing OAuth access token');
   const who=await fetch('https://discord.com/api/v10/users/@me',{headers:{authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(10000)});
   if(!who.ok)throw Error('Discord identity unavailable');
   const identity=await who.json();
   const member=linkId?await accountUser(req):null;
   if(linkId&&(!member||member.id!==linkId))throw error(403,'The original Arcana session changed. Please reconnect.');
   const account=linkId?await linkDiscordIdentity(identity,member):await discordIdentity(identity);
   redirect(res,'/#/account',[clear,...(linkId?[]:[await createSession(res,account)])]);
  }catch(e){console.error('Arcana OAuth callback error:',e.message);redirect(res,'/#/account?error=sign-in',clear);}
  return true;
 }
 if((pathname==='/api/account/google/login'||pathname==='/api/account/google/link')&&method==='GET'){
  if(!googleAuthAvailable()){sendJSON(res,503,{error:'Google sign-in is not configured in this environment.'});return true;}
  const link=pathname==='/api/account/google/link',member=link?await requireUser(req):null;
  if(member?.googleSub){redirect(res,'/#/account');return true;}
  const state=randomBytes(28).toString('base64url'),nonce=randomBytes(24).toString('base64url');
  const authorize=new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorize.searchParams.set('client_id',process.env.ARCANA_GOOGLE_CLIENT_ID);
  authorize.searchParams.set('redirect_uri',new URL('/api/account/google/callback',baseUrl()).href);
  authorize.searchParams.set('response_type','code');
  authorize.searchParams.set('scope','openid email profile');
  authorize.searchParams.set('state',state);
  authorize.searchParams.set('nonce',nonce);
  redirect(res,authorize.href,googleStateName()+'='+[state,nonce,...(member?[member.id]:[])].join('~')+'; '+cookieFlags(600));return true;
 }
 if(pathname==='/api/account/google/callback'&&method==='GET'){
  const clear=googleStateName()+'=; '+cookieFlags(0);
  const [expectedState,expectedNonce,linkId]=String(cookies(req)[googleStateName()]||'').split('~');
  const state=url.searchParams.get('state'),code=url.searchParams.get('code');
  if(!googleAuthAvailable()||!state||!expectedState||!expectedNonce||!equal(state,expectedState)||!code){
   redirect(res,'/#/account?error=sign-in',clear);return true;
  }
  try{
   const member=linkId?await accountUser(req):null;
   if(linkId&&(!member||member.id!==linkId))throw error(403,'The original Arcana session changed.');
   const body=new URLSearchParams({grant_type:'authorization_code',code,client_id:process.env.ARCANA_GOOGLE_CLIENT_ID,
    client_secret:process.env.ARCANA_GOOGLE_CLIENT_SECRET,redirect_uri:new URL('/api/account/google/callback',baseUrl()).href});
   const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',
    headers:{'content-type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw error(502,'Google token exchange failed.');
   const tokens=await response.json();
   const identity=await verifyGoogleIdToken(tokens.id_token,expectedNonce);
   const account=await googleIdentity(identity,{linkAccount:member});
   redirect(res,'/#/account',[clear,...(linkId?[]:[await createSession(res,account)])]);
  }catch(e){
   console.error('Arcana Google sign-in error:',e.message);
   redirect(res,'/#/account?error=sign-in',clear);
  }
  return true;
 }
 if(pathname==='/api/account/logout'&&method==='POST'){
  checkOrigin(req);
  const token=cookies(req)[cookieName()]||'';
  if(/^[a-zA-Z0-9_-]{40,100}$/.test(token))await unlink(sessionFile(token)).catch(()=>{});
  res.writeHead(200,{'content-type':'application/json','cache-control':'no-store','set-cookie':cookieName()+'=; '+cookieFlags(0)});res.end('{"ok":true}');return true;
 }
 const profilePath=pathname.match(/^\/api\/profiles\/([0-9a-f-]{36})$/);
 if(profilePath&&method==='GET'){
  const user=await readJSON(accountFile(profilePath[1]));
  if(!user||user.suspended){sendJSON(res,404,{error:'Profile unavailable'});return true;}
  sendJSON(res,200,{profile:publicProfile(user)});return true;
 }
 if(pathname==='/api/account/profile'&&method==='PATCH'){
  checkOrigin(req);const user=await requireUser(req);
  const body=await parseJSON(req);
  const fields=body?.profile;
  if(!fields||typeof fields!=='object'||Array.isArray(fields))throw error(400,'Profile object required.');
  const profile={...user.profile};
  if(Object.hasOwn(fields,'guildTag')){
   const tag=String(fields.guildTag||'').trim().toUpperCase();
   if(tag&&!/^[A-Z]{2,4}$/.test(tag))throw error(422,'Guild tag must be 2–4 letters (A-Z).');
   profile.guildTag=tag;
  }
  for(const key of profileFields)if(Object.hasOwn(fields,key))profile[key]=safeText(fields[key],fieldLengths[key]);
  if(Object.hasOwn(fields,'avatarDataUrl'))profile.avatarDataUrl=validAvatar(fields.avatarDataUrl);
  if(Object.hasOwn(fields,'bannerTheme')){if(!ARCANA_BANNERS.includes(fields.bannerTheme))throw error(422,'Unknown profile banner style.');profile.bannerTheme=fields.bannerTheme;}
  if(Object.hasOwn(fields,'featuredBadges')){
   if(!Array.isArray(fields.featuredBadges)||fields.featuredBadges.length>3||new Set(fields.featuredBadges).size!==fields.featuredBadges.length)throw error(422,'Choose up to three distinct earned badges.');
   const earned=new Set(rolesOf(user));for(const award of user.awards||[])if(AWARD_LABELS[award])earned.add(award);if(user.profile?.verifiedCharacter?.status==='approved')earned.add('verified-character');
   if(fields.featuredBadges.some(x=>!earned.has(x)))throw error(403,'You may only feature badges you have earned.');
   profile.featuredBadges=fields.featuredBadges;
  }
  if(profile.displayName.length<2)throw error(422,'Display name needs at least two characters.');
  const updated=await queued(async()=>{
   const current=await readJSON(accountFile(user.id));
   if(!current||current.suspended)throw error(403,'Account unavailable.');
   if(profile.guildTag){
    const {reservedGuildTag}=await import('./guild-hub-server.mjs');
    const reserved=await reservedGuildTag(profile.guildTag);
    if(reserved&&!reserved.members.some(m=>m.id===user.id))throw error(409,'This tag is reserved for members of a registered guild.');
   }
   current.profile=profile;await saveAtomic(accountFile(user.id),current);return current;
  });
  sendJSON(res,200,{profile:selfProfile(updated)});return true;
 }
 const assign=pathname.match(/^\/api\/admin\/roles\/([0-9a-f-]{36})$/);
 if(assign&&method==='PATCH'){
  checkOrigin(req);const actor=await requireUser(req,'roles:manage');
  const input=await parseJSON(req);
  const next=input?.roles,awards=input?.awards;
  if(!Array.isArray(next)||new Set(next).size!==next.length||next.length>4)throw error(422,'Invalid role list.');
  if(awards!==undefined&&(!Array.isArray(awards)||awards.length>Object.keys(AWARD_LABELS).length||new Set(awards).size!==awards.length||awards.some(id=>!Object.hasOwn(AWARD_LABELS,id))))throw error(422,'Invalid contributor awards.');
  const updated=await queued(async()=>{
   const target=await readJSON(accountFile(assign[1]));
   if(!target)throw error(404,'Member not found.');
   if(!mayChangeRoles(actor,asCreator(target),next))throw error(403,'Only the Creator can grant or change privileged roles.');
   target.roles=[...next];if(awards!==undefined)target.awards=[...awards];await saveAtomic(accountFile(target.id),target);return target;
  });
  sendJSON(res,200,{profile:publicProfile(updated)});return true;
 }
 return false;
}
export async function safeAccountRequest(req,res,url){
 try{return await handleAccountRequest(req,res,url);}
 catch(e){if(e.status<500&&e.status>=400)sendJSON(res,e.status,{error:e.message});else{console.error('Arcana account error:',e);sendJSON(res,500,{error:'Account service unavailable.'});}return true;}
}
