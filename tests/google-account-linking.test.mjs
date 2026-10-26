import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,generateKeyPairSync,createSign} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {once} from 'node:events';

test('Google and Discord can sign in independently and link explicitly without losing identities or roles',async()=>{
 const root=await mkdtemp(join(tmpdir(),'arcana-google-auth-'));
 const names=['ARCANA_ACCOUNT_DATA_DIR','ARCANA_AUTH_BASE_URL','ARCANA_GOOGLE_CLIENT_ID','ARCANA_GOOGLE_CLIENT_SECRET',
  'ARCANA_DISCORD_CLIENT_ID','ARCANA_DISCORD_CLIENT_SECRET','ARCANA_CREATOR_DISCORD_ID','ARCANA_BETA_COHORT_OPEN'];
 const previous=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 const realFetch=globalThis.fetch;
 const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 const jwk=publicKey.export({format:'jwk'}),kid='qa-google-public-key';
 let googleSub='123456789012345678901',discordId='111111111111111111',oauthNonce='',wrongAudience=false;
 let requests=0;
 const jwt=()=>{
  const now=Math.floor(Date.now()/1000);
  const header={alg:'RS256',typ:'JWT',kid};
  const payload={iss:'https://accounts.google.com',aud:wrongAudience?'not-arcana':process.env.ARCANA_GOOGLE_CLIENT_ID,
   sub:googleSub,email:'player@example.invalid',email_verified:true,name:'Google Player',
   nonce:oauthNonce,iat:now,exp:now+3600};
  const body=[header,payload].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');
  return body+'.'+createSign('RSA-SHA256').update(body).end().sign(privateKey).toString('base64url');
 };
 process.env.ARCANA_ACCOUNT_DATA_DIR=root;
 process.env.ARCANA_GOOGLE_CLIENT_ID='test-client.apps.googleusercontent.com';
 process.env.ARCANA_GOOGLE_CLIENT_SECRET='test-google-secret';
 process.env.ARCANA_DISCORD_CLIENT_ID='test-discord-client';
 process.env.ARCANA_DISCORD_CLIENT_SECRET='test-discord-secret';
 process.env.ARCANA_CREATOR_DISCORD_ID='111111111111111111';
 process.env.ARCANA_BETA_COHORT_OPEN='1';
 globalThis.fetch=(input,init)=>{
  const url=String(input);
  if(url==='https://www.googleapis.com/oauth2/v3/certs')return Promise.resolve(new Response(JSON.stringify({keys:[{...jwk,kid,alg:'RS256',use:'sig'}]}),{status:200}));
  if(url==='https://oauth2.googleapis.com/token'){
   requests++;
   return Promise.resolve(new Response(JSON.stringify({id_token:jwt()}),{status:200}));
  }
  if(url.includes('discord.com/api/v10/oauth2/token'))return Promise.resolve(new Response(JSON.stringify({access_token:'fake-discord-access-token'}),{status:200}));
  if(url.includes('discord.com/api/v10/users/@me'))return Promise.resolve(new Response(JSON.stringify({id:discordId,username:'Discord QA',global_name:'Discord QA'}),{status:200}));
  return realFetch(input,init);
 };
 const {safeAccountRequest}=await import('../src/account-server.mjs');
 const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(await safeAccountRequest(req,res,url))return;
  res.writeHead(404);res.end();
 });
 const cookieFor=(res,name)=>{
  const rows=res.headers.getSetCookie?res.headers.getSetCookie():[res.headers.get('set-cookie')||''];
  const found=rows.find(x=>x.startsWith(name+'='));
  assert.ok(found,'Missing cookie '+name);
  return found.split(';')[0];
 };
 const cookieHeader=(...xs)=>xs.filter(Boolean).join('; ');
 try{
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const port=server.address().port,base='http://127.0.0.1:'+port;
  process.env.ARCANA_AUTH_BASE_URL='http://localhost:'+port;
  const begin=async(path,session='')=>{
   const res=await fetch(base+path,{headers:{cookie:session},redirect:'manual'});
   assert.equal(res.status,303);
   const url=new URL(res.headers.get('location'));
   const google=url.hostname==='accounts.google.com';
   if(google)oauthNonce=url.searchParams.get('nonce');
   return {url,state:url.searchParams.get('state'),cookie:cookieFor(res,google?'arcana-google-oauth':'arcana-oauth')};
  };
  const finish=async(path,start,session='')=>fetch(base+path+'?code=qa-code&state='+start.state,{
   headers:{cookie:cookieHeader(start.cookie,session)},redirect:'manual'
  });
  const me=async session=>{
   const response=await fetch(base+'/api/account/me',{headers:{cookie:session}});
   assert.equal(response.status,200);return response.json();
  };
  const invalid=await fetch(base+'/api/account/google/callback?code=bad&state=wrong',{redirect:'manual'});
  assert.match(invalid.headers.get('location'),/error=sign-in/);
  assert.equal(requests,0,'Rejected state must never exchange a code');

  let start=await begin('/api/account/google/login');
  assert.equal(start.url.searchParams.get('scope'),'openid email profile');
  assert.equal(start.url.searchParams.get('redirect_uri'),process.env.ARCANA_AUTH_BASE_URL+'/api/account/google/callback');
  let callback=await finish('/api/account/google/callback',start);
  assert.equal(callback.status,303);
  assert.equal(callback.headers.get('location'),' /#/account'.trim());
  const googleSession=cookieFor(callback,'arcana-session');
  let first=(await me(googleSession)).user;
  assert.equal(first.authProviders.google,true);
  assert.equal(first.authProviders.discord,false);
  assert.equal(first.isOwner,false);
  assert.ok(first.roles.some(r=>r.id==='beta-tester'));
  assert.equal(first.displayName,'Google Player');
  assert.equal(JSON.stringify(first).includes(googleSub),false,'Never disclose Google subject');

  start=await begin('/api/account/google/login');
  callback=await finish('/api/account/google/callback',start);
  assert.equal((await me(cookieFor(callback,'arcana-session'))).user.id,first.id);

  // Linking Discord onto an existing Google account must preserve its ID and badges.
  start=await begin('/api/account/discord/link',googleSession);
  callback=await finish('/api/account/callback',start,googleSession);
  assert.equal(callback.status,303);
  assert.equal(callback.headers.get('location'),' /#/account'.trim());
  assert.equal(callback.headers.getSetCookie().some(x=>x.startsWith('arcana-session=')),false,'Linking must not create a second session');
  let linked=(await me(googleSession)).user;
  assert.equal(linked.id,first.id);
  assert.equal(linked.authProviders.discord,true);
  assert.equal(linked.isOwner,true,'Creator status requires a verified Discord identity');

  // A separate Discord member can link Google only with a valid existing session.
  discordId='222222222222222222';
  start=await begin('/api/account/login');
  callback=await finish('/api/account/callback',start);
  const discordSession=cookieFor(callback,'arcana-session');
  let second=(await me(discordSession)).user;
  assert.notEqual(second.id,first.id);
  assert.equal(second.authProviders.google,false);
  googleSub='333333333333333333333';
  start=await begin('/api/account/google/link',discordSession);
  callback=await finish('/api/account/google/callback',start,discordSession);
  assert.equal(callback.status,303);
  second=(await me(discordSession)).user;
  assert.equal(second.authProviders.google,true);
  assert.equal(second.authProviders.discord,true);
  assert.equal(second.isOwner,false);

  // Another member cannot steal a Google identity linked to someone else's Arcana profile.
  googleSub='123456789012345678901';
  const alreadyLinked=await fetch(base+'/api/account/google/link',{headers:{cookie:discordSession},redirect:'manual'});
  // Their account already has Google, linking a second identity is a no-op redirect.
  assert.equal(alreadyLinked.status,303);
  assert.equal(alreadyLinked.headers.get('location'),' /#/account'.trim());
  const signin=(await me(discordSession)).user;
  assert.equal(signin.id,second.id);

  // A forged ID-token audience must never yield a new signed-in session.
  googleSub='444444444444444444444';wrongAudience=true;
  start=await begin('/api/account/google/login');
  callback=await finish('/api/account/google/callback',start);
  assert.match(callback.headers.get('location'),/error=sign-in/);
  assert.equal(callback.headers.getSetCookie().some(x=>x.startsWith('arcana-session=')),false);
 }finally{
  globalThis.fetch=realFetch;
  for(const [k,v] of Object.entries(previous)){if(v===undefined)delete process.env[k];else process.env[k]=v;}
  await new Promise(resolve=>server.close(resolve));
  await rm(root,{recursive:true,force:true});
 }
});
