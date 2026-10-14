/* Pure material progression engine. All recipes come from the independently
 * verified, versioned game-cost snapshot. No price, drop rate or ML XP guesses.
 * UI consumes this output; it never reimplements upgrade math. */
export const PATHFINDER_LIMIT=30;
const SCALE=1000000n;
const toCount=v=>{try{const x=BigInt(String(v??0));return x>0n?x:0n}catch{return 0n}};
const safeNumber=(n,fallback=0)=>Number.isFinite(Number(n))?Number(n):fallback;
const countString=n=>n.toLocaleString('en-US');
export const formatCost=v=>countString(typeof v==='bigint'?v:toCount(v));
export function stagesFor(data){
 if(!data?.codex?.tiers||!data.codex.awaken)return [];
 const out=Object.entries(data.codex.tiers).filter(([id,v])=>Number(id)>=1&&Number(id)<=6&&Array.isArray(v.rows))
  .sort((a,b)=>Number(a[0])-Number(b[0]))
  .map(([id,v])=>({id:'T'+id,name:v.name||'Tier '+id,max:Number(v.max_level)||0,tier:Number(id)}));
 for(let i=1;i<=PATHFINDER_LIMIT;i++)if(Array.isArray(data.codex.awaken.rows?.[i]))out.push({id:'A'+i,name:'Awakened '+i,max:data.codex.awaken.rows[i].length,rank:i});
 return out;
}
export function stageForGear(gear){
 if(!gear||!Number.isInteger(Number(gear.rarity))||Number(gear.rarity)<1||Number(gear.rarity)>6)return null;
 const tier=Number(gear.rarity),awaken=Number(gear.awaken)||0;
 return tier===6&&awaken>0?'A'+Math.min(PATHFINDER_LIMIT,awaken):'T'+tier;
}
export function normalizePathfinderPlan(raw={}){
 const source=raw&&typeof raw==='object'?raw:{};
 const targets={},inventory={},rates={};
 for(const [slot,val] of Object.entries(source.targets||{})){
  if(!/^[a-z][a-z0-9]{0,20}$/.test(slot))continue;
  const stage=String(val?.stage||'');
  if(!/^(T[1-6]|A(?:[1-9]|[12][0-9]|30))$/.test(stage))continue;
  targets[slot]={stage,level:Math.max(0,Math.min(30,Math.floor(safeNumber(val?.level))))};
 }
 for(const [slug,val] of Object.entries(source.inventory||{}))if(/^[a-z0-9-]{1,90}$/.test(slug))
  inventory[slug]=String(toCount(val));
 for(const [slug,val] of Object.entries(source.rates||{}))if(/^[a-z0-9-]{1,90}$/.test(slug)){
  const perMinute=Math.max(0,Math.min(10000000,safeNumber(val?.perMinute)));
  const label=String(val?.label||'').slice(0,90).replace(/[<>]/g,'');
  const mlXpPerMinute=Math.max(0,Math.min(1e14,safeNumber(val?.mlXpPerMinute)));
  rates[slug]={perMinute,label,mlXpPerMinute};
 }
 return {targets,inventory,rates,includeFailures:source.includeFailures===true,strategy:['balanced','materials','ml'].includes(source.strategy)?source.strategy:'balanced',baselineMlXpPerMinute:Math.max(0,safeNumber(source.baselineMlXpPerMinute))};
}
export function setTarget(plan,slot,stage,level){
 return normalizePathfinderPlan({...plan,targets:{...plan.targets,[slot]:{stage,level}}});
}
export function quoteUpgrade(data,fromStage,fromLevel,toStage,toLevel,includeFailures=false){
 const stages=stagesFor(data),start=stages.findIndex(s=>s.id===fromStage),end=stages.findIndex(s=>s.id===toStage);
 const bad={ok:false,steps:0,gold:0n,materials:{},error:'Upgrade route is unavailable or goes backward',incomplete:false};
 if(start<0||end<start)return bad;
 const a=stages[start],b=stages[end],fl=Math.floor(safeNumber(fromLevel)),tl=Math.floor(safeNumber(toLevel));
 if(fl<0||tl<0||fl>a.max||tl>b.max||(start===end&&tl<fl))return {...bad,error:'Target cannot be lower than the current enhancement level'};
 const mats={},stepDetails=[],warnings=[];
 let goldScaled=0n,goldBase=0n;
 const addMat=(slug,q,mul)=>{
  if(!/^[a-z0-9-]{1,90}$/.test(String(slug)))return;
  const n=toCount(q);if(!n)return;
  if(!mats[slug])mats[slug]={base:0n,scaled:0n};
  mats[slug].base+=n;mats[slug].scaled+=n*mul;
 };
 const add=(row,label)=>{
  if(!row){warnings.push('Missing verified cost for '+label);return;}
  if(row.unknown_monster_materials)warnings.push('Incomplete monster-material data at '+label);
  const fail=Math.max(0,Math.min(.999999,safeNumber(row.fail??row.failure,0)));
  const success=Math.max(.000001,Math.min(1,safeNumber(row.success,1-fail)));
  const goldFactor=includeFailures?BigInt(Math.round(1000000/success)):SCALE;
  const matFactor=includeFailures?BigInt(Math.round(1000000*(1+(1-success)*.7/success))):SCALE;
  const g=toCount(row.gold);goldBase+=g;goldScaled+=g*goldFactor;
  addMat(row.fragment_slug,row.fragments,matFactor);
  for(const [slug,qty] of Object.entries(row.monster_materials||{}))addMat(slug,qty,matFactor);
  if(row.essence)addMat(row.essence.slug,row.essence.quantity,matFactor);
  if(Array.isArray(row.extra_materials))for(const x of row.extra_materials)addMat(x.slug,x.quantity,matFactor);
  else for(const [slug,qty] of Object.entries(row.extra_materials||{}))addMat(slug,qty,matFactor);
  if(Array.isArray(row.materials))for(const x of row.materials)addMat(x.slug,x.quantity,matFactor);
  stepDetails.push(label);
 };
 for(let idx=start;idx<=end;idx++){
  const here=stages[idx],begin=idx===start?fl:0,finish=idx===end?tl:here.max;
  const rows=here.tier?data.codex.tiers[String(here.tier)]?.rows:data.codex.awaken.rows[String(here.rank)];
  for(let lv=begin;lv<finish;lv++){
   const row=rows?.find(x=>Number(x.current)===lv);
   add(row,here.id+' +'+lv+' → +'+(lv+1));
  }
  if(idx<end){
   const next=stages[idx+1];
   const transition=here.tier&&here.tier<6?
    data.codex.tier_upgrades?.find(x=>Number(x.from_tier)===here.tier):
    data.codex.awaken.transitions?.find(x=>Number(x.rank)===(next.rank||1));
   add(transition,here.id+' → '+next.id);
  }
 }
 const materialCosts=Object.fromEntries(Object.entries(mats).map(([slug,x])=>[slug,{
  base:x.base,quantity:(x.scaled+SCALE-1n)/SCALE
 }]));
 return {ok:true,steps:stepDetails.length,goldBase,gold:(goldScaled+SCALE-1n)/SCALE,materials:materialCosts,incomplete:warnings.length>0,warnings,includeFailures};
}
export function planGearUpgrades(equipment,plan,snapshot){
 const p=normalizePathfinderPlan(plan),stages=stagesFor(snapshot),all=[],requirements={},errors=[];
 let gold=0n,goldBase=0n,steps=0;
 for(const [slot,gear] of Object.entries(equipment||{})){
  if(!gear)continue;
  const from=stageForGear(gear),level=Math.floor(safeNumber(gear.level)),selected=p.targets[slot];
  if(!from){all.push({slot,name:gear.id||slot,unconfigured:true});continue;}
  const target=selected?.stage||from,targetLevel=selected?.level??level;
  const q=quoteUpgrade(snapshot,from,level,target,targetLevel,p.includeFailures);
  const name=String(gear.name||gear.id||slot).replace(/^game:item:/,'').replace(/-/g,' ');
  if(!q.ok){errors.push(slot+': '+q.error);all.push({slot,name,from,level,target,targetLevel,error:q.error});continue;}
  if(q.incomplete)errors.push(slot+': '+q.warnings.join('; '));
  gold+=q.gold;goldBase+=q.goldBase;steps+=q.steps;
  for(const [slug,cost] of Object.entries(q.materials)){
   if(!requirements[slug])requirements[slug]={required:0n,base:0n};
   requirements[slug].required+=cost.quantity;requirements[slug].base+=cost.base;
  }
  all.push({slot,name,from,level,target,targetLevel,steps:q.steps,materials:Object.keys(q.materials).length,gold:q.gold});
 }
 const lookup=new Map((snapshot?.materials||[]).map(m=>[m.slug,m]));
 const missing=Object.entries(requirements).map(([slug,q])=>{
  const owned=toCount(p.inventory[slug]),shortfall=q.required>owned?q.required-owned:0n;
  const source=lookup.get(slug);
  const rate=p.rates[slug]||{},perMinute=rate.perMinute||0;
  const minutes=shortfall>0n&&perMinute>0?Number(shortfall)/perMinute:shortfall===0n?0:null;
  const xp=rate.mlXpPerMinute||0;
  const baseline=p.baselineMlXpPerMinute||0;
  const penalty=minutes===null?null:baseline?Math.max(0,baseline-xp)*minutes:0;
  return {slug,name:source?.name||slug.replace(/-/g,' '),type:source?.type||'unknown',monsterId:source?.monster_id??null,
   required:q.required,base:q.base,owned,missing:shortfall,perMinute,minutes,rateLabel:rate.label||'',
   xpPerMinute:xp,xpOpportunityCost:penalty};
 }).sort((a,b)=>b.missing>a.missing?1:b.missing<a.missing?-1:a.name.localeCompare(b.name));
 const unknownRates=missing.filter(m=>m.missing>0n&&!m.perMinute);
 const actionable=missing.filter(m=>m.missing>0n&&m.perMinute>0);
 const estimateMinutes=actionable.reduce((sum,m)=>sum+m.minutes,0);
 const ranked=[...actionable].sort((a,b)=>{
  if(p.strategy==='materials')return (b.minutes-a.minutes)||a.name.localeCompare(b.name);
  if(p.strategy==='ml')return (a.xpOpportunityCost-b.xpOpportunityCost)||b.minutes-a.minutes;
  return (b.minutes*(1+(a.xpOpportunityCost/(1+(p.baselineMlXpPerMinute||1)*Math.max(a.minutes,1))))-
          a.minutes*(1+(b.xpOpportunityCost/(1+(p.baselineMlXpPerMinute||1)*Math.max(b.minutes,1)))))||a.name.localeCompare(b.name);
 });
 return {equipment:all,gold,goldBase,steps,materials:missing,missingCount:missing.filter(x=>x.missing>0n).length,
  unknownRates:unknownRates.length,estimateMinutes,estimatedAll:unknownRates.length===0&&missing.length>0&&errors.length===0,
  priority:ranked,errors,source:snapshot?.source||null};
}
