import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {safeCommunityArchive} from '../src/community-archive-server.mjs';

const response=()=>({
 statusCode:null,headers:null,payload:null,
 writeHead(status,headers){this.statusCode=status;this.headers=headers;},
 end(body){this.payload=body===undefined?'':String(body);}
});
test('live server registers every archive API route BEFORE the generic POST 405 guard',async()=>{
 const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 const dispatch="if(pathname.startsWith('/api/arcana-archive/')&&await safeCommunityArchive(req,res,parsedUrl))return;";
 const pos=server.indexOf(dispatch),guard=server.indexOf("if(req.method!=='GET'&&req.method!=='HEAD')");
 assert.ok(pos>0,'Server must dispatch character claims and season archive requests');
 assert.ok(guard>pos,'Archive API dispatch must come before method rejection');
 assert.match(server,/import \{safeCommunityArchive\} from '\.\/src\/community-archive-server\.mjs'/);
});
test('public season records GET is handled as valid JSON, not static fallback',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'arcana-archive-'));
 const previous=process.env.ARCANA_ACCOUNT_DATA_DIR;
 process.env.ARCANA_ACCOUNT_DATA_DIR=dir;
 try{
  const res=response();
  assert.equal(await safeCommunityArchive({method:'GET',headers:{}},res,new URL('http://localhost/api/arcana-archive/records')),true);
  assert.equal(res.statusCode,200);
  assert.deepEqual(JSON.parse(res.payload),{revision:0,records:[]});
  assert.match(res.headers['content-type'],/json/);
 }finally{if(previous===undefined)delete process.env.ARCANA_ACCOUNT_DATA_DIR;else process.env.ARCANA_ACCOUNT_DATA_DIR=previous;await rm(dir,{recursive:true,force:true});}
});
test('unauthenticated character status and submission respond with structured JSON errors',async()=>{
 const claimGet=response();
 assert.equal(await safeCommunityArchive({method:'GET',headers:{}},claimGet,new URL('http://localhost/api/arcana-archive/claim/me')),true);
 assert.ok(claimGet.statusCode>=400&&claimGet.statusCode<500);
 assert.equal(typeof JSON.parse(claimGet.payload).error,'string');
 const submit=response();
 assert.equal(await safeCommunityArchive({method:'POST',headers:{'content-type':'application/json'}},submit,new URL('http://localhost/api/arcana-archive/claim')),true);
 assert.ok(submit.statusCode>=400&&submit.statusCode<500);
 assert.notEqual(submit.statusCode,405);
 assert.equal(typeof JSON.parse(submit.payload).error,'string');
});
test('upload UI handles server error bodies and will not remain stuck on Loading',async()=>{
 const ui=await readFile(new URL('../src/community-archive-ui.js',import.meta.url),'utf8');
 assert.match(ui,/const out=await r\.json\(\)\.catch\(\(\)=>null\)/);
 assert.match(ui,/if\(route==='account'&&state\.myClaim===undefined\)/);
 assert.match(ui,/form\.dataset\.arcSubmitting==='true'/);
});