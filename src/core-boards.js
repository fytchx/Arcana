import {allocatedTotal,classPointBudget,passivePointBudget,getClass,getBranch,passiveTierSpend,passiveAllowed,classAllowed,passiveValue,passiveViolations} from './tree-engine.js';
import {esc,icon} from './ui.js';
import {gameArt,hasGameSprite,codexOfficialArt} from './assets.js';
import {asGear,gearLabel,baseItem,equipmentId} from './build-studio-data.js';
import {slotSilhouette} from './studio-visuals.js';
import {motifArt,passiveTitle,safeGameAsset,classTheme} from './tree-art.js';
const btn=(label,route)=>`<button class="boardJump" data-route="${route}">${label}</button>`;
const ico=(name)=>icon(name,19);
export const LOADOUT_LAYOUT=[
  {key:'torch',label:'Torch',group:'top-left'},
  {key:'head',label:'Head',group:'top-center'},
  {key:'neck',label:'Necklace',group:'top-right'},
  {key:'weapon',label:'Main hand',group:'weapon-left'},
  {key:'chest',label:'Chest',group:'chest-center'},
  {key:'offhand',label:'Off hand',group:'offhand-right'},
  {key:'ring',label:'Ring I',group:'ring-left'},
  {key:'belt',label:'Belt',group:'belt-center'},
  {key:'ring2',label:'Ring II',group:'ring-right'},
  {key:'hands',label:'Hands',group:'gloves-center'},
  {key:'feet',label:'Feet',group:'boots-center'}
];
const safeName=name=>String(name||'').replace(/[^A-Za-z0-9 _\-]/g,'').slice(0,70);
function realClassIcon(cls){const v=safeGameAsset(cls?.icon||cls?.icon_url||cls?.image||'');if(v)return `<img src="${esc(v)}" alt="" class="realClassIcon" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden class="classGlyph emblemFallback">${motifArt(cls?.name,{role:'class',size:30})}</span>`;return `<span class="classGlyph">${motifArt(cls?.name,{role:'class',size:30})}</span>`}
export function boardSwitch(active='equipment'){
 const entries=[['equipment','Equipment','labs/build'],['passive','Passive Tree','labs/passives'],['class','Class Skills','labs/skills']];
 return `<nav class="coreSwitch" aria-label="Build Studio boards">${entries.map(([id,n,r])=>`<button data-route="${r}" class="${active===id?'active':''}" aria-current="${active===id?'page':'false'}">${esc(n)}</button>`).join('')}</nav>`;
}
export function buildLoadout(equipment,itemLookup,inspecting){
 const count=Object.values(equipment||{}).filter(Boolean).length;
 const twoHanded=!!baseItem(equipment?.weapon)?.twoHanded;
 return `<section class="loadoutFrame" aria-label="Equipment manager"><div class="loadoutHead"><span>CHARACTER LOADOUT</span><span>${count} EQUIPPED</span></div><div class="loadoutStage">${LOADOUT_LAYOUT.map(slot=>{
  const raw=equipment?.[slot.key],item=itemLookup(raw),configuration=asGear(raw),base=baseItem(raw);
  const locked=slot.key==='offhand'&&twoHanded&&!raw;
  const displayName=item?.title||base?.name||'',tier=configuration?.rarity?gearLabel(configuration):'';
  // A restrained, uniform silhouette keeps empty and equipped states legible.
  // Real item art stays in the picker/editor where it provides useful detail.
  const art=slotSilhouette(slot.key);
  return `<button type="button" class="loadoutSlot ${item?'':'empty'} ${locked?'gearLocked':''}" data-pos="${slot.group}" data-action="${inspecting?'inspectgear':'pickgear'}" data-arg="${slot.key}" data-item="${esc(equipmentId(raw)||'')}" aria-label="${esc(slot.label)}: ${esc(displayName|| (locked?'blocked by two-handed weapon':'empty'))}${tier?' · '+esc(tier):''}"><span class="loadoutSprite">${art}</span><span class="loadoutMeta"><small>${esc(slot.label)}</small><strong>${esc(displayName|| (locked?'Blocked':'Empty'))}</strong>${tier?`<em class="gearTierMark">${esc(tier)}</em>`:''}</span>${item?'<i class="loadoutEquipped" aria-hidden="true"></i>':''}</button>`;
 }).join('')}</div><p class="boardCaveat">Tap an equipment slot to choose its base item, rarity, awakening and Drop Bonus. Saved builds retain their individual gear configurations.</p></section>`;
}
export function dataNotice(status){return `<div class="treeProvenance" role="status">${status==='ready'?'IdleArc Season 2 snapshot · October 9, 2026 · 200 rows / 500 source-backed passive nodes. Values and limits are taken from the game configuration.':'Loading verified Season 2 tree data.'}</div>`}
function spending(state,kind){const a=kind==='passive'?state.passiveAlloc:state.classAlloc;return `${allocatedTotal(a)} / ${kind==='passive'?passivePointBudget(state.characterLevel):classPointBudget(state.characterLevel)}`}
function controls(state,mode){
 const used=allocatedTotal(mode==='passive'?state.passiveAlloc:state.classAlloc),budget=mode==='passive'?passivePointBudget(state.characterLevel):classPointBudget(state.characterLevel),readOnly=mode==='passive'&&state.passiveReadOnly===true;
 return `<section class="levelStudio" aria-label="Character level and allocation budget"><div class="levelHead"><div><span class="eyebrow">CHARACTER PROGRESSION</span><label for="treeLevel">Character level</label></div><div class="levelNumber"><input type="number" id="treeLevel" value="${state.characterLevel}" min="1" max="1000" step="1" inputmode="numeric" aria-label="Type character level" ${readOnly?'disabled':''}><span>LVL</span></div></div><input id="treeLevelRange" type="range" min="1" max="1000" step="1" value="${state.characterLevel}" aria-label="Slide to set character level" ${readOnly?'disabled':''} style="--level-progress:${(state.characterLevel-1)/999*100}%"><div class="levelBottom"><span>1 <span class="muted">to</span> 1000</span><div class="pointCounter" aria-live="polite"><span>${mode==='passive'?'Passive':'Class'} points</span> <strong>${used} / ${budget}</strong> <small>${Math.max(0,budget-used)} remaining</small></div></div></section>`;
}
const rowWithin=(r,t)=>r>=t.start&&r<=t.end;
const safeTitle=s=>esc(String(s||'').slice(0,150));
function passiveIcon(node){return motifArt(node.name,{role:'passive',size:29})}
function inlineStepper(kind,id,name,rank,max,minus,plus){return `<div class="inlineStepper" aria-label="${safeTitle(name)} points"><button type="button" class="stepMinus" data-action="${kind}adjust" data-arg="${esc(id)}|-1" aria-label="Remove one point from ${safeTitle(name)}" title="${safeTitle(minus.ok?'Remove point':minus.reason)}" ${minus.ok?'':'disabled'}>−</button><output aria-live="off" aria-label="${rank} of ${max||'?'}">${rank}<span>/</span>${max||'?'}</output><button type="button" class="stepPlus" data-action="${kind}adjust" data-arg="${esc(id)}|1" aria-label="Add one point to ${safeTitle(name)}" title="${safeTitle(plus.ok?'Add point':plus.reason)}" ${plus.ok?'':'disabled'}>+</button></div>`}
function nodeButton(node,state,tree){
 const rank=Number(state.passiveAlloc[node.key]||0);
 const plus=passiveAllowed(tree,state.passiveAlloc,node,1,state.characterLevel,state.passiveFreeMode),minus=passiveAllowed(tree,state.passiveAlloc,node,-1,state.characterLevel,state.passiveFreeMode);
 const locked=rank===0&&!plus.ok,mode=rank>0?'allocated':locked?'locked':'available',label=passiveTitle(node.name),readOnly=state.passiveReadOnly===true;
 return `<div class="passiveNode ${mode}" data-node="${esc(node.key)}">
  <button type="button" class="passiveInspect" data-action="passiveinspect" data-arg="${esc(node.key)}" aria-label="Inspect ${safeTitle(label)}">
   <span class="passiveSymbol">${passiveIcon(node)}</span>
   <strong class="passiveName">${esc(label)}</strong>
   <span class="passiveStatGain">${esc(passiveValue(node,1))} <small>/pt</small></span>
   ${rank? `<span class="passiveInvested">${esc(passiveValue(node,rank))} total</span>` : ''}
  </button>
  ${readOnly?`<div class="passiveReadonlyRank">${rank} / ${node.maxRank} points</div>`:inlineStepper('passive',node.key,label,rank,node.maxRank,minus,plus)}
 </div>`;
}
export function passiveBoard(state,tree){
 const tiers=tree?.passive?.tiers||[],rows=tree?.passive?.rows||[];
 if(!tiers.length||!rows.length)return `<div class="emptyCard"><h3>Verified passives are unavailable</h3><p>Source-backed nodes are required before you can allocate points.</p><button class="btn secondary" data-action="reloadtree">Reload passives</button></div>`;
 const ti=Math.min(Math.max(0,state.passiveTier||0),tiers.length-1),tier=tiers[ti];
 const group=rows.filter(r=>rowWithin(r.index,tier)).sort((a,b)=>a.index-b.index);
 const previous=ti?passiveTierSpend(tree,state.passiveAlloc,ti-1):0,required=tier.required,locked=ti>0&&previous<required;
 const current=passiveTierSpend(tree,state.passiveAlloc,ti),nextThreshold=tiers[ti+1]?.required||0,points=allocatedTotal(state.passiveAlloc);
 const maxProgress=Math.min(100,Math.round(100*(required?previous/required:1)));
 const investedCount=Object.values(state.passiveAlloc||{}).filter(x=>x>0).length;
 const free=!!state.passiveFreeMode,readOnly=state.passiveReadOnly===true,issues=passiveViolations(tree,state.passiveAlloc,state.characterLevel);
 return `${controls(state,'passive')}
 <section class="passiveAllocationMode" aria-label="Passive point allocation rules"><div class="passiveModeText"><strong>${free?'Free Allocation':'Strict Allocation'}</strong><p>${free?'Preview any configuration. Row, tier, milestone and level restrictions are ignored, but node rank caps still apply.':'Follows the in-game row progression, tier spending, milestone and character-level rules.'}</p></div><label class="passiveModeSwitch" for="passiveFreeMode"><span>Free Allocation</span><input type="checkbox" id="passiveFreeMode" data-passive-free-mode role="switch" aria-label="Free Allocation mode" aria-checked="${free}" ${free?'checked':''} ${readOnly?'disabled':''}><span class="passiveSwitchTrack" aria-hidden="true"></span></label></section>
 ${!free&&issues.length?`<div class="passiveRuleWarning" role="status"><strong>${issues.length} rule issue${issues.length===1?'':'s'} in saved plan</strong><p>Older sandbox or shared allocations are preserved. Correct the highlighted issues or switch to Free Allocation. ${esc(issues[0].reason)}</p></div>`:''}
 ${readOnly?`<div class="passiveSharedBanner"><strong>Shared passive tree · view only</strong><small>Tier selection is available. Skill points and allocation mode cannot be changed in this shared copy.</small></div>`:''}
 <section class="coreTreePanel passivePanel ${free?'passiveFreePreview':'passiveStrict'}" aria-label="Complete Season 2 Passive Skill Tree">
  <div class="passiveTreeLead"><div><span class="eyebrow">CHARACTER PASSIVE TREE</span><h2>20 tiers. 200 rows.</h2><p>${points} / ${passivePointBudget(state.characterLevel)} points spent · ${investedCount} nodes invested</p></div><span class="passiveHeroSymbol">${icon('layers',28)}</span></div>
  <div class="treeRail passiveTierRail" role="tablist" aria-label="Choose passive tier">${tiers.map((t,i)=>{
   const p=passiveTierSpend(tree,state.passiveAlloc,i),can=free||i===0||passiveTierSpend(tree,state.passiveAlloc,i-1)>=t.required;
   return `<button type="button" role="tab" aria-selected="${ti===i}" class="${ti===i?'selected':''} ${p?'hasPoints':''}" data-action="passivetier" data-arg="${i}" aria-label="Tier ${i+1}, ${p} points allocated${can?'':' (locked)'}"><span>T${i+1}</span><small>${p? p+' pt':can?'OPEN':'LOCKED'}</small></button>`;
  }).join('')}</div>
  <div class="passiveTierSummary"><div class="passiveTierTitle"><span class="eyebrow">TIER ${ti+1} OF ${tiers.length}</span><h3>Rows ${tier.start+1}–${tier.end+1}</h3><p>${free?'Free Allocation is on · all rows and tiers can be edited':locked?'Allocate '+Math.max(0,required-previous)+' more points in Tier '+ti+' to unlock this tier':ti===0?'Available from the start':`Unlocked · ${previous}/${required} points in previous tier`}</p></div><span class="passiveTierCount">${current} pt</span></div>
  <div class="passiveProgress" aria-label="${maxProgress}% toward tier unlock"><i style="width:${maxProgress}%"></i></div>
  <div class="passiveTierRows" id="passiveSwipe" aria-label="All ten rows in passive tier ${ti+1}">
   ${group.map(row=>{const previousRow=rows.find(x=>x.index===row.index-1),rowReady=free||(row.index===tier.start?!locked:!!previousRow?.nodes.some(n=>Number(state.passiveAlloc[n.key]||0)>0));const usedRow=row.nodes.some(n=>Number(state.passiveAlloc[n.key]||0)>0);return `<section class="passiveRow ${row.milestone?'milestoneRow':''} ${rowReady?'rowReady':'rowLocked'} ${usedRow?'rowUsed':''}" aria-label="Row ${row.index+1}${row.milestone?' milestone':''}">
    <div class="passiveRowLabel"><span>${row.milestone?'✦ MILESTONE':'ROW'} ${row.index+1}</span><small>${row.milestone?'Choose one milestone':rowReady?'Available':row.index===tier.start?'Requires previous tier points':'Requires 1 point in Row '+row.index}</small></div>
    <div class="passiveRowNodes" style="--row-nodes:${Math.max(1,row.nodes.length)}">${row.nodes.map(n=>nodeButton(n,state,tree)).join('')}</div>
   </section>`;}).join('')}
  </div>
  <div class="treePaging passivePaging"><button type="button" data-action="passiveprev" ${ti===0?'disabled':''}>${ico('back')} T${ti||1}</button><span>${current} points in this tier${nextThreshold?' · '+Math.max(0,nextThreshold-current)+' to next':''}</span><button type="button" data-action="passivenext" ${ti===tiers.length-1?'disabled':''}>T${ti+2} ${ico('arrow')}</button></div>
 </section>
 <div class="treeFootControls"><button class="btn secondary" data-action="passivefirst">${ico('home')} Tier 1</button><button class="btn secondary" data-action="passivemilestone">✦ Milestones</button>${readOnly?'<button class="btn secondary" data-route="labs/passives">Open my planner</button>':'<button class="btn secondary" data-action="resetpassives">Reset passives</button><button class="btn primary" data-action="sharepassives">Share this tree</button>'}</div>
 <p class="boardCaveat">Strict Allocation follows row-by-row progression: 1 point in the prior row to continue, one milestone choice per tier, and 20 points in the previous tier to unlock the next. Free Allocation is for sharing previews, not in-game legal builds. All 20 tiers remain browsable in either mode.</p>`;
}
export function skillTierGroups(branch){const skills=branch?.skills||[];const thresholds=[...new Set(skills.map(s=>s.pointsToUnlock).filter(x=>Number.isFinite(x)&&x>=0))].sort((a,b)=>a-b);
 const groups=new Map();skills.forEach((s,i)=>{const tier=s.tier>=0?s.tier:thresholds.length>1?thresholds.indexOf(s.pointsToUnlock):0;if(!groups.has(tier))groups.set(tier,[]);groups.get(tier).push(s)});return [...groups].sort((a,b)=>a[0]-b[0]);}
