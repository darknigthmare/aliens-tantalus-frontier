import { createJeriSurfaceStateV135, buildJeriSurfaceSceneV135, findJeriSurfaceV135,
  validateJeriSurfaceStateV135, attachJeriSurfaceV135, releaseJeriSurfaceV135, stepJeriSurfaceV135, jeriSurfaceContactsV135 } from './jeri-surface-motion-v135.js';
import { ENEMIES, LEVEL_SEEDS } from './content-core-v50.js';
import { buildMissionLevelV52, validateMissionPhysicalTopologyV57, validateMissionTopologyV52 } from './mission-levels-v52.js';
import { computeMissionLayerCoverCropV62 } from './game-v52-level-runtime.js';
import { verticalLayerOffsetV130 } from './vertical-world-v130.js';
import { HIVE_PROFILES_V131, HIVE_ORDERS_V131, HIVE_ENDINGS_V131, HIVE_CONSCIOUSNESSES_V131,
  createHiveControlV131, hivePhaseV131, hiveDossierV131, spendHiveChargeV131,
  selectHiveProfileV131, inspectHiveProfileV131, hiveEndingAvailabilityV131, validateHiveControlV131 } from './hive-control-v131.js';

export const HIVE_CAMPAIGNS_V131 = Object.freeze([
  { id: 'special-jeri-v131', specialOperationId: 'jeri-false-son', name: 'JERI · LE FAUX FILS', mode: 'INFILTRATION',
    objective: 'Traverser les inspections, sauver un captif et neutraliser SAINT avant l’inspection royale.', summary: 'Profils phéromonaux, dissonance et corps segmenté.' },
  { id: 'special-atax-v131', specialOperationId: 'atax-false-queen', name: 'A.T.A.X.-Q · LA FAUSSE REINE', mode: 'ROYAL',
    objective: 'Recruter une meute, commander trois artères et ouvrir la chambre royale.', summary: 'Charge finie, loyauté, ordres et contrôle à distance sûr.' },
  { id: 'special-eloise-v131', specialOperationId: 'eloise-uncrowned-queen', name: 'ÉLOÏSE · LA REINE SANS COURONNE', mode: 'HIVE',
    objective: 'Résoudre trois pylônes, affronter le Chasseur de Mères et choisir une conclusion.', summary: 'Trois consciences, Chœur, douleur et topologie mutable.' }
].map(campaign => Object.freeze({ ...campaign, worldId: 'world-05-lethe', year: 2204, routes: 3,
  canon: 'project-continuity', canonExact: false, source: 'Tantalus Original Adaptations', templateId: 'ship-interior-vertical',
  description: `${campaign.summary} Missions originales du Tantalus ; les personnages n’ont pas encore de planches dédiées.` })));

export const HIVE_ART_DEBT_V131 = Object.freeze({
  'jeri-false-son': Object.freeze(['JERI segmenté et animations mur/plafond dédiées', 'SAINT trois phases', 'inspection royale dédiée']),
  'atax-false-queen': Object.freeze(['armure REGINA mécanique', 'castes Kenner absentes de l’arsenal animé actuel']),
  'eloise-uncrowned-queen': Object.freeze(['Éloïse animée (portrait statique disponible)', 'HUSH-6', 'Premier-Né dédié', 'Chasseur de Mères'])
});
const HIVE_PHASE_LABELS_V131 = Object.freeze({ commission: 'INITIALISATION', infiltrate: 'INFILTRATION', rescue: 'SAUVETAGE',
  saint: 'AFFRONTER SAINT', 'queen-inspection': 'INSPECTION ROYALE', recruit: 'RECRUTEMENT', arteries: 'TROIS ARTÈRES',
  queen: 'CHAMBRE ROYALE', pylons: 'TROIS PYLÔNES', 'mother-hunter': 'CHASSEUR DE MÈRES', decision: 'CHOISIR UNE CONCLUSION',
  extract: 'RETOUR', complete: 'TERMINÉE', failed: 'ÉCHEC' });
const list = value => Array.isArray(value) ? value : [];
const clone = value => structuredClone(value);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const center = actor => actor.x + actor.w / 2;
const feet = actor => actor.y + actor.h;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const near = (actor, station, radius = 78) => Boolean(actor && station && Math.hypot(center(actor) - station.x, feet(actor) - station.floorY) <= radius);
const ACTIVE = actor => actor?.alive && !actor.downed && !actor.ventTransit && !actor.inVehicle;
const source = id => ENEMIES.find(enemy => enemy.id === id) || ENEMIES[3];

function stationsFor(operationId) {
  const common = [
    { id: 'commission', x: 240, floorY: 760, label: 'PUPITRE D’INTERFACE', duration: 2 },
    { id: 'capsule-a', x: 600, floorY: 760, label: 'CHARGE SCELLÉE', charge: 20 },
    { id: 'capsule-b', x: 1660, floorY: 760, label: 'CHARGE SCELLÉE', charge: 20 },
    { id: 'capsule-c', x: 2450, floorY: 460, label: 'CHARGE SCELLÉE', charge: 20 },
    { id: 'boss-relay', x: 2720, floorY: 760, label: 'RELAIS DU COMBAT', duration: 2 },
    { id: 'extraction', x: 3690, floorY: 760, label: 'BALISE DE RETOUR', duration: 2 }
  ];
  if (operationId === 'jeri-false-son') return common.concat([
    { id: 'inspection-worker', x: 920, floorY: 760, label: 'INSPECTION OUVRIÈRE', profile: 'worker', gateId: 'hive-gate-worker' },
    { id: 'inspection-nurse', x: 1820, floorY: 760, label: 'INSPECTION NOURRICE', profile: 'nurse', gateId: 'hive-gate-nurse' },
    { id: 'rescue', x: 2230, floorY: 460, label: 'COCON HUMAIN', duration: 3 },
    { id: 'inspection-queen', x: 3110, floorY: 760, label: 'INSPECTION DE LA REINE', profile: 'royal-echo', cost: 8, gateId: 'hive-gate-final' }
  ]);
  if (operationId === 'atax-false-queen') return common.concat([
    { id: 'artery-bulwark', x: 1480, floorY: 760, label: 'ARTÈRE · REMPART', order: 'bulwark', duration: 3 },
    { id: 'artery-shadow', x: 2150, floorY: 460, label: 'ARTÈRE · OMBRE', order: 'shadow', duration: 3 },
    { id: 'artery-claw', x: 2860, floorY: 300, label: 'ARTÈRE · GRIFFE', order: 'claw', duration: 3 }
  ]);
  return common.concat([
    { id: 'pylon-0', x: 850, floorY: 760, label: 'PYLÔNE I · MÉMOIRE', duration: 3 },
    { id: 'pylon-1', x: 1750, floorY: 460, label: 'PYLÔNE II · DOULEUR', duration: 3 },
    { id: 'pylon-2', x: 2580, floorY: 300, label: 'PYLÔNE III · CHŒUR', duration: 3 },
    { id: 'hush', x: 1180, floorY: 760, label: 'HUSH-6 · MÉMOIRE LOCALE', duration: 2 },
    { id: 'nexus', x: 3150, floorY: 760, label: 'NEXUS · CONCLUSION' }
  ]);
}

