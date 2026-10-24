/* Materials-first gear planning. Uses the same verified Pathfinder recipe model.
 * The Oct 21 2026 game config provides item tier stat ranges and awaken multiplier,
 * but not individual rolled stat values or the executable implicit-stat rounding path.
 * Never fabricate exact A-rank implicit stats from a tier range. */
import {OPTIMIZER_ITEM_BY_ID,optimizerChoice,optimizerStatLabel} from './upgrade-optimizer-data.js';
import {optimizerTierRanges} from './upgrade-optimizer-tier-data.js';
import {FAMILY_ITEMS,familyById,familyVariant,familyArtwork,slotTitle} from './upgrade-family.js';
import {normalizeAffixInputs,normalizeObserved,maxAffixSlots,projectItemBreakdown,parseStatAmount} from './upgrade-optimizer-projections.js';
import {compareUpgradeChoices} from './upgrade-optimizer-decisions.js';
import {renderStatProjection,renderAffixEditor,renderDecisionBoard} from './upgrade-optimizer-panels.js';
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
// Legacy saved keys named every rarity separately. Resolve them to one Codex
// family without losing the user's existing current/target upgrade settings.
const itemValue=key=>{
 const family=familyById(key);if(family)return {key:family.id,itemId:family.id,tier:6};
 const old=optimizerChoice(key);return old?{...old,key:old.itemId}:null;
};
const endpoint=(raw={},fallback={rarity:6,awaken:0,level:0})=>{
 const rarity=clamp(raw.rarity??fallback.rarity,1,6);
 const awaken=rarity===6?clamp(raw.awaken??fallback.awaken,0,30):0;
 const max=rarity===6?30:[4,9,14,19,24,30][rarity-1];
 return {rarity,awaken,level:clamp(raw.level??fallback.level,0,max)};
};
export const endpointStage=p=>p.awaken>0?'A'+p.awaken:'T'+p.rarity;
const position=p=>(p.awaken>0?5+p.awaken:p.rarity-1)*31+p.level;
const blankItem=()=>({itemKey:'',current:{rarity:6,awaken:0,level:0},target:{rarity:6,awaken:0,level:1},observed:{primary:'',secondary:''},affixes:[]});
const normalizedItem=raw=>{
 const r=raw||{},choice=itemValue(String(r.itemKey||''));
 const initial=choice?.tier===7?{rarity:6,awaken:1,level:0}:{rarity:choice?.tier||6,awaken:0,level:0};
 const current=endpoint(r.current||{},initial);
 const target=endpoint(r.target||{},current);
 return {itemKey:choice?.key||'',current,target,observed:normalizeObserved(r.observed),affixes:normalizeAffixInputs(r.affixes)};
};
export function normalizeOptimizerSliders(raw){
 const r=raw&&typeof raw==='object'?raw:{},incoming=Array.isArray(r.items)?r.items:[];
 const items=incoming.slice(0,MAX_ITEMS).map(normalizedItem);
 const stock=r.stock&&typeof r.stock==='object'&&!Array.isArray(r.stock)?Object.fromEntries(Object.entries(r.stock).filter(([slug,v])=>/^[a-z0-9-]{1,80}$/.test(slug)&&typeof v==='string').slice(0,200).map(([slug,v])=>[slug,v.slice(0,32)])):{};
 return {costMode:['min','expected','pity'].includes(r.costMode)?r.costMode:'expected',focus:typeof r.focus==='string'?r.focus.slice(0,80):'',strategy:r.strategy==='set'?'set':'single',stock,goldStock:String(r.goldStock??'').slice(0,32),items};
}
export function readOptimizerSliders(store=globalThis.localStorage){
 try{return normalizeOptimizerSliders(JSON.parse(store?.getItem(OPTIMIZER_SLIDER_KEY)||'null'))}catch{return normalizeOptimizerSliders()}
}
export function saveOptimizerSliders(value,store=globalThis.localStorage){
 const clean=normalizeOptimizerSliders(value);
 try{store?.setItem(OPTIMIZER_SLIDER_KEY,JSON.stringify(clean))}catch{}
 return clean;
}
let state=readOptimizerSliders(),editingIndex=-1,selectingIndex=-1,pickerSlot='all',pickerQuery='';
const SLOT_ORDER=['main_hand','off_hand','chest','head','hands','feet','belt','ring','amulet','torch'];
export const optimizerBaseItemPicker=i=>{
 const matching=FAMILY_ITEMS.filter(x=>(pickerSlot==='all'||x.slot===pickerSlot)&&(!pickerQuery||[x.name,slotTitle(x.slot)].join(' ').toLowerCase().includes(pickerQuery.toLowerCase())));
 return '<section class="uoPicker" aria-label="Choose a base item"><div class="uoPickerIntro"><div><span class="uoEyebrow">IDLEARC CODEX</span><h3>Choose your base item</h3><p>One item per family. Its name and art evolve with rarity.</p></div><span class="uoFamilyCount">'+matching.length+' / '+FAMILY_ITEMS.length+'</span></div>'+
 '<label class="uoSearchLabel"><span>Find equipment</span><input type="search" data-uo-search placeholder="Search 40 base items…" value="'+esc(pickerQuery)+'" autocomplete="off"></label>'+
 '<div class="uoSlotRail" aria-label="Filter by equipment slot"><button type="button" data-uo-filter="all" aria-pressed="'+(pickerSlot==='all')+'">All</button>'+SLOT_ORDER.map(slot=>'<button type="button" data-uo-filter="'+slot+'" aria-pressed="'+(pickerSlot===slot)+'">'+esc(slotTitle(slot))+'</button>').join('')+'</div>'+
 '<div class="uoFamilyGrid">'+(matching.length?matching.map(f=>'<button type="button" class="uoFamilyTile" data-uo-family="'+esc(f.id)+'" data-uo-index="'+i+'" aria-label="Select '+esc(f.name)+'"><span class="uoFamilyArt">'+familyArtwork(f.id,{rarity:1,awaken:0})+'</span><span class="uoFamilyName">'+esc(f.name)+'</span><small>'+esc(slotTitle(f.slot))+'</small></button>').join(''):'<p class="uoPickerEmpty">No base items match that search.</p>')+'</div></section>';
};
const variantGallery=(id,i)=>'<details class="uoVariants"><summary><span>Explore all six rarities</span><small>Tap one to set your current rarity</small></summary><div class="uoVariantRail">'+[1,2,3,4,5,6].map(r=>{
 const v=familyVariant(id,{rarity:r,awaken:0});
 return '<button type="button" data-uo-rarity="'+r+'" data-uo-index="'+i+'" class="uoVariantTile"><span class="uoVariantArt uoRarity'+r+'">'+familyArtwork(id,{rarity:r,awaken:0})+'</span><strong>'+esc(TIER_LABELS[r-1])+'</strong><small>'+esc(v.name)+'</small></button>';
 }).join('')+'</div></details>';
