// Arcana Visual Art Collection, wave/contour geometry. Pure deterministic SVG.
// No photos, raster filters, blur, randomness, remote assets or canvas dependencies.
// Every artwork has four independent HEX pigment channels; SVG stays vector-sharp.
export const VISUAL_ART=Object.freeze([
 {id:'vision-violet-fault',name:'Violet Fault',family:'Neon Topography',note:'Luminous fracture lines converging around a quiet valley',colors:['#100B2E','#ED55B8','#6552F5','#9AC7FF']},
 {id:'vision-pulse-terrain',name:'Pulse Terrain',family:'Neon Topography',note:'Electric ridgelines with controlled, atmospheric perspective',colors:['#101D39','#65D9F4','#EC70B5','#E2DAFF']},
 {id:'vision-ribbon-bloom',name:'Ribbon Bloom',family:'Ribbon / Veil',note:'Layered translucent sculptures framing a calm center',colors:['#170A31','#EE6CAF','#8C42DC','#F8B1D3']},
 {id:'vision-veil-current',name:'Veil Current',family:'Ribbon / Veil',note:'Quiet, folded silhouettes with fine illuminated edges',colors:['#0D1B30','#3879BA','#7EC5D5','#BEDBFF']},
 {id:'vision-arcflow',name:'Arcflow',family:'Flowline',note:'Precision linework sweeping through an organic magnetic field',colors:['#12102A','#C97CB7','#7B6DE9','#F4C5CC']},
 {id:'vision-contour-drift',name:'Contour Drift',family:'Flowline',note:'Nested terrain islands with deliberate breathing room',colors:['#0F1B2A','#62A8CF','#B584E1','#BDDAE6']},
 {id:'vision-monowave',name:'Monowave',family:'Graphic Monochrome',note:'Bold optical curves and breathing negative space',colors:['#09090F','#F5F4EC','#8C8C9D','#FFFFFF']},
 {id:'vision-ink-lattice',name:'Ink Lattice',family:'Graphic Monochrome',note:'Architectural woven curves rather than a generic grid',colors:['#11131A','#DAD9E5','#7F87A2','#FFFFFF']},
 {id:'vision-signal-bloom',name:'Signal Bloom',family:'Hybrid Signal',note:'Fine flow topology, sparse technical marks, graceful hierarchy',colors:['#11152D','#CF6DE2','#54C6E6','#E0B8FF']},
 {id:'vision-vector-halo',name:'Vector Halo',family:'Hybrid Signal',note:'Orbital line sculpture punctuated by intentional nodes',colors:['#0F142D','#6F9FF3','#BC71E9','#B9EAF6']},
 {id:'vision-crownspace',name:'Crownspace',family:'Hero Composition',note:'Ornament around the edges; a beautiful quiet interior',colors:['#11142B','#E6A5C5','#7A6CE5','#D9CBFF']},
 {id:'vision-aether-frame',name:'Aether Frame',family:'Hero Composition',note:'Asymmetric illuminated corner currents for hero panels',colors:['#0E152D','#9A72EE','#58D9E1','#E6B7F3']}
]);
export const VISUAL_ART_IDS=Object.freeze(VISUAL_ART.map(x=>x.id));
const byId=new Map(VISUAL_ART.map(x=>[x.id,x]));
const W=1200,H=620;
const rnd=n=>Number(n.toFixed(2));
const hex=value=>/^#[0-9a-fA-F]{6}$/.test(String(value||''))?value.toUpperCase():null;
const path=(d,color='url(#ink)',width=1.4,alpha=.7,extra='')=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+rnd(width)+'" stroke-opacity="'+rnd(alpha)+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
const filled=(d,color,alpha=1)=>'<path d="'+d+'" fill="'+color+'" fill-opacity="'+rnd(alpha)+'"/>';
const ellipse=(x,y,rx,ry,color,alpha)=>'<ellipse cx="'+rnd(x)+'" cy="'+rnd(y)+'" rx="'+rnd(rx)+'" ry="'+rnd(ry)+'" fill="'+color+'" opacity="'+rnd(alpha)+'"/>';
const circle=(x,y,r,color='url(#glimmer)',opacity=.9)=>'<circle cx="'+rnd(x)+'" cy="'+rnd(y)+'" r="'+rnd(r)+'" fill="'+color+'" opacity="'+rnd(opacity)+'"/>';
const L=(f,from,to,count=62)=>{let s='';for(let j=0;j<=count;j++){const x=from+(to-from)*j/count,y=f(x,j/count);s+=(j?'L':'M')+rnd(x)+' '+rnd(y)+' ';}return s.trim()};
const closed=(f,count=180)=>{let s='';for(let j=0;j<=count;j++){const a=Math.PI*2*j/count,p=f(a);s+=(j?'L':'M')+rnd(p[0])+' '+rnd(p[1])+' ';}return s+'Z'};
function strip(ctx,n,opt={}){
 let s='';const count=n;
 for(let i=0;i<count;i++){
  const t=(i/(count-1||1)-.5),base=(opt.start||110)+i*(opt.gap||9),turn=opt.turn||0;
  const d=L(x=>base+
   Math.sin(x/(opt.wave||155)+turn+i*.085)*((opt.amp||66)*(1+.13*Math.sin(i*.21)))+
   Math.sin(x/((opt.wave||155)*.52)-i*.045)*(opt.amp2||22)+
   (opt.fault||0)*Math.exp(-Math.pow((x-(opt.focus||545))/190,2))*(Math.sin(i*.075+1)-.25),-50,1250,58);
  s+=path(d,i%7===0?'url(#spark)':'url(#ink)',i%9===0?2.2:1.04,.17+(.62*(1-Math.abs(t)*1.5)));
 }return s;
}
function fields(x,y,n,r,phase=0){
 let s='';
 for(let i=0;i<n;i++){
  const f=i/(n-1),rr=r*(.25+f*.9);
  const d=closed(a=>{const v=1+.13*Math.sin(3*a+phase)+.075*Math.cos(5*a-phase)+.06*Math.sin(a*7+f*3);
   return [x+rr*1.5*v*Math.cos(a)+22*Math.sin(a*2+phase),y+rr*.77*v*Math.sin(a)];},120);
  s+=path(d,i%6===0?'url(#spark)':'url(#ink)',i%8===0?1.9:1.1,.1+.64*(1-f*.6));
 }return s;
}
function ribbon(d,fill,stroke='url(#spark)',opacity=.75){
 return filled(d,fill,opacity)+path(d,stroke,2,.4);
}
function braid(centerX,width,stride=1){
 let out='';
 for(let i=0;i<58;i++){
  const b=i*5.9;
  const d=L(x=>190+b+Math.sin(x/125+i*.055)*78+Math.cos(x/266-i*.08)*34,-40,1235,75);
  out+=path(d,i%5===0?'url(#spark)':'url(#ink)',i%7===0?1.9:1.1,.29+.5*Math.sin((i/57)*Math.PI));
 }
 return out;
}
function geometry(id){
 let s='';
 if(id==='vision-violet-fault'){
  s+=ellipse(310,180,260,210,'url(#halo)',.27);
  for(let i=0;i<65;i++){const y=70+i*8.1;const d=L(x=>y+Math.sin(x/150+i*.1)*34-(155+Math.sin(i/10)*24)*Math.exp(-Math.pow((x-340)/245,2))*Math.exp(-Math.pow((i-32)/39,2))+35*Math.exp(-Math.pow((x-880)/280,2)),0,1200,72);s+=path(d,i%9===0?'url(#spark)':'url(#ink)',i%11===0?2:1.05,.09+.72*(1-Math.abs(i-35)/66));}
 }else if(id==='vision-pulse-terrain'){
  s+=ellipse(925,130,380,300,'url(#halo)',.24);
  s+=strip(null,53,{start:25,gap:12,amp:37,amp2:15,wave:165,turn:1.4,focus:840,fault:78});
  for(let i=0;i<22;i++){const x=45+i*49;s+=circle(x,540-34*Math.cos(i*.5),.75,'url(#spark)',.28);}
 }else if(id==='vision-ribbon-bloom'){
  for(let i=0;i<10;i++){
   const p=i*26,q=i*24;
   s+=ribbon('M '+(-160+p)+' '+(-70-q)+' C '+(390+p)+' '+(35+q)+' '+(360+p)+' '+(310+q)+' '+(-90+p)+' '+(680+q)+' L '+(-300+p)+' '+(680+q)+' C '+(185+p)+' '+(270+q)+' '+(160+p)+' '+(90+q)+' '+(-190+p)+' '+(-80+q)+' Z',i%3===0?'url(#rose)':'url(#blue)','url(#spark)',.1+(10-i)*.041);
   s+=ribbon('M '+(1350-p)+' '+(-95-q)+' C '+(830-p)+' '+(110+q)+' '+(920-p)+' '+(410+q)+' '+(1230-p)+' '+(680+q)+' L '+(1430-p)+' '+(690+q)+' C '+(1050-p)+' '+(270+q)+' '+(1130-p)+' '+(55+q)+' '+(1470-p)+' '+(-75+q)+' Z','url(#rose)','url(#ink)',.08+(10-i)*.033);
  }
 }else if(id==='vision-veil-current'){
  for(let i=0;i<13;i++){
   const a=i*21;
   s+=filled('M '+(-200+a)+' -80 C '+(470+a)+' 30 '+(210+a)+' 370 '+(-110+a)+' 730 L '+(-250+a)+' 730 Z',i%3===0?'url(#blue)':'url(#rose)',.12+(i%4)*.035);
   s+=path('M '+(-200+a)+' -80 C '+(470+a)+' 30 '+(210+a)+' 370 '+(-110+a)+' 730','url(#spark)',1.15,.1+i*.04);
  }
  for(let i=0;i<12;i++){const a=i*25;s+=path('M '+(1370-a)+' -30 C '+(980-a)+' 140 '+(1040-a)+' 420 '+(1310-a)+' 680','url(#ink)',1.2,.12+i*.032);}
 }else if(id==='vision-arcflow'){
  s+=braid();
  s+=ellipse(980,30,250,120,'url(#halo)',.17);
 }else if(id==='vision-contour-drift'){
  s+=fields(225,255,32,240,.6)+fields(1030,510,30,270,2.7);
  s+=ellipse(740,60,400,190,'url(#halo)',.1);
 }else if(id==='vision-monowave'){
  // Bold optical ink, with alternating light bands and uninterrupted wave gaps.
  for(let i=0;i<84;i++){
   const y=-75+i*10.1,phase=i*.075;
   const d=L(x=>y+Math.sin(x/154+phase)*83+Math.sin(x/63-phase*.55)*14+Math.cos(x/310+i*.12)*31,-40,1260,104);
   s+=path(d,i%14<4?'url(#spark)':'url(#ink)',i%8===0?4.3:i%4===0?2.3:1.18,.39+.57*(1-Math.abs(i-42)/84));
  }
 }else if(id==='vision-ink-lattice'){
  s+=strip(null,43,{start:-20,gap:13,amp:62,amp2:33,wave:195,turn:.1});
  for(let i=0;i<42;i++){
   const x=-240+i*39;
   const d=L(y=>x+Math.sin(y/115+i*.21)*80+Math.cos(y/290-i*.2)*32,-45,680,70);
   s+=path(d,i%9===0?'url(#spark)':'url(#ink)',i%8===0?1.8:.9,.18+.21*(1-Math.abs(i-21)/42));
  }
 }else if(id==='vision-signal-bloom'){
  s+=strip(null,46,{start:-50,gap:12,amp:52,amp2:18,wave:175,turn:2,focus:320,fault:165});
  for(let x=65;x<1220;x+=29)for(let y=47;y<615;y+=29)if(((x/29+y/29)|0)%7<2)s+=circle(x,y,.9,'url(#spark)',.14);
  for(let i=0;i<15;i++){const x=55+i*79,y=300+Math.sin(i*.8)*130;s+=path('M '+x+' '+(y-7)+' L '+(x+7)+' '+y+' L '+x+' '+(y+7)+' Z','url(#spark)',.9,.23);}
 }else if(id==='vision-vector-halo'){
  s+=fields(825,286,49,250,1.35);
  s+=ellipse(815,294,315,220,'url(#halo)',.14);
  for(let i=0;i<14;i++){const a=i*2.4,r=95+i*17,x=825+Math.cos(a)*r*1.4,y=285+Math.sin(a)*r*.72;s+=circle(x,y,i%4===0?3.8:2,'url(#spark)',.43)+circle(x,y,8,'url(#halo)',.18);}
  s+=strip(null,12,{start:495,gap:9,amp:30,amp2:14,wave:155,turn:3});
 }else if(id==='vision-crownspace'){
  s+=fields(-100,-100,28,300,1.9)+fields(1350,-90,24,285,.3);
  s+=fields(-120,800,25,320,.8)+fields(1370,760,24,310,2.8);
  for(let i=0;i<12;i++){s+=path('M '+(i*25)+' 0 Q '+(220+i*12)+' '+(92+i*3)+' '+(275+i*14)+' '+(210+i*8),'url(#spark)',1,.13);}
 }else if(id==='vision-aether-frame'){
  for(let i=0;i<49;i++){
   const a=i*8;
   const d='M '+rnd(1190-a*1.65)+' -35 C '+rnd(1250-a*.72)+' '+rnd(180+a*.11)+' '+rnd(755-a*.47)+' '+rnd(185+a*.63)+' '+rnd(790-a*.66)+' '+rnd(645+a*.06);
   s+=path(d,i%9===0?'url(#spark)':'url(#ink)',i%7===0?2:1.1,.18+.63*(1-i/60));
  }
  for(let i=0;i<25;i++){
   const a=i*16;const d='M -30 '+rnd(150+a*.7)+' C '+rnd(140+a*.3)+' '+rnd(150+a*.7)+' '+rnd(140+a*.3)+' '+rnd(350+a*.35)+' '+rnd(290+a*.34)+' '+rnd(510+a*.26);
   s+=path(d,'url(#ink)',1.1,.12+.2*(1-i/25));
  }
  s+=ellipse(1110,440,210,170,'url(#halo)',.12);
 }
 return s;
}
const cache=new Map();
export function artUrl(id,values={}){
 const art=byId.get(id);if(!art)return null;
 const c=art.colors,base=hex(values.artBase)||c[0],primary=hex(values.artPrimary)||c[1],
  secondary=hex(values.artSecondary)||c[2],glow=hex(values.artGlow)||c[3];
 const key=[id,base,primary,secondary,glow].join('|');
 if(cache.has(key))return cache.get(key);
 const defs='<defs>'+
 '<linearGradient id="ink" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+primary+'"/><stop offset=".52" stop-color="'+secondary+'"/><stop offset="1" stop-color="'+primary+'"/></linearGradient>'+
 '<linearGradient id="spark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+glow+'"/><stop offset="1" stop-color="'+primary+'"/></linearGradient>'+
 '<linearGradient id="rose" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+primary+'" stop-opacity=".86"/><stop offset="1" stop-color="'+secondary+'" stop-opacity=".18"/></linearGradient>'+
 '<linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+secondary+'" stop-opacity=".6"/><stop offset="1" stop-color="'+glow+'" stop-opacity=".04"/></linearGradient>'+
 '<radialGradient id="halo"><stop stop-color="'+glow+'" stop-opacity=".22"/><stop offset="1" stop-color="'+glow+'" stop-opacity="0"/></radialGradient>'+
 '</defs>';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice"><rect width="'+W+'" height="'+H+'" fill="'+base+'"/>'+defs+geometry(id)+'</svg>';
 const result='url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
 if(cache.size>84)cache.clear();
 cache.set(key,result);return result;
}
export function visualArtById(id){return byId.get(id)||null}
export function applyVisualArt(root,values){
 if(!root)return;
 const css=artUrl(values.pattern,values);
 if(css)root.style.setProperty('--arcana-visual-art',css);
 else root.style.removeProperty('--arcana-visual-art');
}
export function syncVisualSamples(root=globalThis.document,values={}){
 if(!root?.querySelectorAll)return;
 for(const node of root.querySelectorAll('.visionArtThumb[data-preview-pattern]')){
  const id=node.dataset.previewPattern,art=byId.get(id);
  if(!art)continue;
  const palette=id===values.pattern?values:{
   artBase:art.colors[0],artPrimary:art.colors[1],artSecondary:art.colors[2],artGlow:art.colors[3]
  };
  const result=artUrl(id,palette);
  if(result)node.style.backgroundImage=result;
 }
}