# Slot-based Upgrade Optimizer: verified data and formula audit

**Source:** 2026-10-21-003 equipment implicit ranges (40 items); 2026-09-30-001 equipment affix definitions (26 affixes); prior complete game config for multipliers.

**Confirmed game behavior (user screenshots and explanation):** Equipment +enhancement and Awakening progression belong to the **slot**, not the equipped item's rarity, art, or cosmetic appearance. A Legendary skin on A5+1 retains the A5+1 slot stats and affix slots.

**Unverified:** The available item table explicitly gives base `T1–T6` ranges, NOT an explicit A1+0 displayed-value table. They are included below as raw reference, **not a claimed A1 baseline**. Likewise, numeric coefficients do not establish the executable order, cap application, or rounding.

## Confirmed source parameters
| Parameter | Value | Boundary |
|---|---:|---|
| Equipment Awakening `multiplier_per_level` | 12% per Awakening rank | Exact operation/rounding unverified |
| Affix enhancement `affix_enhancement_scaling` | 3% | Need slot-level application order |
| Individual affix Awakening `affix_boost_per_awaken` | 10% per assigned rank | Distinct from equipment 12% |
| Enhancement softcap | Starts at 90, subsequent rate 50% | Effective-level accumulation must be verified |
| General cap expansions | Base 20%; level 20% | Need operation order and stat-specific exceptions |
| Exceptions | Frozen damage reduction, flat bloodthirst growth | Do not blanket-scale every stat |

## 40 item templates: T6 source ranges, **not verified A1+0**
| Base item | Slot | Primary stat | T6 minimum | T6 maximum | Secondary stat at T6 |
|---|---|---|---:|---:|---|
| Broken Sword | main_hand | melee_physical_damage | 1430 | 2555 | — |
| Rags | chest | defense | 2012 | 3497 | — |
| Leather Cap | head | defense | 1330 | 2320 | — |
| Worn Gloves | hands | defense | 1103 | 1928 | — |
| Sandals of Starszy | feet | defense | 1103 | 1928 | — |
| Wooden Rod | main_hand | magic_damage | 1265 | 2240 | — |
| Wooden Bow | main_hand | physical_damage | 1210 | 2118 | — |
| Wooden Shield | off_hand | block_chance | 23 | 26 | — |
| Old Book | off_hand | crit_damage | 73 | 88 | — |
| Quiver | off_hand | pet_mastery_level | 6 | 6 | strength_dexterity 25–31 |
| Warrior's Belt | belt | life_on_hit | 19 | 22 | — |
| Warrior's Ring | ring | strength | 100 | 124 | — |
| Warrior's Amulet | amulet | strength | 101 | 125 | — |
| Ranger's Belt | belt | life_on_kill | 46 | 55 | — |
| Ranger's Ring | ring | dexterity | 100 | 124 | — |
| Ranger's Amulet | amulet | dexterity | 101 | 125 | — |
| Torch | torch | all_skills | 3 | 3 | — |
| Adventurer's Ring | ring | strength_dexterity | 100 | 124 | — |
| Adventurer's Amulet | amulet | strength_dexterity | 101 | 125 | — |
| Rusty Dagger | main_hand | dagger_physical_damage | 452 | 807 | — |
| Scholar's Belt | belt | all_attributes | 102 | 126 | — |
| Scholar's Ring | ring | intelligence | 100 | 124 | — |
| Scholar's Amulet | amulet | intelligence | 101 | 125 | — |
| Greatsword | main_hand | greatsword_physical_damage | 2074 | 3705 | strength 24–30 |
| Crossbow | main_hand | crossbow_physical_damage | 1694 | 2965 | crit_chance 50–50 |
| Grand Staff | main_hand | grand_staff_magic_damage | 1771 | 3136 | staff_intelligence 48–60 |
| Claws | main_hand | claw_physical_damage | 565 | 1009 | claw_crit_chance 100–100 |
| Gnarled Stick | main_hand | stick_physical_damage | 950 | 1500 | stick_pet_damage 50–50 |
| Wardplate | chest | defense | 1006 | 1749 | flat_damage_reduction 4–5 |
| Bloodweave Vest | chest | defense | 1207 | 2098 | vest_life_on_hit 10–13 |
| Harmonic Cuirass | chest | defense | 1207 | 2098 | attack_pet_damage 19–22 |
| Visionary Hood | head | defense | 798 | 1392 | helm_crit_chance 6–7 |
| Beast Crown | head | defense | 798 | 1392 | helm_pet_damage 32–40 |
| Sage Diadem | head | defense | 798 | 1392 | helm_all_skills 1–1 |
| Slayer Gauntlets | hands | defense | 552 | 964 | glove_crit_chance 9–10 |
| Berserker Grips | hands | defense | 552 | 964 | glove_attack_damage 32–40 |
| Symbiotic Handwraps | hands | defense | 607 | 1060 | attack_pet_damage 19–22 |
| Swiftstride Boots | feet | defense | 662 | 1157 | boots_double_hit 7–8 |
| Grounded Treads | feet | defense | 772 | 1350 | boots_block_chance 9–10 |
| Pathfinder Treads | feet | defense | 662 | 1157 | gold_exp_gain 18–20 |

