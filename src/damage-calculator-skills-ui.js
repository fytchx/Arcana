import {SKILL_CLASS_NAMES, SKILL_CATALOG, classCapSkills, compareConfiguredSkillCaps} from './damage-calculator-config-caps.js';

/* Cap-only UI, intentionally independent of aggregated Attack/Pet tooltip totals. */
const KEY='arcana:damage:cap-planner:2026-10-17';
const PRESETS={
 hunter:{classId:2,acs:5,points:{2:5,13:1,32:4,33:3,36:1}},
 warrior:{classId:1,acs:17,points:{7:5,23:2,47:1,53:2}},
 mage:{classId:3,acs:17,points:{4:10,21:5,38:1,39:1,42:5}},
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
const css='.dcRoot .dcSkillSettings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0}.dcRoot .dcSkillSettings label,.dcRoot .dcSkillPoints{display:grid;gap:6px;font-size:13px}.dcRoot .dcSkillRow{display:grid;grid-template-columns:minmax(0,1fr) 86px auto;gap:10px;align-items:center;padding:10px;border-bottom:1px solid #7774}.dcRoot .dcSkillRows{border:1px solid #7775;border-radius:12px;overflow:hidden}.dcRoot .dcSkillRow:last-child{border-bottom:0}.dcRoot .dcSkillRow small{display:block;opacity:.7}.dcRoot .dcSkillUnlocked{display:flex;align-items:center;gap:6px;font-size:12px}.dcRoot .dcSkillUnlocked input{width:19px;min-height:19px;accent-color:var(--accent,#ad83f5)}.dcRoot .dcSkillCaps{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:12px;margin:15px 0}.dcRoot .dcSkillCard{border:1px solid #7775;border-radius:12px;background:#6f638215;padding:13px;display:grid;gap:8px}.dcRoot .dcSkillCard strong{font-size:14px}.dcRoot .dcSkillCard small{line-height:1.5;opacity:.8}.dcRoot .dcSkillCard progress{width:100%;height:10px;accent-color:var(--accent,#ad83f5)}@media(max-width:520px){.dcRoot .dcSkillSettings{grid-template-columns:1fr}.dcRoot .dcSkillRow{grid-template-columns:minmax(0,1fr) 76px}.dcRoot .dcSkillUnlocked{grid-column:1/-1}}';
const number=(v,max=1000)=>Number.isFinite(Number(v))?Math.max(0,Math.min(max,Math.floor(Number(v)))):0;
const fmt=v=>Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
let plan;
function make(tag,text,cls){
 const node=document.createElement(tag);
 if(text!==null&&text!==undefined)node.textContent=text;
 if(cls)node.className=cls;
 return node;
}
function preset(key){
 const ref=PRESETS[key]||{classId:2,acs:0,points:{}};
 return {classId:ref.classId,acs:ref.acs,skills:Object.fromEntries(
   Object.entries(ref.points).map(([id,allocated])=>[id,{allocated,unlocked:allocated>0}]))};
}
function load(){
 if(plan)return plan;
 try{
  const p=JSON.parse(localStorage.getItem(KEY)||'null');
  if(SKILL_CLASS_NAMES[p?.classId]&&p.skills&&typeof p.skills==='object'){
   plan={classId:Number(p.classId),acs:number(p.acs),skills:p.skills};return plan;
  }
 }catch{}
 plan=preset('hunter');return plan;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(plan));}catch{}}
