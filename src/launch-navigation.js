import {readDesign,DEFAULT_DESIGN,DESIGN_PRESETS} from './design-controls.js';
import {atlasHomeScreen} from './home-atlas.js';
import {WIKI_CATEGORIES} from './wiki-taxonomy.js';
import {designMiniMarkup} from './design-mini-preview.js';
import {themeVaultMarkup} from './theme-studio-vault.js';
import {THEME_PATTERNS} from './theme-patterns.js';
import {PSYCHEDELIC_IDS} from './psychedelic-patterns.js';
import {VISUAL_ART} from './visual-art.js';
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
  link('Damage Calculator · Work in Progress','Damage comparisons and build upgrade analysis in development.','calculators/damage','calculator')
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
export const designPanel=({showPreview=true}={})=>{
 const d=readDesign();
 const color=(key,label)=>'<div class="designControl designColorControl"><span>'+label+'</span><input type="color" data-design-field="'+key+'" value="'+esc(d[key])+'" aria-label="'+label+' color picker"><input type="text" data-design-hex="'+key+'" value="'+esc(d[key])+'" inputmode="text" maxlength="7" spellcheck="false" autocorrect="off" autocapitalize="characters" aria-label="'+label+' HEX code" aria-describedby="designHexStatus-'+key+'" placeholder="#A78BFA"><small class="designHexStatus" id="designHexStatus-'+key+'" data-design-status="'+key+'" role="status">HEX code</small></div>';
 const unit=key=>['roundness','buttonRoundness','cardPadding','borderWidth','buttonHeight','heroActionHeight','heroActionBorder'].includes(key)?' px':'%';
 const slider=(key,label,lo,hi)=>'<label class="designControl"><span>'+label+'</span><input type="range" min="'+lo+'" max="'+hi+'" data-design-field="'+key+'" value="'+d[key]+'" aria-label="'+label+'"><strong data-design-value="'+key+'">'+d[key]+unit(key)+'</strong></label>';
 const select=(key,label,opts)=>'<label class="designControl"><span>'+label+'</span><select data-design-field="'+key+'" aria-label="'+label+'">'+opts.map(([id,name])=>'<option value="'+id+'" '+(d[key]===id?'selected':'')+'>'+name+'</option>').join('')+'</select></label>';
 const group=(name,body,description='')=>{const groupId=name.startsWith('Colors')?'colors':name.startsWith('Background')?'textures':name.startsWith('Build')?'feature':name.startsWith('Cards')?'components':'type';return '<details class="designOptionSection" data-theme-group="'+groupId+'" '+(['colors','textures'].includes(groupId)?'open':'')+'><summary>'+name+'</summary>'+(description?'<p class="designOptionDescription">'+description+'</p>':'')+'<div class="designOptionControls">'+body+'</div></details>'};
 const featuredTextures=[...THEME_PATTERNS].sort((a,b)=>Number(b.category==='Vision')-Number(a.category==='Vision'));
 const allEntries=Object.entries(DESIGN_PRESETS);
 const curated=[
  ...allEntries.filter(([,p])=>!['signature','psychedelic'].includes(p.collection)).slice(0,4),
  ...allEntries.filter(([,p])=>p.collection==='signature').slice(0,4),
  ...allEntries.filter(([,p])=>p.collection==='psychedelic').slice(0,4)
 ];
 const curatedKeys=new Set(curated.map(([id])=>id));
 const presetCards=[...curated,...allEntries.filter(([id])=>!curatedKeys.has(id))].map(([id,p],index)=>{
  const active=p.main===d.main&&p.action===d.action&&p.pattern===d.pattern;
  const premium=['signature','psychedelic'].includes(p.collection);
  const css='--preset-main:'+p.main+';--preset-card:'+p.card+';--preset-primary:'+p.action+';--preset-secondary:'+p.secondaryAccent;
  const picture=premium?'<span class="designPresetArt" data-signature-art="'+p.pattern+'" aria-hidden="true"><span class="designPresetArtCard"><b>ARCANA</b><i>✦</i><small>'+(p.collection==='psychedelic'?'Psychedelic':'Signature')+'</small></span></span>':'<span class="designPresetSwatches"><i></i><i></i><i></i><i></i></span>';
  return '<button class="designPreset designPresetUnified '+(premium?'designPresetSignature ':'')+(active?'selected':'')+'" type="button" data-action="design-preset" data-arg="'+id+'" data-collection="'+(p.collection||'classic')+'" '+(index>=12?'data-preset-extra="true" ':'')+'data-preset-search="'+esc((p.name+' '+p.pattern+' '+(p.tagline||'')).toLowerCase())+'" aria-pressed="'+active+'" style="'+css+'">'+picture+'<span class="designPresetCopy"><strong>'+esc(p.name)+'</strong><small>'+esc(premium?p.tagline:p.pattern.replace(/-/g,' ')+' texture')+'</small></span></button>';
 });
 const allPresets=presetCards.join('');
 const activePsy=PSYCHEDELIC_IDS.includes(d.pattern);
 const visionGrid='<section class="visionArtCollection" aria-label="Arcana visual art collection"><header><span class="launchEyebrow">FIRST EDITION · 12 ARTWORKS</span><h3>Artwork worth looking at</h3><p>Composed vector designs instead of gradients dressed up as textures. Pick one, then change its four colors.</p></header><div class="visionArtGrid">'+VISUAL_ART.map(a=>'<button type="button" class="visionArtChoice" data-theme-pattern="'+a.id+'" aria-pressed="'+String(d.pattern===a.id)+'"><span class="visionArtThumb" data-preview-pattern="'+a.id+'" aria-hidden="true"></span><span class="visionArtDetails"><strong>'+esc(a.name)+'</strong><small>'+esc(a.family)+'</small><em>'+esc(a.note)+'</em></span></button>').join('')+'</div><section class="visionArtPalette" data-vision-active="'+String(d.pattern.startsWith('vision-'))+'"><h4>Recolor this artwork</h4><p>Four pigments, completely independent of your website panels, icons and text.</p><div class="visionArtPaletteGrid">'+color('artBase','Canvas / base')+color('artPrimary','Primary lines / forms')+color('artSecondary','Secondary lines / forms')+color('artGlow','Highlight / light')+'</div></section></section>';
 const psySettings='<section class="psyPalettePicker" data-psy-active="'+activePsy+'" data-psy-mode="'+d.psyPaletteMode+'"><header><strong>Five-color pattern palette</strong><span class="psyPaletteStatus">Editable motif</span></header><p>Change the colors without changing the repeat. Match the website or build your own.</p>'+select('psyPaletteMode','Palette source', [['custom','My five colors'],['theme','Match website colors']])+'<div class="psyCustomColors"><div class="psyColorsGrid">'+color('psyBackground','Pattern background')+color('psyPrimary','Primary fill')+color('psySecondary','Secondary fill')+color('psyAccent','Accent fill')+color('psyOutline','Outline')+'</div>'+slider('psyStroke','Outline weight',0,100)+'</div></section>';
 return '<section class="slateSettingsBlock arcanaDesignLab"><span class="launchEyebrow">CREATOR WORKSPACE · LIVE DRAFT</span><h2>Theme Studio</h2><p>Edit colors, textures and components while your preview remains visible. Changes stay private until published.</p>'+
 '<nav class="themeStudioJumps" aria-label="Jump to designer section">'+[['presets','Presets'],['colors','Colors'],['textures','Textures'],['feature','Homepage'],['components','Buttons'],['type','Text'],['vault','Saved']].map(([id,name])=>'<button type="button" data-theme-jump="'+id+'">'+name+'</button>').join('')+'</nav>'+
 (showPreview?designMiniMarkup():'')+
 '<div class="themeEditorGuidance" role="status" data-theme-change-hint><strong>Start with a preset.</strong><span>Panel, icon box and icon colors are independent. Preview Home to see them together.</span></div>'+
 '<section class="themePresetCollection" data-theme-group="presets" data-show-all="false" data-searching="false" aria-label="All Arcana presets"><div class="designPresetHeader"><h3>Choose a starting look</h3><p>All 42 presets in one library. Pick any look, then adjust its colors, materials, and details. Nothing is published automatically.</p></div><label class="designPresetSearch">Find a look<input type="search" data-design-preset-search placeholder="Search all 42 presets…" autocomplete="off"></label><div class="themeUnifiedPresetActions"><button type="button" data-action="random-signature">✦ Surprise me</button><span>One collection · every design editable</span></div><div class="designPresetGrid designUnifiedPresetGrid" id="themePresetsGrid">'+allPresets+'</div><button type="button" class="themeShowMorePresets" data-theme-preset-expand aria-expanded="false" aria-controls="themePresetsGrid">Show all 42 presets ↓</button><p class="designPresetEmpty" data-design-no-presets hidden>No presets match that search.</p></section>'+ 

 group('Colors &amp; accents',
 color('main','Background')+color('card','Panel backgrounds')+color('iconBox','Icon box backgrounds')+color('iconGlyph','Home icons')+color('action','Primary accent')+color('secondaryAccent','Second accent')+color('text','Text')+color('mutedText','Muted text')+color('borderColor','Border color')+color('navBar','Navigation bar')+color('buttonText','Button text'))+
 group('Background &amp; lighting',
 visionGrid+select('pattern','Background pattern',THEME_PATTERNS.map(p=>[p.id,p.name]))+
 select('patternTarget','Where to show textures',[['all','Backgrounds + cards'],['cards','Cards only'],['background','Page backgrounds only']])+
 '<details class="themePatternLibrary"><summary>Browse all '+THEME_PATTERNS.length+' texture finishes</summary><p>The original experimental finishes remain available for comparison while twelve authored vector designs set the new standard.</p><div class="themePatternFilters" role="group" aria-label="Pattern categories">'+['Vision','Atelier','Premium','All',...new Set(THEME_PATTERNS.map(p=>p.category).filter(c=>!['Vision','Atelier'].includes(c)))].map(c=>'<button type="button" data-theme-pattern-filter="'+c+'" aria-pressed="'+(c==='Vision')+'">'+c+'</button>').join('')+'</div><div class="themePatternGrid">'+featuredTextures.map(p=>'<button type="button" class="themePatternTile" '+(p.category==='Vision'?'':'hidden')+' data-theme-pattern="'+p.id+'" data-pattern-category="'+p.category+'" aria-pressed="'+String(d.pattern===p.id)+'" title="'+p.name+'"><span class="themePatternThumb" data-preview-pattern="'+p.id+'" aria-hidden="true"></span><span>'+p.name+'</span></button>').join('')+'</div></details>'+
 psySettings+slider('intensity','Pattern intensity',0,100)+slider('detail','Fine texture detail',0,100)+slider('aura','Atmospheric aura',0,100)+slider('sheen','Material sheen',0,100)+slider('patternScale','Pattern size',60,180)+slider('glow','Glow strength',0,100)+slider('cardShadow','Card shadow',0,100)+slider('edges','Border intensity',0,100)+slider('borderWidth','Border thickness',0,3)+slider('headerOpacity','Header opacity',65,100))+
 group('Build Studio feature · Advanced',
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
 'Advanced controls, only for the homepage Build Studio feature. Select Home in the preview to see exactly what changes.')+
 group('Cards &amp; buttons · Advanced',
 slider('roundness','Card corners',3,28)+slider('cardPadding','Card padding',8,22)+slider('buttonRoundness','Button corners',3,30)+slider('buttonFill','Button color strength',35,100)+slider('buttonHeight','Button height',40,58)+slider('accentBlend','Gradient accent balance',0,100)+
 select('buttonStyle','Button appearance',[['gradient','Gradient'],['solid','Solid'],['outline','Outlined']]))+
 group('Typography &amp; spacing · Advanced',
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
