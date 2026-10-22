/* Arcana first-party privacy-minimal pageview counter. Not an ad/tracking SDK. */
const KEY='arcana-traffic-session-v1';
let session=null,previous=null,started=false;
function optedOut(){return navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||navigator.doNotTrack==='yes';}
function sessionId(){
 if(session)return session;
 try{const value=sessionStorage.getItem(KEY);if(/^[a-f0-9-]{36}$/i.test(value||''))return session=value;}catch{}
 try{session=crypto.randomUUID();}catch{return null;}
 try{sessionStorage.setItem(KEY,session);}catch{}
 return session;
}
function event(type,route){
 if(optedOut()||!sessionId()||document.visibilityState==='hidden'||route==='admin'||route==='admin/traffic')return;
 fetch('/api/traffic/event',{method:'POST',credentials:'omit',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({type,route,session}),keepalive:true}).catch(()=>{});
}
export function recordTrafficNavigation(route){
 if(typeof route!=='string'||route===previous)return;
 previous=route;
 event('view',route);
}
export function initTrafficTracking(){
 if(started)return;started=true;
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&previous)event('heartbeat',previous);});
 setInterval(()=>{if(previous)event('heartbeat',previous);},90000);
}
