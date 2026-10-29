import test from 'node:test';
import assert from 'node:assert/strict';
import {JOURNAL_SEEDS} from '../src/journal-seeds.mjs';

test('Hallowed Harvest guide is discoverable and documents critical rules',()=>{
 const posts=JOURNAL_SEEDS.filter(x=>x.slug==='hallowed-harvest-2026-guide');
 assert.equal(posts.length,1);
 const guide=posts[0];
 assert.equal(guide.published,true);
 assert.equal(guide.category,'Guides & Strategy');
 for(const text of ['November 4','November 7','November 14','750 pumpkins','04:00','12:00','18:00','1,200 Arcstone','600 additional','bonus pumpkins','Great Pumpkin','500 pumpkins'])assert.ok(guide.body.includes(text),text);
 assert.match(guide.body,/unspent.*harvested/i);
 assert.match(guide.body,/twice the shop price/i);
});
