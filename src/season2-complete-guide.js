// Arcana Season 2 guide: review draft, not yet approved for production.
export const SEASON2_COMPLETE_GUIDE=Object.freeze({
  "id": "season-2-complete-zane",
  "title": "IdleArc Season 2: The Complete Guide",
  "category": "Progression & Farming",
  "readTime": "35–45 min",
  "author": "Zane",
  "source": "player-authored",
  "summary": "Practical progression steps first, with optional deep dives on Monster Level, gear, pets, Runes and endgame.",
  "keywords": "season 2 complete zane beginners progression ml one shot harmony mage strength intelligence warrior retaliation double damage radiant raeik forge raid pet convergence",
  "version": "Season 2 · revised October 28, 2026",
  "sections": [
    {
      "part": "Getting started",
      "title": "Introduction",
      "body": "IdleArc has a lot of systems. You don't need to understand all of them before you can start making good progress.\n\nIf you just want to know what to do next, use the Practical quick start. It gives you a short set of priorities, milestones and mistakes to avoid. You can come back to the explanations whenever something actually matters for your character.\n\nThe rest of this guide is the deeper reference: how Monster Level, damage, equipment, pets, runes and later activities fit together. It isn't homework, and you don't have to read every chapter in order.\n\nMy approach is to keep improving kill speed, push Monster Level, and take short detours to farm what I need for the next upgrade. Your class and the items you find will change the details."
    },
    {
      "part": "Getting started",
      "title": "Choosing your class",
      "body": "IdleArc has five classes, each with three Class Skill branches.\n\n- Warrior: Heavy melee attacks, shields, Defense, Block and Retaliation.\n- Rogue: Fast attacks, critical damage, Double Hit, dual-wielding and useful farming skills.\n- Archer: Ranged attacks, traps, critical scaling and pet-focused options through Beastmaster.\n- Mage: Spell-based attacks and strong offensive multipliers. Something worth knowing is that Attack Mages benefit from BOTH Strength and Intelligence, much like Attack Rogues. Don't automatically stack nothing but INT just because that's how Mages work in other games.\n- Druid: Several ways to combine offense, defense and pet bonuses, including builds where your pet does much of the damage.\n\nHarmony is another option, mainly worth considering for Rogue and Archer Attack builds. Mage can also explore Harmony in the right setup, but I wouldn't present it as the standard Mage path. Don't pick Harmony just because a guide mentions it: compare what it gives your actual build against the alternatives.\n\nMy advice is to pick the class you're interested in and let RNG influence the early build. Maybe you thought you were going one direction, then an amazing Radiant weapon drops for something else. That can be a perfectly good reason to switch things up. A great item you actually have is often more useful than the ideal item you're still hoping to find."
    },
    {
      "part": "Getting started",
      "title": "Character Level, Monster Level and Fighting Level",
      "body": "These are different things, and confusing them causes a lot of bad decisions.\n\nCharacter Level gives skill points. You get a Passive Skill Point as you level, begin with a Class Skill Point at level 1 and gain another Class Skill Point every three levels. EXP Gain affects Character EXP, not Monster Level.\n\nMonster Level (ML) determines world progression: new biomes, better equipment drops, Gem sockets, Rune Grid space and major unlocks. Raising ML should ALWAYS be in the back of your mind.\n\nFighting Level determines which monster level you're currently fighting. You can lower it from your highest unlocked ML within the game's limit of 30 levels.\n\nI don't recommend sitting at a low level forever or pausing ML as a normal strategy. Keep pushing forward. But if your damage stops keeping up, temporarily lower your Fighting Level to one-shot monsters that drop the materials you need. Upgrade your gear, then get back to pushing ML.\n\nThat's the idea: lower the difficulty when it helps you move forward, not as an end goal."
    },
    {
      "part": "Getting started",
      "title": "Every important ML milestone",
      "body": "This is the progression checklist. The early rarity thresholds indicate when a drop becomes possible, not when it's guaranteed.\n\nThe Torch is a big milestone at ML 50. Every class has a dedicated Torch slot, separate from its usual off-hand equipment. It provides All Class Skills (ACS), and the game can automatically equip it when the slot is empty.\n\nSome things use Character Level instead. The Tower and Rift Raids require Character Level 10, and raids also require your account to be at least 24 hours old. Guild Skill Tree Ascension starts after Guild Level 68.",
      "table": [
        [
          "ML",
          "Unlock"
        ],
        [
          "1",
          "Verdant Woods · Crypt Dungeon · Rune Grid 2×2"
        ],
        [
          "10",
          "Scorched Sands · Rune Grid 3×3 · early Uncommon drops"
        ],
        [
          "12",
          "Gold Hoard Dungeon"
        ],
        [
          "15",
          "Den Dungeon"
        ],
        [
          "18",
          "Vault Dungeon"
        ],
        [
          "20",
          "Gem drops begin · first Gem socket"
        ],
        [
          "25",
          "Mine Dungeon · main Uncommon drops"
        ],
        [
          "30",
          "Murky Depths · Elemental Conflux · Rune Grid 4×3"
        ],
        [
          "45",
          "Frozen Peaks · early Rare drops · Rune Grid 5×3"
        ],
        [
          "50",
          "Torch · Medium Daily Missions"
        ],
        [
          "60",
          "Runic Cores begin dropping"
        ],
        [
          "65",
          "Shadow Realm · main Rare drops · second socket · Rune Grid 6×3"
        ],
        [
          "90",
          "Infernal Pits · early Epic drops · Conflux rare-material farming becomes relevant · Rune Grid 6×4"
        ],
        [
          "100",
          "Hard Daily Missions"
        ],
        [
          "115",
          "Elderwood · main Epic drops · third socket"
        ],
        [
          "150",
          "Glasslands · early Legendary drops · Rune Grid 6×5"
        ],
        [
          "160",
          "Fourth Gem socket · Flawless Gems"
        ],
        [
          "185",
          "Drowned Abyss · main Legendary drops"
        ],
        [
          "220",
          "Shattered Summit · Rune Grid 6×6"
        ],
        [
          "260",
          "Umbral Rift · Infernal equipment drops"
        ],
        [
          "300",
          "Oblivion's Crown · Rune Grid 6×7"
        ],
        [
          "350",
          "Convergence"
        ]
      ]
    },
    {
      "part": "Builds and combat",
      "title": "Class Skills and the Passive Tree",
      "body": "Every class has three Class Skill branches. The Passive Tree is shared across classes.\n\nTry to figure out which skills are actually helping your build. If most of your damage comes from your pet, a bonus that only strengthens direct attacks might not be the best investment. The reverse is true for Attack builds.\n\nPassive points can be refunded for free, so test combinations. Class Skill refunds have different rules and may cost Arcstone.\n\nAll Class Skills (ACS) increases the ranks of skills you've learned. Your Torch, the Sage Diadem and ACS evolved affixes on pets are three of the most important sources to look for. ACS can push learned skills beyond their normal rank caps, although particular effects may still have their own limits.\n\nAn ACS evolved pet affix is NOT the same thing as a Legendary pet's ACS Hatch Bonus. The hatch bonus belongs to the pet's main stat and now has a special use in Compounding. I'll explain how to avoid wasting Pet Shards on those pets in the pet chapter.\n\nDon't try to perfect your entire tree at level one. Build around what you've got, then refine it as your equipment and skill points improve."
    },
    {
      "part": "Builds and combat",
      "title": "Understanding Attack, Pet and Retaliation",
      "body": "Attack Damage starts with your weapon and relevant equipment damage, then adds the bonuses and multipliers from your class skills, stats, gear and other systems. An Attack Mage, like an Attack Rogue, has reasons to build both Strength and Intelligence.\n\nPet Damage starts with the active attacking pet's base damage and progression, plus relevant bonuses from your character. Certain effects can convert Attack Damage into the Pet calculation. Check the actual Pet Damage breakdown rather than assuming any single stat behaves identically in all three damage modes.\n\nRetaliation triggers when an enemy attacks you. It scales with Defense and Retaliation-related effects. Blocked attacks produce 50% stronger Retaliation damage.\n\nCritical Chance, Critical Damage, Double Hit and Double Damage can all contribute to Retaliation. So a good Retaliation setup is about more than just piling up Defense.\n\nUse the Damage Calculator with values from your own character if you want to compare changes. Some exact in-game rounding details remain uncertain, so don't treat an estimated result as perfect server precision."
    },
    {
      "part": "Builds and combat",
      "title": "Critical Chance, Double Hit and Double Damage",
      "body": "Critical Chance determines how often you crit, while Critical Damage determines how much the crit adds. Critical Chance above 100% isn't automatically wasted because excess chance can contribute to Critical Damage.\n\nDouble Hit can add more hits. Each full 100% guarantees another, while the remaining fraction gives a chance for an additional hit. It matters more when the enemy survives long enough for those hits to happen.\n\nDouble Damage adds another damage mechanic and isn't limited to direct Attack builds. Retaliation benefits too.\n\nA common mistake is stacking whichever number on the character sheet looks impressive. If you've already got a massive bonus in one layer, strengthening another multiplier might provide a bigger actual improvement. Test the result rather than guessing."
    },
    {
      "part": "Builds and combat",
      "title": "Surviving harder fights",
      "body": "For most early farming builds, dealing enough damage to kill quickly matters more than stacking Defense. If the monsters barely get an attack in, piling up defensive stats usually doesn't help your farming speed.\n\nIf you do need some protection early, look for a useful percentage Damage Reduction affix, such as of Warding, on eligible Helmet, Torch or Chest equipment. It can solve a survival problem without turning your entire build into a defensive setup. Keep important bonuses like Sage's All Class Skills in mind before swapping gear just for survivability.\n\nDefense, Health, Block and Dodge become more relevant when the activity actually requires survival, especially in the Tower. Retaliation Warrior is also different: Defense and Block can contribute to its damage, so they're not simply defensive investments there.\n\nFirst figure out what's stopping you: not enough damage, not enough survival, or both. Spend resources on that problem instead of stacking stats out of habit."
    },
    {
      "part": "Progression and farming",
      "title": "The one-shot mindset",
      "body": "One-shotting monsters is one of the best benchmarks for efficient farming.\n\nEvery extra attack takes time. Across thousands of kills, that can mean fewer materials, drops, Gold, EXP and other rewards. Blue and yellow variants have more Health, so you also need to consider whether they interrupt your normal kill speed.\n\nKeep trying to raise ML. When a monster becomes too tough to farm properly, that doesn't mean you should give up pushing. It means you may need a detour: lower Fighting Level, one-shot the monsters that drop what you need, upgrade your equipment and return stronger.\n\nDon't get too comfortable at an easy level, either. Better drops and unlocks are waiting farther ahead. The whole reason you're farming is to make that next push possible."
    },
    {
      "part": "Progression and farming",
      "title": "Picking the right monster",
      "body": "The highest monster you can defeat isn't necessarily your best farm.\n\nFrom Murky Depths onward, the weakest monster in a biome gives 10% less ML progress than the usual amount and the strongest gives 10% more. That means the strongest target can take a little longer and still be worth fighting for ML progress.\n\nFor example, if the weakest takes one second per qualifying kill, the strongest can take about 1.22 seconds and offer similar ML progress over time. If it takes two or three times longer, the easier target is probably better.\n\nFor Forge materials, focus on the monster that actually drops the resource you need. Compare how quickly you can kill it and whether dropping your Fighting Level would help.\n\nArcana's ML Farming Comparator is there for exactly this: enter your measured kill times and see which target gives better progress."
    },
    {
      "part": "Progression and farming",
      "title": "Frenzy, Lucky and farming bonuses",
      "body": "Frenzy can create additional rewarded kills for loot, Gold and EXP, but those extra kills do NOT advance Monster Level. It's useful for resource farming, not direct ML pushing.\n\nLucky can improve dropped equipment tiers and has extra value in later Gilded farming. Item Drop Chance helps you find items, Material Drop Chance helps with Forge resources, and Gold and EXP bonuses serve their own purposes.\n\nBut remember the one-shot mindset. A farming setup with every bonus imaginable isn't very useful if it takes forever to kill anything.\n\nKeep enough damage to farm efficiently, then add bonuses where they make sense."
    },
    {
      "part": "Progression and farming",
      "title": "Progression: ML 1 to 65",
      "body": "Early on, focus on learning your class and making the most of your drops. Get into a guild, spend skill points, start using the Forge and get familiar with your available activities.\n\nML 20 brings Gems, ML 30 opens Conflux and ML 50 is the Torch milestone. At ML 60, Runic Cores become available.\n\nA good early item might change what you build. Don't be stubborn about sticking to an original plan if RNG gives you something better.\n\nPrioritize damage that lets you kill quickly. Don't build around generic Defense early unless your build specifically uses it; if surviving becomes a problem, consider an appropriate Damage Reduction affix instead.\n\nTry to keep progressing toward ML 65, with material-farming detours when your damage is falling behind. You don't have to perfect every Uncommon item along the way."
    },
    {
      "part": "Progression and farming",
      "title": "Progression: ML 65 to 185",
      "body": "The middle stages are where builds start to feel more complete. You get a larger Rune Grid, more Gem sockets and stronger item rarities.\n\nWork on the equipment slots, pets, runes and skills that directly strengthen what your build does. You'll get better results from a handful of useful investments than by upgrading every system just because the button is available.\n\nML 90 is important for Conflux rare-material farming and early Epic drops. ML 115 brings the main Epic range and the third Gem socket. ML 150 adds early Legendary drops and more Rune Grid space, while ML 160 makes Flawless Gems possible.\n\nKeep moving toward ML 185, where Legendary equipment reaches its main drop range. If one-shotting becomes difficult, farm the materials for your next power spike and push again."
    },
    {
      "part": "Progression and farming",
      "title": "Progression: ML 185 to 350",
      "body": "The run toward Infernal equipment gets expensive. Material planning starts to matter a lot more, and you should be comparing the gains from different upgrades rather than blindly pushing whichever one is closest.\n\nContinue improving your Forge slots, pets, Runes, Gems and Talismans. The grid expands to 6×6 at ML 220, then reaches 6×7 at ML 300.\n\nML 260 introduces Infernal drops. Look at the whole item, including its bonuses, instead of assuming an Infernal piece is automatically better for everything.\n\nKeep pushing until ML 350, where Convergence becomes available. You don't need a perfect character to get there, but the stronger your setup is, the more comfortable the next stage will feel."
    },
    {
      "part": "Equipment and upgrades",
      "title": "Equipment and the Forge",
      "body": "Season 2 changed equipment upgrading in a big way: your main Forge progression belongs to the equipment SLOT, not the specific item you've equipped.\n\nThat means you can switch between different base items without resetting the slot's upgrade progress. The three tracks to understand are Tier, Enhance and Awaken.\n\nEquipment comes in six main rarities. From Normal through Infernal, each rarity adds more potential normal affix positions. Gilded, Radiant and Mythic drops can bring especially interesting special bonuses.\n\nDifferent base item families in the same slot can have different stats and built-in bonuses. Boots are a good example: Grounded Treads have higher Defense and built-in Block Chance, while Swiftstride Boots offer Double Hit. Which is better depends on your build, not just the biggest Defense number.\n\nHelmets are a special case. Sage Diadem is hard to replace for most builds because of its All Class Skills (ACS). A Retaliation Warrior is one possible exception: a more defensive helmet with a valuable Drop Bonus might be worth giving up Sage's ACS. Compare what your whole build gains and loses before making that trade.\n\nDon't get tunnel vision about rarity. The actual item and its bonuses are what matter.",
      "table": [
        [
          "Tier",
          "Rarity",
          "Normal affix slots"
        ],
        [
          "1",
          "Normal",
          "0"
        ],
        [
          "2",
          "Uncommon",
          "1"
        ],
        [
          "3",
          "Rare",
          "2"
        ],
        [
          "4",
          "Epic",
          "3"
        ],
        [
          "5",
          "Legendary",
          "4"
        ],
        [
          "6",
          "Infernal",
          "5"
        ]
      ]
    },
    {
      "part": "Equipment and upgrades",
      "title": "Reforging and salvaging",
      "body": "Reforging uses three eligible matching items to produce a higher-rarity result. Anchor Stones can preserve selected properties through supported Reforging options.\n\nSalvaging turns unwanted gear into resources, but it also creates an easy way to throw away something useful if your filters are too aggressive.\n\nLook beyond rarity before salvaging. An item with a strong special Drop Bonus might deserve a place in a farming preset even if it isn't your main piece.\n\nReview Auto-Salvage as your character progresses. Rules that made sense when you were collecting Rare items might not be appropriate once you're hunting special Infernal drops."
    },
    {
      "part": "Equipment and upgrades",
      "title": "Awakening, failure costs and materials",
      "body": "Higher Forge ranks take a lot of materials. Some upgrades require resources from several monsters or biomes, so make a plan instead of blindly farming the same target.\n\nYou need to know which monsters drop the resources, how many you need and how failures and pity affect the actual cost.\n\nDon't assume every upgrade succeeds first try. Compare the minimum, expected average and maximum possible costs when those estimates are supported.\n\nThe important part for most players is the MATERIALS. Gold is useful, but it shouldn't dominate a long upgrade checklist.\n\nThe Monster Material Exchange also lets you trade five lower-biome monster materials for one selected higher-biome material. Compare that cost with farming the higher material directly.\n\nPathfinder can show the materials in monster and biome order and help with your upgrade plan."
    },
    {
      "part": "Equipment and upgrades",
      "title": "Affixes and special Drop Bonuses",
      "body": "An item isn't just its rarity and base stat. Normal affixes and special Drop Bonuses make equipment worth comparing closely.\n\nSome bonuses favor Attack, Pet Damage or Retaliation. Others support farming through effects like Frenzy, Lucky or resource bonuses.\n\nA rare item with an excellent bonus can sometimes be more useful for a particular purpose than a higher-rarity item with an irrelevant one.\n\nAstral Catalysts improve special Drop Bonuses, which means the quality of the original roll matters. I'd be picky about what receives expensive investment.\n\nOnce you have enough gear, consider keeping separate pieces for normal farming and difficult encounters. One loadout doesn't need to do everything."
    },
    {
      "part": "Pets, runes and gems",
      "title": "Pets, hatching and evolved affixes",
      "body": "You can equip four pets, and one acts as your attacking pet. Other equipped pets provide their useful bonuses.\n\nThe base hatch chances are Common 50%, Uncommon 25%, Rare 15%, Epic 8% and Legendary 2%. Epic enters the available pool after 10 hatches, Legendary after 20. Pity guarantees an Epic within 20 and a Legendary within 60. Each egg gives you two choices.\n\nSpecies, rarity and Hatch Bonus are separate things. Getting a rarer pet isn't always better than one with the bonus your current build needs.\n\nPet Mastery, evolved affixes and Compounding are separate progression systems. Don't assume improving one automatically improves the others.\n\nThink ahead to the four Legendary pets you actually want to build around. Evolved affixes cost Pet Shards, and you don't get those shards back when you sacrifice a pet. Temporary pets are useful, but they're not where I'd put expensive affix upgrades.\n\nThe Premium pet affix auto-reroll feature lets you select a target affix and a Pet Shard spending limit. It's a lot less tedious, but you should still pay attention to the cost."
    },
    {
      "part": "Pets, runes and gems",
      "title": "ACS pets: keepers, fodder and Pet Shards",
      "body": "There are two different ways ACS can appear on a pet, and confusing them can get expensive.\n\n- ACS evolved affix: A separate affix you can roll and upgrade. This is an important source of All Class Skills on a Legendary pet you plan to KEEP.\n- ACS Hatch Bonus: The pet's main bonus from hatching. A Legendary with this bonus is also valuable as Compound fodder, even if ACS isn't the main Hatch Bonus you want in your finished build.\n\nA Legendary pet with the ACS Hatch Bonus can now be sacrificed into ANY other Legendary pet for TWO Compound levels. You don't need matching species or matching Hatch Bonuses. That's a powerful shortcut when you're developing the four Legendary pets you actually want.\n\nWhile you're still looking for those four pets, there's nothing wrong with equipping an ACS Hatch Bonus Legendary temporarily. Just don't sink Pet Shards into its evolved affixes if you expect to sacrifice it. Unlocking slots, rerolling affixes and leveling them all cost resources you will NOT get back when that pet is consumed.\n\nInvest in ACS evolved affixes on your permanent pets. Use temporary ACS Hatch Bonus Legendaries as double-value Compound fodder. Decide which pets you're keeping before you commit the shards."
    },
    {
      "part": "Pets, runes and gems",
      "title": "Raeik and ACS Hatch Bonus fodder",
      "body": "Raeik is a very rare new pet with a special purpose.\n\nYou CANNOT equip Raeik. You can sell him for 25–150 Arcstone depending on rarity, or use him as Compound fodder for any pet, regardless of its species or Hatch Bonus.\n\nOnly eggs obtained AFTER the Raeik update can hatch him. Eggs you already had before the update aren't eligible.\n\nThere's another useful option for Legendary Compounding: a Legendary pet with an ACS Hatch Bonus can be sacrificed into ANY other Legendary for TWO Compound levels. That's the Hatch Bonus on the pet, not an ACS evolved affix.\n\nUnlike Raeik, an ACS Hatch Bonus Legendary can fill a temporary slot in your team. But if it's destined to become fodder, leave its evolved affixes alone. Sacrificing the pet doesn't refund any Pet Shards you've spent on them."
    },
    {
      "part": "Pets, runes and gems",
      "title": "Pet Compound and equalization",
      "body": "Compounding increases a pet's main Hatch Bonus, not its evolved affixes.\n\nSeasonal characters have an equalization rule: an equipped pet's EFFECTIVE Compound level can be no more than 10 levels above the weakest equipped pet. An empty equipped slot counts as Compound +0.\n\nFor example, if your four equipped pets are +30, +5, +5 and +5, the strongest pet currently gets the Hatch Bonus scaling of +15. The extra stored levels aren't lost. They'll start contributing as the others catch up.\n\nUncommon normally caps at +10, Rare at +20, Epic at +30, while Legendary doesn't have the same ordinary cap.\n\nACS Hatch Bonus Legendaries can supply two Compound levels when sacrificed into any Legendary, but the Pet Shards spent on their evolved affixes aren't returned. Save costly affix work for the four pets you're keeping.\n\nThis is why I wouldn't spend everything Compounding one pet and completely neglect the others. Develop a balanced group of four so you're actually getting the value of what you've spent."
    },
    {
      "part": "Pets, runes and gems",
      "title": "Runes and Rune Grid progression",
      "body": "Runes have a family, primary bonus, secondary stat, shape and level. You fit them into the Rune Grid, which automatically expands as you advance ML.\n\nThe main families include Fury for Attack, Vitality for Health, Precision for Crit Chance, Fortitude for Defense, Wisdom for EXP, Fortune for Gold and Bond for Pet Damage.\n\nChoose a Rune whose primary bonus actually helps your build first, then compare its secondary stats. For example, a Bond Rune's Pet Damage bonus doesn't belong in a pure Attack Damage build just because it rolled a good secondary.\n\nA Rune Word can justify an occasional less-than-ideal rune if the completed formation is valuable enough and the rune still contributes something useful. Critical Damage or Double Hit can help in an Attack build, while an EXP Gain secondary can be worthwhile in a farming setup. Don't force a Rune Word at the cost of stronger overall bonuses.\n\nRunic Cores become available at ML 60 and are used for Rune Awakening. Reforging also gives you ways to work toward the types and shapes you want.\n\nThink about how your runes fit TOGETHER, not just which individual rune has the biggest number.",
      "table": [
        [
          "ML",
          "Rune Grid"
        ],
        [
          "1",
          "2×2"
        ],
        [
          "10",
          "3×3"
        ],
        [
          "30",
          "4×3"
        ],
        [
          "45",
          "5×3"
        ],
        [
          "65",
          "6×3"
        ],
        [
          "90",
          "6×4"
        ],
        [
          "150",
          "6×5"
        ],
        [
          "220",
          "6×6"
        ],
        [
          "300",
          "6×7"
        ]
      ]
    },
    {
      "part": "Pets, runes and gems",
      "title": "Rune Words and repeated formations",
      "body": "Rune Words are combinations made by arranging qualifying Runes in the grid. There are 24 of them, and they add another reason to think carefully about your available space.\n\nA recent update clarified something important: the SAME Rune Word can form multiple times on SEPARATE runes. Every complete copy contributes its FULL bonus.\n\nThat means the best layout isn't necessarily one copy of everything you can fit. Repeating a strong formation might be better than spreading your grid across several weaker effects.\n\nExperiment with Rune Forge and compare the total bonuses. Sometimes completing a good Rune Word is worth using a filler Rune, but that doesn't mean you should ignore the Rune's primary bonus or accept useless secondaries. Look for helpful bonuses like Critical Damage or Double Hit in Attack builds, or EXP Gain in farming layouts. If completing a word weakens your build more than the word helps, skip it."
    },
    {
      "part": "Pets, runes and gems",
      "title": "Gems, sockets and quality",
      "body": "Gems begin dropping at ML 20. The four families are Garnet, Jade, Lapis and Amber. Their bonuses depend on where you socket them, so the same Gem family can behave differently across equipment.\n\nSockets unlock at ML 20, 65, 115 and 160. Your equipment eventually provides twenty sockets in total, though each slot has its own capacity.\n\nRarities are Rough, Cut, Polished, Brilliant and Flawless. Three eligible Gems fuse into a Gem of the next rarity, except Flawless. Flawless Gems begin dropping at ML 160 and CANNOT be made by fusing lower rarities.\n\nQuality and secondary stats are worth checking too. Two Gems of the same family and rarity aren't necessarily equal.\n\nGem Auto-Salvage now has a separate ABOVE-100% quality option for each rarity. Unless you enable that option, Gems above 100% quality are kept.\n\nDon't leave a bunch of sockets empty just because you're trying to fuse everything into one rare Gem. Useful filled sockets often beat empty ones. Also, Belt sockets use Jewelry Gem effects rather than Armor effects.",
      "table": [
        [
          "Socket unlock",
          "ML",
          "Gold cost"
        ],
        [
          "First",
          "20",
          "25K"
        ],
        [
          "Second",
          "65",
          "50M"
        ],
        [
          "Third",
          "115",
          "20B"
        ],
        [
          "Fourth",
          "160",
          "2T"
        ]
      ]
    },
    {
      "part": "Pets, runes and gems",
      "title": "Talismans and Ruby spending",
      "body": "You can equip two Talismans. The main types are Fury, Spirit, Iron and Recovery.\n\nInfusion and Inscriptions give you ways to develop them and choose stats useful to your build. They're a major long-term investment, but Rubies are also valuable elsewhere.\n\nDon't spend a ridiculous amount on a Talisman increase without comparing what you'd gain from another upgrade. Expensive doesn't automatically mean effective.\n\nSeason 2 also has rules limiting how far one equipped Talisman can outpace the other at higher Inscription progression. Keep both in mind when planning resources."
    },
    {
      "part": "Guilds and activities",
      "title": "Guilds and Guild Skill Tree",
      "body": "I'd join an active guild as soon as possible. Besides the bonuses, having people to learn from can save you a lot of trial and error.\n\nGuildstone comes from eligible Boss Fight rewards, NOT ordinary monster farming. Consistent participation matters.\n\nThe guild's shared Skill Tree has Vanguard, Finesse and Fortune bonuses covering damage, Defense, Crit, EXP, Gold and more. Guild leadership decides where points go.\n\nAfter Guild Level 68, subsequent levels award two skill points and provide access to further Ascension progression.\n\nIf your guild is planning changes, Arcana's Guild Skill Planner is a safe place to compare allocations without actually spending in-game points."
    },
    {
      "part": "Guilds and activities",
      "title": "Dungeons, Daily Missions and Goblins",
      "body": "Dungeons offer different resource destinations. Crypt starts at ML 1, Gold Hoard at 12, Den at 15, Vault at 18 and Mine at 25.\n\nChoose the destination that supplies what you need. Gold and Pet resources don't have the same value at every point in the season.\n\nDaily Missions offer rotating rewards. More difficult tiers become available at ML 50 and ML 100.\n\nGoblin Invasion adds special encounters and rewards to normal monster farming. Because kill speed matters here, temporarily lowering Fighting Level to one-shot those enemies can be useful. Just remember to return to ML pushing afterward.\n\nThe Arc Pass has free and optional Premium rewards, so check for anything you've already unlocked."
    },
    {
      "part": "Guilds and activities",
      "title": "Boss Fights, Tower and Rift Raids",
      "body": "Boss Fights reward damage during a timed encounter, and eligible ones contribute Guildstone. A separate boss-damage preset can be very useful.\n\nThe Tower unlocks at Character Level 10. It gets harder as you advance, and survivability may matter more than it does during ordinary farming.\n\nRift Raids are cooperative fights with two to four players. Each gets a 30-second strike against the Titan. Normally you have two raid entries per day. Participation requires Character Level 10 and an account that's at least 24 hours old.\n\nRaid performance affects your Spoils Chests. A full four-player group can receive an additional chest roll.\n\nA recent update added fifteen class formations. Two eligible party members whose banners count can pair up to improve their banner bonus. The game can recheck banners if a strike reveals substantially higher Might than the party initially had.\n\nRift Raids also support Auto-Presets for equipment, Runes, skill trees and pets. You can go in with a dedicated raid build without manually changing your everyday loadout.\n\nThe exact formation bonuses are best checked in-game when planning a serious raid party."
    },
    {
      "part": "Guilds and activities",
      "title": "Elemental Conflux",
      "body": "Conflux unlocks at ML 30, long before the separate Convergence endgame.\n\nIt has a 60-minute daily limit, a 100 Elemental Shard daily cap and double Character EXP. Shards improve Fire, Water, Air, Earth, Poison and Nature Mastery.\n\nBeginning at ML 90, farming at your highest ML improves the rare-material opportunities for resources such as Abyssal Ember, Eternal Sigil and Primeval Core.\n\nWhether you should stay for the full time depends on your goals. If you need Shards or rare materials, Conflux may be useful. If you need ordinary Forge materials or ML progress, regular farming might serve you better.\n\nDon't do an activity longer than you need just because it's available."
    },
    {
      "part": "Convergence and endgame",
      "title": "Convergence at ML 350",
      "body": "Convergence is a separate progression system that unlocks at ML 350.\n\nYou begin with four monster seats, and each can be locked to a specific monster or left Wild. Locked seats help with targeted materials. Wild seats add a drop bonus and can generate Convergent Elites. The Lattice can eventually expand your seats to six.\n\nConvergence kills provide Resonance, which increases Convergence Level and awards points for the Lattice.\n\nThe combat tier adjusts with your performance. Higher difficulty offers opportunities for better rewards, but you still need to kill monsters efficiently.\n\nI'd rather farm a tier consistently than barely survive something stronger. Improve the setup and push farther when you're ready."
    },
    {
      "part": "Convergence and endgame",
      "title": "The Lattice and Convergent Elites",
      "body": "The Lattice has 37 nodes across its core and six constellations: Might, Bastion, Harvest, Fortune, Ascendance and Wild.\n\nSome nodes improve combat, some improve materials or Gold, and others change seats, Resonance or Elite farming. You can equip up to two Keystones in a loadout, but consider their tradeoffs.\n\nWild seats can generate Convergent Elites. Their base appearance chance is 1%, with pity after 300 qualifying kills. They're tougher but can provide valuable extra rewards.\n\nKeep multiple Lattice loadouts if you have different goals. The best setup for pushing difficulty might not be the best one for collecting materials."
    },
    {
      "part": "Making it easier",
      "title": "Practical quick start: steps and tips",
      "body": "If you don't want the full theory, this is the route I'd follow. Adjust it to your class and your actual drops.\n\n- 1. Pick how your build deals damage: Attack, Pet or Retaliation. Build around that instead of spreading every upgrade across unrelated bonuses. Harmony is an option mainly for Rogue and Archer Attack setups, not something every class needs.\n- 2. Join an active guild early. Ask experienced players about your class, and use your skill points and whatever useful equipment you already own.\n- 3. Keep pushing Monster Level. Aim to one-shot the monsters you normally farm. If kills slow down, temporarily lower Fighting Level to farm the materials for a useful upgrade, then return to pushing. Don't park your ML indefinitely.\n- 4. Prioritize damage over generic Defense in early farming. If you keep dying, an appropriate percentage Damage Reduction affix on eligible Helmet, Torch or Chest gear can be a better temporary fix. Don't casually give up Sage's ACS just to wear a defensive helmet.\n- 5. Watch the unlocks: Gems at ML 20, Conflux at ML 30, Torch and ACS at ML 50, Runic Cores at ML 60, more room and equipment at ML 65, and ML 90 as a useful checkpoint for Conflux rare-material opportunities. You don't have to optimize every system the moment it appears.\n- 6. Spend materials where they improve your actual build. Check Pathfinder for monster materials and pick the farm target you can kill efficiently. Don't upgrade random slots simply because they're ready.\n- 7. Plan your four long-term pets before spending heavily on evolved affixes. ACS Hatch Bonus Legendaries can be useful temporarily, but may be better kept as double-value Compound fodder. Sacrificing one doesn't refund its invested Pet Shards.\n- 8. Use Runes whose primary bonuses help your build. A Rune Word can justify a filler Rune if the overall formation is worthwhile; useful secondaries like Critical Damage or Double Hit help Attack setups, while EXP Gain can suit a farming preset.\n\nYour daily check is simple: Are kills still fast? What's the next meaningful upgrade? Which monster drops its materials? Are there guild or daily rewards you actually need? Complete the useful activities, set your farming preset and keep progressing.\n\nIf you want the reason behind any step, use Chapters to jump straight to its deeper explanation. You don't have to read the other chapters first."
    },
    {
      "part": "Making it easier",
      "title": "Presets, Auto-Presets and accounts",
      "body": "By the middle and late game, I recommend separate presets for everyday farming, pushing ML, Boss Fights, Tower and special activities.\n\nAuto-Presets can help apply those setups automatically. Rift Raids now support your gear, Rune, skill-tree and pet presets without forcing you to change your normal equipped loadout.\n\nYou can also turn on Share my detailed stats publicly if you want other players to see your stats, Runes and Pets when they open your profile. That setting is OFF by default.\n\nWorld Selection now lets you tap a locked biome to preview its monsters and elemental weaknesses.\n\nCharacter Slots are now called Storage Slots. They're only purchased during the Keep Both step at season end, so don't mistake them for an early character-progression upgrade."
    },
    {
      "part": "Making it easier",
      "title": "Daily routine and common mistakes",
      "body": "When you log in, check what your character collected and whether you're still killing your chosen monsters quickly. Then look at Boss Fights, Guild Boss, Dungeons, Tower, Raids, Daily Missions, Conflux and Arc Pass rewards, depending on what you need.\n\nReview your next useful upgrade, choose the monster that drops its materials, and set your farming preset accordingly.\n\nIf you're pushing ML during a long offline session, remember monsters will get stronger as you climb. Don't assume a one-shot today will stay a one-shot forever.\n\nMistakes I'd avoid:\n- Ignoring the next ML unlock because a lower level feels comfortable.\n- Struggling through slow kills when temporarily dropping Fighting Level would get the materials for an upgrade faster.\n- Ignoring a brilliant Radiant drop just because it doesn't match your original plan.\n- Building Mage Attack around only INT without comparing STR, or overlooking Harmony.\n- Forgetting Double Damage benefits Retaliation.\n- Overinvesting in a single Seasonal pet while the others lag behind.\n- Salvaging useful items or Gems because the automation settings are outdated.\n- Forgetting that duplicate Rune Words can activate separately.\n- Spending resources without checking what the upgrade actually improves."
    },
    {
      "part": "Making it easier",
      "title": "Using Arcana",
      "body": "Arcana is here to make these decisions easier.\n\nPathfinder shows the monster materials needed for equipment upgrades and helps you plan around failed attempts and pity.\n\nThe ML Farming Comparator uses your measured kill times to compare farming targets.\n\nThe Damage Calculator lets you enter your Attack, Pet or Retaliation breakdown and test changes. Some server rounding behavior is not fully verified, so estimated results should be treated as estimates.\n\nBuild Studio connects equipment, pets, Runes and skills. The Pet Compound and Pet Affix calculators help with their separate upgrade systems, while the Guild Skill Planner helps guilds compare point allocation.\n\nArcanaWiki and the Codex provide more detailed references for monsters, equipment, materials and Rune Words.\n\nI've linked those tools next to the sections where they make sense, so you can go straight from reading about a mechanic to trying it out."
    },
    {
      "part": "Making it easier",
      "title": "Final thoughts",
      "body": "Keep working toward higher Monster Level. One-shot what you can, farm the materials you need, make upgrades that genuinely help and keep pushing.\n\nSome of your best choices will come from planning. Others will come from a ridiculous drop that changes the build you thought you wanted.\n\nYou don't need to play exactly like anyone else. Understand your own character, try things when they look promising and make the most of what the game gives you.\n\nThere's always another biome, another upgrade and another build worth trying. That's what keeps it interesting."
    }
  ],
  "actions": [
    {
      "label": "Plan equipment upgrades in Pathfinder",
      "route": "calculators/pathfinder",
      "icon": "calculator"
    },
    {
      "label": "Compare ML farming speeds",
      "route": "calculators/ml-farm",
      "icon": "sword"
    },
    {
      "label": "Open Build Studio",
      "route": "labs/build",
      "icon": "flask"
    },
    {
      "label": "Browse all guides",
      "route": "wiki/guides",
      "icon": "book"
    }
  ],
  "connections": {
    "articles": [
      "monster-level",
      "forge",
      "pet-compound",
      "rune-grid"
    ],
    "collections": [
      "monster",
      "item",
      "runeword",
      "pet"
    ],
    "tools": [
      "pathfinder",
      "farm",
      "build",
      "compound"
    ],
    "sectionLinks": {
      "Choosing your class": [
        "skills",
        "build"
      ],
      "Character Level, Monster Level and Fighting Level": [
        "farm",
        "monsterGuide"
      ],
      "Every important ML milestone": [
        "biomeRecords",
        "runeGuide"
      ],
      "Class Skills and the Passive Tree": [
        "skills",
        "passives"
      ],
      "Understanding Attack, Pet and Retaliation": [
        "build"
      ],
      "Picking the right monster": [
        "farm",
        "biomeRecords"
      ],
      "The one-shot mindset": [
        "farm"
      ],
      "Awakening, failure costs and materials": [
        "pathfinder",
        "materials"
      ],
      "Affixes and special Drop Bonuses": [
        "compare",
        "items"
      ],
      "Pet Compound and equalization": [
        "compound",
        "petlab"
      ],
      "Runes and Rune Grid progression": [
        "runes",
        "runeGuide"
      ],
      "Rune Words and repeated formations": [
        "runes",
        "runewords"
      ],
      "Gems, sockets and quality": [
        "gemGuide",
        "build"
      ],
      "Guilds and Guild Skill Tree": [
        "guildtree",
        "guilds"
      ],
      "Boss Fights, Tower and Rift Raids": [
        "raids",
        "raidGuide"
      ],
      "The Lattice and Convergent Elites": [
        "build"
      ],
      "Using Arcana": [
        "pathfinder",
        "farm",
        "compound",
        "affixes"
      ],
      "ACS pets: keepers, fodder and Pet Shards": [
        "affixes",
        "compound",
        "petlab"
      ],
      "Practical quick start: steps and tips": [
        "pathfinder",
        "farm",
        "build"
      ]
    }
  }
});
