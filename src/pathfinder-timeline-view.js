import {esc} from './ui.js';
import {PATHFINDER_SLOTS,MODE_LABELS,money,timelineModel,stageStepLabel,normalizeQuickView} from './pathfinder-timeline.js';
import {quoteRange,normalizeRange} from './pathfinder-range.js';
import {sourceMaterialGroups,recipeSlotStatus} from './pathfinder-material-groups.js';

const title=stage=>stage.tier?stage.name:stage.id+' · Awakened';
const compactGold=n=>{
 const scales=[[1000000000000n,'T'],[1000000000n,'B'],[1000000n,'M'],[1000n,'K']];
 for(const [denom,unit] of scales)if(n>=denom){
  const tenth=n*10n/denom;
  return (tenth%10n===0n?String(tenth/10n):String(tenth/10n)+'.'+String(tenth%10n))+unit;
 }
 return money(n);
};

const amountList=list=>'<div class="pathMaterials">'+list.map(x=>
 '<div class="pathMaterial"><span>'+esc(x.name)+'</span><strong>'+money(x.quantity)+'</strong></div>'
 ).join('')+'</div>';
export function pathfinderStepDetail(model){
 const {active,step,view}=model,level=view.level;
 const label=stageStepLabel(active,level);
 if(!step)return '<div class="pathDetail" id="pathDetail" role="status"><span class="pathEyebrow">'+esc(label)+'</span><h3>Verified recipe unavailable</h3><p>No estimated or invented cost is shown for this step.</p></div>';
 const chance=step.failureChance===null?'':step.failureChance>0?'<span class="pathChance">'+(step.failureChance*100).toLocaleString('en-US',{maximumFractionDigits:2})+'% listed failure chance</span>':'<span class="pathChance">No listed failure chance</span>';
 return '<div class="pathDetail" id="pathDetail" aria-live="polite">'+
 '<div class="pathDetailIntro"><div><span class="pathEyebrow">SELECTED UPGRADE</span><h3>'+esc(label)+'</h3></div>'+chance+'</div>'+
 (step.free?'<p class="pathFree">Choose any enhancement to see its exact listed costs.</p>':
 '<div class="pathGold"><span>Gold required</span><strong>'+money(step.gold)+'</strong></div>'+
 '<h4>Materials required <small>'+step.materials.length+' types</small></h4>'+
 (step.materials.length?amountList(step.materials):'<p class="pathFree">No materials listed for this upgrade.</p>'))+
 '</div>';
}
export function pathfinderChapterDetail(model){
 const {chapter,active}=model;
 return '<details class="pathChapter"><summary><span><strong>Full '+esc(active.id)+' costs</strong><small>Transition plus every enhancement in this tier</small></span><span class="pathChapterGold">'+money(chapter.gold)+' Gold</span></summary>'+
 '<div class="pathChapterInside"><p>Listed base costs to complete '+esc(active.id)+'. No extra attempts from failed upgrades are included.</p>'+
 (chapter.complete?'<div class="pathGold"><span>Total Gold</span><strong>'+money(chapter.gold)+'</strong></div>'+amountList(chapter.materials):
 '<p class="pathWarning">Some source recipes are missing. This stage total is incomplete.</p>')+
 '</div></details>';
}
// Only this content refreshes when range endpoints change. The scrolling
// timeline and its position stay mounted, so editing totals feels instant.
const rangeLevelOptions=(stage,level)=>Array.from({length:(stage?.max||0)+1},(_,i)=>
 option(String(i),i===0?'Start / +0':'+'+i,String(level))).join('');
