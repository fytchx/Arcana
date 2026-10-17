import {linkedAttributeStageFields,previewLinkedAttributeChange} from './damage-attribute-link.js';

const KEY='arcana:damage:attributes:v1';
const clean=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const print=v=>Number.isFinite(Number(v))?Number(v).toLocaleString('en-US',{maximumFractionDigits:2}):'Unknown';
const get=(object,path)=>path.split('.').reduce((node,k)=>node?.[k],object);
const initial=()=>({stat:'INT',origin:'other',effectivePoints:''});
const FIELD_NAMES=Object.freeze({
 'attack.additive.strengthFromItems':'Item STR contribution · Attack additive %',
 'attack.layers.strengthOther':'Non-item STR contribution · Attack multiplier %',
 'attack.additive.intelligenceFromItems':'Item INT contribution · Attack additive %',
 'attack.layers.intelligenceOther':'Non-item INT contribution · Attack multiplier %',
 'pet.layers.intelligence':'Total INT contribution · Pet multiplier %',
 'pet.layers.dexterity':'Total DEX contribution · Pet multiplier %',
 'combat.doubleDamageChance':'Double Damage chance %',
});
let state;
function load(){
 if(state)return state;
 try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'null');
  if(saved&&['INT','STR','DEX'].includes(saved.stat)){
   state={stat:saved.stat,origin:['item','other'].includes(saved.origin)?saved.origin:'other',
    effectivePoints:saved.effectivePoints??''};
   return state;
  }
 }catch{}
 state=initial();return state;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function fields(build){
 return linkedAttributeStageFields(state.stat,state.origin).map(row=>{
  const value=get(build,row.path);
  return '<label class="dcAttributeField"><span>'+clean(FIELD_NAMES[row.path]||row.path)+'</span>'+
   '<input type="number" inputmode="decimal" step="any" data-dc-field="'+clean(row.path)+'" value="'+
   (value===null||value===undefined?'':clean(value))+'" aria-label="'+clean(FIELD_NAMES[row.path]||row.path)+'"></label>';
 }).join('');
}
function tryPreview(build){
 try{return previewLinkedAttributeChange(build,state);}
 catch(err){return {measured:false,full:false,applied:[],skipped:[],reason:err.message};}
}
function output(build){
 const result=tryPreview(build);
 if(result.reason)return '<p class="dcAttributeNotice" role="status">'+clean(result.reason)+'</p>';
 let html='<div class="dcAttributeOutGrid">';
 if(result.heroAttack){
  const x=result.heroAttack;
  html+='<article><small>Hero Attack minimum</small><strong>'+print(x.baseline.min)+' → '+print(x.proposed.min)+'</strong>'+
    '<small>'+(x.changeMin?((x.changeMin.percentChange>=0?'+':'')+print(x.changeMin.percentChange)+'%'):'No relative gain available')+(x.complete?'':' · Partial sheet estimate')+'</small></article>';
 }
 if(result.petMultiplier){
  const x=result.petMultiplier;
  html+='<article><small>Pet multiplier · entered layers</small><strong>×'+print(x.baseline)+' → ×'+print(x.proposed)+'</strong>'+
   '<small>'+(x.change?((x.change.percentChange>=0?'+':'')+print(x.change.percentChange)+'%'):'No relative gain available')+' · Not full DPS</small></article>';
 }
 if(result.doubleDamage){
  const x=result.doubleDamage;
  html+='<article><small>Double Damage chance</small><strong>'+print(x.baseline.chance)+'% → '+print(x.proposed.chance)+'%</strong><small>Chance change only, not Attack multiplier</small></article>';
 }
 html+='</div>';
 const rates=result.knownRates||{};
 const notes=[];
 if(rates.retaliationStrengthPctPoints!==null)
  notes.push('STR effect reference: '+(rates.retaliationStrengthPctPoints>=0?'+':'')+print(rates.retaliationStrengthPctPoints)+' percentage points to Retaliation STR contribution; not automatically routed.');
 if(rates.dodgeChancePoints!==null)
  notes.push('DEX effect reference: '+(rates.dodgeChancePoints>=0?'+':'')+print(rates.dodgeChancePoints)+' percentage points to Dodge Chance; not automatically routed.');
 if(result.applied.length){
  html+='<details class="dcAttributeDelta"><summary>Show exact source replacements ('+result.applied.length+')</summary>'+
   result.applied.map(x=>'<div><span>'+clean(FIELD_NAMES[x.path]||x.path)+'</span><b>'+print(x.original)+'% → '+print(x.proposed)+'%</b></div>').join('')+'</details>';
 }
 if(result.skipped.length){
  html+='<p class="dcAttributeNotice">Missing measured baseline fields: '+result.skipped.map(x=>clean(FIELD_NAMES[x.path]||x.path)).join(', ')+'. Fill those in above before applying to the main calculator.</p>';
 }
 if(notes.length)html+='<p class="dcValidation">'+notes.map(clean).join(' ')+'</p>';
 html+='<button type="button" class="btn primary dcAttributeApply" data-dc-attr-apply'+
  (!result.full||!result.measured?' disabled aria-disabled="true"':'')+'>Send linked changes to what-if</button>';
 return html;
}
export function damageAttributeView(){
 return '<style>'+
 '.dcRoot .dcAttributeLab{border:1px solid #7775;border-radius:14px;padding:15px;background:#6f638215}'+
 '.dcRoot .dcAttributeLab p{line-height:1.6;font-size:13px}'+
 '.dcRoot .dcAttributeControls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}'+
 '.dcRoot .dcAttributeControls label,.dcRoot .dcAttributeField{font-size:12px;display:grid;gap:6px;min-width:0}'+
 '.dcRoot .dcAttributeControls select,.dcRoot .dcAttributeControls input,.dcRoot .dcAttributeField input{min-width:0;width:100%;min-height:44px;font-size:16px}'+
 '.dcRoot .dcAttributeInputs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:10px;margin:16px 0}'+
 '.dcRoot .dcAttributeOutGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(210px,100%),1fr));gap:10px;margin:14px 0}'+
 '.dcRoot .dcAttributeOutGrid article{border:1px solid #7775;padding:13px;border-radius:12px;display:grid;gap:8px}'+
 '.dcRoot .dcAttributeOutGrid strong{font-size:17px;overflow-wrap:anywhere}'+
 '.dcRoot .dcAttributeOutGrid small{font-size:12px;opacity:.8}'+
 '.dcRoot .dcAttributeNotice{padding:11px;border:1px solid #d5b56b66;border-radius:10px}'+
 '.dcRoot .dcAttributeDelta summary{cursor:pointer;min-height:44px;padding:12px 0}'+
 '.dcRoot .dcAttributeDelta div{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:9px 0;border-bottom:1px solid #7774;font-size:12px}'+
 '.dcRoot .dcAttributeDelta b{white-space:nowrap}'+
 '.dcRoot .dcAttributeApply{margin-top:14px;min-height:44px;width:100%}'+
 '.dcRoot .dcAttributeApply:disabled{opacity:.55;cursor:not-allowed}'+
 '@media(max-width:530px){.dcRoot .dcAttributeControls{grid-template-columns:repeat(2,minmax(0,1fr))}.dcRoot .dcAttributeControls label:last-child{grid-column:1/-1}}'+
 '</style><section id="dcAttributeLab" class="dcAttributeLab" data-dc-panel="attributes" hidden>'+
 '<h3>Linked effective stats · Attack + Pet + combat</h3>'+
 '<p>Compare a real change in <b>effective</b> STR, INT or DEX points across all supported measured tooltip stages. Enter points after any Increased INT/STR/DEX bonus has already been applied. This does not assume how a raw %INT roll scales.</p>'+
 '<div class="dcAttributeControls"><label>Attribute<select data-dc-attr-stat aria-label="Effective attribute"><option value="INT">INT</option><option value="STR">STR</option><option value="DEX">DEX</option></select></label>'+
 '<label>Where points came from<select data-dc-attr-origin aria-label="Attribute source"><option value="other">Pet / rune / other</option><option value="item">Item attributes</option></select></label>'+
 '<label>Change in effective points<input type="number" step="any" inputmode="decimal" data-dc-attr-points aria-label="Change in effective attribute points" placeholder="e.g. 100"></label></div>'+
 '<p>The source choice matters: item STR/INT and non-item STR/INT enter different stages of the Attack tooltip. DEX uses its observed Pet layer; source choice is irrelevant for DEX.</p>'+
 '<h4>Measured baseline values</h4><div class="dcAttributeInputs" id="dcAttributeFields"></div>'+
 '<div id="dcAttributePreview" aria-live="polite"></div>'+
 '<p class="dcValidation">This estimates sheet damage and the Pet percentage multiplier, not actual DPS. Skill procs, target mitigation and unmeasured stage combinations are excluded. The main calculator remains unchanged until you apply this preview.</p></section>';
}
function draw(root,getBuild){
 const panel=root.querySelector('#dcAttributeLab');if(!panel)return;
 const fieldHost=panel.querySelector('#dcAttributeFields'),resultHost=panel.querySelector('#dcAttributePreview');
 if(fieldHost)fieldHost.innerHTML=fields(getBuild());
 if(resultHost)resultHost.innerHTML=output(getBuild());
}
export function refreshDamageAttribute(root,getBuild){
 const panel=root?.querySelector('#dcAttributeLab');
 if(panel?.dataset.attrMounted==='yes'){
  // Avoid replacing controls/field inputs currently receiving keyboard edits.
  const active=document.activeElement;
  if(!panel.contains(active)||!active.matches('[data-dc-field]'))draw(root,getBuild);
  else{
   const result=panel.querySelector('#dcAttributePreview');
   if(result)result.innerHTML=output(getBuild());
  }
 }
}
export function mountDamageAttribute(root,getBuild){
 const panel=root?.querySelector('#dcAttributeLab');
 if(!panel||panel.dataset.attrMounted==='yes')return;
 panel.dataset.attrMounted='yes';
 load();
 const stat=panel.querySelector('[data-dc-attr-stat]');
 const origin=panel.querySelector('[data-dc-attr-origin]');
 const points=panel.querySelector('[data-dc-attr-points]');
 stat.value=state.stat;origin.value=state.origin;points.value=state.effectivePoints;
 const refreshOrigin=()=>{
  origin.disabled=state.stat==='DEX';
  origin.closest('label').hidden=state.stat==='DEX';
 };
 refreshOrigin();draw(root,getBuild);
 panel.addEventListener('change',event=>{
  if(event.target===stat||event.target===origin){
   state.stat=stat.value;
   state.origin=origin.value;
   refreshOrigin();save();draw(root,getBuild);
  }
 });
 panel.addEventListener('input',event=>{
  if(event.target===points){
   state.effectivePoints=points.value;
   save();const host=panel.querySelector('#dcAttributePreview');
   if(host)host.innerHTML=output(getBuild());
  }
 });
 panel.addEventListener('click',event=>{
  const button=event.target.closest('button[data-dc-attr-apply]');
  if(!button||button.disabled)return;
  const result=tryPreview(getBuild());
  if(!result.full||!result.measured)return;
  panel.dispatchEvent(new CustomEvent('dc-apply-linked-attributes',{bubbles:true,
   detail:{stat:state.stat,origin:state.origin,effectivePoints:state.effectivePoints}}));
 });
}
