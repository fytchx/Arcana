/* Materials-first gear planning. Uses the same verified Pathfinder recipe model.
 * The Oct 21 2026 game config provides item tier stat ranges and awaken multiplier,
 * but not individual rolled stat values or the executable implicit-stat rounding path.
 * Never fabricate exact A-rank implicit stats from a tier range. */
import {OPTIMIZER_CHOICES,OPTIMIZER_ITEM_BY_ID,optimizerChoice,optimizerStatLabel,OPTIMIZER_ITEM_SOURCE} from './upgrade-optimizer-data.js';
import {optimizerTierRanges} from './upgrade-optimizer-tier-data.js';
import {allStages,quoteRange} from './pathfinder-range.js';
import {quoteFailureScenarios} from './pathfinder-failures.js';
import {sourceMaterialGroups} from './pathfinder-material-groups.js';

export const OPTIMIZER_SLIDER_KEY='arcana-upgrade-optimizer-sliders-v3-clean';
const TIER_LABELS=['Normal','Uncommon','Rare','Epic','Legendary','Infernal'];
const MAX_ITEMS=12;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(n))?Math.trunc(Number(n)):min));
const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const fmt=x=>typeof x==='bigint'?x.toLocaleString('en-US'):Number(x).toLocaleString('en-US',{maximumFractionDigits:2});
const summaryNumber=x=>{const n=typeof x==='bigint'?x:BigInt(x||0);for(const [size,name] of [[1000000000000000n,'Qa'],[1000000000000n,'T'],[1000000000n,'B'],[1000000n,'M'],[1000n,'K']])if(n>=size)return (Number((n*10n+size/2n)/size)/10).toLocaleString('en-US',{maximumFractionDigits:1})+name;return fmt(n)};
const itemValue=key=>optimizerChoice(key)||null;
const endpoint=(raw={},fallback={rarity:6,awaken:0,level:0})=>{
 const rarity=clamp(raw.rarity??fallback.rarity,1,6);
 const awaken=rarity===6?clamp(raw.awaken??fallback.awaken,0,30):0;
 const max=rarity===6?30:[4,9,14,19,24,30][rarity-1];
 return {rarity,awaken,level:clamp(raw.level??fallback.level,0,max)};
};
export const endpointStage=p=>p.awaken>0?'A'+p.awaken:'T'+p.rarity;
const position=p=>(p.awaken>0?5+p.awaken:p.rarity-1)*31+p.level;
const blankItem=()=>({itemKey:'',current:{rarity:6,awaken:0,level:0},target:{rarity:6,awaken:0,level:1}});
const normalizedItem=raw=>{
 const r=raw||{},choice=itemValue(String(r.itemKey||''));
 const initial=choice?.tier===7?{rarity:6,awaken:1,level:0}:{rarity:choice?.tier||6,awaken:0,level:0};
 const current=endpoint(r.current||{},initial);
 const target=endpoint(r.target||{},current);
 return {itemKey:choice?.key||'',current,target};
};
export function normalizeOptimizerSliders(raw){
 const r=raw&&typeof raw==='object'?raw:{},incoming=Array.isArray(r.items)?r.items:[];
 const items=incoming.slice(0,MAX_ITEMS).map(normalizedItem);
 return {costMode:['min','expected','pity'].includes(r.costMode)?r.costMode:'expected',items};
}
export function readOptimizerSliders(store=globalThis.localStorage){
 try{return normalizeOptimizerSliders(JSON.parse(store?.getItem(OPTIMIZER_SLIDER_KEY)||'null'))}catch{return normalizeOptimizerSliders()}
}
export function saveOptimizerSliders(value,store=globalThis.localStorage){
 const clean=normalizeOptimizerSliders(value);
 try{store?.setItem(OPTIMIZER_SLIDER_KEY,JSON.stringify(clean))}catch{}
 return clean;
}
let state=readOptimizerSliders(),editingIndex=-1;
const options=selected=>'<option value=""'+(!selected?' selected':'')+'>Choose equipment…</option>'+OPTIMIZER_CHOICES.map(x=>'<option value="'+esc(x.key)+'"'+(x.key===selected?' selected':'')+'>'+esc(x.label)+'</option>').join('');
const panelLabel=p=>p.awaken>0?'A'+p.awaken:p.rarity===6?'Infernal':'T'+p.rarity+' · '+TIER_LABELS[p.rarity-1];
const levelLabel=p=>panelLabel(p)+' +'+p.level;
const slider=(i,side,key,value,min,max,title,caption)=>{
 const id='optSlider'+i+side+key;
 return '<label class="uoSlider" for="'+id+'"><span>'+esc(title)+'</span><output data-uo-label="'+i+'-'+side+'-'+key+'">'+esc(caption)+'</output>'+
 '<input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="1" value="'+value+'" data-uo-index="'+i+'" data-uo-side="'+side+'" data-uo-field="'+key+'" aria-label="'+esc(title)+'">'+
 '</label>';
};
function endpointMarkup(i,side,point){
 const awakenDisabled=point.rarity!==6;
 const max=point.rarity===6?30:[4,9,14,19,24,30][point.rarity-1];
 return '<section class="uoEndpoint"><header><strong>'+ (side==='current'?'CURRENT':'TARGET')+'</strong><span class="uoStage" data-uo-stage="'+i+'-'+side+'">'+esc(levelLabel(point))+'</span></header>'+
 slider(i,side,'rarity',point.rarity,1,6,'Rarity',TIER_LABELS[point.rarity-1])+
 (awakenDisabled?'<p class="uoDisabledNote">Awakening unlocks at Infernal.</p>':slider(i,side,'awaken',point.awaken,0,30,'Awakening rank',point.awaken?'A'+point.awaken:'None'))+
 slider(i,side,'level',point.level,0,max,'Enhancement','+'+point.level)+'</section>';
}
function quote(snapshot,item){
 if(!item.itemKey)return {error:'Choose equipment'};
 if(!snapshot)return {error:'Loading Pathfinder recipes'};
 if(position(item.target)<position(item.current))return {error:'Target must be at or above the current upgrade.'};
 const fromStage=endpointStage(item.current),toStage=endpointStage(item.target);
 const raw=quoteRange(snapshot,{fromStage,fromLevel:item.current.level,toStage,toLevel:item.target.level,quantity:1});
 if(raw.error||!raw.complete)return {error:raw.error||'Missing verified upgrade step',raw};
 const scenarios=quoteFailureScenarios(snapshot,raw);
 const expected=scenarios.available?scenarios.expected:null,pity=scenarios.available?scenarios.pity:null;
 const result=state.costMode==='expected'&&expected?expected:state.costMode==='pity'&&pity?pity:{gold:raw.gold,materials:raw.materials,attempts:raw.steps};
 return {raw,result,scenarios,modeled:!!(expected&&pity),mode:state.costMode,stages:[fromStage,toStage]};
}
export function totalUpgradeMaterials(snapshot,items,mode='expected'){
 const maps=new Map();let gold=0n,attempts=0,errors=[],ready=0,unmodeled=[];
 for(let i=0;i<items.length;i++){
  if(!items[i].itemKey)continue;
  const raw=state.costMode;state.costMode=mode;
  let q;try{q=quote(snapshot,items[i])}finally{state.costMode=raw}
  if(q.error){errors.push('Item '+(i+1)+': '+q.error);continue}
  ready++;gold+=q.result.gold;attempts+=q.result.attempts;
  if(mode!=='min'&&!q.modeled)unmodeled.push(i+1);
  for(const m of q.result.materials){const old=maps.get(m.slug);maps.set(m.slug,{slug:m.slug,name:m.name,quantity:(old?.quantity||0n)+m.quantity})}
 }
 return {materials:[...maps.values()],gold,attempts,ready,errors,unmodeled};
}
function statView(choice,item){
 const original=OPTIMIZER_ITEM_BY_ID.get(choice?.itemId);
 if(!original)return '';
 if(!choice)return '';
 const a=optimizerTierRanges(choice.itemId,item.current.rarity),b=optimizerTierRanges(choice.itemId,item.target.rarity);
 if(!a||!b)return '';
 const arr=[{name:optimizerStatLabel(original.primary),from:a.primary,to:b.primary}];
 if(a.secondary&&b.secondary)arr.push({name:optimizerStatLabel(original.secondary),from:a.secondary,to:b.secondary});
 const format=r=>r.min===r.max?fmt(r.min):fmt(r.min)+'–'+fmt(r.max);
 return '<details class="uoStats"><summary>Item stat reference <span>⌄</span></summary><div>'+
 arr.map(row=>'<div class="uoStatRow"><span>'+esc(row.name)+'</span><strong>'+format(row.from)+' → '+format(row.to)+'</strong></div>').join('')+
 '<p>Configured rarity base ranges, not a prediction of your individual roll at '+esc(levelLabel(item.target))+'. Awakening adds a configured 12% scaling parameter per rank, but the exact implicit calculation and rounding are not provided in the configuration.</p></div></details>';
}
function itemCard(item,i,snapshot){
 const choice=optimizerChoice(item.itemKey),expanded=editingIndex===i;
 const title=choice?.label||'Choose equipment',route=levelLabel(item.current)+' → '+levelLabel(item.target);
 const quoteInfo=choice?quote(snapshot,item):null;
 return '<article class="uoItem'+(expanded?' uoOpen':'')+'">'+
 '<div class="uoCardLine"><span class="uoItemNum">'+(i+1)+'</span><div class="uoCardText"><strong>'+esc(title)+'</strong><small>'+esc(choice?route:'Select an item to begin')+'</small></div>'+
 '<button type="button" class="uoToggle" data-uo-action="toggle" data-uo-index="'+i+'" aria-expanded="'+expanded+'">'+(expanded?'Done':'Edit')+'</button>'+
 '<button type="button" class="uoRemove" data-uo-action="remove" data-uo-index="'+i+'" aria-label="Remove '+esc(title)+'">×</button></div>'+
 (expanded?'<div class="uoEditor"><label class="uoChoose"><span>Equipment</span><select data-uo-item="'+i+'">'+options(item.itemKey)+'</select></label>'+
 (choice?'<div class="uoRangeGrid">'+endpointMarkup(i,'current',item.current)+endpointMarkup(i,'target',item.target)+'</div>'+
 '<div class="uoCardFoot"><span>'+esc(route)+'</span>'+(quoteInfo?.error?'<small>'+esc(quoteInfo.error)+'</small>':'<strong>'+(quoteInfo?.result?.materials?.length||0)+' material types</strong>')+'</div>'+
 statView(choice,item):'<p class="uoHelp">Choose equipment above to set the current and target upgrade levels.</p>')+'</div>':'')+
 '</article>';
}
const grouped=(materials,snapshot,catalog)=>sourceMaterialGroups(materials,snapshot?.materials||[],catalog||[]);
function materialGroup(group,open=false){
 return '<details class="uoMaterialGroup"'+(open?' open':'')+'><summary><strong>'+esc(group.name)+'</strong><small>'+group.materials.length+' types</small><span>⌄</span></summary>'+
 '<div>'+group.materials.map(m=>'<div class="uoMaterial"><span>'+esc(m.name)+(m.sourceMonster?'<small>'+esc(m.sourceMonster)+'</small>':'')+'</span><strong>'+fmt(m.quantity)+'</strong></div>').join('')+'</div></details>';
}
function totals(snapshot,catalog){
 if(!state.items.some(x=>x.itemKey))return '';
 if(!snapshot)return '<section class="uoSummary" role="status">Loading Pathfinder materials…</section>';
 const tally=totalUpgradeMaterials(snapshot,state.items,state.costMode);
 const groups=grouped(tally.materials,snapshot,catalog);
 const monster=groups.filter(g=>g.kind!=='special'),rare=groups.filter(g=>g.kind==='special');
 const modeName={min:'Minimum',expected:'Expected',pity:'Pity maximum'}[state.costMode];
 return '<section class="uoSummary"><div class="uoSummaryTop"><div><span class="uoEyebrow">COMBINED MATERIALS</span><h2>Farming list</h2><p>'+tally.ready+' item'+(tally.ready===1?'':'s')+' · '+tally.materials.length+' material types</p></div>'+
 '<label>Estimate<select data-uo-mode><option value="expected"'+(state.costMode==='expected'?' selected':'')+'>Expected</option>'+
 '<option value="min"'+(state.costMode==='min'?' selected':'')+'>Minimum</option><option value="pity"'+(state.costMode==='pity'?' selected':'')+'>Pity max</option></select></label></div>'+
 (tally.errors.length?'<div class="uoWarnings">'+tally.errors.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>':'')+
 (tally.unmodeled.length?'<p class="uoWarnings">Failure estimates unavailable for some routes. Showing minimum quantities for those items.</p>':'')+
 '<div class="uoMaterialSections">'+(monster.length?monster.map((g,i)=>materialGroup(g,i===0)).join(''):'<p class="uoEmptyMaterials">No monster materials needed.</p>')+'</div>'+
 (rare.length?'<details class="uoSpecial"><summary>Special materials <small>'+rare.reduce((a,g)=>a+g.materials.length,0)+' types</small></summary><div>'+rare.map(g=>materialGroup(g,true)).join('')+'</div></details>':'')+
 '<details class="uoMoney"><summary>Gold and upgrade attempts</summary><div><p>Gold <strong>'+summaryNumber(tally.gold)+'</strong></p><p>Attempts <strong>'+fmt(tally.attempts)+'</strong></p></div></details></section>';
}
export function upgradeOptimizerSliderView(snapshot,catalog=[]){
 const first=totals(snapshot,catalog);
 return '<style>'+
 '.uoRoot{color:var(--text,#edf4ff);max-width:1120px;margin:auto;--uoBorder:var(--line,#384354);--uoSurface:var(--panel,#1d2635);--uoMuted:var(--muted,#aeb8c7)}.uoRoot *{box-sizing:border-box}.uoHero{padding:18px 20px;border:1px solid var(--uoBorder);background:linear-gradient(125deg,color-mix(in srgb,var(--uoSurface) 82%,#20bad0 18%),var(--uoSurface));border-radius:17px;margin-bottom:14px}.uoEyebrow{font-size:10px;font-weight:800;letter-spacing:.15em;color:#67dcec}.uoHero h2,.uoSummary h2{margin:5px 0;font-size:clamp(21px,4.8vw,29px)}.uoHero p,.uoSummary header p{margin:4px 0;color:var(--uoMuted);font-size:13px;line-height:1.55}.uoActions{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:14px}.uoActions label{display:flex;gap:9px;align-items:center;font-size:12px}.uoActions button,.uoActions select,.uoItemHeader button,.uoChoose select{border:1px solid var(--uoBorder);color:inherit;border-radius:10px;background:var(--uoSurface);min-height:40px;padding:8px 12px}.uoActions button{cursor:pointer;font-weight:700}.uoSummary{padding:18px;border-radius:17px;border:1px solid color-mix(in srgb,var(--uoBorder) 68%,#4edbc7);background:var(--uoSurface);margin-bottom:16px}.uoSummary header{margin-bottom:15px}.uoMaterialSections{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,325px),1fr));gap:10px}.uoMaterialGroup{border:1px solid var(--uoBorder);border-radius:11px;background:color-mix(in srgb,var(--uoSurface) 87%,#52c7d9 13%);min-width:0;overflow:hidden}.uoMaterialGroup summary{padding:11px 12px;cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px}.uoMaterialGroup summary::-webkit-details-marker{display:none}.uoMaterialGroup summary strong{font-size:13px;flex:1}.uoMaterialGroup summary small{font-size:11px;color:var(--uoMuted)}.uoMaterialGroup summary>span{color:#79d3e8}.uoMaterial{padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid var(--uoBorder)}.uoMaterial>span{font-size:12px;display:grid;gap:3px}.uoMaterial>span small{font-size:10px;color:var(--uoMuted)}.uoMaterial>strong{font-size:14px;color:#86e0c0;font-variant-numeric:tabular-nums;white-space:nowrap}.uoSpecial{margin-top:15px;display:grid;gap:9px}.uoSpecial h3{font-size:14px;margin:0 0 3px}.uoMoney{margin-top:13px;border-top:1px solid var(--uoBorder);padding-top:12px}.uoMoney summary{font-size:12px;color:var(--uoMuted);cursor:pointer}.uoMoney>div{padding:12px 0}.uoMoney p{display:flex;justify-content:space-between;font-size:13px}.uoMoney small{font-size:11px;color:var(--uoMuted)}.uoGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,490px),1fr));gap:12px}.uoItem{padding:15px;border:1px solid var(--uoBorder);border-radius:16px;background:var(--uoSurface);min-width:0}.uoItemHeader{display:flex;align-items:center;gap:11px;margin-bottom:12px}.uoItemHeader>div:nth-child(2){flex:1;min-width:0;display:grid;gap:3px}.uoItemHeader small{font-size:10px;color:var(--uoMuted)}.uoItemHeader strong{font-size:15px}.uoItemNum{width:35px;height:35px;display:grid;place-items:center;color:#69e7ee;background:#32aec137;border-radius:10px;font-weight:850}.uoItemHeader button{padding:3px 11px;font-size:21px;cursor:pointer}.uoItemHeader button:disabled{opacity:.25}.uoChoose{display:grid;gap:5px;font-size:11px;color:var(--uoMuted);margin-bottom:14px}.uoChoose select{width:100%;color:var(--text,#eef);font-size:13px}.uoRangeGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.uoEndpoint{min-width:0;border-radius:12px;border:1px solid var(--uoBorder);padding:10px;background:color-mix(in srgb,var(--uoSurface) 91%,#b3e4ff 9%)}.uoEndpoint header{display:grid;gap:4px;margin-bottom:10px}.uoEndpoint header strong{font-size:10px;letter-spacing:.1em;color:var(--uoMuted)}.uoStage{font-size:14px;font-weight:800;color:#79e0ef;min-height:20px}.uoSlider{display:grid;gap:7px;margin:12px 0 14px;font-size:11px}.uoSlider span{color:var(--uoMuted)}.uoSlider output{font-size:12px;font-weight:750}.uoSlider input{width:100%;height:26px;accent-color:#54cde0;touch-action:pan-x;cursor:pointer}.uoDisabledNote{font-size:10px;line-height:1.35;color:var(--uoMuted);min-height:24px}.uoItemResults{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;border-top:1px solid var(--uoBorder);margin-top:10px;padding-top:12px}.uoItemResults>div{display:grid;gap:5px}.uoItemResults span{font-size:10px;color:var(--uoMuted)}.uoItemResults strong{font-size:12px}.uoStats{margin-top:12px;border-top:1px solid var(--uoBorder);padding-top:12px}.uoStats summary{cursor:pointer;font-size:12px;color:var(--uoMuted)}.uoStats>div{padding-top:9px}.uoStatRow{display:flex;justify-content:space-between;gap:12px;font-size:11px;padding:7px 0}.uoStatRow strong{text-align:right}.uoStats p,.uoError,.uoWarnings{font-size:11px;line-height:1.6;color:var(--uoMuted)}.uoError,.uoWarnings{color:#ffc18b}.uoEmpty{font-size:12px;color:var(--uoMuted)}.uoFoot{font-size:11px;color:var(--uoMuted);line-height:1.55;margin:14px 2px}.uoFooter{display:flex;align-items:center;justify-content:space-between;margin:14px 0;color:var(--uoMuted);font-size:12px}@media(max-width:550px){.uoHero{padding:14px}.uoSummary{padding:12px}.uoItem{padding:11px}.uoRangeGrid{gap:7px}.uoEndpoint{padding:8px}.uoSlider{margin:10px 0 12px}.uoStage{font-size:12px}}'+
 '</style><div class="uoRoot" id="arcanaUpgradeOptimizerV2"><div class="uoHero"><span class="uoEyebrow">UPGRADE OPTIMIZER</span><h2>Pick your gear. Plan your materials.</h2><p>Choose an item, set current and target rarity, Awakening and enhancement with sliders. Add more items to combine everything into one farming list.</p></div>'+
 '<div class="uoActions"><label>Material estimate <select data-uo-mode>'+
 '<option value="min"'+(state.costMode==='min'?' selected':'')+'>Minimum</option><option value="expected"'+(state.costMode==='expected'?' selected':'')+'>Expected (failures)</option><option value="pity"'+(state.costMode==='pity'?' selected':'')+'>Pity scenario</option></select></label><div><button data-uo-action="add"'+(state.items.length>=MAX_ITEMS?' disabled':'')+'>+ Add item</button> <button data-uo-action="reset">Reset</button></div></div>'+
 '<div data-uo-totals>'+first+'</div><div class="uoGrid" data-uo-items>'+state.items.map((item,i)=>itemCard(item,i,snapshot)).join('')+'</div>'+
 '<p class="uoFoot">Item rarity reference: IdleArc configuration '+esc(OPTIMIZER_ITEM_SOURCE)+'. Materials and upgrade failures reuse Pathfinder. Individual rolled stats and exact enhancement rounding are not determined by the public configuration alone; the tool does not claim exact rolled values.</p></div>';
}
let getContext=()=>({snapshot:null,catalog:[]}),installed=false;
const redraw=()=>{
 const root=document.getElementById('arcanaUpgradeOptimizerV2');
 if(!root)return;
 const {snapshot,catalog}=getContext(),markup=upgradeOptimizerSliderView(snapshot,catalog);
 // Replace the complete component, preserving its styles, without rerouting the page.
 const head=markup.indexOf('<div class="uoRoot"');
 root.outerHTML=markup.slice(head);
};
export function wireUpgradeOptimizerSliders(context){
 getContext=context;
 if(installed)return;
 installed=true;
 document.addEventListener('input',event=>{
  const input=event.target.closest('input[data-uo-field]');
  if(!input||!input.closest('#arcanaUpgradeOptimizerV2'))return;
  const {uoIndex,uoSide,uoField}=input.dataset,point=state.items[Number(uoIndex)]?.[uoSide];
  if(!point)return;
  const raw=Number(input.value);
  const label=document.querySelector('[data-uo-label="'+uoIndex+'-'+uoSide+'-'+uoField+'"]');
  if(label)label.textContent=uoField==='rarity'?TIER_LABELS[raw-1]:uoField==='awaken'?(raw?'A'+raw:'None'):'+'+raw;
  // Do not rebuild while a touch slider is being dragged.
 });
 document.addEventListener('change',event=>{
  const input=event.target,root=input.closest('#arcanaUpgradeOptimizerV2');
  if(!root)return;
  if(input.matches('[data-uo-mode]'))state.costMode=input.value;
  else if(input.matches('[data-uo-item]')){
   const entry=state.items[Number(input.dataset.uoItem)];if(!entry)return;
   const choice=itemValue(input.value);entry.itemKey=choice.key;
   const point=choice.tier>=7?{rarity:6,awaken:1,level:0}:{rarity:choice.tier||6,awaken:0,level:0};
   entry.current=endpoint(point);entry.target=endpoint({...point,level:Math.min(1,[4,9,14,19,24,30][point.rarity-1])});
  }else if(input.matches('input[data-uo-field]')){
   const entry=state.items[Number(input.dataset.uoIndex)];if(!entry)return;
   const side=input.dataset.uoSide,field=input.dataset.uoField;
   if(!['current','target'].includes(side)||!['rarity','awaken','level'].includes(field))return;
   const point={...entry[side],[field]:Number(input.value)};
   if(field==='rarity'&&point.rarity<6)point.awaken=0;
   entry[side]=endpoint(point);
   // When current moves ahead, slide target forward rather than showing a broken route.
   if(side==='current'&&position(entry.target)<position(entry.current))entry.target={...entry.current};
  }
  state=saveOptimizerSliders(state);redraw();
 });
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-uo-action]');
  if(!button||!button.closest('#arcanaUpgradeOptimizerV2'))return;
  if(button.dataset.uoAction==='add'&&state.items.length<MAX_ITEMS){
   const exampleItem=OPTIMIZER_CHOICES.find(x=>x.label==='Pathfinder Treads')||OPTIMIZER_CHOICES[0];
   state.items.push(normalizedItem({itemKey:exampleItem.key,current:{rarity:6,awaken:0,level:0},target:{rarity:6,awaken:1,level:0}}));
  }else if(button.dataset.uoAction==='reset')state=normalizeOptimizerSliders(null);
  else if(button.dataset.uoAction==='remove'&&state.items.length>1)state.items.splice(Number(button.dataset.uoIndex),1);
  state=saveOptimizerSliders(state);redraw();
 });
}
