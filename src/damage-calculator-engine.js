/**
 * Arcana damage calculation kernel.
 *
 * The stages and the default screenshot fixture are based on IdleArc's
 * in-game Attack Damage Breakdown and Pet Damage Breakdown, 2026-10-17.
 * This module does NOT model pet base/level scaling, enemy mitigation,
 * critical-hit damage semantics, elemental weakness, or actual attack speed.
 *
 * A source is counted ONCE in its stage. Callers must not combine an
 * already-aggregated character total with its constituent item sources.
 */
const finite = value => {
  if (value === '' || value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(-1e12, Math.min(1e12, n)) : 0;
};
const sum = values => Object.values(values || {}).reduce((total, value) => total + finite(value), 0);
const range = value => ({
  min: Math.max(0, finite(value?.min)),
  max: Math.max(0, finite(value?.max ?? value?.min)),
});
const normalizedRange = value => {
  const r = range(value);
  return {min: Math.min(r.min, r.max), max: Math.max(r.min, r.max)};
};
const supplied = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
const suppliedRange = value => supplied(value?.min) || supplied(value?.max);

/**
 * Start a new character without silently retaining Hunter screenshot values.
 * Null means "not measured"; explicit zero means the player entered zero.
 * The calculator can still calculate partial stages while marking coverage.
 */
export function blankDamageBuild() {
  return {
    className: 'Custom',
    attack: {weapon:{min:null,max:null},jewelry:{min:null,max:null},additive:{},flat:{},layers:{}},
    pet: {base:{min:null,max:null},flat:{},layers:{}},
    combat: {}, retaliation: {},
  };
}

/** Percentage layers stack independently. Percentages inside a single stage add. */
export function percentageProduct(layers = {}) {
  const breakdown = Object.entries(layers).map(([key, pct]) => ({
    key, percent: finite(pct), factor: Math.max(0, 1 + finite(pct) / 100),
  }));
  return {factor: breakdown.reduce((result, part) => result * part.factor, 1), breakdown};
}

/**
 * ATTACK tooltip:
 *  ((weapon + jewelry flat) * (1 + summed additive % / 100)
 *      + skill-tree flat + rune flat + guild flat)
 *      * product(independent % layers).
 *
 * Flat bonuses enter AFTER the additive-% stage, not before it.
 */
export function calculateAttack(input = {}) {
  const weapon = normalizedRange(input.weapon);
  const jewelry = normalizedRange(input.jewelry);
  const base = {min: weapon.min + jewelry.min, max: weapon.max + jewelry.max};
  const additivePct = sum(input.additive);
  const additiveFactor = Math.max(0, 1 + additivePct / 100);
  const flatBonus = sum(input.flat);
  const layers = percentageProduct(input.layers);
  const known = suppliedRange(input.weapon) || suppliedRange(input.jewelry);
  const complete = ['min','max'].every(end => supplied(input.weapon?.[end]) && supplied(input.jewelry?.[end]));
  const preLayers = {
    min: Math.max(0, base.min * additiveFactor + flatBonus),
    max: Math.max(0, base.max * additiveFactor + flatBonus),
  };
  return {
    kind: 'attack', known, complete, base, additivePct, additiveFactor,
    flatBonus, preLayers, layerFactor: layers.factor,
    layerBreakdown: layers.breakdown,
    min: preLayers.min * layers.factor,
    max: preLayers.max * layers.factor,
  };
}

/**
 * PET tooltip:
 *   (individual pet base + level scaling + flat pet sources)
 *      * product(pet % layers).
 *
 * 'base' must be a pet's actual pre-bonus damage. If unknown, caller can
 * omit it and use only layerFactor for multiplier-only comparisons.
 */
export function calculatePet(input = {}) {
  const hasBase = suppliedRange(input.base);
  const base = hasBase ? normalizedRange(input.base) : null;
  const flatBonus = sum(input.flat);
  const layers = percentageProduct(input.layers);
  return {
    kind: 'pet', base, flatBonus, layerFactor: layers.factor,
    layerBreakdown: layers.breakdown,
    min: base ? Math.max(0, base.min + flatBonus) * layers.factor : null,
    max: base ? Math.max(0, base.max + flatBonus) * layers.factor : null,
  };
}

/** Rates taken from the in-game stat help panels, 2026-10-17. */
export const ATTRIBUTE_RATES = Object.freeze({
  strengthAttack: 0.75,
  strengthRetaliation: 0.5,
  intelligenceAttack: 0.38,
  dexterityPet: 0.1,
  intelligencePet: 0.05,
  intelligenceDoubleDamageChance: 0.2,
  dexterityDodgeChance: 0.05,
});
export function attributePercent(points, rate) {
  return finite(points) * finite(rate);
}

/**
 * Uncapped Double Hit and Double Damage probabilities:
 * 250% = 3 guaranteed hits/multiplier, 50% chance of the 4th.
 *
 * Expected hits on a target which survives the earlier hit(s):
 *   1 + chance / 100.
 * Do NOT use this factor to predict farming kills of one-shot enemies.
 */
export function overflowRoll(chance) {
  const safeChance = Math.max(0, finite(chance));
  const whole = Math.floor(safeChance / 100);
  const remainder = safeChance - whole * 100;
  return {
    chance: safeChance,
    guaranteed: 1 + whole,
    chanceOfNext: remainder,
    expected: 1 + safeChance / 100,
  };
}

/**
 * Crit Chance overflow converts 1:1 into bonus Crit Damage.
 * Deliberately no crit expected-damage factor: current screenshots do not
 * establish whether the displayed Crit Damage is a BONUS or TOTAL factor.
 *
 * Alpha Strike and Hunter's Mark are context-dependent and kept out of
 * the character-sheet Attack/Pet tooltip calculations.
 */
export function combatReference(stats = {}) {
  const critChance = Math.max(0, finite(stats.critChance));
  const doubleHit = overflowRoll(stats.doubleHitChance);
  const doubleDamage = overflowRoll(stats.doubleDamageChance);
  const alphaChance = Math.max(0, Math.min(100, finite(stats.alphaStrikeChance)));
  return {
    crit: {
      effectiveChance: Math.min(100, critChance),
      overflowCritDamage: Math.max(0, critChance - 100),
      displayedCritDamage: finite(stats.critDamage),
      adjustedCritDamage: finite(stats.critDamage) + Math.max(0, critChance - 100),
    },
    doubleHit, doubleDamage,
    alphaStrike: {chance: alphaChance, conditionalExpectedFactor: 1 + alphaChance / 100},
    boss: {bonusPercent: finite(stats.bossDamage), conditionalFactor: Math.max(0, 1 + finite(stats.bossDamage) / 100)},
  };
}

/** Compare any strictly positive reference value without phantom infinite gains. */
export function relativeDifference(baseline, candidate) {
  const before = Number(baseline), after = Number(candidate);
  if (!Number.isFinite(before) || !Number.isFinite(after) || before <= 0) return null;
  return {ratio: after / before, percentChange: 100 * (after / before - 1)};
}

/** Two independent snapshots, never adding inputs from a previous scenario. */
export function compareBuilds(baseline = {}, scenario = {}) {
  const attackA = calculateAttack(baseline.attack), attackB = calculateAttack(scenario.attack);
  const petA = calculatePet(baseline.pet), petB = calculatePet(scenario.pet);
  return {
    baseline: {attack: attackA, pet: petA, combat: combatReference(baseline.combat)},
    scenario: {attack: attackB, pet: petB, combat: combatReference(scenario.combat)},
    changes: {
      attack: {min: relativeDifference(attackA.min, attackB.min), max: relativeDifference(attackA.max, attackB.max)},
      petMultiplier: relativeDifference(petA.layerFactor, petB.layerFactor),
      petDamage: petA.min !== null && petB.min !== null ? relativeDifference(petA.min, petB.min) : null,
    },
  };
}
