import test from 'node:test';
import assert from 'node:assert/strict';
import {SEASON2_COMPLETE_GUIDE as guide} from '../src/season2-complete-guide.js';

const section=title=>guide.sections.find(entry=>entry.title===title);

test('guide distinguishes ACS evolved affixes from ACS Hatch Bonuses',()=>{
 const skills=section('Class Skills and the Passive Tree')?.body||'';
 assert.match(skills,/Torch, the Sage Diadem and ACS evolved affixes/);
 const pets=section('ACS pets: keepers, fodder and Pet Shards')?.body||'';
 assert.match(pets,/ACS evolved affix:/);
 assert.match(pets,/ACS Hatch Bonus:/);
 assert.match(pets,/TWO Compound levels/);
 assert.match(pets,/ANY other Legendary pet/);
 assert.match(pets,/don't get those shards back|NOT get back/);
 assert.match(pets,/four Legendary pets/);
});

test('temporary ACS hatch pets are not recommended for expensive affix investments',()=>{
 const pets=section('Pets, hatching and evolved affixes')?.body||'';
 const fodder=section('Raeik and ACS Hatch Bonus fodder')?.body||'';
 assert.match(pets,/you don't get those shards back/);
 assert.match(fodder,/leave its evolved affixes alone/);
 assert.match(fodder,/doesn't refund any Pet Shards/);
 assert.deepEqual(guide.connections.sectionLinks['ACS pets: keepers, fodder and Pet Shards'],['affixes','compound','petlab']);
});

test('equipment guide uses verified boot differences and correctly frames Sage helmet tradeoffs',()=>{
 const gear=section('Equipment and the Forge')?.body||'';
 assert.match(gear,/Grounded Treads have higher Defense and built-in Block Chance/);
 assert.match(gear,/Swiftstride Boots offer Double Hit/);
 assert.match(gear,/Sage Diadem is hard to replace for most builds because of its All Class Skills/);
 assert.match(gear,/Retaliation Warrior is one possible exception/);
 assert.match(gear,/valuable Drop Bonus/);
 assert.doesNotMatch(gear,/A helmet with a great supporting bonus might be better/);
});
