// Read-only HTTP verification of the deployed preview's actual Pathfinder API.
import assert from 'node:assert/strict';
const url='https://arcana-preview-app-preview.up.railway.app/api/pathfinder/recipes';
let last;
for(let attempt=1;attempt<=18;attempt++){
 try{
  const res=await fetch(url+'?verify='+Date.now(),{signal:AbortSignal.timeout(18000),headers:{'cache-control':'no-cache'}});
  if(!res.ok)throw Error('HTTP '+res.status+': '+(await res.text()).slice(0,200));
  const source=await res.json();
  if(source.materialSourceVersion!=='2026-10-17-001')throw Error('Preview not rolled out ('+source.materialSourceVersion+')');
  const t1=source.codex.tiers['1'].rows.find(x=>x.target===1||x.current===0);
  assert.deepEqual(t1.monster_materials,{'grubs-eye':2});
  assert.equal(source.codex.awaken.rows['1'].find(x=>x.target===1||x.current===0).monster_materials['glass-carapace'],86);
  assert.equal(source.codex.tier_upgrades.find(x=>x.from_tier===1).monster_materials['ogre-bone'],5);
  assert.equal(source.materials.length,79);
  console.log('DEPLOYED_PATHFINDER_VERIFIED',JSON.stringify({attempt,version:source.materialSourceVersion,oldCostReference:source.sourceVersion,t1:t1.monster_materials,awakenA1:source.codex.awaken.rows['1'][0].monster_materials,materials:source.materials.length}));
  last=null;break;
 }catch(e){last=e;console.error('Pathfinder preview not ready',attempt,e.message);if(attempt<18)await new Promise(r=>setTimeout(r,9000));}
}
if(last)throw last;
