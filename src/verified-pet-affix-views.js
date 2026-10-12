import {esc,icon} from './ui.js';
import {PET_AFFIX_SNAPSHOT,petAffixDefinition,petAffixLabel,normalizePetAffixPlan,projectPetAffix,AFFIX_PLANNER_MAX_INPUT_LEVEL} from './verified-pet-affixes.js';
const label=s=>esc(petAffixLabel(s));
const n=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:3});
export function petAffixPlannerView(raw){
 const plan=normalizePetAffixPlan(raw),projection=projectPetAffix(plan.affix,plan.level),d=projection.definition;
 const levelCap=d.max_level===null?AFFIX_PLANNER_MAX_INPUT_LEVEL:d.max_level;
 const options=PET_AFFIX_SNAPSHOT.affixes.map(x=>`<option value="${esc(x.name)}" ${x.name===plan.affix?'selected':''}>${label(x)}</option>`).join('');
 const rows=PET_AFFIX_SNAPSHOT.affixes.map(x=>{
  const start=projectPetAffix(x.name,1);
  return `<div class="petAffixReferenceRow ${plan.affix===x.name?'selected':''}"><strong>${label(x)}</strong><span>${n(start.display)}${start.unit} base</span><small>${x.max_level===1?'Fixed at Lv 1':x.max_level!==null?'Max Lv '+x.max_level:'+'+n(x.scaling_per_level)+start.unit+' per level (configured)'}</small></div>`;
 }).join('');
 return `<section class="petAffixPlanner" aria-label="Pet Affix Planner">
  <div class="petAffixHero"><span class="eyebrow">ARCANA CALCULATORS · VERIFIED REFERENCE</span>
   <h2>Pet Affix Level Planner</h2><p>Explore the nine configured Pet Affixes without changing your saved Build Studio pets.</p></div>
  <div class="petAffixControls">
   <label for="petAffixType">Affix</label><select id="petAffixType" aria-label="Pet affix type">${options}</select>
   <label for="petAffixLevel">Planned affix level</label><input id="petAffixLevel" type="number" inputmode="numeric" min="1" max="${levelCap}" step="1" value="${plan.level}" aria-label="Planned pet affix level">
   <div class="petAffixSteps" role="group" aria-label="Adjust affix level">
   ${[1,10,25,50,100].map(step=>`<button type="button" data-action="petaffixstep" data-arg="${step}">+${step}</button>`).join('')}
   <button type="button" data-action="petaffixreset" class="petAffixReset">Reset</button></div>
  </div>
  <div class="petAffixProjection" role="status"><span>Configured linear projection</span>
    <strong>${n(projection.display)}${projection.unit}</strong>
    <small>Lv ${projection.level} · Base ${n(d.base_value)}${projection.unit} ${d.scaling_per_level?'+ '+n(d.scaling_per_level)+projection.unit+' per additional level':'· no per-level growth'}</small>
    ${d.max_level!==null?`<small>This affix has a configured maximum of level ${d.max_level}.</small>`:''}</div>
  <div class="petAffixSnapshot"><h3>All nine affixes</h3><div class="petAffixReferenceList">${rows}</div></div>
  <div class="petAffixEvolve"><h3>Pet Evolution Settings</h3>
   <div class="petAffixMetaGrid"><span><b>${PET_AFFIX_SNAPSHOT.evolve.default_slots}</b><small>Initial affix slots</small></span><span><b>${PET_AFFIX_SNAPSHOT.evolve.max_slots}</b><small>Maximum affix slots</small></span></div>
   <p>Pet evolve config lists ruby costs of ${n(PET_AFFIX_SNAPSHOT.evolve.ruby_cost)} and ${n(PET_AFFIX_SNAPSHOT.evolve.ruby_cost_second)} for its two cost fields. Their exact triggers aren't confirmed here, so they are not included in calculated totals.</p>
  </div>
  <p class="petAffixDisclosure">${icon('info',15)} Source: IdleArc October 9, 2026 game configuration. Values above use <strong>base + (level − 1) × configured scaling</strong>. This is a planning projection, not a verified server calculation. Pity, reroll probabilities, affix restrictions, and upgrade spending aren't estimated.</p>
  <div class="actionsGroup"><button class="btn secondary" data-route="labs/pets">${icon('paw',16)} View pet loadout</button>
  <button class="btn secondary" data-route="calculators/pet">${icon('calculator',16)} Compound calculator</button></div>
 </section>`;
}
