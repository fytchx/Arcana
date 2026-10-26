// Arcana Atlas: compact, connected home destinations. Built with the real icon registry.
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// All destinations use the site's existing router or home-menu action.
const destinations=[
 {title:'Pathfinder',detail:'Upgrade costs and materials',icon:'feature-upgrade',route:'calculators/pathfinder'},
 {title:'Calculators',detail:'Pets, farming, affixes',icon:'feature-calculator',menu:'tools'},
 {title:'ArcanaWiki',detail:'Mechanics and references',icon:'book',route:'wiki'},
 {title:'Guilds',detail:'Find your people',icon:'feature-guild-finder',route:'guilds'},
 {title:'Builds',detail:'Community setups',icon:'users',route:'community'},
 {title:'Guides',detail:'Progression and strategy',icon:'book',route:'wiki/guides'}
];
export function atlasHomeScreen(icon,profile=null){
 const tiles=destinations.map(x=>{
  const nav=x.menu?'data-action="homemenu" data-arg="'+x.menu+'"':'data-route="'+x.route+'"';
  return '<button type="button" class="atlasTile" '+nav+' aria-label="Explore '+x.title+'"><span class="atlasTileIcon" aria-hidden="true">'+icon(x.icon,29)+'</span><span class="atlasTileCopy"><strong>'+x.title+'</strong><small>'+x.detail+'</small></span><span class="atlasTileArrow" aria-hidden="true">'+icon('arrow',17)+'</span></button>';
 }).join('');
 const accountName=typeof profile?.displayName==='string'&&profile.displayName.trim()?profile.displayName.trim():'Arcana player';
 const accountPrompt=profile?'<strong>Welcome back, '+escapeHTML(accountName)+'</strong><small>Your builds, character, badges and account settings.</small>':'<strong>My Arcana</strong><small>Profiles, saved builds and community.</small>';
 const accountButton=profile?'My Account':'Sign up / Log in';
 return '<div class="atlasHome" aria-label="Arcana homepage">'+
 '<a class="atlasUpdate" href="/#/journal/article?slug=idlearc-1-3-7-the-timing-couldnt-be-better"><span class="atlasUpdateTag">PATCH NOTES</span><span class="atlasUpdateTitle">IdleArc 1.3.7: A Step Forward</span><span class="atlasUpdateDate">OCT 18 '+icon('arrow',15)+'</span></a>'+
 '<section class="atlasAccountEntry" aria-label="Arcana account"><div class="atlasAccountEntryIcon" aria-hidden="true">'+icon('users',22)+'</div><div class="atlasAccountEntryCopy"><span class="atlasEyebrow">MY ARCANA</span>'+accountPrompt+'</div><button type="button" class="atlasAccountEntryButton" data-route="account" aria-label="'+accountButton+'">'+accountButton+' '+icon('arrow',16)+'</button></section>'+ 
 '<section class="atlasHero" aria-label="Build Studio"><img class="atlasHeroEmblem" src="/assets/arcana-logo.webp" alt="" loading="lazy"><span class="atlasHeroIcon" aria-hidden="true">'+icon('feature-build-studio',38)+'</span><span class="atlasHeroText"><span class="atlasEyebrow">THE HEART OF ARCANA</span><strong>Build Studio</strong><small>Test gear, runes, pets and skills</small></span><button type="button" class="atlasHeroGo" data-route="labs/build" aria-label="Open Build Studio">'+icon('arrow',22)+'</button></section>'+
 '<section class="atlasTools" aria-labelledby="atlasToolsHeading"><div class="atlasSectionHead"><h2 id="atlasToolsHeading">EXPLORE ARCANA</h2><button type="button" data-route="directory">All tools '+icon('arrow',15)+'</button></div><div class="atlasTileGrid">'+tiles+'</div></section>'+
 '<section class="atlasJournal" aria-labelledby="atlasJournalHeading"><div class="atlasSectionHead"><h2 id="atlasJournalHeading">THE JOURNAL</h2><a href="/#/journal">All stories '+icon('arrow',15)+'</a></div>'+
 '<a class="atlasJournalStory" href="/#/journal/article?slug=help-shape-arcana" data-journal-latest><span class="journalHomeCategory">COMMUNITY · OCT 25</span><strong>Help Shape Arcana</strong><small>What we have, what comes next, and why I want your feedback.</small><span class="atlasJournalRead">Read article '+icon('arrow',16)+'</span></a>'+
 '<div id="atlasJournalMore" class="atlasJournalMore" aria-label="More Arcana articles"><a class="atlasJournalExtra" href="/#/journal/article?slug=class-balance-top-250-season-2"><span><em>META &amp; BALANCE</em><strong>Class Balance: The Top 250 Tells a Story</strong><small>A closer look at the Season 2 leaderboard.</small></span>'+icon('arrow',16)+'</a></div>'+
 '<div class="atlasFeatureLinks" aria-label="Featured guides and community"><button type="button" class="atlasFeatureLink atlasConvergenceFeature" data-route="wiki/article" data-params="id=convergence-complete-guide"><span>'+icon('book',16)+' FEATURED GUIDE · CONVERGENCE</span><strong>Convergence: Complete Season 2 Guide</strong><small>Master the tier loop, elites, seats and all 37 Lattice nodes.</small></button><button type="button" class="atlasFeatureLink" data-route="community"><span>'+icon('users',16)+' COMMUNITY BUILDS</span><strong>See what players are using</strong><small>Explore shared setups and character ideas</small></button></div></section>'+
 '<div class="atlasFooterLinks"><button type="button" data-route="recent">'+icon('clock',16)+' Continue where you left off</button><button type="button" data-route="directory">'+icon('layers',16)+' Browse all destinations</button></div></div>';
}
