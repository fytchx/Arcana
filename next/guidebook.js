// Arcana Player Guidebook. Strategy content is separate from the Handbook, Fandom and community posts.
// Test preview: all imported pages are clearly marked as unfinished; editing requires Handbook editorial access.
import {esc,ic} from './core.js';
import {hbText} from './handbook.js';
import {CHAPTERS,EXTERNAL_CLASS_GUIDES} from './guidebook-content.js';
let live=[],byId=new Map(),loadState='idle',rerender=()=>{},currentUser=()=>null;
export const chapterOf=id=>CHAPTERS.find(c=>c.id===id);
export const guidebookPages=()=>live;
export function setGuidebookPages(pages) {
  live=Array.isArray(pages)?pages:[];
  byId=new Map(live.map(p=>[p.id,p]));
}
export function loadGuidebook(force=false) {
  if(!force&&loadState!=='idle')return;
  loadState='loading';
  fetch('/api/guidebook',{credentials:'same-origin',cache:'no-store'})
    .then(r=>r.ok?r.json():null)
    .then(j=>{if(j?.pages)setGuidebookPages(j.editorDrafts||j.pages);loadState='ready';rerender();})
    .catch(()=>{loadState='error';rerender();});
}
const count=ch=>live.filter(p=>p.chapter===ch&&p.status!=='awaiting').length;
const status=p=>p.status==='ready'?'Published on Test':p.status==='awaiting'?'Contributor draft pending':p.status==='planned'?'Planned section':'Working draft · editor preview';
const row=(p)=>'<a class="nx-row gb-row" href="#/guidebook/'+esc(p.id)+'"><span class="nx-row-text"><strong>'+esc(p.title)+'</strong><small>'+esc(p.answer)+'</small></span><span class="nx-row-end">›</span></a>';
const linked=(href,t,detail)=>'<a class="nx-row" href="'+href+'"><span class="nx-row-text"><strong>'+esc(t)+'</strong><small>'+esc(detail)+'</small></span><span class="nx-row-end">›</span></a>';
function home(){
  const editor=!!currentUser()?.permissions?.editHandbook;
  return '<header class="hb-head gb-head"><span class="nx-kicker">SEASON 3 PLAYER GUIDEBOOK</span><h1>The Season 3 Playbook</h1><p>This is a practical walkthrough for approaching the new season. Read it in order for the full route, or jump to a system or build guide when that is what you need. Player Guides are separate, credited build articles.</p><p>The Handbook and Fandom wiki are the places to check confirmed mechanics and detailed references. This collection focuses on strategy: why you might choose a path, when a detour is useful, and when to keep progressing.</p><p class="gb-start-cta"><strong>If you're interested in learning how you can start Season 3 like a pro would, start here:</strong> <a href="#/guidebook/start-season">Starting Season 3</a></p></header>'+
  '<div class="gb-pillars"><div><strong>Prepare, then let drops shape the route</strong><p>Choose a direction early, but keep useful options until you know what the season gives you.</p></div><div><strong>Keep Monster Level moving</strong><p>Stop to farm or upgrade when the gain is worth the time, then return to progression.</p></div></div>'+
  (editor?'<p><a class="nx-btn" href="#/guidebook/manage">Open the private Guidebook editor</a></p>':'')+
  '<div class="gb-chapters">'+CHAPTERS.filter(ch=>ch.id!=='player-guides'&&(editor||live.some(p=>p.chapter===ch.id))).map(ch=>{
    const pages=live.filter(p=>p.chapter===ch.id);
    return '<a class="gb-chapter" href="#/guidebook/chapter/'+ch.id+'"><span class="nx-ic">'+ic(ch.icon,24)+'</span><span><b>'+ch.n+' · '+esc(ch.title)+'</b><small>'+esc(ch.ask)+'</small><small class="gb-chaptercount">'+(pages.length?pages.length+' pages in this view':'Reserved for future guides')+'</small></span><span class="nx-row-end">›</span></a>';
  }).join('')+'</div>'+(editor||live.some(p=>p.chapter==='player-guides')?'<section class="gb-player-guides"><span class="nx-kicker">SEPARATE COLLECTION</span><h2>Player Guides</h2><p>Long-form builds with their own author credit, kept apart from the main walkthrough.</p>'+(()=>{const ch=chapterOf('player-guides'),pages=live.filter(p=>p.chapter==='player-guides').sort((a,b)=>a.order-b.order);return '<a class="gb-chapter" href="#/guidebook/chapter/player-guides"><span class="nx-ic">'+ic(ch.icon,24)+'</span><span><b>Player-written builds</b><small>'+esc(ch.ask)+'</small><small class="gb-chaptercount">'+pages.length+' entries in this view</small></span><span class="nx-row-end">›</span></a>';})()+'</section>':'')+
  (!editor&&!live.length?'<div class="nx-empty"><strong>Guidebook pages are still under review.</strong><p>They will appear here after approval.</p></div>':'');
}
function chapterView(id){
  const ch=chapterOf(id);
  if(!ch)return '<div class="nx-empty">Chapter not found.</div>';
  const pages=live.filter(p=>p.chapter===id).sort((a,b)=>a.order-b.order);
  const ext=id==='player-guides'?EXTERNAL_CLASS_GUIDES.map(x=>linked(x.href,x.title,x.detail+' · By '+x.author)).join(''):'';
  return '<a class="nx-back" href="#/guidebook">‹ Player Guidebook</a><header class="hb-head gb-head"><span class="nx-kicker">CHAPTER '+ch.n+'</span><h1>'+esc(ch.title)+'</h1><p>'+esc(ch.ask)+'</p></header>'+
    (pages.length?'<div class="nx-list">'+pages.map(row).join('')+'</div>':'<div class="nx-empty"><strong>Being planned</strong><p>This chapter is reserved for future articles.</p></div>')+
    (ext?'<section><h2 class="nx-label">Existing class guide</h2><div class="nx-list">'+ext+'</div></section>':'');
}
function pageView(id){
  const p=byId.get(id);
  if(!p)return '<a class="nx-back" href="#/guidebook">‹ Player Guidebook</a><div class="nx-empty"><strong>This Guidebook page is still under review.</strong><p>Approved pages will appear here when they are ready.</p></div>';
  const ch=chapterOf(p.chapter), rank=x=>CHAPTERS.findIndex(c=>c.id===x.chapter)*1000+(x.order||0), all=live.filter(x=>x.status!=='awaiting'&&x.status!=='planned').sort((a,b)=>rank(a)-rank(b)), pos=all.findIndex(x=>x.id===id), next=all[pos+1]||null;
  const related=(p.related||[]).map(x=>byId.get(x)).filter(Boolean);
  const canEdit=!!currentUser()?.permissions?.editHandbook;
  return '<a class="nx-back" href="#/guidebook/chapter/'+esc(p.chapter)+'">‹ '+esc(ch?.title||'Guidebook')+'</a>'+
  '<article class="hb-page gb-page"><header class="hb-head"><span class="nx-kicker">'+esc(ch?.title.toUpperCase()||'PLAYER GUIDEBOOK')+' · '+esc(status(p))+'</span><h1>'+esc(p.title)+'</h1></header>'+
  '<p class="hb-answer">'+esc(p.answer)+'</p><p class="nx-by">By <b>'+esc(p.author||'Contributor pending')+'</b> · '+esc(p.version||'Season 2 working draft')+'</p>'+
  (p.status==='awaiting'?'<p class="gb-coming">The contributor has not submitted this article yet. We have reserved its position without inventing a build.</p>':'<div class="gb-content">'+hbText(p.body)+'</div>')+
  '</article>'+(canEdit?'<p><a class="nx-btn" href="#/guidebook/edit/'+esc(p.id)+'">Edit this Guidebook draft</a></p>':'<p class="nx-fine">Editing is available to authorized Arcana Handbook editors. Sign in to edit drafts.</p>')+
  (related.length?'<section class="gb-related"><h2 class="nx-label">Useful next reading</h2><div class="nx-list">'+related.slice(0,3).map(row).join('')+'</div></section>':'')+
  (next?'<a class="hb-next" href="#/guidebook/'+esc(next.id)+'"><small>Continue</small><b>'+esc(next.title)+'</b><span>›</span></a>':'');
}
export function guidebookView(id=''){
  loadGuidebook();
  if(loadState==='error')return '<div class="nx-empty"><strong>Couldn’t load the Guidebook</strong><p>Try again when you’re online.</p><button class="nx-btn" data-gb-reload>Try again</button></div>';
  if(!id)return home();
  if(id.startsWith('chapter/'))return chapterView(id.slice(8));
  return pageView(id);
}
export function initGuidebook(render,getUser){
 rerender=render;currentUser=getUser;
 document.addEventListener('click',e=>{if(e.target.closest('[data-gb-reload]')){loadState='idle';loadGuidebook(true);}});
}
