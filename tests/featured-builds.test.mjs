import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { handleSiteAdminRequest, normalizeFeaturedItems, safeFeatured } from '../src/site-admin-server.mjs';

const base = 'http://localhost:3000';
async function call(method, path, body, token, origin = base) {
  const req = Readable.from(body ? [Buffer.from(JSON.stringify(body))] : []);
  req.method = method; req.url = path;
  req.headers = { host: 'localhost:3000', origin, 'content-type': 'application/json', cookie: token ? 'arcana-session=' + token : '' };
  const res = { status: 0, body: '', writeHead(code) { this.status = code; }, end(text) { this.body += text || ''; } };
  assert.equal(await handleSiteAdminRequest(req, res, new URL(path, base)), true);
  return { status: res.status, data: JSON.parse(res.body || '{}') };
}

test('featured builds: validation keeps only clean post ids and short plain notes', () => {
  const id = randomUUID();
  assert.deepEqual(normalizeFeaturedItems([{ postId: id.toUpperCase(), note: ' Great starter ' }, { postId: id }]), [{ postId: id, note: 'Great starter' }]);
  assert.throws(() => normalizeFeaturedItems([{ postId: '../../users/x' }]), /Invalid build id/);
  assert.throws(() => normalizeFeaturedItems(Array.from({ length: 13 }, () => ({ postId: randomUUID() }))), /at most 12/);
  assert.throws(() => normalizeFeaturedItems([{ postId: id, note: 'x'.repeat(141) }]), /140/);
  assert.throws(() => normalizeFeaturedItems([{ postId: id, note: 'a\nb' }]), /plain text/);
  assert.throws(() => normalizeFeaturedItems('nope'), /list/);
  assert.deepEqual(safeFeatured(null), { revision: 0, updatedAt: null, items: [] });
  assert.deepEqual(safeFeatured({ revision: 3, items: [{ postId: 'bad' }] }).items, []);
});

test('featured builds: anyone can read, only admins can change, stale saves are refused', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'arcana-featured-'));
  const keys = ['ARCANA_ACCOUNT_DATA_DIR', 'ARCANA_AUTH_BASE_URL', 'ARCANA_DISCORD_CLIENT_ID', 'ARCANA_DISCORD_CLIENT_SECRET', 'ARCANA_CREATOR_DISCORD_ID'];
  const previous = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  Object.assign(process.env, { ARCANA_ACCOUNT_DATA_DIR: temp, ARCANA_AUTH_BASE_URL: base, ARCANA_DISCORD_CLIENT_ID: 'local-test-client', ARCANA_DISCORD_CLIENT_SECRET: 'local-test-secret', ARCANA_CREATOR_DISCORD_ID: '123456789012345678' });
  try {
    const ownerId = randomUUID(), memberId = randomUUID(), token = 'c'.repeat(48), memberToken = 'd'.repeat(48);
    await mkdir(join(temp, 'sessions'), { recursive: true }); await mkdir(join(temp, 'users'), { recursive: true });
    await Promise.all([
      writeFile(join(temp, 'users', ownerId + '.json'), JSON.stringify({ id: ownerId, discordId: process.env.ARCANA_CREATOR_DISCORD_ID, discordName: 'Site Creator', roles: [], joinedAt: new Date().toISOString() })),
      writeFile(join(temp, 'users', memberId + '.json'), JSON.stringify({ id: memberId, discordId: '999999999999999999', discordName: 'Member', roles: [], joinedAt: new Date().toISOString() })),
      writeFile(join(temp, 'sessions', createHash('sha256').update(token).digest('hex') + '.json'), JSON.stringify({ id: ownerId, expires: Date.now() + 300000 })),
      writeFile(join(temp, 'sessions', createHash('sha256').update(memberToken).digest('hex') + '.json'), JSON.stringify({ id: memberId, expires: Date.now() + 300000 }))
    ]);
    const empty = await call('GET', '/api/featured');
    assert.equal(empty.status, 200); assert.deepEqual(empty.data.items, []); assert.equal(empty.data.revision, 0);
    const id = randomUUID(), body = { expectedRevision: 0, items: [{ postId: id, note: 'Best Bulwark build' }] };
    assert.equal((await call('PUT', '/api/admin/featured', body)).status, 401);
    assert.equal((await call('PUT', '/api/admin/featured', body, memberToken)).status, 403);
    assert.equal((await call('PUT', '/api/admin/featured', body, token, 'https://evil.example')).status, 403);
    assert.equal((await call('PUT', '/api/admin/featured', { expectedRevision: 0, items: [{ postId: 'x' }] }, token)).status, 422);
    assert.equal((await call('POST', '/api/admin/featured', body, token)).status, 405);
    const saved = await call('PUT', '/api/admin/featured', body, token);
    assert.equal(saved.status, 200); assert.equal(saved.data.revision, 1);
    assert.equal((await call('PUT', '/api/admin/featured', body, token)).status, 409);
    const pub = await call('GET', '/api/featured');
    assert.deepEqual(pub.data.items, [{ postId: id, note: 'Best Bulwark build' }]);
    assert.equal(pub.data.updatedBy, undefined);
  } finally {
    for (const k of keys) { if (previous[k] === undefined) delete process.env[k]; else process.env[k] = previous[k]; }
    await rm(temp, { recursive: true, force: true });
  }
});
