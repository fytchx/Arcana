import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {HOME_CARDS,HOME_MENUS,DIRECTORY,WIKI_TOPICS,homeScreen,homeSubmenu,directoryView,wikiTopicView,userCenterView,settingsView} from '../src/launch-navigation.js';

const routes=new Set(['home','directory','user','recent','settings','wiki','wiki/about','wiki/topics','wiki/topic','wiki/article','wiki/guides','wiki/library','wiki/studio','labs/build','labs/runes','labs/passives','labs/skills','labs/guild-tree','calculators/upgrade','calculators/compare','calculators/pet','calculators/affixes','calculators/ml-farm','community','community/create','account','beta','lfg/raids','lfg/guilds']);
test('six home cards open real submenu groups',()=>{
 assert.deepEqual(HOME_CARDS.map(x=>x.title),['Wiki','Tools','Guides','Builds','Codex','Guild & Raid Finder']);
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
  assert.ok(group.title&&group.links.length>=4,id);
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
  assert.match(html,/Navigation is ready/);
  assert.ok(html.includes(topic.title));
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
 assert.match(app,/launchReturnHome/);
 assert.match(app,/data-route="home"/);
 assert.match(app,/showHomeMenu/);
 assert.match(settingsView(),/data-app-pref="reduceMotion"/);
});
