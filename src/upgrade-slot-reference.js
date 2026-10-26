/* Arcana equipment reference, grounded in verified game config.
 * In IdleArc, slot Awakening is permanent and independent of equipped item's
 * cosmetic rarity. This module intentionally makes NO claim about exact A1
 * displayed values or the order of stat multiplications/rounding. */
import {OPTIMIZER_ITEMS,OPTIMIZER_ITEM_BY_ID} from './upgrade-optimizer-data.js';
import {optimizerTierRanges} from './upgrade-optimizer-tier-data.js';
import {EQUIPMENT_AFFIXES} from './upgrade-optimizer-projections.js';

export const SLOT_SCALE_EVIDENCE=Object.freeze({
 itemRanges:'IdleArc 1.3.8 / game config 2026-10-21-003',
 affixRanges:'complete config 2026-09-30-001 (26 ordinary affixes)',
 awakeningPerRank:0.12,
 affixEnhancementPerLevel:0.03,
 individualAffixBoostPerRank:0.10,
 enhancementSoftcapStart:90,
 enhancementSoftcapRate:0.5,
 // The config contains six item tier ranges, not an unambiguous A1+0 stat
 // table for persistent equipment slots. Never relabel T6 as A1.
 exactA1BaselineKnown:false,
 exactDisplayFormulaVerified:false
});
const slotType={main_hand:'weapon',off_hand:'shield',chest:'chest_armor',head:'helmet',hands:'gloves',feet:'boots',belt:'belt',ring:'ring',amulet:'amulet',torch:'torch'};
export const allBaseItemReferences=()=>OPTIMIZER_ITEMS.map(item=>baseItemReference(item.id));
export function baseItemReference(id){
 const item=OPTIMIZER_ITEM_BY_ID.get(id);if(!item)return null;
 const tier6=optimizerTierRanges(id,6);
 const legal=EQUIPMENT_AFFIXES.filter(a=>a.types.includes('all')||a.types.includes(slotType[item.slot]));
 return Object.freeze({
  id:item.id,name:item.name,slot:item.slot,
  baseStat:{...tier6.primary},secondaryStat:tier6.secondary?{...tier6.secondary}:null,
  affixIds:legal.map(a=>a.id),
  baseRangeLabel:'T6 / Infernal source-table range, NOT verified A1 +0',
  cosmeticRarityAffectsSlotProgression:false
 });
}
export const allAffixRollReferences=()=>EQUIPMENT_AFFIXES.map(a=>Object.freeze({
 id:a.id,name:a.name,stat:a.stat,kind:a.kind,baseMin:a.min,baseMax:a.max,legalTypes:[...a.types],
 maxRollQualityAssumed:true,exactA1DisplayedMaxVerified:false
}));
export function maxRolledAffixReference(affixId){
 const affix=EQUIPMENT_AFFIXES.find(x=>x.id===Number(affixId));
 return affix?Object.freeze({affixId:affix.id,stat:affix.stat,unscaledBaseMax:affix.max,
  knownIndividualRankBoost:SLOT_SCALE_EVIDENCE.individualAffixBoostPerRank,
  note:'Base roll cap from config. Not a calculated displayed A1 or A-rank value.'}):null;
}
export function normalizeEquipmentSlotProgression(value={}){
 const awaken=Math.max(1,Math.min(30,Math.trunc(Number(value.awaken)||1)));
 const level=Math.max(0,Math.min(30,Math.trunc(Number(value.level)||0)));
 return Object.freeze({awaken,level});
}
