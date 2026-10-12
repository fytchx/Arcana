// Public ArcanaLFG reader. No owner tokens, applications, or private listing state.
export const LFG_UNITS=['x1','K','M','B','T','qa','qi','sx','sp'];
export const LFG_CLASSES=['Warrior','Archer','Mage','Rogue','Druid'];
const clean=(v,max=120)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
const finite=(v,def=0)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,n):def};
const validId=id=>/^[\w-]{1,100}$/.test(id);
export function normalizeLfgEntry(raw,type){
 if(!raw||typeof raw!=='object'||!validId(String(raw.id??'')))return null;
 const kind=type==='active'?'active':raw.kind==='team'?'team':'scheduled';
 const members=Array.isArray(raw.members)?raw.members.slice(0,4).map(m=>({name:clean(m?.name,36),characterClass:clean(m?.characterClass,24)})):[];
 const classes=Array.isArray(raw.allowedClasses)?raw.allowedClasses.slice(0,5).map(c=>clean(c,24)).filter(Boolean):[];
 const mode=['all','any','specific','unique'].includes(raw.mode)?raw.mode:'any';
 return {id:String(raw.id),kind,title:clean(raw.title,90)||'Unnamed raid',leader:clean(raw.leader,40),guild:clean(raw.guild,45),notes:clean(raw.notes,400),tier:Math.floor(finite(raw.tier)),minMight:finite(raw.minMight),maxMight:finite(raw.maxMight,Number.MAX_SAFE_INTEGER),members,allowedClasses:classes,mode,status:clean(raw.status,15)||'open',startAt:clean(raw.startAt,40),createdAt:clean(raw.createdAt,40),bumpedAt:clean(raw.bumpedAt,40),days:Array.isArray(raw.days)?raw.days.filter(n=>Number.isInteger(n)&&n>=0&&n<=6).slice(0,7):[],time:clean(raw.time,10),timezone:clean(raw.timezone,50),applicationsCount:Math.floor(finite(raw.applicationsCount))};
}
export function normalizePublicFeed(json){const raids=(Array.isArray(json?.listings)?json.listings:[]).map(x=>normalizeLfgEntry(x,'active')).filter(Boolean);const plans=(Array.isArray(json?.plans)?json.plans:[]).map(x=>normalizeLfgEntry(x,x.kind)).filter(Boolean);return {listings:raids,plans};}
export const isRecruiting=x=>x?.status==='open'&&x.members.length<4;
export function formatMight(n){if(!Number.isFinite(n))return 'Any';let i=0;while(n>=1000&&i<LFG_UNITS.length-1){n/=1000;i++}return Number(n.toPrecision(3))+ (i?' '+LFG_UNITS[i]:'');}
export const mightValue=(amount,unit)=>Number(amount)*1000**Math.max(0,LFG_UNITS.indexOf(unit));
export const lfgDeepLink=x=>!x?'https://lfg.arcanacompanion.xyz/':`https://lfg.arcanacompanion.xyz/?${x.kind==='active'?'raid':'plan'}=${encodeURIComponent(x.id)}`;
export function lfgSearchText(x){return [x.title,x.leader,x.guild,x.notes,'raid rift titan lfg party recruit',x.kind,x.kind==='team'?'daily recurring team':x.kind==='scheduled'?'future scheduled group':'active raid now',`tier ${x.tier}`,`t${x.tier}`,formatMight(x.minMight),formatMight(x.maxMight),x.mode==='unique'?'unique classes':'',...(x.allowedClasses||[]),...(x.members||[]).map(m=>m.name),...(x.members||[]).map(m=>m.characterClass)].join(' ').toLowerCase();}
export function lfgFilter(items,{tab='active',query='',tier='',characterClass='',might=null,openOnly=true}={}){const words=String(query).toLowerCase().trim().split(/\s+/).filter(Boolean);return items.filter(x=>{
 if(tab!=='all'&&tab!=='guilds'&&x.kind!==tab)return false;
 if(openOnly&&!isRecruiting(x))return false;
 if(tier&&Number(tier)!==x.tier)return false;
 if(words.length&&!words.every(w=>lfgSearchText(x).includes(w)))return false;
 if(characterClass){if(x.mode==='specific'&&!x.allowedClasses.includes(characterClass))return false;if(x.mode==='unique'&&x.members.some(m=>m.characterClass===characterClass))return false;}
 if(might!==null&&(might<x.minMight||might>x.maxMight))return false;
 return true;
 }).sort((a,b)=>a.kind==='scheduled'&&b.kind==='scheduled'?Date.parse(a.startAt||0)-Date.parse(b.startAt||0):Date.parse(b.bumpedAt||b.createdAt||0)-Date.parse(a.bumpedAt||a.createdAt||0));}
export function guildActivity(items){const map=new Map();for(const l of items){if(!l.guild)continue;const key=l.guild.toLowerCase();if(!map.has(key))map.set(key,{name:l.guild,listings:[],leaders:new Set()});const g=map.get(key);g.listings.push(l);if(l.leader)g.leaders.add(l.leader);}return [...map.values()].map(g=>({...g,leaders:[...g.leaders]})).sort((a,b)=>b.listings.length-a.listings.length||a.name.localeCompare(b.name));}
export function lfgSearchEntries(items){return [
 ...items.filter(isRecruiting).map(x=>({id:'lfg:'+x.kind+':'+x.id,kind:'lfglisting',title:x.title,subtitle:(x.kind==='active'?'Active raid':x.kind==='scheduled'?'Scheduled raid':'Daily team')+` · Tier ${x.tier}`,keywords:lfgSearchText(x),description:`Led by ${x.leader}${x.guild?' · '+x.guild:''}. ${x.members.length}/4 members.`,route:`lfg/listing?kind=${x.kind}&id=${encodeURIComponent(x.id)}`,live:true,source:x})),
 ...guildActivity(items).map(x=>({id:'lfg:guild:'+x.name.toLowerCase(),kind:'lfgguild',title:x.name,subtitle:'ArcanaLFG · Guild activity',keywords:'guild '+x.name+' '+x.leaders.join(' ')+' '+x.listings.map(y=>lfgSearchText(y)).join(' '),description:`${x.listings.length} public raid/team listing(s) associated with this guild. This is not a recruitment advertisement.`,route:'lfg/guilds?q='+encodeURIComponent(x.name),live:true,source:x}))];}
export function rankSearch(query,items){const q=String(query).toLowerCase().trim();if(!q)return [];const words=q.split(/\s+/).filter(Boolean);return items.map(x=>{const title=x.title.toLowerCase(),sub=String(x.subtitle||'').toLowerCase(),s=(x.title+' '+(x.subtitle||'')+' '+(x.keywords||'')+' '+(x.description||'')).toLowerCase();if(!words.every(w=>s.includes(w)))return null;const score=(title===q?150:0)+(title.startsWith(q)?95:0)+(title.includes(q)?45:0)+(sub.includes(q)?25:0)+(s.includes(q)?22:0)+words.reduce((n,w)=>n+(title.split(/\W+/).some(t=>t.startsWith(w))?14:0),0);return {...x,score};}).filter(Boolean).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));}
