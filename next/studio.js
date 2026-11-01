// Build Studio for Arcana Next. Rules live in studio-core.js; this file only draws and reacts.
import D from './studio-data.js';
import {
  emptyBuild, classBudget, passBudget, slotDef, itemById, itemsFor, twoHanded, affixesFor, equip, setClass,
  classData, changeSkill, rowPts, tierSpend, tierLocked, tapNode, shapeById, fits, runeWords, compound, affixCost,
  parts, encodeShare, decodeShare, restoreDraft, PART_IDS, GRID_W, GRID_H, MAX_LEVEL,
  classicEnvelope, nextCode, validSaved
} from './studio-core.js';
import { esc, signInButtons } from './core.js';

const DRAFT_KEY = 'arcana-next-studio-draft-v1';
const CELL = 50;
let rerender = () => {};
let b = load();
const ui = { sheet: null, br: 0, ptier: 0, refund: false, quick: false, brush: null, confirmReset: false, confirmAdopt: false, toast: '', skillMsg: '', copied: '' };

function load() { try { return restoreDraft(D, JSON.parse(localStorage.getItem(DRAFT_KEY))); } catch { return emptyBuild(); } }
function save() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(b)); } catch { /* private mode */ } }
function set(next) { b = next; save(); rerender(); }
let toastTimer;
function toast(msg) { ui.toast = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => { ui.toast = ''; rerender(); }, 2600); rerender(); }

// ---------- account ----------
const acct = { me: 'idle', user: null, saves: 'idle', list: [], busy: false };
async function api(url, opts = {}) {
  const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(12000), ...opts, headers: { 'content-type': 'application/json', ...(opts.headers || {}) } });
  let j = {}; try { j = await r.json(); } catch { /* empty body */ }
  if (!r.ok) throw Object.assign(Error(j.error || 'Request failed (' + r.status + ').'), { status: r.status });
  return j;
}
function loadMe() {
  if (acct.me !== 'idle') return;
  acct.me = 'loading';
  api('/api/account/me').then(j => { acct.user = j.user || null; acct.info = j; acct.me = 'ready'; }).catch(() => { acct.me = 'error'; }).finally(rerender);
}
function loadSaves(force = false) {
  if (!force && acct.saves !== 'idle') return;
  acct.saves = 'loading';
  api('/api/account/builds').then(j => { acct.list = Array.isArray(j.builds) ? j.builds : []; acct.saves = 'ready'; }).catch(() => { acct.saves = 'error'; }).finally(rerender);
}
const signIn = () => signInButtons(acct.info);

const STEPS = D.steps;
const sumOf = o => Object.values(o || {}).reduce((t, n) => t + n, 0);
const clsName = id => D.classes.find(c => c.id === id)?.name || '';
// Sprites are <i> elements so text-span styles (flex, padding, borders) never reach them.
const sprite = (pos, size) => pos ? '<i class="st-spr" aria-hidden="true" style="width:' + size + 'px;height:' + size + 'px;background-position:' + esc(pos) + '"></i>' : '<i class="st-generic" aria-hidden="true">⚔</i>';
const skillSprite = (pos, size) => '<i class="st-skspr" aria-hidden="true" style="width:' + size + 'px;height:' + size + 'px;background-position:' + esc(pos) + '"></i>';
const note = k => String(b.notes[k] || '').trim();
const noteBtn = (k, label) => '<button class="st-note' + (note(k) ? ' on' : '') + '" data-st="note" data-k="' + esc(k) + '" aria-label="' + (note(k) ? 'Edit note for ' : 'Add a note for ') + esc(label) + '">✎</button>';
const btn = (act, text, extra = '', cls = 'nx-btn') => '<button class="' + cls + '" data-st="' + act + '" ' + extra + '>' + text + '</button>';
const stepper = (label, value, down, up, extra = '') => '<div class="st-stepper"><button data-st="' + down + '" ' + extra + ' aria-label="Lower ' + esc(label) + '">−</button><span><small>' + esc(label) + '</small><b>' + esc(value) + '</b></span><button data-st="' + up + '" ' + extra + ' aria-label="Raise ' + esc(label) + '">+</button></div>';

// ---------- header ----------
function header(step) {
  const ps = parts(D, b);
  const chips = STEPS.map((s, i) => '<a role="tab" aria-selected="' + (s.id === step) + '" href="#/studio/' + s.id + '" class="st-chip">' + (ps[i].n ? '<i class="st-dot"></i>' : '') + esc(s.label) + '</a>').join('');
  const showCls = step === 'gear' || step === 'class';
  const showLvl = step === 'class' || step === 'passive';
  return '<div class="st-head"><div class="st-row"><div class="st-chips nx-scrollx" role="tablist" aria-label="Build parts">' + chips + '</div>' +
    '<button class="nx-btn nx-btn-primary st-share" data-st="share">Share</button></div>' +
    (showCls ? '<div class="st-chips nx-scrollx" role="group" aria-label="Class">' + D.classes.map(c => '<button class="st-cls" aria-pressed="' + (c.id === b.cls) + '" data-st="cls" data-id="' + c.id + '">' + esc(c.name) + '</button>').join('') + '</div>' : '') +
    (showLvl ? '<label class="st-level"><span>Level <b id="stLvl">' + b.level + '</b></span><input type="range" min="1" max="' + MAX_LEVEL + '" value="' + b.level + '" data-st="level" aria-label="Character level"></label>' : '') +
    '</div>';
}
function stepFoot(step, summary) {
  const i = STEPS.findIndex(s => s.id === step), next = STEPS[i + 1];
  return '<div class="st-foot"><span>' + esc(summary) + '</span>' + noteBtn(step, STEPS[i].label) + '</div>' +
    (note(step) ? '<p class="st-notetext">' + esc(note(step)) + '</p>' : '') +
    (next ? '<a class="nx-btn st-next" href="#/studio/' + next.id + '">Next: ' + esc(next.label) + '</a>' : btn('share', 'Share build', '', 'nx-btn nx-btn-primary st-next'));
}