## 26 ordinary affixes: raw unscaled minimum/maximum rolls
| Affix | Stat | Min base roll | Max base roll | Valid items |
|---|---|---:|---:|---|
| Blazing | damage_conversion_fire | 3 | 5 | weapon |
| Earthen | damage_conversion_earth | 3 | 5 | weapon |
| Evasive | dodge_chance | 0.5 | 1 | chest_armor, helmet, boots, gloves, shield, torch |
| of Ambulance | max_health | 10 | 50 | chest_armor, helmet, boots, gloves, amulet, ring, belt |
| of Fortification | local_flat_defense | 3 | 10 | chest_armor, helmet, boots, gloves |
| of Pet Damage | pet_damage_bonus | 2 | 8 | all |
| of the Bulwark | local_percent_defense | 10 | 30 | chest_armor, helmet, boots, gloves |
| of Warding | damage_reduction | 1 | 3 | chest_armor, helmet, shield, torch |
| Tidal | damage_conversion_water | 3 | 5 | weapon |
| Venomous | damage_conversion_poison | 3 | 5 | weapon |
| Verdant | damage_conversion_nature | 3 | 5 | weapon |
| Voltaic | damage_conversion_air | 3 | 5 | weapon |
| of Bloodthirst | bloodthirst_percent | 1 | 2 | torch |
| of Crit Chance | critical_strike_chance | 1 | 2 | all |
| of Crit Damage | crit_damage | 1 | 3 | all |
| of Devastation | double_damage_chance | 1 | 2 | all |
| of Dexterity | dexterity | 2 | 4 | weapon, ring, amulet, belt |
| of Double Hit | double_hit_chance | 1 | 2 | weapon, amulet, ring, belt |
| of Experience | exp_gain | 1 | 3 | all |
| of Intelligence | intelligence | 2 | 4 | weapon, ring, amulet, belt |
| of Regeneration | life_on_hit | 1 | 1 | weapon, ring, amulet |
| of Strength | strength | 2 | 4 | weapon, ring, amulet, belt |
| of Striking | jewelry_flat_damage | 4 | 10 | ring, amulet, belt |
| of the Fortress | defense_percent | 3 | 8 | belt, ring, amulet |
| of Vampirism | life_on_kill | 3 | 10 | weapon, ring, amulet |
| of Wealth | gold_gain | 2 | 5 | all |

## Correct modeling contract
1. `EquipmentSlot` owns `{slotId, awakenRank, plusLevel}`. `EquippedItem` owns `{itemId, visualRarity}`. Cosmetic rarity must not modify slot progression.
2. Ordinary affixes use their known legal equipment types and **maximum rolled quality** by default. A max-quality affix still gains subsequent enhancement and its own Awakening rank boosts.
3. Add affix-specific rank controls (I/II/III/…) whose source coefficient is **10%**, separate from slot's **12%** Awakening coefficient.
4. Screenshots from separate Warrior's Rings are **not** controlled before/after experiments. Observed Legendary visual A5+1 Ring Strength +353, 5/5 affixes; Infernal visual A6 Ring Strength +420, 5/5 affixes. These invalidate rarity-only scaling and blanket Infernal affix-slot counts, but don't measure a percentage between the two items.
5. Keep gems/sockets and cosmetic rarity out of upgrade ROI. Keep drop bonuses (including Reflecting) out, as they do not increase through the slot's upgrade progress.
6. Need exact A1+0 displayed implicit / affix baseline and authoritative operation order. Until established, do not claim precise stat projections. Source data and coefficients alone are not proof of arithmetic implementation.


## Deeper source audit — correction to earlier projection assumptions

