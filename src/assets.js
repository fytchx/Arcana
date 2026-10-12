/**
 * Arcana asset resolver: original IdleArc sprites stay immutable;
 * theme variables affect ONLY wrapper chrome. Canonical game IDs must
 * replace provisional catalog IDs when the verified game data arrives.
 */
const EMPTY = Object.freeze({tile:48,cols:18,rows:18,width:864,height:864,mapping:{},count:0,version:0});
let manifest=EMPTY;
let assetState='pending';
let lastError='';
const validNum=n=>Number.isInteger(n)&&n>=0;
export function loadStatus(){return {state:assetState,count:manifest.count,version:manifest.version,error:lastError}}
export function spriteCandidates(entry){
  if(!entry || !entry.id)return [];
  const slug=entry.id.toLowerCase().replace(/[^a-z0-9-]/g,'-');
  const fromTitle=String(entry.title||'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const prefixes=entry.kind==='item'?['item','gear','equipment','armor','weapon','jewelry','offhand']:
    entry.kind==='material'?['material','currency']:
    entry.kind==='currency'?['currency']:
    entry.kind==='pet'?['pet']:
    entry.kind==='rune'?['rune']:
    entry.kind==='skill'?['skill']:[];
  const keys=[];
  for(const p of prefixes)for(const s of [slug,fromTitle])if(s)keys.push(`${p}:${s}`);
  return [...new Set(keys)];
}
export function spriteFor(entry){
  if(!entry || entry.kind==='guide')return null;
  let found=null;let representative=false;
  const keys=spriteCandidates(entry);
  found=keys.find(k=>Object.hasOwn(manifest.mapping,k));
  if(!found&&entry.kind==='item'){
    // The game atlas keys are human names + tier: item:Broken Sword:T1.
    // Never invent an equipped rarity. Use the first available icon only
    // as a representative in preview contexts when tier is unspecified.
    const name=String(entry.title||'').trim();
    const tier=typeof entry.tier==='string'&&/^(?:T[1-6]|A\d+)$/.test(entry.tier)?entry.tier:null;
    if(tier){const exact=`item:${name}:${tier}`;if(Object.hasOwn(manifest.mapping,exact))found=exact}
    else{
      const variants=Object.keys(manifest.mapping).filter(k=>k.startsWith(`item:${name}:`)&&/:(?:T[1-6]|A\d+)$/.test(k));
      const rank=k=>{const t=k.match(/:T([1-6])$/);return t?Number(t[1]):100+Number(k.match(/:A(\d+)$/)?.[1]||0)};
      variants.sort((a,b)=>rank(a)-rank(b));
      if(variants.length){found=variants[0];representative=true}
    }
  }
  if(!found)return null;
  const index=manifest.mapping[found];
  if(!validNum(index)||index>=manifest.cols*manifest.rows)return null;
  return {key:found,index,cols:manifest.cols,rows:manifest.rows,tile:manifest.tile,version:manifest.version,representative};
}

export function hasGameSprite(entry){return !!spriteFor(entry)}
/** Return a div with correct sprite crop, or neutral and explicitly unavailable placeholder. */
export function gameArt(entry,size=44){
 const d=spriteFor(entry), px=Math.max(20,Math.min(120,Number(size)||44));
 if(!d){
   return `<span class="gameArt gameArt-missing" data-art-status="missing" title="Game icon not mapped"><span aria-hidden="true">◇</span></span>`;
 }
 const x=d.index%d.cols, y=Math.floor(d.index/d.cols);
 const bx=d.cols>1?100*x/(d.cols-1):0,by=d.rows>1?100*y/(d.rows-1):0;
 return `<span class="gameArt gameArt-original" data-asset-key="${d.key.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" title="${d.representative?'Representative item artwork · tier not verified':'Original IdleArc sprite'} · atlas v${d.version}" style="background-image:url('/game-assets/atlas');background-size:${d.cols*100}% ${d.rows*100}%;background-position:${bx.toFixed(6)}% ${by.toFixed(6)}%"></span>`;
}
export function canonicalArtReference(entry){const d=spriteFor(entry);return d?{entityId:entry.id,assetId:`idlearc.${d.key}`,atlasVersion:d.version,spriteIndex:d.index,source:'legacy_atlas',status:'needs_rights_review'}:null}
export async function initGameAssets(){
  if(assetState==='ready'||assetState==='loading')return;
  assetState='loading';lastError='';
  // Separate requests: official art must never depend on the legacy atlas.
  const officialRequest=initOfficialCodexAtlas();
  try{
    const response=await fetch('/game-assets/map',{cache:'no-store',signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    if(!data||!validNum(data.tile)||data.tile!==48||!validNum(data.cols)||data.cols<1||!data.mapping||typeof data.mapping!=='object')throw new Error('Invalid atlas manifest');
    if(Object.values(data.mapping).some(x=>!validNum(x)||x>=data.cols*data.rows))throw new Error('Out-of-bounds sprite mapping');
    manifest={...data,mapping:Object.fromEntries(Object.entries(data.mapping).filter(([k])=>/^(?:item:[A-Za-z0-9 .’\'-]+:(?:T[1-6]|A\d+)|[a-z][a-z0-9-]*:[a-z0-9-]+)$/.test(k)))};
    assetState='ready';
  }catch(error){assetState='unavailable';lastError=String(error.message||error).slice(0,110)}
  await officialRequest;
  if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:assets-loaded'));
}


/* Official Codex art is resolved here in source, never injected by a gateway.
   Ambiguous or missing art is left unmapped rather than showing the wrong item.
   The legacy atlas remains available independently to the other Arcana Labs. */
let officialCodexAtlas=null;
let officialManifest=null;
let officialState='pending';
const officialSlug=v=>String(v??'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const ART_KIND_CATEGORIES=Object.freeze({
  item:['items','equipment'], material:['materials'], currency:['currency','currencies','icons'],
  pet:['pets'], 'class-skill':['skills'], monster:['monsters','tower-monsters'], biome:['biomes'],
  rune:['runes'], passive:['passives']
});
export const officialArtStatus=()=>({state:officialState,categories:Object.keys(officialCodexAtlas||{}),hasManifest:!!officialCodexAtlas});
const escapeAttribute=str=>String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
function validGroup(group){
 return !!group&&Number.isInteger(group.cols)&&group.cols>0&&Number.isInteger(group.rows)&&group.rows>0&&
        group.mapping&&typeof group.mapping==='object'&&!Array.isArray(group.mapping);
}
const keySuffix=key=>officialSlug(String(key).split(':').pop().replace(/_/g,'-'));
const classSlug=entry=>officialSlug(entry?.className||(entry?.facts||[]).find(f=>Array.isArray(f)&&String(f[0]).toLowerCase()==='class')?.[1]||'').split('-')[0];
/** Pure matching helper. Can be audited on the backend with the same game data. */
export function resolveOfficialSprite(entry,categories=officialCodexAtlas){
 if(!entry||!categories)return null;
 const kind=entry.gameKind||entry.kind, title=officialSlug(entry.title);
 const groups=ART_KIND_CATEGORIES[kind];if(!title||!groups)return null;
 const preferredClass=kind==='class-skill'?classSlug(entry):'';
 // A possessive in a game item title is omitted in some original icon keys.
 // Pet sheets sometimes suffix the species with -1 for its first skin.
 // These are explicit, distinct match types rather than fabricated exact hits.
 const aliases=[];
 if(kind==='item'&&/[’']s\b/i.test(entry.title))aliases.push({slug:officialSlug(entry.title.replace(/[’']s\b/gi,'')),matchType:'name-alias'});
 if(kind==='currency'&&title.endsWith('ies'))aliases.push({slug:title.slice(0,-3)+'y',matchType:'name-alias'});
 // The game labels this pet Octopusia, while its exact original art key is octopussy.
 if(kind==='pet'&&title==='octopusia')aliases.push({slug:'octopussy',matchType:'name-alias'});
 if(kind==='pet')aliases.push({slug:title+'-1',matchType:'representative-pet'});
 const candidateSets=[{slug:title,matchType:'exact'},...aliases];
 for(const {slug,matchType} of candidateSets){
  const matches=[];
  for(const category of groups){
   const group=categories[category];if(!validGroup(group))continue;
   for(const [key,index] of Object.entries(group.mapping)){
    if(keySuffix(key)!==slug||!Number.isInteger(index)||index<0||index>=group.cols*group.rows)continue;
    const parts=key.split(':');
    if(preferredClass&&kind==='class-skill'&&parts.length>1&&officialSlug(parts[0])!==preferredClass)continue;
    matches.push({category,key,index,cols:group.cols,rows:group.rows,matchType});
   }
  }
  if(matches.length===1)return matches[0];
  // Two overlapping atlases can contain the same item. Never choose a
  // conflicting sprite without an explicit original-game preference.
  if(kind==='item'&&matches.length>1){
   const primary=matches.filter(m=>m.category==='items');
   if(primary.length===1&&matches.every(m=>m.key===primary[0].key))return primary[0];
  }
 }
 return null;
}
export async function initOfficialCodexAtlas(){
 if(officialState==='ready'||officialState==='loading')return;
 officialState='loading';
 try{
  const response=await fetch('/official-art/manifest.json',{cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error('Artwork manifest HTTP '+response.status);
  const payload=await response.json(),groups=payload?.categories;
  if(!groups||typeof groups!=='object'||!Object.keys(groups).length)throw Error('Invalid official artwork manifest');
  const validated=Object.fromEntries(Object.entries(groups).filter(([k,v])=>/^[a-z][a-z0-9-]*$/.test(k)&&validGroup(v)));
  if(!Object.keys(validated).length)throw Error('No valid artwork groups');
  officialCodexAtlas=validated;
  officialManifest={categories:validated,categoryEmblems:payload.categoryEmblems||{}};
  officialState='ready';
 }catch(e){officialState='unavailable';console.warn('Official Codex artwork unavailable; using verified legacy sprites where possible',String(e));}
}
/** Returns an official game-art sprite only for uniquely verified mappings.
 * Existing legacy artwork may be used for equipment and materials. */
export function resolveOfficialEmblem(entry,manifest=officialManifest){
 const kind=entry?.gameKind||entry?.kind;
 const emblem=manifest?.categoryEmblems?.[kind];
 if(!Array.isArray(emblem)||emblem.length!==2)return null;
 const [category,key]=emblem;
 const group=manifest.categories?.[category];
 if(!validGroup(group))return null;
 const index=group.mapping[key];
 if(!Number.isInteger(index)||index<0||index>=group.cols*group.rows)return null;
 return {category,key,index,cols:group.cols,rows:group.rows,isCategoryEmblem:true};
}
export const hasCodexOfficialArt=entry=>!!(resolveOfficialSprite(entry)||resolveOfficialEmblem(entry));
export function codexOfficialArt(entry,size=44){
 const kind=entry?.gameKind||entry?.kind;
 const sprite=resolveOfficialSprite(entry)||resolveOfficialEmblem(entry);
 if(sprite){
  const x=sprite.index%sprite.cols,y=Math.floor(sprite.index/sprite.cols);
  const bx=sprite.cols>1?100*x/(sprite.cols-1):0,by=sprite.rows>1?100*y/(sprite.rows-1):0;
  return '<span class="gameArt gameArt-original codexOfficialArt" data-art-status="'+(sprite.isCategoryEmblem?'category-emblem':sprite.matchType==='representative-pet'?'representative':sprite.matchType==='name-alias'?'name-alias':'official')+'" data-asset-key="'+escapeAttribute(sprite.category+':'+sprite.key)+'" title="'+(sprite.isCategoryEmblem?'Category artwork · not item-specific':sprite.matchType==='representative-pet'?'Representative pet artwork · variant unspecified':'IdleArc artwork')+'" style="background-image:url(\'/official-art/'+sprite.category+'.webp\');background-size:'+(sprite.cols*100)+'% '+(sprite.rows*100)+'%;background-position:'+bx.toFixed(6)+'% '+by.toFixed(6)+'%"></span>';
 }
 // Keep correct existing tier art rather than an unrelated generic picture.
 if(['item','material','currency','pet'].includes(kind)&&spriteFor(entry))return gameArt(entry,size);
 return '<span class="gameArt gameArt-missing" data-art-status="'+(officialState==='loading'?'loading':'unmatched')+'" title="No verified art mapping" aria-label="Artwork unavailable">◇</span>';
}
