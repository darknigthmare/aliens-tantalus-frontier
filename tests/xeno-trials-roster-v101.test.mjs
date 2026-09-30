import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, XENO_TRIALS_FACTIONS_V96 as factions,
  XENO_TRIALS_STAGES_V96 as stages, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { ENEMIES } from '../src/content-core-v50.js';
import { ENEMY_USER_CREATIONS_V95 } from '../src/enemy-user-creations-v95.js';
import { ENEMY_DEDICATED_BATCH_V98 } from '../src/enemy-dedicated-batch-v98.js';
import { ENEMY_DEDICATED_BATCH_V99 } from '../src/enemy-dedicated-batch-v99.js';
import { getBioforgeRosterEntryV80 } from '../src/bioforge-session-v80.js';
import { createXenoTrialsProgressV96, unlockXenoTrialsFighterV96, beginXenoTrialsV96,
  normalizeXenoTrialsProgressV96, getXenoTrialsUnlockCostV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, nextXenoTrialsRoundV96,
  XENO_TRIALS_STEP_V96 as STEP, XENO_TRIALS_ARENA_V96 as ARENA } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsRenderMetricsV96 } from '../src/xeno-trials-runtime-v96.js';
import { auditPngBuffer } from '../docs/references/v91-enemy-only/audit-candidate-png.mjs';

const added = fighters.slice(53, 103);
const sha = value => createHash('sha256').update(value).digest('hex');
const historicalIds = new Set(fighters.slice(0, 53).map(entry => entry.id));
const expectedIds = [
  'user-antilope', 'user-brute', 'user-carrier', 'user-spiker', 'user-warrior-red',
  'user-phantera-black', 'user-rhino', 'user-chameleon', 'user-chameleon-2', 'user-trex-king',
  'user-trex-queen', 'user-big-xeno', 'user-pale-spined', 'user-tiger-biped', 'user-raised-crest',
  'user-bulbous-quadruped', 'user-black-bone-raptor', 'user-blue-violet-biped', 'user-skeletal-quadruped', 'user-red-horned',
  'cryo-runner', 'cryo-crusher', 'cryo-lurker', 'cryo-ravager', 'cryo-boiler', 'cryo-burster',
  'cryo-monica', 'cryo-ripper', 'cryo-ripper-queen', 'cryo-foundry-crusher', 'cryo-reef-stalker',
  'cryo-pale-hunter', 'cryo-dust-runner', 'cryo-salvage-brute', 'cryo-caravan-stalker', 'cryo-joe', 'cryo-combat-synth',
  'armored-foundry-crusher', 'armored-reef-stalker', 'armored-pale-hunter', 'armored-dust-runner',
  'armored-salvage-brute', 'armored-caravan-stalker', 'acid-queen', 'acid-crusher', 'acid-burster',
  'acid-k-series', 'acid-ripper', 'acid-ripper-queen', 'acid-foundry-crusher'
];

test('V101 appends exactly 50 identities while preserving all 53 historical records, prices and factions', () => {
  assert.equal(fighters.length, 103);
  assert.deepEqual(added.map(entry => entry.id), expectedIds);
  assert.equal(sha(JSON.stringify(fighters.slice(0, 53))), 'fdd646fef719f3b32a17db88712556095503bfe3cd6eadf8b15f9634df759cd7');
  assert.equal(sha(JSON.stringify(factions.map(faction => ({ ...faction,
    roster: faction.roster.filter(id => historicalIds.has(id)) })))), '232312c999c89f672da538670130910e6618d6bfd4b14cf21545a3718ee9a189');
  assert.equal(new Set(fighters.map(entry => entry.id)).size, 103);
  assert.equal(new Set(fighters.map(entry => entry.profileId)).size, 103);
  assert.equal(added.filter(entry => entry.family === 'xenomorph').length, 48);
  assert.equal(added.filter(entry => entry.family === 'synthetic').length, 2);
  assert.equal(fighters.filter(entry => entry.family === 'synthetic').length, 15);
  for (const [index, entry] of fighters.entries()) {
    assert.equal(getXenoTrialsUnlockCostV96(entry.id), index < 3 ? 0 : 100 + index * 20);
    assert.equal(factions.filter(faction => faction.roster.includes(entry.id)).length, 1, entry.id);
  }
});

