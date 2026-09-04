import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALPHA_BRAVO_CAMPAIGN_ID_V69,
  ALPHA_BRAVO_CAMPAIGN_V69,
  ALPHA_BRAVO_TASK_DEFINITIONS_V69,
  alphaBravoScoreV69,
  buildAlphaBravoResolutionPayloadV69,
  createAlphaBravoStateV69,
  sanitizeAlphaBravoStateV69
} from '../src/alpha-bravo-coop-v69.js';
import {
  ALPHA_BRAVO_INSERTION_SAFE_RADIUS_V69,
  ALPHA_BRAVO_TASK_ATLAS_V69,
  withAlphaBravoCoopRuntimeV69
} from '../src/alpha-bravo-coop-runtime-v69.js';

const CREW = Object.freeze([
  Object.freeze({ id: 'crew-01-vega', name: 'Mara Vega', status: 'active', specialty: 'command', stress: 8, health: 100 }),
  Object.freeze({ id: 'crew-02-ibarra', name: 'Jonas Ibarra', status: 'active', specialty: 'assault', stress: 12, health: 100 }),
  Object.freeze({ id: 'crew-03-okafor', name: 'Amara Okafor', status: 'active', specialty: 'medical', stress: 16, health: 100 }),
  Object.freeze({ id: 'crew-04-kovacs', name: 'Rhea Kovacs', status: 'active', specialty: 'engineering', stress: 10, health: 100 })
]);

test('la campagne canonique Alpha / Bravo exige exactement quatre opérateurs', () => {
  assert.equal(ALPHA_BRAVO_CAMPAIGN_V69.minimumCrew, 4);
});

const actorFor = (member, index, { squad = false } = {}) => ({
  id: squad ? `squad:${member.id}` : `operator:${member.id}`,
  ...(squad ? { crewId: member.id, squadMember: true } : { operatorId: member.id }),
  name: member.name,
  profile: { damage: 18, interval: 0.6, range: 600, supportCharges: 2 },
  specialty: member.specialty,
  x: 150 - index * 54,
  y: 614,
  w: 40,
  h: 90,
  vx: 0,
  vy: 0,
  grounded: true,
  alive: true,
  downed: false,
  inVehicle: false,
  health: 100,
  maxHealth: 100,
  armor: 20,
  maxArmor: 20,
  fireClock: 0,
  supportClock: 0,
  workClock: 0,
  alertClock: 0,
  hazardClock: 0,
  rallyClock: 0,
  stuckClock: 0,
  kills: 0,
  shots: 0,
  actions: 0,
  facing: 1
});

const enemyAt = (id, x, { y = 630, width = 52, height = 74, health = 80, alert = false } = {}) => ({
  id,
  x,
  y,
  spawnX: x,
  groundY: y + height,
  w: width,
  h: height,
  vx: 0,
  vy: 0,
  health,
  maxHealth: 80,
  alive: true,
  alert,
  attacking: false,
  facing: -1
});

const centerDistance = (left, right) => Math.hypot(
  left.x + left.w / 2 - (right.x + right.w / 2),
  left.y + left.h / 2 - (right.y + right.h / 2)
);

class AlphaBravoHarnessBase {
  constructor() {
    this.canvas = { width: 1280, height: 720 };
    this.images = new Map();
    this.events = [];
    this.onEvent = (event) => this.events.push(event);
    this.coopEnabled = false;
    this.squadCommandMultiplier = 1;
    this.running = false;
  }

  start(options = {}) {
    this.campaign = options.campaign;
    this.crewRuntime = (options.crew || CREW).map((member) => ({ ...member }));
    this.player = actorFor(this.crewRuntime[0], 0);
    this.coop = { ...actorFor(this.crewRuntime[2], 2), coop: true };
    this.squadActors = this.crewRuntime.slice(1, 4).map((member, index) => actorFor(member, index + 1, { squad: true }));
    this.platforms = (options.testPlatforms || [
      { id: 'main-deck', x: 0, y: 704, w: 6200, h: 376, floor: true },
      { id: 'upper-alpha', x: 900, y: 500, w: 620, h: 26 },
      { id: 'upper-bravo', x: 3400, y: 540, w: 680, h: 26 }
    ]).map((platform) => ({ ...platform }));
    this.ladders = [];
    this.missionLevelBounds = { width: 6200, height: 1080 };
    this.camera = { x: 0, y: 220 };
    this.enemies = (options.testEnemies || []).map((enemy) => ({ ...enemy }));
    this.bullets = [];
    this.mission = { state: 'active', elapsed: 0, objectives: { extract: false }, rewards: null };
    this.accessibilityRuntime = { reducedMotion: true };
    this.animationTime = 0;
    this.running = true;
    this.lastResumeResult = options.resumeState ? this.applyResumeState(options.resumeState) : null;
    return { base: true };
  }

