import assert from 'node:assert/strict';
import test from 'node:test';

import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import {
  SPRITE_CLIP_SETS,
  SPRITE_SHEETS,
  SpriteAnimationController,
  resolveVehicleAnimation
} from '../src/sprite-animation-runtime.js';
import {
  VEHICLE_ACCESS_CONTRACTS_V59,
  VEHICLE_ACCESS_DURATION_V59,
  VEHICLE_ACCESS_SECURE_DURATION_V59,
  resolveVehicleAccessAnimationV59,
  resolveVehicleAccessFallbackV59
} from '../src/vehicle-access-runtime-v59.js';

test('les quatre contrats V59 conservent identité, pivot, hitbox et 16 frames échantillonnables', () => {
  assert.equal(VEHICLE_ACCESS_CONTRACTS_V59.length, 4);
  assert.deepEqual(SPRITE_CLIP_SETS['vehicle-access-damage-v59'].map((clip) => clip.id), [
    'access-open', 'secure-occupied', 'exit-close', 'critical-wreck'
  ]);
  const controller = new SpriteAnimationController();
  for (const contract of VEHICLE_ACCESS_CONTRACTS_V59) {
    const base = SPRITE_SHEETS[contract.baseSheetId];
    const access = SPRITE_SHEETS[contract.accessSheetId];
    assert.ok(base, contract.baseSheetId);
    assert.ok(access, contract.accessSheetId);
    assert.equal(access.family, 'vehicle');
    assert.equal(access.pivot, base.pivot);
    assert.equal(access.hitbox, base.hitbox);
    assert.equal(access.renderWidth, base.renderWidth);
    assert.equal(access.renderHeight, base.renderHeight);
    for (const clipId of Object.values(contract.clips)) {
      const sample = controller.sample(`${contract.vehicleId}:${clipId}`, { sheetId: access.id, clipId }, 0.2);
      assert.ok(sample, `${access.id}:${clipId}`);
    }
  }
  const emitted = [];
  const secureController = new SpriteAnimationController({ onEvent: (event) => emitted.push(event) });
  const secureRequest = {
    sheetId: 'vehicle.m577-apc.access-damage',
    clipId: 'secure-occupied'
  };
  secureController.sample('secure-duration', secureRequest, 0);
  const sealed = secureController.sample('secure-duration', secureRequest, VEHICLE_ACCESS_SECURE_DURATION_V59);
  assert.equal(sealed.frame, 7);
  assert.equal(sealed.complete, true);
  assert.ok(emitted.some((event) => event.event === 'vehicle:access-sealed'));
});

test('la résolution donne priorité à accès, sécurisation et épave puis revient à la plaque action', () => {
  const base = { id: 'vehicle-001-m577-armored-personnel-carrier', hull: 340, maxHull: 340, occupied: false };
  assert.deepEqual(resolveVehicleAnimation(base), { sheetId: 'vehicle.m577-apc.action', clipId: 'idle' });
  assert.deepEqual(resolveVehicleAnimation({ ...base, accessTransition: { phase: 'entering' } }), {
    sheetId: 'vehicle.m577-apc.access-damage', clipId: 'access-open'
  });
  assert.deepEqual(resolveVehicleAnimation({ ...base, occupied: true, accessSecureClock: 0.2 }), {
    sheetId: 'vehicle.m577-apc.access-damage', clipId: 'secure-occupied'
  });
  assert.deepEqual(resolveVehicleAnimation({ ...base, occupied: true, accessTransition: { phase: 'exiting' } }), {
    sheetId: 'vehicle.m577-apc.access-damage', clipId: 'exit-close'
  });
  assert.deepEqual(resolveVehicleAnimation({ ...base, destroyed: true, hull: 0 }), {
    sheetId: 'vehicle.m577-apc.access-damage', clipId: 'critical-wreck'
  });
  assert.equal(resolveVehicleAccessAnimationV59({}, 'vehicle.m22a3-jackson-tank.action'), null);
  assert.deepEqual(resolveVehicleAccessFallbackV59(base, 'vehicle.m577-apc.access-damage'), {
    sheetId: 'vehicle.m577-apc.action', clipId: 'idle'
  });
  assert.equal(resolveVehicleAccessFallbackV59({}, 'vehicle.m22a3-jackson-tank.action'), null);
});

test('les sept fits M577 réemploient explicitement le bitmap du châssis au lieu du canvas', () => {
  const fits = ['recon', 'assault', 'rescue', 'colonial', 'frontier', 'prototype', 'apex'];
  fits.forEach((fit, index) => {
    const id = `vehicle-${String(37 + index * 36).padStart(3, '0')}-m577-armored-personnel-carrier-${fit}`;
    assert.equal(resolveVehicleAnimation({ id, hull: 300, maxHull: 300 })?.sheetId, 'vehicle.m577-apc.action', id);
  });
});