export function pathfinderRangeContent(snapshot,quick,raw={},catalog=[]){
 const quote=quoteRange(snapshot,raw,quick),{range,stages}=quote;
 const from=stages.find(s=>s.id===range.fromStage),to=stages.find(s=>s.id===range.toStage);
 const stageOpts=(selected)=>stages.map(s=>option(s.id,s.tier?s.name+' ('+s.id+')':s.id,selected)).join('');
 const controls='<div class="pathRangeInputs">'+
 '<fieldset><legend>FROM</legend><label>Rarity / rank<select data-path-from-stage aria-label="From upgrade stage">'+stageOpts(range.fromStage)+'</select></label>'+
 '<label>Enhancement<select data-path-from-level aria-label="From enhancement level">'+rangeLevelOptions(from,range.fromLevel)+'</select></label></fieldset>'+
 '<span class="pathRangeArrow" aria-hidden="true">→</span>'+
 '<fieldset><legend>TO</legend><label>Rarity / rank<select data-path-to-stage aria-label="To upgrade stage">'+stageOpts(range.toStage)+'</select></label>'+
 '<label>Enhancement<select data-path-to-level aria-label="To enhancement level">'+rangeLevelOptions(to,range.toLevel)+'</select></label></fieldset></div>';
 const summary=quote.error?'<div class="pathWarning" role="status">'+esc(quote.error)+(quote.missing.length?' Missing: '+esc(quote.missing.slice(0,4).join(', ')):'')+'</div>':
 '<div class="pathRangeSummary"><div><small>Upgrade steps</small><strong>'+money(quote.steps)+'</strong></div>'+
 '<div><small>Total Gold</small><strong>'+money(quote.gold)+'</strong></div>'+
 '<div><small>Material types</small><strong>'+quote.materials.length+'</strong></div></div>'+
 (quote.materials.length?'<h4>All materials for this route</h4>'+amountList(quote.materials):
 '<p class="pathFree">These checkpoints are identical, so no upgrade is needed.</p>');
 return controls+'<div class="pathRangeOutput" role="status" aria-live="polite">'+summary+'</div>'+
 '<p class="pathRangeFoot">Base recipe totals include intervening enhancements and tier / rank transitions. Failed attempts are excluded.</p>';
}
export function pathfinderRangePanel(snapshot,quick,raw={},catalog=[]){
 return '<details class="pathRangePanel" id="pathRangePanel"><summary><span><strong>Calculate From → To</strong>'+
 '<small>Full Gold and material totals between any two upgrade levels</small></span><span aria-hidden="true">▾</span></summary>'+
 '<div id="pathRangeContent">'+pathfinderRangeContent(snapshot,quick,raw,catalog)+'</div></details>';
}
const option=(value,name,chosen)=>'<option value="'+esc(value)+'" '+(value===chosen?'selected':'')+'>'+esc(name)+'</option>';
export function pathfinderView(raw,snapshot,error='',rangePlan={},options={}){
 const pref=normalizeQuickView(raw);
 if(!snapshot)return '<section class="pathPage"><header class="pathIntro"><span class="pathEyebrow">ARCANA PATHFINDER</span><h1>See every upgrade at a glance.</h1><p>Pick your equipment slot and swipe through enhancement costs.</p></header><p class="pathWarning">'+esc(error||'Loading verified upgrade recipes…')+'</p><button class="btn secondary" data-action="path-refresh">Retry recipe connection</button></section>';
 const model=timelineModel(snapshot,pref);
 if(!model)return '<div class="pathPage pathWarning">There are no verified upgrade recipes available.</div>';
 const {view,stages,active}=model;
 return '<div class="pathPage">'+
 '<header class="pathIntro"><span class="pathEyebrow">ARCANA PATHFINDER</span><h1>Every upgrade. One quick look.</h1><p>No character setup, no inventory forms. Choose a slot, then swipe to see exactly what each upgrade costs.</p></header>'+
 '<div class="pathSelectors"><label class="pathSlotSelector"><span>Equipment slot</span><select data-path-slot aria-label="Equipment slot">'+PATHFINDER_SLOTS.map(x=>option(x.id,x.label,view.slot)).join('')+'</select></label>'+
 '<fieldset class="pathMode"><legend>Upgrade path</legend><div class="pathModeChoices">'+Object.entries(MODE_LABELS).map(([id,name])=>'<button type="button" data-action="path-mode" data-arg="'+id+'" aria-pressed="'+(id===view.mode)+'" class="'+(id===view.mode?'active':'')+'">'+esc(name)+'</button>').join('')+'</div></fieldset></div>'+
 '<section class="pathTimeline" aria-label="Upgrade cost timeline">'+
 '<div class="pathTrackHeading"><div><span class="pathEyebrow">01 / UPGRADE MAP</span><h2>Explore '+(view.mode==='awakened'?'Awakening ranks':'rarity tiers')+'</h2></div><span class="pathTrackCount">'+stages.length+' stages</span></div>'+
 '<div class="pathStageRail" id="pathStageRail" role="group" aria-label="Scroll through upgrade stages">'+stages.map((s,i)=>
 '<button type="button" class="pathStage '+(s.id===active.id?'selected':'')+'" data-action="path-stage" data-arg="'+esc(s.id)+'" data-path-stage="'+esc(s.id)+'" aria-pressed="'+(s.id===active.id)+'" aria-label="Select '+esc(title(s))+'">'+
 '<span class="pathStageNumber">'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(s.id)+'</strong><small>'+esc(s.name)+'</small></button>'
 ).join('')+'</div>'+
 '<div class="pathTrackHeading pathStepHeading"><div><span class="pathEyebrow">02 / ENHANCEMENT</span><h2 id="pathStageTitle">'+esc(title(active))+'</h2></div><div class="pathTrackBtns"><button type="button" data-action="path-prev" aria-label="Previous enhancement">‹</button><button type="button" data-action="path-next" aria-label="Next enhancement">›</button></div></div>'+
 '<div class="pathStepRail" id="pathStepRail" role="group" aria-label="Browse individual upgrade steps">'+model.steps.map((x,i)=>
 '<button type="button" data-action="path-step" data-arg="'+i+'" data-path-step="'+i+'" aria-pressed="'+(i===view.level)+'" aria-label="'+esc(stageStepLabel(active,i))+'" class="pathStep '+(i===view.level?'selected':'')+'">'+
 '<span>'+ (i===0?'↗':'+'+i)+'</span><small>'+(i===0?'Transition':x?compactGold(x.gold)+' G':'Unverified')+'</small></button>'
 ).join('')+'</div>'+
 '<div class="pathRangeHead"><label for="pathStepRange">Slide through upgrades</label><output id="pathStepValue" for="pathStepRange">'+(view.level===0?'Transition':'+'+view.level)+'</output></div>'+
 '<input id="pathStepRange" data-path-range aria-label="Selected upgrade level" type="range" min="0" max="'+active.max+'" value="'+view.level+'" step="1" aria-valuetext="'+esc(stageStepLabel(active,view.level))+'" style="--path-progress:'+(active.max?Math.round(view.level/active.max*100):0)+'%">'+
 pathfinderStepDetail(model)+pathfinderChapterDetail(model)+(options.includeRange===false?'':pathfinderRangePanel(snapshot,view,rangePlan,options.catalog))+
 '</section>'+
 '<p class="pathSource">Source: '+esc(snapshot.sourceVersion||snapshot.source||'October 2026 verified-cost snapshot')+'. Base Gold and material amounts per upgrade, before failed attempts. This source has only generic tier recipes. It cannot verify slot-specific cost differences. A1–A30 are supported where source data is available.</p>'+
 '<div class="pathActions"><button type="button" class="btn secondary" data-route="labs/build">Back to Build Studio</button><button type="button" class="btn secondary" data-route="wiki/library" data-params="kind=material">Materials in the Wiki</button></div>'+
 '</div>';
}