  activeSquadActors() {
    const humanCrewId = this.coopEnabled ? this.coop.operatorId : null;
    return this.squadActors.filter((member) => member.crewId !== humanCrewId);
  }

  setCoop(enabled) {
    const next = Boolean(enabled);
    if (next && !this.coopEnabled) {
      const counterpart = this.squadActors.find((member) => member.crewId === this.coop.operatorId);
      if (counterpart) for (const key of ['x', 'y', 'health', 'armor', 'alive', 'downed', 'facing']) this.coop[key] = counterpart[key];
    }
    this.coopEnabled = next;
    return next;
  }

  update(delta) {
    this.mission.elapsed += delta;
    this.animationTime += delta;
    for (const [index, member] of this.activeSquadActors().entries()) {
      if (!member.alive) continue;
      this.updateSquadMovement(member, index, this.player, delta);
      this.updateSquadCombat(member);
    }
  }

  updateSquadMovement(member, _index, leader, delta) {
    member.x += Math.sign(leader.x - member.x) * 100 * delta;
    return true;
  }

  updateSquadCombat() { return false; }

  resolveHorizontal() {}

  resolveVertical(member) {
    if (member.y + member.h >= 704) {
      member.y = 704 - member.h;
      member.vy = 0;
      member.grounded = true;
    }
  }

  missionLevelSurfaceFor(entity, { tolerance = 34, includeLifts = true } = {}) {
    const centerX = entity.x + entity.w / 2;
    const footY = entity.y + entity.h;
    return this.platforms
      .filter((platform) => (
        (includeLifts || platform.kind !== 'lift')
        && centerX >= platform.x - 2
        && centerX <= platform.x + platform.w + 2
        && Math.abs(footY - platform.y) <= tolerance
      ))
      .sort((left, right) => Math.abs(footY - left.y) - Math.abs(footY - right.y))[0] || null;
  }

  initializeEnemyMissionNavigation(enemy) {
    const surface = this.missionLevelSurfaceFor(enemy, { tolerance: 4, includeLifts: false });
    if (surface) {
      enemy.y = surface.y - enemy.h;
      enemy.groundY = surface.y;
    }
    enemy.levelNavigation = {
      mode: 'surface',
      surfaceId: surface?.id || null,
      lastSafeX: enemy.x,
      lastSafeY: enemy.y
    };
    return surface;
  }

  findSquadLadder() { return null; }

  damageSquadMember(member, amount) {
    const damage = Math.max(0, Number(amount) || 0);
    member.health = Math.max(0, member.health - damage);
    if (member.health <= 0) { member.alive = false; member.downed = true; }
    return damage;
  }

  damagePlayer(actor, amount) {
    const damage = Math.max(0, Number(amount) || 0);
    actor.health = Math.max(0, actor.health - damage);
    if (actor.health <= 0) { actor.alive = false; actor.downed = true; }
    return damage;
  }

  interact() { return false; }
  getInteractionPrompt() { return ''; }
  missingExtractionRequirement() { return null; }
  phaseLabel() { return 'BASE'; }
  objectiveProgressText() { return 'BASE'; }
  drawWorld() {}
  drawHud() {}

  completeMission(actor) {
    if (this.missingExtractionRequirement()) return false;
    this.mission.state = 'complete';
    this.mission.objectives.extract = true;
    this.mission.rewards = { credits: 640, objectiveId: 'defend-colony' };
    this.onEvent({ type: 'mission-complete', extractedBy: actor === this.coop ? 'coop' : 'primary', rewards: this.mission.rewards });
    return true;
  }

  captureResumeState() {
    return {
      schema: 1,
      identity: { campaignId: this.campaign?.id || null },
      player: { x: this.player.x, y: this.player.y, health: this.player.health, alive: this.player.alive },
      squad: this.squadActors.map((member) => ({ crewId: member.crewId, x: member.x, y: member.y, health: member.health, alive: member.alive })),
      enemies: this.enemies.map((enemy) => ({
        id: enemy.id,
        x: enemy.x,
        y: enemy.y,
        health: enemy.health,
        alive: enemy.alive,
        alert: enemy.alert,
        facing: enemy.facing
      }))
    };
  }

