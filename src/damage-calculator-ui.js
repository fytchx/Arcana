import {blankDamageBuild, compareBuilds, relativeDifference} from './damage-calculator-engine.js';
import {calculateRetaliation} from './retaliation-damage-engine.js';
import {rankPercentagePointGains} from './damage-calculator-marginals.js';
import {petQuickCompareView,mountPetQuickCompare,refreshPetQuickCompare} from './damage-pet-quick-ui.js';
import {RETALIATION_WARRIOR_2026_10_17 as WARRIOR,ATTACK_MAGE_2026_10_17 as MAGE} from './damage-calculator-crossclass-fixtures.js';
import {HUNTER_2026_10_17 as EXAMPLE} from './damage-calculator-reference.js';
import {damageSkillPlannerView,mountSkillPlanner,skillPlannerExample,clearSkillPlanner} from './damage-calculator-skills-ui.js';

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
  ['Pet flat · class skills','pet.flat.classSkills','pet'],
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
  ['Retaliation · Defense','retaliation.defense','retaliation'],
  ['Retaliation · Global ratio','retaliation.globalRatio','retaliation'],
  ['Retaliation base · Reflecting %','retaliation.baseBonuses.reflectingGear','retaliation'],
  ['Retaliation base · Deflection %','retaliation.baseBonuses.deflection','retaliation'],
  ['Retaliation base · Bulwark %','retaliation.baseBonuses.bulwarkStance','retaliation'],
  ['Retaliation layer · Strength %','retaliation.layers.strength','retaliation'],
  ['Retaliation layer · Pet increased Strength %','retaliation.layers.petIncreasedStrength','retaliation'],
  ['Retaliation layer · Pet Retaliation %','retaliation.layers.petRetaliation','retaliation'],
  ['Retaliation layer · Talisman %','retaliation.layers.talismanInscription','retaliation'],
  ['Retaliation layer · Runes %','retaliation.layers.runes','retaliation'],
  ['Retaliation layer · Guild %','retaliation.layers.guild','retaliation'],
  ['Retaliation layer · Echo Blessings %','retaliation.layers.echoBlessings','retaliation'],
  ['Retaliation layer · Gear Sets %','retaliation.layers.gearSets','retaliation'],
  ['Retaliation layer · Gems %','retaliation.layers.gems','retaliation'],
  ['Retaliation layer · Time Boost %','retaliation.layers.timeBoost','retaliation'],
  ['Retaliation · Stance factor','retaliation.combatStanceFactor','retaliation'],
  ['Retaliation · Minimum displayed roll factor','retaliation.rollMinFactor','retaliation'],
  ['Retaliation · Blocked attack factor','retaliation.blockedFactor','retaliation'],
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
function optionalNumber(v){return v===''||v===null||v===undefined?null:cleanNumber(v);}
function measuredGroup(obj){return Object.values(obj||{}).some(v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v)));}
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmt(n){return n===null||n===undefined?'Not available':Number(n).toLocaleString('en-US',{maximumFractionDigits:1});}
function fmtDamage(n){if(n===null||n===undefined)return 'Not measured';const v=Number(n),a=Math.abs(v);return a>=1e12?(v/1e12).toFixed(2)+'T':a>=1e9?(v/1e9).toFixed(2)+'B':a>=1e6?(v/1e6).toFixed(2)+'M':a>=1e4?(v/1e3).toFixed(2)+'K':fmt(v);}
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
 ['pet','Flat damage applied to each pet',NUMERIC_PATHS.slice(27,31).map(x=>x[1])],
 ['pet','Independent pet multipliers',NUMERIC_PATHS.slice(31,43).map(x=>x[1])],
 ['combat','Critical hits, overflow and procs',NUMERIC_PATHS.slice(43,49).map(x=>x[1])],
 ['retaliation','Defense and Retaliation base',NUMERIC_PATHS.slice(49,54).map(x=>x[1])],
 ['retaliation','Independent Retaliation multipliers',NUMERIC_PATHS.slice(54,64).map(x=>x[1])],
 ['retaliation','Conditional Retaliation factors',NUMERIC_PATHS.slice(64).map(x=>x[1])],
];
let state=null;
function load(){
 if(state)return state;
 try{
  const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
  if(saved?.baseline?.attack?.weapon && saved?.baseline?.pet?.layers){
    state={baseline:saved.baseline,changes:saved.changes||{},mode:'attack',marginalPoints:[1,10,100].includes(saved.marginalPoints)?saved.marginalPoints:10};
    return state;
  }
 }catch{}
 state={baseline:initial(),changes:{},mode:'attack',marginalPoints:10};
 return state;
}
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify({baseline:state.baseline,changes:state.changes,marginalPoints:state.marginalPoints}));}catch{}}
function asScenario(){
 const obj=clone(state.baseline);
 for(const [path,value] of Object.entries(state.changes))if(LABELS.has(path))setAt(obj,path,optionalNumber(value));
 return obj;
}
function results(){
 const comp=compareBuilds(state.baseline,asScenario());
 const base=comp.baseline,scen=comp.scenario;
 const attackRange=x=>x.known?fmtDamage(x.min)+' – '+fmtDamage(x.max):'Not measured';
 const extra=Object.keys(state.changes).length;
 const current=asScenario();
 const retA=calculateRetaliation(state.baseline.retaliation);
 const retB=calculateRetaliation(current.retaliation);
 const hasPet=measuredGroup(current.pet?.layers);
 const hasCombat=measuredGroup(current.combat);
 const retChange=(retA.known && retB.known)?relativeDifference(retA.max,retB.max):null;
 const sample=state.baseline.className||'Archer / Hunter';
 return `<div class="dcResultGrid">
 <div class="dcResult"><span>${scen.attack.known&&!scen.attack.complete?'Partial attack estimate':'Attack damage range'}</span><strong>${attackRange(scen.attack)}</strong><small>${!scen.attack.known?'Enter a weapon or jewelry damage range to begin. Missing values are not measured zeros.':!scen.attack.complete?'Some weapon/jewelry endpoints are missing and count as zero in this partial estimate. Do not treat it as your full sheet damage.':'Before crit, Double Hit, Double Damage and enemy mitigation'}</small><b>Change ${pct(scen.attack.known&&base.attack.known?comp.changes.attack.min?.percentChange:null)}</b></div>
 <div class="dcResult"><span>Pet multiplier · entered layers</span><strong>${hasPet?'×'+scen.pet.layerFactor.toFixed(2):'Not measured'}</strong><small>${!hasPet?'Load a pet reference or enter pet bonuses.':scen.pet.min === null ? 'Enter a pre-bonus pet base to calculate final damage.' : 'Estimated pet damage: '+fmt(scen.pet.min)+' – '+fmt(scen.pet.max)} Flat +${fmt(scen.pet.flatBonus)} added before multipliers. Missing percentage stages are not included in this × value; use Pet Quick Compare with an observed total × to anchor projections.</small><b>Change ${hasPet?pct(comp.changes.petMultiplier?.percentChange):'Not measured'}</b></div>
 <div class="dcResult"><span>Attack multiplier breakdown</span><strong>${scen.attack.known?'×'+scen.attack.additiveFactor.toFixed(3)+' / ×'+scen.attack.layerFactor.toFixed(2):'Not measured'}</strong><small>Summed additive first; ${fmt(scen.attack.flatBonus)} flat added after; independent layers multiply. Only entered sources are included.</small></div>
 <div class="dcResult"><span>Retaliation per enemy attack</span><strong>${retB.known?fmtDamage(retB.min)+" – "+fmtDamage(retB.max):"Not measured"}</strong><small>${retB.known?"Unblocked display range. "+(retB.blockedFactor===null?"Blocked-hit multiplier not entered.":"Blocked-hit ×"+fmt(retB.blockedFactor)+" is separate.")+" Not DPS.":"Load Warrior or provide Defense, base-pool, and Retaliation multipliers."}</small><b>Change ${pct(retChange?.percentChange)}</b></div>
 </div>
 <div class="dcCombatNumbers">${hasCombat?`<span>Crit: <b>${fmt(scen.combat.crit.effectiveChance)}%</b> chance, <b>+${fmt(scen.combat.crit.overflowCritDamage)}%</b> overflow damage</span><span>Double Damage: <b>×${fmt(scen.combat.doubleDamage.expected)}</b> mean multiplier</span><span>Double Hit: <b>${fmt(scen.combat.doubleHit.expected)}</b> expected hits on surviving targets</span><span>Alpha Strike: <b>${fmt(scen.combat.alphaStrike.chance)}%</b> proc chance</span>`:'<span>Combat statistics not measured in this reference. Enter your real Crit, Double Hit and Double Damage values to compare them.</span>'}</div>
 <p class="dcValidation">${extra?extra+' what-if change'+(extra===1?'':'s')+' applied.':state.baseline.className==='Custom'?'Custom baseline unchanged.':'Reference baseline unchanged.'} Reference: ${esc(sample)}. Values are reconstructed from rounded in-game tooltips. Conditional procs, caps, enemy mitigation and actual DPS require separate checks.</p>`;
}
function marginalRows(){
 const current=asScenario(),points=state.marginalPoints||10;
 return ['pet','attack'].map(kind=>{
  const gain=rankPercentagePointGains(current,kind,points);
  const heading=kind==='pet'?'Pet multiplier':'Displayed attack';
  if(!gain.known)return '<section class="dcMarginalGroup"><h4>'+heading+'</h4><p class="dcValidation">Enter measured '+kind+' sources to compare gains.</p></section>';
  const top=gain.rows.slice(0,7);
  return '<section class="dcMarginalGroup"><h4>'+heading+'</h4>'+
   (top.length?top.map(row=>{
    const name=LABELS.get(row.path)?.label.split(' · ').at(-1)||row.source;
    return '<div class="dcMarginalRow"><span>'+esc(name)+' <small>('+esc(row.displayStage)+')</small></span>'+
      '<b>+'+row.percentGain.toFixed(2)+'%</b></div>';
   }).join(''):'<p class="dcValidation">No measurable percentage layers yet.</p>')+'</section>';
 }).join('');
}
function marginalPanel(){
 return '<details id="dcMarginal" class="dcMarginal"><summary>Marginal gains lab · compare % sources</summary>'+
  '<p class="dcIntro">See which already-entered percentage layer yields the biggest relative gain for the same added percentage points. This compares tooltip stages, not specific obtainable rolls, stat-point costs, procs or DPS.</p>'+
  '<div class="dcMarginalActions" aria-label="Added percentage points">'+[1,10,100].map(n=>
    '<button type="button" class="btn secondary" data-dc-marginal="'+n+'" aria-pressed="'+String((state.marginalPoints||10)===n)+'">+'+n+' pp</button>'
   ).join('')+'</div><div class="dcMarginalGrid" id="dcMarginalRows">'+marginalRows()+'</div></details>';
}
function updateMarginals(root){
 const rows=root.querySelector('#dcMarginalRows');
 if(rows)rows.innerHTML=marginalRows();
 root.querySelectorAll('[data-dc-marginal]').forEach(btn=>
  btn.setAttribute('aria-pressed',String(Number(btn.dataset.dcMarginal)===(state.marginalPoints||10))));
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
 .dcRoot .dcMarginal{border:1px solid #7775;border-radius:14px;padding:14px;margin:14px 0;background:#6f638215}
 .dcRoot .dcMarginal summary{cursor:pointer;min-height:44px;padding:10px 0;font-weight:700}
 .dcRoot .dcMarginalActions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
 .dcRoot .dcMarginalActions button{min-height:44px;flex:1;min-width:75px}
 .dcRoot .dcMarginalActions button[aria-pressed="true"]{outline:2px solid var(--accent,#b89bff)}
 .dcRoot .dcMarginalGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:14px}
 .dcRoot .dcMarginalGroup{min-width:0}.dcRoot .dcMarginalGroup h4{margin:5px 0}
 .dcRoot .dcMarginalRow{display:flex;justify-content:space-between;align-items:baseline;gap:12px;border-bottom:1px solid #7774;padding:9px 2px;font-size:13px}
 .dcRoot .dcMarginalRow span{min-width:0}.dcRoot .dcMarginalRow small{display:block;opacity:.7;line-height:1.5}
 .dcRoot .dcMarginalRow b{white-space:nowrap;color:#8bdaa0}
 @media(max-width:440px){.dcRoot .dcChangeRow{grid-template-columns:1fr auto}.dcRoot .dcChangeRow span{grid-column:1/-1}.dcRoot .dcScenarioControls{grid-template-columns:1fr}}
 </style>
 <p class="dcIntro">Compare an actual build against a what-if version, with Attack Damage, pet multipliers and combat probabilities kept in their proper stages. Start with a screenshot benchmark or choose Clear values for a genuinely blank character. Empty inputs mean unknown, not zero.</p>
 <div class="dcActions"><button type="button" class="btn secondary" data-dc-example="hunter">Hunter</button><button type="button" class="btn secondary" data-dc-example="mage">AD Mage</button><button type="button" class="btn secondary" data-dc-example="warrior">Retal Warrior</button><button type="button" class="btn secondary" data-dc-clear>Clear values</button><button type="button" class="btn secondary" data-dc-removeall>Clear comparisons</button></div>
 <div class="dcTabs" role="tablist" aria-label="Calculator sections"><button type="button" class="btn secondary" data-dc-tab="attack" aria-selected="true">Attack</button><button type="button" class="btn secondary" data-dc-tab="pet" aria-selected="false">Pets</button><button type="button" class="btn secondary" data-dc-tab="combat" aria-selected="false">Combat</button><button type="button" class="btn secondary" data-dc-tab="retaliation" aria-selected="false">Retaliation</button><button type="button" class="btn secondary" data-dc-tab="skills" aria-selected="false">Skills + ACS</button></div>
 <section aria-live="polite" id="dcResults">${results()}</section>
 ${marginalPanel()}
 ${petQuickCompareView()}
 <section class="dcWork" id="dcInputs">${SETS.map(([section,heading,paths])=>`<div data-dc-panel="${section}">${inputs(section,heading,paths)}</div>`).join('')}${damageSkillPlannerView()}</section>
 <section class="dcScenario"><h3>Compare against a scenario</h3><p class="dcIntro">Change one or more sources. Each replacement belongs to the exact same layer as its original value; it is never stacked on top of the existing total.</p><div class="dcScenarioControls"><label>Add/change a source<select id="dcAddSource">${NUMERIC_PATHS.map(([label,path])=>`<option value="${esc(path)}">${esc(label)}</option>`).join('')}</select></label><button type="button" class="btn primary" data-dc-add>Add change</button></div><div id="dcChanges">${changesMarkup()}</div></section>
 <p class="notice">The presets use rounded in-game values. A blank character never inherits hidden Hunter stats. Crit damage semantics, exact pet base growth, target mitigation, elemental weakness and true DPS need further verification.</p>
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
 updateMarginals(root);
 refreshPetQuickCompare(root,()=>state.baseline);
 updatePanels(root);
}
export function mountDamageCalculator(){
 const root=document.querySelector('#arcanaDamageCalculator');
 if(!root || root.dataset.dcMounted==='yes')return;
 root.dataset.dcMounted='yes';
 load();updateNumbers(root);mountSkillPlanner(root,()=>state.baseline);mountPetQuickCompare(root,()=>state.baseline);
 // Explicit user action replaces the SAME stages in the manual screenshot
 // reference. These are never added on top of the original aggregate values.
 root.addEventListener('dc-apply-pet-comparison',e=>{
  const updates=e.detail?.stages;
  if(!Array.isArray(updates)||!updates.length)return;
  // Never trust paths from DOM events. Only existing measured Pet tooltip
  // percentage-layer sources may be forwarded to the main scenario.
  const allowed=new Set([
   'equipmentAffixes','companionDrop','intelligence','dexterity',
  ]);
  for(const row of updates){
   if(!allowed.has(row?.source)||!Number.isFinite(row?.value)||row.value<0)return;
   if(!Number.isFinite(Number(state.baseline.pet?.layers?.[row.source])))return;
  }
  for(const row of updates)state.changes['pet.layers.'+row.source]=row.value;
  persist();updateNumbers(root);
 });
 root.addEventListener('dc-apply-skill-sheet',e=>{
  const d=e.detail||{};
  const safe=n=>Number.isFinite(Number(n))?Math.max(0,Number(n)):0;
  setAt(state.baseline,'attack.additive.classSkills',safe(d.attackClassPct));
  delete state.changes['attack.additive.classSkills'];
  if(state.baseline.pet?.layers || safe(d.petClassPct)>0){
   setAt(state.baseline,'pet.layers.classSkills',safe(d.petClassPct));
   delete state.changes['pet.layers.classSkills'];
  }
  if(state.baseline.pet?.flat || safe(d.petClassFlat)>0){
   setAt(state.baseline,'pet.flat.classSkills',safe(d.petClassFlat));
   delete state.changes['pet.flat.classSkills'];
  }
  const classes={1:'Warrior',2:'Archer',3:'Mage',4:'Rogue',5:'Druid'};
  state.baseline.className=(classes[d.classId]||'Custom')+' · skill plan';
  persist();updateNumbers(root);
 });
 root.addEventListener('input',e=>{
  if(e.target.matches('[data-dc-field]')){
   const key=e.target.dataset.dcField,value=optionalNumber(e.target.value);
   setAt(state.baseline,key,value);
   // The compact four-pet baseline repeats four fields also available in
   // Advanced Pet inputs. Update only their mirrors, not the focused field.
   root.querySelectorAll('[data-dc-field]').forEach(other=>{
    if(other!==e.target && other.dataset.dcField===key)other.value=value===null?'':value;
   });
   persist();root.querySelector('#dcResults').innerHTML=results();updateMarginals(root);refreshPetQuickCompare(root,()=>state.baseline);
  }
  if(e.target.matches('[data-dc-scenario]')){
   state.changes[e.target.dataset.dcScenario]=optionalNumber(e.target.value);
   persist();root.querySelector('#dcResults').innerHTML=results();updateMarginals(root);refreshPetQuickCompare(root,()=>state.baseline);
  }
 });
 root.addEventListener('click',e=>{
  const btn=e.target.closest('button');
  if(!btn)return;
  if(btn.dataset.dcMarginal){state.marginalPoints=Number(btn.dataset.dcMarginal);persist();updateMarginals(root);return;}
  if(btn.dataset.dcTab){state.mode=btn.dataset.dcTab;updatePanels(root);return;}
  if(btn.hasAttribute('data-dc-example')){const id=btn.dataset.dcExample;state.baseline=clone(id==='warrior'?WARRIOR:id==='mage'?MAGE:EXAMPLE);state.changes={};state.mode=id==='warrior'?'retaliation':'attack';persist();skillPlannerExample(id,root);updateNumbers(root);return;}
  if(btn.hasAttribute('data-dc-clear')){state.baseline=blankDamageBuild();state.changes={};persist();clearSkillPlanner(root);updateNumbers(root);return;}
  if(btn.hasAttribute('data-dc-removeall')){state.changes={};persist();updateNumbers(root);return;}
  if(btn.hasAttribute('data-dc-add')){const path=root.querySelector('#dcAddSource')?.value;if(LABELS.has(path)){state.changes[path]=valueAt(state.baseline,path)||0;persist();updateNumbers(root);}return;}
  if(btn.hasAttribute('data-dc-remove')){delete state.changes[btn.dataset.dcRemove];persist();updateNumbers(root);}
 });
}
