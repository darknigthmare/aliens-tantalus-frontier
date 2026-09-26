import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ENEMIES } from '../src/content-core-v50.js';
import { ENEMY_DEDICATED_POSES_V96 as POSES, getEnemyDedicatedPoseV96,
  isEnemyDedicatedPoseReadyV96, drawEnemyDedicatedPoseV96 } from '../src/enemy-dedicated-poses-v96.js';
import { ENEMY_STATIC_POSES_V95 } from '../src/enemy-static-poses-v95.js';
import { ENEMY_ENCYCLOPEDIA_CATALOG_V88 } from '../src/enemy-user-campaign-v88.js';
import { getCatalogEntryV62 } from '../src/catalog-runtime-v62.js';
import { getBioforgeRosterEntryV80, validateBioforgeSelectionV80 } from '../src/bioforge-session-v80.js';
import { getBioforgeProfileLabelV80 } from '../src/bioforge-ui-v80.js';
import { createUserCasteActorV87 } from '../src/enemy-user-pose-runtime-v87.js';
import { GameEngine as BaseGame } from '../src/game-v51-runtime.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { auditPngBuffer } from '../docs/references/v91-enemy-only/audit-candidate-png.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const noop = () => {};
globalThis.addEventListener = noop;
globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1024; naturalHeight = 2048;
  set src(value) {
    this._src = value;
    const d = POSES.find(pose => pose.path === value);
    if (d) { this.naturalWidth = d.sourceWidth; this.naturalHeight = d.sourceHeight; }
  }
  get src() { return this._src; }
};
const { BioforgeRuntimeV80 } = await import('../src/bioforge-runtime-v80.js');
const imageFor = d => ({ complete: true, naturalWidth: d.sourceWidth, naturalHeight: d.sourceHeight, src: d.path });
function fixture(Engine = GameEngine) {
  const calls = [];
  const ctx = new Proxy({ globalAlpha: 1, drawImage: (...args) => calls.push(['image', ...args]),
    translate: (...args) => calls.push(['translate', ...args]), scale: (...args) => calls.push(['scale', ...args]),
    measureText: s => ({ width: String(s).length * 8 }) }, { get: (target, key) => target[key] ?? noop });
  const engine = new Engine({ width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop },
    { assets: {}, testMode: true, autoLoop: false, now: () => 1000, onEvent: noop, onPersist: noop });
  engine.random = () => .5;
  for (const d of POSES) engine.images.set(d.imageKey, imageFor(d));
  return { engine, ctx, calls };
}

test('V96 replaces exactly three historical identities without adding duplicate entries', () => {
  assert.equal(ENEMIES.length, 571);
  assert.equal(POSES.length, 3);
  for (const d of POSES) {
    assert.equal(ENEMIES.filter(e => e.id === d.profileId).length, 1);
    assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.filter(e => e.id === d.profileId).length, 1);
    assert.equal(ENEMY_STATIC_POSES_V95.some(e => e.id === d.profileId), false);
    assert.equal(getEnemyDedicatedPoseV96({ id: `${d.profileId}:6` }), d);
    assert.equal(getEnemyDedicatedPoseV96({ profileId: d.profileId, id: 'lab-specimen-1' }), d);
    assert.equal(createUserCasteActorV87({ profileId: d.profileId }, 600), null);
    assert.equal(d.canonExact, false);
    assert.equal(d.provenance, 'systemic-variant');
    assert.equal(d.animationStatus, 'missing');
    assert.equal(d.frames, 1);
  }
  assert.equal(getEnemyDedicatedPoseV96('enemy-041-working-joe'), null);
  assert.equal(getEnemyDedicatedPoseV96('enemy-146-armored-combat-synthetic-extra'), null);
  assert.equal(getEnemyDedicatedPoseV96({ name: 'Armored Working Joe' }), null);
});

