import {esc,icon} from './ui.js';
import {gameArt,codexOfficialArt,hasCodexOfficialArt} from './assets.js';
import {WIKI_ARTICLES,allWikiArticles,WIKI_CATEGORY_LIST,wikiArticleById,matchingRecords,recordKindLabel,WIKI_CONNECTIONS} from './wiki-data.js';
import {navCards} from './context-nav.js';
import {importLinkMarkup} from './fandom-import.js';
const linkParams=(id)=>'id='+encodeURIComponent(id);
// Connections are maintained alongside editorial articles, never inferred from name similarity.
const relatedArticleLinks=article=>{
 const relation=article.connections||WIKI_CONNECTIONS[article.id]||{};
 const guides=(relation.articles||[]).filter(id=>id!==article.id).map(wikiArticleById).filter(Boolean).slice(0,4);
 const categories=(relation.collections||[]).filter(kind=>WIKI_CATEGORY_LIST.some(([id])=>id===kind)).slice(0,4);
 const tools=(relation.tools||[]).slice(0,4);
 if(!guides.length&&!categories.length&&!tools.length)return '';
 const rows=guides.map(a=>'<button class="wikiConnectionRow" data-route="wiki/article" data-params="id='+encodeURIComponent(a.id)+'">'+icon('book',17)+'<span><strong>'+esc(a.title)+'</strong><small>'+esc(a.summary)+'</small></span>'+icon('arrow',16)+'</button>').join('');
 const catRows=categories.map(kind=>{
  const type=WIKI_CATEGORY_LIST.find(([id])=>id===kind);
  return '<button class="wikiConnectionChip" data-route="wiki/library" data-params="kind='+esc(kind)+'">'+icon(type[2],16)+' '+esc(type[1])+'</button>';
 }).join('');
 return '<section class="wikiConnections" aria-label="Related guides and records"><div class="wikiConnectionHeading"><span class="wikiEyebrow">KEEP EXPLORING</span><h2>Related guides and game records</h2><p>Follow these connections without searching from scratch.</p></div>'+
 (rows?'<div class="wikiConnectionRows">'+rows+'</div>':'')+
 (catRows?'<div class="wikiConnectionChips">'+catRows+'</div>':'')+
 (tools?'<div class="arcanaConnections wikiConnectionTools">'+navCards(tools)+'</div>':'')+'</section>';
};
const wikiCategoryJourney=kind=>({
 item:['compare','upgrade','build'],material:['upgrade','items'],currency:['reference','guides'],
 pet:['compoundGuide','petlab','compound'], 'pet-bonus':['compound','petlab','compoundGuide'],
 'pet-affix':['affixes','petlab','compoundGuide'],'class-skill':['skills','build','seasonGuide'],
 passive:['passives','build','seasonGuide'],rune:['runes','runeGuide','runewords'],
 runeword:['runes','runeGuide','build'],biome:['monsterGuide','guides'],
 monster:['monsterGuide','biomeRecords'], 'item-affix':['compare','build']
})[kind]||['guides','build'];

