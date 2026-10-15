// Admin-only local appearance experimentation. Never alters community theme data.
export const DESIGN_KEY='arcana-admin-design-preview-v1';
export const DEFAULT_DESIGN=Object.freeze({
  main:'#0D1019',card:'#191E2B',action:'#A98BFF',text:'#F5F5FB',
  pattern:'contours',intensity:22,glow:18,edges:42,roundness:13,
  buttonRoundness:11,buttonFill:82
});
const numbers={intensity:[0,100],glow:[0,100],edges:[0,100],roundness:[3,28],buttonRoundness:[3,30],buttonFill:[35,100]};
const colors=new Set(['main','card','action','text']);
export const DESIGN_FIELDS=Object.keys(DEFAULT_DESIGN);
export function validateDesignField(key,value){
 if(colors.has(key))return /^#[0-9a-fA-F]{6}$/.test(String(value||''))?String(value).toUpperCase():null;
 if(key==='pattern')return ['contours','rings','stars','plain'].includes(value)?value:null;
 if(numbers[key]){const n=Number(value);return Number.isFinite(n)?Math.max(numbers[key][0],Math.min(numbers[key][1],Math.round(n))):null}
 return null;
}
export function readDesign(){
 let stored={};try{stored=JSON.parse(localStorage.getItem(DESIGN_KEY)||'{}')||{}}catch{}
 const values={...DEFAULT_DESIGN};
 for(const k of DESIGN_FIELDS){const v=validateDesignField(k,stored[k]);if(v!==null)values[k]=v}
 return values;
}
export function writeDesign(key,value){
 const safe=validateDesignField(key,value);if(safe===null)return false;
 const next={...readDesign(),[key]:safe};
 try{localStorage.setItem(DESIGN_KEY,JSON.stringify(next))}catch{return false}
 applyDesign(globalThis.document?.documentElement);return true;
}
export function resetDesign(){
 try{localStorage.removeItem(DESIGN_KEY)}catch{return false}
 applyDesign(globalThis.document?.documentElement);return true;
}
export function applyDesign(root=globalThis.document?.documentElement){
 if(!root)return;
 const admin=root.dataset.arcanaAdminDesign==='true';
 const values=admin?readDesign():DEFAULT_DESIGN;
 for(const [k,css] of Object.entries({main:'--theme-main',card:'--theme-secondary',action:'--arcana-action-color',text:'--arcana-design-text'})){
  if(admin){root.style.setProperty(css,values[k]);if(k==='main')root.style.setProperty('--bg',values[k]);if(k==='card')root.style.setProperty('--panel',values[k]);}
  else if(css.startsWith('--arcana-'))root.style.removeProperty(css);
 }
 root.style.setProperty('--arcana-wave-opacity',String(values.intensity/100));
 root.style.setProperty('--arcana-glow-alpha',String(values.glow/100));
 root.style.setProperty('--arcana-edge-alpha',String(values.edges/100));
 root.style.setProperty('--arcana-card-radius',values.roundness+'px');
 root.style.setProperty('--arcana-button-radius',values.buttonRoundness+'px');
 root.style.setProperty('--arcana-button-fill',values.buttonFill+'%');
 root.dataset.arcanaDesignPattern=values.pattern;
 if(admin)root.style.setProperty('--text',values.text);
 else root.style.removeProperty('--text');
 return values;
}
