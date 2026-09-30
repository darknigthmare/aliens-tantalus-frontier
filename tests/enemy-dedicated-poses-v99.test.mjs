import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ENEMIES } from '../src/content-core-v50.js';
import { ENEMY_DEDICATED_BATCH_V99 as BATCH } from '../src/enemy-dedicated-batch-v99.js';
import { ENEMY_DEDICATED_POSES_V99 as POSES, getEnemyDedicatedPoseV99,
  isEnemyDedicatedPoseReadyV99, drawEnemyDedicatedPoseV99 } from '../src/enemy-dedicated-poses-v99.js';
import { ENEMY_DEDICATED_POSES_V98 } from '../src/enemy-dedicated-poses-v98.js';
import { ENEMY_ENCYCLOPEDIA_CATALOG_V88 } from '../src/enemy-user-campaign-v88.js';
import { getCatalogEntryV62 } from '../src/catalog-runtime-v62.js';
import { getBioforgeRosterEntryV80, validateBioforgeSelectionV80,
  BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80 } from '../src/bioforge-session-v80.js';
import { getBioforgeProfileLabelV80 } from '../src/bioforge-ui-v80.js';
import { createUserCasteActorV87 } from '../src/enemy-user-pose-runtime-v87.js';
import { GameEngine as HistoricalGame } from '../src/game-runtime.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { auditPngBuffer } from '../docs/references/v91-enemy-only/audit-candidate-png.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = async path => JSON.parse(await readFile(join(root, path), 'utf8'));
const manifest = await readJson('docs/references/v99-batch-050/batch-050.json');
const admission = await readJson('docs/references/v99-batch-050/ADMISSION.json');
const newPoses = POSES.filter(pose => pose.batch === 'v99-050');
const heldJobs = manifest.jobs.filter(job => !BATCH.some(pose => pose.profileId === job.profileId));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const noop = () => {};
globalThis.addEventListener = noop;
globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1024; naturalHeight = 2048;
  set src(value) {
    this._src = value;
    const pose = POSES.find(candidate => candidate.path === value);
    if (pose) { this.naturalWidth = pose.sourceWidth; this.naturalHeight = pose.sourceHeight; }
  }
  get src() { return this._src; }
};
const { BioforgeRuntimeV80 } = await import('../src/bioforge-runtime-v80.js');
const imageFor = pose => ({ complete: true, naturalWidth: pose.sourceWidth,
  naturalHeight: pose.sourceHeight, src: pose.path });

function fixture(Engine = GameEngine) {
  const calls = [];
  const ctx = new Proxy({ globalAlpha: 1, drawImage: (...args) => calls.push(['image', ...args]),
    translate: (...args) => calls.push(['translate', ...args]), scale: (...args) => calls.push(['scale', ...args]),
    measureText: text => ({ width: String(text).length * 8 }) }, { get: (target, key) => target[key] ?? noop });
  const engine = new Engine({ width: 1280, height: 720, getContext: () => ctx,
    addEventListener: noop, focus: noop },
  { assets: {}, testMode: true, autoLoop: false, now: () => 1000, onEvent: noop, onPersist: noop });
  engine.random = () => .5;
  for (const pose of POSES) engine.images.set(pose.imageKey, imageFor(pose));
  return { engine, ctx, calls };
}

