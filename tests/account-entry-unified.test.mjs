import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {homeScreen} from '../src/launch-navigation.js';
import {communityPage} from '../src/community-ui.js';
const source=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('guest homepage gives a one-click My Arcana login/registration destination',()=>{
 const html=homeScreen();
 assert.match(html,/class="atlasAccountEntry"/);
 assert.match(html,/Sign up \/ Log in/);
 assert.match(html,/data-route="account"/);
 assert.ok(html.indexOf('class="atlasAccountEntry"')<html.indexOf('class="atlasHero"'));
 assert.equal((html.match(/class="atlasTile"/g)||[]).length,6);
});
test('signed-in homepage points to same route and safely renders player name',()=>{
 const html=homeScreen({displayName:'Fytch <script> & friends'});
 assert.match(html,/My Account/);
 assert.match(html,/data-route="account"/);
 assert.match(html,/Fytch &lt;script&gt; &amp; friends/);
 assert.doesNotMatch(html,/<script>/);
 assert.doesNotMatch(html,/Sign up \/ Log in/);
});
test('header profile entry is visible and opens the canonical account route',async()=>{
 const html=await source('index.html'),app=await source('src/app.js');
 assert.match(html,/id="accountBtn" aria-label="Open My Arcana sign up and login"/);
 assert.doesNotMatch(html,/id="accountBtn"[^>]* hidden/);
 assert.match(app,/node\('accountBtn'\)\.onclick=\(\)=>go\('account'\)/);
 assert.match(app,/function home\(\)\{return homeScreen\(currentAccount\(\)\);\}/);
});
test('login and registered account management stay on the same URL',async()=>{
 const account=await source('src/community-ui.js'),server=await source('src/account-server.mjs');
 assert.match(account,/Sign up or log in with Discord/);
 assert.match(account,/href="\/api\/account\/login"/);
 assert.match(account,/account is created automatically/);
 assert.match(account,/function accountView\(query=new URLSearchParams\(\)\)/);
 assert.match(account,/if\(!state\.me\)return/);
 assert.match(account,/nav\+content\+/);
 assert.match(account,/Profile & settings/);
 assert.match(server,/redirect\(res,'\/#\/account'/);
 assert.match(server,/redirect\(res,'\/#\/account\?error=sign-in'/);
 const loading=communityPage('account',new URLSearchParams());
 assert.match(loading,/Loading your Arcana account/);
});
