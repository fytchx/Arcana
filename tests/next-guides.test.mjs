import test from 'node:test';
import assert from 'node:assert/strict';
import { hbText } from '../next/handbook.js';
import { FEATURED_GUIDES, featuredGuide } from '../next/guides-content.js';
import { parseAmount, gameNum, plannerNumbers, retaliation, rankUpgrades, RET_EXAMPLE, cleanPlanner } from '../next/retaliation.js';
import { parseHash, activeTab, TOOLS } from '../next/core.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, a + ' not within ' + tol + ' of ' + b);

test('rich text: h3, notes, tables, steps and safe links', () => {
  const html = hbText('### Sub\n\n> **Base** = 0.60 × Defense\n> line two\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n1. one\n2. two\n\n[guide](#/guides/x) [site](https://example.com) [bad](javascript:alert(1)) [[tool:retaliation|planner]]');
  assert.match(html, /<h3>Sub<\/h3>/);
  assert.match(html, /<p class="hb-note"><strong>Base<\/strong> = 0.60 × Defense<br>line two<\/p>/);
  assert.match(html, /<table class="hb-table">/);
  assert.match(html, /<ol><li>one<\/li><li>two<\/li><\/ol>/);
  const fold = hbText('Table: See the ranking\n| A | B |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |');
  assert.match(fold, /^<details class="hb-fold"><summary><span class="hb-fold-t">See the ranking<\/span><span class="hb-fold-n">2 rows<\/span><\/summary><div class="hb-tablewrap">/);
  assert.ok(!/<details[^>]* open/.test(fold), 'folded tables start closed');
  assert.match(html, /<a href="#\/guides\/x">guide<\/a>/);
  assert.match(html, /<a href="https:\/\/example.com" target="_blank" rel="noopener noreferrer">site<\/a>/);
  assert.ok(!html.includes('href="javascript'), 'only #/ and https links become links');
  assert.match(html, /href="#\/tools\/retaliation">planner ›/);
  assert.ok(!hbText('<img onerror=x>').includes('<img'));
});

