import {esc,icon} from './ui.js';
import {CREST_DEFAULT,CREST_MARKS,CREST_OUTLINES,CREST_BORDERS,renderCrest} from './guild-crest.js';

// Entirely client-side designer until a verified guild owner explicitly saves.
const KEY='arcana:guild-crest-playground:v1';
const SHAPES={center:25,secondary:25,outline:10,border:10};
const LAYERS=[
 ['center','Main emblem','The bold center symbol, readable even beside a username.'],
 ['secondary','Accent emblem','A tiny second motif that completes the design.'],
 ['outline','Shield silhouette','The background shape that defines the crest.'],
 ['border','Outer trim','The finishing frame.']
];
const PALETTES=[
 {name:'Royal Violet',colors:['#E9D7FF','#9785E8','#39235E','#F5E9BA'],tag:'#D2B2FF'},
 {name:'Infernal',colors:['#FFD6A3','#FF664E','#4D1018','#FFCB69'],tag:'#FF9C75'},
 {name:'Emerald',colors:['#DBFFD7','#52D6A2','#124D3E','#BCE9A0'],tag:'#85F5C5'},
 {name:'Glacial',colors:['#F1FDFF','#75D5FF','#143C63','#B6F9FF'],tag:'#90D9FF'},
 {name:'Solar',colors:['#FFF3B0','#FFC04F','#613719','#FFF8DC'],tag:'#FFE095'},
 {name:'Obsidian',colors:['#F5EAF2','#A4A4BE','#161A2D','#C9AACF'],tag:'#DAD4EF'},
];
const validColor=(s,fallback)=>typeof s==='string'&&/^#[\da-fA-F]{6}$/.test(s)?s.toUpperCase():fallback;
const normalize=input=>{
 const d=input&&typeof input==='object'?input:{};
 const source=d.crest||d;
 return {crest:Object.fromEntries([...Object.keys(SHAPES).map(k=>[k,Number.isInteger(source?.[k])&&source[k]>=0&&source[k]<SHAPES[k]?source[k]:CREST_DEFAULT[k]]),
 ['colors',(Array.isArray(source?.colors)?source.colors:CREST_DEFAULT.colors).slice(0,4).map((c,i)=>validColor(c,CREST_DEFAULT.colors[i]))]]),
 tagStyle:{color:validColor(d.tagStyle?.color||d.tagColor,'#D2B2FF'),finish:['solid','glow','gradient'].includes(d.tagStyle?.finish)?d.tagStyle.finish:'glow'},
 tag:/^[A-Z]{4}$/.test(String(d.tag||'').toUpperCase())?String(d.tag).toUpperCase():'GILD'};
};
function readLocal(){
 try{return normalize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{return normalize(null);}
}
const iconLabel=key=>key==='center'?'Main emblem':key==='secondary'?'Accent emblem':key==='outline'?'Shield silhouette':'Outer trim';
function choiceGrid(key,d){
 return '<div class="crestChoiceGrid" role="group" aria-label="'+esc(iconLabel(key))+' choices">'+
 Array.from({length:SHAPES[key]},(_,i)=>{
  const sample={...d.crest,[key]:i};
  return '<button type="button" class="crestChoice'+(d.crest[key]===i?' selected':'')+'" data-crest-choose="'+key+'" data-value="'+i+'" aria-pressed="'+(d.crest[key]===i)+'" aria-label="'+esc(iconLabel(key))+' design '+(i+1)+'">'+
   renderCrest(sample,48)+'<span>'+String(i+1).padStart(2,'0')+'</span></button>';
 }).join('')+'</div>';
}
function modelAttr(d){return esc(JSON.stringify(d));}
function crestPreview(d){
 const c=d.tagStyle.color,finish=d.tagStyle.finish;
 return '<div class="crestStudioShowcase">'+
  '<span class="crestShowcaseKicker">GUILD IDENTITY STUDIO</span>'+
  '<div class="crestShowcaseSeal">'+renderCrest(d.crest,164)+'</div>'+
  '<div class="crestShowcaseHandle"><span class="crestNameTag finish-'+esc(finish)+'" style="--guild-tag-color:'+c+'">'+renderCrest(d.crest,27)+' ['+esc(d.tag)+']</span><span>Adventurer</span></div>'+
  '<p>This is how your crest and tag can look beside a player name. The real badge is much smaller.</p>'+
  '<div class="crestSmallSamples">'+[20,23,26].map(n=>'<span>'+renderCrest(d.crest,n)+' ['+esc(d.tag)+']</span>').join('')+'</div></div>';
}
export function crestStudio({guildId='',design=null,tag='GILD',tagStyle=null,playground=false}={}){
 const d=design?normalize({crest:design,tag,tagStyle}):readLocal();
 if(design)d.tag=tag;
 const options=LAYERS.map(([key,title,desc],i)=>'<details class="crestDesignLayer" '+(i===0?'open':'')+'><summary><span class="crestLayerIndex">'+(i+1)+'</span><span><strong>'+title+'</strong><small>'+desc+'</small></span><span class="crestLayerCounter">'+SHAPES[key]+' designs</span></summary>'+choiceGrid(key,d)+'</details>').join('');
 const colors=['Main emblem','Accent emblem','Shield body','Border trim'];
 return '<section class="crestStudio" data-crest-workshop data-crest-model="'+modelAttr(d)+'" data-crest-guild="'+esc(guildId)+'">'+
  '<div class="crestStudioIntro"><span class="eyebrow">PERSONALIZE YOUR BANNER</span><h2>Guild Crest Designer</h2><p>Every piece is your choice. Mix 25 primary symbols, 25 secondary symbols, 10 shields and 10 borders, then color every layer. This is the centerpiece of Arcana guilds.</p></div>'+
  '<div class="crestStudioLayout"><div class="crestStudioCanvas" data-crest-preview>'+crestPreview(d)+'</div>'+
  '<div class="crestStudioControls"><div class="crestStudioActions"><button type="button" data-crest-action="random" class="btn secondary">'+icon('spark',16)+' Surprise me</button>'+
   '<button type="button" data-crest-action="reset" class="btn secondary">Reset</button></div>'+
   '<div class="crestStudioBlock"><h3>Quick palettes</h3><div class="crestPaletteGrid">'+PALETTES.map((p,i)=>'<button type="button" data-crest-palette="'+i+'" class="crestPalette" aria-label="Use '+p.name+' palette"><span class="crestPaletteSwatches">'+p.colors.map(c=>'<i style="background:'+c+'"></i>').join('')+'</span><span>'+p.name+'</span></button>').join('')+'</div></div>'+
   '<div class="crestStudioBlock"><h3>Shapes</h3><p class="mutedSmall">Tap a category to explore its full library. Each choice updates the crest instantly.</p>'+options+'</div>'+
   '<div class="crestStudioBlock"><h3>Layer colors</h3><div class="crestColorGrid">'+colors.map((label,i)=>'<label class="crestColorOption"><input type="color" aria-label="'+label+' color" data-crest-color="'+i+'" value="'+d.crest.colors[i]+'"><span>'+label+'</span><code>'+d.crest.colors[i]+'</code></label>').join('')+'</div></div>'+
   '<div class="crestStudioBlock"><h3>Tag styling</h3><div class="crestTagInputs"><label>Four-letter preview tag<input data-crest-tag maxlength="4" pattern="[A-Za-z]{4}" value="'+esc(d.tag)+'" autocapitalize="characters" aria-label="Four-letter preview tag"></label>'+
   '<label>Tag color<input type="color" data-crest-tag-color value="'+d.tagStyle.color+'"></label>'+
   '<label>Finish<select data-crest-finish><option value="solid"'+(d.tagStyle.finish==='solid'?' selected':'')+'>Solid</option><option value="glow"'+(d.tagStyle.finish==='glow'?' selected':'')+'>Soft glow</option><option value="gradient"'+(d.tagStyle.finish==='gradient'?' selected':'')+'>Shimmer</option></select></label></div></div>'+
   '<div class="crestStudioFooter"><button type="button" class="btn secondary" data-crest-action="download">Export SVG</button>'+
   (guildId?'<button type="button" class="btn primary" data-crest-action="save-guild">Save official crest</button>':'<button type="button" class="btn primary" data-crest-action="save-local">Save design on this device</button>')+
   '</div><p class="mutedSmall">'+(guildId?'Changes to your registered guild become visible to members when you save.':'This workshop is open to everyone. Playing with the designer never registers a guild or reserves a tag.')+'</p>'+
   '<p class="crestStudioStatus" role="status" aria-live="polite"></p>'+
   '</div></div></section>';
}
export function crestWorkshopPage(me=null){
 return '<div class="guildHubPage crestWorkshopPage"><button class="guildHubBack" data-route="guilds">← Guild directory</button>'+
 '<div class="guildHubHero"><span class="eyebrow">ARCANA CREST STUDIO</span><h1>Forge your guild identity.</h1><p>No application or account needed to try the designer. All the options are here, without an army of servers and menus.</p></div>'+
 crestStudio()+
 '<div class="guildHubWorkshopNext"><h2>Ready to represent your guild?</h2><p>Register a four-letter tag and claim your guild page. Approval gives your crest and tag their official appearance across Arcana.</p>'+
 '<button type="button" class="btn primary" data-route="'+(me?'guilds/register':'account')+'">'+(me?'Register your guild':'Sign in to register')+'</button></div></div>';
}
function updatePanel(panel,d,{shapes=false}={}){
 panel.dataset.crestModel=JSON.stringify(d);
 panel.querySelector('[data-crest-preview]').innerHTML=crestPreview(d);
 for(const k of Object.keys(SHAPES)){
  for(const b of panel.querySelectorAll('[data-crest-choose="'+k+'"]')){
   const selected=Number(b.dataset.value)===d.crest[k];
   b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));
   if(shapes)b.innerHTML=renderCrest({...d.crest,[k]:Number(b.dataset.value)},48)+'<span>'+String(Number(b.dataset.value)+1).padStart(2,'0')+'</span>';
  }
 }
 for(const c of panel.querySelectorAll('[data-crest-color]')){
  const i=Number(c.dataset.crestColor);c.value=d.crest.colors[i];c.closest('label').querySelector('code').textContent=d.crest.colors[i];
 }
 const tag=panel.querySelector('[data-crest-tag]');if(tag&&document.activeElement!==tag)tag.value=d.tag;
 panel.querySelector('[data-crest-tag-color]').value=d.tagStyle.color;
 panel.querySelector('[data-crest-finish]').value=d.tagStyle.finish;
}
const getPanel=el=>el.closest('[data-crest-workshop]');
function updateModel(panel,mutate,refreshShapes=false){
 const d=normalize(JSON.parse(panel.dataset.crestModel||'null'));mutate(d);
 updatePanel(panel,d,{shapes:refreshShapes});
}
export function readGuildCrestDesign(panel){
 const d=normalize(JSON.parse(panel.dataset.crestModel||'null'));
 return {crest:d.crest,tagStyle:d.tagStyle};
}
export function wireCrestWorkshop({toast=()=>{},onSave=async()=>{}}={}){
 document.addEventListener('click',e=>{
  const opt=e.target.closest('[data-crest-choose]');
  if(opt){
   const panel=getPanel(opt);if(!panel)return;
   updateModel(panel,d=>{d.crest[opt.dataset.crestChoose]=Number(opt.dataset.value);});
   return;
  }
  const palette=e.target.closest('[data-crest-palette]');
  if(palette){
   const panel=getPanel(palette),p=PALETTES[Number(palette.dataset.crestPalette)];if(!panel||!p)return;
   updateModel(panel,d=>{d.crest.colors=[...p.colors];d.tagStyle.color=p.tag;},true);return;
  }
  const action=e.target.closest('[data-crest-action]');if(!action)return;
  const panel=getPanel(action);if(!panel)return;
  const kind=action.dataset.crestAction;
  if(kind==='random'){
   updateModel(panel,d=>{for(const [k,n] of Object.entries(SHAPES))d.crest[k]=Math.floor(Math.random()*n);},false);
  }else if(kind==='reset'){
   updatePanel(panel,normalize({crest:CREST_DEFAULT,tag:'GILD'}),true);
  }else if(kind==='save-local'){
   try{localStorage.setItem(KEY,panel.dataset.crestModel);toast('Crest design saved on this device.');}
   catch{toast('Could not save on this device.');}
  }else if(kind==='download'){
   const d=normalize(JSON.parse(panel.dataset.crestModel));const image=renderCrest(d.crest,280).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
   const url=URL.createObjectURL(new Blob([image],{type:'image/svg+xml;charset=utf-8'}));
   const anchor=document.createElement('a');anchor.href=url;anchor.download='arcana-'+d.tag.toLowerCase()+'-crest.svg';document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   toast('Crest exported as SVG.');
  }else if(kind==='save-guild'){
   const status=panel.querySelector('.crestStudioStatus');
   if(status)status.textContent='Saving your guild crest…';
   const id=panel.dataset.crestGuild;
   if(!id)return;
   action.disabled=true;
   void onSave(id,readGuildCrestDesign(panel)).then(()=>{
    if(status)status.textContent='Official crest saved.';
    toast('Guild crest updated.');
   }).catch(err=>{
    if(status)status.textContent=err.message||'Could not save.';
    toast(err.message||'Could not save guild crest.');
   }).finally(()=>{action.disabled=false;});
  }
 });
 document.addEventListener('input',e=>{
  const panel=getPanel(e.target);if(!panel)return;
  if(e.target.hasAttribute('data-crest-color')){
   const n=Number(e.target.dataset.crestColor),c=validColor(e.target.value,CREST_DEFAULT.colors[n]);
   updateModel(panel,d=>{d.crest.colors[n]=c;},true);
  }else if(e.target.hasAttribute('data-crest-tag-color')){
   updateModel(panel,d=>{d.tagStyle.color=validColor(e.target.value,'#D2B2FF');});
  }else if(e.target.hasAttribute('data-crest-tag')){
   const draft=e.target.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,4);
   e.target.value=draft;
   if(draft.length===4)updateModel(panel,d=>{d.tag=draft;});
  }
 });
 document.addEventListener('change',e=>{
  const panel=getPanel(e.target);if(!panel)return;
  if(e.target.hasAttribute('data-crest-finish'))updateModel(panel,d=>{d.tagStyle.finish=e.target.value;});
 });
}
