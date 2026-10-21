import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {HOME_CARDS,HOME_MENUS,homeScreen,homeSubmenu} from '../src/launch-navigation.js';

test('Home discovery gives each primary tile a distinct purpose',()=>{
 const titles=HOME_CARDS.map(card=>card.title);
 assert.deepEqual(titles,['Pathfinder','Tools','Guilds & Community']);
 assert.equal(new Set(HOME_CARDS.map(card=>card.id)).size,3);
 assert.equal(HOME_CARDS.some(card=>card.id==='builds'),false);
 assert.ok(HOME_MENUS.social.links.some(link=>link.route==='guilds'),'Guild Hub remains reachable');
 assert.ok(HOME_MENUS.social.links.some(link=>link.route==='lfg/raids'),'Raid listings remain reachable');
 assert.match(homeSubmenu('social'),/Guilds &amp; Community/);
});

test('Guides, builds, Wiki, Guilds, Pathfinder and calculators have six distinct home tiles',()=>{
 const html=homeScreen();
 assert.equal((html.match(/class="atlasTile"/g)||[]).length,6);
 for(const route of ['wiki/guides','community','wiki','guilds','calculators/pathfinder'])assert.ok(html.includes('data-route="'+route+'"'),'Missing direct route: '+route);
 assert.match(html,/data-action="homemenu" data-arg="tools"/);
 assert.equal((html.match(/data-journal-latest/g)||[]).length,1);
 assert.ok(html.indexOf('class="atlasHero"')<html.indexOf('class="atlasTileGrid"'));
});
test('Mobile guide shortcuts remain compact and motion-safe',async()=>{
 const css=await readFile(new URL('../arcana-connected-ux.css',import.meta.url),'utf8');
 const footer=css.split('/* Distinct home destinations: compact guide shortcuts instead of a second oversized hub. */')[1];
 assert.ok(footer,'expected scoped responsive home changes');
 assert.match(footer,/@media\(max-width:800px\)/);
 assert.match(footer,/min-height:66px!important/);
 assert.match(footer,/\.arcanaKnowledgeBridge/);
 const app=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.match(app,/arcana-first-paint-loader/);
 assert.match(app,/arcana-boot-control/);
});
