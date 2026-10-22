const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../app/src/main/assets/calculator-core.js');

test('attack adds the summed additive bonus to weapon damage before flat bonuses and independent layers', () => {
  const result = core.attack({
    weaponMin: 7310,
    weaponMax: 10440,
    additivePercentages: [209, 1650, 68.4, 56],
    flatBonuses: [1630, 2130],
    multiplicativePercentages: [16, 42.4, 381, 526.9, 30.7, 77.8, 12, 34, 12.9, 71]
  }, 'none');
  const addFactor = 1 + (209 + 1650 + 68.4 + 56) / 100;
  const layerProduct = [16,42.4,381,526.9,30.7,77.8,12,34,12.9,71]
    .reduce((product, pct) => product * (1 + pct / 100), 1);
  assert.ok(Math.abs(result.min - ((7310 * addFactor + 3760) * layerProduct)) < 1e-5);
  assert.ok(Math.abs(result.max - ((10440 * addFactor + 3760) * layerProduct)) < 1e-5);
  assert.equal(result.additivePercent, 1983.4);
});

test('pet multiplier layers stack multiplicatively and reproduce the shown 5.35K factor', () => {
  const percentages = [863,95,27.9,134.1,98,243,35.2,141.5,77.8,3,16,13.5,41,1,25];
  const result = core.pet({baseMin:1,baseMax:1,levelMin:0,levelMax:0,flatBonuses:[],multiplicativePercentages:percentages}, 'none');
  assert.ok(Math.abs(result.layeredProduct - 5350) < 20);
});

test('retaliation base pool uses defense, global ratio, and the sum of reflection bonuses', () => {
  const result = core.retaliation({
    defenseMin:41020000, defenseMax:41020000, globalRatio:0.60,
    basePoolPercentages:[129.3,40,15], multiplicativePercentages:[]
  }, 'none');
  assert.ok(Math.abs(result.min - 45359916) < 1000);
  assert.ok(Math.abs(result.basePoolPercent - 184.3) < 1e-8);
});

test('damage rounding can be turned off or selected per damage stage', () => {
  const input={weaponMin:1.4,weaponMax:1.4,additivePercentages:[10],flatBonuses:[],multiplicativePercentages:[10]};
  assert.equal(core.attack(input,'nearest').min,2);
  assert.ok(Math.abs(core.attack(input,'none').min-1.694)<1e-10);
  assert.equal(core.round(2.9,'floor'),2);
  assert.equal(core.round(2.1,'ceil'),3);
});