const badgeIcon=k=>({item:'shield',material:'gem',currency:'gem',pet:'paw','class-skill':'git',passive:'layers',rune:'gem',runeword:'link',biome:'layers',monster:'sword','pet-bonus':'paw','pet-affix':'paw','item-affix':'spark'})[k]||'book';
const literal=(s)=>esc(String(s==null?'':s));
// The visual gallery is for entities with meaningful, individual game artwork.
const imageKinds=new Set(['item','pet','currency','class-skill','biome','monster']);
const atlasCategories=new Set(imageKinds);
const referenceCategories=new Set(['material','passive','rune','runeword','pet-bonus','pet-affix','item-affix']);
const shelfFor=kind=>atlasCategories.has(kind)?'atlas':referenceCategories.has(kind)?'reference':'all';
const recordArt=(entry,size)=>imageKinds.has(entry.gameKind||entry.kind)||hasCodexOfficialArt(entry)?codexOfficialArt(entry,size):icon(badgeIcon(entry.gameKind||entry.kind),size>50?40:20);
export function wikiArticleCard(a){return `<button class="wikiArticleCard" data-route="wiki/article" data-params="id=${esc(a.id)}"><span class="wikiArticleTop"><span class="wikiType">${literal(a.category)}</span><span class="wikiTime">${literal(a.readTime)}</span></span><strong>${literal(a.title)}</strong><p>${literal(a.summary)}</p><span class="wikiCardArrow">Read guide ${icon('arrow',15)}</span></button>`}
export function wikiRecordCard(e){
 const kind=e.gameKind||e.kind,real={...e,kind},visual=imageKinds.has(kind);
 const content=`<span class="wikiRecordContent"><strong>${literal(e.title)}</strong><small>${literal(e.description||recordKindLabel(kind))}</small></span>`;
 if(visual)return `<button class="wikiRecord wikiRecordVisual" data-route="wiki/reference" data-params="${esc(linkParams(e.id))}"><span class="wikiRecordArt hasGameArt">${recordArt(real,74)}</span>${content}<span class="wikiVisualArrow">${icon('arrow',16)}</span></button>`;
 return `<button class="wikiRecord wikiRecordText" data-route="wiki/reference" data-params="${esc(linkParams(e.id))}"><span class="wikiTextIcon">${icon(badgeIcon(kind),16)}</span>${content}${icon('arrow',14)}</button>`;
}
export function wikiRecordRows(entries,category,query,limit){
 const records=matchingRecords(entries,category,query),shown=records.slice(0,limit),term=String(query||'').trim();
 const hint=term
  ? `<div class="wikiEmpty" role="status">${icon('search',22)}<strong>No matches for “${literal(term)}”</strong><p>Try a shorter name, clear this filter, or search across all references.</p><div class="wikiEmptyActions"><button type="button" class="btn secondary" data-action="wikiclear">Clear filter</button><a class="btn secondary" href="#/wiki/library?kind=all">Browse all</a></div></div>`
  : `<div class="wikiEmpty" role="status">${icon('search',22)}<strong>No references here yet</strong><p>Browse another category or try the search above.</p></div>`;
 return {count:records.length,html:shown.length?shown.map(wikiRecordCard).join(''):hint,hasMore:records.length>shown.length};
}
export function wikiLandingView({entries=[],loaded=false,error='',itemCount=0}){
 const artTopics=[['Equipment','item','shield','Weapons, armor and jewelry'],['Pet Companions','pet','paw','Pet appearances'],['Class Skills','class-skill','git','Skills by class'],['Biomes','biome','layers','Explore areas'],['Monsters','monster','sword','Creatures and enemies'],['Currencies','currency','gem','Game currencies']];
 const referenceTopics=[['Materials','material','box','Sources and uses'],['Passives','passive','layers','Stat nodes'],['Runes','rune','gem','Rune families'],['Runewords','runeword','link','Combinations'],['Pet Bonuses','pet-bonus','paw','Hatch bonuses'],['Pet Affixes','pet-affix','paw','Evolution affixes'],['Gear Affixes','item-affix','spark','Equipment modifiers']];
 return `<div class="wikiPortal" aria-label="ArcanaWiki home"><div class="wikiHero"><div><span class="wikiEyebrow">ARCANAWIKI / SEASON 2</span><h1>Answers in seconds.<br><em>Back to your game.</em></h1><p>Every answer connects to the item, tool, guide, or build that makes it useful.</p></div><span class="wikiHeroRune">${icon('book',39)}</span></div>
 <button class="wikiSearchLaunch" data-action="search" data-arg="" aria-label="Search all of Arcana">${icon('search',22)}<span>Search items, skills, mechanics, guides…</span><span class="wikiSearchHint">ALL ARCANA</span></button>
 <div class="wikiContribution"><div><span class="wikiEyebrow">CONTRIBUTE TO ARCANAWIKI</span><strong>Help improve the Wiki</strong><p>Approved Wiki Editors maintain official articles. Other players can share guides in the community area.</p></div><button type="button" class="btn secondary" data-route="wiki/studio">${icon('edit',17)} Open Wiki Studio</button></div>
 <section class="wikiPortalShortcuts" aria-label="Popular connected tools"><span class="wikiEyebrow">USEFUL SHORTCUTS</span><div class="arcanaStartGrid">${navCards(['items','compound','runes','guildtree'],{compact:true})}</div></section>
 <div class="wikiFeaturedHead"><div><span class="wikiEyebrow">START HERE</span><h2>Player guides</h2></div><button data-route="wiki/guides" class="wikiTextLink">All guides ${icon('arrow',15)}</button></div>
 <section class="wikiGuideGrid">${['season-2','forge','pet-compound','guild-planning'].map(id=>wikiArticleById(id)).filter(Boolean).map(wikiArticleCard).join('')}</section>
 <div class="wikiFeaturedHead"><div><span class="wikiEyebrow">VISUAL COLLECTIONS</span><h2>Game Atlas</h2></div><span class="wikiMiniCount">Original game artwork</span></div>
 <div class="wikiTopicGrid wikiAtlasTopics">${artTopics.map(([title,type,ico,desc])=>`<button class="wikiTopic" data-route="wiki/library" data-params="kind=${esc(type)}"><span class="wikiTopicIcon">${icon(ico,23)}</span><strong>${esc(title)}</strong><small>${esc(desc)}</small><span class="wikiTopicArrow">${icon('arrow',16)}</span></button>`).join('')}</div>
 <div class="wikiFeaturedHead"><div><span class="wikiEyebrow">REFERENCE COLLECTIONS</span><h2>Game Systems</h2></div><span class="wikiMiniCount">${loaded?itemCount+' total entries':error?'Index unavailable':'Loading references'}</span></div>
 <div class="wikiTopicGrid wikiReferenceTopics">${referenceTopics.map(([title,type,ico,desc])=>`<button class="wikiTopic" data-route="wiki/library" data-params="kind=${esc(type)}"><span class="wikiTopicIcon">${icon(ico,21)}</span><strong>${esc(title)}</strong><small>${esc(desc)}</small><span class="wikiTopicArrow">${icon('arrow',16)}</span></button>`).join('')}</div>
 <section class="wikiGuideToBuild"><span class="wikiGtbIcon">${icon('flask',26)}</span><div><span class="wikiEyebrow">CONNECTED REFERENCE</span><h3>From reading to planning.</h3><p>Start with the Monster Level farming guide, then use the comparator to check your own measured kill times.</p><div class="wikiInlineActions"><button class="btn primary" data-route="wiki/article" data-params="id=monster-level">Read farming guide ${icon('arrow',15)}</button><button class="btn secondary" data-route="calculators/ml-farm">Open farming comparator</button></div></div></section>
 <div class="wikiFooterNote">${icon('check',17)} Season 2 reference library. Game mechanics and values may change with updates.</div></div>`;
}
export function wikiLibraryView({entries=[],category='all',query='',limit=36,loaded=false,error=''}){
 const counts=entries.reduce((a,e)=>(a[e.gameKind]=(a[e.gameKind]||0)+1,a),{}), selected=WIKI_CATEGORY_LIST.find(x=>x[0]===category),result=wikiRecordRows(entries,category,query,limit),shelf=shelfFor(category);
 const visibleCategories=WIKI_CATEGORY_LIST.filter(([k])=>shelf==='atlas'?atlasCategories.has(k):shelf==='reference'?referenceCategories.has(k):true);
 const shelfLink=(label,key,ico,active)=>`<a class="wikiShelfTab ${active?'active':''}" href="#/wiki/library?kind=${key}">${icon(ico,17)}<span>${label}</span></a>`;
 return `<div class="wikiLibrary wikiShelf-${shelf}"><div class="wikiPageHeading"><button class="wikiBack" data-route="wiki">${icon('back',15)} Wiki home</button><span class="wikiEyebrow">ARCANAWIKI / ${shelf==='atlas'?'GAME ATLAS':shelf==='reference'?'GAME SYSTEMS':'ALL REFERENCES'}</span><h1>${esc(category==='all'?'Game Reference':selected?.[1]||'Game Reference')}</h1><p>${shelf==='atlas'?'Original art, creature details and item information.':'Look up mechanics, bonuses, crafting materials and modifiers.'}</p></div>
 <nav class="wikiShelfSwitch" aria-label="Wiki reference collections">${shelfLink('Atlas','item','shield',shelf==='atlas')}${shelfLink('Mechanics','material','layers',shelf==='reference')}${shelfLink('All','all','search',shelf==='all')}</nav>
 <label class="wikiFilterBox">${icon('search',22)}<input id="wikiFilter" type="search" autocomplete="off" placeholder="Search ${shelf==='atlas'?'this illustrated collection':shelf==='reference'?'game mechanics':'every reference'}…" value="${esc(query)}" aria-label="Filter Wiki records"><button type="button" class="wikiClearFilter" data-action="wikiclear" aria-label="Clear Codex search" ${query?'':'hidden'}>×</button></label>
 <div class="wikiCategoryScroll" role="navigation" aria-label="${shelf==='atlas'?'Game Atlas categories':shelf==='reference'?'Game Systems categories':'All Wiki categories'}">${visibleCategories.map(([k,label,ico])=>`<a class="${category===k?'active':''}" href="#/wiki/library?kind=${encodeURIComponent(k)}" aria-current="${category===k?'page':'false'}">${icon(ico,16)} ${esc(label)}${counts[k]!==undefined?` <i>${counts[k]}</i>`:''}</a>`).join('')}</div>
 ${!loaded?`<div class="wikiLoading" role="status">${icon('info',18)}<span>${error?esc(error):'Loading Season 2 references…'}</span>${error?'<button type="button" class="wikiRetry" data-action="wikiretry">Try again</button>':''}</div>`:''}
 <div class="wikiResultHead" role="status" aria-live="polite" aria-atomic="true"><strong id="wikiFoundCount">${result.count} ${result.count===1?'reference':'references'}</strong><small id="wikiShowing">${result.count?'Showing '+Math.min(result.count,limit)+' of '+result.count:'Season 2 reference library'}</small></div>
 <div class="wikiRecordList ${shelf==='atlas'?'wikiGalleryList':'wikiTextList'}" id="wikiRecords">${result.html}</div>
 <div class="wikiMoreWrap" id="wikiMore" ${result.hasMore?'':'hidden'}><button class="btn secondary" data-action="wikimore">Show more references ${icon('arrow',15)}</button></div>
 <section class="wikiCollectionNext"><span class="wikiEyebrow">USE WHAT YOU FIND</span><h2>Continue with a tool or guide</h2><div class="arcanaConnections">${navCards(wikiCategoryJourney(category))}</div></section>
 </div>`;
}
export function wikiGuidesView(){
 const groups=[...new Set(allWikiArticles().map(a=>a.category))];
 const sections=groups.map(category=>`<section class="wikiGuideGroup" aria-label="${esc(category)} guides"><h2>${esc(category)}</h2><div class="wikiGuideGrid">${allWikiArticles().filter(a=>a.category===category).map(wikiArticleCard).join('')}</div></section>`).join('');
 return `<div class="wikiGuidesPage"><div class="wikiPageHeading"><button class="wikiBack" data-route="wiki">${icon('back',15)} Wiki home</button><span class="wikiEyebrow">ARCANAWIKI / PLAYER GUIDES</span><h1>Learn the game. Use the tools.</h1><p>Guides organized by topic, with direct links to the Codex, Guild Planner, and build tools.</p></div><div class="wikiAuthorShortcut"><p>Want to share a guide with the community?</p><button type="button" class="btn primary" data-route="wiki/studio">${icon('edit',16)} Write a guide</button></div><div class="wikiGuideGroups">${sections}</div><div class="wikiGuideToBuild compactGuide"><span class="wikiGtbIcon">${icon('flask',22)}</span><div><span class="wikiEyebrow">BUILD INSPECTION DEMO</span><h3>Warrior Retaliation · example build</h3><p>See how a guide can load a complete character into Build Studio.</p><button class="btn primary" data-route="wiki/guide" data-params="id=warrior-retaliation-demo-guide">Open interactive example ${icon('arrow',15)}</button><small>Example build, not an endorsed strategy.</small></div></div></div>`}
