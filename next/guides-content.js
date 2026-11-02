// Featured guides: written by the owner (or credited players, with consent), kept in the repo so they
// can be long, versioned and reviewed like code. Body uses the Handbook text syntax (see handbook.js):
// ## / ### headings, - lists, 1. steps, | tables |, > notes, **bold**, [[topic]] Handbook links,
// [[tool:id|words]] tool links and [words](#/route) links.

export const FEATURED_GUIDES = [
  {
    id: 'retaliation-warrior',
    title: 'Retaliation Warrior: the endgame guide',
    summary: 'How retaliation is really calculated, and what every roll is worth, from a top-100 Warrior at ML 300+.',
    author: 'Zane', cls: 'warrior', stance: 'bulwark', updated: '2026-11-02', gameVersion: '1.3.13', level: 'ML 300+',
    readTime: '9 min',
    body: `A top-100 Retaliation Warrior at ML 300+ averages **16.83qa per enemy attack before procs**, and the game now shows exactly how that number is built. This guide ranks every upgrade by how much real damage one roll adds, using that formula and my own character as the worked example.

> Want these numbers for your own character? Copy your Retaliation Breakdown into the [[tool:retaliation|Retaliation planner]]. It ranks every upgrade on your stats.

## The short version

- **Retaliation is a stack of separate multipliers.** A bonus is worth its size divided by the layer it lands in, so small layers (your Reflecting pool, Defense gems) beat huge ones.
- **Your weakest equipped pet sets the cap for the other three.** Level your Increased Strength pet first; it was costing me 20%+ until I fixed it.
- **Strength counts twice.** It feeds its own layer and the pet Increased Strength layer, so 100 Strength is about +4.4%.
- **Double Hit and Double Damage have no cap; Crit does.** Crit Chance above 100% just becomes Crit Damage, which makes Crit the weakest offensive stat in this build.
- **Block, Damage Reduction and the class skills all cap.** Past the cap, extra points are wasted.

This guide assumes ML 300+, an Infernal and Mythic gear set, a full 6×7 rune grid and four Legendary pets. Earlier progression is a different guide; start with [[build-types]].

## How retaliation is calculated

Every enemy attack, blocked or not, triggers one retaliation. The in-game Retaliation Breakdown shows the full formula, and the numbers below reproduce my sheet to the last digit.

> **Base** = 0.60 × Defense × (Reflecting + Deflection + Bulwark)
> **Max hit** = Base × every layer below × 1.25 (Combat Stance)
> **Min hit** = 70% of max

The 0.60 is the Level ratio. It starts at 1.50 at ML 1 and bottoms out at 0.60, so at ML 300+ it never changes.

| Layer | My boss preset | Multiplier | What feeds it |
| --- | --- | --- | --- |
| Base pool | 378.4% | — | Reflecting drop bonuses 323.4%, Deflection 40%, Bulwark Stance 15% |
| Defense | 780.28M | — | Gear, gems, runes, everything that raises Defense |
| Strength | +2,160% | ×22.60 | 0.5% per point of Strength (pet bonus excluded) |
| Pet Increased Strength | +2,250% | ×23.46 | The same Strength again, × your pet's Increased Strength % |
| Pet Retaliation | +4,314% | ×44.14 | Retaliation hatch bonuses on equipped pets |
| Talisman Inscription | +496% | ×5.96 | Retaliation inscriptions on both talismans |
| Runes | +909.8% | ×10.10 | Rune and runeword Retaliation % |
| Guild Skill Tree | +77.8% | ×1.78 | Retaliation nodes |
| Gear Sets | +40% | ×1.40 | Set bonuses |
| Echo Blessings | +18% | ×1.18 | Echoes |
| Gems | +16.2% | ×1.16 | Lapis main stat in weapon sockets |
| Time boost | +86% | ×1.86 | Active time boost |

Result: 1.77B base per attack, **13.86qa to 19.8qa, average 16.83qa**.

### What the sheet doesn't show

The breakdown stops before the per-attack effects, and those are where most of the damage comes from.

- **Blocked attacks ×1.75.** That's 1.5 base plus Counterstrike at its 25% cap. Block caps at 96%, so on average this is ×1.72.
- **Crit.** Crit Chance above 100% converts 1:1 into Crit Damage, so every retaliation crits.
- **Double Hit, no cap.** 534% means 6 guaranteed hits plus a 34% chance at a 7th. Relentless Assault adds one more strike at 100% trigger.
- **Double Damage, no cap.** 959% means 10× guaranteed plus a 59% chance at 11×.
- **Titanic Blow.** 80% chance (capped) to deal triple damage.

Stacked, that takes 16.83qa on the sheet to roughly **130–180Qi of expected damage per enemy attack**. The range depends on whether the shown Crit Damage already includes the overflow from Crit Chance, which isn't confirmed.

The big lesson: because the layers multiply, a bonus is worth (its size) ÷ (100% + what's already in that layer). 55% added to a 378% base pool is +14.5%. The same 55% added to the 4,314% pet layer is +1.2%.

## Stat priority: what one roll is worth

Reflecting is the best single roll in the game for this build, and Crit is the worst. Each row is the damage gain from adding one typical endgame roll to my boss preset.

| Upgrade | Typical roll | Damage gain | Why |
| --- | --- | --- | --- |
| Reflecting drop bonus | +55% | **+14.5%** | Lands in the 378% base pool, the smallest layer |
| Strength affix | +250 | **+11%** | Counts in two layers |
| Double Hit affix | +59% | **+8–9%** | No cap; adds a whole extra hit |
| Double Damage affix | +65% | **+6%** | No cap |
| Defense Garnet (armor slots) | +11.5% Defense | **+5.9%** | Gems are their own Defense layer (tested below) |
| Lapis (weapon) | +5.5% Retaliation | +4.7% | Small Gems layer |
| Strength Garnet (jewelry) | +100 Strength | +4.4% | Two layers |
| Guild tree Retaliation rank | +5.19% | +2.9% | Small guild layer |
| Talisman Retaliation inscription | ~+12.6% | +2.1% | |
| Crit Chance or Crit Damage affix | +60% | ~+2% | Crit Chance over 100% is just Crit Damage, divided into ~2,500–3,000% |
| Talisman Strength inscription | ~+11 Strength | +0.5% | |
| Block, Dodge, Damage Reduction | any | **0%** | Capped, or disabled by Bulwark |
| Attack Damage (flat or %) | any | **0%** | Retaliation ignores it |

Defense % from gear (Fortress affixes on jewelry, Armored drop bonuses) is missing on purpose. There's no Defense breakdown in game, so its layer size is still unknown; see the open questions at the end.

The practical rule: when you reroll, turn Crit affixes into Double Hit or Strength first. When you swap drop bonuses, Reflecting beats everything.

## Pets: one Increased Strength, three Retaliation

Run one Legendary Increased Strength pet and three Legendary Retaliation pets. Between them they make two of the biggest layers, ×23 and ×44 on my sheet.

- **Increased Strength** multiplies all your Strength again as its own layer. Swapping it for a fourth Retaliation pet would drop the ×23 layer to ×1 to gain about ×1.3. Never do that.
- **Retaliation** pets stack inside one layer. They grow about 7% per compound level past +30 (+43 is 1,438%, +47 is 1,887%).
- **Block Chance and Defense pets are out.** Block is already capped at 96%, and one Defense pet is worth far less than either layer above.

### Equalisation: the weakest pet sets the cap

On seasonal characters, each equipped pet pays out at most **your lowest equipped pet's level + 10**. My Crow (Increased Strength) sat at +33, so my +45 to +47 Retaliation pets were all paid as +43. That cost more than any single gear upgrade.

| Crow level | Increased Strength | Pet Retaliation paid | Damage vs +33 |
| --- | --- | --- | --- |
| +33 | 104% | 4,314% | — |
| +35 | 110% | 4,941% | +20.5% |
| +36 | 113% | 5,173% | +29.4% |
| +37 | 116% | 5,297% (nothing capped) | +35.8% |
| +40 | 125% | 5,297% | +45.9% |
| +45 | 140% | 5,297% | +62.8% |

Increased Strength grows a flat 3% per compound level (5% + 3% × level). Retaliation pets compound. So once the cap is clear, keep the Strength pet within 10 levels of your best Retaliation pet and spend the rest on Retaliation. The [[tool:pets|Compound level calculator]] shows any bonus at any level.

### Getting the copies

Each compound level needs another pet of the **same species with the same hatch bonus**. Increased Strength is one of 23 Legendary hatch bonuses, about a 4.5% roll.

Favourite Pets help with the species half. With all 286 favourite points on one species, about 55% of hatches are that species. Spreading points across four species gives the same combined odds for the four, so concentrate only when you need one specific pet.

### Affixes

Evolved pet affixes don't touch damage for this build. All Class Skills is worth keeping up to +15 total (see class skills below); otherwise roll farming affixes (Item Quantity, Material Quantity, Rune Drops, Extra Kill). The [[tool:petaffix|Affix level cost]] tool shows the shard cost.

## Gear: drop bonuses first, then affixes

The drop bonus decides most of an item's value, because Reflecting is the only stat that feeds the small base pool. Reflecting rolls 26–34% at Tier 7, 34–42% at Tier 8 and 42–50% at Tier 9, and stars push it higher (my Tier 9 boots sit at 72.5% at ★10).

| Slot | Item | Drop bonus | Key affixes |
| --- | --- | --- | --- |
| Weapon | Frostfang Blade (Infernal) | Armored 74.6% (T9 ★10) | Strength 227, Double Hit 58%, Crit Chance 58% |
| Offhand | Gilded Shield (Infernal) | Armored 68.7% (T8 ★11) | Crit Damage 58%, Crit Chance 58%, Double Damage 48% |
| Helmet | Steel Plate Helm (Infernal) | Armored 38.2% (T7 ★7) | Increased Defense 740%, Double Damage 72%, Crit Chance 72% |
| Armor | Steel Plate Armor (Infernal) | Armored 48.5% (T7 ★10) | Increased Defense 925%, Crit Chance 94%, Defense +1,182 |
| Gloves | Steel Plate Gauntlets (Infernal) | Reflecting 46.2% (★5) | Increased Defense 957%, Double Damage 72% |
| Boots | Steel Plate Boots (Infernal) | Reflecting 72.5% (T9 ★10) | Increased Defense 796%, Defense +979 |
| Amulet | Warrior's Amulet (Infernal) | Reflecting 45.8% (T7 ★10) | Strength 266, Defense 198%, Double Hit 59% |
| Ring 1 | Warrior's Ring (Infernal, Awakened 7) | Armored 67.3% (★10) | Strength 287, Defense 183%, Double Damage 65% |
| Ring 2 | Warrior's Ring (Legendary) | Reflecting 58.5% (T8 ★10) | Defense 172%, Double Hit 59%, Double Damage 54% |
| Belt | Scholar's Belt (Infernal) | Reflecting 55.3% (★10) | Strength 222, Defense 202%, Double Hit 55% |
| Torch | Torch (Legendary) | Reflecting 39.7% (T7 ★5) | +9 All Class Skills, Double Damage 58% |

### Affix priority by slot

- **Weapon, rings, amulet, belt:** Strength, then Double Hit, then Double Damage. Defense % (Fortress) is probably worth keeping, but its value is unconfirmed. Crit last.
- **Helmet, armor, gloves, boots:** Increased Defense (multiplies that item's own Defense), then Double Hit and Double Damage. Flat Defense is fine. Crit last.
- **Torch:** All Class Skills is the reason to wear it; you need +15 total from all sources.
- **Never roll for:** Attack Damage, Dodge, Block, Damage Reduction, Life on Hit.

### Armored vs Reflecting

Five of my eleven drop bonuses are Armored (Defense %). A Reflecting roll of the same tier is +12–15% damage. Armored is only better if Defense % sits in a small layer, and that hasn't been tested yet. Until it is, upgrade toward Reflecting when you replace an item. [[tool:pathfinder|Pathfinder]] has the upgrade costs.

## Gems: let the slot decide

A gem's main stat depends on the slot type it sits in, so each slot type has one right family. Sockets belong to the gear slot, and each preset remembers its own gems.

| Slot type | Sockets | Gem | Main stat | Damage per Flawless gem |
| --- | --- | --- | --- | --- |
| Armor (helmet, armor, gloves, boots) | 2 each | Garnet | Defense % | ~+5.9% |
| Jewelry (rings, amulet, belt) | 1–2 each | Garnet | Strength | ~+4.4% |
| Weapon | 3 | Lapis | Retaliation % (+ Attack, Pet) | ~+4.7% |
| Torch | 4 | Any | No useful main stat | Pick for secondaries |

### Defense gems are their own layer (tested)

Removing one Pristine Flawless Garnet (+14.05% Defense) from my helmet dropped Defense from 456.98M to 424.04M, **−7.21%**. That matches the gems' Defense % adding up inside their own layer (my eight armor Garnets total about +95%) and nothing else: (195 − 14.05) ÷ 195 = 0.9279, against an observed 0.9279.

So each Defense Garnet is worth about 6% retaliation, the best gem in the build. Never leave an armor socket empty or holding a weak gem.

### Torch: secondaries only

No gem family gives the torch a damage main stat (Garnet is Max Health, Jade Attack, Lapis Pet Damage, Amber Item Drop). Pick torch gems purely for secondaries, and Amber at least adds Item Drop Chance for farming. Secondary value, best first: Double Hit, then Double Damage, then Crit.

### Secondaries and gem value

Gem value = base × rarity × quality ÷ 100 × (1 + 0.04 × socket level). Flawless is ×6.5 with 3 secondaries and drops only from ML 160.

- A Flawless Double Hit secondary at socket 54 is about +7.2%, roughly **+1%** damage. Crit secondaries are worth a quarter of that.
- Quality matters more than socket level at this stage. A 90% gem swapped for a 114% Pristine is +27% on that gem.
- Socket levels cost ×1.8 more each level. Level 55 costs about 1.5Qi and adds about 1.3% to one gem, roughly +0.1% damage. Past level ~50, spend gold elsewhere first.

## Talismans, class skills and guild tree

### Talismans: inscriptions are everything

The talisman type barely matters. No type has a Defense or Retaliation stat, and the Iron talisman's Damage Reduction goes into an already capped stat. I run Fury and Iron; the two slots can't be duplicates.

Inscriptions are what count. My Retaliation inscriptions total +496%, a ×5.96 layer. Every 10 copies of the same inscription add +10% to its value, so 17 Retaliation inscriptions is three away from the next bonus.

| Inscription | Per copy (approx.) | Damage per copy |
| --- | --- | --- |
| Retaliation | +12.6% | +2.1% |
| Strength | +11 Strength | +0.5% |
| Double Hit / Double Damage | ~+10% | ~+1.5% / ~+1% |
| Crit Damage | ~+16% | ~+0.6% |

### Class skills: everything caps

All Class Skills (ACS) pushes skills past their normal rank, but each effect has a hard cap. With +17 ACS, every skill below is capped, and two points are spare.

| Skill | Effect | Cap | Ranks to cap |
| --- | --- | --- | --- |
| Deflection | +4% Retaliation, +2% Block per rank | 40% Retaliation / 25% Block | 10 (+5 ACS) |
| Counterstrike | +2% blocked-hit retaliation per rank | 25% | 13 (+8 ACS) |
| Relentless Assault | 10% per rank to strike once more on a Double Hit | 100% | 10 (+5 ACS) |
| Titanic Blow | 4% per rank to deal triple damage | 80% | 20 (+15 ACS) |
| Culling Strike + Executioner | Instant kill threshold | 35% | +13 ACS |

**+15 ACS is the target.** Titanic Blow is the only skill that needs that much. Anything above +15 is wasted. Plan the rest of your points in the [[tool:studio|Build Studio]] skill trees.

**Bulwark Stance** adds 15% to the base pool and the ×1.25 Combat Stance multiplier, and sets Dodge to 0%. Every Dodge roll on your gear and runes does nothing.

### Guild Skill Tree

The guild tree's Retaliation node is its own layer (×1.78 for me). Each 5.19% rank is about +2.9% damage. The Attack Damage and Pet Damage nodes beside it are worthless for this build. Plan it in the [[tool:guildtree|Guild skill tree]] tool.

## Runes

Runes are my third-biggest controllable layer: +909.8% Retaliation (×10.10) from a full 6×7 grid of ★3 level-76 runes. The farming grid swaps to Wisdom and Fortune for +1,717% Exp and +1,503% Gold and drops to +687% Retaliation.

What the boss grid gives besides Retaliation:

- **Defense +10,672 (flat).** Flat Defense is added before every Defense multiplier, so this is a real share of total Defense.
- **Attack Damage +9,961 and +90%.** Dead for retaliation; that's the cost of running Fury runes.
- **Max Health +13,884.** Survival only.
- **Dodge +22.5%.** Dead under Bulwark Stance.

Worth testing: Fortitude runes put their main stat into flat Defense, Fury runes into Attack Damage. If a Fortitude rune can carry the same Retaliation secondary as a Fury rune, every Fury to Fortitude swap should add Defense for free.

## Two presets: boss and farming

I keep two gear presets, and the boss one hits 8.4× harder per enemy attack. Retaliation only fires when you're hit, so the boss preset matters wherever enemies live long enough to swing: bosses, Tower, guild boss.

| | Boss preset | Farming preset |
| --- | --- | --- |
| Retaliation per attack (avg) | 16.83qa | 2.00qa |
| Defense | 780.28M | 313.70M |
| Reflecting pool | 323.4% | 102.1% |
| Drop bonuses | Reflecting + Armored | Mostly Frenzy (Extra Kill) |
| Runes | Retaliation and Defense | Wisdom and Fortune: +1,717% Exp, +1,503% Gold |
| Extra Kill Chance | 16% | 110.3% |
| Exp Gain | 1,058% | 2,855% |

Farming trades retaliation for Extra Kill. Culling Strike at its 35% cap shortens every kill, which suits the lower-damage farming preset. See [[monster-level]] for picking what to farm.

### Dead stats checklist

These show up on endgame gear and do nothing for this build. Reroll them first.

- **Dodge Chance:** set to 0% by Bulwark Stance.
- **Block Chance past 96%:** I'm at 115% raw. The shield's +71% plus Deflection's 25% already covers it.
- **Damage Reduction past the cap:** 129% raw shows as 98.4%.
- **Attack Damage, flat or %:** retaliation doesn't use it.
- **All Class Skills past +15.**
- **Intelligence and Dexterity.**

## My build right now, and what's next

Level 404, ML 314, Gear Score 4,836, 16.83qa average retaliation per enemy attack on the boss preset.

| Stat | Boss preset |
| --- | --- |
| Defense | 780.28M |
| Strength | 8.81K |
| Block Chance | 96% (115% raw) |
| Damage Reduction | 98.4% (129.4% raw) |
| Crit Chance / Crit Damage | 682.1% / 2,421% |
| Double Hit / Double Damage | 534% / 959% |
| All Class Skills | +17 (torch +9, pets +8) |
| Pets | Crow (Increased Strength), Diablo, Wasp, Zbakus (Retaliation) |
| Talismans | Fury +9 and Iron +9, max level |

### Upgrade path, in order

1. Bring the Increased Strength pet within 10 levels of the best Retaliation pet. Worth +36% from where I started.
2. Fill every armor socket with a high-quality Defense Garnet (about +6% each).
3. Reroll Crit affixes into Strength or Double Hit (+9–11% per swap instead of +2%).
4. Replace low-tier Reflecting rolls and test Armored vs Reflecting (below).
5. Push Retaliation inscriptions to the next 10-copy milestone.
6. Keep compounding Retaliation pets, with the Strength pet trailing by no more than 10.

### Still unconfirmed

- **How Defense % from gear stacks.** Fortress affixes and Armored drop bonuses may share one pool or sit in separate layers. Test: swap one Armored item for a near-identical non-Armored one and compare Defense.
- **Whether Strength also raises Defense.** Test: remove a jewelry Strength Garnet and see if Defense moves.
- **Crit overflow.** Whether the shown 2,421% Crit Damage already includes the overflow from Crit Chance.
- **Relentless Assault on retaliation.** Double Hit, Double Damage and Titanic Blow are confirmed; Relentless is assumed.

All numbers come from my own character sheet on 2 November 2026 and the game config as of 9 October 2026. The Retaliation Breakdown formula is verified against the in-game sheet; anything marked unconfirmed isn't.`
  }
];
export const featuredGuide = id => FEATURED_GUIDES.find(g => g.id === id) || null;
