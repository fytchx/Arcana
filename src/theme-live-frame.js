// Read-only, same-origin preview skin. Changes only an embedded page's DOM styles.
// This never writes browser storage, invokes publishing endpoints or grants editor roles.
import {psychedelicSvg} from './psychedelic-patterns.js';
import {artUrl} from './visual-art.js';
const colorMap={main:'--theme-main',card:'--theme-secondary',action:'--arcana-action-color',text:'--arcana-design-text',secondaryAccent:'--arcana-secondary-accent',borderColor:'--arcana-border-color',mutedText:'--arcana-muted-text',navBar:'--arcana-nav-panel',buttonText:'--arcana-button-text'};
const fontMap={system:'system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',rounded:'ui-rounded,Trebuchet MS,system-ui,sans-serif',serif:'Georgia,Times New Roman,serif',mono:'ui-monospace,SFMono-Regular,Consolas,monospace'};
export function decorateLiveFrame(frame,values){
 let doc;try{doc=frame?.contentDocument;if(!doc||frame.contentWindow.location.origin!==location.origin)return false;}catch{return false}
 const root=doc.documentElement;if(!root||!doc.querySelector('#content'))return false;
 root.dataset.arcanaDesignActive='true';
 for(const [k,prop] of Object.entries(colorMap))root.style.setProperty(prop,values[k]);
 for(const [k,v] of Object.entries({
 '--bg':values.main,'--panel':values.card,'--panel2':values.navBar,'--accent':values.action,'--text':values.text,'--line':values.borderColor,
 '--theme-highlight':values.action,'--accentTint':`color-mix(in srgb,${values.action} 13%,transparent)`,
 '--arcana-panel-opacity':String(values.panelOpacity/100),'--arcana-icon-color':values.action,'--arcana-atlas-panel':values.card,'--arcana-atlas-icon-box':values.iconBox,'--arcana-atlas-icon':values.iconGlyph,'--radius':values.roundness+'px',
 '--arcana-wave-opacity':String(values.intensity/100),'--arcana-pattern-alpha':Math.round(values.intensity*.16)+'%',
 '--arcana-premium-pattern-alpha':Math.round(values.intensity*.35)+'%','--arcana-glow-alpha':String(values.glow/100),
 '--arcana-signature-aura':String(values.aura/100),'--arcana-signature-sheen':String(values.sheen/100),'--arcana-signature-detail':String(values.detail/100),
 '--arcana-edge-alpha':String(values.edges/100),'--arcana-card-radius':values.roundness+'px',
 '--arcana-button-radius':values.buttonRoundness+'px','--arcana-button-fill':values.buttonFill+'%',
 '--arcana-hero-cta-width':values.heroActionWidth+'%','--arcana-hero-cta-height':values.heroActionHeight+'px',
 '--arcana-hero-cta-glow':String(values.heroActionGlow/100),'--arcana-hero-cta-border':values.heroActionBorder+'px',
 '--arcana-font-scale':String(values.fontSize/100),'--arcana-card-padding':values.cardPadding+'px',
 '--arcana-shadow-depth':String(values.cardShadow/100),'--arcana-header-opacity':values.headerOpacity+'%',
 '--arcana-pattern-scale':String(values.patternScale/100),'--arcana-border-width':values.borderWidth+'px',
 '--arcana-button-height':values.buttonHeight+'px','--arcana-accent-blend':values.accentBlend+'%',
 '--arcana-design-font-family':fontMap[values.fontFamily]||fontMap.system
 }))root.style.setProperty(k,v);
 const svg=psychedelicSvg(values.pattern,values);
 if(svg)root.style.setProperty('--psychedelic-texture',svg);
 else root.style.removeProperty('--psychedelic-texture');
 const visual=artUrl(values.pattern,values);
 if(visual)root.style.setProperty('--arcana-visual-art',visual);
 else root.style.removeProperty('--arcana-visual-art');
 for(const [k,v] of Object.entries({
 arcanaDesignPattern:values.pattern,arcanaPatternTarget:values.patternTarget,arcanaDesignDensity:values.density,
 arcanaDesignButtonStyle:values.buttonStyle,arcanaIconMode:values.iconMode,
 arcanaHeroCardStyle:values.heroCardStyle,arcanaHeroCardEmblem:values.heroCardEmblem,
 arcanaHeroActionAlign:values.heroActionAlign,arcanaHeroActionIcon:values.heroActionIcon,
 arcanaHeroActionSubtitle:values.heroActionSubtitle,arcanaHeroActionStyle:values.heroActionStyle,arcanaHeroSize:values.heroSize
 }))root.dataset[k]=String(v);
 // DOM-only: do not modify the child app's editor privilege flags.
 return true;
}
