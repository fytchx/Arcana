import {readdir,readFile,writeFile,unlink,mkdir,appendFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {accountUser,requireCapability,dataRoot,readJSON,saveAtomic,queued,parseJSON,checkOrigin,sendJSON,publicProfile} from './account-server.mjs';
import {can} from './account-policy.js';
const UUID=/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/;
const BASE=()=>resolve(dataRoot(),'community','posts');
const file=id=>resolve(BASE(),id+'.json');
const ASSETS=()=>resolve(dataRoot(),'community','assets');
const assetMeta=id=>resolve(ASSETS(),id+'.json');
// Light card facts for build lists (class, build type, level), read from a new-app share code.
const CARD_STANCES=new Set(['bulwark','aggressive','beastmaster','harmony']);
export function buildCard(build){
 const code=build?.arcanaNext?.code;
 if(typeof code!=='string'||!code||code.length>20000)return null;
 try{
  const o=JSON.parse(Buffer.from(code.replace(/-/g,'+').replace(/_/g,'/'),'base64').toString('utf8'));
  return {cls:Number.isInteger(o.c)&&o.c>=1&&o.c<=5?o.c:null,stance:CARD_STANCES.has(o.s)?o.s:null,level:Number.isInteger(o.l)?Math.max(1,Math.min(1000,o.l)):null};
 }catch{return null}
}
const clean=(value,n)=>String(value||'').trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,n);
const failure=(status,message)=>Object.assign(Error(message),{status});
const revision=post=>createHash('sha256').update(JSON.stringify(post)).digest('hex');
const publicPost=post=>({id:post.id,kind:post.kind,title:post.title,summary:post.summary,
 body:post.body,build:post.kind==='build'?post.build:null,guideClasses:Array.isArray(post.guideClasses)?post.guideClasses:[],guideTopics:Array.isArray(post.guideTopics)?post.guideTopics:[],trimColor:post.trimColor||null,customIcon:post.customIcon||null,guideImages:Array.isArray(post.guideImages)?post.guideImages:[],authorId:post.authorId,createdAt:post.createdAt,
 updatedAt:post.updatedAt,status:post.status,revision:revision(post)});
