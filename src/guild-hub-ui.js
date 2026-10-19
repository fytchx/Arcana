import {esc,icon} from './ui.js';
import {renderCrest} from './guild-crest.js';
import {crestStudio,crestWorkshopPage,wireCrestWorkshop} from './guild-crest-workshop.js';

const state={list:[],detail:null,moderation:[],loading:false,requested:'',error:'',query:''};
async function api(path,method='GET',body){
 const r=await fetch('/api/guild-hub'+path,{method,credentials:'same-origin',cache:'no-store',...(body===undefined?{}:{headers:{'content-type':'application/json'},body:JSON.stringify(body)})});
 const data=await r.json();if(!r.ok)throw Error(data.error||'Guild service unavailable.');return data;
}
const status=g=>g.status==='approved'?'Official guild':g.status==='pending'?'Pending approval':g.status==='suspended'?'Suspended':'Registration declined';
function badge(g){
 const ok=g.status==='approved',style=g.tagStyle||{},color=/^#[\da-fA-F]{6}$/.test(style.color||'')?style.color:'#D2B2FF';
 return '<span class="arcanaGuildTag '+(ok?'isOfficial finish-'+(['solid','glow','gradient'].includes(style.finish)?style.finish:'solid'):'isUnregistered')+'" style="--guild-tag-color:'+color+'">'+
 (ok&&g.crest?renderCrest(g.crest,23):'')+'<span>['+esc(g.tag)+']</span></span>';
}
const empty=s=>'<p class="guildHubEmpty">'+esc(s)+'</p>';
const act=(label,action,id,primary=false)=>'<button type="button" class="btn '+(primary?'primary':'secondary')+'" data-gh-action="'+esc(action)+'" data-id="'+esc(id||'')+'">'+esc(label)+'</button>';
const header=(title,subtitle)=>'<div class="guildHubHero"><span class="eyebrow">ARCANA GUILD HUB</span><h1>'+esc(title)+'</h1><p>'+esc(subtitle)+'</p></div>';
function tile(g){
 return '<article class="guildHubTile"><div class="guildHubTileTop">'+
 (g.iconDataUrl?'<img class="guildHubIcon" src="'+esc(g.iconDataUrl)+'" alt="">':'<div class="guildHubIcon guildHubIconBlank">'+icon('shield',25)+'</div>')+
 '<div><h2>'+esc(g.name)+'</h2><div class="guildHubIdentity">'+badge(g)+'<span class="mutedSmall">'+status(g)+'</span></div></div></div>'+
 '<p>'+esc(g.bio||'This guild has not added an introduction.')+'</p>'+
 '<div class="guildHubMeta"><span>'+g.memberCount+' members</span><span>'+(g.recruitmentOpen?'Recruiting':'Recruitment closed')+'</span></div>'+
 '<div class="guildHubActions"><button class="btn primary" data-route="guilds/view" data-params="id='+esc(g.id)+'">View guild</button>'+
 (g.canManage?'<button class="btn secondary" data-route="guilds/manage" data-params="id='+esc(g.id)+'">Manage</button>':'')+'</div></article>';
}
function directory(me){
 const all=state.list.filter(g=>!state.query||[g.name,g.tag,g.bio].some(s=>String(s||'').toLowerCase().includes(state.query.toLowerCase())));
 return '<main class="guildHubPage">'+header('Guilds, with a little personality.','Claim a four-letter tag, create a beautiful crest, and make it easier for players to find your guild. Completely optional.')+
 '<section class="guildHubCrestCTA"><div class="guildHubCrestCTAIcon">'+renderCrest({center:1,secondary:12,outline:4,border:6,colors:['#F2D7FF','#F8BB66','#33214E','#CBB1FF']},92)+'</div>'+
 '<div><span class="eyebrow">THE FUN PART</span><h2>Design your guild crest</h2><p>25 main symbols. 25 accents. 10 shield shapes. 10 borders. Every layer gets its own color, and every combination is yours to try.</p></div>'+
 '<button class="btn primary" data-route="guilds/crest">Open Crest Designer →</button></section>'+
 '<div class="guildHubToolbar"><label class="guildHubFilter">Find a guild<input id="guildHubQuery" type="search" placeholder="Search by guild name or tag" maxlength="64" value="'+esc(state.query)+'"></label>'+
 (me?'<button class="btn secondary" data-route="guilds/register">Register a guild</button>':'<button class="btn secondary" data-route="account">Sign in to register</button>')+
 (me?.permissions?.hideContent?'<button class="btn secondary" data-route="guilds/moderation">Approval queue</button>':'')+'</div>'+
 (state.error?empty(state.error):'')+'<div class="guildHubGrid">'+(all.length?all.map(tile).join(''):empty(state.loading?'Loading registered guilds…':'There are no registered guilds here yet.'))+'</div>'+
 '<p class="guildHubNote">Guild registration is optional. Anyone may use an unclaimed four-letter gray tag on their player card. Approved guilds reserve their tag and unlock the official crest beside their members’ names. These are Arcana community identities, not in-game IdleArc guild registrations.</p>'+
 '<div class="guildHubOldListings"><button class="btn secondary" data-route="lfg/guilds">Browse older recruitment listings</button></div></main>';
}
function registration(me){
 if(!me)return '<main class="guildHubPage">'+header('Register your guild','You need a free Arcana account to register a guild.')+'<button class="btn primary" data-route="account">Sign in</button></main>';
 return '<main class="guildHubPage"><button class="guildHubBack" data-route="guilds">← Guild directory</button>'+
 header('Register a guild','Pick a name and a unique four-letter tag. We review registrations before activating the official identity.')+
 '<form class="guildHubForm" data-gh-form="register"><label>Guild name<input name="name" required minlength="3" maxlength="64" placeholder="Your guild name"></label>'+
 '<label>Four-letter tag<input name="tag" required pattern="[A-Za-z]{4}" maxlength="4" minlength="4" autocapitalize="characters" placeholder="ABCD"></label>'+
 '<label>Short guild bio<textarea name="bio" rows="5" maxlength="1500" placeholder="Who are you? What kind of players are you looking for?"></textarea></label>'+
 '<button class="btn primary" type="submit">Send registration for approval</button>'+
 '<p class="mutedSmall">A pending registration holds the tag while moderators review it. Once approved you can display your custom crest across Arcana.</p></form></main>';
}
const member=(m,g,me)=>'<div class="guildHubMember"><button class="guildHubMemberName" data-route="profile" data-params="id='+esc(m.id)+'">'+badge(g)+' '+esc(m.name||'Player')+'</button><span>'+esc(m.role)+'</span>'+
 (g.canManage&&m.role!=='owner'?'<span class="guildHubMemberActions">'+
 (g.memberRole==='owner'?act(m.role==='officer'?'Demote':'Promote',m.role==='officer'?'member':'officer',m.id):'')+
 (g.memberRole==='owner'||m.role==='member'?act('Remove','remove-member',m.id):'')+
 (g.memberRole==='owner'?act('Transfer ownership','transfer',m.id):'')+'</span>':'')+'</div>';
