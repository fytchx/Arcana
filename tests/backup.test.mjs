import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { writeBackup, dataFolders } from '../src/backup-server.mjs';

test('backup: the archive restores every file byte for byte', async () => {
  const root = await mkdtemp(join(tmpdir(), 'arcana-backup-'));
  const src = join(root, 'data'); const deep = join(src, 'accounts', 'a'.repeat(60), 'b'.repeat(60));
  await mkdir(deep, { recursive: true });
  await writeFile(join(src, 'pages.json'), '{"x":1}');
  await writeFile(join(src, 'empty.json'), '');
  await writeFile(join(deep, 'big.bin'), Buffer.alloc(70000, 7));
  const out = join(root, 'b.tar.gz');
  const n = await writeBackup(createWriteStream(out), [src]);
  assert.equal(n, 3);
  const dest = join(root, 'restore'); await mkdir(dest);
  execFileSync('tar', ['-xzf', out, '-C', dest]);
  assert.equal(await readFile(join(dest, 'arcana-data', 'pages.json'), 'utf8'), '{"x":1}');
  assert.equal((await readFile(join(dest, 'arcana-data', 'empty.json'))).length, 0);
  assert.deepEqual(await readFile(join(dest, 'arcana-data', 'accounts', 'a'.repeat(60), 'b'.repeat(60), 'big.bin')), Buffer.alloc(70000, 7));
  const info = JSON.parse(await readFile(join(dest, 'arcana-data', 'BACKUP-INFO.json'), 'utf8'));
  assert.equal(info.files, 3); assert.deepEqual(info.skipped, []);
});
test('backup: nested data folders are only included once', () => {
  const f = dataFolders({ ARCANA_WIKI_DATA_DIR: '/data', ARCANA_TRAFFIC_DATA_DIR: '/data/traffic', ARCANA_BETA_FEEDBACK_DIR: '/other' });
  assert.ok(f.includes('/data') && f.includes('/other') && !f.includes('/data/traffic'));
});
test('backup: the server routes it and only the Creator may download', async () => {
  const s = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  assert.match(s, /pathname==='\/api\/admin\/backup'&&req\.method==='GET'/);
  const b = await readFile(new URL('../src/backup-server.mjs', import.meta.url), 'utf8');
  assert.match(b, /can\(user,'roles:privileged'\)/);
});
