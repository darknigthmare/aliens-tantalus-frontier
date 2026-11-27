import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96,
  XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsHordeProtocolV180, XENO_TRIALS_HORDE_LIMITS_V180 } from '../src/xeno-trials-horde-v180.js';
import { getXenoTrialsAlternateSignatureV208, XENO_TRIALS_SIGNATURES_V208 } from '../src/xeno-trials-signature-kit-v208.js';

const controlFor = kind => kind === 'signature-2' ? 'signature2' : 'signature3';
const advance = (match, ticks, player = {}, opponent = {}) => {
  for (let i = 0; i < ticks; i++) stepXenoTrialsMatchV96(match, dt, player, opponent);
};
const fight = (playerId, config = {}) => createXenoTrialsMatchV96({ playerId, opponentId: 'warrior', introSeconds: 0, ...config });
function gapAt(match, gap) {
  const [player, target] = match.fighters;
  target.x += body(player).right + gap - body(target).left;
  return [player, target];
}

test('70 moves admit only the 60 exact profile IDs and rows authored against the V146 bible', () => {
  const plan = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url)));
  const source = new Map(plan.tables['06_Signatures'].rows.map(row => [row[0], row]));
  assert.equal(XENO_TRIALS_SIGNATURES_V208.length, 70);
  assert.equal(new Set(XENO_TRIALS_SIGNATURES_V208.map(move => move.fighterId)).size, 60);
  const ids = new Set();
  for (const move of XENO_TRIALS_SIGNATURES_V208) {
    const definition = getXenoTrialsFighterV96(move.fighterId);
    assert.equal(source.get(move.id)?.[1], definition.id);
    assert.equal(getXenoTrialsAlternateSignatureV208(definition, move.kind), move);
    assert.equal(getXenoTrialsAlternateSignatureV208({ ...definition, profileId: 'unrelated' }, move.kind), null);
    assert.equal(getXenoTrialsAlternateSignatureV208({ ...definition, id: 'unrelated' }, move.kind), null);
    assert.ok(!ids.has(move.id));
    ids.add(move.id);
  }
  const xenoborg = getXenoTrialsFighterV96('xenoborg');
  assert.ok(!XENO_TRIALS_SIGNATURES_V208.some(move => move.id === 'xenoborg::sig2'));
  assert.equal(getXenoTrialsAlternateSignatureV208(xenoborg, 'signature-2')?.style, 'physical');
  assert.equal(getXenoTrialsAlternateSignatureV208({ ...xenoborg, profileId: 'other-chassis' }, 'signature-2'), null);
});

test('all 70 signatures have an accepted native action and exactly one impact inside the contact window', () => {
  for (const move of XENO_TRIALS_SIGNATURES_V208) {
    const match = fight(move.fighterId);
    const [player, target] = gapAt(match, 9), targetHp = target.hp;
    advance(match, 1, { [controlFor(move.kind)]: true });
    assert.equal(player.attack?.kind, move.kind, move.id);
    assert.equal(match.events.at(-1)?.signatureIdV208, move.id);
    assert.equal(player.stamina, getXenoTrialsFighterV96(move.fighterId).stamina - move.spec.cost, move.id);
    assert.equal(player.stats.specials, 1);
    while (player.attack.age + dt < move.spec.startup) advance(match, 1);
    assert.equal(player.stats.hits, 0, move.id);
    assert.equal(target.hp, targetHp, move.id);
    advance(match, Math.ceil((move.spec.active + .05) * 120));
    assert.equal(player.stats.hits, 1, move.id);
    assert.ok(target.hp < targetHp, move.id);
    assert.equal(match.projectiles.length, 0, move.id);
  }
});

