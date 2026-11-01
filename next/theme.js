// Theme designer for Arcana Next.
// Colors plus an optional backdrop drawn by the Arcana vector art system (src/visual-art.js),
// recolored live from the player's palette. Saved on this device only.
import { esc } from './core.js';

export const THEME_KEY = 'arcana-next-theme-v1';
const HEX = /^#[0-9a-f]{6}$/i;
const clamp = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };

// Pure helpers (tested): color math and validation.
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('').toUpperCase();
export const mix = (a, b, t) => toHex(rgb(a).map((x, i) => x + (rgb(b)[i] - x) * t));
export const luminance = h => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
export const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };

export function normalizeTheme(raw) {
  if (!raw || typeof raw !== 'object' || !HEX.test(raw.bg) || !HEX.test(raw.card) || !HEX.test(raw.accent)) return null;
  return {
    bg: raw.bg.toUpperCase(), card: raw.card.toUpperCase(), accent: raw.accent.toUpperCase(),
    accent2: HEX.test(raw.accent2) ? raw.accent2.toUpperCase() : raw.accent.toUpperCase(),
    art: typeof raw.art === 'string' && /^vision-[a-z0-9-]{2,40}$/.test(raw.art) ? raw.art : null,
    strength: clamp(raw.strength, 10, 100, 55), match: raw.match !== false,
    artColors: Array.isArray(raw.artColors) && raw.artColors.length === 4 && raw.artColors.every(c => HEX.test(c)) ? raw.artColors : null,
    preset: typeof raw.preset === 'string' ? raw.preset.slice(0, 60) : ''
  };
}
// The CSS variables a theme sets. Text stays light; the accent ink is lifted until it reads on the card.
export function themeVars(t) {
  let ink = mix(t.accent, '#FFFFFF', .35);
  for (let i = 0; i < 4 && contrast(ink, t.card) < 4.5; i++) ink = mix(ink, '#FFFFFF', .35);
  return { bg: t.bg, card: t.card, line: mix(t.card, '#FFFFFF', .12), accent: t.accent, ink, on: luminance(t.accent) > .4 ? '#140F2A' : '#FFFFFF' };
}
export const readTheme = () => { try { return normalizeTheme(JSON.parse(localStorage.getItem(THEME_KEY))); } catch { return null; } };
export const saveTheme = t => { try { t ? localStorage.setItem(THEME_KEY, JSON.stringify(t)) : localStorage.removeItem(THEME_KEY); } catch { /* private mode */ } };

// ---------- vector backdrop ----------
let VA = null, PR = null;
const loadArt = () => VA ? Promise.resolve(VA) : import('../src/visual-art.js').then(m => (VA = m));
const loadPresets = () => PR ? Promise.resolve(PR) : import('../src/studio-v2-presets.js').then(m => (PR = m));
const blobs = new Map();
// artUrl returns a CSS url("data:...") string. Turn it into a short blob: URL so the DOM stays small.
function artBlob(id, values) {
  const css = VA.artUrl(id, values); if (!css) return null;
  if (blobs.has(css)) return blobs.get(css);
  const svg = decodeURIComponent(css.slice('url("data:image/svg+xml,'.length, -2));
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  if (blobs.size > 60) { for (const u of blobs.values()) URL.revokeObjectURL(u); blobs.clear(); }
  blobs.set(css, url); return url;
}
const artValues = (t, id) => {
  const own = VA.visualArtById(id)?.colors || [];
  const c = t.match ? [t.bg, t.accent, t.accent2, mix(t.accent, '#FFFFFF', .6)] : (t.art === id && t.artColors) || own;
  return { artBase: c[0], artPrimary: c[1], artSecondary: c[2], artGlow: c[3] };
};
export function applyBackdrop(t) {
  const root = document.documentElement.style;
  if (!t?.art) { root.removeProperty('--backdrop'); root.removeProperty('--backdrop-op'); return; }
  loadArt().then(() => {
    const url = artBlob(t.art, { ...artValues(t, t.art), artStrength: 100 });
    if (url) { root.setProperty('--backdrop', 'url(' + url + ')'); root.setProperty('--backdrop-op', String(t.strength / 100)); }
  }).catch(() => {});
}

// ---------- designer view ----------
const D = { all: false, ready: false, confirm: false };
let rerender = () => {}, apply = () => {};
const DEFAULT = { bg: '#0D1019', card: '#191E2B', accent: '#A98BFF', accent2: '#38BDF8', art: null, strength: 55, match: true, preset: 'arcana' };
const FEATURED_PRESETS = ['astral-veil', 'chromatic-chapel', 'midnight-codex', 'runic-tide', 'royal-sigil', 'emerald-signal', 'bloodmoon-rite', 'frost-sanctum', 'forged-gold', 'moonwater', 'velvet-dusk', 'neon-rift', 'black-ink', 'solar-ritual', 'jade-circuit', 'sapphire-fold'];

