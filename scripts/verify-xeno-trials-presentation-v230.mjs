import assert from 'node:assert/strict';
import { closeSync, openSync, readSync } from 'node:fs';
import test from 'node:test';
import { XENO_TRIALS_FIGHTERS_V96, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_RESEARCH_FIGHTERS_V210 } from '../src/xeno-trials-research-v210.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { getXenoTrialsPresentationPlateV230 } from '../src/xeno-trials-presentation-art-v230.js';
import { getXenoPresentationViewV97 } from '../src/xeno-trials-presentation-v97.js';
import { advanceXenoTrialsOutroV155, skipXenoTrialsOutroV155 } from '../src/xeno-trials-sequences-v155.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { createXenoTrialsVictoryClockV230, drawXenoTrialsPresentationMarksV230, drawXenoTrialsPresentationPlateV230,
  getXenoTrialsPresentationPlateLayoutV230, getXenoTrialsPresentationProfileV230,
  getXenoTrialsPresentationViewV230 } from '../src/xeno-trials-presentation-v230.js';

const roster = [...new Map([...XENO_TRIALS_FIGHTERS_V96, ...XENO_TRIALS_RESEARCH_FIGHTERS_V210].map(fighter => [fighter.id, fighter])).values()];
const appearances = roster.flatMap(fighter => (fighter.variants.length ? fighter.variants : [null]).map(variant => ({ id: fighter.id, variant })));
const trial = options => createXenoTrialsMatchV96({ playerId: 'royal-guard', opponentId: 'razor-claws', introSeconds: 0,
  roundsToWin: 1, matchId: 'presentations-v230', ...options });
const intro = (side = 'player', elapsedMs = 500) => getXenoPresentationViewV97({ phase: `intro-${side}`, round: 1, elapsedMs });
const view = (match, slot = 0, cues = {}, reducedMotion = false) => getXenoTrialsPresentationViewV230(match, match.fighters[slot], cues, reducedMotion);

// Canvas image dimensions are taken from each actual admitted PNG or WebP.
const imageSizes = new Map();
function spriteImage(path) {
  if (!imageSizes.has(path)) {
    const file = openSync(new URL(`..${path}`, import.meta.url), 'r');
    const header = Buffer.alloc(32);
    try { assert.equal(readSync(file, header, 0, header.length, 0), header.length); } finally { closeSync(file); }
    const format = header.toString('ascii', 12, 16);
    let naturalWidth, naturalHeight;
    if (format === 'IHDR') {
      naturalWidth = header.readUInt32BE(16); naturalHeight = header.readUInt32BE(20);
    } else if (format === 'VP8X') {
      naturalWidth = header.readUIntLE(24, 3) + 1; naturalHeight = header.readUIntLE(27, 3) + 1;
    } else {
      assert.equal(format, 'VP8L', path);
      const bits = header.readUInt32LE(21);
      naturalWidth = (bits & 0x3fff) + 1; naturalHeight = ((bits >>> 14) & 0x3fff) + 1;
    }
    imageSizes.set(path, { complete: true, naturalWidth, naturalHeight, path });
  }
  return imageSizes.get(path);
}
const winnerImages = ({ id, variant }) => {
  const { path } = getXenoTrialsArtV96(id, variant);
  return new Map([[path, spriteImage(path)]]);
};

function timePoint(match, slot = 0) {
  // Fixture places one point of damage and advances the engine's time bell.
  // Round and result ownership still comes entirely from the native engine.
  match.fighters[1 - slot].hp = 1;
  match.timeRemaining = XENO_TRIALS_STEP_V96;
  stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, {}, {});
}

