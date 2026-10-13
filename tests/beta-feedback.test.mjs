import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readdir,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {betaFeedbackRequest} from '../src/beta-feedback-server.mjs';

test('Beta feedback: guests can report, private inbox requires staff, updates are staff-only',async()=>{
 const path=await mkdtemp(join(tmpdir(),'arcana-beta-'));
 const prior={dir:process.env.ARCANA_BETA_FEEDBACK_DIR,owner:process.env.ARCANA_WIKI_OWNER_KEY};
 process.env.ARCANA_BETA_FEEDBACK_DIR=path;
 process.env.ARCANA_WIKI_OWNER_KEY='beta-test-private-key';
 const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(await betaFeedbackRequest(req,res,url))return;
  res.writeHead(404);res.end('not found');
 });
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const root='http://127.0.0.1:'+server.address().port;
 const origin={'origin':root,'content-type':'application/json'};
 const payload={category:'bug',title:'Codex category changes jump',details:'After I select the Biomes category, the page jumps to the top unexpectedly.',page:'#/wiki/library?kind=biome',contact:''};
 try{
  let resp=await fetch(root+'/api/beta/status');
  assert.equal(resp.status,200);
  assert.equal((await resp.json()).feedbackEnabled,true);
  resp=await fetch(root+'/api/beta/feedback',{method:'POST',headers:{'content-type':'application/json','origin':'https://other.site'},body:JSON.stringify(payload)});
  assert.equal(resp.status,403);
  resp=await fetch(root+'/api/beta/feedback',{method:'POST',headers:origin,body:JSON.stringify({category:'bug',title:'x',details:'short'})});
  assert.equal(resp.status,422);
  resp=await fetch(root+'/api/beta/feedback',{method:'POST',headers:origin,body:JSON.stringify(payload)});
  assert.equal(resp.status,201);
  const confirmation=await resp.json();
  assert.match(confirmation.reference,/^[a-z0-9]{8}$/);
  const listing=await readdir(join(path,'beta-feedback'));
  assert.equal(listing.filter(x=>x.endsWith('.json')).length,1);
  const disk=(await readFile(join(path,'beta-feedback',listing.find(x=>x.endsWith('.json'))),'utf8'));
  assert.match(disk,/Codex category changes jump/);
  assert.doesNotMatch(disk,/127\.0\.0\.1|cookie|beta-test-private-key/);
  resp=await fetch(root+'/api/beta/reports');
  assert.equal(resp.status,403);
  resp=await fetch(root+'/api/beta/reports',{headers:{'x-arcana-wiki-key':prior.owner||'incorrect'}});
  assert.equal(resp.status,403);
  resp=await fetch(root+'/api/beta/reports',{headers:{'x-arcana-wiki-key':'beta-test-private-key'}});
  assert.equal(resp.status,200);
  const item=(await resp.json()).reports[0];
  assert.equal(item.title,payload.title);
  resp=await fetch(root+'/api/beta/reports/'+item.id,{method:'PATCH',headers:origin,body:JSON.stringify({state:'resolved'})});
  assert.equal(resp.status,403);
  resp=await fetch(root+'/api/beta/reports/'+item.id,{method:'PATCH',headers:{...origin,'x-arcana-wiki-key':'beta-test-private-key'},body:JSON.stringify({state:'resolved'})});
  assert.equal(resp.status,200);
  resp=await fetch(root+'/api/beta/reports',{headers:{'x-arcana-wiki-key':'beta-test-private-key'}});
  assert.equal((await resp.json()).reports[0].state,'resolved');
 }finally{
  server.close();await rm(path,{recursive:true,force:true});
  for(const [name,val] of Object.entries({ARCANA_BETA_FEEDBACK_DIR:prior.dir,ARCANA_WIKI_OWNER_KEY:prior.owner})){
   if(val===undefined)delete process.env[name];else process.env[name]=val;
  }
 }
});
