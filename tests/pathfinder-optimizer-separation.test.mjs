import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {homeSubmenu,directoryView} from '../src/launch-navigation.js';
const file=async name=>readFile(new URL('../'+name,import.meta.url),'utf8');
test('Pathfinder returns to the pre-optimizer page layout',async()=>{
 const app=await file('src/app.js');
 assert.match(app,/function pathfinderHub\(legacyView='range'\)/);
 assert.match(app,/pathfinderHubTabs/);
 assert.match(app,/pathfinderHubContent/);
 assert.doesNotMatch(app,/pathfinderOptimizerLink/);
 assert.match(app,/function calcPathfinder\(\)\{return pathfinderHub\(\)\}/);
});
test('Optimizer exists independently only within private admin tools',async()=>{
 const app=await file('src/app.js'),admin=await file('src/admin-console.js'),server=await file('server.mjs');
 assert.doesNotMatch(homeSubmenu('pathfinder',true),/Upgrade Optimizer/);
 assert.doesNotMatch(homeSubmenu('tools',true),/Upgrade Optimizer/);
 assert.doesNotMatch(directoryView(true),/data-route="calculators\/optimizer"/);
 assert.match(admin,/Private experimental calculators/);
 assert.match(admin,/actionLink\('Upgrade Optimizer'.*'calculators\/optimizer'/);
 assert.match(app,/case 'calculators\/optimizer':return isAppearanceAdmin\(\)\?/);
 assert.match(server,/requireCapability\(req,'site:manage'\)/);
});
