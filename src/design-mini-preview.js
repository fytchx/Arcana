// A miniature, self-contained preview for admin style editing. No iframe or second app instance.
import {arcanaIcon} from './arcana-icons.js';
import {readDesign} from './design-controls.js';
let baseline=null, mode='after', page='home', previewExpanded=true;
const icon=(id,px=15)=>arcanaIcon(id,px);
function start(){if(!baseline){baseline={...readDesign()};mode='after';page='home';}}
export function endDesignMiniSession(){baseline=null;mode='after';page='home';}
const tile=(title,sub,id)=>'<div class="miniTile"><div class="miniTileIcon">'+icon(id)+'</div><div class="miniTileWords"><b>'+title+'</b><small>'+sub+'</small></div>'+icon('arrow',12)+'</div>';
export function designMiniMarkup(){
 start();
 return '<section class="designMiniPreview" aria-label="Live mini theme preview">'+
 '<header class="miniPreviewHeader"><div><strong>Live Preview</strong><small>Inline sample · scrolls with the page</small></div><div class="miniPreviewHeaderActions"><button type="button" data-mini-toggle aria-expanded="'+String(previewExpanded)+'" aria-controls="miniPreviewContents">'+(previewExpanded?'Hide':'Show')+'</button><button type="button" data-mini-reset>Reset view</button></div></header>'+
 '<div id="miniPreviewContents" class="miniPreviewContents" '+(previewExpanded?'':'hidden')+'><div class="miniCompare" role="group" aria-label="Before and After"><button type="button" data-mini-compare="before" aria-pressed="false">Before</button><button type="button" data-mini-compare="after" aria-pressed="true">After</button></div>'+
 '<div class="miniCanvas" data-mini-canvas data-mini-page="home" data-mini-pattern="contours" aria-label="Miniature Arcana homepage showing current appearance">'+
 '<div class="miniHeader"><span>'+icon('message-square')+'</span><b><i class="miniLogo"></i> ARCANA</b><span>'+icon('search')+'</span></div>'+
 '<div class="miniPage miniHome"><div class="miniHero"><div class="miniHeroTitle"><span class="miniHeroIcon">'+icon('flask',22)+'</span><span><small>THE HEART OF ARCANA</small><b>Build Studio</b><em>Gear, runes, pets and skills</em></span></div><div class="miniCTA">'+icon('feature-build-studio',16)+' <strong>Enter Build Studio</strong>'+icon('arrow',14)+'</div></div><div class="miniPageLabel">Quick Access <small>See All →</small></div><div class="miniTiles">'+tile('Wiki','Game systems','book')+tile('Tools','Calculators','calculator')+'</div></div>'+
 '<div class="miniPage miniStudio"><div class="miniHero miniWorkspace"><span class="miniHeroIcon">'+icon('feature-build-studio',28)+'</span><span><small>BUILD STUDIO</small><b>My Build</b><em>Mage · Season 2</em></span></div><div class="miniTabs"><b>Equipment</b><span>Rune Forge</span><span>Skills</span></div><div class="miniGear"><span>'+icon('equipment-head')+'</span><span>'+icon('equipment-chest')+'</span><span>'+icon('equipment-hands')+'</span><span>'+icon('equipment-feet')+'</span><span>'+icon('equipment-neck')+'</span></div><div class="miniCTA miniSecondaryCTA">Save Build</div></div>'+
 '<div class="miniPage miniPathfinder"><div class="miniHero miniWorkspace"><span class="miniHeroIcon">'+icon('layers',26)+'</span><span><small>GEAR PROGRESSION</small><b>Pathfinder</b><em>Every upgrade, one quick look</em></span></div><div class="miniTabs"><b>Upgrade Map</b><span>From → To</span><span>Compare</span></div><div class="miniStages"><span>A1</span><b>A2</b><span>A3</span><span>A4</span></div><div class="miniMaterials"><b>Materials needed</b><small>Gold · Essence · Shards</small><i></i></div></div>'+
 '<div class="miniDock"><span>'+icon('home')+'<small>Home</small></span><span>'+icon('user')+'<small>Profile</small></span><span>'+icon('spark')+'<small>Featured</small></span><span>'+icon('clock')+'<small>Recent</small></span><span>'+icon('menu')+'<small>Options</small></span></div></div>'+
 '<div class="miniViews" role="group" aria-label="Choose example screen"><button data-mini-page="home" type="button" aria-pressed="true">Home</button><button data-mini-page="studio" type="button" aria-pressed="false">Build Studio</button><button data-mini-page="pathfinder" type="button" aria-pressed="false">Pathfinder</button></div>'+
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
  '--mini-button-radius':v.buttonRoundness+'px','--mini-fill':v.buttonFill+'%'
 }))canvas.style.setProperty(name,value);
 canvas.dataset.miniPage=page;canvas.dataset.miniHeroAction=v.heroActionStyle;canvas.dataset.miniHeroSize=v.heroSize;canvas.dataset.miniPattern=v.pattern;canvas.dataset.miniFont=v.fontFamily;canvas.dataset.miniDensity=v.density;canvas.dataset.miniButtons=v.buttonStyle;
 canvas.setAttribute('aria-label',(mode==='before'?'Before editing':'Current')+' '+page+' example');
 const section=canvas.closest('.designMiniPreview');
 for(const b of section.querySelectorAll('[data-mini-compare]'))b.setAttribute('aria-pressed',String(b.dataset.miniCompare===mode));
 for(const b of section.querySelectorAll('button[data-mini-page]'))b.setAttribute('aria-pressed',String(b.dataset.miniPage===page));
 const caption=section.querySelector('[data-mini-caption]');
 if(caption)caption.textContent=mode==='before'?'Before: how it looked when you opened Settings.':'After: the design you are editing.';
}
export function wireDesignMiniPreview(){
 if(typeof document==='undefined')return;
 document.addEventListener('click',e=>{
  const b=e.target.closest('button[data-mini-compare],button[data-mini-page],button[data-mini-reset],button[data-mini-toggle]');
  if(!b||!b.closest('.designMiniPreview')||document.documentElement.dataset.arcanaAdminDesign!=='true')return;
  if(b.hasAttribute('data-mini-toggle')){previewExpanded=!previewExpanded;const section=b.closest('.designMiniPreview');section.querySelector('#miniPreviewContents').hidden=!previewExpanded;b.setAttribute('aria-expanded',String(previewExpanded));b.textContent=previewExpanded?'Hide':'Show';return;}
  if(b.hasAttribute('data-mini-reset')){mode='after';page='home';}
  else if(b.hasAttribute('data-mini-compare'))mode=b.dataset.miniCompare==='before'?'before':'after';
  else if(b.hasAttribute('data-mini-page'))page=['home','studio','pathfinder'].includes(b.dataset.miniPage)?b.dataset.miniPage:'home';
  syncDesignMiniPreview();
 });
 window.addEventListener('arcana:design-change',syncDesignMiniPreview);
}
