// Site design for Arcana Next: one validated settings object the owner edits in Admin › Design
// and publishes for everyone. Pure module, shared by the browser and the server.

const HEX = /^#[0-9a-f]{6}$/i;
export const FONTS = Object.freeze({
  inter: { name: 'Inter', css: "Inter, system-ui, sans-serif", g: 'Inter:wght@400;500;600;700;800' },
  roboto: { name: 'Roboto', css: "Roboto, system-ui, sans-serif", g: 'Roboto:wght@400;500;700;900' },
  rajdhani: { name: 'Rajdhani', css: "Rajdhani, system-ui, sans-serif", g: 'Rajdhani:wght@500;600;700' },
  exo: { name: 'Exo 2', css: "'Exo 2', system-ui, sans-serif", g: 'Exo+2:wght@400;500;600;700;800' },
  cinzel: { name: 'Cinzel', css: "Cinzel, Georgia, serif", g: 'Cinzel:wght@500;600;700' },
  fraunces: { name: 'Fraunces', css: "Fraunces, Georgia, serif", g: 'Fraunces:opsz,wght@9..144,500;9..144,700' }
});
export const CLASS_KEYS = ['warrior', 'archer', 'mage', 'rogue', 'druid'];
const CHOICES = { border: ['none', 'hairline', 'bold'], iconStyle: ['filled', 'outline'], iconTile: ['none', 'circle', 'rounded'], headerAlign: ['center', 'left'], density: ['compact', 'comfortable'] };
const RANGES = { corners: [0, 24], gradients: [0, 100], glow: [0, 100], wordmark: [0, 60] };

// Game look: the in-game class colors, solid glyphs, round class chips.
export const DEFAULT_NEXT_DESIGN = Object.freeze({
  bg: '#1B1C24', card: '#252733', accent: '#8B5CF6', text: '#ECEDF3',
  classColors: Object.freeze({ warrior: '#F04445', archer: '#48A950', mage: '#B32ACD', rogue: '#7A46D5', druid: '#D4A057' }),
  corners: 14, gradients: 35, glow: 15, border: 'hairline', headingFont: 'inter', bodyFont: 'inter',
  iconStyle: 'filled', iconTile: 'circle', headerAlign: 'center', wordmark: 42, density: 'comfortable'
});
export const DESIGN_PRESETS = Object.freeze([
  { id: 'game', name: 'In-game', note: 'Class colors, solid icons, soft depth', design: DEFAULT_NEXT_DESIGN },
  { id: 'night', name: 'Arcane night', note: 'Deep violet, a little glow', design: { ...DEFAULT_NEXT_DESIGN, bg: '#0E0B1A', card: '#1A1530', accent: '#A98BFF', gradients: 55, glow: 40, headingFont: 'cinzel' } },
  { id: 'slate', name: 'Clean slate', note: 'Quiet, flat and sharp', design: { ...DEFAULT_NEXT_DESIGN, bg: '#0D1019', card: '#191E2B', accent: '#7FB2FF', corners: 6, gradients: 0, glow: 0, iconStyle: 'outline', iconTile: 'rounded', headerAlign: 'left' } },
  { id: 'neon', name: 'Neon', note: 'Bright accent, strong glow', design: { ...DEFAULT_NEXT_DESIGN, bg: '#07080F', card: '#11131F', accent: '#13C5F4', gradients: 45, glow: 70, border: 'bold', headingFont: 'rajdhani', bodyFont: 'exo' } }
]);

// Returns a clean design or throws with a plain message (the server shows it to the admin).
export function normalizeNextDesign(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid design.');
  const d = {};
  for (const k of ['bg', 'card', 'accent', 'text']) { if (!HEX.test(raw[k])) throw new Error('Invalid color: ' + k); d[k] = raw[k].toUpperCase(); }
  const cc = raw.classColors || {};
  d.classColors = {};
  for (const k of CLASS_KEYS) { if (!HEX.test(cc[k])) throw new Error('Invalid class color: ' + k); d.classColors[k] = cc[k].toUpperCase(); }
  for (const [k, [lo, hi]] of Object.entries(RANGES)) { const n = Number(raw[k]); if (!Number.isInteger(n) || n < lo || n > hi) throw new Error('Invalid value: ' + k); d[k] = n; }
  for (const [k, list] of Object.entries(CHOICES)) { if (!list.includes(raw[k])) throw new Error('Invalid choice: ' + k); d[k] = raw[k]; }
  for (const k of ['headingFont', 'bodyFont']) { if (!FONTS[raw[k]]) throw new Error('Invalid font: ' + k); d[k] = raw[k]; }
  return d;
}
export const safeNextDesign = raw => { try { return normalizeNextDesign(raw); } catch { return null; } };

// CSS variables for a design. Colors the player picks in their own Theme designer win over these.
export function designVars(d) {
  const v = {
    '--bg': d.bg, '--card': d.card, '--accent': d.accent, '--text': d.text,
    '--r-sm': Math.round(d.corners * .5) + 'px', '--r': Math.round(d.corners * .8) + 'px', '--r-lg': d.corners + 'px',
    '--grad': String(d.gradients), '--glowk': String(d.glow), '--bw': d.border === 'none' ? '0px' : d.border === 'bold' ? '2px' : '1px',
    '--font-h': FONTS[d.headingFont].css, '--sans': FONTS[d.bodyFont].css, '--wm': (d.wordmark / 100) + 'em',
    '--gap': d.density === 'compact' ? '14px' : '20px', '--pad': d.density === 'compact' ? '10px' : '14px'
  };
  for (const k of CLASS_KEYS) v['--c-' + k] = d.classColors[k];
  return v;
}
export const fontHref = d => 'https://fonts.googleapis.com/css2?family=' + [...new Set([d.headingFont, d.bodyFont])].map(f => FONTS[f].g).join('&family=') + '&display=swap';
