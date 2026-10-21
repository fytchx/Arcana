import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
const loader=html.match(/<script id="arcana-boot-control">([\s\S]*?)<\/script>/)?.[1];

function harness({pausedFrames=false,hash='#/home',scrollRestoration='auto'}={}){
 const listeners=new Map();
 function emitter(){
  return {
   addEventListener(name,callback){if(!listeners.has(this))listeners.set(this,new Map());const map=listeners.get(this);if(!map.has(name))map.set(name,[]);map.get(name).push(callback);},
   emit(name,extra={}){const event={type:name,cancelable:true,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};
    for(const callback of listeners.get(this)?.get(name)||[])callback(event);
    return event;}
  };
 }
 function element(){const attributes=new Set(['inert']);return {
  attributes,removed:false,done:false,
  setAttribute(name){attributes.add(name);},removeAttribute(name){attributes.delete(name);},
  classList:{add(name){if(name==='arcanaBootDone')splash.done=true;}},
  remove(){this.removed=true;}
 };}
 const document=emitter(),window=emitter(),splash=element(),skip=element();
 const history={scrollRestoration},location={hash},scrollPositions=[];
 window.scrollTo=position=>scrollPositions.push(position);
 const underlay=Object.fromEntries(['app','arcanaDock','arcanaChatOverlay','layer'].map(id=>[id,element()]));
 document.getElementById=id=>id==='arcanaBoot'?splash:underlay[id]||null;
 document.querySelector=selector=>selector==='.skipMain'?skip:null;
 let clock=0;const timers=[];
 function setTimeout(callback,delay){timers.push({at:clock+delay,callback});}
 function advance(ms){clock+=ms;while(true){const idx=timers.findIndex(timer=>timer.at<=clock);if(idx<0)break;const [timer]=timers.splice(idx,1);timer.callback();}}
 vm.runInNewContext(loader,{document,window,history,location,Date:{now:()=>clock},requestAnimationFrame:fn=>{if(!pausedFrames)fn();},setTimeout});
 return {document,window,splash,underlay,skip,history,scrollPositions,advance};
}

test('boot remains touch-opaque through both readiness signals and the fade',()=>{
 assert.ok(loader,'inline boot controller exists');
 const ui=harness();
 ui.window.emit('DOMContentLoaded');
 assert.equal(ui.document.emit('click').prevented,true,'clicks blocked before app initialization');
 ui.document.emit('arcana:theme-ready');
 assert.equal(ui.splash.done,false,'theme alone cannot dismiss the splash');
 ui.document.emit('arcana:app-ready');
 assert.equal(ui.splash.done,true,'both readiness signals start the exit animation');
 ui.advance(449);
 assert.equal(ui.splash.removed,false);
 assert.equal(ui.document.emit('click').stopped,true,'fade cannot click through');
 assert.equal(ui.underlay.app.attributes.has('inert'),true);
 ui.advance(1);
 assert.equal(ui.splash.removed,true);
 assert.equal(ui.underlay.app.attributes.has('inert'),false);
 assert.equal(ui.underlay.arcanaDock.attributes.has('inert'),false);
 assert.equal(ui.skip.attributes.has('inert'),false);
 assert.equal(ui.document.emit('click').prevented,false,'page works normally after release');
});

test('a finger held during the fade cannot activate a hidden link',()=>{
 const ui=harness();
 ui.window.emit('DOMContentLoaded');
 ui.document.emit('pointerdown');
 ui.document.emit('arcana:app-ready');
 ui.document.emit('arcana:theme-ready');
 ui.advance(450);
 assert.equal(ui.splash.removed,false,'remain shielded while pointer is down');
 assert.equal(ui.document.emit('click').prevented,true);
 ui.document.emit('pointerup');
 ui.advance(80);
 assert.equal(ui.splash.removed,true,'release once pointer interaction ends');
});

test('stalled Android animation frames do not require the visitor to tap the screen',()=>{
 const ui=harness({pausedFrames:true});
 ui.window.emit('DOMContentLoaded');
 ui.document.emit('arcana:app-ready');
 ui.document.emit('arcana:theme-ready');
 ui.advance(199);
 assert.equal(ui.splash.done,false);
 ui.advance(1);
 assert.equal(ui.splash.done,true,'short timer fallback dismisses even when frames are suspended');
 ui.advance(450);
 assert.equal(ui.splash.removed,true);
});

test('a stalled app eventually exposes the existing recovery UI',()=>{
 const ui=harness();
 ui.window.emit('DOMContentLoaded');
 ui.advance(9000);
 assert.equal(ui.splash.done,true);
 ui.advance(450);
 assert.equal(ui.splash.removed,true);
});

test('loader visuals respect accessibility and protect all page navigation',()=>{
 assert.match(html,/arcanaBootOrbitOuter/);
 assert.match(html,/arcanaBootOrbitInner/);
 assert.match(html,/arcanaBootOrbitSpark/);
 assert.match(html,/prefers-reduced-motion:reduce/);
 assert.match(html,/<div id="app" class="shell" inert>/);
 assert.match(html,/<nav id="arcanaDock"[^>]* inert>/);
 assert.match(html,/pointer-events:auto/);
 assert.match(html,/setTimeout\(done,9000\)/);
 assert.match(app,/render\(\);document\.dispatchEvent\(new Event\('arcana:app-ready'\)\)/);
});

test('fresh Home launch clears a restored scroll position and restores browser history behavior',()=>{
 const ui=harness({hash:'#/home',scrollRestoration:'auto'});
 assert.equal(ui.history.scrollRestoration,'manual','suppress stale browser restoration while Home boots');
 ui.window.emit('DOMContentLoaded');
 ui.document.emit('arcana:app-ready');
 ui.document.emit('arcana:theme-ready');
 ui.advance(450);
 assert.equal(ui.scrollPositions.length,1);
 assert.equal(ui.scrollPositions[0].top,0);
 assert.equal(ui.scrollPositions[0].left,0);
 assert.equal(ui.history.scrollRestoration,'auto','normal history behavior resumes after boot');
});

test('launching directly into another route preserves browser scroll restoration',()=>{
 const ui=harness({hash:'#/calculators/pathfinder',scrollRestoration:'auto'});
 assert.equal(ui.history.scrollRestoration,'auto');
 ui.window.emit('DOMContentLoaded');
 ui.document.emit('arcana:app-ready');
 ui.document.emit('arcana:theme-ready');
 ui.advance(450);
 assert.equal(ui.scrollPositions.length,0);
 assert.equal(ui.history.scrollRestoration,'auto');
});
