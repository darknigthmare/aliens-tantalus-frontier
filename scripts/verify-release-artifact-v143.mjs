import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join, posix } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { fileManifestV143, stampReleaseHtmlV143 } from './build-release-v143.mjs';
import { verifyPublicReleaseV86 } from './verify-public-release-v86.mjs';
import { DEV_TOOLS_FILES_V188, DEV_TOOLS_PATH_ENV_V188, DEV_TOOLS_SOURCE_DIRECTORY_V188, devBootstrapScriptV188, extractDevBootstrapV188, findBuiltDevToolsPathV188,
  resolveDevToolsPathV188, rewriteDevToolsHtmlV188, splitDevToolsManifestV188 } from './build-dev-tools-v188.mjs';

/** Shipped hidden: isolated by the inline bootstrap, linked from nowhere, named by no published file, not indexed. */
async function verifyHiddenDevToolsV188(root, devPath, html) {
  const read = path => readFile(join(root, path), 'utf8');
  const shim = await read(`${devPath}/dev-storage-v188.js`);
  assert.equal(extractDevBootstrapV188(html), devBootstrapScriptV188(shim), 'The inline isolation bootstrap differs from the shipped storage shim.');
  assert.equal(html.indexOf('<script'), html.indexOf('<script data-atf-dev-boot="v188">'), 'The isolation bootstrap must be the first script of the page.');
  const withoutBoot = html.replace(extractDevBootstrapV188(html), '');
  assert.doesNotMatch(withoutBoot, /atf-dev|devtools/i, 'The player page must not mention the developer tools outside the bootstrap.');
  for (const path of ['index.html', 'sw.js', 'build-info.json', 'manifest.webmanifest', 'LICENSE_NOTICE.md'])
    assert.equal((await read(path)).includes(devPath), false, `${path} names the hidden developer path.`);
  const page = await read(`${devPath}/index.html`);
  assert.match(page, /<meta name="robots" content="noindex,nofollow">/);
  assert.equal(page.includes(`/${DEV_TOOLS_SOURCE_DIRECTORY_V188}/`), false, 'The launcher page still names the source directory.');
  assert.equal(rewriteDevToolsHtmlV188(page.split(`/${devPath}/`).join(`/${DEV_TOOLS_SOURCE_DIRECTORY_V188}/`), devPath), page);
  for (const file of DEV_TOOLS_FILES_V188.filter(name => name.endsWith('.js')))
    assert.doesNotMatch(await read(`${devPath}/${file}`), /['"`]\/devtools\//, `${file} hard-codes the source directory.`);
}

export async function verifyReleaseArtifactV143(root) {
  const info = JSON.parse(await readFile(join(root, 'build-info.json'), 'utf8'));
  // Spec 012: one hidden directory holds the developer tools; the published manifest lists every other file.
  const devPath = await findBuiltDevToolsPathV188(root);
  if (process.env[DEV_TOOLS_PATH_ENV_V188]) assert.equal(devPath, resolveDevToolsPathV188(), 'The hidden developer path differs from ATF_DEV_TOOLS_PATH.');
  const everything = await fileManifestV143(root);
  const { files: actual, devTools } = splitDevToolsManifestV188(everything, devPath);
  assert.deepEqual(devTools, info.devTools, 'Shipped developer tools differ from the release fingerprint.');
  assert.deepEqual(everything.filter(row => row.path.startsWith(devPath + '/')).map(row => row.path.slice(devPath.length + 1)).sort(), [...DEV_TOOLS_FILES_V188].sort(), 'Unexpected developer tool files.');
  assert.deepEqual(actual, info.files, 'Published files differ from the release manifest.');
  assert.equal(createHash('sha256').update(JSON.stringify(actual)).digest('hex'), info.manifestSha256);
  const release = (await import(pathToFileURL(join(root, 'src/release-info-v143.js')).href)).APP_RELEASE_V143;
  for (const field of ['version', 'sourceCommit', 'buildId', 'builtAt', 'cacheName', 'saveSchema']) assert.equal(release[field], info[field], field);
  const html = await readFile(join(root, 'index.html'), 'utf8');
  assert.equal(stampReleaseHtmlV143(html, release), html, 'Visible HTML labels differ from the shipped release.');
  await verifyHiddenDevToolsV188(root, devPath, html);
  const context = vm.createContext({ self: { addEventListener() {} }, URL, Request, Response });
  vm.runInContext(await readFile(join(root, 'sw.js'), 'utf8') + ';globalThis.checked={CACHE,SHELL};', context);
  assert.equal(context.checked.CACHE, info.cacheName);
  const paths = new Set(actual.map(entry => '/' + entry.path));
  const shell = new Set(context.checked.SHELL);
  for (const path of shell) assert.ok(path === '/' || paths.has(path), `Missing shell resource: ${path}`);
  for (const path of shell) assert.equal(path.startsWith(`/${devPath}/`) || path === `/${devPath}`, false, 'The developer tools must stay out of the offline shell.');
  // Every local module import in the actual shipped sources must resolve and be
  // available offline. Dynamic literal imports are included; remote URLs aren't.
  for (const entry of actual.filter(row => row.path.startsWith('src/') && row.path.endsWith('.js'))) {
    const code = await readFile(join(root, entry.path), 'utf8');
    assert.equal(code.includes(devPath) || /devtools\//.test(code), false, `A shipped game module names the developer tools: ${entry.path}`);
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
