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
  'runtime-level.css', 'sprite-gallery.css', 'styles-v50.css', 'styles.css', 'title-scene-v79.css', 'title-screen-v61.css',
  'xeno-trials-v96.css', 'depth-lab-v97.html', 'depth-lab-v97.css', 'user-reference-library-v100.css', 'specimen-bench-v106.css'
]);
const SCRIPT_FILES = new Set(['audio-scan-v77.mjs', 'build-asset-filter.mjs', 'build-output-guard.mjs',
  'build.mjs', 'dev.mjs', 'verify-public-release-v86.mjs']);
const ROOT_IGNORES = new Set(['.git', 'dist', 'node_modules', '.vercel']);
// Exact original-image paths from the V100 public reference registry. Naming
// a random JPG after a pack or recovery entry does not admit it to production.
const USER_REFERENCE_JPG_PATHS_V100 = new Set([
  'assets/user/pack-v100/alien-king-from-alien-extemrination.jpg',
  'assets/user/pack-v100/engineer-armorsuit.jpg',
  'assets/user/pack-v100/engineer-battlesuit.jpg',
  'assets/user/pack-v100/engineer-behemotsuit.jpg',
  'assets/user/pack-v100/engineer-blackgoo-jar.jpg',
  'assets/user/pack-v100/engineer-ceremonialsuit.jpg',
  'assets/user/pack-v100/engineer-mala-kak.jpg',
  'assets/user/pack-v100/engineer-original-space-jokey-variant.jpg',
  'assets/user/pack-v100/engineer-respirator.jpg',
  'assets/user/pack-v100/engineer-spacejokey.jpg',
  'assets/user/pack-v100/engineer-suit-open.jpg',
  'assets/user/pack-v100/engineer-wararmor.jpg',
  'assets/user/pack-v100/engineer-woman.jpg',
  'assets/user/pack-v100/enginner-blackgoo-vial.jpg',
  'assets/user/pack-v100/green-alien-king.jpg',
  'assets/user/pack-v100/synth-eloise.jpg',
  'assets/user/pack-v100/synth-jerri-1.jpg',
  'assets/user/pack-v100/synth-jerri-2.jpg',
  'assets/user/pack-v100/synth-workingjoe-battle.jpg',
  'assets/user/pack-v100/synth-workingjoe-classic.jpg',
  'assets/user/pack-v100/synth-workingjoe-hazmat.jpg',
  'assets/user/pack-v100/synth-workingjoe-tactical.jpg',
  'assets/user/pack-v100/wy-apesuit.jpg',
  'assets/user/pack-v100/wy-covenant-david.jpg',
  'assets/user/pack-v100/wy-prometheus-suit.jpg',
  'assets/user/pack-v100/xeno-6-chestbuster.jpg',
  'assets/user/pack-v100/xeno-6-praetorian.jpg',
  'assets/user/pack-v100/xeno-6-queen.jpg',
  'assets/user/pack-v100/xeno-6-warrior.jpg',
  'assets/user/pack-v100/xeno-albinos-drone-seven.jpg',
  'assets/user/pack-v100/xeno-bambibuster.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-chestburster.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-drone.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-egg.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-facehugger.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-praetorian.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-queen.jpg',
  'assets/user/pack-v100/xeno-chestbusterpredalien-movie.jpg',
  'assets/user/pack-v100/xeno-chestbusterqueen-grown.jpg',
  'assets/user/pack-v100/xeno-cocoon-front.jpg',
  'assets/user/pack-v100/xeno-cocoon-side.jpg',
  'assets/user/pack-v100/xeno-cocoon.jpg',
  'assets/user/pack-v100/xeno-eggmorphing.jpg',
  'assets/user/pack-v100/xeno-gorillaxeno.jpg',
  'assets/user/pack-v100/xeno-insect-queen.jpg',
  'assets/user/pack-v100/xeno-insect-warrior.jpg',
  'assets/user/pack-v100/xeno-king-xeno.jpg',
  'assets/user/pack-v100/xeno-kingrogue.jpg',
  'assets/user/pack-v100/xeno-mutated-chestburster.jpg',
  'assets/user/pack-v100/xeno-mutated-egg.jpg',
  'assets/user/pack-v100/xeno-mutated-facehugger-sideview.jpg',
  'assets/user/pack-v100/xeno-mutated-facehugger.jpg',
  'assets/user/pack-v100/xeno-offspring-adult.jpg',
  'assets/user/pack-v100/xeno-offspring-egg.jpg',
  'assets/user/pack-v100/xeno-offspring-eggsack.jpg',
  'assets/user/pack-v100/xeno-originaldesign.jpg',
  'assets/user/pack-v100/xeno-ovomorph-breedingegg.jpg',
  'assets/user/pack-v100/xeno-ovomorph-hyperfertile-eggs.jpg',
  'assets/user/pack-v100/xeno-ovomorph-praetomorph.jpg',
  'assets/user/pack-v100/xeno-ovomorph-praetorian-eggs.jpg',
  'assets/user/pack-v100/xeno-ovomorph-red.jpg',
  'assets/user/pack-v100/xeno-palatine-littlemandible.jpg',
  'assets/user/pack-v100/xeno-palatine-mandible.jpg',
  'assets/user/pack-v100/xeno-palatine-tusk-2.jpg',
  'assets/user/pack-v100/xeno-palatine-tusk.jpg',
  'assets/user/pack-v100/xeno-praetorian-king.jpg',
  'assets/user/pack-v100/xeno-praetorian-rogue.jpg',
  'assets/user/pack-v100/xeno-protomorph-chestburster.jpg',
  'assets/user/pack-v100/xeno-queenmother-ovomorph.jpg',
  'assets/user/pack-v100/xeno-red-drone.jpg',
  'assets/user/pack-v100/xeno-red-queenchestbuster-1.jpg',
  'assets/user/pack-v100/xeno-rotenline-larvae.jpg',
  'assets/user/pack-v100/xeno-royal-facehugger-alternate-to-repair.jpg',
  'assets/user/pack-v100/xeno-sewer-drone.jpg',
  'assets/user/pack-v100/xeno-sewer-praetorian.jpg',
  'assets/user/pack-v100/xeno-sewer-queen.jpg',
  'assets/user/pack-v100/xeno-sewer-warrior.jpg',
  'assets/user/pack-v100/xeno-spacejockey.jpg',
  'assets/user/pack-v100/xeno-spacejokeygiant.jpg',
  'assets/user/pack-v100/xeno-titan-drone-legs.jpg',
  'assets/user/pack-v100/xeno-titan-drone-no-legs.jpg',
  'assets/user/pack-v100/xeno-titan-queen-legs.jpg',
  'assets/user/pack-v100/xeno-titan-queen-nolegs.jpg',
  'assets/user/pack-v100/xeno-toadpole.jpg',
  'assets/user/pack-v100/xeno-xenoearth-drone.jpg',
  'assets/user/pack-v100/xeno-xenoearth-juvenile.jpg',
  'assets/user/pack-v100/xeno-xenoearth-ovomorph.jpg',
  'assets/user/pack-v100/xeno-xenoearth-warrior.jpg',
  'assets/user/recovery-v100/bipede-biomecanique-brun-10.jpg',
  'assets/user/recovery-v100/neomorph-neomorph.jpg',
  'assets/user/recovery-v100/reference-composite-09.jpg',
  'assets/user/recovery-v100/xeno-abobimantion.jpg',
  'assets/user/recovery-v100/xeno-big-xeno-2.jpg',
  'assets/user/recovery-v100/xeno-bruiser-mecha.jpg',
  'assets/user/recovery-v100/xeno-carrier-empty.jpg',
  'assets/user/recovery-v100/xeno-drone-variante.jpg',
  'assets/user/recovery-v100/xeno-experiment-3headed.jpg',
  'assets/user/recovery-v100/xeno-experiment-xeno3head.jpg',
  'assets/user/recovery-v100/xeno-necromorph.jpg',
  'assets/user/recovery-v100/xeno-praetorian-1.jpg',
  'assets/user/recovery-v100/xeno-prowler.jpg',
  'assets/user/recovery-v100/xeno-serpentin-46.jpg',
  'assets/user/recovery-v100/xeno-snake.jpg',
  'assets/user/recovery-v100/xeno-soldier-brown.jpg',
  'assets/user/recovery-v100/xeno-spitter.jpg'
]);
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
  if (segments[0] === 'src') return ['src/ship-port-v87.css', 'src/refuge-v87.css'].includes(path) || segments.length === 2 && /^[a-z0-9][a-z0-9-]*\.js$/i.test(segments[1]);
  if (segments[0] === 'scripts') return segments.length === 2 && SCRIPT_FILES.has(segments[1]);
  if (path === 'assets/audio/manifest.json' || AUDIO_FILES.has(path)) return true;
  if (USER_REFERENCE_JPG_PATHS_V100.has(path)) return true;
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
  let files = 0, assets = 0, userReferenceJpgs = 0;
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = prefix + entry.name;
      assert.equal(entry.isSymbolicLink(), false, `Unexpected symbolic link: ${path}`);
      if (!prefix && ROOT_IGNORES.has(entry.name)) continue;
      assert.equal(isPublicDistributionPathV86(path, { directory: entry.isDirectory(), built }), true, `Unapproved distribution path: ${path}`);
      if (entry.isDirectory()) { await walk(join(directory, entry.name), path + '/'); continue; }
      assert.equal(entry.isFile(), true, `Unsupported filesystem entry: ${path}`);
      files++; if (path.startsWith('assets/')) assets++;
      if (USER_REFERENCE_JPG_PATHS_V100.has(path)) userReferenceJpgs++;
      if (ROOT_FILES.has(path) || /\.(?:js|mjs|json|css|html|md|webmanifest)$/i.test(path)) {
        const text = await readFile(join(directory, entry.name), 'utf8');
        assert.equal(isPublicDistributionTextV86(text), true, `Private source metadata in distribution: ${path}`);
      }
    }
  }
  await walk(resolve(root));
  const { USER_REFERENCE_LIBRARY_V100 } = await import(pathToFileURL(join(resolve(root), 'src/user-reference-library-v100.js')).href);
  const registeredJpgs = USER_REFERENCE_LIBRARY_V100.map(entry => entry.path.replace(/^\//, '')).filter(path => path.endsWith('.jpg'));
  assert.deepEqual([...new Set(registeredJpgs)].sort(), [...USER_REFERENCE_JPG_PATHS_V100].sort(), 'Reference JPG allowlist differs from the runtime registry.');
  assert.equal(userReferenceJpgs, USER_REFERENCE_JPG_PATHS_V100.size, 'An approved original JPG is missing.');
  return { ok: true, version: RELEASE.version, files, assets, privateDocuments: 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyPublicReleaseV86(), null, 2));
}
