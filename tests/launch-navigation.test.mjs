import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {HOME_CARDS,HOME_MENUS,DIRECTORY,WIKI_TOPICS,homeScreen,homeSubmenu,directoryView,wikiTopicView,userCenterView,settingsView} from '../src/launch-navigation.js';
import {ACCENT_PRESETS,selectedAccent,setAccent,themeStatus} from '../src/theme.js';

const routes=new Set(['home','directory','user','recent','settings','icons','wiki','wiki/about','wiki/topics','wiki/topic','wiki/category','wiki/items','wiki/article','wiki/guides','wiki/library','wiki/studio','labs/build','labs/runes','labs/passives','labs/skills','labs/guild-tree','calculators/upgrade','calculators/pathfinder','calculators/compare','calculators/pet','calculators/affixes','calculators/ml-farm','community','community/create','account','beta','lfg/raids','lfg/guilds']);
test('six home cards open real submenu groups',()=>{
 assert.deepEqual(HOME_CARDS.map(x=>x.title),['Wiki','Tools','Guides','Builds','Pathfinder','Guild & Raid Finder']);
 const html=homeScreen();
 assert.equal((html.match(/data-action="homemenu"/g)||[]).length,6);
 assert.match(html,/BUILD STUDIO|Build Studio/);
 assert.match(html,/data-route="labs\/build"/);
 assert.match(html,/Useful &amp; Featured/);
 assert.match(html,/data-route="directory"/);
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
 assert.match(html,/id="searchBtn"/);
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
 assert.ok(styles.includes('/launch-navigation.css'),'Launch stylesheet is required for mobile navigation');
 for(const stylesheet of styles){
  assert.ok(whitelist[1].includes("'"+stylesheet+"'"),stylesheet+' is blocked by server.mjs (HTTP 404)');
 }
});

test('Slate keeps every original accent and saves personal selection safely',async()=>{
 assert.equal(ACCENT_PRESETS.length,10);
 assert.deepEqual(ACCENT_PRESETS.map(x=>x.name),[
  'Neon Green','Arcane Violet','Cyan Blue','Magenta Pink','Amber Gold',
  'Crimson Red','Ice Teal','Electric Lime','Royal Indigo','White Silver']);
 const previous=globalThis.localStorage;
 const saved=new Map();
 try{
  globalThis.localStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
  assert.equal(selectedAccent(),'arcane-violet');
  assert.doesNotMatch(settingsView(),/slateAccentGrid/);
  assert.match(settingsView(),/Design Workshop · Locked/);
  assert.match(settingsView(),/Discord login is not configured/);
  assert.equal((settingsView({admin:true}).match(/class="slateAccentChoice/g)||[]).length,10);
  assert.equal(setAccent('cyan-blue'),true);
  assert.equal(selectedAccent(),'cyan-blue');
  assert.equal(themeStatus().palette.highlight,'#13C5F4');
  assert.equal(themeStatus().palette.main,'#0D1019');
  assert.match(settingsView({admin:true}),/data-arg="cyan-blue" aria-pressed="true"/);
  assert.equal(setAccent('not-a-theme'),false);
  assert.equal(selectedAccent(),'cyan-blue');
  assert.equal(setAccent('site'),true);
  assert.equal(selectedAccent(),'site');
 }finally{
  if(previous===undefined)delete globalThis.localStorage;
  else globalThis.localStorage=previous;
 }
 const css=await readFile(new URL('../launch-navigation.css',import.meta.url),'utf8');
 assert.match(css,/ARCANA SLATE/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)/);
});
