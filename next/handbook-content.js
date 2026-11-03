// Arcana Handbook: seed content. Admins will edit pages in the site (Phase 2); this file is the
// starting set. Body syntax: "## Heading", "### Subheading", "- list", "1. steps", "**bold**", "| table |" (first line "Table: caption" folds it), "> note",
// [words](#/route or https://…) plain links, blank line between blocks,
// [[page-id]] or [[page-id|words]] for a linked topic (tap = preview popup), [[list:kind|words]] for a Codex list.
// trust: verified | config (read from the dated game config) | estimated | legacy

export const HANDBOOK_VERSION = '1.3.13';

export const CHAPTERS = [
  { id: 'start', n: 1, title: 'Getting started', ask: 'What is IdleArc and what should I do first?', icon: 'home' },
  { id: 'classes', n: 2, title: 'Classes and build types', ask: 'Which class, and how does each one play?', icon: 'class-warrior' },
  { id: 'combat', n: 3, title: 'Combat and stats', ask: 'What does each stat actually do?', icon: 'attack', lists: ['affix', 'drop-bonus'] },
  { id: 'gear', n: 4, title: 'Gear', ask: 'How does equipment work?', icon: 'builds', lists: ['item', 'talisman', 'gem'] },
  { id: 'upgrading', n: 5, title: 'Upgrading gear and the forge', ask: 'How do I take gear from A1 to A30?', icon: 'upgrade', lists: ['material'] },
  { id: 'runes', n: 6, title: 'Runes', ask: 'How do runes and rune words work?', icon: 'rarity', lists: ['rune', 'rune-word'] },
  { id: 'pets', n: 7, title: 'Pets', ask: 'How do pets work?', icon: 'pet', lists: ['pet-bonus'] },
  { id: 'progression', n: 8, title: 'Progression', ask: 'How do I level faster?', icon: 'xp', lists: ['skill'] },
  { id: 'biomes', n: 9, title: 'Biomes', ask: 'Where do I farm what?', icon: 'map', lists: ['biome', 'monster'] },
  { id: 'online', n: 10, title: 'Guilds and online', ask: 'How do guilds and multiplayer work?', icon: 'guild' },
  { id: 'activities', n: 11, title: 'Quests and activities', ask: 'How do quests, raids, dungeons and boss fights work?', icon: 'records' },
  { id: 'seasons', n: 12, title: 'Seasons and events', ask: 'What is happening right now?', icon: 'event', lists: ['mechanic'] }
];

const SKILLS = {
  warrior: [['Might', 'Culling strike, Battle Recovery, Executioner, Iron Constitution, Bloodthirst, Counterstrike'], ['Strength', "Mighty strikes, Crushing Blows, Overwhelm, Battle Focus, Titan's Grip, Titanic Blow"], ['Finesse', 'Berserk, Keen Edge, Lethal Blow, Spoils of War, Deflection, Relentless Assault']],
  archer: [['Marksmanship', 'Archery, Precision, Headshot, Steady Aim, Double Nock, Perfect Shot'], ['Hunting', "Spike trap, Venomous Trap, Hunter's Mark, Barbed Arrows, Trap Mastery, Hunter's Instinct"], ['Beastmaster', 'Strong pet bound, Beast Bond, Pack Leader, Egg Hunter, Foraging Companion, Alpha Strike']],
  mage: [['Arcane', 'Magic blast, Arcane Surge, Spell Mastery, Arcane Siphon, Unstable Energy, Arcane Cascade'], ['Destruction', 'Fire infusion, Burning Soul, Inferno, Combustion, Melting Point, Pyroclasm'], ['Chaos', "Wild magic, Chaos Bolt, Reality Warp, Fortune's Favor, Soul Harvest, Chaos Incarnate"]],
  rogue: [['Assassin', 'Precision Strikes, Sharpened Blades, First Strike, Contract Killer, Deadly Ambush, Coup de Grace'], ['Shadowwalker', 'Swift Blades, Umbral Blades, Shadow Echo, Phantom Strike, Echo Mastery, Umbral Cascade'], ['Thief', 'Scavenger, Pickpocket, Lucky Hands, Treasure Hunter, Black Market, Master Thief']],
  druid: [['Lodge', 'Gnaw, Dam Builder, Tail Slap, Lodgekeeper, Thick Pelt, Timberfall'], ['Tunnels', 'Digger, Keen Snout, Hoard, Earthbind, Undermine, Deep Roots'], ['Symbiosis', 'Kinship, Shared Instinct, Feral Bond, Twin Heart, Wild Attunement, One Soul']]
};
const tree = k => '| Branch | Skills |\n| --- | --- |\n' + SKILLS[k].map(([b, s]) => '| ' + b + ' | ' + s + ' |').join('\n');
const classPage = (id, name, says, extra) => ({
  id: 'class-' + id, chapter: 'classes', title: name, trust: 'config', icon: 'class-' + id, cls: id,
  answer: 'In game: "' + says + '"',
  body: '## Skill tree\n\nThe ' + name + ' tree has three branches. Each branch unlocks in three tiers: tier 2 needs 5 points spent in that branch, tier 3 needs 10.\n\n' + tree(id) +
    '\n\nPlan points in [[tool:studio|Build Studio]], which follows the same unlock rules.' + (extra ? '\n\n' + extra : '') +
    '\n\n## Build types\n\nAny class can use any of the four [[build-types|build types]]. Pick the one your gear and skills support.',
  next: null
});

