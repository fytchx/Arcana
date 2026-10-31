import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {WIKI_ARTICLES,WIKI_CONNECTIONS,wikiArticleById} from '../src/wiki-data.js';
import {wikiGuidesView,wikiArticleView,wikiRecordView} from '../src/wiki-views.js';
import {NAV_DESTINATIONS} from '../src/context-nav.js';
import {resumableWorkspaces} from '../src/workspace-hub.js';
import {FARM_TIERS,compareFarm,normalizeFarmPlan,readFarmPlan,saveFarmPlan,farmCompareView} from '../src/farm-compare.js';

test('Six additional source-backed Season 2 articles exist with honest internal links',()=>{
 for(const id of ['guild-planning','pet-affix-costs','forge','gems','rift-raids','drop-rarities']){
  const article=wikiArticleById(id);
  assert.ok(article,id);
  assert.ok(article.sections.length>=3,id);
  assert.ok(article.actions.length>=2,id);
  assert.ok(WIKI_CONNECTIONS[id],id);
  const html=wikiArticleView(article);
  assert.match(html,/arcReadingHead/);
  assert.match(html,/data-action="wikichapters"/);
  assert.doesNotMatch(html,/wikiSectionActions|wikiActionGrid/);
  for(const section of article.sections)assert.ok(section.body||section.table,id+': '+section.title);
 }
 const ids=WIKI_ARTICLES.map(a=>a.id);
 assert.equal(new Set(ids).size,ids.length,'Article IDs must be stable and unique');
 for(const article of WIKI_ARTICLES)if(article.sourceUrl)assert.match(article.sourceUrl,/^https:\/\/idlearc\.com\/patch-notes\//);
});

test('Group-guides view includes each article exactly once',()=>{
 const html=wikiGuidesView();
 assert.match(html,/wikiGuideGroups/);
 for(const article of WIKI_ARTICLES){
  const re=new RegExp('data-params="id='+article.id+'"','g');
  assert.equal([...html.matchAll(re)].length,1,article.id);
 }
});

test('Source-verified equipment and affix records link to appropriate explanations',()=>{
 const sample={id:'game:item:demo',gameKind:'item',slot:'head',title:'Example',description:'Reference',facts:[]};
 assert.match(wikiRecordView(sample,[],'item'),/How the Forge works/);
 const affix={...sample,gameKind:'pet-affix'};
 assert.match(wikiRecordView(affix,[],'pet-affix'),/Pet Affix upgrade guide/);
});

test('Frenzy defeats do not count toward Monster Level XP farming estimates',()=>{
 const article=wikiArticleById('monster-level');
 const section=article.sections.find(x=>x.title==='Frenzy and Monster Level XP');
 assert.ok(section,'Frenzy should have a distinct ML XP explanation in the guide');
 assert.match(section.body,/Frenzy kills do not award Monster Level XP/);
 const farm=farmCompareView({mode:'later',times:[1,1,1]});
 assert.match(farm,/Frenzy kills do not grant Monster Level XP/);
 assert.match(farm,/Exclude Frenzy kills/);
 assert.match(farm,/seconds \/ XP kill/);
 const same=compareFarm({mode:'earlier',times:[1,1,1]});
 assert.equal(same.rows[0].rate,1,'Comparison uses only eligible measured kills, with no Frenzy multiplier');
});

test('ML farming comparator correctly weights post-Murky XP and measured kill times',()=>{
 assert.deepEqual(FARM_TIERS.map(t=>t.factor),[.9,1,1.1]);
 const result=compareFarm({mode:'later',times:[.8,1,1.2]});
 assert.equal(result.leader.id,'weakest');
 assert.ok(Math.abs(result.strongestBreakEven-.8*(1.1/.9))<1e-9);
 const strong=compareFarm({mode:'later',times:[1,1,1]});
 assert.equal(strong.leader.id,'strongest');
 assert.ok(strong.advantage>0);
 const early=compareFarm({mode:'earlier',times:[1,.9,.8]});
 assert.deepEqual(early.rows.map(r=>r.factor),[1,1,1]);
 assert.equal(early.leader.id,'strongest');
});

test('ML comparator does not invent values for missing or invalid timings',()=>{
 const data=compareFarm({mode:'later',times:[null,-1,'bad']});
 assert.equal(data.known.length,0);
 assert.equal(data.leader,null);
 assert.equal(data.strongestBreakEven,null);
 assert.deepEqual(normalizeFarmPlan({times:[0,-1,100000]}).times,[null,null,null]);
 assert.equal(normalizeFarmPlan({mode:'unknown'}).mode,'later');
 assert.match(farmCompareView({times:[]}),/Enter average kill times for at least two monsters/);
 const html=farmCompareView({mode:'later',times:[.8,1,1.5]});
 assert.match(html,/Break-even insight/);
 assert.match(html,/data-route="wiki\/article"/);
 assert.match(farmCompareView({mode:'earlier',times:[]}),/Before Murky Depths/);
});

test('ML comparator local preferences persist without requiring an account',()=>{
 const data=new Map();
 const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 assert.deepEqual(readFarmPlan(storage).times,[null,null,null]);
 const saved=saveFarmPlan({mode:'earlier',times:[.85,1.4,null]},storage);
 assert.deepEqual(readFarmPlan(storage),saved);
 assert.deepEqual(readFarmPlan({getItem:()=>{throw Error('blocked')}}).times,[null,null,null]);
});

test('Workspace home only resumes actual planning or reading, not empty defaults',()=>{
 assert.equal(resumableWorkspaces({}), '');
 assert.equal(resumableWorkspaces({guild:{level:25,events:'',boost:1}}),'');
 const html=resumableWorkspaces({
  draft:{title:'PvE <test>',equipment:{weapon:'sword',ring:null}},
  guild:{level:80,events:'abcf',boost:1},
  compound:{rarity:'rare',bonus:'pet_damage',level:4},
  affix:{affix:'all_skills',currentLevel:1,targetLevel:2},
  recent:[{id:'forge',title:'Forge Guide'}]
 });
 assert.match(html,/Continue Build Studio/);
 assert.match(html,/Continue Guild Planner/);
 assert.match(html,/4\/92 points/);
 assert.match(html,/PvE &lt;test&gt;/);
 assert.match(html,/Keep reading/);
 assert.match(html,/data-route="wiki\/article"/);
 assert.doesNotMatch(html,/<test>/);
});

test('New navigational destinations resolve and sourced guides exist',()=>{
 assert.equal(NAV_DESTINATIONS.farm.route,'calculators/ml-farm');
 assert.equal(wikiArticleById('monster-level').actions[0].route,'calculators/ml-farm');
 for(const key of ['guildGuide','affixGuide','forgeGuide','gemGuide','raidGuide','rarityGuide']){
  const d=NAV_DESTINATIONS[key];
  assert.equal(d.route,'wiki/article');
  assert.ok(wikiArticleById(d.params.id),key);
 }
});

test('Source-backed Wiki guides and game references expose safe share actions',()=>{
 const article=wikiArticleView(wikiArticleById('forge'));
 assert.match(article,/data-action="wikishare" data-arg="forge"/);
 const record=wikiRecordView({id:'game:item:sample',gameKind:'item',title:'Item',facts:[]},[],'item');
 assert.match(record,/data-action="wikirefshare" data-arg="game:item:sample"/);
});

test('Skip navigation and neutral public brand are present',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(html,/class="skipMain" data-action="skipmain"/);
 assert.match(app,/case 'skipmain'/);
 assert.match(app,/case 'wikishare'/);
 assert.match(app,/case 'wikirefshare'/);
 assert.doesNotMatch(html,/CONNECTED PREVIEW/);
 assert.doesNotMatch(app,/Arcana 3\\.0/);
});

test('Integration respects mobile keyboard and removes legacy XP misinformation',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/resumableWorkspaces\(/);
 assert.match(app,/readFarmPlan\(\)/);
 assert.match(app,/case 'calculators\/ml-farm'/);
 assert.match(app,/case 'wikisection'/);
 assert.match(app,/case 'wikitop'/);
 assert.doesNotMatch(app,/same Monster Level XP/);
 assert.doesNotMatch(app,/node\('globalSearch'\)\?\.focus/);
});
