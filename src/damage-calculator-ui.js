import {calculateAttack, calculatePet, combatReference, compareBuilds} from './damage-calculator-engine.js';
import {HUNTER_2026_10_17 as EXAMPLE} from './damage-calculator-reference.js';

const STORE_KEY = 'arcana:damage-calculator:2026-10-17';
const clone = value => JSON.parse(JSON.stringify(value));
const initial = () => clone(EXAMPLE);
const NUMERIC_PATHS = [
  ['Attack base · weapon minimum','attack.weapon.min','attack'],
  ['Attack base · weapon maximum','attack.weapon.max','attack'],
  ['Attack base · jewelry minimum','attack.jewelry.min','attack'],
  ['Attack base · jewelry maximum','attack.jewelry.max','attack'],
  ['Attack additive · equipment %','attack.additive.equipment','attack'],
  ['Attack additive · class skills %','attack.additive.classSkills','attack'],
  ['Attack additive · item STR contribution %','attack.additive.strengthFromItems','attack'],
  ['Attack additive · item INT contribution %','attack.additive.intelligenceFromItems','attack'],
  ['Attack additive · talisman %','attack.additive.talisman','attack'],
  ['Attack flat · passive','attack.flat.passive','attack'],
  ['Attack flat · runes','attack.flat.runes','attack'],
  ['Attack flat · guild','attack.flat.guild','attack'],
  ['Attack layer · pet hatch bonuses %','attack.layers.petBonus','attack'],
  ['Attack layer · gear drop bonuses %','attack.layers.dropBonus','attack'],
  ['Attack layer · passive %','attack.layers.passive','attack'],
  ['Attack layer · runes %','attack.layers.runes','attack'],
  ['Attack layer · STR from non-item sources %','attack.layers.strengthOther','attack'],
  ['Attack layer · pet increased STR %','attack.layers.petIncreasedStrength','attack'],
  ['Attack layer · INT from non-item sources %','attack.layers.intelligenceOther','attack'],
  ['Attack layer · pet increased INT %','attack.layers.petIncreasedIntelligence','attack'],
  ['Attack layer · guild %','attack.layers.guild','attack'],
  ['Attack layer · gear sets %','attack.layers.gearSets','attack'],
  ['Attack layer · gems %','attack.layers.gems','attack'],
  ['Attack layer · time boost %','attack.layers.timeBoost','attack'],
  ['Attack layer · combat stance %','attack.layers.combatStance','attack'],
  ['Pet base · minimum before buffs','pet.base.min','pet'],
  ['Pet base · maximum before buffs','pet.base.max','pet'],
  ['Pet flat · runes','pet.flat.runes','pet'],
  ['Pet flat · guild','pet.flat.guild','pet'],
  ['Pet flat · passive','pet.flat.passive','pet'],
  ['Pet layer · equipment affixes %','pet.layers.equipmentAffixes','pet'],
  ['Pet layer · DEX contribution %','pet.layers.dexterity','pet'],
  ['Pet layer · INT contribution %','pet.layers.intelligence','pet'],
  ['Pet layer · Companions drop bonuses %','pet.layers.companionDrop','pet'],
  ['Pet layer · class skills %','pet.layers.classSkills','pet'],
  ['Pet layer · passive %','pet.layers.passive','pet'],
  ['Pet layer · runes %','pet.layers.runes','pet'],
  ['Pet layer · guild %','pet.layers.guild','pet'],
  ['Pet layer · gear sets %','pet.layers.gearSets','pet'],
  ['Pet layer · gems %','pet.layers.gems','pet'],
  ['Pet layer · time boost %','pet.layers.timeBoost','pet'],
  ['Pet layer · combat stance %','pet.layers.combatStance','pet'],
  ['Crit chance %','combat.critChance','combat'],
  ['Crit damage %','combat.critDamage','combat'],
  ['Double hit chance %','combat.doubleHitChance','combat'],
  ['Double damage chance %','combat.doubleDamageChance','combat'],
  ['Alpha Strike chance %','combat.alphaStrikeChance','combat'],
  ['Boss damage %','combat.bossDamage','combat'],
];
const LABELS = new Map(NUMERIC_PATHS.map(([label,path,section]) => [path,{label,section}]));
function valueAt(obj,path) {return path.split('.').reduce((cur,key)=>cur?.[key],obj);}
function setAt(obj,path,value) {
 const parts=path.split('.');
 let cur=obj;
 for(let i=0;i<parts.length-1;i++)cur=cur[parts[i]] ||= {};
 cur[parts.at(-1)]=value;
}
function cleanNumber(v){if(v===''||v===null||v===undefined)return 0;const n=Number(v);return Number.isFinite(n)?Math.max(-1e8,Math.min(1e8,n)):0;}
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmt(n){return n===null||n===undefined?'Not available':Number(n).toLocaleString('en-US',{maximumFractionDigits:1});}
function pct(n){return n===null||n===undefined?'Needs full input':(n>0?'+':'')+n.toFixed(2)+'%';}
function inputs(section,heading,paths){
 return `<details class="dcDetails" ${section==='attack'&&heading==='Attack base'?'open':''}><summary>${esc(heading)}</summary><div class="dcFields">${paths.map(path=>{
  const entry=LABELS.get(path);return `<label class="dcField"><span>${esc(entry.label.split(' · ').at(-1))}</span><input inputmode="decimal" type="number" step="any" data-dc-field="${esc(path)}" aria-label="${esc(entry.label)}"></label>`;
 }).join('')}</div></details>`;
}
const SETS = [
 ['attack','Attack base',NUMERIC_PATHS.slice(0,4).map(x=>x[1])],
 ['attack','Additive attack percentages',NUMERIC_PATHS.slice(4,9).map(x=>x[1])],
 ['attack','Flat damage after additive %',NUMERIC_PATHS.slice(9,12).map(x=>x[1])],
 ['attack','Independent attack multipliers',NUMERIC_PATHS.slice(12,25).map(x=>x[1])],
 ['pet','Pet base before any bonuses (optional)',NUMERIC_PATHS.slice(25,27).map(x=>x[1])],
 ['pet','Flat damage applied to each pet',NUMERIC_PATHS.slice(27,30).map(x=>x[1])],
 ['pet','Independent pet multipliers',NUMERIC_PATHS.slice(30,42).map(x=>x[1])],
 ['combat','Critical hits, overflow and procs',NUMERIC_PATHS.slice(42).map(x=>x[1])],
];
let state=null;
function load(){
 if(state)return state;
 try{
  const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
  if(saved?.baseline?.attack?.weapon && saved?.baseline?.pet?.layers){
    state={baseline:saved.baseline,changes:saved.changes||{},mode:'attack'};
    return state;
  }
 }catch{}
 state={baseline:initial(),changes:{},mode:'attack'};
 return state;
}
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify({baseline:state.baseline,changes:state.changes}));}catch{}}
function asScenario(){
 const obj=clone(state.baseline);
 for(const [path,value] of Object.entries(state.changes))if(LABELS.has(path))setAt(obj,path,cleanNumber(value));
 return obj;
}
function results(){
 const comp=compareBuilds(state.baseline,asScenario());
 const base=comp.baseline,scen=comp.scenario;
 const attackRange=x=>fmt(x.min)+' – '+fmt(x.max);
 const extra=Object.keys(state.changes).length;
 return `<div class="dcResultGrid">
 <div class="dcResult"><span>Attack damage range</span><strong>${attackRange(scen.attack)}</strong><small>Before crit, Double Hit, Double Damage and enemy mitigation</small><b>Change ${pct(comp.changes.attack.min?.percentChange)}</b></div>
 <div class="dcResult"><span>Pet damage multiplier</span><strong>×${scen.pet.layerFactor.toFixed(2)}</strong><small>${scen.pet.min === null ? 'Enter a pre-bonus pet base to calculate final damage.' : 'Estimated pet damage: '+fmt(scen.pet.min)+' – '+fmt(scen.pet.max)} Flat +${fmt(scen.pet.flatBonus)} added before multipliers.</small><b>Change ${pct(comp.changes.petMultiplier?.percentChange)}</b></div>
 <div class="dcResult"><span>Attack multiplier breakdown</span><strong>×${scen.attack.additiveFactor.toFixed(3)} / ×${scen.attack.layerFactor.toFixed(2)}</strong><small>Summed additive first; ${fmt(scen.attack.flatBonus)} flat added after; independent layers multiply.</small></div>
 </div>
 <div class="dcCombatNumbers"><span>Crit: <b>${fmt(scen.combat.crit.effectiveChance)}%</b> chance, <b>+${fmt(scen.combat.crit.overflowCritDamage)}%</b> overflow damage</span><span>Double Damage: <b>×${fmt(scen.combat.doubleDamage.expected)}</b> mean multiplier</span><span>Double Hit: <b>${fmt(scen.combat.doubleHit.expected)}</b> expected hits on surviving targets</span><span>Alpha Strike: <b>${fmt(scen.combat.alphaStrike.chance)}%</b> proc chance</span></div>
 <p class="dcValidation">${extra?extra+' what-if change'+(extra===1?'':'s')+' applied.':'Example baseline unchanged.'} Example reference: 175.6K–243.8K attack and ×132.24 pet multiplier. Small differences reflect rounded display values.</p>`;
}
function changesMarkup(){
 const paths=[...Object.keys(state.changes)];
 return paths.map(path=>`<div class="dcChangeRow"><span>${esc(LABELS.get(path)?.label||path)}</span><label>Scenario value<input aria-label="Scenario value for ${esc(path)}" data-dc-scenario="${esc(path)}" type="number" inputmode="decimal" step="any" value="${esc(state.changes[path])}"></label><button type="button" data-dc-remove="${esc(path)}" class="btn secondary" aria-label="Remove ${esc(path)} change">Remove</button></div>`).join('');
}
export function damageCalculatorView(){
 load();
 return `<section class="dcRoot" id="arcanaDamageCalculator">
 <style>
 .dcRoot{max-width:950px;margin:auto;color:var(--text,#f6f0ff)}
 .dcRoot .dcIntro{line-height:1.6;max-width:66ch;opacity:.85}
 .dcRoot .dcTabs{display:flex;gap:8px;flex-wrap:wrap;margin:22px 0 18px}
 .dcRoot .dcTabs button{min-height:44px;flex:1;min-width:104px}
 .dcRoot .dcTabs button[aria-selected="true"]{outline:2px solid var(--accent,#b89bff)}
 .dcRoot .dcResultGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(225px,100%),1fr));gap:12px;margin:12px 0}
 .dcRoot .dcResult{border:1px solid #7775;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:7px;background:#6f638215}
 .dcRoot .dcResult strong{font-size:clamp(19px,4vw,27px);overflow-wrap:anywhere}
 .dcRoot .dcResult span{opacity:.8}.dcRoot .dcResult small{line-height:1.45;opacity:.76}
 .dcRoot .dcResult b{color:#8bdaa0}.dcRoot .dcCombatNumbers{display:grid;gap:8px;margin:18px 0}
 .dcRoot .dcValidation{font-size:13px;opacity:.8;line-height:1.5}
 .dcRoot .dcWork{display:grid;gap:14px;margin-top:20px}
 .dcRoot .dcDetails{border:1px solid #7775;border-radius:12px;padding:12px;background:#22202928}
 .dcRoot .dcDetails summary{cursor:pointer;font-weight:700;padding:8px}
 .dcRoot .dcFields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:10px;margin-top:10px}
 .dcRoot .dcField{display:flex;flex-direction:column;gap:8px;font-size:13px;min-width:0}
 .dcRoot input,.dcRoot select{width:100%;min-height:44px;padding:9px 11px;background:#121119;border:1px solid #81809855;border-radius:9px;color:inherit;font-size:16px}
 .dcRoot input:focus-visible,.dcRoot select:focus-visible,.dcRoot button:focus-visible{outline:2px solid #aa9cff;outline-offset:2px}
 .dcRoot .dcScenario{border:1px solid #7775;border-radius:14px;margin-top:22px;padding:15px}
 .dcRoot .dcScenarioControls{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:end}
 .dcRoot .dcScenarioControls button{min-height:44px}
 .dcRoot .dcChangeRow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,120px) auto;gap:9px;align-items:center;border-bottom:1px solid #7774;padding:12px 0}
 .dcRoot .dcChangeRow span{font-size:13px}.dcRoot .dcChangeRow label{font-size:11px}
 .dcRoot .dcActions{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
 .dcRoot .dcActions button{min-height:44px}
 @media(max-width:440px){.dcRoot .dcChangeRow{grid-template-columns:1fr auto}.dcRoot .dcChangeRow span{grid-column:1/-1}.dcRoot .dcScenarioControls{grid-template-columns:1fr}}
 </style>
 <p class="dcIntro">Compare an actual build against a what-if version, with Attack Damage, pet multipliers and combat probabilities kept in their proper stages. Start with the supplied Beastmaster benchmark or clear it for a different character.</p>
 <div class="dcActions"><button type="button" class="btn secondary" data-dc-load>Load tested Hunter example</button><button type="button" class="btn secondary" data-dc-clear>Clear values</button><button type="button" class="btn secondary" data-dc-removeall>Clear comparisons</button></div>
 <div class="dcTabs" role="tablist" aria-label="Calculator sections"><button type="button" class="btn secondary" data-dc-tab="attack" aria-selected="true">Attack</button><button type="button" class="btn secondary" data-dc-tab="pet" aria-selected="false">Pets</button><button type="button" class="btn secondary" data-dc-tab="combat" aria-selected="false">Combat</button></div>
 <section aria-live="polite" id="dcResults">${results()}</section>
 <section class="dcWork" id="dcInputs">${SETS.map(([section,heading,paths])=>`<div data-dc-panel="${section}">${inputs(section,heading,paths)}</div>`).join('')}</section>
 <section class="dcScenario"><h3>Compare against a scenario</h3><p class="dcIntro">Change one or more sources. Each replacement belongs to the exact same layer as its original value; it is never stacked on top of the existing total.</p><div class="dcScenarioControls"><label>Add/change a source<select id="dcAddSource">${NUMERIC_PATHS.map(([label,path])=>`<option value="${esc(path)}">${esc(label)}</option>`).join('')}</select></label><button type="button" class="btn primary" data-dc-add>Add change</button></div><div id="dcChanges">${changesMarkup()}</div></section>
 <p class="notice">The example uses rounded in-game values. Crit damage semantics, exact pet base growth, target mitigation, elemental weakness and true DPS need further verification. This calculator does not invent those values.</p>
 </section>`;
}
function updatePanels(root){
 root.querySelectorAll('[data-dc-panel]').forEach(el=>{el.hidden=el.dataset.dcPanel!==state.mode;});
 root.querySelectorAll('[data-dc-tab]').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.dcTab===state.mode)));
}
function updateNumbers(root) {
 root.querySelectorAll('[data-dc-field]').forEach(el=>{
  const value=valueAt(state.baseline,el.dataset.dcField);
  el.value=value===null||value===undefined?'':value;
 });
 root.querySelector('#dcResults').innerHTML=results();
 root.querySelector('#dcChanges').innerHTML=changesMarkup();
 updatePanels(root);
}
export function mountDamageCalculator(){
 const root=document.querySelector('#arcanaDamageCalculator');
 if(!root || root.dataset.dcMounted==='yes')return;
 root.dataset.dcMounted='yes';
 load();updateNumbers(root);
 root.addEventListener('input',e=>{
  if(e.target.matches('[data-dc-field]')){
   setAt(state.baseline,e.target.dataset.dcField,cleanNumber(e.target.value));
   persist();root.querySelector('#dcResults').innerHTML=results();
  }
  if(e.target.matches('[data-dc-scenario]')){
   state.changes[e.target.dataset.dcScenario]=cleanNumber(e.target.value);
   persist();root.querySelector('#dcResults').innerHTML=results();
  }
 });
 root.addEventListener('click',e=>{
  const btn=e.target.closest('button');
  if(!btn)return;
  if(btn.dataset.dcTab){state.mode=btn.dataset.dcTab;updatePanels(root);return;}
  if(btn.hasAttribute('data-dc-load')){state.baseline=initial();state.changes={};persist();updateNumbers(root);return;}
  if(btn.hasAttribute('data-dc-clear')){state.baseline=initial();for(const [label,path] of NUMERIC_PATHS)setAt(state.baseline,path,0);state.changes={};persist();updateNumbers(root);return;}
  if(btn.hasAttribute('data-dc-removeall')){state.changes={};persist();updateNumbers(root);return;}
  if(btn.hasAttribute('data-dc-add')){const path=root.querySelector('#dcAddSource')?.value;if(LABELS.has(path)){state.changes[path]=valueAt(state.baseline,path)||0;persist();updateNumbers(root);}return;}
  if(btn.hasAttribute('data-dc-remove')){delete state.changes[btn.dataset.dcRemove];persist();updateNumbers(root);}
 });
}
