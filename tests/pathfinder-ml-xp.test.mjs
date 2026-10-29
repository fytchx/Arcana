import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PATHFINDER_ML_MIN,PATHFINDER_ML_MAX,PATHFINDER_ML_BIOMES,
 requiredMlXp,calculatePathfinderMlXp,pathfinderMlXpView,pathfinderMlXpResults,
 readPathfinderMlXp,savePathfinderMlXp,normalizePathfinderMlXp,
 formatMlEta,IDEAL_ML_KILLS_PER_SECOND} from '../src/pathfinder-ml-xp.js';

test('XP requirement fit remains bounded and monotone ML 185–500',()=>{
 assert.equal(PATHFINDER_ML_MIN,185);assert.equal(PATHFINDER_ML_MAX,500);
 assert.equal(requiredMlXp(184),null);assert.equal(requiredMlXp(501),null);
 let prev=0;
 for(let ml=185;ml<=500;ml++){const value=requiredMlXp(ml);assert.ok(value>prev,'ML '+ml);prev=value;}
 for(const [ml,value] of [[216,207520],[290,537670],[332,821380],[400,1420000],[482,2300000]]){
  assert.ok(Math.abs(requiredMlXp(ml)-value)<=(value>=1e6?5000:6),'ML '+ml);
 }
});
test('new plans default to +10, migrate old saves, clamp invalid ranges, persist fields',()=>{
 assert.deepEqual(normalizePathfinderMlXp(),{level:300,target:310,progress:0,biome:'crown',farmMode:'auto'});
 assert.deepEqual(normalizePathfinderMlXp({level:332,biome:'rift'}),{level:332,target:342,progress:0,biome:'rift',farmMode:'auto'});
 assert.equal(normalizePathfinderMlXp({level:499,target:600}).target,500);
 assert.equal(normalizePathfinderMlXp({level:250,target:240}).target,250);
 assert.equal(normalizePathfinderMlXp({level:250,progress:300}).progress,99);
 const storageMap=new Map(),store={getItem:k=>storageMap.get(k),setItem:(k,v)=>storageMap.set(k,v)};
 const saved=savePathfinderMlXp({level:298,target:335,progress:46,biome:'rift',farmMode:'fixed'},store);
 assert.deepEqual(readPathfinderMlXp(store),saved);
});
test('A-to-B sums each required level separately and excludes the target level',()=>{
 const data=calculatePathfinderMlXp({level:332,target:334,biome:'crown',farmMode:'fixed'});
 assert.deepEqual(data.segments.map(s=>s.level),[332,333]);
 assert.equal(data.required,requiredMlXp(332)+requiredMlXp(333));
 for(const v of data.variants)assert.equal(v.kills,data.segments.reduce((n,s)=>n+s.perLevel.find(p=>p.id===v.id).kills,0));
 const one=calculatePathfinderMlXp({level:332,target:333,farmMode:'fixed',biome:'crown'});
 assert.deepEqual(one.variants.map(v=>v.kills),[20392,18355,16685]);
 assert.deepEqual(one.variants.map(v=>v.etaDisplay),['5h 40m','5h 6m','4h 39m']);
 const equal=calculatePathfinderMlXp({level:500,target:500,progress:75});
 assert.equal(equal.required,0);assert.equal(equal.variants[1].kills,0);
 assert.equal(equal.variants[1].etaDisplay,'0m');
 assert.equal(calculatePathfinderMlXp({level:499,target:500}).required,requiredMlXp(499));
});
test('optional progress removes only current-level XP, lowering kills and ETA',()=>{
 const p0=calculatePathfinderMlXp({level:300,target:320,progress:0});
 const p50=calculatePathfinderMlXp({level:300,target:320,progress:50});
 const p99=calculatePathfinderMlXp({level:300,target:320,progress:99});
 assert.equal(p50.firstRequired,Math.ceil(requiredMlXp(300)*.5));
 assert.equal(p50.required,p0.required-requiredMlXp(300)+p50.firstRequired);
 assert.equal(p50.segments[1].needed,p0.segments[1].needed);
 assert.ok(p0.required>p50.required&&p50.required>p99.required);
 for(let i=0;i<3;i++)assert.ok(p0.variants[i].kills>p50.variants[i].kills&&p50.variants[i].kills>p99.variants[i].kills);
});
test('auto route transitions at unlocked ML; fixed biome stays fixed',()=>{
 assert.deepEqual(Object.fromEntries(PATHFINDER_ML_BIOMES.map(b=>[b.id,b.unlockMl])),{
  verdant:0,scorched:10,murky:30,frozen:45,shadow:65,infernal:90,elder:115,
  glass:150,drowned:185,summit:220,rift:260,crown:300
 });
 const auto=calculatePathfinderMlXp({level:185,target:305,farmMode:'auto'});
 assert.deepEqual(auto.zones.map(z=>[z.id,z.start]),[
  ['drowned',185],['summit',220],['rift',260],['crown',300]
 ]);
 for(const [ml,biome] of [[219,'drowned'],[220,'summit'],[259,'summit'],[260,'rift'],[299,'rift'],[300,'crown']])
  assert.equal(auto.segments.find(s=>s.level===ml).biome,biome);
 const fixed=calculatePathfinderMlXp({level:215,target:310,farmMode:'fixed',biome:'glass'});
 const changing=calculatePathfinderMlXp({level:215,target:310,farmMode:'auto'});
 assert.deepEqual(fixed.zones.map(z=>z.id),['glass']);
 assert.ok(fixed.variants[1].kills>changing.variants[1].kills);
 assert.equal(normalizePathfinderMlXp({level:219,farmMode:'fixed',biome:'crown'}).biome,'drowned');
 const html=pathfinderMlXpView({level:219,target:350});
 assert.ok(html.includes('<option value="summit" data-unlock-ml="220" disabled>'));
 assert.ok(html.includes('<option value="crown" data-unlock-ml="300" disabled>'));
});
test('journey variants stay ordered, positive, and bounded across all 316 starting MLs',()=>{
 for(let ml=185;ml<=500;ml++){
  const m=calculatePathfinderMlXp({level:ml,target:Math.min(500,ml+25),progress:37});
  assert.equal(m.segments.length,m.levels);
  if(m.levels){
   assert.ok(m.required>0);
   assert.ok(m.variants[0].kills>=m.variants[1].kills&&m.variants[1].kills>=m.variants[2].kills);
  }
  for(const v of m.variants){
   assert.ok(Number.isInteger(v.kills)&&v.kills>=0);
   assert.equal(v.etaDisplay,formatMlEta(v.kills/IDEAL_ML_KILLS_PER_SECOND));
  }
 }
 assert.equal(IDEAL_ML_KILLS_PER_SECOND,1);
 assert.equal(formatMlEta(90060),'1d 1h 1m');
});
test('the UI leads with A to B, ETA and kills; progress and farming remain optional',()=>{
 const html=pathfinderMlXpView({level:332,target:350,progress:25,farmMode:'auto'});
 for(const marker of ['data-path-ml-current','data-path-ml-target','data-path-ml-progress',
  'data-path-ml-mode','id="pathMlJourneyEta"','id="pathMlTotalXp"','data-path-ml-target-add="10"'])
  assert.ok(html.includes(marker),marker);
 assert.ok(html.includes('<details class="pathMlJourneyFold" data-path-ml-progress-fold>'));
 assert.ok(html.includes('data-path-ml-fixed-wrap hidden'));
 assert.equal((html.match(/class="pathMlCard pathMlJourneyCard pathMlCard--/g)||[]).length,3);
 assert.ok(html.includes('Estimate total XP, kills and time between two Monster Levels'));
 assert.ok(!html.includes('Know the XP. Know the kills.'));
 assert.ok(!html.includes('killsPerSecond'));
 assert.ok(pathfinderMlXpResults({level:500,target:500}).includes('already at the target'));
});
test('Pathfinder tab and in-place controls remain wired, including mobile styles',async()=>{
 const files=await Promise.all(['../src/app.js','../src/launch-navigation.js','../quick-tools.css'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
 const [app,nav,css]=files;
 assert.ok(app.includes('wirePathfinderMlXp();'));
 assert.ok(app.includes('data-path-ml-target-add'));
 assert.ok(app.includes('data-path-ml-current'));
 assert.ok(nav.includes("{view:'ml'}"));
 assert.ok(css.includes('.pathMlJourneyLevels{'));
 assert.ok(css.includes('@media(max-width:620px)'));
});
