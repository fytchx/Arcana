import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SEO_ORIGIN,SEO_PAGES,seoPageByPath,renderSeoPage} from '../src/seo-pages.mjs';

test('search landing pages are distinct, crawlable, valid, and internally connected',()=>{
 assert.equal(SEO_ORIGIN,'https://arcanacompanion.xyz');
 assert.equal(SEO_PAGES.length,7);
 assert.equal(new Set(SEO_PAGES.map(p=>p.path)).size,SEO_PAGES.length);
 assert.equal(new Set(SEO_PAGES.map(p=>p.title)).size,SEO_PAGES.length);
 const paths=new Set(SEO_PAGES.map(p=>p.path));
 for(const p of SEO_PAGES){
  assert.match(p.path,/^\/[a-z][a-z-]+$/);
  assert.ok(p.description.length>=70&&p.description.length<=165, p.path+' needs useful SEO description');
  assert.ok(p.intro.length>=70);
  assert.ok(p.features.length>=3);
  assert.ok(p.links.length>=2);
  for(const target of p.links)assert.ok(paths.has(target),p.path+' has dead related link '+target);
  const html=renderSeoPage(seoPageByPath(p.path));
  assert.ok(html.startsWith('<!doctype html>'));
  assert.match(html,/<html lang="en">/);
  assert.match(html,/name="description"/);
  assert.match(html,/name="robots" content="index,follow"/);
  const preview=renderSeoPage(p,{indexable:false});
  assert.match(preview,/name="robots" content="noindex,nofollow"/);
  assert.ok(preview.includes('<link rel="canonical" href="'+SEO_ORIGIN+p.path+'">'));
  assert.match(html,/property="og:title"/);
  assert.match(html,/property="og:url"/);
  assert.match(html,/application\/ld\+json/);
  assert.ok(html.includes('<link rel="canonical" href="'+SEO_ORIGIN+p.path+'">'));
  assert.ok(html.includes('<a class="primary" href="/#/'+p.appRoute+'">'));
  assert.ok(html.includes('<nav aria-label="Explore Arcana">'));
  assert.ok(!html.includes('<script type="module"'),'SEO entry should not need app JS');
  assert.match(html,/@media\(max-width:720px\)/);
 }
 assert.equal(seoPageByPath('/other'),null);
 assert.equal(renderSeoPage(null),null);
});

test('production server serves GET/HEAD and handles trailing slash without changing SPA',async()=>{
 const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 assert.match(server,/seoPageByPath\(pathname\)/);
 assert.match(server,/host==='arcanacompanion.xyz'/);
 assert.match(server,/x-robots-tag/);
 assert.match(server,/renderSeoPage\(seoPageByPath\(pathname\),\{indexable\}\)/);
 assert.match(server,/req\.method==='HEAD'\?null:page/);
 assert.match(server,/pathname\.endsWith\('\/'\)/);
 assert.match(server,/location':pathname\.slice\(0,-1\)/);
 assert.match(server,/handleJournalRequest\(req,res,parsedUrl\)/);
 assert.match(server,/const normalized=pathname==='\/'\?'\/index\.html':pathname/);
});
test('sitemap includes landing routes alongside dynamic published Journal links',async()=>{
 const journal=await readFile(new URL('../src/journal-server.mjs',import.meta.url),'utf8');
 assert.match(journal,/SEO_PAGES\.map\(p=>\(\{url:p\.path,date:/);
 assert.match(journal,/\.\.\.publicPosts\.map/);
 assert.match(journal,/Sitemap:/);
 assert.ok(journal.includes('sitemap.xml'))
 assert.match(journal,/<a href="\/#\/calculators\/pathfinder">Pathfinder<\/a>/);
 const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.match(index,/<meta name="description" content="Arcana is a free IdleArc companion/);
 assert.match(index,/property="og:site_name" content="Arcana"/);
 assert.match(index,/property="og:image" content="https:\/\/arcanacompanion.xyz\/assets\/arcana-logo.webp"/);
});
