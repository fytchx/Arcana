import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/damage-calculator-ui.js',import.meta.url),'utf8');

test('Build Studio action persists before opening Damage Calculator',()=>{
 assert.match(app,/data-action="damagefrombuild"/);
 assert.match(app,/case 'damagefrombuild':persistDraft\(\);resetDamageCalculatorForCharacter\(\);go\('calculators\/damage'\);break/);
});
test('Damage Calculator integrates review-only import and independently validates source',()=>{
 assert.match(ui,/data-dc-tab="studio"/);
 assert.match(ui,/damageStudioImportView\(\)/);
 assert.match(ui,/mountDamageStudioImport\(root/);
 assert.match(ui,/dc-apply-studio-equipment/);
 assert.match(ui,/const source=readBuildStudioDamage\(\)/);
 assert.match(ui,/const result=buildStudioScenarioChanges\(source,state\.baseline\)/);
 assert.match(ui,/for\(const \[key,value\] of Object\.entries\(result\.changes\)\)state\.changes\[key\]=value/);
});
