// The Season 3 Playbook reader and navigation.
// Test preview: all imported pages are clearly marked as unfinished; editing requires Handbook editorial access.
import {esc,ic} from './core.js';
import {hbText} from './handbook.js';
import {CHAPTERS,EXTERNAL_CLASS_GUIDES} from './guidebook-content.js';
let live=[],byId=new Map(),loadState='idle',rerender=()=>{},currentUser=()=>null,playerGuideState='idle',playerGuideIds=[],playerGuideItems=[],contributors=[];
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
    .then(j=>{if(j?.pages)setGuidebookPages(j.editorDrafts||j.pages);contributors=Array.isArray(j?.contributors)?j.contributors:[];loadState='ready';rerender();})
    .catch(()=>{loadState='error';rerender();});
}
function loadPlayerGuideIds(force=false){
 if(!force&&playerGuideState!=='idle')return;
 playerGuideState='loading';
 Promise.all([fetch('/api/playbook-guides',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():null),fetch('/api/community/posts?kind=guide',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():null)])
  .then(async([f,g])=>{playerGuideIds=Array.isArray(f?.items)?f.items:[];const posts=(g?.posts||[]).filter(p=>playerGuideIds.includes(p.id));playerGuideItems=await Promise.all(posts.map(async p=>{try{const d=await fetch('/api/community/posts/'+encodeURIComponent(p.id),{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():null);return {...p,author:d?.author?.displayName||'Arcana player'};}catch{return {...p,author:'Arcana player'};}}));playerGuideState='ready';}).catch(()=>{playerGuideIds=[];playerGuideItems=[];playerGuideState='error';}).finally(rerender);
}
const count=ch=>live.filter(p=>p.chapter===ch&&p.status!=='awaiting').length;
const status=p=>p.status==='ready'?'Published on Test':p.status==='awaiting'?'Contributor draft pending':p.status==='planned'?'Planned section':'Working draft · editor preview';
const classArt=name=>'<img src="/assets/icons/arcana-pack/guidebook-classes/'+name+'.svg" alt="" loading="lazy">';
const buildArt=name=>'<img src="/assets/icons/arcana-pack/build-types/'+name+'.svg" alt="" loading="lazy">';
const GUIDE_ART={
 'rogue-explore':'<span class="gb-row-art gb-row-art-multi">'+classArt('rogue')+classArt('mage')+classArt('warrior')+'</span>',
 'harmony-rogue':classArt('rogue'),'archer':classArt('archer'),'druid':classArt('druid'),
 'retaliation-warrior':classArt('warrior')
};
const row=(p)=>'<a class="nx-row gb-row" href="#/guidebook/'+esc(p.id)+'">'+(GUIDE_ART[p.id]?'<span class="gb-row-art">'+GUIDE_ART[p.id]+'</span>':'')+'<span class="nx-row-text"><strong>'+esc(p.title)+'</strong><small>'+esc(p.answer)+'</small>'+(p.chapter==='player-guides'?'<small class="gb-row-by">By '+esc(p.author||'Contributor pending')+'</small>':'')+'</span><span class="nx-row-end">›</span></a>';
const linked=(href,t,detail,id='')=>'<a class="nx-row gb-row" href="'+href+'">'+(GUIDE_ART[id]?'<span class="gb-row-art">'+GUIDE_ART[id]+'</span>':'')+'<span class="nx-row-text"><strong>'+esc(t)+'</strong><small>'+esc(detail)+'</small></span><span class="nx-row-end">›</span></a>';
const classCompass=()=>'<section class="gb-class-compass"><div class="gb-compass-head"><span class="nx-kicker">CLASS & BUILD TYPES</span><h2>Choose what sounds fun</h2><p>Choose a class, then pick a build direction.</p></div><div class="gb-class-grid">'+[
 ['warrior','Warrior',['Retaliation','Attack Damage']],['rogue','Rogue',['Attack Damage','Harmony']],['mage','Mage',['Attack Damage','Harmony']],['archer','Archer',['Pet Damage','Harmony']],['druid','Druid',['Pet Damage','Harmony']]
 ].map(([id,name,builds])=>'<div class="gb-class-tile"><div class="gb-class-name">'+classArt(id)+'<b>'+name+'</b></div><div class="gb-build-types">'+builds.map(type=>'<span>'+buildArt(type==='Pet Damage'?'pet-damage':type.toLowerCase().replaceAll(' ','-'))+type+'</span>').join('')+'</div></div>').join('')+'</div><a class="gb-route-card" href="#/guidebook/rogue-explore"><span class="gb-route-mark">'+buildArt('attack-damage')+'</span><span><small class="nx-kicker">A GREAT BUILD FOR NEW PLAYERS</small><b>Attack Damage · Rogue, Mage and Warrior</b><small>Rogue’s farming skills make the early route smoother; switching later is manageable.</small></span><span class="nx-row-end">›</span></a><div class="gb-class-links"><a href="#/guidebook/harmony-overview">Harmony overview <span>›</span></a><a href="#/guidebook/chapter/player-guides">Browse Player Guides <span>›</span></a></div></section>';
const guideHero=p=>{
 if(p.id==='harmony-overview')return '<div class="gb-guide-hero"><span class="gb-guide-build">'+buildArt('harmony')+'</span><span><small class="nx-kicker">BUILD DIRECTION</small><b>Harmony</b><small>Attack Damage and Pet Damage, considered together</small></span></div>';
 if(p.id==='rogue-explore')return '<div class="gb-guide-hero"><span class="gb-guide-classes">'+classArt('rogue')+classArt('mage')+classArt('warrior')+'</span><span><small class="nx-kicker">PLAYER GUIDE · THREE CLASSES</small><b>One Attack Damage foundation</b><small>Rogue · Mage · Warrior</small></span><span class="gb-guide-build">'+buildArt('attack-damage')+'</span></div>';
 return '';
};
function home(){
  const editor=!!currentUser()?.permissions?.editHandbook;
  const pages=id=>live.filter(p=>p.chapter===id&&(p.status==='ready'||editor&&p.status!=='awaiting')&&!['systems-overview','grind-ml'].includes(p.id)).sort((a,b)=>a.order-b.order);
  const item=p=>'<a class="playbook-outline-item" href="'+(p.href||('#/guidebook/'+esc(p.id)))+'"><span><b>'+esc(p.title)+'</b><small>'+esc(p.answer)+'</small></span><span aria-hidden="true">›</span></a>';
  const group=(key,n,title,items,open=false)=>'<details class="playbook-outline playbook-outline-'+key+'"'+(open?' open':'')+'><summary><span class="playbook-outline-index" aria-hidden="true">'+n+'</span><span class="playbook-outline-copy"><b>'+title+'</b><small>'+items.length+' '+(items.length===1?'page':'pages')+'</small></span><span class="playbook-outline-toggle" aria-hidden="true"></span></summary><div class="playbook-outline-list">'+items.map(item).join('')+'</div></details>';
  const start=[...pages('transition'),...pages('classes')],deep=['pets','runes','gear','endgame'].flatMap(pages),system=pages('systems'),closing=pages('conclusion');
  const playerGuides=EXTERNAL_CLASS_GUIDES.map(x=>({title:x.title,answer:x.detail,href:x.href})).concat(pages('player-guides').map(p=>({id:p.id,title:p.title,answer:p.answer})),playerGuideItems.map(p=>({title:p.title,answer:(p.summary||'')+' · By '+p.author,href:'#/builds/'+encodeURIComponent(p.id)})));
  const groups=[['start','Start Here',start,true],...(system.length?[['systems','Systems & Progression',system]]:[]),...(deep.length?[['deep','Deep Dives',deep]]:[]),['guides','Player Guides',playerGuides],...(closing.length?[['conclusion','Conclusion',closing]]:[])];
  loadPlayerGuideIds();
  return '<div class="playbook-home"><header class="hb-head gb-head playbook-home-head"><span class="nx-kicker">SEASON 3</span><h1>The Season 3 Playbook</h1><p>Choose a direction, plan ahead, and save gear, pets, and runes that could open another path. Let your drops shape the build, but keep pushing Monster Level—detour only when it helps you progress.</p><p class="playbook-start-link"><strong>If you\'re interested in learning how you can start Season 3 like a pro would, start here:</strong> <a href="#/guidebook/start-season">Starting Season 3</a></p></header>'+
  
  (contributors.length?'<p class="playbook-contributors"><span class="nx-kicker">CONTRIBUTORS</span> '+contributors.map(x=>esc(x)).join(' · ')+'</p>':'')+
  (editor?'<a class="playbook-editor-link" href="#/guidebook/manage">Edit Playbook content <span aria-hidden="true">›</span></a>':'')+
  '<div class="playbook-outline-groups">'+groups.map((entry,i)=>group(entry[0],String(i+1).padStart(2,'0'),entry[1],entry[2],entry[3]||false)).join('')+'</div></div>';
}
function chapterView(id){
  const ch=chapterOf(id);
  if(!ch)return '<div class="nx-empty">Chapter not found.</div>';
  const editor=!!currentUser()?.permissions?.editHandbook;
  const pages=live.filter(p=>p.chapter===id&&(p.status==='ready'||editor&&p.status!=='awaiting')&&!['systems-overview','grind-ml'].includes(p.id)).sort((a,b)=>a.order-b.order);
  if(id==='player-guides'){
   loadPlayerGuideIds();
   const content=playerGuideState==='loading'&&playerGuideIds.length===0?'<div class="nx-loading">Loading guides…</div>':playerGuideState==='error'?'<div class="nx-empty"><strong>Couldn’t load the featured guides</strong><button class="nx-btn" data-gb-guides-reload>Try again</button></div>':playerGuideItems.length?'<div class="nx-list">'+playerGuideItems.map(p=>'<a class="nx-row gb-row" href="#/builds/'+encodeURIComponent(p.id)+'"><span class="nx-row-text"><strong>'+esc(p.title)+'</strong><small>'+esc(p.summary||'')+'</small><small class="gb-row-by">By '+esc(p.author)+'</small></span><span class="nx-row-end">›</span></a>').join('')+'</div>':'<div class="nx-empty"><strong>More guides are on the way</strong></div>';
   const ext=EXTERNAL_CLASS_GUIDES.map(x=>linked(x.href,x.title,x.detail+' · By '+x.author,x.id)).join('');
   const harmony=pages.filter(p=>p.id==='harmony-overview');
   return '<a class="nx-back" href="#/guidebook">‹ The Season 3 Playbook</a><header class="hb-head gb-head"><span class="nx-kicker">PLAYER GUIDES</span><h1>'+esc(ch.title)+'</h1><p>'+esc(ch.ask)+'</p></header>'+(harmony.length?'<section class="playbook-guide-type"><h2 class="nx-label">Harmony</h2><div class="nx-list">'+harmony.map(row).join('')+'</div></section>':'')+(ext?'<section class="playbook-guide-type"><h2 class="nx-label">Featured guides</h2><div class="nx-list">'+ext+'</div></section>':'')+'<section class="playbook-guide-type"><h2 class="nx-label">Player guides</h2>'+content+'</section>';
  }
  return '<a class="nx-back" href="#/guidebook">‹ The Season 3 Playbook</a><header class="hb-head gb-head"><span class="nx-kicker">'+esc(ch.title.toUpperCase())+'</span><h1>'+esc(ch.title)+'</h1><p>'+esc(ch.ask)+'</p></header>'+
    (pages.length?'<div class="nx-list">'+pages.map(row).join('')+'</div>':'<div class="nx-empty"><strong>Being planned</strong><p>This chapter is reserved for future articles.</p></div>')+
    (ext?'<section><h2 class="nx-label">Existing class guide</h2><div class="nx-list">'+ext+'</div></section>':'');
}
function pageView(id){
  const p=byId.get(id);
  if(!p)return '<a class="nx-back" href="#/guidebook">‹ The Season 3 Playbook</a><div class="nx-empty"><strong>This page is still under review.</strong><p>It will appear here when it is ready.</p></div>';
  const ch=chapterOf(p.chapter), rank=x=>CHAPTERS.findIndex(c=>c.id===x.chapter)*1000+(x.order||0), all=live.filter(x=>x.status!=='awaiting'&&x.status!=='planned').sort((a,b)=>rank(a)-rank(b)), pos=all.findIndex(x=>x.id===id), next=all[pos+1]||null;
  const related=(p.related||[]).map(x=>byId.get(x)).filter(Boolean);
  const canEdit=!!currentUser()?.permissions?.editHandbook;
  if(p.chapter==='player-guides')return '<a class="nx-back" href="#/guidebook/chapter/player-guides">‹ Player Guides</a><article class="nx-article"><span class="nx-kicker">PLAYER GUIDE · '+esc(status(p).toUpperCase())+'</span><h1>'+esc(p.title)+'</h1><p class="nx-deck">'+esc(p.answer)+'</p><p class="nx-by">by <b>'+esc(p.author||'Contributor pending')+'</b></p>'+(p.status==='awaiting'?'<p class="gb-coming">This guide is being prepared.</p>':'<div class="hb-page gd-body">'+hbText(p.body)+'</div>')+'</article>'+(canEdit?'<p><a class="nx-btn" href="#/guidebook/edit/'+esc(p.id)+'">Edit this page</a></p>':'');
  return '<a class="nx-back" href="#/guidebook/chapter/'+esc(p.chapter)+'">‹ '+esc(ch?.title||'The Season 3 Playbook')+'</a>'+
  '<article class="hb-page gb-page"><header class="hb-head"><span class="nx-kicker">'+esc(ch?.title.toUpperCase()||'THE SEASON 3 PLAYBOOK')+' · '+esc(status(p))+'</span><h1>'+esc(p.title)+'</h1></header>'+
  '<p class="hb-answer">'+esc(p.answer)+'</p>'+guideHero(p)+(p.id==='choose-class'?classCompass():'')+'<p class="nx-by">By <b>'+esc(p.author||'Contributor pending')+'</b> · '+esc(p.version||'Season 2 working draft')+'</p>'+
  (p.status==='awaiting'?'<p class="gb-coming">The contributor has not submitted this article yet. We have reserved its position without inventing a build.</p>':'<div class="gb-content">'+hbText(p.body)+'</div>')+
  '</article>'+(canEdit?'<p><a class="nx-btn" href="#/guidebook/edit/'+esc(p.id)+'">Edit this page</a></p>':'')+
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
 document.addEventListener('click',e=>{if(e.target.closest('[data-gb-reload]')){loadState='idle';loadGuidebook(true);}if(e.target.closest('[data-gb-guides-reload]')){playerGuideState='idle';loadPlayerGuideIds(true);}});
}
