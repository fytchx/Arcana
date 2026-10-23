import {FORMULAS,fieldsFor,calculateFormula,readFormulaState,saveFormulaState} from './damage-formula.js';
import {parseFormulaText,recognizeFormulaScreenshots} from './damage-formula-import.js';
import {esc} from './ui.js';
let state=readFormulaState(),review=null,busy=false,importEpoch=0,saveFailed=false;
const fmt=n=>n===null?'—':n.toLocaleString('en-US',{maximumFractionDigits:2});
const compact=n=>{for(const [suffix,scale] of [['Q',1e15],['T',1e12],['B',1e9],['M',1e6],['K',1e3]])if(n>=scale)return (n/scale).toLocaleString('en-US',{maximumFractionDigits:3})+suffix;return fmt(n);};
const unitLabel=unit=>unit==='percent'?'% or ×':unit==='factor'?'×':unit==='percentOf'?'%':'flat';
const field=(f,value,reviewing=false)=>`<label class="formulaField"><span>${esc(f.label)} <small>${unitLabel(f.unit)}</small></span><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" ${reviewing?'data-formula-review':'data-formula-input'}="${f.id}" aria-label="${esc(f.label)}" value="${esc(value||'')}" placeholder="${f.unit==='percent'?'0%':f.unit==='factor'?'×1':'0'}"></label>`;
function persist(){saveFailed=!saveFormulaState(state);}
export function formulaResultMarkup(){
 const result=calculateFormula(state.mode,state.values[state.mode]);
 const errors=result.errors.length?'<p role="alert">'+result.errors.map(esc).join('<br>')+'</p>':'';
 if(!result.ready)return `<h2>Your damage</h2>${errors}<p>${result.missing.length?'Enter '+result.missing.map(esc).join(', ')+'.':'Check the highlighted values.'}</p><p class="formulaHint">Unused bonuses can stay blank; they contribute 0. Enter every applicable row to compare with your game.</p>`;
 return `<h2>${state.mode==='retaliation'?'Damage per enemy attack':state.mode==='pet'?"This pet’s damage":'Attack damage'}</h2><strong class="formulaTotal">${compact(result.min)} – ${compact(result.max)}</strong><p class="formulaExact">${fmt(result.min)} – ${fmt(result.max)}</p><p>Average: <strong>${fmt(result.average)}</strong></p>${result.blocked?`<p>Blocked attack: <strong>${compact(result.blocked.min)} – ${compact(result.blocked.max)}</strong><br><small>Shown separately; the blocked factor is not included in the ordinary range.</small></p>`:''}<p>Independent layer product: <strong>×${fmt(result.layerFactor)}</strong></p><details><summary>Show formula steps</summary><ol class="formulaSteps">${result.stages.map(s=>'<li><span>'+esc(s.label)+'</span><strong>'+fmt(s.min)+' – '+fmt(s.max)+'</strong></li>').join('')}</ol></details>`;
}
export function damageFormulaView(){
 const mode=state.mode;
 return `<div class="studioPage damageFormula"><nav class="arcanaCrumbs" aria-label="Page navigation"><button type="button" data-route="home">Home</button><span>›</span><button type="button" data-action="homemenu" data-arg="tools">Tools</button></nav><header class="sectionCard"><span class="eyebrow">DAMAGE FORMULA · TEST VERSION</span><h1>Damage Calculator</h1><p>Copy your in-game breakdown, then change any value to see its effect on total damage.</p><div class="formulaModes" role="group" aria-label="Damage type">${Object.entries(FORMULAS).map(([id,s])=>`<button type="button" class="btn ${id===mode?'primary':'secondary'}" data-formula-mode="${id}" aria-pressed="${id===mode}">${s.name}</button>`).join('')}</div><p class="formulaHint">Enter full numbers or K / M / B / T. Percentage rows accept <code>445.2</code>, <code>445.2%</code>, or <code>x5.452</code>. Use the bonus percentage, not the raw Strength / INT / DEX points.</p><p class="formulaHint">First visit starts blank. Inputs are saved on this browser for each mode. <button type="button" class="btn secondary" data-formula-clear>Clear ${FORMULAS[mode].name.toLowerCase()} fields</button></p><p id="formulaSave" role="status">${saveFailed?'Your browser could not save these inputs. Keep this page open.':''}</p></header><div class="formulaLayout"><div><section class="sectionCard"><details><summary>Import 1–3 screenshots (beta)</summary><p>Choose breakdown screenshots for the selected damage type. Review detected values before applying them. Images are read on your device and are not saved.</p><input aria-label="Upload damage breakdown screenshots" type="file" accept="image/png,image/jpeg,image/webp" multiple data-formula-files ${busy?'disabled':''}><p data-formula-progress role="status">${busy?'Reading screenshots…':''}</p><div data-formula-review-box></div></details></section>${FORMULAS[mode].groups.map(g=>`<section class="sectionCard"><h2>${esc(g.title)}</h2>${mode==='pet'&&g.id==='base'?'<p class="formulaHint">Enter the unmodified base and level scaling for one pet, before the bonuses below. The final damage on its card already includes bonuses and cannot be used as base damage.</p>':''}${mode==='retaliation'&&g.id==='event'?'<p class="formulaHint">Enter the minimum roll as a percentage of maximum (70 for a 70–100% range). Copy the stance and blocked-attack multipliers from the breakdown.</p>':''}<div class="formulaFields">${g.fields.map(f=>field({...f,id:g.id+'.'+f.key},state.values[mode][g.id+'.'+f.key])).join('')}</div></section>`).join('')}</div><aside><section class="sectionCard formulaResult" id="formulaResult" aria-live="polite" aria-atomic="true">${formulaResultMarkup()}</section><section class="sectionCard formulaHint"><strong>Matching the game</strong><p>Rounded tooltips (such as 1.48K%) can change the result. Use the most precise values available.</p><p>This test version follows the visible formula stages. Exact game rounding is still being validated; results may differ from the game’s final integer total. Crits, double hits and enemy defenses are not part of this breakdown.</p></section></aside></div></div>`;
}
function updateResult(){const box=document.getElementById('formulaResult');if(box)box.innerHTML=formulaResultMarkup();const status=document.getElementById('formulaSave');if(status)status.textContent=saveFailed?'Your browser could not save these inputs. Keep this page open.':'';}
function renderReview(root){
 const box=root.querySelector('[data-formula-review-box]');if(!box||!review)return;
 const specs=fieldsFor(state.mode);
 box.innerHTML=review.fields.length?`<h3>Review detected values</h3><p>Unchecked rows will stay as they are. Overlapping screenshots are counted once. ${review.conflicts.length?'Conflicting rows are unchecked—verify them before applying.':''}</p>${review.fields.map(row=>{const f=specs.find(f=>f.id===row.id);return `<div class="formulaReviewRow"><input type="checkbox" aria-label="Apply ${esc(f.label)}" data-formula-use="${row.id}" ${review.conflicts.includes(row.id)?'':'checked'}><div><small>${esc(FORMULAS[state.mode].groups.find(g=>g.id===f.group).title)}</small>${field(f,row.value,true)}</div></div>`;}).join('')}<button class="btn primary" type="button" data-formula-apply>Apply selected values</button> <button class="btn secondary" type="button" data-formula-cancel>Cancel import</button>`:'<p>No values were matched. Use clearer screenshots of the selected damage breakdown, or enter values manually.</p>';
}
export function wireDamageFormula(render){
 document.addEventListener('input',event=>{
  const id=event.target.dataset.formulaInput;if(!id)return;
  state.values[state.mode][id]=event.target.value;persist();updateResult();
  const f=fieldsFor(state.mode).find(f=>f.id===id),errors=calculateFormula(state.mode,state.values[state.mode]).errors;
  event.target.setAttribute('aria-invalid',String(errors.some(e=>e.startsWith(f.label+' '))));
 });
 document.addEventListener('click',event=>{
  const mode=event.target.closest('[data-formula-mode]')?.dataset.formulaMode;
  if(mode&&FORMULAS[mode]){importEpoch++;state.mode=mode;review=null;persist();render();return;}
  if(event.target.closest('[data-formula-clear]')){importEpoch++;state.values[state.mode]={};review=null;persist();render();return;}
  if(event.target.closest('[data-formula-cancel]')){review=null;const box=document.querySelector('[data-formula-review-box]');if(box)box.innerHTML='';return;}
  if(event.target.closest('[data-formula-apply]')&&review){
   const root=document.querySelector('.damageFormula');
   for(const check of root.querySelectorAll('[data-formula-use]:checked')){
    const input=[...root.querySelectorAll('[data-formula-review]')].find(el=>el.dataset.formulaReview===check.dataset.formulaUse);
    state.values[state.mode][check.dataset.formulaUse]=input.value;
   }
   review=null;persist();render();
  }
 });
 document.addEventListener('change',async event=>{
  if(!event.target.matches('[data-formula-files]')||busy)return;
  const root=event.target.closest('.damageFormula'),progress=root.querySelector('[data-formula-progress]'),files=[...event.target.files],mode=state.mode,epoch=++importEpoch;
  if(!files.length)return;
  busy=true;event.target.disabled=true;review=null;root.querySelector('[data-formula-review-box]').innerHTML='';
  const active=()=>epoch===importEpoch&&state.mode===mode&&root.isConnected;
  try{
   const texts=await recognizeFormulaScreenshots(files,message=>{if(active())progress.textContent=message;});
   if(!active())return;
   const parsed=texts.map(text=>parseFormulaText(mode,text));
   if(parsed.some(p=>p.wrongMode))throw Error('A screenshot is for a different damage type. Choose screenshots for '+FORMULAS[mode].name+'.');
   // A single combined parse also deduplicates overlapping pages and detects conflicts.
   review=parseFormulaText(mode,texts.join('\n'));renderReview(root);
   progress.textContent='Reading complete. Check the detected values below.';
  }catch(error){if(active())progress.textContent=error.message||'Could not read screenshots. You can still enter values manually.';}
  finally{busy=false;event.target.disabled=false;event.target.value='';const current=document.querySelector('[data-formula-files]');if(current)current.disabled=false;}
 });
}
