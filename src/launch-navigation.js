import {readDesign,DEFAULT_DESIGN,DESIGN_PRESETS} from './design-controls.js';
import {WIKI_CATEGORIES} from './wiki-taxonomy.js';
import {designMiniMarkup} from './design-mini-preview.js';
import {themeVaultMarkup} from './theme-studio-vault.js';
import {THEME_PATTERNS} from './theme-patterns.js';
import {HERO_CTA_STYLES} from './hero-cta-styles.js';
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
  link('Material Reference','Materials and their wiki entries.','wiki/library','box',{kind:'material'})
 ]},
 tools:{title:'Tools',detail:'Pet calculators, farming tools, guild planning and damage analysis.',links:[
  link('Pet Compound Calculator','Pet rarity, Compound level and bonus values.','calculators/pet','paw'),
  link('Pet Affix Calculator','Pet Shard costs and affix upgrade planning.','calculators/affixes','calculator'),
  link('ML Farming Comparator','Compare Monster Level farming efficiency.','calculators/ml-farm','sword'),
  link('Guild Skill Planner','Allocate, compare and share guild skill points.','labs/guild-tree','shield'),
  link('Character Sandbox','Compare Attack, pets, Retaliation, ACS and what-if builds.','calculators/damage','calculator')
 ]},
 builds:{title:'Builds & Guides',detail:'Player guides, community builds, sharing and character planning.',links:[
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
 social:{title:'Guild & Raid Finder',detail:'Guild recruitment, raid groups and player community.',links:[
  link('Find a Guild','Guild listings and recruitment.','lfg/guilds','users'),
  link('Find a Raid','Raid listings and groups.','lfg/raids','users'),
  link('Guild Skill Planner','Plan guild skill bonuses.','labs/guild-tree','shield'),
  link('Player Community','Profiles, guides and shared builds.','community','users')
 ]}
});
export const HOME_CARDS=Object.freeze([
 {id:'pathfinder',title:'Pathfinder',detail:'Item upgrade costs, materials, equipment comparison and upgrade maps.',icon:'feature-upgrade'},
 {id:'tools',title:'Tools',detail:'Pet Compound, affix costs, farming, guild skills and damage planning.',icon:'feature-calculator'},
 {id:'builds',title:'Builds & Guides',detail:'Player guides, shared builds, publishing and character planning.',icon:'feature-guides'}
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
  '<section class="launchQuick" aria-label="Explore Arcana"><div class="launchSectionTop"><h2>Explore Arcana</h2><button type="button" data-route="directory" class="launchSeeAll">See All '+icon('arrow',16)+'</button></div>'+
  '<div class="launchQuickGrid">'+HOME_CARDS.map(x=>'<button type="button" class="launchQuickCard" data-action="homemenu" data-arg="'+esc(x.id)+'" aria-label="Open '+esc(x.title)+' menu"><span class="launchQuickEmblem" aria-hidden="true">'+icon(x.icon,90)+'</span><span class="launchQuickIcon">'+icon(x.icon,32)+'</span><span class="launchQuickCopy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></span><span class="launchQuickArrow">'+icon('arrow',17)+'</span></button>').join('')+'</div></section>'+
  '<section class="launchFeatured" aria-label="Useful and Featured"><div class="launchSectionTop"><h2>Useful &amp; Featured</h2></div>'+
  '<p class="launchFeaturedIntro">Player guides, shared builds, articles and site updates.</p>'+
  '<div class="launchFeaturedGrid">'+[
   link('Player Guides','Browse walkthroughs and game tips.','wiki/guides','book'),
   link('Community Builds','Explore setups shared by players.','community','users'),
   link('Feedback & Updates','Help improve Arcana ahead of launch.','beta','info')
  ].map(x=>'<button type="button" class="launchFeatureRow" '+attrs(x)+'><span class="launchFeatureIcon">'+icon(x.icon,20)+'</span><span><strong>'+esc(x.label)+'</strong><small>'+esc(x.detail)+'</small></span>'+icon('arrow',16)+'</button>').join('')+'</div></section>';
}
export function homeSubmenu(id){
 const menu=HOME_MENUS[id]; if(!menu)return '';
 return '<div class="launchMenu" role="group" aria-label="'+esc(menu.title)+' destinations"><div class="launchMenuIntro"><span class="launchEyebrow">EXPLORE ARCANA</span><h2>'+esc(menu.title)+'</h2><p>'+esc(menu.detail)+'</p></div><div class="launchMenuLinks">'+menu.links.map(navrow).join('')+'</div></div>';
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
 ...(profile?.roles?.some(r=>['admin','creator'].includes(r.id||r))?[link('Admin Dashboard','Private traffic statistics and management tools.','admin','shield')]:[])
 ].map(navrow).join('')+'</div></div>';
}
const PREF_KEY='arcana-launch-prefs';
export function appPrefs(){try{const raw=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return {compact:false,reduceMotion:raw.reduceMotion===true}}catch{return {compact:false,reduceMotion:false}}}
export function applyAppPrefs(){const prefs=appPrefs();document.documentElement.dataset.launchCompact=String(prefs.compact);document.documentElement.dataset.launchReduceMotion=String(prefs.reduceMotion)}
export function changeAppPref(key,checked){if(key!=='reduceMotion')return;const p={...appPrefs(),[key]:checked===true};try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch{}applyAppPrefs()}
export const designPanel=({showPreview=true}={})=>{
 const d=readDesign();
 const color=(key,label)=>'<div class="designControl designColorControl"><span>'+label+'</span><input type="color" data-design-field="'+key+'" value="'+esc(d[key])+'" aria-label="'+label+' color picker"><input type="text" data-design-hex="'+key+'" value="'+esc(d[key])+'" inputmode="text" maxlength="7" spellcheck="false" autocorrect="off" autocapitalize="characters" aria-label="'+label+' HEX code" aria-describedby="designHexStatus-'+key+'" placeholder="#A78BFA"><small class="designHexStatus" id="designHexStatus-'+key+'" data-design-status="'+key+'" role="status">HEX code</small></div>';
 const unit=key=>['roundness','buttonRoundness','cardPadding','borderWidth','buttonHeight','heroActionHeight','heroActionBorder'].includes(key)?' px':'%';
 const slider=(key,label,lo,hi)=>'<label class="designControl"><span>'+label+'</span><input type="range" min="'+lo+'" max="'+hi+'" data-design-field="'+key+'" value="'+d[key]+'" aria-label="'+label+'"><strong data-design-value="'+key+'">'+d[key]+unit(key)+'</strong></label>';
 const select=(key,label,opts)=>'<label class="designControl"><span>'+label+'</span><select data-design-field="'+key+'" aria-label="'+label+'">'+opts.map(([id,name])=>'<option value="'+id+'" '+(d[key]===id?'selected':'')+'>'+name+'</option>').join('')+'</select></label>';
 const group=(name,body,description='')=>{const groupId=name.startsWith('Colors')?'colors':name.startsWith('Background')?'textures':name.startsWith('Build')?'feature':name.startsWith('Cards')?'components':'type';return '<details class="designOptionSection" data-theme-group="'+groupId+'" '+(['colors','textures'].includes(groupId)?'open':'')+'><summary>'+name+'</summary>'+(description?'<p class="designOptionDescription">'+description+'</p>':'')+'<div class="designOptionControls">'+body+'</div></details>'};
 const featuredTextures=[...THEME_PATTERNS].sort((a,b)=>Number(['Material','Atmosphere','Relic'].includes(b.category))-Number(['Material','Atmosphere','Relic'].includes(a.category)));
 const presets=Object.entries(DESIGN_PRESETS).map(([id,p])=>{const active=p.main===d.main&&p.action===d.action&&p.pattern===d.pattern;return '<button class="designPreset '+(active?'selected':'')+'" type="button" data-action="design-preset" data-arg="'+id+'" data-preset-search="'+esc(p.name.toLowerCase()+' '+p.pattern)+'" aria-pressed="'+active+'"><span class="designPresetSwatches" style="--preset-main:'+p.main+';--preset-card:'+p.card+';--preset-primary:'+p.action+';--preset-secondary:'+p.secondaryAccent+'"><i></i><i></i><i></i><i></i></span><span class="designPresetCopy"><strong>'+esc(p.name)+'</strong><small>'+esc(p.pattern.replace(/-/g,' '))+' texture</small></span></button>'}).join('');
 return '<section class="slateSettingsBlock arcanaDesignLab"><span class="launchEyebrow">CREATOR WORKSPACE · LIVE DRAFT</span><h2>Theme Studio</h2><p>Edit colors, textures and components while your preview remains visible. Changes stay private until published.</p>'+
 '<nav class="themeStudioJumps" aria-label="Theme editor categories">'+[['colors','Colors'],['textures','Textures'],['feature','Feature'],['components','Cards'],['type','Type'],['vault','Vault']].map(([id,name])=>'<button type="button" data-theme-jump="'+id+'">'+name+'</button>').join('')+'</nav>'+
 (showPreview?designMiniMarkup():'')+
 '<div class="designPresetHeader"><h3>Theme presets</h3><p>18 styles with different color, texture and layout combinations. Preview before publishing.</p></div><label class="designPresetSearch">Find a preset <input type="search" data-design-preset-search placeholder="Search names or textures…" autocomplete="off"></label><div class="designPresetGrid">'+presets+'</div>'+
 group('Colors &amp; accents',
 color('main','Background')+color('card','Panels')+color('action','Primary accent')+color('secondaryAccent','Second accent')+color('text','Text')+color('mutedText','Muted text')+color('borderColor','Border color')+color('navBar','Navigation bar')+color('buttonText','Button text'))+
 group('Background &amp; lighting',
 select('pattern','Background pattern',THEME_PATTERNS.map(p=>[p.id,p.name]))+
 select('patternTarget','Where to show textures',[['all','Backgrounds + cards'],['cards','Cards only'],['background','Page backgrounds only']])+
 '<details class="themePatternLibrary"><summary>Browse all 64 texture finishes</summary><p>Start with the new premium finishes, or browse all 64. Choose subtle material grain, cinematic lighting or fantasy engraving. Every option can be previewed before publishing.</p><div class="themePatternFilters" role="group" aria-label="Pattern categories">'+['Premium','All',...new Set(THEME_PATTERNS.map(p=>p.category))].map(c=>'<button type="button" data-theme-pattern-filter="'+c+'" aria-pressed="'+(c==='Premium')+'">'+c+'</button>').join('')+'</div><div class="themePatternGrid">'+featuredTextures.map(p=>'<button type="button" class="themePatternTile" '+(['Material','Atmosphere','Relic'].includes(p.category)?'':'hidden')+' data-theme-pattern="'+p.id+'" data-pattern-category="'+p.category+'" aria-pressed="'+String(d.pattern===p.id)+'" title="'+p.name+'"><span class="themePatternThumb" data-preview-pattern="'+p.id+'" aria-hidden="true"></span><span>'+p.name+'</span></button>').join('')+'</div></details>'+
 slider('intensity','Pattern intensity',0,100)+slider('patternScale','Pattern size',60,180)+slider('glow','Glow strength',0,100)+slider('cardShadow','Card shadow',0,100)+slider('edges','Border intensity',0,100)+slider('borderWidth','Border thickness',0,3)+slider('headerOpacity','Header opacity',65,100))+
 group('Build Studio feature',
 '<div class="heroCtaEditorIntro"><strong>Make the entrance fit the home screen.</strong><p>The Build Studio button is separate from other controls. Try a minimal style, then adjust its size, position, icons and finish.</p></div>'+
 '<details class="heroCtaLibrary" open><summary>Explore '+HERO_CTA_STYLES.length+' button designs</summary><div class="heroCtaGallery">'+HERO_CTA_STYLES.map(style=>
 '<button type="button" class="heroCtaChoice" data-hero-cta-style="'+style.id+'" aria-pressed="'+String(d.heroActionStyle===style.id)+'" title="'+esc(style.detail)+'"><span class="heroCtaSample" data-hero-sample="'+style.id+'"><i aria-hidden="true">◈</i><b>Build Studio</b><i aria-hidden="true">→</i></span><span><strong>'+esc(style.name)+'</strong><small>'+esc(style.detail)+'</small></span></button>'
 ).join('')+'</div></details>'+
 select('heroActionStyle','Button design',HERO_CTA_STYLES.map(x=>[x.id,x.name]))+
 slider('heroActionWidth','Button width',65,100)+select('heroActionAlign','Horizontal position',[['start','Left'],['center','Center'],['end','Right']])+
 slider('heroActionHeight','Button height',44,70)+slider('heroActionBorder','Border thickness',0,3)+slider('heroActionGlow','Glow strength',0,100)+
 select('heroActionIcon','Icon treatment',[['show','Icon and arrow'],['hide','Text only'],['arrow-only','Arrow only']])+
 select('heroActionSubtitle','Subtitle',[['auto','Depends on design'],['show','Always show'],['hide','Always hide']])+
 select('heroSize','Feature card size',[['compact','Compact'],['balanced','Balanced'],['showcase','Showcase']])+
 '<div class="heroCtaEditorIntro"><strong>Or change the entire feature card.</strong><p>If the large Build Studio section feels out of place, change its surface and decorative artwork independently of the entrance button.</p></div>'+
 select('heroCardStyle','Feature card treatment',[['blended','Blended (current)'],['flat','Flat / seamless'],['frameless','No surrounding frame'],['etched','Etched panel'],['glass','Smoked glass'],['raised','Raised card'],['accent-edge','Accent edge'],['metallic','Brushed alloy'],['minimal','Minimal feature']])+
 select('heroCardEmblem','Decorative seal',[['subtle','Subtle'],['hidden','Hidden'],['prominent','Prominent']]),
 'Only the homepage Build Studio feature is changed. Other navigation, tools and buttons stay untouched.')+
 group('Cards &amp; buttons',
 slider('roundness','Card corners',3,28)+slider('cardPadding','Card padding',8,22)+slider('buttonRoundness','Button corners',3,30)+slider('buttonFill','Button color strength',35,100)+slider('buttonHeight','Button height',40,58)+slider('accentBlend','Gradient accent balance',0,100)+
 select('buttonStyle','Button appearance',[['gradient','Gradient'],['solid','Solid'],['outline','Outlined']]))+
 group('Typography &amp; spacing',
 select('iconMode','Icon treatment',[['two-tone','Two-tone'],['neutral','Neutral'],['accent','Accent'],['muted','Muted']])+
 select('fontFamily','Font style',[['system','Clean system'],['rounded','Soft rounded'],['serif','Classic serif'],['mono','Monospace']])+
 slider('fontSize','Text size',90,115)+select('density','Layout density',[['comfortable','Comfortable'],['compact','Compact'],['spacious','Spacious']]))+
 '<section class="themeVaultSection" aria-label="Design vault"><div id="themeVaultContents">'+themeVaultMarkup()+'</div></section>'+
 '<div class="designWorkshopActions"><button type="button" class="btn secondary" data-action="preview-design">'+icon('search',16)+' View preview</button><button type="button" class="btn secondary" data-action="undo-design">'+icon('back',16)+' Undo last change</button><button type="button" class="btn secondary" data-action="reset-design">'+icon('close',16)+' Reset design</button></div>'+
 '<p class="mutedSmall">No game artwork or verified values are altered. Use Publish to everyone at the top when your preview is ready.</p></section>';
};
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
