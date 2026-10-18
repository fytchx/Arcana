# Damage Calculator: Warrior + Mage screenshot/video analysis (2026-10-17)

## Private inputs
- User supplied `idlearccharacters.zip`: **91 full-resolution JPEG screenshots**, original timestamps 08:43–08:49 local time (same capture session).
- User supplied `1000039205.mp4`: **403.052 seconds (6m 43s)**, portrait H.264 video. Sampling of timeline shows Retaliation Warrior, then the Mage, across stats, gear, skill trees, pets and guild.
- Preserve original user media privately. Do NOT commit raw video, ZIP, player identifiers, capture metadata or API traffic. This document contains only relevant gameplay values and screenshot index references.
- Existing lower-level Beastmaster reference: 43 screenshots, attack 175.6K–243.8K, Pet ×132.24, +5 ACS, separate October 17 foundation fixture.
- Sample game client from accompanying asset archive: IdleArc 1.3.6 / build 167; screenshots do not themselves prove the server code version.

## Snapshot A: Retaliation Warrior

- **Screenshots #2–#6:** Attack Damage Breakdown, character sheet and Retaliation Breakdown.
- Character sheet (#4): GS 2974, 229.58K HP, **26.1M–36.94M attack**, **18.51M Defense**, 2.76K STR, 152 DEX, 218 INT. Crit Chance 392.4%, Crit Damage 1502%, Double Hit 281%, Double Damage 597%. Block displayed 97% (110% raw), Dodge 0% due to Bulwark, Boss Damage +100%.
- Attack math screenshot (#2–#3): weapon 6.14–8.78K, additive ×17.75, flat 706+~1.86K+~1K, multiplicative layers ×231.82. Reconstructed **26.04M–36.88M** from these rounded numbers; matches displayed within ~0.3%. Character-sheet sources differ from Hunter, but the *stage ordering* stays consistent. STR from items is additive; STR from other sources is multiplicative.
- Retaliation description (screenshots #5–#6): "**Base = (Reflecting bonuses + Deflection skill + Bulwark stance) × Defense**, then its own multipliers (Strength, pets, runes, talisman, gear set, gems, echoes, stance)." It also states "**Dodged attacks still retaliate**".
- Retaliation base pool: `0.60 × 18.51M Defense × (83.4% Reflecting +40% Deflection +15% Bulwark)` = **15.3707M**. **Critical:** do NOT insert a phantom 100% baseline in this step.
- Ten separately multiplied displayed layers: STR +1210%, pet increased STR +169.3%, pet Retaliation +280%, talisman inscription +52%, runes +357.1%, guild +77.8%, echo +12%, set +29%, gems +12%, time boost +63%.
- Screenshot shows **Combat Stance ×1.25** as a separate conditional multiplier and **Blocked attacks ×1.75**. Reproduction using base pool × ten layers × stance 1.25 gives **83.926B max** and, with the screenshot-supported 70% low-end display envelope, **58.748B min**, close to **58.74B–83.92B displayed**, 71.33B midpoint.
- **Important order discovery:** multiplying **Blocked attacks ×1.75** into the ordinary displayed range would produce ~**146.9B max**, inconsistent with the displayed 83.92B. Treat the block modifier as **conditional and separate from the ordinary range**. The game may apply it to certain blocked combat events. We have NOT proved actual event-level damage.
- The tooltip's ×1.75 block modifier differs from the older 1.3.1 description of 50% stronger blocked retaliation. It could reflect another active boost, but that needs an actual state/delta test, not an assumption.
- Previous Warrior research had no numeric formula for Retaliation. This is a **significant improvement for displayed tooltip math**, not proof of server-side hit/dodge/crit frequency.
- **Warrior screenshot #40: Deflection**, allocated 2/5, +17 ACS, effective 19: block **38% raw, 25% applied cap**; retaliation **76% raw, 40% applied cap**. That 40% enters the Retaliation **base pool**, not a separate 1.40 multiplier. Caps differ per output of the SAME skill.
- **Warrior screenshots #25, #29: Culling Strike + Executioner.** Allocated 5 and 2, +17 ACS -> effective ranks 22 and 19; raw execute threshold **22% +19%=41%**; **shared 35% cap** displayed by both skills. This is a combined effect cap, not two individual 35% caps.
- **Warrior screenshot #28: Bloodthirst**, allocated 1+17, raw 18% Extra Kill, cap **10%**. Meanwhile Life on Hit +4 per effective level could continue increasing; the tooltip does not present a corresponding Life on Hit cap.
- **Warrior screenshot #31: Mighty Strikes**, 10 allocated +17 ACS, 5% attack damage per effective rank -> **+135%**, with no explicit skill-specific tooltip cap. No license to assume truly infinite unbounded scaling beyond documented/current implementations.

## Snapshot B: Attack Damage Mage

- **Screenshots #62–#64:** character sheet + attack breakdown. Mage GS 2753, **23.33B–34.12B Attack Damage**, Strength 2.59K, Dexterity 158, Intelligence 1.78K, Crit Chance 531.1%, Crit Damage 1625%, Double Hit 407%, Double Damage 966%. Mage uses a different build and very different attack multipliers.
- Attack screenshot base: weapon **7.49K–10.7K**, jewelry flat **+1.97K–3.29K**; additive sum **+2.03K% (×21.27)**; flat from skill tree/runes/guild **+911/+4.05K/+2.13K**; independently multiplied layers **×111.98K**.
- Reconstructed from displayed rounded parts **23.338B–34.133B**; within ~0.06% of displayed 23.33B–34.12B. This independently supports the **same hero attack stage ordering** as lower Hunter and Retal Warrior.
- 17 All Class Skills shown on individual Mage tooltips. ACS is NOT itself a +17% damage bonus; it raises effective skill rank and then each effect is independently capped/staged.
- **Mage screenshot #69: Magic Blast** allocated **10/10** and **+17 ACS**, every attack nominal 50% chance to deal extra **3% damage per effective level**. Tooltip reports effective trigger **100% (140% raw) / 100% cap**.
- **Mage screenshot #72: Unstable Energy** allocated **1/5**, +17 ACS -> effective rank 18. Adds **5%** to Magic Blast proc chance per effective level -> +90% to Magic Blast's base 50%, raw **140%**, clipped **100%**. This is a **cross-skill cap**, not a cap on Magic Blast damage-per-level itself.
- **Mage screenshot #74: Arcane Cascade** allocated 1/5 +17 ACS, chance **8% per rank**, raw **144%**, clipped **100%**. It upgrades double-damage strikes to triple damage; its triggered event is NOT a global extra ×3 stacked on all hits.
- **Mage screenshot #80: Pyroclasm**, allocated 5/5 +17 ACS, bonus to crit damage **5% per level**, raw **110%**, clipped **100%**. Again this only applies to critical strikes.
- Other Mage effects (e.g. Wild Magic, Critical Chance, critical damage, Double Damage chance, Arcane Surge, Fire Infusion) require precise merging into the right source groups; do not count proc damage as sheet attack.

## Why definitions are not the same as verified combat mechanics

The static configuration `src/verified-class-skills.js` (Oct 9) gives 90 **named skills**, their max spendable points and their prose descriptions. It does NOT supply all runtime cap definitions, grouping, ordering, eligibility, or server roll mechanics.

New screenshots substantially improve coverage:
1. **Description-level/current tooltip observation:** all 18 Warrior and all 18 Mage skill dialogues are represented in the uploaded 91 JPEGs (#25–42 and #69–86). These are directly observed descriptions and, where present, game-reported effect caps **for these snapshots**.
2. **Tooltip-formula numeric matching:** screenshot-derived 3rd-class hero attack cross-check and Warrior Retaliation range now reproducible from rounded stages.
3. **Server/combat validation still pending:** Whether repeated hits, double damage and crit procs interact with unique class events exactly as described; block/evade edge cases; elemental weaknesses, pet raw damage, target mitigation, race conditions, threshold mechanics, original formula precision.
4. **Uncovered class skills:** Rogue (18) and Druid (18), plus Archer skills not represented in the original 43 screenshots and any skill/cap changes since October 9.
5. **Live current full `/config/game` response**, especially `class_skill_caps`, and the separate client AOT symbols. The previous supplied captures `1111.pcapng` and `222` are encrypted; the SAI split `2222` provides client code but not server truth.

## Precision / caution

- Percentages such as 1.13K%, 1.21K%, 4.05K flat and 18.51M Defense are UI-rounded. Exact byte-for-byte reconstruction requires high precision state or official formula.
- 70%–100% is now strongly **confirmed for Warrior's displayed Retaliation range** across two screenshots, not necessarily a per-hit probability distribution for combat.
- Do not derive one precise "DPS" by indiscriminately multiplying Double Hit × Crit × Alpha Strike × Block Chance. They apply conditionally, can depend on target survival, and may roll in different stages.
- Maintain separate metadata for **verified skill definition**, **verified displayed effect/cap**, **verified tooltip algebra**, and **verified live server outcome**.

## Development work produced from this batch

- `src/damage-calculator-crossclass-fixtures.js`: Mage and Warrior fixture calculations.
- `src/retaliation-damage-engine.js`: observed-screen-order Retaliation formula, with block factor separate.
- `src/class-skill-effect-model.js`: unlock/allocation/ACS/output-specific cap functions and verified Mage/Warrior observations.
- `tests/damage-calculator-crossclass.test.mjs`: reproducibility and cap examples.
- `src/damage-calculator-ui.js`: research-branch preview with Archer, Mage, Warrior examples and Retaliation tab.
- **All changes remain in draft PR #33; no production deployment or merge.**
