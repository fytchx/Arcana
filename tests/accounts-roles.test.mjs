import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {can,rolesOf,mayChangeRoles,publicRoles} from '../src/account-policy.js';

test('Guest access stays unrestricted; specialized roles do not inherit unrelated privileges',()=>{
 assert.ok(can(null,'read'));assert.ok(can(null,'tools:use'));assert.ok(can(null,'tools:share'));
 assert.equal(can(null,'community:create'),false);assert.equal(can(null,'wiki:publish'),false);
 const member={roles:[]};
 assert.ok(can(member,'community:create'));assert.ok(can(member,'listings:create'));
 assert.equal(can(member,'wiki:publish'),false);assert.equal(can(member,'community:hide'),false);
 const editor={roles:['wiki-editor']};
 assert.ok(can(editor,'wiki:publish'));assert.equal(can(editor,'community:hide'),false);
 const mod={roles:['moderator']};
 assert.ok(can(mod,'community:hide'));assert.equal(can(mod,'community:delete'),false);
 const dev={roles:['developer']};
 assert.equal(can(dev,'wiki:publish'),false);assert.equal(can(dev,'roles:manage'),false);
 const admin={roles:['admin']};
 assert.ok(can(admin,'community:delete'));assert.ok(can(admin,'wiki:publish'));
 const creator={roles:[],isCreator:true};
 assert.ok(can(creator,'roles:privileged'));
 assert.deepEqual(rolesOf({roles:['moderator','wiki-editor','moderator','creator']}),['member','wiki-editor','moderator']);
 assert.equal(mayChangeRoles(admin,member,['admin']),false);
 assert.equal(mayChangeRoles(admin,member,['moderator','wiki-editor']),true);
 assert.equal(mayChangeRoles(creator,member,['admin']),true);
 assert.equal(mayChangeRoles(creator,{roles:[],isCreator:true},[]),false);
 assert.equal(publicRoles(member)[0].label,'Arcana Member');
});
test('Account and community routes enforce identity and hide vs permanent delete',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'arcana-accounts-'));
 const old={dir:process.env.ARCANA_ACCOUNT_DATA_DIR,base:process.env.ARCANA_AUTH_BASE_URL,
 id:process.env.ARCANA_DISCORD_CLIENT_ID,secret:process.env.ARCANA_DISCORD_CLIENT_SECRET,creator:process.env.ARCANA_CREATOR_DISCORD_ID};
 process.env.ARCANA_ACCOUNT_DATA_DIR=directory;
 process.env.ARCANA_DISCORD_CLIENT_ID='123456789123456789';
 process.env.ARCANA_DISCORD_CLIENT_SECRET='test-only-secret';
 process.env.ARCANA_CREATOR_DISCORD_ID='222222222222222222';
 const {saveAtomic,safeAccountRequest}=await import('../src/account-server.mjs');
 const {safeCommunityRequest}=await import('../src/community-server.mjs');
 const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/community/')){await safeCommunityRequest(req,res,url);return;}
  if(await safeAccountRequest(req,res,url))return;
  res.writeHead(404);res.end();
 });
 const id1=randomUUID(),id2=randomUUID(),id3=randomUUID();
 const users=[
  {id:id1,discordId:'111111111111111111',roles:[],profile:{displayName:'Test player'},discordName:'Test'},
  {id:id2,discordId:'333333333333333333',roles:['moderator'],profile:{displayName:'Helpful mod'},discordName:'Mod'},
  {id:id3,discordId:'222222222222222222',roles:[],profile:{displayName:'Creator test'},discordName:'Creator'}
 ];
 const tokens=['A'.repeat(42),'B'.repeat(42),'C'.repeat(42)];
 try{
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const port=server.address().port,base='http://127.0.0.1:'+port;
  process.env.ARCANA_AUTH_BASE_URL='http://localhost:'+port;
  for(let i=0;i<users.length;i++){
   await saveAtomic(join(directory,'users',users[i].id+'.json'),users[i]);
   const hash=createHash('sha256').update(tokens[i]).digest('hex');
   await saveAtomic(join(directory,'sessions',hash+'.json'),{id:users[i].id,expires:Date.now()+600000});
  }
  const headers=(i,method='GET')=>({'cookie':'arcana-session='+tokens[i],...(method!=='GET'?{'origin':'http://localhost:'+port,'content-type':'application/json'}:{})});
  let response=await fetch(base+'/api/account/me');
  assert.equal((await response.json()).user,null);
  response=await fetch(base+'/api/account/me',{headers:headers(0)});
  const member=(await response.json()).user;
  assert.equal(member.permissions.createCommunity,true);
  assert.equal(member.permissions.publishWiki,false);
  assert.equal(member.roles[0].label,'Arcana Member');
  const profile=await fetch(base+'/api/account/profile',{method:'PATCH',headers:headers(0,'PATCH'),body:JSON.stringify({profile:{displayName:'Player Example',guild:'PDX',favoriteClass:'Warrior'}})});
  assert.equal(profile.status,200);assert.equal((await profile.json()).profile.guild,'PDX');
  response=await fetch(base+'/api/profiles/'+id1);
  const publicCard=(await response.json()).profile;
  assert.equal(publicCard.favoriteClass,'Warrior');
  assert.equal(Object.hasOwn(publicCard,'discordId'),false);
  response=await fetch(base+'/api/community/posts',{method:'POST',headers:{'origin':'http://localhost:'+port,'content-type':'application/json'},body:'{}'});
  assert.equal(response.status,401);
  const submission={kind:'guide',title:'Warrior farming route',summary:'A practical example of a player-tested route.',body:'Choose a monster you can kill quickly. Compare actual kill speeds and adjust your route if your equipment changes. This is a player-created example.'};
  response=await fetch(base+'/api/community/posts',{method:'POST',headers:headers(0,'POST'),body:JSON.stringify(submission)});
  assert.equal(response.status,201);
  const post=(await response.json()).post;assert.equal(post.status,'public');
  response=await fetch(base+'/api/community/posts/'+post.id+'/visibility',{method:'PATCH',headers:headers(0,'PATCH'),body:JSON.stringify({status:'hidden'})});
  assert.equal(response.status,403,'Members cannot hide posts');
  response=await fetch(base+'/api/community/posts/'+post.id+'/visibility',{method:'PATCH',headers:headers(1,'PATCH'),body:JSON.stringify({status:'hidden',reason:'Needs review'})});
  assert.equal(response.status,200);
  response=await fetch(base+'/api/community/posts');
  assert.equal((await response.json()).posts.length,0,'Hidden posts are not public');
  response=await fetch(base+'/api/community/posts/'+post.id,{method:'DELETE',headers:headers(1,'DELETE')});
  assert.equal(response.status,403,'Moderators may not delete posts');
  response=await fetch(base+'/api/admin/roles/'+id1,{method:'PATCH',headers:headers(2,'PATCH'),body:JSON.stringify({roles:['wiki-editor']})});
  assert.equal(response.status,200);
  response=await fetch(base+'/api/account/me',{headers:headers(0)});
  assert.equal((await response.json()).user.permissions.publishWiki,true,'Roles refresh on the next request');
  response=await fetch(base+'/api/community/posts/'+post.id,{method:'DELETE',headers:headers(2,'DELETE')});
  assert.equal(response.status,200);
  assert.equal((await (await fetch(base+'/api/community/posts?includeHidden=true',{headers:headers(2)})).json()).posts.length,0);
  const log=await readFile(join(directory,'community','moderation.jsonl'),'utf8');
  assert.match(log,/"action":"hide"/);assert.match(log,/"action":"delete"/);
  response=await fetch(base+'/api/account/callback?code=anything');
  assert.equal(response.status,200); // Fetch follows redirect to '/', the test server responds 404 unless redirected URI intercepted.
 }finally{
  server.close();await rm(directory,{recursive:true,force:true});
  for(const [k,v] of Object.entries({ARCANA_ACCOUNT_DATA_DIR:old.dir,ARCANA_AUTH_BASE_URL:old.base,
   ARCANA_DISCORD_CLIENT_ID:old.id,ARCANA_DISCORD_CLIENT_SECRET:old.secret,ARCANA_CREATOR_DISCORD_ID:old.creator})){
   if(v===undefined)delete process.env[k];else process.env[k]=v;
  }
 }
});
