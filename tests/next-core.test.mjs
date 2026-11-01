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

test('next: codex search ranks exact titles first and categories follow the data order', () => {
  const entries = codexEntries({ entries: [
    { id: 'item:wardplate', kind: 'item', title: 'Wardplate', facts: [] },
    { id: 'item:ward-ring', kind: 'item', title: 'Ward Ring', facts: [] },
    { id: 'skill:1', kind: 'skill', title: 'Ward', facts: [] },
    { id: 'x', kind: 'item' }
  ] });
  assert.equal(entries.length, 3);
  const hits = searchIndex(entries, 'ward').map(e => e.title);
  assert.equal(hits[0], 'Ward');
  assert.deepEqual([...hits].sort(), ['Ward', 'Ward Ring', 'Wardplate']);
  assert.deepEqual(searchIndex(entries, 'ring ward').map(e => e.title), ['Ward Ring']);
  assert.deepEqual(searchIndex(entries, '   '), []);
  assert.deepEqual(codexCategories(entries, ['skill', 'item']).map(c => [c.kind, c.count]), [['skill', 1], ['item', 2]]);
});

test('next: codex data is complete, linked and matches verified numbers', async () => {
  const { default: C } = await import('../next/codex-data.js');
  const { kindName, kindSingular } = await import('../next/core.js');
  const ids = new Set(C.entries.map(e => e.id));
  assert.equal(ids.size, C.entries.length, 'ids are unique');
  for (const e of C.entries) {
    assert.ok(e.title && C.kinds.includes(e.kind), e.id);
    for (const r of e.related || []) assert.ok(ids.has(r), e.id + ' -> ' + r);
    for (const l of e.links) assert.ok(/^#\/(studio(\/(gear|pets|runes|class|passive|stance))?|codex|tools\/(pathfinder|pet|affix|ml))$/.test(l.href) || (l.ext && /^\/#\/[a-z/-]+$/.test(l.href)), e.id + ' link ' + l.href);
    for (const [k, v] of e.facts) assert.equal(typeof v, 'string', e.id + ' fact ' + k);
  }
  const count = k => C.entries.filter(e => e.kind === k).length;
  assert.equal(count('item'), 40); assert.equal(count('skill'), 90); assert.equal(count('affix'), 26);
  assert.equal(count('drop-bonus'), 21); assert.equal(count('rune-word'), 24); assert.equal(count('rune'), 7);
  const ward = C.entries.find(e => e.id === 'item:wardplate');
  assert.deepEqual(ward.facts.find(f => f[0].startsWith('Defense')), ['Defense (Infernal)', '1006–1749']);
  assert.ok(ward.related.includes('affix:of-the-bulwark'));
  assert.ok(!ward.related.includes('affix:blazing'));
  assert.equal(C.entries.find(e => e.id === 'pet:retaliation').facts.find(f => f[0] === 'Legendary at C10')[1], '+84%');
  assert.equal(kindName('rune-word'), 'Rune words'); assert.equal(kindSingular('affix'), 'Affix');
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

test('next: sign-in offers only the providers the server has turned on', async () => {
  const { signInButtons } = await import('../next/core.js');
  assert.match(signInButtons({ providers: { google: true } }), /google\/login/);
  assert.doesNotMatch(signInButtons({ providers: { google: true } }), /Discord/);
  assert.match(signInButtons({ providers: { discord: true, google: true } }), /Discord[\s\S]*Google/);
  assert.match(signInButtons({}), /off on this server/);
});

test('next: sign-in return only goes back into /next and only once', async () => {
  const { safeReturn } = await import('../next/core.js');
  assert.equal(safeReturn('/next#/studio/gear'), '/next#/studio/gear');
  assert.equal(safeReturn('/next'), '/next');
  assert.equal(safeReturn('https://evil.example/next'), null);
  assert.equal(safeReturn('//evil.example'), null);
  assert.equal(safeReturn('/next#/x"><script>'), null);
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const s = html.slice(html.indexOf('<script id="arcana-next-return">'), html.indexOf('<script id="arcana-boot-control">'));
  assert.match(s, /indexOf\('#\/account'\)!==0\)return/);
  assert.match(s, /sessionStorage\.removeItem\(k\)/);
  assert.match(s, /\/\^\\\/next/);
});

test('next: Home shows recently used tools, newest first, with sensible defaults', async () => {
  const { rememberTool, recentTiles } = await import('../next/core.js');
  assert.deepEqual(recentTiles([]).map(t => t.id), ['studio', 'pathfinder', 'codex']);
  let list = rememberTool([], 'pet');
  list = rememberTool(list, 'mlxp');
  list = rememberTool(list, 'pet');
  assert.deepEqual(list, ['pet', 'mlxp']);
  assert.deepEqual(recentTiles(list).map(t => t.id), ['pet', 'mlxp', 'studio']);
  assert.deepEqual(rememberTool(['a', 'b'], 'nope'), []);
  assert.equal(rememberTool(['pet', 'ml', 'affix', 'studio'], 'codex').length, 3);
  assert.ok(recentTiles(['pet']).every(t => t.href.startsWith('#/')));
});
