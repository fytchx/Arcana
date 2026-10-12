import {gameArt} from './assets.js';
export function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function icon(name,size=20){const defs={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 search:'<circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 5 5"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 calculator:'<rect x="4.5" y="2" width="15" height="20" rx="2.5"/><path d="M8 7h8M8 12h2m4 0h2M8 16h2m4 0h2"/>',
 flask:'<path d="M9 2h6m-1 0v6l6.4 9.8a2.5 2.5 0 0 1-2.1 3.7H5.7a2.5 2.5 0 0 1-2.1-3.7L10 8V2"/><path d="M7 16h10"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2c0-3 2.1-5 5.5-5s5.5 2 5.5 5v2zM16.5 6a3 3 0 0 1 0 6M17 14c2.3.5 3.5 2 3.5 4v2"/>',
 book:'<path d="M12 5C10 3.5 6.5 3 3 3.5V19c3.4-.5 7 0 9 1.5 2-1.5 5.6-2 9-1.5V3.5C17.5 3 14 3.5 12 5Z"/><path d="M12 5v15.5"/>',
 arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',back:'<path d="m15 18-6-6 6-6"/>',up:'<path d="m7 17 10-10M8 7h9v9"/>',
 box:'<path d="M12 2 3 7l9 5 9-5-9-5Z M3 7v10l9 5 9-5V7M12 12v10"/>',
 shield:'<path d="M12 2 4 5v6c0 5 3 8 8 11 5-3 8-6 8-11V5Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
 cog:'<circle cx="12" cy="12" r="3"/><path d="m12 2 1.5 2.5 3-.2 1.1 3 3 1 0 3-2.1 2 1 3-2.5 2-2.9-1-2.1 2.2-2.5-1.7-3 .4-1.1-3-2.6-1.1.4-3L2 11l1.7-2.4-.3-3L6.5 5 8 2.5l3 1z"/>',
 paw:'<circle cx="6.5" cy="6" r="1.2"/><circle cx="11" cy="4.5" r="1.2"/><circle cx="16" cy="6" r="1.2"/><circle cx="19.5" cy="9.5" r="1.2"/><path d="M8 13c1.5-3 6.5-3 8 0l2 3c.7 2.5-1.2 4-3.5 2.5-1.5-.8-3.5-.8-5 0C7.2 20 5.3 18.5 6 16Z"/>',
 gem:'<path d="m12 2 8 8-8 12-8-12z"/><path d="M4 10h16M12 2l-4 8 4 12 4-12Z"/>',
 sword:'<path d="M14 3h7v7l-9.5 9.5-3.5-3.5zM4 20l4-4M5 12l7 7"/>',
 layers:'<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 git:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v5a7 7 0 0 0 7 7h3M6 12a7 7 0 0 0 7-3h3"/>',
 compare:'<rect x="2" y="3" width="9" height="18" rx="2"/><rect x="13" y="3" width="9" height="18" rx="2"/>',
 bookmark:'<path d="M5 3h14v19l-7-4-7 4z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 close:'<path d="m5 5 14 14M19 5 5 19"/>',check:'<path d="m4 12 5 5 11-11"/>',
 plus:'<path d="M12 4v16M4 12h16"/>',edit:'<path d="M4 20h4l12-12-4-4L4 16z"/>',
 sliders:'<path d="M4 7h16M4 17h16M9 4v6M16 14v6"/>',
 spark:'<path d="m12 2 2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/>',
 link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>'};
 return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${defs[name]||defs.box}</svg>`}
export const boxIcon=kind=>kind==='item'||kind==='guildlisting'?'shield':kind==='verified'||kind==='guide'?'book':kind==='mechanic'?'info':kind==='tool'?'calculator':'users';
export function chip(text,cl=''){return `<span class="chip ${cl}">${esc(text)}</span>`}
export function button(text,action,arg='',cl='secondary',glyph='arrow'){return `<button class="btn ${cl}" data-action="${esc(action)}" data-arg="${esc(arg)}">${glyph?icon(glyph,16):''}<span>${esc(text)}</span></button>`}
export function cardEntity(x){return `<button class="resultRow" data-preview="${esc(x.id)}"><span class="tinyIcon ${x.kind==='item'?'tinyGameArt':''}">${x.kind==='item'?gameArt(x,42):icon(boxIcon(x.kind),19)}</span><span class="resultText"><strong>${esc(x.title)}</strong><small>${esc(x.subtitle)}</small></span>${icon('arrow',16)}</button>`}
