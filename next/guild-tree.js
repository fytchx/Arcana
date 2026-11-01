// Guild skill tree planner for Arcana Next.
// All rules come from the classic engine (src/guild-tree-engine.js), so budgets, rank gates,
// Ascension and bonus totals match the classic planner exactly. Same storage keys and link format.
import {
  GUILD_TREE, GUILD_GROUPS, GUILD_BASE_NODES, GUILD_NODE_LABELS, GUILD_BONUS_BOOSTS,
  guildPointBudget, guildTreeCounts, guildTreeSpent, guildTreeRule, guildBonusTotals, remainingGuildPoints,
  freshGuildTree, readGuildTree, saveGuildTree, guildTreeFromLink, guildTreeWithLevel, guildTreeLinkParams,
  allocateGuildPoint, removeGuildPoint, maxGuildPoints
} from '../src/guild-tree-engine.js';
import { readGuildBaseline, saveGuildBaseline, clearGuildBaseline, guildPlanDifference } from '../src/guild-tree-compare.js';
import { esc } from './core.js';

let rerender = () => {};
const G = { plan: null, tab: 'vanguard', undo: [], redo: [], baseline: undefined, confirm: '', toast: '' };
let tt;
const toast = m => { G.toast = m; clearTimeout(tt); tt = setTimeout(() => { G.toast = ''; rerender(); }, 2400); };

const fmt = n => Number(n.toFixed(3)).toLocaleString('en-US', { maximumFractionDigits: 3 });
const val = (id, n) => fmt(n) + (id.startsWith('flat_') ? '' : '%');
const TABS = [...GUILD_GROUPS.map(g => [g.id, g.title]), ['ascension', 'Ascension'], ['totals', 'Bonuses'], ['compare', 'Compare']];

// The share link: #/tools/guild-tree?l=<level>&p=<events>&b=<boost>. Opening one replaces the saved plan.
export function guildLink(plan, origin = '') {
  const p = guildTreeLinkParams(plan), q = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) if (v !== '' && v !== undefined) q.set(k, String(v));
  return origin + '/next#/tools/guild-tree?' + q.toString();
}
function ensure(query) {
  if (query && query.has('l')) {
    G.plan = saveGuildTree(guildTreeFromLink(query));
    G.undo = []; G.redo = []; G.tab = 'vanguard';
    history.replaceState(null, '', '#/tools/guild-tree');
  }
  if (!G.plan) G.plan = readGuildTree();
  if (G.baseline === undefined) G.baseline = readGuildBaseline();
}
function update(next, record = true) {
  if (record) { G.undo.push({ ...G.plan }); if (G.undo.length > 100) G.undo.shift(); G.redo = []; }
  G.plan = saveGuildTree(next);
  G.confirm = '';
}

function controls(key, rank, label) {
  const why = guildTreeRule(G.plan, key);
  return '<div class="gt-ctl"><button class="gt-b" data-gt="minus" data-k="' + esc(key) + '" aria-label="Refund ' + esc(label) + ' rank"' + (rank ? '' : ' disabled') + '>−</button>' +
    '<button class="gt-b gt-plus" data-gt="plus" data-k="' + esc(key) + '" aria-label="Add ' + esc(label) + ' rank"' + (why ? ' disabled' : '') + '>+</button>' +
    '<button class="gt-b gt-max" data-gt="max" data-k="' + esc(key) + '"' + (why ? ' disabled' : '') + '>Max</button></div>';
}
function nodeCard(n, counts, totals) {
  const rank = counts[n.id] || 0, next = n.ranks[rank], why = guildTreeRule(G.plan, n.id), label = GUILD_NODE_LABELS[n.id];
  return '<article class="gt-node"><div class="gt-top"><strong>' + esc(label) + '</strong><b>' + rank + '/' + n.ranks.length + '</b></div>' +
    '<div class="gt-meter"><span style="width:' + (rank / n.ranks.length * 100) + '%"></span></div>' +
    '<div class="gt-bottom"><span><strong class="gt-val">' + val(n.id, totals[n.id].total) + '</strong><small>' + esc(next === undefined ? 'Fully ranked' : why || 'Next +' + val(n.id, next)) + '</small></span>' + controls(n.id, rank, label) + '</div></article>';
}
function ascCard(key, label, sub, count, perRank, cap) {
  const why = guildTreeRule(G.plan, key);
  return '<article class="gt-node"><div class="gt-top"><span><strong>' + esc(label) + '</strong><small>' + esc(sub) + '</small></span><b>' + count + (cap !== null ? '/' + cap : '') + '</b></div>' +
    '<div class="gt-per">' + Object.entries(perRank).map(([id, n]) => '<span>' + esc(GUILD_NODE_LABELS[id]) + ' <strong>+' + val(id, n) + '</strong></span>').join('') + '</div>' +
    '<div class="gt-bottom"><small>' + esc(why || 'Per rank, shown above') + '</small>' + controls(key, count, label) + '</div></article>';
}
function compareBody() {
  const b = G.baseline;
  const acts = '<div class="gt-acts"><button class="nx-btn" data-gt="baseline">' + (b ? 'Replace baseline with this plan' : 'Save this plan as the baseline') + '</button>' +
    (b ? '<button class="nx-btn" data-gt="clearbase">' + (G.confirm === 'clearbase' ? 'Tap again to clear' : 'Clear baseline') + '</button>' : '') + '</div>';
  if (!b) return '<p class="nx-fine">Save this plan as a baseline, change points in the other tabs, then come back here to see what went up or down.</p>' + acts;
  const d = guildPlanDifference(G.plan, b);
  return '<div class="gt-cmphead"><span><small>Baseline</small><strong>Level ' + d.baseline.level + '</strong><small>' + guildTreeSpent(d.baseline) + ' spent · ×' + fmt(d.baseline.boost) + '</small></span>' +
    '<span><small>This plan</small><strong>Level ' + d.current.level + '</strong><small>' + guildTreeSpent(d.current) + ' spent · ×' + fmt(d.current.boost) + '</small></span></div>' +
    (d.current.level !== d.baseline.level ? '<p class="nx-callout">The two plans use different guild levels.</p>' : '') +
    '<p class="nx-fine"><strong>' + d.gained + ' higher</strong> · <strong>' + d.lost + ' lower</strong> · ' + d.unchanged + ' unchanged</p>' +
    GUILD_GROUPS.map(g => '<section><h2 class="nx-label">' + esc(g.title) + '</h2><div class="nx-list">' + d.changes.filter(x => x.group === g.id).map(x =>
      '<div class="nx-row gt-cmprow"><span class="nx-row-text"><strong>' + esc(x.label) + '</strong><small>' + val(x.id, x.before) + ' → ' + val(x.id, x.after) + '</small></span><span class="gt-delta ' + (x.delta > 0 ? 'up' : x.delta < 0 ? 'down' : '') + '">' + (x.delta ? (x.delta > 0 ? '+' : '') + val(x.id, x.delta) : '—') + '</span></div>').join('') + '</div></section>').join('') + acts;
}