function skillIcon(s,cls){
 // Prefer exact official skill sprite or user-confirmed exception; never substitute a made-up skill picture.
 const result=codexOfficialArt({id:'game:class-skill:'+s.id,gameKind:'class-skill',title:s.name,className:cls.name},64);
 return result;
}
function classNode(s,cls,state,branch){
 const rank=Number(state.classAlloc[s.id]||0),plus=classAllowed(cls,state.classAlloc,s,1,state.characterLevel),minus=classAllowed(cls,state.classAlloc,s,-1,state.characterLevel);
 const mode=rank?'allocated':plus.ok?'available':'locked';
 return `<div class="classSkillNode ${mode}" data-node="${esc(s.id)}">
  <button class="classSkillInspect" type="button" data-action="classinspect" data-arg="${esc(s.id)}" aria-label="Details for ${esc(s.name)}" title="Inspect ${esc(s.name)}">
   <span class="classSkillImage">${skillIcon(s,cls)}</span>
   <strong>${esc(s.name)}</strong>
   <span class="classSkillEffect">${esc(s.description||'Skill description unavailable')}</span>
  </button>
  <div class="classNodeFoot">
   ${inlineStepper('class',s.id,s.name,rank,s.maxRank,minus,plus)}
   ${rank?'<span class="skillInvested">Active</span>':!plus.ok?`<span class="skillRequirement">${esc(s.pointsToUnlock?'Needs '+s.pointsToUnlock+' in branch':plus.reason)}</span>`:'<span class="skillRequirement">Available</span>'}
  </div>
 </div>`;
}
export function classBoard(state,tree){
 const classes=tree?.classes||[];
 if(!classes.length)return `<div class="emptyCard"><h3>Class data not loaded</h3><p>Retry the verified class data. No substitute skills are generated.</p><button class="btn secondary" data-action="reloadtree">Retry</button></div>`;
 const cls=getClass(tree,state.treeClassId),branch=getBranch(cls,state.treeBranchId),groups=skillTierGroups(branch);
 const used=allocatedTotal(state.classAlloc),budget=classPointBudget(state.characterLevel);
 const allBranchSpent=cls.branches.map(b=>({name:b.name,used:b.skills.reduce((t,s)=>t+Math.max(0,Number(state.classAlloc[s.id]||0)),0)}));
 const spentInBranch=allBranchSpent.find(b=>b.name===branch.name)?.used||0;
 return `${controls(state,'class')}
 <section class="coreTreePanel classPanel classTreeOverview classTone-${classTheme(cls.name)}" aria-label="${esc(cls.name)} class skill planner">
  <div class="treeRail classRail" role="tablist" aria-label="Character class">
   ${classes.map(x=>`<button type="button" role="tab" aria-selected="${cls.id===x.id}" class="${cls.id===x.id?'selected':''}" data-action="classselect" data-arg="${esc(x.id)}">${realClassIcon(x)}<span>${esc(x.name)}</span></button>`).join('')}
  </div>
  <div class="classHeading"><div class="classMark">${realClassIcon(cls)}</div><div><span class="eyebrow">CLASS SKILL SIMULATOR</span><h2>${esc(cls.name)}</h2><p>${used} / ${budget} points spent · ${Math.max(0,budget-used)} available at level ${state.characterLevel}</p></div></div>
  <div class="classSpendRail" aria-label="Points spent in each class branch">${allBranchSpent.map(x=>`<div><span>${esc(x.name)}</span><strong>${x.used} pt</strong></div>`).join('')}</div>
  <div class="branchRail" role="tablist" aria-label="Class skill branches">
   ${cls.branches.map(x=>`<button type="button" role="tab" aria-selected="${x.id===branch.id}" class="${x.id===branch.id?'selected':''}" data-action="branchselect" data-arg="${esc(x.id)}">${esc(x.name)}</button>`).join('')}
  </div>
  <div class="classBranchIntro"><div><span class="eyebrow">${esc(branch.name.toUpperCase())} SKILL TREE</span><h3>${esc(branch.name)} <small>${spentInBranch} spent</small></h3><p>All three tiers visible. Tap a skill to view its full effect, or use + and − to allocate points.</p></div><button type="button" class="btn secondary" data-action="resetbranch">Reset branch</button></div>
  <div class="classTierStack" id="classTreeStack" aria-label="${esc(branch.name)} full three-tier skill tree">
   ${groups.map(([tier,skills])=>{
    const gate=Math.max(0,tier*5),available=spentInBranch>=gate;
    return `<section class="classTierBlock ${available?'tierUnlocked':'tierLocked'}" aria-label="Tier ${tier+1}">
     <div class="classTierHeader"><span class="classTierBadge">T${tier+1}</span><div><strong>Tier ${tier+1}</strong><small>${gate?available?'Unlocked · '+gate+' points required':Math.max(0,gate-spentInBranch)+' more points needed in '+branch.name:'Available at the start'}</small></div></div>
     <div class="classTierCards">${skills.map(skill=>classNode(skill,cls,state,branch)).join('')}</div>
    </section>`;
   }).join('')}
  </div>
 </section>
 <div class="treeFootControls"><button class="btn secondary" data-route="labs/build">Back to Build Studio</button><button class="btn secondary" data-action="resetclasses">Reset ${esc(cls.name)} skills</button></div>`;
}
export function activePassiveNode(tree,key){for(const row of tree?.passive?.rows||[])for(const node of row.nodes||[])if(node.key===key)return node;return null}
export function activeClassSkill(tree,clsId,skillId){const cls=getClass(tree,clsId);return {cls,skill:cls?.branches.flatMap(b=>b.skills).find(s=>s.id===skillId)}}
export function passivePageCount(tree,tier){return tree?.passive?.tiers?.[tier]?1:0}
