const MODERN='https://arcana-v3-preview-production.up.railway.app';
const LEGACY='https://arcana.up.railway.app';
const OFFICIAL='https://arcana-v4-official-art-production.up.railway.app';
const ART={'/game-assets/map':['/assets/atlas-map.json','application/json; charset=utf-8'],'/game-assets/atlas':['/assets/atlas.webp','image/webp'],'/game-assets/skill-tree':['/assets/skill-tree.json','application/json; charset=utf-8']};
const VERSION='arcana-wiki-v12-codex-browsing-live-20261012';
const REWRITES=['/src/assets.js','/src/wiki-data.js','/src/wiki-views.js','/src/app.js'];
const PATCH='arcana-v12-codex-browse-v1';
function patchJs(path,body){
 let t=body;
 if(path==='/src/assets.js'){
  const before="entry.kind==='material'?['material','currency']:";
  if(!t.includes(before))throw Error('Currency sprite prefix marker absent');
  t=t.replace(before,before+"\n    entry.kind==='currency'?['currency']:");

  const nameBefore="const fromTitle=String(entry.title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')";
  if(!t.includes(nameBefore))throw Error('Material name normalizer unavailable');
  t=t.replace(nameBefore,"const fromTitle=String(entry.title||'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-')");

  const marker="export function gameArt(entry,size=44){";
  if(!t.includes(marker))throw Error('Sprite renderer marker absent');
  t=t.replace(marker,"\nconst officialKinds={item:['items','equipment'],material:['materials'],currency:['currency','icons'],pet:['pets'],'class-skill':['skills'],monster:['monsters','tower-monsters'],biome:['biomes']};\nlet officialManifest={categories:{}};\nconst imageNorm=s=>String(s||'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');\nfunction officialSpriteFor(e){\n const kind=e?.kind||e?.gameKind,title=imageNorm(e?.title),cats=officialManifest.categories||{};\n const cls=imageNorm(e?.className||(e?.facts||[]).find(x=>imageNorm(x[0])==='class')?.[1]||'');\n if(!title||!(kind in officialKinds))return null;\n const matches=[];\n for(const category of officialKinds[kind]){const group=cats[category];if(!group?.mapping)continue;\n  for(const [key,index] of Object.entries(group.mapping)){\n   const parts=key.split(':'),slug=imageNorm(parts[parts.length-1].replace(/_/g,'-'));\n   if(slug!==title)continue;\n   if(kind==='class-skill'&&cls&&parts.length>1&&imageNorm(parts[0])!==cls)continue;\n   if(!Number.isInteger(index)||index<0||index>=group.cols*group.rows)continue;\n   matches.push({category,key,index,cols:group.cols,rows:group.rows});\n  }\n }\n if(!matches.length)return null;\n if(matches.length===1)return matches[0];\n if(kind==='item'){const curated=matches.filter(m=>m.category==='items');if(curated.length===1&&matches.every(m=>m.key===curated[0].key))return curated[0];}\n return null;\n}\n"+marker);
  const artMark=" const d=spriteFor(entry), px=Math.max(20,Math.min(120,Number(size)||44));";
  if(!t.includes(artMark))throw Error('Art renderer body marker absent');
  t=t.replace(artMark,"\n const official=officialSpriteFor(entry);\n if(official){\n  const x=official.index%official.cols,y=Math.floor(official.index/official.cols);\n  const bx=official.cols>1?100*x/(official.cols-1):0,by=official.rows>1?100*y/(official.rows-1):0;\n  return '<span class=\"gameArt gameArt-original\" data-art-status=\"official\" data-asset-key=\"'+official.category+':'+official.key+'\" title=\"Original IdleArc artwork\" style=\"background-image:url(/official-art/'+official.category+'.webp);background-size:'+official.cols*100+'% '+official.rows*100+'%;background-position:'+bx.toFixed(6)+'% '+by.toFixed(6)+'%\"></span>';\n }\n"+artMark);
  const loadMark="  assetState='loading';lastError='';";
  if(!t.includes(loadMark))throw Error('Image manifest loader absent');
  t=t.replace(loadMark,loadMark+"\n  try{\n    const response=await fetch('/official-art/manifest.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});\n    if(!response.ok)throw Error('Artwork manifest HTTP '+response.status);\n    const data=await response.json();\n    if(!data?.categories||typeof data.categories!=='object')throw Error('Invalid official artwork index');\n    officialManifest=data;\n  }catch(err){console.warn('Official artwork unavailable; retaining original atlas',err)}\n");
 }
 if(path==='/src/wiki-data.js'){
  const a="['material','Materials','gem'],",b="['pet-bonus','Pet Bonuses','paw'],";
  if(!t.includes(a)||!t.includes(b))throw Error('Wiki category markers absent');
  t=t.replace(a,a+"['currency','Currencies','gem'],").replace(b,"['pet','Pet Companions','paw'],"+b);
  const label="item:'Equipment',material:'Materials'";
  if(!t.includes(label))throw Error('Record label marker absent');
  t=t.replace(label,label+",currency:'Currencies',pet:'Pet Companions'");
 }
 if(path==='/src/wiki-views.js'){
  const factsMark=" const facts=(entry.facts||[]).map(([k,v])=>";
  if(!t.includes(factsMark))throw Error('Detail facts marker missing');
  const prep=" const siblings=matchingRecords(all,kind);const currentIdx=siblings.findIndex(x=>x.id===entry.id);const previous=currentIdx>0?siblings[currentIdx-1]:null;const following=currentIdx>=0&&currentIdx<siblings.length-1?siblings[currentIdx+1]:null;const neighborButton=(record,direction)=>record?`<button class=\\\"wikiAdjacent wikiAdjacent-${direction}\\\" data-route=\\\"wiki/reference\\\" data-params=\\\"${esc(linkParams(record.id))}\\\"><small>${direction==='previous'?'← Previous':'Next →'}</small><strong>${literal(record.title)}</strong></button>`:'';const adjacent=previous||following?`<nav class=\\\"wikiRecordAdjacent\\\" aria-label=\\\"More references in this category\\\">${neighborButton(previous,'previous')}${neighborButton(following,'next')}</nav>`:'';\n";
  t=t.replace(factsMark,prep+factsMark);
  const sourceMark=" <p class=\"wikiSource\">Game reference · Season 2 · October 2026</p>";
  if(!t.includes(sourceMark))throw Error('Detail footer marker missing');
  t=t.replace(sourceMark," ${adjacent}\n"+sourceMark);
  const cond="e.gameKind==='item'||e.gameKind==='material'";
  const det="kind==='item'||kind==='material'?gameArt(real,94)";
  if(!t.includes(cond)||!t.includes(det))throw Error('Record image markers absent');
  t=t.replaceAll(cond,"['item','material','currency','pet'].includes(e.gameKind)");
  t=t.replace(det,"['item','material','currency','pet'].includes(kind)?gameArt(real,94)");
  const oldCard="['item','material','currency','pet'].includes(e.gameKind)";
  const oldDetail="['item','material','currency','pet'].includes(kind)";
  if(!t.includes(oldCard)||!t.includes(oldDetail))throw Error('Codex image category markers missing');
  t=t.replaceAll(oldCard,"['item','material','currency','pet','monster','biome','class-skill'].includes(e.gameKind)");
  t=t.replaceAll(oldDetail,"['item','material','currency','pet','monster','biome','class-skill'].includes(kind)");
 }
 if(path==='/src/app.js'){
  const stateMark="const wikiState={category:'all',query:'',limit:36};";
  if(!t.includes(stateMark))throw Error('Codex state marker missing');
  t=t.replace(stateMark,"const wikiState={category:'all',query:'',limit:36,returnKind:'',returnY:0,returnX:0,restorePending:false};");
  const goMark="function go(route,params={}){closeLayer();navigate(route,params);window.scrollTo({top:0,behavior:'instant'})}";
  if(!t.includes(goMark))throw Error('Navigation go() marker missing');
  const goReplacement="function go(route,params={}){if(parseRoute().route==='wiki/library'&&route==='wiki/reference'){wikiState.returnKind=parseRoute().query.get('kind')||'all';wikiState.returnY=window.scrollY;wikiState.returnX=node('content').querySelector('.wikiCategoryScroll')?.scrollLeft||0;wikiState.restorePending=true;}const returning=route==='wiki/library'&&wikiState.restorePending&&(params.kind||'all')===wikiState.returnKind;closeLayer();navigate(route,params);if(!returning)window.scrollTo({top:0,behavior:'instant'})}";
  t=t.replace(goMark,goReplacement);
  const handleMark="try{render()}finally{renderLock=false}}";
  if(!t.includes(handleMark))throw Error('Route handler marker missing');
  const afterRender="try{render();if(parseRoute().route==='wiki/library'&&wikiState.restorePending&&(parseRoute().query.get('kind')||'all')===wikiState.returnKind){const x=wikiState.returnX,y=wikiState.returnY;wikiState.restorePending=false;const rail=node('content').querySelector('.wikiCategoryScroll');if(rail)rail.scrollLeft=x;requestAnimationFrame(()=>{const newRail=node('content').querySelector('.wikiCategoryScroll');if(newRail)newRail.scrollLeft=x;window.scrollTo({top:y,behavior:'instant'})})}}finally{renderLock=false}}";
  t=t.replace(handleMark,afterRender);
  const sourceRender="applyTheme(dest);node('content').innerHTML=routeView();";
  if(!t.includes(sourceRender))throw Error('Could not find Arcana render replacement marker');
  const patchedRender="const oldWikiRail=dest==='wiki/library'?node('content').querySelector('.wikiCategoryScroll'):null;"+
    "const oldWikiRailX=oldWikiRail?oldWikiRail.scrollLeft:null;"+
    "applyTheme(dest);node('content').innerHTML=routeView();"+
    "if(dest==='wiki/library'){const newWikiRail=node('content').querySelector('.wikiCategoryScroll');"+
    "if(newWikiRail){if(oldWikiRailX!==null)newWikiRail.scrollLeft=oldWikiRailX;"+
    "else{const activeWikiCategory=newWikiRail.querySelector('button.active');"+
    "if(activeWikiCategory)newWikiRail.scrollLeft=Math.max(0,activeWikiCategory.offsetLeft-newWikiRail.offsetLeft-(newWikiRail.clientWidth-activeWikiCategory.clientWidth)/2)}}}";
  t=t.replace(sourceRender,patchedRender);
  const categoryHandler="case 'wikicat':wikiState.category=arg;wikiState.limit=36;go('wiki/library',{kind:arg});break;";
  if(!t.includes(categoryHandler))throw Error('Arcana category action marker missing');
  t=t.replace(categoryHandler,"case 'wikicat':wikiState.category=arg;wikiState.limit=36;navigate('wiki/library',{kind:arg});break;");
  const mark="void initGameAssets();";
  if(!t.includes(mark))throw Error('Art init marker absent');
  t=t.replace(mark,"window.addEventListener('arcana:assets-loaded',()=>{try{if(parseRoute().route.startsWith('wiki'))render()}catch(e){console.warn('Artwork re-render issue',e)}});\n"+mark);
 }
 new Bun.Transpiler({loader:'js',target:'browser'}).transformSync(t);
 return t;
}
let savedCatalog=null,catalogFresh=0;
function readable(slug){return slug.split('-').map(v=>v?String(v[0]).toUpperCase()+v.slice(1):'').join(' ')}
async function supplementCatalog(payload){
 if(!Array.isArray(payload?.entries))return payload;
 if(savedCatalog&&Date.now()-catalogFresh<120000)return savedCatalog;
 try{
  const r=await fetch(LEGACY+'/assets/atlas-map.json',{signal:AbortSignal.timeout(9000)});
  if(!r.ok)throw Error('Original atlas map HTTP '+r.status);
  const data=await r.json(),keys=Object.keys(data.mapping||{});
  const existing=new Set(payload.entries.map(e=>e.id));
  const extras=[];
  for(const k of keys){
   const [type,slug]=k.split(':');
   if((type!=='currency'&&type!=='pet')||!slug)continue;
   const id='game:'+type+':'+slug;if(existing.has(id))continue;
   const title=readable(slug),label=type==='currency'?'Game currency':'Pet companion';
   extras.push({id,kind:type,title,subtitle:type==='currency'?'Currency':'Pet',description:label,keywords:[title,slug,type,type==='currency'?'resources currency':'pets companions'].join(' '),facts:[['Category',label]],source:'Original Arcana game artwork index'});
   existing.add(id);
  }
  savedCatalog={...payload,entries:[...payload.entries,...extras],recoveredArt:{index:data.version,oldSprites:keys.length,addedReferences:extras.length}};
  catalogFresh=Date.now();
  console.log('ARCANA_RECOVERED_CATALOG',JSON.stringify({original:payload.entries.length,added:extras.length,types:Object.fromEntries(['currency','pet'].map(k=>[k,extras.filter(x=>x.kind===k).length]))}));
  return savedCatalog;
 }catch(err){console.error('RECOVERED_CATALOG_FALLBACK',String(err));return payload}
}