test('grounded bites miss jumpers, low strikes need low guard and interrupted tails cannot land', () => {
  const raised = fight('runner'), [runner, jumper] = gapAt(raised, 8);
  advance(raised, 1, { signature2: true }, { jump: true });
  advance(raised, 46);
  assert.equal(runner.stats.hits, 0);
  assert.equal(jumper.hp, getXenoTrialsFighterV96(jumper.id).hp);

  for (const crouch of [false, true]) {
    const match = fight('runner'), [, target] = gapAt(match, 6);
    advance(match, 1, { signature2: true }, { crouch, guard: true });
    advance(match, 40, {}, { crouch, guard: true });
    assert.equal(target.stats.blocks, Number(crouch));
  }
  const cpu = fight('runner'), [, cpuTarget] = gapAt(cpu, 6);
  cpu.ai.input.guard = true;
  cpu.ai.decisionIn = .5;
  cpu.ai.guardRemaining = .5;
  advance(cpu, 1, { signature2: true }, null);
  assert.equal(cpuTarget.movesetV207, undefined, 'native guard only reacts after the tell');
  advance(cpu, 30, {}, null);
  assert.equal(cpuTarget.stats.blocks, 1);

  const punished = fight('warrior'), [warrior, rival] = gapAt(punished, 12);
  advance(punished, 1, { signature2: true }, { light: true });
  advance(punished, 68);
  assert.equal(warrior.stats.hits, 0);
  assert.equal(rival.stats.hits, 1);
  assert.equal(warrior.attack, null);
});

test('leap, rush and withdrawal physically move while their contact remains locked to the original facing', () => {
  const air = fight('predalien'), [predalien] = gapAt(air, 86), airStart = predalien.x;
  advance(air, 1, { signature2: true });
  advance(air, 38);
  assert.ok(predalien.y > 0 && predalien.x > airStart);
  assert.equal(predalien.attack.facing, 1);

  const rush = fight('ravager'), [ravager] = gapAt(rush, 90), rushStart = ravager.x;
  advance(rush, 1, { signature2: true });
  advance(rush, 46);
  assert.ok(ravager.x > rushStart);
  assert.equal(ravager.y, 0);
  assert.equal(ravager.stats.hits, 1);

  const exit = fight('stalker-arcade'), [stalker] = gapAt(exit, 12), exitStart = stalker.x;
  advance(exit, 1, { signature3: true });
  advance(exit, 60);
  assert.ok(stalker.x < exitStart - 20);
  assert.equal(stalker.stats.hits, 1);
});

test('edge, shared special cooldown, pause, special restrictions and vanilla special all remain enforced', () => {
  const match = fight('warrior'), [fighter] = match.fighters;
  advance(match, 1, { signature2: true });
  setXenoTrialsPausedV96(match, true);
  setXenoTrialsPausedV96(match, false);
  advance(match, 117, { signature2: true });
  assert.equal(fighter.attack, null);
  assert.ok(fighter.specialCooldown > 0);
  advance(match, 1, { signature3: true });
  assert.equal(fighter.attack, null);
  advance(match, 90, { signature3: true });
  assert.equal(fighter.stats.specials, 1);
  releaseXenoTrialsControlsV150(match, 'player', {});
  advance(match, 1, { special: true });
  assert.equal(fighter.attack.kind, 'special');

  const limited = fight('warrior', { rulesV119: { noSpecial: true } });
  advance(limited, 1, { signature2: true });
  advance(limited, 1, { signature3: true });
  assert.equal(limited.fighters[0].stats.specials, 0);
  assert.equal(limited.fighters[0].attack, null);

  const locked = fight('warrior', { rulesV119: { specialLockSeconds: 20 } });
  advance(locked, 2406, { signature2: true });
  assert.equal(locked.fighters[0].stats.specials, 0, 'holding a locked signature cannot fire it after unlock');
  advance(locked, 1);
  advance(locked, 1, { signature2: true });
  assert.equal(locked.fighters[0].attack?.kind, 'signature-2');
});

