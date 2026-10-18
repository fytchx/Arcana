import {SKILL_CLASS_NAMES,SKILL_CATALOG,classCapSkills,compareConfiguredSkillCaps} from './damage-calculator-config-caps.js';
import {SKILL_EFFECT_DEFINITIONS,compareSkillDamageEffects} from './damage-calculator-skill-effects.js';
import {calculateAttack,calculatePet,relativeDifference} from './damage-calculator-engine.js';

/**
 * Skill planner: one class at a time, but retain per-class allocations and ACS.
 * Numeric subtotals are a PREVIEW, never silently added to manual screenshot
 * totals. Players can explicitly replace matching class-skill sheet subtotals.
 */
const KEY='arcana:damage:cap-planner:2026-10-17';
const PRESETS={
 hunter:{classId:2,acs:5,points:{3:3,12:1,14:1,15:1,2:5,13:1,32:4,33:3,36:1}},
 warrior:{classId:1,acs:17,points:{8:10,50:5,7:5,23:2,47:1,53:2}},
 mage:{classId:3,acs:17,points:{4:10,5:10,17:5,19:5,21:5,38:1,39:1,42:5}},
};
const LABELS={
 boss_damage_bonus:'Boss damage',execute_threshold:'Execute threshold',
 counterstrike_block_bonus:'Counterstrike block bonus',titanic_blow_chance:'Titanic Blow chance',
 relentless_assault_chance:'Relentless Assault chance',bloodthirst_extra_kill:'Bloodthirst extra kill',
 deflection_block:'Deflection block',deflection_retaliation:'Deflection retaliation',
 perfect_shot_chance:'Perfect Shot chance',trap_damage:'Combined trap damage',
 hunters_instinct_chance:'Hunter Instinct chance',alpha_strike_chance:'Alpha Strike chance',
 magic_blast_chance:'Magic Blast chance',arcane_cascade_chance:'Arcane Cascade chance',
 pyroclasm_damage:'Pyroclasm bonus',shadow_echo_chance:'Shadow Echo chance',
 shadow_echo_damage:'Shadow Echo damage',umbral_cascade_chance:'Umbral Cascade chance',
 lucky_hands_duplicate:'Lucky Hands duplicate',lucky_tier:'Lucky tier',
 attack_pet_conversion:'Attack to pet conversion',wild_attunement_amp:'Wild Attunement',
 pet_egg_drop:'Pet egg drops',deep_roots_pet_xp:'Deep Roots pet XP',
};
const STAGES=[
 ['attackPct','Attack Damage · class additive %','%','Replace the class-skills Attack subtotal, not the final Attack multiplier.'],
 ['petPct','Pet Damage · class additive %','%','Replace the class-skills Pet Damage layer, not the entire Pet multiplier.'],
 ['petFlat','Flat pet damage per pet','','Add before pet damage multipliers. Separate from Pet Damage %.'],
 ['critChance','Critical chance','%','Chance before overflow conversion to Crit Damage.'],
 ['critDamage','Critical damage','%','Stat bonus, not a validated expected-DPS factor.'],
 ['doubleHitChance','Double Hit chance','%','Chance source; repeating hits matter only while a target survives.'],
 ['doubleDamageChance','Double Damage chance','%','Chance source; not an unconditional Attack multiplier.'],
 ['defensePct','Defense bonus','%','Does not enter the hero Attack formula.'],
 ['defenseFlat','Flat Defense','','Does not enter the hero Attack formula.'],
 ['petMasteryLevels','Additional Pet Mastery levels','','Level effects are not automatically converted into pet base damage.'],
];
const CONDITIONAL=[
 ['magicBlastProcBonus','Magic Blast damage per triggered proc'],
 ['aboveHalfTargetBonus','Extra damage while target is above 50% HP'],
 ['belowHalfTargetBonus','Extra damage while target is below 50% HP'],
 ['doubleHitConditionalBonus','Extra damage during Double Hit'],
];
const css=`.dcRoot .dcSkillSettings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0}.dcRoot .dcSkillSettings label,.dcRoot .dcSkillPoints{display:grid;gap:6px;font-size:13px}.dcRoot .dcSkillRow{display:grid;grid-template-columns:minmax(0,1fr) 86px auto;gap:10px;align-items:center;padding:10px;border-bottom:1px solid #7774}.dcRoot .dcSkillRows{border:1px solid #7775;border-radius:12px;overflow:hidden}.dcRoot .dcSkillRow:last-child{border-bottom:0}.dcRoot .dcSkillRow small{display:block;opacity:.7}.dcRoot .dcSkillUnlocked{display:flex;align-items:center;gap:6px;font-size:12px}.dcRoot .dcSkillUnlocked input{width:19px;min-height:19px;accent-color:var(--accent,#ad83f5)}.dcRoot .dcSkillCaps{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:12px;margin:15px 0}.dcRoot .dcSkillCard{border:1px solid #7775;border-radius:12px;background:#6f638215;padding:13px;display:grid;gap:8px;min-width:0}.dcRoot .dcSkillCard strong{font-size:14px}.dcRoot .dcSkillCard small{line-height:1.5;opacity:.8}.dcRoot .dcSkillCard progress{width:100%;height:10px;accent-color:var(--accent,#ad83f5)}.dcRoot .dcSkillGroup{border:1px solid #7775;border-radius:12px;margin:12px 0;overflow:hidden}.dcRoot .dcSkillGroup summary{cursor:pointer;padding:14px;font-weight:700;min-height:44px}.dcRoot .dcSkillGroup summary small{opacity:.7;font-weight:400}.dcRoot .dcSkillStageHeading{margin:24px 0 7px}.dcRoot .dcSkillApply{margin:6px 0 16px;min-height:44px}.dcRoot .dcSkillDelta{color:#a4e1bb}.dcRoot .dcSkillTag{font-size:11px;opacity:.75}.dcRoot .dcSkillRow input[type=number]{min-width:0}@media(max-width:520px){.dcRoot .dcSkillSettings{grid-template-columns:1fr}.dcRoot .dcSkillRow{grid-template-columns:minmax(0,1fr) 76px}.dcRoot .dcSkillUnlocked{grid-column:1/-1}}`;
const number=(v,max=1000)=>v!==''&&v!==null&&Number.isFinite(Number(v))?Math.max(0,Math.min(max,Math.floor(Number(v)))):0;
const fmt=v=>Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
let plan;
let getReference=null;
function make(tag,content,cls){
 const node=document.createElement(tag);
 if(content!==null&&content!==undefined)node.textContent=content;
 if(cls)node.className=cls;
 return node;
}
function blank(){return {classId:2,acsByClass:{},byClass:{}};}
function currentSkills(){return plan.byClass[plan.classId] ||= {};}
function currentAcs(){return number(plan.acsByClass[plan.classId]);}
function preset(name){
 const ref=PRESETS[name]||{classId:2,acs:0,points:{}};
 const p=blank();p.classId=ref.classId;p.acsByClass[ref.classId]=ref.acs;
 p.byClass[ref.classId]=Object.fromEntries(Object.entries(ref.points).map(([id,allocated])=>[id,{allocated,unlocked:true}]));
 return p;
}
function load(){
 if(plan)return plan;
 try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'null');
  if(SKILL_CLASS_NAMES[saved?.classId]){
   plan={classId:Number(saved.classId),acsByClass:saved.acsByClass||{},
    byClass:saved.byClass||{}};
   // Older cap-only planner had one ACS value and one flat skills map.
   if(saved.skills && typeof saved.skills==='object'){
    plan.byClass[plan.classId] ||= saved.skills;
    if(plan.acsByClass[plan.classId]===undefined)plan.acsByClass[plan.classId]=number(saved.acs);
   }
   return plan;
  }
 }catch{}
 plan=blank();return plan;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(plan));}catch{}}
