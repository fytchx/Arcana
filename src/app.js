import {entities,entityById,itemList,guideList,demoBuilds,demoGuideSections,searchCatalog} from './catalog.js';
import {hydrateJournalPreview} from './journal-home.js';
import {loadDraft,saveDraft,deepCopy,remember,loadRecent} from './session.js';
import {navigate,parseRoute,navigateBack} from './routing.js';
import {esc,icon,boxIcon,chip,button,cardEntity} from './ui.js';
import {ADMIN_URL,initTheme,applyTheme,themeStatus,refreshTheme,setAccent,setSiteSurface,setIconColor,setIconMode} from './theme.js';
import {gameArt,initGameAssets,loadStatus,canonicalArtReference,codexOfficialArt} from './assets.js';
import {TREE_DATA_URL,normalizeTree,getClass,getBranch,passiveAllowed,classAllowed,allocatedTotal,passivePointBudget,classPointBudget,passiveTierSpend,passiveValue} from './tree-engine.js';
import {LOADOUT_LAYOUT,boardSwitch,buildLoadout,passiveBoard,classBoard,activePassiveNode,activeClassSkill,passivePageCount,skillTierGroups} from './core-boards.js';
import {classEmblem,readStudioPortrait,setStudioPortrait,clearStudioPortrait} from './studio-visuals.js';
import {passiveTitle} from './tree-art.js';
import {normalizeBuild,putRune,removeRune,nextRuneId,petSummary,RUNE_SHAPES,RUNE_FAMILIES,RUNE_FAMILY_DETAILS,RUNE_SECONDARIES,PET_AFFIX_DEFS,statName,runeIssue,monsterLevelGrid,activeRuneBoard} from './labs-engine.js';
import {labsTabs,runeGridView,runeOptionsUI,petLoadoutView,petCompoundCalculatorView,buildOverviewV7} from './labs-views.js';
import {normalizePublicFeed,lfgSearchEntries,rankSearch,lfgFilter,guildActivity,lfgDeepLink} from './lfg-core.js';
import {lfgScreen,lfgDetail,lfgCard} from './lfg-views.js';
import {verifiedGameSearchEntries,mergedSearch} from './verified-search.js';
import {normalizeGuild,guildEntries,guildFilter,saveGuildOwner,readGuildOwner} from './guild-core.js';
import {guildDirectory,guildDetail,guildForm,guildCard} from './guild-views.js';
import {guildHubPage,loadGuildHub,wireGuildHub} from './guild-hub-ui.js';
import {WIKI_ARTICLES,wikiArticleById,wikiArticleEntries,setPublishedWikiArticles} from './wiki-data.js';
import {wikiStudioView,mountWikiStudio,wireWikiStudio} from './wiki-studio.js';
import {communityPage,loadCommunityPage,wireCommunityUI} from './community-ui.js';
import {betaView,wireBetaUI,loadBetaStatus} from './beta-center.js';
import {adminTrafficView,loadAdminTraffic,wireAdminTraffic} from './admin-traffic-ui.js';
import {adminConsoleView,loadAdminConsole,wireAdminConsole} from './admin-console.js';
import {recordTrafficNavigation,initTrafficTracking} from './traffic-client.js';
import {siteNotice} from './theme.js';
import {setDesignPreview} from './design-controls.js';
import {shareBuildToken,openBuildToken} from './build-links.js';
import {saveNewAccountBuild} from './account-builds-ui.js';
import {baseItem,equipmentId,asGear,newGear,gearIssues,allowedItem,RARITIES} from './build-studio-data.js';
import {gearPickerMarkup,gearEditorMarkup,gearInspectMarkup} from './build-studio-ui.js';
import {wikiLandingView,wikiLibraryView,wikiGuidesView,wikiArticleView,wikiRecordView,wikiRecordRows,wikiCategoryView} from './wiki-views.js';
import {wikiCategory,wikiCategoryForArticle,LEGACY_WIKI_TOPIC_REDIRECTS} from './wiki-taxonomy.js';
import {verifiedComparisonPanel,verifiedUpgradeReferencePanel} from './verified-item-views.js';
import {readCompoundPlan,saveCompoundPlan,readAffixCostPlan,saveAffixCostPlan,PET_HATCH_BONUSES} from './pet-simple-math.js';
import {simpleCompoundCalculatorView,simpleAffixCostView} from './pet-simple-views.js';
import {normalizePetAffixPlan,readPetAffixPlan,savePetAffixPlan,projectPetAffix} from './verified-pet-affixes.js';
import {petAffixPlannerView} from './verified-pet-affix-views.js';
import {freshGuildTree,readGuildTree,saveGuildTree,guildTreeFromLink,guildTreeWithLevel,guildTreeLinkParams,allocateGuildPoint,removeGuildPoint,maxGuildPoints} from './guild-tree-engine.js';
import {guildTreeView} from './guild-tree-views.js';
import {readGuildBaseline,saveGuildBaseline,clearGuildBaseline} from './guild-tree-compare.js';
import {connectedNext,homeStart,navCards,NAV_DESTINATIONS} from './context-nav.js';
import {resumableWorkspaces} from './workspace-hub.js';
import {readFarmPlan,saveFarmPlan,farmCompareView} from './farm-compare.js';
import {timelineStages,timelineModel,stageStepLabel,readQuickView,saveQuickView} from './pathfinder-timeline.js';
import {pathfinderView,pathfinderStepDetail,pathfinderRangeContent} from './pathfinder-timeline-view.js';
import {quickUpgradePanel,quickUpgradeContent,initialQuickRange} from './quick-tools-view.js';
import {readRange,saveRange,allStages,quoteRange,normalizeItemQuantity} from './pathfinder-range.js';
import {sourceMaterialGroups} from './pathfinder-material-groups.js';
import {saveFarmingList,wireFarmingLists} from './farming-lists-ui.js';
import {homeScreen,homeSubmenu,directoryView,wikiTopicsView,wikiTopicView,wikiAboutView,userCenterView,settingsView,iconGalleryView,designPanel,applyAppPrefs,changeAppPref} from './launch-navigation.js';
import {currentAccount,refreshAccount,accountStatus} from './community-ui.js';
import {searchAsYouType} from './search-as-you-type.js';
import {writeDesign,resetDesign,normalizeDesignHex,applyDesignPreset,undoDesign,readDesign,DESIGN_PRESETS} from './design-controls.js';
import {wireDesignMiniPreview,syncDesignMiniPreview,endDesignMiniSession,focusDesignMiniPreview,showDesignMiniPage,designMiniMarkup} from './design-mini-preview.js';
import {wireThemeVault} from './theme-studio-vault.js';
import {suggestedButtonText} from './theme-studio-audit.js';
import {initGeneralChat} from './general-chat.js';
import {setCustomAccent} from './theme.js';

