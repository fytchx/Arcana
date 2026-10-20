import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PSYCHEDELIC_IDS,psychedelicSvg,psychedelicPalette,PSYCHEDELIC_DEFAULTS} from '../src/psychedelic-patterns.js';
import {PSYCHEDELIC_PRESETS} from '../src/psychedelic-presets.js';
import {THEME_PATTERNS} from '../src/theme-patterns.js';
import {DEFAULT_DESIGN,DESIGN_PRESETS,DESIGN_FIELDS,validateDesignField,applyDesignPreset,readDesign,undoDesign} from '../src/design-controls.js';
import {designPanel} from '../src/launch-navigation.js';
import {designMiniMarkup} from '../src/design-mini-preview.js';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const unpack=url=>decodeURIComponent(url.replace(/^url\("data:image\/svg\+xml,/,'').replace(/"\)$/,''));
test('four authentic SVG pattern families and palettes are individually editable',()=>{
 assert.equal(PSYCHEDELIC_IDS.length,4);
 assert.equal(new Set(PSYCHEDELIC_IDS).size,4);
 assert.equal(Object.keys(PSYCHEDELIC_PRESETS).length,4);
 assert.equal(Object.keys(DESIGN_PRESETS).length,42);
 assert.equal(THEME_PATTERNS.length,88);
 for(const id of PSYCHEDELIC_IDS){
  assert.equal(THEME_PATTERNS.find(x=>x.id===id)?.category,'Psychedelic');
  const preset=Object.values(PSYCHEDELIC_PRESETS).find(x=>x.pattern===id);
  assert.ok(preset,id+' preset missing');
  assert.equal(preset.collection,'psychedelic');
  const svg=unpack(psychedelicSvg(id,{...DEFAULT_DESIGN,...preset}));
  assert.match(svg,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="360" height="360"/);
  assert.match(svg,/viewBox="0 0 360 360"/);
  assert.ok(svg.length>1800,id+' motif too simple');
  assert.ok(svg.includes(preset.psyPrimary));
  assert.ok(svg.includes(preset.psyOutline));
  assert.ok(!svg.includes('<script'));
  assert.equal(validateDesignField('pattern',id),id);
  for(const [field,v] of Object.entries(preset)){if(['name','tagline','collection'].includes(field))continue;assert.ok(DESIGN_FIELDS.includes(field),field);assert.equal(validateDesignField(field,v),v,field);}
 }
});
test('five palette slots change exact colored geometry, not a flattened image',()=>{
 const d={...PSYCHEDELIC_DEFAULTS,pattern:'orbit-jelly',psyPrimary:'#123456',psySecondary:'#345678',psyAccent:'#567890',psyBackground:'#7890AB',psyOutline:'#102030'};
 const img=unpack(psychedelicSvg('orbit-jelly',d));
 for(const color of ['#123456','#345678','#567890','#7890AB','#102030'])assert.ok(img.includes(color),color);
 assert.notEqual(psychedelicSvg('orbit-jelly',d),psychedelicSvg('orbit-jelly',{...d,psyPrimary:'#ABCDEF'}));
 assert.deepEqual(psychedelicPalette({...d,psyPaletteMode:'theme',main:'#111111',card:'#222222',action:'#333333',secondaryAccent:'#444444',text:'#555555'}),{background:'#222222',primary:'#333333',secondary:'#444444',accent:'#555555',outline:'#111111'});
 for(const bad of ['red','var(--x)','javascript:alert(1)','url(fake)'])assert.equal(validateDesignField('psyPrimary',bad),null);
 assert.equal(validateDesignField('psyStroke',900),100);
 assert.equal(validateDesignField('psyStroke',-99),0);
 assert.equal(validateDesignField('psyPaletteMode','data:'),null);
});
test('360px periodic tile motifs deliberately render adjoining neighbors to hide crop lines',()=>{
 const cases={ 'groove-melt':['translate(0 -360)','translate(0 360)'],
  'orbit-jelly':['translate(-360 -360)','translate(360 360)'],
  'doodle-rift':['translate(-360 -360)','translate(360 360)'],
  'prism-puddle':['translate(-360 -360)','translate(360 360)']};
 for(const [id,marks] of Object.entries(cases)){const img=unpack(psychedelicSvg(id,PSYCHEDELIC_DEFAULTS));for(const mark of marks)assert.ok(img.includes(mark),id+' missing neighbor '+mark);}
});
test('editor shows pattern-specific color controls and current live frame instead of stale mockup',async()=>{
 const editor=designPanel({showPreview:false}),preview=designMiniMarkup(),css=await read('../psychedelic-themes.css'),real=await read('../src/theme-live-frame.js');
 for(const key of ['psyPaletteMode','psyBackground','psyPrimary','psySecondary','psyAccent','psyOutline','psyStroke'])assert.ok(editor.includes('data-design-field="'+key+'"'),key);
 for(const id of PSYCHEDELIC_IDS){assert.ok(editor.includes('data-theme-pattern="'+id+'"'));assert.ok(css.includes('data-arcana-design-pattern="'+id+'"'));assert.ok(css.includes('data-mini-pattern="'+id+'"'));assert.ok(css.includes('data-preview-pattern="'+id+'"'));}
 assert.ok(editor.includes('themePresetCollection'));
 assert.equal((editor.match(/data-collection="psychedelic"/g)||[]).length,4);
 assert.ok(editor.includes('All 42 presets'));
 assert.ok(preview.includes('data-mini-live-frame'));
 assert.ok(preview.includes('data-mini-page="guilds"'));
 assert.match(real,/doc\.querySelector\('#content'\)/);
 assert.match(real,/arcanaDesignActive='true'/);
 assert.doesNotMatch(real,/fetch\(|localStorage\.|sessionStorage\.|publisher|adminDesign='true'/);
});
test('psychedelic preset is private and undo restores prior colors',()=>{
 const previous=globalThis.localStorage,m=new Map();
 globalThis.localStorage={getItem:key=>m.get(key)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
 try{
  assert.equal(applyDesignPreset('groovemelt'),true);
  assert.equal(readDesign().pattern,'groove-melt');
  assert.equal(readDesign().psyPrimary,'#F7479D');
  assert.equal(readDesign().psyPaletteMode,'custom');
  assert.equal(undoDesign(),true);
  assert.equal(readDesign().pattern,DEFAULT_DESIGN.pattern);
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous}
});
