// Arcana Next: pure logic shared by the browser app and the node tests.
// No DOM access here, so everything in this file is testable with node --test.

// Same storage keys as the classic site, so a player's choice carries over.
export const SURFACE_KEY = 'arcana-site-surface-v1';
export const ACCENT_KEY = 'arcana-player-accent-v1';

export const SURFACES = Object.freeze([
  { id: 'slate', name: 'Arcana Slate', bg: '#0D1019', card: '#191E2B', line: '#2A3042' },
  { id: 'midnight', name: 'Midnight', bg: '#080E19', card: '#142039', line: '#253556' },
  { id: 'obsidian', name: 'Obsidian', bg: '#0B0C10', card: '#1B1C22', line: '#2D2E37' },
  { id: 'dusk', name: 'Arcane Dusk', bg: '#16111E', card: '#272035', line: '#3B3150' }
]);

// Curated accents. Green, gold and red are game colors (spent, rune word, not allowed),
// so they are not offered as accents. `ink` is a text-safe tint of the accent on dark.
export const ACCENTS = Object.freeze([
  { id: 'arcane-violet', name: 'Arcane Violet', hex: '#A98BFF', ink: '#C8B8FF', on: '#140F2A' },
  { id: 'cyan-blue', name: 'Cyan Blue', hex: '#13C5F4', ink: '#8FE3FA', on: '#03222B' },
  { id: 'magenta-pink', name: 'Magenta Pink', hex: '#F062BE', ink: '#F7A8DA', on: '#2B0820' },
  { id: 'ice-teal', name: 'Ice Teal', hex: '#80F0E6', ink: '#B5F6F0', on: '#062B27' },
  { id: 'royal-indigo', name: 'Royal Indigo', hex: '#6964E8', ink: '#B3B0FF', on: '#FFFFFF' }
]);

export const surfaceById = id => SURFACES.find(s => s.id === id) || SURFACES[0];
export const accentById = id => ACCENTS.find(a => a.id === id) || ACCENTS[0];

export const TABS = Object.freeze([
  { id: 'home', label: 'Home' },
  { id: 'tools', label: 'Tools' },
  { id: 'codex', label: 'Codex' },
  { id: 'builds', label: 'Builds' },
  { id: 'news', label: 'News' }
]);

// Tools that still live on the classic site. They open there until each is rebuilt.
export const TOOLS = Object.freeze([
  { group: 'Planning', id: 'pathfinder', name: 'Pathfinder', detail: 'Upgrade costs and the materials to farm, biome by biome', href: '#/tools/pathfinder', icon: 'path', native: true },
  { group: 'Planning', id: 'studio', name: 'Build Studio', detail: 'Make a build and share it as a link', href: '#/studio', icon: 'shield', native: true },
  { group: 'Pets', id: 'pet', name: 'Compound level', short: 'Compound', detail: 'What a pet bonus reaches at each compound level', href: '#/tools/pet', icon: 'paw', native: true },
  { group: 'Pets', id: 'affix', name: 'Affix level cost', short: 'Affix cost', detail: 'Shards to level a pet affix from now to your target', href: '#/tools/affix', icon: 'paw', native: true },
  { group: 'Farming', id: 'mlxp', name: 'ML XP planner', short: 'ML XP', detail: 'Total XP, kills and time to your next Monster Levels', href: '#/tools/mlxp', icon: 'chart', native: true },
  { group: 'Farming', id: 'ml', name: 'ML farming comparator', short: 'ML farming', detail: 'Which monster gets you Monster Level fastest', href: '#/tools/ml', icon: 'chart', native: true },
  { group: 'Planning', id: 'skills', name: 'Skill trees', detail: 'Class and passive trees with the real point rules', href: '/#/labs/skills', icon: 'tree' }
]);

// Live events for the Home card. Each hides itself after `until`.
export const EVENTS = Object.freeze([
  { id: 'hallowed-harvest-2026', name: 'Hallowed Harvest 2026', detail: 'Earn until Nov 4 · Pumpkin Shop until Nov 7',
    until: '2026-11-08T07:59:00Z', href: '#/news/hallowed-harvest-2026-guide' }
]);
export const liveEvents = (now = new Date()) => EVENTS.filter(e => new Date(e.until) > now);

// Routes look like #/codex/<id> or #/news/<slug>. Unknown sections fall back to home.
export function parseHash(hash = '') {
  const raw = String(hash).replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(p => { try { return decodeURIComponent(p); } catch { return p; } });
  const known = ['home', 'tools', 'codex', 'builds', 'news', 'profile', 'studio', 'build'];
  const section = known.includes(parts[0]) ? parts[0] : 'home';
  return { section, id: section === parts[0] ? parts.slice(1).join('/') : '', query: new URLSearchParams(query) };
}
export const hashFor = (section, id = '') => '#/' + section + (id ? '/' + encodeURIComponent(id) : '');

// The bottom tab that should light up for a route (profile has no tab).
export const activeTab = section => section === 'studio' ? 'tools' : section === 'build' ? 'builds' : TABS.some(t => t.id === section) ? section : '';

// Codex search over the verified game index. Title matches rank above keyword matches.
export function searchIndex(entries, query, limit = 24) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  const scored = [];
  for (const e of entries) {
    const title = String(e.title || '').toLowerCase();
    const hay = (title + ' ' + String(e.subtitle || '') + ' ' + String(e.keywords || '')).toLowerCase();
    if (!words.every(w => hay.includes(w))) continue;
    const score = title === q ? 0 : title.startsWith(q) ? 1 : title.includes(q) ? 2 : 3;
    scored.push([score, title.length, e]);
  }
  scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return scored.slice(0, limit).map(x => x[2]);
}