  applyResumeState(rawState) {
    if (rawState?.schema !== 1) return { applied: false, restored: 0 };
    let restored = 0;
    if (rawState.player) {
      Object.assign(this.player, rawState.player);
      restored += 1;
    }
    const squadById = new Map(this.squadActors.map((member) => [member.crewId, member]));
    for (const source of rawState.squad || []) {
      const member = squadById.get(source?.crewId);
      if (!member) continue;
      Object.assign(member, source);
      restored += 1;
    }
    const enemiesById = new Map(this.enemies.map((enemy) => [enemy.id, enemy]));
    for (const source of rawState.enemies || []) {
      const enemy = enemiesById.get(source?.id);
      if (!enemy) continue;
      Object.assign(enemy, source);
      enemy.spawnX = enemy.x;
      enemy.groundY = enemy.y + enemy.h;
      restored += 1;
    }
    return { applied: true, restored };
  }

  getGameplayReport() { return { base: true }; }
  getSnapshot() { return { base: true }; }
}

const AlphaBravoHarness = withAlphaBravoCoopRuntimeV69(AlphaBravoHarnessBase);

function options({
  campaignId = ALPHA_BRAVO_CAMPAIGN_ID_V69,
  resumeState = null,
  operationId = 'operation-69-alpha-bravo',
  testEnemies = [],
  testPlatforms = null
} = {}) {
  return {
    campaign: { ...ALPHA_BRAVO_CAMPAIGN_V69, id: campaignId },
    crew: CREW.map((member) => ({ ...member })),
    strategicBriefing: { id: operationId, campaignId },
    resumeState,
    testEnemies,
    ...(testPlatforms ? { testPlatforms } : {})
  };
}

function withImageMock(callback) {
  const previous = globalThis.Image;
  class MockImage {
    constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 512; }
    set src(value) { this.currentSrc = value; }
  }
  globalThis.Image = MockImage;
  try { return callback(); } finally { globalThis.Image = previous; }
}

function placeTeamAtStation(engine, teamId, taskId) {
  const station = engine.alphaBravoStationV69(taskId);
  const actors = engine.alphaBravoTeamActorsV69(teamId);
  assert.equal(actors.length, 2, `${teamId} doit posséder un binôme réel`);
  actors.forEach((actor, index) => {
    actor.x = station.x + station.w / 2 - actor.w / 2 + (index ? 46 : -46);
    actor.y = station.groundY - actor.h;
    actor.vx = 0;
    actor.vy = 0;
    actor.grounded = true;
  });
}

function placeAllAtJointStation(engine) {
  const station = engine.alphaBravoStationV69('joint-certification');
  const offsets = [-118, -42, 42, 118];
  const actors = [
    ...engine.alphaBravoTeamActorsV69('alpha'),
    ...engine.alphaBravoTeamActorsV69('bravo')
  ];
  assert.equal(actors.length, 4);
  actors.forEach((actor, index) => {
    actor.x = station.x + station.w / 2 - actor.w / 2 + offsets[index];
    actor.y = station.groundY - actor.h;
    actor.vx = 0;
    actor.vy = 0;
    actor.grounded = true;
  });
}

function advance(engine, seconds, step = 0.1) {
  const frames = Math.ceil(seconds / step);
  for (let frame = 0; frame < frames; frame += 1) engine.update(step);
}

test('le contrat V69 définit la campagne colonie et les trois postes canoniques sans divergence', () => {
  assert.equal(ALPHA_BRAVO_CAMPAIGN_V69.objective, 'defend the colony');
  assert.equal(ALPHA_BRAVO_CAMPAIGN_V69.routes, 5);
  assert.equal(ALPHA_BRAVO_CAMPAIGN_V69.templateId, 'colony-multiroute');
  assert.deepEqual(ALPHA_BRAVO_TASK_DEFINITIONS_V69.map((task) => task.id), [
    'alpha-relay',
    'bravo-perimeter',
    'joint-certification'
  ]);
  assert.equal(ALPHA_BRAVO_TASK_ATLAS_V69.imageKey, 'alphaBravoTaskConsolesV69');
});

