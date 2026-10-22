import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DEFAULT_DESIGN,DESIGN_PRESETS,DESIGN_FIELDS,validateDesignField,readDesign,applyLayerVisualPreset,undoDesign} from '../src/design-controls.js';
import {VISUAL_ART} from '../src/visual-art.js';
import {STUDIO_FONTS,fontStack,STUDIO_FONT_OPTIONS} from '../src/studio-fonts.js';
import {resolveArtLayers,layerArtUrl,paintArtLayers} from '../src/studio-art-layers.js';
import {designPanel} from '../src/launch-navigation.js';
const file=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
test('18 real fonts provide separate, validated body and heading controls',()=>{
 assert.equal(STUDIO_FONTS.length,18);
 assert.equal(STUDIO_FONT_OPTIONS.length,18);
 assert.equal(new Set(STUDIO_FONTS.map(x=>x[0])).size,18);
 assert.equal(validateDesignField('headingFont','cinzel'),'cinzel');
 assert.equal(validateDesignField('fontFamily','space-grotesk'),'space-grotesk');
 assert.equal(validateDesignField('headingFont','url(javascript:evil)'),null);
 assert.ok(fontStack('fraunces').includes('Fraunces'));
 const html=designPanel({showPreview:false});
 assert.match(html,/data-design-field="headingFont"/);
 assert.match(html,/data-design-field="fontFamily"/);
 assert.match(html,/data-studio-font-sample/);
 for(const [key] of STUDIO_FONT_OPTIONS)assert.ok(html.includes('value="'+key+'"'),key);
});
test('page, panels and Build Studio each own a real selectable artwork and four independent pigments',()=>{
 const html=designPanel({showPreview:false});
 for(const layer of ['background','panels','feature'])assert.ok(html.includes('data-studio-layer="'+layer+'"'));
 for(const key of ['pattern','panelPattern','featurePattern','panelArtBase','panelArtPrimary','panelArtSecondary','panelArtGlow','featureArtBase','featureArtPrimary','featureArtSecondary','featureArtGlow'])assert.ok(html.includes('data-design-field="'+key+'"'),key);
 for(const field of ['panelArtBase','panelArtPrimary','featureArtBase','featureArtGlow'])assert.ok(DESIGN_FIELDS.includes(field));
 for(const art of VISUAL_ART){
  assert.equal(validateDesignField('panelPattern',art.id),art.id);
  assert.equal(validateDesignField('featurePattern',art.id),art.id);
 }
 assert.equal(validateDesignField('panelPattern','inherit'),'inherit');
 assert.equal(validateDesignField('featurePattern','none'),'none');
 assert.equal(validateDesignField('featurePattern','url(bad)'),null);
});
test('layer resolver isolates artwork and colors, with inherit and no-art behaviors',()=>{
 const d={...DEFAULT_DESIGN,pattern:'vision-violet-fault',panelPattern:'vision-monowave',featurePattern:'vision-crownspace',
  artPrimary:'#FF0000',panelArtPrimary:'#00FF00',featureArtPrimary:'#0000FF'};
 const layers=resolveArtLayers(d);
 assert.deepEqual([layers.background.id,layers.panels.id,layers.feature.id],['vision-violet-fault','vision-monowave','vision-crownspace']);
 for(const [layer,color] of [['background','#FF0000'],['panels','#00FF00'],['feature','#0000FF']])assert.ok(decodeURIComponent(layerArtUrl(d,layer)).includes(color),layer);
 assert.notEqual(layerArtUrl(d,'background'),layerArtUrl(d,'panels'));
 assert.notEqual(layerArtUrl(d,'panels'),layerArtUrl(d,'feature'));
 assert.equal(resolveArtLayers({...d,panelPattern:'inherit'}).panels.id,d.pattern);
 assert.equal(resolveArtLayers({...d,featurePattern:'inherit'}).feature.id,d.panelPattern);
 assert.equal(layerArtUrl({...d,panelPattern:'none'},'panels'),'none');
 assert.equal(layerArtUrl({...d,featurePattern:'none'},'feature'),'none');
 assert.equal(resolveArtLayers({...d,patternTarget:'background',panelPattern:'inherit',featurePattern:'inherit'}).panels,null);
});
test('layer selection writes the palette of the chosen design and remains privately undoable',()=>{
 const old=globalThis.localStorage,store=new Map();
 globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 try{
  const art=VISUAL_ART.find(x=>x.id==='vision-monowave');
  assert.equal(applyLayerVisualPreset('panels',art.id),true);
  assert.equal(readDesign().panelPattern,art.id);
  assert.equal(readDesign().panelArtPrimary,art.colors[1]);
  assert.equal(readDesign().pattern,DEFAULT_DESIGN.pattern);
  assert.equal(undoDesign(),true);
  assert.equal(readDesign().panelPattern,DEFAULT_DESIGN.panelPattern);
  assert.equal(applyLayerVisualPreset('feature','none'),true);
  assert.equal(readDesign().featurePattern,'none');
  assert.equal(applyLayerVisualPreset('unknown','vision-monowave'),false);
 }finally{if(old===undefined)delete globalThis.localStorage;else globalThis.localStorage=old;}
});
test('layered surface variables and typography feed site, embedded iframe, and miniature',async()=>{
 const [css,controls,mini,frame,app,index,server]=await Promise.all(['studio-layers.css','src/design-controls.js','src/design-mini-preview.js','src/theme-live-frame.js','src/app.js','index.html','server.mjs'].map(file));
 assert.match(css,/--arcana-art-background/);
 assert.match(css,/--arcana-art-panels/);
 assert.match(css,/--arcana-art-feature/);
 assert.match(css,/\.atlasHome \.atlasHero/);
 assert.match(css,/\.atlasHome :is\(\.atlasTile/);
 assert.match(css,/--arcana-design-heading-font-family/);
 assert.match(css,/fonts\.googleapis\.com/);
 assert.match(controls,/paintArtLayers\(root,values\)/);
 assert.match(frame,/paintArtLayers\(root,values\)/);
 assert.match(mini,/--mini-art-['"]?\+layer/);
 assert.match(app,/applyLayerVisualPreset/);
 assert.match(index,/studio-layers\.css\?v=/);
 assert.match(server,/'\/studio-layers\.css'/);
 const properties=new Map();
 const root={style:{setProperty:(key,v)=>properties.set(key,v)},dataset:{}};
 paintArtLayers(root,{...DEFAULT_DESIGN,panelPattern:'vision-monowave',featurePattern:'vision-crownspace'});
 assert.equal(root.dataset.arcanaArtLayered,'true');
 assert.ok(properties.get('--arcana-art-background')?.startsWith('url('));
 assert.ok(properties.get('--arcana-art-panels')?.startsWith('url('));
 assert.ok(properties.get('--arcana-art-feature')?.startsWith('url('));
});
test('every curated look resets both additional surfaces and carries intentional font pairing',()=>{
 for(const [id,preset] of Object.entries(DESIGN_PRESETS).filter(([,p])=>p.collection==='studio-v2')){
  assert.equal(preset.panelPattern,'inherit',id);
  assert.equal(preset.featurePattern,'inherit',id);
  assert.ok(fontStack(preset.headingFont),id);
  assert.ok(fontStack(preset.fontFamily),id);
 }
});
