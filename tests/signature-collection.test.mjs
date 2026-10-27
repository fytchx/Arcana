import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SIGNATURE_PRESETS} from '../src/signature-collection.js';
import {DESIGN_PRESETS,DEFAULT_DESIGN,DESIGN_FIELDS,validateDesignField,applyDesignPreset,readDesign,undoDesign} from '../src/design-controls.js';
import {THEME_PATTERNS} from '../src/theme-patterns.js';
import {themeReadability} from '../src/theme-studio-audit.js';
import {designPanel} from '../src/launch-navigation.js';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
test('twenty individually styled signature designs extend eighteen classics without losing their editable knobs',()=>{
 const ids=Object.keys(SIGNATURE_PRESETS),patterns=new Set(THEME_PATTERNS.filter(p=>p.category==='Signature').map(p=>p.id));
 assert.equal(ids.length,20);
 assert.equal(Object.keys(DESIGN_PRESETS).length,148);
 assert.equal(patterns.size,20);
 assert.equal(new Set(ids.map(id=>SIGNATURE_PRESETS[id].pattern)).size,20);
 for(const id of ids){
  const p=SIGNATURE_PRESETS[id];
  assert.equal(p.collection,'signature');
  assert.equal(DESIGN_PRESETS[id],p);
  assert.ok(p.tagline.length>12,id+' description missing');
  assert.ok(patterns.has(p.pattern),id+' texture missing');
  for(const [field,value] of Object.entries(p)){
   if(['name','tagline','collection'].includes(field))continue;
   assert.ok(DESIGN_FIELDS.includes(field),field+' is not editable');
   assert.equal(validateDesignField(field,value),value,id+':'+field);
  }
  for(const check of themeReadability({...DEFAULT_DESIGN,...p}))assert.ok(check.pass,id+': '+check.name+' contrast '+check.ratio.toFixed(2));
 }
 assert.equal(validateDesignField('aura',101),100);
 assert.equal(validateDesignField('sheen',-1),0);
 assert.equal(validateDesignField('detail','not a number'),null);
});
test('signature shaders remain available to old saved designs but are not shown in Studio V2',async()=>{
 const css=await read('../signature-themes.css');
 const panel=designPanel({showPreview:false}),mini=await read('../src/design-mini-preview.js');
 for(const [id,p] of Object.entries(SIGNATURE_PRESETS)){
  for(const key of ['data-arcana-design-pattern','data-mini-pattern','data-preview-pattern','data-signature-art']){
   assert.ok(css.includes(key+'="'+p.pattern+'"'),p.pattern+' missing '+key);
  }
  assert.doesNotMatch(panel,new RegExp('data-arg="'+id+'"'),id+' should be archived');
 }
 for(const control of ['aura','sheen','detail'])assert.doesNotMatch(panel,new RegExp('data-design-field="'+control+'"'));
 for(const control of ['artStrength','artDetail','artWeight','artZoom'])assert.match(panel,new RegExp('data-design-field="'+control+'"'));
 assert.equal((panel.match(/data-collection="studio-v2"/g)||[]).length,106);
 assert.doesNotMatch(panel,/data-collection="signature"|All 42 presets/);
 assert.match(mini,/--mini-signature-scale/);
 assert.match(css,/--arcana-signature-sheen/);
 assert.match(css,/--arcana-signature-aura/);
});
test('selecting a signature preset is private, undoable and preserves all other local data',()=>{
 const old=globalThis.localStorage;
 const store=new Map([['my-own-data','untouched']]);
 globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 try{
  assert.equal(applyDesignPreset('astral'),true);
  const value=readDesign();
  assert.equal(value.pattern,'astral-sovereign');
  assert.equal(value.action,SIGNATURE_PRESETS.astral.action);
  assert.equal(value.sheen,SIGNATURE_PRESETS.astral.sheen);
  assert.ok(!('tagline' in value));
  assert.ok(!('collection' in value));
  assert.equal(store.get('my-own-data'),'untouched');
  assert.equal(undoDesign(),true);
  assert.equal(readDesign().pattern,DEFAULT_DESIGN.pattern);
  assert.equal(store.get('my-own-data'),'untouched');
 }finally{if(old===undefined)delete globalThis.localStorage;else globalThis.localStorage=old}
});
