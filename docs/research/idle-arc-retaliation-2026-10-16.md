# Retaliation Mechanics Research (2026-10-16)
Status: **internal investigation**, not an implemented formula.

## Sources
- Official IdleArc patch 1.3.1 (2026-09-25): https://idlearc.com/patch-notes/1-3-1
- Official guild skill tree: https://idlearc.com/guild-tree
- Player-recorded example in Arcana: `src/wiki-data.js` > `retaliation-warrior-zane`, with associated `src/catalog.js` build `warrior-retaliation-zane`.
- Prior archived investigation: `IdleArc_Datamine_2026-10-16_Findings.md` in ChatGPT Library (private).
- Local testing assets: user-provided IdleArc 1.3.6 build 167 base APK and two encrypted packet captures. Do not commit them or user/session data.

## Confirmed **official descriptions**
1. Retaliation fires on enemy attacks, is a third damage pool built on Defense and Reflecting, and gains 50% damage on blocked attacks.
2. Official patch notes say Retaliation interacts with crits and double hits. The exact nature and stacking order of those interactions are **not** verified.
3. Bulwark sets Dodge Chance to 0%.
4. Official guild-tree explanation: Guild Defense is a distinct multiplier on top of other Defense sources, enhancing Retaliation; guild Retaliation Damage is a separate bonus source.
All above are *documented descriptions*, not recovered server code.

## Recorded player example (not isolated test)
- Defense: 7.67M; Block Chance: 84%; displayed Retaliation range: 6.76B–9.66B, midpoint 8.21B.
- Guide quotes +40% from Deflection, +15% from Bulwark Stance, but grouping/order is not known.
- 6.76/9.66 = 0.69979 and 8.21/9.66 = 0.84990. The UI numbers are **consistent** with a lower-bound factor ~70% and a midpoint factor ~85% of the upper bound. This is a **hypothesis about the displayed range**, not proof of combat RNG or a universal formula.
- The guide de-prioritizes Crit Chance, Crit Damage, and Double Hit. This remains a player build preference, not proof those stats do nothing. The official notes explicitly mention crit and double-hit interaction.

## Research gaps
- Exact Defense coefficient, Strength contribution, Reflecting and Retaliation bonus stacking groups, rounding, possible crit/double-hit event mechanics and actual DPS are **unverified**.
- Base APK lacked Android ABI split, so no Flutter AOT combat code was verified.
- Network captures were encrypted. Neither capture supplied readable combat messages or exact configuration.

## Controlled experiment queue
| ID | Variable isolated | Observe | Question |
|---|---|---|---|
| R-001 | baseline | defense / complete stats / UI range | preserve snapshot |
| R-002 | block outcome | blocked and unblocked hit damage | does block multiply same event by 1.5? |
| R-003 | displayed Defense | change only flat defense, compare before/after | does base Retaliation scale with displayed Defense? |
| R-004 | reflecting / Retaliation% | isolate one source | additive or multiplicative sources? |
| R-005 | Strength | isolate Strength | direct or mediated effect? |
| R-006 | Crit Chance / Crit Damage | isolate crit outcomes | chance, crit multiplier and placement? |
| R-007 | Double Hit | count events and total damage per incoming attack | extra hit event or single-hit multiplier? |
| R-008 | stance / skill | compare same build with stance or one skill changed | skill grouping, dodge effects? |
| R-009 | UI envelope | measure min/max for 3+ builds | does the 0.70-1.00 relation persist? |

Record game version, Monster Level and target, active stance/skills/pets/gems/guild boost, Defense, Strength, Retaliation/Reflecting %, Block/Crit/Double Hit values, exact damage results and outcomes, and buff state. Keep user identifiers and credentials out of this repo.

## Arcana integration guardrails
- A research panel can repeat the official behavior with citations, clearly flagging model uncertainty.
- Do **not** publish a numerical calculator until controlled outcomes constrain coefficient, trigger order and all multipliers.
- No Arcana production features or live content were modified by this research branch.
