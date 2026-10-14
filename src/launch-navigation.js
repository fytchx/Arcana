import {esc,icon} from './ui.js';
import {ACCENT_PRESETS,SITE_SURFACES,ICON_MODES,selectedAccent,selectedSiteSurface,selectedIconColor,selectedIconMode} from './theme.js';
import {ICON_CATEGORIES,ICON_IDS,iconAssetPath} from './arcana-icons.js';

// One navigation registry for the launch home, its popovers and the A-Z directory.
// Topics are navigation shells until the editorial team publishes actual articles.
export const WIKI_TOPICS = Object.freeze([
 {slug:'gear-awakening',title:'Gear and Awakening',detail:'Equipment, rarities, reforging and awakening.',icon:'shield'},
 {slug:'pets-runes-talismans',title:'Pets, Runes, and Talismans',detail:'Companions, rune systems, talismans and bonuses.',icon:'paw'},
 {slug:'combat-monsters-biomes',title:'Combat, Monsters, and Biomes',detail:'Combat rules, monsters and places to farm.',icon:'sword'},
 {slug:'progression',title:'Progression and Seasons',detail:'Character levels, Monster Level and seasonal systems.',icon:'layers'},
 {slug:'guilds-raids',title:'Guilds and Rift Raids',detail:'Guild progression, group content and raid systems.',icon:'users'}
]);
const link=(label,detail,route,iconName='arrow',params=null)=>({label,detail,route,icon:iconName,params});
const topic=slug=>link(WIKI_TOPICS.find(x=>x.slug===slug)?.title||slug,'Explore the topic hub','wiki/topic','book',{slug});
export const HOME_MENUS=Object.freeze({
 wiki:{title:'Wiki',detail:'Every game system, explained and connected to your tools.',links:[
  link('Explore the Wiki','Open the full ArcanaWiki home page.','wiki','book'),
  link('About IdleArc','The game at a glance, with links to key systems.','wiki/about','info'),
  topic('gear-awakening'),topic('pets-runes-talismans'),topic('combat-monsters-biomes'),
  link('All Wiki topics','Browse every topic, with more coming as content is published.','wiki/topics','layers')
 ]},
 tools:{title:'Tools',detail:'Calculators and planners. Rune Forge and skill trees live inside Build Studio.',links:[
  link('Upgrade Cost Calculator','Plan equipment upgrades.','calculators/upgrade','calculator'),
  link('Arcana Pathfinder','Swipe through costs for every rarity and awakened level.','calculators/pathfinder','layers'),
  link('Equipment Comparison','Compare two equipment bases.','calculators/compare','compare'),
  link('Pet Compound Calculator','Inspect pet Compound and Drop Bonus.','calculators/pet','paw'),
  link('Pet Affix Costs','Calculate Pet Shard requirements.','calculators/affixes','calculator'),
  link('ML Farming Comparator','Compare monster farming speed.','calculators/ml-farm','sword'),
  link('Guild Skill Planner','Plan and share guild skill allocations.','labs/guild-tree','shield')
 ]},
 guides:{title:'Guides',detail:'Read, learn and contribute to the community.',links:[
  link('Player Guides','Read curated ArcanaWiki guides.','wiki/guides','book'),
  link('Season 2 Guide','Essential systems for the current season.','wiki/article','layers',{id:'season-2'}),
  link('Community Guides','Player-submitted guides and walkthroughs.','community','users'),
  link('Publish a Guide','Create a guide with your account.','community/create','edit',{kind:'guide'}),
  link('Wiki Studio','Editor publishing workspace.','wiki/studio','book')
 ]},
 builds:{title:'Builds',detail:'Build Studio is the home for equipment, runes, skills and pet bonuses.',links:[
  link('Open Build Studio','Your connected character workspace.','labs/build','shield'),
  link('Rune Forge · Build Studio','Edit the rune grid saved with your build.','labs/runes','gem'),
  link('Passive Tree · Build Studio','Allocate character passives for your build.','labs/passives','layers'),
  link('Class Skills · Build Studio','Plan class skills in the same workspace.','labs/skills','git'),
  link('Community Builds & Guides','Discover setups other players have shared.','community','users'),
  link('Publish a Build','Share a snapshot from your Build Studio.','community/create','edit',{kind:'build'})
 ]},
 pathfinder:{title:'Pathfinder',detail:'Quickly browse every equipment upgrade without entering your inventory.',links:[
  link('Pathfinder Planner','See the exact listed cost of every enhancement.','calculators/pathfinder','layers'),
  link('Build Studio','Set your current gear and share a build.','labs/build','shield'),
  link('Materials · Wiki','Materials and their verified sources.','wiki/library','box',{kind:'material'}),
  link('Monsters · Wiki','Learn about monsters and their drops.','wiki/library','sword',{kind:'monster'}),
  link('ML Farming Comparator','Compare measured monster kill speeds.','calculators/ml-farm','sword')
 ]},
 social:{title:'Guild & Raid Finder',detail:'Find players, recruit members and plan group content.',links:[
  link('Find a Guild','Browse guild recruitment profiles.','lfg/guilds','users'),
  link('Find a Raid','Browse current raid listings.','lfg/raids','users'),
  link('Guild Skill Planner','Plan guild progression together.','labs/guild-tree','shield'),
  link('Player Community','Profiles, guides and shared builds.','community','users')
 ]}
});
export const HOME_CARDS=Object.freeze([
 {id:'wiki',title:'Wiki',detail:'Game systems & articles',icon:'feature-wiki'},
 {id:'tools',title:'Tools',detail:'Calculators & planners',icon:'feature-calculator'},
 {id:'guides',title:'Guides',detail:'Learn & contribute',icon:'feature-guides'},
 {id:'builds',title:'Builds',detail:'Create & share setups',icon:'feature-build-studio'},
 {id:'pathfinder',title:'Pathfinder',detail:'Swipe through upgrade costs',icon:'feature-codex'},
 {id:'social',title:'Guild & Raid Finder',detail:'Groups & recruitment',icon:'feature-guild-finder'}
]);
const attrs=x=>'data-route="'+esc(x.route)+'"'+(x.params?' data-params="'+esc(new URLSearchParams(x.params).toString())+'"':'');
const navrow=x=>'<button type="button" class="launchNavRow" '+attrs(x)+'><span class="launchNavIcon">'+icon(x.icon||'arrow',20)+'</span><span class="launchNavCopy"><strong>'+esc(x.label)+'</strong><small>'+esc(x.detail)+'</small></span>'+icon('arrow',17)+'</button>';
export function homeScreen(){
 return '<section class="launchHero" aria-label="Featured Build Studio">'+
  '<svg class="launchHeroArcaneSeal" viewBox="0 0 160 160" fill="none" aria-hidden="true" focusable="false"><circle cx="80" cy="80" r="66"/><circle cx="80" cy="80" r="53"/><circle cx="80" cy="80" r="35"/><path d="M80 5v26m0 98v26M5 80h26m98 0h26M25 25l19 19m72 72 19 19m0-110-19 19m-72 72-19 19M80 40l40 40-40 40-40-40zM80 54l26 26-26 26-26-26z"/><circle cx="80" cy="15" r="3"/><circle cx="145" cy="80" r="3"/><circle cx="80" cy="145" r="3"/><circle cx="15" cy="80" r="3"/></svg>'+
  '<div class="launchHeroHeader"><span class="launchHeroArt" aria-hidden="true">'+icon('feature-build-studio',38)+'</span>'+
  '<div class="launchHeroText"><span class="launchEyebrow">THE HEART OF ARCANA</span><h1>Build Studio</h1>'+
  '<p>Gear, runes, pets and skill trees. One connected build.</p></div></div>'+
  '<button type="button" class="launchHeroCTA" data-route="labs/build" aria-label="Enter Build Studio"><span class="launchHeroCTASigil" aria-hidden="true">'+icon('feature-rune-forge',22)+'</span><span class="launchHeroCTACopy"><strong>Enter Build Studio</strong><small>Forge your perfect setup</small></span>'+icon('arrow',20)+'</button>'+
  '</section>'+
  '<section class="launchQuick" aria-label="Quick Access"><div class="launchSectionTop"><h2>Quick Access</h2><button type="button" data-route="directory" class="launchSeeAll">See All '+icon('arrow',16)+'</button></div>'+
  '<div class="launchQuickGrid">'+HOME_CARDS.map(x=>'<button type="button" class="launchQuickCard" data-action="homemenu" data-arg="'+esc(x.id)+'" aria-label="Open '+esc(x.title)+' menu"><span class="launchQuickIcon">'+icon(x.icon,27)+'</span><span class="launchQuickCopy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></span><span class="launchQuickArrow">'+icon('arrow',17)+'</span></button>').join('')+'</div></section>'+
  '<section class="launchFeatured" aria-label="Useful and Featured"><div class="launchSectionTop"><h2>Useful &amp; Featured</h2></div>'+
  '<p class="launchFeaturedIntro">Featured articles, player guides, builds and updates will live here as they are published.</p>'+
  '<div class="launchFeaturedGrid">'+[
   link('Player Guides','Browse walkthroughs and game tips.','wiki/guides','book'),
   link('Community Builds','Explore setups shared by players.','community','users'),
   link('Feedback & Updates','Help improve Arcana ahead of launch.','beta','info')
  ].map(x=>'<button type="button" class="launchFeatureRow" '+attrs(x)+'><span class="launchFeatureIcon">'+icon(x.icon,20)+'</span><span><strong>'+esc(x.label)+'</strong><small>'+esc(x.detail)+'</small></span>'+icon('arrow',16)+'</button>').join('')+'</div></section>';
}
export function homeSubmenu(id){
 const menu=HOME_MENUS[id]; if(!menu)return '';
 return '<div class="launchMenu" role="group" aria-label="'+esc(menu.title)+' destinations"><div class="launchMenuIntro"><span class="launchEyebrow">QUICK ACCESS</span><h2>'+esc(menu.title)+'</h2><p>'+esc(menu.detail)+'</p></div><div class="launchMenuLinks">'+menu.links.map(navrow).join('')+'</div></div>';
}
const extras=[
 link('About IdleArc','Game overview and navigation.','wiki/about','info'),
 link('Account & Profile','Your player card and account.','account','users'),
 link('App Settings','Display and accessibility preferences.','settings','cog'),
 link('Arcana Minimal Icons','Browse all original recolorable SVGs.','icons','gem'),
 link('Build Studio','Equipment, pets, runes, and skills.','labs/build','shield'),
 link('Class Skill Tree · Build Studio','Manage class skills.','labs/skills','git'),
 link('Passive Skill Tree · Build Studio','Manage passive skills.','labs/passives','layers'),
 link('Rune Forge · Build Studio','Place runes in your current build.','labs/runes','gem'),
 link('Player Community','Published guides and player profiles.','community','users'),
 link('Recent Activity','Return to work and recently viewed entries.','recent','clock'),
 link('Wiki Studio · Editors','Edit and publish wiki content.','wiki/studio','edit'),
 link('Beta Feedback','Send a bug report or suggestion.','beta','info'),
 link('User Center','Account, recent work and settings.','user','users'),
 link('All Wiki Topics','Browse topic categories.','wiki/topics','book')
];
export const DIRECTORY=Object.freeze([...extras,...Object.values(HOME_MENUS).flatMap(x=>x.links)]
 .filter((x,i,all)=>all.findIndex(y=>y.route===x.route&&JSON.stringify(y.params||{})===JSON.stringify(x.params||{}))===i)
 .sort((a,b)=>a.label.localeCompare(b.label,'en',{sensitivity:'base'})));