test('V101 exclusively selects existing admitted terrestrial adult xeno/synths, never V100 dossiers or held candidates', () => {
  const user = new Map(ENEMY_USER_CREATIONS_V95.map(entry => [entry.id, entry]));
  const dedicated = new Map([...ENEMY_DEDICATED_BATCH_V98, ...ENEMY_DEDICATED_BATCH_V99].map(entry => [entry.profileId, entry]));
  assert.equal(added.filter(entry => user.has(entry.profileId)).length, 20);
  assert.equal(added.filter(entry => ENEMY_DEDICATED_BATCH_V98.some(pose => pose.profileId === entry.profileId)).length, 13);
  assert.equal(added.filter(entry => ENEMY_DEDICATED_BATCH_V99.some(pose => pose.profileId === entry.profileId)).length, 17);
  for (const entry of added) {
    const art = getXenoTrialsArtV96(entry.id);
    const source = user.get(entry.profileId) || ENEMIES.find(profile => profile.id === entry.profileId);
    assert.ok(source, entry.id);
    assert.equal(entry.family, source.biology);
    assert.ok(['xenomorph', 'synthetic'].includes(source.biology));
    assert.ok(!['egg', 'parasite', 'juvenile'].includes(source.caste));
    assert.ok(user.has(entry.profileId) || dedicated.has(entry.profileId));
    assert.ok(['ground', 'terrestrial'].includes(art.locomotion));
    assert.equal(getBioforgeRosterEntryV80(entry.profileId).terrestrial, true);
    assert.notEqual(art.groundContact, false);
    assert.notEqual(art.bioforgeEligible, false);
    assert.equal(art.reviewStatus, 'accepted-static-adaptation');
    assert.equal(art.visualMode, 'static-pose');
    assert.equal(art.animationStatus, 'missing');
    if (art.frames !== undefined) assert.equal(art.frames, 1);
    assert.equal(art.canonExact, false);
    assert.equal(art.profileId, entry.profileId);
    assert.doesNotMatch(entry.profileId, /ovomorph|facehugger|chestburster|winged|aquatic|ceto|human|armor-male|armor-female/);
    assert.match(art.path, /^\/assets\/openai\/sprites\/static-enemy-v(95|98|99)\//);
    assert.equal(getXenoTrialsArtV96(entry.id, 'purple'), art, 'no foreign Arachnoid palette');
  }
  const carrier = getXenoTrialsArtV96('user-carrier');
  assert.equal(carrier.defaultStateId, 'full');
  assert.equal(carrier.states.length, 0, 'no invented empty Carrier');
  assert.equal(getXenoTrialsArtV96('user-big-xeno').id, 'pose-v95-user-xeno-big-xeno-1');
});

test('V101 reuses 50 distinct native PNGs with matching hash, alpha, proportions and complete bounds', async () => {
  const paths = new Set(), hashes = new Set();
  for (const entry of added) {
    const art = getXenoTrialsArtV96(entry.id);
    const bytes = await readFile(new URL(`../${art.path.slice(1)}`, import.meta.url));
    const audit = auditPngBuffer(bytes);
    assert.equal(sha(bytes), art.sha256, entry.id);
    assert.equal(audit.width, art.sourceWidth); assert.equal(audit.height, art.sourceHeight);
    assert.equal(audit.alphaMin, 0);
    assert.ok(audit.alpha0 / audit.totalPixels > .2);
    assert.deepEqual(audit.bboxAlphaAtLeast16, art.alphaBounds);
    const [left, top, right, bottom] = art.alphaBounds;
    assert.ok(left > 0 && top > 0 && right < audit.width && bottom < audit.height);
    assert.ok(art.pivot.x * audit.width >= left && art.pivot.x * audit.width <= right);
    assert.ok(art.pivot.y * audit.height >= top && art.pivot.y * audit.height <= bottom + 1);
    paths.add(art.path); hashes.add(art.sha256);
  }
  assert.equal(paths.size, 50); assert.equal(hashes.size, 50);
});

test('V101 whole-pose metrics fit the arena walls, floor and HUD for both facings at peak jump', () => {
  for (const entry of added) {
    const art = getXenoTrialsArtV96(entry.id), layout = getXenoTrialsRenderMetricsV96(entry.id);
    assert.ok(layout.width > 0 && layout.height > 0 && layout.height <= 220 + 1e-9);
    assert.ok(Math.abs(layout.width / layout.height - art.sourceWidth / art.sourceHeight) < 1e-10);
    assert.ok(450 - entry.jump ** 2 / (2 * 1450) - layout.height * layout.bottom >= 110);
    assert.equal(layout.bottom, art.alphaBounds[3] / art.sourceHeight);
    for (const x of [ARENA.left, ARENA.right]) for (const direction of [-1, 1]) {
      const endpoints = [x - direction * layout.width * layout.pivotX,
        x + direction * layout.width * (1 - layout.pivotX)];
      assert.ok(Math.min(...endpoints) >= 0, entry.id);
      assert.ok(Math.max(...endpoints) <= ARENA.width, entry.id);
    }
  }
});

test('V101 additions do not grant free unlocks and all 300 fighter/arena tickets survive save normalization', () => {
  const historical = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(),
    unlocked: fighters.slice(0, 53).map(entry => entry.id) });
  assert.equal(historical.unlocked.length, 53);
  assert.ok(added.every(entry => !historical.unlocked.includes(entry.id)));
  for (const entry of added) for (const [index, stage] of stages.entries()) {
    const initial = createXenoTrialsProgressV96(), cost = getXenoTrialsUnlockCostV96(entry.id);
    assert.equal(unlockXenoTrialsFighterV96(initial, entry.id).applied, false);
    assert.equal(beginXenoTrialsV96(initial, { playerId: entry.id }).applied, false);
    initial.credits = cost;
    const unlock = unlockXenoTrialsFighterV96(initial, entry.id);
    assert.equal(unlock.applied, true); assert.equal(unlock.state.credits, 0);
    assert.equal(unlockXenoTrialsFighterV96(unlock.state, entry.id).applied, false);
    const factionId = factions.find(faction => faction.roster.includes(entry.id)).id;
    const roundSeconds = [60, 75, 99, 120][index % 4];
    const duel = beginXenoTrialsV96(unlock.state, { playerId: entry.id, opponentId: 'defender',
      stageId: stage.id, factionId, roundSeconds });
    assert.equal(duel.applied, true);
    const restored = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(duel.state)));
    assert.deepEqual(restored.pending, duel.state.pending);
    assert.equal(restored.pending.config.playerId, entry.id);
    assert.equal(restored.pending.config.stageId, stage.id);
    assert.equal(restored.pending.config.roundSeconds, roundSeconds);
  }
});