test('V96 PNGs preserve native bytes, real alpha and exact receipts', async () => {
  for (const d of POSES) {
    const bytes = await readFile(join(root, d.path));
    const receipt = JSON.parse(await readFile(join(root, `docs/references/v96-xeno-trials/generation-${d.profileId}.json`), 'utf8'));
    const a = auditPngBuffer(bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), d.sha256);
    assert.equal(a.width, d.sourceWidth); assert.equal(a.height, d.sourceHeight);
    assert.deepEqual(a.bboxAlphaAtLeast16, d.alphaBounds);
    assert.equal(a.alphaMin, 0); assert.ok(a.alpha0 / a.totalPixels > .25); assert.ok(a.alphaAtLeast16 > 0);
    assert.equal(receipt.output.sha256, d.sha256);
    assert.equal(receipt.runtimeContract.animation, false);
    assert.ok(Math.abs(d.renderWidth / d.renderHeight - d.sourceWidth / d.sourceHeight) < 1e-12);
    assert.equal(d.pivot.y, d.alphaBounds[3] / d.sourceHeight);
  }
});

test('historical combat statistics, colliders, behavior, source placement and modifiers are unchanged', () => {
  const expected = [
    { health: 98, armor: 26, damage: 30, speed: 101.55000000000001, behavior: 'bruiser', spriteKey: 'workingJoe' },
    { health: 66, armor: 16, damage: 23, speed: 107.5, behavior: 'bruiser', spriteKey: 'legacy' },
    { health: 98, armor: 26, damage: 30, speed: 113.44999999999999, behavior: 'shooter', spriteKey: 'weylandYutaniCommandoV56' }
  ];
  POSES.forEach((d, index) => {
    const source = ENEMIES.find(e => e.id === d.profileId);
    const snapshot = JSON.stringify(source);
    const actor = BaseGame.prototype.createEnemy.call({ random: () => .5 }, source, 0, 200, 600);
    for (const [key, value] of Object.entries(expected[index])) assert.equal(actor[key], value, `${d.id}.${key}`);
    assert.equal(actor.w, 42); assert.equal(actor.h, 88); assert.equal(actor.x, 200); assert.equal(actor.y, 512);
    assert.equal(actor.id, `${d.profileId}:0`); assert.equal(actor.maxHealth, actor.health);
    assert.equal(source.modifier, 'Armored'); assert.equal(source.provenance, 'systemic-variant');
    assert.equal(JSON.stringify(source), snapshot);
  });
});

test('bestiaire uses a single native frame, not a family atlas or fake animated preview', () => {
  for (const d of POSES) {
    const record = getCatalogEntryV62(d.profileId);
    assert.equal(record.visual.path, d.path);
    assert.equal(record.visual.visualMode, 'static-pose');
    assert.equal(record.visual.historicalBehaviorPreserved, true);
    assert.equal(record.visual.sheetId, null);
    assert.deepEqual(record.visual.previewClips, []);
    assert.equal(record.visual.grid.columns, 1); assert.equal(record.visual.grid.rows, 1);
    assert.equal(record.visual.identity.canonExact, false);
    assert.equal(record.visual.animationStatus, 'missing');
  }
});

test('whole-image draw preserves proportions, sole pivot and left/right facing; no invented corpse', () => {
  for (const d of POSES) {
    const { ctx, calls } = fixture();
    const actor = { profileId: d.profileId, x: 30, y: 70, w: 42, h: 88, alive: true, facing: 1 };
    for (const facing of [1, -1]) {
      calls.length = 0; actor.facing = facing;
      assert.equal(drawEnemyDedicatedPoseV96(ctx, actor, imageFor(d)), true);
      assert.deepEqual(calls.find(c => c[0] === 'translate'), ['translate', 51, 158]);
      assert.deepEqual(calls.find(c => c[0] === 'scale'), ['scale', facing, 1]);
      const draw = calls.find(c => c[0] === 'image');
      assert.equal(draw.length, 6, 'five-argument drawImage draws the complete untouched PNG');
      assert.equal(draw[4] / draw[5], d.sourceWidth / d.sourceHeight);
    }
    calls.length = 0;
    assert.equal(drawEnemyDedicatedPoseV96(ctx, { ...actor, alive: false }, imageFor(d)), false);
    assert.equal(drawEnemyDedicatedPoseV96(ctx, actor, { ...imageFor(d), naturalWidth: 1 }), false);
    assert.equal(isEnemyDedicatedPoseReadyV96(null, d), false);
    assert.equal(calls.length, 0);
  }
});

