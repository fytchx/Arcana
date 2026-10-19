import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {safeGuildHubRequest,validTag} from '../src/guild-hub-server.mjs';
import {saveAtomic,publicProfile} from '../src/account-server.mjs';
import {guildBadge,guildTagBadge} from '../src/guild-badge.js';

test('four-letter guild tags render safely with custom colors but no crest',()=>{
 assert.ok(validTag('PDXO'));assert.ok(!validTag('ABC'));assert.ok(!validTag('1ABC'));assert.ok(!validTag('ABCDE'));
 assert.equal(guildBadge({guildTag:'ABC!'}),'');
 const registry=[{id:'guild-a',status:'approved',tag:'PDXO',tagStyle:{color:'#32C9DF',finish:'glow'}}];
 const official=guildBadge({guildTag:'PDXO',guildId:'guild-a'},registry);
 assert.match(official,/isOfficial finish-glow/);
 assert.match(official,/--guild-tag-color:#32C9DF/);
 assert.doesNotMatch(official,/<svg|<img/);
 assert.match(guildTagBadge(registry[0]),/\[PDXO\]/);
 assert.match(guildBadge({guildTag:'PDXO',guildId:'wrong'},registry),/isUnregistered/);
 assert.doesNotMatch(guildBadge({guildTag:'PDXO',guildId:'wrong'},registry),/--guild-tag-color/);
});
test('registered badges require matching authenticated membership identity',()=>{
 const registry=[{id:'guild-a',status:'approved',tag:'PDXO',tagStyle:{color:'#FFC000',finish:'gradient'}}];
 assert.match(guildBadge({guildTag:'PDXO',guildId:'guild-a'},registry),/isOfficial/);
 assert.match(guildBadge({guildTag:'PDXO',guildId:'bad'},registry),/isUnregistered/);
 assert.equal(guildBadge({guildTag:'hi!'},registry),'');
});
test('moderated registration, reserved tags, fancy colors and recruitment enforce permissions',async()=>{
 const root=await mkdtemp(resolve(tmpdir(),'arcana-guild-test-'));
 const old={data:process.env.ARCANA_ACCOUNT_DATA_DIR,base:process.env.ARCANA_AUTH_BASE_URL,client:process.env.ARCANA_DISCORD_CLIENT_ID,secret:process.env.ARCANA_DISCORD_CLIENT_SECRET};
 process.env.ARCANA_ACCOUNT_DATA_DIR=root;
 process.env.ARCANA_AUTH_BASE_URL='http://localhost:3000';
 process.env.ARCANA_DISCORD_CLIENT_ID='123';
 process.env.ARCANA_DISCORD_CLIENT_SECRET='test-secret';
 const tokens=new Map(),accounts={};
 async function create(name,roles=[]){
  const id=randomUUID(),token=('test'+name).padEnd(48,'x'),discordId='1000000000000000'+Object.keys(accounts).length;
  const account={id,discordId,discordName:name,roles,profile:{displayName:name,guildTag:'',guildId:''},joinedAt:new Date().toISOString(),suspended:false};
  accounts[name]=account;tokens.set(name,token);
  await saveAtomic(resolve(root,'users',id+'.json'),account);
  await saveAtomic(resolve(root,'sessions',createHash('sha256').update(token).digest('hex')+'.json'),{id,expires:Date.now()+3600000});
  return account;
 }
 async function call(path,method='GET',payload,who=null,origin='http://localhost:3000'){
  const text=payload===undefined?'':JSON.stringify(payload);
  const req={method,headers:{...(who?{cookie:'arcana-session='+tokens.get(who)}:{}),origin,'content-type':'application/json'},async *[Symbol.asyncIterator](){yield Buffer.from(text);}};
  const res={code:0,headers:null,text:'',writeHead(code,headers){this.code=code;this.headers=headers;},end(out){this.text=out||'';}};
  const handled=await safeGuildHubRequest(req,res,new URL('http://localhost:3000'+path));
  assert.equal(handled,true);
  return {status:res.code,body:JSON.parse(res.text)};
 }
 async function profileTag(tag,who){
  const req={method:'PATCH',headers:{cookie:'arcana-session='+tokens.get(who),origin:'http://localhost:3000','content-type':'application/json'},async *[Symbol.asyncIterator](){yield Buffer.from(JSON.stringify({profile:{guildTag:tag}}));}};
  const {safeAccountRequest}=await import('../src/account-server.mjs');
  const res={code:0,text:'',writeHead(code){this.code=code;},end(t){this.text=t;}};
  await safeAccountRequest(req,res,new URL('http://localhost:3000/api/account/profile'));
  return {status:res.code,body:JSON.parse(res.text)};
 }
 try{
  const owner=await create('owner'),other=await create('other'),mod=await create('mod',['moderator']);
  assert.equal((await call('/api/guild-hub/register','POST',{name:'Hax',tag:'PDXO'},null)).status,401);
  assert.equal((await call('/api/guild-hub/register','POST',{name:'Hax',tag:'PDXO'},'owner','https://example.com')).status,403);
  assert.equal((await call('/api/guild-hub/register','POST',{name:'Hax',tag:'XXX'},'owner')).status,422);
  assert.equal((await profileTag('ABCD','other')).status,200);
  const created=await call('/api/guild-hub/register','POST',{name:'Pacific Vanguard',tag:'ABCD',bio:'Raids and casual progression'},'owner');
  assert.equal(created.status,201);assert.equal(created.body.guild.status,'pending');
  const id=created.body.guild.id;
  assert.equal(Object.hasOwn(created.body.guild,'crest'),false);
  assert.equal((await call('/api/guild-hub')).body.guilds.length,0);
  assert.equal((await call('/api/guild-hub/register','POST',{name:'Impersonators',tag:'abcd'},'other')).status,409);
  assert.equal((await call('/api/guild-hub/'+id+'/icon','POST',{image:'unused'},'owner')).status,410);
  const review=await call('/api/guild-hub/moderation','GET',undefined,'mod');
  assert.equal(review.status,200);assert.equal(review.body.guilds.length,1);
  assert.equal((await call('/api/guild-hub/'+id+'/moderation','PATCH',{action:'approve'},'owner')).status,403);
  assert.equal((await call('/api/guild-hub/'+id+'/moderation','PATCH',{action:'approve'},'mod')).status,200);
  assert.equal((await call('/api/guild-hub/'+id+'/moderation','PATCH',{action:'approve-icon'},'mod')).status,422);
  const listed=await call('/api/guild-hub');
  assert.equal(listed.body.guilds.length,1);
  assert.equal(Object.hasOwn(listed.body.guilds[0],'crest'),false);
  assert.equal(Object.hasOwn(listed.body.guilds[0],'iconDataUrl'),false);
  assert.equal((await profileTag('ABCD','other')).status,409);
  assert.equal((await profileTag('zzzz','other')).status,200);
  const {readJSON}=await import('../src/account-server.mjs');
  assert.equal((await readJSON(resolve(root,'users',other.id+'.json'))).profile.guildTag,'ZZZZ');
  assert.equal((await call('/api/guild-hub/'+id+'/apply','POST',{note:'I play warrior'},'other')).status,200);
  assert.equal((await call('/api/guild-hub/'+id+'/applications','PATCH',{action:'accept',userId:other.id},'owner')).status,200);
  const p=publicProfile(await readJSON(resolve(root,'users',other.id+'.json')));
  assert.equal(p.guildTag,'ABCD');assert.equal(p.guildId,id);
  const custom={tagStyle:{color:'#54CB98',finish:'gradient'}};
  assert.equal((await call('/api/guild-hub/'+id,'PATCH',custom,'other')).status,403);
  assert.equal((await call('/api/guild-hub/'+id,'PATCH',custom,'owner')).status,200);
  assert.equal((await call('/api/guild-hub/'+id)).body.guild.tagStyle.finish,'gradient');
  assert.equal((await call('/api/guild-hub/'+id)).body.guild.tagStyle.color,'#54CB98');
  assert.equal((await call('/api/guild-hub/'+id,'PATCH',{crest:{center:0}},'owner')).status,422);
  assert.equal((await call('/api/guild-hub/'+id,'PATCH',{tagStyle:{color:'javascript:alert(1)',finish:'glow'}},'owner')).status,422);
  assert.equal((await call('/api/guild-hub/'+id+'/events','POST',{title:'Nope'},'owner')).status,404);
  assert.equal((await call('/api/guild-hub/'+id+'/posts','POST',{text:'Nope'},'owner')).status,404);
  assert.equal((await call('/api/guild-hub/'+id+'/members','PATCH',{action:'leave',userId:owner.id},'owner')).status,409);
  assert.equal((await call('/api/guild-hub/'+id+'/members','PATCH',{action:'leave',userId:other.id},'other')).status,200);
  assert.equal((await readJSON(resolve(root,'users',other.id+'.json'))).profile.guildId,'');
 }finally{
  await rm(root,{recursive:true,force:true});
  for(const [k,v] of Object.entries(old)){const key=({data:'ARCANA_ACCOUNT_DATA_DIR',base:'ARCANA_AUTH_BASE_URL',client:'ARCANA_DISCORD_CLIENT_ID',secret:'ARCANA_DISCORD_CLIENT_SECRET'})[k];if(v===undefined)delete process.env[key];else process.env[key]=v;}
 }
});
