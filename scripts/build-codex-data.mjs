// Builds next/codex-data.js from the game config.
// Usage: node scripts/build-codex-data.mjs path/to/config_game.json
// Rerun after each game patch. Every number in the Codex comes from here, never typed by hand.
import { readFile, writeFile } from 'node:fs/promises';
import D from '../next/studio-data.js';
import { compound } from '../next/studio-core.js';

const src = process.argv[2];
if (!src) { console.error('Usage: node scripts/build-codex-data.mjs <config_game.json>'); process.exit(1); }
const C = JSON.parse(await readFile(src, 'utf8'));
const M = JSON.parse(await readFile(new URL('../assets/official-art/manifest.json', import.meta.url), 'utf8')).categories;

// ---------- helpers ----------
const STAT = {
  attack_damage_percent: 'Attack Damage %', attack_damage_pct: 'Attack Damage %', critical_strike_chance: 'Crit Chance', crit_chance_pct: 'Crit Chance',
  crit_damage: 'Crit Damage', crit_damage_pct: 'Crit Damage', defense_percent: 'Defense %', defense_pct: 'Defense %', max_health_percent: 'Max Health %',
  max_health_pct: 'Max Health %', max_health: 'Max Health', pet_damage_bonus: 'Pet Damage %', pet_damage_pct: 'Pet Damage %', retaliation_pct: 'Retaliation %',
  dodge_chance: 'Dodge Chance', dodge_pct: 'Dodge Chance', gold_gain: 'Gold Gain', gold_rate_pct: 'Gold Gain', exp_gain: 'Experience Gain', xp_rate_pct: 'Experience Gain',
  local_flat_defense: 'Defense (flat)', local_percent_defense: 'Defense % (item)', jewelry_flat_damage: 'Flat Damage', thorns_damage: 'Reflect Damage',
  item_drop_chance: 'Item Drop Chance', lucky_tier_chance: 'Lucky Tier Chance', boss_damage_bonus: 'Boss Damage', elemental_amp: 'Elemental Damage',
  bloodthirst_percent: 'Bloodthirst', melee_physical_damage: 'Physical Damage', damage_reduction: 'Damage Reduction'
};
const human = s => STAT[s] || String(s).split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const slug = s => String(s).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const TIER = Object.fromEntries(Object.entries(C.itemization.tiers).map(([k, v]) => [k, v.name]));
const SLOT = { main_hand: 'Weapon', off_hand: 'Off-hand', head: 'Helm', chest: 'Chest', hands: 'Gloves', feet: 'Boots', ring: 'Ring', amulet: 'Amulet', belt: 'Belt', torch: 'Torch' };
const TYPE = { weapon: 'Weapon', shield: 'Off-hand', helmet: 'Helm', chest_armor: 'Chest', boots: 'Boots', gloves: 'Gloves', belt: 'Belt', ring: 'Ring', amulet: 'Amulet', torch: 'Torch', all: 'Any slot' };
const CLASS = Object.fromEntries(D.classes.map(c => [c.id, c.name]));
const SOCKETS = Object.fromEntries(D.layout.flat().filter(s => s.slot !== 'talisman').map(s => [s.slot, s.sock]));
const pct = (i, n) => (n > 1 ? (i / (n - 1)) * 100 : 0).toFixed(4) + '%';
function sheet(cat, key) {
  const m = M[cat];
  if (!m || m.mapping?.[key] === undefined) return null;
  const i = m.mapping[key];
  return { url: '/official-art' + (m.file || '/' + cat + '.webp'), size: m.cols * 100 + '% ' + m.rows * 100 + '%', pos: pct(i % m.cols, m.cols) + ' ' + pct(Math.floor(i / m.cols), m.rows) };
}
const equip = pos => pos ? { url: '/official-art/equipment.webp', size: '1500% 1500%', pos } : null;
const skillArt = pos => pos ? { url: '/official-art/skills.webp', size: '1000% 900%', pos, round: true } : null;
// Drop rules from the config, in plain words.
function dropRule(n) {
  if (!n || typeof n !== 'object') return '';
  const pool = TYPE[n.pool] || n.pool;
  if (n.kind === 'rare_slot_roll' && n.chance) return n.chance + '% of ' + pool + ' drops';
  if (n.kind === 'shared_pool') return 'Shares the ' + pool + ' drop pool';
  if (n.kind === 'own_type' && n.weight && n.total_weight) return 'Weight ' + n.weight + ' of ' + n.total_weight.toLocaleString('en-US') + ' (' + (n.weight / n.total_weight * 100).toFixed(2) + '% of drops)';
  return '';
}
const range = ([a, b]) => a === b ? String(a) : a + '–' + b;
const entries = [];
const add = e => entries.push({ facts: [], links: [], ...e });

