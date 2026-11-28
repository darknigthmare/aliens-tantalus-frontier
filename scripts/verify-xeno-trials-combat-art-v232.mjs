import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_ATTACKS_V96,
  XENO_TRIALS_STEP_V96 as STEP } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { drawXenoTrialsPoseV209 as draw, getXenoTrialsGroundedPaintedActionsV223 as actions,
  getXenoTrialsPoseAssetsV209 as assets } from '../src/xeno-trials-poses-v209.js';
import { getXenoTrialsAnimationCoverageV199 as historicalCoverage,
  getXenoTrialsRuntimeAnimationCoverage as liveCoverage } from '../src/xeno-trials-animation-coverage-v199.js';
import { getXenoTrialsOfflineDuelV223 } from '../src/xeno-trials-offline-v223.js';
import { publicXenoPosePathAdmissionV209 as admitted,
  verifyXenoPoseAdmissionsV209 } from './public-xeno-pose-admissions-v209.mjs';

const manifest = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/combat-art-v232.json', import.meta.url)));
const folder = '/assets/openai/xeno-trials-v232/characters/';
const phases = ['windup', 'contact', 'recovery'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} vs ${expected}`);

function decode(path) {
  const bytes = readFileSync(new URL('..' + path, import.meta.url));
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.deepEqual([bytes[24], bytes[25], bytes[28]], [8, 6, 0]);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), compressed = [];
  for (let at = 8; at < bytes.length;) {
    const length = bytes.readUInt32BE(at);
    assert.ok(at + length + 12 <= bytes.length);
    if (bytes.toString('ascii', at + 4, at + 8) === 'IDAT') compressed.push(bytes.subarray(at + 8, at + 8 + length));
    at += length + 12;
  }
  const packed = inflateSync(Buffer.concat(compressed)), stride = width * 4, data = Buffer.alloc(stride * height);
  assert.equal(packed.length, (stride + 1) * height);
  const paeth = (a, b, c) => {
    const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const row = y * stride, source = y * (stride + 1), filter = packed[source];
    assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? data[row + x - 4] : 0, up = y ? data[row + x - stride] : 0;
      const upperLeft = y && x >= 4 ? data[row + x - stride - 4] : 0;
      const prediction = [0, left, up, Math.floor((left + up) / 2), paeth(left, up, upperLeft)][filter];
      data[row + x] = (packed[source + x + 1] + prediction) & 255;
    }
  }
  return { bytes, data, width, height };
}

function alphaBounds(image, rect, minimum = 1) {
  const [x, y, w, h] = rect;
  let left = x + w, top = y + h, right = x, bottom = y, count = 0, edgeCount = 0;
  for (let row = y; row < y + h; row++) for (let column = x; column < x + w; column++) {
    if (image.data[(row * image.width + column) * 4 + 3] < minimum) continue;
    count++; left = Math.min(left, column); top = Math.min(top, row);
    right = Math.max(right, column + 1); bottom = Math.max(bottom, row + 1);
    if (column === x || column === x + w - 1 || row === y || row === y + h - 1) edgeCount++;
  }
  return { bounds: [left, top, right, bottom], count, edgeCount };
}

test('four exact native PNGs contain twelve complete isolated alpha crops and measured planted toes', async () => {
  assert.equal(manifest.canonExact, false);
  assert.equal(manifest.files.length, 4);
  assert.deepEqual(manifest.files.map(entry => [entry.fighterId, entry.action]), [
    ['mire-v209-bigchap', 'light'], ['mire-v209-bigchap', 'heavy'],
    ['mire-v209-deacon', 'light'], ['mire-v209-deacon', 'heavy']
  ]);
  await verifyXenoPoseAdmissionsV209(new URL('../', import.meta.url).pathname);
  assert.deepEqual(assets().filter(path => path.startsWith(folder)), manifest.files.map(entry => entry.path));
  const legacyPaths = assets().filter(path => !path.startsWith(folder));
  assert.equal(legacyPaths.length, 86);
  assert.equal(hash(JSON.stringify(legacyPaths)), 'bab606532f02d1edb3cb162763d032ba9ada8e9bfe606f33af7071e0e44d8971');
  for (const entry of manifest.files) {
    const image = decode(entry.path);
    assert.equal(hash(image.bytes), entry.sha256);
    assert.equal(entry.sha256, entry.originalSha256);
    assert.equal(entry.byteIdentical, true);
    assert.equal(entry.canonExact, false);
    assert.deepEqual([image.width, image.height], [entry.width, entry.height]);
    assert.equal(hash(readFileSync(new URL('..' + entry.source.path, import.meta.url))), entry.source.sha256);
    assert.equal(admitted(entry.path.slice(1)), true);
    assert.deepEqual(entry.frames.map(frame => frame.phase), phases);
    let count = 0;
    for (const frame of entry.frames) {
      const [x, y, w, h] = frame.sourceRect;
      assert.ok(x >= 0 && y >= 0 && x + w <= image.width && y + h <= image.height);
      const alpha = alphaBounds(image, frame.sourceRect);
      assert.deepEqual(alpha.bounds, frame.bounds);
      assert.equal(alpha.edgeCount, 0);
      assert.equal(alpha.count, frame.alpha.nonzeroPixels);
      assert.deepEqual(alphaBounds(image, frame.sourceRect, 8).bounds, frame.bodyBoundsAlpha8);
      assert.deepEqual(alphaBounds(image, frame.sourceRect, 32).bounds, frame.bodyBoundsAlpha32);
      assert.equal(frame.rootY, frame.bodyBoundsAlpha32[3]);
      assert.ok(frame.rootX > frame.bodyBoundsAlpha32[0] && frame.rootX < frame.bodyBoundsAlpha32[2]);
      assert.equal(frame.density, entry.density);
      assert.equal(frame.sourceFacing, 1);
      count += alpha.count;
    }
    const whole = alphaBounds(image, [0, 0, image.width, image.height]);
    assert.equal(whole.count, count, 'All nonzero alpha is in exactly one phase cell.');
    assert.equal(whole.edgeCount, 0);
    near(entry.density * entry.authoredStaturePx, entry.neutralStaturePx);
  }
  for (const path of ['assets/openai/xeno-trials-v232/characters/private.png',
    'assets/openai/xeno-trials-v232/characters/deacon-special-atlas-v232.png']) assert.equal(admitted(path), false);
  for (const path of ['assets/openai/xeno-trials-v232/unreviewed', 'assets/openai/xeno-trials-v232/characters/nested'])
    assert.equal(admitted(path, { directory: true }), false);
  assert.equal(admitted('assets/openai/xeno-trials-v232/characters', { directory: true }), true);
});

for (const entry of manifest.files) {
  test(`${entry.fighterId} ${entry.action}: native hit and miss select exact Canvas crops without changing combat`, () => {
    const definition = getXenoTrialsFighterV96(entry.fighterId), art = getXenoTrialsArtV96(entry.fighterId);
    const authored = actions(definition, art).find(action => action.action === entry.action);
    assert.equal(authored.revision, 232);
    assert.equal(authored.density, entry.density);
    assert.equal(authored.source[2], entry.source.sha256);
    assert.deepEqual(authored.frames.map(frame => [frame.bounds, frame.rootX, frame.rootY]),
      entry.frames.map(frame => [frame.bounds, frame.rootX, frame.rootY]));
    assert.deepEqual(assets(definition, { ...art, sha256: 'forged' }), []);
    assert.deepEqual(assets(definition, { ...art, profileId: 'foreign' }), []);
    assert.deepEqual(assets(definition, { ...art, sourceFacing: -1 }), []);
    assert.deepEqual(assets({ ...definition, variant: 'foreign' }, art), []);
    if (entry.fighterId === 'mire-v209-bigchap')
      assert.deepEqual(assets(definition, { ...art, sourceRectV209: [256, 0, 256, 256] }), []);
    const other = entry.fighterId === 'mire-v209-bigchap' ? 'mire-v209-deacon' : 'mire-v209-bigchap';
    assert.ok(!assets({ id: other }, art).includes(entry.path));
    const live = liveCoverage(entry.fighterId).states[entry.action];
    assert.equal(historicalCoverage(entry.fighterId).states[entry.action].renderKind, 'static');
    assert.equal(live.renderKind, 'drawn');
    assert.deepEqual(live.frameIds, phases);
    assert.equal(liveCoverage(entry.fighterId).fullAnimation, false);
    assert.equal(liveCoverage(entry.fighterId).canonExact, false);
    const spec = getXenoTrialsAttackV147(definition, entry.action, XENO_TRIALS_ATTACKS_V96[entry.action]);
    const image = { complete: true, naturalWidth: entry.width, naturalHeight: entry.height };
    const images = new Map([[entry.path, image]]), calls = [];
    const context = { save() {}, restore() {}, translate(...args) { calls.push(['translate', ...args]); },
      scale(...args) { calls.push(['scale', ...args]); }, drawImage(...args) { calls.push(['drawImage', ...args]); } };
    for (const [gap, shouldHit] of [[20, true], [180, false]]) {
      const match = createXenoTrialsMatchV96({ playerId: entry.fighterId, opponentId: 'warrior', introSeconds: 0 });
      const [actor, rival] = match.fighters;
      rival.x += getXenoTrialsBodyBoundsV105(actor).right + gap - getXenoTrialsBodyBoundsV105(rival).left;
      const hp = rival.hp, unseen = structuredClone(match), seen = new Set();
      for (let tick = 1; tick <= 150; tick++) {
        const controls = { [entry.action]: tick === 1 };
        stepXenoTrialsMatchV96(match, STEP, controls, {});
        stepXenoTrialsMatchV96(unseen, STEP, controls, {});
        const receipt = draw(context, actor, art, images,
          { spec, groundedHeight: art.sourceHeight, ground: 450, x: actor.x });
        assert.equal(Boolean(receipt), Boolean(actor.attack));
        if (!receipt) continue;
        const frame = entry.frames[phases.indexOf(receipt.poseV209.phase)];
        const [left, top, right, bottom] = frame.bounds;
        assert.deepEqual(receipt.poseV209.sourceRect, [left, top, right - left, bottom - top]);
        const call = calls.at(-1);
        assert.deepEqual(call.slice(2, 6), [left, top, right - left, bottom - top]);
        near(call[7] + (frame.rootY - top) * entry.density, 0);
        near(call[6] + (frame.rootX - left) * entry.density, 0);
        seen.add(receipt.poseV209.phase);
      }
      assert.deepEqual([...seen], phases);
      assert.equal(rival.hp < hp, shouldHit);
      assert.deepEqual(match, unseen);
    }
    const options = { spec, groundedHeight: art.sourceHeight, ground: 450, x: 430 };
    const actor = { id: entry.fighterId, variant: null, y: 0, stun: 0,
      attack: { kind: entry.action, id: 1, age: spec.startup, facing: 1 } };
    for (const facing of [-1, 1]) {
      assert.ok(draw(context, { ...actor, attack: { ...actor.attack, facing } }, art, images, options));
      assert.deepEqual(calls.at(-2), ['scale', facing, 1]);
    }
    for (const patch of [{ y: 1 }, { stun: 1 }, { variant: 'foreign' }])
      assert.equal(draw(context, { ...actor, ...patch }, art, images, options), null);
    assert.equal(draw(context, actor, art, images, { ...options, reducedMotion: true }), null);
    assert.equal(draw(context, actor, art, new Map(), options), null);
    assert.equal(draw(context, actor, art, new Map([[entry.path, { ...image, complete: false }]]), options), null);
    assert.equal(draw(context, actor, art, new Map([[entry.path, { ...image, naturalHeight: 1 }]]), options), null);
  });
}

test('offline duels include the two action PNGs only for each admitted exact actor', () => {
  for (const id of ['mire-v209-bigchap', 'mire-v209-deacon']) {
    const expected = manifest.files.filter(entry => entry.fighterId === id).map(entry => entry.path).sort();
    assert.deepEqual(getXenoTrialsOfflineDuelV223({ playerId: id, opponentId: 'runner' }).assets
      .filter(path => path.startsWith(folder)).sort(), expected);
  }
  assert.deepEqual(getXenoTrialsOfflineDuelV223({ playerId: 'warrior', opponentId: 'runner' }).assets
    .filter(path => path.startsWith(folder)), []);
});
