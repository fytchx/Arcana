/**
 * Manually transcribed from 43 IdleArc Beastmaster/Hunter screenshots
 * supplied 2026-10-17. These are INPUTS for reproducibility, not claimed
 * raw precision: game UI rounds a number of percentages and damage ranges.
 *
 * Screenshot version: lower-level hunter, Lv 94, ML 87.
 */
export const HUNTER_2026_10_17 = Object.freeze({
  attack: {
    weapon: {min: 895, max: 1280},
    jewelry: {min: 122, max: 203},
    additive: {
      equipment: 13,
      classSkills: 58,
      strengthFromItems: 102.8,
      intelligenceFromItems: 54.3,
      talisman: 56,
    },
    flat: {passive: 34, runes: 101, guild: 555},
    layers: {
      petBonus: 21,
      dropBonus: 25.4,
      passive: 2.6,
      runes: 18,
      strengthOther: 80.1,
      petIncreasedStrength: 9.1,
      intelligenceOther: 19.2,
      petIncreasedIntelligence: 5.9,
      guild: 77.8,
      gearSets: 12,
      gems: 3,
      timeBoost: 32,
      combatStance: 209.7,
    },
  },
  pet: {
    // The pet-card 198K-223K is a FINAL damage display, not base damage.
    // Do NOT silently substitute it for an unobserved pre-bonus pet base.
    base: null,
    flat: {runes: 58, guild: 555, passive: 77},
    layers: {
      equipmentAffixes: 182,
      dexterity: 14.8,
      intelligence: 10.5,
      companionDrop: 40.9,
      classSkills: 120,
      passive: 8.1,
      runes: 32.9,
      guild: 77.8,
      gearSets: 12,
      gems: 1.9,
      timeBoost: 32,
      combatStance: 209.7,
    },
  },
  combat: {
    critChance: 123.3,
    critDamage: 253,
    doubleHitChance: 33,
    doubleDamageChance: 89,
    alphaStrikeChance: 18,
    bossDamage: 30,
  },
  references: {
    attackMin: 175600,
    attackMax: 243800,
    attackLayerProduct: 38.21,
    petLayerProduct: 132.24,
    petDisplayedMin: 198000,
    petDisplayedMax: 223000,
    heroStrengthSheet: 255,
    heroStrengthBreakdown: 256,
    dexterity: 148,
    intelligence: 210,
    guildTreePercent: 51.9,
    guildAppliedPercent: 77.8,
    guildTreeFlatPet: 370,
    guildAppliedFlatPet: 555,
  },
});
