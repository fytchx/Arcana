Warning: truncated output (original token count: 15856)
Total output lines: 706

// Arcana Next: the new app shell. Runs beside the classic site and uses the same APIs.
import {
  SURFACES, ACCENTS, SURFACE_KEY, ACCENT_KEY, surfaceById, accentById, TABS, TOOLS,
  parseHash, hashFor, activeTab, searchIndex, codexEntries, codexCategories, kindName, kindSingular,
  sortArticles, shortDate, articleHtml, liveEvents, esc, signInButtons, RETURN_KEY, RECENT_TOOLS_KEY, rememberTool, recentTiles,
  ic, setIconStyle, classVar, classBadge, buildMark, CLASS_NAMES, BUILD_TYPES, buildMeta,
} from './core.js';
import { studioView, sharedView, initStudio, studioAfterRender, savedBuildsSection } from './studio.js';
import { nextCode } from './studio-core.js';
import { languageControl, languageSettingsField, initLocalization, translateTree, translateEnglish, getLocale } from './i18n.js';
import { editorialTranslation, editorialControl, initEditorialLocalization } from './i18n-content.js';
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
import { handbookView, handbookHomeSection, handbookPopup, initHandbook, handbookPages, hbText } from './handbook.js';
import { FEATURED_GUIDES, featuredGuide } from './guides-content.js';
import { GUIDE_TOOL_OPTIONS, guideInsert } from './guide-editor.js';
import { retaliationView, initRetaliation } from './retaliation.js';
import { editorView, initHandbookEditor } from './handbook-editor.js';
import {guidebookView,initGuidebook} from './guidebook.js';
import {guidebookEditorView,adminGuidebookTab,initGuidebookEditor} from './guidebook-editor.js';
import { saveChecklistBlock, checklistsSection, checklistView, initChecklists } from './checklists.js';
import { emptyBuild, encodeShare } from './studio-core.js';

// Zane's featured build is his own Build Studio setup, stored with his guide.
const FEATURED = '#/build?d=' + FEATURED_GUIDES[0].build;

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
  out: '<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
  install: '<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 17v3h16v-3"/>'
};
const icon = (name, size = 22) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';

