import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {STUDIO_V2_PRESETS,STUDIO_V2_PRESET_IDS,STUDIO_V2_FAMILIES} from '../src/studio-v2-presets.js';
import {VISUAL_ART,artUrl} from '../src/visual-art.js';
import {designPanel} from '../src/launch-navigation.js';
import {DEFAULT_DESIGN,DESIGN_FIELDS,validateDesignField,applyDesignPreset,readDesign,undoDesign} from '../src/design-controls.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('new studio shows 105 curated presets, 23 authored artworks and no old texture library',()=>{
 const html=designPanel({showPreview:false});
 assert.equal(STUDIO_V2_PRESET_IDS.length,105);
 assert.equal(VISUAL_ART.length,23);
 assert.equal(new Set(STUDIO_V2_PRESET_IDS).size,105);
 assert.ok(STUDIO_V2_FAMILIES.length>=5);
 assert.equal((html.match(/class="designPreset studioV2Preset"/g)||[]).length,105);
 assert.equal((html.match(/class="visionArtChoice studioV2Artwork"/g)||[]).length,23);
 for(const id of STUDIO_V2_PRESET_IDS)assert.ok(html.includes('data-arg="'+id+'"'));
 for(const art of VISUAL_ART)assert.ok(html.includes('data-theme-pattern="'+art.id+'"'));
 assert.doesNotMatch(html,/data-theme-pattern="atelier-|data-collection="signature"|data-theme-pattern="runes"|Browse all 148|42 presets|psyPalettePicker/);
 assert.match(html,/class="themeVaultSection"/);
 assert.match(html,/data-theme-jump="vault"/);
});
test('every new preset maps to an actual SVG and a complete validated site palette',()=>{
 for(const [id,preset] of Object.entries(STUDIO_V2_PRESETS)){
  assert.ok(VISUAL_ART.some(a=>a.id===preset.panelPattern),id+' panel artwork');
  assert.ok(VISUAL_ART.some(a=>a.id===preset.featurePattern),id+' feature artwork');
  assert.notEqual(preset.panelPattern,preset.featurePattern,id+' independent surface art');
  assert.ok(VISUAL_ART.some(a=>a.id===preset.pattern),id);
  for(const [key,value] of Object.entries(preset)){
   if(['name','tagline','collection'].includes(key))continue;
   assert.ok(DESIGN_FIELDS.includes(key),id+' '+key);
   assert.notEqual(validateDesignField(key,value),null,id+' '+key+' invalid');
  }
  assert.notEqual(artUrl(preset.pattern,preset),null,id);
 }
});
test('art controls all affect actual geometry, independent from global interface colors',()=>{
 const values={artBase:'#111124',artPrimary:'#D946EF',artSecondary:'#27BCEC',artGlow:'#FFE5CC',artStrength:100,artDetail:100,artWeight:100,artZoom:100,artPositionX:50,artPositionY:50};
 for(const [field,v] of [['artStrength',48],['artDetail',35],['artWeight',162],['artZoom',140],['artPositionX',76],['artPositionY',25]]){
  assert.ok(DESIGN_FIELDS.includes(field),field);
  assert.notEqual(artUrl('vision-monowave',values),artUrl('vision-monowave',{...values,[field]:v}),field+' rendered no change');
 }
 for(const key of ['panelOpacity','roundness','cardShadow','borderWidth','buttonFill','fontSize','density'])assert.ok(designPanel({showPreview:false}).includes('data-design-field="'+key+'"'),key);
 assert.equal(validateDesignField('artStrength',1000),100);
 assert.equal(validateDesignField('artZoom',0),75);
});
test('preset choice remains privately undoable, while legacy saved themes are still readable',()=>{
 const old=globalThis.localStorage,values=new Map();
 globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 try{
  assert.equal(applyDesignPreset('astral-heart'),true);
  assert.equal(readDesign().pattern,STUDIO_V2_PRESETS['astral-heart'].pattern);
  assert.equal(readDesign().artPrimary,STUDIO_V2_PRESETS['astral-heart'].artPrimary);
  assert.equal(undoDesign(),true);
  assert.equal(readDesign().pattern,DEFAULT_DESIGN.pattern);
  assert.equal(validateDesignField('pattern','contours'),'contours');
 }finally{if(old===undefined)delete globalThis.localStorage;else globalThis.localStorage=old;}
});
test('new studio uses working live preview and published-theme channel, not a second fake preview',async()=>{
 const [editor,css,app,design,index,server,mini]=await Promise.all(['src/studio-v2.js','studio-v2.css','src/app.js','src/design-controls.js','index.html','server.mjs','src/design-mini-preview.js'].map(read));
 assert.match(editor,/designMiniMarkup\(\)/);
 assert.match(editor,/themeVaultMarkup\(\)/);
 assert.match(app,/filterStudioV2Looks\(\)/);
 assert.match(app,/data-studio-family-filter/);
 assert.match(index,/\/arcana-site\.css/);
 assert.match(server,/'\/studio-v2.css'/);
 assert.match(css,/--arcana-panel-opacity-percent/);
 assert.match(css,/data-arcana-design-density=compact/);
 assert.match(design,/--arcana-panel-opacity-percent/);
 assert.match(mini,/data-mini-live-frame/);
});
