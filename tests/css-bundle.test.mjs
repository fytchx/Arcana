import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {SITE_STYLES,buildSiteCss,siteCssBundle} from '../src/css-bundle.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));

test('stylesheet bundling preserves source order and keeps CSS imports legal',()=>{
 const output=buildSiteCss([
  ['alpha.css','.alpha{color:red}'],
  ['fonts.css',"@import url('https://fonts.googleapis.com/css?family=Example');\n.beta{color:blue}"],
  ['omega.css','.omega{color:green}']
 ]);
 assert.ok(!output.includes('@import'),'External fonts must not block critical CSS');
 assert.ok(output.indexOf('.alpha')<output.indexOf('.beta'));
 assert.ok(output.indexOf('.beta')<output.indexOf('.omega'));
 assert.equal((output.match(/@import/g)||[]).length,0);
});

test('homepage loads exactly one CSS entry, which includes every existing theme and feature style',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const cssLinks=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="(\/[^"?]+)/g)].map(match=>match[1]);
 assert.deepEqual(cssLinks,['/arcana-site.css']);
 assert.equal(SITE_STYLES.length,27);
 assert.ok(SITE_STYLES.includes('season2-guide.css'),'Season 2 reader stylesheet must be bundled');
 assert.equal(new Set(SITE_STYLES).size,SITE_STYLES.length);
 const sourceContents=await Promise.all(SITE_STYLES.map(file=>readFile(new URL('../'+file,import.meta.url),'utf8')));
 const bundle=await siteCssBundle(root);
 assert.ok(bundle.plain.length>500000,'Expected entire site theme/style collection');
 assert.ok(bundle.gzip.length<bundle.plain.length/2,'Gzip must reduce transfer size');
 assert.deepEqual(gunzipSync(bundle.gzip),bundle.plain);
 const css=bundle.plain.toString('utf8');
 let last=-1;
 for(const name of SITE_STYLES){
  const marker='/* Arcana source: '+name+' */';
  const next=css.indexOf(marker);
  assert.ok(next>last,'Out-of-order or missing CSS '+name);
  last=next;
 }
 // Preserve non-import declaration bytes, without silently dropping a feature stylesheet.
 for(let i=0;i<SITE_STYLES.length;i++){
  const cleaned=sourceContents[i].replace(/^[ \t]*@import[ \t]+[^;\r\n]+;[ \t]*(?:\r?\n)?/gm,'');
  assert.ok(css.includes(cleaned),'Missing rules from '+SITE_STYLES[i]);
 }
 assert.match(html,/<h1>Arcana: The IdleArc Companion<\/h1>/);
 assert.match(html,/href="\/pathfinder"/);
});
