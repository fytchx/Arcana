// Formatting operations shared by the /next player guide editor.
// Keep output in the same limited Markdown syntax understood by hbText().
export const GUIDE_TOOL_OPTIONS = [
  ['studio', 'Build Studio'], ['builds', 'Builds'], ['pathfinder', 'Pathfinder'],
  ['mlxp', 'Monster Level XP'], ['pets', 'Pet tools'], ['guildtree', 'Guild tree'],
  ['retaliation', 'Retaliation calculator'], ['petaffix', 'Pet affix calculator'],
  ['lfg', 'Looking for group'], ['guides', 'Player guides']
];

const clamp = (v, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(v)) ? Math.floor(Number(v)) : min));
const plain = v => String(v || '').replace(/[\r\n]/g, ' ').trim();
const cleanLines = v => String(v || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);

export function guideTableMarkdown(options = {}) {
  const columns = clamp(options.columns ?? 2, 2, 5);
  const rows = clamp(options.rows ?? 3, 1, 12);
  const caption = plain(options.caption).replace(/\|/g, '').slice(0, 90);
  const header = '| ' + Array.from({ length: columns }, (_, i) => 'Column ' + (i + 1)).join(' | ') + ' |';
  const rule = '| ' + Array(columns).fill('---').join(' | ') + ' |';
  const data = Array.from({ length: rows }, () => '| ' + Array(columns).fill('Value').join(' | ') + ' |');
  return (caption ? 'Table: ' + caption + '\n' : '') + [header, rule, ...data].join('\n');
}

export function guideInsert(body, action, start, end, options = {}) {
  body = String(body || '');
  const a = clamp(start, 0, body.length), b = clamp(end, a, body.length);
  const before = body.slice(0, a), selected = body.slice(a, b), after = body.slice(b);
  const words = selected.trim();
  let insertion = '', block = false;
  if (action === 'bold') insertion = '**' + (words || 'bold text') + '**';
  else if (action === 'heading') { insertion = '## ' + (cleanLines(selected)[0] || 'Section heading'); block = true; }
  else if (action === 'subheading') { insertion = '### ' + (cleanLines(selected)[0] || 'Subheading'); block = true; }
  else if (action === 'bullets' || action === 'steps' || action === 'note') {
    const lines = cleanLines(selected);
    if (!lines.length) lines.push('First point', 'Second point');
    insertion = lines.map((line, i) => action === 'bullets' ? '- ' + line : action === 'steps' ? (i + 1) + '. ' + line : '> ' + line).join('\n');
    block = true;
  } else if (action === 'table') { insertion = guideTableMarkdown(options); block = true; }
  else if (action === 'tool') {
    const found = GUIDE_TOOL_OPTIONS.find(t => t[0] === options.id);
    if (!found) throw Error('Choose an Arcana tool.');
    insertion = '[[tool:' + found[0] + '|' + (words || found[1]) + ']]';
  } else if (action === 'topic') {
    if (!/^[a-z0-9-]+$/.test(String(options.id || ''))) throw Error('Choose a Handbook topic.');
    insertion = '[[' + options.id + '|' + (words || plain(options.label) || options.id) + ']]';
  } else if (action === 'link') {
    const href = plain(options.href);
    if (!/^https:\/\/[^\s<>"()]+$/i.test(href)) throw Error('Paste a valid https:// link.');
    insertion = '[' + (words || 'Read more') + '](' + href + ')';
  } else throw Error('Unknown formatting action.');

  const prefix = block && before ? before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n' : '';
  const suffix = block && after ? after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n' : '';
  const updated = before + prefix + insertion + suffix + after;
  if (updated.length > 12000) throw Error('Guide limit is 12,000 characters. Shorten a section before inserting.');
  const cursor = before.length + prefix.length + insertion.length;
  return { body: updated, selectionStart: cursor, selectionEnd: cursor };
}
