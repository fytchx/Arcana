import {
 QUICK_PET_SOURCES,blankQuickPetSetup,normalizeQuickPetSetup,compareQuickPetSetups,
} from './damage-pet-quick-engine.js';

const KEY='arcana:damage:pet-quick-four-slots:v1';
const clone=x=>JSON.parse(JSON.stringify(x));
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decimal=x=>Number.isFinite(x)?x.toLocaleString('en-US',{maximumFractionDigits:2}):'Unknown';
const blank=()=>({current:blankQuickPetSetup(),proposed:blankQuickPetSetup()});
let stored=null;
function load(){
 if(stored)return stored;
 try{
  const data=JSON.parse(localStorage.getItem(KEY)||'null');
  if(Array.isArray(data?.current)&&Array.isArray(data?.proposed)){
   stored={current:normalizeQuickPetSetup(data.current),proposed:normalizeQuickPetSetup(data.proposed)};
   return stored;
  }
 }catch{}
 stored=blank();return stored;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(stored))}catch{}}
function rows(kind){
 const setup=load()[kind];
 return setup.map((row,i)=>'<div class="dcPetQuickRow"><span class="dcPetSlot">Slot '+(i+1)+'</span>'+
  '<label>Source<select data-dc-pet-source="'+kind+'" data-dc-pet-index="'+i+'" aria-label="'+(kind==='current'?'Current':'Proposed')+' pet '+(i+1)+' bonus type">'+
  QUICK_PET_SOURCES.map(s=>'<option value="'+escape(s.id)+'"'+(s.id===row.source?' selected':'')+'>'+escape(s.label)+'</option>').join('')+'</select></label>'+
  '<label>Value<input type="number" inputmode="decimal" step="any" min="0" data-dc-pet-value="'+kind+'" data-dc-pet-index="'+i+'" aria-label="'+(kind==='current'?'Current':'Proposed')+' pet '+(i+1)+' bonus value"'+
  (row.source==='none'?' disabled':'')+' value="'+(row.value===null?'':escape(row.value))+'"></label></div>').join('');
}
function results(build){
 const result=compareQuickPetSetups(build,load().current,load().proposed);
 if(!result.known)return '<p role="status" class="dcPetQuickUnknown">'+escape(result.reason)+
  (result.missing?.length?'<small>'+result.missing.map(escape).join(' · ')+'</small>':'')+'</p>';
 const change=result.percentChange;
 const delta=(change>=0?'+':'')+decimal(change)+'%';
 return '<div class="dcPetQuickSummary" role="status"><div><small>Current four slots</small><strong>×'+decimal(result.measuredMultiplier)+'</strong></div>'+
  '<div><small>Proposed four slots</small><strong>×'+decimal(result.proposedMultiplier)+'</strong></div>'+
  '<div><small>Relative pet multiplier change</small><strong>'+escape(delta)+'</strong></div></div>'+
  (result.damageRange?'<p class="dcValidation">Projected per-pet pre-crit damage '+decimal(result.damageRange.min)+'–'+decimal(result.damageRange.max)+'.</p>':
   '<p class="dcValidation">Actual pet damage not shown: the raw pre-bonus pet base is unknown. Multiplier comparison only.</p>')+
  (result.stages.length?'<button type="button" class="btn primary" data-dc-pet-apply>Send proposed sources to what-if</button>'+ 
  '<details class="dcPetQuickBreakdown"><summary>Show source-level changes</summary>'+
   result.stages.map(x=>'<div class="dcPetQuickStage"><span>'+escape(x.source)+'</span><b>'+decimal(x.measuredBaseline)+'% → '+decimal(x.proposedStage)+'%</b></div>').join('')+
   '</details>':'');
}
function update(root,getBuild){
 const host=root.querySelector('#dcPetQuickResult');
 if(host)host.innerHTML=results(getBuild());
}
export function petQuickCompareView(){
 return '<style>'+
 '.dcRoot .dcPetQuick{border:1px solid #7775;border-radius:14px;padding:14px;margin:16px 0;background:#6f638215}'+
 '.dcRoot .dcPetQuick h3{margin:0 0 8px}.dcRoot .dcPetQuick p{line-height:1.5;font-size:13px;opacity:.85}'+
 '.dcRoot .dcPetQuickColumns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}'+
 '.dcRoot .dcPetQuickColumn{min-width:0;border:1px solid #7775;border-radius:12px;padding:10px}'+
 '.dcRoot .dcPetQuickColumn h4{margin:4px 0 10px}'+
 '.dcRoot .dcPetQuickRow{display:grid;grid-template-columns:1fr 100px;gap:8px;align-items:end;padding:10px 0;border-bottom:1px solid #7774}'+
 '.dcRoot .dcPetQuickRow:last-child{border-bottom:0}'+
 '.dcRoot .dcPetQuickRow .dcPetSlot{grid-column:1/-1;font-weight:700;font-size:12px}'+
 '.dcRoot .dcPetQuickRow label{font-size:12px;display:grid;gap:6px;min-width:0}'+
 '.dcRoot .dcPetQuickRow select,.dcRoot .dcPetQuickRow input{width:100%;min-width:0;min-height:44px;font-size:16px}'+
 '.dcRoot .dcPetQuickActions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}'+
 '.dcRoot .dcPetQuickActions button{min-height:44px}'+
 '.dcRoot .dcPetQuickSummary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:14px 0}'+
 '.dcRoot .dcPetQuickSummary>div{border:1px solid #7775;border-radius:12px;padding:12px;display:grid;gap:8px;min-width:0}'+
 '.dcRoot .dcPetQuickSummary strong{font-size:clamp(16px,3.5vw,23px);overflow-wrap:anywhere}'+
 '.dcRoot .dcPetQuickSummary small{font-size:12px;opacity:.75}'+
 '.dcRoot .dcPetQuickUnknown{border:1px solid #d5b56b66;border-radius:10px;padding:10px}'+
 '.dcRoot .dcPetQuickUnknown small{display:block;margin-top:5px}'+
 '.dcRoot .dcPetQuickBreakdown summary{min-height:44px;padding:12px 0;cursor:pointer}'+
 '.dcRoot .dcPetQuickStage{display:flex;justify-content:space-between;gap:8px;padding:8px 0;font-size:12px;border-bottom:1px solid #7774}'+
 '@media(max-width:670px){.dcRoot .dcPetQuickColumns{grid-template-columns:1fr}.dcRoot .dcPetQuickSummary{grid-template-columns:1fr}.dcRoot .dcPetQuickRow{grid-template-columns:minmax(0,1fr) 100px}}'+
 '</style><section class="dcPetQuick" id="dcPetQuick" data-dc-panel="pet" hidden>'+
 '<h3>Four-slot Pet comparison</h3>'+
 '<p>Compare two setups without re-entering your whole character. <b>Current</b> is already included in the measured Pet Damage breakdown. Proposed bonuses REPLACE those contributions. Enter the bonus values for each slot, choosing the matching breakdown row. This is not a pet rarity/roll generator.</p>'+
 '<p><b>INT/DEX:</b> enter effective character-sheet points added by that pet, after any Increased INT/DEX scaling. Raw increased-stat percentages cannot safely be converted without knowing the affected stat pool. Those must be converted to effective points first.</p>'+
 '<div class="dcPetQuickColumns"><section class="dcPetQuickColumn"><h4>Current setup (A)</h4><div id="dcPetCurrent"></div></section>'+
 '<section class="dcPetQuickColumn"><h4>Proposed setup (B)</h4><div id="dcPetProposed"></div></section></div>'+
 '<div class="dcPetQuickActions"><button type="button" class="btn secondary" data-dc-pet-demo>Example: 2 vs 4 (+20pp)</button>'+
 '<button type="button" class="btn secondary" data-dc-pet-copy>Copy current → proposed</button>'+
 '<button type="button" class="btn secondary" data-dc-pet-reset>Reset four slots</button></div>'+
 '<div id="dcPetQuickResult" aria-live="polite"></div>'+
 '<p class="dcValidation">The example uses illustrative +20 percentage-point contributions to the measured equipment Pet Damage row, not real pet hatch-roll promises. Only the observed Pet multiplier stages are compared. This does NOT predict real DPS, combat procs, pet base scaling, ACS, or how unverified hatch bonuses feed the tooltip. A missing breakdown source must be entered in the Pets tab first.</p></section>';
}
export function mountPetQuickCompare(root,getBuild){
 const panel=root?.querySelector('#dcPetQuick');
 if(!panel||panel.dataset.petQuickMounted==='yes')return;
 panel.dataset.petQuickMounted='yes';load();
 function repaint(){
  panel.querySelector('#dcPetCurrent').innerHTML=rows('current');
  panel.querySelector('#dcPetProposed').innerHTML=rows('proposed');
  update(root,getBuild);
 }
 repaint();
 panel.addEventListener('input',event=>{
  const field=event.target;
  if(!field.matches('[data-dc-pet-value]'))return;
  const setup=field.dataset.dcPetValue;
  const index=Number(field.dataset.dcPetIndex);
  stored[setup][index].value=field.value===''?null:Number(field.value);
  stored[setup]=normalizeQuickPetSetup(stored[setup]);
  save();update(root,getBuild);
 });
 panel.addEventListener('change',event=>{
  const field=event.target;
  if(!field.matches('[data-dc-pet-source]'))return;
  const setup=field.dataset.dcPetSource;
  const index=Number(field.dataset.dcPetIndex);
  stored[setup][index]={source:field.value,value:field.value==='none'?0:null};
  stored[setup]=normalizeQuickPetSetup(stored[setup]);
  save();repaint();
 });
 panel.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.hasAttribute('data-dc-pet-apply')){
   const comparison=compareQuickPetSetups(getBuild(),stored.current,stored.proposed);
   if(comparison.known&&comparison.stages.length)panel.dispatchEvent(
    new CustomEvent('dc-apply-pet-comparison',{bubbles:true,
     detail:{stages:comparison.stages.map(s=>({source:s.source,value:s.proposedStage}))}})
   );
   return;
  }
  if(button.hasAttribute('data-dc-pet-demo')){
   const row=()=>({source:'petEquipmentPct',value:20});
   stored={current:[row(),row(),{source:'none',value:0},{source:'none',value:0}],
           proposed:[row(),row(),row(),row()]};
   save();repaint();return;
  }
  if(button.hasAttribute('data-dc-pet-reset')){stored=blank();save();repaint();}
  if(button.hasAttribute('data-dc-pet-copy')){stored.proposed=clone(stored.current);save();repaint();}
 });
 // Main damage inputs / what-if scenarios live outside this section.
 return ()=>update(root,getBuild);
}
export function refreshPetQuickCompare(root,getBuild){
 if(root?.querySelector('#dcPetQuick')?.dataset.petQuickMounted==='yes')update(root,getBuild);
}
