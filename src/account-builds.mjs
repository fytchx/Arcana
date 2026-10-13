// Durable account-owned Build Studio saves. No share token or session credentials
// are stored in the build document; identity comes only from the server cookie.
import {randomUUID} from 'node:crypto';
import {readdir,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {requireCapability,parseJSON,queued,readJSON,saveAtomic,checkOrigin,sendJSON,dataRoot} from './account-server.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/;
const BUILD_LIMIT=20;
const folder=id=>resolve(dataRoot(),'builds',id);
const filename=(user,id)=>resolve(folder(user.id),id+'.json');
const bad=(status,message)=>Object.assign(new Error(message),{status});
const clean=(s,n)=>String(s||'').trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,n);
function normalizedBuild(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw bad(422,'Build Studio snapshot required.');
 const size=JSON.stringify(raw).length;
 if(size>68000)throw bad(413,'Build is too large to save to your account.');
 if(!raw.equipment||typeof raw.equipment!=='object'||Array.isArray(raw.equipment)||!Array.isArray(raw.runes)||
 !Array.isArray(raw.runeBoard||[]))throw bad(422,'Save a valid Build Studio setup.');
 const build=JSON.parse(JSON.stringify(raw));
 build.title=clean(build.title,100)||'My build';
 build.summary=clean(build.summary,350);
 build.notes=clean(build.notes,1800);
 return build;
}
const light=row=>({id:row.id,title:row.build?.title||'My build',className:row.build?.className||'',
 updatedAt:row.updatedAt,createdAt:row.createdAt,monsterLevel:row.build?.monsterLevel||1});
async function entries(user){
 try{
  const files=(await readdir(folder(user.id))).filter(x=>UUID.test(x.slice(0,-5))&&x.endsWith('.json')).slice(0,BUILD_LIMIT+10);
  const rows=(await Promise.all(files.map(async f=>readJSON(resolve(folder(user.id),f))))).filter(Boolean);
  return rows.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
 }catch(e){if(e.code==='ENOENT')return [];throw e;}
}
export async function handleAccountBuildRequest(req,res,url){
 if(!url.pathname.startsWith('/api/account/builds'))return false;
 const user=await requireCapability(req);
 if(url.pathname==='/api/account/builds'&&req.method==='GET'){
  sendJSON(res,200,{builds:(await entries(user)).map(light),limit:BUILD_LIMIT});return true;
 }
 if(url.pathname==='/api/account/builds'&&req.method==='POST'){
  checkOrigin(req);const body=await parseJSON(req,74000),build=normalizedBuild(body?.build);
  const item=await queued(async()=>{
   if((await entries(user)).length>=BUILD_LIMIT)throw bad(409,'You have reached the 20 saved-build limit. Update or delete an existing save.');
   const at=new Date().toISOString();
   const row={id:randomUUID(),ownerId:user.id,build,createdAt:at,updatedAt:at};
   await saveAtomic(filename(user,row.id),row);return row;
  });
  sendJSON(res,201,{build:light(item)});return true;
 }
 const match=url.pathname.match(/^\/api\/account\/builds\/([0-9a-f-]{36})$/);
 if(!match)return false;
 const path=filename(user,match[1]);
 if(req.method==='GET'){
  const row=await readJSON(path);if(!row||row.ownerId!==user.id)throw bad(404,'Saved build not found.');
  sendJSON(res,200,{build:row.build,record:light(row)});return true;
 }
 if(req.method==='PUT'){
  checkOrigin(req);const body=await parseJSON(req,74000),build=normalizedBuild(body?.build);
  const row=await queued(async()=>{
   const current=await readJSON(path);
   if(!current||current.ownerId!==user.id)throw bad(404,'Saved build not found.');
   if(!body.baseUpdatedAt||current.updatedAt!==body.baseUpdatedAt)throw bad(409,'This build was updated elsewhere. Reload the account saves before overwriting.');
   current.build=build;current.updatedAt=new Date().toISOString();
   await saveAtomic(path,current);return current;
  });
  sendJSON(res,200,{build:light(row)});return true;
 }
 if(req.method==='DELETE'){
  checkOrigin(req);
  await queued(async()=>{
   const row=await readJSON(path);if(!row||row.ownerId!==user.id)throw bad(404,'Saved build not found.');
   await unlink(path);
  });
  sendJSON(res,200,{ok:true});return true;
 }
 return false;
}
export async function safeAccountBuildRequest(req,res,url){
 try{return await handleAccountBuildRequest(req,res,url);}
 catch(e){if(e.status>=400&&e.status<500)sendJSON(res,e.status,{error:e.message});else{console.error('Arcana account builds:',e);sendJSON(res,503,{error:'Account build storage unavailable.'});}return true;}
}
