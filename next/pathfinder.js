// Pathfinder · Upgrade Costs for Arcana Next.
// Every number comes from the classic Pathfinder modules (same recipes, same math, same saved range),
// so results match the classic tool exactly. This file only lays them out.
import { allStages, quoteRange, normalizeRange, readRange, saveRange, normalizeItemQuantity } from '../src/pathfinder-range.js';
import { quoteFailureScenarios } from '../src/pathfinder-failures.js';
import { timelineStages, money } from '../src/pathfinder-timeline.js';
import { sourceMaterialGroups } from '../src/pathfinder-material-groups.js';
import { pathfinderZone } from '../src/pathfinder-zones.js';
import { initialQuickRange, shortGold } from '../src/quick-tools-view.js';
import { esc } from './core.js';

let rerender = () => {};
const st = { data: null, state: 'idle', catalog: [], range: readRange() };
async function load() {
  if (st.state !== 'idle') return;
  st.state = 'loading';
  try {
    const r = await fetch('/api/pathfinder/recipes', { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw Error('Recipe service ' + r.status);
    const payload = await r.json();
    // Same completeness check as the classic Pathfinder: never show a partial recipe set.
    if (timelineStages(payload, 'normal').length !== 6 || timelineStages(payload, 'awakened').length !== 30) throw Error('Incomplete recipe set');
    st.data = payload; st.state = 'ready';
    st.range = saveRange(initialQuickRange(payload, st.range));
  } catch { st.state = 'error'; }
  rerender();
  // The verified game index only sorts materials into biomes; costs never depend on it.
  fetch('/api/search/catalog', { signal: AbortSignal.timeout(10000) }).then(r => r.ok ? r.json() : null)
    .then(j => { if (j?.entries) { st.catalog = j.entries.filter(e => e?.id?.startsWith('game:')).map(e => ({ ...e, gameKind: e.kind })); rerender(); } }).catch(() => {});
}

const label = t => '<h2 class="nx-label">' + esc(t) + '</h2>';
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const attemptsFmt = n => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n);
const pct = v => (v * 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
const CLASSIC = [['timeline', 'Upgrade Map', 'Every step of every rank, one at a time'], ['upgrade', 'Rarity Reference', 'Rarity stats side by side'], ['compare', 'Compare Items', 'Two items, stat by stat']];

function selectStage(attr, value, stages, aria) {
  return '<select ' + attr + ' aria-label="' + aria + '">' + stages.map(s => '<option value="' + esc(s.id) + '"' + (s.id === value ? ' selected' : '') + '>' + esc(s.id + (s.name && s.id.startsWith('T') ? ' · ' + s.name : '')) + '</option>').join('') + '</select>';
}
function selectLevel(attr, stage, value, aria) {
  return '<select ' + attr + ' aria-label="' + aria + '">' + Array.from({ length: Math.max(0, stage?.max || 0) + 1 }, (_, n) => '<option value="' + n + '"' + (n === value ? ' selected' : '') + '>+' + n + '</option>').join('') + '</select>';
}

export function pathfinderView() {
  load();
  const head = '<a class="nx-back" href="#/tools">‹ Tools</a><header class="nx-page-head"><span class="nx-kicker">PATHFINDER</span><h1>Upgrade costs</h1><p>Pick where your gear is and where you want it. See every material to farm, grouped by biome.</p></header>';
  const more = '<section>' + label('More in Pathfinder') + '<div class="nx-list"><a class="nx-row" href="#/tools/mlxp"><span class="nx-row-text"><strong>ML XP</strong><small>Total XP, kills and time to your next Monster Levels</small></span><span class="nx-row-end">›</span></a>' + CLASSIC.map(([v, t, d]) => '<a class="nx-row" href="/#/calculators/pathfinder?view=' + v + '"><span class="nx-row-text"><strong>' + esc(t) + '</strong><small>' + esc(d) + ' · classic site</small></span><span class="nx-row-end">↗</span></a>').join('') + '</div></section>';
  if (st.state === 'error') return head + '<div class="nx-empty"><strong>Upgrade recipes didn’t load</strong><p>Costs are hidden rather than guessed. Try again in a moment.</p><button class="nx-btn" data-pf="retry">Try again</button></div>' + more;
  if (st.state !== 'ready') return head + '<div class="nx-loading" role="status">Loading the game’s upgrade recipes…</div>' + more;

  const snap = st.data, stages = allStages(snap), range = initialQuickRange(snap, st.range);
  const quote = quoteRange(snap, range, { stage: range.fromStage }), sc = quoteFailureScenarios(snap, quote);
  const mode = sc.available && ['min', 'expected', 'pity'].includes(range.costMode) ? range.costMode : 'expected';
  const sel = sc.available ? sc[mode] : quote;
  const shown = sc.available ? { ...quote, gold: sel.gold, materials: sel.materials, perItem: sc.perItem[mode], attempts: sel.attempts } : quote;
  const from = stages.find(s => s.id === range.fromStage), to = stages.find(s => s.id === range.toStage), count = quote.itemCount;

  const form = '<section class="nx-tool">' +
    '<div class="pf-ends"><fieldset><legend>From</legend>' + selectStage('data-pf-in="fromStage"', range.fromStage, stages, 'Starting rank') + selectLevel('data-pf-in="fromLevel"', from, range.fromLevel, 'Starting level') + '</fieldset>' +
    '<span class="nx-arrow" aria-hidden="true">→</span><fieldset><legend>To</legend>' + selectStage('data-pf-in="toStage"', range.toStage, stages, 'Target rank') + selectLevel('data-pf-in="toLevel"', to, range.toLevel, 'Target level') + '</fieldset></div>' +
    '<div class="pf-qty"><span><b>Items to upgrade</b><small>Same route for each item</small></span><div class="st-stepper"><button data-pf="qty" data-v="-1" aria-label="Remove one item"' + (count === 1 ? ' disabled' : '') + '>−</button><span><small>Items</small><b>' + count + '</b></span><button data-pf="qty" data-v="1" aria-label="Add one item"' + (count === 100 ? ' disabled' : '') + '>+</button></div></div>' +
    (sc.available ? '<div class="nx-seg" role="radiogroup" aria-label="Cost scenario">' + [['min', 'Minimum'], ['expected', 'Average'], ['pity', 'Pity max']].map(([k, l]) => '<button role="radio" aria-checked="' + (mode === k) + '" aria-selected="' + (mode === k) + '" data-pf="mode" data-v="' + k + '">' + l + '</button>').join('') + '</div>' : '') +
    '</section>';
  if (quote.error) return head + form + '<p class="nx-callout">' + esc(quote.error) + (quote.missing?.length ? ' Missing: ' + esc(quote.missing.slice(0, 3).join(', ')) : '') + '</p>' + more;

  const groups = sourceMaterialGroups(shown.materials, snap.materials || [], st.catalog);
  const each = new Map(shown.perItem.materials.map(m => [m.slug, m.quantity]));
  const matRow = (m, inZone) => '<a class="pf-mat" href="#/codex/material:' + esc(encodeURIComponent(m.slug)) + '"><span><b>' + esc(m.name) + '</b>' + ((m.sourceMonster || (!inZone && m.biome)) ? '<small>' + esc(m.sourceMonster || m.biome) + '</small>' : '') + '</span><span class="pf-q"><b>' + money(m.quantity) + '</b>' + (count > 1 ? '<small>' + money(each.get(m.slug) || 0n) + ' each</small>' : '') + '</span></a>';
  const zones = groups.filter(g => g.kind === 'biome' || g.kind === 'unknown');
  const other = groups.filter(g => g.kind === 'special').flatMap(g => g.materials).sort((a, b) => a.name.localeCompare(b.name));
  const summary = '<div class="nx-result" role="status"><small>' + esc((sc.available ? { min: 'MINIMUM', expected: 'AVERAGE', pity: 'PITY MAXIMUM' }[mode] : 'BASE') + ' · ' + range.fromStage + ' +' + range.fromLevel + ' → ' + range.toStage + ' +' + range.toLevel) + '</small>' +
    '<b class="big">' + plural(shown.materials.length, 'material') + '</b><span>' + plural(zones.length, 'biome') + ' to farm · ' + plural(count, 'item') + ' · ' + shortGold(shown.gold) + ' gold</span></div>';
  const zoneHtml = zones.map((g, i) => {
    const z = pathfinderZone(g.name);
    return '<details class="pf-zone"' + (i === 0 ? ' open' : '') + (z ? ' style="--zone:' + esc(z.color) + '"' : '') + '><summary><span><b>' + esc(g.name) + '</b><small>' + (z ? 'Tier ' + z.tier + ' · ' : '') + plural(g.materials.length, 'material') + '</small></span><span aria-hidden="true">⌄</span></summary><div class="pf-mats">' + g.materials.map(m => matRow(m, true)).join('') + '</div></details>';
  }).join('');
  const otherHtml = other.length ? '<section>' + label('Other upgrade materials') + '<div class="pf-mats pf-card">' + other.map(m => matRow(m, false)).join('') + '</div></section>' : '';
  const gold = '<section>' + label('Gold') + '<div class="pf-mats pf-card"><div class="pf-mat static"><span><b>' + esc(sc.available ? { min: 'Minimum', expected: 'Average', pity: 'Pity maximum' }[mode] : 'Base') + '</b></span><span class="pf-q"><b title="' + esc(money(shown.gold)) + ' gold">' + shortGold(shown.gold) + '</b></span></div></div>' +
    (sc.available ? '<p class="nx-fine">Minimum ' + shortGold(sc.min.gold) + ' · Average ' + shortGold(sc.expected.gold) + ' · Pity maximum ' + shortGold(sc.pity.gold) + '</p>' : '') + '</section>';

  let odds = '';
  if (sc.available && sc.perStep.length) {
    const first = sc.perStep.find(s => s.failChance > 0) || sc.perStep[0], cap = first?.pityCap || 1;
    const done = Math.max(0, Math.min(cap - 1, Math.trunc(Number(range.pityCount) || 0)));
    odds = '<details class="nx-help"><summary>Success chances and pity</summary>' +
      '<label class="nx-field pf-pity">Failed attempts already counted on your first upgrade<span><input type="number" min="0" max="' + Math.max(0, cap - 1) + '" step="1" inputmode="numeric" value="' + done + '" data-pf-in="pityCount" aria-label="Pity attempts already counted"> / ' + cap + '</span></label>' +
      '<p>Attempts: minimum ' + attemptsFmt(sc.min.attempts) + ' · average ' + attemptsFmt(sc.expected.attempts) + ' · pity max ' + attemptsFmt(sc.pity.attempts) + '</p>' +
      '<div class="nx-tablewrap"><table class="nx-table"><thead><tr><th scope="col">Step</th><th scope="col">Success</th><th scope="col">Average tries</th><th scope="col">Pity</th></tr></thead><tbody>' +
      sc.perStep.map(s => '<tr><th scope="row">' + esc(s.stage + (s.level ? ' +' + s.level : ' transition')) + '</th><td>' + pct(1 - s.failChance) + '</td><td>' + (s.failChance === 0 ? '1' : attemptsFmt(s.expectedAttempts)) + '</td><td>' + (s.failChance === 0 ? '—' : s.pityCap + (s.pityCount ? ' (' + s.pityCount + ' counted)' : '')) + '</td></tr>').join('') +
      '</tbody></table></div><p>Minimum assumes no failures. Average accounts for listed success odds, a 30% failure refund and the modeled pity limit. Pity maximum assumes each upgrade reaches its modeled limit. Pity carry-over between different upgrades is not independently verified.</p></details>';
  } else if (!sc.available) odds = '<p class="nx-fine">Failure and pity scenarios unavailable: ' + esc(String(sc.reason || 'verified failure odds missing').replace(/\.+$/, '')) + '. Base recipe costs are shown.</p>';

  return head + form + summary + '<section>' + label('Monster materials') + (zones.length ? zoneHtml : '<p class="nx-fine">No monster drops required.</p>') + '</section>' + otherHtml + gold + odds + more;
}

function update(patch) { st.range = saveRange({ ...initialQuickRange(st.data, st.range), ...patch }); rerender(); }
export function initPathfinder(render) {
  rerender = render;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pf]');
    if (!b || !st.data && b.dataset.pf !== 'retry') return;
    const a = b.dataset.pf;
    if (a === 'retry') { st.state = 'idle'; return rerender(); }
    // A range saved before quantity existed has none yet; treat that as 1 item.
    if (a === 'qty') return update({ quantity: normalizeItemQuantity(normalizeItemQuantity(initialQuickRange(st.data, st.range).quantity) + +b.dataset.v) });
    if (a === 'mode') return update({ costMode: b.dataset.v });
  });
  document.addEventListener('change', e => {
    const k = e.target.dataset?.pfIn;
    if (!k || !st.data) return;
    const cur = initialQuickRange(st.data, st.range), v = e.target.value;
    if (k === 'fromStage') return update({ fromStage: v, fromLevel: 0 });
    if (k === 'toStage') return update({ toStage: v, toLevel: allStages(st.data).find(s => s.id === v)?.max ?? 0 });
    if (k === 'fromLevel' || k === 'toLevel') return update({ [k]: +v });
    if (k === 'pityCount') return update({ pityCount: v, quantity: cur.quantity });
  });
}
// Exposed for tests: the exact numbers the view shows for a given recipe snapshot and range.
export function pathfinderNumbers(snapshot, raw) {
  const range = initialQuickRange(snapshot, raw), quote = quoteRange(snapshot, range, { stage: range.fromStage }), sc = quoteFailureScenarios(snapshot, quote);
  const mode = sc.available && ['min', 'expected', 'pity'].includes(range.costMode) ? range.costMode : 'expected';
  return sc.available ? { gold: sc[mode].gold, materials: sc[mode].materials } : { gold: quote.gold, materials: quote.materials };
}

