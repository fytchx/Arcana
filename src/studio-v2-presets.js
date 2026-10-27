import {ATELIER_PRESETS} from './atelier-presets.js';
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
 moss:['#0D1512','#1B2B23','#A3C77C','#E5C68A','#ECF4E9','#B6C4AD','#526953'],

 antique:['#11100E','#28231B','#D8B873','#B98258','#F4ECDD','#BDB29C','#625343'],
 copperNoir:['#130F0D','#292019','#D6A66C','#BE795C','#F4E9D8','#BBAA98','#655140'],
 oxblood:['#160A10','#2D151D','#E88066','#D9B36B','#FFF0E9','#CCAAA0','#704454'],
 amethyst:['#110D1E','#241A36','#B89CFA','#E4A3D2','#F6F0FF','#BDB1D2','#65537F'],
 tidal:['#06171B','#102B32','#55D8CE','#A2B8F0','#E8FFFC','#A8CECE','#416E73'],
 deepsea:['#07101D','#142334','#69BDF0','#55D7C0','#EFF7FF','#AABFD2','#465E78'],
 stormglass:['#0D1320','#1D2938','#92BAFF','#64E3DB','#EFF7FC','#B1BEC9','#526477'],
 wildwood:['#0C1711','#1C2A1F','#B1CE7B','#E1B876','#F1F6E8','#B8C5A7','#52634F'],
 sagefire:['#15130E','#2B2419','#D9B277','#8DAF83','#F7ECDD','#BFB09B','#685340'],
 cerulean:['#081422','#162B43','#66BDF7','#B6E3FF','#EFF8FF','#ACBCD0','#496988'],
 lavender:['#131022','#242039','#C1A6F7','#D989C1','#F7F1FF','#BCB3D1','#665A7E'],
 rosewood:['#190F18','#2D1C2D','#E6A1B6','#B68AD8','#FFF1F3','#CFB7C3','#76556D'],
 copper:['#170F0B','#302018','#E79A59','#D46F50','#FFF0E2','#C8AC97','#72523F'],
 starlit:['#0A1020','#1C2340','#E8C58B','#9AB5FF','#FFF7E9','#B8BED4','#555B83'],
 magma:['#190A0B','#32191B','#F28455','#E6C06E','#FFF1E8','#C6A89A','#7A3D3A'],
 arctic:['#0A151D','#1B2B37','#B7D6E8','#7DC3D6','#F3FAFF','#B7C7D1','#536D7B'],
 deepviolet:['#100B20','#211631','#C8A4FF','#F49BCB','#F8F2FF','#BFB0D2','#625078'],
 verdigris:['#0E1715','#1C2B27','#8CC8B0','#D6B77A','#F0F8F3','#B7C9C0','#526D62'],
 dusk:['#150E1A','#2B1B2E','#D99FC9','#E6B979','#FFF1F7','#C9B1C4','#70566C'],
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

