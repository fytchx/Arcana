// Lightweight design contrast checks, not a guarantee of full WCAG compliance.
// Transparent patterns, images and hover states still need real device review.
const valid=x=>/^#[0-9a-fA-F]{6}$/.test(String(x||''));
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
const linear=v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);
const luminance=hex=>rgb(hex).reduce((n,v,i)=>n+linear(v)*[.2126,.7152,.0722][i],0);
export function contrastRatio(a,b){
 if(!valid(a)||!valid(b))return 0;
 const l1=luminance(a),l2=luminance(b);
 return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
}
export function themeReadability(design){
 return [
  {id:'base',name:'Page text',ratio:contrastRatio(design.text,design.main)},
  {id:'card',name:'Panel text',ratio:contrastRatio(design.text,design.card)},
  {id:'button',name:'Button label',ratio:contrastRatio(design.buttonText,design.action)}
 ].map(x=>({...x,pass:x.ratio>=4.5}));
}
export function suggestedButtonText(design){
 const candidates=['#FFFFFF','#0D1019'];
 return candidates.sort((a,b)=>contrastRatio(b,design.action)-contrastRatio(a,design.action))[0];
}
