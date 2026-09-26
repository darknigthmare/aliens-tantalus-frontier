import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, XENO_TRIALS_FACTIONS_V96 as factions, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsProgressV96, unlockXenoTrialsFighterV96, beginXenoTrialsV96,
  normalizeXenoTrialsProgressV96, getXenoTrialsUnlockCostV96 } from '../src/xeno-trials-progress-v96.js';
import { ENEMY_DEDICATED_BATCH_V97 } from '../src/enemy-dedicated-batch-v97.js';
import { releaseOriginV98 } from '../docs/references/v98-batch-050/verify-release.mjs';

test('V98 appends ten existing dedicated variants without changing any prior fighter statistics or price', () => {
  assert.equal(fighters.length, 43);
  assert.equal(createHash('sha256').update(JSON.stringify(fighters.slice(0, 33))).digest('hex'),
    'a28fe7195b163a85dcd8cff8c3cf0ff29b64650772c0b7c19885c73253c49e67');
  assert.equal(fighters.filter(f => f.family === 'synthetic').length, 11);
  const added = fighters.slice(33);
  assert.equal(added.filter(f => f.family === 'xenomorph').length, 8);
  for (const [i, fighter] of fighters.entries()) {
    assert.equal(getXenoTrialsUnlockCostV96(fighter.id), i < 3 ? 0 : 100 + i * 20);
    assert.equal(factions.filter(f => f.roster.includes(fighter.id)).length, 1, fighter.id);
  }
  for (const fighter of added) {
    assert.ok(ENEMY_DEDICATED_BATCH_V97.some(p => p.profileId === fighter.profileId));
    const art = getXenoTrialsArtV96(fighter.id);
    assert.equal(art.animationStatus, 'missing'); assert.equal(art.canonExact, false);
    assert.equal(art.frames, 1); assert.equal(art.profileId, fighter.profileId);
  }
});
test('all ten newcomers can be unlocked and saved as pending duels without granting them for free', () => {
  for (const fighter of fighters.slice(33)) {
    const initial = createXenoTrialsProgressV96();
    assert.equal(unlockXenoTrialsFighterV96(initial, fighter.id).applied, false);
    initial.credits = getXenoTrialsUnlockCostV96(fighter.id);
    const unlocked = unlockXenoTrialsFighterV96(initial, fighter.id);
    assert.equal(unlocked.applied, true); assert.equal(unlocked.state.credits, 0);
    assert.equal(unlockXenoTrialsFighterV96(unlocked.state, fighter.id).applied, false);
    const duel = beginXenoTrialsV96(unlocked.state, { playerId: fighter.id, opponentId: 'defender', roundSeconds: 99 });
    assert.equal(duel.applied, true);
    const restored = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(duel.state)));
    assert.equal(restored.pending.config.playerId, fighter.id); assert.equal(restored.pending.config.roundSeconds, 99);
  }
});
test('V98 release verifier only accepts this production origin and loopback', () => {
  for (const url of ['http://127.0.0.1:4307', 'http://localhost:4306', 'https://aliens-tantalus-frontier.vercel.app'])
    assert.equal(releaseOriginV98(url), new URL(url).origin);
  for (const url of ['https://foreign.vercel.app', 'http://aliens-tantalus-frontier.vercel.app',
    'https://aliens-tantalus-frontier.vercel.app/x', 'https://user:pass@aliens-tantalus-frontier.vercel.app',
    'https://aliens-tantalus-frontier.vercel.app?override=1', 'file:///tmp']) assert.throws(() => releaseOriginV98(url));
});
