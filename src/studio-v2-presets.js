// Arcana Studio v2. Every entry is a real Vision artwork + full working UI palette.
// Legacy presets remain readable by the importer, but none appear in the new gallery.
const PALETTES={
 arcana:['#0D1019','#191E2B','#A98BFF','#38BDF8','#F5F5FB','#A8B2C4','#66708B'],
 velvet:['#100B1F','#231A37','#CE8FFF','#F2ACD8','#FDF5FF','#CAB9DD','#705B90'],
 cobalt:['#081322','#16253F','#60A5FA','#22D3EE','#EFF7FF','#AABDD6','#42658A'],
 jade:['#071510','#132820','#34E8A1','#B4E877','#E8FFF5','#A8CCBC','#376B55'],
 ember:['#180E0B','#302019','#FF914D','#F5C451','#FFF3E8','#D2B4A4','#895439'],
 silver:['#10131B','#242B36','#CAD6EB','#7BBDF0','#F6F9FF','#B7C2D2','#627082'],
 crimson:['#180C12','#331C28','#FF6382','#F5A862','#FFF1F3','#D0A9B5','#8B4B61'],
 onyx:['#090B12','#171A21','#EABF7A','#D18C69','#F5EFE8','#B7A99C','#53483F'],
 rose:['#170B19','#301B32','#F472D0','#A78BFA','#FFF0FA','#D5B4D0','#814D80'],
 frost:['#08171E','#18313B','#73E0FF','#B7F7F3','#EAFBFF','#A6CBD3','#41737E'],
 orchid:['#101025','#242040','#D4A7FF','#FFACD6','#F7EEFF','#C0B2D5','#675680'],
 graphite:['#0D0E12','#202129','#EFECE6','#B7B5C7','#F7F6F1','#ACABB9','#595A68'],
 blush:['#180F22','#31203E','#F6B2D8','#AC83F3','#FDF2FC','#CDBAD9','#756189'],
 noir:['#08090E','#161920','#FFFFFF','#9499AA','#F6F5F2','#B0B3C0','#555A68'],
 royal:['#0C1021','#202543','#D7B6FF','#7A84F6','#F9F5FF','#BEC4E5','#66639A'],
 moss:['#0D1512','#1B2B23','#A3C77C','#E5C68A','#ECF4E9','#B6C4AD','#526953']
};
// Exact artwork names from the authored vector collection, not imaginary assets.
const ENTRIES=[
 // id, title, art, palette, pigment override (optional), family
 ['astral-heart','Astral Heart','violet-fault','arcana',null,'Arcana Core'],
 ['midnight-codex','Midnight Codex','crownspace','royal',null,'Arcana Core'],
 ['etherbound','Etherbound','ribbon-bloom','velvet',null,'Arcana Core'],
 ['runic-tide','Runic Tide','arcflow','orchid',null,'Arcana Core'],
 ['arcane-archive','Arcane Archive','contour-drift','cobalt',null,'Arcana Core'],
 ['royal-sigil','Royal Sigil','gilded-orbit','onyx',null,'Arcana Core'],
 ['ion-storm','Ion Storm','pulse-terrain','cobalt',null,'Neon / Signal'],
 ['chromatic-pulse','Chromatic Pulse','signal-bloom','rose',null,'Neon / Signal'],
 ['neon-rift','Neon Rift','violet-fault','crimson',null,'Neon / Signal'],
 ['digital-mirage','Digital Mirage','vector-halo','frost',null,'Neon / Signal'],
 ['emerald-signal','Emerald Signal','verdant-signal','jade',null,'Neon / Signal'],
 ['prismatic-code','Prismatic Code','celestial-tapestry','royal',null,'Neon / Signal'],
 ['black-ink','Black Ink','monowave','noir',null,'Monochrome'],
 ['platinum-wave','Platinum Wave','arcflow','silver',null,'Monochrome'],
 ['graphite-weave','Graphite Weave','ink-lattice','graphite',null,'Monochrome'],
 ['nocturne','Nocturne','nocturne-mesh','noir',null,'Monochrome'],
 ['quiet-silver','Quiet Silver','crownspace','silver',null,'Monochrome'],
 ['obsidian-geometry','Obsidian Geometry','contour-drift','onyx',null,'Monochrome'],
 ['rosefall','Rosefall','ribbon-bloom','blush',null,'Ribbon / Veil'],
 ['moonwater','Moonwater','veil-current','frost',null,'Ribbon / Veil'],
 ['velvet-dusk','Velvet Dusk','aether-frame','velvet',null,'Ribbon / Veil'],
 ['sapphire-fold','Sapphire Fold','glacial-fold','cobalt',null,'Ribbon / Veil'],
 ['lunar-silk','Lunar Silk','veil-current','silver',null,'Ribbon / Veil'],
 ['petal-veil','Petal Veil','ribbon-bloom','rose',null,'Ribbon / Veil'],
 ['forged-gold','Forged Gold','gilded-orbit','onyx',null,'Relics / Elements'],
 ['solar-ritual','Solar Ritual','solar-relic','ember',null,'Relics / Elements'],
 ['jade-circuit','Jade Circuit','verdant-signal','jade',null,'Relics / Elements'],
 ['frost-sanctum','Frost Sanctum','glacial-fold','frost',null,'Relics / Elements'],
 ['bloodmoon-rite','Bloodmoon','solar-relic','crimson',null,'Relics / Elements'],
 ['star-forge','Star Forge','celestial-tapestry','royal',null,'Relics / Elements']
];
export const STUDIO_V2_FAMILIES=Object.freeze([...new Set(ENTRIES.map(r=>r[5]))]);
export const STUDIO_V2_PRESETS=Object.freeze(Object.fromEntries(ENTRIES.map(([id,name,artName,palette,,family],index)=>{
 const [main,card,action,secondaryAccent,text,mutedText,borderColor]=PALETTES[palette];
 const dark=main.slice(1).match(/../g).map(x=>parseInt(x,16));
 const slight= n=>Math.min(255,n+17).toString(16).padStart(2,'0').toUpperCase();
 const iconBox='#'+dark.map(slight).join('');
 const artBase=main,artPrimary=action,artSecondary=secondaryAccent;
 const artGlow=family==='Monochrome'?'#FFFFFF':text;
 const value={name,tagline:family,collection:'studio-v2',pattern:'vision-'+artName,
  main,card,iconBox,iconGlyph:action,action,secondaryAccent,text,mutedText,borderColor,navBar:card,
  buttonText:main,artBase,artPrimary,artSecondary,artGlow,panelPattern:'inherit',featurePattern:'inherit',panelArtBase:artBase,panelArtPrimary:artPrimary,panelArtSecondary:artSecondary,panelArtGlow:artGlow,featureArtBase:artBase,featureArtPrimary:artPrimary,featureArtSecondary:artSecondary,featureArtGlow:artGlow,headingFont:'serif',
  patternTarget:index%4===2?'background':'all',
  artStrength:family==='Monochrome'?82:90,artDetail:family==='Ribbon / Veil'?100:90,
  artWeight:family==='Monochrome'?105:100,artZoom:100,artPositionX:50,artPositionY:50,
  roundness:family==='Monochrome'?9:13,cardShadow:24,fontSize:100,
  borderWidth:1,buttonRoundness:11,buttonFill:82,headerOpacity:95,
  panelOpacity:88,density:'comfortable',buttonStyle:family==='Monochrome'?'outline':'gradient'};
 return [id,Object.freeze(value)];
})));
export const STUDIO_V2_PRESET_IDS=Object.freeze(Object.keys(STUDIO_V2_PRESETS));
