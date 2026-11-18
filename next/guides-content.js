// Featured guides: written by the owner (or credited players, with consent), kept in the repo so they
// can be long, versioned and reviewed like code. Body uses the Handbook text syntax (see handbook.js):
// ## / ### headings, - lists, 1. steps, | tables |, > notes, **bold**, [[topic]] Handbook links,
// [[tool:id|words]] tool links and [words](#/route) links.
// The editing draft lives in a Claude Doc; author-only "Zane:" notes there are never copied here.

export const FEATURED_GUIDES = [
  {
    id: 'attack-damage',
    title: 'Attack Damage: Rogue, Mage and Warrior',
    summary: 'One flexible Attack Damage route for three classes, with Rogue as the recommended starting point.',
    author: 'Zane', cls: 'rogue', classLabel: 'ROGUE · MAGE · WARRIOR', stance: 'attack-damage', updated: '2026-11-17', gameVersion: 'Season 3 review draft', level: 'Any stage', readTime: '5 min',
    body: `This is one guide for Attack Damage Rogue, Mage and Warrior. They share the same broad gear, pet and rune direction; their class skills are what make each version feel different. I recommend starting with Rogue if you want to farm efficiently, then let your drops and interests shape what comes next.

## Why start with Rogue

Rogue is my preferred starting class because its skill tree offers useful farming tools while you level. That gives you more chances to find upgrades and materials as you build toward an Attack Damage setup.

## A simple leveling route

Start by improving Rogue's direct attacks and Double Hit skills. As you level, balance damage with farming utility: if you are still one-shotting your target, take useful utility; if your kills are slowing down, put more points toward damage. Check the current Handbook skill pages before copying exact ranks, because class skill details can change.

## The shared Attack Damage foundation

The three classes can use a similar foundation:

- Prioritize gear and upgrades that improve Attack Damage and the attributes your setup uses.
- Keep useful Attack Damage runes and pets while you are still deciding what to play.
- Save gear with a strong roll instead of replacing it just because a new item dropped.
- Test your kill speed after changing a build. If the change costs one-shots, revisit it before investing more.

## What changes between Rogue, Mage and Warrior

The class skill tree changes; the overall Attack Damage direction does not need to. Use the class's own damage skills and keep the rest of your setup focused on the same goal. The current skill descriptions and unlocks live in the [Handbook](#/handbook/classes).

Retaliation Warrior, Harmony Rogue, Archer and Druid each have their own guide.

## Keep Monster Level moving

If your regular target is still dying in one hit, keep pushing Monster Level. Farm or upgrade when the change is likely to restore your kill speed or unlock a meaningful next step, then return to pushing. Frenzy is useful for loot, but its extra kills do not give Monster Level XP.

## Let the drops shape the route

Choose a direction, then stay open to better options. A useful pet, rune or piece of gear can make another class or build more attractive. Keeping those options early makes a later pivot much easier than trying to rebuild after discarding everything that did not fit your first plan.`
  },
  {
    id: 'retaliation-warrior',
    title: 'Retaliation Warrior: the journey to endgame',
    summary: 'Start with a build that works, keep useful options, then transition into Retaliation and develop it for endgame.',
    author: 'Zane', cls: 'warrior', stance: 'bulwark', updated: '2026-11-17', gameVersion: 'Season 3 review draft', level: 'Any stage',
    readTime: '6 min',
    // Zane's own Build Studio setup (share code from #/build?d=...). Update it by pasting a new code.
    build: 'eyJ2IjoxLCJjIjoxLCJsIjo0MDQsImkiOlsiZ2VhciIsInBldHMiLCJydW5lcyIsInN0YW5jZSJdLCJ0aXRsZSI6IlphbmUncyBSZXRhbGlhdGlvbiBXYXJyaW9yIiwiZyI6eyJoZWFkIjp7Iml0ZW0iOjMsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsxNF0sImdlbXMiOltudWxsLG51bGxdfSwiY2hlc3QiOnsiaXRlbSI6MiwiYXciOjEsInJhbmsiOjAsImRiIjpudWxsLCJhZmYiOltdLCJnZW1zIjpbbnVsbCxudWxsXX0sImhhbmRzIjp7Iml0ZW0iOjUsImF3IjoxLCJyYW5rIjowLCJkYiI6bnVsbCwiYWZmIjpbXSwiZ2VtcyI6W251bGwsbnVsbF19LCJmZWV0Ijp7Iml0ZW0iOjksImF3IjoxLCJyYW5rIjowLCJkYiI6bnVsbCwiYWZmIjpbXSwiZ2VtcyI6W251bGwsbnVsbF19LCJtYWluIjp7Iml0ZW0iOjEsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsyNyw1LDE4LDIsNF0sImdlbXMiOltudWxsLG51bGwsbnVsbF19LCJvZmYiOnsiaXRlbSI6MTIsImF3IjoxLCJyYW5rIjowLCJkYiI6bnVsbCwiYWZmIjpbXSwiZ2VtcyI6W119LCJyaW5nMSI6eyJpdGVtIjoxNiwiYXciOjEsInJhbmsiOjAsImRiIjpudWxsLCJhZmYiOltdLCJnZW1zIjpbbnVsbF19LCJhbXVsZXQiOnsiaXRlbSI6MTcsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsyNywxOSw1LDE4LDJdLCJnZW1zIjpbbnVsbF19LCJyaW5nMiI6eyJpdGVtIjoxNiwiYXciOjEsInJhbmsiOjAsImRiIjoidGhvcm5lZCIsImFmZiI6WzI3LDE5LDUsMTgsMl0sImdlbXMiOltudWxsXX0sImJlbHQiOnsiaXRlbSI6MjUsImF3IjoxLCJyYW5rIjowLCJkYiI6InRob3JuZWQiLCJhZmYiOlsyNywxOSw1LDE4LDJdLCJnZW1zIjpbbnVsbCxudWxsXX19LCJ0Ijp7InRhbDEiOiJmdXJ5IiwidGFsMiI6Imlyb24ifSwicCI6WyJpbmNyZWFzZWRfc3RyZW5ndGgiLCJyZXRhbGlhdGlvbiIsInJldGFsaWF0aW9uIiwicmV0YWxpYXRpb24iXSwiciI6W1swLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDAsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDEsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDMsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs1LDQsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsxLDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFs0LDYsImZvcnRpdHVkZSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDIsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzEsMiwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbMiwyLCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDIsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzQsMiwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbNSwyLCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFswLDUsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzEsNSwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbMiw1LCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFszLDUsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzQsNSwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXSxbNSw1LCJ2aXRhbGl0eSIsInJldGFsaWF0aW9uX3BlcmNlbnQiLCJzbWFsbCJdLFsyLDYsInZpdGFsaXR5IiwicmV0YWxpYXRpb25fcGVyY2VudCIsInNtYWxsIl0sWzUsNiwidml0YWxpdHkiLCJyZXRhbGlhdGlvbl9wZXJjZW50Iiwic21hbGwiXV0sInMiOiJidWx3YXJrIiwibiI6eyJnZWFyIjoiUmVmbGVjdGluZyBkcm9wIGJvbnVzZXMgZmlyc3QsIHRoZW4gU3RyZW5ndGgsIERvdWJsZSBIaXQgYW5kIERvdWJsZSBEYW1hZ2UgYWZmaXhlcy4gRGVmZW5zZSBHYXJuZXRzIGluIGFybW9yIHNsb3RzLCBTdHJlbmd0aCBHYXJuZXRzIGluIGpld2VscnksIExhcGlzIGluIHRoZSB3ZWFwb24uIEZ1bGwgcmVhc29uaW5nIGluIHRoZSBSZXRhbGlhdGlvbiBXYXJyaW9yIGd1aWRlLiJ9LCJieSI6IlphbmUifQ',
    body: `I built my Retaliation Warrior by starting with Attack Damage, saving the pieces that could carry over, and switching when the full Retaliation setup was ready. This guide is that route: AD Rogue or Warrior into an endgame Retaliation build.

## Start with Attack Damage

AD Rogue is a comfortable early farming route because of its gear-finding skills. AD Warrior also works if you want to stay on Warrior from the start. Use the [combined Attack Damage guide](#/guides/attack-damage) for the leveling setup.

Don't force Retaliation before the pieces come together. Keep progressing with the build that works now, and save the useful drops as you go.

## Save these for the pivot

- **Gear:** keep high-Defense bases, especially chest and helm, pieces with useful Reflecting or Armored drop bonuses, and good Strength or Retaliation rolls. My rough slot priority is chest > helm > gloves and boots > rings, belt and amulet > weapon and shield > Torch. A standout drop can change the order.
- **Runes:** save useful small runes with Retaliation or Strength secondaries, and keep the pieces needed for a runeword that suits the build. Don't break a working grid for a partial upgrade.
- **Pets:** save Strength and Retaliation options, and don't let a flat Strength pet fall behind while leveling the others.
- **Materials:** spend on upgrades that help your current progression. Hold rare materials when an upgrade is only a minor improvement to temporary gear.

## Build the pet team

My target is **1 % bonus Strength pet, 1 flat Strength pet, and 2 Retaliation pets**. Other combinations can work. A Defense pet can be worth using if you compound one that fits the levels of your other pets.

One of my biggest Season 2 mistakes was not leveling a flat Strength pet. I ended up with 3 Retaliation pets and 1 % Strength pet. Even above level 70, three Retaliation pets do not scale well enough for endgame. Keep the flat Strength option growing while you build the team; don't wait until the other pets are already far ahead.

## When to switch

Prepare the gear, pets and rune grid before changing your setup. Then compare both builds against the same kind of enemy at the same Monster Level:

1. Compare Retaliation per enemy attack with your AD damage per hit.
2. Check that the Retaliation setup survives and keeps a good kill pace.
3. Include the complete setup: gear, pets, runes, gems and skills.

Switch when the full Retaliation setup performs better for the content you want to do. Keep the AD setup intact until you know the pivot works.

## Endgame priorities

**Defense is the foundation.** Some special armor pieces trade Defense for other bonuses, so compare them with a high-Defense base in your own setup. Block-chance boots can help early; once your shield and skills cover the Block you need, higher-Defense base boots may add more Retaliation damage. Treat that as a comparison, not a fixed awakening breakpoint.

Use Reflecting or Armored pieces where they improve the goal. Frenzy is useful only while your setup keeps its kill speed; don't sacrifice one-shots just to raise Frenzy.

Keep a progression setup moving through Monster Levels and make a boss or farming setup when it has a clear purpose. Change one meaningful piece at a time, compare the result, then return to pushing when the detour is done.

Use the [Retaliation planner](#/tools/retaliation) to compare upgrades. Check current class-skill descriptions in the [Handbook](#/handbook/classes) before spending points.`
  }
];
export const featuredGuide = id => FEATURED_GUIDES.find(g => g.id === id) || null;
