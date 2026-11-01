// Arcana Next: the new app shell. Runs beside the classic site and uses the same APIs.
import {
  SURFACES, ACCENTS, SURFACE_KEY, ACCENT_KEY, surfaceById, accentById, TABS, TOOLS,
  parseHash, hashFor, activeTab, searchIndex, codexEntries, codexCategories, kindName, kindSingular,
  sortArticles, shortDate, articleHtml, liveEvents, esc, signInButtons, RETURN_KEY, RECENT_TOOLS_KEY, rememberTool, recentTiles,
  ic, setIconStyle, classVar, CLASS_NAMES, BUILD_TYPES, buildMeta,
} from './core.js';
import { studioView, sharedView, initStudio, studioAfterRender, savedBuildsSection } from './studio.js';
import { nextCode } from './studio-core.js';
import { toolView, initTools, NATIVE_TOOLS } from './tools.js';
import { pathfinderView, initPathfinder, mlXpView, initMlXp, upgradeMapView, rarityView, compareView, initPathfinderViews } from './pathfinder.js';
import { adminView, initAdmin } from './admin.js';
import { feedbackView, initFeedback, notePage } from './feedback.js';
import { guildsView, initGuilds } from './guilds.js';
import { lfgView, recordsView, initCommunity } from './community.js';
import { guildTreeView, initGuildTree } from './guild-tree.js';
import { themeView, initTheme, readTheme, themeVars, saveTheme, applyBackdrop } from './theme.js';
import { DEFAULT_NEXT_DESIGN, safeNextDesign, designVars, fontHref } from './design-model.js';
import { designView, initDesign, readDraft } from './design-tool.js';
import { saveChecklistBlock, checklistsSection, checklistView, initChecklists } from './checklists.js';
import { emptyBuild, encodeShare } from './studio-core.js';
import { demoBuilds } from '../src/catalog.js';

// Zane's featured build, built only from facts he published (pets, stance, talismans, notes).
// Gear rolls, runes and skill points were left open in his guide, so they stay out.
const FEATURED = (() => {
  const z = demoBuilds['warrior-retaliation-zane'];
  const fb = { ...emptyBuild(), cls: 1, level: 196, pets: z.petSetup.map(p => p.hatchBonus), stance: 'bulwark', tal: { tal1: 'fury', tal2: 'iron' }, notes: { gear: z.notes } };
  return '#/build?d=' + encodeShare(fb, ['gear', 'pets', 'stance'], { title: "Zane's Retaliation Warrior", by: 'Zane' });
})();

const $ = id => document.getElementById(id);
const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode: choice lasts this visit */ } };

// ---------- icons ----------
const P = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  codex: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  builds: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  news: '<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><path d="M8 8h5M8 12h5M8 16h3"/>',
  directory: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  next: '<path d="m9 6 6 6-6 6"/>',
  path: '<circle cx="12" cy="5" r="2"/><path d="M12 7v10"/><path d="m8 13 4 4 4-4"/><path d="M6 21h12"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  paw: '<circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="7" r="2.2"/><circle cx="4.5" cy="13" r="2"/><circle cx="19.5" cy="13" r="2"/><path d="M12 13c-3 0-5 3-5 5.5 0 1.7 1.6 2.5 5 2.5s5-.8 5-2.5C17 16 15 13 12 13z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  tree: '<circle cx="12" cy="4" r="2"/><circle cx="6" cy="13" r="2"/><circle cx="18" cy="13" r="2"/><circle cx="12" cy="20" r="2"/><path d="M12 6v12M12 9l-5 3M12 9l5 3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  out: '<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'
};
const icon = (name, size = 22) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';

// ---------- theme ----------
// Layers: the published site design (Admin › Design), then an admin's unpublished draft on this device,
// then the player's own Theme designer colors.
let siteDesign = null;
function activeDesign() { return readDraft() || siteDesign || DEFAULT_NEXT_DESIGN; }
function applyTheme() {
  const d = activeDesign(), custom = readTheme(), r = document.documentElement.style;
  for (const [k, v] of Object.entries(designVars(d))) r.setProperty(k, v);
  setIconStyle(d.iconStyle);
  document.documentElement.dataset.tile = d.iconTile; document.documentElement.dataset.header = d.headerAlign;
  const href = fontHref(d), link = document.getElementById('nxFonts') || Object.assign(document.head.appendChild(document.createElement('link')), { id: 'nxFonts', rel: 'stylesheet' });
  if (link.getAttribute('href') !== href) link.setAttribute('href', href);
  const quick = read(SURFACE_KEY) || read(ACCENT_KEY), s = surfaceById(read(SURFACE_KEY)), a = accentById(read(ACCENT_KEY));
  const v = custom ? themeVars(custom) : quick ? { bg: s.bg, card: s.card, accent: a.hex } : { bg: d.bg, card: d.card, accent: d.accent };
  const t = themeVars({ ...v, accent2: v.accent });
  r.setProperty('--bg', t.bg); r.setProperty('--card', t.card); r.setProperty('--line', t.line);
  r.setProperty('--accent', t.accent); r.setProperty('--accent-ink', t.ink); r.setProperty('--on-accent', t.on);
  applyBackdrop(custom);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', t.bg);
  return { s: custom || !quick ? {} : s, a: custom ? { name: 'Custom' } : quick ? a : { name: 'Site default' }, custom };
}

