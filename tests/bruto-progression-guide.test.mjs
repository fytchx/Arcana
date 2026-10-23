import test from 'node:test';
import assert from 'node:assert/strict';
import {BRUTO_PROGRESSION_GUIDE as guide} from '../src/bruto-progression-guide.js';
import {WIKI_ARTICLES, wikiArticleById, wikiArticleEntries} from '../src/wiki-data.js';
import {wikiArticleView,wikiArticleCard,wikiGuidesView,wikiCategoryView} from '../src/wiki-views.js';
import {wikiParentCategory} from '../src/wiki-taxonomy.js';
import {NAV_DESTINATIONS} from '../src/context-nav.js';

test('BruTo guide is discoverable, authored and explicitly permissioned',()=>{
 assert.equal(WIKI_ARTICLES.filter(a=>a.id===guide.id).length,1);
 assert.equal(wikiArticleById(guide.id),guide);
 assert.equal(wikiParentCategory(guide.id)?.id,'progression');
 assert.equal(guide.author,'BruTo');assert.equal(guide.publishedBy,'Zane');
 assert.match(wikiArticleView(guide),/Published on Arcana by Zane with BruTo’s permission/);
 assert.match(wikiArticleCard(guide),/Guide by BruTo/);
 assert.match(wikiGuidesView(),/BruTo’s Season 2 Progression/);
 assert.match(wikiCategoryView('progression'),/bruto-season-2-progression/);
 assert.ok(wikiArticleEntries().some(a=>a.route==='wiki/article?id='+guide.id));
});
test('guide keeps core original strategy, math and links intact',()=>{
 const combined=guide.sections.map(s=>s.title+' '+s.body).join(' ');
 for(const phrase of ['one-shot','yellow-name','blue-name','Goblin invasions','Primeval Cores','100 kills','+10% ML XP','−10% ML XP','Gold Dungeon','Pet Dungeon','ACS','Kingdom Ransom','Wisdom','Fortune','ML 300','16.7%','2.38%','100%']) assert.ok(combined.includes(phrase),'Missing '+phrase);
 assert.ok(guide.sections.length>=14);
 assert.ok(guide.sections.some(s=>s.table&&s.table.length>=4));
 for(const action of guide.actions){assert.ok(action.route);assert.ok(['calculators/pathfinder','calculators/ml-farm','labs/pets','labs/runes','labs/build'].includes(action.route));}
 assert.ok(NAV_DESTINATIONS.pathfinder);
 const markup=wikiArticleView(guide);
 assert.match(markup,/ON THIS PAGE/);
 assert.match(markup,/USEFUL LINKS/);
 assert.match(markup,/Keep these tools close/);
 assert.doesNotMatch(markup,/wikiSectionActions/,'Guide tools should live in one useful-links section, not recur between sections');
 assert.equal((markup.match(/class="wikiAction"/g)||[]).length,guide.actions.length);
 assert.match(markup,/Community strategy/);
 assert.doesNotMatch(markup,/Originally published at/);
});
