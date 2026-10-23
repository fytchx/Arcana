import test from 'node:test';
import assert from 'node:assert/strict';
import {shareBuildToken,openBuildToken} from '../src/build-links.js';

test('Guest builds can be shared without accounts or a server',async()=>{
 const original={id:'local-draft',title:'Warrior test',summary:'A player-defined character',className:'Warrior',
 equipment:{weapon:'game:item:claws',head:'game:item:rags',chest:null},skills:[],runes:['Fury'],pets:[],
 runeBoard:[],petBonusTargets:['pet_damage',null,null,null],monsterLevel:100,notes:'An optional personal note.'};
 const token=await shareBuildToken(original);
 assert.ok(/^[ug]\.[a-zA-Z0-9_-]+$/.test(token));
 assert.ok(token.length<7500);
 const recovered=await openBuildToken(token);
 assert.equal(recovered.title,'Warrior test');
 assert.equal(recovered.equipment.weapon,'game:item:claws');
 assert.equal(recovered.monsterLevel,100);
 assert.equal(recovered.notes,original.notes);
 assert.equal(recovered.id,'shared-build');
 assert.equal(recovered.version,'SHARED');
 assert.equal(recovered.petBonusTargets[0],'pet_damage');
});
test('Reject malformed and oversized guest links',async()=>{
 await assert.rejects(()=>openBuildToken('not-a-build'),/Invalid shared build/);
 await assert.rejects(()=>openBuildToken('g.'+'a'.repeat(8000)),/Invalid shared build/);
 await assert.rejects(()=>openBuildToken('u.'+'a'.repeat(90)),/link is damaged|Invalid shared build content/);
 await assert.rejects(()=>shareBuildToken({equipment:{},runes:[],notes:'x'.repeat(76000)}),/too large/);
});


test('Configured equipment keeps rarity, awakening, bonus tier and roll in a share link',async()=>{
 const equipment={
  weapon:{id:'game:item:wooden-bow',rarity:6,awaken:17,bonusId:'fierce',bonusTier:8,roll:37},
  ring2:{id:'game:item:adventurers-ring',rarity:5,awaken:0,bonusId:'fierce',bonusTier:7,roll:29}
 };
 const token=await shareBuildToken({id:'configured-gear',title:'Configured gear',className:'Archer',
  equipment,runes:[],runeBoard:[],pets:[],petSetup:[],monsterLevel:100});
 const recovered=await openBuildToken(token);
 assert.deepEqual(recovered.equipment,equipment);
});
