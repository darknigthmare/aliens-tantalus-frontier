import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readFile, lstat } from 'node:fs/promises';
import { join } from 'node:path';

const MANIFEST = 'scripts/dlc/avp-2004/MANIFEST.json';
const REVIEWED_SHA256 = '865c96c8443c6dcad3f694889e7cd09283d1e67a90f6c60b2871d29dd73b22b3';
const SOURCE_ROOT = 'scripts/dlc/avp-2004';
const ARCHIVE_ROOT = 'archives/local-recovery-20261125';
export const AVP_RUNTIME_PATH = 'src/dlc/avp-2004/index.html';
export const AVP_PUBLIC_DIRECTORIES = new Set(['src/dlc', 'src/dlc/avp-2004']);
const SOURCE_EXTRAS = new Set([
  'scripts/build-dlc-avp-2004.mjs', 'scripts/dlc-admission-avp-2004.mjs',
  'scripts/verify-dlc-avp-2004.mjs', 'scripts/verify-dlc-menu.mjs',
  'scripts/qa-dlc-avp-2004.mjs',
  'scripts/dlc/avp-2004/README.md',
  'docs/development/AVP_2004_GITHUB_INTEGRATION_20261125.md'
]);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = path => typeof path === 'string' && path.length > 0
  && !path.startsWith('/') && !path.includes('\\') && !path.includes('\0')
  && path.split('/').every(part => part && part !== '.' && part !== '..');

let inventory;
export function reviewedAvpInventory() {
  if (inventory) return inventory;
  const bytes = readFileSync(new URL('../' + MANIFEST, import.meta.url));
  assert.equal(hash(bytes), REVIEWED_SHA256, 'AVP source manifest differs from its reviewed digest.');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schema, 1);
  assert.equal(manifest.version, '0.11.0');
  assert.equal(manifest.runtime.path, AVP_RUNTIME_PATH);
  const sources = [...manifest.sources, ...manifest.records];
  const paths = new Set([MANIFEST, ...SOURCE_EXTRAS]);
  const dirs = new Set(['scripts/dlc', SOURCE_ROOT, 'archives', ARCHIVE_ROOT]);
  for (const record of [manifest.runtime, ...sources]) {
    assert.ok(validPath(record.path), 'Unsafe AVP manifest path.');
    assert.ok(Number.isSafeInteger(record.bytes) && record.bytes >= 0);
    assert.match(record.sha256, /^[a-f0-9]{64}$/);
  }
  for (const record of sources) {
    assert.ok(record.path.startsWith(SOURCE_ROOT + '/') || record.path.startsWith(ARCHIVE_ROOT + '/'));
    assert.equal(paths.has(record.path), false, 'Duplicate AVP source path: ' + record.path);
    paths.add(record.path);
  }
  for (const path of paths) {
    const segments = path.split('/');
    for (let i = 1; i < segments.length; i++) dirs.add(segments.slice(0, i).join('/'));
  }
  inventory = { manifest, paths, dirs };
  return inventory;
}

/** Only this extension's exact runtime is admitted. Other DLCs retain their own admission. */
export function avpPathAdmission(path, { directory = false, built = false } = {}) {
  if (!validPath(path)) return false;
  if (AVP_PUBLIC_DIRECTORIES.has(path)) return directory;
  if (path === AVP_RUNTIME_PATH) return !directory;
  if (path.startsWith('src/dlc/avp-2004/')) return false;
  const { paths, dirs } = reviewedAvpInventory();
  if (paths.has(path)) return !directory && !built;
  if (dirs.has(path) && !['scripts', 'docs', 'docs/development'].includes(path)) return directory && !built;
  if (path.startsWith(SOURCE_ROOT + '/') || path.startsWith(ARCHIVE_ROOT + '/')) return false;
  return null;
}

export async function verifyAvpAdmission(root, { built = false } = {}) {
  const { manifest } = reviewedAvpInventory();
  const records = built ? [manifest.runtime] : [manifest.runtime, ...manifest.sources, ...manifest.records];
  for (const record of records) {
    const absolute = join(root, record.path), stat = await lstat(absolute);
    assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Invalid AVP member: ' + record.path);
    assert.equal(stat.size, record.bytes, 'Changed AVP size: ' + record.path);
    assert.equal(hash(await readFile(absolute)), record.sha256, 'Changed AVP bytes: ' + record.path);
  }
  if (built) {
    for (const path of [SOURCE_ROOT, ARCHIVE_ROOT]) {
      try { await lstat(join(root, path)); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      throw new Error('Source-only AVP records leaked into the public build: ' + path);
    }
  }
  return { ok: true, version: manifest.version, built, verifiedFiles: records.length, runtimeSha256: manifest.runtime.sha256 };
}
