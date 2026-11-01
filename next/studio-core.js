// Build Studio rules. Pure functions over (data, build), no DOM, fully testable.
// Strict rules apply only to the skill trees. Gear, runes and pets stay loose on purpose.

export const GRID_W = 6, GRID_H = 7;
export const MAX_LEVEL = 1000, DEFAULT_LEVEL = 300;
export const PART_IDS = ['gear', 'pets', 'runes', 'class', 'passive', 'stance'];

export const emptyBuild = () => ({
  v: 1, cls: 1, level: DEFAULT_LEVEL, gear: {}, tal: {}, pets: [null, null, null, null],
  petCalc: [0, 1, 2, 3].map(() => ({ rarity: 'legendary', lv: 10, affix: 'item_quantity', cur: 1, tgt: 10 })),
  runes: [], ca: {}, pa: {}, stance: null, notes: {}
});

const sum = o => Object.values(o || {}).reduce((t, n) => t + n, 0);
const clampInt = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };

// ---------- level budgets ----------
export const classBudget = level => level < 1 ? 0 : Math.min(100, 1 + Math.floor((Math.min(level, 300) - 1) / 3));
export const passBudget = level => Math.max(0, level);

// ---------- gear ----------
export const slotDef = (D, k) => D.layout.flat().find(s => s.k === k) || null;
export const itemById = (D, id) => D.items.find(x => x.id === id) || null;
export const itemsFor = (D, def, cls) => D.items.filter(x => x.slot === def.slot && (!x.cls.length || x.cls.includes(cls)));
export const twoHanded = (D, b) => !!itemById(D, b.gear.main?.item)?.h2;
export const affixesFor = (D, item) => D.aff.filter(a => a.for.includes('all') || a.for.includes(item.type));
export function equip(D, b, k, itemId) {
  const def = slotDef(D, k), prev = b.gear[k];
  const gear = { ...b.gear, [k]: { item: itemId, aw: prev?.aw || 1, rank: prev?.rank || 0, db: prev?.db || null, aff: [], gems: new Array(def.sock).fill(null) } };
  if (k === 'main' && itemById(D, itemId)?.h2) delete gear.off;
  return { ...b, gear };
}
// Switching class drops class-locked weapons and resets the branch view, nothing else.
export function setClass(D, b, cls) {
  const gear = { ...b.gear };
  for (const k of ['main', 'off']) { const it = gear[k] && itemById(D, gear[k].item); if (it && it.cls.length && !it.cls.includes(cls)) delete gear[k]; }
  return { ...b, cls, gear };
}

// ---------- class skills (strict) ----------
export const classData = (D, cls) => D.cls.find(c => c.id === cls) || null;
export function classProblem(D, cls, alloc, level) {
  const c = classData(D, cls);
  if (!c) return 'Unknown class.';
  if (sum(alloc) > classBudget(level)) return 'Not enough class points at level ' + level + '.';
  for (const br of c.br) {
    const spend = br.s.reduce((t, s) => t + (alloc[s.id] || 0), 0);
    for (const s of br.s) {
      const r = alloc[s.id] || 0;
      if (!r) continue;
      if (r > s.max) return s.n + ' is past its max rank.';
      if (s.pre.some(id => !alloc[id])) return s.n + ' needs its prerequisite skill first.';
      if (spend - r < s.unl) return s.n + ' needs ' + s.unl + ' points in other ' + br.n + ' skills. Refund from the bottom up.';
    }
  }
  return null;
}
// Returns { alloc } on success or { error } with the reason. Never returns an illegal tree.
export function changeSkill(D, cls, alloc, skill, delta, level) {
  const next = (alloc[skill.id] || 0) + delta;
  if (next < 0) return { error: '' };
  if (next > skill.max) return { error: 'Already at max rank.' };
  const a = { ...alloc };
  if (next) a[skill.id] = next; else delete a[skill.id];
  const p = classProblem(D, cls, a, level);
  return p ? { error: p } : { alloc: a };
}

