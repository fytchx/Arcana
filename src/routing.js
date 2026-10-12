export function parseRoute(){const raw=location.hash.replace(/^#\/?/,'');const [route='home',search='']=raw.split('?');return {route:decodeURIComponent(route)||'home',query:new URLSearchParams(search)}}
export function makeRoute(route,params={}){const q=new URLSearchParams();for(const [k,v] of Object.entries(params)){if(v!==null&&v!==undefined&&v!=='')q.set(k,String(v))}return '#/'+route+(q.size?'?'+q:'')}
export function navigate(route,params={}){const hash=makeRoute(route,params);if(location.hash!==hash)history.pushState({arcana:true},'',hash);window.dispatchEvent(new CustomEvent('arcana:navigate'))}
export function navigateBack(){if(history.length>1)history.back();else navigate('home')}