// ---------- gear ----------
function gearStep() {
  const h2 = twoHanded(D, b);
  let filled = 0;
  const rows = D.layout.map(row => '<div class="st-gearrow">' + row.map(def => {
    const isTal = def.slot === 'talisman', g = b.gear[def.k], it = g && itemById(D, g.item);
    const tal = isTal && b.tal[def.k] ? D.tals.find(t => t.id === b.tal[def.k]) : null;
    const blocked = def.k === 'off' && h2, has = !!(it || tal);
    if (has) filled++;
    const size = def.big ? 92 : 60;
    const body = blocked ? '<span class="st-slotlabel">2H</span>'
      : it ? sprite(it.pos, def.big ? 76 : 50) + '<span class="st-badge">A' + g.aw + '+' + g.rank + '</span>' + (g.gems.length ? '<span class="st-gems">' + g.gems.map(id => { const c = D.gemColors.find(x => x.id === id); return '<i style="' + (id ? 'background:' + c.c : '') + '"></i>'; }).join('') + '</span>' : '')
      : tal ? '<i class="st-tal" aria-hidden="true" style="color:' + tal.color + '">⛨</i>'
      : '<span class="st-slotlabel">' + esc(def.label) + '</span>';
    const state = blocked ? 'blocked' : it ? 'item' : tal ? 'tal' : 'empty';
    const aria = blocked ? def.label + ': blocked by two-handed weapon' : it ? def.label + ': ' + it.name : tal ? def.label + ': ' + tal.name : def.label + ': empty';
    return '<div class="st-slotwrap"><button class="st-slot ' + state + '" style="width:' + size + 'px;height:' + size + 'px' + (tal ? ';border-color:' + tal.color : '') + '" data-st="slot" data-k="' + def.k + '" aria-label="' + esc(aria) + '">' + body + '</button>' +
      (has || note('gear:' + def.k) ? noteBtn('gear:' + def.k, def.label) : '') + '</div>';
  }).join('') + '</div>').join('');
  return '<div class="st-gear">' + rows + '</div><p class="nx-fine">' + (filled ? 'Tap an item for its details. Empty slots stay out of the build.' : 'Tap a slot to choose gear. Fill as much or as little as you like.') + '</p>' +
    stepFoot('gear', filled + ' of 13 slots filled');
}
function slotSheet(k) {
  const def = slotDef(D, k), g = b.gear[k], it = itemById(D, g.item);
  const affNames = g.aff.map(id => D.aff.find(a => a.id === id)?.name).filter(Boolean);
  return sheet(it.name, def.label + ' · A' + g.aw + '+' + g.rank,
    '<div class="st-two"><button class="st-field" data-st="sheet" data-kind="db" data-k="' + k + '"><small>Drop Bonus</small><b>' + esc(g.db ? D.db.find(x => x.id === g.db).name : 'Choose') + '</b></button>' +
    '<button class="st-field" data-st="sheet" data-kind="aff" data-k="' + k + '"><small>Affixes · ' + affNames.length + '/5</small><b>' + esc(affNames.join(', ') || 'Choose') + '</b></button></div>' +
    '<div class="st-two">' + stepper('Awakening', 'A' + g.aw, 'aw-', 'aw+', 'data-k="' + k + '"') + stepper('Rank', '+' + g.rank, 'rank-', 'rank+', 'data-k="' + k + '"') + '</div>' +
    (def.sock ? '<div class="st-gemrow"><small>Gems · tap to change color</small><div>' + g.gems.map((id, i) => { const c = D.gemColors.find(x => x.id === id); return '<button class="st-gem" style="' + (id ? 'background:' + c.c : '') + '" data-st="gem" data-k="' + k + '" data-i="' + i + '" aria-label="Socket ' + (i + 1) + ': ' + esc(c.name) + '"></button>'; }).join('') + '</div></div>' : '<p class="nx-fine">No gem sockets on this slot.</p>') +
    '<div class="st-two">' + btn('sheet', 'Change item', 'data-kind="items" data-k="' + k + '"') + btn('remove', 'Remove', 'data-k="' + k + '"') + '</div>' +
    btn('note', note('gear:' + k) ? 'Edit note' : 'Add a note', 'data-k="gear:' + k + '"'));
}

// ---------- pets ----------
function petsStep() {
  const cards = b.pets.map((p, i) => {
    const found = p && D.pets.find(x => x.id === p), c = b.petCalc[i], cv = found && compound(D, c.rarity, p, c.lv);
    return '<div class="st-slotwrap"><button class="st-pet' + (found ? ' on' : '') + '" data-st="pet" data-i="' + i + '"><small>Pet ' + (i + 1) + '</small><b>' + esc(found ? found.n : 'Choose bonus') + '</b><span>' + esc(cv ? cap(c.rarity) + ' C' + c.lv + ' → ' + fmt(cv) : 'Calculators inside') + '</span></button>' + noteBtn('pets:' + i, 'Pet ' + (i + 1)) + '</div>';
  }).join('');
  return '<div class="st-pets">' + cards + '</div><p class="nx-fine">Only the Drop Bonus is saved. Pets themselves, their levels and affixes belong in your guide.</p>' +
    stepFoot('pets', b.pets.filter(Boolean).length + ' of 4 chosen');
}
const cap = s => s[0].toUpperCase() + s.slice(1);
const fmt = cv => cv.pct ? '+' + cv.v + '%' : '+' + cv.v;
function petSheet(i) {
  const P = D.pcalc, p = b.pets[i], found = p && D.pets.find(x => x.id === p), c = b.petCalc[i];
  const lvMax = P.max[c.rarity], lv = Math.min(c.lv, lvMax), cv = found && compound(D, c.rarity, p, lv);
  const a = P.pa.find(x => x[0] === c.affix), aMax = a[4] || 200;
  const cur = Math.min(c.cur, aMax), tgt = Math.max(cur, Math.min(c.tgt, aMax));
  const valAt = l => Math.round((a[2] + (l - 1) * a[3]) * 100) / 100 + (a[5] ? '%' : '');
  const nextCost = cur < aMax ? (c.affix === 'all_skills' ? P.allCost : Math.ceil((cur + 1) / P.div)) : 0;
  return sheet('Pet ' + (i + 1), 'Drop Bonus and two calculators',
    '<button class="st-field" data-st="sheet" data-kind="petbonus" data-i="' + i + '"><small>Drop Bonus</small><b>' + esc(found ? found.n : 'Choose a Drop Bonus') + '</b></button>' +
    '<h3 class="st-h3">Compound level</h3><div class="st-seg4">' + ['uncommon', 'rare', 'epic', 'legendary'].map(r => '<button aria-pressed="' + (r === c.rarity) + '" data-st="rarity" data-i="' + i + '" data-r="' + r + '">' + cap(r) + '</button>').join('') + '</div>' +
    stepper('Compound level', lv + ' / ' + lvMax, 'lv-', 'lv+', 'data-i="' + i + '"') +
    '<div class="st-result"><span>' + esc(!found ? 'Pick a Drop Bonus first' : cv ? found.n + ' at compound ' + lv + ' (base ' + (cv.pct ? cv.base + '%' : cv.base) + ')' : cap(c.rarity) + ' pets can’t roll ' + found.n) + '</span><b>' + esc(cv ? fmt(cv) : '—') + '</b></div>' +
    '<h3 class="st-h3">Affix level cost</h3><div class="st-wrapchips">' + P.pa.map(x => '<button aria-pressed="' + (x[0] === c.affix) + '" data-st="affix" data-i="' + i + '" data-a="' + x[0] + '">' + esc(x[1]) + '</button>').join('') + '</div>' +
    '<div class="st-two">' + stepper('Now', cur, 'cur-', 'cur+', 'data-i="' + i + '"') + stepper('Target', tgt, 'tgt-', 'tgt+', 'data-i="' + i + '"') + '</div>' +
    '<div class="st-result"><span>' + esc(a[1] + ' ' + valAt(cur) + ' → ' + valAt(tgt)) + '</span><b>' + affixCost(D, c.affix, cur, tgt).toLocaleString() + ' shards</b></div>' +
    '<p class="nx-fine">' + (nextCost ? 'Next level costs ' + nextCost.toLocaleString() + ' shards. ' : 'Max level. ') + 'Adding or rerolling an affix costs ' + P.addCost + ' shards. The full tools are under Tools.</p>');
}

