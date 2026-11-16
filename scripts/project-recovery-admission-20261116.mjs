import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream, readFileSync } from 'node:fs';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PROJECT_RECOVERY_ROOT_20261116 = 'archives/project-recovery-20261116';
export const PROJECT_RECOVERY_MANIFEST_20261116 = `${PROJECT_RECOVERY_ROOT_20261116}/predator/MANIFEST.json`;
// Updated only after the complete import and its manifest have been reviewed.
export const PROJECT_RECOVERY_MANIFEST_SHA256_20261116 = 'e08ff5d1564bae543cf88f825c0cd8f041f9c91dc3664e66158af522bf4d6f06';
export const PROJECT_RECOVERY_TOOLS_20261116 = Object.freeze([
  'scripts/project-recovery-admission-20261116.mjs',
  'scripts/verify-project-recovery-admission-20261116.mjs',
]);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = path => typeof path === 'string' && path.length > 0
  && !path.includes('\\') && !path.includes('\0') && !path.startsWith('/')
  && path.split('/').every(segment => segment && segment !== '.' && segment !== '..');

/** Compile an exact byte inventory. The caller supplies a separately reviewed
 * digest; a file cannot authorize its own changed contents or add a path. */
export function compileProjectRecoveryManifest20261116(bytes, expectedSha256) {
  assert.match(expectedSha256, /^[a-f0-9]{64}$/, 'Invalid reviewed archive manifest digest.');
  assert.equal(digest(bytes), expectedSha256, 'Unreviewed project recovery manifest bytes.');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schemaVersion, 1, 'Unsupported project recovery manifest schema.');
  assert.equal(manifest.archiveRoot, PROJECT_RECOVERY_ROOT_20261116, 'Unexpected project recovery root.');
  assert.ok(Array.isArray(manifest.files), 'Project recovery files must be an array.');
  const files = new Map();
  const directories = new Set(['archives', PROJECT_RECOVERY_ROOT_20261116]);
  for (const entry of manifest.files) {
    assert.ok(entry && validPath(entry.path)
      && entry.path.startsWith(`${PROJECT_RECOVERY_ROOT_20261116}/`)
      && entry.path !== PROJECT_RECOVERY_MANIFEST_20261116, 'Unsafe project recovery member path.');
    assert.equal(files.has(entry.path), false, `Duplicate project recovery member: ${entry.path}`);
    assert.ok(Number.isSafeInteger(entry.sizeBytes) && entry.sizeBytes >= 0, `Invalid archive member size: ${entry.path}`);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/, `Invalid archive member digest: ${entry.path}`);
    files.set(entry.path, Object.freeze({ path: entry.path, sizeBytes: entry.sizeBytes, sha256: entry.sha256 }));
    const segments = entry.path.split('/');
    for (let index = 1; index < segments.length; index++) directories.add(segments.slice(0, index).join('/'));
  }
  for (const path of files.keys()) assert.equal(directories.has(path), false, `Archive file/directory collision: ${path}`);
  const admits = (path, { directory = false, built = false } = {}) => {
    if (!validPath(path)) return false;
    if (PROJECT_RECOVERY_TOOLS_20261116.includes(path)) return !directory && !built;
    if (path !== 'archives' && path !== PROJECT_RECOVERY_ROOT_20261116
      && !path.startsWith(`${PROJECT_RECOVERY_ROOT_20261116}/`)) return null;
    if (built) return false;
    return directory ? directories.has(path) : path === PROJECT_RECOVERY_MANIFEST_20261116 || files.has(path);
  };
  return Object.freeze({ manifest, files, directories, expectedSha256, admits });
}

let reviewed;
export function reviewedProjectRecovery20261116() {
  if (!reviewed) reviewed = compileProjectRecoveryManifest20261116(
    readFileSync(new URL(`../${PROJECT_RECOVERY_MANIFEST_20261116}`, import.meta.url)),
    PROJECT_RECOVERY_MANIFEST_SHA256_20261116);
  return reviewed;
}

/** null delegates unrelated paths to the established release policy. */
export function projectRecoveryPathAdmission20261116(path, { directory = false, built = false } = {}) {
  if (!validPath(path)) return false;
  if (PROJECT_RECOVERY_TOOLS_20261116.includes(path)) return !directory && !built;
  if (path !== 'archives' && path !== PROJECT_RECOVERY_ROOT_20261116
    && !path.startsWith(`${PROJECT_RECOVERY_ROOT_20261116}/`)) return null;
  if (built) return false;
  return reviewedProjectRecovery20261116().admits(path, { directory, built });
}

async function hashFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

/** Verify every expected byte and every actual member. Historical prompts and
 * prototypes are preserved as source records, never treated as runtime media. */
export async function verifyProjectRecoveryArchive20261116(root, {
  built = false,
  expectedSha256 = PROJECT_RECOVERY_MANIFEST_SHA256_20261116,
} = {}) {
  const directory = join(resolve(root), PROJECT_RECOVERY_ROOT_20261116);
  if (built) {
    try { await lstat(join(resolve(root), 'archives')); }
    catch (error) { if (error?.code === 'ENOENT') return { ok: true, files: 0, bytes: 0, built: true }; throw error; }
    throw new Error('Project recovery archives must not be present in a built distribution.');
  }
  const parent = await lstat(join(resolve(root), 'archives'));
  assert.ok(parent.isDirectory() && !parent.isSymbolicLink(), 'Invalid project recovery parent directory.');
  const rootStat = await lstat(directory);
  assert.ok(rootStat.isDirectory() && !rootStat.isSymbolicLink(), 'Invalid project recovery directory.');
  const manifestPath = join(resolve(root), PROJECT_RECOVERY_MANIFEST_20261116);
  const manifestStat = await lstat(manifestPath);
  assert.ok(manifestStat.isFile() && !manifestStat.isSymbolicLink(), 'Invalid project recovery manifest file.');
  const inventory = compileProjectRecoveryManifest20261116(await readFile(manifestPath), expectedSha256);
  const seen = new Set();
  let bytes = 0;
  async function walk(relativeDirectory) {
    for (const entry of await readdir(join(resolve(root), relativeDirectory), { withFileTypes: true })) {
      const path = `${relativeDirectory}/${entry.name}`;
      assert.equal(entry.isSymbolicLink(), false, `Archive symlink is not allowed: ${path}`);
      assert.equal(inventory.admits(path, { directory: entry.isDirectory() }), true, `Unlisted project recovery path: ${path}`);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.equal(entry.isFile(), true, `Unsupported project recovery member: ${path}`);
      if (path === PROJECT_RECOVERY_MANIFEST_20261116) continue;
      const expected = inventory.files.get(path);
      const actualPath = join(resolve(root), path);
      const actual = await lstat(actualPath);
      assert.equal(actual.size, expected.sizeBytes, `Changed project recovery size: ${path}`);
      assert.equal(await hashFile(actualPath), expected.sha256, `Changed project recovery bytes: ${path}`);
      seen.add(path); bytes += actual.size;
    }
  }
  await walk(PROJECT_RECOVERY_ROOT_20261116);
  for (const path of inventory.files.keys()) assert.ok(seen.has(path), `Missing project recovery member: ${path}`);
  // A concurrent edit cannot replace the manifest after its first validation.
  assert.equal(digest(await readFile(manifestPath)), expectedSha256, 'Project recovery manifest changed during verification.');
  return { ok: true, files: seen.size, bytes, manifestSha256: expectedSha256, built: false };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyProjectRecoveryArchive20261116(
    process.cwd(), { built: process.argv.includes('--built') }), null, 2));
}
