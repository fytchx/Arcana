// Handbook editor: write and update pages inside the site.
// Editors save drafts or send them for review; publishers publish, hide and restore versions.
import { esc } from './core.js';
import { CHAPTERS, HANDBOOK_VERSION } from './handbook-content.js';
import { hbText, handbookPages, loadHandbook, chapterOf } from './handbook.js';

const E = { state: 'idle', revision: 0, entries: [], canPublish: false, edit: null, preview: false, busy: false, msg: '', toast: '', confirm: '' };
let rerender = () => {}, tt;
const toast = m => { E.toast = m; clearTimeout(tt); tt = setTimeout(() => { E.toast = ''; rerender(); }, 2600); rerender(); };
const TOOLS = [['studio', 'Build Studio'], ['pathfinder', 'Pathfinder'], ['mlxp', 'ML XP'], ['pets', 'Pet calculators'], ['guildtree', 'Guild tree'], ['builds', 'Builds'], ['lfg', 'Looking for group']];
const TRUST = [['config', 'Game data', 'Read from the game config'], ['verified', 'Verified', 'Checked in game or confirmed by the developers'], ['estimated', 'Estimated', 'Measured by players, may be off'], ['legacy', 'Legacy', 'True in an older version']];
const slug = t => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

async function api(method, body) {
  const r = await fetch('/api/admin/handbook', { method, credentials: 'same-origin', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(Error(j.error || 'Request failed (' + r.status + ').'), { status: r.status });
  return j;
}
export function loadEditorData(force) {
  if (!force && E.state !== 'idle') return;
  E.state = 'loading';
  api('GET').then(j => { E.revision = j.revision; E.entries = j.entries; E.canPublish = j.canPublish; E.state = 'ready'; }).catch(e => { E.state = e.status === 403 || e.status === 401 ? 'denied' : 'error'; }).finally(rerender);
}
const entry = id => E.entries.find(x => x.id === id);

function openEditor(id, chapter) {
  const en = id ? entry(id) : null, base = en ? (en.draft || en.published) : null;
  E.edit = base ? { ...base, isNew: false, fromDraft: !!en.draft } : { id: '', chapter: chapter || 'start', title: '', answer: '', body: '', trust: 'config', version: HANDBOOK_VERSION, order: 100, isNew: true };
  E.preview = false; E.msg = '';
}

// ---------- views ----------
export function editorView(id, isNew) {
  loadEditorData();
  if (E.state === 'denied') return '<div class="nx-empty"><strong>Editors only</strong><p>Ask an admin for the Handbook Editor or Game Developer role.</p></div>';
  if (E.state === 'error') return '<div class="nx-empty"><strong>Couldn’t load the Handbook editor</strong><button class="nx-btn" data-he="reload">Try again</button></div>';
  if (E.state !== 'ready') return '<div class="nx-loading">Loading the editor…</div>';
  const key = (isNew ? 'new:' : '') + id;
  if (!E.edit || E.edit._key !== key) { openEditor(isNew ? null : id, isNew ? id : null); E.edit._key = key; }
  const e = E.edit, en = isNew ? null : entry(id);
  const field = (k, label, ph, max, area) => '<label class="nx-field">' + label + (area ? '<textarea rows="' + area + '" maxlength="' + max + '" data-he-f="' + k + '" placeholder="' + esc(ph) + '">' + esc(e[k] || '') + '</textarea>' : '<input maxlength="' + max + '" data-he-f="' + k + '" value="' + esc(e[k] || '') + '" placeholder="' + esc(ph) + '">') + '</label>';
  const tool = (act, label, title) => '<button type="button" data-he="ins" data-v="' + act + '" title="' + esc(title) + '">' + label + '</button>';
  const status = en?.draft ? (en.review ? 'Waiting for review' : 'Draft saved') + (en.draftBy ? ' by ' + esc(en.draftBy) : '') : en?.hidden ? 'Hidden from readers' : en ? 'Published' : 'New page';
  return '<a class="nx-back" href="' + (isNew ? '#/handbook/chapter/' + esc(id) : '#/handbook/' + esc(id)) + '">‹ ' + (isNew ? 'Chapter' : 'Back to page') + '</a>' +
    '<header class="dz-head"><span><span class="nx-kicker">HANDBOOK EDITOR</span><h1>' + (isNew ? 'New page' : esc(e.title || 'Edit page')) + '</h1></span><span class="dz-status' + (en?.draft ? ' dz-draft' : '') + '">' + status + '</span></header>' +
    '<div class="nx-seg" role="tablist"><button role="tab" aria-selected="' + !E.preview + '" data-he="mode" data-v="write">Write</button><button role="tab" aria-selected="' + E.preview + '" data-he="mode" data-v="preview">Preview</button></div>' +
    (E.preview ? '<article class="hb-page he-preview"><header class="hb-head"><span class="nx-kicker">' + esc((chapterOf(e.chapter)?.title || '').toUpperCase()) + '</span><h1>' + esc(e.title) + '</h1></header><p class="hb-answer">' + esc(e.answer) + '</p>' + hbText(e.body) + '</article>' :
    '<section class="nx-tool he-form">' +
      '<label class="nx-field">Chapter<select data-he-f="chapter">' + CHAPTERS.map(c => '<option value="' + c.id + '"' + (c.id === e.chapter ? ' selected' : '') + '>' + c.n + ' · ' + esc(c.title) + '</option>').join('') + '</select></label>' +
      field('title', 'Title', 'For example: Pity', 80) +
      (isNew ? field('id', 'Page address', 'made from the title', 60) : '') +
      field('answer', 'One-line answer <small>shown first, in bold</small>', 'Answer the reader’s question in one sentence.', 400, 2) +
      '<div class="he-toolbar" role="toolbar" aria-label="Insert">' + tool('h2', 'Heading', 'Section heading') + tool('bold', '<b>B</b>', 'Bold') + tool('list', '• List', 'Bullet list') + tool('steps', '1. Steps', 'Numbered steps') + tool('table', 'Table', 'Small table') + '</div>' +
      '<div class="he-linkers"><label class="nx-field">Link a topic <small>select words in the text first</small><select data-he="topic"><option value="">Choose a page…</option>' +
        CHAPTERS.map(c => '<optgroup label="' + esc(c.title) + '"><option value="chapter:' + c.id + '">Chapter: ' + esc(c.title) + '</option>' + handbookPages().filter(p => p.chapter === c.id && p.id !== e.id).map(p => '<option value="' + p.id + '">' + esc(p.title) + '</option>').join('') + '</optgroup>').join('') + '</select></label>' +
        '<label class="nx-field">Add a tool button<select data-he="tool"><option value="">Choose a tool…</option>' + TOOLS.map(([k, l]) => '<option value="' + k + '">' + l + '</option>').join('') + '</select></label></div>' +
      field('body', 'Page', 'Write in short paragraphs. Blank line between paragraphs.', 30000, 16) +
      '<details class="nx-help"><summary>How to format</summary><p><b>## Heading</b> starts a section. <b>- item</b> makes a list, <b>1. step</b> numbered steps. <b>**words**</b> is bold. Tables: <b>| A | B |</b> rows, with <b>| --- | --- |</b> under the first. Linked topics look like <b>[[page|words]]</b> and open a preview for readers.</p></details>' +
      '<div class="he-meta"><label class="nx-field">Trust<select data-he-f="trust">' + TRUST.map(([k, l, d]) => '<option value="' + k + '"' + (k === e.trust ? ' selected' : '') + '>' + l + ' · ' + d + '</option>').join('') + '</select></label>' +
      field('version', 'Game version', HANDBOOK_VERSION, 20) + '</div></section>') +
    (E.msg ? '<p class="st-err" role="alert">' + esc(E.msg) + '</p>' : '') +
    '<div class="dz-bar he-bar">' +
      (E.canPublish ? '<button class="nx-btn" data-he="save" data-v="draft"' + (E.busy ? ' disabled' : '') + '>Save draft</button><button class="nx-btn nx-btn-primary" data-he="save" data-v="publish"' + (E.busy ? ' disabled' : '') + '>' + (E.confirm === 'publish' ? 'Tap to publish' : 'Publish') + '</button>'
        : '<button class="nx-btn" data-he="save" data-v="draft"' + (E.busy ? ' disabled' : '') + '>Save draft</button><button class="nx-btn nx-btn-primary" data-he="save" data-v="review"' + (E.busy ? ' disabled' : '') + '>Send for review</button>') +
      (en?.draft ? '<button class="nx-btn" data-he="discard">' + (E.confirm === 'discard' ? 'Tap to discard' : 'Discard draft') + '</button>' : '') + '</div>' +
    (en && E.canPublish ? '<section><h2 class="nx-label">Page</h2><div class="nx-list">' +
      '<button class="nx-row" data-he="vis"><span class="nx-row-text"><strong>' + (en.hidden ? 'Show to readers' : 'Hide from readers') + '</strong><small>' + (en.hidden ? 'Readers can’t see this page right now.' : 'Keeps the page and its history; readers won’t see it.') + '</small></span></button>' +
      (en.history.length ? '<details class="nx-help"><summary>Earlier versions (' + en.history.length + ')</summary>' + en.history.map(h => '<div class="he-hist"><span>' + esc(new Date(h.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })) + ' · ' + esc(h.by || '') + '</span><button class="nx-btn" data-he="restore" data-i="' + h.i + '">' + (E.confirm === 'restore' + h.i ? 'Tap to restore' : 'Restore') + '</button></div>').join('') + '</details>' : '') +
      '</div></section>' : '') +
    (E.toast ? '<div class="st-toast" role="status">' + esc(E.toast) + '</div>' : '');
}

// Admin › Handbook: what's waiting, drafts, and a way to start a page.
export function adminHandbookTab() {
  loadEditorData();
  if (E.state !== 'ready') return E.state === 'denied' ? '<div class="nx-empty"><strong>No Handbook access</strong></div>' : '<div class="nx-loading">Loading…</div>';
  const waiting = E.entries.filter(x => x.review), drafts = E.entries.filter(x => x.draft && !x.review), hidden = E.entries.filter(x => x.hidden);
  const row = (x, sub) => '<a class="nx-row" href="#/handbook/edit/' + esc(x.id) + '"><span class="nx-row-text"><strong>' + esc((x.draft || x.published).title) + '</strong><small>' + esc(sub) + '</small></span><span class="nx-row-end">›</span></a>';
  return '<a class="nx-btn nx-btn-primary" href="#/handbook/new/start">+ New Handbook page</a>' +
    '<section><h2 class="nx-label">Waiting for review · ' + waiting.length + '</h2>' + (waiting.length ? '<div class="nx-list">' + waiting.map(x => row(x, 'From ' + (x.draftBy || 'an editor'))).join('') + '</div>' : '<p class="nx-fine">Nothing waiting.</p>') + '</section>' +
    '<section><h2 class="nx-label">Drafts · ' + drafts.length + '</h2>' + (drafts.length ? '<div class="nx-list">' + drafts.map(x => row(x, 'Saved by ' + (x.draftBy || 'an editor'))).join('') + '</div>' : '<p class="nx-fine">No drafts.</p>') + '</section>' +
    (hidden.length ? '<section><h2 class="nx-label">Hidden · ' + hidden.length + '</h2><div class="nx-list">' + hidden.map(x => row(x, 'Readers can’t see this')).join('') + '</div></section>' : '') +
    '<p class="nx-fine">' + E.entries.filter(x => x.published && !x.hidden).length + ' pages published.</p>';
}

// Insert formatting at the cursor (or around the selected words).
function insert(kind, value) {
  const ta = document.querySelector('[data-he-f=body]'); if (!ta) return;
  const a = ta.selectionStart, b = ta.selectionEnd, sel = ta.value.slice(a, b), before = ta.value.slice(0, a), after = ta.value.slice(b);
  const block = t => (before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '') + t + '\n\n';
  const out = { h2: block('## ' + (sel || 'Heading')), bold: '**' + (sel || 'bold words') + '**', list: block((sel || 'First point\nSecond point').split('\n').map(l => '- ' + l).join('\n')),
    steps: block((sel || 'First step\nSecond step').split('\n').map((l, i) => (i + 1) + '. ' + l).join('\n')), table: block('| Column | Column |\n| --- | --- |\n| Value | Value |'),
    topic: '[[' + value + '|' + (sel || (value.startsWith('chapter:') ? chapterOf(value.slice(8))?.title : handbookPages().find(p => p.id === value)?.title) || value) + ']]', tool: '[[tool:' + value + '|' + (sel || TOOLS.find(t => t[0] === value)?.[1] || value) + ']]' }[kind];
  ta.value = before + out + after; E.edit.body = ta.value; ta.focus(); const pos = (before + out).length; ta.setSelectionRange(pos, pos);
}

async function save(action) {
  const e = E.edit, page = { ...e, id: e.isNew ? (e.id || slug(e.title)) : e.id };
  delete page.isNew; delete page.fromDraft; delete page._key;
  E.busy = true; E.msg = ''; rerender();
  try {
    const j = await api('PUT', { expectedRevision: E.revision, action, page });
    E.revision = j.revision; E.edit = null; E.state = 'idle'; loadEditorData(true); loadHandbook(true);
    toast(action === 'publish' ? 'Published. Readers see it now.' : action === 'review' ? 'Sent for review.' : 'Draft saved. Only editors see it.');
    if (e.isNew) location.hash = action === 'publish' ? '#/handbook/' + page.id : '#/handbook/edit/' + page.id;
  } catch (err) { E.msg = err.message; } finally { E.busy = false; rerender(); }
}
async function act(action, extra = {}) {
  E.busy = true; rerender();
  try { const j = await api('PUT', { expectedRevision: E.revision, action, id: E.edit?.id, ...extra }); E.revision = j.revision; E.edit = null; E.state = 'idle'; loadEditorData(true); loadHandbook(true); toast({ discard: 'Draft discarded.', hide: 'Hidden from readers.', unhide: 'Visible to readers.', restore: 'Restored and published.' }[action]); }
  catch (err) { toast(err.message); } finally { E.busy = false; rerender(); }
}

export function initHandbookEditor(render) {
  rerender = render;
  document.addEventListener('input', e => {
    const k = e.target.dataset?.heF; if (!k || !E.edit) return;
    E.edit[k] = e.target.value;
    if (k === 'title' && E.edit.isNew && !E.edit.idTouched) { E.edit.id = slug(e.target.value); const f = document.querySelector('[data-he-f=id]'); if (f) f.value = E.edit.id; }
    if (k === 'id') E.edit.idTouched = true;
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset?.heF === 'chapter' || t.dataset?.heF === 'trust') { E.edit[t.dataset.heF] = t.value; }
    if (t.dataset?.he === 'topic' && t.value) { insert('topic', t.value); t.value = ''; }
    if (t.dataset?.he === 'tool' && t.value) { insert('tool', t.value); t.value = ''; }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-he]'); if (!b || b.disabled || b.tagName === 'SELECT') return;
    const a = b.dataset.he;
    if (a !== 'save' && a !== 'discard' && a !== 'restore') E.confirm = '';
    if (a === 'reload') { E.state = 'idle'; return render(); }
    if (a === 'mode') { E.preview = b.dataset.v === 'preview'; return render(); }
    if (a === 'ins') return insert(b.dataset.v);
    if (a === 'save') {
      if (b.dataset.v === 'publish' && E.confirm !== 'publish') { E.confirm = 'publish'; return render(); }
      E.confirm = ''; return save(b.dataset.v);
    }
    if (a === 'discard') { if (E.confirm !== 'discard') { E.confirm = 'discard'; return render(); } E.confirm = ''; return act('discard'); }
    if (a === 'vis') return act(entry(E.edit.id)?.hidden ? 'unhide' : 'hide');
    if (a === 'restore') { if (E.confirm !== 'restore' + b.dataset.i) { E.confirm = 'restore' + b.dataset.i; return render(); } E.confirm = ''; return act('restore', { index: Number(b.dataset.i) }); }
  });
}
