// Arcana Atlas: compact, connected home destinations. Built with the real icon registry.
// All destinations use the site's existing router or home-menu action.
const destinations=[
 {title:'Pathfinder',detail:'Upgrade costs and materials',icon:'feature-upgrade',route:'calculators/pathfinder'},
 {title:'Calculators',detail:'Pets, farming, affixes',icon:'feature-calculator',menu:'tools'},
 {title:'ArcanaWiki',detail:'Mechanics and references',icon:'book',route:'wiki'},
 {title:'Guilds',detail:'Find your people',icon:'feature-guild-finder',route:'guilds'},
 {title:'Builds',detail:'Community setups',icon:'users',route:'community'},
 {title:'Guides',detail:'Progression and strategy',icon:'book',route:'wiki/guides'}
];
export function atlasHomeScreen(icon){
 const tiles=destinations.map(x=>{
  const nav=x.menu?'data-action="homemenu" data-arg="'+x.menu+'"':'data-route="'+x.route+'"';
  return '<button type="button" class="atlasTile" '+nav+' aria-label="Explore '+x.title+'"><span class="atlasTileIcon" aria-hidden="true">'+icon(x.icon,29)+'</span><span class="atlasTileCopy"><strong>'+x.title+'</strong><small>'+x.detail+'</small></span><span class="atlasTileArrow" aria-hidden="true">'+icon('arrow',17)+'</span></button>';
 }).join('');
 return '<div class="atlasHome" aria-label="Arcana homepage">'+
 '<a class="atlasUpdate" href="/journal/idlearc-1-3-7-the-timing-couldnt-be-better"><span class="atlasUpdateTag">PATCH NOTES</span><span class="atlasUpdateTitle">IdleArc 1.3.7: A Step Forward</span><span class="atlasUpdateDate">OCT 18 '+icon('arrow',15)+'</span></a>'+
 '<section class="atlasHero" aria-label="Build Studio"><img class="atlasHeroEmblem" src="/assets/arcana-logo.webp" alt="" loading="lazy"><span class="atlasHeroIcon" aria-hidden="true">'+icon('feature-build-studio',38)+'</span><span class="atlasHeroText"><span class="atlasEyebrow">THE HEART OF ARCANA</span><strong>Build Studio</strong><small>Test gear, runes, pets and skills</small></span><button type="button" class="atlasHeroGo" data-route="labs/build" aria-label="Open Build Studio">'+icon('arrow',22)+'</button></section>'+
 '<section class="atlasTools" aria-labelledby="atlasToolsHeading"><div class="atlasSectionHead"><h2 id="atlasToolsHeading">EXPLORE ARCANA</h2><button type="button" data-route="directory">All tools '+icon('arrow',15)+'</button></div><div class="atlasTileGrid">'+tiles+'</div></section>'+
 '<section class="atlasJournal" aria-labelledby="atlasJournalHeading"><div class="atlasSectionHead"><h2 id="atlasJournalHeading">THE JOURNAL</h2><a href="/journal">All stories '+icon('arrow',15)+'</a></div>'+
 '<a class="atlasJournalStory" href="/journal/idlearc-1-3-7-the-timing-couldnt-be-better" data-journal-latest><span class="journalHomeCategory">NEWS · OCT 18</span><strong>IdleArc 1.3.7: A Step Forward</strong><small>A welcome update arrives just as our class balance analysis goes live.</small><span class="atlasJournalRead">Read article '+icon('arrow',16)+'</span></a></section>'+
 '<div class="atlasFooterLinks"><button type="button" data-route="recent">'+icon('clock',16)+' Continue where you left off</button><button type="button" data-route="directory">'+icon('layers',16)+' Browse all destinations</button></div></div>';
}
