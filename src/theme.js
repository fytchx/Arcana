/**
 * Arcana design bridge. Read-only client; the owner changes palettes in the
 * existing authenticated Design Control service. Never expose write credentials.
 */
export const ADMIN_URL='https://arcana-design-control-production.up.railway.app/admin';
export const PUBLIC_THEME_URL='https://arcana-design-control-production.up.railway.app/api/config';
const HEX=/^#[0-9a-fA-F]{6}$/;
// Slate is the stable neutral surface. Only the accent varies by player choice.
const DEFAULT={main:'#0D1019',secondary:'#191E2B',highlight:'#A98BFF'};
export const ACCENT_PRESETS=Object.freeze([
 {id:'neon-green',name:'Neon Green',hex:'#00FF88'},
 {id:'arcane-violet',name:'Arcane Violet',hex:'#A98BFF'},
 {id:'cyan-blue',name:'Cyan Blue',hex:'#13C5F4'},
 {id:'magenta-pink',name:'Magenta Pink',hex:'#F062BE'},
 {id:'amber-gold',name:'Amber Gold',hex:'#FFC14D'},
 {id:'crimson-red',name:'Crimson Red',hex:'#EC464D'},
 {id:'ice-teal',name:'Ice Teal',hex:'#80F0E6'},
 {id:'electric-lime',name:'Electric Lime',hex:'#B8FF29'},
 {id:'royal-indigo',name:'Royal Indigo',hex:'#6964E8'},
 {id:'white-silver',name:'White Silver',hex:'#E8E9ED'}
]);
export const SITE_SURFACES=Object.freeze([
 {id:'slate',name:'Arcana Slate',main:'#0D1019',secondary:'#191E2B'},
 {id:'midnight',name:'Midnight',main:'#080E19',secondary:'#142039'},
 {id:'obsidian',name:'Obsidian',main:'#0B0C10',secondary:'#1B1C22'},
 {id:'dusk',name:'Arcane Dusk',main:'#16111E',secondary:'#272035'},
 {id:'managed',name:'Follow Arcana',main:null,secondary:null}
]);
export const ICON_MODES=Object.freeze([
 {id:'neutral',name:'Neutral',detail:'Clean outlines matching text.'},
 {id:'accent',name:'Accent',detail:'Every icon uses the chosen icon color.'},
 {id:'two-tone',name:'Two-tone',detail:'Neutral outlines with colored details.'},
 {id:'muted',name:'Subtle',detail:'Quiet secondary icons.'}
]);
const PLAYER_ACCENT_KEY='arcana-player-accent-v1';
const SITE_SURFACE_KEY='arcana-site-surface-v1';
const ICON_COLOR_KEY='arcana-minimal-icon-color-v1';
const ICON_MODE_KEY='arcana-minimal-icon-mode-v1';
const pick=(key,options,fallback)=>{try{const id=localStorage.getItem(key);return options.includes(id)?id:fallback}catch{return fallback}};
const store=(key,value)=>{try{localStorage.setItem(key,value);return true}catch{return false}};
export const selectedSiteSurface=()=>pick(SITE_SURFACE_KEY,SITE_SURFACES.map(s=>s.id),'slate');
export const selectedIconColor=()=>pick(ICON_COLOR_KEY,['follow-site',...ACCENT_PRESETS.map(x=>x.id)],'follow-site');
export const selectedIconMode=()=>pick(ICON_MODE_KEY,ICON_MODES.map(x=>x.id),'two-tone');
export function setSiteSurface(name){if(!SITE_SURFACES.some(x=>x.id===name)||!store(SITE_SURFACE_KEY,name))return false;applyTheme();return true}
export function setIconColor(name){if(name!=='follow-site'&&!ACCENT_PRESETS.some(x=>x.id===name)||!store(ICON_COLOR_KEY,name))return false;applyTheme();return true}
export function setIconMode(name){if(!ICON_MODES.some(x=>x.id===name)||!store(ICON_MODE_KEY,name))return false;applyTheme();return true}
export function selectedAccent(){
 try{const name=localStorage.getItem(PLAYER_ACCENT_KEY);return name==='site'||ACCENT_PRESETS.some(x=>x.id===name)?name:'arcane-violet';}catch{return 'arcane-violet'}
}
export function setAccent(name){
 if(name!=='site'&&!ACCENT_PRESETS.some(x=>x.id===name))return false;
 try{localStorage.setItem(PLAYER_ACCENT_KEY,name)}catch{return false}
 applyTheme();return true;
}
let config=null;
let currentScope='home';
let listeners=new Set();
export function scopeForRoute(route='home'){
 const first=String(route||'home').replace(/^\/+/, '').split('/')[0];
 return ['home','calculators','labs','lfg','wiki'].includes(first)?first:'home';
}
export function validHex(input){return typeof input==='string'&&HEX.test(input)}
function colors(input,fallback){const obj=input&&typeof input==='object'?input:{};return Object.fromEntries(['main','secondary','highlight'].map(key=>[key,validHex(obj[key])?obj[key].toUpperCase():fallback[key]]))}
export function resolveTheme(settings,scope='home'){
 const s=settings&&typeof settings==='object'?settings:{};
 const base=colors(s.palette,DEFAULT);
 const section=s.sections?.[scope];
 const chosen=section&&section.inherit===false?colors(section,base):base;
 return {scope,palette:chosen,inherit:!section||section.inherit!==false,radius:Math.min(22,Math.max(8,Number(s.radius)||15)),density:s.density==='comfortable'?'comfortable':'compact',minimal:s.minimal!==false,glow:s.glow===true,available:!!config};
}
export function themeStatus(){
 const remote=resolveTheme(config,currentScope),accentChoice=selectedAccent(),surfaceChoice=selectedSiteSurface();
 const custom=ACCENT_PRESETS.find(x=>x.id===accentChoice);
 const surface=SITE_SURFACES.find(x=>x.id===surfaceChoice);
 const palette={
  main:surface?.main||remote.palette.main,
  secondary:surface?.secondary||remote.palette.secondary,
  highlight:custom?.hex||remote.palette.highlight
 };
 const iconColorChoice=selectedIconColor();
 const iconColor=ACCENT_PRESETS.find(x=>x.id===iconColorChoice)?.hex||palette.highlight;
 return {...remote,palette,accentChoice,surfaceChoice,iconColorChoice,iconColor,iconMode:selectedIconMode(),available:remote.available};
}
export function subscribeTheme(cb){listeners.add(cb);return ()=>listeners.delete(cb)}
export function applyTheme(scope=currentScope){
 currentScope=scopeForRoute(scope);
 const resolved=themeStatus();
 if(typeof document==='undefined')return resolved;
 const root=document.documentElement;
 root.style.setProperty('--theme-main',resolved.palette.main);
 root.style.setProperty('--theme-secondary',resolved.palette.secondary);
 root.style.setProperty('--theme-highlight',resolved.palette.highlight);
 root.style.setProperty('--arcana-icon-color',resolved.iconColor);
 root.style.setProperty('--arcana-icon-muted','color-mix(in srgb, '+resolved.palette.secondary+' 48%, #B5BCCB 52%)');
 root.dataset.arcanaIconMode=resolved.iconMode;
 root.dataset.arcanaSurface=resolved.surfaceChoice;
 root.dataset.arcanaIconColor=resolved.iconColorChoice;
 root.style.setProperty('--bg',resolved.palette.main);
 root.style.setProperty('--panel',resolved.palette.secondary);
 root.style.setProperty('--accent',resolved.palette.highlight);
 root.style.setProperty('--accentTint',`color-mix(in srgb, ${resolved.palette.highlight} 13%, transparent)`);
 root.style.setProperty('--line',`color-mix(in srgb, ${resolved.palette.secondary} 83%, white 17%)`);
 root.style.setProperty('--panel2',`color-mix(in srgb, ${resolved.palette.secondary} 90%, white 10%)`);
 root.style.setProperty('--radius',resolved.radius+'px');
 root.dataset.arcanaThemeSection=resolved.scope;
 root.dataset.arcanaThemeDensity=resolved.density;
 root.dataset.arcanaThemeMinimal=String(resolved.minimal);
 root.dataset.arcanaThemeGlow=String(resolved.glow);
 listeners.forEach(cb=>{try{cb(resolved)}catch(_){}});
 return resolved;
}
export async function refreshTheme(){
 if(typeof fetch==='undefined')return applyTheme();
 try{
  const response=await fetch(PUBLIC_THEME_URL,{cache:'no-store',mode:'cors',credentials:'omit'});
  if(!response.ok)throw new Error('Theme API '+response.status);
  const data=await response.json();
  if(!data||typeof data!=='object'||!data.palette||!data.sections)throw new Error('Invalid theme data');
  config=data;
 }catch(err){if(!config)console.info('Arcana theme service unavailable; using default styling.');}
 return applyTheme();
}
export function initTheme(){
 applyTheme();
 void refreshTheme();
 if(typeof window!=='undefined'){
  window.addEventListener('focus',()=>{void refreshTheme()});
  window.addEventListener('pageshow',()=>{void refreshTheme()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refreshTheme()});
 }
}