// ---------- runes ----------
function runesStep() {
  const rw = runeWords(D, b.runes);
  let cells = '';
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) cells += '<button class="st-cell" style="left:' + x * CELL + 'px;top:' + y * CELL + 'px" data-st="cell" data-x="' + x + '" data-y="' + y + '" aria-label="Empty cell, row ' + (y + 1) + ', column ' + (x + 1) + '"></button>';
  const blocks = b.runes.map(r => {
    const sh = shapeById(D, r.shape), ty = D.rt.find(t => t.id === r.t), inWord = rw.used[r.id];
    return '<button class="st-rune' + (inWord ? ' word' : '') + '" data-rune="' + r.id + '" style="left:' + r.x * CELL + 'px;top:' + r.y * CELL + 'px;width:' + (sh.w * CELL - 4) + 'px;height:' + (sh.h * CELL - 4) + 'px;background:' + ty.c + '" aria-label="' + esc(ty.n + ' rune' + (r.sec ? ', ' + D.secs.find(s => s.id === r.sec).n : '') + (inWord ? ', part of ' + inWord : '') + '. Drag to move, tap to edit.') + '"><b>' + esc(ty.n[0]) + '</b>' + (r.sec ? '<small>' + esc(D.secShort[r.sec] || '') + '</small>' : '') + '</button>';
  }).join('');
  const brush = ui.quick && ui.brush ? D.rt.find(t => t.id === ui.brush.t) : null;
  return '<div class="st-runebar"><label class="st-switch"><input type="checkbox" data-st="quick" ' + (ui.quick ? 'checked' : '') + '><span></span>Keep placing</label>' +
    btn('sheet', 'Rune words · ' + rw.formed.length, 'data-kind="words"') +
    '<button class="nx-btn st-reset' + (ui.confirmReset ? ' danger' : '') + '" data-st="reset" ' + (b.runes.length ? '' : 'disabled') + '>' + (ui.confirmReset ? 'Tap to clear' : 'Reset') + '</button></div>' +
    (brush ? '<p class="st-brush">Placing <b style="color:' + brush.c + '">' + esc(brush.n) + '</b> · ' + esc(shapeById(D, ui.brush.shape).n) + ' — tap empty cells. ' + btn('brushoff', 'Stop', '', 'nx-link') + '</p>' : '') +
    '<div class="st-gridwrap"><div class="st-grid" id="stGrid" style="width:' + GRID_W * CELL + 'px;height:' + GRID_H * CELL + 'px">' + cells + blocks + '</div></div>' +
    (rw.formed.length ? '<div class="st-words">' + rw.formed.map(w => '<span><b>' + esc(w.n) + '</b> ' + esc(w.b) + '</span>').join('') + '</div>' : '<p class="nx-fine">Gold outline = part of a rune word. Runes in a word must touch.</p>') +
    stepFoot('runes', b.runes.length + ' runes · ' + rw.formed.length + (rw.formed.length === 1 ? ' word' : ' words'));
}
function runeSheet() {
  const ed = ui.sheet;
  return sheet(ed.id ? 'Edit rune' : 'Place rune', 'Row ' + (ed.y + 1) + ', column ' + (ed.x + 1),
    '<h3 class="st-h3">Type</h3><div class="st-types">' + D.rt.map(t => '<button aria-pressed="' + (ed.t === t.id) + '" style="background:' + t.c + '" data-st="rt" data-v="' + t.id + '">' + esc(t.n) + '</button>').join('') + '</div>' +
    '<h3 class="st-h3">Secondary</h3><div class="st-wrapchips">' + [{ id: '', n: 'None' }, ...D.secs].map(s => '<button aria-pressed="' + ((ed.sec || '') === s.id) + '" data-st="rsec" data-v="' + s.id + '">' + esc(s.n) + '</button>').join('') + '</div>' +
    '<h3 class="st-h3">Size</h3><div class="st-wrapchips">' + D.shapes.map(s => { const ok = fits(D, b.runes, ed.x, ed.y, s, ed.id); return '<button aria-pressed="' + (ed.shape === s.id) + '" ' + (ok ? '' : 'disabled') + ' data-st="rshape" data-v="' + s.id + '">' + esc(s.n + ' ' + s.w + '×' + s.h) + '</button>'; }).join('') + '</div>',
    (ed.id ? btn('rdel', 'Remove') : '') + '<button class="nx-btn nx-btn-primary" data-st="rsave" ' + (ed.t ? '' : 'disabled') + '>' + (ed.t ? (ed.id ? 'Save rune' : 'Place rune') : 'Pick a type first') + '</button>');
}

// ---------- class skills ----------
function classStep() {
  const c = classData(D, b.cls), a = b.ca[b.cls] || {}, spent = sumOf(a), budget = classBudget(b.level);
  const br = c.br[Math.min(ui.br, c.br.length - 1)];
  const bSpend = br.s.reduce((t, s) => t + (a[s.id] || 0), 0);
  const tabs = '<div class="st-tabs" role="tablist">' + c.br.map((x, i) => { const sp = x.s.reduce((t, s) => t + (a[s.id] || 0), 0); return '<button role="tab" aria-selected="' + (x === br) + '" data-st="br" data-i="' + i + '">' + esc(x.n) + (sp ? ' · ' + sp : '') + '</button>'; }).join('') + '</div>';
  const tiers = [0, 5, 10].map((unl, ti) => {
    const locked = bSpend < unl;
    return '<div class="st-tier' + (locked ? ' locked' : '') + '"><span class="st-tiern">' + (ti + 1) + (unl ? '<small>' + unl + '</small>' : '') + '</span><div>' +
      br.s.filter(s => s.unl === unl).map(s => { const r = a[s.id] || 0; return '<button class="st-skill' + (r ? ' on' : '') + '" data-st="skill" data-id="' + s.id + '" aria-label="' + esc(s.n + ', ' + r + ' of ' + s.max) + '">' + skillSprite(s.pos, 44) + '<b>' + r + '/' + s.max + '</b><small>' + esc(s.n) + '</small></button>'; }).join('') + '</div></div>';
  }).join('');
  return '<p class="st-budget' + (spent > budget ? ' over' : '') + '">' + spent + ' / ' + budget + ' class points</p>' + tabs + '<div class="st-tree">' + tiers + '</div>' +
    stepFoot('class', clsName(b.cls) + ' · ' + spent + ' / ' + budget + ' points');
}
function skillSheet(id) {
  const c = classData(D, b.cls); let s, where;
  c.br.forEach(br => br.s.forEach(x => { if (x.id === id) { s = x; where = c.name + ' · ' + br.n + ' · Tier ' + ([0, 5, 10].indexOf(x.unl) + 1); } }));
  const r = (b.ca[b.cls] || {})[id] || 0;
  return sheet(s.n, where, '<div class="st-skillhead">' + skillSprite(s.pos, 56) + '<p>' + esc(s.d) + '</p></div>' +
    stepper('Rank', r + ' / ' + s.max, 'sk-', 'sk+', 'data-id="' + id + '"') + (ui.skillMsg ? '<p class="st-err" role="alert">' + esc(ui.skillMsg) + '</p>' : ''));
}

