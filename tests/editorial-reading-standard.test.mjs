import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {wikiArticleView} from '../src/wiki-views.js';
import {journalArticleView} from '../src/journal-views.js';
import {ML_ONE_SHOT_MILESTONE_GUIDE} from '../src/ml-one-shot-milestone-guide.js';

test('Arcana guide masthead combines title, metadata, chapter picker, share and progression loop',()=>{
 const html=wikiArticleView(ML_ONE_SHOT_MILESTONE_GUIDE);
 const head=html.slice(html.indexOf('<header'),html.indexOf('</header>')+9);
 for(const name of ['arcReadingKicker','Grinding Monster Level Efficiently','arcReadingDeck','arcReadingByline','wikichapters','wikishare','arcReadingLoop'])assert.ok(head.includes(name),name);
 assert.match(html,/class="wikiArticleBody"/);
 assert.ok(html.indexOf('wikiArticleBody')>html.indexOf('arcReadingHead'));
 assert.doesNotMatch(head,/wikiGuideFastTrack|wikiCompleteToc|wikiActionGrid/);
});
test('inline tools validate destination and escape unknown tool references',()=>{
 const article={...ML_ONE_SHOT_MILESTONE_GUIDE,sections:[{title:'One',body:'Use [[tool:mlxp|XP <helper>]] only when helpful. [[tool:notKnown|Missing <hack>]] should be text.'}]};
 const html=wikiArticleView(article);
 assert.match(html,/data-params="view=ml"/);
 assert.match(html,/XP &lt;helper&gt;/);
 assert.match(html,/Missing &lt;hack&gt;/);
 assert.doesNotMatch(html,/notKnown|<hack>|<helper>/);
});
test('Journal articles show the first paragraph without a giant cover or footer cards',()=>{
 const html=journalArticleView({article:{category:'Guides & Strategy',title:'Test article',subtitle:'Short useful summary',author:'Editor',publishedAt:'2026-10-30T12:00:00Z',body:'First useful paragraph.',coverUrl:'/content/images/test.webp'},articles:[]});
 assert.match(html,/arcJournalHead/);
 assert.match(html,/arcReadingCover/);
 assert.match(html,/First useful paragraph/);
 assert.doesNotMatch(html,/journalNativeCover|journalNativeEnd|journalRelatedNative|wikiConnectionRows/);
});
test('Global stylesheet and written standard are both loaded for future articles',async()=>{
 const [bundle,css,docs]=await Promise.all(['../src/css-bundle.mjs','../reading-standard.css','../docs/ARCANA-READING-STANDARD.md'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
 assert.match(bundle,/'reading-standard.css'/);
 assert.match(css,/arcReadingHead/);
 assert.match(css,/arcReadingInlineLink/);
 assert.match(docs,/No tool promotion grids/);
 assert.match(docs,/first chapter heading/);
});