test('V101 all 50 fighters complete real two-round engine matches and settle a ticket exactly once', () => {
  for (const entry of added) {
    const progress = createXenoTrialsProgressV96(); progress.credits = getXenoTrialsUnlockCostV96(entry.id);
    const unlocked = unlockXenoTrialsFighterV96(progress, entry.id);
    const ticket = beginXenoTrialsV96(unlocked.state, { playerId: entry.id, opponentId: 'defender',
      factionId: factions.find(faction => faction.roster.includes(entry.id)).id });
    const match = createXenoTrialsMatchV96(ticket.config);
    for (let round = 0; round < 2; round++) {
      for (let tick = 0; tick < 125; tick++) stepXenoTrialsMatchV96(match, STEP, {}, {});
      assert.equal(match.phase, 'active');
      match.fighters[0].x = 460; match.fighters[1].x = 535;
      // Deterministic low-health fixture accelerates a real hit/KO, not settlement.
      match.fighters[1].hp = 1;
      for (let tick = 0; tick < 48; tick++) stepXenoTrialsMatchV96(match, STEP, { light: true }, {});
      if (round === 0) assert.equal(nextXenoTrialsRoundV96(match), true);
    }
    assert.equal(match.result?.completed, true, entry.id);
    assert.equal(match.result.winner, 'player'); assert.equal(match.result.rounds, 2);
    const settled = settleXenoTrialsV96(ticket.state, match.result);
    assert.equal(settled.applied, true); assert.equal(settled.state.credits, 100);
    assert.equal(settled.state.wins, 1); assert.equal(settled.state.ledger.length, 1);
    assert.equal(settleXenoTrialsV96(settled.state, match.result).applied, false);
  }
});