// ---------- passives ----------
function passiveStep() {
  const a = b.pa, spent = sumOf(a), budget = passBudget(b.level), k = ui.ptier, t = D.tiers[k], tLocked = tierLocked(D, a, k);
  const tabs = '<div class="st-chips nx-scrollx st-ptabs">' + D.tiers.map((tt, i) => { const sp = tierSpend(D, a, i), lk = tierLocked(D, a, i); return '<button aria-pressed="' + (i === k) + '" class="' + (sp ? 'spent' : lk ? 'locked' : '') + '" data-st="ptier" data-i="' + i + '"><b>' + (i + 1) + '</b><small>' + (lk ? 'Locked' : sp ? sp + ' pts' : 'Open') + '</small></button>'; }).join('') + '</div>';
  let rows = '';
  for (let r = t[0]; r <= t[1]; r++) {
    const row = D.rows[r], rowLocked = tLocked || (r > t[0] && rowPts(a, r - 1) === 0);
    rows += '<div class="st-prow' + (row[0] ? ' ms' : '') + '">' + row[1].map((n, i) => {
      const pts = a[r + ':' + i] || 0, label = D.stats[n[0]];
      return '<button class="st-node' + (pts ? ' on' : rowLocked ? ' locked' : '') + '" data-st="node" data-r="' + r + '" data-i="' + i + '" aria-label="' + esc(label[0] + ', ' + pts + ' of ' + n[2] + ' points') + '"><b>' + (row[0] ? '★ ' : '') + esc(label[0]) + '</b><small>' + esc(label[1].replace('{value}', n[1])) + ' /pt</small><span>' + Array.from({ length: n[2] }, (_, j) => '<i class="' + (j < pts ? 'on' : '') + '"></i>').join('') + '</span></button>';
    }).join('') + '</div>';
  }
  return '<div class="st-row"><p class="st-budget' + (spent > budget ? ' over' : '') + '">' + spent + ' / ' + budget + ' passive points</p><div class="st-seg2"><button aria-pressed="' + !ui.refund + '" data-st="refund" data-v="0">Assign</button><button aria-pressed="' + ui.refund + '" data-st="refund" data-v="1" class="red">Refund</button></div></div>' +
    tabs + '<p class="nx-fine">' + esc(tLocked ? 'Locked: spend ' + t[2] + ' in Tier ' + k + ' first (' + tierSpend(D, a, k - 1) + ' so far).' : 'Tier ' + (k + 1) + ' · ' + tierSpend(D, a, k) + ' spent · 20 unlocks the next tier · ★ = pick one') + '</p>' +
    '<div class="st-ptree">' + rows + '</div>' + stepFoot('passive', spent + ' / ' + budget + ' points used');
}

// ---------- stance ----------
function stanceStep() {
  return '<div class="nx-list">' + D.stances.map(s => '<button class="st-stance' + (b.stance === s.id ? ' on' : '') + '" aria-pressed="' + (b.stance === s.id) + '" data-st="stance" data-id="' + s.id + '"><b>' + esc(s.n) + '</b><small>' + esc(s.d) + '</small></button>').join('') + '</div>' +
    stepFoot('stance', b.stance ? D.stances.find(s => s.id === b.stance).n : 'No stance picked');
}

// ---------- sheets ----------
function sheet(title, sub, body, foot = '') {
  return '<div class="st-backdrop" data-st="close"></div><div class="st-sheet" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="st-sheethead"><span><b>' + esc(title) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span><button class="nx-iconbtn" data-st="close" aria-label="Close">✕</button></div><div class="st-sheetbody">' + body + '</div>' + (foot ? '<div class="st-sheetfoot">' + foot + '</div>' : '') + '</div>';
}
const optList = items => '<div class="st-opts">' + items.join('') + '</div>';
const opt = (act, label, sub = '', { on = false, off = false, art = '', data = '', tag = '' } = {}) =>
  '<button class="st-opt' + (on ? ' on' : '') + '" data-st="' + act + '" ' + data + (off ? ' disabled' : '') + ' aria-pressed="' + on + '">' + art + '<span><b>' + esc(label) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' + (tag ? '<em>' + esc(tag) + '</em>' : '') + '</button>';

