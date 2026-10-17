/* Single public object registry for the connected demo. Real-data ingestion comes later. */
export const demoBuilds = {
  'warrior-retaliation-zane': {
    id:'warrior-retaliation-zane',
    title:'Zane’s Retaliation Warrior · Season 2',
    className:'Warrior',
    owner:'Zane (kiffens_)',
    version:'PLAYER GUIDE',
    monsterLevel:208,
    summary:'My retaliation-focused Warrior build: Defense, Block Chance, Strength and a four-pet setup.',
    equipment:{},
    skills:['Deflection','Bulwark Stance'],
    runes:['Fury','Fortitude','Vitality','Wisdom','Precision'],
    runeBoard:[],
    pets:['Defense','Increased Strength','Retaliation','Retaliation'],
    petSetup:[
      {equipped:true,name:'Defense target',hatchBonus:'defense'},
      {equipped:true,name:'% Strength target',hatchBonus:'increased_strength'},
      {equipped:true,name:'Retaliation target 1',hatchBonus:'retaliation'},
      {equipped:true,name:'Retaliation target 2',hatchBonus:'retaliation'}
    ],
    notes:'My priorities are Retaliation %, Defense, Block Chance and Strength, in that order. I aim for red gems in armor and jewelry, blue in the weapon and whatever is useful on the Torch. My four pet targets are Defense, Increased Strength and two Retaliation bonuses. Current snapshot: Lv 196, ML 208, 2,145 GS, 7.67M Defense and 84% Block. My displayed retaliation ranges from 6.76B to 9.66B with an 8.21B midpoint. Blocked enemy attacks receive 50% more retaliation damage. Crit Chance, Crit Damage, Double Hit and Double Damage all interact with retaliation, making offensive secondaries worth comparing with more Defense or Retaliation %. The strongest mix may shift as the build progresses. I have left the specific gear choices, pet Compound levels, rune positions and skill-point allocations open in the planner so you can customize them for your own character.'
  },
  'warrior-retaliation-demo': {
    id:'warrior-retaliation-demo', title:'Warrior Retaliation · demonstration build', className:'Warrior', owner:'Arcana Demo', version:'DEMO',
    summary:'An illustrative, editable example showing how an entire guide build opens inside Build Studio. Not a recommended or verified build.',
    equipment:{weapon:'broken-sword',head:'leather-cap',chest:'rags',hands:'worn-gloves',feet:'sandals-of-starszy',offhand:null,ring:null,neck:null},
    skills:['Retaliation'],runes:['Fury','Fortitude','Precision'],pets:['Attack Damage','Strength'],
    notes:'All slot choices are interface demonstrations. Actual build viability, skill requirements, affix values and performance have not been verified.'
  }
};
export const entities = [
 {id:'broken-sword',kind:'item',title:'Broken Sword',subtitle:'Equipment · Weapon',slot:'weapon',keywords:'sword weapon main hand gear',description:'Equipment reference preview. Verified item attributes and upgrade formulas will be imported from the current game data.'},
 {id:'rags',kind:'item',title:'Rags',subtitle:'Equipment · Chest',slot:'chest',keywords:'armor chest body gear starter',description:'Equipment reference preview. Exact stats and upgrade requirements have not been loaded.'},
 {id:'leather-cap',kind:'item',title:'Leather Cap',subtitle:'Equipment · Head',slot:'head',keywords:'helmet head armor hat gear',description:'Equipment reference preview. Exact stat values are intentionally not guessed.'},
 {id:'worn-gloves',kind:'item',title:'Worn Gloves',subtitle:'Equipment · Hands',slot:'hands',keywords:'glove gloves hands armor gear',description:'Equipment reference preview. Open comparison or upgrade planning with this item preselected.'},
 {id:'sandals-of-starszy',kind:'item',title:'Sandals of Starszy',subtitle:'Equipment · Footwear',slot:'feet',keywords:'boots footwear shoes sandals feet gear',description:'Footwear reference preview. Choose Compare or Upgrade Costs without reselecting the item.'},
 {id:'berserker-greaves',kind:'item',title:'Berserker Greaves',subtitle:'Equipment · Greaves',slot:'feet',keywords:'boots greaves feet armor footwear berserker',description:'Reference stub. Detailed gear stats and set effects require verified game data.'},
 {id:'warrior-retaliation-demo-guide',kind:'guide',title:'Warrior Retaliation · Connected Guide',subtitle:'ArcanaWiki · Guide demonstration',keywords:'warrior retaliation build guide skill tree setup complete gear',description:'A sample article with a full inspectable build. Open it in Build Studio with equipment, skills, runes and pets loaded.',buildId:'warrior-retaliation-demo'},
 {id:'ml-farming-guide',kind:'guide',title:'Monster Level Farming',subtitle:'ArcanaWiki · Progression',keywords:'ml monster level farming xp extra kill biome exp gain',description:'Example guide showing how concise information and contextual links will work. Mechanics are pending final Season 2 review.'},
 {id:'pet-equalisation',kind:'mechanic',title:'Pet Equalisation',subtitle:'ArcanaWiki · Mechanics',keywords:'pet equalisation compound weakest equipped cap season',description:'Seasonal equalisation uses the weakest equipped pet Compound level +10 as the effective cap (from a previously verified game configuration).'},
 {id:'retaliation',kind:'mechanic',title:'Retaliation',subtitle:'ArcanaWiki · Warrior mechanic',keywords:'warrior retaliation skill attack defense',description:'Warrior build-related mechanic. Details and numerical scaling will be sourced from the verified data layer.'},
 {id:'upgrade-costs',kind:'tool',title:'Upgrade Cost Calculator',subtitle:'Arcana Calculators',keywords:'item upgrade costs cost materials gold awakened reforging calculator',description:'Send an item directly into the upgrade planner.',route:'calculators/upgrade'},
 {id:'pet-lab',kind:'tool',title:'Pet Lab',subtitle:'Arcana Labs · Four equipped pets',keywords:'pet lab compounds pets equalisation pet affix planner equipment build',description:'Edit four equipped pet slots and calculate effective Compound caps for your active Build Studio draft.',route:'labs/pets'},
 {id:'pet-compound',kind:'tool',title:'Pet Compound Calculator',subtitle:'Arcana Calculators',keywords:'pet compound equalisation rarity calculator',description:'Plan pet Compound progression with imported game rules.',route:'calculators/pet'},
 {id:'pet-affixes',kind:'tool',title:'Pet Affix Planner',subtitle:'Arcana Calculators',keywords:'pets pet affix reroll pity strength attack',description:'Compare pet affix options when verified data has been connected.',route:'calculators/affixes'},
 {id:'build-studio',kind:'tool',title:'Build Studio',subtitle:'Arcana Labs',keywords:'build equipment skills pets runes planner class',description:'Open, inspect and adapt full builds.',route:'labs/build'},
 {id:'rune-forge',kind:'tool',title:'Rune Forge',subtitle:'Arcana Labs',keywords:'runes runeword shapes secondary rune grid',description:'Inspect rune layouts and draft combinations.',route:'labs/runes'},
 {id:'skill-tree',kind:'tool',title:'Skill Tree Simulator',subtitle:'Arcana Labs',keywords:'class skills passive skill tree points simulator',description:'Open a skill tree planning workspace.',route:'labs/skills'},
 {id:'item-codex',kind:'tool',title:'Item Codex',subtitle:'ArcanaWiki',keywords:'item equipment gear materials currencies database',description:'Browse searchable item references and contextual actions.',route:'wiki/items'},
 {id:'raid-finder',kind:'community',title:'Rift Raid Finder',subtitle:'ArcanaLFG',keywords:'raid rift titan groups party lfg',description:'Locate raid groups and planning features. The existing LFG service remains operational.',route:'lfg/raids'},
 {id:'guild-listings',kind:'community',title:'Guild Listings',subtitle:'ArcanaLFG',keywords:'guild recruitment member requirements guilds',description:'Browse and eventually search public guild recruitment entries.',route:'lfg/guilds'}
];
export const entityById = new Map(entities.map(x=>[x.id,x]));
export const itemList = entities.filter(x=>x.kind==='item');
export const guideList = entities.filter(x=>x.kind==='guide');
export const demoGuideSections = [
 {heading:'The idea',body:'A Warrior-centered planning example with equipment, one sample skill focus, rune families, and pet slots. It exists to demonstrate inspection and cross-tool editing, not to claim an optimal Season 2 build.'},
 {heading:'How to use it',body:'Open the complete build below. All its sections load into Build Studio, where you can inspect each equipped item, send gear to Upgrade Costs, change a slot, or clone the example into your own local draft.'},
 {heading:'From reading to building',body:'Nothing must be selected again. The same item IDs and build IDs are shared across Wiki, Search, Calculators, and Labs.'}
];
export function tokenize(v){return (v||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean)}
export function searchCatalog(query,extra=[]){
 const q=query.trim().toLowerCase();if(!q)return [];
 const tokens=tokenize(q),source=[...entities,...extra];
 return source.map(e=>{const name=e.title.toLowerCase(),all=(e.title+' '+e.subtitle+' '+e.keywords+' '+(e.description||'')).toLowerCase();let score=0;
 if(name===q)score+=100;else if(name.startsWith(q))score+=65;else if(name.includes(q))score+=42;
 if(all.includes(q))score+=25;
 if(tokens.every(t=>all.includes(t)))score+=15;
 if(tokens.some(t=>!all.includes(t)))score=0;
 return {...e,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
}
