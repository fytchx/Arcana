import {esc,icon} from './ui.js';

// All shortcuts are explicit destinations. No guessed mechanical links.
export const NAV_DESTINATIONS=Object.freeze({
 items:{label:'Browse equipment',detail:'Find an item in the Codex',route:'wiki/library',params:{kind:'item'},icon:'shield'},
 guides:{label:'Read player guides',detail:'Practical Season 2 walkthroughs',route:'wiki/guides',icon:'book'},
 reference:{label:'Explore game references',detail:'Browse all verified entries',route:'wiki/library',params:{kind:'all'},icon:'search'},
 search:{label:'Search Arcana',detail:'Find items, tools and guides',action:'search',icon:'search'},
 upgrade:{label:'Calculate upgrade costs',detail:'Open the equipment calculator',route:'calculators/upgrade',icon:'calculator'},
 pathfinder:{label:'Arcana Pathfinder',detail:'Plan upgrade materials across your whole loadout',route:'calculators/pathfinder',icon:'layers'},
 farm:{label:'Compare ML farming speed',detail:'Compare your actual ML XP per second',route:'calculators/ml-farm',icon:'sword'},
 compare:{label:'Compare equipment',detail:'Review two equipment bases',route:'calculators/compare',icon:'compare'},
 build:{label:'Open Build Studio',detail:'Plan gear, pets, skills and runes',route:'labs/build',icon:'flask'},
 runes:{label:'Rune Forge · Build Studio',detail:'Edit the rune grid in your build',route:'labs/runes',icon:'gem'},
 skills:{label:'Class Skills · Build Studio',detail:'Review class skill branches in your build',route:'labs/skills',icon:'git'},
 passives:{label:'Passive Tree · Build Studio',detail:'Explore your build’s passive tree',route:'labs/passives',icon:'layers'},
 petlab:{label:'Configure pet loadout',detail:'Plan your four equipped pets',route:'labs/pets',icon:'paw'},
 compound:{label:'Calculate Pet Compound',detail:'Preview rarity and Drop Bonus',route:'calculators/pet',icon:'paw'},
 affixes:{label:'Calculate pet affix costs',detail:'Plan Pet Shards to a target level',route:'calculators/affixes',icon:'calculator'},
 guildtree:{label:'Plan guild skill points',detail:'Allocate, compare and share guild bonuses',route:'labs/guild-tree',icon:'shield'},
 guilds:{label:'Find a guild',detail:'Browse active recruitment listings',route:'lfg/guilds',icon:'users'},
 raids:{label:'Find a raid',detail:'Browse live raid groups',route:'lfg/raids',icon:'users'},
 compoundGuide:{label:'Understand Pet Compound',detail:'Read the Wiki explanation',route:'wiki/article',params:{id:'pet-compound'},icon:'book'},
 runeGuide:{label:'Understand the Rune Grid',detail:'See Monster Level unlocks',route:'wiki/article',params:{id:'rune-grid'},icon:'book'},
 monsterGuide:{label:'Farm Monster Level efficiently',detail:'Read the farming guide',route:'wiki/article',params:{id:'monster-level'},icon:'book'},
 seasonGuide:{label:'Season 2 essentials',detail:'Review the major gameplay systems',route:'wiki/article',params:{id:'season-2'},icon:'book'},
 buildGuide:{label:'Explore a connected build guide',detail:'See a full build linked to tools',route:'wiki/article',params:{id:'guide-builds'},icon:'book'},
 pets:{label:'Browse pet companions',detail:'View pets in the Codex',route:'wiki/library',params:{kind:'pet'},icon:'paw'},
 petAffixes:{label:'Browse pet affixes',detail:'Inspect verified pet affix records',route:'wiki/library',params:{kind:'pet-affix'},icon:'paw'},
 petBonuses:{label:'Browse pet bonuses',detail:'Inspect hatch bonuses',route:'wiki/library',params:{kind:'pet-bonus'},icon:'paw'},
 runewords:{label:'Browse runewords',detail:'Read rune combinations',route:'wiki/library',params:{kind:'runeword'},icon:'gem'},
 skillRecords:{label:'Browse class skills',detail:'Find individual skills',route:'wiki/library',params:{kind:'class-skill'},icon:'git'},
 biomeRecords:{label:'Browse biomes',detail:'Explore areas and monsters',route:'wiki/library',params:{kind:'biome'},icon:'layers'},
 materials:{label:'Browse materials',detail:'Find materials and their descriptions',route:'wiki/library',params:{kind:'material'},icon:'box'},
 guildGuide:{label:'Guild Skill Tree guide',detail:'Understand points, rank gates and Ascension',route:'wiki/article',params:{id:'guild-planning'},icon:'book'},
 affixGuide:{label:'Pet Affix upgrade guide',detail:'Learn shard costs and affix limits',route:'wiki/article',params:{id:'pet-affix-costs'},icon:'book'},
 forgeGuide:{label:'Learn the Forge',detail:'How slot-based upgrades work',route:'wiki/article',params:{id:'forge'},icon:'book'},
 gemGuide:{label:'Learn sockets and gems',detail:'Gem locations, fusing and recutting',route:'wiki/article',params:{id:'gems'},icon:'gem'},
 raidGuide:{label:'Rift Raid basics',detail:'Prepare for Titan fights and team play',route:'wiki/article',params:{id:'rift-raids'},icon:'users'},
 rarityGuide:{label:'Equipment rarity guide',detail:'Drop thresholds and reforging',route:'wiki/article',params:{id:'drop-rarities'},icon:'shield'}
});

