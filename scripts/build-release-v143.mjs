import { readdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveSafeBuildOutput } from './build-output-guard.mjs';
import { APP_RELEASE_V143 } from '../src/release-info-v143.js';
import { CAMPAIGNS } from '../src/content.js';
import { SPECIAL_OPERATIONS_V131 } from '../src/special-operations-v131.js';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

export async function fileManifestV143(root) {
  const rows = [];
  async function walk(directory, prefix = '') {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const path = prefix + entry.name;
      if (entry.isSymbolicLink()) throw new Error(`Symlink in release: ${path}`);
      if (entry.isDirectory()) await walk(join(directory, entry.name), path + '/');
      else if (entry.isFile() && path !== 'build-info.json') {
        const bytes = await readFile(join(directory, entry.name));
        rows.push({ path, bytes: bytes.length, sha256: hash(bytes) });
      }
    }
  }
  await walk(root);
  return rows.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}

export function resolveSourceCommitV143(root, env = process.env, readGit = (cwd) => execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()) {
  let git = null;
  try { git = readGit(root); } catch { /* Vercel archives may omit .git. */ }
  const provided = env.VERCEL_GIT_COMMIT_SHA || env.GITHUB_SHA || null;
  const candidate = git || provided;
  if (candidate && !/^[a-f0-9]{40}$/i.test(candidate)) throw new Error('Invalid source commit identifier.');
  if (!candidate && (env.CI === 'true' || env.VERCEL === '1')) throw new Error('A CI release requires an identifiable source commit.');
  return candidate?.toLowerCase() || null;
}

/** Keep the metadata, title and visible runtime badge on the same build.
 * Also used by the native dev server; no DOM mutation or global replacement. */
export function stampReleaseHtmlV143(html, { version, buildId = version } = {}) {
  if (typeof html !== 'string' || !/^\d+\.\d+\.\d+$/.test(version || '')
    || typeof buildId !== 'string' || buildId.length > 100 || !/^[a-zA-Z0-9.+_-]+$/.test(buildId)
    || buildId !== version && !buildId.startsWith(version + '+')) throw new Error('Invalid visible release identity.');
  const replaceOne = (pattern, replacement) => {
    if ([...html.matchAll(new RegExp(pattern.source, 'g'))].length !== 1) throw new Error('Release HTML anchor is missing or duplicated.');
    html = html.replace(pattern, replacement);
  };
  replaceOne(/(<meta name="atf-release" content=")[^"]*(">)/, (_, start, end) => start + buildId + end);
  replaceOne(/(<p class="title-build">[\s\S]*?VERSION )[^<]*(<\/p>)/,
    (_, start, end) => start + buildId + ' · BUILD FRONTIER' + end);
  replaceOne(/<b(?: id="runtime-version-v143")?(?: title="[^"]*")?>v[0-9.]+<\/b>RUNTIME/,
    () => `<b id="runtime-version-v143" title="${buildId}">v${version}</b>RUNTIME`);
  return html;
}

export async function stampReleaseV143(root, output, { env = process.env } = {}) {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  if (pkg.version !== APP_RELEASE_V143.version) throw new Error('Package and runtime release versions differ.');
  const before = await fileManifestV143(output);
  const sourceCommit = resolveSourceCommitV143(root, env);
  const builtAt = new Date().toISOString();
  // Include metadata: a rebuilt commit must not reuse a cache carrying another build timestamp.
  const fingerprint = hash(JSON.stringify({ files: before, sourceCommit, builtAt }));
  const cacheName = `atf-v143-${fingerprint.slice(0, 24)}`;
  const buildId = `${pkg.version}+${sourceCommit?.slice(0, 12) || fingerprint.slice(0, 12)}`;
  const release = { ...APP_RELEASE_V143, sourceCommit, buildId, builtAt, cacheName, displayVersion: buildId };
  await writeFile(join(output, 'src/release-info-v143.js'), `export const APP_RELEASE_V143 = Object.freeze(${JSON.stringify(release, null, 2)});\n`);
  const worker = await readFile(join(output, 'sw.js'), 'utf8');
  if (!/^const CACHE = 'atf-v143-[a-z0-9-]+';$/m.test(worker)) throw new Error('Unrecognized service worker cache declaration.');
  await writeFile(join(output, 'sw.js'), worker.replace(/^const CACHE = 'atf-v143-[a-z0-9-]+';$/m, `const CACHE = '${cacheName}';`));
  const html = await readFile(join(output, 'index.html'), 'utf8');
  await writeFile(join(output, 'index.html'), stampReleaseHtmlV143(html, release));
  const manifest = await fileManifestV143(output);
  const original = JSON.parse(await readFile(join(output, 'build-info.json'), 'utf8'));
  const mire = CAMPAIGNS.filter(entry => entry.mode === 'MIRE');
  const info = { ...original, version: pkg.version, sourceVersion: APP_RELEASE_V143.sourceVersion,
    sourceCommit, buildId, builtAt, cacheName, saveSchema: APP_RELEASE_V143.saveSchema,
    inputFingerprint: fingerprint, manifestSha256: hash(JSON.stringify(manifest)), files: manifest,
    contentReadiness: { mireGeneratedScenarios: mire.length,
      mireSettingAdaptations: mire.filter(entry => entry.historicalSettingV143).length,
      mireOriginalSimulations: mire.filter(entry => !entry.historicalSettingV143).length,
      mireCompleteHistoricalCampaigns: 0,
      specialOperations: SPECIAL_OPERATIONS_V131.map(entry => ({ id: entry.id, playable: Boolean(entry.playable),
        status: entry.implementationStatus, remaining: [...entry.remainingMechanics] })) },
    codeBudget: { modules: manifest.filter(entry => entry.path.startsWith('src/') && entry.path.endsWith('.js')).length,
      uncompressedBytes: manifest.filter(entry => entry.path.startsWith('src/') && entry.path.endsWith('.js')).reduce((n, entry) => n + entry.bytes, 0) }
  };
  await writeFile(join(output, 'build-info.json'), JSON.stringify(info, null, 2) + '\n');
  return info;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = process.cwd();
  const output = resolveSafeBuildOutput(root, process.env.ATF_BUILD_OUTPUT || 'dist');
  // Preserve the native asset admissions, audio manifest and private-data guards.
  await import('./build.mjs');
  const result = await stampReleaseV143(root, output);
  console.log(`Release ${result.buildId}: ${result.files.length} fingerprinted files; save schema ${result.saveSchema}.`);
}
