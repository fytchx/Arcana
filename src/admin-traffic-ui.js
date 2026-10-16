import {esc,icon} from './ui.js';
const state={data:null,error:'',loading:false,loadedAt:0,range:14};
const routeName=name=>({
 home:'Home',user:'User Center',account:'Account',directory:'Explore A–Z',featured:'Featured',
 'labs/build':'Build Studio','labs/runes':'Rune Forge','labs/skills':'Class Skills',
 'labs/passives':'Passive Tree','labs/pets':'Pet Lab','labs/guild-tree':'Guild Planner',
 'calculators/pathfinder':'Pathfinder','calculators/ml-farm':'ML Farming Comparator',
 'calculators/pet':'Pet Compound Calculator','calculators/affixes':'Pet Affix Costs',
 wiki:'ArcanaWiki','wiki/article':'Wiki Articles','wiki/guides':'Player Guides',
 'wiki/library':'Game Atlas / Reference','wiki/studio':'Wiki Studio',
 community:'Community','community/post':'Community Posts','community/create':'Publish Community Post',
 'lfg/guilds':'Guild Finder','lfg/raids':'Raid Finder',beta:'Beta Feedback',
 'settings':'Settings','icons':'Icon Library',recent:'Recent Activity'
})[name]||name.replaceAll('/',' / ').replaceAll('-',' ');
const number=n=>Math.max(0,Number(n)||0).toLocaleString('en-US');
const metric=(label,value,detail)=>'<div class="trafficMetric"><span>'+esc(label)+'</span><strong>'+number(value)+'</strong><small>'+esc(detail)+'</small></div>';
const adminLink=(title,detail,route,mark)=>'<button type="button" class="launchNavRow" data-route="'+esc(route)+'"><span class="launchNavIcon">'+icon(mark,20)+'</span><span class="launchNavCopy"><strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small></span>'+icon('arrow',16)+'</button>';
export function adminTrafficView({admin=false,authEnabled=false}={}){
 if(!admin)return '<section class="launchPage"><span class="launchEyebrow">ADMIN DASHBOARD</span><h1>Admin access required</h1><p>Website traffic is private to signed-in Arcana Admins and the Creator.</p>'+(authEnabled?'<a class="btn primary" href="/api/account/login">Sign in with Discord</a>':'<p>Admin authentication is not configured on this environment.</p>')+'</section>';
 const d=state.data;
 const days=(d?.days||[]).slice(-state.range);
 const high=Math.max(1,...days.map(x=>x.views));
 const chart=days.map(day=>'<div class="trafficDay" title="'+esc(day.date+': '+day.views+' views, '+day.sessions+' sessions')+'"><div class="trafficBar" style="height:'+Math.max(3,Math.round(day.views/high*100))+'%"></div><small>'+esc(day.date.slice(5))+'</small></div>').join('');
 const dailyList=days.map(day=>'<div class="trafficDailyRow"><span>'+esc(day.date)+'</span><span>'+number(day.views)+' views</span><span>'+number(day.sessions)+' sessions</span></div>').join('');
 const top=(d?.topPages||[]).map((page,index)=>'<div class="trafficPage"><span class="trafficRank">'+(index+1)+'</span><span>'+esc(routeName(page.route))+'<small>'+esc(page.route)+'</small></span><strong>'+number(page.views)+'</strong></div>').join('');
 return '<div class="launchPage trafficDashboard"><span class="launchEyebrow">ARCANA ADMINISTRATION</span><h1>Admin Dashboard</h1><p>Website activity, page popularity and tools for managing Arcana.</p>'+
 '<div class="trafficDashboardActions"><button type="button" class="btn secondary" data-traffic-action="refresh">'+icon('refresh',16)+' Refresh traffic</button><span>'+(state.loadedAt?'Last checked '+esc(new Date(state.loadedAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})):'No data loaded')+'</span></div>'+
 (state.error?'<div class="trafficNotice" role="status">'+esc(state.error)+'</div>':'')+
 (!d?'<div class="trafficNotice" role="status">'+(state.loading?'Loading website traffic…':'Traffic data will appear when the statistics service is available.')+'</div>':
 '<div class="trafficStatsGrid">'+metric('Active now',d.activeSessions,'Sessions seen in the last 5 minutes')+
 metric('Today’s visits',d.today.sessions,'Unique browser sessions today (UTC)')+
 metric('Today’s views',d.today.views,'Page opens today')+
 metric('Last 7 days',d.last7.views,'Page views · '+number(d.last7.sessions)+' daily sessions')+
 metric('Last 30 days',d.last30.views,'Page views · '+number(d.last30.sessions)+' daily sessions')+'</div>'+
 '<section class="trafficPanel"><div class="trafficPanelHead"><h2>Traffic trend</h2><div class="trafficRanges"><button type="button" data-traffic-range="7" '+(state.range===7?'aria-pressed="true"':'')+'>7d</button><button type="button" data-traffic-range="14" '+(state.range===14?'aria-pressed="true"':'')+'>14d</button><button type="button" data-traffic-range="30" '+(state.range===30?'aria-pressed="true"':'')+'>30d</button></div></div><div class="trafficGraph" role="img" aria-label="Daily page views for the selected number of days">'+chart+'</div><p class="trafficCaption">Views per day (UTC). Sessions count one browser session per day.</p><details class="trafficDailyDetails"><summary>Show exact daily totals</summary><div class="trafficDailyList">'+dailyList+'</div></details></section>'+
 '<section class="trafficPanel"><h2>Most visited sections</h2>'+(top||'<p>No visits recorded yet.</p>')+'</section>'+
 '<p class="trafficCaption">Statistics start when this feature is deployed. Visits are approximate browsing sessions, not individual people. No IP addresses, Discord IDs, or complete URLs are stored. Browser privacy settings and blocked scripts may exclude visits. Only Arcana page activity is measured.</p>')+
 '<section class="trafficPanel"><h2>Admin shortcuts</h2><div class="launchMenuLinks">'+
 adminLink('Wiki Studio','Manage official articles and images.','wiki/studio','book')+
 adminLink('Account & Roles','Manage your account and approved roles.','account','users')+
 adminLink('Design Workshop','Preview styling and appearance settings.','settings','settings')+
 adminLink('Beta Feedback','Review suggestions and bug reports.','beta/reports','info')+
 '</div></section></div>';
}
export async function loadAdminTraffic(refresh,{force=false}={}){
 if(state.loading||!force&&Date.now()-state.loadedAt<30000)return;
 state.loading=true;
 try{
  const res=await fetch('/api/admin/traffic',{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(10000)});
  const d=await res.json();
  if(!res.ok)throw Error(d.error||'Unable to load traffic statistics.');
  state.data=d;state.error='';state.loadedAt=Date.now();
 }catch(e){state.error=e.message||'Traffic service unavailable';state.data=null;}
 finally{state.loading=false;if(location.hash.startsWith('#/admin'))refresh();}
}
export function wireAdminTraffic({refresh}){
 document.addEventListener('click',e=>{
  const range=e.target.closest('[data-traffic-range]');
  if(range){const n=Number(range.dataset.trafficRange);if([7,14,30].includes(n)){state.range=n;refresh();}return;}
  const action=e.target.closest('[data-traffic-action]');
  if(action?.dataset.trafficAction==='refresh')void loadAdminTraffic(refresh,{force:true});
 });
}