const ART_KEYS={vf:'violet-fault',pt:'pulse-terrain',rb:'ribbon-bloom',vc:'veil-current',af:'arcflow',cd:'contour-drift',mw:'monowave',il:'ink-lattice',sb:'signal-bloom',vh:'vector-halo',cs:'crownspace',ae:'aether-frame',go:'gilded-orbit',gf:'glacial-fold',nm:'nocturne-mesh',ct:'celestial-tapestry',vs:'verdant-signal',sr:'solar-relic'};
const MORE_ENTRIES=[
 // Arcana Core · libraries, sanctums and old-world magic
 ['astral-loom','Astral Loom','vf','amethyst','il','ct','Arcana Core'],
 ['arcanist-atlas','Arcanist Atlas','ct','starlit','cd','cs','Arcana Core'],
 ['violet-archive','Violet Archive','cs','deepviolet','nm','vf','Arcana Core'],
 ['rune-cathedral','Rune Cathedral','sr','antique','cd','go','Arcana Core'],
 ['moonlit-grimoire','Moonlit Grimoire','vc','lavender','il','cs','Arcana Core'],
 ['sigil-of-ages','Sigil of Ages','go','copperNoir','nm','sr','Arcana Core'],
 ['eldritch-cartouche','Eldritch Cartouche','cd','arcana','il','go','Arcana Core'],
 ['sorcerers-observatory','Sorcerer’s Observatory','vh','royal','ct','cs','Arcana Core'],
 ['sanctum-of-echoes','Sanctum of Echoes','af','orchid','vc','nm','Arcana Core'],
 ['the-velvet-codex','The Velvet Codex','ae','velvet','rb','cs','Arcana Core'],
 ['glyphkeeper','Glyphkeeper','il','amethyst','cd','sr','Arcana Core'],
 ['starlit-reliquary','Starlit Reliquary','ct','starlit','go','nm','Arcana Core'],
 ['oracle-window','Oracle Window','vh','lavender','vc','ct','Arcana Core'],
 ['arcana-after-dark','Arcana After Dark','nm','onyx','vf','go','Arcana Core'],
 // Neon / Signal · controlled energy, luminous circuits and kinetic color
 ['ion-cathedral','Ion Cathedral','pt','cobalt','il','vh','Neon / Signal'],
 ['neon-tessera','Neon Tessera','vh','cerulean','pt','sb','Neon / Signal'],
 ['quantum-orchid','Quantum Orchid','sb','rose','vf','vh','Neon / Signal'],
 ['blue-hour-circuit','Blue Hour Circuit','il','deepsea','pt','cs','Neon / Signal'],
 ['signal-nocturne','Signal Nocturne','nm','stormglass','il','vh','Neon / Signal'],
 ['electric-bloom','Electric Bloom','rb','rosewood','sb','pt','Neon / Signal'],
 ['chromatic-vault','Chromatic Vault','cs','royal','vh','il','Neon / Signal'],
 ['solar-flux','Solar Flux','sr','magma','pt','sb','Neon / Signal'],
 ['jade-afterimage','Jade Afterimage','vs','verdigris','il','vh','Neon / Signal'],
 ['pulse-parallax','Pulse Parallax','pt','frost','vh','cd','Neon / Signal'],
 ['ultraviolet-engine','Ultraviolet Engine','vf','deepviolet','il','pt','Neon / Signal'],
 ['glasswave','Glasswave','af','tidal','vc','vh','Neon / Signal'],
 ['prismatic-terminal','Prismatic Terminal','ct','cerulean','sb','cs','Neon / Signal'],
 ['infrared-ritual','Infrared Ritual','sb','oxblood','sr','pt','Neon / Signal'],
 // Monochrome · graphite, silver, paper and precision linework
 ['carbon-ceremony','Carbon Ceremony','il','graphite','nm','mw','Monochrome'],
 ['silver-index','Silver Index','mw','silver','cd','il','Monochrome'],
 ['ash-and-ivory','Ash & Ivory','cd','noir','il','nm','Monochrome'],
 ['blackglass','Blackglass','vh','graphite','nm','cs','Monochrome'],
 ['platinum-etch','Platinum Etch','go','silver','il','cd','Monochrome'],
 ['the-quiet-machine','The Quiet Machine','nm','graphite','mw','il','Monochrome'],
 ['inkstone','Inkstone','cs','noir','cd','mw','Monochrome'],
 ['moonsteel','Moonsteel','gf','arctic','nm','il','Monochrome'],
 ['pearl-nocturne','Pearl Nocturne','ae','silver','vc','mw','Monochrome'],
 ['whiteout-atlas','Whiteout Atlas','ct','graphite','il','gf','Monochrome'],
 ['obsidian-script','Obsidian Script','sr','noir','il','go','Monochrome'],
 ['smoke-and-mirror','Smoke & Mirror','vc','graphite','nm','ae','Monochrome'],
 ['velvet-carbon','Velvet Carbon','ae','noir','rb','mw','Monochrome'],
 ['titanium-veil','Titanium Veil','gf','silver','vc','il','Monochrome'],
 // Ribbon / Veil · silk, glass, lunar water and soft gradients
 ['lunar-ballet','Lunar Ballet','rb','blush','vc','ae','Ribbon / Veil'],
 ['petals-in-shadow','Petals in Shadow','ae','rosewood','rb','nm','Ribbon / Veil'],
 ['opal-current','Opal Current','vc','arctic','gf','rb','Ribbon / Veil'],
 ['amethyst-drapery','Amethyst Drapery','rb','amethyst','ae','vf','Ribbon / Veil'],
 ['moonwater-garden','Moonwater Garden','vc','tidal','vs','rb','Ribbon / Veil'],
 ['silk-and-starlight','Silk & Starlight','ct','lavender','rb','ae','Ribbon / Veil'],
 ['dreaming-in-rose','Dreaming in Rose','ae','rose','rb','vc','Ribbon / Veil'],
 ['sapphire-mirage','Sapphire Mirage','vh','cerulean','vc','gf','Ribbon / Veil'],
 ['dusk-lanterns','Dusk Lanterns','sr','dusk','rb','go','Ribbon / Veil'],
 ['clouded-mirror','Clouded Mirror','gf','silver','vc','vh','Ribbon / Veil'],
 ['velvet-tide','Velvet Tide','af','velvet','ae','vc','Ribbon / Veil'],
 ['the-last-petal','The Last Petal','rb','rosewood','nm','ae','Ribbon / Veil'],
 ['blue-moon-atelier','Blue Moon Atelier','cs','frost','vc','ct','Ribbon / Veil'],
 ['wisteria-nocturne','Wisteria Nocturne','vf','deepviolet','rb','nm','Ribbon / Veil'],
 // Relics / Elements · hammered metal, emberlight, mineral and living stone
 ['brassbound','Brassbound','go','antique','sr','cd','Relics / Elements'],
 ['ember-vigil','Ember Vigil','sr','magma','go','pt','Relics / Elements'],
 ['the-verdant-relic','The Verdant Relic','vs','wildwood','go','vc','Relics / Elements'],
 ['copper-sanctuary','Copper Sanctuary','go','copper','sr','cd','Relics / Elements'],
 ['storm-forged','Storm Forged','pt','stormglass','go','vh','Relics / Elements'],
 ['frost-and-flint','Frost & Flint','gf','arctic','sr','cd','Relics / Elements'],
 ['jade-altar','Jade Altar','vs','verdigris','go','sr','Relics / Elements'],
 ['blood-iron','Blood Iron','sr','oxblood','go','nm','Relics / Elements'],
 ['sunken-treasure','Sunken Treasure','vc','deepsea','go','gf','Relics / Elements'],
 ['old-world-amber','Old World Amber','go','antique','sr','cd','Relics / Elements'],
 ['mountain-temple','Mountain Temple','cd','sagefire','go','vs','Relics / Elements'],
 ['the-molten-library','The Molten Library','sr','copperNoir','il','go','Relics / Elements'],
 ['sea-glass-altar','Sea Glass Altar','gf','tidal','go','vc','Relics / Elements'],
 ['relic-of-the-first-flame','Relic of the First Flame','ct','ember','sr','go','Relics / Elements']
];


