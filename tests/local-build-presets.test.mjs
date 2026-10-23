import test from 'node:test';
import assert from 'node:assert/strict';
import {localBuildPresetById,readLocalBuildPresets,removeLocalBuildPreset,saveLocalBuildPreset} from '../src/local-build-presets.js';

class MemoryStorage{
 #data=new Map();
 getItem(key){return this.#data.get(key)??null}
 setItem(key,value){this.#data.set(key,String(value))}
 removeItem(key){this.#data.delete(key)}
}

test('local presets store independent build snapshots and can be reloaded',()=>{
 globalThis.localStorage=new MemoryStorage();
 const build={id:'local-draft',title:'Storm Archer',className:'Archer',monsterLevel:22,equipment:{weapon:'bow'}};
 const saved=saveLocalBuildPreset(build);
 build.title='Changed after save';build.equipment.weapon='other';
 assert.equal(localBuildPresetById(saved.id).build.title,'Storm Archer');
 assert.equal(localBuildPresetById(saved.id).build.equipment.weapon,'bow');
 assert.equal(readLocalBuildPresets().length,1);
 delete globalThis.localStorage;
});

test('local preset shelf stops at 24 entries',()=>{
 globalThis.localStorage=new MemoryStorage();
 for(let i=0;i<24;i++)assert.ok(saveLocalBuildPreset({title:'Build '+i,className:'Mage',equipment:{}}));
 assert.equal(saveLocalBuildPreset({title:'Overflow',className:'Mage',equipment:{}}),null);
 assert.equal(readLocalBuildPresets().length,24);
 delete globalThis.localStorage;
});

test('malformed local storage is treated as an empty preset shelf',()=>{
 globalThis.localStorage=new MemoryStorage();
 globalThis.localStorage.setItem('arcana-v3-local-presets-1','{broken');
 assert.deepEqual(readLocalBuildPresets(),[]);
 delete globalThis.localStorage;
});

test('deleting a saved preset leaves the other snapshots intact',()=>{
 globalThis.localStorage=new MemoryStorage();
 const first=saveLocalBuildPreset({title:'First',equipment:{}});
 const second=saveLocalBuildPreset({title:'Second',equipment:{}});
 assert.equal(removeLocalBuildPreset(first.id),true);
 assert.equal(localBuildPresetById(first.id),null);
 assert.equal(localBuildPresetById(second.id).title,'Second');
 assert.equal(removeLocalBuildPreset('missing'),false);
 delete globalThis.localStorage;
});
