import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {wikiArticleView} from '../src/wiki-views.js';
import {wikiArticleById} from '../src/wiki-data.js';
test('practical jump is in the compact masthead, with reading text immediately after',async()=>{
 const guide=wikiArticleById('season-2-complete-zane');
 const html=wikiArticleView(guide);
 assert.equal(guide.sections.length,37);
 assert.match(html,/class="wikiArticleIntro arcReadingHead"/);
 assert.match(html,/data-action="wikisection" data-arg="practical-quick-start-steps-and-tips"/);
 assert.match(html,/id="section-practical-quick-start-steps-and-tips"/);
 assert.equal((html.match(/data-action="wikichapters"/g)||[]).length,1);
 assert.doesNotMatch(html,/wikiGuideFastTrack|wikiCompleteToc|wikiArticleActions/);
 assert.ok(html.indexOf('wikiArticleBody')>html.indexOf('arcReadingHead'));
 const css=await readFile(new URL('../reading-standard.css',import.meta.url),'utf8');
 assert.match(css,/\.arcReadingPractical/);
 assert.match(css,/@media\(max-width:620px\)/);
});
