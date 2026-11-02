// Retaliation planner. Copy your in-game Retaliation Breakdown and a few Character Stats, and see
// your real damage per enemy attack plus what one typical roll of each upgrade is worth.
// The sheet formula is the game's own (verified to the digit against real breakdowns, Nov 2026):
//   base  = level ratio × Defense × (Reflecting + Deflection + Bulwark)%
//   max   = base × Π(1 + layer%) × Combat Stance;  min = 70% of max
// Per-attack effects follow the in-game tooltips: Crit Chance over 100% becomes Crit Damage,
// Double Hit and Double Damage have no cap (every 100% adds a guaranteed step), Block caps at 96%.
import { esc } from './core.js';

export const RET_KEY = 'arcana-retaliation-planner-v1';
export const MIN_ROLL = 0.7;
export const BLOCK_CAP = 96;

const f = (key, label, unit, hint = '') => ({ key, label, unit, hint });
export const RET_GROUPS = [
  { id: 'base', title: 'Base pool', note: 'Top of the Retaliation Breakdown.', fields: [
    f('reflecting', 'Reflecting bonuses (gear)', '%'), f('deflection', 'Deflection (class skill)', '%'), f('bulwark', 'Bulwark Stance', '%'),
    f('defense', 'Defense', 'num', 'Type it like the game: 780.28M'), f('ratio', 'Level ratio', '×', '0.60 from ML 300 on')] },
  { id: 'layers', title: 'Multiplicative layers', note: 'Copy the % value, or the × value with its × (×22.60 is more precise).', fields: [
    f('strength', 'Strength', '%'), f('petStrength', 'Pet increased strength', '%'), f('petRet', 'Pet Retaliation bonus', '%'),
    f('inscription', 'Talisman Inscription', '%'), f('runes', 'Runes', '%'), f('guild', 'Guild Skill Tree', '%'),
    f('echo', 'Echo Blessings', '%'), f('sets', 'Gear Sets', '%'), f('gems', 'Gems', '%'), f('time', 'Time boost', '%')] },
  { id: 'attack', title: 'Per enemy attack', note: 'Bottom of the breakdown, plus Block Chance from Character Stats.', fields: [
    f('blocked', 'Blocked attacks', '×'), f('stance', 'Combat Stance', '×'), f('block', 'Block Chance', '%', 'The shown value, capped at 96%')] },
  { id: 'procs', title: 'Procs', note: 'From Character Stats. Leave blank to skip a proc.', fields: [
    f('critChance', 'Crit Chance', '%'), f('critDamage', 'Crit Damage', '%'), f('doubleHit', 'Double Hit Chance', '%'),
    f('doubleDamage', 'Double Damage Chance', '%'), f('titanic', 'Titanic Blow trigger', '%', 'Warrior skill, capped at 80%'),
    f('relentless', 'Relentless Assault trigger', '%', 'Warrior skill, capped at 100%')] },
  { id: 'extra', title: 'For gem advice (optional)', note: 'Add up the Defense % on the Garnets in your helmet, armor, gloves and boots.', fields: [
    f('defGems', 'Defense % from armor-slot Garnets', '%')] }
];
export const RET_FIELDS = RET_GROUPS.flatMap(g => g.fields);
const LAYERS = RET_GROUPS[1].fields.map(x => x.key);
const REQUIRED = ['reflecting', 'defense', 'ratio', 'stance'];

// Zane's boss preset, November 2, 2026: reproduces his sheet (13.86qa – 19.8qa, average 16.83qa).
export const RET_EXAMPLE = Object.freeze({
  reflecting: '323.4', deflection: '40', bulwark: '15', defense: '780.28M', ratio: '0.60',
  strength: '×22.60', petStrength: '×23.46', petRet: '×44.14', inscription: '×5.96', runes: '×10.10', guild: '×1.78', echo: '×1.18', sets: '×1.40', gems: '×1.16', time: '×1.86',
  blocked: '1.75', stance: '1.25', block: '96',
  critChance: '682.1', critDamage: '2421', doubleHit: '534', doubleDamage: '959', titanic: '80', relentless: '100', defGems: '95'
});

