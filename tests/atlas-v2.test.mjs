import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {homeScreen,designPanel} from '../src/launch-navigation.js';
import {THEME_PATTERNS,THEME_PATTERN_IDS} from '../src/theme-patterns.js';
import {validateDesignField} from '../src/design-controls.js';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('Atlas v2 preserves six real entry points while compressing the mobile first fold',async()=>{
 const markup=homeScreen(),css=await read('home-atlas.css');
 assert.equal((markup.match(/class="atlasTile"/g)||[]).length,6);
 assert.match(markup,/class="atlasUpdate"/);
 assert.match(markup,/class="atlasHero"/);
 assert.match(markup,/id="atlasJournalMore"/);
 assert.match(markup,/data-journal-latest/);
 assert.match(markup,/data-route="wiki\/guides"/);
 assert.match(markup,/data-route="community"/);
 assert.match(css,/min-height:clamp\(96px,14.9dvh,111px\)/);
 assert.match(css,/@media\(max-width:759px\)/);
 assert.match(css,/@media\(max-width:759px\) and \(max-height:680px\)/);
});
test('Atelier contains 48 distinct recolorable patterns and existing themes still validate',async()=>{
 const names=THEME_PATTERNS.filter(x=>x.category==='Atelier');
 assert.equal(names.length,48);
 assert.equal(THEME_PATTERN_IDS.length,159);
 assert.equal(new Set(THEME_PATTERN_IDS).size,159);
 const css=await read('atlas-atelier-textures.css');
 for(const item of names){
  assert.match(item.id,/^atelier-[a-z0-9-]+$/);
  assert.equal(validateDesignField('pattern',item.id),item.id);
  assert.ok(css.includes('data-arcana-design-pattern="'+item.id+'"'),item.id+' missing from published stylesheet');
  assert.ok(css.includes('data-preview-pattern="'+item.id+'"'),item.id+' missing from thumbnails');
  assert.ok(css.includes('data-mini-pattern="'+item.id+'"'),item.id+' missing from miniature');
 }
 assert.match(css,/var\(--theme-highlight/);
 assert.match(css,/var\(--arcana-premium-pattern-alpha/);
 const panel=designPanel({showPreview:false});
 assert.doesNotMatch(panel,/data-pattern-category="Atelier"|Browse all 148 texture finishes/);
 assert.equal((panel.match(/class="designPreset studioV2Preset"/g)||[]).length,105);
});
test('Published editorial content replaces placeholders with safe DOM methods',async()=>{
 const code=await read('src/journal-home.js');
 const html=homeScreen();
 assert.match(html,/class="atlasJournalExtra"/);
 assert.match(code,/cache\.slice\(1,5\)/);
 assert.match(code,/url\.origin!==location\.origin/);
 assert.match(code,/textContent/);
 assert.match(code,/extras\.replaceChildren\(frag\)/);
});
