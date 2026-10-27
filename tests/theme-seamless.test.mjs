import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {THEME_PATTERNS} from '../src/theme-patterns.js';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
test('all 84 texture styles carry explicit rendering behavior and remain editable',()=>{
 assert.equal(THEME_PATTERNS.length,160);
 assert.equal(new Set(THEME_PATTERNS.map(p=>p.id)).size,160);
 const groups=THEME_PATTERNS.reduce((out,p)=>{out[p.behavior]=(out[p.behavior]||0)+1;return out},{});
 assert.equal(groups.none,1);
 assert.ok(groups.material>=25);
 assert.ok(groups.atmospheric>=25);
 assert.ok(groups.ornamental>=8);
 for(const p of THEME_PATTERNS)assert.ok(['none','material','atmospheric','ornamental'].includes(p.behavior),p.id);
});
test('continuous field rendering overrides all CSS tile sizes everywhere a texture appears',async()=>{
 const css=await read('../theme-seamless.css');
 const index=await read('../index.html'),server=await read('../server.mjs'),smoke=await read('./mobile_smoke.py');
 assert.match(css,/background-repeat:no-repeat!important/);
 assert.match(css,/background-size:100% 100%!important/);
 for(const selector of ['#content:not(.homeFullscreen)','.pathRangeWorkspace','.launchHero,.launchQuickCard', '.miniHero,.miniTile', '.themePatternThumb[data-preview-pattern]', '.designPresetArt[data-signature-art]', '[data-mini-pattern-target="background"]']){
   assert.ok(css.includes(selector),selector+' not covered by seam engine');
 }
 const bundle=await read('../src/css-bundle.mjs');
  assert.ok(index.includes('/arcana-site.css'));
 assert.ok(bundle.indexOf("'theme-seamless.css'")>bundle.indexOf("'signature-themes.css'"));
 assert.ok(bundle.indexOf("'theme-seamless.css'")>bundle.indexOf("'home-three.css'"));
 assert.ok(server.includes("'/theme-seamless.css'"));
 assert.ok(smoke.includes('for href in re.findall('),'Browser smoke should load every stylesheet linked by index.html');
 assert.ok(smoke.includes('css_name=urlparse(href).path'),'Browser smoke should resolve stylesheet URLs to repository files');
});
test('legacy micro-patterns and signature materials scale gradient geometry, not images',async()=>{
 const seam=await read('../theme-seamless.css'),legacy=await read('../arcana-contour.css');
 const signature=await read('../signature-themes.css'),mini=await read('../src/design-mini-preview.js');
 for(const p of ['contours','grid','stars','circuit','brushed-metal','moire','satin','scanlines']){
  assert.ok(seam.includes('data-arcana-design-pattern="'+p+'"'),p+' public program missing');
  assert.ok(seam.includes('data-mini-pattern="'+p+'"'),p+' mini program missing');
  assert.ok(seam.includes('data-preview-pattern="'+p+'"'),p+' gallery program missing');
 }
 assert.match(seam,/--seam-scale:var\(--mini-signature-scale,1\)/);
 assert.match(legacy,/calc\([0-9.]+px \* var\(--arcana-pattern-scale,1\)\)/);
 assert.match(legacy,/calc\([0-9.]+px \* var\(--mini-signature-scale,1\)\)/);
 assert.match(signature,/calc\([0-9.]+px \* var\(--sig-scale,1\)\)/);
 assert.match(signature,/--sig-scale:var\(--arcana-pattern-scale,1\)/);
 assert.match(mini,/--mini-signature-scale/);
 assert.ok(!seam.includes('background-repeat:repeat!important'));
});
