import assert from 'node:assert/strict';
import { readdir, readFile, lstat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateContent, RELEASE } from '../src/content.js';
import { AUDIO_FORMATS_V77, AUDIO_SLOTS_V77 } from '../src/audio-assets-v77.js';
import { publicReleasePathAdmissionV119, verifyPublicAdmissionsV119 } from './public-release-admissions-v119.mjs';
import { publicReleasePathAdmissionV120, verifyPublicAdmissionsV120 } from './public-release-admissions-v120.mjs';
import { publicReleasePathAdmissionV121, verifyPublicAdmissionsV121 } from './public-release-admissions-v121.mjs';
import { publicReleasePathAdmissionV122, verifyPublicAdmissionsV122 } from './public-release-admissions-v122.mjs';
import { publicReleasePathAdmissionV123, verifyPublicAdmissionsV123 } from './public-release-admissions-v123.mjs';

const ROOT_FILES = new Set([
  'command-v110.css', 'echo9-v110.css', 'player-appearance-v126.css',
  '.gitattributes', '.gitignore', '.vercelignore', 'LICENSE_NOTICE.md',
  'index.html', 'manifest.webmanifest', 'package.json', 'package-lock.json', 'sw.js', 'vercel.json',
  'alien-survival-v70.css', 'bioforge-v80.css', 'catalog-v62.css', 'crew-v85.css', 'hub-level.css',
  'hub-stations-v61.css', 'mission-insertion-v62.css', 'placeables-v86.css', 'player-onboarding-v84.css',
  'runtime-level.css', 'sprite-gallery.css', 'styles-v50.css', 'styles.css', 'title-scene-v79.css', 'title-screen-v61.css',
  'xeno-trials-v96.css', 'xeno-trials-fullscreen-v119.css', 'user-reference-library-v100.css', 'specimen-bench-v106.css'
]);
const SCRIPT_FILES = new Set(['audit-weapon-png-v120.mjs', 'public-release-admissions-v123.mjs', 'public-release-admissions-v122.mjs', 'public-release-admissions-v121.mjs', 'audio-scan-v77.mjs', 'build-asset-filter.mjs', 'build-output-guard.mjs',
  'build.mjs', 'dev.mjs', 'verify-public-release-v86.mjs', 'public-release-admissions-v119.mjs', 'public-release-admissions-v120.mjs',
  'verify-player-runtime-v124.mjs', 'verify-player-presentation-v124.mjs', 'verify-player-field-actions-v124.mjs', 'qa-player-browser-v124.mjs',
  'verify-player-body-rig-v125.mjs', 'verify-player-weapon-rig-v125.mjs', 'verify-held-weapon-v125.mjs', 'verify-weapon-image-cache-v125.mjs',
  'verify-player-appearance-v126.mjs', 'verify-player-appearance-runtime-v126.mjs', 'verify-player-modular-rig-v126.mjs',
  'verify-player-action-rig-v127.mjs', 'verify-player-appearance-preview-v127.mjs',
  'verify-player-transit-rig-v128.mjs', 'verify-player-appearance-preview-v128.mjs', 'verify-player-incapacitation-v128.mjs',
  'verify-player-locomotion-rig-v129.mjs', 'verify-player-colonial-art-v129.mjs', 'verify-player-appearance-preview-v129.mjs',
  'verify-enemy-tactics-v130.mjs', 'verify-destructible-scenery-v130.mjs', 'verify-vertical-world-v130.mjs', 'verify-weapon-actions-v130.mjs', 'qa-frontier-browser-v130.mjs',
  'verify-weapon-actions-v131.mjs', 'verify-apc-course-v131.mjs', 'verify-hive-missions-v131.mjs',
  'verify-mecha-missions-v131.mjs', 'verify-ecosystem-missions-v131.mjs', 'verify-legacy-operations-v131.mjs',
  'verify-operations-integration-v131.mjs', 'qa-operations-browser-v131.mjs', 'verify-hive-command-ui-v131.mjs',
  'verify-operation-receipts-v131.mjs',
  'generate-audio-v132.mjs', 'verify-audio-score-v132.mjs', 'qa-audio-browser-v132.mjs',
  'verify-squad-doctrine-v132.mjs', 'verify-placeables-extension-v132.mjs',
  'verify-horde-director-v132.mjs', 'verify-narrative-evidence-v132.mjs',
  'verify-hub-training-v132.mjs', 'verify-bioforge-admissions-v132.mjs',
  'qa-squad-browser-v132.mjs', 'qa-hub-browser-v132.mjs',
  'qa-placeables-browser-v132.mjs',
  'qa-narrative-browser-v132.mjs',
  'qa-horde-browser-v132.mjs',
  'verify-hub-control-bindings-v133.mjs', 'verify-hub-navigation-v133.mjs',
  'qa-hub-navigation-v133.mjs', 'qa-controls-browser-v133.mjs', 'qa-human-locomotion-v133.mjs',
  'verify-human-visual-contract-v133.mjs',
  'verify-human-patrol-animation-v133.mjs',
  'verify-human-gait-v133.mjs', 'qa-human-visual-browser-v133.mjs',
  'verify-hub-authored-composition-v133.mjs', 'qa-hub-interactions-browser-v133.mjs',
  'verify-hub-bulkhead-depth-v134.mjs', 'verify-hub-room-parallax-v134.mjs',
  'verify-hub-room-dressing-v134.mjs', 'verify-sprite-alpha-policy-v134.mjs', 'verify-hub-environment-atlas-v134.mjs',
  'qa-hub-presentation-v134.mjs', 'qa-hub-room-parallax-v134.mjs',
  'verify-jeri-surface-motion-v135.mjs', 'qa-jeri-surface-browser-v135.mjs',
  'verify-crew-conversation-memory-v135.mjs', 'verify-field-media-v135.mjs',
  'verify-npc-dialogue-causality-v135.mjs', 'qa-continuation-browser-v135.mjs',
  'verify-editor-authoring-v135.mjs', 'verify-player-wardrobe-v135.mjs', 'qa-authoring-browser-v135.mjs',
  'verify-hub-spatial-design-v136.mjs', 'verify-hub-room-life-v136.mjs', 'verify-hub-prop-atlas-v136.mjs',
  'verify-human-motion-v136.mjs', 'verify-npc-life-v136.mjs', 'verify-editor-spatial-v136.mjs',
  'qa-tantalus-design-v136.mjs', 'qa-npc-life-v136.mjs', 'qa-editor-spatial-browser-v136.mjs',
  'verify-hub-ship-layout-v137.mjs', 'verify-hub-circulation-v137.mjs',
  'verify-hub-room-furnishing-v137.mjs', 'verify-hub-room-identity-v137.mjs', 'qa-tantalus-ship-v137.mjs',
  'verify-hub-service-routes-v138.mjs', 'verify-hub-crawl-hint-v138.mjs',
  'verify-hub-interior-wall-atlas-v138.mjs', 'verify-hub-compartment-shell-v138.mjs',
  'verify-hub-destination-signage-v138.mjs', 'verify-hub-annex-fixtures-v138.mjs',
  'verify-hub-critical-furnishing-v138.mjs', 'qa-tantalus-level-v138.mjs',
  'verify-human-natural-gait-v139.mjs',
  'verify-hub-dropship-hangar-v139.mjs',
  'verify-hub-whole-room-projection-v139.mjs', 'verify-hub-workstation-details-v139.mjs',
  'verify-hub-annex-runtime-geometry-v139.mjs',
  'verify-player-climb-contacts-v139.mjs', 'verify-hub-support-planes-v139.mjs',
  'verify-hub-native-prop-placement-v139.mjs', 'verify-hub-annex-storage-v139.mjs',
  'verify-hub-support-contact-v139.mjs', 'verify-hub-furniture-atlases-v139.mjs', 'qa-tantalus-perspective-v139.mjs',
  'verify-weapon-presentation-profiles-v124.mjs', 'verify-weapon-effects-v124.mjs', 'verify-weapon-runtime-v124.mjs']);
