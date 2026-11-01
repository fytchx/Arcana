// Admin for Arcana Next: Inbox (community builds), Featured picks, Site announcement.
// Every action goes through the existing server endpoints and their permission checks.
import { esc, shortDate, articleHtml } from './core.js';
import { AWARD_LABELS, ROLE_NAMES } from '../src/account-policy.js';
import { reportsTab } from './feedback.js';

let rerender = () => {};
const A = { news: { state: 'idle', revision: 0, list: [], edit: null, preview: false }, people: { state: 'idle', page: 1, pages: 1, total: 0, list: [], q: '', sel: null }, traffic: { state: 'idle', d: null }, tab: 'inbox', posts: { state: 'idle', list: [] }, feat: { state: 'idle', revision: 0, items: [], dirty: false }, site: { state: 'idle', revision: 0, notice: { enabled: false, text: '' } }, busy: false, toast: '' };
async function api(url, opts = {}) {
  const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(12000), ...opts, headers: { 'content-type': 'application/json', ...(opts.headers || {}) } });
  let j = {}; try { j = await r.json(); } catch { /* empty */ }
  if (!r.ok) throw Object.assign(Error(j.error || 'Request failed (' + r.status + ').'), { status: r.status });
  return j;
}
let tt;
const toast = m => { A.toast = m; clearTimeout(tt); tt = setTimeout(() => { A.toast = ''; rerender(); }, 2600); rerender(); };
function loadPosts(force) {
  if (!force && A.posts.state !== 'idle') return;
  A.posts.state = 'loading';
  api('/api/community/posts?kind=build&includeHidden=true').then(j => { A.posts.list = j.posts || []; A.posts.state = 'ready'; }).catch(() => { A.posts.state = 'error'; }).finally(rerender);
}
function loadFeatured(force) {
  if (!force && A.feat.state !== 'idle') return;
  A.feat.state = 'loading';
  api('/api/featured').then(j => { A.feat.revision = j.revision; A.feat.items = j.items || []; A.feat.dirty = false; A.feat.state = 'ready'; }).catch(() => { A.feat.state = 'error'; }).finally(rerender);
}
function loadSite(force) {
  if (!force && A.site.state !== 'idle') return;
  A.site.state = 'loading';
  api('/api/admin/site').then(j => { A.site.revision = j.revision; A.site.notice = j.notice || { enabled: false, text: '' }; A.site.state = 'ready'; }).catch(e => { A.site.state = e.status === 401 || e.status === 403 ? 'denied' : 'error'; }).finally(rerender);
}

