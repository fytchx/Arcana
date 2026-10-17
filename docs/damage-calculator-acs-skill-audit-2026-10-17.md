# Arcana Damage Calculator · Class Skill + ACS verification matrix

**Created:** 2026-10-17  | **Status:** AUDIT OPEN (not a release claim)

## Authoritative evidence hierarchy

1. Current **readable full** `/config/game` response with build/hash, AND any relevant combat or character response definitions.
2. Real client screenshot/tooltip, in-game before/after stat/damage change, and reproducible combat event.
3. Older `src/verified-class-skills.js` game config dated 2026-10-09.
4. Existing Wiki is a secondary cross-check only (some pages last verified September 2026).

**Do not assume** `max_rank` is the maximum effective skill rank. In config, `max_rank` describes **allocatable skill points** (typically 5 or 10), while ACS can add effective ranks after unlocking. Skill **individual outputs** may still have separate ceilings. One skill can even mix capped and uncapped outputs, and two skills can contribute to a *shared cap*. There are 90 skills in this stale snapshot across five classes, 75 with max 5 allocation and 15 with max 10 allocation. Every entry below needs the current game config plus any runtime effect-specific checks before being called fully verified.

## ACS modeling specification (planned)

- `allocatedRank` in 0.. `max_rank` (legal skill points only).
- `unlocked` is a **separate rule**. A zero-point, locked skill must **not** automatically gain ACS merely because all-skill bonuses are equipped. Determine precise unlock/activation requirements from current game data.
- `effectiveRank` is calculated only after checking unlocked state. For eligible unlocked skills, expected convention is `allocatedRank + allClassSkills`, not capped at `max_rank`, subject to any game-specific override.
- Translate each skill to **one or more outputs**, each with an independently verified rate, calculation stage, optional cap, chance semantics and target applicability (hero attack, pet attack, retaliation, loot, etc.).
- Examples: Spike Trap + Trap Mastery damage share a 35%-of-target-HP tooltip cap; Hunter's Instinct displays a 15% trigger cap; Hunter's Mark shows boss damage up to 100%. These UI-displayed caps are screenshot evidence, **not** inferred from `max_rank`.
- For each output store provenance and confidence (`game-config`, `ui-tested`, `combat-tested`, `unknown`) plus exact game version.
- A skill can affect base stats **and** proc mechanics; avoid either missing the effect or multiplying it twice.
- **No guessed hard cap** for naturally uncapped skills like ordinary additive Attack Damage without runtime evidence. Conversely, no claim of infinity just because a description omits a cap.
- Value comparison for +1 ACS must diff *all unlocked outputs* (cross-class effects are mutually exclusive in normal builds).

## Explicit screenshot evidence from Beastmaster/Hunter (2026-10-17)

- ACS total +5: Torch +2 and 3 companion affixes +1.
- Archer Archery: allocated 3/10, effective 8 => 8×5%=+40% hero AD; Venomous Trap 1/5 => effective 6, 6×3%=+18%; summed class AD +58%.
- Beast Bond 1/5 +5 ACS => 6×12%=+72% pet; Pack Leader 1/5 +5=>6×8%=+48%; pet class +120%.
- Spike Trap 5/10 +5=>10×1.5%=15%, Trap Mastery 4/5 +5=>9×1%=9%, shared displayed trap damage 24%/35% cap.
- Hunter's Instinct 3/5 +5=>8×1%=8%/15% displayed chance.
- Hunter's Mark 1/5 +5=>6×5%=30% boss bonus displayed 30%/100% cap.
- Alpha Strike 1/5 +5=>6×3%=18% proc probability; exact interaction with ordinary Double Hit remains **UNVERIFIED**.

## Skill inventory (October 9 config, pending October 14+ verification)

