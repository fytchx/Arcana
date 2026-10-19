// Fixed SVG symbol library. Only numbered choices and validated hex colors can enter markup.
export const CREST_MARKS=Object.freeze([
 '<path d="M50 12 58 37 84 38 63 53 71 79 50 64 29 79 37 53 16 38 42 37Z"/>',
 '<path d="M50 13 64 40 86 25 77 76H23L14 25 36 40Z"/>',
 '<path d="M43 13h14v43L70 70l-10 11-10-12-10 12-10-11 13-14Z"/>',
 '<path d="M20 48 50 15 80 48 50 83Z"/>',
 '<path d="M50 14C67 27 79 45 73 62 69 77 55 83 50 87 31 73 26 59 30 46 39 55 44 32 50 14Z"/>',
 '<path d="M13 34 44 46 50 61 56 46 87 34 72 61 56 71 50 83 44 71 28 61Z"/>',
 '<path d="M42 17h16v50H42zM30 66h40v13H30zM38 29 24 47l12 13 7-7-5-6 10-10z"/>',
 '<path d="M50 12 68 35 83 56 67 82 33 82 17 56 32 35Z"/>',
 '<path d="M34 14h32v16H34zM26 38h48v13H26zM39 51h22v31H39z"/>',
 '<path d="M50 12 58 32 79 29 67 48 82 65 60 64 50 85 40 64 18 65 33 48 21 29 42 32Z"/>',
 '<path d="M17 43q33-57 66 0-33 57-66 0Zm33-17a17 17 0 1 0 0 34 17 17 0 0 0 0-34Z" fill-rule="evenodd"/>',
 '<path d="M50 11C65 26 76 42 76 56a26 26 0 0 1-52 0c0-14 11-30 26-45Z"/>',
 '<path d="M20 28h60v13H20zM31 41h38v38H31zM39 48h22v10H39z"/>',
 '<path d="M42 12h16v30h30v16H58v30H42V58H12V42h30Z"/>',
 '<path d="M15 32 34 21l16 16 16-16 19 11-12 48H27Z"/>',
 '<path d="M50 17 71 28 78 50 71 72 50 83 29 72 22 50 29 28Z"/>',
 '<path d="M32 17 68 17 68 36 81 36 81 56 62 56 62 83 38 83 38 56 19 56 19 36 32 36Z"/>',
 '<path d="M17 38q32-39 66 0L50 84Z"/>',
 '<path d="M23 19h54v12H23zM30 34h40v11H30zM38 48h24v32H38z"/>',
 '<path d="M25 18h50v15H61v45H39V33H25Z"/>',
 '<path d="M20 20 80 80M80 20 20 80" fill="none" stroke="currentColor" stroke-width="13"/>',
 '<path d="M24 22h52v54H24zM35 33h30v32H35z" fill-rule="evenodd"/>',
 '<path d="M50 11 63 33 88 40 68 57 69 81 50 70 31 81 32 57 12 40 37 33Z"/>',
 '<path d="M50 12 76 35 76 65 50 88 24 65 24 35Z"/>',
 '<path d="M15 65q15-42 35-50 20 8 35 50-19 21-35 21-16 0-35-21Zm25-8 10 14 10-14Z" fill-rule="evenodd"/>'
]);
export const CREST_OUTLINES=Object.freeze([
 'M50 6 88 25 84 65 50 94 16 65 12 25Z',
 'M50 5 89 45 78 82 50 95 22 82 11 45Z',
 'M50 6A44 44 0 1 1 49.99 6Z',
 'M11 11H89V89H11Z',
 'M50 5 95 50 50 95 5 50Z',
 'M32 6H68L94 32V68L68 94H32L6 68V32Z',
 'M50 5 90 26 90 74 50 95 10 74 10 26Z',
 'M22 8H78L91 24 83 75 50 94 17 75 9 24Z',
 'M50 6 85 12 92 55 69 89 31 89 8 55 15 12Z',
 'M17 7H83V40L67 62 50 94 33 62 17 40Z'
]);
export const CREST_BORDERS=Object.freeze([
 'M50 4 92 25 88 69 50 97 12 69 8 25Z',
 'M50 3A47 47 0 1 1 49.99 3Z',
 'M5 5H95V95H5Z',
 'M50 2 98 50 50 98 2 50Z',
 'M31 5H69L95 31V69L69 95H31L5 69V31Z',
 'M50 4 92 15 96 60 77 90 23 90 4 60 8 15Z',
 'M50 3 90 29 90 71 50 97 10 71 10 29Z',
 'M14 4H86L97 30 84 77 50 97 16 77 3 30Z',
 'M50 3 93 22 81 83 50 97 19 83 7 22Z',
 'M17 5H83L96 47 67 82 50 98 33 82 4 47Z'
]);
export const CREST_DEFAULT=Object.freeze({center:0,secondary:4,outline:0,border:0,colors:['#E9D7FF','#9785E8','#39235E','#F5E9BA']});
const number=(value,max)=>Number.isInteger(value)&&value>=0&&value<max?value:0;
const color=(v,backup)=>typeof v==='string'&&/^#[A-Fa-f0-9]{6}$/.test(v)?v:backup;
export function renderCrest(design=CREST_DEFAULT,size=23){
 const d=design||CREST_DEFAULT,c=(d.colors||[]).map((v,i)=>color(v,CREST_DEFAULT.colors[i]));
 while(c.length<4)c.push(CREST_DEFAULT.colors[c.length]);
 const outline=CREST_OUTLINES[number(d.outline,10)],border=CREST_BORDERS[number(d.border,10)];
 const center=CREST_MARKS[number(d.center,25)],secondary=CREST_MARKS[number(d.secondary,25)];
 const w=Math.max(18,Math.min(180,Number(size)||23));
 return '<svg class="arcanaGuildCrest" width="'+w+'" height="'+w+'" viewBox="0 0 100 100" role="img" aria-label="Guild crest">'+
  '<path d="'+outline+'" fill="'+c[2]+'" stroke="'+c[3]+'" stroke-width="2"/>'+
  '<g transform="translate(18 17) scale(.64)" fill="'+c[0]+'" color="'+c[0]+'">'+center+'</g>'+
  '<g transform="translate(58 57) scale(.3)" fill="'+c[1]+'" color="'+c[1]+'">'+secondary+'</g>'+
  '<path d="'+border+'" fill="none" stroke="'+c[3]+'" stroke-width="3.7" stroke-linejoin="round"/>'+
  '<path d="'+border+'" fill="none" stroke="'+c[1]+'" stroke-width=".9" stroke-dasharray="'+(number(d.border,10)%3===0?'2 4':'0')+'"/>'+
  '</svg>';
}
export function guildBadge(profile,registry=[]){
 const tag=String(profile?.guildTag||'').toUpperCase();
 if(!/^[A-Z]{4}$/.test(tag))return '';
 const official=registry.find(g=>g.status==='approved'&&g.tag===tag&&g.id===profile.guildId);
 const color=official&&typeof official.tagStyle?.color==='string'&&/^#[0-9a-fA-F]{6}$/.test(official.tagStyle.color)?official.tagStyle.color:'';
 const finish=official&&['solid','glow','gradient'].includes(official.tagStyle?.finish)?official.tagStyle.finish:'solid';
 return '<span class="arcanaGuildTag '+(official?'isOfficial finish-'+finish:'isUnregistered')+'"'+(color?' style="--guild-tag-color:'+color+'"':'')+'>'+
  (official?renderCrest(official.crest,22):'')+'<span>['+tag+']</span></span>';
}
