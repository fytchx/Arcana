// Admin-only local appearance experimentation. Never alters community theme data.
export const DESIGN_KEY='arcana-admin-design-preview-v1';
export const DEFAULT_DESIGN=Object.freeze({
  main:'#0D1019',card:'#191E2B',action:'#A98BFF',text:'#F5F5FB',
  pattern:'contours',intensity:22,glow:18,edges:42,roundness:13,
  buttonRoundness:11,buttonFill:82,
 secondaryAccent:'#38BDF8',borderColor:'#66708B',mutedText:'#A8B2C4',navBar:'#191E2B',buttonText:'#0A0C14',
 fontFamily:'system',density:'comfortable',buttonStyle:'gradient',
 fontSize:100,cardPadding:14,cardShadow:30,headerOpacity:95,patternScale:100,borderWidth:1,buttonHeight:45,accentBlend:25
});
const numbers={intensity:[0,100],glow:[0,100],edges:[0,100],roundness:[3,28],buttonRoundness:[3,30],buttonFill:[35,100],fontSize:[90,115],cardPadding:[8,22],cardShadow:[0,100],headerOpacity:[65,100],patternScale:[60,180],borderWidth:[0,3],buttonHeight:[40,58],accentBlend:[0,100]};
const colors=new Set(['main','card','action','text','secondaryAccent','borderColor','mutedText','navBar','buttonText']);
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
 silver:{name:'Silver Eclipse',main:'#0E1118',card:'#222936',action:'#CBD5E1',secondaryAccent:'#6FB9FF',text:'#F8FAFC',borderColor:'#617083',mutedText:'#BCC6D4',navBar:'#222936',buttonText:'#0E1118',pattern:'plain'}
});
export const DESIGN_FIELDS=Object.keys(DEFAULT_DESIGN);
export function validateDesignField(key,value){
 if(colors.has(key))return normalizeDesignHex(value);
 if(key==='pattern')return ['contours','rings','stars','plain'].includes(value)?value:null;
 if(key==='fontFamily')return ['system','rounded','serif','mono'].includes(value)?value:null;
 if(key==='density')return ['comfortable','compact','spacious'].includes(value)?value:null;
 if(key==='buttonStyle')return ['gradient','solid','outline'].includes(value)?value:null;
 if(numbers[key]){const n=value===''||value===null||value===undefined?NaN:Number(value);return Number.isFinite(n)?Math.max(numbers[key][0],Math.min(numbers[key][1],Math.round(n))):null}
 return null;
}
export function readDesign(){
 let stored={};try{stored=JSON.parse(localStorage.getItem(DESIGN_KEY)||'{}')||{}}catch{}
 const values={...DEFAULT_DESIGN};
 for(const k of DESIGN_FIELDS){const v=validateDesignField(k,stored[k]);if(v!==null)values[k]=v}
 return values;
}
let priorDesign=null;
export function undoDesign(){
 if(!priorDesign)return false;
 const prior=priorDesign;priorDesign=null;
 try{localStorage.setItem(DESIGN_KEY,JSON.stringify(prior))}catch{return false}
 applyDesign(globalThis.document?.documentElement);
 if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:design-change'));
 return true;
}
export function applyDesignPreset(key){
 const preset=DESIGN_PRESETS[key];if(!preset)return false;
 const {name,...values}=preset;
 const old=readDesign(),next={...old,...values};
 try{localStorage.setItem(DESIGN_KEY,JSON.stringify(next))}catch{return false}
 priorDesign=old;applyDesign(globalThis.document?.documentElement);
 if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:design-change'));
 return true;
}
export function writeDesign(key,value){
 const safe=validateDesignField(key,value);if(safe===null)return false;
 const old=readDesign(),next={...old,[key]:safe};
 try{localStorage.setItem(DESIGN_KEY,JSON.stringify(next))}catch{return false}
 priorDesign=old;
 applyDesign(globalThis.document?.documentElement);if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:design-change'));return true;
}
export function resetDesign(){
 const before=readDesign();
 try{localStorage.removeItem(DESIGN_KEY)}catch{return false}
 priorDesign=before;
 applyDesign(globalThis.document?.documentElement);if(typeof window!=='undefined')window.dispatchEvent(new Event('arcana:design-change'));return true;
}
export function applyDesign(root=globalThis.document?.documentElement){
 if(!root)return;
 const admin=root.dataset.arcanaAdminDesign==='true';
 const values=admin?readDesign():DEFAULT_DESIGN;
 for(const [k,css] of Object.entries({main:'--theme-main',card:'--theme-secondary',action:'--arcana-action-color',text:'--arcana-design-text',secondaryAccent:'--arcana-secondary-accent',borderColor:'--arcana-border-color',mutedText:'--arcana-muted-text',navBar:'--arcana-nav-panel',buttonText:'--arcana-button-text'})){
  if(admin){root.style.setProperty(css,values[k]);if(k==='main')root.style.setProperty('--bg',values[k]);if(k==='card')root.style.setProperty('--panel',values[k]);}
  else if(css.startsWith('--arcana-'))root.style.removeProperty(css);
 }
 root.style.setProperty('--arcana-wave-opacity',String(values.intensity/100));
 root.style.setProperty('--arcana-glow-alpha',String(values.glow/100));
 root.style.setProperty('--arcana-edge-alpha',String(values.edges/100));
 root.style.setProperty('--arcana-card-radius',values.roundness+'px');
 root.style.setProperty('--arcana-button-radius',values.buttonRoundness+'px');
 root.style.setProperty('--arcana-button-fill',values.buttonFill+'%');
 const settings={fontSize:'--arcana-font-scale',cardPadding:'--arcana-card-padding',cardShadow:'--arcana-shadow-depth',headerOpacity:'--arcana-header-opacity',patternScale:'--arcana-pattern-scale',borderWidth:'--arcana-border-width',buttonHeight:'--arcana-button-height',accentBlend:'--arcana-accent-blend'};
 for(const [k,css] of Object.entries(settings)){if(admin)root.style.setProperty(css,k==='headerOpacity'?values[k]+'%':['fontSize','patternScale','cardShadow'].includes(k)?String(values[k]/100):k==='accentBlend'?values[k]+'%':values[k]+'px');else root.style.removeProperty(css);}
 const families={system:'system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',rounded:'ui-rounded,Trebuchet MS,system-ui,sans-serif',serif:'Georgia,Times New Roman,serif',mono:'ui-monospace,SFMono-Regular,Consolas,monospace'};
 if(admin){
  root.style.setProperty('--arcana-design-font-family',families[values.fontFamily]);
  root.style.setProperty('--theme-highlight',values.action);
  root.style.setProperty('--accent',values.action);
  root.dataset.arcanaDesignDensity=values.density;
  root.dataset.arcanaDesignButtonStyle=values.buttonStyle;
 }else{
  root.style.removeProperty('--arcana-design-font-family');
  delete root.dataset.arcanaDesignDensity;
  delete root.dataset.arcanaDesignButtonStyle;
 }
 root.dataset.arcanaDesignPattern=values.pattern;
 if(admin)root.style.setProperty('--text',values.text);
 else root.style.removeProperty('--text');
 return values;
}
