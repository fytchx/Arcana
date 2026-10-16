import {esc,icon} from './ui.js';

// Relative XP multipliers from the official Season 2 v1.3.1 patch.
// No absolute XP values, monster HP or time-to-kill values are assumed.
export const FARM_MODES=['later','earlier'];
export const FARM_TIERS=Object.freeze([
 {id:'weakest',label:'Weakest monster',factor:.9},
 {id:'normal',label:'Other monster',factor:1},
 {id:'strongest',label:'Strongest monster',factor:1.1}
]);
const STORAGE_KEY='arcana-ml-farm-compare-v1';
const parseTime=v=>{
 if(v===null||v===undefined||String(v).trim()==='')return null;
 const n=Number(v);return Number.isFinite(n)&&n>=.01&&n<=300?n:null;
};
export function normalizeFarmPlan(plan={}){
 const values=Array.isArray(plan.times)?plan.times:[null,null,null];
 return {mode:plan.mode==='earlier'?'earlier':'later',times:FARM_TIERS.map((_,i)=>parseTime(values[i]))};
}
export function compareFarm(plan){
 const p=normalizeFarmPlan(plan),later=p.mode==='later';
 const rows=FARM_TIERS.map((tier,index)=>{
  const time=p.times[index],factor=later?tier.factor:1;
  return {...tier,time,factor,rate:time===null?null:factor/time};
 });
 const known=rows.filter(r=>r.rate!==null).sort((a,b)=>b.rate-a.rate||a.time-b.time);
 const leader=known.length>=2?known[0]:null;
 const runnerUp=known.length>=2?known[1]:null;
 const advantage=leader&&runnerUp&&runnerUp.rate>0?(leader.rate/runnerUp.rate-1)*100:null;
 const weakest=rows[0],strongest=rows[2];
 const strongestBreakEven=weakest.time!==null?weakest.time*(strongest.factor/weakest.factor):null;
 return {mode:p.mode,rows,known,leader,runnerUp,advantage,strongestBreakEven};
}
export function readFarmPlan(store=null){
 try{return normalizeFarmPlan(JSON.parse((store||globalThis.localStorage).getItem(STORAGE_KEY)||'null')||{})}
 catch{return normalizeFarmPlan()}
}
export function saveFarmPlan(raw,store=null){
 const plan=normalizeFarmPlan(raw);
 try{(store||globalThis.localStorage).setItem(STORAGE_KEY,JSON.stringify(plan))}catch{}
 return plan;
}
const format=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:3});
export function farmCompareView(raw){
 const data=compareFarm(raw);
 return `<section class="farmCompare" aria-label="Monster Level farming comparator">
 <div class="farmIntro"><span class="eyebrow">BASED ON VERIFIED SEASON 2 MECHANICS</span>
 <h2>Find your fastest Monster Level farm</h2>
 <p>Enter your measured average seconds per <strong>ML XP-awarding kill</strong>. Arcana compares relative ML XP per second, not guessed monster health or absolute XP.</p><p><strong>Frenzy kills do not grant Monster Level XP.</strong> Exclude Frenzy kills when measuring your kill rate for this comparison.</p></div>
 <fieldset class="farmMode"><legend>Which biome are you farming?</legend>
 <label><input type="radio" name="farmMode" value="later" data-farm-mode ${data.mode==='later'?'checked':''}><span>Murky Depths onward</span></label>
 <label><input type="radio" name="farmMode" value="earlier" data-farm-mode ${data.mode==='earlier'?'checked':''}><span>Earlier biome</span></label>
 </fieldset>
 <div class="farmRows">${data.rows.map((tier,i)=>`<label class="farmRow"><span><strong>${esc(tier.label)}</strong><small>${data.mode==='later'?(tier.factor===1?'Normal XP':'×'+format(tier.factor)+' ML XP'):'Normal XP'}</small></span><span class="farmInput"><input type="number" data-farm-time="${i}" inputmode="decimal" min=".01" max="300" step=".01" placeholder="Your time" value="${tier.time??''}" aria-label="Average seconds per ML XP-awarding kill: ${esc(tier.label)}"><small>seconds / XP kill</small></span></label>`).join('')}</div>
 ${data.leader?`<section class="farmWinner" role="status"><span class="eyebrow">BEST OF YOUR MEASURED OPTIONS</span><h3>${esc(data.leader.label)}</h3><p>Relative ML XP per second: <strong>${format(data.leader.rate)}</strong>. ${data.advantage===null?'':`About <strong>${format(data.advantage)}%</strong> more ML XP per second than your next-fastest measured option.`}</p></section>`: `<div class="farmPrompt" role="status">${icon('info',18)} Enter average kill times for at least two monsters to compare them.</div>`}
 ${data.strongestBreakEven!==null?`<div class="farmBreakEven"><strong>Break-even insight</strong><p>At ${format(data.rows[0].time)} seconds for the weakest monster, the strongest monster must die in under <strong>${format(data.strongestBreakEven)} seconds</strong> to gain more ML XP per second.</p></div>`:`<div class="farmBreakEven"><strong>Break-even insight</strong><p>${data.mode==='later'?'From Murky Depths onward, the strongest monster can take about 22.2% longer than the weakest and still match its ML XP per second.':'Before Murky Depths, the listed monster groups use equal ML XP factors, so the quickest kill wins.'} Actual results depend on your measured kill times.</p></div>`}
 <div class="farmActions"><button type="button" data-action="farmreset">${icon('back',16)} Clear times</button><button type="button" data-route="wiki/article" data-params="id=monster-level">${icon('book',16)} Read ML farming guide ${icon('arrow',14)}</button><button type="button" data-route="wiki/library" data-params="kind=monster">${icon('search',16)} Browse monsters ${icon('arrow',14)}</button></div>
 <p class="farmDisclosure">The October 2026 Season 2 patch notes specify −10% ML XP for the weakest and +10% for the strongest monster from Murky Depths onward. Times are entered by you and stored on this device. Only ML XP-awarding kills count toward the measured rate; Frenzy kills count as zero ML XP. Earlier biomes use equal XP factors in this comparison.</p>
 </section>`;
}
