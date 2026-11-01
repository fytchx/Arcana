// Guilds for Arcana Next: directory, guild page, apply. Uses the existing /api/guild-hub endpoints.
// Registering and managing a guild still happen on the classic site.
import { esc, shortDate, signInButtons } from './core.js';

let rerender = () => {};
const G = { state: 'idle', list: [], q: '', open: false, detail: {}, note: '', busy: false, msg: '' };
async function api(url, opts = {}) {
  const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(12000), ...opts, headers: { 'content-type': 'application/json', ...(opts.headers || {}) } });
  let j = {}; try { j = await r.json(); } catch { /* empty */ }
  if (!r.ok) throw Object.assign(Error(j.error || 'Request failed (' + r.status + ').'), { status: r.status });
  return j;
}
const HEX = /^#[0-9a-f]{6}$/i;
const tag = g => '<span class="gd-tag" style="--tag:' + (HEX.test(g.tagStyle?.color || '') ? g.tagStyle.color : '#D2B2FF') + '">[' + esc(g.tag) + ']</span>';
function loadList(force) {
  if (!force && G.state !== 'idle') return;
  G.state = 'loading';
  api('/api/guild-hub').then(j => { G.list = j.guilds || []; G.state = 'ready'; }).catch(() => { G.state = 'error'; }).finally(rerender);
}
function loadGuild(id, force) {
  if (!force && G.detail[id]) return;
  G.detail[id] = { state: 'loading' };
  api('/api/guild-hub/' + encodeURIComponent(id)).then(j => { G.detail[id] = { state: 'ready', g: j.guild }; }).catch(() => { G.detail[id] = { state: 'error' }; }).finally(rerender);
}

