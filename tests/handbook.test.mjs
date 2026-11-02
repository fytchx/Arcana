import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePage } from '../src/handbook-server.mjs';
import { can, setCapabilityOverrides, capabilityGrid } from '../src/account-policy.js';

test('Handbook pages are validated before saving', () => {
  assert.throws(() => normalizePage({ id: '../etc', chapter: 'start', title: 'x', answer: 'long enough answer' }), /address/);
  assert.throws(() => normalizePage({ id: 'ok', chapter: 'nope', title: 'x', answer: 'long enough answer' }), /chapter/);
  const p = normalizePage({ id: 'pity', chapter: 'upgrading', title: 'Pity', answer: 'Pity guarantees an upgrade.', body: 'x', trust: 'hacked', cls: 'evil' });
  assert.equal(p.trust, 'config'); assert.equal(p.cls, '');
});

test('role permissions: defaults, overrides, and locked capabilities', () => {
  setCapabilityOverrides({});
  assert.equal(can({ roles: ['game-developer'] }, 'handbook:edit'), true);
  assert.equal(can({ roles: ['game-developer'] }, 'handbook:publish'), false);
  setCapabilityOverrides({ 'handbook:publish': ['game-developer'], 'roles:manage': ['moderator'], 'site:manage': ['wiki-editor'] });
  assert.equal(can({ roles: ['game-developer'] }, 'handbook:publish'), true);
  assert.equal(can({ roles: ['moderator'] }, 'roles:manage'), false);
  assert.equal(can({ roles: ['wiki-editor'] }, 'site:manage'), false);
  assert.ok(capabilityGrid().every(c => c.id !== 'roles:manage'));
  setCapabilityOverrides({});
});
