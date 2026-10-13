import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {mayChangeRoles,rolesOf} from '../src/account-policy.js';

test('Real beta enrollment, public player card, editable community posts and cloud saves persist',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'arcana-beta-membership-'));
 const names=['ARCANA_ACCOUNT_DATA_DIR','ARCANA_WIKI_DATA_DIR','ARCANA_AUTH_BASE_URL','ARCANA_DISCORD_CLIENT_ID',
 'ARCANA_DISCORD_CLIENT_SECRET','ARCANA_CREATOR_DISCORD_ID','ARCANA_BETA_COHORT_OPEN'];
 const env=Object.fromEntries(names.map(k=>[k,process.env[k]])),originalFetch=globalThis.fetch;
 const discordId='777777777777777777';
 process.env.ARCANA_ACCOUNT_DATA_DIR=dir;
 process.env.ARCANA_WIKI_DATA_DIR=join(dir,'wiki');
 process.env.ARCANA_DISCORD_CLIENT_ID='123456789012345678';
 process.env.ARCANA_DISCORD_CLIENT_SECRET='test-only-discord-secret';
 process.env.ARCANA_CREATOR_DISCORD_ID='999999999999999999';
 process.env.ARCANA_BETA_COHORT_OPEN='1';
 const {safeAccountRequest}=await import('../src/account-server.mjs');
 const {safeAccountBuildRequest}=await import('../src/account-builds.mjs');
 const {safeCommunityRequest}=await import('../src/community-server.mjs');
 const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/account/builds')){await safeAccountBuildRequest(req,res,url);return;}
  if(url.pathname.startsWith('/api/community/')){await safeCommunityRequest(req,res,url);return;}
  if(await safeAccountRequest(req,res,url))return;
  res.writeHead(404);res.end();
 });
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const port=server.address().port,root='http://127.0.0.1:'+port,origin='http://localhost:'+port;
 process.env.ARCANA_AUTH_BASE_URL=origin;
 globalThis.fetch=(input,init)=>String(input).includes('discord.com/api/v10/oauth2/token')?
  Promise.resolve(new Response(JSON.stringify({access_token:'test-identity-only'}),{status:200,headers:{'content-type':'application/json'}})):
  String(input).includes('discord.com/api/v10/users/@me')?
  Promise.resolve(new Response(JSON.stringify({id:discordId,username:'Arcana Tester',global_name:'Arcana Tester'}),{status:200,headers:{'content-type':'application/json'}})):
  originalFetch(input,init);
 const cookieFor=(r,name)=>{
  const cookies=r.headers.getSetCookie?r.headers.getSetCookie():[r.headers.get('set-cookie')||''];
  const line=cookies.find(x=>x.startsWith(name+'='));
  assert.ok(line,'Missing cookie '+name);
  return line.split(';')[0];
 };
 async function logIn(){
  const login=await fetch(root+'/api/account/login',{redirect:'manual'});
  assert.equal(login.status,303);
  const state=new URL(login.headers.get('location')).searchParams.get('state');
  const oauth=cookieFor(login,'arcana-oauth');
  const callback=await fetch(root+'/api/account/callback?code=qa-code&state='+state,{headers:{cookie:oauth},redirect:'manual'});
  assert.equal(callback.status,303);
  return cookieFor(callback,'arcana-session');
 }
 const mutation=(session)=>({cookie:session,origin,'content-type':'application/json'});
 const sample={title:'Beta Warrior equipment test',className:'Warrior',equipment:{weapon:'game:item:broken-sword'},
   runes:[],runeBoard:[],skills:[],pets:[],monsterLevel:24,summary:'For current game mechanics.',notes:''};
 try{
  let session=await logIn();
  let result=await fetch(root+'/api/account/me',{headers:{cookie:session}}),identity=await result.json();
  assert.equal(identity.enabled,true);assert.equal(identity.betaEnrollmentOpen,true);
  assert.equal(identity.user.roles.some(x=>x.id==='beta-tester'),true);
  const id=identity.user.id;
  assert.ok(identity.user.betaTesterSince);
  assert.equal(mayChangeRoles({roles:['admin']},{roles:[],betaTesterSince:identity.user.betaTesterSince},['beta-tester']),false);
  assert.deepEqual(rolesOf({roles:[],betaTesterSince:identity.user.betaTesterSince}),['member','beta-tester']);
  const avatar='data:image/png;base64,'+Buffer.from([137,80,78,71,13,10,26,10,...new Array(24).fill(0)]).toString('base64');
  result=await fetch(root+'/api/account/profile',{method:'PATCH',headers:mutation(session),
   body:JSON.stringify({profile:{displayName:'Beta Hero',guild:'PDX',favoriteClass:'Druid',avatarDataUrl:avatar}})});
  assert.equal(result.status,200);
  result=await fetch(root+'/api/profiles/'+id);
  const card=(await result.json()).profile;
  assert.equal(card.displayName,'Beta Hero');assert.equal(card.avatarDataUrl,avatar);
  assert.ok(card.roles.some(x=>x.label==='Founding Beta Tester'));
  assert.equal(Object.hasOwn(card,'discordId'),false);
  result=await fetch(root+'/api/account/builds',{method:'POST',headers:mutation(session),body:JSON.stringify({build:sample})});
  assert.equal(result.status,201);
  const saved=(await result.json()).build;
  assert.ok(saved.id);
  result=await fetch(root+'/api/account/builds',{headers:{cookie:session}});
  assert.equal((await result.json()).builds.length,1);
  result=await fetch(root+'/api/account/builds/'+saved.id,{headers:{cookie:session}});
  assert.equal((await result.json()).build.equipment.weapon,sample.equipment.weapon);
  result=await fetch(root+'/api/account/builds/'+saved.id,{method:'PUT',headers:mutation(session),
   body:JSON.stringify({build:{...sample,title:'Updated Warrior'},baseUpdatedAt:'stale'})});
  assert.equal(result.status,409,'Concurrent overwrites must be rejected');
  result=await fetch(root+'/api/account/builds/'+saved.id,{method:'PUT',headers:mutation(session),
   body:JSON.stringify({build:{...sample,title:'Updated Warrior'},baseUpdatedAt:saved.updatedAt})});
  assert.equal(result.status,200);
  result=await fetch(root+'/api/account/builds/'+saved.id);
  assert.equal(result.status,401,'Other users cannot read private account builds');
  result=await fetch(root+'/api/community/posts',{method:'POST',headers:mutation(session),body:JSON.stringify({
   kind:'guide',title:'Tester farming guide',summary:'This is a practical farming guide created during the beta.',
   body:'Choose a monster that you can kill quickly, compare your attack timings, and improve your equipment until you can progress efficiently. Remember to save a second farming loadout.'})});
  assert.equal(result.status,201);
  const post=(await result.json()).post;
  result=await fetch(root+'/api/community/posts/'+post.id,{method:'PATCH',headers:mutation(session),
   body:JSON.stringify({title:'Updated tester farming guide',summary:post.summary,body:post.body+' Follow this guide carefully.',baseRevision:post.revision})});
  assert.equal(result.status,200,'Authors must be able to edit their contributions');
  result=await fetch(root+'/api/community/mine',{headers:{cookie:session}});
  assert.equal((await result.json()).posts.length,1);
  result=await fetch(root+'/api/community/posts?authorId='+id);
  assert.equal((await result.json()).posts[0].title,'Updated tester farming guide');
  const publicFile=JSON.parse(await readFile(join(dir,'users',id+'.json'),'utf8'));
  assert.ok(publicFile.betaTesterSince,'Beta role must be stored on disk');
  process.env.ARCANA_BETA_COHORT_OPEN='0';
  result=await fetch(root+'/api/account/logout',{method:'POST',headers:mutation(session)});
  assert.equal(result.status,200);
  session=await logIn();
  result=await fetch(root+'/api/account/me',{headers:{cookie:session}});identity=await result.json();
  assert.equal(identity.user.id,id,'Real accounts are linked to verified Discord identity');
  assert.equal(identity.betaEnrollmentOpen,false);
  assert.ok(identity.user.roles.some(x=>x.id==='beta-tester'),'Beta role survives enrollment closing and sign-in');
  result=await fetch(root+'/api/account/builds',{headers:{cookie:session}});
  assert.equal((await result.json()).builds[0].title,'Updated Warrior','Cloud builds survive new browser sessions');
 }finally{
  globalThis.fetch=originalFetch;
  server.close();await rm(dir,{recursive:true,force:true});
  for(const name of names){if(env[name]===undefined)delete process.env[name];else process.env[name]=env[name];}
 }
});