// ---------- data (each loads once, and re-renders when it arrives) ----------
const data = {
  me: { state: 'idle', value: null },
  codex: { state: 'idle', value: [] },
  news: { state: 'idle', value: [] },
  article: {},
  builds: { state: 'idle', value: [] },
  guides: { state: 'idle', value: [] },
  notice: { state: 'idle', value: null }
};
async function getJSON(url, ms = 10000) {
  const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw Error(url + ' ' + r.status);
  return r.json();
}
function load(slot, url, pick) {
  const d = data[slot];
  if (d.state !== 'idle') return;
  d.state = 'loading';
  getJSON(url).then(j => { d.value = pick(j); d.state = 'ready'; }).catch(() => { d.state = 'error'; }).finally(render);
}
const loadMe = () => load('me', '/api/account/me', j => j);
// The Codex ships with the app (generated from the game config), so it works even when other servers are down.
function loadCodex() {
  const d = data.codex;
  if (d.state !== 'idle') return;
  d.state = 'loading';
  import('./codex-data.js').then(m => { d.value = codexEntries(m.default); d.order = m.default.kinds; d.version = m.default.version; d.byId = new Map(d.value.map(e => [e.id, e])); d.state = 'ready'; })
    .catch(() => { d.state = 'error'; }).finally(render);
}
const loadNews = () => load('news', '/api/journal', j => sortArticles(j.articles));
const loadBuilds = () => load('builds', '/api/community/posts?kind=build', j => Array.isArray(j.posts) ? j.posts : []);
const loadGuides = () => load('guides', '/api/community/posts?kind=guide', j => Array.isArray(j.posts) ? j.posts : []);
const loadNotice = () => load('notice', '/api/site/theme', j => { const d = safeNextDesign(j.next); if (d && JSON.stringify(d) !== JSON.stringify(siteDesign)) { siteDesign = d; applyTheme(); } return j.notice?.enabled && j.notice.text ? j.notice.text : null; });
function loadArticle(slug) {
  if (data.article[slug]) return;
  data.article[slug] = { state: 'loading', value: null };
  getJSON('/api/journal?slug=' + encodeURIComponent(slug))
    .then(j => { data.article[slug] = { state: 'ready', value: j }; })
    .catch(() => { data.article[slug] = { state: 'error', value: null }; })
    .finally(render);
}

// ---------- shared pieces ----------
const user = () => data.me.value?.user || null;
const initial = () => (user()?.displayName || '?').trim().charAt(0).toUpperCase() || '?';
const label = t => '<h2 class="nx-label">' + esc(t) + '</h2>';
const empty = (title, body, action = '') => '<div class="nx-empty"><strong>' + esc(title) + '</strong><p>' + esc(body) + '</p>' + action + '</div>';
const loading = what => '<div class="nx-loading" role="status">Loading ' + esc(what) + '…</div>';
const failed = (what, retry) => '<div class="nx-empty"><strong>' + esc(what) + ' didn\'t load</strong><p>Check your connection and try again.</p><button class="nx-btn" data-act="retry" data-slot="' + retry + '">Try again</button></div>';
const row = (href, title, detail, ic, external = false) =>
  '<a class="nx-row" href="' + esc(href) + '">' + (ic ? '<span class="nx-row-icon">' + icon(ic, 22) + '</span>' : '') +
  '<span class="nx-row-text"><strong>' + esc(title) + '</strong>' + (detail ? '<small>' + esc(detail) + '</small>' : '') + '</span>' +
  '<span class="nx-row-end">' + icon(external ? 'out' : 'next', 18) + '</span></a>';
const classicNote = '';
const artImg = (path, size = 40) => '<span class="nx-ic">' + ic(path, Math.round(size * .6)) + '</span>';
const artRow = (href, title, detail, path) => '<a class="nx-row" href="' + esc(href) + '"><span class="nx-row-art">' + artImg(path, 36) + '</span>' +
  '<span class="nx-row-text"><strong>' + esc(title) + '</strong>' + (detail ? '<small>' + esc(detail) + '</small>' : '') + '</span><span class="nx-row-end">' + icon('next', 18) + '</span></a>';
const KIND_ART = { item: 'equipment/equipment-weapon', skill: 'features/feature-class-skills', monster: 'stats/stat-boss-damage', material: 'tokens/token-gem-dust', biome: 'tokens/token-arcstone', affix: 'stats/stat-crit-damage', 'drop-bonus': 'stats/stat-drop-bonus', 'pet-bonus': 'tokens/token-pet-egg', rune: 'tokens/token-runic-core', 'rune-word': 'features/feature-rune-forge', gem: 'tokens/token-gem', talisman: 'equipment/equipment-charm', stance: 'stats/stat-retaliation', mechanic: 'features/feature-codex' };
const toolById = id => TOOLS.find(t => t.id === id);