// ---------- passives (strict) ----------
export const rowPts = (a, r) => Object.entries(a).reduce((t, [k, n]) => +k.split(':')[0] === r ? t + n : t, 0);
export function tierSpend(D, a, k) { const t = D.tiers[k]; let s = 0; for (let r = t[0]; r <= t[1]; r++) s += rowPts(a, r); return s; }
export const tierLocked = (D, a, k) => k > 0 && tierSpend(D, a, k - 1) < D.tiers[k][2];
export function passProblem(D, a, level) {
  for (const [k, v] of Object.entries(a)) {
    const [r, i] = k.split(':').map(Number), node = D.rows[r]?.[1]?.[i];
    if (!node) return 'Unknown passive node.';
    if (v > node[2]) return 'A node is past its max.';
  }
  for (let k = 0; k < D.tiers.length; k++) {
    const t = D.tiers[k];
    if (tierSpend(D, a, k) > 0 && tierLocked(D, a, k)) return 'Tier ' + (k + 1) + ' needs ' + t[2] + ' points spent in Tier ' + k + '.';
    for (let r = t[0] + 1; r <= t[1]; r++) if (rowPts(a, r) > 0 && rowPts(a, r - 1) === 0) return 'Row ' + (r + 1) + ' needs a point in Row ' + r + ' first.';
    for (let r = t[0]; r <= t[1]; r++) {
      const row = D.rows[r];
      if (row[0] && row[1].filter((_, i) => a[r + ':' + i]).length > 1) return 'Only one milestone per tier.';
    }
  }
  if (sum(a) > passBudget(level)) return 'No passive points left at level ' + level + '.';
  return null;
}
export function tapNode(D, a, r, i, refund, level) {
  const key = r + ':' + i, max = D.rows[r][1][i][2];
  const next = (a[key] || 0) + (refund ? -1 : 1);
  if (next < 0) return { error: '' };
  if (next > max) return { error: 'That node is maxed. Switch to Refund to remove points.' };
  const n = { ...a };
  if (next) n[key] = next; else delete n[key];
  const p = passProblem(D, n, level);
  return p ? { error: p } : { alloc: n };
}

// ---------- runes (loose, but they must fit) ----------
export const shapeById = (D, id) => D.shapes.find(s => s.id === id) || D.shapes[0];
export function runeCells(D, runes, excludeId) {
  const m = {};
  for (const r of runes) {
    if (r.id === excludeId) continue;
    const sh = shapeById(D, r.shape);
    for (let dx = 0; dx < sh.w; dx++) for (let dy = 0; dy < sh.h; dy++) m[(r.x + dx) + ',' + (r.y + dy)] = r.id;
  }
  return m;
}
export function fits(D, runes, x, y, sh, excludeId) {
  if (x < 0 || y < 0 || x + sh.w > GRID_W || y + sh.h > GRID_H) return false;
  const m = runeCells(D, runes, excludeId);
  for (let dx = 0; dx < sh.w; dx++) for (let dy = 0; dy < sh.h; dy++) if (m[(x + dx) + ',' + (y + dy)]) return false;
  return true;
}
// A rune word forms when runes of the listed types touch as one connected group.
// Each rune counts toward one word; words earlier in the list win ties.
export function runeWords(D, runes) {
  const list = runes.filter(r => r.t);
  const m = runeCells(D, list, null), adj = {}, byId = {};
  list.forEach(r => { adj[r.id] = new Set(); byId[r.id] = r; });
  for (const key of Object.keys(m)) {
    const [x, y] = key.split(',').map(Number), me = m[key];
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const o = m[(x + dx) + ',' + (y + dy)];
      if (o && o !== me) { adj[me].add(o); adj[o].add(me); }
    }
  }
  const used = {}, formed = [];
  const search = (group, need) => {
    if (!need.length) return group;
    const cand = new Set();
    group.forEach(id => adj[id].forEach(o => { if (!used[o] && !group.includes(o)) cand.add(o); }));
    for (const o of cand) {
      const i = need.indexOf(byId[o].t);
      if (i < 0) continue;
      const res = search([...group, o], [...need.slice(0, i), ...need.slice(i + 1)]);
      if (res) return res;
    }
    return null;
  };
  for (const w of D.words) {
    let again = true;
    while (again) {
      again = false;
      for (const r of list) {
        if (used[r.id]) continue;
        const i = w.t.indexOf(r.t);
        if (i < 0) continue;
        const g = search([r.id], [...w.t.slice(0, i), ...w.t.slice(i + 1)]);
        if (g) { g.forEach(id => { used[id] = w.n; }); formed.push({ n: w.n, b: w.b }); again = true; break; }
      }
    }
  }
  return { formed, used };
}

// ---------- pet calculators ----------
export function compound(D, rarity, type, lv) {
  const P = D.pcalc, row = (P.pb[rarity] || []).find(x => x[0] === type);
  if (!row) return null;
  const base = row[1];
  let v = base;
  if (rarity !== 'legendary') v = base + lv * Math.max(1, Math.ceil(base * P.add[rarity]));
  else if (P.tier.includes(type)) { for (let i = 1; i <= lv; i++) v = Math.ceil(v * (i <= 10 ? 1.2 : i <= 30 ? 1.1 : 1.07)); }
  else if (P.two.includes(type)) { for (let i = 1; i <= lv; i++) v = Math.ceil(v * (i <= 10 ? 1.2 : 1.1)); }
  else if (P.inc.includes(type)) v = base + lv * 3;
  else if (P.flat.includes(type)) v = base + lv;
  else if (P.lin.includes(type)) { for (let i = 1; i <= lv; i++) v = i <= 10 ? Math.ceil(v * 1.2) : v + 2; }
  else return null;
  return { base, v, pct: !!row[2] };
}
export function affixCost(D, affix, cur, tgt) {
  const P = D.pcalc;
  let shards = 0;
  for (let n = cur + 1; n <= tgt; n++) shards += affix === 'all_skills' ? P.allCost : Math.ceil(n / P.div);
  return shards;
}

