// Farming checklists for Arcana Next, stored on the player's account through the existing
// /api/account/farming-lists endpoints (12 per account, conflict-safe ticks).
import { esc, shortDate, signInButtons } from './core.js';
import { checklistPayload, SAVE_SLOTS } from './pathfinder.js';
import { readQuickView } from '../src/pathfinder-timeline.js';
import { money } from '../src/pathfinder-timeline.js';

let rerender = () => {};
const C = { state: 'idle', lists: [], busy: false, toast: '', slot: '', confirmDel: '' };
async function api(url, opts = {}) {
  const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(12000), ...opts, headers: { 'content-type': 'application/json', ...(opts.headers || {}) } });
  let j = {}; try { j = await r.json(); } catch { /* empty */ }
  if (!r.ok) throw Object.assign(Error(j.error || 'Request failed (' + r.status + ').'), { status: r.status });
  return j;
}
let tt;
const toast = m => { C.toast = m; clearTimeout(tt); tt = setTimeout(() => { C.toast = ''; rerender(); }, 2600); rerender(); };
function load(force) {
  if (!force && C.state !== 'idle') return;
  C.state = 'loading';
  api('/api/account/farming-lists').then(j => { C.lists = j.lists || []; C.state = 'ready'; }).catch(e => { C.state = e.status === 401 ? 'signedout' : 'error'; }).finally(rerender);
}
const done = l => { const all = l.groups.flatMap(g => g.items); return [all.filter(m => m.completed).length, all.length]; };

// Save block shown under Pathfinder's Upgrade costs.
export function saveChecklistBlock(me) {
  if (!C.slot) C.slot = readQuickView().slot || 'head';
  return '<section class="nx-tool"><strong>Save as a farming checklist</strong><small class="nx-fine">Tick materials off as you farm. Saved to your account, up to 12.</small>' +
    (me?.user ? '<div class="pf-save"><label class="nx-field">For slot<select data-cl-in="slot">' + SAVE_SLOTS.map(s => '<option value="' + s.id + '"' + (s.id === C.slot ? ' selected' : '') + '>' + esc(s.label) + '</option>').join('') + '</select></label>' +
      '<button class="nx-btn nx-btn-primary" data-cl="save"' + (C.busy ? ' disabled' : '') + '>' + (C.busy ? 'Saving…' : 'Save checklist') + '</button></div>' : signInButtons(me)) +
    (C.toast ? '<div class="st-toast" role="status">' + esc(C.toast) + '</div>' : '') + '</section>';
}

// Profile section.
export function checklistsSection(signedIn) {
  if (!signedIn) return '';
  load();
  const head = '<div class="nx-head"><h2 class="nx-label">Farming checklists</h2><a href="#/tools/pathfinder">Pathfinder</a></div>';
  if (C.state === 'error') return '<section>' + head + '<p class="nx-fine">Couldn’t load checklists.</p></section>';
  if (C.state !== 'ready') return '<section>' + head + '<div class="nx-loading">Loading…</div></section>';
  if (!C.lists.length) return '<section>' + head + '<div class="nx-empty"><strong>No checklists yet</strong><p>In Pathfinder, pick an upgrade and tap Save checklist.</p></div></section>';
  return '<section>' + head + '<div class="nx-list">' + C.lists.map(l => { const [d, t] = done(l); return '<a class="nx-row" href="#/checklist/' + esc(l.id) + '"><span class="nx-row-text"><strong>' + esc(l.title) + '</strong><small>' + d + ' of ' + t + ' done · ' + esc(shortDate(l.updatedAt)) + '</small><span class="cl-bar"><i style="width:' + Math.round(d / Math.max(1, t) * 100) + '%"></i></span></span><span class="nx-row-end">›</span></a>'; }).join('') + '</div></section>';
}

