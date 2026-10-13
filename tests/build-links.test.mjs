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
