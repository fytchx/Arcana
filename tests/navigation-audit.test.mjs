import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {NAV_DESTINATIONS,NAV_FLOWS,connectedNext} from '../src/context-nav.js';
import {HOME_CARDS,HOME_MENUS,DIRECTORY,settingsView} from '../src/launch-navigation.js';
const source=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('all menu targets and navigation flow entries resolve to implemented pages',async()=>{
 const app=await source('src/app.js');
 const implemented=new Set([...app.matchAll(/case '([^']+)':/g)].map(x=>x[1]));
 const targets=[...Object.values(NAV_DESTINATIONS),...Object.values(HOME_MENUS).flatMap(x=>x.links),...DIRECTORY];
 for(const entry of targets){if(entry.route)assert.ok(implemented.has(entry.route),'Missing route: '+entry.route);}
 for(const values of Object.values(NAV_FLOWS))for(const key of values)assert.ok(NAV_DESTINATIONS[key],'Unknown related nav key: '+key);
});
test('primary screens do not repeat their dock entries or gear-tool panels',async()=>{
 const app=await source('src/app.js');
 assert.equal(HOME_CARDS.length,3);
 assert.equal(new Set(HOME_CARDS.map(x=>x.id)).size,3);
 assert.equal(HOME_MENUS.tools.links.some(x=>['calculators/upgrade','calculators/compare','calculators/pathfinder'].includes(x.route)),false);
 assert.equal(HOME_MENUS.pathfinder.links.filter(x=>x.route==='calculators/pathfinder').length,4);
 assert.equal(new Set(HOME_MENUS.pathfinder.links.filter(x=>x.route==='calculators/pathfinder').map(x=>x.params?.view||'timeline')).size,4);
 assert.equal(DIRECTORY.length,new Set(DIRECTORY.map(x=>x.route+'?'+JSON.stringify(x.params||{}))).size);
 const options=app.slice(app.indexOf('function menu(){'),app.indexOf('function themeColorPreview'));
 assert.doesNotMatch(options,/Useful destinations/);
 assert.doesNotMatch(options,/<strong>User Center<\/strong>/);
 assert.doesNotMatch(app.slice(app.indexOf('const LINKS='),app.indexOf('const BUILD_SLOTS=')),/\['home','Home'/);
});
test('all gear upgrade routes use Pathfinder tabs without duplicated total calculator',async()=>{
 const app=await source('src/app.js'),view=await source('src/pathfinder-timeline-view.js'),css=await source('arcana-contour.css');
 assert.match(app,/case 'calculators\/upgrade':return pathfinderHub\('range'\)/);
 assert.match(app,/case 'calculators\/compare':return pathfinderHub\('compare'\)/);
 assert.match(app,/includeRange:false/);
 assert.match(view,/options.includeRange===false/);
 assert.match(css,/PATHFINDER PHONE LAYOUT/);
 assert.match(css,/\.pathfinderHubTabs\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.equal(connectedNext('calculators/pathfinder'),'');
 assert.equal(connectedNext('labs/passives'),'');
});
test('public settings expose accessibility only, never admin design controls',()=>{
 const guest=settingsView(),admin=settingsView({admin:true});
 for(const page of [guest,admin]){
  assert.match(page,/Reduce motion/);
  assert.doesNotMatch(page,/data-design-field=|data-action="accent"|slateAccentChoice|arcanaDesignLab/);
 }
});
