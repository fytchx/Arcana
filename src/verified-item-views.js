import {esc} from './ui.js';
import {VERIFIED_ITEM_SNAPSHOT,verifiedRange,verifiedCompare,verifiedTierUpgrade} from './verified-item-snapshot.js';
const LABELS={
 melee_physical_damage:'Melee physical damage',physical_damage:'Physical damage',dagger_physical_damage:'Dagger physical damage',
 claw_physical_damage:'Claw physical damage',greatsword_physical_damage:'Greatsword physical damage',
 crossbow_physical_damage:'Crossbow physical damage',stick_physical_damage:'Stick physical damage',
 magic_damage:'Magic damage',grand_staff_magic_damage:'Staff magic damage',defense:'Defense',
 pet_mastery_level:'Pet Mastery level',all_skills:'All Class Skills',block_chance:'Block chance',
 crit_damage:'Critical damage',claw_crit_chance:'Claw crit chance modifier',staff_intelligence:'Staff intelligence',
 strength:'Strength',dexterity:'Dexterity',intelligence:'Intelligence',strength_dexterity:'Strength and Dexterity',
 all_attributes:'All attributes',life_on_hit:'Life on hit',life_on_kill:'Life on kill'
};
const statLabel=s=>LABELS[s]||String(s||'Unknown stat').replaceAll('_',' ');
const rangeString=p=>!p?'Not included in source':p.min===p.max?String(p.min):p.min+' – '+p.max;
const itemStats=(name,tier,side)=>{
 const v=verifiedRange(name,tier);
 if(!name)return `<div class="verifiedStatCard"><strong>${side==='left'?'Item A':'Item B'}</strong><p>Select an item above to show its configured baseline range.</p></div>`;
 if(!v)return `<div class="verifiedStatCard"><strong>${esc(name)}</strong><p>Verified implicit ranges are unavailable for this item in the October 9 snapshot.</p></div>`;
 return `<div class="verifiedStatCard"><span class="verifiedStatEyebrow">${side==='left'?'ITEM A':'ITEM B'} · ${esc(v.slot.replaceAll('_',' '))}</span><strong>${esc(v.name)}</strong>
  <dl><div><dt>${esc(statLabel(v.primary.stat))}</dt><dd>${esc(rangeString(v.primary))}</dd></div>
  ${v.secondary?`<div><dt>${esc(statLabel(v.secondary.stat))}</dt><dd>${esc(rangeString(v.secondary))}</dd></div>`:''}
  <div><dt>Possible affix slots</dt><dd>${v.affixSlots}</dd></div></dl></div>`;
};
const provenance=`<p class="verifiedSnapshotNote">Source: IdleArc game configuration snapshot, October 9, 2026. These are <strong>base implicit ranges</strong>, not a character’s rolled stats, awakenings, upgrade bonuses, or calculated damage.</p>`;
export function verifiedComparisonPanel(leftName,rightName,tier=1){
 const selected=Number(tier);
 const compared=verifiedCompare(leftName,rightName,selected);
 const chips=Object.entries(VERIFIED_ITEM_SNAPSHOT.tierNames).map(([id,name])=>`<button type="button" data-action="comparetier" data-arg="${id}" class="verifiedTierChip ${Number(id)===selected?'active':''}" aria-pressed="${Number(id)===selected}">T${id} ${esc(name)}</button>`).join('');
 let difference='';
 if(compared.left&&compared.right){
  difference=compared.comparable
   ?`<div class="verifiedDifference"><strong>Same primary stat: ${esc(statLabel(compared.left.primary.stat))}</strong><span>Item B vs A, configured range difference: ${compared.delta.min>=0?'+':''}${compared.delta.min} minimum / ${compared.delta.max>=0?'+':''}${compared.delta.max} maximum</span><small>This is a range comparison, not an overall item or build ranking.</small></div>`
   :`<div class="verifiedDifference"><strong>Different primary stats</strong><span>These equipment bases can't be ranked by a single implicit range. Compare their bonuses in the full build instead.</span></div>`;
 }
 return `<section class="verifiedComparePanel"><h2>Verified base stats</h2><p class="verifiedPanelIntro">Choose a rarity to compare the original Season 2 equipment ranges.</p><div class="verifiedTierRail" role="group" aria-label="Select equipment rarity">${chips}</div>
 <div class="verifiedStatsGrid">${itemStats(leftName,selected,'left')}${itemStats(rightName,selected,'right')}</div>${difference}${provenance}</section>`;
}
export function verifiedUpgradeReferencePanel(selectedName){
 const stages=Object.keys(VERIFIED_ITEM_SNAPSHOT.tierUpgradeCosts).map(id=>verifiedTierUpgrade(Number(id))).filter(Boolean);
 return `<section class="verifiedUpgradeReference"><h2>Tier-upgrade reference</h2>
  <p class="verifiedPanelIntro">Configured <strong>base</strong> tier-change values, before other requirements or modifiers. This is not a total-cost or expected-attempt estimate.</p>
  <div class="verifiedUpgradeRows">${stages.map(x=>`<div class="verifiedUpgradeRow"><strong>${esc(VERIFIED_ITEM_SNAPSHOT.tierNames[x.from])} → ${esc(VERIFIED_ITEM_SNAPSHOT.tierNames[x.to])}</strong><span>${x.cost.toLocaleString('en-US')} base gold</span><span>${x.material.quantity} × ${esc(x.material.slug.replaceAll('-',' '))}</span><small>${Math.round(x.failureChance*100)}% configured failure chance</small></div>`).join('')}</div>
  ${selectedName?`<p class="verifiedSelectedNote">Selected item: ${esc(selectedName)}. Level upgrades, individual monster materials, refund/pity behavior, and Awakened ranks are not yet included in these totals.</p>`:''}
  ${provenance}</section>`;
}
