// Calculators for Arcana Next. The math comes straight from the classic modules, so results are
// identical to the classic tools, and the same saved inputs carry over between the two sites.
import {
  PET_HATCH_RARITIES, petBonusEntries, bonusName, readCompoundPlan, saveCompoundPlan, compoundBonus,
  readAffixCostPlan, saveAffixCostPlan, affixCost
} from '../src/pet-simple-math.js';
import { PET_AFFIX_SNAPSHOT } from '../src/verified-pet-affixes.js';
import { FARM_TIERS, readFarmPlan, saveFarmPlan, compareFarm } from '../src/farm-compare.js';
import { esc } from './core.js';

let rerender = () => {};
const num = n => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const fmt3 = n => Number(n).toLocaleString('en-US', { maximumFractionDigits: 3 });
const cap = s => s[0].toUpperCase() + s.slice(1);
const COMPOUND_CAP = { uncommon: 10, rare: 20, epic: 30, legendary: 300 };
const label = t => '<h2 class="nx-label">' + esc(t) + '</h2>';
const back = '<a class="nx-back" href="#/tools">‹ Tools</a>';
const head = (kicker, title, intro) => '<header class="nx-page-head"><span class="nx-kicker">' + esc(kicker) + '</span><h1>' + esc(title) + '</h1><p>' + intro + '</p></header>';
const help = (summary, body) => '<details class="nx-help"><summary>' + esc(summary) + '</summary><p>' + body + '</p></details>';

// ---------- Compound → Drop Bonus ----------
function compoundView() {
  const p = readCompoundPlan(), max = COMPOUND_CAP[p.rarity];
  return back + head('PET CALCULATOR', 'Compound level', 'Choose a rarity, a bonus and a Compound Level. Starting values come from the game config.') +
    '<section class="nx-tool">' +
    '<div class="st-seg4" role="group" aria-label="Pet rarity">' + PET_HATCH_RARITIES.map(r => '<button aria-pressed="' + (r === p.rarity) + '" data-tool="rarity" data-v="' + r + '">' + cap(r) + '</button>').join('') + '</div>' +
    '<label class="nx-field">Drop Bonus<select data-tool-input="bonus">' + petBonusEntries(p.rarity).map(x => '<option value="' + esc(x.type) + '"' + (x.type === p.bonus ? ' selected' : '') + '>' + esc(bonusName(x.type)) + '</option>').join('') + '</select></label>' +
    '<label class="nx-field">Compound Level <small>0–' + max + '</small><input type="number" inputmode="numeric" min="0" max="' + max + '" value="' + p.level + '" data-tool-input="level"></label>' +
    '<div class="nx-steps-row" role="group" aria-label="Adjust Compound Level">' + [1, 5, 10, 25].map(n => '<button data-tool="lvstep" data-v="' + n + '">+' + n + '</button>').join('') + '<button data-tool="lvreset">Reset</button></div>' +
    '<div id="nxToolOut">' + compoundOut() + '</div></section>' +
    help('How Compound and Equalisation work', 'Compound increases the selected main pet bonus, not the pet’s affixes. When four pets are equipped, the weakest equipped Compound Level limits stronger pets to weakest +10 (seasonal) or +25 (permanent). This calculator shows the raw bonus before that cap.') +
    '<p class="nx-fine">Based on the game configuration, with the configured steps and per-level rounding.</p>';
}
function compoundOut() {
  const info = compoundBonus(readCompoundPlan());
  if (!info) return '<div class="st-result"><span>This rarity can’t roll that bonus.</span><b>—</b></div>';
  return '<div class="nx-result" role="status"><small>' + esc(bonusName(info.bonus)) + '</small><div class="nx-result-row"><span><small>At C0</small><b>' + num(info.base) + info.unit + '</b></span><span class="nx-arrow">→</span><span><small>At C' + info.level + '</small><b class="big">' + num(info.amount) + info.unit + '</b></span></div><small>' + esc(info.method) + '</small></div>';
}

