import {esc,icon} from './ui.js';
import {gameArt} from './assets.js';
import {RARITIES,GEAR_ITEMS,DROP_BONUSES,GEAR_SOURCE,baseItem,allowedGearForSlot,asGear,gearLabel,bonusRange,bonusUnit} from './build-studio-data.js';

const art=(g,entry)=>gameArt({id:g.id,kind:'item',title:g.name,tier:entry?.awaken?'A'+entry.awaken:entry?.rarity?'T'+entry.rarity:undefined},72);
const niceStat=s=>String(s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export function gearPickerMarkup(slot,className,query=''){
 const q=String(query||'').trim().toLowerCase();
 const list=allowedGearForSlot(slot,className).filter(g=>!q||g.name.toLowerCase().includes(q));
 return list.length?list.map(g=>`<button type="button" class="resultRow gearPickRow" data-action="selectitem" data-arg="${esc(g.id)}"><span class="tinyIcon tinyGameArt">${art(g)}</span><span class="resultText"><strong>${esc(g.name)}</strong><small>${esc(g.slot.replace(/_/g,' '))}${g.twoHanded?' · Two-handed':''}</small></span>${icon('arrow',16)}</button>`).join(''):'<p class="emptyMini">No verified equipment is available for this slot and class in the October 9 game config.</p>';
}
const option=(value,name,current)=>`<option value="${esc(value)}" ${String(value)===String(current)?'selected':''}>${esc(name)}</option>`;
export function gearEditorMarkup(slot,raw,className='Warrior'){
 const entry=asGear(raw),gear=baseItem(entry);
 if(!entry||!gear)return '<div class="notice">The selected item is not in our verified equipment dataset.</div>';
 const rarity=entry.rarity||2,bonusTier=entry.bonusTier||Math.max(2,rarity),bonus=DROP_BONUSES.find(b=>b.id===entry.bonusId);
 const valid=DROP_BONUSES.filter(b=>bonusRange(b.id,bonusTier)),range=bonus?bonusRange(bonus.id,bonusTier):null;
 const unit=bonus?bonusUnit(bonus.stat):'%';
 return `<section class="gearEditor" aria-label="Configure equipped item">
  <div class="gearEditHero"><span class="gearEditArt">${art(gear,entry)}</span><div><span class="eyebrow">EDIT EQUIPMENT · ${esc(slot.replace(/([A-Z])/g,' $1').toUpperCase())}</span><h3>${esc(gear.name)}</h3><small>${esc(gear.slot.replace(/_/g,' '))}${gear.twoHanded?' · Two-handed':''} · ${esc(className)}</small></div></div>
  <button class="btn secondary full gearChangeBase" type="button" data-action="gearchangebase">${icon('search',17)} Change base item</button>
  <div class="gearEditFields">
   <label>Item rarity<select data-gear-field="rarity" aria-label="Item rarity">${RARITIES.map((r,i)=>option(i+1,r,rarity)).join('')}</select></label>
   <label>Awakening<select data-gear-field="awaken" aria-label="Awakening level" ${rarity!==6?'disabled':''}>${Array.from({length:31},(_,n)=>option(n,n?'A'+n:'Not awakened',entry.awaken)).join('')}</select></label>
   <label>Drop Bonus tier<select data-gear-field="bonusTier" aria-label="Drop Bonus tier" ${rarity===1?'disabled':''}>${Array.from({length:8},(_,i)=>i+2).map(n=>option(n,'Tier '+n+(n>6?' · boosted':''),bonusTier)).join('')}</select></label>
   <label>Drop Bonus<select data-gear-field="bonusId" aria-label="Drop Bonus" ${rarity===1?'disabled':''}>${option('','No Drop Bonus',entry.bonusId||'')}${valid.map(b=>option(b.id,b.name+' · '+niceStat(b.stat),entry.bonusId)).join('')}</select></label>
  </div>
  <section class="gearRangeCard" aria-live="polite">
   ${bonus&&range?`<strong>${esc(bonus.name)} · T${bonusTier}</strong><span class="gearRange">${range[0]}${unit} – ${range[1]}${unit}</span><small>Verified possible roll range. This is a value range, not a drop probability.</small><label>Exact roll (optional)<input data-gear-field="roll" type="number" inputmode="decimal" min="${range[0]}" max="${range[1]}" step="any" placeholder="${range[0]} to ${range[1]}" value="${entry.roll??''}"></label>`:
   `<strong>${rarity===1?'Normal rarity':'No Drop Bonus selected'}</strong><small>${rarity===1?'Normal items do not receive a standard Drop Bonus. Exceptional boosted drops still require separate verification.':'Choose a bonus to display its verified value range.'}</small>`}
  </section>
  <p class="gearSourceNote">Source: ${esc(GEAR_SOURCE)}. Base-item slot, class and two-handed restrictions are enforced. The snapshot does not document bonus-type restrictions by equipment slot, so these cannot yet be verified. Tiers 7–9 are boosted bonus tiers.</p>
  <div class="gearEditButtons"><button type="button" class="btn primary" data-action="gearsave">${icon('check',18)} Save item</button><button type="button" class="btn secondary" data-action="gearclear">Unequip</button><button type="button" class="btn secondary" data-close="layer">Cancel</button></div>
 </section>`;
}
export function gearInspectMarkup(slot,raw){
 const entry=asGear(raw),g=baseItem(entry),bonus=DROP_BONUSES.find(x=>x.id===entry?.bonusId),range=bonus?bonusRange(bonus.id,entry.bonusTier):null;
 if(!g)return '<p class="notice">Item details unavailable.</p>';
 return `<div class="gearEditHero"><span class="gearEditArt">${art(g,entry)}</span><div><h3>${esc(g.name)}</h3><small>${esc(gearLabel(entry))} · ${esc(slot)}</small></div></div>
 ${bonus&&range?`<div class="gearRangeCard"><strong>${esc(bonus.name)}</strong><span class="gearRange">${entry.roll??(range[0]+'–'+range[1])}${bonusUnit(bonus.stat)}</span></div>`:''}
 <p class="mutedSmall">Read-only build. Copy it into your own workspace to change equipment.</p>`;
}
