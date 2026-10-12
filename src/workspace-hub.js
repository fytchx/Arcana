import {esc,icon} from './ui.js';
import {navCard,navDestination} from './context-nav.js';

// A lightweight, entirely local overview of actual saved planning state.
// It never invents progress and never sends draft contents over the network.
const count=events=>typeof events==='string'?events.length:0;
const goodNumber=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const heading=(detail)=>'<span class="eyebrow">CONTINUE WHERE YOU LEFT OFF</span><h2>Your workspaces</h2><p>'+esc(detail)+'</p>';
export function resumableWorkspaces({draft=null,guild=null,compound=null,affix=null,farm=null,recent=[]}={}){
 const items=[];
 if(draft?.equipment&&typeof draft==='object'){
  const slots=Object.values(draft.equipment).filter(Boolean).length;
  items.push({...navDestination('build'),label:'Continue Build Studio',detail:(draft.title||'My build')+' · '+slots+' gear slots'});
 }
 if(guild&&(count(guild.events)>0||goodNumber(guild.level,25)!==25||goodNumber(guild.boost,1)!==1)){
  const budget=goodNumber(guild.level,25)+Math.max(0,goodNumber(guild.level,25)-68);
  items.push({...navDestination('guildtree'),label:'Continue Guild Planner',detail:'Level '+guild.level+' · '+count(guild.events)+'/'+budget+' points'});
 }
 if(compound&&(compound.level!==10||compound.rarity!=='legendary'||compound.bonus!=='pet_damage')){
  items.push({...navDestination('compound'),label:'Continue Compound calculation',detail:compound.rarity+' · level '+goodNumber(compound.level)});
 }
 if(affix&&(affix.targetLevel!==10||affix.currentLevel!==1||affix.affix!=='item_quantity')){
  items.push({...navDestination('affixes'),label:'Continue Pet Affix calculation',detail:'From '+goodNumber(affix.currentLevel,1)+' to '+goodNumber(affix.targetLevel,10)});
 }
 const completed=Array.isArray(farm?.times)?farm.times.filter(x=>Number.isFinite(Number(x))&&Number(x)>0).length:0;
 if(completed>0)items.push({...navDestination('farm'),label:'Continue ML farming comparison',detail:completed+' measured kill time'+(completed===1?'':'s')});
 const article=Array.isArray(recent)?recent.find(x=>x?.id&&x?.title):null;
 if(article)items.push({id:'recent-guide',route:'wiki/article',params:{id:article.id},label:'Keep reading',detail:article.title,icon:'book'});
 if(!items.length)return '';
 return '<section class="arcanaResume" aria-label="Continue saved work"><div class="arcanaResumeHead">'+heading('Pick up your last plan or guide without setting it up again.')+'</div><div class="arcanaResumeGrid">'+items.slice(0,6).map(x=>navCard(x)).join('')+'</div></section>';
}
