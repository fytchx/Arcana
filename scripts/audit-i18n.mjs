// Audit machine-created article translations before release. Read-only unless --report.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { FEATURED_GUIDES } from '../next/guides-content.js';
import { PAGES } from '../next/handbook-content.js';

const LANGUAGES = ['de','es','fr','it','ja','ko','pl','pt','ru','tr','zh'];
const required = process.argv.includes('--strict');
const reportPath = process.argv.find(x=>x.startsWith('--report='))?.slice('--report='.length);
const docs = {
  guides:Object.fromEntries(FEATURED_GUIDES.map(x=>[x.id,x])),
  handbook:Object.fromEntries(PAGES.map(x=>[x.id,x]))
};
const sha = o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
const fields = (kind,d)=>kind==='guides'?{title:d.title,summary:d.summary,body:d.body}:{title:d.title,answer:d.answer,body:d.body};
const normalizedNames = body => [...body.matchAll(/\[\[([^\]]+)\]\]/g)].map(x=>x[1].split('|')[0]);
const links = body => [...body.matchAll(/\]\((#[^)]*|https:\/\/[^)]*)\)/g)].map(x=>x[1]);
const nums = body => [...body.matchAll(/(?<![A-Za-z])(?:[+\-−]?\d(?:[\d.,]*\d)?%?|[Aa]\d+)(?![A-Za-z])/g)].map(x=>x[0]).sort();
const layout = body => body.split('\n').filter(x=>x.trim().startsWith('|')).map(x=>(x.match(/\|/g)||[]).length);
const reports = [];
let bad=0;
// A missing or out-of-date page is not an error: the site shows the English original until it is translated again.
const pendingPages=[];
for(const locale of LANGUAGES){
  const filename='next/generated-locales/'+locale+'.json';
  if(!existsSync(filename)){reports.push({locale,exists:false,complete:false,problems:['missing translation file']});if(required)bad++;continue;}
  const file=JSON.parse(readFileSync(filename,'utf8'));
  const errors=[];
  if(file.language!==locale||file.schema!==1) errors.push('locale/schema mismatch');
  const editorialEngine=file.engine?.id==='chatgpt-translation'&&file.engine?.mode==='editorial';
  if(editorialEngine ? Object.hasOwn(file.engine,'license') : file.engine?.license!=='MIT') errors.push('translation license mismatch');
  let total=0,changed=0;
  for(const kind of ['guides','handbook']){
    for(const [id,src] of Object.entries(docs[kind])){
      total++;
      const translated=file[kind]?.[id];
      const baseline=fields(kind,src);
      if(!translated||translated.sourceHash!==sha(baseline)){
        if(required&&editorialEngine)errors.push((translated?'stale source ':'missing ')+kind+':'+id);
        else pendingPages.push(locale+' '+kind+':'+id);
        continue;
      }
      if(['title','body'].some(k=>typeof translated[k]!=='string'))errors.push('missing content '+kind+':'+id);
      for(const k of Object.keys(baseline)){
        const before=baseline[k],after=translated[k]||'';
        if(before!==after)changed++;
        if(k!=='body') continue;
        if(JSON.stringify(normalizedNames(before))!==JSON.stringify(normalizedNames(after))) errors.push('wiki links differ '+kind+':'+id);
        if(JSON.stringify(links(before))!==JSON.stringify(links(after))) errors.push('URLs differ '+kind+':'+id);
        if(JSON.stringify(nums(before))!==JSON.stringify(nums(after))) errors.push('numbers differ '+kind+':'+id);
        if(JSON.stringify(layout(before))!==JSON.stringify(layout(after))) errors.push('tables differ '+kind+':'+id);
      }
    }
  }
  const result={locale,exists:true,complete:errors.length===0,documentCount:total,changedFields:changed,problems:errors};
  reports.push(result);bad+=errors.length;
}
if(reportPath)writeFileSync(reportPath,JSON.stringify({schema:1,checks:reports},null,2)+'\n');
console.log('Arcana editorial localization audit:');
for(const x of reports)console.log(x.locale+': '+(x.complete?'PASS':'INCOMPLETE')+(x.documentCount?' '+x.documentCount+' docs':'')+(x.problems?.length?' '+x.problems.slice(0,5).join('; '):''));
if(pendingPages.length)console.log('Shown in English until translated ('+pendingPages.length+'): '+[...new Set(pendingPages.map(x=>x.split(' ')[1]))].join(', '));
if(required&&bad)process.exitCode=1;
