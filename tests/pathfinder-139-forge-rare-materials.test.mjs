import test from 'node:test';
import assert from 'node:assert/strict';
import {applyVerifiedUpgradeCosts,VERIFIED_FORGE_RARE_STEPS_20261028} from '../src/pathfinder-upgrade-materials.mjs';
const rows=(n)=>Array.from({length:n},(_,i)=>({current:i,target:i+1,gold:'1000',
 extra_materials:[{slug:'abyssal-ember',quantity:99},{slug:'eternal-sigil',quantity:99},{slug:'custom-token',quantity:7}]}));
const makeSource=()=>({
 tiers:Object.fromEntries([4,9,14,19,24,30].map((n,i)=>[String(i+1),{rows:rows(n)}])),
 tier_upgrades:Array.from({length:5},(_,i)=>({from_tier:i+1,to_tier:i+2,gold:'1'})),
 awaken:{rows:Object.fromEntries(Array.from({length:30},(_,i)=>[String(i+1),rows(30)])),
 transitions:Array.from({length:30},(_,i)=>({rank:i+1,materials:[]}))}
});
test('observed 1.3.9 Forge steps override stale rare material amounts only at verified A5/A6 steps',()=>{
 const source=makeSource();
 const applied=applyVerifiedUpgradeCosts(source,[]);
 assert.equal(applied.awakenSteps,900);
 assert.equal(VERIFIED_FORGE_RARE_STEPS_20261028.length,4);
 for(const {rank,level,ember,sigil} of VERIFIED_FORGE_RARE_STEPS_20261028){
  const row=source.awaken.rows[String(rank)][level-1];
  assert.deepEqual(row.extra_materials.filter(m=>['abyssal-ember','eternal-sigil'].includes(m.slug)),[
   {slug:'abyssal-ember',quantity:ember},{slug:'eternal-sigil',quantity:sigil}
  ]);
  assert.deepEqual(row.extra_materials.find(m=>m.slug==='custom-token'),{slug:'custom-token',quantity:7});
 }
 // Do not invent values for unrelated rank/level combinations.
 assert.equal(source.awaken.rows['4'][26].extra_materials.some(m=>m.slug==='eternal-sigil'),false);
});