// ---------- items ----------
const studioItem = new Map(D.items.map(i => [i.id, i]));
for (const it of C.items) {
  const t = it.implicit_by_tier, tiers = Object.keys(t).sort((a, b) => a - b);
  const top = t[tiers.at(-1)], label = it.damage_label || human(it.implicit_stat);
  const sec = it.secondary_implicit_by_tier || {}, secTop = sec[tiers.at(-1)];
  add({
    id: 'item:' + slug(it.name), kind: 'item', title: it.name,
    subtitle: [SLOT[it.slot] || it.slot, it.two_handed ? 'Two-handed' : '', it.allowed_classes?.length ? it.allowed_classes.map(c => CLASS[c]).join(', ') + ' only' : 'All classes'].filter(Boolean).join(' · '),
    description: '',
    art: equip(studioItem.get(it.id)?.pos) || sheet('items', slug(it.name)),
    facts: [
      [label + ' (' + TIER[tiers.at(-1)] + ')', range([top.min, top.max])],
      ...(secTop ? [[human(it.secondary_implicit_stat) + ' (' + TIER[tiers.at(-1)] + ')', range([secTop.min, secTop.max])]] : []),
      ['Affix slots', '0–' + top.affix_slots], ['Gem sockets', String(SOCKETS[it.slot] ?? 0)],
      ['Min Monster Level', it.min_monster_level ? String(it.min_monster_level) : 'None'],
      ...(dropRule(it.drop_note) ? [['How it drops', dropRule(it.drop_note)]] : [])
    ],
    table: { head: ['Tier', label, ...(secTop ? [human(it.secondary_implicit_stat)] : []), 'Affixes'], rows: tiers.map(k => [TIER[k] || 'Tier ' + k, range([t[k].min, t[k].max]), ...(secTop ? [sec[k] ? range([sec[k].min, sec[k].max]) : '—'] : []), String(t[k].affix_slots)]) },
    links: [{ label: 'Put it in a build', href: '#/studio/gear' }, { label: 'Upgrade cost in Pathfinder', href: '/#/calculators/pathfinder', ext: true }],
    related: C.affixes.filter(a => a.applicable_to.includes('all') || a.applicable_to.includes(it.type)).map(a => 'affix:' + slug(a.name)),
    relatedTitle: 'Affixes it can roll'
  });
}

// ---------- affixes (prefix/suffix) ----------
for (const a of C.affixes) {
  const on = a.applicable_to.includes('all') ? ['Any slot'] : a.applicable_to.map(t => TYPE[t] || t);
  add({ id: 'affix:' + slug(a.name), kind: 'affix', title: a.name, subtitle: (a.type === 'prefix' ? 'Prefix' : 'Suffix') + ' · ' + human(a.stat),
    facts: [['Stat', human(a.stat)], ['Base roll', range([a.base_min, a.base_max])], ['Rolls on', on.join(', ')]],
    description: 'Base roll before tier scaling. Higher item tiers multiply it.', links: [{ label: 'Pick affixes in Build Studio', href: '#/studio/gear' }] });
}

