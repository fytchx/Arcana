// Source-hash-bound, lazy, fully static editorial translations.
// English always returns the original reference. A source edit invalidates translations.
import { getLocale, translateEnglish, setOfflineUIDictionary } from './i18n.js';

const cache = new Map(), pending = new Map(), verified = new Map(), originalView = new Set();
let rerender = () => {};
const kinds = new Set(['handbook','guides']);
const supported = new Set(['de','es','fr','it','ja','ko','pl','pt','ru','tr','zh']);
const sourceFields = (kind, doc) => kind === 'guides'
  ? { title:doc.title, summary:doc.summary, body:doc.body }
  : { title:doc.title, answer:doc.answer, body:doc.body };
const marker = (lang, kind, id) => lang+':'+kind+':'+id;
const comparable = (text, pattern) => [...String(text || '').matchAll(pattern)].map(x => x[1] || x[0]);
function contentStructureSafe(source, translated) {
  const original = String(source.body || ''), candidate = String(translated.body || '');
  const numbers = /(?<![A-Za-z])(?:[+\-−]?\d[\d.,]*%?|[Aa]\d+)(?![A-Za-z])/g;
  const wiki = /\[\[([^\]]+)\]\]/g;
  const urls = /\]\((#[^)]*|https:\/\/[^)]*)\)/g;
  const tableWidth = text => text.split('\n').filter(x => x.trim().startsWith('|')).map(x => (x.match(/\|/g) || []).length);
  const equal = (a,b) => JSON.stringify(a)===JSON.stringify(b);
  return equal(comparable(original,numbers).sort(), comparable(candidate,numbers).sort())
    && equal(comparable(original,wiki).map(x=>x.split('|')[0]), comparable(candidate,wiki).map(x=>x.split('|')[0]))
    && equal(comparable(original,urls),comparable(candidate,urls))
    && equal(tableWidth(original),tableWidth(candidate));
}

async function sha256(data) {
  // SHA matches export-i18n-content.mjs JSON.stringify key order and UTF-8 bytes.
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,'0')).join('');
}

export function loadEditorialLocale(lang) {
  if (!supported.has(lang)) return Promise.resolve(null);
  if (cache.has(lang)) return Promise.resolve(cache.get(lang));
  if (pending.has(lang)) return pending.get(lang);
  const p = fetch('/next/generated-locales/'+lang+'.json', {cache:'force-cache'})
    .then(r => r.ok ? r.json() : null)
    .then(result => {
      if (result?.language===lang && result?.schema===1 && result.handbook && result.guides) {
        cache.set(lang,result);
        if (result.ui) setOfflineUIDictionary(lang,result.ui);
        rerender();
        return result;
      }
      return null;
    }).catch(() => null).finally(() => pending.delete(lang));
  pending.set(lang,p);
  return p;
}
export function editorialTranslation(kind, doc) {
  if (!doc || !kinds.has(kind)) return {doc, translated:false};
  const lang = getLocale();
  if (lang==='en' || originalView.has(marker(lang,kind,doc.id))) return {doc,translated:false};
  const pack=cache.get(lang);
  if (!pack) { loadEditorialLocale(lang); return {doc,translated:false}; }
  const translation=pack[kind]?.[doc.id];
  if (!translation?.sourceHash) return {doc,translated:false};
  const original = sourceFields(kind,doc);
  const key=marker(lang,kind,doc.id)+':'+translation.sourceHash+':'+JSON.stringify(original);
  if (!verified.has(key)) {
    verified.set(key,false);
    sha256(original).then(h => {
      verified.set(key,h===translation.sourceHash);
      rerender();
    }).catch(() => { verified.set(key,false); });
    return {doc,translated:false};
  }
  if (verified.get(key)!==true || !contentStructureSafe(original,translation)) return {doc,translated:false};
  const translated={...doc};
  for (const name of Object.keys(original)) if (typeof translation[name]==='string') translated[name]=translation[name];
  return {doc:translated,translated:true};
}
export function initEditorialLocalization(render) {
  rerender=render;
  const lang=getLocale(); if (lang!=='en') loadEditorialLocale(lang);
  document.addEventListener('arcana:language-changed', event => {
    const chosen = event.detail?.language;
    if (chosen && chosen!=='en') loadEditorialLocale(chosen);
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-original-content]');
    if (!b) return;
    const id=b.dataset.originalContent;
    if (originalView.has(id)) originalView.delete(id);
    else originalView.add(id);
    render();
  });
}
export function editorialControl(kind,id,translated) {
  const lang=getLocale();
  if (lang==='en') return '';
  const key=marker(lang,kind,id), showingOriginal=originalView.has(key);
  if (!translated && !showingOriginal) return '<p class="nx-language-note" data-no-translate>'+translateEnglish('The article is currently available in English.')+'</p>';
  if (!translated && showingOriginal) return '<button type="button" class="nx-language-note nx-language-original" data-original-content="'+key+'">'+translateEnglish('Show translation')+'</button>';
  return '<button type="button" class="nx-language-note nx-language-original" data-original-content="'+key+'">'+translateEnglish('Machine translated')+' · '+translateEnglish('View English original')+'</button>';
}
