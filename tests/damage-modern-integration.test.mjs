import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const launch=readFileSync(new URL('../src/launch-navigation.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('modern Arcana route renders actual Damage Calculator, never the retired placeholder',()=>{
 const matches=[...app.matchAll(/case 'calculators\/damage'/g)];
 assert.equal(matches.length,1,'duplicate switch cases shadow the real calculator');
 assert.match(app,/case 'calculators\/damage':return layout\('Character Sandbox','ARCANA LABS',damageCalculatorView\(\),'calculator'\)/);
 assert.doesNotMatch(app,/function calcDamage\(/);
 assert.doesNotMatch(app,/WORK IN PROGRESS<\/span><h1>Damage Calculator/);
 assert.match(app,/if\(dest==='calculators\/damage'\)queueMicrotask\(\(\)=>mountDamageCalculator\(\)\)/);
 assert.match(launch,/link\('Character Sandbox',[^\n]*'calculators\/damage'/);
});

test('calculator integration retains newer homepage, theme editor and five-tab dock',()=>{
 assert.match(html,/id="arcanaDock"/);
 assert.match(app,/theme-studio-vault\.js/);
 assert.match(launch,/id:'pathfinder',title:'Pathfinder'/);
 assert.match(launch,/id:'tools',title:'Tools'/);
 assert.match(launch,/id:'builds',title:'Builds & Guides'/);
 assert.match(app,/case 'damagefrombuild':persistDraft\(\);resetDamageCalculatorForCharacter\(\);go\('calculators\/damage'\);break/);
});
