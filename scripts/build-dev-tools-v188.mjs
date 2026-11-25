// Spec 012 (owner decision 2026-11-23): the developer tools are shipped in the public build,
// hidden. This module is the single description of that shipping, shared by the builder
// (scripts/build-release-v143.mjs), the native dev server (scripts/dev.mjs) and the
// release verifiers.
//
// Hidden means obscurity only: no player screen links to the tools and the published
// directory name appears in no shipped file outside that directory, but there is no
// access control. Anyone who knows or guesses the address can open the page.
//
//   <output>/<path>/…          the files of devtools/ (the launcher page and its modules)
//   <output>/index.html        gets ONE inline classic script, first script of <head>:
//                              `if (<exact dev query>) { <devtools/dev-storage-v188.js> }`
//
// The inline script is the isolation. It must run before any game script, whatever serves
// index.html (static host, rewrite fallback, service-worker shell), so it cannot be a
// separate request and it cannot depend on the hidden path. Without the dev query it is one
// regular-expression test on `location.search`.
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

export const DEV_SESSION_QUERY_V188 = 'atf-dev';
export const DEV_SESSION_VALUE_V188 = 'v188';
/** The exact test the shipped page runs on `location.search`. */
export const DEV_SESSION_SEARCH_TEST_V188 = '/[?&]atf-dev=v188(?:&|$)/.test(location.search)';
export const DEV_TOOLS_SOURCE_DIRECTORY_V188 = 'devtools';
export const DEV_TOOLS_PATH_ENV_V188 = 'ATF_DEV_TOOLS_PATH';
/** Documented default; a deployment can choose another one without committing it. */
export const DEV_TOOLS_DEFAULT_PATH_V188 = 'labo-tantalus-v188';
export const DEV_TOOLS_FILES_V188 = Object.freeze([
  'dev-catalog-v188.js', 'dev-fixtures-v188.js', 'dev-launcher-v188.js', 'dev-range-metrics-v188.js', 'dev-range-v188.js',
  'dev-session-v188.js', 'dev-storage-v188.js', 'dev-v188.css', 'index.html'
]);
const DEV_TOOLS_PATH_PATTERN_V188 = /^[a-z0-9][a-z0-9-]{6,62}[a-z0-9]$/;
// Names the host, the rewrites or the release verifier already give a meaning to.
const DEV_TOOLS_RESERVED_V188 = /^(?:src|assets|scripts|devtools|docs?|tests?|specs?|archives?|references?|exports?|captures?|screenshots?|reference-masters|raw|frames|previews|metadata|node_modules|dist|depth-lab-v97|studio-tests)$/;

export function isDevToolsPublicPathV188(value) {
  return typeof value === 'string' && DEV_TOOLS_PATH_PATTERN_V188.test(value) && !DEV_TOOLS_RESERVED_V188.test(value) && !value.includes('--');
}

/** One lowercase path segment, 8 to 64 characters of [a-z0-9-]. */
export function resolveDevToolsPathV188(env = process.env) {
  const raw = env?.[DEV_TOOLS_PATH_ENV_V188];
  const value = raw === undefined || raw === '' ? DEV_TOOLS_DEFAULT_PATH_V188 : String(raw);
  if (!isDevToolsPublicPathV188(value)) throw new Error(`${DEV_TOOLS_PATH_ENV_V188} must be one segment of 8 to 64 characters among a-z, 0-9 and "-" (not a reserved name).`);
  return value;
}

/** Full-line comments and indentation are dropped; the code is otherwise the reviewed source. */
export function devBootstrapScriptV188(shimSource) {
  if (typeof shimSource !== 'string' || !shimSource.includes('installDevStorageV188') || /<\/script|<!--/i.test(shimSource)) throw new Error('Dev bootstrap: unexpected storage shim.');
  const body = shimSource.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//')).join('\n');
  return `<script data-atf-dev-boot="v188">if (${DEV_SESSION_SEARCH_TEST_V188}) {\n${body}\n}</script>`;
}

