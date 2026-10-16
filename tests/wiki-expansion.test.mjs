import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {WIKI_ARTICLES,wikiArticleById} from '../src/wiki-data.js';
import {WIKI_EXPANSION_ARTICLES} from '../src/wiki-expansion.js';
import {WIKI_CATEGORY_LIST} from '../src/wiki-data.js';
import {NAV_DESTINATIONS} from '../src/context-nav.js';
import {wikiArticleView,wikiArticleCard} from '../src/wiki-views.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const approved=/^\/assets\/icons\/idlearc-refined\/(?:classes|equipment|features|stats|tokens)\/[a-z0-9-]+\.svg$/;

test('Curated wiki expansion is substantial, unique and uses published primary sources',()=>{
 assert.ok(WIKI_EXPANSION_ARTICLES.length>=32);
 const slugs=WIKI_ARTICLES.map(a=>a.id);
 assert.equal(new Set(slugs).size,slugs.length);
 for(const a of WIKI_EXPANSION_ARTICLES){
  assert.equal(wikiArticleById(a.id),a);
  assert.ok(a.sections.length>=4,a.id);
  assert.ok(a.sections.every(s=>s.title.length>3&&s.body.length>100),a.id);
  assert.ok(a.summary.length>=35,a.id);
  assert.ok(['Classes','Pets','Equipment','Runes','Mechanics','Progression','Getting Started','Guilds'].includes(a.category),a.id);
  assert.ok(/^https:\/\/idlearc\.com\/(?:patch-notes\/1-[23]-1|classes)$/.test(a.sourceUrl),a.id);
  assert.ok(a.actions.length>=1,a.id+' must lead to tool');
 }
});
test('Every illustration exists in the approved in-repo asset family',async()=>{
 for(const a of WIKI_EXPANSION_ARTICLES){
  assert.equal(a.images.length,1,a.id);
  const image=a.images[0];
  assert.match(image.src,approved,a.id);
  assert.ok(image.alt.includes(a.title),a.id);
  await access(resolve(root,image.src.slice(1)));
  assert.equal(a.sections[0].imageId,image.id,a.id);
  const page=wikiArticleView(a);
  assert.ok(page.includes('wikiArticleFigureIllustration'),a.id);
  assert.ok(page.includes('Related guides and game records'),a.id);
  assert.ok(page.includes(image.src),a.id);
  assert.ok(wikiArticleCard(a).includes('wikiArticleCardArt'),a.id);
 }
});
test('All curated related links use actual published destinations, never guessed links',()=>{
 for(const a of WIKI_EXPANSION_ARTICLES){
  for(const id of a.connections.articles)assert.ok(wikiArticleById(id),a.id+' -> '+id);
  for(const key of a.connections.tools)assert.ok(NAV_DESTINATIONS[key]?.route,a.id+' -> '+key);
  for(const kind of a.connections.collections)assert.ok(WIKI_CATEGORY_LIST.some(([key])=>key===kind),a.id+' -> '+kind);
 }
});
test('Editorial images do not weaken arbitrary URL filtering',()=>{
 const sample=WIKI_EXPANSION_ARTICLES[0];
 for(const unsafe of ['https://example.com/x.svg','/assets/icons/arcana-minimal/ui/alert.svg','/assets/icons/idlearc-refined/../../../x.svg','javascript:alert(1)']){
  const html=wikiArticleView({...sample,images:[{...sample.images[0],src:unsafe}]});
  assert.ok(!html.includes('<img src="'+unsafe),unsafe);
 }
});
