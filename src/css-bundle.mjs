// One ordered, compressed stylesheet response. Keep the authored CSS files separate
// so the Theme Designer and individual feature styles remain easy to maintain.
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';

export const SITE_STYLES=Object.freeze([
 'styles.css','wiki-studio.css','community.css','guild-hub.css','beta.css',
 'traffic.css','admin.css','launch-navigation.css','pathfinder-timeline.css',
 'quick-tools.css','arcana-contour.css','theme-studio-finishes.css',
 'signature-themes.css','home-three.css','journal-widgets.css',
 'theme-seamless.css','psychedelic-themes.css','desktop-home-refinement.css',
 'arcana-connected-ux.css','home-atlas.css','atlas-atelier-textures.css',
 'visual-art.css','studio-v2.css','studio-layers.css','visual-polish.css',
 'damage-formula.css'
]);

let cached=null;
// @import must appear before every regular CSS rule. Remove the existing
// Google Fonts import. Fonts load separately so critical styles never wait on Google.
const CSS_IMPORT=/^[ \t]*@import[ \t]+[^;\r\n]+;[ \t]*(?:\r?\n)?/gm;
export function buildSiteCss(sources){
 const imports=[],parts=[];
 for(const [name,source] of sources){
  const body=source.replace(CSS_IMPORT,rule=>{imports.push(rule.trim());return '';});
  parts.push('/* Arcana source: '+name+' */\n'+body);
 }
 return parts.join('\n');
}
export async function siteCssBundle(root){
 if(cached)return cached;
 cached=(async()=>{
  const sources=await Promise.all(SITE_STYLES.map(async name=>[name,await readFile(resolve(root,name),'utf8')]));
  const plain=Buffer.from(buildSiteCss(sources),'utf8');
  const gzip=gzipSync(plain);
  const hash=createHash('sha256').update(plain).digest('hex').slice(0,22);
  return Object.freeze({plain,gzip,etag:'"'+hash+'"',gzipEtag:'"'+hash+'-gzip"'});
 })().catch(error=>{cached=null;throw error;});
 return cached;
}
