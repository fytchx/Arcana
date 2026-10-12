import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { once } from 'node:events';

test('Wiki publishing rejects strangers, stores pictures, and exposes a safe public article',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'arcana-wiki-'));
 const oldDir=process.env.ARCANA_WIKI_DATA_DIR, oldKey=process.env.ARCANA_WIKI_OWNER_KEY;
 process.env.ARCANA_WIKI_DATA_DIR=directory;process.env.ARCANA_WIKI_OWNER_KEY='test-owner-key-long-and-private';
 const {handleWikiRequest}=await import('../src/wiki-server.mjs');
 const server=createServer(async(req,res)=>{
   const path=new URL(req.url,'http://localhost').pathname;
   if(!await handleWikiRequest(req,res,path)){res.writeHead(404);res.end();}
 });
 try{
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  const article={id:'pet-compound-explained',title:'Pet Compound Explained',category:'Pets',summary:'A practical example of the four equipped pet system.',sections:[{title:'How it works',body:'Every pet has a level that influences your combined equipped bonuses.',imageId:'image-example'}],images:[{id:'image-example',name:'Pet illustration',alt:'Example pet screen',caption:'Example',dataUrl:'data:image/webp;base64,'+Buffer.from('tiny-demo-image').toString('base64')}],relatedTools:['petlab'],relatedArticles:[]};
  const anonymous=await fetch(base+'/api/wiki/publish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({draft:article})});
  assert.equal(anonymous.status,401);
  const accepted=await fetch(base+'/api/wiki/publish',{method:'POST',headers:{'content-type':'application/json','x-arcana-wiki-key':process.env.ARCANA_WIKI_OWNER_KEY},body:JSON.stringify({draft:article})});
  assert.equal(accepted.status,200,await accepted.text().catch(()=>'')); 
  const index=await (await fetch(base+'/api/wiki/articles')).json();
  assert.equal(index.articles.length,1);
  assert.equal(index.articles[0].images[0].src,'/content/wiki/images/pet-compound-explained/image-example.webp');
  assert.equal('dataUrl' in index.articles[0].images[0],false);
  const picture=await fetch(base+index.articles[0].images[0].src);
  assert.equal(picture.status,200);assert.equal(picture.headers.get('content-type'),'image/webp');
  assert.equal(Buffer.from(await picture.arrayBuffer()).toString(),'tiny-demo-image');
  const reserved=await fetch(base+'/api/wiki/publish',{method:'POST',headers:{'content-type':'application/json','x-arcana-wiki-key':process.env.ARCANA_WIKI_OWNER_KEY},body:JSON.stringify({draft:{...article,id:'season-2'}})});
  assert.equal(reserved.status,422);
  assert.equal((await (await fetch(base+'/api/wiki/articles')).json()).articles.length,1);
  const editUrl=base+'/api/wiki/edit/'+article.id;
  const wrongOwner=await fetch(editUrl);
  assert.equal(wrongOwner.status,401);
  const editor=await fetch(editUrl,{headers:{'x-arcana-wiki-key':process.env.ARCANA_WIKI_OWNER_KEY}});
  assert.equal(editor.status,200);
  const initial=await editor.json();
  assert.match(initial.revision,/^[a-f0-9]{64}$/);
  assert.equal(initial.draft.images[0].dataUrl,article.images[0].dataUrl);
  const savedHeaders={'content-type':'application/json','x-arcana-wiki-key':process.env.ARCANA_WIKI_OWNER_KEY};
  const revised={...initial.draft,title:'Pet Compound and Equipment Guide'};
  const unsafeOverwrite=await fetch(base+'/api/wiki/publish',{method:'POST',headers:savedHeaders,body:JSON.stringify({draft:revised})});
  assert.equal(unsafeOverwrite.status,409,'Existing content cannot be overwritten without a matching revision');
  const safeEdit=await fetch(base+'/api/wiki/publish',{method:'POST',headers:savedHeaders,body:JSON.stringify({draft:revised,baseRevision:initial.revision})});
  assert.equal(safeEdit.status,200);
  const updated=await safeEdit.json();
  assert.notEqual(updated.revision,initial.revision);
  const stale=await fetch(base+'/api/wiki/publish',{method:'POST',headers:savedHeaders,body:JSON.stringify({draft:{...revised,title:'Old stale edit'},baseRevision:initial.revision})});
  assert.equal(stale.status,409,'Older drafts may not replace a newer edit');
  const publicIndex=await (await fetch(base+'/api/wiki/articles')).json();
  assert.equal(publicIndex.articles[0].title,revised.title);
  assert.equal(publicIndex.articles[0].images[0].src,index.articles[0].images[0].src);
  const archived=JSON.parse(await readFile(join(directory,'history',article.id,initial.revision+'.json'),'utf8'));
  assert.equal(archived.title,article.title);
  const reopen=await (await fetch(editUrl,{headers:{'x-arcana-wiki-key':process.env.ARCANA_WIKI_OWNER_KEY}})).json();
  assert.equal(reopen.revision,updated.revision);
  assert.equal(reopen.draft.title,revised.title);

 }finally{server.close();await rm(directory,{recursive:true,force:true});if(oldDir===undefined)delete process.env.ARCANA_WIKI_DATA_DIR;else process.env.ARCANA_WIKI_DATA_DIR=oldDir;if(oldKey===undefined)delete process.env.ARCANA_WIKI_OWNER_KEY;else process.env.ARCANA_WIKI_OWNER_KEY=oldKey;}
});
