import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsReactionObserverV186 } from '../src/xeno-trials-reactions-v186.js';
import {
  XENO_TRIALS_DEFENSE_RIGS_V203 as rigs, getXenoTrialsDefenseRigV203 as getRig, getXenoTrialsRigV154,
  getXenoTrialsRigMeshV154, sampleXenoTrialsRigV154, drawXenoTrialsRigV154, xenoTrialsTriangleAreaV154
} from '../src/xeno-trials-rig-v154.js';

const root = new URL('../', import.meta.url);
const plan = JSON.parse(readFileSync(new URL('docs/forge/xeno-trials/xeno-trials-plan-v146.json', root), 'utf8'));
const priorities = new Map(plan.tables['02_Roster'].rows.map(row => [row[0], row[9]]));
const clips = ['guard', 'hurt', 'guard-break', 'recover'];
const distance = ([ax, ay], [bx, by]) => Math.hypot(ax - bx, ay - by);
const near = (a, b) => Math.abs(a - b) < 1e-7;
const sample = (rig, clip, progress, { gain, reduced = false } = {}) =>
  sampleXenoTrialsRigV154(rig, { clip, progress, elapsed: 0, gain }, reduced);

test('20 P0/P1 defense rigs use distinct exact source plates and opaque landmarks', () => {
  assert.equal(rigs.length, 20);
  for (const getKey of [rig => rig.fighterId, rig => rig.sourceSha256, rig => JSON.stringify(rig.poses)]) {
    assert.equal(new Set(rigs.map(getKey)).size, rigs.length);
  }
  for (const rig of rigs) {
    const definition = getXenoTrialsFighterV96(rig.fighterId), art = getXenoTrialsArtV96(rig.fighterId);
    assert.ok(['P0', 'P1'].includes(priorities.get(rig.fighterId)), rig.id);
    assert.equal(getRig(definition, art), rig);
    assert.equal(getRig(definition, { ...art, sha256: '0'.repeat(64) }), null);
    assert.equal(getRig(definition, { ...art, sourceFacing: -art.sourceFacing }), null);
    assert.equal(getRig({ ...definition, profileId: 'foreign-profile' }, art), null);
    assert.equal(getXenoTrialsRigMeshV154({ ...rig }), null);
    const legacy = getXenoTrialsRigV154(definition, art);
    assert.equal(legacy.mesh, rig.mesh);
    assert.deepEqual(rig.rigidZonesV163 || [], legacy.rigidZonesV163 || []);
    assert.deepEqual(Object.keys(rig.poses), clips);
    assert.deepEqual(rig.poses['guard-break'], rig.poses.recover);
    const png = auditWeaponPngV120(fileURLToPath(new URL(rig.path.slice(1), root)));
    assert.deepEqual([png.width, png.height, png.sha256], [rig.sourceWidth, rig.sourceHeight, rig.sourceSha256]);
    for (const { pivot, tip } of rig.bones) {
      assert.ok(png.pixelAlpha(...pivot) >= 128 && png.pixelAlpha(...tip) >= 128, rig.id);
    }
    for (const { point } of Object.values(rig.contacts)) assert.ok(png.pixelAlpha(...point) >= 128, rig.id);
  }
});

