// Owner-directed refreshes for the private Season 3 Test workspace.
// The original draft text remains in guidebook-seed.mjs as an intact source copy.
export const SEED_UPDATES = {
  'choose-class': {
    title: 'Choosing a Class',
    answer: 'Pick a class and damage direction you can enjoy now; you can change course as your gear and drops develop.',
    body: `Your class gives you a different set of skills. Your stance points your damage in a direction. Neither decision has to solve your whole season on day one.

## The quick recommendation

If you want a practical starting route, I recommend **Attack Damage Rogue**. Rogue is a strong early farming choice, and the same broad Attack Damage direction can also work on Mage and Warrior. The full setup belongs in one separate [Attack Damage Player Guide](#/guidebook/rogue-explore), so this page can stay focused on choosing.

## Choose by what sounds fun

- **Warrior:** close-range combat, with Attack Damage or Retaliation as distinct paths.
- **Rogue:** fast attacks and flexible farming; a natural starting point for the combined Attack Damage guide.
- **Archer:** ranged attacks, marks and pet options.
- **Mage:** spell-focused skills and several ways to build around direct damage.
- **Druid:** a pet-centered identity with room to experiment.

These are starting impressions, not complete builds or promises about the strongest class. The Handbook explains the current class skills; individual Player Guides show how their authors put a build together.

## Switching later is manageable

You do not have to predict your final build before you have seen your drops. Useful gear, pets and runes can often support more than one direction, so a pivot usually means adjusting your setup rather than starting your whole character over. Passive-tree points can be refunded freely; class-skill refunds follow their own rules, so check the [Handbook's class and skill references](#/handbook/classes) before spending.

Keep promising drops while you're still learning what your next build might need. Once you know which direction you're committing to, you can be more selective.

## Follow a player's build

Want a step-by-step setup instead of a broad overview? Browse the separate, credited [Player Guides](#/guidebook/chapter/player-guides). Start with the combined Attack Damage guide for Rogue, Mage and Warrior, or choose a different guide when one is available. The Harmony overview is separate from the contributor-written Harmony Rogue build.`
  },
  'rogue-explore': {
    title: 'Attack Damage: Rogue, Mage and Warrior',
    answer: 'One flexible Attack Damage route for three classes, with Rogue as the recommended starting point.',
    body: `This is one guide for Attack Damage Rogue, Mage and Warrior. They share the same broad gear, pet and rune direction; their class skills are what make each version feel different. I recommend starting with Rogue if you want to farm efficiently, then let your drops and interests shape what comes next.

This is player strategy drawn from earlier seasons, not a guarantee about Season 3. Check the Handbook for current skill descriptions and the Fandom wiki for reference details.

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

This guide intentionally stays with Attack Damage Rogue, Mage and Warrior. Retaliation Warrior has its own separate guide. Harmony is a different damage direction, and the Harmony Rogue guide is being written separately by its contributor. Archer and Druid also have their own reserved guide pages; their authors' advice will live there rather than being folded into this one.

## Keep Monster Level moving

If your regular target is still dying in one hit, keep pushing Monster Level. Farm or upgrade when the change is likely to restore your kill speed or unlock a meaningful next step, then return to pushing. Frenzy is useful for loot, but its extra kills do not give Monster Level XP.

## Let the drops shape the route

Choose a direction, then stay open to better options. A useful pet, rune or piece of gear can make another class or build more attractive. Keeping those options early makes a later pivot much easier than trying to rebuild after discarding everything that did not fit your first plan.`
  }
};

export const NEW_SEED_PAGES = [
  {
    id: 'harmony-overview',
    title: 'Harmony: The General Build Direction',
    chapter: 'classes',
    answer: 'Harmony rewards a build that meaningfully uses both Attack Damage and Pet Damage.',
    body: `Harmony is a general build direction, not another name for the Harmony Rogue guide. It boosts Attack Damage and Pet Damage together, and its bonus grows with Monster Level. The Handbook's [Stances page](#/handbook/stances) has the current mechanics.

## What Harmony asks of a build

Harmony is most useful when both your attacks and your pets contribute meaningful damage. If nearly all of your damage comes from only one source, compare the focused Aggressive or Beastmaster stance instead. The best choice depends on your actual build and damage split.

That gives you room to explore different classes. Rogue, Mage and Archer can each approach Harmony differently; a contributor's Harmony Rogue Player Guide will cover one specific setup without standing in for the whole build type.

## Before you commit

- Keep an eye out for gear, pets and runes that support either side of your damage.
- Test the result after changing your stance or equipment; don't assume the label alone makes a setup stronger.
- If your current build is still one-shotting, keep pushing Monster Level and save a larger rebuild for when it has a clear purpose.

This page is the general strategy overview. The [separate Player Guides](#/guidebook/chapter/player-guides) contain individual player builds and keep their authors' advice and credit intact.`,
    author: 'Zane',
    status: 'review',
    trust: 'config',
    version: 'Season 3 review draft',
    order: 25,
    related: ['choose-class', 'rogue-explore', 'gear', 'pets', 'runes'],
    icon: 'harmony'
  }
];
