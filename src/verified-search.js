// Read-only verified October 9 game catalog. Separate from demo UI records and live community listings.
export const verifiedGameSearchEntries=payload=>Array.isArray(payload?.entries)?payload.entries.filter(x=>x?.id?.startsWith('game:')&&x?.title).map(x=>({...x,kind:'verified',gameKind:x.kind,subtitle:x.subtitle+' · Season 2 reference',route:'wiki/reference?id='+encodeURIComponent(x.id),keywords:[x.kind==='item'?String(x.keywords||'').replace(/\bweapon armor boots jewelry\b/ig,''):x.keywords,x.subtitle,x.kind,x.kind==='item'?({feet:'boots shoes footwear sandals',hands:'gloves gauntlets',head:'helmet hat',chest:'chestplate armor',main_hand:'weapon sword bow rod',off_hand:'shield quiver',ring:'rings jewelry',amulet:'necklace amulet jewelry'}[x.slot]||''):''].join(' '),verified:true})):[];
export function mergedSearch(query,groups,{category='all',limit=65}={}){
 const q=String(query||'').trim().toLowerCase();if(!q)return [];
 const tokens=q.replace(/[_-]+/g,' ').split(/\s+/).filter(Boolean);
 return groups.flat().filter(x=>x&&x.title&&(!category||category==='all'||(category==='game'&&x.kind==='verified')||(category==='wiki'&&['wikiarticle','guide','mechanic','verified'].includes(x.kind))||(category==='lfg'&&x.kind==='lfglisting')||(category==='guild'&&x.kind==='guildlisting')||(category==='tools'&&['tool','community','guide','mechanic','item'].includes(x.kind)))).map(x=>{
 const title=x.title.toLowerCase(),space=(x.title+' '+(x.subtitle||'')+' '+(x.keywords||'')+' '+(x.description||'')).toLowerCase();if(!tokens.every(w=>space.includes(w)))return null;
 const score=(title===q?240:0)+(title.startsWith(q)?120:0)+(title.includes(q)?50:0)+(space.includes(q)?25:0)+(x.kind==='guildlisting'?13:0)+(x.kind==='lfglisting'?12:0)+(x.kind==='verified'?9:0)+(x.kind==='tool'?20:0);
 return {...x,score}
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,limit)
}