test('each admitted exact identity and costume enters and wins using its real source and the signed engine result', () => {
  assert.equal(XENO_TRIALS_FIGHTERS_V96.length, 202);
  assert.equal(roster.length, 204);
  assert.equal(appearances.length, 205);
  const sequenceIds = new Set(), bodyTracks = new Set();
  for (const { id, variant } of appearances) {
    const match = trial({ playerId: id, playerVariant: variant });
    const before = structuredClone(match);
    const entrance = view(match, 0, { presentation: intro() });
    const later = view(match, 0, { presentation: intro('player', 800) });
    const candidate = getXenoTrialsPresentationProfileV230(match.fighters[0]);
    assert.equal(candidate.fighterId, id);
    assert.equal(candidate.variant, variant);
    assert.equal(candidate.artPath, getXenoTrialsArtV96(id, variant).path);
    assert.equal(entrance.profileId, candidate.profileId);
    assert.equal(entrance.kind, 'intro');
    assert.notEqual(later.sweep, entrance.sweep);
    assert.equal(view(match, 1, { presentation: intro() }), null);
    assert.equal(view(match, 0, { presentation: intro() }, true), null);
    assert.match(entrance.beat, /^[a-z-]+$/);
    assert.deepEqual(match, before);
    bodyTracks.add(entrance.anatomy);
    sequenceIds.add(entrance.sequenceId);

    timePoint(match);
    assert.equal(match.result?.winner, 'player', id);
    assert.equal(match.result.reason, 'time');
    const scored = structuredClone(match);
    const images = winnerImages(match.fighters[0]);
    const clock = createXenoTrialsVictoryClockV230(match, null, images);
    assert.equal(clock?.participants[0].revision, 230, id);
    const victory = view(match, 0, { outro: { ...clock, elapsedMs: 870 } });
    assert.equal(victory.kind, 'win-final');
    assert.equal(victory.fighterId, id);
    assert.equal(victory.variant, variant);
    assert.equal(victory.anatomy, entrance.anatomy);
    assert.equal(view(match, 1, { outro: clock }), null);
    assert.equal(createXenoTrialsVictoryClockV230(match, null, images, true), null);
    assert.equal(createXenoTrialsVictoryClockV230(match, null, new Map()), null);
    assert.deepEqual(match, scored);
    sequenceIds.add(victory.sequenceId);
  }
  assert.equal(sequenceIds.size, 410);
  assert.equal(bodyTracks.size, 12);
  assert.notEqual(getXenoTrialsPresentationProfileV230({ id: 'arachnoid', variant: 'grey' }).signature,
    getXenoTrialsPresentationProfileV230({ id: 'arachnoid', variant: 'purple' }).signature);
  assert.equal(getXenoTrialsPresentationProfileV230({ id: 'drive-v123-game-working-joe-standard' }).anatomy, 'android');
  assert.equal(getXenoTrialsPresentationProfileV230({ id: 'drive-v123-creature-aliens-queen-mobile' }).anatomy, 'crown');
  assert.equal(getXenoTrialsPresentationProfileV230({ id: 'arachnoid', variant: 'invalid' }), null);
  assert.equal(getXenoTrialsPresentationProfileV230({ id: 'unavailable-fighter' }), null);
});

test('a round point, another intro slot, final score and incompatible or stale receipts stay distinct', () => {
  const match = trial({ roundsToWin: 2, holdRoundTransition: true });
  assert.equal(view(match, 0, { presentation: intro('opponent') }), null);
  assert.equal(view(match, 1, { presentation: intro('opponent') }).fighterId, 'razor-claws');
  timePoint(match, 1);
  assert.equal(match.phase, 'round-over');
  assert.equal(match.result, null);
  assert.equal(view(match, 0), null);
  for (let tick = 0; tick < 76; tick++) stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, {}, {});
  const round = view(match, 1);
  assert.equal(round.kind, 'round-win');
  assert.ok(round.progress > .34 && round.progress < .37);

  const final = trial();
  timePoint(final, 1);
  const images = winnerImages(final.fighters[1]);
  const clock = createXenoTrialsVictoryClockV230(final, null, images);
  assert.equal(clock.winner, 'opponent');
  assert.equal(view(final, 1, { outro: clock }).kind, 'win-final');
  const legacy = { ...clock, participants: [] };
  assert.equal(createXenoTrialsVictoryClockV230(final, legacy, images), legacy);
  assert.equal(advanceXenoTrialsOutroV155(clock, 60, true), clock);
  assert.equal(view(final, 1, { outro: skipXenoTrialsOutroV155(clock) }), null);
  assert.equal(view(final, 1, { outro: { ...clock, terminalTick: final.tick - 1 } }), null);
  assert.equal(view(final, 1, { outro: { ...clock, participants: [{ ...clock.participants[0], variant: 'intruder' }] } }), null);
  for (const invalid of [
    { ...final, hordeV180: {} }, { ...final, operationV188: {} },
    { ...final, result: { ...final.result, stageId: 'unknown' } },
    { ...final, result: { ...final.result, winner: 'draw' } },
    { ...final, result: { ...final.result, reason: 'double-ko' } },
    { ...final, config: { ...final.config, rulesV119: { goal: 'survive' } } },
    { ...final, fighters: [final.fighters[0], { ...final.fighters[1], y: 12 }] }
  ]) assert.equal(createXenoTrialsVictoryClockV230(invalid, null, images), null);
});

