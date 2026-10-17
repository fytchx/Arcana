import {applyDesign,setPublishedDesign,currentPublishedDesign} from './design-controls.js';
/**
 * Arcana design bridge. Read-only client; the owner changes palettes in the
 * existing authenticated Design Control service. Never expose write credentials.
 */
export const ADMIN_URL='https://arcana-design-control-production.up.railway.app/admin';
export const PUBLIC_THEME_URL='https://arcana-design-control-production.up.railway.app/api/config';
const HEX=/^#[0-9a-fA-F]{6}$/;
// Slate is the stable neutral surface. Only the accent varies by player choice.
const DEFAULT={main:'#0D1019',secondary:'#191E2B',highlight:'#A98BFF'};
let publishedNotice={enabled:false,text:''};
export const siteNotice=()=>({...publishedNotice});
export const isThemePublished=()=>Boolean(currentPublishedDesign());
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
const CUSTOM_ACCENT_KEY='arcana-player-custom-accent-v1';
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
export function customAccent(){try{const hex=localStorage.getItem(CUSTOM_ACCENT_KEY);return validHex(hex)?hex.toUpperCase():'#A98BFF'}catch{return '#A98BFF'}}
export function setCustomAccent(value){if(!validHex(value))return false;try{localStorage.setItem(CUSTOM_ACCENT_KEY,value.toUpperCase());localStorage.setItem(PLAYER_ACCENT_KEY,'custom')}catch{return false}applyTheme();return true}
export function selectedAccent(){
 try{const name=localStorage.getItem(PLAYER_ACCENT_KEY);return name==='site'||name==='custom'||ACCENT_PRESETS.some(x=>x.id===name)?name:'arcane-violet';}catch{return 'arcane-violet'}
}
export function setAccent(name){
 if(name!=='site'&&name!=='custom'&&!ACCENT_PRESETS.some(x=>x.id===name))return false;
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
/* Recolor only Arcana branding, never verified in-game artwork. Keeping
 * the original faceted source image means its shading survives theming. */
export function logoFilterForAccent(input){
 if(!validHex(input))return 'none';
 const rgb=[1,3,5].map(i=>parseInt(input.slice(i,i+2),16)/255);
 const hi=Math.max(...rgb),lo=Math.min(...rgb),d=hi-lo;
 if(d<0.055)return 'grayscale(1) brightness(1.15) contrast(1.07)';
 let hue;
 if(hi===rgb[0])hue=((rgb[1]-rgb[2])/d)%6;
 else if(hi===rgb[1])hue=(rgb[2]-rgb[0])/d+2;
 else hue=(rgb[0]-rgb[1])/d+4;
 hue=((hue*60)%360+360)%360;
 // Approximate source brand facet hue. Hue rotation retains highlights,
 // reflections and transparency unlike a flat CSS mask.
 const degrees=((hue-273+540)%360)-180;
 return 'hue-rotate('+degrees.toFixed(1)+'deg) saturate(1.1) brightness(1.035)';
}
export function themeStatus(){
 const remote=resolveTheme(config,currentScope);
 const published=currentPublishedDesign();
 // The public palette never reads individual browsers' old theme preferences.
 const palette=published?{main:published.main,secondary:published.card,highlight:published.action}:remote.palette;
 return {...remote,palette,accentChoice:'site',surfaceChoice:'managed',
  iconColorChoice:'follow-site',iconColor:palette.highlight,
  iconMode:published?.iconMode||'two-tone',available:Boolean(published)||remote.available};
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
 root.style.setProperty('--arcana-logo-filter',logoFilterForAccent(resolved.palette.highlight));
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
  applyDesign(root);
 listeners.forEach(cb=>{try{cb(resolved)}catch(_){}});
 return resolved;
}
export async function refreshTheme(){
 if(typeof fetch==='undefined')return applyTheme();
 try{
  // This first-party endpoint is the authoritative published design for every user.
  const res=await fetch('/api/site/theme',{cache:'no-store',credentials:'omit'});
  if(!res.ok)throw new Error('Public site config '+res.status);
  const site=await res.json();
  setPublishedDesign(site?.design||null);
  const priorNotice=JSON.stringify(publishedNotice);
  publishedNotice=site?.notice?.enabled&&typeof site.notice.text==='string'?{enabled:true,text:site.notice.text}:{enabled:false,text:''};
  if(priorNotice!==JSON.stringify(publishedNotice)&&typeof window!=='undefined')queueMicrotask(()=>window.dispatchEvent(new Event('arcana:site-config-change')));
  if(site?.design){config=null;return applyTheme();}
 }catch(e){console.warn('Published appearance unavailable; retaining last validated theme.');}
 // Compatibility until the Creator publishes the first combined theme.
 try{
  const response=await fetch(PUBLIC_THEME_URL,{cache:'no-store',mode:'cors',credentials:'omit',signal:AbortSignal.timeout(7000)});
  if(response.ok){const data=await response.json();if(data?.palette&&data?.sections)config=data;}
 }catch{}
 return applyTheme();
}
// Preview-only one-time visual reset: preserve accounts, builds, wiki and all other data.
function restorePreviewAppearanceOnce(){
 if(typeof location==='undefined'||location.hostname!=='arcana-preview-app-preview.up.railway.app')return;
 try{
  const migration='arcana-preview-default-appearance-20261014-v1';
  if(localStorage.getItem(migration))return;
  localStorage.setItem(PLAYER_ACCENT_KEY,'arcane-violet');
  localStorage.setItem(SITE_SURFACE_KEY,'slate');
  localStorage.setItem(ICON_COLOR_KEY,'follow-site');
  localStorage.setItem(ICON_MODE_KEY,'two-tone');
  localStorage.setItem(migration,'1');
 }catch{}
}
export function initTheme(){
 if(typeof location!=='undefined'&&location.hostname==='arcana-preview-app-preview.up.railway.app'&&new URLSearchParams(location.search).has('arcana-design-desk')&&window.parent!==window){
  window.addEventListener('message',event=>{
   if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='arcana:design-desk-sync')return;
   applyTheme(currentScope);
  });
 }
 restorePreviewAppearanceOnce();
 applyTheme();
 void refreshTheme();
 if(typeof window!=='undefined'){
  window.setInterval(()=>{if(!document.hidden)void refreshTheme()},240000);
  window.addEventListener('focus',()=>{void refreshTheme()});
  window.addEventListener('pageshow',()=>{void refreshTheme()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refreshTheme()});
 }
}