class VehicleBaseRuntime {
  constructor(events = []) {
    this.events = events;
    this.player = { alive: true, coop: false, inVehicle: false, x: 20, y: 20, w: 60, h: 92 };
    this.coop = { alive: true, coop: true, inVehicle: false, x: 20, y: 20, w: 60, h: 92 };
    this.vehicle = {
      id: 'vehicle-001-m577-armored-personnel-carrier', active: true, destroyed: false,
      occupied: false, driver: null, passengers: [], x: 80, y: 20, w: 190, h: 104,
      vx: 0, vy: 0, hull: 340, maxHull: 340
    };
    this.baseDriverUpdates = 0;
    this.baseToggleCalls = 0;
    this.controlCalls = [];
  }
  setInteractionAnimation(actor, kind, duration) { actor.interactionKind = kind; actor.interactionClock = duration; return true; }
  onEvent(payload) { this.events.push(payload); }
  toggleVehicle(actor) {
    this.baseToggleCalls += 1;
    actor.inVehicle = !actor.inVehicle;
    if (actor.inVehicle) this.vehicle.driver = actor;
    else this.vehicle.driver = null;
    this.vehicle.occupied = Boolean(this.vehicle.driver);
    return true;
  }
  updatePlayer(player) { this.controlCalls.push('move'); player.x += 100; return true; }
  updateVehicleDriver() { this.baseDriverUpdates += 1; this.vehicle.x += 100; return true; }
  fire() { this.controlCalls.push('fire'); return true; }
  interact() { this.controlCalls.push('interact'); return true; }
  reload() { this.controlCalls.push('reload'); return true; }
  useMedkit() { this.controlCalls.push('medkit'); return true; }
  activateTracker() { this.controlCalls.push('tracker'); return true; }
  useEquipment() { this.controlCalls.push('equipment'); return true; }
  activateNeuroCountermeasure() { this.controlCalls.push('neuro'); return true; }
  setCoop(enabled) { this.coopEnabled = Boolean(enabled); return this.coopEnabled; }
  failMission(reason) { if (this.mission?.state === 'active') { this.mission.state = 'failed'; this.mission.failureReason = reason; } }
  restartFromCheckpoint() { if (this.mission?.state !== 'failed') return false; this.mission.state = 'active'; return true; }
  completeMission() { if (this.mission?.state !== 'active') return false; this.mission.state = 'complete'; return true; }
}

const VehicleRuntime = withV52MissionRuntime(VehicleBaseRuntime);

test('l’occupation ne change qu’après la dernière frame et la sortie reste verrouillée pendant sa séquence', () => {
  const events = [];
  const engine = new VehicleRuntime(events);
  assert.equal(engine.toggleVehicle(engine.player), true);
  assert.equal(engine.vehicle.accessTransition.phase, 'entering');
  assert.equal(engine.player.inVehicle, false);
  assert.equal(resolveVehicleAnimation(engine.vehicle).clipId, 'access-open');

  engine.updateVehicleAccessTransitionV59(VEHICLE_ACCESS_DURATION_V59 - 0.01);
  assert.equal(engine.player.inVehicle, false);
  engine.updateVehicleAccessTransitionV59(0.02);
  assert.equal(engine.player.inVehicle, true);
  assert.equal(engine.vehicle.occupied, true);
  assert.equal(resolveVehicleAnimation(engine.vehicle).clipId, 'secure-occupied');
  assert.equal(engine.toggleVehicle(engine.player), false);
  engine.vehicle.accessSecureClock = 0;

  assert.equal(engine.toggleVehicle(engine.player), true);
  assert.equal(engine.vehicle.accessTransition.phase, 'exiting');
  const beforeX = engine.vehicle.x;
  assert.equal(engine.updateVehicleDriver(engine.player, 0.2, {}), false);
  assert.equal(engine.baseDriverUpdates, 0);
  assert.equal(engine.vehicle.x, beforeX);
  engine.updateVehicleAccessTransitionV59(VEHICLE_ACCESS_DURATION_V59);
  assert.equal(engine.player.inVehicle, false);
  assert.equal(engine.vehicle.occupied, false);
  assert.deepEqual(events.filter((event) => event.type === 'vehicle-access-complete').map((event) => event.phase), ['entering', 'exiting']);
  assert.equal(engine.baseToggleCalls, 0);
});