// ---------- theme ----------
// Layers: the published site design (Admin › Design), then an admin's unpublished draft on this device,
// then the player's own Theme designer colors.
let siteDesign = null;
const DISPLAY_KEY = 'arcana-next-display-v1';
// Install as an app: Chrome/Edge/Android fire beforeinstallprompt; iPhone needs Share → Add to Home Screen.
let installEvt = null;
let installHelpOpen = false;
const INSTALL_HIDE = 'arcana-next-install-hidden-v1';
const INSTALL_DONE = 'arcana-next-app-installed-v1';
let installedThisBrowser = !!read(INSTALL_DONE);
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const appInstalled = () => standalone() || installedThisBrowser;
const rememberInstall = () => { installedThisBrowser = true; installHelpOpen = false; write(INSTALL_DONE, '1'); };
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  // If the browser can offer installation again, a persisted installed flag may be stale after an uninstall.
  installedThisBrowser = false;
  try { localStorage.removeItem(INSTALL_DONE); } catch { /* storage may be disabled */ }
  installEvt = e;
  render();
});
window.addEventListener('appinstalled', () => { installEvt = null; rememberInstall(); render(); });
// Chromium can detect an already installed same-origin PWA even if it predates this feature.
// Not all browsers implement this API; standalone mode and appinstalled remain the fallbacks.
if (typeof navigator.getInstalledRelatedApps === 'function') {
  navigator.getInstalledRelatedApps().then(apps => {
    if (apps.some(app => app.platform === 'webapp' && (!app.url || new URL(app.url, location.href).origin === location.origin))) {
      rememberInstall();
      render();
    }
  }).catch(() => {});
}
function installDirectoryAction() {
  return appInstalled() ? '' : '<button type="button" class="nx-directory-install" data-act="install">' + icon('install', 18) + '<span>Install app</span></button>';
}
function installDirectoryHelp() {
  if (appInstalled() || !installHelpOpen) return '';
  const message = isIOS()
    ? 'In Safari, tap Share, then Add to Home Screen.'
    : 'Open your browser menu and choose Install app or Add to Home screen. If you are inside another app, open Arcana in Chrome first.';
  return '<div class="nx-directory-install-help" role="status"><span>' + esc(message) + '</span><button type="button" data-act="installhelpclose" aria-label="Close install instructions">×</button></div>';
}
function installBanner(where) {
  if (appInstalled()) return '';
  if (where === 'home' && read(INSTALL_HIDE)) return '';
  if (installEvt) return '<div class="nx-install"><img src="/assets/arcana-app-192.png" width="40" height="40" alt=""><span><b>Get the Arcana app</b><small>Opens full screen from your home screen.</small></span><button class="nx-btn nx-btn-primary" data-act="install">Install</button>' + (where === 'home' ? '<button class="nx-install-x" data-act="installhide" aria-label="Hide">✕</button>' : '') + '</div>';
  if (isIOS()) return '<div class="nx-install"><img src="/assets/arcana-app-192.png" width="40" height="40" alt=""><span><b>Get the Arcana app</b><small>Tap Share, then Add to Home Screen.</small></span>' + (where === 'home' ? '<button class="nx-install-x" data-act="installhide" aria-label="Hide">✕</button>' : '') + '</div>';
  return '';
}
// Same math as the classic site (src/theme.js): rotate the logo's violet facets to the accent's hue.
function logoFilterForAccent(hex) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255), hi = Math.max(...rgb), lo = Math.min(...rgb), d = hi - lo;
  if (d < .055) return 'grayscale(1) brightness(1.15) contrast(1.07)';
  let h = hi === rgb[0] ? ((rgb[1] - rgb[2]) / d) % 6 : hi === rgb[1] ? (rgb[2] - rgb[0]) / d + 2 : (rgb[0] - rgb[1]) / d + 4;
  h = ((h * 60) % 360 + 360) % 360;
  return 'hue-rotate(' + (((h - 273 + 540) % 360) - 180).toFixed(1) + 'deg) saturate(1.1) brightness(1.035)';
}
function activeDesign() { return readDraft() || siteDesign || DEFAULT_NEXT_DESIGN; }
function applyTheme() {
  const d = activeDesign(), r = document.documentElement.style;
  for (const [k, v] of Object.entries(designVars(d))) r.setProperty(k, v);
  setIconStyle(d.iconStyle);
  document.documentElement.dataset.tile = d.iconTile; document.documentElement.dataset.header = d.headerAlign;
  const href = fontHref(d), link = document.getElementById('nxFonts') || Object.assign(document.head.appendChild(document.createElement('link')), { id: 'nxFonts', rel: 'stylesheet' });
  if (link.getAttribute('href') !== href) link.setAttribute('href', href);
  // Players don't restyle the site; they only choose the full design or a simplified one.
  const t = themeVars({ bg: d.bg, card: d.card, accent: d.accent, accent2: d.accent });
  r.setProperty('--bg', t.bg); r.setProperty('--card', t.card); r.setProperty('--line', t.line);
  r.setProperty('--accent', t.accent); r.setProperty('--accent-ink', t.ink); r.setProperty('--on-accent', t.on);
  r.setProperty('--logo-filter', logoFilterForAccent(t.accent));
  document.documentElement.dataset.display = read(DISPLAY_KEY) === 'simple' ? 'simple' : 'full';
  applyBackdrop(null);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', t.bg);
  // Remember the look, so the next visit's loading screen and first paint already match.
  try { const keep = {}; for (const k of ['--bg', '--card', '--line', '--accent', '--accent-ink', '--on-accent', '--text', '--logo-filter', '--r-sm', '--r', '--r-lg', '--grad', '--glowk', '--bw', '--font-h', '--sans', '--wm', '--gap', '--pad', '--c-warrior', '--c-archer', '--c-mage', '--c-rogue', '--c-druid']) keep[k] = r.getPropertyValue(k); localStorage.setItem('arcana-next-vars-v1', JSON.stringify(keep)); } catch { /* private mode */ }
  return {};
}