function renderSheet() {
  const s = ui.sheet;
  if (!s) return '';
  if (s.kind === 'slot') return slotSheet(s.k);
  if (s.kind === 'pet') return petSheet(s.i);
  if (s.kind === 'rune') return runeSheet();
  if (s.kind === 'skill') return skillSheet(s.id);
  if (s.kind === 'items') {
    const def = slotDef(D, s.k), cur = b.gear[s.k];
    const list = itemsFor(D, def, b.cls);
    return sheet('Choose ' + def.label.toLowerCase(), list.length + ' items · ' + (def.slot === 'main_hand' || def.slot === 'off_hand' ? clsName(b.cls) + ' only' : 'all classes'),
      optList(list.map(x => opt('equip', x.name, x.h2 ? 'Two-handed' : '', { on: cur?.item === x.id, art: sprite(x.pos, 40), data: 'data-k="' + s.k + '" data-id="' + x.id + '"' }))));
  }
  if (s.kind === 'tal') {
    const other = b.tal[s.k === 'tal1' ? 'tal2' : 'tal1'], cur = b.tal[s.k];
    return sheet('Choose talisman', 'Only the type is saved. Inscriptions belong in your guide.',
      optList([...D.tals.map(t => opt('tal', t.name, t.sub, { on: cur === t.id, off: other === t.id, tag: other === t.id ? 'Other slot' : '', art: '<i class="st-tal sm" aria-hidden="true" style="color:' + t.color + '">⛨</i>', data: 'data-k="' + s.k + '" data-id="' + t.id + '"' })),
        ...(cur ? [opt('tal', 'Remove talisman', '', { data: 'data-k="' + s.k + '" data-id=""' })] : [])]));
  }
  if (s.kind === 'db') {
    const g = b.gear[s.k];
    return sheet('Drop Bonus', itemById(D, g.item).name, optList([{ id: '', name: 'No Drop Bonus', cat: '' }, ...D.db].map(x => opt('db', x.name, x.cat, { on: (g.db || '') === x.id, data: 'data-k="' + s.k + '" data-id="' + x.id + '"' }))));
  }
  if (s.kind === 'aff') {
    const g = b.gear[s.k], it = itemById(D, g.item), full = g.aff.length >= 5;
    return sheet('Affixes', it.name + ' · only affixes this item can roll',
      optList(affixesFor(D, it).map(a => { const on = g.aff.includes(a.id); return opt('aff', a.name, '', { on, off: !on && full, tag: !on && full ? 'Max 5' : '', data: 'data-k="' + s.k + '" data-id="' + a.id + '"' }); })),
      '<button class="nx-btn nx-btn-primary" data-st="sheet" data-kind="slot" data-k="' + s.k + '">Done · ' + g.aff.length + ' / 5</button>');
  }
  if (s.kind === 'petbonus') {
    return sheet('Pet ' + (s.i + 1) + ' Drop Bonus', 'Pick the bonus this pet carries.', optList([{ id: '', n: 'None' }, ...D.pets].map(p => opt('petbonus', p.n, '', { on: (b.pets[s.i] || '') === p.id, data: 'data-i="' + s.i + '" data-id="' + p.id + '"' }))));
  }
  if (s.kind === 'words') {
    return sheet('Rune words', 'Runes of these types must touch each other. Higher in the list wins ties.',
      optList(D.words.map(w => '<div class="st-opt static"><span><b>' + esc(w.n) + '</b><small>' + esc(w.b) + '</small></span><em class="st-wordchips">' + w.t.map(t => { const x = D.rt.find(y => y.id === t); return '<i style="background:' + x.c + '">' + esc(x.n[0]) + '</i>'; }).join('') + '</em></div>')));
  }
  if (s.kind === 'note') {
    const label = noteLabel(s.k);
    return sheet('Note', label, '<textarea id="stNote" rows="6" maxlength="1000" placeholder="Why this choice, what to upgrade first, what to swap later…">' + esc(b.notes[s.k] || '') + '</textarea>',
      (note(s.k) ? btn('noteclear', 'Delete note', 'data-k="' + esc(s.k) + '"') : '') + '<button class="nx-btn nx-btn-primary" data-st="notesave" data-k="' + esc(s.k) + '">Save note</button>');
  }
  if (s.kind === 'share') {
    const ps = parts(D, b), off = s.off || {};
    const on = ps.filter(p => p.n && !off[p.id]);
    const link = s.link ? '<label class="st-linkbox">Your link<input readonly value="' + esc(s.link) + '" id="stLink"></label>' : '';
    return sheet('Share', 'Only filled parts go in the link. Untick any you want to leave out.',
      '<label class="st-namefield">Build name<input id="stTitle" maxlength="80" placeholder="e.g. Retaliation Warrior" value="' + esc(b.title || '') + '"></label>' +
      optList(ps.map(p => opt('shareToggle', p.label, p.sum, { on: !!p.n && !off[p.id], off: !p.n, tag: p.n ? '' : 'Empty', data: 'data-id="' + p.id + '"' }))) + link +
      '<h3 class="st-h3">Keep it or publish it</h3><div class="st-two">' +
      '<button class="nx-btn" data-st="saveacct" ' + (on.length && !acct.busy ? '' : 'disabled') + '>' + (b.saved ? 'Update saved build' : 'Save to my account') + '</button>' +
      '<button class="nx-btn" data-st="sheet" data-kind="publish" ' + (on.length ? '' : 'disabled') + '>Publish to Community</button></div>' +
      '<p class="nx-fine">Saves follow you to any device. Up to 20 per account.</p>',
      '<button class="nx-btn nx-btn-primary" data-st="copylink" ' + (on.length ? '' : 'disabled') + '>' + (on.length ? (ui.copied ? 'Copied' : 'Copy link · ' + on.length + (on.length === 1 ? ' part' : ' parts')) : 'Nothing to share yet') + '</button>');
  }
  if (s.kind === 'publish') {
    loadMe();
    if (acct.me !== 'ready') return sheet('Publish to Community', '', acct.me === 'error' ? '<p class="nx-fine">Couldn’t check your account. Try again in a moment.</p>' : '<p class="nx-fine">Checking your account…</p>');
    if (!acct.user) return sheet('Publish to Community', 'Sign in so your build is credited to you.', '<p class="nx-fine">Builds are published under your Arcana name, so you need to be signed in.</p>' + signIn());
    const include = shareParts();
    return sheet('Publish to Community', include.length + (include.length === 1 ? ' part' : ' parts') + ' · ' + include.map(id => STEPS.find(x => x.id === id).label).join(', '),
      '<label class="st-namefield">Title<input id="stPubTitle" maxlength="100" value="' + esc(pub().title) + '" placeholder="At least 6 characters"></label>' +
      '<label class="st-namefield">Summary<textarea id="stPubSum" rows="3" maxlength="300" placeholder="One or two sentences: what it does and who it’s for (at least 20 characters)">' + esc(pub().summary) + '</textarea></label>' +
      '<label class="st-namefield">Guide <small>optional</small><textarea id="stPubBody" rows="5" maxlength="12000" placeholder="How to play it, what to upgrade first. Your step and slot notes are already included.">' + esc(pub().body) + '</textarea></label>' +
      '<label class="st-consent"><input type="checkbox" id="stPubOk"' + (pub().ok ? ' checked' : '') + '><span>Publish this build publicly, credited as <b>' + esc(acct.user.displayName) + '</b>. Arcana may feature it.</span></label>',
      '<button class="nx-btn nx-btn-primary" data-st="dopublish" ' + (acct.busy ? 'disabled' : '') + '>' + (acct.busy ? 'Publishing…' : 'Publish') + '</button>');
  }
  return '';
}
// The publish form lives in memory while it's open, so a redraw (like an error message) never clears it.
function pub() { if (!ui.pub) ui.pub = { title: b.title || '', summary: '', body: '', ok: false }; return ui.pub; }
const PUB_FIELDS = { stPubTitle: 'title', stPubSum: 'summary', stPubBody: 'body' };
function shareParts() {
  const off = (ui.sheet && ui.sheet.off) || ui.lastOff || {};
  return parts(D, b).filter(p => p.n && !off[p.id]).map(p => p.id);
}
function noteLabel(k) {
  if (k.startsWith('gear:')) { const def = slotDef(D, k.slice(5)), g = b.gear[k.slice(5)], it = g && itemById(D, g.item), t = b.tal[k.slice(5)]; return def.label + (it ? ' · ' + it.name : t ? ' · ' + D.tals.find(x => x.id === t).name : ''); }
  if (k.startsWith('pets:')) return 'Pet ' + (+k.slice(5) + 1);
  return STEPS.find(s => s.id === k)?.label || '';
}

// ---------- public views ----------
export function studioView(sub) {
  const step = STEPS.some(s => s.id === sub) ? sub : 'gear';
  const body = step === 'gear' ? gearStep() : step === 'pets' ? petsStep() : step === 'runes' ? runesStep() : step === 'class' ? classStep() : step === 'passive' ? passiveStep() : stanceStep();
  return '<div class="st">' + header(step) + '<div class="st-body">' + body + '</div>' + renderSheet() + (ui.toast ? '<div class="st-toast" role="status">' + esc(ui.toast) + '</div>' : '') + '</div>';
}

