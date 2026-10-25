/* Human-reviewed character links and manually curated IdleArc season records.
   Evidence is private; public records are explicitly editor curated. */
import {randomUUID} from 'node:crypto';
import {readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {requireCapability,checkOrigin,parseJSON,queued,readJSON,saveAtomic,dataRoot,sendJSON} from './account-server.mjs';
const err=(status,message)=>Object.assign(Error(message),{status});
const clean=(x,max)=>String(x??'').trim().slice(0,max).replace(/[\x00-\x1f\x7f]/g,' ');
const uuid=/^[0-9a-f-]{36}$/;
const claimDir=()=>resolve(dataRoot(),'claims');
const claimFile=id=>resolve(claimDir(),id+'.json');
const userFile=id=>resolve(dataRoot(),'users',id+'.json');
const archiveFile=()=>resolve(dataRoot(),'seasonal-archive.json');
const safeClaim=x=>x&&({id:x.id,name:x.name,status:x.status,submittedAt:x.submittedAt,reviewedAt:x.reviewedAt||'',note:x.note||'',reviewerId:x.reviewerId||'',history:x.history||[]});
export function characterName(x){const n=clean(x,48);if(n.length<2||/[<>]/.test(n))throw err(422,'Character name must be 2–48 characters.');return n;}
function screenshot(x){
 if(typeof x!=='string'||x.length>415000)throw err(413,'Screenshot is too large. Please use a smaller screenshot.');
 const m=x.match(/^data:image\/(jpeg|png|webp);base64,([a-zA-Z0-9+/]+={0,2})$/);if(!m)throw err(422,'Use a JPG, PNG or WebP screenshot.');
 const b=Buffer.from(m[2],'base64'),png=b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),jpg=b[0]===255&&b[1]===216&&b[2]===255,webp=b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP';
 if(b.length<150||b.length>300000||!(m[1]==='jpeg'&&jpg||m[1]==='png'&&png||m[1]==='webp'&&webp))throw err(422,'Invalid screenshot. Maximum size is 300 KB.');
 return x;
}
const classes=['Warrior','Mage','Rogue','Archer','Druid'],categories=['guild','class','individual'];
export function seasonalEntry(x){
 const season=clean(x?.season,50),category=clean(x?.category,16),characterClass=clean(x?.characterClass,18),rank=Number(x?.rank),name=clean(x?.name,88),description=clean(x?.description,500),source=clean(x?.source,400);
 if(!/^[-\w ]{2,50}$/.test(season))throw err(422,'Enter a season name (for example Season 2).');
 if(!categories.includes(category))throw err(422,'Invalid record category.');
 if(category==='class'&&!classes.includes(characterClass))throw err(422,'Choose a valid class.');
 if(!Number.isInteger(rank)||rank<1||rank>500)throw err(422,'Rank must be 1–500.');
 if(name.length<2||description.length<8)throw err(422,'Enter a name and an informative description.');
 if(source&&(!source.startsWith('https://')||source.length>=400))throw err(422,'Evidence must use an HTTPS link.');
 return {season,category,characterClass:category==='class'?characterClass:'',rank,name,description,source,profileId:uuid.test(x?.profileId)?x.profileId:''};
}
const recordKey=x=>[x.season.toLowerCase(),x.category,x.characterClass,x.rank].join('|');
const readRecords=async()=>({revision:0,records:[],...await readJSON(archiveFile())});
const claims=async()=>{let files=[];try{files=await readdir(claimDir())}catch(e){if(e.code!=='ENOENT')throw e}return(await Promise.all(files.filter(x=>uuid.test(x.slice(0,-5))&&x.endsWith('.json')).slice(0,5000).map(x=>readJSON(resolve(claimDir(),x))))).filter(Boolean)};
export async function handleCommunityArchive(req,res,url){
 const path=url.pathname,method=req.method;
 if(path==='/api/arcana-archive/records'&&method==='GET'){const db=await readRecords();sendJSON(res,200,{revision:db.revision,records:db.records.slice().sort((a,b)=>b.season.localeCompare(a.season,undefined,{numeric:true})||a.rank-b.rank)});return true;}
 if(path==='/api/arcana-archive/claim/me'&&method==='GET'){const me=await requireCapability(req,'character:claim');sendJSON(res,200,{claim:safeClaim(await readJSON(claimFile(me.id)))});return true;}
 if(path==='/api/arcana-archive/claim'&&method==='POST'){
  checkOrigin(req);const me=await requireCapability(req,'character:claim'),data=await parseJSON(req,430000),name=characterName(data?.name),proof=screenshot(data?.screenshot);
  const claim=await queued(async()=>{
   const prior=await readJSON(claimFile(me.id));if(prior&&['pending','approved'].includes(prior.status))throw err(409,'You already have a pending or approved claim.');
   const time=new Date().toISOString(),row={id:me.id,name,status:'pending',submittedAt:time,reviewedAt:'',reviewerId:'',note:'',proof,history:[...(prior?.history||[]).slice(-20),{action:'submitted',by:me.id,at:time}]};
   await saveAtomic(claimFile(me.id),row);
   const user=await readJSON(userFile(me.id));if(user){user.profile={...user.profile,characterClaim:{status:'pending',name}};await saveAtomic(userFile(me.id),user);}
   return row;
  });
  sendJSON(res,201,{claim:safeClaim(claim)});return true;
 }
 if(path==='/api/arcana-archive/claims'&&method==='GET'){await requireCapability(req,'character:review');const all=await claims();all.sort((a,b)=>(a.status==='pending'?0:1)-(b.status==='pending'?0:1)||b.submittedAt.localeCompare(a.submittedAt));sendJSON(res,200,{claims:all.slice(0,200).map(safeClaim),total:all.length});return true;}
 const proofMatch=path.match(/^\/api\/arcana-archive\/claims\/([0-9a-f-]{36})\/proof$/);
 if(proofMatch&&method==='GET'){await requireCapability(req,'character:review');const row=await readJSON(claimFile(proofMatch[1]));if(!row)throw err(404,'Claim not found.');sendJSON(res,200,{proof:row.proof,claim:safeClaim(row)});return true;}
 const review=path.match(/^\/api\/arcana-archive\/claims\/([0-9a-f-]{36})$/);
 if(review&&method==='PATCH'){
  checkOrigin(req);const actor=await requireCapability(req,'character:review'),data=await parseJSON(req),status=clean(data.status,15),note=clean(data.note,300);
  if(!['approved','rejected','revoked'].includes(status))throw err(422,'Invalid review decision.');
  if(status!=='approved'&&note.length<5)throw err(422,'Enter a reason.');
  const row=await queued(async()=>{
   const row=await readJSON(claimFile(review[1]));if(!row)throw err(404,'Claim not found.');
   if(status==='revoked'&&row.status!=='approved'||status!=='revoked'&&row.status!=='pending')throw err(409,'Claim cannot be reviewed in this state.');
   if(status==='approved'&&(await claims()).some(c=>c.id!==row.id&&c.status==='approved'&&c.name.toLocaleLowerCase()===row.name.toLocaleLowerCase()))throw err(409,'This character name is already linked.');
   const user=await readJSON(userFile(row.id));if(!user)throw err(404,'Account not found.');
   const now=new Date().toISOString();row.status=status;row.reviewedAt=now;row.reviewerId=actor.id;row.note=note;row.history=[...(row.history||[]).slice(-20),{action:status,by:actor.id,at:now,note}];
   await saveAtomic(claimFile(row.id),row);
   user.profile={...user.profile,characterClaim:{status,name:row.name},verifiedCharacter:status==='approved'?{status:'approved',name:row.name,approvedAt:now}:null};
   await saveAtomic(userFile(row.id),user);return row;
  });
  sendJSON(res,200,{claim:safeClaim(row)});return true;
 }
 if(path==='/api/arcana-archive/records'&&method==='POST'){
  checkOrigin(req);const actor=await requireCapability(req,'records:manage'),entry=seasonalEntry(await parseJSON(req));
  const db=await queued(async()=>{const db=await readRecords();if(db.records.some(x=>recordKey(x)===recordKey(entry)))throw err(409,'This season/rank already has a record.');
   const now=new Date().toISOString();db.records.push({...entry,id:randomUUID(),createdAt:now,updatedAt:now,editorId:actor.id});db.revision++;await saveAtomic(archiveFile(),db);return db;});
  sendJSON(res,201,db);return true;
 }
 const record=path.match(/^\/api\/arcana-archive\/records\/([0-9a-f-]{36})$/);
 if(record&&['PATCH','DELETE'].includes(method)){
  checkOrigin(req);const actor=await requireCapability(req,'records:manage'),input=method==='PATCH'?seasonalEntry(await parseJSON(req)):null;
  const db=await queued(async()=>{const db=await readRecords(),i=db.records.findIndex(x=>x.id===record[1]);if(i<0)throw err(404,'Record not found.');
   if(method==='DELETE')db.records.splice(i,1);else{const updated={...db.records[i],...input,updatedAt:new Date().toISOString(),editorId:actor.id};if(db.records.some((x,j)=>j!==i&&recordKey(x)===recordKey(updated)))throw err(409,'This rank already has a record.');db.records[i]=updated;}
   db.revision++;await saveAtomic(archiveFile(),db);return db;});sendJSON(res,200,db);return true;
 }
 return false;
}
export async function safeCommunityArchive(req,res,url){try{return await handleCommunityArchive(req,res,url)}catch(e){if(e.status>=400&&e.status<500)sendJSON(res,e.status,{error:e.message});else{console.error('Arcana archive:',e);sendJSON(res,500,{error:'Archive unavailable.'})}return true;}}
