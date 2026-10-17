import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {NAV_DESTINATIONS,NAV_FLOWS,HOME_START,navDestination,navCard,navCards,relatedDestinations,connectedNext,homeStart,routeLinkData} from '../src/context-nav.js';
import {WIKI_ARTICLES,WIKI_CONNECTIONS,WIKI_CATEGORY_LIST,wikiArticleById} from '../src/wiki-data.js';
import {wikiArticleView,wikiRecordView,wikiLibraryView,wikiLandingView} from '../src/wiki-views.js';

const app=()=>readFile(new URL('../src/app.js',import.meta.url),'utf8');
const allRoutes=new Set(['home','labs','calculators','wiki','lfg','labs/build','labs/runes','labs/skills','labs/passives','labs/pets','labs/guild-tree','calculators/pet','calculators/affixes','calculators/upgrade','calculators/pathfinder','calculators/compare','calculators/ml-farm','lfg/raids','lfg/guilds','wiki/guides','wiki/article','wiki/library']);

test('Every recommended next step has an actual registered destination',()=>{
 for(const [page,keys] of Object.entries(NAV_FLOWS)){
  assert.ok(allRoutes.has(page)||page.startsWith('lfg/guild'),page);
  assert.ok(keys.length>=2,page);
  assert.equal(new Set(keys).size,keys.length,page+' repeats links');
  for(const key of keys)assert.ok(navDestination(key),page+' -> '+key);
 }
 for(const key of HOME_START)assert.ok(navDestination(key));
});

test('Each destination points to a supported app route, not an invented wiki page',()=>{
 for(const [key,d] of Object.entries(NAV_DESTINATIONS)){
  if(d.action){assert.equal(d.action,'search');continue;}
  assert.ok(allRoutes.has(d.route),key+': '+d.route);
  assert.ok(d.label&&d.detail&&d.icon,key);
  if(d.route==='wiki/article')assert.ok(wikiArticleById(d.params.id),key);
  if(d.route==='wiki/library')assert.ok(WIKI_CATEGORY_LIST.some(([kind])=>kind===d.params.kind),key);
 }
});

test('Curated editorial connections resolve to real guides, categories and tools',()=>{
 for(const [articleId,relation] of Object.entries(WIKI_CONNECTIONS)){
  assert.ok(wikiArticleById(articleId));
  for(const key of relation.articles||[])assert.ok(wikiArticleById(key),articleId+' -> '+key);
  for(const kind of relation.collections||[])assert.ok(WIKI_CATEGORY_LIST.some(([k])=>k===kind),articleId+' -> '+kind);
  for(const key of relation.tools||[])assert.ok(navDestination(key),articleId+' -> '+key);
  const headings=new Set(wikiArticleById(articleId).sections.map(s=>s.title));
  for(const [heading,links] of Object.entries(relation.sectionLinks||{})){
   assert.ok(headings.has(heading),articleId+': '+heading);
   for(const key of links)assert.ok(navDestination(key),articleId+': '+key);
  }
 }
});

test('Context cards emit navigable controls with escaped labels and query params',()=>{
 const card=navCard({label:'Danger <test>',detail:'Use & inspect',route:'wiki/library',params:{kind:'pet-affix'},icon:'paw'});
 assert.match(card,/data-route="wiki\/library"/);
 assert.match(card,/data-params="kind=pet-affix"/);
 assert.match(card,/Danger &lt;test&gt;/);
 assert.match(card,/Use &amp; inspect/);
 assert.ok(!card.includes('<test>'));
 assert.equal(navDestination('does-not-exist'),null);
 assert.ok(routeLinkData(navDestination('search')).includes('data-action="search"'));
 assert.match(navCards(['items','items','guides']),/Browse equipment/);
 assert.equal((navCards(['items','items']).match(/arcanaConnection compact/g)||[]).length,0);
});

test('Tool journeys and home quick actions are rendered with real controls',()=>{
 const panel=connectedNext('labs/guild-tree');
 assert.match(panel,/Recommended next steps/);
 assert.match(panel,/Find a guild/);
 assert.match(panel,/Read player guides|Season 2 essentials/);
 assert.equal(connectedNext('wiki/article'),'');
 assert.equal(connectedNext('home'),'');
 assert.match(homeStart(),/What do you want to do/);
 assert.equal(relatedDestinations('calculators/affixes').length,3);
});

test('Wiki articles link to inline tools and curated related guide pages',()=>{
 for(const article of WIKI_ARTICLES){
  const html=wikiArticleView(article);
  assert.match(html,/Continue in Arcana/);
  assert.match(html,/Related guides and game records/);
  assert.match(html,/data-route="wiki\/article"/);
 }
 const season=wikiArticleView(wikiArticleById('season-2'));
 assert.match(season,/wikiSectionActions/);
 assert.match(season,/data-route="labs\/guild-tree"/);
 const pet=wikiArticleView(wikiArticleById('pet-compound'));
 assert.match(pet,/Pet Affix Cost Calculator|Calculate pet affix costs/);
});

test('Codex records connect to the correct calculators for different mechanics',()=>{
 const record=(kind,id='game:test')=>({id,gameKind:kind,title:'Reference',description:'Source-backed record',facts:[]});
 const affix=wikiRecordView(record('pet-affix'),[],'pet-affix');
 assert.match(affix,/Pet Affix Cost Calculator/);
 assert.doesNotMatch(affix,/Pet Compound Calculator/);
 const bonus=wikiRecordView(record('pet-bonus'),[],'pet-bonus');
 assert.match(bonus,/Pet Compound Calculator/);
 const item=wikiRecordView(record('item'),[],'item');
 assert.match(item,/Equip in Build Studio/);
 assert.match(item,/data-arg="game:test"/);
 assert.match(wikiRecordView(record('rune'),[],'rune'),/How rune grids unlock/);
});

test('Wiki collection and home include obvious connected destinations',()=>{
 const html=wikiLandingView({loaded:true,itemCount:200});
 assert.match(html,/wikiV1Categories/);
 assert.match(html,/Item Codex/);
 const library=wikiLibraryView({category:'item',entries:[],loaded:true});
 assert.match(library,/wikiCollectionNext/);
 assert.match(library,/Compare equipment/);
});

test('Application keeps connected destinations and exposes a universal home path',async()=>{
 const code=await app();
 assert.doesNotMatch(code,/globalHomeBar\(dest\)/);
  assert.match(code,/node\('content'\)\.innerHTML=simpleBackBar\(dest\)\+siteNoticeMarkup\(dest\)\+routeView\(\)/);
 assert.ok(code.includes('function home(){return homeScreen()}'));
 assert.match(code,/case 'directory':return directoryView\(\)/);
 assert.match(code,/case 'wiki\/category':return wikiCategory/);
 assert.match(code,/case 'homemenu':if\(arg==='pathfinder'\)go\('calculators\/pathfinder'\)/);
 assert.match(code,/case 'labs':return buildStudio\(\)/);
 assert.match(code,/node\('searchBtn'\)\.onclick/);
 assert.match(code,/data-route="home"/);
 assert.match(code,/SEARCHABLE_TOOLS/);
 assert.match(code,/searchExtras\(\)\.find\(x=>x\.id===id\)/);
 assert.match(code,/__prevWikiX/);
 assert.match(code,/__prevGuildX/);
});