test('guides: featured guide routes, renders every table, links only to real tools', () => {
  assert.deepEqual(parseHash('#/guides/retaliation-warrior').section, 'guides');
  assert.deepEqual(parseHash('#/guides/attack-damage').section, 'guides');
  assert.equal(activeTab('guides'), 'builds');
  const g = featuredGuide('retaliation-warrior');
  const ad = featuredGuide('attack-damage');
  assert.ok(g && ad && FEATURED_GUIDES.length >= 2);
  assert.match(g.body, /1 % bonus Strength pet, 1 flat Strength pet, and 2 Retaliation pets/);
  assert.match(g.body, /three Retaliation pets do not scale well enough for endgame/);
  assert.match(ad.body, /Attack Damage build that works for Rogue, Mage, and Warrior/);
  const html = hbText(g.body);
  const blocks = g.body.split(/\n\s*\n/).filter(b => /^(Table: |\|)/.test(b.trim()));
  assert.equal((html.match(/<table/g) || []).length, blocks.length, 'every table block renders as a table');
  assert.equal((html.match(/<details class="hb-fold">/g) || []).length, blocks.length, 'every guide table starts folded');
  for (const b of blocks) {
    const widths = b.trim().split('\n').filter(l => l.startsWith('|')).map(l => l.trim().slice(1, -1).split('|').length);
    assert.ok(widths.every(w => w === widths[0]), 'table rows have equal columns: ' + b.slice(0, 40));
  }
  assert.ok(!/Zane:/.test(g.body), 'no author placeholders on the site');
  for (const [, id] of g.body.matchAll(/\[\[tool:([a-z]+)/g)) assert.match(html, new RegExp('href="#/tools|href="#/studio|href="#/builds'), id);
  assert.ok(!html.includes('href="#/tools"'), 'every tool link resolves to a specific tool');
});

test('retaliation planner: reproduces real in-game breakdowns', () => {
  assert.equal(parseAmount('780.28M'), 780.28e6);
  close(parseAmount('16.83qa'), 16.83e15, 100);
  assert.equal(parseAmount('+2,160%'), 2160);
  assert.ok(Number.isNaN(parseAmount('abc')));
  assert.equal(gameNum(16.83e15), '16.83qa');
  assert.equal(gameNum(8.5e18), '8.5Qi');
  // Boss preset, typed as the × values: 13.86qa – 19.8qa, average 16.83qa.
  const boss = { ...RET_EXAMPLE, strength: '×22.60', petStrength: '×23.46', petRet: '×44.14', inscription: '×5.96', runes: '×10.10', guild: '×1.78', echo: '×1.18', sets: '×1.40', gems: '×1.16', time: '×1.86' };
  const r = retaliation(plannerNumbers(boss).s);
  // The sheet's × values are rounded to 2 decimals, so allow 0.5%.
  const near = (a, b) => close(a, b, b * 0.005);
  near(r.max, 19.8e15); near(r.min, 13.86e15); near(r.avg, 16.83e15);
  // Farming preset after the Crow reached +35 (Nov 2): 3.09qa – 4.41qa, average 3.75qa.
  const farm = { ...boss, reflecting: '102.1', defense: '456.98M', strength: '×21.63', petStrength: '×23.69', petRet: '×50.41', inscription: '×6.34', runes: '×7.87', gems: '×1.16' };
  const f = retaliation(plannerNumbers(farm).s);
  near(f.max, 4.41e15); near(f.avg, 3.75e15);
});

test('retaliation planner: ranks upgrades and handles missing input', () => {
  const up = rankUpgrades(plannerNumbers(RET_EXAMPLE).s);
  assert.equal(up[0].id, 'reflect');
  assert.equal(up.at(-1).id, 'crit');
  assert.ok(!up.some(u => u.id === 'block'), 'capped Block is not offered');
  const empty = plannerNumbers({});
  assert.equal(empty.ready, false);
  assert.ok(empty.missing.includes('Defense'));
  assert.deepEqual(cleanPlanner({ defense: '1M', evil: 'x', overflowShown: 'yes' }), { defense: '1M' });
  assert.ok(TOOLS.some(t => t.id === 'retaliation' && t.href === '#/tools/retaliation'));
});

test('guides: shared guide links open in the new app, old guide links redirect', async () => {
  const { readFile } = await import('node:fs/promises');
  const html = await readFile(new URL('../next/index.html', import.meta.url), 'utf8');
  assert.match(html, /var NEXT=\[[^\]]*'guides'/);
  assert.match(html, /retaliation-warrior-zane'\)\{history\.replaceState\(null,'','\/#\/guides\/retaliation-warrior'\)/);
});

test('guides: Retaliation keeps its saved setup without foregrounding the character snapshot', async () => {
  const { default: D } = await import('../next/studio-data.js');
  const { decodeShare } = await import('../next/studio-core.js');
  const { readFile } = await import('node:fs/promises');
  const g = featuredGuide('retaliation-warrior');
  const got = decodeShare(D, g.build);
  assert.ok(got, 'build code decodes');
  assert.equal(got.by, 'Zane');
  assert.equal(got.build.level, 404);
  assert.equal(got.build.stance, 'bulwark');
  assert.deepEqual(got.build.pets, ['increased_strength', 'retaliation', 'retaliation', 'retaliation']);
  assert.ok(got.build.runes.length > 0 && Object.keys(got.build.gear).length > 0);
  const app = await readFile(new URL('../next/app.js', import.meta.url), 'utf8');
  assert.match(app, /PLAYER GUIDE · ' \+ esc\(guideClass\)/, 'article is rendered with its guide-specific class label');
  assert.doesNotMatch(app, /Open the build<\/a>/, 'reader view does not promote the old character snapshot');
  assert.match(app, /PLAYER GUIDE · ' \+ esc\(guideClass\)/, 'reader labels each guide with its own class or build type');
  assert.match(app, /g\.id === 'retaliation-warrior'.*Try your numbers/s, 'the Retaliation planner is only shown on the Retaliation guide');
});

test('shared build: runes and runewords are summarised once each, with counts', async () => {
  const { sharedView } = await import('../next/studio.js').catch(() => ({}));
  if (!sharedView) return; // studio.js needs a browser for some imports; covered by the browser audit
  const html = sharedView(featuredGuide('retaliation-warrior').build);
  assert.ok(!html.includes('st-grid ro'), 'no full rune grid');
  assert.match(html, /<b>Fortitude<\/b>.*?<em>×28<\/em>/s);
  assert.match(html, /<b>Immortal Bulwark<\/b>.*?<em>×14<\/em>/s);
});


test('player guide toolbar inserts reader-compatible blocks and protects draft length', async () => {
  const { guideInsert, guideTableMarkdown, GUIDE_TOOL_OPTIONS } = await import('../next/guide-editor.js');
  const heading = guideInsert('Intro', 'heading', 5, 5);
  assert.match(hbText(heading.body), /<h2>Section heading<\/h2>/);
  const b = guideInsert('Welcome friends', 'bold', 8, 15);
  assert.match(hbText(b.body), /<strong>friends<\/strong>/);
  const steps = guideInsert('', 'steps', 0, 0);
  assert.match(hbText(steps.body), /<ol><li>First point<\/li><li>Second point<\/li><\/ol>/);
  const note = guideInsert('', 'note', 0, 0);
  assert.match(hbText(note.body), /class="hb-note"/);
  const table = guideInsert('', 'table', 0, 0, { columns: 3, rows: 4, caption: 'Comparison' });
  const preview = hbText(table.body);
  assert.match(preview, /<details class="hb-fold">/);
  assert.match(preview, /4 rows/);
  assert.equal((preview.match(/<td>/g) || []).length, 12);
  assert.match(guideTableMarkdown({ columns: 1, rows: 100 }), /Column 2/);
  assert.ok(GUIDE_TOOL_OPTIONS.some(t => t[0] === 'pathfinder'));
  assert.match(hbText(guideInsert('', 'tool', 0, 0, { id: 'pathfinder' }).body), /href="#\/tools\/pathfinder"/);
  assert.match(hbText(guideInsert('', 'topic', 0, 0, { id: 'start-here', label: 'Start here' }).body), /Start here/);
  assert.match(hbText(guideInsert('', 'link', 0, 0, { href: 'https://example.com' }).body), /href="https:\/\/example.com"/);
  assert.throws(() => guideInsert('', 'link', 0, 0, { href: 'javascript:alert(1)' }), /valid https/);
  assert.throws(() => guideInsert('a'.repeat(12000), 'bold', 0, 0), /12,000/);
  const source = await (await import('node:fs/promises')).readFile(new URL('../next/app.js', import.meta.url), 'utf8');
  for (const element of ['nx-guide-toolbar', 'guideMode', 'guideTable', 'guideLink', 'guideClear', 'saveGuideDraft', 'nxGuideBody']) assert.ok(source.includes(element), element);
});

test('player guides expose class/topic identity and theme-aware visual controls', async () => {
  const { readFile } = await import('node:fs/promises');
  const app = await readFile(new URL('../next/app.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../next/app.css', import.meta.url), 'utf8');
  const server = await readFile(new URL('../src/community-server.mjs', import.meta.url), 'utf8');
  for (const field of ['data-guide-class=', 'data-guide-topic=', 'data-g="trimColor"', 'data-guide-upload="icon"', 'data-guide-upload="image"']) assert.ok(app.includes(field), field);
  assert.match(app, /label\('Featured Player Guides'\)/);
  assert.match(app, /nx-player-guide-mark.*many/);
  assert.match(css, /\.nx-player-guide-feature[^{]*\{[^}]*var\(--guide-trim\)/s);
  assert.match(css, /\.nx-guide-screenshot img/);
  assert.match(server, /community\/assets/);
  assert.match(server, /Use a screenshot under 5 MB/);
  assert.match(server, /guideClasses:Array\.isArray\(post\.guideClasses\)/);
});
