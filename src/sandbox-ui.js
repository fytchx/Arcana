
/**
 * Player-facing character sandbox. Build Studio owns the working character;
 * this panel owns an immutable Starting Point + explicit named variants.
 * No game API, personal fixture, or speculative DPS is loaded here.
 */
import {loadDraft} from './session.js';
import {emptySandboxCharacter,normalizeSandboxCharacter,normalizeSandboxWorkspace,
 sandboxCharacterSummary,compareSandboxCharacters,saveSandboxStartingPoint,
 saveSandboxVariant,deleteSandboxVariant} from './sandbox-character.js';
import {TALISMAN_TYPES} from './talisman-reference.js';

const STORE='arcana:sandbox:workspace:v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const renderText=(x)=>esc(x);
let activeView='character',notice='';
function read(){
 try{return normalizeSandboxWorkspace(JSON.parse(localStorage.getItem(STORE)||'null'));}catch{return normalizeSandboxWorkspace();}
}
function write(w){
 try{localStorage.setItem(STORE,JSON.stringify(normalizeSandboxWorkspace(w)));return true;}
 catch{notice='Could not save variants on this device. Check browser storage limits.';return false;}
}
const active=()=>normalizeSandboxCharacter(loadDraft()||emptySandboxCharacter());
const classLabel=v=>esc(v||'Warrior');
function choose(w){
 if(w.compareId==='original')return w.original?{name:'Starting Point',character:w.original}:null;
 const item=w.variants.find(v=>v.id===w.compareId);
 return item?{name:item.name,character:item.character}:w.original?{name:'Starting Point',character:w.original}:null;
}
function itemText(item){
 if(!item)return 'Empty';
 if(typeof item==='string')return item;
 if(typeof item==='object')return [item.name||item.title||item.id||'Configured item',
   item.rarity?'rarity '+item.rarity:null].filter(Boolean).join(' · ');
 return 'Configured';
}
function changeDetail(row){
 const desc=value=>{
  if(value===null)return 'Empty';
  if(row.category==='gear')return itemText(value);
  if(row.category==='talismans')return value?.slug?
   (TALISMAN_TYPES.find(t=>t.slug===value.slug)?.name||value.slug)+
     (value.level===null?'':' · Lv '+value.level):'Empty';
  if(row.category==='pets')return value?.equipped?
   [value.name||'Equipped pet',value.hatchBonus||''].filter(Boolean).join(' · '):'Empty';
  if(row.category==='character')return String(value||'Not selected');
  return 'Configuration changed';
 };
 return '<span>'+esc(desc(row.before))+'</span><b aria-label="Changed to">→</b><strong>'+esc(desc(row.after))+'</strong>';
}
const tab=(id,title)=>'<button type="button" data-sb-tab="'+id+'" role="tab" aria-selected="'+(activeView===id)+'" class="'+(activeView===id?'isActive':'')+'">'+title+'</button>';
function characterView(build,w){
 const summary=sandboxCharacterSummary(build);
 const selection=choose(w);
 return '<div class="sbIntroCard"><div><span class="sbEyebrow">CURRENT WORKING CHARACTER</span>'+
  '<h3>'+esc(summary.title)+'</h3><p>'+classLabel(summary.className)+' · ML '+summary.monsterLevel+
  ' · '+summary.knownInputCount+' entered damage values</p></div>'+
  '<button type="button" class="btn primary" data-route="labs/build">Edit My Character</button></div>'+
  '<div class="sbStats">'+[
    ['Equipment',summary.equipment,'labs/build'],['Pets',summary.pets,'labs/pets'],
    ['Runes',summary.runes,'labs/runes'],['Talismans',summary.talismans,'labs/build']
   ].map(([label,count,route])=>'<button type="button" data-route="'+route+'"><strong>'+count+'</strong><span>'+label+'</span></button>').join('')+'</div>'+
  '<p class="sbNote">Fill in only what you know. Your Sandbox uses the same saved character as Build Studio. Unknown bonuses stay unknown.</p>'+
  '<div class="sbStart"><div><strong>Starting Point</strong><p>'+
  (w.original?'Protected copy: '+esc(w.original.title||'Saved character')+'. Editing the working copy will not alter it.':
   'No starting point saved. Save one before experimenting so you can always return.')+
  '</p></div><button type="button" class="btn secondary" data-sb-action="original">'+
  (w.original?'Replace Starting Point':'Save Starting Point')+'</button>'+
  (w.original?'<button type="button" class="btn secondary" data-sb-action="restore-original">Restore</button>':'')+'</div>'+
  '<div class="sbVariants"><h4>Saved Variants <small>'+w.variants.length+'/12</small></h4>'+
  '<div class="sbSaveRow"><input type="text" maxlength="80" data-sb-name aria-label="New variant name" placeholder="e.g. More Strength, different pet setup"><button class="btn primary" type="button" data-sb-action="save">Save Variant</button></div>'+
  (w.variants.length?w.variants.map(v=>'<div class="sbVariantRow"><div><strong>'+esc(v.name)+'</strong><small>'+
   classLabel(v.character.className)+' · '+new Date(v.createdAt||0).toLocaleDateString('en-US')+'</small></div>'+
  '<button class="btn secondary" type="button" data-sb-action="compare" data-sb-id="'+esc(v.id)+'">Compare</button>'+
  '<button class="btn secondary" type="button" data-sb-action="restore" data-sb-id="'+esc(v.id)+'">Use</button>'+
  '<button class="btn secondary" type="button" data-sb-action="delete" data-sb-id="'+esc(v.id)+'" aria-label="Delete '+esc(v.name)+'">✕</button></div>').join(''):
  '<p class="sbNote">Save a variant after making changes to keep that experiment for later.</p>')+
  '</div>'+(selection?'<p class="sbNote">Comparison reference: <b>'+esc(selection.name)+'</b>. <button class="sbTextButton" type="button" data-sb-tab="results">View differences →</button></p>':'');
}
const CATEGORY_ACTIONS=[
 ['⚔️','Equipment','Items, rarity, upgrades and rolls','labs/build'],
 ['🐾','Pets','Hatch bonuses, affixes and Compound','labs/pets'],
 ['✨','Class Skills','Spend or move skill points','labs/skills'],
 ['🌳','Passives','Reallocate the passive tree','labs/passives'],
 ['💎','Runes','Edit placements and bonuses','labs/runes'],
 ['🔮','Talismans','Types, levels and inscriptions','labs/build'],
];
function experimentView(w){
 return '<h3>What would you like to change?</h3><p class="sbNote">Edit the working character, then return here to compare it with a saved Starting Point or Variant. Nothing changes the protected reference until you explicitly save over it.</p>'+
  '<div class="sbChoices">'+CATEGORY_ACTIONS.map(([icon,title,detail,route])=>
   '<button type="button" data-route="'+route+'"><span class="sbChoiceIcon">'+icon+'</span><span><strong>'+title+'</strong><small>'+detail+'</small></span><b>›</b></button>').join('')+
   '<button type="button" data-sb-action="advanced" data-sb-target="attack"><span class="sbChoiceIcon">📊</span><span><strong>Individual Stats</strong><small>Enter any known values or multipliers</small></span><b>›</b></button></div>'+
  '<div class="sbSaveRow"><input type="text" maxlength="80" data-sb-name aria-label="Variant name" placeholder="Name this experiment"><button type="button" class="btn primary" data-sb-action="save">Save this version</button></div>'+
  (!w.original?'<p class="sbWarning">Save your original character under My Character before experimenting if you want a reliable restoration point.</p>':'');
}
const pretty={stats:'Manual damage observations',gear:'Equipment',talismans:'Talismans',pets:'Pets',skills:'Skills',runes:'Runes',passives:'Passives',character:'Character'};
function resultsView(build,w){
 const selected=choose(w);
 if(!selected)return '<h3>Your experiment results</h3><div class="sbEmpty">'+
  '<p>Save a Starting Point or Variant to compare against your current working character.</p>'+
  '<button class="btn primary" type="button" data-sb-tab="character">Set up your starting point</button></div>';
 const report=compareSandboxCharacters(selected.character,build);
 return '<h3>Experiment results</h3><p class="sbNote"><b>'+esc(selected.name)+'</b> → <b>Working Character</b></p>'+
  '<label class="sbSelectLabel">Compare against<select data-sb-compare>'+
   (w.original?'<option value="original" '+(w.compareId==='original'?'selected':'')+'>Starting Point</option>':'')+
   w.variants.map(v=>'<option value="'+esc(v.id)+'" '+(w.compareId===v.id?'selected':'')+'>'+esc(v.name)+'</option>').join('')+'</select></label>'+
  (!report.hasChanges?'<div class="sbEmpty">No changes detected. Edit the character or select another variant.</div>':
  '<div class="sbResultIntro"><strong>'+report.changes.length+' changed source'+(report.changes.length===1?'':'s')+'</strong><small>Changed systems: '+report.changedCategories.map(c=>pretty[c]||c).join(', ')+'</small></div>'+
  '<div class="sbChangeList">'+report.changes.slice(0,22).map(row=>
   '<div class="sbChange"><div><small>'+esc(pretty[row.category]||row.category)+'</small><strong>'+esc(row.label)+'</strong></div>'+
   '<div class="sbChangeCompare">'+changeDetail(row)+'</div></div>').join('')+
  (report.changes.length>22?'<p class="sbNote">+'+(report.changes.length-22)+' more changed sources in this character.</p>':'')+'</div>')+
  (report.talismans.rows.filter(r=>r.delta!==null&&r.delta!==0).length?
  '<details class="sbSourceDetails"><summary>Verified talisman contribution changes</summary>'+
  report.talismans.rows.filter(r=>r.delta!==null&&r.delta!==0).map(row=>
   '<p>'+esc(row.label)+': '+(row.delta>0?'+':'')+format(row.delta)+esc(row.suffix||'')+' (source contribution)</p>').join('')+'</details>':'')+
  (report.knownNumberCount?'<section class="sbCalcOut"><h4>Changed manual damage inputs</h4>'+
   Object.entries(report.numbers).filter(([,value])=>value!==null).map(([stat,value])=>
    '<p>'+esc(({attack:'Attack range minimum',petMultiplier:'Pet multiplier',retaliation:'Retaliation maximum'})[stat])+': <strong>'+(value>0?'+':'')+
    format(value)+'%</strong></p>').join('')+
   '<small>These compare explicitly entered damage-stage inputs, not effects inferred from a gear swap.</small></section>':
   '<section class="sbCalcOut"><h4>Full damage impact: not yet measured</h4><p>We can show the character changes without inventing DPS. Supply the relevant game breakdown values or use Advanced Damage Controls for a source-level estimate.</p></section>')+
  (report.warning?'<p class="sbWarning">'+esc(report.warning)+'</p>':'')+
  '<button type="button" class="btn secondary" data-sb-action="advanced" data-sb-target="attack">Open detailed damage calculations</button>';
}
function render(root){
 if(!root)return;
 const w=read(),build=active();
 root.innerHTML='<div class="sbHeader"><span class="sbEyebrow">ARCANA LABS · CHARACTER SANDBOX</span>'+
  '<h2>Experiment with your character</h2><p>One character. Unlimited ideas. Enter only the parts you know.</p></div>'+
  '<div class="sbTabbar" role="tablist" aria-label="Sandbox workflow">'+tab('character','My Character')+
   tab('experiment','Experiment')+tab('results','Results')+'</div>'+
  '<div class="sbPane" role="tabpanel">'+
   (activeView==='character'?characterView(build,w):activeView==='experiment'?experimentView(w):resultsView(build,w))+'</div>'+
  (notice?'<p class="sbMessage" role="status">'+esc(notice)+'</p>':'')+
  '<p class="sbFoot">Sandbox variants live on this device until explicitly shared or saved to your account. No official IdleArc API is connected.</p>';
}
export function sandboxWorkspaceView(){
 return '<section id="arcanaSandbox" class="arcanaSandbox" aria-label="Character sandbox">'+
  '<style>'+css+'</style><div class="sbInitial">Loading local sandbox…</div></section>';
}
export function mountSandboxWorkspace(calculatorRoot){
 const root=calculatorRoot?.querySelector('#arcanaSandbox');
 if(!root||root.dataset.mounted==='yes')return;
 root.dataset.mounted='yes';render(root);
 root.addEventListener('change',e=>{
  const select=e.target.closest('[data-sb-compare]');if(!select)return;
  const w=read();w.compareId=select.value;write(w);notice='';render(root);
 });
 root.addEventListener('click',e=>{
  const tab=e.target.closest('[data-sb-tab]');
  if(tab){activeView=tab.dataset.sbTab;notice='';render(root);return;}
  const btn=e.target.closest('[data-sb-action]');
  if(!btn)return;
  const action=btn.dataset.sbAction,w=read(),build=active(),target=btn.dataset.sbId;
  if(action==='advanced'){
   const detail=calculatorRoot.querySelector('#dcAdvancedControls');
   if(detail){detail.open=true;const chosen=btn.dataset.sbTarget||'attack';
    const selection=detail.querySelector('[data-dc-tab="'+chosen+'"]');if(selection)selection.click();
    detail.scrollIntoView({behavior:'smooth',block:'start'});}
   return;
  }
  if(action==='original'){
   if(w.original&&!confirm('Replace your saved Starting Point with your CURRENT working character? This cannot be undone.'))return;
   write(saveSandboxStartingPoint(w,build));notice='Starting Point saved. Your working character is unchanged.';
  }
  if(action==='save'){
   const name=root.querySelector('[data-sb-name]')?.value.trim()||build.title+' variant';
   const result=saveSandboxVariant(w,build,name);
   if(!result.ok){notice=result.error;render(root);return;}
   write(result.workspace);notice='Saved variant: '+result.variant.name;
  }
  if(action==='compare'){
   w.compareId=target;write(w);activeView='results';notice='';
  }
  if(action==='delete'){
   const v=w.variants.find(x=>x.id===target);if(!v||!confirm('Delete saved variant "'+v.name+'"?'))return;
   write(deleteSandboxVariant(w,target));notice='Variant deleted. Your working character is unchanged.';
  }
  if(action==='restore-original'||action==='restore'){
   const v=action==='restore-original'?w.original:w.variants.find(x=>x.id===target)?.character;
   if(!v)return;
   if(!confirm('Replace your current working character with this saved snapshot? Save your current version as a Variant first if needed.'))return;
   notice='';window.dispatchEvent(new CustomEvent('arcana:sandbox-adopt',{detail:{character:normalizeSandboxCharacter(v)}}));
   return;
  }
  render(root);
 });
}
export function refreshSandboxWorkspace(calculatorRoot){
 const root=calculatorRoot?.querySelector('#arcanaSandbox');if(root?.dataset.mounted==='yes')render(root);
}
const css=`
.arcanaSandbox{max-width:980px;margin:0 auto 20px;min-width:0;color:var(--text,#f6f0ff)}
.arcanaSandbox .sbHeader{padding:12px 2px 2px}.arcanaSandbox .sbHeader h2{font-size:clamp(23px,5vw,34px);margin:8px 0;font-weight:850;line-height:1.12}.arcanaSandbox .sbHeader p{opacity:.76;margin:6px 0 20px}
.arcanaSandbox .sbEyebrow{letter-spacing:.1em;font-size:11px;text-transform:uppercase;opacity:.72}
.arcanaSandbox .sbTabbar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:5px;border:1px solid #807c9b44;background:#8b80a117;border-radius:15px;margin-bottom:16px}
.arcanaSandbox .sbTabbar button{min-width:0;min-height:46px;padding:8px 4px;border:0;border-radius:10px;background:transparent;color:inherit;font:inherit;font-size:clamp(12px,3.3vw,15px);font-weight:750}
.arcanaSandbox .sbTabbar button.isActive{background:var(--accent,#ac93ec);color:#151222}
.arcanaSandbox .sbPane{min-width:0}.arcanaSandbox .sbPane h3{font-size:clamp(17px,4vw,23px);margin:3px 0 12px}
.arcanaSandbox .sbIntroCard{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;background:#6f638221;border:1px solid #7775;border-radius:16px;padding:17px;margin-bottom:12px}
.arcanaSandbox .sbIntroCard h3{margin:6px 0}.arcanaSandbox .sbIntroCard p{font-size:13px;opacity:.8;margin:4px 0}
.arcanaSandbox .sbStats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.arcanaSandbox .sbStats button{color:inherit;background:#6f638219;border:1px solid #7775;border-radius:12px;min-height:70px;padding:10px;display:grid;gap:3px;text-align:left}.arcanaSandbox .sbStats strong{font-size:25px}.arcanaSandbox .sbStats span{font-size:12px;opacity:.78}
.arcanaSandbox .sbNote,.arcanaSandbox .sbFoot{font-size:13px;line-height:1.55;opacity:.78}
.arcanaSandbox .sbStart,.arcanaSandbox .sbVariants{border:1px solid #7775;border-radius:14px;padding:15px;margin-top:14px;background:#6f638212}
.arcanaSandbox .sbStart{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.arcanaSandbox .sbStart>div{flex:1;min-width:190px}.arcanaSandbox .sbStart p{font-size:12px;line-height:1.5;margin:5px 0;opacity:.78}
.arcanaSandbox .sbVariants h4{margin:0 0 12px;display:flex;justify-content:space-between;gap:10px}.arcanaSandbox .sbVariants small{opacity:.68}
.arcanaSandbox .sbSaveRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin:10px 0 14px}.arcanaSandbox .sbSaveRow input,.arcanaSandbox .sbSelectLabel select{min-width:0;width:100%;min-height:44px;padding:9px 11px;border-radius:9px;background:#15131e;color:inherit;border:1px solid #8887a366;font-size:16px}
.arcanaSandbox .sbVariantRow{display:flex;align-items:center;gap:7px;border-top:1px solid #7774;padding:10px 0;flex-wrap:wrap}.arcanaSandbox .sbVariantRow>div{display:grid;gap:4px;flex:1;min-width:120px}.arcanaSandbox .sbVariantRow small{font-size:11px}.arcanaSandbox .sbVariantRow button{min-height:40px}
.arcanaSandbox .sbTextButton{border:0;background:transparent;color:var(--accent,#bca4f4);text-decoration:underline;font:inherit;cursor:pointer}
.arcanaSandbox .sbChoices{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr));gap:9px;margin:16px 0}
.arcanaSandbox .sbChoices button{display:flex;gap:12px;align-items:center;text-align:left;color:inherit;background:#6f638219;border:1px solid #7775;border-radius:12px;padding:14px;min-height:84px}.arcanaSandbox .sbChoices button>span:nth-child(2){display:grid;gap:5px;flex:1;min-width:0}.arcanaSandbox .sbChoices strong{font-size:15px}.arcanaSandbox .sbChoices small{font-size:12px;opacity:.75;line-height:1.35}.arcanaSandbox .sbChoiceIcon{font-size:25px}.arcanaSandbox .sbChoices b{font-size:26px;font-weight:400;opacity:.65}
.arcanaSandbox .sbEmpty,.arcanaSandbox .sbResultIntro,.arcanaSandbox .sbCalcOut{border:1px solid #7775;border-radius:13px;padding:15px;margin:12px 0;background:#6f638217}.arcanaSandbox .sbResultIntro{display:grid;gap:5px}.arcanaSandbox .sbResultIntro small,.arcanaSandbox .sbCalcOut small{font-size:12px;line-height:1.5;opacity:.76}
.arcanaSandbox .sbSelectLabel{display:grid;gap:6px;font-size:12px;max-width:450px;margin-bottom:12px}
.arcanaSandbox .sbChange{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #7774}.arcanaSandbox .sbChange>div:first-child{display:grid;gap:5px;flex:1;min-width:130px}.arcanaSandbox .sbChange small{opacity:.68;font-size:11px}.arcanaSandbox .sbChangeCompare{display:flex;align-items:center;justify-content:flex-end;gap:9px;min-width:0;max-width:100%;font-size:12px;text-align:right;overflow-wrap:anywhere}.arcanaSandbox .sbChangeCompare span{opacity:.65}.arcanaSandbox .sbChangeCompare strong{color:#9ee2ae}
.arcanaSandbox .sbWarning{font-size:12px;line-height:1.55;color:var(--text,#f3dc9f);border-left:3px solid #c79c4c;background:#b8892714;padding:11px}
.arcanaSandbox .sbSourceDetails{padding:12px;margin:12px 0;border:1px solid #7775;border-radius:12px}.arcanaSandbox .sbSourceDetails summary{cursor:pointer}.arcanaSandbox .sbSourceDetails p{font-size:12px;margin:8px 0}
.arcanaSandbox .sbMessage{border-left:3px solid #84d8af;background:#68b78520;padding:9px 12px;font-size:13px;line-height:1.5}
.arcanaSandbox .sbFoot{border-top:1px solid #7774;padding-top:12px;margin-top:19px}
@media(max-width:450px){.arcanaSandbox .sbStats{grid-template-columns:repeat(2,minmax(0,1fr))}.arcanaSandbox .sbSaveRow{grid-template-columns:1fr}.arcanaSandbox .sbSaveRow button{width:100%}.arcanaSandbox .sbChangeCompare{justify-content:flex-start;text-align:left;flex:1;min-width:100%}}
`;
