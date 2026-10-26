/* Durable, verified Pathfinder recipe snapshots.
 * Existing /data volume preserves a fully validated response when the
 * legacy game-data service is unavailable. Never synthesize costs. */
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
export function isVerifiedPathfinderRecipe(value){
 const codex=value?.codex;
 return typeof value?.sourceVersion==='string'&&value.sourceVersion.length>0
  &&Array.isArray(codex?.tiers?.['6']?.rows)&&codex.tiers['6'].rows.length>=30
  &&Array.isArray(codex?.awaken?.rows?.['30'])&&codex.awaken.rows['30'].length>=30
  &&Array.isArray(codex?.tier_upgrades)&&codex.tier_upgrades.length>=5
  &&Array.isArray(codex?.awaken?.transitions)&&codex.awaken.transitions.length>=30
  &&Array.isArray(value.materials)&&value.materials.length>=40;
}
export function createPathfinderRecipeCache({file,fetchFresh,clock=()=>Date.now(),warn=()=>{},refreshMs=3600000}){
 if(typeof file!=='string'||!file||typeof fetchFresh!=='function')throw TypeError('Pathfinder cache requires file and fetchFresh');
 let cached=null,lastRefreshed=0,loading=null,refreshing=null;
 const refresh=()=>{
  if(refreshing)return refreshing;
  refreshing=(async()=>{
   const fresh=await fetchFresh();
   if(!isVerifiedPathfinderRecipe(fresh))throw Error('Incomplete verified Pathfinder source');
   cached=fresh;lastRefreshed=clock();
   try{
    await mkdir(dirname(file),{recursive:true,mode:0o700});
    const tmp=file+'.'+randomUUID()+'.tmp';
    await writeFile(tmp,JSON.stringify(fresh),{mode:0o600});
    await rename(tmp,file);
   }catch(err){warn('PATHFINDER_CACHE_WRITE_UNAVAILABLE',String(err));}
   return fresh;
  })().finally(()=>{refreshing=null});
  return refreshing;
 };
 const get=()=>{
  if(cached){
   if(clock()-lastRefreshed>refreshMs&&!refreshing)void refresh().catch(err=>warn('PATHFINDER_CACHE_USING_VERIFIED_SNAPSHOT',String(err)));
   return Promise.resolve(cached);
  }
  if(loading)return loading;
  loading=(async()=>{
   try{
    const stored=JSON.parse(await readFile(file,'utf8'));
    if(!isVerifiedPathfinderRecipe(stored))throw Error('Invalid stored Pathfinder recipe');
    cached=stored;
    // Return immediately; revalidate in the background, preserving the known-good snapshot.
    lastRefreshed=clock()-refreshMs-1;
    void refresh().catch(err=>warn('PATHFINDER_CACHE_USING_VERIFIED_SNAPSHOT',String(err)));
    return stored;
   }catch(err){if(err?.code!=='ENOENT')warn('PATHFINDER_CACHE_READ_UNAVAILABLE',String(err));}
   return refresh();
  })().finally(()=>{loading=null});
  return loading;
 };
 return {get,refresh};
}
