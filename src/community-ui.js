import {esc,icon} from './ui.js';
import {guildBadge} from './guild-badge.js';
import {cloudBuildView,loadAccountBuilds,wireCloudBuildUI} from './account-builds-ui.js';
import {farmListsAccountView,loadFarmingLists} from './farming-lists-ui.js';
import {accountCharacterLink} from './community-archive-ui.js';
const state={me:undefined,enabled:false,providers:{discord:false,google:false},betaEnrollmentOpen:false,posts:[],myPosts:[],profilePosts:[],post:null,profile:null,loading:null,error:'',lastRoute:'',requested:'',guildRegistry:[]};
const titleProfile=p=>guildBadge(p,state.guildRegistry)+' '+esc(p?.displayName||'Arcana player');
let avatarPending=null;
const labels=roles=>(roles||[]).map(r=>'<span class="accountRole role-'+esc(r.id)+'">'+esc(r.label)+'</span>').join('');
const notice=t=>'<p class="communityNotice">'+esc(t)+'</p>';
const getJSON=async(url,options)=>{
 const res=await fetch(url,{credentials:'same-origin',cache:'no-store',...options});
 const out=await res.json();
 if(!res.ok)throw Error(out.error||'Arcana account service unavailable.');
 return out;
};
const fields=[
 ['displayName','Display name','text',50],['inGameName','IdleArc character name','text',48],
 ['guild','Guild (free text)','text',70],['guildTag','Guild tag (2–4 letters)','text',4],['favoriteClass','Favorite class or build','text',45],
 ['raidStatus','Daily raid teams','text',90],['guildStatus','Guild recruitment','text',90]
];
const profileCard=(p,{full=false}={})=>{
 if(!p)return notice('Player profile not available.');
 return '<article class="playerCard arcPlayerCard arcBanner-'+esc(p.bannerTheme||'nebula')+'"><div class="arcProfileBanner"><span>ARCANA · PLAYER IDENTITY</span><strong>'+esc(p.tagline||'Your place in the IdleArc community')+'</strong></div><div class="playerCardHead"><span class="playerAvatar">'+(p.avatarDataUrl?'<img src="'+esc(p.avatarDataUrl)+'" alt="" loading="lazy">':esc((p.displayName||'?').slice(0,1).toUpperCase()))+'</span><div><span class="eyebrow">ARCANA PLAYER CARD</span><h2>'+titleProfile(p)+'</h2><div class="roleBadges">'+labels(p.roles)+labels(p.awards)+(p.verifiedCharacter?'<span class="accountRole arcVerifiedBadge">✓ Arcana-Reviewed Character</span>':'')+'</div></div></div>'+
 (p.featuredBadges?.length?'<div class="arcFeaturedBadges"><small>FEATURED BADGES</small><div>'+p.featuredBadges.map(id=>'<span class="accountRole arcFeaturedBadge">'+esc(id==='verified-character'?'✓ Character Verified':([...p.roles||[],...p.awards||[]].find(r=>r.id===id)?.label)||id)+'</span>').join('')+'</div></div>':'')+
 '<div class="playerFacts">'+[
  ['VERIFIED CHARACTER',p.verifiedCharacter?.name],['IN-GAME NAME',p.inGameName],['GUILD',p.guild],['FAVORITE CLASS',p.favoriteClass],
  ['RAID TEAM STATUS',p.raidStatus],['GUILD STATUS',p.guildStatus]
 ].filter(([,v])=>v).map(([k,v])=>'<div><small>'+k+'</small><strong>'+esc(v)+'</strong></div>').join('')+'</div>'+
 (p.description?'<p class="playerBio">'+esc(p.description)+'</p>':'')+
 (full?'<button type="button" class="btn secondary" data-community-action="copy-profile" data-id="'+esc(p.id)+'">'+icon('link',16)+' Copy player-card link</button>':'<button class="btn secondary" data-route="profile" data-params="id='+esc(p.id)+'">View player card '+icon('arrow',15)+'</button>')+
 '</article>';
};
const signInPanel=()=>'<section class="arcAccountJoin" aria-label="Sign up or log in to Arcana">'+
 '<div class="arcAccountJoinIntro"><h2>Welcome to Arcana</h2><p>Choose how you want to sign in or create your account.</p></div>'+
 '<div class="arcSignInMethods">'+
 (state.providers.google?'<a class="arcAccountJoinPrimary arcGoogleLogin" href="/api/account/google/login" aria-label="Continue with Google">'+
 '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.22c0-.73-.07-1.42-.19-2.1H12v3.97h5.24a4.48 4.48 0 0 1-1.95 2.94v2.45h3.16c1.84-1.7 2.9-4.2 2.9-7.26Z"/><path fill="#34A853" d="M12 21.7c2.62 0 4.83-.87 6.45-2.22l-3.16-2.45c-.88.58-2 .93-3.29.93-2.53 0-4.67-1.71-5.44-4.02H3.3v2.52A9.75 9.75 0 0 0 12 21.7Z"/><path fill="#FBBC05" d="M6.56 13.94a5.8 5.8 0 0 1 0-3.73V7.69H3.3a9.75 9.75 0 0 0 0 8.77l3.26-2.52Z"/><path fill="#EA4335" d="M12 6.2c1.43 0 2.71.49 3.72 1.46l2.79-2.79A9.31 9.31 0 0 0 12 2.45a9.75 9.75 0 0 0-8.7 5.24l3.26 2.52c.77-2.31 2.91-4.02 5.44-4.02Z"/></svg>'+
 ' Continue with Google '+icon('arrow',16)+'</a>':'')+
 (state.providers.discord?'<a class="arcAccountJoinPrimary arcDiscordLogin" href="/api/account/login" aria-label="Continue with Discord">'+icon('users',20)+' Continue with Discord '+icon('arrow',16)+'</a>':'')+
 '</div>'+
 (!state.enabled?'<p class="arcAccountAuthUnavailable" role="status">Account sign-in is not configured in this environment. Arcana tools remain available without an account.</p>':'')+
 '<p class="mutedSmall arcSignInHelp">Already have an account? Use your original sign-in method, then connect another method in My Arcana. Accounts are never merged automatically.</p>'+
 (state.betaEnrollmentOpen?'<p class="arcBetaPerk">'+icon('award',17)+' New members joining during the founding beta period receive a permanent Beta Tester badge.</p>':'')+
 '<p class="arcAccountJoinLegal"><a href="/privacy.html">Privacy</a> · <a href="/beta-rules.html">Community Guidelines</a></p></section>';
