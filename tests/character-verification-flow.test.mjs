import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {safeCommunityArchive} from '../src/community-archive-server.mjs';

const mockResponse=()=>({status:null,data:null,headers:null,writeHead(status,headers){this.status=status;this.headers=headers},end(body){this.data=body?JSON.parse(String(body)):null}});
const request=(method,token,body)=>Object.assign(Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]),{method,headers:{...(token?{cookie:'arcana-session='+token}:{}),origin:'http://localhost:3000',...(body?{'content-type':'application/json'}:{})}});
async function invoke(path,method,token,body){
 const res=mockResponse(),handled=await safeCommunityArchive(request(method,token,body),res,new URL('http://localhost'+path));
 assert.equal(handled,true);
 assert.match(res.headers['content-type'],/application\/json/);
 return res;
}
test('real verified account can submit a private character claim and reviewer can approve it',async()=>{
 const path=await mkdtemp(join(tmpdir(),'arcana-verified-character-'));
 const vars=['ARCANA_ACCOUNT_DATA_DIR','ARCANA_AUTH_BASE_URL','ARCANA_DISCORD_CLIENT_ID','ARCANA_DISCORD_CLIENT_SECRET'];
 const old=Object.fromEntries(vars.map(n=>[n,process.env[n]]));
 Object.assign(process.env,{ARCANA_ACCOUNT_DATA_DIR:path,ARCANA_AUTH_BASE_URL:'http://localhost:3000',ARCANA_DISCORD_CLIENT_ID:'mock-id',ARCANA_DISCORD_CLIENT_SECRET:'mock-secret'});
 try{
  const userId=randomUUID(),modId=randomUUID(),playerToken='P'.repeat(48),modToken='M'.repeat(48);
  await mkdir(join(path,'users'),{recursive:true});await mkdir(join(path,'sessions'),{recursive:true});
  for(const [id,discordId,roles] of [[userId,'123456789012345678',[]],[modId,'876543210987654321',['moderator']]])await writeFile(join(path,'users',id+'.json'),JSON.stringify({id,discordId,roles,profile:{displayName:roles.length?'Moderator':'Player'},joinedAt:new Date().toISOString(),suspended:false}));
  for(const [token,id] of [[playerToken,userId],[modToken,modId]])await writeFile(join(path,'sessions',createHash('sha256').update(token).digest('hex')+'.json'),JSON.stringify({id,expires:Date.now()+900000}));
  const jpeg=Buffer.alloc(250,0x23);jpeg[0]=255;jpeg[1]=216;jpeg[2]=255;
  const screenshot='data:image/jpeg;base64,'+jpeg.toString('base64');
  const start=await invoke('/api/arcana-archive/claim/me','GET',playerToken);
  assert.equal(start.status,200);assert.equal(start.data.claim,null);
  const submitted=await invoke('/api/arcana-archive/claim','POST',playerToken,{name:'Memro',screenshot});
  assert.equal(submitted.status,201);assert.equal(submitted.data.claim.status,'pending');assert.equal(submitted.data.claim.name,'Memro');
  assert.equal(JSON.stringify(submitted.data).includes('base64,'),false,'Public claim summary must never contain proof');
  const pending=await invoke('/api/arcana-archive/claim/me','GET',playerToken);
  assert.equal(pending.status,200);assert.equal(pending.data.claim.status,'pending');
  const duplicate=await invoke('/api/arcana-archive/claim','POST',playerToken,{name:'Memro',screenshot});
  assert.equal(duplicate.status,409,'Existing pending claim must be protected');
  const list=await invoke('/api/arcana-archive/claims','GET',modToken);
  assert.equal(list.status,200);assert.equal(list.data.claims.length,1);
  const forbidden=await invoke('/api/arcana-archive/claims/'+userId+'/proof','GET',playerToken);
  assert.equal(forbidden.status,403,'Regular players must not be able to view private screenshots');
  const proof=await invoke('/api/arcana-archive/claims/'+userId+'/proof','GET',modToken);
  assert.equal(proof.status,200);assert.equal(proof.data.proof,screenshot);
  const approved=await invoke('/api/arcana-archive/claims/'+userId,'PATCH',modToken,{status:'approved',note:'Verified against combat screen'});
  assert.equal(approved.status,200);assert.equal(approved.data.claim.status,'approved');
  const final=await invoke('/api/arcana-archive/claim/me','GET',playerToken);
  assert.equal(final.data.claim.status,'approved');
 }finally{for(const name of vars){if(old[name]===undefined)delete process.env[name];else process.env[name]=old[name]}await rm(path,{force:true,recursive:true});}
});