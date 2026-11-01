// Community extras for Arcana Next: Looking for group (raids) and Season records.
// LFG reads the existing /api/lfg/public feed with the classic lfg-core helpers; joining happens on
// the LFG site. Records read /api/arcana-archive/records (managed from the classic staff pages).
import { normalizePublicFeed, lfgFilter, formatMight, lfgDeepLink, isRecruiting } from '../src/lfg-core.js';
import { esc } from './core.js';

let rerender = () => {};
const L = { state: 'idle', items: [], tab: 'active', tier: '', open: true, q: '', at: 0 };
const R = { state: 'idle', records: [], season: '', cat: 'class' };
const get = url => fetch(url, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(12000) }).then(r => r.ok ? r.json() : Promise.reject(r.status));

function loadLfg(force) {
  if (!force && (L.state === 'loading' || (L.state === 'ready' && Date.now() - L.at < 30000))) return;
  L.state = 'loading';
  get('/api/lfg/public').then(j => { const d = normalizePublicFeed(j); L.items = [...d.listings, ...d.plans]; L.state = 'ready'; L.at = Date.now(); })
    .catch(() => { L.state = 'error'; }).finally(rerender);
}
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function lfgView() {
  loadLfg();
  const head = '<a class="nx-back" href="#/profile">‹ Profile</a><header class="nx-page-head"><span class="nx-kicker">COMMUNITY</span><h1>Looking for group</h1><p>Raids that need players right now, regular teams and planned runs.</p></header>';
  if (L.state === 'error') return head + '<div class="nx-empty"><strong>Raid listings are unavailable</strong><p>The LFG service may be down. Try again in a minute.</p><button class="nx-btn" data-lfg="reload">Try again</button></div>';
  if (L.state !== 'ready' && !L.items.length) return head + '<div class="nx-loading">Loading raids…</div>';
  const list = lfgFilter(L.items, { tab: L.tab, query: L.q, tier: L.tier, openOnly: L.open });
  const tiers = [...new Set(L.items.map(x => x.tier).filter(n => Number.isFinite(n) && n > 0))].sort((a, b) => a - b);
  return head + '<div class="nx-seg" role="tablist">' + [['active', 'Now'], ['team', 'Teams'], ['scheduled', 'Planned']].map(([id, l]) => '<button role="tab" aria-selected="' + (L.tab === id) + '" data-lfg="tab" data-v="' + id + '">' + l + ' · ' + L.items.filter(x => x.kind === id && (!L.open || isRecruiting(x))).length + '</button>').join('') + '</div>' +
    '<div class="lfg-filters"><label class="nx-search nx-search-input"><input type="search" placeholder="Leader, guild, notes" value="' + esc(L.q) + '" data-lfg-q aria-label="Search raids"></label>' +
    (tiers.length ? '<label class="nx-field"><select data-lfg-tier aria-label="Tier"><option value="">All tiers</option>' + tiers.map(t => '<option value="' + t + '"' + (String(t) === String(L.tier) ? ' selected' : '') + '>Tier ' + t + '</option>').join('') + '</select></label>' : '') + '</div>' +
    '<label class="st-switch"><input type="checkbox" data-lfg-open' + (L.open ? ' checked' : '') + '><span></span>Only groups with open spots</label>' +
    (list.length ? '<div class="nx-list">' + list.map(x => '<a class="nx-card" href="' + esc(lfgDeepLink(x)) + '" target="_blank" rel="noopener"><span class="nx-tags">' + (x.tier ? '<span class="nx-tag nx-tag-accent">Tier ' + x.tier + '</span>' : '') + '<span class="nx-tag">' + x.members.length + '/4</span>' +
        (x.minMight || x.maxMight < Number.MAX_SAFE_INTEGER ? '<span class="nx-tag">Might ' + esc(formatMight(x.minMight)) + (x.maxMight < Number.MAX_SAFE_INTEGER ? '–' + esc(formatMight(x.maxMight)) : '+') + '</span>' : '') + '</span>' +
        '<strong>' + esc(x.title) + '</strong><small>' + esc([x.leader && 'Led by ' + x.leader, x.guild, x.kind === 'team' && x.days.length ? x.days.map(d => DAYS[d]).join(' ') + (x.time ? ' ' + x.time : '') : '', x.kind === 'scheduled' && x.startAt ? new Date(x.startAt).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : ''].filter(Boolean).join(' · ')) + '</small>' +
        (x.notes ? '<small>' + esc(x.notes) + '</small>' : '') + '<span class="nx-by">Open on the LFG site ↗</span></a>').join('') + '</div>'
      : '<div class="nx-empty"><strong>Nothing here right now</strong><p>Try another tab or turn off the open-spots filter.</p></div>') +
    '<a class="nx-btn" href="https://lfg.arcanacompanion.xyz/" target="_blank" rel="noopener">Post a raid on the LFG site ↗</a>';
}