const FAMILY_STYLE={
 'Arcana Core':{fontFamily:'dm-sans',headingFont:'cinzel',density:'comfortable',buttonStyle:'gradient',heroCardStyle:'etched',heroActionStyle:'brushed',heroSize:'showcase',heroActionAlign:'end'},
 'Neon / Signal':{fontFamily:'space-grotesk',headingFont:'sora',density:'compact',buttonStyle:'solid',heroCardStyle:'glass',heroActionStyle:'neon-line',heroSize:'balanced',heroActionAlign:'end'},
 'Monochrome':{fontFamily:'inter',headingFont:'barlow',density:'compact',buttonStyle:'outline',heroCardStyle:'minimal',heroActionStyle:'underlined',heroSize:'balanced',heroActionAlign:'end'},
 'Ribbon / Veil':{fontFamily:'manrope',headingFont:'fraunces',density:'spacious',buttonStyle:'gradient',heroCardStyle:'glass',heroActionStyle:'ribbon',heroSize:'showcase',heroActionAlign:'center'},
 'Relics / Elements':{fontFamily:'outfit',headingFont:'cinzel',density:'comfortable',buttonStyle:'solid',heroCardStyle:'metallic',heroActionStyle:'etched',heroSize:'showcase',heroActionAlign:'end'}
};
const LAYER_SCHEME={
 'Arcana Core':['contour-drift','gilded-orbit'],
 'Neon / Signal':['ink-lattice','signal-bloom'],
 'Monochrome':['ink-lattice','nocturne-mesh'],
 'Ribbon / Veil':['veil-current','ribbon-bloom'],
 'Relics / Elements':['solar-relic','gilded-orbit']
};
const allEntries=[
 ...ENTRIES.map(([id,name,art,palette,,family])=>[id,name,art,palette,...LAYER_SCHEME[family],family]),
 ...MORE_ENTRIES
];
export const STUDIO_V2_FAMILIES=Object.freeze(['Atelier / 2026',...new Set(allEntries.map(r=>r[6]))]);
export const STUDIO_V2_PRESETS=Object.freeze({...ATELIER_PRESETS,'astral-veil':Object.freeze({
  name:'Astral Veil',tagline:'Cosmic / Violet Nebula',collection:'studio-v2',
  pattern:'atelier-astral-veil',panelPattern:'atelier-smoked-glass',featurePattern:'atelier-stardust-veil',
  main:'#0D0821',card:'#1A1333',navBar:'#15102A',iconBox:'#291B49',iconGlyph:'#CCB6FF',
  action:'#9876FC',secondaryAccent:'#83C7FF',text:'#F6F1FF',mutedText:'#C9BFE1',borderColor:'#6D568F',buttonText:'#0D0821',
  artBase:'#12092C',artPrimary:'#A36AF3',artSecondary:'#6340C9',artGlow:'#DBBEFF',artStrength:95,artDetail:99,
  artWeight:100,artZoom:100,artPositionX:50,artPositionY:50,
  panelArtBase:'#1A1333',panelArtPrimary:'#7353AE',panelArtSecondary:'#A789E0',panelArtGlow:'#E5D5FF',
  featureArtBase:'#19102F',featureArtPrimary:'#AD7FFF',featureArtSecondary:'#81A8F5',featureArtGlow:'#EEE7FF',
  panelOpacity:76,patternTarget:'background',intensity:67,glow:36,edges:45,roundness:17,buttonRoundness:13,
  buttonFill:94,fontFamily:'manrope',headingFont:'cinzel',density:'comfortable',buttonStyle:'gradient',
  heroCardStyle:'glass',heroActionStyle:'ribbon',heroSize:'showcase',heroActionAlign:'center',
  iconMode:'two-tone',fontSize:100,cardPadding:16,cardShadow:36,headerOpacity:92,patternScale:100,
  borderWidth:1,buttonHeight:48,accentBlend:33,aura:68,sheen:39,detail:83,
  psyPaletteMode:'custom',psyBackground:'#1A1333',psyPrimary:'#AD7FFF',psySecondary:'#83C7FF',
  psyAccent:'#9876FC',psyOutline:'#0D0821',psyStroke:46,
  heroActionWidth:100,heroActionHeight:48,heroActionGlow:27,heroActionBorder:1,
  heroActionIcon:'show',heroActionSubtitle:'auto',heroCardEmblem:'subtle'
 }),...Object.fromEntries(allEntries.map(([id,name,artName,palette,panelArtName,featureArtName,family],index)=>{
 const [main,card,action,secondaryAccent,text,mutedText,borderColor]=PALETTES[palette];
 const brighten=n=>Math.min(255,n+17).toString(16).padStart(2,'0').toUpperCase();
 const iconBox='#'+main.slice(1).match(/../g).map(x=>brighten(parseInt(x,16))).join('');
 const style=FAMILY_STYLE[family];
 const artBase=main,artPrimary=action,artSecondary=secondaryAccent,artGlow=text;
 const artId=name=>ART_KEYS[name]||name;
 const panelPattern='vision-'+artId(panelArtName),featurePattern='vision-'+artId(featureArtName);
 const value={
  name,tagline:family,collection:'studio-v2',pattern:'vision-'+artId(artName),
  main,card,iconBox,iconGlyph:action,action,secondaryAccent,text,mutedText,borderColor,navBar:card,buttonText:main,
  artBase,artPrimary,artSecondary,artGlow,artStrength:family==='Monochrome'?82:90,
  artDetail:family==='Ribbon / Veil'?100:90,artWeight:family==='Monochrome'?105:100,artZoom:100,artPositionX:50,artPositionY:50,
  panelPattern,featurePattern,panelArtBase:card,panelArtPrimary:secondaryAccent,panelArtSecondary:action,panelArtGlow:text,
  featureArtBase:card,featureArtPrimary:action,featureArtSecondary:secondaryAccent,featureArtGlow:text,
  fontFamily:style.fontFamily,headingFont:style.headingFont,density:style.density,buttonStyle:style.buttonStyle,
  heroCardStyle:style.heroCardStyle,heroActionStyle:style.heroActionStyle,heroSize:style.heroSize,heroActionAlign:style.heroActionAlign,
  patternTarget:index%7===3?'background':index%5===2?'cards':'all',
  intensity:family==='Monochrome'?14:family==='Neon / Signal'?34:24,
  glow:family==='Neon / Signal'?26:family==='Monochrome'?8:18,edges:family==='Monochrome'?65:42,
  roundness:family==='Monochrome'?9:family==='Ribbon / Veil'?19:13,buttonRoundness:family==='Monochrome'?7:family==='Ribbon / Veil'?18:11,
  buttonFill:family==='Monochrome'?62:family==='Neon / Signal'?96:82,iconMode:family==='Monochrome'?'neutral':'two-tone',
  fontSize:family==='Monochrome'?96:100,cardPadding:family==='Monochrome'?12:family==='Ribbon / Veil'?17:14,
  cardShadow:family==='Monochrome'?14:family==='Neon / Signal'?36:26,headerOpacity:family==='Monochrome'?98:94,
  patternScale:family==='Neon / Signal'?112:family==='Ribbon / Veil'?118:100,borderWidth:family==='Monochrome'?1:2,
  buttonHeight:family==='Monochrome'?42:46,accentBlend:family==='Neon / Signal'?48:28,
  aura:family==='Neon / Signal'?70:family==='Monochrome'?12:42,sheen:family==='Relics / Elements'?70:family==='Monochrome'?16:45,
  detail:family==='Neon / Signal'?74:58,psyPaletteMode:'custom',psyBackground:card,psyPrimary:action,
  psySecondary:secondaryAccent,psyAccent:action,psyOutline:main,psyStroke:family==='Monochrome'?38:56,
  heroActionWidth:100,heroActionHeight:48,heroActionGlow:family==='Neon / Signal'?32:family==='Relics / Elements'?18:12,
  heroActionBorder:family==='Monochrome'?1:2,heroActionIcon:'show',heroActionSubtitle:'auto',
  heroCardEmblem:family==='Monochrome'?'hidden':'subtle'
 };
 return [id,Object.freeze(value)];
}))});
export const STUDIO_V2_PRESET_IDS=Object.freeze(Object.keys(STUDIO_V2_PRESETS));
