import test from 'node:test';
import assert from 'node:assert/strict';
import {selfProfile} from '../src/account-server.mjs';
import {accountSpecialPortalMarkup} from '../src/community-ui.js';

test('only the Discord-verified creator gets the account management portal',()=>{
 const previous=process.env.ARCANA_CREATOR_DISCORD_ID;
 const ownerDiscord='123456789012345678';
 process.env.ARCANA_CREATOR_DISCORD_ID=ownerDiscord;
 try{
  const own=selfProfile({id:'account-owner',discordId:ownerDiscord,roles:[],profile:{displayName:'Site Owner'}});
  assert.equal(own.isOwner,true);
  assert.match(accountSpecialPortalMarkup(own),/data-route="admin"/);
  assert.match(accountSpecialPortalMarkup(own),/Admin Control Panel/);
  for(const role of [[],['wiki-editor'],['moderator'],['admin'],['developer'],['creator']]){
   const other=selfProfile({id:'not-owner',discordId:'987654321098765432',roles:role,profile:{displayName:'Player'}});
   assert.equal(other.isOwner,false,JSON.stringify(role));
   assert.equal(accountSpecialPortalMarkup(other),'');
  }
  assert.equal(accountSpecialPortalMarkup(null),'');
  assert.equal(accountSpecialPortalMarkup({permissions:{manageSite:true}}),'');
  assert.equal(accountSpecialPortalMarkup({isOwner:'true'}),'');
 }finally{
  if(previous===undefined)delete process.env.ARCANA_CREATOR_DISCORD_ID;
  else process.env.ARCANA_CREATOR_DISCORD_ID=previous;
 }
});

test('account entry remains guest-safe and only one top-right control exists',async()=>{
 const {readFile}=await import('node:fs/promises');
 const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
 const [html,app,ui]=await Promise.all(['index.html','src/app.js','src/community-ui.js'].map(read));
 assert.equal((html.match(/id="accountBtn"/g)||[]).length,1);
 assert.doesNotMatch(html,/id="adminPortalBtn"/);
 assert.match(app,/if\(\['home','user','settings','admin'/);
 assert.match(ui,/nav\+accountSpecialPortalMarkup\(p\)\+content/);
 assert.doesNotMatch(ui,/p\.permissions\?\.staffAccess\?'<button data-route="staff"/);
});
