import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  SURFACES, ACCENTS, surfaceById, accentById, parseHash, hashFor, activeTab, searchIndex,
  codexEntries, codexCategories, sortArticles, articleHtml, liveEvents, esc, TOOLS
} from '../next/core.js';

test('next: theme offers four backgrounds and five curated accents, no game colors', () => {
  assert.deepEqual(SURFACES.map(s => s.id), ['slate', 'midnight', 'obsidian', 'dusk']);
  assert.equal(ACCENTS.length, 5);
  for (const retired of ['neon-green', 'amber-gold', 'crimson-red']) assert.ok(!ACCENTS.some(a => a.id === retired));
  // A retired or unknown saved accent falls back to Arcane Violet instead of breaking.
  assert.equal(accentById('crimson-red').id, 'arcane-violet');
  assert.equal(surfaceById(null).id, 'slate');
  // Backgrounds match the classic site exactly, so switching sites keeps the same look.
  assert.equal(surfaceById('midnight').bg, '#080E19');
});

test('next: routes parse, round-trip, and unknown sections fall back to home', () => {
  assert.deepEqual({ ...parseHash('#/codex/game:item:wardplate'), query: undefined }, { section: 'codex', id: 'game:item:wardplate', query: undefined });
  assert.equal(parseHash(hashFor('news', 'hallowed-harvest-2026-guide')).id, 'hallowed-harvest-2026-guide');
  assert.equal(parseHash('#/labs/build').section, 'home');
  assert.equal(parseHash('').section, 'home');
  assert.equal(activeTab('profile'), '');
  assert.equal(activeTab('builds'), 'builds');
  assert.equal(activeTab('studio'), 'tools');
  assert.equal(parseHash('#/build?d=abc').query.get('d'), 'abc');
  assert.equal(parseHash('#/studio/runes').id, 'runes');
});

test('next: codex keeps only verified game entries and ranks exact titles first', () => {
  const entries = codexEntries({ entries: [
    { id: 'game:item:wardplate', kind: 'item', title: 'Wardplate', facts: [['Slot', 'Chest'], 'bad'] },
    { id: 'game:item:ward-ring', kind: 'item', title: 'Ward Ring' },
    { id: 'game:skill:ward', kind: 'skill', title: 'Ward' },
    { id: 'arcana-tool:x', kind: 'tool', title: 'Ward tool' },
    { id: 'game:item:nameless', kind: 'item' }
  ] });
  assert.equal(entries.length, 3);
  assert.deepEqual(entries[0].facts, [['Slot', 'Chest']]);
  const hits = searchIndex(entries, 'ward').map(e => e.title);
  assert.equal(hits[0], 'Ward');
  assert.deepEqual([...hits].sort(), ['Ward', 'Ward Ring', 'Wardplate']);
  assert.deepEqual(searchIndex(entries, 'ring ward').map(e => e.title), ['Ward Ring']);
  assert.deepEqual(searchIndex(entries, '   '), []);
  assert.deepEqual(codexCategories(entries).map(c => [c.kind, c.count]), [['item', 2], ['skill', 1]]);
});

test('next: news sorts featured first, then newest', () => {
  const sorted = sortArticles([
    { slug: 'a', title: 'A', publishedAt: '2026-10-01' },
    { slug: 'b', title: 'B', publishedAt: '2026-10-30' },
    { slug: 'c', title: 'C', publishedAt: '2026-09-01', featured: true },
    { title: 'no slug' }
  ]);
  assert.deepEqual(sorted.map(a => a.slug), ['c', 'b', 'a']);
});

test('next: article bodies render the journal format and escape everything else', () => {
  const html = articleHtml('## Heading\n\nHello **world** <script>\n\n- one\n- two\n\n[[distribution]]', 'class-balance');
  assert.match(html, /<h2>Heading<\/h2>/);
  assert.match(html, /<strong>world<\/strong> &lt;script&gt;/);
  assert.match(html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(html, /classic page/);
  assert.ok(!html.includes('<script>'));
  assert.equal(esc('"<&>\''), '&quot;&lt;&amp;&gt;&#39;');
});

test('next: events hide themselves after they end', () => {
  assert.equal(liveEvents(new Date('2026-11-01T12:00:00Z')).length, 1);
  assert.equal(liveEvents(new Date('2026-11-09T00:00:00Z')).length, 0);
});

test('next: every tool link points at a real classic route', async () => {
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  for (const t of TOOLS.filter(x => !x.native)) {
    const route = t.href.replace('/#/', '').split('?')[0];
    assert.ok(app.includes("case '" + route + "'"), t.name + ' -> ' + route);
  }
});

test('next: the server serves the new app without exposing other files', async () => {
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  assert.match(server, /pathname==='\/next'/);
  assert.match(server, /\^\\\/next\\\/\[a-z\]\[a-z0-9-\]\*\\\.\(\?:js\|css\)\$/);
  assert.match(server, /'x-robots-tag':'noindex, nofollow'/);
});
