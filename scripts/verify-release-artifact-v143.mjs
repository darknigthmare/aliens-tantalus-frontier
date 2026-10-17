import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join, posix } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { fileManifestV143, stampReleaseHtmlV143 } from './build-release-v143.mjs';
import { verifyPublicReleaseV86 } from './verify-public-release-v86.mjs';

export async function verifyReleaseArtifactV143(root) {
  const info = JSON.parse(await readFile(join(root, 'build-info.json'), 'utf8'));
  const actual = await fileManifestV143(root);
  assert.deepEqual(actual, info.files, 'Published files differ from the release manifest.');
  assert.equal(createHash('sha256').update(JSON.stringify(actual)).digest('hex'), info.manifestSha256);
  const release = (await import(pathToFileURL(join(root, 'src/release-info-v143.js')).href)).APP_RELEASE_V143;
  for (const field of ['version', 'sourceCommit', 'buildId', 'builtAt', 'cacheName', 'saveSchema']) assert.equal(release[field], info[field], field);
  const html = await readFile(join(root, 'index.html'), 'utf8');
  assert.equal(stampReleaseHtmlV143(html, release), html, 'Visible HTML labels differ from the shipped release.');
  const context = vm.createContext({ self: { addEventListener() {} }, URL, Request, Response });
  vm.runInContext(await readFile(join(root, 'sw.js'), 'utf8') + ';globalThis.checked={CACHE,SHELL};', context);
  assert.equal(context.checked.CACHE, info.cacheName);
  const paths = new Set(actual.map(entry => '/' + entry.path));
  const shell = new Set(context.checked.SHELL);
  for (const path of shell) assert.ok(path === '/' || paths.has(path), `Missing shell resource: ${path}`);
  // Every local module import in the actual shipped sources must resolve and be
  // available offline. Dynamic literal imports are included; remote URLs aren't.
  for (const entry of actual.filter(row => row.path.startsWith('src/') && row.path.endsWith('.js'))) {
    const code = await readFile(join(root, entry.path), 'utf8');
    for (const match of code.matchAll(/(?:from\s*|import\s*\(?\s*)['"](\.[^'"]+|\/src\/[^'"]+)['"]/g)) {
      const path = match[1].startsWith('/') ? match[1] : '/' + posix.normalize(posix.join(posix.dirname(entry.path), match[1]));
      assert.ok(paths.has(path), `Unresolved module: ${entry.path} -> ${path}`);
      assert.ok(shell.has(path), `Module absent from offline shell: ${path}`);
    }
  }
  await verifyPublicReleaseV86(root, { built: true });
  return { ok: true, buildId: info.buildId, sourceCommit: info.sourceCommit, files: actual.length, shell: shell.size, manifestSha256: info.manifestSha256 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) console.log(JSON.stringify(await verifyReleaseArtifactV143(resolve(process.env.ATF_BUILD_OUTPUT || 'dist')), null, 2));
