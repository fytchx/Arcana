// Export only explicitly approved public editorial content for offline model translation.
// Never include private player posts, account/wiki data or build codes.
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { FEATURED_GUIDES } from '../next/guides-content.js';
import { PAGES } from '../next/handbook-content.js';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const guides = Object.fromEntries(FEATURED_GUIDES.map(({id, title, summary, body}) => {
  const source = {title, summary, body};
  return [id, {...source, sourceHash: hash(source)}];
}));
const handbook = Object.fromEntries(PAGES.map(({id, title, answer, body}) => {
  const source = {title, answer, body};
  return [id, {...source, sourceHash:hash(source)}];
}));
// Catch hardcoded user-facing UI labels that are not in the curated dictionary yet.
// Only plain English string literals are candidates. Markup, paths, identifiers,
// numerical formulas and editor/player content are never translated by this pass.
const uiStrings = new Set();
for (const file of readdirSync('next').filter(x => x.endsWith('.js') && !x.startsWith('i18n') && !['guides-content.js','handbook-content.js'].includes(x))) {
  const code = readFileSync('next/'+file,'utf8');
  for (const m of code.matchAll(/'([^'\\\\\\n]{3,150})'|"([^"\\\\\\n]{3,150})"/g)) {
    const str = (m[1] || m[2] || '').trim();
    if (!/^[A-Z][A-Za-z ,.:;!?\u2019\u2013\u2014()\/%+0-9-]{2,149}$/.test(str) || !/[a-z]{2}/.test(str)) continue;
    if (str.includes('://') || /^([A-Z][a-z]?|[A-Z_0-9]{2,}|[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)$/.test(str)) continue;
    uiStrings.add(str);
  }
}
mkdirSync('/tmp/arcana-i18n', {recursive:true});
writeFileSync('/tmp/arcana-i18n/source.json', JSON.stringify({schema:1,guides,handbook,uiStrings:[...uiStrings].sort()},null,2)+'\n');
console.log('Editorial source: '+Object.keys(handbook).length+' Handbook pages, '+Object.keys(guides).length+' featured guides; '+uiStrings.size+' UI phrase candidates');