test('real production campaign renderer and LRU select dedicated art on untouched legacy actors', () => {
  const { engine, ctx, calls } = fixture();
  const actors = POSES.map(d => engine.createEnemy(ENEMIES.find(e => e.id === d.profileId), 0, 200, 600));
  const before = structuredClone(actors);
  assert.deepEqual(engine.getVisibleEnemyAtlasSheetsV65(actors).map(s => s.imageKey), POSES.map(d => d.imageKey));
  actors.forEach((actor, index) => {
    calls.length = 0;
    engine.drawEnemy(ctx, actor);
    const draw = calls.find(c => c[0] === 'image');
    assert.ok(draw); assert.equal(draw[1].src, POSES[index].path); assert.equal(draw.length, 6);
    assert.deepEqual(actor, before[index], 'rendering must not change combat state');
  });
});

test('campaign never resumes invisible combat when a native pose is absent or malformed', () => {
  const { engine } = fixture();
  const d = POSES[0];
  engine.enemies = [engine.createEnemy(ENEMIES.find(e => e.id === d.profileId), 0, 200, 600)];
  engine.camera = null;
  engine.enemyAtlasLRUV65 = { setWorkingSet: noop, recordStatus: () => ({ status: 'ready' }) };
  engine.images.delete(d.imageKey); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, true);
  engine.images.set(d.imageKey, { ...imageFor(d), naturalHeight: 1 }); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, true);
  engine.images.set(d.imageKey, imageFor(d)); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, false);
});

test('Bioforge admits native static previews and keeps historical actor creation/AI', () => {
  for (const d of POSES) {
    const { engine, ctx, calls } = fixture(BioforgeRuntimeV80);
    engine.start({ configuration: { profileId: d.profileId, quantity: 1 }, autoLoop: false, testMode: true, assets: {} });
    const profile = getBioforgeRosterEntryV80(d.profileId);
    assert.equal(profile.path, d.path); assert.equal(profile.dedicatedHistoricalPoseV96, true);
    assert.equal(getBioforgeProfileLabelV80(d.profileId), `${d.name} — variante systémique blindée`);
    assert.equal(profile.cost, 3); assert.equal(profile.animationStatus, 'missing');
    assert.equal(validateBioforgeSelectionV80({ profileId: d.profileId, quantity: 4 }).ok, true);
    assert.equal(validateBioforgeSelectionV80({ profileId: d.profileId, quantity: 5 }).ok, false);
    const source = ENEMIES.find(e => e.id === d.profileId);
    const original = engine.createEnemy(source, 0, 0, engine.bioforgeLevelV80.world.floorY, { boss: false, keyCarrier: false });
    const actor = engine.createBioforgeActorV87({ id: 'lab-1', profileId: d.profileId, index: 0 });
    for (const key of ['w', 'h', 'damage', 'armor', 'maxHealth', 'speed', 'behavior', 'spriteKey', 'biology'])
      assert.equal(actor[key], original[key], `${d.profileId}.${key}`);
    engine.enemies = [actor]; calls.length = 0; engine.drawEnemy(ctx, actor);
    assert.equal(calls.find(c => c[0] === 'image')?.[1]?.src, d.path);
    assert.ok(engine.getVisibleEnemyAtlasSheetsV65().some(s => s.imageKey === d.imageKey));
    engine.bioforgeRootV80.activeSession = { phase: 'printing', queue: [{ status: 'queued', profileId: d.profileId }] };
    engine.enemies = []; engine.images.delete(d.imageKey); engine.ensureEnemyAtlas = noop;
    assert.ok(engine.getVisibleEnemyAtlasSheetsV65().some(s => s.imageKey === d.imageKey));
    assert.equal(engine.advanceBioforgePhaseV80().applied, false);
    assert.equal(engine.enemies.length, 0, 'printing cannot create an invisible enemy');
  }
});

test('V96 build filter admits exact reviewed PNGs, but excludes candidates and private receipts', () => {
  const filter = createBuildAssetFilter(root);
  for (const d of POSES) assert.equal(filter(join(root, d.path)), true);
  assert.equal(filter(join(root, 'src/enemy-dedicated-poses-v96.js')), true);
  for (const path of ['assets/openai/sprites/static-enemy-v96/unknown.png',
    'assets/openai/sprites/static-enemy-v96/candidates/armored-working-joe.png',
    'docs/references/v96-xeno-trials', 'docs/references/v96-xeno-trials/generation-enemy-145-armored-working-joe.json'])
    assert.equal(filter(join(root, path)), false, path);
});
