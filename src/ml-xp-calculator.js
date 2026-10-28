/* Screenshot-calibrated Monster Level XP research calculator.
 * NOT the game's verified formula. No extrapolation outside 184-482.
 * XP per kill is estimated only for fighting ML 285-482; manual override is supported.
 */
const STORE='arcana-ml-xp-research-v1';
export const ML_XP_RANGE=Object.freeze({min:184,max:482});
export const ML_XP_SCREENSHOTS=Object.freeze({
 184:'124.49K',247:'320.47K',260:'378.44K',262:'387.94K',
 285:'508.62K',290:'537.67K',291:'543.6K',304:'624.39K',
 312:'677.49K',328:'791.35K',329:'798.8K',332:'821.38K',
 420:'1.62M',482:'2.3M'
});
export const ML_XP_BIOMES=Object.freeze([
 ['verdant','Verdant Woods',4],['scorched','Scorched Sands',6],
 ['murky','Murky Depths',8],['frozen','Frozen Peaks',10],
 ['shadow','Shadow Realm',14],['infernal','Infernal Pits',20],
 ['elder','Elderwood',24],['glass','Glasslands',27],
 ['drowned','Drowned Abyss',30],['summit','Shattered Summit',33],
 ['rift','Umbral Rift',36],['crown',"Oblivion's Crown",39.6]
].map(([id,name,base],i)=>Object.freeze({id,name,base,tier:i+1})));
const escapeHtml=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const nInt=(s,defaultValue,min,max)=>{if(String(s??'').trim()==='')return defaultValue;const v=Number(s);return Number.isFinite(v)?Math.min(max,Math.max(min,Math.trunc(v))):defaultValue};
export function parseMlXpNumber(value){
 const s=String(value??'').trim().replaceAll(',','').replaceAll(' ','');
 const m=s.match(/^(?:\d+(?:\.\d+)?|\.\d+)(?:[kmb])?$/i);
 if(!m)return null;
 const unit=s.match(/[kmb]$/i)?.[0]?.toLowerCase();
 const v=Number(s.replace(/[kmb]$/i,''))*({k:1e3,m:1e6,b:1e9}[unit]||1);
 return Number.isFinite(v)&&v>=0?v:null;
}
export function normalizeMlXpPlan(raw={}){
 const biome=ML_XP_BIOMES.some(b=>b.id===raw?.biome)?raw.biome:'crown';
 const position=['weakest','middle','strongest'].includes(raw?.position)?raw.position:'middle';
 const text=(v,max=24)=>String(v??'').slice(0,max);
 return {level:nInt(raw?.level,332,184,482),biome,position,
  fighting:text(raw?.fighting),current:text(raw?.current),measured:text(raw?.measured),killsPerSecond:text(raw?.killsPerSecond||'1.5')};
}
export function readMlXpPlan(store=globalThis.localStorage){
 try{return normalizeMlXpPlan(JSON.parse(store.getItem(STORE)||'null')||{})}catch{return normalizeMlXpPlan()}
}
export function saveMlXpPlan(raw,store=globalThis.localStorage){
 const v=normalizeMlXpPlan(raw);try{store.setItem(STORE,JSON.stringify(v))}catch{}return v;
}
export function modelRequiredXp(level){
 const ml=Number(level);
 if(!Number.isInteger(ml)||ml<ML_XP_RANGE.min||ml>ML_XP_RANGE.max)return null;
 const d=ml-290;
 return Math.max(0,Math.round(-0.0000995216898*d**4+0.00111538776*d**3+20.2268284*d**2+5910.91945*d+537671.59));
}
export function projectMlXp(raw={}){
 const p=normalizeMlXpPlan(raw),needed=modelRequiredXp(p.level);
 const biome=ML_XP_BIOMES.find(b=>b.id===p.biome);
 const fighting=p.fighting.trim()===''?p.level:nInt(p.fighting,NaN,1,1000);
 const factor=biome.tier<=2?1:p.position==='weakest'?0.9:p.position==='strongest'?1.1:1;
 const estimated=Number.isFinite(fighting)&&fighting>=285&&fighting<=482?Math.round(biome.base*(1+(fighting-280)/400)*100)/100:null;
 const observedPerKill=parseMlXpNumber(p.measured);
 const measured=observedPerKill!==null&&observedPerKill>0?observedPerKill:null;
 const base=measured??estimated;
 const perKill=base!==null&&base>0?base*factor:null;
 const current=Math.min(needed,parseMlXpNumber(p.current)??0);
 const remaining=Math.max(0,needed-current);
 const kills=perKill===null?null:Math.ceil(remaining/perKill);
 const fullKills=perKill===null?null:Math.ceil(needed/perKill);
 const rate=parseMlXpNumber(p.killsPerSecond);
 const timeSeconds=kills===null||rate===null||rate<=0?null:kills/rate;
 return {plan:p,needed,remaining,current,biome,fighting,estimated,measured,perKill,factor,kills,fullKills,timeSeconds,
  screenshot:ML_XP_SCREENSHOTS[p.level]||null,killEstimate:measured===null};
}
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const duration=s=>{if(s===null)return 'Add kills/sec';if(s===0)return '0 min';if(s<60)return '<1 min';const h=Math.floor(s/3600),m=Math.round(s%3600/60);return (h>=24?Math.floor(h/24)+'d ':'')+(h%24? h%24+'h ':'')+(m+'m')};
export function mlXpCalculatorView(raw={}){
 const data=projectMlXp(raw),p=data.plan,valid=data.perKill!==null;
 const biomes=ML_XP_BIOMES.map(b=>'<option value="'+b.id+'"'+(b.id===p.biome?' selected':'')+'>'+escapeHtml(b.name)+'</option>').join('');
 const opt=(v,label)=>'<option value="'+v+'"'+(v===p.position?' selected':'')+'>'+label+'</option>';
 return `<section class="mlXpCalc" aria-label="Monster Level XP and kills research calculator">
 <div class="mlXpHeading"><div><span class="eyebrow">SCREENSHOT-BASED RESEARCH · TEST FEATURE</span>
 <h2>Monster Level XP &amp; Kills</h2><p>Estimate XP needed, progression-awarding kills, and time to next ML. Based on player screenshots, <strong>not a recovered game formula</strong>.</p></div>
 <span class="mlXpTag">Experimental</span></div>
 <div class="mlXpControls">
  <label class="mlXpField">Current Monster Level <input data-mlxp="level" type="number" min="184" max="482" step="1" inputmode="numeric" value="${p.level}"><small>Supported model: ML 184–482</small></label>
  <label class="mlXpField">Biome <select data-mlxp="biome">${biomes}</select></label>
  <label class="mlXpField">Monster <select data-mlxp="position">${opt('weakest','Weakest · 90%')}${opt('middle','Middle · 100%')}${opt('strongest','Strongest · 110%')}</select></label>
  <label class="mlXpField">Current ML XP <input data-mlxp="current" type="text" inputmode="decimal" autocomplete="off" value="${escapeHtml(p.current)}" placeholder="e.g. 309.79K"><small>Leave empty to calculate a full level</small></label>
  <label class="mlXpField">Fighting level <input data-mlxp="fighting" type="number" min="1" max="1000" inputmode="numeric" value="${escapeHtml(p.fighting)}" placeholder="Same as ML"><small>Optional. Accounts for farming a lower level</small></label>
  <label class="mlXpField">XP per kill override <input data-mlxp="measured" type="text" inputmode="decimal" autocomplete="off" value="${escapeHtml(p.measured)}" placeholder="Use calculated"><small>Enter biome-card XP if different</small></label>
  <label class="mlXpField">XP-awarding kills/sec <input data-mlxp="killsPerSecond" type="number" min="0.01" max="100" step="any" inputmode="decimal" value="${escapeHtml(p.killsPerSecond)}"><small>Do not include Frenzy or Extra Kills</small></label>
 </div>
 <div class="mlXpResults" aria-live="polite">
  <div><small>XP to ML ${p.level+1}</small><strong>${fmt(data.needed)}</strong><span>${data.screenshot?'Shown in screenshot: '+data.screenshot+' (rounded)':'Empirical curve estimate'}</span></div>
  <div><small>ML XP per normal kill</small><strong>${valid?fmt(data.perKill):'Unknown'}</strong><span>${data.measured!==null?'Using your entered biome XP':'Estimated from biome / fighting ML'}</span></div>
  <div class="mlXpHero"><small>Remaining XP-awarding kills</small><strong>${valid?fmt(data.kills):'Add XP/kill'}</strong><span>${valid?'Full level: '+fmt(data.fullKills)+' kills':'ML XP/kill model only validated for fighting ML 285–482'}</span></div>
  <div><small>Estimated farming time</small><strong>${valid?duration(data.timeSeconds):'Unknown'}</strong><span>Assumes sustained XP-awarding kill rate</span></div>
 </div>
 <div class="mlXpActions"><button type="button" data-action="mlxpreset">Reset ML calculator</button><span>Source: user screenshots · October 2026</span></div>
 <p class="mlXpDisclaimer"><strong>Research estimate, not exact.</strong> XP requirements are fitted to rounded screenshot values. Biome XP scaling is observed only over a limited range; the strongest/weakest modifiers use documented Season 2 mechanics. Actual kill counts can differ due to game rounding, fighting-level effects and unmodeled bonuses. No predictions outside ML 184–482.</p>
 </section>`;
}
