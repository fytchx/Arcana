// Arcana Player Guidebook. Strategy content is separate from the Handbook, Fandom and community posts.
// Test preview: all imported pages are clearly marked as unfinished; editing requires Handbook editorial access.
import {esc,ic} from './core.js';
import {hbText} from './handbook.js';
import {CHAPTERS,PAGES,EXTERNAL_CLASS_GUIDES} from './guidebook-content.js';
const seed = PAGES;
let live=seed,byId=new Map(live.map(p=>[p.id,p])),loadState='idle',rerender=()=>{},currentUser=()=>null;
export const chapterOf=id=>CHAPTERS.find(c=>c.id===id);
export const guidebookPages=()=>live;
export function setGuidebookPages(pages) {
  live=Array.isArray(pages)&&pages.length?pages:seed;
  byId=new Map(live.map(p=>[p.id,p]));
}
export function loadGuidebook(force=false) {
  if(!force&&loadState!=='idle')return;
  loadState='loading';
  fetch('/api/guidebook',{credentials:'same-origin',cache:'no-store'})
    .then(r=>r.ok?r.json():null)
    .then(j=>{if(j?.pages)setGuidebookPages(j.pages);loadState='ready';rerender();})
    .catch(()=>{loadState='idle';rerender();});
}
const count=ch=>live.filter(p=>p.chapter===ch&&p.status!=='awaiting').length;
const status=p=>p.status==='awaiting'?'Contributor draft pending':p.status==='planned'?'Planned section':'Working draft';
const row=(p)=>'<a class="nx-row gb-row" href="#/guidebook/'+esc(p.id)+'"><span class="nx-row-text"><strong>'+esc(p.title)+'</strong><small>'+esc(p.answer)+'</small></span><span class="nx-row-end">›</span></a>';
const linked=(href,t,detail)=>'<a class="nx-row" href="'+href+'"><span class="nx-row-text"><strong>'+esc(t)+'</strong><small>'+esc(detail)+'</small></span><span class="nx-row-end">›</span></a>';
function home(){
  return '<header class="hb-head gb-head"><span class="nx-kicker">PLAYER GUIDEBOOK · TEST PREVIEW</span><h1>Play smarter from day one</h1><p>Player-tested strategy, connected to the Handbook and Arcana tools. Every page is still being reviewed.</p></header>'+
  '<div class="gb-pillars"><div><strong>Prepare before you commit</strong><p>Pick a direction, keep your options open, and let good drops influence your path.</p></div><div><strong>Never stop pushing ML</strong><p>Every detour has a cost. Upgrade when it changes your progress, not just because you can.</p></div></div>'+
  '<p class="nx-fine gb-notice">Private editorial project on Arcana Test. Mechanics and new-season details still need checking. Contributor articles are placeholders until received.</p>'+
  '<div class="gb-chapters">'+CHAPTERS.map(ch=>{
    const pages=live.filter(p=>p.chapter===ch.id);
    return '<a class="gb-chapter" href="#/guidebook/chapter/'+ch.id+'"><span class="nx-ic">'+ic(ch.icon,24)+'</span><span><b>'+ch.n+' · '+esc(ch.title)+'</b><small>'+esc(ch.ask)+'</small><small class="gb-chaptercount">'+(pages.length?count(ch.id)+' drafts to review':'Reserved for future guides')+'</small></span><span class="nx-row-end">›</span></a>';
  }).join('')+'</div>';
}
function chapterView(id){
  const ch=chapterOf(id);
  if(!ch)return '<div class="nx-empty">Chapter not found.</div>';
  const pages=live.filter(p=>p.chapter===id).sort((a,b)=>a.order-b.order);
  const ext=id==='classes'?EXTERNAL_CLASS_GUIDES.map(x=>linked(x.href,x.title,x.detail)).join(''):'';
  return '<a class="nx-back" href="#/guidebook">‹ Player Guidebook</a><header class="hb-head gb-head"><span class="nx-kicker">CHAPTER '+ch.n+'</span><h1>'+esc(ch.title)+'</h1><p>'+esc(ch.ask)+'</p></header>'+
    (pages.length?'<div class="nx-list">'+pages.map(row).join('')+'</div>':'<div class="nx-empty"><strong>Being planned</strong><p>This chapter is reserved for future articles.</p></div>')+
    (ext?'<section><h2 class="nx-label">Existing class guide</h2><div class="nx-list">'+ext+'</div></section>':'');
}
function pageView(id){
  const p=byId.get(id);
  if(!p)return '<a class="nx-back" href="#/guidebook">‹ Player Guidebook</a><div class="nx-empty">Guide not found.</div>';
  const ch=chapterOf(p.chapter), all=live.filter(x=>x.status!=='awaiting'&&x.status!=='planned').sort((a,b)=>a.order-b.order), pos=all.findIndex(x=>x.id===id), next=all[pos+1]||null;
  const related=(p.related?.length?p.related:seed.find(s=>s.id===p.id)?.related||[]).map(x=>byId.get(x)).filter(Boolean);
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
  if(!id)return home();
  if(id.startsWith('chapter/'))return chapterView(id.slice(8));
  return pageView(id);
}
export function initGuidebook(render,getUser){rerender=render;currentUser=getUser;}
