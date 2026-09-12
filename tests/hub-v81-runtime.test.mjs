import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HUB_ANNEX_BY_ID_V71,
  HUB_ANNEX_STATE_KEY_V71,
  HUB_ANNEX_TRANSITION_SECONDS_V71,
  HUB_DECKS,
  PROVING_GROUND_FIRING_PAD_V81,
  PROVING_GROUND_TARGETS_V81,
  PROVING_GROUND_STATE_KEY_V81,
  HubGame,
  createHubCommercialStateV71
} from '../src/hub-v81-runtime.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1920;
    this.naturalHeight = 720;
  }

  set src(value) {
    this.currentSrc = value;
    if (value.includes('proving-ground-target-cycle-v81') || value.includes('proving-ground-impact-cycle-v81')) {
      this.naturalWidth = 2048;
      this.naturalHeight = 1024;
    } else if (value.includes('proving-ground-range-console-v81')) {
      this.naturalWidth = 1024;
      this.naturalHeight = 1024;
    } else if (value.includes('/echo9-marine-') && value.endsWith('-sheet.png')) {
      this.naturalWidth = 1024;
      this.naturalHeight = 1024;
    } else if (value.endsWith('/prop.webp')) {
      this.naturalWidth = 640;
      this.naturalHeight = 512;
    } else if (value.endsWith('/door.webp')) {
      this.naturalWidth = 384;
      this.naturalHeight = 512;
    }
  }
}

