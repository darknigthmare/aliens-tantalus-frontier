import { LEVEL_SEEDS } from './content-core-v50.js';
import { requestArbiterSceneryV190, drawArbiterBackdropV190, drawArbiterForegroundV190 } from './xeno-arbiter-scenery-v190.js';
import { buildMissionLevelV52, validateMissionTopologyV52, validateMissionPhysicalTopologyV57 } from './mission-levels-v52.js';
import { ARBITER_CAMPAIGNS_V190, getArbiterMissionV190, arbiterCampaignAccessV190,
  createArbiterMissionStateV190, validateArbiterMissionStateV190, createArbiterReceiptV190,
  arbiterMissionDossierV190 } from './xeno-arbiter-campaign-v190.js';
const clone = value => structuredClone(value);
const near = (actor, station, radius = 72) => Boolean(actor && station && Math.hypot(
  actor.x + actor.w / 2 - station.x, actor.y + actor.h - station.groundY) <= radius);
const WIDTH = 2240, FLOOR = 570, GATE_X = 1870;

/** A physically connected ground route and optional two-ladder service route.
 * Stations sit on the lower route; no graph-only vertical shortcut is required. */
export function buildArbiterMissionV190(options = {}) {
  const mission = getArbiterMissionV190(options.campaign?.id || options.campaign || ARBITER_CAMPAIGNS_V190[0].id);
  if (!mission) throw new Error('Unknown ARBITER campaign.');
  const campaign = ARBITER_CAMPAIGNS_V190[mission.index];
  const original = buildMissionLevelV52({ ...options, campaign, levelSeeds: options.levelSeeds || LEVEL_SEEDS, templateId: 'colony-multiroute' });
  const zoneId = 'arbiter-local';
  const platforms = [{ id: 'arbiter-floor', x: 0, y: FLOOR, w: WIDTH, h: 42, floor: true, art: 'floor', zoneId },
    { id: 'arbiter-service', x: 600, y: 355, w: 920, h: 22, floor: false, art: 'grate', zoneId }];
  const ladders = [650, 1430].map((x, index) => ({ id: `arbiter-ladder-${index}`, x, y: 355,
    top: 355, bottom: FLOOR, w: 42, h: 237, kind: 'ladder' }));
  const doors = [{ id: 'arbiter-return-gate', x: GATE_X, y: 0, w: 52, h: FLOOR, kind: 'gate',
    visualRole: 'pressure-airlock', lockedBy: 'arbiter-v190', open: false, progress: 0, levelLocked: true }];
  const nodes = [['spawn', 120, FLOOR], ['west', 671, FLOOR], ['east', 1451, FLOOR], ['extract', 2110, FLOOR],
    ['upper-west', 671, 355], ['upper-east', 1451, 355]].map(([id, x, y]) => ({ id, x, y, zoneId, width: 250 }));
  const edges = [['spawn', 'west', 'walk'], ['west', 'east', 'walk'], ['east', 'extract', 'walk'],
    ['west', 'upper-west', 'ladder'], ['upper-west', 'upper-east', 'walk'], ['upper-east', 'east', 'ladder']]
    .map(([from, to, kind], index) => ({ id: `arbiter-edge-${index}`, from, to, kind, routeIds: [] }));
  const routes = [{ id: 'arbiter-ground', role: 'evidence-route', nodeIds: ['spawn', 'west', 'east', 'extract'] },
    { id: 'arbiter-service', role: 'service-return', nodeIds: ['spawn', 'west', 'upper-west', 'upper-east', 'east', 'extract'] }];
  const anchors = { spawn: { nodeId: 'spawn', x: 120, y: FLOOR, zoneId },
    extraction: { nodeId: 'extract', x: 2110, y: FLOOR, zoneId },
    'objective-primary': { nodeId: 'west', x: 671, y: FLOOR, zoneId } };
  const plan = { ...original, label: campaign.name, signature: `${original.signature}:${mission.id}-v190`,
    dimensions: { width: WIDTH, height: 650 }, graph: { nodes, edges, routes }, anchors,
    geometry: { platforms, ladders, doors, vents: [] }, hazards: [], aquaticHabitats: [], events: [], spawns: [],
    biomeZones: [{ id: zoneId, label: mission.location, x: 0, w: WIDTH, biome: 'industrial',
      layers: { far: 'arbiter-existing-colony-far', mid: 'arbiter-existing-colony-mid', foreground: 'arbiter-existing-colony-foreground' },
      visual: { tint: ['#23454a', '#322c3c', '#3c3430', '#293e39', '#253f46', '#27423c'][mission.index], fog: .08 } }],
    routeRuntime: { ...original.routeRuntime, source: 'arbiter-mission-v190', platforms, ladders, hazards: [],
      routeNodes: nodes, verticalSpan: 215, maxTier: 2, routes: 2, routeSpan: WIDTH },
    arbiterMissionV190: { schema: 190, campaignId: mission.campaignId, operationId: mission.id,
      stations: clone(mission.stations), extraction: clone(mission.extraction), provenance: 'tantalus-project-original' } };
  const topology = validateMissionTopologyV52(plan), physical = validateMissionPhysicalTopologyV57(plan);
  const errors = [...topology.errors, ...physical.errors];
  if (errors.length) throw new Error(`Invalid ARBITER level: ${errors.join('; ')}`);
  plan.validation = { ...original.validation, ...topology, valid: true, physicalValid: true, errors: [],
    physicalLadderCount: physical.ladderCount, physicalHazardCount: 0, arbiterV190: true,
    roomCoherenceValid: false, roomCoherenceReason: 'Original local investigation, two routes and runtime-owned return gate; no franchise architectural certification.' };
  return plan;
}

