import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {Readable} from 'node:stream';
import {sourceMaterialGroups,recipeSlotStatus} from '../src/pathfinder-material-groups.js';
import {groupedMaterialMarkup} from '../src/pathfinder-material-view.js';
import {normalizeSavedFarmingList,safeFarmingListRequest} from '../src/farming-lists-server.mjs';
import {pathfinderRangeContent} from '../src/pathfinder-timeline-view.js';

test('verified biome grouping is unlock-ordered with tier and separate special materials',()=>{
 const recipeMats=[
  {slug:'nightmare-claw',name:'Nightmare Claw',quantity:99n},
  {slug:'everfrost-dust',name:'Everfrost Dust',quantity:22n},
  {slug:'ripple-scale',name:'Ripple Scale',quantity:13n},
  {slug:'eternal-sigil',name:'Eternal Sigil',quantity:1n}
 ];
 const meta=[
  {slug:'nightmare-claw',type:'monster_material',monster_id:90},
  {slug:'everfrost-dust',type:'monster_material',monster_id:40},
  {slug:'ripple-scale',type:'monster_material',sourceBiome:'Murky Depths',tier:2},
  {slug:'eternal-sigil',type:'currency'}
 ];
 const catalog=[
  {id:'game:monster:90',kind:'monster',title:'Nightmare',facts:[['Biome','Shadow Realm']]},
  {id:'game:monster:40',kind:'monster',title:'Frost Ghoul',facts:[['Biome','Frozen Peaks'],['Tier','3']]},
  {id:'game:biome:shadow-realm',kind:'biome',title:'Shadow Realm',facts:[['Unlock Monster Level','150'],['Tier','5']]},
  {id:'game:biome:frozen-peaks',kind:'biome',title:'Frozen Peaks',facts:[['Unlock Monster Level','90'],['Tier','3']]},
  {id:'game:biome:murky-depths',kind:'biome',title:'Murky Depths',facts:[['Unlock Monster Level','50'],['Tier','2']]}
 ];
 const groups=sourceMaterialGroups(recipeMats,meta,catalog);
 assert.deepEqual(groups.map(x=>x.name),['Murky Depths','Frozen Peaks','Shadow Realm','Forge & special materials']);
 assert.deepEqual(groups.slice(0,3).map(x=>x.tier),['2','3','5']);
 assert.match(groupedMaterialMarkup(recipeMats,{materials:meta},catalog),/Frozen Peaks/);
 assert.match(groupedMaterialMarkup(recipeMats,{materials:meta},catalog),/Nightmare Claw/);
 assert.equal(recipeSlotStatus({codex:{tiers:{}}}),'not-verified');
});
test('missing source names are explicitly unverified, not attributed by material-name guesses',()=>{
 const groups=sourceMaterialGroups([{slug:'strange-fang',name:'Strange Fang',quantity:10n}],[{slug:'strange-fang',type:'monster_material',monster_id:121}],[]);
 assert.equal(groups[0].name,'Biome not verified');
 assert.equal(groups[0].tier,'');
});
test('cloud farming list validation protects quantities, duplicates and account from HTML',()=>{
 const list={title:'<bad> My run',slot:'ring',from:'A4 +30',to:'A5 +30',gold:'281171093750',groups:[
  {name:'Frozen Peaks',tier:'Tier 3',items:[{slug:'everfrost-dust',name:'Everfrost Dust',quantity:'776'}]},
  {name:'Forge & special materials',tier:'',items:[{slug:'eternal-sigil',name:'Eternal Sigil',quantity:'30'}]}
 ]};
 const data=normalizeSavedFarmingList(list);
 assert.doesNotMatch(data.title,/[<>]/);
 assert.equal(data.groups[0].items[0].completed,false);
 assert.throws(()=>normalizeSavedFarmingList({...list,groups:[list.groups[0],list.groups[0]]}),/Invalid material/);
 assert.throws(()=>normalizeSavedFarmingList({...list,groups:[{name:'Bad',items:[{slug:'everfrost-dust',quantity:'-3'}]}]}),/Invalid material/);
});
test('private account checklist can be saved, ticked, survives reads and cannot be read anonymously',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'arcana-pathfinder-lists-'));
 const names=['ARCANA_ACCOUNT_DATA_DIR','ARCANA_AUTH_BASE_URL','ARCANA_DISCORD_CLIENT_ID','ARCANA_DISCORD_CLIENT_SECRET'];
 const previous=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 process.env.ARCANA_ACCOUNT_DATA_DIR=dir;process.env.ARCANA_AUTH_BASE_URL='http://localhost:3000';
 process.env.ARCANA_DISCORD_CLIENT_ID='test';process.env.ARCANA_DISCORD_CLIENT_SECRET='test';
 const user=randomUUID(),token='T'.repeat(48);
 await mkdir(join(dir,'users'),{recursive:true});await mkdir(join(dir,'sessions'),{recursive:true});
 await writeFile(join(dir,'users',user+'.json'),JSON.stringify({id:user,discordId:'777777777777777777',discordName:'Test',roles:[]}));
 await writeFile(join(dir,'sessions',createHash('sha256').update(token).digest('hex')+'.json'),JSON.stringify({id:user,expires:Date.now()+600000}));
 async function call(method,path,body,logged=true,origin='http://localhost:3000'){
  const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);
  req.method=method;req.headers={origin,'content-type':'application/json',cookie:logged?'arcana-session='+token:''};
  const res={status:0,body:'',writeHead(v){this.status=v;},end(x){this.body+=x||'';}};
  await safeFarmingListRequest(req,res,new URL(path,origin));return {status:res.status,data:JSON.parse(res.body||'{}')};
 }
 try{
  assert.equal((await call('GET','/api/account/farming-lists',null,false)).status,401);
  const list={title:'A4 to A5',slot:'neck',from:'A4 +30',to:'A5 +30',gold:'30000',
   sourceVersion:'Verified patch',groups:[{name:'Frozen Peaks',tier:'Tier 3',items:[{slug:'everfrost-dust',name:'Everfrost Dust',quantity:'776'}]}]};
  assert.equal((await call('POST','/api/account/farming-lists',{list},true,'https://evil.example')).status,403);
  const saved=await call('POST','/api/account/farming-lists',{list});
  assert.equal(saved.status,201);
  assert.equal(saved.data.list.groups[0].items[0].completed,false);
  const id=saved.data.list.id;
  assert.equal((await call('PATCH','/api/account/farming-lists/'+id,{slug:'everfrost-dust',completed:true,baseUpdatedAt:'stale'})).status,409);
  const toggled=await call('PATCH','/api/account/farming-lists/'+id,{slug:'everfrost-dust',completed:true,baseUpdatedAt:saved.data.list.updatedAt});
  assert.equal(toggled.status,200);
  assert.equal(toggled.data.list.groups[0].items[0].completed,true);
  const current=await call('GET','/api/account/farming-lists');
  assert.equal(current.data.lists[0].groups[0].items[0].completed,true);
  assert.equal((await call('GET','/api/account/farming-lists',null,false)).status,401);
  assert.equal((await call('DELETE','/api/account/farming-lists/'+id)).status,200);
  assert.equal((await call('GET','/api/account/farming-lists')).data.lists.length,0);
 }finally{for(const k of names){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}await rm(dir,{recursive:true,force:true});}
});
