import { buildMissionLevelV52 } from './mission-levels-v52.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122, ARCHIVE_RELAY_OPERATION_V122, ARCHIVE_RELAY_DOCUMENTS_V122,
  createArchiveRelayStateV122, sanitizeArchiveRelayStateV122, validateArchiveRelayStateV122,
  archiveRelayPhaseV122, archiveRelayDossierV122, archiveRelayReaderModelV122 } from './archive-relay-state-v122.js';
export { ARCHIVE_RELAY_CAMPAIGN_V122 } from './archive-relay-state-v122.js';
export const ARCHIVE_RELAY_PROPS_V122 = Object.freeze({
  pda: Object.freeze({ x: 140, groundY: 570 }), relay: Object.freeze({ x: 330, groundY: 570 }),
  engineering: Object.freeze({ x: 570, groundY: 355 }), security: Object.freeze({ x: 880, groundY: 355 }),
  freight: Object.freeze({ x: 1010, groundY: 570 }), analysis: Object.freeze({ x: 1150, groundY: 570 }),
  extraction: Object.freeze({ x: 1680, groundY: 570 })
});
const clone = value => structuredClone(value);
const near = (actor, prop, radius = 70) => Boolean(actor && prop && Math.hypot(
  actor.x + actor.w / 2 - prop.x, actor.y + actor.h - prop.groundY) <= radius);
