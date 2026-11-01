// Arcana solid glyphs: original filled 24px icons in the plain, readable style of the in-game UI.
// One color (currentColor), no outlines, no gradients, so they sit cleanly on class-colored chips.
const G = {
  home: 'M12 3 2.5 11h2.5v9h5v-6h4v6h5v-9h2.5z',
  tools: 'M21.7 6.3a5.5 5.5 0 0 1-7.2 6.7L7 20.5a2.1 2.1 0 0 1-3-3L11.5 10a5.5 5.5 0 0 1 6.7-7.2L14.6 6.4l.9 3.1 3.1.9z',
  search: 'M10.5 3a7.5 7.5 0 0 1 6 12l4.8 4.8-1.5 1.5-4.8-4.8A7.5 7.5 0 1 1 10.5 3zm0 2.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  builds: 'M12 2 4 5.5v6c0 5 3.4 9.4 8 10.5 4.6-1.1 8-5.5 8-10.5v-6z',
  directory: 'M3 5h18v2.5H3zm0 5.75h18v2.5H3zM3 16.5h18V19H3z',
  user: 'M12 3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 10.5c4.4 0 8 2.2 8 5V21H4v-2.5c0-2.8 3.6-5 8-5z',
  'class-warrior': 'M12 2 4 5.2v6.3c0 5 3.4 9.3 8 10.5 4.6-1.2 8-5.5 8-10.5V5.2z',
  'class-archer': 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8zm0 2.9a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2.6a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8z',
  'class-mage': 'M10.5 2.5 6 17h12l-3.2-7.6L18 8l-4.6-.3zM3 18.5h18V21H3zM19 2l.8 1.7 1.7.8-1.7.8L19 7l-.8-1.7-1.7-.8 1.7-.8z',
  'class-rogue': 'M13.2 2v9h8.3v2h-8.3v9h-2.4v-9H2.5v-2h8.3V2z',
  'class-druid': 'M14.5 2.5A9.5 9.5 0 1 0 21.5 15 7.6 7.6 0 0 1 14.5 2.5zM19 3l.7 1.5 1.5.7-1.5.7L19 7.4l-.7-1.5-1.5-.7 1.5-.7z',
  retaliation: 'M12 2 4 5.2v6.3c0 5 3.4 9.3 8 10.5 4.6-1.2 8-5.5 8-10.5V5.2zm0 4 1.4 3.1 3.4.4-2.5 2.3.7 3.3L12 13.5l-3 1.6.7-3.3-2.5-2.3 3.4-.4z',
  attack: 'M19.5 2.5H21v1.5L11.4 13.6l1.5 1.5-1.5 1.5-1.4-1.4L6.4 18.8l.9.9-1.5 1.5-3-3 1.5-1.5.9.9L8.8 14 7.4 12.6 8.9 11l1.5 1.5z',
  pet: 'M7.2 5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9.6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM4 10.5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm16 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM12 11c2.8 0 5.5 3.6 5.5 6.3 0 1.8-1.4 2.7-3.2 2.7-1 0-1.5-.4-2.3-.4s-1.3.4-2.3.4c-1.8 0-3.2-.9-3.2-2.7C6.5 14.6 9.2 11 12 11z',
  harmony: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2.5a7.5 7.5 0 0 0 0 15 3.75 3.75 0 0 0 0-7.5 3.75 3.75 0 0 1 0-7.5zm0 2.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm0 9.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z',
  upgrade: 'M12 2.5 19 10h-4.3v6H9.3v-6H5zM5 18h14v3.5H5z',
  xp: 'M12 2 14.6 8.6 21.5 9.2 16.2 13.7 17.9 20.5 12 16.8 6.1 20.5 7.8 13.7 2.5 9.2 9.4 8.6z',
  compound: 'M12 2c4 0 7 6.3 7 11.2A7 7 0 0 1 5 13.2C5 8.3 8 2 12 2zm-2.5 9.5 1.6 1.6-1.6 1.6L8 13.1zm5 0 1.5 1.6-1.5 1.6-1.6-1.6z',
  affix: 'M7 3h10l4.5 6L12 21 2.5 9zm1.3 2.5L6.2 8.8h3.3L11 5.5zm4.7 0 1.5 3.3h3.3l-2.1-3.3z',
  studio: 'M14 2.5 21.5 10 19 12.5l-1.4-1.4-6.9 6.9 1.4 1.4-1.8 1.8-5.5-5.5 1.8-1.8 1.4 1.4 6.9-6.9L13.5 7 11.5 5zM3 19.5l3-3 1.5 1.5-3 3z',
  guild: 'M5 2h14v14l-7 6-7-6zm7 4-1.3 2.7-3 .4 2.2 2-.6 2.9 2.7-1.5 2.7 1.5-.6-2.9 2.2-2-3-.4z',
  skills: 'M12 2a3 3 0 1 1-1.25 5.73V10.5h4.5a3 3 0 1 1 0 2.5h-4.5v2.77a3 3 0 1 1-2.5 0V7.73A3 3 0 0 1 12 2z',
  map: 'M3 5.5 9 3l6 2.5L21 3v15.5L15 21l-6-2.5L3 21zm6-.1v13l6 2.5v-13z',
  compare: 'M10 3h2.5v18H10v-2H4V5h6zm0 4.5H6.5v9H10zM14 5h6v14h-6v-2.5h3.5v-9H14z',
  rarity: 'M12 2 21 8.5 12 22 3 8.5zm0 3.2L6.4 9.1 12 17.5l5.6-8.4z',
  farm: 'M3 20h18v2H3zM5 11h3v8H5zm5.5-5h3v13h-3zM16 8h3v11h-3z',
  codex: 'M5 2.5h12.5A1.5 1.5 0 0 1 19 4v15.5H6.5a1 1 0 0 0 0 2H19V23H6.5A3.5 3.5 0 0 1 3 19.5V4.5a2 2 0 0 1 2-2zm3 4v2h7v-2z',
  news: 'M3 4h14v15a1.5 1.5 0 0 0 3 0V8h1.5v11a3.5 3.5 0 0 1-3.5 3.5H5.5A2.5 2.5 0 0 1 3 20zm3 3v4h5V7zm7 0v1.5h2V7zm0 3v1.5h2V10zm-7 3.5V15h9v-1.5zm0 3V18h9v-1.5z',
  community: 'M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8 1.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zM9 12.5c3.9 0 7 2 7 4.6V21H2v-3.9c0-2.6 3.1-4.6 7-4.6zm8.5.3c2.6.3 4.5 1.9 4.5 3.9V21h-4.5v-3.9c0-1.6-.6-3-1.7-4z',
  records: 'M6 2.5h12V4h3.5v3a4.5 4.5 0 0 1-4.3 4.5A6 6 0 0 1 13.2 15v2.5H17V21H7v-3.5h3.8V15a6 6 0 0 1-4-3.5A4.5 4.5 0 0 1 2.5 7V4H6zM4.5 6v1a2.5 2.5 0 0 0 1.6 2.3A10 10 0 0 1 6 6zm13.5 0c0 1.2 0 2.2-.1 3.3A2.5 2.5 0 0 0 19.5 7V6z',
  feedback: 'M3 3h18v14H8l-5 4.5zm4 4.5v2h10v-2zm0 3.5v2h7v-2z',
  admin: 'M8 4.5a5.5 5.5 0 0 1 5.3 7H22v3.5h-2.5v3H16v-3h-2.7A5.5 5.5 0 1 1 8 4.5zm0 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  theme: 'M12 2.5c5.5 0 10 3.9 10 8.7 0 3-2.4 5-5.3 5H15a1.8 1.8 0 0 0-1.3 3 1.8 1.8 0 0 1-1.3 3H12a10 10 0 0 1 0-19.7zM6.5 9.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zm3.5-4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zm5 0a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zm3.3 4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z',
  gold: 'M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zm.9 3.5h-1.8v1.4c-1.7.3-2.9 1.4-2.9 3 0 1.9 1.6 2.6 3.4 3.1 1.4.4 1.9.7 1.9 1.3s-.6 1-1.6 1c-1.1 0-1.9-.5-2.2-1.4l-1.8.6c.4 1.4 1.6 2.4 3.2 2.6V18h1.8v-1.4c1.8-.3 2.9-1.4 2.9-3 0-2-1.6-2.6-3.5-3.1-1.3-.3-1.8-.6-1.8-1.2 0-.5.5-.9 1.4-.9.9 0 1.6.4 1.9 1.1l1.7-.7c-.4-1.1-1.4-1.9-2.6-2.1z',
  lock: 'M12 2a5 5 0 0 1 5 5v3h1.5A1.5 1.5 0 0 1 20 11.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20.5v-9A1.5 1.5 0 0 1 5.5 10H7V7a5 5 0 0 1 5-5zm0 2.5A2.5 2.5 0 0 0 9.5 7v3h5V7A2.5 2.5 0 0 0 12 4.5z',
  event: 'M12 2c1 3.4 5 5.3 5 10.2A5 5 0 0 1 7 12.2c0-1.8.7-3.1 1.6-4.2.2 1.5.9 2.4 1.8 2.9C10 7.6 10.9 4.6 12 2zm0 12.3c-.8 1.1-1.6 1.8-1.6 3a1.6 1.6 0 0 0 3.2 0c0-1.2-.8-1.9-1.6-3zM5 20h14v2H5z',
  material: 'M12 2 20.5 7v10L12 22 3.5 17V7zm0 3L6.2 8.4 12 11.7l5.8-3.3z',
  guide: 'M4 3h7l1 1 1-1h7v16h-7l-1 1-1-1H4zm2.5 3.5v2h4v-2zm0 3.5v2h4v-2zm7-3.5v2h4v-2zm0 3.5v2h4v-2z'
};
// Feature and stat names used elsewhere map onto these glyphs.
const ALIAS = {
  'feature-upgrade': 'upgrade', 'stat-exp-gain': 'xp', 'currency-pet-egg': 'compound', 'currency-pet-shard': 'affix', 'feature-guild-finder': 'guild', 'feature-passive-tree': 'skills', 'feature-skill-tree': 'skills',
  'feature-build-studio': 'studio', 'feature-calculator': 'tools', 'feature-codex': 'codex', 'feature-community': 'community', 'feature-guides': 'guide', 'feature-wiki': 'news', 'help': 'feedback', 'feature-rune-forge': 'theme',
  'currency-awakening': 'map', 'equipment-weapon': 'compare', 'currency-gem': 'rarity', 'stat-extra-kill': 'farm', 'stat-boss-damage': 'records', 'currency-guildstone': 'user', 'currency-rune-shard': 'admin', 'currency-ruby': 'event',
  'stat-retaliation': 'retaliation', 'stat-attack': 'attack', 'stat-pet-damage': 'pet', 'stat-all-class-skills': 'harmony', 'currency-gold': 'gold', 'currency-material': 'material', 'currency-arcstone': 'material',
  'stat-crit-damage': 'attack', 'stat-drop-bonus': 'gold', 'equipment-charm': 'affix'
};
export const hasGlyph = id => !!(G[id] || G[ALIAS[id]]);
export function glyph(id, size = 24) {
  const d = G[id] || G[ALIAS[id]];
  return d ? '<svg class="nx-glyph" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="' + d + '"/></svg>' : '';
}
