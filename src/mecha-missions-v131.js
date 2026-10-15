import { ENEMIES, LEVEL_SEEDS } from './content-core-v50.js';
import { buildMissionLevelV52, validateMissionTopologyV52, validateMissionPhysicalTopologyV57 } from './mission-levels-v52.js';
import { validateMissionTopologyV58 } from './topology-coherence-v58.js';
import { firstProjectileObstacleV83, sweepProjectileAabbV83 } from './projectile-collision-v83.js';
import { resolveCombatAimV83 } from './combat-aim-v83.js';
import { cancelTacticalReloadV77 } from './tactical-reload-v77.js';
import { MECHA_LOADOUTS_V131, MECHA_SUBSYSTEMS_V131, createMechaSystemsV131, mechaReadyV131, mechaMobilityV131,
  spendMechaActionV131, resolveMechaHitRegionV131, damageMechaSystemsV131, beginMechaCoolingV131,
  beginMechaRepairV131, advanceMechaSystemsV131, validateMechaSystemsV131, drawMechaPrototypeV131 } from './mecha-systems-v131.js';

export const MECHA_CAMPAIGNS_V131 = Object.freeze([
  Object.freeze({ id: 'special-titan-v131', specialOperationId: 'titan-equalizer', name: 'TALOS CONTRE LE TITAN',
    mode: 'SURVIVAL', worldId: 'world-05-lethe', year: 2204, canon: 'project-continuity', routes: 1,
    source: 'Tantalus · mission originale', templateId: 'planet-exterior',
    objective: 'Qualifier le prototype lourd, affronter le Titan puis rejoindre le hangar de récupération.',
    summary: 'Duel de grande échelle : cinq phases, sous-systèmes, chaleur, corrosion et arène destructible. Visuels originaux de prototype.' }),
  Object.freeze({ id: 'special-z110-v131', specialOperationId: 'protocol-z110', name: 'PROTOCOLE Z-110',
    mode: 'SURVIVAL', worldId: 'world-05-lethe', year: 2204, canon: 'project-continuity', routes: 2,
    source: 'Tantalus · mission originale', templateId: 'colony-multiroute',
    objective: 'Choisir un loader et une route de ruche, rompre trois sièges et neutraliser la reine de siège.',
    summary: 'Atlas, Vulcain, Cerbère ou Méduse ; route rouge ou noire ; reine de siège. Visuels originaux de prototype.' })
]);
export const MECHA_ART_STATUS_V131 = Object.freeze({ mode: 'original-vector-prototype', productionReady: false,
  label: 'PROTOTYPE VISUEL ORIGINAL · ART FINAL À PRODUIRE',
  missing: Object.freeze(['P-9000/TALOS dédié', 'Atlas/Vulcain/Cerbère/Méduse dédiés', 'Titan dédié', 'Morrigan dédiée', 'VFX et décors de ruche dédiés']) });
export const MECHA_MISSION_LIMITS_V131 = Object.freeze({ maxEnemies: 12, maxProjectiles: 32, extraction: 2,
  routes: Object.freeze(['red', 'black']), loadouts: Object.freeze(Object.keys(MECHA_LOADOUTS_V131)) });
