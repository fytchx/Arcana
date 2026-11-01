import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTheme, themeVars, contrast } from '../next/theme.js';

test('theme input is validated', () => {
  assert.equal(normalizeTheme(null), null);
  assert.equal(normalizeTheme({ bg: 'red', card: '#111111', accent: '#ffffff' }), null);
  const t = normalizeTheme({ bg: '#0d1019', card: '#191e2b', accent: '#a98bff', art: 'javascript:alert(1)', strength: 900 });
  assert.equal(t.bg, '#0D1019'); assert.equal(t.art, null); assert.equal(t.strength, 100); assert.equal(t.accent2, '#A98BFF');
  assert.equal(normalizeTheme({ bg: '#000000', card: '#111111', accent: '#ffffff', art: 'vision-astral-veil' }).art, 'vision-astral-veil');
});

test('accent text is always readable on cards', () => {
  for (const accent of ['#3B0A75', '#101010', '#A98BFF', '#FFE600']) {
    const t = normalizeTheme({ bg: '#0D1019', card: '#191E2B', accent });
    const v = themeVars(t);
    assert.ok(contrast(v.ink, t.card) >= 4.5, accent);
  }
});
