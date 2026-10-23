import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRoute} from '../src/routing.js';

test('legacy Journal URLs resolve into native Arcana routes',()=>{
 const prior=globalThis.location;
 try{
  globalThis.location={hash:'',pathname:'/journal',search:'?category=News'};
  let route=parseRoute();
  assert.equal(route.route,'journal');assert.equal(route.query.get('category'),'News');
  globalThis.location={hash:'',pathname:'/journal/class-balance-top-250-season-2',search:''};
  route=parseRoute();
  assert.equal(route.route,'journal/article');assert.equal(route.query.get('slug'),'class-balance-top-250-season-2');
  globalThis.location={hash:'#/journal/article?slug=building-the-arcana-damage-calculator',pathname:'/',search:''};
  route=parseRoute();
  assert.equal(route.route,'journal/article');assert.equal(route.query.get('slug'),'building-the-arcana-damage-calculator');
 }finally{if(prior===undefined)delete globalThis.location;else globalThis.location=prior;}
});
