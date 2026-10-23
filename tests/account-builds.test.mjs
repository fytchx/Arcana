import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {once} from 'node:events';

test('Account saves preserve configured gear across save and restore',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'arcana-builds-'));
 const keys=['ARCANA_ACCOUNT_DATA_DIR','ARCANA_AUTH_BASE_URL','ARCANA_DISCORD_CLIENT_ID','ARCANA_DISCORD_CLIENT_SECRET','ARCANA_CREATOR_DISCORD_ID'];
 const old=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
 process.env.ARCANA_ACCOUNT_DATA_DIR=directory;
 process.env.ARCANA_DISCORD_CLIENT_ID='123456789123456789';
 process.env.ARCANA_DISCORD_CLIENT_SECRET='test-only-secret';
 process.env.ARCANA_CREATOR_DISCORD_ID='222222222222222222';
 const {saveAtomic,safeAccountRequest}=await import('../src/account-server.mjs');
 const {safeAccountBuildRequest}=await import('../src/account-builds.mjs');
 const userId=randomUUID(),token='D'.repeat(42);
 const build={id:'local-draft',title:'Configured test build',className:'Archer',monsterLevel:100,
  equipment:{
   weapon:{id:'game:item:wooden-bow',rarity:6,awaken:17,bonusId:'fierce',bonusTier:8,roll:37},
   ring2:{id:'game:item:adventurers-ring',rarity:5,awaken:0,bonusId:'fierce',bonusTier:7,roll:29}
  },runes:[],runeBoard:[],petSetup:[],notes:'Keep gear config intact.'};
 const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(await safeAccountBuildRequest(req,res,url))return;
  if(await safeAccountRequest(req,res,url))return;
  res.writeHead(404);res.end();
 });
 try{
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const port=server.address().port,base='http://127.0.0.1:'+port;
  process.env.ARCANA_AUTH_BASE_URL='http://localhost:'+port;
  await saveAtomic(join(directory,'users',userId+'.json'),{id:userId,discordId:'111111111111111111',roles:[],profile:{displayName:'Build test'},discordName:'Build test'});
  const hash=createHash('sha256').update(token).digest('hex');
  await saveAtomic(join(directory,'sessions',hash+'.json'),{id:userId,expires:Date.now()+600000});
  const headers={'cookie':'arcana-session='+token,'origin':'http://localhost:'+port,'content-type':'application/json'};
  const saved=await fetch(base+'/api/account/builds',{method:'POST',headers,body:JSON.stringify({build})});
  assert.equal(saved.status,201);
  const {build:record}=await saved.json();
  const restored=await fetch(base+'/api/account/builds/'+record.id,{headers});
  assert.equal(restored.status,200);
  const data=await restored.json();
  assert.deepEqual(data.build.equipment,build.equipment);
  assert.equal(data.build.notes,build.notes);
 }finally{
  await new Promise(resolve=>server.close(resolve));
  await rm(directory,{recursive:true,force:true});
  for(const [key,value] of Object.entries(old)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
 }
});
