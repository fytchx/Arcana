// Arcana Handbook: chapters of short, trusted pages about IdleArc, linked to each other.
// A highlighted topic opens a compact preview; tap outside to close, enlarge to read it all,
// or open the page and come straight back to where you were.
import { esc, ic } from './core.js';
import { CHAPTERS, PAGES, HANDBOOK_VERSION } from './handbook-content.js';
import { editorialTranslation, editorialControl } from './i18n-content.js';
import { getLocale, translateEnglish } from './i18n.js';

// Pages come from the server (edited in the site); the seed file is the fallback until they load.
let LIVE = PAGES, byId = new Map(LIVE.map(p => [p.id, p])), loadState = 'idle';
export function setHandbookPages(list) { LIVE = Array.isArray(list) && list.length ? list : PAGES; byId = new Map(LIVE.map(p => [p.id, p])); }
export function loadHandbook(force) {
  if (!force && loadState !== 'idle') return;
  loadState = 'loading';
  fetch('/api/handbook', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { if (j?.pages) setHandbookPages(j.pages); loadState = 'ready'; rerender(); }).catch(() => { loadState = 'idle'; });
}
const chapterOf = id => CHAPTERS.find(c => c.id === id);
const pagesIn = ch => LIVE.filter(p => p.chapter === ch);
export const handbookPages = () => LIVE;
export const pageById = id => byId.get(id);
export { chapterOf, inline as hbInline };
export const handbookChapters = () => CHAPTERS;
const TOOLS = { studio: '#/studio', builds: '#/builds', pathfinder: '#/tools/pathfinder', mlxp: '#/tools/mlxp', pets: '#/tools/pet', guildtree: '#/tools/guild-tree', lfg: '#/lfg', retaliation: '#/tools/retaliation', petaffix: '#/tools/affix', guides: '#/builds/guides' };
const TRUST = { verified: ['Verified', 'ok'], config: ['Game data', 'cfg'], estimated: ['Estimated', 'est'], legacy: ['Legacy', 'old'] };

let rerender = () => {}, currentUser = () => null;
const H = { pop: null, big: false };
const BACK = 'arcana-hb-back-v1';