// ---------- data (each loads once, and re-renders when it arrives) ----------
let logoutBusy = false, logoutError = '';
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
// Logout is a POST mutation, not a link to visit in the browser.
async function signOut() {
  if (logoutBusy) return;
  logoutBusy = true; logoutError = '';
  render();
  try {
    const response = await fetch('/api/account/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok !== true) throw Error(body.error || 'Sign out failed. Please try again.');
    try { sessionStorage.removeItem(RETURN_KEY); } catch { /* unavailable storage */ }
    location.hash = '#/profile';
    location.reload(); // load account state again with the cleared session cookie
  } catch (err) {
    logoutError = err.message || 'Sign out failed. Please try again.';
    logoutBusy = false;
    render();
  }
}

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
const KOFI = 'https://ko-fi.com/arcanacompanion';
const SUPPORT_LINE = 'Arcana is free and fan-made.', SUPPORT_CTA = 'Support it on Ko-fi';
const row = (href, title, detail, ic, external = false) =>
  '<a class="nx-row" href="' + esc(href) + '"' + (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '') + '>' + (ic ? '<span class="nx-row-icon">' + icon(ic, 22) + '</span>' : '') +
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
  const n = data.news;
  // The historic Halloween guide stays in News, never the homepage's latest-news slot.
  const nw = n.state === 'ready' && n.value.find(a => a.slug !== 'hallowed-harvest-2026-guide');
  const newsRow = nw ? '<a class="nx-strip" href="' + hashFor('news', nw.slug) + '">' + ic('news', 18) + '<span><b>' + esc(nw.teaserTitle || nw.title) + '</b><small>' + esc((nw.category || 'News') + ' · ' + shortDate(nw.publishedAt)) + '</small></span><i class="nx-chev"></i></a>' : '';
  const evRow = liveEvents().map(e => '<a class="nx-strip nx-strip-event" href="' + esc(e.href) + '">' + ic('event', 18) + '<span><b>' + esc(e.name) + '</b><small>' + esc(e.detail) + '</small></span><i class="nx-chev"></i></a>').join('');
  // The three main tools, always in the same place; recently used tools sit one tap away.
  const main = [['#/tools/pathfinder', 'upgrade', 'Pathfinder', 'Upgrade costs and ML XP'], ['#/studio', 'studio', 'Build Studio', 'Make and share a build'], ['#/codex', 'codex', 'Handbook', 'Everything IdleArc']];
  const rec = recent().map(id => id === 'codex' ? null : TOOLS.find(t => t.id === id)).filter(Boolean);
  return installBanner('home') + '<section><div class="nx-head">' + label('Start here') + '<a href="#/tools">All tools</a></div><div class="nx-grid3">' +
    main.map(([h, i, l, dsc]) => '<a class="nx-tile nx-main-tile" href="' + h + '"><span class="nx-ic">' + ic(i, 24) + '</span><strong>' + l + '</strong><small>' + dsc + '</small></a>').join('') + '</div>' +
    (rec.length ? '<details class="nx-recent"><summary>Recently used</summary><div class="nx-recent-list">' + rec.map(t => '<a href="' + esc(t.href) + '">' + ic(t.art || 'tools', 16) + esc(t.short || t.name) + '</a>').join('') + '</div></details>' : '') + '</section>' +
    '<a class="playbook-home-feature" href="#/guidebook"><span class="playbook-home-mark" aria-hidden="true">'+['warrior','rogue','mage','archer','druid'].map(x=>classBadge(x,30)).join('')+'</span><span class="playbook-home-copy"><small class="nx-kicker">SEASON 3</small><strong>The Season 3 Playbook</strong><small>Choose a class. Build your route. Keep progressing.</small></span><span class="playbook-home-action">Open <i>›</i></span></a>' +
    (evRow || newsRow ? '<section class="nx-strips">' + evRow + newsRow + '</section>' : '') +
    '<section><div class="nx-head">' + label('Featured builds') + '<a href="#/builds">All builds</a></div>' + featuredList(3) + '</section>' +
    '<p class="nx-fine nx-support">' + esc(SUPPORT_LINE) + ' <a href="' + KOFI + '" target="_blank" rel="noopener">' + esc(SUPPORT_CTA) + '</a></p>';
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
    '<span class="nx-bcard-emblem">' + (cls ? classBadge(cls, 52) : ic('feature-build-studio', 30)) + '</span>' +
    '<span class="nx-bcard-body"><span class="nx-tags">' + (t ? '<span class="nx-btype">' + buildMark(meta.stance, 15) + esc(t.name) + '</span>' : '') +
    (cls ? '<span class="nx-tag">' + esc(cls) + '</span>' : '') + (featured ? '<span class="nx-tag nx-tag-accent">Featured</span>' : '') + '</span>' +
    '<strong>' + esc(title) + '</strong>' + (note ? '<small class="nx-note">' + esc(note) + '</small>' : '') + (summary ? '<small>' + esc(summary) + '</small>' : '') +
    '<span class="nx-by">' + [by ? 'by <b>' + esc(by) + '</b>' : '', meta?.level ? 'Level ' + meta.level : '', date].filter(Boolean).join(' · ') + '</span></span></a>';
}
const featuredPick = c => buildCard('#/builds/' + c.post.id, { title: c.post.title, summary: c.post.summary, note: c.note, by: c.author?.displayName || 'Arcana player', meta: nextCode(c.post.build) ? buildMeta(nextCode(c.post.build)) : null, featured: true });
const featuredList = (limit = 12) => { loadFeatured(); return featuredState.cards.length ? '<div class="nx-list">' + featuredState.cards.slice(0, limit).map(featuredPick).join('') + '</div>' : featuredCard(); };
const featuredCard = () => buildCard(FEATURED, { title: "Zane's Retaliation Warrior", summary: 'Endgame retaliation at ML 300+: Reflecting, Strength and Defense gems, one Increased Strength pet and three Retaliation pets.', by: 'Zane', meta: { cls: 1, stance: 'bulwark', level: 404 }, featured: true });