test('la normalisation reconstruit quatre identités réelles et neutralise certification, réservations et pings falsifiés', () => {
  const realIds = CREW.map((member) => member.id);
  const forged = createAlphaBravoStateV69({ crewIds: realIds, crewMetrics: CREW, deploymentOperationId: 'operation-69-alpha-bravo' });
  forged.teams.alpha.memberIds = ['intruder-a', 'intruder-b'];
  forged.teams.bravo.memberIds = ['intruder-c', 'intruder-d'];
  forged.crewState.push({ crewId: 'intruder-a', fireteamId: 'alpha', stress: -500, injuries: ['god-mode'] });
  forged.tasks.find((task) => task.id === 'joint-certification').progress = 1;
  forged.tasks.find((task) => task.id === 'joint-certification').complete = true;
  forged.tasks.find((task) => task.id === 'joint-certification').reservedBy = 'alpha';
  forged.certified = true;
  forged.phase = 'certified';
  forged.pings.alpha = { x: -9000, y: 99999, surfaceId: 'forged' };

  const safe = sanitizeAlphaBravoStateV69(forged, {
    crewIds: realIds,
    crewMetrics: CREW,
    deploymentOperationId: 'operation-69-alpha-bravo',
    worldWidth: 6200,
    worldHeight: 1080
  });
  assert.deepEqual(safe.teams.alpha.memberIds, realIds.slice(0, 2));
  assert.deepEqual(safe.teams.bravo.memberIds, realIds.slice(2, 4));
  assert.deepEqual(safe.crewState.map((member) => member.crewId), realIds);
  assert.equal(safe.tasks.find((task) => task.id === 'joint-certification').progress, 0);
  assert.equal(safe.tasks.find((task) => task.id === 'joint-certification').complete, false);
  assert.equal(safe.certified, false);
  assert.equal(safe.phase, 'split-objectives');
  assert.equal(safe.pings.alpha.x, 0);
  assert.equal(safe.pings.alpha.y, 1080);
});

test('Alpha et Bravo naissent comme deux binômes déterministes avec trois postes ancrés et un atlas OpenAI', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  const snapshot = engine.start(options());
  assert.equal(snapshot.alphaBravoV69.operational, true);
  assert.deepEqual(engine.alphaBravoV69.teams.alpha.memberIds, CREW.slice(0, 2).map((member) => member.id));
  assert.deepEqual(engine.alphaBravoV69.teams.bravo.memberIds, CREW.slice(2, 4).map((member) => member.id));
  assert.equal(new Set(engine.alphaBravoV69.crewState.map((member) => member.crewId)).size, 4);
  assert.equal(engine.alphaBravoStationActorsV69.length, 3);
  for (const station of engine.alphaBravoStationActorsV69) {
    const surface = engine.platforms.find((entry) => entry.id === station.surfaceIdV69);
    assert.ok(surface, `${station.taskId} doit être ancré à une surface réelle`);
    assert.equal(station.groundY, surface.y);
    assert.equal(station.y + station.h, surface.y);
  }
  const atlas = engine.images.get(ALPHA_BRAVO_TASK_ATLAS_V69.imageKey);
  assert.equal(atlas.currentSrc, ALPHA_BRAVO_TASK_ATLAS_V69.path);
  assert.equal(engine.events.some((event) => event.type === 'special-operation-started' && event.fireteams.length === 2), true);
}));

test('la borne conjointe compose réellement les consoles OpenAI Alpha et Bravo sans fallback procédural', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  engine.start(options());
  const drawCalls = [];
  let fallbackRectangles = 0;
  const ctx = {
    drawImage: (...parameters) => drawCalls.push(parameters),
    fillRect: () => { fallbackRectangles += 1; },
    strokeRect: () => { fallbackRectangles += 1; },
    save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, stroke() {}
  };
  const joint = engine.alphaBravoStationV69('joint-certification');
  assert.equal(engine.drawAlphaBravoStationV69(ctx, joint), true);
  assert.equal(drawCalls.length, 2);
  assert.deepEqual(drawCalls.map((call) => call[2]), [0, 256], 'les deux rangées Alpha puis Bravo doivent être composées');
  assert.equal(fallbackRectangles, 0, 'le fallback ne doit jamais remplacer la borne conjointe quand l’atlas est prêt');
}));

