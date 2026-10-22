import {mergedSearch} from './verified-search.js';

// Deliberately local and bounded: no network requests on each keystroke.
const fold=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[_-]+/g,' ').trim();
function distance(a,b,max=2){
 if(Math.abs(a.length-b.length)>max)return max+1;
 let prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  const next=[i];let rowMin=next[0];
  for(let j=1;j<=b.length;j++){
   next[j]=Math.min(prev[j]+1,next[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
   rowMin=Math.min(rowMin,next[j]);
  }
  if(rowMin>max)return max+1;
  prev=next;
 }
 return prev[b.length];
}
export function searchAsYouType(query,entries,{limit=8}={}){
 const q=fold(query);if(!q)return {matches:[],guesses:[]};
 const found=mergedSearch(q,[entries],{limit:Math.max(28,limit*4)});
 const strong=found.filter(x=>{
  const title=fold(x.title),words=title.split(/\s+/);
  return title.includes(q)||words.some(word=>word.startsWith(q))||
   fold(x.keywords).split(/\s+/).some(word=>word===q||word.startsWith(q))||
   fold(x.subtitle).split(/\s+/).some(word=>word===q);
 }).slice(0,limit);
 if(strong.length)return {matches:strong,guesses:[]};
 if(q.length<3)return {matches:[],guesses:[]};
 const max=q.length<=4?1:2;
 const choices=new Map();
 for(const item of entries){
  if(!item?.title)continue;
  const title=fold(item.title);
  const words=[...new Set([...title.split(/\s+/),title])].filter(w=>w.length>=3&&Math.abs(w.length-q.length)<=max);
  let best=max+1;
  for(const word of words)best=Math.min(best,distance(q,word,max));
  if(best<=max){
   const key=title;
   if(!choices.has(key)||best<choices.get(key).distance)choices.set(key,{title:item.title,distance:best,item});
  }
 }
 return {matches:[],guesses:[...choices.values()].sort((a,b)=>a.distance-b.distance||a.title.length-b.title.length||a.title.localeCompare(b.title)).slice(0,Math.min(4,limit)).map(x=>({title:x.title,item:x.item}))};
}
