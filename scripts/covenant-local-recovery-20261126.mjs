import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const COVENANT_RECOVERY_ROOT = 'docs/covenant/recovery-20261126';
export const COVENANT_RECOVERY_MANIFEST = COVENANT_RECOVERY_ROOT + '/MANIFEST.json';
export const COVENANT_RECOVERY_MANIFEST_SHA256 = 'ac1c505f0067a77efc3c917ad3207a11ebe243ce26cbaefcd5f10d52de72e41e';
const metadata = new Set([COVENANT_RECOVERY_MANIFEST, COVENANT_RECOVERY_ROOT + '/README.md']);
const safe = path => typeof path === 'string' && path.length > 0 && !path.startsWith('/')
  && !path.includes('\\') && !path.includes('\0')
  && path.split('/').every(part => part && part !== '.' && part !== '..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

/** Only reviewed paths are admitted. The manifest cannot authorize its own edits. */
export function compileCovenantLocalRecovery(bytes, expected = COVENANT_RECOVERY_MANIFEST_SHA256) {
  assert.equal(sha256(bytes), expected, 'Unreviewed Covenant recovery manifest');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.archiveRoot, COVENANT_RECOVERY_ROOT);
  assert.equal(manifest.verified1to1, false);
  assert.ok(Array.isArray(manifest.files));
  const files = new Map();
  const directories = new Set([COVENANT_RECOVERY_ROOT]);
  for (const entry of manifest.files) {
    assert.ok(safe(entry.path) && entry.path.startsWith(COVENANT_RECOVERY_ROOT + '/'));
    assert.equal(metadata.has(entry.path), false);
    assert.equal(files.has(entry.path), false, 'Duplicate recovery path');
    assert.ok(Number.isSafeInteger(entry.sizeBytes) && entry.sizeBytes >= 0);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.equal(entry.runtimeIntegrated, false);
    assert.equal(entry.verified1to1, false);
    files.set(entry.path, Object.freeze({ ...entry }));
    const parts = entry.path.split('/');
    for (let i = 3; i < parts.length; i++) directories.add(parts.slice(0, i).join('/'));
  }
  for (const path of files.keys()) assert.equal(directories.has(path), false);
  return Object.freeze({ manifest, files, directories });
}

let inventory;
export function reviewedCovenantLocalRecovery() {
  if (!inventory) inventory = compileCovenantLocalRecovery(
    readFileSync(new URL('../' + COVENANT_RECOVERY_MANIFEST, import.meta.url)));
  return inventory;
}

export function covenantLocalRecoveryAdmission(path, { directory = false, built = false } = {}) {
  if (!safe(path)) return false;
  if (path !== COVENANT_RECOVERY_ROOT && !path.startsWith(COVENANT_RECOVERY_ROOT + '/')) return null;
  // Rejected and unassigned generations are evidence only, never runtime art.
  if (built) return false;
  const reviewed = reviewedCovenantLocalRecovery();
  return directory ? reviewed.directories.has(path) : metadata.has(path) || reviewed.files.has(path);
}
