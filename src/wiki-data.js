/* ArcanaWiki editorial content. Each practical claim is Season 2 scoped.
   The October 9 config is the canonical source of game entities and stats.
   Human-written articles are concise, not speculative, and do not imply optimal builds. */
export const WIKI_ARTICLES=Object.freeze([
 {id:'pet-compound',title:'Pet Compound & Equalisation',category:'Pets',readTime:'2 min',summary:'Understand Compound levels, your equipped-pet cap, and what affixes do not change.',keywords:'pet compound equalisation seasonal permanent hatch bonus weakest equipped four pets affixes all class skills',sections:[
  {title:'The quick answer',body:'Compound levels improve a pet’s main Hatch Bonus. They do not increase the pet’s separate evolved affixes. Equipped pets are subject to equalisation.'},
  {title:'Seasonal versus Permanent',body:'Seasonal characters have an equalisation allowance of 10 levels; Permanent characters have an allowance of 25 levels. The effective Compound cap is the weakest equipped level plus that allowance. An empty equipped-pet position counts as level 0.'},
  {title:'Example',body:'If equipped Compound levels are 20, 8, 12, and 12, the seasonal effective cap is 18. The +20 pet contributes its main bonus as if it were +18. Its actual Compound level is preserved.'},
  {title:'Affixes are a different system',body:'Pets can unlock up to four evolved affix slots. Affix type, rank, and reroll rules are separate from Compound. Do not use the Compound calculator to calculate an affix’s value.'}],actions:[{label:'Open Compound Calculator',route:'calculators/pet',icon:'calculator'},{label:'Configure Pet Loadout',route:'labs/pets',icon:'paw'}],source:'game-config'},
 {id:'rune-grid',title:'Rune Grid Growth',category:'Runes',readTime:'2 min',summary:'See when Monster Level expands your rune board, from 2×2 to 6×7.',keywords:'rune grid growth monster level size milestones 2x2 6x7 expansion 150 220 300',sections:[
  {title:'The quick answer',body:'The rune grid grows as Monster Level increases. Character level does not determine its dimensions, and you do not manually purchase the grid expansions.'},
  {title:'Progression milestones',table:[['Monster Level','Grid'],['Start','2 × 2'],['10','3 × 3'],['30','4 × 3'],['45','5 × 3'],['65','6 × 3'],['90','6 × 4'],['150','6 × 5'],['220','6 × 6'],['300','6 × 7']]},
  {title:'Plan without losing your work',body:'Arcana stores rune layouts separately from the currently unlocked grid size. Runes extending beyond a smaller Monster Level board become inactive, not deleted, and become available again when you raise Monster Level.'}],actions:[{label:'Open Rune Forge',route:'labs/runes',icon:'gem'},{label:'Inspect Build Studio',route:'labs/build',icon:'flask'}],source:'game-and-player-verified'},
 {id:'monster-level',title:'Monster Level Farming',category:'Progression',readTime:'3 min',summary:'Optimize Monster Level progress by comparing kills per second and XP per kill.',keywords:'monster level farming ml monster xp per kill weakest strongest exp gain early season 2 farming',sections:[
  {title:'The quick answer',body:'Monster Level progress depends on Monster Level XP earned per unit of time. Compare both kill speed and XP per kill when choosing which monster to farm.'},
  {title:'EXP Gain and Monster Level',body:'EXP Gain is for character progression, not a multiplier on Monster Level XP. Character levels still matter because they provide access to more skill points.'},
  {title:'Season 2 monster differences',body:'From Murky Depths onward, the weakest monster in a biome awards 10% less Monster Level XP and the strongest awards 10% more, relative to that biome’s normal value. Because XP now varies, the lowest-HP monster is not automatically the best farm in every biome.'},
  {title:'Choose efficiently',body:'Test several monsters. A weaker monster can still be best if it dies sufficiently faster. Calculate XP per second rather than choosing by the largest XP reward or the highest HP alone.'}],actions:[{label:'Browse Biomes & Monsters',route:'wiki/library?kind=biome',icon:'book'},{label:'Search Monster Levels',route:'wiki/library?kind=monster',icon:'search'}],source:'official-patch',sourceUrl:'https://idlearc.com/patch-notes/1-3-1'},
 {id:'season-2',title:'Season 2 Essentials',category:'Getting Started',readTime:'3 min',summary:'The core systems that matter when planning a new Season 2 character.',keywords:'season 2 guide beginner start forge equipment gems raids druid torch guild',sections:[
  {title:'Your character',body:'Season 2 added the Druid as a fifth class. Your class has three skill branches, and the passive tree and class tree use separate point allocations.'},
  {title:'Equipment and upgrades',body:'The Forge tracks upgrade progression on gear slots. Equipment items can be switched without losing that slot’s upgrade progression. A Torch has its own separate slot.'},
  {title:'Runes and pets',body:'The rune grid grows with Monster Level. Rune families provide primary stats, and placed runes can have a chosen secondary. Compound affects a pet’s main Hatch Bonus, while evolved affixes follow separate rules.'},
  {title:'Raids and community',body:'Rift Raids are cooperative fights for groups of two to four. ArcanaLFG helps you find a group and coordinate without replacing the in-game raid finder.'}],actions:[{label:'Open Character Planner',route:'labs/build',icon:'flask'},{label:'Explore Raid Groups',route:'lfg/raids',icon:'users'}],source:'official-patch',sourceUrl:'https://idlearc.com/patch-notes/1-3-1'},
 {id:'guide-builds',title:'Inspect a Complete Guide Build',category:'Build Guides',readTime:'2 min',summary:'See how a full guide build opens directly in Build Studio, ready to inspect or copy.',keywords:'guide interactive inspect full build studio copy equipment runes pets skills sharing',sections:[
  {title:'A guide is a starting point',body:'A connected guide can include equipment, rune layout, pet setup, class skills, passive allocations, and explanatory notes as one inspectable package.'},
  {title:'Inspect, then make a copy',body:'Open the embedded build in Build Studio to examine its configuration. Copy it into a local draft before making changes. The published guide build remains unchanged.'},
  {title:'Learn while experimenting',body:'Tap an item to open its reference, compare it, or send it to Upgrade Costs. Rune and pet selections can be explored in their dedicated Labs tools without rebuilding the loadout from scratch.'},
  {title:'Demonstration status',body:'The available Warrior example illustrates the connected workflow. It is not a verified or recommended endgame build.'}],actions:[{label:'Open Demonstration Guide',route:'wiki/guide?id=warrior-retaliation-demo-guide',icon:'book'},{label:'Open Build Studio',route:'labs/build',icon:'flask'}],source:'arcana-workflow'}
]);
export const WIKI_CATEGORY_LIST=Object.freeze([
 ['all','Everything','book'],['item','Equipment','shield'],['material','Materials','gem'],['currency','Currencies','gem'],['class-skill','Class Skills','git'],['passive','Passives','layers'],['rune','Runes','gem'],['runeword','Runewords','link'],['pet','Pet Companions','paw'],['pet-bonus','Pet Bonuses','paw'],['pet-affix','Pet Affixes','paw'],['biome','Biomes','layers'],['monster','Monsters','sword'],['item-affix','Gear Affixes','spark']
]);
export const wikiArticleById=id=>WIKI_ARTICLES.find(x=>x.id===id)||null;
export const wikiArticleEntries=()=>WIKI_ARTICLES.map(a=>({id:'wiki:article:'+a.id,kind:'wikiarticle',title:a.title,subtitle:'ArcanaWiki · '+a.category,description:a.summary,keywords:a.keywords,route:'wiki/article?id='+a.id}));
export const matchingRecords=(entries,kind='all',query='')=>{
 const q=String(query).toLowerCase().replace(/[_-]/g,' ').trim(),ts=q.split(/\s+/).filter(Boolean);
 const filtered=entries.filter(e=>(kind==='all'||e.gameKind===kind)&&ts.every(t=>(e.title+' '+e.description+' '+e.keywords+' '+e.subtitle).toLowerCase().replace(/[_-]/g,' ').includes(t)));
 const relevance=e=>{const name=e.title.toLowerCase(),body=String(e.description||'').toLowerCase();return !q?0:name===q?110:name.startsWith(q)?75:name.includes(q)?50:body.includes(q)?25:5};
 return filtered.sort((a,b)=>relevance(b)-relevance(a)||a.title.localeCompare(b.title));
};
export function recordKindLabel(kind){return ({item:'Equipment',material:'Materials',currency:'Currencies',pet:'Pet Companions',biome:'Biomes',monster:'Monsters','class-skill':'Class Skills',passive:'Passives',rune:'Rune Families',runeword:'Runewords','pet-affix':'Pet Affixes','pet-bonus':'Pet Hatch Bonuses','item-affix':'Gear Affixes'})[kind]||'Reference';}

