import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,symlink} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {auditDataTree,auditConfiguredData,dataLocations} from '../scripts/audit-data-volume.mjs';

async function fixture(fn){
 const root=await mkdtemp(join(tmpdir(),'arcana-data-audit-'));
 try{return await fn(root);}finally{await rm(root,{recursive:true,force:true});}
}

test('audit reads JSON safely without exposing record contents or identifiers',()=>fixture(async root=>{
 await mkdir(join(root,'accounts','users'),{recursive:true});
 const privateId='user-private-test-identifier';
 await writeFile(join(root,'accounts','users',privateId+'.json'),JSON.stringify({id:privateId,email:'hidden@example.com',token:'never-print'}));
 const result=await auditDataTree(root);
 assert.equal(result.ok,true);
 assert.equal(result.files,1);
 assert.equal(result.json,1);
 assert.equal(result.invalidJson,0);
 const printed=JSON.stringify(result);
 for(const forbidden of [privateId,'hidden@example.com','never-print'])assert.equal(printed.includes(forbidden),false);
 assert.equal(result.groups.accounts.files,1);
}));

test('invalid JSON, unreadable roots and symlinks fail the audit without leaking data',()=>fixture(async root=>{
 await mkdir(join(root,'accounts'),{recursive:true});
 await writeFile(join(root,'accounts','broken.json'),'{ not json');
 await symlink(join(root,'accounts','broken.json'),join(root,'accounts','shortcut.json'));
 const result=await auditDataTree(root);
 assert.equal(result.ok,false);
 assert.equal(result.invalidJson,1);
 assert.equal(result.symlinks,1);
 assert.deepEqual(result.groups.accounts,{files:1,bytes:10,invalidJson:1});
 await assert.rejects(auditDataTree(join(root,'missing')),{code:'ENOENT'});
}));

test('configured data audit counts nested /data paths only once',()=>fixture(async root=>{
 await mkdir(join(root,'accounts','journal'),{recursive:true});
 await mkdir(join(root,'beta-feedback'),{recursive:true});
 await writeFile(join(root,'accounts','journal','articles.json'),'{"articles":[]}');
 await writeFile(join(root,'beta-feedback','data.json'),'{"ok":true}');
 const env={ARCANA_WIKI_DATA_DIR:root};
 const locations=dataLocations(env);
 assert.equal(locations.accounts,join(root,'accounts'));
 const result=await auditConfiguredData(env);
 assert.equal(result.ok,true);
 assert.equal(result.roots,1);
 assert.equal(result.scopes[0].files,2);
 assert.deepEqual(result.scopes[0].scope.sort(),['accounts','feedback','traffic','wiki']);
}));

test('configured paths outside main volume are independently inspected',()=>fixture(async root=>{
 const primary=join(root,'primary'),external=join(root,'external');
 await mkdir(primary);await mkdir(external);
 await writeFile(join(primary,'a.json'),'{}');
 await writeFile(join(external,'b.json'),'{}');
 const result=await auditConfiguredData({ARCANA_WIKI_DATA_DIR:primary,ARCANA_ACCOUNT_DATA_DIR:external});
 assert.equal(result.ok,true);
 assert.equal(result.roots,2);
 assert.equal(result.scopes.reduce((n,r)=>n+r.files,0),2);
}));