test('V99 resolves 50 job outcomes, admits only reviewed poses and retains all 86 V96/V97/V98 identities', async () => {
  assert.equal(manifest.jobs.length, 50);
  assert.equal(new Set(manifest.jobs.map(job => job.profileId)).size, 50);
  assert.equal(admission.attempted, 50);
  assert.equal(admission.accepted, BATCH.length);
  assert.equal(admission.held, heldJobs.length);
  assert.equal(BATCH.length + heldJobs.length, 50);
  assert.ok(BATCH.length > 0);
  assert.equal(newPoses.length, BATCH.length);
  assert.equal(POSES.length, BATCH.length + ENEMY_DEDICATED_POSES_V98.length);
  assert.equal(new Set(POSES.map(pose => pose.profileId)).size, POSES.length);
  assert.equal(new Set(BATCH.map(pose => pose.path)).size, BATCH.length);
  assert.equal(new Set(BATCH.map(pose => pose.sha256)).size, BATCH.length, 'each admitted asset has distinct native pixels');
  for (const previous of ENEMY_DEDICATED_POSES_V98)
    assert.equal(getEnemyDedicatedPoseV99(previous.profileId), previous);
  for (const job of manifest.jobs) {
    const receipt = await readJson(`docs/references/v99-batch-050/generation-${job.profileId}.json`);
    assert.equal(receipt.profileId, job.profileId);
    assert.equal(receipt.reference.sha256, job.referenceSha256);
    const pose = getEnemyDedicatedPoseV99(job.profileId);
    if (!pose) {
      assert.match(receipt.review.status, /held|reject/);
      continue; // A held or refused job does not require a PNG.
    }
    assert.match(receipt.review.status, /^accepted/);
    assert.equal(pose.id, pose.profileId);
    assert.equal(pose.path, `/${job.outputPath}`);
    assert.equal(ENEMIES.filter(enemy => enemy.id === pose.profileId).length, 1);
    assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.filter(enemy => enemy.id === pose.profileId).length, 1);
    assert.equal(getEnemyDedicatedPoseV99({ id: `${pose.profileId}:6` }), pose);
    assert.equal(getEnemyDedicatedPoseV99({ profileId: pose.profileId, id: 'lab-specimen-1' }), pose);
    assert.equal(createUserCasteActorV87({ profileId: pose.profileId }, 600), null);
    assert.equal(pose.canonExact, false);
    assert.equal(pose.identityVerified, false);
    assert.equal(pose.provenance, 'systemic-variant');
    assert.equal(pose.animationStatus, 'missing');
    assert.equal(pose.frames, 1);
  }
  assert.equal(getEnemyDedicatedPoseV99('enemy-041-working-joe'), null);
  assert.equal(getEnemyDedicatedPoseV99(`${BATCH[0].profileId}-extra`), null);
  assert.equal(getEnemyDedicatedPoseV99({ name: BATCH[0].name }), null);
});

test('V99 PNGs match admission SHA, native dimensions, transparency, bounds and reviewed support pivots', async () => {
  for (const pose of newPoses) {
    const bytes = await readFile(join(root, pose.path));
    const receipt = await readJson(`docs/references/v99-batch-050/generation-${pose.profileId}.json`);
    const audit = auditPngBuffer(bytes);
    assert.equal(hash(bytes), pose.sha256);
    assert.equal(receipt.output.sha256, pose.sha256);
    assert.equal(audit.width, pose.sourceWidth); assert.equal(audit.height, pose.sourceHeight);
    assert.deepEqual(audit.bboxAlphaAtLeast16, pose.alphaBounds);
    assert.equal(audit.alphaMin, 0);
    assert.ok(audit.alpha0 / audit.totalPixels > .2);
    assert.ok(audit.alphaAtLeast16 > 0);
    const [left, top, right, bottom] = pose.alphaBounds;
    assert.ok(left > 0 && top > 0 && right < pose.sourceWidth && bottom < pose.sourceHeight);
    assert.deepEqual(pose.pivot, receipt.runtimeContract.pivot);
    assert.equal(pose.sourceFacing, 1);
    assert.ok(pose.pivot.x * pose.sourceWidth >= left && pose.pivot.x * pose.sourceWidth <= right);
    assert.ok(pose.pivot.y * pose.sourceHeight >= top && pose.pivot.y * pose.sourceHeight <= bottom + 1);
    assert.ok(Math.abs(pose.renderWidth / pose.renderHeight - pose.sourceWidth / pose.sourceHeight) < 1e-12);
    assert.ok(Math.abs(pose.renderHeight * (bottom - top) / pose.sourceHeight - pose.targetOpaqueHeight) < 1e-9);
  }
});

test('historical source records, combat statistics, collision dimensions and actor placement remain unchanged', () => {
  assert.equal(ENEMIES.length, 571);
  // Baseline captured before V99 admission: complete records include behavior, modifiers,
  // stats, frequency, habitats and encounter placement, not just their visible names.
  const sources = manifest.jobs.map(job => ENEMIES.find(enemy => enemy.id === job.profileId));
  assert.equal(hash(JSON.stringify(sources)), manifest.historicalProfilesSha256);
  const { engine } = fixture();
  for (const pose of newPoses) {
    const source = ENEMIES.find(enemy => enemy.id === pose.profileId);
    const snapshot = JSON.stringify(source);
    const expected = HistoricalGame.prototype.createEnemy.call({ random: () => .5 }, source, 0, 200, 600);
    const actor = engine.createEnemy(source, 0, 200, 600);
    for (const key of ['id', 'x', 'y', 'w', 'h', 'health', 'maxHealth', 'armor', 'damage',
      'speed', 'behavior', 'spriteKey', 'biology', 'modifier', 'caste'])
      assert.equal(actor[key], expected[key], `${pose.profileId}.${key}`);
    assert.equal(JSON.stringify(source), snapshot);
  }
});

