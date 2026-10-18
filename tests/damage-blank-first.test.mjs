import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('../src/damage-calculator-ui.js',import.meta.url),'utf8');
const skills=readFileSync(new URL('../src/damage-calculator-skills-ui.js',import.meta.url),'utf8');
test('damage calculator starts unmeasured and never selects a personal screenshot fixture',()=>{
 assert.match(ui,/const initial = \(\) => blankDamageBuild\(\)/);
 assert.match(ui,/blank-v2/);
 assert.doesNotMatch(ui,/data-dc-example=/);
 assert.doesNotMatch(ui,/HUNTER_2026_10_17|RETALIATION_WARRIOR_2026_10_17|ATTACK_MAGE_2026_10_17/);
 assert.match(ui,/Enter only the values you know/);
});
test('skills planner has zero allocations until explicitly entered',()=>{
 assert.match(skills,/plan=blank\(\);return plan/);
 assert.doesNotMatch(skills,/plan=preset\('hunter'\);return plan/);
});
