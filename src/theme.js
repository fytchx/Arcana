/**
 * Arcana design bridge. Read-only client; the owner changes palettes in the
 * existing authenticated Design Control service. Never expose write credentials.
 */
export const ADMIN_URL='https://arcana-design-control-production.up.railway.app/admin';
export const PUBLIC_THEME_URL='https://arcana-design-control-production.up.railway.app/api/config';
const HEX=/^#[0-9a-fA-F]{6}$/;
const DEFAULT={main:'#0B0E16',secondary:'#171B28',highlight:'#BBA4FF'};
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
export function themeStatus(){return resolveTheme(config,currentScope)}
export function subscribeTheme(cb){listeners.add(cb);return ()=>listeners.delete(cb)}
export function applyTheme(scope=currentScope){
 currentScope=scopeForRoute(scope);
 const resolved=resolveTheme(config,currentScope);
 if(typeof document==='undefined')return resolved;
 const root=document.documentElement;
 root.style.setProperty('--theme-main',resolved.palette.main);
 root.style.setProperty('--theme-secondary',resolved.palette.secondary);
 root.style.setProperty('--theme-highlight',resolved.palette.highlight);
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
