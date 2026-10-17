/* Creator-only desktop sandbox. No writes to /api/site/ and no publish command. */
import {readDesign,replaceDesignDraft,DESIGN_PRESETS,DEFAULT_DESIGN,normalizeDesignHex,validateDesignField,DESIGN_FIELDS} from './design-controls.js';
import {MAX_FIELDS,MAX_GROUPS,MAX_DEFAULTS,readMax,saveMax,writeMax,applyMax,normalizeMax} from './design-max-controls.js';
import {PROCEDURAL_TEXTURES} from './procedural-textures.js';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const VAULT='arcana-design-max-vault-v1',BACKUP='arcana-design-max-last-import-v1';
const ids=new Set(DESIGN_FIELDS);
const BACKUPS=10;
const recs=[
 ['Astral Forge','violet','procedural-prism','#955DFF','#0D101F','gradient',25],
 ['Riftbreaker','crimson','procedural-fractures','#FA577F','#170B1B','textured',42],
 ['Obsidian Academy','obsidian','procedural-sigils','#CB9D62','#0B0D16','solid',17],
 ['Moonlit Atlas','sapphire','procedural-astral','#7FADFF','#0A101F','glass',31],
 ['Relic Cartographer','parchment','procedural-contours','#D7BD88','#15120E','textured',24],
 ['Neon Glyph','midnight','procedural-circuits','#56EEDC','#08151E','gradient',36],
 ['Void Bloom','quartz','procedural-bloom','#D18DFF','#100D1E','glass',33],
 ['Aether Waves','twilight','procedural-aether','#B99EFF','#101021','flat',21],
 ['Silken Shadow','ink','procedural-weave','#9E97CA','#0C0C13','solid',12],
 ['Echo Chamber','silver','procedural-echo','#B1CBED','#0C111B','textured',27],
 ['Prismatic Depth','cobalt','procedural-prism','#60A5FF','#081322','glass',46],
 ['Glacial Pulse','frost','procedural-contours','#63D7FF','#071723','gradient',32],
 ['Verdant Crypt','woodland','procedural-sigils','#9CCFA3','#081510','textured',19],
 ['Solar Relics','gilded','procedural-fractures','#EAC077','#161109','gradient',26],
 ['Hollow Circuit','midnight','procedural-circuits','#39E9E0','#060A12','flat',17],
 ['Royal Aether','violet','procedural-aether','#BCA4FF','#0E0B1E','glass',34]
];
const snapshot=()=>({core:readDesign(),max:readMax()});
const pack=x=>JSON.stringify(x);
const fieldCounts=MAX_GROUPS.map(g=>g.fields.length);
const panelHTML=g=>'<section class="panel maxPanel" id="panel-'+g.id+'" hidden><div class="sectionTitle">'+esc(g.name)+' <span class="maxCount">'+g.fields.length+' PARAMS</span></div><p class="maxLead">'+esc(g.subtitle)+'</p><div class="maxControls">'+g.fields.map(f=>{
 const heading='<div class="controlTop"><span>'+esc(f.label)+'</span>'+(f.type==='range'?'<output data-max-output="'+f.key+'"></output>':'')+'</div>';
 let c='';
 if(f.type==='range')c='<input type="range" data-max-field="'+f.key+'" min="'+f.min+'" max="'+f.max+'" step="1" value="'+f.default+'">';
 if(f.type==='color')c='<div class="colorRow"><input type="color" data-max-field="'+f.key+'" value="'+f.default+'"><input type="text" data-max-hex="'+f.key+'" maxlength="7" value="'+f.default+'" autocomplete="off" spellcheck="false" aria-label="'+esc(f.label)+' HEX"></div>';
 if(f.type==='select')c='<select data-max-field="'+f.key+'">'+f.options.map(([id,label])=>'<option value="'+esc(id)+'">'+esc(label)+'</option>').join('')+'</select>';
 return '<label class="control maxField" data-max-container="'+f.key+'" data-max-find="'+esc(f.label.toLowerCase()+' '+g.name.toLowerCase())+'">'+heading+c+'</label>';
 }).join('')+'</div></section>';
