import {esc,icon} from './ui.js';
import {GUILD_TREE,GUILD_GROUPS,GUILD_BASE_NODES,GUILD_NODE_LABELS,GUILD_BONUS_BOOSTS,guildPointBudget,guildTreeCounts,guildTreeSpent,guildTreeRule,guildBonusTotals,remainingGuildPoints} from './guild-tree-engine.js';
import {GUILD_TREE_SOURCE} from './guild-tree-data.js';
const fmt=n=>Number(n.toFixed(3)).toLocaleString('en-US',{maximumFractionDigits:3});
const flat=id=>id.startsWith('flat_');
const asValue=(id,n)=>fmt(n)+(flat(id)?'':'%');
const more=(id,n)=>'+'+asValue(id,n);
function controls(key,plan,rank,label){
 const reason=guildTreeRule(plan,key);
 return `<div class="guildTreeActions"><button data-action="guildpointremove" data-arg="${esc(key)}" aria-label="Refund ${esc(label)} rank" ${rank?'':'disabled'}>−</button><button data-action="guildpointadd" data-arg="${esc(key)}" title="${esc(reason||'Add rank')}" aria-label="Add ${esc(label)} rank" ${reason?'disabled':''}>+</button><button data-action="guildpointmax" data-arg="${esc(key)}" ${reason?'disabled':''}>Max</button></div>`;
}
function node(n,plan,count,totals){
 const rank=count[n.id]||0,next=n.ranks[rank],why=guildTreeRule(plan,n.id);
 return `<article class="guildTreeNode"><header><div><strong>${esc(GUILD_NODE_LABELS[n.id])}</strong><small>${esc(n.family)} bonus for every guild member</small></div><b>${rank}/10</b></header><div class="guildTreeMeter"><span style="width:${rank*10}%"></span></div><div class="guildTreeNodeBottom"><div><strong>${asValue(n.id,totals[n.id].total)}</strong><small>${next===undefined?'Fully ranked':why||'Next '+more(n.id,next)}</small></div>${controls(n.id,plan,rank,GUILD_NODE_LABELS[n.id])}</div></article>`;
}
function ascension(key,label,description,count,plan,perRank,cap=null){
 const why=guildTreeRule(plan,key);
 return `<article class="guildTreeNode"><header><div><strong>${esc(label)}</strong><small>${esc(description)}</small></div><b>${count}${cap!==null?' / '+cap:''}</b></header>
 <div class="guildTreeAscStats">${Object.entries(perRank).map(([id,num])=>`<div><span>${esc(GUILD_NODE_LABELS[id])}</span><strong>${more(id,num)}/rank</strong></div>`).join('')}</div>
 ${why?`<small class="guildTreeWhy">${esc(why)}</small>`:''}${controls(key,plan,count,label)}</article>`;
}
export function guildTreeView(plan,active='vanguard'){
 const counts=guildTreeCounts(plan.events),budget=guildPointBudget(plan.level),spent=guildTreeSpent(plan),left=remainingGuildPoints(plan),totals=guildBonusTotals(plan);
 const tab=GUILD_GROUPS.some(g=>g.id===active)||['ascension','totals'].includes(active)?active:'vanguard';
 const hint=spent<15?'Spend '+(15-spent)+' more to unlock ranks 4–6':spent<35?'Spend '+(35-spent)+' more to unlock ranks 7–10':spent<68?'Spend '+(68-spent)+' more to unlock Ascension':'Every tier is unlocked';
 let content='';
 if(GUILD_GROUPS.some(g=>g.id===tab)){
   const group=GUILD_GROUPS.find(g=>g.id===tab);
   content=`<div class="guildTreeSectionTitle"><h3>${esc(group.title)}</h3><p>${esc(group.description)}</p></div><div class="guildTreeNodeGrid">${GUILD_BASE_NODES.filter(n=>n.family===tab).map(n=>node(n,plan,counts,totals)).join('')}</div>`;
 }else if(tab==='ascension'){
   const needed=Math.max(0,GUILD_TREE.endgame.unlock_spent-spent);
   content=`<div class="guildTreeSectionTitle"><h3>Ascension</h3><p>Mastery adds a small amount to every bonus; Family ranks strengthen their whole row.</p></div>${needed?`<p class="guildTreeWhy">Spend ${needed} more points to unlock Ascension.</p>`:''}
   <div class="guildTreeNodeGrid">
   ${ascension('mastery','Mastery','One rank per guild level past 68',counts.mastery||0,plan,GUILD_TREE.mastery.per_rank,Math.max(0,plan.level-68))}
   ${GUILD_TREE.endgame.families.map(f=>ascension('family:'+f.id,f.id[0].toUpperCase()+f.id.slice(1)+' Family','Raises all bonuses in this family',counts['family:'+f.id]||0,plan,f.per_rank)).join('')}</div>
   <p class="guildTreeWhy">Family staircase: to pass rank 10, another family must have 10 ranks. To pass 20, another needs 20 and the third needs 10.</p>`;
 }else{
   content=`<div class="guildTreeSectionTitle"><h3>Guild bonuses</h3><p>Totals include Mastery, Family ranks, and Bonus Boost when selected.</p></div>${GUILD_GROUPS.map(g=>`<section class="guildTreeTotals"><h4>${esc(g.title)}</h4>${GUILD_BASE_NODES.filter(n=>n.family===g.id).map(n=>`<div><span>${esc(GUILD_NODE_LABELS[n.id])}</span><strong>${asValue(n.id,totals[n.id].total)}</strong></div>`).join('')}</section>`).join('')}`;
 }
 return `<section class="guildTreePlanner" aria-label="Guild Skill Tree Planner">
 <div class="guildTreeIntro"><span class="eyebrow">ARCANA · GUILD PLANNER</span><h2>Guild Skill Tree</h2><p>Plan every point before spending it in IdleArc. This plan is saved on your device, not in the game.</p></div>
 <div class="guildTreeSetup"><div><label for="guildTreeLevel">Guild level</label><div class="guildTreeLevel"><button data-action="guildlevelminus" aria-label="Decrease guild level">−</button><input id="guildTreeLevel" aria-label="Guild level" type="number" inputmode="numeric" min="1" max="99999" value="${plan.level}"><button data-action="guildlevelplus" aria-label="Increase guild level">+</button></div></div>
 <div><label for="guildTreeBoost">Bonus Boost</label><select id="guildTreeBoost" aria-label="Guild Bonus Boost">${GUILD_BONUS_BOOSTS.map(x=>`<option value="${x}" ${x===plan.boost?'selected':''}>${x===1?'Off':'×'+fmt(x)+' (+'+Math.round((x-1)*100)+'%)'}</option>`).join('')}</select></div></div>
 <div class="guildTreeCounters"><div><strong>${left}</strong><small>Available</small></div><div><strong>${spent}</strong><small>Spent</small></div><div><strong>${budget}</strong><small>Total</small></div></div>
 <p class="guildTreeHint">${icon('info',16)} ${esc(hint)}</p>
 <div class="guildTreeToolbar"><button data-action="guildlink">${icon('link',16)} Copy build link</button><button data-action="guildreset">${icon('back',16)} Reset plan</button></div>
 <nav class="guildTreeTabs" aria-label="Guild tree branches">${[...GUILD_GROUPS.map(g=>[g.id,g.title]),['ascension','Ascension'],['totals','Bonuses']].map(([id,label])=>`<button class="${tab===id?'active':''}" aria-current="${tab===id?'page':'false'}" data-action="guildtreetab" data-arg="${id}">${esc(label)}</button>`).join('')}</nav>
 <div class="guildTreeMain">${content}</div><p class="guildTreeDisclosure">Rules from the October 9, 2026 IdleArc game configuration. A real in-game reset costs ${GUILD_TREE.reset.cost.toLocaleString('en-US')} Guild Arcstone and has a ${GUILD_TREE.reset.cooldown_hours}-hour cooldown. Resetting this simulation is free. <a href="https://idlearc.com/guild-tree#l=25" rel="noopener noreferrer" target="_blank">Official simulator</a>.</p>
 </section>`;
}
