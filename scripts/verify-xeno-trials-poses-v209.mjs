import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_ATTACKS_V96,
  XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { drawXenoTrialsPoseV209, getXenoTrialsPoseAssetsV209 } from '../src/xeno-trials-poses-v209.js';
import { getXenoTrialsAttackV147, getXenoTrialsSpecialStyleV147 } from '../src/xeno-trials-signatures-v147.js';
import { publicXenoPosePathAdmissionV209, verifyXenoPoseAdmissionsV209 } from './public-xeno-pose-admissions-v209.mjs';
import { fileURLToPath } from 'node:url';
import { getXenoTrialsAnimationCoverageV199, getXenoTrialsRuntimeAnimationCoverage } from '../src/xeno-trials-animation-coverage-v199.js';

test('Arachnoid grey draws three reviewed source poses on the same grounded anchor and native heavy clock', () => {
  const fighter = { id: 'arachnoid', variant: 'grey', y: 0, stun: 0, attack: { id: 4, kind: 'heavy', age: .1, facing: -1 } };
  const art = getXenoTrialsArtV96('arachnoid', 'grey');
  const paths = getXenoTrialsPoseAssetsV209(fighter, art).filter(path => path.includes('/arachnoid-heavy-'));
  const images = new Map(paths.map(path => [path, { naturalWidth: 1774, naturalHeight: 887, complete: true }]));
  for (const path of paths) {
    const current = readFileSync(new URL('..' + path, import.meta.url));
    assert.deepEqual(current, readFileSync(new URL('..' + path.replace('v209', 'v206'), import.meta.url)));
  }
  const calls = [];
  const context = { save(){}, translate(){}, scale(...args){ calls.push(args); }, drawImage(...args){ calls.push(args); }, restore(){} };
  const options = { spec: { startup: .23, active: .1, recovery: .39 }, groundedHeight: 136, ground: 450, x: 430 };
  for (const [age, phase] of [[.08, 'windup'], [.25, 'contact'], [.44, 'recovery']]) {
    fighter.attack.age = age;
    const result = drawXenoTrialsPoseV209(context, fighter, art, images, options);
    assert.equal(result.poseV209.phase, phase);
    assert.equal(result.poseV209.attackId, fighter.attack.id);
    assert.deepEqual(calls.at(-2), [-1, 1]);
    const draw = calls.at(-1);
    assert.equal(draw[6] + draw[8], 0);
  }
  assert.equal(drawXenoTrialsPoseV209(context, fighter, art, images, { ...options, reducedMotion: true }), null);
  assert.equal(drawXenoTrialsPoseV209(context, { ...fighter, y: 10 }, art, images, options), null);
  assert.equal(drawXenoTrialsPoseV209(context, { ...fighter, variant: 'purple' }, art, images, options), null);
  assert.equal(drawXenoTrialsPoseV209(context, fighter, art, new Map(), options), null);
});