function mockContext(trace = { texts: [], drawImages: [] }) {
  const gradient = { addColorStop() {} };
  const base = {
    measureText: (text) => ({ width: String(text).length * 8 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    fillText: (...args) => trace.texts.push(args),
    drawImage: (...args) => trace.drawImages.push(args)
  };
  return new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
}

function withRuntime(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance,
    matchMedia: globalThis.matchMedia
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.performance = { now: () => 1000 };
  globalThis.matchMedia = () => ({ matches: false });
  try { return run(); }
  finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
    globalThis.performance = previous.performance;
    globalThis.matchMedia = previous.matchMedia;
  }
}

function createHub(options = {}, trace = { texts: [], drawImages: [] }) {
  const context = mockContext(trace);
  const canvas = {
    width: 1280,
    height: 720,
    getContext: () => context,
    addEventListener() {},
    focus() {}
  };
  return { hub: new HubGame(canvas, options), trace };
}

const proving = HUB_ANNEX_BY_ID_V71['proving-ground'];

function provingParentState(commercialState = createHubCommercialStateV71()) {
  const deck = HUB_DECKS.findIndex((entry) => entry.id === proving.parentDeck);
  const room = HUB_DECKS[deck].rooms.find((entry) => entry.id === proving.parentRoomId);
  return {
    deck,
    roomId: room.id,
    positionX: room.xStart + 180,
    visited: [room.id],
    [HUB_ANNEX_STATE_KEY_V71]: structuredClone(commercialState)
  };
}

function enterProvingGround(hub) {
  const door = hub.getParentAnnexDoorV71(proving.id);
  assert.ok(door);
  assert.equal(door.roomId, 'armory');
  assert.equal(door.annex.entranceSide, 'east');
  Object.assign(hub.player, {
    x: door.bounds.x + (door.bounds.w - hub.player.w) / 2,
    y: door.bounds.y + door.bounds.h - hub.player.h,
    vx: 0,
    vy: 0,
    grounded: true
  });
  hub.interact();
  hub.update(HUB_ANNEX_TRANSITION_SECONDS_V71 / 2);
  hub.update(HUB_ANNEX_TRANSITION_SECONDS_V71 / 2 + 0.02);
  assert.equal(hub.currentAnnexV71()?.id, proving.id);
}

function placeAtStation(hub) {
  Object.assign(hub.player, {
    x: proving.station.bounds.x - hub.player.w - 12,
    y: proving.world.floorY - hub.player.h,
    vx: 0,
    vy: 0,
    grounded: true,
    climbing: false
  });
}

function startCourse(hub) {
  placeAtStation(hub);
  hub.interact();
  assert.equal(hub.provingGroundStateV81.phase, 'armed');
  Object.assign(hub.player, {
    ...PROVING_GROUND_FIRING_PAD_V81.playerPose,
    vx: 0,
    vy: 0,
    grounded: true,
    climbing: false
  });
  hub.update(1 / 60);
  assert.equal(hub.provingGroundStateV81.phase, 'active');
}

function fireAtCurrentTarget(hub, visibleTargetIds = null) {
  const target = hub.provingGroundStateV81.targets[hub.provingGroundStateV81.currentTargetIndex];
  const authoredTarget = PROVING_GROUND_TARGETS_V81.find((entry) => entry.id === target.id);
  assert.ok(authoredTarget, target.id);
  const screenLeft = authoredTarget.bounds.x - hub.annexCameraV71.x;
  const screenRight = screenLeft + authoredTarget.bounds.w;
  assert.ok(screenLeft >= 0 && screenRight <= 1280, `${target.id} hors viewport: ${screenLeft}..${screenRight}`);
  visibleTargetIds?.add(target.id);
  if (target.lane === 'high') hub.setControl('aim-high', true);
  if (target.lane === 'low') hub.setControl('aim-low', true);
  const hitsBefore = hub.provingGroundStateV81.hits;
  const shot = hub.fire();
  assert.ok(shot, `tir refusé sur ${target.id}`);
  hub.drawPlayer(hub.ctx);
  assert.equal(hub.player.playerVisualV81.sheetId, 'player.echo9-marine.combat');
  assert.equal(hub.player.playerVisualV81.fallback, false);
  if (target.lane === 'high') hub.setControl('aim-high', false);
  if (target.lane === 'low') hub.setControl('aim-low', false);
  for (let frame = 0; frame < 180 && hub.provingGroundStateV81.hits === hitsBefore; frame += 1) {
    hub.update(1 / 120);
  }
  assert.equal(hub.provingGroundStateV81.hits, hitsBefore + 1, target.id);
  assert.equal(hub.player.fireClock, 0, 'la pose de tir doit revenir à la locomotion après 0,18 s');
}

test('la route armurerie-est reste physique et E arme le stand sans bonus de simple station', () => withRuntime(() => {
  const actions = [];
  const statuses = [];
  const { hub } = createHub({
    onAction: (event) => actions.push(event),
    onStatus: (status) => statuses.push(structuredClone(status))
  });
  hub.start(provingParentState());
  assert.equal(hub.isProvingGroundActiveV81(), false);
  assert.equal(hub.getParentAnnexDoorV71(proving.id).deckId, 'industrial');
  enterProvingGround(hub);
  assert.equal(hub.getAssetReport().provingGroundAssetsLoadedV81, 3);
  placeAtStation(hub);

  const legacy = hub.confirmHubPhysicalUpgradeV71(proving.id);
  assert.equal(legacy.applied, false);
  assert.equal(legacy.deferred, true);
  assert.equal(hub.hubCommercialStateV71.stationUses[proving.id], 0);
  hub.interact();
  assert.equal(hub.provingGroundStateV81.phase, 'armed');
  assert.equal(hub.hubCommercialStateV71.stationUses[proving.id], 0);
  assert.equal(actions.filter((event) => event.type === 'hub:annex-station').length, 0);
  assert.equal(actions.filter((event) => event.type === 'hub:proving-ground-armed').length, 1);
  assert.equal(actions.find((event) => event.type === 'hub:proving-ground-armed').action, 'hub:proving-ground-armed');
  const status = statuses.at(-1);
  assert.equal(status.provingGroundActiveV81, true);
  assert.equal(status.provingGroundPhaseV81, 'armed');
  assert.equal(status.provingGroundTargetsRemainingV81, 9);
  assert.equal(status.provingGroundMagazineV81, 4);
  assert.equal(status.provingGroundReserveV81, 95);
}));

test('le runtime touche les neuf cibles avec trois angles normalisés et un rechargement obligatoire', () => withRuntime(() => {
  const actions = [];
  const patches = [];
  const { hub } = createHub({
    onAction: (event) => actions.push(structuredClone(event)),
    onPersist: (patch) => patches.push(structuredClone(patch))
  });
  hub.start(provingParentState());
  enterProvingGround(hub);
  startCourse(hub);
  const visibleTargetIds = new Set();

  for (let index = 0; index < 4; index += 1) {
    const lane = hub.provingGroundStateV81.targets[hub.provingGroundStateV81.currentTargetIndex].lane;
    fireAtCurrentTarget(hub, visibleTargetIds);
    const lastImpact = hub.provingImpactsV81.at(-1);
    assert.ok(lastImpact || index < 3, lane);
  }
  assert.equal(hub.provingGroundStateV81.ammo.magazine, 0);
  assert.equal(hub.fire(), false);
  const reload = hub.requestProvingGroundReloadV81();
  assert.equal(reload.started, true);
  for (let frame = 0; frame < 190 && hub.provingGroundStateV81.reload.active; frame += 1) hub.update(1 / 120);
  assert.equal(
    hub.provingGroundStateV81.reload.active,
    false,
    JSON.stringify({
      phase: hub.provingGroundStateV81.phase,
      remaining: hub.provingGroundStateV81.reload.remainingSeconds,
      reloadCount: hub.provingGroundStateV81.reloadCount
    })
  );
  assert.equal(hub.provingGroundStateV81.reloadCount, 1);

  while (hub.provingGroundStateV81.phase === 'active') fireAtCurrentTarget(hub, visibleTargetIds);
  const snapshot = hub.getSnapshot();
  assert.deepEqual([...visibleTargetIds], PROVING_GROUND_TARGETS_V81.map((target) => target.id));
  assert.equal(snapshot.provingGroundV81.phase, 'completed');
  assert.equal(snapshot.provingGroundV81.hits, 9);
  assert.deepEqual(snapshot.provingGroundV81.laneHits, { high: 3, level: 3, low: 3 });
  assert.equal(snapshot.provingProjectileCountV81, 0);
  assert.equal(snapshot.provingGroundV81.completionReceipt.powerLoaderCertified, false);
  assert.equal(snapshot.provingGroundV81.completionReceipt.advancedTutorialsComplete, false);
  assert.equal(snapshot.provingGroundV81.claimedReceiptIds.length, 1);
  assert.equal(actions.filter((event) => event.type === 'hub:proving-ground-qualified').length, 1);
  const qualificationEvent = actions.find((event) => event.type === 'hub:proving-ground-qualified');
  assert.equal(qualificationEvent.action, 'hub:proving-ground-qualified');
  assert.equal(qualificationEvent.receipt.bonus.nextOperationCharge, true);
  for (let frame = 0; frame < 20; frame += 1) hub.update(1 / 60);
  assert.equal(actions.filter((event) => event.type === 'hub:proving-ground-qualified').length, 1);
  assert.ok(patches.at(-1)[PROVING_GROUND_STATE_KEY_V81]);
  assert.equal(Object.hasOwn(patches.at(-1)[PROVING_GROUND_STATE_KEY_V81], 'projectiles'), false);
}));

test('une reprise conserve la cible et le rechargement mais élimine le projectile en vol', () => withRuntime(() => {
  const patches = [];
  const { hub } = createHub({ onPersist: (patch) => patches.push(structuredClone(patch)) });
  hub.start(provingParentState());
  enterProvingGround(hub);
  startCourse(hub);
  const shot = hub.fire();
  assert.ok(shot);
  assert.equal(hub.provingProjectilesV81.length, 1);
  hub.requestProvingGroundReloadV81();
  hub.update(0.2);
  hub.persist();
  const patch = patches.at(-1);
  assert.equal(patch[PROVING_GROUND_STATE_KEY_V81].phase, 'active');
  assert.equal(patch[PROVING_GROUND_STATE_KEY_V81].shots, 1);
  assert.equal(patch[PROVING_GROUND_STATE_KEY_V81].reload.active, true);
  assert.equal(Object.hasOwn(patch[PROVING_GROUND_STATE_KEY_V81], 'projectiles'), false);

  const statuses = [];
  const { hub: restored } = createHub({ onStatus: (status) => statuses.push(structuredClone(status)) });
  restored.start(patch);
  const snapshot = restored.getSnapshot();
  assert.equal(snapshot.activeAnnexIdV71, proving.id);
  assert.equal(snapshot.provingGroundV81.phase, 'active');
  assert.equal(snapshot.provingGroundV81.currentTargetIndex, 0);
  assert.equal(snapshot.provingGroundV81.shots, 1);
  assert.equal(snapshot.provingGroundV81.reload.active, true);
  assert.equal(snapshot.provingProjectileCountV81, 0);
  assert.equal(Math.round(restored.player.x), PROVING_GROUND_FIRING_PAD_V81.playerPose.x);
  assert.equal(Math.round(restored.player.y), PROVING_GROUND_FIRING_PAD_V81.playerPose.y);
  const status = statuses.at(-1);
  assert.equal(status.provingGroundActiveV81, true);
  assert.equal(status.provingGroundPhaseV81, 'active');
  assert.equal(status.provingGroundScoreV81, 0);
  assert.equal(status.provingGroundMagazineV81, 3);
  assert.equal(status.provingGroundReserveV81, 95);
  assert.equal(status.provingGroundReloadingV81, true);
}));
