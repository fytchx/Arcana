import {esc,icon} from './ui.js';
import {normalizeGuildTree,guildBonusTotals,guildTreeSpent,GUILD_BASE_NODES,GUILD_NODE_LABELS,GUILD_GROUPS} from './guild-tree-engine.js';

const KEY='arcana-guild-baseline-v1';
const round=n=>Number(n.toFixed(3));
const print=n=>round(n).toLocaleString('en-US',{maximumFractionDigits:3});
const format=(id,n)=>print(n)+(id.startsWith('flat_')?'':'%');
export function readGuildBaseline(storage=null){
 try{const raw=(storage||globalThis.localStorage).getItem(KEY);return raw?normalizeGuildTree(JSON.parse(raw)):null}
 catch{return null}
}
export function saveGuildBaseline(plan,storage=null){
 const value=normalizeGuildTree(plan);
 try{(storage||globalThis.localStorage).setItem(KEY,JSON.stringify(value))}catch{}
 return value;
}
export function clearGuildBaseline(storage=null){
 try{(storage||globalThis.localStorage).removeItem(KEY)}catch{}
 return null;
}
export function guildPlanDifference(plan,rawBaseline){
 const current=normalizeGuildTree(plan),baseline=rawBaseline?normalizeGuildTree(rawBaseline):null;
 if(!baseline)return {current,baseline:null,changes:[]};
 const present=guildBonusTotals(current),previous=guildBonusTotals(baseline);
 const changes=GUILD_BASE_NODES.map(node=>{
  const before=previous[node.id].total,after=present[node.id].total,delta=round(after-before);
  return {id:node.id,label:GUILD_NODE_LABELS[node.id],group:node.family,before,after,delta};
 });
 return {current,baseline,changes,gained:changes.filter(x=>x.delta>0).length,lost:changes.filter(x=>x.delta<0).length,unchanged:changes.filter(x=>x.delta===0).length};
}
export function guildCompareView(plan,baseline){
 const diff=guildPlanDifference(plan,baseline);
 const actions=`<div class="guildCompareActions"><button type="button" data-action="guildbaseline">${icon('bookmark',17)} ${baseline?'Replace baseline with current':'Save current plan as baseline'}</button>${baseline?'<button type="button" data-action="guildbaselineclear">Clear baseline</button>':''}</div>`;
 if(!diff.baseline)return `<div class="guildCompare"><div class="guildTreeSectionTitle"><h3>Compare guild plans</h3><p>Save the current allocation as your baseline, then change points in the other tabs. Arcana will show exactly which bonuses increase or decrease.</p></div>${actions}<p class="guildTreeWhy">The comparison baseline stays on this device. It does not change any in-game guild skills.</p></div>`;
 const current=diff.current,base=diff.baseline;
 const sameLevel=current.level===base.level;
 const cards=GUILD_GROUPS.map(group=>{
  const rows=diff.changes.filter(x=>x.group===group.id);
  return `<section class="guildCompareGroup"><h4>${esc(group.title)}</h4><div class="guildCompareTable" role="table" aria-label="${esc(group.title)} bonus changes">
   <div class="guildCompareRow header" role="row"><span>Bonus</span><span>Baseline</span><span>Current</span><span>Change</span></div>
   ${rows.map(x=>`<div class="guildCompareRow" role="row"><span>${esc(x.label)}</span><span><small>Baseline</small>${format(x.id,x.before)}</span><span><small>Current</small>${format(x.id,x.after)}</span><strong class="${x.delta>0?'up':x.delta<0?'down':'even'}"><small>Change</small>${x.delta>0?'+':''}${format(x.id,x.delta)}</strong></div>`).join('')}
   </div></section>`;
 }).join('');
 return `<div class="guildCompare"><div class="guildTreeSectionTitle"><h3>Plan versus baseline</h3><p>Compare all eleven bonus categories. Values include each plan's selected Bonus Boost.</p></div>
 <div class="guildCompareSummary"><div><small>Saved baseline</small><strong>Level ${base.level}</strong><span>${guildTreeSpent(base)} allocated · ×${print(base.boost)} boost</span></div><div><small>Current plan</small><strong>Level ${current.level}</strong><span>${guildTreeSpent(current)} allocated · ×${print(current.boost)} boost</span></div></div>
 ${!sameLevel?'<p class="guildCompareCaution">These plans use different guild levels, so the differences include more than allocation choices.</p>':''}
 <p class="guildComparePulse"><strong>${diff.gained} higher</strong> · <strong>${diff.lost} lower</strong> · ${diff.unchanged} unchanged bonuses</p>
 ${cards}${actions}
 <p class="guildTreeWhy">Save the current allocation at any time to replace the comparison baseline. The original plan is preserved separately until you replace or clear it. Baselines are local and not included in shared build links.</p></div>`;
}
