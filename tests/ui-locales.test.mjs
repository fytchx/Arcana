import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const nums = s => (String(s).match(/\d+(?:[.,]\d+)?%?/g) || []).sort();
const files = readdirSync(new URL('../next/ui-locales/', import.meta.url)).filter(f => f.endsWith('.json'));

test('ui-locales: one pack per non-English language', () => {
  assert.deepEqual(files.map(f => f.slice(0, 2)).sort(), ['de','es','fr','it','ja','ko','pl','pt','ru','tr','zh']);
});
for (const f of files) {
  test('ui-locales: ' + f + ' keeps numbers and has no markup', () => {
    const j = JSON.parse(readFileSync(new URL('../next/ui-locales/' + f, import.meta.url), 'utf8'));
    assert.equal(j.language, f.slice(0, 2)); assert.equal(j.schema, 1);
    for (const [en, tr] of Object.entries(j.phrases)) {
      assert.equal(typeof tr, 'string', en);
      if (!tr) continue;
      assert.ok(!/[<>]/.test(tr), f + ': markup in "' + en + '"');
      assert.ok(tr.length < 300, f + ': too long "' + en + '"');
      assert.deepEqual(nums(tr), nums(en), f + ': numbers changed in "' + en + '"');
    }
  });
}
