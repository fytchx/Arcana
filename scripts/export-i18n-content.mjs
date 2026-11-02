// Export only explicitly approved public editorial content for offline model translation.
// Never include private player posts, account/wiki data or build codes.
import { writeFileSync, mkdirSync } from 'node:fs';
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
mkdirSync('/tmp/arcana-i18n', {recursive:true});
writeFileSync('/tmp/arcana-i18n/source.json', JSON.stringify({schema:1,guides,handbook},null,2)+'\n');
console.log('Editorial source: '+Object.keys(handbook).length+' Handbook pages, '+Object.keys(guides).length+' featured guides');