export function guildTreeView(query) {
  ensure(query);
  const plan = G.plan, counts = guildTreeCounts(plan.events), totals = guildBonusTotals(plan);
  const budget = guildPointBudget(plan.level), spent = guildTreeSpent(plan), left = remainingGuildPoints(plan);
  const gate = GUILD_TREE.endgame.unlock_spent;
  const hint = spent < 15 ? 'Spend ' + (15 - spent) + ' more to unlock ranks 4–6' : spent < 35 ? 'Spend ' + (35 - spent) + ' more to unlock ranks 7–10' : spent < gate ? 'Spend ' + (gate - spent) + ' more to unlock Ascension' : 'Every tier is unlocked';
  let body;
  if (GUILD_GROUPS.some(g => g.id === G.tab)) {
    const g = GUILD_GROUPS.find(x => x.id === G.tab);
    body = '<p class="nx-fine">' + esc(g.description) + '. Every bonus applies to all guild members.</p><div class="gt-nodes">' + GUILD_BASE_NODES.filter(n => n.family === g.id).map(n => nodeCard(n, counts, totals)).join('') + '</div>';
  } else if (G.tab === 'ascension') {
    const need = Math.max(0, gate - spent);
    body = (need ? '<p class="nx-callout">Spend ' + need + ' more points to unlock Ascension.</p>' : '<p class="nx-fine">Mastery adds a little to every bonus. Family ranks strengthen their whole row.</p>') + '<div class="gt-nodes">' +
      ascCard('mastery', 'Mastery', 'One rank per guild level past 68', counts.mastery || 0, GUILD_TREE.mastery.per_rank, Math.max(0, plan.level - 68)) +
      GUILD_TREE.endgame.families.map(f => ascCard('family:' + f.id, f.id[0].toUpperCase() + f.id.slice(1) + ' Family', 'Raises every bonus in this row', counts['family:' + f.id] || 0, f.per_rank, null)).join('') +
      '</div><p class="nx-fine">To take a family past rank 10, another family needs 10 ranks. To pass 20, another needs 20 and the third needs 10.</p>';
  } else if (G.tab === 'compare') body = compareBody();
  else body = '<p class="nx-fine">Totals include Mastery, Family ranks and Bonus Boost.</p>' + GUILD_GROUPS.map(g => '<section><h2 class="nx-label">' + esc(g.title) + '</h2><div class="nx-list">' +
    GUILD_BASE_NODES.filter(n => n.family === g.id).map(n => '<div class="nx-row"><span class="nx-row-text"><strong>' + esc(GUILD_NODE_LABELS[n.id]) + '</strong><small>Rank ' + (counts[n.id] || 0) + '</small></span><span class="gt-total">' + val(n.id, totals[n.id].total) + '</span></div>').join('') + '</div></section>').join('');

  return '<a class="nx-back" href="#/tools">‹ Tools</a><header class="nx-page-head"><span class="nx-kicker">GUILD</span><h1>Guild skill tree</h1><p>Plan every point before you spend it in game. Saved on this device.</p></header>' +
    '<section class="nx-tool gt-setup"><div class="gt-two"><div><span class="nx-label">Guild level</span><div class="st-stepper"><button data-gt="lvl" data-d="-1" aria-label="Lower guild level"' + (plan.level <= 1 ? ' disabled' : '') + '>−</button>' +
    '<input class="gt-level" type="number" inputmode="numeric" min="1" max="99999" value="' + plan.level + '" data-gt-level aria-label="Guild level"><button data-gt="lvl" data-d="1" aria-label="Raise guild level">+</button></div></div>' +
    '<label class="nx-field"><span class="nx-label">Bonus Boost</span><select data-gt-boost aria-label="Bonus Boost">' + GUILD_BONUS_BOOSTS.map(x => '<option value="' + x + '"' + (x === plan.boost ? ' selected' : '') + '>' + (x === 1 ? 'Off' : '×' + fmt(x) + ' (+' + Math.round((x - 1) * 100) + '%)') + '</option>').join('') + '</select></label></div>' +
    '<div class="gt-counts"><span><strong>' + left + '</strong><small>Left</small></span><span><strong>' + spent + '</strong><small>Spent</small></span><span><strong>' + budget + '</strong><small>Total</small></span></div>' +
    '<p class="gt-hint">' + esc(hint) + '</p>' +
    '<div class="gt-acts"><button class="nx-btn" data-gt="undo"' + (G.undo.length ? '' : ' disabled') + '>Undo</button><button class="nx-btn" data-gt="redo"' + (G.redo.length ? '' : ' disabled') + '>Redo</button>' +
    '<button class="nx-btn" data-gt="share">Share</button><button class="nx-btn" data-gt="reset"' + (spent ? '' : ' disabled') + '>' + (G.confirm === 'reset' ? 'Tap again' : 'Reset') + '</button></div></section>' +
    '<div class="nx-scrollx"><div class="nx-seg gt-tabs" role="tablist">' + TABS.map(([id, l]) => '<button role="tab" aria-selected="' + (G.tab === id) + '" data-gt="tab" data-k="' + id + '">' + esc(l) + '</button>').join('') + '</div></div>' +
    body +
    '<p class="nx-fine">Rules from the October 9, 2026 game config. A real in-game reset costs ' + GUILD_TREE.reset.cost.toLocaleString('en-US') + ' Guild Arcstone with a ' + GUILD_TREE.reset.cooldown_hours + '-hour cooldown; resetting here is free.</p>' +
    (G.toast ? '<div class="st-toast" role="status">' + esc(G.toast) + '</div>' : '');
}

