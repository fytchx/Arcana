import {esc} from './ui.js';
import {sourceMaterialGroups} from './pathfinder-material-groups.js';

const quantity=x=>BigInt(String(x||0)).toLocaleString('en-US');
export function groupedMaterialMarkup(materials,snapshot,catalog=[]){
 const groups=sourceMaterialGroups(materials,snapshot?.materials,catalog);
 return '<div class="pathBiomeGroups">'+groups.map((g,i)=>
  '<details class="pathBiomeGroup" '+(i===0?'open':'')+'><summary><span><strong>'+esc(g.name)+'</strong><small>'+
  (g.tier&&g.tier!=='0'?esc(/^tier/i.test(g.tier)?g.tier:'Tier '+g.tier)+' · ':'')+
  g.materials.length+' material'+(g.materials.length===1?'':'s')+'</small></span><b aria-hidden="true">⌄</b></summary>'+
  '<div class="pathMaterials">'+g.materials.map(m=>
   '<div class="pathMaterial"><span>'+esc(m.name)+(m.sourceMonster?'<small>'+esc(m.sourceMonster)+'</small>':'')+
   '</span><strong>'+quantity(m.quantity)+'</strong></div>'
  ).join('')+'</div></details>').join('')+'</div>';
}