test('defense preserves all supports and rigid tools, with a continuous break recovery and neutral reduced motion', () => {
  for (const rig of rigs) {
    const mesh = getXenoTrialsRigMeshV154(rig), source = mesh.vertices.map(vertex => vertex.source);
    const area = (points, triangle) => xenoTrialsTriangleAreaV154(...triangle.map(index => points[index]));
    const originalAreas = mesh.triangles.map(triangle => area(source, triangle));
    const rigidBones = new Set((rig.rigidZonesV163 || []).map(zone => zone.bone));
    const rigidVertices = [...rigidBones].map(bone => mesh.vertices
      .map((vertex, index) => vertex.weights.length === 1 && vertex.weights[0][0] === bone ? index : -1)
      .filter(index => index >= 0));
    const assertFixed = frame => {
      for (const [name, contact] of Object.entries(rig.contacts)) {
        if (contact.bone === 'hips') assert.ok(near(distance(frame.contacts[name], contact.point), 0), `${rig.id}/${name}`);
      }
      for (const [reference, ...others] of rigidVertices) {
        assert.ok(others.length >= 3, rig.id);
        for (const index of others) {
          assert.ok(near(distance(frame.vertices[reference], frame.vertices[index]), distance(source[reference], source[index])), rig.id);
        }
      }
    };
    for (const clip of clips) {
      let travel = 0;
      for (let step = 0; step <= 20; step++) {
        const frame = sample(rig, clip, step / 20);
        assert.ok(frame, `${rig.id}/${clip}/${step}`);
        assertFixed(frame);
        for (const [index, triangle] of mesh.triangles.entries()) {
          assert.ok(area(frame.vertices, triangle) >= originalAreas[index] * .35, `${rig.id}/${clip}/${step}/${index}`);
        }
        for (const [index, vertex] of frame.vertices.entries()) travel = Math.max(travel, distance(source[index], vertex));
      }
      assert.ok(travel >= 10 && travel <= 120, `${rig.id}/${clip}/${travel}`);
      const quiet = sample(rig, clip, .5, { reduced: true });
      assert.equal(quiet.active, false);
      assert.ok(quiet.vertices.every((vertex, index) => near(distance(vertex, source[index]), 0)), rig.id);
    }
    assert.deepEqual(sample(rig, 'guard-break', 1).vertices, sample(rig, 'recover', 0).vertices);
    const settled = sample(rig, 'guard', 1), releasing = sample(rig, 'guard', 1, { gain: .35 });
    assert.ok(settled.active && releasing.active);
    for (const [index, vertex] of releasing.vertices.entries()) {
      assert.ok(distance(vertex, source[index]) <= distance(settled.vertices[index], source[index]) + 1e-7, rig.id);
    }
    for (const [clip, progress] of [['guard', 0], ['hurt', 0], ['hurt', 1], ['recover', 1]]) {
      const end = sample(rig, clip, progress);
      assert.equal(end.active, false);
      assert.ok(end.vertices.every((vertex, index) => near(distance(vertex, source[index]), 0)), rig.id);
    }
  }
});

function collect(rig, { lowStamina = false, guard = false, attack = false }) {
  const match = createXenoTrialsMatchV96({ playerId: rig.fighterId, opponentId: 'runner', introSeconds: 0 });
  const [player, opponent] = match.fighters;
  // Close-range test fixture, with an explicitly nearly depleted guard in
  // the break case. Damage, stagger and state transitions use actual steps.
  player.x = 450;
  opponent.x = 510;
  if (lowStamina) player.stamina = 8;
  const observe = createXenoTrialsReactionObserverV186({ canObserve: actor => actor.id === rig.fighterId });
  observe(match, player);
  const frames = new Map();
  for (let step = 0; step < 150; step++) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { guard }, { left: attack && step < 18, light: attack && step === 18 });
    const cue = observe(match, player);
    if (!cue || cue.progress < .2) continue;
    const frame = sample(rig, cue.state, cue.progress, cue);
    if (frame?.active) frames.set(cue.state, { frame, tick: match.tick, cue });
  }
  return { match, player, frames };
}

test('real controls, a real unguarded strike and a low-stamina blocked strike drive 80 native phase receipts', () => {
  for (const rig of rigs) {
    const scenarios = [
      [collect(rig, { guard: true }), ['guard']],
      [collect(rig, { attack: true }), ['hurt']],
      [collect(rig, { lowStamina: true, guard: true, attack: true }), ['guard-break', 'recover']]
    ];
    for (const [{ match, player, frames }, required] of scenarios) {
      for (const state of required) {
        assert.ok(frames.has(state), `${rig.id}/${state}/${JSON.stringify({ hp: player.hp, stamina: player.stamina })}`);
        const { frame, cue } = frames.get(state);
        const before = structuredClone(match);
        let drawImages = 0;
        const context = new Proxy({}, { get: (_, key) => () => { if (key === 'drawImage') drawImages++; } });
        const metrics = { width: 230, height: 230, pivotX: .5, bottom: .9 };
        const image = { complete: true, naturalWidth: rig.sourceWidth, naturalHeight: rig.sourceHeight };
        const view = drawXenoTrialsRigV154(context, rig, image, frame, metrics, 500, 450, player.facing);
        assert.deepEqual([view?.defenseRevision, view?.clip, view?.progress, view?.sourceSha256],
          [203, state, cue.progress, rig.sourceSha256]);
        assert.equal(drawImages, getXenoTrialsRigMeshV154(rig).triangles.length, rig.id);
        assert.deepEqual(match, before, rig.id);
      }
    }
  }
});