const SUFFIX = { k: 1e3, m: 1e6, b: 1e9, t: 1e12, qa: 1e15, qi: 1e18, sx: 1e21, sp: 1e24 };
// "780.28M", "16.83qa", "2,160", "2.16K" -> number. Blank -> null, nonsense -> NaN.
export function parseAmount(raw) {
  const s = String(raw ?? '').trim().replace(/,/g, '').replace(/^\+/, '').replace(/[%×x]$/i, '').trim();
  if (!s) return null;
  const m = s.match(/^(\d+(?:\.\d+)?|\.\d+)\s*(k|m|b|t|qa|qi|sx|sp)?$/i);
  if (!m) return NaN;
  return Number(m[1]) * (m[2] ? SUFFIX[m[2].toLowerCase()] : 1);
}
const NAMES = [[1e24, 'Sp'], [1e21, 'Sx'], [1e18, 'Qi'], [1e15, 'qa'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
// Game-style short numbers: 16.83qa, 8.5Qi.
export function gameNum(n) {
  if (!Number.isFinite(n)) return '—';
  const hit = NAMES.find(([v]) => Math.abs(n) >= v);
  if (!hit) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const v = n / hit[0];
  return (v >= 1e3 ? v.toExponential(2) : v.toLocaleString('en-US', { maximumFractionDigits: 2 })) + hit[1];
}

export function readPlanner(store = globalThis.localStorage) {
  try { const o = JSON.parse(store?.getItem(RET_KEY) || '{}'); return cleanPlanner(o); } catch { return {}; }
}
export function cleanPlanner(o) {
  const out = {};
  for (const x of RET_FIELDS) if (typeof o?.[x.key] === 'string' && o[x.key].length <= 24) out[x.key] = o[x.key];
  if (o?.overflowShown === true) out.overflowShown = true;
  return out;
}
export function savePlanner(v, store = globalThis.localStorage) { try { store?.setItem(RET_KEY, JSON.stringify(cleanPlanner(v))); } catch { /* private mode */ } }

// Pure math on numbers. `s` holds numbers (percent values as written, e.g. 2160 for +2.16K%).
export function retaliation(s) {
  const n = k => (Number.isFinite(s[k]) ? s[k] : 0);
  const pool = (n('reflecting') + n('deflection') + n('bulwark')) / 100;
  const base = n('ratio') * n('defense') * pool;
  const layers = LAYERS.reduce((a, k) => a * (1 + n(k) / 100), 1);
  const max = base * layers * (Number.isFinite(s.stance) ? s.stance : 1), min = max * MIN_ROLL, avg = (max + min) / 2;
  const blockChance = Math.min(BLOCK_CAP, n('block')) / 100;
  const blockF = 1 + blockChance * ((Number.isFinite(s.blocked) ? s.blocked : 1) - 1);
  const cc = n('critChance'), over = Math.max(0, cc - 100);
  const critDmg = n('critDamage') + (s.overflowShown ? 0 : over);
  const critF = 1 + Math.min(100, cc) / 100 * critDmg / 100;
  const dh = n('doubleHit') / 100, relentless = Math.min(100, n('relentless')) / 100;
  const hitsF = 1 + dh + relentless * Math.min(1, dh);
  const ddF = 1 + n('doubleDamage') / 100;
  const titanicF = 1 + 2 * Math.min(80, n('titanic')) / 100;
  const expected = avg * blockF * critF * hitsF * ddF * titanicF;
  return { pool, base, layers, min, max, avg, blockF, critF, hitsF, ddF, titanicF, expected };
}

// One typical endgame roll of each upgrade. `apply` returns the changed stats.
export const UPGRADES = [
  { id: 'reflect', name: 'Reflecting drop bonus', roll: '+50%', apply: s => ({ ...s, reflecting: (s.reflecting || 0) + 50 }) },
  { id: 'str', name: 'Strength affix', roll: '+250 Strength', need: s => s.strength > 0, apply: s => {
    // Strength layer is 0.5% per point; the pet layer is the same Strength × the pet's Increased Strength.
    const p = s.strength > 0 ? (s.petStrength || 0) / s.strength : 0;
    return { ...s, strength: s.strength + 125, petStrength: (s.petStrength || 0) + 125 * p };
  } },
  { id: 'dh', name: 'Double Hit affix', roll: '+60%', apply: s => ({ ...s, doubleHit: (s.doubleHit || 0) + 60 }) },
  { id: 'dd', name: 'Double Damage affix', roll: '+60%', apply: s => ({ ...s, doubleDamage: (s.doubleDamage || 0) + 60 }) },
  { id: 'defgem', name: 'Defense Garnet (armor slot)', roll: '+11.5% Defense', need: s => s.defGems > 0, apply: s => ({ ...s, defense: s.defense * (100 + s.defGems + 11.5) / (100 + s.defGems) }) },
  { id: 'petstr', name: 'Increased Strength pet, one compound level', roll: '+3%', need: s => s.strength > 0 && s.petStrength > 0, apply: s => {
    const p = s.petStrength / s.strength; return { ...s, petStrength: s.strength * (p + 0.03) };
  } },
  { id: 'lapis', name: 'Lapis in a weapon socket', roll: '+5.5% Retaliation', apply: s => ({ ...s, gems: (s.gems || 0) + 5.5 }) },
  { id: 'guild', name: 'Guild tree Retaliation rank', roll: '+5.19%', apply: s => ({ ...s, guild: (s.guild || 0) + 5.19 }) },
  { id: 'insc', name: 'Talisman Retaliation inscription', roll: '+12.6%', apply: s => ({ ...s, inscription: (s.inscription || 0) + 12.6 }) },
  { id: 'crit', name: 'Crit Damage or Crit Chance affix', roll: '+60%', apply: s => ({ ...s, critDamage: (s.critDamage || 0) + 60 }) },
  { id: 'block', name: 'Block Chance', roll: '+5%', need: s => (s.block || 0) < BLOCK_CAP, apply: s => ({ ...s, block: (s.block || 0) + 5 }) }
];
export function rankUpgrades(s) {
  const now = retaliation(s).expected;
  if (!(now > 0)) return [];
  return UPGRADES.filter(u => !u.need || u.need(s)).map(u => ({ id: u.id, name: u.name, roll: u.roll, gain: (retaliation(u.apply(s)).expected / now - 1) * 100 }))
    .sort((a, b) => b.gain - a.gain);
}

// Strings from the form -> numbers + what's missing or wrong.
export function plannerNumbers(v) {
  const s = {}, bad = [];
  for (const x of RET_FIELDS) {
    // Layers can be copied as the % or as the multiplier shown beside it (×22.60).
    const raw = String(v[x.key] ?? '').trim(), mult = x.unit === '%' && /^[×x]/i.test(raw);
    const n = mult ? (parseAmount(raw.slice(1)) - 1) * 100 : parseAmount(raw);
    if (n === null) continue;
    if (!Number.isFinite(n)) bad.push(x.label); else s[x.key] = n;
  }
  s.overflowShown = !!v.overflowShown;
  const missing = REQUIRED.filter(k => !Number.isFinite(s[k])).map(k => RET_FIELDS.find(x => x.key === k).label);
  return { s, bad, missing, ready: !bad.length && !missing.length };
}

// ---------- view ----------
let rerender = () => {};
const pct = n => (n >= 0 ? '+' : '') + n.toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 2 : 1 }) + '%';
const times = n => '×' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });

