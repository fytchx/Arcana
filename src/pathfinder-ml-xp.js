/* Pathfinder Monster Level XP. Screenshot-calibrated estimates, not a
 * recovered IdleArc server formula. One-shot comparison assumes fighting ML
 * equals selected progression ML; the user picks only ML and biome.
 * Source research: docs/ML-XP-SCREENSHOT-CALIBRATION-2026-10-28.md on preview.
 */
export const PATHFINDER_ML_MIN=185;
export const PATHFINDER_ML_MAX=500;
export const PATHFINDER_ML_BIOMES=Object.freeze([
 ['verdant','Verdant Woods',4],['scorched','Scorched Sands',6],
 ['murky','Murky Depths',8],['frozen','Frozen Peaks',10],
 ['shadow','Shadow Realm',14],['infernal','Infernal Pits',20],
 ['elder','Elderwood',24],['glass','Glasslands',27],
 ['drowned','Drowned Abyss',30],['summit','Shattered Summit',33],
 ['rift','Umbral Rift',36],['crown',"Oblivion's Crown",39.6]
].map(([id,name,base],index)=>Object.freeze({id,name,base,order:index+1})));
export const PATHFINDER_ML_OBSERVED=Object.freeze({
 210:'189.52K',216:'207.52K',234:'268.89K',247:'320.47K',
 250:'333.27K',260:'378.44K',262:'387.94K',271:'432.65K',
 284:'502.93K',285:'508.62K',290:'537.67K',291:'543.6K',
 297:'580.04K',303:'617.93K',304:'624.39K',307:'644K',
 310:'663.97K',312:'677.49K',315:'698.07K',317:'711.98K',
 328:'791.35K',329:'798.8K',332:'821.38K',337:'859.79K',
 355:'1.01M',356:'1.01M',377:'1.2M',400:'1.42M',
 420:'1.62M',482:'2.3M'
});
const STORE='arcana-pathfinder-ml-xp-v1';
const clampLevel=value=>{
 const n=Number(value);
 return Number.isFinite(n)?Math.min(PATHFINDER_ML_MAX,Math.max(PATHFINDER_ML_MIN,Math.trunc(n))):300;
};
export function normalizePathfinderMlXp(raw={}){
 return {level:clampLevel(raw?.level??300),
  biome:PATHFINDER_ML_BIOMES.some(b=>b.id===raw?.biome)?raw.biome:'crown'};
}
export function readPathfinderMlXp(store=globalThis.localStorage){
 try{return normalizePathfinderMlXp(JSON.parse(store?.getItem(STORE)||'null')||{})}
 catch{return normalizePathfinderMlXp()}
}
export function savePathfinderMlXp(raw,store=globalThis.localStorage){
 const value=normalizePathfinderMlXp(raw);
 try{store?.setItem(STORE,JSON.stringify(value))}catch{}
 return value;
}
export function requiredMlXp(level){
 if(!Number.isInteger(level)||level<PATHFINDER_ML_MIN||level>PATHFINDER_ML_MAX)return null;
 const z=(level-300)/100;
 // Weighted polynomial fitted to rounded screenshot XP; bounded, empirical.
 // Never represent this equation as the official server leveling formula.
 return Math.round(Math.max(0,598801.760018+z*(631551.611753+z*(202096.479878+
   z*(-3048.16010589+z*(-10654.7857437+z*(58.3786439647+z*412.03319736)))))));
}
const round2=n=>Math.round((n+Number.EPSILON)*100)/100;
const fmt=n=>n.toLocaleString('en-US',{maximumFractionDigits:0});
const compact=n=>n>=1e6?(n/1e6).toFixed(2)+'M':(n/1e3).toFixed(2)+'K';
export function calculatePathfinderMlXp(raw={}){
 const plan=normalizePathfinderMlXp(raw),{level}=plan;
 const biome=PATHFINDER_ML_BIOMES.find(b=>b.id===plan.biome);
 const required=requiredMlXp(level);
 const base=round2(biome.base*(1+(level-280)/400));
 const variants=[
  {id:'weak',label:'Weakest',delta:'−10%',modifier:biome.order<=2?1:0.9},
  {id:'normal',label:'Regular',delta:'Normal',modifier:1},
  {id:'strong',label:'Strongest',delta:'+10%',modifier:biome.order<=2?1:1.1}
 ].map(v=>{
  const xpPerKill=round2(base*v.modifier);
  return {...v,xpPerKill,kills:Math.ceil(required/xpPerKill)};
 });
 return {plan,level,biome,required,requiredDisplay:compact(required),
  observed:PATHFINDER_ML_OBSERVED[level]||null,base,variants,
  modifiersAvailable:biome.order>2};
}
export function pathfinderMlXpResults(raw={}){
 const m=calculatePathfinderMlXp(raw);
 const cards=m.variants.map(v=>
  '<article class="pathMlCard pathMlCard--'+v.id+'">'+
   '<div class="pathMlCardHead"><span class="pathMlCardSymbol" aria-hidden="true">'+
    (v.id==='weak'?'−':v.id==='normal'?'◆':'+')+'</span>'+
    '<div><small>'+v.delta+'</small><strong>'+v.label+'</strong></div></div>'+
   '<div class="pathMlKillValue">≈'+fmt(Math.round(v.kills/10)*10)+'</div>'+
   '<div class="pathMlKillLabel">kills per level</div>'+
   '<div class="pathMlCardFoot"><span>XP / kill</span><strong>'+v.xpPerKill.toFixed(2)+'</strong></div>'+
  '</article>').join('');
 return '<section class="pathMlResultsBody">'+
  '<div class="pathMlRequired"><div><span class="pathMlOverline">XP TO REACH ML '+(m.level+1)+'</span>'+
   '<div class="pathMlRequiredValue">≈'+m.requiredDisplay+'</div>'+
   '<p>'+(m.observed?'Matches a player screenshot ('+m.observed+').':'Estimated from the ML XP screenshot curve.')+'</p></div>'+
   '<div class="pathMlRequiredSeal" aria-hidden="true"><span>ML</span><strong>'+m.level+'</strong></div></div>'+
  '<div class="pathMlCompareIntro"><div><strong>One-shot kill comparison</strong>'+
  '<span>'+m.biome.name+' · fighting ML '+m.level+'</span></div>'+
  '<small>Fewer kills is better</small></div>'+
  '<div class="pathMlCards">'+cards+'</div>'+
  (!m.modifiersAvailable?'<p class="pathMlNote">Verdant Woods and Scorched Sands do not use the ±10% monster-position modifier. All three outcomes are therefore identical.</p>':'')+
  '<p class="pathMlDisclaimer">Approximate full-level kills, starting at zero ML XP. Assumes one normal XP-awarding kill per monster, one-shotting, and fighting at the selected ML. Includes no extra-kill XP, time estimates, or player-specific bonuses. Based on observed screenshots, not a recovered game formula.</p>'+
 '</section>';
}
export function pathfinderMlXpView(raw={}){
 const m=calculatePathfinderMlXp(raw),level=m.level;
 const options=PATHFINDER_ML_BIOMES.map(b=>'<option value="'+b.id+'"'+(b.id===m.biome.id?' selected':'')+'>'+b.name+'</option>').join('');
 const jumps=[200,250,300,350,400,450,500].map(n=>
  '<button type="button" data-path-ml-preset="'+n+'"'+(n===level?' class="active" aria-pressed="true"':' aria-pressed="false"')+'>'+n+'</button>').join('');
 return '<section class="pathMlXp" id="pathMlXpPanel" aria-label="Pathfinder ML XP estimates">'+
  '<div class="pathMlIntro"><div><span class="pathMlEyebrow">PATHFINDER / LEVELING</span>'+
  '<h2>Monster Level XP</h2><p>Know the XP. Know the kills. Keep pushing.</p></div>'+
  '<span class="pathMlOneShot"><span aria-hidden="true">✦</span> ONE-SHOT MODE</span></div>'+
  '<div class="pathMlControls">'+
   '<div class="pathMlLevelTop"><label for="pathMlLevelNumber">Your Monster Level</label>'+
    '<span>ML <strong id="pathMlCurrentLabel">'+level+'</strong> <small>→ '+(level+1)+'</small></span></div>'+
   '<div class="pathMlLevelButtons"><button type="button" data-path-ml-step="-1" aria-label="Previous Monster Level">−</button>'+
    '<input id="pathMlLevelNumber" data-path-ml-level type="number" inputmode="numeric" min="185" max="500" step="1" value="'+level+'" aria-label="Monster level from 185 to 500">'+
    '<button type="button" data-path-ml-step="1" aria-label="Next Monster Level">+</button></div>'+
   '<input class="pathMlSlider" data-path-ml-range type="range" min="185" max="500" step="1" value="'+level+'" aria-label="Choose Monster Level" style="--path-ml-fill:'+((level-185)/315*100).toFixed(1)+'%">'+
   '<div class="pathMlBounds"><span>ML 185</span><span>ML 500</span></div>'+
   '<div class="pathMlQuickJumps" aria-label="Jump to a Monster Level">'+jumps+'</div>'+
   '<div class="pathMlBiomeSelect"><div><label for="pathMlBiome">Farming biome</label><small>XP per monster varies by biome</small></div>'+
    '<select id="pathMlBiome" data-path-ml-biome aria-label="Select farming biome">'+options+'</select></div>'+
  '</div>'+
  '<div id="pathMlXpResults" aria-live="polite">'+pathfinderMlXpResults(m.plan)+'</div>'+
 '</section>';
}
