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
      ]
    }
  }
});