// ---------- Pathfinder · ML XP ----------
// Numbers from the classic calculatePathfinderMlXp (screenshot-calibrated estimates, same saved plan).
import { PATHFINDER_ML_BIOMES, PATHFINDER_ML_MAX, calculatePathfinderMlXp, readPathfinderMlXp, savePathfinderMlXp } from '../src/pathfinder-ml-xp.js';
// Same display rules as the classic view: kills over 1,000 round to the nearest 10.
export const displayKills = n => Math.round(n < 1000 ? n : Math.round(n / 10) * 10).toLocaleString('en-US');
export function mlXpView() {
  const m = calculatePathfinderMlXp(readPathfinderMlXp()), p = m.plan, reg = m.variants[1];
  const quick = [1, 5, 10, 25, 50].map(d => '<button data-ml="add" data-v="' + d + '" aria-pressed="' + (p.target === Math.min(p.level + d, PATHFINDER_ML_MAX)) + '">+' + d + '</button>').join('') + '<button data-ml="end" aria-pressed="' + (p.target === PATHFINDER_ML_MAX) + '">ML ' + PATHFINDER_ML_MAX + '</button>';
  const route = p.farmMode === 'auto' ? (m.zones.length ? m.zones.map(z => z.name).join(' → ') : m.biome.name) : m.biome.name + ' (fixed)';
  return '<a class="nx-back" href="#/tools/pathfinder">‹ Pathfinder</a><header class="nx-page-head"><span class="nx-kicker">PATHFINDER</span><h1>ML XP</h1><p>Total XP, kills and time between two Monster Levels.</p></header>' +
    '<section class="nx-tool"><div class="st-two"><label class="nx-field">Current ML<input type="number" min="1" max="' + PATHFINDER_ML_MAX + '" inputmode="numeric" value="' + p.level + '" data-ml-in="level"></label>' +
    '<label class="nx-field">Target ML<input type="number" min="' + p.level + '" max="' + PATHFINDER_ML_MAX + '" inputmode="numeric" value="' + p.target + '" data-ml-in="target"></label></div>' +
    '<div class="nx-steps-row" role="group" aria-label="Quick target">' + quick + '</div>' +
    '<label class="nx-field">Progress toward ML ' + (p.level + 1) + ' <small>' + p.progress + '%</small><input type="range" min="0" max="99" value="' + p.progress + '" data-ml-in="progress" class="pf-range"></label>' +
    '<label class="nx-field">Biome progression<select data-ml-in="farmMode"><option value="auto"' + (p.farmMode === 'auto' ? ' selected' : '') + '>Auto · highest unlocked each level</option><option value="fixed"' + (p.farmMode === 'fixed' ? ' selected' : '') + '>Farm one biome throughout</option></select></label>' +
    (p.farmMode === 'fixed' ? '<label class="nx-field">Farming biome<select data-ml-in="biome">' + PATHFINDER_ML_BIOMES.map(b => '<option value="' + b.id + '"' + (b.id === p.biome ? ' selected' : '') + (b.unlockMl > p.level ? ' disabled' : '') + '>' + esc(b.name) + (b.unlockMl > p.level ? ' · unlocks ML ' + b.unlockMl : '') + '</option>').join('') + '</select></label>' : '') +
    '</section>' +
    '<div class="nx-result" role="status"><small>ML ' + m.level + ' → ' + m.target + ' · REGULAR MONSTERS · 1 KILL/SEC</small><b class="big">≈' + esc(reg.etaDisplay) + '</b><span>≈' + esc(m.requiredDisplay) + ' ML XP · ≈' + displayKills(reg.kills) + ' kills</span></div>' +
    (m.earlyEstimated ? '<p class="nx-callout"><strong>Early ML estimates.</strong> ' + (m.sparseEstimated ? 'ML 43–183 is interpolated between limited player observations; results may differ from the game.' : 'Low-level results use player reports and fitted values between observations.') + '</p>' : '') +
    '<section>' + label('Monster comparison · ' + m.levels + ' levels') + '<div class="nx-tablewrap"><table class="nx-table"><thead><tr><th scope="col">Monster</th><th scope="col">XP</th><th scope="col">Kills</th><th scope="col">Ideal time</th></tr></thead><tbody>' +
    m.variants.map(v => '<tr><th scope="row">' + esc(v.label) + '</th><td>' + esc(v.delta) + '</td><td>≈' + displayKills(v.kills) + '</td><td>≈' + esc(v.etaDisplay) + '</td></tr>').join('') + '</tbody></table></div></section>' +
    '<p class="nx-fine"><b>Farming route:</b> ' + esc(route) + '</p>' +
    (m.isComplete ? '<p class="nx-callout">You’re already at the target Monster Level. Pick a higher target.</p>' : '') +
    (!m.modifiersAvailable ? '<p class="nx-fine">The first two biomes don’t get the ±10% monster-position bonuses.</p>' : '') +
    '<p class="nx-fine">Estimates assume one-shotting at each ML, starting ' + (m.progress ? m.progress + '% through your current level' : 'at 0% progress') + ', at one ML XP-awarding kill per second. Auto progression assumes you can one-shot each newly unlocked biome. Frenzy kills don’t award ML XP. XP requirements are screenshot-based estimates.</p>';
}
export function initMlXp(render) {
  const save = patch => { savePathfinderMlXp({ ...readPathfinderMlXp(), ...patch }); render(); };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ml]');
    if (!b) return;
    const p = readPathfinderMlXp();
    if (b.dataset.ml === 'add') save({ target: Math.min(p.level + +b.dataset.v, PATHFINDER_ML_MAX) });
    if (b.dataset.ml === 'end') save({ target: PATHFINDER_ML_MAX });
  });
  document.addEventListener('change', e => {
    const k = e.target.dataset?.mlIn;
    if (!k) return;
    const v = e.target.value;
    if (k === 'level') { const p = readPathfinderMlXp(); return save({ level: v, target: Math.max(+v || 1, p.target) }); }
    save({ [k]: k === 'farmMode' || k === 'biome' ? v : +v });
  });
  document.addEventListener('input', e => { if (e.target.dataset?.mlIn === 'progress') { const s = e.target.previousElementSibling; if (s && s.tagName === 'SMALL') s.textContent = e.target.value + '%'; } });
}
