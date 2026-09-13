import assert from 'node:assert/strict';
import { readdir, readFile, lstat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateContent, RELEASE } from '../src/content.js';
import { AUDIO_FORMATS_V77, AUDIO_SLOTS_V77 } from '../src/audio-assets-v77.js';

const ROOT_FILES = new Set([
  '.gitattributes', '.gitignore', '.vercelignore', 'LICENSE_NOTICE.md',
  'index.html', 'manifest.webmanifest', 'package.json', 'package-lock.json', 'sw.js', 'vercel.json',
  'alien-survival-v70.css', 'bioforge-v80.css', 'catalog-v62.css', 'crew-v85.css', 'hub-level.css',
  'hub-stations-v61.css', 'mission-insertion-v62.css', 'placeables-v86.css', 'player-onboarding-v84.css',
  'runtime-level.css', 'sprite-gallery.css', 'styles-v50.css', 'styles.css', 'title-scene-v79.css', 'title-screen-v61.css'
]);
const SCRIPT_FILES = new Set(['audio-scan-v77.mjs', 'build-asset-filter.mjs', 'build-output-guard.mjs',
  'build.mjs', 'dev.mjs', 'verify-public-release-v86.mjs']);
const ROOT_IGNORES = new Set(['.git', 'dist', 'node_modules', '.vercel']);
const PRIVATE_SEGMENT = /^(?:docs?|tests?|captures?|screenshots?|exports?|references?|reference-masters|raw|frames|previews|metadata|node_modules|dist|\.git|\.vercel|\.env.*|\.qa.*|\.tmp.*)$/i;
const PRIVATE_FILENAME = /(?:^|[-_.])(?:audit|report|reports|prompt|prompts|receipt|receipts|capture|captures|screenshot|screenshots|export|exports|qa)(?:[-_.]|$)/i;
const AUDIO_FILES = new Set(Object.entries(AUDIO_SLOTS_V77).flatMap(([kind, ids]) => ids.flatMap(id =>
  AUDIO_FORMATS_V77.map(format => `assets/audio/${kind}/${id}.${format.extension}`))));
const PRIVATE_TEXT = [
  /chatgpt\.com(?:[/?#]|$)/i,
  /g-p-[a-f0-9]{16,}/i,
  /(?<![a-z])[a-z]:[\\/]+[^\s'"<>]+/i,
  /(?:\/Users\/|\/home\/)[a-z0-9._-]+\//i,
  /\.codex[\\/]|codex[-]remote[-]attachments/i,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
  /\b(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,})\b/,
  /(?:^|[\s,{])["']?(?:chatId|chatTitle|sourceProjectId|sourceConversation|promptDocument|promptPath|generationPrompt|privatePrompt)["']?\s*:/m,
  /['"]V\d+_(?:BATCH_\d+|[A-Z_]*IMAGEGEN)/
];

// Pure checks are exported so adversarial cases can be verified without placing
// private fixtures anywhere inside the distribution tree.
export function isPublicDistributionPathV86(path, { directory = false, built = false } = {}) {
  if (typeof path !== 'string' || !path || path.includes('\\') || path.startsWith('/')) return false;
  const segments = path.split('/');
  if (segments.some(part => !part || part === '.' || part === '..' || PRIVATE_SEGMENT.test(part))) return false;
  if (directory) {
    if (segments.length === 1) return ['src', 'scripts', 'assets'].includes(path);
    return segments[0] === 'assets' && segments.every(part => !part.startsWith('.') && !PRIVATE_FILENAME.test(part));
  }
  if (segments.length === 1) return ROOT_FILES.has(path) || built && path === 'build-info.json';
  if (segments[0] === 'src') return segments.length === 2 && /^[a-z0-9][a-z0-9-]*\.js$/i.test(segments[1]);
  if (segments[0] === 'scripts') return segments.length === 2 && SCRIPT_FILES.has(segments[1]);
  if (path === 'assets/audio/manifest.json' || AUDIO_FILES.has(path)) return true;
  return segments[0] === 'assets' && segments.every(part => !part.startsWith('.') && !PRIVATE_FILENAME.test(part))
    && /\.(?:png|webp)$/i.test(path);
}

export function isPublicDistributionTextV86(text) {
  return typeof text === 'string' && PRIVATE_TEXT.every(pattern => !pattern.test(text));
}

export async function verifyPublicReleaseV86(root = process.cwd(), { built = basename(resolve(root)) === 'dist' } = {}) {
  const validation = validateContent();
  assert.equal(validation.ok, true, `Gameplay registry invalid: ${validation.failures.join(', ')}`);
  assert.equal(RELEASE.version, '86.0.0');
  assert.equal((await lstat(resolve(root))).isSymbolicLink(), false, 'Distribution root must not be a symbolic link.');
  let files = 0, assets = 0;
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = prefix + entry.name;
      assert.equal(entry.isSymbolicLink(), false, `Unexpected symbolic link: ${path}`);
      if (!prefix && ROOT_IGNORES.has(entry.name)) continue;
      assert.equal(isPublicDistributionPathV86(path, { directory: entry.isDirectory(), built }), true, `Unapproved distribution path: ${path}`);
      if (entry.isDirectory()) { await walk(join(directory, entry.name), path + '/'); continue; }
      assert.equal(entry.isFile(), true, `Unsupported filesystem entry: ${path}`);
      files++; if (path.startsWith('assets/')) assets++;
      if (ROOT_FILES.has(path) || /\.(?:js|mjs|json|css|html|md|webmanifest)$/i.test(path)) {
        const text = await readFile(join(directory, entry.name), 'utf8');
        assert.equal(isPublicDistributionTextV86(text), true, `Private source metadata in distribution: ${path}`);
      }
    }
  }
  await walk(resolve(root));
  return { ok: true, version: RELEASE.version, files, assets, privateDocuments: 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyPublicReleaseV86(), null, 2));
}