const list = value => Array.isArray(value) ? value : [];
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const clone = value => structuredClone(value);
const center = value => ({ x: value.x + value.w / 2, y: value.y + value.h / 2 });
const distance = (a, b) => Math.hypot(center(a).x - center(b).x, center(a).y - center(b).y);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const campaignFor = id => MECHA_CAMPAIGNS_V131.find(campaign => campaign.id === id || campaign.specialOperationId === id);
const pilotControls = Object.freeze({ left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' });
const isTitan = campaign => campaign?.specialOperationId === 'titan-equalizer';
const phaseTitles = Object.freeze({ hangar: 'CHOISIR LE PROTOTYPE', route: 'CHOISIR LA RUCHE', tutorial: 'QUALIFICATION HYDRAULIQUE',
  siege: 'ROMPRE LE SIÈGE', arena: 'DUEL DU TITAN', boss: 'REINE DE SIÈGE', finish: 'EXÉCUTION MÉCANIQUE', extract: 'RETOUR AU HANGAR', complete: 'OPÉRATION TERMINÉE' });

export function buildMechaMissionV131(options = {}) {
  const requested = typeof options.campaign === 'string' ? options.campaign : options.campaign?.id || options.operationId;
  const campaign = requested ? campaignFor(requested) : MECHA_CAMPAIGNS_V131[0];
  if (!campaign) throw new Error('Unknown original mecha campaign.');
  const titan = isTitan(campaign), width = titan ? 3600 : 4400, floorY = 720;
  const base = buildMissionLevelV52({ ...options, campaign, levelSeeds: options.levelSeeds || LEVEL_SEEDS, templateId: campaign.templateId });
  const scenery = titan ? [
    { id: 'mecha-drill-primary-v131', x: 700, y: 490, w: 60, h: 230, material: 'panel', hp: 48 },
    { id: 'mecha-drill-secondary-v131', x: 1020, y: 510, w: 70, h: 210, material: 'crate', hp: 76 },
    ...[1680, 2220, 2840].map((x, i) => ({ id: `mecha-arena-${i + 1}-v131`, x, y: 530, w: 84, h: 190, material: i === 1 ? 'glass' : 'panel', hp: 70 }))
  ] : [
    ...[1180, 2120, 2860].map((x, i) => ({ id: `mecha-breach-${i + 1}-v131`, x, y: 570, w: 74, h: 150, material: i === 1 ? 'glass' : 'panel', hp: 74 })),
    { id: 'mecha-siege-cover-v131', x: 3400, y: 550, w: 88, h: 170, material: 'crate', hp: 80 }
  ];
  const zoneId = 'mecha-arena-v131';
  const nodes = [['spawn', 180, floorY], ['hangar', 380, floorY], ['approach', 1160, floorY], ['spine', 1630, floorY],
    ['flank-west', 1410, 650], ['flank-core', 1640, 650], ['flank-east', 1850, 650], ['arena', 2280, floorY], ['extraction', width - 115, floorY]]
    .map(([id, x, y]) => ({ id: `mecha-${id}-v131`, x, y, width: 260, zoneId }));
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const route = (id, ids) => ({ id, role: id === 'mecha-spine-v131' ? 'heavy-assault' : 'maintenance-flank',
    nodeIds: ids.map(id => `mecha-${id}-v131`) });
  const routes = [route('mecha-spine-v131', ['spawn', 'hangar', 'approach', 'spine', 'arena', 'extraction']),
    route('mecha-flank-v131', ['spawn', 'hangar', 'approach', 'flank-west', 'flank-core', 'flank-east', 'arena', 'extraction'])];
  const edges = [];
  for (const path of routes) for (let i = 1; i < path.nodeIds.length; i++) {
    const from = path.nodeIds[i - 1], to = path.nodeIds[i], previous = edges.find(edge => edge.from === from && edge.to === to);
    if (previous) previous.routeIds.push(path.id);
    else edges.push({ id: `${from}-to-${to}`, from, to, kind: nodeMap.get(from).y === nodeMap.get(to).y ? 'walk' : 'slope', routeIds: [path.id] });
  }
  const platforms = [{ id: 'mecha-arena-floor-v131', x: 0, y: floorY, w: width, h: 160, floor: true, art: 'floor', zoneId },
    { id: 'mecha-flank-deck-v131', x: 1300, y: 650, w: 680, h: 22, art: 'catwalk', zoneId },
    ...nodes.map(node => ({ id: `${node.id}-support`, nodeId: node.id, x: node.x - 130, y: node.y, w: 260,
      h: node.y === floorY ? 160 : 22, floor: node.y === floorY, art: node.y === floorY ? 'floor' : 'catwalk', zoneId })),
    ...edges.map(edge => {
      const a = nodeMap.get(edge.from), b = nodeMap.get(edge.to);
      const y = a.y === b.y ? a.y : 650;
      return { id: `${edge.id}-bridge`, edgeId: edge.id, x: Math.min(a.x, b.x), y,
        w: Math.abs(b.x - a.x), h: y === floorY ? 160 : 22, floor: y === floorY, art: y === floorY ? 'floor' : 'catwalk', zoneId };
    })];
  const anchor = id => { const node = nodeMap.get(`mecha-${id}-v131`); return { nodeId: node.id, x: node.x, y: node.y, zoneId }; };
  const result = { ...base, label: campaign.name, signature: `${base.signature}:mecha-${titan ? 'titan' : 'z110'}-v131`,
    dimensions: { width, height: 880 },
    graph: { nodes, edges, routes }, geometry: { platforms, ladders: [], doors: [], vents: [] },
    anchors: { spawn: anchor('spawn'), extraction: anchor('extraction') }, events: [], spawns: [], hazards: [], aquaticHabitats: [],
    biomeZones: [{ ...base.biomeZones[0], id: zoneId, x: 0, w: width, label: titan ? 'Hangar et arène du Titan' : 'Périmètre de siège Z-110' }],
    routeRuntime: { ...base.routeRuntime, source: 'mecha-arena-v131', routeSpan: width, routes: 2, verticalSpan: 70,
      platforms, ladders: [], hazards: [], routeNodes: nodes.map(node => ({ ...node,
        routeIds: routes.filter(route => route.nodeIds.includes(node.id)).map(route => route.id) })) },
    destructibleSceneryV130: scenery,
    mechaMissionV131: { schema: 131, operationId: campaign.specialOperationId, colossal: titan, width, height: 880, floorY,
      hangar: { x: 260, y: floorY - 90, w: 100, h: 90 },
      maintenance: { id: 'mecha-maintenance-v131', x: titan ? 1510 : 1780, y: floorY - 110, w: 100, h: 110 },
      extraction: { id: 'mecha-recovery-v131', x: width - 190, y: floorY - 180, w: 150, h: 180 },
      boss: { id: titan ? 'mecha-titan-v131' : 'mecha-siege-queen-v131', name: titan ? 'TITAN · PROTOTYPE' : 'MORRIGAN · PROTOTYPE',
        x: titan ? 2450 : 3650, w: titan ? 300 : 230, h: titan ? 340 : 285,
        health: titan ? 1200 : 920, phases: titan ? 5 : 3 } },
    validation: { ...base.validation, mechaV131: { valid: true, originalArena: true, maxEnemies: 12, floorY } } };
  const checks = [validateMissionTopologyV52(result), validateMissionPhysicalTopologyV57(result), validateMissionTopologyV58(result)];
  const errors = checks.flatMap(check => check.errors);
  if (errors.length) throw new Error(`Mecha arena topology: ${errors.join('; ')}`);
  result.routeRuntime.biomeZones = result.biomeZones;
  result.validation = { ...checks[0], valid: true, connectedNodes: nodes.length, totalNodes: nodes.length, routeCount: 2,
    physicalValid: true, physicalLadderCount: checks[1].ladderCount, physicalHazardCount: checks[1].hazardCount,
    roomCoherenceValid: true, coherentDoorCount: checks[2].doorCount, reciprocalConnectionCount: checks[2].reciprocalConnectionCount,
    physicallyReachableNodes: nodes.length, contextualEventCount: 0, contextualSpawnCount: 0,
    mechaV131: { ...result.validation.mechaV131, jumpRise: 70, smallestLoaderRise: 98, floorCount: 2 } };
  return result;
}

function createState(campaign) {
  return { schema: 131, operationId: campaign.specialOperationId, phase: 'hangar', loadoutId: 'atlas', route: 'red',
    mounted: false, primaryQualified: false, secondaryQualified: false, wave: 0, emitted: 0, waveClock: 0,
    bossPhase: 0, bossDefeated: false, finishReady: false, extractionProgress: 0, maintenanceUsed: false,
    complete: false, rewardClaimed: false, elapsed: 0, rewards: null, journal: [], systems: createMechaSystemsV131('atlas', { colossal: isTitan(campaign) }) };
}

function bossActor(plan) {
  const profile = plan.mechaMissionV131.boss;
  return { ...profile, y: plan.mechaMissionV131.floorY - profile.h, maxHealth: profile.health, armor: 0, alive: true,
    facing: -1, vx: 0, vy: 0, speed: 105, damage: 40, isBoss: true, mechaBossV131: true,
    biology: 'prototype-xenomorph', behavior: 'mecha-boss', profileId: profile.id,
    alert: true, revealed: 100, deathClock: 0, staggerClock: 0, statusClock: 0, attackClock: 0,
    bossV131: { phase: 0, cooldown: 2.2, windup: 0, attack: null, targetX: 0, targetY: 0, charge: 0, chargeHit: false,
      parts: { carapace: 100, forelimbs: 100, legs: 100, core: 100 } } };
}

/** Pure certification shared by runtime resume and the reward ledger. The
 * caller additionally checks the root save identity, mission and actor refs. */
export function validateMechaMissionStateV131(raw) {
  const campaign = campaignFor(raw?.operationId), titan = isTitan(campaign), phases = titan ? 5 : 3;
  if (!record(raw) || !campaign || raw.schema !== 131 || !MECHA_LOADOUTS_V131[raw.loadoutId]
    || !MECHA_MISSION_LIMITS_V131.routes.includes(raw.route) || !Object.keys(phaseTitles).includes(raw.phase)
    || (titan ? ['route', 'siege', 'boss'].includes(raw.phase) : ['tutorial', 'arena'].includes(raw.phase))
    || ['mounted', 'primaryQualified', 'secondaryQualified', 'bossDefeated', 'finishReady', 'maintenanceUsed', 'complete', 'rewardClaimed'].some(key => typeof raw[key] !== 'boolean'))
    return { valid: false, reason: 'mecha-state-schema' };
  const checked = validateMechaSystemsV131(raw.systems, { loadoutId: raw.loadoutId, colossal: titan });
  if (!checked.valid) return checked;
  if (!Array.isArray(raw.enemies) || raw.enemies.some(enemy => !record(enemy))) return { valid: false, reason: 'mecha-state-enemies' };
  const bosses = list(raw.enemies).filter(enemy => enemy.boss), minions = list(raw.enemies).filter(enemy => !enemy.boss);
  const terminal = ['arena', 'boss', 'finish', 'extract', 'complete'].includes(raw.phase);
  if (!Array.isArray(raw.enemies) || raw.enemies.length > 22 || new Set(raw.enemies.map(enemy => enemy.id)).size !== raw.enemies.length
    || !Number.isInteger(raw.wave) || raw.wave < 0 || raw.wave > 3 || !Number.isInteger(raw.emitted) || raw.emitted !== minions.length
    || raw.emitted !== (titan ? 0 : [0, 5, 12, 21][raw.wave]) || bosses.length !== (terminal ? 1 : 0)
    || !Number.isInteger(raw.bossPhase) || raw.bossPhase < 0 || raw.bossPhase >= phases
    || !Number.isFinite(raw.extractionProgress) || raw.extractionProgress < 0 || raw.extractionProgress > 2
    || raw.complete !== (raw.phase === 'complete') || raw.rewardClaimed !== raw.complete
    || raw.bossDefeated !== ['extract', 'complete'].includes(raw.phase) || raw.finishReady !== (raw.phase === 'finish')
    || ['extract', 'complete'].includes(raw.phase) && raw.bossPhase !== phases - 1
    || titan && terminal && (!raw.primaryQualified || !raw.secondaryQualified || checked.state.shots < 1 || checked.state.strikes < 1)
    || !titan && terminal && (raw.wave !== 3 || minions.some(enemy => enemy.alive))
    || raw.phase === 'hangar' && (raw.mounted || raw.wave || raw.primaryQualified || raw.secondaryQualified)
    || checked.state.destroyed && raw.mounted || !raw.complete && raw.rewards !== null)
    return { valid: false, reason: 'mecha-state-progress' };
  const waveProfiles = raw.route === 'red' ? ['enemy-005-warrior', 'enemy-009-crusher'] : ['enemy-006-runner', 'enemy-010-spitter'];
  if (minions.some((enemy, index) => {
    const first = index < 5 ? 0 : index < 12 ? 5 : 12;
    return enemy.boss !== false || enemy.id !== `mecha-wave-${index + 1}-v131` || enemy.profileId !== waveProfiles[(index - first) % 2]
      || typeof enemy.alive !== 'boolean' || !Number.isFinite(enemy.health) || enemy.health < 0
      || enemy.health > (raw.route === 'red' ? 96 : 72) || enemy.alive !== (enemy.health > 0);
  })) return { valid: false, reason: 'mecha-state-wave' };
  const boss = bosses[0], expectedBossId = titan ? 'mecha-titan-v131' : 'mecha-siege-queen-v131', maxHealth = titan ? 1200 : 920;
  if (boss && (boss.id !== expectedBossId || boss.profileId !== expectedBossId || !Number.isFinite(boss.health)
    || boss.health < 0 || boss.health > maxHealth || boss.alive !== (boss.health > 0) || !record(boss.bossState)
    || boss.bossState.phase !== raw.bossPhase || raw.bossDefeated !== !boss.alive
    || boss.alive && raw.bossPhase !== Math.min(phases - 1, Math.floor((1 - boss.health / maxHealth) * phases))
    || raw.finishReady && boss.health > maxHealth * 0.08)) return { valid: false, reason: 'mecha-state-boss' };
  if (raw.complete && (!raw.mounted || !mechaReadyV131(checked.state) || raw.extractionProgress !== 2
    || !record(raw.rewards) || raw.rewards.credits !== (titan ? 1100 : 900) || raw.rewards.operationId !== raw.operationId
    || ['salvage', 'intel', 'retries', 'elapsedSeconds'].some(key => !Number.isFinite(raw.rewards[key]) || raw.rewards[key] < 0)))
    return { valid: false, reason: 'mecha-terminal-inconsistent' };
  return { valid: true, state: { ...clone(raw), systems: checked.state } };
}

export function withMechaMissionsV131(Base) {
  if (Base.mechaMissionsRuntimeV131) return Base;
  return class MechaMissionsV131 extends Base {
    static mechaMissionsRuntimeV131 = true;
    start(options = {}) {
      const campaign = campaignFor(options.campaign?.id);
      this.mechaMissionActiveV131 = Boolean(campaign);
      this.mechaMissionV131 = campaign ? createState(campaign) : null;
      this.mechaCheckpointV131 = null; this.mechaMenuKeysV131 = new Set(); this.mechaPendingCheckpointV131 = null; this.mechaAimV131 = null;
      if (!campaign) return super.start(options);
      if (options.editorProject || options.missionLevel?.mechaMissionV131?.operationId !== campaign.specialOperationId
        || !options.missionLevel.validation?.mechaV131?.valid) throw new Error('Mecha V131 requires its original buildMechaMissionV131 level.');
      this.mechaPlanV131 = options.missionLevel;
      super.start({ ...options, resumeState: undefined, vehicle: null, crew: [], squad: [], equipment: [],
        neuroProfile: null, apexDossier: null, userCasteCampaignV88: false, verticalWorldV130: false });
      this.configureMechaWorldV131();
      if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      this.syncMechaWorldV131();
      this.mechaCheckpointV131 ||= this.captureMechaCheckpointV131();
      this.onEvent?.({ type: 'special-operation-started', operationId: campaign.specialOperationId, campaignId: campaign.id,
        localPlayers: 1, artStatus: MECHA_ART_STATUS_V131.mode });
      return this.getSnapshot();
    }

    isMechaMissionV131() { return Boolean(this.mechaMissionActiveV131 && this.mechaMissionV131); }
    mechaSimulationActiveV131() {
      return Boolean(this.isMechaMissionV131() && this.running && !this.paused && !this.enemyAtlasLoadingPausedV65
        && !this.userCasteLoadingV88 && this.mission?.state === 'active');
    }
    canMechaActV131(actor = this.player, { mounted = false, busy = false } = {}) {
      const state = this.mechaMissionV131;
      return Boolean(this.isMechaMissionV131() && this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
        && this.mission?.state === 'active' && actor === this.player && actor.alive && !actor.downed && !actor.climbing && !actor.ventTransit
        && !this.isFieldActionBusyV124?.(actor) && !this.isPlaceableBusyV86?.(actor) && !actor.reloading
        && !this.vehicle?.accessTransition && (!mounted || state.mounted && actor.inVehicle && this.vehicle.driver === actor)
        && (busy || state.systems.coolingClock <= 0 && state.systems.repairClock <= 0));
    }

    configureMechaWorldV131() {
      const plan = this.mechaPlanV131.mechaMissionV131;
      this.enemies = []; this.bullets = []; this.hostileProjectiles = []; this.drops = []; this.squadActors = []; this.coopEnabled = false;
      this.platforms = this.mechaPlanV131.geometry.platforms.map(platform => ({ ...platform }));
      this.walls = []; this.covers = []; this.doors = []; this.hazards = []; this.ladders = []; this.lifts = []; this.vents = [];
      this.supplies = []; this.objectiveNodes = []; this.collectablesV68 = []; this.narrativeCollectablesV68 = [];
      this.powerNode = null; this.archiveTerminal = null; this.supportDeployments = []; this.equipmentActions?.clear();
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear(); this.missionLevelEvents?.clear();
      this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear(); this.missionLevelExtractionTimer = null;
      this.ventShortcut = { id: 'none', x: -1000, y: -1000, w: 0, h: 0, open: false };
      if (this.weaponPickup) this.weaponPickup.taken = true;
      if (this.toolPickup) this.toolPickup.taken = true;
      this.missionLevelBounds = { width: plan.width, height: plan.height, voidY: plan.height + 120 };
      Object.assign(this.player, { x: 165, y: plan.floorY - this.player.h, vx: 0, vy: 0, facing: 1, grounded: true,
        inVehicle: false, climbing: false, ladderId: null, ventTransit: null, fireClock: 0, meleeClock: 0, reloading: false });
      this.vehicle = this.buildMechaVehicleV131(260);
      this.objective = { ...plan.extraction, complete: false };
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.camera.x = 0; this.camera.y = 90;
      this.configureDestructibleSceneryV130?.(this.missionLevelRuntime);
    }

    buildMechaVehicleV131(x = this.vehicle?.x || 260) {
      const state = this.mechaMissionV131, scale = state.systems.colossal ? 1.5 : 1;
      const w = 154 * scale, h = 204 * scale, floor = this.mechaPlanV131.mechaMissionV131.floorY;
      return { id: `prototype-mecha-${state.loadoutId}-v131`, name: `${MECHA_LOADOUTS_V131[state.loadoutId].name} · prototype original`,
        family: 'exosuit', mechaV131: true, active: true, destroyed: false, x, y: floor - h, w, h,
        groundY: floor - h, facing: 1, vx: 0, vy: 0, hull: state.systems.hull, maxHull: state.systems.maxHull,
        fuel: state.systems.energy, canDrive: true, canFire: true, occupied: false, driver: null, passengers: [],
        turretAmmo: 0, maxTurretAmmo: 0, accessTransition: null, accessSecureClock: 0, squadAccessRuntime: null };
    }

    selectMechaLoadoutV131(id) {
      const state = this.mechaMissionV131;
      if (!this.canMechaActV131() || state.phase !== 'hangar' || !MECHA_LOADOUTS_V131[id]) return false;
      state.loadoutId = id; state.systems = createMechaSystemsV131(id, { colossal: isTitan(this.campaign) });
      this.vehicle = this.buildMechaVehicleV131();
      this.onEvent?.({ type: 'mecha-loadout-selected-v131', id }); return true;
    }
    selectMechaRouteV131(id) {
      if (!this.canMechaActV131(this.player, { mounted: true }) || this.mechaMissionV131.phase !== 'route'
        || !MECHA_MISSION_LIMITS_V131.routes.includes(id)) return false;
      this.mechaMissionV131.route = id;
      this.onEvent?.({ type: 'mecha-route-selected-v131', id }); return true;
    }
    mechaMissionMenuV131() {
      const state = this.mechaMissionV131;
      if (!this.isMechaMissionV131()) return null;
      return { phase: state.phase, canSelect: this.canMechaActV131(), selectedLoadout: state.loadoutId, selectedRoute: state.route,
        loadouts: Object.values(MECHA_LOADOUTS_V131).map(profile => ({ id: profile.id, label: profile.name, role: profile.role,
          selected: state.loadoutId === profile.id, enabled: state.phase === 'hangar' && this.canMechaActV131() })),
        routes: [{ id: 'red', label: 'Ruche rouge', detail: 'Assauts directs ; armure dense.' },
          { id: 'black', label: 'Ruche noire', detail: 'Jets acides ; couloirs corrosifs.' }].map(route => ({ ...route,
          selected: state.route === route.id, enabled: state.phase === 'route' && this.canMechaActV131(this.player, { mounted: true }) })),
        artStatus: MECHA_ART_STATUS_V131 };
    }

    setCoop(enabled) { return super.setCoop(this.isMechaMissionV131() ? false : enabled); }
    clearGameplayInput(...args) {
      const result = super.clearGameplayInput(...args); this.mechaMenuKeysV131 = new Set();
      this.mechaAimV131 = null;
      if (this.player) this.player.mechaJumpHeldV131 = false;
      return result;
    }
    updateObjectiveRuntime(delta) { if (!this.isMechaMissionV131()) return super.updateObjectiveRuntime(delta); }
    updateMissionPhase() { if (!this.isMechaMissionV131()) return super.updateMissionPhase(); this.syncMechaWorldV131(); }
    missingObjectiveRequirement(options) { return this.isMechaMissionV131() ? this.missingMechaRequirementV131() : super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.isMechaMissionV131() ? this.missingMechaRequirementV131() : super.missingExtractionRequirement(); }
    missingMechaRequirementV131() { return this.mechaMissionV131?.bossDefeated && this.mechaMissionV131.extractionProgress >= 2 ? '' : 'PROTOTYPE ET ZONE NON RÉCUPÉRÉS'; }

    mountMechaV131(actor = this.player) {
      if (!this.canMechaActV131(actor) || this.mechaMissionV131.mounted || !mechaReadyV131(this.mechaMissionV131.systems)
        || distance(actor, this.vehicle) > 245) return false;
      this.cancelFieldActionV124?.(actor, 'mecha-boarding'); this.cancelPlaceableV86?.(actor, 'mecha-boarding'); cancelTacticalReloadV77(actor, 'mecha-boarding');
      this.mechaMissionV131.mounted = true; this.pinMechaPilotV131(); return true;
    }
    pinMechaPilotV131() {
      if (!this.mechaMissionV131?.mounted || this.vehicle.destroyed) return;
      this.vehicle.occupied = true; this.vehicle.driver = this.player; this.vehicle.passengers = [];
      Object.assign(this.player, { inVehicle: true, x: this.vehicle.x + this.vehicle.w * 0.42 - this.player.w / 2,
        y: this.vehicle.y + this.vehicle.h * 0.16, vx: this.vehicle.vx, vy: this.vehicle.vy, facing: this.vehicle.facing,
        climbing: false, ladderId: null, grounded: this.vehicle.y + this.vehicle.h >= this.mechaPlanV131.mechaMissionV131.floorY - 1 });
    }
    toggleVehicle(actor = this.player) {
      if (!this.isMechaMissionV131()) return super.toggleVehicle(actor);
      if (!this.canMechaActV131(actor)) return false;
      if (!this.mechaMissionV131.mounted) return this.mountMechaV131(actor);
      if (['hangar', 'route'].includes(this.mechaMissionV131.phase)) return false;
      const candidates = [this.vehicle.x + this.vehicle.w + 12, this.vehicle.x - actor.w - 12];
      const x = candidates.find(value => value >= 0 && value + actor.w <= this.missionLevelBounds.width
        && !this.walls.some(wall => !wall.destroyed && overlap({ x: value, y: this.vehicle.y + this.vehicle.h - actor.h, w: actor.w, h: actor.h }, wall)));
      if (x === undefined) return false;
      this.mechaMissionV131.mounted = false; this.vehicle.occupied = false; this.vehicle.driver = null; this.vehicle.vx = 0;
      Object.assign(actor, { inVehicle: false, x, y: this.vehicle.y + this.vehicle.h - actor.h, vx: 0, vy: 0, grounded: true });
      this.onEvent?.({ type: 'mecha-pilot-exited-v131' }); return true;
    }

    interact(actor = this.player) {
      if (!this.isMechaMissionV131()) return super.interact(actor);
      if (!this.canMechaActV131(actor)) return false;
      const state = this.mechaMissionV131;
      if (state.phase === 'hangar') {
        if (!this.mountMechaV131(actor)) return false;
        state.phase = isTitan(this.campaign) ? 'tutorial' : 'route'; this.syncMechaWorldV131(); this.queueMechaCheckpointV131('mounted'); return true;
      }
      if (!state.mounted && distance(actor, this.vehicle) <= 245) return this.mountMechaV131(actor);
      if (state.phase === 'route') {
        state.phase = 'siege'; this.spawnMechaWaveV131(); this.syncMechaWorldV131(); this.queueMechaCheckpointV131('route-selected'); return true;
      }
      const boss = this.enemies.find(enemy => enemy.mechaBossV131 && enemy.alive);
      if (state.finishReady && boss && state.mounted && distance(this.vehicle, boss) <= 370 && state.systems.energy >= 12
        && this.mechaLineClearV131(center(this.vehicle), center(boss))) {
        state.systems.energy -= 12; this.defeatEnemy(boss, actor); this.queueMechaCheckpointV131('boss-cleared'); return true;
      }
      if (state.finishReady) return false;
      if (!state.maintenanceUsed && distance(state.mounted ? this.vehicle : actor, this.mechaPlanV131.mechaMissionV131.maintenance) <= 170) {
        state.maintenanceUsed = true; state.systems.coolant = 4; state.systems.repairKits = 2; state.systems.corrosion = 0;
        state.systems.energy = 100; state.systems.heat = 0; state.systems.overheated = false;
        this.onEvent?.({ type: 'mecha-maintenance-v131', message: 'Réserves de maintenance restaurées une fois.' }); this.queueMechaCheckpointV131('maintenance'); return true;
      }
      if (state.phase === 'extract' && state.mounted && distance(this.vehicle, this.objective) < 210) return true;
      if (state.mounted && state.phase !== 'extract') return beginMechaRepairV131(state.systems);
      return false;
    }

    reload(actor = this.player) {
      if (!this.isMechaMissionV131()) return super.reload(actor);
      return this.canMechaActV131(actor, { mounted: true }) && beginMechaCoolingV131(this.mechaMissionV131.systems);
    }
    useEquipment(id, actor = this.player) { return this.isMechaMissionV131() ? false : super.useEquipment(id, actor); }
    useMedkit(actor = this.player) { return this.isMechaMissionV131() && this.mechaMissionV131.mounted ? false : super.useMedkit(actor); }

    updatePlayer(actor, delta, controls) {
      if (!this.isMechaMissionV131()) return super.updatePlayer(actor, delta, controls);
      if (actor !== this.player) return;
      if (this.mechaMissionV131.phase === 'hangar' || this.mechaMissionV131.phase === 'route') {
        actor.fireClock = Math.max(0, actor.fireClock - delta); actor.vx = 0; actor.vy = 0; return;
      }
      return super.updatePlayer(actor, delta, controls);
    }
    updateVehicleDriver(actor, delta, controls = pilotControls) {
      if (!this.isMechaMissionV131()) return super.updateVehicleDriver(actor, delta, controls);
      if (!this.canMechaActV131(actor, { mounted: true, busy: true })) return;
      const state = this.mechaMissionV131.systems, locked = this.keys.has('ShiftLeft') || actor.aimLockedV124;
      const horizontal = locked ? 0 : Number(this.keys.has(controls.right) || this.keys.has('ArrowRight')) - Number(this.keys.has(controls.left) || this.keys.has('ArrowLeft'));
      const previousX = this.vehicle.x, previousBottom = this.vehicle.y + this.vehicle.h;
      this.vehicle.vx = horizontal * MECHA_LOADOUTS_V131[state.loadoutId].speed * mechaMobilityV131(state);
      const jump = this.keys.has(controls.jump), onGround = this.platforms.some(platform => Math.abs(previousBottom - platform.y) <= 2
        && this.vehicle.x + this.vehicle.w > platform.x && this.vehicle.x < platform.x + platform.w);
      if (jump && !actor.mechaJumpHeldV131 && onGround && state.energy >= 14 && mechaReadyV131(state) && state.repairClock <= 0 && state.coolingClock <= 0) {
        state.energy -= 14; state.heat = Math.min(100, state.heat + 6); this.vehicle.vy = -410; if (state.heat >= 100) state.overheated = true;
      }
      actor.mechaJumpHeldV131 = jump;
      this.vehicle.x = clamp(previousX + this.vehicle.vx * delta, 0, this.missionLevelBounds.width - this.vehicle.w);
      if (horizontal) this.vehicle.facing = Math.sign(horizontal);
      this.resolveVehicleHorizontal(previousX);
      this.vehicle.y += this.vehicle.vy * delta + 850 * delta * delta / 2; this.vehicle.vy += 850 * delta;
      this.vehicle.grounded = false; this.resolveVertical(this.vehicle, previousBottom);
      const floor = this.mechaPlanV131.mechaMissionV131.floorY;
      if (this.vehicle.y + this.vehicle.h >= floor) { this.vehicle.y = floor - this.vehicle.h; this.vehicle.vy = 0; }
      this.pinMechaPilotV131();
      const aim = this.resolvePlayerCombatAimV83(actor);
      if (actor.aimingV124) this.vehicle.facing = aim.facing;
    }

    resolvePlayerCombatAimV83(actor = this.player) {
      const aim = super.resolvePlayerCombatAimV83(actor);
      if (!this.isMechaMissionV131() || actor !== this.player || !this.mechaMissionV131.mounted) return aim;
      const held = this.keys.has('ShiftLeft'), external = actor.pointerAimV83 || actor.gamepadAimV83 || actor.gamepadAimHeldV124;
      if (!held || external) { this.mechaAimV131 = null; return aim; }
      if (aim.active) this.mechaAimV131 = aim;
      if (!this.mechaAimV131) return aim;
      const selected = Object.freeze({ ...this.mechaAimV131, active: true, heldV130: true, latchedV130: !aim.active });
      actor.combatAimV83 = selected; actor.facing = selected.facing; actor.aimingV124 = true;
      return selected;
    }

    resolvePlayerMuzzleV124(actor, aim) {
      if (!this.isMechaMissionV131() || actor !== this.player || !this.mechaMissionV131.mounted) return super.resolvePlayerMuzzleV124(actor, aim);
      const pivot = { x: this.vehicle.x + this.vehicle.w / 2, y: this.vehicle.y + this.vehicle.h * 0.42, w: 2, h: 2 };
      const displacement = { x: aim.x * this.vehicle.w * 0.57, y: aim.y * this.vehicle.w * 0.57 };
      const obstruction = firstProjectileObstacleV83(pivot, displacement, { walls: this.walls, doors: this.doors, platforms: this.platforms });
      return { x: obstruction ? obstruction.x - aim.x * 2 : pivot.x + displacement.x,
        y: obstruction ? obstruction.y - aim.y * 2 : pivot.y + displacement.y, pivotX: pivot.x, pivotY: pivot.y, sourceX: pivot.x, sourceY: pivot.y };
    }

    fire(actor = this.player) {
      if (!this.isMechaMissionV131()) return super.fire(actor);
      if (!this.canMechaActV131(actor, { mounted: true }) || ['hangar', 'route', 'extract'].includes(this.mechaMissionV131.phase)) return false;
      const state = this.mechaMissionV131.systems;
      const profile = MECHA_LOADOUTS_V131[state.loadoutId].primary;
      if (this.bullets.length + profile.count > MECHA_MISSION_LIMITS_V131.maxProjectiles) return false;
      if (!spendMechaActionV131(state, 'primary')) return false;
      const aim = this.resolvePlayerCombatAimV83?.(actor) || resolveCombatAimV83({ facing: actor.facing });
      this.vehicle.facing = aim.facing; actor.facing = aim.facing;
      const muzzle = this.resolvePlayerMuzzleV124(actor, aim);
      for (let i = 0; i < profile.count; i++) {
        const angle = aim.angleRadians + (profile.count === 2 ? (i ? 1 : -1) * 0.022 : 0);
        this.bullets.push({ ...muzzle, w: 12, h: 8, vx: Math.cos(angle) * profile.speed, vy: Math.sin(angle) * profile.speed,
          angleRadians: angle, damage: profile.damage, owner: actor, kind: 'mecha-primary-v131', mechaV131: true,
          status: profile.status, family: state.loadoutId === 'vulcain' ? 'flame' : 'energy', life: profile.range / profile.speed,
          hit: false, remainingPenetration: 0, maxHits: 1, hitEnemyIds: new Set(), armorBypass: 0.35 });
      }
      actor.shots++; actor.fireClock = profile.interval; actor.actionClock = 0.22;
      this.audio?.shot?.(); this.onEvent?.({ type: 'mecha-shot-v131', loadoutId: state.loadoutId, energy: state.energy, heat: state.heat }); return true;
    }
    melee(actor = this.player) {
      if (!this.isMechaMissionV131()) return super.melee(actor);
      if (!this.canMechaActV131(actor, { mounted: true }) || ['hangar', 'route', 'extract'].includes(this.mechaMissionV131.phase)) return false;
      const state = this.mechaMissionV131.systems, weapon = MECHA_LOADOUTS_V131[state.loadoutId].secondary;
      const origin = { x: this.vehicle.x + this.vehicle.w / 2, y: this.vehicle.y + this.vehicle.h * 0.52, w: 0, h: 0 };
      const facing = this.vehicle.facing < 0 ? -1 : 1, displacement = { x: facing * (this.vehicle.w / 2 + weapon.range), y: 0 };
      const obstacle = firstProjectileObstacleV83(origin, displacement, { walls: this.walls, covers: this.covers, doors: this.doors, platforms: this.platforms });
      const enemyHits = this.enemies.filter(enemy => enemy.alive && !enemy.dormant).map(enemy => ({ enemy, contact: sweepProjectileAabbV83(origin, displacement, enemy) }))
        .filter(hit => hit.contact).sort((a, b) => a.contact.t - b.contact.t);
      const target = enemyHits[0], wallFirst = obstacle && (!target || obstacle.t <= target.contact.t);
      if (!wallFirst && !target || wallFirst && !obstacle.target?.sceneryV130 || !spendMechaActionV131(state, 'secondary')) return false;
      const source = { owner: actor, kind: 'mecha-secondary-v131', mechaV131: true, attackKind: weapon.kind,
        x: wallFirst ? obstacle.x : target.contact.x, y: wallFirst ? obstacle.y : target.contact.y, status: weapon.status };
      if (wallFirst) this.damageDestructibleSceneryV130(obstacle.target.id, weapon.damage, source, obstacle);
      else { this.applyEnemyDamage(target.enemy, weapon.damage, source); if (weapon.status) this.applyProjectileStatus(target.enemy, source); }
      actor.meleeClock = weapon.interval; actor.fireClock = Math.max(actor.fireClock, 0.22); actor.actionClock = 0.32;
      this.onEvent?.({ type: 'mecha-secondary-v131', attack: weapon.kind, target: wallFirst ? obstacle.target.id : target.enemy.id }); return true;
    }

    damageDestructibleSceneryV130(id, amount, source = {}, contact = {}) {
      if (!this.isMechaMissionV131()) return super.damageDestructibleSceneryV130(id, amount, source, contact);
      if (id === 'mecha-drill-primary-v131' && source.kind !== 'mecha-primary-v131'
        || id === 'mecha-drill-secondary-v131' && source.kind !== 'mecha-secondary-v131') return 0;
      const damage = super.damageDestructibleSceneryV130(id, amount, source, contact);
      if (damage > 0 && this.mechaMissionV131.phase === 'tutorial') {
        if (id === 'mecha-drill-primary-v131') this.mechaMissionV131.primaryQualified = true;
        if (id === 'mecha-drill-secondary-v131') this.mechaMissionV131.secondaryQualified = true;
      }
      return damage;
    }

    mechaLineClearV131(from, to) {
      return !firstProjectileObstacleV83({ ...from, w: 0, h: 0 }, { x: to.x - from.x, y: to.y - from.y }, {
        walls: this.walls, doors: this.doors, platforms: this.platforms });
    }
    damageVehicle(amount, source = 'enemy') {
      if (!this.isMechaMissionV131()) return super.damageVehicle(amount, source);
      if (!this.mechaSimulationActiveV131()) return 0;
      const hit = typeof source === 'object' ? source : { kind: source };
      const region = resolveMechaHitRegionV131(this.vehicle, hit);
      const damage = damageMechaSystemsV131(this.mechaMissionV131.systems, amount, region,
        { acid: hit.acid === true || /acid|acide/.test(String(hit.kind)), gel: hit.gel === true });
      this.syncMechaWorldV131();
      if (damage > 0) this.onEvent?.({ type: 'mecha-damaged-v131', region, damage, hull: this.vehicle.hull });
      if (this.mechaMissionV131.systems.destroyed) this.destroyMechaV131('Sous-système critique du prototype détruit.');
      return damage;
    }
    spawnEnemyProjectile(enemy, target) {
      if (this.isMechaMissionV131() && this.hostileProjectiles.length >= MECHA_MISSION_LIMITS_V131.maxProjectiles) return false;
      return super.spawnEnemyProjectile(enemy, target);
    }
    destroyMechaV131(reason) {
      this.mechaMissionV131.mounted = false; this.vehicle.occupied = false; this.vehicle.driver = null; this.player.inVehicle = false;
      this.player.x = clamp(this.vehicle.x + this.vehicle.w + 10, 0, this.missionLevelBounds.width - this.player.w);
      this.player.y = this.mechaPlanV131.mechaMissionV131.floorY - this.player.h;
      this.vehicle.destroyed = true; this.failMission(reason);
    }

    updateHostileProjectiles(delta) {
      if (!this.isMechaMissionV131()) return super.updateHostileProjectiles(delta);
      if (!this.mechaSimulationActiveV131()) return;
      for (const projectile of this.hostileProjectiles) {
        if (projectile.hit || projectile.life <= 0) continue;
        const dt = Math.min(delta, projectile.life), displacement = { x: projectile.vx * dt, y: finite(projectile.vy) * dt };
        const obstacle = firstProjectileObstacleV83(projectile, displacement, { walls: this.walls, doors: this.doors,
          platforms: this.platforms, bounds: this.missionLevelBounds });
        const targets = [this.vehicle.destroyed ? null : this.vehicle, this.mechaMissionV131.mounted ? null : this.player].filter(Boolean)
          .map(target => ({ target, contact: sweepProjectileAabbV83(projectile, displacement, target) })).filter(hit => hit.contact)
          .sort((a, b) => a.contact.t - b.contact.t);
        const actor = targets[0], terrain = obstacle && (!actor || obstacle.t <= actor.contact.t), contact = terrain ? obstacle : actor?.contact;
        projectile.life -= delta;
        if (contact) {
          projectile.x = contact.x; projectile.y = contact.y; projectile.hit = true;
          if (terrain && obstacle.target?.sceneryV130) this.damageDestructibleSceneryV130(obstacle.target.id, projectile.damage * 2, projectile, contact);
          else if (!terrain && actor.target === this.vehicle) this.damageVehicle(projectile.damage, projectile);
          else if (!terrain) this.damagePlayer(actor.target, projectile.damage, { source: projectile.acid ? 'acid' : 'projectile',
            sourceX: projectile.sourceX, sourceY: projectile.sourceY, projectileV124: { vx: projectile.vx, vy: projectile.vy } });
          this.spawnImpact?.(projectile.x, projectile.y, projectile.acid ? '#b5c263' : '#d6ab7d');
        } else { projectile.x += displacement.x; projectile.y += displacement.y; }
      }
      this.hostileProjectiles = this.hostileProjectiles.filter(projectile => !projectile.hit && projectile.life > 0);
    }

    spawnMechaWaveV131() {
      const state = this.mechaMissionV131;
      if (state.wave >= 3 || this.enemies.some(enemy => enemy.alive)) return false;
      state.wave++; state.waveClock = 0;
      const counts = [5, 7, 9], profiles = state.route === 'red' ? ['enemy-005-warrior', 'enemy-009-crusher'] : ['enemy-006-runner', 'enemy-010-spitter'];
      for (let i = 0; i < counts[state.wave - 1]; i++) {
        const source = ENEMIES.find(profile => profile.id === profiles[i % profiles.length]);
        if (!source) throw new Error('Missing verified existing mecha wave profile.');
        const x = clamp(this.vehicle.x + this.vehicle.w + 280 + i * 86, 700, this.missionLevelBounds.width - 180);
        const actor = this.createEnemy(source, state.emitted, x, this.mechaPlanV131.mechaMissionV131.floorY);
        Object.assign(actor, { id: `mecha-wave-${++state.emitted}-v131`, mechaWaveV131: true, mechaProfileIdV131: source.id,
          health: state.route === 'red' ? 96 : 72, maxHealth: state.route === 'red' ? 96 : 72, armor: state.route === 'red' ? 10 : 2,
          damage: 13, speed: 85 + (state.route === 'black' ? 18 : 0), alert: true, dormant: false });
        this.enemies.push(actor);
      }
      this.onEvent?.({ type: 'mecha-wave-v131', wave: state.wave, route: state.route }); return true;
    }
    spawnMechaBossV131() {
      if (this.enemies.some(enemy => enemy.mechaBossV131)) return;
      this.enemies.push(bossActor(this.mechaPlanV131));
      this.mechaMissionV131.phase = isTitan(this.campaign) ? 'arena' : 'boss';
      this.queueMechaCheckpointV131('boss-approach');
    }

    updateEnemy(enemy, delta) {
      if (!this.isMechaMissionV131() || !enemy.mechaBossV131) return super.updateEnemy(enemy, delta);
      if (!enemy.alive || !this.mechaSimulationActiveV131()) return;
      const attack = enemy.bossV131;
      enemy.staggerClock = Math.max(0, enemy.staggerClock - delta); enemy.statusClock = Math.max(0, enemy.statusClock - delta);
      if (enemy.statusEffect === 'burn' && enemy.statusClock > 0) this.applyEnemyDamage(enemy, delta * 7, { owner: this.player, kind: 'mecha-burn-v131', mechaV131: true });
      if (enemy.staggerClock > 0 || this.mechaMissionV131.finishReady) return;
      const target = this.mechaMissionV131.mounted ? this.vehicle : this.player;
      if (attack.charge > 0) {
        const displacement = { x: enemy.facing * 260 * delta, y: 0 };
        const obstacle = firstProjectileObstacleV83(enemy, displacement, { walls: this.walls, doors: this.doors, platforms: [] });
        const hit = sweepProjectileAabbV83(enemy, displacement, target);
        if (obstacle && (!hit || obstacle.t <= hit.t)) {
          if (obstacle.target?.sceneryV130) this.damageDestructibleSceneryV130(obstacle.target.id, 200, { kind: 'boss-charge', x: obstacle.x, y: obstacle.y }, obstacle);
          enemy.x = obstacle.x; attack.charge = 0;
        } else if (hit && !attack.chargeHit) {
          enemy.x = hit.x; attack.chargeHit = true;
          if (this.mechaMissionV131.mounted) this.damageVehicle(44, { hitRegionV131: 'hydraulics' });
          else this.damagePlayer(this.player, 30, { bypassCover: true, source: 'mecha-boss-charge' });
          attack.charge = 0;
        } else enemy.x = clamp(enemy.x + displacement.x, 0, this.missionLevelBounds.width - enemy.w);
        attack.charge = Math.max(0, attack.charge - delta); return;
      }
      if (attack.windup > 0) {
        attack.windup = Math.max(0, attack.windup - delta);
        if (attack.windup === 0) this.releaseMechaBossAttackV131(enemy);
        return;
      }
      attack.cooldown = Math.max(0, attack.cooldown - delta);
      const dx = center(target).x - center(enemy).x;
      enemy.facing = Math.sign(dx) || enemy.facing;
      if (Math.abs(dx) > 330) {
        const displacement = { x: Math.sign(dx) * 68 * delta, y: 0 };
        const wall = firstProjectileObstacleV83(enemy, displacement, { walls: this.walls, doors: this.doors, platforms: [] });
        if (wall?.target?.sceneryV130) this.damageDestructibleSceneryV130(wall.target.id, delta * 55, { kind: 'boss-pressure' }, wall);
        else if (!wall) enemy.x += displacement.x;
      }
      if (attack.cooldown === 0) {
        const moves = isTitan(this.campaign) ? ['sweep', 'acid', 'charge', 'stomp', 'barrage'] : ['sweep', 'acid', 'barrage'];
        attack.attack = moves[attack.phase]; attack.windup = attack.attack === 'charge' ? 1.25 : 0.95;
        attack.targetX = center(target).x; attack.targetY = center(target).y;
        this.onEvent?.({ type: 'mecha-boss-warning-v131', attack: attack.attack, phase: attack.phase });
      }
    }

    releaseMechaBossAttackV131(enemy) {
      const attack = enemy.bossV131, target = this.mechaMissionV131.mounted ? this.vehicle : this.player;
      attack.cooldown = attack.attack === 'barrage' ? 2.4 : 3.2;
      if (attack.attack === 'charge') { attack.charge = 1.6; attack.chargeHit = false; return; }
      if (['acid', 'barrage'].includes(attack.attack)) {
        const count = attack.attack === 'barrage' ? 3 : 1;
        for (let i = 0; i < count && this.hostileProjectiles.length < 32; i++) {
          const origin = { x: enemy.facing > 0 ? enemy.x + enemy.w + 2 : enemy.x - 16, y: enemy.y + enemy.h * 0.3 };
          const angle = Math.atan2(attack.targetY - origin.y, attack.targetX - origin.x) + (i - (count - 1) / 2) * 0.13;
          this.hostileProjectiles.push({ ...origin, sourceX: origin.x, sourceY: origin.y, w: 14, h: 12,
            vx: Math.cos(angle) * 365, vy: Math.sin(angle) * 365, damage: 25, life: 6,
            acid: true, gel: !isTitan(this.campaign) && i === 1, mechaV131: true, ownerId: enemy.id, hit: false, kind: 'boss-acid-v131' });
        }
      } else if (distance(enemy, target) <= (attack.attack === 'stomp' ? 420 : 330)) {
        const from = center(enemy), to = center(target), contact = firstProjectileObstacleV83({ ...from, w: 0, h: 0 }, { x: to.x - from.x, y: to.y - from.y }, { walls: this.walls });
        if (contact?.target?.sceneryV130) this.damageDestructibleSceneryV130(contact.target.id, 180, { kind: 'boss-sweep' }, contact);
        else if (!contact) {
          if (this.mechaMissionV131.mounted) this.damageVehicle(attack.attack === 'stomp' ? 38 : 30,
            { hitRegionV131: attack.attack === 'stomp' ? 'hydraulics' : 'leftArm' });
          else this.damagePlayer(this.player, 22, { bypassCover: true, source: 'mecha-boss-melee' });
        }
      }
      attack.attack = null;
    }

    applyEnemyDamage(enemy, amount, source = {}) {
      if (!this.isMechaMissionV131() || !enemy?.mechaBossV131) return super.applyEnemyDamage(enemy, amount, source);
      if (!this.mechaSimulationActiveV131() || !source.mechaV131 || !Number.isFinite(amount) || amount <= 0 || !enemy.alive) return 0;
      const region = (finite(source.y, enemy.y + enemy.h * 0.5) - enemy.y) / enemy.h;
      const part = region < 0.3 ? 'carapace' : region > 0.77 ? 'legs' : source.kind === 'mecha-secondary-v131' ? 'forelimbs' : 'core';
      const damage = amount * (part === 'carapace' && enemy.bossV131.parts.carapace > 0 ? 0.68 : 1);
      enemy.bossV131.parts[part] = Math.max(0, enemy.bossV131.parts[part] - damage * 0.32);
      const applied = Math.min(enemy.health - 1, damage); enemy.health = Math.max(1, enemy.health - damage);
      enemy.hurtClock = 0.2; source.mechaDamageAppliedV131 = true;
      const stages = this.mechaPlanV131.mechaMissionV131.boss.phases;
      const phase = Math.min(stages - 1, Math.floor((1 - enemy.health / enemy.maxHealth) * stages));
      if (phase !== enemy.bossV131.phase) {
        enemy.bossV131.phase = phase; this.mechaMissionV131.bossPhase = phase; enemy.bossV131.windup = 0; enemy.bossV131.charge = 0;
        enemy.bossV131.cooldown = 1.6; this.queueMechaCheckpointV131(`boss-phase-${phase + 1}`);
        this.onEvent?.({ type: 'mecha-boss-phase-v131', phase: phase + 1 });
      }
      if (enemy.health <= enemy.maxHealth * 0.08) { this.mechaMissionV131.finishReady = true; this.mechaMissionV131.phase = 'finish'; }
      return applied;
    }
    defeatEnemy(enemy, owner = this.player) {
      if (!this.isMechaMissionV131() || !enemy?.mechaBossV131) {
        const previous = this.drops?.length || 0, result = super.defeatEnemy(enemy, owner);
        if (this.isMechaMissionV131() && enemy?.mechaWaveV131) this.drops.splice(previous);
        return result;
      }
      if (!enemy.alive || !this.mechaMissionV131.finishReady) return false;
      enemy.alive = false; enemy.health = 0; enemy.deathClock = 3; owner.kills++;
      this.mechaMissionV131.bossDefeated = true; this.mechaMissionV131.finishReady = false; this.mechaMissionV131.phase = 'extract';
      this.hostileProjectiles = []; this.syncMechaWorldV131();
      this.onEvent?.({ type: 'mecha-boss-defeated-v131', id: enemy.id }); return true;
    }

    update(delta) {
      if (!this.isMechaMissionV131()) return super.update(delta);
      if (!this.mechaSimulationActiveV131() || !Number.isFinite(delta) || delta <= 0) return;
      // Substeps preserve a large caller delta and swept movement; no free
      // cooling/wave/extraction progress is earned while simulation is paused.
      let remaining = delta;
      while (remaining > 1e-9 && this.mission.state === 'active') {
        const dt = Math.min(1 / 60, remaining); this.updateMechaStepV131(dt); remaining -= dt;
      }
    }
    updateMechaStepV131(delta) {
      const state = this.mechaMissionV131;
      if (this.keys.has('KeyC') && !this.mechaMenuKeysV131.has('KeyC')) this.melee();
      if (this.keys.has('KeyC')) this.mechaMenuKeysV131.add('KeyC'); else this.mechaMenuKeysV131.delete('KeyC');
      if (['hangar', 'route'].includes(state.phase)) {
        for (const code of ['KeyA', 'KeyD', 'KeyW', 'KeyS']) {
          const held = this.keys.has(code), old = this.mechaMenuKeysV131.has(code);
          if (held && !old && state.phase === 'hangar' && ['KeyA', 'KeyD'].includes(code)) {
            const ids = MECHA_MISSION_LIMITS_V131.loadouts, index = ids.indexOf(state.loadoutId);
            this.selectMechaLoadoutV131(ids[(index + (code === 'KeyD' ? 1 : ids.length - 1)) % ids.length]);
          }
          if (held && !old && state.phase === 'route' && ['KeyW', 'KeyS'].includes(code)) this.selectMechaRouteV131(code === 'KeyW' ? 'red' : 'black');
          if (held) this.mechaMenuKeysV131.add(code); else this.mechaMenuKeysV131.delete(code);
        }
      }
      advanceMechaSystemsV131(state.systems, delta); state.elapsed += delta;
      if (!isTitan(this.campaign) && state.route === 'black' && state.mounted && ['siege', 'boss'].includes(state.phase)
        && Math.abs(this.vehicle.y + this.vehicle.h - this.mechaPlanV131.mechaMissionV131.floorY) < 9
        && [2020, 2780].some(x => this.vehicle.x + this.vehicle.w > x && this.vehicle.x < x + 170))
        state.systems.corrosion = Math.min(100, state.systems.corrosion + delta * 8);
      if (state.systems.destroyed) { this.syncMechaWorldV131(); this.destroyMechaV131('Corrosion fatale du prototype.'); return; }
      super.update(delta);
      if (this.mission.state !== 'active') return;
      if (state.phase === 'tutorial' && state.primaryQualified && state.secondaryQualified
        && this.getDestructibleScenerySnapshotV130().objects.filter(object => object.id.startsWith('mecha-drill')).every(object => object.destroyed)) this.spawnMechaBossV131();
      if (state.phase === 'siege' && !this.enemies.some(enemy => enemy.alive)) {
        state.waveClock += delta;
        if (state.waveClock >= 1.5) {
          if (state.wave >= 3) this.spawnMechaBossV131();
          else { this.spawnMechaWaveV131(); this.queueMechaCheckpointV131(`siege-${state.wave}`); }
        }
      }
      if (state.phase === 'extract' && state.mounted && distance(this.vehicle, this.objective) < 210 && this.keys.has('KeyE')) {
        state.extractionProgress = Math.min(2, state.extractionProgress + delta);
        if (state.extractionProgress >= 2) this.completeMission();
      } else if (state.phase === 'extract') state.extractionProgress = 0;
      this.syncMechaWorldV131();
      this.camera.x = clamp(this.vehicle.x - 370, 0, this.missionLevelBounds.width - 1280);
      this.camera.y = clamp(this.vehicle.y - 200, 0, this.missionLevelBounds.height - 720);
      if (this.mechaPendingCheckpointV131) {
        const id = this.mechaPendingCheckpointV131; this.mechaPendingCheckpointV131 = null;
        this.mechaCheckpointV131 = this.captureMechaCheckpointV131();
        this.onEvent?.({ type: 'checkpoint', checkpoint: `mecha-${id}`, operationId: state.operationId });
      }
    }
    queueMechaCheckpointV131(id) { this.mechaPendingCheckpointV131 = id; }
    syncMechaWorldV131() {
      if (!this.isMechaMissionV131() || !this.vehicle) return;
      const state = this.mechaMissionV131;
      this.vehicle.hull = state.systems.hull; this.vehicle.maxHull = state.systems.maxHull; this.vehicle.fuel = state.systems.energy;
      this.vehicle.destroyed = state.systems.destroyed; this.mission.phase = state.phase;
      this.mission.objectives = { power: state.phase !== 'hangar', route: isTitan(this.campaign) ? state.primaryQualified && state.secondaryQualified : state.wave >= 3,
        boss: state.bossDefeated, archive: state.bossDefeated, extract: state.complete };
      this.objective.complete = state.complete; this.coopEnabled = false;
      if (state.mounted && !state.systems.destroyed) this.pinMechaPilotV131();
    }
    completeMission(actor = this.player) {
      if (!this.isMechaMissionV131()) return super.completeMission(actor);
      const state = this.mechaMissionV131;
      if (!this.canMechaActV131(actor, { mounted: true }) || !mechaReadyV131(state.systems) || state.complete || state.rewardClaimed || this.missingMechaRequirementV131()) return false;
      state.complete = true; state.rewardClaimed = true; state.phase = 'complete'; this.mission.state = 'complete';
      state.rewards = { credits: isTitan(this.campaign) ? 1100 : 900, salvage: this.inventory.salvage, intel: this.inventory.intel,
        retries: this.mission.retries, elapsedSeconds: Math.round(this.mission.elapsed), noCasualty: this.mission.casualties === 0, operationId: state.operationId };
      this.mission.rewards = clone(state.rewards); this.syncMechaWorldV131();
      this.onEvent?.({ type: 'mission-complete', rewards: clone(state.rewards), operationId: state.operationId }); return true;
    }

    refreshSpriteCollisionProfiles() {
      const result = super.refreshSpriteCollisionProfiles();
      for (const enemy of list(this.enemies)) if (enemy.mechaBossV131) enemy.spriteHitbox = null;
      if (this.vehicle?.mechaV131) this.vehicle.spriteHitbox = null;
      return result;
    }
    getVisibleEnemyAtlasSheetsV65(enemies = this.getVisibleEnemiesV65()) {
      return super.getVisibleEnemyAtlasSheetsV65(enemies.filter(enemy => !enemy.mechaBossV131));
    }

    captureMechaCheckpointV131() {
      const raw = this.captureResumeState(); delete raw.specialOperation.mechaCheckpointV131; return clone(raw);
    }
    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isMechaMissionV131()) return base;
      const projectiles = values => values.filter(value => !value.hit && !value.mechaDamageAppliedV131 && value.life > 0).slice(0, 32)
        .map(value => Object.fromEntries(['x', 'y', 'w', 'h', 'vx', 'vy', 'damage', 'life', 'sourceX', 'sourceY', 'angleRadians',
          'kind', 'status', 'family', 'acid', 'gel', 'ownerId', 'mechaV131'].filter(key => value[key] !== undefined).map(key => [key, value[key]])));
      return { ...base, player: { ...base.player, inVehicle: Boolean(this.player.inVehicle) },
        specialOperation: { ...(base.specialOperation || {}), operationId: this.mechaMissionV131.operationId,
        mechaV131: { ...clone(this.mechaMissionV131), vehicle: { x: this.vehicle.x, y: this.vehicle.y, vx: this.vehicle.vx, vy: this.vehicle.vy, facing: this.vehicle.facing },
          enemies: this.enemies.map(enemy => ({ id: enemy.id, profileId: enemy.mechaProfileIdV131 || enemy.profileId,
            boss: Boolean(enemy.mechaBossV131), x: enemy.x, y: enemy.y, health: enemy.health, alive: enemy.alive,
            ...(enemy.mechaBossV131 ? { bossState: clone(enemy.bossV131), staggerClock: finite(enemy.staggerClock),
              statusEffect: enemy.statusEffect || null, statusClock: finite(enemy.statusClock) } : {}) })),
          bullets: projectiles(this.bullets), hostiles: projectiles(this.hostileProjectiles) },
        mechaCheckpointV131: this.mechaCheckpointV131 ? clone(this.mechaCheckpointV131) : null } };
    }

    validateMechaResumeV131(raw) {
      const state = raw?.specialOperation?.mechaV131, plan = this.mechaPlanV131.mechaMissionV131;
      if (!record(state) || state.schema !== 131 || state.operationId !== this.mechaMissionV131.operationId || raw.specialOperation.operationId !== state.operationId
        || raw.schema !== 1 || !record(raw.identity) || ['campaignId', 'worldId', 'levelSeedId', 'objectiveId', 'editorProjectKind'].some(key => raw.identity[key] !== this.resumeIdentity[key])
        || raw.identity.seed !== this.resumeIdentity.seed || raw.missionLevel?.signature !== this.missionLevelRuntime.signature
        || !['active', 'failed', 'complete'].includes(raw.mission?.state) || !Object.keys(phaseTitles).includes(state.phase)
        || state.complete !== (state.phase === 'complete') || state.complete !== (raw.mission.state === 'complete')
        || state.rewardClaimed !== state.complete || state.complete && !record(state.rewards) || !state.complete && state.rewards !== null
        || !MECHA_LOADOUTS_V131[state.loadoutId] || !MECHA_MISSION_LIMITS_V131.routes.includes(state.route)
        || ['mounted', 'primaryQualified', 'secondaryQualified', 'bossDefeated', 'finishReady', 'maintenanceUsed', 'complete', 'rewardClaimed'].some(key => typeof state[key] !== 'boolean'))
        return { valid: false, reason: 'mecha-identity-or-phase' };
      const certified = validateMechaMissionStateV131(state);
      if (!certified.valid) return certified;
      const systems = validateMechaSystemsV131(state.systems, { loadoutId: state.loadoutId, colossal: plan.colossal });
      if (!systems.valid) return systems;
      const inRange = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
      if (!record(state.vehicle) || !inRange(state.vehicle.x, 0, plan.width - this.vehicle.w) || !inRange(state.vehicle.y, 0, plan.floorY)
    || state.vehicle.y + this.vehicle.h > plan.floorY + 0.001
    || !inRange(state.vehicle.vx, -500, 500) || !inRange(state.vehicle.vy, -410, 1200) || ![-1, 1].includes(state.vehicle.facing)
        || !inRange(state.elapsed, 0, 604800) || !inRange(state.extractionProgress, 0, 2) || !inRange(state.waveClock, 0, 1.6)
        || !Number.isInteger(state.wave) || state.wave < 0 || state.wave > 3 || !Number.isInteger(state.emitted) || state.emitted < 0 || state.emitted > 21
        || !Number.isInteger(state.bossPhase) || state.bossPhase < 0 || state.bossPhase >= plan.boss.phases
        || !Array.isArray(state.enemies) || state.enemies.length > 22 || !Array.isArray(raw.enemies) || raw.enemies.length !== state.enemies.length
        || raw.enemies.some(enemy => !record(enemy) || typeof enemy.id !== 'string')
        || state.enemies.filter(enemy => enemy.alive).length > 12 || new Set(state.enemies.map(enemy => enemy.id)).size !== state.enemies.length
        || raw.vehicle?.id !== `prototype-mecha-${state.loadoutId}-v131` || raw.vehicle.hull !== systems.state.hull
        || raw.vehicle.x !== state.vehicle.x || raw.vehicle.y !== state.vehicle.y || raw.vehicle.occupied !== state.mounted
        || raw.player?.inVehicle !== state.mounted || raw.coop?.enabled || raw.vehicle.passengers?.length
        || state.mounted && (raw.vehicle.driver !== 'player' || raw.player.alive !== true || systems.state.destroyed)
        || state.phase === 'hangar' && (state.mounted || state.enemies.length || state.wave || state.primaryQualified || state.secondaryQualified)
        || state.phase === 'route' && (plan.colossal || !state.mounted || state.enemies.length || state.wave)
        || ['arena', 'boss', 'finish', 'extract', 'complete'].includes(state.phase) && !state.enemies.some(enemy => enemy.boss)
        || !plan.colossal && ['boss', 'finish', 'extract', 'complete'].includes(state.phase) && (state.wave !== 3 || state.emitted !== 21)
        || plan.colossal && ['arena', 'finish', 'extract', 'complete'].includes(state.phase) && (!state.primaryQualified || !state.secondaryQualified)
        || state.complete && (!state.bossDefeated || state.extractionProgress !== 2 || state.rewards.credits !== (plan.colossal ? 1100 : 900) || state.rewards.operationId !== state.operationId))
        return { valid: false, reason: 'mecha-progress-inconsistent' };
      for (const enemy of state.enemies) {
        const saved = raw.enemies.find(value => value.id === enemy.id);
        if (!saved || saved.alive !== enemy.alive || saved.health !== enemy.health || !inRange(enemy.x, 0, plan.width)
          || !inRange(enemy.y, 0, plan.floorY) || typeof enemy.alive !== 'boolean' || !inRange(enemy.health, 0, enemy.boss ? plan.boss.health : state.route === 'red' ? 96 : 72)
          || enemy.alive !== (enemy.health > 0) || enemy.boss && (enemy.id !== plan.boss.id || enemy.profileId !== plan.boss.id)
          || !enemy.boss && (!/^mecha-wave-(?:[1-9]|1\d|2[01])-v131$/.test(enemy.id) || !['enemy-005-warrior', 'enemy-009-crusher', 'enemy-006-runner', 'enemy-010-spitter'].includes(enemy.profileId)))
          return { valid: false, reason: 'mecha-enemy-inconsistent' };
        if (enemy.boss) {
          const boss = enemy.bossState;
          if (!record(boss) || boss.phase !== state.bossPhase || !inRange(boss.cooldown, 0, 3.2) || !inRange(boss.windup, 0, 1.25)
            || !inRange(boss.charge, 0, 1.6) || typeof boss.chargeHit !== 'boolean' || ![null, 'sweep', 'acid', 'charge', 'stomp', 'barrage'].includes(boss.attack)
            || !inRange(boss.targetX, 0, plan.width) || !inRange(boss.targetY, 0, plan.height) || !record(boss.parts)
            || Object.values(boss.parts).length !== 4 || ['carapace', 'forelimbs', 'legs', 'core'].some(key => !inRange(boss.parts[key], 0, 100))
            || !inRange(enemy.staggerClock, 0, 5) || !inRange(enemy.statusClock, 0, 5) || ![null, 'burn', 'frozen', 'stun'].includes(enemy.statusEffect)
            || state.bossDefeated !== !enemy.alive || state.finishReady && (enemy.health > plan.boss.health * 0.08 || state.phase !== 'finish'))
            return { valid: false, reason: 'mecha-boss-inconsistent' };
        }
      }
      for (const projectiles of [state.bullets, state.hostiles]) {
        if (!Array.isArray(projectiles) || projectiles.length > 32 || projectiles.some(value => !record(value)
          || !['x', 'y', 'w', 'h', 'vx', 'vy', 'damage', 'life'].every(key => Number.isFinite(value[key]))
          || !inRange(value.x, -30, plan.width + 30) || !inRange(value.y, -30, plan.height + 30) || !inRange(value.w, 1, 30) || !inRange(value.h, 1, 30)
          || !inRange(value.vx, -1000, 1000) || !inRange(value.vy, -1000, 1000) || !inRange(value.damage, 1, 100) || !inRange(value.life, 0.001, 6)
          || value.kind && !['mecha-primary-v131', 'boss-acid-v131'].includes(value.kind))) return { valid: false, reason: 'mecha-projectile-inconsistent' };
      }
      const terrain = raw.destructibleSceneryV130;
      if (!record(terrain) || terrain.schema !== 130 || terrain.signature !== this.missionLevelRuntime.signature || !Array.isArray(terrain.objects)
        || terrain.objects.length !== this.mechaPlanV131.destructibleSceneryV130.length
        || terrain.objects.some(value => {
          if (!record(value)) return true;
          const expected = this.mechaPlanV131.destructibleSceneryV130.find(item => item.id === value.id);
          return !expected || !inRange(value.hp, 0, expected.hp) || value.destroyed !== (value.hp <= 0);
        })) return { valid: false, reason: 'mecha-arena-inconsistent' };
      return { valid: true, state: { ...clone(state), systems: systems.state } };
    }

    applyResumeState(raw) {
      if (!this.isMechaMissionV131()) return super.applyResumeState(raw);
      const checked = this.validateMechaResumeV131(raw);
      if (!checked.valid) return { applied: false, restored: 0, reason: checked.reason, specialOperationRestored: false };
      const previousState = this.mechaMissionV131, previousEnemies = this.enemies, previousVehicle = this.vehicle;
      const restoredState = createState(this.campaign);
      for (const key of Object.keys(restoredState)) if (checked.state[key] !== undefined) restoredState[key] = clone(checked.state[key]);
      this.mechaMissionV131 = restoredState; this.vehicle = this.buildMechaVehicleV131(checked.state.vehicle.x);
      this.enemies = checked.state.enemies.map(saved => {
        const actor = saved.boss ? bossActor(this.mechaPlanV131)
          : this.createEnemy(ENEMIES.find(profile => profile.id === saved.profileId), Number(saved.id.match(/wave-(\d+)/)?.[1]) || 0, saved.x, this.mechaPlanV131.mechaMissionV131.floorY);
        Object.assign(actor, { id: saved.id, x: saved.x, y: saved.y, health: saved.health, alive: saved.alive });
        if (saved.boss) Object.assign(actor, { bossV131: clone(saved.bossState), staggerClock: saved.staggerClock,
          statusClock: saved.statusClock, statusEffect: saved.statusEffect });
        else Object.assign(actor, { mechaWaveV131: true, mechaProfileIdV131: saved.profileId, maxHealth: checked.state.route === 'red' ? 96 : 72, damage: 13 });
        return actor;
      });
      const result = super.applyResumeState(raw);
      if (!result?.applied) { this.mechaMissionV131 = previousState; this.enemies = previousEnemies; this.vehicle = previousVehicle; return result; }
      Object.assign(this.vehicle, checked.state.vehicle);
      this.bullets = checked.state.bullets.map(bullet => ({ ...bullet, owner: this.player, mechaV131: true, hit: false, remainingPenetration: 0, maxHits: 1, hitEnemyIds: new Set(), armorBypass: 0.35 }));
      this.hostileProjectiles = checked.state.hostiles.map(projectile => ({ ...projectile, hit: false }));
      const checkpoint = raw.specialOperation.mechaCheckpointV131;
      if (checkpoint && this.validateMechaResumeV131(checkpoint).valid) { this.mechaCheckpointV131 = clone(checkpoint); delete this.mechaCheckpointV131.specialOperation.mechaCheckpointV131; }
      this.mechaMenuKeysV131 = new Set(); this.mechaPendingCheckpointV131 = null;
      this.syncMechaWorldV131(); this.refreshSpriteCollisionProfiles();
      return { ...result, specialOperationRestored: true, restored: result.restored + 1 };
    }
    restartFromCheckpoint() {
      if (!this.isMechaMissionV131()) return super.restartFromCheckpoint();
      if (this.mission.state !== 'failed' || !this.mechaCheckpointV131) return false;
      const raw = clone(this.mechaCheckpointV131); raw.mission.state = 'active'; raw.mission.failureReason = ''; raw.mission.retries = this.mission.retries + 1;
      raw.inventory.salvage = Math.max(0, Math.min(raw.inventory.salvage, this.inventory.salvage) - 20);
      const result = this.applyResumeState(raw);
      if (!result.applied) return false;
      this.clearGameplayInput(); this.onEvent?.({ type: 'mission-restarted', operationId: this.mechaMissionV131.operationId, salvagePenalty: 20 }); return true;
    }

    phaseLabel() { return this.isMechaMissionV131() ? phaseTitles[this.mechaMissionV131.phase] : super.phaseLabel(); }
    objectiveProgressText() {
      if (!this.isMechaMissionV131()) return super.objectiveProgressText();
      const state = this.mechaMissionV131;
      if (state.phase === 'hangar') return 'A/D : Atlas, Vulcain, Cerbère, Méduse · E : entrer dans le prototype.';
      if (state.phase === 'route') return 'W : ruche rouge · S : ruche noire · E : engager le siège.';
      if (state.phase === 'tutorial') return 'F : panneau de canon · C : bloc hydraulique · A/D : marcher · E : réparer · R : refroidir.';
      if (state.phase === 'siege') return `SIÈGE ${state.wave}/3 · Éliminer les contacts, dégager les panneaux. R : gel de refroidissement.`;
      if (state.phase === 'finish') return 'Cœur exposé : rapprocher le prototype, E pour l’exécution mécanique (12 énergie).';
      if (state.phase === 'extract') return 'Rejoindre le sas de récupération à droite et maintenir E pendant 2 secondes.';
      return 'F : canon · C : hydraulique · R : refroidissement · E : réparation · V : sortie de secours.';
    }
    getInteractionPrompt() { return this.isMechaMissionV131() ? this.objectiveProgressText() : super.getInteractionPrompt(); }
    getSnapshot() {
      const base = super.getSnapshot();
      if (!this.isMechaMissionV131()) return base;
      const state = this.mechaMissionV131;
      return { ...base, mechaV131: { ...clone(state), artStatus: MECHA_ART_STATUS_V131, menu: this.mechaMissionMenuV131(),
        localPlayers: 1, vehicleId: this.vehicle?.id || null, title: phaseTitles[state.phase], instruction: this.objectiveProgressText(),
        boss: this.enemies?.find(enemy => enemy.mechaBossV131) ? (() => { const boss = this.enemies.find(enemy => enemy.mechaBossV131);
          return { id: boss.id, health: boss.health, maxHealth: boss.maxHealth, alive: boss.alive, ...clone(boss.bossV131) }; })() : null } };
    }

    drawVehicle(ctx) {
      if (!this.isMechaMissionV131()) return super.drawVehicle(ctx);
      drawMechaPrototypeV131(ctx, this.vehicle, this.mechaMissionV131.systems, this.animationTime);
    }
    drawEnemy(ctx, enemy) {
      if (!this.isMechaMissionV131() || !enemy.mechaBossV131) return super.drawEnemy(ctx, enemy);
      const { x, y, w, h } = enemy;
      ctx.save(); ctx.globalAlpha = enemy.alive ? 1 : Math.max(0, enemy.deathClock / 3);
      ctx.fillStyle = '#24373a'; ctx.fillRect(x + w * 0.22, y + h * 0.28, w * 0.55, h * 0.48);
      ctx.fillStyle = '#506366'; ctx.fillRect(x + w * 0.1, y + h * 0.07, w * 0.7, h * 0.23);
      ctx.fillStyle = '#18312d'; ctx.fillRect(x + w * 0.15, y + h * 0.77, w * 0.22, h * 0.23);
      ctx.fillRect(x + w * 0.64, y + h * 0.72, w * 0.22, h * 0.28);
      ctx.strokeStyle = enemy.bossV131.windup > 0 ? '#eb935f' : '#789492'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(x + w * 0.28, y + h * 0.34); ctx.lineTo(x - w * 0.08, y + h * 0.65);
      ctx.moveTo(x + w * 0.65, y + h * 0.36); ctx.lineTo(x + w * 1.06, y + h * 0.66); ctx.stroke();
      ctx.fillStyle = this.mechaMissionV131.finishReady ? '#ddec9b' : '#8eaa81'; ctx.fillRect(x + w * 0.41, y + h * 0.44, w * 0.18, h * 0.16);
      ctx.fillStyle = '#789491';
      for (let i = 0; i < 5; i++) ctx.fillRect(x + w * (0.15 + i * 0.12), y - 8 - i % 2 * 8, 10, h * 0.12);
      if (enemy.bossV131.windup > 0) {
        ctx.strokeStyle = '#e9b378'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h * 0.3); ctx.lineTo(enemy.bossV131.targetX, enemy.bossV131.targetY); ctx.stroke();
      }
      ctx.restore();
    }
    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isMechaMissionV131()) return;
      const plan = this.mechaPlanV131.mechaMissionV131;
      ctx.save(); ctx.font = '700 13px monospace';
      if (!isTitan(this.campaign) && this.mechaMissionV131.route === 'black' && this.mechaMissionV131.phase !== 'hangar') {
        ctx.fillStyle = '#869b49'; for (const x of [2020, 2780]) ctx.fillRect(x, plan.floorY - 6, 170, 6);
      }
      for (const station of [plan.hangar, plan.maintenance, plan.extraction]) {
        ctx.fillStyle = '#244c49'; ctx.fillRect(station.x, station.y, station.w, station.h);
        ctx.strokeStyle = '#92bab1'; ctx.strokeRect(station.x, station.y, station.w, station.h);
        ctx.fillStyle = '#d7e2c8'; ctx.fillText(station === plan.hangar ? 'HANGAR' : station === plan.maintenance ? 'MAINT.' : 'RETOUR', station.x + 6, station.y + 18);
      }
      if (this.mechaMissionV131.mounted && this.player.aimingV124 && this.player.combatAimV83) {
        const aim = this.player.combatAimV83, muzzle = this.resolvePlayerMuzzleV124(this.player, aim);
        const travel = { x: aim.x * 230, y: aim.y * 230 };
        const contact = firstProjectileObstacleV83({ ...muzzle, w: 2, h: 2 }, travel, { walls: this.walls, doors: this.doors, platforms: this.platforms });
        const fraction = contact ? contact.t : 1;
        ctx.strokeStyle = contact ? '#dfaf74' : '#99cfc6'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.moveTo(muzzle.x, muzzle.y); ctx.lineTo(muzzle.x + travel.x * fraction, muzzle.y + travel.y * fraction); ctx.stroke();
      }
      ctx.restore();
    }
    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isMechaMissionV131()) return;
      const state = this.mechaMissionV131, systems = state.systems;
      ctx.save(); ctx.fillStyle = '#0a151bf2'; ctx.fillRect(18, 112, 1238, 103);
      ctx.font = '700 13px monospace'; ctx.fillStyle = '#d5e3cc';
      ctx.fillText(`${this.campaign.name} · ${phaseTitles[state.phase]} · ${MECHA_LOADOUTS_V131[state.loadoutId].name.toUpperCase()}`, 32, 132);
      ctx.font = '12px monospace'; ctx.fillText(this.objectiveProgressText(), 32, 153);
      ctx.fillStyle = systems.overheated ? '#f4a875' : '#a9cec4';
      ctx.fillText(`COQUE ${Math.ceil(systems.hull)}/${systems.maxHull} · ÉNERGIE ${Math.floor(systems.energy)} · CHALEUR ${Math.floor(systems.heat)}${systems.overheated ? ' SURCHAUFFE' : ''} · CORROSION ${Math.floor(systems.corrosion)} · GEL ${systems.coolant} · RÉPARATIONS ${systems.repairKits}`, 32, 174);
      ctx.fillStyle = '#c3c9ac'; ctx.fillText(`COCKPIT ${Math.ceil(systems.systems.cockpit)} · RÉACTEUR ${Math.ceil(systems.systems.reactor)} · HYDRAULIQUE ${Math.ceil(systems.systems.hydraulics)} · BRAS G/D ${Math.ceil(systems.systems.leftArm)}/${Math.ceil(systems.systems.rightArm)} · ART ORIGINAL DE PROTOTYPE`, 32, 195);
      const boss = this.enemies.find(enemy => enemy.mechaBossV131 && enemy.alive);
      if (boss) {
        ctx.fillStyle = '#0e181be8'; ctx.fillRect(280, 230, 720, 31); ctx.fillStyle = '#aebca2';
        ctx.fillRect(288, 250, 704 * boss.health / boss.maxHealth, 4); ctx.fillText(`${boss.name} · PHASE ${boss.bossV131.phase + 1}/${this.mechaPlanV131.mechaMissionV131.boss.phases}${boss.bossV131.windup > 0 ? ` · ${boss.bossV131.attack.toUpperCase()}` : ''}`, 291, 244);
      }
      ctx.restore();
    }
  };
}
