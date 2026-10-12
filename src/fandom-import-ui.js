import {esc,icon} from './ui.js';
import {parseFandomXML,convertFandomPages,suggestedImageMatch,imageKey} from './fandom-import.js';
import {indexArtworkZip} from './fandom-artwork-zip.js';
import {normalizeWikiDraft,validateWikiDraft} from './wiki-studio-model.js';
import {putWikiDraft} from './wiki-studio-storage.js';

const m={prepared:[],skipped:0,total:0,selected:new Set(),files:[],archives:[],label:'',busy:false,done:0,filter:'all',message:'',warnings:[]};
const $=id=>document.getElementById(id);
const status=x=>{m.message=String(x);const node=$('fandomImportStatus');if(node)node.textContent=m.message;};
const issueCount=row=>row.issues.length;
const badge=row=>issueCount(row)===0?'<span class="fandomReady">Ready for review</span>':'<span class="fandomIssues">'+issueCount(row)+' issue(s)</span>';
const rowView=(row,i)=>{
 const d=row.draft;
 return '<article class="fandomImportRow" data-import-row="'+i+'" data-issues="'+issueCount(row)+'">'+
 '<label class="fandomSelect"><input type="checkbox" data-fandom-select="'+i+'" '+(m.selected.has(i)?'checked':'')+' aria-label="Select '+esc(d.title)+'"></label>'+
 '<div><strong>'+esc(d.title)+'</strong><small>'+esc(d.category)+' · '+esc(d.id)+'</small>'+
 '<p>'+esc(d.summary.slice(0,140)||'Needs an article summary')+'</p>'+
 '<div class="fandomRowStatus">'+badge(row)+(row.images.length?'<small>'+row.images.length+' image reference(s)</small>':'')+'</div>'+
 (row.issues.length?'<details><summary>Conversion details</summary><div>'+row.issues.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div></details>':'')+'</div>'+
 '<button type="button" class="btn secondary" data-fandom-action="inspect" data-idx="'+i+'">Inspect</button></article>';
};
const score=()=>({images:m.prepared.reduce((n,x)=>n+x.images.length,0),issues:m.prepared.filter(x=>x.issues.length).length,
 ready:m.prepared.filter(x=>!x.issues.length).length});
export function fandomImportView(){
 const numbers=score();
 return '<div class="studioHeader"><div><span class="eyebrow">ARCANAWIKI · MIGRATION WORKSPACE</span><h1>Fandom Import Manager</h1><p>Bring over wiki pages and artwork, inspect conversion issues, then save private drafts for editor review. Nothing is published by importing.</p></div>'+
 '<button class="btn secondary" data-ws-action="list">Back to Wiki Studio</button></div>'+
 '<div class="fandomImporter"><div class="studioHomeActions"><label class="btn primary studioUpload">'+icon('file',17)+' Choose Fandom XML<input id="fandomXmlInput" type="file" accept=".xml,text/xml,application/xml"></label>'+
 '<label class="btn secondary studioUpload">'+icon('image',17)+' Add image files<input id="fandomImageInput" type="file" accept="image/png,image/jpeg,image/webp" multiple></label>'+
 '<label class="btn secondary studioUpload">'+icon('layers',17)+' Add art ZIP<input id="fandomZipInput" type="file" accept=".zip,application/zip" multiple></label></div>'+
 '<p class="mutedSmall">MediaWiki Special:Export XML works best. Image binaries are normally separate from XML. Local PNG, JPEG, WebP or ZIP artwork is matched by filename; no pictures are fetched from Fandom automatically.</p>'+
 (m.prepared.length?'<div class="fandomStats">'+[
  [m.total,'Export pages'],[m.prepared.length,'Article drafts'],[numbers.issues,'Require review'],[numbers.images,'Image references']
 ].map(([num,label])=>'<div><strong>'+num+'</strong><span>'+label+'</span></div>').join('')+'</div>'+
 '<div class="fandomImportBar"><label>Show <select id="fandomImportFilter"><option value="all" '+(m.filter==='all'?'selected':'')+'>All pages</option><option value="issues" '+(m.filter==='issues'?'selected':'')+'>Needs review</option><option value="ready" '+(m.filter==='ready'?'selected':'')+'>Ready</option></select></label>'+
 '<button class="btn secondary" data-fandom-action="pilot">Select first 10</button><button class="btn secondary" data-fandom-action="select-all">Select all</button><button class="btn secondary" data-fandom-action="select-none">Clear</button></div>'+
 '<div class="fandomImportEntries">'+m.prepared.map(rowView).join('')+'</div>'+
 '<div class="fandomImportBar"><button class="btn primary" data-fandom-action="save" '+(m.busy?'disabled':'')+'>'+icon('check',16)+' Save selected as private drafts</button>'+
 '<button class="btn secondary" data-fandom-action="report">Export conversion report</button></div>'+
 '<p class="mutedSmall">Saving happens in batches of up to 25 pages to protect mobile storage. Imported drafts stay on this device until an approved Wiki Editor publishes them. Always keep the original Fandom export.</p>':
 '<div class="studioZero"><span>'+icon('file',28)+'</span><h2>Start with your wiki export</h2><p>Choose a Fandom XML export to see a review checklist. Nothing will overwrite an existing published article, and no page is published automatically.</p></div>')+
 '<p id="fandomImportStatus" role="status">'+esc(m.message)+'</p></div>';
}
const rowVisible=row=>m.filter==='all'||(m.filter==='issues'?row.issues.length>0:row.issues.length===0);
function updateFilter(){
 m.prepared.forEach((row,i)=>{const el=document.querySelector('[data-import-row="'+i+'"]');if(el)el.hidden=!rowVisible(row);});
}
function prepareSelection(){
 m.selected=new Set(m.prepared.slice(0,10).map((_,i)=>i));
}
export async function fandomImportFile(el,{existingIds=[],repaint}={}){
 const files=[...(el.files||[])];el.value='';
 if(!files.length)return;
 try {
  if(el.id==='fandomXmlInput'){
   const file=files[0];
   if(file.size>25_000_000)throw Error('XML export must be under 25 MB. Split larger exports.');
   status('Reading article pages…');
   const pages=parseFandomXML(await file.text());
   const result=convertFandomPages(pages,{existingIds});
   m.prepared=result.drafts;m.skipped=result.skipped;m.total=result.total;
   m.label=file.name;m.done=0;m.filter='all';prepareSelection();
   status('Found '+m.total+' pages. '+m.prepared.length+' articles prepared, '+m.skipped+' non-article/redirect/empty pages skipped.');
  }else if(el.id==='fandomImageInput'){
   m.files.push(...files.filter(f=>/^image\/(png|jpeg|webp)$/.test(f.type)));
   m.files=m.files.slice(0,1500);
   status(m.files.length+' individual artwork files available for exact-name matching.');
  }else if(el.id==='fandomZipInput'){
   status('Indexing local art ZIP…');
   for(const file of files.slice(0,3))m.archives.push(await indexArtworkZip(file));
   status('Indexed '+m.archives.reduce((n,a)=>n+a.entries.length,0)+' eligible artwork filenames from ZIP files.');
  }
  repaint();
 }catch(e){status(e.message||e);}
}
export function fandomImportToggle(index,checked){
 if(!Number.isInteger(index)||index<0||index>=m.prepared.length)return;
 if(checked)m.selected.add(index);else m.selected.delete(index);
}
const report=()=>({
 format:'arcana-fandom-migration-report',version:1,source:m.label,generatedAt:new Date().toISOString(),
 total:m.total,skipped:m.skipped,rows:m.prepared.map(row=>({
  sourceTitle:row.sourceTitle,slug:row.draft.id,issues:row.issues,images:row.images,
  missingLinks:row.unresolvedLinks,sourceUrl:row.draft.sourceUrl
 }))
});
const downloadReport=()=>{
 const blob=new Blob([JSON.stringify(report(),null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='arcana-fandom-import-report.json';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),15000);
};
const matchImage=ref=>{
 const direct=suggestedImageMatch(ref,m.files);
 if(direct.length===1)return {get:()=>direct[0],name:direct[0].name};
 const archiveMatches=m.archives.flatMap(archive=>archive.entries.filter(entry=>imageKey(entry.name)===imageKey(ref)).map(entry=>({archive,entry})));
 if(archiveMatches.length===1)return {get:()=>archiveMatches[0].archive.extract(archiveMatches[0].entry),name:archiveMatches[0].entry.name};
 return null;
};
async function prepareDraft(row,convertImage){
 const draft=normalizeWikiDraft(row.draft);
 let attached=0,unmatched=0;
 for(const section of draft.sections){
  if(!section.imageRef)continue;
  if(draft.images.length>=10){unmatched++;continue;}
  const match=matchImage(section.imageRef);
  if(!match){unmatched++;continue;}
  try{
   const file=await match.get(),dataUrl=await convertImage(file);
   const id='image-'+crypto.randomUUID().slice(0,20);
   section.imageId=id;
   draft.images.push({id,name:match.name,alt:section.imageRef.replace(/_/g,' '),caption:'',dataUrl});
   attached++;
  }catch(e){unmatched++;}
 }
 return {draft,attached,unmatched};
}
export async function fandomImportAction(btn,{convertImage,openDraft,repaint}={}){
 const action=btn.dataset.fandomAction,index=Number(btn.dataset.idx);
 if(action==='pilot'){prepareSelection();repaint();return;}
 if(action==='select-none'){m.selected.clear();repaint();return;}
 if(action==='select-all'){m.selected=new Set(m.prepared.map((_,i)=>i));repaint();return;}
 if(action==='report'){downloadReport();status('Downloaded the import review report.');return;}
 if(action==='inspect'){
  const row=m.prepared[index];if(!row)return;
  const draft=await putWikiDraft({...row.draft,recordId:'draft-'+crypto.randomUUID()});
  status('Opened a local review draft. No content was published.');
  openDraft(draft);return;
 }
 if(action!=='save'||m.busy)return;
 const indices=[...m.selected].filter(i=>Number.isInteger(i)&&i>=0&&i<m.prepared.length).slice(0,25);
 if(!indices.length){status('Select at least one page.');return;}
 m.busy=true;status('Saving private drafts…');
 let saved=0,images=0,missing=0;
 try{
  for(const index of indices){
   const {draft,attached,unmatched}=await prepareDraft(m.prepared[index],convertImage);
   await putWikiDraft({...draft,recordId:'draft-'+crypto.randomUUID()});
   saved++;images+=attached;missing+=unmatched;m.selected.delete(index);
   status('Saved '+saved+'/'+indices.length+' private drafts…');
  }
  m.done+=saved;
  status('Saved '+saved+' private drafts and attached '+images+' exact-name images. '+missing+' references need manual review. Open Wiki Studio drafts to edit.');
 }catch(e){status('Stopped after '+saved+' saved pages: '+String(e.message||e));}
 finally{m.busy=false;repaint();}
}
export function fandomImportFilter(value){m.filter=['all','issues','ready'].includes(value)?value:'all';updateFilter();}
export function resetFandomImport(){m.prepared=[];m.files=[];m.archives=[];m.selected.clear();m.message='';}
