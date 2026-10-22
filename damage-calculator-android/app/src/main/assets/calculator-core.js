(function (root) {
  'use strict';

  function round(value, mode) {
    if (mode === 'floor') return Math.floor(value);
    if (mode === 'ceil') return Math.ceil(value);
    if (mode === 'none') return value;
    return Math.round(value);
  }

  function sum(values) {
    return values.reduce((total, value) => total + (Number(value) || 0), 0);
  }

  function applyLayers(base, percentages, rounding) {
    let value = base;
    let product = 1;
    for (const percentage of percentages) {
      const factor = 1 + Math.max(-99.999, Number(percentage) || 0) / 100;
      product *= factor;
      value = round(value * factor, rounding);
    }
    return { value, product };
  }

  function range(low, high) {
    return {
      min: low,
      max: high,
      average: (low + high) / 2
    };
  }

  function attack(input, rounding = 'nearest') {
    const additive = sum(input.additivePercentages || []);
    const additiveFactor = 1 + additive / 100;
    const flat = sum(input.flatBonuses || []);
    const run = weapon => {
      const amplifiedWeapon = round((Number(weapon) || 0) * additiveFactor, rounding);
      const base = round(amplifiedWeapon + flat, rounding);
      return { base, ...applyLayers(base, input.multiplicativePercentages || [], rounding) };
    };
    const low = run(input.weaponMin);
    const high = run(input.weaponMax);
    return {
      ...range(low.value, high.value),
      baseMin: low.base,
      baseMax: high.base,
      additivePercent: additive,
      additiveFactor,
      layeredProduct: low.product
    };
  }

  function pet(input, rounding = 'nearest') {
    const flat = sum(input.flatBonuses || []);
    const run = (baseDamage, levelScaling) => {
      const base = round((Number(baseDamage) || 0) + (Number(levelScaling) || 0) + flat, rounding);
      return { base, ...applyLayers(base, input.multiplicativePercentages || [], rounding) };
    };
    const low = run(input.baseMin, input.levelMin);
    const high = run(input.baseMax, input.levelMax);
    return {
      ...range(low.value, high.value),
      baseMin: low.base,
      baseMax: high.base,
      layeredProduct: low.product
    };
  }

  function retaliation(input, rounding = 'nearest') {
    const basePoolPercent = sum(input.basePoolPercentages || []);
    const globalRatio = Math.max(0, input.globalRatio == null ? 0.6 : (Number(input.globalRatio) || 0));
    const varianceMin = Math.max(0, Math.min(1, input.varianceMin == null ? 0.7 : (Number(input.varianceMin) || 0)));
    const blockBonusPercent = input.blockBonusPercent == null ? 50 : (Number(input.blockBonusPercent) || 0);
    const blockFactor = 1 + Math.max(-99.999, blockBonusPercent) / 100;
    const run = defense => {
      const base = round((Number(defense) || 0) * globalRatio * (basePoolPercent / 100), rounding);
      return { base, ...applyLayers(base, input.multiplicativePercentages || [], rounding) };
    };
    const low = run(input.defenseMin);
    const high = run(input.defenseMax);
    const normalMin = round(low.value * varianceMin, rounding);
    const normalMax = high.value;
    return {
      ...range(normalMin, normalMax),
      baseMin: low.base,
      baseMax: high.base,
      basePoolPercent,
      globalRatio,
      varianceMin,
      blockBonusPercent,
      blockFactor,
      blockedMin: round(normalMin * blockFactor, rounding),
      blockedMax: round(normalMax * blockFactor, rounding),
      layeredProduct: low.product
    };
  }

  const api = { round, applyLayers, attack, pet, retaliation };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ArcanaDamageCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
