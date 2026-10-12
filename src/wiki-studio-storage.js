import {normalizeWikiDraft} from './wiki-studio-model.js';
const DB_NAME='arcana-wiki-studio';const STORE='drafts';const DB_VERSION=1;
let dbPromise=null;
function db(){
 if(!('indexedDB' in globalThis))return Promise.reject(Error('IndexedDB unavailable. Export your draft before closing this tab.'));
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,DB_VERSION);
  request.onupgradeneeded=()=>{const d=request.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'recordId'});};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||Error('Could not open draft storage.'));
 }).catch(e=>{dbPromise=null;throw e;});
 return dbPromise;
}
function transaction(method,key,value){
 return db().then(connection=>new Promise((resolve,reject)=>{
  const tx=connection.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);
  const req=method==='put'?store.put(value):method==='delete'?store.delete(key):method==='get'?store.get(key):store.getAll();
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('Draft storage failed.'));
 }));
}
export const listWikiDrafts=()=>transaction('list').then(rows=>rows.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))));
export const getWikiDraft=id=>transaction('get',id);
export const deleteWikiDraft=id=>transaction('delete',id);
export const putWikiDraft=raw=>{
 const normalized=normalizeWikiDraft(raw),recordId=String(raw?.recordId||'draft-'+Date.now()+'-'+Math.random().toString(36).slice(2,8));
 const saved={...normalized,recordId,updatedAt:new Date().toISOString()};
 return transaction('put',null,saved).then(()=>saved);
};
