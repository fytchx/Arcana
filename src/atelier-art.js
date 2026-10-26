// Arcana Atelier Five | hand-authored deterministic vector compositions.
// Five different geometric languages, four editable pigments each.
// No blur, bitmap tiles, remote downloads, or randomness.
export const ATELIER_ART=Object.freeze([
 {id:'vision-atelier-chapel',name:'Chromatic Chapel',family:'Atelier / Sacred Geometry',note:'Pointed architectural glass, etched brass ribs and a suspended rose window',colors:['#101421','#EDC686','#82B8E9','#FFF2CF']},
 {id:'vision-atelier-circuit',name:'Ghost Circuit',family:'Atelier / Bioluminescence',note:'Living signal traces branching into phosphor nodes on abyssal glass',colors:['#071C21','#A7EA79','#4CA8B7','#D3FFE4']},
 {id:'vision-atelier-atlas',name:'Cinder Atlas',family:'Atelier / Engraved Terrain',note:'Copperplate land contours, cadastral hatch marks and an offset compass',colors:['#1A1412','#E6B06E','#7FAFD1','#FFF1D5']},
 {id:'vision-atelier-afterglow',name:'Acid Afterglow',family:'Atelier / Optical Art',note:'Interlocking chromatic petals, optical rings and long liquid current lines',colors:['#171027','#EE7EBA','#C8F36D','#F9E8FF']},
 {id:'vision-atelier-porcelain',name:'Porcelain Nocturne',family:'Atelier / Botanical Etching',note:'Fine botanical ceramic inlay and irregular hairline mineral fractures',colors:['#101B25','#D8E9E5','#DDA6B6','#FFFFFF']}
]);
const n=x=>Math.round(x*100)/100;
const line=(d,gradient='ink',width=1,alpha=.6)=>'<path d="'+d+'" fill="none" stroke="url(#'+gradient+')" stroke-width="'+n(width)+'" stroke-opacity="'+n(alpha)+'" stroke-linecap="round" stroke-linejoin="round"/>';
const area=(d,gradient='blue',alpha=.25)=>'<path d="'+d+'" fill="url(#'+gradient+')" fill-opacity="'+n(alpha)+'"/>';
const dot=(x,y,r=2,gradient='spark',alpha=.65)=>'<circle cx="'+n(x)+'" cy="'+n(y)+'" r="'+n(r)+'" fill="url(#'+gradient+')" opacity="'+n(alpha)+'"/>';
const curve=(fn,a,b,steps=72)=>{let d='';for(let j=0;j<=steps;j++){const x=a+(b-a)*j/steps;d+=(j?'L':'M')+n(x)+' '+n(fn(x,j/steps))+' ';}return d};
const loop=(fn,steps=140)=>{let d='';for(let j=0;j<=steps;j++){const p=fn(j*2*Math.PI/steps);d+=(j?'L':'M')+n(p[0])+' '+n(p[1])+' ';}return d+'Z'};
export function atelierGeometry(id){
 let s='';
 if(id==='vision-atelier-chapel'){
  // Vertical pointed arches and sharp panes frame an otherwise quiet center.
  for(let i=0;i<9;i++){
   const x=38+i*141,top=120+(i%3)*14,bot=605;
   const outline='M '+n(x-64)+' '+bot+' L '+n(x-64)+' '+n(top+142)+' Q '+n(x-61)+' '+n(top+60)+' '+x+' '+top+' Q '+n(x+61)+' '+n(top+60)+' '+n(x+64)+' '+n(top+142)+' L '+n(x+64)+' '+bot;
   if(i%2===0)s+=area('M '+n(x-58)+' '+bot+' L '+n(x-58)+' '+n(top+152)+' Q '+x+' '+n(top+32)+' '+n(x+58)+' '+n(top+152)+' L '+n(x+58)+' '+bot+' Z','blue',.07);
   s+=line(outline,i%3===0?'spark':'ink',i%3===0?2:1.15,.28+(i%3)*.12);
   s+=line('M '+x+' '+n(top+12)+' L '+x+' '+bot,'ink',.82,.24);
   s+=line('M '+n(x-58)+' '+n(top+232)+' L '+n(x+58)+' '+n(top+232),'spark',.8,.26);
   for(let j=0;j<3;j++){const yy=top+285+j*73;s+=line('M '+n(x-48)+' '+yy+' L '+x+' '+n(yy-32)+' L '+n(x+48)+' '+yy,'ink',.9,.15);}
  }
  // Offset rose window (not a centered mandala), with bronze tracery.
  const cx=945,cy=197;
  for(let k=0;k<7;k++){
   const r=48+k*24;
   s+=line(loop(a=>[cx+r*Math.cos(a),cy+r*Math.sin(a)],120),k%2?'ink':'spark',k%2?1:1.7,.16+k*.055);
  }
  for(let k=0;k<24;k++){const a=k*Math.PI/12,x=cx+208*Math.cos(a),y=cy+208*Math.sin(a);
   s+=line('M '+n(cx+48*Math.cos(a))+' '+n(cy+48*Math.sin(a))+' L '+n(x)+' '+n(y),'ink',k%3===0?1.45:.75,k%3===0?.37:.2);
   if(k%3===0)s+=dot(x,y,2.8,'spark',.72);
  }
  s+=dot(cx,cy,9,'spark',.8);
 }else if(id==='vision-atelier-circuit'){
  // Signal paths follow non-random Manhattan steps with restrained organic bends.
  for(let i=0;i<27;i++){
   const y=35+i*23,shift=Math.sin(i*.57)*65;
   const d='M -30 '+n(y)+' L '+n(125+shift*.15)+' '+n(y)+' Q '+n(160+shift*.25)+' '+n(y)+' '+n(183+shift*.23)+' '+n(y+18)+' L '+n(395+shift)+' '+n(y+18)+' Q '+n(430+shift)+' '+n(y+18)+' '+n(453+shift)+' '+n(y-27)+' L '+n(692+shift*.35)+' '+n(y-27)+' Q '+n(729+shift*.3)+' '+n(y-27)+' '+n(751+shift*.3)+' '+n(y+13)+' L 1230 '+n(y+13);
   s+=line(d,i%6===0?'spark':'ink',i%6===0?2.25:1,.18+.5*Math.sin((i+1)/29*Math.PI));
   if(i%2===0){s+=dot(395+shift,y+18,i%6===0?3.8:1.7,'spark',.55);s+=dot(752+shift*.3,y+13,1.8,'ink',.48);}
  }
  for(let k=0;k<24;k++){
   const x=805+(k%8)*47,y=98+Math.floor(k/8)*163;
   s+=line('M '+x+' '+y+' l 0 '+(k%2?23:-23)+' l 23 0','spark',.85,.2);
   if(k%3===0)s+=dot(x,y,3,'spark',.4);
  }
  for(let r=0;r<16;r++){
   const a=1.0+r*.082,xx=996+155*Math.cos(a),yy=313+120*Math.sin(a);
   s+=dot(xx,yy,2.1,'spark',.43);
  }
 }else if(id==='vision-atelier-atlas'){
  // Copperplate landfall: topographic bands skew around two imaginary land masses.
  for(let i=0;i<57;i++){
   const yy=-55+i*12.7;
   const d=curve(x=>yy+53*Math.sin(x/170+i*.065)+23*Math.sin(x/65-i*.16)
    -108*Math.exp(-Math.pow((x-305)/210,2))*Math.sin((i+4)*.079)
    +78*Math.exp(-Math.pow((x-840)/175,2))*Math.cos(i*.105),-40,1250,76);
   s+=line(d,i%10===0?'spark':'ink',i%10===0?2.05:.9,.16+.48*Math.sin((i+5)/66*Math.PI));
  }
  for(let col=0;col<23;col++){const x=25+col*54;for(let row=0;row<4;row++){
   const y=60+row*155+(col%3)*7;
   s+=line('M '+x+' '+y+' l 8 -13','spark',.8,.15);
  }}
  const cx=970,cy=315;
  for(let i=0;i<5;i++){const r=70+i*27;s+=line(loop(a=>[cx+r*Math.cos(a),cy+r*Math.sin(a)],112),'spark',i%2?1.2:1.6,.25);}
  for(let k=0;k<32;k++){const a=k*Math.PI/16,rr=k%4===0?202:185;
   s+=line('M '+n(cx+163*Math.cos(a))+' '+n(cy+163*Math.sin(a))+' L '+n(cx+rr*Math.cos(a))+' '+n(cy+rr*Math.sin(a)),'spark',k%4===0?1.8:.9,.5);
  }
  s+=area('M 970 191 L 981 315 L 970 437 L 960 315 Z','rose',.29)+dot(cx,cy,4,'spark',.85);
 }else if(id==='vision-atelier-afterglow'){
  // Chromatic optical flowers fold in on themselves; line spacing remains continuous.
  const cx=905,cy=318;
  for(let i=0;i<56;i++){
   const r=18+i*6.25;
   const d=loop(a=>{
    const f=1+.13*Math.sin(7*a+i*.071)+.085*Math.sin(3*a-i*.19);
    return [cx+r*1.13*f*Math.cos(a)+Math.sin(2*a+i*.02)*13,
            cy+r*.74*f*Math.sin(a)];
   },154);
   s+=line(d,i%8===0?'spark':'ink',i%8===0?2.55:1.15,.19+.6*(1-i/67));
  }
  for(let i=0;i<35;i++){
   const yy=-55+i*19.5;
   const d=curve(x=>yy+57*Math.sin(x/170-i*.11)+
    24*Math.sin(x/73+i*.19)-155*Math.exp(-Math.pow((x-875)/220,2))*Math.sin(i*.09),-60,1260,90);
   s+=line(d,i%7===0?'spark':'ink',i%7===0?2.15:.95,.1+.31*Math.sin((i+2)/37*Math.PI));
  }
  s+=dot(cx,cy,7,'spark',.78);
 }else if(id==='vision-atelier-porcelain'){
  // Delicate living inlay, not a repeating wallpaper. Enamel cracks on the right.
  for(let i=0;i<21;i++){
   const x=62+i*21;
   const d='M '+n(x-130)+' 640 C '+n(x+70)+' '+n(438-i*3)+' '+n(x-145)+' '+n(210-i*5)+' '+n(x+68)+' -70';
   s+=line(d,i%5===0?'spark':'ink',i%5===0?1.8:.85,.17+.48*Math.sin((i+1)/25*Math.PI));
  }
  for(let i=0;i<32;i++){
   const side=i%2===0?1:-1,y=600-i*19,x=166+96*Math.sin(i*.23)+i*4;
   const tipX=x+side*(46+i%5*11),tipY=y-26-i%4*8;
   const d='M '+n(x)+' '+n(y)+' Q '+n(x+side*43)+' '+n(y-60)+' '+n(tipX)+' '+n(tipY)+' Q '+n(x+side*14)+' '+n(y-4)+' '+n(x)+' '+n(y)+' Z';
   s+=area(d,i%3===0?'rose':'blue',.14+(i%4)*.027);
   s+=line(d,i%6===0?'spark':'ink',i%6===0?1.8:.8,.28);
  }
  for(let i=0;i<19;i++){
   const x=700+i*26,y=-18+(i%5)*21;
   const d='M '+x+' '+y+' l '+n(-20+(i%3)*24)+' '+n(115+i*7)+' l '+n(43-(i%4)*9)+' '+n(95+i*5)+' l '+n(-54+(i%5)*6)+' '+n(138+i*3)+' l '+n(51-(i%3)*17)+' 230';
   s+=line(d,i%5===0?'spark':'ink',i%5===0?2.1:.83,.2+.43*(1-i/22));
  }
  for(let i=0;i<12;i++){
   const x=805+i*29,y=130+i%4*101;
   s+=dot(x,y,i%4===0?3:1.4,'spark',.24);
  }
 }
 return s;
}
