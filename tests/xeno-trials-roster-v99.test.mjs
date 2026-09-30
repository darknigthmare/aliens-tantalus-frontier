import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, XENO_TRIALS_FACTIONS_V96 as factions,
  XENO_TRIALS_STAGES_V96 as stages, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsProgressV96, unlockXenoTrialsFighterV96, beginXenoTrialsV96,
  normalizeXenoTrialsProgressV96, getXenoTrialsUnlockCostV96 } from '../src/xeno-trials-progress-v96.js';
import { ENEMY_DEDICATED_BATCH_V98 } from '../src/enemy-dedicated-batch-v98.js';
import { ENEMY_DEDICATED_BATCH_V99 } from '../src/enemy-dedicated-batch-v99.js';
import { releaseOriginV99 } from '../docs/references/v99-batch-050/verify-release.mjs';

test('V99 adds eight xenomorphs and two synthetics without changing the historical 43 records', () => {
  assert.equal(fighters.length, 53);
  assert.equal(createHash('sha256').update(JSON.stringify(fighters.slice(0, 43))).digest('hex'),
    'f393140a14813731b7472b106ed139e92bbab5c2246eaa83a4d53c72eb6d8049');
  assert.equal(fighters.filter(f => f.family === 'synthetic').length, 13);
  const added = fighters.slice(43);
  assert.equal(added.filter(f => f.family === 'xenomorph').length, 8);
  const admitted = [...ENEMY_DEDICATED_BATCH_V98, ...ENEMY_DEDICATED_BATCH_V99];
  for (const [index, fighter] of fighters.entries()) {
    assert.equal(getXenoTrialsUnlockCostV96(fighter.id), index < 3 ? 0 : 100 + index * 20);
    assert.equal(factions.filter(f => f.roster.includes(fighter.id)).length, 1, fighter.id);
  }
  assert.equal(new Set(fighters.map(f => f.id)).size, 53);
  for (const fighter of added) {
    assert.ok(admitted.some(p => p.profileId === fighter.profileId), fighter.id);
    const art = getXenoTrialsArtV96(fighter.id);
    assert.equal(art.animationStatus, 'missing'); assert.equal(art.frames, 1);
    assert.equal(art.canonExact, false); assert.equal(art.profileId, fighter.profileId);
  }
});

test('V99 newcomers require their price and survive save normalization in each new arena', () => {
  for (const fighter of fighters.slice(43)) {
    for (const stage of stages.slice(3)) {
      const initial = createXenoTrialsProgressV96();
      assert.equal(unlockXenoTrialsFighterV96(initial, fighter.id).applied, false);
      initial.credits = getXenoTrialsUnlockCostV96(fighter.id);
      const unlocked = unlockXenoTrialsFighterV96(initial, fighter.id);
      assert.equal(unlocked.applied, true); assert.equal(unlocked.state.credits, 0);
      assert.equal(unlockXenoTrialsFighterV96(unlocked.state, fighter.id).applied, false);
      const duel = beginXenoTrialsV96(unlocked.state, { playerId: fighter.id, opponentId: 'defender', stageId: stage.id, roundSeconds: 75 });
      assert.equal(duel.applied, true);
      const restored = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(duel.state)));
      assert.equal(restored.pending.config.playerId, fighter.id);
      assert.equal(restored.pending.config.stageId, stage.id);
      assert.equal(restored.pending.config.roundSeconds, 75);
    }
  }
});

test('V99 arena IDs are unique, retain the three historical skins and reuse only explicit project art', () => {
  assert.deepEqual(stages.slice(0, 3), [
    { id: 'containment-deck', label: 'Banc de confinement', background: '#101d24', accent: '#48aab1', floor: '#23343c' },
    { id: 'reactor-ring', label: 'Anneau réacteur simulé', background: '#241a18', accent: '#ce7645', floor: '#42302c' },
    { id: 'hive-vault', label: 'Chambre de ruche simulée', background: '#191b23', accent: '#9970b7', floor: '#302b38' }
  ]);
  assert.equal(stages.length, 6); assert.equal(new Set(stages.map(s => s.id)).size, 6);
  assert.deepEqual(stages.slice(3).map(s => s.backdrop), [
    '/assets/openai/metroidvania/zones/ship-command-far.png',
    '/assets/openai/metroidvania/zones/ship-cargo-far.png',
    '/assets/openai/metroidvania/planet-exterior-far.png'
  ]);
});

test('V99 release checks cannot target another deployment or authenticated URL', () => {
  for (const url of ['http://127.0.0.1:4307', 'http://localhost:4306', 'https://aliens-tantalus-frontier.vercel.app'])
    assert.equal(releaseOriginV99(url), new URL(url).origin);
  for (const url of ['https://foreign.vercel.app', 'http://aliens-tantalus-frontier.vercel.app',
    'https://aliens-tantalus-frontier.vercel.app/x', 'https://user:pass@aliens-tantalus-frontier.vercel.app',
    'https://aliens-tantalus-frontier.vercel.app?override=1', 'file:///tmp']) assert.throws(() => releaseOriginV99(url));
});
