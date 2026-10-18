const form=document.getElementById('journalEditor');
const list=document.getElementById('journalStudioList');
const status=document.getElementById('journalStudioStatus');
const preview=document.getElementById('journalPreviewArea');
let revision=0,articles=[],selected='';
const fields=['title','slug','subtitle','category','coverUrl','body'];
const getField=k=>form.elements.namedItem(k);
const labelStatus=(message,bad=false)=>{status.textContent=message;status.style.color=bad?'#ffb2b2':'#aee2ff';};
const request=async(url,opts={})=>{
 const response=await fetch(url,{credentials:'same-origin',cache:'no-store',...opts});
 const result=await response.json();
 if(!response.ok)throw Error(result.error||'Request failed');
 return result;
};
const escapeHtml=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function drawList(){
 list.replaceChildren();
 for(const p of articles){
  const b=document.createElement('button');b.type='button';
  b.setAttribute('aria-current',p.slug===selected?'true':'false');
  b.textContent=(p.published?'● ':'○ ')+p.title;b.addEventListener('click',()=>select(p.slug));list.append(b);
 }
}
function select(slug){
 selected=slug;
 const p=articles.find(x=>x.slug===slug)||null;
 for(const k of fields)getField(k).value=p?.[k]??(k==='category'?'News':'');
 getField('published').checked=Boolean(p?.published);
 getField('featured').checked=Boolean(p?.featured);
 getField('slug').readOnly=Boolean(p);
 preview.replaceChildren();labelStatus(p?'Editing '+p.title:'New draft');
 drawList();
}
async function load(selectSlug){
 const data=await request('/api/journal/admin');
 revision=data.revision;articles=data.articles;
 select(selectSlug||selected||articles[0]?.slug||'');
}
document.getElementById('journalNew').addEventListener('click',()=>select(''));
document.getElementById('journalPreview').addEventListener('click',()=>{
 const name=getField('title').value||'Untitled';
 const body=getField('body').value||'Nothing to preview yet.';
 preview.innerHTML='<section style="margin:25px 0;border:1px solid #37547a;background:#101e33;border-radius:14px;padding:23px"><h2>Draft preview: '+escapeHtml(name)+'</h2><div class="journalBody">'+body.split(/\n\s*\n/).filter(Boolean).map(block=>block.startsWith('## ')?'<h2>'+escapeHtml(block.slice(3))+'</h2>':'<p>'+escapeHtml(block).replace(/\n/g,'<br>')+'</p>').join('')+'</div></section>';
 preview.scrollIntoView({behavior:'smooth'});
});
form.addEventListener('submit',async e=>{
 e.preventDefault();
 const article=Object.fromEntries(fields.map(k=>[k,getField(k).value.trim()]));
 article.published=getField('published').checked;
 article.featured=getField('featured').checked;
 labelStatus('Saving…');
 try{
  const result=await request('/api/journal/admin',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({expectedRevision:revision,article})});
  revision=result.revision;selected=result.article.slug;
  await load(selected);
  labelStatus(result.article.published?'Published! Open /journal/'+result.article.slug:'Draft saved.');
 }catch(error){labelStatus(error.message,true);}
});
load().catch(error=>labelStatus(error.message,true));
