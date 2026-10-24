/* Fast upgrade reference. Reuses Pathfinder's source-backed range engine.
 * No slot-specific prices or failure probabilities are invented. */
import {allStages,quoteRange,normalizeRange} from './pathfinder-range.js';
import {quoteFailureScenarios} from './pathfinder-failures.js';
import {money} from './pathfinder-timeline.js';
import {sourceMaterialGroups} from './pathfinder-material-groups.js';
import {pathfinderZone,pathfinderZoneIcon} from './pathfinder-zones.js';
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
/** Human-readable gold without rounding large totals through Number. */
export function shortGold(value){
 let n=BigInt(value??0),neg=n<0n?'':'';
 if(n<0n){neg='-';n=-n}
 const units=[[1000000000000000000n,'Qi'],[1000000000000000n,'Qa'],[1000000000000n,'T'],[1000000000n,'B'],[1000000n,'M'],[1000n,'K']];
 for(const [scale,label] of units){
  if(n<scale)continue;
  // At most two decimals. Truncate rather than claim additional precision.
  const h=n*100n/scale;
  const whole=h/100n,part=h%100n;
  const decimal=part?'.'+part.toString().padStart(2,'0').replace(/0+$/,''):'';
  return neg+whole+decimal+label;
 }
 return neg+n.toString();
}
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
 '<div class="quickCostsHead"><div><span class="quickEyebrow">UPGRADE COST CALCULATOR</span><h2>Upgrade Costs</h2><p>Monster materials for any upgrade range.</p></div><span class="quickHint">A1 → A2</span></div>';
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
 // One answer by default: expected materials with failed attempts and pity.
 // Saved legacy minimum/pity tabs are intentionally ignored by this primary view.
 const rendered=scenarios.available?{...quote,gold:scenarios.expected.gold,
  materials:scenarios.expected.materials,perItem:scenarios.perItem.expected,
  attempts:scenarios.expected.attempts}:quote;
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
 const routeLabel=esc(range.fromStage)+' +'+range.fromLevel+' → '+esc(range.toStage)+' +'+range.toLevel;
 const plan='<details class="quickPlanAccordion" data-path-accordion="route" open><summary class="quickSummaryLine"><strong>Upgrade route</strong><span>'+routeLabel+'</span><small>'+count+' item'+(count===1?'':'s')+'</small><b aria-hidden="true">⌄</b></summary>'+
 '<div class="quickPlanControls">'+planHead+fields+quantity+'</div></details>';
 if(quote.error)return plan+'<div class="quickError" role="status">'+esc(quote.error)+(quote.missing?.length?' Missing: '+esc(quote.missing.slice(0,3).join(', ')):'')+'</div>';
 const perItemBySlug=new Map(rendered.perItem.materials.map(m=>[m.slug,m.quantity]));
 const materialRow=(m,insideZone=false)=>{
  const id='game:material:'+m.slug;
  // Biome identity belongs in the colored zone header, not repeated in every row.
  const location=m.sourceMonster||(!insideZone?m.biome:'');
  return '<div class="quickMaterial"><button type="button" class="quickMaterialWiki" data-route="wiki/reference" data-params="id='+esc(encodeURIComponent(id))+'" title="View '+esc(m.name)+' in ArcanaWiki"><span>'+esc(m.name)+' <span aria-hidden="true">↗</span></span>'+(location?'<small class="quickMaterialSource">'+esc(location)+'</small>':'')+'</button>'+
  '<strong>'+money(m.quantity)+(count>1?'<small class="quickPerItem">'+money(perItemBySlug.get(m.slug)||0n)+' each</small>':'')+'</strong></div>';
 };
 // Group monsters by *verified biome* in the game progression order.
 // Never guess a biome from an item's appearance or name.
 const groups=sourceMaterialGroups(rendered.materials,snapshot.materials||[],options.catalog||[]);
 const alphabetical=(a,b)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'})||a.slug.localeCompare(b.slug);
 const monsterGroups=groups.filter(g=>g.kind==='biome'||g.kind==='unknown');
 const monsterCount=monsterGroups.reduce((n,g)=>n+g.materials.length,0);
 const other=groups.filter(g=>g.kind==='special').flatMap(g=>g.materials).sort(alphabetical);
 const attempts=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);
 const displayAttempts=rendered.attempts===undefined?money(quote.steps):attempts(rendered.attempts);
 const meta='<div class="quickAverageIntro" role="status" aria-live="polite"><div><strong>Estimated upgrade costs</strong>'+
  '<small>Average with failed attempts'+(count>1?' · '+count+' items':'')+'</small></div>'+
  '<span>'+displayAttempts+' attempts</span></div>';
 const summary=(title,sub)=>'<summary class="quickSectionSummary"><strong>'+esc(title)+'</strong><small>'+esc(sub)+'</small><span aria-hidden="true">⌄</span></summary>';
 const zoneGroupsMarkup=monsterGroups.map(group=>{
  const zone=pathfinderZone(group.name);
  const zoneKey=zone?.slug||group.id;
  const style=zone?' style="--path-zone-color:'+zone.color+';--path-zone-x:'+zone.atlasX+'%;--path-zone-y:'+zone.atlasY+'%"':'';
  const tier=zone?'Tier '+zone.tier+' · ':'';
  const items=[...group.materials];
  return '<details class="quickZoneGroup'+(zone?'':' quickZoneUnknown')+'" data-path-zone="'+esc(zoneKey)+'"'+style+' open>'+
   '<summary class="quickZoneHead"><span class="quickZoneArt">'+(zone?'<span class="quickZoneBackdrop" aria-hidden="true"></span>':'')+
   '<span class="quickZoneGlyph">'+pathfinderZoneIcon(group.name)+'</span></span>'+
   '<span class="quickZoneTitle"><strong>'+esc(group.name)+'</strong><small>'+tier+items.length+' material'+(items.length===1?'':'s')+'</small></span>'+
   '<span class="quickZoneChevron" aria-hidden="true">⌄</span></summary>'+
   '<div class="quickZoneContents"><div class="quickMaterialList quickMaterialListSorted">'+items.map(item=>materialRow(item,true)).join('')+'</div></div></details>';
 }).join('');
 const monsterSection='<details class="quickMaterialSection quickFarmFirst" data-material-section="monsters" open>'+
  summary('Monster materials',monsterCount+' types · '+monsterGroups.length+' zones')+
  '<div class="quickSectionBody quickZoneList">'+(monsterCount?zoneGroupsMarkup:'<p class="quickEmpty">No monster drops required.</p>')+'</div></details>';
 // Exactly one headline gold figure. Rare materials appear beneath it only if expanded.
 const goldValue=shortGold(rendered.gold);
 const goldTip=esc(money(rendered.gold)+' Gold');
 const forge='<details class="quickMaterialSection quickForgeSection" data-material-section="special">'+
  '<summary class="quickSectionSummary"><strong>Gold &amp; rare materials</strong>'+
  '<small class="quickGoldSummary" title="'+goldTip+'">'+other.length+' special materials · gold optional</small><span aria-hidden="true">⌄</span></summary>'+
  '<div class="quickSectionBody"><div class="quickMaterial" aria-label="Optional gold cost"><span>Gold <small>Optional currency reference</small></span><strong>'+goldValue+' Gold</strong></div>'+(other.length?'<div class="quickMaterialList quickMaterialListSorted">'+other.map(materialRow).join('')+'</div>':'<p class="quickEmpty">No rare materials needed.</p>')+'</div></details>';
 const firstStep=scenarios.available?(scenarios.perStep.find(step=>step.failChance>0)||scenarios.perStep[0]):null;
 const pityCap=firstStep?.pityCap||1;
 const pityDone=Math.max(0,Math.min(pityCap-1,Math.trunc(Number(range.pityCount)||0)));
 const budgets=scenarios.available?'<details class="quickAdvanced" data-path-accordion="breakdown">'+
  '<summary class="quickSummaryLine"><strong>Detailed cost breakdown</strong><small>Minimum · Average · Pity maximum</small><b aria-hidden="true">⌄</b></summary>'+
  '<div class="quickAdvancedBody"><div class="quickBudgetRows">'+[
   ['Minimum','min','No failed upgrades'],
   ['Average','expected','Includes estimated failures'],
   ['Pity maximum','pity','Success on the final pity attempt']
  ].map(([label,key,description])=>{
   const stat=scenarios[key];
   return '<div class="quickBudgetRow"><div><strong>'+label+'</strong><small>'+description+'</small></div>'+
    '<span>'+attempts(stat.attempts)+' attempts</span><strong title="'+esc(money(stat.gold)+' Gold')+'">'+shortGold(stat.gold)+' Gold</strong></div>';
  }).join('')+'</div>'+
  '<label class="quickPityInput">Already failed first pending upgrade <span><input type="number" data-path-pity-count min="0" max="'+Math.max(0,pityCap-1)+'" step="1" inputmode="numeric" value="'+pityDone+'" aria-label="Pity attempts already counted"> / '+pityCap+'</span></label>'+
  '<details class="quickAssumptions"><summary>How the estimates work</summary><p>Average costs account for upgrade success chances, pity and the 30% failure refund. Pity guarantees success on attempt N of N. Starting pity applies only to the first pending failable upgrade of each item. Costs are estimates, and exact per-item spending varies.</p></details>'+
  '</div></details>':
  '<details class="quickAdvanced" data-path-accordion="breakdown"><summary class="quickSummaryLine"><strong>Detailed cost breakdown</strong><small>Unavailable</small><b aria-hidden="true">⌄</b></summary>'+
  '<div class="quickAdvancedBody"><p>Failure/pity scenarios unavailable: '+esc(scenarios.reason||'Verified failure odds missing')+'. Base costs are shown instead.</p></div></details>';
 const pct=value=>(value*100).toLocaleString('en-US',{maximumFractionDigits:2})+'%';
 const odds=scenarios.available&&scenarios.perStep.length?'<details class="quickOddsByStep" data-path-accordion="odds"><summary><strong>Chance &amp; pity for every upgrade</strong><small>'+scenarios.perStep.length+' steps · optional</small><span aria-hidden="true">⌄</span></summary>'+
 '<div class="quickOddsGrid">'+scenarios.perStep.map(step=>
  '<div class="quickOddsRow"><strong>'+esc(step.stage)+(step.level?' +'+step.level:' transition')+'</strong>'+
  '<span>'+pct(1-step.failChance)+' success · '+pct(step.failChance)+' failure</span>'+
  '<small>'+(step.failChance===0?'Guaranteed first try':'Pity '+step.pityCap+' attempts'+(step.pityCount?' · '+step.pityCount+' counted':''))+'</small></div>'
 ).join('')+'</div></details>':'';
 return plan+meta+monsterSection+forge+budgets+odds;

}
