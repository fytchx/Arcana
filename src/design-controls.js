import {THEME_PATTERN_IDS} from './theme-patterns.js';
import {HERO_CTA_STYLE_IDS} from './hero-cta-styles.js';
import {SIGNATURE_PRESETS} from './signature-collection.js';
import {PSYCHEDELIC_PRESETS} from './psychedelic-presets.js';
import {PSYCHEDELIC_DEFAULTS,applyPsychedelicTexture} from './psychedelic-patterns.js';
import {VISUAL_ART_IDS,visualArtById,applyVisualArt} from './visual-art.js';
import {STUDIO_V2_PRESETS} from './studio-v2-presets.js';
// Admin-only local appearance experimentation. Never alters community theme data.
export const DESIGN_KEY='arcana-admin-design-preview-v1';
export const DEFAULT_DESIGN=Object.freeze({
  main:'#0D1019',card:'#191E2B',iconBox:'#292439',iconGlyph:'#BBA4FF',action:'#A98BFF',text:'#F5F5FB',artBase:'#100B2E',artPrimary:'#ED55B8',artSecondary:'#6552F5',artGlow:'#9AC7FF',artStrength:100,artDetail:100,artWeight:100,artZoom:100,artPositionX:50,artPositionY:50,panelOpacity:88,
  pattern:'contours',intensity:22,glow:18,edges:42,roundness:13,
  buttonRoundness:11,buttonFill:82,
 secondaryAccent:'#38BDF8',borderColor:'#66708B',mutedText:'#A8B2C4',navBar:'#191E2B',buttonText:'#0A0C14',
 fontFamily:'system',density:'comfortable',buttonStyle:'gradient',heroActionStyle:'integrated',heroSize:'balanced',
 heroActionWidth:100,heroActionAlign:'center',heroActionHeight:45,heroActionGlow:10,heroActionBorder:1,heroActionIcon:'show',heroActionSubtitle:'auto',
 heroCardStyle:'blended',heroCardEmblem:'subtle',
 patternTarget:'all',
 iconMode:'two-tone',fontSize:100,cardPadding:14,cardShadow:30,headerOpacity:95,patternScale:100,borderWidth:1,buttonHeight:45,accentBlend:25,aura:50,sheen:50,detail:63,...PSYCHEDELIC_DEFAULTS
});
const numbers={artStrength:[15,100],artDetail:[25,100],artWeight:[60,180],artZoom:[75,155],artPositionX:[0,100],artPositionY:[0,100],panelOpacity:[60,100],intensity:[0,100],glow:[0,100],edges:[0,100],roundness:[3,28],buttonRoundness:[3,30],buttonFill:[35,100],fontSize:[90,115],cardPadding:[8,22],cardShadow:[0,100],headerOpacity:[65,100],patternScale:[60,180],borderWidth:[0,3],buttonHeight:[40,58],accentBlend:[0,100],heroActionWidth:[65,100],heroActionHeight:[44,70],heroActionGlow:[0,100],heroActionBorder:[0,3],aura:[0,100],sheen:[0,100],detail:[0,100],psyStroke:[0,100]};
const colors=new Set(['main','card','iconBox','iconGlyph','action','text','secondaryAccent','borderColor','mutedText','navBar','buttonText','psyBackground','psyPrimary','psySecondary','psyAccent','psyOutline','artBase','artPrimary','artSecondary','artGlow']);
// Accept pasted #A78BFA or A78BFA, never partial values or CSS strings.
export function normalizeDesignHex(value){
 const raw=String(value||'').trim();
 const prefixed=raw.startsWith('#')?raw:'#'+raw;
 return /^#[0-9a-fA-F]{6}$/.test(prefixed)?prefixed.toUpperCase():null;
}
export const DESIGN_PRESETS=Object.freeze({
 violet:{name:'Arcane Violet',main:'#0B0916',card:'#1C1630',action:'#A78BFA',secondaryAccent:'#38BDF8',text:'#F5F0FF',borderColor:'#655385',mutedText:'#BDB4D1',navBar:'#1C1630',buttonText:'#0B0916',pattern:'contours'},
 emerald:{name:'Emerald Abyss',main:'#071510',card:'#132820',action:'#34E8A1',secondaryAccent:'#C4F56D',text:'#E8FFF5',borderColor:'#376B55',mutedText:'#A8CCBC',navBar:'#132820',buttonText:'#071510',pattern:'rings'},
 sapphire:{name:'Cosmic Sapphire',main:'#080F20',card:'#152642',action:'#498CFF',secondaryAccent:'#B794FF',text:'#EDF4FF',borderColor:'#41608B',mutedText:'#AABBD5',navBar:'#152642',buttonText:'#080F20',pattern:'stars'},
 ember:{name:'Solar Ember',main:'#180E0B',card:'#302019',action:'#FF914D',secondaryAccent:'#F5C451',text:'#FFF3E8',borderColor:'#895439',mutedText:'#D2B4A4',navBar:'#302019',buttonText:'#180E0B',pattern:'rings'},
 rose:{name:'Mystic Rose',main:'#170B19',card:'#301B32',action:'#F472D0',secondaryAccent:'#A78BFA',text:'#FFF0FA',borderColor:'#814D80',mutedText:'#D5B4D0',navBar:'#301B32',buttonText:'#170B19',pattern:'contours'},
 silver:{name:'Silver Eclipse',main:'#0E1118',card:'#222936',action:'#CBD5E1',secondaryAccent:'#6FB9FF',text:'#F8FAFC',borderColor:'#617083',mutedText:'#BCC6D4',navBar:'#222936',buttonText:'#0E1118',pattern:'plain'},
 cobalt:{name:'Cobalt Citadel',main:'#081322',card:'#172B44',action:'#60A5FA',secondaryAccent:'#22D3EE',text:'#EFF7FF',borderColor:'#44678D',mutedText:'#ACBED5',navBar:'#102139',buttonText:'#061625',pattern:'hex',intensity:20,roundness:10,buttonStyle:'solid'},
 obsidian:{name:'Obsidian Forge',main:'#0A0C10',card:'#171A20',action:'#EABF7A',secondaryAccent:'#D18C69',text:'#F5EFE8',borderColor:'#53483F',mutedText:'#B7A99C',navBar:'#121419',buttonText:'#18120C',pattern:'grain',intensity:13,glow:7,roundness:8},
 frost:{name:'Frostbound',main:'#08171E',card:'#18313B',action:'#73E0FF',secondaryAccent:'#B7F7F3',text:'#EAFBFF',borderColor:'#41737E',mutedText:'#A6CBD3',navBar:'#142833',buttonText:'#07171C',pattern:'crystal',intensity:22},
 twilight:{name:'Twilight Archive',main:'#100E25',card:'#242040',action:'#D4A7FF',secondaryAccent:'#FFACD6',text:'#F7EEFF',borderColor:'#675680',mutedText:'#C0B2D5',navBar:'#1A1733',buttonText:'#170E21',pattern:'nebula',intensity:28,heroSize:'showcase'},
 woodland:{name:'Elderwood',main:'#0D1512',card:'#1B2B23',action:'#A3C77C',secondaryAccent:'#E5C68A',text:'#ECF4E9',borderColor:'#526953',mutedText:'#B6C4AD',navBar:'#17241D',buttonText:'#0E180E',pattern:'weave',intensity:17},
 crimson:{name:'Crimson Ritual',main:'#180C12',card:'#331C28',action:'#FF6382',secondaryAccent:'#F5A862',text:'#FFF1F3',borderColor:'#8B4B61',mutedText:'#D0A9B5',navBar:'#29141E',buttonText:'#24070E',pattern:'runes',intensity:23},
 midnight:{name:'Midnight Signal',main:'#080D14',card:'#13212D',action:'#45F4DC',secondaryAccent:'#8AB8FF',text:'#E9FFFC',borderColor:'#386D70',mutedText:'#A3CBD2',navBar:'#101B27',buttonText:'#071717',pattern:'circuit',intensity:20,buttonStyle:'outline'},
 parchment:{name:'Ancient Parchment',main:'#17130F',card:'#302820',action:'#E0BC78',secondaryAccent:'#BA9A6B',text:'#FFF0D8',borderColor:'#675944',mutedText:'#CCB89A',navBar:'#241C16',buttonText:'#24170B',pattern:'topography',intensity:20,fontFamily:'serif'},
 quartz:{name:'Prismatic Quartz',main:'#10111E',card:'#25243A',action:'#F2ABFF',secondaryAccent:'#7DE2FF',text:'#F9F4FF',borderColor:'#74628C',mutedText:'#C7B9D7',navBar:'#1B1A2E',buttonText:'#160D1C',pattern:'facets',intensity:18,roundness:19},
 steel:{name:'Steel Tactician',main:'#111720',card:'#27303E',action:'#98B7D8',secondaryAccent:'#E2BC7A',text:'#F3F6FA',borderColor:'#657384',mutedText:'#B8C3D1',navBar:'#1B2533',buttonText:'#121820',pattern:'scanlines',intensity:12,density:'compact',roundness:7},
 gilded:{name:'Gilded Night',main:'#111015',card:'#26202A',action:'#F5C866',secondaryAccent:'#D0A4ED',text:'#FFF9ED',borderColor:'#76634E',mutedText:'#C8BCAF',navBar:'#201C23',buttonText:'#1D1509',pattern:'honeycomb',intensity:16,heroActionStyle:'spotlight'},
 ink:{name:'Ink & Starlight',main:'#0B0B13',card:'#1C1C2A',action:'#F4F4F9',secondaryAccent:'#998DFF',text:'#F3F3F8',borderColor:'#545467',mutedText:'#B4B4C7',navBar:'#171722',buttonText:'#101018',pattern:'stars',intensity:18,buttonStyle:'outline',glow:8},
 ...SIGNATURE_PRESETS,
  ...PSYCHEDELIC_PRESETS,
  ...STUDIO_V2_PRESETS
});
export const DESIGN_FIELDS=Object.keys(DEFAULT_DESIGN);
export function validateDesignField(key,value){
 if(colors.has(key))return normalizeDesignHex(value);
 if(key==='pattern')return THEME_PATTERN_IDS.includes(value)?value:null;
 if(key==='psyPaletteMode')return ['custom','theme'].includes(value)?value:null;
 if(key==='iconMode')return ['two-tone','neutral','accent','muted'].includes(value)?value:null;
 if(key==='fontFamily')return ['system','rounded','serif','mono'].includes(value)?value:null;
 if(key==='density')return ['comfortable','compact','spacious'].includes(value)?value:null;
 if(key==='buttonStyle')return ['gradient','solid','outline'].includes(value)?value:null;
 if(key==='heroActionStyle')return HERO_CTA_STYLE_IDS.includes(value)?value:null;
 if(key==='heroActionAlign')return ['start','center','end'].includes(value)?value:null;
 if(key==='heroCardStyle')return ['blended','flat','frameless','etched','glass','raised','accent-edge','metallic','minimal'].includes(value)?value:null;
 if(key==='heroCardEmblem')return ['subtle','hidden','prominent'].includes(value)?value:null;
 if(key==='heroActionIcon')return ['show','hide','arrow-only'].includes(value)?value:null;
 if(key==='heroActionSubtitle')return ['auto','show','hide'].includes(value)?value:null;
 if(key==='patternTarget')return ['all','cards','background'].includes(value)?value:null;
 if(key==='heroSize')return ['compact','balanced','showcase'].includes(value)?value:null;
 if(numbers[key]){const n=value===''||value===null||value===undefined?NaN:Number(value);return Number.isFinite(n)?Math.max(numbers[key][0],Math.min(numbers[key][1],Math.round(n))):null}
 return null;
}
let publishedDesign=null;
let previewEnabled=false;
export function setPublishedDesign(value){
 publishedDesign=value&&typeof value==='object'?Object.fromEntries(DESIGN_FIELDS.map(key=>[key,validateDesignField(key,value[key])??DEFAULT_DESIGN[key]])):null;
 applyDesign(globalThis.document?.documentElement);
}
export const currentPublishedDesign=()=>publishedDesign?{...publishedDesign}:null;
export function setDesignPreview(enabled){previewEnabled=enabled===true;applyDesign(globalThis.document?.documentElement)}
export function designPreviewActive(){return previewEnabled}
export function replaceDesignDraft(next){
 if(!next||typeof next!=='object')return false;
 const clean={...DEFAULT_DESIGN};for(const key of DESIGN_FIELDS){const v=validateDesignField(key,next[key]);if(v!==null)clean[key]=v;}
 try{localStorage.setItem(DESIGN_KEY,JSON.stringify(clean))}catch{return false}
 applyDesign(globalThis.document?.documentElement);return true;
}
export function readDesign(){
 let stored={};try{stored=JSON.parse(localStorage.getItem(DESIGN_KEY)||'{}')||{}}catch{}
 const values={...DEFAULT_DESIGN,...publishedDesign};
 for(const k of DESIGN_FIELDS){const v=validateDesignField(k,stored[k]);if(v!==null)values[k]=v}
 return values;
}
let priorDesign=null,priorEditKey='',lastEditAt=0;
export function undoDesign(){
 if(!priorDesign)return false;
 const prior=priorDesign;priorDesign=null;priorEditKey='';lastEditAt=0;
 try{localStorage.setItem(DESIGN_KEY,JSON.stringify(prior))}catch{return false}
 applyDesign(globalThis.document?.documentElement);
 if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:design-change'));
 return true;
}
export function applyDesignPreset(key){
 const preset=DESIGN_PRESETS[key];if(!preset)return false;
 const {name,tagline,collection,...values}=preset;
 const old=readDesign(),next={...old,...values,iconBox:values.card||old.iconBox,iconGlyph:values.action||old.iconGlyph};
 try{localStorage.setItem(DESIGN_KEY,JSON.stringify(next))}catch{return false}
 priorDesign=old;priorEditKey='preset';lastEditAt=0;applyDesign(globalThis.document?.documentElement);
 if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:design-change'));
 return true;
}
// Select artwork and its artist-chosen starting colors as a single undoable edit.
export function applyVisualPreset(id){
 const art=visualArtById(id);if(!art||!VISUAL_ART_IDS.includes(id))return false;
 const prior=readDesign(),next={...prior,pattern:id,artBase:art.colors[0],artPrimary:art.colors[1],artSecondary:art.colors[2],artGlow:art.colors[3]};
 try{localStorage.setItem(DESIGN_KEY,JSON.stringify(next))}catch{return false}
 priorDesign=prior;priorEditKey='visual';lastEditAt=0;
 applyDesign(globalThis.document?.documentElement);
 if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:design-change'));
 return true;
}
export function writeDesign(key,value){
 const safe=validateDesignField(key,value);if(safe===null)return false;
 const old=readDesign(),next={...old,[key]:safe};
 try{localStorage.setItem(DESIGN_KEY,JSON.stringify(next))}catch{return false}
 if(priorEditKey!==key||Date.now()-lastEditAt>850)priorDesign=old;
 priorEditKey=key;lastEditAt=Date.now();
 applyDesign(globalThis.document?.documentElement);if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:design-change'));return true;
}
export function resetDesign(){
 const before=readDesign();
 try{localStorage.removeItem(DESIGN_KEY)}catch{return false}
 priorDesign=before;priorEditKey='reset';lastEditAt=0;
 applyDesign(globalThis.document?.documentElement);if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:design-change'));return true;
}
export function applyDesign(root=globalThis.document?.documentElement){
 if(!root)return;
 const admin=(root.dataset.arcanaAdminDesign==='true'||root.dataset.arcanaThemeTryOn==='true')&&previewEnabled;
 const published=publishedDesign!==null;
 const active=admin||published;
 root.dataset.arcanaDesignActive=String(active);
 const values=admin?readDesign():publishedDesign||DEFAULT_DESIGN;
 for(const [k,css] of Object.entries({main:'--theme-main',card:'--theme-secondary',action:'--arcana-action-color',text:'--arcana-design-text',secondaryAccent:'--arcana-secondary-accent',borderColor:'--arcana-border-color',mutedText:'--arcana-muted-text',navBar:'--arcana-nav-panel',buttonText:'--arcana-button-text'})){
  if(active){root.style.setProperty(css,values[k]);if(k==='main')root.style.setProperty('--bg',values[k]);if(k==='card')root.style.setProperty('--panel',values[k]);}
  else if(css.startsWith('--arcana-'))root.style.removeProperty(css);
 }
 if(active){root.style.setProperty('--arcana-atlas-panel',values.card);root.style.setProperty('--arcana-atlas-icon-box',values.iconBox);root.style.setProperty('--arcana-atlas-icon',values.iconGlyph);}
 else{root.style.removeProperty('--arcana-atlas-panel');root.style.removeProperty('--arcana-atlas-icon-box');root.style.removeProperty('--arcana-atlas-icon');}
 applyPsychedelicTexture(root,values);
 applyVisualArt(root,values);
  if(active){root.style.setProperty('--arcana-panel-opacity',String(values.panelOpacity/100));root.style.setProperty('--arcana-panel-opacity-percent',values.panelOpacity+'%');}
  else{root.style.removeProperty('--arcana-panel-opacity');root.style.removeProperty('--arcana-panel-opacity-percent');}
  root.style.setProperty('--arcana-wave-opacity',String(values.intensity/100));
 root.style.setProperty('--arcana-pattern-alpha',Math.round(values.intensity*.16)+'%');
 root.style.setProperty('--arcana-premium-pattern-alpha',Math.round(values.intensity*.35)+'%');
 root.style.setProperty('--arcana-glow-alpha',String(values.glow/100));
  root.style.setProperty('--arcana-signature-aura',String(values.aura/100));
  root.style.setProperty('--arcana-signature-sheen',String(values.sheen/100));
  root.style.setProperty('--arcana-signature-detail',String(values.detail/100));
 root.style.setProperty('--arcana-edge-alpha',String(values.edges/100));
 root.style.setProperty('--arcana-card-radius',values.roundness+'px');
 root.style.setProperty('--arcana-button-radius',values.buttonRoundness+'px');
 root.style.setProperty('--arcana-button-fill',values.buttonFill+'%');
 root.style.setProperty('--arcana-hero-cta-width',values.heroActionWidth+'%');
 root.style.setProperty('--arcana-hero-cta-height',values.heroActionHeight+'px');
 root.style.setProperty('--arcana-hero-cta-glow',String(values.heroActionGlow/100));
 root.style.setProperty('--arcana-hero-cta-border',values.heroActionBorder+'px');
 const settings={fontSize:'--arcana-font-scale',cardPadding:'--arcana-card-padding',cardShadow:'--arcana-shadow-depth',headerOpacity:'--arcana-header-opacity',patternScale:'--arcana-pattern-scale',borderWidth:'--arcana-border-width',buttonHeight:'--arcana-button-height',accentBlend:'--arcana-accent-blend'};
 for(const [k,css] of Object.entries(settings)){if(active)root.style.setProperty(css,k==='headerOpacity'?values[k]+'%':['fontSize','patternScale','cardShadow'].includes(k)?String(values[k]/100):k==='accentBlend'?values[k]+'%':values[k]+'px');else root.style.removeProperty(css);}
 const families={system:'system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',rounded:'ui-rounded,Trebuchet MS,system-ui,sans-serif',serif:'Georgia,Times New Roman,serif',mono:'ui-monospace,SFMono-Regular,Consolas,monospace'};
 if(active){
  root.style.setProperty('--arcana-design-font-family',families[values.fontFamily]);
  root.style.setProperty('--theme-highlight',values.action);
  root.style.setProperty('--accent',values.action);
  root.dataset.arcanaDesignDensity=values.density;
  root.dataset.arcanaDesignButtonStyle=values.buttonStyle;
  root.dataset.arcanaIconMode=values.iconMode;
  root.style.setProperty('--arcana-icon-color',values.action);
 }else{
  root.style.removeProperty('--arcana-design-font-family');
  delete root.dataset.arcanaDesignDensity;
  delete root.dataset.arcanaDesignButtonStyle;
 }
 if(active){root.style.setProperty('--bg',values.main);root.style.setProperty('--panel',values.card);root.style.setProperty('--accent',values.action);root.style.setProperty('--line',values.borderColor);root.style.setProperty('--panel2',values.navBar);root.style.setProperty('--accentTint',`color-mix(in srgb, ${values.action} 13%, transparent)`);root.style.setProperty('--radius',values.roundness+'px');}
 root.dataset.arcanaDesignPattern=values.pattern;
 root.dataset.arcanaPatternTarget=values.patternTarget;
 root.dataset.arcanaHeroCardStyle=values.heroCardStyle;
 root.dataset.arcanaHeroCardEmblem=values.heroCardEmblem;
 root.dataset.arcanaHeroActionAlign=values.heroActionAlign;
 root.dataset.arcanaHeroActionIcon=values.heroActionIcon;
 root.dataset.arcanaHeroActionSubtitle=values.heroActionSubtitle;
 root.dataset.arcanaHeroActionStyle=values.heroActionStyle;
 root.dataset.arcanaHeroSize=values.heroSize;
 if(active)root.style.setProperty('--text',values.text);
 else root.style.removeProperty('--text');
 return values;
}
