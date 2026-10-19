import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DESIGN_PRESETS,validateDesignField,DEFAULT_DESIGN} from '../src/design-controls.js';
import {designPanel,settingsView} from '../src/launch-navigation.js';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const patterns=['contours','rings','stars','grid','aurora','diagonal','hex','grain','crystal','nebula','weave','runes','circuit','topography','facets','scanlines','honeycomb','plain'];
test('global appearance studio has 38 presets and classic pattern support',async()=>{
 const html=designPanel(),css=await read('../arcana-contour.css');
 assert.equal(Object.keys(DESIGN_PRESETS).length,42);
 for(const [id,p] of Object.entries(DESIGN_PRESETS)){
  assert.match(html,new RegExp('data-arg="'+id+'"'));
  assert.equal(validateDesignField('pattern',p.pattern),p.pattern,id+' uses a supported texture');
  for(const key of ['main','card','action','text'])assert.ok(/^#[0-9a-fA-F]{6}$/.test(p[key]),id+':'+key);
 }
 for(const mode of patterns){
  assert.equal(validateDesignField('pattern',mode),mode);
  assert.ok(css.includes('data-arcana-design-pattern="'+mode+'"'),'Missing site texture '+mode);
  if(mode!=='plain'&&mode!=='contours')assert.ok(css.includes('data-mini-pattern="'+mode+'"'),'Missing mini texture '+mode);
 }
 assert.ok(html.includes('data-design-preset-search'));
 assert.doesNotMatch(settingsView(),/data-design-preset-search/);
 assert.equal(validateDesignField('pattern','url(javascript:alert(1))'),null);
});
test('published theme styles work for guests without leaking editor controls',async()=>{
 const css=await read('../arcana-contour.css'),js=await read('../src/design-controls.js'),app=await read('../src/app.js');
 assert.match(js,/root\.dataset\.arcanaDesignActive=String\(active\)/);
 assert.ok(css.includes('html[data-arcana-design-active="true"]'));
 assert.ok(!css.includes('html[data-arcana-admin-design="true"]'),'Appearance stylesheet should not be restricted to admin visitors');
 assert.match(css,/background:color-mix\(in srgb,var\(--arcana-nav-panel/,'Public navigation should remain opaque while honoring the admin blend preference');
 assert.match(app,/setDesignPreview\(adminDesign\|\|tryOnTheme\(\)\)/);
 assert.match(app,/isLocalThemePlayground/);
 assert.match(app,/data-arcana-theme-try-on|arcanaThemeTryOn/);
});
test('mobile viewport never shrinks below a device-width view, and zoom-in remains available',async()=>{
 const html=await read('../index.html'),css=await read('../styles.css');
 assert.match(html,/minimum-scale=1/);
 assert.doesNotMatch(html,/user-scalable=no|maximum-scale=1/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/overflow-x:clip/);
 assert.match(css,/#content\{width:100%;min-width:0;max-width:100%;overflow-x:clip\}/);
});
test('Pathfinder presents compact input rows and folded biome categories',async()=>{
 const css=await read('../arcana-contour.css'),ui=await read('../src/pathfinder-material-view.js'),view=await read('../src/pathfinder-timeline-view.js');
 assert.match(css,/\.pathfinderHub \.pathRangeInputs fieldset\{display:grid;grid-template-columns:minmax\(0,1\.3fr\) minmax\(90px,\.7fr\)/);
 assert.match(ui,/i===0\?'open'/);
 assert.match(view,/Materials by biome/);
 assert.match(view,/Choose a slot to label your farming checklist/);
});

test('legacy upgrade entry points show verified full-range costs instead of partial tier-only totals',async()=>{
 const app=await read('../src/app.js');
 const nav=await read('../src/context-nav.js');
 assert.ok(app.includes("case 'calculators/upgrade':return pathfinderHub('range')"));
 assert.ok(nav.includes("params:{view:'range'},icon:'calculator'"));
 assert.ok(app.includes("['upgrade','Rarity Reference','calculator']"));
});
