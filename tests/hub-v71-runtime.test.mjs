import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HUB_ANNEX_ART_ROLES_V71,
  HUB_ANNEXES_V71,
  HUB_ANNEX_STATE_KEY_V71,
  HUB_ANNEX_TRANSITION_SECONDS_V71,
  HUB_DECKS,
  HubGame,
  confirmHubPhysicalUpgradeV71,
  createHubCommercialStateV71
} from '../src/hub-v71-runtime.js';

class MockImage {
  static sources = [];

  constructor() {
    this.complete = true;
    this.naturalWidth = 1920;
    this.naturalHeight = 720;
  }

  set src(value) {
    this.currentSrc = value;
    MockImage.sources.push(value);
    if (value.endsWith('/echo9-marine-locomotion-sheet.png')) {
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
  MockImage.sources = [];
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

function parentState(annex, commercialState = createHubCommercialStateV71()) {
  const deck = HUB_DECKS.findIndex((entry) => entry.id === annex.parentDeck);
  const room = HUB_DECKS[deck].rooms.find((entry) => entry.id === annex.parentRoomId);
  return {
    deck,
    roomId: room.id,
    positionX: room.xStart + 180,
    visited: [room.id],
    [HUB_ANNEX_STATE_KEY_V71]: structuredClone(commercialState)
  };
}

function placeAtParentDoor(hub, annex) {
  const door = hub.getParentAnnexDoorV71(annex.id);
  assert.ok(door, `porte parente absente: ${annex.id}`);
  Object.assign(hub.player, {
    x: door.bounds.x + (door.bounds.w - hub.player.w) / 2,
    y: door.bounds.y + door.bounds.h - hub.player.h,
    vx: 0,
    vy: 0,
    grounded: true
  });
  return door;
}

function finishTransition(hub) {
  hub.update(HUB_ANNEX_TRANSITION_SECONDS_V71 / 2);
  assert.ok(hub.annexTransitionV71, 'la transition doit rester animée avant son terme');
  assert.ok(hub.annexTransitionV71.progress > 0 && hub.annexTransitionV71.progress < 1);
  hub.update(HUB_ANNEX_TRANSITION_SECONDS_V71 / 2 + 0.02);
  assert.equal(hub.annexTransitionV71, null);
}

function placeAtStation(hub, annex) {
  Object.assign(hub.player, {
    x: annex.station.bounds.x - hub.player.w - 12,
    y: annex.world.floorY - hub.player.h,
    vx: 0,
    vy: 0,
    grounded: true
  });
}

function placeAtAnnexExit(hub) {
  const door = hub.annexExitDoorV71();
  assert.ok(door);
  Object.assign(hub.player, {
    x: door.bounds.x + (door.bounds.w - hub.player.w) / 2,
    y: door.bounds.y + door.bounds.h - hub.player.h,
    vx: 0,
    vy: 0,
    grounded: true
  });
}

test('le runtime V71 expose le graphe 26 nœuds et charge les cinq couches uniquement à l’approche de chaque annexe', () => withRuntime(() => {
  const { hub } = createHub();
  assert.equal(hub.hubCommercialGraphV71.nodes.length, 26);
  assert.equal(hub.hubCommercialGraphV71.edges.length, 28);
  assert.equal(hub.annexImagesV71.size, 0);

  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  assert.equal(hub.annexImagesV71.size, 0, 'aucun lot annexe ne doit être préchargé au boot');
  assert.equal(MockImage.sources.filter((source) => source.includes('/annexes/v71/')).length, 0);

  const archives = HUB_ANNEXES_V71.find((annex) => annex.id === 'mire-archives');
  hub.stop(false);
  hub.start(parentState(archives));
  assert.equal(hub.annexImagesV71.size, 1);
  assert.equal(hub.getAnnexAssetGroupV71(archives.id).size, 5);
  assert.deepEqual([...hub.getAnnexAssetGroupV71(archives.id).keys()], HUB_ANNEX_ART_ROLES_V71);
  assert.deepEqual(
    [...hub.getAnnexAssetGroupV71(archives.id).values()].map((image) => image.currentSrc),
    HUB_ANNEX_ART_ROLES_V71.map((role) => archives.art[role])
  );
  const report = hub.getAssetReport();
  assert.equal(report.annexAssetCountV71, 50);
  assert.equal(report.annexAssetsLoadedV71, 5);
  assert.equal(report.annexAssetsReadyV71, 5);
  assert.equal(report.annexAssetGroupsLoadedV71, 1);
  hub.ensureAnnexAssetsV71(archives.id);
  assert.equal(MockImage.sources.filter((source) => source.includes(`/annexes/v71/${archives.id}/`)).length, 5);
}));

test('les dix portes physiques permettent dix allers-retours animés et dix stations locales sans ouvrir de menu', () => withRuntime(() => {
  const actions = [];
  const persisted = [];
  const { hub } = createHub({
    onAction: (event) => actions.push(event),
    onPersist: (patch) => persisted.push(structuredClone(patch))
  });
  let commercial = createHubCommercialStateV71();

  for (const annex of HUB_ANNEXES_V71) {
    if (hub.running) hub.stop(false);
    hub.start(parentState(annex, commercial));
    const parentDoor = placeAtParentDoor(hub, annex);
    assert.equal(parentDoor.roomId, annex.parentRoomId);
    assert.ok(parentDoor.bounds.y + parentDoor.bounds.h <= 624);
    hub.interact();
    assert.equal(hub.annexTransitionV71.direction, 'enter');
    assert.equal(hub.getSnapshot().activeAnnexV71, false);
    finishTransition(hub);

    let snapshot = hub.getSnapshot();
    assert.equal(snapshot.activeAnnexV71, true, annex.id);
    assert.equal(snapshot.activeAnnexIdV71, annex.id);
    assert.equal(snapshot.roomId, annex.id);
    assert.equal(snapshot.hubCommercialGraphRoomCountV71, 26);
    assert.equal(snapshot.activeAnnexAssetsReadyV71, 5);
    assert.ok(snapshot.x >= 24 && snapshot.x <= annex.world.width - hub.player.w - 24);

    placeAtStation(hub, annex);
    hub.interact();
    snapshot = hub.getSnapshot();
    assert.equal(snapshot.stationUsesV71[annex.id], 1, annex.id);
    assert.equal(snapshot.hubCommercialV71.annexes[annex.id].visitCount, 1, annex.id);
    assert.equal(snapshot.hubCommercialV71.annexes[annex.id].station.activated, true, annex.id);
    assert.equal(actions.at(-1).type, 'hub:annex-station');
    assert.equal(actions.at(-1).action, annex.station.action);
    assert.equal(actions.at(-1).noMenu, true);

    placeAtAnnexExit(hub);
    hub.interact();
    assert.equal(hub.annexTransitionV71.direction, 'exit');
    assert.equal(hub.getSnapshot().activeAnnexV71, true, 'la salle reste active pendant la fermeture du sas');
    finishTransition(hub);
    snapshot = hub.getSnapshot();
    assert.equal(snapshot.activeAnnexV71, false, annex.id);
    assert.equal(snapshot.roomId, annex.parentRoomId, annex.id);
    commercial = structuredClone(snapshot.hubCommercialV71);
  }

  assert.deepEqual(commercial.visitedAnnexIds, HUB_ANNEXES_V71.map((annex) => annex.id));
  assert.deepEqual(commercial.activatedStationIds, HUB_ANNEXES_V71.map((annex) => annex.station.id));
  assert.deepEqual(
    commercial.stationUses,
    Object.fromEntries(HUB_ANNEXES_V71.map((annex) => [annex.id, 1]))
  );
  assert.ok(HUB_ANNEXES_V71.every((annex) => commercial.annexes[annex.id].visitCount === 1));
  assert.equal(actions.filter((event) => event.type === 'hub:annex-station').length, 10);
  assert.ok(actions.filter((event) => event.type === 'hub:annex-transition').every((event) => event.noMenu));
  assert.ok(persisted.every((patch) => patch[HUB_ANNEX_STATE_KEY_V71]));
}));

test('la position locale, les visites et les usages survivent à une restauration au milieu d’une annexe', () => withRuntime(() => {
  const patches = [];
  const logistics = HUB_ANNEXES_V71.find((annex) => annex.id === 'logistics');
  const { hub } = createHub({ onPersist: (patch) => patches.push(structuredClone(patch)) });
  hub.start(parentState(logistics));
  placeAtParentDoor(hub, logistics);
  hub.interact();
  finishTransition(hub);
  placeAtStation(hub, logistics);
  hub.interact();
  Object.assign(hub.player, {
    x: 1120,
    y: logistics.platforms.find((platform) => platform.role === 'catwalk').y - hub.player.h,
    vx: 0,
    vy: 0,
    grounded: true,
    climbing: false
  });
  hub.persist();
  const patch = patches.at(-1);
  assert.equal(patch[HUB_ANNEX_STATE_KEY_V71].activeAnnexId, logistics.id);
  assert.equal(patch[HUB_ANNEX_STATE_KEY_V71].annexPositionX, 1120);
  assert.equal(patch[HUB_ANNEX_STATE_KEY_V71].annexPositionY, 376);
  assert.equal(patch[HUB_ANNEX_STATE_KEY_V71].annexClimbing, false);
  assert.notEqual(patch.positionX, 1120, 'la position locale ne doit pas écraser la position du pont parent');

  const restoredEvents = [];
  const { hub: restored } = createHub({ onAction: (event) => restoredEvents.push(event) });
  restored.start(patch);
  let snapshot = restored.getSnapshot();
  assert.equal(snapshot.activeAnnexIdV71, logistics.id);
  assert.equal(snapshot.x, 1120);
  assert.equal(snapshot.y, 376);
  assert.equal(snapshot.hubCommercialV71.annexPositionY, 376);
  assert.equal(snapshot.hubCommercialV71.annexClimbing, false);
  assert.equal(restored.player.grounded, true);
  assert.equal(snapshot.stationUsesV71.logistics, 1);
  assert.deepEqual(snapshot.visitedAnnexIdsV71, [logistics.id]);
  assert.equal(snapshot.activeAnnexAssetsReadyV71, 5);
  placeAtAnnexExit(restored);
  restored.interact();
  finishTransition(restored);
  snapshot = restored.getSnapshot();
  assert.equal(snapshot.activeAnnexV71, false);
  assert.equal(snapshot.roomId, logistics.parentRoomId);
  assert.ok(restoredEvents.some((event) => event.action === 'hub:annex-exit-complete'));
}));

test('le sous-niveau applique marche, saut, échelle, caméra et collisions auteur', () => withRuntime(() => {
  const logistics = HUB_ANNEXES_V71.find((annex) => annex.id === 'logistics');
  const { hub } = createHub();
  hub.start(parentState(logistics));
  placeAtParentDoor(hub, logistics);
  hub.interact();
  finishTransition(hub);

  Object.assign(hub.player, { x: 900, y: logistics.world.floorY - hub.player.h, vx: 0, vy: 0, grounded: true });
  hub.setControl('crouch', true);
  hub.setControl('right', true);
  hub.update(0.05);
  assert.equal(hub.player.crouching, true);
  assert.ok(hub.player.vx > 0 && hub.player.vx <= 105, 'l’accroupissement doit limiter la vitesse');
  hub.setControl('right', false);
  hub.setControl('crouch', false);
  hub.update(0.05);
  assert.equal(hub.player.crouching, false);

  Object.assign(hub.player, { x: 900, y: logistics.world.floorY - hub.player.h, vx: 0, vy: 0, grounded: true });
  const floorY = hub.player.y;
  hub.setControl('jump', true);
  hub.update(0.016);
  assert.ok(hub.player.y < floorY);
  assert.ok(hub.player.vy < 0);

  const station = logistics.station.bounds;
  Object.assign(hub.player, {
    x: station.x - hub.player.w - 2,
    y: logistics.world.floorY - hub.player.h,
    vx: 0,
    vy: 0,
    grounded: true
  });
  hub.keys.delete('Space');
  hub.setControl('right', true);
  hub.update(0.1);
  hub.setControl('right', false);
  assert.equal(hub.player.x, station.x - hub.player.w, 'le collider de station bloque le passage');

  const ladder = logistics.ladders[0];
  Object.assign(hub.player, {
    x: ladder.x + ladder.w / 2 - hub.player.w / 2,
    y: ladder.bottom - hub.player.h,
    vx: 0,
    vy: 0,
    grounded: true,
    climbing: false
  });
  hub.keys.add('KeyW');
  hub.keys.add('KeyC');
  const ladderStartY = hub.player.y;
  hub.update(0.1);
  hub.keys.delete('KeyW');
  hub.keys.delete('KeyC');
  assert.equal(hub.player.climbing, true);
  assert.equal(hub.player.crouching, false);
  assert.ok(hub.player.y < ladderStartY);

  Object.assign(hub.player, { x: 1680, y: logistics.world.floorY - hub.player.h, vx: 0, vy: 0, grounded: true });
  hub.update(0.2);
  assert.ok(hub.annexCameraV71.x > 0 && hub.annexCameraV71.x <= 640);
}));

test('le chemin au sol relie réellement chaque sas à sa station sans nervure bloquante', () => withRuntime(() => {
  for (const annex of HUB_ANNEXES_V71) {
    const { hub } = createHub();
    hub.start(parentState(annex));
    placeAtParentDoor(hub, annex);
    hub.interact();
    finishTransition(hub);

    const direction = annex.station.bounds.x < hub.player.x ? 'KeyA' : 'KeyD';
    hub.keys.add(direction);
    for (let step = 0; step < 720 && !hub.nearestAnnexStationV71(); step += 1) hub.update(1 / 60);
    hub.keys.delete(direction);

    assert.equal(hub.nearestAnnexStationV71()?.id, annex.station.id, annex.id);
    hub.stop(false);
  }
}));

test('une reprise sur échelle conserve Y et climbing tandis qu’une sauvegarde dans un collider est relocalisée', () => withRuntime(() => {
  const logistics = HUB_ANNEXES_V71.find((annex) => annex.id === 'logistics');
  const ladder = logistics.ladders[0];
  const climbingState = createHubCommercialStateV71();
  climbingState.activeAnnexId = logistics.id;
  climbingState.annexPositionX = ladder.x + ladder.w / 2 - 22;
  climbingState.annexPositionY = 430;
  climbingState.annexClimbing = true;
  climbingState.returnContext = {
    deckId: logistics.parentDeck,
    roomId: logistics.parentRoomId,
    x: 340
  };

  const climbingPatches = [];
  const { hub: climbing } = createHub({ onPersist: (patch) => climbingPatches.push(structuredClone(patch)) });
  climbing.start(parentState(logistics, climbingState));
  assert.equal(climbing.player.climbing, true);
  assert.equal(Math.round(climbing.player.y), 430);
  assert.equal(
    Math.round(climbing.player.x + climbing.player.w / 2),
    Math.round(ladder.x + ladder.w / 2)
  );
  climbing.persist();
  assert.equal(climbingPatches.at(-1)[HUB_ANNEX_STATE_KEY_V71].annexPositionY, 430);
  assert.equal(climbingPatches.at(-1)[HUB_ANNEX_STATE_KEY_V71].annexClimbing, true);

  const colliderState = createHubCommercialStateV71();
  colliderState.activeAnnexId = logistics.id;
  colliderState.annexPositionX = logistics.station.bounds.x + 40;
  colliderState.annexPositionY = logistics.world.floorY - 92;
  colliderState.annexClimbing = false;
  colliderState.returnContext = {
    deckId: logistics.parentDeck,
    roomId: logistics.parentRoomId,
    x: 340
  };
  const { hub: relocated } = createHub();
  relocated.start(parentState(logistics, colliderState));
  const actor = relocated.player;
  const intersects = logistics.colliders.some((collider) => (
    actor.x < collider.x + collider.w
    && actor.x + actor.w > collider.x
    && actor.y < collider.y + collider.h
    && actor.y + actor.h > collider.y
  ));
  assert.equal(intersects, false, 'une reprise ne doit jamais laisser le joueur dans un collider');
  assert.notEqual(Math.round(actor.x), colliderState.annexPositionX);
}));

test('une station refusée par le domaine ne consomme ni usage ni sauvegarde runtime', () => withRuntime(() => {
  const logistics = HUB_ANNEXES_V71.find((annex) => annex.id === 'logistics');
  const actions = [];
  const persisted = [];
  const { hub } = createHub({
    onAction: (event) => {
      actions.push(event);
      return event.type === 'hub:annex-station' ? false : undefined;
    },
    onPersist: (patch) => persisted.push(structuredClone(patch))
  });
  hub.start(parentState(logistics));
  placeAtParentDoor(hub, logistics);
  hub.interact();
  finishTransition(hub);
  placeAtStation(hub, logistics);
  const before = structuredClone(hub.hubCommercialStateV71);
  const persistenceCount = persisted.length;
  const rejected = hub.confirmHubPhysicalUpgradeV71(logistics.id);

  assert.equal(rejected.applied, false);
  assert.equal(rejected.rejected, true);
  assert.equal(rejected.effect, null);
  assert.deepEqual(hub.hubCommercialStateV71, before);
  assert.equal(hub.hubCommercialStateV71.stationUses.logistics, 0);
  assert.equal(hub.annexLastStationReceiptV71, null);
  assert.equal(persisted.length, persistenceCount);
  assert.equal(actions.at(-1).type, 'hub:annex-station');

  hub.onAction = (event) => actions.push(event);
  const accepted = hub.confirmHubPhysicalUpgradeV71(logistics.id);
  assert.equal(accepted.applied, true);
  assert.equal(hub.hubCommercialStateV71.stationUses.logistics, 1);
  assert.equal(persisted.length, persistenceCount + 1);
}));

test('le HUD V71 dessine un seul prompt à la fois dans le hub et dans l’annexe', () => withRuntime(() => {
  const trace = { texts: [], drawImages: [] };
  const archives = HUB_ANNEXES_V71.find((annex) => annex.id === 'mire-archives');
  const { hub } = createHub({}, trace);
  hub.start(parentState(archives));
  placeAtParentDoor(hub, archives);
  trace.texts.length = 0;
  hub.draw();
  let prompts = trace.texts.map(([text]) => String(text)).filter((text) => /E [—·] ENTRER/.test(text));
  assert.equal(prompts.length, 1, prompts.join(' | '));

  hub.interact();
  finishTransition(hub);
  placeAtStation(hub, archives);
  trace.texts.length = 0;
  hub.draw();
  prompts = trace.texts.map(([text]) => String(text)).filter((text) => text.startsWith('E — '));
  assert.equal(prompts.length, 1, prompts.join(' | '));
  assert.match(prompts[0], /INDEXER LES PREUVES/);
  const propDraw = trace.drawImages.find(([image]) => image?.currentSrc?.endsWith('/prop.webp'));
  assert.ok(propDraw, 'la couche prop doit être dessinée dans le sous-niveau');
  assert.equal(propDraw.length, 9, 'le cadrage doit utiliser les bornes alpha de la source');
  assert.equal(propDraw[7], archives.station.bounds.w);
  assert.equal(propDraw[8], archives.station.bounds.h);
  assert.equal(propDraw[6] + propDraw[8], archives.world.floorY, 'le pied visible ne doit pas flotter');
}));

test('l’API publique confirme aussi un état pur et refuse une activation runtime hors portée', () => withRuntime(() => {
  const pure = confirmHubPhysicalUpgradeV71(createHubCommercialStateV71(), 'cctv');
  assert.equal(pure.applied, true);
  assert.equal(pure.state.stationUses.cctv, 1);

  const cctv = HUB_ANNEXES_V71.find((annex) => annex.id === 'cctv');
  const { hub } = createHub();
  hub.start(parentState(cctv));
  assert.equal(confirmHubPhysicalUpgradeV71(hub, cctv.id).applied, false);
  placeAtParentDoor(hub, cctv);
  hub.interact();
  finishTransition(hub);
  assert.equal(confirmHubPhysicalUpgradeV71(hub, cctv.id).applied, false);
  placeAtStation(hub, cctv);
  assert.equal(confirmHubPhysicalUpgradeV71(hub, cctv.id).applied, true);
}));

test('les conduits et les seize routines V62 restent actifs hors des annexes', () => withRuntime(() => {
  const { hub } = createHub();
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 }, { routineContextV62: { clock: { day: 2, hour: 8 } } });
  assert.equal(hub.getNpcRoutineResolutionsV62().length, 16);
  assert.equal(hub.getSnapshot().ventActiveV62, false);
  const hatch = hub.v51Vents.find((entry) => entry.roomId === 'bridge');
  assert.ok(hatch);
  Object.assign(hub.player, { x: hatch.x + 12, y: hatch.y + 8, vx: 0, vy: 0, grounded: false });
  hub.interact();
  assert.equal(hub.getSnapshot().ventActiveV62, true);
  assert.equal(hub.getSnapshot().activeAnnexV71, false);
  hub.update(0.24);
  hub.update(0.24);
  assert.equal(hub.ventActorV62.ventTransit.phase, 'at-node');
}));

test('les dix échelles autorisent montée complète, sortie latérale et saut sans capturer le joueur', () => withRuntime(() => {
  for (const annex of HUB_ANNEXES_V71) {
    const { hub } = createHub();
    hub.start(parentState(annex));
    placeAtParentDoor(hub, annex);
    hub.interact();
    finishTransition(hub);
    const ladder = annex.ladders[0];
    const x = ladder.x + ladder.w / 2 - hub.player.w / 2;
    Object.assign(hub.player, { x, y: ladder.bottom - hub.player.h, climbing: false, grounded: true, vx: 0, vy: 0 });
    hub.setControl('up', true);
    hub.keys.add('KeyW');
    for (let i = 0; i < 70; i += 1) hub.update(1 / 60);
    assert.equal(hub.player.climbing, false, `${annex.id}: la sortie haute doit libérer l’échelle`);
    assert.equal(hub.player.grounded, true, `${annex.id}: la sortie haute doit poser le joueur`);
    assert.equal(hub.player.vy, 0, `${annex.id}: la vitesse d’échelle ne doit pas lancer le joueur`);
    hub.keys.clear();
    assert.ok(Math.abs(hub.player.y + hub.player.h - ladder.top) < 2, annex.id);
    const dismount = annex.entranceSide === 'west' ? 'left' : 'right';
    hub.setControl(dismount, true);
    for (let i = 0; i < 20; i += 1) hub.update(1 / 60);
    assert.equal(hub.player.climbing, false, annex.id);
    assert.ok(Math.abs(hub.player.x - x) > 15, annex.id);
    hub.keys.clear();
    Object.assign(hub.player, { x, y: 430, climbing: true, grounded: false, vx: 0, vy: 0 });
    hub.setControl('jump', true);
    hub.update(1 / 60);
    assert.equal(hub.player.climbing, false, annex.id);
    assert.ok(hub.player.vy < 0, annex.id);
    hub.stop(false);
  }
}));

test('les plafonds solides bloquent la tête même après une frame longue et les passerelles restent à sens unique', () => withRuntime(() => {
  const annex = HUB_ANNEXES_V71.find((entry) => entry.id === 'logistics');
  const { hub } = createHub();
  hub.start(parentState(annex));
  placeAtParentDoor(hub, annex);
  hub.interact();
  finishTransition(hub);
  const rib = annex.colliders.find((entry) => entry.role === 'structure');
  Object.assign(hub.player, { x: rib.x + 4, y: annex.world.floorY - hub.player.h, vx: 0, vy: 0, grounded: true, climbing: false });
  hub.setControl('jump', true);
  hub.update(0.25);
  assert.ok(hub.player.y >= rib.y + rib.h, 'la tête ne traverse pas la nervure');
  assert.ok(hub.player.y + hub.player.h <= annex.world.floorY + 1);
  hub.keys.clear();
  const catwalk = annex.platforms.find((entry) => entry.role === 'catwalk');
  Object.assign(hub.player, { x: catwalk.x + 8, y: annex.world.floorY - hub.player.h, vx: 0, vy: 0, grounded: true, climbing: false });
  hub.setControl('jump', true);
  for (let i = 0; i < 30; i += 1) hub.update(1 / 60);
  assert.ok(hub.player.y < catwalk.y, 'la tête traverse la passerelle depuis dessous sans collision plafond');
}));

test('le foreground est un prop ancré de taille humaine et tous les accessoires déclarés possèdent un bitmap rendu', () => withRuntime(() => {
  for (const annex of HUB_ANNEXES_V71) {
    const trace = { texts: [], drawImages: [] };
    const { hub } = createHub({}, trace);
    hub.start(parentState(annex));
    placeAtParentDoor(hub, annex);
    hub.interact();
    finishTransition(hub);
    trace.drawImages.length = 0;
    hub.draw();
    const foreground = trace.drawImages.find(([image]) => image?.currentSrc === annex.art.foreground);
    assert.ok(foreground, annex.id);
    assert.equal(foreground.length, 9);
    assert.ok(foreground[7] <= 240 && foreground[8] <= 212, 'pas d’objet géant étiré plein-écran');
    assert.ok(Math.abs(foreground[3] / foreground[4] - foreground[7] / foreground[8]) < 0.001, 'aspect conservé');
    for (const prop of annex.props) {
      const asset = prop.asset || annex.art[prop.artRole];
      assert.ok(asset, `aucun bitmap: ${prop.id}`);
      assert.ok(trace.drawImages.some(([image]) => image?.currentSrc === asset), `non dessiné: ${prop.id}`);
      if (prop.collidable) assert.ok(annex.colliders.some((entry) => entry.x === prop.x && entry.y === prop.y && entry.w === prop.w && entry.h === prop.h), `collider fantôme: ${prop.id}`);
    }
    hub.stop(false);
  }
}));

test('le joueur et les PNJ humains du hub partagent le même étalon de rendu sans grandissement arbitraire', () => withRuntime(() => {
  const trace = { texts: [], drawImages: [] };
  const { hub } = createHub({}, trace);
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  trace.drawImages.length = 0;
  hub.draw();
  const playerDraw = trace.drawImages.find(([image]) => image === hub.playerSheet);
  assert.ok(playerDraw);
  assert.equal(playerDraw[8], 128);
  const npcSources = new Set([...hub.npcImagesBySheetId.values()]);
  const npcDraws = trace.drawImages.filter(([image]) => npcSources.has(image));
  assert.ok(npcDraws.length >= 4);
  for (const npcDraw of npcDraws) assert.equal(npcDraw[8], playerDraw[8]);
}));

test('le facing Echo-9 survit à une persistance et une reprise complète du hub', () => withRuntime(() => {
  const persisted = [];
  const first = createHub({ onPersist: (patch) => persisted.push(structuredClone(patch)) }).hub;
  first.start({ deck: 0, roomId: 'bridge', positionX: 180, facing: -1 });
  assert.equal(first.player.facing, -1);
  first.persist();
  assert.equal(persisted.at(-1).facing, -1);
  first.stop(false);

  const resumed = createHub().hub;
  resumed.start(persisted.at(-1));
  assert.equal(resumed.player.facing, -1);
  resumed.player.vx = 0;
  resumed.update(0.016);
  assert.equal(resumed.player.facing, -1, 'le repos ne doit pas réinitialiser le facing');
  resumed.stop(false);
}));

test('le facing Echo-9 survit à une station, une reprise et une sortie d annexe', () => withRuntime(() => {
  const logistics = HUB_ANNEXES_V71.find((annex) => annex.id === 'logistics');
  const persisted = [];
  const first = createHub({ onPersist: (patch) => persisted.push(structuredClone(patch)) }).hub;
  first.start({ ...parentState(logistics), facing: -1 });
  placeAtParentDoor(first, logistics);
  first.player.facing = -1;
  first.interact();
  finishTransition(first);
  first.player.facing = -1;
  placeAtStation(first, logistics);
  assert.equal(first.confirmHubPhysicalUpgradeV71(logistics.id).applied, true);
  first.persist();

  const patch = persisted.at(-1);
  assert.equal(patch.facing, -1);
  assert.equal(patch[HUB_ANNEX_STATE_KEY_V71].returnContext.facing, -1);
  first.stop(false);

  const resumed = createHub().hub;
  resumed.start(patch);
  assert.equal(resumed.player.facing, -1);
  assert.equal(resumed.annexReturnPoseV71.facing, -1);
  resumed.deactivateAnnexV71(logistics);
  assert.equal(resumed.player.facing, -1);
  resumed.stop(false);
}));
