/* Pathfinder Monster Level XP. Screenshot-calibrated estimates, not a
 * recovered IdleArc server formula. One-shot comparison assumes fighting ML
 * equals selected progression ML; the user picks only ML and biome.
 * Source research: docs/ML-XP-SCREENSHOT-CALIBRATION-2026-10-28.md on preview.
 */
export const PATHFINDER_ML_MIN=1;
export const PATHFINDER_ML_MAX=500;
export const PATHFINDER_ML_BIOMES=Object.freeze([
 // Ordered biome progression. Unlock MLs come directly from the game's
 // 2026-10-28-005 live /api/config/game biomes[] records.
 ['verdant','Verdant Woods',4,0],['scorched','Scorched Sands',6,10],
 ['murky','Murky Depths',8,30],['frozen','Frozen Peaks',10,45],
 ['shadow','Shadow Realm',14,65],['infernal','Infernal Pits',20,90],
 ['elder','Elderwood',24,115],['glass','Glasslands',27,150],
 ['drowned','Drowned Abyss',30,185],['summit','Shattered Summit',33,220],
 ['rift','Umbral Rift',36,260],['crown',"Oblivion's Crown",39.6,300]
].map(([id,name,base,unlockMl],index)=>Object.freeze({id,name,base,unlockMl,order:index+1})));
/* Newly reset player reports (October 29). K-labelled values are rounded
 * displays, not verified to the last XP. ML 4=140 is preserved even though
 * the nearby linear pattern predicts 130.
 */