test('catalog uses one native static frame for every admitted profile including Ceto', () => {
  for (const pose of POSES) {
    const record = getCatalogEntryV62(pose.profileId);
    assert.equal(record.visual.path, pose.path);
    assert.equal(record.visual.visualMode, 'static-pose');
    assert.equal(record.visual.historicalBehaviorPreserved, true);
    assert.equal(record.visual.sheetId, null);
    assert.deepEqual(record.visual.previewClips, []);
    assert.equal(record.visual.grid.columns, 1); assert.equal(record.visual.grid.rows, 1);
    assert.equal(record.visual.identity.canonExact, false);
    assert.equal(record.visual.animationStatus, 'missing');
  }
});

test('whole-image rendering uses five arguments, preserves proportions and handles both facings without fake death frames', () => {
  for (const pose of POSES) {
    const { ctx, calls } = fixture();
    const actor = { profileId: pose.profileId, x: 30, y: 70, w: 42, h: 88, alive: true, facing: 1 };
    for (const facing of [1, -1]) {
      calls.length = 0; actor.facing = facing;
      assert.equal(drawEnemyDedicatedPoseV99(ctx, actor, imageFor(pose)), true);
      assert.deepEqual(calls.find(call => call[0] === 'translate'), ['translate', 51, 158]);
      assert.deepEqual(calls.find(call => call[0] === 'scale'), ['scale', facing, 1]);
      const draw = calls.find(call => call[0] === 'image');
      assert.equal(draw.length, 6, 'five-argument drawImage must draw the complete untouched PNG');
      assert.equal(draw[2], -pose.pivot.x * pose.renderWidth);
      assert.equal(draw[3], -pose.pivot.y * pose.renderHeight);
      assert.ok(Math.abs(draw[4] / draw[5] - pose.sourceWidth / pose.sourceHeight) < 1e-12);
    }
    calls.length = 0;
    assert.equal(drawEnemyDedicatedPoseV99(ctx, { ...actor, alive: false }, imageFor(pose)), false);
    assert.equal(drawEnemyDedicatedPoseV99(ctx, actor, { ...imageFor(pose), naturalWidth: 1 }), false);
    assert.equal(drawEnemyDedicatedPoseV99(ctx, actor, { ...imageFor(pose), complete: false }), false);
    assert.equal(isEnemyDedicatedPoseReadyV99(null, pose), false);
    assert.equal(calls.length, 0);
  }
});

test('production campaign renderer and LRU select the dedicated native image without mutating historical actors', () => {
  const { engine, ctx, calls } = fixture();
  for (const pose of POSES) {
    const actor = engine.createEnemy(ENEMIES.find(enemy => enemy.id === pose.profileId), 0, 200, 600);
    const before = structuredClone(actor);
    assert.ok(engine.getVisibleEnemyAtlasSheetsV65([actor]).some(sheet => sheet.imageKey === pose.imageKey));
    calls.length = 0; engine.drawEnemy(ctx, actor);
    const draw = calls.find(call => call[0] === 'image');
    assert.ok(draw, pose.profileId); assert.equal(draw[1].src, pose.path); assert.equal(draw.length, 6);
    assert.deepEqual(actor, before, 'rendering must not alter combat state');
  }
});

test('campaign waits when a native pose is absent, incomplete or malformed', () => {
  const { engine } = fixture();
  const pose = newPoses[0];
  engine.enemies = [engine.createEnemy(ENEMIES.find(enemy => enemy.id === pose.profileId), 0, 200, 600)];
  engine.camera = null;
  engine.enemyAtlasLRUV65 = { setWorkingSet: noop, recordStatus: () => ({ status: 'ready' }) };
  engine.images.delete(pose.imageKey); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, true);
  engine.images.set(pose.imageKey, { ...imageFor(pose), naturalHeight: 1 }); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, true);
  engine.images.set(pose.imageKey, imageFor(pose)); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, false);
});

