import {affixesForItem,affixById,affixStatLabel,maxAffixSlots,parseStatAmount} from './upgrade-optimizer-projections.js';
import {familyArtwork} from './upgrade-family.js';

const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const num=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const compact=n=>{const x=Number(n);if(!Number.isFinite(x))return '—';for(const [size,name] of [[1e15,'Qa'],[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']])if(Math.abs(x)>=size)return num(x/size)+name;return num(x)};
const plus=n=>(n>0?'+':'')+num(n);
const range=(lo,hi)=>lo===hi?num(lo):num(lo)+'–'+num(hi);

export function renderStatProjection(breakdown,item,index){
 if(!breakdown)return '';
 const lines=breakdown.implicits.map((r,j)=>{
  const field=j===0?'primary':'secondary',raw=item.observed?.[field]||'';
  const current=r.observed?num(r.from):range(r.fromMin,r.fromMax);
  const target=r.unmodeled?'Not yet verified':r.observed?'≈ '+num(r.to):range(r.toMin,r.toMax);
  const delta=r.unmodeled?'Needs in-game confirmation':r.observed?'≈ '+plus(r.delta):plus(r.deltaMin)+(r.deltaMin!==r.deltaMax?' to '+plus(r.deltaMax):'');
  const percent=!r.unmodeled&&r.percentGain!==null?' ('+plus(r.percentGain)+'%)':'';
  return '<div class="uoProjectedRow"><div><strong>'+esc(r.label)+'</strong><small>'+esc(r.unmodeled?'Tier-only reference; scaling unknown':r.observed?'Anchored to your current item':'Estimated stat range')+'</small></div>'+
   '<div class="uoProjectedValues"><span>'+esc(current)+' <b>→</b> '+esc(target)+'</span><strong class="'+(r.unmodeled?'uoUnknownBudget':r.delta>=0?'uoPositive':'uoNegative')+'">'+esc(delta+percent)+'</strong></div>'+
   '<label class="uoActualValue">Your current value <input type="text" inputmode="decimal" data-uo-observed="'+field+'" data-uo-index="'+index+'" placeholder="Optional · e.g. 8.5k" value="'+esc(raw)+'" aria-label="Actual '+esc(r.label)+'"></label></div>';
 }).join('');
 const affixLines=breakdown.affixes.map(row=>'<div class="uoAffixProjection"><span>'+esc(row.name)+' · '+esc(row.label)+'</span><strong>'+num(row.from)+' → ≈ '+num(row.to)+'</strong><em class="'+(row.delta>=0?'uoPositive':'uoNegative')+'">'+plus(row.delta)+(row.percentGain!==null?' ('+plus(row.percentGain)+'%)':'')+'</em>'+(row.capped?'<small>Stat cap can limit this estimate</small>':'')+'</div>').join('');
 return '<section class="uoProjection"><div class="uoSectionTitle"><div><span class="uoEyebrow">UPGRADE OUTCOME</span><h3>What changes?</h3></div><span class="uoEstimateTag">Projected, not exact</span></div>'+
 '<div class="uoProjectedGrid">'+lines+'</div>'+
 (affixLines?'<div class="uoAffixOutcomes"><h4>Entered affix gains</h4>'+affixLines+'</div>':'')+
 '<p class="uoProjectionNote">The current rolls can be entered for a closer estimate. Enhancement and Awakening use configured scaling; exact in-game rounding, roll identity and stat caps may differ.</p></section>';
}

export function renderAffixEditor(item,index,breakdown){
 const legal=affixesForItem(item.itemKey),slots=maxAffixSlots(item.current),entries=(item.affixes||[]).slice(0,slots);
 const rows=entries.map((entry,j)=>{
  const def=affixById(entry.id),matches=breakdown?.affixes?.find(a=>a.index===j),invalid=entry.value&&!parseStatAmount(entry.value)&&entry.value!=='0';
  const options=kind=>legal.filter(x=>x.kind===kind).map(x=>'<option value="'+x.id+'"'+(entry.id===x.id?' selected':'')+'>'+esc(x.name)+' · '+esc(affixStatLabel(x.stat))+'</option>').join('');
  return '<div class="uoAffixInput"><span class="uoAffixIndex">'+(j+1)+'</span><label>Affix <select data-uo-affix="id" data-uo-affix-index="'+j+'" data-uo-index="'+index+'" aria-label="Affix '+(j+1)+' type"><option value="0">Choose affix…</option><optgroup label="Prefixes">'+options('prefix')+'</optgroup><optgroup label="Suffixes">'+options('suffix')+'</optgroup></select></label>'+
   '<label>Value shown in-game <input type="text" inputmode="decimal" data-uo-affix="value" data-uo-affix-index="'+j+'" data-uo-index="'+index+'" placeholder="e.g. 15 or 2.5k" value="'+esc(entry.value)+'"></label>'+
   '<button type="button" class="uoAffixRemove" data-uo-action="remove-affix" data-uo-index="'+index+'" data-uo-affix-index="'+j+'" aria-label="Remove affix '+(j+1)+'">×</button>'+
   (matches?'<small class="uoAffixResult">After upgrade: ≈ '+num(matches.to)+' ('+plus(matches.delta)+')</small>':invalid?'<small class="uoAffixError">Enter a valid number (K/M/B supported)</small>':'')+'</div>';
 }).join('');
 return '<section class="uoAffixEditor"><div class="uoSectionTitle"><div><span class="uoEyebrow">YOUR ACTUAL EQUIPMENT</span><h3>Affixes</h3></div><small>'+entries.length+' / '+slots+' slots</small></div>'+
 '<p>Select the affixes already on this item and enter the value currently shown in-game. We’ll calculate their projected increase along this path.</p>'+
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
  const cost=r.units?compact(r.units):'0';
  const badge=r.budgetComplete?(r.affordable?'<b class="uoCanAfford">Affordable</b>':'<b class="uoShortfall">Missing materials</b>'):'<b class="uoUnknownBudget">Inventory unknown</b>';
  const missing=r.missing.filter(m=>m.short>0n);
  const shortText=missing.length?'Short: '+missing.slice(0,2).map(m=>m.name+' ×'+compact(m.short)).join(', ')+(missing.length>2?' +'+(missing.length-2)+' more':''):r.missingGold>0n?'Need '+compact(r.missingGold)+' gold':'';
  const pathMaterials=r.cost.materials.map(m=>'<div class="uoCandidateMat"><span>'+esc(m.name)+'<small>'+esc(biomeBySlug.get(m.slug)||'Special materials')+'</small></span><strong>'+compact(m.quantity)+'</strong></div>').join('');
  return '<div class="uoCandidate"><div class="uoCompareRow"><span class="uoRank">'+(contributes?i+1:'—')+'</span><span class="uoCompareArt">'+familyArtwork(r.item.itemKey,r.item.current,48)+'</span><div class="uoCompareName"><strong>'+esc(r.name)+'</strong><small>'+esc(r.route)+'</small>'+badge+'</div>'+
   '<div class="uoCompareNumbers"><strong class="'+(r.gain>0?'uoPositive':'uoUnknownBudget')+'">'+(contributes?'≈ +'+num(r.gain):'No gain')+'</strong><small>'+cost+' mats · '+compact(r.cost.gold)+' gold</small><small>'+esc(contributes?display+' gain / 1k mats':'Outside selected stat')+'</small>'+(shortText?'<small class="uoMissingDetail">'+esc(shortText)+'</small>':'')+'</div></div>'+
   '<details class="uoCandidateCosts"><summary>Materials for this path</summary><div class="uoCandidateMatGrid">'+(pathMaterials||'<p>No materials required.</p>')+'</div><p>Gold: <strong>'+compact(r.cost.gold)+'</strong></p></details></div>';
 }).join('');
 const isSet=state.strategy==='set';
 const knownCount=relevant.filter(r=>r.budgetComplete).length;
 const recommended=bestSet?'<div class="uoRecommendation"><span class="uoEyebrow">'+(allBudgetKnown?'BEST':'BEST CONFIRMED')+' '+(isSet?'COMBINATION':'SINGLE UPGRADE')+' WITH YOUR STOCK</span><h3>'+bestSet.names.map(esc).join(' + ')+'</h3><p>≈ +'+num(bestSet.gain)+' '+esc(chosen?.label||objective)+' using '+compact(bestSet.units)+' materials and '+compact(bestSet.gold)+' gold. '+(isSet?'Evaluated affordable subsets of the '+knownCount+' fully specified, independent upgrades.':'Compared the fully specified upgrades one at a time.')+(allBudgetKnown?'':' Other paths have unknown stock, so the overall winner may change.')+'</p></div>':allBudgetKnown?'<p class="uoRecommendation uoNoBudget">No listed upgrade fits your entered material and gold stock yet.</p>':'';
 return '<section class="uoDecisions"><div class="uoSectionTitle"><div><span class="uoEyebrow">DECISION STUDIO</span><h2>Where should the materials go?</h2></div><span class="uoEstimateTag">Scenario comparison</span></div>'+
 '<p class="uoDecisionIntro">Choose the stat you care about. The list compares that stat’s estimated gain to the materials each upgrade consumes. Other stats are deliberately not treated as equivalent.</p>'+
 '<div class="uoDecisionControls"><label class="uoFocus">Optimize for <select data-uo-focus>'+focusStats.map(s=>'<option value="'+esc(s.stat)+'"'+(objective===s.stat?' selected':'')+'>'+esc(s.label)+'</option>').join('')+'</select></label>'+
 '<label class="uoFocus">Decision type <select data-uo-strategy><option value="single"'+(!isSet?' selected':'')+'>Which ONE upgrade?</option><option value="set"'+(isSet?' selected':'')+'>Best group of upgrades</option></select></label></div>'+
 '<div class="uoCompareList">'+list+'</div>'+
 '<p class="uoDecisionCaveat">Efficiency is estimated stat gain per 1,000 raw material units. Different materials can have very different farming costs, so this is a comparison aid, not a universal ranking. Enter your stock to find what you can afford. In group mode, paths cloned with “Compare another upgrade path” are treated as alternatives; separately added equipment is treated as independent items.</p>'+
 '<details class="uoStock" data-uo-panel="budget"><summary><span>My materials & gold <small>'+filled+' / '+allMats.length+' material quantities entered</small></span><strong>Set inventory ⌄</strong></summary><div class="uoStockBody"><label class="uoGoldStock">Gold available<input type="text" inputmode="decimal" placeholder="e.g. 5B" data-uo-gold-stock value="'+esc(state.goldStock||'')+'"></label><div class="uoStockActions"><button type="button" data-uo-action="zero-stock">Set blank materials to zero</button><button type="button" data-uo-action="reset-stock">Clear stock entries</button></div><div class="uoStockGrid">'+stockInputs+'</div><p>Leave an unknown quantity blank. Zero means you have none. Entries stay saved on this device.</p></div></details>'+
 recommended+'</section>';
}
