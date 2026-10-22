import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ACCENT_PRESETS,logoFilterForAccent,themeStatus,selectedIconColor,selectedAccent,setAccent,setIconColor} from '../src/theme.js';

test('faceted Arcana branding responds to all 10 site accents',()=>{
 const filters=ACCENT_PRESETS.map(({hex})=>logoFilterForAccent(hex));
 assert.equal(new Set(filters).size,10,'Every accent must produce a distinct logo tint');
 assert.match(logoFilterForAccent('#EC464D'),/hue-rotate\(/);
 assert.match(logoFilterForAccent('#A98BFF'),/saturate\(/);
 assert.match(logoFilterForAccent('#E8E9ED'),/grayscale\(1\)/);
 assert.equal(logoFilterForAccent('#danger'),'none');
});
test('visitor branding ignores obsolete personal accent and icon overrides',()=>{
 const saved=globalThis.localStorage,store=new Map();
 try{
  globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  assert.ok(setIconColor('cyan-blue'));
  assert.ok(setAccent('crimson-red'));
  assert.equal(themeStatus().palette.highlight,'#A98BFF');
  assert.equal(themeStatus().iconColor,themeStatus().palette.highlight);
  assert.match(logoFilterForAccent(themeStatus().palette.highlight),/hue-rotate\(/);
 }finally{if(saved===undefined)delete globalThis.localStorage;else globalThis.localStorage=saved;}
});
test('homepage grain is a static safe neutral asset; cards and logo follow palette',async()=>{
 const css=await readFile(new URL('../launch-navigation.css',import.meta.url),'utf8');
 const svg=await readFile(new URL('../assets/arcana-etched-grain.svg',import.meta.url),'utf8');
 assert.match(css,/img\[src\$="\/assets\/arcana-logo\.webp"\]/);
 assert.match(css,/--arcana-logo-filter/);
 assert.match(css,/#content:has\(\.launchHero\) \.launchQuickCard::after/);
 assert.match(css,/#content:has\(\.launchHero\) \.launchHero::after/);
 assert.match(css,/arcana-etched-grain\.svg/);
 assert.match(svg,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
 assert.match(svg,/Small nonrepresentational etched-grain/);
 assert.doesNotMatch(svg,/<script\b|<image\b|<foreignObject\b|\b(?:href|src)=["']https?:\/\//i);
 const server=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 assert.match(server,/const publicAsset/);
 assert.match(server,/svg/);
});
