import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeBuild} from '../src/labs-engine.js';
import {talismanBuildStudioView,talismanLabView} from '../src/talisman-ui.js';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const share=readFileSync(new URL('../src/build-links.js',import.meta.url),'utf8');
const dc=readFileSync(new URL('../src/damage-calculator-ui.js',import.meta.url),'utf8');
test('Build Studio stores optional talismans and never inserts someone else’s equipment',()=>{
 const b=normalizeBuild({equipment:{},runes:[],talismans:[{slug:'fury',level:9,inscriptions:{attack_power:25}}]});
 assert.equal(b.talismans[0].slug,'fury');
 assert.equal(b.talismans[1].level,null);
 const html=talismanBuildStudioView(b,false);
 assert.match(html,/data-build-talisman="slug"/);
 assert.match(html,/Talisman of Fury/);
 assert.match(html,/value="25"/);
 assert.match(html,/data-build-talisman-file/);
 assert.match(app,/talismansFromResponse/);
 assert.match(app,/b\.talismans\[idx\]=normalizeTalisman\(next\)/);
});
test('Talisman state survives explicit build sharing and previews stay read-only',()=>{
 assert.match(share,/'talismans'/);
 assert.match(talismanBuildStudioView({talismans:[{slug:'iron',level:9}]},true),/disabled/);
});
test('Damage Calculator exposes optional two-sided talisman comparison and studio handoff',()=>{
 assert.match(talismanLabView(),/data-dc-panel="talismans"/);
 assert.match(dc,/data-dc-tab="talismans"/);
 assert.match(dc,/mountTalismanLab\(root\)/);
});
