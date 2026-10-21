import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DESIGN_FIELDS,DEFAULT_DESIGN,validateDesignField,readDesign,writeDesign} from '../src/design-controls.js';
import {HERO_CTA_STYLES,HERO_CTA_STYLE_IDS} from '../src/hero-cta-styles.js';
import {THEME_PATTERNS} from '../src/theme-patterns.js';
import {designPanel,settingsView} from '../src/launch-navigation.js';

const read=p=>readFile(new URL(p,import.meta.url),'utf8');
test('legacy texture renderer is still restorable but the new editor shows only authored artwork',async()=>{
 const css=(await read('../arcana-contour.css'))+(await read('../signature-themes.css'))+(await read('../psychedelic-themes.css'))+(await read('../atlas-atelier-textures.css'))+(await read('../visual-art.css'));
 const form=designPanel({showPreview:false});
 assert.equal(THEME_PATTERNS.length,154);
 assert.equal(new Set(THEME_PATTERNS.map(p=>p.id)).size,154);
 for(const texture of THEME_PATTERNS){
  assert.equal(validateDesignField('pattern',texture.id),texture.id);
  if(texture.category==='Vision')assert.ok(form.includes('data-theme-pattern="'+texture.id+'"'));
  else assert.ok(css.includes('data-arcana-design-pattern="'+texture.id+'"'));
 }
 assert.doesNotMatch(form,/Where to show textures|Browse all 148 texture finishes|psyPalettePicker/);
 assert.match(form,/data-design-field="patternTarget"/);
});
test('retired hero settings stay valid for saved drafts without appearing as dead controls',async()=>{
 const css=await read('../theme-studio-finishes.css'),mini=await read('../src/design-mini-preview.js'),form=designPanel({showPreview:false});
 assert.equal(HERO_CTA_STYLES.length,16);
 assert.equal(new Set(HERO_CTA_STYLE_IDS).size,16);
 for(const style of HERO_CTA_STYLES){
  assert.equal(validateDesignField('heroActionStyle',style.id),style.id);
  assert.doesNotMatch(form,new RegExp('data-hero-cta-style="'+style.id+'"'));
  assert.ok(css.includes('data-hero-sample="'+style.id+'"'));
 }
 assert.match(mini,/dataset.miniHeroAlign=v.heroActionAlign/);
 assert.doesNotMatch(form,/data-design-field="heroActionWidth"|data-design-field="heroCardEmblem"/);
 assert.doesNotMatch(settingsView(),/heroCtaLibrary|heroActionWidth/);
});
test('functional studio surfaces replace obsolete hero-only controls',async()=>{
 const css=await read('../studio-v2.css'),form=designPanel({showPreview:false});
 for(const key of ['roundness','borderWidth','cardShadow','panelOpacity','buttonFill','buttonRoundness','fontSize','density']){
  assert.ok(DESIGN_FIELDS.includes(key),key);
  assert.ok(form.includes('data-design-field="'+key+'"'),key);
 }
 assert.match(css,/--arcana-card-radius/);
 assert.match(css,/--arcana-panel-opacity-percent/);
 assert.equal(validateDesignField('heroCardEmblem','hidden'),'hidden');
 assert.equal(validateDesignField('heroCardEmblem','external-url'),null);
 assert.equal(DEFAULT_DESIGN.heroCardStyle,'blended');
});
test('new isolated styles are delivered through the production allowlist and load after legacy rules',async()=>{
 const index=await read('../index.html'),server=await read('../server.mjs');
 const css=await read('../theme-studio-finishes.css');
 assert.ok(server.includes("'/theme-studio-finishes.css'"));
 assert.ok(index.includes('/theme-studio-finishes.css'));
 assert.ok(index.indexOf('/theme-studio-finishes.css')>index.indexOf('/arcana-contour.css'));
 assert.match(css,/min-height:max\(44px,var\(--arcana-hero-cta-height/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/data-arcana-pattern-target="background"/);
});
test('legacy local design drafts keep defaults for new knobs without mutation',()=>{
 const previous=globalThis.localStorage;
 const store=new Map();
 try{
  globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
  store.set('arcana-admin-design-preview-v1',JSON.stringify({main:'#123456',heroActionStyle:'outline'}));
  const d=readDesign();
  assert.equal(d.main,'#123456');
  assert.equal(d.heroActionWidth,100);
  assert.equal(d.patternTarget,'all');
  assert.equal(writeDesign('heroActionStyle','frosted'),true);
  assert.equal(readDesign().heroActionStyle,'frosted');
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
});