const linkedSignInMethods=p=>'<section class="arcLinkedLogins" aria-label="Connected sign-in methods"><h2>Sign-in methods</h2>'+
 '<p class="mutedSmall">Connect another sign-in method to this same Arcana account.</p>'+
 '<div class="arcLinkedLoginRow"><strong>Google</strong>'+
 (p.authProviders?.google?'<span class="arcLoginConnected">'+icon('check',16)+' Connected</span>':
 state.providers.google?'<a href="/api/account/google/link" class="btn secondary">Connect Google</a>':'<small>Not configured yet</small>')+'</div>'+
 '<div class="arcLinkedLoginRow"><strong>Discord</strong>'+
 (p.authProviders?.discord?'<span class="arcLoginConnected">'+icon('check',16)+' Connected</span>':
 state.providers.discord?'<a href="/api/account/discord/link" class="btn secondary">Connect Discord</a>':'<small>Not configured yet</small>')+'</div></section>';
const profileForm=p=>{
 return '<form class="accountProfileForm" data-community-form="profile"><h2>Edit player card</h2>'+
 fields.map(([key,label,type,max])=>'<label>'+label+'<input name="'+key+'" type="'+type+'" maxlength="'+max+'" value="'+esc(p[key]||'')+'"></label>').join('')+
 '<label>Player card picture (optional)<input id="arcanaAvatarFile" type="file" accept="image/png,image/jpeg,image/webp"></label><button type="button" class="btn secondary" data-community-action="clear-avatar">Remove picture</button><p id="arcanaAvatarStatus" class="mutedSmall" role="status"></p>'+ 
 '<label>Profile banner style<select name="bannerTheme">'+[['nebula','Nebula Violet'],['frost','Frost Blue'],['ember','Infernal Ember'],['forest','Verdant Forest'],['royal','Royal Indigo']].map(([id,label])=>'<option value="'+id+'"'+((p.bannerTheme||'nebula')===id?' selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
 '<label>Short profile tagline<input name="tagline" maxlength="100" placeholder="Something other players should know" value="'+esc(p.tagline||'')+'"></label>'+
 '<fieldset class="arcBadgeSelector"><legend>Feature up to three earned badges</legend>'+[...(p.roles||[]).map(x=>[x.id,x.label]),...(p.awards||[]).map(x=>[x.id,x.label]),...(p.verifiedCharacter?[['verified-character','Character Verified']]:[])].map(([id,label])=>'<label><input type="checkbox" name="featuredBadges" value="'+esc(id)+'"'+(p.featuredBadges?.includes(id)?' checked':'')+'>'+esc(label)+'</label>').join('')+'</fieldset>'+
 '<label>About your character and what you are looking for<textarea name="description" maxlength="500" rows="5" placeholder="Builds you enjoy, raid team goals, or guild details">'+esc(p.description||'')+'</textarea></label>'+
 '<button class="btn primary" type="submit">Save player card</button><p class="mutedSmall">Tags may be 2–4 letters (A–Z) and must be unclaimed or belong to your registered guild. Unregistered tags remain gray; approved registered tags use their chosen colors. <button class="inlineLink" type="button" data-route="guilds">Explore guilds</button></p><p class="mutedSmall">Everything on this card is public. Only share details you want other players to see. Guild and class information is self-reported.</p></form>';
};
export const accountSpecialPortalMarkup=profile=>profile?.isOwner===true?
 '<div class="arcOwnerPortal"><div><span class="eyebrow">OWNER ACCESS</span><strong>Site management</strong></div><button type="button" class="btn primary" data-route="admin">'+icon('shield',17)+' Admin Control Panel '+icon('arrow',15)+'</button></div>':'';
function accountView(query=new URLSearchParams()){
 if(state.me===undefined)return notice('Loading your Arcana account…');
 if(!state.me)return '<div class="communityPage arcAccount arcAccountGuest"><div class="communityHero"><span class="eyebrow">MY ARCANA</span><h1>Account</h1></div>'+(query?.get('error')==='sign-in'?'<p class="arcAccountLoginError" role="alert">Sign-in or account linking did not complete. Try again or use your original sign-in method.</p>':'')+signInPanel()+'</div>';
 const p=state.me,requested=query?.get('tab'),tab=['overview','profile','character','saves','contributions'].includes(requested)?requested:'overview';
 const tabs=[['overview','Overview'],['profile','Profile & settings'],['character','Character link'],['saves','Saved work'],['contributions','My contributions']];
 const nav='<nav class="arcAccountTabs" aria-label="Account sections">'+tabs.map(([id,label])=>'<button type="button" data-route="account" data-params="tab='+id+'" class="'+(tab===id?'active':'')+'" aria-current="'+(tab===id?'page':'false')+'">'+label+'</button>').join('')+'</nav>';
 const quick='<div class="arcAccountQuick"><button data-route="guilds">'+icon('shield',19)+' Guild Hub</button><button data-route="records">'+icon('book',19)+' Season History</button><button data-route="settings">'+icon('settings',19)+' Site Preferences</button><button data-route="beta">'+icon('info',19)+' Feedback</button></div>';
 const contributions=state.myPosts.length?'<section class="communityMyPosts"><h2>My published guides & builds</h2><div class="communityPostGrid">'+state.myPosts.map(communityPostCard).join('')+'</div></section>':notice('Your published builds and guides will appear here.');
 const content=tab==='overview'?profileCard(p,{full:true})+quick+
 '<div class="arcAccountQuick"><button data-route="account" data-params="tab=character">Link a character</button><button data-route="account" data-params="tab=saves">Saved builds</button><button data-route="community/create">Share a guide</button></div>':
 tab==='profile'?profileForm(p):
 tab==='character'?accountCharacterLink(p):
 tab==='saves'?farmListsAccountView()+cloudBuildView():
 contributions+'<button class="btn primary" data-route="community/create">Publish a guide or build</button>';
 return '<div class="communityPage arcAccount"><div class="communityHero"><span class="eyebrow">MY ARCANA</span><h1>My Account</h1></div>'+
 nav+accountSpecialPortalMarkup(p)+content+(tab==='overview'||tab==='profile'?linkedSignInMethods(p):'')+
 '<div class="communityAccountActions"><button class="btn secondary" data-community-action="logout">Sign out</button></div></div>';
}
const communityPostCard=p=>'<article class="communityPostCard"><span class="eyebrow">'+esc(p.kind==='build'?'PLAYER BUILD':'PLAYER GUIDE')+'</span>'+
 '<h3>'+esc(p.title)+'</h3><p>'+esc(p.summary)+'</p><small>'+esc(p.createdAt?new Date(p.createdAt).toLocaleDateString():'')+'</small>'+
 '<div class="communityPostActions"><button class="btn secondary" data-route="community/post" data-params="id='+esc(p.id)+'">Open '+icon('arrow',15)+'</button>'+
 (p.authorId?'<button class="btn secondary" data-route="profile" data-params="id='+esc(p.authorId)+'">Player card</button>':'')+'</div></article>';
function communityView(){
 return '<div class="communityPage communityConnected"><div class="communityHero"><span class="eyebrow">ARCANA COMMUNITY</span><h1>Find your people. Share what works.</h1><p>Guilds, player-created builds, and useful guides, connected with the rest of Arcana. No need to hunt through five different menus.</p>'+
 (state.me?'<button class="btn primary" data-route="community/create">'+icon('plus',17)+' Share a build or guide</button>':'<button class="btn secondary" data-route="account">Sign in to share your build</button>')+'</div>'+
 '<section class="communityPathways" aria-label="Explore community resources">'+
 '<button type="button" class="communityPathway" data-route="guilds"><span>'+icon('shield',26)+'</span><strong>Guild Hub</strong><small>Find guilds, recruitment and members.</small><em>Explore guilds →</em></button>'+
 '<button type="button" class="communityPathway" data-route="wiki/guides"><span>'+icon('book',26)+'</span><strong>Guides &amp; Wiki</strong><small>Published strategies and verified game knowledge.</small><em>Read guides →</em></button>'+
 '<button type="button" class="communityPathway" data-route="records"><span>'+icon('award',26)+'</span><strong>Season History</strong><small>Discover the top players and guilds from past seasons.</small><em>Explore history →</em></button>'+ 
 '<button type="button" class="communityPathway" data-route="labs/build"><span>'+icon('flask',26)+'</span><strong>Build Studio</strong><small>Inspect a setup and experiment with your own.</small><em>Try Build Studio →</em></button>'+
 '<a class="communityPathway" href="/journal"><span>'+icon('clock',26)+'</span><strong>Arcana Journal</strong><small>News, analysis and balance discussions.</small><em>Latest stories →</em></a></section>'+
 '<div class="communityContributionHead"><div><span class="eyebrow">FROM THE COMMUNITY</span><h2>Player builds &amp; guides</h2></div><button type="button" class="btn secondary" data-route="wiki/guides">Browse all guides →</button></div>'+
 '<div class="communityPostGrid">'+(state.posts.length?state.posts.map(communityPostCard).join(''):notice('No community contributions yet. Browse the guides, plan a build, or be the first to share.'))+'</div></div>';
}
const niceParagraphs=body=>String(body||'').split(/\n\s*\n/).filter(Boolean).map(p=>'<p>'+esc(p)+'</p>').join('');
function detailView(){
 const p=state.post;
 if(!p)return notice('Loading community post…');
 const mine=state.me?.id===p.authorId,mod=state.me?.permissions?.hideContent,admin=state.me?.permissions?.deleteContent;
 return '<div class="communityPage"><button class="wikiBack" data-route="community">'+icon('back',16)+' Community library</button>'+
 '<article class="communityArticle"><span class="eyebrow">'+esc(p.kind==='build'?'PLAYER BUILD':'PLAYER GUIDE')+' · '+esc(p.status==='hidden'?'HIDDEN':'COMMUNITY')+'</span>'+
 '<h1>'+esc(p.title)+'</h1><p class="lead">'+esc(p.summary)+'</p>'+
 '<button class="btn secondary" data-route="profile" data-params="id='+esc(p.authorId)+'">View creator profile</button>'+
 '<div class="communityBody">'+niceParagraphs(p.body)+'</div>'+
 (p.kind==='build'&&p.build?'<button class="btn primary" data-community-action="use-build">'+icon('flask',18)+' Copy build into Build Studio</button>':'')+
 ((mod||admin)?'<div class="communityModeration"><h2>Moderation</h2>'+
 (mod?'<button class="btn secondary" data-community-action="visibility" data-id="'+esc(p.id)+'">'+(p.status==='hidden'?'Restore public visibility':'Hide this post')+'</button>':'')+
 (admin?'<button class="studioDanger" data-community-action="delete" data-id="'+esc(p.id)+'">Delete post permanently</button>':'')+'</div>':'')+
 (mine?'<div class="communityPostActions">'+(p.status==='public'?'<button class="btn secondary" data-community-action="edit" data-id="'+esc(p.id)+'">Edit my contribution</button>':'')+(p.status==='public'||p.status==='archived'?'<button class="btn secondary" data-community-action="archive" data-id="'+esc(p.id)+'">'+(p.status==='archived'?'Restore publication':'Unpublish temporarily')+'</button>':'')+'</div>':'')+'</article></div>';
}
function createView(query){
 if(!state.me)return '<div class="communityPage"><h1>Share with the community</h1>'+signInPanel()+'</div>';
 const editing=query.get('edit')&&state.post?.id===query.get('edit')?state.post:null;
 const kind=editing?.kind||(query.get('kind')==='build'?'build':'guide');
 return '<div class="communityPage"><div class="communityHero"><span class="eyebrow">PLAYER CONTENT</span><h1>'+(editing?'Edit my contribution':'Publish a community contribution')+'</h1><p>These posts appear in the community area, not ArcanaWiki. Your player card is credited automatically.</p></div>'+
 '<form class="communityCreateForm" data-community-form="post" data-edit-id="'+esc(editing?.id||'')+'">'+
 '<label>Contribution type<select name="kind" '+(editing?'disabled':'')+'><option value="guide" '+(kind==='guide'?'selected':'')+'>Guide</option><option value="build" '+(kind==='build'?'selected':'')+'>Build Studio snapshot</option></select></label>'+
 '<label>Title<input name="title" maxlength="110" value="'+esc(editing?.title||'')+'" required placeholder="A useful title for other players"></label>'+
 '<label>Short summary<textarea name="summary" maxlength="300" rows="3" required placeholder="What will other players learn?">'+esc(editing?.summary||'')+'</textarea></label>'+
 '<label>Details<textarea name="body" maxlength="12000" rows="10" placeholder="Explain your choices, goals and tradeoffs">'+esc(editing?.body||'')+'</textarea></label>'+
 '<p class="mutedSmall">Build posts attach your current locally saved Build Studio draft. Guests can still share normal planner links without publishing anything.</p>'+
 '<button class="btn primary" type="submit">'+(editing?'Save changes':'Publish to community')+'</button></form></div>';
}
export function communityPage(route,query){
 if(route==='account')return accountView(query);
 if(route==='profile')return '<div class="communityPage"><button class="wikiBack" data-route="community">'+icon('back',16)+' Community</button>'+profileCard(state.profile,{full:true})+(state.profilePosts.length?'<section class="communityMyPosts"><h2>Builds & guides by this player</h2><div class="communityPostGrid">'+state.profilePosts.map(communityPostCard).join('')+'</div></section>':'')+'</div>';
 if(route==='community')return communityView();
 if(route==='community/post')return detailView();
 if(route==='community/create')return createView(query);
 return '';
}
export function currentAccount(){return state.me||null}
export function accountStatus(){return {enabled:state.enabled===true,authenticated:!!state.me}}
export async function refreshAccount(){
 try{const data=await getJSON('/api/account/me');state.me=data.user;state.enabled=Boolean(data.enabled);state.providers={discord:Boolean(data.providers?.discord),google:Boolean(data.providers?.google)};state.betaEnrollmentOpen=Boolean(data.betaEnrollmentOpen);}
 catch{state.me=null;state.enabled=false;state.providers={discord:false,google:false};}
}
export async function loadCommunityPage(route,query,refresh){
 const key=route+'?'+query.toString();
 if(state.requested===key)return;
 state.requested=key;
 try{
  if(state.me===undefined)await refreshAccount();
  if(['account','profile','community'].includes(route)){try{state.guildRegistry=(await getJSON('/api/guild-hub')).guilds||[];}catch{state.guildRegistry=[];}}
  if(route==='community'){state.posts=(await getJSON('/api/community/posts')).posts||[];}
  else if(route==='community/post'){state.post=(await getJSON('/api/community/posts/'+encodeURIComponent(query.get('id')||''))).post;}
  else if(route==='community/create'&&query.get('edit')){state.post=(await getJSON('/api/community/posts/'+encodeURIComponent(query.get('edit')))).post;}
  else if(route==='account'&&state.me){state.myPosts=(await getJSON('/api/community/mine')).posts||[];await loadAccountBuilds();await loadFarmingLists();}
  else if(route==='profile'){const id=query.get('id')||'';state.profile=(await getJSON('/api/profiles/'+encodeURIComponent(id))).profile;state.profilePosts=(await getJSON('/api/community/posts?authorId='+encodeURIComponent(id))).posts||[];}
  state.error='';
 }catch(e){state.error=e.message;state.post=null;state.profile=null;}
 if(location.hash.replace(/^#\/?/,'').split('?')[0]===route)refresh();
}
async function shrinkAvatar(file){
 if(!/^image\/(?:png|jpeg|webp)$/.test(file.type)||file.size>4000000)throw Error('Choose a PNG, JPG or WebP under 4 MB.');
 const url=URL.createObjectURL(file);
 try{
  const picture=new Image();
  await new Promise((resolve,reject)=>{picture.onload=resolve;picture.onerror=reject;picture.src=url;});
  const side=Math.min(picture.width,picture.height);
  if(!side)throw Error('Image is empty.');
  const canvas=document.createElement('canvas');canvas.width=144;canvas.height=144;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image processing is unavailable in this browser.');
  ctx.drawImage(picture,(picture.width-side)/2,(picture.height-side)/2,side,side,0,0,144,144);
  const data=canvas.toDataURL('image/webp',0.72);
  if(!data.startsWith('data:image/webp;base64,')||data.length>62000)throw Error('Picture is too large after resizing.');
  return data;
 }finally{URL.revokeObjectURL(url);}
}
export function wireCommunityUI({go,getBuild,applyBuild,refresh,toast}){
 wireCloudBuildUI({go,getBuild,applyBuild,refresh,toast});
 document.addEventListener('change',e=>{
  if(e.target.id!=='arcanaAvatarFile')return;
  const file=e.target.files?.[0];if(!file)return;
  const status=document.getElementById('arcanaAvatarStatus');if(status)status.textContent='Resizing picture…';
  void shrinkAvatar(file).then(data=>{avatarPending=data;if(status)status.textContent='Picture ready. Save your player card to publish it.';}).catch(err=>{avatarPending=null;if(status)status.textContent=err.message;});
 });
 document.addEventListener('click',e=>{
  const el=e.target.closest('[data-community-action]');if(!el)return;
  e.preventDefault();
  const action=el.dataset.communityAction,id=el.dataset.id;
  (async()=>{
   if(action==='edit'){go('community/create',{edit:id});return;}
    if(action==='archive'){
     const archived=state.post?.status!=='archived';
     if(archived&&!confirm('Unpublish this contribution? You can restore it later from your account.'))return;
     const result=await getJSON('/api/community/posts/'+encodeURIComponent(id)+'/archive',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({archived})});
     state.post=result.post;state.requested='';toast(archived?'Contribution unpublished.':'Contribution restored.');refresh();return;
    }
    if(action==='clear-avatar'){avatarPending='';const el=document.getElementById('arcanaAvatarStatus');if(el)el.textContent='Picture will be removed when you save your player card.';return;}
    if(action==='copy-profile'){await navigator.clipboard.writeText(location.origin+'/#/profile?id='+encodeURIComponent(id));toast('Player card copied.');return;}
   if(action==='logout'){await getJSON('/api/account/logout',{method:'POST'});state.me=null;state.requested='';window.dispatchEvent(new Event('arcana:account-updated'));go('account');refresh();return;}
   if(action==='use-build'){if(!state.post?.build)throw Error('This build is unavailable.');applyBuild(state.post.build);toast('Build copied to your local workspace.');go('labs/build');return;}
   if(action==='visibility'){
    const next=state.post?.status==='hidden'?'public':'hidden';
    if(next==='hidden'&&!confirm('Hide this community contribution from public viewing?'))return;
    await getJSON('/api/community/posts/'+encodeURIComponent(id)+'/visibility',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({status:next,reason:'Moderator action'})});
    state.requested='';await loadCommunityPage('community/post',new URLSearchParams({id}),refresh);return;
   }
   if(action==='delete'){
    if(!confirm('Permanently delete this post? This action cannot be undone.'))return;
    await getJSON('/api/community/posts/'+encodeURIComponent(id),{method:'DELETE'});
    state.requested='';go('community');return;
   }
  })().catch(err=>toast(err.message));
 });
 document.addEventListener('submit',e=>{
  const form=e.target.closest('[data-community-form]');if(!form)return;
  e.preventDefault();
  (async()=>{
   const data=Object.fromEntries(new FormData(form));
   if(form.dataset.communityForm==='profile'){
    if(avatarPending!==null)data.avatarDataUrl=avatarPending;
    data.featuredBadges=new FormData(form).getAll('featuredBadges');
     const out=await getJSON('/api/account/profile',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({profile:data})});
     avatarPending=null;
    state.me=out.profile;window.dispatchEvent(new Event('arcana:account-updated'));toast('Player card updated.');refresh();return;
   }
   if(form.dataset.communityForm==='roles'){
    const id=String(data.id||'').trim();
    if(!/^[a-f0-9-]{36}$/.test(id))throw Error('Use the player ID from their public profile URL.');
    const roles=new FormData(form).getAll('roles');
    await getJSON('/api/admin/roles/'+encodeURIComponent(id),{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({roles})});
    toast('Approved roles updated.');return;
   }
   if(form.dataset.communityForm==='post'){
    const snapshot=data.kind==='build'?getBuild():null;
    if(data.kind==='build'&&!snapshot)throw Error('Create and save a build in Build Studio first.');
    const editId=form.dataset.editId;
    if(editId&&state.post?.id!==editId)throw Error('Reload the contribution before editing.');
    const endpoint=editId?'/api/community/posts/'+encodeURIComponent(editId):'/api/community/posts';
    const payload={...data,...(editId?{baseRevision:state.post.revision}:{}),
     ...(data.kind==='build'||(editId&&state.post.kind==='build')?{build:editId?state.post.build:snapshot}:{})};
    if(editId)payload.kind=state.post.kind;
    const out=await getJSON(endpoint,{method:editId?'PATCH':'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    state.post=out.post;state.requested='';go('community/post',{id:out.post.id});return;
   }
  })().catch(err=>toast(err.message));
 });
}
