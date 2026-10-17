
import {readDesign,writeDesign,applyDesignPreset,undoDesign,resetDesign,DESIGN_PRESETS,DEFAULT_DESIGN} from './design-controls.js';
import {THEME_PATTERNS} from './theme-patterns.js';
import {PROCEDURAL_TEXTURES,proceduralTexture} from './procedural-textures.js';
import {HERO_CTA_STYLES} from './hero-cta-styles.js';
import {installDesignMax} from './design-desk-max.js';
const el=id=>document.getElementById(id),esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const routes=['home','labs/build','calculators/pathfinder','wiki/library','user'];
const hueColor=v=>v.textureColorMode==='accent'?v.action:v.textureColor;
const ranges=[['intensity','Pattern intensity',0,100,'%'],['patternScale','Pattern size',60,180,'%'],['textureWeight','Line weight',40,250,'%'],['textureGlow','Texture glow',0,12,' px'],['glow','Global glow',0,100,'%'],['edges','Border intensity',0,100,'%'],['cardShadow','Card shadow',0,100,'%'],['roundness','Card corners',3,28,' px'],['buttonRoundness','Button corners',3,30,' px'],['buttonFill','Button color strength',35,100,'%'],['heroActionWidth','Build Studio button width',65,100,'%'],['heroActionGlow','Build Studio button glow',0,100,'%'],['heroActionHeight','Build Studio button height',44,70,' px'],['heroActionBorder','Build Studio button border',0,3,' px'],['buttonHeight','Global button height',40,58,' px'],['borderWidth','Border width',0,3,' px']];
const colors=[['main','Background'],['card','Panels'],['action','Primary accent'],['secondaryAccent','Second accent'],['text','Text'],['mutedText','Muted text'],['borderColor','Border color'],['navBar','Navigation'],['buttonText','Button text']];
const selects=[['buttonStyle','Buttons',[['gradient','Gradient'],['solid','Solid'],['outline','Outline']]],['heroCardStyle','Build Studio feature card',[['blended','Blended'],['flat','Flat'],['frameless','Frameless'],['etched','Etched'],['glass','Smoked glass'],['raised','Raised'],['accent-edge','Accent edge'],['metallic','Brushed alloy'],['minimal','Minimal']]],['heroActionStyle','Build Studio button',HERO_CTA_STYLES.map(x=>[x.id,x.name])],['heroSize','Feature card size',[['compact','Compact'],['balanced','Balanced'],['showcase','Showcase']]],['heroActionAlign','Feature button alignment',[['start','Left'],['center','Center'],['end','Right']]],['heroCardEmblem','Feature emblem',[['subtle','Subtle'],['hidden','Hidden'],['prominent','Prominent']]],['heroActionIcon','Feature button icon',[['show','Icon + arrow'],['hide','No icon'],['arrow-only','Arrow only']]],['heroActionSubtitle','Feature subtitle',[['auto','Automatic'],['show','Always visible'],['hide','Hidden']]],['density','Layout density',[['compact','Compact'],['comfortable','Comfortable'],['spacious','Spacious']]],['fontFamily','Typeface',[['system','System'],['rounded','Rounded'],['serif','Serif'],['mono','Monospace']]]];
let category='Procedural',route='home',frameReady=false;
const PREVIEW_VIEWPORTS=Object.freeze({desktop:{width:1180,height:900},compact:{width:830,height:820},phone:{width:430,height:850}});
let previewViewport='desktop',previewZoom=100;
function layoutPreviewFrame(){
 const windowEl=el('previewWindow'),iframe=el('liveFrame'),browser=el('browser');
 if(!windowEl||!iframe||!browser)return;
 const viewport=PREVIEW_VIEWPORTS[previewViewport]||PREVIEW_VIEWPORTS.desktop;
 const available=Math.max(80,windowEl.clientWidth-3);
 const scale=Math.min(1,available/viewport.width)*previewZoom/100;
 iframe.style.width=viewport.width+'px';
 iframe.style.height=viewport.height+'px';
 windowEl.style.setProperty('--arcana-preview-scale',String(scale));
 browser.dataset.viewportMode=previewViewport;
 const label=el('previewSizeInfo');
 if(label)label.textContent=viewport.width+' × '+viewport.height+' • '+Math.round(scale*100)+'%';
}

