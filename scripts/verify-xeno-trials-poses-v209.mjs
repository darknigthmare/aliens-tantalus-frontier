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

test('Arachnoid grey draws three reviewed source poses on the same grounded anchor and native heavy clock', () => {
  const paths = getXenoTrialsPoseAssetsV209();
  const images = new Map(paths.map(path => [path, { naturalWidth: 1774, naturalHeight: 887, complete: true }]));
  for (const path of paths) {
    const current = readFileSync(new URL('..' + path, import.meta.url));
    assert.deepEqual(current, readFileSync(new URL('..' + path.replace('v209', 'v206'), import.meta.url)));
  }
  const calls = [];
  const context = { save(){}, translate(){}, scale(...args){ calls.push(args); }, drawImage(...args){ calls.push(args); }, restore(){} };
  const fighter = { id: 'arachnoid', variant: 'grey', y: 0, stun: 0, attack: { id: 4, kind: 'heavy', age: .1, facing: -1 } };
  const art = getXenoTrialsArtV96('arachnoid', 'grey');
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

test('only the grounded active pounce selects the Arachnoid grey plate in native combat', async () => {
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
