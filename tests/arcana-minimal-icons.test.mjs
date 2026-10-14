import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {ICON_CATEGORIES,ICON_DEFS,ICON_IDS,arcanaIcon,iconAssetPath} from '../src/arcana-icons.js';
import {icon} from '../src/ui.js';
import {settingsView,iconGalleryView} from '../src/launch-navigation.js';
import {SITE_SURFACES,ICON_MODES,selectedSiteSurface,selectedIconColor,selectedIconMode,setSiteSurface,setIconColor,setIconMode,selectedAccent,setAccent,themeStatus,ACCENT_PRESETS} from '../src/theme.js';

test('full Arcana Minimal asset catalog is complete, original and individually downloadable',async()=>{
 assert.ok(ICON_IDS.length>=140);
 assert.equal(new Set(ICON_IDS).size,ICON_IDS.length);
 assert.deepEqual(Object.keys(ICON_CATEGORIES).sort(),['classes','currencies','equipment','features','stats','ui']);
 assert.equal(ICON_CATEGORIES.classes.length,5);
 assert.equal(ICON_CATEGORIES.equipment.length,13);
 assert.ok(ICON_CATEGORIES.features.length>=17);
 assert.ok(ICON_CATEGORIES.stats.length>=30);
 for(const [group,ids] of Object.entries(ICON_CATEGORIES)){
  assert.ok(ids.length>0,group);
  for(const id of ids){
   assert.equal(ICON_DEFS[id].category,group,id);
   assert.ok(ICON_DEFS[id].shape.includes('<'),id);
   const location=iconAssetPath(id);
   assert.equal(location,'/assets/icons/arcana-minimal/'+group+'/'+id+'.svg');
   const contents=await readFile(new URL('..'+location,import.meta.url),'utf8');
   assert.match(contents,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
   assert.match(contents,/stroke="currentColor"/,id);
   assert.ok(contents.length>125,id);
   assert.doesNotMatch(contents,/<script|onload=|<foreignObject|<image|href="http/i,id);
   assert.ok((await stat(new URL('..'+location,import.meta.url))).size>125);
  }
 }
 const manifest=JSON.parse(await readFile(new URL('../assets/icons/arcana-minimal/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.iconCount,ICON_IDS.length);
 assert.equal(manifest.themeable,true);
});
test('all legacy app and studio icons render from the new registry',()=>{
 for(const id of ['home','search','menu','calculator','flask','users','book','arrow','back','box','shield','cog','paw','gem','sword','layers','git','compare','bookmark','clock','close','check','plus','edit','sliders','spark','link','info']){
  assert.match(icon(id,20),new RegExp('data-arcana-icon="'+id+'"'));
 }
 for(const id of ['equipment-chest','equipment-weapon','class-warrior','class-archer','class-mage','class-rogue','class-druid','feature-build-studio','feature-rune-forge','stat-crit-chance','currency-ruby']){
  assert.match(arcanaIcon(id,30),new RegExp('data-arcana-icon="'+id+'"'));
 }
 assert.match(arcanaIcon('not-an-icon',30),/data-arcana-icon="box"/);
});
test('site skins and icon modes stay independently customizable and survive readback',()=>{
 const original=globalThis.localStorage;
 const values=new Map();
 try{
  globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  assert.equal(selectedSiteSurface(),'slate');
  assert.equal(selectedAccent(),'arcane-violet');
  assert.equal(selectedIconColor(),'follow-site');
  assert.equal(selectedIconMode(),'two-tone');
  assert.equal(SITE_SURFACES.length,5);
  assert.equal(ICON_MODES.length,4);
  assert.equal(ACCENT_PRESETS.length,10);
  assert.equal(setSiteSurface('midnight'),true);
  assert.equal(setAccent('crimson-red'),true);
  assert.equal(setIconColor('cyan-blue'),true);
  assert.equal(setIconMode('accent'),true);
  assert.equal(themeStatus().palette.main,'#080E19');
  assert.equal(themeStatus().palette.secondary,'#142039');
  assert.equal(themeStatus().palette.highlight,'#EC464D');
  assert.equal(themeStatus().iconColor,'#13C5F4');
  assert.equal(themeStatus().iconMode,'accent');
  assert.equal(selectedSiteSurface(),'midnight');
  assert.equal(selectedIconMode(),'accent');
  assert.equal(selectedIconColor(),'cyan-blue');
  const settings=settingsView();
  assert.equal((settings.match(/class="slateAccentChoice/g)||[]).length,10);
  assert.equal((settings.match(/class="arcanaIconColorChoice/g)||[]).length,11);
  assert.equal((settings.match(/class="arcanaIconModeChoice/g)||[]).length,4);
  assert.equal((settings.match(/class="arcanaSurfaceChoice/g)||[]).length,5);
  assert.match(settings,/data-route="icons"/);
  assert.match(settings,/data-arg="cyan-blue" aria-pressed="true"/);
  assert.equal(setSiteSurface('bogus'),false);
  assert.equal(setIconColor('javascript:alert(1)'),false);
  assert.equal(setIconMode('none'),false);
  assert.equal(selectedIconMode(),'accent');
  assert.equal(selectedSiteSurface(),'midnight');
  assert.equal(setIconColor('follow-site'),true);
  assert.equal(themeStatus().iconColor,themeStatus().palette.highlight);
  assert.equal(setSiteSurface('slate'),true);
  assert.equal(themeStatus().palette.main,'#0D1019');
 }finally{
  if(original===undefined)delete globalThis.localStorage;
  else globalThis.localStorage=original;
 }
});
test('browsable catalog shows every glyph and server allows every SVG path',async()=>{
 const page=iconGalleryView();
 assert.equal((page.match(/class="arcanaIconCatalogItem"/g)||[]).length,ICON_IDS.length);
 assert.match(page,/Customize icon appearance/);
 const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 assert.match(server,/const publicAsset=\/\^\\\/assets/);
 assert.match(server,/svg/);
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/case 'icons':return iconGalleryView\(\)/);
});
