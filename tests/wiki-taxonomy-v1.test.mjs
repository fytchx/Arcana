import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {WIKI_CATEGORIES,wikiCategory,wikiParentCategory,wikiPlannedArticles,wikiCategoriesWithContent,wikiCategoryArticles} from '../src/wiki-taxonomy.js';
import {WIKI_ARTICLES} from '../src/wiki-data.js';
import {wikiLandingView,wikiCategoryView,wikiArticleView,wikiRecordCard,wikiRecordView} from '../src/wiki-views.js';
import {VERIFIED_ITEM_SNAPSHOT} from '../src/verified-item-snapshot.js';
import {resolveOfficialSprite} from '../src/assets.js';
test('approved Wiki tree has 8 unique parents and 30 unique article IDs, ten existing',()=>{
 const entries=wikiPlannedArticles(),ids=entries.map(e=>e.id);
 assert.equal(WIKI_CATEGORIES.length,8);
 assert.equal(entries.length,30);
 assert.equal(entries.filter(e=>e.existing).length,10);
 assert.equal(new Set(ids).size,30);
 assert.equal(new Set(WIKI_CATEGORIES.map(c=>c.id)).size,8);
 assert.equal(ids.filter(id=>id==='guide-builds').length,0,'Legacy guide demonstration stays in Guides instead of polluting mechanics');
 for(const row of entries){assert.equal(wikiParentCategory(row.id)?.id,row.parent);assert.ok(wikiCategory(row.parent));}
 for(const a of WIKI_ARTICLES.filter(a=>ids.includes(a.id)))assert.ok(wikiParentCategory(a.id));
});
test('unfinished articles have no clickable blank pages; categories link only to existing articles',()=>{
 const published=wikiCategoriesWithContent(WIKI_ARTICLES);
 assert.ok(published.some(c=>c.id==='equipment'));
 assert.equal(published.some(c=>c.id==='classes'),false);
 const landing=wikiLandingView({loaded:true,itemCount:300});
 assert.match(landing,/Wiki categories/);
 assert.match(landing,/Item Codex/);
 assert.doesNotMatch(landing,/data-params="id=warrior"/);
 const warriorPage=wikiCategoryView('classes');
 assert.doesNotMatch(warriorPage,/data-route="wiki\/article"/);
 const equipment=wikiCategoryView('equipment');
 assert.match(equipment,/data-params="id=forge"/);
 assert.doesNotMatch(equipment,/data-params="id=awakening"/);
});
test('breadcrumb distinguishes location from actual history Back and does not duplicate home controls',()=>{
 const article=wikiArticleView(WIKI_ARTICLES.find(a=>a.id==='forge'));
 assert.match(article,/aria-label="Wiki breadcrumbs"/);
 assert.match(article,/data-action="wiki-back"/);
 assert.match(article,/Home/);
 assert.match(article,/ArcanaWiki/);
 assert.match(article,/Equipment/);
 assert.match(article,/The Forge/);
 assert.doesNotMatch(article,/All guides<\/button>/);
});
test('only real player equipment uses large Codex artwork; other records use icons',()=>{
 const e=(kind,name)=>({id:'game:'+kind+':test',title:name,gameKind:kind,description:'Reference entry'});
 assert.match(wikiRecordCard(e('item','Broken Sword')),/wikiRecordVisual/);
 assert.match(wikiRecordCard(e('monster','Elder Wraith')),/wikiRecordText/);
 assert.match(wikiRecordCard(e('class-skill','Retaliation')),/wikiRecordText/);
 assert.match(wikiRecordCard(e('currency','Gold')),/wikiRecordText/);
 assert.match(wikiRecordView(e('item','Broken Sword'),[],'item'),/Item Codex/);
});
test('new Season 2 gear has its official sprite, missing older equipment remains honestly unmapped',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../assets/official-art/manifest.json',import.meta.url),'utf8'));
 const newItems=Object.keys(manifest.categories.items.mapping);
 assert.equal(newItems.length,12);
 const equipment=VERIFIED_ITEM_SNAPSHOT.equipment;
 assert.equal(equipment.length,40);
 for(const item of equipment.slice(-12)){
  assert.ok(newItems.includes(item.name.toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-')),item.name);
  assert.ok(resolveOfficialSprite({gameKind:'item',title:item.name},manifest.categories),'Missing season gear artwork: '+item.name);
 }
 const missing=equipment.filter(item=>!resolveOfficialSprite({gameKind:'item',title:item.name},manifest.categories)).map(item=>item.name);
 assert.deepEqual(missing,['Sandals of Starszy','Quiver','Rusty Dagger','Greatsword','Grand Staff','Claws']);
});
