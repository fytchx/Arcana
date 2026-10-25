/* Player identity, private character-review queue and editorial season archive. */
import {esc,icon} from './ui.js';
const state={records:[],revision:0,recordsReady:false,recordsLoading:false,claims:[],claimsReady:false,claimsLoading:false,myClaim:undefined,myClaimLoading:false,proof:null,error:'',selectedSeason:'all',recordEdit:'',uploadedProof:''};
const api=async(path,options={})=>{const r=await fetch('/api/arcana-archive'+path,{credentials:'same-origin',cache:'no-store',...options}),out=await r.json();if(!r.ok)throw Error(out.error||'Archive unavailable.');return out};
const b=(title,route,description)=>'<button type="button" class="arcArchiveNav" data-route="'+esc(route)+'"><strong>'+esc(title)+'</strong><span>'+esc(description)+'</span>'+icon('arrow',16)+'</button>';
export function accountCharacterLink(me){
 if(!me)return '';
 const claim=state.myClaim,verified=me.verifiedCharacter?.name,disabled=claim?.status==='pending'||claim?.status==='approved';
 return '<section class="arcArchiveBox"><div class="arcArchiveSectionHead"><span class="eyebrow">CHARACTER IDENTITY</span><h2>Link your IdleArc character</h2></div>'+
 '<p>Upload a screenshot of your name as shown on IdleArc’s main monster-fighting screen. An Arcana moderator will manually review it. This is a community-reviewed claim, not official game API verification.</p>'+
 (verified?'<div class="arcVerified"><span>✓</span><div><strong>Arcana-reviewed character</strong><small>'+esc(verified)+'</small></div></div>':'')+
 (claim?.status?'<p class="arcClaimStatus">Claim status: <strong>'+esc(claim.status)+'</strong> · '+esc(claim.name||'')+(claim.note?' · '+esc(claim.note):'')+'</p>':state.myClaim===undefined?'<p>Loading your claim status…</p>':'<p>No claim submitted yet.</p>')+
 (!disabled?'<form data-arc-form="claim" class="arcClaimForm"><label>Character name exactly as shown in-game<input name="name" maxlength="48" minlength="2" required placeholder="e.g. [OVK] Fytch" value="'+esc(me.inGameName||'')+'"></label>'+
 '<label>Screenshot showing the name on the combat screen<input type="file" id="arcCharacterProof" accept="image/png,image/jpeg,image/webp" required></label>'+
 '<p id="arcCharacterProofStatus" role="status">Screenshots are resized before uploading and are visible only to authorized reviewers.</p>'+
 '<button class="btn primary" type="submit">Request character verification</button></form>':'<p class="arcPrivateHint">An approved claim can be revoked by staff if your character identity changes. Pending claims must be reviewed before resubmitting.</p>')+
 '</section>';
}
const classes=['Warrior','Mage','Rogue','Archer','Druid'];
const recordTitle=r=>r.category==='guild'?'Guild':r.category==='class'?r.characterClass:'Individual';
const seasonOptions=()=>[...new Set(state.records.map(x=>x.season))].sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
export function seasonalRecordsView(){
 const seasons=seasonOptions(),chosen=state.selectedSeason!=='all'&&seasons.includes(state.selectedSeason)?state.selectedSeason:'all';
 const filtered=state.records.filter(r=>chosen==='all'||r.season===chosen);
 const buckets=new Map();
 for(const r of filtered){const key=r.season+'|'+recordTitle(r);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(r)}
 return '<link rel="stylesheet" href="/community-archive.css?v=20261025"><main class="arcArchive"><header class="arcArchiveHero"><span class="eyebrow">IDLEARC HISTORY · ARCANA COMMUNITY</span><h1>Seasons &amp; legends</h1><p>A permanent home for IdleArc’s notable players, class leaders and guilds. Entries are manually curated from community evidence, not a live game leaderboard.</p></header>'+
 '<nav class="arcArchiveJump"><button data-route="community">Community</button><button data-route="guilds">Guild Hub</button><button data-route="account">My Arcana</button></nav>'+
 '<label class="arcArchiveFilter">Explore a season<select id="arcSeasonFilter"><option value="all">All seasons</option>'+seasons.map(x=>'<option value="'+esc(x)+'"'+(chosen===x?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label>'+
 (!state.recordsReady?'<p class="arcArchiveLoading">Loading the community archive…</p>':!filtered.length?'<section class="arcArchiveEmpty"><span>✧</span><h2>History starts here.</h2><p>No season records have been published yet. Staff can add verified screenshots, placements, and achievements before announcing a season’s results.</p></section>':
 [...buckets].map(([label,rows])=>'<section class="arcArchiveSeason"><div class="arcArchiveSectionHead"><span class="eyebrow">'+esc(label.split('|')[0])+'</span><h2>'+esc(label.split('|')[1])+' rankings</h2></div><div class="arcArchiveRecords">'+rows.sort((a,b)=>a.rank-b.rank).map(r=>
 '<article class="arcArchiveRecord"><span class="arcRecordRank">#'+r.rank+'</span><div><strong>'+esc(r.name)+'</strong><p>'+esc(r.description)+'</p><small>'+esc(r.season)+' · '+esc(recordTitle(r))+(r.source?' · <a href="'+esc(r.source)+'" target="_blank" rel="noopener noreferrer">Evidence ↗</a>':' · Manually entered')+'</small></div>'+(r.profileId?'<button type="button" class="btn secondary" data-route="profile" data-params="id='+esc(r.profileId)+'">Profile</button>':'')+'</article>').join('')+'</div></section>').join(''))+
 '<p class="arcPrivateHint">Historical entries are maintained by Arcana staff. They may be corrected as additional evidence becomes available.</p></main>';
}
const roleMatrix=[
 ['Guest','Open public tools, wiki, guides, records'],
 ['Member','Publish community guides and builds; request character linking'],
 ['Founding Beta Tester','Permanent recognition badge, no staff powers'],
 ['Wiki Editor','Create and publish official wiki content'],
 ['Moderator','Review character claims, moderate community content, handle guild approvals'],
 ['Developer','Contributor recognition; no automatic production administration'],
 ['Admin','Manage members, themes, seasonal records and private labs'],
 ['Creator','Protected owner privileges and staff assignment']
];
export function staffCommunityView(me){
 if(!me?.permissions?.staffAccess)return '<main class="arcArchive"><h1>Staff area</h1><p>Sign in with a permitted Arcana staff account.</p></main>';
 const claims=state.claims||[];
 const canReview=me.permissions.reviewCharacters,canRecords=me.permissions.manageRecords;
 return '<link rel="stylesheet" href="/community-archive.css?v=20261025"><main class="arcArchive"><header class="arcArchiveHero"><span class="eyebrow">ARCANA · STAFF WORKSPACE</span><h1>Community Operations</h1><p>Review identities, curate season history, publish content, and work with the permissions associated with your role.</p></header>'+
 '<div class="arcArchiveNavGrid">'+(me.permissions.manageRoles?b('Members & Roles','admin','Account management and role assignments'):'')+(me.permissions.publishWiki?b('Wiki Studio','wiki/studio','Editorial publishing and reference corrections'):'')+(me.permissions.hideContent?b('Feedback inbox','beta/reports','Community-reported issues and suggestions'):'')+b('Season archive','records','Public season history')+(me.permissions.manageSite?b('Private Tools','admin','Unreleased calculators and testing'):'')+'</div>'+
 (canReview?'<section class="arcArchiveBox"><div class="arcArchiveSectionHead"><span class="eyebrow">STAFF · PRIVATE EVIDENCE</span><h2>Character verification queue</h2></div><p>Review the screenshot against the submitted name. Screenshots are private; only approval status and verified character names appear on public profiles.</p>'+
 '<button class="btn secondary" type="button" data-arc-action="reload-claims">Refresh claims</button>'+
 (!state.claimsReady?'<p>Loading claims…</p>':claims.length?'<div class="arcClaims">'+claims.map(x=>
 '<article class="arcClaimRow"><div><strong>'+esc(x.name)+'</strong><small>'+esc(x.status)+' · '+esc(x.submittedAt)+'</small>'+(x.note?'<small>'+esc(x.note)+'</small>':'')+'</div><div class="arcClaimActions"><button type="button" data-arc-action="proof" data-id="'+esc(x.id)+'">View proof</button>'+
 (x.status==='pending'?'<button type="button" data-arc-action="approve" data-id="'+esc(x.id)+'">Approve</button><button type="button" data-arc-action="reject" data-id="'+esc(x.id)+'">Reject</button>':'')+
 (x.status==='approved'?'<button type="button" data-arc-action="revoke" data-id="'+esc(x.id)+'">Revoke</button>':'')+'</div></article>').join('')+'</div>':'<p>No claims submitted yet.</p>')+
 '<div id="arcProofPreview" class="arcProofPreview" aria-live="polite"></div></section>':'')+
 (canRecords?'<section class="arcArchiveBox"><div class="arcArchiveSectionHead"><span class="eyebrow">HISTORY EDITOR</span><h2>Publish a season record</h2></div><p>Only publish results you have independently confirmed. Rankings begin empty and can be revised or removed later.</p>'+
 '<form data-arc-form="record" class="arcRecordForm"><input type="hidden" name="id" id="arcRecordId" value=""><label>Season<input name="season" required maxlength="50" placeholder="Season 2"></label>'+
 '<label>Category<select name="category"><option value="guild">Guild</option><option value="class">Class</option><option value="individual">Individual</option></select></label>'+
 '<label>Class (for class rankings)<select name="characterClass"><option value="">No class</option>'+classes.map(x=>'<option>'+x+'</option>').join('')+'</select></label>'+
 '<label>Rank<input type="number" name="rank" min="1" max="500" required value="1"></label>'+
 '<label>Player or guild name<input name="name" required maxlength="88"></label>'+
 '<label>Description<textarea name="description" minlength="8" maxlength="500" rows="3" required placeholder="What did they achieve and when?"></textarea></label>'+
 '<label>Evidence URL (HTTPS, optional)<input type="url" name="source" placeholder="https://..." maxlength="400"></label>'+
 '<label>Linked Arcana profile ID (optional)<input name="profileId" maxlength="36" placeholder="Approved Arcana account ID"></label>'+
 '<div class="arcClaimActions"><button type="submit" class="btn primary">Save season record</button><button type="reset" class="btn secondary" data-arc-action="reset-record">New record</button></div></form>'+
 (state.records.length?'<div class="arcRecordsAdmin">'+state.records.map(x=>
 '<article class="arcClaimRow"><div><strong>'+esc(x.season)+' · '+esc(recordTitle(x))+' #'+x.rank+' · '+esc(x.name)+'</strong><small>'+esc(x.description)+'</small></div><div class="arcClaimActions"><button data-arc-action="edit-record" data-id="'+esc(x.id)+'">Edit</button><button data-arc-action="delete-record" data-id="'+esc(x.id)+'">Delete</button></div></article>').join('')+'</div>':'<p>No published records yet.</p>')+'</section>':'')+
 '<section class="arcArchiveBox"><div class="arcArchiveSectionHead"><span class="eyebrow">SERVER-ENFORCED ROLES</span><h2>Who can do what?</h2></div><div class="arcRoleGrid">'+roleMatrix.map(([n,d])=>'<div><strong>'+n+'</strong><span>'+d+'</span></div>').join('')+'</div><p>Staff permissions are checked on the server, not granted by a visible badge. Only the site owner can grant privileged Admin and Developer roles.</p></section></main>';
}
export async function loadArchiveData(route,me,refresh){
 try{
  if(['records','staff'].includes(route)&&!state.recordsReady&&!state.recordsLoading){
   state.recordsLoading=true;try{const d=await api('/records');state.records=d.records||[];state.revision=d.revision||0;state.recordsReady=true;}finally{state.recordsLoading=false}refresh();
  }
  if(route==='account'&&me&&state.myClaim===undefined&&!state.myClaimLoading){
   state.myClaimLoading=true;try{state.myClaim=(await api('/claim/me')).claim||null;}finally{state.myClaimLoading=false}refresh();
  }
  if(route==='staff'&&me?.permissions?.reviewCharacters&&!state.claimsReady&&!state.claimsLoading){
   state.claimsLoading=true;try{state.claims=(await api('/claims')).claims||[];state.claimsReady=true;}finally{state.claimsLoading=false}refresh();
  }
 }catch(e){state.error=e.message;console.warn('Arcana community archive:',e.message);}
}
async function optimizeScreenshot(file){
 if(!/^image\/(?:png|jpeg|webp)$/.test(file.type)||file.size>9000000)throw Error('Choose an image under 9 MB.');
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();await new Promise((ok,bad)=>{image.onload=ok;image.onerror=bad;image.src=url});
  if(image.width<120||image.height<80)throw Error('Image is too small to review.');
  for(const size of [1200,1000,850,700]){
   const ratio=Math.min(1,size/Math.max(image.width,image.height)),canvas=document.createElement('canvas');
   canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
   for(const q of [.85,.75,.63]){const result=canvas.toDataURL('image/jpeg',q);if(result.length<395000)return result;}
  }
  throw Error('Screenshot is still too large. Crop to the in-game character name and health bar.');
 }finally{URL.revokeObjectURL(url);}
}
export function wireArchiveUI({go,refresh,toast}){
 document.addEventListener('change',e=>{
  if(e.target.id==='arcSeasonFilter'){state.selectedSeason=e.target.value;refresh()}
  if(e.target.id==='arcCharacterProof'){
   const file=e.target.files?.[0];state.uploadedProof='';if(!file)return;
   const status=document.getElementById('arcCharacterProofStatus');if(status)status.textContent='Preparing screenshot…';
   void optimizeScreenshot(file).then(result=>{state.uploadedProof=result;if(status)status.textContent='Screenshot ready for review.'}).catch(err=>{if(status)status.textContent=err.message});
  }
 });
 document.addEventListener('submit',e=>{
  const form=e.target.closest('[data-arc-form]');if(!form)return;e.preventDefault();
  const kind=form.dataset.arcForm;
  void(async()=>{
   if(kind==='claim'){
    if(!state.uploadedProof)throw Error('Choose a screenshot and wait until it is ready.');
    const name=form.elements.namedItem('name').value.trim();
    const out=await api('/claim',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,screenshot:state.uploadedProof})});
    state.myClaim=out.claim;state.uploadedProof='';toast('Character claim submitted for review.');refresh();
   }
   if(kind==='record'){
    const data=Object.fromEntries(new FormData(form));const id=data.id;delete data.id;
    await api(id?'/records/'+encodeURIComponent(id):'/records',{method:id?'PATCH':'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
    const next=await api('/records');state.records=next.records||[];state.recordsReady=true;form.reset();toast(id?'Record updated.':'Season record published.');refresh();
   }
  })().catch(x=>{toast(x.message);console.warn(x)});
 });
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-arc-action]');if(!b)return;
  const action=b.dataset.arcAction,id=b.dataset.id;
  void(async()=>{
   if(action==='reload-claims'){state.claims=(await api('/claims')).claims||[];state.claimsReady=true;refresh();return}
   if(action==='proof'){const row=await api('/claims/'+encodeURIComponent(id)+'/proof');const container=document.getElementById('arcProofPreview');if(container)container.innerHTML='<p>Private screenshot · '+esc(row.claim.name)+'</p><img src="'+esc(row.proof)+'" alt="Player-submitted character screenshot" loading="lazy">';return}
   if(['approve','reject','revoke'].includes(action)){
    const status=action==='approve'?'approved':action==='reject'?'rejected':'revoked';
    if(!confirm('Set this character claim to '+status+'?'))return;
    const note=action==='approve'?'Reviewed combat-screen screenshot':prompt('Reason for this decision (shown to player):','');
    if(note===null)return;
    await api('/claims/'+encodeURIComponent(id),{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({status,note})});
    state.claims=(await api('/claims')).claims||[];toast('Claim '+status+'.');refresh();return;
   }
   if(action==='edit-record'){
    const row=state.records.find(r=>r.id===id),form=document.querySelector('[data-arc-form="record"]');if(!row||!form)return;
    for(const [k,v]of Object.entries(row)){const el=form.elements.namedItem(k);if(el)el.value=v;}
    form.elements.namedItem('id').value=row.id;form.scrollIntoView({block:'start',behavior:'smooth'});return;
   }
   if(action==='reset-record'){document.getElementById('arcRecordId').value='';return;}
   if(action==='delete-record'){
    if(!confirm('Permanently remove this season record?'))return;
    await api('/records/'+encodeURIComponent(id),{method:'DELETE'});
    state.records=(await api('/records')).records||[];toast('Record removed.');refresh();
   }
  })().catch(x=>toast(x.message));
 });
}
