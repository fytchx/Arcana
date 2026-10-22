import {esc,icon} from './ui.js';
import {designPanel} from './launch-navigation.js';
import {designMiniMarkup} from './design-mini-preview.js';
import {readDesign,replaceDesignDraft,currentPublishedDesign,setDesignPreview,DEFAULT_DESIGN} from './design-controls.js';
import {refreshTheme,siteNotice} from './theme.js';
import {adminTrafficView,loadAdminTraffic} from './admin-traffic-ui.js';
import {currentAccount} from './community-ui.js';

const tabs=[
 ['traffic','Traffic','chart'],['appearance','Appearance','settings'],['members','Members & Roles','users'],
 ['content','Content','book'],['site','Site Controls','shield']
];
const state={config:null,configLoaded:false,history:[],members:[],membersLoaded:false,total:0,page:1,pages:1,member:null,query:'',error:'',noticeText:'',noticeEnabled:false,loading:false,status:null,busy:false};
const tabName=v=>tabs.some(t=>t[0]===v)?v:'traffic';
const adminFetch=async(path,options={})=>{
 const response=await fetch(path,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000),...options});
 const json=await response.json();if(!response.ok)throw Error(json.error||'Admin operation failed.');return json;
};
const actionLink=(title,detail,route,mark='arrow')=>
 '<button type="button" class="launchNavRow" data-route="'+esc(route)+'"><span class="launchNavIcon">'+icon(mark,20)+'</span><span class="launchNavCopy"><strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small></span>'+icon('arrow',16)+'</button>';
