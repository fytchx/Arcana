// Owner-only download of everything the site has saved: accounts, sessions, Handbook edits,
// guilds, community posts, wiki pages, feedback and traffic. Streams one .tar.gz.
// Only the Creator role can use it. Nothing is changed on the server.
import {createReadStream} from 'node:fs';
import {readdir,stat} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
import {createGzip} from 'node:zlib';
import {accountUser,sendJSON,dataRoot} from './account-server.mjs';
import {can} from './account-policy.js';

// Every place the site writes data. Folders inside another one are only included once.
export function dataFolders(env=process.env){
 const wiki=resolve(env.ARCANA_WIKI_DATA_DIR||'.arcana-wiki-data');
 const list=[wiki,dataRoot(),env.ARCANA_BETA_FEEDBACK_DIR&&resolve(env.ARCANA_BETA_FEEDBACK_DIR),env.ARCANA_TRAFFIC_DATA_DIR&&resolve(env.ARCANA_TRAFFIC_DATA_DIR)].filter(Boolean);
 return [...new Set(list)].filter((d,i,all)=>!all.some((o,j)=>j!==i&&d.startsWith(o+sep)));
}
async function walk(dir,out=[]){
 let entries;try{entries=await readdir(dir,{withFileTypes:true});}catch{return out;}
 for(const e of entries){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p,out);else if(e.isFile())out.push(p);}
 return out;
}
// Minimal POSIX tar (ustar). Long paths use the prefix field; anything longer is skipped and listed.
function header(name,size,mtime){
 const b=Buffer.alloc(512);
 let prefix='',base=name;
 if(Buffer.byteLength(name)>100){const cut=name.lastIndexOf('/',155);prefix=name.slice(0,cut);base=name.slice(cut+1);}
 if(Buffer.byteLength(base)>100||Buffer.byteLength(prefix)>155)return null;
 const put=(s,off,len)=>b.write(s,off,len,'utf8');
 const oct=(n,len)=>n.toString(8).padStart(len-1,'0')+'\0';
 put(base,0,100);put(oct(0o644,8),100,8);put(oct(0,8),108,8);put(oct(0,8),116,8);put(oct(size,12),124,12);put(oct(Math.floor(mtime/1000),12),136,12);
 put('        ',148,8);put('0',156,1);put('ustar\0',257,6);put('00',263,2);put(prefix,345,155);
 let sum=0;for(const x of b)sum+=x;put(sum.toString(8).padStart(6,'0')+'\0 ',148,8);
 return b;
}
export async function handleBackupRequest(req,res){
 const user=await accountUser(req);
 if(!user){sendJSON(res,401,{error:'Sign in to continue.'});return true;}
 if(!can(user,'roles:privileged')){sendJSON(res,403,{error:'Only the Creator can download a backup.'});return true;}
 const stamp=new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
 res.writeHead(200,{'content-type':'application/gzip','content-disposition':'attachment; filename="arcana-data-'+stamp+'.tar.gz"','cache-control':'no-store'});
 await writeBackup(res,dataFolders());
 return true;
}
// Writes the .tar.gz of the given folders to any writable stream.
export async function writeBackup(out,folders){
 const gz=createGzip();gz.pipe(out);
 const done=new Promise(ok=>out.once('finish',ok));
 const write=chunk=>new Promise(ok=>{if(gz.write(chunk))ok();else gz.once('drain',ok);});
 const skipped=[];let count=0;
 for(const [i,dir] of folders.entries()){
  for(const file of await walk(dir)){
   let info;try{info=await stat(file);}catch{continue;}
   const name='arcana-data/'+(folders.length>1?'part'+(i+1)+'/':'')+relative(dir,file).split(sep).join('/');
   const h=header(name,info.size,info.mtimeMs);if(!h){skipped.push(name);continue;}
   await write(h);
   let sent=0;
   for await(const chunk of createReadStream(file,{end:Math.max(0,info.size-1)})){if(!info.size)break;await write(chunk);sent+=chunk.length;}
   if(sent<info.size)await write(Buffer.alloc(info.size-sent)); // file shrank while reading
   const pad=(512-(info.size%512))%512;if(pad)await write(Buffer.alloc(pad));
   count++;
  }
 }
 const note=Buffer.from(JSON.stringify({createdAt:new Date().toISOString(),files:count,folders:folders.map((d,i)=>({part:folders.length>1?'part'+(i+1):'.',path:d})),skipped},null,2)+'\n');
 await write(header('arcana-data/BACKUP-INFO.json',note.length,Date.now()));await write(note);
 const pad=(512-(note.length%512))%512;if(pad)await write(Buffer.alloc(pad));
 await write(Buffer.alloc(1024));gz.end();
 await done;
 return count;
}
export async function safeBackupRequest(req,res){
 try{return await handleBackupRequest(req,res);}
 catch(e){console.error('Arcana backup:',e);if(!res.headersSent)sendJSON(res,500,{error:'Backup failed.'});else res.destroy();return true;}
}