// ---------- views ----------
function homeView() {
  loadNews(); loadBuilds();
  const ev = liveEvents().map(e => '<a class="nx-event" href="' + esc(e.href) + '"><span class="nx-kicker">LIVE EVENT</span><strong>' + esc(e.name) + '</strong><small>' + esc(e.detail) + '</small></a>').join('');
  const n = data.news;
  const latest = n.state === 'ready' && n.value[0]
    ? '<a class="nx-card nx-story" href="' + hashFor('news', n.value[0].slug) + '"><span class="nx-kicker">' + esc((n.value[0].category || 'News').toUpperCase()) + ' · ' + esc(shortDate(n.value[0].publishedAt)) + '</span><strong>' + esc(n.value[0].teaserTitle || n.value[0].title) + '</strong><small>' + esc(n.value[0].subtitle || '') + '</small></a>'
    : n.state === 'error' ? failed('News', 'news') : loading('news');
  // Jump back in first; the event and the latest article are one compact line each.
  const evRow = liveEvents().map(e => '<a class="nx-strip nx-strip-event" href="' + esc(e.href) + '">' + ic('event', 18) + '<span><b>' + esc(e.name) + '</b><small>' + esc(e.detail) + '</small></span><i class="nx-chev"></i></a>').join('');
  const nw = n.state === 'ready' && n.value[0];
  const newsRow = nw ? '<a class="nx-strip" href="' + hashFor('news', nw.slug) + '">' + ic('news', 18) + '<span><b>' + esc(nw.teaserTitle || nw.title) + '</b><small>' + esc((nw.category || 'News') + ' · ' + shortDate(nw.publishedAt)) + '</small></span><i class="nx-chev"></i></a>' : '';
  return '<section><div class="nx-head">' + label(recent().length ? 'Jump back in' : 'Start here') + '<a href="#/tools">All tools</a></div><div class="nx-grid3">' +
    recentTiles(recent()).map(t => '<a class="nx-tile" href="' + esc(t.href) + '">' + artImg(t.art || 'features/feature-codex', 40) + '<span>' + esc(t.short || t.name) + '</span></a>').join('') + '</div></section>' +
    (evRow || newsRow ? '<section class="nx-strips">' + evRow + newsRow + '</section>' : '') +
    '<section><div class="nx-head">' + label('Featured builds') + '<a href="#/builds">All builds</a></div>' + featuredList(3) + '</section>';
}
// Featured picks come from the owner's list (/api/featured); each build loads through the public
// community route, so hidden or deleted builds simply don't appear. Empty list -> Zane's build.
const featuredState = { state: 'idle', cards: [] };
function loadFeatured() {
  if (featuredState.state !== 'idle') return;
  featuredState.state = 'loading';
  getJSON('/api/featured').then(async f => {
    const items = (f.items || []).slice(0, 12);
    const got = await Promise.all(items.map(x => getJSON('/api/community/posts/' + encodeURIComponent(x.postId)).then(j => ({ ...j, note: x.note })).catch(() => null)));
    featuredState.cards = got.filter(Boolean);
    featuredState.state = 'ready';
  }).catch(() => { featuredState.state = 'error'; }).finally(render);
}
// One build card everywhere: class emblem, build type color and icon, then the words.
function buildCard(href, { title, summary = '', note = '', by = '', date = '', meta = null, featured = false }) {
  const t = meta?.stance ? BUILD_TYPES[meta.stance] : null, cls = meta?.cls ? CLASS_NAMES[meta.cls] : '';
  return '<a class="nx-bcard" href="' + esc(href) + '" style="' + (t ? '--bt:' + t.color + ';' : '') + (cls ? '--cc:' + classVar(cls) : '') + '">' +
    '<span class="nx-bcard-emblem">' + ic(cls ? 'class-' + cls.toLowerCase() : 'feature-build-studio', 30) + '</span>' +
    '<span class="nx-bcard-body"><span class="nx-tags">' + (t ? '<span class="nx-btype">' + ic(t.art, 14) + esc(t.name) + '</span>' : '') +
    (cls ? '<span class="nx-tag">' + esc(cls) + '</span>' : '') + (featured ? '<span class="nx-tag nx-tag-accent">Featured</span>' : '') + '</span>' +
    '<strong>' + esc(title) + '</strong>' + (note ? '<small class="nx-note">' + esc(note) + '</small>' : '') + (summary ? '<small>' + esc(summary) + '</small>' : '') +
    '<span class="nx-by">' + [by ? 'by <b>' + esc(by) + '</b>' : '', meta?.level ? 'Level ' + meta.level : '', date].filter(Boolean).join(' · ') + '</span></span></a>';
}
const featuredPick = c => buildCard('#/builds/' + c.post.id, { title: c.post.title, summary: c.post.summary, note: c.note, by: c.author?.displayName || 'Arcana player', meta: nextCode(c.post.build) ? buildMeta(nextCode(c.post.build)) : null, featured: true });
const featuredList = (limit = 12) => { loadFeatured(); return featuredState.cards.length ? '<div class="nx-list">' + featuredState.cards.slice(0, limit).map(featuredPick).join('') + '</div>' : featuredCard(); };
const featuredCard = () => buildCard(FEATURED, { title: "Zane's Retaliation Warrior", summary: 'Retaliation, Defense, Block Chance and Strength, with a four-pet setup.', by: 'Zane', meta: { cls: 1, stance: 'bulwark', level: 196 }, featured: true });

