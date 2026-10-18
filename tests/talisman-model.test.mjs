import test from 'node:test';
import assert from 'node:assert/strict';
import {TALISMAN_TYPES,TALISMAN_RULES,TALISMAN_INSCRIPTIONS} from '../src/talisman-reference.js';
import {emptyTalisman,normalizeTalisman,normalizeTalismanLoadout,talismansFromResponse,summarizeTalismans,compareTalismanLoadouts} from '../src/talisman-model.js';
test('config tables match source snapshot: four types, level 0..9, rates, and costs',()=>{
 assert.deepEqual(TALISMAN_TYPES.map(t=>t.slug),['fury','spirit','iron','recovery']);
 assert.equal(TALISMAN_TYPES.find(t=>t.slug==='spirit').stats.pet_damage_bonus[9],66);
 assert.equal(TALISMAN_TYPES.find(t=>t.slug==='fury').stats.attack_power[9],56);
 assert.equal(TALISMAN_TYPES.find(t=>t.slug==='iron').stats.damage_reduction[9],12);
 assert.equal(TALISMAN_RULES.upgradeCosts[8],15000000);
 assert.equal(TALISMAN_RULES.upgradeChances[8],0.12);
 assert.equal(TALISMAN_RULES.inscriptionRarities.common+TALISMAN_RULES.inscriptionRarities.greater+TALISMAN_RULES.inscriptionRarities.perfect,1);
 assert.equal(TALISMAN_INSCRIPTIONS.pet_damage_bonus.values[2],25);
});
test('empty slots do not invent levels, inscriptions or totals',()=>{
 assert.deepEqual(emptyTalisman(),{slug:'',level:null,inscriptions:{}});
 assert.deepEqual(summarizeTalismans().totals,{});
 assert.equal(compareTalismanLoadouts([],[]).hasMeasuredComparison,false);
});
test('normalization retains entered zero but rejects bad stats and unsupported slugs',()=>{
 assert.deepEqual(normalizeTalisman({slug:'bogus',level:22,inscriptions:{pet_damage_bonus:0,broken:100,strength:'oops'}}),{slug:'',level:null,inscriptions:{pet_damage_bonus:0}});
 assert.equal(normalizeTalismanLoadout([{slug:'fury',level:0}]).length,2);
});
test('source-backed base plus optional manually entered inscription totals',()=>{
 const r=summarizeTalismans([{slug:'spirit',level:9,inscriptions:{pet_damage_bonus:85}},{slug:'iron',level:9}]);
 assert.equal(r.totals.pet_damage_bonus,151);
 assert.equal(r.totals.pet_mastery_level,6);
 assert.equal(r.totals.damage_reduction,12);
 assert.equal(r.unresolved.length,0);
});
test('missing levels are unknown, not zero',()=>{
 const r=summarizeTalismans([{slug:'fury',level:null,inscriptions:{pet_damage_bonus:10}}]);
 assert.equal(r.totals.attack_power,undefined);
 assert.equal(r.totals.pet_damage_bonus,10);
 assert.match(r.unresolved[0],/no level/);
});
test('A/B comparisons do not fabricate missing counterpart totals',()=>{
 const a=[{slug:'spirit',level:8,inscriptions:{retaliation_pct:12}}];
 const b=[{slug:'spirit',level:9,inscriptions:{retaliation_pct:20}}];
 const c=compareTalismanLoadouts(a,b);
 assert.equal(c.rows.find(x=>x.stat==='pet_damage_bonus').delta,11);
 assert.equal(c.rows.find(x=>x.stat==='retaliation_pct').delta,8);
 assert.equal(compareTalismanLoadouts(a,[]).rows.find(x=>x.stat==='pet_damage_bonus').delta,null);
});
test('response adapter drops IDs and unrelated character/account data',()=>{
 const r=talismansFromResponse({account_token:'PRIVATE',talismans:[{id:123456,slug:'spirit',level:9,username:'PRIVATE',inscription_totals:{pet_damage_bonus:{total:85}}}]});
 assert.deepEqual(r[0],{slug:'spirit',level:9,inscriptions:{pet_damage_bonus:85}});
 assert.ok(!JSON.stringify(r).includes('PRIVATE')&&!JSON.stringify(r).includes('123456'));
});
