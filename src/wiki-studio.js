import {esc,icon} from './ui.js';
import {navCards,NAV_DESTINATIONS} from './context-nav.js';
import {WIKI_ARTICLES} from './wiki-data.js';
import {STUDIO_VERSION,WIKI_STUDIO_CATEGORIES,MAX_IMAGE_BYTES,MAX_ARTICLE_IMAGES,newWikiDraft,normalizeWikiDraft,validateWikiDraft,publicWikiArticle,slugify} from './wiki-studio-model.js';
import {listWikiDrafts,getWikiDraft,putWikiDraft,deleteWikiDraft} from './wiki-studio-storage.js';

const s={loaded:false,entries:[],draft:null,mode:'list',error:'',message:'',timer:null,dirty:false,publishing:false,publishEnabled:false};
const $=id=>document.getElementById(id);
const getRoot=()=>document.querySelector('#wikiStudioRoot');
const status=message=>{s.message=message;const el=$('wikiStudioStatus');if(el)el.textContent=message;};
const message=error=>{s.error=String(error?.message||error);status(s.error)};
const fileDownload=(name,content,mime='application/json')=>{
 const url=URL.createObjectURL(new Blob([content],{type:mime}));
 const link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
};
const imageOptions=selected=>'<option value="">No image</option>'+s.draft.images.map(image=>'<option value="'+esc(image.id)+'" '+(image.id===selected?'selected':'')+'>'+esc(image.name||image.alt||image.id)+'</option>').join('');
const toolbar='<div class="studioHeader"><div><span class="eyebrow">ARCANAWIKI · CONTENT WORKSPACE</span><h1>Wiki Studio</h1><p>Write articles, attach images, build helpful links, preview and export. Drafts are private to this browser until published.</p></div><button type="button" class="btn secondary" data-ws-action="list">All drafts</button></div>';
const sectionCard=(section,i)=>'<article class="studioSection"><header><span class="eyebrow">SECTION '+(i+1)+'</span><div class="studioSectionTools"><button type="button" data-ws-action="section-up" data-idx="'+i+'" '+(i===0?'disabled':'')+' aria-label="Move section up">↑</button><button type="button" data-ws-action="section-down" data-idx="'+i+'" '+(i===s.draft.sections.length-1?'disabled':'')+' aria-label="Move section down">↓</button><button type="button" data-ws-action="section-remove" data-idx="'+i+'" aria-label="Remove section">×</button></div></header>'+
 '<label>Heading<input type="text" data-ws-section="'+i+'" data-ws-property="title" maxlength="100" value="'+esc(section.title)+'" placeholder="What players should know"></label>'+
 '<label>Content<textarea data-ws-section="'+i+'" data-ws-property="body" maxlength="8000" rows="6" placeholder="Write clear explanations. Separate paragraphs with blank lines. Use - for bullet points.">'+esc(section.body)+'</textarea></label>'+
 '<label>Illustration<select data-ws-section="'+i+'" data-ws-property="imageId">'+imageOptions(section.imageId)+'</select></label></article>';
