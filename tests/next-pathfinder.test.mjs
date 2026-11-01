import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathfinderNumbers } from '../next/pathfinder.js';
import { quickUpgradeContent, shortGold } from '../src/quick-tools-view.js';
import { money } from '../src/pathfinder-timeline.js';

// Reuse the classic Pathfinder test fixture (synthetic; no game prices are invented).
const src = await readFile(new URL('./pathfinder-quantity-integrated.test.mjs', import.meta.url), 'utf8');
const fixture = (0, eval)('(' + src.slice(src.indexOf('const fixture=') + 'const fixture='.length, src.indexOf(';\nconst catalog=')) + ')');

test('pathfinder: Arcana Next shows the same quantities and gold as the classic Pathfinder', () => {
  for (const costMode of ['min', 'expected', 'pity']) for (const quantity of [1, 3]) {
    const range = { fromStage: 'A4', fromLevel: 0, toStage: 'A6', toLevel: 1, quantity, costMode };
    const next = pathfinderNumbers(fixture, range);
    const classic = quickUpgradeContent(fixture, range, { page: true, catalog: [] });
    assert.ok(next.materials.length > 0);
    for (const m of next.materials) assert.ok(classic.includes(money(m.quantity)), costMode + ' x' + quantity + ' ' + m.name + ' ' + money(m.quantity));
    assert.ok(classic.includes(shortGold(next.gold)), costMode + ' gold ' + shortGold(next.gold));
  }
});

test('pathfinder: defaults to the Average scenario like the classic tool', () => {
  const range = { fromStage: 'A4', fromLevel: 0, toStage: 'A5', toLevel: 1 };
  const avg = pathfinderNumbers(fixture, { ...range, costMode: 'expected' });
  assert.deepEqual(pathfinderNumbers(fixture, range).gold, avg.gold);
});

test('pathfinder: ML XP shows the same time, XP and kills as the classic planner', async () => {
  const { displayKills } = await import('../next/pathfinder.js');
  const { calculatePathfinderMlXp, pathfinderMlXpResults } = await import('../src/pathfinder-ml-xp.js');
  const plans = [{ level: 1, target: 30 }, { level: 120, target: 200, progress: 40 }, { level: 300, target: 310 }, { level: 250, target: 500, farmMode: 'fixed', biome: 'glass' }, { level: 499, target: 500 }];
  for (const p of plans) {
    const m = calculatePathfinderMlXp(p), html = pathfinderMlXpResults(p), reg = m.variants[1];
    assert.match(html, new RegExp('id="pathMlTotalKills">≈' + displayKills(reg.kills).replace(/,/g, ',') + '<'), JSON.stringify(p));
    assert.ok(html.includes('id="pathMlTotalXp">≈' + m.requiredDisplay + '<'), JSON.stringify(p));
    assert.ok(html.includes('≈' + reg.etaDisplay), JSON.stringify(p));
    for (const v of m.variants) assert.ok(html.includes('≈' + displayKills(v.kills) + ' <span>kills'), v.id + ' ' + JSON.stringify(p));
  }
});