// One checklist.
export function checklistView(id) {
  load();
  const back = '<a class="nx-back" href="#/profile">‹ Profile</a>';
  if (C.state === 'signedout') return back + '<div class="nx-empty"><strong>Sign in to see your checklists</strong></div>';
  if (C.state !== 'ready') return back + (C.state === 'error' ? '<div class="nx-empty"><strong>Couldn’t load checklists</strong><button class="nx-btn" data-cl="reload">Try again</button></div>' : '<div class="nx-loading">Loading…</div>');
  const l = C.lists.find(x => x.id === id);
  if (!l) return back + '<div class="nx-empty"><strong>Checklist not found</strong><p>It may have been deleted on another device.</p></div>';
  const [d, t] = done(l);
  return back + '<header class="nx-page-head"><span class="nx-kicker">FARMING CHECKLIST</span><h1>' + esc(l.title) + '</h1><p>' + d + ' of ' + t + ' materials done · ' + money(BigInt(l.gold || '0')) + ' gold</p></header>' +
    '<span class="cl-bar big"><i style="width:' + Math.round(d / Math.max(1, t) * 100) + '%"></i></span>' +
    l.groups.map(g => '<section><h2 class="nx-label">' + esc(g.name) + (g.tier ? ' · ' + esc(g.tier) : '') + '</h2><div class="pf-mats pf-card">' + g.items.map(m =>
      '<label class="pf-mat cl-item' + (m.completed ? ' done' : '') + '"><span class="cl-check"><input type="checkbox"' + (m.completed ? ' checked' : '') + ' data-cl-tick="' + esc(m.slug) + '" data-id="' + esc(l.id) + '"' + (C.busy ? ' disabled' : '') + '><b>' + esc(m.name) + '</b></span><span class="pf-q"><b>' + money(BigInt(m.quantity)) + '</b></span></label>').join('') + '</div></section>').join('') +
    '<button class="nx-btn cl-del' + (C.confirmDel === l.id ? ' danger' : '') + '" data-cl="delete" data-id="' + esc(l.id) + '">' + (C.confirmDel === l.id ? 'Tap again to delete' : 'Delete checklist') + '</button>' +
    (C.toast ? '<div class="st-toast" role="status">' + esc(C.toast) + '</div>' : '');
}

export function initChecklists(render) {
  rerender = render;
  document.addEventListener('change', e => {
    if (e.target.dataset?.clIn === 'slot') { C.slot = e.target.value; return; }
    const slug = e.target.dataset?.clTick;
    if (!slug) return;
    const l = C.lists.find(x => x.id === e.target.dataset.id), checked = e.target.checked;
    C.busy = true; render();
    api('/api/account/farming-lists/' + l.id, { method: 'PATCH', body: JSON.stringify({ slug, completed: checked, baseUpdatedAt: l.updatedAt }) })
      .then(j => { Object.assign(l, j.list); })
      .catch(err => { if (err.status === 409) { C.state = 'idle'; toast('Changed on another device. Reloaded the latest.'); } else toast(err.message); })
      .finally(() => { C.busy = false; render(); });
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cl]');
    if (!b || b.disabled) return;
    const a = b.dataset.cl;
    if (a === 'reload') { C.state = 'idle'; return render(); }
    if (a === 'save') {
      const p = checklistPayload(C.slot);
      if (p.error) return toast(p.error);
      C.busy = true; render();
      api('/api/account/farming-lists', { method: 'POST', body: JSON.stringify(p) })
        .then(j => { C.lists.unshift(j.list); C.state = 'ready'; location.hash = '#/checklist/' + j.list.id; toast('Checklist saved.'); })
        .catch(err => toast(err.status === 401 ? 'Sign in to save checklists.' : err.message))
        .finally(() => { C.busy = false; render(); });
    }
    if (a === 'delete') {
      const id = b.dataset.id;
      if (C.confirmDel !== id) { C.confirmDel = id; setTimeout(() => { C.confirmDel = ''; render(); }, 3500); return render(); }
      C.busy = true; render();
      api('/api/account/farming-lists/' + id, { method: 'DELETE' })
        .then(() => { C.lists = C.lists.filter(x => x.id !== id); C.confirmDel = ''; location.hash = '#/profile'; toast('Checklist deleted.'); })
        .catch(err => toast(err.message)).finally(() => { C.busy = false; render(); });
    }
  });
}
