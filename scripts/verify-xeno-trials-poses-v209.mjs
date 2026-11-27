import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { drawXenoTrialsPoseV209, getXenoTrialsPoseAssetsV209 } from '../src/xeno-trials-poses-v209.js';

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
