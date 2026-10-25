import {affixesForItem,affixById,affixStatLabel,maxAffixSlots,parseStatAmount} from './upgrade-optimizer-projections.js';
import {familyArtwork} from './upgrade-family.js';

const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const num=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const compact=n=>{const x=Number(n);if(!Number.isFinite(x))return '—';for(const [size,name] of [[1e15,'Qa'],[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']])if(Math.abs(x)>=size)return num(x/size)+name;return num(x)};
const plus=n=>(n>0?'+':'')+num(n);
const range=(lo,hi)=>lo===hi?num(lo):num(lo)+'–'+num(hi);
const rankLabel=point=>point?.awaken?'A'+point.awaken+' +'+(point.level||0):point?.rarity===6?'Infernal +'+(point.level||0):'T'+(point?.rarity||1)+' +'+(point?.level||0);

export function renderStatProjection(breakdown,item,index){
 if(!breakdown)return '';
 const lines=breakdown.implicits.map((r,j)=>{
  const field=j===0?'primary':'secondary',raw=item.observed?.[field]||'';
  const current=r.observed?num(r.from):range(r.fromMin,r.fromMax);
  const target=r.unmodeled?'Not yet verified':r.observed?'≈ '+num(r.to):range(r.toMin,r.toMax);
  const delta=r.unmodeled?'Needs in-game confirmation':r.observed?'≈ '+plus(r.delta):plus(r.deltaMin)+(r.deltaMin!==r.deltaMax?' to '+plus(r.deltaMax):'');
  const percent=!r.unmodeled&&r.percentGain!==null?' ('+plus(r.percentGain)+'%)':'';
  return '<div class="uoProjectedRow"><div><strong>'+esc(r.label)+'</strong><small>'+esc(r.unmodeled?'Tier-only reference; scaling unknown':r.observed?'Anchored to your current item':r.confidence==='verified-fixed'?'Fixed bonus':'Estimated stat range')+'</small></div>'+
   '<div class="uoProjectedValues"><span>'+esc(current)+' <b>→</b> '+esc(target)+'</span><strong class="'+(r.unmodeled?'uoUnknownBudget':r.delta>=0?'uoPositive':'uoNegative')+'">'+esc(delta+percent)+'</strong></div>'+
   '<label class="uoActualValue">Your current value <input type="text" inputmode="decimal" data-uo-observed="'+field+'" data-uo-index="'+index+'" placeholder="Optional · e.g. 8.5k" value="'+esc(raw)+'" aria-label="Actual '+esc(r.label)+'"></label></div>';
 }).join('');
 const affixLines=breakdown.affixes.map(row=>{
  const percentRange=row.percentGainMin===row.percentGainMax?plus(row.percentGainMin)+'%':plus(row.percentGainMin)+'% to '+plus(row.percentGainMax)+'%';
  const outcome=row.invalid?'Check affix Awakening ranks':row.needsValue?'Max roll assumed · relative growth '+percentRange:
   row.uncertain?num(row.from)+' → ≈ '+range(row.toMin,row.toMax):num(row.from)+' → ≈ '+num(row.to);
  const gain=row.invalid?'Rank plan exceeds equipment Awakening':row.needsValue?'Enter the displayed value for a numeric gain':
   row.uncertain?'Future affix selection not assigned':plus(row.delta)+(row.percentGain!==null?' ('+plus(row.percentGain)+'%)':'');
  return '<div class="uoAffixProjection"><span>'+esc(row.name)+' · '+esc(row.label)+' · rank '+row.rank+'</span><strong>'+esc(outcome)+'</strong><em class="'+(row.delta!==null&&row.delta>=0?'uoPositive':'uoUnknownBudget')+'">'+esc(gain)+'</em>'+(row.capped?'<small>Stat cap can limit this estimate</small>':'')+'</div>';
 }).join('');
 return '<section class="uoProjection"><div class="uoSectionTitle"><div><span class="uoEyebrow">UPGRADE OUTCOME</span><h3>What changes?</h3></div><span class="uoEstimateTag">Projected, not exact</span></div>'+
 '<div class="uoProjectedGrid">'+lines+'</div>'+
 (affixLines?'<div class="uoAffixOutcomes"><h4>Affix growth</h4>'+affixLines+'</div>':'')+
 '<p class="uoProjectionNote">Max roll quality is assumed. A displayed affix value anchors a numerical estimate; without it we show only relative growth. Individual Awakening boosts must be assigned to compare that affix. Exact in-game scaling, rounding and caps still need validation.</p></section>';
}

export function renderAffixEditor(item,index,breakdown){
 const legal=affixesForItem(item.itemKey),slots=maxAffixSlots(item.current),entries=(item.affixes||[]).slice(0,slots);
 const available=Math.max(0,(item.target.awaken||0)-(item.current.awaken||0));
 const rows=entries.map((entry,j)=>{
  const def=affixById(entry.id),matches=breakdown?.affixes?.find(a=>a.index===j),invalid=entry.value&&!parseStatAmount(entry.value)&&entry.value!=='0';
  const options=kind=>legal.filter(x=>x.kind===kind).map(x=>'<option value="'+x.id+'"'+(entry.id===x.id?' selected':'')+'>'+esc(x.name)+' · '+esc(affixStatLabel(x.stat))+'</option>').join('');
  const ranks=Array.from({length:(item.current.awaken||0)+1},(_,n)=>'<option value="'+n+'"'+(entry.rank===n?' selected':'')+'>'+(!n?'None':n+' · '+(n<=10?['','I','II','III','IV','V','VI','VII','VIII','IX','X'][n]:'rank '+n))+'</option>').join('');
  const boosts=Array.from({length:available+1},(_,n)=>'<option value="'+n+'"'+(entry.plannedBoosts===n?' selected':'')+'>'+n+'</option>').join('');
  const result=matches?matches.invalid?'Check rank plan':matches.needsValue?'Relative growth: '+(matches.percentGainMin===matches.percentGainMax?plus(matches.percentGainMin)+'%':plus(matches.percentGainMin)+'% to '+plus(matches.percentGainMax)+'%'):
   matches.uncertain?'Possible target: ≈ '+range(matches.toMin,matches.toMax):'After upgrade: ≈ '+num(matches.to)+' ('+plus(matches.delta)+')':'';
  return '<div class="uoAffixInput"><span class="uoAffixIndex">'+(j+1)+'</span><label>Affix <select data-uo-affix="id" data-uo-affix-index="'+j+'" data-uo-index="'+index+'" aria-label="Affix '+(j+1)+' type"><option value="0">Choose affix…</option><optgroup label="Prefixes">'+options('prefix')+'</optgroup><optgroup label="Suffixes">'+options('suffix')+'</optgroup></select></label>'+
   '<label>Actual value at '+esc(rankLabel(entry.reference||item.current))+' <input type="text" inputmode="decimal" data-uo-affix="value" data-uo-affix-index="'+j+'" data-uo-index="'+index+'" aria-label="Affix '+(j+1)+' observed value" placeholder="Optional · e.g. 571" value="'+esc(entry.value)+'"></label>'+
   '<div class="uoAffixRankControls"><label>Current affix rank <select data-uo-affix="rank" data-uo-affix-index="'+j+'" data-uo-index="'+index+'" aria-label="Affix '+(j+1)+' current Awakening rank">'+ranks+'</select></label><label>Planned boosts <select data-uo-affix="plannedBoosts" data-uo-affix-index="'+j+'" data-uo-index="'+index+'" aria-label="Affix '+(j+1)+' planned Awakening boosts">'+boosts+'</select></label></div>'+
   '<button type="button" class="uoAffixRemove" data-uo-action="remove-affix" data-uo-index="'+index+'" data-uo-affix-index="'+j+'" aria-label="Remove affix '+(j+1)+'">×</button>'+
   (invalid?'<small class="uoAffixError">Enter a valid number (K/M/B supported)</small>':result?'<small class="uoAffixResult">'+esc(result)+'</small>':'')+'</div>';
 }).join('');
 return '<section class="uoAffixEditor"><div class="uoSectionTitle"><div><span class="uoEyebrow">YOUR ACTUAL EQUIPMENT</span><h3>Affixes</h3></div><small>'+entries.length+' / '+slots+' slots</small></div>'+
 '<p>Max roll quality is assumed. Choose each affix’s current Roman-numeral rank. Equipment enhancement grows its value; planned Awakening boosts go only to the affixes you assign. Enter the in-game value for a more useful numerical estimate.</p>'+
 (available?'<small class="uoAffixAllocation">'+(breakdown?.plannedBoosts||0)+' / '+available+' future affix boosts assigned'+(breakdown?.invalidBoostPlan?' · exceeds target Awakening':'')+'</small>':'')+
 '<div class="uoAffixRows">'+rows+'</div>'+
 (slots>entries.length?'<button class="uoAffixAdd" data-uo-action="add-affix" data-uo-index="'+index+'" type="button">+ Add affix</button>':'')+
 (slots===0?'<small>Normal rarity has no regular affix slots.</small>':'')+
 '<small class="uoSourceLine">26 ordinary affixes and slot restrictions from verified config. Drop Bonuses are a separate item system.</small></section>';
}

export function renderDecisionBoard(result,state,groups){
 const {objective,focusStats,ranked,relevant,allBudgetKnown,bestSet}=result;
 if(!ranked.length)return '';
 const chosen=focusStats.find(s=>s.stat===objective);
 const stock=state.stock||{},allMats=[...new Map(ranked.flatMap(x=>x.cost.materials).map(m=>[m.slug,m])).values()];
 const filled=allMats.filter(m=>parseStatAmount(stock[m.slug])!==null).length;
 const byBiome=groups.flatMap(g=>g.materials.map(m=>({group:g.name,...m}))).filter(m=>allMats.some(x=>x.slug===m.slug));
 const biomeBySlug=new Map(groups.flatMap(g=>g.materials.map(m=>[m.slug,g.name])));
 const ordered=byBiome.length?byBiome:allMats;
 const stockInputs=ordered.map(m=>'<label class="uoStockRow"><span>'+esc(m.name)+(m.group?'<small>'+esc(m.group)+'</small>':'')+'</span><input type="text" inputmode="decimal" placeholder="Owned · e.g. 2.5k" data-uo-stock="'+esc(m.slug)+'" value="'+esc(stock[m.slug]??'')+'" aria-label="Owned '+esc(m.name)+'"></label>').join('');
 const list=ranked.map((r,i)=>{
  const contributes=r.gain>0,display=r.units?num(r.density*1000):'—';
  const noGain=r.hasObjective?(r.modeled?'No projected gain':'Needs affix value or rank plan'):'Outside selected stat';
  const cost=r.units?compact(r.units):'0';
  const badge=r.budgetComplete?(r.affordable?'<b class="uoCanAfford">Affordable</b>':'<b class="uoShortfall">Missing materials</b>'):'<b class="uoUnknownBudget">Inventory unknown</b>';
  const missing=r.missing.filter(m=>m.short>0n);
  const shortText=missing.length?'Short: '+missing.slice(0,2).map(m=>m.name+' ×'+compact(m.short)).join(', ')+(missing.length>2?' +'+(missing.length-2)+' more':''):r.missingGold>0n?'Need '+compact(r.missingGold)+' gold':'';
  const pathMaterials=r.cost.materials.map(m=>'<div class="uoCandidateMat"><span>'+esc(m.name)+'<small>'+esc(biomeBySlug.get(m.slug)||'Special materials')+'</small></span><strong>'+compact(m.quantity)+'</strong></div>').join('');
  return '<div class="uoCandidate"><div class="uoCompareRow"><span class="uoRank">'+(contributes?i+1:'—')+'</span><span class="uoCompareArt">'+familyArtwork(r.item.itemKey,r.item.current,48)+'</span><div class="uoCompareName"><strong>'+esc(r.name)+'</strong><small>'+esc(r.route)+'</small>'+badge+'</div>'+
   '<div class="uoCompareNumbers"><strong class="'+(r.gain>0?'uoPositive':'uoUnknownBudget')+'">'+(contributes?'≈ +'+num(r.gain):esc(noGain))+'</strong><small>'+cost+' mats · '+compact(r.cost.gold)+' gold</small><small>'+esc(contributes?display+' gain / 1k mats':noGain)+'</small>'+(shortText?'<small class="uoMissingDetail">'+esc(shortText)+'</small>':'')+'</div></div>'+
   '<details class="uoCandidateCosts" data-uo-panel="path-'+r.index+'"><summary>Materials for this path</summary><div class="uoCandidateMatGrid">'+(pathMaterials||'<p>No materials required.</p>')+'</div><p>Gold: <strong>'+compact(r.cost.gold)+'</strong></p></details></div>';
 }).join('');
 const isSet=state.strategy==='set';
 const knownCount=relevant.filter(r=>r.budgetComplete).length;
 const recommended=bestSet?'<div class="uoRecommendation"><span class="uoEyebrow">'+(allBudgetKnown?'BEST':'BEST CONFIRMED')+' '+(isSet?'COMBINATION':'SINGLE UPGRADE')+' WITH YOUR STOCK</span><h3>'+bestSet.names.map(esc).join(' + ')+'</h3><p>≈ +'+num(bestSet.gain)+' '+esc(chosen?.label||objective)+' using '+compact(bestSet.units)+' materials and '+compact(bestSet.gold)+' gold. '+(isSet?'Evaluated affordable subsets of the '+knownCount+' fully specified, independent upgrades.':'Compared the fully specified upgrades one at a time.')+(allBudgetKnown?'':' Other paths have unknown stock, so the overall winner may change.')+'</p></div>':allBudgetKnown?'<p class="uoRecommendation uoNoBudget">No listed upgrade fits your entered material and gold stock yet.</p>':'';
 return '<section class="uoDecisions"><div class="uoSectionTitle"><div><span class="uoEyebrow">DECISION STUDIO</span><h2>Where should the materials go?</h2></div><span class="uoEstimateTag">Scenario comparison</span></div>'+
 '<p class="uoDecisionIntro">Choose the stat you care about. The list compares that stat’s estimated gain to the materials each upgrade consumes. Other stats are deliberately not treated as equivalent.</p>'+
 '<div class="uoDecisionControls"><label class="uoFocus">Optimize for <select data-uo-focus>'+focusStats.map(s=>'<option value="'+esc(s.stat)+'"'+(objective===s.stat?' selected':'')+'>'+esc(s.label)+'</option>').join('')+'</select></label>'+
 '<label class="uoFocus">Decision type <select data-uo-strategy><option value="single"'+(!isSet?' selected':'')+'>Which ONE upgrade?</option><option value="set"'+(isSet?' selected':'')+'>Best group of upgrades</option></select></label></div>'+
 '<div class="uoCompareList">'+list+'</div>'+
 '<p class="uoDecisionCaveat">Only modeled gains are ranked. Affix comparisons need a current displayed value and an Awakening boost plan; max-roll quality alone does not establish an exact number. Efficiency is estimated stat gain per 1,000 raw material units. Different materials have different farming costs, so this is a comparison aid, not a universal ranking. In group mode, copied paths are alternatives and separately added equipment is independent.</p>'+
 '<details class="uoStock" data-uo-panel="budget"><summary><span>My materials & gold <small>'+filled+' / '+allMats.length+' material quantities entered</small></span><strong>Set inventory ⌄</strong></summary><div class="uoStockBody"><label class="uoGoldStock">Gold available<input type="text" inputmode="decimal" placeholder="e.g. 5B" data-uo-gold-stock value="'+esc(state.goldStock||'')+'"></label><div class="uoStockActions"><button type="button" data-uo-action="zero-stock">Set blank materials to zero</button><button type="button" data-uo-action="reset-stock">Clear stock entries</button></div><div class="uoStockGrid">'+stockInputs+'</div><p>Leave an unknown quantity blank. Zero means you have none. Entries stay saved on this device.</p></div></details>'+
 recommended+'</section>';
}
