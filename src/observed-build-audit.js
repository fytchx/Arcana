/**
 * Read-only audit of real screenshot data that the existing Build Studio
 * editors cannot yet represent (sockets, talismans, exact rune secondary icons,
 * measured whole-character sheet and guild context). No invented point ranks.
 */
import {statName} from './labs-engine.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pretty=x=>typeof x==='number'?x.toLocaleString('en-US',{maximumFractionDigits:2}):esc(x);
const statLabels={
 gearScore:'Gear score',maxHealth:'Max health',attackMin:'Attack minimum',
 attackMax:'Attack maximum',defense:'Defense',
 damageReductionPercent:'Damage reduction',damageReductionRawPercent:'Raw damage reduction',
 strengthDisplayed:'Strength',dexterity:'Dexterity',intelligence:'Intelligence',
 critChancePercent:'Critical chance',critDamagePercent:'Critical damage',
 doubleHitChancePercent:'Double Hit chance',doubleDamageChancePercent:'Double Damage chance',
 dodgeChancePercent:'Dodge chance',blockChancePercent:'Block chance',
 blockChanceRawPercent:'Raw block chance',bossDamagePercent:'Boss damage',
 retaliationMin:'Retaliation minimum',retaliationMax:'Retaliation maximum',
 retaliationAverage:'Retaliation average'
};
const percentKeys=new Set(Object.keys(statLabels).filter(x=>/Percent$/.test(x)));
const row=(label,value)=>'<div class="obsLine"><span>'+esc(label)+'</span><b>'+pretty(value)+'</b></div>';
function itemTable(items,wrapper){
 return items.map(item=>wrapper(item)).join('');
}
const sums=values=>'<ul class="obsList">'+values.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
function equipment(o){
 return '<div class="obsCards">'+o.equipment.map(g=>'<details class="obsCard"><summary>'+
  '<strong>'+esc(g.name)+'</strong><span>'+esc(g.slot)+' · '+esc(g.rarity)+' · '+esc(g.stage)+'</span>'+
  '<small>'+esc(g.base||'')+'</small></summary><div class="obsCardBody">'+
  row('Exact Drop Bonus',(g.bonusId==='thorned'?'Reflecting':g.bonusId==='armored'?'Armored':statName(g.bonusId))+' +'+pretty(g.roll)+'% (tier '+pretty(g.bonusTier)+')')+
  '<h5>Five observed item affixes</h5>'+sums(g.affixes)+
  '<h5>Socketed gems</h5>'+(g.gems.length?sums(g.gems):'<p>Gem details not visible in the submitted screen.</p>')+
  '</div></details>').join('')+'</div>';
}
function pets(o){
 return '<div class="obsCards">'+o.pets.map(p=>
  '<details class="obsCard"><summary><strong>'+esc(p.name)+' +'+p.compound+'</strong>'+
  '<span>'+esc(p.rarity)+' · '+esc(statName(p.hatchBonus))+' +'+pretty(p.observedHatchPercent)+'%</span>'+
  '<small>Affixes '+p.affixes.length+'/4</small></summary><div class="obsCardBody">'+
  sums(p.affixes.map(a=>a.label+' Lv '+a.level+' · '+a.observedValue))+
  '</div></details>').join('')+'</div>';
}
function runes(o){
 const map=new Map(o.runes.grid.map(r=>[r.x+','+r.y,r]));
 let body='';
 for(let y=0;y<o.runes.rows;y++){
  const skip=new Set();
  for(let x=0;x<o.runes.columns;x++){
   if(skip.has(x))continue;
   const rune=map.get(x+','+y);
   if(!rune){body+='<div class="obsRuneEmpty"></div>';continue}
   body+='<div class="obsRune obsRune-'+esc(rune.family.toLowerCase())+'" style="grid-column:span '+rune.width+'" title="'+
    esc(rune.family+' · Level '+rune.level)+'"><b>'+esc(rune.family[0])+'</b><small>'+rune.level+'</small></div>';
   for(let k=1;k<rune.width;k++)skip.add(x+k);
  }
 }
 return '<div class="obsRuneGrid" style="--obs-columns:'+o.runes.columns+'">'+body+'</div>'+
  '<p class="obsCaution">Preset '+o.runes.preset+' · actual family, position and level observed. Rune secondary types are deliberately left unassigned where icon meanings were not verified.</p>'+
  '<h5>In-game total rune bonuses</h5>'+sums(o.runes.summedBonuses);
}
function talismans(o){
 return '<div class="obsCards">'+o.talismans.map(t=>'<details class="obsCard"><summary><strong>'+esc(t.name)+' +'+t.rank+
  '</strong><span>Max level · '+t.inscriptions+' inscriptions</span></summary><div class="obsCardBody"><h5>Basic stats</h5>'+sums(t.stats)+
  '<h5>Inscribed stats</h5>'+sums(t.inscribed)+
  '<h5>Completed sacrifice bonuses (8/8)</h5>'+sums(Object.entries(t.sacrifices).map(([k,v])=>k+' '+v))+
  '</div></details>').join('')+'</div>';
}
export function observedBuildAudit(build){
 const o=build?.observed;
 if(!o||!o.player||!o.stats||!Array.isArray(o.equipment))return '';
 return '<style>'+
 '.studioPage .obsRoot{margin:18px 0;padding:16px;border:1px solid var(--border,#65749455);border-radius:16px;background:var(--surface,#1c2636);overflow-wrap:anywhere}'+
 '.studioPage .obsRoot h2{font-size:21px;margin:0 0 6px}.studioPage .obsRoot p{line-height:1.55;font-size:13px}'+
 '.studioPage .obsTabs{display:flex;flex-wrap:wrap;gap:6px}.studioPage .obsTabs button{padding:9px 11px;cursor:pointer;background:transparent;color:inherit;border:1px solid #8498ba66;border-radius:10px;font-size:12px;color:inherit;text-decoration:none}'+
 '.studioPage .obsGroup{padding-top:12px;margin-top:12px;border-top:1px solid #8698a33b}'+
 '.studioPage .obsLine{display:flex;gap:15px;justify-content:space-between;padding:8px 0;border-bottom:1px solid #8698a322;font-size:13px}'+
 '.studioPage .obsLine b{text-align:right;font-variant-numeric:tabular-nums}'+
 '.studioPage .obsGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:1px 18px}'+
 '.studioPage .obsCards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr));gap:10px}'+
 '.studioPage .obsCard{border:1px solid #8498ba55;border-radius:12px;min-width:0}'+
 '.studioPage .obsCard summary{padding:12px;cursor:pointer;display:grid;gap:4px;min-height:56px}'+
 '.studioPage .obsCard summary span,.studioPage .obsCard summary small{font-size:12px;opacity:.8}'+
 '.studioPage .obsCardBody{padding:0 13px 14px}.studioPage .obsList{font-size:12px;line-height:1.7;padding-left:20px}'+
 '.studioPage .obsCaution{border:1px solid #d5ad5d77;border-radius:9px;padding:11px}'+
 '.studioPage .obsRuneGrid{display:grid;grid-template-columns:repeat(var(--obs-columns),minmax(0,1fr));grid-auto-rows:57px;gap:3px}'+
 '.studioPage .obsRune{border:1px solid #ffffff55;border-radius:6px;display:grid;place-content:center;text-align:center;background:#573152;color:#fefefe}'+
 '.studioPage .obsRune-vitality{background:#366544}.studioPage .obsRune-precision{background:#214f84}.studioPage .obsRune-wisdom{background:#653370}'+
 '.studioPage .obsRune b{font-size:19px}.studioPage .obsRune small{font-size:10px}.studioPage .obsRuneEmpty{opacity:.2;background:#555}'+
 '@media(max-width:410px){.studioPage .obsRoot{padding:11px}.studioPage .obsRuneGrid{grid-auto-rows:45px}.studioPage .obsLine{font-size:12px}}'+
 '</style><section class="obsRoot" aria-label="Player screenshot build audit">'+
 '<span class="eyebrow">CURRENT BUILD · '+esc(o.captured)+'</span>'+ 
 '<h2>Current Warrior loadout</h2>'+ 
 '<p>Character stats and equipped bonuses as recorded on '+esc(o.captured)+'. Some game details are not editable in Build Studio yet.</p>'+
 '<nav class="obsTabs" aria-label="Observed build sections">'+
 ['stats','equipment','pets','runes','talismans','guild','unknown'].map(s=>'<button type="button" data-action="obsjump" data-arg="'+s+'" data-obs-jump="'+s+'">'+s[0].toUpperCase()+s.slice(1)+'</button>').join('')+'</nav>'+
 '<section class="obsGroup" id="obs-stats"><h3>Character stats · Lv '+o.player.characterLevel+' / ML '+o.player.monsterLevel+'</h3>'+
 '<div class="obsGrid">'+row('Gear score',o.player.gearScore)+Object.entries(o.stats).map(([k,v])=>
  row(statLabels[k]||statName(k),percentKeys.has(k)?pretty(v)+'%':v)).join('')+'</div></section>'+
 '<section class="obsGroup" id="obs-equipment"><h3>Equipment · '+o.equipment.length+' captured slots</h3>'+equipment(o)+'</section>'+
 '<section class="obsGroup" id="obs-pets"><h3>Four active pets and exact affix levels</h3>'+pets(o)+'</section>'+
 '<section class="obsGroup" id="obs-runes"><h3>Rune preset 3 · screenshot layout</h3>'+runes(o)+'</section>'+
 '<section class="obsGroup" id="obs-talismans"><h3>Two equipped talismans</h3>'+talismans(o)+'</section>'+
 '<section class="obsGroup" id="obs-guild"><h3>Guild context · '+esc(o.guild.name)+'</h3>'+
 '<div class="obsGrid">'+Object.entries(o.guild.bonusPct).map(([k,v])=>row(statName(k),pretty(v)+(k.startsWith('flat')?'':'%'))).join('')+
 row('Guild bonus boost',o.guild.boostPercent+'%')+'</div></section>'+
 '<section class="obsGroup" id="obs-unknown"><h3>Still missing from this capture</h3>'+sums(o.unresolved)+
 '<p class="obsCaution">Visible Build Studio editors are narrower than the in-game screens. Exact item stage and enhancement, all gem sockets, talismans and screenshot-only rune details are preserved in this read-only audit instead of being silently invented as editable objects.</p></section>'+
 '</section>';
}
