import {esc} from './ui.js';
import {PATHFINDER_SLOTS,MODE_LABELS,money,timelineModel,stageStepLabel,normalizeQuickView} from './pathfinder-timeline.js';

const title=stage=>stage.tier?stage.name:stage.id+' · Awakened';
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
const option=(value,name,chosen)=>'<option value="'+esc(value)+'" '+(value===chosen?'selected':'')+'>'+esc(name)+'</option>';
export function pathfinderView(raw,snapshot,error=''){
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
 '<button type="button" class="pathStage '+(s.id===active.id?'selected':'')+'" data-action="path-stage" data-arg="'+esc(s.id)+'" data-path-stage="'+esc(s.id)+'" aria-pressed="'+(s.id===active.id)+'">'+
 '<span class="pathStageNumber">'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(s.id)+'</strong><small>'+esc(s.name)+'</small></button>'
 ).join('')+'</div>'+
 '<div class="pathTrackHeading pathStepHeading"><div><span class="pathEyebrow">02 / ENHANCEMENT</span><h2 id="pathStageTitle">'+esc(title(active))+'</h2></div><div class="pathTrackBtns"><button type="button" data-action="path-prev" aria-label="Previous enhancement">‹</button><button type="button" data-action="path-next" aria-label="Next enhancement">›</button></div></div>'+
 '<div class="pathStepRail" id="pathStepRail" role="group" aria-label="Browse individual upgrade steps">'+model.steps.map((x,i)=>
 '<button type="button" data-action="path-step" data-arg="'+i+'" data-path-step="'+i+'" aria-pressed="'+(i===view.level)+'" class="pathStep '+(i===view.level?'selected':'')+'">'+
 '<span>'+ (i===0?'↗':'+'+i)+'</span><small>'+(i===0?'Transition':x?money(x.gold)+' G':'Unverified')+'</small></button>'
 ).join('')+'</div>'+
 '<div class="pathRangeHead"><label for="pathStepRange">Slide through upgrades</label><output id="pathStepValue" for="pathStepRange">'+(view.level===0?'Transition':'+'+view.level)+'</output></div>'+
 '<input id="pathStepRange" data-path-range aria-label="Selected upgrade level" type="range" min="0" max="'+active.max+'" value="'+view.level+'" step="1" aria-valuetext="'+esc(stageStepLabel(active,view.level))+'" style="--path-progress:'+(active.max?Math.round(view.level/active.max*100):0)+'%">'+
 pathfinderStepDetail(model)+pathfinderChapterDetail(model)+
 '</section>'+
 '<p class="pathSource">Source: '+esc(snapshot.sourceVersion||snapshot.source||'October 2026 verified-cost snapshot')+'. Base Gold and material amounts per upgrade, before failed attempts. This dataset uses the same tier recipes for every slot; slot-specific cost differences are not documented. A1–A30 are supported where source data is available.</p>'+
 '<div class="pathActions"><button type="button" class="btn secondary" data-route="labs/build">Back to Build Studio</button><button type="button" class="btn secondary" data-route="wiki/library" data-params="kind=material">Materials in the Wiki</button></div>'+
 '</div>';
}
