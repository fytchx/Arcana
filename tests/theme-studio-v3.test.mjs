import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {THEME_PATTERNS,THEME_PATTERN_IDS} from '../src/theme-patterns.js';
import {validateDesignField,DEFAULT_DESIGN} from '../src/design-controls.js';
import {designPanel,settingsView} from '../src/launch-navigation.js';
import {designMiniMarkup,endDesignMiniSession} from '../src/design-mini-preview.js';
import {themeVaultMarkup} from '../src/theme-studio-vault.js';
import {adminConsoleView} from '../src/admin-console.js';
import {contrastRatio,themeReadability,suggestedButtonText} from '../src/theme-studio-audit.js';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
test('Theme Studio places independent always-visible preview beside long controls',async()=>{
 const page=adminConsoleView({admin:true,tab:'appearance'});
 assert.match(page,/class="themeStudioWorkbench"/);
 assert.match(page,/class="themeStudioEditor"/);
 assert.match(page,/class="themeStudioPreview"/);
 assert.equal((page.match(/data-mini-canvas/g)||[]).length,1);
 assert.equal((page.match(/data-design-field="pattern"/g)||[]).length,1);
 assert.match(page,/Publish to everyone/);
 assert.match(page,/Restore published design/);
 assert.doesNotMatch(designPanel({showPreview:false}),/designMiniPreview/);
 assert.match(designPanel(),/designMiniPreview/);
 assert.doesNotMatch(settingsView(),/themeVaultContents/);
 const css=await read('../admin.css');
 assert.match(css,/\.themeStudioPreview\{[^}]*position:sticky/);
 assert.match(css,/@media\(max-width:800px\)[\s\S]*\.themeStudioPreview\{[^}]*position:fixed/);
 assert.match(css,/data-editing="true"/);
 assert.match(css,/data-preview-mode="focus"/);
});
test('preview remains live across five pages, three devices, before-after, plus focus mode',()=>{
 endDesignMiniSession();
 const html=designMiniMarkup();
 for(const page of ['home','studio','pathfinder','wiki','profile'])assert.match(html,new RegExp('data-mini-page="'+page+'"'));
 for(const mode of ['phone','tablet','desktop'])assert.match(html,new RegExp('data-mini-device="'+mode+'"'));
 for(const mode of ['before','after'])assert.match(html,new RegExp('data-mini-compare="'+mode+'"'));
 assert.match(html,/data-mini-size/);
 assert.match(html,/data-mini-grip/);
 assert.doesNotMatch(html,/<iframe/);
});
test('32 textures are uniquely named, correctly validated and represented in site/mini/thumbnail CSS',async()=>{
 const css=await read('../arcana-contour.css');
 assert.equal(THEME_PATTERNS.length,32);
 assert.equal(new Set(THEME_PATTERN_IDS).size,32);
 const html=designPanel({showPreview:false});
 for(const p of THEME_PATTERNS){
  assert.equal(validateDesignField('pattern',p.id),p.id,p.id);
  assert.ok(p.name&&p.category);
  assert.ok(css.includes('data-arcana-design-pattern="'+p.id+'"'),'Missing public texture '+p.id);
  assert.ok(css.includes('data-preview-pattern="'+p.id+'"'),'Missing texture swatch '+p.id);
  assert.match(html,new RegExp('data-theme-pattern="'+p.id+'"'));
  if(!['contours','plain'].includes(p.id))assert.ok(css.includes('data-mini-pattern="'+p.id+'"'),'Missing mini texture '+p.id);
 }
 assert.equal(validateDesignField('pattern','<script>'),null);
 assert.equal(DEFAULT_DESIGN.pattern,'contours');
});
test('draft vault has four private snapshots and authenticated import controls',async()=>{
 const html=themeVaultMarkup(),source=await read('../src/theme-studio-vault.js');
 assert.equal((html.match(/data-theme-save=/g)||[]).length,4);
 assert.match(html,/data-theme-json/);
 assert.match(html,/data-theme-export/);
 assert.match(html,/data-theme-import/);
 assert.match(source,/isValid\(/);
 assert.match(source,/replaceDesignDraft\(/);
 assert.match(source,/arcanaAdminDesign/);
 assert.match(source,/arcana-owner-theme-snapshots-v1/);
});

test('readability meter reports real contrast ratios and safe button text suggestions',()=>{
 assert.equal(Number(contrastRatio('#FFFFFF','#000000').toFixed(2)),21);
 assert.equal(Number(contrastRatio('#777777','#777777').toFixed(2)),1);
 const bad={...DEFAULT_DESIGN,main:'#FFFFFF',card:'#F8F8F8',text:'#FFFFFF',action:'#FFFFFF',buttonText:'#FFFFFF'};
 const checks=themeReadability(bad);
 assert.equal(checks.filter(x=>x.pass).length,0);
 assert.equal(suggestedButtonText(bad),'#0D1019');
 assert.equal(themeReadability({...bad,buttonText:suggestedButtonText(bad)})[2].pass,true);
});
