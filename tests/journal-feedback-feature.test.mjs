import test from 'node:test';
import assert from 'node:assert/strict';
import {JOURNAL_SEEDS} from '../src/journal-seeds.mjs';
import {journalIndexView,journalArticleView} from '../src/journal-views.js';

const slug='help-shape-arcana';
test('featured feedback invitation contains available tools and functioning feedback actions',()=>{
 const article=JOURNAL_SEEDS.find(x=>x.slug===slug);
 assert.ok(article,'new featured story must exist');
 assert.equal(article.featured,true);
 assert.equal(article.published,true);
 assert.equal(article.category,'Community');
 assert.match(article.body,/Pathfinder/);
 assert.match(article.body,/Pet affix and compound calculators/);
 assert.match(article.body,/Upgrade Optimizer/);
 assert.match(article.body,/Founding Beta Tester/);
 const html=journalArticleView({article,articles:JOURNAL_SEEDS});
 assert.match(html,/data-route="beta"/);
 assert.match(html,/data-route="community"/);
 assert.match(html,/Help shape what comes next/);
 assert.doesNotMatch(html,/\[\[arcana-feedback-cta\]\]/);
});
test('feedback story receives featured tile in Journal index',()=>{
 const article=JOURNAL_SEEDS.find(x=>x.slug===slug);
 const html=journalIndexView({articles:[article]});
 assert.match(html,/journalStoryFeatured/);
 assert.match(html,/help-shape-arcana/);
});
