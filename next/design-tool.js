// Admin › Design: the owner's site design tool. Every change previews instantly across the whole app
// on this device only (a draft). "Publish" makes it the look everyone gets.
import { esc, ic, CLASS_NAMES } from './core.js';
import { DEFAULT_NEXT_DESIGN, DESIGN_PRESETS, FONTS, CLASS_KEYS, normalizeNextDesign, safeNextDesign } from './design-model.js';

const KEY = 'arcana-next-design-draft-v1';
export const readDraft = () => { try { return safeNextDesign(JSON.parse(localStorage.getItem(KEY))); } catch { return null; } };
const writeDraft = d => { try { d ? localStorage.setItem(KEY, JSON.stringify(d)) : localStorage.removeItem(KEY); } catch { /* private mode */ } };

const S = { state: 'idle', revision: 0, published: null, undo: [], confirm: '', toast: '', busy: false, copied: false };
let rerender = () => {}, apply = () => {}, applyOnly = () => {}, tt;
const toast = m => { S.toast = m; clearTimeout(tt); tt = setTimeout(() => { S.toast = ''; rerender(); }, 2600); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const current = () => readDraft() || S.published || DEFAULT_NEXT_DESIGN;

function load() {
  if (S.state !== 'idle') return;
  S.state = 'loading';
  fetch('/api/admin/site', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(j => { S.revision = j.revision; S.published = safeNextDesign(j.next); S.state = 'ready'; })
    .catch(() => { S.state = 'error'; }).finally(rerender);
}
function change(patch, quiet = false) {
  const before = current();
  let next; try { next = normalizeNextDesign({ ...before, ...patch, classColors: { ...before.classColors, ...(patch.classColors || {}) } }); } catch { return; }
  if (!quiet || !S.dragging) { S.undo.push(before); if (S.undo.length > 60) S.undo.shift(); }
  S.dragging = quiet; writeDraft(next); S.confirm = '';
  quiet ? applyOnly() : apply();
}

const row = (title, note, control) => '<div class="dz-row"><span class="dz-text"><b>' + title + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</span><span class="dz-ctl">' + control + '</span></div>';
const seg = (key, value, opts) => '<span class="dz-seg" role="radiogroup">' + opts.map(([v, l]) => '<button role="radio" aria-checked="' + (v === value) + '" data-dz="set" data-k="' + key + '" data-v="' + v + '">' + l + '</button>').join('') + '</span>';
const slider = (key, value, min, max, left, right) => '<span class="dz-slider"><small>' + left + '</small><input type="range" min="' + min + '" max="' + max + '" value="' + value + '" data-dz-range="' + key + '" aria-label="' + key + '"><small>' + right + '</small></span>';
const color = (key, value, cls) => '<input class="dz-color" type="color" value="' + esc(value.toLowerCase()) + '" data-dz-color="' + key + '"' + (cls ? ' data-cls="' + cls + '"' : '') + ' aria-label="' + esc(cls || key) + ' color">';

export function designView(user) {
  if (!user?.permissions?.manageSite) return '<div class="nx-empty"><strong>Admins only</strong><p>The site design tool is for Arcana admins.</p><a class="nx-btn" href="#/profile">Back to Profile</a></div>';
  load();
  const d = current(), draft = readDraft(), live = S.published || DEFAULT_NEXT_DESIGN, dirty = !!draft && !same(draft, live);
  const status = dirty ? '<span class="dz-status dz-draft">Draft · only you see this</span>' : '<span class="dz-status">Matches what everyone sees</span>';
  const presets = DESIGN_PRESETS.map(p => '<button class="dz-preset" aria-pressed="' + same(normalizeNextDesign(p.design), d) + '" data-dz="preset" data-id="' + p.id + '" style="--pb:' + p.design.bg + ';--pc:' + p.design.card + ';--pa:' + p.design.accent + '"><span class="dz-pv"><i></i><i></i><i></i></span><b>' + esc(p.name) + '</b><small>' + esc(p.note) + '</small></button>').join('');
  const sample = '<div class="dz-sample" aria-label="Preview"><div class="dz-chips">' + CLASS_KEYS.map(k => '<span class="dz-chip" style="--cc:var(--c-' + k + ')">' + ic('class-' + k, 16) + CLASS_NAMES[CLASS_KEYS.indexOf(k) + 1] + '</span>').join('') + '</div>' +
    '<div class="nx-grid3">' + [['upgrade', 'Pathfinder'], ['studio', 'Build Studio'], ['codex', 'Codex']].map(([i, l]) => '<span class="nx-tile">' + '<span class="nx-ic">' + ic(i, 22) + '</span><span>' + l + '</span></span>').join('') + '</div>' +
    '<span class="nx-btn nx-btn-primary">Primary button</span></div>';
  return '<a class="nx-back" href="#/admin">‹ Admin</a><header class="dz-head"><span><span class="nx-kicker">ADMIN · SITE DESIGN</span><h1>Design Arcana</h1></span>' + status + '</header>' +
    '<p class="nx-fine">Every change shows across the whole app right away, but only on this device. Browse other pages to see it, then Publish when you like it.</p>' +
    sample +
    '<section><h2 class="nx-label">1 · Start from a style</h2><div class="dz-presets">' + presets + '</div></section>' +
    '<section><h2 class="nx-label">2 · Colors</h2><div class="dz-card">' +
      row('Background', 'Behind everything', color('bg', d.bg)) + row('Cards', 'Panels, rows and tiles', color('card', d.card)) +
      row('Accent', 'Buttons, links, highlights', color('accent', d.accent)) + row('Text', 'Main text color', color('text', d.text)) + '</div></section>' +
    '<section><h2 class="nx-label">3 · Class colors</h2><div class="dz-card">' + CLASS_KEYS.map(k => row('<span class="dz-clsname" style="color:var(--c-' + k + ')">' + ic('class-' + k, 18) + CLASS_NAMES[CLASS_KEYS.indexOf(k) + 1] + '</span>', '', color('cls', d.classColors[k], k))).join('') + '</div></section>' +
    '<section><h2 class="nx-label">4 · Shape and depth</h2><div class="dz-card">' +
      row('Corners', d.corners + ' px', slider('corners', d.corners, 0, 24, 'Sharp', 'Round')) +
      row('Gradients', d.gradients ? d.gradients + '%' : 'Off', slider('gradients', d.gradients, 0, 100, 'Flat', 'Rich')) +
      row('Glow', d.glow ? d.glow + '%' : 'Off', slider('glow', d.glow, 0, 100, 'None', 'Bright')) +
      row('Borders', 'Edges around cards', seg('border', d.border, [['none', 'None'], ['hairline', 'Thin'], ['bold', 'Bold']])) + '</div></section>' +
    '<section><h2 class="nx-label">5 · Text</h2><div class="dz-card">' +
      row('Headings', 'Titles and big numbers', '<select class="dz-select" data-dz-font="headingFont">' + Object.entries(FONTS).map(([k, f]) => '<option value="' + k + '"' + (k === d.headingFont ? ' selected' : '') + '>' + f.name + '</option>').join('') + '</select>') +
      row('Body', 'Everything else', '<select class="dz-select" data-dz-font="bodyFont">' + Object.entries(FONTS).map(([k, f]) => '<option value="' + k + '"' + (k === d.bodyFont ? ' selected' : '') + '>' + f.name + '</option>').join('') + '</select>') +
      row('Logo letter spacing', 'The ARCANA wordmark', slider('wordmark', d.wordmark, 0, 60, 'Tight', 'Wide')) +
      row('Header', 'Where the logo sits', seg('headerAlign', d.headerAlign, [['center', 'Center'], ['left', 'Left']])) + '</div></section>' +
    '<section><h2 class="nx-label">6 · Icons and spacing</h2><div class="dz-card">' +
      row('Icon style', 'Solid like the game, or outline', seg('iconStyle', d.iconStyle, [['filled', 'Solid'], ['outline', 'Outline']])) +
      row('Icon background', 'The shape behind tool icons', seg('iconTile', d.iconTile, [['none', 'None'], ['circle', 'Circle'], ['rounded', 'Square']])) +
      row('Spacing', 'How much room between things', seg('density', d.density, [['compact', 'Compact'], ['comfortable', 'Roomy']])) + '</div></section>' +
    '<div class="dz-bar"><button class="nx-btn" data-dz="undo"' + (S.undo.length ? '' : ' disabled') + '>Undo</button>' +
      '<button class="nx-btn" data-dz="discard"' + (draft ? '' : ' disabled') + '>' + (S.confirm === 'discard' ? 'Tap to confirm' : 'Discard draft') + '</button>' +
      '<button class="nx-btn" data-dz="copy">' + (S.copied ? 'Copied' : 'Copy settings') + '</button>' +
      '<button class="nx-btn nx-btn-primary" data-dz="publish"' + (dirty && !S.busy && S.state === 'ready' ? '' : ' disabled') + '>' + (S.busy ? 'Publishing…' : S.confirm === 'publish' ? 'Tap again to publish' : 'Publish') + '</button></div>' +
    (S.state === 'error' ? '<p class="st-err">Couldn’t load the published design. You can still try things here, but Publish is off.</p>' : '') +
    (S.toast ? '<div class="st-toast" role="status">' + esc(S.toast) + '</div>' : '');
}

export function initDesign(render, applyAll) {
  rerender = render; applyOnly = applyAll; apply = () => { applyAll(); render(); };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-dz]'); if (!b || b.disabled) return;
    const a = b.dataset.dz;
    if (a !== 'publish' && a !== 'discard') S.confirm = '';
    if (a === 'set') return change({ [b.dataset.k]: b.dataset.v });
    if (a === 'preset') { const p = DESIGN_PRESETS.find(x => x.id === b.dataset.id); return p && change(p.design); }
    if (a === 'undo') { const prev = S.undo.pop(); if (prev) { writeDraft(prev); apply(); } return; }
    if (a === 'discard') { if (S.confirm !== 'discard') { S.confirm = 'discard'; return render(); } S.confirm = ''; S.undo = []; writeDraft(null); return apply(); }
    if (a === 'copy') { const text = JSON.stringify(current(), null, 1); (navigator.clipboard?.writeText(text) || Promise.reject()).then(() => { S.copied = true; render(); setTimeout(() => { S.copied = false; render(); }, 2000); }).catch(() => toast('Copy was blocked by the browser.')); return; }
    if (a === 'publish') {
      if (S.confirm !== 'publish') { S.confirm = 'publish'; return render(); }
      S.confirm = ''; S.busy = true; render();
      fetch('/api/admin/site', { method: 'PUT', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ section: 'next', expectedRevision: S.revision, next: current() }) })
        .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(r.status === 409 ? 'Someone else changed site settings. Reload, then publish again.' : j.error || 'Publish failed.'); return j; })
        .then(j => { S.revision = j.revision; S.published = safeNextDesign(j.next); writeDraft(null); S.undo = []; toast('Published. Everyone sees this design now.'); apply(); })
        .catch(err => toast(err.message)).finally(() => { S.busy = false; render(); });
    }
  });
  document.addEventListener('input', e => {
    const t = e.target, ds = t.dataset || {};
    // While dragging a slider or picking a color, restyle only; the page redraws when you let go.
    if (ds.dzRange) change({ [ds.dzRange]: Number(t.value) }, true);
    else if (ds.dzColor === 'cls') change({ classColors: { [ds.cls]: t.value } }, true);
    else if (ds.dzColor) change({ [ds.dzColor]: t.value }, true);
  });
  document.addEventListener('change', e => { const ds = e.target.dataset || {}; if (ds.dzFont) change({ [ds.dzFont]: e.target.value }); else if (ds.dzRange || ds.dzColor) { S.dragging = false; render(); } });
}
