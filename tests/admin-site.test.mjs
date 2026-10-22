import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {Readable} from 'node:stream';
import {DEFAULT_DESIGN} from '../src/design-controls.js';
import {normalizeDesign,normalizeNotice,handleSiteAdminRequest} from '../src/site-admin-server.mjs';
import {can} from '../src/account-policy.js';

const base='http://localhost:3000';
function fake(method,path,body,token,origin=base){
 const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);
 req.method=method;req.url=path;
 req.headers={host:'localhost:3000',origin,'content-type':'application/json',cookie:token?'arcana-session='+token:''};
 const res={status:0,body:'',writeHead(code){this.status=code;},end(text){this.body+=text||'';}};
 return {req,res,url:new URL(path,base)};
}
async function call(method,path,body,token,origin=base){
 const obj=fake(method,path,body,token,origin);
 assert.equal(await handleSiteAdminRequest(obj.req,obj.res,obj.url),true);
 return {status:obj.res.status,data:JSON.parse(obj.res.body||'{}')};
}
test('global theme validates every field, rejects arbitrary CSS and notice markup safely',()=>{
 assert.deepEqual(normalizeDesign(DEFAULT_DESIGN),DEFAULT_DESIGN);
 assert.throws(()=>normalizeDesign({...DEFAULT_DESIGN,main:'url(https://example.com)'}),/Invalid design/);
 assert.throws(()=>normalizeDesign({...DEFAULT_DESIGN,bad:'1'}),/Unknown design/);
 assert.deepEqual(normalizeNotice({enabled:true,text:' Site update '}),{enabled:true,text:'Site update'});
 assert.throws(()=>normalizeNotice({enabled:true,text:'x'.repeat(181)}),/180/);
 assert.equal(can({roles:['member']},'site:manage'),false);
 assert.equal(can({roles:['wiki-editor']},'site:manage'),false);
 assert.equal(can({roles:['admin']},'site:manage'),true);
});
test('public theme is anonymous while publishes, rollback, history and members are protected',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'arcana-site-admin-'));
 const previous={root:process.env.ARCANA_ACCOUNT_DATA_DIR,url:process.env.ARCANA_AUTH_BASE_URL,id:process.env.ARCANA_DISCORD_CLIENT_ID,secret:process.env.ARCANA_DISCORD_CLIENT_SECRET,creator:process.env.ARCANA_CREATOR_DISCORD_ID};
 process.env.ARCANA_ACCOUNT_DATA_DIR=temp;
 process.env.ARCANA_AUTH_BASE_URL=base;
 process.env.ARCANA_DISCORD_CLIENT_ID='local-test-client';
 process.env.ARCANA_DISCORD_CLIENT_SECRET='local-test-secret';
 process.env.ARCANA_CREATOR_DISCORD_ID='123456789012345678';
 try{
  const ownerId=randomUUID(),memberId=randomUUID(),token='a'.repeat(48),memberToken='b'.repeat(48);
  const sessionDir=join(temp,'sessions'),usersDir=join(temp,'users');
  await mkdir(sessionDir,{recursive:true});await mkdir(usersDir,{recursive:true});
  await Promise.all([
   writeFile(join(usersDir,ownerId+'.json'),JSON.stringify({id:ownerId,discordId:process.env.ARCANA_CREATOR_DISCORD_ID,discordName:'Site Creator',roles:[],joinedAt:new Date().toISOString()})),
   writeFile(join(usersDir,memberId+'.json'),JSON.stringify({id:memberId,discordId:'999999999999999999',discordName:'Regular Beta',roles:[],joinedAt:new Date().toISOString()})),
   writeFile(join(sessionDir,createHash('sha256').update(token).digest('hex')+'.json'),JSON.stringify({id:ownerId,expires:Date.now()+300000})),
   writeFile(join(sessionDir,createHash('sha256').update(memberToken).digest('hex')+'.json'),JSON.stringify({id:memberId,expires:Date.now()+300000}))
  ]);
  const blank=await call('GET','/api/site/theme');
  assert.equal(blank.status,200);assert.equal(blank.data.revision,0);assert.equal(blank.data.design,null);
  assert.equal((await call('GET','/api/admin/site')).status,401);
  assert.equal((await call('GET','/api/admin/site',null,memberToken)).status,403);
  assert.equal((await call('GET','/api/admin/members',null,memberToken)).status,403);
  const input={section:'design',expectedRevision:0,design:{...DEFAULT_DESIGN,main:'#123456',iconMode:'accent'}};
  assert.equal((await call('PUT','/api/admin/site',input,token,'https://evil.example')).status,403);
  const changed=await call('PUT','/api/admin/site',input,token);
  assert.equal(changed.status,200);assert.equal(changed.data.design.main,'#123456');assert.equal(changed.data.revision,1);
  const publicAfter=await call('GET','/api/site/theme');
  assert.equal(publicAfter.data.design.main,'#123456');
  // A theme saved by the previous 32-pattern editor still loads after
  // newer Build Studio controls are introduced, without losing colors.
  const oldFile=join(temp,'admin','site-config.json');
  const original=JSON.parse(await readFile(oldFile,'utf8'));
  for(const key of ['patternTarget','heroActionWidth','heroActionAlign','heroActionHeight','heroActionGlow','heroActionBorder','heroActionIcon','heroActionSubtitle'])delete original.design[key];
  await writeFile(oldFile,JSON.stringify(original));
  const migrated=await call('GET','/api/site/theme');
  assert.equal(migrated.status,200);
  assert.equal(migrated.data.design.main,'#123456');
  assert.equal(migrated.data.design.heroActionWidth,DEFAULT_DESIGN.heroActionWidth);
  assert.equal(migrated.data.design.patternTarget,'all');
  assert.equal(publicAfter.data.updatedBy,undefined);
  const stale=await call('PUT','/api/admin/site',input,token);
  assert.equal(stale.status,409);
  const notice=await call('PUT','/api/admin/site',{section:'notice',expectedRevision:1,notice:{enabled:true,text:'Wiki content updated!'}},token);
  assert.equal(notice.status,200);assert.equal(notice.data.notice.enabled,true);
  const members=await call('GET','/api/admin/members?page=1',null,token);
  assert.equal(members.status,200);assert.equal(members.data.total,2);
  assert.ok(members.data.members.every(x=>!('discordId' in x)&&!('avatarDataUrl' in x)));
  const restored=await call('POST','/api/admin/site/rollback',{expectedRevision:2,targetRevision:0},token);
  assert.equal(restored.status,200);assert.equal(restored.data.design,null);assert.equal(restored.data.notice.enabled,false);
  const history=await call('GET','/api/admin/site',null,token);
  assert.ok(history.data.history.length>=3);
  assert.ok((await readFile(join(temp,'admin','site-config.json'),'utf8')).includes('"revision":3'));
 }finally{
  for(const [name,key] of [['root','ARCANA_ACCOUNT_DATA_DIR'],['url','ARCANA_AUTH_BASE_URL'],['id','ARCANA_DISCORD_CLIENT_ID'],['secret','ARCANA_DISCORD_CLIENT_SECRET'],['creator','ARCANA_CREATOR_DISCORD_ID']]){
   if(previous[name]===undefined)delete process.env[key];else process.env[key]=previous[name];
  }
  await rm(temp,{recursive:true,force:true});
 }
});
test('admin routes share one manager, while public settings never show local style controls',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const nav=await readFile(new URL('../src/launch-navigation.js',import.meta.url),'utf8');
 const panel=await readFile(new URL('../src/admin-console.js',import.meta.url),'utf8');
 const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.match(app,/adminConsoleView\(/);assert.match(app,/setDesignPreview\(/);
 assert.match(app,/siteNoticeMarkup\(/);
 assert.match(server,/safeSiteAdminRequest\(/);
 assert.match(html,/admin\.css/);
 for(const section of ['Traffic','Appearance','Members & Roles','Content','Site Controls'])assert.ok(panel.includes(section));
 const start=nav.indexOf('export function settingsView('),end=nav.indexOf('export function iconGalleryView()',start);
 const settings=nav.slice(start,end);
 assert.doesNotMatch(settings,/adminEditor\+|designPanel\(\)/);
 assert.match(settings,/Reduce motion/);
});
