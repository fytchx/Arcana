import {esc} from './ui.js';
import {stagesFor,stageForGear,planGearUpgrades,normalizePathfinderPlan,formatCost,REAL_EQUIPMENT_SLOTS} from './pathfinder-engine.js';
export const PATHFINDER_PLAN_KEY='arcana-pathfinder-plan-v1';
export function readPathfinderPlan(store=globalThis.localStorage){try{return normalizePathfinderPlan(JSON.parse(store.getItem(PATHFINDER_PLAN_KEY)||'null')||{})}catch{return normalizePathfinderPlan()}}
export function savePathfinderPlan(raw,store=globalThis.localStorage){const plan=normalizePathfinderPlan(raw);try{store.setItem(PATHFINDER_PLAN_KEY,JSON.stringify(plan))}catch{}return plan}
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:1});
const opt=(id,label,selected)=>'<option value="'+esc(id)+'" '+(id===selected?'selected':'')+'>'+esc(label)+'</option>';
const stageOptions=(list,value)=>list.map(x=>opt(x.id,x.id+' · '+x.name,value)).join('');
const levelOptions=(list,stage,level)=>Array.from({length:1+(list.find(x=>x.id===stage)?.max||0)},(_,i)=>opt(String(i),'+'+i,String(level))).join('');
function gearRows(equipment,plan,data){
 const stages=stagesFor(data);
 const rows=Object.entries(equipment||{}).filter(([slot,g])=>g&&REAL_EQUIPMENT_SLOTS.includes(slot));
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

function materialTable(report,plan){
 if(!report.materials.length)return '<p class="pfNote">Raise at least one item target to calculate its requirements.</p>';
 return '<div class="pfMaterials">'+report.materials.map(m=>
  '<div class="pfMaterial"><div class="pfMaterialTitle"><strong>'+esc(m.name)+'</strong><span>'+ (m.missing===0n?'Ready':formatCost(m.missing)+' remaining')+'</span></div>'+
  '<small>Required '+formatCost(m.required)+' · owned '+formatCost(m.owned)+(m.sourceMonster?' · '+esc(m.sourceMonster)+(m.sourceBiome?' ('+esc(m.sourceBiome)+')':''):'')+'</small>'+
  '<div class="pfMaterialFields"><label>Owned<input type="number" min="0" inputmode="numeric" data-pf-owned="'+esc(m.slug)+'" value="'+esc(plan.inventory[m.slug]||'0')+'"></label>'+
  '<label>Measured material/min<input type="number" min="0" step="any" inputmode="decimal" data-pf-rate="'+esc(m.slug)+'" placeholder="Optional" value="'+(plan.rates[m.slug]?.perMinute||'')+'"></label><label>ML XP / minute here<input type="number" min="0" step="any" inputmode="decimal" data-pf-xp="'+esc(m.slug)+'" placeholder="Optional" value="'+(plan.rates[m.slug]?.mlXpPerMinute||'')+'"></label></div></div>'
 ).join('')+'</div>';
}
function farmTable(report,plan){
 const notes=report.priority.map((m,i)=>
  '<div class="pfRecommendation"><b>'+(i+1)+'. '+esc(m.sourceMonster||m.name)+'</b><span>'+esc(m.name)+' · '+fmt(m.minutes)+' min at '+fmt(m.perMinute)+'/min</span></div>'
 ).join('');
 return '<section class="pfPanel"><h2>3. Farming priorities</h2><p>Your measurements, not fabricated monster drop rates, determine these estimates.</p>'+
 '<label>Your best ML XP / minute<input type="number" min="0" step="any" data-pf-best-xp inputmode="decimal" value="'+(plan.baselineMlXpPerMinute||'')+'" placeholder="Optional measured value"></label>'+
 '<label>Route strategy<select data-pf-strategy>'+[
 ['balanced','Balanced'],['materials','Materials first'],['ml','Monster Level first']
 ].map(([v,label])=>opt(v,label,plan.strategy)).join('')+'</select></label>'+
 (notes||'<p class="pfNote">Enter a farming rate for a missing material to create a route.</p>')+
 (report.unknownRates?'<p class="pfWarning">'+report.unknownRates+' missing material types still need measured rates. Total farming time is incomplete.</p>':'')+
 (notes?'<p class="pfNote">'+(report.estimatedAll?'Individual material total':'Measured subtotal')+': '+fmt(report.estimateMinutes)+' minutes. Shared drops and travel time are not accounted for.</p>':'')+
 '<p class="pfNote">This is a measured-material priority list, not yet a globally optimized ML + material route. Verified monster rates and kill times are needed for that next stage.</p></section>';
}
export function pathfinderView(equipment,raw,snapshot,error=''){
 const p=normalizePathfinderPlan(raw);
 if(!snapshot)return '<div class="pfPage"><h1>Arcana Pathfinder</h1><p class="pfWarning">'+esc(error||'Loading verified upgrade recipes…')+'</p></div>';
 const result=planGearUpgrades(equipment,p,snapshot);
 return '<div class="pfPage"><header><span class="eyebrow">ARCANA PATHFINDER</span><h1>One loadout. One material plan.</h1><p>Set target levels for every equipped item, subtract your inventory and identify your next farms.</p></header>'+
 '<div class="pfNav"><button class="btn secondary" data-route="labs/build">Edit Build Studio equipment</button><button class="btn secondary" data-route="wiki/library" data-params="kind=material">Wiki materials</button></div>'+
 '<section class="pfPanel"><h2>1. Set your upgrade goals</h2>'+controls(p)+gearRows(equipment,p,snapshot)+headline(result,p)+'</section>'+
 '<section class="pfPanel"><h2>2. Every material required</h2><p>Totals are combined across every equipped item. Enter what you already have.</p>'+materialTable(result,p)+'</section>'+
 farmTable(result,p)+
 '<p class="pfNote">Source: '+esc(snapshot.sourceVersion||snapshot.source||'October 2026')+'. Snapshot costs extend through A30. Pity, real-time inventory and exact drop rates are not automatically known.</p></div>';
}
