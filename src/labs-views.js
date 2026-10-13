import {esc,icon} from './ui.js';
import {PET_BONUS_OPTIONS,normalizedPetBonusTargets} from './pet-simple-math.js';
import {RUNE_COLS,RUNE_ROWS,monsterLevelGrid,activeRuneBoard,RUNE_GRID_STAGES,RUNE_SHAPES,RUNE_FAMILIES,RUNE_FAMILY_DETAILS,RUNE_SECONDARIES,PET_AFFIX_DEFS,PET_HATCH_BONUSES,statName,petSummary} from './labs-engine.js';
export const FAMILY_ICONS=Object.freeze({Fury:'F',Fortitude:'Ft',Precision:'P',Wisdom:'W',Vitality:'V',Bond:'B',Fortune:'Fo'});
export function labsTabs(active='studio'){
 const pages=[['studio','labs/build','Equipment','shield'],['runes','labs/runes','Runes','gem'],['skills','labs/skills','Skills','git'],['passives','labs/passives','Passives','layers']];
 return `<nav class="labsTabs" aria-label="Character loadout sections">${pages.map(([id,url,label,glyph])=>`<button class="labsTab ${id===active?'active':''}" data-route="${url}" aria-current="${id===active?'page':'false'}">${icon(glyph,16)} ${label}</button>`).join('')}</nav>`;
}
const runeSummary=r=>`${r.family} · ${statName(r.secondary)}`;
export function monsterLevelControl(build,readonly=false,placement='forge'){
 const ml=build.monsterLevel||1,dim=monsterLevelGrid(ml);
 return `<div class="mlControl"><div class="mlControlTop"><div><span class="eyebrow">MONSTER LEVEL · RUNE GRID UNLOCKS</span><strong>${dim.cols}×${dim.rows} <small>· ${dim.cols*dim.rows} cells</small></strong></div><label>Highest Monster Level<input data-monster-level type="number" min="1" max="100000" inputmode="numeric" value="${ml}" ${readonly?'disabled':''}></label></div><input aria-label="Monster Level slider" data-monster-slider type="range" min="1" max="300" step="1" value="${Math.min(300,ml)}" ${readonly?'disabled':''}><div class="mlMilestones"><span>Start · 2×2</span><span>ML 150 · 6×5</span><span>ML 300 · 6×7</span></div><small class="mlHint">Rune capacity is unlocked by <b>Monster Level</b>, independently of character level. Your saved runes are never deleted when ML decreases.</small></div>`;
}
export function runeGridView(build,selection,readonly=false){
 const ml=build.monsterLevel||1,{cols,rows}=monsterLevelGrid(ml),{active,inactive}=activeRuneBoard(build.runeBoard||[],ml);
 const occupancy=new Map();for(const r of active)for(let row=r.y;row<r.y+r.h;row++)for(let col=r.x;col<r.x+r.w;col++)occupancy.set(`${col}:${row}`,r.id);
 const backdrop=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>`<button class="runeGridCell" style="grid-column:${x+1};grid-row:${y+1}" data-action="runeplace" data-arg="${x}|${y}" aria-label="Grid column ${x+1}, row ${y+1}${occupancy.has(`${x}:${y}`)?', occupied':''}" ${readonly?'disabled':''}></button>`).join('')).join('');
 const blocks=active.map(r=>`<button class="runePlaced family-${esc(r.family.toLowerCase())} ${selection===r.id?'selected':''}" style="grid-column:${r.x+1}/span ${r.w};grid-row:${r.y+1}/span ${r.h}" data-action="runeselect" data-arg="${esc(r.id)}" aria-label="${esc(runeSummary(r))}, column ${r.x+1}, row ${r.y+1}"><span class="runeGlyph">${esc(FAMILY_ICONS[r.family]||r.family[0])}</span><small>${esc(statName(r.secondary))}</small></button>`).join('');
 return `<section class="runeWorkspace"><div class="sectionCardTop"><h3>${icon('gem',19)} Rune loadout</h3><span>${active.length} runes · ${cols}×${rows}</span></div>${monsterLevelControl(build,readonly)}<div class="runeBoard" id="arcanaRuneBoard" style="--grid-cols:${cols};--grid-rows:${rows};aspect-ratio:${cols}/${rows}" role="group" aria-label="${cols} by ${rows} rune grid">${backdrop}${blocks}</div>${inactive.length?`<div class="runeInactiveNotice">${icon('info',17)} ${inactive.length} saved rune${inactive.length===1?'':'s'} outside this ML grid, kept safely for later. <button class="inlineLink" data-action="runeclearinactive" ${readonly?'disabled':''}>Remove inactive</button></div>`:''}<p class="boardFootnote">Choose a rune’s primary family, secondary stat, and shape. The unlocked grid automatically follows the build’s Monster Level.</p></section>`;
}
export function runeOptionsUI({family='Fury',shape='small',secondary='critical_damage',selected=null},build,readonly){
 const record=build.runeBoard?.find(r=>r.id===selected),focus=record||{family,shape,secondary};
 return `<section class="runeWorkbench"><div class="sectionCardTop"><h3>${record?'Selected rune':'Next rune'}</h3><span>${readonly?'Guide preview':'Build Studio loadout'}</span></div>
 <span class="eyebrow">PRIMARY RUNE FAMILY</span><div class="familyStrip">${RUNE_FAMILIES.map(v=>`<button class="familyToken family-${v.toLowerCase()} ${focus.family===v?'chosen':''}" data-action="runefamily" data-arg="${v}" ${readonly?'disabled':''}><span class="familyMark">${esc(FAMILY_ICONS[v])}</span>${esc(v)}</button>`).join('')}</div>
 <p class="runeStatLine">Primary stat: <strong>${esc(statName(RUNE_FAMILY_DETAILS[focus.family].primary))}</strong></p>
 <label class="runeSecondaryControl">SECONDARY STAT <select data-rune-secondary ${readonly?'disabled':''}>${RUNE_SECONDARIES.map(v=>`<option value="${esc(v)}" ${focus.secondary===v?'selected':''}>${esc(statName(v))}</option>`).join('')}</select></label>
 <span class="eyebrow">RUNE SHAPE</span><div class="shapeStrip">${Object.entries(RUNE_SHAPES).map(([id,def])=>`<button class="shapeToken ${focus.shape===id?'chosen':''}" data-action="runeshape" data-arg="${id}" ${readonly?'disabled':''}><span class="shapeGlyph" aria-hidden="true">${'▣'.repeat(def.w*def.h)}</span>${def.label}</button>`).join('')}</div>
 <div class="runeContext"><div><strong>${esc(runeSummary(focus))}</strong><small>${record?`Placed at column ${record.x+1}, row ${record.y+1}`:'Choose a starting square. Selection carries into Build Studio.'}</small></div>${record&&!readonly?`<button class="btn secondary" data-action="runeremove" data-arg="${esc(record.id)}">Remove</button>`:''}</div>
 <div class="actionsGroup">${readonly?`<button class="btn primary" data-action="clonebuild" data-arg="${esc(build.id)}">Copy into my build</button>`:`<button class="btn secondary" data-action="runeundo">${icon('back',15)} Undo</button><button class="btn secondary" data-action="runeclear">Clear grid</button>`}<button class="btn secondary" data-route="labs/build">${icon('shield',15)} Build Studio</button></div>
 <div class="notice">Primary families, secondaries, and six shapes come from the October 9 game configuration. Numerical rune scaling and runewords remain unavailable until their engine is validated.</div></section>`;
}
const hatchChoice=p=>`<option value="">Choose hatch bonus</option>${[...new Set([p.hatchBonus,...PET_HATCH_BONUSES])].filter(Boolean).map(v=>`<option value="${esc(v)}" ${p.hatchBonus===v?'selected':''}>${esc(statName(v))}</option>`).join('')}`;
const affixChoice=affix=>`<option value="">No affix</option>${PET_AFFIX_DEFS.map(v=>`<option value="${esc(v.name)}" ${affix.slug===v.name?'selected':''}>${esc(v.display_name.replace('{pet_element}','pet element'))}</option>`).join('')}`;
export function petLoadoutView(build,readonly=false){
 const chosen=normalizedPetBonusTargets(build);
 return `<section class="petBuildBonuses" aria-label="Four desired pet Drop Bonuses">
 <div class="petBuildHead"><strong>Pet Drop Bonuses</strong><small>${chosen.filter(Boolean).length}/4 selected</small></div>
 <p>Choose the four main bonuses you want for this build. Pet rarity, name, Compound and affix details belong in the calculators, not the loadout.</p>
 <div class="petBuildGrid">${chosen.map((type,i)=>`<label>Pet ${i+1}
 <select aria-label="Pet ${i+1} desired Drop Bonus" data-pet-bonus-target="${i}" ${readonly?'disabled':''}>
 <option value="">Choose bonus</option>
 ${PET_BONUS_OPTIONS.map(v=>`<option value="${esc(v.type)}" ${v.type===type?'selected':''}>${esc(v.label)}</option>`).join('')}
 </select></label>`).join('')}</div>
 </section>`;
}
export function petCompoundCalculatorView(build,mode='seasonal',levels=[0,0,0,0]){
 const pets=Array.from({length:4},(_,i)=>({equipped:true,compound:Math.max(0,Math.min(999,Math.floor(Number(levels?.[i])||0)))}));
 const summary=petSummary(pets,mode);
 return `<section class="petLabV8"><div class="petHero"><div><span class="eyebrow">ARCANA LABS / CALCULATOR</span><h2>Pet Compound &amp; Equalisation</h2><p>Experiment with Compound levels here. These values are separate from your Build Studio pet loadout.</p></div><span class="petConfigBadge">${mode==='permanent'?'Permanent':'Seasonal'}</span></div>
 <div class="petModeToggle" role="group" aria-label="Realm mode">${[['seasonal','Seasonal +10'],['permanent','Permanent +25']].map(([m,label])=>`<button data-action="petmode" data-arg="${m}" class="${mode===m?'selected':''}">${label}</button>`).join('')}</div>
 <div class="petSimpleGrid petCalcGrid">${summary.slots.map((p,i)=>`<label class="petCalcSlot"><strong>Pet ${i+1}${build.petSetup?.[i]?.name?' · '+esc(build.petSetup[i].name):''}</strong><span>Compound level</span><input data-calc-compound="${i}" type="number" inputmode="numeric" min="0" max="999" value="${p.compound}"><small>Effective level <b>${p.effective}</b>${p.limited?' · capped':''}</small></label>`).join('')}</div>
 <div class="petEquation"><span>Weakest Compound <strong>${summary.minimum}</strong></span><span class="operator">+</span><span>Equalisation allowance <strong>${summary.spread}</strong></span><span class="operator">=</span><span>Effective cap <strong>${summary.cap}</strong></span></div>
 <div class="actionsGroup"><button class="btn secondary" data-route="labs/pets">${icon('paw',16)} View pet loadout</button><button class="btn secondary" data-route="wiki/mechanic" data-params="id=pet-equalisation">${icon('book',16)} Read mechanics</button></div>
 <p class="notice">The effective Compound cap is calculated using the verified equalisation allowance. No Hatch Bonus growth or Drop Bonus value is invented. These trial levels do not overwrite your build.</p></section>`;
}
export function buildOverviewV7(build){
 const runeCount=build.runeBoard?.length||0,chosen=normalizedPetBonusTargets(build).filter(Boolean).length;
 return `<section class="linkedBuildV7"><div class="sectionCardTop"><h3>${icon('link',19)} Connected character</h3><span>One shared draft</span></div><div class="buildDashV7">${[
 ['Rune loadout',`${runeCount} saved · ML ${build.monsterLevel||1} grid ${monsterLevelGrid(build.monsterLevel||1).cols}×${monsterLevelGrid(build.monsterLevel||1).rows}`,'labs/runes','gem'],
 ['Pet bonus choices',`${chosen}/4 desired Drop Bonuses · edit in Build Studio`,'labs/build','paw'],
 ['Class Skills','Point allocation planner','labs/skills','git'],
 ['Passives','Tier-by-tier planner','labs/passives','layers']
 ].map(([name,desc,route,glyph])=>`<button class="buildDashItem" data-route="${route}">${icon(glyph,20)}<span><strong>${name}</strong><small>${desc}</small></span>${icon('arrow',16)}</button>`).join('')}</div>
 <p class="boardFootnote">Build Studio records your four desired pet bonuses. Compound effects and shard costs are handled only by the standalone calculators.</p></section>`;
}
