/**
 * Player supplied 28 IdleArc screenshots, captured 2026-10-17 ~16:43-16:49 PDT.
 * ACTUAL OBSERVATIONS, not a recommended/statistically optimized build.
 * Source images remain with the player; no account ID, token, or screenshots
 * embedded in public JS. Fields not visible (class/passive allocation, most
 * rune secondary icon meanings, etc.) are explicitly unknown.
 */
const gear=(slot,id,name,rarity,stage,bonusId,bonusTier,roll,base,affixes,gems=[])=>({
 slot,id,name,rarity,stage,bonusId,bonusTier,roll,
 base,affixes,gems
});
export const WARRIOR_OCT17_GEAR=Object.freeze([
 gear('weapon','game:item:sword','Sword','Legendary','A4','thorned',7,32,'+8,776 Physical Damage',
  ['Critical Chance +36%','Double Damage Chance +36%','Strength +161','Critical Damage +36%','Double Hit Chance +43%'],
  ['Flawless Lapis 91% Lv39','Flawless Lapis 98% Lv38','Flawless Lapis 99% Lv38']),
 gear('offhand','game:item:shield','Shield','Legendary','A4','thorned',6,23.07,'+52% Block Chance',
  ['Critical Damage +43%','EXP Gain +36%','Critical Chance +36%','Damage Reduction +5%','Double Damage Chance +43%']),
 gear('chest','game:item:armor','Armor','Infernal','A4 +8','armored',6,21.7,'+12,355 Defense',
  ['Increased Defense +509%','Double Damage Chance +37%','EXP Gain +41%','Defense +417','Critical Damage +37%'],
  ['Flawless Garnet 85% Lv38','Brilliant Garnet 93% Lv38']),
 gear('head','game:item:sage-diadem','Sage Diadem','Legendary','A4','thorned',5,16.88,'+4,697 Defense; +3 All Class Skills',
  ['Increased Defense +531%','Double Damage Chance +40%','EXP Gain +40%','Critical Damage +40%','Defense +368'],
  ['Brilliant Garnet 98% Lv38','Brilliant Garnet 100% Lv38']),
 gear('torch','game:item:torch','Torch','Epic','A3 +30','armored',4,11.34,'+6 All Class Skills',
  ['Double Damage Chance +36%','Critical Chance +36%','Damage Reduction +5%','EXP Gain +36%','Critical Damage +33%'],
  ['Flawless Jade 80% Lv41','Flawless Jade 95% Lv38','Flawless Jade 99% Lv38','Flawless Jade 100% Lv38']),
 gear('neck','game:item:warriors-amulet',"Warrior's Amulet",'Legendary','A4','thorned',5,15.99,'+292 Strength',
  ['Defense +142%','Double Damage Chance +43%','Double Hit Chance +36%','Strength +134','Critical Chance +40%'],
  ['Brilliant Garnet 97% Lv38']),
 gear('ring2','game:item:warriors-ring',"Warrior's Ring",'Epic','A4','thorned',9,42.24,'+290 Strength',
  ['Defense +142%','Strength +147','Critical Damage +40%','Double Damage Chance +36%','Critical Chance +40%'],
  ['Brilliant Garnet 100% Lv38']),
 gear('belt','game:item:scholars-belt',"Scholar's Belt",'Legendary','A3 +24','thorned',5,17,'+52 All Attributes',
  ['Strength +132','Double Damage Chance +32%','Critical Damage +38%','Double Hit Chance +32%','Defense +121%'],
  ['Brilliant Garnet 99% Lv38','Brilliant Garnet 90% Lv38']),
 gear('ring','game:item:warriors-ring',"Warrior's Ring",'Legendary','A3 +27','thorned',5,17.62,'+263 Strength',
  ['Defense +131%','Strength +134','Double Damage Chance +36%','Critical Damage +33%','Double Hit Chance +33%'],
  ['Brilliant Garnet 99% Lv38']),
 gear('hands','game:item:gloves','Gloves','Infernal','A4','armored',6,18.39,'+6,516 Defense',
  ['Critical Damage +36%','Double Damage Chance +47%','Increased Defense +493%','Defense +405','EXP Gain +36%'],
  ['Brilliant Garnet 91% Lv38','Brilliant Garnet 100% Lv38']),
 gear('feet','game:item:grounded-treads','Grounded Treads','Legendary','A4','thorned',6,24.57,'+4,561 Defense; +20% Block Chance',
  ['Increased Defense +531%','Critical Chance +43%','Double Damage Chance +40%','Critical Damage +36%','Defense +368'],
  ['Flawless Garnet 98% Lv38','Flawless Garnet 88% Lv38'])
]);
const pet=(name,compound,hatch,bonus,shards,affixes)=>({
 equipped:true,name,rarity:'Legendary',compound,
 hatchBonus:hatch,observedHatchPercent:bonus,sharedAffixShards:shards,
 unlockedAffixSlots:4,affixes
});
const aff=(slug,level,label,observedValue)=>({slug,level,label,observedValue});
export const WARRIOR_OCT17_PETS=Object.freeze([
 pet('Crow',3,'increased_strength',14,4114,[
  aff('all_skills',2,'All Class Skills','+2'),aff('extra_kill_chance',1,'Extra Kill Chance','+3%'),
  aff('material_quantity',251,'Material Quantity','+26%'),aff('rune_drops',145,'Rune Drops','+15.4%')]),
 pet('Diablo',12,'retaliation',103,5050,[
  aff('extra_kill_chance',1,'Extra Kill Chance','+3%'),aff('all_skills',2,'All Class Skills','+2'),
  aff('material_quantity',188,'Material Quantity','+19.7%'),aff('rune_drops',277,'Rune Drops','+28.6%')]),
 pet('Wasp',11,'retaliation',93,3772,[
  aff('extra_kill_chance',1,'Extra Kill Chance','+3%'),aff('all_skills',2,'All Class Skills','+2'),
  aff('item_quantity',242,'Item Quantity','+25.1%'),aff('material_quantity',134,'Material Quantity','+14.3%')]),
 pet('Zbakus',10,'retaliation',84,4777,[
  aff('all_skills',2,'All Class Skills','+2'),aff('rune_drops',225,'Rune Drops','+23.4%'),
  aff('material_quantity',200,'Material Quantity','+20.9%'),aff('extra_kill_chance',1,'Extra Kill Chance','+3%')])
]);
// Family letters and levels are readable in the 6×6 screenshot (preset 3).
// Original secondary rune symbols are not mapped to canonical UI secondary IDs
// from this capture, so do NOT synthesize Rune Forge secondary choices.
const runeRows=[
 [['F',64],['V',64,2],['F',64],['W',64],['W',64]],
 [['V',64],['F',64],['F',64],['F',64],['V',64],['P',64]],
 [['F',64],['V',64],['V',64],['V',64],['F',64],['F',63]],
 [['F',64],['F',64],['F',64],['F',64],['V',64],['V',63]],
 [['F',64],['V',64],['F',64],['V',63],['F',64],['F',64]],
 [['F',64],['F',64],['V',64],['W',64],['P',64],['W',64]]
];
const family={F:'Fury',V:'Vitality',W:'Wisdom',P:'Precision'};
export const WARRIOR_OCT17_RUNE_GRID=Object.freeze(runeRows.flatMap((row,y)=>{
 let x=0;return row.map(([letter,level,width=1])=>{
  const result={x,y,width,level,family:family[letter],secondary:'not independently verified from screenshot'};
  x+=width;return result;
 });
}));
const sacrifices={
 'Double Damage Chance':'+10%','Double Hit Chance':'+10%',
 Strength:'+50',Dexterity:'+50',Intelligence:'+50',
 'Crit Damage':'+75%','EXP Gain':'+50%','Gold Gain':'+50%'
};
export const WARRIOR_OCT17_OBSERVED=Object.freeze({
 captured:'2026-10-17',source:'28 player-submitted in-game screenshots',
 status:'Player-observed snapshot, not inferred game mechanics',
 player:{handle:'[OVK] Fycth',className:'Warrior',characterLevel:265,monsterLevel:220,gearScore:3030},
 stats:{
  maxHealth:231100,attackMin:30770000,attackMax:43520000,defense:28560000,
  damageReductionPercent:97.7,damageReductionRawPercent:122.1,
  strengthDisplayed:'2.79K',dexterity:152,intelligence:218,
  critChancePercent:386.2,critDamagePercent:1470,doubleHitChancePercent:294,
  doubleDamageChancePercent:656,dodgeChancePercent:0,
  blockChancePercent:97,blockChanceRawPercent:110,bossDamagePercent:100,
  retaliationMin:151200000000,retaliationMax:216000000000,
  retaliationAverage:183630000000
 },
 guild:{name:'[PDX] Paradox',bonusPct:{attack:77.8,petDamage:77.8,retaliation:77.8,flatAttack:1005,flatPet:2130,defense:35},boostPercent:50},
 equipment:WARRIOR_OCT17_GEAR,
 pets:WARRIOR_OCT17_PETS,
 runes:{preset:3,columns:6,rows:6,grid:WARRIOR_OCT17_RUNE_GRID,secondaryIconsVerified:false,
  summedBonuses:['Defense +4,034','Retaliation +358.8%','Attack Damage +1,906',
   'Strength +184','Critical Chance +28.5%','Max Health +6,696',
   'EXP Gain +282.4%','Double Hit Chance +5.6%','Dodge Chance +16.0%',
   'Attack Damage +38.3%','Intelligence +51']},
 talismans:[
  {name:'Talisman of Fury',rank:9,maxLevel:true,stats:['Attack Damage +56%','Crit Chance +11%'],
   inscriptions:25,inscribed:[
    'EXP Gain (2) +20%','Strength (8) +82','Crit Damage (2) +25%',
    'Attack Damage (2) +16%','Intelligence (1) +15','Life on Kill (1) +18',
    'Retaliation (3) +36%','Damage Reduction (1) +0.5%',
    'Double Hit Chance (1) +15%','Double Damage Chance (3) +33%','Crit Chance (1) +25%'],
   sacrifices},
  {name:'Talisman of Iron',rank:9,maxLevel:true,stats:['Max Health +290','Damage Reduction +12%'],
   inscriptions:16,inscribed:[
    'EXP Gain (3) +28%','Strength (6) +57','Crit Damage (1) +15%',
    'Retaliation (2) +16%','Double Hit Chance (2) +15%',
    'Double Damage Chance (2) +15%'],sacrifices}
 ],
 skillTree:{allocationVerified:false,visibleEffects:['Deflection','Bulwark Stance'],
  note:'No class skill point allocation screenshot supplied. Existing build focus labels are carried as references only, not verified allocations.'},
 passiveTree:{allocationVerified:false,note:'No passive point allocation screenshot supplied.'},
 unresolved:[
  'Skill tree node ranks and passive tree allocations were not supplied.',
  'Rune family, placement and levels are visible; secondary rune icons are not mapped to canonical Studio secondary IDs.',
  'The Build Studio slot schema has no gem socket or talisman editor; observed details appear in the audit panel rather than as editable game objects.',
  'Equipment letter stage and enhancement +level are recorded exactly in the audit, but the present rarity/awaken picker does not express every observed combination.'
 ]
});
export const WARRIOR_OCT17_BUILD=Object.freeze({
 id:'warrior-retaliation-zane',
 title:'Zane’s Retaliation Warrior · October 17, 2026',
 className:'Warrior',owner:'Zane (kiffens_)',version:'PLAYER SCREENSHOT',
 characterLevel:265,monsterLevel:220,
 summary:'Lv 265 · ML 220 · GS 3,030 · 28.56M Defense · 97% Block · observed 151.2B–216B Retaliation.',
 equipment:Object.fromEntries(WARRIOR_OCT17_GEAR.map(x=>[
  x.slot,{id:x.id,rarity:x.rarity==='Infernal'?6:x.rarity==='Legendary'?5:4,
    awaken:x.rarity==='Infernal'?4:0,bonusId:x.bonusId,bonusTier:x.bonusTier,roll:x.roll}
 ])),
 skills:['Deflection','Bulwark Stance'],
 runes:[...new Set(WARRIOR_OCT17_RUNE_GRID.map(x=>x.family))],
 runeBoard:[], // Never invent unverified secondary stats to satisfy a shape UI.
 petSetup:WARRIOR_OCT17_PETS.map(p=>({
  equipped:true,name:p.name,hatchBonus:p.hatchBonus,compound:p.compound,unlockedAffixSlots:4,
  affixes:p.affixes.map(({slug,level})=>({slug,level}))
 })),
 pets:WARRIOR_OCT17_PETS.map(p=>p.name),
 passiveAlloc:{},classAllocById:{},
 observed:WARRIOR_OCT17_OBSERVED,
 notes:'October 17 real-player screenshot import. Equipped gear, four pets, talismans, gem details, observed 6×6 rune positions and combat stats are documented in the observed build audit. Skill/passive point allocations and exact rune secondary icons are NOT established by this capture. No unverified values were fabricated.'
});
