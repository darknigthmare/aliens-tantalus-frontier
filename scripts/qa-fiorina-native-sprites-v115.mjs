import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, WEAPONS, ENEMIES } from '../src/content.js';
import { buildFiorinaMissionV114 } from '../src/fiorina-campaign-v114.js';
import { stationV105 } from '../src/alien3-encounter-v105.js';
import { hostV136 } from './forge-native-host-v136.mjs';

// Real native production render methods and delivered PNGs on a Skia canvas.
// DOM/RAF/historical image host are explicit doubles; poses/phases below are
// declared fixtures, not a complete browser journey or film-likeness proof.
const root = fileURLToPath(new URL('../', import.meta.url));
const assetDirectory = resolve(root, 'assets/openai/sprites/alien3-fiorina-v115');
const output = resolve(process.argv[2] || '/tmp/fiorina-native-sprites-v115-qa');
const require = createRequire(import.meta.url);
const { createCanvas, Image } = require(process.env.CANVAS_MODULE || '@napi-rs/canvas');
const preloadAll = process.env.FIORINA_QA_PRELOAD_ALL === '1';
const manifestBytes = await readFile(resolve(assetDirectory, 'manifest.json'));
const manifest = JSON.parse(manifestBytes.toString('utf8'));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sourceDigests = Object.fromEntries(await Promise.all([
  'src/alien3-sprites-v115.js', 'src/alien3-production-v115.js'
].map(async (path) => [path, sha256(await readFile(resolve(root, path)))])));
class DeliveredImage extends Image {
  set src(value) {
    const url = new URL(value);
    assert.equal(url.protocol, 'file:');
    const path = fileURLToPath(url);
    assert.ok(relative(assetDirectory, path).match(/^[a-z0-9-]+\.(png|webp)$/));
    super.src = path;
  }
  get src() { return super.src; }
}
const browser = hostV136();
const engine = new GameEngine(browser.canvas, { onEvent() {} });
const campaign = CAMPAIGNS.find((c) => c.id === 'special-alien3-fiorina-161');
const world = WORLDS.find((w) => w.id === campaign.worldId) || WORLDS[0];
const missionLevel = buildFiorinaMissionV114({ campaign, world, levelSeeds: LEVEL_SEEDS, seed: 114 });
const options = { campaign, world, missionLevel, levelSeed: missionLevel.levelSeed, weapon: WEAPONS[0],
  enemyCatalog: ENEMIES, equipment: [], crew: [], seed: 114, accessibility: { reducedMotion: false } };
const report = { schemaVersion: 1, scope: 'Native GameEngine component rendering with actual delivered PNGs on Canvas/Skia; explicit DOM/RAF/image host doubles. Not a browser journey.',
  fixtures: ['native campaign seed114', 'injected narrative phase/pose/clock for render sampling',
    'reduced motion disabled in the fixture to inspect both delivered poses',
    'existing cast positions', 'native traque encounter for player poses',
    'native rabattage encounter for Dillon/Morse walking poses', 'company arrival visibility fixture'],
  provenance: { manifestSha256: sha256(manifestBytes), sourceDigests },
  preloadAll, checks: [], samples: [], catalogueOnly: [], sourcePixelsModified: false,
  loads: [], previews: [] };
const checks = (name, fn) => {
  try { fn(); report.checks.push({ name, passed: true }); }
  catch (error) { report.checks.push({ name, passed: false, error: error.message }); }
};
const matrix = (ctx) => { const m = ctx.getTransform(); return ['a','b','c','d','e','f'].map((key) => m[key]); };
const drawnIds = new Set();
const samples = [];
const hasAsset = (id) => Object.hasOwn(manifest.assets, id);
const physicalSnapshot = () => JSON.stringify([engine.player, engine.alien3RunnerV88,
  ...(engine.alien3EncounterV105?.participants || [])].map((actor) => actor && Object.fromEntries(
  ['id','x','y','w','h','vx','vy','moving','grounded','climbing','crouching','alive','depth','facing','nav']
    .map((key) => [key, actor[key]]))));