const $=s=>document.querySelector(s);const node=id=>document.getElementById(id);
const state={treeData:null,treeStatus:'loading',treeClassId:null,treeBranchId:null,passiveTier:0,passivePage:0,classTierIndex:0,characterLevel:1,passiveAlloc:{},classAlloc:{},classAllocById:{},passiveFreeMode:false,layer:null,search:'',lastSearch:'',recent:loadRecent(),draft:loadDraft(),compareLeft:null,compareRight:null,compareTier:1,runeIndex:0,runeFamily:'Fury',runeSecondary:'critical_damage',runeShape:'small',runeSelected:null,runeHistory:[],petLevels:[0,0,0,0],petCalcMode:'seasonal',petAffixPlan:readPetAffixPlan(),compoundQuick:readCompoundPlan(),affixCostQuick:readAffixCostPlan(),slotTarget:null,gearEdit:null,returnTo:null,guildTreePlan:readGuildTree(),guildTreeTab:'vanguard',guildTreeLinkKey:'',guildUndo:[],guildRedo:[],guildBaseline:readGuildBaseline(),farmPlan:readFarmPlan(),pathfinderQuick:readQuickView(),pathfinderRange:readRange()};
const recipeState={data:null,loading:false,error:''};
async function loadPathfinderRecipes(){
 if(recipeState.loading||recipeState.data)return;recipeState.loading=true;
 try{
  const response=await fetch('/api/pathfinder/recipes',{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Recipe service '+response.status);
  const payload=await response.json();
  if(timelineStages(payload,'normal').length!==6||timelineStages(payload,'awakened').length!==30)throw Error('Incomplete recipe set');
  recipeState.data=payload;recipeState.error='';
  if(!state.pathfinderRange.fromStage||!state.pathfinderRange.toStage)state.pathfinderRange=saveRange(initialQuickRange(payload,state.pathfinderRange));
 }catch(error){recipeState.error='Verified upgrade recipes are temporarily unavailable';console.warn('Pathfinder source:',error.message);}
 finally{recipeState.loading=false;if(parseRoute().route==='calculators/pathfinder')render();}
}
const verifiedState={entries:[],loading:false,loaded:false,error:''};
const guildState={guilds:[],loaded:false,loading:false,error:'',updatedAt:0,query:''};
const wikiState={category:'all',query:'',limit:36,returnPosition:null};
const V11_GUILD_ENDPOINT='https://arcana-guild-directory-beta-production.up.railway.app/api/guilds';
const v11AllEntries=()=>[...entities,...wikiArticleEntries(),...searchExtras(),...lfgDynamic(),...guildEntries(guildState.guilds),...verifiedState.entries];
async function loadPublishedWikiArticles(){
 try{
  const res=await fetch('/api/wiki/articles',{cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!res.ok)throw Error('Wiki article index HTTP '+res.status);
  setPublishedWikiArticles(await res.json());
  const route=parseRoute().route;
  if(route==='wiki'||route==='wiki/guides'||route==='wiki/article')render();
 }catch(error){console.warn('Published Wiki unavailable:',error.message)}
}
async function loadVerifiedIndex(){if(verifiedState.loading||verifiedState.loaded)return;verifiedState.loading=true;try{const r=await fetch('/api/search/catalog',{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Search index '+r.status);verifiedState.entries=verifiedGameSearchEntries(await r.json());verifiedState.loaded=true;verifiedState.error='';}catch(e){verifiedState.error='Game index temporarily unavailable';console.warn(e)}finally{verifiedState.loading=false;if(state.layer?.type==='search')refreshLiveSearch();const route=parseRoute().route;if(route==='calculators/pathfinder'&&recipeState.data){const box=node('pathRangeContent');if(box)box.innerHTML=quickUpgradeContent(recipeState.data,state.pathfinderRange,{page:true,catalog:verifiedState.entries});refreshPathfinderStep();}if(route.startsWith('wiki')||route==='reference/detail')render()}}
async function loadGuilds(force=false){if(guildState.loading||(!force&&guildState.updatedAt&&Date.now()-guildState.updatedAt<30000))return;guildState.loading=true;try{const r=await fetch(V11_GUILD_ENDPOINT,{signal:AbortSignal.timeout(9000),cache:'no-store'});if(!r.ok)throw Error('Guild directory '+r.status);const d=await r.json();guildState.guilds=(d.guilds||[]).map(normalizeGuild).filter(Boolean);guildState.loaded=true;guildState.error='';}catch(e){guildState.error='Guild listings temporarily unavailable';console.warn(e)}finally{guildState.updatedAt=Date.now();guildState.loading=false;if(parseRoute().route.startsWith('lfg/guild'))render();if(state.layer?.type==='search')refreshLiveSearch()}}
const lfgState={listings:[],plans:[],loaded:false,loading:false,error:'',updatedAt:0,tab:'active',query:'',tier:'',characterClass:'',mightAmount:'',mightUnit:'M'};
const allLfg=()=>[...lfgState.listings,...lfgState.plans];
const lfgDynamic=()=>lfgSearchEntries(allLfg());
const lfgSearchable=()=>[...searchExtras(),...lfgDynamic()];
const lfgById=id=>lfgDynamic().find(e=>e.id===id);
async function loadPublicLfg(force=false){if(lfgState.loading||(!force&&lfgState.updatedAt&&Date.now()-lfgState.updatedAt<30000))return; lfgState.loading=true; lfgState.error='';try{const r=await fetch('/api/lfg/public',{cache:'no-store',signal:AbortSignal.timeout(9500)});if(!r.ok)throw Error('HTTP '+r.status);const payload=await r.json(),data=normalizePublicFeed(payload);lfgState.error=(payload.issues?.length?('Some '+payload.issues.join(', ')+' are currently unavailable'):'');lfgState.listings=data.listings;lfgState.plans=data.plans;lfgState.loaded=true;lfgState.updatedAt=Date.now();}catch(e){lfgState.error='Live listings temporarily unavailable';console.warn('LFG feed',e.message)}finally{lfgState.updatedAt=Date.now();lfgState.loading=false;const route=parseRoute().route;if(route.startsWith('lfg/raids')||route==='lfg/listing')render();if(state.layer?.type==='search')refreshLiveSearch();}}
const LINKS=[['directory','Explore All','layers'],['wiki','ArcanaWiki','book'],['labs/build','Build Studio','shield'],['calculators/pathfinder','Pathfinder','layers'],['lfg','Guild & Raid Finder','users'],['community','Community','users'],['beta','Beta & Feedback','message-square']];
const BUILD_SLOTS=LOADOUT_LAYOUT.map(x=>[x.key,x.label]);
const item=value=>{
 const id=equipmentId(value);if(!id)return null;
 const local=entityById.get(id);if(local)return local;
 const verified=verifiedState.entries.find(e=>e.id===id&&e.gameKind==='item');
 if(verified){
  const kind=String(verified.slot||'').toLowerCase();
  const slot={main_hand:'weapon',off_hand:'offhand',head:'head',chest:'chest',hands:'hands',feet:'feet',belt:'belt',ring:'ring',amulet:'neck',necklace:'neck',torch:'torch'}[kind]||null;
  return {...verified,kind:'item',slot,subtitle:'Equipment · '+(verified.description||''),verified:true};
 }
 const gear=baseItem(id);
 const slot=gear?{main_hand:'weapon',off_hand:'offhand',amulet:'neck',ring:'ring'}[gear.slot]||gear.slot:null;
 return gear?{id:gear.id,kind:'item',title:gear.name,subtitle:'Verified Season 2 base equipment',slot,verified:true}:null;
};const buildTemplate=id=>demoBuilds[id];
const savedBuild=()=>state.draft&&state.draft.equipment?normalizeBuild(state.draft):null;
const shared={token:'',build:null,error:''};
async function resolveShared(token){
 if(shared.token===token)return;
 shared.token=token;shared.build=null;shared.error='';
 try{shared.build=await openBuildToken(token);}catch(err){shared.error=String(err.message||err);}
 if(parseRoute().query.get('share')===token&&['labs/build','labs/runes','labs/passives'].includes(parseRoute().route))render();
}
const newPersonalBuild=()=>normalizeBuild({id:'local-draft',title:'My Build',className:'Warrior',owner:'You',version:'LOCAL',summary:'Create a build with your own equipment, rune layout, skills and pets.',notes:'Your changes stay on this device until you share your build.',equipment:{weapon:null,offhand:null,head:null,chest:null,hands:null,feet:null,belt:null,ring:null,neck:null},skills:[],runes:[],pets:[],runeBoard:[],monsterLevel:1,passiveAlloc:{},classAllocById:{}});
function ensureDraft(){
 if(!state.draft){
  state.draft=newPersonalBuild();
  state.draft.characterLevel=state.characterLevel;
  state.draft.passiveAlloc=structuredClone(state.passiveAlloc);
  state.draft.passiveFreeMode=state.passiveFreeMode===true;
  state.draft.classAllocById=structuredClone(state.classAllocById);
 }else state.draft=normalizeBuild(state.draft);
 return state.draft;
}
function persistDraft(){if(state.draft){state.draft=normalizeBuild(state.draft);saveDraft(state.draft)}}
const SEARCHABLE_TOOLS=['items','guides','upgrade','compare','build','runes','skills','passives','petlab','compound','affixes','guildtree','guilds','raids','farm','pathfinder'];
const TOOL_SEARCH_ALIASES={
 items:'item codex art equipment weapons',guides:'wiki player guide article',
 upgrade:'item upgrade calculator forge materials',compare:'item comparison equipment stats',
 build:'build studio character loadout planner',runes:'rune forge grid placement',
 skills:'class skill tree planner',passives:'passive skill tree planner',
 petlab:'pet lab pet loadout companion',compound:'pet compound calculator equalisation',
 affixes:'pet affix cost calculator shard',guildtree:'guild skill tree planner guild bonuses',
 guilds:'guild finder recruitment',raids:'lfg raid finder',farm:'monster level xp farm comparator fastest kills per second ml xp',pathfinder:'Arcana Pathfinder fast scroll swipe item slot rarity awakened A1 A30 upgrade material gold costs quick reference'
};
const searchExtras=()=>[
 ...(savedBuild()?[{id:'my-build',kind:'build',title:state.draft.title||'My Build',subtitle:'Saved locally · Build Studio',keywords:'my build custom saved planner equipment runes skills',description:'Your locally saved build.'}]:[]),
 ...SEARCHABLE_TOOLS.map(key=>{
  const destination=NAV_DESTINATIONS[key];
  return {id:'arcana-tool:'+key,kind:'tool',title:destination.label,subtitle:'Arcana · '+destination.detail,keywords:key+' '+(TOOL_SEARCH_ALIASES[key]||'')+' '+destination.label+' '+destination.detail,description:destination.detail,route:destination.route+(destination.params?'?'+new URLSearchParams(destination.params):'')};
 })
];
function track(id){if(!id)return;state.recent=remember(id)}
const isAppearanceAdmin=()=>Boolean(currentAccount()?.roles?.some(role=>['admin','creator'].includes(typeof role==='string'?role:role.id)));
// The unlisted preview-domain Playground edits only local draft state. Server-side publish remains protected.
const isPreviewThemeHost=()=>typeof location!=='undefined'&&['arcana-preview-app-preview.up.railway.app','127.0.0.1','localhost'].includes(location.hostname);
const isLocalThemePlayground=()=>isPreviewThemeHost()&&parseRoute().route==='theme-playground';
const tryOnTheme=()=>{try{return isPreviewThemeHost()&&sessionStorage.getItem('arcana-theme-tryon-preview-v1')==='1'}catch{return false}};
const changeTryOn=enabled=>{try{if(enabled)sessionStorage.setItem('arcana-theme-tryon-preview-v1','1');else sessionStorage.removeItem('arcana-theme-tryon-preview-v1');return true}catch{return false}};
const canEditThemeDraft=()=>isAppearanceAdmin()||isLocalThemePlayground();
const themePlaygroundView=()=>'<div class="launchPage themePlayground"><span class="launchEyebrow">ARCANA PREVIEW · LOCAL ONLY</span><h1>Theme Playground</h1><p>Explore all 42 presets and 88 textures, remix colors and lighting, and save up to twelve private designs. This browser-only preview cannot publish anything to the real site.</p><div class="themeTryOnActions"><button class="btn primary" type="button" data-action="theme-try-on">✦ Try this on Arcana</button><button class="btn secondary" type="button" data-action="theme-try-off">Stop site preview</button></div><div class="themeStudioWorkbench"><div class="themeStudioEditor">'+designPanel({showPreview:false})+'</div><aside class="themeStudioPreview" aria-label="Live theme preview">'+designMiniMarkup()+'</aside></div></div>'; 
function crumbTrail(title){
 const route=parseRoute().route,section=route.split('/')[0];
 const parent={labs:['Build Studio','labs/build'],calculators:['Pathfinder','calculators/pathfinder'],lfg:['Guild & Raid Finder','lfg'],wiki:['ArcanaWiki','wiki']}[section];
 if(!parent||route===parent[1])return '';
 return `<nav class="arcanaCrumbs" aria-label="Breadcrumbs"><button type="button" data-route="home">Home</button><span aria-hidden="true">›</span><button type="button" data-route="${parent[1]}">${parent[0]}</button><span aria-hidden="true">›</span><span aria-current="page">${esc(title)}</span></nav>`;
}
function layout(title,kicker,inner,mark='gem'){
 return `${crumbTrail(title)}<div class="pageHead"><div class="pageHeadline"><span class="pageIcon">${icon(mark,24)}</span><div><span class="eyebrow">${esc(kicker)}</span><h1>${esc(title)}</h1></div></div></div>${inner}`;
}

const homePanels={quick:false,actions:false};
const homeGateway=(route,title,description,detail,symbol)=>
 '<button type="button" class="arcanaHomeGateway" data-route="'+esc(route)+'" aria-label="Open '+esc(title)+'">'+
 '<span class="arcanaHomeGatewayTop"><span class="arcanaHomeGatewayIcon">'+icon(symbol,23)+'</span><span class="arcanaHomeGatewayArrow">'+icon('arrow',17)+'</span></span>'+
 '<span class="arcanaHomeGatewayCopy"><strong>'+esc(title)+'</strong><small>'+esc(description)+'</small></span>'+
 '<span class="arcanaHomeGatewayFoot">'+esc(detail)+'</span></button>';
const homeDisclosure=(key,kicker,title,description,content)=>
 '<details class="arcanaHomeDisclosure" data-home-panel="'+esc(key)+'"'+(homePanels[key]?' open':'')+'>'+
 '<summary class="arcanaHomeDisclosureTrigger"><span class="arcanaHomeDisclosureTitle"><span class="eyebrow">'+esc(kicker)+'</span><strong>'+esc(title)+'</strong><small>'+esc(description)+'</small></span>'+
 '<span class="arcanaHomeDisclosureToggle" aria-hidden="true">'+icon('plus',18)+'</span></summary>'+
 '<div class="arcanaHomeDisclosureBody">'+content+'</div></details>';
const homeSecondary=(route,title,description,symbol)=>
 '<button type="button" class="arcanaHomeSecondary" data-route="'+esc(route)+'"><span class="arcanaHomeSecondaryIcon">'+icon(symbol,19)+'</span>'+
 '<span><strong>'+esc(title)+'</strong><small>'+esc(description)+'</small></span><span class="arcanaHomeSecondaryArrow">'+icon('arrow',17)+'</span></button>';
function home(){return homeScreen();}
function featuredView(){
 const items=[
  ['Arcana Journal','Independent IdleArc news, meta analysis and community perspectives.','journal','book'],
  ['Class Balance: Top 250','See the ranked class data and the full Season 2 balance analysis.','journal-balance','shield'],
  ['Build Studio','Create, save and compare fully connected equipment, runes and skills.','labs/build','flask'],
  ['Player Guides','Community-written guides and IdleArc references.','wiki/guides','book'],
  ['Community Builds','Discover player builds and share your own.','community','users'],
  ['Pathfinder','Swipe through upgrade materials and currency costs.','calculators/pathfinder','layers'],
  ['Featured Wiki','Browse verified articles and game systems.','wiki','book'],
  ['Beta Feedback','Tell us what to improve before launch.','beta','spark']
 ];
 return '<div class="launchPage arcanaFeaturedPage"><span class="launchEyebrow">DISCOVER</span><h1>Featured</h1><p>Builds, guides, tools and updates worth a look. More community features will appear here as they are published.</p><div class="arcanaFeaturedRows">'+items.map(([name,detail,route,glyph])=>'<button class="launchFeatureRow" type="button" data-route="'+esc(route)+'"><span class="launchFeatureIcon">'+icon(glyph,22)+'</span><span><strong>'+esc(name)+'</strong><small>'+esc(detail)+'</small></span>'+icon('arrow',17)+'</button>').join('')+'</div></div>';
}

function recentView(){const recent=state.recent.map(id=>entityById.get(id)||verifiedState.entries.find(e=>e.id===id)||wikiArticleEntries().find(e=>e.id===id)).filter(Boolean).slice(0,15);const saved=resumableWorkspaces({draft:savedBuild(),guild:state.guildTreePlan,compound:state.compoundQuick,affix:state.affixCostQuick,farm:state.farmPlan,recent:state.recent.map(id=>id.startsWith('wiki:article:')?wikiArticleById(id.slice(13)):null).filter(Boolean)});return '<div class="launchPage"><span class="launchEyebrow">USER CENTER</span><h1>Recent Activity</h1><p>Your saved planning work and recently viewed references, available to continue on this device.</p>'+(saved||'<p class="mutedSmall">No saved planning activity yet. Start in Build Studio.</p>')+'<h2>Recently viewed</h2><div class="resultList">'+(recent.length?recent.map(cardEntity).join(''):'<p class="mutedSmall">Pages you open will appear here.</p>')+'</div></div>'}
function siteSignature(){return `<footer class="footer arcanaSignature" aria-label="Arcana creator and community">
<img class="arcanaSigLogo" src="/assets/arcana-logo.webp" alt="" loading="lazy"/>
<div class="arcanaSigText"><strong>Made by <em>Zane</em></strong><small>Guild leader of PDX &amp; OVK · For the IdleArc community</small></div>
<details class="arcanaSigInfo"><summary aria-label="Learn about Arcana and ways to contribute" title="Community information"><span aria-hidden="true">ⓘ</span></summary>
<div class="arcanaSigPanel"><strong>Built for the IdleArc community</strong><p>Keep up with Arcana, talk about the app, report bugs, share suggestions and help shape future updates.</p>
<a class="arcanaDiscord" href="https://discord.gg/PDXCommunity" target="_blank" rel="noopener noreferrer">Join our Discord ↗</a>
<strong>Contribute to ArcanaWiki</strong><p>Share guides or verified game information, check mechanics and accuracy, fix grammar or improve the clarity of existing pages.</p>
<strong>Want to get involved?</strong><p>Development, testing, proofreading, research and other community roles all help make Arcana better. Reach out through Discord.</p></div></details>
</footer>`;}
function tile(x,route,desc,mark){return `<button class="toolTile" data-route="${route}"><span class="tileIcon">${icon(mark,23)}</span><strong>${esc(x)}</strong><p>${esc(desc)}</p><span class="tileMore">Open ${icon('arrow',15)}</span></button>`}
function calculators(){return layout('Calculators','ARCANA',`<p class="lead">Gear upgrades and equipment comparisons are together in Pathfinder. Other calculators live here.</p><div class="cardGrid">${tile('Pathfinder','calculators/pathfinder','Upgrade map, totals and item comparison.','layers')}${tile('Damage Calculator · Work in Progress','calculators/damage','Damage and DPS comparison tool under development.','calculator')}${tile('Pet Compound','calculators/pet','Pet compound and Drop Bonus.','paw')}${tile('Pet Affix Costs','calculators/affixes','Pet Shard costs.','calculator')}${tile('ML Farming','calculators/ml-farm','Compare farming speed.','sword')}</div>`,'calculator')}
function labs(){return layout('Arcana Labs','THEORYCRAFTING',`<p class="lead">Buildcraft lives here. Open a complete guide build, make it your own, and send gear or rune choices to their related tools.</p><div class="cardGrid">${tile('Build Studio','labs/build','One saved build containing gear, pets, runes and skills.','shield')}${tile('Rune Forge','labs/runes','Arrange runes on a grid that grows with Monster Level.','gem')}${tile('Class Skill Tree','labs/skills','Browse verified branches, tiers, and skill prerequisites.','git')}${tile('Passive Skill Tree','labs/passives','Swipe between complete passive tiers with on-node point controls.','layers')}${tile('Pet Compound Calculator','calculators/pet','Estimate your Drop Bonus at a chosen Compound Level.','calculator')}${tile('Guild Skill Tree','labs/guild-tree','Plan guild bonuses, allocate points, and share a build.','shield')}</div><div class="hintCard">${icon('book',20)} <span>Try the <button class="inlineLink" data-route="wiki/guide" data-params="id=warrior-retaliation-demo-guide">connected Warrior guide</button> to open a complete example inside Build Studio.</span></div>`,'flask')}
function wiki(){return layout('ArcanaWiki','INSTANT REFERENCE',`<p class="lead">The reference layer of Arcana. Guides are useful actions, not dead-end walls of text.</p><div class="sectionLabel compact"><div><span class="eyebrow">FEATURED GUIDE</span><h2>From guide to Build Studio</h2></div></div><button class="guideFeature" data-route="wiki/guide" data-params="id=warrior-retaliation-demo-guide"><span>${icon('book',25)}</span><div><strong>Warrior Retaliation · Connected Guide</strong><p>Contains a complete demonstration build you can inspect and edit.</p></div>${icon('arrow',19)}</button><div class="sectionLabel"><div><span class="eyebrow">BROWSE</span><h2>Knowledge & items</h2></div></div><div class="cardGrid">${tile('Item Codex','wiki/items','Search equipped gear and jump into comparison or upgrade planning.','box')}${tile('Mechanics','wiki/mechanics','Verified mechanics and links to relevant calculators.','info')}${tile('Guides','wiki/guides','Example guides with linked builds and tools.','book')}</div>`,'book')}
function wikiItems(){return layout('Item Codex','ARCANAWIKI',`<p class="lead">Items share IDs with comparison, Build Studio and the upgrade calculator.</p><div class="filterLine"><input id="itemFilter" placeholder="Filter items…" autocomplete="off" aria-label="Filter items"/><span>${icon('search',19)}</span></div><div class="resultList" id="itemResults">${itemList.map(cardEntity).join('')}</div><p class="notice">Names and categories shown here are reference samples, not a complete verified game database.</p>`,'box')}
function wikiMechanics(){return layout('Mechanics','ARCANAWIKI',`<div class="resultList">${entities.filter(e=>e.kind==='mechanic').map(cardEntity).join('')}</div>`,'book')}
function wikiGuides(){return layout('Guides','ARCANAWIKI',`<div class="resultList">${guideList.map(cardEntity).join('')}</div>`,'book')}
function fullGuide(id){const g=entityById.get(id);if(!g||g.kind!=='guide')return notFound();track(id);
 const isBuild=!!g.buildId;const tmpl=isBuild?buildTemplate(g.buildId):null;
 const inner=isBuild?`<section class="articleHeader"><span class="eyebrow">INTERACTIVE PLAYER GUIDE · DEMONSTRATION</span><h2>${esc(g.title)}</h2><p>${esc(g.description)}</p>${chip('Example only · not a verified build')}</section>${demoGuideSections.map(s=>`<section class="articleSection"><h3>${esc(s.heading)}</h3><p>${esc(s.body)}</p></section>`).join('')}
 <section class="embeddedBuild"><div class="embeddedTop"><span class="glyph">${icon('shield',23)}</span><div><span class="eyebrow">EMBEDDED BUILD</span><h3>${esc(tmpl.title)}</h3><p>${esc(tmpl.className)} · ${Object.values(tmpl.equipment).filter(Boolean).length} equipped slots · ${tmpl.runes.length} runes · ${tmpl.pets.length} pets</p></div></div><div class="buildMini">${Object.entries(tmpl.equipment).filter(([k,v])=>v).slice(0,5).map(([k,v])=>`<div><span>${esc(k)}</span>${gameArt(item(v),32)}<strong>${esc(item(v)?.title||v)}</strong></div>`).join('')}</div><button class="btn primary full" data-route="labs/build" data-params="build=${esc(tmpl.id)}">${icon('flask',19)} Inspect full build in Build Studio ${icon('arrow',17)}</button><small>Gear, skills, runes, pets, and notes transfer together.</small></section>`:
 `<section class="articleHeader"><span class="eyebrow">SEASON 2 PROGRESSION</span><h2>${esc(g.title)}</h2><p>${esc(g.description)}</p></section><div class="articleSection"><h3>Compare Monster Level XP per second</h3><p>From Murky Depths onward, the weakest monster in a biome awards 10% less Monster Level XP and the strongest 10% more than the normal value. Test kill times as well as rewards, rather than assuming every monster awards identical XP. Character EXP Gain affects character progression, not Monster Level XP.</p></div><div class="hintCard">${icon('book',20)} <button class="inlineLink" data-route="wiki/article" data-params="id=monster-level">Read the Monster Level farming guide</button></div>`;
 return layout(g.title,'ARCANAWIKI · GUIDE',inner,'book')}
function wikiItem(id){const e=item(id);if(!e)return notFound();track(e.id);return layout(e.title,'ARCANAWIKI · EQUIPMENT',`<div class="detailCard"><span class="detailMark gameDetailMark">${gameArt(e,90)}</span><div><span class="eyebrow">${esc(e.subtitle)}</span><h2>${esc(e.title)}</h2><p>${esc(e.description)}</p>${chip('Numerical data not imported')}</div></div><div class="actionsGroup">${button('Compare this item','compare',id,'secondary','compare')}${button('See upgrade costs','upgrade',id,'primary','calculator')}${button('Add to Build Studio','equip',id,'secondary','flask')}</div><p class="notice">These actions preserve this exact item selection using its stable Arcana catalog ID.</p>`,'box')}
function wikiMechanic(id){const m=entityById.get(id);if(!m)return notFound();track(id);return layout(m.title,'ARCANAWIKI · MECHANIC',`<div class="detailCard"><span class="detailMark">${icon('info',30)}</span><div><h2>${esc(m.title)}</h2><p>${esc(m.description)}</p></div></div><div class="actionsGroup">${m.id==='pet-equalisation'?button('Open Compound Calculator','route','calculators/pet','primary','calculator'):button('Open related guide','route','wiki/guides','primary','book')}</div>`,'book')}
function demoActive(){const route=parseRoute();const token=route.query.get('share');return normalizeBuild(token?deepCopy(shared.build||newPersonalBuild()):route.query.get('build')?deepCopy(buildTemplate(route.query.get('build'))||newPersonalBuild()):deepCopy(savedBuild()||newPersonalBuild()))}
function buildStudio(){const route=parseRoute(),share=route.query.get('share');
 if(share&&shared.token!==share)return layout('Shared Build','ARCANA LABS','<p class="notice">Opening shared build…</p>');
 if(share&&!shared.build)return layout('Shared Build','ARCANA LABS','<p class="notice">'+esc(shared.error||'Shared build unavailable.')+'</p><button class="btn secondary" data-route="labs/build">My Build Studio</button>');
 const inspecting=!!route.query.get('build')||!!share,b=demoActive();if(!b)return notFound();if(!inspecting)state.draft=b;
 const slots=buildLoadout(b.equipment,item,inspecting);
 const portrait=!inspecting?readStudioPortrait():null;
 const previewPortrait=portrait?'<img class="studioPortraitImg" src="'+esc(portrait)+'" alt="Custom build profile portrait">':classEmblem(b.className);
 const name=esc(b.title||'My Build'),desc=esc(b.summary||''),cls=esc(b.className||'Warrior');
 const clsOptions=['Warrior','Archer','Mage','Rogue','Druid'].map(c=>'<option value="'+c+'" '+(b.className===c?'selected':'')+'>'+c+'</option>').join('');
 const currentClass=inspecting?'<span class="studioClassReadonly">'+cls+'</span>':
  '<label class="studioClassControl"><span class="srOnly">Character class</span><select data-build-field="className" aria-label="Character class">'+clsOptions+'</select></label>';
 const profileActions=inspecting?
  '<button class="btn primary" data-action="clonebuild" data-arg="'+esc(b.id)+'">'+icon('edit',16)+' Use as my build</button>':
  '<button class="btn primary" data-action="savebuild">'+icon('check',16)+' Save draft</button>'+
  '<button class="btn secondary" data-action="sharebuild">'+icon('link',16)+' Share</button>'+
  '<button class="btn secondary" data-action="savecloud">'+icon('check',16)+' Save to Account</button>';
 const profile= '<section class="studioProfile" aria-label="Build profile">'+
  '<div class="studioProfileMain"><div class="studioProfileVisual">'+
  '<span class="studioPortraitIcon">'+previewPortrait+'</span>'+
  (!inspecting?'<button type="button" class="studioPortraitUpload" data-action="chooseportrait" aria-label="Upload a custom build picture">'+icon('edit',13)+' Change picture</button><input id="studioPortraitUpload" class="studioHiddenFile" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload build profile picture">'+
   (portrait?'<button type="button" class="studioPortraitRemove" data-action="removeportrait">Use class icon</button>':''):'')+
  '</div><div class="studioProfileText">'+
  '<span class="studioProfileKicker">BUILD STUDIO <i>·</i> '+(inspecting?'BUILD PREVIEW':'LOCAL BUILD PROFILE')+'</span>'+
  (inspecting?'<h1>'+name+'</h1>':'<label class="studioTitleLabel"><span class="srOnly">Build name</span><input class="studioTitleInput" data-build-field="title" maxlength="100" aria-label="Build name" placeholder="My Build" value="'+name+'"></label>')+
  currentClass+
  (inspecting?'<p class="studioProfileDescription">'+desc+'</p>':'<label class="studioDescLabel"><span class="srOnly">Build description</span><textarea data-build-field="summary" rows="2" maxlength="350" aria-label="Build description" placeholder="Describe your build...">'+desc+'</textarea></label>')+
  '</div></div><div class="studioProfileActions">'+profileActions+
  '<details class="studioMoreMenu"><summary aria-label="More build actions">'+icon('menu',16)+' More</summary><div>'+
  (!inspecting?'<button type="button" data-action="resetbuild">'+icon('close',16)+' Start fresh</button>':'')+
  '<button type="button" data-route="beta">'+icon('info',16)+' Report a problem</button>'+
  '</div></details></div></section>';
 const nav='<nav class="arcanaCrumbs" aria-label="Build Studio location"><button type="button" data-route="home">Home</button><span aria-hidden="true">›</span><span aria-current="page">Build Studio</span></nav>';
 return '<div class="studioPage">'+nav+profile+labsTabs('studio')+
 '<section class="studioPrimaryEquipment" aria-label="Equipment editor"><header class="studioEquipmentHeading"><h2>'+icon('shield',19)+' Equipment</h2><span>'+Object.values(b.equipment).filter(Boolean).length+' / '+LOADOUT_LAYOUT.length+' equipped</span></header>'+
 slots+'<p class="studioEquipmentHint">Select a slot to change equipment, rarity, awakening, or Drop Bonus.</p></section>'+ '<section class="pfPanel"><h2>Arcana Pathfinder</h2><p>Need to check an upgrade? Browse the cost of any rarity or awakening level without setting up your character or entering materials.</p><button class="btn primary" data-route="calculators/pathfinder">Browse upgrade costs '+icon('arrow',16)+'</button></section>'+
 '<details class="studioProgressDetails"><summary>'+icon('layers',16)+' Character & Rune Progression <span>ML '+(b.monsterLevel||1)+'</span></summary>'+
 '<div class="studioML"><div><span class="eyebrow">RUNE GRID</span><strong>Monster Level '+(b.monsterLevel||1)+'</strong><small> · '+monsterLevelGrid(b.monsterLevel||1).cols+'×'+monsterLevelGrid(b.monsterLevel||1).rows+' cells</small></div><div class="studioMLActions"><label class="studioMLInput">ML<input aria-label="Build Monster Level" data-monster-level type="number" min="1" max="100000" inputmode="numeric" value="'+(b.monsterLevel||1)+'" '+(inspecting?'disabled':'')+'></label><button class="btn secondary" data-route="labs/runes">Runes '+icon('arrow',14)+'</button></div></div></details>'+
 '<div class="studioSecondaryGrid"><section class="sectionCard"><div class="sectionCardTop"><h3>'+icon('git',19)+' Skills & Runes</h3></div>'+
 '<div class="pillSet">'+(b.skills.map(v=>chip(v,'wide')).join('')||chip('No class skills chosen'))+'</div>'+
 '<div class="actionsGroup"><button class="btn secondary" data-route="labs/skills">Class Skills '+icon('arrow',14)+'</button><button class="btn secondary" data-route="labs/passives">Passive Tree '+icon('arrow',14)+'</button><button class="btn secondary" data-route="labs/runes">Rune Forge '+icon('arrow',14)+'</button></div></section>'+
 '<section class="sectionCard"><div class="sectionCardTop"><h3>'+icon('paw',19)+' Pet Bonuses</h3></div>'+petLoadoutView(b,inspecting)+'</section></div>'+
 '<details class="studioOverviewFold"><summary>Full Build Overview '+icon('arrow',15)+'</summary>'+buildOverviewV7(b)+'</details>'+
 '<p class="studioBuildNotice"><strong>Game data:</strong> '+esc(b.notes||'Values remain under verification.')+'</p>'+
 '</div>';}

function pathfinderHub(legacyView='range'){
 const view=parseRoute().query.get('view')||legacyView;
 const tabs=[['range','Upgrade Costs','calculator'],['timeline','Upgrade Map','layers'],['upgrade','Rarity Reference','calculator'],['compare','Compare Items','compare']];
 const selected=tabs.some(t=>t[0]===view)?view:'range';
 const nav='<nav class="arcanaCrumbs" aria-label="Pathfinder location"><button type="button" data-route="home">Home</button><span aria-hidden="true">›</span><span aria-current="page">Pathfinder</span></nav>';
 const header='<header class="pathfinderHubHead"><span class="pathfinderHubIcon">'+icon('feature-upgrade',36)+'</span><div><span class="eyebrow">GEAR PROGRESSION</span><h1>Pathfinder</h1><p>Every gear upgrade, in one place.</p></div></header>';
 const chooser='<nav class="pathfinderHubTabs" aria-label="Pathfinder tools">'+tabs.map(([id,title,glyph])=>'<button type="button" class="'+(id===selected?'active':'')+'" data-route="calculators/pathfinder" data-params="view='+id+'" aria-current="'+(id===selected?'page':'false')+'">'+icon(glyph,19)+'<span>'+title+'</span></button>').join('')+'</nav>';
 const wait='<div class="pathWaiting" role="status"><p>'+esc(recipeState.error||'Loading verified upgrade recipes…')+'</p><button type="button" data-action="path-refresh" class="btn secondary">Retry</button></div>';
 const inner=selected==='range'?quickUpgradePanel(recipeState.data,state.pathfinderRange,{page:true,error:recipeState.error,catalog:verifiedState.entries}):selected==='upgrade'?calcUpgrade(true):selected==='compare'?calcCompare(true):pathfinderView(state.pathfinderQuick,recipeState.data,recipeState.error,state.pathfinderRange,{includeRange:false,catalog:verifiedState.entries});
 return '<div class="studioPage pathfinderHub">'+nav+header+chooser+'<div class="pathfinderHubContent">'+inner+'</div></div>';
}
function calcPathfinder(){return pathfinderHub()}
function calcUpgrade(embedded=false){const id=parseRoute().query.get('item'),e=item(id);if(e)track(e.id);
 const inner=`<div class="calcWorkspace"><span class="eyebrow">SELECTED EQUIPMENT</span><button class="selection" data-action="chooseupgrade"><span class="tinyIcon ${e?'tinyGameArt':''}">${e?gameArt(e,40):icon('shield',22)}</span><span><strong>${esc(e?.title||'Select an item')}</strong><small>${esc(e?.subtitle||'Use universal search or the item picker')}</small></span>${icon('arrow',16)}</button>${e?`<div class="actionsGroup">${button('View item in Wiki','wikiitem',e.id,'secondary','book')}${button('Compare','compare',e.id,'secondary','compare')}</div>`:''}<div class="calcWarning">${icon('info',20)} <p>Partial cost reference: this snapshot provides base tier changes only, not level-by-level or Awakened totals. No full expected cost is claimed.</p></div></div>${verifiedUpgradeReferencePanel(e?.title)}`;return embedded?'<section class="pathfinderHubSubTool"><h2>Upgrade cost reference</h2>'+inner+'</section>':layout('Upgrade Cost Calculator','ARCANA CALCULATORS',inner,'calculator')}
function calcCompare(embedded=false){const qp=parseRoute().query;const left=item(qp.get('left')||state.compareLeft),right=item(qp.get('right')||state.compareRight);state.compareLeft=left?.id||null;state.compareRight=right?.id||null;
 const inner=`<div class="compareGrid">${[['left',left],['right',right]].map(([side,e])=>`<button class="compareSlot" data-action="pickcompare" data-arg="${side}"><span class="detailMark compareArt">${e?gameArt(e,83):icon('plus',26)}</span><span class="eyebrow">${side==='left'?'ITEM A':'ITEM B'}</span><strong>${esc(e?.title||'Select item')}</strong><small>${esc(e?.subtitle||'Tap to choose equipment')}</small></button>`).join('')}</div>
 ${verifiedComparisonPanel(left?.title,right?.title,state.compareTier)}
 <div class="actionsGroup">${left?button('Open Item A Wiki','wikiitem',left.id,'secondary','book'):''}${right?button('Open Item B Wiki','wikiitem',right.id,'secondary','book'):''}</div>`;return embedded?'<section class="pathfinderHubSubTool"><h2>Compare equipment</h2>'+inner+'</section>':layout('Compare Items','ARCANA CALCULATORS',inner,'compare')}

function calcDamage(){return '<div class="studioPage"><nav class="arcanaCrumbs" aria-label="Page navigation"><button type="button" data-route="home">Home</button><span>›</span><button type="button" data-action="homemenu" data-arg="tools">Tools</button></nav><section class="sectionCard" style="margin-top:14px"><span class="eyebrow">WORK IN PROGRESS</span><h1>Damage Calculator</h1><p>Damage and DPS comparisons for equipment stats, pet upgrades, inscriptions and class skills.</p><p>Calculation mechanics are being integrated and checked against IdleArc combat data.</p><div class="actionsGroup"><button class="btn secondary" type="button" data-action="homemenu" data-arg="tools">Other tools</button><button class="btn secondary" type="button" data-route="labs/build">Build Studio</button></div></section></div>';}
function calcPet(){return layout('Pet Compound Calculator','ARCANA CALCULATORS',simpleCompoundCalculatorView(state.compoundQuick),'calculator')}
// Legacy /labs/pets URLs open Build Studio; pet loadout is no longer a separate feature.
function petLab(){return buildStudio()}
function calcAffixes(){return layout('Pet Affix Cost','ARCANA CALCULATORS',simpleAffixCostView(state.affixCostQuick),'paw')}
function calcFarm(){return layout('ML Farming Comparator','ARCANA CALCULATORS',farmCompareView(state.farmPlan),'sword')}
function runeForge(){const templateId=parseRoute().query.get('build'),share=parseRoute().query.get('share');
 if(share&&shared.token!==share)return layout('Rune Forge','BUILD STUDIO','<p class="notice">Opening shared runes…</p>');
 if(share&&!shared.build)return layout('Rune Forge','BUILD STUDIO','<p class="notice">'+esc(shared.error||'Shared build unavailable.')+'</p>');
 const preview=share?shared.build:templateId?buildTemplate(templateId):null;const b=preview?normalizeBuild(preview):ensureDraft();const isReadonly=!!preview;
 return layout('Rune Forge','BUILD STUDIO',`${labsTabs('runes')}<section class="runeIntro"><div><span class="eyebrow">BUILD STUDIO / RUNES</span><h2>Rune Forge</h2><p>${isReadonly?'Guide build, read-only preview':'Every placement saves to your current draft immediately. Grid grows with Monster Level.'}</p></div><span class="runeProgress">${activeRuneBoard(b.runeBoard||[],b.monsterLevel||1).active.reduce((n,r)=>n+r.w*r.h,0)} / ${monsterLevelGrid(b.monsterLevel||1).cols*monsterLevelGrid(b.monsterLevel||1).rows} cells</span></section><div class="runeStudioGrid">${runeGridView(b,state.runeSelected,isReadonly)}${runeOptionsUI({family:state.runeFamily,shape:state.runeShape,secondary:state.runeSecondary,selected:state.runeSelected},b,isReadonly)}</div>${!b.runeBoard.length&&b.runes.length?`<p class="notice">Reference families: ${esc(b.runes.join(', '))}. This build has no verified rune placement coordinates yet, so the board begins empty.</p>`:''}`,'gem')}
function mutateRunes(callback){const b=ensureDraft();const old=structuredClone(b.runeBoard);const out=callback(b);if(out===false)return;state.runeHistory.push(old);if(state.runeHistory.length>20)state.runeHistory.shift();b.runes=[...new Set(b.runeBoard.map(r=>r.family))];persistDraft();render();}

const ASSASSIN_MOTIFS=[
  ['Targeted dagger','assassin-01','Tier 1 · left'],
  ['Crossing blades','assassin-02','Tier 1 · right'],
  ['Shadow ambush','assassin-03','Tier 2 · left'],
  ['Death mask','assassin-04','Tier 2 · right'],
  ['Silent lunge','assassin-05','Tier 3 · left'],
  ['Mirror assault','assassin-06','Tier 3 · right']
];
function skillArt(id){return `<img src="/assets/skills/${id}-precision.svg" alt="" class="arcanaSkillImage" loading="lazy">`}
function skills(){return '<div class="studioPage studioSubPage">'+crumbTrail('Class Skills')+labsTabs('skills')+classBoard(state,state.treeData)+'</div>'}
function visiblePassiveState(){
 const route=parseRoute(),token=route.query.get('share');
 if(!token)return {...state,passiveReadOnly:false};
 if(shared.token!==token||!shared.build)return null;
 const source=shared.build,tierValue=Number(route.query.get('tier'));
 const tier=Number.isInteger(tierValue)&&tierValue>=0&&tierValue<20?tierValue:state.passiveTier;
 return {...state,passiveTier:tier,passiveReadOnly:true,passiveAlloc:source.passiveAlloc||{},passiveFreeMode:source.passiveFreeMode===true,characterLevel:Math.max(1,Math.min(1000,Number(source.characterLevel)||1))};
}
function passives(){
 const token=parseRoute().query.get('share');
 if(token&&shared.token!==token)return layout('Shared Passive Tree','BUILD STUDIO','<p class="notice">Opening shared passive tree…</p>','layers');
 if(token&&!shared.build)return layout('Shared Passive Tree','BUILD STUDIO',`<p class="notice">${esc(shared.error||'Shared passive tree unavailable.')}</p><button class="btn secondary" data-route="labs/passives">Open my passive planner</button>`,'layers');
 const view=visiblePassiveState();
 return '<div class="studioPage studioSubPage">'+crumbTrail('Passive Skill Tree')+labsTabs('passives')+passiveBoard(view,state.treeData)+'</div>';
}
function storeTreePlan(){const plan={characterLevel:state.characterLevel,treeClassId:state.treeClassId,treeBranchId:state.treeBranchId,passiveAlloc:state.passiveAlloc,classAlloc:state.classAlloc,classAllocById:state.classAllocById,passiveFreeMode:state.passiveFreeMode};try{localStorage.setItem('arcana-v4-tree-plan',JSON.stringify(plan))}catch{}if(state.draft){Object.assign(state.draft,{characterLevel:state.characterLevel,passiveAlloc:structuredClone(state.passiveAlloc),classAllocById:structuredClone(state.classAllocById),passiveFreeMode:state.passiveFreeMode});persistDraft()}}
function restoreTreePlan(){try{const p=JSON.parse(localStorage.getItem('arcana-v4-tree-plan')||'{}');state.characterLevel=Math.max(1,Math.floor(Number(p.characterLevel)||1));state.treeClassId=p.treeClassId||null;state.treeBranchId=p.treeBranchId||null;state.passiveAlloc=p.passiveAlloc&&typeof p.passiveAlloc==='object'?p.passiveAlloc:{};state.passiveFreeMode=typeof p.passiveFreeMode==='boolean'?p.passiveFreeMode:state.draft?.passiveFreeMode===true;state.classAlloc=p.classAlloc&&typeof p.classAlloc==='object'?p.classAlloc:{};state.classAllocById=p.classAllocById&&typeof p.classAllocById==='object'?p.classAllocById:{}}catch{}}
async function loadTrees(){
 // The passive and class simulators share immutable verified October 9, 2026 configuration.
 // They must not depend on the older /game-assets/skill-tree export returning or being correctly formatted.
 state.treeStatus='ready';
 state.treeData=normalizeTree({});
 if(!state.treeClassId||!state.treeData.classes.some(c=>c.id===state.treeClassId)){
  state.treeClassId=state.treeData.classes.find(c=>c.name===state.draft?.className)?.id||state.treeData.classes[0]?.id||null;
 }
 state.classAlloc=state.classAllocById[state.treeClassId]||state.classAlloc||{};
 if(!state.classAllocById[state.treeClassId])state.classAllocById[state.treeClassId]={...state.classAlloc};
 if(parseRoute().route.startsWith('labs/skill')||parseRoute().route.startsWith('labs/passive'))render();
}
function adjustPassive(key,delta){if(parseRoute().route==='labs/passives'&&parseRoute().query.has('share')){toast('Shared trees are read-only');return;}const n=activePassiveNode(state.treeData,key),res=passiveAllowed(state.treeData,state.passiveAlloc,n,delta,state.characterLevel,state.passiveFreeMode);if(!res.ok){toast(res.reason);return}state.passiveAlloc=res.allocation;storeTreePlan();rerenderTreeKeepingFocus('passive',key,delta);if(state.layer?.type==='passive-inspector')inspectPassive(key);}
function adjustClass(id,delta){const {cls,skill}=activeClassSkill(state.treeData,state.treeClassId,id);const res=classAllowed(cls,state.classAlloc,skill,delta,state.characterLevel);if(!res.ok){toast(res.reason);return}state.classAlloc=res.allocation;state.classAllocById[state.treeClassId||'default']=state.classAlloc;storeTreePlan();rerenderTreeKeepingFocus('class',id,delta);if(state.layer?.type==='class-inspector')inspectClass(id);}
function inspectPassive(key){
 const node=activePassiveNode(state.treeData,key),current=visiblePassiveState();if(!node||!current)return;
 const rank=Number(current.passiveAlloc[key]||0),readOnly=current.passiveReadOnly===true;
 const plus=passiveAllowed(state.treeData,current.passiveAlloc,node,1,current.characterLevel,current.passiveFreeMode),minus=passiveAllowed(state.treeData,current.passiveAlloc,node,-1,current.characterLevel,current.passiveFreeMode);
 showLayer('PASSIVE NODE',`<section class="skillInspector"><span class="eyebrow">ROW ${node.row+1} · ${node.milestone?'MILESTONE':'PASSIVE'} ${readOnly?'· SHARED PREVIEW':''}</span><h2>${esc(passiveTitle(node.name))}</h2><p>${esc(node.description||'Verified in-game passive skill.')}</p><div class="passiveInspectorEffect"><strong>${esc(passiveValue(node,1))} per rank</strong><small>${rank?esc(passiveValue(node,rank))+' at your rank':'No points allocated'}</small></div><div class="rank"><button data-action="passiveadjust" data-arg="${esc(key)}|-1" ${readOnly||!minus.ok?'disabled':''} aria-label="Refund point">−</button><strong>${rank} / ${node.maxRank||'?'}</strong><button data-action="passiveadjust" data-arg="${esc(key)}|1" ${readOnly||!plus.ok?'disabled':''} aria-label="Allocate point">+</button></div><p class="reason">${esc(readOnly?'Shared preview · view only':!plus.ok?plus.reason:current.passiveFreeMode?'Free Allocation · progression rules are bypassed':`${current.characterLevel} character level · passive points remaining: ${Math.max(0,passivePointBudget(current.characterLevel)-allocatedTotal(current.passiveAlloc))}`)}</p></section>`,'passive-inspector');
}
function inspectClass(id){const {cls,skill}=activeClassSkill(state.treeData,state.treeClassId,id);if(!skill)return;const rank=+(state.classAlloc[id]||0);const plus=classAllowed(cls,state.classAlloc,skill,1,state.characterLevel),minus=classAllowed(cls,state.classAlloc,skill,-1,state.characterLevel);showLayer('CLASS SKILL',`<section class="skillInspector"><div class="classSkillInspectorArt">${codexOfficialArt({id:'game:class-skill:'+skill.id,gameKind:'class-skill',title:skill.name,className:cls.name},76)}</div><span class="eyebrow">${esc(cls.name.toUpperCase())} · SKILL #${esc(id)}</span><h2>${esc(skill.name)}</h2><p>${esc(skill.description||skill.effect||'Details available from the game configuration.')}</p>${skill.prereqs.length?`<p>Requires: ${esc(skill.prereqs.join(', '))}</p>`:''}<div class="rank"><button data-action="classadjust" data-arg="${esc(id)}|-1" ${minus.ok?'':'disabled'} aria-label="Refund skill point">−</button><strong>${rank} / ${skill.maxRank||'?'}</strong><button data-action="classadjust" data-arg="${esc(id)}|1" ${plus.ok?'':'disabled'} aria-label="Allocate skill point">+</button></div><p class="reason">${esc(!plus.ok?plus.reason:`${Math.max(0,classPointBudget(state.characterLevel)-allocatedTotal(state.classAlloc))} class points available`)}</p></section>`,'class-inspector')}
function rerenderTreeKeepingFocus(kind,key,delta){
 const scrolled=window.scrollY;
 const oldRail=document.querySelector(kind==='passive'?'.coreTreePanel .treeRail':'.classTierRail');
 const railScroll=oldRail?.scrollLeft||0;
 render();
 const newRail=document.querySelector(kind==='passive'?'.coreTreePanel .treeRail':'.classTierRail');
 if(newRail)newRail.scrollLeft=railScroll;
 window.scrollTo({top:scrolled,left:0,behavior:'instant'});
 const selector=`[data-action="${kind}adjust"][data-arg="${CSS.escape(key+'|'+delta)}"]`;
 const target=document.querySelector(selector);
 if(target&&!target.disabled)target.focus({preventScroll:true});
}
function previewTreeLevel(value){
 const level=Math.floor(Number(value));if(!Number.isFinite(level)||level<1||level>1000)return;
 const number=node('treeLevel'),slider=node('treeLevelRange');
 if(number&&document.activeElement!==number)number.value=String(level);
 if(slider){slider.value=String(level);slider.style.setProperty('--level-progress',((level-1)/999*100)+'%')}
 const kind=parseRoute().route==='labs/passives'?'passive':'class',spent=allocatedTotal(kind==='passive'?state.passiveAlloc:state.classAlloc),budget=kind==='passive'?passivePointBudget(level):classPointBudget(level);
 const counter=document.querySelector('.pointCounter');if(counter){const total=counter.querySelector('strong'),remaining=counter.querySelector('small');if(total)total.textContent=spent+' / '+budget;if(remaining)remaining.textContent=Math.max(0,budget-spent)+' remaining'}
}
export function levelValidForAllocations(level,passiveAlloc,classAllocById,classAlloc){
 const n=Number(level);if(!Number.isInteger(n)||n<1||n>1000)return {ok:false,reason:'Enter a level between 1 and 1000'};
 if(allocatedTotal(passiveAlloc)>passivePointBudget(n))return {ok:false,reason:'Refund passive points before lowering level'};
 const classPlans=[...Object.values(classAllocById||{}),classAlloc||{}];
 if(classPlans.some(plan=>allocatedTotal(plan)>classPointBudget(n)))return {ok:false,reason:'Refund class points before lowering level'};
 return {ok:true};
}
function commitTreeLevel(value){const n=Math.floor(Number(value));const valid=levelValidForAllocations(n,state.passiveAlloc,state.classAllocById,state.classAlloc);
 if(!valid.ok){toast(valid.reason);previewTreeLevel(state.characterLevel);const input=node('treeLevel');if(input)input.value=String(state.characterLevel);return}
 if(n===state.characterLevel){previewTreeLevel(n);return}
 const prevY=window.scrollY;state.characterLevel=n;storeTreePlan();render();
 window.scrollTo({top:prevY,left:0,behavior:'instant'});
}
function selectPassiveTier(value){
 const tierCount=state.treeData?.passive?.tiers?.length||20,index=Math.max(0,Math.min(tierCount-1,Math.floor(Number(value)||0)));
 state.passiveTier=index;state.passivePage=0;
 const route=parseRoute();
 if(route.route==='labs/passives'&&route.query.get('share')){
  const query=new URLSearchParams(route.query);query.set('tier',String(index));
  history.replaceState(history.state,'','#/labs/passives?'+query.toString());
 }
 render();
}
function passiveMove(delta){
 const current=visiblePassiveState(),tierCount=state.treeData?.passive?.tiers?.length||0;
 if(!tierCount||!current)return;
 const next=current.passiveTier+delta;
 if(next>=0&&next<tierCount)selectPassiveTier(next);
}
function classMove(delta){const groups=getBranch(getClass(state.treeData,state.treeClassId),state.treeBranchId)?.skills||[];const tierCount=skillTierGroups({skills:groups}).length;const next=state.classTierIndex+delta;if(next>=0&&next<tierCount){state.classTierIndex=next;render()}}
function showSkillStudy(id){const entry=ASSASSIN_MOTIFS.find(x=>x[1]===id);if(!entry)return;
 showLayer('ARCANA SKILL ART · DESIGN REVIEW',`<div class="previewHero"><span class="studyPreviewArt">${skillArt(id)}</span><div><span class="eyebrow">${esc(entry[2])} · PROVISIONAL</span><h2>${esc(entry[0])}</h2><p>Original Arcana icon concept inspired by the corresponding in-game visual. The final icon will be mapped to verified skill data and reviewed before publication.</p></div></div><div class="actionsGroup"><button class="btn secondary" data-route="labs/skills">${icon('git',16)} Return to Skill Tree</button></div><p class="mutedSmall">Inner class colors remain fixed. The surrounding UI follows the admin-selected theme.</p>`,'skill-study');}

function lfg(sub='raids'){const {route,query}=parseRoute();if(route==='lfg/listing'){
 const kind=query.get('kind'),id=query.get('id');const x=allLfg().find(i=>i.kind===kind&&i.id===id);
 return layout('Raid Details','ARCANALFG',x?lfgDetail(x):`<div class="lfgEmpty">${lfgState.loading?'Loading live raid data…':lfgState.error?'The live LFG feed is currently unavailable.':'Listing not found or no longer public.'}</div><button class="btn secondary" data-route="lfg/raids">Back to raids</button>`,'users');}
 if(lfgState.tab==='guilds')lfgState.tab='active';
 const info=lfgState.loading&&!lfgState.loaded?'<div class="lfgLoad">Checking current raid listings…</div>':lfgState.error?`<div class="lfgWarning">${esc(lfgState.error)}. <a href="https://lfg.arcanacompanion.xyz/" target="_blank" rel="noopener noreferrer">Open existing LFG</a></div>`:'';
 return layout('ArcanaLFG','LIVE RAIDS & COMMUNITY',info+lfgScreen(lfgState,sub,lfgState),'users');}
function guildPage(){const {route,query}=parseRoute();const id=query.get('id'),selected=guildState.guilds.find(x=>x.id===id);
 if(route==='lfg/guild')return layout('Guild Profile','ARCANALFG',guildDetail(selected),'shield');
 if(route==='lfg/guild/new')return layout('Recruit Players','ARCANALFG',guildForm(null),'users');
 if(route==='lfg/guild/edit'){if(!selected)return layout('Manage Guild','ARCANALFG','<div class="lfgEmpty">Your listing is missing or expired.</div>','shield');if(!readGuildOwner(id))return layout('Restore Listing','ARCANALFG',`<div class="guildFormPanel"><h2>Owner key needed</h2><p>Paste the recovery key created with this listing. Keys are not retrievable from the server.</p><input id="guildRecovery" autocomplete="off" placeholder="Recovery key"><button class="btn primary full" data-action="guildrecover" data-arg="${esc(id)}">Restore access</button></div>`,'shield');return layout('Manage Guild','ARCANALFG',guildForm(selected),'shield')}
 if(query.has('q'))guildState.query=query.get('q').slice(0,100);
 return layout('Guild Recruitment','ARCANALFG',guildDirectory(guildState.guilds,guildState.error,guildState.query)+`<div class="actionsGroup"><button class="btn secondary" data-route="labs/guild-tree">${icon('shield',16)} Guild Skill Tree Planner</button></div>`,'shield');}
function verifiedReference(id){const e=verifiedState.entries.find(x=>x.id===id);if(!e)return layout('Reference unavailable','ARCANA REFERENCE','<div class="lfgEmpty">This verified reference could not be found. Try Universal Search again.</div><button class="btn secondary" data-action="search">Search Arcana</button>','book');
 const details=(e.facts||[]).map(([k,v])=>`<div><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('');
 const related=e.gameKind==='item'?`<button class="btn secondary" data-action="search" data-arg="${esc(e.title)}">${icon('search',16)} Find related equipment and tools</button><button class="btn secondary" data-route="calculators/upgrade">${icon('calculator',16)} Upgrade calculator</button>`:e.gameKind==='class-skill'?`<button class="btn secondary" data-route="labs/skills">${icon('git',16)} Open Class Tree</button>`:e.gameKind==='rune'||e.gameKind==='runeword'?`<button class="btn secondary" data-route="labs/runes">${icon('gem',16)} Open Rune Forge</button>`:e.gameKind.startsWith('pet')?`<button class="btn secondary" data-route="calculators/pet">${icon('paw',16)} Pet Calculator</button>`:'';
 return layout(e.title,'VERIFIED GAME REFERENCE',`<div class="guildProfile"><span class="eyebrow">${esc(e.subtitle)} · OCTOBER 9 CONFIGURATION</span><h2>${esc(e.title)}</h2><p class="guildBio">${esc(e.description||'Verified game entry.')}</p><div class="guildFacts">${details}</div><div class="actionsGroup">${related}</div><p class="mutedSmall">Source: October 9 IdleArc game configuration. This is a concise reference record, not yet a full ArcanaWiki article or a recommendation. Values may change with subsequent patches.</p></div>`,'book');}
async function guildSave(form){const fd=new FormData(form),data=Object.fromEntries(fd.entries());delete data.class;data.classes=fd.getAll('class');data.arcstoneBoost=fd.has('arcstoneBoost');const {route,query}=parseRoute(),id=query.get('id'),edit=route==='lfg/guild/edit'&&id,key=edit?readGuildOwner(id):'';
 if(edit&&!key){toast('Owner key required');return}
 const err=node('guildFormError');if(err){err.hidden=true;err.textContent=''}
 try{const r=await fetch(V11_GUILD_ENDPOINT+(edit?'/'+encodeURIComponent(id):''),{method:edit?'PATCH':'POST',headers:{'content-type':'application/json',...(edit?{'x-owner-key':key}:{})},body:JSON.stringify(data),signal:AbortSignal.timeout(12000)});const result=await r.json();if(!r.ok)throw Error(result.error||'Could not save listing');if(!edit){saveGuildOwner(result.guild.id,result.ownerKey);showLayer('YOUR RECOVERY KEY',`<h2>Guild listing created</h2><p>Copy your private owner key. It cannot be retrieved later, and you will need it on another device.</p><div class="guildRecoveryKey">${esc(result.ownerKey)}</div><button class="btn primary full" data-action="guildcopykey" data-arg="${esc(result.ownerKey)}">${icon('bookmark',16)} Copy recovery key</button><button class="btn secondary full" data-route="lfg/guild" data-params="id=${encodeURIComponent(result.guild.id)}">View listing</button>`,'guildcreated');}
 await loadGuilds(true);if(edit){go('lfg/guild',{id});toast('Listing saved and renewed for 30 days.')}}catch(e){if(err){err.hidden=false;err.textContent=e.message}else toast(e.message)}
}
function updateLiveResults(){const raw=String(lfgState.mightAmount||'').trim(),n=Number(raw);const might=raw!==''&&Number.isFinite(n)&&n>=0&&n<=999?n*1000**['x1','K','M','B','T','qa','qi','sx','sp'].indexOf(lfgState.mightUnit):null;const matched=lfgFilter(allLfg(),{...lfgState,tab:lfgState.tab==='guilds'?'all':lfgState.tab,might});const el=node('lfgCards');if(el)el.innerHTML=matched.map(lfgCard).join('')||'<div class="lfgEmpty">No matching public groups. Try a different filter.</div>';const count=document.querySelector('.lfgResultsHead strong');if(count&&lfgState.tab!=='guilds')count.textContent=matched.length+' matching groups';}
function notFound(){return layout('Not found','ARCANA',`<div class="emptyCard"><h3>That destination is not available.</h3>${button('Return home','route','home','primary','home')}</div>`)}

function guildTree(){
 const q=parseRoute().query,link=q.toString();
 if((q.has('l')||q.has('p'))&&state.guildTreeLinkKey!==link){
  state.guildTreePlan=saveGuildTree(guildTreeFromLink(q));
  state.guildUndo=[];state.guildRedo=[];
  state.guildTreeLinkKey=link;
 }
 return layout('Guild Skill Tree','ARCANA LABS · GUILDS',guildTreeView(state.guildTreePlan,state.guildTreeTab,{canUndo:state.guildUndo.length>0,canRedo:state.guildRedo.length>0},state.guildBaseline),'shield');
}
function updateGuildTree(plan,{recordHistory=true}={}){
 const prev=state.guildTreePlan;
 const focus=document.activeElement?.closest?.('[data-action^="guild"]');
 const focusAction=focus?.dataset.action,focusArg=focus?.dataset.arg;
 const next=saveGuildTree(plan);
 if(recordHistory&&JSON.stringify(next)!==JSON.stringify(prev)){
  state.guildUndo.push({...prev});if(state.guildUndo.length>60)state.guildUndo.shift();
  state.guildRedo=[];
 }
 state.guildTreePlan=next;
 const params=guildTreeLinkParams(state.guildTreePlan),q=new URLSearchParams();
 for(const [k,v] of Object.entries(params))if(v!==null&&v!==undefined&&v!=='')q.set(k,String(v));
 state.guildTreeLinkKey=q.toString();
 if(parseRoute().route==='labs/guild-tree'||parseRoute().route==='lfg/guild-tree'){
  history.replaceState(history.state,'','#/labs/guild-tree'+(q.size?'?'+q:''));
 }
 render();
 if(focusAction&&focusAction!=='guildlink'){
  const selector='[data-action="'+focusAction+'"]'+(focusArg?'[data-arg="'+CSS.escape(focusArg)+'"]':'');
  node('content').querySelector(selector)?.focus({preventScroll:true});
 }
}

function routeView(){const {route,query}=parseRoute();switch(route){case 'home':return home();case 'directory':return directoryView();case 'journal':return '<div class="launchPage"><h1>Arcana Journal</h1><p>IdleArc news, balance analysis, and community perspectives.</p><a class="btn primary" href="/journal">Open the Journal →</a></div>';case 'journal-balance':return '<div class="launchPage"><h1>Class Balance: The Top 250 Tells a Story</h1><a class="btn primary" href="/journal/class-balance-top-250-season-2">Read the full analysis →</a></div>';case 'journal-studio':return '<div class="launchPage"><h1>Journal Studio</h1><a class="btn primary" href="/journal/studio">Open editor →</a></div>';case 'user':return userCenterView(currentAccount());case 'recent':return recentView();case 'featured':return featuredView();case 'theme-playground':return isLocalThemePlayground()?themePlaygroundView():notFound();case 'admin':case 'admin/traffic':return adminConsoleView({admin:isAppearanceAdmin(),authEnabled:accountStatus().enabled,tab:parseRoute().query.get('tab')||'traffic'});case 'settings':return settingsView({admin:isAppearanceAdmin(),authEnabled:accountStatus().enabled,loggedIn:accountStatus().authenticated});case 'icons':return iconGalleryView();case 'wiki/about':return wikiAboutView();case 'wiki/topics':return wikiLandingView({entries:verifiedState.entries,loaded:verifiedState.loaded,error:verifiedState.error,itemCount:verifiedState.entries.length});case 'wiki/category':return wikiCategory(query.get('slug'))?wikiCategoryView(query.get('slug')):notFound();case 'wiki/topic':return wikiCategoryView(LEGACY_WIKI_TOPIC_REDIRECTS[query.get('slug')]||query.get('slug'));case 'calculators':return calculators();case 'calculators/damage':return calcDamage();case 'labs':return buildStudio();case 'wiki':return wikiLandingView({entries:verifiedState.entries,loaded:verifiedState.loaded,error:verifiedState.error,itemCount:verifiedState.entries.length});case 'lfg':return lfg();case 'guilds/crest':return guildHubPage('guilds',query,currentAccount());case 'guilds':case 'guilds/view':case 'guilds/register':case 'guilds/manage':case 'guilds/moderation':return guildHubPage(route,query,currentAccount());case 'beta':case 'beta/reports':return betaView(route);case 'account':case 'profile':case 'community':case 'community/post':case 'community/create':return communityPage(route,query);case 'wiki/items':return wikiLibraryView({entries:verifiedState.entries,category:'item',query:wikiState.query,limit:wikiState.limit,loaded:verifiedState.loaded,error:verifiedState.error});case 'wiki/mechanics':return wikiLibraryView({entries:verifiedState.entries,category:'passive',query:wikiState.query,limit:wikiState.limit,loaded:verifiedState.loaded,error:verifiedState.error});case 'wiki/guides':return wikiGuidesView();case 'wiki/studio':return wikiStudioView();case 'wiki/library':return wikiLibraryView({entries:verifiedState.entries,category:wikiState.category=query.get('kind')||'all',query:wikiState.query,limit:wikiState.limit,loaded:verifiedState.loaded,error:verifiedState.error});case 'wiki/article':{const a=wikiArticleById(query.get('id'));if(a)track('wiki:article:'+a.id);return wikiArticleView(a);}case 'wiki/guide':return fullGuide(query.get('id'));case 'wiki/item':return wikiItem(query.get('item'));case 'wiki/mechanic':return wikiMechanic(query.get('id'));case 'labs/build':return buildStudio();case 'labs/runes':return runeForge();case 'labs/pets':return petLab();case 'labs/guild-tree':case 'lfg/guild-tree':return guildTree();case 'labs/skills':return skills();case 'labs/passives':return passives();case 'calculators/upgrade':return pathfinderHub('range');case 'calculators/pathfinder':return calcPathfinder();case 'calculators/compare':return pathfinderHub('compare');case 'calculators/pet':return calcPet();case 'calculators/affixes':return calcAffixes();case 'calculators/ml-farm':return calcFarm();case 'lfg/raids':return lfg('raids');case 'lfg/guilds':return guildPage();case 'lfg/guild':return guildPage();case 'lfg/guild/new':return guildPage();case 'lfg/guild/edit':return guildPage();case 'lfg/listing':return lfg('listing');case 'reference/detail':case 'wiki/reference':{const id=query.get('id')||query.get('item');if(id)track(id);return wikiRecordView(verifiedState.entries.find(e=>e.id===id),verifiedState.entries,wikiState.category);} default:return notFound()}}
function simpleBackBar(dest){
 const simple=new Set(['directory','featured','recent','settings','icons','user','account','beta','community','lfg','admin','admin/traffic']);
 if(!simple.has(dest))return '';
 return '<nav class="arcanaContextBack" aria-label="Page navigation"><button type="button" data-action="safe-back">'+icon('back',17)+' Back</button><span>'+esc(dest==='settings'?'Options':dest==='user'||dest==='account'?'Profile':dest==='lfg'?'Guild & Raid Finder':dest.charAt(0).toUpperCase()+dest.slice(1))+'</span></nav>';
}
function syncAdminPortal(){const button=node('adminPortalBtn');if(!button)return;const permitted=isAppearanceAdmin();button.hidden=!permitted;button.tabIndex=permitted?0:-1;button.setAttribute('aria-hidden',String(!permitted));}
function renderHeaderAvatar(){syncAdminPortal();const button=node('accountBtn');if(!button)return;const profile=currentAccount();const uri=profile?.avatarDataUrl;button.innerHTML=typeof uri==='string'&&/^data:image\/(?:webp|png|jpeg);base64,/.test(uri)?'<img src="'+esc(uri)+'" alt="">':(profile?.displayName?'<strong>'+esc(profile.displayName.slice(0,1).toUpperCase())+'</strong>':icon('users',22));button.setAttribute('aria-label',profile?'Open user center for '+profile.displayName:'Open guest user center')}
function siteNoticeMarkup(route){const n=siteNotice();return n.enabled&&!route.startsWith('admin')?'<aside class="siteNotice" role="status">'+esc(n.text)+'</aside>':'';}
function render(){const __treeRails=Object.fromEntries(['.classRail','.branchRail','.passiveTierRail'].map(sel=>[sel,document.querySelector(sel)?.scrollLeft??null]));const __prevGuildRail=document.querySelector('.guildTreeTabs');const __prevGuildX=__prevGuildRail?.scrollLeft??null;const __prevWikiRail=document.querySelector('.wikiCategoryScroll');const __prevWikiX=__prevWikiRail?__prevWikiRail.scrollLeft:null;const dest=parseRoute().route;const adminDesign=(isAppearanceAdmin()&&['admin','admin/traffic'].includes(dest)&&parseRoute().query.get('tab')==='appearance')||isLocalThemePlayground();document.documentElement.dataset.arcanaAdminDesign=String(canEditThemeDraft());document.documentElement.dataset.arcanaThemeTryOn=String(tryOnTheme());setDesignPreview(adminDesign||tryOnTheme());if(!adminDesign)endDesignMiniSession();if(dest==='calculators/pathfinder'&&!recipeState.loading&&!recipeState.data&&!recipeState.error)queueMicrotask(()=>void loadPathfinderRecipes());if(dest.startsWith('lfg/guild')&&!guildState.loading&&Date.now()-guildState.updatedAt>30000)queueMicrotask(()=>void loadGuilds());if(dest.startsWith('lfg')&&!lfgState.loading&&(Date.now()-lfgState.updatedAt>30000)){queueMicrotask(()=>void loadPublicLfg())};applyTheme(dest);node('content').classList.toggle('homeFullscreen',dest==='home');node('content').innerHTML=simpleBackBar(dest)+siteNoticeMarkup(dest)+routeView()+(dest==='home'?'':connectedNext(dest)+siteSignature());if(dest==='home')queueMicrotask(()=>void hydrateJournalPreview());if(dest.startsWith('guilds'))queueMicrotask(()=>void loadGuildHub(dest==='guilds/crest'?'guilds':dest,parseRoute().query,render,currentAccount()));if(adminDesign)syncDesignMiniPreview();document.querySelectorAll('#arcanaDock [data-dock]').forEach(b=>{const active=b.dataset.dock===dest||(b.dataset.dock==='community'&&['account','profile','community/post','community/create'].includes(dest));b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});renderHeaderAvatar();if((dest==='labs/build'||dest==='labs/runes'||dest==='labs/passives')&&parseRoute().query.get('share')&&shared.token!==parseRoute().query.get('share'))queueMicrotask(()=>void resolveShared(parseRoute().query.get('share')));
 if((dest==='admin'||dest==='admin/traffic')&&isAppearanceAdmin())queueMicrotask(()=>void loadAdminConsole(parseRoute().query.get('tab')||'traffic',render));if(dest==='wiki/studio')queueMicrotask(()=>void mountWikiStudio());if(dest==='beta'||dest==='beta/reports')queueMicrotask(()=>void loadBetaStatus(render));if(['account','profile','community','community/post','community/create'].includes(dest))queueMicrotask(()=>void loadCommunityPage(dest,parseRoute().query,render));const __nextGuildRail=node('content').querySelector('.guildTreeTabs');
if(__nextGuildRail&&__prevGuildX!==null)__nextGuildRail.scrollLeft=__prevGuildX;
for(const [selector,x] of Object.entries(__treeRails)){const rail=node('content').querySelector(selector);if(rail&&x!==null)rail.scrollLeft=x;}
const __nextWikiRail=node('content').querySelector('.wikiCategoryScroll');if(__nextWikiRail){
  if(__prevWikiX!==null)__nextWikiRail.scrollLeft=__prevWikiX;
  const __activeWikiTab=__nextWikiRail.querySelector('a.active');
  if(__activeWikiTab){
    const bounds=__activeWikiTab.getBoundingClientRect(),view=__nextWikiRail.getBoundingClientRect(),pad=12;
    if(bounds.left<view.left+pad)__nextWikiRail.scrollLeft=Math.max(0,__nextWikiRail.scrollLeft-(view.left+pad-bounds.left));
    else if(bounds.right>view.right-pad)__nextWikiRail.scrollLeft+=bounds.right-(view.right-pad);
  }
 }const currentTab=node('content').querySelector('.labsTab.active');if(currentTab){const rail=currentTab.parentElement;rail.scrollLeft=Math.max(0,currentTab.offsetLeft-rail.offsetLeft-(rail.clientWidth-currentTab.clientWidth)/2)}document.title='Arcana';recordTrafficNavigation(dest);}
function showLayer(kicker,body,type='panel'){state.layer={type};node('layer').dataset.type=type;node('layerKicker').textContent=kicker;node('layerContent').innerHTML=body;node('layer').hidden=false;document.body.classList.add('noScroll')}
function closeLayer(){node('layer').hidden=true;delete node('layer').dataset.type;state.layer=null;document.body.classList.remove('noScroll')}
function showHomeMenu(id){const content=homeSubmenu(id);if(!content)return;showLayer('NAVIGATE',content,'home-menu');queueMicrotask(()=>node('layerContent')?.querySelector('.launchNavRow')?.focus({preventScroll:true}))}
function overlayTitle(text,iconName='search'){return `<h2 class="sheetTitle">${icon(iconName,24)} ${esc(text)}</h2>`}
function searchFeatured(){return '<section class="arcanaSearchDiscover" aria-label="Featured destinations"><span class="eyebrow">EXPLORE ARCANA</span><h2>What would you like to explore?</h2><p>Start typing to search everything, or jump straight into something useful.</p><div class="arcanaSearchDiscoverGrid">'+[['Build Studio','labs/build','flask','Plan your character'],['Latest news','journal','clock','Read the Journal'],['Pathfinder','calculators/pathfinder','calculator','Upgrade costs'],['Tools','calculators','settings','Calculators & more'],['Guides & Wiki','wiki/guides','book','Game knowledge'],['Guild Hub','guilds','shield','Find your people']].map(([title,route,glyph,detail])=>'<button type="button" data-route="'+route+'"><span>'+icon(glyph,21)+'</span><strong>'+title+'</strong><small>'+detail+'</small></button>').join('')+'</div></section>';}
function showSearch(q=''){
 state.search=q;state.searchCategory='all';
 showLayer('SEARCH',`<div class="arcanaSearchDock"><span class="arcanaSearchGlyph">${icon('search',23)}</span><input id="globalSearch" type="search" enterkeyhint="search" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="Search Arcana" placeholder="Search items, guides, tools…" value="${esc(q)}"><button class="arcanaSearchClose" type="button" data-close aria-label="Close search">${icon('close',22)}</button></div><div id="searchResults" class="arcanaTypeahead" aria-live="polite">${q?resultMarkup(q):searchFeatured()}</div>`,'search');
 // Keep the keyboard closed until the player taps the search field.
}
function resultMarkup(query){
 const {matches,guesses}=searchAsYouType(query,v11AllEntries(),{limit:9});
 if(!matches.length&&!guesses.length)return '';
 if(matches.length)return '<div class="arcanaSearchMatches" role="region" aria-label="Search results">'+matches.map(cardEntity).join('')+'</div>';
 return '<div class="arcanaSearchMatches" role="region" aria-label="Possible corrections"><div class="arcanaSearchGuessLabel">DID YOU MEAN</div>'+guesses.map(x=>'<button class="arcanaSearchGuess" type="button" data-action="searchterm" data-arg="'+esc(x.title)+'">'+icon('search',18)+'<span>'+esc(x.title)+'</span>'+icon('arrow',16)+'</button>').join('')+'</div>';
}
function refreshLiveSearch(){const box=node('searchResults');if(box)box.innerHTML=state.search.trim()?resultMarkup(state.search):searchFeatured()}
function showPreview(id,fromSearch=false){const e=searchExtras().find(x=>x.id===id)||entityById.get(id)||lfgById(id)||guildEntries(guildState.guilds).find(x=>x.id===id)||verifiedState.entries.find(x=>x.id===id)||wikiArticleEntries().find(x=>x.id===id);if(!e)return;track(id);const title=esc(e.title);const buttons=e.kind==='verified'?`${button('View in ArcanaWiki','route',e.route,'primary','book')}${e.gameKind==='class-skill'?button('Open Class Tree','route','labs/skills','secondary','git'):''}${e.gameKind==='passive'?button('Open Passive Tree','route','labs/passives','secondary','layers'):''}${e.gameKind==='runeword'||e.gameKind==='rune'?button('Open Rune Forge','route','labs/runes','secondary','gem'):''}${e.gameKind==='item'?button('Compare this item','compare',e.id,'secondary','compare')+button('See upgrade costs','upgrade',e.id,'secondary','calculator'):''}`:e.kind==='wikiarticle'?button('Read quick guide','route',e.route,'primary','book'):e.kind==='guildlisting'?button('View guild recruitment profile','route',e.route,'primary','shield'):e.kind==='lfglisting'?`${button('View raid in Arcana','route',e.route,'primary','users')}<a class="btn secondary" href="${lfgDeepLink(e.source)}" target="_blank" rel="noopener noreferrer">${icon('up',16)} Apply on live LFG</a>`:e.kind==='lfgguild'?button('View guild activity','route',e.route,'primary','shield'):e.kind==='item'?`${button('View item in Wiki','wikiitem',e.id,'primary','book')}${button('Compare this item','compare',e.id,'secondary','compare')}${button('See upgrade costs','upgrade',e.id,'secondary','calculator')}${button('Add to Build Studio','equip',e.id,'secondary','flask')}`:e.kind==='guide'?`${button('Read full guide','route','wiki/guide?id='+e.id,'primary','book')}${e.buildId?button('Inspect complete build','route','labs/build?build='+e.buildId,'secondary','flask'):''}`:e.kind==='mechanic'?`${button('View in Wiki','route','wiki/mechanic?id='+e.id,'primary','book')}${e.id==='pet-equalisation'?button('Open Pet Calculator','route','calculators/pet','secondary','calculator'):''}`:e.kind==='build'?button('Open my Build Studio','route','labs/build','primary','flask'):button('Open destination','route',e.route||'home','primary','arrow');
 state.layer={type:'preview',fromSearch};showLayer('QUICK PREVIEW',`${fromSearch?`<button class="backLink" data-action="backsearch">${icon('back',16)} Back to results</button>`:''}<div class="previewHero"><span class="detailMark">${icon(boxIcon(e.kind),32)}</span><div><span class="eyebrow">${esc(e.subtitle)}</span><h2>${title}</h2><p>${esc(e.description)}</p></div></div><div class="actionsGroup">${buttons}</div><p class="mutedSmall">Actions carry this entry's ID. You're never asked to find it twice.</p>`,'preview');state.layer={type:'preview',fromSearch};}
function quick(){const rec=state.recent.map(id=>entityById.get(id)).filter(Boolean).slice(0,5);showLayer('QUICK ACCESS',`${overlayTitle('Jump back in','clock')}<span class="eyebrow">JUMP TO A DESTINATION</span><div class="arcanaShortcutGrid">${navCards(['items','guides','guildtree','raids'],{compact:true})}</div><span class="eyebrow">POPULAR TOOLS</span><div class="quickGrid">${[['Upgrade Costs','calculators/upgrade','calculator'],['Build Studio','labs/build','flask'],['Rune Forge','labs/runes','gem'],['Pet Compound','calculators/pet','paw'],['Guild Tree','labs/guild-tree','shield'],['ML Farm','calculators/ml-farm','sword']].map(([n,r,i])=>`<button data-route="${r}">${icon(i,22)}${esc(n)}${icon('arrow',14)}</button>`).join('')}</div><span class="eyebrow">RECENTLY VIEWED</span><div class="resultList">${rec.length?rec.map(cardEntity).join(''):'<div class="emptyMini">Viewed items, guides, and mechanics will appear here.</div>'}</div><p class="mutedSmall">Pinning and cross-device recent history will be added alongside optional accounts.</p>`,'quick')}
function menu(){showLayer('ARCANA DIRECTORY',`${overlayTitle('Explore the ecosystem','menu')}<div class="menuList"><button data-route="settings"><span class="tinyIcon">${icon('sliders',22)}</span><strong>Settings</strong>${icon('arrow',17)}</button>${LINKS.map(([href,label,i])=>`<button data-route="${href}"><span class="tinyIcon">${icon(i,22)}</span><strong>${esc(label)}</strong>${icon('arrow',17)}</button>`).join('')}</div>${isAppearanceAdmin()?`<div class="sectionCard adminEntry"><span class="eyebrow">ADMINISTRATION</span><h3>Arcana Theme Studio</h3><p class="mutedSmall">Creator and admin tools.</p><div class="themeReadout">${themeColorPreview()}</div><button type="button" class="btn secondary full" data-route="settings">${icon('settings',17)} Appearance controls ${icon('arrow',16)}</button></div>`:''}`,'menu')}
function themeColorPreview(){const t=themeStatus();const {main,secondary,highlight}=t.palette;return `<span class="themeSwatch" style="background:${main}"></span><span class="themeSwatch" style="background:${secondary}"></span><span class="themeSwatch" style="background:${highlight}"></span><span class="themeReadoutText">${t.available?'Central theme active':'Default palette (offline)'}</span>`}
function pickerOptions(kind,slot,query=''){
 if(kind==='gear')return gearPickerMarkup(slot,ensureDraft().className,query);
 const verified=verifiedState.entries.filter(e=>e.gameKind==='item').map(e=>item(e.id));
 const unique=new Map([...verified,...itemList].filter(Boolean).map(e=>[e.title.toLowerCase(),e]));
 const normalized=slot==='ring2'?'ring':slot==='charm2'?'charm':slot;
 const q=query.trim().toLowerCase();
 const options=[...unique.values()].filter(e=>kind!=='gear'||!slot||!e.slot||e.slot===normalized).filter(e=>!q||[e.title,e.subtitle,e.description].some(v=>String(v||'').toLowerCase().includes(q)));
 return options.length?options.map(e=>`<button class="resultRow" data-action="selectitem" data-arg="${esc(e.id)}"><span class="tinyIcon tinyGameArt">${gameArt(e,41)}</span><span class="resultText"><strong>${esc(e.title)}</strong><small>${esc(e.subtitle||e.description||'Equipment')}</small></span>${icon('plus',16)}</button>`).join(''):'<div class="emptyMini">No matching equipment in this slot.</div>';
}
function picker(kind,slot){state.slotTarget={kind,slot};showLayer('SELECT EQUIPMENT',`${overlayTitle('Choose equipment','shield')}<div class="filterLine"><input type="search" id="gearPickerQuery" placeholder="Find equipment…" autocomplete="off" aria-label="Search equipment"><span>${icon('search',18)}</span></div><div class="resultList" id="gearPickerItems">${pickerOptions(kind,slot)}</div>`,'picker')}

function openGearEditor(slot,value){
 const entry=asGear(value),fallback=newGear(equipmentId(value));
 if(!entry&&!fallback){toast('Equipment unavailable in verified game data');return;}
 state.slotTarget={kind:'gear',slot};
 state.gearEdit={...fallback,...entry};
 if(!state.gearEdit.rarity)state.gearEdit.rarity=2;
 if(!state.gearEdit.bonusTier)state.gearEdit.bonusTier=Math.max(2,state.gearEdit.rarity);
 showGearEditor();
}
function showGearEditor(){
 if(!state.slotTarget||!state.gearEdit)return;
 showLayer('CONFIGURE EQUIPMENT',gearEditorMarkup(state.slotTarget.slot,state.gearEdit,ensureDraft().className),'gear-editor');
}
function saveGearEdit(){
 const {slot}=state.slotTarget||{},v=asGear(state.gearEdit),build=ensureDraft();
 if(!slot||!v)return;
 const errors=gearIssues(v,slot,build.className,build.equipment);
 if(errors.length){toast(errors[0]);return;}
 if(slot==='weapon'&&baseItem(v)?.twoHanded&&build.equipment.offhand){
  build.equipment.offhand=null;
  toast('Off hand cleared for two-handed weapon');
 }
 build.equipment[slot]=v;persistDraft();state.gearEdit=null;closeLayer();render();toast('Equipment saved');
}
function chooseItem(id){const target=state.slotTarget;if(!target)return;
 if(target.kind==='gear'){openGearEditor(target.slot,id);return;}
 closeLayer();
 const inHub=parseRoute().route==='calculators/pathfinder';if(target.kind==='upgrade'){if(inHub)navigate('calculators/pathfinder',{view:'upgrade',item:id});else navigate('calculators/upgrade',{item:id})}if(target.kind==='compare'){if(target.slot==='left')state.compareLeft=id;else state.compareRight=id;if(inHub)navigate('calculators/pathfinder',{view:'compare',left:state.compareLeft,right:state.compareRight});else navigate('calculators/compare',{left:state.compareLeft,right:state.compareRight})}
}
function go(route,params={}){
 if(route==='journal'||route==='journal-studio'||route==='journal-balance'){location.assign(route==='journal'?'/journal':route==='journal-studio'?'/journal/studio':'/journal/class-balance-top-250-season-2');return;}
 if(route==='calculators/upgrade'||route==='calculators/compare'){const mode=route.endsWith('/upgrade')?'upgrade':'compare';params={...params,view:mode};route='calculators/pathfinder'}
 const current=parseRoute();
 if((route==='beta'||route==='beta/reports')&&current.route!=='beta'&&current.route!=='beta/reports'){try{sessionStorage.setItem('arcana-beta-last-route',location.hash||'#/home')}catch{}}
 if(current.route==='wiki/library'&&route==='wiki/reference'){
  wikiState.returnPosition={kind:current.query.get('kind')||'all',top:window.scrollY};
 }
 const saved=wikiState.returnPosition;
 const returning=current.route==='wiki/reference'&&route==='wiki/library'&&saved&&saved.kind===(params.kind||'all');
 closeLayer();
 navigate(route,params);
 if(returning){
  wikiState.returnPosition=null;
  requestAnimationFrame(()=>window.scrollTo({top:saved.top,behavior:'instant'}));
 }else{
  window.scrollTo({top:0,behavior:'instant'});
 }
}
function syncWorkshopInputs(){
 if(!canEditThemeDraft())return;
 const design=readDesign();
 const px=new Set(['roundness','buttonRoundness','cardPadding','borderWidth','buttonHeight','heroActionHeight','heroActionBorder']);
 for(const e of document.querySelectorAll('.arcanaDesignLab [data-design-field]')){
  const key=e.dataset.designField;if(!Object.hasOwn(design,key))continue;
  e.value=String(design[key]);
  const value=document.querySelector('[data-design-value="'+key+'"]');
  if(value)value.textContent=design[key]+(px.has(key)?' px':'%');
 }
 for(const e of document.querySelectorAll('.arcanaDesignLab [data-design-hex]')){
  e.value=design[e.dataset.designHex]||'';
  e.removeAttribute('aria-invalid');
  const label=document.querySelector('[data-design-status="'+e.dataset.designHex+'"]');
  if(label)label.textContent='HEX code';
 }
 const psy=document.querySelector('.arcanaDesignLab .psyPalettePicker');if(psy){psy.dataset.psyActive=String(['groove-melt','orbit-jelly','doodle-rift','prism-puddle'].includes(design.pattern));psy.dataset.psyMode=design.psyPaletteMode;}
 for(const tile of document.querySelectorAll('.arcanaDesignLab [data-theme-pattern]'))tile.setAttribute('aria-pressed',String(tile.dataset.themePattern===design.pattern));
 for(const button of document.querySelectorAll('.arcanaDesignLab [data-hero-cta-style]'))button.setAttribute('aria-pressed',String(button.dataset.heroCtaStyle===design.heroActionStyle));
 for(const preset of document.querySelectorAll('.arcanaDesignLab .designPreset')){
  const matches=preset.dataset.presetSearch&&preset.dataset.arg;
  if(matches){const selected=preset.dataset.arg===Object.keys(DESIGN_PRESETS).find(id=>DESIGN_PRESETS[id].main===design.main&&DESIGN_PRESETS[id].action===design.action&&DESIGN_PRESETS[id].pattern===design.pattern);preset.classList.toggle('selected',selected);preset.setAttribute('aria-pressed',String(selected));}
 }
 syncDesignMiniPreview();
}
function action(name,arg,btn){if(['accent','custom-accent','site-surface','icon-color','icon-mode'].includes(name)&&!isAppearanceAdmin()){toast('Only Arcana admins can edit appearance');return;}switch(name){
 case 'chooseportrait':node('studioPortraitUpload')?.click();break;
 case 'removeportrait':if(clearStudioPortrait()){render();toast('Class icon restored')}else toast('Could not remove the custom image');break;
 case 'accent':if(setAccent(arg)){render();toast('Theme updated')}else toast('Unable to save theme preference');break;
  case 'reset-design':if(!canEditThemeDraft()){toast('Admin access required');break}if(resetDesign()){applyTheme(parseRoute().route);syncWorkshopInputs();toast('Design reset. Undo is available.')}break;
  case 'preview-design':{focusDesignMiniPreview();break;}
  case 'undo-design':if(!canEditThemeDraft()){toast('Admin access required');break}if(undoDesign()){applyTheme(parseRoute().route);syncWorkshopInputs();toast('Previous design restored')}else toast('No recent design change to undo');break;
  case 'theme-try-on':{if(isLocalThemePlayground()&&changeTryOn(true)){go('home');toast('Your private theme is now visible around Arcana. Browser only.');}break;}
   case 'theme-try-off':{if(isLocalThemePlayground()&&changeTryOn(false)){render();toast('Site preview disabled. Studio preview stays editable.');}break;}
   case 'random-signature':{if(!canEditThemeDraft())break;const keys=Object.keys(DESIGN_PRESETS).filter(id=>DESIGN_PRESETS[id].collection==='signature');const design=readDesign();const other=keys.filter(id=>DESIGN_PRESETS[id].pattern!==design.pattern);const source=other.length?other:keys;const chosen=source[Math.floor(Math.random()*source.length)];if(chosen&&applyDesignPreset(chosen)){applyTheme(parseRoute().route);syncWorkshopInputs();toast('Signature theme: '+DESIGN_PRESETS[chosen].name+' · Private draft');}break;}
   case 'design-preset':if(!canEditThemeDraft()){toast('Admin access required');break}if(applyDesignPreset(arg)){applyTheme(parseRoute().route);syncWorkshopInputs();toast('Palette applied. Undo is available.')}else toast('Palette unavailable');break;
  case 'custom-accent':{const hex=node('arcanaCustomAccentHex')?.value.trim()||node('arcanaCustomAccentPicker')?.value;if(setCustomAccent(hex)){render();toast('Custom color saved')}else toast('Enter a valid six-digit hex color such as #A98BFF');break;}
 case 'site-surface':if(setSiteSurface(arg)){render();toast('Site appearance updated')}else toast('Unable to save site appearance');break;
 case 'icon-color':if(setIconColor(arg)){render();toast('Icon color updated')}else toast('Unable to save icon color');break;
 case 'icon-mode':if(setIconMode(arg)){render();toast('Icon appearance updated')}else toast('Unable to save icon appearance');break;
 case 'safe-back':if(history.state?.arcana)navigateBack();else go('home');break;
  case 'wiki-back':if(history.state?.arcana&&history.length>1)navigateBack();else if(arg==='wiki/category'){const article=wikiArticleById(parseRoute().query.get('id'));const parent=article?wikiCategoryForArticle(article):null;go(parent?'wiki/category':'wiki',parent?{slug:parent.id}:{})}else go(['wiki','wiki/guides','wiki/library'].includes(arg)?arg:'wiki');break;
  case 'skipmain':node('content')?.focus({preventScroll:false});break;
  case 'homemenu':if(arg==='pathfinder')go('calculators/pathfinder');else showHomeMenu(arg);break;
 case 'wikishare':{
  if(!wikiArticleById(arg)){toast('Guide unavailable');break;}
  const url=location.origin+location.pathname+location.search+'#/wiki/article?id='+encodeURIComponent(arg);
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(()=>toast('Guide link copied')).catch(()=>window.prompt('Copy guide link',url));
  else window.prompt('Copy guide link',url);
  break;
 }
 case 'wikirefshare':{
  const id=String(arg||'');
  if(!verifiedState.entries.some(x=>x.id===id)){toast('Reference unavailable');break;}
  const url=location.origin+location.pathname+location.search+'#/wiki/reference?id='+encodeURIComponent(id);
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(()=>toast('Reference link copied')).catch(()=>window.prompt('Copy reference link',url));
  else window.prompt('Copy reference link',url);
  break;
 }
 case 'wikisection':{const slug=String(arg||'');if(!/^[a-z0-9-]{1,100}$/.test(slug))break;const target=document.getElementById('section-'+slug);if(target){target.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});target.querySelector('h2')?.focus({preventScroll:true});}break;}
 case 'wikitop':window.scrollTo({top:0,behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});break;
 case 'guildtreetab':state.guildTreeTab=arg;render();node('content').querySelector('.guildTreeTabs button.active')?.focus({preventScroll:true});break;
 case 'path-refresh':recipeState.error='';recipeState.data=null;void loadPathfinderRecipes();break;
 case 'path-mode':{
 if(!['normal','awakened'].includes(arg))break;
 updatePathfinderQuick({mode:arg,stage:arg==='awakened'?'A1':'T1',level:1},true);break;
}
case 'path-stage':pathfinderStage(arg);break;
case 'path-step':{
 const model=recipeState.data&&timelineModel(recipeState.data,state.pathfinderQuick);
 const value=Number(arg);if(model&&Number.isInteger(value)&&value>=0&&value<=model.active.max)updatePathfinderQuick({level:value});break;
}
case 'path-prev':movePathfinderStep(-1);break;
case 'path-next':movePathfinderStep(1);break;

 case 'farmreset':state.farmPlan=saveFarmPlan({mode:state.farmPlan.mode,times:[null,null,null]});render();break;
 case 'guildbaseline':state.guildBaseline=saveGuildBaseline(state.guildTreePlan);state.guildTreeTab='comparison';render();toast('Guild comparison baseline saved.');break;
 case 'guildbaselineclear':if(window.confirm('Clear this locally saved comparison baseline?')){state.guildBaseline=clearGuildBaseline();render();toast('Comparison baseline cleared.')}break;
 case 'guildundo':{const prev=state.guildUndo.pop();if(!prev){toast('No earlier guild changes');break;}state.guildRedo.push({...state.guildTreePlan});updateGuildTree(prev,{recordHistory:false});break;}
 case 'guildredo':{const next=state.guildRedo.pop();if(!next){toast('Nothing to redo');break;}state.guildUndo.push({...state.guildTreePlan});updateGuildTree(next,{recordHistory:false});break;}
 case 'guildlevelminus':updateGuildTree(guildTreeWithLevel(state.guildTreePlan,state.guildTreePlan.level-1));break;
 case 'guildlevelplus':updateGuildTree(guildTreeWithLevel(state.guildTreePlan,state.guildTreePlan.level+1));break;
 case 'guildpointadd':{const r=allocateGuildPoint(state.guildTreePlan,arg);if(r.reason)toast(r.reason);else updateGuildTree(r.plan);break;}
 case 'guildpointremove':{const r=removeGuildPoint(state.guildTreePlan,arg);if(r.reason)toast(r.reason);else updateGuildTree(r.plan);break;}
 case 'guildpointmax':{const r=maxGuildPoints(state.guildTreePlan,arg);if(!r.added)toast(r.reason||'No points available');else updateGuildTree(r.plan);break;}
 case 'guildreset':if(window.confirm('Reset this saved guild tree plan? This does not reset your in-game guild.'))updateGuildTree(freshGuildTree(state.guildTreePlan.level));break;
 case 'guildlink':{
  const link=location.href;
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(link).then(()=>toast('Guild build link copied')).catch(()=>window.prompt('Copy your guild tree link',link));
  else window.prompt('Copy your guild tree link',link);
  break;
 }
case 'searchcategory':state.searchCategory=arg;refreshLiveSearch();break;case 'guildrefresh':void loadGuilds(true);break;case 'guildcopykey':navigator.clipboard?.writeText(arg).then(()=>toast('Recovery key copied')).catch(()=>toast('Copy the key manually'));break;case 'guildrecover':{const key=node('guildRecovery')?.value?.trim();if(!key||key.length<30){toast('Enter the full recovery key');break;}saveGuildOwner(arg,key);closeLayer();go('lfg/guild/edit',{id:arg});break;}case 'guilddelete':{if(!window.confirm('Delete this guild listing? This cannot be undone.'))break;const key=readGuildOwner(arg);fetch(V11_GUILD_ENDPOINT+'/'+encodeURIComponent(arg),{method:'DELETE',headers:{'x-owner-key':key}}).then(async r=>{const b=await r.json();if(!r.ok)throw Error(b.error||'Delete failed');await loadGuilds(true);go('lfg/guilds');toast('Guild listing deleted')}).catch(e=>toast(e.message));break;}case 'lfgtab':lfgState.tab=arg;render();break;case 'lfgrefresh':void loadPublicLfg(true);break;case 'lfgclear':Object.assign(lfgState,{query:'',tier:'',characterClass:'',mightAmount:'',mightUnit:'M'});render();break;case 'lfgguild':lfgState.query=arg;lfgState.tab='all';go('lfg/raids');break;case 'passiveinspect':inspectPassive(arg);break;case 'classinspect':inspectClass(arg);break;case 'passiveadjust':{const [key,d]=arg.split('|');adjustPassive(key,+d);break;}case 'classadjust':{const [key,d]=arg.split('|');adjustClass(key,+d);break;}case 'passivetier':selectPassiveTier(arg);break;case 'passiveprev':passiveMove(-1);break;case 'passivenext':passiveMove(1);break;case 'passivefirst':selectPassiveTier(0);break;case 'passivemilestone':{node('content').querySelector('.passivePanel .milestoneRow')?.scrollIntoView({block:'center',behavior:'smooth'});break;}case 'classselect':{
 const target=state.treeData?.classes?.find(x=>x.id===arg);if(!target||state.treeClassId===arg)break;
 if(state.treeClassId)state.classAllocById[state.treeClassId]=state.classAlloc;
 state.treeClassId=arg;state.treeBranchId=null;state.classAlloc=state.classAllocById[arg]||{};
 state.classTierIndex=0;
 if(state.draft){
  const previous=state.draft.className;
  state.draft.className=target.name;
  if(previous!==target.name){
   for(const [slot,itemValue] of Object.entries(state.draft.equipment||{})){
    if(itemValue&&!allowedItem(itemValue,slot,target.name))state.draft.equipment[slot]=null;
   }
  }
 }
 storeTreePlan();render();break;
}case 'branchselect':state.treeBranchId=arg;state.classTierIndex=0;storeTreePlan();render();break;case 'classtier':state.classTierIndex=+arg;render();break;case 'classprev':classMove(-1);break;case 'classnext':classMove(1);break;case 'resetpassives':{if(allocatedTotal(state.passiveAlloc)>0&&!confirm('Refund all allocated passive points?'))break;state.passiveAlloc={};storeTreePlan();render();break;}case 'resetclasses':{
 if(allocatedTotal(state.classAlloc)>0&&!window.confirm('Reset all allocated class skill points for this class?'))break;
 state.classAlloc={};state.classAllocById[state.treeClassId||'default']={};storeTreePlan();render();break;
}
case 'resetbranch':{
 const cls=getClass(state.treeData,state.treeClassId),b=getBranch(cls,state.treeBranchId);
 if(!b)break;const count=b.skills.reduce((sum,s)=>sum+Number(state.classAlloc[s.id]||0),0);
 if(!count)break;
 if(!window.confirm('Refund '+count+' points from '+b.name+'?'))break;
 // A full branch reset can invalidate skill prerequisites in this class; rebuild allocation conservatively.
 const candidate={...state.classAlloc};for(const sk of b.skills)delete candidate[sk.id];
 state.classAlloc=candidate;state.classAllocById[cls.id]=candidate;storeTreePlan();render();break;
}case 'reloadtree':void loadTrees();
void loadPublicLfg();break;case 'search':showSearch(arg||'');break;case 'wikicat':navigate('wiki/library',{kind:arg});break;case 'wikimore':{
 const before=wikiState.limit;
 wikiState.limit+=36;
 const category=parseRoute().query.get('kind')||'all';
 const result=wikiRecordRows(verifiedState.entries,category,wikiState.query,wikiState.limit);
 const container=node('wikiRecords'),more=node('wikiMore'),showing=node('wikiShowing');
 if(container)container.innerHTML=result.html;
 if(more)more.hidden=!result.hasMore;
 if(showing)showing.textContent=result.count?'Showing '+Math.min(result.count,wikiState.limit)+' of '+result.count:'Season 2 reference library';
 // Preserve the window scroll position rather than rebuilding the entire page.
 break;
}case 'wikiretry':{if(btn){btn.disabled=true;btn.textContent='Retrying…';}void loadVerifiedIndex();break;}case 'wikiclear':wikiState.query='';wikiState.limit=36;render();break;case 'skillpreview':showSkillStudy(arg);break;case 'clearsearch':showSearch('');break;case 'searchterm':showSearch(arg);break;case 'quick':quick();break;case 'menu':menu();break;case 'backsearch':showSearch(state.lastSearch);break;case 'back':go('home');break;case 'route':{const [path,q='']=arg.split('?');go(path,Object.fromEntries(new URLSearchParams(q)));break;}case 'wikiitem':if(arg.startsWith('game:item:'))go('wiki/reference',{id:arg});else go('wiki/item',{item:arg});break;case 'upgrade':go('calculators/upgrade',{item:arg});break;case 'compare':{state.compareLeft=arg;go('calculators/compare',{left:arg,right:state.compareRight});break;}case 'equip':{const g=baseItem(arg);if(!g){toast('Item not in verified equipment catalog');break;}const slot={main_hand:'weapon',off_hand:'offhand',amulet:'neck'}[g.slot]||g.slot;go('labs/build');openGearEditor(slot,arg);break;}
case 'pickgear':{
 const b=ensureDraft();
 if(arg==='offhand'&&baseItem(b.equipment.weapon)?.twoHanded){toast('Remove the two-handed weapon to equip an off hand');break;}
 if(b.equipment[arg])openGearEditor(arg,b.equipment[arg]);else picker('gear',arg);
 break;
}
case 'inspectgear':{
 const raw=demoActive().equipment[arg];
 if(raw)showLayer('EQUIPPED ITEM',gearInspectMarkup(arg,raw),'gear-inspect');
 else showLayer('EMPTY EQUIPMENT SLOT',`<p class="lead">This slot is empty. Copy the build to edit it.</p>`);
 break;
}
case 'gearchangebase':{const slot=state.slotTarget?.slot;if(slot)picker('gear',slot);break;}
case 'gearsave':saveGearEdit();break;
case 'gearclear':{
 const slot=state.slotTarget?.slot;if(!slot)break;
 const b=ensureDraft();b.equipment[slot]=null;persistDraft();state.gearEdit=null;closeLayer();render();toast('Equipment removed');break;
}
case 'petcompoundstep':{
 const step=Number(arg);if(![1,5,10,25].includes(step))break;
 state.compoundQuick=saveCompoundPlan({...state.compoundQuick,level:state.compoundQuick.level+step});render();break;
}case 'petcompoundreset':{state.compoundQuick=saveCompoundPlan({...state.compoundQuick,level:0});render();break;}
case 'petaffixstep':{
 const step=Number(arg);if(![1,10,25,50,100].includes(step))break;
 state.affixCostQuick=saveAffixCostPlan({...state.affixCostQuick,targetLevel:state.affixCostQuick.targetLevel+step});render();break;
}case 'petaffixreset':{state.affixCostQuick=saveAffixCostPlan({...state.affixCostQuick,targetLevel:state.affixCostQuick.currentLevel});render();break;}
case 'comparetier':{const tier=Number(arg);if(!Number.isInteger(tier)||tier<1||tier>6)break;state.compareTier=tier;render();break;}case 'pickcompare':picker('compare',arg);break;case 'chooseupgrade':picker('upgrade');break;case 'selectitem':chooseItem(arg);break;case 'clonebuild':{const source=parseRoute().query.get('share')?shared.build:buildTemplate(arg);if(!source){toast('Shared build unavailable');break;}state.draft=normalizeBuild(deepCopy(source));state.runeSelected=null;state.runeHistory=[];state.draft.id='local-draft';state.draft.title=String(source.title||'Copied build').replace(/demonstration/ig,'copied').slice(0,90);state.draft.version='LOCAL';saveDraft(state.draft);go('labs/build');toast('Build copied into your own local draft.');break;}
case 'resetbuild':{if(!confirm('Start a new blank build? This replaces your current local Build Studio draft. Save or share it first if you want to keep a copy.'))break;state.draft=newPersonalBuild();clearStudioPortrait();saveDraft(state.draft);state.runeSelected=null;state.runeHistory=[];go('labs/build');toast('New blank build created.');break;}
case 'savecloud':{persistDraft();void saveNewAccountBuild(ensureDraft()).then(b=>toast('Saved '+b.title+' to your account.')).catch(err=>toast(err.message||'Sign in to your account first.'));break;}
case 'sharepassives':{
 storeTreePlan();
 // Share only the passive preview: never leak private notes, gear, pet details or other build data.
 const plan={id:'passive-tree-preview',title:'Passive Skill Tree Preview',className:state.draft?.className||'Warrior',
  characterLevel:state.characterLevel,passiveAlloc:structuredClone(state.passiveAlloc),
  passiveFreeMode:state.passiveFreeMode===true,equipment:{},runes:[]};
 void shareBuildToken(plan).then(token=>{
  const url=location.origin+location.pathname+'#/labs/passives?share='+encodeURIComponent(token)+'&tier='+state.passiveTier;
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(()=>toast('Passive tree link copied')).catch(()=>window.prompt('Copy passive tree link',url));
  else window.prompt('Copy passive tree link',url);
 }).catch(err=>toast(String(err.message||err)));
 break;
}
case 'sharebuild':{const b=ensureDraft();persistDraft();void shareBuildToken(b).then(token=>{const url=location.origin+location.pathname+'#/labs/build?share='+encodeURIComponent(token);if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(()=>toast('Shareable build link copied')).catch(()=>window.prompt('Copy your build link',url));else window.prompt('Copy your build link',url);}).catch(err=>toast(String(err.message||err)));break;}
case 'savebuild':if(state.draft)saveDraft(state.draft);toast('Build saved on this device.');break;case 'runesave':persistDraft();toast('Rune grid saved with your character.');break;
case 'runefamily':{const family=RUNE_FAMILIES.includes(arg)?arg:'Fury',def=RUNE_FAMILY_DETAILS[family];state.runeFamily=family;if(state.runeSelected){mutateRunes(b=>{const r=b.runeBoard.find(r=>r.id===state.runeSelected);if(r){r.family=family;r.primary=def.primary}})}else{state.runeSecondary=def.suggestedSecondary;render()}break;}
case 'runeshape':{const shape=arg in RUNE_SHAPES?arg:'small';state.runeShape=shape;if(state.runeSelected){const b=ensureDraft(),r=b.runeBoard.find(r=>r.id===state.runeSelected);if(!r)break;const candidate={...r,shape,w:RUNE_SHAPES[shape].w,h:RUNE_SHAPES[shape].h};const issue=runeIssue(b.runeBoard,candidate,r.id,b.monsterLevel);if(issue){toast(issue);break;}mutateRunes(b=>{Object.assign(b.runeBoard.find(x=>x.id===state.runeSelected),{shape,w:candidate.w,h:candidate.h})});}else render();break;}
case 'runeplace':{if(parseRoute().query.get('build')||parseRoute().query.get('share')){toast('Copy this build to edit its rune layout');break;}const [x,y]=arg.split('|').map(Number),shape=RUNE_SHAPES[state.runeShape];const b=ensureDraft();const candidate={id:nextRuneId(b.runeBoard),family:state.runeFamily,secondary:state.runeSecondary,shape:state.runeShape,x,y,w:shape.w,h:shape.h};const res=putRune(b.runeBoard,candidate,b.monsterLevel);if(!res.ok){toast(res.reason);break;}state.runeSelected=candidate.id;mutateRunes(build=>{build.runeBoard=res.placements;});break;}
case 'runeselect':{state.runeSelected=arg;const r=ensureDraft().runeBoard.find(r=>r.id===arg);if(r){state.runeFamily=r.family;state.runeSecondary=r.secondary;state.runeShape=r.shape;}render();break;}
case 'runeremove':if(parseRoute().query.get('build'))break;state.runeSelected=null;mutateRunes(b=>{b.runeBoard=removeRune(b.runeBoard,arg)});break;
case 'runeundo':{const before=state.runeHistory.pop();if(!before){toast('No more changes to undo');break;}const b=ensureDraft();b.runeBoard=before;b.runes=[...new Set(before.map(r=>r.family))];persistDraft();state.runeSelected=null;render();break;}
case 'runeclearinactive':{mutateRunes(b=>{b.runeBoard=activeRuneBoard(b.runeBoard,b.monsterLevel).active});state.runeSelected=null;break;}
case 'runeclear':{const b=ensureDraft();if(!b.runeBoard.length)break;mutateRunes(b=>{b.runeBoard=[]});state.runeSelected=null;break;}
case 'petmode':state.petCalcMode=arg==='permanent'?'permanent':'seasonal';render();break;
case 'account':go('account');break;case 'refresh-theme':void refreshTheme().then(()=>{if(state.layer)action('account')});break;}}
let toastTimer;function toast(msg){node('toast').textContent=msg;node('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>node('toast').hidden=true,2500)}
let renderLock=false;function handleRoute(){if(renderLock)return;renderLock=true;try{render()}finally{renderLock=false}}
let treeTouchX=0,treeTouchY=0;
document.addEventListener('touchstart',e=>{const pane=e.target.closest('#passiveSwipe,#classSwipe');if(pane){treeTouchX=e.touches[0].clientX;treeTouchY=e.touches[0].clientY}},{passive:true});
document.addEventListener('touchend',e=>{const pane=e.target.closest('#passiveSwipe,#classSwipe');if(!pane||!e.changedTouches?.length)return;const x=e.changedTouches[0].clientX-treeTouchX,y=e.changedTouches[0].clientY-treeTouchY;if(Math.abs(x)>45&&Math.abs(x)>Math.abs(y)*1.35){if(pane.id==='passiveSwipe')passiveMove(x<0?1:-1);else classMove(x<0?1:-1)}},{passive:true});
function wireBuildIdentity(){
 const apply=e=>{
  const key=e.target?.dataset?.buildField;
  if(!['title','className','summary'].includes(key)||parseRoute().route!=='labs/build'||parseRoute().query.get('share')||parseRoute().query.get('build'))return;
  const b=ensureDraft();b[key]=String(e.target.value||'').slice(0,key==='summary'?350:100);
  if(key==='className'&&e.type==='change'){
   if(state.treeData?.classes?.length){
    const target=state.treeData.classes.find(cls=>cls.name===b.className);
    if(target){state.classAllocById[state.treeClassId||target.id]=state.classAlloc;state.treeClassId=target.id;state.treeBranchId=null;state.classAlloc=state.classAllocById[target.id]||{};state.classTierIndex=0;}
   }
   let removed=0;
   for(const [slot,raw] of Object.entries(b.equipment)){if(raw&&!allowedItem(raw,slot,b.className)){b.equipment[slot]=null;removed++;}}
   if(removed)toast(removed+' incompatible item(s) unequipped for '+b.className);
  }
  persistDraft();
  // Keep the editor focused while typing. Changing class redraws its emblem and legal gear.
  if(key==='className'&&e.type==='change')render();
 };
 document.addEventListener('input',apply);
 document.addEventListener('change',apply);
}
function wireStudioPortrait(){
 document.addEventListener('change',async e=>{
  const input=e.target;
  if(input?.id!=='studioPortraitUpload'||!input.files?.[0])return;
  const file=input.files[0];input.value='';
  if(parseRoute().route!=='labs/build'||parseRoute().query.get('share')||parseRoute().query.get('build'))return;
  try{await setStudioPortrait(file);render();toast('Build picture saved on this device');}
  catch(err){toast(err?.message||'Could not save your picture');}
 });
}
function centerPathRail(railId,attribute,value,behavior='auto'){
 const rail=node(railId),selected=rail?.querySelector('['+attribute+'="'+CSS.escape(String(value))+'"]');
 if(!rail||!selected)return;
 const distance=selected.offsetLeft-rail.offsetLeft-(rail.clientWidth-selected.clientWidth)/2;
 rail.scrollTo({left:Math.max(0,distance),behavior});
}
function refreshPathfinderStep(align=false){
 if(parseRoute().route!=='calculators/pathfinder'||!recipeState.data)return;
 const model=timelineModel(recipeState.data,state.pathfinderQuick);
 if(!model)return;
 state.pathfinderQuick=model.view;
 const previous=node('pathDetail');
 if(previous)previous.outerHTML=pathfinderStepDetail(model,verifiedState.entries);
 const input=node('pathStepRange');
 if(input){
  input.value=String(model.view.level);
  input.setAttribute('aria-valuetext',stageStepLabel(model.active,model.view.level));
  input.style.setProperty('--path-progress',String(model.active.max?Math.round(100*model.view.level/model.active.max):0)+'%');
 }
 const value=node('pathStepValue');
 if(value)value.textContent=model.view.level===0?'Transition':'+'+model.view.level;
 for(const button of document.querySelectorAll('#pathStepRail [data-path-step]')){
  const active=Number(button.dataset.pathStep)===model.view.level;
  button.classList.toggle('selected',active);
  button.setAttribute('aria-pressed',String(active));
 }
 if(align)centerPathRail('pathStepRail','data-path-step',model.view.level,'smooth');
}
function updatePathfinderQuick(update,redraw=false){
 state.pathfinderQuick=saveQuickView({...state.pathfinderQuick,...update});
 if(!redraw){refreshPathfinderStep(true);return;}
 const oldPage=node('content')?.querySelector('.pathPage');
 if(oldPage&&recipeState.data){
  const expanded=oldPage.querySelector('#pathRangePanel')?.open||false;
  const holder=document.createElement('template');
  holder.innerHTML=pathfinderView(state.pathfinderQuick,recipeState.data,recipeState.error,state.pathfinderRange,{includeRange:false,catalog:verifiedState.entries});
  const next=holder.content.firstElementChild;
  if(next){
   const panel=next.querySelector('#pathRangePanel');
   if(panel)panel.open=expanded;
   oldPage.replaceWith(next);
  }
 }else render();
 requestAnimationFrame(()=>{
  centerPathRail('pathStageRail','data-path-stage',state.pathfinderQuick.stage);
  centerPathRail('pathStepRail','data-path-step',state.pathfinderQuick.level);
 });
}
function pathfinderStage(stage){
 if(!recipeState.data)return;
 const allowed=timelineStages(recipeState.data,state.pathfinderQuick.mode);
 if(!allowed.some(s=>s.id===stage)||stage===state.pathfinderQuick.stage)return;
 updatePathfinderQuick({stage,level:1},true);
}
function movePathfinderStep(direction){
 if(!recipeState.data)return;
 const model=timelineModel(recipeState.data,state.pathfinderQuick);
 if(!model)return;
 const level=model.view.level+direction;
 if(level>=0&&level<=model.active.max){updatePathfinderQuick({level});return;}
 const index=model.stages.findIndex(s=>s.id===model.active.id),next=model.stages[index+(direction>0?1:-1)];
 if(next)updatePathfinderQuick({stage:next.id,level:direction>0?0:next.max},true);
}
async function savePathfinderChecklist(button){
 if(!recipeState.data)return toast('Verified upgrade recipes are unavailable.');
 if(!currentAccount()){toast('Sign in with Discord to save a checklist to your profile.');go('account');return;}
 const quote=quoteRange(recipeState.data,state.pathfinderRange,state.pathfinderQuick);
 if(!quote.complete||quote.error||!quote.materials.length)return toast('Select a valid complete upgrade route first.');
 const groups=sourceMaterialGroups(quote.materials,recipeState.data.materials,verifiedState.entries)
  .map(group=>({name:group.name,tier:group.tier,items:group.materials.map(m=>({slug:m.slug,name:m.name,quantity:String(m.quantity)}))}));
 const list={title:'Upgrade '+(quote.itemCount>1?quote.itemCount+' items · ':'')+quote.range.fromStage+' +'+quote.range.fromLevel+' → '+quote.range.toStage+' +'+quote.range.toLevel,
  slot:state.pathfinderQuick.slot,from:quote.range.fromStage+' +'+quote.range.fromLevel,
  to:quote.range.toStage+' +'+quote.range.toLevel,gold:String(quote.gold),
  sourceVersion:String(recipeState.data.sourceVersion||recipeState.data.source||''),groups};
 button.disabled=true;button.textContent='Saving to profile…';
 try{await saveFarmingList(list);toast('Farming checklist saved to your account.');go('account');}
 catch(error){toast(error.message);button.disabled=false;button.textContent='Save a farming checklist to my profile';}
}
function wirePathfinderQuick(){
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-path-quantity-step]');
  if(!button||!recipeState.data)return;
  const offset=Number(button.dataset.pathQuantityStep);
  if(offset!==1&&offset!==-1)return;
  const quantity=normalizeItemQuantity(normalizeItemQuantity(state.pathfinderRange.quantity)+offset);
  state.pathfinderRange=saveRange({...state.pathfinderRange,quantity});
  const content=node('pathRangeContent');
  if(content)content.innerHTML=quickUpgradeContent(recipeState.data,state.pathfinderRange,{page:parseRoute().route!=='home',catalog:verifiedState.entries});
 });
 document.addEventListener('click',e=>{const button=e.target.closest('[data-pf-save-list]');if(!button)return;e.preventDefault();if(!button.disabled)void savePathfinderChecklist(button);});
 document.addEventListener('input',e=>{
  if(!e.target.matches('[data-path-range]'))return;
  const value=Number(e.target.value);
  if(!Number.isInteger(value))return;
  state.pathfinderQuick={...state.pathfinderQuick,level:value};
  refreshPathfinderStep(false);
 });
 document.addEventListener('change',e=>{
  if(e.target.matches('[data-path-range]')){state.pathfinderQuick=saveQuickView(state.pathfinderQuick);centerPathRail('pathStepRail','data-path-step',state.pathfinderQuick.level,'smooth');return;}
  const d=e.target.dataset;
  if(recipeState.data&&(d.pathFromStage!==undefined||d.pathFromLevel!==undefined||d.pathToStage!==undefined||d.pathToLevel!==undefined||d.pathQuantity!==undefined)){
   const stages=allStages(recipeState.data);
   const current={...state.pathfinderRange};
   if(d.pathFromStage!==undefined){current.fromStage=e.target.value;current.fromLevel=Math.min(Number(current.fromLevel||0),stages.find(s=>s.id===current.fromStage)?.max||0);}
   else if(d.pathToStage!==undefined){
    current.toStage=e.target.value;
    current.toLevel=Math.min(Number(current.toLevel||0),stages.find(s=>s.id===current.toStage)?.max||0);
   }else if(d.pathFromLevel!==undefined)current.fromLevel=Number(e.target.value);
   else if(d.pathToLevel!==undefined)current.toLevel=Number(e.target.value);
   else if(d.pathQuantity!==undefined)current.quantity=normalizeItemQuantity(e.target.value);
   state.pathfinderRange=saveRange(current);
   const content=node('pathRangeContent');
   if(content)content.innerHTML=quickUpgradeContent(recipeState.data,current,{page:parseRoute().route!=='home',catalog:verifiedState.entries});
   return;
  }
  if(e.target.matches('[data-path-slot]')){
   updatePathfinderQuick({slot:e.target.value},true);
  }
  if(e.target.matches('[data-path-range-slot]'))state.pathfinderQuick=saveQuickView({...state.pathfinderQuick,slot:e.target.value});
 });
 // Scroll snapping also selects the nearest visible step or tier. No heavy
 // rerender happens while a finger is actively dragging the map.
 let scrollTimer=null;
 document.addEventListener('scroll',e=>{
  const rail=e.target;
  if(rail?.id!=='pathStageRail'&&rail?.id!=='pathStepRail')return;
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{
   if(!rail.isConnected||parseRoute().route!=='calculators/pathfinder')return;
   const field=rail.id==='pathStageRail'?'pathStage':'pathStep';
   const center=rail.getBoundingClientRect().left+rail.clientWidth/2;
   const choices=[...rail.querySelectorAll('[data-'+(field==='pathStage'?'path-stage':'path-step')+']')];
   const nearest=choices.sort((a,b)=>{
    const midpoint=x=>x.getBoundingClientRect().left+x.getBoundingClientRect().width/2;
    return Math.abs(midpoint(a)-center)-Math.abs(midpoint(b)-center);
   })[0];
   if(!nearest)return;
   if(field==='pathStage')pathfinderStage(nearest.dataset.pathStage);
   else {
    const level=Number(nearest.dataset.pathStep);
    if(level!==state.pathfinderQuick.level)updatePathfinderQuick({level});
   }
  },200);
 },true);
}

function wireThemeStudioControls(){
 document.addEventListener('click',e=>{
  const heroChoice=e.target.closest('[data-hero-cta-style]');
  if(heroChoice&&heroChoice.closest('.arcanaDesignLab')){
   if(!canEditThemeDraft())return;
   if(writeDesign('heroActionStyle',heroChoice.dataset.heroCtaStyle)){
    showDesignMiniPage('home');
    applyTheme(parseRoute().route);
    syncWorkshopInputs();
   }
   return;
  }
  const pattern=e.target.closest('[data-theme-pattern]');
  if(pattern&&pattern.closest('.arcanaDesignLab')){
   if(!canEditThemeDraft())return;
   if(writeDesign('pattern',pattern.dataset.themePattern)){
    applyTheme(parseRoute().route);
    syncWorkshopInputs();
   }
   return;
  }
  const contrastFix=e.target.closest('[data-mini-fix-contrast]');
  if(contrastFix&&contrastFix.closest('.themeStudioPreview')&&canEditThemeDraft()){
   if(writeDesign('buttonText',suggestedButtonText(readDesign()))){
    applyTheme(parseRoute().route);
    syncWorkshopInputs();
    toast('Button text adjusted in your private draft. Nothing was published.');
   }
   return;
  }
  const showAll=e.target.closest('[data-theme-preset-expand]');if(showAll){const wrap=showAll.closest('.themePresetCollection');const expanded=wrap.dataset.showAll!=='true';wrap.dataset.showAll=String(expanded);showAll.setAttribute('aria-expanded',String(expanded));showAll.textContent=expanded?'Show fewer presets ↑':'Show all 42 presets ↓';return;}
   const jump=e.target.closest('[data-theme-jump]');
  if(jump&&jump.closest('.arcanaDesignLab')){
   const pane=jump.closest('.themeStudioEditor');
   const id=jump.dataset.themeJump;
   const target=id==='vault'?pane.querySelector('.themeVaultSection'):pane.querySelector('[data-theme-group="'+id+'"]');
   if(target){
    if(target.tagName==='DETAILS')target.open=true;
    target.scrollIntoView({behavior:document.documentElement.dataset.launchReduceMotion==='true'?'auto':'smooth',block:'start'});
   }
   return;
  }
  const filter=e.target.closest('[data-theme-pattern-filter]');
  if(filter&&filter.closest('.arcanaDesignLab')){
   const category=filter.dataset.themePatternFilter;
   const section=filter.closest('.themePatternLibrary');
   for(const button of section.querySelectorAll('[data-theme-pattern-filter]'))button.setAttribute('aria-pressed',String(button===filter));
   for(const tile of section.querySelectorAll('[data-pattern-category]'))tile.hidden=category==='Premium'?!['Psychedelic','Signature','Material','Atmosphere','Relic'].includes(tile.dataset.patternCategory):category!=='All'&&tile.dataset.patternCategory!==category;
  }
 });
}
function init(){wireDesignMiniPreview();wireThemeStudioControls();wireThemeVault({toast,onLoad:()=>{applyTheme(parseRoute().route);syncWorkshopInputs();}});document.addEventListener('click',e=>{
 const summary=e.target.closest('details[data-home-panel] > summary');
 if(!summary)return;
 const group=summary.parentElement,key=group.dataset.homePanel;
 if(Object.prototype.hasOwnProperty.call(homePanels,key))homePanels[key]=!group.open;
});wireBuildIdentity();wireStudioPortrait();wirePathfinderQuick();wireFarmingLists({refresh:render,toast});wireWikiStudio();wireBetaUI({go,refresh:render,toast});wireAdminTraffic({refresh:render});wireAdminConsole({refresh:render,toast});initTrafficTracking();wireGuildHub({go,refresh:render,toast,currentAccount});wireCommunityUI({go,getBuild:savedBuild,applyBuild:input=>{state.draft=normalizeBuild(deepCopy(input));state.draft.id='local-draft';state.draft.version='LOCAL';persistDraft();},refresh:render,toast});if(state.draft)state.draft=normalizeBuild(state.draft);restoreTreePlan();initTheme();applyAppPrefs();document.querySelectorAll('#arcanaDock [data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon,24)});initGeneralChat(currentAccount);document.addEventListener('input',e=>{if(e.target.matches('[data-design-preset-search]')){const term=e.target.value.toLowerCase().trim();for(const preset of document.querySelectorAll('.arcanaDesignLab .designPreset'))preset.hidden=!String(preset.dataset.presetSearch||'').includes(term);const classics=document.querySelector('.designClassicCollection');if(classics&&term)classics.open=[...classics.querySelectorAll('.designPreset')].some(e=>!e.hidden);const empty=document.querySelector('[data-design-no-presets]');if(empty)empty.hidden=[...document.querySelectorAll('.arcanaDesignLab .designPreset')].some(e=>!e.hidden);const block=document.querySelector('.themePresetCollection');if(block)block.dataset.searching=String(Boolean(term));return;}if(e.target.matches('[data-design-hex]')){if(!canEditThemeDraft())return;const key=e.target.dataset.designHex,hex=normalizeDesignHex(e.target.value),status=document.querySelector('[data-design-status="'+key+'"]');if(hex&&writeDesign(key,hex)){e.target.value=hex;e.target.removeAttribute('aria-invalid');const picker=document.querySelector('input[type="color"][data-design-field="'+key+'"]');if(picker)picker.value=hex;if(status)status.textContent='Applied ✓';}else if(status)status.textContent='Enter 6 HEX digits';return;}if(e.target.matches('[data-design-field]')){if(!canEditThemeDraft())return;const key=e.target.dataset.designField,value=e.target.value;if(writeDesign(key,value)){const note=document.querySelector('[data-theme-change-hint]');if(note){const descriptions={main:'Page background',card:'Cards and panels',action:'Primary links and actions',secondaryAccent:'Secondary highlights',pattern:'Surface material',patternScale:'Size of repeating details',patternTarget:'Which surfaces receive the texture',intensity:'Visibility of the material',glow:'Glow around accents',heroActionStyle:'Build Studio entrance button only',heroCardStyle:'Homepage Build Studio card only',roundness:'Corners on all cards',buttonStyle:'Shared button appearance',fontSize:'Global text scale'};const label=e.target.closest('label,.designControl')?.querySelector('span')?.textContent||key;note.innerHTML='<strong>'+esc(label)+' updated</strong><span>'+esc(descriptions[key]||'Check the current page preview to see the effect.')+'</span>';}if(e.target.closest('[data-theme-group="feature"]'))showDesignMiniPage('home');const out=document.querySelector('[data-design-value="'+key+'"]');if(out)out.textContent=value+(e.target.type==='range'?(['roundness','buttonRoundness','cardPadding','borderWidth','buttonHeight','heroActionHeight','heroActionBorder'].includes(key)?' px':'%'):'');if(e.target.type==='color'){const textInput=document.querySelector('[data-design-hex="'+key+'"]');if(textInput){textInput.value=value.toUpperCase();textInput.removeAttribute('aria-invalid');}const status=document.querySelector('[data-design-status="'+key+'"]');if(status)status.textContent='Applied ✓';}}}if(e.target.id==='arcanaCustomAccentPicker'){const field=node('arcanaCustomAccentHex');if(field)field.value=e.target.value.toUpperCase()}});node('brandHome').onclick=()=>go('home');node('accountBtn').onclick=()=>go('user');node('adminPortalBtn').innerHTML=icon('shield',23);syncAdminPortal();void refreshAccount().then(()=>{document.documentElement.dataset.arcanaAdminDesign=String(canEditThemeDraft());if(!isAppearanceAdmin()){setAccent('site');setIconColor('follow-site');setIconMode('two-tone');}renderHeaderAvatar();if(['user','settings','admin','admin/traffic','account'].includes(parseRoute().route))render();else applyTheme(parseRoute().route);});window.addEventListener('arcana:account-updated',renderHeaderAvatar);window.addEventListener('arcana:site-config-change',()=>{if(!document.hidden)render()});document.addEventListener('click',e=>{if(e.target.closest('[data-close]')){closeLayer();return}const preview=e.target.closest('[data-preview]');if(preview){state.lastSearch=state.search;showPreview(preview.dataset.preview,!!state.layer&&state.layer.type==='search');return}const routed=e.target.closest('[data-route]');if(routed){const pars=Object.fromEntries(new URLSearchParams(routed.dataset.params||''));go(routed.dataset.route,pars);return}const act=e.target.closest('[data-action]');if(act)action(act.dataset.action,act.dataset.arg||'',act);});document.addEventListener('input',e=>{if(e.target.id==='treeLevel'||e.target.id==='treeLevelRange')previewTreeLevel(e.target.value);if(e.target.hasAttribute('data-monster-slider')){const input=node('content').querySelector('[data-monster-level]');if(input)input.value=e.target.value;}if(e.target.id==='guildQuery'){guildState.query=e.target.value;const list=guildFilter(guildState.guilds,guildState.query),box=node('guildCards');if(box)box.innerHTML=list.map(guildCard).join('')||'<div class="lfgEmpty">No matching guilds right now.</div>';const counter=node('guildCount');if(counter)counter.textContent=String(list.length);}if(e.target.id==='lfgQuery'){lfgState.query=e.target.value;updateLiveResults();}if(e.target.id==='lfgMight'){lfgState.mightAmount=e.target.value;updateLiveResults();}if(e.target.id==='globalSearch'){state.search=e.target.value;state.lastSearch=state.search;const box=node('searchResults');if(box)box.innerHTML=state.search.trim()?resultMarkup(state.search):searchFeatured();}if(e.target.id==='gearPickerQuery'){const box=node('gearPickerItems');if(box)box.innerHTML=pickerOptions(state.slotTarget?.kind,state.slotTarget?.slot,e.target.value);}if(e.target.id==='wikiFilter'){wikiState.query=e.target.value;wikiState.limit=36;const result=wikiRecordRows(verifiedState.entries,parseRoute().query.get('kind')||'all',wikiState.query,wikiState.limit),list=node('wikiRecords'),counter=node('wikiFoundCount'),more=node('wikiMore'),showing=node('wikiShowing'),clear=node('content').querySelector('.wikiClearFilter');if(list)list.innerHTML=result.html;if(counter)counter.textContent=result.count+' '+(result.count===1?'reference':'references');if(showing)showing.textContent=result.count?'Showing '+Math.min(result.count,wikiState.limit)+' of '+result.count:'Season 2 reference library';if(clear)clear.hidden=!wikiState.query;if(more)more.hidden=!result.hasMore;}if(e.target.id==='itemFilter'){const q=e.target.value.toLowerCase();node('itemResults').innerHTML=itemList.filter(x=>(x.title+' '+x.keywords).toLowerCase().includes(q)).map(cardEntity).join('')||'<p class="emptyMini">No matching item.</p>'}if(e.target.dataset.petLevel!==undefined){const i=+e.target.dataset.petLevel,n=Math.max(0,Number(e.target.value)||0);state.petLevels[i]=n;const cap=Math.min(...state.petLevels)+10;const el=node('petEffective');if(el){el.textContent=cap;el.nextElementSibling.textContent='Minimum '+Math.min(...state.petLevels)+' + 10'}}});document.addEventListener('change',e=>{
 if(e.target.matches('[data-design-hex]')){if(!isAppearanceAdmin())return;const key=e.target.dataset.designHex,hex=normalizeDesignHex(e.target.value),status=document.querySelector('[data-design-status="'+key+'"]');if(!hex){e.target.setAttribute('aria-invalid','true');if(status)status.textContent='Use 6 HEX digits, e.g. #A78BFA';}else{e.target.value=hex;e.target.removeAttribute('aria-invalid');if(status)status.textContent='Applied ✓';}return;}
 if(e.target.hasAttribute('data-app-pref')){changeAppPref(e.target.dataset.appPref,e.target.checked);return;}
 if(e.target.matches('[data-passive-free-mode]')){state.passiveFreeMode=e.target.checked===true;storeTreePlan();render();return;}
 const field=e.target.dataset.gearField;
 if(field&&state.gearEdit){
  const g=state.gearEdit;
  if(field==='rarity'){g.rarity=Number(e.target.value);g.awaken=0;g.bonusTier=Math.max(2,g.rarity);g.bonusId=null;g.roll=null;}
  if(field==='awaken')g.awaken=Number(e.target.value);
  if(field==='bonusTier'){g.bonusTier=Number(e.target.value);g.bonusId=null;g.roll=null;}
  if(field==='bonusId'){g.bonusId=e.target.value||null;g.roll=null;}
  if(field==='roll')g.roll=e.target.value===''?null:Number(e.target.value);
  if(field!=='roll')showGearEditor();
  return;
 }
 if(e.target.hasAttribute('data-farm-mode')){state.farmPlan=saveFarmPlan({...state.farmPlan,mode:e.target.value});render();return;}
 if(e.target.hasAttribute('data-farm-time')){const index=Number(e.target.dataset.farmTime);if(Number.isInteger(index)&&index>=0&&index<3){const times=[...state.farmPlan.times];times[index]=e.target.value;state.farmPlan=saveFarmPlan({...state.farmPlan,times});render();}return;}
 if(e.target.id==='guildTreeLevel'){updateGuildTree(guildTreeWithLevel(state.guildTreePlan,e.target.value));return;}
 if(e.target.id==='guildTreeBoost'){updateGuildTree({...state.guildTreePlan,boost:Number(e.target.value)});return;}

 if(e.target.dataset.petBonusTarget!==undefined){
  if(parseRoute().query.get('build'))return;
  const i=Number(e.target.dataset.petBonusTarget),v=e.target.value;
  if(!Number.isInteger(i)||i<0||i>3||v&&!PET_HATCH_BONUSES.includes(v))return;
  const b=ensureDraft();b.petBonusTargets[i]=v;persistDraft();
  const counter=node('content').querySelector('.petBuildHead small');
  if(counter)counter.textContent=b.petBonusTargets.filter(Boolean).length+'/4 selected';
  return;
 }
 if(e.target.id==='petCompoundRarity'){
  state.compoundQuick=saveCompoundPlan({...state.compoundQuick,rarity:e.target.value});render();return;
 }
 if(e.target.id==='petCompoundBonus'){
  state.compoundQuick=saveCompoundPlan({...state.compoundQuick,bonus:e.target.value});render();return;
 }
 if(e.target.id==='petCompoundLevel'){
  state.compoundQuick=saveCompoundPlan({...state.compoundQuick,level:e.target.value});render();return;
 }
 if(e.target.id==='petAffixType'){
  state.affixCostQuick=saveAffixCostPlan({affix:e.target.value,currentLevel:1,targetLevel:e.target.value==='all_skills'?2:1});render();return;
 }
 if(e.target.id==='petAffixCurrent'){
  state.affixCostQuick=saveAffixCostPlan({...state.affixCostQuick,currentLevel:e.target.value});render();return;
 }
 if(e.target.id==='petAffixTarget'){
  state.affixCostQuick=saveAffixCostPlan({...state.affixCostQuick,targetLevel:e.target.value});render();return;
 }
 if(e.target.id==='lfgTier'){lfgState.tier=e.target.value;updateLiveResults();return;}if(e.target.id==='lfgClass'){lfgState.characterClass=e.target.value;updateLiveResults();return;}if(e.target.id==='lfgUnit'){lfgState.mightUnit=e.target.value;updateLiveResults();return;}if(e.target.hasAttribute('data-calc-compound')){const idx=Number(e.target.dataset.calcCompound);if(idx>=0&&idx<4){state.petLevels[idx]=Math.max(0,Math.min(999,Math.floor(Number(e.target.value)||0)));render();}return;}if(e.target.matches('[data-monster-level],[data-monster-slider]')){if(parseRoute().query.get('build'))return;const b=ensureDraft(),raw=Number(e.target.value);if(!Number.isFinite(raw)||raw<1){toast('Monster Level must be at least 1');render();return;}b.monsterLevel=Math.min(100000,Math.floor(raw));const hidden=activeRuneBoard(b.runeBoard,b.monsterLevel).inactive.length;state.runeSelected=null;persistDraft();render();if(hidden)toast(`${hidden} saved rune(s) inactive at this Monster Level`);return;}if(e.target.id==='treeLevel'||e.target.id==='treeLevelRange')commitTreeLevel(e.target.value);if(e.target.hasAttribute('data-rune-secondary')){const val=e.target.value;if(!RUNE_SECONDARIES.includes(val))return;state.runeSecondary=val;if(state.runeSelected){mutateRunes(b=>{const r=b.runeBoard.find(x=>x.id===state.runeSelected);if(r)r.secondary=val;});}else render();}
const petKeys=['petCompound','petAffix','petAffixLevel','petUnlocked','petHatch','petName','petEquipped','petDrop'];if(petKeys.some(k=>e.target.dataset[k]!==undefined)){
 if(parseRoute().query.get('build'))return;
 const key=petKeys.find(k=>e.target.dataset[k]!==undefined),raw=e.target.dataset[key];const [idx,affixIdx]=raw.split(':').map(Number),b=ensureDraft(),p=b.petSetup[idx];if(!p)return;
 if(key==='petCompound')p.compound=Math.min(999,Math.max(0,Math.floor(Number(e.target.value)||0)));
 else if(key==='petAffix'){const def=PET_AFFIX_DEFS.find(v=>v.name===e.target.value);p.affixes[affixIdx]={slug:def?.name||'',level:def?1:0};}
 else if(key==='petAffixLevel'){const aff=p.affixes[affixIdx],def=PET_AFFIX_DEFS.find(v=>v.name===aff?.slug);if(def)aff.level=Math.max(1,Math.min(Number.isFinite(def.max_level)?def.max_level:999,Math.floor(Number(e.target.value)||1)));}
 else if(key==='petUnlocked'){p.unlockedAffixSlots=Math.max(2,Math.min(4,Math.floor(Number(e.target.value)||2)));}
 else if(key==='petHatch')p.hatchBonus=e.target.value;
 else if(key==='petName')p.name=e.target.value.slice(0,90);
 else if(key==='petDrop'){const val=e.target.value.trim();p.dropBonus=val===''?null:(Number.isFinite(Number(val))&&Number(val)>=0?Math.min(100000000,Number(val)):null);}
 else if(key==='petEquipped')p.equipped=e.target.checked;
 if(key!=='petEquipped'&&key!=='petDrop'&&e.target.value&&!(key==='petCompound'&&Number(e.target.value)===0))p.equipped=true;
 if(key==='petDrop'&&e.target.value.trim()!=='')p.equipped=true;
 persistDraft();render();
 }});document.addEventListener('submit',e=>{if(e.target.id==='guildForm'){e.preventDefault();void guildSave(e.target)}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.layer)closeLayer();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();showSearch()}});window.addEventListener('arcana:assets-loaded',()=>{if(parseRoute().route==='calculators/pathfinder')return;if(!state.layer)render();else if(state.layer.type==='search'){node('searchResults').innerHTML=state.search?resultMarkup(state.search):searchFeatured()}});window.addEventListener('arcana:navigate',handleRoute);window.addEventListener('popstate',handleRoute);window.addEventListener('hashchange',handleRoute);if(!location.hash)history.replaceState(null,'','#/home');render();}
init();
void initGameAssets();
void loadTrees();
// Fetch raids and guild lists only when visiting those sections.
void loadVerifiedIndex();
void loadPublishedWikiArticles();
window.addEventListener('arcana:wiki-published',()=>void loadPublishedWikiArticles());
