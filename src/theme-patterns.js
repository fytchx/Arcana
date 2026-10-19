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
 ['ivy','Whispering vines','Nature'],['diamonds','Diamond lattice','Geometric'],
 // Material finishes. These are deliberately subtler and less 'computer wallpaper'.
 ['satin','Satin sheen','Material'],['velvet','Midnight velvet','Material'],['linen','Woven linen','Material'],
 ['brushed-metal','Brushed titanium','Material'],['etched-steel','Etched steel','Material'],['pearl','Mother of pearl','Material'],
 ['leather','Aged leather','Material'],['silk','Silken folds','Material'],['obsidian-glass','Obsidian glass','Material'],
 ['hammered','Hammered bronze','Material'],['carbon','Carbon fiber','Material'],['paper','Ancient paper','Material'],
 // Atmospheres intentionally have soft composition rather than rigid geometry.
 ['deep-space','Deep space','Atmosphere'],['fog','Moonlit fog','Atmosphere'],['volumetric','Radiant mist','Atmosphere'],
 ['sunset','Ember horizon','Atmosphere'],['abyss','Abyssal depth','Atmosphere'],['moonlight','Moonlight','Atmosphere'],
 ['biolume','Bioluminescence','Atmosphere'],['cosmic-dust','Cosmic dust','Atmosphere'],
 // Relic / environment style overlays, suited to fantasy rather than dashboards.
 ['slate','Natural slate','Relic'],['carved-stone','Carved stone','Relic'],['old-map','Ancient cartography','Relic'],
 ['arcane-script','Arcane inscription','Relic'],['cracked-crystal','Cracked geode','Relic'],
 ['goldleaf','Gold leaf','Relic'],['dragon-scale','Dragon scales','Relic'],['temple','Temple engravings','Relic'],
 ['shadow-floral','Shadow blossoms','Relic'],['star-chart','Celestial chart','Relic'],
 ['mana','Mana streams','Relic'],['rune-dust','Runestone dust','Relic'],
 // Premium handcrafted procedural finishes; fully recolorable by the editor.
 ['astral-sovereign','Celestial gold cartography','Signature'],['abyssal-bloom','Bioluminescent currents','Signature'],['infernal-obsidian','Molten volcanic fractures','Signature'],['opaline-eternity','Opaline crystal refraction','Signature'],['phantom-spectrum','Spectral holography','Signature'],['velvet-requiem','Embroidered wine velvet','Signature'],['emerald-sanctum','Luminous jade botanicals','Signature'],['golden-dynasty','Imperial gilded marble','Signature'],['lunar-cathedral','Moonlit silver vaults','Signature'],['dragons-hoard','Dragon-scale bronze','Signature'],['sakura-dreamscape','Porcelain blossoms','Signature'],['neon-revenant','Neon circuit phosphor','Signature'],['bloodmoon-covenant','Bloodmoon gothic tracery','Signature'],['elysian-marble','Champagne alabaster','Signature'],['nebula-genesis','Celestial vapor clouds','Signature'],['desert-oracle','Lapis sandstone engravings','Signature'],['iridescent-mirage','Jeweled interference','Signature'],['forgotten-archive','Illuminated manuscript','Signature'],['diamond-singularity','Prismatic black diamond','Signature'],['void-emperor','Black silver aura','Signature']
].map(([id,name,category])=>Object.freeze({id,name,category})));
export const THEME_PATTERN_IDS=Object.freeze(THEME_PATTERNS.map(x=>x.id));