export function wikiArticleView(article){if(!article)return `<div class="wikiEmpty">Guide unavailable. Return to the guide directory.</div>`;
 const sectionJumps=(article.connections||WIKI_CONNECTIONS[article.id]||{}).sectionLinks||{};
 const slug=title=>String(title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const toc=article.sections.length>=3?`<nav class="wikiArticleToc" aria-label="Guide contents"><span>ON THIS PAGE</span><div>${article.sections.map((section,i)=>`<button type="button" data-action="wikisection" data-arg="${esc(slug(section.title))}"><small>${String(i+1).padStart(2,'0')}</small>${literal(section.title)} ${icon('arrow',14)}</button>`).join('')}</div></nav>`:'';
 const paragraphHtml=body=>String(body||'').split(/\n\s*\n/).filter(Boolean).map(p=>{const lines=p.split('\n').map(x=>x.trim()).filter(Boolean);return lines.length&&lines.every(x=>x.startsWith('- '))?'<ul>'+lines.map(x=>'<li>'+importLinkMarkup(x.slice(2),literal)+'</li>').join('')+'</ul>':'<p>'+lines.map(line=>importLinkMarkup(line,literal)).join(' ')+'</p>';}).join('');
 const articleImage=id=>{
  const image=(article.images||[]).find(x=>x.id===id);
  if(!image)return '';
  const src=String(image.src||image.dataUrl||'');
  // Curated illustrations from Arcana's approved asset pack; do not permit arbitrary external URLs.
  const illustrated=/^\/assets\/icons\/idlearc-refined\/(?:classes|equipment|features|stats|tokens)\/[a-z0-9-]+\.svg$/.test(src);
  const uploaded=/^(\/content\/wiki\/images\/[a-z0-9/-]+\.webp|data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+)$/i.test(src);
  if(!illustrated&&!uploaded)return '';
  return '<figure class="wikiArticleFigure'+(illustrated?' wikiArticleFigureIllustration':'')+'"><img src="'+literal(src)+'" alt="'+literal(image.alt)+'" loading="lazy" decoding="async"><figcaption>'+literal(image.caption||'')+'</figcaption></figure>';
 };
 const rows=article.sections.map(s=>`<section class="wikiArticleSection" id="section-${esc(slug(s.title))}"><h2 tabindex="-1">${literal(s.title)}</h2>${s.body?paragraphHtml(s.body):''}${s.imageId?articleImage(s.imageId):''}${s.table?.length?`<div class="wikiTableFrame"><table><thead><tr>${s.table[0].map(t=>`<th>${literal(t)}</th>`).join('')}</tr></thead><tbody>${s.table.slice(1).map(r=>`<tr>${r.map(c=>`<td>${literal(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}${sectionJumps[s.title]?.length?'<nav class="wikiSectionActions" aria-label="Tools for '+esc(s.title)+'">'+navCards(sectionJumps[s.title],{compact:true})+'</nav>':''}</section>`).join('');
 return `<article class="wikiArticle"><button class="wikiBack" data-route="wiki/guides">${icon('back',16)} All guides</button><div class="wikiArticleIntro"><span class="wikiEyebrow">${literal(article.category.toUpperCase())} · ${literal(article.readTime.toUpperCase())}</span><h1>${literal(article.title)}</h1><p>${literal(article.summary)}</p><div class="wikiArticleTags"><span>${icon('check',15)} ${article.attribution?'Imported article':'Season 2 reference'}</span><span>${icon('book',15)} Quick reading</span></div><button type="button" class="wikiShareBtn" data-action="wikishare" data-arg="${esc(article.id)}">${icon('link',17)} Copy guide link</button></div>${toc}<div class="wikiArticleBody">${rows}</div><div class="wikiArticleActions"><span class="wikiEyebrow">DO SOMETHING WITH THIS</span><h2>Continue in Arcana</h2><div class="wikiActionGrid">${article.actions.map(a=>`<button class="wikiAction" data-action="route" data-arg="${esc(a.route)}">${icon(a.icon,20)}<strong>${literal(a.label)}</strong>${icon('arrow',15)}</button>`).join('')}</div></div>${relatedArticleLinks(article)}${article.attribution?.sourceUrl?`<p class="wikiSource">Originally published at <a href="${esc(article.attribution.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fandom: ${literal(article.attribution.sourceTitle)}</a>. Imported from the source wiki; see its history for attribution and licensing. ${article.attribution.contributors?.length?'Export contributor records: '+article.attribution.contributors.map(literal).join(', ')+'.':''}</p>`:''}${article.sourceUrl?`<p class="wikiSource">Additional reference: <a href="${esc(article.sourceUrl)}" target="_blank" rel="noopener noreferrer">${literal(article.sourceLabel||'Read source')} ↗</a></p>`:''}<div class="wikiEnd"><button type="button" data-action="wikitop" class="wikiTextLink">${icon('back',15)} Back to top</button><button data-route="wiki/guides" class="wikiTextLink">${icon('book',15)} All guides</button></div></article>`;
}
const relatedRecords=(entry,all)=>{const facts=Object.fromEntries((entry.facts||[]).map(([k,v])=>[k,String(v)]));let related=[];if(entry.gameKind==='monster'&&facts.Biome)related=all.filter(x=>x.gameKind==='biome'&&x.title===facts.Biome);if(entry.gameKind==='biome')related=all.filter(x=>x.gameKind==='monster'&&(x.facts||[]).some(([k,v])=>k==='Biome'&&v===entry.title)).slice(0,7);if(entry.gameKind==='class-skill'&&facts.Class)related=all.filter(x=>x.gameKind==='class-skill'&&x.id!==entry.id&&x.className===facts.Class&&x.branch===facts.Branch).slice(0,6);if(entry.gameKind==='rune')related=all.filter(x=>x.gameKind==='runeword'&&String(x.keywords||'').toLowerCase().includes(entry.title.toLowerCase())).slice(0,6);
 if(entry.gameKind==='item'&&entry.slot)related=all.filter(x=>x.gameKind==='item'&&x.id!==entry.id&&x.slot===entry.slot).slice(0,6);
 if(['pet-affix','pet-bonus','item-affix'].includes(entry.gameKind))related=all.filter(x=>x.gameKind===entry.gameKind&&x.id!==entry.id).slice(0,6);
 return related;};
export function wikiRecordView(entry,all=[],returnCategory='all'){if(!entry)return '<div class="wikiEmpty"><strong>Reference unavailable</strong><p>Try searching for the item again.</p></div>';
 const kind=entry.gameKind||entry.kind,real={...entry,kind},recRelated=relatedRecords(entry,all);const actions=[];
 if(kind==='item')actions.push(['Compare this item','compare',entry.id,'compare'],['See upgrade costs','upgrade',entry.id,'calculator'],['Equip in Build Studio','equip',entry.id,'flask'],['How the Forge works','route','wiki/article?id=forge','book']);
 if(kind==='class-skill')actions.push(['Open Class Skill Tree','route','labs/skills','git'],['Plan a full build','route','labs/build','flask']);
 if(kind==='passive')actions.push(['Open Passive Tree','route','labs/passives','layers'],['Season 2 guide','route','wiki/article?id=season-2','book']);
 if(['rune','runeword'].includes(kind))actions.push(['Open Rune Forge','route','labs/runes','gem'],['How rune grids unlock','route','wiki/article?id=rune-grid','book']);
 if(kind==='pet-affix')actions.push(['Pet Affix Cost Calculator','route','calculators/affixes','calculator'],['Configure pet loadout','route','labs/pets','paw'],['Pet Affix upgrade guide','route','wiki/article?id=pet-affix-costs','book']);
 if(kind==='pet-bonus')actions.push(['Pet Compound Calculator','route','calculators/pet','calculator'],['Configure pet loadout','route','labs/pets','paw']);
 if(kind==='pet')actions.push(['Configure pet loadout','route','labs/pets','paw'],['Read Pet Compound guide','route','wiki/article?id=pet-compound','book']);
 if(kind==='biome'||kind==='monster')actions.push(['Browse Biomes & Monsters','route','wiki/library?kind=monster','search'],['Monster Level farming guide','route','wiki/article?id=monster-level','book']);
 if(kind==='material')actions.push(['Open Upgrade Calculator','route','calculators/upgrade','calculator'],['Forge guide','route','wiki/article?id=forge','book']);
 if(kind==='item-affix')actions.push(['Compare equipment','route','calculators/compare','compare']);
 const facts=(entry.facts||[]).map(([k,v])=>`<div class="wikiFact"><span>${literal(k)}</span><strong>${literal(v)}</strong></div>`).join('');
 return `<article class="wikiReferencePage"><button class="wikiBack" data-route="wiki/library" data-params="kind=${esc(returnCategory==='all'||WIKI_CATEGORY_LIST.some(([k])=>k===returnCategory)?returnCategory:kind)}">${icon('back',16)} Back to references</button><div class="wikiReferenceHero"><span class="wikiReferenceArt ${imageKinds.has(kind)?'':'wikiReferenceArtText'}">${imageKinds.has(kind)?recordArt(real,94):icon(badgeIcon(kind),30)}</span><div><span class="wikiEyebrow">${literal(recordKindLabel(kind).toUpperCase())}</span><h1>${literal(entry.title)}</h1><p>${literal(entry.description)}</p></div></div>
 <button type="button" class="wikiShareBtn" data-action="wikirefshare" data-arg="${esc(entry.id)}">${icon('link',17)} Copy reference link</button>
 ${facts?`<section class="wikiFactPanel"><span class="wikiEyebrow">AT A GLANCE</span><div class="wikiFactGrid">${facts}</div></section>`:''}
 <div class="wikiArticleActions"><span class="wikiEyebrow">RELATED ACTIONS</span><h2>Explore further</h2><div class="wikiActionGrid">${actions.map(([label,action,arg,mark])=>`<button class="wikiAction" data-action="${action}" data-arg="${esc(arg)}">${icon(mark,20)}<strong>${literal(label)}</strong>${icon('arrow',15)}</button>`).join('')||`<button class="wikiAction" data-action="searchterm" data-arg="${literal(entry.title)}">${icon('search',20)}<strong>Search related information</strong>${icon('arrow',15)}</button>`}</div></div>
 ${recRelated.length?`<section class="wikiRelated"><span class="wikiEyebrow">KEEP EXPLORING</span><h2>Related references</h2><div class="wikiRecordList">${recRelated.map(wikiRecordCard).join('')}</div></section>`:''}
 <p class="wikiSource">Game reference · Season 2 · October 2026</p></article>`;
}
