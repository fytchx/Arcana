import test from 'node:test';
import assert from 'node:assert/strict';
import {handleJournalRequest} from '../src/journal-server.mjs';
import {JOURNAL_SEEDS} from '../src/journal-seeds.mjs';

async function request(path,method='GET',headers={}){
 const req={method,headers, url:path};
 const res={status:0,headers:null,body:null,writeHead(status,headers){this.status=status;this.headers=headers;},end(body){this.body=body??'';}};
 const handled=await handleJournalRequest(req,res,new URL(path,'https://arcanacompanion.xyz'));
 return {handled,...res,text:String(res.body||'')};
}
test('Journal first articles use the measured 250-player snapshot',()=>{
 assert.equal(JOURNAL_SEEDS.length,2);
 assert.equal(JOURNAL_SEEDS[0].slug,'class-balance-top-250-season-2');
 assert.match(JOURNAL_SEEDS[0].body,/41.6%/);
 assert.match(JOURNAL_SEEDS[0].body,/not a complete diagnosis/);
});
test('Journal index is server rendered, indexable and provides real article links',async()=>{
 const r=await request('/journal');
 assert.equal(r.handled,true);assert.equal(r.status,200);
 assert.match(r.text,/Arcana Journal/);
 assert.match(r.text,/class-balance-top-250-season-2/);
 assert.match(r.text,/Building a Proper Damage Calculator/);
 assert.match(r.text,/name="robots" content="index,follow"/);
 assert.match(r.text,/rel="canonical" href="https:\/\/arcanacompanion.xyz\/journal"/);
});
test('Story has verified class chart and social metadata, without unsupported balance claims',async()=>{
 const r=await request('/journal/class-balance-top-250-season-2');
 assert.equal(r.status,200);assert.match(r.text,/104 players · 41.6%/);
 assert.match(r.text,/47 players are Rogues/);
 assert.match(r.text,/rank representation/i); 
 assert.match(r.text,/property="og:title"/);
 assert.match(r.text,/application\/ld\+json/);
});
test('Damage calculator post clearly identifies ongoing work',async()=>{
 const r=await request('/journal/building-the-arcana-damage-calculator');
 assert.equal(r.status,200);
 assert.match(r.text,/actively in development/);
 assert.match(r.text,/gear|Gear/);
});
test('Unknown and draft content never appears as a live story',async()=>{
 const missing=await request('/journal/not-a-real-story');
 assert.equal(missing.status,404);
 const list=await request('/api/journal');
 assert.equal(list.status,200);
 assert.equal(JSON.parse(list.text).articles.length,2);
 assert.equal(JSON.parse(list.text).articles[0].slug,'class-balance-top-250-season-2');
});
test('Guest publishing and editorial studio cannot be accessed',async()=>{
 const admin=await request('/api/journal/admin');assert.equal(admin.status,401);
 const studio=await request('/journal/studio');assert.equal(studio.status,401);
});
test('SEO discovery endpoints include current public stories',async()=>{
 const robots=await request('/robots.txt');assert.equal(robots.status,200);assert.match(robots.text,/sitemap.xml/);
 const sitemap=await request('/sitemap.xml');assert.equal(sitemap.status,200);assert.match(sitemap.text,/class-balance-top-250-season-2/);
 const head=await request('/journal','HEAD');assert.equal(head.status,200);assert.equal(head.text,'');
});