Bun.serve({port:Number(Bun.env.PORT||3000),async fetch(req){
 const u=new URL(req.url),pathname=u.pathname;
 if(pathname==='/__gateway_health')return Response.json({ok:true,revision:VERSION,site:'ArcanaWiki v12',legacyArt:'321 original sprite mappings',modernSource:MODERN,legacySource:LEGACY},{headers:{'cache-control':'no-store'}});
 const isLegacyArt=Object.hasOwn(ART,pathname);
 const isOfficialArt=/^\/official-art\/(?:manifest\.json|[a-z][a-z0-9-]*\.webp)$/.test(pathname);
 const isArt=isLegacyArt||isOfficialArt;
 const target=(isOfficialArt?OFFICIAL+pathname.slice('/official-art'.length):(isLegacyArt?LEGACY+ART[pathname][0]:MODERN+pathname))+u.search;
 const h=new Headers(req.headers);
 for(const k of ['host','connection','content-length','transfer-encoding','accept-encoding'])h.delete(k);
 h.set('accept','*/*');
 try{
  const up=await fetch(target,{method:req.method,headers:h,body:req.method==='GET'||req.method==='HEAD'?undefined:req.body,signal:AbortSignal.timeout(isArt?14000:20000),redirect:'manual'});
  if(up.ok&&req.method==='GET'&&(pathname==='/'||pathname==='/index.html')){
   const html=await up.text();
   const signature='<footer id="arcana-signature-footer" aria-label="Arcana creator credit"><span>Made by <strong>Zane</strong>, guild leader of <strong>PDX &amp; OVK</strong>, for the IdleArc community.</span></footer>';
   const tail=html.toLowerCase().lastIndexOf('</body>');
   const updated=tail>=0?html.slice(0,tail)+signature+html.slice(tail):html+signature;
   const headers=new Headers(up.headers);
   for(const k of ['content-encoding','content-length','transfer-encoding','x-robots-tag'])headers.delete(k);
   headers.set('content-type','text/html; charset=utf-8');headers.set('cache-control','no-store');headers.set('x-arcana-signature','restored');
   return new Response(updated,{status:up.status,headers});
  }
  if(up.ok&&req.method==='GET'&&REWRITES.includes(pathname)){
   const original=await up.text();
   const patched=patchJs(pathname,original);
   return new Response(patched,{status:200,headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store','x-arcana-patch':PATCH,'x-arcana-version':VERSION}});
  }
  if(up.ok&&req.method==='GET'&&pathname==='/styles.css'){const original=await up.text();return new Response(original+"\n\n/* Arcana creator signature: subtle, mobile-friendly */\n#arcana-signature-footer{position:relative;box-sizing:border-box;width:100%;padding:27px 18px 34px;margin:0 auto;text-align:center;color:var(--muted,#9c9eaf);font-size:11px;line-height:1.8;letter-spacing:.015em;background:transparent;border-top:1px solid rgba(164,151,215,.10)}\n#arcana-signature-footer strong{font-weight:600;color:var(--text,#d7d4e2)}\n@media(max-width:600px){#arcana-signature-footer{padding:22px 20px 34px;font-size:10.5px;line-height:1.7}}\n/* ArcanaWiki detail browsing */\n.wikiRecordAdjacent{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:22px 0}\n.wikiAdjacent{display:flex;flex-direction:column;gap:6px;min-width:0;padding:15px 16px;background:#1b1e2c;border:1px solid #393b50;border-radius:12px;color:var(--text);text-align:left;transition:border-color .15s,background .15s}\n.wikiAdjacent:hover{border-color:var(--accent);background:#222237}\n.wikiAdjacent small{font-size:10px;color:var(--accent);font-weight:750;letter-spacing:.035em}\n.wikiAdjacent strong{font-size:12px;line-height:1.4;overflow-wrap:anywhere}\n.wikiAdjacent-next{text-align:right;align-items:flex-end}\n.wikiAdjacent-next:only-child{grid-column:2}\n@media(max-width:410px){.wikiRecordAdjacent{gap:8px}.wikiAdjacent{padding:12px 10px}}\n",{status:200,headers:{'content-type':'text/css; charset=utf-8','cache-control':'no-store','x-arcana-patch':PATCH}})}
  if(up.ok&&req.method==='GET'&&pathname==='/api/search/catalog'){
   const payload=await supplementCatalog(await up.json());
   return Response.json(payload,{headers:{'cache-control':'no-store','x-arcana-version':VERSION,'x-arcana-patch':PATCH}});
  }
  if(!up.ok&&isArt){console.error('ARCANA_ART_GATEWAY_SOURCE_FAIL',pathname,up.status);return new Response('Original game artwork temporarily unavailable',{status:502,headers:{'cache-control':'no-store'}})}
  const oh=new Headers(up.headers);
  for(const k of ['content-encoding','content-length','transfer-encoding','x-robots-tag'])oh.delete(k);
  oh.set('x-arcana-version',VERSION);
  if(isArt){oh.set('content-type',isOfficialArt?(pathname.endsWith('.json')?'application/json; charset=utf-8':'image/webp'):ART[pathname][1]);oh.set('cache-control',pathname.endsWith('.webp')?'public,max-age=300':'no-store');oh.set('x-arcana-art-status',isOfficialArt?'original-official-art':'original-legacy-art')}
  else if(pathname==='/'||pathname==='/index.html'||pathname.startsWith('/src/'))oh.set('cache-control','no-store');
  return new Response(req.method==='HEAD'?null:up.body,{status:up.status,headers:oh});
 }catch(err){console.error('ARCANA_GATEWAY_FAILURE',pathname,String(err));return new Response('ArcanaWiki upstream unavailable',{status:502,headers:{'cache-control':'no-store'}})}
}});
console.log('ARCANA_V12_RESTORED_ART_GATEWAY_READY',VERSION);
void (async()=>{
 try{
  for(const path of ['/src/assets.js','/src/wiki-views.js','/src/app.js','/src/wiki-data.js']){
    const r=await fetch(MODERN+path,{signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error(path+' '+r.status);
    const out=patchJs(path,await r.text());
    console.log('ARCANA_PICTURES_PREVIEW_JS_VALID',JSON.stringify({path,bytes:out.length,officialResolver:path==='/src/assets.js'?out.includes('function officialSpriteFor'):null,visualCategories:path==='/src/wiki-views.js'?out.includes("'monster','biome','class-skill'"):null}));
  }
  for(const path of ['/manifest.json','/skills.webp','/monsters.webp','/biomes.webp','/equipment.webp']){
    const r=await fetch(OFFICIAL+path,{signal:AbortSignal.timeout(16000)});
    const bytes=(await r.arrayBuffer()).byteLength;
    console.log('ARCANA_PICTURES_PREVIEW_ART_VALID',JSON.stringify({path,status:r.status,bytes,type:r.headers.get('content-type')}));
  }
 }catch(e){console.error('ARCANA_PICTURES_PREVIEW_CHECK_FAILED',String(e))}
})();
