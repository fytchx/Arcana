// Admin for Arcana Next: Inbox (community builds), Featured picks, Site announcement.
// Every action goes through the existing server endpoints and their permission checks.
import { esc, shortDate } from './core.js';

let rerender = () => {};
const A = { tab: 'inbox', posts: { state: 'idle', list: [] }, feat: { state: 'idle', revision: 0, items: [], dirty: false }, site: { state: 'idle', revision: 0, notice: { enabled: false, text: '' } }, busy: false, toast: '' };
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
  return '<div class="nx-list">' + r('/#/admin?tab=members', 'Members and roles', 'Roles and contributor awards') + r('/#/admin?tab=traffic', 'Traffic', 'Visits and most-viewed pages') + r('/#/admin?tab=appearance', 'Theme and history', 'Default theme and rollback') + r('/#/beta/reports', 'Beta reports', 'Suggestions and bug reports') + r('/#/journal-studio', 'News editor', 'Write and publish articles') + r('/#/wiki/studio', 'Wiki Studio', 'Classic wiki articles') + '</div>';
}

export function adminView(user) {
  if (!user?.permissions?.manageSite) return '<div class="nx-empty"><strong>Admins only</strong><p>This page is for Arcana admins.</p><a class="nx-btn" href="#/profile">Back to Profile</a></div>';
  const tabs = [['inbox', 'Inbox'], ['featured', 'Featured'], ['site', 'Site'], ['more', 'More']];
  const body = A.tab === 'featured' ? featured() : A.tab === 'site' ? site() : A.tab === 'more' ? more() : inbox();
  return '<a class="nx-back" href="#/profile">‹ Profile</a><header class="nx-page-head"><span class="nx-kicker">OWNER</span><h1>Admin</h1></header>' +
    '<div class="st-tabs" role="tablist">' + tabs.map(([id, l]) => '<button role="tab" aria-selected="' + (A.tab === id) + '" data-adm="tab" data-v="' + id + '">' + l + (id === 'featured' && A.feat.dirty ? ' •' : '') + '</button>').join('') + '</div>' +
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
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-adm]');
    if (!b || b.disabled) return;
    const a = b.dataset.adm, id = b.dataset.id, i = +b.dataset.i, items = A.feat.items;
    if (a === 'tab') { A.tab = b.dataset.v; return rerender(); }
    if (a === 'reload') { A.posts.state = A.feat.state = A.site.state = 'idle'; return rerender(); }
    if (a === 'feature') { if (items.length >= 12) return toast('Feature at most 12 builds.'); A.feat.items = [...items, { postId: id, note: '' }]; A.feat.dirty = true; return saveFeatured(); }
    if (a === 'unfeature') { A.feat.items = items.filter(x => x.postId !== id); A.feat.dirty = true; return saveFeatured(); }
    if (a === 'hide' || a === 'unhide') return setVisibility(id, a === 'hide' ? 'hidden' : 'public');
    if (a === 'up' || a === 'down') { const j = a === 'up' ? i - 1 : i + 1, n = [...items];[n[i], n[j]] = [n[j], n[i]]; A.feat.items = n; A.feat.dirty = true; return rerender(); }
    if (a === 'remove') { A.feat.items = items.filter((_, k) => k !== i); A.feat.dirty = true; return rerender(); }
    if (a === 'saveFeat') return saveFeatured();
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
    const i = e.target.dataset?.admNote;
    if (i === undefined) return;
    A.feat.items = A.feat.items.map((x, k) => k === +i ? { ...x, note: e.target.value.slice(0, 140) } : x);
    if (!A.feat.dirty) { A.feat.dirty = true; const s = document.querySelector('[data-adm=saveFeat]'); if (s) { s.disabled = false; s.textContent = 'Save Featured'; } }
  });
}
