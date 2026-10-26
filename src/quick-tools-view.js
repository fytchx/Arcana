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
 // Average is the uncluttered first-use view. Optional min/pity selections
 // apply to the *actual* material list, gold and saved farming checklists.
 const selectedMode=scenarios.available&&['min','expected','pity'].includes(range.costMode)?range.costMode:'expected';
 const selected=scenarios.available?scenarios[selectedMode]:quote;
 const modeLabels={min:'Minimum',expected:'Average',pity:'Pity maximum'};
 const modeNotes={min:'No failed attempts',expected:'Estimated failures and pity',pity:'Modeled pity limit'};
 const rendered=scenarios.available?{...quote,gold:selected.gold,
  materials:selected.materials,perItem:scenarios.perItem[selectedMode],
  attempts:selected.attempts}:quote;
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
 const monsterUnits=monsterGroups.reduce((n,g)=>n+g.materials.reduce((total,m)=>total+BigInt(m.quantity),0n),0n);
 const other=groups.filter(g=>g.kind==='special').flatMap(g=>g.materials).sort(alphabetical);
 const attempts=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);
 const displayAttempts=rendered.attempts===undefined?money(quote.steps):attempts(rendered.attempts);
 const meta='<div class="quickAverageIntro" role="status" aria-live="polite" data-path-active-budget="'+selectedMode+'"><div>'+
  '<strong>'+esc(scenarios.available?modeLabels[selectedMode]+' material costs':'Base material costs')+'</strong>'+
  '<small>'+esc(scenarios.available?modeNotes[selectedMode]:'Listed recipe costs only')+(count>1?' · '+count+' items':'')+'</small></div>'+
  '<span>'+money(monsterUnits)+' monster drops · '+displayAttempts+' attempts</span></div>';
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
 // Forge materials follow monster drops; gold is a quiet footer, never the headline.
 const goldValue=shortGold(rendered.gold);
 const goldTip=esc(money(rendered.gold)+' Gold');
 const forge='<details class="quickMaterialSection quickForgeSection" data-material-section="special" open>'+
  '<summary class="quickSectionSummary"><strong>Rare materials &amp; gold</strong>'+
  '<small class="quickGoldSummary">'+other.length+' rare / forge material'+(other.length===1?'':'s')+'</small><span aria-hidden="true">⌄</span></summary>'+
  '<div class="quickSectionBody">'+(other.length?'<div class="quickMaterialList quickMaterialListSorted">'+other.map(materialRow).join('')+'</div>':'<p class="quickEmpty">No rare materials needed.</p>')+
  '<div class="quickGoldFooter" title="'+goldTip+'"><span>Gold <small>Currency reference</small></span><strong>'+goldValue+'</strong></div></div></details>';
 const firstStep=scenarios.available?(scenarios.perStep.find(step=>step.failChance>0)||scenarios.perStep[0]):null;
 const pityCap=firstStep?.pityCap||1;
 const pityDone=Math.max(0,Math.min(pityCap-1,Math.trunc(Number(range.pityCount)||0)));
 const pct=value=>(value*100).toLocaleString('en-US',{maximumFractionDigits:2})+'%';
 const odds=scenarios.available&&scenarios.perStep.length?'<details class="quickOddsByStep" data-path-accordion="odds"><summary><strong>Success chances by upgrade</strong><small>'+scenarios.perStep.length+' steps · view odds and pity</small><span aria-hidden="true">⌄</span></summary>'+
 '<div class="quickOddsGrid">'+scenarios.perStep.map(step=>
  '<div class="quickOddsRow"><strong>'+esc(step.stage)+(step.level?' +'+step.level:' transition')+'</strong>'+
  '<span>'+pct(1-step.failChance)+' success · '+pct(step.failChance)+' failure</span>'+
  '<small>'+(step.failChance===0?'Guaranteed first try':'Average '+attempts(step.expectedAttempts)+' attempts · Pity '+step.pityCap+' attempts'+(step.pityCount?' · '+step.pityCount+' counted':''))+'</small></div>'
 ).join('')+'</div></details>':'';
 const budgets=scenarios.available?'<details class="quickAdvanced quickOddsPlanner" data-path-accordion="breakdown">'+
  '<summary class="quickSummaryLine"><strong>Odds &amp; cost scenarios</strong><small>Minimum · Average · Pity maximum</small><b aria-hidden="true">⌄</b></summary>'+
  '<div class="quickAdvancedBody"><p class="quickScenarioIntro">Choose a scenario to update the material totals and farming checklist. Gold stays at the bottom.</p>'+
  '<div class="quickBudgetChoices" role="group" aria-label="Upgrade cost scenario">'+[
   ['Minimum','min','No failures'],
   ['Average','expected','Expected cost'],
   ['Pity maximum','pity','Worst-case model']
  ].map(([label,key,description])=>{
   const stat=scenarios[key],active=selectedMode===key;
   const monsterTotal=sourceMaterialGroups(stat.materials,snapshot.materials||[],options.catalog||[])
    .filter(g=>g.kind==='biome'||g.kind==='unknown')
    .reduce((sum,g)=>sum+g.materials.reduce((amount,m)=>amount+BigInt(m.quantity),0n),0n);
   return '<button type="button" class="quickBudgetChoice'+(active?' isSelected':'')+'" data-path-cost-mode="'+key+'" aria-pressed="'+active+'" aria-label="Show '+label+' upgrade costs">'+
    '<span class="quickBudgetChoiceHeader"><strong>'+label+'</strong><span class="quickBudgetChoiceCheck" aria-hidden="true">'+(active?'✓':'○')+'</span></span>'+
    '<small>'+description+'</small><span class="quickBudgetAttempts">'+attempts(stat.attempts)+' attempts</span>'+
    '<b title="'+esc(money(monsterTotal)+' monster materials')+'">'+money(monsterTotal)+' <span class="quickBudgetUnit">monster mats</span></b></button>';
  }).join('')+'</div>'+
  '<label class="quickPityInput">Failures already counted on first pending upgrade <span><input type="number" data-path-pity-count min="0" max="'+Math.max(0,pityCap-1)+'" step="1" inputmode="numeric" value="'+pityDone+'" aria-label="Pity attempts already counted"> / '+pityCap+'</span></label>'+
  odds+
  '<details class="quickAssumptions"><summary>How these estimates work</summary><p>Minimum assumes every upgrade succeeds immediately. Average uses the listed success odds, modeled pity and the 30% refund after failure. Pity maximum assumes each step reaches its modeled pity limit. Pity carry-over between upgrades is not verified. A completed failed attempt reduces the remaining pity count for the first pending step only.</p></details>'+
  '</div></details>':
  '<details class="quickAdvanced quickOddsPlanner" data-path-accordion="breakdown"><summary class="quickSummaryLine"><strong>Odds &amp; cost scenarios</strong><small>Unavailable</small><b aria-hidden="true">⌄</b></summary>'+
  '<div class="quickAdvancedBody"><p>Failure and pity scenarios unavailable: '+esc(scenarios.reason||'Verified failure odds missing')+'. Base recipe costs are shown instead.</p></div></details>';
 return plan+meta+budgets+monsterSection+forge;

}
