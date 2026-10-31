import {esc,icon} from './ui.js';

const dateLabel=value=>value?new Date(value).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}):'';
const categories=['All','News','Meta & Balance','Opinion','Guides & Strategy','Community','Development'];
const params=(values)=>new URLSearchParams(values).toString();

function storyCard(post,featured=false){
 return `<button type="button" class="journalStoryCard ${featured?'journalStoryFeatured':''}" data-route="journal/article" data-params="${esc(params({slug:post.slug}))}"><span class="wikiEyebrow">${icon('book',14)} ${esc(post.category||'Journal')}</span><strong>${esc(post.title)}</strong><p>${esc(post.subtitle)}</p><span class="journalStoryMeta">${esc(post.author||'Arcana')} · ${esc(dateLabel(post.publishedAt))}<b>Read story ${icon('arrow',14)}</b></span></button>`;
}

export function journalIndexView({articles=[],category='',loading=false,error=''}){
 const visible=category?articles.filter(post=>post.category===category):articles;
 return `<div class="journalNativePage">
  <nav class="wikiBreadcrumbs" aria-label="Page location"><button data-route="home">Home</button><span aria-hidden="true">›</span><span class="wikiCrumbCurrent">Arcana Journal</span></nav>
  <header class="wikiPageHeading journalNativeHeading"><span class="wikiEyebrow">ARCANA / JOURNAL</span><h1>News, meta &amp; community</h1><p>Player perspectives, game updates, balance analysis, and Arcana development—all part of the same Arcana library.</p></header>
  <div class="journalCategoryRail" aria-label="Filter Journal stories">${categories.filter(name=>name==='All'||articles.some(post=>post.category===name)).map(name=>`<button type="button" class="${(category||'All')===name?'active':''}" data-route="journal"${name==='All'?'':' data-params="'+esc(params({category:name}))+'"'}>${esc(name)}</button>`).join('')}</div>
  ${loading&&!articles.length?'<div class="wikiLoading">Loading Journal stories…</div>':''}
  ${error&&!articles.length?`<div class="wikiEmpty"><strong>Journal stories are temporarily unavailable.</strong><p>${esc(error)}</p><button class="btn secondary" data-action="journal-retry">Try again</button></div>`:''}
  ${visible.length?`<section class="journalStoryGrid" aria-label="Published Journal stories">${visible.map((post,index)=>storyCard(post,index===0&&!category)).join('')}</section>`:(!loading&&!error?'<div class="wikiEmpty">No published stories in this section yet.</div>':'')}
  <section class="wikiConnections journalNativeEnd"><div class="wikiConnectionHeading"><span class="wikiEyebrow">KEEP EXPLORING</span><h2>Pick up where you left off</h2><p>Journal stories live alongside Arcana’s guides, tools, and community.</p></div><div class="wikiConnectionRows"><button class="wikiConnectionRow" data-route="wiki/guides">${icon('book',18)}<span><strong>Player guides</strong><small>Learn a mechanic, then put it to use.</small></span>${icon('arrow',15)}</button><button class="wikiConnectionRow" data-route="calculators/pathfinder">${icon('layers',18)}<span><strong>Pathfinder</strong><small>Plan upgrades and farming progression.</small></span>${icon('arrow',15)}</button></div></section>
 </div>`;
}