// ---------- summaries ----------
export function parts(D, b) {
  const gearN = Object.keys(b.gear).length + Object.keys(b.tal).length;
  const petN = b.pets.filter(Boolean).length;
  const words = runeWords(D, b.runes).formed.length;
  const cAlloc = b.ca[b.cls] || {}, cSpent = sum(cAlloc), pSpent = sum(b.pa);
  const clsName = D.classes.find(c => c.id === b.cls)?.name || '';
  const stance = b.stance ? D.stances.find(s => s.id === b.stance)?.n : '';
  const base = [
    ['gear', 'Gear', gearN, gearN ? gearN + ' of 13 slots' : ''],
    ['pets', 'Pets', petN, petN ? petN + ' of 4 Drop Bonuses' : ''],
    ['runes', 'Runes', b.runes.length, b.runes.length ? b.runes.length + ' runes · ' + words + (words === 1 ? ' word' : ' words') : ''],
    ['class', 'Class skills', cSpent, cSpent ? clsName + ' · ' + cSpent + ' points' : ''],
    ['passive', 'Passives', pSpent, pSpent ? pSpent + ' points' : ''],
    ['stance', 'Stance', b.stance ? 1 : 0, stance || '']
  ];
  return base.map(([id, label, n, s]) => {
    const notes = Object.keys(b.notes).filter(k => (k === id || k.startsWith(id + ':')) && String(b.notes[k] || '').trim()).length;
    return { id, label, n: n + notes, sum: [s, notes ? notes + (notes === 1 ? ' note' : ' notes') : ''].filter(Boolean).join(' · ') || 'Empty' };
  });
}

// ---------- share links ----------
// The link carries only the parts the author picked. Everything is validated on the way in,
// so a hand-edited link can never produce an illegal or broken build.
const b64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));

export function encodeShare(b, include, meta = {}) {
  const on = new Set(include);
  const notesFor = id => Object.fromEntries(Object.entries(b.notes).filter(([k, v]) => (k === id || k.startsWith(id + ':')) && String(v).trim()));
  const o = { v: 1, c: b.cls, l: b.level, i: [...on] };
  if (meta.title) o.title = String(meta.title).slice(0, 80);
  if (meta.by) o.by = String(meta.by).slice(0, 40);
  if (on.has('gear')) { o.g = b.gear; o.t = b.tal; }
  if (on.has('pets')) o.p = b.pets;
  if (on.has('runes')) o.r = b.runes.map(r => [r.x, r.y, r.t, r.sec || 0, r.shape]);
  if (on.has('class')) o.ca = b.ca[b.cls] || {};
  if (on.has('passive')) o.pa = b.pa;
  if (on.has('stance')) o.s = b.stance;
  const notes = {}; for (const id of on) Object.assign(notes, notesFor(id));
  if (Object.keys(notes).length) o.n = notes;
  return b64(JSON.stringify(o));
}