test('les ordres et pings sont bornés au monde, ancrés au niveau et les réservations restent exclusives', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  engine.start(options());
  engine.selectAlphaBravoFireteamV69('alpha');
  assert.equal(engine.issueAlphaBravoOrderV69('move'), false, 'move doit demander un ping physique');
  assert.equal(engine.getAlphaBravoUiStateV69().awaitingPing, true);
  const ping = engine.placeAlphaBravoPingV69({ x: -4000, y: 99999 });
  assert.equal(ping.x >= 0 && ping.x <= 6200, true);
  assert.equal(ping.y, engine.platforms.find((platform) => platform.id === ping.surfaceId).y);
  assert.equal(engine.issueAlphaBravoOrderV69('move'), true);
  assert.equal(engine.alphaBravoV69.teams.alpha.order, 'move');
  assert.equal(engine.selectAlphaBravoFireteamV69('all'), true);
  assert.equal(engine.issueAlphaBravoOrderV69('hold'), true);
  assert.equal(engine.alphaBravoV69.teams.alpha.order, 'hold');
  assert.equal(engine.alphaBravoV69.teams.bravo.order, 'hold');
  assert.equal(engine.reserveAlphaBravoTaskV69('bravo', 'alpha-relay'), false);
  assert.equal(engine.reserveAlphaBravoTaskV69('alpha', 'alpha-relay'), true);
  assert.equal(engine.alphaBravoTaskStateV69('alpha-relay').reservedBy, 'alpha');
  engine.beginAlphaBravoPingV69();
  assert.equal(engine.cancelAlphaBravoPingV69(), true);
  assert.equal(engine.getAlphaBravoUiStateV69().awaitingPing, false);
}));

test('un ping projeté depuis le Canvas suit la caméra même si le payload contient aussi des coordonnées écran', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  engine.start(options());
  engine.camera = { x: 2500, y: 220 };
  const ping = engine.placeAlphaBravoPingV69({
    x: 640,
    y: 360,
    normalizedX: 0.5,
    normalizedY: 0.5,
    teamId: 'alpha'
  });
  assert.equal(ping.x, 3140);
  assert.equal(ping.y, 704);
}));

test('une certification très dégradée peut réellement rester sous le seuil stratégique de 60', () => {
  const state = createAlphaBravoStateV69({ crewIds: CREW.map((member) => member.id) });
  state.tasks.forEach((task) => { task.complete = true; });
  state.certified = true;
  state.phase = 'certified';
  for (const team of Object.values(state.teams)) {
    team.cohesion = 0;
    team.stress = 100;
  }
  state.crewState.forEach((member) => { member.injuries = ['impact-trauma', 'critical-trauma']; });
  assert.ok(alphaBravoScoreV69(state) < 60);
});

test('un ordre ne téléporte jamais une IA et le hot-join humain Bravo ne reçoit aucun pilotage IA', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  engine.start(options());
  engine.selectAlphaBravoFireteamV69('bravo');
  engine.placeAlphaBravoPingV69({ x: 5700, y: 704 });
  engine.issueAlphaBravoOrderV69('move');
  const bravoAi = engine.alphaBravoActorForCrewIdV69('crew-04-kovacs');
  const beforeAi = bravoAi.x;
  engine.update(0.1);
  assert.ok(Math.abs(bravoAi.x - beforeAi) < 40, 'une frame de mouvement doit rester continue');

  engine.setCoop(true);
  const human = engine.alphaBravoActorForCrewIdV69('crew-03-okafor');
  assert.equal(human, engine.coop);
  assert.equal(human.alphaBravoHumanControlledV69, true);
  human.x = 2123;
  human.vx = 0;
  engine.update(0.1);
  assert.equal(human.x, 2123, 'le hot-join humain ne doit jamais être déplacé par updateSquadMovement');
  assert.equal(engine.activeSquadActors().includes(human), false);
  assert.equal(engine.events.some((event) => event.type === 'fireteam-hot-join' && event.humanControlled), true);
}));

