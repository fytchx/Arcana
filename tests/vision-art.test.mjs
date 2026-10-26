import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {VISUAL_ART,VISUAL_ART_IDS,artUrl,visualArtById} from '../src/visual-art.js';
import {THEME_PATTERN_IDS} from '../src/theme-patterns.js';
import {DEFAULT_DESIGN,DESIGN_FIELDS,validateDesignField,applyVisualPreset,readDesign,undoDesign} from '../src/design-controls.js';
import {designPanel} from '../src/launch-navigation.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const svgFromUrl=url=>decodeURIComponent(url.slice('url("data:image/svg+xml,'.length,-2));

test('twenty-three truly different vector designs, each with four safe color channels',()=>{
 assert.equal(VISUAL_ART.length,23);
 assert.equal(new Set(VISUAL_ART_IDS).size,23);
 assert.equal(THEME_PATTERN_IDS.length,159);
 const output=[];
 for(const art of VISUAL_ART){
  assert.ok(THEME_PATTERN_IDS.includes(art.id),art.id);
  assert.equal(visualArtById(art.id),art);
  assert.equal(art.colors.length,4);
  const css=artUrl(art.id,{artBase:art.colors[0],artPrimary:art.colors[1],artSecondary:art.colors[2],artGlow:art.colors[3]});
  assert.ok(css.startsWith('url("data:image/svg+xml,'),art.id);
  const svg=svgFromUrl(css);
  assert.match(svg,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg,/width="1200" height="620"/);
  for(const c of art.colors)assert.ok(svg.includes(c),art.id+' missing pigment '+c);
  assert.ok(svg.includes('<path'),art.id);
  assert.ok(svg.length>2000,art.id+' is too empty');
  assert.doesNotMatch(svg,/<script|<image|<foreignObject|<filter|onload=|href=["']https?:/i);
  output.push(svg);
 }
 assert.equal(new Set(output).size,23,'Gallery contains duplicate geometry');
});
test('changing pigment channels changes SVG geometry coloring without altering the design',()=>{
 const original={artBase:'#111122',artPrimary:'#AA33DD',artSecondary:'#36D4CF',artGlow:'#FFBB44'};
 for(const art of VISUAL_ART){
  const first=svgFromUrl(artUrl(art.id,original));
  for(const [key,changed] of [['artBase','#050505'],['artPrimary','#0CF1EC'],['artSecondary','#AAFE33'],['artGlow','#F6F7F8']]){
   const second=svgFromUrl(artUrl(art.id,{...original,[key]:changed}));
   assert.notEqual(second,first,art.id+' does not recolor '+key);
   assert.ok(second.includes(changed),art.id+' omitted changed pigment '+key);
  }
  assert.equal(svgFromUrl(artUrl(art.id,{...original,artPrimary:'url(javascript:evil)'})).includes('javascript:evil'),false);
 }
 assert.equal(artUrl('unknown',{artPrimary:'#FF0000'}),null);
});
test('art colors are part of validated private theme state and palette selection is undoable',()=>{
 for(const key of ['artBase','artPrimary','artSecondary','artGlow']){
  assert.ok(DESIGN_FIELDS.includes(key),key);
  assert.match(DEFAULT_DESIGN[key],/^#[0-9A-F]{6}$/);
  assert.equal(validateDesignField(key,'#123ABC'),'#123ABC');
  assert.equal(validateDesignField(key,'red'),null);
 }
 const previous=globalThis.localStorage;const data=new Map();
 globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 try{
  assert.equal(applyVisualPreset('vision-monowave'),true);
  assert.equal(readDesign().pattern,'vision-monowave');
  assert.equal(readDesign().artPrimary,visualArtById('vision-monowave').colors[1]);
  assert.equal(undoDesign(),true);
  assert.equal(readDesign().pattern,DEFAULT_DESIGN.pattern);
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
});
test('gallery, actual home, miniature and real iframe all share the same art renderer',async()=>{
 const [index,server,css,controls,mini,frame,app]=await Promise.all(['index.html','server.mjs','visual-art.css','src/design-controls.js','src/design-mini-preview.js','src/theme-live-frame.js','src/app.js'].map(read));
 const panel=designPanel({showPreview:false});
 assert.equal((panel.match(/class="visionArtChoice studioV2Artwork"/g)||[]).length,23);
 for(const art of VISUAL_ART)assert.match(panel,new RegExp('data-theme-pattern="'+art.id+'"'));
 for(const key of ['artBase','artPrimary','artSecondary','artGlow'])assert.match(panel,new RegExp('data-design-field="'+key+'"'));
 assert.match(css,/\.visionArtThumb/);
 assert.match(css,/\.atlasHero,.atlasTile,.atlasFeatureLink/);
 assert.match(css,/data-mini-pattern\^="vision-"/);
 assert.match(controls,/applyVisualArt\(root,values\)/);
 assert.match(mini,/syncVisualSamples\(globalThis\.document,readDesign\(\)\)/);
 assert.match(frame,/artUrl\(values\.pattern,values\)/);
 assert.match(app,/applyVisualPreset\(pattern\.dataset\.themePattern\)/);
 assert.match(index,/visual-art\.css\?v=/);
 assert.match(server,/'\/visual-art.css'/);
});
