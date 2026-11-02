// Featured guides: written by the owner (or credited players, with consent), kept in the repo so they
// can be long, versioned and reviewed like code. Body uses the Handbook text syntax (see handbook.js):
// ## / ### headings, - lists, 1. steps, | tables |, > notes, **bold**, [[topic]] Handbook links,
// [[tool:id|words]] tool links and [words](#/route) links.
// The editing draft lives in a Claude Doc; author-only "Zane:" notes there are never copied here.

export const FEATURED_GUIDES = [
  {
    id: 'retaliation-warrior',
    title: 'Retaliation Warrior: the journey to endgame',
    summary: 'How to build a Retaliation Warrior from any start, read your own numbers, and know what every upgrade is worth. From a top-100 player at ML 314.',
    author: 'Zane', cls: 'warrior', stance: 'bulwark', updated: '2026-11-02', gameVersion: '1.3.13', level: 'Any stage',
    readTime: '14 min',
    body: `I'm a washed-out Retaliation Warrior who crawled into the top 100 after a rough start to this season. This guide is everything I've learned: how to build a Retaliation Warrior, what to collect while you get there, and how to read your own numbers so you know what an upgrade does before you make it.

It's written for everyone. Newer players can follow the build step by step, and experienced players should still find a few things they didn't know. I use my own character as the worked example, and I rank upgrades by how much real damage one roll adds, using the formula the game shows in the Retaliation Breakdown.

> Want these numbers for your own character? Copy your Retaliation Breakdown into the [[tool:retaliation|Retaliation planner]]. It ranks every upgrade on your stats.

## The short version

- **Retaliation is a stack of separate multipliers.** A bonus is worth its size compared to the pile it lands in, so small piles (your Reflecting pool, Defense gems) beat huge ones.
- **Pets are the hardest part, and the biggest.** Aim for 2 Increased Strength + 2 Retaliation. Your weakest equipped pet caps the other three.
- **Strength counts twice.** It feeds its own pile and your Increased Strength pets' pile, so 100 Strength is about +4.4%.
- **Double Hit and Double Damage have no cap; Crit does.** Crit Chance above 100% just becomes Crit Damage, which makes Crit the weakest offensive stat here.
- **Block, Damage Reduction and the class skills all cap.** Past the cap, extra points are wasted.

## The build at a glance

This is the shopping list. Every row is explained further down.

| Part | What to get | Why |
| --- | --- | --- |
| Stance | Bulwark | +15% to the base pool and ×1.25 on every hit |
| Class skills | Deflection, Counterstrike, Titanic Blow, Relentless Assault | Retaliation, blocked-hit bonus, triple damage, extra hits |
| Pets | 2 Increased Strength + 2 Retaliation (Legendary); most people start at 1 + 3 | Two of your biggest multipliers |
| Drop bonuses | Reflecting | The only stat that feeds the base pool |
| Affixes | Strength, Double Hit, Double Damage, Defense | Crit last; never Attack Damage or Dodge |
| Offhand | A shield | Most of your Block Chance |
| Gems | Garnet in armor and jewelry, Lapis in the weapon, anything in the torch | Defense, Strength and Retaliation |
| Runes | Retaliation secondaries, Fortitude for flat Defense | Your third-biggest pile |
| Talismans | Retaliation inscriptions | Their own multiplier |
| Guild tree | Retaliation node | Its own multiplier |

## Getting there: start with anything, collect for the switch

You don't have to start as a Retaliation Warrior. Attack Damage Warrior is easier early on, and I actually started this season as a Druid. What makes the switch smooth is that a lot of what you collect for other builds carries straight over.

### Pet bonuses can be swapped

This is the big one. Pet hatch bonuses come in groups, and a bonus can be swapped for another in its group:

| Group | Bonuses you can swap between |
| --- | --- |
| Damage | Retaliation, Pet Damage, Attack Damage |
| Flat stats | Strength, Dexterity, Intelligence |
| Increased stats | Increased Strength, Increased Dexterity, Increased Intelligence |

So every Pet Damage or Attack Damage pet you level is a future Retaliation pet, and every Increased Dexterity or Intelligence pet is a future Increased Strength pet. The damage group also exists at every rarity from Uncommon up, which makes it the easiest group to build. That's why I ended up with three Retaliation pets: they started as a Druid's Pet Damage pets.

### Already shared with other builds

- **Strength:** Attack Warriors want it too, so Strength affixes and Strength Garnets are never wasted.
- **Double Hit and Double Damage:** they apply to retaliation hits as well.
- **Defense gear:** plate armor pieces work in either Warrior build.

### Keep these instead of salvaging them

- Gear with a **Reflecting** drop bonus, even low tier. Useless for attack, gold for retaliation.
- **Defense Garnets.** In armor slots they give Defense %.
- **Runes with Retaliation secondaries**, and Fortitude runes.
- A **shield** with good Block Chance.

### When to switch

Switch once your retaliation per enemy attack beats your attack damage per hit. Both are on Character Stats. The [[tool:retaliation|Retaliation planner]] shows your real retaliation with blocks and procs included, which is usually higher than you'd guess.

## How Defense, Retaliation and Strength drive your damage

Every time an enemy attacks you, your armor hits back. That hit is built from three things.

1. **Defense is the base.** Your hit starts as a share of your Defense, so every point of Defense raises everything after it.
2. **Retaliation % comes in several separate piles.** Reflecting drop bonuses, pets, runes, talisman inscriptions, the guild tree and gems each make their own pile, and the piles multiply each other.
3. **Strength counts twice.** Every point adds 0.5% in its own pile, and your Increased Strength pets copy all of that into a second pile.

### Why the piles matter more than the numbers

Because the piles multiply, what a bonus is worth depends on which pile it lands in, not how big it looks.

> Adding 55% to a pile that's already at 4,314% grows it by about 1%.
> Adding the same 55% to a pile at 378% grows it by about 15%.

That's why 55% of Reflecting is worth over ten times more than 55% of pet Retaliation: your Reflecting pile is small and your pet pile is huge. Once this clicks, you can judge any upgrade yourself.

## Reading your Retaliation Breakdown, line by line

Open Character › Stats and tap the ? next to Retaliation. The screen is the game's real formula, top to bottom. My boss preset reproduces to the last digit.

> **Base** = 0.60 × Defense × (Reflecting + Deflection + Bulwark)
> **Max hit** = Base × every layer × 1.25 (Combat Stance)
> **Min hit** = 70% of max

| Line | What it is | My boss preset |
| --- | --- | --- |
| Reflecting bonuses (gear) | Sum of your Reflecting drop bonuses | +323.4% |
| Deflection (class skill) | 4% per rank, capped at 40% | +40% |
| Bulwark Stance | Flat bonus while in Bulwark | +15% |
| Defense | Your total Defense | 780.28M |
| Level ratio | 1.50 at ML 1, falls to 0.60 and stays there | ×0.60 |
| Strength | 0.5% per point of Strength | ×22.60 |
| Pet increased strength | Your Strength again × your pets' Increased Strength % | ×23.46 |
| Pet Retaliation bonus | Retaliation hatch bonuses on equipped pets | ×44.14 |
| Talisman Inscription | Retaliation inscriptions on both talismans | ×5.96 |
| Runes | Retaliation % from runes and runewords | ×10.10 |
| Guild Skill Tree | Guild Retaliation node | ×1.78 |
| Echo Blessings | Echoes | ×1.18 |
| Gear Sets | Set bonuses | ×1.40 |
| Gems | Lapis main stat in weapon sockets | ×1.16 |
| Time boost | Active time boost | ×1.86 |
| Blocked attacks | 1.5 base + Counterstrike (capped at 25%) | ×1.75 |
| Combat Stance | Bulwark | ×1.25 |

The bottom line, **Damage per enemy attack**, is the range before blocks and procs: 13.86qa to 19.8qa, average 16.83qa for me.

### What the breakdown doesn't show

Most of your damage happens after that number. These all apply to retaliation:

- **Block:** a blocked attack retaliates ×1.75. Block caps at 96%.
- **Crit:** Crit Chance above 100% turns 1:1 into Crit Damage, so every hit crits.
- **Double Hit, no cap:** every full 100% is one more guaranteed hit (534% = 6 hits plus a 34% chance at a 7th).
- **Double Damage, no cap:** every full 100% is one more guaranteed multiplier (959% = 10× plus a 59% chance at 11×).
- **Titanic Blow:** up to 80% chance to deal triple damage.
- **Relentless Assault:** one extra strike when you Double Hit (assumed to work on retaliation; not yet confirmed).

With all of that, my 16.83qa on the sheet becomes roughly **130–180Qi expected per enemy attack**.

## What changes when you swap something

Every item, gem, rune or pet you change moves one or two specific lines on the breakdown. Know which line to watch, and you can test any upgrade in seconds instead of guessing.

| If you change... | Watch this line | Notes |
| --- | --- | --- |
| A Reflecting drop bonus | Reflecting bonuses (gear) | The smallest pile, so the biggest swings |
| Armored drop bonus, Defense % affix, Increased Defense, flat Defense | Defense | How Defense % stacks isn't confirmed yet (see the end) |
| A Garnet in an armor slot | Defense | Gems are their own Defense pile (tested below) |
| Strength (affix, Garnet, inscription) | Strength **and** Pet increased strength | Both move together |
| An Increased Strength pet's level | Pet increased strength, and Pet Retaliation if it was your lowest pet | See equalisation under Pets |
| A Retaliation pet's level | Pet Retaliation bonus | Only if it isn't capped by your lowest pet |
| A Lapis in the weapon | Gems | |
| A rune | Runes, and Defense for Fortitude | |
| A talisman inscription | Talisman Inscription | |
| A set piece | Gear Sets | |
| Crit, Double Hit, Double Damage, Block | Not on the breakdown | Check Character Stats instead |

### How to test a swap

1. Open the breakdown and write down the line you're about to change and the Damage per enemy attack.
2. Make the swap in your preset.
3. Open the breakdown again. New Damage per enemy attack ÷ old, minus 1, is your gain. The line you watched tells you why it moved.

### Example: one Defense Garnet

I took one Garnet (+14.05% Defense) out of my helmet. Defense dropped from 456.98M to 424.04M, **−7.21%**.

My eight armor Garnets added up to about +95% Defense. If gems are their own pile, removing one should leave (195 − 14.05) ÷ 195 = 0.9279 of my Defense. The game showed 0.9279. So Defense Garnets don't share a pile with anything else, and each one is worth about 6% of your damage.

## Stat priority: what one roll is worth

Reflecting is the best single roll for this build, and Crit is the worst. Each row is the damage gain from one typical endgame roll on my boss preset. Your numbers will differ: put your breakdown into the [[tool:retaliation|Retaliation planner]] to get your own ranking.

| Upgrade | Typical roll | Damage gain | Why |
| --- | --- | --- | --- |
| Reflecting drop bonus | +55% | **+14.5%** | Lands in the smallest pile |
| Strength affix | +250 | **+11%** | Counts in two piles |
| Double Hit affix | +59% | **+8–9%** | No cap; adds a whole extra hit |
| Double Damage affix | +65% | **+6%** | No cap |
| Defense Garnet (armor slots) | +11.5% Defense | **+5.9%** | Gems are their own Defense pile |
| Lapis (weapon) | +5.5% Retaliation | +4.7% | Small Gems pile |
| Strength Garnet (jewelry) | +100 Strength | +4.4% | Two piles |
| Guild tree Retaliation rank | +5.19% | +2.9% | Small guild pile |
| Talisman Retaliation inscription | ~+12.6% | +2.1% | |
| Crit Chance or Crit Damage affix | +60% | ~+2% | Over 100%, Crit Chance is just Crit Damage |
| Talisman Strength inscription | ~+11 Strength | +0.5% | |
| Block, Dodge, Damage Reduction | any | **0%** | Capped, or disabled by Bulwark |
| Attack Damage (flat or %) | any | **0%** | Retaliation ignores it |

When you reroll, turn Crit affixes into Double Hit or Strength first. When you choose drop bonuses, Reflecting beats everything.

## Equipment and juggling drop bonuses

The drop bonus decides most of an item's value for this build. Reflecting is the only stat that feeds your base pool, so it's what you hunt for.

| Drop bonus | Does | Use it for |
| --- | --- | --- |
| Reflecting | Adds to your base pool | Boss preset, always |
| Armored | Defense % | Boss preset, until you have Reflecting for that slot |
| Frenzy | Extra Kill Chance | Farming preset |
| Scholarly, Prosperous, Scavenger's | Exp, Gold, Item drops | Farming preset |

Reflecting rolls 26–34% at Tier 7, 34–42% at Tier 8 and 42–50% at Tier 9, and stars push it higher (my Tier 9 boots sit at 72.5% at ★10).

### Juggling: two presets

You can't have every drop bonus on one set, so keep two presets and swap.

- **Boss preset:** Reflecting and Armored, Retaliation runes, Defense and Strength gems. For bosses, Tower, guild boss and anything that lives long enough to hit you.
- **Farming preset:** Frenzy and farming bonuses, Wisdom and Fortune runes. Retaliation still kills, just slower.

Each preset remembers its own gems, so set both up once.

### Affixes, slot by slot

- **Weapon, rings, amulet, belt:** Strength, then Double Hit, then Double Damage. Defense % (Fortress) is probably worth keeping. Crit last.
- **Helmet, armor, gloves, boots:** Increased Defense (multiplies that item's own Defense), then Double Hit and Double Damage. Flat Defense is fine. Crit last.
- **Offhand:** a shield. Its Block Chance plus Deflection gets you to the 96% cap.
- **Torch:** All Class Skills is the reason to wear it.
- **Never roll for:** Attack Damage, Dodge, Block (past the cap), Damage Reduction, Life on Hit.

### Armored vs Reflecting

A Reflecting roll is worth about 12–15% of your damage. Armored is only better if Defense % sits in a small pile, and nobody has tested that yet. Until someone does, replace Armored with Reflecting when you upgrade a slot. [[tool:pathfinder|Pathfinder]] has the upgrade costs.

## Pets: the hardest part, and the biggest

Pets make two of your biggest piles, and they're the most luck-dependent part of the game. I'll be honest: I hate pets. But you can't skip them, so here's how to get the most out of what you hatch.

### The target: 2 Increased Strength + 2 Retaliation

- **Increased Strength** pets copy your Strength into their own pile. Two of them add together, so a second one roughly doubles that pile.
- **Retaliation** pets share another pile. Losing one shrinks it by about a third.

Doubling one pile beats losing a third of the other, which is why 2 + 2 wins. A third Increased Strength pet doesn't: by then the Retaliation pile shrinks too much.

| Setup (on my boss preset) | Damage vs my current pets |
| --- | --- |
| 1 Increased Strength + 3 Retaliation (mine: +35, and +47 / +46 / +45) | — |
| 2 + 2, new Increased Strength pet at +32 | +4% |
| 2 + 2, new pet at +35 | **+32%** |
| 2 + 2, new pet at +40 | +41% |
| 2 + 2, both Increased Strength pets at +45 | **+85%** |
| 3 Increased Strength + 1 Retaliation (all at +35, Retaliation at +47) | +1% |

### My plan: the second Increased Strength pet

I'm levelling a second Increased Strength pet to replace my lowest Retaliation pet. It doesn't need to fully catch up: at **+32**, three levels under my Crow, it already beats keeping the third Retaliation pet. Below that it loses, because it drags the cap down for every other pet.

### Your weakest pet sets the cap

On seasonal characters, every equipped pet pays out at most **your lowest equipped pet's level + 10** (an empty slot counts as +0). My Crow sat at +33 for a while, so my +45 to +47 Retaliation pets were all paid as +43. Getting the Crow from +33 to +37 alone was worth +36%.

Equalisation stops people from stacking one pet to absurd levels, but it also means early luck sets your pace for the whole season. If your pets came in uneven, that's normal: **level your lowest pet first**, and keep every pet within 10 levels of your best one. The [[tool:pets|Compound level calculator]] shows any bonus at any level.

### How hard pets really are

| Rarity | Hatch chance | Notes |
| --- | --- | --- |
| Common | 50% | No bonus |
| Uncommon | 25% | 12 possible bonuses |
| Rare | 15% | 15 possible bonuses |
| Epic | 8% | Unlocks after 10 eggs; guaranteed within 20 hatches |
| Legendary | 2% | Unlocks after 20 eggs; guaranteed within 60 hatches |

- **Species is rolled separately from rarity.** Every species is equally likely, unless you use Favourite Pets.
- **Increased Strength only exists at Epic and Legendary**, about 5% of Epic bonuses and 4.5% of Legendary ones. Counting the swap group (Dexterity and Intelligence too) it's about 15% and 13.5%.
- **Compounding needs the same species with the same bonus.** A Legendary copy fills the compound bar, an Epic copy fills 5 of its 8 boxes.

Put together, with all your favourite points on one species, expect roughly **180 eggs per compound level** of an Increased Strength pet. Retaliation pets are easier, because the damage group exists at every rarity from Uncommon up.

### Favourite Pets

Favourite points raise a species' share of hatches. With all 286 points on one species, about 55% of hatches are that species. Spreading points across four species gives the same total odds for the four, so **concentrate on whichever species is your bottleneck**, which is usually an Increased Strength pet.

### Pet affixes

Evolved affixes don't add damage for this build. All Class Skills is worth keeping until you have +15 in total (see class skills); otherwise roll farming affixes like Item Quantity, Material Quantity, Rune Drops and Extra Kill. The [[tool:petaffix|Affix level cost]] tool shows the shard cost.

## Gems

A gem's main stat depends on the slot it sits in, so each slot has one right gem. Sockets belong to the gear slot, not the item, so you can swap gear without moving gems.

| Slot | Gem | Main stat there | Worth (Flawless) |
| --- | --- | --- | --- |
| Helmet, armor, gloves, boots | Garnet | Defense % | ~+6% each |
| Rings, amulet, belt | Garnet | Strength | ~+4.4% each |
| Weapon | Lapis | Retaliation % | ~+4.7% each |
| Torch | Any | Nothing useful | Pick for secondaries |

**Torch gems are for secondaries.** No family gives the torch a damage main stat (Garnet is Max Health, Jade Attack, Lapis Pet Damage, Amber Item Drop). Amber at least adds Item Drop Chance for farming. Secondary value, best first: Double Hit, then Double Damage, then Crit.

### Making gems better

- **Rarity:** Flawless is ×6.5 with 3 secondaries, drop-only from ML 160, and can't be fused. Brilliant is ×4 with 2 secondaries.
- **Quality** (80–100%, Pristine goes higher) matters more than socket level late on. Swapping a 90% gem for a 114% Pristine is +27% on that gem.
- **Socket level** multiplies the gem by 1 + 0.04 per level, but each level costs 1.8× the last. Around level 55 a level costs about 1.5Qi for roughly +0.1% damage. Past ~50, spend gold elsewhere first.
- **Recut** rerolls secondaries. A Flawless Double Hit secondary is worth about +1% damage; a Crit one about a quarter of that.

## Runes

Runes are a big pile of their own: +909.8% Retaliation (×10.10) from my full 6×7 grid of ★3 level-76 runes. The grid grows with Monster Level, up to 6×7 at ML 300.

| Rune family | Main stat | For this build |
| --- | --- | --- |
| Fortitude | Flat Defense | Good: flat Defense is added before every Defense multiplier |
| Vitality | Max Health | Survival only |
| Fury | Attack Damage | Dead stat, run it only for secondaries or runewords |
| Precision | Crit Chance | Weak (Crit is the worst stat here) |
| Wisdom, Fortune | Exp, Gold | Farming grid |

What matters most is the **Retaliation secondary** on each rune. The main stat is a bonus on top.

**Worth testing:** if a Fortitude rune can carry the same Retaliation secondary as a Fury rune, every Fury to Fortitude swap adds Defense for free. My boss grid gets +10,672 flat Defense from runes but also +9,961 Attack Damage that does nothing.

Keep a second grid for farming. Mine swaps to Wisdom and Fortune for +1,717% Exp and +1,503% Gold, and drops to +687% Retaliation.

## Talismans, class skills and guild tree

### Talismans: inscriptions are what count

The talisman type barely matters, since no type gives Defense or Retaliation. I run Fury and Iron (you can't equip two of the same). What matters is the **inscriptions**: my Retaliation inscriptions make a ×5.96 pile of their own. Every 10 copies of the same inscription add +10% to its value.

| Inscription | Per copy (approx.) | Damage per copy |
| --- | --- | --- |
| Retaliation | +12.6% | +2.1% |
| Double Hit | ~+9% | ~+1.4% |
| Double Damage | ~+10% | ~+1% |
| Crit Damage | ~+16% | ~+0.6% |
| Strength | +11 Strength | +0.5% |

### Class skills: everything caps

All Class Skills (ACS, from the torch and pet affixes) pushes skills past their normal rank, but each effect has a hard cap.

| Skill | Effect | Cap | ACS needed |
| --- | --- | --- | --- |
| Deflection | +4% Retaliation, +2% Block per rank | 40% / 25% | +5 |
| Counterstrike | +2% blocked-hit retaliation per rank | 25% | +8 |
| Relentless Assault | 10% per rank to strike once more on a Double Hit | 100% | +5 |
| Titanic Blow | 4% per rank to deal triple damage | 80% | +15 |
| Culling Strike + Executioner | Instant kill threshold | 35% | +13 |

**+15 ACS is the target.** Titanic Blow is the only skill that needs that much; anything above +15 is wasted. Plan the rest of your points in the [[tool:studio|Build Studio]] skill trees.

**Bulwark Stance** adds 15% to the base pool and ×1.25 to every hit, and sets Dodge to 0%. That makes every Dodge roll on your gear and runes useless.

### Guild Skill Tree

The Retaliation node is its own pile (×1.78 for me). Each 5.19% rank is about +2.9% damage. The Attack Damage and Pet Damage nodes next to it do nothing for this build. Plan it in the [[tool:guildtree|Guild skill tree]] tool.

## Keeping up: the maintenance loop

Once the build is together, progress is smooth as long as you keep checking the same few things. In order of how much they usually pay:

1. **Lowest pet.** Is any pet more than 10 levels behind your best? Level it first.
2. **Pet copies.** Work toward 2 Increased Strength + 2 Retaliation, keeping every pet within 10 levels of your best.
3. **Drop bonuses.** Any new Reflecting item that beats your weakest one? Swap it into the boss preset.
4. **Rerolls.** Turn Crit affixes into Strength or Double Hit.
5. **Gems.** Every armor socket holds a good Defense Garnet; upgrade low-quality gems.
6. **Inscriptions.** Push Retaliation inscriptions toward the next 10-copy bonus.
7. **Presets.** After any change, check both presets still have the right gems and runes.

### Dead stats

These show up on endgame gear and do nothing for this build. Reroll them first.

- **Dodge Chance:** set to 0% by Bulwark Stance.
- **Block Chance past 96%:** I'm at 115% raw. A good shield plus Deflection already covers it.
- **Damage Reduction past the cap:** my 129% raw shows as 98.4%.
- **Attack Damage, flat or %:** retaliation doesn't use it.
- **All Class Skills past +15.**
- **Intelligence and Dexterity.**

## My build: the worked example

Level 404, ML 314, Gear Score 4,836, top 100. Boss preset: 16.83qa average retaliation per enemy attack.

| Stat | Boss preset | Farming preset |
| --- | --- | --- |
| Retaliation per attack (avg) | 16.83qa | 2.00qa |
| Defense | 780.28M | 313.70M |
| Reflecting pool | 323.4% | 102.1% |
| Strength | 8.81K | 8.41K |
| Block Chance | 96% (115% raw) | 96% (115% raw) |
| Crit Chance / Crit Damage | 682.1% / 2,421% | 739.4% / 2,447% |
| Double Hit / Double Damage | 534% / 959% | 529% / 1,079% |
| Extra Kill Chance | 16% | 110.3% |
| All Class Skills | +17 (torch +9, pets +8) | same |

| Slot | Item | Drop bonus | Key affixes |
| --- | --- | --- | --- |
| Weapon | Frostfang Blade (Infernal) | Armored 74.6% | Strength 227, Double Hit 58%, Crit Chance 58% |
| Offhand | Gilded Shield (Infernal) | Armored 68.7% | Crit Damage 58%, Crit Chance 58%, Double Damage 48% |
| Helmet | Steel Plate Helm (Infernal) | Armored 38.2% | Increased Defense 740%, Double Damage 72% |
| Armor | Steel Plate Armor (Infernal) | Armored 48.5% | Increased Defense 925%, Crit Chance 94% |
| Gloves | Steel Plate Gauntlets (Infernal) | Reflecting 46.2% | Increased Defense 957%, Double Damage 72% |
| Boots | Steel Plate Boots (Infernal) | Reflecting 72.5% | Increased Defense 796%, Defense +979 |
| Amulet | Warrior's Amulet (Infernal) | Reflecting 45.8% | Strength 266, Defense 198%, Double Hit 59% |
| Ring 1 | Warrior's Ring (Infernal) | Armored 67.3% | Strength 287, Defense 183%, Double Damage 65% |
| Ring 2 | Warrior's Ring (Legendary) | Reflecting 58.5% | Defense 172%, Double Hit 59% |
| Belt | Scholar's Belt (Infernal) | Reflecting 55.3% | Strength 222, Defense 202%, Double Hit 55% |
| Torch | Torch (Legendary) | Reflecting 39.7% | +9 All Class Skills, Double Damage 58% |

Pets: Crow +35 (Increased Strength), Wasp +47, Diablo +46 and Zbakus +45 (Retaliation). Next up: a second Increased Strength pet to replace Zbakus. Talismans: Fury and Iron, both max level.

### Still unconfirmed

- **How Defense % from gear stacks.** Fortress affixes and Armored drop bonuses may share one pile or sit in separate ones. Test: swap one Armored item for a near-identical one without it and compare Defense.
- **Whether Strength also raises Defense.** Test: remove a jewelry Strength Garnet and see if Defense moves.
- **Crit overflow.** Whether the shown Crit Damage already includes the overflow from Crit Chance.
- **Relentless Assault on retaliation.** Double Hit, Double Damage and Titanic Blow are confirmed; Relentless is assumed.

Numbers are from my character sheet on 2 November 2026 and the game config as of 9 October 2026.

## Coming next: Convergence

Once my gear reaches its target upgrade level and I'm at ML 350, I'll add my experience with Convergence here.`
  }
];
export const featuredGuide = id => FEATURED_GUIDES.find(g => g.id === id) || null;
