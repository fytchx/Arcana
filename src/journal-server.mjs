import {resolve} from 'node:path';
import {readJSON,saveAtomic,queued,accountUser,checkOrigin,parseJSON,sendJSON,dataRoot} from './account-server.mjs';
import {can} from './account-policy.js';
import {JOURNAL_SEEDS} from './journal-seeds.mjs';

const ORIGIN='https://arcanacompanion.xyz';
const filePath=()=>resolve(dataRoot(),'journal','articles.json');
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const categories=['News','Meta & Balance','Opinion','Guides & Strategy','Community','Development'];
const esc=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const send=(res,status,body,mime='text/html; charset=utf-8',extra={})=>{res.writeHead(status,{'content-type':mime,'cache-control':'no-store','x-content-type-options':'nosniff',...extra});res.end(body)};
const fail=(res,status,error)=>{sendJSON(res,status,{error});return true};
const validImage=url=>!url||(/^https:\/\/[a-z0-9.-]+(?:\:[0-9]{2,5})?(?:\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]*)?$/i.test(url)&&url.length<=600);
const dateLabel=value=>new Date(value).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
async function state(){
 const raw=await readJSON(filePath());
 return raw&&Number.isSafeInteger(raw.revision)&&Array.isArray(raw.articles)?raw:{revision:0,articles:[]};
}
function combined(raw){
 const posts=new Map(JOURNAL_SEEDS.map(item=>[item.slug,{...item}]));
 for(const post of raw.articles||[]){if(post&&SLUG.test(post.slug))posts.set(post.slug,post);}
 return [...posts.values()].sort((a,b)=>Date.parse(b.publishedAt||b.updatedAt||0)-Date.parse(a.publishedAt||a.updatedAt||0));
}
async function list(publicOnly=true){const posts=combined(await state());return publicOnly?posts.filter(x=>x.published):posts;}
const summary=post=>({slug:post.slug,title:post.title,subtitle:post.subtitle,author:post.author,category:post.category,publishedAt:post.publishedAt,updatedAt:post.updatedAt,featured:!!post.featured,coverUrl:post.coverUrl||'',url:'/journal/'+post.slug});
const bandRows=[
 ['1–50',26,7,13,2,2],['51–100',21,13,11,4,1],['101–150',19,15,6,5,5],['151–200',20,14,13,3,0],['201–250',18,16,7,4,5]
];
const balance=[['Rogue',104,'41.6','rogue'],['Druid',65,'26.0','druid'],['Warrior',50,'20.0','warrior'],['Mage',18,'7.2','mage'],['Archer',13,'5.2','archer']];
function distribution(){return '<div class="journalDataCard" role="group" aria-label="Class representation among top 250 players"><div class="journalDataTitle">TOP 250 CLASS REPRESENTATION <span>October 18, 2026</span></div>'+balance.map(([name,count,pct,klass])=>'<div class="journalBarRow"><div class="journalBarLabel"><strong>'+name+'</strong><span>'+count+' players · '+pct+'%</span></div><div class="journalBarTrack"><span class="journalBar '+klass+'" style="width:'+pct+'%"></span></div></div>').join('')+'<p class="journalDataNote">Five classes, 250 ranked players. Shares reflect only the sampled leaderboard, not the full playerbase.</p></div>';}
function bands(){return '<div class="journalTableScroll"><table class="journalTable"><caption>Class counts in each group of 50 leaderboard positions</caption><thead><tr><th>Ranks</th><th>Rogue</th><th>Druid</th><th>Warrior</th><th>Mage</th><th>Archer</th></tr></thead><tbody>'+bandRows.map(row=>'<tr>'+row.map((cell,i)=>i===0?'<th scope="row">'+cell+'</th>':'<td>'+cell+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function richInline(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');}
function bodyMarkup(body){
 return String(body||'').trim().split(/\n\s*\n/g).filter(Boolean).map(block=>{
  const t=block.trim();
  if(t==='[[distribution]]')return distribution();
  if(t==='[[rank-bands]]')return bands();
  if(t.startsWith('## '))return '<h2>'+richInline(t.slice(3))+'</h2>';
  if(t.startsWith('### '))return '<h3>'+richInline(t.slice(4))+'</h3>';
  if(t.split('\n').every(line=>line.startsWith('- ')))return '<ul>'+t.split('\n').map(line=>'<li>'+richInline(line.slice(2))+'</li>').join('')+'</ul>';
  return '<p>'+t.split('\n').map(richInline).join('<br>')+'</p>';
 }).join('\n');
}
const jsonLd=obj=>JSON.stringify(obj).replace(/</g,'\\u003c');
const nav='<header class="journalNav"><a class="journalBrand" href="/"><img src="/assets/arcana-logo.webp" alt="" width="34" height="34"><span>ARCANA <em>JOURNAL</em></span></a><nav aria-label="Journal navigation"><a href="/">Home</a><a href="/#/community">Community</a><a href="/journal" aria-current="page">Journal</a></nav></header>';
function layout({title,description,canonical,body,image='',schema=null,robots='index,follow',extraScript=''}) {
 const headTitle=title+' | Arcana Journal';
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0b1427"><meta name="robots" content="'+robots+'"><title>'+esc(headTitle)+'</title><meta name="description" content="'+esc(description)+'"><link rel="canonical" href="'+esc(ORIGIN+canonical)+'"><link rel="icon" type="image/webp" href="/assets/arcana-logo.webp"><link rel="stylesheet" href="/journal.css"><meta property="og:site_name" content="Arcana Journal"><meta property="og:type" content="'+(canonical==='/journal'?'website':'article')+'"><meta property="og:title" content="'+esc(headTitle)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:url" content="'+esc(ORIGIN+canonical)+'"><meta name="twitter:card" content="summary_large_image">'+(image?'<meta property="og:image" content="'+esc(image)+'"><meta name="twitter:image" content="'+esc(image)+'">':'')+(schema?'<script type="application/ld+json">'+jsonLd(schema)+'</script>':'')+'</head><body>'+nav+'<main id="main" class="journalShell">'+body+'</main><footer class="journalFooter"><span>Independent IdleArc coverage by the Arcana community. Not affiliated with the game developers.</span><a href="/#/community">Community</a><a href="/journal">Journal</a></footer>'+extraScript+'</body></html>';
}
function storyCard(p,large=false){return '<a class="journalStory '+(large?'journalStoryFeature':'')+'" href="/journal/'+esc(p.slug)+'"><span class="journalBadge">'+esc(p.category)+'</span><h2>'+esc(p.title)+'</h2><p>'+esc(p.subtitle)+'</p><div class="journalStoryMeta">'+esc(p.author)+' · '+dateLabel(p.publishedAt)+' <span>Read story →</span></div></a>';}
async function indexPage(url){
 const all=await list();const requested=url.searchParams.get('category')||'';const filter=categories.includes(requested)?requested:'';
 const posts=filter?all.filter(x=>x.category===filter):all;
 const tags=['All',...categories.filter(t=>all.some(p=>p.category===t))];
 return layout({title:'News, Meta & Community Analysis',description:'Independent IdleArc news, class balance analysis, community perspectives and Arcana development updates.',canonical:'/journal',schema:{'@context':'https://schema.org','@type':'Blog',name:'Arcana Journal',url:ORIGIN+'/journal'},body:
 '<section class="journalHero"><span class="journalEyebrow">THE ARCANA JOURNAL</span><h1>Beyond the build.<br><em>Into the meta.</em></h1><p>IdleArc news, balance analysis, updates and opinions. The numbers when we have them, and a clear distinction when it\'s an opinion.</p></section>'+
 '<div class="journalFilters" aria-label="Filter stories">'+tags.map(t=>'<a '+((t===filter||t==='All'&&!filter)?'aria-current="page" ':'')+'href="'+(t==='All'?'/journal':'/journal?category='+encodeURIComponent(t))+'">'+esc(t)+'</a>').join('')+'</div>'+
 '<section class="journalStories" aria-label="Published articles">'+(posts.length?posts.map((p,i)=>storyCard(p,i===0&&!filter)).join(''):'<p class="journalEmpty">No published stories in this category yet.</p>')+'</section>'+
 '<section class="journalJoin"><strong>Built by players, for players.</strong><p>Read the analysis, bring your own perspective, and explore Arcana\'s free builds and tools.</p><a href="/#/community">Explore Community →</a></section>'});
}
async function storyPage(slug){
 const p=(await list()).find(p=>p.slug===slug);
 if(!p)return null;
 const all=await list(),related=all.filter(x=>x.slug!==p.slug).slice(0,2);
 return layout({title:p.title,description:p.subtitle,canonical:'/journal/'+p.slug,image:p.coverUrl,schema:{'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,description:p.subtitle,datePublished:p.publishedAt,dateModified:p.updatedAt,author:{'@type':'Person',name:p.author},publisher:{'@type':'Organization',name:'Arcana Journal'},mainEntityOfPage:ORIGIN+'/journal/'+p.slug},body:
 '<article class="journalArticle"><a class="journalBack" href="/journal">← All Journal stories</a><header><span class="journalBadge">'+esc(p.category)+'</span><h1>'+esc(p.title)+'</h1><p class="journalStandfirst">'+esc(p.subtitle)+'</p><div class="journalArticleMeta">By <strong>'+esc(p.author)+'</strong> · '+dateLabel(p.publishedAt)+'</div></header>'+
 (p.coverUrl?'<img class="journalCover" src="'+esc(p.coverUrl)+'" alt="" loading="lazy">':'')+
 '<div class="journalBody">'+bodyMarkup(p.body)+'</div><div class="journalEnd"><a href="/journal">← Back to Journal</a><a href="/#/community">Join the community →</a></div></article>'+
 (related.length?'<section class="journalRelated"><h2>Keep reading</h2><div class="journalStories">'+related.map(p=>storyCard(p)).join('')+'</div></section>':'')});
}
async function auth(req,res){
 const user=await accountUser(req);
 if(!user)return fail(res,401,'Sign in to Arcana to edit Journal articles.');
 if(!can(user,'site:manage'))return fail(res,403,'Admin or Creator access required.');
 return user;
}
function validate(payload,old){
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Article required.');
 const str=(key,max)=>{if(typeof payload[key]!=='string'||!payload[key].trim()||payload[key].length>max)throw Error('Invalid '+key+' (max '+max+' characters).');return payload[key].trim()};
 const slug=str('slug',90).toLowerCase();
 if(!SLUG.test(slug))throw Error('Slug may contain lowercase letters, numbers and hyphens only.');
 const title=str('title',130),subtitle=str('subtitle',340),body=str('body',35000);
 const category=str('category',40);if(!categories.includes(category))throw Error('Invalid category.');
 const coverUrl=String(payload.coverUrl||'').trim();
 if(!validImage(coverUrl))throw Error('Use a public HTTPS image URL, or leave the cover empty.');
 const published=payload.published===true;const now=new Date().toISOString();
 return {slug,title,subtitle,body,category,coverUrl,author:'Zane',published,featured:payload.featured===true,createdAt:old?.createdAt||now,publishedAt:old?.publishedAt||now,updatedAt:now};
}
function studioPage(){
 return layout({title:'Journal Studio',description:'Arcana editorial publishing workspace.',canonical:'/journal/studio',robots:'noindex,nofollow',body:'<section class="journalStudio"><span class="journalEyebrow">EDITORIAL WORKSPACE</span><h1>Journal Studio</h1><p>Write, preview, save drafts and publish directly to Arcana Journal. Articles live in the existing persistent Arcana data volume.</p><div class="journalStudioLayout"><aside><h2>Articles</h2><button type="button" id="journalNew">+ New article</button><div id="journalStudioList"></div></aside><form id="journalEditor"><label>Title<input name="title" required maxlength="130"></label><label>URL slug<input name="slug" required maxlength="90" pattern="[a-z0-9-]+"></label><label>Summary<input name="subtitle" required maxlength="340"></label><div class="journalStudioRow"><label>Category<select name="category">'+categories.map(c=>'<option>'+esc(c)+'</option>').join('')+'</select></label><label>Cover image URL (optional)<input name="coverUrl" type="url" placeholder="https://…"></label></div><label>Story body<textarea name="body" required rows="22" maxlength="35000" placeholder="## Section heading&#10;&#10;Write your article here. Use **bold** for emphasis."></textarea></label><p class="journalHelp">Use ## for headings, **text** for bold, and - for bullet points. The class-balance chart markers are supported in existing articles.</p><div class="journalStudioActions"><label><input type="checkbox" name="featured"> Featured</label><label><input type="checkbox" name="published"> Published</label><button type="button" id="journalPreview">Preview</button><button type="submit">Save article</button></div><p id="journalStudioStatus" role="status"></p></form></div><div id="journalPreviewArea"></div></section>',extraScript:'<script type="module" src="/journal-studio.js"></script>'});
}
export async function handleJournalRequest(req,res,url){
 const {pathname}=url;
 if(pathname==='/robots.txt'&&['GET','HEAD'].includes(req.method)){
  send(res,200,req.method==='HEAD'?null:'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /journal/studio\nSitemap: '+ORIGIN+'/sitemap.xml\n','text/plain; charset=utf-8');return true;
 }
 if(pathname==='/sitemap.xml'&&['GET','HEAD'].includes(req.method)){
  const publicPosts=await list();const links=[{url:'/',date:'2026-10-18'},{url:'/journal',date:'2026-10-18'},...publicPosts.map(p=>({url:'/journal/'+p.slug,date:p.updatedAt.slice(0,10)}))];
  send(res,200,req.method==='HEAD'?null:'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+links.map(x=>'<url><loc>'+ORIGIN+x.url+'</loc><lastmod>'+x.date+'</lastmod></url>').join('')+'</urlset>','application/xml; charset=utf-8');return true;
 }
 if(pathname==='/api/journal'){
  if(req.method!=='GET')return fail(res,405,'Method not allowed.');
  sendJSON(res,200,{articles:(await list()).map(summary)});return true;
 }
 if(pathname==='/api/journal/admin'){
  if(!await auth(req,res))return true;
  if(req.method==='GET'){const raw=await state();sendJSON(res,200,{revision:raw.revision,articles:combined(raw)});return true;}
  if(req.method!=='PUT')return fail(res,405,'Method not allowed.');
  try{checkOrigin(req)}catch{return fail(res,403,'Request origin not permitted.');}
  let payload;try{payload=await parseJSON(req,55000);}catch(error){return fail(res,error.status||400,error.message);}
  if(!Number.isSafeInteger(payload?.expectedRevision))return fail(res,422,'A current revision is required.');
  return queued(async()=>{
   const raw=await state();if(raw.revision!==payload.expectedRevision)return fail(res,409,'Someone updated the Journal. Reload before saving.');
   const old=combined(raw).find(x=>x.slug===payload.article?.slug);
   let article;try{article=validate(payload.article,old);}catch(e){return fail(res,422,e.message);}
   const articles=raw.articles.filter(x=>x.slug!==article.slug);
   articles.push(article);await saveAtomic(filePath(),{revision:raw.revision+1,articles});
   sendJSON(res,200,{revision:raw.revision+1,article});return true;
  });
 }
 if(pathname==='/journal/studio'){
  if(!['GET','HEAD'].includes(req.method))return fail(res,405,'Method not allowed.');
  if(!await auth(req,res))return true;
  send(res,200,req.method==='HEAD'?null:studioPage(),'text/html; charset=utf-8',{'x-robots-tag':'noindex, nofollow'});return true;
 }
 if(pathname==='/journal'||pathname==='/journal/'){
  if(!['GET','HEAD'].includes(req.method))return fail(res,405,'Method not allowed.');
  const page=await indexPage(url);send(res,200,req.method==='HEAD'?null:page);return true;
 }
 if(pathname.startsWith('/journal/')){
  if(!['GET','HEAD'].includes(req.method))return fail(res,405,'Method not allowed.');
  const slug=pathname.slice('/journal/'.length);
  if(!SLUG.test(slug))return false;
  const page=await storyPage(slug);if(!page){send(res,404,'Article not found','text/plain; charset=utf-8',{'x-robots-tag':'noindex'});return true;}
  send(res,200,req.method==='HEAD'?null:page);return true;
 }
 return false;
}
