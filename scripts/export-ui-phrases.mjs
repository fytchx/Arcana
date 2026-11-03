// Builds next/ui-locales/<lang>.json: every player-facing interface phrase that the hand-written
// dictionaries and game term packs do not translate yet. Translators fill the empty values.
// Re-run after adding interface text: filled values are kept, new phrases are added as "",
// and phrases that no longer exist (or are now translated elsewhere) are dropped.
// Usage: node scripts/export-ui-phrases.mjs
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { translateEnglish, SUPPORTED_LANGUAGES } from '../next/i18n.js';

// Owner and editor screens: only the site team sees these.
const SKIP = new Set(['admin.js', 'design-tool.js', 'handbook-editor.js', 'guides-content.js', 'handbook-content.js']);
const phrases = new Set();
for (const file of readdirSync('next').filter(x => x.endsWith('.js') && !x.startsWith('i18n') && !SKIP.has(x))) {
  const code = readFileSync('next/' + file, 'utf8');
  for (const m of code.matchAll(/'([^'\\\n]{3,150})'|"([^"\\\n]{3,150})"/g)) {
    const str = (m[1] || m[2] || '').trim();
    if (!/^[A-Z][A-Za-z ,.:;!?’–—()\/%+0-9-]{2,149}$/.test(str) || !/[a-z]{2}/.test(str)) continue;
    if (str.includes('://') || /^([A-Z][a-z]?|[A-Z_0-9]{2,}|[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.test(str)) continue;
    phrases.add(str);
  }
}
const sorted = [...phrases].sort();
for (const { code } of SUPPORTED_LANGUAGES.filter(x => x.code !== 'en')) {
  const terms = (await import('../next/game-locales/' + code + '.js')).GAME_TERM_ADDON;
  const path = 'next/ui-locales/' + code + '.json';
  const old = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')).phrases || {} : {};
  const out = {};
  for (const p of sorted) {
    if (terms[p]) continue;                      // game names: handled by the term pack
    if (translateEnglish(p, code) !== p) continue; // already hand-translated
    out[p] = typeof old[p] === 'string' ? old[p] : '';
  }
  const filled = Object.values(out).filter(Boolean).length;
  writeFileSync(path, JSON.stringify({ language: code, schema: 1, phrases: out }, null, 2) + '\n');
  console.log(code + ': ' + Object.keys(out).length + ' phrases, ' + filled + ' translated');
}