const panelLabel=p=>p.awaken>0?'A'+p.awaken:p.rarity===6?'Infernal':'T'+p.rarity+' · '+TIER_LABELS[p.rarity-1];
const levelLabel=p=>panelLabel(p)+' +'+p.level;
const slider=(i,side,key,value,min,max,title,caption)=>{
 const id='optSlider'+i+side+key;
 return '<label class="uoSlider" for="'+id+'"><span>'+esc(title)+'</span><output data-uo-label="'+i+'-'+side+'-'+key+'">'+esc(caption)+'</output>'+
 '<input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="1" value="'+value+'" data-uo-index="'+i+'" data-uo-side="'+side+'" data-uo-field="'+key+'" aria-label="'+esc(title)+'">'+
 '</label>';
};
function endpointMarkup(i,side,point){
 const max=point.rarity===6?30:[4,9,14,19,24,30][point.rarity-1];
 const id=state.items[i]?.itemKey,variant=familyVariant(id,point);
 return '<section class="uoEndpoint"><header><strong>'+ (side==='current'?'CURRENT':'TARGET')+'</strong><span class="uoStage" data-uo-stage="'+i+'-'+side+'">'+esc(levelLabel(point))+'</span></header>'+
 '<div class="uoEndpointIdentity"><span class="uoEndpointArt uoRarity'+point.rarity+'">'+familyArtwork(id,point)+'</span><div><strong>'+esc(variant?.name||'Equipment')+'</strong><small>'+esc(variant?.tierLabel||'')+'</small></div></div>'+
 slider(i,side,'rarity',point.rarity,1,6,'Rarity',TIER_LABELS[point.rarity-1])+
 slider(i,side,'awaken',point.awaken,0,30,'Awakening rank',point.awaken?'A'+point.awaken:'None')+
 (point.rarity<6?'<p class="uoDisabledNote">Increasing awakening automatically changes rarity to Infernal.</p>':'')+
 slider(i,side,'level',point.level,0,max,'Enhancement','+'+point.level)+'</section>';
}
function quote(snapshot,item,mode=state.costMode){
 if(!item.itemKey)return {error:'Choose equipment'};
 if(!snapshot)return {error:'Loading Pathfinder recipes'};
 if(position(item.target)<position(item.current))return {error:'Target must be at or above the current upgrade.'};
 const fromStage=endpointStage(item.current),toStage=endpointStage(item.target);
 const raw=quoteRange(snapshot,{fromStage,fromLevel:item.current.level,toStage,toLevel:item.target.level,quantity:1});
 if(raw.error||!raw.complete)return {error:raw.error||'Missing verified upgrade step',raw};
 const scenarios=quoteFailureScenarios(snapshot,raw);
 const expected=scenarios.available?scenarios.expected:null,pity=scenarios.available?scenarios.pity:null;
 const result=mode==='expected'&&expected?expected:mode==='pity'&&pity?pity:{gold:raw.gold,materials:raw.materials,attempts:raw.steps};
 return {raw,result,scenarios,modeled:!!(expected&&pity),mode,stages:[fromStage,toStage]};
}
export function totalUpgradeMaterials(snapshot,items,mode='expected'){
 const maps=new Map();let gold=0n,attempts=0,errors=[],ready=0,unmodeled=[];
 for(let i=0;i<items.length;i++){
  if(!items[i].itemKey)continue;
  const q=quote(snapshot,items[i],mode);
  if(q.error){errors.push('Item '+(i+1)+': '+q.error);continue}
  ready++;gold+=q.result.gold;attempts+=q.result.attempts;
  if(mode!=='min'&&!q.modeled)unmodeled.push(i+1);
  for(const m of q.result.materials){const old=maps.get(m.slug);maps.set(m.slug,{slug:m.slug,name:m.name,quantity:(old?.quantity||0n)+m.quantity})}
 }
 return {materials:[...maps.values()],gold,attempts,ready,errors,unmodeled};
}
export function optimizerItemCard(item,i,snapshot){
 const choice=itemValue(item.itemKey),expanded=editingIndex===i;
 const id=choice?.itemId,title=familyVariant(id,item.current)?.name||'Choose equipment',route=levelLabel(item.current)+' → '+levelLabel(item.target);
 const quoteInfo=choice?quote(snapshot,item):null;
 const chosenCost=quoteInfo?.result||null;
 const breakdown=choice?projectItemBreakdown(id,item.current,item.target,item.observed,item.affixes):null;
 const first=breakdown?.implicits?.[0];
 const gainLine=first?'<div class="uoCompactOutcome"><span>'+(first.unmodeled?'Stat scaling unverified':'≈ '+(first.delta>=0?'+':'')+fmt(first.delta)+' '+esc(first.label))+'</span><small>'+esc(first.unmodeled?'Tier baseline only':first.observed?'Using your entered stat':'Range estimate')+(chosenCost?' · '+chosenCost.materials.length+' materials':'')+'</small></div>':'';
 return '<article class="uoItem'+(expanded?' uoOpen':'')+'">'+
 '<div class="uoCardLine"><span class="uoItemNum">'+(choice?'<span class="uoRowArt">'+familyArtwork(id,item.current)+'</span>':(i+1))+'</span><div class="uoCardText"><strong>'+esc(title)+'</strong><small>'+esc(choice?route:'Select a base item from the Codex')+'</small></div>'+
 '<button type="button" class="uoToggle" data-uo-action="toggle" data-uo-index="'+i+'" aria-expanded="'+expanded+'">'+(expanded?'Done':'Edit')+'</button>'+
 '<button type="button" class="uoRemove" data-uo-action="remove" data-uo-index="'+i+'" aria-label="Remove '+esc(title)+'">×</button></div>'+
 (choice&&!expanded?gainLine:'')+
 (expanded?'<div class="uoEditor">'+
 (selectingIndex===i||!choice?optimizerBaseItemPicker(i):'<div class="uoChosen"><div><span class="uoEyebrow">BASE ITEM</span><strong>'+esc(familyById(id)?.name||title)+'</strong><small>Infernal is the default starting rarity.</small></div><button type="button" data-uo-action="pick" data-uo-index="'+i+'">Change item</button></div>'+
 variantGallery(id,i)+'<div class="uoRangeGrid">'+endpointMarkup(i,'current',item.current)+endpointMarkup(i,'target',item.target)+'</div>'+
 renderStatProjection(breakdown,item,i)+renderAffixEditor(item,i,breakdown)+
 '<div class="uoCardFoot"><span>'+esc(route)+'</span>'+(quoteInfo?.error?'<small>'+esc(quoteInfo.error)+'</small>':'<strong>'+(chosenCost?.materials?.length||0)+' material types</strong>')+'</div>')+'</div>':'')+
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
 const choices=state.items.map((item,index)=>{
  if(!item.itemKey)return null;
  const q=quote(snapshot,item,state.costMode);
  if(q.error)return null;
  return {index,item,name:familyVariant(item.itemKey,item.current)?.name||familyById(item.itemKey)?.name||'Equipment',
   route:levelLabel(item.current)+' → '+levelLabel(item.target),
   breakdown:projectItemBreakdown(item.itemKey,item.current,item.target,item.observed,item.affixes),cost:q.result};
 }).filter(Boolean);
 const comparison=compareUpgradeChoices(choices,state.focus,state.stock,state.goldStock,state.strategy);
 const decisionBoard=renderDecisionBoard(comparison,state,groups);
 const monster=groups.filter(g=>g.kind!=='special'),rare=groups.filter(g=>g.kind==='special');
 const modeName={min:'Minimum',expected:'Expected',pity:'Pity maximum'}[state.costMode];
 return decisionBoard+'<section class="uoSummary"><div class="uoSummaryTop"><div><span class="uoEyebrow">COMBINED MATERIALS</span><h2>Farming list</h2><p>'+tally.ready+' item'+(tally.ready===1?'':'s')+' · '+tally.materials.length+' material types</p></div>'+
 '<label>Estimate<select data-uo-mode><option value="expected"'+(state.costMode==='expected'?' selected':'')+'>Expected</option>'+
 '<option value="min"'+(state.costMode==='min'?' selected':'')+'>Minimum</option><option value="pity"'+(state.costMode==='pity'?' selected':'')+'>Pity max</option></select></label></div>'+
 (tally.errors.length?'<div class="uoWarnings">'+tally.errors.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>':'')+
 (tally.unmodeled.length?'<p class="uoWarnings">Failure estimates unavailable for some routes. Showing minimum quantities for those items.</p>':'')+
 '<div class="uoMaterialSections">'+(monster.length?monster.map((g,i)=>materialGroup(g,i===0)).join(''):'<p class="uoEmptyMaterials">No monster materials needed.</p>')+'</div>'+
 (rare.length?'<details class="uoSpecial"><summary>Special materials <small>'+rare.reduce((a,g)=>a+g.materials.length,0)+' types</small></summary><div>'+rare.map(g=>materialGroup(g,true)).join('')+'</div></details>':'')+
 '<details class="uoMoney"><summary>Gold and upgrade attempts</summary><div><p>Gold <strong>'+summaryNumber(tally.gold)+'</strong></p><p>Attempts <strong>'+fmt(tally.attempts)+'</strong></p></div></details></section>';
}
export function upgradeOptimizerSliderView(snapshot,catalog=[]){
 const empty=state.items.length===0;
 return '<style>'+"\n.uoRoot{--uoLine:var(--line,#394250);--uoSurface:var(--panel,#1d2735);--uoDim:var(--muted,#a3b0bf);color:var(--text,#eaf2ff);max-width:960px;margin:0 auto}\n.uoRoot *{box-sizing:border-box}.uoRoot button,.uoRoot select{font:inherit}.uoHero{margin-bottom:14px}.uoEyebrow{color:var(--theme-highlight,#6fdfed);font-weight:800;font-size:10px;letter-spacing:.14em}\n.uoHero h2{font-size:clamp(22px,5vw,29px);margin:6px 0}.uoHero p{font-size:13px;color:var(--uoDim);line-height:1.55;margin:0}\n.uoActions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}.uoCount{font-size:12px;color:var(--uoDim)}.uoButtons{display:flex;gap:8px}\n.uoButtons button,.uoToggle,.uoRemove{color:inherit;border:1px solid var(--uoLine);border-radius:9px;background:var(--uoSurface);cursor:pointer;font-size:12px;min-height:40px;padding:8px 13px;font-weight:650}\n.uoButtons button:disabled{opacity:.3;cursor:default}.uoButtons .uoAdd{background:color-mix(in srgb,var(--theme-highlight,#70cfe3) 25%,var(--uoSurface));border-color:color-mix(in srgb,var(--theme-highlight,#70cfe3) 48%,var(--uoLine))}\n.uoBlank{border:1px dashed var(--uoLine);background:color-mix(in srgb,var(--uoSurface) 87%,transparent);border-radius:14px;text-align:center;padding:32px 18px}\n.uoBlankIcon{width:42px;height:42px;border-radius:12px;background:color-mix(in srgb,var(--theme-highlight,#70cfe3) 20%,var(--uoSurface));color:var(--theme-highlight,#70cfe3);display:grid;place-items:center;font-size:25px;margin:0 auto 11px}\n.uoBlank strong{font-size:16px}.uoBlank p{max-width:330px;font-size:12px;color:var(--uoDim);line-height:1.5;margin:7px auto 0}\n.uoGrid{display:grid;grid-template-columns:1fr;gap:9px}.uoItem{border:1px solid var(--uoLine);border-radius:12px;background:var(--uoSurface);overflow:hidden;min-width:0;padding:0}\n.uoCardLine{display:flex;align-items:center;gap:9px;padding:11px 13px;min-width:0}.uoItemNum{border-radius:9px;background:color-mix(in srgb,var(--theme-highlight,#70cfe3) 18%,var(--uoSurface));color:var(--theme-highlight,#70cfe3);display:grid;place-items:center;width:34px;height:34px;flex-shrink:0;font-size:14px;font-weight:850}\n.uoCardText{display:grid;gap:3px;min-width:0;flex:1}.uoCardText strong{font-size:14px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.uoCardText small{font-size:12px;color:var(--uoDim);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}\n.uoToggle{min-height:35px;padding:7px 13px}.uoRemove{min-height:35px;padding:3px 10px;font-size:21px;line-height:1}.uoEditor{border-top:1px solid var(--uoLine);padding:14px}\n.uoChoose{display:grid;gap:6px;color:var(--uoDim);font-size:12px}.uoChoose select,.uoSummaryTop select{background:color-mix(in srgb,var(--uoSurface) 88%,#fff 12%);color:inherit;border:1px solid var(--uoLine);border-radius:9px;padding:9px 10px;min-height:44px;width:100%;max-width:100%}\n.uoRangeGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:13px}.uoEndpoint{border:1px solid var(--uoLine);border-radius:11px;background:transparent;padding:12px;min-width:0}.uoEndpoint header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:7px;border-bottom:1px solid var(--uoLine);padding-bottom:10px;margin-bottom:14px}\n.uoEndpoint header strong{font-size:10px;letter-spacing:.08em;color:var(--uoDim)}.uoEndpoint header .uoStage{font-size:13px;font-weight:800;color:var(--theme-highlight,#70cfe3)}\n.uoSlider{display:block;margin:0 0 14px;font-size:12px}.uoSlider:last-child{margin-bottom:2px}.uoSlider>span{color:var(--uoDim);display:inline}.uoSlider output{float:right;color:var(--text,#eaf2ff);font-weight:800;font-size:12px}\n.uoSlider input{display:block;width:100%;margin:8px 0 0;height:26px;accent-color:var(--theme-highlight,#70cfe3);touch-action:pan-x;cursor:pointer}.uoDisabledNote{color:var(--uoDim);font-size:11px}\n.uoCardFoot{display:flex;justify-content:space-between;gap:10px;margin-top:12px;font-size:12px;color:var(--uoDim)}.uoCardFoot strong{color:var(--text,#eaf2ff)}.uoCardFoot small{color:#f8ba84}.uoHelp{font-size:12px;color:var(--uoDim)}\n.uoStats{border-top:1px solid var(--uoLine);padding-top:12px;margin-top:12px}.uoStats summary{font-size:12px;color:var(--uoDim);cursor:pointer}.uoStats>div{padding-top:7px}.uoStatRow{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:8px 0;font-size:12px}.uoStatRow strong{text-align:right}.uoStats p{font-size:11px;line-height:1.5;color:var(--uoDim)}\n.uoSummary{margin-top:17px;border:1px solid var(--uoLine);border-radius:13px;background:var(--uoSurface);padding:16px}.uoSummaryTop{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}\n.uoSummaryTop h2{font-size:21px;margin:3px 0}.uoSummaryTop p{font-size:12px;color:var(--uoDim);margin:0}.uoSummaryTop label{display:grid;gap:4px;color:var(--uoDim);font-size:11px;min-width:110px}.uoSummaryTop select{font-size:12px;min-height:38px}\n.uoMaterialSections{display:grid;gap:8px}.uoMaterialGroup{border:1px solid var(--uoLine);border-radius:10px;overflow:hidden}.uoMaterialGroup summary{padding:12px;cursor:pointer;display:flex;gap:8px;align-items:center;list-style:none}\n.uoMaterialGroup summary::-webkit-details-marker{display:none}.uoMaterialGroup summary strong{font-size:13px;flex:1}.uoMaterialGroup summary small{color:var(--uoDim);font-size:11px}.uoMaterialGroup summary>span{color:var(--uoDim)}\n.uoMaterialGroup>div{border-top:1px solid var(--uoLine)}.uoMaterial{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 12px;border-bottom:1px solid var(--uoLine)}.uoMaterial:last-child{border-bottom:0}\n.uoMaterial>span{display:grid;gap:3px;font-size:12px}.uoMaterial>span small{font-size:10px;color:var(--uoDim)}.uoMaterial>strong{font-variant-numeric:tabular-nums;font-size:13px}\n.uoSpecial,.uoMoney{margin-top:13px;border-top:1px solid var(--uoLine);padding-top:13px}.uoSpecial summary,.uoMoney summary{cursor:pointer;font-size:12px;color:var(--uoDim)}.uoSpecial summary small{margin-left:8px}.uoSpecial>div{padding-top:9px;display:grid;gap:8px}.uoMoney p{display:flex;justify-content:space-between;font-size:12px}\n.uoWarnings{font-size:12px;color:#ffd0a4}.uoEmptyMaterials{font-size:12px;color:var(--uoDim)}\n.uoRoot button:focus-visible,.uoRoot select:focus-visible,.uoRoot input:focus-visible{outline:2px solid var(--theme-highlight,#70cfe3);outline-offset:3px}\n@media(max-width:600px){.uoRangeGrid{grid-template-columns:1fr;gap:9px}.uoEditor{padding:10px}.uoEndpoint{padding:11px}.uoCardLine{padding:10px;gap:7px}.uoCardText strong{font-size:13px}.uoCardText small{font-size:11px}.uoToggle{padding:6px 10px}.uoButtons button{padding:7px 10px}.uoSummary{padding:12px}}\n"+'</style><div class="uoRoot" id="arcanaUpgradeOptimizerV2">'+
 '<div class="uoHero"><p>See projected stat and affix gains, compare competing upgrades, and find what your materials can actually afford.</p></div>'+
 '<div class="uoActions"><div class="uoCount">'+state.items.length+' / '+MAX_ITEMS+' items</div><div class="uoButtons">'+
 '<button type="button" data-uo-action="clear"'+(empty?' disabled':'')+'>Clear all</button>'+
 '<button type="button" class="uoAdd" data-uo-action="add"'+(state.items.length>=MAX_ITEMS?' disabled':'')+'>+ Add equipment</button></div></div>'+
 (empty?'<section class="uoBlank"><div class="uoBlankIcon">+</div><strong>No equipment added</strong><p>Add your first item to plan upgrades. No examples or pre-filled entries.</p></section>':
 '<div class="uoGrid">'+state.items.map((item,i)=>optimizerItemCard(item,i,snapshot)).join('')+'</div>'+totals(snapshot,catalog))+
 '</div>';
}
let getContext=()=>({snapshot:null,catalog:[]}),installed=false;
const redraw=()=>{
 const root=document.getElementById('arcanaUpgradeOptimizerV2');
 if(!root)return;
 const opened=[...root.querySelectorAll('details[data-uo-panel][open]')].map(x=>x.dataset.uoPanel);
 const scroll=window.scrollY;
 const {snapshot,catalog}=getContext(),markup=upgradeOptimizerSliderView(snapshot,catalog);
 // Replace the complete component, preserving its styles, without rerouting the page.
 const head=markup.indexOf('<div class="uoRoot"');
 root.outerHTML=markup.slice(head);
 const replacement=document.getElementById('arcanaUpgradeOptimizerV2');
 for(const id of opened){const detail=[...replacement.querySelectorAll('details[data-uo-panel]')].find(x=>x.dataset.uoPanel===id);if(detail)detail.open=true;}
 if(Math.abs(window.scrollY-scroll)>4)window.scrollTo({top:scroll,behavior:'instant'});
};
export function wireUpgradeOptimizerSliders(context){
 getContext=context;
 if(installed)return;
 installed=true;
 if(typeof document!=='undefined'&&!document.getElementById('arcanaOptimizerStyles')){
  const link=document.createElement('link');link.id='arcanaOptimizerStyles';link.rel='stylesheet';link.href='/upgrade-optimizer.css?v=decision-studio-20261024';document.head.append(link);
 }
 document.addEventListener('input',event=>{
  const input=event.target;
  if(!input.closest('#arcanaUpgradeOptimizerV2'))return;
  if(input.matches('input[data-uo-search]')){
   pickerQuery=input.value;
   const cursor=input.selectionStart;
   redraw();
   const next=document.querySelector('#arcanaUpgradeOptimizerV2 [data-uo-search]');
   if(next){next.focus({preventScroll:true});next.setSelectionRange(cursor,cursor)}
   return;
  }
  if(!input.matches('input[data-uo-field]'))return;
  const {uoIndex,uoSide,uoField}=input.dataset;
  const raw=Number(input.value);
  const label=document.querySelector('[data-uo-label="'+uoIndex+'-'+uoSide+'-'+uoField+'"]');
  if(label)label.textContent=uoField==='rarity'?TIER_LABELS[raw-1]:uoField==='awaken'?(raw?'A'+raw:'None'):'+'+raw;
 });
 document.addEventListener('change',event=>{
  const input=event.target,root=input.closest('#arcanaUpgradeOptimizerV2');
  if(!root)return;
  if(input.matches('[data-uo-mode]'))state.costMode=input.value;
  else if(input.matches('[data-uo-focus]'))state.focus=input.value;
  else if(input.matches('[data-uo-strategy]'))state.strategy=input.value;
  else if(input.matches('[data-uo-stock]'))state.stock[input.dataset.uoStock]=input.value;
  else if(input.matches('[data-uo-gold-stock]'))state.goldStock=input.value;
  else if(input.matches('[data-uo-observed]')){
   const entry=state.items[Number(input.dataset.uoIndex)];if(!entry)return;
   if(!['primary','secondary'].includes(input.dataset.uoObserved))return;
   entry.observed[input.dataset.uoObserved]=input.value;
  }else if(input.matches('[data-uo-affix]')){
   const entry=state.items[Number(input.dataset.uoIndex)],slot=Number(input.dataset.uoAffixIndex);
   if(!entry?.affixes[slot])return;
   if(input.dataset.uoAffix==='id')entry.affixes[slot].id=Number(input.value);
   else if(input.dataset.uoAffix==='value')entry.affixes[slot].value=input.value;
   else return;
  }
  else if(input.matches('input[data-uo-field]')){
   const entry=state.items[Number(input.dataset.uoIndex)];if(!entry)return;
   const side=input.dataset.uoSide,field=input.dataset.uoField;
   if(!['current','target'].includes(side)||!['rarity','awaken','level'].includes(field))return;
   const point={...entry[side],[field]:Number(input.value)};
   if(field==='rarity'&&point.rarity<6)point.awaken=0;
   if(field==='awaken'&&point.awaken>0)point.rarity=6;
   entry[side]=endpoint(point);
   if(side==='current'&&position(entry.target)<position(entry.current))entry.target={...entry.current};
  }else return;
  state=saveOptimizerSliders(state);redraw();
 });
 document.addEventListener('click',event=>{
  const familyButton=event.target.closest('[data-uo-family]');
  if(familyButton?.closest('#arcanaUpgradeOptimizerV2')){
   const entry=state.items[Number(familyButton.dataset.uoIndex)];
   if(!entry||!familyById(familyButton.dataset.uoFamily))return;
   entry.itemKey=familyButton.dataset.uoFamily;
   entry.current={rarity:6,awaken:0,level:0};
   entry.target={rarity:6,awaken:0,level:1};
   entry.observed={primary:'',secondary:''};entry.affixes=[];
   selectingIndex=-1;pickerQuery='';pickerSlot='all';
   state=saveOptimizerSliders(state);redraw();return;
  }
  const filterButton=event.target.closest('[data-uo-filter]');
  if(filterButton?.closest('#arcanaUpgradeOptimizerV2')){
   pickerSlot=filterButton.dataset.uoFilter;redraw();return;
  }
  const rarityButton=event.target.closest('[data-uo-rarity]');
  if(rarityButton?.closest('#arcanaUpgradeOptimizerV2')){
   const entry=state.items[Number(rarityButton.dataset.uoIndex)];if(!entry)return;
   entry.current=endpoint({...entry.current,rarity:Number(rarityButton.dataset.uoRarity),awaken:0});
   if(position(entry.target)<position(entry.current))entry.target={...entry.current};
   state=saveOptimizerSliders(state);redraw();return;
  }
  const button=event.target.closest('[data-uo-action]');
  if(!button||!button.closest('#arcanaUpgradeOptimizerV2'))return;
  const action=button.dataset.uoAction,index=Number(button.dataset.uoIndex);
  if(action==='add'&&state.items.length<MAX_ITEMS){
   state.items.push(blankItem());editingIndex=state.items.length-1;selectingIndex=editingIndex;pickerQuery='';pickerSlot='all';
  }else if(action==='clear'){
   state.items=[];editingIndex=-1;selectingIndex=-1;pickerQuery='';pickerSlot='all';
  }else if(action==='toggle'){
   editingIndex=editingIndex===index?-1:index;
  }else if(action==='pick'){
   editingIndex=index;selectingIndex=index;pickerQuery='';pickerSlot='all';
  }else if(action==='add-affix'&&state.items[index]?.itemKey){
   const entry=state.items[index],slots=maxAffixSlots(entry.current);
   if(entry.affixes.length>=slots)return;
   entry.affixes.push({id:0,value:''});
  }else if(action==='remove-affix'&&state.items[index]?.affixes){
   const slot=Number(button.dataset.uoAffixIndex);
   if(!Number.isInteger(slot)||slot<0||slot>=state.items[index].affixes.length)return;
   state.items[index].affixes.splice(slot,1);
  }else if(action==='zero-stock'){
   for(const field of document.querySelectorAll('#arcanaUpgradeOptimizerV2 [data-uo-stock]')){
    if(parseStatAmount(state.stock[field.dataset.uoStock])===null)state.stock[field.dataset.uoStock]='0';
   }
  }else if(action==='reset-stock'){
   state.stock={};state.goldStock='';
  }else if(action==='remove'&&index>=0&&index<state.items.length){
   state.items.splice(index,1);
   if(editingIndex===index)editingIndex=-1;
   else if(editingIndex>index)editingIndex--;
   if(selectingIndex===index)selectingIndex=-1;
   else if(selectingIndex>index)selectingIndex--;
  }else return;
  state=saveOptimizerSliders(state);redraw();
 });
}