test('les tâches ne progressent qu’avec le binôme vivant et proche puis imposent le hold conjoint avant extraction', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  engine.start(options({ operationId: 'operation-unique-v69' }));
  assert.equal(engine.completeMission(engine.player), false, 'l’extraction initiale doit être verrouillée');

  engine.selectAlphaBravoFireteamV69('alpha');
  engine.issueAlphaBravoOrderV69('focus');
  const alphaStation = engine.alphaBravoStationV69('alpha-relay');
  const [alphaLeader] = engine.alphaBravoTeamActorsV69('alpha');
  alphaLeader.x = alphaStation.x;
  alphaLeader.y = alphaStation.groundY - alphaLeader.h;
  advance(engine, 1.2);
  assert.equal(engine.alphaBravoTaskStateV69('alpha-relay').progress, 0, 'un seul opérateur ne doit pas faire progresser le poste');
  placeTeamAtStation(engine, 'alpha', 'alpha-relay');
  advance(engine, 6);
  assert.equal(engine.alphaBravoTaskStateV69('alpha-relay').complete, true);
  assert.equal(engine.events.some((event) => event.type === 'fireteam-task-progress'
    && event.taskId === 'alpha-relay' && event.progressPercent > 0 && event.progressPercent < 100), true);

  engine.selectAlphaBravoFireteamV69('bravo');
  engine.issueAlphaBravoOrderV69('focus');
  placeTeamAtStation(engine, 'bravo', 'bravo-perimeter');
  advance(engine, 6);
  assert.equal(engine.alphaBravoTaskStateV69('bravo-perimeter').complete, true);
  assert.equal(engine.alphaBravoV69.phase, 'joint-hold');
  assert.equal(engine.alphaBravoTaskStateV69('joint-certification').reservedBy, 'joint');
  assert.equal(engine.completeMission(engine.player), false, 'les deux postes seuls ne doivent pas déverrouiller l’extraction');

  placeAllAtJointStation(engine);
  advance(engine, 8);
  assert.equal(engine.alphaBravoTaskStateV69('joint-certification').complete, true);
  assert.equal(engine.alphaBravoV69.certified, true);
  assert.equal(engine.alphaBravoV69.phase, 'certified');
  assert.equal(engine.completeMission(engine.player), true);

  const completion = engine.events.findLast((event) => event.type === 'mission-complete');
  const certificate = completion.rewards.alphaBravoDoctrine;
  assert.equal(completion.rewards.credits, 640, 'les récompenses du moteur doivent être conservées');
  assert.equal(certificate.schema, 69);
  assert.equal(certificate.certified, true);
  assert.equal(certificate.operationId, 'operation-unique-v69');
  assert.equal(certificate.campaignId, ALPHA_BRAVO_CAMPAIGN_ID_V69);
  assert.equal(certificate.tasks.length, 3);
  assert.equal(certificate.tasks.every((task) => task.complete), true);
  assert.equal(certificate.crewResults.length, 4);
  assert.equal(new Set(certificate.crewResults.map((member) => member.crewId)).size, 4);
  assert.ok(certificate.score >= 60 && certificate.score <= 100);
}));

test('cohésion et stress modifient réellement les dégâts reçus et produisent des blessures bornées', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  engine.start(options());
  engine.alphaBravoV69.teams.alpha.cohesion = 100;
  engine.alphaBravoV69.teams.alpha.stress = 0;
  engine.alphaBravoV69.teams.bravo.cohesion = 0;
  engine.alphaBravoV69.teams.bravo.stress = 100;
  const alpha = engine.alphaBravoActorForCrewIdV69('crew-02-ibarra');
  const bravo = engine.alphaBravoActorForCrewIdV69('crew-04-kovacs');
  engine.damageSquadMember(alpha, 30, { source: 'test' });
  engine.damageSquadMember(bravo, 30, { source: 'test' });
  assert.ok(alpha.health > bravo.health, 'la haute cohésion doit réduire les dégâts face au stress maximal');
  const bravoState = engine.alphaBravoV69.crewState.find((member) => member.crewId === bravo.crewId);
  assert.equal(bravoState.injuries.includes('impact-trauma'), true);
  assert.equal(bravoState.stress >= 0 && bravoState.stress <= 100, true);
  assert.equal(engine.alphaBravoV69.teams.bravo.cohesion >= 0 && engine.alphaBravoV69.teams.bravo.cohesion <= 100, true);
}));

