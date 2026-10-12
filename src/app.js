import {entities,entityById,itemList,guideList,demoBuilds,demoGuideSections,searchCatalog} from './catalog.js';
import {loadDraft,saveDraft,deepCopy,remember,loadRecent} from './session.js';
import {navigate,parseRoute,navigateBack} from './routing.js';
import {esc,icon,boxIcon,chip,button,cardEntity} from './ui.js';
import {ADMIN_URL,initTheme,applyTheme,themeStatus,refreshTheme} from './theme.js';
import {gameArt,initGameAssets,loadStatus,canonicalArtReference} from './assets.js';
import {TREE_DATA_URL,normalizeTree,getClass,getBranch,passiveAllowed,classAllowed,allocatedTotal,passivePointBudget,classPointBudget,passiveTierSpend} from './tree-engine.js';
import {LOADOUT_LAYOUT,boardSwitch,buildLoadout,passiveBoard,classBoard,activePassiveNode,activeClassSkill,passivePageCount,skillTierGroups} from './core-boards.js';
import {passiveTitle} from './tree-art.js';
import {normalizeBuild,putRune,removeRune,nextRuneId,petSummary,RUNE_SHAPES,RUNE_FAMILIES,RUNE_FAMILY_DETAILS,RUNE_SECONDARIES,PET_AFFIX_DEFS,statName,runeIssue,monsterLevelGrid,activeRuneBoard} from './labs-engine.js';
import {labsTabs,runeGridView,runeOptionsUI,petLoadoutView,petCompoundCalculatorView,buildOverviewV7} from './labs-views.js';
import {normalizePublicFeed,lfgSearchEntries,rankSearch,lfgFilter,guildActivity,lfgDeepLink} from './lfg-core.js';
import {lfgScreen,lfgDetail,lfgCard} from './lfg-views.js';
import {verifiedGameSearchEntries,mergedSearch} from './verified-search.js';
import {normalizeGuild,guildEntries,guildFilter,saveGuildOwner,readGuildOwner} from './guild-core.js';
import {guildDirectory,guildDetail,guildForm,guildCard} from './guild-views.js';
import {WIKI_ARTICLES,wikiArticleById,wikiArticleEntries,setPublishedWikiArticles} from './wiki-data.js';
import {wikiStudioView,mountWikiStudio,wireWikiStudio} from './wiki-studio.js';
import {wikiLandingView,wikiLibraryView,wikiGuidesView,wikiArticleView,wikiRecordView,wikiRecordRows} from './wiki-views.js';
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

