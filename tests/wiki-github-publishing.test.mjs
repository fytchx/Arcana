import test from 'node:test';
import assert from 'node:assert/strict';

const textResponse=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
test('Owner-authenticated GitHub Wiki publisher stages separate image blobs and a single atomic commit',async()=>{
 const originalFetch=globalThis.fetch;
 const old={key:process.env.ARCANA_WIKI_OWNER_KEY,token:process.env.ARCANA_WIKI_GITHUB_TOKEN,branch:process.env.ARCANA_WIKI_PUBLISH_BRANCH};
 process.env.ARCANA_WIKI_OWNER_KEY='test-owner-secret-for-github-commits';
 process.env.ARCANA_WIKI_GITHUB_TOKEN='github_pat_mock_token_long_enough_for_verification_1234567';
 process.env.ARCANA_WIKI_PUBLISH_BRANCH='wiki-test-branch';
 const calls=[];
 const blobShas=[];
 let stage=0;
 globalThis.fetch=async (url,options={})=>{
  const path=String(url).replace('https://api.github.com/repos/fytchx/Arcana',''),method=options.method||'GET';
  calls.push({path,method,payload:options.body?JSON.parse(options.body):null});
  if(path==='/git/ref/heads/wiki-test-branch')return textResponse({object:{sha:'parent-sha'}});
  if(path==='/git/commits/parent-sha'&&method==='GET')return textResponse({tree:{sha:'parent-tree'}});
  if(path.startsWith('/contents/content/wiki/articles.json'))return textResponse({message:'Not found'},404);
  if(path==='/git/blobs'&&method==='POST'){const sha='blob-'+(++stage);blobShas.push(sha);return textResponse({sha});}
  if(path==='/git/trees'&&method==='POST')return textResponse({sha:'next-tree'});
  if(path==='/git/commits'&&method==='POST')return textResponse({sha:'new-sha'});
  if(path==='/git/refs/heads/wiki-test-branch'&&method==='PATCH')return textResponse({object:{sha:'new-sha'}});
  return textResponse({error:'unexpected mocked request '+path},404);
 };
 try{
  const module=await import('../src/wiki-publish-server.js?isolated-mock-github');
  assert.equal(module.publishingStatus().enabled,true);
  assert.equal(module.ownerKeyValid('incorrect'),false);
  assert.equal(module.ownerKeyValid(process.env.ARCANA_WIKI_OWNER_KEY),true);
  const draft={
   id:'guild-stats-overview',title:'Guild Stats Overview',category:'Guilds',
   summary:'An original guide to understanding guild skill points and bonus choices.',
   sections:[{title:'Guild points',body:'Guild points are used to unlock more bonuses. Check your current build before allocating new points.',imageId:'image-example'}],
   images:[{id:'image-example',name:'Overview',alt:'Guild skills screenshot',caption:'Example',dataUrl:'data:image/webp;base64,'+Buffer.from('valid fixture').toString('base64')}],
   relatedTools:['guildtree']
  };
  const out=await module.publishWikiDraft(draft);
  assert.equal(out.commit,'new-sha');
  assert.equal(out.articleId,'guild-stats-overview');
  const tree=calls.find(c=>c.path==='/git/trees');
  assert.ok(tree,'Expected single batched git tree write');
  assert.equal(tree.payload.base_tree,'parent-tree');
  assert.equal(tree.payload.tree.length,2);
  assert.ok(tree.payload.tree.some(x=>x.path==='content/wiki/images/guild-stats-overview/image-example.webp'));
  assert.ok(tree.payload.tree.some(x=>x.path==='content/wiki/articles.json'));
  const commit=calls.find(c=>c.path==='/git/commits'&&c.method==='POST');
  assert.deepEqual(commit.payload.parents,['parent-sha']);
  assert.equal(calls.filter(c=>c.method==='PATCH').length,1);
  assert.equal(blobShas.length,2);
 }finally{
  globalThis.fetch=originalFetch;
  for(const [env,val] of [['ARCANA_WIKI_OWNER_KEY',old.key],['ARCANA_WIKI_GITHUB_TOKEN',old.token],['ARCANA_WIKI_PUBLISH_BRANCH',old.branch]]){if(val===undefined)delete process.env[env];else process.env[env]=val;}
 }
});
