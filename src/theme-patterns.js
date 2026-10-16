// Every texture is CSS-generated. No third-party image downloads or assets.
export const THEME_PATTERNS=Object.freeze([
 ['contours','Arcane waves','Arcane'],['rings','Mystic rings','Arcane'],['stars','Starlight','Cosmic'],
 ['grid','Arcane grid','Geometric'],['aurora','Aurora glow','Cosmic'],['diagonal','Rune lines','Geometric'],
 ['hex','Hex lattice','Geometric'],['grain','Soft grain','Minimal'],['crystal','Frost crystals','Elemental'],
 ['nebula','Cosmic nebula','Cosmic'],['weave','Elderwood weave','Nature'],['runes','Ritual glyphs','Arcane'],
 ['circuit','Circuit grid','Geometric'],['topography','Terrain contours','Nature'],['facets','Prismatic facets','Geometric'],
 ['scanlines','Fine scanlines','Minimal'],['honeycomb','Honeycomb','Geometric'],['plain','No texture','Minimal'],
 ['chevrons','Chevron etching','Geometric'],['pinstripes','Silk pinstripes','Minimal'],
 ['constellations','Star atlas','Cosmic'],['mosaic','Rune mosaic','Arcane'],
 ['filigree','Golden filigree','Arcane'],['ripple','Water ripples','Elemental'],
 ['sunburst','Solar radiance','Elemental'],['marble','Dark marble','Nature'],
 ['moire','Astral interference','Cosmic'],['polka','Alchemist dots','Minimal'],
 ['frostlines','Glacial fissures','Elemental'],['embers','Falling embers','Elemental'],
 ['ivy','Whispering vines','Nature'],['diamonds','Diamond lattice','Geometric']
].map(([id,name,category])=>Object.freeze({id,name,category})));
export const THEME_PATTERN_IDS=Object.freeze(THEME_PATTERNS.map(x=>x.id));