export function directoryView(){
 const groups=new Map();
 for(const x of DIRECTORY){const letter=x.label.charAt(0).toUpperCase();if(!groups.has(letter))groups.set(letter,[]);groups.get(letter).push(x);}
 return '<div class="launchPage"><span class="launchEyebrow">ALL DESTINATIONS</span><h1>Explore Arcana A–Z</h1><p>Every primary destination in one alphabetized list. No guessing which section something is hiding in.</p><div class="launchAlphabet">'+[...groups].map(([letter,links])=>'<section class="launchAlphabetGroup"><h2>'+esc(letter)+'</h2><div>'+links.map(navrow).join('')+'</div></section>').join('')+'</div></div>';
}
export function wikiTopicsView(){
 return '<div class="launchPage"><span class="launchEyebrow">ARCANAWIKI</span><h1>Wiki Topics</h1><p>Choose a topic or browse the complete Wiki. Articles will be added after the launch navigation is finalized.</p><div class="launchMenuLinks">'+WIKI_TOPICS.map(x=>navrow(link(x.title,x.detail,'wiki/topic',x.icon,{slug:x.slug}))).join('')+navrow(link('Explore the Wiki','Browse published articles.','wiki','book'))+'</div></div>';
}
export function wikiTopicView(slug){
 const entry=WIKI_TOPICS.find(x=>x.slug===slug);if(!entry)return null;
 const related=slug==='gear-awakening'?[link('Equipment References','Browse items.','wiki/library','shield',{kind:'item'}),link('Upgrade Calculator','Equipment costs and upgrades.','calculators/upgrade','calculator')]:
 slug==='pets-runes-talismans'?[link('Pet References','Browse companions.','wiki/library','paw',{kind:'pet'}),link('Rune Forge · Build Studio','Plan rune placement.','labs/runes','gem')]:
 slug==='combat-monsters-biomes'?[link('Biome References','Explore biomes.','wiki/library','layers',{kind:'biome'}),link('ML Farming Comparator','Compare farming speed.','calculators/ml-farm','sword')]:
 slug==='guilds-raids'?[link('Find a Raid','Browse raid listings.','lfg/raids','users'),link('Guild Skill Planner','Plan guild bonuses.','labs/guild-tree','shield')]:
 [link('Season 2 Guide','Current seasonal guide.','wiki/article','book',{id:'season-2'})];
 return '<div class="launchPage"><span class="launchEyebrow">WIKI / TOPICS</span><h1>'+esc(entry.title)+'</h1><p>'+esc(entry.detail)+'</p><div class="launchTopicPlaceholder"><strong>Navigation is ready. Articles come next.</strong><span>This topic hub will collect relevant pages as the Wiki is filled out.</span></div><h2>Explore related sections</h2><div class="launchMenuLinks">'+related.map(navrow).join('')+'</div></div>';
}
export function wikiAboutView(){
 return '<div class="launchPage"><span class="launchEyebrow">WELCOME TO IDLEARC</span><h1>About IdleArc</h1><p>IdleArc is an idle RPG built around character progression, equipment, skills, pets and long-term build decisions. Arcana connects guides, game references and planning tools in one place.</p><div class="launchTopicPlaceholder"><strong>Full game overview coming soon</strong><span>The content pass starts after the navigation is finalized.</span></div><div class="launchMenuLinks">'+[
 link('Explore ArcanaWiki','Browse published game information.','wiki','book'),
 link('Season 2 Essentials','Read the current season guide.','wiki/article','layers',{id:'season-2'}),
 link('Build Studio','Experiment with your character setup.','labs/build','shield')
 ].map(navrow).join('')+'</div></div>';
}
export function userCenterView(profile=null){
 const label=profile?.displayName||'Guest adventurer';
 return '<div class="launchPage"><span class="launchEyebrow">PERSONAL PORTAL</span><h1>User Center</h1><p>Pick up where you left off, manage your profile or adjust this device’s preferences.</p><div class="launchUserCard"><strong>'+esc(label)+'</strong><small>'+(profile?'Signed in to Arcana':'You can use the tools without an account')+'</small></div><div class="launchMenuLinks">'+[
 link('My Profile & Account','Player card, login and published content.','account','users'),
 link('Recent Activity','Continue work and revisit guides.','recent','clock'),
 link('App Settings','Appearance and accessibility on this device.','settings','cog'),
 link('Icon Library','Browse the complete Arcana Minimal asset pack.','icons','gem'),
 link('My Build Studio','Jump back into your character.','labs/build','shield'),
 link('Beta Feedback','Report anything that needs fixing.','beta','info')
 ].map(navrow).join('')+'</div></div>';
}
const PREF_KEY='arcana-launch-prefs';
export function appPrefs(){try{const raw=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return {compact:raw.compact===true,reduceMotion:raw.reduceMotion===true}}catch{return {compact:false,reduceMotion:false}}}
export function applyAppPrefs(){const prefs=appPrefs();document.documentElement.dataset.launchCompact=String(prefs.compact);document.documentElement.dataset.launchReduceMotion=String(prefs.reduceMotion)}
export function changeAppPref(key,checked){if(!['compact','reduceMotion'].includes(key))return;const p={...appPrefs(),[key]:checked===true};try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch{}applyAppPrefs()}
export function settingsView(){
 const p=appPrefs(),selected=selectedAccent(),surface=selectedSiteSurface(),iconColor=selectedIconColor(),iconMode=selectedIconMode();
 const accentCards=ACCENT_PRESETS.map(x=>'<button type="button" class="slateAccentChoice '+(selected===x.id?'selected':'')+'" data-action="accent" data-arg="'+esc(x.id)+'" aria-pressed="'+(selected===x.id)+'"><span class="slateAccentSwatch" style="--swatch:'+x.hex+'"></span><span>'+esc(x.name)+'</span>'+(selected===x.id?'<b aria-hidden="true">✓</b>':'')+'</button>').join('');
 const surfaceCards=SITE_SURFACES.map(x=>'<button type="button" class="arcanaSurfaceChoice '+(surface===x.id?'selected':'')+'" data-action="site-surface" data-arg="'+esc(x.id)+'" aria-pressed="'+(surface===x.id)+'"><span class="arcanaSurfacePreview" style="--surface-main:'+(x.main||'#0D1019')+';--surface-card:'+(x.secondary||'#191E2B')+'"></span><span>'+esc(x.name)+'</span></button>').join('');
 const iconColors='<button type="button" class="arcanaIconColorChoice '+(iconColor==='follow-site'?'selected':'')+'" data-action="icon-color" data-arg="follow-site" aria-pressed="'+(iconColor==='follow-site')+'"><span class="slateAccentSwatch" style="--swatch:var(--theme-highlight)"></span><span>Follow site accent</span></button>'+
 ACCENT_PRESETS.map(x=>'<button type="button" class="arcanaIconColorChoice '+(iconColor===x.id?'selected':'')+'" data-action="icon-color" data-arg="'+esc(x.id)+'" aria-pressed="'+(iconColor===x.id)+'"><span class="slateAccentSwatch" style="--swatch:'+x.hex+'"></span><span>'+esc(x.name)+'</span></button>').join('');
 const modeCards=ICON_MODES.map(x=>'<button type="button" class="arcanaIconModeChoice '+(iconMode===x.id?'selected':'')+'" data-action="icon-mode" data-arg="'+esc(x.id)+'" aria-pressed="'+(iconMode===x.id)+'"><strong>'+esc(x.name)+'</strong><small>'+esc(x.detail)+'</small></button>').join('');
 const examples=['feature-build-studio','equipment-chest','class-mage','feature-rune-forge','feature-codex','stat-retaliation'].map(id=>'<span class="arcanaThemePreviewIcon">'+icon(id,23)+'<small>'+esc(id.replace(/^(feature|equipment|class|stat)-/,'').replaceAll('-',' '))+'</small></span>').join('');
 return '<div class="launchPage slateSettings arcanaSettings"><span class="launchEyebrow">USER CENTER</span><h1>App Settings</h1><p>Color the entire Arcana interface and its custom Minimal icon pack separately. Your preferences save on this device.</p>'+
 '<section class="slateSettingsBlock"><h2>Site appearance</h2><p>Choose the foundation for Arcana. Layout and content are unchanged.</p><div class="arcanaSurfaceGrid" role="group" aria-label="Site theme">'+surfaceCards+'</div></section>'+
 '<section class="slateSettingsBlock"><h2>Site accent color</h2><p>The original ten colors control the site highlights, selected buttons and borders.</p><div class="slateAccentGrid" role="group" aria-label="Site accent color">'+accentCards+'</div>'+
 '<button type="button" class="slateSiteTheme '+(selected==='site'?'selected':'')+'" data-action="accent" data-arg="site" aria-pressed="'+(selected==='site')+'">Follow centrally managed Arcana accent '+(selected==='site'?'✓':'')+'</button></section>'+
 '<section class="slateSettingsBlock"><h2>Arcana Minimal icons</h2><p>'+ICON_IDS.length+' original SVGs. Icons can use a different color from the rest of Arcana.</p>'+
 '<div class="arcanaThemePreview" aria-label="Live preview of current icon colors">'+examples+'</div>'+
 '<h3>Icon color</h3><div class="arcanaIconColorGrid" role="group" aria-label="Icon color">'+iconColors+'</div>'+
 '<h3>Icon appearance</h3><div class="arcanaIconModeGrid" role="group" aria-label="Icon style">'+modeCards+'</div>'+
 '<button type="button" class="arcanaOpenGallery" data-route="icons">'+icon('grid',16)+' Browse all '+ICON_IDS.length+' icons '+icon('arrow',15)+'</button></section>'+
 '<section class="slateSettingsBlock"><h2>Display</h2><div class="launchSettingList"><label class="launchSetting"><span><strong>Compact navigation</strong><small>Make rows and menus tighter.</small></span><input type="checkbox" data-app-pref="compact" '+(p.compact?'checked':'')+'></label><label class="launchSetting"><span><strong>Reduce animations</strong><small>Minimize motion effects.</small></span><input type="checkbox" data-app-pref="reduceMotion" '+(p.reduceMotion?'checked':'')+'></label></div></section>'+
 '<p class="mutedSmall">Preferences are local to this browser. Production styling and your saved builds are not changed.</p></div>';
}
export function iconGalleryView(){
 const sections=Object.entries(ICON_CATEGORIES).map(([cat,ids])=>
 '<section class="arcanaIconCatalogSection"><header><h2>'+esc(cat[0].toUpperCase()+cat.slice(1))+'</h2><small>'+ids.length+' assets</small></header>'+
 '<div class="arcanaIconCatalogGrid">'+ids.map(id=>'<div class="arcanaIconCatalogItem" title="'+esc(id)+'">'+icon(id,27)+'<span>'+esc(id.replace(/^(feature|class|equipment|stat|currency)-/,'').replaceAll('-',' '))+'</span></div>').join('')+'</div></section>').join('');
 return '<div class="launchPage arcanaIconCatalog"><span class="launchEyebrow">ASSET SYSTEM</span><h1>Arcana Minimal Icon Library</h1>'+
 '<p>All '+ICON_IDS.length+' original vector assets, organized by purpose. Every icon responds to your selected color and appearance mode. These are independent from IdleArc game artwork.</p>'+
 '<button class="arcanaOpenGallery" data-route="settings">'+icon('back',16)+' Customize icon appearance</button>'+
 sections+'<p class="mutedSmall">SVG source files and the manifest are available in the Arcana repository under <code>assets/icons/arcana-minimal/</code>.</p></div>';
}