// ---------- Affix level cost ----------
function affixView() {
  const p = readAffixCostPlan(), def = PET_AFFIX_SNAPSHOT.affixes.find(x => x.name === p.affix), max = def.max_level || 999;
  return back + head('PET CALCULATOR', 'Affix level cost', 'Already have the affix? Enter its current and target levels to see the Pet Shards needed.') +
    '<section class="nx-tool">' +
    '<label class="nx-field">Pet affix<select data-tool-input="affix">' + PET_AFFIX_SNAPSHOT.affixes.map(x => '<option value="' + esc(x.name) + '"' + (x.name === p.affix ? ' selected' : '') + '>' + esc(x.display_name.replace('{pet_element}', 'pet element')) + '</option>').join('') + '</select></label>' +
    '<div class="st-two"><label class="nx-field">Current level<input type="number" inputmode="numeric" min="1" max="' + max + '" value="' + p.currentLevel + '" data-tool-input="cur"></label>' +
    '<label class="nx-field">Target level<input type="number" inputmode="numeric" min="1" max="' + max + '" value="' + p.targetLevel + '" data-tool-input="tgt"></label></div>' +
    '<div class="nx-steps-row" role="group" aria-label="Raise target level">' + [1, 10, 25, 50, 100].map(n => '<button data-tool="tgtstep" data-v="' + n + '">+' + n + '</button>').join('') + '<button data-tool="affreset">Reset</button></div>' +
    '<div id="nxToolOut">' + affixOut() + '</div></section>' +
    help('What is included in this cost?', 'Upgrade-shard totals use the config’s level cost divisor (20) and sum the cost of each level. All Class Skills uses its configured special upgrade cost. Rerolls are listed separately; the cost of getting a specific affix through random rerolls, pity progress and extra slots is <strong>not</strong> included.') +
    '<p class="nx-fine">Based on the game configuration.</p>';
}
function affixOut() {
  const r = affixCost(readAffixCostPlan());
  return '<div class="nx-result" role="status"><small>Upgrade cost to target</small><b class="big">' + num(r.shards) + ' <small>Pet Shards</small></b>' +
    '<div class="nx-result-meta"><span>Lv ' + r.currentLevel + ' → Lv ' + r.targetLevel + '</span><span>Next upgrade: ' + (r.nextUpgrade === null ? 'max level' : num(r.nextUpgrade) + (r.nextUpgrade === 1 ? ' shard' : ' shards')) + '</span></div>' +
    '<small>' + esc(r.label) + ': ' + num(r.currentValue) + r.valueUnit + ' → ' + num(r.targetValue) + r.valueUnit + '</small></div>' +
    '<p class="nx-fine">Add an affix: <b>' + r.addSlotShards + ' shards</b> · One reroll: <b>' + r.rerollShards + ' shards</b></p>';
}

// ---------- ML farming comparator ----------
function mlView() {
  const p = readFarmPlan(), later = p.mode === 'later';
  return back + head('FARMING', 'ML farming comparator', 'Enter your measured average seconds per <strong>ML XP-awarding kill</strong>. Arcana compares relative ML XP per second, not guessed monster health or absolute XP.') +
    '<p class="nx-callout"><strong>Frenzy kills don’t grant Monster Level XP.</strong> Leave them out when you time your kills.</p>' +
    '<section class="nx-tool"><div class="nx-seg" role="radiogroup" aria-label="Which biome are you farming?">' +
    [['later', 'Murky Depths onward'], ['earlier', 'Earlier biome']].map(([v, l]) => '<button role="radio" aria-selected="' + (p.mode === v) + '" aria-checked="' + (p.mode === v) + '" data-tool="mode" data-v="' + v + '">' + l + '</button>').join('') + '</div>' +
    FARM_TIERS.map((t, i) => '<label class="nx-field nx-farmrow"><span><b>' + esc(t.label) + '</b><small>' + (later ? (t.factor === 1 ? 'Normal XP' : '×' + fmt3(t.factor) + ' ML XP') : 'Normal XP') + '</small></span>' +
      '<span class="nx-farmin"><input type="number" inputmode="decimal" min=".01" max="300" step=".01" placeholder="Your time" value="' + (p.times[i] ?? '') + '" data-tool-input="time" data-i="' + i + '" aria-label="Average seconds per ML XP-awarding kill: ' + esc(t.label) + '"><small>sec / kill</small></span></label>').join('') +
    '<div id="nxToolOut">' + mlOut() + '</div>' +
    '<button class="nx-btn" data-tool="farmreset">Clear times</button></section>' +
    '<p class="nx-fine">The October 2026 Season 2 patch notes specify −10% ML XP for the weakest and +10% for the strongest monster from Murky Depths onward. Times are entered by you and stored on this device. Earlier biomes use equal XP factors in this comparison.</p>' +
    '<div class="nx-list"><a class="nx-row" href="#/codex"><span class="nx-row-text"><strong>Browse monsters</strong><small>Levels, biomes and weaknesses in the Codex</small></span><span class="nx-row-end">›</span></a></div>';
}
function mlOut() {
  const d = compareFarm(readFarmPlan());
  const win = d.leader
    ? '<div class="nx-result" role="status"><small>BEST OF YOUR MEASURED OPTIONS</small><b class="big">' + esc(d.leader.label) + '</b><span>Relative ML XP per second: <b>' + fmt3(d.leader.rate) + '</b>.' + (d.advantage === null ? '' : ' About <b>' + fmt3(d.advantage) + '%</b> more than your next-fastest option.') + '</span></div>'
    : '<p class="nx-callout">Enter average kill times for at least two monsters to compare them.</p>';
  const be = d.strongestBreakEven !== null ? '<p class="nx-callout"><strong>Break-even:</strong> at ' + fmt3(d.rows[0].time) + ' seconds for the weakest monster, the strongest must die in under <strong>' + fmt3(d.strongestBreakEven) + ' seconds</strong> to give more ML XP per second.</p>' : '';
  return win + be;
}

