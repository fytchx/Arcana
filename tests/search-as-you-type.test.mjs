import test from 'node:test';
import assert from 'node:assert/strict';
import {searchAsYouType} from '../src/search-as-you-type.js';
const docs=[
 {id:'a',title:'Retaliation Warrior',kind:'guide',keywords:'warrior build'},
 {id:'b',title:'Pet Compound Calculator',kind:'tool',keywords:'pet calculator'},
 {id:'c',title:'Arcana Pathfinder',kind:'tool',keywords:'upgrades'}
];
test('search stays quiet until the player types',()=>{
 assert.deepEqual(searchAsYouType('',docs),{matches:[],guesses:[]});
 assert.deepEqual(searchAsYouType('zzzzz',docs),{matches:[],guesses:[]});
});
test('search matches exact and prefix terms without network calls',()=>{
 const first=searchAsYouType('reta',docs);
 assert.equal(first.matches[0].id,'a');
 assert.equal(first.guesses.length,0);
});
test('search suggests close intended names, not broad guesses',()=>{
 const typo=searchAsYouType('retalation',docs);
 assert.equal(typo.matches.length,0);
 assert.equal(typo.guesses[0].title,'Retaliation Warrior');
 assert.equal(searchAsYouType('xx',docs).guesses.length,0);
});