test('Arachnoid Grey draws its admitted grounded contact plate when the other pounce images are absent', async () => {
  const path = '/assets/openai/xeno-trials-v209/characters/arachnoid-special-active-grounded.png';
  const imageBytes = readFileSync(new URL('..' + path, import.meta.url));
  const image = { naturalWidth: imageBytes.readUInt32BE(16), naturalHeight: imageBytes.readUInt32BE(20), complete: true };
  assert.deepEqual([image.naturalWidth, image.naturalHeight, imageBytes[25]], [1774, 887, 6]);
  const images = new Map([[path, image]]);
  await verifyXenoPoseAdmissionsV209(fileURLToPath(new URL('..', import.meta.url)));
  assert.equal(publicXenoPosePathAdmissionV209(path.slice(1)), true);
  assert.equal(publicXenoPosePathAdmissionV209(path.slice(1).replace('-grounded', '')), false);

  const match = createXenoTrialsMatchV96({ playerId: 'arachnoid', opponentId: 'warrior', introSeconds: 0 });
  const [fighter, opponent] = match.fighters;
  opponent.x += getXenoTrialsBodyBoundsV105(fighter).right + 150 - getXenoTrialsBodyBoundsV105(opponent).left;
  const initialX = fighter.x, initialHealth = opponent.hp;
  const definition = getXenoTrialsFighterV96(fighter.id);
  assert.equal(getXenoTrialsSpecialStyleV147(definition), 'pounce');
  const spec = getXenoTrialsAttackV147(definition, 'special', XENO_TRIALS_ATTACKS_V96.special);
  const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
  assert.ok(getXenoTrialsPoseAssetsV209(fighter, art).includes(path));
  assert.equal(getXenoTrialsPoseAssetsV209({ ...fighter, variant: 'purple' }, art).length, 0);
  const calls = [];
  const context = { save() {}, translate() {}, scale() {}, drawImage(...args) { calls.push(args); }, restore() {} };
  const options = { spec, groundedHeight: art.sourceHeight * .135, ground: 450, x: initialX };
  let activeFrames = 0;
  for (let tick = 1; tick <= 110; tick++) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { special: tick === 1 }, {});
    const pose = drawXenoTrialsPoseV209(context, fighter, art, images, { ...options, x: fighter.x });
    const isActive = fighter.attack && fighter.attack.age >= spec.startup && fighter.attack.age < spec.startup + spec.active;
    assert.equal(Boolean(pose), Boolean(isActive));
    if (!pose) continue;
    activeFrames++;
    assert.equal(fighter.y, 0);
    assert.equal(pose.animation, 'painted-grounded-pounce');
    assert.equal(pose.poseV209.path, path);
    assert.equal(pose.poseV209.attackId, fighter.attack.id);
    assert.deepEqual(pose.poseV209.sourceRect, [28, 243, 1709, 529]);
    const draw = calls.at(-1);
    assert.equal(draw[0], image);
    assert.equal(draw[6] + draw[8], 0);
    assert.equal(draw[7], 1709 * .135);
  }
  assert.ok(activeFrames > 0 && opponent.hp < initialHealth && fighter.x > initialX);

  const active = { ...fighter, attack: { kind: 'special', id: 1, age: spec.startup, facing: -1 } };
  assert.ok(drawXenoTrialsPoseV209(context, active, art, images, options));
  for (const change of [{ y: 1 }, { stun: .1 }, { variant: 'purple' }, { variant: 'unknown' }])
    assert.equal(drawXenoTrialsPoseV209(context, { ...active, ...change }, art, images, options), null);
  assert.equal(drawXenoTrialsPoseV209(context, active, { ...art, profileId: 'alternate' }, images, options), null);
  assert.equal(drawXenoTrialsPoseV209(context, active, art, new Map([[path, { ...image, naturalHeight: 888 }]]), options), null);
  assert.equal(drawXenoTrialsPoseV209(context, active, art, images, { ...options, reducedMotion: true }), null);
});

test('Panther special admits exactly three reviewed V206 plates and advertises this grounded action only', () => {
  const fighter = getXenoTrialsFighterV96('panther'), art = getXenoTrialsArtV96('panther');
  const paths = getXenoTrialsPoseAssetsV209(fighter, art).filter(path => path.includes('/panther-special-'));
  assert.deepEqual(paths.map(path => path.split('/').at(-1)),
    ['panther-special-windup.png', 'panther-special-active.png', 'panther-special-recovery.png']);
  for (const path of paths) {
    const bytes = readFileSync(new URL('..' + path, import.meta.url));
    assert.deepEqual(bytes, readFileSync(new URL('..' + path.replace('v209', 'v206'), import.meta.url)));
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20), bytes[25]], [1536, 1024, 6]);
    assert.equal(publicXenoPosePathAdmissionV209(path.slice(1)), true);
  }
  const tribute = getXenoTrialsFighterV96('drive-v123-neca-panther-kenner-tribute-v14');
  assert.deepEqual(getXenoTrialsPoseAssetsV209(tribute, getXenoTrialsArtV96(tribute.id)), []);
  assert.deepEqual(getXenoTrialsPoseAssetsV209(fighter, { ...art, sha256: 'other' }), []);
  assert.equal(publicXenoPosePathAdmissionV209(paths[0].slice(1).replace('special-windup', 'light-impact')), false);
  const historical = getXenoTrialsAnimationCoverageV199(fighter);
  const live = getXenoTrialsRuntimeAnimationCoverage(fighter);
  assert.equal(historical.states.special.renderKind, 'static');
  assert.equal(live.states.special.renderKind, 'drawn');
  assert.deepEqual(live.states.special.sources[0].paths, paths);
  assert.deepEqual(live.states.special.frameIds, ['windup', 'contact', 'recovery']);
  assert.equal(live.fullAnimation, false);
  assert.equal(live.canonExact, false);
  assert.equal(getXenoTrialsRuntimeAnimationCoverage(tribute).states.special.renderKind, 'static');
});

