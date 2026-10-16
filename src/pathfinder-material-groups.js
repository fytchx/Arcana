/* Source-backed Pathfinder material grouping.
 * Never infer a monster's biome or tier from a material's name. An unresolved
 * source stays explicitly unverified until the game catalog identifies it. */
const factsOf=record=>Object.fromEntries((Array.isArray(record?.facts)?record.facts:[]).filter(x=>Array.isArray(x)&&x.length>=2).map(([k,v])=>[String(k).trim().toLowerCase(),String(v).trim()]));
const info=(r,...keys)=>{const f=factsOf(r);for(const k of keys)if(f[k.toLowerCase()])return f[k.toLowerCase()];return ''};
const number=(x)=>{const n=Number(String(x??'').replace(/[^0-9]/g,''));return Number.isSafeInteger(n)&&n>0?n:null};
const numericId=e=>number(String(e?.id||'').split(':').at(-1));
const kind=e=>e?.gameKind||e?.kind||'';
const text=v=>String(v||'').trim();
const sortText=(a,b)=>a.localeCompare(b,'en',{sensitivity:'base'});
const labelType=m=>String(m?.type||'').toLowerCase();
const keyFrom=(m)=>String(m?.slug||'').toLowerCase();
const materialIsMonster=m=>Boolean(m?.monster_id!==null&&m?.monster_id!==undefined&&m?.monster_id!=='')||/monster/.test(labelType(m));
export function sourceMaterialGroups(materials=[],sourceMaterials=[],catalog=[]){
 const entries=Array.isArray(catalog)?catalog:catalog?.entries||[];
 const monsters=entries.filter(e=>kind(e)==='monster');
 const biomes=entries.filter(e=>kind(e)==='biome');
 const catalogMaterials=entries.filter(e=>kind(e)==='material');
 const source=new Map((sourceMaterials||[]).map(m=>[keyFrom(m),m]));
 const byMonsterId=new Map(monsters.flatMap((m,i)=>{
  const ids=[numericId(m),number(info(m,'Monster ID','ID','Monster number'))].filter(Boolean);
  return ids.map(id=>[id,m]);
 }));
 const biomeByName=new Map(biomes.map((b,i)=>[text(b.title).toLowerCase(),{row:b,index:i}]));
 const groups=new Map();
 const entryMaterial=m=>catalogMaterials.find(e=>e.id==='game:material:'+m.slug||String(e.title).toLowerCase()===String(m.name).toLowerCase());
 for(const mat of materials||[]){
  const meta=source.get(keyFrom(mat))||{};
  const record=entryMaterial(mat);
  const targetId=number(meta.monster_id??mat.monster_id);
  const sourceName=text(meta.sourceMonster||mat.sourceMonster||info(record,'Monster','Dropped By','Dropped From','Source Monster'));
  const monster=(targetId?byMonsterId.get(targetId):null)||monsters.find(x=>String(x.title||'').toLowerCase()===sourceName.toLowerCase())||null;
  // Independent verified material references may identify the source when
  // the recipe's numeric monster link is absent.
  const biome=text(meta.sourceBiome||mat.sourceBiome||info(monster,'Biome')||info(record,'Biome','Source Biome','Found In'));
  const bi=biomeByName.get(biome.toLowerCase());
  const tier=text(meta.tier||mat.tier||info(monster,'Tier','Monster Tier')||info(record,'Tier','Monster Tier')||info(bi?.row,'Tier','Biome Tier'));
  const unlock=number(info(bi?.row,'Unlock Monster Level','Unlock ML','Monster Level','Minimum ML','Unlock Level','Order','Index'));
  const monsterNum=targetId||numericId(monster)||Number.MAX_SAFE_INTEGER;
  const groupKey=biome?'biome:'+biome.toLowerCase():materialIsMonster(meta)||materialIsMonster(mat)?'unknown-source':'special';
  if(!groups.has(groupKey))groups.set(groupKey,{id:groupKey,name:biome|| (groupKey==='special'?'Forge & special materials':'Biome not verified'),tier:biome?(tier||'Tier unverified'):'',order:biome?(unlock??numericId(bi?.row)??Number.MAX_SAFE_INTEGER-100):Number.MAX_SAFE_INTEGER,monsterOrder:monsterNum,kind:biome?'biome':groupKey==='special'?'special':'unknown',materials:[]});
  const g=groups.get(groupKey);
  if(g.tier==='Tier unverified'&&tier)g.tier=tier;
  g.monsterOrder=Math.min(g.monsterOrder,monsterNum);
  g.materials.push({...mat,sourceMonster:text(sourceName||monster?.title),biome:biome||'',tier:tier||'',sourceVerified:Boolean(biome)});
 }
 const arranged=[...groups.values()].sort((a,b)=>{
  if(a.kind!==b.kind)return ({biome:0,unknown:1,special:2}[a.kind]-{biome:0,unknown:1,special:2}[b.kind]);
  return a.order-b.order||a.monsterOrder-b.monsterOrder||sortText(a.name,b.name);
 });
 for(const g of arranged)g.materials.sort((a,b)=>{
  const ma=source.get(keyFrom(a))||{},mb=source.get(keyFrom(b))||{};
  return (number(ma.monster_id)||Number.MAX_SAFE_INTEGER)-(number(mb.monster_id)||Number.MAX_SAFE_INTEGER)||sortText(a.name,b.name);
 });
 return arranged;
}
export function recipeSlotStatus(snapshot){
 // The source exposes tier/rank recipes without any slot argument. No
 // ring/amulet-specific multipliers or formulas can be validated from it.
 const codex=snapshot?.codex||{};
 const specific=codex.slot_costs||codex.slotCosts||codex.slot_multipliers||codex.slotMultipliers;
 return specific?'slot-metadata-present':'not-verified';
}
