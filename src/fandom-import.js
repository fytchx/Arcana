// Client-side MediaWiki/Fandom XML converter. No requests to Fandom, no publishing.
// XML exports contain raw wiki markup, not HTML. Unhandled markup is flagged for review.
import {slugify,normalizeWikiDraft,MAX_SECTIONS} from './wiki-studio-model.js';
const MAX_PAGES=600,MAX_XML_BYTES=25_000_000;
const nonempty=x=>String(x||'').trim();
const clean=x=>nonempty(x).replace(/\u0000/g,'');
const unique=a=>[...new Set(a.filter(Boolean))];
const imageKey=name=>String(name||'').replace(/^(File|Image):/i,'').replace(/_/g,' ').replace(/\.[^.]+$/,'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'');
const categoryFor=(title,categories)=>{
 const text=(title+' '+categories.join(' ')).toLowerCase();
 for(const [re,key] of [
  [/\b(season|starter|beginner|start here)\b/,'Getting Started'],
  [/\b(level|progression|exp |monster level|farming)\b/,'Progression'],
  [/\b(class|mage|rogue|druid|archer|warrior|paladin|beastmaster)\b/,'Classes'],
  [/\b(pet|compound|affix)\b/,'Pets'],
  [/\b(guild)\b/,'Guilds'],
  [/\b(raid|titan|rift)\b/,'Raids'],
  [/\b(rune|runeword)\b/,'Runes'],
  [/\b(gear|item|forge|upgrade|armor|weapon|equipment)\b/,'Equipment'],
  [/\b(build)\b/,'Build Guides'],
  [/\b(stat|formula|damage|bonus|mechanic)\b/,'Mechanics']
 ])if(re.test(text))return key;
 return 'Other';
};
const child=(node,name)=>[...(node?.children||[])].find(x=>x.localName===name)||null;
const children=(node,name)=>[...(node?.children||[])].filter(x=>x.localName===name);
const contentOf=(node,name)=>child(node,name)?.textContent||'';
export function parseFandomXML(xml){
 if(typeof xml!=='string'||xml.length>MAX_XML_BYTES)throw Error('Select a MediaWiki XML export smaller than 25 MB.');
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('XML with DTD or external entities is not supported.');
 if(typeof DOMParser!=='function')throw Error('XML import requires a modern browser.');
 const doc=new DOMParser().parseFromString(xml,'application/xml');
 if(doc.querySelector('parsererror')||doc.documentElement.localName!=='mediawiki')throw Error('Not a valid MediaWiki XML export.');
 const site=child(doc.documentElement,'siteinfo');
 const rootUrl=nonempty(contentOf(site,'base'));
 const siteName=nonempty(contentOf(site,'sitename'));
 const pages=children(doc.documentElement,'page');
 if(pages.length>MAX_PAGES)throw Error('The XML contains more than 600 pages. Split the export into smaller batches.');
 const rows=[];
 for(const page of pages){
  const title=clean(contentOf(page,'title')),ns=Number(contentOf(page,'ns'));
  const revisions=children(page,'revision').sort((a,b)=>contentOf(a,'timestamp').localeCompare(contentOf(b,'timestamp')));
  const latest=revisions.at(-1),revisionAt=contentOf(latest,'timestamp');
  const revisionText=contentOf(latest,'text');
  const contributor=nonempty(contentOf(child(latest,'contributor'),'username'));
  rows.push({title,namespace:Number.isFinite(ns)?ns:0,redirect:!!child(page,'redirect')||/^#REDIRECT\b/i.test(revisionText.trim()),
   text:revisionText,revisionAt,contributors:unique(revisions.map(r=>contentOf(child(r,'contributor'),'username'))),
   latestContributor:contributor,siteName,baseUrl:rootUrl});
 }
 return rows;
}
const extractFiles=source=>{
 const files=[];
 const next=source.replace(/\[\[(?:File|Image):([^\]|#]+)(?:\|[^\]]*)?\]\]/gi,(_,name)=>{files.push(nonempty(name).replace(/_/g,' '));return '';});
 return {text:next,files:unique(files)};
};
const extractCategories=source=>{
 const categories=[];
 const text=source.replace(/\[\[Category:([^\]|]+)(?:\|[^\]]*)?\]\]/gi,(_,name)=>{categories.push(nonempty(name).replace(/_/g,' '));return '';});
 return {text,categories:unique(categories)};
};
const stripTemplates=(raw,warnings)=>{
 // Templates do not execute outside MediaWiki; preserve their text on the private report.
 const infobox=[];
 let text=raw.replace(/\{\{\s*(?:Infobox|Itembox|Petbox|Characterbox)\b([\s\S]*?)\}\}/gi,(_,body)=>{
  const bits=body.split(/\n\s*\|/);
  for(const part of bits){const i=part.indexOf('=');if(i<0)continue;const name=clean(part.slice(0,i).replace(/^\|/,'')),value=clean(part.slice(i+1)).replace(/'{2,3}/g,'');
   if(name&&value)infobox.push([name.slice(0,100),value.slice(0,220)]);}
  return '';
 });
 if(/\{\{/.test(text)){warnings.push('Unconverted templates remain; check the original page.');text=text.replace(/\{\{[^{}]{0,1200}\}\}/g,'');}
 return {text,infobox};
};
function parseTable(lines,start){
 const rows=[];let cells=[],header=null,i=start+1;
 const commit=()=>{if(cells.length){rows.push(cells.slice());cells=[];}};
 for(;i<lines.length;i++){
  const line=lines[i].trim();
  if(/^\|\}/.test(line)){commit();break;}
  if(/^\|-/.test(line)){commit();continue;}
  if(/^\|\+/.test(line))continue;
  if(/^!/.test(line)){
   const parts=line.slice(1).split('!!').map(x=>clean(x.split(/\s\|\s/).at(-1)).slice(0,220));
   if(header===null)header=parts;else cells.push(...parts);
   continue;
  }
  if(/^\|/.test(line)){
   const parts=line.slice(1).split('||').map(x=>clean(x.replace(/^[^|]{0,120}\|/,'')).slice(0,220));
   cells.push(...parts);
  }else if(cells.length&&line){cells[cells.length-1]+=' '+line.slice(0,150);}
 }
 if(i===lines.length)commit();
 if(header)rows.unshift(header);
 return {rows:rows.slice(0,35).map(row=>row.slice(0,12)),end:i};
}
export const importLinkMarkup=(value,escapeFn)=>{
 const s=String(value||''),parts=/\[\[arcana:([a-z0-9]+(?:-[a-z0-9]+)*)\|([^\]]{1,125})\]\]/g;
 let out='',pos=0,m;
 while((m=parts.exec(s))){out+=escapeFn(s.slice(pos,m.index));
  out+='<a class="wikiImportedInlineLink" href="#/wiki/article?id='+encodeURIComponent(m[1])+'">'+escapeFn(m[2])+'</a>';
  pos=parts.lastIndex;
 }
 return out+escapeFn(s.slice(pos));
};
function cleanBody(raw,slugMap,notes,images){
 let value=raw;
 const img=extractFiles(value);value=img.text;images.push(...img.files);
 // Only map targets present in the import or known published articles; never invent a destination.
 value=value.replace(/\[\[([^\]]+)\]\]/g,(_,inside)=>{
  const [first,...tail]=inside.split('|'),page=nonempty(first).split('#')[0].replace(/_/g,' '),label=nonempty(tail.at(-1)||first).replace(/_/g,' ');
  if(/^(?:File|Image|Category|Help|Special|User|Template):/i.test(page))return '';
  const resolved=slugMap.get(page.toLowerCase());
  if(resolved)return '[[arcana:'+resolved+'|'+label.slice(0,125)+']]';
  if(page){notes.unresolvedLinks.push(page);}
  return label;
 });
 value=value.replace(/\[https?:\/\/[^\s\]]+(?:\s+([^\]]+))?\]/g,(_,label)=>label||'External reference');
 value=value.replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi,'').replace(/<ref\b[^>]*\/>/gi,'');
 value=value.replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]+>/g,'');
 value=value.replace(/'''''([^']+)'''''/g,'$1').replace(/'''([^']+)'''/g,'$1').replace(/''([^']+)''/g,'$1');
 value=value.replace(/^[:;]+\s*/gm,'').replace(/^([\*#]+)\s*/gm,'- ').replace(/^----+\s*$/gm,'');
 value=value.replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&');
 return value.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
const wikiPageUrl=(root,title)=>{
 if(!root)return '';
 try{const url=new URL(root);if(url.protocol!=='https:')return '';
  const index=url.pathname.indexOf('/wiki/');
  if(index<0)return '';
  url.pathname=url.pathname.slice(0,index)+'/wiki/'+encodeURIComponent(title.replace(/ /g,'_'));
  url.search='';url.hash='';return url.href.slice(0,500);
 }catch{return '';}
};
export function convertFandomPages(pages,{existingIds=[]}={}){
 const accepted=pages.filter(x=>x&&x.namespace===0&&!x.redirect&&x.title&&x.text.trim());
 const skip=pages.length-accepted.length;
 const used=new Set(existingIds),slugs=new Map();
 for(const page of accepted){
  let slug=slugify(page.title)||'untitled';
  const base=slug;let n=2;
  while(used.has(slug))slug=slugify('imported-'+base+(n>2?'-'+n:'')),n++;
  used.add(slug);slugs.set(page.title.toLowerCase().replace(/_/g,' '),slug);
 }
 const drafts=accepted.map(page=>{
  const notes={warnings:[],unresolvedLinks:[],imageNames:[],categories:[]};
  const cats=extractCategories(page.text);notes.categories=cats.categories;
  const extracted=stripTemplates(cats.text,notes.warnings),raw=extracted.text;
  const lines=raw.split(/\r?\n/),sections=[];
  let current={title:'Overview',body:[],table:null,imageNames:[]};
  const finish=()=>{
   if(current.body.length||current.table?.length||current.imageNames.length)
    sections.push({...current,body:current.body.join('\n').trim()});
  };
  const useContent=rawText=>{const cleaned=cleanBody(rawText,slugs,notes,current.imageNames);if(cleaned)current.body.push(cleaned);};
  if(extracted.infobox.length){
   sections.push({title:'At a glance',body:'Key details from the original article.',table:[['Field','Value'],...extracted.infobox],imageNames:[]});
  }
  for(let i=0;i<lines.length;i++){
   const line=lines[i],heading=line.match(/^(={2,6})\s*(.+?)\s*\1\s*$/);
   if(heading){finish();current={title:clean(heading[2]).slice(0,100),body:[],table:null,imageNames:[]};continue;}
   if(/^\s*\{\|/.test(line)){
    const parsed=parseTable(lines,i);i=parsed.end;
    if(current.table){finish();current={title:(current.title+' (table)').slice(0,100),body:[],table:null,imageNames:[]};}
    current.table=parsed.rows;
    if(!current.body.length)current.body.push('Reference table from the original article.');
    continue;
   }
   useContent(line);
  }
  finish();
  if(!sections.length)sections.push({title:'Overview',body:'',imageNames:[]});
  if(sections.length>MAX_SECTIONS)notes.warnings.push('More than 35 sections: additional sections were not imported.');
  const imageNames=unique(sections.flatMap(s=>s.imageNames));
  const missingLinks=unique(notes.unresolvedLinks);
  if(missingLinks.length)notes.warnings.push(missingLinks.length+' internal link target(s) not found in this XML batch or existing guide list.');
  if(imageNames.length)notes.warnings.push(imageNames.length+' image reference(s) need matching local files.');
  if(/season\s*1|\bS1\b|preseason/i.test(page.title+' '+page.text))notes.warnings.push('Possible legacy/Season 1 content. Review against current game rules.');
  if(/\{\||\{\{|\[\[[^a]/i.test(page.text)&&/\{\{/.test(page.text))notes.warnings.push('Check advanced MediaWiki markup for conversion gaps.');
  const converted=sections.slice(0,MAX_SECTIONS).map((sec,i)=>({
   id:'section-'+(i+1),title:sec.title||'Details',
   body:sec.body.slice(0,8000),table:sec.table||[],imageId:'',imageRef:sec.imageNames[0]||''
  }));
  if(sections.some(x=>x.body?.length>8000))notes.warnings.push('At least one section exceeds the 8,000-character Studio limit. Full source must be checked.');
  if(sections.some(x=>x.imageNames.length>1))notes.warnings.push('Multiple images in one section require manual placement.');
  const bodyText=sections.map(s=>s.body).join(' ').replace(/\[\[arcana:[^\]|]+\|([^\]]+)\]\]/g,'$1');
  const summary=clean(bodyText).replace(/\s+/g,' ').slice(0,330);
  const slug=slugs.get(page.title.toLowerCase().replace(/_/g,' '));
  const sourceUrl=wikiPageUrl(page.baseUrl,page.title);
  const draft=normalizeWikiDraft({
   id:slug,title:page.title,category:categoryFor(page.title,cats.categories),summary,
   keywords:unique([...cats.categories,...page.title.split(/\s+/)]).join(', ').slice(0,390),
   sourceLabel:'Original Fandom article (edit history and attribution)',sourceUrl,
   sections:converted,
   relatedArticles:unique(sections.flatMap(section=>[...String(section.body).matchAll(/\[\[arcana:([a-z0-9-]+)\|/g)].map(x=>x[1]))).filter(x=>x!==slug)).slice(0,10),
   importSource:{sourceTitle:page.title,sourceUrl,revisionAt:page.revisionAt,contributors:page.contributors,
    siteName:page.siteName,images:imageNames,unresolvedLinks:missingLinks,warnings:notes.warnings}
  });
  return {draft,issues:notes.warnings,sourceTitle:page.title,images:imageNames,unresolvedLinks:missingLinks};
 });
 return {drafts,skipped:skip,total:pages.length};
}
export function suggestedImageMatch(ref,files){
 const key=imageKey(ref);
 return files.filter(f=>imageKey(f.name)===key);
}
export {imageKey};