// The active Fiorina renderer reads the V104 owner clock, not the host animation clock.
const setFixtureArtTime = (time) => {
  engine.alien3V104.clock = time;
  assert.equal(engine.alien3ArtTimeV102(), time, 'Native art clock must expose the injected fixture time');
};
let sheetNumber = 0;

async function flushSamples() {
  if (!samples.length) return;
  const group = samples.splice(0), sheet = createCanvas(1200, 1200), ctx = sheet.getContext('2d');
  ctx.fillStyle = '#161d21'; ctx.fillRect(0, 0, 1200, 1200);
  for (const [i, item] of group.entries()) {
    const x = (i % 2) * 600, y = Math.floor(i / 2) * 400;
    ctx.fillStyle = '#e5ded0'; ctx.fillRect(x + 8, y + 8, 584, 384);
    ctx.drawImage(item.canvas, x, y + 30);
    ctx.fillStyle = '#23313a'; ctx.font = 'bold 17px sans-serif'; ctx.fillText(item.id, x + 18, y + 26);
    ctx.strokeStyle = '#b16b57'; ctx.beginPath(); ctx.moveTo(x + 15, y + 340); ctx.lineTo(x + 585, y + 340); ctx.stroke();
    // Release decoded sample surfaces after their pixels have been composited.
    item.canvas.width = 1; item.canvas.height = 1;
  }
  const filename = 'native-components-' + (++sheetNumber) + '.png';
  await writeFile(resolve(output, filename), sheet.toBuffer('image/png'));
  report.previews.push(filename);
  sheet.width = 1; sheet.height = 1;
}

async function preloadFixture(ids, fixture) {
  const unique = [...new Set(ids)];
  for (const id of unique) assert.ok(hasAsset(id), 'Required fixture asset absent from manifest: ' + id);
  await bank.preload(unique);
  for (const id of unique) assert.equal(bank.status(id).state, 'ready', id + ': ' + bank.status(id).reason);
  assert.deepEqual(bank.report().errors, [], 'Requested PNGs must decode without fallback');
  report.loads.push({ fixture, requested: unique, ...bank.report() });
}

async function sample(id, renderer, { focus, fixture, expected = null, expectedFrame = null,
  preload = [], forbidden = [], absent = false, scale = 2.3 } = {}) {
  await preloadFixture([...(expected ? [expected] : []), ...preload], id);
  const canvas = createCanvas(600, 360), ctx = canvas.getContext('2d');
  const rawDraw = ctx.drawImage.bind(ctx), images = [];
  ctx.drawImage = (...args) => { images.push(args[0]); return rawDraw(...args); };
  // Keep the real visibility gate active even in the isolated component fixture.
  engine.camera.x = Math.max(0, focus.x - 640);
  engine.camera.y = Math.max(0, focus.y - 360);
  engine.alien3SpriteReceiptsV115.clear();
  const before = JSON.stringify(engine.captureResumeState());
  const physicalBefore = physicalSnapshot();
  const operationBefore = JSON.stringify(engine.alien3OperationsV107);
  ctx.translate(300 - focus.x * scale, 310 - focus.y * scale);
  ctx.scale(scale, scale);
  const transform = matrix(ctx);
  renderer(ctx);
  const receipts = engine.getAlien3SpriteReportV115().receipts;
  checks(id + ': context restored', () => assert.deepEqual(matrix(ctx), transform));
  checks(id + ': saved actor/state unchanged by draw', () => assert.equal(JSON.stringify(engine.captureResumeState()), before));
  checks(id + ': actor physics unchanged by draw', () => assert.equal(physicalSnapshot(), physicalBefore));
  checks(id + ': operation owner unchanged by draw', () => assert.equal(JSON.stringify(engine.alien3OperationsV107), operationBefore));
  if (expected) checks(id + ': native sprite hook', () => {
    const receipt = Object.values(receipts).find((r) => r.drawn && r.id === expected);
    assert.ok(receipt, JSON.stringify(receipts));
    const row = bank.get(expected);
    assert.ok(row, 'Expected decoded asset remains resident');
    assert.ok(images.includes(row.frameImages[receipt.frameIndex]));
    if (expectedFrame !== null) assert.equal(receipt.frameIndex, expectedFrame, 'Expected animation frame');
  });
  if (absent) checks(id + ': dormant sprite remains hidden', () => assert.equal(images.length, 0));
  for (const sprite of forbidden) checks(id + ': guarded sprite stays hidden: ' + sprite, () => {
    assert.equal(Object.values(receipts).some(receipt => receipt.drawn && receipt.id === sprite), false);
    const row = bank.get(sprite);
    if (row) assert.equal(row.frameImages.some(image => images.includes(image)), false);
  });
  for (const receipt of Object.values(receipts)) if (receipt.drawn) drawnIds.add(receipt.id);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  samples.push({ id, canvas, fixture });
  report.samples.push({ id, fixture, imageDraws: images.length, expectedFrame, receipts });
  images.length = 0; // Recording must not retain evicted decoded source images.
  if (samples.length >= 6) await flushSamples();
}

