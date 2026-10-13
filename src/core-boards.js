import {allocatedTotal,classPointBudget,passivePointBudget,getClass,getBranch,passiveTierSpend,passiveAllowed,classAllowed} from './tree-engine.js';
import {esc,icon} from './ui.js';
import {gameArt} from './assets.js';
import {asGear,gearLabel,baseItem,equipmentId} from './build-studio-data.js';
import {motifArt,passiveTitle,safeGameAsset,classTheme} from './tree-art.js';
const btn=(label,route)=>`<button class="boardJump" data-route="${route}">${label}</button>`;
const ico=(name)=>icon(name,19);
export const LOADOUT_LAYOUT=[
  {key:'torch',label:'Torch / utility',group:'top-left'},
  {key:'head',label:'Head',group:'top-center'},
  {key:'neck',label:'Necklace',group:'top-right'},
  {key:'weapon',label:'Main hand',group:'weapon-left'},
  {key:'chest',label:'Chest',group:'chest-center'},
  {key:'offhand',label:'Off hand',group:'offhand-right'},
  {key:'ring',label:'Ring I',group:'ring-left'},
  {key:'belt',label:'Belt',group:'belt-center'},
  {key:'ring2',label:'Ring II',group:'ring-right'},
  {key:'charm',label:'Utility I',group:'charm-left'},
  {key:'hands',label:'Hands',group:'gloves-center'},
  {key:'feet',label:'Feet',group:'boots-center'},
  {key:'charm2',label:'Utility II',group:'charm-right'}
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
  const art=item?gameArt({...item,tier:configuration?.awaken?'A'+configuration.awaken:configuration?.rarity?'T'+configuration.rarity:undefined},100):icon(locked?'close':'plus',24);
  return `<button type="button" class="loadoutSlot ${item?'':'empty'} ${locked?'gearLocked':''}" data-pos="${slot.group}" data-action="${inspecting?'inspectgear':'pickgear'}" data-arg="${slot.key}" data-item="${esc(equipmentId(raw)||'')}" aria-label="${esc(slot.label)}: ${esc(displayName|| (locked?'blocked by two-handed weapon':'empty'))}${tier?' · '+esc(tier):''}"><span class="loadoutSprite">${art}</span><span class="loadoutMeta"><small>${esc(slot.label)}</small><strong>${esc(displayName|| (locked?'Blocked':'Empty'))}</strong>${tier?`<em class="gearTierMark">${esc(tier)}</em>`:''}</span>${item?'<i class="loadoutEquipped" aria-hidden="true"></i>':''}</button>`;
 }).join('')}</div><p class="boardCaveat">Tap an equipment slot to choose its base item, rarity, awakening and Drop Bonus. Saved builds retain their individual gear configurations.</p></section>`;
}
export function dataNotice(status){return `<div class="treeProvenance" role="status">${status==='ready'?'Reading the existing IdleArc tree export. Verify against the newest Season 2 configuration before publishing builds.':status==='loading'?'Loading IdleArc skill data…':'Tree data unavailable. Allocation is disabled rather than guessing skills or unlocks.'}</div>`}
function spending(state,kind){const a=kind==='passive'?state.passiveAlloc:state.classAlloc;return `${allocatedTotal(a)} / ${kind==='passive'?passivePointBudget(state.characterLevel):classPointBudget(state.characterLevel)}`}
function controls(state,mode){
 const used=allocatedTotal(mode==='passive'?state.passiveAlloc:state.classAlloc),budget=mode==='passive'?passivePointBudget(state.characterLevel):classPointBudget(state.characterLevel);
 return `<section class="levelStudio" aria-label="Character level and allocation budget"><div class="levelHead"><div><span class="eyebrow">CHARACTER PROGRESSION</span><label for="treeLevel">Character level</label></div><div class="levelNumber"><input type="number" id="treeLevel" value="${state.characterLevel}" min="1" max="1000" step="1" inputmode="numeric" aria-label="Type character level"><span>LVL</span></div></div><input id="treeLevelRange" type="range" min="1" max="1000" step="1" value="${state.characterLevel}" aria-label="Slide to set character level" style="--level-progress:${(state.characterLevel-1)/999*100}%"><div class="levelBottom"><span>1 <span class="muted">to</span> 1000</span><div class="pointCounter" aria-live="polite"><span>${mode==='passive'?'Passive':'Class'} points</span> <strong>${used} / ${budget}</strong> <small>${Math.max(0,budget-used)} remaining</small></div></div></section>`;
}
const rowWithin=(r,t)=>r>=t.start&&r<=t.end;
const safeTitle=s=>esc(String(s||'').slice(0,150));
function passiveIcon(node){return motifArt(node.name,{role:'passive',size:29})}
function inlineStepper(kind,id,name,rank,max,minus,plus){return `<div class="inlineStepper" aria-label="${safeTitle(name)} points"><button type="button" class="stepMinus" data-action="${kind}adjust" data-arg="${esc(id)}|-1" aria-label="Remove one point from ${safeTitle(name)}" title="${safeTitle(minus.ok?'Remove point':minus.reason)}" ${minus.ok?'':'disabled'}>−</button><output aria-live="off" aria-label="${rank} of ${max||'?'}">${rank}<span>/</span>${max||'?'}</output><button type="button" class="stepPlus" data-action="${kind}adjust" data-arg="${esc(id)}|1" aria-label="Add one point to ${safeTitle(name)}" title="${safeTitle(plus.ok?'Add point':plus.reason)}" ${plus.ok?'':'disabled'}>+</button></div>`}
function nodeButton(node,state,tree){
 const a=state.passiveAlloc,rank=Number(a[node.key]||0);
 const tier=tree.passive.tiers.findIndex(t=>rowWithin(node.row,t));
 const plus=passiveAllowed(tree,a,node,1,state.characterLevel),minus=passiveAllowed(tree,a,node,-1,state.characterLevel);
 const locked=rank===0&&!plus.ok,dot=rank>0?'allocated':locked?'locked':'available',label=passiveTitle(node.name);
 return `<div class="passiveNode ${dot}" data-node="${esc(node.key)}" title="${safeTitle(plus.ok?node.name:plus.reason)}"><button type="button" class="passiveInspect" data-action="passiveinspect" data-arg="${esc(node.key)}" aria-label="Inspect ${safeTitle(label)}"><span class="passiveSymbol">${passiveIcon(node)}</span><span class="passiveName">${esc(label)}</span>${node.value!=null?`<small>${esc(node.value)}/pt</small>`:''}</button>${inlineStepper('passive',node.key,label,rank,node.maxRank,minus,plus)}</div>`;
}
export function passiveBoard(state,tree){
 const tiers=tree?.passive?.tiers||[],rows=tree?.passive?.rows||[];
 if(!tiers.length||!rows.length)return `${boardSwitch('passive')}${dataNotice(state.treeStatus)}<div class="emptyCard"><h3>Waiting for verified passive-node data</h3><p>The planner won't invent passive nodes or their caps.</p><button class="btn secondary" data-action="reloadtree">Retry skill data</button></div>`;
 const ti=Math.min(Math.max(0,state.passiveTier),tiers.length-1),tier=tiers[ti];
 const group=rows.filter(r=>rowWithin(r.index,tier)).sort((a,b)=>a.index-b.index);
 const previous=ti?passiveTierSpend(tree,state.passiveAlloc,ti-1):0,required=tier.required,locked=ti>0&&previous<required;
 const density=group.length>=8?'density-high':group.length>=5?'density-medium':'density-low';
 const current=passiveTierSpend(tree,state.passiveAlloc,ti);
 const nextThreshold=ti<tiers.length-1?tiers[ti+1].required:0;
 return `${boardSwitch('passive')}${dataNotice('ready')}${controls(state,'passive')}<section class="coreTreePanel passivePanel">
 <div class="treeRail" role="tablist" aria-label="Jump to passive tier">${tiers.map((t,i)=>`<button role="tab" aria-selected="${ti===i}" class="${ti===i?'selected':''}" data-action="passivetier" data-arg="${i}" aria-label="Passive tier ${i+1}${t.milestone?', milestone':''}">T${i+1}${t.milestone?' ★':''}</button>`).join('')}</div>
 <div class="treeContext"><div><span class="eyebrow">PASSIVE TREE · TIER ${ti+1} OF ${tiers.length}</span><h2>${tier.milestone?'★ Milestone · ':''}Rows ${group[0]?.index+1||tier.start+1}–${group.at(-1)?.index+1||tier.end+1}</h2><p>${locked?`Tier locked · ${previous}/${required} points spent in previous tier`:nextThreshold?`${current}/${nextThreshold} points toward next tier`:`${current} points allocated in this tier`}</p></div><span class="pageCounter">${ti+1} / ${tiers.length}</span></div>
 <div class="tierSwipe ${density}" id="passiveSwipe" data-tier="${ti}" aria-label="Passive tier ${ti+1}, all ${group.length} rows on one page">
 ${group.length?group.map(row=>`<div class="passiveRow ${row.nodes.some(n=>n.milestone)?'milestoneRow':''}"><div class="passiveRowLabel">${row.nodes.some(n=>n.milestone)?'★ ':' '}R${row.index+1}</div><div class="passiveRowNodes" style="--row-nodes:${Math.max(1,row.nodes.length)}">${row.nodes.map(n=>nodeButton(n,state,tree)).join('')}</div></div>`).join(''):'<p class="notice">No rows mapped for this tier in this export.</p>'}</div>
 <div class="treePaging"><button data-action="passiveprev" ${ti===0?'disabled':''}>${ico('back')} Previous tier</button><span>Swipe to change tiers</span><button data-action="passivenext" ${ti===tiers.length-1?'disabled':''}>Next tier ${ico('arrow')}</button></div></section>
 <div class="treeFootControls"><button class="btn secondary" data-action="passivefirst">${ico('home')} Tier 1</button><button class="btn secondary" data-action="passivemilestone">★ Milestones</button><button class="btn secondary" data-action="resetpassives">Reset passives</button></div>`;
}
export function skillTierGroups(branch){const skills=branch?.skills||[];const thresholds=[...new Set(skills.map(s=>s.pointsToUnlock).filter(x=>Number.isFinite(x)&&x>=0))].sort((a,b)=>a-b);
 const groups=new Map();skills.forEach((s,i)=>{const tier=s.tier>=0?s.tier:thresholds.length>1?thresholds.indexOf(s.pointsToUnlock):0;if(!groups.has(tier))groups.set(tier,[]);groups.get(tier).push(s)});return [...groups].sort((a,b)=>a[0]-b[0]);}
