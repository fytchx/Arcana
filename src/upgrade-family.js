/* Arcana equipment families: one Codex base ID controls rarity and Awakened appearances.
 * Variants from the verified October 21 game config; artwork from official Codex atlases. */
import {OPTIMIZER_ITEMS,OPTIMIZER_CHOICES,OPTIMIZER_ITEM_BY_ID,optimizerStatLabel} from './upgrade-optimizer-data.js';
import {optimizerTierRanges} from './upgrade-optimizer-tier-data.js';
import {codexOfficialArt} from './assets.js';

export const FAMILY_ITEMS=OPTIMIZER_ITEMS;
const rarityNames=['Normal','Uncommon','Rare','Epic','Legendary','Infernal'];
const tierCfg=[[1,5],[1.2,4],[1.4,6],[1.7,7],[2,9],[2.5,11]];
export const slotTitle=slot=>({main_hand:'Weapons',off_hand:'Offhands',chest:'Chest Armor',head:'Helmets',hands:'Gloves',feet:'Boots',belt:'Belts',ring:'Rings',amulet:'Amulets',torch:'Torches'})[slot]||'Equipment';
export const rarityName=tier=>rarityNames[Math.max(0,Math.min(5,Number(tier||1)-1))];
const variantsById=new Map(FAMILY_ITEMS.map(item=>{
 const entries=OPTIMIZER_CHOICES.filter(c=>c.itemId===item.id);
 const awakened=entries.find(x=>x.awakened)?.label||null;
 return [item.id,{entries,awakened}];
}));
export const familyById=id=>OPTIMIZER_ITEM_BY_ID.get(id)||null;
export function familyVariant(id,point){
 const item=familyById(id);
 if(!item)return null;
 const rarity=Math.max(1,Math.min(6,Number(point?.rarity)||6));
 const rank=rarity===6?Math.max(0,Math.min(30,Number(point?.awaken)||0)):0;
 const variants=variantsById.get(id);
 const tierEntry=variants?.entries.find(x=>x.tier===rarity&&!x.awakened);
 const name=rank>0?(variants?.awakened||tierEntry?.label||item.name):tierEntry?.label||item.name;
 return {id,name,baseName:item.name,rarity,rank,tierLabel:rank?'Awakened A'+rank:rarityName(rarity),slot:item.slot,primary:item.primary,secondary:item.secondary};
}
export function familyArtwork(id,point,px=64){
 const v=familyVariant(id,point);
 // These in-game display names differ from the keys in the supplied
 // official equipment atlas. Both aliases refer to verified artwork entries.
 const artTitle=v?.name==='Sandals of Starszy'?'Sandals':v?.name==='Steel Plate Gauntlets'?'Steel Plate Gloves':v?.name==='Gilded Plate Gauntlets'?'Gilded Plate Gloves':v?.name;
 return v?codexOfficialArt({id:'game:item:'+id,kind:'item',title:artTitle},px):'<span class="gameArt gameArt-missing">◇</span>';
}
const softLevels=(rank,level)=>{
 // The config specifies a level-90 enhancement softcap. An A-rank begins at
 // its preceding 30-level checkpoint; it must not lose every prior level's
 // estimated contribution just because the displayed +level resets to zero.
 const count=Math.max(0,Math.min(30,rank))*30+Math.max(0,Math.min(30,level));
 return count<=90?count:90+(count-90)*.5;
};
const UNITS_WITHOUT_GENERIC_ENHANCEMENT=new Set([
 'all_skills','helm_all_skills','pet_mastery_level'
]);
// The Gnarled Stick still displays +50% Pet Damage at A10 +24 in the
// October 24 in-game capture. This is its fixed secondary implicit, not an
// ordinary Pet Damage affix. Do not apply generic Awakening growth to it.
const VERIFIED_FIXED_SECONDARIES=new Set(['stick_pet_damage']);
const RATE_IMPLICITS=new Set([
 'block_chance','crit_damage','crit_chance','claw_crit_chance',
 'helm_crit_chance','glove_crit_chance','boots_double_hit','boots_block_chance',
 'flat_damage_reduction','attack_pet_damage','stick_pet_damage',
 'glove_attack_damage','helm_pet_damage','gold_exp_gain'
]);
const scaleRange=(src,tier,rank,level,secondary=false)=>{
 const cfg=tierCfg[tier-1];
 const increment=cfg?.[1]||0;
 if(secondary&&VERIFIED_FIXED_SECONDARIES.has(src.stat))return {min:src.min,max:src.max,confidence:'verified-fixed'};
 // Several side-grade bonuses have a single tier value, but the available
 // config does not establish whether every one scales after Infernal. Keep
 // them visible without inventing an A-rank projection.
 if(secondary&&src.min===src.max)return {min:src.min,max:src.max,confidence:'tier-only'};
 // 12% per Awakening rank is explicit. The game's complete implicit operation
 // order/roll identity is not in config, so these are projections, never exact rolls.
 // An all-skills or mastery implicit must never receive a fabricated +11 per
 // enhancement. Rate-type implicits likewise cannot gain eleven percentage
 // points per level. Only flat values use the configured generic increment.
 const special=UNITS_WITHOUT_GENERIC_ENHANCEMENT.has(src.stat);
 const rate=RATE_IMPLICITS.has(src.stat);
 const factor=special?1:1+rank*.12;
 const add=special||rate?0:increment*softLevels(rank,level);
 return {min:Math.ceil((src.min+add)*factor),max:Math.ceil((src.max+add)*factor),
  confidence:special?'tier-only':rate?'awakening-estimate':'range-estimate'};
};
export function projectedStats(id,point){
 const item=familyById(id);
 if(!item)return null;
 const tier=Math.max(1,Math.min(6,Number(point?.rarity)||6));
 const rank=tier===6?Math.max(0,Math.min(30,Number(point?.awaken)||0)):0;
 const lv=Math.max(0,Math.min(tier===6?30:[4,9,14,19,24,30][tier-1],Number(point?.level)||0));
 const base=optimizerTierRanges(id,tier);
 if(!base)return null;
 const primary=scaleRange(base.primary,tier,rank,lv);
 const secondary=base.secondary?scaleRange(base.secondary,tier,rank,lv,true):null;
 return {id,tier,rank,level:lv,primary:{...primary,stat:item.primary,label:optimizerStatLabel(item.primary)},secondary:secondary?{...secondary,stat:item.secondary,label:optimizerStatLabel(item.secondary)}:null};
}
const mid=x=>Math.round((x.min+x.max)/2);
export function projectedGain(id,from,to){
 const a=projectedStats(id,from),b=projectedStats(id,to);
 if(!a||!b)return null;
 const compare=(left,right)=>right?{label:left.label,from:mid(left),to:mid(right),delta:mid(right)-mid(left),minimum:Math.min(right.min-left.min,right.max-left.max),maximum:Math.max(right.min-left.min,right.max-left.max)}:null;
 return {primary:compare(a.primary,b.primary),secondary:a.secondary&&b.secondary?compare(a.secondary,b.secondary):null,range:{from:a,to:b}};
}
export const familyIdsForSlot=slot=>FAMILY_ITEMS.filter(x=>!slot||x.slot===slot).map(x=>x.id);