// ---------- News (same endpoint and rules as Journal Studio) ----------
const CATS = ['News', 'Meta & Balance', 'Opinion', 'Guides & Strategy', 'Community', 'Development'];
function loadNews(force) {
  if (!force && A.news.state !== 'idle') return;
  A.news.state = 'loading';
  api('/api/journal/admin').then(j => { A.news.revision = j.revision; A.news.list = (j.articles || []).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))); A.news.state = 'ready'; })
    .catch(e => { A.news.state = e.status === 403 || e.status === 401 ? 'denied' : 'error'; }).finally(rerender);
}
const slugify = t => String(t || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
function newsTab() {
  loadNews();
  if (A.news.state === 'denied') return '<div class="nx-empty"><strong>Admins only</strong></div>';
  if (A.news.state === 'error') return '<div class="nx-empty"><strong>Couldn’t load articles</strong>' + btn('reload', 'Try again') + '</div>';
  if (A.news.state !== 'ready') return '<div class="nx-loading">Loading articles…</div>';
  const e = A.news.edit;
  if (!e) return btn('newArticle', '+ New article', '', 'nx-btn nx-btn-primary') + '<div class="nx-list">' + A.news.list.map((a, i) =>
    '<button class="nx-row adm-row" data-adm="editArticle" data-i="' + i + '"><span class="nx-row-text"><strong>' + esc(a.title) + '</strong><small>' + esc([a.published ? 'Published' : 'Draft', a.category, a.featured ? 'Featured' : '', shortDate(a.updatedAt)].filter(Boolean).join(' · ')) + '</small></span><span class="nx-row-end">›</span></button>').join('') + '</div>';
  const f = (k, l, max, ph = '') => '<label class="nx-field">' + l + '<input maxlength="' + max + '" value="' + esc(e[k] || '') + '" data-art="' + k + '" placeholder="' + esc(ph) + '"></label>';
  return '<div class="st-two">' + btn('closeArticle', '‹ All articles') + btn('previewArticle', A.news.preview ? 'Edit' : 'Preview') + '</div>' +
    (A.news.preview ? '<article class="nx-article adm-preview"><span class="nx-kicker">' + esc((e.category || '').toUpperCase()) + '</span><h1>' + esc(e.title || 'Untitled') + '</h1><p class="nx-deck">' + esc(e.subtitle || '') + '</p>' + articleHtml(e.body || '', e.slug) + '</article>'
      : '<section class="nx-tool">' + f('title', 'Title', 130, 'What happened, in one line') + f('subtitle', 'Subtitle', 340, 'One sentence under the title') +
        '<div class="st-two"><label class="nx-field">Category<select data-art="category">' + CATS.map(c => '<option' + (c === e.category ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select></label>' +
        '<label class="nx-field">Link name<input maxlength="90" value="' + esc(e.slug || '') + '" data-art="slug" placeholder="made-from-title"' + (e.existing ? ' readonly' : '') + '></label></div>' +
        f('coverUrl', 'Cover image <small>optional, https link</small>', 500, 'https://…') +
        '<label class="nx-field">Article<textarea rows="14" maxlength="35000" data-art="body" placeholder="Blank line between paragraphs. ## for a heading, - for a list, **bold**.">' + esc(e.body || '') + '</textarea></label>' +
        '<label class="st-consent"><input type="checkbox" data-art="featured"' + (e.featured ? ' checked' : '') + '><span>Pin to the top of News</span></label></section>') +
    '<div class="st-two">' + btn('saveArticle', 'Save draft', 'data-pub="0"') + btn('saveArticle', e.published ? 'Update published' : 'Publish', 'data-pub="1"', 'nx-btn nx-btn-primary') + '</div>' +
    '<p class="nx-fine">Same rules as Journal Studio: plain text with ## headings, - lists and **bold**. Articles post as Zane.</p>';
}
async function saveArticle(publish) {
  const e = A.news.edit;
  const article = { slug: e.slug || slugify(e.title), title: e.title || '', subtitle: e.subtitle || '', category: e.category || 'News', coverUrl: e.coverUrl || '', body: e.body || '', featured: !!e.featured, published: publish };
  A.busy = true; rerender();
  try {
    const j = await api('/api/journal/admin', { method: 'PUT', body: JSON.stringify({ expectedRevision: A.news.revision, article }) });
    A.news.revision = j.revision; A.news.edit = { ...j.article, existing: true };
    const i = A.news.list.findIndex(x => x.slug === j.article.slug);
    if (i >= 0) A.news.list[i] = j.article; else A.news.list.unshift(j.article);
    window.dispatchEvent(new Event('arcana:news-changed'));
    toast(publish ? 'Published to News.' : 'Draft saved.');
  } catch (err) { toast(err.status === 409 ? 'Someone updated News. Reload, then save again.' : err.message); }
  finally { A.busy = false; rerender(); }
}

// ---------- People (members, roles, awards) ----------
function loadPeople(force) {
  if (!force && A.people.state !== 'idle') return;
  A.people.state = 'loading';
  api('/api/admin/members?page=' + A.people.page).then(j => { Object.assign(A.people, { list: j.members || [], total: j.total, pages: j.pages, state: 'ready' }); })
    .catch(e => { A.people.state = e.status === 403 || e.status === 401 ? 'denied' : 'error'; }).finally(rerender);
}
function peopleTab(me) {
  loadPeople();
  const P = A.people;
  if (P.state === 'denied') return '<div class="nx-empty"><strong>Needs role management access</strong></div>';
  if (P.state === 'error') return '<div class="nx-empty"><strong>Couldn’t load members</strong>' + btn('reload', 'Try again') + '</div>';
  if (P.state !== 'ready') return '<div class="nx-loading">Loading members…</div>';
  const sel = P.list.find(u => u.id === P.sel);
  if (sel) {
    const has = new Set((sel.roles || []).map(r => r.id || r)), aw = new Set((sel.awards || []).map(a => a.id || a));
    const roles = ['wiki-editor', 'moderator', ...(me?.isOwner ? ['admin', 'developer'] : [])];
    return btn('closeMember', '‹ All members') + '<section class="nx-tool"><strong class="adm-name">' + esc(sel.displayName) + '</strong><small class="nx-fine">' + esc([sel.inGameName, sel.guild, 'joined ' + shortDate(sel.joinedAt)].filter(Boolean).join(' · ')) + '</small>' +
      (has.has('creator') ? '<p class="nx-callout">The Creator’s roles can’t be changed.</p>' :
      '<h3 class="st-h3">Roles</h3><div class="st-wrapchips">' + roles.map(r => '<button aria-pressed="' + has.has(r) + '" data-adm="toggleRole" data-v="' + r + '">' + esc(ROLE_NAMES[r] || r) + '</button>').join('') + '</div>' +
      '<h3 class="st-h3">Awards</h3><div class="st-wrapchips">' + Object.entries(AWARD_LABELS).map(([id, l]) => '<button aria-pressed="' + aw.has(id) + '" data-adm="toggleAward" data-v="' + id + '">' + esc(l) + '</button>').join('') + '</div>' +
      btn('saveMember', 'Save roles and awards', '', 'nx-btn nx-btn-primary')) + '</section>' +
      (me?.isOwner ? '' : '<p class="nx-fine">Only the Creator can grant Admin or Developer.</p>');
  }
  const q = P.q.trim().toLowerCase(), list = P.list.filter(u => !q || [u.displayName, u.inGameName, u.guild, u.id].some(v => String(v || '').toLowerCase().includes(q)));
  return '<label class="nx-search nx-search-input"><input type="search" placeholder="Name, guild or account ID (this page)" value="' + esc(P.q) + '" data-adm-q aria-label="Search members"></label>' +
    '<p class="nx-fine">' + P.total.toLocaleString('en-US') + ' accounts · page ' + P.page + ' of ' + P.pages + '</p>' +
    '<div class="nx-list">' + list.map(u => '<button class="nx-row adm-row" data-adm="member" data-id="' + esc(u.id) + '"><span class="nx-row-text"><strong>' + esc(u.displayName) + '</strong><small>' + esc([(u.roles || []).map(r => r.label || ROLE_NAMES[r.id || r] || r).filter(x => x !== 'Arcana Member').join(', '), u.inGameName, u.guild].filter(Boolean).join(' · ') || 'Member') + '</small></span><span class="nx-row-end">›</span></button>').join('') + '</div>' +
    '<div class="st-two">' + btn('page', '‹ Previous', 'data-v="-1"' + (P.page < 2 ? ' disabled' : '')) + btn('page', 'Next ›', 'data-v="1"' + (P.page >= P.pages ? ' disabled' : '')) + '</div>';
}

// ---------- Traffic ----------
function loadTraffic(force) {
  if (!force && A.traffic.state !== 'idle') return;
  A.traffic.state = 'loading';
  api('/api/admin/traffic').then(d => { A.traffic.d = d; A.traffic.state = 'ready'; }).catch(e => { A.traffic.state = e.status === 403 || e.status === 401 ? 'denied' : 'error'; }).finally(rerender);
}
function trafficTab() {
  loadTraffic();
  const T = A.traffic, n = v => Math.max(0, Number(v) || 0).toLocaleString('en-US');
  if (T.state === 'denied') return '<div class="nx-empty"><strong>Needs analytics access</strong></div>';
  if (T.state === 'error') return '<div class="nx-empty"><strong>Traffic stats unavailable</strong><p>The stats service may be starting up.</p>' + btn('reload', 'Try again') + '</div>';
  if (T.state !== 'ready') return '<div class="nx-loading">Loading traffic…</div>';
  const d = T.d, days = (d.days || []).slice(-14), hi = Math.max(1, ...days.map(x => x.views || 0));
  const m = (l, v, s) => '<div><dt>' + l + '</dt><dd>' + n(v) + '</dd><small>' + s + '</small></div>';
  return '<dl class="nx-facts adm-metrics">' + m('Active now', d.activeSessions, 'last 5 minutes') + m('Visits today', d.today?.sessions, n(d.today?.views) + ' views') + m('Last 7 days', d.last7?.views, n(d.last7?.sessions) + ' visits') + m('Last 30 days', d.last30?.views, n(d.last30?.sessions) + ' visits') + '</dl>' +
    '<section><h2 class="nx-label">Views · last 14 days</h2><div class="adm-bars" role="img" aria-label="Daily views for the last 14 days">' + days.map(x => '<span title="' + esc(x.date + ': ' + n(x.views) + ' views') + '" style="height:' + Math.max(3, Math.round((x.views || 0) / hi * 100)) + '%"></span>').join('') + '</div></section>' +
    '<section><h2 class="nx-label">Most visited</h2><div class="nx-tablewrap"><table class="nx-table"><tbody>' + (d.topPages || []).slice(0, 10).map((p, i) => '<tr><th scope="row">' + (i + 1) + '. ' + esc(p.route) + '</th><td>' + n(p.views) + '</td></tr>').join('') + '</tbody></table></div></section>' +
    '<p class="nx-fine">Visits are approximate browser sessions, not people. No IP addresses or account IDs are stored.</p>' + btn('reload', 'Refresh');
}

const title = id => A.posts.list.find(p => p.id === id)?.title || 'Community build';
const isFeatured = id => A.feat.items.some(x => x.postId === id);
const btn = (act, text, data = '', cls = 'nx-btn') => '<button class="' + cls + '" data-adm="' + act + '" ' + data + (A.busy ? ' disabled' : '') + '>' + text + '</button>';

function inbox() {
  loadPosts(); loadFeatured();
  if (A.posts.state === 'error') return '<div class="nx-empty"><strong>Couldn’t load community builds</strong>' + btn('reload', 'Try again') + '</div>';
  if (A.posts.state !== 'ready') return '<div class="nx-loading">Loading community builds…</div>';
  if (!A.posts.list.length) return '<div class="nx-empty"><strong>No community builds yet</strong><p>Published builds show up here, newest first.</p></div>';
  return '<div class="nx-list">' + A.posts.list.map(p => {
    const hidden = p.status === 'hidden', feat = isFeatured(p.id);
    return '<div class="nx-card adm-post' + (hidden ? ' hidden' : '') + '"><span class="nx-tags">' + (hidden ? '<span class="nx-tag adm-red">Hidden</span>' : '') + (feat ? '<span class="nx-tag nx-tag-accent">Featured</span>' : '') + '<span class="nx-tag">' + esc(shortDate(p.createdAt)) + '</span></span>' +
      '<a href="#/builds/' + esc(p.id) + '"><strong>' + esc(p.title) + '</strong></a><small>' + esc(p.summary || p.excerpt || '') + '</small>' +
      '<div class="st-two">' + (feat ? btn('unfeature', 'Unfeature', 'data-id="' + esc(p.id) + '"') : btn('feature', 'Feature', 'data-id="' + esc(p.id) + '"' + (hidden ? ' disabled' : ''), 'nx-btn nx-btn-primary')) +
      btn(hidden ? 'unhide' : 'hide', hidden ? 'Unhide' : 'Hide', 'data-id="' + esc(p.id) + '"') + '</div></div>';
  }).join('') + '</div>';
}
function featured() {
  loadFeatured(); loadPosts();
  if (A.feat.state === 'error') return '<div class="nx-empty"><strong>Couldn’t load Featured</strong>' + btn('reload', 'Try again') + '</div>';
  if (A.feat.state !== 'ready') return '<div class="nx-loading">Loading…</div>';
  const items = A.feat.items;
  return (items.length ? '<div class="nx-list">' + items.map((x, i) => '<div class="nx-card adm-feat"><div class="adm-feathead"><b>' + (i + 1) + '. ' + esc(title(x.postId)) + '</b><span>' +
      btn('up', '↑', 'data-i="' + i + '" aria-label="Move up"' + (i === 0 ? ' disabled' : ''), 'adm-mini') + btn('down', '↓', 'data-i="' + i + '" aria-label="Move down"' + (i === items.length - 1 ? ' disabled' : ''), 'adm-mini') + btn('remove', '✕', 'data-i="' + i + '" aria-label="Remove"', 'adm-mini') + '</span></div>' +
      '<label class="nx-field">Note <small>optional, shown on the card</small><input maxlength="140" value="' + esc(x.note) + '" data-adm-note="' + i + '" placeholder="e.g. Best starter for Warriors"></label></div>').join('') + '</div>'
    : '<div class="nx-empty"><strong>Nothing featured yet</strong><p>Feature builds from the Inbox. Until then, Home shows your Retaliation Warrior.</p></div>') +
    '<div class="st-two">' + btn('saveFeat', A.feat.dirty ? 'Save Featured' : 'Saved', A.feat.dirty ? '' : 'disabled', 'nx-btn nx-btn-primary') + btn('reload', 'Reload') + '</div>' +
    '<p class="nx-fine">Up to 12. Hidden or deleted builds drop off the public list on their own.</p>';
}
function site() {
  loadSite();
  if (A.site.state === 'denied') return '<div class="nx-empty"><strong>Admins only</strong><p>Sign in with an admin account.</p></div>';
  if (A.site.state === 'error') return '<div class="nx-empty"><strong>Couldn’t load site settings</strong>' + btn('reload', 'Try again') + '</div>';
  if (A.site.state !== 'ready') return '<div class="nx-loading">Loading…</div>';
  const n = A.site.notice;
  return '<section class="nx-tool"><label class="nx-field">Announcement bar <small>up to 180 characters, plain text</small><textarea id="admNotice" rows="3" maxlength="180" placeholder="e.g. Hallowed Harvest ends Nov 4">' + esc(n.text) + '</textarea></label>' +
    '<label class="st-consent"><input type="checkbox" id="admNoticeOn"' + (n.enabled ? ' checked' : '') + '><span>Show it at the top of every page</span></label>' +
    btn('saveNotice', 'Publish announcement', '', 'nx-btn nx-btn-primary') + '</section><p class="nx-fine">Shows on the classic site and Arcana Next. Every publish is saved; roll back from the classic admin.</p>';
}
function more() {
  const r = (h, t, d) => '<a class="nx-row" href="' + h + '"><span class="nx-row-text"><strong>' + t + '</strong><small>' + d + ' · classic admin</small></span><span class="nx-row-end">↗</span></a>';
  return '<section><h2 class="nx-label">Classic tools</h2><div class="nx-list">' + r('/#/admin?tab=appearance', 'Theme and history', 'Default theme and rollback') + r('/#/wiki/studio', 'Wiki Studio', 'Classic wiki articles') + '</div></section>';
}

export function adminView(user) {
  if (!user?.permissions?.manageSite) return '<div class="nx-empty"><strong>Admins only</strong><p>This page is for Arcana admins.</p><a class="nx-btn" href="#/profile">Back to Profile</a></div>';
  const tabs = [['inbox', 'Inbox'], ['featured', 'Featured'], ['reports', 'Reports'], ['news', 'News'], ['people', 'People'], ['traffic', 'Traffic'], ['site', 'Site']];
  const body = A.tab === 'featured' ? featured() : A.tab === 'site' ? site() + more() : A.tab === 'news' ? newsTab() : A.tab === 'people' ? peopleTab(user) : A.tab === 'traffic' ? trafficTab() : A.tab === 'reports' ? reportsTab() : inbox();
  return '<a class="nx-back" href="#/profile">‹ Profile</a><header class="nx-page-head"><span class="nx-kicker">OWNER</span><h1>Admin</h1></header>' +
    '<div class="st-tabs adm-tabs nx-scrollx" role="tablist">' + tabs.map(([id, l]) => '<button role="tab" aria-selected="' + (A.tab === id) + '" data-adm="tab" data-v="' + id + '">' + l + (id === 'featured' && A.feat.dirty ? ' •' : '') + '</button>').join('') + '</div>' +
    body + (A.toast ? '<div class="st-toast" role="status">' + esc(A.toast) + '</div>' : '');
}

async function saveFeatured() {
  A.busy = true; rerender();
  try {
    const j = await api('/api/admin/featured', { method: 'PUT', body: JSON.stringify({ expectedRevision: A.feat.revision, items: A.feat.items }) });
    A.feat.revision = j.revision; A.feat.items = j.items; A.feat.dirty = false; window.dispatchEvent(new Event('arcana:featured-changed')); toast('Featured saved.');
  } catch (e) { toast(e.status === 409 ? 'Featured changed somewhere else. Reload, then save again.' : e.message); }
  finally { A.busy = false; rerender(); }
}
async function setVisibility(id, status) {
  A.busy = true; rerender();
  try {
    await api('/api/community/posts/' + id + '/visibility', { method: 'PATCH', body: JSON.stringify({ status, reason: status === 'hidden' ? 'Hidden from Arcana Next admin' : '' }) });
    const p = A.posts.list.find(x => x.id === id); if (p) p.status = status;
    window.dispatchEvent(new Event('arcana:featured-changed'));
    toast(status === 'hidden' ? 'Hidden from the public.' : 'Visible again.');
  } catch (e) { toast(e.message); } finally { A.busy = false; rerender(); }
}
export function initAdmin(render) {
  rerender = render;
  document.addEventListener('change', e => { const k = e.target.dataset?.art; if (k && A.news.edit && (e.target.tagName === 'SELECT' || e.target.type === 'checkbox')) A.news.edit[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-adm]');
    if (!b || b.disabled) return;
    const a = b.dataset.adm, id = b.dataset.id, i = +b.dataset.i, items = A.feat.items;
    if (a === 'tab') { A.tab = b.dataset.v; return rerender(); }
    if (a === 'reload') { A.posts.state = A.feat.state = A.site.state = A.news.state = A.people.state = A.traffic.state = 'idle'; return rerender(); }
    if (a === 'feature') { if (items.length >= 12) return toast('Feature at most 12 builds.'); A.feat.items = [...items, { postId: id, note: '' }]; A.feat.dirty = true; return saveFeatured(); }
    if (a === 'unfeature') { A.feat.items = items.filter(x => x.postId !== id); A.feat.dirty = true; return saveFeatured(); }
    if (a === 'hide' || a === 'unhide') return setVisibility(id, a === 'hide' ? 'hidden' : 'public');
    if (a === 'up' || a === 'down') { const j = a === 'up' ? i - 1 : i + 1, n = [...items];[n[i], n[j]] = [n[j], n[i]]; A.feat.items = n; A.feat.dirty = true; return rerender(); }
    if (a === 'remove') { A.feat.items = items.filter((_, k) => k !== i); A.feat.dirty = true; return rerender(); }
    if (a === 'saveFeat') return saveFeatured();
    if (a === 'newArticle') { A.news.edit = { category: 'News', published: false }; A.news.preview = false; return rerender(); }
    if (a === 'editArticle') { A.news.edit = { ...A.news.list[i], existing: true }; A.news.preview = false; return rerender(); }
    if (a === 'closeArticle') { A.news.edit = null; return rerender(); }
    if (a === 'previewArticle') { A.news.preview = !A.news.preview; return rerender(); }
    if (a === 'saveArticle') {
      const e2 = A.news.edit;
      if (!e2.title || !e2.subtitle || !e2.body) return toast('Add a title, subtitle and article text first.');
      if (!e2.slug) e2.slug = slugify(e2.title);
      return saveArticle(b.dataset.pub === '1');
    }
    if (a === 'member') { A.people.sel = id; const u = A.people.list.find(x => x.id === id); A.people.draft = { roles: (u.roles || []).map(r => r.id || r).filter(r => ['wiki-editor', 'moderator', 'admin', 'developer'].includes(r)), awards: (u.awards || []).map(x => x.id || x) }; return rerender(); }
    if (a === 'closeMember') { A.people.sel = null; return rerender(); }
    if (a === 'toggleRole' || a === 'toggleAward') {
      const k = a === 'toggleRole' ? 'roles' : 'awards', d = A.people.draft, v = b.dataset.v;
      d[k] = d[k].includes(v) ? d[k].filter(x => x !== v) : [...d[k], v];
      const u = A.people.list.find(x => x.id === A.people.sel);
      u[k] = k === 'roles' ? [...(u.roles || []).filter(r => !['wiki-editor', 'moderator', 'admin', 'developer'].includes(r.id || r)), ...d.roles.map(id => ({ id }))] : d.awards.map(id => ({ id }));
      return rerender();
    }
    if (a === 'saveMember') {
      const u = A.people.list.find(x => x.id === A.people.sel), d = A.people.draft;
      A.busy = true; rerender();
      api('/api/admin/roles/' + encodeURIComponent(u.id), { method: 'PATCH', body: JSON.stringify({ roles: d.roles, awards: d.awards }) })
        .then(j => { u.roles = j.profile.roles; u.awards = j.profile.awards; toast('Saved for ' + u.displayName + '.'); })
        .catch(err => toast(err.message)).finally(() => { A.busy = false; rerender(); });
      return;
    }
    if (a === 'page') { A.people.page = Math.max(1, Math.min(A.people.pages, A.people.page + +b.dataset.v)); A.people.state = 'idle'; A.people.sel = null; return rerender(); }
    if (a === 'saveNotice') {
      const text = (document.getElementById('admNotice')?.value || '').trim(), enabled = !!document.getElementById('admNoticeOn')?.checked;
      A.busy = true; rerender();
      api('/api/admin/site', { method: 'PUT', body: JSON.stringify({ section: 'notice', expectedRevision: A.site.revision, notice: { text, enabled } }) })
        .then(j => { A.site.revision = j.revision; A.site.notice = j.notice; toast(j.notice.enabled ? 'Announcement published.' : 'Announcement saved and hidden.'); })
        .catch(e => toast(e.status === 409 ? 'Site settings changed elsewhere. Reload first.' : e.message))
        .finally(() => { A.busy = false; rerender(); });
    }
  });
  document.addEventListener('input', e => {
    const k = e.target.dataset?.art;
    if (k && A.news.edit) { A.news.edit[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; if (k === 'title' && !A.news.edit.existing) { A.news.edit.slug = slugify(e.target.value); const sl = document.querySelector('[data-art=slug]'); if (sl) sl.value = A.news.edit.slug; } return; }
    if (e.target.dataset?.admQ !== undefined) { A.people.q = e.target.value; const pos = e.target.selectionStart; rerender(); const q = document.querySelector('[data-adm-q]'); if (q) { q.focus(); q.setSelectionRange(pos, pos); } return; }
    const i = e.target.dataset?.admNote;
    if (i === undefined) return;
    A.feat.items = A.feat.items.map((x, k) => k === +i ? { ...x, note: e.target.value.slice(0, 140) } : x);
    if (!A.feat.dirty) { A.feat.dirty = true; const s = document.querySelector('[data-adm=saveFeat]'); if (s) { s.disabled = false; s.textContent = 'Save Featured'; } }
  });
}
