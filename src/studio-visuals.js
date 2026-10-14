/* Arcana Studio iconography: simple vector silhouettes, never decorative item art.
 * Class emblems are deliberately distinct, and equipment icons carry no item stats. */
import {esc} from './ui.js';

const SHAPES={
 warrior:'<path d="M32 6 47 12 46 30c-1 11-7 19-14 26-8-7-14-15-15-26l-1-18Z"/><path d="m22 20 10 8 10-8M32 28v20"/>',
 archer:'<path d="M17 9C52 13 54 50 17 55M21 9l24 46M45 9 21 55"/><path d="M14 32h36m-9-6 9 6-9 6"/>',
 mage:'<path d="m32 6 17 23-17 28-17-28Z"/><path d="m32 6 0 51M15 29h34M23 17l9 12 9-12"/>',
 rogue:'<path d="M19 8v43l-5 5M45 8v43l5 5"/><path d="m19 8 10 12-10 4M45 8 35 20l10 4M26 41l6-9 6 9"/>',
 druid:'<path d="M32 57V27m0 14C7 41 10 13 17 10c13 3 16 14 15 31Zm0-2c26 0 27-25 16-31-12 5-16 16-16 31Z"/><path d="M26 51c-7 0-11-4-14-11M38 51c7 0 11-4 14-11"/>'
};
const OUTLINES={
 torch:'<path d="m20 8 12 7 12-7v18L32 35 20 26zM27 37v17h10V37"/>',
 head:'<path d="M12 35V22c0-13 9-18 20-18s20 5 20 18v13l-8 3-5-7H25l-5 7zM20 44l12 12 12-12M24 22h16"/>',
 neck:'<path d="M13 14c0 13 6 25 19 32 13-7 19-19 19-32M32 39l-8 9 8 12 8-12z"/>',
 weapon:'<path d="m42 7 15 15-9 7-5-6-21 28-8-8 28-21-6-6zM13 46l-6 6 5 5 6-6"/>',
 chest:'<path d="m20 6 12 7 12-7 14 13-9 12v26H15V31L6 19zM22 18l10 7 10-7M15 32h34"/>',
 offhand:'<path d="M32 5 54 14v19c0 12-10 20-22 26C20 53 10 45 10 33V14zM32 16v29M20 30h24"/>',
 ring:'<circle cx="32" cy="35" r="18"/><path d="m23 18 9-12 9 12-9 11z"/>',
 ring2:'<circle cx="32" cy="35" r="18"/><path d="m23 18 9-12 9 12-9 11z"/>',
 belt:'<path d="M6 22h52v20H6zM23 17h18v30H23zM28 27h8v10h-8z"/>',
 charm:'<path d="M19 13c0-9 26-9 26 0M19 13l-7 22 20 23 20-23-7-22zM32 24v22m-9-13h18"/>',
 charm2:'<path d="M19 13c0-9 26-9 26 0M19 13l-7 22 20 23 20-23-7-22zM32 24v22m-9-13h18"/>',
 hands:'<path d="M16 56 10 35c-1-6 3-10 7-8l5 7V13c0-7 8-7 8 0v17-20c0-7 8-7 8 0v20-14c0-6 8-5 8 1v21l4-5c5-4 10 0 8 6l-11 17z"/>',
 feet:'<path d="M20 8h24v24l13 13v10H7V43l13-11zM20 32h24M7 45h50"/>'
};
const art=(paths,kind='profile')=>'<svg class="arcanaSilhouette" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-kind="'+kind+'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">'+paths+'</svg>';
export function classEmblem(cls){const kind=String(cls||'warrior').toLowerCase();return art(SHAPES[kind]||SHAPES.warrior,esc(kind))}
export function slotSilhouette(slot){return art(OUTLINES[slot]||OUTLINES.chest,'equipment')}
export const STUDIO_PORTRAIT_KEY='arcana-studio-portrait-local-v1';
export function readStudioPortrait(){
 try{const url=localStorage.getItem(STUDIO_PORTRAIT_KEY);return typeof url==='string'&&url.length<90000&&/^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(url)?url:null}catch{return null}
}
export function clearStudioPortrait(){try{localStorage.removeItem(STUDIO_PORTRAIT_KEY);return true}catch{return false}}
export async function setStudioPortrait(file){
 if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPEG or WebP image.');
 if(file.size>3*1024*1024)throw Error('Choose an image smaller than 3 MB.');
 if(typeof createImageBitmap!=='function')throw Error('Image uploads need an up-to-date browser.');
 const bitmap=await createImageBitmap(file);
 try{
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;
  const context=canvas.getContext('2d',{alpha:false});if(!context)throw Error('Your browser could not prepare the portrait.');
  context.fillStyle='#141824';context.fillRect(0,0,160,160);
  const size=Math.min(bitmap.width,bitmap.height),sx=(bitmap.width-size)/2,sy=(bitmap.height-size)/2;
  context.drawImage(bitmap,sx,sy,size,size,0,0,160,160);
  let url=canvas.toDataURL('image/webp',.77);
  if(!url.startsWith('data:image/webp'))url=canvas.toDataURL('image/jpeg',.7);
  if(url.length>90000)throw Error('Image could not be compressed enough. Try a simpler picture.');
  try{localStorage.setItem(STUDIO_PORTRAIT_KEY,url)}catch{throw Error('Your browser has no space to save this picture.');}
  return url;
 }finally{bitmap.close()}
}
