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
 const named=entries.map(e=>e.label);
 const matches=entries.filter(x=>x.tier===6);
 const inferred=matches.length>1?matches[matches.length-1].label:null;
 return [item.id,{entries,named,awakened:inferred&&inferred!==matches[0]?.label?inferred:null}];
}));
export const familyById=id=>OPTIMIZER_ITEM_BY_ID.get(id)||null;
export function familyVariant(id,point){
 const item=familyById(id);
 if(!item)return null;
 const rarity=Math.max(1,Math.min(6,Number(point?.rarity)||6));
 const rank=rarity===6?Math.max(0,Math.min(30,Number(point?.awaken)||0)):0;
 const variants=variantsById.get(id);
 const tierEntry=variants?.entries.find(x=>x.tier===rarity);
 const name=rank>0?(variants?.awakened||tierEntry?.label||item.name):tierEntry?.label||item.name;
 return {id,name,baseName:item.name,rarity,rank,tierLabel:rank?'Awakened A'+rank:rarityName(rarity),slot:item.slot,primary:item.primary,secondary:item.secondary};
}
export function familyArtwork(id,point,px=64){
 const v=familyVariant(id,point);
 return v?codexOfficialArt({id:'game:item:'+id,kind:'item',title:v.name},px):'<span class="gameArt gameArt-missing">◇</span>';
}
const softLevels=(rank,level)=>{
 // The source explicitly reduces enhancement growth after the effective level-90 cap.
 // A rank adds 30 enhanced levels; each rank’s +0 is its checkpoint.
 const count=Math.max(0,Math.min(30,rank))*30+Math.max(0,Math.min(30,level));
 return count<=90?count:90+(count-90)*.5;
};
const effectiveEnhancement=(rank,level)=>softLevels(rank,level)-softLevels(rank,0);
const scaleRange=(src,tier,rank,level)=>{
 const cfg=tierCfg[tier-1];
 const increment=cfg?.[1]||0;
 // 12% per Awakening rank is explicit. The game's complete implicit operation
 // order/roll identity is not in config, so these are projections, never exact rolls.
 const factor=1+rank*.12;
 const add=increment*effectiveEnhancement(rank,level);
 return {min:Math.ceil((src.min+add)*factor),max:Math.ceil((src.max+add)*factor)};
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
 const secondary=base.secondary?scaleRange(base.secondary,tier,rank,lv):null;
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
