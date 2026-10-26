import test from 'node:test';
import assert from 'node:assert/strict';
import {SLOT_SCALE_EVIDENCE,allBaseItemReferences,allAffixRollReferences,baseItemReference,maxRolledAffixReference,normalizeEquipmentSlotProgression} from '../src/upgrade-slot-reference.js';

test('data catalog has 40 base items and 26 ordinary max-roll affixes',()=>{
 const items=allBaseItemReferences(),affixes=allAffixRollReferences();
 assert.equal(items.length,40);assert.equal(affixes.length,26);
 assert.equal(new Set(items.map(x=>x.id)).size,40);
 assert.equal(new Set(affixes.map(x=>x.id)).size,26);
 assert.ok(items.every(x=>x.baseStat.max>=x.baseStat.min));
 assert.ok(affixes.every(x=>x.baseMax>=x.baseMin));
});
test('the equipment slot progression is independent of cosmetic rarity',()=>{
 const ring=baseItemReference('warriors-ring');
 assert.equal(ring.baseStat.min,100);
 assert.equal(ring.baseStat.max,124);
 assert.equal(ring.cosmeticRarityAffectsSlotProgression,false);
 assert.match(ring.baseRangeLabel,/NOT verified A1/);
 assert.deepEqual(normalizeEquipmentSlotProgression({awaken:5,level:1,rarity:5}),normalizeEquipmentSlotProgression({awaken:5,level:1,rarity:6}));
 assert.deepEqual(normalizeEquipmentSlotProgression({awaken:1,level:0}),{awaken:1,level:0});
});
test('affix coefficients stay separate and are not mistaken for exact display formulas',()=>{
 assert.equal(SLOT_SCALE_EVIDENCE.awakeningPerRank,.12);
 assert.equal(SLOT_SCALE_EVIDENCE.affixEnhancementPerLevel,.03);
 assert.equal(SLOT_SCALE_EVIDENCE.individualAffixBoostPerRank,.10);
 assert.equal(SLOT_SCALE_EVIDENCE.exactA1BaselineKnown,false);
 assert.equal(SLOT_SCALE_EVIDENCE.exactDisplayFormulaVerified,false);
 assert.equal(maxRolledAffixReference(27).unscaledBaseMax,4);
 assert.equal(maxRolledAffixReference(19).unscaledBaseMax,8);
 assert.equal(maxRolledAffixReference(6).unscaledBaseMax,8);
});
