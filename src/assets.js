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
  try{
    const response=await fetch('/game-assets/map',{cache:'no-store',signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    if(!data||!validNum(data.tile)||data.tile!==48||!validNum(data.cols)||data.cols<1||!data.mapping||typeof data.mapping!=='object')throw new Error('Invalid atlas manifest');
    if(Object.values(data.mapping).some(x=>!validNum(x)||x>=data.cols*data.rows))throw new Error('Out-of-bounds sprite mapping');
    manifest={...data,mapping:Object.fromEntries(Object.entries(data.mapping).filter(([k])=>/^(?:item:[A-Za-z0-9 .’\'-]+:(?:T[1-6]|A\d+)|[a-z][a-z0-9-]*:[a-z0-9-]+)$/.test(k)))};
    assetState='ready';
  }catch(error){assetState='unavailable';lastError=String(error.message||error).slice(0,110)}
  await initOfficialCodexAtlas();if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:assets-loaded'));
}


let officialCodexAtlas=null;
const officialSlug=v=>String(v||'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export async function initOfficialCodexAtlas(){
 try {
  const r=await fetch('/codex-art/manifest.json',{cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw Error('Artwork server HTTP '+r.status);
  const m=await r.json();
  if(!m?.categories?.skills?.mapping||!m?.categories?.monsters?.mapping||!m?.categories?.biomes?.mapping)throw Error('Invalid artwork manifest');
  officialCodexAtlas=m.categories;
 } catch(e){console.warn('Codex official art unavailable',String(e));}
}
export function codexOfficialArt(entry,size=44){
 const kind=entry.gameKind||entry.kind;
 if(kind==='item')return gameArt(entry,size);
 const cat={'class-skill':'skills',monster:'monsters',biome:'biomes',material:'materials'}[kind];
 if(!cat)return gameArt(entry,size);
 const grp=officialCodexAtlas?.[cat];
 if(!grp)return kind==='material'?gameArt(entry,size):'<span class="gameArt gameArt-missing" title="Loading official in-game art" aria-label="Official art loading">◇</span>';
 const slug=officialSlug(entry.title);
 let key=null;
 if(cat==='skills'){
  let cls=officialSlug(entry.className||(entry.facts||[]).find(([k])=>String(k).toLowerCase()==='class')?.[1]||'');
  if(cls.includes('-'))cls=cls.split('-')[0];
  const exact=cls+':'+slug;
  const possibilities=Object.keys(grp.mapping).filter(k=>k.replace(/_/g,'-')===exact);
  if(possibilities.length===1)key=possibilities[0];
  if(!key){const variants=Object.keys(grp.mapping).filter(k=>k.split(':').pop().replace(/_/g,'-')===slug);if(variants.length===1)key=variants[0];}
 }else{
  key=Object.keys(grp.mapping).find(k=>k.replace(/_/g,'-')===slug)||null;
 }
 if(!key){return kind==='material'?gameArt(entry,size):'<span class="gameArt gameArt-missing" data-art-status="unmatched" title="Official game art not mapped" aria-label="Official artwork not available">◇</span>'}
 const idx=grp.mapping[key], cols=grp.cols, rows=grp.rows;
 const x=idx%cols,y=Math.floor(idx/cols);
 const bx=cols>1?100*x/(cols-1):0,by=rows>1?100*y/(rows-1):0;
 return '<span class="gameArt gameArt-original codexOfficialArt" data-art-status="official" data-official-key="'+key.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'" title="Official IdleArc artwork" style="background-image:url(\'/codex-art/'+cat+'.webp\');background-size:'+(cols*100)+'% '+(rows*100)+'%;background-position:'+bx.toFixed(6)+'% '+by.toFixed(6)+'%"></span>';
}
