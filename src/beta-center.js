import {esc,icon} from './ui.js';
// Public beta launch surface. Status is server-reported, not a guessed availability badge.
const state={status:null,submitting:false,notice:'',reports:null,adminKey:'',loading:false};
const formTag='data-beta-form="feedback"';
const choices=[['bug','Something is broken'],['usability','Navigation or usability'],['incorrect-data','Incorrect game information'],['missing-art','Missing or wrong artwork'],['feature-request','Feature idea'],['other','Something else']];
const alertBox=msg=>'<p class="betaNotice" role="status">'+esc(msg)+'</p>';
export function betaView(route){
 const status=state.status;
 if(route==='beta/reports'){
  return '<div class="betaCenter"><div class="betaHero"><span class="eyebrow">ARCANA BETA · STAFF ONLY</span><h1>Feedback inbox</h1><p>Submitted issues are private to approved moderators and administrators. No submissions are deleted from this screen.</p></div>'+
  '<div class="betaActions"><button class="btn secondary" data-beta-action="reload-reports">Reload reports</button><button class="btn secondary" data-route="beta">Beta Center</button></div>'+
  (state.reports===null?alertBox('Select Reload reports to open the private inbox.'):(state.reports.length?state.reports.map(r=>
   '<article class="betaReport"><div class="betaReportHeading"><strong>'+esc(r.title)+'</strong><span class="eyebrow">'+esc(r.state||'new')+'</span></div><small>'+esc(r.category)+' · '+esc(r.createdAt)+' · '+esc(r.page||'Unknown page')+'</small><p>'+esc(r.details)+'</p>'+
   (r.contact?'<small>Contact: '+esc(r.contact)+'</small>':'')+'<div class="betaActions">'+['new','reviewing','resolved','closed'].map(k=>
   '<button class="btn secondary" data-beta-action="report-state" data-id="'+esc(r.id)+'" data-state="'+k+'" '+(k===r.state?'disabled':'')+'>'+esc(k)+'</button>').join('')+'</div></article>'
  ).join(''):alertBox('No feedback reports yet.')))+
  (state.notice?alertBox(state.notice):'')+'</div>';
 }
 return '<div class="betaCenter"><section class="betaHero"><span class="eyebrow">ARCANA · PUBLIC BETA</span><h1>Use it. Break it. Help us improve it.</h1><p>Arcana is built around tools that should be useful today. During beta, you can use everything available to guests without signing in, then tell us what needs work.</p><div class="betaActions"><button class="btn primary" data-route="labs">Explore the tools '+icon('arrow',15)+'</button><button class="btn secondary" data-route="wiki">Browse ArcanaWiki</button></div></section>'+
 '<section class="betaCapabilities"><h2>What is available?</h2>'+
 '<div class="betaFeatureGrid">'+
 [[ 'Guest tools','Calculators, Build Studio, rune and skill planning, and local saves are available without an account.',true],
 ['Reference content','The Wiki and Codex are open for browsing. Some data comes from earlier verified game snapshots.',true],
 ['Raid and guild discovery','Public directories are available, but the separate listing services may be temporarily unavailable.',true],
 ['Member publishing',status?.accountsConfigured?'Account sign-in has been configured; individual sign-in still requires testing.':'Account sign-in and member-only publishing are not enabled on this beta yet.',!!status?.accountsConfigured],
 ['Wiki editing','Editor-only publishing exists, but articles still need careful content review and migration.',!!status?.wikiStorageConfigured]
 ].map(([name,desc,available])=>'<article class="betaFeature"><span class="betaDot '+(available?'active':'setup')+'" aria-hidden="true"></span><h3>'+esc(name)+'</h3><p>'+esc(desc)+'</p></article>').join('')+'</div>'+
 '<p class="mutedSmall">Release '+esc(status?.release||'loading')+' · Status describes configuration, not a guarantee that an external service is up. Game balance and live content should be verified in IdleArc.</p></section>'+
 '<section class="betaFeedback" id="report-issue"><h2>Report an issue or share an idea</h2><p>Your report goes to Arcana’s private feedback inbox. No account required. Include what you were doing and what you expected to happen.</p>'+
 '<form '+formTag+'><label>What is this about?<select name="category" required>'+choices.map(([value,label])=>'<option value="'+value+'">'+esc(label)+'</option>').join('')+'</select></label>'+
 '<label>Short title<input name="title" maxlength="110" minlength="6" required placeholder="Example: Codex jumps to the top on category change"></label>'+
 '<label>What happened?<textarea name="details" maxlength="2400" minlength="15" rows="6" required placeholder="Which tool or page, what you tapped, what happened, and what you expected instead"></textarea></label>'+
 '<label>Contact email (optional)<input name="contact" type="email" maxlength="120" autocomplete="email" placeholder="Only if you want us to follow up"></label>'+
 '<input name="website" class="betaHoneypot" autocomplete="off" tabindex="-1" aria-hidden="true">'+
 '<button class="btn primary" type="submit" '+(state.submitting?'disabled':'')+'>'+(state.submitting?'Sending…':'Submit feedback')+'</button></form>'+
 (state.notice?alertBox(state.notice):'')+'<p class="mutedSmall">Do not send passwords, access keys, personal health information or other sensitive information. Feedback is stored for beta issue review. Screenshots are not uploaded by this form.</p></section>'+
 '<div class="betaActions"><button class="btn secondary" data-beta-action="copy-diagnostics">'+icon('copy',16)+' Copy basic diagnostics</button><button class="btn secondary" data-route="home">Return home</button></div></div>';
}
export async function loadBetaStatus(refresh){
 if(state.loading||state.status)return;
 state.loading=true;
 try{const r=await fetch('/api/beta/status',{cache:'no-store'});if(!r.ok)throw Error('Beta status unavailable');
  state.status=await r.json();
 }catch{state.status={release:'unavailable',accountsConfigured:false,wikiStorageConfigured:false};}
 state.loading=false;
 if(location.hash.includes('#/beta'))refresh();
}
export function wireBetaUI({go,refresh,toast}){
 document.addEventListener('submit',e=>{
  const form=e.target.closest('[data-beta-form="feedback"]');if(!form)return;
  e.preventDefault();if(state.submitting)return;
  void (async()=>{
   state.submitting=true;state.notice='';const fields=Object.fromEntries(new FormData(form));
   const from=location.hash.startsWith('#/beta')?(sessionStorage.getItem('arcana-beta-last-route')||'#/beta'):location.hash;
   const payload={...fields,page:from.slice(0,180),clientVersion:state.status?.release||''};
   try{
    const r=await fetch('/api/beta/feedback',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});
    const response=await r.json();if(!r.ok)throw Error(response.error||'Unable to submit feedback.');
    state.notice='Feedback received. Reference '+response.reference+'. Thank you for helping improve Arcana.';
    form.reset();
   }catch(err){state.notice=String(err.message||err);}
   finally{state.submitting=false;refresh();}
  })();
 });
 document.addEventListener('click',e=>{
  const el=e.target.closest('[data-beta-action]');if(!el)return;
  e.preventDefault();
  void (async()=>{
   if(el.dataset.betaAction==='copy-diagnostics'){
    const value=['Arcana beta release: '+(state.status?.release||'Unknown'),'Page: '+location.href,
      'Browser: '+navigator.userAgent].join('\n');
    await navigator.clipboard.writeText(value);toast('Diagnostics copied');return;
   }
   if(el.dataset.betaAction==='reload-reports'){
    if(!state.adminKey){
     const key=prompt('Private moderator or owner key (never saved):');if(key)state.adminKey=key;
    }
    const opts={cache:'no-store',headers:state.adminKey?{'x-arcana-wiki-key':state.adminKey}:{}};
    const r=await fetch('/api/beta/reports',opts),data=await r.json();
    if(!r.ok){state.adminKey='';throw Error(data.error||'Access denied');}
    state.reports=data.reports||[];state.notice='Showing '+state.reports.length+' submitted reports.';refresh();return;
   }
   if(el.dataset.betaAction==='report-state'){
    const r=await fetch('/api/beta/reports/'+encodeURIComponent(el.dataset.id),{method:'PATCH',headers:{'content-type':'application/json',...(state.adminKey?{'x-arcana-wiki-key':state.adminKey}:{})},body:JSON.stringify({state:el.dataset.state})});
    const data=await r.json();if(!r.ok)throw Error(data.error||'Unable to update report');
    const item=state.reports?.find(x=>x.id===el.dataset.id);if(item)item.state=el.dataset.state;refresh();
   }
  })().catch(err=>{state.notice=String(err.message||err);refresh();});
 });
}
