# Arcana Damage Calculator · source-backed foundation (2026-10-17)

## Mission
One unified calculator, not a pet-only side tool. Compute **Attack Damage**, **Pet Damage**, and then layer in **expected combat outcomes** (critical hits, double damage, repeated hits, Alpha Strike, bosses, target health, abilities). Source-resolved inputs feed both manual what-if comparisons and later Build Studio imports. This branch is research/development, not a production release.

## Observed and reproduced from the supplied 43 screenshots
- Hunter level 94 / ML 87, 255 STR on character sheet (256 in attack breakdown), 148 DEX, 210 INT.
- Final displayed attack: ~175.6K–243.8K. Screenshot additive stack: +284.1% (×3.841). Independent layers: ×38.21. Flat skill/rune/guild: 34+101+555 = 690.
- **Critical ordering**: (weapon + jewelry flat) × additive stack, **then** add flat skill/rune/guild, **then** apply multiplicative layers. Putting 690 flat into the initial base overestimates damage by ~43%.
- Screenshot pet layers: ×132.24; using rounded displayed layer values yields ×132.15, 0.07% deviation. Pet flats: 58+555+77=690 added to *each pet's base before multiplication*. Pet actual pre-bonus base/level scaling not shown.
- Equipment pet layer: 26+17+17+22+17+17+13+17+18+18 = **182%**. That layer is additive internally. The four Companions drop rolls 2.44+6.38+5.76+26.31 = **40.89%**, a separate ×1.409 layer.
- Pet class skills +120% = Beast Bond 12% × (1+5 ACS) = 72% plus Pack Leader 8% × (1+5 ACS) = 48%.
- Attack class skill additive +58% = Archery 5% × (3+5 ACS) = 40% plus Venomous Trap 3% × (1+5 ACS) = 18%.
- Three pets with All Class Skills +1 and Torch +2 = **+5 All Class Skills**. ACS modifies multiple skills, NOT a stand-alone generic +5% damage.
- Guild displayed 51.9% pet/attack and +370 flat each. Applied layers +77.8% and +555 flat. A **1.5× guild effect** explains both (51.9×1.5 = 77.85, 370×1.5=555). Verify the 50% guild boost is active before generalizing this to other accounts.
- Dex contributes +0.1% pet damage/point; INT +0.05% pet damage/point and +0.38% attack damage/point; STR +0.75% attack damage/point.
- Crit chance over 100% converts overflow into Crit Damage; Double Hit/Double Damage exceed 100% with unlimited tiered guaranteed hits/factors. Repeated hits do not help if the first hit already kills the target.
- Alpha Strike level 6 effective (1+5 ACS) gives 18% chance to strike twice, doubling both hero and pet damage. Its exact overlap with separate Double Hit remains for a targeted in-game test.
- Combat stance displayed +209.7% on both attack and pet in this snapshot. Time damage boost +32%. Gear sets +12%. These are separate layers.

## Source type and confidence
- **Confirmed in screenshots:** game-displayed stages and percentages, stat tooltip descriptions, class-skill effects, pet and equipment bonuses.
- **Reproduced numerically:** attack stage ordering, attack range to displayed rounding, pet multiplier product tolerance, guild 1.5× consistency, pet affinity/additive contribution sums.
- **Not yet verified:** the raw pre-bonus pet damage/level formula; exact internal rounding order; crit damage percentage semantic; per-pet crit/DD application; attack speed and enemy damage reduction; Alpha Strike stacking; elemental weakness/auto-matching; trap timing and target HP; retaliation damage; expected real-world DPS. No unsupported numbers should ship as authoritative.

## Next integration phases
1. Structured input collector: explicit stat-source IDs; store provenance (`equipment-affix`, `pet-hatch-bonus`, `guild-flat`, etc.). Never merge aggregate totals with their constituent sources.
2. Live UI: **Focused**, **Pets**, and **Full Build** views. Baseline vs scenario; group source rows; sensitivity analysis and breakdown. Persist the user's baseline and scenario, not just results.
3. Connect Build Studio loadout data only where exact rolls and bonuses are stored. Manual override remains available for stats not present in game config.
4. Test calibrated game screenshots across classes and overflows. Add retaliation, trap, pet level/base, combat probabilities only as source-verified formulas.
5. Mobile QA, test gate, review, then publish to canonical production. Do not deploy this research branch directly.

## Evidence and data age
Screenshot capture supplied in this conversation: 2026-10-17 (43 screenshots).
Source snapshot in `src/verified-class-skills.js`: 2026-10-09 (90 skills).
Source snapshot in `src/verified-game-data.js`: October 9; earlier than screenshot build. Always compare against current game config before calling newly added options verified.
