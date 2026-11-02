// Arcana Handbook: seed content. Admins will edit pages in the site (Phase 2); this file is the
// starting set. Body syntax: "## Heading", "- list", "**bold**", "| table |", blank line between blocks,
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
  }
];
