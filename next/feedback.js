// Feedback for Arcana Next: the public form and the staff review list.
// Uses the existing /api/beta endpoints (origin check, rate limit, bot trap, no IPs stored).
import { esc, shortDate } from './core.js';

let rerender = () => {};
const CATS = [['bug', 'Bug'], ['incorrect-data', 'Wrong data'], ['usability', 'Hard to use'], ['missing-art', 'Missing art'], ['feature-request', 'Feature idea'], ['other', 'Other']];
const F = { cat: 'bug', title: '', details: '', contact: '', page: '', sent: '', busy: false, error: '' };
const R = { state: 'idle', list: [], filter: 'open', busy: false };
let lastPage = '';
// Remember the page the player came from, so the report says where the problem was.
export function notePage(hash) { if (hash && !hash.startsWith('#/feedback')) lastPage = hash.split('?')[0].slice(0, 170); }

export function feedbackView() {
  if (!F.page) F.page = lastPage;
  if (F.sent) return '<header class="nx-page-head"><span class="nx-kicker">FEEDBACK</span><h1>Thanks, got it</h1><p>Reference <b>' + esc(F.sent) + '</b>. I read every report.</p></header>' +
    '<div class="st-two"><button class="nx-btn" data-fb="again">Send another</button><a class="nx-btn nx-btn-primary" href="#/home">Back to Home</a></div>';
  return '<header class="nx-page-head"><span class="nx-kicker">FEEDBACK</span><h1>Report a problem</h1><p>Something broken, wrong or confusing? Ideas welcome too.</p></header>' +
    '<section class="nx-tool"><div class="st-wrapchips" role="radiogroup" aria-label="What kind of feedback?">' + CATS.map(([id, l]) => '<button role="radio" aria-checked="' + (F.cat === id) + '" aria-pressed="' + (F.cat === id) + '" data-fb="cat" data-v="' + id + '">' + l + '</button>').join('') + '</div>' +
    '<label class="nx-field">Short title<input maxlength="110" value="' + esc(F.title) + '" data-fb-in="title" placeholder="e.g. Pathfinder shows the wrong biome"></label>' +
    '<label class="nx-field">What happened?<textarea rows="6" maxlength="2400" data-fb-in="details" placeholder="What you did, what you expected, what you saw">' + esc(F.details) + '</textarea></label>' +
    '<label class="nx-field">Page <small>optional</small><input maxlength="170" value="' + esc(F.page) + '" data-fb-in="page" placeholder="#/tools/pathfinder"></label>' +
    '<label class="nx-field">Email for a reply <small>optional</small><input type="email" maxlength="120" value="' + esc(F.contact) + '" data-fb-in="contact" placeholder="you@example.com"></label>' +
    '<input class="nx-trap" tabindex="-1" autocomplete="off" aria-hidden="true" data-fb-in="website">' +
    (F.error ? '<p class="st-err" role="alert">' + esc(F.error) + '</p>' : '') +
    '<button class="nx-btn nx-btn-primary" data-fb="send"' + (F.busy ? ' disabled' : '') + '>' + (F.busy ? 'Sending…' : 'Send') + '</button></section>' +
    '<p class="nx-fine">No account needed. Your email is only used to reply. Up to 6 reports an hour.</p>';
}

