/* Fast upgrade reference. Reuses Pathfinder's source-backed range engine.
 * No slot-specific prices or failure probabilities are invented. */
import {allStages,quoteRange,normalizeRange} from './pathfinder-range.js';
import {money} from './pathfinder-timeline.js';
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const opt=(id,label,current)=>'<option value="'+esc(id)+'"'+(id===current?' selected':'')+'>'+esc(label)+'</option>';
export function initialQuickRange(snapshot,raw={}){
 const stages=allStages(snapshot);
 const hasSaved=raw&&raw.fromStage&&raw.toStage;
 if(hasSaved)return normalizeRange(raw,snapshot,{stage:'A4'});
 const a1=stages.find(s=>s.id==='A1'),a2=stages.find(s=>s.id==='A2');
 if(a1&&a2)return normalizeRange({fromStage:'A1',fromLevel:0,toStage:'A2',toLevel:0},snapshot,{stage:'A1'});
 return normalizeRange(raw,snapshot,{stage:stages[0]?.id});
}
export function quickUpgradePanel(snapshot,raw={},options={}){
 const page=options.page===true;
 const classes='quickCosts '+(page?'quickCostsFull':'quickCostsHome');
 const heading=page?'<div class="quickEyebrow">UPGRADE COST CALCULATOR</div><h2>Upgrade Costs</h2><p>Select the starting and target upgrades to calculate materials and Gold.</p>':
 '<div class="quickCostsHead"><div><span class="quickEyebrow">UPGRADE COST CALCULATOR</span><h2>Upgrade Costs</h2><p>Materials and Gold for any upgrade range.</p></div><span class="quickHint">A1 → A2</span></div>';
 const inner=quickUpgradeContent(snapshot,raw,{page,error:options.error||''});
 return '<section class="'+classes+'" aria-label="Quick upgrade cost calculator">'+heading+'<div id="pathRangeContent">'+inner+'</div>'+
 (page?'<div class="quickCostsExtra"><button type="button" data-route="calculators/pathfinder" data-params="view=timeline">Explore the upgrade map →</button></div>':
 '<div class="quickCostsExtra"><button type="button" data-route="calculators/pathfinder" data-params="view=range">Open full calculator →</button></div>')+'</section>';
}
export function quickUpgradeContent(snapshot,raw={},options={}){
 if(!snapshot)return options.error?'<div class="quickError" role="status">'+esc(options.error)+' <button type="button" data-action="path-refresh">Retry recipes</button></div>':'<div class="quickWaiting" role="status"><span class="quickSpinner" aria-hidden="true"></span>Loading game upgrade recipes…</div>';
 const range=initialQuickRange(snapshot,raw),stages=allStages(snapshot);
 if(!stages.length)return '<p class="quickError">Upgrade recipes are not available.</p>';
 const quote=quoteRange(snapshot,range,{stage:range.fromStage});
 const from=stages.find(s=>s.id===range.fromStage),to=stages.find(s=>s.id===range.toStage);
 const stageOptions=selected=>stages.map(s=>opt(s.id,s.id+(s.name&&s.id.startsWith('T')?' · '+s.name:''),selected)).join('');
 const levelOptions=(stage,value)=>Array.from({length:Math.max(0,stage?.max||0)+1},(_,n)=>opt(String(n),'+'+n,String(value))).join('');
 const fields='<div class="quickEndpoints">'+
 '<fieldset><legend>FROM</legend><label><span>Rank</span><select data-path-from-stage aria-label="Starting upgrade rank">'+stageOptions(range.fromStage)+'</select></label><label><span>Level</span><select data-path-from-level aria-label="Starting enhancement level">'+levelOptions(from,range.fromLevel)+'</select></label></fieldset>'+
 '<span class="quickArrow" aria-hidden="true">→</span>'+
 '<fieldset><legend>TO</legend><label><span>Rank</span><select data-path-to-stage aria-label="Target upgrade rank">'+stageOptions(range.toStage)+'</select></label><label><span>Level</span><select data-path-to-level aria-label="Target enhancement level">'+levelOptions(to,range.toLevel)+'</select></label></fieldset></div>';
 if(quote.error)return fields+'<div class="quickError" role="status">'+esc(quote.error)+(quote.missing?.length?' Missing: '+esc(quote.missing.slice(0,3).join(', ')):'')+'</div>';
 const summary='<div class="quickTotals" role="status" aria-live="polite"><div><small>Gold</small><strong>'+money(quote.gold)+'</strong></div><div><small>Material types</small><strong>'+quote.materials.length+'</strong></div><div><small>Upgrade steps</small><strong>'+quote.steps+'</strong></div></div>';
 const list=quote.materials.slice(0,options.page?10:5).map(m=>'<div class="quickMaterial"><span>'+esc(m.name)+'</span><strong>'+money(m.quantity)+'</strong></div>').join('');
 const remaining=quote.materials.length-(options.page?10:5);
 const details='<details class="quickMaterialDetails" '+(options.page?'open':'')+'><summary>All materials '+(quote.materials.length?'('+quote.materials.length+')':'')+'</summary><div class="quickMaterialList">'+quote.materials.map(m=>'<div class="quickMaterial"><span>'+esc(m.name)+'</span><strong>'+money(m.quantity)+'</strong></div>').join('')+'</div></details>';
 const featured=quote.materials.length?'<div class="quickMaterialList">'+list+'</div>':'<p class="quickEmpty">These upgrade checkpoints are identical. No materials required.</p>';
 return fields+summary+featured+(remaining>0?'<div class="quickMoreLabel">+'+remaining+' more material types below</div>':'')+details+
 '<p class="quickSource">Recipe material and Gold totals. Failed attempts are not included.</p>';
}
