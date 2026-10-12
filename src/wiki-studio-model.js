import {NAV_DESTINATIONS} from './context-nav.js';
import {WIKI_CATEGORY_LIST} from './wiki-data.js';
export const STUDIO_VERSION=2;
export const WIKI_STUDIO_CATEGORIES=['Getting Started','Progression','Classes','Equipment','Pets','Runes','Guilds','Raids','Build Guides','Mechanics','Other'];
export const MAX_IMAGE_BYTES=650000;
export const MAX_ARTICLE_IMAGES=10;
export const MAX_SECTIONS=35;
export const slugify=value=>String(value||'').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);
export const newWikiDraft=()=>({id:'',title:'',category:'Getting Started',summary:'',keywords:'',sourceLabel:'',sourceUrl:'',sections:[{id:'section-1',title:'Overview',body:'',imageId:''}],images:[],relatedTools:[],relatedArticles:[],relatedCollections:[],importSource:null,updatedAt:'',status:'draft',baseRevision:''});
const short=(s,n)=>String(s||'').trim().slice(0,n);
const unique=a=>[...new Set(a)];
const normTable=raw=>Array.isArray(raw)?raw.slice(0,35).filter(Array.isArray).map(row=>row.slice(0,12).map(cell=>short(cell,220))):[];
const normImport=raw=>{
 if(!raw||typeof raw!=='object')return null;
 const texts=name=>unique((Array.isArray(raw[name])?raw[name]:[]).map(x=>short(x,240)).filter(Boolean)).slice(0,60);
 return {sourceTitle:short(raw.sourceTitle,160),sourceUrl:/^https:\/\//.test(String(raw.sourceUrl||''))?short(raw.sourceUrl,500):'',
 revisionAt:short(raw.revisionAt,40),siteName:short(raw.siteName,100),contributors:texts('contributors'),
 images:texts('images'),unresolvedLinks:texts('unresolvedLinks'),warnings:texts('warnings'),
 rawWikitext:typeof raw.rawWikitext==='string'?raw.rawWikitext.slice(0,350000):'',
 truncated:raw.truncated===true,reviewed:raw.reviewed===true};
};
export const validImageDataURL=s=>typeof s==='string'&&/^data:image\/(webp|png|jpeg);base64,[a-z0-9+/=]+$/i.test(s)&&s.length<=MAX_IMAGE_BYTES*1.5;
export function normalizeWikiDraft(raw={}){
 const draft=newWikiDraft(),sections=Array.isArray(raw.sections)?raw.sections:[],images=Array.isArray(raw.images)?raw.images:[];
 const output={...draft,id:slugify(raw.id),title:short(raw.title,125),summary:short(raw.summary,350),
 category:WIKI_STUDIO_CATEGORIES.includes(raw.category)?raw.category:'Other',
 keywords:short(raw.keywords,400),sourceLabel:short(raw.sourceLabel,100),
 sourceUrl: /^https:\/\//i.test(String(raw.sourceUrl||''))?short(raw.sourceUrl,500):'',
 status:'draft',updatedAt:short(raw.updatedAt,40),
 baseRevision:/^[a-f0-9]{64}$/.test(String(raw.baseRevision||''))?String(raw.baseRevision):'',
 sections:sections.slice(0,MAX_SECTIONS).map((s,i)=>({id:'section-'+(i+1),title:short(s?.title,100),body:short(s?.body,8000),imageId:slugify(s?.imageId),imageRef:short(s?.imageRef,160),table:normTable(s?.table)})),
 images:images.slice(0,MAX_ARTICLE_IMAGES).filter(x=>x&&validImageDataURL(x.dataUrl)).map((x,i)=>({id:/^image-[a-z0-9-]{1,60}$/.test(String(x.id))?String(x.id):'image-'+(i+1),name:short(x.name,100),alt:short(x.alt,200),caption:short(x.caption,240),dataUrl:x.dataUrl})),
 relatedTools:unique((Array.isArray(raw.relatedTools)?raw.relatedTools:[]).filter(k=>typeof k==='string'&&NAV_DESTINATIONS[k]?.route)).slice(0,10),
 relatedArticles:unique((Array.isArray(raw.relatedArticles)?raw.relatedArticles:[]).map(slugify).filter(Boolean)).slice(0,10),
 relatedCollections:unique((Array.isArray(raw.relatedCollections)?raw.relatedCollections:[]).filter(k=>k!=='all'&&WIKI_CATEGORY_LIST.some(([id])=>id===k))).slice(0,10),
 importSource:normImport(raw.importSource)
 };
 if(!output.sections.length)output.sections=draft.sections;
 const validIds=new Set(output.images.map(x=>x.id));
 output.sections=output.sections.map((s,i)=>({...s,id:'section-'+(i+1),imageId:validIds.has(s.imageId)?s.imageId:''}));
 return output;
}
export function validateWikiDraft(raw,{existingIds=[]}={}){
 const d=normalizeWikiDraft(raw),errors=[];
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.id)||d.id.length<3)errors.push('Choose a unique page URL (3–70 letters, numbers or dashes).');
 if(existingIds.includes(d.id))errors.push('That page URL is already used by a published built-in guide.');
 if(d.title.length<6)errors.push('Add a descriptive article title (at least 6 characters).');
 if(d.summary.length<20)errors.push('Add a reader-friendly summary (at least 20 characters).');
 if(!d.sections.some(s=>s.title.length>=3&&s.body.length>=30))errors.push('Add at least one section with a heading and 30 characters of useful content.');
 if(d.sections.some(s=>s.title&&!s.body.trim()))errors.push('Each named section needs content.');
 if(d.images.some(x=>!x.alt.trim()))errors.push('Every uploaded image needs alternative text.');
 if(d.importSource?.sourceTitle&&!d.sourceUrl)errors.push('Add the original Fandom article URL for attribution before publishing.');
 if(d.importSource?.truncated&&!d.importSource.reviewed)errors.push('Incomplete Fandom conversion: compare against the original source and confirm the page has been fully restored.');
 if(d.sections.some(x=>x.imageRef&&!x.imageId))errors.push('Match each imported image, or clear its original image reference before publishing.');
 if(d.sourceUrl&&!/^https:\/\/[^\s]+$/i.test(d.sourceUrl))errors.push('Source link must be HTTPS.');
 return {draft:d,errors,valid:errors.length===0};
}
export function publicWikiArticle(raw){
 const {draft:d,errors}=validateWikiDraft(raw);
 if(errors.length)throw new Error(errors.join(' '));
 return {id:d.id,title:d.title,category:d.category,summary:d.summary,readTime:Math.max(1,Math.ceil(d.sections.reduce((n,s)=>n+s.body.split(/\s+/).length,0)/220))+' min',
 keywords:d.keywords,sections:d.sections.map(s=>({title:s.title||'Details',body:s.body,imageId:s.imageId,table:s.table})),images:d.images,
 actions:d.relatedTools.map(key=>({label:NAV_DESTINATIONS[key].label,route:NAV_DESTINATIONS[key].route+(NAV_DESTINATIONS[key].params?'?'+new URLSearchParams(NAV_DESTINATIONS[key].params):''),icon:NAV_DESTINATIONS[key].icon})),
 connections:{articles:d.relatedArticles,tools:d.relatedTools,collections:d.relatedCollections},source:'community',sourceLabel:d.sourceLabel,sourceUrl:d.sourceUrl,attribution:d.importSource?{sourceTitle:d.importSource.sourceTitle,sourceUrl:d.importSource.sourceUrl,revisionAt:d.importSource.revisionAt,siteName:d.importSource.siteName,contributors:d.importSource.contributors}:null};
}