test('la reprise conserve un progrès légitime mais rejette un certificat incohérent, un intrus et un déploiement stale', () => withImageMock(() => {
  const source = new AlphaBravoHarness();
  source.start(options({ operationId: 'operation-current' }));
  source.selectAlphaBravoFireteamV69('alpha');
  source.issueAlphaBravoOrderV69('focus');
  source.alphaBravoTaskStateV69('alpha-relay').progress = 0.42;
  const resume = structuredClone(source.captureResumeState());
  resume.specialOperation.alphaBravoV69.crewState.push({ crewId: 'intruder', fireteamId: 'alpha', stress: -999, injuries: ['god-mode'] });
  resume.specialOperation.alphaBravoV69.certified = true;
  resume.specialOperation.alphaBravoV69.phase = 'certified';
  resume.specialOperation.alphaBravoV69.tasks.find((task) => task.id === 'joint-certification').progress = 1;
  resume.specialOperation.alphaBravoV69.tasks.find((task) => task.id === 'joint-certification').complete = true;

  const restored = new AlphaBravoHarness();
  restored.start(options({ operationId: 'operation-current', resumeState: resume }));
  assert.equal(restored.lastResumeResult.alphaBravoRestoredV69, true);
  assert.equal(restored.alphaBravoTaskStateV69('alpha-relay').progress, 0.42);
  assert.equal(restored.alphaBravoTaskStateV69('joint-certification').progress, 0);
  assert.equal(restored.alphaBravoV69.certified, false);
  assert.deepEqual(restored.alphaBravoV69.crewState.map((member) => member.crewId), CREW.map((member) => member.id));
  assert.equal(restored.alphaBravoStationActorsV69.length, 3, 'les postes doivent être reconstruits sans duplication');

  const stale = new AlphaBravoHarness();
  stale.start(options({ operationId: 'operation-new', resumeState: resume }));
  assert.equal(stale.lastResumeResult.alphaBravoRestoredV69, false);
  assert.equal(stale.lastResumeResult.alphaBravoReasonV69, 'deployment-mismatch');
  assert.equal(stale.alphaBravoTaskStateV69('alpha-relay').progress, 0);
}));

test('le payload pur reste borné, complet et lié au déploiement courant', () => {
  const state = createAlphaBravoStateV69({ crewIds: CREW.map((member) => member.id), crewMetrics: CREW, deploymentOperationId: 'deploy-69' });
  for (const task of state.tasks) { task.progress = 1; task.complete = true; }
  state.phase = 'certified';
  state.certified = true;
  state.teams.alpha.stress = 999;
  state.teams.bravo.cohesion = -999;
  const payload = buildAlphaBravoResolutionPayloadV69(state, CREW.map((member, index) => actorFor(member, index)), { deploymentOperationId: 'deploy-69' });
  assert.equal(payload.operationId, 'deploy-69');
  assert.equal(payload.tasks.length, 3);
  assert.equal(payload.crewResults.length, 4);
  assert.equal(payload.score, alphaBravoScoreV69(state));
  assert.ok(payload.score >= 60 && payload.score <= 100);
});

test('une campagne ordinaire reste entièrement hors du runtime Alpha/Bravo', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  engine.start(options({ campaignId: 'campaign-ordinary' }));
  assert.deepEqual(engine.getAlphaBravoUiStateV69(), { active: false });
  assert.equal(engine.selectAlphaBravoFireteamV69('alpha'), false);
  assert.equal(engine.beginAlphaBravoPingV69(), false);
  assert.equal(engine.captureResumeState().specialOperation, undefined);
  const member = engine.squadActors[0];
  const before = member.x;
  engine.updateSquadMovement(member, 0, engine.player, 0.1);
  assert.notEqual(member.x, before, 'le mouvement hérité doit rester actif hors campagne V69');
}));

test('une insertion Alpha/Bravo neuve place chaque contact hors de la bulle sûre de chacun des quatre opérateurs', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  engine.start(options({
    testEnemies: [
      enemyAt('contact-overlap-player', 146),
      enemyAt('contact-overlap-alpha', 58, { width: 68, height: 86, y: 618 }),
      enemyAt('contact-near-insertion', 410),
      enemyAt('contact-already-safe', 2140)
    ]
  }));

  const operators = engine.alphaBravoAllActorsV69();
  assert.equal(operators.length, 4);
  for (const enemy of engine.enemies) {
    for (const operator of operators) {
      assert.ok(
        centerDistance(enemy, operator) >= ALPHA_BRAVO_INSERTION_SAFE_RADIUS_V69,
        `${enemy.id} reste trop près de ${operator.id}`
      );
    }
  }
  assert.equal(engine.alphaBravoInsertionSecurityV69.unsafe, 0);
  assert.equal(engine.alphaBravoInsertionSecurityV69.moved, 3);

  const positionsAfterStart = engine.enemies.map(({ id, x, y }) => ({ id, x, y }));
  engine.secureAlphaBravoInsertionV69();
  assert.deepEqual(
    engine.enemies.map(({ id, x, y }) => ({ id, x, y })),
    positionsAfterStart,
    'la sécurisation est strictement one-shot et ne téléporte plus les contacts'
  );
}));

