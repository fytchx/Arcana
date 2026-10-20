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
 const heading=page?'':
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
 const planHead=options.page?'<div class="quickPlanHeading"><span class="quickEyebrow">GEAR PLANNER</span><h2>Upgrade costs</h2><p>From → To · set quantity · review total costs</p></div>':'';
 const plan='<section class="quickPlanControls">'+planHead+fields+quantity+'</section>';
 if(quote.error)return plan+'<div class="quickError" role="status">'+esc(quote.error)+(quote.missing?.length?' Missing: '+esc(quote.missing.slice(0,3).join(', ')):'')+'</div>';
 const perItemBySlug=new Map(rendered.perItem.materials.map(m=>[m.slug,m.quantity]));
 const materialRow=m=>{
  const id='game:material:'+m.slug;
  const location=m.biome||m.sourceMonster||'';
  return '<div class="quickMaterial"><button type="button" class="quickMaterialWiki" data-route="wiki/reference" data-params="id='+esc(encodeURIComponent(id))+'" title="View '+esc(m.name)+' in ArcanaWiki"><span>'+esc(m.name)+' <span aria-hidden="true">↗</span></span>'+(location?'<small class="quickMaterialSource">'+esc(location)+'</small>':'')+'</button>'+
  '<strong>'+money(m.quantity)+(count>1?'<small class="quickPerItem">'+money(perItemBySlug.get(m.slug)||0n)+' each</small>':'')+'</strong></div>';
 };
 // The default view is one alphabetized monster-material checklist; source
 // biome/monster metadata stays attached to each entry for farming context.
 const groups=sourceMaterialGroups(rendered.materials,snapshot.materials||[],options.catalog||[]);
 const alphabetical=(a,b)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'})||a.slug.localeCompare(b.slug);
 const monsters=groups.filter(g=>g.kind==='biome'||g.kind==='unknown')
  .flatMap(g=>g.materials).sort(alphabetical);
 const other=groups.filter(g=>g.kind==='special').flatMap(g=>g.materials).sort(alphabetical);
 const displayAttempts=rendered.attempts===undefined?money(quote.steps):new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(rendered.attempts);
 const meta='<div class="quickResultMeta" role="status" aria-live="polite"><strong>'+count+' item'+(count===1?'':'s')+'</strong><span>·</span><span>'+displayAttempts+' '+(mode==='expected'?'expected attempts':mode==='pity'?'pity-limited attempts':'upgrade steps')+'</span><span>·</span><span>'+rendered.materials.length+' material types</span></div>';
 const summary=(title,sub)=>'<summary class="quickSectionSummary"><strong>'+esc(title)+'</strong><small>'+esc(sub)+'</small><span aria-hidden="true">⌄</span></summary>';
 const monsterSection='<details class="quickMaterialSection quickFarmFirst" data-material-section="monsters">'+
  summary('Monster materials',monsters.length+' materials · A–Z')+
  '<div class="quickSectionBody">'+(monsters.length?'<div class="quickMaterialList quickMaterialListSorted">'+monsters.map(materialRow).join('')+'</div>':'<p class="quickEmpty">No monster drops required.</p>')+'</div></details>';
 const gold='<div class="quickGoldBlock"><span>'+(mode==='expected'?'Estimated Gold':mode==='pity'?'Pity ceiling · Gold':'Minimum Gold')+'</span><strong>'+money(rendered.gold)+'</strong>'+(count>1?'<small>'+money(rendered.perItem.gold)+' per item</small>':'')+'</div>';
 const forge='<details class="quickMaterialSection quickForgeSection" data-material-section="special">'+
  summary('Gold & rare materials',other.length+' other materials')+
  '<div class="quickSectionBody"><div class="quickResourceHighlights">'+gold+'</div>'+
  (other.length?'<div class="quickMaterialList quickMaterialListSorted">'+other.map(materialRow).join('')+'</div>':'')+'</div></details>';
 const attempts=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);
 const labels={min:'Minimum',expected:'Expected',pity:'Pity maximum'};
 const firstStep=scenarios.available?(scenarios.perStep.find(step=>step.failChance>0)||scenarios.perStep[0]):null;
 const pityCap=firstStep?.pityCap||1;
 const pityDone=Math.max(0,Math.min(pityCap-1,Math.trunc(Number(range.pityCount)||0)));
 const cards=scenarios.available?'<section class="quickScenarioPicker" aria-label="Upgrade cost scenarios"><div class="quickScenarioHeading"><h3>Upgrade attempts</h3><span class="quickPityBadge">Pity '+pityDone+' / '+pityCap+'</span></div>'+
 '<div class="quickScenarioGrid">'+['min','expected','pity'].map(key=>{
  const stat=scenarios[key],active=mode===key;
  return '<button type="button" class="quickScenarioCard'+(active?' active':'')+'" data-path-cost-mode="'+key+'" aria-pressed="'+active+'"><span>'+labels[key]+'</span>'+
   '<strong>'+money(stat.gold)+' <small>Gold</small></strong><small>'+attempts(stat.attempts)+' attempts'+(key==='expected'?' · estimate':key==='pity'?' · last attempt guaranteed':'')+'</small></button>';
 }).join('')+'</div>'+
 '<label class="quickPityInput">Already failed this upgrade <span><input type="number" data-path-pity-count min="0" max="'+Math.max(0,pityCap-1)+'" step="1" inputmode="numeric" value="'+pityDone+'" aria-label="Pity attempts already counted"> / '+pityCap+'</span></label>'+
 '<details class="quickAssumptions"><summary>How failures and pity are calculated</summary><p>Upgrade success is guaranteed on the final numbered attempt, not an extra attempt afterward. Failed attempts spend 70% of listed Gold and materials. Expected costs include the chance of succeeding early. Current pity applies to the first pending upgrade of each item; later upgrade levels start fresh in this planner.</p></details></section>':
 '<p class="quickScenarioNote">Failure/pity scenarios unavailable: '+esc(scenarios.reason||'Verified failure odds missing')+'. Minimum recipe costs remain available.</p>';
 return plan+cards+meta+monsterSection+forge+
 '<p class="quickSource">Recipe material and Gold totals. '+(mode==='min'?'Minimum: one successful attempt per upgrade, excluding failures.':mode==='expected'?'Expected cost with pity and the 30% failed-attempt refund.':'Pity-limited maximum, with success on the final numbered attempt.')+' All selected items use the same upgrade range.</p>';
}