export function decodeShare(D, code) {
  let o;
  try { o = JSON.parse(unb64(String(code || ''))); } catch { return null; }
  if (!o || o.v !== 1 || typeof o !== 'object') return null;
  const b = emptyBuild();
  b.cls = D.classes.some(c => c.id === o.c) ? o.c : 1;
  b.level = clampInt(o.l, 1, MAX_LEVEL, DEFAULT_LEVEL);
  const include = Array.isArray(o.i) ? o.i.filter(id => PART_IDS.includes(id)) : [];
  if (o.g && typeof o.g === 'object') {
    for (const [k, g] of Object.entries(o.g)) {
      const def = slotDef(D, k), it = itemById(D, g?.item);
      if (!def || def.slot === 'talisman' || !it || it.slot !== def.slot || (it.cls.length && !it.cls.includes(b.cls))) continue;
      const okAff = new Set(affixesFor(D, it).map(a => a.id));
      b.gear[k] = {
        item: it.id, aw: clampInt(g.aw, 1, 30, 1), rank: clampInt(g.rank, 0, 30, 0),
        db: D.db.some(x => x.id === g.db) ? g.db : null,
        aff: [...new Set(Array.isArray(g.aff) ? g.aff : [])].filter(id => okAff.has(id)).slice(0, 5),
        gems: Array.from({ length: def.sock }, (_, i) => D.gemColors.some(c => c.id && c.id === g.gems?.[i]) ? g.gems[i] : null)
      };
    }
    if (twoHanded(D, b)) delete b.gear.off;
  }
  if (o.t && typeof o.t === 'object') {
    for (const k of ['tal1', 'tal2']) if (D.tals.some(t => t.id === o.t[k])) b.tal[k] = o.t[k];
    if (b.tal.tal1 && b.tal.tal1 === b.tal.tal2) delete b.tal.tal2;
  }
  if (Array.isArray(o.p)) b.pets = [0, 1, 2, 3].map(i => D.pets.some(p => p.id === o.p[i]) ? o.p[i] : null);
  if (Array.isArray(o.r)) {
    let id = 1;
    for (const r of o.r.slice(0, GRID_W * GRID_H)) {
      if (!Array.isArray(r)) continue;
      const [x, y, t, sec, shape] = r, sh = D.shapes.find(s => s.id === shape);
      if (!sh || !D.rt.some(q => q.id === t) || !Number.isInteger(x) || !Number.isInteger(y) || !fits(D, b.runes, x, y, sh, null)) continue;
      b.runes.push({ id: id++, x, y, t, sec: D.secs.some(s => s.id === sec) ? sec : null, shape });
    }
  }
  if (o.ca && typeof o.ca === 'object') {
    const c = classData(D, b.cls), a = {};
    for (const s of c.br.flatMap(x => x.s)) { const n = clampInt(o.ca[s.id], 0, s.max, 0); if (n) a[s.id] = n; }
    if (!classProblem(D, b.cls, a, b.level)) b.ca[b.cls] = a;
  }
  if (o.pa && typeof o.pa === 'object') {
    const a = {};
    for (const [k, v] of Object.entries(o.pa)) {
      const [r, i] = k.split(':').map(Number), node = D.rows[r]?.[1]?.[i];
      const n = node ? clampInt(v, 0, node[2], 0) : 0;
      if (n) a[r + ':' + i] = n;
    }
    if (!passProblem(D, a, b.level)) b.pa = a;
  }
  if (D.stances.some(s => s.id === o.s)) b.stance = o.s;
  if (o.n && typeof o.n === 'object') for (const [k, v] of Object.entries(o.n)) if (/^[a-z]+(?::[a-z0-9]+)?$/.test(k) && typeof v === 'string') b.notes[k] = v.slice(0, 1000);
  return { build: b, include, title: typeof o.title === 'string' ? o.title.slice(0, 80) : '', by: typeof o.by === 'string' ? o.by.slice(0, 40) : '' };
}

// Saved drafts go through the same validation as links, so an old or damaged draft can't break the page.
export function restoreDraft(D, raw) {
  if (!raw || typeof raw !== 'object') return emptyBuild();
  let all = null;
  try {
    const safe = { ...emptyBuild(), ...raw };
    for (const k of ['gear', 'tal', 'ca', 'pa', 'notes']) if (!safe[k] || typeof safe[k] !== 'object' || Array.isArray(safe[k])) safe[k] = {};
    if (!Array.isArray(safe.runes)) safe.runes = [];
    if (!Array.isArray(safe.pets)) safe.pets = [null, null, null, null];
    all = decodeShare(D, encodeShare(safe, PART_IDS));
  } catch { all = null; }
  if (!all) return emptyBuild();
  const b = all.build;
  if (raw.ca && typeof raw.ca === 'object') {
    for (const c of D.classes) {
      if (c.id === b.cls) continue;
      const one = decodeShare(D, encodeShare({ ...emptyBuild(), cls: c.id, level: b.level, ca: { [c.id]: raw.ca[c.id] || {} } }, ['class']));
      if (one?.build.ca[c.id] && Object.keys(one.build.ca[c.id]).length) b.ca[c.id] = one.build.ca[c.id];
    }
  }
  if (typeof raw.title === 'string') b.title = raw.title.slice(0, 80);
  if (Array.isArray(raw.petCalc)) b.petCalc = b.petCalc.map((d, i) => {
    const p = raw.petCalc[i] || {};
    return {
      rarity: ['uncommon', 'rare', 'epic', 'legendary'].includes(p.rarity) ? p.rarity : d.rarity,
      lv: clampInt(p.lv, 0, 300, d.lv), affix: D.pcalc.pa.some(a => a[0] === p.affix) ? p.affix : d.affix,
      cur: clampInt(p.cur, 1, 200, d.cur), tgt: clampInt(p.tgt, 1, 200, d.tgt)
    };
  });
  return b;
}
