import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {THEME_PATTERNS,THEME_PATTERN_IDS} from '../src/theme-patterns.js';
import {validateDesignField,DEFAULT_DESIGN,DESIGN_PRESETS} from '../src/design-controls.js';
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
 assert.equal((page.match(/class="visionArtChoice studioV2Artwork"/g)||[]).length,23);
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
 assert.match(html,/data-mini-live-frame/);
 assert.match(html,/REAL ARCANA/);
 assert.match(html,/data-mini-page="guilds"/);
});
test('legacy textures remain validated while Studio V2 displays only authored Vision art',async()=>{
 const css=(await read('../arcana-contour.css'))+(await read('../signature-themes.css'))+(await read('../psychedelic-themes.css'))+(await read('../atlas-atelier-textures.css'))+(await read('../visual-art.css'));
 assert.equal(THEME_PATTERNS.length,160);
 assert.equal(new Set(THEME_PATTERN_IDS).size,160);
 const html=designPanel({showPreview:false});
 for(const p of THEME_PATTERNS){
  assert.equal(validateDesignField('pattern',p.id),p.id);
  assert.ok(p.name&&p.category);
  if(p.category==='Vision')assert.match(html,new RegExp('data-theme-pattern="'+p.id+'"'));
  else{
   assert.doesNotMatch(html,new RegExp('data-theme-pattern="'+p.id+'"'));
   assert.ok(css.includes('data-arcana-design-pattern="'+p.id+'"'),'Lost archived texture '+p.id);
  }
 }
 assert.equal((html.match(/class="studioV2Preset"/g)||[]).length,0,'new presets include designPreset as first class');
 assert.equal((html.match(/class="designPreset studioV2Preset"/g)||[]).length,106);
 assert.equal(validateDesignField('pattern','<script>'),null);
 assert.equal(DEFAULT_DESIGN.pattern,'vision-violet-fault');
});
test('draft vault has four private snapshots and authenticated import controls',async()=>{
 const html=themeVaultMarkup(),source=await read('../src/theme-studio-vault.js');
 assert.equal((html.match(/data-theme-save=/g)||[]).length,12);
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

test('Astral Veil is an editable cosmic preset with a continuous starfield and independent glass panels',async()=>{
 const preset=DESIGN_PRESETS['astral-veil'];
 assert.ok(preset);
 assert.equal(preset.pattern,'atelier-astral-veil');
 assert.equal(preset.panelPattern,'atelier-smoked-glass');
 assert.equal(preset.patternTarget,'background');
 assert.equal(validateDesignField('pattern',preset.pattern),preset.pattern);
 for(const [key,value] of Object.entries(preset))if(key!=='name'&&key!=='tagline'&&key!=='collection'){
   assert.notEqual(validateDesignField(key,value),null,'Invalid Astral Veil field: '+key);
 }
 const css=await read('../atlas-atelier-textures.css');
 for(const selector of ['data-arcana-design-pattern="atelier-astral-veil"','data-mini-pattern="atelier-astral-veil"','data-preview-pattern="atelier-astral-veil"'])assert.ok(css.includes(selector));
 assert.ok(css.includes('Non-tiled CSS gradients'));
});
