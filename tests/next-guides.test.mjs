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
  assert.match(html, /<a href="#\/guides\/x">guide<\/a>/);
  assert.match(html, /<a href="https:\/\/example.com" target="_blank" rel="noopener noreferrer">site<\/a>/);
  assert.ok(!html.includes('href="javascript'), 'only #/ and https links become links');
  assert.match(html, /href="#\/tools\/retaliation">planner ›/);
  assert.ok(!hbText('<img onerror=x>').includes('<img'));
});

test('guides: featured guide routes, renders every table, links only to real tools', () => {
  assert.deepEqual(parseHash('#/guides/retaliation-warrior').section, 'guides');
  assert.equal(activeTab('guides'), 'builds');
  const g = featuredGuide('retaliation-warrior');
  assert.ok(g && FEATURED_GUIDES.length >= 1);
  const html = hbText(g.body);
  const tables = g.body.split(/\n\s*\n/).filter(b => b.trim().startsWith('|')).length;
  assert.equal((html.match(/<table/g) || []).length, tables, 'every table block renders as a table');
  for (const b of g.body.split(/\n\s*\n/).filter(b => b.trim().startsWith('|'))) {
    const widths = b.trim().split('\n').map(l => l.trim().slice(1, -1).split('|').length);
    assert.ok(widths.every(w => w === widths[0]), 'table rows have equal columns: ' + b.slice(0, 40));
  }
  assert.ok(!/\[Zane:/.test(g.body), 'no author placeholders on the site');
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