function skillIcon(s,cls,branch){const src=safeGameAsset(s.icon||s.icon_url||s.icon_path||s.image||'');if(src)return `<img class="skillGameIcon" src="${esc(src)}" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="skillFallback" hidden>${motifArt(s.name,{role:'skill',cls:cls.name,size:58})}</span>`;return `<span class="skillFallback">${motifArt(s.name,{role:'skill',cls:cls.name,size:58})}</span>`}
function skillRows(skills){const rows=new Map();skills.forEach((s,i)=>{const row=Number.isInteger(s.row)&&s.row>=0?s.row:Math.floor(i/2);if(!rows.has(row))rows.set(row,[]);rows.get(row).push(s)});return [...rows].sort((a,b)=>a[0]-b[0])}
function classNode(s,cls,state,branch){
 const rank=Number(state.classAlloc[s.id]||0),plus=classAllowed(cls,state.classAlloc,s,1,state.characterLevel),minus=classAllowed(cls,state.classAlloc,s,-1,state.characterLevel);
 const mode=rank?'allocated':plus.ok?'available':'locked';
 return `<div class="classSkillNode ${mode}" data-node="${esc(s.id)}" title="${safeTitle(plus.ok?s.name:plus.reason)}"><button class="classSkillInspect" data-action="classinspect" data-arg="${esc(s.id)}" aria-label="Inspect ${safeTitle(s.name)}"><span class="classSkillImage">${skillIcon(s,cls,branch)}</span><strong>${esc(s.name)}</strong>${mode==='locked'?'<span class="skillLock" aria-hidden="true">⌁</span>':''}</button>${inlineStepper('class',s.id,s.name,rank,s.maxRank,minus,plus)}</div>`
}
export function classBoard(state,tree){
 const classes=tree?.classes||[];
 if(!classes.length)return `${boardSwitch('class')}${dataNotice(state.treeStatus)}<div class="emptyCard"><h3>Waiting for class skill data</h3><p>Skill tiers require actual game data, not invented nodes.</p><button class="btn secondary" data-action="reloadtree">Retry skill data</button></div>`;
 const cls=getClass(tree,state.treeClassId),branch=getBranch(cls,state.treeBranchId),groups=skillTierGroups(branch);
 const index=Math.min(Math.max(0,state.classTierIndex),Math.max(0,groups.length-1));state.classTierIndex=index;
 const [tier,skills]=groups[index]||[0,[]],rows=skillRows(skills),allocated=state.classAlloc;
 return `${boardSwitch('class')}${dataNotice('ready')}${controls(state,'class')}<section class="coreTreePanel classPanel classTone-${classTheme(cls.name)}">
 <div class="treeRail classRail" role="tablist" aria-label="Choose class">${classes.map(c=>`<button role="tab" aria-selected="${cls.id===c.id}" class="${cls.id===c.id?'selected':''}" data-action="classselect" data-arg="${esc(c.id)}">${realClassIcon(c)}<span>${esc(c.name)}</span></button>`).join('')}</div>
 <div class="classHeading"><div class="classMark">${realClassIcon(cls)}</div><div><h2>${esc(cls.name)}</h2><p>Class Skill Planner · ${cls.branches.length} branches</p></div></div>
 <div class="branchRail">${cls.branches.map(b=>`<button class="${b.id===branch.id?'selected':''}" data-action="branchselect" data-arg="${esc(b.id)}">${esc(b.name)}</button>`).join('')}</div>
 <div class="treeRail classTierRail" role="tablist" aria-label="Class skill tier quick navigation">${groups.map(([n],i)=>`<button class="${i===index?'selected':''}" role="tab" aria-selected="${i===index}" data-action="classtier" data-arg="${i}">Tier ${n+1}</button>`).join('')}</div>
 <div class="treeContext"><div><span class="eyebrow">${esc(branch.name.toUpperCase())} · TIER ${tier+1}</span><h2>Tier ${tier+1} · ${skills.length} skills</h2><p>${allocatedTotal(allocated)} class points allocated · ${skills.length} skills</p></div><span class="pageCounter">${index+1} / ${groups.length}</span></div>
 <div class="tierSwipe classTierSwipe" id="classSwipe" aria-label="All class skills in tier ${tier+1} on one page">${rows.map(([row,skills])=>`<div class="classTierRow"><span class="classRowTitle">${rows.length>1?'ROW '+(row+1):''}</span><div class="classTierNodes">${skills.map(s=>classNode(s,cls,state,branch)).join('')}</div></div>`).join('')}</div>
 <div class="treePaging"><button data-action="classprev" ${index===0?'disabled':''}>${ico('back')} Previous tier</button><span>Swipe to change tiers</span><button data-action="classnext" ${index===groups.length-1?'disabled':''}>Next tier ${ico('arrow')}</button></div></section>
 <div class="treeFootControls"><button class="btn secondary" data-route="labs/passives">${ico('git')} Passive tree</button><button class="btn secondary" data-action="resetclasses">Reset class points</button></div><p class="boardCaveat">Game class art is used when mapped. Unavailable art keeps an Arcana placeholder.</p>`;
}
export function activePassiveNode(tree,key){for(const row of tree?.passive?.rows||[])for(const node of row.nodes||[])if(node.key===key)return node;return null}
export function activeClassSkill(tree,clsId,skillId){const cls=getClass(tree,clsId);return {cls,skill:cls?.branches.flatMap(b=>b.skills).find(s=>s.id===skillId)}}
export function passivePageCount(tree,tier){return tree?.passive?.tiers?.[tier]?1:0}
