import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {Readable} from 'node:stream';
import {can} from '../src/account-policy.js';
import {recordTraffic,trafficSnapshot,handleTrafficRequest} from '../src/traffic-server.mjs';
import {adminTrafficView} from '../src/admin-traffic-ui.js';

const site=new URL('http://localhost:3000');
function request(method,path,body=null,origin='http://localhost:3000'){
 const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);
 req.method=method;req.headers={'host':'localhost:3000','origin':origin,'content-type':'application/json'};req.url=path;
 const res={status:0,headers:null,body:'',
  writeHead(status,headers){this.status=status;this.headers=headers;},
  end(data){if(data)this.body+=data;}
 };
 return {req,res,url:new URL(path,site)};
}
test('Only server-authenticated Admin and Creator can view traffic',async()=>{
 assert.equal(can({roles:['member']},'analytics:view'),false);
 assert.equal(can({roles:['wiki-editor']},'analytics:view'),false);
 assert.equal(can({roles:['moderator']},'analytics:view'),false);
 assert.equal(can({roles:['admin']},'analytics:view'),true);
 assert.equal(can({isCreator:true,roles:[]},'analytics:view'),true);
 assert.equal(can({roles:['admin'],suspended:true},'analytics:view'),false);
 const {req,res,url}=request('GET','/api/admin/traffic');
 assert.equal(await handleTrafficRequest(req,res,url),true);
 assert.equal(res.status,401);
 assert.match(res.body,/Sign in with Discord/);
});
test('Traffic events are same-origin, strict and do not expose any public statistics',async()=>{
 const foreign=request('POST','/api/traffic/event',{type:'view',session:randomUUID(),route:'home'},'https://not-arcana.example');
 await handleTrafficRequest(foreign.req,foreign.res,foreign.url);
 assert.equal(foreign.res.status,403);
 const noSession=request('POST','/api/traffic/event',{type:'view',session:'fake',route:'home'});
 await handleTrafficRequest(noSession.req,noSession.res,noSession.url);
 assert.equal(noSession.res.status,422);
 const withQuery=request('POST','/api/traffic/event',{type:'view',session:randomUUID(),route:'wiki/article?id=private'});
 await handleTrafficRequest(withQuery.req,withQuery.res,withQuery.url);
 assert.equal(withQuery.res.status,422);
});
test('Visitors count as sessions, pageviews and active sessions, but not as personally identified people',async()=>{
 const folder=await mkdtemp(join(tmpdir(),'arcana-traffic-test-'));
 process.env.ARCANA_TRAFFIC_DATA_DIR=folder;
 try{
  const sessionA=randomUUID(),sessionB=randomUUID();
  assert.equal(await recordTraffic({session:sessionA,route:'home',type:'view'}),true);
  assert.equal(await recordTraffic({session:sessionA,route:'wiki/article',type:'view'}),true);
  assert.equal(await recordTraffic({session:sessionB,route:'home',type:'view'}),true);
  assert.equal(await recordTraffic({session:sessionA,route:'home',type:'heartbeat'}),true);
  assert.equal(await recordTraffic({session:sessionB,route:'home',type:'view'}),true); // repeated render ignored
  const today=trafficSnapshot(JSON.parse(await readFile(join(folder,'traffic-v1.json'),'utf8')));
  assert.equal(today.today.views,3);
  assert.equal(today.today.sessions,2);
  assert.equal(today.activeSessions,2);
  assert.equal(today.last7.views,3);
  assert.equal(today.last30.sessions,2);
  assert.equal(today.topPages[0].route,'home');
  assert.equal(today.topPages[0].views,2);
  assert.equal(today.days.length,30);
  const raw=await readFile(join(folder,'traffic-v1.json'),'utf8');
  assert.equal(raw.includes(sessionA),false);
  assert.equal(raw.includes(sessionB),false);
  assert.equal(raw.includes('127.0.0.1'),false);
  assert.equal(raw.includes('discordId'),false);
  const html=adminTrafficView({admin:true,authEnabled:true});
  assert.match(html,/Admin Dashboard/);
  assert.match(html,/data-traffic-action="refresh"/);
  assert.match(html,/No data loaded/);
  const trafficUI=await readFile(new URL('../src/admin-traffic-ui.js',import.meta.url),'utf8');
  assert.match(trafficUI,/data-traffic-range/);
  assert.doesNotMatch(adminTrafficView({admin:false}),/trafficGraph/);
 }finally{delete process.env.ARCANA_TRAFFIC_DATA_DIR;await rm(folder,{recursive:true,force:true});}
});
test('Traffic routes and privacy statement ship together',async()=>{
 const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const page=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const privacy=await readFile(new URL('../privacy.html',import.meta.url),'utf8');
 assert.match(server,/handleTrafficRequest\(req,res,parsedUrl\)/);
 assert.match(server,/\'\/traffic.css\'/);
 assert.match(app,/case 'admin':case 'admin\/traffic'/);
 assert.match(app,/recordTrafficNavigation\(dest\)/);
 assert.match(app,/loadAdminConsole\(parseRoute\(\)\.query\.get\('tab'\)\|\|'traffic',render\)/);
 assert.match(page,/\/traffic.css/);
 assert.match(privacy,/Basic website traffic statistics/);
 assert.match(privacy,/IP addresses/);
});
