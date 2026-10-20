/* Fast upgrade reference. Reuses Pathfinder's source-backed range engine.
 * No slot-specific prices or failure probabilities are invented. */
import {allStages,quoteRange,normalizeRange,normalizeCostMode} from './pathfinder-range.js';
import {quoteFailureScenarios} from './pathfinder-failures.js';
import {money} from './pathfinder-timeline.js';
import {sourceMaterialGroups} from './pathfinder-material-groups.js';
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
 const inner=quickUpgradeContent(snapshot,raw,{page,error:options.error||'',catalog:options.catalog||[]});
 return '<section class="'+classes+'" aria-label="Quick upgrade cost calculator">'+heading+'<div id="pathRangeContent">'+inner+'</div>'+
 (page?'<div class="quickCostsExtra"><button type="button" data-pf-save-list>Save farming checklist</button><button type="button" data-route="calculators/pathfinder" data-params="view=timeline">Explore the upgrade map →</button></div>':
 '<div class="quickCostsExtra"><button type="button" data-route="calculators/pathfinder" data-params="view=range">Open full calculator →</button></div>')+'</section>';
}
export function quickUpgradeContent(snapshot,raw={},options={}){
 if(!snapshot)return options.error?'<div class="quickError" role="status">'+esc(options.error)+' <button type="button" data-action="path-refresh">Retry recipes</button></div>':'<div class="quickWaiting" role="status"><span class="quickSpinner" aria-hidden="true"></span>Loading game upgrade recipes…</div>';
 const range=initialQuickRange(snapshot,raw),stages=allStages(snapshot);
 if(!stages.length)return '<p class="quickError">Upgrade recipes are not available.</p>';
 const quote=quoteRange(snapshot,range,{stage:range.fromStage});
 const scenarios=quoteFailureScenarios(snapshot,quote);
 const mode=scenarios.available?normalizeCostMode(range.costMode):'min';
 const selected=scenarios.available?scenarios[mode]:null;
 const perSelected=scenarios.available?scenarios.perItem[mode]:quote.perItem;
 const rendered=selected?{...quote,gold:selected.gold,materials:selected.materials,perItem:perSelected,attempts:selected.attempts}:quote;
 const from=stages.find(s=>s.id===range.fromStage),to=stages.find(s=>s.id===range.toStage);
 const stageOptions=selected=>stages.map(s=>opt(s.id,s.id+(s.name&&s.id.startsWith('T')?' · '+s.name:''),selected)).join('');
 const levelOptions=(stage,value)=>Array.from({length:Math.max(0,stage?.max||0)+1},(_,n)=>opt(String(n),'+'+n,String(value))).join('');
 const fields='<div class="quickEndpoints">'+
 '<fieldset><legend>FROM</legend><label><span>Rank</span><select data-path-from-stage aria-label="Starting upgrade rank">'+stageOptions(range.fromStage)+'</select></label><label><span>Level</span><select data-path-from-level aria-label="Starting enhancement level">'+levelOptions(from,range.fromLevel)+'</select></label></fieldset>'+
 '<span class="quickArrow" aria-hidden="true">→</span>'+
 '<fieldset><legend>TO</legend><label><span>Rank</span><select data-path-to-stage aria-label="Target upgrade rank">'+stageOptions(range.toStage)+'</select></label><label><span>Level</span><select data-path-to-level aria-label="Target enhancement level">'+levelOptions(to,range.toLevel)+'</select></label></fieldset></div>';
 const count=quote.itemCount;
 const quantity='<div class="quickQuantity"><div class="quickQuantityLabel"><label for="pathItemQuantity">Items to upgrade</label><small>Same upgrade range for each item</small></div>'+
 '<div class="quickQuantityControls"><button type="button" data-path-quantity-step="-1" aria-label="Remove one item"'+(count===1?' disabled':'')+'>−</button>'+
 '<input type="number" id="pathItemQuantity" data-path-quantity aria-label="Number of items" min="1" max="100" inputmode="numeric" step="1" value="'+count+'">'+
 '<button type="button" data-path-quantity-step="1" aria-label="Add one item"'+(count===100?' disabled':'')+'>+</button></div></div>';
 if(quote.error)return fields+quantity+'<div class="quickError" role="status">'+esc(quote.error)+(quote.missing?.length?' Missing: '+esc(quote.missing.slice(0,3).join(', ')):'')+'</div>';
 const perItemBySlug=new Map(rendered.perItem.materials.map(m=>[m.slug,m.quantity]));
 const materialRow=m=>{
  const id='game:material:'+m.slug;
  return '<div class="quickMaterial"><button type="button" class="quickMaterialWiki" data-route="wiki/reference" data-params="id='+esc(encodeURIComponent(id))+'" title="View '+esc(m.name)+' in ArcanaWiki">'+esc(m.name)+' <span aria-hidden="true">↗</span></button>'+
  '<strong>'+money(m.quantity)+(count>1?'<small class="quickPerItem">'+money(perItemBySlug.get(m.slug)||0n)+' each</small>':'')+'</strong></div>';
 };
 const embers=rendered.materials.filter(m=>m.slug==='abyssal-ember');
 const groups=sourceMaterialGroups(rendered.materials.filter(m=>m.slug!=='abyssal-ember'),snapshot.materials||[],options.catalog||[]);
 const monsters=groups.filter(g=>g.kind==='biome'||g.kind==='unknown');
 const other=groups.filter(g=>g.kind==='special').flatMap(g=>g.materials);
 const displayAttempts=rendered.attempts===undefined?money(quote.steps):new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(rendered.attempts);
 const meta='<div class="quickResultMeta" role="status" aria-live="polite"><strong>'+count+' item'+(count===1?'':'s')+'</strong><span>·</span><span>'+displayAttempts+' '+(mode==='expected'?'expected attempts':mode==='pity'?'modeled maximum attempts':'upgrade steps')+'</span><span>·</span><span>'+rendered.materials.length+' material types</span></div>';
 const byBiome=monsters.map((g,i)=>{
  const label=g.kind==='biome'?g.name:'Other monster drops';
  return '<details class="quickBiomeGroup" '+(i===0?'open':'')+'><summary class="quickBiomeHead">'+(g.kind==='biome'?'<span class="quickBiomeOrder" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span>':'')+
  '<span class="quickBiomeName">'+esc(label)+'</span><small>'+g.materials.length+' materials</small><span aria-hidden="true" class="quickBiomeChevron">⌄</span></summary>'+
  '<div class="quickMaterialList">'+g.materials.map(materialRow).join('')+'</div></details>';
 }).join('');
 const monsterSection='<section class="quickFarmFirst" aria-label="Monster materials"><div class="quickSectionTitle"><h3>Monster materials</h3><small>Biome order</small></div>'+
 (byBiome||'<p class="quickEmpty">No monster drops needed for this range.</p>')+'</section>';
 const gold='<div class="quickGoldBlock"><span>'+(mode==='expected'?'Estimated Gold':mode==='pity'?'Modeled ceiling · Gold':'Minimum Gold')+'</span><strong>'+money(rendered.gold)+'</strong>'+(count>1?'<small>'+money(rendered.perItem.gold)+' per item</small>':'')+'</div>';
 const forge='<section class="quickForgeSection" aria-label="Gold and other materials"><div class="quickSectionTitle"><h3>Gold & forge materials</h3></div>'+
 '<div class="quickResourceHighlights">'+gold+embers.map(materialRow).join('')+'</div>'+
 (other.length?'<div class="quickMaterialList">'+other.map(materialRow).join(''):'')+'</section>';
 const attempts=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);
 const labels={min:'Minimum',expected:'Expected',pity:'Pity ceiling*'};
 const cards=scenarios.available?'<section class="quickScenarioPicker" aria-label="Upgrade cost scenarios"><div class="quickSectionTitle"><h3>Include failed attempts</h3><small>Choose a budget</small></div>'+
 '<div class="quickScenarioGrid">'+['min','expected','pity'].map(key=>{
  const stat=scenarios[key],active=mode===key;
  return '<button type="button" class="quickScenarioCard'+(active?' active':'')+'" data-path-cost-mode="'+key+'" aria-pressed="'+active+'"><span>'+labels[key]+'</span>'+
   '<strong>'+money(stat.gold)+' <small>Gold</small></strong><small>'+attempts(stat.attempts)+' attempts'+(key==='expected'?' · estimate':key==='pity'?' · model':'')+'</small></button>';
 }).join('')+'</div>'+
 '<label class="quickPityInput">Starting pity for first upgrade <span><input type="number" data-path-pity-progress min="0" max="100" step="0.01" inputmode="decimal" value="'+(range.pityProgress??0)+'" aria-label="Starting pity percentage">%</span></label>'+
 '<p class="quickScenarioNote">Expected and ceiling costs include failed attempts with a 30% refund. *Pity ceiling assumes success is guaranteed after the modeled pity counter reaches 100%, and resets per successful upgrade. This is <strong>not yet a verified game maximum.</strong> Starting pity is applied to the first paid step of each selected item. Estimates are rounded up for planning.</p></section>':
 '<p class="quickScenarioNote">Failure/pity scenarios unavailable: '+esc(scenarios.reason||'Verified failure odds missing')+'. Minimum recipe costs remain available.</p>';
 return fields+quantity+cards+meta+monsterSection+forge+
 '<p class="quickSource">'+(mode==='min'?'Minimum: one successful attempt per upgrade, excluding failures.':mode==='expected'?'Estimated spend using the stated pity planning assumptions.':'Pity-model ceiling, not a guaranteed game maximum.')+' All selected items use the same upgrade range.</p>';
}