function toolsView(id, query) {
  if (id === 'guild-tree') return guildTreeView(query);
  if (id === 'pathfinder') { const v = pathfinderView(); return v.replace('<!--pf-save-->', saveChecklistBlock(data.me.value)); }
  if (id === 'mlxp') return mlXpView();
  if (id === 'upgrade-map') return upgradeMapView();
  if (id === 'rarity') return rarityView();
  if (id === 'compare') return compareView();
  if (NATIVE_TOOLS.includes(id)) return toolView(id);
  // Most used first: Upgrade costs and ML XP, then the pet calculators, then everything else.
  const hero = (href, kicker, title, detail, path, tone) => '<a class="nx-hero nx-tone-' + tone + '" href="' + href + '">' + artImg(path, 64) + '<span><span class="nx-kicker">' + kicker + '</span><strong>' + esc(title) + '</strong><small>' + esc(detail) + '</small></span></a>';
  const mid = t => '<a class="nx-tool-card" href="' + t.href + '">' + artImg(t.art, 48) + '<strong>' + esc(t.name) + '</strong><small>' + esc(t.detail) + '</small></a>';
  return '<section>' + label('Most used') + '<div class="nx-heroes">' +
      hero('#/tools/pathfinder', 'PATHFINDER', 'Upgrade costs', 'Materials and gold from any rank to any rank, per slot', 'features/feature-upgrade', 'violet') +
      hero('#/tools/mlxp', 'PATHFINDER', 'ML XP planner', 'XP, kills and time to your next Monster Levels', 'stats/stat-exp-gain', 'teal') + '</div></section>' +
    '<section>' + label('Pets') + '<div class="nx-grid2">' + mid(toolById('pet')) + mid(toolById('affix')) + '</div></section>' +
    '<section>' + label('Planning') + '<div class="nx-list">' + ['studio', 'guild-tree', 'skills'].map(k => { const t = toolById(k); return artRow(t.href, t.name, t.detail, t.art); }).join('') + '</div></section>' +
    '<section>' + label('More Pathfinder') + '<div class="nx-list">' +
      artRow('#/tools/upgrade-map', 'Upgrade map', 'Every step of every rank, one at a time', 'tokens/token-upgrade-catalyst') +
      artRow('#/tools/compare', 'Compare items', 'Two items’ base ranges at the same rarity', 'equipment/equipment-weapon') +
      artRow('#/tools/rarity', 'Rarity reference', 'Base cost of each rarity upgrade', 'tokens/token-gem') + '</div></section>' +
    '<section>' + label('Farming') + '<div class="nx-list">' + (t => artRow(t.href, t.name, t.detail, t.art))(toolById('ml')) + '</div></section>';
}

let codexQuery = '', codexKind = '';
// Codex art: one sprite from the official sheets, or a color swatch for runes, gems and talismans.
function art(e, size) {
  if (e.art) return '<i class="nx-art' + (e.art.round ? ' round' : '') + '" aria-hidden="true" style="width:' + size + 'px;height:' + size + 'px;background-image:url(' + esc(e.art.url) + ');background-size:' + esc(e.art.size) + ';background-position:' + esc(e.art.pos) + '"></i>';
  if (e.swatch) return '<i class="nx-swatchdot" aria-hidden="true" style="width:' + Math.round(size * .6) + 'px;height:' + Math.round(size * .6) + 'px;background:' + esc(e.swatch) + '"></i>';
  return '';
}
// Row subtitle with the kind in front, without saying it twice ("Biome · Biome · Tier 1").
const withKind = e => { const k = kindSingular(e.kind); return e.subtitle && e.subtitle.toLowerCase().startsWith(k.toLowerCase()) ? e.subtitle : k + (e.subtitle ? ' · ' + e.subtitle : ''); };
const codexRow = (e, sub) => '<a class="nx-row nx-crow" href="' + hashFor('codex', e.id) + '">' + (e.art || e.swatch ? '<span class="nx-thumb">' + art(e, 40) + '</span>' : '') +
  '<span class="nx-row-text"><strong>' + esc(e.title) + '</strong><small>' + esc(sub ?? e.subtitle) + '</small></span><span class="nx-row-end">' + icon('next', 18) + '</span></a>';