| Class | Branch | Skill ID | Name | Max allocated | Dated config description | ACS/effect status |
|---|---|---:|---|---:|---|---|
| Warrior | Might | 7 | Culling strike | 5 | You kill the enemy instantly once they reach a certain health percentage (1% Max HP per skill level) | Config-described; effect verification pending |
| Warrior | Might | 22 | Battle Recovery | 5 | Increased defense (50 per skill level) and life on kill (8 HP per skill level) | Config-described; effect verification pending |
| Warrior | Might | 23 | Executioner | 5 | Increased culling threshold (1% per skill level, stacks with Culling Strike) | Config-described; effect verification pending |
| Warrior | Might | 46 | Iron Constitution | 10 | Increased defense (2% per skill level) | Config-described; effect verification pending |
| Warrior | Might | 47 | Bloodthirst | 5 | Increased life on hit (4 HP per skill level) and a 1% chance per skill level for a kill to count twice (up to 10%) | Config-described; effect verification pending |
| Warrior | Might | 48 | Counterstrike | 5 | Blocked enemy swings retaliate for an extra 2% per skill level | Config-described; effect verification pending |
| Warrior | Strength | 8 | Mighty strikes | 10 | Increase attack damage (5% per skill level) | Config-described; effect verification pending |
| Warrior | Strength | 24 | Crushing Blows | 5 | Increased critical damage (3% per skill level) and defense (2% per skill level) | Config-described; effect verification pending |
| Warrior | Strength | 25 | Overwhelm | 5 | Increased double damage chance (2% per skill level) and increased boss damage (5% per skill level) | Config-described; effect verification pending |
| Warrior | Strength | 49 | Battle Focus | 5 | Increased critical strike chance (2% per skill level) | Config-described; effect verification pending |
| Warrior | Strength | 50 | Titan's Grip | 5 | Increased attack damage (3% per skill level) | Config-described; effect verification pending |
| Warrior | Strength | 51 | Titanic Blow | 5 | Your attacks have a 4% chance per skill level to become a Titanic Blow, dealing triple damage | Config-described; effect verification pending |
| Warrior | Finesse | 9 | Berserk | 10 | You have an extra 2% double hit chance per skill level | Config-described; effect verification pending |
| Warrior | Finesse | 26 | Keen Edge | 5 | Increased critical damage (8% per skill level) | Config-described; effect verification pending |
| Warrior | Finesse | 27 | Lethal Blow | 5 | Increased double damage chance (2%) and ruby drop chance (2%) per skill level | Config-described; effect verification pending |
| Warrior | Finesse | 52 | Spoils of War | 5 | Increased gold gain (5%), material drops (5%) and item drop chance (2%) per skill level | Config-described; effect verification pending |
| Warrior | Finesse | 53 | Deflection | 5 | +2% block chance and +4% Retaliation per rank | Config-described; effect verification pending |
| Warrior | Finesse | 54 | Relentless Assault | 5 | When you double hit (or more), you have a 10% chance per skill level to strike one extra time | Config-described; effect verification pending |
| Archer | Marksmanship | 3 | Archery | 10 | Increased attack damage (5% per skill level) | Config-described; effect verification pending |
| Archer | Marksmanship | 10 | Precision | 5 | Increased critical strike chance (4% per skill level) | Config-described; effect verification pending |
| Archer | Marksmanship | 11 | Headshot | 5 | Increased critical damage (10% per skill level) | Config-described; effect verification pending |
| Archer | Marksmanship | 28 | Steady Aim | 10 | Increased double damage chance (2% per skill level) | Config-described; effect verification pending |
| Archer | Marksmanship | 29 | Double Nock | 5 | Increased double hit chance (2% per skill level) | Config-described; effect verification pending |
| Archer | Marksmanship | 30 | Perfect Shot | 5 | Your critical strikes have a 5% chance per skill level to deal double critical damage. +3% critical strike chance per skill level. | Config-described; effect verification pending |
| Archer | Hunting | 2 | Spike trap | 10 | At the start of a fight you deal instant damage to the enemy (1.5% of max HP per skill level) | Config-described; effect verification pending |
| Archer | Hunting | 12 | Venomous Trap | 5 | Increased attack damage (3% per skill level) and double damage chance (1% per skill level) | Config-described; effect verification pending |
| Archer | Hunting | 13 | Hunter's Mark | 5 | Deal bonus damage to enemies below 50% HP (3% per skill level) and increased boss damage (5% per skill level) | Config-described; effect verification pending |
| Archer | Hunting | 31 | Barbed Arrows | 5 | Increased life on hit (2 HP per skill level) | Config-described; effect verification pending |
| Archer | Hunting | 32 | Trap Mastery | 5 | Your traps deal extra damage to the enemy at the start of a fight (1% of max HP per skill level) | Config-described; effect verification pending |
| Archer | Hunting | 33 | Hunter's Instinct | 5 | Your traps have a 1% chance per skill level to reduce a non-boss monster to 1 HP at the start of a fight | Config-described; effect verification pending |
| Archer | Beastmaster | 1 | Strong pet bound | 5 | You get 1 extra level in Pet Mastery per skill level | Config-described; effect verification pending |
| Archer | Beastmaster | 14 | Beast Bond | 5 | Increased pet damage bonus (12% per skill level) | Config-described; effect verification pending |
| Archer | Beastmaster | 15 | Pack Leader | 5 | Increased pet damage (8% per skill level) | Config-described; effect verification pending |
| Archer | Beastmaster | 34 | Egg Hunter | 5 | Your pet sniffs out hidden nests — increased pet egg drop chance (1%) and item drop chance (2%) per skill level | Config-described; effect verification pending |
| Archer | Beastmaster | 35 | Foraging Companion | 5 | Your pet forages while you fight — increased gold gain (5%) and material drops (5%) per skill level | Config-described; effect verification pending |
| Archer | Beastmaster | 36 | Alpha Strike | 5 | Each attack has a 3% chance per skill level to strike twice, doubling both your damage and your pet's damage. | Config-described; effect verification pending |
| Mage | Arcane | 4 | Magic blast | 10 | Each attack has a 50% chance to deal an extra 3% damage per skill level | Config-described; effect verification pending |
| Mage | Arcane | 16 | Arcane Surge | 5 | Increased double damage chance (2% per skill level) | Config-described; effect verification pending |
| Mage | Arcane | 17 | Spell Mastery | 5 | Increased attack damage (3% per skill level) | Config-described; effect verification pending |
| Mage | Arcane | 37 | Arcane Siphon | 5 | Increased life on hit (2 HP per skill level) and double damage chance (1% per skill level) | Config-described; effect verification pending |
| Mage | Arcane | 38 | Unstable Energy | 5 | Increases Magic Blast's trigger chance (5% per skill level) | Config-described; effect verification pending |
| Mage | Arcane | 39 | Arcane Cascade | 5 | Your double damage strikes have an 8% chance per skill level to deal triple damage instead | Config-described; effect verification pending |
| Mage | Destruction | 5 | Fire infusion | 10 | Increase attack damage (5% per skill level) | Config-described; effect verification pending |
| Mage | Destruction | 18 | Burning Soul | 5 | Increased critical damage (8% per skill level) | Config-described; effect verification pending |
| Mage | Destruction | 19 | Inferno | 5 | Increased attack damage (2% per skill level) | Config-described; effect verification pending |
| Mage | Destruction | 40 | Combustion | 5 | Increased double damage chance (2% per skill level) | Config-described; effect verification pending |
| Mage | Destruction | 41 | Melting Point | 5 | Increased critical strike chance (2% per skill level) | Config-described; effect verification pending |
| Mage | Destruction | 42 | Pyroclasm | 5 | Your critical strikes explode, dealing 5% more damage per skill level | Config-described; effect verification pending |
| Mage | Chaos | 6 | Wild magic | 10 | You have an extra 2% critical chance and 1% critical damage per skill level | Config-described; effect verification pending |
| Mage | Chaos | 20 | Chaos Bolt | 5 | Increased critical damage (10% per skill level) | Config-described; effect verification pending |
| Mage | Chaos | 21 | Reality Warp | 5 | Increased double hit chance (2% per skill level) and increased boss damage (5% per skill level) | Config-described; effect verification pending |
| Mage | Chaos | 43 | Fortune's Favor | 5 | Increased gold gain (5%) and material drops (5%) per skill level | Config-described; effect verification pending |
| Mage | Chaos | 44 | Soul Harvest | 5 | Increased life on kill (4 HP per skill level), ruby drop chance (3% per skill level) and rune drop chance (1% per skill level) | Config-described; effect verification pending |
| Mage | Chaos | 45 | Chaos Incarnate | 5 | Increased critical strike, double hit and double damage chance (2% each per skill level) | Config-described; effect verification pending |
| Rogue | Assassin | 55 | Precision Strikes | 5 | Increased critical strike chance (3% per skill level) | Config-described; effect verification pending |
| Rogue | Assassin | 56 | Sharpened Blades | 5 | Increased critical damage (5% per skill level) | Config-described; effect verification pending |
| Rogue | Assassin | 57 | First Strike | 5 | Deal bonus damage to enemies above 50% HP (4% per skill level) | Config-described; effect verification pending |
| Rogue | Assassin | 58 | Contract Killer | 5 | Increased boss damage (5% per skill level) | Config-described; effect verification pending |
| Rogue | Assassin | 59 | Deadly Ambush | 5 | Increased double damage chance (4% per skill level) | Config-described; effect verification pending |
| Rogue | Assassin | 60 | Coup de Grace | 10 | You kill the enemy instantly once they reach a certain health percentage (1% Max HP per skill level) | Config-described; effect verification pending |
| Rogue | Shadowwalker | 61 | Swift Blades | 5 | Increased double hit chance (3% per skill level) | Config-described; effect verification pending |
| Rogue | Shadowwalker | 62 | Umbral Blades | 5 | Increased attack damage (5% per skill level) | Config-described; effect verification pending |
| Rogue | Shadowwalker | 63 | Shadow Echo | 5 | Your attacks have a 5% chance per skill level to trigger a Shadow Echo, repeating the attack for 40% of its total damage | Config-described; effect verification pending |
| Rogue | Shadowwalker | 64 | Phantom Strike | 5 | Your double hit attacks deal 3% more damage per skill level | Config-described; effect verification pending |
| Rogue | Shadowwalker | 65 | Echo Mastery | 10 | Increases Shadow Echo trigger chance (2% per skill level) and Shadow Echo damage (2% per skill level) | Config-described; effect verification pending |
| Rogue | Shadowwalker | 66 | Umbral Cascade | 10 | Your Shadow Echo has a 4% chance per skill level to echo a second time | Config-described; effect verification pending |
| Rogue | Thief | 67 | Scavenger | 5 | Increased gold gain (2%) and material drops (2%) per skill level | Config-described; effect verification pending |
| Rogue | Thief | 68 | Pickpocket | 5 | Increased gold gain (4% per skill level) | Config-described; effect verification pending |
| Rogue | Thief | 69 | Lucky Hands | 5 | Chance to duplicate a crafting material drop (2% per skill level, up to 15%) | Config-described; effect verification pending |
| Rogue | Thief | 70 | Treasure Hunter | 5 | Increased item drop chance (2% per skill level) | Config-described; effect verification pending |
| Rogue | Thief | 71 | Black Market | 5 | Dropped gear has a chance to roll a higher tier (2% Lucky Tier per skill level) | Config-described; effect verification pending |
| Rogue | Thief | 72 | Master Thief | 5 | Increased gold gain (2%), material drops (3%) and item drop chance (1%) per skill level | Config-described; effect verification pending |
| Druid | Lodge | 73 | Gnaw | 10 | Increased pet damage (8% per skill level) | Config-described; effect verification pending |
| Druid | Lodge | 74 | Dam Builder | 5 | Increased pet damage (15 per skill level) | Config-described; effect verification pending |
| Druid | Lodge | 75 | Tail Slap | 5 | Your pet has a 3% chance per skill level to strike twice | Config-described; effect verification pending |
| Druid | Lodge | 76 | Lodgekeeper | 5 | You get 1 extra level in Pet Mastery per skill level | Config-described; effect verification pending |
| Druid | Lodge | 77 | Thick Pelt | 5 | Increased max health (5% per skill level) and life on kill (8 HP per skill level) | Config-described; effect verification pending |
| Druid | Lodge | 78 | Timberfall | 5 | Increased boss damage (5% per skill level) | Config-described; effect verification pending |
| Druid | Tunnels | 79 | Digger | 10 | Increased material drops (2%) and item drop chance (1%) per skill level | Config-described; effect verification pending |
| Druid | Tunnels | 80 | Keen Snout | 5 | Your pet sniffs out hidden nests — increased pet egg drop chance (1%) and material drops (1%) per skill level | Config-described; effect verification pending |
| Druid | Tunnels | 81 | Hoard | 5 | Increased gold gain (5% per skill level) | Config-described; effect verification pending |
| Druid | Tunnels | 82 | Earthbind | 5 | Increased critical strike chance (3% per skill level) | Config-described; effect verification pending |
| Druid | Tunnels | 83 | Undermine | 5 | You kill the enemy instantly once they reach a certain health percentage (2% Max HP per skill level) | Config-described; effect verification pending |
| Druid | Tunnels | 84 | Deep Roots | 5 | Increased pet experience gain (1%) and rune drop chance (1%) per skill level | Config-described; effect verification pending |
| Druid | Symbiosis | 85 | Kinship | 10 | Converts 3% of your flat attack damage into pet damage per skill level | Config-described; effect verification pending |
| Druid | Symbiosis | 86 | Shared Instinct | 5 | Increased critical damage (10% per skill level) | Config-described; effect verification pending |
| Druid | Symbiosis | 87 | Feral Bond | 5 | Converts 4% of your flat attack damage into pet damage per skill level | Config-described; effect verification pending |
| Druid | Symbiosis | 88 | Twin Heart | 5 | Increased life on hit (3 HP per skill level) and damage reduction (0.5% per skill level, up to 2.5%) | Config-described; effect verification pending |
| Druid | Symbiosis | 89 | Wild Attunement | 5 | Amplifies your pet's elemental weakness bonus (3% per skill level) | Config-described; effect verification pending |
| Druid | Symbiosis | 90 | One Soul | 5 | Increased pet damage (5% per skill level) | Config-described; effect verification pending |
## Highest-risk mechanics for tests

