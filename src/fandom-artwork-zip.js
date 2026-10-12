// Read just the referenced artwork from a local ZIP without extracting the entire archive.
// No paths are written to disk or fetched over the network.
const ext=/\.(png|jpe?g|webp)$/i;
const decoder=new TextDecoder();
export async function indexArtworkZip(file){
 if(!file||file.size>120_000_000)throw Error('Choose an artwork ZIP under 120 MB, or split it into smaller archives.');
 const buffer=await file.arrayBuffer(),v=new DataView(buffer);
 const u16=p=>v.getUint16(p,true),u32=p=>v.getUint32(p,true);
 let end=-1;
 for(let at=Math.max(0,buffer.byteLength-65557);at<=buffer.byteLength-22;at++){
  if(u32(at)===0x06054b50){end=at;break;}
 }
 if(end<0)throw Error('Not a supported ZIP archive.');
 const n=u16(end+10),size=u32(end+12),offset=u32(end+16);
 if(n>4000||offset+size>buffer.byteLength)throw Error('Artwork ZIP index is invalid or too large.');
 let pos=offset;const entries=[];
 for(let i=0;i<n;i++){
  if(pos+46>buffer.byteLength||u32(pos)!==0x02014b50)throw Error('Damaged ZIP directory.');
  const flags=u16(pos+8),method=u16(pos+10),compressed=u32(pos+20),uncompressed=u32(pos+24);
  const nlen=u16(pos+28),extra=u16(pos+30),comment=u16(pos+32),local=u32(pos+42);
  if(pos+46+nlen+extra+comment>buffer.byteLength)throw Error('Invalid ZIP filename.');
  const path=decoder.decode(new Uint8Array(buffer,pos+46,nlen));
  pos+=46+nlen+extra+comment;
  const basename=path.split('/').at(-1);
  if(!ext.test(basename)||flags&1||![0,8].includes(method))continue;
  if(uncompressed>12_000_000||local+30>buffer.byteLength||u32(local)!==0x04034b50)continue;
  const length=u16(local+26),extraLen=u16(local+28),start=local+30+length+extraLen;
  if(start+compressed>buffer.byteLength)continue;
  entries.push({name:basename,method,compressed,uncompressed,start});
 }
 return {entries,async extract(entry){
  if(!entries.includes(entry))throw Error('Unknown ZIP artwork entry.');
  const source=new Blob([buffer.slice(entry.start,entry.start+entry.compressed)]);
  const bytes=entry.method===0?source:await new Response(source.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();
  if(bytes.size!==entry.uncompressed||bytes.size>12_000_000)throw Error('Artwork is damaged or too large.');
  const mime=/\.png$/i.test(entry.name)?'image/png':/\.webp$/i.test(entry.name)?'image/webp':'image/jpeg';
  return new File([bytes],entry.name,{type:mime});
 }};
}