function codexView(id) {
  loadCodex();
  const c = data.codex;
  if (id) {
    if (c.state !== 'ready') return c.state === 'error' ? failed('The Codex', 'codex') : loading('the Codex');
    const e = c.value.find(x => x.id === id);
    if (!e) return empty('Not in the Codex', 'This page may have been renamed after a patch.', '<a class="nx-btn" href="#/codex">Back to the Codex</a>');
    const byId = c.byId, rel = (e.related || []).map(r => byId.get(r)).filter(Boolean);
    return '<a class="nx-back" href="#/codex">' + icon('back', 18) + 'Codex</a>' +
      '<header class="nx-page-head nx-codexhead">' + (e.art || e.swatch ? '<span class="nx-bigart">' + art(e, 72) + '</span>' : '') + '<span><span class="nx-kicker">' + esc(kindSingular(e.kind).toUpperCase()) + '</span><h1>' + esc(e.title) + '</h1>' + (e.subtitle ? '<p>' + esc(e.subtitle) + '</p>' : '') + '</span></header>' +
      (e.description ? '<p class="nx-read">' + esc(e.description) + '</p>' : '') +
      (e.chips ? '<div class="nx-chips">' + e.chips.map(x => '<span style="background:' + esc(x.color) + '">' + esc(x.label) + '</span>').join('') + '</div>' : '') +
      (e.facts.length ? '<dl class="nx-facts">' + e.facts.map(([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>').join('') + '</dl>' : '') +
      (e.table ? '<div class="nx-tablewrap"><table class="nx-table"><thead><tr>' + e.table.head.map(h => '<th scope="col">' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + e.table.rows.map(r => '<tr>' + r.map((v, i) => i ? '<td>' + esc(v) + '</td>' : '<th scope="row">' + esc(v) + '</th>').join('') + '</tr>').join('') + '</tbody></table></div>' : '') +
      (e.note ? '<p class="nx-callout">' + esc(e.note) + '</p>' : '') +
      (e.links.length ? '<section>' + label('Use it') + '<div class="nx-list">' + e.links.map(l => row(l.href, l.label, '', '', !!l.ext)).join('') + '</div></section>' : '') +
      (rel.length ? '<section>' + label(e.relatedTitle || 'Related') + '<div class="nx-list">' + rel.map(r => codexRow(r, withKind(r))).join('') + '</div></section>' : '') +
      '<p class="nx-fine">From the game config' + (c.version ? ' (' + esc(c.version) + ')' : '') + '.</p>';
  }
  const body = c.state === 'error' ? failed('The Codex', 'codex') : c.state !== 'ready' ? loading('the Codex') : codexResults(c.value);
  return '<label class="nx-search nx-search-input">' + icon('search', 18) + '<input id="nxCodexQ" type="search" autocomplete="off" placeholder="Search items, skills, monsters, runes" aria-label="Search the Codex" value="' + esc(codexQuery) + '"></label><div id="nxCodexBody">' + body + '</div>';
}
function codexResults(entries) {
  if (codexKind && !codexQuery.trim()) {
    const list = entries.filter(e => e.kind === codexKind);
    return '<div class="nx-head">' + label(kindName(codexKind)) + '<button class="nx-link" data-act="kind" data-kind="">All categories</button></div><div class="nx-list">' + list.map(e => codexRow(e)).join('') + '</div>';
  }
  if (codexQuery.trim()) {
    const hits = searchIndex(entries, codexQuery, 40);
    if (!hits.length) return empty('Nothing found', 'Try a shorter word, like an item, skill or monster name.');
    return '<div class="nx-list">' + hits.map(e => codexRow(e, withKind(e))).join('') + '</div>';
  }
  return '<section>' + label('Browse') + '<div class="nx-grid2">' + codexCategories(entries, data.codex.order).map(k => '<button class="nx-tile nx-tile-left nx-ktile" data-act="kind" data-kind="' + esc(k.kind) + '">' + artImg(KIND_ART[k.kind] || 'features/feature-codex', 40) + '<span><strong>' + esc(k.name) + '</strong><small>' + k.count + ' entries</small></span></button>').join('') + '</div></section>';
}

const posts = {};
function loadPost(id) {
  if (posts[id]) return;
  posts[id] = { state: 'loading' };
  getJSON('/api/community/posts/' + encodeURIComponent(id))
    .then(j => { posts[id] = { state: 'ready', post: j.post, author: j.author }; })
    .catch(() => { posts[id] = { state: 'error' }; })
    .finally(render);
}
function postView(id) {
  loadPost(id);
  const back = '<a class="nx-back" href="#/builds">' + icon('back', 18) + 'Builds</a>';
  const p = posts[id];
  if (p.state === 'loading') return back + loading('the build');
  if (p.state === 'error') return back + empty('Build not found', 'It may have been removed by its author or a moderator.');
  if (p.post.kind === 'guide') return back + '<article class="nx-article"><span class="nx-kicker">COMMUNITY GUIDE · ' + esc(shortDate(p.post.createdAt).toUpperCase()) + '</span><h1>' + esc(p.post.title) + '</h1>' +
    (p.post.summary ? '<p class="nx-deck">' + esc(p.post.summary) + '</p>' : '') + '<p class="nx-by">by <b>' + esc(p.author?.displayName || 'Arcana player') + '</b></p>' + articleHtml(p.post.body || '') + '</article>' +
    '<p class="nx-fine">Written by a player. Spot something wrong? <a href="#/feedback">Tell me</a>.</p>';
  const code = nextCode(p.post.build);
  const intro = (p.post.summary ? '<p class="nx-read">' + esc(p.post.summary) + '</p>' : '') + (p.post.body ? '<div class="nx-article">' + articleHtml(p.post.body) + '</div>' : '');
  if (!code) return back + '<header class="nx-page-head"><span class="nx-kicker">COMMUNITY BUILD</span><h1>' + esc(p.post.title) + '</h1><p>by ' + esc(p.author?.displayName || 'Arcana player') + '</p></header>' + intro +
    '<a class="nx-btn nx-btn-primary" href="/#/community/post?id=' + encodeURIComponent(id) + '">Open in the classic Build Studio</a>';
  // Credit comes from the server's author record, never from the link itself.
  return sharedView(code, { title: p.post.title, by: p.author?.displayName || 'Arcana player', kicker: 'COMMUNITY BUILD · ' + shortDate(p.post.createdAt).toUpperCase(), intro, back });
}

let buildTab = 'featured';
// Write a community guide (same /api/community/posts rules: title 6+, summary 20+, body 80+ characters).
const G = { title: '', summary: '', body: '', ok: false, busy: false, error: '' };
function guideForm() {
  const u = user(), back = '<a class="nx-back" href="#/builds">' + icon('back', 18) + 'Builds</a>';
  if (!u) return back + '<div class="nx-card"><strong>Sign in to write a guide</strong><small>Guides are published under your Arcana name.</small>' + signInButtons(data.me.value) + '</div>';
  return back + '<header class="nx-page-head"><span class="nx-kicker">COMMUNITY GUIDE</span><h1>Write a guide</h1><p>Explain how to play something well. Builds go in Build Studio; guides are the why and how.</p></header>' +
    '<section class="nx-tool"><label class="nx-field">Title<input maxlength="110" value="' + esc(G.title) + '" data-g="title" placeholder="At least 6 characters"></label>' +
    '<label class="nx-field">Summary<textarea rows="2" maxlength="300" data-g="summary" placeholder="One or two sentences (at least 20 characters)">' + esc(G.summary) + '</textarea></label>' +
    '<label class="nx-field">Guide<textarea rows="12" maxlength="12000" data-g="body" placeholder="At least 80 characters. Blank line between paragraphs, ## for headings, - for lists, **bold**.">' + esc(G.body) + '</textarea></label>' +
    '<label class="st-consent"><input type="checkbox" data-g="ok"' + (G.ok ? ' checked' : '') + '><span>Publish this guide publicly, credited as <b>' + esc(u.displayName) + '</b>.</span></label>' +
    (G.error ? '<p class="st-err" role="alert">' + esc(G.error) + '</p>' : '') +
    '<button class="nx-btn nx-btn-primary" data-act="publishGuide"' + (G.busy ? ' disabled' : '') + '>' + (G.busy ? 'Publishing…' : 'Publish guide') + '</button></section>';
}

function buildsView(id) {
  if (id === 'new-guide') return guideForm();
  if (id === 'community' || id === 'guides' || id === 'featured') { buildTab = id; history.replaceState(null, '', '#/builds'); }
  else if (id) return postView(id);
  loadBuilds();
  if (buildTab === 'guides') loadGuides();
  const tabs = '<div class="nx-seg" role="tablist" aria-label="Source">' + [['featured', 'Featured'], ['community', 'Community'], ['guides', 'Guides']].map(([id, l]) => '<button role="tab" aria-selected="' + (buildTab === id) + '" data-act="buildtab" data-tab="' + id + '">' + l + '</button>').join('') + '</div>';
  let body;
  if (buildTab === 'featured') body = featuredList();
  else if (buildTab === 'guides') {
    const g = data.guides;
    body = '<a class="nx-btn nx-btn-primary" href="#/builds/new-guide">Write a guide</a>' + (g.state === 'error' ? failed('Guides', 'guides') : g.state !== 'ready' ? loading('guides')
      : g.value.length ? '<div class="nx-list">' + g.value.map(p => '<a class="nx-card" href="#/builds/' + encodeURIComponent(p.id) + '"><strong>' + esc(p.title) + '</strong><small>' + esc(p.summary || p.excerpt || '') + '</small><span class="nx-by">' + esc(shortDate(p.createdAt)) + '</span></a>').join('') + '</div>'
      : empty('No guides yet', 'Know something other players should? Write the first one.'));
    return tabs + body;
  } else {
    const b = data.builds;
    body = b.state === 'error' ? failed('Community builds', 'builds') : b.state !== 'ready' ? loading('builds')
      : b.value.length ? '<div class="nx-list">' + b.value.map(p => buildCard('#/builds/' + encodeURIComponent(p.id), { title: p.title, summary: p.summary || p.excerpt || '', date: shortDate(p.createdAt), meta: p.card })).join('') + '</div>'
      : empty('No community builds yet', 'Be the first. Make your build in Build Studio and share it with the community.', '<a class="nx-btn" href="#/studio">Open Build Studio</a>');
  }
  return tabs + body + '<section>' + label('How submitting works') + '<ol class="nx-steps"><li>Make your build in Build Studio. Fill in as much or as little as you like.</li><li>Tap Share, then Publish to Community. Pick the parts, add a summary, and agree to be credited.</li><li>It goes live under Community right away. The best get Featured.</li></ol></section>';
}

function newsView(slug) {
  if (slug) {
    loadArticle(slug);
    const a = data.article[slug];
    if (!a || a.state === 'loading') return '<a class="nx-back" href="#/news">' + icon('back', 18) + 'News</a>' + loading('the article');
    if (a.state === 'error') return '<a class="nx-back" href="#/news">' + icon('back', 18) + 'News</a>' + empty('Article not found', 'It may have been moved or unpublished.');
    const v = a.value;
    return '<a class="nx-back" href="#/news">' + icon('back', 18) + 'News</a><article class="nx-article"><span class="nx-kicker">' + esc((v.category || 'News').toUpperCase()) + ' · ' + esc(shortDate(v.publishedAt)) + '</span><h1>' + esc(v.title) + '</h1>' +
      (v.subtitle ? '<p class="nx-deck">' + esc(v.subtitle) + '</p>' : '') + '<p class="nx-by">by <b>' + esc(v.author || 'Arcana') + '</b></p>' + articleHtml(v.body, slug) + '</article>';
  }
  loadNews();
  const n = data.news;
  if (n.state === 'error') return failed('News', 'news');
  if (n.state !== 'ready') return loading('news');
  if (!n.value.length) return empty('No news yet', 'Patch notes and events show up here.');
  return '<div class="nx-list">' + n.value.map(a => '<a class="nx-card nx-story" href="' + hashFor('news', a.slug) + '"><span class="nx-kicker">' + esc((a.category || 'News').toUpperCase()) + ' · ' + esc(shortDate(a.publishedAt)) + '</span><strong>' + esc(a.teaserTitle || a.title) + '</strong>' + (a.subtitle ? '<small>' + esc(a.subtitle) + '</small>' : '') + '</a>').join('') + '</div>';
}

function directoryView() {
  const u = user();
  const ev = liveEvents()[0];
  const sec = (t, rows) => '<section>' + label(t) + '<div class="nx-list">' + rows.join('') + '</div></section>';
  return '<header class="nx-page-head"><span class="nx-kicker">ALL OF ARCANA</span><h1>Directory</h1><p>Every page in one place.</p></header>' +
    sec('Tools', [artRow('#/tools', 'All tools', 'Pathfinder, pet calculators, planners', 'features/feature-tools'), ...TOOLS.filter(t => t.art).map(t => artRow(t.href, t.name, t.detail, t.art))]) +
    sec('Game reference', [artRow('#/codex', 'Codex', 'Items, skills, monsters, materials, biomes and more', 'features/feature-codex')]) +
    sec('Builds and guides', [artRow('#/builds', 'Featured builds', 'Picked by Zane', 'features/feature-builds'), artRow('#/builds/community', 'Community builds', 'Shared by players', 'features/feature-community'), artRow('#/builds/guides', 'Guides', 'Written by players', 'features/feature-guides'), artRow('#/studio', 'Build Studio', 'Make your own and share it', 'features/feature-build-studio')]) +
    sec('News and events', [artRow('#/news', 'News', 'Patch notes, events and articles', 'features/feature-wiki'), ...(ev ? [artRow(ev.href, ev.name, ev.detail, 'tokens/token-ruby')] : [])]) +
    sec('Community', [artRow('#/guilds', 'Guilds', 'Find a guild and apply', 'features/feature-guild-raid'), artRow('#/lfg', 'Looking for group', 'Raids, teams and planned runs', 'features/feature-community'), artRow('#/records', 'Season records', 'Top players and guilds by season', 'stats/stat-boss-damage')]) +
    sec('You', [artRow('#/profile', 'Profile and theme', u ? 'Saved builds, checklists, colors' : 'Sign in, colors', 'tokens/token-guildstone'), artRow('#/feedback', 'Report a problem', 'Bugs, wrong data, ideas', 'features/feature-feedback'), ...(u?.permissions?.manageSite ? [artRow('#/admin', 'Admin', 'Featured, news, people, traffic', 'tokens/token-runic-core')] : [])]);
}

function profileView() {
  const { s, a } = applyTheme();
  const u = user(), me = data.me.value;
  const who = u
    ? '<div class="nx-me"><span class="nx-avatar nx-avatar-lg">' + esc(initial()) + '</span><span><strong>' + esc(u.displayName) + '</strong><small>' + esc([u.inGameName, u.guild].filter(Boolean).join(' · ') || 'Arcana member') + '</small></span></div>'
    : '<div class="nx-card"><strong>Sign in to save builds</strong><small>Your builds follow you to any device.</small>' + signInButtons(me) + '</div>';
  const admin = u?.permissions?.manageSite ? '<a class="nx-row nx-row-admin" href="#/admin"><span class="nx-row-text"><strong>Admin</strong><small>Community builds, Featured, announcement</small></span><span class="nx-row-end">' + icon('next', 18) + '</span></a>' : '';
  return who + admin +
    savedBuildsSection(!!u) + checklistsSection(!!u) +
    '<section>' + label('Theme') + artRow('#/profile/theme', 'Theme designer', readTheme() ? 'Your custom theme is on. Tap to edit it.' : 'Presets, your own colors and vector backdrops', 'features/feature-rune-forge') + '<div class="nx-card nx-theme">' +
    '<span class="nx-sub">Background</span><div class="nx-grid2" role="radiogroup" aria-label="Background">' + SURFACES.map(x => '<button role="radio" aria-checked="' + (x.id === s.id) + '" data-act="surface" data-id="' + x.id + '" class="nx-swatch" style="background:' + x.bg + '"><span style="background:' + x.card + '"></span>' + esc(x.name) + '</button>').join('') + '</div>' +
    '<span class="nx-sub">Accent <em>· ' + esc(a.name) + '</em></span><div class="nx-dots" role="radiogroup" aria-label="Accent">' + ACCENTS.map(x => '<button role="radio" aria-checked="' + (x.id === a.id) + '" aria-label="' + esc(x.name) + '" data-act="accent" data-id="' + x.id + '" style="background:' + x.hex + '"></button>').join('') + '</div>' +
    '<p class="nx-fine">Rarity, class and rune colors never change, so the accent can\'t be confused with game colors.</p></div></section>' +
    '<section>' + label('Community') + '<div class="nx-list">' + row('#/guilds', 'Guilds', 'Find a guild and apply', '') + row('#/lfg', 'Looking for group', 'Raids, teams and planned runs', '') + row('#/records', 'Season records', 'Top players and guilds by season', '') + row('/#/community', 'Community posts', '', '', true) + '</div></section>' +
    '<section>' + label('More') + '<div class="nx-list">' + row('#/feedback', 'Report a problem', 'Bugs, wrong data, ideas', '') + row('/', 'Classic Arcana', 'The current site, unchanged', '', true) + (u ? row('/api/account/logout', 'Sign out', '', '', true) : '') + '</div></section>';
}

// ---------- recently used tools ----------
const recent = () => { try { return JSON.parse(localStorage.getItem(RECENT_TOOLS_KEY)) || []; } catch { return []; } };
function noteVisit(section, id) {
  const tool = section === 'studio' ? 'studio' : section === 'codex' ? 'codex' : section === 'tools' && id ? id : null;
  if (!tool) return;
  const next = rememberTool(recent(), tool);
  try { localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(next)); } catch { /* private mode: defaults show */ }
}

// ---------- shell ----------
const TITLES = { directory: 'Directory', lfg: 'LFG', records: 'Records', guilds: 'Guilds', checklist: 'Checklist', feedback: 'Feedback', admin: 'Admin', tools: 'Tools', codex: 'Codex', builds: 'Builds', news: 'News', profile: 'Profile', studio: 'Build Studio', build: 'Shared build' };
function render() {
  const { section, id, query } = parseHash(location.hash);
  noteVisit(section, id);
  if (section !== 'feedback' && section !== 'profile') notePage(location.hash);
  loadMe(); loadNotice();
  const tab = activeTab(section);
  const view = section === 'directory' ? directoryView() : section === 'lfg' ? lfgView() : section === 'records' ? recordsView() : section === 'guilds' ? guildsView(id, data.me.value) : section === 'checklist' ? checklistView(id) : section === 'feedback' ? feedbackView() : section === 'admin' ? (id === 'design' ? designView(user()) : adminView(user())) : section === 'studio' ? studioView(id) : section === 'build' ? sharedView(query.get('d') || '') : section === 'tools' ? toolsView(id, query) : section === 'codex' ? codexView(id) : section === 'builds' ? buildsView(id)
    : section === 'news' ? newsView(id) : section === 'profile' ? (id === 'theme' ? themeView() : profileView()) : homeView();
  const logo = '<img src="/assets/arcana-logo.webp" width="34" height="28" alt="">';
  const title = section === 'home' ? '<a class="nx-brand" href="#/home" aria-label="Arcana home">' + logo + '<span>ARCANA</span></a>'
    : '<a class="nx-brand nx-brand-sm" href="#/home" aria-label="Arcana home">' + logo + '</a><span class="nx-title">' + esc(TITLES[section]) + '</span>';
  $('nxTopL').innerHTML = title;
  $('nxTopR').innerHTML =
    '<a class="nx-avatar" href="#/profile" aria-label="Profile"' + (section === 'profile' ? ' aria-current="page"' : '') + '>' + (user() ? esc(initial()) : icon('user', 18)) + '</a>';
  $('nxNav').innerHTML = TABS.map(t => '<a href="' + (t.href || hashFor(t.id)) + '"' + (t.id === 'search' ? ' class="nx-nav-search"' : '') + (t.id === tab ? ' aria-current="page"' : '') + '>' + (t.id === 'search' ? '<i>' + ic('search', 24) + '</i>' : ic(t.id === 'tools' ? 'tools' : t.id, 22)) + '<span>' + t.label + '</span></a>').join('');
  document.body.dataset.section = section;
  $('nxNotice').hidden = !data.notice.value;
  $('nxNotice').textContent = data.notice.value || '';
  const main = $('nxMain'), key = section + '/' + id;
  const focusSearch = document.activeElement?.id === 'nxCodexQ';
  main.innerHTML = view;
  if (main.dataset.key !== key) { main.dataset.key = key; window.scrollTo(0, 0); }
  if (section === 'studio') studioAfterRender();
  if (focusSearch) { const q = $('nxCodexQ'); q?.focus(); q?.setSelectionRange(q.value.length, q.value.length); }
  document.title = (section === 'home' ? 'Arcana' : (TITLES[section] || 'Arcana') + ' · Arcana');
}

document.addEventListener('change', e => { if (e.target.dataset?.g === 'ok') G.ok = e.target.checked; });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'surface') { saveTheme(null); write(SURFACE_KEY, b.dataset.id); render(); }
  if (act === 'accent') { saveTheme(null); write(ACCENT_KEY, b.dataset.id); render(); }
  if (act === 'buildtab') { buildTab = b.dataset.tab; render(); }
  if (act === 'kind') { codexKind = b.dataset.kind; codexQuery = ''; render(); }
  if (act === 'publishGuide') {
    const t = G.title.trim(), su = G.summary.trim(), bo = G.body.trim();
    G.error = t.length < 6 ? 'Give it a title of at least 6 characters.' : su.length < 20 ? 'Add a summary of at least 20 characters.' : bo.length < 80 ? 'The guide needs at least 80 characters.' : !G.ok ? 'Tick the box to agree to publishing under your name.' : '';
    if (G.error) return render();
    G.busy = true; render();
    fetch('/api/community/posts', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'guide', title: t, summary: su, body: bo }) })
      .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(r.status === 429 ? 'You’ve hit today’s publishing limit (10).' : j.error || 'Couldn’t publish.'); Object.assign(G, { title: '', summary: '', body: '', ok: false }); data.guides.state = 'idle'; location.hash = '#/builds/' + j.post.id; })
      .catch(err => { G.error = err.message; }).finally(() => { G.busy = false; render(); });
    return;
  }
  if (act === 'retry') { const slot = { news: 'news', codex: 'codex', builds: 'builds', guides: 'guides' }[b.dataset.slot]; if (slot) { data[slot].state = 'idle'; render(); } }
});
// Remember where the player was, so the classic account page can send them back after sign-in.
document.addEventListener('click', e => {
  if (!e.target.closest('[data-signin]')) return;
  try { sessionStorage.setItem(RETURN_KEY, '/next' + (location.hash || '#/home')); } catch { /* private mode: they land on the classic account page */ }
}, true);
document.addEventListener('input', e => {
  const gk = e.target.dataset?.g;
  if (gk) { G[gk] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; return; }
  if (e.target.id !== 'nxCodexQ') return;
  codexQuery = e.target.value;
  const body = $('nxCodexBody');
  if (body && data.codex.state === 'ready') body.innerHTML = codexResults(data.codex.value);
});
window.addEventListener('hashchange', render);
initStudio(render);
initTools(render);
initPathfinder(render);
initMlXp(render);
initPathfinderViews(render);
initAdmin(render);
initFeedback(render);
initChecklists(render);
initGuilds(render);
initCommunity(render);
initGuildTree(render);
initTheme(render, applyTheme);
initDesign(render, applyTheme);
window.addEventListener('arcana:news-changed', () => { data.news.state = 'idle'; data.article = {}; });
window.addEventListener('arcana:featured-changed', () => { featuredState.state = 'idle'; data.builds.state = 'idle'; });
applyTheme();
render();
