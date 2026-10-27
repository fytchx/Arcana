// Arcana Season 2 guide: review draft, not yet approved for production.
export const SEASON2_COMPLETE_GUIDE=Object.freeze({
  "id": "season-2-complete-zane",
  "title": "IdleArc Season 2: The Complete Guide",
  "category": "Progression & Farming",
  "readTime": "35–45 min",
  "author": "Zane",
  "source": "player-authored",
  "summary": "From choosing a class and one-shot farming to the Forge, pets, Runes, raids and Convergence. Practical advice, a full ML roadmap and shortcuts to Arcana tools.",
  "keywords": "season 2 complete zane beginners progression ml one shot harmony mage strength intelligence warrior retaliation double damage radiant raeik forge raid pet convergence",
  "version": "Preview review draft · October 27, 2026",
  "sections": [
    {
      "part": "Getting started",
      "title": "Introduction",
      "body": "IdleArc looks pretty simple at first. Your character fights monsters, collects loot, levels up and gets stronger. Then you start exploring the Forge, pet system, Runes and everything else and realize there are a ridiculous number of ways to improve your character.\n\nI want this guide to explain the important systems, how they fit together and the decisions that actually matter while progressing through Season 2.\n\nThere's no single perfect route. Your drops, class and goals will all affect what makes sense. The point isn't to force everyone into the same build. It's to help you understand the game well enough to make your own decisions."
    },
    {
      "part": "Getting started",
      "title": "Choosing your class",
      "body": "IdleArc has five classes, each with three Class Skill branches.\n\n- Warrior: Heavy melee attacks, shields, Defense, Block and Retaliation.\n- Rogue: Fast attacks, critical damage, Double Hit, dual-wielding and useful farming skills.\n- Archer: Ranged attacks, traps, critical scaling and pet-focused options through Beastmaster.\n- Mage: Spell-based attacks and strong offensive multipliers. Something worth knowing is that Attack Mages benefit from BOTH Strength and Intelligence, much like Attack Rogues. Don't automatically stack nothing but INT just because that's how Mages work in other games.\n- Druid: Several ways to combine offense, defense and pet bonuses, including builds where your pet does much of the damage.\n\nThere's also Harmony. It's less popular, and the Mage skill tree doesn't exactly point you toward it. But you can build around Harmony to make both Mage and Rogue stronger. Used properly, it offers ways to push Attack Damage much higher.\n\nMy advice is to pick the class you're interested in and let RNG influence the early build. Maybe you thought you were going one direction, then an amazing Radiant weapon drops for something else. That can be a perfectly good reason to switch things up. A great item you actually have is often more useful than the ideal item you're still hoping to find."
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
          "Infernal Pits · early Epic drops · Rune Grid 6×4"
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
      "body": "Every class has three Class Skill branches. The Passive Tree is shared across classes.\n\nTry to figure out which skills are actually helping your build. If most of your damage comes from your pet, a bonus that only strengthens direct attacks might not be the best investment. The reverse is true for Attack builds.\n\nPassive points can be refunded for free, so test combinations. Class Skill refunds have different rules and may cost Arcstone.\n\nAll Class Skills (ACS) improves the ranks of skills you've learned. Torches, Sage Diadem and certain Legendary pet bonuses are important sources. ACS can push learned skills beyond their ordinary rank caps, although particular effects may still have their own limits.\n\nDon't try to perfect your entire tree at level one. Build around what you've got, then refine it as your equipment and skill points improve."
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
      "body": "Health, Defense, Block and Dodge matter, especially in activities like the Tower.\n\nYou don't need to turn your everyday farming build into a fortress if monsters already die before they threaten you. Losing too much damage can make ordinary farming far less efficient.\n\nRetaliation Warrior is a special case because Defense and Block can also help deal damage. That doesn't mean the same priorities apply to every other build.\n\nWhen you're stuck, decide whether the real problem is damage, survivability or both. Then upgrade for the problem you're having."
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
      "body": "Early on, focus on learning your class and making the most of your drops. Get into a guild, spend skill points, start using the Forge and get familiar with your available activities.\n\nML 20 brings Gems, ML 30 opens Conflux and ML 50 is the Torch milestone. At ML 60, Runic Cores become available.\n\nA good early item might change what you build. Don't be stubborn about sticking to an original plan if RNG gives you something better.\n\nTry to keep progressing toward ML 65, with material-farming detours when your damage is falling behind. You don't have to perfect every Uncommon item along the way."
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
      "body": "Season 2 changed equipment upgrading in a big way: your main Forge progression belongs to the equipment SLOT, not the specific item you've equipped.\n\nThat means you can switch between different base items without resetting the slot's upgrade progress. The three tracks to understand are Tier, Enhance and Awaken.\n\nEquipment comes in six main rarities. From Normal through Infernal, each rarity adds more potential normal affix positions. Gilded, Radiant and Mythic drops can bring especially interesting special bonuses.\n\nDifferent base item families in the same slot can have different stats and built-in properties. A helmet with a great supporting bonus might be better than one with more of its main stat.\n\nDon't get tunnel vision about rarity. The actual item and its bonuses are what matter.",
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
      "body": "You can equip four pets, and one acts as your attacking pet. Other equipped pets provide their useful bonuses.\n\nThe base hatch chances are Common 50%, Uncommon 25%, Rare 15%, Epic 8% and Legendary 2%. Epic enters the available pool after 10 hatches, Legendary after 20. Pity guarantees an Epic within 20 and a Legendary within 60. Each egg gives you two choices.\n\nSpecies, rarity and Hatch Bonus are separate things. Getting a rarer pet isn't always better than one with the bonus your current build needs.\n\nPet Mastery, evolved affixes and Compounding are separate progression systems. Don't assume improving one automatically improves the others.\n\nThe Premium pet affix auto-reroll feature lets you select a target affix and a Pet Shard spending limit. It's a lot less tedious, but you should still pay attention to the cost."
    },
    {
      "part": "Pets, runes and gems",
      "title": "Raeik and Legendary ACS fodder",
      "body": "Raeik is a very rare new pet with a special purpose.\n\nYou CANNOT equip Raeik. You can sell him for 25–150 Arcstone depending on rarity, or use him as Compound fodder for any pet, regardless of its species or Hatch Bonus.\n\nOnly eggs obtained AFTER the Raeik update can hatch him. Eggs you already had before the update aren't eligible.\n\nThere's another useful change for Legendary pets: one with an All Class Skills Hatch Bonus can now be compounded into ANY other Legendary pet for DOUBLE Compound points.\n\nThat creates some worthwhile decisions. Keep the pet, use its special Compound value, or sell Raeik for Arcstone depending on what helps your account most."
    },
    {
      "part": "Pets, runes and gems",
      "title": "Pet Compound and equalization",
      "body": "Compounding increases a pet's main Hatch Bonus, not its evolved affixes.\n\nSeasonal characters have an equalization rule: an equipped pet's EFFECTIVE Compound level can be no more than 10 levels above the weakest equipped pet. An empty equipped slot counts as Compound +0.\n\nFor example, if your four equipped pets are +30, +5, +5 and +5, the strongest pet currently gets the Hatch Bonus scaling of +15. The extra stored levels aren't lost. They'll start contributing as the others catch up.\n\nUncommon normally caps at +10, Rare at +20, Epic at +30, while Legendary doesn't have the same ordinary cap.\n\nThis is why I wouldn't spend everything Compounding one pet and completely neglect the others. Develop a balanced group of four so you're actually getting the value of what you've spent."
    },
    {
      "part": "Pets, runes and gems",
      "title": "Runes and Rune Grid progression",
      "body": "Runes have a family, primary bonus, secondary stat, shape and level. You fit them into the Rune Grid, which automatically expands as you advance ML.\n\nThe main families include Fury for Attack, Vitality for Health, Precision for Crit Chance, Fortitude for Defense, Wisdom for EXP, Fortune for Gold and Bond for Pet Damage.\n\nSecondary stats matter, and sometimes a less impressive rune is worth using simply because its secondary fits the build perfectly.\n\nRunic Cores become available at ML 60 and are used for Rune Awakening. Reforging also gives you ways to work toward the types and shapes you want.\n\nThink about how your runes fit TOGETHER, not just which individual rune has the biggest number.",
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
      ]
    }
  }
});
