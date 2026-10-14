import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const src=readFileSync(new URL('../server.mjs',import.meta.url),'utf8');

test('stable production uses verified legacy upgrade calculator front door',()=>{
 assert.match(src,/const legacyPath=\(pathname==='\/'\|\|pathname==='\/index\.html'\)\?'\/legacy':pathname;/);
 assert.match(src,/BASES\.legacyArt\+legacyPath\+parsedUrl\.search/);
 assert.match(src,/host==='arcanacompanion\.xyz'/);
 assert.match(src,/host==='arcana-stable-app-staging\.up\.railway\.app'/);
 assert.match(src,/if\(stablePublicHost\)/);
});
test('persistent accounts and editorial APIs are never redirected to legacy frontend',()=>{
 const proxy=src.indexOf('if(stablePublicHost)');
 for(const handler of ['safeAccountBuildRequest','safeAccountRequest','safeCommunityRequest','betaFeedbackRequest','handleWikiRequest']){
  const call=src.indexOf('await '+handler+'(',src.indexOf('const server=http.createServer'));
  assert.ok(call>0&&call<proxy,handler+' must run before public proxy');
 }
 const health=src.indexOf("if(pathname==='/health'||pathname==='/__health')");
 assert.ok(health>0&&health<proxy,'local Railway health remains available');
 assert.match(src,/req\.method!=='GET'&&req\.method!=='HEAD'/);
});