async function recentPosts(){
 try{const files=(await readdir(BASE())).filter(x=>UUID.test(x.slice(0,-5))&&x.endsWith('.json')).slice(0,2500);
  return (await Promise.all(files.map(async name=>readJSON(resolve(BASE(),name))))).filter(Boolean);
 }catch(e){if(e.code==='ENOENT')return [];throw e;}
}
function inputPost(payload){
 const kind=payload?.kind;
 if(!['guide','build'].includes(kind))throw failure(422,'Choose a community guide or build.');
 const title=clean(payload?.title,110),summary=clean(payload?.summary,300),body=String(payload?.body||'').trim().slice(0,12000);
 if(title.length<6||summary.length<20)throw failure(422,'Add a descriptive title and summary.');
 if(kind==='guide'&&body.length<80)throw failure(422,'A community guide needs at least 80 characters of useful content.');
 let build=null;
 if(kind==='build'){
  if(!payload.build||typeof payload.build!=='object'||Array.isArray(payload.build))throw failure(422,'Open Build Studio and save a build before publishing.');
  const serialized=JSON.stringify(payload.build);
  if(serialized.length>70000)throw failure(413,'Build snapshot is too large.');
  build=JSON.parse(serialized);
  if(!build.equipment||typeof build.equipment!=='object'||Array.isArray(build.equipment)||!Array.isArray(build.runes))throw failure(422,'Invalid Build Studio snapshot.');
 }
 const classes=kind==='guide'&&Array.isArray(payload.guideClasses)?[...new Set(payload.guideClasses.filter(x=>['warrior','rogue','mage','archer','druid'].includes(x)))].slice(0,5):[];
 const topics=kind==='guide'&&Array.isArray(payload.guideTopics)?[...new Set(payload.guideTopics.filter(x=>['pets','runes','gear','progression','farming','systems','misc'].includes(x)))].slice(0,7):[];
 const trimColor=kind==='guide'&&typeof payload.trimColor==='string'&&/^#[0-9a-f]{6}$/i.test(payload.trimColor)?payload.trimColor:null;
 const customIcon=kind==='guide'&&typeof payload.customIcon==='string'&&UUID.test(payload.customIcon)?payload.customIcon:null;
 const guideImages=kind==='guide'&&Array.isArray(payload.guideImages)?[...new Set(payload.guideImages.filter(x=>typeof x==='string'&&UUID.test(x)))].slice(0,12):[];
 return {kind,title,summary,body,build,guideClasses:classes,guideTopics:topics,trimColor,customIcon,guideImages};
}
async function verifyGuideAssets(post,authorId){
 for(const id of [...(post.customIcon?[post.customIcon]:[]),...(post.guideImages||[])]){
  const meta=await readJSON(assetMeta(id));
  if(!meta||meta.authorId!==authorId)throw failure(422,'An uploaded guide image is missing or belongs to another account.');
 }
}
function imageType(buf){
 if(buf.length>=8&&buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return ['image/png','.png'];
 if(buf.length>=3&&buf[0]===255&&buf[1]===216&&buf[2]===255)return ['image/jpeg','.jpg'];
 if(buf.length>=12&&buf.toString('ascii',0,4)==='RIFF'&&buf.toString('ascii',8,12)==='WEBP')return ['image/webp','.webp'];
 return null;
}
async function audit(event){
 const log=resolve(dataRoot(),'community','moderation.jsonl');
 await mkdir(resolve(dataRoot(),'community'),{recursive:true});
 await appendFile(log,JSON.stringify(event)+'\n',{encoding:'utf8',mode:0o600});
}
export async function handleCommunityRequest(req,res,url){
 const path=url.pathname,method=req.method;
 if(path==='/api/community/assets'&&method==='POST'){
  checkOrigin(req);const member=await requireCapability(req,'community:create');
  const input=await parseJSON(req,7_000_000);
  if(!['icon','image'].includes(input?.purpose)||typeof input.data!=='string'||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(input.data))throw failure(422,'Choose a PNG, JPG or WebP image.');
  const raw=Buffer.from(input.data.slice(input.data.indexOf(',')+1),'base64'),kind=imageType(raw),limit=input.purpose==='icon'?1_500_000:5_000_000;
  if(!kind||raw.length>limit)throw failure(413,input.purpose==='icon'?'Use an image under 1.5 MB.':'Use a screenshot under 5 MB.');
  const id=randomUUID();await mkdir(ASSETS(),{recursive:true});
  await writeFile(resolve(ASSETS(),id+kind[1]),raw,{flag:'wx',mode:0o644});
  await saveAtomic(assetMeta(id),{id,authorId:member.id,mime:kind[0],extension:kind[1],size:raw.length,createdAt:new Date().toISOString()});
  sendJSON(res,201,{assetId:id,purpose:input.purpose});return true;
 }
 const asset=path.match(/^\/api\/community\/assets\/([0-9a-f-]{36})$/);
 if(asset&&method==='GET'){
  const meta=await readJSON(assetMeta(asset[1]));if(!meta)throw failure(404,'Image not found.');
  const viewer=await accountUser(req),refs=(await recentPosts()).filter(p=>p.status==='public'&&(p.customIcon===asset[1]||(p.guideImages||[]).includes(asset[1])));
  if(!refs.length&&viewer?.id!==meta.authorId)throw failure(404,'Image not found.');
  const bytes=await readFile(resolve(ASSETS(),asset[1]+meta.extension));
  res.writeHead(200,{'Content-Type':meta.mime,'Content-Length':bytes.length,'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'});res.end(bytes);return true;
 }
 if(path==='/api/community/mine'&&method==='GET'){
  const me=await requireCapability(req);
  const posts=(await recentPosts()).filter(p=>p.authorId===me.id).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  sendJSON(res,200,{posts:posts.slice(0,100).map(p=>{const {build,body,...light}=publicPost(p);return {...light,excerpt:clean(body,170)};}),total:posts.length});return true;
 }
 if(path==='/api/community/posts'&&method==='GET'){
  const viewer=await accountUser(req),canModerate=can(viewer,'community:hide');
  const showHidden=url.searchParams.get('includeHidden')==='true'&&canModerate;
  let posts=(await recentPosts()).filter(p=>(p.status==='public'||showHidden)&&(!url.searchParams.get('kind')||p.kind===url.searchParams.get('kind'))&&(!url.searchParams.get('authorId')||p.authorId===url.searchParams.get('authorId')));
  posts.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const profiles=new Map();
  const page=await Promise.all(posts.slice(0,100).map(async p=>{
   const {build,body,...light}=publicPost(p);
   if(!profiles.has(p.authorId)){
    const account=await readJSON(resolve(dataRoot(),'users',p.authorId+'.json'));
    profiles.set(p.authorId,account&&!account.suspended?publicProfile(account).displayName:'Arcana player');
   }
   return {...light,author:profiles.get(p.authorId),excerpt:clean(body,170),card:buildCard(build)};
  }));
  sendJSON(res,200,{posts:page,total:posts.length});return true;
 }
 if(path==='/api/community/posts'&&method==='POST'){
  checkOrigin(req);const member=await requireCapability(req,'community:create');
  const input=inputPost(await parseJSON(req,7_000_000));
  await verifyGuideAssets(input,member.id);
  const post=await queued(async()=>{
   const all=await recentPosts();
   if(all.filter(p=>p.authorId===member.id&&Date.now()-Date.parse(p.createdAt)<86400000).length>=10)throw failure(429,'Daily publication limit reached.');
   const now=new Date().toISOString();
   const item={...input,id:randomUUID(),authorId:member.id,status:'public',createdAt:now,updatedAt:now,hiddenBy:null,hiddenReason:''};
   await saveAtomic(file(item.id),item);return item;
  });
  sendJSON(res,201,{post:publicPost(post)});return true;
 }
 const exact=path.match(/^\/api\/community\/posts\/([0-9a-f-]{36})$/);
 if(exact&&method==='GET'){
  const post=await readJSON(file(exact[1]));if(!post)throw failure(404,'Post not found.');
  const viewer=await accountUser(req);
  if(post.status!=='public'&&!can(viewer,'community:hide')&&viewer?.id!==post.authorId)throw failure(404,'Post not found.');
  let profile=null;
  const publicId=post.authorId;
  const author=await readJSON(resolve(dataRoot(),'users',publicId+'.json'));
  if(author&&!author.suspended)profile=publicProfile(author);
  sendJSON(res,200,{post:publicPost(post),author:profile});return true;
 }
 if(exact&&method==='PATCH'){
  checkOrigin(req);const user=await requireCapability(req);
  const input=await parseJSON(req,7_000_000);
  const updated=await queued(async()=>{
   const post=await readJSON(file(exact[1]));
   if(!post)throw failure(404,'Post not found.');
   if(post.authorId!==user.id)throw failure(403,'Only the author can edit this post.');
   if(post.status!=='public')throw failure(403,'Hidden content cannot be edited until moderation clears it.');
   if(revision(post)!==input.baseRevision)throw failure(409,'This post has changed; reload before editing.');
   const cleanInput=inputPost({...post,...input,kind:post.kind});await verifyGuideAssets(cleanInput,user.id);Object.assign(post,cleanInput);
   post.updatedAt=new Date().toISOString();await saveAtomic(file(post.id),post);return post;
  });
  sendJSON(res,200,{post:publicPost(updated)});return true;
 }
 const archive=path.match(/^\/api\/community\/posts\/([0-9a-f-]{36})\/archive$/);
 if(archive&&method==='PATCH'){
  checkOrigin(req);const author=await requireCapability(req);
  const input=await parseJSON(req);
  if(typeof input.archived!=='boolean')throw failure(422,'Choose whether to archive the contribution.');
  const post=await queued(async()=>{
   const item=await readJSON(file(archive[1]));
   if(!item)throw failure(404,'Contribution not found.');
   if(item.authorId!==author.id)throw failure(403,'Only the author can unpublish their content.');
   if(!['public','archived'].includes(item.status))throw failure(403,'A moderator has restricted this contribution.');
   item.status=input.archived?'archived':'public';
   item.updatedAt=new Date().toISOString();
   await saveAtomic(file(item.id),item);return item;
  });
  sendJSON(res,200,{post:publicPost(post)});return true;
 }
 const visibility=path.match(/^\/api\/community\/posts\/([0-9a-f-]{36})\/visibility$/);
 if(visibility&&method==='PATCH'){
  checkOrigin(req);const mod=await requireCapability(req,'community:hide');
  const input=await parseJSON(req);
  if(!['public','hidden'].includes(input.status))throw failure(422,'Invalid visibility.');
  const changed=await queued(async()=>{
   const post=await readJSON(file(visibility[1]));if(!post)throw failure(404,'Post not found.');
   post.status=input.status;post.hiddenBy=input.status==='hidden'?mod.id:null;
   post.hiddenReason=input.status==='hidden'?clean(input.reason,300):'';
   post.updatedAt=new Date().toISOString();await saveAtomic(file(post.id),post);
   await audit({action:input.status==='hidden'?'hide':'unhide',actor:mod.id,postId:post.id,at:post.updatedAt,reason:post.hiddenReason});
   return post;
  });
  sendJSON(res,200,{post:publicPost(changed)});return true;
 }
 if(exact&&method==='DELETE'){
  checkOrigin(req);const admin=await requireCapability(req,'community:delete');
  await queued(async()=>{
   const post=await readJSON(file(exact[1]));if(!post)throw failure(404,'Post not found.');
   // Log successful moderation separately from the public post itself.
   await audit({action:'delete',actor:admin.id,postId:post.id,at:new Date().toISOString(),kind:post.kind,title:post.title});
   await unlink(file(post.id));
  });
  sendJSON(res,200,{ok:true});return true;
 }
 return false;
}
export async function safeCommunityRequest(req,res,url){
 try{return await handleCommunityRequest(req,res,url);}
 catch(e){if(e.status>=400&&e.status<500)sendJSON(res,e.status,{error:e.message});else{console.error('Arcana community storage:',e);sendJSON(res,503,{error:'Community content is temporarily unavailable.'});}return true;}
}
