/* Experimental comparison sandbox. Assumptions are EXPLICIT; this is not a verified game damage formula.
 * Damage factors assume independent crit/double-hit/double-damage chances. */
export const DAMAGE_LAB_KEY='arcana-quick-damage-lab-v1';
export const DAMAGE_STATS=Object.freeze([
 {id:'attackBonus',name:'Attack Damage %',min:0,max:100000},
 {id:'critChance',name:'Crit Chance %',min:0,max:100},
 {id:'critBonus',name:'Extra Crit Damage %',min:0,max:2000},
 {id:'doubleHit',name:'Double Hit Chance %',min:0,max:100},
 {id:'doubleDamage',name:'Double Damage Chance %',min:0,max:100}
]);
const spec=Object.fromEntries(DAMAGE_STATS.map(x=>[x.id,x]));
const clamp=(x,min,max,otherwise=0)=>x===''||x===null||x===undefined?otherwise:Math.max(min,Math.min(max,Number.isFinite(Number(x))?Number(x):otherwise));
export const DEFAULT_DAMAGE_LAB=Object.freeze({
 base:1000000,attackBonus:0,critChance:0,critBonus:50,doubleHit:0,doubleDamage:0,
 triggerRate:0,scope:'hit',aStat:'attackBonus',aValue:10,bStat:'doubleHit',bValue:5
});
export function normalizeDamageLab(input={}){
 const r={...DEFAULT_DAMAGE_LAB};
 if(!input||typeof input!=='object'||Array.isArray(input))return r;
 for(const s of DAMAGE_STATS)r[s.id]=clamp(input[s.id],s.min,s.max,r[s.id]);
 r.base=clamp(input.base,0,1e15,r.base);
 r.triggerRate=clamp(input.triggerRate,0,1000,r.triggerRate);
 r.scope=input.scope==='retaliation'?'retaliation':'hit';
 for(const id of ['aStat','bStat'])if(spec[input[id]])r[id]=input[id];
 for(const id of ['aValue','bValue']){
  const s=spec[r[id==='aValue'?'aStat':'bStat']];
  r[id]=clamp(input[id],s.min,s.max,r[id]);
 }
 return r;
}
export function readDamageLab(store=globalThis.localStorage){try{return normalizeDamageLab(JSON.parse(store?.getItem(DAMAGE_LAB_KEY)||'{}'))}catch{return normalizeDamageLab()}}
export function saveDamageLab(value,store=globalThis.localStorage){const clean=normalizeDamageLab(value);try{store?.setItem(DAMAGE_LAB_KEY,JSON.stringify(clean))}catch{}return clean}
export function theoreticalFactor(x){
 const p=normalizeDamageLab(x);
 return (1+p.attackBonus/100)*(1+p.critChance/100*p.critBonus/100)*(1+p.doubleHit/100)*(1+p.doubleDamage/100);
}
export function estimateDamageLab(raw){
 const p=normalizeDamageLab(raw),baseline=p.base*theoreticalFactor(p);
 const compute=(key,value)=>{const stat=key==='a'?'aStat':'bStat',changed={...p,[p[stat]]:p[key+'Value']};
  const expected=p.base*theoreticalFactor(changed);
  return {field:p[stat],value:p[key+'Value'],expected,gain:baseline>0?(expected/baseline-1)*100:0,delta:expected-baseline,perSecond:p.triggerRate>0?expected*p.triggerRate:null};
 };
 return {input:p,baseline,perSecond:p.triggerRate>0?baseline*p.triggerRate:null,a:compute('a'),b:compute('b')};
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const field=(key,title,value,min,max,help='')=>'<label class="damageField"><span>'+esc(title)+'</span><input type="number" inputmode="decimal" data-damage-field="'+key+'" min="'+min+'" max="'+max+'" step="any" value="'+value+'">'+(help?'<small>'+esc(help)+'</small>':'')+'</label>';
export function damageLabView(raw={}){
 const model=estimateDamageLab(raw),p=model.input;
 const choice=(key)=>'<select aria-label="Stat for '+key+'" data-damage-field="'+key+'">'+DAMAGE_STATS.map(s=>'<option value="'+s.id+'" '+(p[key]===s.id?'selected':'')+'>'+esc(s.name)+'</option>').join('')+'</select>';
 const scenario=(key,name,result)=>'<section class="damageOption"><h3>'+esc(name)+'</h3><label class="damageScenarioSelect"><span>Upgrade which stat?</span>'+choice(key+'Stat')+'</label>'+
 field(key+'Value','New value (%)',p[key+'Value'],0,100000,'Currently: '+p[p[key+'Stat']]+'%')+
 '<div class="damageOutcome"><span>Theoretical improvement</span><strong class="'+(result.gain>=0?'damagePositive':'')+'">'+(result.gain>0?'+':'')+fmt(result.gain)+'%</strong><small>Expected damage / trigger: '+fmt(result.expected)+(result.perSecond!==null?' · Modelled per sec: '+fmt(result.perSecond):'')+'</small></div></section>';
 return '<div class="damageLab" aria-label="Damage Lab"><header class="damageLabHead"><span class="quickEyebrow">EXPERIMENTAL COMPARISON ENGINE</span><h1>Damage Lab</h1><p>Compare two stat upgrades in seconds. No character import or full skill tree required.</p></header>'+
 '<div class="damageModelWarning"><strong>Important: this is a hypothetical damage model, not IdleArc’s verified server formula.</strong> It treats bonus Attack Damage as a linear multiplier, crits as extra hit damage, and Double Hit / Double Damage as independent chances to add one full hit or double damage. Do not use the percentage shown as a guaranteed in-game DPS increase. INT%, class skills and pet scaling are excluded until their formulas are validated.</div>'+
 '<section class="damagePanel"><h2>1. Current stats</h2><div class="damageFieldGrid">'+
 field('base','Unmodified hit / retaliation damage',p.base,0,1e15,'Use a consistent pre-multiplier baseline.')+
 field('attackBonus','Increased Attack Damage %',p.attackBonus,0,100000)+
 field('critChance','Crit Chance %',p.critChance,0,100)+
 field('critBonus','Extra damage on crit %',p.critBonus,0,2000,'50 means a crit does 150% of a non-crit hit.')+
 field('doubleHit','Double Hit Chance %',p.doubleHit,0,100)+
 field('doubleDamage','Double Damage Chance %',p.doubleDamage,0,100)+
 field('triggerRate','Attacks / enemy triggers per sec (optional)',p.triggerRate,0,1000,'Leave 0 for damage per trigger only.')+
 '<label class="damageField"><span>Damage event</span><select data-damage-field="scope"><option value="hit" '+(p.scope==='hit'?'selected':'')+'>Regular hit (hypothetical)</option><option value="retaliation" '+(p.scope==='retaliation'?'selected':'')+'>Retaliation (hypothetical)</option></select></label>'+
 '</div><div class="damageBaseline">Modelled baseline: <strong>'+fmt(model.baseline)+'</strong> damage / trigger'+(model.perSecond!==null?' · '+fmt(model.perSecond)+' /sec at entered trigger rate':'')+'</div></section>'+
 '<section class="damagePanel"><h2>2. Compare upgrades</h2><p>Enter the value you would have <em>after</em> the upgrade, not how many percentage points you add.</p><div class="damageCompareGrid">'+scenario('a','Option A',model.a)+scenario('b','Option B',model.b)+'</div>'+
 '<div class="damageVerdict">'+(Math.abs(model.a.gain-model.b.gain)<.00001?'Both options are equal under these assumptions.':model.a.gain>model.b.gain?'Option A gives the larger modelled increase.':'Option B gives the larger modelled increase.')+'<span>Results update as soon as the inputs change.</span></div></section>'+
 '<div class="damagePanel damageFooter"><strong>Use this as a direction-finding sandbox.</strong> Class-specific, pet-specific and retaliation multipliers are not assumed to use this model. Exact damage comparisons will be enabled as those game formulas are verified. <button type="button" data-route="labs/build">Open Build Studio →</button></div></div>';
}