// A shared build always has a way back: to the guide it was opened from, or to Builds.
function buildView(query) {
  const g = featuredGuide(query.get('from') || '');
  const back = g ? '<a class="nx-back" href="#/guides/' + g.id + '">' + icon('back', 18) + esc(g.title) + '</a>'
    : '<a class="nx-back" href="#/builds" data-back>' + icon('back', 18) + 'Back</a>';
  const guideLink = !g && query.get('d') === FEATURED_GUIDES[0].build ? '<p class="nx-read"><a href="#/guides/' + FEATURED_GUIDES[0].id + '">Read the guide behind this build ›</a></p>' : '';
  return sharedView(query.get('d') || '', { back, intro: guideLink });
}

// ---------- featured guides ----------
// Same text standard as the Handbook (tables, topic links, tool links), plus a short contents list.
const guideCard = source => { const {doc:g} = editorialTranslation('guides', source); return '<a class="nx-bcard gd-card" href="#/guides/' + g.id + '" style="--bt:' + (BUILD_TYPES[g.stance]?.color || 'var(--accent)') + ';--cc:' + classVar(CLASS_NAMES[1]) + '">' +
  '<span class="nx-bcard-emblem">' + classBadge(CLASS_NAMES[1], 52) + '</span><span class="nx-bcard-body"><span class="nx-tags"><span class="nx-tag nx-tag-accent">Featured guide</span><span class="nx-tag">' + esc(g.level) + '</span></span>' +
  '<strong>' + esc(g.title) + '</strong><small>' + esc(g.summary) + '</small><span class="nx-by">by <b>' + esc(g.author) + '</b> · ' + esc(g.readTime) + ' read · updated ' + esc(shortDate(g.updated)) + '</span></span></a>'; };
