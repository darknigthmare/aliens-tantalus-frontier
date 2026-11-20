import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96, XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import {
  XENO_TRIALS_ARTICULATED_RIGS_V197 as rigs,
  drawXenoTrialsRigV154 as draw,
  getXenoTrialsRigCueV154 as getCue,
  getXenoTrialsRigMeshV154 as getMesh,
  getXenoTrialsRigV154 as getHistoricalRig,
  getXenoTrialsRigV197 as getRig,
  projectXenoTrialsMeshPointV157 as project,
  sampleXenoTrialsRigV154 as sample,
  xenoTrialsTriangleAreaV154 as area
} from '../src/xeno-trials-rig-v154.js';

const root = new URL('../', import.meta.url);
const plan = JSON.parse(readFileSync(new URL('docs/forge/xeno-trials/xeno-trials-plan-v146.json', root), 'utf8'));
const roster = new Map(plan.tables['02_Roster'].rows.map(row => [row[0], row[9]]));
const clips = ['intro', 'round-win', 'round-loss', 'recovery'];
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} vs ${expected}`);

test('twelve distinct P2 identities match the exact native plates and keep their legacy rigs addressable', () => {
  assert.equal(rigs.length, 12);
  assert.equal(new Set(rigs.map(rig => rig.sourceSha256)).size, rigs.length);
  assert.equal(new Set(rigs.map(rig => JSON.stringify(rig.poses))).size, rigs.length);
  for (const rig of rigs) {
    assert.equal(roster.get(rig.fighterId), 'P2', rig.fighterId);
    assert.deepEqual(Object.keys(rig.poses), clips, rig.fighterId);
    const source = getXenoTrialsArtV96(rig.fighterId);
    const fighter = getXenoTrialsFighterV96(rig.fighterId);
    const bytes = readFileSync(new URL(rig.path.slice(1), root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), rig.sourceSha256);
    assert.equal(bytes.readUInt32BE(16), rig.sourceWidth);
    assert.equal(bytes.readUInt32BE(20), rig.sourceHeight);
    assert.equal(getRig(fighter, source), rig);
    const historical = getHistoricalRig(fighter, source);
    assert.notEqual(historical.id, rig.id);
    assert.equal(historical.mesh, rig.mesh);
    assert.equal(getRig({ ...fighter, profileId: 'mismatched-profile' }, source), null);
    assert.equal(getRig(fighter, { ...source, id: 'mismatched-id' }), null);
    assert.equal(getRig(fighter, { ...source, sha256: undefined }), null);
    assert.equal(getRig(fighter, { ...source, sourceFacing: -source.sourceFacing }), null);
    assert.equal(getMesh({ ...rig }), null);
  }
});

test('the articulated poses move real source vertices, pin visible supports and preserve a nonfolding mesh', () => {
  for (const rig of rigs) {
    const mesh = getMesh(rig);
    assert.ok(mesh.triangles.length > 0 && mesh.triangles.length <= 800, rig.id);
    const originalAreas = mesh.triangles.map(indices => area(...indices.map(i => mesh.vertices[i].source)));
    for (const clip of clips) {
      let maxMovement = 0;
      for (let n = 0; n <= 20; n++) {
        const progress = n / 20;
        const frame = sample(rig, { clip, progress, elapsed: 1.2 * progress });
        assert.ok(frame, `${rig.id}/${clip}/${n}`);
        for (const [name, contact] of Object.entries(rig.contacts)) {
          const displayed = project(rig, frame, contact.point);
          assert.deepEqual(displayed, frame.contacts[name]);
          if (contact.bone === 'hips') displayed.forEach((value, axis) => near(value, contact.point[axis]));
        }
        for (const [index, vertices] of mesh.triangles.entries()) {
          assert.ok(area(...vertices.map(i => frame.vertices[i])) >= originalAreas[index] * .35, `${rig.id}/${clip}/${n}`);
        }
        for (const [index, vertex] of frame.vertices.entries()) {
          const [sx, sy] = mesh.vertices[index].source;
          maxMovement = Math.max(maxMovement, Math.hypot(vertex[0] - sx, vertex[1] - sy));
        }
      }
      assert.ok(maxMovement > 1 && maxMovement < 75, `${rig.id}/${clip}: observed ${maxMovement} source pixels`);
      assert.equal(sample(rig, { clip, progress: 0, elapsed: 0 }).active, false);
      assert.equal(sample(rig, { clip, progress: 1, elapsed: 1.2 }).active, false);
      const quiet = sample(rig, { clip, progress: .5, elapsed: .6 }, true);
      assert.equal(quiet.active, false);
      quiet.vertices.forEach((vertex, i) => vertex.forEach((value, axis) => near(value, mesh.vertices[i].source[axis])));
    }
  }
});

test('recovery follows the real stepped attack windows for every admitted identity and move kind', () => {
  for (const rig of rigs) for (const action of ['light', 'heavy', 'special']) {
    const match = createXenoTrialsMatchV96({ playerId: rig.fighterId, opponentId: 'runner', introSeconds: 0 });
    const fighter = match.fighters[0];
    while (match.phase === 'intro') stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, {}, {});
    assert.equal(getCue(rig, match, fighter), null);
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { [action]: true }, {});
    const spec = getXenoTrialsAttackV147(getXenoTrialsFighterV96(fighter.id), action, XENO_TRIALS_ATTACKS_V96[action]);
    const recoveryAt = spec.startup + spec.active;
    assert.equal(fighter.attack.kind, action);
    let recoveryFrames = 0;
    while (fighter.attack) {
      const inspection = getCue(rig, match, fighter);
      if (fighter.attack.age < recoveryAt) assert.equal(inspection, null);
      else {
        assert.equal(inspection?.clip, 'recovery');
        near(inspection.progress, (fighter.attack.age - recoveryAt) / spec.recovery);
        recoveryFrames++;
        const before = structuredClone(match);
        sample(rig, inspection);
        assert.deepEqual(match, before);
      }
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, {}, {});
    }
    assert.ok(recoveryFrames >= 2, `${rig.id}/${action}`);
    assert.equal(getCue(rig, match, fighter), null);
  }
});

test('owned presentation and first-round cues reach Canvas while blocked, airborne or foreign recovery does not', () => {
  const rig = rigs[0];
  const match = createXenoTrialsMatchV96({ playerId: rig.fighterId, opponentId: 'runner', introSeconds: 0 });
  const fighter = match.fighters[0];
  while (match.phase === 'intro') stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, {}, {});
  const intro = { blocksSimulation: true, elapsedMs: 600, fighterSlot: 0 };
  assert.equal(getCue(rig, match, fighter, intro)?.clip, 'intro');
  assert.equal(getCue(rig, match, fighter, { ...intro, fighterSlot: 1 }), null);
  assert.equal(getCue(rig, match, { ...fighter }, intro), null);
  const afterOpponentWin = { ...match, phase: 'round-over', roundWinner: 'opponent', phaseTime: .8 };
  assert.equal(getCue(rig, afterOpponentWin, fighter)?.clip, 'round-loss');
  const lostFrame = sample(rig, getCue(rig, afterOpponentWin, fighter));
  let submissions = 0;
  const context = new Proxy({}, { get: (_, key) => () => { if (key === 'drawImage') submissions++; } });
  const image = { complete: true, naturalWidth: rig.sourceWidth, naturalHeight: rig.sourceHeight };
  const metrics = { pivotX: .5, bottom: .85, width: 200, height: 200 };
  const receipt = draw(context, rig, image, lostFrame, metrics, 500, 450, 1);
  assert.equal(receipt.sourceSha256, rig.sourceSha256);
  assert.equal(receipt.clip, 'round-loss');
  assert.equal(submissions, getMesh(rig).triangles.length);
  const phases = XENO_TRIALS_ATTACKS_V96.light;
  const ready = { ...fighter, attack: { kind: 'light', age: phases.startup + phases.active + phases.recovery / 2 } };
  assert.equal(getCue(rig, { ...match, fighters: [ready] }, ready)?.clip, 'recovery');
  for (const blocked of [{ y: 6 }, { guard: true }, { stun: .1 }, { hitFlash: .1 }, { hp: 0 }]) {
    const actor = { ...ready, ...blocked };
    assert.equal(getCue(rig, { ...match, fighters: [actor] }, actor), null);
  }
  assert.equal(getCue(rig, { ...match, fighters: [ready], grappleV153: { attacker: ready.side } }, ready), null);
});
