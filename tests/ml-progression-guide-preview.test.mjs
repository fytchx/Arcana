import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ML_ONE_SHOT_MILESTONE_GUIDE as guide} from '../src/ml-one-shot-milestone-guide.js';
import {wikiArticleById,allWikiArticles} from '../src/wiki-data.js';
import {wikiArticleView,wikiGuidesView} from '../src/wiki-views.js';
import {NAV_DESTINATIONS} from '../src/context-nav.js';

const ID='ml-one-shot-milestone-guide-zane';
const section=title=>guide.sections.find(x=>x.title===title);
test('draft stays an explicit, attributed player strategy with real sections',()=>{
 assert.equal(guide.id,ID);
 assert.equal(guide.author,'Zane');
 assert.equal(guide.draft,true);
 assert.equal(guide.source,'player-authored');
 assert.equal(guide.sections.length,10);
 assert.ok(guide.sections.every(s=>s.title&&s.part&&s.body));
 assert.equal(wikiArticleById(ID),guide);
 assert.equal(allWikiArticles().filter(x=>x.id===ID).length,1);
});
test('material exchange guidance preserves 5:1 source but does not invent unlimited exchange',()=>{
 const s=section('What the material exchange changes').body;
 assert.match(s,/five lower-biome monster materials for one selected higher-biome material/);
 assert.match(s,/ML 260/);
 assert.match(s,/check the exchange cost before using it/i);
 assert.match(s,/save the rest/);
});
test('damage priorities are build-specific and never claim all gear slots must be maxed',()=>{
 const s=section('Retaliation Warrior: why the helm comes second').body;
 for(const word of ['Chest','Base helm','Gloves and boots','Rings, belt and amulet','Weapon and shield','Torch'])assert.ok(s.includes(word),word);
 assert.match(s,/doesn't mean every base helm beats Sage/i);
 assert.match(section('How I approach ML').body,/don't try to keep every forge slot equally upgraded/);
 assert.match(section('What about Pet Damage?').body,/haven't tested a full Pet Damage build enough/);
});
test('one shot, +10% ML XP, Frenzy and ML290 example are present',()=>{
 assert.match(section('Choose the monster that keeps dying in one hit').body,/10% more/);
 assert.match(section('Frenzy isn\'t ML XP').body,/don't give Monster Level XP/);
 assert.match(section('When to push and when to upgrade').body,/ML 290/);
 assert.match(section('ML 290 to 300: the actual decision').body,/ML 300/);
});
test('one compact masthead replaces stacked preview cards and tool grids',()=>{
 const page=wikiArticleView(guide);
 assert.match(page,/arcReadingHead/);
 assert.match(page,/PREVIEW DRAFT/);
 assert.match(page,/arcReadingLoop/);
 assert.match(page,/01<\/b> Push ML/);
 assert.match(page,/02<\/b> Upgrade damage/);
 assert.match(page,/data-action="wikichapters"/);
 assert.equal((page.match(/arcReadingHead/g)||[]).length,1);
 assert.doesNotMatch(page,/mlGuideRoute|wikiCompleteToc|wikiArticleActions|wikiSectionActions|wikiActionGrid/);
 assert.match(page,/section-how-i-approach-ml/);
 assert.match(page,/section-retaliation-warrior-why-the-helm-comes-second/);
 assert.match(page,/class="arcReadingInlineLink" data-route="calculators\/pathfinder"/);
 assert.match(page,/data-params="view=ml"/);
 assert.match(page,/data-params="view=range"/);
 assert.equal((page.match(/class="arcReadingInlineLink"/g)||[]).length,2);
 assert.match(wikiGuidesView(),/Grinding Monster Level Efficiently/);
});

test('tool links are source-curated and use valid Pathfinder routes',()=>{
 assert.equal(NAV_DESTINATIONS.mlxp.route,'calculators/pathfinder');
 assert.equal(NAV_DESTINATIONS.mlxp.params.view,'ml');
 assert.equal(NAV_DESTINATIONS.upgrade.params.view,'range');
 assert.equal((guide.sections.map(s=>s.body).join(' ').match(/\[\[tool:/g)||[]).length,2);
 assert.equal(guide.actions.length,0,'Do not render a second tool CTA grid');
});

test('preview holds the shared reading standard without touching the live release',async()=>{
 const [app,views,styles]=await Promise.all(['../src/app.js','../src/wiki-views.js','../reading-standard.css'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
 assert.match(app,/function openGuideChapters/);
 assert.match(views,/arcReadingHead/);
 assert.match(styles,/\.arcReadingLoop/);
 assert.match(styles,/@media\(max-width:620px\)/);
 assert.doesNotMatch(views,/mlGuidePreviewSummary/);
});
