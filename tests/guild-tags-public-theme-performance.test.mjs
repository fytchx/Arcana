import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {psychedelicSvg,applyPsychedelicTexture,PSYCHEDELIC_IDS} from '../src/psychedelic-patterns.js';
import {DEFAULT_DESIGN} from '../src/design-controls.js';
import {guildHubPage} from '../src/guild-hub-ui.js';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
test('visitor theme uses one small cached SVG motif, not per-tile copies or an iframe',async()=>{
 for(const pattern of PSYCHEDELIC_IDS){
  const values={...DEFAULT_DESIGN,pattern};
  const url=psychedelicSvg(pattern,values);
  assert.ok(url.startsWith('url("data:image/svg+xml,'),pattern);
  assert.ok(url.length<60000,pattern+' bloated data URL '+url.length);
  const decoded=decodeURIComponent(url.slice('url("data:image/svg+xml,'.length,-2));
  assert.ok(decoded.includes('<use href="#'),pattern+' must reuse SVG paths');
  assert.ok((decoded.match(/<use /g)||[]).length<=9,pattern+' too many duplicate layers');
  assert.equal(psychedelicSvg(pattern,values),url,'SVG cache did not reuse identical appearance');
 }
 const fake={values:new Map(),reads:0,writes:0,getPropertyValue(k){this.reads++;return this.values.get(k)||''},setProperty(k,v){this.values.set(k,v);this.writes++},removeProperty(k){this.values.delete(k)}};
 const root={style:fake};
 const active={...DEFAULT_DESIGN,pattern:'orbit-jelly'};
 applyPsychedelicTexture(root,active);assert.equal(fake.writes,1);
 applyPsychedelicTexture(root,active);assert.equal(fake.writes,1,'unchanged theme should not trigger another paint');
 const view=await read('../src/theme-live-frame.js');
 assert.doesNotMatch(view,/localStorage\.setItem|fetch\('/);
 const app=await read('../src/app.js');
 assert.ok(app.includes("case 'theme-playground'"));
 assert.ok(app.includes('isLocalThemePlayground'));
});
test('guild crest and icon studio are absent from shipped UI and guild API',async()=>{
 const nav=await read('../src/launch-navigation.js'),ui=await read('../src/guild-hub-ui.js');
 const server=await read('../src/guild-hub-server.mjs'),html=await read('../index.html'),pkg=await read('../package.json');
 assert.doesNotMatch(nav,/Guild Crest Designer|guilds\/crest/);
 assert.doesNotMatch(ui,/renderCrest|crestStudio|guildHubCrestCTA|guildHubIconInput|iconDataUrl/);
 assert.doesNotMatch(html,/guild-crest-workshop.css/);
 assert.doesNotMatch(pkg,/guild-crest-workshop\.js|guild-crest\.js/);
 assert.doesNotMatch(server,/validateCrest|defaultCrest|iconDataUrl|pendingIconDataUrl/);
 assert.match(server,/Guild crests have been retired/);
 assert.match(server,/Guild page icons are no longer supported/);
 const directory=guildHubPage('guilds',new URLSearchParams(),null);
 assert.match(directory,/Your guild\. Your tag/);
 assert.doesNotMatch(directory,/[Cc]rest|<svg class="arcanaGuildCrest"/);
});