let bank;
try {
  await mkdir(output, { recursive: true });
  engine.start(options);
  engine.reducedMotion = false;
  assert.equal(engine.accessibilityRuntime?.reducedMotion, false, 'Native start must honor the motion-enabled fixture');
  engine.alien3V104.settings.reducedMotion = false;
  bank = engine.registerAlien3SpriteManifestV115(manifest, { imageFactory: () => new DeliveredImage(),
    preloadAll, maxCachedImages: 6, maxDecodedBytes: 48 * 1024 * 1024 });
  await bank.ready;
  assert.deepEqual(bank.report().errors, [], 'Manifest and initial requested PNGs must load');
  report.assetLoadAtStart = bank.report();
  Object.assign(engine.player, { moving: false, vx: 0, vy: 0, grounded: true, climbing: false, crouching: false,
    v52HurtClock: 0, shockClock: 0, interactionClock: 0 });
  const playerFocus = () => ({ x: engine.player.x + engine.player.w / 2, y: engine.player.y + engine.player.h });
  for (const [phase, id] of [['wreckage','ripley-crash-idle'],['infirmary','ripley-prison-idle']]) {
    assert.ok(hasAsset(id), 'Required native player asset: ' + id);
    engine.alien3V88.phase = phase;
    await sample(id, (ctx) => engine.drawActor(ctx, engine.player), { focus: playerFocus(), expected: id,
      fixture: 'Native player draw; phase=' + phase + '; grounded idle.' });
  }
  engine.alien3V88.phase = 'wreckage';
  for (const [pose, speed] of [['walk', 120], ['run', 270]]) {
    const sprite = 'ripley-crash-' + pose;
    if (!hasAsset(sprite)) continue;
    assert.equal(manifest.assets[sprite].frames?.length, 2, sprite + ': two delivered poses');
    Object.assign(engine.player, { moving: true, vx: speed, vy: 0, grounded: true });
    for (const frame of [0, 1]) {
      setFixtureArtTime((frame + .1) / manifest.assets[sprite].fps);
      await sample(sprite + '-frame-' + frame, ctx => engine.drawActor(ctx, engine.player), {
        focus: playerFocus(), expected: sprite, expectedFrame: frame,
        fixture: 'Native wreckage costume selection; injected grounded movement and render clock, no narrative progression.'
      });
    }
  }
  for (const [pose, changes] of [
    ['crouch', { crouching: true }],
    ['crouch-walk', { moving: true, vx: 90, crouching: true }],
    ['jump', { grounded: false, vy: 0 }],
    ['climb', { grounded: false, climbing: true }]
  ]) {
    const sprite = 'ripley-crash-' + pose;
    if (!hasAsset(sprite)) continue;
    Object.assign(engine.player, { moving: false, vx: 0, vy: 0, grounded: true,
      climbing: false, crouching: false, v52HurtClock: 0, shockClock: 0,
      interactionClock: 0 }, changes);
    const frameCount = ['crouch-walk', 'climb'].includes(pose) ? 2 : 1;
    if (frameCount > 1) assert.equal(manifest.assets[sprite].frames?.length, frameCount);
    for (let frame = 0; frame < frameCount; frame++) {
      setFixtureArtTime((frame + .1) / (manifest.assets[sprite].fps || 1));
      await sample(sprite + '-frame-' + frame, ctx => engine.drawActor(ctx, engine.player), {
        focus: playerFocus(), expected: sprite, expectedFrame: frame,
        fixture: 'Native wreckage costume; reachable control state sampled explicitly for ' + pose + '. This is not a traversed browser sequence.'
      });
    }
  }
  Object.assign(engine.player, { moving: false, vx: 0, vy: 0, grounded: true, climbing: false, crouching: false });
  engine.alien3V88.phase = 'infirmary';
  for (const id of ['dillon','clemens','andrews','aaron','morse','golic','junior',
    'david','arthur','kevin','gregor','william','jude','troy','frank','eric']) {
    assert.ok(hasAsset(id + '-idle'), 'Required native roster asset: ' + id);
    const actor = [...engine.alien3CastV88, ...engine.alien3PrisonersV89].find((a) => a.id === id);
    assert.ok(actor, 'Native roster actor must exist: ' + id);
    await sample(id, (ctx) => engine.drawAlien3NativePersonV114(ctx, actor), {
      focus: { x: actor.x, y: actor.y + 78 }, expected: id + '-idle',
      fixture: 'Existing roster actor through the native person bridge; not a narrative chronology proof.'
    });
  }
  if (hasAsset('runner-prowl')) {
    Object.assign(engine.alien3RunnerV88, { vx: 0, vy: 0, moving: false, alive: true, alien3DormantV88: true });
    const focus = { x: engine.alien3RunnerV88.x + engine.alien3RunnerV88.w / 2,
      y: engine.alien3RunnerV88.y + engine.alien3RunnerV88.h };
    await sample('runner-dormant', (ctx) => engine.drawEnemy(ctx, engine.alien3RunnerV88), {
      focus, absent: true, preload: ['runner-prowl'],
      fixture: 'Dormant Runner fixture in infirmary phase with its PNG decoded; sprite must stay hidden.' });
    engine.alien3RunnerV88.alien3DormantV88 = false;
    await sample('runner-prowl', (ctx) => engine.drawEnemy(ctx, engine.alien3RunnerV88), {
      focus, expected: 'runner-prowl', scale: 1.6, fixture: 'Awake stationary Runner fixture.' });
  }

  engine.beginAlien3EncounterV105('traque');
  Object.assign(engine.player, { moving: true, vx: 120, vy: 0, grounded: true, crouching: false,
    climbing: false, interactionClock: 0, v52HurtClock: 0, shockClock: 0 });
  for (const [pose, changes, sprite] of [
    ['walk', { vx: 120 }, 'ripley-prison-walk'], ['run', { vx: 270 }, 'ripley-prison-run'],
    ['jump-apex', { grounded: false, vy: 0 }, 'ripley-prison-jump'],
    ['crouch', { moving: false, vx: 0, crouching: true }, 'ripley-prison-crouch'],
    ['climb', { moving: false, vx: 0, crouching: false, climbing: true }, 'ripley-prison-climb'],
    ['crouch-walk', { moving: true, vx: 90, crouching: true }, 'ripley-prison-crouch-walk'],
    ['hurt', { moving: false, vx: 0, v52HurtClock: .2 }, 'ripley-prison-hurt']
  ]) {
    Object.assign(engine.player, { moving: true, vx: 120, vy: 0, grounded: true,
      crouching: false, climbing: false, v52HurtClock: 0, shockClock: 0, interactionClock: 0 }, changes);
    setFixtureArtTime(.2);
    if (pose === 'jump-apex') assert.ok(hasAsset(sprite), 'Apex fixture requires the delivered jump pose');
    await sample('player-' + pose, (ctx) => engine.drawActor(ctx, engine.player), { focus: playerFocus(),
      expected: hasAsset(sprite) ? sprite : null, fixture: 'Authored traque encounter; injected ' + pose + ' pose. Absent sprite keeps procedural renderer.' });
    if (!hasAsset(sprite)) checks('player-' + pose + ': procedural fallback is explicit', () => {
      const receipt = engine.getAlien3SpriteReportV115().receipts.ripley;
      assert.equal(receipt?.drawn, false); assert.equal(receipt?.id, sprite);
    });
    if (hasAsset(sprite) && ['climb', 'crouch-walk'].includes(pose)) {
      assert.equal(manifest.assets[sprite].frames?.length, 2, sprite + ': two delivered poses');
      for (const frame of [0, 1]) {
        setFixtureArtTime((frame + .1) / manifest.assets[sprite].fps);
        await sample('player-' + pose + '-frame-' + frame, ctx => engine.drawActor(ctx, engine.player), {
          focus: playerFocus(), expected: sprite, expectedFrame: frame,
          fixture: 'Native player hook; injected ' + pose + ' physical state and explicit two-pose frame.'
        });
      }
    }
  }
  if (hasAsset('ripley-prison-downed')) {
    const previous = Object.fromEntries(['alive', 'downed', 'moving', 'vx', 'vy', 'grounded',
      'climbing', 'crouching', 'v52HurtClock', 'shockClock', 'interactionClock']
      .map(key => [key, engine.player[key]]));
    Object.assign(engine.player, { alive: false, downed: true, moving: false, vx: 0,
      vy: 0, grounded: true, climbing: false, crouching: false, v52HurtClock: .42,
      shockClock: 0, interactionClock: 0 });
    await sample('player-downed', ctx => engine.drawActor(ctx, engine.player), {
      focus: playerFocus(), expected: 'ripley-prison-downed', expectedFrame: 0,
      fixture: 'Native player hook with declared incapacity and residual fatal-hit hurt timer; drawing must preserve the dead/downed state and saved progression.'
    });
    Object.assign(engine.player, previous);
  }
  if (hasAsset('ripley-prison-interact')) {
    const placeAt = (key) => {
      const station = stationV105(engine.alien3NavV105, key);
      Object.assign(engine.player, { x: station.x + station.w / 2 - engine.player.w / 2,
        y: station.y + station.h - engine.player.h, depth: 1, moving: false, vx: 0, vy: 0,
        grounded: true, climbing: false, crouching: false, v52HurtClock: 0, shockClock: 0, interactionClock: 0 });
    };
    placeAt('aaron'); engine.interact(engine.player);
    assert.equal(engine.alien3EncounterV105.stage, 1);
    placeAt('report'); engine.keys.add('KeyE'); engine.interact(engine.player);
    assert.equal(engine.alien3OperationsV107.active?.id, 'report');
    await sample('player-operation-active', ctx => engine.drawActor(ctx, engine.player), {
      focus: playerFocus(), expected: 'ripley-prison-interact',
      fixture: 'Player placed at authored stations; real Aaron interaction and V107 operation start accepted. Drawing does not advance the operation.'
    });
    assert.equal(engine.cancelAlien3OperationV107('release', false), true); engine.keys.delete('KeyE');
    await sample('player-operation-cancelled', ctx => engine.drawActor(ctx, engine.player), {
      focus: playerFocus(), expected: 'ripley-prison-idle',
      fixture: 'Real operation owner cancelled; native sprite immediately returns to idle.'
    });
    assert.equal(engine.alien3EncounterV105.stage, 1, 'Cancelled interaction never validates the report');
  }
  if (hasAsset('runner-walk')) {
    Object.assign(engine.alien3RunnerV88, { vx: 120, moving: true });
    engine.alien3EncounterV105.pursuit.mode = 'chase';
    await sample('runner-walk', (ctx) => engine.drawEnemy(ctx, engine.alien3RunnerV88), {
      focus: { x: engine.alien3RunnerV88.x + engine.alien3RunnerV88.w / 2, y: engine.alien3RunnerV88.y + engine.alien3RunnerV88.h },
      scale: 1.6, expected: 'runner-walk', fixture: 'Authored traque encounter; moving Runner render pose.' });
  }

  // V117 uses the existing pursuit owner and enemy hook. Each retained frame
  // is drawn separately in both directions; no simulation time is advanced.
  const runnerFocus = () => ({ x: engine.alien3RunnerV88.x + engine.alien3RunnerV88.w / 2,
    y: engine.alien3RunnerV88.y + engine.alien3RunnerV88.h });
  if (hasAsset('runner-run')) {
    const running = manifest.assets['runner-run'];
    assert.equal(running.frames?.length, 4, 'Runner run requires four retained key poses');
    assert.equal(new Set(running.frames.map(frame => frame.src || running.src)).size, 4,
      'Runner run must not count repeated images as new phases');
    engine.alien3EncounterV105.pursuit.mode = 'chase';
    engine.alien3V104.settings.reducedMotion = false;
    for (const facing of [1, -1]) {
      Object.assign(engine.alien3RunnerV88, { vx: 270 * facing, moving: true, facing });
      for (const frame of [0, 1, 2, 3]) {
        setFixtureArtTime((frame + .1) / running.fps);
        await sample('runner-run-' + (facing > 0 ? 'right' : 'left') + '-frame-' + frame,
          ctx => engine.drawEnemy(ctx, engine.alien3RunnerV88), {
            focus: runnerFocus(), scale: 1.35, expected: 'runner-run', expectedFrame: frame,
            fixture: 'Native traque pursuit owner in chase; injected velocity, facing and render time for one retained running frame.'
          });
      }
    }
    setFixtureArtTime(3.1 / running.fps);
    engine.alien3V104.settings.reducedMotion = true;
    assert.equal(engine.alien3ArtTimeV102(), 0, 'The native reduced-motion owner freezes the exposed art clock');
    await sample('runner-run-reduced-motion', ctx => engine.drawEnemy(ctx, engine.alien3RunnerV88), {
      focus: runnerFocus(), scale: 1.35, expected: 'runner-run', expectedFrame: 0,
      fixture: 'Native reduced-motion setting freezes the four-image run at its first frame.'
    });
    engine.alien3V104.settings.reducedMotion = false;
  }
  for (const pose of ['windup', 'recover']) {
    const sprite = 'runner-' + pose;
    if (!hasAsset(sprite)) continue;
    engine.alien3EncounterV105.pursuit.mode = pose;
    for (const facing of [1, -1]) {
      Object.assign(engine.alien3RunnerV88, { vx: 270 * facing, moving: true, facing });
      await sample(sprite + '-' + (facing > 0 ? 'right' : 'left'),
        ctx => engine.drawEnemy(ctx, engine.alien3RunnerV88), {
          focus: runnerFocus(), scale: 1.35, expected: sprite, expectedFrame: 0,
          fixture: 'Existing pursuit mode ' + pose + ' takes precedence over the injected movement; no new attack or timing.'
        });
    }
  }

  // Use the authored encounter that actually contains these two participants;
  // retain its nodes, routes and positions, injecting only the render pose/time.
  assert.equal(engine.beginAlien3EncounterV105('rabattage'), true);
  const encounter = engine.alien3EncounterV105;
  engine.alien3V104.settings.reducedMotion = false;
  for (const id of ['dillon', 'morse']) {
    const actor = encounter.participants.find((person) => person.id === id);
    assert.ok(actor, 'Authored rabattage participant must exist: ' + id);
    Object.assign(actor, { moving: true, vx: id === 'dillon' ? 105 : 112, vy: 0,
      grounded: true, climbing: false, crouching: false, v52HurtClock: 0, shockClock: 0 });
  }
  for (const id of ['dillon', 'morse']) {
    const actor = encounter.participants.find((person) => person.id === id);
    const sprite = id + '-walk';
    assert.ok(hasAsset(sprite), 'Required participant walk asset: ' + sprite);
    assert.equal(manifest.assets[sprite].frames?.length, 2, sprite + ': two delivered poses');
    for (const frame of [0, 1]) {
      const time = (frame + .1) / manifest.assets[sprite].fps;
      await sample(sprite + '-frame-' + frame,
        (ctx) => engine.drawAlien3ParticipantsV113(ctx, encounter, time), {
          focus: { x: actor.x + actor.w / 2, y: actor.y + actor.h },
          expected: sprite, expectedFrame: frame, preload: ['dillon-walk', 'morse-walk'],
          fixture: 'Authored rabattage encounter at existing positions; injected walking pose and time=' + time + 's.'
        });
    }
  }

  // A fresh native start clears encounter state before company/evidence samples.
  report.assetLoadBeforeRestart = bank.report();
  engine.stop(); engine.start(options);
  bank = engine.registerAlien3SpriteManifestV115(manifest, { imageFactory: () => new DeliveredImage(),
    preloadAll, maxCachedImages: 6, maxDecodedBytes: 48 * 1024 * 1024 });
  await bank.ready;
  engine.alien3V88.phase = 'company'; engine.alien3V89.company.visible = true;
  const node = engine.alien3SceneV103.nodes.find((n) => n.id === 'f161-company');
  const companyAssets = ['company-commando-idle','bishop-representative-idle','company-scientist-idle'].filter(hasAsset);
  if (companyAssets.length) {
    engine.camera.x = node.x - 280;
    await sample('company-arrival', (ctx) => {
      engine.drawAlien3FidelitySceneryV113(ctx, engine.alien3SceneV103, { flags: { companyArrived: true }, time: 0 });
      engine.drawAlien3CompanyV89(ctx);
    }, { focus: { x: node.x + 70, y: node.y }, scale: 1.6, preload: companyAssets,
      fixture: 'Native company phase and visible arrival fixture; existing guards, representative, patna-science only.' });
    for (const id of companyAssets) {
      checks(id + ': active company hook', () => assert.ok(drawnIds.has(id)));
    }
  }
  for (const [id, nodeId] of [['bishop-damaged','f161-bishop'],['flight-recorder','f161-flight-analysis-v94'],['medical-kit','f161-clemens-bed']]) {
    if (!hasAsset(id)) continue;
    const evidence = engine.alien3SceneV103.nodes.find((n) => n.id === nodeId);
    engine.camera.x = evidence.x - 300;
    await sample(id, (ctx) => engine.drawAlien3FidelitySceneryV113(ctx, engine.alien3SceneV103, { flags: {}, time: 0 }), {
      focus: { x: evidence.x, y: evidence.y }, expected: id, scale: 3,
      fixture: 'Native fixed evidence prop at its authored support; no new interaction.' });
  }
  if (hasAsset('fire-flare')) {
    const node = engine.alien3SceneV103.nodes.find(item => item.id === 'f161-chemical-store');
    const focus = { x: node.x - 40, y: node.y };
    await sample('fire-flare-hidden', ctx => engine.drawAlien3FidelitySceneryV113(ctx, engine.alien3SceneV103,
      { flags: { fire: false }, time: 0 }), { focus, preload: ['fire-flare'], forbidden: ['fire-flare'],
      fixture: 'Existing chemical-store socket; lit PNG decoded but authored fire flag false, so the sprite stays hidden.' });
    await sample('fire-flare-lit', ctx => engine.drawAlien3FidelitySceneryV113(ctx, engine.alien3SceneV103,
      { flags: { fire: true }, time: 0 }), { focus, expected: 'fire-flare',
      fixture: 'Existing chemical-store socket with explicit fire flag fixture; no carried torch, weapon or new interaction.' });
  }

  report.catalogueOnly = Object.keys(manifest.assets).filter((id) => !drawnIds.has(id));
  report.note = 'Unsampled assets remain listed, not silently counted as native playable. Coat shore/coast, Spike, ox and deceased prisoners stay outside these native narrative hooks; two-pose catalogue runs do not change participant movement.';
  await flushSamples();
  report.assetLoad = bank.report();
  report.passed = report.checks.every((c) => c.passed);
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, samples: report.samples.length,
    assetsDrawnNatively: drawnIds.size, unclaimed: report.catalogueOnly, output }));
  if (!report.passed) process.exitCode = 1;
} finally { engine.stop(); }
