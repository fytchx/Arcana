import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('Arcana can be installed with a proper launcher icon from both app and Journal pages',async()=>{
 const html=await read('index.html');
 const journal=await read('src/journal-server.mjs');
 const server=await read('server.mjs');
 const manifest=JSON.parse(await read('manifest.webmanifest'));
 assert.match(html,/rel="apple-touch-icon"/);
 assert.match(html,/rel="manifest" href="\/manifest\.webmanifest"/);
 assert.match(journal,/rel="apple-touch-icon"/);
 assert.match(journal,/rel="manifest" href="\/manifest\.webmanifest"/);
 assert.match(server,/\.webmanifest':'application\/manifest\+json/);
 assert.match(server,/publicPage=new Set\(\['\/index\.html','\/manifest\.webmanifest'/);
 assert.equal(manifest.display,'standalone');
 assert.deepEqual(manifest.icons.map(x=>x.sizes),['192x192','512x512']);
 for(const icon of manifest.icons)assert.ok((await stat(new URL('../'+icon.src.slice(1),import.meta.url))).size>1000);
});

test('home Tools opens its tools page, overlays hold the background scroll position, and search opens ready to type',async()=>{
 const app=await read('src/app.js');
 assert.match(app,/else if\(arg==='tools'\)go\('calculators'\)/);
 assert.match(app,/function lockLayerScroll\(\)/);
 assert.match(app,/body\.style\.position='fixed'/);
 assert.match(app,/window\.scrollTo\(lock\.x,lock\.y\)/);
 assert.match(app,/function searchLanding\(\)/);
 assert.match(app,/input\.focus\(\{preventScroll:true\}\)/);
 assert.doesNotMatch(app,/function searchFeatured\(/);
});