export function buildArchiveRelayLevelV122(options = {}) {
  const plan = buildMissionLevelV52({ ...options, campaign: options.campaign || ARCHIVE_RELAY_CAMPAIGN_V122, templateId: 'colony-multiroute' });
  return { ...plan, label: 'QZ-18 · Le dernier relais', signature: `${plan.signature}:archive-relay-v122` };
}
export function withArchiveRelayRuntimeV122(BaseEngine) {
  if (BaseEngine.archiveRelayRuntimeV122 === true) return BaseEngine;
  return class ArchiveRelayRuntimeV122 extends BaseEngine {
    static archiveRelayRuntimeV122 = true;
    start(options = {}) {
      this.archiveRelayActiveV122 = options.campaign?.id === ARCHIVE_RELAY_CAMPAIGN_V122.id;
      this.archiveRelayV122 = this.archiveRelayActiveV122 ? createArchiveRelayStateV122() : null;
      this.archiveRelayCheckpointV122 = null; this.archiveRelayReaderTerminalV122 = null; this.archiveRelayExitProgressV122 = 0;
      this.archiveRelayHeldEV122 = false;
      if (!this.archiveRelayActiveV122) return super.start(options);
      if (!options.missionLevel?.validation?.valid || !options.missionLevel.signature.endsWith(':archive-relay-v122')) throw new Error('QZ-18 requires buildArchiveRelayLevelV122.');
      super.start({ ...options, resumeState: undefined, vehicle: null, crew: [], squad: [],
        userCasteCampaignV88: false, neuroProfile: null, apexDossier: null });
      this.configureArchiveRelayWorldV122();
      if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      this.syncArchiveRelayWorldV122(); this.archiveRelayCheckpointV122 ||= this.captureArchiveRelayCheckpointV122();
      this.onEvent({ type: 'archive-relay-radio', id: 'briefing', operationId: ARCHIVE_RELAY_OPERATION_V122,
        text: archiveRelayDossierV122(this.archiveRelayV122).instruction });
      return this.getSnapshot();
    }
    isArchiveRelayV122() { return Boolean(this.archiveRelayActiveV122 && this.archiveRelayV122); }
    canArchiveRelayActV122(actor = this.player) {
      return Boolean(this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
        && this.mission?.state === 'active' && actor === this.player && actor.alive && !actor.downed);
    }
    configureArchiveRelayWorldV122() {
      this.enemies = []; this.bullets = []; this.hostileProjectiles = []; this.drops = []; this.squadActors = []; this.coopEnabled = false;
      this.platforms = [{ id: 'qz18-floor', x: 0, y: 570, w: 1800, h: 38, floor: true, art: 'floor' },
        { id: 'qz18-walkway', x: 350, y: 355, w: 750, h: 20, art: 'grate' }];
      this.ladders = [{ id: 'qz18-ladder', x: 420, top: 355, bottom: 570, y: 355, w: 50, h: 215 }];
      this.doors = [{ id: 'qz18-return-gate', x: 1390, y: 0, w: 50, h: 570, progress: 0, open: false, lockedBy: 'archive-relay', levelLocked: true }];
      for (const key of ['walls', 'lifts', 'covers', 'hazards', 'vents', 'supplies', 'objectiveNodes', 'collectablesV68', 'narrativeCollectablesV68']) this[key] = [];
      this.powerNode = null; this.archiveTerminal = null; this.ventShortcut = null;
      if (this.weaponPickup) this.weaponPickup.taken = true; if (this.toolPickup) this.toolPickup.taken = true;
      this.vehicle.active = false; this.vehicle.occupied = false; this.vehicle.driver = null;
      this.player.x = 70; this.player.y = 570 - this.player.h; this.player.facing = 1;
      this.player.inVehicle = false; this.player.vx = 0; this.player.vy = 0;
      this.objective = { id: 'qz18-return-beacon', x: 1650, y: 440, w: 60, h: 130, complete: false };
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear();
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear(); this.missionLevelExtractionTimer = null;
      this.missionLevelBounds = { width: 1800, height: 620, voidY: 720 }; this.camera.x = 0; this.camera.y = 0;
    }
    syncArchiveRelayWorldV122() {
      if (!this.isArchiveRelayV122() || !this.mission) return;
      const state = this.archiveRelayV122; state.phase = archiveRelayPhaseV122(state); this.mission.phase = state.phase;
      this.mission.objectives = { power: state.power, route: Boolean(state.verdict), boss: true, archive: state.readIds.length === 6, extract: state.complete };
      this.doors[0].open = Boolean(state.verdict); this.doors[0].levelLocked = !state.verdict;
      if (!state.verdict) this.doors[0].progress = 0;
      this.objective.complete = state.complete; this.coopEnabled = false;
      if (state.complete && state.rewards) this.mission.rewards = clone(state.rewards);
    }
    setCoop(enabled) { return super.setCoop(this.isArchiveRelayV122() ? false : enabled); }
    toggleVehicle(actor) { return this.isArchiveRelayV122() ? false : super.toggleVehicle(actor); }
    fire(actor = this.player) {
      // F is a local restoration control, not simultaneous rifle fire.
      if (this.isArchiveRelayV122() && this.keys.has('KeyF') && near(actor, ARCHIVE_RELAY_PROPS_V122.freight)) return false;
      return super.fire(actor);
    }
    updateObjectiveRuntime(delta) { if (!this.isArchiveRelayV122()) return super.updateObjectiveRuntime(delta); }
    updateMissionPhase() { if (!this.isArchiveRelayV122()) return super.updateMissionPhase(); this.syncArchiveRelayWorldV122(); }
    missingObjectiveRequirement(options) { return this.isArchiveRelayV122() ? this.missingArchiveRelayRequirementV122() : super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.isArchiveRelayV122() ? this.missingArchiveRelayRequirementV122() : super.missingExtractionRequirement(); }
    missingArchiveRelayRequirementV122() {
      return this.archiveRelayV122?.verdict && this.archiveRelayExitProgressV122 >= 2
        && near(this.player, ARCHIVE_RELAY_PROPS_V122.extraction) ? '' : 'CONFRONTATION ET BALISE DE RETOUR REQUISES';
    }
    doorRequirement(door) {
      if (this.isArchiveRelayV122() && door?.id === 'qz18-return-gate') return this.archiveRelayV122.verdict ? '' : 'VERDICT DOCUMENTÉ REQUIS AU POSTE DE CONFRONTATION';
      return super.doorRequirement(door);
    }
    getDoorRenderState(door, options) {
      const rendered = super.getDoorRenderState(door, options);
      // The reused atlas is a presentation, not a license to stretch the physical
      // gate across an entire room. Rendering and collision share these bounds.
      return this.isArchiveRelayV122() && door?.id === 'qz18-return-gate'
        ? { ...rendered, x: 1364, y: 0, w: 102, h: 570 } : rendered;
    }
    archiveRelayDiscoverV122(terminal, includeDraft = false) {
      const state = this.archiveRelayV122, discovered = [];
      for (const doc of ARCHIVE_RELAY_DOCUMENTS_V122.filter(doc => doc.terminal === terminal && (includeDraft || doc.id !== 'freight-draft'))) {
        if (!state.discoveredIds.includes(doc.id)) { state.discoveredIds.push(doc.id); discovered.push(doc.id); }
      }
      if (discovered.length) this.archiveRelayMilestoneV122(terminal === 'pda' ? 'badge' : terminal, 'Mémoire locale récupérée ; lire les documents avant de conclure.');
      return discovered;
    }
    interact(actor = this.player) {
      if (!this.isArchiveRelayV122()) return super.interact(actor);
      if (!this.canArchiveRelayActV122(actor)) return false;
      const state = this.archiveRelayV122, props = ARCHIVE_RELAY_PROPS_V122;
      if (near(actor, props.pda)) {
        state.badge = true; this.archiveRelayDiscoverV122('pda'); return this.openArchiveRelayReaderV122('pda');
      }
      if (near(actor, props.relay)) return state.badge;
      const terminal = ['engineering', 'security', 'freight', 'analysis'].find(key => near(actor, props[key]));
      if (terminal) {
        if (!state.power || !state.badge) return this.locked('ALIMENTATION ET BADGE LOCAL REQUIS');
        if (terminal !== 'analysis') this.archiveRelayDiscoverV122(terminal, state.restoredDraft);
        return this.openArchiveRelayReaderV122(terminal);
      }
      return Boolean(state.verdict && near(actor, props.extraction));
    }
    openArchiveRelayReaderV122(terminal) {
      if (!this.canArchiveRelayActV122() || !near(this.player, ARCHIVE_RELAY_PROPS_V122[terminal])) return false;
      this.archiveRelayReaderTerminalV122 = terminal;
      this.onEvent({ type: 'archive-relay-open', terminal, operationId: ARCHIVE_RELAY_OPERATION_V122 }); return true;
    }
    closeArchiveRelayReaderV122() { this.archiveRelayReaderTerminalV122 = null; }
    getArchiveRelayReaderV122(terminal = this.archiveRelayReaderTerminalV122) {
      return this.isArchiveRelayV122() ? archiveRelayReaderModelV122(this.archiveRelayV122, terminal) : null;
    }
    canArchiveRelayReadV122() {
      return Boolean(this.isArchiveRelayV122() && this.running && this.mission?.state === 'active' && this.player.alive && !this.player.downed
        && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88 && this.archiveRelayReaderTerminalV122
        && near(this.player, ARCHIVE_RELAY_PROPS_V122[this.archiveRelayReaderTerminalV122]));
    }
    markArchiveRelayReadV122(documentId) {
      if (!this.canArchiveRelayReadV122()) return { applied: false, reason: 'reader-not-local' };
      const model = this.getArchiveRelayReaderV122(), state = this.archiveRelayV122;
      if (!model.documents.some(doc => doc.id === documentId)) return { applied: false, reason: 'document-unavailable' };
      if (state.readIds.includes(documentId)) return { applied: false, reason: 'already-read' };
      state.readIds.push(documentId); this.syncArchiveRelayWorldV122(); this.archiveRelayMilestoneV122(null, null);
      return { applied: true, reason: 'read' };
    }
    decideArchiveRelayV122(verdict) {
      if (!this.canArchiveRelayReadV122() || this.archiveRelayReaderTerminalV122 !== 'analysis') return { applied: false, reason: 'analysis-not-local' };
      const state = this.archiveRelayV122;
      if (state.verdict) return { applied: false, reason: 'already-decided' };
      if (state.readIds.length !== 6) return { applied: false, reason: 'records-unread' };
      if (verdict !== 'delayed-distress') {
        if (verdict !== 'clock-failure') return { applied: false, reason: 'unknown-verdict' };
        state.rejectedVerdicts = Math.min(9999, state.rejectedVerdicts + 1); this.archiveRelayMilestoneV122(null, null);
        return { applied: false, reason: 'contradicted', message: 'Le ticket horaire et le relevé de tension réfutent la panne. Relisez-les ; aucune identité personnelle n’est établie.' };
      }
      state.verdict = verdict; this.syncArchiveRelayWorldV122();
      this.archiveRelayMilestoneV122('verdict', 'Cause documentée : détresse retardée, auteur non identifié. Sas de retour autorisé.');
      return { applied: true, reason: 'route-open', message: 'Verdict enregistré. Le sas de retour s’ouvre réellement.' };
    }
    archiveRelayMilestoneV122(id, text) {
      if (id && !this.archiveRelayV122.journal.includes(id)) {
        this.archiveRelayV122.journal.push(id); if (text) this.onEvent({ type: 'archive-relay-radio', id, text, operationId: ARCHIVE_RELAY_OPERATION_V122 });
      }
      this.syncArchiveRelayWorldV122(); this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.archiveRelayCheckpointV122 = this.captureArchiveRelayCheckpointV122();
      this.onEvent({ type: 'checkpoint', checkpoint: `qz18-${id || 'record-read'}`, operationId: ARCHIVE_RELAY_OPERATION_V122 });
    }
    update(delta) {
      if (!this.isArchiveRelayV122()) return super.update(delta);
      if (this.running && !this.paused && this.mission?.state === 'active' && !this.player?.alive) { this.failMission('Enquête QZ-18 interrompue.'); return; }
      if (!this.canArchiveRelayActV122()) return;
      const seconds = Number(delta); if (!Number.isFinite(seconds) || seconds <= 0) return;
      const dt = Math.min(seconds, 0.1), state = this.archiveRelayV122, props = ARCHIVE_RELAY_PROPS_V122;
      // E opens a terminal once, but held touch/gamepad input cannot reopen it every frame.
      if (this.keys.has('KeyE') && !this.archiveRelayHeldEV122) this.interact();
      this.archiveRelayHeldEV122 = this.keys.has('KeyE');
      // A touch/gamepad interaction can synchronously open the modal here.
      if (!this.canArchiveRelayActV122()) return;
      if (!state.power && state.badge && near(this.player, props.relay) && this.keys.has('KeyE')) {
        state.relayProgress = Math.min(3, state.relayProgress + dt);
        if (state.relayProgress >= 3) { state.power = true; this.archiveRelayMilestoneV122('power', 'Relais alimenté. Les trois postes sont hors réseau, mais leur mémoire locale est accessible.'); }
      }
      if (state.power && state.discoveredIds.includes('freight-manifest') && !state.restoredDraft
        && near(this.player, props.freight) && this.keys.has('KeyF')) {
        state.restoreProgress = Math.min(4, state.restoreProgress + dt);
        if (state.restoreProgress >= 4) {
          state.restoredDraft = true; this.archiveRelayDiscoverV122('freight', true);
          this.archiveRelayMilestoneV122('draft', 'Brouillon restauré localement. E au fret pour le lire.');
        }
      }
      if (state.verdict && near(this.player, props.extraction) && this.keys.has('KeyE')) {
        this.archiveRelayExitProgressV122 = Math.min(2, this.archiveRelayExitProgressV122 + dt);
        if (this.archiveRelayExitProgressV122 >= 2) this.completeMission();
      } else if (!state.complete) this.archiveRelayExitProgressV122 = 0;
      super.update(dt); this.player.x = Math.max(0, Math.min(1800 - this.player.w, this.player.x));
      this.camera.x = Math.max(0, Math.min(520, this.camera.x)); this.camera.y = 0;
    }
    completeMission(actor = this.player) {
      if (!this.isArchiveRelayV122()) return super.completeMission(actor);
      const state = this.archiveRelayV122;
      if (!this.canArchiveRelayActV122(actor) || state.complete || state.rewardClaimed || this.missingArchiveRelayRequirementV122()) return false;
      const previousIntel = this.inventory.intel; this.inventory.intel = 12;
      const rewards = { credits: 500, salvage: this.inventory.salvage, intel: 12, retries: this.mission.retries,
        elapsedSeconds: Math.round(this.mission.elapsed), noCasualty: this.mission.casualties === 0,
        operationId: ARCHIVE_RELAY_OPERATION_V122, verdict: state.verdict };
      state.complete = true; state.rewardClaimed = true; state.rewards = rewards; state.journal.push('extracted'); this.syncArchiveRelayWorldV122();
      const sink = this.onEvent;
      this.onEvent = event => { if (event.type === 'mission-complete') { this.mission.rewards = clone(rewards); sink({ ...event, rewards: clone(rewards), operationId: ARCHIVE_RELAY_OPERATION_V122 }); } else sink(event); };
      let result; try { result = super.completeMission(actor); } finally { this.onEvent = sink; }
      if (!result) { state.complete = false; state.rewardClaimed = false; state.rewards = null; this.inventory.intel = previousIntel; state.journal = state.journal.filter(id => id !== 'extracted'); this.syncArchiveRelayWorldV122(); }
      return result;
    }
    captureArchiveRelayCheckpointV122() { const raw = this.captureResumeState(); delete raw.specialOperation.archiveRelayCheckpointV122; return clone(raw); }
    captureResumeState() {
      const base = super.captureResumeState(); if (!this.isArchiveRelayV122()) return base;
      return { ...base, specialOperation: { ...(base.specialOperation || {}), operationId: ARCHIVE_RELAY_OPERATION_V122,
        archiveRelayV122: sanitizeArchiveRelayStateV122(this.archiveRelayV122),
        archiveRelayExitProgressV122: this.archiveRelayExitProgressV122,
        archiveRelayCheckpointV122: this.archiveRelayCheckpointV122 ? clone(this.archiveRelayCheckpointV122) : null } };
    }
    validateArchiveRelayResumeV122(raw) {
      const checked = validateArchiveRelayStateV122(raw?.specialOperation?.archiveRelayV122); if (!checked.valid) return checked;
      const id = raw?.identity, state = checked.state, exit = raw.specialOperation.archiveRelayExitProgressV122;
      const gate = raw.missionLevel?.doors?.find(door => door.id === 'qz18-return-gate');
      if (raw.schema !== 1 || raw.specialOperation.operationId !== ARCHIVE_RELAY_OPERATION_V122 || !id
        || ['campaignId', 'worldId', 'levelSeedId', 'objectiveId', 'editorProjectKind'].some(key => id[key] !== this.resumeIdentity?.[key])
        || Number(id.seed) !== Number(this.resumeIdentity?.seed) || raw.missionLevel?.signature !== this.missionLevelRuntime?.signature
        || !['active', 'failed', 'complete'].includes(raw.mission?.state) || (raw.mission.state === 'complete') !== state.complete
        || !Array.isArray(raw.enemies) || raw.enemies.length || raw.vehicle?.active || raw.player?.inVehicle
        || !Number.isFinite(raw.player?.x) || raw.player.x < 0 || raw.player.x > 1800 - this.player.w
        || !Number.isFinite(raw.player?.y) || raw.player.y < 0 || raw.player.y > 570
        || !state.verdict && raw.player.x + this.player.w > 1365
        || !gate || gate.open !== Boolean(state.verdict) || gate.levelLocked !== !state.verdict
        || !Number.isFinite(gate.progress) || gate.progress < 0 || gate.progress > 1 || !state.verdict && gate.progress !== 0
        || !Number.isFinite(exit) || exit < 0 || exit > 2 || exit > 0 && !state.verdict
        || state.complete && (exit !== 2 || raw.player.alive !== true || raw.player.downed !== false)) return { valid: false, reason: 'archive-relay-identity-mismatch' };
      return checked;
    }
    applyResumeState(raw) {
      if (!this.isArchiveRelayV122()) return super.applyResumeState(raw);
      const checked = this.validateArchiveRelayResumeV122(raw); if (!checked.valid) return { applied: false, restored: 0, reason: checked.reason };
      const previous = this.archiveRelayV122; this.archiveRelayV122 = checked.state;
      const result = super.applyResumeState(raw); if (!result?.applied) { this.archiveRelayV122 = previous; return result; }
      this.archiveRelayExitProgressV122 = raw.specialOperation.archiveRelayExitProgressV122; this.archiveRelayReaderTerminalV122 = null; this.archiveRelayHeldEV122 = false;
      this.missionLevelTimers?.clear(); this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear();
      const checkpoint = raw.specialOperation.archiveRelayCheckpointV122;
      if (checkpoint && this.validateArchiveRelayResumeV122(checkpoint).valid) { this.archiveRelayCheckpointV122 = clone(checkpoint); delete this.archiveRelayCheckpointV122.specialOperation.archiveRelayCheckpointV122; }
      this.syncArchiveRelayWorldV122(); this.refreshSpriteCollisionProfiles?.(); return { ...result, specialOperationRestored: true };
    }
    restartFromCheckpoint() {
      if (!this.isArchiveRelayV122()) return super.restartFromCheckpoint();
      if (this.mission?.state !== 'failed' || !this.archiveRelayCheckpointV122) return false;
      const raw = clone(this.archiveRelayCheckpointV122); raw.mission.state = 'active'; raw.mission.failureReason = null; raw.mission.retries = this.mission.retries + 1;
      const result = this.applyResumeState(raw); if (!result.applied) return false;
      this.clearGameplayInput?.(); this.onEvent({ type: 'mission-restarted', operationId: ARCHIVE_RELAY_OPERATION_V122 }); return true;
    }
    phaseLabel() { return this.isArchiveRelayV122() ? archiveRelayDossierV122(this.archiveRelayV122).title : super.phaseLabel(); }
    objectiveProgressText() { return this.isArchiveRelayV122() ? archiveRelayDossierV122(this.archiveRelayV122).instruction : super.objectiveProgressText(); }
    getInteractionPrompt() {
      if (!this.isArchiveRelayV122()) return super.getInteractionPrompt();
      const state = this.archiveRelayV122, props = ARCHIVE_RELAY_PROPS_V122;
      if (near(this.player, props.relay)) return state.power ? 'RELAIS LOCAL EN SERVICE' : state.badge ? `MAINTENIR E · RELAIS · ${state.relayProgress.toFixed(1)}/3 S` : 'BADGE DU PDA REQUIS';
      if (near(this.player, props.extraction)) return state.verdict ? 'MAINTENIR E · RETOUR · 2 S' : 'VERDICT REQUIS';
      const terminal = ['pda', 'engineering', 'security', 'freight', 'analysis'].find(key => near(this.player, props[key]));
      return terminal ? terminal === 'freight' && state.power && state.discoveredIds.includes('freight-manifest') && !state.restoredDraft
        ? `E · LIRE LE FRET / MAINTENIR F · RESTAURER · ${state.restoreProgress.toFixed(1)}/4 S` : `E · ${terminal === 'analysis' ? 'CONFRONTER' : 'LIRE LE POSTE LOCAL'}` : '';
    }
    missionLocalZoneV121() {
      if (!this.isArchiveRelayV122()) return super.missionLocalZoneV121();
      return { id: this.player.y + this.player.h <= 395 ? 'qz18-offices' : 'qz18-quay',
        label: this.player.y + this.player.h <= 395 ? 'QZ-18 · bureaux techniques' : 'QZ-18 · quai et relais', biome: 'industriel' };
    }
    missionNavigationMapV121() {
      if (!this.isArchiveRelayV122()) return super.missionNavigationMapV121();
      const state = this.archiveRelayV122, phase = state.phase;
      const goals = phase === 'pda' ? ['pda'] : phase === 'power' ? ['relay'] : phase === 'analysis' ? ['analysis']
        : phase === 'extract' ? ['extraction'] : phase === 'records' ? ['pda', 'engineering', 'security', 'freight'].filter(terminal =>
          ARCHIVE_RELAY_DOCUMENTS_V122.some(doc => doc.terminal === terminal && !state.readIds.includes(doc.id))) : [];
      return { mode: 'local', label: 'PLAN LOCAL · QZ-18', width: 1800, minY: 310, maxY: 610,
        surfaces: this.platforms.map(entry => ({ id: entry.id, x: entry.x, end: entry.x + entry.w, y: entry.y })),
        ladders: this.ladders.map(entry => ({ id: entry.id, x: entry.x, top: entry.top, bottom: entry.bottom })),
        goals: goals.map(id => ({ id, x: ARCHIVE_RELAY_PROPS_V122[id].x, y: ARCHIVE_RELAY_PROPS_V122[id].groundY })),
        player: { x: this.player.x + this.player.w / 2, y: this.player.y + this.player.h } };
    }
    getSnapshot() { return { ...super.getSnapshot(), ...(this.isArchiveRelayV122() ? { archiveRelayV122: {
      ...sanitizeArchiveRelayStateV122(this.archiveRelayV122), dossier: archiveRelayDossierV122(this.archiveRelayV122) } } : {}) }; }
    getGameplayReport() { return { ...super.getGameplayReport(), ...(this.isArchiveRelayV122() ? { archiveRelayV122: this.getSnapshot().archiveRelayV122 } : {}) }; }
    drawBackdrop(ctx) {
      if (!this.isArchiveRelayV122()) return super.drawBackdrop(ctx);
      ctx.fillStyle = '#101b1e'; ctx.fillRect(0, 0, 1800, 720);
      for (let x = 0; x < 1800; x += 120) { ctx.fillStyle = '#243438'; ctx.fillRect(x, 210, 4, 360); }
      ctx.font = 'bold 12px monospace';
      for (const [id, prop] of Object.entries(ARCHIVE_RELAY_PROPS_V122)) {
        ctx.fillStyle = '#274147'; ctx.fillRect(prop.x - 22, prop.groundY - 48, 44, 46);
        ctx.fillStyle = id === 'relay' && !this.archiveRelayV122.power ? '#b39962' : '#8dd7bb';
        ctx.fillRect(prop.x - 15, prop.groundY - 41, 30, 16); ctx.fillText(id.toUpperCase(), prop.x - 38, prop.groundY - 57);
      }
    }
    drawHud(ctx) {
      super.drawHud(ctx); if (!this.isArchiveRelayV122()) return;
      const dossier = archiveRelayDossierV122(this.archiveRelayV122);
      ctx.save(); ctx.fillStyle = '#0b161bef'; ctx.fillRect(18, 113, 1200, 57); ctx.fillStyle = '#c1d7d8'; ctx.font = 'bold 13px monospace';
      ctx.fillText(`QZ-18 · ${dossier.title}`, 32, 134); ctx.font = '12px monospace'; ctx.fillText(dossier.instruction, 32, 156, 1160); ctx.restore();
    }
  };
}