export function themeView() {
  if (!D.ready) { Promise.all([loadArt(), loadPresets()]).then(() => { D.ready = true; rerender(); }); return '<a class="nx-back" href="#/profile">‹ Profile</a><div class="nx-loading">Loading the theme designer…</div>'; }
  const t = readTheme() || DEFAULT, v = themeVars(t);
  const P = PR.STUDIO_V2_PRESETS, ids = D.all ? PR.STUDIO_V2_PRESET_IDS : FEATURED_PRESETS.filter(id => P[id]);
  const presets = ids.map(id => { const p = P[id]; return '<button class="th-preset" aria-pressed="' + (t.preset === id) + '" data-th="preset" data-id="' + esc(id) + '"><span class="th-dots">' + [p.main, p.card, p.action, p.secondaryAccent].map(c => '<i style="background:' + esc(c) + '"></i>').join('') + '</span><b>' + esc(p.name) + '</b></button>'; }).join('');
  const color = (k, l, note) => '<label class="th-color"><input type="color" value="' + esc(t[k].toLowerCase()) + '" data-th-color="' + k + '" id="th-' + k + '"><span><b>' + l + '</b><small>' + esc(note || t[k]) + '</small></span></label>';
  const low = contrast(v.ink, t.card) < 4.5;
  const arts = [{ id: '', name: 'None' }, ...VA.VISUAL_ART].map(a => '<button class="th-art" aria-pressed="' + ((t.art || '') === a.id) + '" data-th="art" data-id="' + esc(a.id) + '"' +
    (a.id ? ' style="background-image:url(' + artBlob(a.id, { ...artValues(t, a.id), artDetail: 40 }) + ')"' : '') + '><span>' + esc(a.name) + '</span></button>').join('');
  return '<a class="nx-back" href="#/profile">‹ Profile</a><header class="nx-page-head"><span class="nx-kicker">THEME DESIGNER</span><h1>Make Arcana yours</h1><p>Start from a preset, then tune the colors and backdrop. Changes show across the whole app and stay on this device.</p></header>' +
    '<div class="th-preview"><span class="nx-kicker">PREVIEW</span><strong>Your theme</strong><small>Cards, buttons and links use these colors.</small><span class="th-prow"><a class="nx-btn nx-btn-primary" tabindex="-1">Button</a><a tabindex="-1">A link</a><span class="nx-tag nx-tag-accent">Tag</span></span></div>' +
    '<section><div class="nx-head"><h2 class="nx-label">Presets</h2><button class="nx-link" data-th="all">' + (D.all ? 'Show fewer' : 'Show all ' + PR.STUDIO_V2_PRESET_IDS.length) + '</button></div><div class="th-presets">' + presets + '</div></section>' +
    '<section><h2 class="nx-label">Colors</h2><div class="nx-card th-colors">' + color('bg', 'Background') + color('card', 'Cards') + color('accent', 'Accent') + color('accent2', 'Second accent', 'Used in the backdrop art') +
    (low ? '<p class="nx-fine th-warn">Accent text is hard to read on these cards, so Arcana lightens it for you.</p>' : '') +
    '<p class="nx-fine">Rarity, class and rune colors never change, so they always mean the same thing.</p></div></section>' +
    '<section><h2 class="nx-label">Backdrop</h2><div class="th-arts">' + arts + '</div>' +
    (t.art ? '<div class="nx-card th-artctl"><label class="th-range"><span><b>Strength</b><small>' + t.strength + '%</small></span><input type="range" min="10" max="100" step="5" value="' + t.strength + '" data-th-strength id="th-strength" aria-label="Backdrop strength"></label>' +
      '<label class="st-switch"><input type="checkbox" data-th-match' + (t.match ? ' checked' : '') + ' id="th-match"><span></span>Color the art with my theme</label></div>' : '') + '</section>' +
    '<button class="nx-btn" data-th="reset">' + (D.confirm ? 'Tap again to reset' : 'Reset to Arcana default') + '</button>';
}

export function initTheme(render, applyAll) {
  rerender = render; apply = applyAll;
  const set = patch => { const next = normalizeTheme({ ...(readTheme() || DEFAULT), ...patch }); saveTheme(next); apply(); rerender(); };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-th]'); if (!b) return;
    const a = b.dataset.th;
    if (a !== 'reset') D.confirm = false;
    if (a === 'all') { D.all = !D.all; return rerender(); }
    if (a === 'preset') {
      const p = PR.STUDIO_V2_PRESETS[b.dataset.id]; if (!p) return;
      return set({ preset: b.dataset.id, bg: p.main, card: p.card, accent: p.action, accent2: p.secondaryAccent, art: p.pattern || null, artColors: [p.artBase, p.artPrimary, p.artSecondary, p.artGlow], match: false, strength: 55 });
    }
    if (a === 'art') return set({ art: b.dataset.id || null });
    if (a === 'reset') { if (!D.confirm) { D.confirm = true; return rerender(); } D.confirm = false; saveTheme(null); apply(); return rerender(); }
  });
  document.addEventListener('input', e => {
    const d = e.target.dataset || {};
    if (d.thColor) { const t = normalizeTheme({ ...(readTheme() || DEFAULT), [d.thColor]: e.target.value, preset: '' }); saveTheme(t); apply(); }
    if (d.thStrength !== undefined) { const t = normalizeTheme({ ...(readTheme() || DEFAULT), strength: e.target.value }); saveTheme(t); apply(); }
  });
  document.addEventListener('change', e => {
    const d = e.target.dataset || {};
    if (d.thColor || d.thStrength !== undefined) rerender();
    if (d.thMatch !== undefined) set({ match: e.target.checked });
  });
}
