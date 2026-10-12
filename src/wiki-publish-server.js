import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {timingSafeEqual} from 'node:crypto';
import {WIKI_ARTICLES} from './wiki-data.js';
import {validateWikiDraft,publicWikiArticle} from './wiki-studio-model.js';

const MANIFEST='content/wiki/articles.json';
const REPO=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const REF=/^[A-Za-z0-9_.\/-]+$/;
const WIKI_BRANCH=process.env.ARCANA_WIKI_PUBLISH_BRANCH||'';
const WIKI_REPO=process.env.ARCANA_WIKI_GITHUB_REPO||'fytchx/Arcana';
const TOKEN=process.env.ARCANA_WIKI_GITHUB_TOKEN||'';
const OWNER_KEY=process.env.ARCANA_WIKI_OWNER_KEY||'';
const configured=()=>TOKEN.length>30&&OWNER_KEY.length>=24&&WIKI_BRANCH&&REF.test(WIKI_BRANCH)&&!WIKI_BRANCH.includes('..')&&REPO.test(WIKI_REPO);
export const publishingStatus=()=>({enabled:!!configured(),method:'owner-key',requiresReview:true});
export function ownerKeyValid(value){
 if(!configured())return false;
 const given=Buffer.from(String(value||'')),stored=Buffer.from(OWNER_KEY);
 return given.length===stored.length&&timingSafeEqual(given,stored);
}
export async function localWikiArticles(root){
 try{
  const raw=JSON.parse(await readFile(resolve(root,MANIFEST),'utf8'));
  return {articles:Array.isArray(raw?.articles)?raw.articles.slice(0,1000):[]};
 }catch{return {articles:[]}}
}
const base=()=>`https://api.github.com/repos/${WIKI_REPO}`;
async function github(path,{method='GET',body=null}={}){
 const response=await fetch(base()+path,{method,headers:{accept:'application/vnd.github+json','content-type':'application/json',authorization:'Bearer '+TOKEN,'x-github-api-version':'2022-11-28','user-agent':'ArcanaWiki-Studio'},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(16000)});
 if(!response.ok)throw Error('GitHub publishing failed (HTTP '+response.status+')');
 return response.json();
}
async function gitBlob(content,encoding='utf-8'){
 const data=await github('/git/blobs',{method:'POST',body:{content,encoding}});
 return data.sha;
}
const clone=o=>JSON.parse(JSON.stringify(o));
export async function publishWikiDraft(raw){
 if(!configured())throw Error('Publishing is not configured on this server.');
 const reserved=WIKI_ARTICLES.map(a=>a.id);
 const {valid,draft,errors}=validateWikiDraft(raw,{existingIds:reserved});
 if(!valid)throw Error(errors.join(' '));
 if(draft.images.length>10)throw Error('Too many images.');
 const branch=encodeURIComponent(WIKI_BRANCH);
 const ref=await github('/git/ref/heads/'+branch),parent=ref.object.sha;
 const parentCommit=await github('/git/commits/'+encodeURIComponent(parent));
 let manifest={articles:[]};
 try{
  const existing=await github('/contents/'+MANIFEST+'?ref='+branch);
  if(existing?.content)manifest=JSON.parse(Buffer.from(existing.content.replace(/\s/g,''),'base64').toString('utf8'));
 }catch(error){if(!error.message.includes('HTTP 404'))throw error;}
 if(!Array.isArray(manifest.articles)||manifest.articles.length>1000)throw Error('Invalid published Wiki registry.');
 // Publish images individually, but reference them only after all Git objects are staged.
 const publicArticle=clone(publicWikiArticle(draft));
 const tree=[];
 const imageInfo=[];
 for(const image of draft.images){
  const matched=image.dataUrl.match(/^data:image\/(webp|png|jpeg);base64,([a-z0-9+/=]+)$/i);
  if(!matched)throw Error('Invalid uploaded image.');
  const binary=Buffer.from(matched[2],'base64');
  if(!binary.length||binary.length>650000)throw Error('An image exceeds the 650 KB optimized limit.');
  const ext=matched[1]==='jpeg'?'jpg':matched[1];
  const path='content/wiki/images/'+draft.id+'/'+image.id+'.'+ext;
  const sha=await gitBlob(binary.toString('base64'),'base64');
  tree.push({path,mode:'100644',type:'blob',sha});
  imageInfo.push({id:image.id,name:image.name,alt:image.alt,caption:image.caption,src:'/'+path});
 }
 publicArticle.images=imageInfo;
 manifest.articles=[...manifest.articles.filter(a=>a.id!==publicArticle.id),publicArticle].sort((a,b)=>a.title.localeCompare(b.title));
 const manifestSha=await gitBlob(JSON.stringify({version:1,articles:manifest.articles},null,2)+'\n');
 tree.push({path:MANIFEST,mode:'100644',type:'blob',sha:manifestSha});
 const nextTree=await github('/git/trees',{method:'POST',body:{base_tree:parentCommit.tree.sha,tree}});
 const nextCommit=await github('/git/commits',{method:'POST',body:{message:'Wiki: publish '+draft.title+' ('+draft.id+')',tree:nextTree.sha,parents:[parent]}});
 await github('/git/refs/heads/'+branch,{method:'PATCH',body:{sha:nextCommit.sha,force:false}});
 return {ok:true,articleId:draft.id,commit:nextCommit.sha,branch:WIKI_BRANCH,publication:'committed'};
}
