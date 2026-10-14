/* Verified October 9, 2026 IdleArc Season 2 config snapshot.
   Base-item slot/class restrictions and Drop Bonus tier ranges are copied from
   IdleArc_2026-10-09_game_config.json. This is not live game data.
   The snapshot does NOT specify Drop Bonus type restrictions per equipment slot. */
export const GEAR_SOURCE='IdleArc config · 2026-10-09';
const RAW_ITEMS={"Broken Sword":["main_hand",false,[1]],"Rags":["chest",false,null],"Leather Cap":["head",false,null],"Worn Gloves":["hands",false,null],"Sandals of Starszy":["feet",false,null],"Wooden Rod":["main_hand",false,[3]],"Wooden Bow":["main_hand",false,[2]],"Wooden Shield":["off_hand",false,[1]],"Old Book":["off_hand",false,[3]],"Quiver":["off_hand",false,[2]],"Warrior's Belt":["belt",false,null],"Warrior's Ring":["ring",false,null],"Warrior's Amulet":["amulet",false,null],"Ranger's Belt":["belt",false,null],"Ranger's Ring":["ring",false,null],"Ranger's Amulet":["amulet",false,null],"Torch":["torch",false,null],"Adventurer's Ring":["ring",false,null],"Adventurer's Amulet":["amulet",false,null],"Rusty Dagger":["main_hand",false,[4]],"Scholar's Belt":["belt",false,null],"Scholar's Ring":["ring",false,null],"Scholar's Amulet":["amulet",false,null],"Greatsword":["main_hand",true,[1]],"Crossbow":["main_hand",true,[2]],"Grand Staff":["main_hand",true,[3]],"Claws":["main_hand",false,[4]],"Gnarled Stick":["main_hand",true,[5]],"Wardplate":["chest",false,null],"Bloodweave Vest":["chest",false,null],"Harmonic Cuirass":["chest",false,null],"Visionary Hood":["head",false,null],"Beast Crown":["head",false,null],"Sage Diadem":["head",false,null],"Slayer Gauntlets":["hands",false,null],"Berserker Grips":["hands",false,null],"Symbiotic Handwraps":["hands",false,null],"Swiftstride Boots":["feet",false,null],"Grounded Treads":["feet",false,null],"Pathfinder Treads":["feet",false,null]};
const RAW_BONUSES={"fierce":["Fierce","attack_damage_percent",2,{"2":[2,4],"3":[4,7],"4":[7,12],"5":[12,18],"6":[18,26],"7":[26,34],"8":[34,42],"9":[42,50]}],"precise":["Precise","critical_strike_chance",2,{"2":[2,3],"3":[3,5],"4":[5,8],"5":[8,12],"6":[12,19],"7":[19,30],"8":[30,47],"9":[47,75]}],"brutal":["Brutal","crit_damage",2,{"2":[2,3],"3":[3,5],"4":[5,8],"5":[8,12],"6":[12,19],"7":[19,30],"8":[30,47],"9":[47,75]}],"relentless":["Relentless","double_hit_chance",3,{"3":[2,4],"4":[4,7],"5":[7,11],"6":[11,17],"7":[17,28],"8":[28,46],"9":[46,75]}],"devastating":["Devastating","double_damage_chance",3,{"3":[2,4],"4":[4,7],"5":[7,11],"6":[11,17],"7":[17,28],"8":[28,46],"9":[46,75]}],"companions":["Companion's","pet_damage_bonus",2,{"2":[2,4],"3":[5,8],"4":[9,14],"5":[15,22],"6":[22,32],"7":[32,40],"8":[40,50],"9":[50,64]}],"slayers":["Slayer's","boss_damage_bonus",4,{"4":[5,10],"5":[10,18],"6":[18,28],"7":[28,36],"8":[36,43],"9":[43,50]}],"fortified":["Fortified","max_health_percent",2,{"2":[2,4],"3":[4,7],"4":[7,12],"5":[12,18],"6":[18,26],"7":[26,35],"8":[35,45],"9":[45,60]}],"armored":["Armored","defense_percent",2,{"2":[2,4],"3":[4,7],"4":[7,12],"5":[12,18],"6":[18,26],"7":[26,35],"8":[35,45],"9":[45,60]}],"resilient":["Resilient","damage_reduction",3,{"3":[0.5,1],"4":[1,2],"5":[2,4],"6":[4,6],"7":[6,8],"8":[8,11],"9":[11,15]}],"evasive":["Evasive","dodge_chance",4,{"4":[1,2],"5":[2,4],"6":[4,6],"7":[6,8],"8":[8,11],"9":[11,15]}],"vampiric":["Vampiric","life_on_hit",2,{"2":[1,1],"3":[2,2],"4":[3,4],"5":[5,7],"6":[8,11],"7":[11,15],"8":[15,21],"9":[22,30]}],"draining":["Draining","life_on_kill",2,{"2":[3,6],"3":[7,14],"4":[15,25],"5":[26,40],"6":[40,60],"7":[60,90],"8":[90,134],"9":[134,200]}],"bloodthirsty":["Bloodthirsty","bloodthirst_percent",5,{"5":[5,10],"6":[11,15],"7":[16,18],"8":[19,21],"9":[22,25]}],"prosperous":["Prosperous","gold_gain",2,{"2":[2,5],"3":[5,10],"4":[10,16],"5":[16,25],"6":[25,38],"7":[38,53],"8":[53,73],"9":[73,100]}],"scholarly":["Scholarly","exp_gain",2,{"2":[2,4],"3":[4,7],"4":[7,12],"5":[12,18],"6":[18,26],"7":[26,37],"8":[37,53],"9":[53,75]}],"scavengers":["Scavenger's","item_drop_chance",3,{"3":[1,3],"4":[3,5],"5":[5,8],"6":[8,12],"7":[12,17],"8":[17,23],"9":[23,32]}],"thorned":["Reflecting","thorns_damage",2,{"2":[2,4],"3":[4,7],"4":[7,12],"5":[12,18],"6":[18,26],"7":[26,34],"8":[34,42],"9":[42,50]}],"lucky":["Lucky","lucky_tier_chance",4,{"4":[1,3],"5":[3,6],"6":[6,9],"7":[9,12],"8":[12,15],"9":[15,20]}],"elemental_surge":["Elemental Surge","elemental_amp",4,{"4":[3,6],"5":[6,10],"6":[10,15],"7":[15,21],"8":[21,29],"9":[29,40]}],"frenzy":["Frenzy","extra_kill_chance",5,{"5":[2,4],"6":[4,6],"7":[6,8],"8":[8,11],"9":[11,15]}]};
export const RARITIES=Object.freeze(['Normal','Uncommon','Rare','Epic','Legendary','Infernal']);
export const CLASS_CODES=Object.freeze({Warrior:1,Archer:2,Mage:3,Rogue:4,Druid:5});
const slug=s=>String(s).toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const GEAR_ITEMS=Object.freeze(Object.entries(RAW_ITEMS).map(([name,[slot,twoHanded,allowedClasses]])=>Object.freeze({id:'game:item:'+slug(name),name,slot,twoHanded,allowedClasses})));
export const DROP_BONUSES=Object.freeze(Object.entries(RAW_BONUSES).map(([id,[name,stat,minTier,values]])=>Object.freeze({id,name,stat,minTier,values})));
const BY_ID=new Map(GEAR_ITEMS.map(g=>[g.id,g]));
const BY_NAME=new Map(GEAR_ITEMS.map(g=>[slug(g.name),g]));
export function baseItem(value){
 const id=typeof value==='string'?value:typeof value?.id==='string'?value.id:'';
 return BY_ID.get(id)||BY_NAME.get(slug(id.replace(/^game:item:/,'')))||null;
}
export function equipmentId(value){return typeof value==='string'?value:(typeof value?.id==='string'?value.id:null);}
export const normalizedSlot=slot=>slot==='ring2'?'ring':slot==='charm2'?'charm':slot==='weapon'?'main_hand':slot==='offhand'?'off_hand':slot==='neck'?'amulet':slot;
export function allowedItem(item,slot,className='Warrior'){
 const gear=baseItem(item);
 return !!gear&&gear.slot===normalizedSlot(slot)&&(!gear.allowedClasses||gear.allowedClasses.includes(CLASS_CODES[className]));
}
export function allowedGearForSlot(slot,className='Warrior'){
 return GEAR_ITEMS.filter(gear=>allowedItem(gear,slot,className));
}
export function asGear(value){
 if(!value)return null;
 const id=equipmentId(value),base=baseItem(id);
 if(!base)return typeof value==='string'?{id,rarity:null,awaken:0,bonusId:null,bonusTier:null,roll:null}:null;
 if(typeof value==='string')return {id:base.id,rarity:null,awaken:0,bonusId:null,bonusTier:null,roll:null};
 const rarity=Number.isInteger(Number(value.rarity))&&Number(value.rarity)>=1&&Number(value.rarity)<=6?Number(value.rarity):null;
 const awaken=rarity===6&&Number.isInteger(Number(value.awaken))?Math.max(0,Math.min(30,Number(value.awaken))):0;
 const bonusTier=Number.isInteger(Number(value.bonusTier))&&Number(value.bonusTier)>=2&&Number(value.bonusTier)<=9?Number(value.bonusTier):null;
 const bonusId=DROP_BONUSES.some(b=>b.id===value.bonusId)?value.bonusId:null;
 const roll=value.roll===null||value.roll===undefined||value.roll===''?null:Number(value.roll);
 return {id:base.id,rarity,awaken,bonusId,bonusTier,roll:Number.isFinite(roll)?roll:null};
}
export function newGear(id){const gear=baseItem(id);return gear?{id:gear.id,rarity:2,awaken:0,bonusId:null,bonusTier:2,roll:null}:null;}
export function bonusRange(bonusId,tier){
 const bonus=DROP_BONUSES.find(v=>v.id===bonusId),t=Number(tier);
 return bonus&&t>=bonus.minTier&&t<=9?bonus.values[String(t)]||null:null;
}
export function bonusUnit(stat){return ['life_on_hit','life_on_kill'].includes(stat)?'':'%';}
export function gearIssues(value,slot,className,equipment={}){
 const errors=[],v=asGear(value),item=baseItem(v);
 if(!item)return ['Item not found in verified Season 2 equipment catalog'];
 if(!allowedItem(item,slot,className))errors.push('This item cannot be equipped in the selected slot by '+className);
 if(v.rarity!==null&&(!Number.isInteger(v.rarity)||v.rarity<1||v.rarity>6))errors.push('Invalid rarity');
 if(v.awaken&&v.rarity!==6)errors.push('Awakening requires Infernal rarity');
 if(v.bonusId){const range=bonusRange(v.bonusId,v.bonusTier);if(!range)errors.push('Drop Bonus does not exist at this bonus tier');else if(v.roll!==null&&(v.roll<range[0]||v.roll>range[1]))errors.push('Drop Bonus roll is outside the verified range');}
 if(v.rarity===1&&v.bonusId)errors.push('Normal-item Drop Bonuses require a verified boosted-drop case');
 if(item.slot==='off_hand'&&baseItem(equipment.weapon)?.twoHanded)errors.push('A two-handed main-hand weapon occupies the off-hand slot');
 return errors;
}
export function gearLabel(raw){
 const v=asGear(raw);if(!v)return '';
 return v.rarity?(v.awaken?'A'+v.awaken:RARITIES[v.rarity-1]):'Tier not selected';
}
