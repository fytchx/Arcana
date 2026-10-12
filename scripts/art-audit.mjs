/* Read-only diagnostics in isolated staging. This uses the same resolver as the browser.
 * Logs only counts and public image paths, never user/private guild data.
 */
import {resolveOfficialSprite,resolveOfficialEmblem} from '../src/assets.js';
export async function runArtAudit({catalogOrigin,officialOrigin}) {
 const fetchJSON=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(`${url} returned HTTP ${r.status}`);return r.json()};
 const [manifest,catalog]=await Promise.all([
  fetchJSON(officialOrigin+'/manifest.json'),
  fetchJSON(catalogOrigin+'/api/search/catalog')
 ]);
 if(!manifest?.categories || !Array.isArray(catalog?.entries))throw Error('Incomplete public manifest or catalog');
 const groups=Object.entries(manifest.categories).map(([name,g])=>({name,keys:Object.keys(g.mapping||{}).length,cols:g.cols,rows:g.rows}));
 const categoryStats={};
 for(const entry of catalog.entries){
  if(!entry?.kind||!entry.title)continue;
  const stat=categoryStats[entry.kind]??={total:0,exact:0,alias:0,representative:0,emblem:0,unmatched:0,examples:[]};
  ++stat.total;
  const resolved=resolveOfficialSprite(entry,manifest.categories);
  const emblem=!resolved&&resolveOfficialEmblem(entry,manifest);
  if(resolved?.matchType==='name-alias')++stat.alias;
  else if(resolved?.matchType==='representative-pet')++stat.representative;
  else if(resolved)++stat.exact;
  else if(emblem)++stat.emblem;
  else {++stat.unmatched;if(stat.examples.length<6)stat.examples.push(entry.title)}
 }
 console.log('ARCANA_STAGING_ART_MAPPINGS '+JSON.stringify(Object.fromEntries(Object.entries(manifest.categories).map(([name,g])=>[name,Object.keys(g.mapping||{})]))));
 const imageChecks=[];
 for(const {name} of groups){
  try {
   const r=await fetch(`${officialOrigin}/${name}.webp`,{signal:AbortSignal.timeout(12000)});
   imageChecks.push({name,ok:r.ok&&r.headers.get('content-type')?.includes('image'),status:r.status});
   await r.body?.cancel();
  }catch(e){imageChecks.push({name,ok:false,error:String(e).slice(0,80)})}
 }
 const report={manifestVersion:manifest.version??null,groups,emblemKinds:Object.keys(manifest.categoryEmblems||{}),catalogTotal:catalog.entries.length,categoryStats,imageChecks};
 console.log('ARCANA_STAGING_ART_AUDIT '+JSON.stringify(report));
 return report;
}
