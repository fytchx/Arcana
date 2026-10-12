import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read = async path=>(await readFile(new URL(path,import.meta.url),'utf8'));
test('signature is part of the rendered application footer', async()=>{
 const code=await read('../src/app.js');
 assert.match(code,/Guild leader of PDX &amp; OVK/);
 assert.match(code,/Made by <em>Zane<\/em>/);
 assert.equal(code.includes('Created by <em>Zane</em>'),false);
});
test('no generated Railway wrapper in the website source',async()=>{
 const app=await read('../src/app.js');
 assert.equal(app.includes('brotliDecompressSync'),false);
 assert.equal(app.includes('Bun.serve'),false);
});
test('category navigation has native links and remembered scroll position',async()=>{
 const views=await read('../src/wiki-views.js');
 const app=await read('../src/app.js');
 assert.match(views,/wikiCategoryScroll/);
 assert.match(views,/href="#\/wiki\/library\?kind=/);
 assert.match(app,/__prevWikiX/);
});
test('every local JS module import resolves to a local file', async()=>{
 const {readdir,stat} = await import('node:fs/promises');const {resolve,dirname} = await import('node:path');
 const src=resolve(new URL('../src/',import.meta.url).pathname); const files=await readdir(src);
 for(const name of files.filter(n=>n.endsWith('.js'))) {
  const js=await readFile(resolve(src,name),'utf8');
  const imports=[...js.matchAll(/\bfrom\s*['"](\.\/[^'"]+)['"]/g)].map(m=>m[1].split('?')[0]);
  for(const imp of imports){assert.equal((await stat(resolve(dirname(resolve(src,name)),imp))).isFile(),true,`${name}: ${imp}`);}
 }
});

test('all importers share one asset module instance (no URL query aliases)',async()=>{
 const app=await read('../src/app.js');
 const views=await read('../src/wiki-views.js');
 assert.match(app,/from '\.\/assets\.js'/);
 assert.match(views,/from '\.\/assets\.js'/);
 assert.equal(/from ['"]\.\/assets\.js\?/.test(app+views),false);
});

test('verified catalog supplements only real pet and currency sprite records',async()=>{
 const server=await read('../server.mjs');
 assert.match(server,/async function verifiedCatalog\(/);
 assert.match(server,/const match=key\.match\(\/\^\(currency\|pet\):/);
 assert.match(server,/if\(existing\.has\(id\)\)continue/);
 assert.match(server,/catalogCache=\{\.\.\.payload,entries:/);
});

test('Codex presents visual atlas separately from compact mechanics rows', async()=>{
 const views=await read('../src/wiki-views.js');
 assert.match(views,/wikiShelfSwitch/);
 assert.match(views,/wikiGalleryList/);
 assert.match(views,/wikiRecordText/);
 assert.match(views,/wikiReferenceTopics/);
 assert.match(views,/wikiAtlasTopics/);
});

test('signature inherits the live theme highlight, rather than hardcoding violet',async()=>{
 const html=await read('../index.html');
 const signature=html.split('.arcanaSignature{')[1]?.split('.wikiCategoryScroll{')[0]||'';
 assert.ok(signature,'Signature CSS should be present');
 assert.match(signature,/--sigAccent:var\(--theme-highlight/);
 assert.match(signature,/\.arcanaSigText em\{[^}]*var\(--sigAccent\)/);
 assert.match(signature,/\.arcanaSigInfo summary\{[^}]*var\(--sigAccent\)/);
 assert.equal(signature.includes('var(--highlight,#b99cff)'),false);
});

test('Codex search remains clearable, gives helpful empty results and retries a failed index',async()=>{
 const views=await read('../src/wiki-views.js');
 const app=await read('../src/app.js');
 assert.match(views,/class="wikiClearFilter"/);
 assert.match(views,/No matches for/);
 assert.match(views,/data-action="wikiretry"/);
 assert.match(views,/id="wikiShowing"/);
 assert.match(app,/case 'wikiretry':/);
 assert.match(app,/if\(clear\)clear.hidden=!wikiState.query/);
});

test('Codex references return to the user-selected collection',async()=>{
 const {wikiRecordView}=await import('../src/wiki-views.js');
 const sample={id:'game:item:broken-sword',title:'Broken Sword',gameKind:'item',description:'Practice weapon'};
 const html=wikiRecordView(sample,[], 'all');
 assert.match(html,/data-params="kind=all"/);
 const material=wikiRecordView(sample,[], 'material');
 assert.match(material,/data-params="kind=material"/);
});

test('Codex show-more expands in place and details remember reading position',async()=>{
 const app=await read('../src/app.js');
 assert.match(app,/case 'wikimore':\{/);
 assert.match(app,/const container=node\('wikiRecords'\)/);
 assert.match(app,/wikiState\.returnPosition=\{kind:/);
 assert.match(app,/requestAnimationFrame\(\(\)=>window\.scrollTo\(\{top:saved\.top/);
});

test('verified item comparison comes from configured stat snapshot only',async()=>{
 const app=await read('../src/app.js'),views=await read('../src/verified-item-views.js');
 assert.match(app,/verifiedComparisonPanel\(left\?\.title,right\?\.title,state\.compareTier\)/);
 assert.match(app,/case 'comparetier'/);
 assert.match(app,/verifiedUpgradeReferencePanel\(e\?\.title\)/);
 assert.match(views,/not a character’s rolled stats/);
});

test('Pet tools show only Compound→Drop Bonus and target level shard cost',async()=>{
 const app=await read('../src/app.js'),views=await read('../src/pet-simple-views.js'),studio=await read('../src/labs-views.js');
 assert.match(app,/simpleCompoundCalculatorView\(state\.compoundQuick\)/);
 assert.match(app,/simpleAffixCostView\(state\.affixCostQuick\)/);
 assert.match(app,/case 'petcompoundstep'/);
 assert.match(app,/case 'petaffixstep'/);
 assert.match(app,/data-pet-bonus-target/);
 assert.match(views,/Compound → Drop Bonus/);
 assert.match(views,/Upgrade cost to target/);
 assert.match(views,/Pet Shards/);
 assert.doesNotMatch(studio,/\['pets','labs\/pets'/);
 assert.match(studio,/Four desired pet Drop Bonuses/);
});
