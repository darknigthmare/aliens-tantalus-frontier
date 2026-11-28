import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { closeSync, openSync, readFileSync, readSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105, getXenoTrialsGeometryV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsOfflineDuelV223 } from '../src/xeno-trials-offline-v223.js';
import { getXenoTrialsPresentationPlateV230 } from '../src/xeno-trials-presentation-art-v230.js';
import { drawXenoTrialsPresentationPlateV230, getXenoTrialsPresentationPlateLayoutV230 } from '../src/xeno-trials-presentation-v230.js';
import {
  getXenoTrialsReferencedAssetsV231, getXenoTrialsReferencedPresentationPlateV231,
  getXenoTrialsReferencedResearchArtV231, XENO_TRIALS_REFERENCED_ART_V231,
} from '../src/xeno-trials-research-art-v231.js';
import { getXenoTrialsHistoricalResearchArtV210, getXenoTrialsResearchAssetsV210 } from '../src/xeno-trials-research-v210.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';

const predalien = 'mire-v210-predalien-avpr';
const striker = 'mire-v210-striker';
const folder = '/assets/openai/xeno-trials-v231/';
const expectations = [
  [predalien, 'neutral', 'predalien-avpr-neutral.png', 'dc9dec47f5dccd1c1a42f4390b9cf050ee8b80043f43bed89d77c43f28bab792', [29,14,1470,1011], [1067,1010]],
  [predalien, 'select', 'predalien-avpr-select.png', '8a317bc91b466e5ea0f24da4f1d5deb229ee9ec703e84b0ec2a9151b8ce4db17', [120,16,1442,994], [970,993]],
  [predalien, 'intro', 'predalien-avpr-intro.png', '8b118b863dbe80c3dbcb76b34b9424c1a1d7456646eb3cbcde73d3f90f88f348', [42,138,1527,937], [920,936]],
  [predalien, 'victory', 'predalien-avpr-victory.png', '7a804377b94601d8530fcbd4f83bae31c02a159363d00b74d68bfd863bcdc04a', [159,10,1461,1007], [990,1005]],
  [striker, 'neutral', 'striker-neutral.png', 'b44db527d7d533434ecf492a7d2e971a335913ba103fc9a03a85d10fa3cfed90', [192,65,1319,962], [718,960]],
];
const paths = expectations.map(([, , name]) => folder + name);
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} vs ${expected}`);

test('five exact RGBA textures bind their own revision, profile, stance and measured crop', () => {
  assert.equal(XENO_TRIALS_REFERENCED_ART_V231.length, expectations.length);
  assert.deepEqual(getXenoTrialsReferencedAssetsV231(), paths);
  for (const [id, kind, name, sha256, bounds, root] of expectations) {
    const plate = getXenoTrialsReferencedPresentationPlateV231(kind, id);
    const texture = readFileSync(new URL('..' + folder + name, import.meta.url));
    assert.equal(createHash('sha256').update(texture).digest('hex'), sha256);
    assert.equal(texture.toString('ascii', 12, 16), 'IHDR');
    assert.equal(texture[25], 6);
    assert.deepEqual([texture.readUInt32BE(16), texture.readUInt32BE(20)], [1536, 1024]);
    assert.deepEqual([plate.sourceWidth, plate.sourceHeight], [1536, 1024]);
    assert.equal(plate.fighterId, id);
    assert.equal(plate.profileId, getXenoTrialsFighterV96(id).profileId);
    assert.equal(plate.variant, null);
    assert.equal(plate.kind, kind);
    assert.equal(plate.sha256, sha256);
    assert.equal(plate.path, folder + name);
    assert.equal(plate.sourceFacing, 1);
    assert.equal(plate.canonExact, false);
    assert.equal(plate.sourceStatus, id === predalien ? 'provisional-film-adaptation' : 'original-mire-role-adaptation');
    assert.deepEqual(plate.alphaBounds, bounds);
    assert.deepEqual([plate.rootX, plate.rootY], root);
    assert.equal(getXenoTrialsReferencedPresentationPlateV231(kind, id, 'unadmitted-variant'), null);
    assert.equal(getXenoTrialsReferencedPresentationPlateV231(kind, 'predalien'), null);
  }
  for (const kind of ['select', 'intro', 'victory']) {
    assert.equal(getXenoTrialsPresentationPlateV230(kind, predalien), getXenoTrialsReferencedPresentationPlateV231(kind, predalien));
    assert.equal(getXenoTrialsPresentationPlateV230(kind, striker), null);
    assert.equal(getXenoTrialsReferencedPresentationPlateV231(kind, 'warrior'), null);
  }
  assert.equal(getXenoTrialsReferencedResearchArtV231('mire-v210-scorched'), null);
  assert.equal(getXenoTrialsReferencedResearchArtV231('predalien'), null);
});

test('the two registered neutral images resolve at authored stature and drive the intentional neutral collider dimensions', () => {
  const configurations = [
    { id: predalien, stature: 179, width: 80, height: 162, hp: 279, speed: 178, family: 'hybrid',
      front: 93.02665138271956, rear: 15.428571428571427, collisionHeight: 208.28571428571428 },
    { id: striker, stature: 180, width: 80, height: 166, hp: 185, speed: 180, family: 'pathogen',
      front: 155.05972288580986, rear: 15.428571428571429, collisionHeight: 213.42857142857144 },
  ];
  for (const row of configurations) {
    const art = getXenoTrialsReferencedResearchArtV231(row.id);
    const definition = getXenoTrialsFighterV96(row.id);
    const [ , top, , bottom] = art.alphaBounds;
    assert.equal(getXenoTrialsArtV96(row.id), art);
    assert.ok(getXenoTrialsHistoricalResearchArtV210(row.id).sourceRectV209);
    assert.equal(art.sourceRectV209, undefined);
    assert.deepEqual(art.pivot, { x: art.rootX / art.sourceWidth, y: art.rootY / art.sourceHeight });
    close(art.renderHeight * (bottom - top) / art.sourceHeight, row.stature);
    close(art.renderWidth / art.renderHeight, 1536 / 1024);
    assert.deepEqual([definition.role, definition.family, definition.hp, definition.speed, definition.width, definition.height],
      ['tank', row.family, row.hp, row.speed, row.width, row.height]);
    assert.equal(definition.canonExact, false);
    const collision = getXenoTrialsGeometryV105(row.id);
    close(collision.visibleHeight, row.stature * 90 / 70);
    close(collision.front, row.front);
    close(collision.rear, row.rear);
    close(collision.height, row.collisionHeight);
    assert.ok(collision.render.visibleWidth > collision.width);
  }
  assert.equal(getXenoTrialsArtV96('mire-v210-scorched'), getXenoTrialsHistoricalResearchArtV210('mire-v210-scorched'));
});

function traceContext(calls) {
  const gradient = { addColorStop() {} };
  return new Proxy({ globalAlpha: 1 }, { get(target, key) {
    if (key in target) return target[key];
    if (key === 'measureText') return text => ({ width: String(text).length * 8 });
    if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradient;
    return (...args) => calls.push([key, ...args]);
  } });
}

function textureImage(path) {
  const file = openSync(new URL('..' + path, import.meta.url), 'r');
  const header = Buffer.alloc(32);
  try { assert.equal(readSync(file, header, 0, header.length, 0), header.length); } finally { closeSync(file); }
  const format = header.toString('ascii', 12, 16);
  let naturalWidth, naturalHeight;
  if (format === 'IHDR') {
    naturalWidth = header.readUInt32BE(16);
    naturalHeight = header.readUInt32BE(20);
  } else if (format === 'VP8X') {
    naturalWidth = header.readUIntLE(24, 3) + 1;
    naturalHeight = header.readUIntLE(27, 3) + 1;
  } else {
    assert.equal(format, 'VP8L', path);
    const bits = header.readUInt32LE(21);
    naturalWidth = (bits & 0x3fff) + 1;
    naturalHeight = ((bits >>> 14) & 0x3fff) + 1;
  }
  return { path, complete: true, naturalWidth, naturalHeight };
}

test('the three Predalien presentation drawings stay at the neutral source density and are grounded in either facing', () => {
  const match = createXenoTrialsMatchV96({ playerId: predalien, opponentId: striker });
  const [fighter] = match.fighters;
  const before = structuredClone(match);
  const bounds = getXenoTrialsBodyBoundsV105(fighter);
  const metrics = getXenoTrialsRenderMetricsV110(predalien);
  for (const kind of ['select', 'intro', 'victory']) {
    const plate = getXenoTrialsPresentationPlateV230(kind, fighter.id, fighter.variant);
    const layout = getXenoTrialsPresentationPlateLayoutV230(plate, fighter, metrics, kind);
    close(layout.scale, metrics.visibleHeight / 997);
    const mirrored = getXenoTrialsPresentationPlateLayoutV230(plate, { ...fighter, facing: -1 }, metrics, kind);
    assert.equal(layout.flip, 1);
    assert.equal(mirrored.flip, -1);
    close(layout.left, -mirrored.right);
    close(layout.right, -mirrored.left);
    close(layout.top, mirrored.top);
    const image = textureImage(plate.path);
    for (const geometry of [layout, mirrored]) {
      const calls = [], context = traceContext(calls);
      assert.equal(drawXenoTrialsPresentationPlateV230(context, { ...image, complete: false }, geometry, fighter.x, 450), false);
      assert.equal(drawXenoTrialsPresentationPlateV230(context, { ...image, naturalWidth: 1 }, geometry, fighter.x, 450), false);
      assert.deepEqual(calls, []);
      assert.equal(drawXenoTrialsPresentationPlateV230(context, image, geometry, fighter.x, 450), true);
      assert.deepEqual(calls, [
        ['save'], ['translate', fighter.x, 450], ['scale', geometry.flip, 1],
        ['drawImage', image, -plate.rootX * geometry.scale, -plate.rootY * geometry.scale,
          plate.sourceWidth * geometry.scale, plate.sourceHeight * geometry.scale], ['restore'],
      ]);
    }
  }
  assert.deepEqual(getXenoTrialsBodyBoundsV105(fighter), bounds);
  assert.deepEqual(match, before);
});

test('offline sets contain the five exact new paths only for their two fighter IDs', () => {
  const select = (playerId, opponentId) => getXenoTrialsOfflineDuelV223({ playerId, opponentId }).assets
    .filter(path => path.startsWith(folder)).sort();
  assert.deepEqual(select(predalien, striker), [...paths].sort());
  assert.deepEqual(select(predalien, 'runner'), paths.slice(0, 4).sort());
  assert.deepEqual(select(striker, 'warrior'), paths.slice(4));
  assert.deepEqual(select('predalien', 'warrior'), []);
  assert.deepEqual(getXenoTrialsResearchAssetsV210().filter(path => path.startsWith(folder)), paths);
});

function runDuel({ omitVictory = false } = {}) {
  const queue = new Map(), calls = [], results = [];
  const context = traceContext(calls);
  const document = { hidden: false, hasFocus: () => true };
  const canvas = { tagName: 'CANVAS', width: 1000, height: 560, getContext: () => context, setAttribute() {},
    closest: () => null, focus() { document.activeElement = this; } };
  document.activeElement = canvas;
  const window = { addEventListener() {}, removeEventListener() {} };
  let time = 0, serial = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window, document, reducedMotion: false,
    config: { playerId: predalien, opponentId: 'runner', difficulty: 'easy', roundsToWin: 1,
      rulesV119: { initialHp: 1, noSpecial: true } },
    loadImage: async path => {
      if (omitVictory && path === paths[3]) throw new Error('Optional victory PNG unavailable');
      return textureImage(path);
    },
    onResult: result => results.push(result),
    requestAnimationFrame(callback) { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame(id) { queue.delete(id); },
  });
  function advance(count = 1) {
    for (let index = 0; index < count; index++) {
      time += 1000 / 120;
      calls.length = 0;
      for (const [id, callback] of [...queue]) if (queue.delete(id)) callback(time);
    }
  }
  return { runtime, advance, calls, results };
}
const painted = (snapshot, side) => snapshot.rigViewsV154.find(record => record.side === side)?.presentationV230;

test('a native Predalien win draws the admitted victory PNG, with normal playback or native fallback and identical outcome', async () => {
  const matches = [];
  for (const omitVictory of [false, true]) {
    const { runtime, advance, calls, results } = runDuel({ omitVictory });
    try {
      assert.equal(await runtime.start(), true);
      advance(100);
      const entering = runtime.getState();
      assert.equal(entering.tick, 0);
      assert.equal(painted(entering, 'player')?.mode, 'painted-intro');
      assert.ok(calls.some(([name, image]) => name === 'drawImage' && image?.path === paths[2]));
      assert.equal(runtime.skipSequence(), true);
      assert.equal(runtime.skipSequence(), true);
      advance(440);
      for (let tick = 0; tick < 700 && runtime.getState().phase === 'active'; tick++) {
        const [player, opponent] = runtime.getState().fighters;
        const gap = getXenoTrialsBodyGapV105(player, opponent);
        runtime.setInput('right', gap > 21 && opponent.x > player.x);
        runtime.setInput('left', gap > 21 && opponent.x < player.x);
        runtime.setInput('light', gap <= 21 && tick % 3 === 0);
        advance();
      }
      const scored = runtime.getState();
      assert.equal(scored.result?.winner, 'player');
      assert.equal(scored.result.reason, 'ko');
      assert.equal(results.length, 1);
      const former = scored.fighters.map(getXenoTrialsBodyBoundsV105);
      advance(90);
      const ending = runtime.getState();
      const view = painted(ending, 'player');
      assert.equal(view?.kind, 'win-final');
      assert.equal(view.mode, omitVictory ? 'native-plate' : 'painted-victory');
      assert.equal(view.platePath, omitVictory ? undefined : paths[3]);
      assert.equal(calls.some(([name, image]) => name === 'drawImage' && image?.path === paths[3]), !omitVictory);
      assert.deepEqual(ending.result, scored.result);
      assert.deepEqual(ending.fighters.map(getXenoTrialsBodyBoundsV105), former);
      assert.equal(results.length, 1);
      matches.push({ fighters: ending.fighters, result: ending.result, tick: ending.tick });
    } finally { runtime.stop(); }
  }
  assert.deepEqual(matches[0], matches[1]);
});
