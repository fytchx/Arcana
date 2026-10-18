
import test from 'node:test';
import assert from 'node:assert/strict';
import {emptySandboxCharacter,normalizeSandboxCharacter,normalizeDamageProfile,sandboxCharacterSummary,
  sandboxChangeLedger,compareSandboxCharacters,normalizeSandboxWorkspace,saveSandboxStartingPoint,
  saveSandboxVariant,deleteSandboxVariant} from '../src/sandbox-character.js';

test('blank character has zero measurements, optional talismans and pet slots, no personal fixture',()=>{
 const b=emptySandboxCharacter('Rogue');const s=sandboxCharacterSummary(b);
 assert.equal(b.className,'Rogue');assert.equal(s.knownInputCount,0);
 assert.equal(b.damageProfile.attack.weapon.min,null);
 assert.equal(s.talismans,0);assert.equal(s.pets,0);
});
test('manual zero survives, unknown null does not pretend to be zero',()=>{
 const input=normalizeDamageProfile({attack:{weapon:{min:0,max:null},layers:{guild:10}}});
 assert.equal(input.attack.weapon.min,0);
 assert.equal(input.attack.weapon.max,null);
 assert.equal(input.attack.layers.guild,10);
 const character=normalizeSandboxCharacter({equipment:{},runes:[],damageProfile:input});
 assert.equal(character.damageProfile.attack.weapon.min,0);
});
test('working comparison includes talismans and gear but never fabricates full DPS',()=>{
 const a=emptySandboxCharacter();
 const b=structuredClone(a);
 b.talismans[0]={slug:'fury',level:9,inscriptions:{}};
 b.equipment.weapon={id:'game:item:broken-sword'};
 const result=compareSandboxCharacters(a,b);
 assert.deepEqual(result.changedCategories.sort(),['gear','talismans']);
 assert.equal(result.numbers.attack,null);
 assert.equal(result.numbers.retaliation,null);
 assert.ok(result.warning.includes('not invented'));
});
test('measured attack change uses known complete ranges without substituting gear stats',()=>{
 const a=emptySandboxCharacter(),b=structuredClone(a);
 a.damageProfile.attack.weapon={min:100,max:200};
 a.damageProfile.attack.jewelry={min:0,max:0};
 b.damageProfile.attack.weapon={min:110,max:220};
 b.damageProfile.attack.jewelry={min:0,max:0};
 assert.equal(Math.round(compareSandboxCharacters(a,b).numbers.attack),10);
});
test('starting point is independent and saved variants preserve builds',()=>{
 const b=emptySandboxCharacter();b.title='Start';
 const w=saveSandboxStartingPoint(null,b);
 b.equipment.head='head:item';
 const v=saveSandboxVariant(w,b,'Head gear test','head-test');
 assert.ok(v.ok);assert.equal(v.workspace.original.equipment.head,undefined);
 assert.equal(v.workspace.variants[0].character.equipment.head,'head:item');
 assert.equal(normalizeSandboxWorkspace(v.workspace).compareId,'head-test');
 assert.equal(deleteSandboxVariant(v.workspace,'head-test').compareId,'original');
});
test('max saved variants avoids unbounded local storage',()=>{
 let w=normalizeSandboxWorkspace();for(let i=0;i<12;i++)w=saveSandboxVariant(w,emptySandboxCharacter(),'v'+i,'var'+i).workspace;
 const x=saveSandboxVariant(w,emptySandboxCharacter(),'too many','var13');
 assert.equal(x.ok,false);assert.equal(x.workspace.variants.length,12);
});
test('source ledger detects meaningful skill, pet, and rune changes',()=>{
 const a=emptySandboxCharacter(),b=structuredClone(a);
 b.petSetup[0]={...b.petSetup[0],equipped:true,name:'Test pet',hatchBonus:'retaliation'};
 b.runeBoard=[{id:'rune-1',family:'Fury',x:0,y:0,w:1,h:1,shape:'small',secondary:'critical_damage'}];
 b.classAllocById={1:{8:{allocated:5,unlocked:true}}};
 const changes=sandboxChangeLedger(a,b);
 for(const kind of ['pets','runes','skills'])assert.ok(changes.some(x=>x.category===kind),kind);
});
