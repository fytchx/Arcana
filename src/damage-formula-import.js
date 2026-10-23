import {fieldsFor,fieldNumber} from './damage-formula.js';
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const token='[+\\-]?(?:\\d+(?:[.,]\\d+)*|\\.\\d+)\\s*[KMBTQ]?';
const aliases={
 'attack.additive.equipment':['equipment','equipment bonuses'],
 'attack.layers.tree':['skill tree'],
 'attack.layers.pet':['pet attack bonus','pet bonus'],
 'attack.flat.tree':['skill tree flat','skill tree'],
 'attack.flat.runes':['rune flat','runes flat','runes'],
 'attack.flat.guild':['guild flat','guild'],
 'attack.layers.guild':['guild %','guild bonus'],
 'pet.layers.petDexterity':['pet increased dexterity'],
 'pet.layers.petIntelligence':['pet increased intelligence'],
 'retaliation.event.minimum':['minimum roll'],
 'retaliation.layers.petStrength':['pet increased'],
};
export function parseFormulaText(mode,text){
 const found=new Map(),conflicts=new Set();let group='layers',pending='';
 const put=(id,value)=>{if(!Number.isFinite(fieldNumber(value,fieldsFor(mode).find(f=>f.id===id)?.unit)))return;
  if(found.has(id)&&found.get(id)!==value)conflicts.add(id);else found.set(id,value);};
 const detect=text.match(/(attack damage breakdown|retaliation breakdown|pet damage breakdown)/i)?.[1]?.toLowerCase();
 if(detect&&((detect.startsWith('attack')&&mode!=='attack')||(detect.startsWith('retaliation')&&mode!=='retaliation')||(detect.startsWith('pet')&&mode!=='pet')))return {fields:[],conflicts:[],wrongMode:true};
 for(let line of text.split(/\r?\n/)){
  line=line.trim();if(!line)continue;
  if(/base damage|base pool/i.test(line)){group='base';pending='';continue;}
  if(/additive bonuses/i.test(line)){group='additive';pending='';continue;}
  if(/multiplicative layers/i.test(line)){group='layers';pending='';continue;}
  if(/flat bonuses/i.test(line)){group='flat';pending='';continue;}
  if(/per enemy attack/i.test(line)){group='event';pending='';continue;}
  if(/strength sources|effective multiplier|layered product|combined multiplier|base total|damage per enemy|average/i.test(line)){pending='';continue;}
  if(!/[+%×]|\bx\s*\d|\d\s*[KMBT]\b|\d\s*-\s*\d/i.test(line)&&!/(?:global ratio|defense|blocked attacks|combat stance).*\d/i.test(line)){
   pending=(pending+' '+line).trim().slice(-240);continue;
  }
  if(pending){
   const completeLine=fieldsFor(mode).some(f=>norm(line).includes(norm(f.label)));
   const combined=pending+' '+line;
   const known=fieldsFor(mode).some(f=>norm(combined).startsWith(norm(f.label)));
   if(known&&!completeLine)line=combined;
   pending='';
  }
  const labels=fieldsFor(mode).flatMap(f=>[f.label,...(aliases[mode+'.'+f.id]||[])]).concat(mode==='attack'?['Weapon','Jewelry']:[]).sort((a,b)=>b.length-a.length);
  const matchedLabel=labels.find(label=>line.toLowerCase().includes(label.toLowerCase()));
  if(matchedLabel)line=line.slice(line.toLowerCase().indexOf(matchedLabel.toLowerCase()));
  // Faint section headings are often lost by OCR. Infer only unambiguous
  // rows from their labels and whether their value is a percentage.
  if(mode==='pet'&&/^(runes|guild bonus|skill tree|class skills|converted attack damage)\s+[+\d]/i.test(line))group=/%/.test(line)?'layers':'flat';
  if(mode==='pet'&&/^(equipment affixes|talisman inscription|dexterity|intelligence|companion|pet shards|echo blessings|gear sets|gems|time boost|pet mastery|combat stance)\b/i.test(line))group='layers';
  if(mode==='attack'){
   if(/^(weapon|jewelry)\b/i.test(line))group='base';
   else if(/^(class skills|strength \(from items|intelligence \(from items|talisman attack power)\b/i.test(line))group='additive';
   else if(/^(skill tree flat|guild flat|runes flat|rune flat)\b/i.test(line))group='flat';
   else if(/%/.test(line)&&!/^(class skills|strength \(from items|intelligence \(from items|talisman attack power)/i.test(line))group='layers';
  }
  if(mode==='retaliation'){
   if(/^(reflecting|deflection|bulwark|defense|global ratio)\b/i.test(line))group='base';
   else if(/^(blocked attacks|combat stance|minimum roll)\b/i.test(line))group='event';
   else if(/%/.test(line))group='layers';
  }
  if(mode==='attack'&&group==='base'){
   const kind=/^weapon\b/i.test(line)?'weapon':/^jewelry\b/i.test(line)?'jewelry':null;
   if(kind){const nums=line.replace(/^[a-z\s]+/i,'').match(new RegExp(token,'gi'));
    if(nums?.length>=2){put('base.'+kind+'Min',nums[0].replace(/\s/g,''));put('base.'+kind+'Max',nums[1].replace(/\s/g,''));}continue;}
  }
  const candidates=fieldsFor(mode).filter(f=>f.group===group).flatMap(f=>[f.label,...(aliases[mode+'.'+f.id]||[])].map(label=>({f,label})));
  candidates.sort((a,b)=>norm(b.label).length-norm(a.label).length);
  const match=candidates.find(({label})=>norm(line).startsWith(norm(label)));
  if(!match)continue;
  // The percentage/factor follows the label; labels may themselves contain
  // point counts or "post-100", so never select the first number on the row.
  let value;
  if(match.f.unit==='percent'){
   const percent=line.match(new RegExp('('+token+')\\s*%','i'));
   const factor=line.match(/[×x]\s*(\d+(?:\.\d+)?\s*[KMBTQ]?)/i);
   value=percent?.[1]?.replace(/\s/g,'');
   if(factor){
    const rawFactor=parseFloat(factor[1]),pct=fieldNumber(value,'percent');
    const mismatch=percent&&Number.isFinite(pct)&&Math.abs((1+pct/100)-rawFactor)>.02;
    if(mismatch)conflicts.add(match.f.id);
    if(!percent||/[KMBTQ]/i.test(value)||mismatch)value='x'+factor[1].replace(/\s/g,'');
   }
  }else if(match.f.unit==='factor'){
   value=line.match(/[×x*]\s*(\d+(?:\.\d+)?)/i)?.[1];
  }else{
   value=line.match(new RegExp('('+token+')\\s*$','i'))?.[1]?.replace(/\s/g,'');
  }
  if(value!==undefined)put(match.f.id,value);
 }
 return {fields:[...found].map(([id,value])=>({id,value})),conflicts:[...conflicts],wrongMode:false};
}

let libraryPromise;
async function ocrLibrary(){
 if(!libraryPromise)libraryPromise=new Promise((resolve,reject)=>{
  if(globalThis.Tesseract){resolve(globalThis.Tesseract);return;}
  const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';script.async=true;
  script.onload=()=>resolve(globalThis.Tesseract);script.onerror=()=>{script.remove();libraryPromise=null;reject(Error('Could not load screenshot recognition. Check your connection and try again.'));};document.head.append(script);
 });return libraryPromise;
}
export async function recognizeFormulaScreenshots(files,onProgress=()=>{}){
 if(files.length<1||files.length>3)throw Error('Choose 1–3 screenshots.');
 if(files.some(f=>!/^image\/(png|jpeg|webp)$/.test(f.type)||f.size>15*1024*1024))throw Error('Use PNG, JPG, or WebP images under 15 MB each.');
 onProgress('Loading screenshot reader…');const api=await ocrLibrary();let worker;
 try{
  worker=await api.createWorker('eng',1,{logger:event=>{if(event.status==='recognizing text')onProgress('Reading screenshot… '+Math.round(event.progress*100)+'%');}});
  await worker.setParameters({tessedit_pageseg_mode:'6'});
  const texts=[];
  for(let i=0;i<files.length;i++){
   onProgress('Reading screenshot '+(i+1)+' of '+files.length+'…');
   const bitmap=await createImageBitmap(files[i]);
   try{
    // Dark mobile UI: invert to dark letters on white. Preserve enough
    // horizontal resolution for labels and right-aligned numeric columns.
    const scale=Math.min(2,1800/bitmap.width),canvas=document.createElement('canvas');
    canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
    const ctx=canvas.getContext('2d');ctx.filter='grayscale(1) invert(1)';ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const result=await worker.recognize(canvas);texts.push(result.data.text);
   }finally{bitmap.close();}
  }
  return texts;
 }finally{await worker?.terminate();}
}
