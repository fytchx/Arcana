import {randomUUID} from 'node:crypto';
import {readdir,readFile,appendFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {accountUser,requireCapability,dataRoot,readJSON,saveAtomic,queued,parseJSON,checkOrigin,sendJSON,publicProfile} from './account-server.mjs';
import {can} from './account-policy.js';

// Arcana guilds are a community feature, not verified IdleArc in-game guild state.
// The account-volume directory is intentionally shared with existing profiles.
const ROOT=()=>resolve(dataRoot(),'guild-hub');
const DIR=()=>resolve(ROOT(),'guilds');
const USERS=()=>resolve(dataRoot(),'users');
const UUID=/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/;
export const validTag=value=>typeof value==='string'&&/^[A-Za-z]{4}$/.test(value);
const clean=(v,n)=>String(v??'').trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,n);
const fail=(code,message)=>{throw Object.assign(Error(message),{status:code});};
const filename=id=>resolve(DIR(),id+'.json');
const userfile=id=>resolve(USERS(),id+'.json');
const now=()=>new Date().toISOString();
const maxItems=2500;
const statusActive=g=>['pending','approved'].includes(g.status);
const staff=(g,id)=>g.ownerId===id||g.members.some(m=>m.id===id&&m.role==='officer');
const member=(g,id)=>g.members.some(m=>m.id===id);
const moderator=user=>can(user,'community:hide');
const defaultCrest=()=>({center:0,secondary:0,outline:0,border:0,colors:['#E9D7FF','#9785E8','#39235E','#F5E9BA']});
export function validateCrest(input){
 if(!input||typeof input!=='object'||Array.isArray(input))fail(422,'Choose a valid crest design.');
 const nums=[['center',25],['secondary',25],['outline',10],['border',10]];
 const output={};
 for(const [key,max] of nums){
  if(!Number.isInteger(input[key])||input[key]<0||input[key]>=max)fail(422,'Invalid '+key+' crest shape.');
  output[key]=input[key];
 }
 if(!Array.isArray(input.colors)||input.colors.length!==4||input.colors.some(v=>typeof v!=='string'||!/^#[0-9a-fA-F]{6}$/.test(v)))fail(422,'Choose four crest colors.');
 output.colors=input.colors.map(v=>v.toUpperCase());
 return output;
}
async function guilds(){
 let names;try{names=(await readdir(DIR())).filter(n=>n.endsWith('.json')&&UUID.test(n.slice(0,-5))).slice(0,maxItems);}
 catch(e){if(e.code==='ENOENT')return [];throw e;}
 return (await Promise.all(names.map(n=>readJSON(resolve(DIR(),n))))).filter(Boolean);
}
async function current(id){if(!UUID.test(id))fail(404,'Guild not found.');const g=await readJSON(filename(id));if(!g)fail(404,'Guild not found.');return g;}
async function audit(action,g,actor,detail=''){
 await mkdir(ROOT(),{recursive:true,mode:0o700});
 await appendFile(resolve(ROOT(),'moderation.jsonl'),JSON.stringify({action,guildId:g.id,actor,detail,at:now()})+'\n',{mode:0o600});
}
function publicGuild(g,viewer,detail=false){
 const staffAccess=!!viewer&&(staff(g,viewer.id)||moderator(viewer));
 const mine=!!viewer&&member(g,viewer.id);
 const icon=(g.icon?.status==='approved'?g.icon.value:'');
 const base={id:g.id,name:g.name,tag:g.tag,bio:g.bio,status:g.status,crest:g.status==='approved'?g.crest:null,
 iconDataUrl:icon,createdAt:g.createdAt,memberCount:g.members.length,ownerId:g.ownerId,
 recruitmentOpen:g.recruitmentOpen===true,amMember:mine,canManage:staffAccess,memberRole:g.members.find(m=>m.id===viewer?.id)?.role||null,
 myApplication:g.applications.find(a=>a.id===viewer?.id&&a.status==='pending')?.status||null,
 pendingIconDataUrl:staffAccess&&moderator(viewer)&&g.icon?.status==='pending'?g.icon.pending:''};
 if(!detail)return base;
 return {...base,members:g.members.map(m=>({id:m.id,role:m.role,joinedAt:m.joinedAt,name:m.name})),
 posts:g.posts.filter(p=>g.status==='approved'&&(mine||staffAccess||p.kind==='announcement')).slice(-120).reverse(),
 applications:staffAccess?g.applications.filter(a=>a.status==='pending'):[]};
}
function picture(value){
 if(typeof value!=='string'||value.length>63000)fail(422,'Guild icon is too large.');
 const m=value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
 if(!m)fail(422,'Upload PNG, JPG or WebP only.');
 const b=Buffer.from(m[2],'base64');
 if(b.length<16||b.length>46000)fail(422,'Guild icon must be under 45 KB after resizing.');
 const valid=m[1]==='png'?b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
  m[1]==='webp'?b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP':
  b[0]===255&&b[1]===216&&b[2]===255;
 if(!valid)fail(422,'Guild icon file signature is invalid.');
 return value;
}
async function updateMembership(userId,guild,join){
 const a=await readJSON(userfile(userId));if(!a||a.suspended)return;
 a.profile=a.profile||{};
 if(join){a.profile.guildId=guild.id;a.profile.guildTag=guild.tag;a.profile.guild=guild.name;}
 else if(a.profile.guildId===guild.id){a.profile.guildId='';if(a.profile.guildTag===guild.tag)a.profile.guildTag='';}
 await saveAtomic(userfile(userId),a);
}
async function clearTagImpersonators(g){
 let files;try{files=(await readdir(USERS())).filter(n=>n.endsWith('.json')&&UUID.test(n.slice(0,-5)));}catch(e){if(e.code==='ENOENT')return;throw e;}
 const allowed=new Set(g.members.map(m=>m.id));
 for(const f of files){
  const a=await readJSON(resolve(USERS(),f));if(!a||allowed.has(a.id)||a.profile?.guildTag!==g.tag)continue;
  a.profile.guildTag='';await saveAtomic(userfile(a.id),a);
 }
}
export async function reservedGuildTag(tag){
 const normalized=String(tag||'').toUpperCase();
 return (await guilds()).find(g=>g.tag===normalized&&statusActive(g))||null;
}
export async function handleGuildHubRequest(req,res,url){
 const p=url.pathname,m=req.method;
 if(p==='/api/guild-hub'&&m==='GET'){
  const viewer=await accountUser(req),all=await guilds();
  const visible=all.filter(g=>g.status==='approved'||viewer&&(g.ownerId===viewer.id||moderator(viewer)));
  sendJSON(res,200,{guilds:visible.map(g=>publicGuild(g,viewer)).sort((a,b)=>a.name.localeCompare(b.name))});return true;
 }
 if(p==='/api/guild-hub/moderation'&&m==='GET'){
  const mod=await requireCapability(req,'community:hide');
  const all=await guilds();
  sendJSON(res,200,{guilds:all.filter(g=>g.status==='pending'||g.icon?.status==='pending').map(g=>publicGuild(g,mod))});return true;
 }
 if(p==='/api/guild-hub/register'&&m==='POST'){
  checkOrigin(req);const user=await requireCapability(req,'community:create');
  const body=await parseJSON(req,12000);
  const tag=String(body?.tag||'').toUpperCase(),name=clean(body?.name,64),bio=clean(body?.bio,1500);
  if(!validTag(tag))fail(422,'A guild tag must contain exactly four letters.');
  if(name.length<3)fail(422,'Guild name must contain at least three characters.');
  const result=await queued(async()=>{
   const all=await guilds();
   if(all.some(g=>statusActive(g)&&g.tag===tag))fail(409,'This guild tag is already claimed or pending review.');
   if(all.some(g=>statusActive(g)&&g.ownerId===user.id))fail(409,'You already own a guild awaiting review or approved.');
   const id=randomUUID(),at=now();
   const g={id,name,tag,bio,ownerId:user.id,status:'pending',crest:defaultCrest(),icon:null,recruitmentOpen:true,
    members:[{id:user.id,name:clean(user.profile?.displayName||user.discordName,50),role:'owner',joinedAt:at}],
    applications:[],posts:[],createdAt:at,updatedAt:at,moderationReason:''};
   await saveAtomic(filename(id),g);await updateMembership(user.id,g,true);await audit('registration-requested',g,user.id);
   return g;
  });
  sendJSON(res,201,{guild:publicGuild(result,user,true)});return true;
 }
 const match=p.match(/^\/api\/guild-hub\/([0-9a-f-]{36})(?:\/([a-z-]+))?$/);
 if(!match)return false;
 const [,id,op]=match;
 if(!op&&m==='GET'){
  const viewer=await accountUser(req),g=await current(id);
  if(g.status!=='approved'&&(!viewer||!moderator(viewer)&&!member(g,viewer.id)))fail(404,'Guild not found.');
  sendJSON(res,200,{guild:publicGuild(g,viewer,true)});return true;
 }
 if(m!=='POST'&&m!=='PATCH'&&m!=='DELETE')return false;
 checkOrigin(req);const user=await requireCapability(req);
 const body=m==='DELETE'?{}:await parseJSON(req,72000);
 const result=await queued(async()=>{
  const g=await current(id),isStaff=staff(g,user.id),isOwner=g.ownerId===user.id;
  const isMod=moderator(user);
  if(op==='moderation'&&m==='PATCH'){
   if(!isMod)fail(403,'Moderator approval required.');
   const action=body.action;
   if(action==='approve'&&g.status==='pending'){
    g.status='approved';g.moderationReason='';await clearTagImpersonators(g);
   }else if(action==='reject'&&g.status==='pending'){
    g.status='rejected';g.moderationReason=clean(body.reason,300);for(const own of g.members)await updateMembership(own.id,g,false);
   }else if(action==='suspend'&&g.status==='approved'){
    g.status='suspended';g.moderationReason=clean(body.reason,300);
   }else if(action==='restore'&&g.status==='suspended'){
    const all=await guilds();if(all.some(x=>x.id!==g.id&&statusActive(x)&&x.tag===g.tag))fail(409,'Tag is claimed by another guild.');
    g.status='approved';g.moderationReason='';await clearTagImpersonators(g);
   }else if(action==='approve-icon'&&g.icon?.status==='pending'){
    g.icon={value:g.icon.pending,status:'approved'};await audit('icon-approved',g,user.id);
   }else if(action==='reject-icon'&&g.icon?.status==='pending'){
    g.icon=g.icon.value?{value:g.icon.value,status:'approved'}:null;await audit('icon-rejected',g,user.id);
   }else fail(422,'Review action is not valid for this guild.');
   await audit(action,g,user.id,clean(body.reason,300));
  }else if(!op&&m==='PATCH'){
   if(!isOwner)fail(403,'Only the guild owner can edit its page.');
   if(!['pending','approved'].includes(g.status))fail(403,'This guild is not editable.');
   if(body.name!==undefined){const name=clean(body.name,64);if(name.length<3)fail(422,'Name must contain at least three characters.');g.name=name;}
   if(body.bio!==undefined)g.bio=clean(body.bio,1500);
   if(body.crest!==undefined)g.crest=validateCrest(body.crest);
   if(typeof body.recruitmentOpen==='boolean')g.recruitmentOpen=body.recruitmentOpen;
   // Approved four-letter tags never change through an unreviewed edit.
  }else if(op==='icon'&&m==='POST'){
   if(!isOwner)fail(403,'Only the guild owner can upload the page icon.');
   if(!['pending','approved'].includes(g.status))fail(403,'Guild is not active.');
   const value=picture(body.image);
   g.icon={value:g.icon?.status==='approved'?g.icon.value:'',pending:value,status:'pending'};
   await audit('icon-submitted',g,user.id);
  }else if(op==='apply'&&m==='POST'){
   if(g.status!=='approved'||!g.recruitmentOpen)fail(403,'This guild is not accepting applications.');
   if(member(g,user.id))fail(409,'You already belong to this guild.');
   if(user.profile?.guildId)fail(409,'Leave your current guild before applying.');
   if(g.applications.some(a=>a.id===user.id&&a.status==='pending'))fail(409,'You already have a pending application.');
   if(g.applications.length>=750)g.applications=g.applications.filter(a=>a.status==='pending').slice(-250);
   g.applications.push({id:user.id,name:clean(user.profile?.displayName||user.discordName,50),note:clean(body.note,500),status:'pending',createdAt:now()});
  }else if(op==='applications'&&m==='PATCH'){
   if(!isStaff)fail(403,'Guild staff only.');
   const a=g.applications.find(x=>x.id===body.userId&&x.status==='pending');
   if(!a)fail(404,'Pending application not found.');
   if(!['accept','decline'].includes(body.action))fail(422,'Select accept or decline.');
   if(body.action==='accept'){
    const account=await readJSON(userfile(a.id));
    if(!account||account.suspended||account.profile?.guildId)fail(409,'Player unavailable or already belongs to a guild.');
    if(member(g,a.id))fail(409,'Player already joined.');
    g.members.push({id:a.id,name:a.name,role:'member',joinedAt:now()});
    await updateMembership(a.id,g,true);
   }
   a.status=body.action==='accept'?'accepted':'declined';a.reviewedAt=now();a.reviewedBy=user.id;
  }else if(op==='members'&&m==='PATCH'){
   const target=String(body.userId||''),record=g.members.find(x=>x.id===target);
   if(!record)fail(404,'Guild member not found.');
   if(body.action==='leave'){
    if(target!==user.id)fail(403,'You can only leave your own guild.');
    if(record.role==='owner')fail(409,'Transfer ownership before leaving.');
    g.members=g.members.filter(x=>x.id!==target);await updateMembership(target,g,false);
   }else if(body.action==='remove'){
    if(!isStaff||target===g.ownerId||(!isOwner&&record.role==='officer'))fail(403,'You cannot remove this member.');
    g.members=g.members.filter(x=>x.id!==target);await updateMembership(target,g,false);
   }else if(body.action==='officer'||body.action==='member'){
    if(!isOwner||target===g.ownerId)fail(403,'Only the owner can assign guild officers.');
    record.role=body.action;
   }else if(body.action==='transfer'){
    if(!isOwner||target===g.ownerId)fail(403,'Only the owner may transfer ownership.');
    const previous=g.members.find(x=>x.id===g.ownerId);previous.role='officer';record.role='owner';g.ownerId=target;
   }else fail(422,'Invalid membership action.');
  }else if(op==='posts'&&m==='POST'){
   if(g.status!=='approved'||!member(g,user.id))fail(403,'Join this guild to post.');
   const kind=body.kind==='announcement'?'announcement':'discussion';
   if(kind==='announcement'&&!isStaff)fail(403,'Only guild staff may post announcements.');
   const text=clean(body.text,1800),title=clean(body.title,100);
   if(text.length<2||kind==='announcement'&&title.length<3)fail(422,'Add a useful message and announcement title.');
   if(g.posts.filter(x=>x.authorId===user.id&&Date.now()-Date.parse(x.createdAt)<3600000).length>=15)fail(429,'Guild posting limit reached. Try later.');
   g.posts.push({id:randomUUID(),authorId:user.id,authorName:clean(user.profile?.displayName||user.discordName,50),kind,title,text,createdAt:now()});
   if(g.posts.length>250)g.posts=g.posts.slice(-250);
  }else if(op==='posts'&&m==='DELETE'){
   const post=g.posts.find(x=>x.id===url.searchParams.get('postId'));
   if(!post)fail(404,'Message not found.');
   if(post.authorId!==user.id&&!isStaff&&!isMod)fail(403,'Cannot delete another player message.');
   g.posts=g.posts.filter(x=>x.id!==post.id);
   await audit('post-deleted',g,user.id,post.id);
  }else fail(404,'Guild action not found.');
  g.updatedAt=now();await saveAtomic(filename(g.id),g);
  return g;
 });
 sendJSON(res,200,{guild:publicGuild(result,user,true)});return true;
}
export async function safeGuildHubRequest(req,res,url){
 try{return await handleGuildHubRequest(req,res,url);}
 catch(e){if(e.status>=400&&e.status<500)sendJSON(res,e.status,{error:e.message});else{console.error('Guild hub error:',e);sendJSON(res,503,{error:'Guild service temporarily unavailable.'});}return true;}
}
