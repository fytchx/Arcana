import test from 'node:test';
import assert from 'node:assert/strict';
import {AWARD_LABELS,can,rolesOf} from '../src/account-policy.js';
import {publicProfile,selfProfile} from '../src/account-server.mjs';

test('contributor awards never confer account permissions',()=>{
 assert.equal(Object.keys(AWARD_LABELS).length,7);
 const member={id:'00000000-0000-0000-0000-000000000001',roles:[],awards:['bug-hunter','guide-author'],profile:{displayName:'Tester',featuredBadges:['bug-hunter','guide-author','admin']}};
 assert.equal(can(member,'site:manage'),false);
 assert.equal(can(member,'roles:manage'),false);
 assert.equal(can(member,'character:review'),false);
 assert.deepEqual(rolesOf(member),['member']);
 const publicView=publicProfile(member);
 assert.deepEqual(publicView.awards.map(x=>x.label),['Bug Hunter','Guide Author']);
 assert.deepEqual(publicView.featuredBadges,['bug-hunter','guide-author']);
 assert.equal(publicView.verifiedCharacter,null);
});

test('reviewed character is shown, but only when approved',()=>{
 const make=status=>publicProfile({id:'00000000-0000-0000-0000-000000000002',roles:[],profile:{displayName:'Claimant',verifiedCharacter:{status,name:'[OVK] Fytch',approvedAt:'2026-10-25'},featuredBadges:['verified-character']}});
 assert.equal(make('pending').verifiedCharacter,null);
 assert.equal(make('approved').verifiedCharacter.name,'[OVK] Fytch');
 assert.deepEqual(make('approved').featuredBadges,['verified-character']);
});

test('recognition label choices do not change the server role permissions',()=>{
 const editor={roles:['wiki-editor'],awards:['season-historian'],profile:{displayName:'Editor'}};
 assert.equal(can(editor,'wiki:publish'),true);
 assert.equal(can(editor,'records:manage'),false);
 assert.equal(selfProfile(editor).permissions.staffAccess,true);
});
