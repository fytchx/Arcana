/* Derived from October 9 IdleArc configuration. Data definitions only: no invented calculations. */
export const VERIFIED_GAME_DATA=Object.freeze({
  "snapshotVersion": "2026-10-06-002+chat+realms+tower+offsum+awaken+runewords+forge+affixcap+gems+gempresets+charslots+retaliation+raids+raidchat+chestbuff+chestrunes+convergence+season_pass+spgift+pass-arc_pass_s2+posprog+dkinds",
  "runeFamilies": [
    {
      "slug": "fury",
      "name": "Fury",
      "primary": "attack_damage",
      "suggestedSecondary": "critical_damage",
      "color": "red"
    },
    {
      "slug": "vitality",
      "name": "Vitality",
      "primary": "max_health",
      "suggestedSecondary": "defense",
      "color": "green"
    },
    {
      "slug": "precision",
      "name": "Precision",
      "primary": "critical_strike_chance",
      "suggestedSecondary": "double_hit_chance",
      "color": "blue"
    },
    {
      "slug": "fortitude",
      "name": "Fortitude",
      "primary": "defense",
      "suggestedSecondary": "max_health",
      "color": "pink"
    },
    {
      "slug": "wisdom",
      "name": "Wisdom",
      "primary": "exp_gain",
      "suggestedSecondary": "gold_gain",
      "color": "purple"
    },
    {
      "slug": "fortune",
      "name": "Fortune",
      "primary": "gold_gain",
      "suggestedSecondary": "pet_damage_percent",
      "color": "orange"
    },
    {
      "slug": "bond",
      "name": "Bond",
      "primary": "pet_damage_bonus",
      "suggestedSecondary": "attack_damage_percent",
      "color": "cyan"
    }
  ],
  "runeSecondaryStats": [
    "attack_damage_percent",
    "max_health",
    "defense",
    "critical_strike_chance",
    "critical_damage",
    "double_hit_chance",
    "double_damage_chance",
    "exp_gain",
    "gold_gain",
    "pet_damage_percent",
    "strength",
    "dexterity",
    "intelligence",
    "retaliation_percent"
  ],
  "runeShapes": [
    {
      "slug": "small",
      "name": "Small",
      "width": 1,
      "height": 1
    },
    {
      "slug": "wide",
      "name": "Wide",
      "width": 2,
      "height": 1
    },
    {
      "slug": "tall",
      "name": "Tall",
      "width": 1,
      "height": 2
    },
    {
      "slug": "long",
      "name": "Long",
      "width": 3,
      "height": 1
    },
    {
      "slug": "tower",
      "name": "Tower",
      "width": 1,
      "height": 3
    },
    {
      "slug": "medium",
      "name": "Medium",
      "width": 2,
      "height": 2
    }
  ],
  "petAffixes": [
    {
      "name": "exp_gain",
      "display_name": "Experience Gain",
      "base_value": 1,
      "scaling_per_level": 0.2,
      "max_level": null,
      "value_type": "percent"
    },
    {
      "name": "gold_gain",
      "display_name": "Gold Gain",
      "base_value": 1,
      "scaling_per_level": 0.2,
      "max_level": null,
      "value_type": "percent"
    },
    {
      "name": "item_quantity",
      "display_name": "Item Quantity",
      "base_value": 1,
      "scaling_per_level": 0.1,
      "max_level": null,
      "value_type": "percent"
    },
    {
      "name": "material_quantity",
      "display_name": "Material Quantity",
      "base_value": 1,
      "scaling_per_level": 0.1,
      "max_level": null,
      "value_type": "percent"
    },
    {
      "name": "damage_conversion",
      "display_name": "Damage converted to {pet_element}",
      "base_value": 5,
      "scaling_per_level": 0.5,
      "max_level": null,
      "value_type": "percent"
    },
    {
      "name": "ruby_drops",
      "display_name": "Ruby Drops",
      "base_value": 1,
      "scaling_per_level": 0.1,
      "max_level": null,
      "value_type": "percent"
    },
    {
      "name": "rune_drops",
      "display_name": "Rune Drops",
      "base_value": 1,
      "scaling_per_level": 0.1,
      "max_level": null,
      "value_type": "percent"
    },
    {
      "name": "all_skills",
      "display_name": "All Class Skills",
      "base_value": 1,
      "scaling_per_level": 1,
      "max_level": 2,
      "value_type": "flat"
    },
    {
      "name": "extra_kill_chance",
      "display_name": "Extra Kill Chance",
      "base_value": 3,
      "scaling_per_level": 0,
      "max_level": 1,
      "value_type": "percent"
    }
  ],
  "petHatchBonuses": [
    "attack_damage",
    "pet_damage",
    "retaliation",
    "max_health",
    "dodge",
    "exp_gain",
    "gold_gain",
    "item_find",
    "strength",
    "dexterity",
    "intelligence",
    "life_on_kill",
    "life_on_hit",
    "crit_chance",
    "defense",
    "double_hit_chance",
    "critical_damage",
    "increased_strength",
    "increased_dexterity",
    "increased_intelligence",
    "block_chance",
    "double_damage_chance",
    "all_skills"
  ],
  "petAffixCapacity": 4,
  "petDefaultAffixSlots": 2,
  "petEquippedSlots": 4,
  "petEqualisation": {
    "seasonal": 10,
    "permanent": 25
  }
} );
