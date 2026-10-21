import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readDesign,writeDesign,resetDesign,DEFAULT_DESIGN,normalizeDesignHex,DESIGN_PRESETS,applyDesignPreset,undoDesign,validateDesignField} from '../src/design-controls.js';
import {settingsView,designPanel} from '../src/launch-navigation.js';
import {designMiniMarkup,endDesignMiniSession} from '../src/design-mini-preview.js';

test('admin style workshop is hidden from public settings',()=>{
 const guest=settingsView();
 const admin=designPanel();
 assert.doesNotMatch(guest,/arcanaDesignLab/);
 assert.doesNotMatch(guest,/arcanaAdminAppearance/);
 assert.match(admin,/arcanaDesignLab/);
 assert.doesNotMatch(settingsView({admin:true}),/arcanaDesignLab/);
 assert.match(admin,/data-theme-pattern="vision-violet-fault"/);
 assert.match(admin,/data-design-field="roundness"/);
 assert.match(admin,/data-design-field="action"/);
 for(const key of ['main','card','action','text','secondaryAccent','borderColor','mutedText','navBar','buttonText'])assert.match(admin,new RegExp('data-design-hex="'+key+'"'),key+' typed HEX input');
 assert.doesNotMatch(guest,/data-design-hex=/);
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
 assert.match(app,/function pathfinderHub\(legacyView='range'\)/);
 for(const route of ['timeline','range','upgrade','compare'])assert.ok(app.includes("['"+route+"'"),route);
 assert.match(app,/quickUpgradePanel\(recipeState.data,state.pathfinderRange/);
 assert.match(app,/case 'homemenu':if\(arg==='pathfinder'\)go\('calculators\/pathfinder'\)/);
 assert.match(app,/function skills\(\)\{return '<div class="studioPage studioSubPage">/);
 assert.doesNotMatch(board,/return `\$\{boardSwitch\('passive'\)\}/);
 assert.doesNotMatch(board,/return `\$\{boardSwitch\('class'\)\}/);
 assert.match(css,/pathfinderHubTabs/);
});

test('typed and pasted HEX values validate and normalize safely',()=>{
 assert.equal(normalizeDesignHex('#a78bfa'),'#A78BFA');
 assert.equal(normalizeDesignHex('a78bfa'),'#A78BFA');
 assert.equal(normalizeDesignHex('  #0d1019  '),'#0D1019');
 for(const bad of ['','#ABC','#GGGGGG','#000000; color:red','1234567','transparent'])assert.equal(normalizeDesignHex(bad),null,bad);
});

test('the protected workshop embeds a real mini sample with three example screens',()=>{
 endDesignMiniSession();
 const sample=designMiniMarkup();
 assert.match(sample,/data-mini-canvas/);
 assert.match(sample,/miniHero/);
 assert.match(sample,/miniDock/);
 assert.match(sample,/data-mini-compare="before"/);
 assert.match(sample,/data-mini-compare="after"/);
 for(const section of ['home','studio','pathfinder'])
  assert.match(sample,new RegExp('data-mini-page="'+section+'"'));
 assert.match(sample,/data-mini-reset/);
 assert.match(sample,/data-mini-live-frame/);
 assert.match(designPanel(),/designMiniPreview/);
 assert.doesNotMatch(settingsView({admin:false}),/designMiniPreview/);
});
test('mini style preview is updated by the existing saved-design writes',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const controls=await readFile(new URL('../src/design-controls.js',import.meta.url),'utf8');
 const preview=await readFile(new URL('../src/design-mini-preview.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../arcana-contour.css',import.meta.url),'utf8');
 assert.match(app,/wireDesignMiniPreview\(\)/);
 assert.match(app,/syncDesignMiniPreview\(\)/);
 assert.match(controls,/arcana:design-change/);
 assert.match(preview,/readDesign\(\)/);
 assert.match(css,/\.designMiniPreview\{position:relative/);
 assert.doesNotMatch(css,/\.designMiniPreview\{position:sticky/);
 assert.match(preview,/data-mini-toggle/);
 assert.match(preview,/miniPreviewContents/);
 for(const pattern of ['rings','stars','plain'])assert.ok(css.includes('data-mini-pattern="'+pattern+'"'));
});

test('thirty-eight curated palettes can be applied and undone without a page render',()=>{
 const old=globalThis.localStorage,mem=new Map();
 try{
  globalThis.localStorage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
  assert.equal(Object.keys(DESIGN_PRESETS).length,72);
  assert.equal(applyDesignPreset('emerald'),true);
  assert.equal(readDesign().action,'#34E8A1');
  assert.equal(readDesign().main,'#071510');
  assert.equal(undoDesign(),true);
  assert.equal(readDesign().main,DEFAULT_DESIGN.main);
  assert.equal(applyDesignPreset('nonexistent'),false);
 }finally{if(old===undefined)delete globalThis.localStorage;else globalThis.localStorage=old}
});
test('extended customization is bounded and respects accessible native controls',()=>{
 const admin=designPanel(),guest=settingsView();
 for(const key of ['fontFamily','density','buttonStyle','fontSize','cardShadow','panelOpacity','borderWidth','roundness','artStrength','artDetail','artWeight','artZoom','artPositionX','artPositionY'])
  assert.match(admin,new RegExp('data-design-field="'+key+'"'),key);
 for(const [id,preset] of Object.entries(DESIGN_PRESETS)){if(preset.collection==='studio-v2')assert.match(admin,new RegExp('data-arg="'+id+'"'),id);else assert.doesNotMatch(admin,new RegExp('data-arg="'+id+'"'),id+' should not be visible');}
 assert.match(admin,/data-action="undo-design"/);
 assert.match(admin,/data-mini-toggle/);
 assert.doesNotMatch(guest,/data-action="design-preset"/);
 assert.equal(validateDesignField('fontFamily','url(evil)'),null);
 assert.equal(validateDesignField('density','garbage'),null);
 assert.equal(validateDesignField('borderWidth',999),3);
 assert.equal(validateDesignField('fontSize',30),90);
 assert.equal(validateDesignField('headerOpacity',''),null);
});

test('multiple slider input events coalesce into one undo gesture',()=>{
 const original=globalThis.localStorage,store=new Map();
 try{
  globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
  const initial=readDesign().fontSize;
  assert.equal(writeDesign('fontSize',101),true);
  assert.equal(writeDesign('fontSize',102),true);
  assert.equal(writeDesign('fontSize',103),true);
  assert.equal(readDesign().fontSize,103);
  assert.equal(undoDesign(),true);
  assert.equal(readDesign().fontSize,initial);
 }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original}
});
test('eighteen patterns validate and the sample has no overlay behavior',async()=>{
 for(const pattern of ['contours','rings','stars','grid','aurora','diagonal','hex','grain','crystal','nebula','weave','runes','circuit','topography','facets','scanlines','honeycomb','plain'])assert.equal(validateDesignField('pattern',pattern),pattern);
 assert.equal(validateDesignField('pattern','external-url'),null);
 const markup=designPanel();
 for(const value of ['grid','aurora','diagonal'])assert.doesNotMatch(markup,new RegExp('value="'+value+'"'));
 assert.match(markup,/data-theme-pattern="vision-glacial-fold"/);
 const css=await readFile(new URL('../arcana-contour.css',import.meta.url),'utf8');
 assert.match(css,/\.arcanaDesignLab \.designMiniPreview\{position:relative!important/);
 assert.match(css,/\.miniCanvas\[data-mini-pattern="aurora"\]/);
});

test('featured Build Studio has three independent action treatments and three height modes',()=>{
 const view=designPanel(),guest=settingsView();
 assert.doesNotMatch(view,/data-design-field="heroActionStyle"|data-design-field="heroSize"/);
 assert.match(view,/data-design-field="panelOpacity"/);
 for(const mode of ['integrated','outline','spotlight'])assert.equal(validateDesignField('heroActionStyle',mode),mode);
 for(const size of ['compact','balanced','showcase'])assert.equal(validateDesignField('heroSize',size),size);
 assert.equal(validateDesignField('heroActionStyle','unsupported'),null);
 assert.equal(validateDesignField('heroSize','900px'),null);
 assert.doesNotMatch(guest,/data-design-field="heroActionStyle"/);
 const preview=designMiniMarkup();
 assert.match(preview,/data-mini-canvas/);
});
test('default Build Studio CTA blends with dark Quick Access panels without altering game assets',async()=>{
 const controls=await readFile(new URL('../src/design-controls.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../arcana-contour.css',import.meta.url),'utf8');
 assert.equal(DEFAULT_DESIGN.heroActionStyle,'integrated');
 assert.equal(DEFAULT_DESIGN.heroSize,'balanced');
 assert.match(css,/data-arcana-hero-action-style="integrated"/);
 assert.match(css,/data-arcana-hero-action-style="outline"/);
 assert.match(css,/data-arcana-hero-action-style="spotlight"/);
 assert.match(css,/data-arcana-hero-size="compact"/);
 assert.match(css,/data-mini-hero-action="integrated"/);
 assert.match(controls,/root\.dataset\.arcanaHeroActionStyle=values\.heroActionStyle/);
 assert.match(controls,/root\.dataset\.arcanaHeroSize=values\.heroSize/);
});