const uiCSS=`
.grid{--design-left:365px;--design-right:260px;grid-template-columns:var(--design-left) minmax(380px,1fr) var(--design-right);position:relative}
.maxSplitter{position:absolute;top:0;bottom:0;width:8px;z-index:29;cursor:col-resize;background:transparent;touch-action:none}
.maxSplitter:hover,.maxSplitter.dragging{background:#9777d34d}
.maxSplitter.left{left:calc(var(--design-left) - 4px)}.maxSplitter.right{right:calc(var(--design-right) - 4px)}
.maxPreviewFullscreen{position:fixed!important;inset:0!important;z-index:1000!important;width:100vw!important;height:100dvh!important}
.maxZoom{font-size:10px;color:#b9aace;display:flex;align-items:center;gap:7px}.maxZoom input{width:90px;accent-color:#ad87ee}.maxZoom b{font:700 11px ui-monospace,monospace;min-width:39px}
@media(max-width:1100px){.grid{grid-template-columns:350px minmax(400px,1fr)}.maxSplitter.right{display:none}}
@media(max-width:850px){.maxSplitter{display:none}}

.maxPanel .maxLead{margin:-4px 0 18px;font-size:11px;line-height:1.6;color:#a8b1c7}
.maxCount{float:right;color:#9a90ac;font-size:9px;letter-spacing:.07em}
.maxField{padding:11px 10px 8px;border:1px solid #37394e;border-radius:10px;background:#151827;margin:0 0 8px}
.maxField:focus-within{border-color:#836ac5}.maxField .controlTop{margin-bottom:10px}.maxField .controlTop span{font-size:11px}
.maxField .controlTop output{font-size:11px;color:#c8b1ff}.maxField input[type=range]{width:100%}
.maxField[hidden]{display:none!important}.maxSearch{display:flex;gap:8px;align-items:center;margin:9px 14px 12px}
.maxSearch input{background:#131726;color:#ecedfc;border:1px solid #393c54;border-radius:9px;padding:9px 10px;min-height:37px;width:100%;font-size:12px}
.maxToolbar{padding:8px 15px;border-bottom:1px solid #34364a;background:#141824;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.maxToolbar button{border:1px solid #464862;background:#26243b;color:#e7ddff;border-radius:8px;padding:8px 10px;min-height:34px;font-size:11px;font-weight:750}
.maxToolbar button:hover,.maxToolbar button[aria-pressed=true]{border-color:#b196f5;background:#433059}
.maxToolbar .maxDanger{border-color:#82535f;background:#35212b}.maxToolbar .maxSpacer{flex:1}.maxToolbar .maxPill{border-radius:99px;background:#24372f;color:#b8f5c7;border:1px solid #3c6553;padding:6px 9px;font-size:10px}
.maxStatus{padding:8px 17px;border-top:1px solid #35384b;color:#aab9cf;min-height:33px;font-size:11px;background:#0e1220}
.maxSearchResults{padding:9px}.maxSearchResults button{display:flex;width:100%;padding:11px 13px;justify-content:space-between;color:#ddd6f5;background:#181b2a;border:1px solid #383954;border-radius:8px;margin-bottom:7px;text-align:left}.maxSearchResults button span{color:#9ca7bd}
.maxVault{padding:8px 14px 18px}.maxVaultGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.maxSlot{padding:10px;background:#18192b;border:1px solid #44415d;border-radius:10px;min-height:104px;display:flex;flex-direction:column;gap:8px}
.maxSlot b{font-size:11px}.maxSlot small{font-size:10px;color:#a8b0c1}.maxSlot>div{display:flex;gap:5px;margin-top:auto}.maxSlot button{flex:1;background:#29243b;color:#d6c4ef;border:1px solid #55496a;border-radius:6px;padding:5px 3px;font-size:10px}
.maxRecipeGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:10px 0}.maxRecipe{border-radius:10px;border:1px solid #48415d;background:#1b1a2b;color:#eee4fb;text-align:left;padding:10px;display:flex;flex-direction:column;gap:5px;min-height:100px}.maxRecipe:hover{border-color:#bc9cff;background:#2b2340}
.maxRecipe .maxSwatch{width:100%;height:30px;border-radius:6px;background:linear-gradient(110deg,var(--sw1),var(--sw2),var(--sw1));border:1px solid #ffffff25}
.maxRecipe strong{font-size:11px}.maxRecipe small{font-size:9px;color:#bbb3cb}
.maxInfo{color:#aeb8c9;font-size:11px;line-height:1.65;margin:12px 0}.maxHotkey{background:#26233d;border:1px solid #534b69;border-radius:4px;padding:2px 5px}
.maxHelp{margin:10px;border:1px solid #414057;background:#1a1c2c;padding:12px;border-radius:10px;color:#c0b9d7;font-size:11px;line-height:1.7}
.maxPulse{font-size:10px;color:#b49fe2}
.top-actions{max-width:48vw;flex-wrap:wrap;justify-content:flex-end}.grid{grid-template-columns:minmax(350px,410px) minmax(460px,1fr) minmax(235px,290px)}
@media(max-width:1330px){.grid{grid-template-columns:335px minmax(400px,1fr) 225px}}@media(max-width:1100px){.grid{grid-template-columns:350px minmax(450px,1fr)}.library{display:none}}
.maxPanel select{width:100%;min-height:38px;padding:8px;background:#1b1d2d;color:#eae4f9;border:1px solid #55516c;border-radius:8px}
.maxImportInput{display:none}.maxPanorama{letter-spacing:.08em;font-size:9px;color:#b6a4e1;text-transform:uppercase;font-weight:800}
`;
export function installDesignMax(){
 const inspector=document.querySelector('.inspector'),tabs=$('editorTabs'),oldPanels=inspector.querySelector('#panel-presets');
 if(!inspector||!tabs||!oldPanels)return;
 const style=document.createElement('style');style.textContent=uiCSS;document.head.appendChild(style);
 const filter=document.createElement('label');filter.className='maxSearch';filter.innerHTML='<input id="maxFieldSearch" type="search" aria-label="Find design controls" placeholder="Search 100+ design controls…">';
 tabs.before(filter);
 for(const g of MAX_GROUPS){
  const b=document.createElement('button');b.textContent=g.name;b.dataset.tab=g.id;b.title=g.subtitle;tabs.insertBefore(b,tabs.querySelector('[data-tab="presets"]'));
  oldPanels.before(document.createRange().createContextualFragment(panelHTML(g)));
 }
 const searchPanel=document.createElement('section');searchPanel.id='panel-search';searchPanel.className='panel';searchPanel.hidden=true;searchPanel.innerHTML='<div class="sectionTitle">Search the control system</div><p class="maxLead">Search over the advanced controls and jump to the exact parameter.</p><div class="maxSearchResults" id="maxSearchResults"></div>';
 oldPanels.before(searchPanel);
 const vault=document.createElement('section');vault.id='panel-vault';vault.className='panel';vault.hidden=true;
 vault.innerHTML='<div class="sectionTitle">Design vault · '+BACKUPS+' slots</div><p class="maxLead">Each slot stores all legacy and advanced design values. Local to this test browser.</p><div class="maxVaultGrid" id="maxVaultGrid"></div><p class="maxInfo">Import and Export create portable JSON files. Nothing is published to visitors.</p>';
 oldPanels.after(vault);
 const vtab=document.createElement('button');vtab.dataset.tab='vault';vtab.textContent='Vault';tabs.append(vtab);
 const recipe=document.createElement('section');recipe.id='panel-recipes';recipe.className='panel';recipe.hidden=true;
 recipe.innerHTML='<div class="sectionTitle">Designer recipes <span class="maxCount">16 STARTING POINTS</span></div><p class="maxLead">Handpicked advanced combinations. Apply as a draft, then customize every piece.</p><div class="maxRecipeGrid" id="maxRecipes"></div>';
 vault.after(recipe);
 const rtab=document.createElement('button');rtab.dataset.tab='recipes';rtab.textContent='Recipes';tabs.append(rtab);
 const info=document.createElement('section');info.id='panel-guide';info.className='panel';info.hidden=true;
 info.innerHTML='<div class="sectionTitle">Studio diagnostics</div><div id="maxDiagnostics" class="maxHelp">Checking preview…</div><p class="maxInfo">Only this test environment supports the advanced design layer. Publishing is intentionally disabled here.</p><p class="maxInfo"><b>Shortcuts:</b> <span class="maxHotkey">Ctrl/⌘ + Z</span> Undo, <span class="maxHotkey">Ctrl/⌘ + Shift + Z</span> Redo, <span class="maxHotkey">Ctrl/⌘ + S</span> Save snapshot.</p>';
 recipe.after(info);const it=document.createElement('button');it.dataset.tab='guide';it.textContent='Diagnostics';tabs.append(it);
 const toolbar=document.createElement('div');toolbar.className='maxToolbar';toolbar.innerHTML='<span class="maxPanorama">CREATOR TOOLKIT</span><button data-max-action="undo" title="Undo Ctrl+Z">↶ Undo</button><button data-max-action="redo" title="Redo Ctrl+Shift+Z">↷ Redo</button><button data-max-action="compare" aria-pressed="false">◫ Before / After</button><button data-max-action="fullscreen" aria-pressed="false">⛶ Fullscreen</button><button data-max-action="shuffle">✧ Remix</button><button data-max-action="save" title="Save to first empty vault slot">Save snapshot</button><span class="maxSpacer"></span><span class="maxPill">PRIVATE DRAFT · NO PUBLISH</span>';
 const stage=document.querySelector('.stage');stage.insertBefore(toolbar,stage.firstChild);
 const grid=document.querySelector('.grid');
 const viewTools=document.querySelector('.sizeBar');
 const zoom=document.createElement('label');zoom.className='maxZoom';zoom.innerHTML='<span>Preview zoom</span><input type="range" id="maxPreviewZoom" min="70" max="130" step="5" value="100"><b id="maxZoomValue">100%</b>';
 viewTools?.appendChild(zoom);
 function resizeGrid(){
  let saved={};try{saved=JSON.parse(localStorage.getItem('arcana-design-max-panes')||'{}')}catch{}
  let left=Math.min(550,Math.max(290,Number(saved.left)||365)),right=Math.min(390,Math.max(190,Number(saved.right)||260));
  const update=()=>{grid.style.setProperty('--design-left',left+'px');grid.style.setProperty('--design-right',right+'px')};update();
  for(const side of ['left','right']){
   const grip=document.createElement('div');grip.className='maxSplitter '+side;grip.title='Drag to resize '+side+' workspace column';grip.setAttribute('role','separator');grip.setAttribute('aria-label','Resize '+side+' panel');grid.appendChild(grip);
   let dragging=false;let startX=0,startValue=0;
   grip.addEventListener('pointerdown',event=>{if(event.button!==0)return;dragging=true;startX=event.clientX;startValue=side==='left'?left:right;grip.setPointerCapture(event.pointerId);grip.classList.add('dragging');event.preventDefault()});
   grip.addEventListener('pointermove',event=>{if(!dragging)return;const delta=event.clientX-startX;if(side==='left')left=Math.max(290,Math.min(550,startValue+delta));else right=Math.max(190,Math.min(390,startValue-delta));update()});
   const finish=()=>{if(!dragging)return;dragging=false;grip.classList.remove('dragging');try{localStorage.setItem('arcana-design-max-panes',JSON.stringify({left,right}))}catch{}};
   grip.addEventListener('pointerup',finish);grip.addEventListener('pointercancel',finish);
  }
 }
 resizeGrid();
 zoom.querySelector('input')?.addEventListener('input',e=>{const value=Number(e.target.value);$('browser').style.zoom=(value/100).toFixed(2);$('maxZoomValue').textContent=value+'%';});
 const foot=document.createElement('div');foot.className='maxStatus';foot.id='maxStatus';foot.setAttribute('role','status');foot.textContent='Studio ready. Changes stay on the preview domain.';stage.appendChild(foot);
 const actionbar=document.querySelector('.top-actions');
 const importBtn=document.createElement('button');importBtn.className='controlBtn';importBtn.dataset.maxAction='import';importBtn.textContent='Import JSON';actionbar.insertBefore(importBtn,actionbar.querySelector('a'));
 const guideBtn=document.createElement('button');guideBtn.className='controlBtn';guideBtn.dataset.maxAction='guide';guideBtn.textContent='⌘ Help';actionbar.insertBefore(guideBtn,actionbar.querySelector('a'));
 const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,application/json';fileInput.id='maxImportInput';fileInput.className='maxImportInput';document.body.appendChild(fileInput);
 let history=[snapshot()],cursor=0,restoring=false,lastTag='',lastAt=0,compare='after';
 let original=structuredClone(history[0]);
 const report=msg=>{const el=$('maxStatus');if(el)el.textContent=msg;};
 const addHistory=tag=>{
  if(restoring)return;
  const current=snapshot(),serialized=pack(current);if(serialized===pack(history[cursor]))return;
  const now=Date.now(),coalesce=cursor===history.length-1&&tag===lastTag&&now-lastAt<550;
  if(coalesce){history[cursor]=current;}
  else{history=history.slice(0,cursor+1);history.push(current);if(history.length>100)history.shift();cursor=history.length-1;}
  lastTag=tag;lastAt=now;
 };
 const restore=data=>{
  restoring=true;
  try{replaceDesignDraft(data.core);saveMax(data.max);compare='after';syncValues();window.dispatchEvent(new Event('arcana:design-change'));refresh();report('History restored locally.')}finally{restoring=false}
 };
 const undo=()=>{if(cursor>0){restore(history[--cursor]);}else report('Already at the oldest snapshot.');};
 const redo=()=>{if(cursor<history.length-1){restore(history[++cursor]);}else report('No newer snapshot.');};
 function syncValues(){
  const v=readMax();
  for(const input of document.querySelectorAll('[data-max-field]')){const value=v[input.dataset.maxField];if(value!==undefined&&document.activeElement!==input)input.value=String(value);}
  for(const input of document.querySelectorAll('[data-max-hex]')){const value=v[input.dataset.maxHex];if(value!==undefined&&document.activeElement!==input)input.value=String(value);}
  for(const out of document.querySelectorAll('[data-max-output]')){const field=MAX_FIELDS.find(x=>x.key===out.dataset.maxOutput);out.textContent=v[field.key]+(field.unit||'');}
 }
 function refresh(){
  const frame=$('liveFrame');const data=compare==='before'?original:snapshot();
  try{
   const child=frame.contentWindow,doc=frame.contentDocument;
   if(doc?.documentElement){
    applyMax(doc,data.max);
    child.postMessage({type:'arcana:design-desk-sync',core:data.core},location.origin);
    const home=doc.querySelector('.launchHero'),cards=doc.querySelectorAll('.launchQuickCard').length;
    $('maxDiagnostics').textContent='Frame: '+(doc.readyState||'loading')+' · Hero: '+(home?'found':'not on this route')+' · Home cards: '+cards+' · Route: '+(frame.contentWindow.location.hash||'#/');
   }
  }catch(e){report('Preview bridge unavailable: '+String(e.message||e));}
  document.querySelector('[data-max-action="compare"]')?.setAttribute('aria-pressed',String(compare==='before'));
  const b=document.querySelector('[data-max-action="compare"]');if(b)b.textContent=compare==='before'?'◫ Showing BEFORE':'◫ Showing AFTER';
 }
 function vaultData(){try{const q=JSON.parse(localStorage.getItem(VAULT)||'[]');return Array.isArray(q)?q.slice(0,BACKUPS):[]}catch{return []}}
 function slots(){const list=vaultData(),target=$('maxVaultGrid');if(!target)return;target.innerHTML=Array.from({length:BACKUPS},(_,i)=>{const v=list[i];return '<div class="maxSlot"><b>Slot '+String(i+1).padStart(2,'0')+'</b><small>'+(v?esc(v.name+' · '+v.date):'Empty · Ready to save')+'</small><div><button data-max-slot-save="'+i+'">Save</button><button data-max-slot-load="'+i+'" '+(v?'':'disabled')+'>Load</button><button data-max-slot-remove="'+i+'" '+(v?'':'disabled')+'>×</button></div></div>'}).join('');}
 function saveSlot(i){const list=vaultData();while(list.length<BACKUPS)list.push(null);list[i]={name:'Snapshot '+(i+1),date:new Date().toLocaleDateString(),design:snapshot()};try{localStorage.setItem(VAULT,JSON.stringify(list))}catch(e){report('Browser could not store snapshot');return}slots();report('Saved complete design to vault slot '+(i+1)+'.');}
 function loadSlot(i){const v=vaultData()[i];if(v?.design?.core){restore(v.design);addHistory('slot');report('Loaded vault slot '+(i+1)+'.');}}
 function delSlot(i){const list=vaultData();list[i]=null;try{localStorage.setItem(VAULT,JSON.stringify(list))}catch{}slots();report('Cleared vault slot '+(i+1)+'.');}
 function recipeMarkup(){const target=$('maxRecipes');if(!target)return;target.innerHTML=recs.map(([name,base,pattern,accent,background,material],i)=>'<button class="maxRecipe" data-max-recipe="'+i+'"><span class="maxSwatch" style="--sw1:'+background+';--sw2:'+accent+'"></span><strong>'+esc(name)+'</strong><small>'+esc(pattern.slice(11).replaceAll('-',' '))+' · '+esc(material)+'</small></button>').join('');}
 function useRecipe(index){const rec=recs[index];if(!rec)return;const [name,base,pattern,accent,background,material,strength]=rec;const baseDesign=DESIGN_PRESETS[base]||DESIGN_PRESETS.violet;const {name:_n,...preset}=baseDesign;
  compare='after';replaceDesignDraft({...readDesign(),...preset,pattern,textureColor:accent,textureColorMode:'custom',intensity:strength,textureGlow:2,textureWeight:105});
  saveMax({...MAX_DEFAULTS,bgColor:accent,bgStrength:strength,glowColor:accent,cardTint:background,cardMode:material,glowStrength:24});
  addHistory('recipe');syncValues();window.dispatchEvent(new Event('arcana:design-change'));refresh();report('Recipe applied: '+name+'. Customize every setting.');}
 function remix(){const textures=PROCEDURAL_TEXTURES;const design=readDesign();const random=arr=>arr[Math.floor(Math.random()*arr.length)];
  const pattern=random(textures);const accent=random(['#A78BFA','#45EAD8','#EDB96E','#FC719A','#8FC7FF','#A1E28F']);
  replaceDesignDraft({...design,pattern:pattern.id,action:accent,intensity:15+Math.floor(Math.random()*36),textureWeight:70+Math.floor(Math.random()*100),textureGlow:Math.floor(Math.random()*6),heroCardStyle:random(['flat','glass','etched','minimal','accent-edge'])});
  saveMax({...readMax(),bgColor:accent,glowColor:accent,bgStrength:8+Math.floor(Math.random()*30),glowStrength:10+Math.floor(Math.random()*35),cardMode:random(['inherit','glass','gradient','flat'])});
  addHistory('remix');syncValues();window.dispatchEvent(new Event('arcana:design-change'));refresh();report('Remixed palette, texture, lighting and feature. Nothing published.');}
 function exportAll(){const payload={format:'arcana-design-desk',version:2,createdAt:new Date().toISOString(),...snapshot()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='arcana-design-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);report('Exported all core + advanced design values.');}
 async function importAll(file){try{if(file.size>200000)throw Error('File is too large');const raw=JSON.parse(await file.text());
  if(raw.format!=='arcana-design-desk'||raw.version!==2||!raw.core||!raw.max)throw Error('Not a v2 Arcana Design Studio export');
  const core={...DEFAULT_DESIGN};for(const key of DESIGN_FIELDS){const val=validateDesignField(key,raw.core[key]);if(val!==null)core[key]=val;}
  try{localStorage.setItem(BACKUP,JSON.stringify(snapshot()))}catch{}
  restore({core,max:normalizeMax(raw.max)});addHistory('import');report('Imported a validated Arcana design. Previous draft backed up locally.');}
  catch(e){report('Import rejected: '+String(e.message||e));}}
 function search(term){const t=term.trim().toLowerCase();if(!t){$('panel-search').hidden=true;return}
  for(const p of document.querySelectorAll('.panel'))p.hidden=p.id!=='panel-search';
  for(const b of document.querySelectorAll('[data-tab]'))b.classList.remove('active');
  const matches=MAX_GROUPS.flatMap(g=>g.fields.map(f=>({...f,group:g}))).filter(f=>(f.label+' '+f.group.name+' '+f.key).toLowerCase().includes(t));
  $('maxSearchResults').innerHTML=matches.map(f=>'<button data-max-goto="'+f.group.id+'" data-max-focus="'+f.key+'"><b>'+esc(f.label)+'</b><span>'+esc(f.group.name)+'</span></button>').join('')||'<div class="maxHelp">No matching controls.</div>';
 }
 document.addEventListener('input',e=>{
  const input=e.target;
  if(input.id==='maxFieldSearch'){search(input.value);return;}
  if(input.matches('[data-max-field]')){const key=input.dataset.maxField;if(writeMax(key,input.value)){compare='after';addHistory(key);syncValues();refresh();}}
  if(input.matches('[data-max-hex]')){const key=input.dataset.maxHex,v=normalizeDesignHex(input.value);if(v&&writeMax(key,v)){compare='after';addHistory(key);refresh();}}
 });
 document.addEventListener('change',e=>{
  if(e.target.matches('[data-max-hex]')){const val=readMax()[e.target.dataset.maxHex];e.target.value=val;syncValues();}
 });
 document.addEventListener('click',e=>{
  const action=e.target.closest('[data-max-action]');
  if(action){switch(action.dataset.maxAction){
   case 'undo':undo();break;case 'redo':redo();break;case 'fullscreen':{const stage=document.querySelector('.stage');stage.classList.toggle('maxPreviewFullscreen');action.setAttribute('aria-pressed',String(stage.classList.contains('maxPreviewFullscreen')));action.textContent=stage.classList.contains('maxPreviewFullscreen')?'✕ Exit fullscreen':'⛶ Fullscreen';break;}
   case 'compare':compare=compare==='before'?'after':'before';refresh();report('Preview: '+compare.toUpperCase()+' · draft remains untouched');break;
   case 'shuffle':remix();break;case 'save':{const arr=vaultData();let index=arr.findIndex(v=>!v);if(index<0)index=0;saveSlot(index);break;}
   case 'export':exportAll();break;case 'import':fileInput.click();break;
   case 'reset':if(confirm('Reset ALL local preview controls? Your published site will not change.')){restore({core:DEFAULT_DESIGN,max:MAX_DEFAULTS});addHistory('reset');report('Both design layers reset locally.');}break;
   case 'guide':$('maxFieldSearch').value='';for(const p of document.querySelectorAll('.panel'))p.hidden=p.id!=='panel-guide';for(const b of document.querySelectorAll('[data-tab]'))b.classList.toggle('active',b.dataset.tab==='guide');break;
  }return;}
  const slot=e.target.closest('[data-max-slot-save],[data-max-slot-load],[data-max-slot-remove]');if(slot){if(slot.dataset.maxSlotSave!==undefined)saveSlot(Number(slot.dataset.maxSlotSave));else if(slot.dataset.maxSlotLoad!==undefined)loadSlot(Number(slot.dataset.maxSlotLoad));else delSlot(Number(slot.dataset.maxSlotRemove));return;}
  const recipe=e.target.closest('[data-max-recipe]');if(recipe){useRecipe(Number(recipe.dataset.maxRecipe));return;}
  const go=e.target.closest('[data-max-goto]');if(go){$('maxFieldSearch').value='';const t=go.dataset.maxGoto;for(const p of document.querySelectorAll('.panel'))p.hidden=p.id!=='panel-'+t;for(const b of document.querySelectorAll('[data-tab]'))b.classList.toggle('active',b.dataset.tab===t);const field=document.querySelector('[data-max-container="'+go.dataset.maxFocus+'"]');field?.scrollIntoView({block:'center',behavior:'smooth'});field?.querySelector('[data-max-field]')?.focus();return;}
 });
 fileInput.addEventListener('change',()=>{if(fileInput.files?.[0])void importAll(fileInput.files[0]);fileInput.value='';});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelector('.stage')?.classList.remove('maxPreviewFullscreen');const b=document.querySelector('[data-max-action="fullscreen"]');if(b){b.textContent='⛶ Fullscreen';b.setAttribute('aria-pressed','false');}}if(!(e.ctrlKey||e.metaKey))return;
 if(e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}
 if(e.key.toLowerCase()==='s'){e.preventDefault();const list=vaultData();const i=list.findIndex(v=>!v);saveSlot(i<0?0:i);}
 });
 window.addEventListener('arcana:design-change',()=>{if(restoring)return;addHistory('core');compare='after';syncValues();refresh();});
 const frame=$('liveFrame');frame?.addEventListener('load',()=>{refresh();setTimeout(refresh,500);});
 const previewListener=()=>refresh();window.addEventListener('arcana:design-desk-preview',previewListener);
 const routes=document.querySelectorAll('[data-route]');for(const b of routes)if(b.dataset.route==='studio'){b.dataset.route='labs/build';b.textContent='Build Studio';}
 if($('address'))$('address').textContent=location.host+'/#/home';
 recipeMarkup();slots();syncValues();refresh();
 report(MAX_FIELDS.length+' additional working design parameters · '+PROCEDURAL_TEXTURES.length+' new SVG textures · '+recs.length+' new recipes · '+BACKUPS+' vault slots. Production protected.');
}