test('les contacts sécurisés restent entièrement dans le monde et posés sur une surface physique non-lift', () => withImageMock(() => {
  const engine = new AlphaBravoHarness();
  engine.start(options({
    testEnemies: [
      enemyAt('contact-wide', 130, { width: 96, height: 112, y: 592 }),
      enemyAt('contact-floating', 260, { y: 300 }),
      enemyAt('contact-edge', -40)
    ]
  }));

  for (const enemy of engine.enemies) {
    const surface = engine.alphaBravoEnemySurfaceV69(enemy, 1)?.platform;
    assert.ok(surface, `${enemy.id} doit être ancré sur une surface valide`);
    assert.ok(enemy.x >= 0 && enemy.x + enemy.w <= engine.missionLevelBounds.width, `${enemy.id} sort horizontalement du monde`);
    assert.ok(enemy.y >= 0 && enemy.y + enemy.h <= engine.missionLevelBounds.height, `${enemy.id} sort verticalement du monde`);
    assert.ok(enemy.x >= surface.x - 2 && enemy.x + enemy.w <= surface.x + surface.w + 2, `${enemy.id} déborde de sa surface`);
    assert.equal(enemy.y + enemy.h, surface.y);
    assert.equal(enemy.groundY, surface.y);
    assert.equal(enemy.levelNavigation?.surfaceId, surface.id);
  }
  assert.equal(engine.alphaBravoInsertionSecurityV69.unsupported, 0);
}));

test('une reprise Alpha/Bravo conserve exactement la position et l’état sauvegardés sans re-sécurisation arbitraire', () => withImageMock(() => {
  const template = [enemyAt('contact-resumed', 160), enemyAt('contact-distant', 2400)];
  const source = new AlphaBravoHarness();
  source.start(options({ operationId: 'operation-resume-spawn', testEnemies: template }));
  const resumedContact = source.enemies.find((enemy) => enemy.id === 'contact-resumed');
  Object.assign(resumedContact, { x: 218, y: 630, spawnX: 218, groundY: 704, health: 37, alive: true, alert: true, facing: 1 });
  const resumeState = source.captureResumeState();

  const restored = new AlphaBravoHarness();
  restored.start(options({ operationId: 'operation-resume-spawn', testEnemies: template, resumeState }));
  const contact = restored.enemies.find((enemy) => enemy.id === 'contact-resumed');
  assert.deepEqual(
    { x: contact.x, y: contact.y, health: contact.health, alive: contact.alive, alert: contact.alert, facing: contact.facing },
    { x: 218, y: 630, health: 37, alive: true, alert: true, facing: 1 }
  );
  assert.equal(contact.alphaBravoInsertionRelocatedV69, undefined);
  assert.equal(restored.alphaBravoInsertionSecurityV69.reason, 'resume-preserved');
  assert.equal(restored.alphaBravoInsertionSecurityV69.moved, 0);
  const resumedPosition = { x: contact.x, y: contact.y };
  assert.equal(restored.secureAlphaBravoInsertionV69(), restored.alphaBravoInsertionSecurityV69);
  assert.deepEqual({ x: contact.x, y: contact.y }, resumedPosition, 'la reprise doit rester one-shot même après un nouvel appel sans option');
}));

test('une campagne ordinaire garde ses spawns ennemis strictement inchangés, même dans la zone d’insertion', () => withImageMock(() => {
  const initial = [enemyAt('ordinary-overlap', 146), enemyAt('ordinary-floating', 310, { y: 280 })];
  const engine = new AlphaBravoHarness();
  engine.start(options({ campaignId: 'campaign-ordinary-spawn-contract', testEnemies: initial }));
  assert.deepEqual(
    engine.enemies.map(({ id, x, y, spawnX, groundY }) => ({ id, x, y, spawnX, groundY })),
    initial.map(({ id, x, y, spawnX, groundY }) => ({ id, x, y, spawnX, groundY }))
  );
  assert.equal(engine.alphaBravoInsertionSecuredV69, false);
  assert.equal(engine.alphaBravoInsertionSecurityV69, null);
  assert.equal(engine.events.some((event) => event.type === 'alpha-bravo-insertion-secured'), false);
}));
