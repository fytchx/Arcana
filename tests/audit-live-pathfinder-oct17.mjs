/* Read-only, exhaustive comparison of today's deployed Pathfinder API against
 * the user's Oct 17 workbook and source-config. Never modifies the website. */
import {readFile} from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
import assert from 'node:assert/strict';

const payload=(await readFile(new URL('./fixtures/pathfinder-oct17-independent.b64',import.meta.url),'utf8')).trim();
const rules=JSON.parse(inflateSync(Buffer.from(payload,'base64')).toString('utf8'));
const endpoint='https://arcanacompanion.xyz/api/pathfinder/recipes';
let response;
for(let attempt=1;attempt<=5;attempt++){
 try{const r=await fetch(endpoint+'?audit='+Date.now(),{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(17000)});if(!r.ok)throw Error('HTTP '+r.status);response=await r.json();break;}
 catch(e){console.log('Fetch retry',attempt,e.message);if(attempt===5)throw e;await new Promise(resolve=>setTimeout(resolve,6000))}
}
const mismatches=[],check=(where,got,want)=>{if(JSON.stringify(got)!==JSON.stringify(want))mismatches.push({where,got,want})};
const sortObj=x=>Object.fromEntries(Object.entries(x||{}).sort(([a],[b])=>a.localeCompare(b)));
const sortList=x=>(x||[]).map(y=>({slug:String(y.slug),quantity:Number(y.quantity)})).sort((a,b)=>a.slug.localeCompare(b.slug));
let checked=0;
for(let tier=1;tier<=6;tier++){
 const rows=response.codex.tiers[tier]?.rows||[];
 for(const [level,expected] of Object.entries(rules.t[tier])){
  const row=rows.find(x=>Number(x.target??Number(x.current)+1)===Number(level));
  if(!row){mismatches.push({where:'T'+tier+'+'+level,error:'missing row'});continue;}
  check('T'+tier+'+'+level,sortObj(row.monster_materials),sortObj(expected));checked+=Object.keys(expected).length;
  if(String(row.fragment_slug)!==['iron-fragment','steel-fragment','mithril-fragment','adamantine-fragment','celestial-fragment','infernal-fragment'][tier-1])mismatches.push({where:'T'+tier+'+'+level,error:'fragment slug out of date',slug:row.fragment_slug});
 }
}
for(let tier=1;tier<=5;tier++){
 const row=response.codex.tier_upgrades.find(x=>Number(x.from_tier)===tier);
 check('Tier '+tier+'→'+(tier+1),sortObj(row?.monster_materials),sortObj(rules.c[tier]));
 const essences=[['uncommon-essence',1],['rare-essence',2],['epic-essence',3],['legendary-essence',5],['infernal-essence',10]];
 check('Tier '+tier+' essence',row?.essence,{slug:essences[tier-1][0],quantity:essences[tier-1][1]});
 check('Tier '+tier+' gold',Number(row?.gold),[7500,45000,225000,1125000,5250000][tier-1]);
}
for(let rank=1;rank<=30;rank++){
 const rows=response.codex.awaken.rows[rank]||[];
 for(let level=1;level<=30;level++){
  const row=rows.find(x=>Number(x.target??Number(x.current)+1)===level);
  if(!row){mismatches.push({where:'A'+rank+'+'+level,error:'missing row'});continue;}
  const expected=rules.a[rank][level];
  check('A'+rank+'+'+level,sortObj(row.monster_materials),sortObj(expected));checked+=Object.keys(expected).length;
  const sourceExtras=sortList(rules.e[level]||[]);
  const extras=sortList([...(row.extra_materials||[]),...(row.materials||[])].filter(x=>['abyssal-ember','eternal-sigil'].includes(x.slug)));
  check('A'+rank+'+'+level+' extras',extras,sourceExtras);
 }
 const row=response.codex.awaken.transitions?.find(x=>Number(x.rank)===rank);
 const threshold=Object.keys(rules.x).map(Number).filter(n=>n<=rank).sort((a,b)=>b-a)[0];
 check('A'+rank+' transition',sortList([...(row?.materials||[]),...(row?.extra_materials||[])]),sortList(rules.x[threshold]));
}
const newest=String(response.sourceVersion||'').includes('2026-10-17-001');
console.log('LIVE_PATHFINDER_AUDIT',JSON.stringify({source:response.sourceVersion,latestMaterialVersion:newest,monsterEntries:checked,expected:5222,materialsDefined:response.materials?.length,mismatches:mismatches.length,samples:mismatches.slice(0,16)}));
assert.equal(newest,true,'Live API does not acknowledge Oct17');
assert.equal(checked,5222,'Source row coverage changed');
assert.equal(mismatches.length,0,'Live API differs from the spreadsheet');