function traceContext(calls) {
  const gradients = { addColorStop() {} };
  return new Proxy({ globalAlpha: 1 }, { get(target, key) {
    if (key in target) return target[key];
    if (key === 'measureText') return text => ({ width: String(text).length * 8 });
    if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradients;
    return (...args) => { calls.push([key, ...args]); };
  } });
}

test('drawn Warrior uses the exact PNG at stable source density with mirrored floor coordinates', () => {
  const match = trial({ playerId: 'warrior' });
  const [fighter] = match.fighters;
  const metric = getXenoTrialsRenderMetricsV110(fighter.id, fighter.variant);
  const plate = getXenoTrialsPresentationPlateV230('intro', fighter.id, fighter.variant);
  const layout = getXenoTrialsPresentationPlateLayoutV230(plate, fighter, metric, 'intro');
  const reverse = getXenoTrialsPresentationPlateLayoutV230(plate, { ...fighter, facing: -1 }, metric, 'intro');
  assert.ok(Math.abs((plate.alphaBounds[3] - plate.alphaBounds[1]) * layout.scale / metric.visibleHeight - .96) < 1e-9);
  assert.equal(reverse.flip, -1);
  assert.equal(reverse.left, -layout.right);
  assert.equal(reverse.right, -layout.left);
  assert.equal(getXenoTrialsPresentationPlateLayoutV230(plate, { ...fighter, id: 'runner' }, metric, 'intro'), null);
  assert.equal(getXenoTrialsPresentationPlateLayoutV230(plate, fighter, metric, 'victory'), null);
  assert.equal(getXenoTrialsPresentationPlateV230('victory', fighter.id, fighter.variant), null);
  const calls = [], context = traceContext(calls);
  const image = spriteImage(plate.path);
  assert.equal(drawXenoTrialsPresentationPlateV230(context, { ...image, naturalHeight: 1 }, layout, fighter.x, 450), false);
  assert.equal(drawXenoTrialsPresentationPlateV230(context, image, layout, fighter.x, 450), true);
  assert.deepEqual(calls.find(([name]) => name === 'translate'), ['translate', fighter.x, 450]);
  assert.equal(calls.find(([name]) => name === 'drawImage')[3], -plate.rootY * layout.scale);
  const entrance = view(match, 0, { presentation: intro() });
  drawXenoTrialsPresentationMarksV230(context, entrance, fighter.x, 450, 50, fighter.facing);
  assert.deepEqual(calls.find(([name]) => name === 'ellipse').slice(1, 3), [fighter.x, 452]);
});

function host(config, { reducedMotion = false, missingEntry = false } = {}) {
  const queue = new Map(), results = [], calls = [];
  const context = traceContext(calls);
  const document = { hidden: false, hasFocus: () => true };
  const canvas = { tagName: 'CANVAS', width: 1000, height: 560, getContext: () => context, setAttribute() {},
    closest: () => null, focus() { document.activeElement = this; } };
  document.activeElement = canvas;
  const window = { addEventListener() {}, removeEventListener() {} };
  let time = 0, serial = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window, document, reducedMotion,
    config: { playerId: 'royal-guard', opponentId: 'razor-claws', difficulty: 'easy', roundsToWin: 1,
      rulesV119: { initialHp: 1, noSpecial: true }, ...config },
    loadImage: async path => {
      if (missingEntry && path.endsWith('warrior-intro.png')) throw new Error('Optional painted entry unavailable');
      return spriteImage(path);
    }, onResult: result => results.push(result),
    requestAnimationFrame(callback) { queue.set(++serial, callback); return serial; }, cancelAnimationFrame(id) { queue.delete(id); } });
  function frame(count = 1) {
    for (let frame = 0; frame < count; frame++) {
      time += 1000 / 120;
      calls.length = 0;
      for (const [id, callback] of [...queue]) if (queue.delete(id)) callback(time);
      assert.ok(queue.size <= 1);
    }
  }
  return { runtime, frame, calls, results };
}
const drawn = (snapshot, side = 'player') => snapshot.rigViewsV154.find(record => record.side === side);

