import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('Journal routes use Arcana’s app shell and its shared launcher icon',async()=>{
 const html=await read('index.html');
 const server=await read('server.mjs');
 const routing=await read('src/routing.js');
 const app=await read('src/app.js');
 const manifest=JSON.parse(await read('manifest.webmanifest'));
 assert.match(html,/rel="apple-touch-icon"/);
 assert.match(html,/rel="manifest" href="\/manifest\.webmanifest"/);
 assert.match(server,/readFile\(resolve\(ROOT,'index\.html'\)\)/);
 assert.match(routing,/location\.pathname/);
 assert.match(app,/journalIndexView/);
 assert.match(app,/journalArticleView/);
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
