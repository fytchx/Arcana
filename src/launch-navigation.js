import {readDesign,DEFAULT_DESIGN,DESIGN_PRESETS} from './design-controls.js';
import {WIKI_CATEGORIES} from './wiki-taxonomy.js';
import {designMiniMarkup} from './design-mini-preview.js';
import {esc,icon} from './ui.js';
import {ACCENT_PRESETS,SITE_SURFACES,ICON_MODES,selectedAccent,selectedSiteSurface,selectedIconColor,selectedIconMode,customAccent,ADMIN_URL} from './theme.js';
import {ICON_CATEGORIES,ICON_IDS,iconAssetPath} from './arcana-icons.js';

// One navigation registry for the launch home, its popovers and the A-Z directory.
// Topics are navigation shells until the editorial team publishes actual articles.
export const WIKI_TOPICS = Object.freeze(WIKI_CATEGORIES.map(c=>({slug:c.id,title:c.title,detail:c.description,icon:c.icon})));
const link=(label,detail,route,iconName='arrow',params=null)=>({label,detail,route,icon:iconName,params});
const topic=slug=>link(WIKI_TOPICS.find(x=>x.slug===slug)?.title||slug,'Explore the topic hub','wiki/category','book',{slug});
export const HOME_MENUS=Object.freeze({
 wiki:{title:'Wiki',detail:'Find game mechanics without digging through unrelated pages.',links:[
  link('Open ArcanaWiki','Browse published wiki categories.','wiki','book'),
  link('Classes','Browse the five playable classes.','wiki/category','shield',{slug:'classes'}),
  link('Equipment','Upgrades, reforging and sockets.','wiki/category','shield',{slug:'equipment'}),
  link('Item Codex','Look up equipment and verified game artwork.','wiki/items','shield'),
  link('All Topics','See every published wiki category.','wiki/topics','layers')
 ]},
 tools:{title:'Tools',detail:'Companion calculators. Gear upgrades live in Pathfinder.',links:[
  link('Pet Compound Calculator','Inspect pet Compound and Drop Bonus.','calculators/pet','paw'),
  link('Pet Affix Costs','Calculate shard requirements for affixes.','calculators/affixes','calculator'),
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
 pathfinder:{title:'Pathfinder',detail:'Every character equipment upgrade in one place.',links:[
  link('Pathfinder','Upgrade Map, From → To, Cost Reference, and Compare.','calculators/pathfinder','layers'),
  link('Materials · Wiki','Browse verified material references.','wiki/library','box',{kind:'material'})
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
 {id:'pathfinder',title:'Pathfinder',detail:'Swipe through upgrade costs',icon:'feature-upgrade'},
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
  '<div class="launchQuickGrid">'+HOME_CARDS.map(x=>'<button type="button" class="launchQuickCard" data-action="homemenu" data-arg="'+esc(x.id)+'" aria-label="Open '+esc(x.title)+' menu"><span class="launchQuickEmblem" aria-hidden="true">'+icon(x.icon,90)+'</span><span class="launchQuickIcon">'+icon(x.icon,32)+'</span><span class="launchQuickCopy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></span><span class="launchQuickArrow">'+icon('arrow',17)+'</span></button>').join('')+'</div></section>'+
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
 link('Beta Feedback','Report anything that needs fixing.','beta','info')
 ].map(navrow).join('')+'</div></div>';
}
const PREF_KEY='arcana-launch-prefs';
export function appPrefs(){try{const raw=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return {compact:raw.compact===true,reduceMotion:raw.reduceMotion===true}}catch{return {compact:false,reduceMotion:false}}}
export function applyAppPrefs(){const prefs=appPrefs();document.documentElement.dataset.launchCompact=String(prefs.compact);document.documentElement.dataset.launchReduceMotion=String(prefs.reduceMotion)}
export function changeAppPref(key,checked){if(!['compact','reduceMotion'].includes(key))return;const p={...appPrefs(),[key]:checked===true};try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch{}applyAppPrefs()}
const designPanel=()=>{
 const d=readDesign();
 const color=(key,label)=>'<div class="designControl designColorControl"><span>'+label+'</span><input type="color" data-design-field="'+key+'" value="'+esc(d[key])+'" aria-label="'+label+' color picker"><input type="text" data-design-hex="'+key+'" value="'+esc(d[key])+'" inputmode="text" maxlength="7" spellcheck="false" autocorrect="off" autocapitalize="characters" aria-label="'+label+' HEX code" aria-describedby="designHexStatus-'+key+'" placeholder="#A78BFA"><small class="designHexStatus" id="designHexStatus-'+key+'" data-design-status="'+key+'" role="status">HEX code</small></div>';
 const unit=key=>['roundness','buttonRoundness','cardPadding','borderWidth','buttonHeight'].includes(key)?' px':'%';
 const slider=(key,label,lo,hi)=>'<label class="designControl"><span>'+label+'</span><input type="range" min="'+lo+'" max="'+hi+'" data-design-field="'+key+'" value="'+d[key]+'" aria-label="'+label+'"><strong data-design-value="'+key+'">'+d[key]+unit(key)+'</strong></label>';
 const select=(key,label,opts)=>'<label class="designControl"><span>'+label+'</span><select data-design-field="'+key+'" aria-label="'+label+'">'+opts.map(([id,name])=>'<option value="'+id+'" '+(d[key]===id?'selected':'')+'>'+name+'</option>').join('')+'</select></label>';
 const group=(name,body,description='')=>'<details class="designOptionSection" open><summary>'+name+'</summary>'+(description?'<p class="designOptionDescription">'+description+'</p>':'')+'<div class="designOptionControls">'+body+'</div></details>';
 const presets=Object.entries(DESIGN_PRESETS).map(([id,p])=>'<button class="designPreset" type="button" data-action="design-preset" data-arg="'+id+'"><span class="designPresetSwatches" style="--preset-main:'+p.main+';--preset-card:'+p.card+';--preset-primary:'+p.action+';--preset-secondary:'+p.secondaryAccent+'"><i></i><i></i><i></i><i></i></span><strong>'+esc(p.name)+'</strong></button>').join('');
 return '<section class="slateSettingsBlock arcanaDesignLab"><span class="launchEyebrow">ADVANCED · ADMIN ONLY</span><h2>Design Workshop</h2><p>Experiment freely. Your saved appearance applies to this device only and does not change anyone else’s theme.</p>'+
 designMiniMarkup()+
 '<div class="designPresetHeader"><h3>Quick Themes</h3><p>Six complete palettes. Pick one, then fine-tune any individual setting.</p></div><div class="designPresetGrid">'+presets+'</div>'+
 group('Colors &amp; accents',
 color('main','Background')+color('card','Panels')+color('action','Primary accent')+color('secondaryAccent','Second accent')+color('text','Text')+color('mutedText','Muted text')+color('borderColor','Border color')+color('navBar','Navigation bar')+color('buttonText','Button text'))+
 group('Background &amp; lighting',
 select('pattern','Background pattern',[['contours','Arcane waves'],['rings','Mystic rings'],['stars','Starlight'],['plain','None']])+
 slider('intensity','Pattern intensity',0,100)+slider('patternScale','Pattern size',60,180)+slider('glow','Glow strength',0,100)+slider('cardShadow','Card shadow',0,100)+slider('edges','Border intensity',0,100)+slider('borderWidth','Border thickness',0,3)+slider('headerOpacity','Header opacity',65,100))+
 group('Cards &amp; buttons',
 slider('roundness','Card corners',3,28)+slider('cardPadding','Card padding',8,22)+slider('buttonRoundness','Button corners',3,30)+slider('buttonFill','Button color strength',35,100)+slider('buttonHeight','Button height',40,58)+slider('accentBlend','Gradient accent balance',0,100)+
 select('buttonStyle','Button appearance',[['gradient','Gradient'],['solid','Solid'],['outline','Outlined']]))+
 group('Typography &amp; spacing',
 select('fontFamily','Font style',[['system','Clean system'],['rounded','Soft rounded'],['serif','Classic serif'],['mono','Monospace']])+
 slider('fontSize','Text size',90,115)+select('density','Layout density',[['comfortable','Comfortable'],['compact','Compact'],['spacious','Spacious']]))+
 '<div class="designWorkshopActions"><button type="button" class="btn secondary" data-action="preview-design">'+icon('search',16)+' View preview</button><button type="button" class="btn secondary" data-action="undo-design">'+icon('back',16)+' Undo last change</button><button type="button" class="btn secondary" data-action="reset-design">'+icon('close',16)+' Reset design</button></div>'+
 '<p class="mutedSmall">No game artwork or verified values are altered. Changes remain local to your signed-in browser, not published for everyone.</p></section>';
};
export function settingsView({admin=false,authEnabled=false,loggedIn=false}={}){
 const p=appPrefs(),selected=selectedAccent();
 const accentCards=ACCENT_PRESETS.map(x=>'<button type="button" class="slateAccentChoice '+(selected===x.id?'selected':'')+'" data-action="accent" data-arg="'+esc(x.id)+'" aria-pressed="'+(selected===x.id)+'"><span class="slateAccentSwatch" style="--swatch:'+x.hex+'"></span><span>'+esc(x.name)+'</span>'+(selected===x.id?'<b aria-hidden="true">✓</b>':'')+'</button>').join('');
 const adminEditor=admin?'<section class="slateSettingsBlock arcanaAdminAppearance"><span class="launchEyebrow">ADMIN ONLY</span><h2>'+icon('settings',20)+' Arcana Theme Studio</h2><p>Preview a color on this device. Publishing a color for everyone requires the protected Design Control portal.</p>'+
  '<div class="slateAccentGrid" role="group" aria-label="Theme previews">'+accentCards+'</div>'+
  '<div class="arcanaCustomAccent"><label for="arcanaCustomAccentPicker">Custom accent</label><input type="color" id="arcanaCustomAccentPicker" value="'+esc(customAccent())+'" aria-label="Pick accent color"><input type="text" id="arcanaCustomAccentHex" value="'+esc(customAccent())+'" maxlength="7" spellcheck="false" placeholder="#A98BFF" aria-label="Custom hex color"><button type="button" data-action="custom-accent">Preview</button></div>'+
  '<button class="slateSiteTheme" type="button" data-action="accent" data-arg="site">Reset to published theme</button>'+
  '<a class="arcanaAdminPublish" href="'+esc(ADMIN_URL)+'" target="_blank" rel="noopener noreferrer">'+icon('settings',18)+' Open protected Design Control '+icon('external',16)+'</a>'+
  '<small class="arcanaThemeWarning">Color previews do not publish changes to the community.</small></section>':
  '<section class="slateSettingsBlock arcanaThemeReadOnly"><span class="launchEyebrow">ADMIN ONLY</span><h2>'+icon('shield',20)+' Design Workshop · Locked</h2><p>Find the theme editor at <strong>Options → Settings → Design Workshop</strong>. Only signed-in Arcana Admins and the Creator can unlock it.</p>'+
 (!authEnabled?'<p class="arcanaLoginStatus">Discord login is not configured on this preview yet. Admin controls cannot unlock until preview authentication is connected.</p>':
 !loggedIn?'<a class="btn secondary" href="/api/account/login">Sign in with Discord</a>':
 '<p class="arcanaLoginStatus">This account does not have Admin or Creator access.</p>')+'</section>';
 return '<div class="launchPage slateSettings arcanaSettings"><span class="launchEyebrow">PREFERENCES</span><h1>Settings</h1><p>Simple display controls. Your game progress and saved builds are unaffected.</p>'+
  '<section class="slateSettingsBlock"><h2>'+icon('settings',20)+' Display</h2><div class="launchSettingList"><label class="launchSetting"><span><strong>Compact menus</strong><small>Reduce spacing throughout menus.</small></span><input type="checkbox" data-app-pref="compact" '+(p.compact?'checked':'')+'></label><label class="launchSetting"><span><strong>Reduce motion</strong><small>Turn off decorative movement.</small></span><input type="checkbox" data-app-pref="reduceMotion" '+(p.reduceMotion?'checked':'')+'></label></div></section>'+
  adminEditor+(admin?designPanel():'')+'</div>';
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