function resultHtml(v) {
  const { s, bad, missing, ready } = plannerNumbers(v);
  if (bad.length) return '<p class="nx-callout" role="alert">Check: ' + esc(bad.join(', ')) + '. Numbers can use K, M, B, T, qa or Qi.</p>';
  if (!ready) return '<p class="nx-callout">Fill in ' + esc(missing.join(', ')) + ', or <button class="rp-link" data-ret="example">load an example</button>.</p>';
  const r = retaliation(s), up = rankUpgrades(s), top = up.length ? Math.max(...up.map(u => u.gain), 0.001) : 1;
  return '<div class="nx-result" role="status"><small>ON YOUR SHEET (PER ENEMY ATTACK)</small><b class="big">' + gameNum(r.avg) + ' <small>average</small></b>' +
      '<span class="nx-result-meta"><span>' + gameNum(r.min) + ' – ' + gameNum(r.max) + '</span><span>Base ' + gameNum(r.base) + '</span><span>Layers ' + times(r.layers) + '</span></span></div>' +
    '<div class="rp-real"><small>WITH BLOCKS AND PROCS (EXPECTED)</small><b>' + gameNum(r.expected) + '</b>' +
      '<span class="nx-result-meta"><span>Block ' + times(r.blockF) + '</span><span>Crit ' + times(r.critF) + '</span><span>Hits ' + times(r.hitsF) + '</span><span>Double Damage ' + times(r.ddF) + '</span><span>Titanic ' + times(r.titanicF) + '</span></span></div>' +
    (up.length ? '<h2 class="nx-label">What one roll is worth</h2><ol class="rp-rank">' + up.map(u => '<li><span class="rp-name"><b>' + esc(u.name) + '</b><small>' + esc(u.roll) + '</small></span><span class="rp-bar"><i style="width:' + Math.max(0, u.gain / top * 100).toFixed(1) + '%"></i></span><b class="rp-gain">' + pct(u.gain) + '</b></li>').join('') + '</ol>' +
      '<p class="nx-fine">Gain in expected damage per enemy attack from one typical endgame roll, on your numbers.' + (s.defGems > 0 ? '' : ' Add your armor Garnets’ Defense % below to rank Defense gems.') + '</p>' : '');
}
const out = () => { const o = document.getElementById('rpOut'); if (o) o.innerHTML = resultHtml(readPlanner()); };

