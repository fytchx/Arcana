// Arcana Atelier Five. Individually art-directed, fully editable Studio V2 presets.
// Surface roles and accent contrast are chosen intentionally, not random palettes.
const ROWS=[
 {id:'chromatic-chapel',name:'Chromatic Chapel',art:'chapel',panel:'porcelain',feature:'chapel',
  main:'#101421',card:'#222638',action:'#F2CA88',alt:'#83C8E7',text:'#F8F2E9',muted:'#C5C5D0',border:'#58657C',
  base:'#101421',p:'#E8BA83',s:'#73A8E5',glow:'#FFF1CF',
  panelP:'#B3C9DD',panelS:'#BEAFD8',featureP:'#F4D9A0',featureS:'#74CAE1',
  font:'dm-sans',heading:'cinzel',hero:'etched',cta:'brushed',density:'comfortable',button:'gradient',round:9,shadow:23,aura:36,detail:91},
 {id:'verdigris-machine',name:'Verdigris Machine',art:'circuit',panel:'circuit',feature:'afterglow',
  main:'#071C21',card:'#123037',action:'#B7F082',alt:'#67D6D9',text:'#F1FBF7',muted:'#B4D2CF',border:'#4B7780',
  base:'#071C21',p:'#A7EA79',s:'#4CA8B7',glow:'#D3FFE4',
  panelP:'#79C7BB',panelS:'#ABDB82',featureP:'#B8F577',featureS:'#60E1D3',
  font:'jetbrains',heading:'sora',hero:'accent-edge',cta:'neon-line',density:'compact',button:'solid',round:8,shadow:28,aura:54,detail:88},
 {id:'ashen-cartographer',name:'Ashen Cartographer',art:'atlas',panel:'porcelain',feature:'atlas',
  main:'#191410',card:'#30251F',action:'#F7CD87',alt:'#A9C7EE',text:'#FFF4E1',muted:'#D8C6B2',border:'#7C6250',
  base:'#191410',p:'#EDBC7D',s:'#78A5CB',glow:'#FFE8C3',
  panelP:'#D6B98B',panelS:'#7197B4',featureP:'#F4C37B',featureS:'#83BDD5',
  font:'manrope',heading:'cormorant',hero:'metallic',cta:'etched',density:'comfortable',button:'outline',round:7,shadow:18,aura:24,detail:96},
 {id:'voltage-garden',name:'Voltage Garden',art:'afterglow',panel:'circuit',feature:'afterglow',
  main:'#171027',card:'#2C1C3D',action:'#D9F77E',alt:'#FF90C7',text:'#FEF5FF',muted:'#D6C6E7',border:'#79569E',
  base:'#171027',p:'#EE7EBA',s:'#C8F36D',glow:'#F9E8FF',
  panelP:'#C68EDB',panelS:'#A3EFBC',featureP:'#FF83C8',featureS:'#D7FD7F',
  font:'space-grotesk',heading:'barlow',hero:'glass',cta:'neon-line',density:'compact',button:'solid',round:16,shadow:34,aura:62,detail:100},
 {id:'porcelain-afterdark',name:'Porcelain Afterdark',art:'porcelain',panel:'porcelain',feature:'chapel',
  main:'#101B25',card:'#213039',action:'#E1F1EF',alt:'#F2ADBC',text:'#F8F8F4',muted:'#C6D5D4',border:'#617A81',
  base:'#101B25',p:'#E4EAE2',s:'#D6A0B4',glow:'#FFFFFF',
  panelP:'#BADDD8',panelS:'#D5ABB7',featureP:'#E2EEE6',featureS:'#E7B6C6',
  font:'dm-sans',heading:'fraunces',hero:'minimal',cta:'underlined',density:'spacious',button:'outline',round:18,shadow:13,aura:16,detail:96}
];
const id=short=>'vision-atelier-'+short;
const derive=row=>{
 const {id:presetId,name,art,panel,feature,main,card,action,alt,text,muted,border,base,p,s,glow,panelP,panelS,featureP,featureS,font,heading,hero,cta,density,button,round,shadow,aura,detail}=row;
 return [presetId,Object.freeze({
  name,tagline:'Atelier / 2026',collection:'studio-v2',pattern:id(art),
  main,card,navBar:card,iconBox:card,iconGlyph:action,action,secondaryAccent:alt,text,mutedText:muted,borderColor:border,buttonText:main,
  artBase:base,artPrimary:p,artSecondary:s,artGlow:glow,artStrength:92,artDetail:detail,artWeight:100,artZoom:100,artPositionX:50,artPositionY:50,
  panelPattern:id(panel),featurePattern:id(feature),
  panelArtBase:card,panelArtPrimary:panelP,panelArtSecondary:panelS,panelArtGlow:text,
  featureArtBase:card,featureArtPrimary:featureP,featureArtSecondary:featureS,featureArtGlow:text,
  fontFamily:font,headingFont:heading,density,buttonStyle:button,heroCardStyle:hero,heroActionStyle:cta,heroSize:'balanced',heroActionAlign:'end',
  patternTarget:'all',intensity:27,glow:25,edges:54,roundness:round,buttonRoundness:Math.max(6,round-2),buttonFill:88,iconMode:'two-tone',
  fontSize:100,cardPadding:density==='spacious'?17:14,cardShadow:shadow,headerOpacity:97,patternScale:100,borderWidth:1,
  buttonHeight:46,accentBlend:30,aura,sheen:35,detail,psyPaletteMode:'custom',psyBackground:card,psyPrimary:action,psySecondary:alt,psyAccent:action,psyOutline:main,psyStroke:44,
  heroActionWidth:100,heroActionHeight:46,heroActionGlow:cta==='neon-line'?30:11,heroActionBorder:1,heroActionIcon:'show',heroActionSubtitle:'auto',
  heroCardEmblem:hero==='minimal'?'hidden':'subtle',panelOpacity:97
 })];
};
export const ATELIER_PRESETS=Object.freeze(Object.fromEntries(ROWS.map(derive)));
export const ATELIER_PRESET_IDS=Object.freeze(ROWS.map(x=>x.id));
