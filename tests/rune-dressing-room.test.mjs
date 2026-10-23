import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBuild,putRune,RUNE_SHAPES} from '../src/labs-engine.js';
import {RUNE_WORDS} from '../src/rune-words.js';

test('verified rune checklist contains all 24 game entries',()=>{
 assert.equal(RUNE_WORDS.length,24);
 assert.equal(new Set(RUNE_WORDS.map(word=>word.key)).size,24);
 assert.ok(RUNE_WORDS.every(word=>word.name&&word.types.length>=2&&word.bonuses.length));
});

test('manual runeword selections persist through build normalization',()=>{
 const build=normalizeBuild({usedRunewords:['immortal_bulwark','enlightenment','immortal_bulwark']});
 assert.deepEqual(build.usedRunewords,['immortal_bulwark','enlightenment']);
 assert.equal(Object.hasOwn(build,'runeLocks'),false);
});

test('legacy automatic word locks are discarded while rune placements remain',()=>{
 const runeBoard=[{id:'a',family:'Fortitude',shape:'small',x:0,y:0,w:1,h:1},{id:'b',family:'Vitality',shape:'small',x:1,y:0,w:1,h:1}];
 const build=normalizeBuild({runeBoard,runeLocks:[{wordKey:'iron_bulwark',runeIds:['a','b']}]});
 assert.deepEqual(build.runeBoard,runeBoard);
 assert.equal(Object.hasOwn(build,'runeLocks'),false);
});

test('runes can be placed individually and duplicate configurations are supported',()=>{
 const shape=RUNE_SHAPES.small;
 const first=putRune([], {id:'a',family:'Fortitude',secondary:'defense',shape:'small',x:0,y:0,w:shape.w,h:shape.h},300);
 assert.equal(first.ok,true);
 const second=putRune(first.placements, {id:'b',family:'Fortitude',secondary:'defense',shape:'small',x:1,y:0,w:shape.w,h:shape.h},300);
 assert.equal(second.ok,true);
 assert.equal(second.placements.length,2);
});
