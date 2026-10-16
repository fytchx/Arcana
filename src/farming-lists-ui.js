import {esc,icon} from './ui.js';

const state={rows:[],loaded:false,busy:false,error:''};
const api=async(path,opts={})=>{
 const r=await fetch(path,{credentials:'same-origin',cache:'no-store',...opts});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(data.error||'Could not save your farming checklist.');
 return data;
};
const date=s=>s?new Date(s).toLocaleDateString():'';
export async function loadFarmingLists({refresh}={}){
 try{const data=await api('/api/account/farming-lists');state.rows=data.lists||[];state.error='';}
 catch(e){state.error=e.message;state.rows=[];}
 state.loaded=true;
 if(refresh)refresh();
}
export async function saveFarmingList(list){
 const r=await api('/api/account/farming-lists',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({list})});
 state.rows.unshift(r.list);state.loaded=true;state.error='';
 return r.list;
}
export function farmListsAccountView(){
 return '<section class="accountFarmLists" aria-label="Saved Pathfinder farming checklists">'+
 '<div class="accountCloudHead"><div><span class="eyebrow">PRIVATE · YOUR ACCOUNT</span><h2>My farming checklists</h2><p>Save material totals from Pathfinder, then check each material off as you farm. Your progress stays with your Discord account across PC and mobile.</p></div></div>'+
 '<div class="communityPostActions"><button type="button" class="btn secondary" data-farm-list-action="refresh">'+icon('clock',16)+' Refresh lists</button><button type="button" class="btn secondary" data-route="calculators/pathfinder" data-params="view=range">Plan a new farm</button></div>'+
 (state.error?'<p role="alert" class="communityNotice">'+esc(state.error)+'</p>':'')+
 (!state.loaded?'<p class="mutedSmall">Loading checklists…</p>':state.rows.length?state.rows.map(row=>{
  const items=(row.groups||[]).flatMap(g=>g.items||[]),done=items.filter(x=>x.completed).length;
  return '<article class="accountFarmList"><details><summary><span><strong>'+esc(row.title)+'</strong><small>'+done+' / '+items.length+' collected · '+esc(date(row.createdAt))+' · '+esc(row.slot)+'</small></span><span class="accountFarmPercent">'+Math.round(done/Math.max(items.length,1)*100)+'%</span></summary>'+
   '<div class="accountFarmInside"><div class="accountFarmProgress"><span style="width:'+Math.round(done/Math.max(items.length,1)*100)+'%"></span></div>'+
   '<p class="mutedSmall">'+esc(row.from)+' → '+esc(row.to)+' · '+Number(row.gold).toLocaleString('en-US')+' Gold · '+esc(row.sourceVersion||'Recipe snapshot')+'</p>'+
   (row.groups||[]).map(group=>'<div class="accountFarmGroup"><h3>'+esc(group.name)+(group.tier?' <small>· '+esc(group.tier)+'</small>':'')+'</h3>'+
    (group.items||[]).map(m=>'<label class="accountFarmItem '+(m.completed?'completed':'')+'"><input type="checkbox" data-farm-list-check data-list-id="'+esc(row.id)+'" data-mat-slug="'+esc(m.slug)+'" '+(m.completed?'checked':'')+'><span>'+esc(m.name)+'</span><strong>'+BigInt(m.quantity).toLocaleString('en-US')+'</strong></label>').join('')+'</div>').join('')+
   '<button type="button" class="btn secondary" data-farm-list-action="delete" data-list-id="'+esc(row.id)+'">Delete this checklist</button></div></details></article>';
 }).join(''):'<p class="mutedSmall">No saved farming plans yet. Use Pathfinder → From → To and save the materials you need.</p>')+'</section>';
}
export function wireFarmingLists({refresh,toast}){
 document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-farm-list-action]');if(!btn)return;
  e.preventDefault();if(state.busy)return;
  const action=btn.dataset.farmListAction,id=btn.dataset.listId;
  void (async()=>{state.busy=true;try{
   if(action==='refresh')await loadFarmingLists();
   if(action==='delete'){
    if(!confirm('Delete this farming checklist and all its checked-off progress?'))return;
    await api('/api/account/farming-lists/'+encodeURIComponent(id),{method:'DELETE'});
    state.rows=state.rows.filter(x=>x.id!==id);toast('Farming checklist deleted.');
   }
  }catch(e){toast(e.message);state.error=e.message;}
  finally{state.busy=false;refresh();}
  })();
 });
 document.addEventListener('change',e=>{
  const checkbox=e.target.closest('[data-farm-list-check]');
  if(!checkbox||state.busy)return;
  const row=state.rows.find(x=>x.id===checkbox.dataset.listId),mat=row?.groups.flatMap(g=>g.items).find(x=>x.slug===checkbox.dataset.matSlug);
  if(!row||!mat)return;
  const selected=checkbox.checked;
  checkbox.disabled=true;state.busy=true;
  void (async()=>{try{
   const result=await api('/api/account/farming-lists/'+encodeURIComponent(row.id),{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({slug:mat.slug,completed:selected,baseUpdatedAt:row.updatedAt})});
   state.rows=state.rows.map(x=>x.id===row.id?result.list:x);state.error='';
  }catch(err){toast(err.message);await loadFarmingLists();}
  finally{state.busy=false;refresh();}
  })();
 });
}