// Codex entries come from next/codex-data.js (generated from the game config).
export const codexEntries = data => (Array.isArray(data?.entries) ? data.entries : []).filter(e => e && typeof e.id === 'string' && e.title);

const KIND = {
  item: ['Items', 'Item'], skill: ['Skills', 'Skill'], monster: ['Monsters', 'Monster'], material: ['Materials', 'Material'], biome: ['Biomes', 'Biome'],
  affix: ['Affixes', 'Affix'], 'drop-bonus': ['Drop bonuses', 'Drop bonus'], 'pet-bonus': ['Pet bonuses', 'Pet bonus'], rune: ['Runes', 'Rune'],
  'rune-word': ['Rune words', 'Rune word'], gem: ['Gems', 'Gem'], talisman: ['Talismans', 'Talisman'], stance: ['Stances', 'Stance'], mechanic: ['Mechanics', 'Mechanic']
};
export const kindName = kind => KIND[kind]?.[0] || (kind ? kind[0].toUpperCase() + kind.slice(1) : 'Other');
export const kindSingular = kind => KIND[kind]?.[1] || kindName(kind);

// Category counts for the Codex browse grid, in the order the data lists them.
export function codexCategories(entries, order = []) {
  const counts = new Map();
  for (const e of entries) counts.set(e.kind, (counts.get(e.kind) || 0) + 1);
  const rank = k => { const i = order.indexOf(k); return i < 0 ? 999 : i; };
  return [...counts].filter(([k]) => k).sort((a, b) => rank(a[0]) - rank(b[0]) || b[1] - a[1]).map(([kind, count]) => ({ kind, count, name: kindName(kind) }));
}

// News: newest first; featured pinned to the top.
export function sortArticles(articles) {
  return [...(Array.isArray(articles) ? articles : [])].filter(a => a && a.slug && a.title)
    .sort((a, b) => (b.featured === true) - (a.featured === true) || String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
}

export function shortDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// News article body: the same plain format the classic Journal uses
// (## and ### headings, "- " lists, **bold**, blank lines between blocks).
// Interactive blocks like [[distribution]] are not ported yet; they link to the classic page.
export function articleHtml(body, slug = '') {
  const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return String(body || '').trim().split(/\n\s*\n/g).filter(Boolean).map(block => {
    const t = block.trim();
    if (/^\[\[[a-z-]+\]\]$/.test(t)) {
      if (t === '[[arcana-feedback-cta]]') return '<p class="nx-callout">Got feedback? <a href="/#/beta">Tell me what to fix or build next</a>.</p>';
      return '<p class="nx-callout">This part has an interactive chart. <a href="/#/journal/article?slug=' + encodeURIComponent(slug) + '">See it on the classic page</a>.</p>';
    }
    if (t.startsWith('## ')) return '<h2>' + inline(t.slice(3)) + '</h2>';
    if (t.startsWith('### ')) return '<h3>' + inline(t.slice(4)) + '</h3>';
    const lines = t.split('\n');
    if (lines.every(l => l.startsWith('- '))) return '<ul>' + lines.map(l => '<li>' + inline(l.slice(2)) + '</li>').join('') + '</ul>';
    return '<p>' + lines.map(inline).join('<br>') + '</p>';
  }).join('');
}

// Escape text for HTML. The app builds markup from strings, so every value goes through this.
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Sign-in buttons for whichever providers this server has turned on.
export function signInButtons(me) {
  const p = me?.providers || {}, out = [];
  if (p.discord) out.push('<a class="nx-btn nx-btn-primary" data-signin href="/api/account/login">Sign in with Discord</a>');
  if (p.google) out.push('<a class="nx-btn' + (out.length ? '' : ' nx-btn-primary') + '" data-signin href="/api/account/google/login">Sign in with Google</a>');
  return out.length ? '<div class="nx-signin">' + out.join('') + '</div>' : '<p class="nx-fine">Sign-in is off on this server.</p>';
}

// Sign-in finishes on the classic account page. This one-time note sends the player back here.
export const RETURN_KEY = 'arcana-next-return';
export const safeReturn = v => typeof v === 'string' && /^\/next(?:#\/[\w\-/?=&%.:]*)?$/.test(v) ? v : null;

// Home's "Jump back in": the last three tools the player opened, newest first.
// New visitors get sensible starting points instead. The Tools tab always lists everything.
export const RECENT_TOOLS_KEY = 'arcana-next-recent-tools-v1';
export const DEFAULT_RECENT = ['studio', 'pathfinder', 'codex'];
export function rememberTool(list, id) {
  const known = new Set([...TOOLS.map(t => t.id), 'codex']);
  if (!known.has(id)) return Array.isArray(list) ? list.filter(x => known.has(x)).slice(0, 3) : [];
  return [id, ...(Array.isArray(list) ? list : []).filter(x => x !== id && known.has(x))].slice(0, 3);
}
export function recentTiles(list) {
  const ids = [...(Array.isArray(list) ? list : []), ...DEFAULT_RECENT].filter((x, i, a) => a.indexOf(x) === i);
  return ids.map(id => id === 'codex' ? { id, short: 'Codex', href: '#/codex', icon: 'codex' } : TOOLS.find(t => t.id === id)).filter(Boolean).slice(0, 3);
}
