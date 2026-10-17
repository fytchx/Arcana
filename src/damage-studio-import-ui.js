import {readBuildStudioDamage,buildStudioScenarioChanges} from './damage-build-studio-bridge.js';

const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
function output(baseline){
 const parsed=readBuildStudioDamage();
 const projection=buildStudioScenarioChanges(parsed,baseline);
 const headline=parsed.title||'No saved Build Studio draft';
 let html='<div class="dcStudioHeading"><div><strong>'+safe(headline)+'</strong><small>'+safe(parsed.className||'Build Studio local draft')+
  ' · '+parsed.slotCount+' equipped slots · '+parsed.rollCount+' exact supported rolls</small></div>'+
  '<button type="button" class="btn secondary" data-dc-studio-reload>Refresh saved build</button></div>';
 if(parsed.blockers.length){
  html+='<p class="dcStudioWarning" role="status">Import cannot be applied until these issues are fixed in Build Studio:</p><ul>'+
   parsed.blockers.map(s=>'<li>'+safe(s)+'</li>').join('')+'</ul>';
 }
 if(parsed.skipped.length){
  html+='<details class="dcStudioDetails"><summary>'+parsed.skipped.length+' non-damage / unsupported bonuses excluded</summary><ul>'+
    parsed.skipped.map(x=>'<li>'+safe(x.slot+': '+x.bonus+' · '+x.reason)+'</li>').join('')+'</ul></details>';
 }
 if(parsed.rows.length){
  html+='<div class="dcStudioRows">'+parsed.rows.map(row=>'<article><div><strong>'+safe(row.channel)+'</strong><small>'+safe(row.path)+
   '</small></div><b>+'+fmt(row.total)+'%</b><details class="dcStudioDetails"><summary>See '+row.parts.length+
   ' item roll'+(row.parts.length===1?'':'s')+'</summary><ul>'+row.parts.map(p=>'<li>'+safe(p.slot+': '+p.item)+
   ' · '+safe(p.bonus)+' +'+fmt(p.roll)+'% (tier '+fmt(p.tier)+')</li>').join('')+'</ul></details></article>').join('')+'</div>';
 }
 if(parsed.known&&projection.ok){
  html+='<p class="dcValidation">Exact equipment subtotal changes will <b>replace</b> the matching fields in your what-if scenario. Screenshot totals will not be added twice. Unrelated Attack/Pet, skill, rune and pet-source bonuses are untouched.</p>'+
    '<button type="button" class="btn primary dcStudioApply" data-dc-studio-apply>Apply '+parsed.rows.length+
     ' verified equipment subtotal'+(parsed.rows.length===1?'':'s')+' to what-if</button>';
 }else if(!parsed.blockers.length){
  html+='<p class="dcValidation">No supported exact damage rolls found. Save an item with a verified exact roll in Build Studio, then refresh.</p>';
 }
 html+='<p class="dcValidation">Game reference: October 9 equipment bonus tiers. This is an offline transfer of your own saved Arcana draft, not a live character import. Values without actual rolls are never guessed. In-game release changes may require rechecking.</p>';
 return html;
}
export function damageStudioImportView(){
 return '<style>'+
 '.dcRoot .dcStudioImport{border:1px solid #7775;background:#6f638215;border-radius:14px;padding:15px}'+
 '.dcRoot .dcStudioHeading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}'+
 '.dcRoot .dcStudioHeading>div{display:grid;gap:5px;min-width:0}'+
 '.dcRoot .dcStudioHeading small{font-size:12px;opacity:.75}'+
 '.dcRoot .dcStudioImport button{min-height:44px}'+
 '.dcRoot .dcStudioImport ul{padding-left:22px;font-size:13px;line-height:1.7;overflow-wrap:anywhere}'+
 '.dcRoot .dcStudioWarning{padding:12px;border:1px solid #dfaa6e66;border-radius:10px}'+
 '.dcRoot .dcStudioRows{display:grid;gap:12px;margin:16px 0}'+
 '.dcRoot .dcStudioRows article{border:1px solid #7775;border-radius:12px;padding:12px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}'+
 '.dcRoot .dcStudioRows article>div{display:grid;gap:6px}'+
 '.dcRoot .dcStudioRows article>div small{overflow-wrap:anywhere;opacity:.75}'+
 '.dcRoot .dcStudioRows b{white-space:nowrap}'+
 '.dcRoot .dcStudioDetails{grid-column:1/-1}.dcRoot .dcStudioDetails summary{cursor:pointer;min-height:44px;padding:10px 0}'+
 '.dcRoot .dcStudioApply{margin:12px 0;width:100%}'+
 '@media(max-width:420px){.dcRoot .dcStudioHeading>button{width:100%}}'+
 '</style><section data-dc-panel="studio" class="dcStudioImport" id="dcStudioImport" hidden>'+
 '<h3>Build Studio → Damage Calculator</h3>'+
 '<p class="dcIntro">Import only <b>known exact item rolls</b> from your saved Build Studio equipment. No need to rebuild the same gear twice. Review first, then explicitly apply to a what-if scenario.</p>'+
 '<div id="dcStudioImportContent" aria-live="polite"></div>'+
 '<button class="btn secondary" type="button" data-route="labs/build">Open Build Studio</button></section>';
}
export function mountDamageStudioImport(root,getBaseline){
 const panel=root?.querySelector('#dcStudioImport');
 if(!panel||panel.dataset.dcStudioMounted==='yes')return;
 panel.dataset.dcStudioMounted='yes';
 const refresh=()=>{
  const target=panel.querySelector('#dcStudioImportContent');
  if(target)target.innerHTML=output(getBaseline());
 };
 refresh();
 panel.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b)return;
  if(b.hasAttribute('data-dc-studio-reload')){refresh();return;}
  if(!b.hasAttribute('data-dc-studio-apply'))return;
  // Ignore DOM-supplied values; calculate from current saved source again.
  const latest=readBuildStudioDamage();
  const candidate=buildStudioScenarioChanges(latest,getBaseline());
  if(!candidate.ok)return refresh();
  panel.dispatchEvent(new CustomEvent('dc-apply-studio-equipment',{
   bubbles:true,detail:{paths:Object.keys(candidate.changes)},
  }));
  refresh();
 });
 return refresh;
}
export function refreshDamageStudioImport(root,getBaseline){
 const panel=root?.querySelector('#dcStudioImport');
 if(panel?.dataset.dcStudioMounted==='yes'){
  const target=panel.querySelector('#dcStudioImportContent');
  if(target)target.innerHTML=output(getBaseline());
 }
}