- **Warrior:** defense → retaliation, Reflecting source separation, Bulwark/dodge, blocked attack +50%, Counterstrike, Deflection, and whether crit/double hit repeat reflected hits. Culling Strike / Executioner threshold stacking.
- **Archer:** shared trap cap, pet elemental matching, Pet Mastery via Strong Pet Bound, Alpha Strike hit behavior, crit-triggered Perfect Shot.
- **Mage:** Magic Blast base 50% trigger + Unstable Energy per effective level; proc overflow/cap; triple-damage Arcane Cascade; Pyroclasm vs crit damage; ACS beyond allocated max.
- **Rogue:** Shadow Echo + Echo Mastery + Umbral Cascade chaining, repeat/trigger caps, opening/finishing HP-gated bonuses.
- **Druid:** Kinship and Feral Bond flat AD → pet conversion, Tail Slap double attack, Undermine instant-kill threshold, pet weakness bonuses; damage reduction cap in Twin Heart.
- **All classes:** exact unlock conditions, 5/10 point allocation limits, caps per effect, ACS scaling beyond allocatable cap, flat vs additive vs multiplicative stages, equipped pet vs active pet, critical rolls / double hit / double damage and enemy mitigation.

## Current blockers and requested capture set

1. Full current `/config/game` response as valid JSON; **do not include cookies, passwords, account tokens or identifiers**.
2. Per-class same-time full character stats, full attack/pet/retaliation breakdown panels, ACS total and skill ranks/tooltips, equipment and gem bonuses, pets, runes, passive & guild tree, time boost and stance.
3. **Controlled one-variable A/B test**: remove/add exactly +1 ACS without changing unrelated bonuses (or capture all resulting changes), screenshot before/after each class skill effect and attack/pet breakdown; test near caps.
4. Additional controlled changes: one primary-stat or gear drop-bonus source, stance on/off, 50% guild boost, and one matched enemy with observed combat results.
5. When convenient, Rogue and Druid examples for cross-class coverage. Baselines from Archer, Mage and Warrior alone cannot confirm all 90 skills.

