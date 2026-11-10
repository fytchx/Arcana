import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, PAGES } from '../next/handbook-content.js';
import { hbText } from '../next/handbook.js';

test('Handbook keeps all 59 English pages across 12 chapters', () => {
  assert.equal(CHAPTERS.length, 12);
  assert.equal(PAGES.length, 59);
  assert.equal(new Set(PAGES.map(p => p.id)).size, 59);
  assert.ok(PAGES.every(p => p.answer && p.body));
});

test('each class has distinct guidance and the full skill tree', () => {
  const ids = ['warrior', 'archer', 'mage', 'rogue', 'druid'];
  const classes = ids.map(id => PAGES.find(p => p.id === 'class-' + id));
  assert.ok(classes.every(Boolean));
  assert.equal(new Set(classes.map(p => p.answer)).size, 5);
  classes.forEach(p => {
    assert.match(p.body, /^## How /);
    assert.match(p.body, /## Skills by branch/);
    assert.match(p.body, /\| Branch \| Skills \|/);
    assert.match(p.body, /\[\[build-types\|build types\]\]/);
  });
});

test('all Handbook page and chapter links still resolve', () => {
  const pageIds = new Set(PAGES.map(p => p.id));
  const chapterIds = new Set(CHAPTERS.map(c => c.id));
  for (const p of PAGES) {
    for (const m of p.body.matchAll(/\[\[([a-z]+:)?([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g)) {
      const kind = (m[1] || '').replace(':', '');
      if (kind === 'tool' || kind === 'list') continue;
      assert.ok((kind === 'chapter' ? chapterIds : pageIds).has(m[2]), p.id + ' links to missing ' + m[2]);
    }
  }
});

test('pet pages distinguish new client evidence from unconfirmed server behavior', () => {
  const hatch = PAGES.find(p => p.id === 'hatching');
  const pet = PAGES.find(p => p.id === 'pet-bonuses');
  assert.match(hatch.body, /Batch hatching \(1\.3\.15 client\)/);
  assert.match(pet.body, /Bulk Reforge protections \(1\.3\.15 client\)/);
  assert.match(hatch.body, /not confirmed server behavior/);
  assert.match(pet.body, /not confirmed server behavior/);
});

test('oversized tables fold but smaller tables remain visible and unchanged', () => {
  const wide = '| A | B | C | D | E | F |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 2 | 3 | 4 | 5 | 6 |';
  const small = '| A | B |\n| --- | --- |\n| 1 | 2 |';
  assert.match(hbText('## Rune costs\n\n' + wide), /<details class="hb-fold">/);
  assert.match(hbText('## Small list\n\n' + small), /<div class="hb-tablewrap">/);
  assert.doesNotMatch(hbText(small), /<details class="hb-fold">/);
  assert.match(hbText(PAGES.find(p => p.id === 'biome-monsters').body), /<details class="hb-fold">/);
});

test('event archive and season wording remain historically scoped', () => {
  const event = PAGES.find(p => p.id === 'hallowed-harvest');
  const seasons = PAGES.find(p => p.id === 'seasons-and-realms');
  assert.match(event.title, /event archive/);
  assert.match(event.body, /November 14/);
  assert.doesNotMatch(seasons.answer, /running now/i);
});