export function retaliationView() {
  const v = readPlanner();
  const field = x => '<label class="nx-field rp-field"><span>' + esc(x.label) + (x.hint ? '<small>' + esc(x.hint) + '</small>' : '') + '</span>' +
    '<span class="rp-in"><input type="text" inputmode="decimal" autocomplete="off" value="' + esc(v[x.key] || '') + '" data-ret-input="' + x.key + '" aria-label="' + esc(x.label) + '">' + (x.unit === 'num' ? '' : '<i>' + esc(x.unit) + '</i>') + '</span></label>';
  return '<a class="nx-back" href="#/tools">‹ Tools</a><header class="nx-page-head"><span class="nx-kicker">COMBAT</span><h1>Retaliation planner</h1>' +
      '<p>Copy your <strong>Retaliation Breakdown</strong> (Character › Stats › Retaliation ?) and see what each upgrade is really worth.</p></header>' +
    '<div id="rpOut">' + resultHtml(v) + '</div>' +
    '<section class="nx-tool rp-form">' + RET_GROUPS.map((g, i) => '<details class="rp-group"' + (i < 3 ? ' open' : '') + '><summary><b>' + esc(g.title) + '</b><small>' + esc(g.note) + '</small></summary><div class="rp-grid">' + g.fields.map(field).join('') + '</div></details>').join('') +
      '<label class="st-consent"><input type="checkbox" data-ret-input="overflowShown"' + (v.overflowShown ? ' checked' : '') + '><span>My Crit Damage already includes the Crit Chance overflow (unconfirmed; leave off if unsure)</span></label>' +
      '<div class="nx-steps-row"><button data-ret="example">Load example</button><button data-ret="clear">Clear</button></div></section>' +
    '<p class="nx-fine">Formula verified against in-game breakdowns (November 2026). Saved on this device only. Relentless Assault on retaliation is assumed, not confirmed. <a href="#/guides/retaliation-warrior">Read the Retaliation Warrior guide ›</a></p>';
}
export function initRetaliation(render) {
  rerender = render;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ret]');
    if (!b) return;
    if (b.dataset.ret === 'example') savePlanner({ ...RET_EXAMPLE });
    if (b.dataset.ret === 'clear') savePlanner({});
    rerender();
  });
  document.addEventListener('input', e => {
    const k = e.target.dataset?.retInput;
    if (!k) return;
    savePlanner({ ...readPlanner(), [k]: k === 'overflowShown' ? e.target.checked : e.target.value });
    out();
  });
}
