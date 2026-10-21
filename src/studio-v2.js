// Arcana Studio V2 is the one editable interface for newly authored artwork.
 // It deliberately does not render legacy pattern selectors, dead texture knobs
 // or the 42 old preset cards. The back-end draft and publish contract is intact.
import {readDesign} from './design-controls.js';
import {STUDIO_V2_PRESETS,STUDIO_V2_PRESET_IDS,STUDIO_V2_FAMILIES} from './studio-v2-presets.js';
import {VISUAL_ART} from './visual-art.js';
import {designMiniMarkup} from './design-mini-preview.js';
import {themeVaultMarkup} from './theme-studio-vault.js';
import {esc,icon} from './ui.js';

const pixel=new Set(['roundness','buttonRoundness','borderWidth']);
export function studioV2Panel({showPreview=true}={}){
 const d=readDesign();
 const color=(key,label,description='')=>'<label class="designControl designColorControl studioColor">'+
  '<span>'+label+'</span><span class="studioColorPair"><input type="color" data-design-field="'+key+'" value="'+esc(d[key])+'" aria-label="'+label+' color picker">'+
  '<input type="text" data-design-hex="'+key+'" value="'+esc(d[key])+'" maxlength="7" autocapitalize="characters" spellcheck="false" aria-label="'+label+' HEX code" placeholder="#A98BFF"></span>'+
  (description?'<small>'+description+'</small>':'')+'<small data-design-status="'+key+'" class="designHexStatus" role="status">HEX code</small></label>';
 const slider=(key,label,lo,hi,description='')=>'<label class="designControl studioSlider"><span>'+label+'</span><input type="range" min="'+lo+'" max="'+hi+'" step="1" value="'+d[key]+'" data-design-field="'+key+'" aria-label="'+label+'"><strong data-design-value="'+key+'">'+d[key]+(pixel.has(key)?' px':'%')+'</strong>'+(description?'<small>'+description+'</small>':'')+'</label>';
 const select=(key,label,opts,description='')=>'<label class="designControl studioSelect"><span>'+label+'</span><select data-design-field="'+key+'" aria-label="'+label+'">'+opts.map(([v,n])=>'<option value="'+v+'" '+(d[key]===v?'selected':'')+'>'+n+'</option>').join('')+'</select>'+(description?'<small>'+description+'</small>':'')+'</label>';
 const group=(id,title,description,content,opened=false)=>'<details class="designOptionSection studioV2Group" data-theme-group="'+id+'" '+(opened?'open':'')+'><summary><span>'+title+'</span></summary><p class="designOptionDescription">'+description+'</p><div class="designOptionControls">'+content+'</div></details>';
 const keys=STUDIO_V2_PRESET_IDS;
 const cards=keys.map((id,index)=>{
  const p=STUDIO_V2_PRESETS[id];
  const active=p.pattern===d.pattern&&p.main===d.main&&p.action===d.action&&p.artPrimary===d.artPrimary;
  const swatches=[p.main,p.card,p.action,p.secondaryAccent].map(x=>'<i style="background:'+x+'"></i>').join('');
  return '<button type="button" class="designPreset studioV2Preset" data-action="design-preset" data-arg="'+id+'" data-collection="studio-v2" '+(index>=12?'data-preset-extra="true" ':'')+
  'data-studio-family="'+esc(p.tagline)+'" data-preset-search="'+esc((p.name+' '+p.tagline+' '+p.pattern).toLowerCase())+'" aria-pressed="'+active+'" title="'+esc(p.name)+'">'+
  '<span class="studioPresetArtwork" data-studio-preset-art="'+id+'" aria-hidden="true"></span>'+
  '<span class="studioPresetLabel"><strong>'+esc(p.name)+'</strong><small>'+esc(p.tagline)+'</small><span class="studioSwatches">'+swatches+'</span></span></button>';
 }).join('');
 const artCards=VISUAL_ART.map(a=>'<button type="button" class="visionArtChoice studioV2Artwork" data-theme-pattern="'+a.id+'" aria-pressed="'+String(d.pattern===a.id)+'"><span class="visionArtThumb" data-preview-pattern="'+a.id+'" aria-hidden="true"></span><span class="visionArtDetails"><strong>'+esc(a.name)+'</strong><small>'+esc(a.family)+'</small><em>'+esc(a.note)+'</em></span></button>').join('');
 return '<section class="slateSettingsBlock arcanaDesignLab studioV2" aria-label="Arcana Theme Studio 2">'+
  '<div class="studioV2Intro"><span class="launchEyebrow">ARCANA · THEME STUDIO 2</span><h2>Design something worth keeping.</h2><p>Pick a complete look, change the artwork, then tune only the controls that actually affect it. Your edits stay private until you explicitly publish.</p></div>'+
  '<nav class="themeStudioJumps" aria-label="Jump to studio section">'+[['presets','Looks'],['textures','Artwork'],['colors','Colors'],['surfaces','Surfaces'],['type','Type'],['vault','Saved']].map(([id,label])=>'<button type="button" data-theme-jump="'+id+'">'+label+'</button>').join('')+'</nav>'+
  (showPreview?designMiniMarkup():'')+
  '<div class="themeEditorGuidance" data-theme-change-hint role="status"><strong>Everything here is connected.</strong><span>Changes immediately update the miniature and the real Arcana preview.</span></div>'+
  '<section class="themePresetCollection studioV2Looks" data-theme-group="presets" data-show-all="false" data-searching="false" data-studio-filter="All"><header><h3>Curated looks</h3><p>'+keys.length+' complete themes built around genuine vector artwork. The original presets are retired from this editor.</p></header>'+
  '<label class="designPresetSearch">Find a look <input type="search" data-design-preset-search placeholder="Search designs or moods…" autocomplete="off"></label>'+
  '<div class="studioV2FamilyFilters" role="group" aria-label="Preset categories">'+['All',...STUDIO_V2_FAMILIES].map(x=>'<button type="button" data-studio-family-filter="'+esc(x)+'" aria-pressed="'+String(x==='All')+'">'+esc(x)+'</button>').join('')+'</div>'+
  '<div class="studioV2PresetGrid" id="themePresetsGrid">'+cards+'</div>'+
  '<button type="button" class="themeShowMorePresets studioV2ShowAll" data-theme-preset-expand aria-expanded="false" aria-controls="themePresetsGrid">Show all '+keys.length+' looks ↓</button>'+
  '<p class="designPresetEmpty" data-design-no-presets hidden>No looks match this search.</p></section>'+
  '<section class="studioV2ArtworkSection" data-theme-group="textures"><header><h3>Artwork library</h3><p>'+VISUAL_ART.length+' individually composed vectors. Each begins with its intended colors. Nothing is flattened or locked to violet.</p></header>'+
  '<div class="visionArtGrid">'+artCards+'</div>'+
  '<div class="studioV2ArtControls">'+
  group('art-palette','Artwork pigments','These four pigments recolor the actual vectors, not a filter over an image.',[
   color('artBase','Background'),color('artPrimary','Primary lines'),color('artSecondary','Secondary forms'),color('artGlow','Highlight / light')
  ].join(''),true)+
  group('art-shape','Artwork composition','Every slider changes the selected illustration. Zoom and position adjust the paths inside the artwork.',[
   slider('artStrength','Artwork strength',15,100,'Controls the transparency of illustrated shapes, not the background.'),
   slider('artDetail','Line density',25,100,'Adds or removes secondary vector strokes.'),
   slider('artWeight','Line thickness',60,180,'Changes the actual vector stroke width.'),
   slider('artZoom','Artwork zoom',75,155,'Enlarge or shrink the illustrated subject.'),
   slider('artPositionX','Move horizontally',0,100,'50 is centered.'),
   slider('artPositionY','Move vertically',0,100,'50 is centered.'),
   select('patternTarget','Artwork placement',[['all','Page + panels'],['cards','Panels only'],['background','Page only']])
  ].join(''),true)+
  '</div></section>'+
  group('colors','Website colors','These change the actual Arcana UI independently of the artwork pigments.',[
   color('main','Page background'),color('card','Panel background'),color('iconBox','Icon boxes'),color('iconGlyph','Icons'),
   color('action','Primary accent'),color('secondaryAccent','Second accent'),color('text','Text'),color('mutedText','Muted text'),
   color('borderColor','Borders'),color('navBar','Navigation'),color('buttonText','Button text')
  ].join(''),false)+
  group('surfaces','Cards &amp; surfaces','Size, opacity and shadow are connected to the current Arcana homepage and its tool cards.',[
   slider('panelOpacity','Panel opacity',60,100,'How much of the artwork shows through panels.'),
   slider('roundness','Card corners',3,28),slider('borderWidth','Border thickness',0,3),
   slider('cardShadow','Card shadow',0,100),
   slider('buttonRoundness','Button corners',3,30),
   slider('buttonFill','Button fill strength',35,100),
   select('buttonStyle','Button appearance',[['gradient','Gradient'],['solid','Solid'],['outline','Outlined']])
  ].join(''),false)+
  group('type','Type &amp; spacing','Simple typography and content density controls with a visible effect.',[
   select('fontFamily','Interface font',[['system','System'],['rounded','Rounded'],['serif','Serif'],['mono','Monospace']]),
   slider('fontSize','Text size',90,115),
   select('density','Spacing',[['compact','Compact'],['comfortable','Comfortable'],['spacious','Spacious']])
  ].join(''),false)+
  '<section class="themeVaultSection" aria-label="Design vault" data-theme-group="vault"><header><h3>Your saved looks</h3><p>Keep up to twelve private snapshots or export your work.</p></header><div id="themeVaultContents">'+themeVaultMarkup()+'</div></section>'+
  '<div class="designWorkshopActions studioV2Actions"><button type="button" class="btn secondary" data-action="preview-design">'+icon('search',16)+' Full preview</button><button type="button" class="btn secondary" data-action="undo-design">'+icon('back',16)+' Undo</button><button type="button" class="btn secondary" data-action="reset-design">'+icon('close',16)+' Reset</button></div>'+
  '<p class="mutedSmall">Preview is local. The existing protected Admin Publish control is the only way to change the public theme.</p></section>';
}
