import {FORMULAS,FORMULA_KEY,fieldsFor,calculateFormula,readFormulaState,saveFormulaState,blankFormulaState,normalizeFormulaState} from './damage-formula.js';
import {FORMULA_UNITS,splitFormulaInput,joinFormulaInput,formulaInputHint,averageChange} from './damage-formula-inputs.js';
import {parseFormulaText,recognizeFormulaScreenshots} from './damage-formula-import.js';
import {esc,icon} from './ui.js';
let state=readFormulaState(),review=null,busy=false,importEpoch=0,saveFailed=false,baselines=blankFormulaState();
const BASELINE_KEY=FORMULA_KEY+'-baselines';
try{baselines=normalizeFormulaState(JSON.parse(localStorage.getItem(BASELINE_KEY)||'null'));}catch{}
const fmt=n=>n===null?'—':n.toLocaleString('en-US',{maximumFractionDigits:2});
const compact=n=>{for(const [suffix,scale] of [['Q',1e15],['T',1e12],['B',1e9],['M',1e6],['K',1e3]])if(Math.abs(n)>=scale)return (n/scale).toLocaleString('en-US',{maximumFractionDigits:3})+suffix;return fmt(n);};
const modeIcon={attack:'sword',retaliation:'shield',pet:'paw'};
function field(f,value,reviewing=false){
 const split=splitFormulaInput(value,f.unit),id=(reviewing?'review-':'formula-')+f.id.replace('.','-');
 const options=FORMULA_UNITS[f.unit],attr=reviewing?'data-formula-review':'data-formula-input';
 return `<div class="formulaField" data-formula-field="${f.id}"><label for="${id}">${esc(f.label)}</label><div class="formulaInputRow"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" ${attr}="${f.id}" data-formula-kind="${f.unit}" aria-describedby="${id}-hint" value="${esc(split.amount)}" placeholder="—">${options.length>1?`<select aria-label="${esc(f.label)} unit" data-formula-unit="${f.id}" data-formula-kind="${f.unit}">${options.map(([unit,label])=>`<option value="${unit}" ${unit===split.unit?'selected':''}>${label}</option>`).join('')}</select>`:`<span class="formulaFixedUnit" aria-hidden="true">${options[0][1]}</span>`}</div><small id="${id}-hint" class="formulaFieldHint" data-formula-hint>${esc(formulaInputHint(value,f.unit))}</small></div>`;
}
function persist(){saveFailed=!saveFormulaState(state);}
function saveBaseline(){try{localStorage.setItem(BASELINE_KEY,JSON.stringify(baselines));}catch{saveFailed=true;}}
function comparison(result){
 const before=calculateFormula(state.mode,baselines.values[state.mode]),change=averageChange(before,result);
 if(change===null)return '';
 return `<div class="formulaComparison ${change>0?'isGain':change<0?'isLoss':''}"><strong>${change>0?'+':''}${fmt(change)}%</strong><span>average damage vs baseline<br><small>${compact(before.min)} – ${compact(before.max)} → ${compact(result.min)} – ${compact(result.max)}</small></span></div>`;
}
function missingMarkup(result){
 return `<div class="formulaMissing"><span>${result.missing.length} ${result.missing.length===1?'value':'values'} needed</span><div>${result.missing.map(label=>{const f=fieldsFor(state.mode).find(f=>f.label===label);return `<button type="button" data-formula-jump="${f?.id||''}">${esc(label)} ${icon('arrow',12)}</button>`;}).join('')}</div></div>`;
}
export function formulaResultMarkup(){
 const result=calculateFormula(state.mode,state.values[state.mode]),hasBaseline=calculateFormula(state.mode,baselines.values[state.mode]).ready;
 const errors=result.errors.length?'<div class="formulaErrors" role="alert">'+result.errors.map(e=>'<p>'+esc(e)+'</p>').join('')+'</div>':'';
 if(!result.ready)return `<div class="formulaResultHead"><span class="formulaEyebrow">LIVE RESULT</span>${icon(modeIcon[state.mode],22)}</div><h2>Your damage</h2><strong class="formulaTotal isEmpty">— <span>–</span> —</strong>${errors}${result.missing.length?missingMarkup(result):'<p>Check the values marked below.</p>'}<p class="formulaHint">Unused bonuses can stay blank. Enter every applicable value to match your game.</p>`;
 return `<div class="formulaResultHead"><span class="formulaEyebrow">LIVE RESULT</span>${icon(modeIcon[state.mode],22)}</div><h2>${state.mode==='retaliation'?'Per enemy attack':state.mode==='pet'?"This pet’s damage":'Attack damage'}</h2><strong class="formulaTotal">${compact(result.min)} <span>–</span> ${compact(result.max)}</strong><div class="formulaMetrics"><div><small>AVERAGE DAMAGE</small><strong>${compact(result.average)}</strong></div><div><small>LAYER PRODUCT</small><strong>×${compact(result.layerFactor)}</strong></div></div>${comparison(result)}<div class="formulaBaselineActions"><button type="button" data-formula-baseline>${icon('compare',15)} ${hasBaseline?'Update baseline':'Save baseline'}</button>${hasBaseline?'<button type="button" data-formula-baseline-clear>Remove baseline</button>':''}</div><p class="formulaHint">Save a baseline, then tweak any value to compare the change.</p>${result.blocked?`<div class="formulaBlocked"><small>ON A BLOCKED ATTACK</small><strong>${compact(result.blocked.min)} – ${compact(result.blocked.max)}</strong><span>Separate from the ordinary range above.</span></div>`:''}<details class="formulaFullNumbers"><summary>Full damage values</summary><p>${fmt(result.min)} – ${fmt(result.max)}</p><p>Average: ${fmt(result.average)}</p></details><details class="formulaBreakdown"><summary>Formula breakdown ${icon('layers',15)}</summary><ol class="formulaSteps">${result.stages.map((s,i)=>'<li><span><small>'+String(i+1).padStart(2,'0')+'</small>'+esc(s.label)+'</span><strong>'+compact(s.min)+' – '+compact(s.max)+'</strong></li>').join('')}</ol></details>`;
}
function quickResultMarkup(){
 const r=calculateFormula(state.mode,state.values[state.mode]),base=calculateFormula(state.mode,baselines.values[state.mode]),change=averageChange(base,r);
 return `<span><small>${FORMULAS[state.mode].name.toUpperCase()} DAMAGE</small><strong>${r.ready?compact(r.min)+' – '+compact(r.max):r.errors.length?'Check inputs':'Enter your values'}${change!==null?` <em class="${change<0?'isLoss':'isGain'}">${change>0?'+':''}${fmt(change)}%</em>`:''}</strong></span><button type="button" data-formula-show-result aria-label="View full damage result">${icon('chart',18)}<span>Details</span></button>`;
}
const groupCopy={base:'Start with the base values from your breakdown.',additive:'These bonuses add together into one multiplier.',flat:'Flat values add to the damage pool.',layers:'Each source multiplies independently.',event:'The final range and conditional attack multipliers.'};
export function damageFormulaView(){
 const mode=state.mode,values=state.values[mode],fields=fieldsFor(mode),filled=fields.filter(f=>String(values[f.id]??'').trim()).length;
 return `<div class="studioPage damageFormula"><nav class="arcanaCrumbs" aria-label="Page navigation"><button type="button" data-route="home">Home</button><span>›</span><button type="button" data-action="homemenu" data-arg="tools">Tools</button><span>›</span><span>Damage</span></nav><header class="formulaHero"><div class="formulaHeroTop"><span class="formulaEyebrow">THEORYCRAFT / DAMAGE</span><span class="formulaTestBadge">TEST VERSION</span></div><div class="formulaTitleRow"><div><h1>Damage Calculator</h1><p>Your numbers. A clearer picture.</p></div><span class="formulaHeroIcon">${icon('calculator',34)}</span></div><div class="formulaModes" role="group" aria-label="Damage type">${Object.entries(FORMULAS).map(([id,s])=>`<button type="button" data-formula-mode="${id}" aria-pressed="${id===mode}">${icon(modeIcon[id],18)}<span>${s.name}</span></button>`).join('')}</div><div class="formulaToolbar"><span id="formulaSave" role="status">${icon('check',14)} ${saveFailed?'Could not save on this browser':'Saved on this device'}</span><button type="button" data-formula-clear>${icon('refresh',14)} Clear fields</button></div></header><div class="formulaQuickResult" data-formula-quick aria-live="polite">${quickResultMarkup()}</div><div class="formulaLayout"><div class="formulaInputs"><section class="formulaImport"><details><summary><span class="formulaImportIcon">${icon('upload',23)}</span><span><strong>Bring in your breakdown</strong><small>Import 1–3 screenshots or paste text</small></span>${icon('arrow',17)}</summary><div class="formulaImportBody"><p>Detected values appear for review before anything changes.</p><label class="formulaUpload"><span>${icon('upload',24)}<strong>Choose screenshots</strong><small>1–3 images · PNG, JPG or WebP</small></span><input aria-label="Upload damage breakdown screenshots" type="file" accept="image/png,image/jpeg,image/webp" multiple data-formula-files ${busy?'disabled':''}></label><details class="formulaPaste"><summary>Have the breakdown as text?</summary><textarea aria-label="Paste damage breakdown" data-formula-text rows="5" placeholder="Paste the labels and values from your breakdown…"></textarea><button type="button" data-formula-read-text>Review pasted values</button></details><p data-formula-progress role="status">${busy?'Reading screenshots…':''}</p><div data-formula-review-box>${review?reviewMarkup():''}</div><small class="formulaPrivacy">Images are read on your device and are not saved.</small></div></details></section><div class="formulaInputTip">${icon('info',16)}<p>Enter <strong>100</strong> and choose <strong>M</strong> for 100 million. You can also paste <strong>100m</strong> directly. For bonuses, choose <strong>%</strong> or <strong>×</strong>.</p></div><div class="formulaProgress"><span>Your formula</span><small data-formula-filled>${filled} values entered</small></div>${FORMULAS[mode].groups.map((g,index)=>`<section class="formulaSection"><header><span class="formulaSectionNumber">${String(index+1).padStart(2,'0')}</span><div><h2>${esc(g.title.split(' — ')[0])}</h2><p>${groupCopy[g.id]}</p></div><span class="formulaSectionSymbol">${g.id==='layers'?'×':g.id==='flat'||g.id==='additive'?'+':g.id==='event'?'→':'◇'}</span></header>${mode==='pet'&&g.id==='base'?'<p class="formulaSectionNote">Use the unmodified base and level scaling for one pet. Its final card damage already includes bonuses, so it cannot be used as the base.</p>':''}${mode==='retaliation'&&g.id==='event'?'<p class="formulaSectionNote">For a 70–100% damage range, enter <strong>70</strong> as the minimum roll. Copy the stance and blocked multipliers from your breakdown.</p>':''}<div class="formulaFields">${g.fields.map(f=>field({...f,id:g.id+'.'+f.key},values[g.id+'.'+f.key])).join('')}</div></section>`).join('')}</div><aside><section class="formulaResult" id="formulaResult" tabindex="-1" aria-live="polite" aria-atomic="true">${formulaResultMarkup()}</section><details class="formulaAccuracy"><summary>${icon('info',15)} Matching the game</summary><p>Use precise values where possible. Shortened tooltips such as 1.48K% can change the result.</p><p>Exact game rounding is still being validated. This calculator shows formula damage, before crits, double hits and enemy defenses.</p></details></aside></div></div>`;
}
function updateResult(){
 const box=document.getElementById('formulaResult');if(box)box.innerHTML=formulaResultMarkup();
 const quick=document.querySelector('[data-formula-quick]');if(quick)quick.innerHTML=quickResultMarkup();
 const status=document.getElementById('formulaSave');if(status)status.textContent=saveFailed?'Could not save on this browser':'✓ Saved on this device';
 const count=document.querySelector('[data-formula-filled]');if(count)count.textContent=fieldsFor(state.mode).filter(f=>String(state.values[state.mode][f.id]??'').trim()).length+' values entered';
}
function reviewMarkup(){
 if(!review?.fields.length)return '<p class="formulaEmptyImport">No values matched. Try clearer screenshots, paste the breakdown text, or enter values manually.</p>';
 const specs=fieldsFor(state.mode);
 return `<div class="formulaReviewHeader"><h3>Review ${review.fields.length} detected values</h3><p>Overlapping rows are counted once. Existing values and uncertain readings are unchecked.</p></div>${review.fields.map(row=>{
  const f=specs.find(f=>f.id===row.id),exists=String(state.values[state.mode][row.id]??'').trim(),conflict=review.conflicts.includes(row.id);
  return `<div class="formulaReviewRow ${conflict?'needsReview':''}"><input type="checkbox" aria-label="Apply ${esc(f.label)}" data-formula-use="${row.id}" ${conflict||exists?'':'checked'}><div><div class="formulaReviewMeta"><small>${esc(FORMULAS[state.mode].groups.find(g=>g.id===f.group).title.split(' — ')[0])}</small>${conflict?'<span>Check reading</span>':exists?'<span>Already filled</span>':''}</div>${field(f,row.value,true)}${exists?'<small class="formulaPrevious">Current: '+esc(state.values[state.mode][row.id])+'</small>':''}</div></div>`;
 }).join('')}<div class="formulaReviewActions"><button type="button" data-formula-apply>Apply selected values</button><button type="button" data-formula-cancel>Cancel</button></div>`;
}
function renderReview(root){const box=root.querySelector('[data-formula-review-box]');if(box)box.innerHTML=reviewMarkup();}
function readEditor(input){
 const wrap=input.closest('[data-formula-field]'),select=wrap.querySelector('[data-formula-unit]'),kind=input.dataset.formulaKind;
 return joinFormulaInput(input.value,select?.value||FORMULA_UNITS[kind][0][0],kind);
}
function syncEditor(input,normalize=false){
 const raw=readEditor(input),wrap=input.closest('[data-formula-field]');
 wrap.querySelector('[data-formula-hint]').textContent=formulaInputHint(raw,input.dataset.formulaKind);
 input.setAttribute('aria-invalid',String(formulaInputHint(raw,input.dataset.formulaKind)==='Check this value'));
 if(normalize){const split=splitFormulaInput(raw,input.dataset.formulaKind);input.value=split.amount;const select=wrap.querySelector('[data-formula-unit]');if(select)select.value=split.unit;}
 return raw;
}
export function wireDamageFormula(render){
 document.addEventListener('input',event=>{
  const input=event.target;
  if(!input.matches('[data-formula-input],[data-formula-review]'))return;
  const raw=syncEditor(input);
  if(input.dataset.formulaInput){state.values[state.mode][input.dataset.formulaInput]=raw;persist();updateResult();}
 });
 document.addEventListener('focusout',event=>{if(event.target.matches('[data-formula-input],[data-formula-review]'))syncEditor(event.target,true);});
 document.addEventListener('click',event=>{
  const mode=event.target.closest('[data-formula-mode]')?.dataset.formulaMode;
  if(mode&&FORMULAS[mode]){importEpoch++;state.mode=mode;review=null;persist();render();return;}
  if(event.target.closest('[data-formula-clear]')){importEpoch++;state.values[state.mode]={};baselines.values[state.mode]={};review=null;persist();saveBaseline();render();return;}
  if(event.target.closest('[data-formula-baseline]')){const r=calculateFormula(state.mode,state.values[state.mode]);if(r.ready){baselines.values[state.mode]={...state.values[state.mode]};saveBaseline();updateResult();}return;}
  if(event.target.closest('[data-formula-baseline-clear]')){baselines.values[state.mode]={};saveBaseline();updateResult();return;}
  if(event.target.closest('[data-formula-show-result]')){const result=document.getElementById('formulaResult');result?.scrollIntoView({behavior:'smooth',block:'start'});result?.focus({preventScroll:true});return;}
  const jump=event.target.closest('[data-formula-jump]');
  if(jump){const input=[...document.querySelectorAll('[data-formula-input]')].find(el=>el.dataset.formulaInput===jump.dataset.formulaJump);input?.scrollIntoView({behavior:'smooth',block:'center'});input?.focus({preventScroll:true});return;}
  if(event.target.closest('[data-formula-cancel]')){review=null;const box=document.querySelector('[data-formula-review-box]');if(box)box.innerHTML='';return;}
  if(event.target.closest('[data-formula-read-text]')){
   const root=event.target.closest('.damageFormula'),text=root.querySelector('[data-formula-text]').value;review=parseFormulaText(state.mode,text);
   const progress=root.querySelector('[data-formula-progress]');
   if(review.wrongMode){review=null;progress.textContent='That text is for another damage type. Switch modes first.';return;}
   progress.textContent='Review the detected values below.';renderReview(root);return;
  }
  if(event.target.closest('[data-formula-apply]')&&review){
   const root=document.querySelector('.damageFormula');
   for(const check of root.querySelectorAll('[data-formula-use]:checked')){
    const input=[...root.querySelectorAll('[data-formula-review]')].find(el=>el.dataset.formulaReview===check.dataset.formulaUse);
    state.values[state.mode][check.dataset.formulaUse]=readEditor(input);
   }
   review=null;persist();render();
  }
 });
 document.addEventListener('change',async event=>{
  const select=event.target;
  if(select.matches('[data-formula-unit]')){
   const input=select.closest('[data-formula-field]').querySelector('input'),raw=syncEditor(input,true);
   if(input.dataset.formulaInput){state.values[state.mode][input.dataset.formulaInput]=raw;persist();updateResult();}return;
  }
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
   review=parseFormulaText(mode,texts.join('\n'));renderReview(root);progress.textContent='Reading complete. Review detected values before applying.';
  }catch(error){if(active())progress.textContent=error.message||'Could not read screenshots. You can still enter values manually.';}
  finally{busy=false;event.target.disabled=false;event.target.value='';const current=document.querySelector('[data-formula-files]');if(current)current.disabled=false;}
 });
}
