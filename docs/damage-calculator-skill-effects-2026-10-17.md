# Arcana Damage Calculator · full-class skill stat planner (2026-10-17)

## Shipped to research branch (draft PR #33 only)

This iteration extends the existing October 17 **90-skill / 24-cap** manifest. It adds a separate, explicit registry of **52 documented, non-cap per-rank outputs** in `src/damage-calculator-skill-effects.js`, covering Warrior, Archer, Mage, Rogue and Druid. The new mobile skill planner shows **all 18 skills per class** (90 across the app) instead of just the cap-contributing subset. Not all 90 skills have a numeric modeled damage effect: noncombat or uncertain effects remain visibly listed, not invented.

### Source boundaries

- Current `/config/game` **2026-10-17-001**: 90 current skill IDs, allocated-rank ceilings and 24 explicit effect caps in `src/damage-calculator-config-caps.js`.
- **October 9 skill-tree description rates** in `src/verified-class-skills.js`: 52 non-cap stat outputs transcribed as small, auditable triples (skill ID, stat channel, per effective rank). Stronger corroboration exists for Archer, Warrior and Mage benchmark skills via October 17 screenshots.
- Unverified runtime timing, proc overlaps, and full skill effects are **not** inferred from description text. It is intentionally possible for an unlocked skill to have zero supported modeled outputs.

### Separate mathematical channels

1. `attackPct`: the **single additive class-skills field** in Attack Damage. Do not treat it as a new independent multiplier.
2. `petPct`: the **single pet class-skills percentage layer**; internally adds multiple skill contributions.
3. `petFlat`: per-pet base flat damage **before** all Pet Damage percentage layers (e.g., Druid Dam Builder), not a pet percentage.
4. `critChance`, `critDamage`, `doubleHitChance`, `doubleDamageChance`: distinct chance/stat contributions, kept outside basic Attack/Pet tooltip damage and unverified DPS.
5. `defenseFlat`, `defensePct`, `petMasteryLevels`: displayed for decision-making. No invented conversion to Retaliation or pet base damage.
6. Conditional outputs (`magicBlastProcBonus`, above/below half-target bonuses, extra damage on Double Hit) remain **separate and tagged conditional**. Proc rates, caps, boss damage and other configured ceilings come only from the existing **24-cap evaluator**, not the uncapped registry.

### All Class Skills

- **Allocated points** limited by that specific skill's current config maximum; **effective rank** = allocated + ACS for explicitly unlocked skills. ACS never automatically unlocks a locked skill.
- Independently compute every uncapped output and every cap group, then compare the **applied gain from one extra ACS**, not raw uncapped gains.
- Restore each class's own allocation and ACS when switching class; migrate the older cap-only planner's stored data.
- **+1 ACS damage preview:** for the same class as the active benchmark, the planner recomputes the sheet Attack range with the class-skills additive subtotal replaced, holding all other stages fixed. It also compares the Pet percentage multiplier, keeping unknown pet-base/flat effects separate. Hunter baseline produces **+1.77% displayed Attack** and **+9.09% Pet percentage multiplier** for +1 ACS; Warrior and Mage previews are also numerically reconstructed. A mismatched class refuses to project onto the wrong character screenshot.
- Output preview is not applied to screenshot baseline implicitly. **Only** an explicit button replaces the existing manual Attack class-skills subtotal / Pet class-skills % / Pet flat class-skills input. This is a **replacement at the correct stage**, never an addition that doubles counted bonuses. The Pet flat field is also editable in the main calculator.
- Selecting the existing Hunter, Mage or Warrior examples loads source-matched skill allocations. Other classes start blank.

### Numerical regression anchors

| Case | Computation | Expected |
|---|---|---|
| Hunter, ACS +5 | Archery 3+5 × 5%, Venomous Trap 1+5 × 3% | **+58% Attack** |
| Hunter, ACS +5 | Beast Bond 1+5 × 12%, Pack Leader 1+5 × 8% | **+120% Pet** |
| Warrior, ACS +17 | Mighty Strikes 10+17 × 5%, Titan's Grip 5+17 × 3% | **+201% Attack** |
| Mage, ACS +17 | Fire Infusion 10+17 × 5%, Spell Mastery 5+17 × 3%, Inferno 5+17 × 2% | **+245% Attack** |
| Mage Magic Blast | Skill 4 effective rank 27 × 3% | **+81% conditional proc bonus**, NOT +81% sheet Attack |
| Rogue, ACS +3 | Umbral Blades 5+3 × 5% | **+40% class Attack** |
| Druid, ACS +2 | Gnaw 5+2 × 8%, One Soul 1+2 × 5%; Dam Builder 2+2 × 15 flat | **+71% Pet and +60 flat per pet**, not +131% |
| Hunter +1 ACS | Attack +5%+3%; Pet +12%+8% | **+8% class Attack; +20% Pet layer** |

Added `tests/damage-calculator-skill-effects.test.mjs` with **13** source/ACS/isolation/staging and screenshot-projection regressions. All 13 passed in an isolated JavaScript execution harness. Previous cap and cross-class suites are preserved but were not rerun in the full Node pipeline. \n## Validation status and release blockers

Static JavaScript syntax checks of all changed production modules succeeded in an isolated evaluator. Direct smoke checks reproduced Hunter (58/120), Warrior (201), Mage (245), Rogue (110 in another custom setup), and Druid (71/60) skill subtotals. The layout source inventory confirms all **67** main numeric input paths are assigned to exactly one section after the extra Pet flat field.

**GitHub Actions:** an Arcana Checks run was triggered after the last test commit. The two jobs returned failure with **zero steps and no runner assigned**, and their log download was unavailable (404). This cannot be described as the test suite passing or as a proven code failure. Retry/diagnose runner provisioning before merge. Local full `npm run check`, browser QA, and mobile smoke have not yet been executed for this branch.

**Remain draft/unmerged/undeployed.** Open items: verify each rate against current October 17 full skill descriptions (not just IDs/caps); resolve full Rogue and Druid combat screenshots; pet raw base scaling; actual combat proc order/crit semantic/Alpha Strike overlap; reliable CI plus mobile/desktop UX testing. Keep private media and full configuration outside repository.