export const NAV_FLOWS=Object.freeze({
 calculators:['upgrade','pathfinder','compound','affixes','compare','farm'],
 labs:['build','runes','skills','guildtree'],
 'calculators/ml-farm':['monsterGuide','biomeRecords','skillRecords'],
 'calculators/pathfinder':['build','materials','farm','upgrade'],
 'calculators/upgrade':['items','compare','forgeGuide','build'],
 'calculators/compare':['items','upgrade','rarityGuide','build'],
 'calculators/pet':['compoundGuide','petlab','petBonuses'],
 'calculators/affixes':['petAffixes','petlab','affixGuide'],
 'labs/build':['pathfinder','guides','items','gemGuide','runes'],
 'labs/runes':['runeGuide','runewords','build'],
 'labs/skills':['skillRecords','passives','build'],
 'labs/passives':['seasonGuide','skills','build'],
 'labs/pets':['compound','affixes','affixGuide','pets'],
 'labs/guild-tree':['guilds','raids','guildGuide','seasonGuide'],
 'lfg/raids':['guilds','guildtree','raidGuide'],
 'lfg/guilds':['guildtree','raids','guides'],
 'lfg/guild':['guildtree','guilds','raids'],
 'lfg/guild/new':['guildtree','guilds','raids'],
 'lfg/guild/edit':['guildtree','guilds','raids'],
 'wiki/guides':['build','reference','guildGuide','search'],
 'wiki/library':['guides','build','search']
});
export const HOME_START=['items','build','guildtree','guides','raids','upgrade'];

const paramsText=params=>params?new URLSearchParams(params).toString():'';
export function navDestination(id){
 const dest=NAV_DESTINATIONS[id];
 return dest?{...dest,id}:null;
}
export function routeLinkData(dest){
 if(!dest||typeof dest!=='object')return '';
 const params=paramsText(dest.params);
 if(dest.route)return 'data-route="'+esc(dest.route)+'"'+(params?' data-params="'+esc(params)+'"':'');
 if(dest.action)return 'data-action="'+esc(dest.action)+'"';
 return '';
}
export function navCard(dest,compact=false){
 if(!dest)return '';
 return '<button type="button" class="arcanaConnection'+(compact?' compact':'')+'" '+routeLinkData(dest)+' aria-label="'+esc(dest.label)+'">'+
 '<span class="arcanaConnectionIcon">'+icon(dest.icon||'arrow',compact?18:21)+'</span>'+
 '<span class="arcanaConnectionText"><strong>'+esc(dest.label)+'</strong>'+
 (compact?'':'<small>'+esc(dest.detail||'')+'</small>')+'</span>'+
 '<span class="arcanaConnectionArrow">'+icon('arrow',16)+'</span></button>';
}
export function navCards(keys,{compact=false}={}){
 const seen=new Set();
 return (keys||[]).map(key=>{
  const dest=typeof key==='string'?navDestination(key):key;
  if(!dest||seen.has(dest.route+'?'+paramsText(dest.params)))return '';
  seen.add(dest.route+'?'+paramsText(dest.params));
  return navCard(dest,compact);
 }).join('');
}
export function relatedDestinations(route){
 return (NAV_FLOWS[route]||[]).map(navDestination).filter(Boolean);
}
export function connectedNext(route){
 if(['home','labs','calculators','wiki','lfg'].includes(route)||route.startsWith('wiki/')||route==='reference/detail')return '';
 const related=relatedDestinations(route);
 if(!related.length)return '';
 return '<section class="arcanaNext" aria-label="Recommended next steps"><div class="arcanaNextHead"><span class="eyebrow">CONNECTED ARCANA</span><h2>Where to next?</h2><p>Jump to a relevant guide, reference or tool. Your current work stays saved.</p></div>'+
 '<div class="arcanaConnections">'+related.map(dest=>navCard(dest)).join('')+'</div></section>';
}
export function homeStart({compact=false}={}){
 const heading=compact?'':'<div class="arcanaNextHead"><span class="eyebrow">QUICK START</span><h2>What do you want to do?</h2></div>';
 return '<section class="arcanaStart" aria-label="Task shortcuts">'+heading+'<div class="arcanaStartGrid">'+navCards(HOME_START,{compact:true})+'</div></section>';
}