const $=s=>document.querySelector(s);const node=id=>document.getElementById(id);
const state={treeData:null,treeStatus:'loading',treeClassId:null,treeBranchId:null,passiveTier:0,passivePage:0,classTierIndex:0,characterLevel:1,passiveAlloc:{},classAlloc:{},classAllocById:{},layer:null,search:'',lastSearch:'',recent:loadRecent(),draft:loadDraft(),compareLeft:null,compareRight:null,compareTier:1,runeIndex:0,runeFamily:'Fury',runeSecondary:'critical_damage',runeShape:'small',runeSelected:null,runeHistory:[],petLevels:[0,0,0,0],petCalcMode:'seasonal',petAffixPlan:readPetAffixPlan(),compoundQuick:readCompoundPlan(),affixCostQuick:readAffixCostPlan(),slotTarget:null,returnTo:null,guildTreePlan:readGuildTree(),guildTreeTab:'vanguard',guildTreeLinkKey:'',guildUndo:[],guildRedo:[],guildBaseline:readGuildBaseline(),farmPlan:readFarmPlan()};
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
async function loadVerifiedIndex(){if(verifiedState.loading||verifiedState.loaded)return;verifiedState.loading=true;try{const r=await fetch('/api/search/catalog',{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Search index '+r.status);verifiedState.entries=verifiedGameSearchEntries(await r.json());verifiedState.loaded=true;verifiedState.error='';}catch(e){verifiedState.error='Game index temporarily unavailable';console.warn(e)}finally{verifiedState.loading=false;if(state.layer?.type==='search')refreshLiveSearch();if(parseRoute().route.startsWith('wiki')||parseRoute().route==='reference/detail')render()}}
async function loadGuilds(force=false){if(guildState.loading||(!force&&guildState.updatedAt&&Date.now()-guildState.updatedAt<30000))return;guildState.loading=true;try{const r=await fetch(V11_GUILD_ENDPOINT,{signal:AbortSignal.timeout(9000),cache:'no-store'});if(!r.ok)throw Error('Guild directory '+r.status);const d=await r.json();guildState.guilds=(d.guilds||[]).map(normalizeGuild).filter(Boolean);guildState.loaded=true;guildState.error='';}catch(e){guildState.error='Guild listings temporarily unavailable';console.warn(e)}finally{guildState.updatedAt=Date.now();guildState.loading=false;if(parseRoute().route.startsWith('lfg/guild'))render();if(state.layer?.type==='search')refreshLiveSearch()}}
const lfgState={listings:[],plans:[],loaded:false,loading:false,error:'',updatedAt:0,tab:'active',query:'',tier:'',characterClass:'',mightAmount:'',mightUnit:'M'};
const allLfg=()=>[...lfgState.listings,...lfgState.plans];
const lfgDynamic=()=>lfgSearchEntries(allLfg());
const lfgSearchable=()=>[...searchExtras(),...lfgDynamic()];
const lfgById=id=>lfgDynamic().find(e=>e.id===id);
async function loadPublicLfg(force=false){if(lfgState.loading||(!force&&lfgState.updatedAt&&Date.now()-lfgState.updatedAt<30000))return; lfgState.loading=true; lfgState.error='';try{const r=await fetch('/api/lfg/public',{cache:'no-store',signal:AbortSignal.timeout(9500)});if(!r.ok)throw Error('HTTP '+r.status);const payload=await r.json(),data=normalizePublicFeed(payload);lfgState.error=(payload.issues?.length?('Some '+payload.issues.join(', ')+' are currently unavailable'):'');lfgState.listings=data.listings;lfgState.plans=data.plans;lfgState.loaded=true;lfgState.updatedAt=Date.now();}catch(e){lfgState.error='Live listings temporarily unavailable';console.warn('LFG feed',e.message)}finally{lfgState.updatedAt=Date.now();lfgState.loading=false;const route=parseRoute().route;if(route.startsWith('lfg/raids')||route==='lfg/listing')render();if(state.layer?.type==='search')refreshLiveSearch();}}
const LINKS=[['home','Home','home'],['calculators','Calculators','calculator'],['labs','Arcana Labs','flask'],['lfg','ArcanaLFG','users'],['wiki','ArcanaWiki','book']];
const BUILD_SLOTS=LOADOUT_LAYOUT.map(x=>[x.key,x.label]);
const item=id=>entityById.get(id)||(verifiedState.entries.find(e=>e.id===id&&e.gameKind==='item')?(()=>{const x=verifiedState.entries.find(e=>e.id===id);const kind=String(x.slot||'').toLowerCase();const slot={main_hand:'weapon',off_hand:'offhand',head:'head',chest:'chest',hands:'hands',feet:'feet',belt:'belt',ring:'ring',amulet:'neck',necklace:'neck',torch:'torch'}[kind]||null;return {...x,kind:'item',slot,subtitle:'Equipment · '+(x.description||''),verified:true}})():null);const buildTemplate=id=>demoBuilds[id];
const savedBuild=()=>state.draft&&state.draft.equipment?normalizeBuild(state.draft):null;
function ensureDraft(){if(!state.draft){const tmpl=buildTemplate('warrior-retaliation-demo');state.draft=normalizeBuild(deepCopy(tmpl));state.draft.title='My Build Draft';state.draft.id='local-draft';state.draft.version='LOCAL';}else state.draft=normalizeBuild(state.draft);return state.draft;}
function persistDraft(){if(state.draft){state.draft=normalizeBuild(state.draft);saveDraft(state.draft)}}
const SEARCHABLE_TOOLS=['items','guides','upgrade','compare','build','runes','skills','passives','petlab','compound','affixes','guildtree','guilds','raids','farm'];
const TOOL_SEARCH_ALIASES={
 items:'item codex art equipment weapons',guides:'wiki player guide article',
 upgrade:'item upgrade calculator forge materials',compare:'item comparison equipment stats',
 build:'build studio character loadout planner',runes:'rune forge grid placement',
 skills:'class skill tree planner',passives:'passive skill tree planner',
 petlab:'pet lab pet loadout companion',compound:'pet compound calculator equalisation',
 affixes:'pet affix cost calculator shard',guildtree:'guild skill tree planner guild bonuses',
 guilds:'guild finder recruitment',raids:'lfg raid finder',farm:'monster level xp farm comparator fastest kills per second ml xp'
};
const searchExtras=()=>[
 ...(savedBuild()?[{id:'my-build',kind:'build',title:state.draft.title||'My Build',subtitle:'Saved locally · Build Studio',keywords:'my build custom saved planner equipment runes skills',description:'Your locally saved build.'}]:[]),
 ...SEARCHABLE_TOOLS.map(key=>{
  const destination=NAV_DESTINATIONS[key];
  return {id:'arcana-tool:'+key,kind:'tool',title:destination.label,subtitle:'Arcana · '+destination.detail,keywords:key+' '+(TOOL_SEARCH_ALIASES[key]||'')+' '+destination.label+' '+destination.detail,description:destination.detail,route:destination.route+(destination.params?'?'+new URLSearchParams(destination.params):'')};
 })
];
function track(id){if(!id)return;state.recent=remember(id)}
function crumbTrail(title){
 const route=parseRoute().route,section=route.split('/')[0];
 const parent={labs:['Arcana Labs','labs'],calculators:['Calculators','calculators'],lfg:['ArcanaLFG','lfg'],wiki:['ArcanaWiki','wiki']}[section];
 if(!parent||route===parent[1])return '';
 return `<nav class="arcanaCrumbs" aria-label="Breadcrumbs"><button data-route="home">Home</button><span aria-hidden="true">›</span><button data-route="${parent[1]}">${parent[0]}</button><span aria-hidden="true">›</span><span aria-current="page">${esc(title)}</span></nav>`;
}
function layout(title,kicker,inner,mark='gem'){
 return `${crumbTrail(title)}<div class="pageHead"><button class="backLink" data-action="back">${icon('back',17)} Back</button><div class="pageHeadline"><span class="pageIcon">${icon(mark,24)}</span><div><span class="eyebrow">${esc(kicker)}</span><h1>${esc(title)}</h1></div></div></div>${inner}`;
}
function portal(route,title,desc,tag,symbol,number){return `<button class="portal" data-route="${esc(route)}"><span class="portalTop"><span class="glyph">${icon(symbol,24)}</span><span class="serial">${number}</span></span><span><h2>${esc(title)}</h2><p>${esc(desc)}</p></span><span class="portalFoot">${esc(tag)}<span>${icon('arrow',16)}</span></span></button>`}
function home(){const rec=state.recent.map(x=>entityById.get(x)).filter(Boolean).slice(0,3);
 return `<section class="hero"><span class="eyebrow">IDLEARC COMPANION <i>·</i> ARCANA</span><h1>Everything connected.<br><em>Nothing in your way.</em></h1><p>Find an item. Understand a mechanic. Inspect a build. Continue straight into the tools that matter.</p><span class="heroFacet" aria-hidden="true">${icon('gem',38)}</span></section>
 ${resumableWorkspaces({draft:savedBuild(),guild:state.guildTreePlan,compound:state.compoundQuick,affix:state.affixCostQuick,farm:state.farmPlan,recent:state.recent.map(id=>id.startsWith('wiki:article:')?wikiArticleById(id.slice(13)):null).filter(Boolean)})}
 ${homeStart()}
 <div class="sectionLabel"><div><span class="eyebrow">BUILD & PLAN</span><h2>Your workspaces</h2></div><small>One connected ecosystem</small></div>
 <section class="portalGrid">${portal('calculators','Calculators','Upgrade costs, pet planning, and useful numbers.','Upgrade costs · Pet compounds','calculator','01')}${portal('labs','Arcana Labs','Build Studio, Rune Forge, and skill planning.','Build Studio · Rune Forge','flask','02')}</section>
 <div class="sectionLabel"><div><span class="eyebrow">COMMUNITY & KNOWLEDGE</span><h2>Discover more</h2></div></div>
 <section class="featureGrid"><button class="feature" data-route="lfg"><span class="featureIcon">${icon('users')}</span><strong>ArcanaLFG</strong><p>Find raid crews and browse guilds.</p><span>Raid finder & guilds ${icon('arrow',14)}</span></button><button class="feature" data-route="wiki"><span class="featureIcon">${icon('book')}</span><strong>ArcanaWiki</strong><p>Items, mechanics, and interactive guides.</p><span>Codex & guides ${icon('arrow',14)}</span></button></section>
 <section class="connectedFeature"><div><span class="eyebrow">SEE WHAT MAKES ARCANA DIFFERENT</span><h3>A guide you can actually use.</h3><p>Read a complete demonstration build and inspect its equipment, runes, skill focus, and pets directly in Build Studio.</p><button class="btn primary" data-route="wiki/guide" data-params="id=warrior-retaliation-demo-guide">${icon('book',17)} Open connected guide ${icon('arrow',15)}</button></div><span class="glowingMark" aria-hidden="true">${icon('link',35)}</span></section>
 ${rec.length?`<section class="recentPanel"><div class="sectionLabel compact"><div><span class="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recently viewed</h2></div></div><div class="recentList">${rec.map(cardEntity).join('')}</div></section>`:''}
`;
}
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
function calculators(){return layout('Calculators','ARCANA',`<p class="lead">Costs and progression tools. Choose a calculation, then follow linked items or game mechanics without starting over.</p><div class="cardGrid">${tile('Upgrade Cost Calculator','calculators/upgrade','Equipment-to-calculator handoff, with a selected item.','calculator')}${tile('Pet Compound Calculator','calculators/pet','See what Compound Level does to every rarity-based Drop Bonus.','paw')}${tile('Pet Affix Cost','calculators/affixes','Calculate Pet Shards from current to target affix level.','sliders')}${tile('Compare Equipment','calculators/compare','Add two indexed items without losing context.','compare')}${tile('ML Farming Comparator','calculators/ml-farm','Use your kill times to find the fastest Monster Level XP farm.','sword')}</div><p class="notice">Compound results and target-level shard estimates come from the October 9 game rules; no speculative reroll probabilities.</p>`,'calculator')}
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
function demoActive(){const route=parseRoute();return normalizeBuild(route.query.get('build')?deepCopy(buildTemplate(route.query.get('build'))||buildTemplate('warrior-retaliation-demo')):deepCopy(savedBuild()||buildTemplate('warrior-retaliation-demo')))}
function buildStudio(){const route=parseRoute(),inspecting=!!route.query.get('build'),b=demoActive();if(!b)return notFound();if(!inspecting)state.draft=b;
 const slots=buildLoadout(b.equipment,item,inspecting);
 return layout(inspecting?'Inspect Guide Build':'My Build Studio','ARCANA LABS',`<section class="studioHero"><div><span class="eyebrow">${inspecting?'READ-ONLY INSPECTION · GUIDE BUILD':'LOCAL WORKSPACE · SAVED ON THIS DEVICE'}</span><h2>${esc(b.title)}</h2><p>${esc(b.className)} · ${esc(b.summary)}</p></div>${chip(inspecting?'Demo template':'My editable draft')}</section>
 <div class="studioAction">${inspecting?`<button class="btn primary" data-action="clonebuild" data-arg="${esc(b.id)}">${icon('edit',17)} Use as my build</button>`:`<button class="btn primary" data-action="savebuild">${icon('check',16)} Save draft</button>`}<button class="btn secondary" data-route="wiki/guide" data-params="id=warrior-retaliation-demo-guide">${icon('book',17)} Read guide</button></div>
 ${labsTabs('studio')}${`<div class="studioML"><div><span class="eyebrow">RUNE GRID PROGRESSION</span><strong>Monster Level ${b.monsterLevel||1}</strong><small>· ${monsterLevelGrid(b.monsterLevel||1).cols}×${monsterLevelGrid(b.monsterLevel||1).rows} cells</small></div><div class="studioMLActions"><label class="studioMLInput">ML<input aria-label="Build Monster Level" data-monster-level type="number" min="1" max="100000" inputmode="numeric" value="${b.monsterLevel||1}" ${inspecting?'disabled':''}></label><button class="btn secondary" data-route="labs/runes" ${inspecting?`data-params="build=${esc(b.id)}"`:``}>Runes ${icon('arrow',14)}</button></div></div>`}${boardSwitch('equipment')}<div class="studioGrid"><section class="sectionCard equipmentSection"><div class="sectionCardTop"><h3>${icon('shield',19)} Equipment</h3><span>${Object.values(b.equipment).filter(Boolean).length} slots equipped</span></div>${slots}<div class="actionsGroup">${button('Passive Tree','route','labs/passives','secondary','layers')}${button('Class Skill Tree','route','labs/skills','secondary','git')}</div></section><section class="sectionCard"><div class="sectionCardTop"><h3>${icon('git',19)} Skills</h3><span>Focus</span></div><div class="pillSet">${b.skills.map(v=>chip(v,'wide')).join('')||chip('No skills assigned')}</div><p class="mutedSmall">Use the linked class tree to assign legal points, or swipe through passive tiers.</p><div class="actionsGroup">${button('Class tree','route','labs/skills','secondary','git')}${button('Passive tree','route','labs/passives','secondary','layers')}</div><div class="sectionCardTop spaceTop"><h3>${icon('gem',19)} Runes</h3></div><div class="pillSet">${(b.runeBoard?.length?b.runeBoard.filter(r=>{const g=monsterLevelGrid(b.monsterLevel||1);return r.x+r.w<=g.cols&&r.y+r.h<=g.rows}).map(r=>r.family+' · '+statName(r.secondary)):b.runes).map(v=>chip(v,'wide')).join('')||chip('No active runes at this ML')}</div><button class="textLink" data-route="labs/runes" ${inspecting?`data-params="build=${esc(b.id)}"`:''}>Inspect in Rune Forge ${icon('arrow',15)}</button><div class="sectionCardTop spaceTop"><h3>${icon('paw',19)} Four Pet Bonuses</h3></div>${petLoadoutView(b,inspecting)}</section></div>
 ${buildOverviewV7(b)}<div class="notice"><strong>Game-data boundary.</strong> ${esc(b.notes||'Source data remains under verification.')}</div>`, 'flask')}
function calcUpgrade(){const id=parseRoute().query.get('item'),e=item(id);if(e)track(e.id);
 return layout('Upgrade Cost Calculator','ARCANA CALCULATORS',`<div class="calcWorkspace"><span class="eyebrow">SELECTED EQUIPMENT</span><button class="selection" data-action="chooseupgrade"><span class="tinyIcon ${e?'tinyGameArt':''}">${e?gameArt(e,40):icon('shield',22)}</span><span><strong>${esc(e?.title||'Select an item')}</strong><small>${esc(e?.subtitle||'Use universal search or the item picker')}</small></span>${icon('arrow',16)}</button>${e?`<div class="actionsGroup">${button('View item in Wiki','wikiitem',e.id,'secondary','book')}${button('Compare','compare',e.id,'secondary','compare')}</div>`:''}<div class="calcWarning">${icon('info',20)} <p>Partial cost reference: this snapshot provides base tier changes only, not level-by-level or Awakened totals. No full expected cost is claimed.</p></div></div>${verifiedUpgradeReferencePanel(e?.title)}`,'calculator')}
function calcCompare(){const qp=parseRoute().query;const left=item(qp.get('left')||state.compareLeft),right=item(qp.get('right')||state.compareRight);state.compareLeft=left?.id||null;state.compareRight=right?.id||null;
 return layout('Compare Items','ARCANA CALCULATORS',`<div class="compareGrid">${[['left',left],['right',right]].map(([side,e])=>`<button class="compareSlot" data-action="pickcompare" data-arg="${side}"><span class="detailMark compareArt">${e?gameArt(e,83):icon('plus',26)}</span><span class="eyebrow">${side==='left'?'ITEM A':'ITEM B'}</span><strong>${esc(e?.title||'Select item')}</strong><small>${esc(e?.subtitle||'Tap to choose equipment')}</small></button>`).join('')}</div>
 ${verifiedComparisonPanel(left?.title,right?.title,state.compareTier)}
 <div class="actionsGroup">${left?button('Open Item A Wiki','wikiitem',left.id,'secondary','book'):''}${right?button('Open Item B Wiki','wikiitem',right.id,'secondary','book'):''}</div>`,'compare')}

function calcPet(){return layout('Pet Compound Calculator','ARCANA CALCULATORS',simpleCompoundCalculatorView(state.compoundQuick),'calculator')}
// Legacy /labs/pets URLs open Build Studio; pet loadout is no longer a separate feature.
function petLab(){return buildStudio()}
function calcAffixes(){return layout('Pet Affix Cost','ARCANA CALCULATORS',simpleAffixCostView(state.affixCostQuick),'paw')}
function calcFarm(){return layout('ML Farming Comparator','ARCANA CALCULATORS',farmCompareView(state.farmPlan),'sword')}
function runeForge(){const templateId=parseRoute().query.get('build');const preview=templateId?buildTemplate(templateId):null;const b=preview?normalizeBuild(preview):ensureDraft();const isReadonly=!!preview;
 return layout('Rune Forge','ARCANA LABS',`${labsTabs('runes')}<section class="runeIntro"><div><span class="eyebrow">ARCANA LABS / CHARACTER WORKSPACE</span><h2>Rune Forge</h2><p>${isReadonly?'Guide build, read-only preview':'Every placement saves to your current draft immediately. Grid grows with Monster Level.'}</p></div><span class="runeProgress">${activeRuneBoard(b.runeBoard||[],b.monsterLevel||1).active.reduce((n,r)=>n+r.w*r.h,0)} / ${monsterLevelGrid(b.monsterLevel||1).cols*monsterLevelGrid(b.monsterLevel||1).rows} cells</span></section><div class="runeStudioGrid">${runeGridView(b,state.runeSelected,isReadonly)}${runeOptionsUI({family:state.runeFamily,shape:state.runeShape,secondary:state.runeSecondary,selected:state.runeSelected},b,isReadonly)}</div>${!b.runeBoard.length&&b.runes.length?`<p class="notice">Reference families: ${esc(b.runes.join(', '))}. This build has no verified rune placement coordinates yet, so the board begins empty.</p>`:''}`,'gem')}
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
function skills(){return layout('Class Skill Tree','ARCANA LABS',labsTabs('skills')+classBoard(state,state.treeData),'git')}
function passives(){return layout('Passive Skill Tree','ARCANA LABS',labsTabs('passives')+passiveBoard(state,state.treeData),'layers')}
function storeTreePlan(){const plan={characterLevel:state.characterLevel,treeClassId:state.treeClassId,treeBranchId:state.treeBranchId,passiveAlloc:state.passiveAlloc,classAlloc:state.classAlloc,classAllocById:state.classAllocById};try{localStorage.setItem('arcana-v4-tree-plan',JSON.stringify(plan))}catch{}if(state.draft){Object.assign(state.draft,{characterLevel:state.characterLevel,passiveAlloc:structuredClone(state.passiveAlloc),classAllocById:structuredClone(state.classAllocById)});persistDraft()}}
function restoreTreePlan(){try{const p=JSON.parse(localStorage.getItem('arcana-v4-tree-plan')||'{}');state.characterLevel=Math.max(1,Math.floor(Number(p.characterLevel)||1));state.treeClassId=p.treeClassId||null;state.treeBranchId=p.treeBranchId||null;state.passiveAlloc=p.passiveAlloc&&typeof p.passiveAlloc==='object'?p.passiveAlloc:{};state.classAlloc=p.classAlloc&&typeof p.classAlloc==='object'?p.classAlloc:{};state.classAllocById=p.classAllocById&&typeof p.classAllocById==='object'?p.classAllocById:{}}catch{}}
async function loadTrees(){state.treeStatus='loading';try{const r=await fetch(TREE_DATA_URL,{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error('HTTP '+r.status);const d=normalizeTree(await r.json());if(!d.passive.rows.length&&!d.classes.length)throw new Error('No compatible tree data in export');state.treeData=d;state.treeStatus='ready';if(!state.treeClassId&&d.classes.length)state.treeClassId=d.classes[0].id;}catch(e){state.treeData=null;state.treeStatus='unavailable';console.warn('Arcana skill data:',e.message)}if(parseRoute().route.startsWith('labs/skill')||parseRoute().route.startsWith('labs/passive'))render()}
function adjustPassive(key,delta){const n=activePassiveNode(state.treeData,key),res=passiveAllowed(state.treeData,state.passiveAlloc,n,delta,state.characterLevel);if(!res.ok){toast(res.reason);return}state.passiveAlloc=res.allocation;storeTreePlan();rerenderTreeKeepingFocus('passive',key,delta)}
function adjustClass(id,delta){const {cls,skill}=activeClassSkill(state.treeData,state.treeClassId,id);const res=classAllowed(cls,state.classAlloc,skill,delta,state.characterLevel);if(!res.ok){toast(res.reason);return}state.classAlloc=res.allocation;state.classAllocById[state.treeClassId||'default']=state.classAlloc;storeTreePlan();rerenderTreeKeepingFocus('class',id,delta)}
function inspectPassive(key){const node=activePassiveNode(state.treeData,key);if(!node)return;const rank=+(state.passiveAlloc[key]||0);const plus=passiveAllowed(state.treeData,state.passiveAlloc,node,1,state.characterLevel),minus=passiveAllowed(state.treeData,state.passiveAlloc,node,-1,state.characterLevel);showLayer('PASSIVE NODE',`<section class="skillInspector"><span class="eyebrow">ROW ${node.row+1} · ${node.milestone?'MILESTONE':'PASSIVE'}</span><h2>${esc(passiveTitle(node.name))}</h2><p>${esc(node.description||'Stat node from the game tree export.')}</p><div class="rank"><button data-action="passiveadjust" data-arg="${esc(key)}|-1" ${minus.ok?'':'disabled'} aria-label="Refund point">−</button><strong>${rank} / ${node.maxRank||'?'}</strong><button data-action="passiveadjust" data-arg="${esc(key)}|1" ${plus.ok?'':'disabled'} aria-label="Allocate point">+</button></div><p class="reason">${esc(!plus.ok?plus.reason:`${state.characterLevel} character level · passive points remaining: ${Math.max(0,passivePointBudget(state.characterLevel)-allocatedTotal(state.passiveAlloc))}`)}</p></section>`,'passive-inspector')}
function inspectClass(id){const {cls,skill}=activeClassSkill(state.treeData,state.treeClassId,id);if(!skill)return;const rank=+(state.classAlloc[id]||0);const plus=classAllowed(cls,state.classAlloc,skill,1,state.characterLevel),minus=classAllowed(cls,state.classAlloc,skill,-1,state.characterLevel);showLayer('CLASS SKILL',`<section class="skillInspector"><span class="eyebrow">${esc(cls.name.toUpperCase())} · VERIFIED SKILL ID ${esc(id)}</span><h2>${esc(skill.name)}</h2><p>${esc(skill.description||skill.effect||'Details available from the game tree export.')}</p>${skill.prereqs.length?`<p>Requires: ${esc(skill.prereqs.join(', '))}</p>`:''}<div class="rank"><button data-action="classadjust" data-arg="${esc(id)}|-1" ${minus.ok?'':'disabled'} aria-label="Refund skill point">−</button><strong>${rank} / ${skill.maxRank||'?'}</strong><button data-action="classadjust" data-arg="${esc(id)}|1" ${plus.ok?'':'disabled'} aria-label="Allocate skill point">+</button></div><p class="reason">${esc(!plus.ok?plus.reason:`${Math.max(0,classPointBudget(state.characterLevel)-allocatedTotal(state.classAlloc))} class points available`)}</p></section>`,'class-inspector')}
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
function passiveMove(delta){const tiers=state.treeData?.passive?.tiers||[];if(!tiers.length)return;const next=state.passiveTier+delta;if(next<0||next>=tiers.length)return;state.passiveTier=next;state.passivePage=0;render()}
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

function routeView(){const {route,query}=parseRoute();switch(route){case 'home':return home();case 'calculators':return calculators();case 'labs':return labs();case 'wiki':return wikiLandingView({entries:verifiedState.entries,loaded:verifiedState.loaded,error:verifiedState.error,itemCount:verifiedState.entries.length});case 'lfg':return lfg();case 'wiki/items':return wikiLibraryView({entries:verifiedState.entries,category:'item',query:wikiState.query,limit:wikiState.limit,loaded:verifiedState.loaded,error:verifiedState.error});case 'wiki/mechanics':return wikiLibraryView({entries:verifiedState.entries,category:'passive',query:wikiState.query,limit:wikiState.limit,loaded:verifiedState.loaded,error:verifiedState.error});case 'wiki/guides':return wikiGuidesView();case 'wiki/studio':return wikiStudioView();case 'wiki/library':return wikiLibraryView({entries:verifiedState.entries,category:wikiState.category=query.get('kind')||'all',query:wikiState.query,limit:wikiState.limit,loaded:verifiedState.loaded,error:verifiedState.error});case 'wiki/article':{const a=wikiArticleById(query.get('id'));if(a)track('wiki:article:'+a.id);return wikiArticleView(a);}case 'wiki/guide':return fullGuide(query.get('id'));case 'wiki/item':return wikiItem(query.get('item'));case 'wiki/mechanic':return wikiMechanic(query.get('id'));case 'labs/build':return buildStudio();case 'labs/runes':return runeForge();case 'labs/pets':return petLab();case 'labs/guild-tree':case 'lfg/guild-tree':return guildTree();case 'labs/skills':return skills();case 'labs/passives':return passives();case 'calculators/upgrade':return calcUpgrade();case 'calculators/compare':return calcCompare();case 'calculators/pet':return calcPet();case 'calculators/affixes':return calcAffixes();case 'calculators/ml-farm':return calcFarm();case 'lfg/raids':return lfg('raids');case 'lfg/guilds':return guildPage();case 'lfg/guild':return guildPage();case 'lfg/guild/new':return guildPage();case 'lfg/guild/edit':return guildPage();case 'lfg/listing':return lfg('listing');case 'reference/detail':case 'wiki/reference':{const id=query.get('id')||query.get('item');if(id)track(id);return wikiRecordView(verifiedState.entries.find(e=>e.id===id),verifiedState.entries,wikiState.category);} default:return notFound()}}
function render(){const __prevGuildRail=document.querySelector('.guildTreeTabs');const __prevGuildX=__prevGuildRail?.scrollLeft??null;const __prevWikiRail=document.querySelector('.wikiCategoryScroll');const __prevWikiX=__prevWikiRail?__prevWikiRail.scrollLeft:null;const dest=parseRoute().route;if(dest.startsWith('lfg/guild')&&!guildState.loading&&Date.now()-guildState.updatedAt>30000)queueMicrotask(()=>void loadGuilds());if(dest.startsWith('lfg')&&!lfgState.loading&&(Date.now()-lfgState.updatedAt>30000)){queueMicrotask(()=>void loadPublicLfg())};applyTheme(dest);node('content').innerHTML=routeView()+connectedNext(dest)+siteSignature();if(dest==='wiki/studio')queueMicrotask(()=>void mountWikiStudio());const __nextGuildRail=node('content').querySelector('.guildTreeTabs');
if(__nextGuildRail&&__prevGuildX!==null)__nextGuildRail.scrollLeft=__prevGuildX;
const __nextWikiRail=node('content').querySelector('.wikiCategoryScroll');if(__nextWikiRail){
  if(__prevWikiX!==null)__nextWikiRail.scrollLeft=__prevWikiX;
  const __activeWikiTab=__nextWikiRail.querySelector('a.active');
  if(__activeWikiTab){
    const bounds=__activeWikiTab.getBoundingClientRect(),view=__nextWikiRail.getBoundingClientRect(),pad=12;
    if(bounds.left<view.left+pad)__nextWikiRail.scrollLeft=Math.max(0,__nextWikiRail.scrollLeft-(view.left+pad-bounds.left));
    else if(bounds.right>view.right-pad)__nextWikiRail.scrollLeft+=bounds.right-(view.right-pad);
  }
 }const currentTab=node('content').querySelector('.labsTab.active');if(currentTab){const rail=currentTab.parentElement;rail.scrollLeft=Math.max(0,currentTab.offsetLeft-rail.offsetLeft-(rail.clientWidth-currentTab.clientWidth)/2)}const nav=node('bottomNav');nav.innerHTML=`<button data-route="home" class="navItem ${dest==='home'?'selected':''}">${icon('home',21)}<small>Home</small></button><button data-action="quick" class="navItem">${icon('clock',21)}<small>Shortcuts</small></button><button data-action="search" class="navSearch" aria-label="Search all of Arcana"><span>${icon('search',25)}</span><small>Search</small></button><button data-route="labs" class="navItem ${dest.startsWith('labs')?'selected':''}">${icon('flask',21)}<small>Labs</small></button><button data-action="menu" class="navItem">${icon('menu',21)}<small>Menu</small></button>`;
 node('sideNav').innerHTML=`<span class="eyebrow navEyebrow">ARCANA</span>${LINKS.map(([href,label,ico])=>`<button data-route="${href}" class="sideItem ${dest===href||dest.startsWith(href+'/')?'selected':''}">${icon(ico,20)} ${esc(label)}</button>`).join('')}<div class="sideDivider"></div><span class="eyebrow navEyebrow">SHORTCUTS</span><button class="sideItem" data-action="search">${icon('search',19)} Universal Search</button><button class="sideItem" data-action="quick">${icon('clock',19)} Recent & Quick</button><button class="sideItem" data-route="labs/guild-tree">${icon('shield',19)} Guild Skill Tree</button>`;
 document.title=(dest==='home'?'Arcana':(node('content').querySelector('h1')?.textContent||'Arcana'))+' | Arcana';}
function showLayer(kicker,body,type='panel'){state.layer={type};node('layerKicker').textContent=kicker;node('layerContent').innerHTML=body;node('layer').hidden=false;document.body.classList.add('noScroll')}
function closeLayer(){node('layer').hidden=true;state.layer=null;document.body.classList.remove('noScroll')}
function overlayTitle(text,iconName='search'){return `<h2 class="sheetTitle">${icon(iconName,24)} ${esc(text)}</h2>`}
function showSearch(q=state.lastSearch){state.search=q;const recent=state.recent.map(x=>entityById.get(x)||verifiedState.entries.find(e=>e.id===x)||guildEntries(guildState.guilds).find(e=>e.id===x)).filter(Boolean).slice(0,4);
 showLayer('UNIVERSAL SEARCH',`${overlayTitle('Find anything in Arcana')}<div class="bigSearch">${icon('search',23)}<input id="globalSearch" autocomplete="off" aria-label="Search entire Arcana" placeholder="Items, guides, skills, tools, raids…" value="${esc(q)}"><button class="iconButton small" data-action="clearsearch" aria-label="Clear search">${icon('close',17)}</button></div><div class="searchHint">Type to search every indexed public destination. No separate search boxes.</div><div id="searchResults" aria-live="polite">${q?resultMarkup(q):`<span class="eyebrow">RECENTLY VIEWED</span><div class="resultList">${recent.length?recent.map(cardEntity).join(''):'<p class="mutedSmall">Your viewed items and guides will appear here.</p>'}</div><span class="eyebrow">TRY SEARCHING</span><div class="pillSet"><button class="sampleChip" data-action="searchterm" data-arg="boots">boots</button><button class="sampleChip" data-action="searchterm" data-arg="retaliation">retaliation</button><button class="sampleChip" data-action="searchterm" data-arg="compound">compound</button><button class="sampleChip" data-action="searchterm" data-arg="raid">raid</button></div>`}</div>`,'search');}
function resultMarkup(query){const hits=mergedSearch(query,[v11AllEntries()],{category:state.searchCategory||'all',limit:60});const tabs=[['all','All'],['wiki','Wiki'],['game','Game data'],['lfg','Raids'],['guild','Guilds'],['tools','Tools & guides']];return `<div class="searchCategoryRail">${tabs.map(([key,label])=>`<button data-action="searchcategory" data-arg="${key}" class="${(state.searchCategory||'all')===key?'active':''}">${label}</button>`).join('')}</div><div class="resultsMeta"><strong>${hits.length} ${hits.length===60?'top ':''}matching results</strong><small>${verifiedState.loaded?verifiedState.entries.length+' verified game records':'Game index loading'} · ${lfgState.loaded?'Live raids':'Raid feed loading'} · ${guildState.loaded?'Guild listings':'Guilds loading'}</small></div><div class="resultList">${hits.length?hits.map(cardEntity).join(''):`<div class="emptyMini">Nothing matched this search. Try fewer words or another category.</div>`}</div>`}
function refreshLiveSearch(){const box=node('searchResults');if(box&&state.search)box.innerHTML=resultMarkup(state.search)}
function showPreview(id,fromSearch=false){const e=searchExtras().find(x=>x.id===id)||entityById.get(id)||lfgById(id)||guildEntries(guildState.guilds).find(x=>x.id===id)||verifiedState.entries.find(x=>x.id===id)||wikiArticleEntries().find(x=>x.id===id);if(!e)return;track(id);const title=esc(e.title);const buttons=e.kind==='verified'?`${button('View in ArcanaWiki','route',e.route,'primary','book')}${e.gameKind==='class-skill'?button('Open Class Tree','route','labs/skills','secondary','git'):''}${e.gameKind==='passive'?button('Open Passive Tree','route','labs/passives','secondary','layers'):''}${e.gameKind==='runeword'||e.gameKind==='rune'?button('Open Rune Forge','route','labs/runes','secondary','gem'):''}${e.gameKind==='item'?button('Compare this item','compare',e.id,'secondary','compare')+button('See upgrade costs','upgrade',e.id,'secondary','calculator'):''}`:e.kind==='wikiarticle'?button('Read quick guide','route',e.route,'primary','book'):e.kind==='guildlisting'?button('View guild recruitment profile','route',e.route,'primary','shield'):e.kind==='lfglisting'?`${button('View raid in Arcana','route',e.route,'primary','users')}<a class="btn secondary" href="${lfgDeepLink(e.source)}" target="_blank" rel="noopener noreferrer">${icon('up',16)} Apply on live LFG</a>`:e.kind==='lfgguild'?button('View guild activity','route',e.route,'primary','shield'):e.kind==='item'?`${button('View item in Wiki','wikiitem',e.id,'primary','book')}${button('Compare this item','compare',e.id,'secondary','compare')}${button('See upgrade costs','upgrade',e.id,'secondary','calculator')}${button('Add to Build Studio','equip',e.id,'secondary','flask')}`:e.kind==='guide'?`${button('Read full guide','route','wiki/guide?id='+e.id,'primary','book')}${e.buildId?button('Inspect complete build','route','labs/build?build='+e.buildId,'secondary','flask'):''}`:e.kind==='mechanic'?`${button('View in Wiki','route','wiki/mechanic?id='+e.id,'primary','book')}${e.id==='pet-equalisation'?button('Open Pet Calculator','route','calculators/pet','secondary','calculator'):''}`:e.kind==='build'?button('Open my Build Studio','route','labs/build','primary','flask'):button('Open destination','route',e.route||'home','primary','arrow');
 state.layer={type:'preview',fromSearch};showLayer('QUICK PREVIEW',`${fromSearch?`<button class="backLink" data-action="backsearch">${icon('back',16)} Back to results</button>`:''}<div class="previewHero"><span class="detailMark">${icon(boxIcon(e.kind),32)}</span><div><span class="eyebrow">${esc(e.subtitle)}</span><h2>${title}</h2><p>${esc(e.description)}</p></div></div><div class="actionsGroup">${buttons}</div><p class="mutedSmall">Actions carry this entry's ID. You're never asked to find it twice.</p>`,'preview');state.layer={type:'preview',fromSearch};}
function quick(){const rec=state.recent.map(id=>entityById.get(id)).filter(Boolean).slice(0,5);showLayer('QUICK ACCESS',`${overlayTitle('Jump back in','clock')}<span class="eyebrow">JUMP TO A DESTINATION</span><div class="arcanaShortcutGrid">${navCards(['items','guides','guildtree','raids'],{compact:true})}</div><span class="eyebrow">POPULAR TOOLS</span><div class="quickGrid">${[['Upgrade Costs','calculators/upgrade','calculator'],['Build Studio','labs/build','flask'],['Rune Forge','labs/runes','gem'],['Pet Compound','calculators/pet','paw'],['Guild Tree','labs/guild-tree','shield'],['ML Farm','calculators/ml-farm','sword']].map(([n,r,i])=>`<button data-route="${r}">${icon(i,22)}${esc(n)}${icon('arrow',14)}</button>`).join('')}</div><span class="eyebrow">RECENTLY VIEWED</span><div class="resultList">${rec.length?rec.map(cardEntity).join(''):'<div class="emptyMini">Viewed items, guides, and mechanics will appear here.</div>'}</div><p class="mutedSmall">Pinning and cross-device recent history will be added alongside optional accounts.</p>`,'quick')}
function menu(){showLayer('ARCANA DIRECTORY',`${overlayTitle('Explore the ecosystem','menu')}<div class="menuList">${LINKS.map(([href,label,i])=>`<button data-route="${href}"><span class="tinyIcon">${icon(i,22)}</span><strong>${esc(label)}</strong>${icon('arrow',17)}</button>`).join('')}</div><div class="sectionCard"><h3>Useful destinations</h3><button class="textLink" data-route="wiki/guide" data-params="id=warrior-retaliation-demo-guide">Example guide with inspectable build ${icon('arrow',16)}</button><button class="textLink" data-route="calculators/pet">Pet Compound cap ${icon('arrow',16)}</button><button class="textLink" data-route="wiki/library" data-params="kind=item">Item Codex ${icon('arrow',16)}</button><button class="textLink" data-route="labs/guild-tree">Guild Skill Tree ${icon('arrow',16)}</button></div><div class="sectionCard adminEntry"><span class="eyebrow">ACCOUNT & ADMINISTRATION</span><h3>Arcana Control</h3><p class="mutedSmall">Only approved admins can edit themes. Player tools remain open to guests.</p><div class="themeReadout">${themeColorPreview()}</div><a class="btn secondary full" href="${ADMIN_URL}" target="_blank" rel="noopener noreferrer">${icon('sliders',17)} Open protected admin portal ${icon('up',16)}</a></div>`,'menu')}
function themeColorPreview(){const t=themeStatus();const {main,secondary,highlight}=t.palette;return `<span class="themeSwatch" style="background:${main}"></span><span class="themeSwatch" style="background:${secondary}"></span><span class="themeSwatch" style="background:${highlight}"></span><span class="themeReadoutText">${t.available?'Central theme active':'Default palette (offline)'}</span>`}
function pickerOptions(kind,slot,query=''){
 const verified=verifiedState.entries.filter(e=>e.gameKind==='item').map(e=>item(e.id));
 const unique=new Map([...verified,...itemList].filter(Boolean).map(e=>[e.title.toLowerCase(),e]));
 const normalized=slot==='ring2'?'ring':slot==='charm2'?'charm':slot;
 const q=query.trim().toLowerCase();
 const options=[...unique.values()].filter(e=>kind!=='gear'||!slot||!e.slot||e.slot===normalized).filter(e=>!q||[e.title,e.subtitle,e.description].some(v=>String(v||'').toLowerCase().includes(q)));
 return options.length?options.map(e=>`<button class="resultRow" data-action="selectitem" data-arg="${esc(e.id)}"><span class="tinyIcon tinyGameArt">${gameArt(e,41)}</span><span class="resultText"><strong>${esc(e.title)}</strong><small>${esc(e.subtitle||e.description||'Equipment')}</small></span>${icon('plus',16)}</button>`).join(''):'<div class="emptyMini">No matching equipment in this slot.</div>';
}
function picker(kind,slot){state.slotTarget={kind,slot};showLayer('SELECT EQUIPMENT',`${overlayTitle('Choose equipment','shield')}<div class="filterLine"><input type="search" id="gearPickerQuery" placeholder="Find equipment…" autocomplete="off" aria-label="Search equipment"><span>${icon('search',18)}</span></div><div class="resultList" id="gearPickerItems">${pickerOptions(kind,slot)}</div>`,'picker')}

function chooseItem(id){const target=state.slotTarget;if(!target)return;closeLayer();if(target.kind==='gear'){if(!state.draft)state.draft=ensureDraft();state.draft.equipment[target.slot]=id;saveDraft(state.draft);navigate('labs/build');}
 if(target.kind==='upgrade')navigate('calculators/upgrade',{item:id});if(target.kind==='compare'){if(target.slot==='left')state.compareLeft=id;else state.compareRight=id;navigate('calculators/compare',{left:state.compareLeft,right:state.compareRight});}
}
function go(route,params={}){
 const current=parseRoute();
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
function action(name,arg,btn){switch(name){
 case 'skipmain':node('content')?.focus({preventScroll:false});break;
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
case 'searchcategory':state.searchCategory=arg;refreshLiveSearch();break;case 'guildrefresh':void loadGuilds(true);break;case 'guildcopykey':navigator.clipboard?.writeText(arg).then(()=>toast('Recovery key copied')).catch(()=>toast('Copy the key manually'));break;case 'guildrecover':{const key=node('guildRecovery')?.value?.trim();if(!key||key.length<30){toast('Enter the full recovery key');break;}saveGuildOwner(arg,key);closeLayer();go('lfg/guild/edit',{id:arg});break;}case 'guilddelete':{if(!window.confirm('Delete this guild listing? This cannot be undone.'))break;const key=readGuildOwner(arg);fetch(V11_GUILD_ENDPOINT+'/'+encodeURIComponent(arg),{method:'DELETE',headers:{'x-owner-key':key}}).then(async r=>{const b=await r.json();if(!r.ok)throw Error(b.error||'Delete failed');await loadGuilds(true);go('lfg/guilds');toast('Guild listing deleted')}).catch(e=>toast(e.message));break;}case 'lfgtab':lfgState.tab=arg;render();break;case 'lfgrefresh':void loadPublicLfg(true);break;case 'lfgclear':Object.assign(lfgState,{query:'',tier:'',characterClass:'',mightAmount:'',mightUnit:'M'});render();break;case 'lfgguild':lfgState.query=arg;lfgState.tab='all';go('lfg/raids');break;case 'passiveinspect':inspectPassive(arg);break;case 'classinspect':inspectClass(arg);break;case 'passiveadjust':{const [key,d]=arg.split('|');adjustPassive(key,+d);break;}case 'classadjust':{const [key,d]=arg.split('|');adjustClass(key,+d);break;}case 'passivetier':state.passiveTier=+arg;state.passivePage=0;render();break;case 'passiveprev':passiveMove(-1);break;case 'passivenext':passiveMove(1);break;case 'passivefirst':state.passiveTier=0;state.passivePage=0;render();break;case 'passivemilestone':{const t=state.treeData?.passive?.tiers?.findIndex(x=>x.milestone);if(t>=0){state.passiveTier=t;state.passivePage=0;render()}else toast('No milestone tier identified in this export');break;}case 'classselect':{if(state.treeClassId)state.classAllocById[state.treeClassId]=state.classAlloc;state.treeClassId=arg;state.treeBranchId=null;state.classAlloc=state.classAllocById[arg]||{};state.classTierIndex=0;storeTreePlan();render();break;}case 'branchselect':state.treeBranchId=arg;state.classTierIndex=0;storeTreePlan();render();break;case 'classtier':state.classTierIndex=+arg;render();break;case 'classprev':classMove(-1);break;case 'classnext':classMove(1);break;case 'resetpassives':state.passiveAlloc={};storeTreePlan();render();break;case 'resetclasses':state.classAlloc={};state.classAllocById[state.treeClassId||'default']={};storeTreePlan();render();break;case 'reloadtree':void loadTrees();
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
}case 'wikiretry':{if(btn){btn.disabled=true;btn.textContent='Retrying…';}void loadVerifiedIndex();break;}case 'wikiclear':wikiState.query='';wikiState.limit=36;render();break;case 'skillpreview':showSkillStudy(arg);break;case 'clearsearch':showSearch('');break;case 'searchterm':showSearch(arg);break;case 'quick':quick();break;case 'menu':menu();break;case 'backsearch':showSearch(state.lastSearch);break;case 'back':navigateBack();break;case 'route':{const [path,q='']=arg.split('?');go(path,Object.fromEntries(new URLSearchParams(q)));break;}case 'wikiitem':if(arg.startsWith('game:item:'))go('wiki/reference',{id:arg});else go('wiki/item',{item:arg});break;case 'upgrade':go('calculators/upgrade',{item:arg});break;case 'compare':{state.compareLeft=arg;go('calculators/compare',{left:arg,right:state.compareRight});break;}case 'equip':{state.draft=ensureDraft();const slot=item(arg)?.slot||'weapon';state.draft.equipment[slot]=arg;saveDraft(state.draft);go('labs/build');break;}case 'pickgear':picker('gear',arg);break;case 'inspectgear':{const itemId=btn?.dataset.item;if(itemId)showPreview(itemId);else showLayer('EMPTY EQUIPMENT SLOT',`<p class="lead">This slot is empty in the guide example. Clone the build to edit it.</p>`);break;}case 'petcompoundstep':{
 const step=Number(arg);if(![1,5,10,25].includes(step))break;
 state.compoundQuick=saveCompoundPlan({...state.compoundQuick,level:state.compoundQuick.level+step});render();break;
}case 'petcompoundreset':{state.compoundQuick=saveCompoundPlan({...state.compoundQuick,level:0});render();break;}
case 'petaffixstep':{
 const step=Number(arg);if(![1,10,25,50,100].includes(step))break;
 state.affixCostQuick=saveAffixCostPlan({...state.affixCostQuick,targetLevel:state.affixCostQuick.targetLevel+step});render();break;
}case 'petaffixreset':{state.affixCostQuick=saveAffixCostPlan({...state.affixCostQuick,targetLevel:state.affixCostQuick.currentLevel});render();break;}
case 'comparetier':{const tier=Number(arg);if(!Number.isInteger(tier)||tier<1||tier>6)break;state.compareTier=tier;render();break;}case 'pickcompare':picker('compare',arg);break;case 'chooseupgrade':picker('upgrade');break;case 'selectitem':chooseItem(arg);break;case 'clonebuild':{state.draft=normalizeBuild(deepCopy(buildTemplate(arg)));state.runeSelected=null;state.runeHistory=[];state.draft.id='local-draft';state.draft.title='My Warrior Draft';state.draft.version='LOCAL';saveDraft(state.draft);go('labs/build');toast('Complete build copied into your local draft.');break;}case 'savebuild':if(state.draft)saveDraft(state.draft);toast('Build saved on this device.');break;case 'runesave':persistDraft();toast('Rune grid saved with your character.');break;
case 'runefamily':{const family=RUNE_FAMILIES.includes(arg)?arg:'Fury',def=RUNE_FAMILY_DETAILS[family];state.runeFamily=family;if(state.runeSelected){mutateRunes(b=>{const r=b.runeBoard.find(r=>r.id===state.runeSelected);if(r){r.family=family;r.primary=def.primary}})}else{state.runeSecondary=def.suggestedSecondary;render()}break;}
case 'runeshape':{const shape=arg in RUNE_SHAPES?arg:'small';state.runeShape=shape;if(state.runeSelected){const b=ensureDraft(),r=b.runeBoard.find(r=>r.id===state.runeSelected);if(!r)break;const candidate={...r,shape,w:RUNE_SHAPES[shape].w,h:RUNE_SHAPES[shape].h};const issue=runeIssue(b.runeBoard,candidate,r.id,b.monsterLevel);if(issue){toast(issue);break;}mutateRunes(b=>{Object.assign(b.runeBoard.find(x=>x.id===state.runeSelected),{shape,w:candidate.w,h:candidate.h})});}else render();break;}
case 'runeplace':{if(parseRoute().query.get('build')){toast('Copy the guide build to edit its rune layout');break;}const [x,y]=arg.split('|').map(Number),shape=RUNE_SHAPES[state.runeShape];const b=ensureDraft();const candidate={id:nextRuneId(b.runeBoard),family:state.runeFamily,secondary:state.runeSecondary,shape:state.runeShape,x,y,w:shape.w,h:shape.h};const res=putRune(b.runeBoard,candidate,b.monsterLevel);if(!res.ok){toast(res.reason);break;}state.runeSelected=candidate.id;mutateRunes(build=>{build.runeBoard=res.placements;});break;}
case 'runeselect':{state.runeSelected=arg;const r=ensureDraft().runeBoard.find(r=>r.id===arg);if(r){state.runeFamily=r.family;state.runeSecondary=r.secondary;state.runeShape=r.shape;}render();break;}
case 'runeremove':if(parseRoute().query.get('build'))break;state.runeSelected=null;mutateRunes(b=>{b.runeBoard=removeRune(b.runeBoard,arg)});break;
case 'runeundo':{const before=state.runeHistory.pop();if(!before){toast('No more changes to undo');break;}const b=ensureDraft();b.runeBoard=before;b.runes=[...new Set(before.map(r=>r.family))];persistDraft();state.runeSelected=null;render();break;}
case 'runeclearinactive':{mutateRunes(b=>{b.runeBoard=activeRuneBoard(b.runeBoard,b.monsterLevel).active});state.runeSelected=null;break;}
case 'runeclear':{const b=ensureDraft();if(!b.runeBoard.length)break;mutateRunes(b=>{b.runeBoard=[]});state.runeSelected=null;break;}
case 'petmode':state.petCalcMode=arg==='permanent'?'permanent':'seasonal';render();break;
case 'account':showLayer('ACCOUNTS & ADMIN',`${overlayTitle('Arcana Control','users')}<p class="lead">Everything in Arcana works without an account. For administrators, the protected Design Control portal manages username/password access and section-specific themes.</p><div class="sectionCard adminEntry"><span class="eyebrow">CURRENT DESIGN</span><div class="themeReadout">${themeColorPreview()}</div><p class="mutedSmall">Main background · Card surface · Highlight. Only the admin portal can change these colors.</p><a class="btn primary full" href="${ADMIN_URL}" target="_blank" rel="noopener noreferrer">${icon('sliders',17)} Open Admin Theme Studio ${icon('up',15)}</a><button class="btn secondary full" data-action="refresh-theme">${icon('refresh',16)} Refresh colors</button></div>`);break;case 'refresh-theme':void refreshTheme().then(()=>{if(state.layer)action('account')});break;}}
let toastTimer;function toast(msg){node('toast').textContent=msg;node('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>node('toast').hidden=true,2500)}
let renderLock=false;function handleRoute(){if(renderLock)return;renderLock=true;try{render()}finally{renderLock=false}}
let treeTouchX=0,treeTouchY=0;
document.addEventListener('touchstart',e=>{const pane=e.target.closest('#passiveSwipe,#classSwipe');if(pane){treeTouchX=e.touches[0].clientX;treeTouchY=e.touches[0].clientY}},{passive:true});
document.addEventListener('touchend',e=>{const pane=e.target.closest('#passiveSwipe,#classSwipe');if(!pane||!e.changedTouches?.length)return;const x=e.changedTouches[0].clientX-treeTouchX,y=e.changedTouches[0].clientY-treeTouchY;if(Math.abs(x)>45&&Math.abs(x)>Math.abs(y)*1.35){if(pane.id==='passiveSwipe')passiveMove(x<0?1:-1);else classMove(x<0?1:-1)}},{passive:true});
function init(){wireWikiStudio();if(state.draft)state.draft=normalizeBuild(state.draft);restoreTreePlan();initTheme();node('brandHome').onclick=()=>go('home');node('accountBtn').innerHTML=icon('users',20);node('accountBtn').onclick=()=>action('account');document.addEventListener('click',e=>{if(e.target.closest('[data-close]')){closeLayer();return}const preview=e.target.closest('[data-preview]');if(preview){state.lastSearch=state.search;showPreview(preview.dataset.preview,!!state.layer&&state.layer.type==='search');return}const routed=e.target.closest('[data-route]');if(routed){const pars=Object.fromEntries(new URLSearchParams(routed.dataset.params||''));go(routed.dataset.route,pars);return}const act=e.target.closest('[data-action]');if(act)action(act.dataset.action,act.dataset.arg||'',act);});document.addEventListener('input',e=>{if(e.target.id==='treeLevel'||e.target.id==='treeLevelRange')previewTreeLevel(e.target.value);if(e.target.hasAttribute('data-monster-slider')){const input=node('content').querySelector('[data-monster-level]');if(input)input.value=e.target.value;}if(e.target.id==='guildQuery'){guildState.query=e.target.value;const list=guildFilter(guildState.guilds,guildState.query),box=node('guildCards');if(box)box.innerHTML=list.map(guildCard).join('')||'<div class="lfgEmpty">No matching guilds right now.</div>';const counter=node('guildCount');if(counter)counter.textContent=String(list.length);}if(e.target.id==='lfgQuery'){lfgState.query=e.target.value;updateLiveResults();}if(e.target.id==='lfgMight'){lfgState.mightAmount=e.target.value;updateLiveResults();}if(e.target.id==='globalSearch'){state.search=e.target.value;state.lastSearch=state.search;node('searchResults').innerHTML=state.search?resultMarkup(state.search):'<div class="emptyMini">Start typing to search public Arcana content.</div>'}if(e.target.id==='gearPickerQuery'){const box=node('gearPickerItems');if(box)box.innerHTML=pickerOptions(state.slotTarget?.kind,state.slotTarget?.slot,e.target.value);}if(e.target.id==='wikiFilter'){wikiState.query=e.target.value;wikiState.limit=36;const result=wikiRecordRows(verifiedState.entries,parseRoute().query.get('kind')||'all',wikiState.query,wikiState.limit),list=node('wikiRecords'),counter=node('wikiFoundCount'),more=node('wikiMore'),showing=node('wikiShowing'),clear=node('content').querySelector('.wikiClearFilter');if(list)list.innerHTML=result.html;if(counter)counter.textContent=result.count+' '+(result.count===1?'reference':'references');if(showing)showing.textContent=result.count?'Showing '+Math.min(result.count,wikiState.limit)+' of '+result.count:'Season 2 reference library';if(clear)clear.hidden=!wikiState.query;if(more)more.hidden=!result.hasMore;}if(e.target.id==='itemFilter'){const q=e.target.value.toLowerCase();node('itemResults').innerHTML=itemList.filter(x=>(x.title+' '+x.keywords).toLowerCase().includes(q)).map(cardEntity).join('')||'<p class="emptyMini">No matching item.</p>'}if(e.target.dataset.petLevel!==undefined){const i=+e.target.dataset.petLevel,n=Math.max(0,Number(e.target.value)||0);state.petLevels[i]=n;const cap=Math.min(...state.petLevels)+10;const el=node('petEffective');if(el){el.textContent=cap;el.nextElementSibling.textContent='Minimum '+Math.min(...state.petLevels)+' + 10'}}});document.addEventListener('change',e=>{
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
 }});document.addEventListener('submit',e=>{if(e.target.id==='guildForm'){e.preventDefault();void guildSave(e.target)}});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLayer();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();showSearch()}});window.addEventListener('arcana:assets-loaded',()=>{if(!state.layer)render();else if(state.layer.type==='search'){node('searchResults').innerHTML=state.search?resultMarkup(state.search):node('searchResults').innerHTML}});window.addEventListener('arcana:navigate',handleRoute);window.addEventListener('popstate',handleRoute);window.addEventListener('hashchange',handleRoute);if(!location.hash)history.replaceState(null,'','#/home');render();}
init();
void initGameAssets();
void loadTrees();
void loadPublicLfg();
void loadGuilds();
void loadVerifiedIndex();
void loadPublishedWikiArticles();
window.addEventListener('arcana:wiki-published',()=>void loadPublishedWikiArticles());