// ---------- drop bonuses ----------
for (const [id, b] of Object.entries(C.itemization.drop_bonuses)) {
  const tiers = Object.keys(b.values).sort((x, y) => x - y);
  add({ id: 'drop:' + id, kind: 'drop-bonus', title: b.name, subtitle: 'Drop Bonus · ' + human(b.stat),
    facts: [['Stat', human(b.stat)], ['Category', b.category[0].toUpperCase() + b.category.slice(1)], ['First appears', TIER[b.min_tier] || 'Tier ' + b.min_tier]],
    table: { head: ['Tier', 'Roll'], rows: tiers.map(k => [TIER[k] || 'Tier ' + k, range(b.values[k])]) },
    links: [{ label: 'Pick a Drop Bonus in Build Studio', href: '#/studio/gear' }] });
}

// ---------- skills ----------
for (const c of D.cls) for (const br of c.br) for (const s of br.s) {
  const pre = s.pre.map(id => br.s.find(x => x.id === id)?.n || c.br.flatMap(b => b.s).find(x => x.id === id)?.n).filter(Boolean);
  add({ id: 'skill:' + s.id, kind: 'skill', title: s.n, subtitle: c.name + ' · ' + br.n + ' · Tier ' + ([0, 5, 10].indexOf(s.unl) + 1),
    description: s.d, art: skillArt(s.pos),
    facts: [['Class', c.name], ['Branch', br.n], ['Max rank', String(s.max)], ['Unlocks at', s.unl ? s.unl + ' points in ' + br.n : 'Start'], ['Needs first', pre.join(', ') || 'Nothing']],
    links: [{ label: 'Plan it in Build Studio', href: '#/studio/class' }] });
}

// ---------- runes and rune words ----------
for (const r of D.rt) {
  const words = D.words.filter(w => w.t.includes(r.id)).map(w => w.n);
  add({ id: 'rune:' + r.id, kind: 'rune', title: r.n + ' rune', subtitle: 'Rune · ' + r.p, swatch: r.c,
    facts: [['Main stat', r.p], ['Used in', words.length + ' rune words']], related: D.words.filter(w => w.t.includes(r.id)).map(w => 'word:' + slug(w.n)), relatedTitle: 'Rune words',
    links: [{ label: 'Place runes in Build Studio', href: '#/studio/runes' }] });
}
for (const w of D.words) add({ id: 'word:' + slug(w.n), kind: 'rune-word', title: w.n, subtitle: 'Rune word', description: w.b,
  facts: [['Runes', w.t.map(t => D.rt.find(x => x.id === t).n).join(' + ')], ['Bonus', w.b]],
  chips: w.t.map(t => { const x = D.rt.find(y => y.id === t); return { label: x.n, color: x.c }; }),
  links: [{ label: 'Try it on the rune grid', href: '#/studio/runes' }], note: 'The runes must touch each other on the grid. Earlier words in the list win ties.' });

// ---------- pets ----------
const RAR = ['uncommon', 'rare', 'epic', 'legendary'];
for (const p of D.pets) {
  // Compounding has no cap (confirmed by the owner, 2026-11-01), so the table runs to each rarity's max compound level.
  const rows = RAR.map(r => { const a = compound(D, r, p.id, 0); if (!a) return null; const f = v => (a.pct ? '+' + v.toLocaleString('en-US') + '%' : '+' + v.toLocaleString('en-US')); return [r[0].toUpperCase() + r.slice(1), f(a.v), f(compound(D, r, p.id, Math.min(10, D.pcalc.max[r])).v), String(D.pcalc.max[r]), f(compound(D, r, p.id, D.pcalc.max[r]).v)]; }).filter(Boolean);
  add({ id: 'pet:' + p.id, kind: 'pet-bonus', title: p.n, subtitle: 'Pet Drop Bonus · from ' + rows[0][0],
    facts: [['Lowest rarity', rows[0][0]], ['Legendary at C10', (() => { const v = compound(D, 'legendary', p.id, 10); return v ? (v.pct ? '+' + v.v + '%' : '+' + v.v) : '—'; })()]],
    table: { head: ['Rarity', 'Base', 'At C10', 'Max compound', 'At max'], rows },
    links: [{ label: 'Compound calculator', href: '/#/calculators/pet', ext: true }, { label: 'Pick it in Build Studio', href: '#/studio/pets' }] });
}

