import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PAGES} from '../src/guidebook-seed.mjs';
import {CHAPTERS,EXTERNAL_CLASS_GUIDES} from '../next/guidebook-content.js';
import {normalizePage} from '../src/guidebook-server.mjs';
import {parseHash,activeTab} from '../next/core.js';

test('Guidebook has stable IDs, sequence, contributors, linked source, and no leaked private reviewer notes',()=>{
 const ids=new Set(PAGES.map(p=>p.id));assert.equal(ids.size,PAGES.length);
 assert.equal(CHAPTERS.length,9);
 for(const p of PAGES){
  assert.ok(CHAPTERS.some(c=>c.id===p.chapter),p.id);
  assert.ok(p.title&&p.answer&&p.author,p.id);
  for(const ref of p.related||[])assert.ok(ids.has(ref),p.id+' -> '+ref);
  assert.ok(!/\bZane:\s/.test(p.body),p.id+' leaked reviewer notes');
  if(p.status==='awaiting')assert.match(p.body,/reserved for (?:its|the) contributor/);
 }
 assert.equal(PAGES.filter(p=>p.status==='review').length,9);
 assert.ok(EXTERNAL_CLASS_GUIDES.some(x=>x.id==='retaliation-warrior'));
 assert.ok(PAGES.find(p=>p.id==='gear').body.includes('Grounded Treads'));
 assert.ok(PAGES.find(p=>p.id==='grind-ml').body.includes('one-shotting'));
});
test('Guidebook sanitizes editorial changes and carries bylines through page saves',()=>{
 assert.throws(()=>normalizePage({id:'../../secrets',chapter:'start',title:'No',answer:'An answer that is long enough'}),/address/);
 assert.throws(()=>normalizePage({id:'ok',chapter:'made-up',title:'No',answer:'An answer that is long enough'}),/chapter/);
 const page=normalizePage({id:'gear',chapter:'systems',title:'Gear',answer:'Spend on meaningful upgrades.',body:'Text',author:'Guest author',status:'review',related:['pets','runes','../bad'],trust:'estimated'});
 assert.equal(page.author,'Guest author');assert.equal(page.status,'review');
 assert.deepEqual(page.related,['pets','runes']);
});
test('Guidebook routes, source server and editor use isolated paths; no production replacement',async()=>{
 assert.equal(parseHash('#/guidebook/gear').section,'guidebook');
 assert.equal(parseHash('#/guidebook/edit/pets').id,'edit/pets');
 assert.equal(activeTab('guidebook'),'search');
 const app=await readFile(new URL('../next/app.js',import.meta.url),'utf8');
 const srv=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 const editor=await readFile(new URL('../next/guidebook-editor.js',import.meta.url),'utf8');
 const reader=await readFile(new URL('../next/guidebook.js',import.meta.url),'utf8');
 const handbook=await readFile(new URL('../next/handbook.js',import.meta.url),'utf8');
 const seedUpdates=await readFile(new URL('../src/guidebook-seed-updates.mjs',import.meta.url),'utf8');
 const guidebookServer=await readFile(new URL('../src/guidebook-server.mjs',import.meta.url),'utf8');
 const entryHtml=await readFile(new URL('../next/index.html',import.meta.url),'utf8');
 const nextAllowlist=entryHtml.match(/var NEXT=\[([^\]]+)\]/)?.[1]||'';
 assert.match(nextAllowlist,/'guidebook'/,'Guidebook deep links must stay in Arcana Next, not redirect to /classic');
 assert.match(app,/guidebookView/);
 assert.match(srv,/api\/admin\/guidebook/);
 assert.match(editor,/Save draft/);
 assert.match(editor,/data-ge/);
 assert.match(reader,/publishedIds\.has\(p\.id\)/,'Published pages remain in chapter directories even if an editor has a pending revision');
 assert.doesNotMatch(reader,/!\['systems-overview','grind-ml'\]/,'Published ML page must not be excluded from the directory');
 assert.match(reader,/publishedIds\.has\(x\.id\)&&x\.id!=='systems-overview'/,'Next-page sequence includes published ML page');
 assert.match(handbook,/\(p\.next \? byId\.get\(p\.next\) : null\) \|\| list\[i \+ 1\]/,'Missing explicit Handbook next targets fall back to the next page');
 assert.match(seedUpdates,/SEED_UPDATES\['harmony-overview'\]=\{chapter:'classes'\}/,'Harmony overview belongs in the main Playbook');
 assert.match(guidebookServer,/migrateHarmonyOverview/,'Existing Harmony overview drafts are moved without replacing their text');
 assert.match(editor,/Player Guides is a separate collection/,'Editor explains the separate Player Guides destination');
 assert.doesNotMatch(editor,/dataset\?\.he/);
 assert.match(srv,/pathname==='\/api\/guidebook'\|\|pathname==='\/api\/admin\/guidebook'/);
});