// Read-only view of a shared link.
export function sharedView(code, over = {}) {
  const got = decodeShare(D, code);
  if (got && over.title) got.title = over.title;
  if (got && over.by !== undefined) got.by = over.by;
  if (!got) return '<div class="nx-empty"><strong>This build link is broken</strong><p>It may have been cut off when it was copied. Ask for the link again.</p><a class="nx-btn" href="#/studio">Open Build Studio</a></div>';
  const sb = got.build, inc = new Set(got.include), names = { gear: 'gear', pets: 'pets', runes: 'runes', class: 'class skills', passive: 'passives', stance: 'stance' };
  const missing = PART_IDS.filter(id => !inc.has(id)).map(id => names[id]);
  const n = k => String(sb.notes[k] || '').trim() ? '<p class="st-notetext">' + esc(sb.notes[k]) + '</p>' : '';
  const sec = (title, body, meta = '') => '<section class="nx-card st-ro"><div class="nx-head"><h2 class="nx-label">' + esc(title) + '</h2><small>' + esc(meta) + '</small></div>' + body + '</section>';
  let out = (over.back || '') + '<header class="nx-page-head"><span class="nx-kicker">' + esc(over.kicker || 'SHARED BUILD · READ ONLY') + '</span><h1>' + esc(got.title || clsName(sb.cls) + ' build') + '</h1><p>' + esc([clsName(sb.cls), 'Level ' + sb.level, got.by ? 'by ' + got.by : ''].filter(Boolean).join(' · ')) + '</p></header>' + (over.intro || '');
  if (inc.has('gear')) {
    const rows = D.layout.flat().filter(d => sb.gear[d.k] || sb.tal[d.k]).map(d => {
      if (d.slot === 'talisman') { const t = D.tals.find(x => x.id === sb.tal[d.k]); return '<div class="st-rorow"><i class="st-tal sm" aria-hidden="true" style="color:' + t.color + '">⛨</i><span><b>' + esc(t.name) + '</b><small>' + esc(t.sub) + '</small>' + n('gear:' + d.k) + '</span></div>'; }
      const g = sb.gear[d.k], it = itemById(D, g.item);
      const bits = [g.db && D.db.find(x => x.id === g.db).name, g.aff.map(id => D.aff.find(a => a.id === id).name).join(', '), g.gems.filter(Boolean).map(id => D.gemColors.find(c => c.id === id).name).join(' · ')].filter(Boolean).join(' · ');
      return '<div class="st-rorow">' + sprite(it.pos, 40) + '<span><b>' + esc(it.name) + ' <em>A' + g.aw + '+' + g.rank + '</em></b><small>' + esc(d.label + (bits ? ' · ' + bits : '')) + '</small>' + n('gear:' + d.k) + '</span></div>';
    }).join('');
    out += sec('Gear', (rows || '<p class="nx-fine">No gear set.</p>') + n('gear'));
  }
  if (inc.has('pets')) out += sec('Pet Drop Bonuses', '<div class="st-wrapchips ro">' + sb.pets.map((p, i) => p ? '<span>' + esc(D.pets.find(x => x.id === p).n) + '</span>' : '').join('') + '</div>' + sb.pets.map((p, i) => n('pets:' + i)).join('') + n('pets'));
  if (inc.has('runes')) {
    const rw = runeWords(D, sb.runes), S = 30;
    out += sec('Runes', '<div class="st-gridwrap"><div class="st-grid ro" style="width:' + GRID_W * S + 'px;height:' + GRID_H * S + 'px;--cell:' + S + 'px">' + sb.runes.map(r => { const sh = shapeById(D, r.shape), ty = D.rt.find(t => t.id === r.t); return '<span class="st-rune' + (rw.used[r.id] ? ' word' : '') + '" style="left:' + r.x * S + 'px;top:' + r.y * S + 'px;width:' + (sh.w * S - 3) + 'px;height:' + (sh.h * S - 3) + 'px;background:' + ty.c + '"><b>' + esc(ty.n[0]) + '</b></span>'; }).join('') + '</div></div>' +
      (rw.formed.length ? '<div class="st-words">' + rw.formed.map(w => '<span><b>' + esc(w.n) + '</b> ' + esc(w.b) + '</span>').join('') + '</div>' : '') + n('runes'), sb.runes.length + ' runes');
  }
  if (inc.has('class')) {
    const c = classData(D, sb.cls), a = sb.ca[sb.cls] || {};
    out += sec('Class skills', c.br.map(br => { const taken = br.s.filter(s => a[s.id]); return taken.length ? '<h3 class="st-h3">' + esc(br.n) + '</h3><div class="st-rolist">' + taken.map(s => '<span>' + skillSprite(s.pos, 28) + esc(s.n) + ' <b>' + a[s.id] + '/' + s.max + '</b></span>').join('') + '</div>' : ''; }).join('') + n('class'), sumOf(a) + ' points');
  }
  if (inc.has('passive')) {
    const a = sb.pa, tiers = D.tiers.map((t, k) => [k, tierSpend(D, a, k)]).filter(x => x[1]);
    out += sec('Passives', tiers.map(([k, sp]) => { const nodes = []; for (let r = D.tiers[k][0]; r <= D.tiers[k][1]; r++) D.rows[r][1].forEach((nd, i) => { const p = a[r + ':' + i]; if (p) nodes.push((D.rows[r][0] ? '★ ' : '') + D.stats[nd[0]][0] + ' ' + p); }); return '<details><summary>Tier ' + (k + 1) + ' · ' + sp + ' points</summary><p class="nx-fine">' + esc(nodes.join(' · ')) + '</p></details>'; }).join('') + n('passive'), sumOf(a) + ' points');
  }
  if (inc.has('stance') && sb.stance) { const s = D.stances.find(x => x.id === sb.stance); out += sec('Stance', '<p><b>' + esc(s.n) + '</b> · ' + esc(s.d) + '</p>' + n('stance')); }
  if (missing.length) out += '<p class="nx-fine">Not included in this link: ' + esc(missing.join(', ')) + '.</p>';
  out += '<button class="nx-btn nx-btn-primary st-next" data-st="adopt" data-code="' + esc(code) + '">' + (ui.confirmAdopt ? 'Tap again to replace your current draft' : 'Copy to my Build Studio') + '</button>';
  return out + (ui.toast ? '<div class="st-toast" role="status">' + esc(ui.toast) + '</div>' : '');
}

