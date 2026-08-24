import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  NPC_MISSION_CLIP_SETS_V56,
  NPC_MISSION_GRID_V55,
  NPC_MISSION_IDENTITIES_V56,
  resolveNpcMissionAnimationV55,
  resolveNpcMissionIdentityV55
} from '../src/npc-mission-runtime-v55.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const identities = Object.values(NPC_MISSION_IDENTITIES_V56);

const EXPECTED_ROLES = Object.freeze({
  'crew-01-mara-vega': 'command-order',
  'crew-02-tamsin-velez': 'suppressive-fire',
  'crew-03-idris-kwan': 'field-repair',
  'crew-04-noor-okafor': 'combat-medicine',
  'crew-05-bishop-9': 'science-analysis',
  'crew-06-rook': 'recon-scan',
  'crew-07-sanaa-doyle': 'smartgun-burst',
  'crew-08-maksim-orlov': 'flight-control-repair',
  'crew-09-inez-harlow': 'xenobiology-analysis',
  'crew-10-david-8r': 'synthetic-infiltration',
  'crew-11-jun-park': 'technical-repair',
  'crew-12-asha-mbaye': 'colonial-coordination',
  'crew-13-pablo-reyes': 'breaching-charge',
  'crew-14-echo-a': 'tactical-scan',
  'crew-15-leila-s-rensen': 'pathfinder-scan',
  'crew-16-cal-mercer': 'vehicle-repair'
});

test('les huit identités possèdent leurs propres plaques mission et locomotion normalisées', () => {
  assert.equal(identities.length, 16);
  assert.deepEqual(NPC_MISSION_GRID_V55, {
    columns: 4,
    rows: 4,
    cellWidth: 256,
    cellHeight: 256,
    guard: 16,
    sourceFacing: 1
  });

  const missionPaths = new Set();
  const locomotionPaths = new Set();
  const sheetIds = new Set();
  for (const identity of identities) {
    assert.equal(identity.identityVerified, true);
    assert.match(identity.missionPath, new RegExp('/normalized/npcs/' + identity.slug + '-mission-sheet[.]png$'));
    assert.match(identity.locomotionPath, new RegExp('/normalized/npcs/' + identity.slug + '-locomotion-sheet[.]png$'));
    assert.ok(existsSync(path.join(ROOT, identity.missionPath.slice(1))), identity.missionPath);
    assert.ok(existsSync(path.join(ROOT, identity.locomotionPath.slice(1))), identity.locomotionPath);
    missionPaths.add(identity.missionPath);
    locomotionPaths.add(identity.locomotionPath);
    sheetIds.add(identity.missionSheetId);
  }
  assert.equal(missionPaths.size, 16);
  assert.equal(locomotionPaths.size, 16);
  assert.equal(sheetIds.size, 16);
  assert.equal(Object.keys(NPC_MISSION_CLIP_SETS_V56).length, 16);
});

test('chaque rôle utilise une action pertinente et un clip borné dans la grille 4x4', () => {
  for (const identity of identities) {
    assert.equal(identity.roleAction, EXPECTED_ROLES[identity.crewId]);
    const roleClip = identity.missionClips['role-support'];
    assert.ok(roleClip.events.some((event) => event.type === 'role:' + identity.roleAction));
    for (const clip of Object.values(identity.missionClips)) {
      assert.ok(clip.frames.length, identity.crewId + ':' + clip.id);
      assert.ok(clip.frames.every((frame) => Number.isInteger(frame) && frame >= 0 && frame < 16));
      assert.ok(clip.rows.every((row) => row >= 0 && row < 4));
    }
  }
});

test('fire support work climbing hurt downed et dead utilisent toujours la plaque mission de la même identité', () => {
  const states = [
    [{ fireClock: 0.2 }, 'fire'],
    [{ supportClock: 0.2 }, 'role-support'],
    [{ workClock: 0.2 }, 'role-support'],
    [{ climbing: true }, 'climb'],
    [{ v52HurtClock: 0.2 }, 'hurt'],
    [{ downed: true, alive: false }, 'downed'],
    [{ alive: false }, 'dead']
  ];

  for (const identity of identities) {
    for (const [state, clipId] of states) {
      const resolved = resolveNpcMissionAnimationV55({ crewId: identity.crewId, alive: true, grounded: true, ...state });
      assert.equal(resolved.source, 'mission');
      assert.equal(resolved.sheetId, identity.missionSheetId);
      assert.equal(resolved.path, identity.missionPath);
      assert.equal(resolved.identity, identity.slug);
      assert.equal(resolved.clipId, clipId);
    }
  }
});

test('idle et walk seuls conservent la locomotion legacy; traversal cover et ready restent dédiés', () => {
  for (const identity of identities) {
    const idle = resolveNpcMissionAnimationV55({ crewId: identity.crewId, alive: true, grounded: true });
    const walk = resolveNpcMissionAnimationV55({ crewId: identity.crewId, alive: true, grounded: true, vx: 40 });
    assert.equal(idle.source, 'legacy-locomotion');
    assert.equal(idle.clipId, 'idle');
    assert.equal(walk.source, 'legacy-locomotion');
    assert.equal(walk.clipId, 'walk');
    assert.equal(idle.sheetId, identity.locomotionSheetId);
    assert.equal(walk.sheetId, identity.locomotionSheetId);

    for (const [state, clipId] of [
      [{ grounded: false }, 'traversal'],
      [{ crouching: true }, 'cover'],
      [{ combatReady: true }, 'ready']
    ]) {
      const resolved = resolveNpcMissionAnimationV55({ crewId: identity.crewId, alive: true, grounded: true, ...state });
      assert.equal(resolved.source, 'mission');
      assert.equal(resolved.clipId, clipId);
      assert.equal(resolved.sheetId, identity.missionSheetId);
    }
  }
});

test('les états wounded downed et dead ont des cellules dédiées de la dernière rangée', () => {
  for (const identity of identities) {
    for (const clipId of ['hurt', 'downed', 'dead', 'wounded-death']) {
      const clip = identity.missionClips[clipId];
      assert.ok(clip.frames.every((frame) => frame >= 12 && frame <= 15), identity.crewId + ':' + clipId);
    }
    assert.deepEqual(identity.missionClips.dead.frames, [15]);
    assert.equal(identity.missionClips.dead.loop, false);
  }
});

test('une identité inconnue ne reçoit jamais la plaque d un autre personnage', () => {
  assert.equal(resolveNpcMissionIdentityV55('crew-99-unknown'), null);
  assert.equal(resolveNpcMissionAnimationV55({ crewId: 'crew-99-unknown', fireClock: 1 }), null);
  assert.equal(resolveNpcMissionAnimationV55({ id: 'crew-01-mara-vega', fireClock: 1 }), null);

  for (const identity of identities) {
    const resolved = resolveNpcMissionAnimationV55({ crewId: identity.crewId, fireClock: 1, alive: true });
    assert.equal(resolved.identity, identity.slug);
    assert.match(resolved.sheetId, new RegExp('^npc[.]' + identity.slug + '[.]mission$'));
    for (const other of identities.filter((candidate) => candidate !== identity)) {
      assert.notEqual(resolved.sheetId, other.missionSheetId);
      assert.notEqual(resolved.path, other.missionPath);
    }
  }
});