const section=(title,description,body)=>'<section class="adminPanelSection"><h2>'+esc(title)+'</h2><p>'+esc(description)+'</p>'+body+'</section>';
const infoBar=text=>'<p class="adminInfo" role="status">'+esc(text)+'</p>';
const roleLabels=(roles)=>roles.map(x=>x.label||x.id).join(', ')||'Member';
const selectRoles=(selected,creator)=>{
 const assigned=new Set((selected?.roles||[]).map(x=>x.id||x));
 return [['wiki-editor','Wiki Editor'],['moderator','Moderator'],...(creator?[['admin','Administrator'],['developer','Developer']]:[])].map(([key,label])=>
 '<label class="adminRoleCheck"><input type="checkbox" name="roles" value="'+key+'" '+(assigned.has(key)?'checked':'')+'>'+esc(label)+'</label>').join('');
};
const listedMembers=()=>state.members.filter(u=>!state.query||[u.displayName,u.inGameName,u.guild,u.id].some(v=>String(v||'').toLowerCase().includes(state.query.toLowerCase())));
const listMembers=()=>listedMembers().map(user=>'<button class="adminMemberRow '+(state.member?.id===user.id?'active':'')+'" type="button" data-admin-member="'+esc(user.id)+'"><span><strong>'+esc(user.displayName)+'</strong><small>'+esc([user.inGameName,user.guild].filter(Boolean).join(' · ')||user.id)+'</small></span><span class="adminMemberRole">'+esc(roleLabels(user.roles))+'</span></button>').join('')||'<p class="adminEmpty">No members match your search on this page.</p>';
function membersView(){
 const creator=Boolean(currentAccount()?.roles?.some(x=>x.id==='creator'));
 const selected=state.members.find(u=>u.id===state.member?.id)||state.member;
 return section('Members & roles','Manage approved roles through server-authenticated Arcana accounts. Creator status cannot be reassigned.', 
  '<div class="adminMemberStats"><strong>'+Number(state.total).toLocaleString()+'</strong> accounts · Page '+state.page+' of '+state.pages+'</div>'+
  '<label class="adminField">Search this page<input id="adminMemberFilter" type="search" value="'+esc(state.query)+'" placeholder="Player, guild or account ID"></label>'+
  '<div id="adminMemberList" class="adminMemberList">'+listMembers()+'</div>'+
  '<div class="adminPagination"><button data-admin-command="prev" '+(state.page<2?'disabled':'')+'>Previous</button><span>'+state.page+' / '+state.pages+'</span><button data-admin-command="next" '+(state.page>=state.pages?'disabled':'')+'>Next</button></div>'+
 (selected?'<form id="adminRoleForm" class="adminRoleForm"><h3>'+esc(selected.displayName)+'</h3><p>Account ID: <code>'+esc(selected.id)+'</code></p><fieldset><legend>Assign roles</legend>'+selectRoles(selected,creator)+'</fieldset><button class="btn primary" type="submit" '+(state.busy?'disabled':'')+'>Save member roles</button><p class="adminHelp">Unchecking all additional roles leaves the account as a regular Member. The Creator identity and permanent beta badge are protected.</p></form>':infoBar('Select a member above to manage roles.')));
}
function appearanceView(){
 const published=state.config?.design;
 return '<div class="adminAppearance">'+
 section('Global Theme Studio','One design for everyone. Edit privately, inspect the live preview, then explicitly publish to all Arcana visitors.',
  '<div class="adminPublishedStatus"><strong>'+ (published?'Published theme v'+state.config.revision:'No unified theme published yet')+'</strong><span>'+(state.config?.updatedAt?'Last publish: '+esc(new Date(state.config.updatedAt).toLocaleString()):'Existing Arcana appearance remains until your first publish.')+'</span></div>'+
  '<div class="adminPublishBar"><button class="btn primary" data-admin-command="publish-theme" '+(state.busy?'disabled':'')+'>'+icon('check',16)+' Publish to everyone</button><button class="btn secondary" data-admin-command="discard-theme" '+(state.busy?'disabled':'')+'>Restore published design</button></div>'+
  '<p class="adminHelp">Preview edits stay on your device. Publishing updates the central server, so guests and signed-in members see the same appearance. Older local color preferences are ignored.</p>')+
 '<div class="themeStudioWorkbench" aria-label="Arcana Theme Studio workspace">'+
 '<div class="themeStudioEditor" id="themeStudioEditor">'+designPanel({showPreview:false})+'</div>'+
 '<aside class="themeStudioPreview" id="themeStudioPreview" aria-label="Persistent real-time design preview">'+designMiniMarkup()+'</aside></div>'+
 section('Theme history','Restore an earlier release if a published design does not work as expected.',
 '<div class="adminHistory">'+((state.history||[]).slice().reverse().slice(0,10).map(x=>'<div class="adminHistoryRow"><span>Revision '+x.revision+'<small>'+esc(x.updatedAt?new Date(x.updatedAt).toLocaleString():'Original configuration')+'</small></span><button data-admin-rollback="'+x.revision+'">Restore</button></div>').join('')||infoBar('Version history begins with the first published change.'))+'</div>')+
 '</div>';
}
function siteView(){
 const notice=state.config?.notice||siteNotice();
 return section('Site-wide announcement','Post an optional short announcement visible at the top of every page for all visitors.',
 '<form id="adminNoticeForm" class="adminNoticeForm"><label class="adminField">Announcement text<textarea name="text" maxlength="180" rows="3" placeholder="News, important update, or a quick notice">'+esc(notice.text||'')+'</textarea></label>'+
 '<label class="adminRoleCheck"><input type="checkbox" name="enabled" '+(notice.enabled?'checked':'')+'> Display announcement site-wide</label>'+
 '<button class="btn primary" type="submit">Publish announcement settings</button></form>')+
 section('Site health','Quick operational visibility without exposing secrets or deployment controls.',
 state.status?'<div class="adminSiteStatus"><strong>'+esc(state.status.ok?'Healthy':'Needs attention')+'</strong><p>Release: '+esc(state.status.release||'Unknown')+'</p><p>Artwork available: '+esc(state.status.artwork?.local?'Yes':'Remote fallback')+'</p></div>':infoBar('Loading status from the live service…'))+
 section('Safety & recovery','Publishing a theme never changes accounts, builds, wiki articles, or game data. A previous design can be restored from Appearance.',
 '<button type="button" data-admin-command="refresh-status" class="btn secondary">Refresh site status</button>');
}
function contentView(){return section('Wiki & community publishing','Manage editorial content with the existing role and moderation permissions.',
 '<div class="launchMenuLinks">'+actionLink('Wiki Studio','Edit or publish verified articles and images.','wiki/studio','book')+
 actionLink('Community Contributions','Review published player guides and builds.','community','users')+
 actionLink('Beta Reports','See user suggestions and bug reports.','beta/reports','info')+
 actionLink('Wiki categories','Browse the current player-facing wiki.','wiki','layers')+'</div>')+
 section('Administration boundaries','Verified game data and artwork must remain source-backed. Existing editor permissions, player accounts, and builds are unchanged by a design publish.',infoBar('Only authorized editors can publish the official Wiki. Moderator and Admin permissions still control community changes.'));}