const slug = t => String(t).toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function guideView(id) {
  const source = featuredGuide(id);
  const {doc:g, translated:guideTranslated} = editorialTranslation('guides', source);
  const back = '<a class="nx-back" href="#/builds/guides">' + icon('back', 18) + 'Guides</a>';
  if (!g) return back + empty('Guide not found', 'It may have moved.');
  const heads = [];
  const originalHeadings = [...hbText(source.body).matchAll(/<h2>(.*?)<\/h2>/g)].map(m => m[1]);
  const html = hbText(g.body).replace(/<h2>(.*?)<\/h2>/g, (_, t) => { const id = 'g-' + (slug(originalHeadings[heads.length] || t) || String(heads.length + 1)); head…3856 tokens truncated…>';
  const tools = '<div class="nx-guide-toolbar" role="toolbar" aria-label="Format guide text">' +
    guideButton('heading', 'Heading') + guideButton('subheading', 'Subheading') + guideButton('bold', '<b>B</b> Bold') +
    guideButton('bullets', '• List') + guideButton('steps', '1. Steps') + guideButton('note', 'Note') + '</div>';
  const linkers = '<div class="nx-guide-linkers"><label>Link Handbook topic<select data-gselect="topic"><option value="">Choose topic…</option>' +
    handbookPages().map(p => '<option value="' + esc(p.id) + '">' + esc(p.title) + '</option>').join('') + '</select></label>' +
    '<label>Link Arcana tool<select data-gselect="tool"><option value="">Choose tool…</option>' +
    GUIDE_TOOL_OPTIONS.map(t => '<option value="' + t[0] + '">' + esc(t[1]) + '</option>').join('') + '</select></label></div>';
  const builders = '<div class="nx-guide-extras">' +
    '<details><summary>Insert a table</summary><div class="nx-guide-builder">' +
    '<label>Columns<input data-g="columns" type="number" min="2" max="5" value="' + esc(G.columns) + '"></label>' +
    '<label>Rows<input data-g="rows" type="number" min="1" max="12" value="' + esc(G.rows) + '"></label>' +
    '<label class="nx-guide-wide">Table title (optional)<input data-g="caption" maxlength="90" value="' + esc(G.caption) + '" placeholder="Comparison, costs, priorities…"></label>' +
    '<button type="button" class="nx-btn" data-act="guideTable">Insert table</button></div></details>' +
    '<details><summary>Add website link</summary><div class="nx-guide-builder">' +
    '<label class="nx-guide-wide">Paste a secure URL<input data-g="url" type="url" value="' + esc(G.url) + '" placeholder="https://example.com"></label>' +
    '<button type="button" class="nx-btn" data-act="guideLink">Insert link</button></div></details></div>';
  return back + '<header class="nx-page-head"><span class="nx-kicker">COMMUNITY GUIDE</span><h1>Write a guide</h1><p>Share what works. Formatting takes a tap, no Markdown knowledge required.</p></header>' +
    '<section class="nx-tool nx-guide-form"><label class="nx-field">Title<input maxlength="110" value="' + esc(G.title) + '" data-g="title" placeholder="What will this guide teach?"></label>' +
    '<label class="nx-field">Summary<textarea rows="2" maxlength="300" data-g="summary" placeholder="Explain what players will learn in one or two sentences">' + esc(G.summary) + '</textarea></label>' +
    '<div class="nx-guide-edithead"><strong>Guide content</strong>' + writeTab + '</div>' +
    (G.preview ? '<article class="hb-page gd-body nx-guide-preview">' + (G.body.trim() ? hbText(G.body) : '<p>Start writing to see your guide here.</p>') + '</article>' :
      '<div class="nx-guide-compose"><p class="nx-fine">Select words to format them, or tap a button to insert a section.</p>' +
      tools + '<label class="nx-field" for="nxGuideBody">Your guide<textarea id="nxGuideBody" rows="13" maxlength="12000" data-g="body" placeholder="Start with the most important tip, then break the details into sections…">' + esc(G.body) + '</textarea></label>' +
      '<div class="nx-guide-counter"><span>Draft saved on this device</span><span id="nxGuideCount">' + G.body.length + ' / 12,000</span></div>' +
      linkers + builders + '</div>') +
    '<p id="nxGuideError" class="st-err" role="alert">' + esc(G.error) + '</p>' +
    '<label class="st-consent"><input type="checkbox" data-g="ok"' + (G.ok ? ' checked' : '') + '><span>Publish publicly under <b>' + esc(u.displayName) + '</b>.</span></label>' +
    '<div class="nx-guide-actions"><button type="button" class="nx-btn" data-act="guideClear">Clear draft</button>' +
    '<button class="nx-btn nx-btn-primary" data-act="publishGuide"' + (G.busy ? ' disabled' : '') + '>' + (G.busy ? 'Publishing…' : 'Publish guide') + '</button></div></section>';
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
    body = '<div class="nx-list">' + FEATURED_GUIDES.map(guideCard).join('') + '</div><a class="nx-btn nx-btn-primary" href="#/builds/new-guide">Write a guide</a>' + (g.state === 'error' ? failed('Guides', 'guides') : g.state !== 'ready' ? loading('guides')
      : g.value.length ? '<div class="nx-list">' + g.value.map(p => '<a class="nx-card" href="#/builds/' + encodeURIComponent(p.id) + '"><strong>' + esc(p.title) + '</strong><small>' + esc(p.summary || p.excerpt || '') + '</small><span class="nx-by">' + esc(shortDate(p.createdAt)) + '</span></a>').join('') + '</div>'
      : empty('No community guides yet', 'Know something other players should? Write the first one.'));
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
    const archiveNote = slug === 'hallowed-harvest-2026-guide' ? '<p class="nx-fine">Event archive · Pumpkin earning ended Nov 4 and the Pumpkin Shop closed Nov 7. The Arcstone Halloween Shop was scheduled to close Nov 14.</p>' : '';
    return '<a class="nx-back" href="#/news">' + icon('back', 18) + 'News</a><article class="nx-article"><span class="nx-kicker">' + esc((v.category || 'News').toUpperCase()) + ' · ' + esc(shortDate(v.publishedAt)) + '</span><h1>' + esc(v.title) + '</h1>' +
      (v.subtitle ? '<p class="nx-deck">' + esc(v.subtitle) + '</p>' : '') + '<p class="nx-by">by <b>' + esc(v.author || 'Arcana') + '</b></p>' + archiveNote + articleHtml(v.body, slug) + '</article>';
  }
  loadNews();
  const n = data.news;
  if (n.state === 'error') return failed('News', 'news');
  if (n.state !== 'ready') return loading('news');
  if (!n.value.length) return empty('No news yet', 'Patch notes and events show up here.');
  return '<div class="nx-list">' + n.value.map(a => '<a class="nx-card nx-story" href="' + hashFor('news', a.slug) + '"><span class="nx-kicker">' + esc(a.slug === 'hallowed-harvest-2026-guide' ? 'EVENT ARCHIVE' : (a.category || 'News').toUpperCase()) + ' · ' + esc(shortDate(a.publishedAt)) + '</span><strong>' + esc(a.teaserTitle || a.title) + '</strong>' + (a.subtitle ? '<small>' + esc(a.subtitle) + '</small>' : '') + '</a>').join('') + '</div>';
}

function directoryView() {
  const u = user();
  const ev = liveEvents()[0];
  const sec = (t, rows) => '<section>' + label(t) + '<div class="nx-list">' + rows.join('') + '</div></section>';
  return '<header class="nx-page-head nx-directory-head"><div class="nx-directory-copy"><span class="nx-kicker">ALL OF ARCANA</span><h1>Directory</h1><p>Every page in one place.</p></div>' + installDirectoryAction() + '</header>' + installDirectoryHelp() +
    sec('Tools', [artRow('#/tools', 'All tools', 'Pathfinder, pet calculators, planners', 'features/feature-tools'), ...TOOLS.filter(t => t.art).map(t => artRow(t.href, t.name, t.detail, t.art))]) +
    sec('Game reference', [artRow('#/codex', 'Handbook', 'Everything IdleArc', 'features/feature-codex')]) +
    sec('Builds and guides', [artRow('#/builds', 'Featured builds', 'Picked by Zane', 'features/feature-builds'), artRow('#/builds/community', 'Community builds', 'Shared by players', 'features/feature-community'), artRow('#/builds/guides', 'Guides', 'Written by players', 'features/feature-guides'), artRow('#/studio', 'Build Studio', 'Make your own and share it', 'features/feature-build-studio')]) +
    sec('News and events', [artRow('#/news', 'News', 'Patch notes, events and articles', 'features/feature-wiki'), ...(ev ? [artRow(ev.href, ev.name, ev.detail, 'tokens/token-ruby')] : [artRow('#/news/hallowed-harvest-2026-guide', 'Hallowed Harvest 2026', 'Past event · archived guide', 'features/feature-wiki')])]) +
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
    installBanner('profile') + languageSettingsField() + '<section>' + label('Display') + '<div class="nx-card nx-display"><div class="nx-seg" role="radiogroup" aria-label="Display">' +
      [['full', 'Full design', 'Colors, depth and art'], ['simple', 'Simplified', 'Flat, calm, fastest']].map(([k, l, dsc]) => '<button role="radio" aria-checked="' + ((read(DISPLAY_KEY) === 'simple') === (k === 'simple')) + '" aria-selected="' + ((read(DISPLAY_KEY) === 'simple') === (k === 'simple')) + '" data-act="display" data-id="' + k + '"><b>' + l + '</b><small>' + dsc + '</small></button>').join('') + '</div></div></section>' +
    '<section>' + label('Community') + '<div class="nx-list">' + row('#/guilds', 'Guilds', 'Find a guild and apply', '') + row('#/lfg', 'Looking for group', 'Raids, teams and planned runs', '') + row('#/records', 'Season records', 'Top players and guilds by season', '') + row('/classic#/community', 'Community posts', '', '', true) + '</div></section>' +
    '<section>' + label('More') + '<div class="nx-list">' + row(KOFI, 'Support Arcana', 'Arcana is free and fan-made. Help keep it running on Ko-fi', '', true) + row('#/feedback', 'Report a problem', 'Bugs, wrong data, ideas', '') + row('/classic', 'Classic Arcana', 'The current site, unchanged', '', true) + (u ? '<button type="button" class="nx-row nx-signout" data-act="logout"' + (logoutBusy ? ' disabled' : '') + '><span class="nx-row-text"><strong>' + (logoutBusy ? 'Signing out…' : 'Sign out') + '</strong><small>Switch to another account</small></span><span class="nx-row-end">' + icon('next', 18) + '</span></button>' + (logoutError ? '<p class="nx-signout-error" role="alert">' + esc(logoutError) + '</p>' : '') : '') + '</div></section>';
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
const TITLES = { guidebook:'The Season 3 Playbook', handbook: 'Handbook', directory: 'Directory', lfg: 'LFG', records: 'Records', guilds: 'Guilds', checklist: 'Checklist', feedback: 'Feedback', admin: 'Admin', tools: 'Tools', codex: 'Handbook', builds: 'Builds', news: 'News', profile: 'Profile', studio: 'Build Studio', build: 'Shared build' };
function render() {
  const { section, id, query } = parseHash(location.hash);
  if (section === 'codex' && !id && query.get('kind')) { codexKind = query.get('kind'); codexQuery = ''; history.replaceState(null, '', '#/codex'); }
  noteVisit(section, id);
  if (section !== 'feedback' && section !== 'profile') notePage(location.hash);
  loadMe(); loadNotice();
  const tab = activeTab(section);
  const view = section === 'guidebook' ? (id === 'manage' ? adminGuidebookTab() : id.startsWith('edit/') ? guidebookEditorView(id.slice(5)) : id.startsWith('new/') ? guidebookEditorView(id.slice(4), true) : guidebookView(id)) : section === 'guides' ? guideView(id) : section === 'handbook' ? (id.startsWith('edit/') ? editorView(id.slice(5)) : id.startsWith('new/') ? editorView(id.slice(4), true) : handbookView(id)) : section === 'directory' ? directoryView() : section === 'lfg' ? lfgView() : section === 'records' ? recordsView() : section === 'guilds' ? guildsView(id, data.me.value) : section === 'checklist' ? checklistView(id) : section === 'feedback' ? feedbackView() : section === 'admin' ? (id === 'design' ? designView(user()) : adminView(user())) : section === 'studio' ? studioView(id) : section === 'build' ? buildView(query) : section === 'tools' ? toolsView(id, query) : section === 'codex' ? codexView(id) : section === 'builds' ? buildsView(id)
    : section === 'news' ? newsView(id) : section === 'profile' ? profileView() : homeView();
  // The original triangle, recolored to the site accent the same way the classic theme designer did it.
  const logo = '<img class="nx-logo" src="/assets/arcana-logo.webp" width="38" height="32" alt="">';
  const title = section === 'home' ? '<a class="nx-brand" href="#/home" aria-label="Arcana home">' + logo + '<span>ARCANA</span></a>'
    : '<a class="nx-brand nx-brand-sm" href="#/home" aria-label="Arcana home">' + logo + '</a><span class="nx-title">' + esc(TITLES[section]) + '</span>';
  $('nxTopL').innerHTML = title;
  $('nxTopR').innerHTML = languageControl() +
    (user() ? '<a class="nx-avatar" href="#/profile" aria-label="Profile"' + (section === 'profile' ? ' aria-current="page"' : '') + '>' + esc(initial()) + '</a>'
      : data.me.state === 'ready' ? '<a class="nx-signin-pill" href="#/profile">Sign in</a>' : '');
  $('nxNav').innerHTML = TABS.map(t => '<a href="' + (t.href || hashFor(t.id)) + '"' + (t.id === 'search' ? ' class="nx-nav-search"' : '') + (t.id === tab ? ' aria-current="page"' : '') + '>' + (t.id === 'search' ? '<i>' + ic('search', 24) + '</i>' : ic(t.id === 'tools' ? 'tools' : t.id, 22)) + '<span>' + t.label + '</span></a>').join('');
  document.body.dataset.section = section;
  $('nxNotice').hidden = !data.notice.value;
  $('nxNotice').textContent = data.notice.value || '';
  const main = $('nxMain'), key = section + '/' + id;
  const focusSearch = document.activeElement?.id === 'nxCodexQ';
  main.innerHTML = view + handbookPopup();
  if (main.dataset.key !== key) { main.dataset.key = key; window.scrollTo(0, 0); }
  if (section === 'studio') studioAfterRender();
  if (focusSearch) { const q = $('nxCodexQ'); q?.focus(); q?.setSelectionRange(q.value.length, q.value.length); }
  document.title = (section === 'home' ? 'Arcana' : translateEnglish(TITLES[section] || 'Arcana', getLocale()) + ' · Arcana');
  translateTree(document.body);
}

document.addEventListener('change', e => { if (e.target.dataset?.g === 'ok') G.ok = e.target.checked; });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'logout') { signOut(); return; }
  if (act === 'install') {
    if (installEvt) {
      const pending = installEvt;
      installEvt = null; // beforeinstallprompt is one-use only
      try {
        pending.prompt();
        Promise.resolve(pending.userChoice).then(choice => {
          if (choice?.outcome === 'accepted') rememberInstall();
        }).catch(() => {}).finally(() => render());
      } catch {
        installHelpOpen = true;
        render();
      }
    } else {
      installHelpOpen = true;
      render();
    }
  }
  if (act === 'installhelpclose') { installHelpOpen = false; render(); }
  if (act === 'installhide') { write(INSTALL_HIDE, '1'); render(); }
  if (act === 'display') { write(DISPLAY_KEY, b.dataset.id); applyTheme(); render(); }
  if (act === 'surface') { saveTheme(null); write(SURFACE_KEY, b.dataset.id); render(); }
  if (act === 'accent') { saveTheme(null); write(ACCENT_KEY, b.dataset.id); render(); }
  if (act === 'buildtab') { buildTab = b.dataset.tab; render(); }
  if (act === 'kind') { codexKind = b.dataset.kind; codexQuery = ''; render(); }
  if (act === 'guideMode') { G.preview = b.dataset.mode === 'preview'; G.error = ''; render(); return; }
  if (act === 'guideFormat') { guideApply(b.dataset.format); return; }
  if (act === 'guideTable') { guideApply('table', { columns: G.columns, rows: G.rows, caption: G.caption }); return; }
  if (act === 'guideLink') { guideApply('link', { href: G.url }); return; }
  if (act === 'guideClear') {
    if (!confirm('Delete this unfinished guide from this device?')) return;
    Object.assign(G, { title: '', summary: '', body: '', ok: false, preview: false, error: '' });
    saveGuideDraft(); render(); return;
  }
  if (act === 'publishGuide') {
    const t = G.title.trim(), su = G.summary.trim(), bo = G.body.trim();
    G.error = t.length < 6 ? 'Give it a title of at least 6 characters.' : su.length < 20 ? 'Add a summary of at least 20 characters.' : bo.length < 80 ? 'The guide needs at least 80 characters.' : !G.ok ? 'Tick the box to agree to publishing under your name.' : '';
    if (G.error) return render();
    G.busy = true; render();
    fetch('/api/community/posts', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'guide', title: t, summary: su, body: bo }) })
      .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(r.status === 429 ? 'You’ve hit today’s publishing limit (10).' : j.error || 'Couldn’t publish.'); Object.assign(G, { title: '', summary: '', body: '', ok: false, preview: false }); saveGuideDraft(); data.guides.state = 'idle'; location.hash = '#/builds/' + j.post.id; })
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
  if (gk) {
    G[gk] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (['title', 'summary', 'body'].includes(gk)) saveGuideDraft();
    if (gk === 'body') { const count = $('nxGuideCount'); if (count) count.textContent = G.body.length + ' / 12,000'; }
    return;
  }
  if (e.target.id !== 'nxCodexQ') return;
  codexQuery = e.target.value;
  const body = $('nxCodexBody');
  if (body && data.codex.state === 'ready') { body.innerHTML = codexResults(data.codex.value); translateTree(body); }
});
document.addEventListener('change', e => {
  const kind = e.target.dataset?.gselect;
  if (!kind || !e.target.value) return;
  const id = e.target.value;
  e.target.value = '';
  if (kind === 'tool') guideApply('tool', { id });
  if (kind === 'topic') {
    const topic = handbookPages().find(p => p.id === id);
    if (topic) guideApply('topic', { id, label: topic.title });
  }
});
window.addEventListener('hashchange', render);
initLocalization(render);
initEditorialLocalization(render);
initStudio(render);
initTools(render);
// A generic Back goes to the previous page when there is one in this tab.
document.addEventListener('click', e => { const a = e.target.closest('[data-back]'); if (!a || history.length < 2 || !document.referrer.startsWith(location.origin)) return; e.preventDefault(); history.back(); });
// "In this guide" links scroll within the page instead of changing the route.
document.addEventListener('click', e => { const a = e.target.closest('[data-jump]'); if (!a) return; e.preventDefault(); document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
initRetaliation(render);
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
initHandbook(render, () => data.me.value?.user || null);
initHandbookEditor(render);
initGuidebook(render,()=>data.me.value?.user||null);
initGuidebookEditor(render);
window.addEventListener('arcana:news-changed', () => { data.news.state = 'idle'; data.article = {}; });
window.addEventListener('arcana:featured-changed', () => { featuredState.state = 'idle'; data.builds.state = 'idle'; });
// Boot: hold the loading screen until the published design, fonts and account are in (2.5 s at most),
// so the site never changes its look in front of the player.
applyTheme();
(async () => {
  const cap = new Promise(r => setTimeout(r, 2500));
  const design = getJSON('/api/site/theme', 2500).then(j => { const d = safeNextDesign(j.next); if (d) siteDesign = d; data.notice.value = j.notice?.enabled && j.notice.text ? j.notice.text : null; data.notice.state = 'ready'; }).catch(() => {});
  const me = getJSON('/api/account/me', 2500).then(j => { data.me.value = j; data.me.state = 'ready'; }).catch(() => {});
  await Promise.race([Promise.all([design, me]), cap]);
  applyTheme();
  await Promise.race([document.fonts?.ready || Promise.resolve(), new Promise(r => setTimeout(r, 800))]);
  render();
  requestAnimationFrame(() => document.getElementById('nxSplash')?.classList.add('done'));
})();