test('mouvement, tir et actions restent verrouillés jusqu’à la vraie fermeture', () => {
  const engine = new VehicleRuntime();
  assert.equal(engine.toggleVehicle(engine.player), true);
  const before = { x: engine.player.x, y: engine.player.y };
  assert.equal(engine.updatePlayer(engine.player, 0.2, {}), false);
  assert.deepEqual({ x: engine.player.x, y: engine.player.y }, before);
  for (const invoke of [
    () => engine.fire(engine.player),
    () => engine.interact(engine.player),
    () => engine.reload(engine.player),
    () => engine.useMedkit(engine.player),
    () => engine.activateTracker(engine.player),
    () => engine.useEquipment('equipment-001', engine.player),
    () => engine.activateNeuroCountermeasure(engine.player)
  ]) assert.equal(invoke(), false);
  assert.deepEqual(engine.controlCalls, []);

  engine.updateVehicleAccessTransitionV59(VEHICLE_ACCESS_DURATION_V59);
  assert.equal(engine.updateVehicleDriver(engine.player, 0.2, {}), false);
  assert.equal(engine.fire(engine.player), false);
  engine.vehicle.accessSecureClock = 0;
  assert.equal(engine.fire(engine.player), true);
  assert.deepEqual(engine.controlCalls, ['fire']);
});

test('un commit hors portée émet un abandon explicite sans occupation fantôme', () => {
  const events = [];
  const engine = new VehicleRuntime(events);
  assert.equal(engine.toggleVehicle(engine.player), true);
  engine.player.x = 2000;
  assert.equal(engine.updateVehicleAccessTransitionV59(VEHICLE_ACCESS_DURATION_V59), false);
  assert.equal(engine.player.inVehicle, false);
  assert.equal(engine.vehicle.accessTransition, null);
  assert.equal(events.at(-1)?.reason, 'commit-rejected');
});

test('une mission inactive refuse ou annule toute mutation d’occupation et le restart nettoie la séquence', () => {
  const events = [];
  const engine = new VehicleRuntime(events);
  engine.mission = { state: 'failed' };
  assert.equal(engine.toggleVehicle(engine.player), false);
  assert.equal(engine.player.inVehicle, false);

  engine.mission.state = 'active';
  assert.equal(engine.toggleVehicle(engine.player), true);
  engine.mission.state = 'complete';
  assert.equal(engine.updateVehicleAccessTransitionV59(VEHICLE_ACCESS_DURATION_V59), false);
  assert.equal(engine.vehicle.accessTransition, null);
  assert.equal(engine.player.inVehicle, false);
  assert.equal(events.at(-1)?.reason, 'mission-inactive');

  engine.mission.state = 'active';
  assert.equal(engine.toggleVehicle(engine.player), true);
  engine.failMission('test');
  assert.equal(engine.vehicle.accessTransition, null);
  assert.equal(engine.restartFromCheckpoint(), true);
  assert.equal(engine.vehicle.accessSecureClock, 0);
});

test('un changement d’état externe ne peut pas inverser silencieusement la phase demandée', () => {
  const events = [];
  const engine = new VehicleRuntime(events);
  assert.equal(engine.toggleVehicle(engine.player), true);
  engine.player.inVehicle = true;
  assert.equal(engine.updateVehicleAccessTransitionV59(VEHICLE_ACCESS_DURATION_V59), false);
  assert.equal(engine.vehicle.accessTransition, null);
  assert.equal(events.at(-1)?.reason, 'state-desynchronized');
});

test('un véhicule sans plaque V59 conserve son embarquement immédiat historique', () => {
  const engine = new VehicleRuntime();
  Object.assign(engine.vehicle, {
    id: 'vehicle-004-m22a3-jackson-tank',
    name: 'M22A3 Jackson Tank'
  });
  assert.equal(engine.toggleVehicle(engine.player), true);
  assert.equal(engine.player.inVehicle, true);
  assert.equal(engine.vehicle.accessTransition, undefined);
  assert.equal(engine.baseToggleCalls, 1);
});

test('désactiver le coop annule son accès et ne laisse aucun conducteur invisible', () => {
  const events = [];
  const engine = new VehicleRuntime(events);
  engine.coopEnabled = true;
  assert.equal(engine.toggleVehicle(engine.coop), true);
  engine.setCoop(false);
  assert.equal(engine.vehicle.accessTransition, null);
  assert.equal(engine.coop.inVehicle, false);
  assert.equal(engine.vehicle.driver, null);
  assert.equal(engine.vehicle.occupied, false);
  assert.equal(events.find((event) => event.reason === 'coop-disabled')?.type, 'vehicle-access-abort');
});
