export const DRAFT_KEY='arcana-v3-local-build-1';
export const RECENT_KEY='arcana-v3-recent-1';
export function deepCopy(x){return JSON.parse(JSON.stringify(x))}
export function loadDraft(){try{const x=JSON.parse(localStorage.getItem(DRAFT_KEY));return x&&x.equipment&&Array.isArray(x.runes)?x:null}catch{return null}}
export function saveDraft(build){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(build))}catch{}}
export function loadRecent(){try{return JSON.parse(localStorage.getItem(RECENT_KEY))||[]}catch{return []}}
export function remember(id){const result=[id,...loadRecent().filter(x=>x!==id)].slice(0,7);try{localStorage.setItem(RECENT_KEY,JSON.stringify(result))}catch{}return result}
export function clearRecent(){try{localStorage.removeItem(RECENT_KEY)}catch{}}
