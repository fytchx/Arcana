import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {wikiArticleView} from '../src/wiki-views.js';
import {wikiArticleById} from '../src/wiki-data.js';

test('37-section guide has one chapter control, not 37 repeated pagers',()=>{
 const article=wikiArticleById('season-2-complete-zane');
 const html=wikiArticleView(article);
 assert.equal(article.sections.length,37);
 assert.equal((html.match(/data-action="wikichapters"/g)||[]).length,1);
 assert.match(html,/arcReadingHead/);
 assert.match(html,/data-action="wikisection" data-arg="practical-quick-start-steps-and-tips"/);
 assert.match(html,/id="section-practical-quick-start-steps-and-tips"/);
 assert.doesNotMatch(html,/wikiCompleteToc|wikiGuideSectionPager|wikiArticleActions/);
});

test('chapter overlay lists source-controlled sections, highlights current, filters and restores scroll',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../season2-guide.css',import.meta.url),'utf8');
 assert.match(app,/function openGuideChapters\(trigger\)/);
 assert.match(app,/const article=wikiArticleById\(query\.get\('id'\)\)/);
 assert.match(app,/\.arcReadingPage \.wikiArticleSection/);
 assert.match(app,/getBoundingClientRect\(\)\.top<=marker/);
 assert.match(app,/aria-current="location"/);
 assert.match(app,/CURRENTLY READING/);
 assert.match(app,/data-action="wikichapterjump"/);
 assert.match(app,/function filterGuideChapters\(value\)/);
 assert.match(app,/state\.layer\?\.type!=='guide-chapters'/);
 assert.match(app,/case 'wikichapters':openGuideChapters\(btn\)/);
 assert.match(app,/case 'wikichapterjump':/);
 assert.match(app,/closeLayer\(\);\s*target\.scrollIntoView/);
 assert.match(app,/guideChapterReturnFocus/);
 assert.match(css,/\.layer\[data-type="guide-chapters"\]/);
 assert.match(css,/\.arcGuideChapterItem\.is-current/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.doesNotMatch(css,/select\s*\{/,'Use themed buttons instead of browser-native selects');
});