const ROOT_IGNORES = new Set(['.git', 'dist', 'node_modules', '.vercel']);
// Development tools recovered from the published Forge branch stay in Git.
// They are never admitted in a built distribution, nor copied by the builder.
const FORGE_TOOLING_V140 = new Set([
  '.github', '.github/workflows', '.github/workflows/forge-regression.yml',
  'docs', 'docs/forge', 'docs/forge/QA-V130.md', 'docs/forge/README-V130.md',
  'docs/forge/V133-AUTHORING.md', 'docs/forge/V134-NAVIGATION.md',
  'docs/forge/V135-CONSTRUCTION.md', 'docs/forge/V136-CONTROLE-ET-VERSIONS.md',
  'scripts/fixtures', 'scripts/fixtures/forge-v130.html'
]);
const FORGE_STYLES_V140 = new Set([
  'src/forge-editor-v130.css', 'src/forge-workbench-v133.css',
  'src/forge-navigator-v134.css', 'src/forge-construction-v135.css', 'src/forge-control-v136.css'
]);
for (const file of [
  'forge-native-host-v136.mjs', 'editor-native-host-v140.mjs', 'forge-offline-harness-v130.py',
  'verify-forge-v130.mjs', 'verify-forge-v133.mjs', 'verify-forge-v134.mjs',
  'verify-forge-v135.mjs', 'verify-forge-v136.mjs', 'verify-forge-native-v136.mjs',
  'verify-forge-browser-v130.py', 'verify-forge-browser-v133.py', 'verify-forge-browser-v134.py',
  'verify-forge-browser-v135.py', 'verify-forge-browser-v136.py',
  'verify-forge-shell-v134.py', 'verify-forge-shell-v135.py', 'verify-forge-shell-v136.py',
  'verify-editor-modules-v140.mjs', 'verify-editor-ship-bounds-v140.mjs',
  'verify-enemy-patrol-v140.mjs', 'verify-npc-spacing-v140.mjs',
  'verify-player-wardrobe-parts-v140.mjs', 'verify-forge-native-v140.mjs',
  'verify-forge-release-v140.mjs', 'verify-forge-sandbox-v140.mjs',
  'qa-enemy-patrol-browser-v140.mjs', 'qa-wardrobe-parts-browser-v140.mjs',
  'verify-forge-journey-v141.mjs', 'verify-forge-admission-v141.mjs',
  'verify-forge-mission-v141.mjs', 'verify-forge-ship-v141.mjs', 'verify-forge-decoration-v141.mjs',
  'verify-enemy-distance-gait-v141.mjs', 'verify-hub-annex-npc-life-v141.mjs',
  'verify-player-colonial-art-v141.mjs', 'verify-forge-browser-journey-v141.py'
]) SCRIPT_FILES.add(file);
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
  if (!built && FORGE_TOOLING_V140.has(path)) return true;
  if (FORGE_STYLES_V140.has(path)) return true;
  const segments = path.split('/');
  if (segments.some(part => !part || part === '.' || part === '..' || PRIVATE_SEGMENT.test(part))) return false;
  const v123Admission = publicReleasePathAdmissionV123(path, { directory });
  if (v123Admission !== null) return v123Admission;
  const v122Admission = publicReleasePathAdmissionV122(path, { directory });
  if (v122Admission !== null) return v122Admission;
  const v121Admission = publicReleasePathAdmissionV121(path, { directory });
  if (v121Admission !== null) return v121Admission;
  const v120Admission = publicReleasePathAdmissionV120(path, { directory });
  if (v120Admission !== null) return v120Admission;
  const v119Admission = publicReleasePathAdmissionV119(path, { directory });
  if (v119Admission !== null) return v119Admission;
  // V141 adds one reviewed original torso atlas, not an open candidate folder.
  if (path === 'assets/openai/sprites/player/v141') return directory;
  if (path.startsWith('assets/openai/sprites/player/v141/')) return !directory
    && path === 'assets/openai/sprites/player/v141/hudson-torso-candidate-v141.png';
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
      if (ROOT_FILES.has(path) || path === 'src/vendor/supabase-LICENSE.txt' || /\.(?:js|mjs|json|css|html|md|webmanifest)$/i.test(path)) {
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
  await verifyPublicAdmissionsV119(root, { strict: true });
  await verifyPublicAdmissionsV120(root, { strict: true });
  await verifyPublicAdmissionsV121(root, { strict: true });
  await verifyPublicAdmissionsV122(root, { strict: true });
  await verifyPublicAdmissionsV123(root, { strict: true });
  return { ok: true, version: RELEASE.version, files, assets, privateDocuments: 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyPublicReleaseV86(), null, 2));
}
