import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const get=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('release includes only Pathfinder, themes and BruTo guide, leaving unapproved Guild Hub staged',async()=>{
 const [app,server,html,menu,css,pkg]=await Promise.all(['src/app.js','server.mjs','index.html','src/launch-navigation.js','styles.css','package.json'].map(get));
 assert.doesNotMatch(app,/guildHubPage|loadGuildHub|wireGuildHub|case 'guilds\/crest'/);
 assert.doesNotMatch(server,/safeGuildHubRequest|\/api\/guild-hub/);
 assert.doesNotMatch(html,/guild-hub\.css|guild-crest-workshop\.css/);
 assert.doesNotMatch(menu,/link\('Guild Hub'|link\('Guild Crest Designer'/);
 assert.match(app,/catalog:verifiedState\.entries/);
 for(const asset of ['signature-themes.css','theme-seamless.css']){assert.ok(html.includes('/'+asset));assert.ok(server.includes("'/"+asset+"'"));}
 assert.match(css,/wikiArticleCredit/);
 assert.ok(JSON.parse(pkg).scripts.check.includes('tests/*.test.mjs'));
});