export function initGuildTree(render) {
  rerender = render;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-gt]');
    if (!b || b.disabled) return;
    const a = b.dataset.gt, k = b.dataset.k;
    if (a !== 'reset' && a !== 'clearbase') G.confirm = '';
    if (a === 'tab') G.tab = k;
    else if (a === 'plus') { const r = allocateGuildPoint(G.plan, k); r.reason ? toast(r.reason) : update(r.plan); }
    else if (a === 'minus') { const r = removeGuildPoint(G.plan, k); r.reason ? toast(r.reason) : update(r.plan); }
    else if (a === 'max') { const r = maxGuildPoints(G.plan, k); r.added ? update(r.plan) : toast(r.reason || 'No points left'); }
    else if (a === 'lvl') update(guildTreeWithLevel(G.plan, G.plan.level + Number(b.dataset.d)));
    else if (a === 'undo') { const p = G.undo.pop(); if (p) { G.redo.push({ ...G.plan }); update(p, false); } }
    else if (a === 'redo') { const p = G.redo.pop(); if (p) { G.undo.push({ ...G.plan }); update(p, false); } }
    else if (a === 'reset') { if (G.confirm === 'reset') { update(freshGuildTree(G.plan.level)); toast('Plan reset.'); } else G.confirm = 'reset'; }
    else if (a === 'baseline') { G.baseline = saveGuildBaseline(G.plan); toast('Baseline saved.'); }
    else if (a === 'clearbase') { if (G.confirm === 'clearbase') { G.baseline = clearGuildBaseline(); G.confirm = ''; } else G.confirm = 'clearbase'; }
    else if (a === 'share') {
      const link = guildLink(G.plan, location.origin);
      (navigator.clipboard?.writeText(link) || Promise.reject()).then(() => toast('Link copied.')).catch(() => { window.prompt('Copy your guild tree link', link); });
    }
    render();
  });
  document.addEventListener('change', e => {
    const d = e.target.dataset || {};
    if (d.gtLevel !== undefined) { update(guildTreeWithLevel(G.plan, e.target.value)); render(); }
    if (d.gtBoost !== undefined) { update({ ...G.plan, boost: Number(e.target.value) }); render(); }
  });
}
