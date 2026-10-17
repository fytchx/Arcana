# Arcana Damage Calculator · live class-cap integration (2026-10-17)

## Scope and integrity

The complete readable `/config/game` JSON, version prefix **2026-10-17-001**, was recovered from the user's October 17 browser print-to-PDF. The reconstructed JSON parses cleanly and has **87 top-level sections**. Its `class_skill_trees` section has **90 named skills** (18 each across Warrior, Archer, Mage, Rogue, and Druid). Its `class_skill_caps` section contains **24 explicit cap groups**. The exact full-version prefix and reduced cap constants were reviewed against the input on this date. The original PDF/full configuration and all player media remain outside GitHub.

This PR now includes a compact, non-sensitive manifest: `src/damage-calculator-config-caps.js`. It does **not** package account data, secrets, traffic captures, or the entire JSON. It contains all 90 current skill IDs, class IDs, names and maximum *allocated* ranks, plus all 24 cap group definitions (`cap`, `base`, `gate_skill_id`, `display_skill_ids`, `contributions.skill_id/per_rank`).

## Current cap groups (exact config values)

| Cap key | Cap | Behavior |
|---|---:|---|
| boss_damage_bonus | 100% | Cross-class contributors, evaluated only for the selected class |
| execute_threshold | 35% | Shared Culling/Executioner, Coup de Grace, Undermine cap |
| counterstrike_block_bonus | 25% | Counterstrike only |
| titanic_blow_chance | 80% | Titanic Blow chance |
| relentless_assault_chance | 100% | Additional strike chance |
| bloodthirst_extra_kill | 10% | Extra Kill chance only, not Life on Hit |
| deflection_block | 25% | Independent Deflection output |
| deflection_retaliation | 40% | Independent Deflection output |
| perfect_shot_chance | 80% | Perfect Shot chance |
| trap_damage | 35% | Spike Trap + Trap Mastery combined cap |
| hunters_instinct_chance | 15% | Hunter's Instinct proc |
| alpha_strike_chance | 60% | Archer Alpha Strike / Druid Tail Slap by class |
| magic_blast_chance | 100% | Base 50%, plus Unstable Energy, gated by Magic Blast |
| arcane_cascade_chance | 100% | Arcane Cascade proc |
| pyroclasm_damage | 100% | Crit-only effect, not sheet damage |
| shadow_echo_chance | 100% | Rogue Shadow Echo + Echo Mastery, gated by Shadow Echo |
| shadow_echo_damage | 80% | Base 40%, Echo Mastery additive, gated by Shadow Echo |
| umbral_cascade_chance | 75% | Umbral Cascade proc |
| lucky_hands_duplicate | 15% | Duplicate chance |
| lucky_tier | 20% | Lucky Tier chance |
| attack_pet_conversion | 75% | Kinship + Feral Bond shared cap |
| wild_attunement_amp | 25% | Wild Attunement weakness bonus |
| pet_egg_drop | 15% | Archer Egg Hunter / Druid Keen Snout; never stacked across classes |
| deep_roots_pet_xp | 15% | Deep Roots pet XP |

## Semantic rules implemented

1. Allocated points obey each skill's actual `max_rank`. ACS increases *effective rank* only on an unlocked skill. **A rank maximum is NOT an effect cap.**
2. No artificial cap is applied to unrelated or ordinary uncapped Attack Damage skills.
3. A cap group's raw output is its base plus the sum of effective rank × per-rank contribution. Apply the cap **once to the shared output**. A group may contain contributors from multiple classes, but the calculator evaluates only the active class.
4. A non-null `gate_skill_id` disables the whole effect when that triggering skill is locked, including base and contributions.
5. An individual skill may influence multiple output groups with **independent caps**, e.g. Warrior Deflection and Rogue Shadow Echo.
6. A second calculation adds **+1 ACS** and shows the applied incremental gain, not the misleading uncapped gain.
7. A mobile **Skills + ACS** section under the existing calculator provides class selection, editable allocations, independent unlock flags, and per-output raw/applied/+1 ACS comparisons. Presets for Hunter, Mage and Warrior reflect known screenshot examples; Rogue/Druid start with blank inputs.

## Validation examples and test gates

The new unit suite checks 90/24 manifest completeness, 5 class partitions, contributor existence, gates, cross-class isolation, class-specific shared caps, max-allocated clamping, unlocked zero-rank semantics and +1 ACS applied differences.

- Warrior: 5 Culling + 2 Executioner +17 ACS = 41% raw execution, **35% applied**.
- Warrior: 2 Deflection +17 ACS = 38% raw block / 76% raw Retaliation, **25% / 40% applied**.
- Mage: Magic Blast unlocked + Unstable Energy rank 1 +17 ACS gives 140% raw, **100% proc chance**. With Magic Blast locked, the effect is **0%**.
- Archer: 5 Spike Trap + 4 Trap Mastery +5 ACS = **24% combined trap** damage, below 35% cap.
- Rogue: 1 Shadow Echo + 5 Echo Mastery +17 ACS gives 134% raw chance / 84% raw bonus damage, **100% / 80% applied**.
- Druid: 10 Kinship + 5 Feral Bond +17 ACS exceeds **75% shared conversion cap**.
- Cross-class `pet_egg_drop`: Archer and Druid contributors must **never** be summed together.

## Release blockers

This is a cap **configuration model**, not proof of live combat events. Do not multiply capped proc percentages into ordinary attack damage, pet damage, retaliation or DPS by default. Exact skill unlock conditions beyond explicit user input, runtime proc order, crit/double interactions, full pet base formula, Rogue/Druid combat screenshots and live E2E performance remain open. The cap planner therefore does not add its outputs to manually entered screenshot tooltip totals.

**Draft PR #33 remains unmerged and undeployed.** Run the full project test command, browser/mobile QA and verify deployed-version parity before authorizing release.