export function guildsView(id, me) {
  if (id) return guildView(id, me);
  loadList();
  const head = '<a class="nx-back" href="#/profile">‹ Profile</a><header class="nx-page-head"><span class="nx-kicker">COMMUNITY</span><h1>Guilds</h1><p>Find a guild, see who’s in it, and apply.</p></header>';
  if (G.state === 'error') return head + '<div class="nx-empty"><strong>Guilds didn’t load</strong><button class="nx-btn" data-gd="reload">Try again</button></div>';
  if (G.state !== 'ready') return head + '<div class="nx-loading">Loading guilds…</div>';
  const q = G.q.trim().toLowerCase();
  const list = G.list.filter(g => g.status === 'approved' && (!G.open || g.recruitmentOpen) && (!q || (g.name + ' ' + g.tag).toLowerCase().includes(q)));
  return head + '<label class="nx-search nx-search-input"><input type="search" placeholder="Guild name or tag" value="' + esc(G.q) + '" data-gd-q aria-label="Search guilds"></label>' +
    '<label class="st-switch"><input type="checkbox" data-gd-open' + (G.open ? ' checked' : '') + '><span></span>Only guilds open to applicants</label>' +
    (list.length ? '<div class="nx-list">' + list.map(g => '<a class="nx-row" href="#/guilds/' + esc(g.id) + '"><span class="nx-row-text"><strong>' + tag(g) + ' ' + esc(g.name) + '</strong><small>' + g.memberCount + (g.memberCount === 1 ? ' member' : ' members') + (g.recruitmentOpen ? ' · Recruiting' : '') + (g.amMember ? ' · Your guild' : '') + '</small></span><span class="nx-row-end">›</span></a>').join('') + '</div>'
      : '<div class="nx-empty"><strong>No guilds match</strong><p>Try another name, or turn off the filter.</p></div>') +
    '<a class="nx-row" href="#/tools/guild-tree"><span class="nx-row-text"><strong>Guild skill tree</strong><small>Plan your guild\u2019s points</small></span><span class="nx-row-end">›</span></a>' +
    '<a class="nx-row" href="/classic#/guilds/register"><span class="nx-row-text"><strong>Register your guild</strong><small>Classic site</small></span><span class="nx-row-end">↗</span></a>';
}
function guildView(id, me) {
  loadGuild(id);
  const back = '<a class="nx-back" href="#/guilds">‹ Guilds</a>', d = G.detail[id];
  if (d.state === 'loading') return back + '<div class="nx-loading">Loading guild…</div>';
  if (d.state === 'error') return back + '<div class="nx-empty"><strong>Guild not found</strong></div>';
  const g = d.g, u = me?.user;
  const ROLE = { owner: 'Leader', officer: 'Officer', member: 'Member' };
  let action = '';
  if (g.canManage) action = '<a class="nx-btn nx-btn-primary" href="/classic#/guilds/manage?id=' + encodeURIComponent(g.id) + '">Manage guild ↗</a>';
  else if (g.amMember) action = '<p class="nx-callout">You’re in this guild.</p>';
  else if (g.myApplication) action = '<p class="nx-callout">Your application is waiting for the guild to review it.</p>';
  else if (!g.recruitmentOpen) action = '<p class="nx-fine">This guild isn’t taking applications right now.</p>';
  else if (!u) action = '<div class="nx-card"><strong>Sign in to apply</strong>' + signInButtons(me) + '</div>';
  else action = '<section class="nx-tool"><label class="nx-field">Note to the guild <small>optional</small><textarea rows="3" maxlength="500" data-gd-note placeholder="Your level, class, when you play…">' + esc(G.note) + '</textarea></label>' +
    '<button class="nx-btn nx-btn-primary" data-gd="apply" data-id="' + esc(g.id) + '"' + (G.busy ? ' disabled' : '') + '>' + (G.busy ? 'Sending…' : 'Apply to join') + '</button></section>';
  return back + '<header class="nx-page-head"><span class="nx-kicker">GUILD · ' + g.memberCount + (g.memberCount === 1 ? ' MEMBER' : ' MEMBERS') + '</span><h1>' + tag(g) + ' ' + esc(g.name) + '</h1>' + (g.recruitmentOpen ? '<p>Recruiting</p>' : '') + '</header>' +
    (g.bio ? '<p class="nx-read gd-bio">' + esc(g.bio) + '</p>' : '') + action + (G.msg ? '<p class="st-err" role="alert">' + esc(G.msg) + '</p>' : '') +
    '<section><h2 class="nx-label">Members</h2><div class="nx-list">' + (g.members || []).slice().sort((a, b) => ['owner', 'officer', 'member'].indexOf(a.role) - ['owner', 'officer', 'member'].indexOf(b.role)).map(m =>
      '<div class="nx-row"><span class="nx-row-text"><strong>' + esc(m.name || 'Member') + '</strong><small>' + esc(ROLE[m.role] || m.role) + ' · since ' + esc(shortDate(m.joinedAt)) + '</small></span></div>').join('') + '</div></section>';
}

export function initGuilds(render) {
  rerender = render;
  document.addEventListener('input', e => {
    if (e.target.dataset?.gdQ !== undefined) { G.q = e.target.value; const pos = e.target.selectionStart; render(); const q = document.querySelector('[data-gd-q]'); if (q) { q.focus(); q.setSelectionRange(pos, pos); } }
    if (e.target.dataset?.gdNote !== undefined) G.note = e.target.value;
  });
  document.addEventListener('change', e => { if (e.target.dataset?.gdOpen !== undefined) { G.open = e.target.checked; render(); } });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-gd]');
    if (!b || b.disabled) return;
    if (b.dataset.gd === 'reload') { G.state = 'idle'; return render(); }
    if (b.dataset.gd === 'apply') {
      const id = b.dataset.id;
      G.busy = true; G.msg = ''; render();
      api('/api/guild-hub/' + id + '/apply', { method: 'POST', body: JSON.stringify({ note: G.note.trim() }) })
        .then(() => { G.note = ''; loadGuild(id, true); })
        .catch(err => { G.msg = err.message; })
        .finally(() => { G.busy = false; render(); });
    }
  });
}