// ---------- text ----------
function inline(t) {
  return esc(String(t).replace(/\u0001/g, '|')).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[\[([a-z]+:)?([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (_, kind, id, words) => {
    kind = (kind || '').slice(0, -1);
    if (kind === 'tool') return '<a class="hb-tool" href="' + (TOOLS[id] || '#/tools') + '">' + (words || id) + ' ›</a>';
    if (kind === 'chapter') { const c = chapterOf(id); return c ? '<a class="hb-link" data-hb="chapter:' + id + '" href="#/handbook/chapter/' + id + '">' + (words || esc(translateEnglish(c.title))) + '</a>' : (words || id); }
    const p = byId.get(id);
    return p ? '<a class="hb-link" data-hb="' + id + '" href="#/handbook/' + id + '">' + (words || esc(editorialTranslation('handbook', p).doc.title)) + '</a>' : (words || id);
  }).replace(/\[([^\[\]]+)\]\(((?:#\/|https:\/\/)[^\s()<>"]+)\)/g, (_, words, href) =>
    // Plain links: inside the site (#/...) or to https pages only, which open in a new tab.
    '<a href="' + href + '"' + (href.startsWith('#') ? '' : ' target="_blank" rel="noopener noreferrer"') + '>' + words + '</a>');
}
export function hbText(src) {
  let section = 'Reference details';
  return String(src || '').trim().split(/\n\s*\n/).map(block => {
    const t = block.trim(), lines = t.split('\n');
    if (t.startsWith('## ')) { section = t.slice(3); return '<h2>' + inline(section) + '</h2>'; }
    if (t.startsWith('### ')) { section = t.slice(4); return '<h3>' + inline(section) + '</h3>'; }
    if (lines.every(l => l.startsWith('>'))) return '<p class="hb-note">' + lines.map(l => inline(l.replace(/^>\s?/, ''))).join('<br>') + '</p>';
    // "Table: caption" as the first line folds the table away behind an inviting summary row.
    const caption = /^Table: /.test(lines[0]) && lines.length > 2 ? lines[0].slice(7).trim() : null;
    const tl = caption ? lines.slice(1) : lines;
    if (tl.every(l => /^\|.*\|$/.test(l.trim())) && tl.length > 1) {
      const rows = tl.filter(l => !/^\|\s*-/.test(l.trim())).map(l => l.trim().replace(/\[\[[^\]]*\]\]/g, m => m.replace('|', '\u0001')).slice(1, -1).split('|').map(c => c.trim()));
      const table = '<div class="hb-tablewrap"><table class="hb-table"><thead><tr>' + rows[0].map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
        rows.slice(1).map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
      // Large reference tables remain complete but no longer dominate a phone screen.
      const autoFold = rows.length > 13 || rows[0].length > 5;
      const foldTitle = caption || section;
      return (caption || autoFold) ? '<details class="hb-fold"><summary><span class="hb-fold-t">' + inline(foldTitle) + '</span><span class="hb-fold-n">' + (rows.length - 1) + ' rows</span></summary>' + table + '</details>' : table;
    }
    if (lines.every(l => l.startsWith('- '))) return '<ul>' + lines.map(l => '<li>' + inline(l.slice(2)) + '</li>').join('') + '</ul>';
    if (lines.every(l => /^\d+\. /.test(l))) return '<ol>' + lines.map(l => '<li>' + inline(l.replace(/^\d+\. /, '')) + '</li>').join('') + '</ol>';
    return '<p>' + lines.map(inline).join('<br>') + '</p>';
  }).join('');
}
const trustChip = (p, translated) => { if (translated) return '<span class="hb-trust hb-est">' + esc(translateEnglish('Unreviewed translation')) + '</span>'; const [l, k] = TRUST[p.trust] || TRUST.config; return '<span class="hb-trust hb-' + k + '">' + l + ' · ' + esc(p.version || HANDBOOK_VERSION) + '</span>'; };

// ---------- views ----------
export function handbookHomeSection() {
  return '<section><div class="nx-head"><h2 class="nx-label">Handbook</h2><span class="nx-fine">IdleArc ' + HANDBOOK_VERSION + '</span></div><div class="hb-chapters">' +
    CHAPTERS.map(c => { const n = pagesIn(c.id).length; return '<a class="hb-ch' + (n ? '' : ' hb-soon') + '" href="#/handbook/chapter/' + c.id + '"><span class="nx-ic">' + ic(c.icon, 20) + '</span><span><b>' + c.n + ' · ' + esc(translateEnglish(c.title)) + '</b><small>' + esc(translateEnglish(c.ask)) + '</small></span></a>'; }).join('') + '</div></section>';
}
function backChip() {
  let b; try { b = JSON.parse(sessionStorage.getItem(BACK)); } catch { b = null; }
  return b && b.hash !== location.hash ? '<button class="hb-back" data-hbact="back">‹ Back to ' + esc(b.title || 'where you were') + '</button>' : '';
}
export function handbookView(id) {
  loadHandbook();
  if (!id) return '<a class="nx-back" href="#/codex">‹ Search</a>' + handbookHomeSection();
  if (id.startsWith('chapter/')) {
    const c = chapterOf(id.slice(8));
    if (!c) return '<div class="nx-empty"><strong>Chapter not found</strong><a class="nx-btn" href="#/codex">Handbook</a></div>';
    const pages = pagesIn(c.id);
    return backChip() + '<a class="nx-back" href="#/codex">‹ Handbook</a><header class="hb-head"><span class="nx-kicker">CHAPTER ' + c.n + '</span><h1>' + esc(translateEnglish(c.title)) + '</h1><p>' + esc(translateEnglish(c.ask)) + '</p></header>' +
      (pages.length ? '<div class="nx-list">' + pages.map((p, i) => '<a class="nx-row" href="#/handbook/' + p.id + '"><span class="hb-num">' + (i + 1) + '</span><span class="nx-row-text"><strong>' + esc(editorialTranslation('handbook',p).doc.title) + '</strong><small>' + esc(editorialTranslation('handbook',p).doc.answer.replace(/^In game: /, '')) + '</small></span><span class="nx-row-end">›</span></a>').join('') + '</div>'
        : '<div class="nx-empty"><strong>Being written</strong><p>This chapter is next on the list.</p></div>') +
      (currentUser()?.permissions?.editHandbook ? '<a class="nx-btn" href="#/handbook/new/' + c.id + '">+ Add a page to this chapter</a>' : '') +
      (c.lists ? '<section><h2 class="nx-label">Look it up</h2><div class="nx-chips">' + c.lists.map(k => '<a class="nx-chip" href="#/codex?kind=' + k + '">' + esc(k.replace(/-/g, ' ')) + '</a>').join('') + '</div></section>' : '');
  }
  const original = byId.get(id);
  if (!original) return '<div class="nx-empty"><strong>Page not found</strong><p>It may have moved.</p><a class="nx-btn" href="#/codex">Handbook</a></div>';
  const {doc:p, translated} = editorialTranslation('handbook', original);
  const c = chapterOf(p.chapter), list = pagesIn(p.chapter), i = list.indexOf(original), nx = p.next ? byId.get(p.next) : list[i + 1];
  return backChip() + '<a class="nx-back" href="#/handbook/chapter/' + c.id + '">‹ ' + esc(translateEnglish(c.title)) + '</a>' +
    '<article class="hb-page"' + (p.cls ? ' style="--cc:var(--c-' + p.cls + ')"' : '') + '><header class="hb-head"><span class="nx-kicker">' + esc(translateEnglish('CHAPTER ' + c.n + ' · ' + c.title.toUpperCase())) + '</span><h1>' + esc(p.title) + '</h1>' + trustChip(p, translated) + '</header>' +
    editorialControl('handbook', p.id, translated) +
    '<p class="hb-answer">' + inline(p.answer) + '</p>' + (translated ? '<div lang="' + getLocale() + '">' + hbText(p.body) + '</div>' : hbText(p.body)) + '</article>' +
    (currentUser()?.permissions?.editHandbook ? '<a class="nx-btn hb-editbtn" href="#/handbook/edit/' + p.id + '">Edit this page</a>' : '') +
    (nx ? '<a class="hb-next" href="#/handbook/' + nx.id + '"><small>Next</small><b>' + esc(editorialTranslation('handbook', nx).doc.title) + '</b><span>›</span></a>' : '') +
    '<p class="nx-fine">Something wrong on this page? <a href="#/feedback">Tell us</a>.</p>';
}

// The preview popup: compact by default, enlarges to the whole topic.
export function handbookPopup() {
  if (!H.pop) return '';
  const [kind, id] = H.pop.includes(':') ? H.pop.split(':') : ['page', H.pop];
  let title, lead, body, href;
  if (kind === 'chapter') { const c = chapterOf(id); if (!c) return ''; title = translateEnglish(c.title); lead = esc(translateEnglish(c.ask)); href = '#/handbook/chapter/' + id; body = '<ul>' + pagesIn(id).map(p => '<li>' + inline('[[' + p.id + ']]') + '</li>').join('') + '</ul>'; }
  else { const o = byId.get(id); if (!o) return ''; const p = editorialTranslation('handbook', o).doc; title = p.title; lead = inline(p.answer); href = '#/handbook/' + id; body = hbText(p.body); }
  return '<div class="hb-scrim' + (H.big ? ' big' : '') + '" data-hbact="close"></div><div class="hb-pop' + (H.big ? ' big' : '') + '" role="dialog" aria-label="' + esc(title) + '">' +
    '<div class="hb-pophead"><b>' + esc(title) + '</b>' + (H.big ? '<button class="nx-iconbtn" data-hbact="close" aria-label="Close">✕</button>' : '<button class="hb-popbtn" data-hbact="big" aria-label="Enlarge">⤢</button>') + '</div>' +
    '<p class="hb-answer">' + lead + '</p>' + (H.big ? '<div class="hb-popbody">' + body + '</div>' : '') +
    '<div class="hb-popfoot">' + (H.big ? '' : '<button class="hb-popbtn" data-hbact="big">Read more</button>') + '<a class="hb-popbtn hb-go" data-hbact="go" href="' + href + '">Open page ›</a></div></div>';
}

export function initHandbook(render, getUser) {
  rerender = render; if (getUser) currentUser = getUser;
  document.addEventListener('click', e => {
    const link = e.target.closest('.hb-link');
    if (link && !e.target.closest('.hb-pop.big')) { e.preventDefault(); H.pop = link.dataset.hb; H.big = false; return render(); }
    if (link) { H.pop = link.dataset.hb; return render(); } // links inside an enlarged popup switch topics
    const a = e.target.closest('[data-hbact]'); if (!a) return;
    const act = a.dataset.hbact;
    if (act === 'close') { H.pop = null; H.big = false; return render(); }
    if (act === 'big') { H.big = true; return render(); }
    if (act === 'go') {
      // Remember where the reader was, so the new page can offer a way straight back.
      const title = document.querySelector('.hb-head h1, .nx-page-head h1')?.textContent || document.title;
      try { sessionStorage.setItem(BACK, JSON.stringify({ hash: location.hash || '#/home', y: scrollY, title })); } catch { /* private mode */ }
      H.pop = null; H.big = false; return; // the link itself navigates
    }
    if (act === 'back') {
      let b; try { b = JSON.parse(sessionStorage.getItem(BACK)); sessionStorage.removeItem(BACK); } catch { b = null; }
      if (b) { location.hash = b.hash; setTimeout(() => scrollTo(0, b.y || 0), 60); }
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && H.pop) { H.pop = null; H.big = false; render(); } });
  window.addEventListener('hashchange', () => { if (H.pop) { H.pop = null; H.big = false; } });
}
