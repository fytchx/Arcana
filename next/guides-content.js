// Featured guides: written by the owner (or credited players, with consent), kept in the repo so they
// can be long, versioned and reviewed like code. Body uses the Handbook text syntax (see handbook.js):
// ## / ### headings, - lists, 1. steps, | tables |, > notes, **bold**, [[topic]] Handbook links,
// [[tool:id|words]] tool links and [words](#/route) links.
// The editing draft lives in a Claude Doc; author-only "Zane:" notes there are never copied here.

export const FEATURED_GUIDES = [
  {
    id: 'retaliation-warrior',
    title: 'Retaliation Warrior: the journey to endgame',
    summary: 'How to build a Retaliation Warrior from any start, and how to read your own numbers so you know what an upgrade does before you make it. From a top-100 player.',
    author: 'Zane', cls: 'warrior', stance: 'bulwark', updated: '2026-11-02', gameVersion: '1.3.13', level: 'Any stage',
    readTime: '8 min',
    // Zane's own Build Studio setup (share code from #/build?d=...). Update it by pasting a new code.
    build: 'eyJ2IjoxLCJjIjoxLCJsIjo0MDQsImkiOlsiZ2VhciIsInBldHMiLCJydW5lcyIsInN0YW5jZSJdLCJ0aXRsZSI6IlphbmUncyBSZXRhbGlhdGlvbiBXYXJyaW9yIiwiZyI6eyJoZWFkIjp7Iml0ZW0iOjMsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsxNF0sImdlbXMiOltudWxsLG51bGxdfSwiY2hlc3QiOnsiaXRlbSI6MiwiYXciOjEsInJhbmsiOjAsImRiIjpudWxsLCJhZmYiOltdLCJnZW1zIjpbbnVsbCxudWxsXX0sImhhbmRzIjp7Iml0ZW0iOjUsImF3IjoxLCJyYW5rIjowLCJkYiI6bnVsbCwiYWZmIjpbXSwiZ2VtcyI6W251bGwsbnVsbF19LCJmZWV0Ijp7Iml0ZW0iOjksImF3IjoxLCJyYW5rIjowLCJkYiI6bnVsbCwiYWZmIjpbXSwiZ2VtcyI6W251bGwsbnVsbF19LCJtYWluIjp7Iml0ZW0iOjEsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsyNyw1LDE4LDIsNF0sImdlbXMiOltudWxsLG51bGwsbnVsbF19LCJvZmYiOnsiaXRlbSI6MTIsImF3IjoxLCJyYW5rIjowLCJkYiI6bnVsbCwiYWZmIjpbXSwiZ2VtcyI6W119LCJyaW5nMSI6eyJpdGVtIjoxNiwiYXciOjEsInJhbmsiOjAsImRiIjpudWxsLCJhZmYiOltdLCJnZW1zIjpbbnVsbF19LCJhbXVsZXQiOnsiaXRlbSI6MTcsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsyNywxOSw1LDE4LDJdLCJnZW1zIjpbbnVsbF19LCJyaW5nMiI6eyJpdGVtIjoxNiwiYXciOjEsInJhbmsiOjAsImRiIjoidGhvcm5lZCIsImFmZiI6WzI3LDE5LDUsMTgsMl0sImdlbXMiOltudWxsXX0sImJlbHQiOnsiaXRlbSI6MjUsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsyNywxOSw1LDE4LDJdLCJnZW1zIjpbbnVsbCxudWxsXX19LCJ0Ijp7InRhbDEiOiJmdXJ5IiwidGFsMiI6Imlyb24ifSwicCI6WyJpbmNyZWFzZWRfc3RyZW5ndGgiLCJyZXRhbGlhdGlvbiIsInJldGFsaWF0aW9uIiwicmV0YWxpYXRpb24iXSwiciI6W1swLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDIsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzEsMiwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbMiwyLCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDIsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzQsMiwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbNSwyLCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDUsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzEsNSwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbMiw1LCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDUsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzQsNSwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbNSw1LCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDYsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzUsNiwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXV0sInMiOiJidWx3YXJrIiwibiI6eyJnZWFyIjoiUmVmbGVjdGluZyBkcm9wIGJvbnVzZXMgZmlyc3QsIHRoZW4gU3RyZW5ndGgsIERvdWJsZSBIaXQgYW5kIERvdWJsZSBEYW1hZ2UgYWZmaXhlcy4gRGVmZW5zZSBHYXJuZXRzIGluIGFybW9yIHNsb3RzLCBTdHJlbmd0aCBHYXJuZXRzIGluIGpld2VscnksIExhcGlzIGluIHRoZSB3ZWFwb24uIEZ1bGwgcmVhc29uaW5nIGluIHRoZSBSZXRhbGlhdGlvbiBXYXJyaW9yIGd1aWRlLiJ9LCJieSI6IlphbmUifQ',
    body: `I'm a washed-out Retaliation Warrior who crawled into the top 100 after a rough start to this season. This is everything I've learned: how to build a Retaliation Warrior, what to collect on the way, and how to read your own numbers so you know what an upgrade does before you make it.

It's for everyone. Newer players can follow the build; experienced players should still find something new. My own character is the worked example throughout.

> Want your own numbers? Copy your Retaliation Breakdown into the [[tool:retaliation|Retaliation planner]] and it ranks every upgrade for your character.

## The short version

- **Retaliation is a stack of separate multipliers.** A bonus is worth its size compared to the pile it lands in, so small piles (your Reflecting pool, Defense gems) beat huge ones.
- **Pets are the hardest part, and the biggest.** Aim for 2 Increased Strength + 2 Retaliation. Your weakest equipped pet caps the other three.
- **Strength counts twice.** It feeds its own pile and your Increased Strength pets' pile, so 100 Strength is about +4.4%.
- **Know how Double Hit, Double Damage and Crit affect your damage.** Double Hit and Double Damage have no cap; Crit Chance above 100% just becomes Crit Damage.
- **Block isn't something you have to pay much attention to after A6.**

## The build at a glance

Table: Open the full shopping list
| Part | What to get | Notes |
| --- | --- | --- |
| Stance | Bulwark | +15% to the base pool and ×1.25 on every hit |
| Important class skills | Deflection, Counterstrike, Titanic Blow, Relentless Assault | Retaliation, blocked-hit bonus, triple damage, extra hits |
| Pets | 2 Increased Strength + 2 Retaliation (Legendary) | Most people start at 1 + 3 |
| Drop bonuses | As much Frenzy as possible without losing your one-shot; Reflecting and Armored | Keep strong pieces with both and swap them as you level and upgrade |
| Stat and affix priority | Retaliation, Defense, Strength, Double Hit, Double Damage | Crit last; never Attack Damage or Dodge |
| Gems | Garnet in armor and jewelry, Lapis in the weapon, anything in the torch | Defense, Strength and Retaliation |
| Runes and runewords | Retaliation and Strength secondaries, Fortitude for flat Defense | Immortal Bulwark, Iron Bulwark, Trinity of Blood to fill gaps; Enlightenment and King's Ransom for farming |

## Getting there: start with anything

You don't have to start as a Retaliation Warrior. Attack Warrior is easier early, and I started this season as a Druid. A lot of what you collect for other builds carries straight over. I'd also save every extra type of 1×1 rune you get, whatever build you're playing.

**Pet bonuses can be swapped within their group.** Every Pet Damage or Attack Damage pet you level is a future Retaliation pet, and every Increased Dexterity or Intelligence pet is a future Increased Strength pet. That's how my Druid's Pet Damage pets became my three Retaliation pets.

Table: See which pet bonuses swap with each other
| Group | Swaps between |
| --- | --- |
| Damage | Retaliation, Pet Damage, Attack Damage |
| Flat stats | Strength, Dexterity, Intelligence |
| Increased stats | Increased Strength, Increased Dexterity, Increased Intelligence |

**Carries over from other builds:**

- **Strength, Double Hit and Double Damage:** Attack Warriors want them too, and they all work on retaliation.
- **Rogue dual-wield:** two daggers with good drop bonuses turn into a sword and shield.

**Keep these instead of salvaging them:**

- **Base chest, gloves, boots and even helm.** They can beat a Sage Diadem in some setups; the base chest especially has an absurd amount of Defense.
- **Defense Garnets** (Defense % in armor slots) and **runes with Retaliation secondaries**.
- **Block boots,** to get you closer to full Block Chance.

Switch once your retaliation per enemy attack beats your attack damage per hit. Both are on Character Stats.

## How your damage works

Every time an enemy attacks you, your armor hits back. That hit is built from three things:

1. **Defense is the base.** Every point of Defense raises everything after it.
2. **Retaliation % comes in separate piles** (Reflecting, pets, runes, talisman inscriptions, guild tree, gems) that multiply each other.
3. **Strength counts twice:** 0.5% per point in its own pile, copied again by your Increased Strength pets.

Because the piles multiply, 55% added to a 4,314% pile is worth about 1%, but the same 55% added to a 378% pile is worth about 15%. That's why Reflecting is worth so much.

**Reading the breakdown:** Character › Stats › tap ? next to Retaliation. It's the game's real formula, top to bottom, and my sheet reproduces to the last digit.

> **Base** = 0.60 × Defense × (Reflecting + Deflection + Bulwark)
> **Max hit** = Base × every pile × 1.25 (Combat Stance). **Min hit** = 70% of max.

Table: See every line of the breakdown explained
| Line | What it is | Mine |
| --- | --- | --- |
| Reflecting bonuses (gear) | Your Reflecting drop bonuses | +323.4% |
| Deflection (class skill) | 4% per rank, capped at 40% | +40% |
| Bulwark Stance | Flat bonus in Bulwark | +15% |
| Defense | Your total Defense | 780.28M |
| Level ratio | 1.50 at ML 1, falls to 0.60 and stays there | ×0.60 |
| Strength | 0.5% per point of Strength | ×22.60 |
| Pet increased strength | Your Strength again × your pets' Increased Strength % | ×23.46 |
| Pet Retaliation bonus | Retaliation pets | ×44.14 |
| Talisman Inscription | Retaliation inscriptions | ×5.96 |
| Runes | Rune and runeword Retaliation % | ×10.10 |
| Guild Skill Tree | Retaliation node | ×1.78 |
| Echo Blessings | Echoes | ×1.18 |
| Gear Sets | Set bonuses | ×1.40 |
| Gems | Lapis in the weapon | ×1.16 |
| Time boost | Active time boost | ×1.86 |
| Blocked attacks | 1.5 + Counterstrike (capped at 25%) | ×1.75 |
| Combat Stance | Bulwark | ×1.25 |

**What the breakdown doesn't show,** all of which apply to retaliation:

- **Block:** blocked attacks retaliate ×1.75. Block caps at 96%.
- **Crit:** Crit Chance above 100% turns 1:1 into Crit Damage, so every hit crits.
- **Double Hit and Double Damage, no cap:** every full 100% is one more guaranteed hit or multiplier (534% Double Hit = 6 hits plus a 34% chance at a 7th).
- **Titanic Blow:** up to 80% chance to deal triple damage.

## Test any upgrade yourself

Every change moves one or two lines on the breakdown. Note the Damage per enemy attack, make the swap, and check again: new ÷ old, minus 1, is your gain.

Table: See which line moves for each kind of change
| If you change... | Watch this line |
| --- | --- |
| A Reflecting drop bonus | Reflecting bonuses (gear) |
| Armored, Defense %, Increased Defense, flat Defense, armor Garnets | Defense |
| Strength (affix, Garnet, inscription) | Strength **and** Pet increased strength |
| An Increased Strength pet's level | Pet increased strength, and Pet Retaliation if it was your lowest pet |
| A Retaliation pet's level | Pet Retaliation bonus (only if it isn't capped) |
| A Lapis, a rune, an inscription, a set piece | Gems, Runes, Talisman Inscription, Gear Sets |
| Crit, Double Hit, Double Damage, Block | Not on the breakdown; check Character Stats |

**Example:** taking one Garnet (+14.05% Defense) out of my helmet dropped Defense from 456.98M to 424.04M, −7.21%. That's exactly what you'd expect if armor Garnets are their own pile, so each one is worth about 6% of your damage.

## What one roll is worth

Reflecting is the best single roll; Crit is the worst. These are my numbers, so yours will differ; the planner ranks them for you.

Table: See the full ranking
| Upgrade | Typical roll | Damage gain |
| --- | --- | --- |
| Reflecting drop bonus | +55% | **+14.5%** |
| Strength affix | +250 | **+11%** |
| Double Hit affix | +59% | **+8–9%** |
| Double Damage affix | +65% | **+6%** |
| Defense Garnet (armor slot) | +11.5% Defense | **+5.9%** |
| Lapis (weapon) | +5.5% Retaliation | +4.7% |
| Strength Garnet (jewelry) | +100 Strength | +4.4% |
| Guild tree Retaliation rank | +5.19% | +2.9% |
| Talisman Retaliation inscription | ~+12.6% | +2.1% |
| Crit Chance or Crit Damage affix | +60% | ~+2% |
| Attack Damage, Dodge, Block past the cap | any | **0%** |

When you reroll, turn Crit affixes into Double Hit or Strength first.

## Gear and presets

Reflecting rolls 26–34% at Tier 7, 34–42% at Tier 8 and 42–50% at Tier 9, and Astral Catalysts push it higher (my Tier 9 boots sit at 72.5%).

**Affix priority:** on helmet, armor, gloves and boots, Increased Defense first (it multiplies that item's own Defense), then Double Hit and Double Damage. Same priority for every other slot. Never roll Attack Damage, Dodge, Intelligence, Dexterity or Pet Damage.

**Armored vs Reflecting:** Armored definitely boosts my damage, but how much seems to change as you progress and your stats get more spread out. Don't guess: swap and check the breakdown.

**Presets:** I use Auto Preset (a premium feature). It swaps to my damage gear and skill tree for bosses, raids and Tower without interrupting combat, and it's very much worth it. My farming rune preset doubles as my dungeon preset. Dungeons don't need damage, just gold find: gold-find gear and affixes, and my same four pet types with Gold Find hatch bonuses and affixes.

## Pets: the hardest part, and the biggest

Pets make two of your biggest piles and they're the most luck-dependent part of the game. I'll be honest: I hate pets.

**The target is 2 Increased Strength + 2 Retaliation.** By my math, a second Increased Strength pet beats a third Retaliation pet once it's within three levels of your first one. That assumes two Increased Strength pets add together in one pile, which I'll confirm when I equip my second.

Table: See the pet setups compared
| Setup (my boss preset) | Damage vs my current pets |
| --- | --- |
| Now: 1 Increased Strength (+35) + 3 Retaliation (+47, +46, +45) | — |
| 2 + 2, new Increased Strength pet at +32 | +4% |
| 2 + 2, new pet at +35 | **+32%** |
| 2 + 2, both Increased Strength pets at +45 | **+85%** |
| 3 Increased Strength + 1 Retaliation | +1% |

**Your weakest pet sets the cap.** Every equipped pet pays out at most your lowest pet's level + 10. My Crow at +33 was capping three +45 to +47 pets at +43; getting it to +37 was worth +36%. So level your lowest pet first. Equalisation stops anyone stacking one pet to absurd levels, but it also means early luck sets your pace for the season.

Table: See the hatch odds
| Rarity | Chance | Notes |
| --- | --- | --- |
| Common | 50% | No bonus |
| Uncommon | 25% | 12 possible bonuses |
| Rare | 15% | 15 possible bonuses |
| Epic | 8% | After 10 eggs; guaranteed within 20 |
| Legendary | 2% | After 20 eggs; guaranteed within 60 |

Species is rolled separately from rarity. Increased Strength only exists at Epic and Legendary, and compounding needs the same species with the same bonus, so expect a long grind. **Favourite Pets** help with the species half: put your points on whichever species is your bottleneck.

**Keep All Class Skills affixes.** All Class Skills keeps scaling every skill that doesn't have a cap, so don't get rid of it.

## Gems

A gem's main stat depends on the slot it's in. They drop from all sorts of content, and there's not much you can do to raise the odds.

Table: See the right gem for each slot
| Slot | Gem | Main stat there | Worth (Flawless) |
| --- | --- | --- | --- |
| Helmet, armor, gloves, boots | Garnet | Defense % | ~+6% each |
| Rings, amulet, belt | Garnet | Strength | ~+4.4% each |
| Weapon | Lapis | Retaliation % | ~+4.7% each |
| Torch | Any | Nothing useful | Pick for secondaries |

Torch gems are only there for secondaries: Double Hit first, then Double Damage, then Crit. Quality matters more than socket level late on; past socket level ~50 each level costs far more than it gives.

## Runes

Runes are a big pile of their own (×10.10 for me). The **Retaliation and Strength secondaries** are what matter, Fortitude adds flat Defense, and Fury's main stat (Attack Damage) does nothing for you.

For runewords, I use Immortal Bulwark, Iron Bulwark and Trinity of Blood to fill gaps, and Enlightenment and King's Ransom on my farming grid.

## Talismans, class skills and guild tree

**Talismans:** the type barely matters; the **Retaliation inscriptions** are what count (×5.96 for me). Every 10 copies of the same inscription add +10% to its value.

**Class skills:** All Class Skills pushes skills past their normal rank, but some effects cap.

Table: See the skill caps
| Skill | Effect | Cap | All Class Skills to cap it |
| --- | --- | --- | --- |
| Deflection | +4% Retaliation, +2% Block per rank | 40% / 25% | +5 |
| Counterstrike | +2% blocked-hit retaliation per rank | 25% | +8 |
| Relentless Assault | Extra strike on a Double Hit | 100% | +5 |
| Titanic Blow | Chance to deal triple damage | 80% | +15 |
| Culling Strike + Executioner | Instant kill threshold | 35% | +13 |

**Bulwark Stance** sets Dodge to 0%, so every Dodge roll you own is dead.

**Guild tree:** the Retaliation node is its own pile (×1.78 for me); each rank is about +2.9%. Attack Damage and Pet Damage nodes do nothing for you.

## Keeping up

Once it's together, progress is smooth as long as you keep checking the same few things:

1. **Lowest pet:** anything more than 10 levels behind your best? Level it first.
2. **Pets:** work toward 2 Increased Strength + 2 Retaliation.
3. **Drop bonuses:** swap better Reflecting or Armored pieces into the boss preset.
4. **Rerolls:** Crit affixes into Strength or Double Hit.
5. **Gems:** a good Defense Garnet in every armor socket.
6. **Inscriptions:** push Retaliation toward the next 10-copy bonus.

**Dead stats to reroll first:** Dodge (Bulwark), Block past 96%, Damage Reduction past its cap, Attack Damage, Intelligence and Dexterity.

## My build

Level 404, ML 314, Gear Score 4,836, top 100.

Table: See my stats, boss vs farming
| Stat | Boss preset | Farming preset |
| --- | --- | --- |
| Retaliation per attack (avg) | 16.83qa | 2.00qa |
| Defense | 780.28M | 313.70M |
| Reflecting pool | 323.4% | 102.1% |
| Strength | 8.81K | 8.41K |
| Crit Chance / Crit Damage | 682.1% / 2,421% | 739.4% / 2,447% |
| Double Hit / Double Damage | 534% / 959% | 529% / 1,079% |
| Extra Kill Chance | 16% | 110.3% |

Table: See my boss gear
| Slot | Item | Drop bonus | Key affixes |
| --- | --- | --- | --- |
| Weapon | Frostfang Blade | Armored 74.6% | Strength 227, Double Hit 58% |
| Offhand | Gilded Shield | Armored 68.7% | Crit Damage 58%, Double Damage 48% |
| Helmet | Steel Plate Helm | Armored 38.2% | Increased Defense 740%, Double Damage 72% |
| Armor | Steel Plate Armor | Armored 48.5% | Increased Defense 925% |
| Gloves | Steel Plate Gauntlets | Reflecting 46.2% | Increased Defense 957%, Double Damage 72% |
| Boots | Steel Plate Boots | Reflecting 72.5% | Increased Defense 796% |
| Amulet | Warrior's Amulet | Reflecting 45.8% | Strength 266, Defense 198%, Double Hit 59% |
| Ring 1 | Warrior's Ring | Armored 67.3% | Strength 287, Defense 183%, Double Damage 65% |
| Ring 2 | Warrior's Ring | Reflecting 58.5% | Defense 172%, Double Hit 59% |
| Belt | Scholar's Belt | Reflecting 55.3% | Strength 222, Defense 202%, Double Hit 55% |
| Torch | Torch | Reflecting 39.7% | +9 All Class Skills, Double Damage 58% |

Pets: Crow +35 (Increased Strength), Wasp +47, Diablo +46, Zbakus +45 (Retaliation). Next up: a second Increased Strength pet to replace Zbakus.

**Still unconfirmed:** whether two Increased Strength pets stack in one pile, how Armored and Defense % stack, whether Crit Damage on the sheet already includes the Crit Chance overflow, and whether Relentless Assault works on retaliation.

## Coming next: Convergence

Once my gear hits its target upgrade level and I'm at ML 350, I'll add my experience with Convergence here.`
  }
];
export const featuredGuide = id => FEATURED_GUIDES.find(g => g.id === id) || null;