// ---------- staff review (Admin → Reports) ----------
function loadReports(force) {
  if (!force && R.state !== 'idle') return;
  R.state = 'loading';
  fetch('/api/beta/reports', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(12000) })
    .then(r => r.ok ? r.json() : Promise.reject(r.status)).then(j => { R.list = j.reports || []; R.state = 'ready'; })
    .catch(s => { R.state = s === 403 ? 'denied' : 'error'; }).finally(rerender);
}
const CAT_NAME = Object.fromEntries(CATS);
export function reportsTab() {
  loadReports();
  if (R.state === 'denied') return '<div class="nx-empty"><strong>Needs moderator access</strong></div>';
  if (R.state === 'error') return '<div class="nx-empty"><strong>Couldn’t load reports</strong><button class="nx-btn" data-fb="reload">Try again</button></div>';
  if (R.state !== 'ready') return '<div class="nx-loading">Loading reports…</div>';
  const open = r => r.state === 'new' || r.state === 'reviewing';
  const list = R.list.filter(r => R.filter === 'all' || (R.filter === 'open' ? open(r) : !open(r)));
  return '<div class="nx-seg" role="tablist">' + [['open', 'Open · ' + R.list.filter(open).length], ['done', 'Done'], ['all', 'All']].map(([id, l]) => '<button role="tab" aria-selected="' + (R.filter === id) + '" data-fb="filter" data-v="' + id + '">' + l + '</button>').join('') + '</div>' +
    (list.length ? '<div class="nx-list">' + list.map(r => '<div class="nx-card"><span class="nx-tags"><span class="nx-tag' + (r.state === 'new' ? ' nx-tag-accent' : '') + '">' + esc(r.state) + '</span><span class="nx-tag">' + esc(CAT_NAME[r.category] || r.category) + '</span><span class="nx-tag">' + esc(shortDate(r.createdAt)) + '</span></span>' +
      '<strong>' + esc(r.title) + '</strong><small class="fb-details">' + esc(r.details) + '</small>' +
      ((r.page || r.contact) ? '<small>' + [r.page ? 'Page ' + esc(r.page) : '', r.contact ? '<a href="mailto:' + esc(r.contact) + '">' + esc(r.contact) + '</a>' : ''].filter(Boolean).join(' · ') + '</small>' : '') +
      '<div class="st-wrapchips">' + ['new', 'reviewing', 'resolved', 'closed'].map(s => '<button aria-pressed="' + (r.state === s) + '" data-fb="state" data-id="' + esc(r.id) + '" data-v="' + s + '"' + (R.busy ? ' disabled' : '') + '>' + s[0].toUpperCase() + s.slice(1) + '</button>').join('') + '</div></div>').join('') + '</div>'
      : '<div class="nx-empty"><strong>Nothing here</strong><p>' + (R.filter === 'open' ? 'No open reports.' : 'No reports yet.') + '</p></div>');
}

export function initFeedback(render) {
  rerender = render;
  document.addEventListener('input', e => { const k = e.target.dataset?.fbIn; if (k && k !== 'website') F[k] = e.target.value; if (k === 'website') F.trap = e.target.value; });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fb]');
    if (!b) return;
    const a = b.dataset.fb;
    if (a === 'cat') { F.cat = b.dataset.v; return render(); }
    if (a === 'again') { Object.assign(F, { title: '', details: '', sent: '', error: '' }); return render(); }
    if (a === 'filter') { R.filter = b.dataset.v; return render(); }
    if (a === 'reload') { R.state = 'idle'; return render(); }
    if (a === 'send') {
      if (F.title.trim().length < 6) { F.error = 'Give it a title of at least 6 characters.'; return render(); }
      if (F.details.trim().length < 15) { F.error = 'Describe it in at least 15 characters.'; return render(); }
      if (F.page && !/^#\/[a-z0-9/?&=_.%-]*$/i.test(F.page)) F.page = '';
      F.busy = true; F.error = ''; render();
      fetch('/api/beta/feedback', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(12000),
        body: JSON.stringify({ category: F.cat, title: F.title, details: F.details, page: F.page, contact: F.contact.trim(), clientVersion: 'arcana-next', website: F.trap || '' }) })
        .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(j.error || 'Couldn’t send. Try again in a moment.'); F.sent = j.reference || 'received'; })
        .catch(err => { F.error = err.message; }).finally(() => { F.busy = false; render(); });
      return;
    }
    if (a === 'state') {
      const id = b.dataset.id, v = b.dataset.v;
      R.busy = true; render();
      fetch('/api/beta/reports/' + id, { method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ state: v }) })
        .then(r => { if (!r.ok) throw 0; const x = R.list.find(q => q.id === id); if (x) x.state = v; })
        .catch(() => {}).finally(() => { R.busy = false; render(); });
    }
  });
}
