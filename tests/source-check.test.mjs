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
