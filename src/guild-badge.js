// Arcana guild identity is text only. Never render a user-provided crest or image.
const validTag=value=>/^[A-Z]{4}$/.test(String(value||''));
const color=value=>/^#[0-9a-fA-F]{6}$/.test(value||'')?value:'#D2B2FF';
const finish=value=>['solid','glow','gradient'].includes(value)?value:'solid';
export function guildBadge(profile,registry=[]){
 const tag=String(profile?.guildTag||'').toUpperCase();
 if(!validTag(tag))return '';
 const official=registry.find(g=>g?.status==='approved'&&g.tag===tag&&g.id===profile?.guildId);
 const style=official?.tagStyle||{};
 return '<span class="arcanaGuildTag '+(official?'isOfficial finish-'+finish(style.finish):'isUnregistered')+'"'+
 (official?' style="--guild-tag-color:'+color(style.color)+'"':'')+'><span>['+tag+']</span></span>';
}
export function guildTagBadge(g){
 const tag=String(g?.tag||'').toUpperCase();
 if(!validTag(tag))return '';
 return guildBadge({guildTag:tag,guildId:g?.id},[g]);
}
