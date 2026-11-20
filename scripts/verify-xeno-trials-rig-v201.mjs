import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96, XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import {
  XENO_TRIALS_ARTICULATED_RIGS_V201 as rigs,
  drawXenoTrialsRigV154,
  getXenoTrialsRigCueV154,
  getXenoTrialsRigMeshV154,
  getXenoTrialsRigV154,
  getXenoTrialsRigV197,
  getXenoTrialsRigV199,
  getXenoTrialsRigV201,
  sampleXenoTrialsRigV154,
  xenoTrialsTriangleAreaV154
} from '../src/xeno-trials-rig-v154.js';

const root = new URL('../', import.meta.url);
const plan = JSON.parse(readFileSync(new URL('docs/forge/xeno-trials/xeno-trials-plan-v146.json', root), 'utf8'));
const priority = new Map(plan.tables['02_Roster'].rows.map(row => [row[0], row[9]]));
const clips = ['intro', 'round-win', 'round-loss', 'recovery'];
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} vs ${expected}`);
const distance = ([ax, ay], [bx, by]) => Math.hypot(ax - bx, ay - by);

test('twenty new P2 rigs use exact and distinct source plates with visible landmarks', () => {
  assert.equal(rigs.length, 20);
  assert.equal(new Set(rigs.map(rig => rig.fighterId)).size, rigs.length);
  assert.equal(new Set(rigs.map(rig => rig.sourceSha256)).size, rigs.length);
  assert.equal(new Set(rigs.map(rig => JSON.stringify(rig.poses))).size, rigs.length);
  for (const rig of rigs) {
    const fighter = getXenoTrialsFighterV96(rig.fighterId), art = getXenoTrialsArtV96(rig.fighterId);
    const png = auditWeaponPngV120(fileURLToPath(new URL(rig.path.slice(1), root)));
    assert.equal(priority.get(rig.fighterId), 'P2');
    assert.deepEqual([png.width, png.height, png.sha256], [rig.sourceWidth, rig.sourceHeight, rig.sourceSha256]);
    assert.equal(getXenoTrialsRigV201(fighter, art), rig);
    assert.equal(getXenoTrialsRigV199(fighter, art), null);
    assert.equal(getXenoTrialsRigV197(fighter, art), null);
    const legacy = getXenoTrialsRigV154(fighter, art);
    assert.equal(legacy.mesh, rig.mesh);
    if (rig.rigidZonesV163) {
      assert.equal(rig.rigidZonesV163, legacy.rigidZonesV163);
      for (const zone of rig.rigidZonesV163) assert.ok(rig.bones.some(bone => bone.id === zone.bone), rig.id);
    }
    assert.equal(getXenoTrialsRigV201(fighter, { ...art, sha256: undefined }), null);
    assert.equal(getXenoTrialsRigV201(fighter, { ...art, sourceFacing: -rig.sourceFacing }), null);
    assert.equal(getXenoTrialsRigV201({ ...fighter, profileId: 'unknown' }, art), null);
    assert.equal(getXenoTrialsRigMeshV154({ ...rig }), null);
    assert.deepEqual(Object.keys(rig.poses), clips);
    assert.ok(Object.values(rig.contacts).filter(contact => contact.bone === 'hips').length >= 2, rig.fighterId);
    for (const { id, pivot, tip } of rig.bones) {
      assert.ok(png.pixelAlpha(...pivot) >= 128, `${rig.id}/${id}/pivot`);
      assert.ok(png.pixelAlpha(...tip) >= 128, `${rig.id}/${id}/tip`);
    }
    for (const [name, contact] of Object.entries(rig.contacts)) assert.ok(png.pixelAlpha(...contact.point) >= 128, `${rig.id}/${name}`);
  }
});

test('all four clips retain pinned supports, rigid tools and paintable geometry across the easing curve', () => {
  for (const rig of rigs) {
    const mesh = getXenoTrialsRigMeshV154(rig);
    const sourceVertices = mesh.vertices.map(vertex => vertex.source);
    const rigidBone = rig.rigidZonesV163?.[0]?.bone;
    const toolVertices = mesh.vertices
      .map((vertex, index) => vertex.weights.length === 1 && vertex.weights[0][0] === rigidBone ? index : -1)
      .filter(index => index >= 0);
    if (rigidBone) assert.ok(toolVertices.length >= 4, rig.id);
    const sourceAreas = mesh.triangles.map(triangle => xenoTrialsTriangleAreaV154(...triangle.map(index => sourceVertices[index])));
    for (const clip of clips) {
      let maxDisplacement = 0;
      for (let step = 0; step <= 20; step++) {
        const progress = step / 20;
        const frame = sampleXenoTrialsRigV154(rig, { clip, progress, elapsed: progress });
        assert.ok(frame, `${rig.id}/${clip}/${step}`);
        for (const [name, contact] of Object.entries(rig.contacts)) {
          if (contact.bone === 'hips') frame.contacts[name].forEach((value, axis) => close(value, contact.point[axis]));
        }
        if (rigidBone) {
          const [fixed, ...rest] = toolVertices;
          for (const index of rest) close(distance(frame.vertices[fixed], frame.vertices[index]),
            distance(sourceVertices[fixed], sourceVertices[index]));
        }
        mesh.triangles.forEach((triangle, i) => {
          assert.ok(xenoTrialsTriangleAreaV154(...triangle.map(index => frame.vertices[index])) >= sourceAreas[i] * .35,
            `${rig.id}/${clip}/${step}/${i}`);
        });
        frame.vertices.forEach((vertex, i) => {
          maxDisplacement = Math.max(maxDisplacement, distance(vertex, sourceVertices[i]));
        });
        if (step === 0 || step === 20) assert.equal(frame.active, false);
      }
      assert.ok(maxDisplacement >= 8 && maxDisplacement <= 65, `${rig.id}/${clip}/${maxDisplacement}`);
      const quiet = sampleXenoTrialsRigV154(rig, { clip, progress: .5, elapsed: .5 }, true);
      assert.equal(quiet.active, false);
      quiet.vertices.forEach((vertex, i) => vertex.forEach((value, axis) => close(value, sourceVertices[i][axis])));
    }
  }
});

test('new grounded recovery follows each real attack window and commits a revisioned draw receipt', () => {
  for (const rig of rigs) for (const kind of ['light', 'heavy', 'special']) {
    const match = createXenoTrialsMatchV96({ playerId: rig.fighterId, opponentId: 'runner', introSeconds: 0 });
    const fighter = match.fighters[0];
    while (match.phase === 'intro') stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, {}, {});
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { [kind]: true }, {});
    assert.equal(fighter.attack?.kind, kind, rig.fighterId);
    const spec = getXenoTrialsAttackV147(getXenoTrialsFighterV96(rig.fighterId), kind, XENO_TRIALS_ATTACKS_V96[kind]);
    let painted = false;
    while (fighter.attack) {
      const cue = getXenoTrialsRigCueV154(rig, match, fighter);
      if (fighter.attack.age < spec.startup + spec.active - 1e-7) assert.equal(cue, null);
      if (!painted && cue?.progress > .3 && cue.progress < .6) {
        assert.equal(cue.clip, 'recovery');
        close(cue.progress, (fighter.attack.age - spec.startup - spec.active) / spec.recovery);
        const before = structuredClone(match);
        const frame = sampleXenoTrialsRigV154(rig, cue);
        let submissions = 0;
        const ctx = new Proxy({}, { get: (_, name) => () => { if (name === 'drawImage') submissions++; } });
        const image = { complete: true, naturalWidth: rig.sourceWidth, naturalHeight: rig.sourceHeight };
        const metrics = { pivotX: .5, bottom: .85, width: 200, height: 200 };
        const receipt = drawXenoTrialsRigV154(ctx, rig, image, frame, metrics, 500, 450, fighter.facing);
        assert.deepEqual([receipt?.presentationRevision, receipt?.clip, receipt?.sourceSha256], [201, 'recovery', rig.sourceSha256]);
        assert.equal(submissions, getXenoTrialsRigMeshV154(rig).triangles.length);
        assert.deepEqual(match, before);
        const airborne = { ...fighter, y: 3 };
        assert.equal(getXenoTrialsRigCueV154(rig, { ...match, fighters: [airborne] }, airborne), null);
        painted = true;
      }
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, {}, {});
    }
    assert.ok(painted, `${rig.fighterId}/${kind}`);
    assert.equal(getXenoTrialsRigCueV154(rig, match, fighter), null);
  }
});
