import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('mobile preview always provides a recovery from a stalled module graph',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/wrap\.id='arcanaLoadRecovery'/);
 assert.match(html,/Retry preview/);
 assert.match(html,/setTimeout\(display,8000\)/);
 assert.match(html,/\/src\/app\.js\?v=arcana-default-reset-20261014-v2/);
 assert.match(html,/location\.origin\+location\.pathname/);
 assert.doesNotMatch(html,/localStorage\.clear\(\)|sessionStorage\.clear\(\)/);
 assert.match(html,/saved build has not been reset/);
 const r=html.indexOf('arcana-preview-boot-recovery-style');
 const module=html.indexOf('<script type="module" src="/src/app.js');
 assert.ok(r>0&&r<module,'fallback must run before module app');
});
test('server disables stale JS/HTML caching and health route still exists',async()=>{
 const code=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 assert.match(code,/\/health/);
 assert.match(code,/'no-store'/);
 assert.match(code,/publicModule/);
});