/* Editorial cross-links. Keep these specific and evidence-backed.
   Future articles can add related guide IDs, Codex categories, and tool links
   without changing routing or hardcoding UI components. */
export const WIKI_CONNECTIONS=Object.freeze({
 'pet-compound':{articles:['season-2','guide-builds'],collections:['pet','pet-bonus','pet-affix'],tools:['compound','petlab','affixes'],sectionLinks:{'The quick answer':['compound'],'Seasonal versus Permanent':['petlab'],'Affixes are a different system':['affixes','petAffixes']}},
 'rune-grid':{articles:['season-2','guide-builds'],collections:['rune','runeword'],tools:['runes','build'],sectionLinks:{'Progression milestones':['runes'],'Plan without losing your work':['build']},
 'monster-level':{articles:['season-2'],collections:['biome','monster'],tools:['skills','passives'],sectionLinks:{'Choose efficiently':['biomeRecords']},
 'season-2':{articles:['monster-level','pet-compound','rune-grid'],collections:['item','class-skill','pet'],tools:['build','guildtree','raids'],sectionLinks:{'Your character':['skills','passives'],'Equipment and upgrades':['upgrade','items'],'Runes and pets':['runes','compound'],'Raids and community':['raids','guildtree']},
 'guide-builds':{articles:['rune-grid','pet-compound'],collections:['item','rune','pet'],tools:['build','runes','compare'],sectionLinks:{'Inspect, then make a copy':['build'],'Learn while experimenting':['compare','runes','petlab']}
});
