/* Desktop-only experimental design controls. Never submitted to the site publish API. */
export const MAX_STORAGE='arcana-design-max-preview-v2';
const range=(key,label,min,max,value,unit='%')=>({key,label,type:'range',min,max,default:value,unit});
const color=(key,label,value)=>({key,label,type:'color',default:value});
const choice=(key,label,values,value)=>({key,label,type:'select',options:values,default:value});
export const MAX_GROUPS=Object.freeze([
 {id:'atmosphere',name:'Atmosphere',subtitle:'Studio-grade backgrounds, lighting and color grading',fields:[
 choice('bgStyle','Background composition',[['none','Solid'],['radial','Ambient bloom'],['linear','Directional gradient'],['conic','Prismatic wash'],['dual','Double exposure']],'radial'),
 color('bgColor','Gradient color','#4C2D83'),
 range('bgStrength','Gradient strength',0,100,24),
 range('bgAngle','Gradient direction',0,360,130,'°'),
 color('glowColor','Primary glow','#995DFF'),
 range('glowStrength','Primary glow strength',0,100,23),
 range('glowX','Primary glow X',0,100,80),
 range('glowY','Primary glow Y',0,100,3),
 range('glowSize','Primary glow radius',15,100,60),
 color('glow2Color','Secondary glow','#187DB0'),
 range('glow2Strength','Secondary glow strength',0,100,12),
 range('glow2X','Secondary glow X',0,100,5),
 range('glow2Y','Secondary glow Y',0,100,95),
 range('vignette','Edge vignette',0,100,15),
 range('pageSaturation','Content saturation',50,160,100),
 range('pageContrast','Content contrast',75,140,100),
 range('pageBrightness','Content brightness',75,135,100)]},
 {id:'surfaces',name:'Surfaces',subtitle:'Panels, materials, boundaries and elevation',fields:[
 choice('cardMode','Panel material',[['inherit','Follow Arcana'],['solid','Solid'],['glass','Frosted glass'],['flat','Flat'],['gradient','Gradient'],['textured','Textured']],'inherit'),
 color('cardTint','Card tint','#222139'),
 range('cardOpacity','Card tint opacity',0,100,84),
 color('panelBorder','Panel border color','#8B72BA'),
 range('panelBorderAlpha','Border visibility',0,100,38),
 choice('borderStyle','Border stroke',[['solid','Solid'],['dashed','Dashed'],['double','Double']],'solid'),
 range('panelBorderWidth','Border thickness',0,5,1,' px'),
 range('panelRadius','Card radius',0,38,16,' px'),
 range('panelBlur','Frosted blur',0,20,0,' px'),
 range('panelShadow','Shadow opacity',0,90,32),
 range('panelShadowBlur','Shadow softness',0,70,28,' px'),
 range('panelShadowY','Shadow height',0,35,9,' px'),
 range('frameOutline','Feature outline',0,5,0,' px'),
 color('frameColor','Feature outline color','#A78BFA')]},
 {id:'buttons',name:'Buttons',subtitle:'Shapes, physical depth and interaction',fields:[
 choice('buttonShape','Control silhouette',[['rounded','Soft rounded'],['sharp','Square'],['capsule','Capsule']],'rounded'),
 range('ctaRadius','Feature button corners',0,35,11,' px'),
 range('ctaInset','Feature button inset',0,30,0,' px'),
 range('ctaShadow','Feature shadow opacity',0,90,38),
 range('ctaShadowBlur','Feature shadow softness',0,60,22,' px'),
 range('ctaShadowY','Feature shadow height',0,25,7,' px'),
 range('buttonShadow','Standard button shadow',0,90,28),
 range('buttonShadowBlur','Standard button blur',0,40,8,' px'),
 range('buttonShadowY','Standard button shadow Y',0,18,2,' px')]},
 {id:'typography',name:'Typography',subtitle:'Weight, rhythm, tracking and readable hierarchy',fields:[
 choice('headingStyle','Heading treatment',[['normal','Normal'],['uppercase','Uppercase'],['smallcaps','Small caps']],'normal'),
 range('titleTrack','Heading tracking',-8,12,-2,' /100em'),
 range('bodyTrack','Body tracking',-3,8,0,' /100em'),
 range('titleWeight','Heading weight',400,900,800,''),
 range('bodyWeight','Body weight',300,700,400,''),
 range('lineHeight','Reading line height',110,200,150,'%'),
 color('textGlowColor','Heading glow color','#A78BFA'),
 range('textGlow','Heading glow intensity',0,100,0),
 range('iconScale','Arcana icon scale',70,145,100,'%')]},
 {id:'layout',name:'Layout',subtitle:'Page proportions, density, grid behavior and spacing',fields:[
 range('pageWidth','Maximum page width',740,1800,1100,' px'),
 range('pagePadding','Page inner padding',0,55,22,' px'),
 range('sectionGap','Section separation',0,44,14,' px'),
 choice('quickColumns','Quick Access columns',[['2','Two columns'],['3','Three columns']],'2'),
 range('gridGap','Quick Access gap',0,32,12,' px'),
 range('tileHeight','Minimum quick card height',70,260,118,' px'),
 range('quickPadding','Quick card padding',4,35,14,' px'),
 range('featureHeight','Feature card minimum height',150,470,210,' px'),
 range('featurePadding','Feature card padding',5,55,18,' px')]},
 {id:'navigation',name:'Navigation',subtitle:'Top chrome, blur, translucency and frame',fields:[
 range('navHeight','Header minimum height',48,110,68,' px'),
 range('navOpacity','Header opacity',45,100,96),
 range('navBlur','Header background blur',0,24,0,' px'),
 range('navRadius','Dock corner radius',0,35,12,' px'),
 range('navStroke','Header border thickness',0,4,1,' px')]},
 {id:'motion',name:'Motion & Performance',subtitle:'Animation discipline and GPU costs',fields:[
 choice('motionMode','Decorative motion',[['on','Enabled'],['off','Off']],'on'),
 range('hoverDuration','Transition duration',0,650,180,' ms'),
 range('hoverLift','Hover lift',0,18,3,' px'),
 range('hoverScale','Hover enlargement',100,106,101,'%'),
 choice('quality','Rendering profile',[['balanced','Balanced'],['performance','Performance']],'balanced')]}
]);
export const MAX_FIELDS=Object.freeze(MAX_GROUPS.flatMap(g=>g.fields));
export const MAX_DEFAULTS=Object.freeze(Object.fromEntries(MAX_FIELDS.map(f=>[f.key,f.default])));
const fields=new Map(MAX_FIELDS.map(f=>[f.key,f]));
export function cleanMaxValue(key,input){
 const f=fields.get(key);if(!f)return null;
 if(f.type==='color')return typeof input==='string'&&/^#[0-9a-fA-F]{6}$/.test(input)?input.toUpperCase():null;
 if(f.type==='select')return f.options.some(x=>x[0]===String(input))?String(input):null;
 const n=Number(input);return input!==''&&Number.isFinite(n)?Math.min(f.max,Math.max(f.min,Math.round(n))):null;
}
export function normalizeMax(raw){
 const result={...MAX_DEFAULTS};
 if(raw&&typeof raw==='object'&&!Array.isArray(raw))
  for(const f of MAX_FIELDS){const v=cleanMaxValue(f.key,raw[f.key]);if(v!==null)result[f.key]=v;}
 return result;
}
export function readMax(){try{return normalizeMax(JSON.parse(localStorage.getItem(MAX_STORAGE)||'{}'))}catch{return {...MAX_DEFAULTS}}}
export function writeMax(key,value){const clean=cleanMaxValue(key,value);if(clean===null)return false;const current=readMax();current[key]=clean;return saveMax(current)}
export function saveMax(raw){try{localStorage.setItem(MAX_STORAGE,JSON.stringify(normalizeMax(raw)));return true}catch{return false}}
export function resetMax(){return saveMax(MAX_DEFAULTS)}
const mix=(hex,n)=>'color-mix(in srgb,'+hex+' '+n+'%,transparent)';
export function applyMax(doc,raw){
 if(!doc?.documentElement)return false;
 const v=normalizeMax(raw),root=doc.documentElement;
 root.dataset.designMax='true';
 root.dataset.maxButtons=v.buttonShape;root.dataset.maxHeading=v.headingStyle;
 root.dataset.maxBorder=v.borderStyle;root.dataset.maxCard=v.cardMode;
 root.dataset.maxMotion=v.motionMode;root.dataset.maxQuality=v.quality;
 const core={};
 const set=(key,value)=>root.style.setProperty('--max-'+key,value);
 const setPx=(key,value)=>set(key,value+'px');
 const setPct=(key,value)=>set(key,value+'%');
 const foreground=doc.defaultView?.getComputedStyle(root).getPropertyValue('--theme-main').trim()||'#0D1019';
 const paint=v.bgStyle==='none'?'none':v.bgStyle==='linear'?'linear-gradient('+v.bgAngle+'deg,'+mix(v.bgColor,v.bgStrength)+',transparent 82%)':
 v.bgStyle==='conic'?'conic-gradient(from '+v.bgAngle+'deg at 65% 30%,transparent,'+mix(v.bgColor,v.bgStrength)+',transparent 80%)':
 v.bgStyle==='dual'?'linear-gradient('+v.bgAngle+'deg,'+mix(v.bgColor,v.bgStrength)+',transparent 85%),radial-gradient(ellipse at 5% 90%,'+mix(v.glow2Color,v.glow2Strength)+',transparent 65%)':
 'radial-gradient(ellipse at 62% 10%,'+mix(v.bgColor,v.bgStrength)+',transparent 73%)';
 const halos='radial-gradient(ellipse '+v.glowSize+'% '+v.glowSize+'% at '+v.glowX+'% '+v.glowY+'%,'+mix(v.glowColor,v.glowStrength)+',transparent 100%),radial-gradient(ellipse at '+v.glow2X+'% '+v.glow2Y+'%,'+mix(v.glow2Color,v.glow2Strength)+',transparent 70%)';
 set('bg-gradient',paint);set('glow-gradient',halos);
 set('vignette','radial-gradient(ellipse at 50% 45%,transparent '+(95-v.vignette*.35)+'%,rgba(0,0,0,'+(v.vignette/160).toFixed(3)+') 100%)');
 set('page-saturate',(v.pageSaturation/100).toFixed(2));set('page-contrast',(v.pageContrast/100).toFixed(2));set('page-brightness',(v.pageBrightness/100).toFixed(2));
 set('surface',mix(v.cardTint,v.cardOpacity));set('border',v.panelBorder);
 setPct('card-border-alpha',v.panelBorderAlpha);setPx('panel-border',v.panelBorderWidth);setPx('panel-radius',v.panelRadius);
 setPx('card-blur',v.panelBlur);
 set('card-shadow','0 '+v.panelShadowY+'px '+v.panelShadowBlur+'px rgba(0,0,0,'+(v.panelShadow/100).toFixed(2)+')');
 set('feature-shadow','0 '+Math.max(0,v.panelShadowY+3)+'px '+Math.max(0,v.panelShadowBlur+8)+'px rgba(0,0,0,'+(v.panelShadow/100).toFixed(2)+')');
 setPx('frame-outline',v.frameOutline);set('frame-outline-color',v.frameColor);
 setPx('cta-radius',v.ctaRadius);setPx('cta-inset',v.ctaInset);
 set('cta-shadow','0 '+v.ctaShadowY+'px '+v.ctaShadowBlur+'px rgba(0,0,0,'+(v.ctaShadow/100).toFixed(2)+')');
 set('button-shadow','0 '+v.buttonShadowY+'px '+v.buttonShadowBlur+'px rgba(0,0,0,'+(v.buttonShadow/100).toFixed(2)+')');
 set('title-track',(v.titleTrack/100).toFixed(3)+'em');set('body-track',(v.bodyTrack/100).toFixed(3)+'em');
 set('title-weight',String(v.titleWeight));set('body-weight',String(v.bodyWeight));set('line-height',(v.lineHeight/100).toFixed(2));
 set('text-glow','0 0 '+Math.round(v.textGlow*.18)+'px '+mix(v.textGlowColor,v.textGlow));
 set('icon-scale',(v.iconScale/100).toFixed(2));
 setPx('page-width',v.pageWidth);setPx('page-padding',v.pagePadding);setPx('card-gap',v.sectionGap);
 set('quick-columns',v.quickColumns);setPx('grid-gap',v.gridGap);setPx('tile-height',v.tileHeight);
 setPx('quick-pad',v.quickPadding);setPx('feature-height',v.featureHeight);setPx('feature-pad',v.featurePadding);
 setPx('nav-height',v.navHeight);setPct('nav-alpha',v.navOpacity);setPx('nav-blur',v.navBlur);
 setPx('nav-radius',v.navRadius);setPx('nav-stroke',v.navStroke);
 setPx('hover-duration',v.hoverDuration);setPx('hover-raise',v.hoverLift);set('hover-scale',(v.hoverScale/100).toFixed(2));
 return true;
}
