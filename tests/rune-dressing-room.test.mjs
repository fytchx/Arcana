import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBuild,findRuneWordMatches} from '../src/labs-engine.js';
import {RUNE_WORDS} from '../src/rune-words.js';

test('verified rune-word checklist contains all 24 game entries',()=>{
 assert.equal(RUNE_WORDS.length,24);
 assert.equal(new Set(RUNE_WORDS.map(word=>word.key)).size,24);
 assert.ok(RUNE_WORDS.every(word=>word.name&&word.types.length>=2&&word.bonuses.length));
});

test('manual runeword selections persist through build normalization',()=>{
 const build=normalizeBuild({usedRunewords:['immortal_bulwark','enlightenment','immortal_bulwark']});
 assert.deepEqual(build.usedRunewords,['immortal_bulwark','enlightenment']);
});

test('connected rune families detect a valid runeword and diagonals do not match',()=>{
 const touching=[{id:'a',family:'Fortitude',shape:'small',x:0,y:0,w:1,h:1},{id:'b',family:'Vitality',shape:'small',x:1,y:0,w:1,h:1}];
 assert.ok(findRuneWordMatches(touching).some(match=>match.wordKey==='iron_bulwark'&&match.runeIds.length===2));
 const diagonal=[{...touching[0],x:0,y:0},{...touching[1],x:1,y:1}];
 assert.equal(findRuneWordMatches(diagonal).some(match=>match.wordKey==='iron_bulwark'),false);
});

test('a valid runeword lock persists and consumes its runes until unlocked',()=>{
 const runeBoard=[{id:'a',family:'Fortitude',shape:'small',x:0,y:0},{id:'b',family:'Vitality',shape:'small',x:1,y:0}];
 const build=normalizeBuild({runeBoard,runeLocks:[{wordKey:'iron_bulwark',runeIds:['a','b']}]});
 assert.deepEqual(build.runeLocks,[{wordKey:'iron_bulwark',runeIds:['a','b']}]);
 assert.equal(findRuneWordMatches(build.runeBoard,build.runeLocks).some(match=>match.wordKey==='iron_bulwark'),false);
 const unlocked=normalizeBuild({...build,runeLocks:[]});
 assert.ok(findRuneWordMatches(unlocked.runeBoard,unlocked.runeLocks).some(match=>match.wordKey==='iron_bulwark'));
});

test('normalization drops malformed, disconnected, and overlapping runeword locks',()=>{
 const runeBoard=[{id:'a',family:'Fortitude',shape:'small',x:0,y:0},{id:'b',family:'Vitality',shape:'small',x:2,y:0}];
 const build=normalizeBuild({runeBoard,runeLocks:[{wordKey:'iron_bulwark',runeIds:['a','b']},{wordKey:'not_a_word',runeIds:['a','b']}]});
 assert.deepEqual(build.runeLocks,[]);
});
