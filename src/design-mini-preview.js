// A miniature, self-contained preview for admin style editing. No iframe or second app instance.
import {arcanaIcon} from './arcana-icons.js';
import {readDesign} from './design-controls.js';
import {proceduralTexture} from './procedural-textures.js';
import {themeReadability} from './theme-studio-audit.js';
const PREVIEW_UI_KEY='arcana-theme-preview-layout-v2';
const storedPreview=()=>{try{return JSON.parse(globalThis.localStorage?.getItem(PREVIEW_UI_KEY)||'{}')||{}}catch{return {}}};
const initial=storedPreview();
let baseline=null,mode='after',page=['home','studio','pathfinder','wiki','profile'].includes(initial.page)?initial.page:'home';
let device=['phone','tablet','desktop'].includes(initial.device)?initial.device:'phone';
let previewExpanded=initial.previewExpanded!==false;
let previewMode=['dock','expanded','focus'].includes(initial.previewMode)?initial.previewMode:'dock';
const storePreview=()=>{try{globalThis.localStorage?.setItem(PREVIEW_UI_KEY,JSON.stringify({page,device,previewExpanded,previewMode}))}catch{}};

const icon=(id,px=15)=>arcanaIcon(id,px);
function start(){if(!baseline){baseline={...readDesign()};mode='after';page='home';}}
export function endDesignMiniSession(){baseline=null;mode='after';page='home';}
const tile=(title,sub,id)=>'<div class="miniTile"><div class="miniTileIcon">'+icon(id)+'</div><div class="miniTileWords"><b>'+title+'</b><small>'+sub+'</small></div>'+icon('arrow',12)+'</div>';
export function designMiniMarkup(){
 start();
 return '<section class="designMiniPreview" aria-label="Live mini theme preview">'+'<div class="miniPreviewGrip" data-mini-grip title="Drag up or down to resize preview"></div>'+
 '<header class="miniPreviewHeader"><div><strong>Live preview</strong><small>Always beside your controls · updates instantly</small></div><div class="miniPreviewHeaderActions"><button type="button" data-mini-toggle aria-expanded="'+String(previewExpanded)+'" aria-controls="miniPreviewContents">'+(previewExpanded?'Collapse':'Open')+'</button><button type="button" data-mini-size="cycle" aria-pressed="'+String(previewMode==='focus')+'">'+(previewMode==='focus'?'Dock':previewMode==='expanded'?'Full screen':'Larger')+'</button></div></header>'+
 '<div id="miniPreviewContents" class="miniPreviewContents" '+(previewExpanded?'':'hidden')+'><div class="miniPreviewToolbar"><div class="miniDeviceSwitch" role="group" aria-label="Simulated device width"><button type="button" data-mini-device="phone" aria-pressed="'+(device==='phone')+'">Phone</button><button type="button" data-mini-device="tablet" aria-pressed="'+(device==='tablet')+'">Tablet</button><button type="button" data-mini-device="desktop" aria-pressed="'+(device==='desktop')+'">Desktop</button></div><button type="button" data-mini-reset>Reset view</button></div><div class="miniCompare" role="group" aria-label="Before and After"><button type="button" data-mini-compare="before" aria-pressed="false">Before</button><button type="button" data-mini-compare="after" aria-pressed="true">After</button></div>'+
 '<div class="miniCanvas" data-mini-canvas data-mini-page="home" data-mini-pattern="contours" aria-label="Miniature Arcana homepage showing current appearance">'+
 '<div class="miniHeader"><span>'+icon('message-square')+'</span><b><i class="miniLogo"></i> ARCANA</b><span>'+icon('search')+'</span></div>'+
 '<div class="miniPage miniHome"><div class="miniHero"><div class="miniHeroTitle"><span class="miniHeroIcon">'+icon('flask',22)+'</span><span><small>THE HEART OF ARCANA</small><b>Build Studio</b><em>Gear, runes, pets and skills</em></span></div><div class="miniCTA">'+icon('feature-build-studio',16)+'<span class="miniCTACopy"><strong>Enter Build Studio</strong><small>Forge your perfect setup</small></span>'+icon('arrow',14)+'</div></div><div class="miniPageLabel">Quick Access <small>See All →</small></div><div class="miniTiles">'+tile('Wiki','Game systems','book')+tile('Tools','Calculators','calculator')+'</div></div>'+
 '<div class="miniPage miniStudio"><div class="miniHero miniWorkspace"><span class="miniHeroIcon">'+icon('feature-build-studio',28)+'</span><span><small>BUILD STUDIO</small><b>My Build</b><em>Mage · Season 2</em></span></div><div class="miniTabs"><b>Equipment</b><span>Rune Forge</span><span>Skills</span></div><div class="miniGear"><span>'+icon('equipment-head')+'</span><span>'+icon('equipment-chest')+'</span><span>'+icon('equipment-hands')+'</span><span>'+icon('equipment-feet')+'</span><span>'+icon('equipment-neck')+'</span></div><div class="miniCTA miniSecondaryCTA">Save Build</div></div>'+
 '<div class="miniPage miniPathfinder"><div class="miniHero miniWorkspace"><span class="miniHeroIcon">'+icon('layers',26)+'</span><span><small>GEAR PROGRESSION</small><b>Pathfinder</b><em>Every upgrade, one quick look</em></span></div><div class="miniTabs"><b>Upgrade Map</b><span>From → To</span><span>Compare</span></div><div class="miniStages"><span>A1</span><b>A2</b><span>A3</span><span>A4</span></div><div class="miniMaterials"><b>Materials needed</b><small>Gold · Essence · Shards</small><i></i></div></div>'+
 '<div class="miniPage miniWiki"><div class="miniHero miniWorkspace"><span class="miniHeroIcon">'+icon('book',26)+'</span><span><small>ARCANAWIKI</small><b>Discover the game</b><em>Guides, equipment and mechanics</em></span></div><div class="miniTabs"><b>Guides</b><span>Equipment</span><span>Biomes</span></div><div class="miniTiles">'+tile('Season 2','Start here','book')+tile('Equipment','Drop bonuses','shield')+'</div></div>'+
 '<div class="miniPage miniProfile"><div class="miniHero miniWorkspace"><span class="miniHeroIcon">'+icon('user',26)+'</span><span><small>YOUR PROFILE</small><b>Player center</b><em>Builds, activity and progress</em></span></div><div class="miniTabs"><b>Saved builds</b><span>Checklists</span><span>Activity</span></div><div class="miniMaterials"><b>Material checklist</b><small>12 / 19 collected</small><i></i></div><div class="miniTiles">'+tile('Build 1','Ready to share','shield')+tile('My guild','PDX','users')+'</div></div>'+
 '<div class="miniDock"><span>'+icon('home')+'<small>Home</small></span><span>'+icon('user')+'<small>Profile</small></span><span>'+icon('spark')+'<small>Featured</small></span><span>'+icon('clock')+'<small>Recent</small></span><span>'+icon('menu')+'<small>Options</small></span></div></div>'+
 '<div class="miniViews" role="group" aria-label="Choose example screen"><button data-mini-page="home" type="button" aria-pressed="true">Home</button><button data-mini-page="studio" type="button" aria-pressed="false">Build</button><button data-mini-page="pathfinder" type="button" aria-pressed="false">Pathfinder</button><button data-mini-page="wiki" type="button" aria-pressed="false">Wiki</button><button data-mini-page="profile" type="button" aria-pressed="false">Profile</button></div>'+
 '<section class="miniReadability" aria-label="Theme contrast check"><div><strong>Readability meter</strong><small>AA text target: 4.5:1</small></div><div class="miniReadabilityList">'+[['base','Page text'],['card','Panel text'],['button','Button label']].map(([id,label])=>'<div class="miniReadabilityRow" data-mini-readability="'+id+'"><span>'+label+'</span><strong data-mini-ratio="'+id+'">…</strong></div>').join('')+'</div><button type="button" data-mini-fix-contrast hidden>Fix button label contrast</button><small>Estimated flat-color contrast. Text over images and effects needs visual testing.</small></section>'+
 '<p class="miniCaption" data-mini-caption role="status">After: the design you are editing.</p></div></section>';
}
export function syncDesignMiniPreview(){
 const canvas=globalThis.document?.querySelector('[data-mini-canvas]');
 if(!canvas)return;
 start();
 const v=mode==='before'?baseline:readDesign();
 for(const [name,value] of Object.entries({
  '--mini-main':v.main,'--mini-panel':v.card,'--mini-accent':v.action,'--mini-text':v.text,'--mini-secondary':v.secondaryAccent,'--mini-border':v.borderColor,'--mini-muted':v.mutedText,'--mini-nav':v.navBar,'--mini-button-text':v.buttonText,
  '--mini-alpha':String(v.intensity/100),'--mini-glow':Math.round(v.glow*.28)+'px',
  '--mini-edge':v.edges+'%','--mini-radius':v.roundness+'px','--mini-pattern-size':v.patternScale+'%','--mini-shadow-alpha':v.cardShadow/100,'--mini-font-scale':v.fontSize/100,'--mini-card-padding':v.cardPadding+'px','--mini-header-alpha':v.headerOpacity+'%','--mini-border-width':v.borderWidth+'px','--mini-button-height':v.buttonHeight+'px','--mini-blend':v.accentBlend+'%',
  '--mini-button-radius':v.buttonRoundness+'px','--mini-fill':v.buttonFill+'%',
  '--mini-cta-width':v.heroActionWidth+'%','--mini-cta-height':Math.max(28,Math.round(v.heroActionHeight*.65))+'px','--mini-cta-glow':String(v.heroActionGlow/100),'--mini-cta-border':v.heroActionBorder+'px'
 }))canvas.style.setProperty(name,value);
 const vector=proceduralTexture(v.pattern,v.textureColorMode==='accent'?v.action:v.textureColor,v.textureWeight,v.intensity,v.textureGlow);
 if(vector){canvas.style.setProperty('--mini-pattern',vector.url);canvas.style.setProperty('--mini-pattern-size',Math.round(vector.size*v.patternScale/100)+'px');}
 else {canvas.style.removeProperty('--mini-pattern');}
 canvas.dataset.miniDevice=device;canvas.dataset.miniPage=page;canvas.dataset.miniHeroAction=v.heroActionStyle;canvas.dataset.miniHeroSize=v.heroSize;canvas.dataset.miniPattern=v.pattern;canvas.dataset.miniFont=v.fontFamily;canvas.dataset.miniDensity=v.density;canvas.dataset.miniButtons=v.buttonStyle;canvas.dataset.miniHeroCard=v.heroCardStyle;canvas.dataset.miniHeroEmblem=v.heroCardEmblem;canvas.dataset.miniHeroAlign=v.heroActionAlign;canvas.dataset.miniHeroIcon=v.heroActionIcon;canvas.dataset.miniHeroSubtitle=v.heroActionSubtitle;canvas.dataset.miniPatternTarget=v.patternTarget;
 canvas.setAttribute('aria-label',(mode==='before'?'Before editing':'Current')+' '+page+' example');
 const section=canvas.closest('.designMiniPreview');
 section.dataset.previewMode=previewMode;section.dataset.miniDevice=device;
 const dock=section.closest('.themeStudioPreview');
 if(dock){dock.dataset.previewMode=previewMode;dock.dataset.miniDevice=device;dock.dataset.previewExpanded=String(previewExpanded)}
 for(const b of section.querySelectorAll('[data-mini-device]'))b.setAttribute('aria-pressed',String(b.dataset.miniDevice===device));
 const focus=section.querySelector('[data-mini-size]');
 if(focus){focus.textContent=previewMode==='focus'?'Dock':previewMode==='expanded'?'Full screen':'Larger';focus.setAttribute('aria-pressed',String(previewMode==='focus'))}
 const toggle=section.querySelector('[data-mini-toggle]');
 if(toggle){toggle.textContent=previewExpanded?'Collapse':'Open';toggle.setAttribute('aria-expanded',String(previewExpanded))}
 const contents=section.querySelector('#miniPreviewContents');
 if(contents)contents.hidden=!previewExpanded;

 for(const b of section.querySelectorAll('[data-mini-compare]'))b.setAttribute('aria-pressed',String(b.dataset.miniCompare===mode));
 for(const b of section.querySelectorAll('button[data-mini-page]'))b.setAttribute('aria-pressed',String(b.dataset.miniPage===page));
 const caption=section.querySelector('[data-mini-caption]');
 if(caption)caption.textContent=mode==='before'?'Before: your original theme when this editor opened.':'After: your current local draft. Nothing is published until you choose Publish.';
 const contrast=themeReadability(v);
 for(const item of contrast){
  const ratio=section.querySelector('[data-mini-ratio="'+item.id+'"]');
  const row=section.querySelector('[data-mini-readability="'+item.id+'"]');
  if(ratio)ratio.textContent=item.ratio.toFixed(1)+':1';
  if(row)row.dataset.pass=String(item.pass);
 }
 const fix=section.querySelector('[data-mini-fix-contrast]');
 if(fix)fix.hidden=mode!=='after'||contrast.find(item=>item.id==='button')?.pass!==false;

}
export function showDesignMiniPage(next){
 if(!['home','studio','pathfinder','wiki','profile'].includes(next))return;
 page=next;mode='after';storePreview();syncDesignMiniPreview();
}
export function focusDesignMiniPreview(){
 previewMode='focus';previewExpanded=true;storePreview();syncDesignMiniPreview();
}
export function wireDesignMiniPreview(){
 if(typeof document==='undefined')return;
 document.addEventListener('click',e=>{
  const b=e.target.closest('button[data-mini-compare],button[data-mini-page],button[data-mini-reset],button[data-mini-toggle],button[data-mini-size],button[data-mini-device]');
  if(!b||!b.closest('.designMiniPreview')||document.documentElement.dataset.arcanaAdminDesign!=='true')return;
  if(b.hasAttribute('data-mini-toggle')){previewExpanded=!previewExpanded;if(!previewExpanded&&previewMode==='focus')previewMode='dock';}
  else if(b.hasAttribute('data-mini-size')){previewExpanded=true;previewMode=previewMode==='dock'?'expanded':previewMode==='expanded'?'focus':'dock';}
  else if(b.hasAttribute('data-mini-device'))device=['phone','tablet','desktop'].includes(b.dataset.miniDevice)?b.dataset.miniDevice:device;
  else if(b.hasAttribute('data-mini-reset')){mode='after';page='home';device='phone';}
  else if(b.hasAttribute('data-mini-compare'))mode=b.dataset.miniCompare==='before'?'before':'after';
  else if(b.hasAttribute('data-mini-page'))page=['home','studio','pathfinder','wiki','profile'].includes(b.dataset.miniPage)?b.dataset.miniPage:'home';
  storePreview();
  syncDesignMiniPreview();
 });
 document.addEventListener('focusin',e=>{
  const dock=document.querySelector('.themeStudioPreview');
  if(dock&&e.target.closest('.themeStudioEditor'))dock.dataset.editing='true';
 });
 document.addEventListener('focusout',e=>{
  if(!e.target.closest('.themeStudioEditor'))return;
  setTimeout(()=>{
   const dock=document.querySelector('.themeStudioPreview');
   if(dock&&!document.activeElement?.closest('.themeStudioEditor'))dock.dataset.editing='false';
  },130);
 });
 let start=null;
 document.addEventListener('pointerdown',e=>{
  const grip=e.target.closest('[data-mini-grip]');
  if(grip&&grip.closest('.themeStudioPreview'))start={id:e.pointerId,y:e.clientY};
 });
 document.addEventListener('pointerup',e=>{
  if(!start||e.pointerId!==start.id)return;
  const movement=start.y-e.clientY;start=null;
  if(Math.abs(movement)<38)return;
  if(movement>0){previewExpanded=true;previewMode=previewMode==='dock'?'expanded':'focus';}
  else if(previewMode==='focus')previewMode='expanded';
  else if(previewMode==='expanded')previewMode='dock';
  else previewExpanded=false;
  storePreview();syncDesignMiniPreview();
 });
 document.addEventListener('pointercancel',()=>{start=null});
 window.addEventListener('arcana:design-change',syncDesignMiniPreview);
}