// ---------- events ----------
function act(el) {
  const a = el.dataset.st, d = el.dataset;
  const k = d.k, i = d.i !== undefined ? +d.i : null;
  const gear = (key, patch) => set({ ...b, gear: { ...b.gear, [key]: { ...b.gear[key], ...patch } } });
  const pc = (idx, patch) => set({ ...b, petCalc: b.petCalc.map((c, j) => j === idx ? { ...c, ...patch } : c) });
  switch (a) {
    case 'reloadSaves': return loadSaves(true);
    case 'close': ui.sheet = null; ui.skillMsg = ''; ui.copied = ''; return rerender();
    case 'sheet': if (ui.sheet?.kind === 'share') ui.lastOff = ui.sheet.off || {}; ui.sheet = { kind: d.kind, k, i }; return rerender();
    case 'cls': { const id = +d.id; if (id !== b.cls) { ui.br = 0; set(setClass(D, b, id)); } return; }
    case 'slot': {
      const def = slotDef(D, k);
      if (k === 'off' && twoHanded(D, b)) return toast('Your two-handed weapon uses both hands.');
      ui.sheet = { kind: def.slot === 'talisman' ? 'tal' : b.gear[k] ? 'slot' : 'items', k };
      return rerender();
    }
    case 'equip': ui.sheet = { kind: 'slot', k }; return set(equip(D, b, k, +d.id));
    case 'remove': { const g = { ...b.gear }; delete g[k]; ui.sheet = null; return set({ ...b, gear: g }); }
    case 'tal': { const t = { ...b.tal }; if (d.id) t[k] = d.id; else delete t[k]; ui.sheet = null; return set({ ...b, tal: t }); }
    case 'db': ui.sheet = { kind: 'slot', k }; return gear(k, { db: d.id || null });
    case 'aff': { const cur = b.gear[k].aff, id = +d.id; return gear(k, { aff: cur.includes(id) ? cur.filter(x => x !== id) : cur.length < 5 ? [...cur, id] : cur }); }
    case 'aw-': return gear(k, { aw: Math.max(1, b.gear[k].aw - 1) });
    case 'aw+': return gear(k, { aw: Math.min(30, b.gear[k].aw + 1) });
    case 'rank-': return gear(k, { rank: Math.max(0, b.gear[k].rank - 1) });
    case 'rank+': return gear(k, { rank: Math.min(30, b.gear[k].rank + 1) });
    case 'gem': { const gems = [...b.gear[k].gems], idx = D.gemColors.findIndex(c => c.id === gems[i]); gems[i] = D.gemColors[(idx + 1) % D.gemColors.length].id; return gear(k, { gems }); }
    case 'pet': ui.sheet = { kind: 'pet', i }; return rerender();
    case 'petbonus': { const pets = [...b.pets]; pets[i] = d.id || null; ui.sheet = { kind: 'pet', i }; return set({ ...b, pets }); }
    case 'rarity': return pc(i, { rarity: d.r, lv: Math.min(b.petCalc[i].lv, D.pcalc.max[d.r]) });
    case 'lv-': return pc(i, { lv: Math.max(0, b.petCalc[i].lv - 1) });
    case 'lv+': return pc(i, { lv: Math.min(D.pcalc.max[b.petCalc[i].rarity], b.petCalc[i].lv + 1) });
    case 'affix': { const x = D.pcalc.pa.find(p => p[0] === d.a); return pc(i, { affix: d.a, cur: 1, tgt: Math.min(10, x[4] || 10) }); }
    case 'cur-': return pc(i, { cur: Math.max(1, b.petCalc[i].cur - 1) });
    case 'cur+': { const c = b.petCalc[i], mx = D.pcalc.pa.find(p => p[0] === c.affix)[4] || 200, n = Math.min(mx, c.cur + 1); return pc(i, { cur: n, tgt: Math.max(c.tgt, n) }); }
    case 'tgt-': return pc(i, { tgt: Math.max(b.petCalc[i].cur, b.petCalc[i].tgt - 1) });
    case 'tgt+': { const c = b.petCalc[i], mx = D.pcalc.pa.find(p => p[0] === c.affix)[4] || 200; return pc(i, { tgt: Math.min(mx, c.tgt + 1) }); }
    case 'cell': {
      const x = +d.x, y = +d.y;
      if (ui.quick && ui.brush) {
        const sh = shapeById(D, ui.brush.shape);
        if (!fits(D, b.runes, x, y, sh, null)) return toast('That rune doesn’t fit here.');
        return set({ ...b, runes: [...b.runes, { id: nextRuneId(), x, y, ...ui.brush }] });
      }
      ui.sheet = { kind: 'rune', x, y, id: null, t: ui.brush?.t || null, sec: ui.brush?.sec || null, shape: 'small' };
      return rerender();
    }
    case 'rt': ui.sheet = { ...ui.sheet, t: d.v }; return rerender();
    case 'rsec': ui.sheet = { ...ui.sheet, sec: d.v || null }; return rerender();
    case 'rshape': ui.sheet = { ...ui.sheet, shape: d.v }; return rerender();
    case 'rdel': { const id = ui.sheet.id; ui.sheet = null; return set({ ...b, runes: b.runes.filter(r => r.id !== id) }); }
    case 'rsave': {
      const ed = ui.sheet, sh = shapeById(D, ed.shape);
      if (!ed.t) return;
      if (!fits(D, b.runes, ed.x, ed.y, sh, ed.id)) return toast('That size doesn’t fit here.');
      const r = { id: ed.id || nextRuneId(), x: ed.x, y: ed.y, t: ed.t, sec: ed.sec || null, shape: ed.shape };
      if (!ed.id && ui.quick) ui.brush = { t: r.t, sec: r.sec, shape: r.shape };
      ui.sheet = null;
      return set({ ...b, runes: ed.id ? b.runes.map(x => x.id === ed.id ? r : x) : [...b.runes, r] });
    }
    case 'quick': ui.quick = el.checked; if (!ui.quick) ui.brush = null; return rerender();
    case 'brushoff': ui.brush = null; return rerender();
    case 'reset': {
      if (!b.runes.length) return;
      if (ui.confirmReset) { ui.confirmReset = false; set({ ...b, runes: [] }); return toast('Rune grid cleared.'); }
      ui.confirmReset = true; setTimeout(() => { ui.confirmReset = false; rerender(); }, 3000); return rerender();
    }
    case 'br': ui.br = i; return rerender();
    case 'skill': ui.sheet = { kind: 'skill', id: +d.id }; ui.skillMsg = ''; return rerender();
    case 'sk-': case 'sk+': {
      const s = classData(D, b.cls).br.flatMap(x => x.s).find(x => x.id === +d.id);
      const r = changeSkill(D, b.cls, b.ca[b.cls] || {}, s, a === 'sk+' ? 1 : -1, b.level);
      ui.skillMsg = r.error || '';
      return r.alloc ? set({ ...b, ca: { ...b.ca, [b.cls]: r.alloc } }) : rerender();
    }
    case 'ptier': ui.ptier = i; return rerender();
    case 'refund': ui.refund = d.v === '1'; return rerender();
    case 'node': { const r = tapNode(D, b.pa, +d.r, i, ui.refund, b.level); return r.alloc ? set({ ...b, pa: r.alloc }) : r.error ? toast(r.error) : undefined; }
    case 'stance': return set({ ...b, stance: b.stance === d.id ? null : d.id });
    case 'note': ui.sheet = { kind: 'note', k }; return rerender();
    case 'notesave': { const v = document.getElementById('stNote')?.value || '', notes = { ...b.notes }; if (v.trim()) notes[k] = v.slice(0, 1000); else delete notes[k]; ui.sheet = null; return set({ ...b, notes }); }
    case 'noteclear': { const notes = { ...b.notes }; delete notes[k]; ui.sheet = null; return set({ ...b, notes }); }
    case 'share': ui.sheet = { kind: 'share', off: {} }; ui.copied = ''; return rerender();
    case 'shareToggle': { const off = { ...(ui.sheet.off || {}) }; off[d.id] = !off[d.id]; ui.sheet = { ...ui.sheet, off, link: '' }; ui.copied = ''; return rerender(); }
    case 'copylink': {
      const title = document.getElementById('stTitle')?.value.trim().slice(0, 80) || '';
      if (title !== (b.title || '')) b = { ...b, title }; save();
      const include = parts(D, b).filter(p => p.n && !(ui.sheet.off || {})[p.id]).map(p => p.id);
      const link = location.origin + '/next#/build?d=' + encodeShare(b, include, { title });
      ui.sheet = { ...ui.sheet, link };
      const done = ok => { ui.copied = ok ? 'yes' : ''; if (!ok) toast('Copy the link below.'); rerender(); };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(() => done(true), () => done(false)); else done(false);
      return;
    }
    case 'saveacct': {
      loadMe();
      if (acct.me === 'ready' && !acct.user) { ui.sheet = { kind: 'publish' }; return rerender(); }
      const env = classicEnvelope(D, b, shareParts(), { title: b.title });
      acct.busy = true; rerender();
      const req = b.saved ? api('/api/account/builds/' + b.saved.id, { method: 'PUT', body: JSON.stringify({ build: env, baseUpdatedAt: b.saved.at }) })
        : api('/api/account/builds', { method: 'POST', body: JSON.stringify({ build: env }) });
      req.then(j => { b = { ...b, saved: validSaved({ id: j.build.id, at: j.build.updatedAt }) }; save(); acct.saves = 'idle'; toast(b.saved ? 'Saved to your account.' : 'Saved.'); })
        .catch(err => {
          if (err.status === 401) { acct.user = null; acct.me = 'ready'; ui.sheet = { kind: 'publish' }; return toast('Sign in to save to your account.'); }
          if (err.status === 404 || err.status === 409) { b = { ...b, saved: undefined }; save(); return toast(err.status === 409 ? 'That save changed on another device. Tap Save again to keep this as a new copy.' : 'That save was deleted. Tap Save again to make a new one.'); }
          toast(err.message);
        })
        .finally(() => { acct.busy = false; rerender(); });
      return;
    }
    case 'dopublish': {
      const f = pub(), title = f.title.trim(), summary = f.summary.trim(), body = f.body.trim();
      if (title.length < 6) return toast('Give it a title of at least 6 characters.');
      if (summary.length < 20) return toast('Add a summary of at least 20 characters.');
      if (!f.ok) return toast('Tick the box to agree to publishing under your name.');
      const env = classicEnvelope(D, { ...b, title }, shareParts(), { title, summary });
      acct.busy = true; rerender();
      api('/api/community/posts', { method: 'POST', body: JSON.stringify({ kind: 'build', title, summary, body, build: env }) })
        .then(j => { ui.sheet = null; ui.pub = null; b = { ...b, title }; save(); location.hash = '#/builds/' + j.post.id; toast('Published to Community.'); })
        .catch(err => toast(err.status === 429 ? 'You’ve hit today’s publishing limit (10). Try again tomorrow.' : err.message))
        .finally(() => { acct.busy = false; rerender(); });
      return;
    }
    case 'openSaved': {
      const hasDraft = parts(D, b).some(p => p.n);
      if (hasDraft && ui.confirmOpen !== d.id) { ui.confirmOpen = d.id; setTimeout(() => { ui.confirmOpen = null; rerender(); }, 3500); return rerender(); }
      ui.confirmOpen = null;
      api('/api/account/builds/' + d.id).then(j => {
        const code = nextCode(j.build), got = code && decodeShare(D, code);
        if (!got) return toast('This save was made in the classic Build Studio. Open it there.');
        b = { ...got.build, title: got.title || j.build.title || '', saved: validSaved({ id: d.id, at: j.record.updatedAt }) };
        save(); location.hash = '#/studio/gear'; toast('Opened ' + (b.title || 'your build') + '.');
      }).catch(err => toast(err.message));
      return;
    }
    case 'adopt': {
      const hasDraft = parts(D, b).some(p => p.n);
      if (hasDraft && !ui.confirmAdopt) { ui.confirmAdopt = true; setTimeout(() => { ui.confirmAdopt = false; rerender(); }, 3500); return rerender(); }
      const got = decodeShare(D, d.code);
      if (!got) return;
      ui.confirmAdopt = false;
      b = { ...got.build, title: got.title };
      save();
      location.hash = '#/studio/gear';
      return toast('Copied into your Build Studio.');
    }
  }
}
const nextRuneId = () => b.runes.reduce((m, r) => Math.max(m, r.id), 0) + 1;