export const PAGES = [
  {
    id: 'what-is-idlearc', chapter: 'start', title: 'What IdleArc is', trust: 'config', icon: 'home',
    answer: 'IdleArc is an idle RPG: your character fights on its own, and you decide the gear, skills, runes and pets that make it stronger.',
    body: 'Most of the game is choosing. Your hero keeps fighting monsters in the current [[chapter:biomes|biome]] while you upgrade what it fights with.\n\n## What you build up\n\n- A **class** and its skill tree. See [[classes-overview|Classes]].\n- **Gear** in every slot, upgraded through ranks and awakening. See [[chapter:upgrading|Upgrading gear]].\n- **Runes** on a grid, which can form rune words. See [[chapter:runes|Runes]].\n- **Pets** that add bonuses. See [[chapter:pets|Pets]].\n- **Monster Level**, which rises as you kill monsters and unlocks more of the game. See [[chapter:progression|Progression]].',
    next: 'first-steps'
  },
  {
    id: 'first-steps', chapter: 'start', title: 'Your first steps', trust: 'config', icon: 'xp',
    answer: 'The in-game tutorial walks you through eight steps, in this order.',
    body: '1. **Combat basics.** Watch how your hero fights on its own.\n2. **First kill.** Defeat your first monster.\n3. **Equip an item.** Put on gear you have found. See [[chapter:gear|Gear]].\n4. **Allocate a skill.** Spend your first point in your class tree. See [[classes-overview|Classes]].\n5. **First dungeon.** Run your first dungeon. See [[chapter:activities|Quests and activities]].\n6. **Hatch a pet.** Your first pet adds a bonus. See [[chapter:pets|Pets]].\n7. **Upgrade an item.** Spend materials to raise an item. See [[chapter:upgrading|Upgrading gear]].\n8. **Biome progress.** Push forward into new biomes. See [[chapter:biomes|Biomes]].\n\nAfter the tutorial, the next thing to understand is your [[classes-overview|class]].',
    next: 'classes-overview'
  },
  {
    id: 'classes-overview', chapter: 'classes', title: 'The five classes', trust: 'config', icon: 'class-warrior',
    answer: 'There are five classes: Warrior, Archer, Mage, Rogue and Druid. Each has its own three-branch skill tree.',
    body: '| Class | In game |\n| --- | --- |\n| [[class-warrior|Warrior]] | Masters of melee combat with shields |\n| [[class-archer|Archer]] | Ranged fighters with pet mastery |\n| [[class-mage|Mage]] | Wielders of arcane magic |\n| [[class-rogue|Rogue]] | A dual-wielding assassin who strikes fast with twin daggers |\n| [[class-druid|Druid]] | A wild guardian who channels their strength into a mighty pet companion |\n\n## How skill trees work\n\nEvery class tree has three branches with six skills each. Within a branch, tier 2 unlocks after 5 points in that branch and tier 3 after 10. Class points come from levels, up to 100 points.\n\nOn top of your class, you choose a [[build-types|build type]] through your stance.',
    next: 'build-types'
  },
  classPage('warrior', 'Warrior', 'Masters of melee combat with shields'),
  classPage('archer', 'Archer', 'Ranged fighters with pet mastery'),
  classPage('mage', 'Mage', 'Wielders of arcane magic'),
  classPage('rogue', 'Rogue', 'A dual-wielding assassin who strikes fast with twin daggers'),
  classPage('druid', 'Druid', 'A wild guardian who channels their strength into a mighty pet companion'),
  {
    id: 'build-types', chapter: 'classes', title: 'Build types', trust: 'config', icon: 'harmony',
    answer: 'Your stance sets your build type. There are four.',
    body: '| Build type | Stance | What it does |\n| --- | --- | --- |\n| Harmony | Harmony | The default. A balanced bonus that grows with Monster Level. |\n| Attack Damage | Aggressive | +25% attack damage |\n| Pet Damage | Beastmaster | +25% pet damage |\n| Retaliation | Bulwark | +25% retaliation and 15% base reflect. Turns off dodge. |\n\n## Choosing one\n\nMatch the build type to what your gear, skills and pets add the most of. Community builds in [[tool:builds|Builds]] show each one in use.',
    next: null
  },  {
    id: 'two-levels', chapter: 'progression', title: 'Character level and Monster Level', trust: 'config', icon: 'xp',
    answer: 'You have two levels. Character level gives you skill points; Monster Level opens up the world.',
    body: '| | Character level | Monster Level |\n| --- | --- | --- |\n| Grows from | EXP | Monster Level XP from kills |\n| Gives you | Class points and passive points | New biomes, dungeons, a bigger rune grid, harder daily missions |\n| Boosted by EXP Gain | Yes | No |\n\n## Points from character level\n\n- **Passive points:** one per character level. Spend them in the [[passive-tree|passive tree]].\n- **Class points:** one at level 1, then one more every 3 levels, up to 100. Spend them in your [[classes-overview|class tree]].\n\n## Why Monster Level matters more over time\n\nMonster Level decides where you can farm and what you can run. See [[ml-unlocks|what each Monster Level unlocks]] and how to [[monster-level|raise it efficiently]].',
    next: 'monster-level'
  },
  {
    id: 'monster-level', chapter: 'progression', title: 'Raising Monster Level', trust: 'config', icon: 'xp',
    answer: 'Monster Level rises with Monster Level XP per second, so kill speed matters as much as XP per kill.',
    body: '## What counts\n\n- Only normal kills award Monster Level XP. **Frenzy kills award none.**\n- **EXP Gain does not multiply Monster Level XP.** It only speeds up character level.\n\n## Picking a monster\n\nFrom Murky Depths onward, the weakest monster in a biome gives 10% less Monster Level XP than the biome normal, and the strongest gives 10% more. So the lowest-health monster is not always the best farm.\n\nCompare monsters by XP per second: a weaker monster can still win if it dies fast enough.\n\n[[tool:mlxp|ML XP planner]] shows the XP, kills and time to your next levels.',
    next: 'ml-unlocks'
  },
  {
    id: 'ml-unlocks', chapter: 'progression', title: 'What Monster Level unlocks', trust: 'config', icon: 'map',
    answer: 'Biomes, dungeons, rune grid space and daily mission tiers all open at set Monster Levels.',
    body: '## Biomes\n\n| Monster Level | Biome | Tier |\n| --- | --- | --- |\n| Start | Verdant Woods | 1 |\n| 10 | Scorched Sands | 1 |\n| 30 | Murky Depths | 2 |\n| 30 | The Elemental Conflux | 3 |\n| 45 | Frozen Peaks | 3 |\n| 65 | Shadow Realm | 4 |\n| 90 | Infernal Pits | 5 |\n| 115 | Elderwood | 6 |\n| 150 | Glasslands | 7 |\n| 185 | Drowned Abyss | 8 |\n| 220 | Shattered Summit | 9 |\n| 260 | Umbral Rift | 10 |\n| 300 | Oblivion\'s Crown | 11 |\n| 350 | The Convergence | 12 |\n\n## Rune grid\n\nThe [[chapter:runes|rune grid]] grows on its own as Monster Level rises.\n\n| Monster Level | Grid |\n| --- | --- |\n| Start | 2 × 2 |\n| 10 | 3 × 3 |\n| 30 | 4 × 3 |\n| 45 | 5 × 3 |\n| 65 | 6 × 3 |\n| 90 | 6 × 4 |\n| 150 | 6 × 5 |\n| 220 | 6 × 6 |\n| 300 | 6 × 7 |\n\n## Dungeons and daily missions\n\n| Monster Level | Unlocks |\n| --- | --- |\n| 1 | Crypt dungeon, easy daily missions |\n| 10 | Tower |\n| 12 | Hoard dungeon |\n| 15 | Den dungeon |\n| 18 | Vault dungeon |\n| 25 | Mine dungeon |\n| 50 | Medium daily missions |\n| 100 | Hard daily missions |',
    next: 'elemental-mastery'
  },
  {
    id: 'elemental-mastery', chapter: 'progression', title: 'Elemental Mastery', trust: 'config', icon: 'skills',
    answer: 'Mastery is earned in The Elemental Conflux, which opens at Monster Level 30. Each of the six elements has its own Mastery, up to level 10.',
    body: '## Where it comes from\n\n**Player report:** The Elemental Conflux is a biome full of extra strong monsters that count as bosses, so setups with added boss damage can do well there.\n\n## In the game data\n\n- Elements: Fire, Water, Air, Earth, Poison and Nature.\n- Each element goes up to Mastery level 10.\n- Time in the zone is limited to 1 hour per day.\n- The zone gives up to 100 shards per day.\n- The zone has an XP multiplier of 2.\n\n## Cost per level\n\n| Level | Cost | Total |\n| --- | --- | --- |\n| 1 | 10 | 10 |\n| 2 | 35 | 45 |\n| 3 | 55 | 100 |\n| 4 | 80 | 180 |\n| 5 | 110 | 290 |\n| 6 | 150 | 440 |\n| 7 | 200 | 640 |\n| 8 | 260 | 900 |\n| 9 | 330 | 1,230 |\n| 10 | 420 | 1,650 |\n\nThe game data does not name the unit. It is most likely shards, since the zone caps shards per day, but that is not confirmed.\n\n**Estimate:** if the cost is in shards, taking one element to level 10 takes at least 17 days at the daily cap.\n\n## Not covered yet\n\nWhat each Mastery level gives is not in the game data this page uses.',
    next: 'arcstone-ascent'
  },
  {
    id: 'arcstone-ascent', chapter: 'progression', title: 'Ascent', trust: 'config', icon: 'records',
    answer: 'Ascent is a global boost the whole community fuels with Ascent points. Each tier raises gold, XP and drop rates for everyone.',
    body: '## Earning points\n\n**Player report:**\n\n- Convert Arcstone into Ascent points.\n- Buying Arcstone also earns Ascent points: 1 for each Arcstone you buy.\n- Auto donate can be set to give just 10 points, which completes the daily quest.\n\nThe game data lists points per Arcstone pack that work out to less than 1 per Arcstone (for example 20 points for the 100 Arcstone pack). This does not match the player report and is not confirmed either way.\n\n## Tiers\n\nThe game data has 40 tiers. Bonuses add up as the community reaches each one. Selected tiers:\n\n| Tier | Points | Gold and XP | Materials | Runes | Items | Pet eggs | Gems | Rubies | Pet XP |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 240 | +1% | – | – | – | – | – | – | – |\n| 5 | 1,920 | +3% | +1% | – | – | – | – | – | – |\n| 10 | 6,960 | +5% | +5% | +6% | – | – | – | – | – |\n| 15 | 17,640 | +8% | +10% | +11% | +1% | – | – | – | – |\n| 20 | 31,920 | +10% | +14% | +18% | +5% | +1% | +1% | – | – |\n| 25 | 49,680 | +13% | +18% | +25% | +9% | +5% | +5% | +1% | – |\n| 30 | 72,000 | +15% | +22% | +33% | +13% | +8% | +8% | +4% | +2% |\n| 35 | 96,000 | +18% | +26% | +41% | +17% | +12% | +12% | +7% | +9% |\n| 40 | 120,000 | +20% | +30% | +50% | +20% | +15% | +15% | +10% | +15% |\n\n## Timing\n\nThe game data lists a daily reset at 00:10 UTC and 100% carryover. How carryover works is not confirmed.',
    next: 'passive-tree'
  },
  {
    id: 'passive-tree', chapter: 'progression', title: 'The passive tree', trust: 'config', icon: 'skills',
    answer: 'The passive tree has 20 tiers of 10 rows. You open each new tier by spending 20 points in the tier before it.',
    body: '## How points work\n\n- You get one passive point per character level.\n- Each node raises one stat a little per point, up to its maximum.\n- Within a tier, a row opens once you have a point in the row above it.\n- Some rows are milestones: you pick one node from them.\n\n## Planning\n\nThe tree is long, so plan the tiers you are aiming for before spending. [[tool:studio|Build Studio]] has the full tree with the same rules, so you can try a layout first.',
    next: null
  }
];