const imageCard=(image,i)=>'<article class="studioImage"><img src="'+esc(image.dataUrl)+'" alt="'+esc(image.alt||'Image preview')+'" loading="lazy"><div><strong>'+esc(image.name)+'</strong><label>Alt text<input data-ws-image="'+i+'" data-ws-property="alt" maxlength="200" value="'+esc(image.alt)+'" placeholder="Describe the image for screen readers"></label><label>Caption<input data-ws-image="'+i+'" data-ws-property="caption" maxlength="240" value="'+esc(image.caption)+'" placeholder="Optional caption"></label><button type="button" class="studioDanger" data-ws-action="image-remove" data-idx="'+i+'">Remove image</button></div></article>';
const relatedOptions=()=>Object.entries(NAV_DESTINATIONS).filter(([_,v])=>v.route&&!['wiki/article','wiki/library'].includes(v.route)).map(([key,v])=>'<option value="'+esc(key)+'">'+esc(v.label)+'</option>').join('');
function preview(){
 const d=s.draft,errs=validateWikiDraft(d,{existingIds:WIKI_ARTICLES.map(a=>a.id)}).errors;
 const arts=d.sections.map(sec=>{
  const img=d.images.find(x=>x.id===sec.imageId);
  const paragraphs=String(sec.body||'').split(/\n\s*\n/).filter(Boolean).map(part=>{
   const lines=part.split('\n').map(x=>x.trim()).filter(Boolean);
   if(lines.length&&lines.every(x=>x.startsWith('- ')))return '<ul>'+lines.map(x=>'<li>'+esc(x.slice(2))+'</li>').join('')+'</ul>';
   return '<p>'+lines.map(esc).join(' ')+'</p>';
  }).join('');
  return '<section class="studioPreviewSection"><h2>'+esc(sec.title||'Untitled section')+'</h2>'+paragraphs+(img?'<figure><img src="'+esc(img.dataUrl)+'" alt="'+esc(img.alt)+'"><figcaption>'+esc(img.caption)+'</figcaption></figure>':'')+'</section>';
 }).join('');
 return toolbar+'<div class="studioPreview"><div class="studioPreviewActions"><button class="btn secondary" data-ws-action="edit">'+icon('back',16)+' Back to editor</button><button class="btn primary" data-ws-action="export">Export backup</button></div>'+
 (errs.length?'<p class="studioAlert">Still needs work: '+errs.map(esc).join(' · ')+'</p>':'<p class="studioReady">Ready for publishing review.</p>')+
 '<article class="wikiArticle studioArticle"><div class="wikiArticleIntro"><span class="wikiEyebrow">'+esc(d.category)+'</span><h1>'+esc(d.title||'Untitled article')+'</h1><p>'+esc(d.summary||'Add a summary to introduce this topic.')+'</p></div><div class="wikiArticleBody">'+arts+'</div>'+
 (d.relatedTools.length?'<div class="studioPreviewLinks"><h2>Related tools</h2><div class="arcanaConnections">'+navCards(d.relatedTools)+'</div></div>':'')+
 (d.sourceUrl?'<p class="wikiSource">Reference: <a href="'+esc(d.sourceUrl)+'" rel="noopener noreferrer" target="_blank">'+esc(d.sourceLabel||'Source')+'</a></p>':'')+'</article></div><p id="wikiStudioStatus" role="status">'+esc(s.message)+'</p>';
}
function editor(){
 const d=s.draft,validation=validateWikiDraft(d,{existingIds:WIKI_ARTICLES.map(a=>a.id)});
 return toolbar+'<div class="studioEditor"><div class="studioControlBar"><button class="btn primary" data-ws-action="preview">'+icon('book',16)+' Preview article</button><button class="btn secondary" data-ws-action="export">'+icon('arrow',16)+' Export backup</button><button class="btn secondary" data-ws-action="publish" '+(s.publishing?'disabled':'')+'>'+icon('check',16)+' '+(s.publishing?'Publishing…':'Publish')+'</button></div>'+
 '<p class="studioWorkflow"><strong>Draft → Preview → Publish.</strong> Saving is automatic. Publishing requires an owner key and configured server access; export gives you a portable backup at any time.</p>'+
 '<div class="studioEditorGrid"><div class="studioEditorMain"><section class="studioFieldset"><h2>Article details</h2>'+
 '<label>Title<input data-ws-field="title" maxlength="125" value="'+esc(d.title)+'" placeholder="e.g. Pet Compound explained"></label>'+
 '<label>Page URL slug<input data-ws-field="id" maxlength="70" value="'+esc(d.id)+'" placeholder="pet-compound-guide" autocapitalize="none" spellcheck="false"><small>Permanent public page URL. Choose a unique slug.</small></label>'+
 '<label>Category<select data-ws-field="category">'+WIKI_STUDIO_CATEGORIES.map(c=>'<option '+(c===d.category?'selected':'')+'>'+esc(c)+'</option>').join('')+'</select></label>'+
 '<label>Short summary<textarea data-ws-field="summary" maxlength="350" rows="3" placeholder="A concise explanation of why someone should read this.">'+esc(d.summary)+'</textarea></label>'+
 '<label>Search keywords<input data-ws-field="keywords" maxlength="400" value="'+esc(d.keywords)+'" placeholder="separate keywords with commas"></label></section>'+
 '<section class="studioFieldset"><div class="studioSectionHead"><h2>Article sections</h2><button class="btn secondary" data-ws-action="section-add">'+icon('plus',16)+' Add section</button></div><p class="mutedSmall">Write normal paragraphs or use lines beginning with a dash for bullet points. Images can appear below any section.</p>'+
 d.sections.map(sectionCard).join('')+'</section>'+
 '<section class="studioFieldset"><div class="studioSectionHead"><h2>Images & screenshots</h2><label class="studioUpload">'+icon('plus',18)+' Upload images<input id="wikiStudioUpload" type="file" accept="image/png,image/jpeg,image/webp" multiple></label></div><p class="mutedSmall">Images are optimized for phones and saved inside your draft. Max '+MAX_ARTICLE_IMAGES+' images. Add alt text and assign each image to a section above.</p>'+
 '<div class="studioImageList">'+(d.images.map(imageCard).join('')||'<p class="studioEmptyMini">No images yet. Upload screenshots, diagrams or artwork.</p>')+'</div></section>'+
 '</div><aside class="studioEditorAside"><section class="studioFieldset"><h2>Page quality</h2><div class="studioValidation">'+(validation.errors.length?validation.errors.map(x=>'<p>'+icon('info',15)+' '+esc(x)+'</p>').join(''):'<p class="studioReady">'+icon('check',16)+' All required fields are complete.</p>')+'</div></section>'+
 '<section class="studioFieldset"><h2>Sources</h2><label>Source description<input data-ws-field="sourceLabel" value="'+esc(d.sourceLabel)+'" placeholder="Official patch notes / in-game verification"></label><label>Optional HTTPS link<input type="url" data-ws-field="sourceUrl" value="'+esc(d.sourceUrl)+'" placeholder="https://…"></label></section>'+
 '<section class="studioFieldset"><h2>Connected Arcana</h2><p class="mutedSmall">Connect the article directly to relevant tools.</p><div class="studioAddLink"><select id="wikiStudioToolSelect"><option value="">Choose tool…</option>'+relatedOptions()+'</select><button data-ws-action="tool-add">Add</button></div><div class="studioTagList">'+d.relatedTools.map(key=>'<button data-ws-action="tool-remove" data-key="'+esc(key)+'" aria-label="Remove '+esc(NAV_DESTINATIONS[key]?.label||key)+'">'+esc(NAV_DESTINATIONS[key]?.label||key)+' ×</button>').join('')+'</div><label>Related article slugs (comma-separated)<input data-ws-field="relatedArticles" value="'+esc(d.relatedArticles.join(', '))+'" placeholder="season-2, pet-compound"></label></section>'+
 '<section class="studioFieldset"><h2>Draft backups</h2><p class="mutedSmall">Drafts stay in this browser. Export regularly, particularly before clearing browser data or changing devices.</p><button class="btn secondary full" data-ws-action="export">Download article backup</button><button class="btn secondary full" data-ws-action="list">Back to all drafts</button></section></aside></div></div><p id="wikiStudioStatus" role="status">'+esc(s.message)+'</p>';
}
function listing(){
 return toolbar+'<div class="studioHome"><div class="studioHomeActions"><button class="btn primary" data-ws-action="new">'+icon('plus',17)+' New Wiki page</button><label class="btn secondary studioUpload">Import backup<input id="wikiStudioImport" type="file" accept=".json,application/json"></label></div>'+
 '<p class="studioWorkflow">Create guides or articles with screenshots, source links, and connected tools. Drafts save locally and cannot change the public Wiki until approved and published.</p>'+
 '<div class="studioDraftList">'+(s.entries.length?s.entries.map(d=>'<article class="studioDraft"><div><span class="eyebrow">'+esc(d.category||'Guide')+' · '+esc(d.updatedAt?new Date(d.updatedAt).toLocaleDateString():'Draft')+'</span><h2>'+esc(d.title||'Untitled draft')+'</h2><p>'+esc(d.summary||'No summary yet.')+'</p></div><div><button class="btn secondary" data-ws-action="open" data-key="'+esc(d.recordId)+'">Edit draft '+icon('arrow',15)+'</button><button class="studioDanger" data-ws-action="delete" data-key="'+esc(d.recordId)+'">Delete</button></div></article>').join(''):'<div class="studioZero"><span>'+icon('book',28)+'</span><h2>Your Wiki starts here</h2><p>Create your first guide, add screenshots, and preview it just like a real ArcanaWiki article.</p><button class="btn primary" data-ws-action="new">Create first article</button></div>')+'</div>'+
 '<p id="wikiStudioStatus" role="status">'+esc(s.message)+'</p></div>';
}
function repaint(){const root=getRoot();if(root)root.innerHTML=s.mode==='list'?listing():s.mode==='preview'?preview():editor();}
async function refresh(){try{s.entries=await listWikiDrafts();s.loaded=true;s.error='';}catch(err){message(err);s.entries=[];s.loaded=true;}repaint();}
export const wikiStudioView=()=>'<div id="wikiStudioRoot" class="wikiStudio"><p role="status">Opening Wiki Studio…</p></div>';
export async function mountWikiStudio(){if(!getRoot())return;if(!s.loaded)await refresh();else repaint();}
function schedule(){
 s.dirty=true;status('Saving draft…');clearTimeout(s.timer);
 s.timer=setTimeout(async()=>{if(!s.draft)return;try{s.draft=await putWikiDraft(s.draft);s.dirty=false;status('Saved on this device');}catch(e){message(e)}},500);
}
async function flush(){
 if(!s.draft)return;clearTimeout(s.timer);
 if(s.dirty){s.draft=await putWikiDraft(s.draft);s.dirty=false;}
}
const sectionIndex=btn=>Number(btn?.dataset.idx);
async function chooseFile(file){
 if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>12e6)throw Error('Choose a PNG, JPEG or WebP under 12 MB.');
 const src=URL.createObjectURL(file);
 try{
  const image=new Image();
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Could not decode this image.'));image.src=src;});
  let max=1200;
  for(let attempt=0;attempt<5;attempt++,max=Math.round(max*.8)){
   const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
   canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
   const dataUrl=canvas.toDataURL('image/webp',.77-attempt*.08);
   if(dataUrl.length<MAX_IMAGE_BYTES*1.35)return dataUrl;
  }
  throw Error('Image is too detailed. Try a smaller screenshot.');
 }finally{URL.revokeObjectURL(src);}
}
async function handleFile(event){
 const el=event.target;
 if(el.id==='wikiStudioImport'){
  const file=el.files?.[0];if(!file)return;
  try{if(file.size>8e6)throw Error('Backup is too large (maximum 8 MB).');
   const obj=JSON.parse(await file.text());const draft=normalizeWikiDraft(obj.draft||obj);
   draft.recordId='draft-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
   s.draft=await putWikiDraft(draft);s.mode='edit';status('Backup imported as a new draft.');repaint();
  }catch(e){message(e);}return;
 }
 if(el.id==='wikiStudioUpload'){
  const files=[...(el.files||[])];if(!files.length)return;
  if(s.draft.images.length+files.length>MAX_ARTICLE_IMAGES){status('Maximum '+MAX_ARTICLE_IMAGES+' images per article.');return;}
  try{
   for(const file of files){
    const dataUrl=await chooseFile(file);
    s.draft.images.push({id:'image-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),name:file.name.slice(0,100),alt:'',caption:'',dataUrl});
   }
   schedule();repaint();status(files.length+' image(s) attached. Add alt text, then choose their sections.');
  }catch(e){message(e);}return;
 }
}
async function act(btn){
 const action=btn.dataset.wsAction,key=btn.dataset.key;
 try{
  if(action==='list'){await flush();s.mode='list';await refresh();return;}
  if(action==='new'){s.draft={...newWikiDraft(),recordId:'draft-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)};s.mode='edit';schedule();repaint();return;}
  if(action==='open'){await flush();s.draft=await getWikiDraft(key);s.mode='edit';repaint();return;}
  if(action==='delete'){if(!confirm('Delete this local draft? Export a backup first if you need it.'))return;await deleteWikiDraft(key);await refresh();return;}
  if(action==='preview'||action==='edit'){await flush();s.mode=action==='preview'?'preview':'edit';repaint();return;}
  if(action==='section-add'){if(s.draft.sections.length>=35){status('Maximum 35 sections.');return;}s.draft.sections.push({id:'section-'+(s.draft.sections.length+1),title:'',body:'',imageId:''});schedule();repaint();return;}
  if(['section-remove','section-up','section-down'].includes(action)){
   const i=sectionIndex(btn);if(!Number.isInteger(i)||i<0||i>=s.draft.sections.length)return;
   if(action==='section-remove'){if(s.draft.sections.length===1){status('Keep at least one section.');return;}s.draft.sections.splice(i,1);}
   else{const j=i+(action==='section-up'?-1:1);if(j<0||j>=s.draft.sections.length)return;[s.draft.sections[i],s.draft.sections[j]]=[s.draft.sections[j],s.draft.sections[i]];}
   schedule();repaint();return;
  }
  if(action==='image-remove'){const i=sectionIndex(btn);if(!Number.isInteger(i)||i<0||i>=s.draft.images.length)return;const removed=s.draft.images.splice(i,1)[0];for(const section of s.draft.sections)if(section.imageId===removed.id)section.imageId='';schedule();repaint();return;}
  if(action==='tool-add'){const key=$('wikiStudioToolSelect')?.value;if(key&&!s.draft.relatedTools.includes(key)&&NAV_DESTINATIONS[key]?.route){s.draft.relatedTools.push(key);schedule();repaint();}return;}
  if(action==='tool-remove'){s.draft.relatedTools=s.draft.relatedTools.filter(x=>x!==key);schedule();repaint();return;}
  if(action==='export'){await flush();fileDownload('arcana-wiki-'+(slugify(s.draft.title)||'draft')+'.json',JSON.stringify({format:'arcana-wiki-draft',version:STUDIO_VERSION,exportedAt:new Date().toISOString(),draft:normalizeWikiDraft(s.draft)},null,2));status('Backup downloaded.');return;}
  if(action==='publish'){
   await flush();const check=validateWikiDraft(s.draft,{existingIds:WIKI_ARTICLES.map(a=>a.id)});
   if(!check.valid){status('Complete the checklist before publishing: '+check.errors[0]);s.mode='edit';repaint();return;}
   let config=await fetch('/api/wiki/publishing').then(r=>r.json()).catch(()=>({enabled:false}));
   if(!config.enabled){status('Direct publishing is not configured yet. Export the draft JSON so it can be reviewed and added to GitHub.');return;}
   const key=prompt('Owner publishing key (never saved on this device):');if(!key)return;
   s.publishing=true;repaint();
   try{const res=await fetch('/api/wiki/publish',{method:'POST',headers:{'content-type':'application/json','x-arcana-wiki-key':key},body:JSON.stringify({draft:check.draft})});const out=await res.json();if(!res.ok)throw Error(out.error||'Publishing failed.');status('Published to the Wiki source branch. The deployment will update after the build passes.');}
   finally{s.publishing=false;repaint();}
   return;
  }
 }catch(err){message(err);}
}
export function wireWikiStudio(){
 document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-ws-action]');if(!btn||!getRoot())return;
  e.preventDefault();void act(btn);
 });
 document.addEventListener('input',e=>{
  if(!getRoot()||!s.draft)return;const el=e.target;
  if(el.dataset.wsField){
   const key=el.dataset.wsField;
   if(key==='relatedArticles')s.draft.relatedArticles=el.value.split(',').map(slugify).filter(Boolean);
   else if(key==='id')s.draft.id=slugify(el.value);
   else if(key in s.draft)s.draft[key]=el.value;
   schedule();
  }else if(el.dataset.wsSection!==undefined){
   const item=s.draft.sections[Number(el.dataset.wsSection)];
   if(item&&['title','body','imageId'].includes(el.dataset.wsProperty)){item[el.dataset.wsProperty]=el.value;schedule();}
  }else if(el.dataset.wsImage!==undefined){
   const item=s.draft.images[Number(el.dataset.wsImage)];
   if(item&&['alt','caption'].includes(el.dataset.wsProperty)){item[el.dataset.wsProperty]=el.value;schedule();}
  }
 });
 document.addEventListener('change',e=>{if(!getRoot())return;if(['wikiStudioImport','wikiStudioUpload'].includes(e.target.id))void handleFile(e);});
}