const inline=text=>esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
function distribution(){
 const rows=[['Rogue',104,'41.6','rogue'],['Druid',65,'26.0','druid'],['Warrior',50,'20.0','warrior'],['Mage',18,'7.2','mage'],['Archer',13,'5.2','archer']];
 return `<div class="journalDataCard" role="group" aria-label="Class representation among top 250 players"><div class="wikiEyebrow">TOP 250 CLASS REPRESENTATION <span>October 18, 2026</span></div>${rows.map(([name,count,pct,klass])=>`<div class="journalBarRow"><div><strong>${name}</strong><span>${count} players · ${pct}%</span></div><i><b class="${klass}" style="width:${pct}%"></b></i></div>`).join('')}<small>Shares reflect only the sampled leaderboard, not the full playerbase.</small></div>`;
}
function rankBands(){
 const rows=[['1–50',26,7,13,2,2],['51–100',21,13,11,4,1],['101–150',19,15,6,5,5],['151–200',20,14,13,3,0],['201–250',18,16,7,4,5]];
 return `<div class="journalTableWrap"><table class="journalTable"><caption>Class counts in each group of 50 leaderboard positions</caption><thead><tr><th>Ranks</th><th>Rogue</th><th>Druid</th><th>Warrior</th><th>Mage</th><th>Archer</th></tr></thead><tbody>${rows.map(row=>`<tr>${row.map((value,index)=>index?`<td>${value}</td>`:`<th scope="row">${value}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function bodyMarkup(body){
 return String(body||'').trim().split(/\n\s*\n/g).filter(Boolean).map(block=>{
  const text=block.trim();
  if(text==='[[distribution]]')return distribution();
  if(text==='[[rank-bands]]')return rankBands();
  if(text==='[[arcana-feedback-cta]]')return "<section class=\"journalFeedbackPanel\" aria-label=\"Send Arcana feedback\"><span class=\"journalFeedbackEyebrow\">YOUR VOICE MATTERS</span><h2>Help shape what comes next</h2><p>Something missing, confusing, or just not working? Tell me about it. No account needed.</p><div class=\"journalFeedbackActions\"><button type=\"button\" class=\"journalFeedbackPrimary\" data-route=\"beta\">Share feedback or a suggestion →</button><button type=\"button\" class=\"journalFeedbackSecondary\" data-route=\"community\">Explore the community →</button></div></section>";
  if(text.startsWith('## '))return `<h2>${inline(text.slice(3))}</h2>`;
  if(text.startsWith('### '))return `<h3>${inline(text.slice(4))}</h3>`;
  if(text.split('\n').every(line=>line.startsWith('- ')))return `<ul>${text.split('\n').map(line=>`<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
  return `<p>${text.split('\n').map(inline).join('<br>')}</p>`;
 }).join('');
}

export function journalArticleView({article=null,articles=[],loading=false,error=''}){
 if(!article)return `<div class="journalNativePage"><nav class="wikiBreadcrumbs" aria-label="Page location"><button data-route="home">Home</button><span aria-hidden="true">›</span><button data-route="journal">Arcana Journal</button></nav>${loading?'<div class="wikiLoading">Loading story…</div>':`<div class="wikiEmpty"><strong>Story unavailable.</strong><p>${esc(error||'This story may have been unpublished.')}</p><button class="btn secondary" data-route="journal">Back to Journal</button></div>`}</div>`;
 const related=articles.filter(post=>post.slug!==article.slug).slice(0,2);
 return `<div class="journalNativePage journalNativeArticlePage">
 <nav class="wikiBreadcrumbs arcReadingCrumb" aria-label="Page location"><button data-route="journal">Journal</button><span aria-hidden="true">›</span><span class="wikiCrumbCurrent">${esc(article.category)}</span></nav>
 <article class="wikiArticle arcReadingPage journalNativeArticle">
  <header class="wikiArticleIntro arcReadingHead arcJournalHead">
   <span class="wikiEyebrow arcReadingKicker">${esc(article.category||'JOURNAL').toUpperCase()}</span>
   ${article.coverUrl?`<img class="arcReadingCover" src="${esc(article.coverUrl)}" alt="" loading="eager">`:''}
   <h1>${esc(article.title)}</h1><p class="arcReadingDeck">${esc(article.subtitle)}</p>
   <div class="arcReadingUtility"><span class="arcReadingByline">By ${esc(article.author||'Arcana')} · ${esc(dateLabel(article.publishedAt))}</span></div>
  </header>
  <div class="journalNativeBody">${bodyMarkup(article.body)}</div>
  <nav class="arcReadingEnd" aria-label="Continue reading"><button type="button" class="wikiTextLink" data-route="journal">More Journal stories</button><button type="button" class="wikiTextLink" data-route="wiki/guides">Player guides</button></nav>
 </article></div>`;

}
