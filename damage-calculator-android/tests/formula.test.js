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
  assert.ok(Math.abs(result.baseMin - 45359916) < 1000);
  assert.ok(Math.abs(result.basePoolPercent - 184.3) < 1e-8);
});

test('retaliation applies the datamined 0.70 variance floor, stance to all hits, and block bonus only conditionally', () => {
  const result = core.retaliation({
    defenseMin:41020000, defenseMax:41020000, globalRatio:0.60, varianceMin:0.70, blockBonusPercent:75,
    basePoolPercentages:[129.3,40,15],
    multiplicativePercentages:[1351,351,447,92,349.8,77.8,12,34,12.9,71,25]
  }, 'none');
  assert.ok(Math.abs(result.max - 904.4e9) / 904.4e9 < 0.002);
  assert.ok(Math.abs(result.min / result.max - 0.70) < 1e-10);
  assert.equal(result.blockFactor, 1.75);
  assert.ok(Math.abs(result.blockedMax / result.max - 1.75) < 1e-10);
});

test('damage rounding can be turned off or selected per damage stage', () => {
  const input={weaponMin:1.4,weaponMax:1.4,additivePercentages:[10],flatBonuses:[],multiplicativePercentages:[10]};
  assert.equal(core.attack(input,'nearest').min,2);
  assert.ok(Math.abs(core.attack(input,'none').min-1.694)<1e-10);
  assert.equal(core.round(2.9,'floor'),2);
  assert.equal(core.round(2.1,'ceil'),3);
});
