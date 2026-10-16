/* ArcanaWiki Season 2 mechanics. Drafted against the verified game snapshot and
 * existing player-facing rules. Do not infer unrecorded numeric values.
 * New pages have stable taxonomy IDs and explicit, working connections. */
const action=(label,route,icon='book')=>({label,route,icon});
const section=(title,body,extras={})=>({title,body,...extras});
const art=(topic,iconPath,alt,caption)=>({
  images:[{id:topic,src:'/assets/icons/idlearc-refined/'+iconPath+'.svg',alt,caption}],
  artId:topic
});
function page({id,title,category,summary,keywords,sections,actions,connections,illustration,readTime='3 min'}){
 const images=illustration?.images||[];
 const content=sections.map((s,i)=>i===0&&illustration?{...s,imageId:illustration.artId}:s);
 return {id,title,category,summary,keywords,readTime,sections:content,actions,connections,images,source:'game-and-player-verified'};
}
export const WIKI_EXPANSION_ARTICLES=Object.freeze([
 page({
  id:'character-level',title:'Character Level & Monster Level',category:'Progression & Farming',
  summary:'Two progress bars serve different purposes. Know which one you are actually farming.',
  keywords:'character level exp gain monster level ML skill points progression XP farming',
  sections:[
   section('Two types of progress','Character Level and Monster Level are separate systems. Character experience raises your character level, while Monster Level experience advances the monster progression track. A strong farming setup may favor one without being the fastest way to advance the other.'),
   section('What EXP Gain affects','EXP Gain increases character experience. It does not multiply Monster Level experience. Putting EXP Gain on an item, rune or pet is therefore useful for character leveling, but it cannot be treated as an ML farming multiplier.'),
   section('Why Monster Level still matters','Monster Level unlocks progression milestones, including larger rune grids and access to higher-level drops. The rune grid changes at specific ML thresholds; a higher Character Level does not replace those requirements.'),
   section('How to choose a farming target','Decide which progression bar matters most right now. For ML, compare Monster Level XP earned per second rather than the reward from a single kill. For character levels, measure character XP over time with your actual EXP Gain bonuses. If you also need materials, include those needs in your route.')
  ],
  actions:[action('Compare ML farming speed','calculators/ml-farm','calculator'),action('Rune grid milestones','wiki/article?id=rune-grid')],
  connections:{articles:['monster-level','rune-grid','season-2'],collections:['monster','biome'],tools:['farm','monsterGuide']},
  illustration:art('level-art','features/feature-class-skills','Arcana class skills emblem','Character and monster progression unlock different systems.')
 }),
 page({
  id:'drop-bonus',title:'Drop Bonus',category:'Progression & Farming',
  summary:'Read item Drop Bonus modifiers without confusing them with rarity or every drop rate.',
  keywords:'drop bonus equipment affix stat range rarity item find lucky bonus implicit fierce scavenger',
  sections:[
   section('What a Drop Bonus is','A Drop Bonus is a named modifier on equipment that contributes a specific effect. Examples in the verified item data include attack damage, critical chance, pet damage, gold gain and item-drop-related modifiers. The modifier name matters: different bonuses affect different stats.'),
   section('Rarity and bonus range','The same named Drop Bonus has tier-dependent value ranges. A higher-tier item can support different ranges or a bonus that was not available on an earlier tier. The possible ranges are useful when comparing items, but a range is not a promise that every roll is equally likely.'),
   section('Drop Bonus is not one universal drop multiplier','Do not combine every effect containing the word “drop” into a single percentage. Item Drop Chance, Lucky tier chance, item quantity and other reward modifiers refer to different systems. Their exact stacking behavior should only be documented when confirmed by the current game configuration.'),
   section('How to compare two items','Choose the same equipment base, then set its tier and named bonus in the Item Codex to inspect the recorded range. For a practical comparison, look at your current farming or combat goal rather than assuming every bonus is universally useful.')
  ],
  actions:[action('Browse Item Codex','wiki/library?kind=item','shield'),action('Compare equipment','calculators/compare','compare')],
  connections:{articles:['drop-rarities','forge','monster-level'],collections:['item','item-affix'],tools:['items','compare']},
  illustration:art('bonus-art','equipment/equipment-ring','Arcana ring illustration','A named gear modifier should be checked against its actual effect and tier.')
 }),
 page({
  id:'dungeons',title:'Dungeons & Rewards',category:'Progression & Farming',
  summary:'Understand dungeon rewards and how Season 2 connects them to Monster Level progress.',
  keywords:'dungeon dungeon rewards vault den keys rubies eggs shards highest monster level season 2',
  sections:[
   section('What dungeons are for','Dungeons are a separate activity from ordinary monster farming. They provide a route to rewards such as rubies, pet eggs and shards. Compare their value to the resources you need instead of judging every activity solely by Monster Level XP.'),
   section('Highest Monster Level and rewards','In Season 2, the dungeon reward scaling for rubies, eggs and shards uses your highest reached Monster Level. This is distinct from choosing a low-HP monster for routine farming. Advancing your ML milestone can therefore improve future dungeon returns.'),
   section('Vault and Den payouts','The Season 2 update changed Vault and Den rewards so they pay out on each completed run. Check the game interface for the current entry requirements, reward preview and any run-specific limitations; this article does not invent a fixed payout table.'),
   section('Planning a dungeon run','Before entering, review the reward type you need and make sure your equipment, pets and skill setup can clear the activity reliably. If you use a different loadout for dungeons, save it separately from your usual farming build.')
  ],
  actions:[action('Read Monster Level farming','wiki/article?id=monster-level'),action('Inspect Build Studio','labs/build','flask')],
  connections:{articles:['monster-level','season-2','pet-compound'],collections:['biome','material'],tools:['build','monsterGuide']},
  illustration:art('dungeon-art','features/feature-guild-raid','Arcana group encounter emblem','Reward availability and exact values should always be checked in-game.')
 }),
 page({
  id:'equipment-basics',title:'Equipment & Slots',category:'Equipment',
  summary:'Know the actual gear positions, item restrictions and what changes when you swap items.',
  keywords:'equipment slots hands chest head boots belt rings necklace torch offhand weapon build studio',
  sections:[
   section('Equipment is slot-based','An item must fit a legal equipment position. Main-hand and off-hand items, armor, jewelry, belt and the separate Torch position each have their own requirements. Some weapons are two-handed, and some item bases have class restrictions. There are no extra “utility” equipment slots in IdleArc.'),
   section('The positions shown in Build Studio','The planner models the actual game equipment layout, including head, chest, hands, feet, main hand, off hand, belt, necklace, rings and Torch. Some visual positions repeat the same item type, such as rings. Use the exact slot selector instead of treating the artwork as a new item category.'),
   section('Item base versus slot upgrades','The equipped item provides its own named base and modifiers. Forge progression belongs to the equipment slot, so changing an item does not erase that slot’s existing upgrade progress. Reforging a copy of an item is a different system.'),
   section('Building a legal loadout','Choose your class and slot first, then select only equipment the game permits there. Compare the item effects and Drop Bonus values separately. In Arcana you can save a draft loadout and inspect upgrades without changing anything in IdleArc.')
  ],
  actions:[action('Open Build Studio','labs/build','flask'),action('Browse Item Codex','wiki/library?kind=item','shield')],
  connections:{articles:['forge','drop-rarities','gems','reforging'],collections:['item','item-affix'],tools:['build','items','compare']},
  illustration:art('slots-art','equipment/equipment-chest','Arcana chest armor illustration','Equipment slots and the specific items placed in them are different things.')
 }),
 page({
  id:'reforging',title:'Reforging',category:'Equipment',
  summary:'Combine matching items into higher rarity without confusing reforge with Forge upgrades.',
  keywords:'reforge three same name item rarity upgrade legendary ml gate forged equipment',
  sections:[
   section('The basic recipe','Reforging combines three copies of the same named item into a copy of the next rarity. The item identity matters, not just the equipment slot. Three unrelated weapons or three different chest items do not satisfy the matching-item rule.'),
   section('Rarity and Monster Level restrictions','The game can restrict which rarity is available at your current Monster Level. A preview that stops at a particular rarity does not automatically mean a permanent universal rarity cap. Check the current ML requirements before making that conclusion.'),
   section('Reforge versus Forge','Reforging changes the rarity of an item by consuming copies. The Forge advances the equipment slot through its own progression. You can switch the equipped base without wiping the slot upgrades, so plan these two investments separately.'),
   section('Before using duplicates','Verify the item names and the resulting preview in-game. Consider whether a duplicate is more valuable for a second loadout before consuming it. Arcana can help compare gear but does not perform an in-game reforge.')
  ],
  actions:[action('Compare equipment','calculators/compare','compare'),action('Read Forge progression','wiki/article?id=forge')],
  connections:{articles:['drop-rarities','forge','equipment-basics'],collections:['item'],tools:['items','compare']},
  illustration:art('reforge-art','features/feature-upgrade','Arcana equipment upgrade emblem','Reforging an item and upgrading its gear slot are separate actions.')
 }),
 page({
  id:'awakening',title:'Awakening',category:'Equipment',
  summary:'Learn what the A1–A30 gear progression means and how to plan its materials.',
  keywords:'awakening awakened A1 A30 slot forge item enhancement pity materials costs pathfinder',
  sections:[
   section('Awakening is a progression track','Awakened gear-slot progression is labeled A1 through A30. It should not be confused with the rarity of the individual base item or with combining duplicate items through Reforging.'),
   section('Costs depend on the step','Different upgrade steps require different resources. A useful calculator must distinguish an exact cost for one step from a projected total across several steps, and it must handle failed attempts or refunds only when the corresponding rates are verified.'),
   section('Check your start and target','Choose the equipment position and its awakened status, then inspect the individual steps between your current and target rank. Pathfinder also supports a start-to-finish view. Do not add non-awakened costs to an A1–A30 path unless you actually plan to traverse both stages.'),
   section('Avoid false precision','Any future balance update could change costs or success rules. Check the game’s latest upgrade preview before spending large amounts of material, and use Arcana’s known-data warnings rather than assuming every displayed projection is guaranteed.')
  ],
  actions:[action('Open Pathfinder upgrade planner','calculators/pathfinder','calculator'),action('Read Forge progression','wiki/article?id=forge')],
  connections:{articles:['forge','equipment-basics','reforging'],collections:['item','material'],tools:['upgrade','items']},
  illustration:art('awake-art','features/feature-upgrade','Arcana upgrade emblem','Plan one awakened step or a longer A-rank progression.')
 }),
 page({
  id:'talismans',title:'Talismans',category:'Equipment',
  summary:'Keep talisman choices linked to the loadout that actually uses them.',
  keywords:'talisman loadout preset slot gem build equipment bonuses',
  sections:[
   section('What to track','Talismans are part of a character’s equipment planning rather than a substitute for base items or gem sockets. Record the talisman choice beside the rest of a loadout, especially when keeping separate farming and raid presets.'),
   section('Presets and persistence','Season 2 gear-preset improvements remember equipped gem and talisman selections. Switching presets should restore the saved choices instead of requiring you to rebuild that combination by hand.'),
   section('Compare effects in context','A talisman can be worthwhile in one build and less valuable in another. Evaluate the actual in-game description alongside your gear, runes, pets and skills. The current verified public wiki data is not sufficient to claim a complete talisman drop table or a universal best choice.'),
   section('Plan without altering your character','Use Build Studio to record and share a proposed loadout. A saved Arcana plan is not an instruction sent to IdleArc; check the in-game equipment screen before making a real change.')
  ],
  actions:[action('Open Build Studio','labs/build','flask'),action('Equipment guide','wiki/article?id=equipment-basics')],
  connections:{articles:['equipment-basics','gems','season-2'],collections:['item'],tools:['build']},
  illustration:art('talisman-art','features/feature-build-studio','Arcana Build Studio emblem','Keep talismans associated with a specific saved build.')
 }),
 page({
  id:'attack-damage',title:'Attack Damage',category:'Combat & Stats',
  summary:'Separate flat attack increases, percentage bonuses and the other mechanics that modify a hit.',
  keywords:'attack damage flat attack damage percent crit boss damage formula strength stats',
  sections:[
   section('Start with the terms','Flat Attack Damage adds an amount; Increased Attack Damage changes damage by a percentage. They are different inputs and should not be described as interchangeable. The size of a displayed bonus alone is not enough to prove which item is stronger.'),
   section('Damage has multiple stages','The eventual result can depend on class skills, attributes, enemy defenses, critical hits, double-hit effects and other modifiers. A basic attack damage display is not automatically the same as damage to a particular monster or raid boss.'),
   section('Season 2 changed some priorities','Older claims that flat damage is useless should not be carried forward as universal Season 2 advice. A comparison should use current item values and the player’s actual setup rather than a Season 1 rule of thumb.'),
   section('Formula boundaries','This page intentionally avoids claiming a full multiplication order or armor-set interaction until the complete server-side calculation is verified. Use the Compare tool and test in-game results for the specific question you are trying to answer.')
  ],
  actions:[action('Compare two equipment choices','calculators/compare','compare'),action('Explore Build Studio','labs/build','flask')],
  connections:{articles:['critical-hits','retaliation','defense-blocking','drop-bonus'],collections:['item-affix','class-skill'],tools:['compare','build']},
  illustration:art('damage-art','equipment/equipment-weapon','Arcana weapon illustration','Flat bonuses and percentage bonuses are distinct stats.')
 }),
 page({
  id:'critical-hits',title:'Critical Hits',category:'Combat & Stats',
  summary:'Learn the difference between landing a critical hit and increasing its damage.',
  keywords:'crit critical chance critical damage double hit double damage attack',
  sections:[
   section('Chance versus damage','Critical Strike Chance affects how often eligible hits become critical. Critical Damage affects how hard those critical hits land. One stat does not replace the other, and their value depends on the damage source and build.'),
   section('Do not confuse other combat rolls','Double Hit Chance and Double Damage Chance are separately named mechanics in the verified data. They should not be collapsed into Critical Chance or Critical Damage, even when a build uses several of them together.'),
   section('Skills and equipment both contribute','Some class skills increase critical chance or critical damage, while equipment bonuses and runes can provide related stats. Examine the whole setup rather than assuming the value on one item represents your final chance.'),
   section('When critical stats are unhelpful','Not every build depends on ordinary attack criticals. Retaliation-focused and pet-focused approaches may value different inputs. This wiki does not claim that every critical stat applies identically to every damage source without verification.')
  ],
  actions:[action('Class Skill Tree','labs/skills','git'),action('Compare equipment','calculators/compare','compare')],
  connections:{articles:['attack-damage','retaliation','runes'],collections:['class-skill','item-affix'],tools:['skills','compare']},
  illustration:art('crit-art','features/feature-class-skills','Arcana class skill emblem','Check both critical chance and critical damage in your complete build.')
 }),
 page({
  id:'retaliation',title:'Retaliation',category:'Combat & Stats',
  summary:'Understand retaliation as a distinct combat approach, especially for defensive Warriors.',
  keywords:'retaliation warrior counterstrike block defense strength tank',
  sections:[
   section('What retaliation builds around','Retaliation is its own combat-focused stat and mechanic. It is not simply another label for ordinary attack damage. A defensive Warrior can center a loadout on retaliation effects, defense and block-related interactions.'),
   section('Relevant Warrior skill','The verified Warrior Might branch includes Counterstrike: blocked enemy swings retaliate for an additional 2% per skill level. Its wording ties the effect to blocked swings; do not assume every incoming attack activates it.'),
   section('Preparing the build','A retaliation setup can prioritize survival and triggering the relevant defensive events over the stats that improve a conventional damage build. Review defense, block chance and the current retaliation bonuses together.'),
   section('Do not copy ordinary DPS assumptions','Attack Damage, critical hits and pet effects should be assessed separately for this build type. Arcana’s planner is useful for sharing a proposed setup, but the exact full damage formula and every stat interaction still require verification.')
  ],
  actions:[action('View Warrior Class Skills','labs/skills','git'),action('Plan a retaliation build','labs/build','flask')],
  connections:{articles:['defense-blocking','attack-damage','critical-hits','season-2'],collections:['class-skill','item-affix'],tools:['skills','build']},
  illustration:art('retal-art','classes/class-warrior','Arcana Warrior class illustration','The Warrior class has skill paths that interact with defense and blocked attacks.')
 }),
 page({
  id:'defense-blocking',title:'Defense & Blocking',category:'Combat & Stats',
  summary:'Keep defense, block chance and damage reduction separate when building for survival.',
  keywords:'defense blocking block chance counterstrike dodge damage reduction health survival',
  sections:[
   section('Different defensive stats','Defense, maximum health, damage reduction, dodge chance and block chance are separately named effects. Their jobs overlap in helping a character survive, but they should not be represented as one interchangeable defensive percentage.'),
   section('Block chance can enable other effects','Some Warrior skills refer to blocked enemy swings. For example, Counterstrike in the Might branch adds retaliation when a swing is blocked. That does not mean increasing defense automatically raises block chance.'),
   section('Compare by the threat','A setup that survives ordinary farming may struggle with a different enemy or group encounter. Compare how reliably you survive the activity you are attempting, not just the largest defensive number on a tooltip.'),
   section('No invented damage equation','Without the complete, verified server-side defense and block calculation, this page does not promise an exact damage-prevented percentage. Use in-game outcomes to evaluate the practical difference when swapping gear or skills.')
  ],
  actions:[action('Open Build Studio','labs/build','flask'),action('Read Retaliation','wiki/article?id=retaliation')],
  connections:{articles:['retaliation','attack-damage','gems'],collections:['item-affix','class-skill'],tools:['build','skills']},
  illustration:art('def-art','equipment/equipment-offhand','Arcana offhand shield illustration','Block chance is distinct from defense and damage reduction.')
 }),
 page({
  id:'extra-kill',title:'Extra Kill',category:'Combat & Stats',
  summary:'Extra Kill can improve farming results, but it is not the same stat as attack speed.',
  keywords:'extra kill chance monster farming double kill bonus kill exp ml pet affix',
  sections:[
   section('The idea behind Extra Kill','Extra Kill Chance is a separately named gameplay effect in the verified configuration. Some sources describe a kill counting an additional time when it triggers. It should not be confused with a second normal attack animation or a guaranteed second physical enemy kill.'),
   section('Known sources','The verified pet-affix list includes Extra Kill Chance as a special affix capped at level 1. Warrior’s Bloodthirst skill also includes a chance for a kill to count twice, up to the rank limit described by that skill. Check the specific source before assuming two effects stack in a particular way.'),
   section('How it changes farming comparisons','Compare useful rewards per second, not only enemy health. A faster kill can remain better than a stronger enemy, but the current Extra Kill chance and the type of reward you want may change the comparison.'),
   section('What remains to verify','This article does not assert a universal cap, additive stacking rule, or that every reward category is doubled by every Extra Kill source. Those details need a current game-config or in-game confirmation.')
  ],
  actions:[action('Compare ML farming','calculators/ml-farm','calculator'),action('See Pet Affixes','wiki/library?kind=pet-affix','paw')],
  connections:{articles:['monster-level','pet-affix-costs','character-level'],collections:['pet-affix','class-skill','monster'],tools:['farm','affixes']},
  illustration:art('kill-art','features/feature-rune-forge','Arcana rune forge emblem','Use real reward rates when evaluating a farming mechanic.')
 }),
 page({
  id:'runes',title:'Runes & Runewords',category:'Runes & Skill Trees',
  summary:'Learn rune families, secondary stats and how a growing grid changes your options.',
  keywords:'runes runewords fury vitality precision fortitude wisdom fortune bond grid secondary',
  sections:[
   section('Rune families and their primary effect','Verified rune families include Fury (Attack Damage), Vitality (Max Health), Precision (Critical Strike Chance), Fortitude (Defense), Wisdom (EXP Gain), Fortune (Gold Gain) and Bond (Pet Damage). Their primary stats are not freely interchangeable.'),
   section('Secondary stats are a separate choice','A placed rune can have a secondary stat. The verified options include Attack Damage %, health, defense, critical stats, double-hit and double-damage chances, EXP, gold, pet damage, attributes and retaliation. Use the actual available options instead of inventing a new rune family for each secondary.'),
   section('Shape, placement and grid size','Runes occupy grid cells in different shapes, from small 1×1 pieces to larger shapes. Your board expands with Monster Level, so placement options improve over time. A rune layout for a larger grid is not proof that every new character has the same space.'),
   section('Runewords need a valid arrangement','Runewords are combinations formed under the game’s rune-system rules. Check a proposed setup in Rune Forge before sharing it. Names, exact layouts and effect values should come from the verified runeword list, not a visually plausible guess.')
  ],
  actions:[action('Open Rune Forge','labs/runes','gem'),action('See rune grid milestones','wiki/article?id=rune-grid')],
  connections:{articles:['rune-grid','passive-tree','season-2'],collections:['rune','runeword'],tools:['runes','build']},
  illustration:art('runes-art','features/feature-rune-forge','Arcana Rune Forge illustration','Rune placement and runewords depend on your available grid.')
 }),
 page({
  id:'passive-tree',title:'Passive Skill Tree',category:'Runes & Skill Trees',
  summary:'Follow the row, milestone and tier rules while planning a legal passive build.',
  keywords:'passive skill tree points rows tiers milestones 20 points unlock legal allocation',
  sections:[
   section('Passive points and class skills','The Passive Skill Tree and Class Skill Tree are separate systems. Passive planning should not be mistaken for spending a point in a class skill branch. Both can be inspected from Build Studio.'),
   section('Unlock each row in order','For normal legal allocation, put at least one point in the first row to unlock the second. Continue this rule down the rows. You cannot jump directly to a later row by leaving all earlier rows empty.'),
   section('Milestones and tiers','Only one milestone may be selected in a tier. To start spending points in the next tier, allocate a total of 20 points in the preceding tier first. Keep those restrictions in mind when copying or interpreting a screenshot of someone else’s plan.'),
   section('Planning mode versus game legality','Arcana can show all tiers even before they are unlocked and offers an optional unrestricted planning mode for experimentation. That mode is for sketches and sharing ideas, not a claim that IdleArc allows those point allocations in-game.')
  ],
  actions:[action('Open Passive Tree','labs/passives','layers'),action('Open Build Studio','labs/build','flask')],
  connections:{articles:['season-2','runes','character-level'],collections:['passive','class-skill'],tools:['passives','build','skills']},
  illustration:art('passive-art','features/feature-passive-tree','Arcana Passive Tree illustration','Plan legal row unlocks or deliberately switch to experimentation mode.')
 }),
 page({
  id:'guild-boss',title:'Guild Boss',category:'Guilds & Raids',
  summary:'Understand daily guild boss participation and why it matters to guild progression.',
  keywords:'guild boss boss kill guildstone daily contribution guild tree party guilds',
  sections:[
   section('What the Guild Boss contributes','Guild Boss participation contributes to guild progression. In the current guild rules used by players, a completed guild boss kill contributes one Guildstone to the guild. This is a different resource from the gold or rubies members may donate.'),
   section('Daily participation','A guild may set its own minimum daily boss kills. Such member requirements are guild policy, not a universal game mechanic. Check your guild announcement for the actual target and any exceptions.'),
   section('Progression and coordinated effort','Repeated boss participation helps the guild invest in its skill tree alongside other contributions. Leaders can use the Guild Skill Tree planner to compare future allocations without spending points in-game.'),
   section('Check the current boss screen','Do not rely on a fixed spawn schedule, strike timer or reward amount from an outdated guide. In-game boss availability and raid rules can change between patches. Use the current boss interface when deciding when to participate.')
  ],
  actions:[action('Open Guild Skill Tree Planner','labs/guild-tree','shield'),action('Read Rift Raid basics','wiki/article?id=rift-raids')],
  connections:{articles:['guild-planning','rift-raids','season-2'],collections:['class-skill'],tools:['guildtree','guilds','raids']},
  illustration:art('boss-art','features/feature-guild-raid','Arcana guild encounter illustration','Guild requirements may be stricter than the underlying game rules.')
 })
]);
