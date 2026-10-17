/**
 * Transcription of game-displayed rounded stages, NOT source-precision data.
 * 91 screenshots and a 6m43s video from October 17, 2026.
 * Warrior images #2-6; Mage images #63-64; exact image index documented in research log.
 */
export const RETALIATION_WARRIOR_2026_10_17=Object.freeze({
  className:'Warrior', allClassSkills:17,
  attack:{
    weapon:{min:6140,max:8780},jewelry:{min:0,max:0},
    additive:{classSkills:201,strengthFromItems:1350,intelligenceFromItems:63.5,talisman:56},
    flat:{skillTree:706,runes:1860,guild:1000},
    layers:{talismanInscription:16,skillTree:30.4,runes:38.2,strengthOther:459.7,
      petIncreasedStrength:254,intelligenceOther:19.4,guild:77.8,
      echoBlessings:12,gearSets:29,gems:12,timeBoost:63}
  },
  retaliation:{
    defense:18510000,globalRatio:0.60,
    baseBonuses:{reflectingGear:83.4,deflection:40,bulwarkStance:15},
    layers:{strength:1210,petIncreasedStrength:169.3,petRetaliation:280,
      talismanInscription:52,runes:357.1,guild:77.8,echoBlessings:12,
      gearSets:29,gems:12,timeBoost:63},
    combatStanceFactor:1.25,rollMinFactor:0.70,blockedFactor:1.75,
  },
  combat:{critChance:392.4,critDamage:1502,doubleHitChance:281,doubleDamageChance:597,bossDamage:100},
  references:{attackMin:26100000,attackMax:36940000,retaliationMin:58740000000,
    retaliationMax:83920000000,retaliationAvg:71330000000,
    petBonusNotMeasured:true,critChance:392.4,doubleHitChance:281,
    doubleDamageChance:597,blockChance:97,deflectionRawRetaliation:76,
    deflectionEffectiveRetaliation:40,deflectionRawBlock:38,
    deflectionEffectiveBlock:25}
});
export const ATTACK_MAGE_2026_10_17=Object.freeze({
  className:'Mage',allClassSkills:17,
  attack:{
    weapon:{min:7490,max:10700},jewelry:{min:1970,max:3290},
    // STR from items is displayed 1.51K and additive component 1.13K%:
    // 1130 is an APPROXIMATION, not exact unrounded source precision.
    additive:{equipment:141,classSkills:245,strengthFromItems:1130,intelligenceFromItems:455.2,talisman:56},
    flat:{skillTree:911,runes:4050,guild:2130},
    layers:{petBonus:265,talismanInscription:40,dropBonus:170.9,skillTree:98.9,
      runes:462,strengthOther:487,petIncreasedStrength:323.6,
      intelligenceOther:107.4,petIncreasedIntelligence:112.5,guild:77.8,
      echoBlessings:9,gearSets:29,gems:28.9,timeBoost:64,combatStance:25}
  },
  combat:{critChance:531.1,critDamage:1625,doubleHitChance:407,doubleDamageChance:966,bossDamage:100},
  references:{attackMin:23330000000,attackMax:34120000000,
    procMagicBlastRawChance:140,procMagicBlastAppliedChance:100,
    procArcaneCascadeRawChance:144,procArcaneCascadeAppliedChance:100,
    procPyroclasmRawBonus:110,procPyroclasmAppliedBonus:100}
});
