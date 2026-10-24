import {atlasHomeScreen} from './home-atlas.js';
import {WIKI_CATEGORIES} from './wiki-taxonomy.js';
import {studioV2Panel} from './studio-v2.js';
import {esc,icon} from './ui.js';
import {ACCENT_PRESETS,SITE_SURFACES,ICON_MODES,selectedAccent,selectedSiteSurface,selectedIconColor,selectedIconMode,customAccent,ADMIN_URL} from './theme.js';
import {ICON_CATEGORIES,ICON_IDS,iconAssetPath} from './arcana-icons.js';

// One navigation registry for the launch home, its popovers and the A-Z directory.
// Topics are navigation shells until the editorial team publishes actual articles.
export const WIKI_TOPICS = Object.freeze(WIKI_CATEGORIES.map(c=>({slug:c.id,title:c.title,detail:c.description,icon:c.icon})));
const link=(label,detail,route,iconName='arrow',params=null)=>({label,detail,route,icon:iconName,params});
const topic=slug=>link(WIKI_TOPICS.find(x=>x.slug===slug)?.title||slug,'Explore the topic hub','wiki/category','book',{slug});
export const HOME_MENUS=Object.freeze({
 wiki:{title:'ArcanaWiki',detail:'Game information, equipment references, classes and mechanics.',links:[
  link('Open ArcanaWiki','Game information, systems and articles.','wiki','book'),
  link('Classes','All five playable classes.','wiki/category','shield',{slug:'classes'}),
  link('Equipment','Upgrades, reforging and sockets.','wiki/category','shield',{slug:'equipment'}),
  link('Item Codex','Equipment descriptions and artwork.','wiki/items','shield'),
  link('All Topics','Complete wiki category index.','wiki/topics','layers')
 ]},
 pathfinder:{title:'Pathfinder',detail:'Item upgrading, materials, enhancement costs, equipment comparison and upgrade planning.',links:[
  link('Upgrade Costs','Total materials and Gold between two upgrade levels.','calculators/pathfinder','calculator',{view:'range'}),
  link('Upgrade Map','Browse all ranks, enhancements and materials.','calculators/pathfinder','layers',{view:'timeline'}),
  link('Rarity Reference','Equipment rarities and upgrade information.','calculators/pathfinder','shield',{view:'upgrade'}),
  link('Compare Equipment','Compare equipment and item upgrades.','calculators/pathfinder','compare',{view:'compare'}),
  link('Upgrade Optimizer','Choose Codex equipment and plan rarity or Awakening upgrades.','calculators/optimizer','compare'),
  link('Material Reference','Materials and their wiki entries.','wiki/library','box',{kind:'material'})
 ]},
 tools:{title:'Tools',detail:'Pet calculators, farming tools, guild planning and damage analysis.',links:[
  link('Pet Compound Calculator','Pet rarity, Compound level and bonus values.','calculators/pet','paw'),
  link('Pet Affix Calculator','Pet Shard costs and affix upgrade planning.','calculators/affixes','calculator'),
  link('ML Farming Comparator','Compare Monster Level farming efficiency.','calculators/ml-farm','sword'),
  link('Guild Skill Planner','Allocate, compare and share guild skill points.','labs/guild-tree','shield'),
  link('Damage Calculator','Enter your Attack, Retaliation, or Pet breakdown and test changes.','calculators/damage','calculator'),
  link('Upgrade Optimizer','Compare item stat gains against upgrade materials and gold.','calculators/optimizer','compare')
 ]},
 builds:{title:'Builds, Guides & Wiki',detail:'Player guides, community builds, sharing and character planning.',links:[
  link('Player Guides','Guides for classes, progression and game systems.','wiki/guides','book'),
  link('Community Builds & Guides','Browse player-written guides and shared setups.','community','users'),
  link('Open Build Studio','Equipment, pets, runes and skills in one build.','labs/build','shield'),
  link('Publish a Guide','Create and share a player guide.','community/create','edit',{kind:'guide'}),
  link('Publish a Build','Share a Build Studio setup.','community/create','edit',{kind:'build'}),
  link('Rune Forge · Build Studio','Manage runewords and rune placement.','labs/runes','gem'),
  link('Passive Tree · Build Studio','Allocate character passives.','labs/passives','layers'),
  link('Class Skills · Build Studio','Plan class skill branches and ranks.','labs/skills','git')
 ]},
 guides:{title:'Player Guides',detail:'Published guides and community contributions.',links:[
  link('Player Guides','Browse player guides.','wiki/guides','book'),
  link('Season 2 Guide','Season 2 progression and systems.','wiki/article','layers',{id:'season-2'}),
  link('Community Guides','Browse community guides and builds.','community','users'),
  link('Publish a Guide','Create a player guide.','community/create','edit',{kind:'guide'}),
  link('Wiki Studio','Editor publishing workspace.','wiki/studio','book')
 ]},
 social:{title:'Guilds & Community',detail:'Guild pages, recruitment, raid groups and player community.',links:[
  link('Guild Hub','Registered guild pages, applications, and customizable official guild tags.','guilds','shield'),
  link('Legacy Guild Listings','Older recruitment listings.','lfg/guilds','users'),
  link('Find a Raid','Raid listings and groups.','lfg/raids','users'),
  link('Guild Skill Planner','Plan guild skill bonuses.','labs/guild-tree','shield'),
  link('Player Community','Profiles, guides and shared builds.','community','users')
 ]}
});
export const HOME_CARDS=Object.freeze([
 {id:'pathfinder',title:'Pathfinder',detail:'See exactly what your next upgrade costs, from materials to gold.',icon:'feature-upgrade'},
 {id:'tools',title:'Tools',detail:'Run the numbers on pets, farming, affixes and guild skills.',icon:'feature-calculator'},
 {id:'social',title:'Guilds & Community',detail:'Show your guild, find recruits and join the community.',icon:'feature-guild-finder'}
]);
const attrs=x=>'data-route="'+esc(x.route)+'"'+(x.params?' data-params="'+esc(new URLSearchParams(x.params).toString())+'"':'');
const navrow=x=>'<button type="button" class="launchNavRow" '+attrs(x)+'><span class="launchNavIcon">'+icon(x.icon||'arrow',20)+'</span><span class="launchNavCopy"><strong>'+esc(x.label)+'</strong><small>'+esc(x.detail)+'</small></span>'+icon('arrow',17)+'</button>';
export function homeScreen(){return atlasHomeScreen(icon);}
export function homeSubmenu(id){
 const menu=HOME_MENUS[id]; if(!menu)return '';
 return '<div class="launchMenu" role="group" aria-label="'+esc(menu.title)+' destinations"><div class="launchMenuIntro"><span class="launchEyebrow">EXPLORE ARCANA</span><h2>'+esc(menu.title)+'</h2><p>'+esc(menu.detail)+'</p></div><div class="launchMenuLinks">'+menu.links.map(navrow).join('')+'</div></div>';
}
const extras=[
 link('Arcana Journal','IdleArc news, class balance, opinion and development updates.','journal','book'),
 link('About IdleArc','Game overview and navigation.','wiki/about','info'),
 link('Account & Profile','Your player card and account.','account','users'),
 link('App Settings','Display and accessibility preferences.','settings','cog'),
 link('Arcana Minimal Icons','Browse all original recolorable SVGs.','icons','gem'),
 link('Build Studio','Equipment, pets, runes, and skills.','labs/build','shield'),
 link('Class Skill Tree · Build Studio','Manage class skills.','labs/skills','git'),
 link('Passive Skill Tree · Build Studio','Manage passive skills.','labs/passives','layers'),
 link('Rune Forge · Build Studio','Place runes in your current build.','labs/runes','gem'),
 link('Player Community','Published guides and player profiles.','community','users'),
 link('Guild Hub','Guild pages, recruitment and customizable tags.','guilds','shield'),
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
 return '<div class="launchPage"><span class="launchEyebrow">ALL DESTINATIONS</span><h1>Explore Arcana A–Z</h1><p>All Arcana destinations, organized alphabetically.</p><div class="launchAlphabet">'+[...groups].map(([letter,links])=>'<section class="launchAlphabetGroup"><h2>'+esc(letter)+'</h2><div>'+links.map(navrow).join('')+'</div></section>').join('')+'</div></div>';
}
export function wikiTopicsView(){
 return '<div class="launchPage"><span class="launchEyebrow">ARCANAWIKI</span><h1>Wiki Categories</h1><p>Choose a topic to see its published articles.</p><div class="launchMenuLinks">'+WIKI_TOPICS.map(c=>navrow(link(c.title,c.detail,'wiki/category',c.icon,{slug:c.slug}))).join('')+'</div></div>';
}
export function wikiTopicView(slug){
 const topic=WIKI_TOPICS.find(c=>c.slug===slug);
 if(!topic)return null;
 return '<div class="launchPage"><span class="launchEyebrow">ARCANAWIKI</span><h1>'+esc(topic.title)+'</h1><p>'+esc(topic.detail)+'</p><div class="launchMenuLinks">'+navrow(link('View published articles','Browse this category.','wiki/category',topic.icon,{slug:topic.slug}))+'</div></div>';
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
 link('App Settings','Display and accessibility options.','settings','cog'),
 link('Icon Library','Browse Arcana icon styles.','icons','gem'),
 link('My Build Studio','Jump back into your character.','labs/build','shield'),
 link('Beta Feedback','Report anything that needs fixing.','beta','info'),
 ...(profile?.roles?.some(r=>['admin','creator'].includes(r.id||r))?[link('Admin Dashboard','Private traffic statistics and management tools.','admin','shield'),link('Journal Studio','Write, edit and publish Journal articles.','journal-studio','edit')]:[])
 ].map(navrow).join('')+'</div></div>';
}
const PREF_KEY='arcana-launch-prefs';
export function appPrefs(){try{const raw=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return {compact:false,reduceMotion:raw.reduceMotion===true}}catch{return {compact:false,reduceMotion:false}}}
export function applyAppPrefs(){const prefs=appPrefs();document.documentElement.dataset.launchCompact=String(prefs.compact);document.documentElement.dataset.launchReduceMotion=String(prefs.reduceMotion)}
export function changeAppPref(key,checked){if(key!=='reduceMotion')return;const p={...appPrefs(),[key]:checked===true};try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch{}applyAppPrefs()}
export const designPanel=({showPreview=true}={})=>studioV2Panel({showPreview});
export function settingsView({admin=false,authEnabled=false,loggedIn=false}={}){
 const p=appPrefs(),selected=selectedAccent();
 const accentCards=ACCENT_PRESETS.map(x=>'<button type="button" class="slateAccentChoice '+(selected===x.id?'selected':'')+'" data-action="accent" data-arg="'+esc(x.id)+'" aria-pressed="'+(selected===x.id)+'"><span class="slateAccentSwatch" style="--swatch:'+x.hex+'"></span><span>'+esc(x.name)+'</span>'+(selected===x.id?'<b aria-hidden="true">✓</b>':'')+'</button>').join('');
 return '<div class="launchPage slateSettings arcanaSettings"><span class="launchEyebrow">PREFERENCES</span><h1>Settings</h1><p>Simple display controls. Your game progress and saved builds are unaffected.</p>'+
  '<section class="slateSettingsBlock"><h2>'+icon('settings',20)+' Accessibility</h2><div class="launchSettingList"><label class="launchSetting"><span><strong>Reduce motion</strong><small>Turn off decorative movement on this device.</small></span><input type="checkbox" data-app-pref="reduceMotion" '+(p.reduceMotion?'checked':'')+'></label></div></section>'+
  '<p class="mutedSmall">Colors, icons, fonts, layouts and all design settings are managed centrally by Arcana administrators.</p></div>';
}
export function iconGalleryView(){
 const sections=Object.entries(ICON_CATEGORIES).map(([cat,ids])=>
 '<section class="arcanaIconCatalogSection"><header><h2>'+esc(cat[0].toUpperCase()+cat.slice(1))+'</h2><small>'+ids.length+' assets</small></header>'+
 '<div class="arcanaIconCatalogGrid">'+ids.map(id=>'<div class="arcanaIconCatalogItem" title="'+esc(id)+'">'+icon(id,27)+'<span>'+esc(id.replace(/^(feature|class|equipment|stat|currency)-/,'').replaceAll('-',' '))+'</span></div>').join('')+'</div></section>').join('');
 return '<div class="launchPage arcanaIconCatalog"><span class="launchEyebrow">ASSET SYSTEM</span><h1>Arcana Minimal Icon Library</h1>'+
 '<p>All '+ICON_IDS.length+' original vector assets, organized by purpose. Every icon responds to your selected color and appearance mode. These are independent from IdleArc game artwork.</p>'+
 '<p class="mutedSmall">Icon appearance is controlled globally by Arcana administrators.</p>'+
 sections+'<p class="mutedSmall">SVG source files and the manifest are available in the Arcana repository under <code>assets/icons/arcana-minimal/</code>.</p></div>';
}
