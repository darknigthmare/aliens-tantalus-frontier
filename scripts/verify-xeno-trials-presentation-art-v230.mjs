import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { XENO_TRIALS_PRESENTATION_PLATES_V230 as plates, getXenoTrialsPresentationPlateV230 as get } from '../src/xeno-trials-presentation-art-v230.js';
import { getXenoTrialsOfflineDuelV223 } from '../src/xeno-trials-offline-v223.js';
import { publicXenoPresentationAdmissionV230 as admitted, verifyXenoPresentationAdmissionsV230 } from './public-xeno-presentation-admissions-v230.mjs';

test('two byte-pinned native PNG plates preserve exact identity and finite measured support geometry', async () => {
  await verifyXenoPresentationAdmissionsV230(new URL('../', import.meta.url).pathname);
  assert.equal(plates.length, 2);
  for (const plate of plates) {
    const bytes = readFileSync(new URL('..' + plate.path, import.meta.url));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), plate.sourceWidth);
    assert.equal(bytes.readUInt32BE(20), plate.sourceHeight);
    const [left, top, right, bottom] = plate.alphaBounds;
    assert.ok(left > 0 && top > 0 && right < plate.sourceWidth && bottom < plate.sourceHeight);
    assert.ok(plate.rootX > left && plate.rootX < right && plate.rootY >= bottom - 2 && plate.rootY <= bottom);
    assert.ok(Number.isFinite(plate.statureHeight) && plate.statureHeight > 0 && plate.density > 0);
    assert.equal(plate.canonExact, false);
    assert.equal(get(plate.kind, plate.fighterId, plate.variant), plate);
    assert.equal(get(plate.kind, 'runner'), null);
    assert.equal(get(plate.kind, 'warrior', 'purple'), null);
  }
  assert.equal(get('victory', 'warrior'), null);
  assert.equal(admitted('assets/openai/xeno-trials-v230/private.png'), false);
  assert.equal(admitted('assets/openai/xeno-trials-v230/nested', { directory: true }), false);
});

test('downloadable Warrior duel includes both presentation plates; another identity cannot borrow them', () => {
  const warrior = getXenoTrialsOfflineDuelV223({ playerId: 'warrior', opponentId: 'runner' });
  for (const plate of plates) assert.ok(warrior.assets.includes(plate.path));
  const runners = getXenoTrialsOfflineDuelV223({ playerId: 'runner', opponentId: 'runner' });
  for (const plate of plates) assert.ok(!runners.assets.includes(plate.path));
});