export function withArbiterCampaignRuntimeV190(BaseEngine) {
  if (BaseEngine.arbiterCampaignRuntimeV190 === true) return BaseEngine;
  return class ArbiterCampaignRuntimeV190 extends BaseEngine {
    static arbiterCampaignRuntimeV190 = true;
    start(options = {}) {
      this.arbiterSceneryRequestV190?.cancel();
      this.arbiterSceneryGenerationV190 = (this.arbiterSceneryGenerationV190 || 0) + 1;
      const sceneryGeneration = this.arbiterSceneryGenerationV190;
      this.arbiterSceneryImagesV190?.clear(); this.arbiterSceneryImagesV190 = new Map();
      this.arbiterSceneryDrawV190 = { rear: null, front: null }; this.arbiterSceneryRequestV190 = null;
      const mission = getArbiterMissionV190(options.campaign?.id);
      this.arbiterV190 = null; this.arbiterManifestV190 = null; this.arbiterCheckpointV190 = null; this.arbiterDeploymentIdV190 = null;
      if (!mission) return super.start(options);
      if (!arbiterCampaignAccessV190(options.arbiterProgressV190, mission.campaignId).available) throw new Error('ARBITER requires the previous extracted evidence.');
      if (!options.missionLevel?.validation?.valid || options.missionLevel?.arbiterMissionV190?.campaignId !== mission.campaignId
        || typeof options.missionLevel?.signature !== 'string' || !options.missionLevel.signature.endsWith(`:${mission.id}-v190`)) throw new Error('ARBITER requires buildArbiterMissionV190.');
      this.arbiterDeploymentIdV190 = typeof options.operationId === 'string'
        && new RegExp(`^operation-[1-9][0-9]{0,8}-${mission.campaignId}$`).test(options.operationId) ? options.operationId : null;
      this.arbiterManifestV190 = mission;
      this.arbiterV190 = createArbiterMissionStateV190(mission.campaignId);
      super.start({ ...options, resumeState: undefined, vehicle: null, crew: [], squad: [], userCasteCampaignV88: false,
        neuroProfile: null, apexDossier: null, destructibleSceneryV130: false });
      this.configureArbiterWorldV190(options.missionLevel);
      this.arbiterSceneryRequestV190 = requestArbiterSceneryV190(this.arbiterSceneryImagesV190, mission.campaignId, {
        isActive: () => this.running && this.arbiterSceneryGenerationV190 === sceneryGeneration
          && this.arbiterManifestV190?.campaignId === mission.campaignId
      });
      if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      this.syncArbiterWorldV190(); this.arbiterCheckpointV190 ||= this.captureArbiterCheckpointV190();
      this.onEvent?.({ type: 'arbiter-radio-v190', operationId: mission.id, text: mission.summary });
      return this.getSnapshot();
    }
    stop() {
      this.arbiterSceneryGenerationV190 = (this.arbiterSceneryGenerationV190 || 0) + 1;
      this.arbiterSceneryRequestV190?.cancel(); this.arbiterSceneryRequestV190 = null;
      this.arbiterSceneryImagesV190?.clear(); this.arbiterSceneryDrawV190 = { rear: null, front: null };
      return super.stop();
    }
    isArbiterMissionV190() { return Boolean(this.arbiterV190 && this.arbiterManifestV190); }
    canArbiterActV190(actor = this.player) {
      return Boolean(this.isArbiterMissionV190() && this.canPerformGameplayAction(actor) && actor === this.player
        && !actor.inVehicle && !actor.climbing && actor.grounded && Math.abs(actor.vx || 0) < 24);
    }
    configureArbiterWorldV190(plan) {
      this.platforms = clone(plan.geometry.platforms); this.ladders = clone(plan.geometry.ladders); this.doors = clone(plan.geometry.doors);
      this.missionLevelBounds = { width: WIDTH, height: 650, voidY: 760 };
      for (const key of ['enemies', 'bullets', 'hostileProjectiles', 'drops', 'squadActors', 'walls', 'lifts', 'covers',
        'hazards', 'vents', 'supplies', 'objectiveNodes', 'collectablesV68', 'narrativeCollectablesV68']) this[key] = [];
      this.powerNode = null; this.archiveTerminal = null; this.ventShortcut = null;
      if (this.weaponPickup) this.weaponPickup.taken = true; if (this.toolPickup) this.toolPickup.taken = true;
      this.vehicle.active = false; this.vehicle.occupied = false; this.vehicle.driver = null;
      this.player.x = 90; this.player.y = FLOOR - this.player.h; this.player.vx = 0; this.player.vy = 0;
      this.player.inVehicle = false; this.player.grounded = true; this.player.facing = 1;
      this.coopEnabled = false; this.objective = { id: 'arbiter-return', x: 2070, y: 440, w: 80, h: 130, complete: false };
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear();
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear();
      this.missionLevelExtractionTimer = null; this.camera.x = 0; this.camera.y = 0;
    }
    syncArbiterWorldV190() {
      if (!this.isArbiterMissionV190() || !this.mission) return;
      const state = this.arbiterV190, ready = state.stage === this.arbiterManifestV190.stations.length;
      this.mission.phase = state.complete ? 'complete' : ready ? 'extract' : 'investigate';
      this.mission.objectives = { power: ready, route: ready, boss: true, archive: ready, extract: state.complete };
      const gate = this.doors.find(door => door.id === 'arbiter-return-gate');
      if (gate) { gate.open = ready; gate.levelLocked = !ready; if (!ready) gate.progress = 0; }
      if (this.objective) this.objective.complete = state.complete;
      this.coopEnabled = false;
    }
    setCoop(enabled) { return super.setCoop(this.isArbiterMissionV190() ? false : enabled); }
    toggleVehicle(actor) { return this.isArbiterMissionV190() ? false : super.toggleVehicle(actor); }
    updateObjectiveRuntime(delta) { if (!this.isArbiterMissionV190()) return super.updateObjectiveRuntime(delta); }
    updateMissionPhase() { if (!this.isArbiterMissionV190()) return super.updateMissionPhase(); this.syncArbiterWorldV190(); }
    missingArbiterRequirementV190() {
      return this.arbiterV190?.stage === this.arbiterManifestV190?.stations.length ? '' : 'PREUVES LOCALES ET SCELLÉS REQUIS';
    }
    missingObjectiveRequirement(options) { return this.isArbiterMissionV190() ? this.missingArbiterRequirementV190() : super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.isArbiterMissionV190() ? this.missingArbiterRequirementV190() : super.missingExtractionRequirement(); }
    doorRequirement(door) { return this.isArbiterMissionV190() && door?.lockedBy === 'arbiter-v190' ? door.levelLocked ? 'PREUVES LOCALES REQUISES' : '' : super.doorRequirement(door); }
    getDoorRenderState(door, options) {
      const render = super.getDoorRenderState(door, options);
      return this.isArbiterMissionV190() && door?.id === 'arbiter-return-gate'
        ? { ...render, x: door.x, y: door.y, w: door.w, h: door.h } : render;
    }
    interact(actor = this.player) {
      if (!this.isArbiterMissionV190()) return super.interact(actor);
      if (!this.canArbiterActV190(actor)) return false;
      const state = this.arbiterV190, station = this.arbiterManifestV190.stations[state.stage];
      return near(actor, station || this.arbiterManifestV190.extraction);
    }
    update(delta) {
      if (!this.isArbiterMissionV190()) return super.update(delta);
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88 || this.mission?.state !== 'active') return;
      if (!this.player?.alive) { this.failMission('Récupération ARBITER interrompue.'); return; }
      const seconds = Number(delta); if (!Number.isFinite(seconds) || seconds <= 0) return;
      const dt = Math.min(seconds, .1), state = this.arbiterV190, mission = this.arbiterManifestV190;
      // Physics owns approach, support, speed and the hold: no UI command can
      // advance the investigation from outside the authored station radius.
      super.update(dt);
      const station = mission.stations[state.stage];
      if (station && !near(this.player, station)) state.channelProgress = 0;
      if (!near(this.player, mission.extraction)) state.exitProgress = 0;
      if (!this.canArbiterActV190()) return;
      if (station && near(this.player, station) && this.keys.has('KeyE')) {
        state.channelProgress = Math.min(station.seconds, state.channelProgress + dt);
        if (state.channelProgress >= station.seconds) {
          state.completedStationIds.push(station.id); state.stage++; state.channelProgress = 0;
          this.syncArbiterWorldV190(); this.arbiterMilestoneV190(station);
        }
      }
      if (!station && near(this.player, mission.extraction) && this.keys.has('KeyE')) {
        state.exitProgress = Math.min(2, state.exitProgress + dt);
        if (state.exitProgress >= 2) this.completeMission(this.player);
      } else if (!state.complete) state.exitProgress = 0;
      this.player.x = Math.max(0, Math.min(WIDTH - this.player.w, this.player.x));
      this.camera.x = Math.max(0, Math.min(WIDTH - 1280, this.camera.x)); this.camera.y = 0;
    }
    arbiterMilestoneV190(station) {
      this.checkpoint = { id: `arbiter-${station.id}`, x: this.player.x, y: this.player.y };
      this.arbiterCheckpointV190 = this.captureArbiterCheckpointV190();
      this.onEvent?.({ type: 'arbiter-radio-v190', operationId: this.arbiterManifestV190.id, id: station.id, text: station.text });
      this.onEvent?.({ type: 'checkpoint', checkpoint: this.checkpoint.id, operationId: this.arbiterManifestV190.id });
    }
    completeMission(actor = this.player) {
      if (!this.isArbiterMissionV190()) return super.completeMission(actor);
      const state = this.arbiterV190;
      if (!this.canArbiterActV190(actor) || state.complete || this.missingArbiterRequirementV190()
        || state.exitProgress !== 2 || !near(actor, this.arbiterManifestV190.extraction)) return false;
      // Set the complete evidence before the synchronous mission-complete sink
      // captures the durable snapshot and resolves strategic rewards.
      state.complete = true; state.receipt = createArbiterReceiptV190(this.arbiterManifestV190); this.syncArbiterWorldV190();
      const result = super.completeMission(actor);
      if (!result) { state.complete = false; state.receipt = null; this.syncArbiterWorldV190(); }
      return result;
    }
    captureArbiterCheckpointV190() {
      const raw = this.captureResumeState(); if (raw.arbiterMissionV190) delete raw.arbiterMissionV190.checkpoint;
      return clone(raw);
    }
    captureResumeState() {
      const raw = super.captureResumeState(); if (!this.isArbiterMissionV190()) return raw;
      return { ...raw, arbiterMissionV190: { state: clone(this.arbiterV190), deploymentId: this.arbiterDeploymentIdV190, body: { width: this.player.w, height: this.player.h },
        checkpoint: this.arbiterCheckpointV190 ? clone(this.arbiterCheckpointV190) : null } };
    }
    validateArbiterResumeV190(raw) {
      const checked = validateArbiterMissionStateV190(raw?.arbiterMissionV190?.state, this.arbiterManifestV190?.campaignId);
      if (!checked.valid) return checked;
      const state = checked.state, id = raw.identity, gate = raw.missionLevel?.doors?.find(door => door.id === 'arbiter-return-gate');
      const ready = state.stage === this.arbiterManifestV190.stations.length;
      const body = { ...raw.player, w: this.player.w, h: this.player.h };
      if (raw.arbiterMissionV190.deploymentId !== this.arbiterDeploymentIdV190
        || raw.arbiterMissionV190.body?.width !== this.player.w || raw.arbiterMissionV190.body?.height !== this.player.h || raw.schema !== 1 || !id || ['campaignId', 'worldId', 'levelSeedId', 'objectiveId', 'editorProjectKind'].some(key => id[key] !== this.resumeIdentity?.[key])
        || Number(id.seed) !== Number(this.resumeIdentity?.seed) || raw.missionLevel?.signature !== this.missionLevelRuntime?.signature
        || !['active', 'failed', 'complete'].includes(raw.mission?.state) || (raw.mission.state === 'complete') !== state.complete
        || !Array.isArray(raw.enemies) || raw.enemies.length || raw.vehicle?.active || raw.player?.inVehicle
        || !Number.isFinite(raw.player?.x) || raw.player.x < 0 || raw.player.x > WIDTH - this.player.w
        || !Number.isFinite(raw.player?.y) || raw.player.y < 0 || raw.player.y > FLOOR
        || !ready && raw.player.x + this.player.w > GATE_X + 1
        || !gate || gate.open !== ready || gate.levelLocked !== !ready
        || !Number.isFinite(gate.progress) || gate.progress < 0 || gate.progress > 1 || !ready && gate.progress !== 0
        || state.channelProgress > 0 && !near(body, this.arbiterManifestV190.stations[state.stage])
        || state.exitProgress > 0 && !near(body, this.arbiterManifestV190.extraction)
        || state.complete && (raw.player.alive !== true || raw.player.downed !== false))
        return { valid: false, reason: 'arbiter-resume-identity-mismatch' };
      return checked;
    }
    applyResumeState(raw) {
      if (!this.isArbiterMissionV190()) return super.applyResumeState(raw);
      const checked = this.validateArbiterResumeV190(raw); if (!checked.valid) return { applied: false, reason: checked.reason };
      const previous = this.arbiterV190; this.arbiterV190 = checked.state;
      const result = super.applyResumeState(raw);
      if (!result?.applied) { this.arbiterV190 = previous; return result; }
      const checkpoint = raw.arbiterMissionV190?.checkpoint;
      if (checkpoint && this.validateArbiterResumeV190(checkpoint).valid) {
        this.arbiterCheckpointV190 = clone(checkpoint); delete this.arbiterCheckpointV190.arbiterMissionV190.checkpoint;
      }
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear();
      this.clearGameplayInput?.(); this.syncArbiterWorldV190(); this.refreshSpriteCollisionProfiles?.();
      return { ...result, arbiterMissionRestoredV190: true };
    }
    restartFromCheckpoint() {
      if (!this.isArbiterMissionV190()) return super.restartFromCheckpoint();
      if (this.mission?.state !== 'failed' || !this.arbiterCheckpointV190) return false;
      const raw = clone(this.arbiterCheckpointV190); raw.mission.state = 'active'; raw.mission.failureReason = null;
      raw.mission.retries = this.mission.retries + 1;
      const result = this.applyResumeState(raw); if (!result.applied) return false;
      this.onEvent?.({ type: 'mission-restarted', operationId: this.arbiterManifestV190.id }); return true;
    }
    phaseLabel() { return this.isArbiterMissionV190() ? arbiterMissionDossierV190(this.arbiterV190).title : super.phaseLabel(); }
    objectiveProgressText() { return this.isArbiterMissionV190() ? arbiterMissionDossierV190(this.arbiterV190).instruction : super.objectiveProgressText(); }
    getInteractionPrompt(actor = this.player) {
      if (!this.isArbiterMissionV190()) return super.getInteractionPrompt(actor);
      if (actor !== this.player) return '';
      const state = this.arbiterV190, station = this.arbiterManifestV190.stations[state.stage];
      if (station && near(this.player, station)) return `MAINTENIR E · ${station.label} · ${state.channelProgress.toFixed(1)}/${station.seconds} S`;
      if (near(this.player, this.arbiterManifestV190.extraction)) return station ? 'PREUVES LOCALES REQUISES' : `MAINTENIR E · RETOUR · ${state.exitProgress.toFixed(1)}/2 S`;
      return '';
    }
    missionLocalZoneV121() {
      return this.isArbiterMissionV190() ? { id: this.arbiterManifestV190.id, label: this.arbiterManifestV190.location, biome: 'industrial' } : super.missionLocalZoneV121();
    }
    missionNavigationMapV121() {
      if (!this.isArbiterMissionV190()) return super.missionNavigationMapV121();
      const station = this.arbiterManifestV190.stations[this.arbiterV190.stage] || this.arbiterManifestV190.extraction;
      return { mode: 'local', label: 'PLAN LOCAL · ARBITER', width: WIDTH, minY: 300, maxY: 620,
        surfaces: this.platforms.map(entry => ({ id: entry.id, x: entry.x, end: entry.x + entry.w, y: entry.y })),
        ladders: this.ladders.map(entry => ({ id: entry.id, x: entry.x, top: entry.top, bottom: entry.bottom })),
        goals: [{ id: station.id, x: station.x, y: station.groundY }],
        player: { x: this.player.x + this.player.w / 2, y: this.player.y + this.player.h } };
    }
    getSnapshot() {
      const snapshot = super.getSnapshot(); if (!this.isArbiterMissionV190()) return snapshot;
      return { ...snapshot, arbiterV190: clone(this.arbiterV190), arbiterSceneryV190: clone(this.arbiterSceneryDrawV190), arbiterDossierV190: arbiterMissionDossierV190(this.arbiterV190),
        arbiterLayoutV190: { stations: clone(this.arbiterManifestV190.stations), extraction: clone(this.arbiterManifestV190.extraction) } };
    }
    getGameplayReport() {
      const report = super.getGameplayReport(); return this.isArbiterMissionV190() ? { ...report, arbiterV190: clone(this.arbiterV190) } : report;
    }
    drawBackdrop(ctx) {
      if (this.isArbiterMissionV190()) {
        const receipt = drawArbiterBackdropV190(ctx, this.arbiterManifestV190.campaignId, this.arbiterSceneryImagesV190, this.camera, {
          width: 1280, height: 720, floor: FLOOR, reducedMotion: Boolean(this.reducedMotion || this.accessibilityRuntime?.reducedMotion)
        });
        this.arbiterSceneryDrawV190.rear = receipt;
        if (receipt) return receipt;
      }
      return super.drawBackdrop(ctx);
    }
    drawForeground(ctx) {
      if (this.isArbiterMissionV190()) {
        const receipt = drawArbiterForegroundV190(ctx, this.arbiterManifestV190.campaignId, this.arbiterSceneryImagesV190, this.camera, {
          width: 1280, height: 720, floor: FLOOR, reducedMotion: Boolean(this.reducedMotion || this.accessibilityRuntime?.reducedMotion)
        });
        this.arbiterSceneryDrawV190.front = receipt;
        if (receipt) return receipt;
      }
      return super.drawForeground(ctx);
    }
    drawWorld(ctx) {
      if (this.isArbiterMissionV190()) this.drawArbiterPropsV190(ctx);
      return super.drawWorld(ctx);
    }
    drawArbiterPropsV190(ctx) {
      ctx.save(); const state = this.arbiterV190;
      for (const [index, station] of this.arbiterManifestV190.stations.entries()) {
        const selected = index === state.stage, done = index < state.stage;
        ctx.fillStyle = '#152427'; ctx.strokeStyle = selected ? '#e6bd74' : done ? '#72a48c' : '#43585b'; ctx.lineWidth = 2;
        if (station.kind === 'body') {
          // A covered, inert human silhouette, never a live actor or enemy body.
          ctx.fillStyle = '#393d3a'; ctx.beginPath(); ctx.ellipse(station.x - 28, FLOOR - 12, 55, 11, -.08, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#1d2527'; ctx.fillRect(station.x + 26, FLOOR - 31, 36, 27); ctx.strokeRect(station.x + 26, FLOOR - 31, 36, 27);
        } else {
          ctx.fillRect(station.x - 25, FLOOR - 62, 50, 60); ctx.strokeRect(station.x - 25, FLOOR - 62, 50, 60);
          ctx.fillStyle = selected ? '#b0cec6' : '#456560'; ctx.fillRect(station.x - 18, FLOOR - 53, 36, 22);
        }
        ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = selected ? '#e6bd74' : '#a1b7af';
        ctx.fillText(station.label, station.x, FLOOR - 78, 300);
        if (selected && state.channelProgress > 0) { ctx.fillStyle = '#78b8a8'; ctx.fillRect(station.x - 26, FLOOR - 71, 52 * state.channelProgress / station.seconds, 4); }
      }
      const exit = this.arbiterManifestV190.extraction; ctx.strokeStyle = '#81ab9f'; ctx.strokeRect(exit.x - 35, FLOOR - 110, 70, 108);
      ctx.fillStyle = '#abc9bd'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.fillText('RETOUR · SAS', exit.x, FLOOR - 121);
      ctx.restore();
    }
  };
}
