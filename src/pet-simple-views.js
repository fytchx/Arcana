import {esc,icon} from './ui.js';
import {PET_HATCH_RARITIES,petBonusEntries,bonusName,normalizeCompoundPlan,compoundBonus,normalizeAffixCostPlan,affixCost} from './pet-simple-math.js';
import {PET_AFFIX_SNAPSHOT} from './verified-pet-affixes.js';
const num=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
export function simpleCompoundCalculatorView(raw){
 const p=normalizeCompoundPlan(raw),info=compoundBonus(p);
 const cap={uncommon:10,rare:20,epic:30,legendary:300}[p.rarity];
 const bonusOptions=petBonusEntries(p.rarity).map(x=>`<option value="${esc(x.type)}" ${x.type===p.bonus?'selected':''}>${esc(bonusName(x.type))}</option>`).join('');
 return `<section class="petMiniTool">
 <div class="petMiniIntro"><span class="eyebrow">PET CALCULATOR</span><h2>Compound → Drop Bonus</h2><p>Choose a rarity, a bonus, and Compound Level. Starting values are filled from the game config.</p></div>
 <div class="petMiniInputs"><label>Pet rarity<select id="petCompoundRarity" aria-label="Pet rarity">${PET_HATCH_RARITIES.map(r=>`<option value="${r}" ${r===p.rarity?'selected':''}>${r[0].toUpperCase()+r.slice(1)}</option>`).join('')}</select></label>
 <label>Drop Bonus<select id="petCompoundBonus" aria-label="Drop Bonus">${bonusOptions}</select></label>
 <label>Compound Level<input id="petCompoundLevel" type="number" inputmode="numeric" min="0" max="${cap}" value="${p.level}"></label></div>
 <div class="petMiniSteps" role="group" aria-label="Adjust Compound Level">
 ${[1,5,10,25].map(n=>`<button type="button" data-action="petcompoundstep" data-arg="${n}">+${n}</button>`).join('')}
 <button type="button" data-action="petcompoundreset">Reset</button></div>
 ${info?`<div class="petMiniResult" role="status"><span>${esc(bonusName(p.bonus))}</span><div class="petMiniComparison"><div><small>At C0</small><strong>${num(info.base)}${info.unit}</strong></div><span class="petMiniArrow">→</span><div><small>At C${info.level}</small><strong>${num(info.amount)}${info.unit}</strong></div></div><small>${esc(info.method)}</small></div>`:'<p class="notice">No verified bonus values for this selection.</p>'}
 <details class="petMiniHelp"><summary>How Compound and Equalisation work</summary><p>Compound increases the selected main pet bonus, not the pet’s affixes. When four pets are equipped, the weakest equipped Compound Level limits stronger pets to weakest +10 (seasonal) or +25 (permanent). This calculator shows the raw bonus before that cap.</p></details>
 <p class="petMiniFoot">Based on the October 9 game configuration. Calculated projections use the configured steps and per-level rounding; compare unusual bonuses with in-game values. No manual base bonus required.</p></section>`;
}
export function simpleAffixCostView(raw){
 const p=normalizeAffixCostPlan(raw),result=affixCost(p),affix=PET_AFFIX_SNAPSHOT.affixes.find(x=>x.name===p.affix);
 const cap=affix.max_level||999;
 return `<section class="petMiniTool">
 <div class="petMiniIntro"><span class="eyebrow">PET CALCULATOR</span><h2>Target Affix Cost</h2><p>Already have the affix? Enter its current and target levels to estimate the Pet Shards needed to upgrade it.</p></div>
 <div class="petMiniInputs"><label>Pet Affix<select id="petAffixType" aria-label="Pet Affix">${PET_AFFIX_SNAPSHOT.affixes.map(x=>`<option value="${esc(x.name)}" ${x.name===p.affix?'selected':''}>${esc(x.display_name.replace('{pet_element}','pet element'))}</option>`).join('')}</select></label>
 <label>Current Level<input id="petAffixCurrent" type="number" inputmode="numeric" min="1" max="${cap}" value="${p.currentLevel}"></label>
 <label>Target Level<input id="petAffixTarget" type="number" inputmode="numeric" min="1" max="${cap}" value="${p.targetLevel}"></label></div>
 <div class="petMiniSteps" role="group" aria-label="Increase affix target level">
 ${[1,10,25,50,100].map(n=>`<button type="button" data-action="petaffixstep" data-arg="${n}">+${n}</button>`).join('')}
 <button type="button" data-action="petaffixreset">Reset</button></div>
 <div class="petMiniResult" role="status"><span>Upgrade cost to target</span><div class="petMiniBig">${num(result.shards)} <small>Pet Shards</small></div>
 <div class="petMiniDetails"><span>Lv ${result.currentLevel} → Lv ${result.targetLevel}</span><span>Next upgrade: ${result.nextUpgrade===null?'Max level':num(result.nextUpgrade)+' shards'}</span></div>
 <small>Configured affix value: ${num(result.currentValue)}${result.valueUnit} → ${num(result.targetValue)}${result.valueUnit}</small></div>
 <p class="petMiniQuick">Add an affix: <strong>${result.addSlotShards} shards</strong> · One reroll: <strong>${result.rerollShards} shards</strong></p>
 <details class="petMiniHelp"><summary>What is included in this cost?</summary><p>Upgrade-shard totals use the config’s level cost divisor (20) and sum the cost of each level. All Class Skills uses its configured special upgrade cost. Rerolls are listed separately; the cost of obtaining a specific affix through random rerolls, pity progress and extra slots is <strong>not</strong> included.</p></details>
 <p class="petMiniFoot">October 9 Season 2 config estimate, not a server-verified receipt. Verify boundary levels in-game before relying on large shard totals.</p></section>`;
}