**APK / network evidence:** the previously supplied 1.3.6 base APK contains asset art but lacks its required ABI split compiled code. Previous `.pcapng` captures held encrypted traffic. Full client combat implementation and current server-side formulas were **not** recovered. This matrix deliberately does not claim a complete game-code review.


## October 17 user-provided current config and Reality Warp clarification

- Uploaded plain-text note `Notes_261017_094319.txt` starts with a JSON object and version `2026-10-17-001+chat+realms+...`.
- **Incomplete transfer:** the file ends at **exactly 20,000 characters**, mid-value in `itemization.monster_material_requirements.awaken_overrides_by_band`; ordinary `JSON.parse` fails at offset 19,998. **The current `class_skill_caps` section is NOT present in the available bytes**. Do not mislabel this as a complete/validated current configuration, even though the version header is useful.
- User clarified expected rule: treat ACS as bonus effective ranks, calculate every skill effect independently, clip only effects for which the game states a hard cap. Other effects on the same skill keep scaling, without clipping to the unrelated effect's cap.
- New Mage Reality Warp screenshot: **5 allocated +17 ACS = effective 22**, Double Hit bonus `22×2%=+44%` still scales. Boss Damage raw `22×5%=110%` is displayed as **100% applied (110% raw) / 100% max**. This is another direct two-output cap example.
- One allocated point +20 ACS also yields effective 21, Double Hit +42%, Boss Damage +100% applied (105% raw). No reason to invest beyond 1 point merely to increase the *capped Boss Damage* contribution, but +2% per additional effective rank can still improve Double Hit.
- Updated source-backed `mageRealityWarp` example and regression test in the development branch. Need the **untruncated current JSON** to ingest all `class_skill_caps` records and stop asking for manual cap confirmations for routine skills. Conditional proc/overlap behavior remains a distinct combat-validation question.