test('Panther pounce plays all three grounded phases at one scale through a real hit and a miss', () => {
  const definition = getXenoTrialsFighterV96('panther'), art = getXenoTrialsArtV96('panther');
  const paths = getXenoTrialsPoseAssetsV209(definition, art).filter(path => path.includes('/panther-special-'));
  const spec = getXenoTrialsAttackV147(definition, 'special', XENO_TRIALS_ATTACKS_V96.special);
  assert.equal(getXenoTrialsSpecialStyleV147(definition), 'pounce');
  const image = { naturalWidth: 1536, naturalHeight: 1024, complete: true };
  const images = new Map(paths.map(path => [path, image]));
  const rects = [[82, 58, 1396, 894], [50, 56, 1454, 900], [89, 51, 1356, 929]];
  const calls = [];
  const context = { save() {}, translate() {}, scale(...args) { calls.push(args); }, drawImage(...args) { calls.push(args); }, restore() {} };
  for (const [gap, shouldHit] of [[150, true], [180, false]]) {
    const match = createXenoTrialsMatchV96({ playerId: 'panther', opponentId: 'warrior', introSeconds: 0 });
    const [actor, rival] = match.fighters;
    rival.x += getXenoTrialsBodyBoundsV105(actor).right + gap - getXenoTrialsBodyBoundsV105(rival).left;
    const initialX = actor.x, hp = rival.hp;
    const noDraw = structuredClone(match);
    const seen = new Set();
    const options = { spec, groundedHeight: art.sourceHeight, ground: 450, x: actor.x };
    for (let tick = 1; tick <= 120; tick++) {
      const controls = { special: tick === 1 };
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, controls, {});
      stepXenoTrialsMatchV96(noDraw, XENO_TRIALS_STEP_V96, controls, {});
      const receipt = drawXenoTrialsPoseV209(context, actor, art, images, { ...options, x: actor.x });
      assert.equal(Boolean(receipt), Boolean(actor.attack));
      if (!receipt) continue;
      assert.equal(actor.y, 0);
      assert.equal(receipt.animation, 'three-painted-panther-pounce-poses');
      const age = actor.attack.age, phase = age < spec.startup ? 0 : age < spec.startup + spec.active ? 1 : 2;
      seen.add(receipt.poseV209.phase);
      assert.equal(receipt.poseV209.path, paths[phase]);
      assert.equal(receipt.poseV209.attackId, actor.attack.id);
      assert.deepEqual(receipt.poseV209.sourceRect, rects[phase]);
      const draw = calls.at(-1);
      assert.equal(draw[6] + draw[8], 0);
      assert.equal(draw[7], rects[phase][2] * .77);
    }
    assert.deepEqual([...seen], ['windup', 'contact', 'recovery']);
    assert.ok(actor.x > initialX);
    assert.equal(rival.hp < hp, shouldHit);
    assert.deepEqual(match, noDraw);
  }

  const active = { id: definition.id, variant: null, y: 0, stun: 0, attack: { kind: 'special', id: 1, age: spec.startup, facing: -1 } };
  const options = { spec, groundedHeight: art.sourceHeight, ground: 450, x: 430 };
  assert.ok(drawXenoTrialsPoseV209(context, active, art, images, options));
  assert.deepEqual(calls.at(-2), [-1, 1]);
  assert.equal(drawXenoTrialsPoseV209(context, { ...active, y: 1 }, art, images, options), null);
  assert.equal(drawXenoTrialsPoseV209(context, { ...active, attack: { ...active.attack, kind: 'signature-2' } }, art, images, options), null);
  assert.equal(drawXenoTrialsPoseV209(context, active, art, new Map(), options), null);
  assert.equal(drawXenoTrialsPoseV209(context, active, art, images, { ...options, reducedMotion: true }), null);
});