test('native runtime shows sustained painted entry after V221 arrival, accepts two skips in order, and falls back on load failure', async () => {
  for (const settings of [{}, { missingEntry: true }, { reducedMotion: true }]) {
    const { runtime, frame, calls } = host({ playerId: 'warrior' }, settings);
    try {
      assert.equal(await runtime.start(), true);
      frame(38);
      const arrival = drawn(runtime.getState());
      if (settings.reducedMotion) assert.equal(arrival?.presentationV230, undefined);
      else assert.equal(arrival?.presentationV230?.mode, 'native-arrival');
      frame(62);
      const settled = runtime.getState(), owner = drawn(settled);
      assert.equal(settled.tick, 0);
      if (!settings.reducedMotion && !settings.missingEntry) {
        assert.equal(owner.presentationV230.mode, 'painted-intro');
        assert.equal(owner.arrivalV221.x, settled.fighters[0].x);
        assert.ok(calls.some(([name, image]) => name === 'drawImage' && image?.path === owner.presentationV230.platePath));
        frame(27);
        assert.equal(drawn(runtime.getState()).presentationV230.mode, 'painted-intro');
      } else assert.notEqual(owner?.presentationV230?.mode, 'painted-intro');
      assert.equal(runtime.skipSequence(), true);
      assert.equal(runtime.getState().presentation.phase, 'intro-opponent');
      assert.equal(runtime.skipSequence(), true);
      assert.equal(runtime.getState().presentation.phase, 'countdown');
    } finally { runtime.stop(); }
  }
});

test('native contact KO pays once and freezes the exact winner pose clock across pause and skip', async () => {
  const { runtime, frame, results } = host({ playerId: 'mire-v209-six', opponentId: 'mire-v210-praetorian-afe' });
  try {
    assert.equal(await runtime.start(), true);
    runtime.skipSequence(); runtime.skipSequence(); frame(440);
    for (let tick = 0; tick < 700 && runtime.getState().phase === 'active'; tick++) {
      const [player, opponent] = runtime.getState().fighters;
      const gap = getXenoTrialsBodyGapV105(player, opponent);
      runtime.setInput('right', gap > 21 && opponent.x > player.x);
      runtime.setInput('left', gap > 21 && opponent.x < player.x);
      runtime.setInput('light', gap <= 21 && tick % 3 === 0);
      frame();
    }
    const scored = runtime.getState();
    assert.equal(scored.result?.reason, 'ko');
    assert.equal(results.length, 1);
    assert.equal(scored.outroV155.participants[0].revision, 230);
    frame(90);
    const active = runtime.getState();
    assert.equal(drawn(active, scored.result.winner)?.presentationV230?.kind, 'win-final');
    assert.equal(drawn(active, scored.result.winner)?.presentationV230?.mode, 'native-plate');
    runtime.pause(); frame(20);
    assert.equal(runtime.getState().outroV155.elapsedMs, active.outroV155.elapsedMs);
    assert.equal(runtime.skipSequence(), false);
    runtime.resume();
    assert.equal(runtime.skipSequence(), true);
    frame(240);
    const skipped = runtime.getState();
    assert.equal(skipped.outroV155.skipped, true);
    assert.equal(drawn(skipped, scored.result.winner)?.presentationV230, undefined);
    assert.deepEqual(skipped.result, scored.result);
    assert.deepEqual(skipped.fighters, scored.fighters);
    assert.equal(results.length, 1);
  } finally { runtime.stop(); }
});
