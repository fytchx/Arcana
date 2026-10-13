import {esc,icon} from './ui.js';

const state={rows:[],loaded:false,busy:false,error:''};
const api=async(path,opts={})=>{
 const res=await fetch(path,{credentials:'same-origin',cache:'no-store',...opts});
 const out=await res.json().catch(()=>({}));
 if(!res.ok)throw Error(out.error||'Unable to access your saved builds.');
 return out;
};
export async function loadAccountBuilds({refresh}={}){
 try{const result=await api('/api/account/builds');state.rows=result.builds||[];state.loaded=true;state.error='';}
 catch(e){state.error=e.message;state.loaded=true;state.rows=[];}
 if(refresh)refresh();
}
export async function saveNewAccountBuild(build){
 const result=await api('/api/account/builds',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({build})});
 state.rows=[result.build,...state.rows];state.loaded=true;state.error='';
 return result.build;
}
export function cloudBuildView(){
 const status=state.error?'<p class="communityNotice">'+esc(state.error)+'</p>':'';
 return '<section class="accountCloudBuilds" aria-label="Account saved builds"><div class="accountCloudHead"><div><span class="eyebrow">YOUR ACCOUNT · PERSISTENT DATA</span><h2>Cloud Build Studio</h2><p>Save up to 20 builds to your Arcana account. Your saves stay linked to your account across devices and the eventual full launch.</p></div></div>'+
 '<div class="communityPostActions"><button type="button" class="btn secondary" data-cloud-action="new">'+icon('plus',16)+' Save current Build Studio</button><button type="button" class="btn secondary" data-cloud-action="reload">'+icon('clock',16)+' Refresh saves</button></div>'+
 (!state.loaded?'<p class="mutedSmall">Loading account saves…</p>':state.rows.length?'<div class="accountCloudList">'+state.rows.map(row=>
 '<article class="accountCloudRow"><div><strong>'+esc(row.title)+'</strong><small>'+esc(row.className||'Character')+' · ML '+esc(row.monsterLevel||1)+' · Saved '+esc(row.updatedAt?new Date(row.updatedAt).toLocaleDateString():'')+'</small></div>'+
 '<div class="communityPostActions"><button class="btn secondary" data-cloud-action="load" data-id="'+esc(row.id)+'">Load</button>'+
 '<button class="btn secondary" data-cloud-action="overwrite" data-id="'+esc(row.id)+'">Overwrite</button>'+
 '<button class="btn secondary" data-cloud-action="delete" data-id="'+esc(row.id)+'">Delete</button></div></article>').join('')+'</div>':'<p class="mutedSmall">You have no account saves yet. Create a build in Arcana Labs, then save it here or with Save to Account from Build Studio.</p>')+
 status+'<p class="mutedSmall">These are private account saves. Publish a separate community build when you want other players to see it. Share links still work without an account.</p></section>';
}
export function wireCloudBuildUI({go,getBuild,applyBuild,refresh,toast}){
 document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-cloud-action]');
  if(!btn)return;e.preventDefault();
  if(state.busy)return;
  const action=btn.dataset.cloudAction,id=btn.dataset.id;
  void (async()=>{
   state.busy=true;
   try{
    if(action==='new'){
     const build=getBuild();if(!build)throw Error('Start a build in Arcana Labs first.');
     const saved=await saveNewAccountBuild(build);toast('Saved '+saved.title+' to your Arcana account.');
    }else if(action==='reload')await loadAccountBuilds();
    else if(action==='load'){
     if(!confirm('Load this account build? Your current device-local draft will be replaced.'))return;
     const result=await api('/api/account/builds/'+encodeURIComponent(id));
     applyBuild(result.build);toast('Account build restored to Build Studio.');go('labs/build');return;
    }else if(action==='overwrite'){
     const row=state.rows.find(x=>x.id===id);if(!row)throw Error('Refresh account saves first.');
     if(!confirm('Replace the account save "'+row.title+'" with your current device-local build?'))return;
     const updated=await api('/api/account/builds/'+encodeURIComponent(id),{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({build:getBuild(),baseUpdatedAt:row.updatedAt})});
     state.rows=state.rows.map(x=>x.id===id?updated.build:x);toast('Account save updated.');
    }else if(action==='delete'){
     if(!confirm('Delete this account save permanently? This does not erase your current device-local build.'))return;
     await api('/api/account/builds/'+encodeURIComponent(id),{method:'DELETE'});
     state.rows=state.rows.filter(x=>x.id!==id);toast('Account save deleted.');
    }
   }catch(err){state.error=err.message;toast(err.message);}
   finally{state.busy=false;refresh();}
  })();
 });
}
