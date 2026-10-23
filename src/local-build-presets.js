const KEY='arcana-v3-local-presets-1';
const LIMIT=24;
const copy=value=>JSON.parse(JSON.stringify(value));
export function readLocalBuildPresets(){
 try{
  const rows=JSON.parse(localStorage.getItem(KEY)||'[]');
  return Array.isArray(rows)?rows.filter(row=>row&&typeof row.id==='string'&&row.build&&typeof row.build==='object').slice(0,LIMIT):[];
 }catch{return []}
}
export function saveLocalBuildPreset(build){
 if(!build||typeof build!=='object')return null;
 const rows=readLocalBuildPresets();
 if(rows.length>=LIMIT)return null;
 const id='local-preset-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
 const title=String(build.title||'Untitled Build').trim().slice(0,100)||'Untitled Build';
 const row={id,title,className:String(build.className||'Warrior'),monsterLevel:Math.max(1,Number(build.monsterLevel)||1),updatedAt:new Date().toISOString(),build:copy(build)};
 try{localStorage.setItem(KEY,JSON.stringify([row,...rows]));return row}catch{return null}
}
export function removeLocalBuildPreset(id){
 const rows=readLocalBuildPresets(),next=rows.filter(row=>row.id!==String(id));
 if(next.length===rows.length)return false;
 try{localStorage.setItem(KEY,JSON.stringify(next));return true}catch{return false}
}
export function localBuildPresetById(id){return readLocalBuildPresets().find(row=>row.id===String(id))||null}
