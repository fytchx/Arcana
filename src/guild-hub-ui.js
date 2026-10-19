import {esc,icon} from './ui.js';
import {renderCrest,CREST_DEFAULT,CREST_MARKS,CREST_OUTLINES,CREST_BORDERS} from './guild-crest.js';

const state={list:[],detail:null,moderation:[],loading:false,requested:'',error:'',query:''};
const api=async(path,method='GET',payload)=>{
 const response=await fetch('/api/guild-hub'+path,{method,credentials:'same-origin',cache:'no-store',
  ...(payload===undefined?{}:{headers:{'content-type':'application/json'},body:JSON.stringify(payload)})});
 const json=await response.json();if(!response.ok)throw Error(json.error||'Guild service unavailable.');
 return json;
};
const userPage=id=>'data-route="profile" data-params="id='+esc(id)+'"';
const tag=g=>'<span class="arcanaGuildTag '+(g.status==='approved'?'isOfficial finish-'+(['solid','glow','gradient'].includes(g.tagStyle?.finish)?g.tagStyle.finish:'solid'):'isUnregistered')+'"'+(g.status==='approved'&&/^#[0-9a-fA-F]{6}$/.test(g.tagStyle?.color||'')?' style="--guild-tag-color:'+g.tagStyle.color+'"':'')+'>'+
 (g.status==='approved'?renderCrest(g.crest,23):'')+'<span>['+esc(g.tag)+']</span></span>';
const status=g=>g.status==='approved'?'Registered Guild':g.status==='pending'?'Pending approval':g.status==='suspended'?'Suspended':'Not approved';
const empty=text=>'<p class="guildHubEmpty">'+esc(text)+'</p>';
const actions=(label,action,id='',style='secondary')=>'<button type="button" class="btn '+style+'" data-gh-action="'+esc(action)+'" data-id="'+esc(id)+'">'+esc(label)+'</button>';
const header=(heading,sub)=>'<header class="guildHubHero"><span class="eyebrow">ARCANA GUILDS</span><h1>'+esc(heading)+'</h1><p>'+esc(sub)+'</p></header>';
function guildTile(g){
 return '<article class="guildHubTile"><div class="guildHubTileTop">'+
 (g.iconDataUrl?'<img class="guildHubIcon" alt="" src="'+esc(g.iconDataUrl)+'">':'<span class="guildHubIcon guildHubIconBlank">'+icon('shield',24)+'</span>')+
 '<div><h2>'+esc(g.name)+'</h2><div class="guildHubIdentity">'+tag(g)+'<span class="mutedSmall">'+status(g)+'</span></div></div></div>'+
 '<p>'+esc(g.bio||'No guild description yet.')+'</p><div class="guildHubMeta"><span>'+g.memberCount+' members</span><span>'+(g.recruitmentOpen?'Recruiting':'Applications closed')+'</span></div>'+
 '<div class="guildHubActions"><button class="btn primary" data-route="guilds/view" data-params="id='+esc(g.id)+'">View guild</button>'+
 (g.canManage?'<button class="btn secondary" data-route="guilds/manage" data-params="id='+esc(g.id)+'">Manage</button>':'')+'</div></article>';
}
function directory(me){
 const all=state.list.filter(g=>!state.query||[g.name,g.tag,g.bio].some(x=>String(x||'').toLowerCase().includes(state.query.toLowerCase())));
 return '<section class="guildHubPage">'+header('Find your people','Guild pages, recruiting, announcements and player communities, all in Arcana. No separate server required.')+
 '<div class="guildHubToolbar"><label class="guildHubFilter">Search guilds<input type="search" id="guildHubQuery" placeholder="Name or [TAG]" value="'+esc(state.query)+'" maxlength="64"></label>'+
 (me?'<button class="btn primary" data-route="guilds/register">Register a guild</button>':'<button class="btn secondary" data-route="account">Sign in to register</button>')+
 (me?.permissions?.hideContent?'<button class="btn secondary" data-route="guilds/moderation">Approval queue</button>':'')+'</div>'+
 (state.error?empty(state.error):'')+
 '<div class="guildHubGrid">'+(all.length?all.map(guildTile).join(''):empty(state.loading?'Loading guilds…':'No guilds match this search.'))+'</div>'+
 '<aside class="guildHubNote">Only approved guilds receive colorful tags and crests. Anyone can use an unclaimed four-letter gray tag in their player card. Registered tags are reserved for guild members. Arcana guilds are community spaces and are not synced to in-game IdleArc rosters.</aside></section>';
}
function register(me){
 if(!me)return header('Guild registration','Sign in with Discord to register a guild.')+'<button class="btn primary" data-route="account">Open account</button>';
 return '<section class="guildHubPage">'+header('Register a new guild','Choose a permanent four-letter tag. Your guild will remain pending until an Arcana moderator approves it.')+
 '<form class="guildHubForm" data-gh-form="register">'+
 '<label>Guild name<input name="name" minlength="3" maxlength="64" required placeholder="Your guild name"></label>'+
 '<label>Four-letter guild tag<input name="tag" pattern="[A-Za-z]{4}" maxlength="4" minlength="4" autocapitalize="characters" required placeholder="ABCD"></label>'+
 '<label>About your guild<textarea name="bio" maxlength="1500" rows="5" placeholder="Playstyle, recruitment, time zones, activities"></textarea></label>'+
 '<button class="btn primary" type="submit">Submit for approval</button><p class="mutedSmall">Pending tags are held during review. After approval, your guild will receive its own customizable crest, management page and member community.</p></form></section>';
}
const memberName=(m,g)=>'<button class="guildHubMemberName" '+userPage(m.id)+'>'+tag(g)+' '+esc(m.name||'Player')+'</button>';
function posts(g,viewerId){
 const me=g.amMember,staff=g.canManage;
 return '<section class="guildHubPanel"><h2>Guild board</h2><p class="mutedSmall">Announcements are visible to everyone; member discussions stay within the guild.</p>'+
 (g.posts?.length?g.posts.map(p=>'<article class="guildHubPost"><header><strong>'+esc(p.kind==='announcement'?'📣 '+(p.title||'Announcement'):'Discussion')+'</strong><small>'+esc(p.authorName)+' · '+new Date(p.createdAt).toLocaleDateString()+'</small></header><p>'+esc(p.text)+'</p>'+
 (staff||p.authorId===viewerId?actions('Remove','remove-post',p.id):'')+'</article>').join(''):empty('No posts yet.'))+
 (me?'<form class="guildHubForm guildHubCompose" data-gh-form="post" data-id="'+esc(g.id)+'">'+
 (staff?'<label>Post as<select name="kind"><option value="discussion">Member discussion</option><option value="announcement">Announcement</option></select></label>':'<input type="hidden" name="kind" value="discussion">')+
 '<label>Title (for announcements)<input name="title" maxlength="100" placeholder="Optional title"></label><label>Message<textarea name="text" maxlength="1800" rows="4" minlength="2" required placeholder="Tell your guild something"></textarea></label><button type="submit" class="btn primary">Post to board</button></form>':
 '<p class="mutedSmall">Join the guild to participate in member discussions.</p>')+'</section>';
}
function detail(g,me){
 if(!g)return header('Guild','Loading guild profile…');
 const apply=me&&!g.amMember&&!g.myApplication&&g.status==='approved'&&g.recruitmentOpen&&!me.guildId;
 return '<section class="guildHubPage"><button class="guildHubBack" data-route="guilds">← All guilds</button>'+
 '<section class="guildHubCover"><div class="guildHubTileTop">'+
 (g.iconDataUrl?'<img class="guildHubIcon guildHubBig" src="'+esc(g.iconDataUrl)+'" alt="">':'<span class="guildHubIcon guildHubBig guildHubIconBlank">'+icon('shield',42)+'</span>')+
 '<div><span class="eyebrow">'+esc(status(g))+'</span><h1>'+esc(g.name)+'</h1><div class="guildHubIdentity">'+tag(g)+'</div></div></div>'+
 '<p class="guildHubBio">'+esc(g.bio||'This guild has not written its bio yet.')+'</p>'+ (g.moderationReason?'<p class="guildHubNotice">Review note: '+esc(g.moderationReason)+'</p>':'')+
 '<div class="guildHubMeta"><span>'+g.memberCount+' members</span><span>'+(g.recruitmentOpen?'Accepting applications':'Not recruiting')+'</span></div>'+
 (g.canManage?'<button class="btn primary" data-route="guilds/manage" data-params="id='+esc(g.id)+'">Open guild management</button>':'')+
 (apply?'<form class="guildHubForm guildHubApply" data-gh-form="apply" data-id="'+esc(g.id)+'"><label>Introduce yourself<textarea name="note" maxlength="500" rows="3" placeholder="What should this guild know about you?"></textarea></label><button type="submit" class="btn primary">Apply to join</button></form>':'')+
 (g.myApplication?'<p class="guildHubNotice">Your membership application is pending.</p>':'')+
 (!me?'<button class="btn secondary" data-route="account">Sign in to apply</button>':'')+
 (g.amMember&&g.memberRole!=='owner'?actions('Leave guild','leave',g.id):'')+'</section>'+
 '<section class="guildHubPanel"><h2>Roster</h2><div class="guildHubRoster">'+g.members.map(m=>'<div class="guildHubMember">'+memberName(m,g)+'<span>'+esc(m.role)+'</span></div>').join('')+'</div></section>'+
 posts(g,me?.id)+'</section>';
}
function select(name,options,value){
 return '<label>'+name+'<select name="'+esc(name)+'" data-gh-crest>'+
 Array.from({length:options},(_,i)=>'<option value="'+i+'" '+(i===value?'selected':'')+'>'+name+' '+(i+1)+'</option>').join('')+'</select></label>';
}
function editor(g){
 if(!g)return header('Guild management','Loading guild data…');
 const owner=g.memberRole==='owner',data=g.crest||CREST_DEFAULT;
 const colors=data.colors||CREST_DEFAULT.colors;
 return '<section class="guildHubPage"><button class="guildHubBack" data-route="guilds/view" data-params="id='+esc(g.id)+'">← Guild page</button>'+
 header('Manage '+g.name,'Recruiting, member roles, announcements, and your custom guild identity.')+
 (!owner?'<p class="guildHubNotice">You are a guild officer. You can review applications, manage ordinary members and publish announcements.</p>':'')+
 (owner?'<form class="guildHubForm" data-gh-form="settings" data-id="'+esc(g.id)+'"><h2>Guild identity</h2><label>Name<input name="name" maxlength="64" minlength="3" required value="'+esc(g.name)+'"></label>'+
 '<label>Guild bio<textarea name="bio" maxlength="1500" rows="5">'+esc(g.bio)+'</textarea></label>'+
 '<label class="guildHubCheck"><input type="checkbox" name="recruitmentOpen" '+(g.recruitmentOpen?'checked':'')+'> Accept new applications</label>'+
 '<p class="mutedSmall">Your four-letter tag ['+esc(g.tag)+'] is permanent. Choose its color and finish, then build the crest below. Official styling appears after approval.</p>'+
 '<div class="guildHubTagStyle"><label>Tag color<input type="color" name="tagColor" value="'+esc(g.tagStyle?.color||'#D2B2FF')+'"></label><label>Tag finish<select name="tagFinish"><option value="solid" '+(g.tagStyle?.finish==='solid'?'selected':'')+'>Solid</option><option value="glow" '+(g.tagStyle?.finish==='glow'?'selected':'')+'>Soft glow</option><option value="gradient" '+(g.tagStyle?.finish==='gradient'?'selected':'')+'>Gradient</option></select></label></div>'+
 '<div class="guildHubCrestEditor"><div class="guildHubCrestPreview" aria-live="polite">'+renderCrest(data,98)+'</div>'+
 '<div class="guildHubCrestControls">'+select('center',CREST_MARKS.length,data.center)+select('secondary',CREST_MARKS.length,data.secondary)+
 select('outline',CREST_OUTLINES.length,data.outline)+select('border',CREST_BORDERS.length,data.border)+
 colors.map((c,i)=>'<label>'+['Center','Secondary','Outline','Border'][i]+' color<input type="color" name="color'+i+'" data-gh-crest value="'+esc(c)+'"></label>').join('')+'</div></div>'+
 '<button type="submit" class="btn primary">Save guild and crest</button></form>'+
 '<section class="guildHubPanel"><h2>Guild page icon</h2><p>Upload a square PNG, JPG or WebP. A moderator must approve it before it appears publicly. Existing approved icons remain visible during review.</p>'+
 (g.iconDataUrl?'<img class="guildHubIcon guildHubBig" src="'+esc(g.iconDataUrl)+'" alt="Current approved guild icon">':'')+
 '<input type="file" id="guildHubIconInput" accept="image/png,image/jpeg,image/webp" aria-label="Upload guild page icon"><p id="guildHubIconStatus" class="mutedSmall" role="status"></p></section>':'')+
 '<section class="guildHubPanel"><h2>Applications · '+(g.applications?.length||0)+' pending</h2>'+
 (g.applications?.length?g.applications.map(a=>'<article class="guildHubApplication"><strong>'+esc(a.name)+'</strong><p>'+esc(a.note||'No introduction')+'</p><div class="guildHubActions">'+actions('Accept','accept',a.id,'primary')+actions('Decline','decline',a.id)+'</div></article>').join(''):empty('No pending applications.'))+'</section>'+
 '<section class="guildHubPanel"><h2>Member management</h2><div class="guildHubRoster">'+g.members.map(m=>'<div class="guildHubMember">'+memberName(m)+'<span>'+esc(m.role)+'</span>'+
 (m.role==='owner'?'':(owner?actions(m.role==='officer'?'Demote':'Make officer',m.role==='officer'?'member':'officer',m.id):'')+
 (owner||m.role==='member'?actions('Remove','remove-member',m.id):'')+
 (owner?actions('Transfer ownership','transfer',m.id):''))+'</div>').join('')+'</div></section>'+
 posts(g,null)+'</section>';
}
function modQueue(guilds){
 return '<section class="guildHubPage">'+header('Guild approval queue','Only Arcana moderators and administrators can approve new registered guilds and uploaded icons.')+
 (guilds.length?guilds.map(g=>'<article class="guildHubTile"><h2>'+esc(g.name)+' '+tag(g)+'</h2><p>'+esc(g.bio||'No bio provided.')+'</p><small>Registration: '+esc(g.status)+'</small>'+
 (g.status==='pending'?'<div class="guildHubActions">'+actions('Approve guild','approve',g.id,'primary')+actions('Reject guild','reject',g.id)+'</div>':'')+
 (g.pendingIconDataUrl?'<div class="guildHubIconReview"><img src="'+esc(g.pendingIconDataUrl)+'" class="guildHubIcon guildHubBig" alt="Pending guild icon for moderator review">'+actions('Approve icon','approve-icon',g.id,'primary')+actions('Reject icon','reject-icon',g.id)+'</div>':'')+'</article>').join(''):empty('Nothing awaiting approval.'))+'</section>';
}
export function guildHubPage(route,query,me){
 const id=query.get('id');
 if(route==='guilds/register')return register(me);
 if(route==='guilds/view')return detail(state.detail?.id===id?state.detail:null,me);
 if(route==='guilds/manage')return editor(state.detail?.id===id?state.detail:null);
 if(route==='guilds/moderation')return modQueue(state.moderation);
 return directory(me);
}
export async function loadGuildHub(route,query,refresh,me){
 const key=route+'?'+query.toString()+'|'+(me?.id||'guest');
 if(state.loading||state.requested===key)return;
 state.loading=true;state.requested=key;
 try{
  if(route==='guilds/view'||route==='guilds/manage')state.detail=(await api('/'+encodeURIComponent(query.get('id')||''))).guild;
  else if(route==='guilds/moderation'&&me?.permissions?.hideContent)state.moderation=(await api('/moderation')).guilds;
  else if(route==='guilds')state.list=(await api('')).guilds;
  state.error='';
 }catch(e){state.error=e.message;}
 finally{state.loading=false;const active=location.hash.replace(/^#\/?/,'').split('?')[0];if(active===route)refresh();}
}
const designFromForm=form=>({
 center:Number(form.elements.namedItem('center').value),secondary:Number(form.elements.namedItem('secondary').value),
 outline:Number(form.elements.namedItem('outline').value),border:Number(form.elements.namedItem('border').value),
 colors:[0,1,2,3].map(i=>form.elements.namedItem('color'+i).value)
});
async function smallImage(file){
 if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>4e6)throw Error('Use a PNG, JPG or WebP smaller than 4 MB.');
 const u=URL.createObjectURL(file);
 try{
  const img=new Image();
  await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=u;});
  if(!img.width||!img.height)throw Error('Cannot read this image.');
  const c=document.createElement('canvas');c.width=128;c.height=128;
  const ctx=c.getContext('2d'),side=Math.min(img.width,img.height);
  ctx.drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,128,128);
  const value=c.toDataURL('image/webp',.72);
  if(value.length>62000)throw Error('Image remains too large after resizing. Try a simpler picture.');
  return value;
 }finally{URL.revokeObjectURL(u);}
}
export function wireGuildHub({go,refresh,toast,currentAccount}){
 const reload=async route=>{
  state.requested='';const [path,qs]=location.hash.replace(/^#\/?/,'').split('?');
  if(path.startsWith('guilds/')){await loadGuildHub(path,new URLSearchParams(qs||''),refresh,currentAccount());}
  else if(route)go(route);
 };
 document.addEventListener('input',e=>{
  if(e.target.id==='guildHubQuery'){state.query=e.target.value;const q=state.query.toLowerCase();document.querySelectorAll('.guildHubTile').forEach(el=>{el.hidden=!el.textContent.toLowerCase().includes(q);});}
 });
 document.addEventListener('change',e=>{
  if(e.target.hasAttribute('data-gh-crest')){
   const form=e.target.closest('[data-gh-form="settings"]'),view=form?.querySelector('.guildHubCrestPreview');
   if(form&&view)view.innerHTML=renderCrest(designFromForm(form),98);
  }
  if(e.target.id==='guildHubIconInput'){
   const file=e.target.files?.[0],status=document.getElementById('guildHubIconStatus');
   if(!file)return;
   if(status)status.textContent='Preparing icon…';
   void (async()=>{
    const value=await smallImage(file),id=new URLSearchParams(location.hash.split('?')[1]||'').get('id');
    await api('/'+encodeURIComponent(id)+'/icon','POST',{image:value});
    toast('Icon submitted for moderator review.');await reload();
   })().catch(error=>{if(status)status.textContent=error.message;});
  }
 });
 document.addEventListener('submit',e=>{
  const form=e.target.closest('[data-gh-form]');if(!form)return;
  e.preventDefault();
  void (async()=>{
   const payload=Object.fromEntries(new FormData(form));
   if(form.dataset.ghForm==='register'){
    const {guild}=await api('/register','POST',payload);
    toast('Guild registration is pending approval.');go('guilds/view',{id:guild.id});
   }else if(form.dataset.ghForm==='settings'){
    const id=form.dataset.id;
    await api('/'+id,'PATCH',{name:payload.name,bio:payload.bio,recruitmentOpen:!!payload.recruitmentOpen,crest:designFromForm(form),tagStyle:{color:payload.tagColor,finish:payload.tagFinish}});
    toast('Guild settings and crest saved.');await reload();
   }else if(form.dataset.ghForm==='apply'){
    await api('/'+form.dataset.id+'/apply','POST',{note:payload.note});
    toast('Application sent to guild leaders.');await reload();
   }else if(form.dataset.ghForm==='post'){
    await api('/'+form.dataset.id+'/posts','POST',payload);
    toast('Message posted.');await reload();
   }
  })().catch(error=>toast(error.message));
 });
 document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-gh-action]');if(!btn)return;
  e.preventDefault();const action=btn.dataset.ghAction,target=btn.dataset.id;
  void (async()=>{
   const g=state.detail,id=g?.id,moderating=['approve','reject','approve-icon','reject-icon'].includes(action);
   if(moderating){
    if(action==='reject'&&!confirm('Reject this guild registration? The tag will be released.'))return;
    await api('/'+target+'/moderation','PATCH',{action});
    toast('Moderation decision saved.');await reload();return;
   }
   if(!id)throw Error('Open a guild first.');
   if(action==='leave'||action==='remove-member'||action==='transfer'||action==='remove-post'){
    if(!confirm(action==='transfer'?'Transfer guild ownership?':action==='remove-post'?'Delete this guild message?':action==='leave'?'Leave this guild?':'Remove this member?'))return;
   }
   if(action==='accept'||action==='decline')await api('/'+id+'/applications','PATCH',{action,userId:target});
   else if(['officer','member','remove-member','transfer','leave'].includes(action))await api('/'+id+'/members','PATCH',{userId:action==='leave'?currentAccount()?.id:target,action:action==='remove-member'?'remove':action});
   else if(action==='remove-post')await api('/'+id+'/posts?postId='+encodeURIComponent(target),'DELETE');
   else return;
   toast('Guild updated.');await reload();
  })().catch(error=>toast(error.message));
 });
}
