import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {WIKI_ARTICLES,allWikiArticles,wikiArticleById,setPublishedWikiArticles,wikiArticleEntries} from '../src/wiki-data.js';
import {wikiArticleView,wikiGuidesView,wikiLandingView} from '../src/wiki-views.js';
import {newWikiDraft,normalizeWikiDraft,validateWikiDraft,publicWikiArticle,validImageDataURL,MAX_IMAGE_BYTES,MAX_ARTICLE_IMAGES} from '../src/wiki-studio-model.js';
import {wikiPublishingEnabled,wikiPublicIndex} from '../src/wiki-server.mjs';
import {wikiStudioView} from '../src/wiki-studio.js';
import {NAV_DESTINATIONS} from '../src/context-nav.js';
const artwork='data:image/webp;base64,'+Buffer.from('small webp example').toString('base64');
const sample=()=>({id:'guide-original',title:'A practical Guild Skill Guide',summary:'A practical introduction to allocating guild points while comparing bonuses.',category:'Guilds',keywords:'guild, bonuses, skill tree',sourceLabel:'In-game verification',sourceUrl:'https://idlearc.com/patch-notes/1-3-1',sections:[{id:'section-1',title:'Getting started',body:'Guild points can be allocated across different rows.\n\n- Compare the impact\n- Confirm the unlock requirements',imageId:'image-guide'}],images:[{id:'image-guide',name:'Guild setup.png',alt:'Guild skill tree overview',caption:'Current layout',dataUrl:artwork}],relatedTools:['guildtree','guildtree','raids'],relatedArticles:['season-2'],relatedCollections:['pet','pet','all','nonexistent']});

test('Initial empty Studio draft is safe and incomplete until a writer provides content',()=>{
 const d=newWikiDraft();
 assert.equal(d.sections.length,1);
 assert.equal(validateWikiDraft(d).valid,false);
 assert.ok(validateWikiDraft(d).errors.length>=3);
});
test('Article normalization preserves images, limits fields and de-duplicates tools',()=>{
 const out=normalizeWikiDraft(sample());
 assert.equal(out.id,'guide-original');
 assert.equal(out.images[0].id,'image-guide');
 assert.equal(out.sections[0].imageId,'image-guide');
 assert.deepEqual(out.relatedTools,['guildtree','raids']);
 assert.equal(out.status,'draft');
 assert.deepEqual(out.relatedCollections,['pet']);
 assert.equal(out.baseRevision,'');
 assert.equal(out.category,'Guilds');
 assert.equal(validImageDataURL(out.images[0].dataUrl),true);
 assert.equal(validImageDataURL('javascript:alert(1)'),false);
 assert.equal(MAX_ARTICLE_IMAGES,10);
 assert.equal(MAX_IMAGE_BYTES,650000);
});
test('Writer cannot impersonate reserved built-in guide or publish an uncaptioned image',()=>{
 const conflict=validateWikiDraft({...sample(),id:'season-2'},{existingIds:WIKI_ARTICLES.map(a=>a.id)});
 assert.equal(conflict.valid,false);
 assert.match(conflict.errors.join(' '),/already used/);
 const noAlt=sample();noAlt.images[0].alt='';
 assert.equal(validateWikiDraft(noAlt).valid,false);
 assert.match(validateWikiDraft(noAlt).errors.join(' '),/alternative text/);
});
test('Normalized article contents are plain text, with safe images and validated tool destinations',()=>{
 const {valid}=validateWikiDraft(sample());assert.equal(valid,true);
 const article=publicWikiArticle(sample());
 assert.equal(article.sections[0].imageId,'image-guide');
 assert.equal(article.images[0].alt,'Guild skill tree overview');
 assert.deepEqual(article.connections.collections,['pet']);
 assert.match(wikiArticleView(article),/wikiConnectionChip/);
 assert.deepEqual(article.connections.tools,['guildtree','raids']);
 assert.equal(article.actions[0].route,NAV_DESTINATIONS.guildtree.route);
 assert.match(wikiArticleView(article),/wikiArticleFigure/);
 assert.match(wikiArticleView(article),/Compare the impact/);
 assert.match(wikiArticleView(article),/Current layout/);
 const tainted=sample();tainted.sections[0].body='<img src=x onerror=alert(1)>';
 const view=wikiArticleView({...article,sections:[{title:'HTML attack',body:tainted.sections[0].body}]});
 assert.doesNotMatch(view,/<img src=x onerror/);
 assert.match(view,/&lt;img/);
});
test('Published Wiki guides are dynamically listed and searchable without altering static content',()=>{
 const before=WIKI_ARTICLES.length;
 const article=publicWikiArticle(sample());
 const count=setPublishedWikiArticles({articles:[article]});
 assert.equal(count,1);
 assert.equal(allWikiArticles().length,before+1);
 assert.equal(wikiArticleById('guide-original').title,article.title);
 assert.match(wikiGuidesView(),/A practical Guild Skill Guide/);
 assert.ok(wikiArticleEntries().some(x=>x.id==='wiki:article:guide-original'));
 setPublishedWikiArticles({articles:[]});
 assert.equal(allWikiArticles().length,before);
 assert.equal(WIKI_ARTICLES.length,before);
});
test('Studio view links and client wiring are included in Arcana',async()=>{
 assert.match(wikiStudioView(),/wikiStudioRoot/);
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const view=await readFile(new URL('../src/wiki-views.js',import.meta.url),'utf8');
 assert.match(app,/case 'wiki\/studio':return wikiStudioView/);
 assert.match(app,/wireWikiStudio\(\)/);
 assert.match(app,/mountWikiStudio\(\)/);
 assert.match(view,/Open Wiki Studio/);
 assert.match(view,/Write a guide/);
});
test('Publishing stays locked without server owner credentials and registry has a valid shape',async()=>{
 assert.equal(typeof wikiPublishingEnabled(),'boolean');
 const index=await wikiPublicIndex();
 assert.ok(Array.isArray(index.articles));
});