const BOOT_ANCHOR = '<meta charset="UTF-8">';
const BOOT_PATTERN = /\n  <script data-atf-dev-boot="v188">[\s\S]*?<\/script>/g;
export function extractDevBootstrapV188(html) {
  const found = String(html).match(BOOT_PATTERN) || [];
  return found.length === 1 ? found[0].trimStart() : null;
}
/** Inserts the bootstrap as the first script of the page, at one exact anchor. */
export function injectDevBootstrapHtmlV188(html, shimSource) {
  if (typeof html !== 'string') throw new Error('Dev bootstrap: HTML expected.');
  if (html.split(BOOT_ANCHOR).length !== 2 || html.indexOf('<script') < html.indexOf(BOOT_ANCHOR)) throw new Error('Dev bootstrap: index.html anchor missing, duplicated or preceded by a script.');
  if (BOOT_PATTERN.test(html)) { BOOT_PATTERN.lastIndex = 0; throw new Error('Dev bootstrap: already present.'); }
  return html.replace(BOOT_ANCHOR, `${BOOT_ANCHOR}\n  ${devBootstrapScriptV188(shimSource)}`);
}

/** The launcher page names its own directory with absolute URLs (a host may serve it without the trailing slash). */
export function rewriteDevToolsHtmlV188(html, path) {
  if (!isDevToolsPublicPathV188(path)) throw new Error('Dev tools: invalid public path.');
  const source = `/${DEV_TOOLS_SOURCE_DIRECTORY_V188}/`;
  if (!html.includes(source)) throw new Error('Dev tools: launcher page anchors missing.');
  return html.split(source).join(`/${path}/`);
}

export async function readDevStorageShimV188(root) {
  return readFile(join(root, DEV_TOOLS_SOURCE_DIRECTORY_V188, 'dev-storage-v188.js'), 'utf8');
}

/** Copies the tools under the hidden path and installs the bootstrap in the built shell. */
export async function shipDevToolsV188(root, output, { env = process.env } = {}) {
  const path = resolveDevToolsPathV188(env);
  const present = (await readdir(join(root, DEV_TOOLS_SOURCE_DIRECTORY_V188))).sort();
  if (JSON.stringify(present) !== JSON.stringify([...DEV_TOOLS_FILES_V188].sort())) throw new Error(`Dev tools: unexpected file list (${present.join(', ')}).`);
  await mkdir(join(output, path));
  for (const file of DEV_TOOLS_FILES_V188) {
    const from = join(root, DEV_TOOLS_SOURCE_DIRECTORY_V188, file), to = join(output, path, file);
    if (file === 'index.html') await writeFile(to, rewriteDevToolsHtmlV188(await readFile(from, 'utf8'), path));
    else await cp(from, to);
  }
  const index = join(output, 'index.html');
  await writeFile(index, injectDevBootstrapHtmlV188(await readFile(index, 'utf8'), await readDevStorageShimV188(root)));
  return { path, files: DEV_TOOLS_FILES_V188.length };
}

/** The hidden directory of a built tree, found by its content (the name is not written anywhere else). */
export async function findBuiltDevToolsPathV188(output) {
  const found = [];
  for (const entry of await readdir(output, { withFileTypes: true })) {
    if (!entry.isDirectory() || ['src', 'assets', 'dlc'].includes(entry.name)) continue;
    found.push(entry.name);
  }
  if (found.length !== 1 || !isDevToolsPublicPathV188(found[0])) throw new Error(`Dev tools: exactly one hidden directory is expected in a build (found: ${found.join(', ') || 'none'}).`);
  return found[0];
}

/** Published manifest rows never carry the hidden name: the tools are fingerprinted by file name only. */
export function splitDevToolsManifestV188(rows, path) {
  const prefix = `${path}/`;
  const tools = rows.filter(row => row.path.startsWith(prefix)).map(row => ({ ...row, path: row.path.slice(prefix.length) }));
  const files = rows.filter(row => !row.path.startsWith(prefix));
  return { files, devTools: { hidden: true, files: tools.length, sha256: createHash('sha256').update(JSON.stringify(tools)).digest('hex') } };
}