test('duel and horde checkpoints restore in-flight signatures and reject forged proof and action state', () => {
  for (const horde of [false, true]) {
    const progress = createXenoTrialsProgressV96();
    const playerId = 'predalien';
    if (!progress.unlocked.includes(playerId)) progress.unlocked.push(playerId);
    const activityV119 = horde ? { branch: 'horde', id: 'xth180-incoming-1' } : undefined;
    const ticket = beginXenoTrialsV96(progress, { playerId, opponentId: 'runner', activityV119 });
    assert.equal(ticket.applied, true);
    const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
    const admit = horde ? createXenoTrialsHordeCheckpointV186 : createXenoTrialsDuelCheckpointV197;
    advance(match, 36, { signature2: true }, null);
    assert.equal(match.fighters[0].attack?.kind, 'signature-2');
    assert.equal(match.fighters[0].attack.launchedV147, true);
    const checkpoint = admit(getXenoTrialsSnapshotV96(match), ticket.config);
    assert.ok(checkpoint, horde ? 'horde signature' : 'duel signature');
    const restored = horde ? restoreXenoTrialsHordeMatchV180(checkpoint.snapshot) : structuredClone(checkpoint.snapshot);
    assert.ok(restored);
    for (const state of [match, restored]) setXenoTrialsPausedV96(state, false);
    advance(match, 55, {}, null);
    advance(restored, 55, {}, null);
    assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));

    for (const tamper of [
      state => { state.fighters[0].attack.launchedV147 = false; },
      state => { state.fighters[0].attack.emitted = true; },
      state => { state.events.find(event => event.kind === 'signature-2').signatureIdV208 = 'warrior::sig2'; }
    ]) {
      const sample = structuredClone(checkpoint.snapshot);
      tamper(sample);
      assert.equal(admit(sample, ticket.config), null);
    }
  }
});

test('a native Ravager telegraph stays resumable and enemy signatures obey horde attack limits', () => {
  const id = 'xth186-incoming-2', protocol = getXenoTrialsHordeProtocolV180(id);
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior',
    activityV119: { branch: 'horde', id } });
  assert.equal(ticket.applied, true);
  const match = fight('warrior', ticket.config);
  // Clear only the troop waves to reach the native authored boss fixture.
  for (let tick = 0; tick < 12000 && match.hordeV180.wave < protocol.bossFinaleV186.wave; tick++) {
    for (const enemy of match.fighters.slice(1)) enemy.hp = 0;
    advance(match, 1);
  }
  const boss = match.fighters.find(fighter => fighter.enemyRankV186 === 'boss');
  assert.equal(boss?.id, 'ravager');
  const bothSignatures = { signature2: true, signature3: true };
  advance(match, 1, {}, bothSignatures);
  assert.ok(match.fighters.slice(1).every(fighter => fighter.attack === null), 'spawn grace applies to both signatures');
  advance(match, XENO_TRIALS_HORDE_LIMITS_V180.spawnGraceTicks);
  advance(match, 1, {}, bothSignatures);
  const activeAttacks = match.fighters.slice(1).filter(fighter => fighter.attack !== null);
  assert.equal(activeAttacks.length, 2);
  assert.equal(boss.attack?.kind, 'signature-2');
  const telegraph = match.events.find(event => event.type === 'horde-boss-telegraph-v186' && event.kind === 'signature-2');
  assert.equal(telegraph?.attackId, boss.attack.id);
  assert.equal(telegraph?.instanceId, boss.instanceIdV180);
  const checkpoint = createXenoTrialsHordeCheckpointV186(getXenoTrialsSnapshotV96(match), ticket.config);
  assert.ok(checkpoint);
  assert.deepEqual(restoreXenoTrialsHordeMatchV180(checkpoint.snapshot), checkpoint.snapshot);
  telegraph.signatureIdV208 = 'ravager::sig2';
  assert.equal(createXenoTrialsHordeCheckpointV186(getXenoTrialsSnapshotV96(match), ticket.config), null);
});
