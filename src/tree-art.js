/* Arcana-designed semantic icon illustrations. The original game art always wins when a verified icon URL exists. */
import {esc} from './ui.js';
export function passiveTitle(value){
 return String(value||'Passive').replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim().toLowerCase().replace(/\b[a-z]+\b/g,x=>({hp:'HP',exp:'EXP',xp:'XP',acs:'ACS',str:'STR',dex:'DEX',int:'INT',ad:'AD',pve:'PvE',pvp:'PvP'}[x]||x[0].toUpperCase()+x.slice(1)));
}
const art={
 shield:'<path d="M32 8 49 15v16c0 12-8 21-17 26-9-5-17-14-17-26V15Z"/><path d="m24 32 6 6 11-13"/>',
 sword:'<path d="m19 49 24-30 4-7 6 6-7 4-25 29-8 1 1-8Z"/><path d="m18 39 9 8M15 54l-5 5"/>',
 double:'<path d="m14 48 22-30 6-6 5 5-5 6-23 30Z M29 48l11-15 7-6 5 5-6 6-12 16Z"/><path d="m14 37 8 6m14-13 8 6"/>',
 slash:'<path d="M17 50 42 15l9-5-4 11-25 35-10-1 2-9Z"/><path d="m10 19 13 7-9 8M38 46l15 5M10 8l7 6"/>',
 impact:'<path d="m15 39 22-27 8 6-20 30-14 6Z"/><path d="m37 23 20-9-10 19 14 6-20 7"/><path d="m9 20 9 5M5 30l12 4"/>',
 banner:'<path d="M18 8v50M18 10h34l-7 12 7 12H18Z"/><path d="m32 14 3 6 6 1-5 4 2 6-6-3-5 3 2-6-5-4 6-1Z"/>',
 heart:'<path d="M32 53 11 32c-12-12 8-29 21-12 13-17 33 0 21 12Z"/>',
 focus:'<circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="8"/><path d="M32 5v14M32 45v14M5 32h14M45 32h14"/>',
 speed:'<path d="M8 19h25M4 29h18M6 39h24M35 12c12 4 18 13 18 22 0 12-10 20-22 20"/><path d="m30 19 12 13-12 13"/>',
 spark:'<path d="m33 5 6 21 20 6-20 6-6 21-7-21-20-6 20-6Z"/><path d="M13 9v10M8 14h10"/>',
 gold:'<circle cx="29" cy="34" r="20"/><path d="M35 22c-16-7-24 11-6 12s9 22-7 13M29 16v37"/><path d="M45 12 53 8l4 8"/>',
 gem:'<path d="m32 8 23 21-23 28L9 29Z"/><path d="M9 29h46M32 8l-11 21 11 28 11-28Z"/>',
 paw:'<circle cx="17" cy="19" r="5"/><circle cx="29" cy="13" r="5"/><circle cx="43" cy="19" r="5"/><circle cx="50" cy="31" r="4"/><path d="M22 35c5-10 16-10 21 0 11 13-2 24-11 18-9 6-22-5-10-18Z"/>',
 book:'<path d="M10 14c9-4 17-3 22 2 5-5 13-6 22-2v36c-11-2-17-1-22 5-5-6-11-7-22-5Z"/><path d="M32 16v39M16 24l11 3M38 27l10-3"/>',
 wind:'<path d="M6 21h33c12 0 12-15 1-15-7 0-10 5-9 9M4 33h45c12 0 12 15 1 15-7 0-9-5-8-9M9 45h21c9 0 9 11 0 11"/>',
 flame:'<path d="M33 5c6 12-6 17 5 27 4-7 11-10 8-19 21 17 13 43-12 43C10 56 8 36 19 22c1 11 7 15 14 16-8-11-7-23 0-33Z"/>',
 heal:'<path d="M23 9h18v14h14v18H41v14H23V41H9V23h14Z"/>',
 dodge:'<path d="M38 8 19 28l11 4-15 24 30-29-13-1Z"/><path d="M8 10h13M6 16h17"/>',
 chest:'<rect x="8" y="24" width="48" height="30" rx="4"/><path d="M8 32h48M22 24v30M43 24v30M10 24l8-14h28l8 14"/><rect x="27" y="31" width="10" height="12" rx="2"/>',
 star:'<path d="m32 7 7 16 18 2-14 12 5 19-16-9-16 9 5-19L7 25l18-2Z"/>',
 armor:'<path d="M23 9 12 17 7 35l10 7 5-10v22h20V32l5 10 10-7-5-18-11-8-9 10Z"/><path d="M26 28h12l-6 17Z"/>',
 blood:'<path d="M32 5c-8 16-21 26-21 38a21 21 0 0 0 42 0C53 31 40 21 32 5Z"/><path d="M20 39a12 12 0 0 0 11 13"/>',
 eclipse:'<circle cx="32" cy="32" r="23"/><path d="M41 9c-22 13-22 31 0 46 8-9 10-31 0-46Z"/>',
 intelligence:'<path d="M24 13c-14 0-19 21-8 27-4 9 5 18 16 13 11 5 20-4 16-13 11-6 6-27-8-27-2-9-14-9-16 0Z"/><path d="M32 13v40M16 30h16M32 38h16"/>'
};
function symbolFor(name){const n=String(name||'').toLowerCase();
 if(/pet/.test(n))return 'paw';if(/material/.test(n))return 'gem';if(/item.*drop|loot/.test(n))return 'chest';if(/gold/.test(n))return 'gold';if(/exp|experience|knowledge/.test(n))return 'book';if(/max.hp|health|life|vitality/.test(n))return 'heart';if(/defense|defence|armor|resist/.test(n))return 'shield';if(/dodge|evasion/.test(n))return 'dodge';if(/dexterity|haste|speed/.test(n))return 'wind';if(/intelligence|mana|magic/.test(n))return 'intelligence';if(/crit/.test(n))return 'focus';if(/double.hit|multi.hit/.test(n))return 'double';if(/double.damage/.test(n))return 'flame';if(/cull|execut|stab|cut|precision shot|dagger/.test(n))return 'sword';if(/rend|slash|cleav|cascade/.test(n))return 'slash';if(/savage|blow|shatter|crush|smash|bash/.test(n))return 'impact';if(/constitution|iron|fortitude|guard|harden|unbreak|tough|barrier/.test(n))return 'armor';if(/banner|standard/.test(n))return 'banner';if(/pact|bleed|blood/.test(n))return 'blood';if(/retaliat/.test(n))return 'shield';if(/war cry|roar|howl/.test(n))return 'flame';if(/attack|strength/.test(n))return 'sword';if(/heal|regen/.test(n))return 'heal';if(/fire|burn/.test(n))return 'flame';if(/drop|shard|crystal/.test(n))return 'gem';if(/shadow|umbral|night|stealth/.test(n))return 'eclipse';if(/frost|cold|ice/.test(n))return 'gem';if(/energy|arcane|unstable|spell/.test(n))return 'spark';if(/shot|arrow|bow|bolt/.test(n))return 'focus';if(/strike|melee|weapon/.test(n))return 'sword';const choices=['spark','focus','eclipse','shield','double','sword'];let hash=0;for(const char of n)hash=(hash*31+char.charCodeAt(0))>>>0;return choices[hash%choices.length];
}
const classType=name=>/warrior|paladin/.test(name)?'warrior':/archer|ranger|beast/.test(name)?'archer':/mage|wizard/.test(name)?'mage':/rogue|assassin|thief/.test(name)?'rogue':/druid/.test(name)?'druid':'general';
export function classTheme(name){return classType(String(name||'').toLowerCase())}
const emblem={
 warrior:'<path d="M32 6 51 14v17c0 13-9 22-19 27-10-5-19-14-19-27V14Z"/><path d="M32 16v32M22 29h20"/>',
 archer:'<circle cx="32" cy="32" r="21"/><circle cx="32" cy="32" r="11"/><path d="M8 56 54 10m-9 0h9v9"/>',
 mage:'<path d="m32 7 5 18 20 7-20 7-5 18-7-18-18-7 18-7Z"/><circle cx="32" cy="32" r="6"/>',
 rogue:'<path d="m20 48 22-33 8-5-4 10-20 31Z M38 49 17 25 10 14l11 6 23 24Z"/><path d="M19 54 10 58m44-4-8 5"/>',
 druid:'<path d="M44 7C22 10 10 26 14 43c5 17 27 20 40 7-17 3-32-15-27-32 3-6 8-10 17-11Z"/><path d="M38 40c7-2 12-9 12-17-13 2-20 13-20 22"/>',
 general:'<path d="m32 8 20 24-20 24L12 32Z"/><path d="M12 32h40M32 8v48"/>'
};
const aura={warrior:'#ff6b5f',archer:'#52da99',mage:'#af8eff',rogue:'#a88bff',druid:'#e2b969',general:'#a89fff'};
export function motifArt(name,{role='passive',size=30,cls=''}={}){
 const isClass=role==='class',type=isClass?classTheme(name):classTheme(cls),key=isClass?type:symbolFor(name);const paths=isClass?emblem[key]:art[key]||art.star;
 const c=isClass?aura[type]:role==='skill'?aura[type]:'#d5cdf7';const safe=esc(String(key).replace(/[^\w]/g,''));
 return `<svg class="arcanaArt arcanaArt-${safe}" viewBox="0 0 64 64" width="${Number(size)||30}" height="${Number(size)||30}" fill="none" aria-hidden="true" style="--art-ink:${c}"><circle cx="32" cy="32" r="30" fill="var(--art-ink)" fill-opacity=".07"/><circle cx="32" cy="32" r="28" stroke="var(--art-ink)" stroke-opacity=".16"/><g fill="var(--art-ink)" fill-opacity=".18" stroke="var(--art-ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${paths}</g><path d="M14 52 23 57" stroke="white" stroke-opacity=".20" stroke-width="1.4"/></svg>`;
}
export function safeGameAsset(src){let s=String(src||'');if(/^\/assets\/[a-z0-9_.\/-]+\.(svg|png|webp)$/i.test(s))return s; if(/^https:\/\/[a-z0-9.-]+\/(?:assets|images)\/[a-z0-9_.\/-]+\.(svg|png|webp)$/i.test(s))return s;return ''}