test('Bioforge admits eligible static variants with historical actor behavior and guards incomplete printing', () => {
  assert.equal(new Set(BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80).size, BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80.length);
  for (const pose of newPoses.filter(candidate => candidate.bioforgeEligible !== false)) {
    const { engine, ctx, calls } = fixture(BioforgeRuntimeV80);
    engine.start({ configuration: { profileId: pose.profileId, quantity: 1 }, autoLoop: false, testMode: true, assets: {} });
    const profile = getBioforgeRosterEntryV80(pose.profileId);
    assert.equal(profile.path, pose.path); assert.equal(profile.dedicatedHistoricalPoseV96, true);
    assert.equal(getBioforgeProfileLabelV80(pose.profileId), `${pose.name} — variante systémique · pose fixe`);
    assert.equal(profile.animationStatus, 'missing'); assert.equal(profile.cost, pose.cost);
    const maximum = Math.min(12, Math.floor(12 / profile.cost));
    assert.equal(validateBioforgeSelectionV80({ profileId: pose.profileId, quantity: maximum }).ok, true);
    assert.equal(validateBioforgeSelectionV80({ profileId: pose.profileId, quantity: maximum + 1 }).ok, false);
    const source = ENEMIES.find(enemy => enemy.id === pose.profileId);
    const original = engine.createEnemy(source, 0, 0, engine.bioforgeLevelV80.world.floorY, { boss: false, keyCarrier: false });
    const actor = engine.createBioforgeActorV87({ id: 'lab-1', profileId: pose.profileId, index: 0 });
    for (const key of ['w', 'h', 'damage', 'armor', 'maxHealth', 'speed', 'behavior', 'spriteKey', 'biology'])
      assert.equal(actor[key], original[key], `${pose.profileId}.${key}`);
    engine.enemies = [actor]; calls.length = 0; engine.drawEnemy(ctx, actor);
    assert.equal(calls.find(call => call[0] === 'image')?.[1]?.src, pose.path);
    assert.ok(engine.getVisibleEnemyAtlasSheetsV65().some(sheet => sheet.imageKey === pose.imageKey));
    engine.bioforgeRootV80.activeSession = { phase: 'printing', queue: [{ status: 'queued', profileId: pose.profileId }] };
    engine.enemies = []; engine.images.delete(pose.imageKey); engine.ensureEnemyAtlas = noop;
    assert.ok(engine.getVisibleEnemyAtlasSheetsV65().some(sheet => sheet.imageKey === pose.imageKey));
    assert.equal(engine.advanceBioforgePhaseV80().applied, false);
    assert.equal(engine.enemies.length, 0, 'printing cannot spawn invisible actors');
  }
});

test('Acid-Blooded Ceto remains available to the campaign and catalog without a new Bioforge habitat', () => {
  const id = 'enemy-207-acid-blooded-ceto-reef-predator';
  const pose = getEnemyDedicatedPoseV99(id);
  assert.ok(pose, 'the admitted Ceto pose must remain available outside Bioforge');
  assert.equal(pose.bioforgeEligible, false); assert.equal(pose.locomotion, 'aquatic');
  assert.equal(getCatalogEntryV62(id).visual.path, pose.path);
  assert.equal(BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80.includes(id), false);
  assert.equal(getBioforgeRosterEntryV80(id), null);
  assert.equal(validateBioforgeSelectionV80({ profileId: id, quantity: 1 }).ok, false);
});

test('production build includes only exact admitted V99 PNGs and keeps held outputs and receipts private', () => {
  const filter = createBuildAssetFilter(root);
  for (const pose of newPoses) assert.equal(filter(join(root, pose.path)), true);
  for (const job of heldJobs) {
    assert.equal(filter(join(root, job.outputPath)), false);
    assert.equal(getEnemyDedicatedPoseV99(job.profileId), null);
  }
  assert.equal(filter(join(root, 'src/enemy-dedicated-poses-v99.js')), true);
  assert.equal(filter(join(root, 'src/enemy-dedicated-batch-v99.js')), true);
  for (const path of ['assets/openai/sprites/static-enemy-v99/unknown.png',
    `assets/openai/sprites/static-enemy-v99/candidates/${BATCH[0].profileId}.png`,
    'docs/references/v99-batch-050', 'docs/references/v99-batch-050/ADMISSION.json',
    `docs/references/v99-batch-050/generation-${BATCH[0].profileId}.json`])
    assert.equal(filter(join(root, path)), false, path);
});

test('V99 service worker and every live native-pose consumer use the complete admission union', async () => {
  const source = path => readFile(join(root, path), 'utf8');
  const worker = await source('sw.js');
  assert.match(worker, /atf-v86-reference-library-v100-shell-2/);
  for (const version of [96, 97, 98, 99]) {
    assert.ok(worker.includes(`'/src/enemy-dedicated-poses-v${version}.js'`));
    if (version > 96) assert.ok(worker.includes(`'/src/enemy-dedicated-batch-v${version}.js'`));
  }
  for (const path of ['src/bioforge-level-v80.js', 'src/bioforge-runtime-v80.js',
    'src/bioforge-session-v80.js', 'src/catalog-runtime-v62.js', 'src/game-v51-runtime.js',
    'src/game-v52-runtime.js', 'src/xeno-trials-data-v96.js']) {
    assert.match(await source(path), /from '\.\/enemy-dedicated-poses-v99\.js'/, path);
  }
  // Large native PNGs remain on demand rather than turning installation into a bulk download.
  for (const pose of newPoses) assert.ok(!worker.includes(`'${pose.path}'`));
});
