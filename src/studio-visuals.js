/* Build Studio profile icons are part of the same Arcana Minimal library as every
 * other site asset; one shared vector language and independent icon colors. */
import {arcanaIcon} from './arcana-icons.js';
export function classEmblem(cls){
 const known=['warrior','archer','mage','rogue','druid'];
 const name=String(cls||'').toLowerCase();
 const id=known.includes(name)?name:'warrior';
 return '<span class="arcanaSilhouette" data-kind="'+id+'">'+arcanaIcon('class-'+id,44)+'</span>';
}
export function slotSilhouette(slot){
 const known=['torch','head','neck','weapon','chest','offhand','ring','ring2','belt','charm','charm2','hands','feet'];
 const id=known.includes(slot)?slot:'chest';
 return '<span class="arcanaSilhouette" data-kind="equipment">'+arcanaIcon('equipment-'+id,32)+'</span>';
}
export const STUDIO_PORTRAIT_KEY='arcana-studio-portrait-local-v1';
export function readStudioPortrait(){
 try{const url=localStorage.getItem(STUDIO_PORTRAIT_KEY);return typeof url==='string'&&url.length<90000&&/^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(url)?url:null}catch{return null}
}
export function clearStudioPortrait(){try{localStorage.removeItem(STUDIO_PORTRAIT_KEY);return true}catch{return false}}
export async function setStudioPortrait(file){
 if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPEG or WebP image.');
 if(file.size>3*1024*1024)throw Error('Choose an image smaller than 3 MB.');
 // Support browsers that don't implement createImageBitmap for uploaded files.
 let bitmap=null,photo=null,objectUrl=null;
 if(typeof createImageBitmap==='function'){
  try{bitmap=await createImageBitmap(file)}catch{}
 }
 if(!bitmap){
  objectUrl=URL.createObjectURL(file);
  photo=await new Promise((resolve,reject)=>{
   const element=new Image();
   element.onload=()=>resolve(element);
   element.onerror=()=>reject(Error('Could not read that picture.'));
   element.src=objectUrl;
  }).catch(err=>{URL.revokeObjectURL(objectUrl);objectUrl=null;throw err});
 }
 try{
  const image=bitmap||photo;
  const width=bitmap?.width||photo.naturalWidth,height=bitmap?.height||photo.naturalHeight;
  if(!width||!height||width>12000||height>12000)throw Error('That picture has unsupported dimensions.');
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;
  const context=canvas.getContext('2d',{alpha:false});if(!context)throw Error('Your browser could not prepare the portrait.');
  context.fillStyle='#141824';context.fillRect(0,0,160,160);
  const size=Math.min(width,height),sx=(width-size)/2,sy=(height-size)/2;
  context.drawImage(image,sx,sy,size,size,0,0,160,160);
  let url=canvas.toDataURL('image/webp',.77);
  if(!url.startsWith('data:image/webp'))url=canvas.toDataURL('image/jpeg',.7);
  if(url.length>90000)throw Error('Image could not be compressed enough. Try a simpler picture.');
  try{localStorage.setItem(STUDIO_PORTRAIT_KEY,url)}catch{throw Error('Your browser has no space to save this picture.');}
  return url;
 }finally{bitmap?.close();if(objectUrl)URL.revokeObjectURL(objectUrl)}
}
