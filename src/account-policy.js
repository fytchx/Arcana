// Arcana permissions are capabilities, not client-side labels.
// Every server mutation must call can() using a server-authenticated identity.
export const ARCANA_ROLES = Object.freeze(['member','beta-tester','wiki-editor','moderator','admin','developer','creator']);
export const ROLE_NAMES = Object.freeze({
 member:'Arcana Member','beta-tester':'Founding Beta Tester','wiki-editor':'Arcana Wiki Editor',moderator:'Moderator',
 admin:'Admin',developer:'Developer',creator:'Creator'
});
const CAPABILITIES = Object.freeze({
 'community:create':['member','wiki-editor','moderator','admin','developer','creator'],
 'listings:create':['member','wiki-editor','moderator','admin','developer','creator'],
 'wiki:publish':['wiki-editor','admin','creator'],
 'community:hide':['moderator','admin','creator'],
 'community:delete':['admin','creator'],
 'roles:manage':['admin','creator'],
 'roles:privileged':['creator']
});
export function rolesOf(user){
 if(!user||user.suspended)return [];
 const granted=Array.isArray(user.roles)?user.roles:[];
 const set=new Set(['member',...granted.filter(r=>ARCANA_ROLES.includes(r)&&r!=='creator'&&r!=='member')]);
 // The Founding Beta Tester award is derived from permanent server enrollment,
 // never from client-submitted role lists or a current beta feature toggle.
 if(user.betaTesterSince)set.add('beta-tester');
 // Creator identity can only be established server-side from the configured Discord snowflake.
 if(user.isCreator===true)set.add('creator');
 return ARCANA_ROLES.filter(role=>set.has(role));
}
export function can(user,permission){
 if(permission==='read'||permission==='tools:use'||permission==='tools:share')return true;
 return Boolean(user)&&rolesOf(user).some(role=>(CAPABILITIES[permission]||[]).includes(role));
}
export function publicRoles(user){return rolesOf(user).map(role=>({id:role,label:ROLE_NAMES[role]}));}
export function mayChangeRoles(actor,target,next){
 if(!can(actor,'roles:manage'))return false;
 if(!Array.isArray(next)||next.some(r=>!['wiki-editor','moderator','admin','developer'].includes(r)))return false;
 if(target?.isCreator)return false;
 const privileged=rolesOf(target).some(r=>r==='admin'||r==='developer')||next.some(r=>r==='admin'||r==='developer');
 return !privileged||can(actor,'roles:privileged');
}
