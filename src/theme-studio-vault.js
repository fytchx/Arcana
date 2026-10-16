import {readDesign,replaceDesignDraft,DESIGN_FIELDS,DEFAULT_DESIGN,validateDesignField} from './design-controls.js';
import {esc} from './ui.js';

const KEY='arcana-owner-theme-snapshots-v1';
const SLOT_COUNT=4;
const safeList=()=>{
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||'[]');
  return Array.isArray(raw)?raw.slice(0,SLOT_COUNT):[];
 }catch{return []}
};
const persist=v=>localStorage.setItem(KEY,JSON.stringify(v));
const isValid=x=>x&&typeof x==='object'&&!Array.isArray(x)&&['main','card','action','text','pattern','buttonText'].every(k=>validateDesignField(k,x[k])!==null)&&Object.keys(x).every(k=>DESIGN_FIELDS.includes(k)&&validateDesignField(k,x[k])!==null);
const migrate=x=>Object.fromEntries(DESIGN_FIELDS.map(k=>[k,validateDesignField(k,x?.[k])??DEFAULT_DESIGN[k]]));
export const themeVaultMarkup=()=>{
 const all=safeList();
 const cards=Array.from({length:SLOT_COUNT},(_,slot)=>{
  const x=all[slot],ready=x&&isValid(x.design);
  return '<div class="themeVaultSlot"><div class="themeVaultSlotInfo">'+
  (ready?'<span class="themeVaultSwatches" style="--vault-base:'+esc(x.design.main)+';--vault-panel:'+esc(x.design.card)+';--vault-accent:'+esc(x.design.action)+'"></span>':'<span class="themeVaultEmpty">+</span>')+
  '<span><strong>'+esc(ready?x.name:'Empty slot '+(slot+1))+'</strong><small>'+esc(ready?new Date(x.savedAt).toLocaleString():'Available for your next idea')+'</small></span></div>'+
  '<div class="themeVaultActions"><button type="button" data-theme-save="'+slot+'">Save</button>'+
  (ready?'<button type="button" data-theme-load="'+slot+'">Load</button><button type="button" data-theme-clear="'+slot+'" aria-label="Clear slot '+(slot+1)+'">×</button>':'')+
  '</div></div>';
 }).join('');
 return '<div class="themeVaultHeader"><h3>Design vault</h3><p>Four local drafts to experiment without losing your favorite look. These are not public themes.</p></div>'+
 '<div class="themeVaultGrid">'+cards+'</div>'+
 '<details class="themeVaultTransfer"><summary>Move a theme between devices</summary>'+
 '<p>Export the design as JSON to copy it to a different browser. Nothing is uploaded until you publish.</p>'+
 '<div class="themeVaultTransferActions"><button type="button" class="btn secondary" data-theme-export>Copy current theme JSON</button><button type="button" class="btn secondary" data-theme-import>Import JSON below</button></div>'+
 '<label>Paste a Theme Studio export<textarea data-theme-json rows="4" spellcheck="false" placeholder="Paste exported JSON here"></textarea></label>'+
 '</details>';
};
export function wireThemeVault({onLoad,toast}){
 if(typeof document==='undefined')return;
 document.addEventListener('click',async e=>{
  const b=e.target.closest('button[data-theme-save],button[data-theme-load],button[data-theme-clear],button[data-theme-export],button[data-theme-import]');
  if(!b||!b.closest('.arcanaDesignLab')||document.documentElement.dataset.arcanaAdminDesign!=='true')return;
  const all=safeList(),slot=Number(b.dataset.themeSave??b.dataset.themeLoad??b.dataset.themeClear);
  try{
   if(b.hasAttribute('data-theme-save')){
    if(!Number.isInteger(slot)||slot<0||slot>=SLOT_COUNT)return;
    const old=all[slot];
    const label=prompt('Name your design snapshot',old?.name||'Theme idea '+(slot+1));
    if(label===null)return;
    const name=String(label).trim().slice(0,55)||'Theme idea '+(slot+1);
    all[slot]={name,savedAt:new Date().toISOString(),design:readDesign()};
    persist(all);toast('Saved '+name+' to your design vault.');
   }else if(b.hasAttribute('data-theme-load')){
    const picked=all[slot];
    if(!picked||!isValid(picked.design))throw Error('That saved theme is incomplete.');
    if(!replaceDesignDraft(migrate(picked.design)))throw Error('Could not restore this theme.');
    onLoad?.();toast('Loaded '+picked.name+'. This is only a preview.');
   }else if(b.hasAttribute('data-theme-clear')){
    if(!all[slot]||!confirm('Clear this locally saved theme?'))return;
    all[slot]=null;persist(all);toast('Draft slot cleared.');
   }else if(b.hasAttribute('data-theme-export')){
    const json=JSON.stringify({format:'arcana-theme-v1',design:readDesign()},null,2);
    await navigator.clipboard.writeText(json);toast('Theme JSON copied to clipboard.');
   }else if(b.hasAttribute('data-theme-import')){
    const field=document.querySelector('.themeVaultTransfer [data-theme-json]');
    const data=JSON.parse(field?.value||'null');
    if(data?.format!=='arcana-theme-v1'||!isValid(data.design))throw Error('Invalid Theme Studio export. No changes made.');
    if(!confirm('Replace your local preview with this imported theme? Nothing will be published.'))return;
    if(!replaceDesignDraft(migrate(data.design)))throw Error('Could not import this theme.');
    onLoad?.();toast('Imported as a private preview. Publish separately when ready.');
   }
   if(b.hasAttribute('data-theme-save')||b.hasAttribute('data-theme-clear')){
    const box=document.getElementById('themeVaultContents');
    if(box)box.innerHTML=themeVaultMarkup();
   }
  }catch(error){toast(error?.message||'Theme vault action failed.')}
 });
}
