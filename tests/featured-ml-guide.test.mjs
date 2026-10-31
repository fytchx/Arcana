import test from 'node:test';
import assert from 'node:assert/strict';
import {homeScreen} from '../src/launch-navigation.js';
import {ML_ONE_SHOT_MILESTONE_GUIDE} from '../src/ml-one-shot-milestone-guide.js';
import {readFile} from 'node:fs/promises';

test('ML guide is featured above Convergence on the homepage without removing it',()=>{
 const markup=homeScreen();
 const a=markup.indexOf('data-params="id=ml-one-shot-milestone-guide-zane"');
 const b=markup.indexOf('data-params="id=convergence-complete-guide"');
 assert.ok(a>=0&&b>a,'ML feature must precede existing Convergence feature');
 assert.equal((markup.match(/class="atlasHero atlasGuideHighlight/g)||[]).length,2);
 assert.equal(ML_ONE_SHOT_MILESTONE_GUIDE.draft,false);
});
test('Featured discovery also lists ML guide directly above Convergence',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const ml=app.indexOf("['Grinding Monster Level Efficiently'");
 const convergence=app.indexOf("['Convergence: Complete Season 2 Guide'");
 assert.ok(ml>=0&&convergence>ml,'Featured ML guide must appear ahead of Convergence');
 const css=await readFile(new URL('../home-atlas.css',import.meta.url),'utf8');
 assert.match(css,/\.atlasHome \.atlasGuideSecondary/);
});