// Drag runes with pointer events. A press that doesn't move is a tap (opens the editor).
let drag = null;
function onDown(e) {
  const el = e.target.closest('.st-grid:not(.ro) .st-rune');
  if (!el) return;
  const r = b.runes.find(x => x.id === +el.dataset.rune), grid = el.parentElement.getBoundingClientRect();
  drag = { el, r, sh: shapeById(D, r.shape), sx: e.clientX, sy: e.clientY, grid, ox: Math.floor((e.clientX - grid.left) / CELL) - r.x, oy: Math.floor((e.clientY - grid.top) / CELL) - r.y, moved: false, tx: r.x, ty: r.y };
  try { el.setPointerCapture(e.pointerId); } catch { /* old browsers */ }
}
function onMove(e) {
  if (!drag) return;
  if (!drag.moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 8) return;
  drag.moved = true;
  e.preventDefault();
  drag.tx = Math.max(0, Math.min(GRID_W - drag.sh.w, Math.floor((e.clientX - drag.grid.left) / CELL) - drag.ox));
  drag.ty = Math.max(0, Math.min(GRID_H - drag.sh.h, Math.floor((e.clientY - drag.grid.top) / CELL) - drag.oy));
  const ok = fits(D, b.runes, drag.tx, drag.ty, drag.sh, drag.r.id);
  drag.el.style.left = drag.tx * CELL + 'px'; drag.el.style.top = drag.ty * CELL + 'px';
  drag.el.classList.add('dragging'); drag.el.classList.toggle('bad', !ok);
}
function onUp() {
  if (!drag) return;
  const d = drag; drag = null;
  if (!d.moved) { ui.sheet = { kind: 'rune', x: d.r.x, y: d.r.y, id: d.r.id, t: d.r.t, sec: d.r.sec, shape: d.r.shape }; return rerender(); }
  if ((d.tx !== d.r.x || d.ty !== d.r.y) && fits(D, b.runes, d.tx, d.ty, d.sh, d.r.id)) return set({ ...b, runes: b.runes.map(x => x.id === d.r.id ? { ...x, x: d.tx, y: d.ty } : x) });
  if (d.tx !== d.r.x || d.ty !== d.r.y) toast('No room there. Rune put back.'); else rerender();
}

export function initStudio(render) {
  rerender = render;
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-st]');
    if (!el || el.dataset.st === 'level' || el.dataset.st === 'quick' || el.closest('.st-rune')) return;
    act(el);
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset?.st === 'quick') act(el);
    if (el.id === 'stPubOk') pub().ok = el.checked;
    if (el.dataset?.st === 'level') set({ ...b, level: Math.max(1, Math.min(MAX_LEVEL, +el.value || 1)) });
  });
  document.addEventListener('input', e => {
    // Keep the build name as it's typed, so re-drawing the share sheet never loses it.
    if (e.target.id === 'stTitle') { b = { ...b, title: e.target.value.slice(0, 80) }; save(); return; }
    if (PUB_FIELDS[e.target.id]) { pub()[PUB_FIELDS[e.target.id]] = e.target.value; return; }
    if (e.target.dataset?.st === 'level') { const o = document.getElementById('stLvl'); if (o) o.textContent = e.target.value; } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ui.sheet) { ui.sheet = null; rerender(); } });
  document.addEventListener('pointerdown', onDown);
  document.addEventListener('pointermove', onMove, { passive: false });
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', () => { if (drag) { drag = null; rerender(); } });
  // Keyboard users: Enter/Space on a rune opens its editor (pointer handlers don't fire for keys).
  document.addEventListener('keydown', e => {
    const el = e.target.closest?.('.st-grid:not(.ro) .st-rune');
    if (!el || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    const r = b.runes.find(x => x.id === +el.dataset.rune);
    ui.sheet = { kind: 'rune', x: r.x, y: r.y, id: r.id, t: r.t, sec: r.sec, shape: r.shape };
    rerender();
  });
}
export const studioHasSheet = () => !!ui.sheet;

// Profile: the signed-in player's saved builds. New-studio saves open here; classic ones open on the classic site.
export function savedBuildsSection(signedIn) {
  if (!signedIn) return '';
  loadSaves();
  const head = '<div class="nx-head"><h2 class="nx-label">My saved builds</h2><a href="#/studio">Build Studio</a></div>';
  if (acct.saves === 'loading' || acct.saves === 'idle') return '<section>' + head + '<div class="nx-loading">Loading your builds…</div></section>';
  if (acct.saves === 'error') return '<section>' + head + '<div class="nx-empty"><strong>Couldn’t load your builds</strong><p>Check your connection and try again.</p><button class="nx-btn" data-st="reloadSaves">Try again</button></div></section>';
  if (!acct.list.length) return '<section>' + head + '<div class="nx-empty"><strong>No saved builds yet</strong><p>In Build Studio, tap Share, then Save to my account.</p></div></section>';
  return '<section>' + head + '<div class="nx-list">' + acct.list.map(x => '<button class="nx-row st-saverow" data-st="openSaved" data-id="' + esc(x.id) + '"><span class="nx-row-text"><strong>' + esc(x.title) + '</strong><small>' +
    esc(ui.confirmOpen === x.id ? 'Tap again to replace your current draft' : [x.className, 'saved ' + new Date(x.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })].filter(Boolean).join(' · ')) + '</small></span><span class="nx-row-end">›</span></button>').join('') + '</div><p class="nx-fine">' + acct.list.length + ' of 20 saves used.</p></section>';
}
// After each draw: keep the current step chip in view without moving the page.
export function studioAfterRender() {
  const c = document.querySelector('.st-chip[aria-selected=true]');
  if (!c) return;
  const p = c.parentElement, left = c.offsetLeft - p.offsetLeft;
  if (left < p.scrollLeft || left + c.offsetWidth > p.scrollLeft + p.clientWidth) p.scrollLeft = Math.max(0, left - 24);
}
