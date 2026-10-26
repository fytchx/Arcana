import test from 'node:test';
import assert from 'node:assert/strict';
import {handleJournalRequest} from '../src/journal-server.mjs';
import {JOURNAL_SEEDS} from '../src/journal-seeds.mjs';
import {journalIndexView,journalArticleView} from '../src/journal-views.js';

async function request(path,method='GET',headers={}){
 const req={method,headers, url:path};
 const res={status:0,headers:null,body:null,writeHead(status,headers){this.status=status;this.headers=headers;},end(body){this.body=body??'';}};
 const handled=await handleJournalRequest(req,res,new URL(path,'https://arcanacompanion.xyz'));
 return {handled,...res,text:String(res.body||'')};
}
test('Journal first articles use the measured 250-player snapshot',()=>{
 assert.ok(JOURNAL_SEEDS.length>=4);
 const balance=JOURNAL_SEEDS.find(x=>x.slug==='class-balance-top-250-season-2');
 assert.ok(balance);
 assert.match(balance.body,/41.6%/);
 assert.match(balance.body,/not a complete diagnosis/);
});
test('Journal index is server rendered, indexable and provides real article links',async()=>{
 const r=await request('/journal');
 assert.equal(r.handled,true);assert.equal(r.status,200);
 assert.match(r.text,/Arcana Journal/);
 assert.match(r.text,/class-balance-top-250-season-2/);
 assert.match(r.text,/Building a Proper Damage Calculator/);
 assert.match(r.text,/name="robots" content="index,follow"/);
 assert.match(r.text,/rel="canonical" href="https:\/\/arcanacompanion.xyz\/journal"/);
 assert.match(r.text,/href="\/#\/calculators\/pathfinder"/);
 assert.match(r.text,/href="\/#\/labs\/build"/);
 assert.match(r.text,/href="\/#\/wiki"/);
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
 const articles=JSON.parse(list.text).articles;
 assert.ok(articles.length>=4);
 assert.equal(articles[0].slug,'help-shape-arcana');
 assert.ok(articles.find(x=>x.slug==='idlearc-1-3-7-the-timing-couldnt-be-better'));
});
test('Native Journal views use Arcana guide styling and navigate inside the app shell',async()=>{
 const list=JSON.parse((await request('/api/journal')).text).articles;
 const index=journalIndexView({articles:list});
 assert.match(index,/wikiBreadcrumbs/);assert.match(index,/journalStoryCard/);
 assert.match(index,/data-route="journal\/article"/);
 assert.doesNotMatch(index,/journalNav|journalShell|journal.css/);
 const article=JSON.parse((await request('/api/journal?slug=class-balance-top-250-season-2')).text);
 const view=journalArticleView({article,articles:list});
 assert.match(view,/wikiArticleIntro/);assert.match(view,/journalNativeBody/);
 assert.match(view,/TOP 250 CLASS REPRESENTATION/);
 assert.match(view,/data-route="wiki\/guides"/);
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


test('October 18 update acknowledges changes without overwriting the original analysis',async()=>{
 const earlier=JOURNAL_SEEDS.find(x=>x.slug==='class-balance-top-250-season-2');
 assert.equal(earlier.slug,'class-balance-top-250-season-2');
 assert.match(earlier.body,/104 Rogues/);
 assert.match(earlier.body,/41.6%/);
 const originalAnnouncement=JOURNAL_SEEDS.find(x=>x.slug==='building-the-arcana-damage-calculator');
 assert.equal(originalAnnouncement.slug,'building-the-arcana-damage-calculator');
 assert.match(originalAnnouncement.body,/character sandbox/);
 const patch=JOURNAL_SEEDS.find(x=>x.slug==='idlearc-1-3-7-the-timing-couldnt-be-better');
 assert.equal(patch.slug,'idlearc-1-3-7-the-timing-couldnt-be-better');
 assert.match(patch.body,/pet affix auto-reroll/i);
 assert.match(patch.body,/from \+3% to \+4%/);
 assert.match(patch.body,/90% to 95%/);
 assert.match(patch.body,/\+5% to \+7%/);
 assert.match(patch.body,/Hunter's Mark/);
 assert.match(patch.body,/First Strike/);
 assert.match(patch.body,/five lower-biome/);
 assert.match(patch.body,/before this patch/);
 const story=await request('/journal/'+patch.slug);
 assert.equal(story.status,200);
 assert.match(story.text,/Editor&#39;s note/);
 const page=await request('/journal');
 assert.ok(page.text.indexOf('The Timing Couldn&#39;t Have Been Better')<page.text.indexOf('Class Balance: The Top 250'),'Patch follow-up should be the newest Journal story');
});
