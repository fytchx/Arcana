// Original, mathematical 360x360 repeating SVG motifs. Flat fills are safe recolor slots.
// Every motif that crosses a tile edge is drawn again on its neighboring tiles.
export const PSYCHEDELIC_IDS=Object.freeze(['groove-melt','orbit-jelly','doodle-rift','prism-puddle']);
export const PSYCHEDELIC_DEFAULTS=Object.freeze({
 psyPaletteMode:'custom',psyBackground:'#16152C',psyPrimary:'#FF43A0',psySecondary:'#20CEE8',
 psyAccent:'#FDC54C',psyOutline:'#101226',psyStroke:55
});
const W=360;
const hx=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(String(v||''))?String(v).toUpperCase():fallback;
const rnd=n=>Math.round(n*100)/100;
const points=(cx,cy,r,seed=0,count=72)=>{
 const result=[];
 for(let i=0;i<=count;i++){const t=Math.PI*2*i/count,rr=r*(1+.12*Math.sin(3*t+seed)+.09*Math.cos(5*t-seed));
 result.push([rnd(cx+Math.cos(t)*rr),rnd(cy+Math.sin(t)*rr)]);}
 return 'M'+result.map(p=>p.join(' ')).join('L')+'Z';
};
const offsetCopies=(make)=>[-W,0,W].map(dx=>[-W,0,W].map(dy=>'<g transform="translate('+dx+' '+dy+')">'+make+'</g>').join('')).join('');
const path=(d,fill,stroke='none',sw=0)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linejoin="round" stroke-linecap="round"/>';
const blob=(x,y,r,seed,c,o,weight)=>[path(points(x,y,r,seed),c.primary,o,weight),path(points(x+9,y-5,r*.75,seed+1.1),c.secondary,o,weight*.65),path(points(x+3,y+3,r*.48,seed+2.1),c.accent,o,weight*.55),'<circle cx="'+(x-r*.12)+'" cy="'+(y-r*.15)+'" r="'+rnd(r*.16)+'" fill="'+c.background+'" opacity=".85"/>'].join('');
const star=(x,y,r,color)=>path('M'+x+' '+(y-r)+'Q'+(x+r*.16)+' '+(y-r*.16)+' '+(x+r)+' '+y+'Q'+(x+r*.16)+' '+(y+r*.16)+' '+x+' '+(y+r)+'Q'+(x-r*.16)+' '+(y+r*.16)+' '+(x-r)+' '+y+'Q'+(x-r*.16)+' '+(y-r*.16)+' '+x+' '+(y-r)+'Z',color);
function waves(c,weight){
 let body='';
 // Each harmonic has exactly the same position and tangent at both x=0 and x=360.
 const bands=[[-18,47,18,.2,c.primary],[52,50,19,2.15,c.secondary],[124,50,16,.8,c.accent],[194,53,20,3.3,c.primary],[273,47,20,1.75,c.secondary],[346,47,18,.1,c.accent]];
 for(const [y,width,amp,phase,col] of bands){
  const xy=(x,base)=>[rnd(x),rnd(base+amp*Math.sin(2*Math.PI*x/W+phase)+7*Math.sin(4*Math.PI*x/W+phase*.45))];
  let top=[],bottom=[];
  for(let x=0;x<=W;x+=6){top.push(xy(x,y));bottom.unshift(xy(x,y+width));}
  const d='M'+top.map(a=>a.join(' ')).join('L')+'L'+bottom.map(a=>a.join(' ')).join('L')+'Z';
  body+=path(d,col,c.outline,weight);
 }
 return [-W,0,W].map(dy=>'<g transform="translate(0 '+dy+')">'+body+'</g>').join('');
}
function orbits(c,weight){
 const motifs=[[25,34,93,.35],[283,95,91,2.8],[133,285,116,4.4]];
 const shapes=motifs.map(([x,y,r,seed])=>blob(x,y,r,seed,c,c.outline,weight)).join('');
 let stars='';for(const [x,y,r] of [[159,80,16],[338,282,13],[51,193,10],[265,329,9]])stars+=star(x,y,r,c.accent);
 return offsetCopies(shapes+stars);
}
function doodle(c,weight){
 const check='<pattern id="check" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="'+c.background+'"/><path d="M0 0h14v14H0zM14 14h14v14H14z" fill="'+c.primary+'"/></pattern>';
 const stripes='<pattern id="stripe" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(29)"><rect width="24" height="24" fill="'+c.background+'"/><path d="M0 0h7v24H0zM13 0h4v24h-4z" fill="'+c.secondary+'"/></pattern>';
 const dots='<pattern id="dot" width="17" height="17" patternUnits="userSpaceOnUse"><rect width="17" height="17" fill="'+c.background+'"/><circle cx="8.5" cy="8.5" r="2.5" fill="'+c.primary+'"/></pattern>';
 const forms= [
 path(points(12,37,120,.8),'url(#check)',c.outline,weight),
 path(points(265,72,117,2.8),'url(#stripe)',c.outline,weight),
 path(points(90,276,135,4),'url(#dot)',c.outline,weight),
 path(points(293,303,114,1.4),c.background,c.outline,weight),
 path(points(290,308,64,1.2),c.secondary,c.outline,weight),
 path(points(290,308,34,1.2),c.background,c.outline,weight)
 ].join('');
 let decorations='';
 for(const [x,y,r] of [[123,118,13],[312,177,16],[186,273,18],[37,172,12],[190,34,14]])decorations+=star(x,y,r,c.accent);
 for(let j=0;j<8;j++){const x=(j*89+17)%360,y=(j*121+46)%360;decorations+='<circle cx="'+x+'" cy="'+y+'" r="'+(3+j%3*3)+'" fill="'+(j%2?c.primary:c.outline)+'"/>';}
 return '<defs>'+check+stripes+dots+'</defs>'+offsetCopies(forms+decorations);
}
function puddles(c,weight){
 const forms=[[24,62,96,1],[276,101,111,2.8],[100,275,119,4.7],[330,326,53,.7]];
 let bodies='';
 for(const [x,y,r,s] of forms){
  bodies+=path(points(x,y,r,s),c.primary,c.outline,weight);
  bodies+=path(points(x+6,y-7,r*.78,s+.45),c.accent,c.outline,weight*.82);
  bodies+=path(points(x-4,y+5,r*.51,s+.85),c.secondary,c.outline,weight*.6);
  bodies+=path(points(x+8,y-7,r*.21,s+1.2),c.background,c.outline,weight*.4);
  bodies+='<ellipse cx="'+(x-r*.21)+'" cy="'+(y-r*.25)+'" rx="'+(r*.13)+'" ry="'+(r*.06)+'" fill="'+c.background+'" opacity=".9" transform="rotate(-30 '+x+' '+y+')"/>';
 }
 return offsetCopies(bodies);
}
const cache=new Map();
export function psychedelicPalette(v={}){
 const custom=v.psyPaletteMode==='custom',h=(key,other)=>hx(v[key],other);
 return {
  background:custom?h('psyBackground',PSYCHEDELIC_DEFAULTS.psyBackground):h('card','#16152C'),
  primary:custom?h('psyPrimary',PSYCHEDELIC_DEFAULTS.psyPrimary):h('action','#FF43A0'),
  secondary:custom?h('psySecondary',PSYCHEDELIC_DEFAULTS.psySecondary):h('secondaryAccent','#20CEE8'),
  accent:custom?h('psyAccent',PSYCHEDELIC_DEFAULTS.psyAccent):h('text','#FDC54C'),
  outline:custom?h('psyOutline',PSYCHEDELIC_DEFAULTS.psyOutline):h('main','#101226')
 };
}
export function psychedelicSvg(id,values={}){
 if(!PSYCHEDELIC_IDS.includes(id))return null;
 const c=psychedelicPalette(values),weight=2.4+Math.max(0,Math.min(100,Number(values.psyStroke)||55))*.085;
 const key=JSON.stringify([id,c,weight]);if(cache.has(key))return cache.get(key);
 const motifs=id==='groove-melt'?waves(c,weight):id==='orbit-jelly'?orbits(c,weight):id==='doodle-rift'?doodle(c,weight):puddles(c,weight);
 // The SVG is a single exact-repeat tile, not an illustrative concept poster.
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+W+'" viewBox="0 0 '+W+' '+W+'"><rect width="'+W+'" height="'+W+'" fill="'+c.background+'"/>'+motifs+'</svg>';
 if(cache.size>35)cache.clear();
 const url='url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
 cache.set(key,url);return url;
}
export function applyPsychedelicTexture(root,values){
 if(!root)return;
 const css=psychedelicSvg(values.pattern,values);
 if(css)root.style.setProperty('--psychedelic-texture',css);
 else root.style.removeProperty('--psychedelic-texture');
}
export function syncPsychedelicSamples(root=globalThis.document,values={}){
 if(!root?.querySelectorAll)return;
 for(const node of root.querySelectorAll('.themePatternThumb[data-preview-pattern],.designPresetArt[data-signature-art]')){
  const id=node.dataset.previewPattern||node.dataset.signatureArt;
  const sample=psychedelicSvg(id,values);
  if(sample)node.style.setProperty('--psychedelic-texture',sample);
 }
}
