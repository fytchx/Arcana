import test from 'node:test';
import assert from 'node:assert/strict';
import {
 BUILD_STUDIO_DRAFT_KEY,projectBuildStudioDamage,readBuildStudioDamage,
 buildStudioScenarioChanges,
} from '../src/damage-build-studio-bridge.js';

const equipment=(bonusId,roll,id='game:item:warriors-ring',bonusTier=5)=>({
 id,rarity:5,awaken:0,bonusId,bonusTier,roll,
});
const build=equipmentMap=>({className:'Warrior',title:'Warrior tests',equipment:equipmentMap});

test('a verified exact Fierce and Companion roll map to TWO distinct stages',()=>{
 const input=build({
  ring:equipment('fierce',14),
  ring2:equipment('companions',20,'game:item:adventurers-ring'),
 });
 const before=structuredClone(input);
 const x=projectBuildStudioDamage(input);
 assert.equal(x.blockers.length,0);
 assert.equal(x.known,true);
 assert.equal(x.slotCount,2);
 assert.equal(x.rollCount,2);
 const rows=Object.fromEntries(x.rows.map(r=>[r.path,r]));
 assert.equal(rows['attack.layers.dropBonus'].total,14);
 assert.equal(rows['pet.layers.equipmentAffixes'].total,20);
 assert.equal(rows['attack.layers.dropBonus'].parts[0].item,"Warrior's Ring");
 assert.deepEqual(input,before,'must never edit saved Build Studio draft');
});
test('same-channel equipment rolls aggregate INSIDE one stage rather than multiplying independently',()=>{
 const x=projectBuildStudioDamage(build({
  ring:equipment('fierce',14),
  ring2:equipment('fierce',12,'game:item:adventurers-ring'),
 }));
 assert.equal(x.known,true);
 assert.equal(x.rows.length,1);
 assert.equal(x.rows[0].path,'attack.layers.dropBonus');
 assert.equal(x.rows[0].total,26);
 assert.equal(x.rows[0].parts.length,2);
});
test('scenario importer replaces old same-source aggregate, never adds to it',()=>{
 const x=projectBuildStudioDamage(build({ring:equipment('fierce',14)}));
 const b={attack:{layers:{dropBonus:25.4,guild:100}},pet:{layers:{equipmentAffixes:0}}};
 const y=buildStudioScenarioChanges(x,b);
 assert.equal(y.ok,true);
 assert.deepEqual(y.changes,{'attack.layers.dropBonus':14});
 assert.equal(b.attack.layers.dropBonus,25.4);
 assert.equal(b.attack.layers.guild,100);
});
test('missing exact roll and incorrect range block the entire import',()=>{
 const missing=projectBuildStudioDamage(build({ring:equipment('fierce',null)}));
 assert.equal(missing.known,false);
 assert.match(missing.blockers.join(' '),/no exact roll/);
 const invalid=projectBuildStudioDamage(build({ring:equipment('fierce',1000)}));
 assert.equal(invalid.known,false);
 assert.ok(invalid.blockers.length>0);
});
test('unknown item ID or unknown bonus ID never supplies made-up stats',()=>{
 const item=projectBuildStudioDamage(build({ring:equipment('fierce',14,'fake:item')}));
 assert.equal(item.known,false);
 assert.match(item.blockers.join(' '),/unrecognized item/);
 const x=projectBuildStudioDamage(build({ring:equipment('not-real',14)}));
 assert.equal(x.known,false);
 assert.match(x.blockers.join(' '),/unrecognized bonus/);
});
test('non-damage bonus is explicitly skipped rather than treated as zero damage',()=>{
 const x=projectBuildStudioDamage(build({ring:equipment('prosperous',20)}));
 assert.equal(x.known,false);
 assert.equal(x.rows.length,0);
 assert.equal(x.skipped.length,1);
 assert.match(x.skipped[0].reason,/equipment-only subtotal/);
});
test('illegal class slot and unknown class are not imported',()=>{
 const x=projectBuildStudioDamage(build({weapon:equipment('fierce',14,'game:item:wooden-bow')}));
 assert.equal(x.known,false);
 assert.ok(x.blockers.some(x=>x.includes('not valid')));
 const b=build({ring:equipment('fierce',14)});
 b.className='Necromancer';
 assert.equal(projectBuildStudioDamage(b).known,false);
});
test('save key read is explicit and absent draft never manufactures a setup',()=>{
 assert.equal(BUILD_STUDIO_DRAFT_KEY,'arcana-v3-local-build-1');
 assert.equal(readBuildStudioDamage({getItem(){return null}}).known,false);
 const b=build({ring:equipment('fierce',14)});
 const x=readBuildStudioDamage({getItem(key){
  assert.equal(key,BUILD_STUDIO_DRAFT_KEY);return JSON.stringify(b);
 }});
 assert.equal(x.known,true);
});
test('unrecognized or incomplete drafts cannot apply partial results',()=>{
 const x=projectBuildStudioDamage(build({
  ring:equipment('fierce',14),
  ring2:equipment('companions',null,'game:item:adventurers-ring'),
 }));
 assert.equal(x.known,false);
 assert.equal(buildStudioScenarioChanges(x).ok,false);
 assert.deepEqual(buildStudioScenarioChanges(x).changes,{});
});
test('whole-character Crit Damage is excluded rather than overwritten by an item-only subtotal',()=>{
 const x=projectBuildStudioDamage(build({
  head:equipment('brutal',10,'game:item:visionary-hood'),
  chest:equipment('thorned',15,'game:item:wardplate'),
 }));
 assert.equal(x.known,true);
 const paths=x.rows.map(r=>r.path);
 assert.ok(!paths.includes('combat.critDamage'));
 assert.ok(paths.includes('retaliation.baseBonuses.reflectingGear'));
 assert.equal(x.skipped.length,1);
 assert.match(x.skipped[0].reason,/equipment-only subtotal/);
 assert.ok(!paths.some(x=>x.includes('weapon')||x.includes('pet.base')||x.includes('ACS')));
});

test('cannot transfer Warrior gear bonuses over an Archer tooltip snapshot',()=>{
 const x=projectBuildStudioDamage(build({ring:equipment('fierce',14)}));
 const bad=buildStudioScenarioChanges(x,{className:'Archer',attack:{layers:{dropBonus:25}}});
 assert.equal(bad.ok,false);
 assert.match(bad.reason,/does not match/);
 assert.deepEqual(bad.changes,{});
 const allowed=buildStudioScenarioChanges(x,{className:'Warrior',attack:{layers:{dropBonus:25}}});
 assert.equal(allowed.ok,true);
});
