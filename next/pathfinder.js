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
const st = { data: null, state: 'idle', catalog: [], range: readRange(), view: 'slot', codex: null };
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
  // Material art comes from the Codex that ships with the app.
  import('./codex-data.js').then(m => { st.codex = new Map(m.default.entries.map(e => [e.id, e])); rerender(); }).catch(() => {});
  // The verified game index only sorts materials into biomes; costs never depend on it.
  fetch('/api/search/catalog', { signal: AbortSignal.timeout(10000) }).then(r => r.ok ? r.json() : null)
    .then(j => { if (j?.entries) { st.catalog = j.entries.filter(e => e?.id?.startsWith('game:')).map(e => ({ ...e, gameKind: e.kind })); rerender(); } }).catch(() => {});
}

const label = t => '<h2 class="nx-label">' + esc(t) + '</h2>';
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const attemptsFmt = n => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n);
const pct = v => (v * 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
// The two main Pathfinder tools sit side by side at the top of both pages.
export const pfSwitch = on => '<nav class="pf-switch" aria-label="Pathfinder">' + [['#/tools/pathfinder', 'Upgrade costs', 'up'], ['#/tools/mlxp', 'ML XP', 'ml']].map(([h, l, k]) => '<a href="' + h + '"' + (k === on ? ' aria-current="page"' : '') + '>' + l + '</a>').join('') + '</nav>';
const MORE = [['#/tools/upgrade-map', 'Upgrade map', 'Every step of every rank, one at a time'], ['#/tools/compare', 'Compare items', 'Two items’ base ranges at the same rarity'], ['#/tools/rarity', 'Rarity reference', 'Base cost of each rarity upgrade']];

function selectStage(attr, value, stages, aria) {
  return '<select ' + attr + ' aria-label="' + aria + '">' + stages.map(s => '<option value="' + esc(s.id) + '"' + (s.id === value ? ' selected' : '') + '>' + esc(s.id + (s.name && s.id.startsWith('T') ? ' · ' + s.name : '')) + '</option>').join('') + '</select>';
}
function selectLevel(attr, stage, value, aria) {
  return '<select ' + attr + ' aria-label="' + aria + '">' + Array.from({ length: Math.max(0, stage?.max || 0) + 1 }, (_, n) => '<option value="' + n + '"' + (n === value ? ' selected' : '') + '>+' + n + '</option>').join('') + '</select>';
}

export function pathfinderView() {
  load();
  const head = '<a class="nx-back" href="#/tools">‹ Tools</a>' + pfSwitch('up') + '<header class="nx-page-head"><span class="nx-kicker">PATHFINDER</span><h1>Upgrade costs</h1><p>Pick where your gear is and where you want it. See every material to farm, grouped by biome.</p></header>';
  const more = '<section>' + label('More in Pathfinder') + '<div class="nx-list">' + MORE.map(([h, t, d]) => '<a class="nx-row" href="' + h + '"><span class="nx-row-text"><strong>' + esc(t) + '</strong><small>' + esc(d) + '</small></span><span class="nx-row-end">›</span></a>').join('') + '</div></section>';
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
    '<div class="pf-qty"><span><b>Equipment slots</b><small>How many slots are you taking along this route? Each slot costs the same.</small></span><div class="st-stepper"><button data-pf="qty" data-v="-1" aria-label="One fewer slot"' + (count === 1 ? ' disabled' : '') + '>−</button><span><small>Slots</small><b>' + count + '</b></span><button data-pf="qty" data-v="1" aria-label="One more slot"' + (count === 100 ? ' disabled' : '') + '>+</button></div></div>' +
    '</section>';
  if (quote.error) return head + form + '<p class="nx-callout">' + esc(quote.error) + (quote.missing?.length ? ' Missing: ' + esc(quote.missing.slice(0, 3).join(', ')) : '') + '</p>' + more;

  // Every material with its minimum, average and maximum, per slot (or for all slots), lowest biome first.
  const perSlot = st.view !== 'all' || count === 1;
  const modes = sc.available ? ['min', 'expected', 'pity'] : ['base'];
  const qty = m => sc.available ? (perSlot ? sc.perItem[m] : sc[m]) : (perSlot ? quote.perItem : quote);
  const byMode = Object.fromEntries(modes.map(m => [m, new Map((qty(m).materials || []).map(x => [x.slug, x.quantity]))]));
  const gold = Object.fromEntries(modes.map(m => [m, qty(m).gold]));
  const all = [...new Map(modes.flatMap(m => qty(m).materials || []).map(x => [x.slug, x])).values()];
  const groups = sourceMaterialGroups(all, snap.materials || [], st.catalog);
  const cells = (slug, fmt = money) => modes.map(m => '<b class="pf-n pf-n-' + m + '">' + fmt(slug === null ? gold[m] : byMode[m].get(slug) || 0) + '</b>').join('');
  const heads = '<div class="pf-cols" aria-hidden="true"><span></span>' + (sc.available ? '<b>Min</b><b>Avg</b><b>Max</b>' : '<b>Base</b>') + '</div>';
  const matArt = slug => { const e = st.codex?.get('material:' + slug); return e?.art ? '<i class="pf-art" style="background-image:url(' + esc(e.art.url) + ');background-size:' + esc(e.art.size) + ';background-position:' + esc(e.art.pos) + '"></i>' : '<i class="pf-art pf-art-none"></i>'; };
  const matRow = m => '<a class="pf-row" href="#/codex/material:' + esc(encodeURIComponent(m.slug)) + '">' + matArt(m.slug) + '<span class="pf-name"><b>' + esc(m.name) + '</b>' + (m.sourceMonster ? '<small>' + esc(m.sourceMonster) + '</small>' : '') + '</span>' + cells(m.slug) + '</a>';
  const biomeHead = g => { const z = pathfinderZone(g.name); return '<div class="pf-biome"' + (z ? ' style="--zone:' + esc(z.color) + '"' : '') + '>' + (z ? '<i class="pf-biome-art" style="background-position:' + z.atlasX + '% ' + z.atlasY + '%"></i>' : '') + '<span><b>' + esc(g.name) + '</b><small>' + (z ? 'Tier ' + z.tier : g.kind === 'special' ? 'Forge and special' : 'Source not verified') + '</small></span></div>'; };
  const list = groups.map(g => '<div class="pf-group"' + (pathfinderZone(g.name) ? ' style="--zone:' + esc(pathfinderZone(g.name).color) + '"' : '') + '>' + biomeHead(g) + g.materials.map(matRow).join('') + '</div>').join('');
  const zoneCount = groups.filter(g => g.kind === 'biome').length;
  const summary = '<div class="nx-result pf-summary" role="status"><small>' + esc(range.fromStage + ' +' + range.fromLevel + ' → ' + range.toStage + ' +' + range.toLevel) + (count > 1 ? ' · ' + count + ' SLOTS' : '') + '</small>' +
    '<div class="pf-sumgrid">' + modes.map(m => '<span class="pf-sum-' + m + '"><small>' + ({ min: 'Minimum', expected: 'Average', pity: 'Maximum', base: 'Base cost' })[m] + '</small><b>' + shortGold(gold[m]) + '</b><small>gold' + (perSlot && count > 1 ? ' per slot' : '') + '</small></span>').join('') + '</div>' +
    '<span>' + plural(all.length, 'material') + ' from ' + plural(zoneCount, 'biome') + '</span></div>';
  const legend = sc.available ? '<p class="nx-fine pf-legend"><b>Min</b> no failed attempts. <b>Avg</b> what you will most likely spend. <b>Max</b> every attempt fails until pity.</p>' : '';
  const scope = count > 1 ? '<div class="nx-seg" role="tablist" aria-label="Amounts for">' + [['slot', 'Per slot'], ['all', 'All ' + count + ' slots']].map(([k, l]) => '<button role="tab" aria-selected="' + ((k === 'all') === !perSlot) + '" data-pf="view" data-v="' + k + '">' + l + '</button>').join('') + '</div>' : '';
  const mats = '<section>' + label('Materials in farming order') + scope + legend + '<div class="pf-table">' + heads +
    '<div class="pf-row pf-gold"><i class="pf-art pf-art-gold"></i><span class="pf-name"><b>Gold</b></span>' + cells(null, shortGold) + '</div>' + list + '</div></section>';

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

  return head + form + summary + '<!--pf-save-->' + mats + odds + more;
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
    if (a === 'view') { st.view = b.dataset.v; return rerender(); }
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
  return '<a class="nx-back" href="#/tools">‹ Tools</a>' + pfSwitch('ml') + '<header class="nx-page-head"><span class="nx-kicker">PATHFINDER</span><h1>ML XP</h1><p>Total XP, kills and time between two Monster Levels.</p></header>' +
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

// ---------- Pathfinder · Upgrade Map, Rarity Reference, Compare Items ----------
// Upgrade Map uses the classic timelineModel and saved view; Rarity Reference and Compare use the
// classic verified item snapshot (checked equal to the current config for all 40 items x 6 tiers).
import { PATHFINDER_SLOTS, MODE_LABELS, readQuickView, saveQuickView, timelineModel, stageStepLabel } from '../src/pathfinder-timeline.js';
import { VERIFIED_ITEM_SNAPSHOT, verifiedCompare, verifiedTierUpgrade } from '../src/verified-item-snapshot.js';
const pfBack = '<a class="nx-back" href="#/tools/pathfinder">‹ Pathfinder</a>';
const pfHead = (t, p) => pfBack + '<header class="nx-page-head"><span class="nx-kicker">PATHFINDER</span><h1>' + esc(t) + '</h1><p>' + p + '</p></header>';
const matList = mats => '<div class="pf-mats pf-card">' + mats.map(m => '<a class="pf-mat" href="#/codex/material:' + esc(encodeURIComponent(m.slug)) + '"><span><b>' + esc(m.name) + '</b></span><span class="pf-q"><b>' + money(m.quantity) + '</b></span></a>').join('') + '</div>';

export function upgradeMapView() {
  load();
  if (st.state === 'error') return pfHead('Upgrade map', '') + '<div class="nx-empty"><strong>Upgrade recipes didn’t load</strong><button class="nx-btn" data-pf="retry">Try again</button></div>';
  if (st.state !== 'ready') return pfHead('Upgrade map', '') + '<div class="nx-loading">Loading the game’s upgrade recipes…</div>';
  const model = timelineModel(st.data, readQuickView());
  if (!model) return pfHead('Upgrade map', '') + '<p class="nx-callout">No verified upgrade recipes are available.</p>';
  const { view, stages, active, steps, step, chapter } = model;
  const gold = n => shortGold(n);
  return pfHead('Upgrade map', 'Pick a slot, then step through each upgrade to see exactly what it costs.') +
    '<section class="nx-tool"><label class="nx-field">Equipment slot<select data-map-in="slot">' + PATHFINDER_SLOTS.map(s => '<option value="' + s.id + '"' + (s.id === view.slot ? ' selected' : '') + '>' + esc(s.label) + '</option>').join('') + '</select></label>' +
    '<div class="nx-seg" role="radiogroup" aria-label="Upgrade path">' + Object.entries(MODE_LABELS).map(([id, n]) => '<button role="radio" aria-checked="' + (id === view.mode) + '" aria-selected="' + (id === view.mode) + '" data-map="mode" data-v="' + id + '">' + esc(n) + '</button>').join('') + '</div></section>' +
    '<section>' + label((view.mode === 'awakened' ? 'Awakening ranks' : 'Rarity tiers') + ' · ' + stages.length) + '<div class="st-chips nx-scrollx pf-rail" role="group" aria-label="Stages">' + stages.map(s => '<button class="st-chip" aria-selected="' + (s.id === active.id) + '" data-map="stage" data-v="' + esc(s.id) + '">' + esc(s.id) + '</button>').join('') + '</div></section>' +
    '<section>' + label(active.tier ? active.name : active.id + ' · Awakened') + '<div class="st-chips nx-scrollx pf-rail" role="group" aria-label="Upgrade steps">' + steps.map((x, i) => '<button class="st-chip pf-step" aria-selected="' + (i === view.level) + '" data-map="step" data-v="' + i + '"><b>' + (i === 0 ? 'Start' : '+' + i) + '</b><small>' + (i === 0 ? 'transition' : x ? gold(x.gold) : '—') + '</small></button>').join('') + '</div></section>' +
    '<div class="nx-result" role="status"><small>' + esc(stageStepLabel(active, view.level).toUpperCase()) + (step && step.failureChance > 0 ? ' · ' + pct(step.failureChance) + ' FAILURE' : '') + '</small>' +
    (!step ? '<b class="big">No verified recipe</b><span>No estimated cost is shown for this step.</span>' : step.free ? '<b class="big">Free</b><span>Pick an enhancement to see its costs.</span>' : '<b class="big">' + gold(step.gold) + ' gold</b><span>' + plural(step.materials.length, 'material') + '</span>') + '</div>' +
    (step && !step.free && step.materials.length ? matList(step.materials) : '') +
    '<details class="nx-help"><summary>Full ' + esc(active.id) + ' cost · ' + (chapter.complete ? gold(chapter.gold) + ' gold' : 'incomplete') + '</summary>' +
    (chapter.complete ? '<p>Transition plus every enhancement in ' + esc(active.id) + ', before failed attempts.</p>' + matList(chapter.materials) : '<p>Some source recipes are missing, so this total is incomplete.</p>') + '</details>' +
    '<p class="nx-fine">Base gold and material amounts per upgrade, before failed attempts. For whole ranges with failure odds, use Upgrade costs.</p>';
}

export function rarityView() {
  const S = VERIFIED_ITEM_SNAPSHOT, rows = Object.keys(S.tierUpgradeCosts).map(id => verifiedTierUpgrade(Number(id))).filter(Boolean);
  return pfHead('Rarity reference', 'Base cost to move an item up one rarity, before other requirements or modifiers.') +
    '<div class="nx-tablewrap"><table class="nx-table"><thead><tr><th scope="col">Upgrade</th><th scope="col">Base gold</th><th scope="col">Material</th><th scope="col">Failure</th></tr></thead><tbody>' +
    rows.map(x => '<tr><th scope="row">' + esc(S.tierNames[x.from] + ' → ' + S.tierNames[x.to]) + '</th><td>' + x.cost.toLocaleString('en-US') + '</td><td>' + x.material.quantity + ' × ' + esc(x.material.slug.replaceAll('-', ' ')) + '</td><td>' + Math.round(x.failureChance * 100) + '%</td></tr>').join('') +
    '</tbody></table></div><p class="nx-fine">Configured base tier-change values. Not a total-cost or expected-attempt estimate. For full totals, use Upgrade costs.</p>';
}

const CMP_KEY = 'arcana-next-compare-v1';
const cmpRead = () => { try { return JSON.parse(localStorage.getItem(CMP_KEY)) || {}; } catch { return {}; } };
const STAT = { melee_physical_damage: 'Melee physical damage', physical_damage: 'Physical damage', magic_damage: 'Magic damage', defense: 'Defense', flat_damage_reduction: 'Flat damage reduction', pet_mastery_level: 'Pet Mastery level', all_skills: 'All Class Skills', block_chance: 'Block chance', crit_damage: 'Critical damage', strength: 'Strength', dexterity: 'Dexterity', intelligence: 'Intelligence', life_on_hit: 'Life on hit', life_on_kill: 'Life on kill' };
const statName = s => STAT[s] || String(s || '').replaceAll('_', ' ').replace(/^\w/, c => c.toUpperCase());
const rng = p => !p ? '—' : p.min === p.max ? String(p.min) : p.min + '–' + p.max;
export function compareView() {
  const S = VERIFIED_ITEM_SNAPSHOT, names = S.equipment.map(e => e.name).sort((a, b) => a.localeCompare(b));
  const c = { a: 'Wardplate', b: 'Rags', tier: 3, ...cmpRead() };
  const r = verifiedCompare(c.a, c.b, c.tier);
  const pick = (k, v) => '<label class="nx-field">' + (k === 'a' ? 'Item A' : 'Item B') + '<select data-cmp-in="' + k + '">' + names.map(n => '<option' + (n === v ? ' selected' : '') + '>' + esc(n) + '</option>').join('') + '</select></label>';
  const card = (x, side) => !x ? '<div class="nx-card"><strong>' + side + '</strong><small>No verified range for this item.</small></div>' :
    '<div class="nx-card"><span class="nx-kicker">' + side + ' · ' + esc(x.slot.replaceAll('_', ' ').toUpperCase()) + '</span><strong>' + esc(x.name) + '</strong><dl class="nx-facts pf-cmp"><div><dt>' + esc(statName(x.primary.stat)) + '</dt><dd>' + rng(x.primary) + '</dd></div>' +
    (x.secondary ? '<div><dt>' + esc(statName(x.secondary.stat)) + '</dt><dd>' + rng(x.secondary) + '</dd></div>' : '') + '<div><dt>Affix slots</dt><dd>' + x.affixSlots + '</dd></div></dl></div>';
  const diff = r.left && r.right ? (r.comparable
    ? '<p class="nx-callout"><strong>Same main stat: ' + esc(statName(r.left.primary.stat)) + '.</strong> B vs A: ' + (r.delta.min >= 0 ? '+' : '') + r.delta.min + ' minimum, ' + (r.delta.max >= 0 ? '+' : '') + r.delta.max + ' maximum. This compares ranges, not whole items or builds.</p>'
    : '<p class="nx-callout"><strong>Different main stats.</strong> These can’t be ranked by one range. Compare them in a full build instead.</p>') : '';
  return pfHead('Compare items', 'Two items’ base ranges at the same rarity.') +
    '<section class="nx-tool"><div class="st-two">' + pick('a', c.a) + pick('b', c.b) + '</div><div class="st-wrapchips" role="group" aria-label="Rarity">' +
    Object.entries(S.tierNames).map(([id, n]) => '<button aria-pressed="' + (+id === +c.tier) + '" data-cmp="tier" data-v="' + id + '">' + esc(n) + '</button>').join('') + '</div></section>' +
    '<div class="st-two pf-cmpgrid">' + card(r.left, 'A') + card(r.right, 'B') + '</div>' + diff +
    '<p class="nx-fine">Base implicit ranges from the game config, not a character’s rolled stats, awakenings or upgrade bonuses.</p>';
}

export function initPathfinderViews(render) {
  document.addEventListener('click', e => {
    const m = e.target.closest('[data-map]'), c = e.target.closest('[data-cmp]');
    if (m && st.data) {
      const v = readQuickView(), a = m.dataset.map, val = m.dataset.v;
      if (a === 'mode') saveQuickView({ ...v, mode: val, stage: '', level: 0 });
      if (a === 'stage') saveQuickView({ ...v, stage: val, level: 0 });
      if (a === 'step') saveQuickView({ ...v, level: +val });
      return render();
    }
    if (c) { try { localStorage.setItem(CMP_KEY, JSON.stringify({ ...cmpRead(), tier: +c.dataset.v })); } catch { /* ok */ } render(); }
  });
  document.addEventListener('change', e => {
    const k = e.target.dataset?.mapIn, ck = e.target.dataset?.cmpIn;
    if (k === 'slot') { saveQuickView({ ...readQuickView(), slot: e.target.value }); render(); }
    if (ck) { try { localStorage.setItem(CMP_KEY, JSON.stringify({ ...cmpRead(), [ck]: e.target.value })); } catch { /* ok */ } render(); }
  });
}

// ---------- farming checklist payload (same as the classic "Save farming checklist") ----------
export function checklistPayload(slot) {
  if (!st.data) return { error: 'Upgrade recipes aren’t loaded yet.' };
  return checklistFrom(st.data, st.range, st.catalog, slot);
}
// Pure: the checklist for a recipe snapshot and saved range (tested against the server validator).
export function checklistFrom(snapshot, raw, catalog, slot) {
  const range = initialQuickRange(snapshot, raw), quote = quoteRange(snapshot, range, { stage: range.fromStage });
  if (!quote.complete || quote.error || !quote.materials.length) return { error: 'Pick a valid, complete upgrade route first.' };
  const sc = quoteFailureScenarios(snapshot, quote), mode = ['min', 'expected', 'pity'].includes(range.costMode) ? range.costMode : 'expected';
  const sel = sc.available ? sc[mode] : quote;
  const groups = sourceMaterialGroups(sel.materials, snapshot.materials, catalog).map(g => ({ name: g.name, tier: g.tier, items: g.materials.map(m => ({ slug: m.slug, name: m.name, quantity: String(m.quantity) })) }));
  const lab = sc.available ? { min: 'Minimum', expected: 'Average', pity: 'Pity maximum' }[mode] : 'Base';
  return { list: { title: lab + ' · Upgrade ' + (quote.itemCount > 1 ? quote.itemCount + ' items · ' : '') + range.fromStage + ' +' + range.fromLevel + ' → ' + range.toStage + ' +' + range.toLevel,
    slot, from: range.fromStage + ' +' + range.fromLevel, to: range.toStage + ' +' + range.toLevel, gold: String(sel.gold), sourceVersion: String(snapshot.sourceVersion || snapshot.source || ''), groups } };
}
export const SAVE_SLOTS = PATHFINDER_SLOTS;