export function adminConsoleView({admin=false,authEnabled=false,tab='traffic'}={}){
 if(!admin)return '<div class="launchPage"><span class="launchEyebrow">PRIVATE MANAGEMENT</span><h1>Admin access required</h1><p>Only authenticated Arcana Admins and the Creator may access the dashboard.</p>'+(authEnabled?'<a class="btn primary" href="/api/account/login">Sign in with Discord</a>':'')+'</div>';
 const selected=tabName(tab);
 const nav='<nav class="adminTabNav" aria-label="Administration sections">'+tabs.map(([id,label])=>'<button class="adminTab '+(id===selected?'active':'')+'" data-route="admin" data-params="tab='+id+'" '+(id===selected?'aria-current="page"':'')+'>'+esc(label)+'</button>').join('')+'</nav>';
 const content=selected==='traffic'?adminTrafficView({admin:true,embedded:true}):selected==='appearance'?appearanceView():
 selected==='members'?membersView():selected==='content'?contentView():siteView();
 return '<div class="launchPage adminConsole"><span class="launchEyebrow">ARCANA MANAGEMENT</span><h1>Admin Control Center</h1><p>Traffic, global design, members, content and site settings. One protected workspace.</p>'+nav+
 (state.error?'<div class="adminError" role="alert">'+esc(state.error)+'</div>':'')+
 (!state.config&&selected!=='traffic'&&selected!=='content'?infoBar('Loading administration settings…'):'')+
 '<div class="adminTabContent">'+content+'</div></div>';
}
let siteLoading=false,membersLoading=false,healthLoading=false;
export async function loadAdminConsole(tab,refresh,{force=false}={}){
 const selected=tabName(tab);
 if(['appearance','site','members'].includes(selected)&&(!state.configLoaded||force)&&!siteLoading){
  siteLoading=true;try{const data=await adminFetch('/api/admin/site');state.config=data;state.history=data.history||[];state.error='';}
  catch(e){state.error=e.message;}finally{state.configLoaded=true;siteLoading=false;refresh();}
 }
 if(selected==='traffic')void loadAdminTraffic(refresh);
 if(selected==='members'&&(!state.membersLoaded||force)&&!membersLoading){
  membersLoading=true;try{const data=await adminFetch('/api/admin/members?page='+state.page);state.members=data.members;state.total=data.total;state.pages=data.pages;state.error='';}
  catch(e){state.error=e.message;}finally{state.membersLoaded=true;membersLoading=false;refresh();}
 }
 if(selected==='site'&&(!state.status||force)&&!healthLoading){
  healthLoading=true;try{state.status=await adminFetch('/health');}catch(e){state.error=e.message;}finally{healthLoading=false;refresh();}
 }
}
async function publish(section,body,refresh,toast){
 if(state.busy)return;
 if(!state.config)throw Error('Site settings are not loaded.');
 state.busy=true;
 try{
  const data=await adminFetch('/api/admin/site',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({section,expectedRevision:state.config.revision,...body})});
  state.config=data;const fresh=await adminFetch('/api/admin/site');state.history=fresh.history||[];state.error='';
  await refreshTheme();toast(section==='design'?'Theme published to every visitor.':'Announcement published for all visitors.');
 }finally{state.busy=false;refresh();}
}
export function wireAdminConsole({refresh,toast}){
 document.addEventListener('input',e=>{
  if(e.target.id!=='adminMemberFilter')return;state.query=e.target.value;
  const list=document.getElementById('adminMemberList');if(list)list.innerHTML=listMembers();
 });
 document.addEventListener('click',e=>{
  const member=e.target.closest('[data-admin-member]');
  if(member){state.member=state.members.find(u=>u.id===member.dataset.adminMember)||null;refresh();return;}
  const rollback=e.target.closest('[data-admin-rollback]');
  if(rollback){if(!confirm('Restore the previous published theme and announcement settings for everyone?'))return;
   void (async()=>{if(!state.config)return;const result=await adminFetch('/api/admin/site/rollback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({expectedRevision:state.config.revision,targetRevision:Number(rollback.dataset.adminRollback)})});state.config=result;state.history=(await adminFetch('/api/admin/site')).history||[];replaceDesignDraft(result.design||DEFAULT_DESIGN);await refreshTheme();toast('Previous version published for all users.');refresh()})().catch(err=>{state.error=err.message;refresh()});return;
  }
  const button=e.target.closest('[data-admin-command]');if(!button)return;
  const command=button.dataset.adminCommand;
  if(command==='publish-theme'){if(!confirm('Publish your current appearance for ALL Arcana visitors?'))return;
   void publish('design',{design:readDesign()},refresh,toast).catch(err=>{state.error=err.message;refresh()});}
  if(command==='discard-theme'){replaceDesignDraft(currentPublishedDesign()||DEFAULT_DESIGN);toast('Draft restored to published theme.');refresh();}
  if(command==='prev'||command==='next'){state.page=Math.max(1,Math.min(state.pages,state.page+(command==='next'?1:-1)));state.members=[];state.membersLoaded=false;state.member=null;state.query='';void loadAdminConsole('members',refresh,{force:true});}
  if(command==='refresh-status')void loadAdminConsole('site',refresh,{force:true});
 });
 document.addEventListener('submit',e=>{
  if(e.target.id==='adminRoleForm'){
   e.preventDefault();
   const account=state.member;if(!account)return;
   const roles=[...new FormData(e.target).getAll('roles')];
   if(!confirm('Update roles for '+account.displayName+'?'))return;
   void adminFetch('/api/admin/roles/'+encodeURIComponent(account.id),{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({roles})})
    .then(data=>{const index=state.members.findIndex(u=>u.id===account.id);if(index>=0)state.members[index]={...state.members[index],roles:data.profile.roles};state.member={...account,roles:data.profile.roles};toast('Member roles saved.');state.error='';refresh();})
    .catch(err=>{state.error=err.message;refresh()});return;
  }
  if(e.target.id==='adminNoticeForm'){
   e.preventDefault();const form=new FormData(e.target);const text=String(form.get('text')||'').trim();
   const notice={text,enabled:form.has('enabled')};
   if(!confirm('Publish this announcement setting for all Arcana visitors?'))return;
   void publish('notice',{notice},refresh,toast).catch(err=>{state.error=err.message;refresh()});
  }
 });
}