function loadRecords() {
  if (R.state !== 'idle') return;
  R.state = 'loading';
  get('/api/arcana-archive/records').then(j => { R.records = j.records || []; R.season = R.season || R.records[0]?.season || ''; R.state = 'ready'; }).catch(() => { R.state = 'error'; }).finally(rerender);
}
export function recordsView() {
  loadRecords();
  const head = '<a class="nx-back" href="#/profile">‹ Profile</a><header class="nx-page-head"><span class="nx-kicker">COMMUNITY</span><h1>Season records</h1><p>Top players and guilds from past seasons.</p></header>';
  if (R.state === 'error') return head + '<div class="nx-empty"><strong>Records didn’t load</strong></div>';
  if (R.state !== 'ready') return head + '<div class="nx-loading">Loading records…</div>';
  if (!R.records.length) return head + '<div class="nx-empty"><strong>No records yet</strong><p>Season results show up here once they’re added.</p></div>';
  const seasons = [...new Set(R.records.map(r => r.season))];
  const rows = R.records.filter(r => r.season === R.season && r.category === R.cat);
  const byClass = R.cat === 'class' ? [...new Set(rows.map(r => r.characterClass))] : [''];
  return head + '<label class="nx-field">Season<select data-rec-season>' + seasons.map(s => '<option' + (s === R.season ? ' selected' : '') + '>' + esc(s) + '</option>').join('') + '</select></label>' +
    '<div class="nx-seg" role="tablist">' + [['class', 'By class'], ['individual', 'Players'], ['guild', 'Guilds']].map(([id, l]) => '<button role="tab" aria-selected="' + (R.cat === id) + '" data-rec="cat" data-v="' + id + '">' + l + '</button>').join('') + '</div>' +
    (rows.length ? byClass.map(c => '<section>' + (c ? '<h2 class="nx-label">' + esc(c) + '</h2>' : '') + '<div class="nx-list">' + rows.filter(r => !c || r.characterClass === c).sort((a, b) => a.rank - b.rank).map(r =>
      '<div class="nx-card rec-card"><span class="rec-rank">#' + r.rank + '</span><span><strong>' + esc(r.name) + '</strong><small>' + esc(r.description) + '</small>' + (/^https:\/\//.test(r.source || '') ? '<a href="' + esc(r.source) + '" target="_blank" rel="noopener nofollow">Source ↗</a>' : '') + '</span></div>').join('') + '</div></section>').join('')
      : '<div class="nx-empty"><strong>No ' + (R.cat === 'guild' ? 'guild' : R.cat === 'individual' ? 'player' : 'class') + ' records for ' + esc(R.season) + '</strong></div>');
}

export function initCommunity(render) {
  rerender = render;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lfg],[data-rec]');
    if (!b) return;
    if (b.dataset.lfg === 'tab') L.tab = b.dataset.v;
    if (b.dataset.lfg === 'reload') L.state = 'idle';
    if (b.dataset.rec === 'cat') R.cat = b.dataset.v;
    render();
  });
  document.addEventListener('input', e => {
    if (e.target.dataset?.lfgQ === undefined) return;
    L.q = e.target.value; const pos = e.target.selectionStart; render();
    const q = document.querySelector('[data-lfg-q]'); if (q) { q.focus(); q.setSelectionRange(pos, pos); }
  });
  document.addEventListener('change', e => {
    const d = e.target.dataset || {};
    if (d.lfgTier !== undefined) { L.tier = e.target.value; render(); }
    if (d.lfgOpen !== undefined) { L.open = e.target.checked; render(); }
    if (d.recSeason !== undefined) { R.season = e.target.value; render(); }
  });
}
