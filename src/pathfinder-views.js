import {esc} from './ui.js';
import {stagesFor,stageForGear,planGearUpgrades,normalizePathfinderPlan,formatCost} from './pathfinder-engine.js';
export const PATHFINDER_PLAN_KEY='arcana-pathfinder-plan-v1';
export function readPathfinderPlan(store=globalThis.localStorage){try{return normalizePathfinderPlan(JSON.parse(store.getItem(PATHFINDER_PLAN_KEY)||'null')||{})}catch{return normalizePathfinderPlan()}}
export function savePathfinderPlan(raw,store=globalThis.localStorage){const plan=normalizePathfinderPlan(raw);try{store.setItem(PATHFINDER_PLAN_KEY,JSON.stringify(plan))}catch{}return plan}
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:1});
const opt=(id,label,selected)=>'<option value="'+esc(id)+'" '+(id===selected?'selected':'')+'>'+esc(label)+'</option>';
const stageOptions=(list,value)=>list.map(x=>opt(x.id,x.id+' · '+x.name,value)).join('');
const levelOptions=(list,stage,level)=>Array.from({length:1+(list.find(x=>x.id===stage)?.max||0)},(_,i)=>opt(String(i),'+'+i,String(level))).join('');
function gearRows(equipment,plan,data){
 const stages=stagesFor(data);
 const rows=Object.entries(equipment||{}).filter(([,g])=>g);
 if(!rows.length)return '<p class="pfNote">Start by choosing your current equipment in Build Studio.</p>';
 return '<div class="pfGearGrid">'+rows.map(([slot,g])=>{
  const from=stageForGear(g);
  if(!from)return '<p class="pfNote">'+esc(slot)+': Set the rarity in Build Studio.</p>';
  const level=plan.currentLevels[slot]??0,target=plan.targets[slot]?.stage||from,targetLevel=plan.targets[slot]?.level??level;
  return '<div class="pfGearRow"><div><strong>'+esc(slot.replace(/([a-z])([A-Z])/g,'$1 $2'))+'</strong><small>'+esc(String(g.id||'').replace(/^game:item:/,'').replace(/-/g,' '))+'</small></div>'+
  '<label>Current '+esc(from)+'<select data-pf-current="'+esc(slot)+'">'+levelOptions(stages,from,Math.min(level,stages.find(x=>x.id===from)?.max||0))+'</select></label>'+
  '<label>Target<select data-pf-stage="'+esc(slot)+'">'+stageOptions(stages,target)+'</select></label>'+
  '<label>Level<select data-pf-level="'+esc(slot)+'">'+levelOptions(stages,target,targetLevel)+'</select></label></div>';
 }).join('')+'</div>';
}
function headline(report,plan){
 return '<div class="pfStats"><div><small>Upgrade steps</small><strong>'+fmt(report.steps)+'</strong></div><div><small>'+(plan.includeFailures?'Estimated Gold':'Gold')+'</small><strong>'+formatCost(report.gold)+'</strong></div><div><small>Materials still missing</small><strong>'+report.missingCount+'</strong></div></div>'+
 (report.errors.length?'<p class="pfWarning">'+esc(report.errors.slice(0,3).join('; '))+'</p>':'')+
 '<p class="pfNote">'+(plan.includeFailures?'Expected costs use listed failure chances and a 30% refund, excluding unknown pity rules.':'Base upgrade costs before any failures.')+'</p>';
}
function controls(plan){
 return '<div class="pfOptions"><label><input type="checkbox" data-pf-failures '+(plan.includeFailures?'checked':'')+'> Include expected failed attempts</label><button class="btn secondary" data-action="pf-set-all">Set all targets to A1 +0</button></div>';
}
export function buildProgressionView(equipment,plan,snapshot,error=''){
 const p=normalizePathfinderPlan(plan);
 return '<section class="pfPanel" aria-label="Build Studio upgrade planning"><h2>Upgrade your entire loadout</h2><p>Configure each equipped item’s current enhancement and target. Sharing builds stays separate from your personal farming inventory.</p>'+
 (!snapshot?'<p class="pfWarning">'+esc(error||'Loading source-backed upgrade recipes…')+'</p>':
 controls(p)+gearRows(equipment,p,snapshot)+headline(planGearUpgrades(equipment,p,snapshot),p))+
 '<button class="btn primary" data-route="calculators/pathfinder">Open Pathfinder · All materials & farming</button></section>';
}