function detail(g,me){
 if(!g)return '<main class="guildHubPage">'+header('Guild profile',state.error||'Loading guild information…')+'</main>';
 const canApply=!!me&&g.status==='approved'&&g.recruitmentOpen&&!g.amMember&&!g.myApplication&&!me.guildId;
 return '<main class="guildHubPage"><button class="guildHubBack" data-route="guilds">← Guild directory</button>'+
 '<section class="guildHubCover"><div class="guildHubTileTop">'+(g.iconDataUrl?'<img class="guildHubIcon guildHubBig" src="'+esc(g.iconDataUrl)+'" alt="">':'<div class="guildHubIcon guildHubBig guildHubIconBlank">'+icon('shield',35)+'</div>')+
 '<div><span class="eyebrow">'+esc(status(g))+'</span><h1>'+esc(g.name)+'</h1><div class="guildHubIdentity">'+badge(g)+'</div></div></div>'+
 '<p class="guildHubBio">'+esc(g.bio||'This guild has not written an introduction yet.')+'</p>'+
 (g.moderationReason?'<p class="guildHubNotice">Review note: '+esc(g.moderationReason)+'</p>':'')+
 '<div class="guildHubMeta"><span>'+g.memberCount+' members</span><span>'+(g.recruitmentOpen?'Currently recruiting':'Not recruiting')+'</span></div>'+
 '<div class="guildHubActions">'+(g.canManage?'<button class="btn primary" data-route="guilds/manage" data-params="id='+esc(g.id)+'">Manage guild</button>':'')+
 act('Copy guild link','share',g.id)+
 (g.amMember&&g.memberRole!=='owner'?act('Leave guild','leave',g.id):'')+'</div>'+
 (canApply?'<form class="guildHubForm guildHubApply" data-gh-form="apply" data-id="'+esc(g.id)+'"><h2>Apply to join</h2><label>A note for guild leaders<textarea name="note" rows="3" maxlength="500" placeholder="Tell them a little about yourself"></textarea></label><button class="btn primary" type="submit">Send application</button></form>':'')+
 (g.myApplication?'<p class="guildHubNotice">Your application is pending.</p>':'')+
 (!me&&g.status==='approved'?'<button class="btn secondary" data-route="account">Sign in to apply</button>':'')+'</section>'+
 '<section class="guildHubPanel"><h2>Members</h2><div class="guildHubRoster">'+(g.members||[]).map(m=>member(m,g,me)).join('')+'</div></section>'+
 '<div class="guildHubDetailFooter"><button class="btn secondary" data-route="guilds/crest">Try the Crest Designer</button></div></main>';
}
function manage(g,me){
 if(!g)return '<main class="guildHubPage">'+header('Manage guild',state.error||'Loading guild…')+'</main>';
 if(!g.canManage)return '<main class="guildHubPage">'+header('Guild management','Only the guild owner and officers can manage this guild.')+'</main>';
 const owner=g.memberRole==='owner';
 return '<main class="guildHubPage"><button class="guildHubBack" data-route="guilds/view" data-params="id='+esc(g.id)+'">← Guild page</button>'+
 header('Manage '+g.name,'Keep your guild profile up to date, review applicants, and customize your crest.')+
 (owner?'<section class="guildHubPanel"><h2>Guild profile</h2><form class="guildHubForm" data-gh-form="settings" data-id="'+esc(g.id)+'">'+
 '<label>Name<input name="name" required minlength="3" maxlength="64" value="'+esc(g.name)+'"></label>'+
 '<label>About your guild<textarea name="bio" maxlength="1500" rows="4">'+esc(g.bio||'')+'</textarea></label>'+
 '<label class="guildHubCheck"><input name="recruitmentOpen" type="checkbox" '+(g.recruitmentOpen?'checked':'')+'> Open recruitment</label>'+
 '<button type="submit" class="btn primary">Save guild profile</button></form></section>'+
 '<section class="guildHubPanel"><h2>Guild page icon</h2><p>Square icons are reviewed by an Arcana moderator before becoming public.</p>'+
 (g.iconDataUrl?'<img class="guildHubIcon guildHubBig" src="'+esc(g.iconDataUrl)+'" alt="Current guild icon">':'')+
 '<input id="guildHubIconInput" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Guild page icon"><p id="guildHubIconStatus" class="mutedSmall" role="status"></p></section>':'')+
 '<section class="guildHubPanel"><h2>Membership applications</h2>'+
 ((g.applications||[]).length?g.applications.map(a=>'<article class="guildHubApplication"><strong>'+esc(a.name)+'</strong><p>'+esc(a.note||'No message')+'</p><div class="guildHubActions">'+act('Accept','accept',a.id,true)+act('Decline','decline',a.id)+'</div></article>').join(''):empty('No pending applications.'))+'</section>'+
 '<section class="guildHubPanel"><h2>Roster</h2><div class="guildHubRoster">'+(g.members||[]).map(m=>member(m,g,me)).join('')+'</div></section>'+
 (owner?crestStudio({guildId:g.id,design:g.crest,tag:g.tag,tagStyle:g.tagStyle}):'')+
 '</main>';
}
function moderate(me){
 if(!me?.permissions?.hideContent)return '<main class="guildHubPage">'+header('Approval queue','Only moderators can review guild registrations and icons.')+'</main>';
 return '<main class="guildHubPage">'+header('Guild approvals','Review the guild identities players would like to register.')+
 (state.moderation.length?state.moderation.map(g=>'<section class="guildHubTile"><h2>'+esc(g.name)+' '+badge(g)+'</h2><p>'+esc(g.bio||'No introduction')+'</p><small>Registration: '+esc(g.status)+'</small>'+
 (g.status==='pending'?'<div class="guildHubActions">'+act('Approve guild','approve',g.id,true)+act('Reject guild','reject',g.id)+'</div>':'')+
 (g.pendingIconDataUrl?'<div class="guildHubIconReview"><img class="guildHubIcon guildHubBig" alt="Icon awaiting review" src="'+esc(g.pendingIconDataUrl)+'">'+act('Approve icon','approve-icon',g.id,true)+act('Reject icon','reject-icon',g.id)+'</div>':'')+
 '</section>').join(''):empty('Nothing waiting for review.'))+'</main>';
}
export function guildHubPage(route,query,me){
 const id=query.get('id'),g=state.detail?.id===id?state.detail:null;
 if(route==='guilds/crest')return crestWorkshopPage(me);
 if(route==='guilds/register')return registration(me);
 if(route==='guilds/view')return detail(g,me);
 if(route==='guilds/manage')return manage(g,me);
 if(route==='guilds/moderation')return moderate(me);
 return directory(me);
}
export async function loadGuildHub(route,query,refresh,me){
 const key=route+'?'+query.toString()+'|'+(me?.id||'guest');
 if(state.loading||state.requested===key)return;
 state.loading=true;state.requested=key;
 try{
  if(['guilds/view','guilds/manage'].includes(route))state.detail=(await api('/'+encodeURIComponent(query.get('id')||''))).guild;
  if(route==='guilds/moderation'&&me?.permissions?.hideContent)state.moderation=(await api('/moderation')).guilds;
  if(route==='guilds')state.list=(await api('')).guilds;
  state.error='';
 }catch(e){state.error=e.message;}
 finally{state.loading=false;if(location.hash.replace(/^#\/?/,'').split('?')[0]===route)refresh();}
}
async function resizeIcon(file){
 if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>4_000_000)throw Error('Choose a PNG, JPG or WebP smaller than 4MB.');
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});
  const side=Math.min(img.width,img.height);if(!side)throw Error('Image is invalid.');
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  canvas.getContext('2d').drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,128,128);
  const data=canvas.toDataURL('image/webp',.7);if(data.length>62000)throw Error('Image is too large after resizing.');return data;
 }finally{URL.revokeObjectURL(url);}
}
export function wireGuildHub({go,refresh,toast,currentAccount}){
 const reload=async()=>{
  state.requested='';
  const [path,q]=location.hash.replace(/^#\/?/,'').split('?');
  await loadGuildHub(path,new URLSearchParams(q||''),refresh,currentAccount());
 };
 wireCrestWorkshop({toast,onSave:async(id,design)=>{await api('/'+id,'PATCH',design);await reload();}});
 document.addEventListener('input',e=>{
  if(e.target.id!=='guildHubQuery')return;state.query=e.target.value;
  const q=state.query.toLowerCase();
  document.querySelectorAll('.guildHubTile').forEach(tile=>{tile.hidden=!tile.textContent.toLowerCase().includes(q);});
 });
 document.addEventListener('change',e=>{
  if(e.target.id!=='guildHubIconInput'||!e.target.files?.[0])return;
  const file=e.target.files[0],status=document.getElementById('guildHubIconStatus');
  if(status)status.textContent='Resizing…';
  void (async()=>{
   const image=await resizeIcon(file),id=new URLSearchParams(location.hash.split('?')[1]||'').get('id');
   await api('/'+id+'/icon','POST',{image});toast('Icon submitted for approval.');await reload();
  })().catch(error=>{if(status)status.textContent=error.message;});
 });
 document.addEventListener('submit',e=>{
  const form=e.target.closest('[data-gh-form]');if(!form)return;
  e.preventDefault();
  void (async()=>{
   const data=Object.fromEntries(new FormData(form));
   if(form.dataset.ghForm==='register'){
    const out=await api('/register','POST',data);toast('Guild registration pending review.');go('guilds/view',{id:out.guild.id});
   }else if(form.dataset.ghForm==='settings'){
    await api('/'+form.dataset.id,'PATCH',{name:data.name,bio:data.bio,recruitmentOpen:!!data.recruitmentOpen});
    toast('Guild profile saved.');await reload();
   }else if(form.dataset.ghForm==='apply'){
    await api('/'+form.dataset.id+'/apply','POST',{note:data.note});toast('Application sent.');await reload();
   }
  })().catch(err=>toast(err.message));
 });
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-gh-action]');if(!b)return;
  const action=b.dataset.ghAction,id=b.dataset.id;
  void (async()=>{
   if(action==='share'){
    const url=location.origin+'/#/guilds/view?id='+encodeURIComponent(id);
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(url);
    else window.prompt('Copy guild link',url);
    toast('Guild link copied.');return;
   }
   const isModeration=['approve','reject','approve-icon','reject-icon'].includes(action);
   if(isModeration){
    if(action==='reject'&&!confirm('Reject this guild registration?'))return;
    await api('/'+id+'/moderation','PATCH',{action});toast('Moderation decision saved.');await reload();return;
   }
   const g=state.detail;if(!g)throw Error('Select a guild first.');
   if(action==='leave'||action==='remove-member'||action==='transfer'){
    if(!confirm(action==='transfer'?'Transfer ownership of this guild?':action==='leave'?'Leave this guild?':'Remove this member?'))return;
   }
   if(['accept','decline'].includes(action))await api('/'+g.id+'/applications','PATCH',{action,userId:id});
   else if(['officer','member','remove-member','transfer','leave'].includes(action)){
    await api('/'+g.id+'/members','PATCH',{action:action==='remove-member'?'remove':action,userId:action==='leave'?currentAccount()?.id:id});
   }else return;
   toast('Guild updated.');await reload();
  })().catch(err=>toast(err.message));
 });
}
