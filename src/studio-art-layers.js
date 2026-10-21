// Three artwork canvases. A missing override inherits the preceding canvas.
// Pure helpers; the same output is used by the published site and both previews.
import {artUrl,visualArtById} from './visual-art.js';
export const LAYERS=Object.freeze(['background','panels','feature']);
const PREFIX={background:'art',panels:'panelArt',feature:'featureArt'};
const KEY={background:'pattern',panels:'panelPattern',feature:'featurePattern'};
const ALLOWED=new Set(['inherit','none']);
const params=(values,prefix)=>({
 artBase:values[prefix+'Base'],artPrimary:values[prefix+'Primary'],
 artSecondary:values[prefix+'Secondary'],artGlow:values[prefix+'Glow'],
 artStrength:values.artStrength,artDetail:values.artDetail,artWeight:values.artWeight,
 artZoom:values.artZoom,artPositionX:values.artPositionX,artPositionY:values.artPositionY
});
export function resolveArtLayers(values){
 const result={};
 for(const layer of LAYERS){
  const key=KEY[layer],pref=PREFIX[layer],chosen=values[key];
  if(layer==='background'){
   const art=visualArtById(chosen);
   result[layer]=art?{id:chosen,colors:params(values,pref)}:null;
  }else if(chosen==='none')result[layer]=null;
  else if(chosen==='inherit'||!chosen){
   // Imported themes keep their legacy page-only, cards-only and all behavior.
   if(layer==='panels'&&values.patternTarget==='background')result[layer]=null;
   else if(layer==='feature'&&values.patternTarget==='background'&&values.panelPattern==='inherit')result[layer]=null;
   else result[layer==='panels'?'panels':'feature']=result[layer==='panels'?'background':'panels'];
  }else{
   const art=visualArtById(chosen);
   result[layer]=art?{id:chosen,colors:params(values,pref)}:null;
  }
 }
 return result;
}
export function layerArtUrl(values,layer){
 const r=resolveArtLayers(values)[layer];return r?artUrl(r.id,r.colors):'none';
}
export function paintArtLayers(root,values){
 if(!root?.style)return;
 const resolved=resolveArtLayers(values);
 for(const [layer,variable] of [['background','--arcana-art-background'],['panels','--arcana-art-panels'],['feature','--arcana-art-feature']]){
  const part=resolved[layer];root.style.setProperty(variable,part?artUrl(part.id,part.colors):'none');
 }
 const enabled=Boolean(resolved.background||resolved.panels||resolved.feature);
 root.dataset.arcanaArtLayered=String(enabled);
}
export function syncLayerArtSamples(doc=globalThis.document,values={}){
 if(!doc?.querySelectorAll)return;
 const resolved=resolveArtLayers(values);
 for(const node of doc.querySelectorAll('[data-art-layer-preview]')){
  const part=resolved[node.dataset.artLayerPreview];
  node.style.backgroundImage=part?artUrl(part.id,part.colors):'none';
  node.dataset.empty=String(!part);
 }
}