export const PATHFINDER_ML_EARLY_REPORTS=Object.freeze({
 2:78,4:140,5:156,6:182,7:208,8:234,9:260,
 10:400,11:437,12:473,13:510,14:546,
 15:584,16:626,17:671,18:720,19:771,21:886,22:949,
 23:1010,24:1080,25:1160,26:1240,27:1310,28:1400,29:1490,
 30:2250,42:4200
});
export const PATHFINDER_ML_EARLY_ROUNDED=Object.freeze([23,24,25,26,27,28,29,30,42]);
export const PATHFINDER_ML_OBSERVED=Object.freeze({
 2:'78',4:'140',5:'156',6:'182',7:'208',8:'234',9:'260',
 10:'400',11:'437',12:'473',13:'510',14:'546',
 15:'584',16:'626',17:'671',18:'720',19:'771',21:'886',22:'949',
 23:'1.01K',24:'1.08K',25:'1.16K',26:'1.24K',27:'1.31K',
 28:'1.40K',29:'1.49K',30:'2.25K',42:'4.2K',184:'124.49K',
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
const clamp=(value,min,max,fallback)=>{
 const n=Number(value);
 return Number.isFinite(n)?Math.min(max,Math.max(min,Math.trunc(n))):fallback;
};
const lastUnlocked=level=>[...PATHFINDER_ML_BIOMES].reverse().find(b=>b.unlockMl<=level);
export function normalizePathfinderMlXp(raw={}){
 const level=clamp(raw?.level??300,PATHFINDER_ML_MIN,PATHFINDER_ML_MAX,300);
 const target=clamp(raw?.target??Math.min(level+10,PATHFINDER_ML_MAX),level,PATHFINDER_ML_MAX,Math.min(level+10,PATHFINDER_ML_MAX));
 const progress=clamp(raw?.progress??0,0,99,0);
 const requested=PATHFINDER_ML_BIOMES.find(b=>b.id===raw?.biome&&b.unlockMl<=level);
 const biome=(requested||lastUnlocked(level)).id;
 // Prior saved plans have no farmMode. Migrate them to Auto.
 const farmMode=raw?.farmMode==='fixed'?'fixed':'auto';
 return {level,target,progress,biome,farmMode};
}
export function readPathfinderMlXp(store=globalThis.localStorage){
 try{return normalizePathfinderMlXp(JSON.parse(store?.getItem(STORE)||'null')||{})}
 catch{return normalizePathfinderMlXp()}
}
export function savePathfinderMlXp(raw,store=globalThis.localStorage){
 const plan=normalizePathfinderMlXp(raw);
 try{store?.setItem(STORE,JSON.stringify(plan))}catch{}
 return plan;
}
export function requiredMlXp(level){
 if(!Number.isInteger(level)||level<PATHFINDER_ML_MIN||level>PATHFINDER_ML_MAX)return null;
 // Exact or rounded reported values take precedence over fitted models.
 if(Object.hasOwn(PATHFINDER_ML_EARLY_REPORTS,level))return PATHFINDER_ML_EARLY_REPORTS[level];
 if(level<=9)return Math.round(26*(level+1)); // ML 1 and 3 extrapolated.
 if(level<=14)return Math.round(26*(level+1)*1.4);
 if(level<=29){const x=level-15;return Math.round(585+39*x+1.82*x*x);}
 if(level<=184){
  // Monotone power-law interpolation through ML 30 = 2.25K,
  // ML 42 = 4.2K and ML 184 = 124.49K. ML 43–183 is PROVISIONAL.
  return Math.round(0.04708457816641641*Math.pow(level+17.794012648560958,2.786338983223726));
 }
 const z=(level-300)/100;
 // Screenshot-calibrated ML 185–500 polynomial, not exact server math.
 return Math.round(Math.max(0,598801.760018+z*(631551.611753+z*(202096.479878+
   z*(-3048.16010589+z*(-10654.7857437+z*(58.3786439647+z*412.03319736)))))));
}
const round2=n=>Math.round((n+Number.EPSILON)*100)/100;
const fmt=n=>Math.round(n).toLocaleString('en-US');
const compact=n=>n===0?'0':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(2)+'K':fmt(n);
export const IDEAL_ML_KILLS_PER_SECOND=1;
export function formatMlEta(seconds){
 if(!Number.isFinite(seconds)||seconds<0)return 'Unknown';
 const minutes=Math.ceil(seconds/60);
 const days=Math.floor(minutes/1440),hours=Math.floor((minutes%1440)/60),mins=minutes%60;
 return [days&&days+'d',hours&&hours+'h',(mins||(!hours&&!days))&&mins+'m'].filter(Boolean).join(' ');
}
export function calculatePathfinderMlXp(raw={}){
 const plan=normalizePathfinderMlXp(raw),{level,target,progress,farmMode}=plan;
 const fixedBiome=PATHFINDER_ML_BIOMES.find(b=>b.id===plan.biome);
 const variants=[
  {id:'weak',label:'Weakest',delta:'−10%',kills:0},
  {id:'normal',label:'Regular',delta:'Normal',kills:0},
  {id:'strong',label:'Strongest',delta:'+10%',kills:0}
 ];
 let required=0,firstRequired=0;
 const zones=[],segments=[];
 // Recalculate at *every* progression ML; a single-level estimate multiplied
 // by the level gap would be very inaccurate. Target ML is exclusive.
 for(let ml=level;ml<target;ml++){
  const biome=farmMode==='fixed'?fixedBiome:lastUnlocked(ml);
  if(zones.at(-1)?.id!==biome.id)zones.push({id:biome.id,name:biome.name,unlockMl:biome.unlockMl,start:ml});
  const needed=Math.ceil(requiredMlXp(ml)*(ml===level?(100-progress)/100:1));
  if(ml===level)firstRequired=needed;
  required+=needed;
  // Low ML biome cards show a 0.375 multiplier at ML 10 and ML 30
  // (Verdant 1.5, Scorched 2.25, Murky 3). Infer a floor, not server logic.
  const base=round2(biome.base*Math.max(0.375,1+(ml-280)/400));
  const perLevel=[];
  for(const v of variants){
   const modifier=biome.order<=2?1:v.id==='weak'?.9:v.id==='strong'?1.1:1;
   const xpPerKill=round2(base*modifier);
   const kills=needed?Math.ceil(needed/xpPerKill):0;
   v.kills+=kills;
   perLevel.push({id:v.id,xpPerKill,kills});
  }
  segments.push({level:ml,biome:biome.id,needed,perLevel});
 }
 for(const v of variants){
  v.etaSeconds=v.kills/IDEAL_ML_KILLS_PER_SECOND;
  v.etaDisplay=formatMlEta(v.etaSeconds);
 }
 const highestUnlocked=lastUnlocked(level);
 const nextBiome=PATHFINDER_ML_BIOMES.find(b=>b.unlockMl>level)||null;
 const currentBiome=farmMode==='auto'?highestUnlocked:fixedBiome;
 const earlyEstimated=segments.some(s=>s.level<185);
 const sparseEstimated=segments.some(s=>s.level>=43&&s.level<=183);
 return {plan,level,target,progress,required,requiredDisplay:compact(required),
  earlyEstimated,sparseEstimated,
  requiredFullLevel:requiredMlXp(level),firstRequired,variants,
  biome:currentBiome,highestUnlocked,nextBiome,zones,segments,
  levels:target-level,modifiersAvailable:zones.length?zones.some(z=>PATHFINDER_ML_BIOMES.find(b=>b.id===z.id).order>2):currentBiome.order>2,
  isComplete:level===target};
}
export function pathfinderMlXpResults(raw={}){
 const m=calculatePathfinderMlXp(raw),regular=m.variants[1];
 const cards=m.variants.map(v=>
  '<article class="pathMlCard pathMlJourneyCard pathMlCard--'+v.id+'">'+
  '<div class="pathMlCardHead"><span class="pathMlCardSymbol" aria-hidden="true">'+(v.id==='weak'?'−':v.id==='normal'?'◆':'+')+'</span>'+
  '<div><small>'+v.delta+'</small><strong>'+v.label+'</strong></div></div>'+
  '<div class="pathMlCardEta"><span>Ideal ETA</span><strong>≈'+v.etaDisplay+'</strong></div>'+
  '<div class="pathMlJourneyKills">≈'+fmt(Math.round(v.kills/10)*10)+' <span>kills</span></div>'+
  '</article>').join('');
 const route=m.plan.farmMode==='auto'?
  (m.zones.length?m.zones.map(x=>x.name).join(' → '):m.biome.name):
  m.biome.name+' (fixed)';
 return '<section class="pathMlResultsBody pathMlJourneyResults">'+
  '<div class="pathMlJourneyHero">'+
   '<div class="pathMlJourneyHeroHead"><span class="pathMlOverline">ML '+m.level+' → '+m.target+'</span><span class="pathMlJourneyPace">1 qualifying kill/sec · ideal</span></div>'+
   '<div class="pathMlJourneyHeroGrid"><div><span class="pathMlJourneyHeroLabel">Estimated time</span>'+
   '<div class="pathMlJourneyHeroTime" id="pathMlJourneyEta">≈'+regular.etaDisplay+'</div>'+
   '<span class="pathMlJourneyHeroContext">Regular monsters · one-shot assumption</span></div>'+
   '<div class="pathMlJourneyHeroStats"><div><small>Total ML XP</small><strong id="pathMlTotalXp">≈'+m.requiredDisplay+'</strong></div>'+
   '<div><small>Estimated kills</small><strong id="pathMlTotalKills">≈'+fmt(Math.round(regular.kills/10)*10)+'</strong></div>'+
   '</div></div></div>'+
  '<div class="pathMlCompareIntro"><div><strong>Monster comparison</strong><span>Full journey · '+m.levels+' levels</span></div><small>−10% / Normal / +10%</small></div>'+
  '<div class="pathMlCards">'+cards+'</div>'+
  '<div class="pathMlJourneyRoute"><span class="pathMlZoneReady">Farming route</span><span>'+route+'</span></div>'+
  (m.earlyEstimated?'<p class="pathMlEstimateNotice"><strong>Early ML estimates.</strong> '+(m.sparseEstimated?
    'ML 43–183 is interpolated between limited player observations; results may differ from the game.':
    'Low-level results use player reports and fitted values between observations.')+'</p>':'')+
  (m.isComplete?'<p class="pathMlNote">You are already at the target Monster Level. Choose a higher target to estimate additional progress.</p>':'')+
  (!m.modifiersAvailable?'<p class="pathMlNote">The first two biomes do not receive the ±10% monster-position bonuses.</p>':'')+
  '<p class="pathMlDisclaimer">Estimates assume one-shotting at each selected ML, starting '+(m.progress?m.progress+'% through your current level':'at 0% progress')+'. Ideal ETA uses one ML XP-awarding kill per second without downtime. Automatic biome progression assumes you can one-shot in each newly unlocked biome. Actual times vary; Frenzy kills do not award ML XP. XP requirements are screenshot-based estimates, not an exact server formula.</p>'+
  '</section>';
}
export function pathfinderMlXpView(raw={}){
 const m=calculatePathfinderMlXp(raw),p=m.plan;
 const options=PATHFINDER_ML_BIOMES.map(b=>
  '<option value="'+b.id+'" data-unlock-ml="'+b.unlockMl+'"'+(b.id===p.biome?' selected':'')+
  (b.unlockMl>p.level?' disabled':'')+'>'+b.name+(b.unlockMl>p.level?' · Unlocks ML '+b.unlockMl:'')+'</option>').join('');
 const quicks=[1,5,10,25,50].map(delta=>
  '<button type="button" data-path-ml-target-add="'+delta+'"'+(p.target===Math.min(p.level+delta,500)?' class="active" aria-pressed="true"':' aria-pressed="false"')+'>+'+delta+'</button>').join('');
 return '<section class="pathMlXp pathMlJourney" id="pathMlXpPanel" aria-label="Pathfinder ML XP planner">'+
  '<div class="pathMlIntro"><div><span class="pathMlEyebrow">PATHFINDER / LEVELING</span>'+
  '<h2>Monster Level XP</h2><p>Estimate total XP, kills and time between two Monster Levels.</p></div></div>'+
  '<div class="pathMlControls pathMlJourneyControls">'+
   '<div class="pathMlJourneyLevels">'+
   '<label class="pathMlJourneyLevelField" for="pathMlCurrent"><span>Current ML</span><input id="pathMlCurrent" type="number" data-path-ml-current min="1" max="500" step="1" inputmode="numeric" value="'+p.level+'"></label>'+
   '<span class="pathMlJourneyArrow" aria-hidden="true">→</span>'+
   '<label class="pathMlJourneyLevelField" for="pathMlTarget"><span>Target ML</span><input id="pathMlTarget" type="number" data-path-ml-target min="'+p.level+'" max="500" step="1" inputmode="numeric" value="'+p.target+'"></label></div>'+
   '<div class="pathMlJourneyQuick"><small>Quick target</small><div id="pathMlTargetPresets">'+quicks+'<button type="button" data-path-ml-target-end="'+PATHFINDER_ML_MAX+'"'+(p.target===500?' class="active" aria-pressed="true"':' aria-pressed="false"')+'>ML 500</button></div></div>'+
   '<details class="pathMlJourneyFold" data-path-ml-progress-fold><summary>Current level progress <span id="pathMlProgressSummary">'+(p.progress?p.progress+'%':'Optional')+'</span></summary>'+
   '<div class="pathMlJourneyFoldBody"><label for="pathMlProgress">Progress toward ML '+(p.level+1)+'</label>'+
   '<div class="pathMlProgressLine"><input id="pathMlProgress" data-path-ml-progress type="range" min="0" max="99" step="1" value="'+p.progress+'" style="--path-ml-fill:'+p.progress+'%"><strong id="pathMlProgressValue">'+p.progress+'%</strong></div>'+
   '<div class="pathMlBounds"><span>0%</span><span>99%</span></div></div></details>'+
   '<details class="pathMlJourneyFold" data-path-ml-farming-fold><summary>Farming settings <span id="pathMlFarmingSummary">'+(p.farmMode==='auto'?'Auto zones':'Fixed biome')+'</span></summary>'+
   '<div class="pathMlJourneyFoldBody"><label for="pathMlFarmMode">Biome progression</label><select id="pathMlFarmMode" data-path-ml-mode>'+
    '<option value="auto"'+(p.farmMode==='auto'?' selected':'')+'>Auto · highest unlocked each level</option>'+
    '<option value="fixed"'+(p.farmMode==='fixed'?' selected':'')+'>Farm one biome throughout</option></select>'+
   '<div class="pathMlJourneyBiome" data-path-ml-fixed-wrap'+(p.farmMode!=='fixed'?' hidden':'')+'><label for="pathMlBiome">Farming biome</label>'+
   '<select id="pathMlBiome" data-path-ml-biome>'+options+'</select></div>'+
   '<p>Auto follows biome unlocks. Use a fixed biome if you cannot one-shot the newly unlocked monsters.</p></div></details>'+
  '</div>'+
  '<div id="pathMlXpResults" aria-live="polite">'+pathfinderMlXpResults(p)+'</div>'+
 '</section>';
}
