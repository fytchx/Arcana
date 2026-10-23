import test from 'node:test';
import assert from 'node:assert/strict';
import {PET_RULES_2026_10_09 as RULES} from '../src/pet-rule-snapshot.js';
import {petBonusEntries,compoundBonus,compoundRoundUp,normalizeCompoundPlan,affixCost,normalizeAffixCostPlan,normalizedPetBonusTargets,
 readCompoundPlan,saveCompoundPlan,readAffixCostPlan,saveAffixCostPlan} from '../src/pet-simple-math.js';
import {simpleCompoundCalculatorView,simpleAffixCostView} from '../src/pet-simple-views.js';
import {normalizeBuild} from '../src/labs-engine.js';
test('source snapshot preserves all pet bonuses, all affixes, caps and costs',()=>{
 assert.equal(RULES.source.file,'IdleArc_2026-10-09_game_config.json');
 assert.equal(RULES.pet_bonuses.legendary.length,23);
 assert.equal(RULES.pet_bonuses.uncommon.length,12);
 assert.equal(RULES.pet_affixes.length,9);
 assert.equal(RULES.pet_evolve.level_cost_divisor,20);
 assert.equal(RULES.pet_evolve.all_skills_upgrade_cost,1000);
 assert.equal(RULES.pet_compound.equalisation.k_by_realm.seasonal,10);
 assert.equal(RULES.pet_compound.equalisation.k_by_realm.permanent,25);
});
test('Compound calculations match game-observed C10 examples',()=>{
 const legendary=compoundBonus({rarity:'legendary',bonus:'pet_damage',level:10});
 assert.equal(legendary.base,15);
 assert.equal(legendary.amount,101);
 assert.equal(legendary.unit,'%');
 assert.equal(compoundBonus({rarity:'legendary',bonus:'pet_damage',level:30}).amount,714); // Matches the in-game Dragon +30 value.
 assert.equal(compoundRoundUp(714*1.07),764); // 714 × 1.07 = 763.98
 assert.equal(compoundRoundUp(766.01),767);
 const normal=compoundBonus({rarity:'uncommon',bonus:'dodge',level:10});
 assert.equal(normal.base,2);
 assert.equal(normal.amount,12);
 assert.equal(compoundBonus({rarity:'legendary',bonus:'pet_damage',level:0}).amount,15);
});
test('rarity dropdown limits compound preview where rarity caps exist',()=>{
 assert.equal(normalizeCompoundPlan({rarity:'uncommon',bonus:'dodge',level:900}).level,10);
 assert.equal(normalizeCompoundPlan({rarity:'rare',bonus:'defense',level:900}).level,20);
 assert.equal(normalizeCompoundPlan({rarity:'epic',bonus:'defense',level:900}).level,30);
 assert.equal(petBonusEntries('legendary').length,23);
});
test('target affix level math uses divisor and special ACS cost',()=>{
 assert.equal(affixCost({affix:'item_quantity',currentLevel:95,targetLevel:96}).shards,5);
 assert.equal(affixCost({affix:'item_quantity',currentLevel:1,targetLevel:20}).shards,19);
 assert.equal(affixCost({affix:'item_quantity',currentLevel:19,targetLevel:21}).shards,3);
 assert.equal(affixCost({affix:'all_skills',currentLevel:1,targetLevel:2}).shards,1000);
 assert.equal(affixCost({affix:'extra_kill_chance',currentLevel:1,targetLevel:99}).shards,0);
 assert.equal(affixCost({affix:'item_quantity',currentLevel:1,targetLevel:1}).nextUpgrade,1);
 assert.equal(affixCost({affix:'ruby_drops',currentLevel:1,targetLevel:3}).rerollShards,5);
});
test('affix plan clamps level and never computes negative costs',()=>{
 assert.deepEqual(normalizeAffixCostPlan({affix:'all_skills',currentLevel:1,targetLevel:123}),{affix:'all_skills',currentLevel:1,targetLevel:2});
 assert.deepEqual(normalizeAffixCostPlan({affix:'gold_gain',currentLevel:100,targetLevel:20}),{affix:'gold_gain',currentLevel:100,targetLevel:100});
 assert.equal(affixCost({affix:'gold_gain',currentLevel:100,targetLevel:20}).shards,0);
});
test('calculators save separately and migrate old affix choice',()=>{
 const records=new Map();const storage={getItem:k=>records.get(k)||null,setItem:(k,v)=>records.set(k,v)};
 saveCompoundPlan({rarity:'legendary',bonus:'pet_damage',level:15},storage);
 saveAffixCostPlan({affix:'ruby_drops',currentLevel:20,targetLevel:45},storage);
 assert.equal(readCompoundPlan(storage).level,15);
 assert.equal(readAffixCostPlan(storage).targetLevel,45);
 assert.equal(readAffixCostPlan(storage).affix,'ruby_drops');
 const oldData=new Map([['arcana-affix-planner-v1',JSON.stringify({affix:'gold_gain',level:11})]]);
 const prior={getItem:k=>oldData.get(k)||null,setItem:(k,v)=>oldData.set(k,v)};
 assert.equal(readAffixCostPlan(prior).targetLevel,11);
});
test('Build Studio preserves old pet details while exposing exactly four desired bonus targets',()=>{
 const old={equipment:{},runes:[],pets:[],petSetup:[{equipped:true,name:'Bober',dropBonus:101,hatchBonus:'pet_damage',affixes:[{slug:'all_skills',level:1}],compound:15}]};
 const normalized=normalizeBuild(old);
 assert.deepEqual(normalized.petBonusTargets,['pet_damage','','','']);
 assert.equal(normalized.petSetup[0].name,'Bober');
 assert.equal(normalized.petSetup[0].dropBonus,101);
 assert.equal(normalized.petSetup[0].compound,15);
 const copied=normalizeBuild({...normalized,petBonusTargets:['pet_damage','attack_damage','increased_strength','critical_damage']});
 assert.deepEqual(copied.petBonusTargets,['pet_damage','attack_damage','increased_strength','critical_damage']);
 assert.equal(copied.petSetup[0].name,'Bober');
 assert.deepEqual(normalizedPetBonusTargets(copied),copied.petBonusTargets);
});
test('simplified views prioritize results, targets, and honest limits',()=>{
 const compound=simpleCompoundCalculatorView({rarity:'legendary',bonus:'pet_damage',level:10});
 assert.match(compound,/101%/);
 assert.match(compound,/No manual base bonus required/);
 assert.equal((compound.match(/id="petCompoundRarity"/g)||[]).length,1);
 const costs=simpleAffixCostView({affix:'all_skills',currentLevel:1,targetLevel:2});
 assert.match(costs,/1,000/);
 assert.match(costs,/Pet Shards/);
 assert.match(costs,/not/);
 assert.equal((costs.match(/id="petAffixTarget"/g)||[]).length,1);
});
