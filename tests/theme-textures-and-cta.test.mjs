import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DESIGN_FIELDS,DEFAULT_DESIGN,validateDesignField,readDesign,writeDesign} from '../src/design-controls.js';
import {HERO_CTA_STYLES,HERO_CTA_STYLE_IDS} from '../src/hero-cta-styles.js';
import {THEME_PATTERNS} from '../src/theme-patterns.js';
import {designPanel,settingsView} from '../src/launch-navigation.js';

const read=p=>readFile(new URL(p,import.meta.url),'utf8');
test('texture library includes 84 unique visual finishes with matching live, preview and gallery drawings',async()=>{
 const css=(await read('../arcana-contour.css'))+(await read('../signature-themes.css'))+(await read('../psychedelic-themes.css')),form=designPanel({showPreview:false});
 assert.equal(THEME_PATTERNS.length,88);
 assert.equal(new Set(THEME_PATTERNS.map(p=>p.id)).size,88);
 for(const texture of THEME_PATTERNS){
  assert.equal(validateDesignField('pattern',texture.id),texture.id);
  assert.ok(css.includes('data-preview-pattern="'+texture.id+'"'),texture.id+' thumb missing');
  assert.ok(css.includes('data-arcana-design-pattern="'+texture.id+'"'),texture.id+' live missing');
  if(!['plain','contours'].includes(texture.id))assert.ok(css.includes('data-mini-pattern="'+texture.id+'"'),texture.id+' mini missing');
  assert.ok(form.includes('data-theme-pattern="'+texture.id+'"'),texture.id+' picker missing');
 }
 assert.ok(form.includes('88 seamless texture finishes'));
 assert.ok(form.includes('data-design-field="patternTarget"'));
 assert.ok(form.includes('Where to show textures'));
});
test('Build Studio entrance has 16 distinct selectable treatments and safe controls',async()=>{
 const css=await read('../theme-studio-finishes.css'),app=await read('../src/app.js'),mini=await read('../src/design-mini-preview.js'),form=designPanel({showPreview:false});
 assert.equal(HERO_CTA_STYLES.length,16);
 assert.equal(new Set(HERO_CTA_STYLE_IDS).size,16);
 for(const style of HERO_CTA_STYLES){
  assert.equal(validateDesignField('heroActionStyle',style.id),style.id);
  assert.match(form,new RegExp('data-hero-cta-style="'+style.id+'"'));
  assert.ok(css.includes('data-hero-sample="'+style.id+'"'),'Missing sample '+style.id);
  if(!['integrated','outline','spotlight'].includes(style.id))assert.ok(css.includes('data-arcana-hero-action-style="'+style.id+'"'),'Missing live CTA '+style.id);
  assert.ok(css.includes('data-mini-hero-action="'+style.id+'"')||['integrated','outline','spotlight'].includes(style.id),'Missing mini CTA '+style.id);
 }
 for(const control of ['heroActionWidth','heroActionAlign','heroActionHeight','heroActionGlow','heroActionBorder','heroActionIcon','heroActionSubtitle']){
  assert.ok(DESIGN_FIELDS.includes(control));
  assert.ok(form.includes('data-design-field="'+control+'"'),control);
 }
 assert.equal(validateDesignField('heroActionWidth',999),100);
 assert.equal(validateDesignField('heroActionWidth',0),65);
 assert.equal(validateDesignField('heroActionAlign','calc(100vw)'),null);
 assert.equal(validateDesignField('heroActionStyle','javascript:alert(1)'),null);
 assert.ok(app.includes('data-hero-cta-style'));
 assert.ok(mini.includes('dataset.miniHeroAlign=v.heroActionAlign'));
 assert.doesNotMatch(settingsView(),/heroCtaLibrary|heroActionWidth/);
});
test('nine feature-card surfaces and sigil visibility are independent of button styles',async()=>{
 const css=await read('../theme-studio-finishes.css'),form=designPanel({showPreview:false}),mini=await read('../src/design-mini-preview.js');
 const cards=['blended','flat','frameless','etched','glass','raised','accent-edge','metallic','minimal'];
 for(const name of cards){
  assert.equal(validateDesignField('heroCardStyle',name),name);
  if(name!=='blended')assert.ok(css.includes('data-arcana-hero-card-style="'+name+'"'),name);
  assert.ok(form.includes('value="'+name+'"'),name);
 }
 assert.ok(form.includes('data-design-field="heroCardEmblem"'));
 assert.equal(validateDesignField('heroCardEmblem','hidden'),'hidden');
 assert.equal(validateDesignField('heroCardEmblem','external-url'),null);
 assert.equal(DEFAULT_DESIGN.heroCardStyle,'blended');
 assert.equal(DEFAULT_DESIGN.heroCardEmblem,'subtle');
 assert.ok(mini.includes('dataset.miniHeroCard=v.heroCardStyle'));
 assert.match(css,/data-mini-hero-card="frameless"/);
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
