import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {wikiArticleView} from '../src/wiki-views.js';
import {wikiArticleById} from '../src/wiki-data.js';

test('all 36 guide chapter controls open the overlay instead of jumping to the contents',()=>{
 const article=wikiArticleById('season-2-complete-zane');
 assert.equal(article.sections.length,36);
 const html=wikiArticleView(article);
 const pagerCount=(html.match(/data-action="wikichapters"/g)||[]).length;
 console.log('GUIDE_CHAPTER_DIAGNOSTIC',JSON.stringify({id:article.id,sections:article.sections.length,pagerCount,hasContents:html.includes('id="section-guide-contents"'),hasNext:html.includes('Next: '),staleContentsAction:html.includes('data-action="wikisection" data-arg="guide-contents"')}));
 assert.equal(pagerCount,36);
 assert.doesNotMatch(html,/data-action="wikisection" data-arg="guide-contents"/);
 assert.match(html,/id="section-guide-contents"/,'Keep the original contents page available');
 assert.match(html,/Next: /,'Keep chapter-to-chapter paging');
});
test('chapter overlay lists source-controlled sections, highlights current, filters and restores scroll',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../season2-guide.css',import.meta.url),'utf8');
 assert.match(app,/function openGuideChapters\(trigger\)/);
 assert.match(app,/const article=wikiArticleById\('season-2-complete-zane'\)/);
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
