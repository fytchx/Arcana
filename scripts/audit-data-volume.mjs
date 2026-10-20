#!/usr/bin/env node
// Read-only private data integrity check. NEVER emits record contents or user IDs.
import {lstat,readdir,readFile} from 'node:fs/promises';
import {resolve,relative,sep,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const GROUPS=Object.freeze({
 accounts:['accounts/users','accounts/sessions','accounts/discord','accounts/community','accounts/guild-hub','accounts/admin','accounts/general-chat','accounts/journal','accounts/traffic'],
 wiki:['articles','revisions','history'],
 feedback:['beta-feedback']
});
const JSON_LIMIT=20*1024*1024;
const fresh=()=>({files:0,bytes:0,json:0,invalidJson:0,symlinks:0,oversizedJson:0,groups:{}});
export async function auditDataTree(root){
 const rootPath=resolve(root),summary=fresh();
 const top=await lstat(rootPath);
 if(!top.isDirectory()||top.isSymbolicLink())throw Error('The target must be a real directory.');
 async function walk(directory){
  for(const item of await readdir(directory,{withFileTypes:true})){
   const filename=join(directory,item.name);
   const entry=await lstat(filename);
   if(entry.isSymbolicLink()){summary.symlinks++;continue;}
   if(entry.isDirectory()){await walk(filename);continue;}
   if(!entry.isFile())continue;
   const rel=relative(rootPath,filename);
   if(rel.startsWith('..'+sep)||rel==='..')throw Error('Unsafe path outside audit root');
   const group=rel.split(sep)[0]||'(root)';
   const counter=summary.groups[group]||(summary.groups[group]={files:0,bytes:0,invalidJson:0});
   summary.files++;counter.files++;
   summary.bytes+=entry.size;counter.bytes+=entry.size;
   if(!item.name.endsWith('.json'))continue;
   summary.json++;
   if(entry.size>JSON_LIMIT){summary.oversizedJson++;continue;}
   try{JSON.parse(await readFile(filename,'utf8'));}
   catch{summary.invalidJson++;counter.invalidJson++;}
  }
 }
 await walk(rootPath);
 return {...summary,ok:summary.invalidJson===0&&summary.symlinks===0&&summary.oversizedJson===0};
}
export function dataLocations(env=process.env){
 const wiki=resolve(env.ARCANA_WIKI_DATA_DIR||'.arcana-wiki-data');
 const accounts=resolve(env.ARCANA_ACCOUNT_DATA_DIR||join(wiki,'accounts'));
 const feedback=resolve(env.ARCANA_BETA_FEEDBACK_DIR||join(wiki,'beta-feedback'));
 const traffic=resolve(env.ARCANA_TRAFFIC_DATA_DIR||join(accounts,'traffic'));
 return {wiki,accounts,feedback,traffic};
}
export async function auditConfiguredData(env=process.env){
 const locations=dataLocations(env),unique=[...new Set(Object.values(locations))];
 const audited=[];
 for(const path of unique){
  let result;
  try{result=await auditDataTree(path);}
  catch(error){result={ok:false,files:0,bytes:0,json:0,invalidJson:0,symlinks:0,oversizedJson:0,groups:{},error:error?.code==='ENOENT'?'directory missing':'directory inaccessible'};}
  audited.push({scope:Object.entries(locations).filter(([,p])=>p===path).map(([k])=>k),...result});
 }
 // A detached data root is not automatically wrong, but must be included in snapshots.
 return {ok:audited.every(x=>x.ok),roots:audited.length,scopes:audited.map(({scope,ok,files,bytes,json,invalidJson,symlinks,oversizedJson,error,groups})=>({scope,ok,files,bytes,json,invalidJson,symlinks,oversizedJson,error,groups}))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await auditConfiguredData();
 // Only aggregate counts and configured scope names; no personal data, filenames or file contents.
 console.log(JSON.stringify(result,null,2));
 if(!result.ok)process.exitCode=1;
}
