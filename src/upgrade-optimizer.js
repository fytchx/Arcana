/* Upgrade Optimizer v1: user-observed implicit gains + Pathfinder's verified recipe engine.
 * Never infer server enhancement rounding or convert unrelated stats into a made-up score. */
import {OPTIMIZER_CHOICES,OPTIMIZER_ITEM_BY_ID,optimizerChoice,optimizerStatLabel,OPTIMIZER_ITEM_SOURCE} from './upgrade-optimizer-data.js';
import {allStages,quoteRange} from './pathfinder-range.js';
import {quoteFailureScenarios} from './pathfinder-failures.js';

export const OPTIMIZER_PLAN_KEY='arcana-upgrade-optimizer-v1';
const sample=()=>({mode:'expected',candidates:[
 {itemKey:'sandals-of-starszy|Chainmail Boots',fromStage:'A5',fromLevel:24,toStage:'A5',toLevel:25,primaryFrom:'8579',primaryTo:'8601',secondaryFrom:'',secondaryTo:''},
 {itemKey:'rags|Chainmail Armor',fromStage:'A6',fromLevel:23,toStage:'A6',toLevel:24,primaryFrom:'17355',primaryTo:'17397',secondaryFrom:'',secondaryTo:''}
]});
const cleanNumber=x=>x===''||x===null||x===undefined?'':String(x).trim().replace(/,/g,'');
const safeLevel=x=>Math.max(0,Math.min(30,Number.isFinite(Number(x))?Math.trunc(Number(x)):0));
const validValue=x=>x!==''&&Number.isFinite(Number(x))&&Number(x)>=0;
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const big=x=>typeof x==='bigint'?x:BigInt(x||0);
const exact=n=>big(n).toLocaleString('en-US');
const compact=n=>{
 const a=big(n),units=[[1000000000000000n,'qa'],[1000000000000n,'T'],[1000000000n,'B'],[1000000n,'M'],[1000n,'K']];
 for(const [size,sym] of units)if(a>=size){const tenths=(a*10n+size/2n)/size;return (Number(tenths)/10).toLocaleString('en-US',{maximumFractionDigits:1})+sym}
 return exact(a);
};
const entity=raw=>{
 const base=raw&&typeof raw==='object'?raw:{};
 const itemKey=optimizerChoice(String(base.itemKey||''))?String(base.itemKey):OPTIMIZER_CHOICES[0].key;
 return {itemKey,fromStage:String(base.fromStage||'T6'),fromLevel:safeLevel(base.fromLevel),
  toStage:String(base.toStage||'T6'),toLevel:safeLevel(base.toLevel),
  primaryFrom:cleanNumber(base.primaryFrom),primaryTo:cleanNumber(base.primaryTo),
  secondaryFrom:cleanNumber(base.secondaryFrom),secondaryTo:cleanNumber(base.secondaryTo)};
};
export function normalizeOptimizerPlan(raw){
 const source=raw&&typeof raw==='object'?raw:sample();
 const candidates=(Array.isArray(source.candidates)?source.candidates:sample().candidates).slice(0,12).map(entity);
 return {mode:['min','expected','pity'].includes(source.mode)?source.mode:'expected',candidates:candidates.length?candidates:[entity(sample().candidates[0])]};
}
export function readOptimizerPlan(store=globalThis.localStorage){
 try{return normalizeOptimizerPlan(JSON.parse(store?.getItem(OPTIMIZER_PLAN_KEY)||'null'))}catch{return normalizeOptimizerPlan()}
}
export function saveOptimizerPlan(plan,store=globalThis.localStorage){
 const normalized=normalizeOptimizerPlan(plan);
 try{store?.setItem(OPTIMIZER_PLAN_KEY,JSON.stringify(normalized))}catch{}
 return normalized;
}
let plan=readOptimizerPlan();
const field=(index,name,value,title,placeholder='')=>'<label class="optField"><span>'+esc(title)+'</span><input type="text" inputmode="decimal" data-opt-index="'+index+'" data-opt-field="'+esc(name)+'" placeholder="'+esc(placeholder)+'" value="'+esc(value)+'"></label>';
const opt=(v,label,selected)=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(label)+'</option>';
const stagesOptions=(stages,selected)=>stages.map(x=>opt(x.id,x.id+' · '+(x.id.startsWith('T')?x.name:'Awakening '+x.id.slice(1)),selected)).join('');
function choiceOptions(key){
 return OPTIMIZER_CHOICES.map(x=>opt(x.key,x.label,key)).join('');
}
function quoteCandidate(snapshot,c){
 if(!snapshot)return {ok:false,note:'Loading Pathfinder costs…'};
 const stages=allStages(snapshot);
 if(!stages.some(x=>x.id===c.fromStage)||!stages.some(x=>x.id===c.toStage))return {ok:false,note:'Select an available upgrade rank.'};
 const start=stages.find(x=>x.id===c.fromStage),end=stages.find(x=>x.id===c.toStage);
 if(c.fromLevel>start.max||c.toLevel>end.max)return {ok:false,note:'Enhancement level exceeds the selected rank.'};
 const raw=quoteRange(snapshot,{fromStage:c.fromStage,fromLevel:c.fromLevel,toStage:c.toStage,toLevel:c.toLevel,quantity:1});
 if(raw.error||!raw.complete)return {ok:false,note:raw.error||'Incomplete verified upgrade costs.'};
 const scenarios=quoteFailureScenarios(snapshot,raw);
 const estimated=scenarios.available?scenarios.expected:null;
 const pity=scenarios.available?scenarios.pity:null;
 return {ok:true,raw,scenarios,estimated,pity,modeled:!!estimated};
}
const amount=(from,to)=>{
 if(!validValue(from)||!validValue(to))return null;
 return Number(to)-Number(from);
};
const checked=(n,allowZero=true)=>validValue(n)&&(allowZero||Number(n)>0);
const asStat=(from,to)=>{const delta=amount(from,to);return delta===null?'<span class="optMuted">Enter both values</span>':'<strong class="'+(delta>0?'optGain':delta<0?'optLoss':'')+'">'+(delta>0?'+':'')+fmt(delta)+'</strong>'};
function costView(q,mode){
 if(!q.ok)return '<p class="optMuted" role="status">'+esc(q.note)+'</p>';
 const result=mode==='pity'&&q.pity?q.pity:mode==='expected'&&q.estimated?q.estimated:{gold:q.raw.gold,materials:q.raw.materials,attempts:q.raw.steps};
 const mat=result.materials||[],amounts=mat.map(m=>({name:m.name,quantity:m.quantity,slug:m.slug})).sort((a,b)=>a.name.localeCompare(b.name));
 return '<div class="optCostHead"><div><span>Gold</span><strong title="'+esc(exact(result.gold))+'">'+esc(compact(result.gold))+'</strong></div>'+
 '<div><span>Attempts</span><strong>'+fmt(result.attempts)+'</strong></div><div><span>Material types</span><strong>'+mat.length+'</strong></div></div>'+
 ((mode!=='min'&&!q.modeled)?'<p class="optNotice">Failure odds are incomplete. Showing minimum costs instead.</p>':'')+
 '<details class="optMaterials"><summary>See '+mat.length+' required materials <span aria-hidden="true">⌄</span></summary><div>'+(
 amounts.length?amounts.map(m=>'<p><span>'+esc(m.name)+'</span><strong>'+exact(m.quantity)+'</strong></p>').join(''):'<p>No materials required.</p>')+'</div></details>';
}
function singleCard(c,i,snapshot,mode){
 const choice=optimizerChoice(c.itemKey)||OPTIMIZER_CHOICES[0],item=OPTIMIZER_ITEM_BY_ID.get(choice.itemId);
 const primary=item?.primary||'defense',secondary=item?.secondary;
 const quote=quoteCandidate(snapshot,c);
 const stages=snapshot?allStages(snapshot):[];
 const row=(name,from,to)=>
  '<div class="optStatRow"><span>'+esc(name)+'</span><span>'+ (checked(from)?fmt(Number(from)):'?')+' → '+(checked(to)?fmt(Number(to)):'?')+'</span>'+asStat(from,to)+'</div>';
 const qLabel=c.fromStage+' +'+c.fromLevel+' → '+c.toStage+' +'+c.toLevel;
 return '<article class="optCard"><div class="optCardTop"><div class="optNumber">'+(i+1)+'</div><div><small>ITEM '+(i+1)+'</small><strong>'+esc(choice.label)+'</strong></div><button type="button" class="optRemove" aria-label="Remove item '+(i+1)+'" data-opt-action="remove" data-opt-index="'+i+'"'+(plan.candidates.length<2?' disabled':'')+'>×</button></div>'+
 '<label class="optSelect"><span>Equipment</span><select data-opt-index="'+i+'" data-opt-field="itemKey">'+choiceOptions(c.itemKey)+'</select></label>'+
 '<div class="optRoute"><label>From rank<select data-opt-index="'+i+'" data-opt-field="fromStage">'+stagesOptions(stages,c.fromStage)+'</select></label>'+
 '<label>Level<input type="number" min="0" max="30" data-opt-index="'+i+'" data-opt-field="fromLevel" value="'+c.fromLevel+'"></label>'+
 '<span class="optArrow" aria-hidden="true">→</span>'+
 '<label>To rank<select data-opt-index="'+i+'" data-opt-field="toStage">'+stagesOptions(stages,c.toStage)+'</select></label>'+
 '<label>Level<input type="number" min="0" max="30" data-opt-index="'+i+'" data-opt-field="toLevel" value="'+c.toLevel+'"></label></div>'+
 '<section class="optMeasurements"><header><strong>Inherent item stats</strong><small>Enter current and target Forge values</small></header>'+
 '<div class="optStatInputs">'+field(i,'primaryFrom',c.primaryFrom,optimizerStatLabel(primary)+' now','Current')+field(i,'primaryTo',c.primaryTo,'Target','Forge preview')+'</div>'+
 (secondary?'<div class="optStatInputs">'+field(i,'secondaryFrom',c.secondaryFrom,optimizerStatLabel(secondary)+' now','Current')+field(i,'secondaryTo',c.secondaryTo,'Target','Forge preview')+'</div>':'')+
 '<div class="optDeltas">'+row(optimizerStatLabel(primary),c.primaryFrom,c.primaryTo)+(secondary?row(optimizerStatLabel(secondary),c.secondaryFrom,c.secondaryTo):'')+'</div></section>'+
 '<section class="optCost"><header><strong>Upgrade resources</strong><small>'+esc(qLabel)+'</small></header>'+costView(quote,mode)+'</section></article>';
}
function comparisonMarkup(snapshot,mode){
 const available=plan.candidates.map((c,i)=>({c,i,q:quoteCandidate(snapshot,c),choice:optimizerChoice(c.itemKey)}));
 if(!snapshot)return '<p class="optMuted">Waiting for the Pathfinder recipe service.</p>';
 const completed=available.filter(x=>x.q.ok&&amount(x.c.primaryFrom,x.c.primaryTo)!==null);
 const primaryKeys=new Set(completed.map(x=>OPTIMIZER_ITEM_BY_ID.get(x.choice.itemId)?.primary));
 const header='<h2>Comparison</h2><p>Costs and stat gains stay separate. We only compare efficiency when the stat type matches.</p>';
 if(!completed.length)return header+'<div class="optEmpty">Enter both current and target values for at least one item to compare gains.</div>';
 const rows=completed.map(x=>{
  const gain=amount(x.c.primaryFrom,x.c.primaryTo),q=x.q;
  const costs=mode==='pity'&&q.pity?q.pity:mode==='expected'&&q.estimated?q.estimated:{gold:q.raw.gold,materials:q.raw.materials};
  const primary=OPTIMIZER_ITEM_BY_ID.get(x.choice.itemId)?.primary;
  const efficiency=gain>0&&big(costs.gold)>0n?fmt(1e9*gain/Number(costs.gold)):'—';
  return {name:x.choice.label,gain,primary,gold:costs.gold,efficiency};
 });
 const same=primaryKeys.size===1&&rows.length>1;
 const score=same?rows.filter(x=>x.gain>0&&x.efficiency!=='—').sort((a,b)=>Number(b.efficiency.replaceAll(',',''))-Number(a.efficiency.replaceAll(',',''))):[];
 const primaryLabel=same?optimizerStatLabel(rows[0].primary):'Different stat types';
 return header+'<div class="optTableScroll"><table class="optCompareTable"><thead><tr><th>Item</th><th>Stat gained</th><th>Gold</th><th>Gain / 1B Gold</th></tr></thead><tbody>'+
 rows.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+(x.gain>0?'+':'')+fmt(x.gain)+'</td><td>'+esc(compact(x.gold))+'</td><td>'+x.efficiency+'</td></tr>').join('')+
 '</tbody></table></div>'+
 (score.length>1?'<p class="optBest">Best gold efficiency for '+esc(primaryLabel)+': <strong>'+esc(score[0].name)+'</strong> (based on entered gains).</p>':'<p class="optMuted">Different inherent stats cannot be fairly ranked using one shared score. Material types are also not interchangeable.</p>');
}
export function upgradeOptimizerView(snapshot){
 const stages=snapshot?allStages(snapshot):[];
 if(snapshot&&(!stages.length||stages[0].id!=='T1'))snapshot=null;
 return '<style>'+
 '.optShell{--opLine:var(--line,#3a4255);--opSurface:var(--panel,#1b2333);--opText:var(--text,#edf2ff);--opMuted:var(--muted,#a2afc2);color:var(--opText);max-width:1180px;margin-inline:auto}.optHero{padding:22px;border:1px solid var(--opLine);border-radius:19px;background:linear-gradient(125deg,color-mix(in srgb,var(--opSurface) 85%,#26bde5 15%),var(--opSurface));margin-bottom:18px}.optEyebrow{text-transform:uppercase;letter-spacing:.15em;font-size:11px;color:#64d8e8;font-weight:800}.optHero h2{font-size:clamp(23px,5vw,35px);margin:7px 0}.optHero p,.optCompare p{font-size:14px;color:var(--opMuted);line-height:1.65;max-width:750px}.optToolbar{display:flex;gap:9px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin:18px 0}.optToolbar label{display:flex;gap:9px;align-items:center;font-size:13px;font-weight:700}.optToolbar select,.optShell input,.optShell select{min-height:42px;background:var(--opSurface);color:var(--opText);border:1px solid var(--opLine);border-radius:10px;padding:8px;max-width:100%;min-width:0}.optToolbar button,.optRemove{background:color-mix(in srgb,var(--opSurface) 82%,#23bad5 18%);color:var(--opText);border:1px solid var(--opLine);border-radius:10px;padding:11px 15px;font-weight:750;cursor:pointer}.optGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:13px}.optCard{min-width:0;border:1px solid var(--opLine);border-radius:17px;background:var(--opSurface);padding:16px;display:grid;align-content:start;gap:16px}.optCardTop{display:flex;align-items:center;gap:11px}.optCardTop>div:nth-child(2){min-width:0;flex:1;display:grid;gap:3px}.optCardTop small,.optMeasurements header small,.optCost header small{font-size:11px;color:var(--opMuted)}.optCardTop strong{font-size:16px}.optNumber{display:grid;place-items:center;border-radius:11px;background:#109bb53a;color:#58dced;width:39px;height:39px;font-weight:900}.optRemove{padding:5px 11px;font-size:21px}.optSelect,.optRoute label,.optField{display:grid;gap:5px;font-size:12px;color:var(--opMuted)}.optSelect select{width:100%}.optRoute{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,.68fr) auto minmax(0,1.5fr) minmax(0,.68fr);gap:6px;align-items:end}.optRoute select,.optRoute input{width:100%;font-size:12px}.optArrow{padding-bottom:12px;color:#5ed8e8}.optMeasurements,.optCost{border-top:1px solid var(--opLine);padding-top:14px}.optMeasurements header,.optCost header{display:flex;flex-direction:column;gap:4px;margin-bottom:11px}.optStatInputs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:9px}.optField input{width:100%;font-variant-numeric:tabular-nums}.optDeltas{margin-top:12px;border-radius:10px;padding:9px;background:color-mix(in srgb,var(--opSurface) 80%,#37b3dd 20%)}.optStatRow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;font-size:12px;padding:5px 0}.optStatRow>span:nth-child(2){color:var(--opMuted)}.optGain{color:#5ce4ad}.optLoss{color:#fa959c}.optCostHead{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.optCostHead>div{padding:10px 7px;border-radius:9px;background:color-mix(in srgb,var(--opSurface) 87%,#fff 13%);display:grid;gap:4px;text-align:center}.optCostHead span{font-size:10px;color:var(--opMuted)}.optCostHead strong{font-size:17px}.optMaterials{margin-top:12px;border:1px solid var(--opLine);border-radius:11px;overflow:hidden}.optMaterials summary{cursor:pointer;padding:10px;font-size:12px;list-style:none}.optMaterials summary::-webkit-details-marker{display:none}.optMaterials>div{padding:0 12px 8px}.optMaterials p{display:flex;justify-content:space-between;gap:9px;font-size:12px;padding:7px 0;border-top:1px solid var(--opLine);margin:0}.optMaterials p strong{font-variant-numeric:tabular-nums;white-space:nowrap}.optMuted,.optNotice{font-size:12px;color:var(--opMuted);line-height:1.55}.optNotice{color:#ffca83}.optCompare{margin-top:20px;border:1px solid var(--opLine);background:var(--opSurface);padding:18px;border-radius:17px}.optCompare h2{margin:0 0 6px;font-size:21px}.optTableScroll{overflow-x:auto}.optCompareTable{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}.optCompareTable td,.optCompareTable th{text-align:left;border-bottom:1px solid var(--opLine);padding:12px}.optCompareTable th{color:var(--opMuted)}.optBest{color:#5ce4ad!important}.optEmpty{padding:18px;border:1px dashed var(--opLine);border-radius:12px;color:var(--opMuted)}.optFoot{font-size:12px;color:var(--opMuted);line-height:1.6;margin:16px 0}.optFooterActions{display:flex;gap:8px;flex-wrap:wrap}.optFooterActions button{min-height:42px}.optRemove:disabled{opacity:.3;cursor:default}@media(max-width:600px){.optHero{padding:18px}.optCard{padding:12px}.optToolbar{align-items:stretch}.optToolbar>label{width:100%;justify-content:space-between}.optToolbar select{flex:1}.optRoute{grid-template-columns:minmax(0,1.6fr) minmax(0,.68fr) auto minmax(0,1.6fr) minmax(0,.68fr)}.optRoute select{font-size:11px;padding:4px}.optCardTop strong{font-size:14px}}'+
 '</style><section class="optShell" id="arcanaUpgradeOptimizer"><div class="optHero"><span class="optEyebrow">Equipment planning</span><h2>Which upgrade is worth it?</h2><p>Compare inherent item stat gains against real Pathfinder material costs. Use the values from your Forge preview to see what each upgrade actually buys you. Add up to twelve items.</p></div>'+
 '<div class="optToolbar"><label>Cost scenario <select data-opt-field="mode">'+opt('min','Minimum (all succeed)',plan.mode)+opt('expected','Expected (modeled failures)',plan.mode)+opt('pity','Pity ceiling (modeled)',plan.mode)+'</select></label><div class="optFooterActions"><button type="button" data-opt-action="add">+ Add item</button><button type="button" data-opt-action="reset">Reset examples</button></div></div>'+
 '<div class="optGrid">'+plan.candidates.map((c,i)=>singleCard(c,i,snapshot,plan.mode)).join('')+'</div>'+
 '<section class="optCompare">'+comparisonMarkup(snapshot,plan.mode)+'</section>'+
 '<p class="optFoot">Stat definitions and item names: IdleArc config '+esc(OPTIMIZER_ITEM_SOURCE)+'. Upgrade recipes: the same verified source as Pathfinder. Current and target stat numbers are user-entered, not invented projections. Modeled failures depend on the pity assumptions used by Pathfinder. Affixes and Drop Bonuses are excluded from these inherent-stat comparisons.</p></section>';
}
function refresh(){
 const root=document.getElementById('arcanaUpgradeOptimizer');
 if(root){const markup=upgradeOptimizerView(latestSnapshot?latestSnapshot():null);root.outerHTML=markup.slice(markup.indexOf('<section class="optShell"'));}
}
let installed=false,latestSnapshot=null;
export function wireUpgradeOptimizer(getSnapshot){
 latestSnapshot=getSnapshot;
 if(installed)return;
 installed=true;
 document.addEventListener('change',event=>{
  const target=event.target.closest('[data-opt-field]');
  if(!target||!target.closest('#arcanaUpgradeOptimizer'))return;
  const key=target.dataset.optField;
  if(key==='mode')plan.mode=target.value;
  else{
   const index=Number(target.dataset.optIndex),entry=plan.candidates[index];
   if(!entry||!Object.hasOwn(entry,key))return;
   entry[key]=['fromLevel','toLevel'].includes(key)?safeLevel(target.value):String(target.value);
   if(key==='itemKey'){
    const choice=optimizerChoice(entry.itemKey);const tier=choice?.tier||6;
    entry.fromStage=tier<6?'T'+tier:'T6';
    entry.toStage=entry.fromStage;entry.fromLevel=0;entry.toLevel=Math.min(1,tier<6?([4,9,14,19,24,30][tier-1]):30);
    entry.primaryFrom='';entry.primaryTo='';entry.secondaryFrom='';entry.secondaryTo='';
   }
  }
  plan=saveOptimizerPlan(plan);refresh();
 });
 document.addEventListener('click',event=>{
  const btn=event.target.closest('[data-opt-action]');
  if(!btn||!btn.closest('#arcanaUpgradeOptimizer'))return;
  const action=btn.dataset.optAction;
  if(action==='add'&&plan.candidates.length<12){
   const item=OPTIMIZER_CHOICES.find(x=>x.label==='Pathfinder Treads')||OPTIMIZER_CHOICES[0];
   plan.candidates.push(entity({itemKey:item.key,fromStage:'T6',fromLevel:0,toStage:'T6',toLevel:1}));
  } else if(action==='remove'&&plan.candidates.length>1)plan.candidates.splice(Number(btn.dataset.optIndex),1);
  else if(action==='reset')plan=sample();
  plan=saveOptimizerPlan(plan);refresh();
 });
}