export function buildHiveMissionV131(options = {}) {
  const campaign = typeof options.campaign === 'string' ? HIVE_CAMPAIGNS_V131.find(entry => entry.id === options.campaign)
    : options.campaign || HIVE_CAMPAIGNS_V131[0];
  if (!HIVE_CAMPAIGNS_V131.some(entry => entry.id === campaign?.id)) throw new Error('Unknown hive campaign.');
  const original = buildMissionLevelV52({ ...options, campaign, levelSeeds: options.levelSeeds || LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const operationId = campaign.specialOperationId, width = 3880, height = 850;
  const platform = (id, x, y, w, floor = false) => ({ id, x, y, w, h: floor ? 48 : 22, floor,
    kind: floor ? 'terrain-step' : 'route-bridge', zoneId: 'hive-interior', art: floor ? 'floor' : 'catwalk' });
  const platforms = [platform('hive-lower', 0, 760, width, true), platform('hive-service', 450, 460, 2490),
    platform('hive-crown', 1100, 300, 2000)];
  const ladders = [{ id: 'hive-ladder-west', x: 500, y: 460, w: 42, h: 322, kind: 'ladder', from: 'west-low', to: 'west-mid' },
    { id: 'hive-ladder-core-low', x: 2130, y: 460, w: 42, h: 322, kind: 'ladder', from: 'core-low', to: 'core-mid' },
    { id: 'hive-ladder-core-high', x: 2130, y: 300, w: 42, h: 182, kind: 'ladder', from: 'core-mid', to: 'core-high' },
    { id: 'hive-ladder-east', x: 2880, y: 300, w: 42, h: 482, kind: 'ladder', from: 'east-low', to: 'east-high' }];
  const positions = [['spawn', 120, 760], ['west-low', 521, 760], ['core-low', 2151, 760], ['east-low', 2901, 760], ['extract', 3690, 760],
    ['west-mid', 521, 460], ['core-mid', 2151, 460], ['east-mid', 2901, 460], ['core-high', 2151, 300], ['east-high', 2901, 300]];
  const nodes = positions.map(([id, x, y]) => ({ id, x, y, width: 250, zoneId: 'hive-interior' }));
  const edges = [], add = (from, to, kind = 'walk') => edges.push({ id: `hive-${from}-${to}`, from, to, kind, routeIds: [] });
  for (const route of [['spawn', 'west-low', 'core-low', 'east-low', 'extract'], ['west-mid', 'core-mid', 'east-mid'], ['core-high', 'east-high']])
    for (let i = 1; i < route.length; i++) add(route[i - 1], route[i]);
  add('west-low', 'west-mid', 'ladder'); add('core-low', 'core-mid', 'ladder'); add('core-mid', 'core-high', 'ladder');
  add('east-low', 'east-high', 'ladder'); add('east-mid', 'east-high', 'ladder');
  const routes = [
    { id: 'hive-spine', role: 'ground-assault', nodeIds: ['spawn', 'west-low', 'core-low', 'east-low', 'extract'] },
    { id: 'hive-service-route', role: 'service-infiltration', nodeIds: ['spawn', 'west-low', 'west-mid', 'core-mid', 'core-low', 'east-low', 'extract'] },
    { id: 'hive-crown-route', role: 'crown-route', nodeIds: ['spawn', 'west-low', 'west-mid', 'core-mid', 'core-high', 'east-high', 'east-low', 'extract'] }
  ];
  const doors = operationId === 'jeri-false-son' ? [
    { id: 'hive-gate-worker', x: 1000, y: 0, w: 46, h: 760, kind: 'gate', visualRole: 'security-shutter', lockedBy: 'hive' },
    { id: 'hive-gate-nurse', x: 1900, y: 0, w: 46, h: 760, kind: 'gate', visualRole: 'security-shutter', lockedBy: 'hive' },
    { id: 'hive-gate-final', x: 3200, y: 0, w: 46, h: 760, kind: 'gate', visualRole: 'pressure-airlock', lockedBy: 'hive' }
  ] : [{ id: 'hive-gate-final', x: 3300, y: 0, w: 46, h: 760, kind: 'gate', visualRole: 'pressure-airlock', lockedBy: 'hive' }];
  const enemySpecs = [
    { id: 'hive-patrol-a', sourceId: 'enemy-004-drone-big-chap', x: 1380, floorY: 760 },
    { id: 'hive-patrol-b', sourceId: 'enemy-005-warrior', x: 2340, floorY: 460 },
    { id: 'hive-patrol-c', sourceId: 'enemy-006-runner', x: 3020, floorY: 760 },
    { id: 'hive-boss', sourceId: operationId === 'atax-false-queen' ? 'enemy-008-queen' : 'enemy-042-combat-synthetic',
      x: 2980, floorY: 760, boss: true, label: operationId === 'jeri-false-son' ? 'SAINT · ADAPTATION' : operationId === 'atax-false-queen' ? 'REINE DE LA CHAMBRE' : 'CHASSEUR DE MÈRES · ADAPTATION' }
  ];
  const recruitSpecs = operationId === 'atax-false-queen' ? [
    { id: 'hive-recruit-drone', sourceId: 'enemy-004-drone-big-chap', x: 660, floorY: 760, label: 'DRONE' },
    { id: 'hive-recruit-warrior', sourceId: 'enemy-005-warrior', x: 820, floorY: 760, label: 'GUERRIER' },
    { id: 'hive-recruit-runner', sourceId: 'enemy-006-runner', x: 1250, floorY: 460, label: 'COUREUR' }
  ] : operationId === 'eloise-uncrowned-queen' ? [
    { id: 'hive-firstborn', sourceId: 'enemy-004-drone-big-chap', x: 1980, floorY: 460, label: 'PREMIER-NÉ · ADAPTATION', storyRole: 'firstborn' }
  ] : [];
  const stations = stationsFor(operationId);
  const anchors = { spawn: { nodeId: 'spawn', x: 120, y: 760, zoneId: 'hive-interior' },
    extraction: { nodeId: 'extract', x: 3690, y: 760, zoneId: 'hive-interior' },
    'objective-primary': { nodeId: 'core-mid', x: 2151, y: 460, zoneId: 'hive-interior' } };
  const plan = { ...original, signature: `${original.signature}:hive-${operationId}-v131`,
    dimensions: { width, height }, anchors, graph: { nodes, edges, routes },
    geometry: { platforms, ladders, doors, vents: [] }, hazards: [], aquaticHabitats: [], events: [], spawns: [],
    biomeZones: [{ id: 'hive-interior', label: 'Ruche expérimentale du Tantalus', x: 0, w: width, biome: 'industrial',
      layers: { far: 'accepted-ship-far', mid: 'accepted-ship-mid', foreground: 'accepted-ship-foreground' }, visual: { tint: '#20363b', fog: 0.1 } }],
    routeRuntime: { ...original.routeRuntime, source: 'hive-mission-v131', platforms, ladders, hazards: [], routeNodes: nodes,
      verticalSpan: 460, maxTier: 3, routes: 3, routeSpan: width },
    hiveMissionV131: { schema: 131, operationId, campaignId: campaign.id, stations, enemySpecs, recruitSpecs,
      enemyIds: enemySpecs.map(spec => spec.id), recruitIds: recruitSpecs.map(spec => spec.id),
      capsuleIds: stations.filter(station => station.charge).map(station => station.id), artDebt: [...HIVE_ART_DEBT_V131[operationId]],
      sectors: operationId === 'atax-false-queen' ? ['Interface', 'Caste', 'Rempart', 'Ombre', 'Griffe', 'Chambre', 'Retour'] : ['Interface', 'Service', 'Couronne', 'Chambre', 'Retour'] } };
  const checks = [validateMissionTopologyV52(plan), validateMissionPhysicalTopologyV57(plan)], errors = checks.flatMap(check => check.errors || []);
  if (errors.length) throw new Error(`Invalid hive mission: ${errors.join('; ')}`);
  plan.validation = { ...original.validation, ...checks[0], valid: true, errors: [], physicalValid: true, hiveV131: true,
    physicalLadderCount: checks[1].ladderCount, physicalHazardCount: checks[1].hazardCount,
    roomCoherenceValid: false, roomCoherenceReason: 'Authored hive gate topology; runtime verifies actual supports.' };
  return plan;
}

export function withHiveMissionsV131(BaseEngine) {
  if (BaseEngine.hiveMissionsV131 === true) return BaseEngine;
  return class HiveMissionsV131 extends BaseEngine {
    static hiveMissionsV131 = true;
    start(options = {}) {
      this.hiveActiveV131 = HIVE_CAMPAIGNS_V131.some(campaign => campaign.id === options.campaign?.id);
      this.hiveV131 = null; this.hiveActorsV131 = []; this.hiveCheckpointV131 = null; this.hiveMenuV131 = false;
      this.hiveManifestV131 = null; this.hiveIdentityV131 = null; this.hiveBasePlatformsV131 = []; this.hiveBaseWallsV131 = [];
      this.hiveHeldKeysV131 = new Set(); this.hiveChannelActorV131 = null;
      this.jeriSurfaceV135 = createJeriSurfaceStateV135(); this.jeriGeometryV135 = null;
      if (!this.hiveActiveV131) return super.start(options);
      const manifest = options.missionLevel?.hiveMissionV131;
      if (!manifest || manifest.schema !== 131 || manifest.campaignId !== options.campaign.id) throw new Error('Hive missions require buildHiveMissionV131.');
      this.hiveManifestV131 = manifest; this.hiveV131 = createHiveControlV131(manifest.operationId);
      // Preserve the selected human identity, crew, friends, weapons and armor.
      // Remote bodies are a dedicated local roster; this.player is never swapped.
      super.start({ ...options, resumeState: undefined, vehicle: null, userCasteCampaignV88: false, neuroProfile: null,
        destructibleSceneryV130: false });
      this.configureHiveMissionV131(options.missionLevel);
      if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      this.syncHiveMissionV131(); this.hiveCheckpointV131 ||= this.captureHiveCheckpointV131();
      this.onEvent?.({ type: 'hive-radio-v131', operationId: manifest.operationId, text: hiveDossierV131(this.hiveV131).instruction });
      return this.getSnapshot();
    }

    isHiveMissionV131() { return Boolean(this.hiveActiveV131 && this.hiveV131); }
    hiveCanActV131(actor = this.player) {
      return Boolean(this.isHiveMissionV131() && this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
        && this.mission?.state === 'active' && ACTIVE(actor) && actor === this.player
        && !this.isFieldActionBusyV124?.(actor) && !this.isPlaceableBusyV86?.(actor));
    }

    isJeriSurfaceAttachedV135() { return this.isHiveMissionV131() && this.hiveV131.operationId === 'jeri-false-son' && this.jeriSurfaceV135?.mode === 'attached'; }
    jeriSurfaceSceneV135(state = this.hiveV131) {
      return buildJeriSurfaceSceneV135(this.jeriGeometryV135, state, this.hiveManifestV131?.stations);
    }
    applyJeriSurfaceMotionV135(result) {
      this.jeriSurfaceV135 = result.state;
      const actor = this.player;
      for (const key of ['x', 'y', 'vx', 'vy']) if (Number.isFinite(result.actor?.[key])) actor[key] = result.actor[key];
      actor.climbing = this.isJeriSurfaceAttachedV135(); actor.grounded = false;
      if (actor.climbing && result.state.face !== 'underside') actor.facing = result.state.face === 'left' ? 1 : -1;
      actor.ladderId = actor.climbing ? `jeri-surface:${result.state.surfaceId}` : null;
      actor.ladderDetachClock = .2; actor.jumpBuffer = 0; actor.coyoteTime = 0;
      actor.crouching = false; actor.inCover = false; actor.coverSource = null;
    }
    toggleVehicle(actor = this.player) {
      if (!this.isHiveMissionV131() || this.hiveV131.operationId !== 'jeri-false-son') return super.toggleVehicle(actor);
      if (!this.hiveCanActV131(actor) || this.hiveV131.possession || this.hiveV131.segments.head <= 0 || this.hiveV131.segments.legs <= 0) return false;
      const result = this.isJeriSurfaceAttachedV135() ? releaseJeriSurfaceV135(actor, this.jeriSurfaceV135)
        : attachJeriSurfaceV135(actor, this.jeriSurfaceV135, this.jeriSurfaceSceneV135());
      if (!result.changed && !result.released) return this.locked('V : SE RAPPROCHER D’UN MUR OU D’UN DESSOUS DE PASSERELLE');
      this.hiveV131.channel = null; this.hiveV131.channelProgress = 0;
      this.applyJeriSurfaceMotionV135(result);
      this.onEvent?.({ type: 'jeri-surface-v135', attached: result.state.mode === 'attached', face: result.state.face });
      return true;
    }
    updateJeriSurfacePlayerV135(actor, delta, controls, mobility) {
      const scene = this.jeriSurfaceSceneV135();
      if (!this.isJeriSurfaceAttachedV135()) {
        this.jeriSurfaceV135 = stepJeriSurfaceV135(actor, this.jeriSurfaceV135, scene, {}, delta).state;
        return false;
      }
      const held = code => this.keys.has(code);
      const input = { horizontal: Number(held(controls.right) || held('ArrowRight')) - Number(held(controls.left) || held('ArrowLeft')),
        vertical: Number(held(controls.down) || held('ArrowDown')) - Number(held(controls.up) || held('ArrowUp')),
        jump: actor.jumpBuffer > 0 };
      if (input.jump || !ACTIVE(actor) || this.hiveV131.segments.legs <= 0) {
        this.applyJeriSurfaceMotionV135(releaseJeriSurfaceV135(actor, this.jeriSurfaceV135, input.jump)); return true;
      }
      const checked = validateJeriSurfaceStateV135(this.jeriSurfaceV135, actor, scene);
      if (!checked.valid) { this.applyJeriSurfaceMotionV135(releaseJeriSurfaceV135(actor, this.jeriSurfaceV135)); return true; }
      const pose = { x: actor.x, y: actor.y }, keys = this.keys;
      // Native update still owns cooldowns, reloads and damage. Adhesion adds a
      // contact constraint around its gravity step; it cannot advance a station.
      this.keys = new Set(); actor.vx = actor.vy = 0; actor.climbing = false; actor.ladderDetachClock = delta + .2;
      try { super.updatePlayer(actor, delta, controls); } finally { this.keys = keys; }
      if (!ACTIVE(actor) || this.mission.state !== 'active') return true;
      Object.assign(actor, pose);
      if (this.jeriSurfaceV135.face === 'underside' && input.horizontal) actor.facing = -Math.sign(input.horizontal);
      this.applyJeriSurfaceMotionV135(stepJeriSurfaceV135(actor, this.jeriSurfaceV135, scene, input, delta, mobility));
      return true;
    }

    configureHiveMissionV131(plan) {
      const config = plan.hiveMissionV131;
      this.jeriGeometryV135 = { ...clone(plan.geometry), ...plan.dimensions };
      this.platforms = plan.geometry.platforms.map(surface => ({ ...surface }));
      this.hiveBasePlatformsV131 = this.platforms.map(surface => ({ ...surface }));
      this.ladders = plan.geometry.ladders.map(ladder => ({ ...ladder, x: ladder.x + ladder.w / 2, top: ladder.y, bottom: ladder.y + ladder.h - 22 }));
      this.doors = plan.geometry.doors.map(door => ({ ...door, progress: 0, open: false, levelLocked: true }));
      this.walls = config.operationId === 'eloise-uncrowned-queen'
        ? [{ id: 'hive-corporate-barrier', x: 1290, y: 628, w: 45, h: 132, art: 'crates' }] : [];
      this.hiveBaseWallsV131 = this.walls.map(wall => ({ ...wall }));
      for (const name of ['lifts', 'covers', 'hazards', 'vents', 'supplies', 'objectiveNodes', 'collectablesV68', 'narrativeCollectablesV68']) this[name] = [];
      this.bullets = []; this.hostileProjectiles = []; this.drops = [];
      this.powerNode = null; this.archiveTerminal = null; this.ventShortcut = null;
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear();
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear(); this.missionLevelExtractionTimer = null;
      this.weaponPickup.taken = true; this.toolPickup.taken = true;
      if (this.vehicle) { this.vehicle.active = false; this.vehicle.occupied = false; this.vehicle.driver = null; }
      this.player.x = plan.anchors.spawn.x - this.player.w / 2; this.player.y = plan.anchors.spawn.y - this.player.h;
      this.player.vx = this.player.vy = 0; this.player.grounded = true; this.player.inVehicle = false;
      this.coop.x = this.player.x - 58; this.coop.y = this.player.y;
      this.enemies = config.enemySpecs.map((spec, index) => this.createHiveActorV131(spec, index, true));
      this.hiveActorsV131 = config.recruitSpecs.map((spec, index) => this.createHiveActorV131(spec, 70 + index, false));
      const boss = this.hiveBossV131(); boss.dormant = true; boss.alive = true;
      this.objective = { id: 'hive-extraction', x: 3660, y: 670, w: 60, h: 90, complete: false };
      this.missionLevelBounds = { ...plan.dimensions, voidY: plan.dimensions.height + 100 };
      this.camera.x = 0; this.camera.y = 130;
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.hiveIdentityV131 = { originalOperatorId: this.player.operatorId || null, originalCrewId: this.player.crewId || null,
        representation: 'selected-avatar-interface', canonExact: false, artDebt: [...config.artDebt] };
      this.refreshSpriteCollisionProfiles?.();
    }

    createHiveActorV131(spec, index, hostile) {
      const actor = this.createEnemy(source(spec.sourceId), index, spec.x, spec.floorY, { boss: Boolean(spec.boss), keyCarrier: false });
      actor.id = spec.id; actor.hiveSpecV131 = spec.id; actor.storyRoleV131 = spec.storyRole || null;
      actor.hiveLabelV131 = spec.label || null; actor.hiveHostileV131 = hostile;
      actor.rearEntryV130 = null; actor.dormant = false; actor.alive = true;
      actor.health = actor.maxHealth = spec.boss ? this.hiveV131.operationId === 'atax-false-queen' ? 360 : 240 : 70;
      actor.hiveOrderV131 = 'follow'; actor.loyaltyV131 = 78; actor.hiveAttackClockV131 = 0;
      actor.hiveRecruitedV131 = false; actor.hiveLostV131 = false; actor.vx = actor.vy = 0; actor.grounded = true;
      this.initializeEnemyMissionNavigation?.(actor); return actor;
    }
    hiveBossV131() { return this.enemies?.find(enemy => enemy.id === 'hive-boss'); }
    hiveControlledActorV131() { return this.hiveActorsV131.find(actor => actor.id === this.hiveV131?.possession?.actorId && actor.hiveRecruitedV131 && ACTIVE(actor)); }

    syncHiveMissionV131() {
      if (!this.isHiveMissionV131()) return;
      const state = this.hiveV131, operation = state.operationId;
      state.phase = hivePhaseV131(state); this.mission.phase = state.phase;
      this.mission.objectives = { power: state.commissioned, route: operation === 'jeri-false-son' ? state.finalInspection
        : operation === 'atax-false-queen' ? state.arteries.length === 3 : !state.pylons.includes('sealed'),
        archive: operation !== 'eloise-uncrowned-queen' || Boolean(state.ending), boss: state.bossDefeated, extract: state.complete };
      for (const door of this.doors) {
        const inspection = this.hiveManifestV131.stations.find(station => station.gateId === door.id);
        const open = inspection ? state.inspections.includes(inspection.id)
          : state.bossDefeated && (operation !== 'eloise-uncrowned-queen' || Boolean(state.ending));
        door.open = open; door.levelLocked = !open; door.lockedBy = open ? null : 'hive';
      }
      const resolved = state.pylons.filter(value => value !== 'sealed').length;
      this.platforms = this.hiveBasePlatformsV131.map(surface => ({ ...surface }));
      this.walls = this.hiveBaseWallsV131.filter(wall => !(operation === 'eloise-uncrowned-queen' && resolved >= 1)).map(wall => ({ ...wall }));
      if (operation === 'eloise-uncrowned-queen' && resolved >= 1) {
        this.platforms.push({ id: 'hive-organic-bridge', x: 1100, y: 610, w: 740, h: 22, kind: 'route-bridge', art: 'catwalk', floor: false });
        if (!this.ladders.some(ladder => ladder.id === 'hive-organic-ladder')) this.ladders.push({ id: 'hive-organic-ladder', x: 1380, top: 460, bottom: 760, w: 42 });
      } else this.ladders = this.ladders.filter(ladder => ladder.id !== 'hive-organic-ladder');
      this.hazards = operation === 'eloise-uncrowned-queen' && resolved >= 2 ? [
        { id: 'hive-contested-energy', x: 1980, y: 740, w: 130, h: 20, kind: 'electrical', damage: 10, active: true }
      ] : [];
      this.objective.complete = state.complete;
      const boss = this.hiveBossV131();
      if (boss) { boss.dormant = !state.bossReleased || state.bossDefeated; if (state.bossDefeated) boss.alive = false; }
    }

    hiveMilestoneV131(id, text) {
      const state = this.hiveV131;
      if (id && !state.journal.includes(id)) state.journal.push(id);
      this.syncHiveMissionV131();
      if (text) this.onEvent?.({ type: 'hive-radio-v131', operationId: state.operationId, text, id });
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.hiveCheckpointV131 = this.captureHiveCheckpointV131();
      this.onEvent?.({ type: 'checkpoint', checkpoint: id || 'hive-progress', operationId: state.operationId });
    }

    beginHiveChannelV131(station, action = station.id) {
      if (!this.hiveCanActV131() || this.isJeriSurfaceAttachedV135() || this.hiveV131.possession || !near(this.player, station)) return false;
      if (this.hiveV131.channel !== action) this.hiveV131.channelProgress = 0;
      this.hiveV131.channel = action; this.hiveChannelActorV131 = this.player; return true;
    }

    interact(actor = this.player) {
      if (!this.isHiveMissionV131()) return super.interact(actor);
      if (!this.hiveCanActV131(actor)) return false;
      if (this.isJeriSurfaceAttachedV135()) return this.locked('V OU SAUT : SE DÉTACHER AVANT UNE INTERACTION');
      if (this.hiveV131.possession) return this.releaseHivePossessionV131('operator');
      const state = this.hiveV131, station = this.hiveManifestV131.stations.filter(candidate => near(actor, candidate)
        && !(candidate.charge && state.spentCapsules.includes(candidate.id)))
        .sort((a, b) => Math.abs(center(actor) - a.x) - Math.abs(center(actor) - b.x))[0];
      if (station?.charge) {
        if (state.spentCapsules.includes(station.id)) return this.locked('CAPSULE DÉJÀ CONSOMMÉE');
        state.spentCapsules.push(station.id);
        const replenished = Math.min(100, state.charge + station.charge) - state.charge;
        state.chargeCollected += replenished; state.charge += replenished;
        for (const key of ['head', 'torso', 'legs']) state.segments[key] = Math.min(createHiveControlV131(state.operationId).segments[key], state.segments[key] + 12);
        this.hiveMilestoneV131(station.id, 'Charge scellée consommée ; elle ne réapparaît pas à la reprise.'); return true;
      }
      if (!state.commissioned) return station?.id === 'commission' ? this.beginHiveChannelV131(station) : this.locked('INITIALISER L’INTERFACE AU PUPITRE');
      const recruit = this.hiveActorsV131.filter(candidate => !candidate.hiveRecruitedV131 && !candidate.hiveLostV131 && ACTIVE(candidate))
        .find(candidate => Math.hypot(center(candidate) - center(actor), feet(candidate) - feet(actor)) <= 110);
      if (recruit) return this.recruitHiveActorV131(recruit.id).applied;
      if (!station) return super.interact(actor);
      if (station.profile) {
        if (station.id === 'inspection-queen' && (!state.rescued || !state.bossDefeated)) return this.locked('SAUVETAGE ET SAINT REQUIS');
        const result = inspectHiveProfileV131(state, station);
        if (result.applied) {
          if (station.id === 'inspection-queen') state.finalInspection = true;
          this.hiveMilestoneV131(station.id, 'Le sas physique accepte le profil.');
        } else {
          if (result.reason === 'caste-rejected') this.releaseHiveThreatV131(station.id);
          this.onEvent?.({ type: 'hive-rejected-v131', reason: result.reason }); this.syncHiveMissionV131();
        }
        return result.applied;
      }
      if (station.id === 'rescue' && state.inspections.length < 2) return this.locked('DEUX INSPECTIONS REQUISES');
      if (station.id === 'boss-relay' && (!state.bossReleased || !state.bossShielded)) return this.locked('RELAIS UTILISABLE ENTRE DEUX PHASES');
      if (station.order && !this.hiveActorsV131.some(recruit => recruit.hiveRecruitedV131 && ACTIVE(recruit)
        && recruit.hiveOrderV131 === station.order && near(recruit, station, 145))) return this.locked('RECRUE LOYALE ET ORDRE CORRESPONDANT REQUIS PRÈS DU RELAIS');
      if (station.id === 'nexus') { this.openHiveCommandV131(); return true; }
      if (station.id === 'extraction' && this.missingHiveExtractionV131({ ignoreHold: true })) return this.locked(this.missingHiveExtractionV131({ ignoreHold: true }));
      return this.beginHiveChannelV131(station);
    }

    recruitHiveActorV131(actorId) {
      const actor = this.hiveActorsV131.find(candidate => candidate.id === actorId);
      if (!this.hiveCanActV131() || !this.hiveV131.commissioned || !ACTIVE(actor) || actor.hiveRecruitedV131 || actor.hiveLostV131
        || Math.hypot(center(actor) - center(this.player), feet(actor) - feet(this.player)) > 110 || !this.hiveContactClearV131(this.player, actor))
        return { applied: false, reason: 'recruit-not-local' };
      if (!spendHiveChargeV131(this.hiveV131, 12)) return { applied: false, reason: 'charge-empty' };
      actor.hiveRecruitedV131 = true; actor.loyaltyV131 = actor.storyRoleV131 ? 88 : 78;
      this.hiveV131.recruitedIds.push(actor.id); this.hiveV131.selectedRecruit ||= actor.id;
      this.hiveMilestoneV131(`recruit-${actor.id}`, 'Une caste rejoint la meute ; sa santé et sa loyauté restent propres.');
      return { applied: true, reason: 'recruited' };
    }
    hiveContactClearV131(from, to) {
      return Boolean(from && to && ![...list(this.walls), ...list(this.covers), ...this.closedDoorColliders()]
        .some(obstacle => !obstacle.destroyed && (overlap(from, obstacle) || overlap(to, obstacle)))
        && this.enemyMeleePathClearV64(from, to));
    }

    issueHiveOrderV131(orderId, actorId = null) {
      const rule = HIVE_ORDERS_V131.find(entry => entry.id === orderId);
      const actors = this.hiveActorsV131.filter(actor => actor.hiveRecruitedV131 && ACTIVE(actor) && (!actorId || actor.id === actorId));
      if (!this.hiveCanActV131() || !rule || !actors.length || this.hiveV131.possession) return { applied: false, reason: 'order-unavailable' };
      if (!spendHiveChargeV131(this.hiveV131, rule.cost)) return { applied: false, reason: 'charge-empty' };
      for (const actor of actors) { actor.hiveOrderV131 = rule.id; actor.loyaltyV131 = Math.max(0, actor.loyaltyV131 - 1); }
      this.hiveV131.royalInstinct = Math.min(100, this.hiveV131.royalInstinct + rule.cost * 0.8);
      this.onEvent?.({ type: 'hive-order-v131', order: orderId, actors: actors.map(actor => actor.id) });
      return { applied: true, reason: 'order-issued' };
    }

    possessHiveActorV131(actorId = this.hiveV131?.selectedRecruit) {
      const actor = this.hiveActorsV131.find(candidate => candidate.id === actorId);
      if (!this.hiveCanActV131() || !this.hiveV131.commissioned || !actor?.hiveRecruitedV131 || !ACTIVE(actor)
        || actor.loyaltyV131 < 45 || this.hiveV131.possession || this.player.reloading || this.player.toolUseClock > 0 || this.player.interactionClock > 0)
        return { applied: false, reason: 'possession-unavailable' };
      if (!spendHiveChargeV131(this.hiveV131, 6)) return { applied: false, reason: 'charge-empty' };
      this.hiveV131.possession = { actorId: actor.id }; this.hiveV131.selectedRecruit = actor.id;
      this.player.vx = 0; this.hiveMenuV131 = false;
      this.onEvent?.({ type: 'hive-possession-v131', actorId: actor.id, active: true }); return { applied: true, reason: 'possessed' };
    }
    releaseHivePossessionV131(reason = 'operator') {
      if (!this.hiveV131?.possession) return false;
      const actorId = this.hiveV131.possession.actorId;
      this.hiveV131.possession = null; this.player.vx = 0;
      const actor = this.hiveActorsV131.find(candidate => candidate.id === actorId); if (actor) { actor.vx = 0; actor.hiveJumpHeldV131 = false; actor.climbing = false; }
      this.clearGameplayInput?.(); this.hiveHeldKeysV131.clear();
      this.onEvent?.({ type: 'hive-possession-v131', actorId, active: false, reason }); return true;
    }

    setHiveConsciousnessV131(mode) {
      if (!this.hiveCanActV131() || this.hiveV131.operationId !== 'eloise-uncrowned-queen'
        || !this.hiveV131.commissioned || !HIVE_CONSCIOUSNESSES_V131.includes(mode)) return { applied: false, reason: 'consciousness-unavailable' };
      if (this.hiveV131.consciousness === mode) return { applied: false, reason: 'already-selected' };
      if (!spendHiveChargeV131(this.hiveV131, 3)) return { applied: false, reason: 'charge-empty' };
      this.hiveV131.consciousness = mode; return { applied: true, reason: 'consciousness-selected' };
    }
    decideHiveEndingV131(endingId) {
      const nexus = this.hiveManifestV131.stations.find(station => station.id === 'nexus');
      if (!this.hiveCanActV131() || !near(this.player, nexus) || this.hiveV131.operationId !== 'eloise-uncrowned-queen')
        return { applied: false, reason: 'decision-not-local' };
      const choice = hiveEndingAvailabilityV131(this.hiveV131, this.hiveActorsV131).find(ending => ending.id === endingId);
      if (!choice?.canApply) return { applied: false, reason: choice?.reason || 'unknown-ending' };
      if (endingId === 'crown' && !spendHiveChargeV131(this.hiveV131, 20)) return { applied: false, reason: 'charge-empty' };
      this.hiveV131.ending = endingId;
      this.hiveMilestoneV131(`ending-${endingId}`, choice.description); return { applied: true, reason: 'ending-selected' };
    }

    openHiveCommandV131() {
      if (!this.hiveCanActV131()) return false;
      this.hiveMenuV131 = true; this.onEvent?.({ type: 'hive-control-open-v131', operationId: this.hiveV131.operationId }); return true;
    }
    closeHiveCommandV131() { this.hiveMenuV131 = false; }
    getHiveCommandModelV131() {
      if (!this.isHiveMissionV131()) return null;
      const state = this.hiveV131;
      const canAct = this.hiveCanActV131(), commissioned = state.commissioned;
      const reason = !canAct ? 'Interface indisponible : mission active, opérateur libre et vivant requis.'
        : !commissioned ? 'Initialiser le pupitre d’entrée.' : '';
      const available = (cost, specific = '') => specific || reason || (state.charge < cost ? 'Charge insuffisante.' : '');
      return { schema: 131, title: HIVE_CAMPAIGNS_V131.find(campaign => campaign.specialOperationId === state.operationId)?.name,
        operationId: state.operationId, canAct, reason,
        ...hiveDossierV131(state), charge: state.charge, choir: state.choir, pain: state.pain, dissonance: state.dissonance,
        phaseLabel: HIVE_PHASE_LABELS_V131[hivePhaseV131(state)], profileLabel: HIVE_PROFILES_V131.find(profile => profile.id === state.profile)?.label,
        consciousnessLabel: ({ human: 'Humaine', hybrid: 'Hybride', hive: 'Ruche' })[state.consciousness],
        segments: { ...state.segments }, profile: state.profile, consciousness: state.consciousness,
        possessedId: state.possession?.actorId || null, selectedRecruit: state.selectedRecruit,
        canRelease: canAct && Boolean(state.possession), releaseReason: !canAct ? reason : state.possession ? '' : 'Aucune caste contrôlée.',
        profiles: HIVE_PROFILES_V131.map(profile => { const why = available(profile.cost,
          state.operationId !== 'jeri-false-son' ? 'Profils réservés à Jeri.' : profile.id === state.profile ? 'Profil déjà actif.' : '');
          return { ...profile, canApply: !why, reason: why }; }),
        orders: HIVE_ORDERS_V131.map(order => { const why = available(order.cost,
          !this.hiveActorsV131.some(actor => actor.hiveRecruitedV131 && ACTIVE(actor)) ? 'Une recrue vivante est requise.'
            : state.possession ? 'Revenir au corps d’origine avant un ordre collectif.' : ''); return { ...order, canApply: !why, reason: why }; }),
        consciousnesses: HIVE_CONSCIOUSNESSES_V131.map((id, index) => { const why = available(3,
          state.operationId !== 'eloise-uncrowned-queen' ? 'Consciences réservées à Éloïse.' : id === state.consciousness ? 'Conscience déjà active.' : '');
          return { id, label: ['Humaine', 'Hybride', 'Ruche'][index], cost: 3, canApply: !why, reason: why }; }),
        recruits: this.hiveActorsV131.map(actor => ({ id: actor.id, label: actor.hiveLabelV131 || actor.name,
          health: actor.health, alive: actor.alive, loyalty: actor.loyaltyV131, recruited: actor.hiveRecruitedV131,
          order: actor.hiveOrderV131,
          canRecruit: !available(12, actor.hiveRecruitedV131 ? 'Caste déjà recrutée.' : !ACTIVE(actor) || actor.hiveLostV131 ? 'Caste perdue.'
            : Math.hypot(center(actor) - center(this.player), feet(actor) - feet(this.player)) > 110 || !this.hiveContactClearV131(this.player, actor) ? 'Rejoindre la caste sans obstacle.' : ''),
          recruitReason: available(12, actor.hiveRecruitedV131 ? 'Caste déjà recrutée.' : !ACTIVE(actor) || actor.hiveLostV131 ? 'Caste perdue.'
            : Math.hypot(center(actor) - center(this.player), feet(actor) - feet(this.player)) > 110 || !this.hiveContactClearV131(this.player, actor) ? 'Rejoindre la caste sans obstacle.' : ''),
          canSelect: canAct && actor.hiveRecruitedV131 && ACTIVE(actor), selectReason: !canAct ? reason : !actor.hiveRecruitedV131 || !ACTIVE(actor) ? 'Recrue vivante requise.' : '',
          canPossess: !available(6, !actor.hiveRecruitedV131 || !ACTIVE(actor) ? 'Recrue vivante requise.' : actor.loyaltyV131 < 45 ? 'Loyauté ≥45 requise.'
            : state.possession ? 'Un contrôle est déjà actif.' : this.player.reloading || this.player.toolUseClock > 0 || this.player.interactionClock > 0 ? 'Terminer l’action corporelle en cours.' : ''),
          possessReason: available(6, !actor.hiveRecruitedV131 || !ACTIVE(actor) ? 'Recrue vivante requise.' : actor.loyaltyV131 < 45 ? 'Loyauté ≥45 requise.'
            : state.possession ? 'Un contrôle est déjà actif.' : this.player.reloading || this.player.toolUseClock > 0 || this.player.interactionClock > 0 ? 'Terminer l’action corporelle en cours.' : '') })),
        endings: hiveEndingAvailabilityV131(state, this.hiveActorsV131).map(ending => {
          const why = ending.reason || reason || (!near(this.player, this.hiveManifestV131.stations.find(station => station.id === 'nexus')) ? 'Rejoindre le nexus.' : '');
          return { ...ending, canApply: !why, reason: why }; }), pylons: [...state.pylons], arteries: [...state.arteries],
        artDebt: [...this.hiveManifestV131.artDebt], representation: this.hiveIdentityV131.representation,
        notice: 'Adaptation originale Tantalus. Avatar sélectionné conservé ; planches dédiées et plusieurs castes historiques manquantes.' };
    }
    performHiveActionV131(actionId, value) {
      if (!this.hiveCanActV131()) return { applied: false, reason: 'interface-unavailable' };
      if (actionId === 'profile') return selectHiveProfileV131(this.hiveV131, value);
      if (actionId === 'order') return this.issueHiveOrderV131(value);
      if (actionId === 'recruit') return this.recruitHiveActorV131(value);
      if (actionId === 'possess') return this.possessHiveActorV131(value);
      if (actionId === 'release') return { applied: this.releaseHivePossessionV131('operator') };
      if (actionId === 'consciousness') return this.setHiveConsciousnessV131(value);
      if (actionId === 'ending') return this.decideHiveEndingV131(value);
      if (actionId === 'select-recruit' && this.hiveCanActV131() && this.hiveV131.recruitedIds.includes(value)) {
        this.hiveV131.selectedRecruit = value; return { applied: true };
      }
      return { applied: false, reason: 'unknown-action' };
    }

    updateHiveInputV131() {
      if (!this.hiveCanActV131()) { this.hiveHeldKeysV131 = new Set(this.keys); return; }
      const pressed = code => this.keys.has(code) && !this.hiveHeldKeysV131.has(code);
      if (pressed('KeyC')) this.openHiveCommandV131();
      if (pressed('KeyB')) this.hiveV131.possession ? this.releaseHivePossessionV131('operator') : this.possessHiveActorV131();
      if (pressed('KeyN')) {
        const ids = this.hiveActorsV131.filter(actor => actor.hiveRecruitedV131 && ACTIVE(actor)).map(actor => actor.id);
        if (ids.length) this.hiveV131.selectedRecruit = ids[(ids.indexOf(this.hiveV131.selectedRecruit) + 1) % ids.length];
      }
      if (this.hiveV131.commissioned) {
        for (let i = 0; i < 5; i++) if (pressed(`Digit${i + 1}`)) {
          if (this.hiveV131.operationId === 'jeri-false-son') selectHiveProfileV131(this.hiveV131, HIVE_PROFILES_V131[i].id);
          else if (this.hiveV131.operationId === 'atax-false-queen' && HIVE_ORDERS_V131[i]) this.issueHiveOrderV131(HIVE_ORDERS_V131[i].id);
          else if (i < 3) this.setHiveConsciousnessV131(HIVE_CONSCIOUSNESSES_V131[i]);
          else if (i === 4) {
            const pylon = this.hiveManifestV131.stations.find(station => station.id.startsWith('pylon-') && near(this.player, station));
            if (pylon) this.beginHiveChannelV131(pylon, `${pylon.id}:sever`);
          }
        }
        for (let i = 0; i < 4; i++) if (pressed(`Digit${i + 6}`)) this.decideHiveEndingV131(HIVE_ENDINGS_V131[i].id);
      }
      this.hiveHeldKeysV131 = new Set(this.keys);
    }

    completeHiveChannelV131(action) {
      const state = this.hiveV131;
      if (action === 'commission') state.commissioned = true;
      else if (action === 'rescue' && !state.rescued) { state.rescued = true; state.implanted = false; state.bossReleased = true; }
      else if (action === 'hush') state.hushSaved = true;
      else if (action === 'boss-relay' && state.bossShielded) {
        if (!spendHiveChargeV131(state, 4)) return false;
        state.bossShielded = false;
      } else if (action.startsWith('artery-') && !state.arteries.includes(action)) {
        if (!spendHiveChargeV131(state, 4)) return false;
        state.arteries.push(action); if (state.arteries.length === 3) state.bossReleased = true;
      } else if (action.startsWith('pylon-')) {
        const [id, mode] = action.split(':'), index = Number(id.at(-1));
        if (state.pylons[index] !== 'sealed') return false;
        if (mode !== 'sever' && !spendHiveChargeV131(state, 8)) return false;
        state.pylons[index] = mode === 'sever' ? 'severed' : 'attuned';
        state.choir = clamp(state.choir + (mode === 'sever' ? -7 : 24), 0, 100);
        state.pain = clamp(state.pain + (mode === 'sever' ? 16 : 7), 0, 100);
        if (!state.pylons.includes('sealed')) state.bossReleased = true;
      } else if (action === 'extraction') { state.exitProgress = 2; return this.completeMission(this.player); }
      else return false;
      this.hiveMilestoneV131(action, action.startsWith('pylon-') ? 'Le pylône modifie les ponts, obstacles et menaces de la carte.' : 'Étape validée et checkpoint enregistré.');
      return true;
    }

    updateHiveChannelV131(delta) {
      const state = this.hiveV131; if (!state.channel) return;
      const station = this.hiveManifestV131.stations.find(candidate => candidate.id === state.channel.split(':')[0]);
      const held = this.keys.has('KeyE') || state.channel.endsWith(':sever') && this.keys.has('Digit5');
      if (!held || this.isJeriSurfaceAttachedV135() || !near(this.player, station) || this.hiveV131.possession || !this.hiveCanActV131()) {
        state.channel = null; state.channelProgress = 0; return;
      }
      state.channelProgress = Math.min(station.duration || 3, state.channelProgress + delta);
      if (state.channelProgress >= (station.duration || 3)) {
        const action = state.channel; state.channel = null; state.channelProgress = 0; this.completeHiveChannelV131(action);
      }
    }

    updatePlayer(actor, delta, controls) {
      if (!this.isHiveMissionV131() || actor !== this.player) return super.updatePlayer(actor, delta, controls);
      if (!this.hiveV131.possession) {
        const originalCostume = this.costumeRuntime;
        const mobility = this.hiveV131.operationId === 'jeri-false-son' && this.hiveV131.segments.legs < 35
          ? 0.55 + this.hiveV131.segments.legs / 35 * 0.45 : 1;
        if (this.hiveV131.operationId === 'jeri-false-son' && this.updateJeriSurfacePlayerV135(actor, delta, controls, mobility)) return;
        if (mobility < 1) this.costumeRuntime = { ...originalCostume, mobility: (originalCostume?.mobility || 1) * mobility };
        try { return super.updatePlayer(actor, delta, controls); } finally { this.costumeRuntime = originalCostume; }
      }
      const controlled = this.hiveControlledActorV131();
      if (!controlled || !ACTIVE(actor)) { this.releaseHivePossessionV131('body-unavailable'); return super.updatePlayer(actor, delta, controls); }
      this.moveHiveControlledActorV131(controlled, delta, controls);
      actor.jumpBuffer = 0;
      const keys = this.keys; this.keys = new Set();
      try { return super.updatePlayer(actor, delta, controls); } finally { this.keys = keys; }
    }
    moveHiveControlledActorV131(actor, delta, controls) {
      const previous = { x: actor.x, y: actor.y }, dt = Math.max(0, delta), held = code => this.keys.has(code);
      const horizontal = Number(held(controls.right) || held('ArrowRight')) - Number(held(controls.left) || held('ArrowLeft'));
      const vertical = Number(held(controls.down) || held('ArrowDown')) - Number(held(controls.up) || held('ArrowUp'));
      const ladder = this.nearestLadder(actor, vertical);
      actor.vx = horizontal * 225; actor.facing = horizontal || actor.facing;
      if (ladder && vertical) {
        actor.climbing = true; actor.vx = 0; actor.vy = vertical * 180;
        actor.x += (ladder.x - actor.w / 2 - actor.x) * -Math.expm1(-dt * 12);
        actor.y = clamp(actor.y + actor.vy * dt, ladder.top - actor.h, ladder.bottom - actor.h); actor.grounded = false;
      } else {
        actor.climbing = false;
        const jump = held(controls.jump);
        if (jump && !actor.hiveJumpHeldV131 && actor.grounded) { actor.vy = -560; actor.grounded = false; }
        actor.hiveJumpHeldV131 = jump;
        const bottom = feet(actor); actor.y += actor.vy * dt + 950 * dt * dt; actor.vy += 1900 * dt;
        actor.grounded = false; this.resolveVertical(actor, bottom);
        actor.x = clamp(actor.x + actor.vx * dt, 0, this.missionLevelBounds.width - actor.w); this.resolveEnemyHorizontal(actor, previous.x);
      }
      if ([...this.walls, ...this.closedDoorColliders()].some(obstacle => !obstacle.destroyed && overlap(actor, obstacle))) {
        actor.x = previous.x; actor.y = previous.y; actor.vx = actor.vy = 0;
      }
      actor.hiveAttackClockV131 = Math.max(0, actor.hiveAttackClockV131 - dt);
      if (held(controls.fire)) this.hiveAttackV131(actor);
      if (actor.y > this.missionLevelBounds.voidY) { actor.alive = false; actor.health = 0; actor.hiveLostV131 = true; this.releaseHivePossessionV131('fall'); }
    }
    hiveAttackV131(actor) {
      if (!this.hiveCanActV131() || !this.hiveV131.commissioned || !this.hiveActorsV131.includes(actor)
        || !actor.hiveRecruitedV131 || !ACTIVE(actor) || actor.hiveAttackClockV131 > 0) return false;
      const target = this.enemies.filter(enemy => enemy.alive && !enemy.dormant && Math.abs(feet(enemy) - feet(actor)) < 90
        && Math.abs(center(enemy) - center(actor)) < (enemy.w + actor.w) / 2 + 65 && this.hiveContactClearV131(actor, enemy))
        .sort((a, b) => Math.abs(center(a) - center(actor)) - Math.abs(center(b) - center(actor)))[0];
      if (!target || !spendHiveChargeV131(this.hiveV131, 1.5)) return false;
      actor.hiveAttackClockV131 = 0.65; actor.attacking = true; actor.facing = Math.sign(center(target) - center(actor)) || actor.facing;
      this.applyEnemyDamage(target, actor.hiveOrderV131 === 'claw' ? 32 : 24, { owner: this.player, kind: 'hive-claw', sourceX: center(actor), sourceY: actor.y + actor.h / 2 });
      this.onEvent?.({ type: 'hive-attack-v131', actorId: actor.id, targetId: target.id }); return true;
    }
    fire(actor = this.player) {
      if (this.isHiveMissionV131() && actor === this.player && this.hiveV131.possession) return this.hiveAttackV131(this.hiveControlledActorV131());
      return super.fire(actor);
    }
    melee(actor = this.player) {
      if (this.isHiveMissionV131() && actor === this.player && this.hiveV131.possession) return this.hiveAttackV131(this.hiveControlledActorV131());
      return super.melee(actor);
    }

    updateHiveAlliesV131(delta) {
      const controlled = this.hiveControlledActorV131(), state = this.hiveV131;
      for (const actor of this.hiveActorsV131.filter(candidate => candidate.hiveRecruitedV131 && ACTIVE(candidate))) {
        const previousPosition = { x: actor.x, y: actor.y };
        actor.hiveAttackClockV131 = Math.max(0, actor.hiveAttackClockV131 - delta);
        actor.attacking = actor.hiveAttackClockV131 > 0.4;
        actor.loyaltyV131 = Math.max(0, actor.loyaltyV131 - (state.charge <= 0 ? 2 : state.royalInstinct > 75 ? 0.7 : 0) * delta);
        if (actor.loyaltyV131 <= 0) { actor.hiveLostV131 = true; actor.hiveRecruitedV131 = false;
          if (state.possession?.actorId === actor.id) this.releaseHivePossessionV131('loyalty-broken'); continue; }
        if (actor === controlled) continue;
        if (!actor.grounded && actor.levelNavigation?.mode !== 'ladder') {
          const previousBottom = feet(actor); actor.y += actor.vy * delta + 950 * delta * delta; actor.vy += 1900 * delta;
          this.resolveVertical(actor, previousBottom);
          if (!actor.grounded) continue;
        }
        const station = this.hiveManifestV131.stations.find(candidate => candidate.order === actor.hiveOrderV131);
        const target = station ? { x: station.x - 25, y: station.floorY - 92, w: 50, h: 92 } : this.player;
        const ownSurface = this.missionLevelSurfaceFor(actor, { tolerance: 20 }), targetSurface = this.missionLevelSurfaceFor(target, { tolerance: 20 });
        const navigating = this.advanceEnemyMissionNavigation(actor, target, ownSurface, targetSurface, delta);
        if (!navigating) {
          const desired = target.x - (station ? 0 : 95 + this.hiveActorsV131.indexOf(actor) * 70);
          this.moveEnemyOnMissionSurface(actor, desired, delta, actor.hiveOrderV131 === 'shadow' ? 0.9 : 1);
          if (actor.hiveOrderV131 === 'claw' || actor.hiveOrderV131 === 'follow') this.hiveAttackV131(actor);
        }
        actor.vx = delta > 0 ? (actor.x - previousPosition.x) / delta : 0;
        actor.vy = delta > 0 ? (actor.y - previousPosition.y) / delta : 0;
        actor.alert = Math.abs(actor.vx) > 2;
      }
    }

    releaseHiveThreatV131(id) {
      if (this.hiveV131.threats.includes(id)) return false;
      this.hiveV131.threats.push(id);
      for (const enemy of this.enemies.filter(candidate => !candidate.isBoss && candidate.alive)) { enemy.alert = true; enemy.revealed = 1; }
      this.onEvent?.({ type: 'hive-alarm-v131', inspectionId: id }); return true;
    }
    applyEnemyDamage(enemy, amount, projectile) {
      if (!this.isHiveMissionV131() || enemy?.id !== 'hive-boss') {
        if (this.isHiveMissionV131() && this.hiveV131.operationId === 'eloise-uncrowned-queen'
          && this.hiveV131.consciousness === 'hive' && enemy?.alive) {
          this.hiveV131.pain = clamp(this.hiveV131.pain + 5, 0, 100); enemy.hiveProvokedV131 = 3;
        }
        return super.applyEnemyDamage(enemy, amount, projectile);
      }
      const state = this.hiveV131;
      if (!state.bossReleased || state.bossShielded || state.bossDefeated) return false;
      const threshold = enemy.maxHealth * (2 - state.bossPhase) / 3;
      const allowed = state.bossPhase < 2 ? Math.min(amount, Math.max(0, enemy.health - threshold)) : amount;
      if (!(allowed > 0)) return false;
      const result = super.applyEnemyDamage(enemy, allowed, projectile);
      if (state.bossPhase < 2 && enemy.health <= threshold + 0.01) {
        state.bossPhase++; state.bossShielded = true; this.releaseHiveThreatV131(`boss-wave-${state.bossPhase}`);
        this.hiveMilestoneV131(`boss-phase-${state.bossPhase}`, 'Segment protégé. Maintenir E au relais pour l’exposer.');
      }
      if (!enemy.alive && !state.bossDefeated) {
        state.bossDefeated = true; state.killedIds.push(enemy.id);
        this.hiveMilestoneV131('boss-defeated', 'La menace de la chambre est neutralisée.');
      }
      return result;
    }
    defeatEnemy(enemy, owner = this.player) {
      if (!this.isHiveMissionV131() || !this.hiveManifestV131?.enemyIds.includes(enemy?.id)) return super.defeatEnemy(enemy, owner);
      if (!enemy.alive) return;
      if (!this.hiveV131.killedIds.includes(enemy.id)) this.hiveV131.killedIds.push(enemy.id);
      if (enemy.id === 'hive-boss') {
        this.hiveV131.bossDefeated = true; this.hiveV131.bossShielded = false;
        this.hiveV131.phase = hivePhaseV131(this.hiveV131);
      }
      const result = super.defeatEnemy(enemy, owner);
      if (enemy.id === 'hive-boss') this.hiveMilestoneV131('boss-defeated', 'La menace de la chambre est neutralisée.');
      return result;
    }
    updateEnemy(enemy, delta) {
      if (!this.isHiveMissionV131()) return super.updateEnemy(enemy, delta);
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88 || this.mission?.state !== 'active') return;
      const dt = Math.max(0, Math.min(0.1, Number(delta) || 0));
      if (!enemy?.alive || enemy.dormant) return super.updateEnemy(enemy, dt);
      enemy.hiveProvokedV131 = Math.max(0, (enemy.hiveProvokedV131 || 0) - dt);
      if (this.hiveV131.operationId === 'eloise-uncrowned-queen' && this.hiveV131.consciousness === 'hive'
        && this.hiveV131.choir >= 45 && !enemy.isBoss && enemy.hiveProvokedV131 <= 0) {
        this.cancelPendingEnemyMeleeV64?.(enemy, 'hive-veil');
        enemy.attacking = false; enemy.alert = false; enemy.vx = 0; return;
      }
      const target = this.hiveActorsV131.filter(actor => actor.hiveRecruitedV131 && ACTIVE(actor)
        && Math.abs(feet(actor) - feet(enemy)) < 75 && Math.abs(center(actor) - center(enemy)) < (actor.w + enemy.w) / 2 + 65
        && Math.abs(center(actor) - center(enemy)) < Math.abs(center(this.player) - center(enemy))
        && this.hiveContactClearV131(enemy, actor))
        .sort((a, b) => Math.abs(center(a) - center(enemy)) - Math.abs(center(b) - center(enemy)))[0];
      if (!target) { enemy.hiveStrikeV131 = null; return super.updateEnemy(enemy, dt); }
      let strike = enemy.hiveStrikeV131;
      if (!strike || strike.targetId !== target.id) strike = enemy.hiveStrikeV131 = { targetId: target.id, elapsed: 0, impact: false };
      strike.elapsed = Math.min(1.1, strike.elapsed + dt); enemy.attacking = true; enemy.vx = 0;
      enemy.facing = Math.sign(center(target) - center(enemy)) || enemy.facing;
      if (!strike.impact && strike.elapsed >= 0.45) {
        strike.impact = true;
        target.health = Math.max(0, target.health - clamp(Number(enemy.damage) || 12, 8, 32));
        this.spawnImpact(center(target), target.y + target.h / 2, '#a5c56e');
        this.onEvent?.({ type: 'hive-ally-hit-v131', actorId: target.id, enemyId: enemy.id, health: target.health });
        if (target.health <= 0) {
          target.alive = false; target.hiveLostV131 = true; target.hiveRecruitedV131 = false;
          if (this.hiveV131.possession?.actorId === target.id) this.releaseHivePossessionV131('caste-killed');
        }
      }
      if (strike.elapsed >= 1.1) { enemy.hiveStrikeV131 = null; enemy.attacking = false; }
    }
    damagePlayer(actor, amount, options = {}) {
      if (!this.isHiveMissionV131() || actor !== this.player || !Number.isFinite(amount) || amount <= 0) return super.damagePlayer(actor, amount, options);
      const state = this.hiveV131;
      const hitY = Number.isFinite(options.hitY) ? options.hitY : Number.isFinite(options.sourceY) ? options.sourceY : actor.y + actor.h * 0.5;
      const relative = (hitY - actor.y) / actor.h;
      const segment = relative < 0.3 ? 'head' : relative > 0.72 ? 'legs' : 'torso';
      const absorbed = Math.min(state.segments[segment], amount * (state.operationId === 'eloise-uncrowned-queen'
        ? state.consciousness === 'hybrid' ? 0.15 : 0 : 0.25));
      state.segments[segment] = Math.max(0, state.segments[segment] - amount * 0.7);
      state.dissonance = clamp(state.dissonance + amount * 0.16, 0, 100);
      if (state.operationId === 'eloise-uncrowned-queen') state.pain = clamp(state.pain + amount * (state.consciousness === 'hive' ? 0.7 : state.consciousness === 'hybrid' ? 0.25 : 0.35), 0, 100);
      const result = super.damagePlayer(actor, amount - absorbed, options);
      if (!ACTIVE(actor)) this.releaseHivePossessionV131('operator-injured');
      if (state.operationId === 'jeri-false-son' && state.segments.head <= 0) this.failMission('JERI : noyau synthétique rompu.');
      return result;
    }

    update(delta) {
      if (!this.isHiveMissionV131()) return super.update(delta);
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88 || this.mission?.state !== 'active') return;
      if (!ACTIVE(this.player)) { this.failMission('Interface principale neutralisée.'); return; }
      const seconds = Number(delta); if (!Number.isFinite(seconds) || seconds <= 0) return;
      const dt = Math.min(0.1, seconds), state = this.hiveV131;
      const cameraBefore = { ...this.camera };
      this.updateHiveInputV131(); this.updateHiveChannelV131(dt);
      if (this.mission.state !== 'active') return;
      super.update(dt);
      if (this.mission.state !== 'active') return;
      if (state.possession) {
        const controlled = this.hiveControlledActorV131();
        if (!controlled || !spendHiveChargeV131(state, dt * 2)) this.releaseHivePossessionV131('charge-or-body-lost');
      }
      this.updateHiveAlliesV131(dt);
      if (state.operationId === 'jeri-false-son' && state.commissioned) {
        state.dissonance = Math.max(0, state.dissonance - (state.profile === 'worker' ? 0.5 : 0.12) * dt);
        if (!state.rescued) {
          state.implantClock = Math.min(150, state.implantClock + dt);
          if (state.implantClock >= 150) { state.implanted = true; state.survivorHealth = 0; this.failMission('Directive humaine rompue : implantation du captif.'); }
        }
        if (state.dissonance >= 100) this.failMission('Dissonance maximale : couverture synthétique perdue.');
      }
      if (state.operationId === 'eloise-uncrowned-queen' && state.consciousness === 'hive') {
        if (!spendHiveChargeV131(state, dt * 0.2)) state.consciousness = 'human';
        state.pain = clamp(state.pain + (state.bossReleased && !state.bossDefeated ? 0.22 : 0.04) * dt, 0, 100);
        for (const enemy of this.enemies.filter(enemy => !enemy.isBoss && enemy.alive)) enemy.revealed = Math.max(enemy.revealed, 0.3);
      }
      if (state.operationId === 'eloise-uncrowned-queen' && state.consciousness === 'human') state.pain = Math.max(0, state.pain - dt * 0.18);
      if (state.pain >= 100) this.failMission('Le Chœur submerge l’interface.');
      if (state.operationId === 'atax-false-queen' && state.recruitedIds.length >= 2
        && !this.hiveActorsV131.some(actor => actor.hiveRecruitedV131 && ACTIVE(actor))) this.failMission('Meute perdue : aucune caste loyale ne peut porter l’assaut.');
      this.syncHiveMissionV131();
      const focus = this.hiveControlledActorV131() || this.player;
      this.camera.x = cameraBefore.x + (clamp(focus.x - 430, 0, this.missionLevelBounds.width - 1280) - cameraBefore.x) * -Math.expm1(-dt * 5.2);
      this.camera.y = cameraBefore.y + (clamp(focus.y + focus.h / 2 - 360 + (focus.vy || 0) * 0.06,
        -200, this.missionLevelBounds.height - 720) - cameraBefore.y) * -Math.expm1(-dt * 4.4);
    }

    updateMissionPhase() { if (!this.isHiveMissionV131()) return super.updateMissionPhase(); this.syncHiveMissionV131(); }
    updateObjectiveRuntime(delta) { if (!this.isHiveMissionV131()) return super.updateObjectiveRuntime(delta); }
    doorRequirement(door) { return this.isHiveMissionV131() && door?.lockedBy === 'hive' ? 'PROGRESSION DE RUCHE REQUISE' : super.doorRequirement(door); }
    getDoorRenderState(door, options) {
      const art = super.getDoorRenderState(door, options);
      return this.isHiveMissionV131() && String(door?.id).startsWith('hive-gate-')
        ? { ...art, x: door.x, y: door.y, w: door.w, h: door.h } : art;
    }
    drawDoor(ctx, door) {
      if (!this.isHiveMissionV131() || !String(door?.id).startsWith('hive-gate-')) return super.drawDoor(ctx, door);
      const art = this.getDoorRenderState(door), crop = art.source;
      ctx.save(); ctx.globalAlpha = door.open ? 0.25 : 1;
      if (art.image?.complete && art.image.naturalWidth > 0) {
        for (let y = door.y; y < door.y + door.h; y += 130) ctx.drawImage(art.image, crop.x, crop.y, crop.w, crop.h,
          door.x, y, door.w, Math.min(130, door.y + door.h - y));
      } else { ctx.fillStyle = '#36505a'; ctx.fillRect(door.x, door.y, door.w, door.h); }
      ctx.restore();
    }
    missingHiveExtractionV131({ ignoreHold = false } = {}) {
      const state = this.hiveV131;
      if (this.isJeriSurfaceAttachedV135()) return 'SE DÉTACHER AVANT L’EXTRACTION';
      if (!state?.bossDefeated) return 'MENACE DE LA CHAMBRE ENCORE ACTIVE';
      if (state.operationId === 'jeri-false-son' && !state.finalInspection) return 'INSPECTION ROYALE REQUISE';
      if (state.operationId === 'atax-false-queen' && state.arteries.length !== 3) return 'TROIS ARTÈRES REQUISES';
      if (state.operationId === 'eloise-uncrowned-queen' && !state.ending) return 'CONCLUSION AU NEXUS REQUISE';
      if (!ignoreHold && (state.exitProgress !== 2 || !near(this.player, this.hiveManifestV131.stations.find(station => station.id === 'extraction')))) return 'MAINTENIR E À LA BALISE 2 S';
      return '';
    }
    missingExtractionRequirement() { return this.isHiveMissionV131() ? this.missingHiveExtractionV131() : super.missingExtractionRequirement(); }
    missingObjectiveRequirement(options) { return this.isHiveMissionV131() ? this.missingHiveExtractionV131(options) : super.missingObjectiveRequirement(options); }
    completeMission(actor = this.player) {
      if (!this.isHiveMissionV131()) return super.completeMission(actor);
      if (!this.hiveCanActV131(actor) || this.hiveV131.complete || this.missingHiveExtractionV131()) return false;
      const state = this.hiveV131;
      this.releaseHivePossessionV131('mission-complete');
      const before = { complete: state.complete, rewardClaimed: state.rewardClaimed, rewards: state.rewards };
      const kills = this.player.kills + this.coop.kills;
      state.complete = true; state.rewardClaimed = true; state.rewards = {
        credits: 480 + kills * 12 + (this.mission.casualties === 0 ? 120 : 0), salvage: this.inventory.salvage, intel: this.inventory.intel,
        vehicleRecovered: false, noCasualty: this.mission.casualties === 0, retries: this.mission.retries,
        elapsedSeconds: Math.round(this.mission.elapsed),
        operationId: state.operationId, ending: state.ending, rescued: state.rescued, hushSaved: state.hushSaved,
        survivingRecruits: this.hiveActorsV131.filter(actor => actor.hiveRecruitedV131 && ACTIVE(actor)).map(actor => actor.id),
        chargeRemaining: Math.round(state.charge), canonExact: false };
      this.syncHiveMissionV131();
      const sink = this.onEvent;
      this.onEvent = event => {
        if (event.type === 'mission-complete') { this.mission.rewards = clone(state.rewards); sink({ ...event, rewards: clone(state.rewards), operationId: state.operationId }); }
        else sink(event);
      };
      let result;
      try { result = super.completeMission(actor); } finally { this.onEvent = sink; }
      if (!result) { Object.assign(state, before); this.syncHiveMissionV131(); }
      else this.mission.rewards = clone(state.rewards);
      return result;
    }
    failMission(reason) {
      if (this.isHiveMissionV131() && this.hiveV131 && this.mission?.state === 'active') {
        this.hiveV131.failed = true; this.hiveV131.failReason = String(reason).slice(0, 160);
        this.releaseHivePossessionV131('mission-failed');
        if (this.isJeriSurfaceAttachedV135()) this.applyJeriSurfaceMotionV135(releaseJeriSurfaceV135(this.player, this.jeriSurfaceV135)); this.hiveV131.channel = null; this.hiveV131.channelProgress = 0;
      }
      const result = super.failMission(reason); if (this.isHiveMissionV131()) this.syncHiveMissionV131(); return result;
    }

    captureHiveActorsV131() {
      return this.hiveActorsV131.map(actor => ({ id: actor.id, x: actor.x, y: actor.y, health: actor.health, alive: actor.alive,
        loyalty: actor.loyaltyV131, recruited: actor.hiveRecruitedV131, lost: actor.hiveLostV131, order: actor.hiveOrderV131,
        attackClock: actor.hiveAttackClockV131, vx: actor.vx || 0, vy: actor.vy || 0, grounded: Boolean(actor.grounded),
        climbing: Boolean(actor.climbing), navigation: clone(actor.levelNavigation || { mode: 'surface' }) }));
    }
    captureResumeState() {
      const base = super.captureResumeState(); if (!this.isHiveMissionV131()) return base;
      return { ...base, hiveMissionV131: { schema: 131, signature: this.missionLevelRuntime.signature,
        state: clone(this.hiveV131), jeriSurfaceV135: clone(this.jeriSurfaceV135), actors: this.captureHiveActorsV131(),
        combat: this.enemies.map(enemy => ({ id: enemy.id, provoked: enemy.hiveProvokedV131 || 0, strike: enemy.hiveStrikeV131 ? clone(enemy.hiveStrikeV131) : null })),
        checkpoint: this.hiveCheckpointV131 ? clone(this.hiveCheckpointV131) : null } };
    }
    captureHiveCheckpointV131() {
      const state = this.captureResumeState(); if (state.hiveMissionV131) state.hiveMissionV131.checkpoint = null; return clone(state);
    }
    validateHiveResumeV131(raw) {
      const own = raw?.hiveMissionV131, check = validateHiveControlV131(own?.state, this.hiveManifestV131);
      if (!check.valid) return check;
      const sameIdentity = raw.identity && ['seed', 'campaignId', 'worldId', 'levelSeedId', 'objectiveId', 'editorProjectKind']
        .every(key => raw.identity[key] === this.resumeIdentity?.[key]);
      const actors = list(own.actors), ids = this.hiveManifestV131.recruitIds;
      if (!sameIdentity || own.schema !== 131 || own.signature !== this.missionLevelRuntime.signature
        || raw.missionLevel?.signature !== own.signature || check.state.operationId !== this.hiveManifestV131.operationId
        || raw.schema !== 1 || actors.length !== ids.length || actors.length !== new Set(actors.map(actor => actor.id)).size
        || actors.some(actor => !ids.includes(actor.id) || !Number.isFinite(actor.x) || !Number.isFinite(actor.y)
          || actor.x < 0 || actor.x > this.missionLevelBounds.width || actor.y < -200 || actor.y > this.missionLevelBounds.voidY
          || !Number.isFinite(actor.health) || actor.health < 0 || actor.health > 70 || !Number.isFinite(actor.loyalty) || actor.loyalty < 0 || actor.loyalty > 100
          || !HIVE_ORDERS_V131.some(order => order.id === actor.order) || typeof actor.alive !== 'boolean'
          || typeof actor.recruited !== 'boolean' || typeof actor.lost !== 'boolean' || !Number.isFinite(actor.attackClock) || actor.attackClock < 0 || actor.attackClock > 0.65
          || !Number.isFinite(actor.vx) || Math.abs(actor.vx) > 1000 || !Number.isFinite(actor.vy) || Math.abs(actor.vy) > 3000
          || typeof actor.grounded !== 'boolean' || typeof actor.climbing !== 'boolean'
          || !actor.navigation || !['surface', 'ladder', 'lift'].includes(actor.navigation.mode)
          || actor.recruited !== (check.state.recruitedIds.includes(actor.id) && !actor.lost))
        || !Array.isArray(own.combat) || own.combat.length !== this.hiveManifestV131.enemyIds.length
        || new Set(own.combat.map(enemy => enemy.id)).size !== own.combat.length
        || own.combat.some(enemy => !this.hiveManifestV131.enemyIds.includes(enemy.id) || !Number.isFinite(enemy.provoked)
          || enemy.provoked < 0 || enemy.provoked > 3 || enemy.strike !== null && (!ids.includes(enemy.strike?.targetId)
            || !Number.isFinite(enemy.strike.elapsed) || enemy.strike.elapsed < 0 || enemy.strike.elapsed > 1.1
            || typeof enemy.strike.impact !== 'boolean' || enemy.strike.impact !== (enemy.strike.elapsed >= 0.45)))
        || !Array.isArray(raw.enemies) || raw.enemies.length !== this.hiveManifestV131.enemyIds.length
        || new Set(raw.enemies.map(enemy => enemy.id)).size !== raw.enemies.length
        || raw.enemies.some(enemy => !this.hiveManifestV131.enemyIds.includes(enemy.id))
        || (raw.mission?.state === 'complete') !== check.state.complete || (raw.mission?.state === 'failed') !== check.state.failed
        || check.state.complete && (raw.player?.alive !== true || raw.player?.downed !== false)
        || check.state.possession && !actors.some(actor => actor.id === check.state.possession.actorId && actor.alive && actor.recruited && actor.loyalty >= 45))
        return { valid: false, reason: 'hive-resume-inconsistent' };
      if (check.state.operationId === 'jeri-false-son') {
        const surface = validateJeriSurfaceStateV135(own.jeriSurfaceV135, { ...raw.player, w: this.player.w, h: this.player.h }, this.jeriSurfaceSceneV135(check.state),
          { terminal: check.state.complete || check.state.failed });
        if (!surface.valid || surface.state.mode === 'attached' && (raw.player?.alive !== true || raw.player?.downed !== false || check.state.segments.legs <= 0 || check.state.segments.head <= 0 || check.state.possession))
          return { valid: false, reason: surface.reason || 'jeri-surface-body-v135' };
        check.jeriSurfaceV135 = surface.state;
      } else if (own.jeriSurfaceV135?.mode === 'attached') return { valid: false, reason: 'jeri-surface-operation-v135' };
      return check;
    }
    applyResumeState(raw) {
      if (!this.isHiveMissionV131()) return super.applyResumeState(raw);
      const checked = this.validateHiveResumeV131(raw); if (!checked.valid) return { applied: false, restored: 0, reason: checked.reason };
      const previous = this.hiveV131; this.hiveV131 = checked.state;
      const result = super.applyResumeState(raw); if (!result?.applied) { this.hiveV131 = previous; return result; }
      for (const saved of raw.hiveMissionV131.actors) {
        const actor = this.hiveActorsV131.find(candidate => candidate.id === saved.id);
        Object.assign(actor, { x: saved.x, y: saved.y, health: saved.health, alive: saved.alive,
          loyaltyV131: saved.loyalty, hiveRecruitedV131: saved.recruited, hiveLostV131: saved.lost,
          hiveOrderV131: saved.order, hiveAttackClockV131: saved.attackClock, vx: saved.vx, vy: saved.vy,
          grounded: saved.grounded, climbing: saved.climbing, levelNavigation: clone(saved.navigation) });
      }
      for (const combat of raw.hiveMissionV131.combat) {
        const enemy = this.enemies.find(candidate => candidate.id === combat.id);
        enemy.hiveProvokedV131 = combat.provoked; enemy.hiveStrikeV131 = combat.strike ? clone(combat.strike) : null;
      }
      this.jeriSurfaceV135 = checked.jeriSurfaceV135 || createJeriSurfaceStateV135();
      if (this.isJeriSurfaceAttachedV135()) this.applyJeriSurfaceMotionV135({ actor: { ...this.player, vx: 0, vy: 0 }, state: this.jeriSurfaceV135 });
      else { this.player.climbing = false; this.player.ladderId = null; }
      const checkpoint = raw.hiveMissionV131.checkpoint;
      if (checkpoint && this.validateHiveResumeV131(checkpoint).valid) this.hiveCheckpointV131 = clone(checkpoint);
      this.hiveHeldKeysV131.clear(); this.hiveMenuV131 = false; this.syncHiveMissionV131(); return { ...result, hiveRestoredV131: true };
    }
    restartFromCheckpoint() {
      if (!this.isHiveMissionV131()) return super.restartFromCheckpoint();
      if (this.mission?.state !== 'failed' || !this.hiveCheckpointV131) return false;
      const raw = clone(this.hiveCheckpointV131); raw.mission.state = 'active'; raw.mission.failureReason = null;
      raw.mission.retries = this.mission.retries + 1; raw.hiveMissionV131.state.failed = false;
      raw.hiveMissionV131.state.failReason = null; raw.hiveMissionV131.state.phase = hivePhaseV131(raw.hiveMissionV131.state);
      const result = this.applyResumeState(raw); if (result.applied) this.clearGameplayInput?.(); return Boolean(result.applied);
    }

    phaseLabel() { return this.isHiveMissionV131()
      ? `${HIVE_CAMPAIGNS_V131.find(campaign => campaign.specialOperationId === this.hiveV131.operationId)?.name} · ${HIVE_PHASE_LABELS_V131[hivePhaseV131(this.hiveV131)]}`
      : super.phaseLabel(); }
    objectiveProgressText() { return this.isHiveMissionV131() ? hiveDossierV131(this.hiveV131).instruction : super.objectiveProgressText(); }
    getInteractionPrompt() {
      if (!this.isHiveMissionV131()) return super.getInteractionPrompt();
      if (this.isJeriSurfaceAttachedV135()) return `${this.jeriSurfaceV135.face === 'underside' ? 'A/D · PLAFOND' : 'W/S · MUR'} / V OU SAUT · DÉTACHER / E APRÈS DÉTACHEMENT`;
      const station = this.hiveManifestV131.stations.find(candidate => near(this.player, candidate)
        && !(candidate.charge && this.hiveV131.spentCapsules.includes(candidate.id)));
      if (this.hiveV131.possession) return 'B · REVENIR AU CORPS D’ORIGINE / F · GRIFFE';
      if (station) return `E · ${station.label}${station.duration ? ` · ${this.hiveV131.channelProgress.toFixed(1)}/${station.duration} S` : ''}`;
      const recruit = this.hiveActorsV131.find(actor => !actor.hiveRecruitedV131 && ACTIVE(actor) && Math.hypot(center(actor) - center(this.player), feet(actor) - feet(this.player)) < 110);
      return recruit ? 'E · RECRUTER · 12 CHARGE' : this.hiveV131.operationId === 'jeri-false-son'
        ? `V · ${findJeriSurfaceV135(this.player, this.jeriSurfaceSceneV135()) ? 'S’ACCROCHER' : 'MUR / DESSOUS DE PASSERELLE À PROXIMITÉ'} / C · PROFILS` : 'C · INTERFACE RUCHE / N · RECRUE / B · CONTRÔLE';
    }
    getSnapshot() {
      return { ...super.getSnapshot(), ...(this.isHiveMissionV131() ? { hiveMissionV131: {
        ...clone(this.hiveV131), jeriSurfaceV135: { ...clone(this.jeriSurfaceV135), contacts: jeriSurfaceContactsV135(this.player, this.jeriSurfaceV135) }, actors: this.captureHiveActorsV131(), dossier: hiveDossierV131(this.hiveV131),
        identity: this.hiveIdentityV131, topology: this.hiveV131.operationId === 'eloise-uncrowned-queen'
          ? this.hiveV131.pylons.filter(value => value !== 'sealed').length >= 3 ? 'organic'
            : this.hiveV131.pylons.filter(value => value !== 'sealed').length ? 'contested' : 'corporate' : 'hive',
        artDebt: [...this.hiveManifestV131.artDebt] } } : {}) };
    }
    getGameplayReport() { return { ...super.getGameplayReport(), ...(this.isHiveMissionV131() ? { hiveMissionV131: this.getSnapshot().hiveMissionV131 } : {}) }; }
    drawMissionLevelCover(ctx, image, factor, alpha, overscan, yOffset, options = {}) {
      if (!this.isHiveMissionV131() || !image?.complete || !(image.naturalWidth || image.width))
        return super.drawMissionLevelCover(ctx, image, factor, alpha, overscan, yOffset, options);
      const offset = verticalLayerOffsetV130(this.camera.y, factor, this.missionLevelBounds.height);
      const extra = (Math.max(0, this.missionLevelBounds.height - 720) + 200) * offset.response;
      const height = 720 * Math.max(1, overscan) + extra;
      const crop = image.missionCoverContractV62 ? computeMissionLayerCoverCropV62(image, image.missionCoverContractV62.targetAspect) : null;
      const width = height * (crop?.targetAspect || (image.naturalWidth || image.width) / (image.naturalHeight || image.height));
      const y = Math.min(0, offset.y + yOffset - (720 * Math.max(1, overscan) - 720) / 2);
      const draw = x => crop ? ctx.drawImage(image, crop.sourceX, crop.sourceY, crop.sourceWidth, crop.sourceHeight, x, y, width, height)
        : ctx.drawImage(image, x, y, width, height);
      ctx.save(); ctx.globalAlpha = factor >= 0.8 ? Math.min(0.12, alpha) : alpha;
      const offsetX = -(this.camera.x * factor % width);
      for (let x = offsetX - width; x < 1280; x += width) draw(x);
      ctx.restore();
    }
    drawForeground(ctx) {
      if (!this.isHiveMissionV131()) return super.drawForeground(ctx);
      const image = this.missionLevelLayerImage('foreground');
      if (image?.complete && image.naturalWidth > 0) this.drawMissionLevelCover(ctx, image, 1.12, 0.12, 1, 0);
      this.drawHazardForegroundOverlays(ctx);
    }
    playerAppearanceLadderV128(actor) {
      if (actor !== this.player || !this.isJeriSurfaceAttachedV135()) return super.playerAppearanceLadderV128(actor);
      const surface = this.jeriSurfaceSceneV135().solids.find(rect => rect.id === this.jeriSurfaceV135.surfaceId);
      if (!surface) return null;
      // The existing articulated rig accepts contact grids. A one-pixel grid
      // models continuous wall grip; it creates no ladder or world collider.
      return { id: actor.ladderId, x: this.jeriSurfaceV135.face === 'underside' ? center(actor)
        : this.jeriSurfaceV135.face === 'left' ? surface.x : surface.x + surface.w,
        top: this.jeriSurfaceV135.face === 'underside' ? actor.y - 1 : surface.y,
        bottom: this.jeriSurfaceV135.face === 'underside' ? feet(actor) + 2 : surface.y + surface.h,
        w: actor.w, rungSpacing: 1, firstRung: 1, physicalSurfaceIdV135: surface.id };
    }
    drawActor(ctx, actor) {
      if (actor !== this.player || !this.isJeriSurfaceAttachedV135()) return super.drawActor(ctx, actor);
      ctx.save();
      if (this.jeriSurfaceV135.face === 'underside') {
        ctx.translate(actor.x + actor.w / 2, actor.y + actor.h / 2); ctx.rotate(Math.PI);
        ctx.translate(-actor.x - actor.w / 2, -actor.y - actor.h / 2);
      }
      // Existing ladder pose is an interface adaptation, not dedicated Jeri art.
      super.drawActor(ctx, actor); ctx.restore();
      ctx.save(); ctx.strokeStyle = '#98e5bd'; ctx.lineWidth = 2;
      for (const contact of jeriSurfaceContactsV135(actor, this.jeriSurfaceV135)) {
        ctx.beginPath(); ctx.arc(contact.x, contact.y, 4, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    drawWorld(ctx) {
      super.drawWorld(ctx); if (!this.isHiveMissionV131()) return;
      for (const actor of this.hiveActorsV131.filter(candidate => candidate.alive)) {
        super.drawEnemy(ctx, actor);
        ctx.save(); ctx.fillStyle = actor.hiveRecruitedV131 ? '#93d9bd' : '#e5c187'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`${actor.hiveLabelV131 || actor.name} · ${Math.round(actor.loyaltyV131)}%`, center(actor), actor.y - 14); ctx.restore();
      }
      ctx.save(); ctx.font = '12px monospace'; ctx.textAlign = 'center';
      for (const station of this.hiveManifestV131.stations) {
        if (station.charge && this.hiveV131.spentCapsules.includes(station.id)) continue;
        this.drawWorldProp(ctx, station.charge ? 'crates' : station.id.startsWith('pylon-') ? 'maintenancePipe' : 'terminal', station.x - 22, station.floorY, 58, 44);
        ctx.fillStyle = '#adc5bd'; ctx.fillText(station.label, station.x, station.floorY - 80);
      }
      if (this.hiveV131.operationId === 'jeri-false-son' && !this.hiveV131.rescued) {
        const station = this.hiveManifestV131.stations.find(candidate => candidate.id === 'rescue');
        this.drawWorldProp(ctx, 'cover', station.x - 30, station.floorY, 88, 60);
        ctx.fillStyle = '#e4ba82'; ctx.fillText(`IMPLANTATION · ${Math.ceil(150 - this.hiveV131.implantClock)} S`, station.x, station.floorY - 103);
      }
      ctx.restore();
    }
    drawHud(ctx) {
      super.drawHud(ctx); if (!this.isHiveMissionV131()) return;
      const state = this.hiveV131;
      ctx.save(); ctx.fillStyle = 'rgba(4,13,16,.88)'; ctx.fillRect(880, 230, 375, state.operationId === 'jeri-false-son' ? 117 : 95);
      ctx.fillStyle = '#a3d8c2'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`CHARGE ${Math.floor(state.charge)} · ${state.operationId === 'jeri-false-son' ? `DISSONANCE ${Math.floor(state.dissonance)}`
        : state.operationId === 'atax-false-queen' ? `INSTINCT ${Math.floor(state.royalInstinct)}` : `CHŒUR ${Math.floor(state.choir)} / DOULEUR ${Math.floor(state.pain)}`}`, 893, 251);
      ctx.fillText(state.operationId === 'jeri-false-son' ? `PROFIL ${HIVE_PROFILES_V131.find(profile => profile.id === state.profile)?.label.toUpperCase()} · T${Math.floor(state.segments.head)} C${Math.floor(state.segments.torso)} J${Math.floor(state.segments.legs)}`
        : `RECRUES ${state.recruitedIds.length} · ${state.possession ? 'CONTRÔLE ACTIF' : 'CORPS D’ORIGINE'}`, 893, 273);
      ctx.fillText(state.operationId === 'jeri-false-son' ? 'V ACCROCHER / LÂCHER · SAUT DÉTACHER' : 'C INTERFACE · N RECRUE · B CONTRÔLE', 893, 296);
      if (state.operationId === 'jeri-false-son') ctx.fillText('W/S MUR · A/D PLAFOND · C PROFILS', 893, 317);
      ctx.fillText('ART DÉDIÉ INCOMPLET · ADAPTATION TANTALUS', 893, state.operationId === 'jeri-false-son' ? 338 : 315); ctx.restore();
    }
  };
}