function label(text,control,cls){
 const lab=make('label',null,cls);
 lab.append(make('span',text),control);return lab;
}
function renderOutputs(panel){
 const target=panel.querySelector('.dcSkillOutputArea');if(!target)return;
 const data=compareConfiguredSkillCaps({classId:plan.classId,allClassSkills:plan.acs,skills:plan.skills});
 const grid=make('div',null,'dcSkillCaps');
 for(const row of data){
  const card=make('article',null,'dcSkillCard');
  const display=LABELS[row.key]||row.key.replace(/_/g,' ');
  const headline=make('strong',display+': '+fmt(row.applied)+'% / '+fmt(row.cap)+'%');
  const progress=make('progress');
  progress.max=row.cap;progress.value=row.applied;
  progress.setAttribute('aria-label',display+' applied cap');
  const delta=make('small','Raw '+fmt(row.raw)+'% · +1 ACS: '+(row.gainOneACS>0?'+':'')+fmt(row.gainOneACS)+'%'+(row.wasted?' · '+fmt(row.wasted)+'% over cap':''));
  const source=row.contributions.filter(c=>c.effectiveRank>0)
   .map(c=>(SKILL_CATALOG[c.skillId]?.name||c.skillId)+': '+fmt(c.raw)+'%').join(' + ');
  const desc=!row.gateActive?'Requires '+(SKILL_CATALOG[row.gateSkillId]?.name||'trigger skill')+' unlocked':
   (source||'Invest points to activate this output');
  card.append(headline,progress,delta,make('small',desc));grid.append(card);
 }
 target.replaceChildren(make('h3','Applied skill caps'),make('p','Each result shows the usable value. The +1 ACS comparison respects each cap.'),grid,make('p','Output effects shown here are not added to Attack or Pet totals, avoiding double counting. Combat DPS is not estimated.','dcValidation'));
}
function renderControls(panel){
 const target=panel.querySelector('.dcSkillControlArea');if(!target)return;
 const settings=make('div',null,'dcSkillSettings');
 const classSelect=make('select');classSelect.setAttribute('aria-label','Character class');
 for(const [id,name] of Object.entries(SKILL_CLASS_NAMES)){
  const opt=make('option',name);opt.value=id;opt.selected=Number(id)===plan.classId;classSelect.append(opt);
 }
 classSelect.addEventListener('change',()=>{
  plan.classId=Number(classSelect.value);plan.skills={};save();renderControls(panel);renderOutputs(panel);
 });
 const acsInput=make('input');
 Object.assign(acsInput,{type:'number',inputMode:'numeric',min:'0',max:'1000',step:'1',value:String(plan.acs)});
 acsInput.setAttribute('aria-label','All Class Skills');
 acsInput.addEventListener('input',()=>{plan.acs=number(acsInput.value);save();renderOutputs(panel);});
 settings.append(label('Class',classSelect),label('All Class Skills (+ACS)',acsInput));
 const rows=make('div',null,'dcSkillRows');
 for(const skill of classCapSkills(plan.classId)){
  const old=plan.skills[skill.id]||{};
  const allocated=number(old.allocated,skill.maxAllocated);
  const unlocked=old.unlocked===undefined?allocated>0:old.unlocked===true;
  const row=make('div',null,'dcSkillRow');
  const name=make('div',skill.name);
  name.append(make('small','Max '+skill.maxAllocated+' allocated'));
  const points=make('input');
  Object.assign(points,{type:'number',inputMode:'numeric',min:'0',max:String(skill.maxAllocated),step:'1',value:String(allocated)});
  points.setAttribute('aria-label',skill.name+' allocated points');
  const unlock=make('input');unlock.type='checkbox';unlock.checked=unlocked;
  unlock.setAttribute('aria-label',skill.name+' unlocked');
  points.addEventListener('input',()=>{
   const entry=plan.skills[skill.id]||{allocated:0,unlocked:false};
   entry.allocated=number(points.value,skill.maxAllocated);
   if(entry.allocated>0 && !entry.unlocked){entry.unlocked=true;unlock.checked=true;}
   plan.skills[skill.id]=entry;save();renderOutputs(panel);
  });
  unlock.addEventListener('change',()=>{
   const entry=plan.skills[skill.id]||{allocated:0,unlocked:false};
   entry.unlocked=unlock.checked;plan.skills[skill.id]=entry;save();renderOutputs(panel);
  });
  const check=make('label',null,'dcSkillUnlocked');
  check.append(unlock,make('span','Unlocked'));
  row.append(name,label('Points',points,'dcSkillPoints'),check);
  rows.append(row);
 }
 target.replaceChildren(
  make('p','Enter the skills affecting explicitly capped effects. Unlock status is separate from allocated points, and ACS can extend effective ranks beyond the point limit.','dcIntro'),settings,rows
 );
}
export function damageSkillPlannerView(){
 load();
 return '<style>'+css+'</style><section id="dcSkillPlanner" data-dc-panel="skills" hidden><div class="dcSkillControlArea"></div><div class="dcSkillOutputArea" aria-live="polite"></div></section>';
}
export function mountSkillPlanner(root){
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
 plan={classId:current.classId,acs:0,skills:{}};save();
 const panel=root?.querySelector('#dcSkillPlanner');
 if(panel){renderControls(panel);renderOutputs(panel);}
}
