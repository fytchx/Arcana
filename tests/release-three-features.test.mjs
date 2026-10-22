import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const get=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('combined Guild Hub / psychedelic release retains prior production features',async()=>{
 const files=await Promise.all(['src/app.js','server.mjs','index.html','src/launch-navigation.js','styles.css','src/bruto-progression-guide.js','src/pathfinder-range.js','src/signature-collection.js'].map(get));
 const [app,server,html,menu,css,bruto,pathfinder,signature]=files;
 assert.match(app,/guildHubPage|loadGuildHub/);
 assert.match(server,/safeGuildHubRequest/);
 assert.match(html,/guild-hub\.css/);
 assert.doesNotMatch(html,/guild-crest-workshop\.css/);
 assert.doesNotMatch(menu,/Guild Crest Designer/);
 assert.match(menu,/Guild Hub/);
 for(const asset of ['signature-themes.css','theme-seamless.css','psychedelic-themes.css']){
  assert.ok(html.includes('/'+asset),asset+' missing from HTML');
  assert.ok(server.includes("'/"+asset+"'"),asset+' not served');
 }
 assert.match(css,/wikiArticleCredit/);
 assert.match(bruto,/BruTo/);
 assert.match(pathfinder,/quantity|Quantity/);
 assert.match(signature,/SIGNATURE_PRESETS/);
});
