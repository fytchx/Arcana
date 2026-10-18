// Anonymous, account-free Build Studio sharing. The build is carried by the link.
// No account, server database, tracking ID, or personal data collection required.
import {normalizeBuild} from './labs-engine.js';
const MAX_LINK=7500,MAX_JSON=65000;
const utf8=new TextEncoder(),utf8Decode=new TextDecoder('utf-8',{fatal:true});
const keys=['id','title','summary','className','characterLevel','monsterLevel','equipment','skills','runes','runeBoard','petSetup','petBonusTargets','petMode','talismans','damageProfile','passiveAlloc','passiveFreeMode','classAllocById','notes'];
function snapshot(build){
 const normalized=normalizeBuild(build),clean={};
 for(const k of keys)if(normalized[k]!==undefined)clean[k]=normalized[k];
 clean.id='shared-build';clean.version='SHARED';
 return clean;
}
function base64url(bytes){
 let text='';for(let i=0;i<bytes.length;i+=4096)text+=String.fromCharCode(...bytes.subarray(i,i+4096));
 return btoa(text).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function unbase64(value){
 if(!/^[a-zA-Z0-9_-]{2,7500}$/.test(value))throw Error('Invalid shared build link.');
 const base=value.replace(/-/g,'+').replace(/_/g,'/');
 const decoded=atob(base+'='.repeat((4-base.length%4)%4));
 return Uint8Array.from(decoded,c=>c.charCodeAt(0));
}
async function streamBytes(stream){
 const reader=stream.getReader(),chunks=[];let size=0;
 for(;;){
  const {value,done}=await reader.read();if(done)break;
  size+=value.length;if(size>MAX_JSON){await reader.cancel();throw Error('Shared build is too large.');}
  chunks.push(value);
 }
 const output=new Uint8Array(size);let offset=0;for(const c of chunks){output.set(c,offset);offset+=c.length;}
 return output;
}
export async function shareBuildToken(build){
 const raw=utf8.encode(JSON.stringify({v:1,build:snapshot(build)}));
 if(raw.length>MAX_JSON)throw Error('Build is too large for a share link.');
 let payload=raw,prefix='u';
 if(typeof CompressionStream!=='undefined'){
  const compressed=await streamBytes(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip')));
  if(compressed.length<raw.length){prefix='g';payload=compressed;}
 }
 const token=prefix+'.'+base64url(payload);
 if(token.length>MAX_LINK)throw Error('This build is too large for a shareable URL. Save your local draft and simplify the notes or rune grid.');
 return token;
}
export async function openBuildToken(token){
 if(typeof token!=='string'||token.length>MAX_LINK||!/^([ug])\.[a-zA-Z0-9_-]+$/.test(token))throw Error('Invalid shared build link.');
 let bytes=unbase64(token.slice(2));
 if(token[0]==='g'){
  if(typeof DecompressionStream==='undefined')throw Error('This browser cannot open compressed build links.');
  bytes=await streamBytes(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')));
 }else if(bytes.length>MAX_JSON)throw Error('Shared build is too large.');
 let parsed;
 try{parsed=JSON.parse(utf8Decode.decode(bytes));}catch{throw Error('This build link is damaged.');}
 if(parsed?.v!==1||!parsed.build||typeof parsed.build!=='object'||!parsed.build.equipment||!Array.isArray(parsed.build.runes))throw Error('Invalid shared build content.');
 const b=snapshot(parsed.build);
 b.title=String(b.title||'Shared Build').slice(0,100);
 b.summary=String(b.summary||'Shared by another Arcana player.').slice(0,350);
 b.notes=String(b.notes||'').slice(0,1500);
 return normalizeBuild(b);
}
