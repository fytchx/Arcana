// Home always features the latest published Journal article, with a static fallback.
let cache=null,lastFetch=0;
export async function hydrateJournalPreview(){
 const link=document.querySelector('[data-journal-latest]');
 if(!link)return;
 try{
  if(!cache||Date.now()-lastFetch>60000){
   const response=await fetch('/api/journal',{cache:'no-store'});
   if(!response.ok)return;
   const payload=await response.json();
   cache=Array.isArray(payload.articles)?payload.articles:[];
   lastFetch=Date.now();
  }
  const current=cache[0];if(!current||!document.contains(link))return;
  link.href=current.url;
  const title=link.querySelector('strong'),category=link.querySelector('.journalHomeCategory'),subtitle=link.querySelector('small');
  if(title)title.textContent=current.teaserTitle||current.title;
  if(subtitle)subtitle.textContent=current.subtitle;
  const date=new Date(current.publishedAt);
  if(category)category.textContent=current.category.toUpperCase()+' · '+date.toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).toUpperCase();

  // Article discovery stays source-backed: show only actually published Journal records.
  // Build and guide pathways below are navigation, not fabricated editorial content.
  const extras=document.getElementById('atlasJournalMore');
  if(extras&&document.contains(extras)&&cache.length>1){
   const frag=document.createDocumentFragment();
   for(const story of cache.slice(1,5)){
    if(!story||typeof story.title!=='string'||typeof story.url!=='string')continue;
    let url;try{url=new URL(story.url,location.origin)}catch{continue}
    if(url.origin!==location.origin||!url.pathname.startsWith('/journal/'))continue;
    const row=document.createElement('a');row.className='atlasJournalExtra';row.href=url.pathname;
    const copy=document.createElement('span');
    const label=document.createElement('em');label.textContent=String(story.category||'Journal');
    const name=document.createElement('strong');name.textContent=story.teaserTitle||story.title;
    const sub=document.createElement('small');sub.textContent=String(story.subtitle||'Explore the full story');
    copy.append(label,name,sub);
    const arrow=document.createElement('span');arrow.className='atlasJournalExtraArrow';arrow.textContent='→';arrow.setAttribute('aria-hidden','true');
    row.append(copy,arrow);frag.append(row);
   }
   if(frag.childNodes.length)extras.replaceChildren(frag);
  }

 }catch{/* Keep the static featured article when offline. */}
}
