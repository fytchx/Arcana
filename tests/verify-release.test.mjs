import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyRelease,RELEASE_ORIGINS} from '../scripts/verify-release.mjs';

const SHA='a'.repeat(40);
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
const ok=()=>new Response('ok',{status:200});

test('release verifier waits for the exact deployed Git SHA and checks public routes',async()=>{
  let checks=0;const messages=[];
  const actual=await verifyRelease({
    target:'production',expectedSha:SHA,attempts:3,delayMs:0,pause:async()=>{},log:message=>messages.push(message),
    fetchFn:async url=>{
      if(url.endsWith('/health'))return json({ok:true,commit:++checks===1?'b'.repeat(40):SHA});
      return ok();
    }
  });
  assert.equal(actual.commit,SHA);
  assert.equal(actual.attempts,2);
  assert.ok(messages.some(m=>m.startsWith('VERIFIED production')));
});

test('release verifier refuses an older healthy deployment',async()=>{
  await assert.rejects(verifyRelease({
    target:'preview',expectedSha:SHA,attempts:1,
    fetchFn:async()=>json({ok:true,commit:'c'.repeat(40)}),log:()=>{}
  }),/Release NOT VERIFIED.*instead/);
});

test('release verifier fails when a required public route is broken',async()=>{
  await assert.rejects(verifyRelease({
    target:'production',expectedSha:SHA,attempts:1,log:()=>{},
    fetchFn:async url=>url.endsWith('/health')?json({ok:true,commit:SHA}):url.endsWith('/api/wiki/articles')?okFail():ok()
  }),/Release NOT VERIFIED.*wiki/);
});
function okFail(){return new Response('unavailable',{status:503});}

test('release verifier rejects unknown targets and shorthand SHA',async()=>{
  assert.equal(Object.keys(RELEASE_ORIGINS).length,2);
  await assert.rejects(verifyRelease({target:'https://example.org',expectedSha:SHA}),/Choose production or preview/);
  await assert.rejects(verifyRelease({target:'production',expectedSha:'abc'}),/full 40-character/);
});
