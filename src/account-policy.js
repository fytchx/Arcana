// Arcana permissions are capabilities, not client-side labels.
// Every server mutation must call can() using a server-authenticated identity.
export const ARCANA_ROLES = Object.freeze(['member','beta-tester','wiki-editor','game-developer','moderator','admin','developer','creator']);
export const AWARD_LABELS=Object.freeze({'guide-author':'Guide Author','wiki-contributor':'Wiki Contributor','bug-hunter':'Bug Hunter','ui-designer':'Visual Designer','community-helper':'Community Helper','dev-contributor':'Developer Contributor','season-historian':'Season Historian'});
export const ROLE_NAMES = Object.freeze({
 member:'Arcana Member','beta-tester':'Founding Beta Tester','wiki-editor':'Arcana Wiki Editor','game-developer':'Game Developer',moderator:'Moderator',
 admin:'Admin',developer:'Developer',creator:'Creator'
});
const CAPABILITIES = Object.freeze({
 'character:claim':['member'],
 'character:review':['moderator','admin','creator'],
 'records:manage':['admin','creator'],
 'staff:access':['wiki-editor','moderator','admin','developer','creator'],
 'community:create':['member','wiki-editor','moderator','admin','developer','creator'],
 'listings:create':['member','wiki-editor','moderator','admin','developer','creator'],
 'wiki:publish':['wiki-editor','admin','creator'],
 'community:hide':['moderator','admin','creator'],
 'community:delete':['admin','creator'],
 'roles:manage':['admin','creator'],
 'roles:privileged':['creator'],
 'analytics:view':['admin','creator'],
 'site:manage':['admin','creator'],
 'handbook:edit':['wiki-editor','game-developer','admin','developer','creator'],
 'handbook:publish':['admin','creator']
});
// The Creator can change which roles hold these capabilities (Admin › Roles). Role management,
// privileged roles and site settings are never editable here.
export const EDITABLE_CAPS=Object.freeze({'handbook:edit':'Write Handbook drafts','handbook:publish':'Publish Handbook pages','community:hide':'Hide community posts','community:delete':'Delete community posts','character:review':'Review character claims','records:manage':'Manage season records','analytics:view':'See site traffic','wiki:publish':'Publish classic wiki pages','staff:access':'Open the staff area'});
export const GRID_ROLES=Object.freeze(['wiki-editor','game-developer','moderator','admin','developer']);
let overrides={};
export function normalizeCapabilityOverrides(raw){
 const out={};
 if(!raw||typeof raw!=='object')return out;
 for(const [cap,roles] of Object.entries(raw)){if(EDITABLE_CAPS[cap]&&Array.isArray(roles))out[cap]=[...new Set(roles.filter(r=>GRID_ROLES.includes(r)))];}
 return out;
}
export function setCapabilityOverrides(raw){overrides=normalizeCapabilityOverrides(raw);return overrides;}
const rolesFor=permission=>overrides[permission]?[...overrides[permission],'creator']:(CAPABILITIES[permission]||[]);
export function capabilityGrid(){return Object.entries(EDITABLE_CAPS).map(([id,label])=>({id,label,roles:rolesFor(id).filter(r=>GRID_ROLES.includes(r))}));}
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
 return Boolean(user)&&rolesOf(user).some(role=>rolesFor(permission).includes(role));
}
export function publicRoles(user){return rolesOf(user).map(role=>({id:role,label:ROLE_NAMES[role]}));}
export function mayChangeRoles(actor,target,next){
 if(!can(actor,'roles:manage'))return false;
 if(!Array.isArray(next)||next.some(r=>!['wiki-editor','game-developer','moderator','admin','developer'].includes(r)))return false;
 if(target?.isCreator)return false;
 const privileged=rolesOf(target).some(r=>r==='admin'||r==='developer')||next.some(r=>r==='admin'||r==='developer');
 return !privileged||can(actor,'roles:privileged');
}
