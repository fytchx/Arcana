import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {homeScreen,designPanel} from '../src/launch-navigation.js';
import {DEFAULT_DESIGN,DESIGN_FIELDS,validateDesignField,normalizeDesignHex} from '../src/design-controls.js';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('Atlas homepage has a focused hero, two-column mobile grid and six real destinations',async()=>{
 const home=homeScreen(),css=await read('home-atlas.css');
 assert.equal((home.match(/class="atlasTile"/g)||[]).length,6);
 assert.equal((home.match(/data-journal-latest/g)||[]).length,1);
 assert.match(home,/src="\/assets\/arcana-logo.webp"/);
 for(const name of ['Pathfinder','Calculators','ArcanaWiki','Guilds','Builds','Guides'])assert.match(home,new RegExp('>'+name+'<'));
 assert.ok(home.indexOf('atlasHero')<home.indexOf('atlasTileGrid'));
 assert.ok(home.indexOf('atlasTileGrid')<home.indexOf('atlasJournal'));
 assert.match(css,/\.atlasTileGrid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(min-width:760px\)/);
 assert.match(css,/@media\(max-width:520px\)/);
});
test('panel, icon-box and icon-glyph colors are separately validated and editable',async()=>{
 const markup=designPanel({showPreview:false});
 for(const key of ['card','iconBox','iconGlyph']){
  assert.ok(DESIGN_FIELDS.includes(key),'Missing draft field '+key);
  assert.match(markup,new RegExp('data-design-field="'+key+'"'));
  assert.match(markup,new RegExp('data-design-hex="'+key+'"'));
  assert.match(DEFAULT_DESIGN[key],/^#[0-9A-F]{6}$/i);
  assert.equal(validateDesignField(key,'#239AFF'),'#239AFF');
  assert.equal(validateDesignField(key,'not-a-color'),null);
 }
 assert.equal(normalizeDesignHex('239aff'),'#239AFF');
 const [controls,frame,mini]=await Promise.all([read('src/design-controls.js'),read('src/theme-live-frame.js'),read('src/design-mini-preview.js')]);
 for(const key of ['--arcana-atlas-panel','--arcana-atlas-icon-box','--arcana-atlas-icon']){
  assert.ok(controls.includes(key),'Main theme renderer missing '+key);
  assert.ok(frame.includes(key),'Embedded real preview missing '+key);
 }
 for(const key of ['--mini-icon-box','--mini-icon'])assert.ok(mini.includes(key));
});
test('Atlas stylesheet is attached to the actual app and served through the approved static allowlist',async()=>{
 const [index,server,css]=await Promise.all([read('index.html'),read('server.mjs'),read('home-atlas.css')]);
 assert.match(index,/home-atlas\.css\?v=/);
 assert.match(server,/'\/home-atlas.css'/);
 for(const cssVar of ['--atlas-panel','--atlas-icon-box','--atlas-icon'])assert.ok(css.includes(cssVar));
});
