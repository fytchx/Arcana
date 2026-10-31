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
 assert.match(s,/five lower-biome monster materials for one chosen higher-biome material/);
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
 assert.match(section('ML 290 to 300, and how Arcana helps').body,/ML 300/);
});
test('wiki guide supports reader navigation, tool links and preview-only banner',()=>{
 const page=wikiArticleView(guide);
 assert.match(page,/mlGuideRoute/);
 assert.match(page,/PREVIEW ONLY/);
 assert.match(page,/wikiCompleteGuide/);
 assert.match(page,/wikiCompleteToc/);
 assert.match(page,/data-action="wikichapters"/);
 assert.match(page,/data-action="wikisection"/);
 assert.match(page,/section-how-i-approach-ml/);
 assert.match(page,/section-retaliation-warrior-why-the-helm-comes-second/);
 assert.match(page,/view=ml/);
 assert.match(page,/data-arg="calculators\/affixes"/);
 assert.match(wikiGuidesView(),/Grinding Monster Level Efficiently/);
});
test('ML XP link is explicit and matches Pathfinder tab',()=>{
 assert.equal(NAV_DESTINATIONS.mlxp.route,'calculators/pathfinder');
 assert.equal(NAV_DESTINATIONS.mlxp.params.view,'ml');
 const labels=new Set(guide.actions.map(x=>x.route));
 for(const key of ['calculators/pathfinder?view=ml','calculators/pathfinder?view=range','calculators/affixes','calculators/pet'])
  assert.ok(labels.has(key),key);
});
test('guide exists on this preview feature branch without modifying live route mechanics',async()=>{
 const [app,views,styles]=await Promise.all(['../src/app.js','../src/wiki-views.js','../season2-guide.css'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
 assert.match(app,/ml-one-shot-milestone-guide-zane/);
 assert.match(views,/mlGuidePreviewSummary/);
 assert.match(styles,/\.mlGuideRouteSteps/);
 assert.match(styles,/@media\(max-width:690px\)/);
});
