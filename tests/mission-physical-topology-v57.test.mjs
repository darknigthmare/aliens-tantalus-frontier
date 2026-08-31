import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine as ProductionCoreEngine } from '../src/game-production-core.js';
import { getMissionSurfaceMetrics } from '../src/game-v51-runtime.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { withV52LevelRuntime } from '../src/game-v52-level-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { MISSION_VENT_NETWORKS_V62, getVentTransitPositionV62 } from '../src/vent-network-v62.js';
import {
  CAMPAIGNS,
  CREW,
  ENEMIES,
  EQUIPMENT,
  LEVEL_SEEDS,
  VEHICLES,
  WEAPONS,
  WORLDS
} from '../src/content.js';

const RuntimeEngine = withV52LevelRuntime(withV52MissionRuntime(ProductionCoreEngine));
const PLAYER_CONTROLS = Object.freeze({
  left: 'KeyA',
  right: 'KeyD',
  up: 'KeyW',
  down: 'KeyS',
  jump: 'Space',
  fire: 'KeyF'
});

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1600;
    this.naturalHeight = 900;
  }

  set src(value) { this.currentSrc = value; }
}

function withBrowserMocks(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function createEngine(events = []) {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  return new RuntimeEngine(canvas, { onEvent: (event) => events.push(event) });
}

function optionsFor(plan, overrides = {}) {
  return {
    seed: plan.levelSeed.seed,
    campaign: plan.campaign,
    world: plan.world,
    levelSeed: plan.levelSeed,
    missionLevel: plan,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    difficulty: 'standard',
    ...overrides
  };
}

const PLAN_CASES = Object.freeze([
  Object.freeze({ templateId: 'ship-interior-vertical', world: WORLDS[6] || WORLDS[0], campaign: CAMPAIGNS[0], variant: 2 }),
  Object.freeze({ templateId: 'colony-multiroute', world: WORLDS[0], campaign: CAMPAIGNS[1] || CAMPAIGNS[0], variant: 3 }),
  Object.freeze({ templateId: 'planet-exterior', world: WORLDS[9] || WORLDS[0], campaign: CAMPAIGNS[7] || CAMPAIGNS[0], variant: 4 })
]);

function buildPlan(entry) {
  const campaign = {
    ...entry.campaign,
    id: `v57-physical-${entry.templateId}`,
    worldId: entry.world.id,
    objective: entry.campaign?.objective || 'secure the mission area'
  };
  return buildMissionLevelV52({
    campaign,
    world: entry.world,
    levelSeeds: LEVEL_SEEDS,
    templateId: entry.templateId,
    variant: entry.variant
  });
}

function startCase(entry, events = []) {
  const plan = buildPlan(entry);
  const engine = createEngine(events);
  engine.start(optionsFor(plan));
  return { plan, engine };
}

function actorAtAnchor(actor, anchor) {
  Object.assign(actor, {
    x: anchor.x - actor.w / 2,
    y: anchor.y - actor.h,
    vx: 0,
    vy: 0,
    grounded: true,
    climbing: false,
    inVehicle: false
  });
}

function overlapsHorizontally(first, second, padding = 0) {
  return first.x - padding < second.x + second.w && first.x + first.w + padding > second.x;
}

test('la topologie auteur remplace tout safety-floor universel', () => withBrowserMocks(() => {
  for (const entry of PLAN_CASES) {
    const { plan, engine } = startCase(entry);
    const authoredIds = new Set(plan.geometry.platforms.map((platform) => platform.id));
    const hiddenSafetyFloors = engine.platforms.filter((platform) => (
      platform.id === 'v52-safety-floor'
      || (
        platform.floor
        && !authoredIds.has(platform.id)
        && platform.x <= 0
        && platform.x + platform.w >= plan.dimensions.width
      )
    ));
    assert.deepEqual(
      hiddenSafetyFloors.map((platform) => platform.id || '<anonymous-floor>'),
      [],
      `${entry.templateId}: aucun sol invisible ne doit combler les vides sous la topologie auteur`
    );
  }
}));

test('les dimensions snapshot, les limites horizontales et le void utilisent les bounds du plan', () => withBrowserMocks(() => {
  for (const entry of PLAN_CASES) {
    const { plan, engine } = startCase(entry);
    const snapshot = engine.getSnapshot();
    assert.equal(snapshot.worldWidth, plan.dimensions.width, `${entry.templateId}: worldWidth`);
    assert.equal(snapshot.worldHeight, plan.dimensions.height, `${entry.templateId}: worldHeight`);
    if (snapshot.missionLevelRuntime?.dimensions) {
      assert.deepEqual(snapshot.missionLevelRuntime.dimensions, plan.dimensions, `${entry.templateId}: dimensions du snapshot mission`);
    }

    Object.assign(engine.player, {
      x: plan.dimensions.width + 120,
      y: engine.checkpoint.y,
      vx: 0,
      vy: 0,
      grounded: false,
      inVehicle: false
    });
    engine.updatePlayer(engine.player, 0, PLAYER_CONTROLS);
    assert.ok(
      engine.player.x <= plan.dimensions.width - engine.player.w,
      `${entry.templateId}: le joueur ne peut pas sortir à droite du plan`
    );

    const checkpoint = { ...engine.checkpoint };
    Object.assign(engine.player, {
      x: Math.round(plan.dimensions.width / 2),
      y: plan.dimensions.height + 101,
      vx: 0,
      vy: 0,
      armor: 0,
      health: 100,
      damageTaken: 0,
      grounded: false,
      inVehicle: false
    });
    engine.updatePlayer(engine.player, 0, PLAYER_CONTROLS);
    assert.deepEqual(
      { x: engine.player.x, y: engine.player.y },
      { x: checkpoint.x, y: checkpoint.y },
      `${entry.templateId}: franchir le bas du plan déclenche immédiatement le retour checkpoint`
    );
    assert.ok(engine.player.damageTaken > 0, `${entry.templateId}: la chute dans le void applique la pénalité`);
  }
}));

test('chaque échelle possède une approche praticable sur ses deux niveaux', () => withBrowserMocks(() => {
  for (const entry of PLAN_CASES) {
    const { plan, engine } = startCase(entry);
    const sourceLadders = plan.geometry.ladders.filter((ladder) => ladder.kind === 'ladder');
    assert.ok(sourceLadders.length > 0, `${entry.templateId}: le plan déclare des échelles`);

    for (const source of sourceLadders) {
      const ladder = engine.ladders.find((candidate) => candidate.id === source.id);
      assert.ok(ladder, `${entry.templateId}:${source.id}: échelle compilée`);
      for (const nodeId of [source.from, source.to]) {
        const endpoint = plan.graph.nodes.find((node) => node.id === nodeId);
        assert.ok(endpoint, `${entry.templateId}:${source.id}:${nodeId}: endpoint présent`);
        const approach = engine.platforms.find((platform) => {
          const surface = getMissionSurfaceMetrics(platform);
          const ladderReach = { x: ladder.x - 46, w: 92 };
          return Math.abs(surface.surfaceY - endpoint.y) <= 4
            && overlapsHorizontally(ladderReach, platform, engine.player.w / 2);
        });
        assert.ok(
          approach,
          `${entry.templateId}:${source.id}:${nodeId}: une surface au niveau y=${endpoint.y} doit rejoindre la zone de prise de l’échelle x=${ladder.x}`
        );
      }
    }
  }
}));

test('un lien lift devient une plateforme mobile dans lifts, jamais une fausse échelle', () => withBrowserMocks(() => {
  let liftCount = 0;
  for (const entry of PLAN_CASES) {
    const { plan, engine } = startCase(entry);
    for (const source of plan.geometry.ladders.filter((ladder) => ladder.kind === 'lift')) {
      liftCount += 1;
      const lift = engine.lifts.find((candidate) => candidate.id === source.id);
      assert.ok(lift, `${entry.templateId}:${source.id}: lift absent de engine.lifts`);
      assert.equal(engine.ladders.some((candidate) => candidate.id === source.id), false, `${source.id}: un lift ne doit pas utiliser le contrôleur d’échelle`);
      assert.ok(Number.isFinite(lift.topY) && Number.isFinite(lift.baseY), `${source.id}: course verticale numérique`);
      assert.notEqual(lift.topY, lift.baseY, `${source.id}: le lift doit réellement se déplacer`);
      assert.ok(engine.platforms.includes(lift), `${source.id}: le plateau mobile participe aux collisions de plateforme`);
    }
  }
  assert.ok(liftCount > 0, 'au moins un template v57 doit exercer le contrat lift');
}));

test('chaque réseau de conduit remplace le raccourci instantané par une entrée physique progressive', () => withBrowserMocks(() => {
  let ventCount = 0;
  for (const entry of PLAN_CASES) {
    const { plan, engine } = startCase(entry);
    const network = MISSION_VENT_NETWORKS_V62[entry.templateId];
    const entrance = network.entrances[0];
    ventCount += network.entrances.length;
    assert.ok(plan.geometry.vents.every((legacy) => !engine.vents.some((portal) => portal.id === legacy.id)), `${entry.templateId}: aucun téléporteur V52 compilé`);
    assert.equal(engine.vents.length, network.entrances.length + network.exits.length);
    engine.inventory.cutter = true;
    actorAtAnchor(engine.player, entrance.worldPosition);
    engine.player.depth = entrance.worldPosition.depth;
    const pose = { x: engine.player.x, y: engine.player.y };
    assert.equal(engine.interact(engine.player), true, `${entry.templateId}:${entrance.id}: commencer l entrée physique`);
    assert.equal(engine.player.ventTransit.phase, 'entering');
    assert.deepEqual({ x: engine.player.x, y: engine.player.y }, pose, 'aucun saut de position à l interaction');
    engine.update(0.18);
    const transitPosition = getVentTransitPositionV62(network, engine.player);
    assert.ok(transitPosition && engine.player.ventTransit.progress > 0 && engine.player.ventTransit.progress < 1);
    assert.deepEqual({ x: engine.player.x, y: engine.player.y }, pose, 'le corps ne rejoint une bouche de sortie qu après le trajet complet');
  }
  assert.ok(ventCount > 0, 'au moins un template v57 doit exercer le contrat conduit');
}));

test('chaque hazard recouvre horizontalement une surface et affleure exactement sa ligne de contact', () => withBrowserMocks(() => {
  for (const entry of PLAN_CASES) {
    const { engine } = startCase(entry);
    for (const hazard of engine.hazards) {
      const hazardBottom = hazard.y + hazard.h;
      const support = engine.platforms.find((platform) => {
        if (platform.id === 'v52-safety-floor') return false;
        const overlap = Math.min(hazard.x + hazard.w, platform.x + platform.w) - Math.max(hazard.x, platform.x);
        const surface = getMissionSurfaceMetrics(platform);
        return overlap >= Math.min(12, hazard.w) && Math.abs(surface.surfaceY - hazardBottom) <= 4;
      });
      assert.ok(
        support,
        `${entry.templateId}:${hazard.id}: bottom=${hazardBottom} doit toucher une surface jouable sous [${hazard.x}, ${hazard.x + hazard.w}]`
      );
    }
  }
}));

test('le boss détecte le joueur à portée avant x=4200', () => withBrowserMocks(() => {
  for (const entry of PLAN_CASES) {
    const { engine } = startCase(entry);
    const boss = engine.enemies.find((enemy) => enemy.isBoss && enemy.alive);
    assert.ok(boss, `${entry.templateId}: boss vivant`);
    engine.squadActors = [];
    engine.coopEnabled = false;
    Object.assign(engine.player, {
      x: Math.min(4100, boss.x - 300),
      y: boss.y + boss.h - engine.player.h,
      vx: 0,
      vy: 0,
      alive: true,
      inVehicle: false
    });
    Object.assign(boss, { alert: false, revealed: 0, dormant: false, attackClock: 1, rangedClock: 1, staggerClock: 0 });
    assert.ok(engine.player.x < 4200, `${entry.templateId}: précondition du test avant l’ancien seuil magique`);
    assert.ok(Math.abs(engine.player.x - boss.x) < 620, `${entry.templateId}: le joueur est dans le rayon de détection`);
    engine.updateEnemy(boss, 0.016);
    assert.equal(boss.alert, true, `${entry.templateId}: l’activation dépend de la portée, pas de x=4200`);
  }
}));

test('la mort du boss libère le sas aft verrouillé par ship-bridge-ambush', () => withBrowserMocks(() => {
  const entry = PLAN_CASES.find((candidate) => candidate.templateId === 'ship-interior-vertical');
  const { engine } = startCase(entry);
  const aft = engine.doors.find((door) => door.id === 'aft-bulkhead');
  const boss = engine.enemies.find((enemy) => enemy.isBoss && enemy.alive);
  assert.ok(aft && boss, 'le sas aft et le boss existent');
  assert.equal(engine.triggerMissionLevelEvent('ship-bridge-ambush', 'v57-test'), true);
  assert.equal(aft.levelLocked, true, 'l’embuscade verrouille le sas');

  engine.defeatEnemy(boss, engine.player);

  assert.equal(engine.mission.objectives.boss, true, 'la mort valide l’objectif boss');
  assert.equal(aft.levelLocked, false, 'le verrou événementiel est levé à la mort du boss');
  assert.equal(engine.doorRequirement(aft), '', 'le sas redevient actionnable');
}));

test('tuer le boss depuis l’habitation avant l’embuscade ne reverrouille pas le sas arrière', () => withBrowserMocks(() => {
  const entry = PLAN_CASES.find((candidate) => candidate.templateId === 'ship-interior-vertical');
  const plan = buildPlan(entry);
  const engine = createEngine();
  engine.start(optionsFor(plan, { equipment: [], crew: [], vehicle: null }));
  const boss = engine.enemies.find((enemy) => enemy.isBoss && enemy.alive);
  const aft = engine.doors.find((door) => door.id === 'aft-bulkhead');
  assert.ok(boss && aft);
  Object.assign(engine.player, { x: 2650, y: 330 - engine.player.h, facing: 1 });
  engine.refreshMissionLevelZone(false);
  assert.equal(engine.missionLevelVisualState.activeZoneId, 'ship-habitation');
  assert.equal(engine.missionLevelEvents.get('ship-bridge-ambush').triggered, false);
  const initialReserve = engine.player.ammoReserve;

  // Isoler la balistique du déplacement IA : projectiles et réserve réels,
  // sans retirer de santé au boss ni inventer des munitions pour le scénario.
  for (let attempt = 0; attempt < 100 && boss.alive; attempt += 1) {
    engine.player.fireClock = 0;
    if (engine.player.reloading) engine.finishReload(engine.player);
    engine.fire(engine.player);
    for (let frame = 0; frame < 80; frame += 1) engine.updateBullets(1 / 60);
  }
  assert.equal(boss.alive, false, 'les tirs atteignent et tuent le boss depuis la salle adjacente');
  assert.ok(engine.player.ammoReserve < initialReserve && engine.player.ammoReserve >= 0);
  assert.equal(engine.mission.objectives.boss, true);
  assert.equal(engine.missionLevelEvents.get('ship-bridge-ambush').triggered, false);

  engine.player.x = 2850;
  engine.refreshMissionLevelZone(false);
  assert.equal(engine.missionLevelVisualState.activeZoneId, 'ship-command');
  assert.equal(engine.missionLevelEvents.get('ship-bridge-ambush').triggerCount, 1);
  assert.equal(engine.missionLevelSpawns.get('ship-command-wave').active, true, 'l’embuscade reste jouée');
  assert.equal(aft.levelLocked, false, 'un boss déjà vaincu ne peut plus condamner le sas');
  assert.equal(engine.doorRequirement(aft), '');
}));

test('la reprise répare le verrou de boss obsolète sans ouvrir les portes ni rejouer l’embuscade', () => withBrowserMocks(() => {
  const entry = PLAN_CASES.find((candidate) => candidate.templateId === 'ship-interior-vertical');
  const { plan, engine } = startCase(entry);
  const boss = engine.enemies.find((enemy) => enemy.isBoss && enemy.alive);
  engine.triggerMissionLevelEvent('ship-bridge-ambush', 'resume-regression');
  engine.defeatEnemy(boss, engine.player);
  const resumeState = JSON.parse(JSON.stringify(engine.captureResumeState()));
  // État écrit par l’ancien ordre mort du boss -> entrée en passerelle.
  const savedAft = resumeState.missionLevel.doors.find((door) => door.id === 'aft-bulkhead');
  Object.assign(savedAft, { open: false, progress: 0, levelLocked: true });
  const savedCargo = resumeState.missionLevel.doors.find((door) => door.id === 'cargo-bulkhead');
  const resumed = createEngine();
  resumed.start(optionsFor(plan, { resumeState }));
  const aft = resumed.doors.find((door) => door.id === savedAft.id);
  const cargo = resumed.doors.find((door) => door.id === savedCargo.id);
  assert.equal(resumed.lastResumeResult.applied, true);
  assert.equal(resumed.enemies.find((enemy) => enemy.id === boss.id).alive, false);
  assert.equal(resumed.mission.objectives.boss, true);
  assert.equal(aft.levelLocked, false, 'le verrou ancien ne peut pas survivre à son boss');
  assert.equal(aft.open, false, 'le joueur conserve le contrôle physique de la porte');
  assert.equal(aft.progress, 0);
  assert.equal(resumed.doorRequirement(aft), '');
  assert.deepEqual([cargo.open, cargo.progress, cargo.levelLocked], [savedCargo.open, savedCargo.progress, savedCargo.levelLocked]);
  assert.ok(resumed.doorRequirement(cargo), 'le besoin de courant reste effectif');
  assert.equal(resumed.missionLevelEvents.get('ship-bridge-ambush').triggerCount, 1);
  assert.equal(resumed.player.ammoReserve, resumeState.player.ammoReserve);
  assert.equal(resumed.player.kills, resumeState.player.kills);
  assert.equal(resumed.drops.length, resumeState.drops.length, 'aucune récompense de boss supplémentaire');
}));

test('la sauvegarde restaure les verrous événementiels et l’état actif des dangers', () => withBrowserMocks(() => {
  const entry = PLAN_CASES.find((candidate) => candidate.templateId === 'ship-interior-vertical');
  const { plan, engine } = startCase(entry);
  assert.equal(engine.triggerMissionLevelEvent('ship-decompression', 'v57-test'), true);
  assert.equal(engine.triggerMissionLevelEvent('ship-power-cascade', 'v57-test'), true);
  assert.equal(engine.triggerMissionLevelEvent('ship-bridge-ambush', 'v57-test'), true);

  const aft = engine.doors.find((door) => door.id === 'aft-bulkhead');
  const cargo = engine.doors.find((door) => door.id === 'cargo-bulkhead');
  const vacuum = engine.hazards.find((hazard) => hazard.id === 'ship-hazard-vacuum');
  const electrical = engine.hazards.find((hazard) => hazard.id === 'ship-hazard-electrical');
  assert.equal(aft.levelLocked, true);
  assert.equal(cargo.open, true);
  assert.equal(vacuum.active, true);
  assert.equal(electrical.active, true);

  const resumeState = engine.captureResumeState();
  assert.equal(resumeState.missionLevel.schema, 2);
  assert.ok(resumeState.missionLevel.doors.some((door) => door.id === aft.id && door.levelLocked));
  assert.ok(resumeState.missionLevel.hazards.some((hazard) => hazard.id === electrical.id && hazard.active));

  const resumed = createEngine();
  resumed.start(optionsFor(plan, { resumeState }));
  assert.equal(resumed.doors.find((door) => door.id === aft.id).levelLocked, true, 'le sas conserve le verrou événementiel');
  assert.equal(resumed.doors.find((door) => door.id === cargo.id).open, true, 'la porte conserve son état ouvert');
  assert.equal(resumed.hazards.find((hazard) => hazard.id === vacuum.id).active, true, 'la décompression reste active');
  assert.equal(resumed.hazards.find((hazard) => hazard.id === electrical.id).active, true, 'la cascade électrique reste active');
}));