// ---------- talismans, stances, gems ----------
for (const t of D.tals) add({ id: 'talisman:' + t.id, kind: 'talisman', title: t.name, subtitle: 'Talisman · ' + t.sub, swatch: t.color,
  facts: [['Stats', t.sub], ['Slots', '2 talisman slots, no duplicates']], note: 'Inscriptions vary per talisman, so Build Studio saves only the type.', links: [{ label: 'Pick talismans in Build Studio', href: '#/studio/gear' }] });
const ST = C.combat_stances.stances;
for (const s of D.stances) {
  const c = ST[s.id] || {};
  const facts = [['Default', C.combat_stances.default === s.id ? 'Yes' : 'No']];
  if (c.bonus_pct) facts.push(['Bonus', '+' + c.bonus_pct + '% ' + ({ attack: 'attack damage', pet: 'pet damage', retaliation: 'retaliation' }[c.type] || c.type)]);
  if (c.base_reflecting_pct) facts.push(['Base reflect', c.base_reflecting_pct + '%']);
  if (c.disables_dodge) facts.push(['Dodge', 'Turned off']);
  if (c.harmony_max) facts.push(['Harmony cap', 'Starts at ' + c.harmony_max + '% and grows with Monster Level']);
  add({ id: 'stance:' + s.id, kind: 'stance', title: s.n, subtitle: 'Combat stance', description: s.d, facts, links: [{ label: 'Pick a stance in Build Studio', href: '#/studio/stance' }] });
}
const GROUP = { weapon: 'Weapon', offhand: 'Off-hand', armor: 'Armor', jewelry: 'Jewelry', torch: 'Torch' };
for (const [id, g] of Object.entries(C.gems.families)) add({ id: 'gem:' + id, kind: 'gem', title: id[0].toUpperCase() + id.slice(1), subtitle: 'Gem', swatch: g.color,
  table: { head: ['Socketed in', 'Stat', 'Base'], rows: Object.entries(g.primary).map(([k, v]) => [GROUP[k] || k, v.map(x => human(x.stat)).join(', '), v.map(x => String(x.base)).join(', ')]) },
  note: 'Sockets: weapon 3, torch 4, armor and belt 2, amulet and rings 1, off-hand none.', links: [{ label: 'Socket gems in Build Studio', href: '#/studio/gear' }] });

