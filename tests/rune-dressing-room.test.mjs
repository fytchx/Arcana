import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBuild} from '../src/labs-engine.js';
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