### Primary evidence: official Season 2 Forge patch notes
IdleArc official v1.3.1 patch (September 25, 2026):
https://idlearc.com/patch-notes/1-3-1
- Forge makes gear **slots** own tier, enhancement and Awakening, with progression preserved when switching equipped items.
- Every slot tier opens an affix position; Forge may fill empty positions regardless of an item's cosmetic appearance or original rarity.
- Gear score still grants a **small** rarity bonus. Thus "rarity is cosmetic for slot upgrade progression" does not mean every property of a dropped item is purely cosmetic.
- The source explains a Legendary-looking item with 5/5 affixes on a high-ranked slot. Do not derive affix capacity from visual rarity.

### Raw config audited
- Complete 581,710-byte October 5 file: `idlearc_config_game_2026-10-05.json` (version string `2026-10-01-007+...+forge+affixcap...`), containing actual `itemization`, `items`, `affixes`, and `forge` tables.
- October 17 version fragment on Drive matches those coefficient fields, but its stored excerpt is incomplete. Arcana's October 21 compact equipment snapshot is **item ranges**, not server calculation code.
- `forge.awaken_positions=5`, `forge.affix_capacity=true`, `forge.tracks` includes `ring_1` and `ring_2`, `forge.rarity_table` supplies generation-roll definitions. The base item's `implicit_by_tier` is a distinct table, not a slot Awakening table.
- Explicit coefficients: `itemization.awaken.multiplier_per_level=.12`; `affix_boost_per_awaken=.10`; `affix_enhancement_scaling=.03`; `enhancement_softcap_start=90`, `enhancement_softcap_rate=.5`; `cap_base_expansion=.2`; `cap_level_expansion=.2`. Exact arithmetic **cannot be inferred** from constants alone.

### Root cause of the grossly inaccurate predictions
`src/upgrade-family.js` calculates `add=increment*softLevels(rank,level)` for all flat implicits where `increment` is `itemization.tiers[6].increment=11`. It then applies `factor=1+rank*.12`, for example A6+0 Warrior's Ring:
- `softLevels(6,0)=135`
- T6 max Strength=124, `add=11*135=1485`
- Predicted max `ceil((124+1485)*1.72)=2768`
- Observed in-game Warrior's Ring A6+0 **+420 Strength**.
This shows that `tiers[6].increment` **cannot simply be 11 Strength per enhancement level**. The current app's automated tests validated implementation consistency but did not verify the game formula.

### Screenshot consistency checks; NOT proof of complete formula
Two different Warrior's Rings:
- Legendary appearance, Ring 1, A5+1: base Strength 353; Defense 182% with individual affix Awakening III; Double Damage Chance 46%, no affix rank; Strength affix 161, no rank; Double Hit Chance 46% rank I.
- Infernal appearance, Ring 2, A6+0: base Strength 420; Defense 170% with affix Awakening I; Double Damage Chance 48% with no rank; Strength affix 208 rank I; Double Hit Chance 58% rank II.
- Raw config lists `of Devastation` and `of Double Hit` both at 1–2; if they have the same underlying unboosted roll, 48% × 1.20 = 57.6%, displaying as 58%. Compound 1.1² also gives 58 after rounding. This corroborates **about 10% per individual affix tier**, but cannot distinguish additive versus compound boosts or certify identical initial rolls.
- Removing *hypothetical additive* ranks from Defense: A5 unboosted ≈182/1.3=140; A6 ≈170/1.1=154.55, ratio +10.4%. This is compatible with 12% slot-Awakening growth **but different rolls are involved**, so it is not a measured rate.
- The screenshot Reflecting percentages (48.3%, 50.7%) are item drop bonuses, not ordinary affixes; gem values are independent and must not be projected with equipment progression.
- Confirmed Forge mechanic permits 5/5 affixes on Legendary appearance at A5.

### Mathematical identifiability warning
`multiplier_per_level=.12` alone permits multiple interpretations: linear `1 + 0.12*r` vs compound `1.12^r`, which diverge appreciably at high ranks. The config provides no readable routine showing which path, how rolling baselines are stored, when effective-level softcaps apply, or whether ceil/round occurs at intermediate stages. Without actual executable game implementation or a **matched** before/after measurement, exact A1+0 displayed baseline and exact final displayed values **remain unproved**.

### Implementation decisions required
1. Replace the old `increment*softLevels` projection, and decouple `slotRank` from `cosmeticRarity` everywhere before trusting rankings.
2. Keep `baseMax` and `max rolled affix quality` separate from `displayed affix cap`; Forge `affix_capacity` is separate from drop rarity.
3. Expose independent affix Roman ranks and grant no boosts to drop bonuses or fixed side-grade stats.
4. Never mark a numeric projection exact until the actual algorithm and rounding order are verified.
