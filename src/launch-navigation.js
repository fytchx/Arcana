import {esc,icon} from './ui.js';
import {ACCENT_PRESETS,selectedAccent} from './theme.js';

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
 codex:{title:'Codex',detail:'Find game records, artwork and equipment without guessing where to look.',links:[
  link('Full Codex','All verified indexed game records.','wiki/library','search',{kind:'all'}),
  link('Equipment & Items','Weapons, armor and equipment.','wiki/library','shield',{kind:'item'}),
  link('Pets','Pet records and companions.','wiki/library','paw',{kind:'pet'}),
  link('Runes & Runewords','Rune combinations and records.','wiki/library','gem',{kind:'runeword'}),
  link('Materials','Browse resources and materials.','wiki/library','box',{kind:'material'}),
  link('Monsters & Biomes','Browse the game world.','wiki/library','layers',{kind:'biome'}),
  link('Class Skills','Browse class abilities.','wiki/library','git',{kind:'class-skill'})
 ]},
 social:{title:'Guild & Raid Finder',detail:'Find players, recruit members and plan group content.',links:[
  link('Find a Guild','Browse guild recruitment profiles.','lfg/guilds','users'),
  link('Find a Raid','Browse current raid listings.','lfg/raids','users'),
  link('Guild Skill Planner','Plan guild progression together.','labs/guild-tree','shield'),
  link('Player Community','Profiles, guides and shared builds.','community','users')
 ]}
});
export const HOME_CARDS=Object.freeze([
 {id:'wiki',title:'Wiki',detail:'Game systems & articles',icon:'book'},
 {id:'tools',title:'Tools',detail:'Calculators & planners',icon:'calculator'},
 {id:'guides',title:'Guides',detail:'Learn & contribute',icon:'book'},
 {id:'builds',title:'Builds',detail:'Create & share setups',icon:'shield'},
 {id:'codex',title:'Codex',detail:'Items & game records',icon:'layers'},
 {id:'social',title:'Guild & Raid Finder',detail:'Groups & recruitment',icon:'users'}
]);
const attrs=x=>'data-route="'+esc(x.route)+'"'+(x.params?' data-params="'+esc(new URLSearchParams(x.params).toString())+'"':'');
const navrow=x=>'<button type="button" class="launchNavRow" '+attrs(x)+'><span class="launchNavIcon">'+icon(x.icon||'arrow',20)+'</span><span class="launchNavCopy"><strong>'+esc(x.label)+'</strong><small>'+esc(x.detail)+'</small></span>'+icon('arrow',17)+'</button>';
export function homeScreen(){
 return '<section class="launchHero" aria-label="Featured Build Studio">'+
  '<span class="launchHeroArt" aria-hidden="true">'+icon('gem',47)+'</span>'+
  '<div class="launchHeroText"><span class="launchEyebrow">YOUR CHARACTER WORKSPACE</span><h1>Build Studio</h1>'+
  '<p>Gear, runes, pets and skill trees. One connected build.</p>'+
  '<button type="button" class="launchHeroCTA" data-route="labs/build">Open Studio '+icon('arrow',16)+'</button>'+
  '<div class="launchHeroPills"><span>Equipment</span><span>Rune Forge</span><span>Skill Trees</span><span>Pets</span></div></div></section>'+
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
 const related=slug==='gear-awakening'?[link('Equipment Codex','Browse items.','wiki/library','shield',{kind:'item'}),link('Upgrade Calculator','Equipment costs and upgrades.','calculators/upgrade','calculator')]:
 slug==='pets-runes-talismans'?[link('Pet Codex','Browse companions.','wiki/library','paw',{kind:'pet'}),link('Rune Forge · Build Studio','Plan rune placement.','labs/runes','gem')]:
 slug==='combat-monsters-biomes'?[link('Biome Codex','Explore biomes.','wiki/library','layers',{kind:'biome'}),link('ML Farming Comparator','Compare farming speed.','calculators/ml-farm','sword')]:
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
 link('My Build Studio','Jump back into your character.','labs/build','shield'),
 link('Beta Feedback','Report anything that needs fixing.','beta','info')
 ].map(navrow).join('')+'</div></div>';
}
const PREF_KEY='arcana-launch-prefs';
export function appPrefs(){try{const raw=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return {compact:raw.compact===true,reduceMotion:raw.reduceMotion===true}}catch{return {compact:false,reduceMotion:false}}}
export function applyAppPrefs(){const prefs=appPrefs();document.documentElement.dataset.launchCompact=String(prefs.compact);document.documentElement.dataset.launchReduceMotion=String(prefs.reduceMotion)}
export function changeAppPref(key,checked){if(!['compact','reduceMotion'].includes(key))return;const p={...appPrefs(),[key]:checked===true};try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch{}applyAppPrefs()}
export function settingsView(){
 const p=appPrefs(),selected=selectedAccent();
 const colorCards=ACCENT_PRESETS.map(x=>'<button type="button" class="slateAccentChoice '+(selected===x.id?'selected':'')+'" data-action="accent" data-arg="'+esc(x.id)+'" aria-pressed="'+(selected===x.id)+'"><span class="slateAccentSwatch" style="--swatch:'+x.hex+'"></span><span>'+esc(x.name)+'</span>'+(selected===x.id?'<b aria-hidden="true">✓</b>':'')+'</button>').join('');
 return '<div class="launchPage slateSettings"><span class="launchEyebrow">USER CENTER</span><h1>App Settings</h1><p>Make Arcana yours. Your accent color is saved in this browser and used across Arcana pages and tools.</p>'+
 '<section class="slateSettingsBlock"><h2>Accent color</h2><p>The same ten palettes, now on the neutral Slate layout. Changing your color never alters game stats or builds.</p><div class="slateAccentGrid" role="group" aria-label="Choose Arcana accent color">'+colorCards+'</div>'+
 '<button type="button" class="slateSiteTheme '+(selected==='site'?'selected':'')+'" data-action="accent" data-arg="site" aria-pressed="'+(selected==='site')+'">Follow centrally managed Arcana theme '+(selected==='site'?'✓':'')+'</button></section>'+
 '<section class="slateSettingsBlock"><h2>Display</h2><div class="launchSettingList"><label class="launchSetting"><span><strong>Compact navigation</strong><small>Make rows and menus tighter.</small></span><input type="checkbox" data-app-pref="compact" '+(p.compact?'checked':'')+'></label><label class="launchSetting"><span><strong>Reduce animations</strong><small>Minimize motion effects.</small></span><input type="checkbox" data-app-pref="reduceMotion" '+(p.reduceMotion?'checked':'')+'></label></div></section>'+
 '<p class="mutedSmall">Preferences on this preview are stored locally in your browser, not your account. They do not change production.</p></div>';
}