// ---------- public ----------
export const NATIVE_TOOLS = ['pet', 'affix', 'ml'];
export function toolView(id) {
  return id === 'pet' ? compoundView() : id === 'affix' ? affixView() : id === 'ml' ? mlView() : '';
}
const out = html => { const o = document.getElementById('nxToolOut'); if (o) o.innerHTML = html; };
function onInput(el, commit) {
  const k = el.dataset.toolInput;
  if (k === 'bonus') { saveCompoundPlan({ ...readCompoundPlan(), bonus: el.value }); return out(compoundOut()); }
  if (k === 'level') { if (el.value === '' && !commit) return; saveCompoundPlan({ ...readCompoundPlan(), level: el.value }); out(compoundOut()); if (commit) rerender(); return; }
  if (k === 'affix') { const d = PET_AFFIX_SNAPSHOT.affixes.find(x => x.name === el.value); saveAffixCostPlan({ affix: el.value, currentLevel: 1, targetLevel: Math.min(10, d?.max_level || 10) }); return rerender(); }
  if (k === 'cur' || k === 'tgt') {
    if (el.value === '' && !commit) return;
    const p = readAffixCostPlan();
    saveAffixCostPlan(k === 'cur' ? { ...p, currentLevel: el.value } : { ...p, targetLevel: el.value });
    out(affixOut()); if (commit) rerender(); return;
  }
  if (k === 'time') { const p = readFarmPlan(), times = [...p.times]; times[+el.dataset.i] = el.value; saveFarmPlan({ ...p, times }); return out(mlOut()); }
}
export function initTools(render) {
  rerender = render;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-tool]');
    if (!b) return;
    const a = b.dataset.tool, v = b.dataset.v;
    if (a === 'rarity') saveCompoundPlan({ ...readCompoundPlan(), rarity: v });
    if (a === 'lvstep') { const p = readCompoundPlan(); saveCompoundPlan({ ...p, level: p.level + +v }); }
    if (a === 'lvreset') saveCompoundPlan({ ...readCompoundPlan(), level: 0 });
    if (a === 'tgtstep') { const p = readAffixCostPlan(); saveAffixCostPlan({ ...p, targetLevel: p.targetLevel + +v }); }
    if (a === 'affreset') { const p = readAffixCostPlan(); saveAffixCostPlan({ ...p, currentLevel: 1, targetLevel: 1 }); }
    if (a === 'mode') saveFarmPlan({ ...readFarmPlan(), mode: v });
    if (a === 'farmreset') saveFarmPlan({ mode: readFarmPlan().mode, times: [null, null, null] });
    rerender();
  });
  document.addEventListener('input', e => { if (e.target.dataset?.toolInput) onInput(e.target, false); });
  document.addEventListener('change', e => { if (e.target.dataset?.toolInput) onInput(e.target, true); });
}
