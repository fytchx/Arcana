/**
 * Talisman configuration transcribed from the user's 2026-10-17 IdleArc
 * talisman response. ONLY public-type configuration is included here.
 * No account IDs, equipped-character data, tokens, or session payloads.
 * These are configured game values, not a guarantee of server behavior.
 */
export const TALISMAN_SOURCE='IdleArc talisman response · 2026-10-17';
export const TALISMAN_TYPES=Object.freeze([
 {slug:'fury',name:'Talisman of Fury',stats:{attack_power:[2,4,7,11,16,22,29,37,46,56],critical_strike_chance:[0.5,1,1.6,2.3,3.2,4.2,5.5,7,8.8,11]}},
 {slug:'spirit',name:'Talisman of Spirit',stats:{pet_damage_bonus:[3,6,10,15,21,28,36,45,55,66],pet_mastery_level:[1,1,1,1,1,2,3,4,5,6]}},
 {slug:'iron',name:'Talisman of Iron',stats:{max_health:[10,22,36,54,76,104,138,180,230,290],damage_reduction:[0.5,1,1.7,2.5,3.5,4.7,6.1,7.8,9.8,12]}},
 {slug:'recovery',name:'Talisman of Recovery',stats:{life_on_hit:[1,2,3,4,5,7,8,10,12,15],life_on_kill:[2,3,4,5,7,9,12,15,18,24]}},
]);
export const TALISMAN_RULES=Object.freeze({
 upgradeCosts:[10000,25000,60000,150000,400000,1000000,2500000,6000000,15000000],
 upgradeChances:[0.9,0.8,0.6,0.45,0.32,0.25,0.2,0.15,0.12],
 purchaseGold:25000,minMonsterLevel:10,dailyPurchaseLimit:20,dailyResetRubies:20,
 typeChangeRubies:250,maxStash:32,
 infuseGold:[60000,175000,435000,1150000,2900000,7250000,17500000,36000000,55000000],
 infuseRubies:[1,2,3,5,10,40,150,300,400],
 infuseLuckyChance:0.1,
 inscriptionRarities:{common:0.75,greater:0.2,perfect:0.05},
 inscriptionPityAfter:4,perfectPityAfter:10,maxRerolls:3,
 rerollArcstoneCosts:[0,5,5],lockArcstoneCost:5,
 inscriptionLevelStep:10,inscriptionLevelBonusPercent:10,
 directInscriptionLuckyChance:0.14,
 sacrificeOverflowPerExtra:0.05,
});
export const TALISMAN_SACRIFICE_BONUSES=Object.freeze({
 double_damage_chance:10,double_hit_chance:10,strength:50,dexterity:50,
 intelligence:50,crit_damage:75,exp_gain:50,gold_gain:50,
});
export const TALISMAN_INSCRIPTIONS=Object.freeze({
 attack_power:{weight:5,values:[8,12,20],suffix:'%'},
 critical_strike_chance:{weight:10,values:[10,15,25],suffix:'%'},
 damage_reduction:{weight:10,values:[0.5,1,1.5],suffix:'%'},
 max_health:{weight:10,values:[100,150,250],suffix:''},
 life_on_hit:{weight:10,values:[6,9,15],suffix:''},
 life_on_kill:{weight:10,values:[12,18,30],suffix:''},
 pet_damage_bonus:{weight:5,values:[10,15,25],suffix:'%'},
 retaliation_pct:{weight:5,values:[8,12,20],suffix:'%'},
 double_damage_chance:{weight:10,values:[6,9,15],suffix:'%'},
 double_hit_chance:{weight:10,values:[6,9,15],suffix:'%'},
 strength:{weight:10,values:[6,10,15],suffix:''},
 dexterity:{weight:10,values:[6,10,15],suffix:''},
 intelligence:{weight:10,values:[6,10,15],suffix:''},
 crit_damage:{weight:10,values:[10,15,25],suffix:'%'},
 exp_gain:{weight:10,values:[8,12,20],suffix:'%'},
 gold_gain:{weight:10,values:[8,12,20],suffix:'%'},
});
export const TALISMAN_STAT_LABELS=Object.freeze({
 attack_power:'Attack Power',critical_strike_chance:'Critical Strike Chance',
 damage_reduction:'Damage Reduction',max_health:'Max Health',life_on_hit:'Life on Hit',
 life_on_kill:'Life on Kill',pet_damage_bonus:'Pet Damage',retaliation_pct:'Retaliation',
 double_damage_chance:'Double Damage Chance',double_hit_chance:'Double Hit Chance',
 strength:'Strength',dexterity:'Dexterity',intelligence:'Intelligence',
 crit_damage:'Crit Damage',exp_gain:'EXP Gain',gold_gain:'Gold Gain',pet_mastery_level:'Pet Mastery Level'
});
