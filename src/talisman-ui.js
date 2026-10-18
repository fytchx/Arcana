import {TALISMAN_TYPES,TALISMAN_INSCRIPTIONS,TALISMAN_STAT_LABELS,TALISMAN_SOURCE} from './talisman-reference.js';
import {normalizeTalisman,normalizeTalismanLoadout,compareTalismanLoadouts} from './talisman-model.js';
import {loadDraft} from './session.js';

const key='arcana:damage:talisman-lab:2026-10-18';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const opt=(v,selected)=>'<option value="'+esc(v)+'" '+(v===selected?'selected':'')+'>'+esc(v||'Not selected')+'</option>';
function slotMarkup(slot,index,mode,side='',readonly=false){
 const base='data-talisman-slot="'+index+'" '+(side?'data-talisman-side="'+side+'" ':'');
 const attr=mode==='studio'?'data-build-talisman':'data-dct-field';
 const readonlyAttr=readonly?'disabled':'';
 const name=TALISMAN_TYPES.find(x=>x.slug===slot.slug)?.name||'Empty talisman slot';
 const slugOptions='<option value="">Not selected</option>'+TALISMAN_TYPES.map(type=>
  '<option value="'+type.slug+'" '+(type.slug===slot.slug?'selected':'')+'>'+esc(type.name)+'</option>').join('');
 const entries=Object.entries(TALISMAN_INSCRIPTIONS).map(([stat,rule])=>
  '<label class="arcTalismanInput"><span>'+esc(TALISMAN_STAT_LABELS[stat])+' ('+esc(rule.suffix||'points')+')</span>'+
  '<input '+attr+'="inscription" '+base+'data-talisman-stat="'+stat+'" type="number" min="0" max="1000000000" step="any" inputmode="decimal" value="'+
  (slot.inscriptions[stat]===undefined?'':esc(slot.inscriptions[stat]))+'" placeholder="Unknown" '+readonlyAttr+'></label>').join('');
 return '<article class="arcTalismanSlot"><h4>Slot '+(index+1)+' · '+esc(name)+'</h4>'+
  '<div class="arcTalismanPrimary"><label><span>Talisman</span><select '+attr+'="slug" '+base+readonlyAttr+'>'+slugOptions+'</select></label>'+
  '<label><span>Level</span><input '+attr+'="level" '+base+'type="number" min="0" max="9" inputmode="numeric" placeholder="Unknown" value="'+
  (slot.level===null?'':slot.level)+'" '+readonlyAttr+'></label></div>'+
  '<details class="arcTalismanRolls"><summary>Inscription totals (optional)</summary><p>Enter observed stat totals, not guesses. Empty means unknown; 0 is a measured zero.</p>'+
  '<div class="arcTalismanRollGrid">'+entries+'</div></details></article>';
}
export function talismanBuildStudioView(build,readonly=false){
 const items=normalizeTalismanLoadout(build?.talismans);
 return '<section class="sectionCard arcTalismanPanel" aria-label="Talisman loadout">'+
  '<style>'+css+'</style><h3>Talismans</h3><p class="arcTalismanHint">Two optional talisman slots. Configured base stats follow the selected level. Enter inscription totals only when you know them. Stored with this build and included when you choose Share. A selected JSON file is processed locally: only talisman types, levels and inscription totals are retained; other fields are discarded.</p>'+
  (!readonly?'<label class="arcTalismanFile"><span>Import talismans from a local JSON response (optional)</span><input type="file" accept=".json,application/json" data-build-talisman-file aria-label="Import talismans from JSON"></label>':'')+
  '<div class="arcTalismanColumns">'+items.map((t,i)=>slotMarkup(t,i,'studio','',readonly)).join('')+'</div>'+
  '<p class="arcTalismanSource">'+esc(TALISMAN_SOURCE)+' · Talismans do not automatically inflate full damage outputs.</p></section>';
}
const blankLab=()=>({current:normalizeTalismanLoadout(),proposed:normalizeTalismanLoadout()});
let lab=null;
function getLab(){
 if(lab)return lab;
 try{const s=JSON.parse(localStorage.getItem(key)||'null');if(s&&Array.isArray(s.current)&&Array.isArray(s.proposed)){
  lab={current:normalizeTalismanLoadout(s.current),proposed:normalizeTalismanLoadout(s.proposed)};return lab;
 }}catch{}
 lab=blankLab();return lab;
}
function save(){try{localStorage.setItem(key,JSON.stringify(lab));}catch{}}
function resultMarkup(){
 const result=compareTalismanLoadouts(lab.current,lab.proposed);
 let markup='<div class="arcTalismanSummary"><h4>Changed talisman contributions</h4>';
 if(result.rows.length)markup+='<div class="arcTalismanTable">'+result.rows.map(row=>{
  const delta=row.delta===null?'Unmeasured':(row.delta>=0?'+':'')+fmt(row.delta)+(row.suffix||'');
  return '<div><span>'+esc(row.label)+'</span><span>'+esc(row.current===null?'Unknown':fmt(row.current))+'</span><span>'+
   esc(row.proposed===null?'Unknown':fmt(row.proposed))+'</span><strong>'+esc(delta)+'</strong></div>';
 }).join('')+'</div><small>Columns: source · current · proposed · change. Only directly entered or configured base contributions are compared.</small>';
 else markup+='<p>Choose a talisman, level, or inscription total to begin. No personal-character examples are preloaded.</p>';
 if(result.current.unresolved.length||result.proposed.unresolved.length){
  markup+='<p class="arcTalismanHint">'+esc([...result.current.unresolved,...result.proposed.unresolved].join(' '))+'</p>';
 }
 return markup+'</div>';
}
function show(root){
 const panel=root?.querySelector('#dcTalismanLab');if(!panel)return;
 const state=getLab();
 panel.innerHTML='<h3>Talisman A/B</h3>'+
  '<p class="arcTalismanHint">Compare the configured effects of talisman types, levels, and whatever inscription totals you know. No API or account connection required. This is a source-level comparison, not a fabricated full DPS result.</p>'+
  '<div class="arcTalismanActions"><button type="button" class="btn secondary" data-dct-action="import">Load current from Build Studio</button>'+
  '<button type="button" class="btn secondary" data-dct-action="copy">Copy current to proposed</button>'+
  '<button type="button" class="btn secondary" data-dct-action="clear">Clear talisman comparison</button>'+
  '<button type="button" class="btn secondary" data-route="labs/build">Edit Build Studio</button></div>'+
  '<div class="arcTalismanColumns"><section><h4>Current</h4>'+state.current.map((t,i)=>slotMarkup(t,i,'lab','current')).join('')+'</section>'+
  '<section><h4>Proposed</h4>'+state.proposed.map((t,i)=>slotMarkup(t,i,'lab','proposed')).join('')+'</section></div>'+
  resultMarkup()+
  '<p class="arcTalismanSource">'+esc(TALISMAN_SOURCE)+'. Equipped base stats and entered inscriptions are additive within each named stat. Missing inscription totals remain unknown. Sacrifices, overflow, proc timing and full-damage stacking are not yet included.</p>';
}
const css='.arcTalismanFile{display:grid;gap:5px;font-size:13px}.arcTalismanFile input{max-width:100%;min-height:42px}.arcTalismanPanel,.dcRoot #dcTalismanLab{min-width:0}.arcTalismanColumns{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:14px;margin:12px 0}.arcTalismanSlot{border:1px solid #85829a55;border-radius:12px;padding:12px;margin:8px 0;background:#75829b10;min-width:0}.arcTalismanSlot h4{margin:0 0 9px;font-size:14px}.arcTalismanSlot label,.arcTalismanPrimary label{display:grid;gap:5px;font-size:12px}.arcTalismanPrimary{display:grid;grid-template-columns:minmax(0,2fr) minmax(90px,1fr);gap:8px}.arcTalismanSlot select,.arcTalismanSlot input{width:100%;min-width:0;max-width:100%;min-height:42px;padding:8px;background:var(--field,#242635);color:var(--text,#fff);border:1px solid #89879e66;border-radius:9px}.arcTalismanRolls{margin-top:12px}.arcTalismanRolls summary{cursor:pointer;padding:9px 0;min-height:40px}.arcTalismanRolls p,.arcTalismanHint,.arcTalismanSource{font-size:12px;line-height:1.55;opacity:.82}.arcTalismanRollGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));gap:9px}.arcTalismanActions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.arcTalismanActions button{min-height:42px}.arcTalismanSummary{padding:12px;border:1px solid #85829a55;border-radius:12px}.arcTalismanTable{display:grid;gap:6px;overflow-x:auto}.arcTalismanTable>div{display:grid;grid-template-columns:minmax(125px,1.5fr) repeat(3,minmax(70px,1fr));gap:8px;padding:7px;border-bottom:1px solid #7774;font-size:12px;align-items:center;min-width:410px}.arcTalismanTable strong{color:var(--accent,#b89bff)}';
export function talismanLabView(){return '<style>'+css+'</style><section data-dc-panel="talismans" id="dcTalismanLab" hidden></section>';}
export function mountTalismanLab(root){
 const panel=root?.querySelector('#dcTalismanLab');if(!panel||panel.dataset.bound==='yes')return;
 panel.dataset.bound='yes';show(root);
 panel.addEventListener('change',e=>{
  const input=e.target.closest('[data-dct-field]');if(!input)return;
  const side=input.dataset.talismanSide,idx=Number(input.dataset.talismanSlot);
  if(!['current','proposed'].includes(side)||!Number.isInteger(idx)||idx<0||idx>1)return;
  const next=structuredClone(getLab()[side][idx]);
  if(input.dataset.dctField==='slug'){next.slug=input.value;next.level=null;next.inscriptions={};}
  else if(input.dataset.dctField==='level'){next.level=input.value.trim()===''?null:Number(input.value);}
  else if(input.dataset.dctField==='inscription'){
   const stat=input.dataset.talismanStat;if(!Object.hasOwn(TALISMAN_INSCRIPTIONS,stat))return;
   if(input.value.trim()==='')delete next.inscriptions[stat];else next.inscriptions[stat]=Number(input.value);
  }else return;
  lab[side][idx]=normalizeTalisman(next);save();show(root);
 });
 panel.addEventListener('click',e=>{
  const button=e.target.closest('[data-dct-action]');if(!button)return;
  if(button.dataset.dctAction==='clear')lab=blankLab();
  if(button.dataset.dctAction==='copy')lab.proposed=normalizeTalismanLoadout(lab.current);
  if(button.dataset.dctAction==='import'){
   const draft=loadDraft();
   if(!draft){const p=panel.querySelector('.arcTalismanHint');if(p)p.textContent='No saved Build Studio draft found on this device.';return;}
   lab.current=normalizeTalismanLoadout(draft.talismans);
  }
  save();show(root);
 });
}
