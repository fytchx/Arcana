import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {HOME_CARDS,HOME_MENUS,DIRECTORY,WIKI_TOPICS,homeScreen,homeSubmenu,directoryView,wikiTopicView,userCenterView,settingsView} from '../src/launch-navigation.js';
import {ACCENT_PRESETS,selectedAccent,setAccent,themeStatus} from '../src/theme.js';

const routes=new Set(['journal','journal/article','journal-studio','journal-balance','home','directory','user','recent','settings','icons','wiki','wiki/about','wiki/topics','wiki/topic','wiki/category','wiki/items','wiki/article','wiki/guides','wiki/library','wiki/studio','labs/build','labs/runes','labs/passives','labs/skills','labs/guild-tree','calculators/upgrade','calculators/pathfinder','calculators/compare','calculators/pet','calculators/affixes','calculators/ml-farm','calculators/damage','calculators/optimizer','records','staff','community','community/create','account','beta','lfg/raids','lfg/guilds','guilds','guilds/crest']);
test('six Atlas tiles open real Arcana destinations',()=>{
 assert.deepEqual(HOME_CARDS.map(x=>x.title),['Pathfinder','Tools','Guilds & Community']);
 const html=homeScreen();
 assert.equal((html.match(/class="atlasTile"/g)||[]).length,6);
 assert.equal((html.match(/data-action="homemenu"/g)||[]).length,1);
 assert.match(html,/data-route="labs\/build"/);
 assert.match(html,/data-route="calculators\/pathfinder"/);
 assert.match(html,/data-action="homemenu" data-arg="tools"/);
 for(const route of ['wiki/guides','wiki','community','calculators/ml-farm','directory'])assert.match(html,new RegExp('data-route="'+route+'"'));
 for(const card of HOME_CARDS){const popup=homeSubmenu(card.id);assert.ok(popup.includes(card.title.replaceAll('&','&amp;')));assert.match(popup,/launchNavRow/);}
});
test('all submenu and A-Z destinations are resolvable routes',()=>{
 for(const [id,group] of Object.entries(HOME_MENUS)){
  assert.ok(group.title&&group.links.length>=(id==='pathfinder'?1:4),id);
  for(const destination of group.links)assert.ok(routes.has(destination.route),id+' -> '+destination.route);
 }
 assert.ok(DIRECTORY.length>20);
 for(const item of DIRECTORY)assert.ok(routes.has(item.route),item.label);
 assert.deepEqual([...DIRECTORY].map(x=>x.label).sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})),DIRECTORY.map(x=>x.label));
 assert.match(directoryView(),/Explore Arcana A–Z/);
  assert.doesNotMatch(directoryView(),/data-route="calculators\/(damage|optimizer)"/);
  assert.doesNotMatch(directoryView(true),/data-route="calculators\/(damage|optimizer)"/);
  assert.ok(!HOME_MENUS.tools.links.some(link=>link.route==='calculators/damage'));
});
test('topic shells are navigable, safely escaped and do not invent article content',()=>{
 for(const topic of WIKI_TOPICS){
  const html=wikiTopicView(topic.slug);
  assert.match(html,/View published articles/);
  assert.ok(html.includes(topic.title.replaceAll('&','&amp;')));
  assert.match(html,/data-route/);
 }
 assert.equal(wikiTopicView('no-such-topic'),null);
 const profile=userCenterView({displayName:'Tester <unsafe>'});
 assert.match(profile,/Tester &lt;unsafe&gt;/);
 assert.doesNotMatch(profile,/<unsafe>/);
 assert.match(profile,/data-route="recent"/);
 assert.match(profile,/data-route="settings"/);
});
test('global home control is registered and the old bottom nav is absent',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 assert.doesNotMatch(html,/id="adminPortalBtn"/);
 assert.match(html,/class="launchTopRight"><button type="button" class="launchAccount" id="accountBtn"/);
  assert.match(html,/data-dock="search"/);
  assert.doesNotMatch(html,/id="searchBtn"/);
 assert.match(html,/id="accountBtn"/);
 assert.doesNotMatch(html,/id="bottomNav"/);
 assert.doesNotMatch(app,/function globalHomeBar/);
  assert.match(html,/id="arcanaDock"/);
 assert.match(app,/data-route="home"/);
 assert.match(app,/showHomeMenu/);
 assert.match(settingsView(),/data-app-pref="reduceMotion"/);
});

test('every homepage stylesheet is publicly served by the Arcana server',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 const whitelist=server.match(/const publicPage=new Set\(\[([^\]]+)\]\)\.has\(normalized\)/);
 assert.ok(whitelist,'Expected static document allowlist was changed: update this regression check');
 const styles=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="(\/[^"?]+)(?:\?[^\"]*)?"/g)].map(match=>match[1]);
 assert.deepEqual(styles,['/arcana-site.css'],'Home must load one bundled stylesheet');
 assert.match(server,/pathname==='\/arcana-site\.css'/,'Bundled stylesheet endpoint must be public');
 assert.match(server,/siteCssBundle\(ROOT\)/,'Server must serve the authored CSS in stable order');
 assert.ok(whitelist[1].includes("'/launch-navigation.css'"),'Launch CSS source must remain available for compatibility');
});

test('only administrators set appearance; users can keep reduced motion',async()=>{
 assert.equal(ACCENT_PRESETS.length,10);
 assert.deepEqual(ACCENT_PRESETS.map(x=>x.name),[
  'Neon Green','Arcane Violet','Cyan Blue','Magenta Pink','Amber Gold',
  'Crimson Red','Ice Teal','Electric Lime','Royal Indigo','White Silver']);
 const publicSettings=settingsView(),adminSettings=settingsView({admin:true});
 assert.doesNotMatch(publicSettings,/slateAccentGrid|arcanaDesignLab|Design Workshop · Locked/);
 assert.doesNotMatch(adminSettings,/data-action="accent"|data-design-field=/);
 assert.match(publicSettings,/Reduce motion/);
 assert.match(publicSettings,/managed centrally by Arcana administrators/);
 const css=await readFile(new URL('../launch-navigation.css',import.meta.url),'utf8');
 assert.match(css,/ARCANA SLATE/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)/);
});


test('Atlas home leads with six tools, then a featured guide and dynamic Journal',async()=>{
 const html=homeScreen();
 assert.match(html,/class="atlasUpdate"/);
 assert.match(html,/class="atlasHero atlasGuideHighlight"/);
 assert.match(html,/class="atlasTileGrid"/);
 assert.match(html,/class="atlasJournal"/);
 assert.match(html,/hallowed-harvest-2026-guide/);
  assert.match(html,/data-seasonal-feature/);
  assert.doesNotMatch(html,/IdleArc 1\.3\.7: A Step Forward/);
 assert.ok(html.indexOf('atlasTileGrid')<html.indexOf('atlasHero'));
 assert.ok(html.indexOf('atlasTileGrid')<html.indexOf('atlasJournal'));
 assert.equal((html.match(/class="atlasTile"/g)||[]).length,6);
 const stylesheet=await readFile(new URL('../home-atlas.css',import.meta.url),'utf8');
 assert.match(stylesheet,/\.atlasHome/);
 assert.match(stylesheet,/\.atlasTileGrid/);
 assert.match(stylesheet,/@media\(max-width:520px\)/);
});

