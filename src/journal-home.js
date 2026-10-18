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
  if(title)title.textContent=current.title;
  if(subtitle)subtitle.textContent=current.subtitle;
  const date=new Date(current.publishedAt);
  if(category)category.textContent=current.category.toUpperCase()+' · '+date.toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).toUpperCase();
 }catch{/* Keep the static featured article when offline. */}
}
