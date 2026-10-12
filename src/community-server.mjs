import {readdir,readFile,unlink,mkdir,appendFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {accountUser,requireCapability,dataRoot,readJSON,saveAtomic,queued,parseJSON,checkOrigin,sendJSON,publicProfile} from './account-server.mjs';
import {can} from './account-policy.js';
const UUID=/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/;
const BASE=()=>resolve(dataRoot(),'community','posts');
const file=id=>resolve(BASE(),id+'.json');
const clean=(value,n)=>String(value||'').trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,n);
const failure=(status,message)=>Object.assign(Error(message),{status});
const revision=post=>createHash('sha256').update(JSON.stringify(post)).digest('hex');
const publicPost=post=>({id:post.id,kind:post.kind,title:post.title,summary:post.summary,
 body:post.body,build:post.kind==='build'?post.build:null,authorId:post.authorId,createdAt:post.createdAt,
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
 return {kind,title,summary,body,build};
}
async function audit(event){
 const log=resolve(dataRoot(),'community','moderation.jsonl');
 await mkdir(resolve(dataRoot(),'community'),{recursive:true});
 await appendFile(log,JSON.stringify(event)+'\n',{encoding:'utf8',mode:0o600});
}
export async function handleCommunityRequest(req,res,url){
 const path=url.pathname,method=req.method;
 if(path==='/api/community/posts'&&method==='GET'){
  const viewer=await accountUser(req),canModerate=can(viewer,'community:hide');
  const showHidden=url.searchParams.get('includeHidden')==='true'&&canModerate;
  let posts=(await recentPosts()).filter(p=>(p.status==='public'||showHidden)&&(!url.searchParams.get('kind')||p.kind===url.searchParams.get('kind')));
  posts.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const page=posts.slice(0,100).map(p=>{const {build,body,...light}=publicPost(p);return {...light,excerpt:clean(body,170)};});
  sendJSON(res,200,{posts:page,total:posts.length});return true;
 }
 if(path==='/api/community/posts'&&method==='POST'){
  checkOrigin(req);const member=await requireCapability(req,'community:create');
  const input=inputPost(await parseJSON(req,90000));
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
  const input=await parseJSON(req,90000);
  const updated=await queued(async()=>{
   const post=await readJSON(file(exact[1]));
   if(!post)throw failure(404,'Post not found.');
   if(post.authorId!==user.id)throw failure(403,'Only the author can edit this post.');
   if(post.status!=='public')throw failure(403,'Hidden content cannot be edited until moderation clears it.');
   if(revision(post)!==input.baseRevision)throw failure(409,'This post has changed; reload before editing.');
   Object.assign(post,inputPost({...post,...input,kind:post.kind}));
   post.updatedAt=new Date().toISOString();await saveAtomic(file(post.id),post);return post;
  });
  sendJSON(res,200,{post:publicPost(updated)});return true;
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
