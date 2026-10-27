// Arcana Visual Art Collection, wave/contour geometry. Pure deterministic SVG.
// No photos, raster filters, blur, randomness, remote assets or canvas dependencies.
// Every artwork has four independent HEX pigment channels; SVG stays vector-sharp.
import {ATELIER_ART,atelierGeometry} from './atelier-art.js';
export const VISUAL_ART=Object.freeze([
 ...ATELIER_ART,
 {id:'vision-astral-veil',name:'Astral Veil',family:'Dreamlike Cosmos',note:'Violet nebula clouds, deep midnight and a scattered field of radiant stars',colors:['#0D0821','#AD71F8','#603EC9','#EBDBFF']},
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
 {id:'vision-aether-frame',name:'Aether Frame',family:'Hero Composition',note:'Asymmetric illuminated corner currents for hero panels',colors:['#0E152D','#9A72EE','#58D9E1','#E6B7F3']},
 {id:'vision-gilded-orbit',name:'Gilded Orbit',family:'Relic / Celestial',note:'Engraved orbital medallions with a quiet black-gold horizon',colors:['#100F16','#EDC378','#7A5A9E','#FFF0D0']},
 {id:'vision-glacial-fold',name:'Glacial Fold',family:'Ribbon / Veil',note:'Sculpted blue-silver sheets, knife-sharp refractive edges',colors:['#0B1A2B','#77CBE7','#3C65AC','#E3F9FF']},
 {id:'vision-nocturne-mesh',name:'Nocturne Mesh',family:'Graphic Monochrome',note:'Architectural optical lace with a carved central aperture',colors:['#0D0E16','#E9E9E8','#7A808D','#FFFFFF']},
 {id:'vision-celestial-tapestry',name:'Celestial Tapestry',family:'Arcane Geometry',note:'Fine compass geometry and etched cosmic chart lines',colors:['#121027','#C5A6F2','#6D8DD7','#FBE5C0']},
 {id:'vision-verdant-signal',name:'Verdant Signal',family:'Organic Signal',note:'Emerald signal branches grow through controlled concentric fields',colors:['#081A17','#59E0B3','#2F7B86','#D0FFE3']},
 {id:'vision-solar-relic',name:'Solar Relic',family:'Elemental',note:'Ancient bronze solar arcs and a luminous suspended core',colors:['#1A0D10','#F3A660','#B94D71','#FFF2D0']}
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
 if(id.startsWith('vision-atelier-'))return atelierGeometry(id);
 let s='';
 if(id==='vision-astral-veil'){
   // Seam-free, deterministic vector nebula and starfield.
   s+=ellipse(885,245,565,360,'url(#astralNebula)',.98);
   s+=ellipse(465,430,460,325,'url(#astralMist)',.91);
   s+=ellipse(220,135,310,225,'url(#astralNebula)',.46);
   s+=ellipse(1050,555,480,270,'url(#astralMist)',.63);
   s+=ellipse(630,125,330,200,'url(#astralNebula)',.48);
   for(let i=0;i<240;i++){
     const x=(i*173+i*i*13+41)%1200,y=(i*71+i*i*7+39)%620;
     const radius=i%29===0?2.3:i%9===0?1.5:.55+(i%5)*.16;
     s+=circle(x,y,radius,i%7===0?'url(#spark)':'url(#astralDust)',.40+(i%6)*.10);
     if(i%19===0){
       s+=circle(x,y,13,'url(#astralStarGlow)',.66);
       s+=path('M '+rnd(x-6)+' '+rnd(y)+' L '+rnd(x+6)+' '+rnd(y)+' M '+rnd(x)+' '+rnd(y-6)+' L '+rnd(x)+' '+rnd(y+6),'url(#spark)',.8,.47);
     }
   }
 }else if(id==='vision-violet-fault'){
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

 }else if(id==='vision-gilded-orbit'){
  // Displaced orbital filigree, numerous concentric ellipses, and fine
  // compass increments give this its own ornate metallic identity.
  s+=ellipse(650,300,360,300,'url(#halo)',.16);
  for(let i=0;i<34;i++){
   const r=74+i*10;
   const d=closed(a=>[780+r*1.4*Math.cos(a),310+r*.68*Math.sin(a)+Math.sin(a*6)*i*.3],116);
   s+=path(d,i%5===0?'url(#spark)':'url(#ink)',i%7===0?2.1:1.0,.23+.54*(1-i/38));
  }
  for(let i=0;i<96;i++){let a=Math.PI*2*i/96,x=780+445*Math.cos(a),y=310+210*Math.sin(a);
   s+=path('M '+rnd(x)+' '+rnd(y)+' l '+rnd(8*Math.cos(a))+' '+rnd(8*Math.sin(a)),'url(#spark)',i%8===0?2.6:1,.25+.48*(i%8===0?1:.3));}
  s+=circle(780,310,7,'url(#spark)',.7);
 }else if(id==='vision-glacial-fold'){
  // Interleaved translucent planes have visible crystalline edges.
  for(let i=0;i<16;i++){const off=i*37,a=-130+off;
   s+=filled('M '+rnd(a)+' -90 C '+rnd(670+i*10)+' 110 '+rnd(300+i*12)+' 320 '+rnd(a+150)+' 740 L '+rnd(a-210)+' 740 C '+rnd(80+i*15)+' 300 '+rnd(360+i*12)+' 30 '+rnd(a)+' -90 Z',i%2?'url(#blue)':'url(#rose)',.14+i*.012);
   s+=path('M '+rnd(a)+' -90 C '+rnd(670+i*10)+' 110 '+rnd(300+i*12)+' 320 '+rnd(a+150)+' 740',i%4?'url(#ink)':'url(#spark)',i%5===0?2.7:1.2,.18+i*.032);
  }
  for(let i=0;i<13;i++){let off=i*22;
   s+=path('M '+rnd(1270-off)+' -25 Q '+rnd(800-off)+' '+rnd(220+off*.2)+' '+rnd(1120-off)+' 690','url(#spark)',1.05,.13+i*.025);}
 }else if(id==='vision-nocturne-mesh'){
  // Two dislocated line families bend around the central empty oval.
  for(let i=0;i<64;i++){
   const t=i/63,y=-90+i*13;
   const d=L(x=>y+Math.sin(x/138+t*2.8)*44+(175*Math.exp(-Math.pow((x-620)/225,2)))*(t-.5),-40,1260,78);
   s+=path(d,i%7===0?'url(#spark)':'url(#ink)',i%8===0?2.7:1.1,.21+.68*Math.sin(t*Math.PI));
  }
  for(let i=0;i<57;i++){let t=i/56,x=-140+i*27;
   const d=L(y=>x+Math.sin(y/120+i*.11)*24-(140*Math.exp(-Math.pow((y-300)/130,2)))*(t-.5),-25,660,54);
   s+=path(d,'url(#ink)',1,.11+.24*Math.sin(t*Math.PI));
  }
  s+=ellipse(630,310,210,100,'url(#halo)',.09);
 }else if(id==='vision-celestial-tapestry'){
  s+=fields(710,295,40,270,.3);
  for(let i=0;i<8;i++){let a=i*Math.PI/4,x=710+385*Math.cos(a),y=295+220*Math.sin(a);
   s+=path('M 710 295 L '+rnd(x)+' '+rnd(y),'url(#ink)',i%2===0?1.6:.9,.16);
   s+=circle(x,y,i%2===0?3.2:1.5,'url(#spark)',.48);
  }
  for(let i=0;i<120;i++){let a=i*Math.PI/60,x=710+412*Math.cos(a),y=295+235*Math.sin(a),xx=x+Math.cos(a)*(i%10===0?14:5),yy=y+Math.sin(a)*(i%10===0?10:3);
   s+=path('M '+rnd(x)+' '+rnd(y)+' L '+rnd(xx)+' '+rnd(yy),'url(#spark)',i%10===0?2:1,.38);}
  s+=strip(null,14,{start:480,gap:9,amp:21,wave:225,amp2:7});
 }else if(id==='vision-verdant-signal'){
  s+=fields(870,390,39,280,2.1);
  for(let i=0;i<35;i++){const t=i/34;
   const d=L(x=>t*640+58*Math.sin(x/102+t*7)+65*Math.cos(x/186-t*4),-30,1260,70);
   s+=path(d,i%9===0?'url(#spark)':'url(#ink)',i%8===0?2.3:1,.18+.43*Math.sin(t*Math.PI));
  }
  for(let i=0;i<19;i++){let x=80+i*60,y=270+130*Math.sin(i*.77);
   s+=circle(x,y,i%5===0?3.9:1.4,'url(#spark)',.3);
   s+=path('M '+rnd(x-11)+' '+rnd(y)+' l 22 0','url(#ink)',.9,.2);}
 }else if(id==='vision-solar-relic'){
  s+=ellipse(825,330,360,235,'url(#halo)',.23);
  for(let i=0;i<47;i++){let rad=56+i*7.4;
   const d=closed(a=>[825+rad*1.25*Math.cos(a),305+rad*.78*Math.sin(a)],130);
   s+=path(d,i%6===0?'url(#spark)':'url(#ink)',i%8===0?2.5:1.05,.11+.6*(1-i/54));
  }
  for(let i=0;i<72;i++){let a=Math.PI*2*i/72,rx=412,ry=252,x=825+rx*Math.cos(a),y=305+ry*Math.sin(a);
   s+=path('M '+rnd(x)+' '+rnd(y)+' l '+rnd(Math.cos(a)*(i%6===0?24:8))+' '+rnd(Math.sin(a)*(i%6===0?18:6)),'url(#spark)',i%6===0?1.8:1,.32);}
  s+=circle(825,305,10,'url(#spark)',.8);
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
 const num=(v,lo,hi,def)=>Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Math.round(Number(v)))):def;
 const strength=num(values.artStrength,15,100,100),detail=num(values.artDetail,25,100,100),
  weight=num(values.artWeight,60,180,100),zoom=num(values.artZoom,75,155,100),
  posX=num(values.artPositionX,0,100,50),posY=num(values.artPositionY,0,100,50);
 const key=[id,base,primary,secondary,glow,strength,detail,weight,zoom,posX,posY].join('|');
 if(cache.has(key))return cache.get(key);
 const defs='<defs>'+
 '<linearGradient id="ink" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+primary+'"/><stop offset=".52" stop-color="'+secondary+'"/><stop offset="1" stop-color="'+primary+'"/></linearGradient>'+
 '<linearGradient id="spark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+glow+'"/><stop offset="1" stop-color="'+primary+'"/></linearGradient>'+
 '<linearGradient id="rose" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+primary+'" stop-opacity=".86"/><stop offset="1" stop-color="'+secondary+'" stop-opacity=".18"/></linearGradient>'+
 '<linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+secondary+'" stop-opacity=".6"/><stop offset="1" stop-color="'+glow+'" stop-opacity=".04"/></linearGradient>'+
 '<radialGradient id="halo"><stop stop-color="'+glow+'" stop-opacity=".22"/><stop offset="1" stop-color="'+glow+'" stop-opacity="0"/></radialGradient>'+
 (id==='vision-astral-veil'?
   '<radialGradient id="astralNebula"><stop stop-color="'+primary+'" stop-opacity=".68"/><stop offset=".42" stop-color="'+secondary+'" stop-opacity=".40"/><stop offset="1" stop-color="'+secondary+'" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="astralMist"><stop stop-color="'+glow+'" stop-opacity=".36"/><stop offset=".4" stop-color="'+primary+'" stop-opacity=".27"/><stop offset="1" stop-color="'+primary+'" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="astralDust"><stop stop-color="'+glow+'" stop-opacity="1"/><stop offset=".45" stop-color="'+glow+'" stop-opacity=".72"/><stop offset="1" stop-color="'+secondary+'" stop-opacity=".12"/></radialGradient>'+
   '<radialGradient id="astralStarGlow"><stop stop-color="'+glow+'" stop-opacity=".55"/><stop offset=".3" stop-color="'+primary+'" stop-opacity=".20"/><stop offset="1" stop-color="'+primary+'" stop-opacity="0"/></radialGradient>':'')+
 '</defs>';
 let artGeom=geometry(id);
 if(detail<100){
  let index=0;artGeom=artGeom.replace(/<path\b[^>]*\/>/g,match=>{
   if(!match.includes('fill="none"'))return match;
   const n=index++;return n%100<detail?match:'';
  });
 }
 if(weight!==100)artGeom=artGeom.replace(/stroke-width="([0-9.]+)"/g,(_,x)=>'stroke-width="'+rnd(Number(x)*weight/100)+'"');
 const scale=zoom/100,shiftX=(posX-50)*8,shiftY=(posY-50)*5;
 const transform='translate('+rnd(shiftX)+' '+rnd(shiftY)+') translate(600 310) scale('+scale+') translate(-600 -310)';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice"><rect width="'+W+'" height="'+H+'" fill="'+base+'"/>'+defs+'<g opacity="'+rnd(strength/100)+'" transform="'+transform+'">'+artGeom+'</g></svg>';
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