function label(text,control,cls){
 const lab=make('label',null,cls);lab.append(make('span',text),control);return lab;
}
function stageCard(key,name,unit,note,comparison){
 const card=make('article',null,'dcSkillCard');
 const value=comparison.totals[key]||0;
 const gain=comparison.gainsOneACS[key]||0;
 card.append(make('strong',name),
  make('div',fmt(value)+unit),
  make('small','+1 ACS: '+(gain>0?'+':'')+fmt(gain)+unit,'dcSkillDelta'),
  make('small',note));
 return card;
}
function projectionCard(derived){
 const reference=typeof getReference==='function'?getReference():null;
 if(!reference?.attack)return null;
 const className=reference.className||'Archer / Hunter';
 const refClass=Object.entries(SKILL_CLASS_NAMES).find(([,name])=>
  className.toLowerCase().startsWith(name.toLowerCase()))?.[0];
 if(Number(refClass)!==plan.classId){
  return make('p','Load the matching '+SKILL_CLASS_NAMES[plan.classId]+' example to preview the effect on actual Attack/Pet totals. Other-class tooltip stages are not interchangeable.','dcValidation');
 }
 const baselineAttack={...reference.attack,
  additive:{...reference.attack.additive,classSkills:derived.sheetStages.attackClassPct}};
 const acsAttack={...reference.attack,
  additive:{...reference.attack.additive,classSkills:derived.afterOneACS.attackPct}};
 const before=calculateAttack(baselineAttack);
 const after=calculateAttack(acsAttack);
 const attackGain=relativeDifference(before.min,after.min);
 const card=make('article',null,'dcSkillCard');
 card.append(make('strong','+1 ACS · projected sheet change'),
  make('div','Attack: '+fmt(before.min)+' → '+fmt(after.min)+' minimum; '+fmt(before.max)+' → '+fmt(after.max)+' maximum'),
  make('small','Attack gain: '+(attackGain?(attackGain.percentChange>0?'+':'')+fmt(attackGain.percentChange)+'%':'not available')+' (class-skill subtotal replaced, not added).','dcSkillDelta'));
 if(reference.pet?.layers&&Object.keys(reference.pet.layers).length){
  const petBefore=calculatePet({...(reference.pet||{}),
   layers:{...reference.pet.layers,classSkills:derived.sheetStages.petClassPct},
   flat:{...reference.pet.flat,classSkills:derived.sheetStages.petClassFlat}});
  const petAfter=calculatePet({...(reference.pet||{}),
   layers:{...reference.pet.layers,classSkills:derived.afterOneACS.petPct},
   flat:{...reference.pet.flat,classSkills:derived.afterOneACS.petFlat}});
  const petGain=relativeDifference(petBefore.layerFactor,petAfter.layerFactor);
  card.append(make('small','Pet percentage multiplier: ×'+fmt(petBefore.layerFactor)+
   ' → ×'+fmt(petAfter.layerFactor)+'. '+(petGain?('+'+fmt(petGain.percentChange)+'% from % layers'):'')+
   '. Flat changes are only reflected in final damage when an actual pet base is supplied.'));
 }
 card.append(make('small','Holds every other screenshot value fixed. Conditional procs, crit, enemy defense, target health and unverified pet base growth are excluded.'));
 return card;
}
function renderOutputs(panel){
 const target=panel.querySelector('.dcSkillOutputArea');if(!target)return;
 const input={classId:plan.classId,allClassSkills:currentAcs(),skills:currentSkills()};
 const derived=compareSkillDamageEffects(input);
 const caps=compareConfiguredSkillCaps(input);
 const stats=make('div',null,'dcSkillCaps');
 for(const [key,name,unit,note] of STAGES){
  if(!derived.totals[key] && !derived.gainsOneACS[key])continue;
  stats.append(stageCard(key,name,unit,note,derived));
 }
 if(!stats.children.length)stats.append(make('p','Allocate damage skills to preview how each affects your stats.'));
 const conditional=make('div',null,'dcSkillCaps');
 for(const [key,name] of CONDITIONAL){
  if(!derived.totals[key]&&!derived.gainsOneACS[key])continue;
  conditional.append(stageCard(key,name,'%','Conditional only. Never included in ordinary sheet Attack or Pet Damage.',derived));
 }
 const grid=make('div',null,'dcSkillCaps');
 for(const row of caps){
  const card=make('article',null,'dcSkillCard');
  const display=LABELS[row.key]||row.key.replace(/_/g,' ');
  const progress=make('progress');
  progress.max=row.cap;progress.value=row.applied;
  progress.setAttribute('aria-label',display+' applied cap');
  const delta=make('small','Raw '+fmt(row.raw)+'% · +1 ACS: '+(row.gainOneACS>0?'+':'')+fmt(row.gainOneACS)+'%'+(row.wasted?' · '+fmt(row.wasted)+'% over cap':''),'dcSkillDelta');
  const source=row.contributions.filter(c=>c.effectiveRank>0)
   .map(c=>(SKILL_CATALOG[c.skillId]?.name||c.skillId)+': '+fmt(c.raw)+'%').join(' + ');
  const desc=!row.gateActive?'Requires '+(SKILL_CATALOG[row.gateSkillId]?.name||'trigger skill')+' unlocked':
   (source||'Invest points to activate this output');
  card.append(make('strong',display+': '+fmt(row.applied)+'% / '+fmt(row.cap)+'%'),progress,delta,make('small',desc));
  grid.append(card);
 }
 const apply=make('button','Replace Attack/Pet class subtotals with this skill plan','btn primary dcSkillApply');
 apply.type='button';apply.addEventListener('click',()=>{
  panel.dispatchEvent(new CustomEvent('dc-apply-skill-sheet',{bubbles:true,detail:{
   classId:plan.classId,attackClassPct:derived.sheetStages.attackClassPct,
   petClassPct:derived.sheetStages.petClassPct,petClassFlat:derived.sheetStages.petClassFlat,
  }}));
  renderOutputs(panel);
 });
 const projected=projectionCard(derived);
 const parts=[make('h3','Derived class skill bonuses','dcSkillStageHeading'),
  make('p','These rates come from documented class skill descriptions. +1 ACS shows what actually changes across all unlocked skills. No output here is silently added to your screenshot totals.','dcIntro'),
  stats,apply];
 if(projected)parts.push(projected);
 if(conditional.children.length)parts.push(make('h3','Conditional skill damage','dcSkillStageHeading'),conditional);
 parts.push(make('h3','Configured skill caps','dcSkillStageHeading'),
  make('p','The October 17 game config caps these outputs separately. Shared caps are applied once; procs and loot chances are never treated as guaranteed Attack damage.','dcIntro'),
  grid,make('p','Current config provides 90 skill IDs and 24 cap groups. Other per-rank effects use dated skill descriptions. Combat outcomes, actual pet base and unknown stage interactions still need testing.','dcValidation'));
 target.replaceChildren(...parts);
}
function renderControls(panel){
 const target=panel.querySelector('.dcSkillControlArea');if(!target)return;
 const settings=make('div',null,'dcSkillSettings');
 const classSelect=make('select');classSelect.setAttribute('aria-label','Character class');
 for(const [id,name] of Object.entries(SKILL_CLASS_NAMES)){
  const opt=make('option',name);opt.value=id;opt.selected=Number(id)===plan.classId;classSelect.append(opt);
 }
 classSelect.addEventListener('change',()=>{
  plan.classId=Number(classSelect.value);save();renderControls(panel);renderOutputs(panel);
 });
 const acsInput=make('input');
 Object.assign(acsInput,{type:'number',inputMode:'numeric',min:'0',max:'1000',step:'1',value:String(currentAcs())});
 acsInput.setAttribute('aria-label','All Class Skills');
 acsInput.addEventListener('input',()=>{plan.acsByClass[plan.classId]=number(acsInput.value);save();renderOutputs(panel);});
 settings.append(label('Class',classSelect),label('All Class Skills (+ACS)',acsInput));
 const relevant=new Set(classCapSkills(plan.classId).map(x=>x.id));
 const damage=new Set(SKILL_EFFECT_DEFINITIONS.filter(x=>SKILL_CATALOG[x.skillId].classId===plan.classId).map(x=>x.skillId));
 const groups=[
  ['Damage and stat skills',skill=>damage.has(skill.id)],
  ['Capped or conditional skills',skill=>!damage.has(skill.id)&&relevant.has(skill.id)],
  ['Other class skills',skill=>!damage.has(skill.id)&&!relevant.has(skill.id)],
 ];
 const all=Object.values(SKILL_CATALOG).filter(x=>x.classId===plan.classId).sort((a,b)=>a.id-b.id);
 const containers=[];
 for(const [title,filter] of groups){
  const selected=all.filter(filter);
  if(!selected.length)continue;
  const details=make('details',null,'dcSkillGroup');details.open=title==='Damage and stat skills';
  const summary=make('summary',title+' ('+selected.length+')');details.append(summary);
  const rows=make('div',null,'dcSkillRows');
  for(const skill of selected){
   const old=currentSkills()[skill.id]||{};
   const allocated=number(old.allocated,skill.maxAllocated);
   const unlocked=old.unlocked===undefined?allocated>0:old.unlocked===true;
   const row=make('div',null,'dcSkillRow');
   const name=make('div',skill.name);
   name.append(make('small','Max '+skill.maxAllocated+' points · '+(damage.has(skill.id)?'Stat effects':relevant.has(skill.id)?'Cap tracked':'Not yet modeled')));
   const points=make('input');
   Object.assign(points,{type:'number',inputMode:'numeric',min:'0',max:String(skill.maxAllocated),step:'1',value:String(allocated)});
   points.setAttribute('aria-label',skill.name+' allocated points');
   const unlock=make('input');unlock.type='checkbox';unlock.checked=unlocked;
   unlock.setAttribute('aria-label',skill.name+' unlocked');
   points.addEventListener('input',()=>{
    const entry=currentSkills()[skill.id]||{allocated:0,unlocked:false};
    entry.allocated=number(points.value,skill.maxAllocated);
    if(entry.allocated>0&&!entry.unlocked){entry.unlocked=true;unlock.checked=true;}
    currentSkills()[skill.id]=entry;save();renderOutputs(panel);
   });
   unlock.addEventListener('change',()=>{
    const entry=currentSkills()[skill.id]||{allocated:0,unlocked:false};
    entry.unlocked=unlock.checked;currentSkills()[skill.id]=entry;save();renderOutputs(panel);
   });
   const check=make('label',null,'dcSkillUnlocked');
   check.append(unlock,make('span','Unlocked'));
   row.append(name,label('Points',points,'dcSkillPoints'),check);rows.append(row);
  }
  details.append(rows);containers.push(details);
 }
 target.replaceChildren(make('p','All 18 class skills are visible. Each class keeps its own points and ACS when you switch. Unlock status is independent of allocated rank, and ACS raises effective rank beyond the allocation limit.','dcIntro'),
  settings,...containers);
}
export function damageSkillPlannerView(){
 load();
 return '<style>'+css+'</style><section id="dcSkillPlanner" data-dc-panel="skills" hidden><div class="dcSkillControlArea"></div><div class="dcSkillOutputArea" aria-live="polite"></div></section>';
}
export function mountSkillPlanner(root,referenceGetter=null){
 if(typeof referenceGetter==='function')getReference=referenceGetter;
 const panel=root?.querySelector('#dcSkillPlanner');
 if(!panel||panel.dataset.skillMounted==='yes')return;
 panel.dataset.skillMounted='yes';load();renderControls(panel);renderOutputs(panel);
}
export function skillPlannerExample(name,root){
 plan=preset(name);save();
 const panel=root?.querySelector('#dcSkillPlanner');
 if(panel){renderControls(panel);renderOutputs(panel);}
}
export function clearSkillPlanner(root){
 const current=load();
 plan=blank();plan.classId=current.classId;save();
 const panel=root?.querySelector('#dcSkillPlanner');
 if(panel){renderControls(panel);renderOutputs(panel);}
}
