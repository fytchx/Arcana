import {gameArt} from './assets.js';
import {arcanaIcon} from './arcana-icons.js';
export function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
// Every Arcana interface glyph is served by our 144-icon Minimal vector registry.
export function icon(name,size=20){return arcanaIcon(name,size)}

export const boxIcon=kind=>kind==='item'||kind==='guildlisting'?'shield':kind==='verified'||kind==='guide'?'book':kind==='mechanic'?'info':kind==='tool'?'calculator':'users';
export function chip(text,cl=''){return `<span class="chip ${cl}">${esc(text)}</span>`}
export function button(text,action,arg='',cl='secondary',glyph='arrow'){return `<button class="btn ${cl}" data-action="${esc(action)}" data-arg="${esc(arg)}">${glyph?icon(glyph,16):''}<span>${esc(text)}</span></button>`}
export function cardEntity(x){return `<button class="resultRow" data-preview="${esc(x.id)}"><span class="tinyIcon ${x.kind==='item'?'tinyGameArt':''}">${x.kind==='item'?gameArt(x,42):icon(boxIcon(x.kind),19)}</span><span class="resultText"><strong>${esc(x.title)}</strong><small>${esc(x.subtitle)}</small></span>${icon('arrow',16)}</button>`}
