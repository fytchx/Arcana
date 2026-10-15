import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readDesign,writeDesign,resetDesign,DEFAULT_DESIGN} from '../src/design-controls.js';
import {settingsView} from '../src/launch-navigation.js';

test('admin style workshop is hidden from public settings',()=>{
 const guest=settingsView();
 const admin=settingsView({admin:true});
 assert.doesNotMatch(guest,/arcanaDesignLab/);
 assert.doesNotMatch(guest,/arcanaAdminAppearance/);
 assert.match(admin,/arcanaDesignLab/);
 assert.match(admin,/data-design-field="pattern"/);
 assert.match(admin,/data-design-field="roundness"/);
 assert.match(admin,/data-design-field="action"/);
});
test('saved design choices remain validated, isolated, and resettable',()=>{
 const original=globalThis.localStorage,store=new Map();
 try{
  globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
  assert.equal(readDesign().pattern,DEFAULT_DESIGN.pattern);
  assert.equal(writeDesign('pattern','stars'),true);
  assert.equal(writeDesign('glow',73),true);
  assert.equal(writeDesign('main','#112233'),true);
  assert.equal(writeDesign('main','red; background:evil'),false);
  assert.equal(readDesign().pattern,'stars');
  assert.equal(readDesign().glow,73);
  assert.equal(readDesign().main,'#112233');
  assert.equal(resetDesign(),true);
  assert.equal(readDesign().glow,DEFAULT_DESIGN.glow);
 }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original}
});
test('Pathfinder is the one-stop upgrade destination, with four integrated modes',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const board=await readFile(new URL('../src/core-boards.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../arcana-contour.css',import.meta.url),'utf8');
 assert.match(app,/function pathfinderHub\(\)/);
 for(const route of ['timeline','range','upgrade','compare'])assert.ok(app.includes("['"+route+"'"),route);
 assert.match(app,/pathfinderRangeContent\(recipeState.data/);
 assert.match(app,/case 'homemenu':if\(arg==='pathfinder'\)go\('calculators\/pathfinder'\)/);
 assert.match(app,/function skills\(\)\{return '<div class="studioPage studioSubPage">/);
 assert.doesNotMatch(board,/return `\$\{boardSwitch\('passive'\)\}/);
 assert.doesNotMatch(board,/return `\$\{boardSwitch\('class'\)\}/);
 assert.match(css,/pathfinderHubTabs/);
});