const addedActions = [
  { id: 'grid', action: 'heavy', dimensions: [1774, 887], reachCases: [[70, true], [90, false]],
    frames: [null, ['grid-heavy-impact.png', 205, [17, 51, 1748, 809]], ['grid-heavy-recovery.png', 206, [157, 39, 1305, 808]]],
    forbidden: 'grid-heavy-windup.png', animation: 'painted-grid-heavy-poses' },
  { id: 'gorilla', action: 'special', style: 'ram', travels: true, dimensions: [1254, 1254], reachCases: [[155, true], [195, false]],
    frames: [['gorilla-special-windup.png', 206, [69, 166, 1119, 923]], null, ['gorilla-special-recovery.png', 206, [44, 116, 1150, 917]]],
    forbidden: 'gorilla-heavy-impact.png', animation: 'painted-gorilla-ram-poses' },
  { id: 'arachnoid', variant: 'grey', action: 'light', dimensions: [1536, 1024], reachCases: [[55, true], [65, false]],
    frames: [['arachnoid-light-windup.png', 205, [148, 25, 1220, 981]], ['arachnoid-light-impact.png', 205, [83, 119, 1617, 710], [1774, 887]],
      ['arachnoid-light-recovery.png', 205, [219, 19, 1083, 990]]], forbidden: 'arachnoid-special-active.png', animation: 'painted-arachnoid-light-poses' },
  { id: 'panther', action: 'light', dimensions: [1536, 1024], density: .80, reachCases: [[45, true], [62, false]],
    frames: [['panther-light-windup.png', 206, [109, 45, 1232, 887]], null, ['panther-light-recovery.png', 206, [168, 32, 1260, 950]]],
    forbidden: 'panther-light-impact.png', animation: 'painted-panther-light-poses' },
  { id: 'arachnoid', variant: 'grey', action: 'special', style: 'pounce', travels: true, dimensions: [1536, 1024],
    reachCases: [[150, true], [190, false]], frames: [['arachnoid-special-windup.png', 205, [129, 65, 1190, 916]],
      ['arachnoid-special-active-grounded.png', 206, [28, 243, 1709, 529], [1774, 887]],
      ['arachnoid-special-recovery.png', 205, [172, 45, 1175, 935]]],
    forbidden: 'arachnoid-special-active.png', animation: 'painted-grounded-pounce' },
  { id: 'grid', action: 'special', style: 'tail', dimensions: [1774, 887], reachCases: [[112, true], [125, false]],
    frames: [['grid-special-windup.png', 206, [231, 21, 1426, 801]], null, ['grid-special-recovery.png', 206, [307, 48, 1188, 775]]],
    forbidden: 'grid-special-active.png', animation: 'painted-grid-tail-poses' }
];
const phases = ['windup', 'contact', 'recovery'];
const publicDirectory = '/assets/openai/xeno-trials-v209/characters/';
for (const { id, variant = null, action, style, travels = false, dimensions, density = 1, reachCases, frames, forbidden, animation } of addedActions) {
  test(`${id} ${action} advertises its exact painted phases and plays them through native hit and miss`, () => {
    const definition = getXenoTrialsFighterV96(id), art = getXenoTrialsArtV96(id, variant);
    const actorId = { id, variant };
    const paths = getXenoTrialsPoseAssetsV209(actorId, art).filter(path => path.includes(`/${id}-${action}-`));
    const phasesDrawn = phases.filter((_, index) => frames[index]);
    assert.deepEqual(paths, frames.filter(Boolean).map(([name]) => publicDirectory + name));
    assert.ok(getXenoTrialsPoseAssetsV209(actorId, { ...art, sha256: 'other' }).every(path => !paths.includes(path)));
    assert.ok(getXenoTrialsPoseAssetsV209({ id, variant: 'altered' }, art).every(path => !paths.includes(path)));
    if (variant === 'grey') {
      assert.deepEqual(getXenoTrialsPoseAssetsV209({ id, variant: 'purple' }, getXenoTrialsArtV96(id, 'purple')), []);
    }
    assert.equal(publicXenoPosePathAdmissionV209((publicDirectory + forbidden).slice(1)), false);
    const historical = getXenoTrialsAnimationCoverageV199(id), live = getXenoTrialsRuntimeAnimationCoverage(id);
    assert.equal(historical.states[action].renderKind, 'static');
    assert.equal(live.states[action].renderKind, 'drawn');
    assert.deepEqual(live.states[action].frameIds, phasesDrawn);
    assert.deepEqual(live.states[action].sources[0].paths, paths);
    assert.ok(live.drawnStates.includes(action));
    assert.equal(live.canonExact, false);
    assert.equal(live.fullAnimation, false);

    const images = new Map();
    for (const [name, source, , frameDimensions = dimensions] of frames.filter(Boolean)) {
      const path = publicDirectory + name;
      const bytes = readFileSync(new URL('..' + path, import.meta.url));
      assert.deepEqual(bytes, readFileSync(new URL('..' + path.replace('v209', `v${source}`), import.meta.url)));
      const [naturalWidth, naturalHeight] = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
      assert.deepEqual([naturalWidth, naturalHeight, bytes[25]], [...frameDimensions, 6]);
      images.set(path, { naturalWidth, naturalHeight, complete: true });
    }
    const spec = getXenoTrialsAttackV147(definition, action, XENO_TRIALS_ATTACKS_V96[action]);
    if (style) assert.equal(getXenoTrialsSpecialStyleV147(definition), style);
    const context = { save() {}, translate() {}, scale() {},
      drawImage(_image, _sx, _sy, w, h, _x, y, dw, dh) { assert.deepEqual([y + dh, dw, dh], [0, w * density, h * density]); }, restore() {} };
    for (const [gap, shouldHit] of reachCases) {
      const match = createXenoTrialsMatchV96({ playerId: id, playerVariant: variant, opponentId: 'warrior', introSeconds: 0 });
      const [actor, rival] = match.fighters;
      const hp = rival.hp, initialX = actor.x;
      rival.x += getXenoTrialsBodyBoundsV105(actor).right + gap - getXenoTrialsBodyBoundsV105(rival).left;
      const noDraw = structuredClone(match), seen = new Set();
      for (let tick = 1; tick <= 120; tick++) {
        const controls = { [action]: tick === 1 };
        stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, controls, {});
        stepXenoTrialsMatchV96(noDraw, XENO_TRIALS_STEP_V96, controls, {});
        const age = actor.attack?.age;
        const phase = age < spec.startup ? 0 : age < spec.startup + spec.active ? 1 : 2;
        const frame = actor.attack && frames[phase];
        const pose = drawXenoTrialsPoseV209(context, actor, art, images,
          { spec, groundedHeight: art.sourceHeight, ground: 450, x: actor.x });
        assert.equal(Boolean(pose), Boolean(frame));
        if (!pose) continue;
        assert.equal(actor.y, 0);
        assert.equal(pose.animation, animation);
        assert.equal(pose.poseV209.phase, phases[phase]);
        assert.equal(pose.poseV209.path, publicDirectory + frame[0]);
        assert.deepEqual(pose.poseV209.sourceRect, frame[2]);
        seen.add(pose.poseV209.phase);
      }
      assert.deepEqual([...seen], phasesDrawn);
      assert.equal(rival.hp < hp, shouldHit);
      assert.equal(actor.x > initialX, travels);
      assert.deepEqual(match, noDraw);
    }
  });
}