// ---------- world: biomes, monsters, materials ----------
const biomeById = new Map(C.biomes.map(b => [b.id, b]));
const matBySlug = new Map(C.materials.map(m => [m.slug, m]));
for (const b of C.biomes) {
  const mons = C.monsters.filter(m => m.biome_id === b.id).sort((x, y) => x.level - y.level);
  add({ id: 'biome:' + b.slug, kind: 'biome', title: b.name, subtitle: 'Biome · Tier ' + b.tier + (b.is_special_zone ? ' · Special zone' : ''),
    art: sheet('biomes', slug(b.name) + '-icon') || sheet('biomes', String(b.icon || '').split('/').pop().replace(/\.webp$/, '')),
    facts: [['Tier', String(b.tier)], ['Unlocks at level', String(b.unlock_level)], ['Monsters', String(mons.length)]],
    related: mons.map(m => 'monster:' + slug(m.name)), relatedTitle: 'Monsters',
    links: [{ label: 'Farm planning in Pathfinder', href: '/#/calculators/pathfinder', ext: true }] });
}
for (const m of C.monsters) {
  const b = biomeById.get(m.biome_id), mat = matBySlug.get(m.material_slug);
  add({ id: 'monster:' + slug(m.name), kind: 'monster', title: m.name, subtitle: (m.monster_type[0].toUpperCase() + m.monster_type.slice(1)) + ' · ' + (b?.name || 'Unknown biome'),
    art: sheet('monsters', String(m.image || '').split('/').pop().replace(/\.webp$/, '')),
    facts: [['Level', String(m.level)], ['Biome', b?.name || '—'], ['Base HP', m.base_hp.toLocaleString('en-US')], ['Base damage', m.base_damage.toLocaleString('en-US')],
      ['Weak to', (m.weakness || []).map(w => w[0].toUpperCase() + w.slice(1)).join(', ') || 'Nothing'], ['Drops', mat ? mat.name : '—']],
    related: [b && 'biome:' + b.slug, mat && 'material:' + mat.slug].filter(Boolean), relatedTitle: 'Where and what',
    links: [{ label: 'Compare ML farming', href: '/#/calculators/ml-farm', ext: true }] });
}
for (const m of C.materials) {
  const from = C.monsters.filter(x => x.material_slug === m.slug);
  add({ id: 'material:' + m.slug, kind: 'material', title: m.name, subtitle: 'Material · ' + human(m.type) + (m.tier ? ' · Tier ' + m.tier : ''),
    art: sheet('materials', m.slug),
    facts: [['Type', human(m.type)], ['Tier', m.tier ? String(m.tier) : '—'], ['Dropped by', from.map(x => x.name).join(', ') || 'Biome drops']],
    related: from.map(x => 'monster:' + slug(x.name)), relatedTitle: 'Dropped by',
    links: [{ label: 'What needs it (Pathfinder)', href: '/#/calculators/pathfinder', ext: true }] });
}

// ---------- mechanics ----------
const GS = C.gear_set_bonuses;
if (GS?.enabled) add({ id: 'mechanic:gear-set-bonus', kind: 'mechanic', title: 'Gear set bonus', subtitle: 'Mechanic · from the config',
  description: 'Bonuses unlock when every required slot reaches the same tier. Required slots: ' + Object.entries(GS.required_slots).map(([k, n]) => (n > 1 ? n + ' ' : '') + (TYPE[k] || k) + (n > 1 ? 's' : '')).join(', ') + '.',
  table: { head: ['Tier reached', 'Bonuses'], rows: GS.tier_thresholds.map(t => [TIER[t.threshold] || 'Tier ' + t.threshold, Object.entries(t.bonuses).map(([k, v]) => human(k) + ' +' + v + (/pct/.test(k) ? '%' : '')).join(', ')]) },
  });
add({ id: 'mechanic:item-tiers', kind: 'mechanic', title: 'Item tiers', subtitle: 'Mechanic · from the config',
  table: { head: ['Tier', 'Max level', 'Affix slots'], rows: Object.entries(C.itemization.tiers).map(([k, t]) => [t.name, String(t.max_level), String(t.affix_slots)]) },
  links: [{ label: 'Upgrade costs in Pathfinder', href: '/#/calculators/pathfinder', ext: true }] });

const KINDS = ['item', 'skill', 'monster', 'material', 'biome', 'affix', 'drop-bonus', 'pet-bonus', 'rune', 'rune-word', 'gem', 'talisman', 'stance', 'mechanic'];
entries.sort((a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.title.localeCompare(b.title));
const ids = new Set(); for (const e of entries) { if (ids.has(e.id)) throw Error('Duplicate Codex id ' + e.id); ids.add(e.id); }
const out = { version: String(C.version || '').split('+')[0], built: new Date().toISOString().slice(0, 10), kinds: KINDS, entries };
const body = '// Codex data, generated by scripts/build-codex-data.mjs from the game config. Do not hand-edit; rerun the script.\nexport default Object.freeze(JSON.parse(' + JSON.stringify(JSON.stringify(out)) + '));\n';
await writeFile(new URL('../next/codex-data.js', import.meta.url), body);
const count = {}; for (const e of entries) count[e.kind] = (count[e.kind] || 0) + 1;
console.log('Codex entries:', entries.length, JSON.stringify(count), (body.length / 1024).toFixed(1) + 'KB', 'art:', entries.filter(e => e.art).length);
