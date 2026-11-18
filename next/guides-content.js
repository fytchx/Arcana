// Featured guides: written by the owner (or credited players, with consent), kept in the repo so they
// can be long, versioned and reviewed like code. Body uses the Handbook text syntax (see handbook.js):
// ## / ### headings, - lists, 1. steps, | tables |, > notes, **bold**, [[topic]] Handbook links,
// [[tool:id|words]] tool links and [words](#/route) links.
// The editing draft lives in a Claude Doc; author-only "Zane:" notes there are never copied here.

export const FEATURED_GUIDES = [
  {
    id: 'retaliation-warrior',
    title: 'Retaliation Warrior: the journey to endgame',
    summary: 'Start with a build that works, keep useful options, then transition into Retaliation and develop it for endgame.',
    author: 'Zane', cls: 'warrior', stance: 'bulwark', updated: '2026-11-17', gameVersion: 'Season 3 review draft', level: 'Any stage',
    readTime: '12 min',
    // Zane's own Build Studio setup (share code from #/build?d=...). Update it by pasting a new code.
    build: 'eyJ2IjoxLCJjIjoxLCJsIjo0MDQsImkiOlsiZ2VhciIsInBldHMiLCJydW5lcyIsInN0YW5jZSJdLCJ0aXRsZSI6IlphbmUncyBSZXRhbGlhdGlvbiBXYXJyaW9yIiwiZyI6eyJoZWFkIjp7Iml0ZW0iOjMsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsxNF0sImdlbXMiOltudWxsLG51bGxdfSwiY2hlc3QiOnsiaXRlbSI6MiwiYXciOjEsInJhbmsiOjAsImRiIjpudWxsLCJhZmYiOltdLCJnZW1zIjpbbnVsbCxudWxsXX0sImhhbmRzIjp7Iml0ZW0iOjUsImF3IjoxLCJyYW5rIjowLCJkYiI6bnVsbCwiYWZmIjpbXSwiZ2VtcyI6W251bGwsbnVsbF19LCJmZWV0Ijp7Iml0ZW0iOjksImF3IjoxLCJyYW5rIjowLCJkYiI6bnVsbCwiYWZmIjpbXSwiZ2VtcyI6W251bGwsbnVsbF19LCJtYWluIjp7Iml0ZW0iOjEsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsyNyw1LDE4LDIsNF0sImdlbXMiOltudWxsLG51bGwsbnVsbF19LCJvZmYiOnsiaXRlbSI6MTIsImF3IjoxLCJyYW5rIjowLCJkYiI6bnVsbCwiYWZmIjpbXSwiZ2VtcyI6W119LCJyaW5nMSI6eyJpdGVtIjoxNiwiYXciOjEsInJhbmsiOjAsImRiIjpudWxsLCJhZmYiOltdLCJnZW1zIjpbbnVsbF19LCJhbXVsZXQiOnsiaXRlbSI6MTcsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsyNywxOSw1LDE4LDJdLCJnZW1zIjpbbnVsbF19LCJyaW5nMiI6eyJpdGVtIjoxNiwiYXciOjEsInJhbmsiOjAsImRiIjoidGhvcm5lZCIsImFmZiI6WzI3LDE5LDUsMTgsMl0sImdlbXMiOltudWxsXX0sImJlbHQiOnsiaXRlbSI6MjUsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsyNywxOSw1LDE4LDJdLCJnZW1zIjpbbnVsbCxudWxsXX19LCJ0Ijp7InRhbDEiOiJmdXJ5IiwidGFsMiI6Imlyb24ifSwicCI6WyJpbmNyZWFzZWRfc3RyZW5ndGgiLCJyZXRhbGlhdGlvbiIsInJldGFsaWF0aW9uIiwicmV0YWxpYXRpb24iXSwiciI6W1swLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDIsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzEsMiwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbMiwyLCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDIsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzQsMiwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbNSwyLCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDUsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzEsNSwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbMiw1LCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDUsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzQsNSwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbNSw1LCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDYsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzUsNiwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXV0sInMiOiJidWx3YXJrIiwibiI6eyJnZWFyIjoiUmVmbGVjdGluZyBkcm9wIGJvbnVzZXMgZmlyc3QsIHRoZW4gU3RyZW5ndGgsIERvdWJsZSBIaXQgYW5kIERvdWJsZSBEYW1hZ2UgYWZmaXhlcy4gRGVmZW5zZSBHYXJuZXRzIGluIGFybW9yIHNsb3RzLCBTdHJlbmd0aCBHYXJuZXRzIGluIGpld2VscnksIExhcGlzIGluIHRoZSB3ZWFwb24uIEZ1bGwgcmVhc29uaW5nIGluIHRoZSBSZXRhbGlhdGlvbiBXYXJyaW9yIGd1aWRlLiJ9LCJieSI6IlphbmUifQ',
    body: `I'm not going to tell you to start your character as a Retaliation Warrior on day one. Retaliation can be a great long-term direction, but its best pieces and supporting systems take time. I started elsewhere, kept useful drops, and moved when I had enough of a foundation to make the switch worthwhile.

This guide follows that whole route: how to begin, what to protect while you are still flexible, how to recognize a good time to transition, and what I focus on once the build reaches endgame. The examples are from my own experience; use your character's numbers and current game details before copying an exact setup.

> **The simple plan:** choose a build you can progress with now, keep items that could support Retaliation, and switch when the complete setup improves your real performance.

## Start with a build you can use now

You can start as a Rogue, Mage, Warrior or Druid. I began the season as a Druid; an Attack Damage Warrior is another straightforward route if you already want to play Warrior. Your first class is a starting point, not a promise that you must keep the same build all season.

While leveling, make the build you have work. Keep your normal Monster Level progress moving and use the gear, pets and runes that are actually helping you. Retaliation is not a reason to weaken your character early by forcing every drop into a future set.

### Keep the pieces that could transfer

Retaliation shares useful stats and equipment choices with other builds. Before salvaging a promising item, check whether its base, drop bonus, affixes or sockets could become useful later.

- Keep strong defensive bases, especially armor pieces with unusually good Defense or a useful drop bonus.
- Hold onto pieces with Reflecting or Armored if they are meaningfully better than what you have. Compare them in your own setup; the bonus name alone does not make an item an upgrade.
- Save useful Strength, Retaliation, Double Hit and Double Damage options while you are still deciding which direction to take.
- Keep spare small runes until you know which runewords and secondary stats your final grid needs.
- Do not spend rare materials trying to perfect temporary gear. Improve it when the gain is useful now, and save materials when the upgrade is only a small sidegrade.

Some pet bonuses and stat choices can be repurposed between damage builds. Check the current pet rules before using a conversion or sacrifice feature; do not assume every action returns the same materials.

## When to transition

Do not switch because you reached a certain character level or because one Retaliation item dropped. Prepare the pieces first, then compare the new setup with what you are using now.

Before changing, check:

1. **Damage:** compare your Retaliation damage per enemy attack with the damage from your current build. Use the Character Stats breakdown and the [Retaliation planner](#/tools/retaliation).
2. **Survival:** make sure the setup can stay alive at the Monster Level you intend to fight. More damage is not useful if the character cannot sustain the fights.
3. **Kill speed:** test the same kind of enemies at the same Monster Level. A higher displayed hit is not automatically better if kills become slower or inconsistent.
4. **The whole loadout:** include pets, runes, talisman inscriptions, gems and skill points. A partial Retaliation set can make the build look worse than it is, while one strong item can make a rushed switch look better than it is.
5. **The cost of changing:** check current class-skill and respec rules in game before spending. Save a copy of your current setup if you may want to return to it.

When the prepared setup performs well on the content you care about, make the change and keep the old pieces until you are confident. If it underperforms, return to your working build and keep collecting.

## What the build is trying to do

Retaliation turns enemy attacks into part of your damage. That makes Defense, the Retaliation bonus and the effects that multiply or add to your hits work together. The important decision is not “which stat has the biggest number?” It is “which change improves my damage or survival most in this setup?”

Bulwark is the Retaliation stance in the version this guide was written around. It disables Dodge, so Dodge rolls are wasted while you use it. Recheck stance and skill descriptions in the [Handbook](#/handbook/classes) if the game changes.

The familiar build pieces are:

- **Defense and defensive gear:** Defense is the base I build around. A special item can still win if its other bonuses justify what it gives up, so compare the full result.
- **Retaliation:** use gear, pets, runes, inscriptions and other bonuses that directly support the build.
- **Strength:** an important part of my setup. Check its current contribution in the Character Stats breakdown.
- **Double Hit, Double Damage and critical stats:** these can affect the final result, but their value depends on your current totals and caps. Test them rather than relying on a fixed ranking.
- **Class skills:** Deflection, Counterstrike, Titanic Blow and Relentless Assault are among the skills I consider for the build. The current skill descriptions and caps matter more than an old rank list.

For the current rules and descriptions, use the relevant [Handbook class and skill pages](#/handbook/classes). This guide explains how I make decisions with those systems; the exact values can change.

## Build the endgame version

Endgame is not one finished shopping list. It is a set of improvements you revisit as your Monster Level, drops and available materials change.

### Gear: compare Defense with the bonus you give up

Ordinary base armor can have substantially more Defense than some special pieces. Sage Diadem, Wardplate and other special items each have trade-offs; they are not automatic upgrades for a Retaliation build. If you are choosing between a base item and a special, compare your actual Retaliation damage and survival with both equipped.

For drop bonuses, I look for Reflecting and Armored pieces that fit the job. Keep a progression or farming setup if it helps you move through monsters, and a stronger boss setup if you need it. Use a planner or compare your stats after changing one piece at a time.

Do not treat an awakening, set milestone or Torch requirement from an old season as a universal breakpoint. The exact Forge requirements and the best place to spend materials need to be checked against the current game.

### Pets: plan for the team, not one lucky pet

Pets are one of the biggest long-term sources of power and one of the most RNG-dependent parts of this build. My endgame direction has been a mix of Increased Strength and Retaliation bonuses. I have also tested a 2-and-2 target, but the value depends on pet levels and on how the bonuses combine.

The practical lesson is to avoid over-investing in one pet while the rest of the team falls behind. Check the displayed stats after leveling or changing a pet; the weakest pet can limit the value of the rest. Save promising pets while you are building the team, and use the current pet-management tools carefully before compounding, selling or sacrificing anything.

My previous pet numbers are included in the archived original as a dated example, not a guaranteed target for your character.

### Runes, runewords and talismans

Build around Retaliation and useful secondary stats, then use runewords to fill gaps in the setup. Fortitude's flat Defense has been useful in my build. I have used Immortal Bulwark, Iron Bulwark and Trinity of Blood for Retaliation, and swapped to Enlightenment or King's Ransom when I wanted a farming setup.

Treat those names as my previous setup, not a Season 3 prescription. Confirm current recipes, rune shapes and effects in the [Runes guide](#/guidebook/runes) and Handbook before rearranging a complete grid. Keep spare runes until you are confident that a replacement setup works.

Retaliation inscriptions can make a difference over time. Check the current Talisman screen for how duplicate inscriptions combine, and compare the result with your other available upgrades.

### Gems and skill points

My older endgame setup favored Defense gems in armor, Strength in jewelry and Retaliation in the weapon. Torch sockets were chosen for useful secondary stats. Those priorities are a starting point for testing; the best gem depends on the item, the available alternatives and your character's current breakdown.

For skills, build toward the effects that matter to your version of Retaliation, then stop investing when an effect is capped or another skill provides more value. Use current in-game descriptions and the Handbook rather than copying the old rank table below without checking it.

## A repeatable endgame loop

When your character is established, use a small loop instead of trying to upgrade everything at once:

1. Pick the next goal: push Monster Level, improve boss damage, stabilize survival, or farm a specific drop or material.
2. Set up for that goal. A farming setup and a boss setup do not have to use identical gear, pets, runes or skills.
3. Change one meaningful piece at a time and record the before-and-after stats or session results.
4. Keep pushing Monster Level when your current setup can progress. Take a detour when the farm, upgrade or adjustment has a clear payoff, then return to the push.
5. Recheck pets and defensive slots as the build changes. A setup that was ideal several milestones ago may no longer be.
6. Spend scarce materials on changes that move the goal forward. Do not chase a perfect roll on a temporary item.

For gear comparisons, the [Retaliation planner](#/tools/retaliation) can help rank possible changes. Session Stats can help you compare how a setup performs over time. Use the same activity and similar conditions for each comparison.

## My previous endgame character

These figures are from my earlier character at **Level 404 and ML 314**. They are a snapshot of one build at that point, not targets for Season 3. The detailed gear and skill screens should be reviewed before using them as a current template.

Table: My previous endgame character
| Example | Previous value |
| --- | --- |
| Retaliation per attack, boss setup | 16.83qa average |
| Defense, boss setup | 780.28M |
| Reflecting pool, boss setup | 323.4% |
| Strength, boss setup | 8.81K |
| Pets | Crow +35 Increased Strength; Wasp +47, Diablo +46 and Zbakus +45 Retaliation |

The lesson from that setup was to compare the size of each change against the whole build. A roll that looks large on its own can add little when that stat is already abundant; a smaller bonus can matter more when it improves a weaker part of the build.

## What I would check before copying my old setup

The earlier version of this guide included exact formulas, breakpoints, drop ranges, gem values, pet odds and skill caps. Those details need a fresh check against the current game before I recommend them as Season 3 facts. The full prior article, including its original tables and exact character snapshot, is preserved in the Test repository archive.

For now, use the old snapshot as a case study, compare against your own live stats, and let your drops decide which upgrade is worth making next.`
  }
];
export const featuredGuide = id => FEATURED_GUIDES.find(g => g.id === id) || null;
