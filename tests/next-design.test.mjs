import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_NEXT_DESIGN, DESIGN_PRESETS, normalizeNextDesign, safeNextDesign, designVars } from '../next/design-model.js';

test('every preset is a valid design', () => {
  for (const p of DESIGN_PRESETS) assert.ok(normalizeNextDesign(p.design), p.id);
});
test('bad input is refused, never half-applied', () => {
  assert.equal(safeNextDesign(null), null);
  assert.equal(safeNextDesign({ ...DEFAULT_NEXT_DESIGN, accent: 'red;}body{display:none' }), null);
  assert.equal(safeNextDesign({ ...DEFAULT_NEXT_DESIGN, corners: 99 }), null);
  assert.equal(safeNextDesign({ ...DEFAULT_NEXT_DESIGN, headingFont: 'comic' }), null);
  assert.equal(safeNextDesign({ ...DEFAULT_NEXT_DESIGN, classColors: { ...DEFAULT_NEXT_DESIGN.classColors, mage: 'url(x)' } }), null);
});
test('design maps to CSS variables', () => {
  const v = designVars(DEFAULT_NEXT_DESIGN);
  assert.equal(v['--c-warrior'], '#E53935'); assert.equal(v['--r-lg'], '14px'); assert.match(v['--sans'], /Inter/);
});