const legacyThumbs=new Map();
fetch('/arcana-contour.css',{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('Texture styles unavailable');return r.text()}).then(sheet=>{
 const rule=/\.themePatternThumb\[data-preview-pattern="([^"]+)"\]\{--thumb-pattern:([^}]+)\}/g;
 let m;while((m=rule.exec(sheet))!==null)legacyThumbs.set(m[1],m[2]);
 renderPatterns();
}).catch(()=>{ /* Never invent thumbnail art if the existing stylesheet is unavailable. */ });
const rangeMarkup=([key,label,min,max,unit])=>'<label class="control"><div class="controlTop"><span>'+esc(label)+'</span><output data-out="'+key+'"></output></div><input type="range" data-field="'+key+'" min="'+min+'" max="'+max+'"></label>';
const colorMarkup=([key,label])=>'<label class="control"><div class="controlTop"><span>'+label+'</span></div><div class="colorRow"><input type="color" data-field="'+key+'"><input type="text" data-hex="'+key+'" maxlength="7" spellcheck="false" aria-label="'+label+' hex"></div></label>';
el('textureSliders').innerHTML=ranges.slice(0,4).map(rangeMarkup).join('');
el('lightSliders').innerHTML=ranges.slice(4,7).map(rangeMarkup).join('');
el('paletteSliders').innerHTML=rangeMarkup(['headerOpacity','Header opacity',65,100,'%'])+rangeMarkup(['accentBlend','Accent blend',0,100,'%']);
el('colorFields').innerHTML=colors.map(colorMarkup).join('');
el('componentSliders').innerHTML=ranges.slice(7).map(rangeMarkup).join('');
el('componentFields').innerHTML=selects.map(([key,label,options])=>'<label class="control"><div class="controlTop"><span>'+label+'</span></div><select data-field="'+key+'">'+options.map(([id,title])=>'<option value="'+id+'">'+title+'</option>').join('')+'</select></label>').join('');
el('patternSelect').innerHTML=THEME_PATTERNS.map(p=>'<option value="'+p.id+'">'+p.name+' · '+p.category+'</option>').join('');
el('presets').innerHTML=Object.entries(DESIGN_PRESETS).map(([key,p])=>'<button class="preset" data-preset="'+key+'"><span class="swatches"><i style="background:'+p.main+'"></i><i style="background:'+p.card+'"></i><i style="background:'+p.action+'"></i><i style="background:'+p.secondaryAccent+'"></i></span><span><strong>'+p.name+'</strong><small>'+p.pattern.replaceAll('-',' ')+'</small></span></button>').join('');
function syncInputs(){
 const d=readDesign();for(const input of document.querySelectorAll('[data-field]')){const value=d[input.dataset.field];if(value!==undefined&&document.activeElement!==input)input.value=value;}
 for(const input of document.querySelectorAll('[data-hex]')){const value=d[input.dataset.hex];if(value!==undefined&&document.activeElement!==input)input.value=value.toUpperCase();}
 for(const out of document.querySelectorAll('[data-out]')){const r=ranges.find(x=>x[0]===out.dataset.out);out.textContent=d[out.dataset.out]+(r?.[4]||'');}
 for(const btn of document.querySelectorAll('[data-preset]')){const p=DESIGN_PRESETS[btn.dataset.preset];btn.classList.toggle('active',d.main===p.main&&d.action===p.action&&d.pattern===p.pattern);}
 const custom=document.querySelector('[data-field="textureColor"]');if(custom)custom.disabled=d.textureColorMode!=='custom';
 const customHex=document.querySelector('[data-hex="textureColor"]');if(customHex)customHex.disabled=d.textureColorMode!=='custom';
}
function renderPatterns(){
 const d=readDesign(),q=el('filter').value.trim().toLowerCase();
 const patterns=THEME_PATTERNS.filter(p=>(category==='All'||category==='Procedural'&&p.category==='Procedural'||category===p.category)&&(!q||(p.name+' '+p.category).toLowerCase().includes(q)));
 el('patternList').innerHTML=patterns.map(p=>{
  const v=proceduralTexture(p.id,hueColor(d),d.textureWeight,85,0);
  const legacy=legacyThumbs.get(p.id);
  const fallback='--thumb-ink:color-mix(in srgb,'+d.action+' 58%,transparent);--thumb-alt:color-mix(in srgb,'+d.secondaryAccent+' 40%,transparent);';
  const pic=v?'background-image:'+v.url+';background-size:76px 76px;':
    legacy?fallback+'--thumb-pattern:'+legacy+';background-image:var(--thumb-pattern);background-size:64px 64px;':
    'background-image:none;';
  const badge=v?'SVG':'CSS';
  return '<button class="textureButton '+(p.id===d.pattern?'active':'')+'" data-pattern="'+p.id+'" title="'+esc(p.name)+'"><span class="textureVisual" style="'+pic.replaceAll('"','&quot;')+'"></span><span class="label">'+esc(p.name)+' <small>'+badge+'</small></span></button>';
 }).join('')||'<div class="empty">No patterns match.</div>';
}
function applyPreview(){
 const iframe=el('liveFrame');if(!frameReady)return;
 try{
  const d=readDesign();
  iframe.contentWindow.postMessage({type:'arcana:design-desk-sync',core:d},location.origin);
  window.dispatchEvent(new Event('arcana:design-desk-preview'));
  el('viewStatus').textContent=d.pattern.replaceAll('procedural-','')+' · '+d.intensity+'% intensity';
 }catch(e){el('viewStatus').textContent='Preview unavailable: '+String(e.message||e);}
}
function updated(){syncInputs();renderPatterns();applyPreview();}
document.addEventListener('input',e=>{
 const i=e.target;
 if(i.matches('[data-field]')){
  if(writeDesign(i.dataset.field,i.value))updated();
 }else if(i.matches('[data-hex]')){
  const value=i.value.trim();if(/^#?[0-9a-fA-F]{6}$/.test(value)){writeDesign(i.dataset.hex,value.startsWith('#')?value:'#'+value);updated();}
 }else if(i.id==='filter'){renderPatterns();}
});
document.addEventListener('click',e=>{
 const tab=e.target.closest('[data-tab]');if(tab){for(const b of document.querySelectorAll('[data-tab]'))b.classList.toggle('active',b===tab);for(const p of document.querySelectorAll('.panel'))p.hidden=p.id!=='panel-'+tab.dataset.tab;return;}
 const p=e.target.closest('[data-pattern]');if(p){writeDesign('pattern',p.dataset.pattern);updated();return;}
 const preset=e.target.closest('[data-preset]');if(preset){applyDesignPreset(preset.dataset.preset);updated();return;}
 const cat=e.target.closest('[data-category]');if(cat){category=cat.dataset.category;for(const b of document.querySelectorAll('[data-category]'))b.classList.toggle('active',b===cat);renderPatterns();return;}
 const b=e.target.closest('[data-route]');if(b){route=b.dataset.route;for(const bt of document.querySelectorAll('[data-route]'))bt.classList.toggle('active',bt===b);el('address').textContent=location.host+'/#/'+route;frameReady=false;el('liveFrame').src='/?arcana-design-desk=1#/'+route;return;}
 const width=e.target.closest('[data-preview-viewport]');if(width){previewViewport=width.dataset.previewViewport;for(const bt of document.querySelectorAll('[data-preview-viewport]'))bt.classList.toggle('active',bt===width);layoutPreviewFrame();return;}
});
el('undo').addEventListener('click',()=>document.querySelector('[data-max-action="undo"]')?.click());
el('reset').addEventListener('click',()=>document.querySelector('[data-max-action="reset"]')?.click());
el('export').addEventListener('click',()=>document.querySelector('[data-max-action="export"]')?.click());
el('reload').addEventListener('click',()=>{frameReady=false;el('liveFrame').src='/?arcana-design-desk='+Date.now()+'#/'+route});
el('liveFrame').addEventListener('load',()=>{frameReady=true;layoutPreviewFrame();applyPreview();setTimeout(applyPreview,250);setTimeout(applyPreview,1500);setTimeout(applyPreview,4000)});
window.addEventListener('arcana:preview-zoom',e=>{previewZoom=Number(e.detail)||100;layoutPreviewFrame()});
window.addEventListener('resize',layoutPreviewFrame);
if(typeof ResizeObserver!=='undefined'){const previewResize=new ResizeObserver(layoutPreviewFrame);previewResize.observe(el('previewWindow'));}

window.addEventListener('arcana:design-change',()=>{syncInputs();renderPatterns();applyPreview()});
syncInputs();renderPatterns();layoutPreviewFrame();
try{installDesignMax();document.documentElement.dataset.deskReady='true';window.dispatchEvent(new CustomEvent('arcana:desk-ready'));}catch(error){document.documentElement.dataset.deskReady='partial';console.error('DESIGN_STUDIO_SETUP_ERROR',error);window.dispatchEvent(new CustomEvent('arcana:desk-error',{detail:String(error?.message||error)}));}
