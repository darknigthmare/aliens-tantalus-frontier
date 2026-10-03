import { buildMissionLevelV52, validateMissionTopologyV52 } from './mission-levels-v52.js';
import { cancelTacticalReloadV77 } from './tactical-reload-v77.js';
import {
  BLACK_COCOON_CAMPAIGN_V121, BLACK_COCOON_OPERATION_V121, BLACK_COCOON_TIMING_V121,
  createBlackCocoonStateV121, sanitizeBlackCocoonStateV121, validateBlackCocoonStateV121,
  blackCocoonPhaseV121, advanceBlackCocoonAlertV121, blackCocoonDossierV121
} from './black-cocoon-state-v121.js';

export { BLACK_COCOON_CAMPAIGN_V121 } from './black-cocoon-state-v121.js';
export const BLACK_COCOON_ASSETS_V121 = Object.freeze({
  cocoon: '/assets/openai/sprites/static-import-v106/xeno-cocoon-front.png',
  quarantine: '/assets/openai/hub/rooms/industrial-quarantine.png',
  battery: '/assets/openai/sprites/normalized/tools/portable-battery-use-sheet.png',
  beacon: '/assets/openai/sprites/normalized/tools/colony-beacon-use-sheet.png',
  transport: '/assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png'
});
// Exact existing specimen cutout reused as scenery, not an active caste or a
// newly certified marine-cocoon reference. Its admission must remain file-scoped.
export const BLACK_COCOON_STATIC_PROP_V121 = Object.freeze({
  path: 'assets/openai/sprites/static-import-v106/xeno-cocoon-front.png',
  sha256: '4ca67874539d044396339455683f864b5463f0769bc711ae1ff483cfcf23d431',
  width: 1102, height: 1427, alphaBounds: Object.freeze([55, 48, 1052, 1381]),
  reviewStatus: 'accepted-static-adaptation', role: 'reused-resin-scenery',
  animationStatus: 'missing', canonExact: false
});
const list = value => Array.isArray(value) ? value : [];
const clone = value => structuredClone(value);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ready = image => Boolean(image?.complete && image.naturalWidth > 0);
const centerX = actor => Number(actor?.x || 0) + Number(actor?.w || 0) / 2;
const footY = actor => Number(actor?.y || 0) + Number(actor?.h || 0);
const near = (actor, prop, radius = 100) => Boolean(actor && prop && Math.abs(centerX(actor) - prop.x) <= radius && Math.abs(footY(actor) - prop.groundY) <= 45);
const safeProfiles = new Set(['enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner']);

export function buildBlackCocoonLevelV121(options = {}) {
  const base = buildMissionLevelV52({ ...options, campaign: options.campaign || BLACK_COCOON_CAMPAIGN_V121, templateId: 'colony-multiroute' });
  // Utility routes normally use vent transit. This escape deliberately removes
  // those shortcuts, so author a continuous walkable tunnel instead of leaving
  // invisible gaps below its node platforms. Upper paths retain their ladders.
  const tunnel = { id: 'bc121-continuous-tunnel', x: 500, y: 570, w: 3130, h: 22,
    zoneId: 'colony-utility', kind: 'route-bridge', floor: true };
  const platforms = [...base.geometry.platforms, tunnel];
  const plan = { ...base, label: 'COCON NOIR · galerie colonisée',
    signature: `${base.signature}:black-cocoon-v121`,
    geometry: { ...base.geometry, platforms }, routeRuntime: { ...base.routeRuntime, platforms } };
  plan.validation = validateMissionTopologyV52(plan);
  if (!plan.validation.valid) throw new Error('Cocon noir physical tunnel failed topology validation.');
  return plan;
}

export function withBlackCocoonRuntimeV121(BaseEngine) {
  if (BaseEngine.blackCocoonRuntimeV121 === true) return BaseEngine;
  return class BlackCocoonRuntimeV121 extends BaseEngine {
    static blackCocoonRuntimeV121 = true;
    start(options = {}) {
      this.blackCocoonActiveV121 = options.campaign?.id === BLACK_COCOON_CAMPAIGN_V121.id;
      this.blackCocoonV121 = this.blackCocoonActiveV121 ? createBlackCocoonStateV121() : null;
      this.blackCocoonCheckpointV121 = null;
      this.blackCocoonQuarantineWorldV121 = false;
      this.blackCocoonCatalogV121 = list(options.enemyCatalog).filter(profile => safeProfiles.has(profile.id));
      if (!this.blackCocoonActiveV121) return super.start(options);
      if (!options.missionLevel?.validation?.valid || options.missionLevel.templateId !== 'colony-multiroute'
        || !options.missionLevel.geometry?.platforms?.some(platform => platform.id === 'bc121-continuous-tunnel')) {
        throw new Error('Cocon noir requires the validated buildBlackCocoonLevelV121 physical tunnel.');
      }
      // Base start restores before compiling geometry. This operation instead commits
      // one validated resume AFTER its physical world and owned actor IDs exist.
      const snapshot = super.start({ ...options, resumeState: undefined });
      this.configureBlackCocoonWorldV121();
      this.player.health = Math.min(this.player.health, 60);
      this.player.armor = 0;
      const spawn = this.blackCocoonPropsV121.cocoon;
      this.player.x = spawn.x - this.player.w / 2;
      this.player.y = spawn.groundY - this.player.h;
      this.player.vx = 0; this.player.vy = 0;
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.blackCocoonSpawnV121('enemy-004-drone-big-chap', spawn.x + 1100, spawn.groundY);
      this.blackCocoonSpawnV121('enemy-006-runner', this.blackCocoonPropsV121.relay.x + 260, spawn.groundY);
      if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      this.syncBlackCocoonWorldV121();
      this.blackCocoonCheckpointV121 ||= this.captureBlackCocoonCheckpointV121();
      this.onEvent({ type: 'special-operation-started', operationId: BLACK_COCOON_OPERATION_V121,
        campaignId: this.campaign.id, phase: this.blackCocoonV121.phase, insertion: 'resin-cocoon', localPlayers: 1 });
      return { ...snapshot, ...this.getBlackCocoonSnapshotV121() };
    }

    isBlackCocoonV121() { return Boolean(this.blackCocoonActiveV121 && this.blackCocoonV121); }

    configureBlackCocoonWorldV121() {
      const plan = this.missionLevelRuntime;
      const nodes = new Map(list(plan?.graph?.nodes).map(node => [node.id, node]));
      const prop = (id, nodeId, dx = 0) => {
        const node = nodes.get(nodeId);
        if (!node) throw new Error(`Cocon noir node unavailable: ${nodeId}`);
        return { id, nodeId, x: node.x + dx, groundY: node.y, w: 58, h: 70 };
      };
      this.blackCocoonPropsV121 = {
        cocoon: prop('cocoon', 'colony-utility-a'), equipment: prop('equipment', 'colony-tunnels', -160),
        battery: prop('battery', 'colony-hab-high'), relay: prop('relay', 'colony-generator', -140),
        industrial: prop('industrial', 'colony-security-low', -95), cooling: prop('cooling', 'colony-security-high', -100),
        surface: prop('surface', 'colony-security', 80), delta: prop('delta', 'colony-pad'),
        beacon1: prop('beacon1', 'colony-extraction', -350), beacon2: prop('beacon2', 'colony-extraction', -100),
        ramp: prop('ramp', 'colony-extraction', 70)
      };
      this.blackCocoonIndustrialLadderV121 = list(this.ladders).find(ladder => ladder.id === 'colony-e19');
      this.blackCocoonColonyGeometryV121 = {
        platforms: [...this.platforms], ladders: [...this.ladders], covers: [...this.covers],
        walls: [...(this.walls || [])], bounds: { ...this.missionLevelBounds }
      };
      // No inherited campaign actors, timed escape failure, automatic extraction,
      // vent teleport or supply refill may complete this operation in its place.
      this.enemies = []; this.drops = []; this.hostileProjectiles = []; this.bullets = [];
      this.squadActors = []; this.coopEnabled = false;
      // Template crates are blockers positioned for vent transit, not this
      // authored on-foot tunnel. Keep the resin scenery, not invisible crates.
      this.covers = [];
      this.supplies = []; this.objectiveNodes = []; this.collectablesV68 = [];
      if (this.narrativeCollectablesV68) this.narrativeCollectablesV68 = [];
      this.powerNode = null; this.archiveTerminal = null;
      if (this.weaponPickup) this.weaponPickup.taken = true;
      if (this.toolPickup) this.toolPickup.taken = true;
      this.vehicle.active = false; this.vehicle.occupied = false;
      this.vehicle.driver = null; this.vehicle.passengers = [];
      this.vents = []; this.ventShortcut = { id: 'none', x: -1000, y: -1000, w: 0, h: 0, open: false };
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear();
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear();
      this.missionLevelExtractionTimer = null;
      this.hazards = [];
      for (const door of this.doors) { door.open = true; door.progress = 1; door.levelLocked = false; door.lockedBy = null; }
      this.objective = { id: 'black-cocoon-return', x: this.blackCocoonPropsV121.ramp.x - 34,
        y: this.blackCocoonPropsV121.ramp.groundY - 90, w: 68, h: 90, complete: false };
      if (this.objectiveState) this.objectiveState.started = false;
      for (const [key, path] of Object.entries(BLACK_COCOON_ASSETS_V121)) {
        if (this.images.has(`bc121-${key}`) || typeof globalThis.Image !== 'function') continue;
        const image = new globalThis.Image(); image.decoding = 'async'; image.src = path;
        this.images.set(`bc121-${key}`, image);
      }
    }

    syncBlackCocoonWorldV121() {
      const state = this.blackCocoonV121;
      if (!state || !this.blackCocoonPropsV121 || !this.blackCocoonColonyGeometryV121) return;
      state.phase = blackCocoonPhaseV121(state);
      this.mission.phase = state.phase;
      this.mission.objectives = { power: state.relayContact, route: state.surfaceReached, boss: true,
        archive: state.weaponsDeposited, extract: state.complete };
      this.objective.complete = state.complete;
      this.coopEnabled = false;
      if (state.boarded && !this.blackCocoonQuarantineWorldV121) this.enterBlackCocoonQuarantineV121(false);
      if (!state.boarded) {
        const geometry = this.blackCocoonColonyGeometryV121;
        this.ladders = geometry.ladders.filter(ladder => ladder.id !== 'colony-e19' || state.route === 'industrial');
        this.platforms = [...geometry.platforms]; this.walls = [...geometry.walls]; this.covers = [];
        this.missionLevelBounds = { ...geometry.bounds };
      }
      if (state.complete && state.rewards) this.mission.rewards = clone(state.rewards);
    }

    setCoop(enabled) { return super.setCoop(this.isBlackCocoonV121() ? false : enabled); }
    updateObjectiveRuntime(delta) { if (!this.isBlackCocoonV121()) return super.updateObjectiveRuntime(delta); }
    updateMissionPhase() { if (!this.isBlackCocoonV121()) return super.updateMissionPhase(); this.syncBlackCocoonWorldV121(); }
    missingObjectiveRequirement(options) { return this.isBlackCocoonV121() ? this.missingBlackCocoonRequirementV121() : super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.isBlackCocoonV121() ? this.missingBlackCocoonRequirementV121() : super.missingExtractionRequirement(); }
    missingBlackCocoonRequirementV121() {
      const state = this.blackCocoonV121;
      return state?.boarded && state.weaponsDeposited && state.scanProgress >= 4 ? '' : 'EXFILTRATION ET QUARANTAINE NON TERMINÉES';
    }
    canBlackCocoonActV121(actor = this.player) {
      return this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
        && this.mission?.state === 'active' && actor === this.player && actor.alive && !actor.downed;
    }

    updatePlayer(actor, delta, controls) {
      if (!this.isBlackCocoonV121()) return super.updatePlayer(actor, delta, controls);
      if (!this.blackCocoonV121.freed || this.blackCocoonV121.action) { actor.vx = 0; actor.vy = 0; return; }
      const result = super.updatePlayer(actor, delta, controls);
      if (this.blackCocoonV121.boarded) actor.x = clamp(actor.x, 30, 1240 - actor.w);
      return result;
    }

    update(delta) {
      if (!this.isBlackCocoonV121()) return super.update(delta);
      if (this.running && !this.paused && this.mission?.state === 'active' && this.player?.alive === false) {
        this.failMission('Marine perdu avant le retour au Tantalus.'); return;
      }
      if (!this.canBlackCocoonActV121()) return;
      const seconds = Number(delta);
      if (!Number.isFinite(seconds) || seconds <= 0) return;
      // Bound direct callers too: no multi-second input can skip a defence stage.
      const step = Math.min(seconds, 0.1);
      if (!this.blackCocoonV121.freed && this.keys.has('KeyF')) this.beginBlackCocoonActionV121('force', 'cocoon');
      if (this.keys.has('KeyE') && !this.blackCocoonV121.action) this.interact(this.player);
      this.advanceBlackCocoonActionV121(step);
      super.update(step);
      if (this.mission.state !== 'active') return;
      const state = this.blackCocoonV121;
      const seen = this.enemies.some(enemy => enemy.alive && enemy.alert && Math.abs(centerX(enemy) - centerX(this.player)) < 550);
      advanceBlackCocoonAlertV121(state, step, { seen, crouching: this.player.crouching });
      if (state.relayContact && !state.surfaceReached && state.route
        && near(this.player, this.blackCocoonPropsV121.surface, 145)) {
        state.surfaceReached = true; this.blackCocoonMilestoneV121('surface', 'La liaison est stable. Rejoignez Delta à la surface.');
      }
      if (state.phase === 'hold') {
        const inZone = near(this.player, this.blackCocoonPropsV121.beacon2, 610);
        if (inZone) state.extractionElapsed = Math.min(90, state.extractionElapsed + step);
        if (state.extractionElapsed >= state.nextWaveAt && state.wavesSpawned < 3) {
          state.wavesSpawned += 1; state.nextWaveAt += 24;
          this.spawnBlackCocoonWaveV121();
        }
        if (state.extractionElapsed >= 60 && !state.watcherSpawned) {
          state.watcherSpawned = true;
          this.blackCocoonSpawnV121('enemy-004-drone-big-chap', this.blackCocoonPropsV121.beacon1.x - 420, 470, 'watcher', true);
          this.blackCocoonMilestoneV121('watcher', 'Contact adulte en approche. Aucun transport ne descendra tant que la zone reste saturée.');
        }
      }
      if (state.phase === 'board') {
        const watcher = this.enemies.find(enemy => enemy.blackCocoonRoleV121 === 'watcher' && enemy.alive);
        if (watcher && !watcher.alert) watcher.alert = true;
      }
      this.syncBlackCocoonWorldV121();
    }

    blackCocoonNoiseV121(amount) {
      if (!this.blackCocoonV121 || this.blackCocoonV121.boarded) return;
      advanceBlackCocoonAlertV121(this.blackCocoonV121, 0, { noise: amount });
    }

    blackCocoonInteractionV121(actor = this.player) {
      const state = this.blackCocoonV121, props = this.blackCocoonPropsV121;
      if (!state || !props || actor !== this.player) return null;
      if (state.phase === 'cocoon') return { action: 'cut', prop: 'cocoon', prompt: 'MAINTENIR E · COUPER LA RÉSINE / F · FORCER BRUYAMMENT' };
      if (!state.equipmentRecovered && state.freed && near(actor, props.equipment)) return { action: 'equipment', prop: 'equipment', prompt: 'E · RÉCUPÉRER LE SAC ET LE MATÉRIEL' };
      if (state.equipmentRecovered && !state.relayContact) {
        if (!state.battery && near(actor, props.battery)) return { action: 'battery', prop: 'battery', prompt: 'E · PRENDRE LA BATTERIE DU RELAIS' };
        if (near(actor, props.relay)) return { action: 'relay', prop: 'relay', prompt: state.battery ? 'E · CONTACT TANTALUS · ALIMENTATION DISCRÈTE' : 'E · CONTACT TANTALUS · DÉMARRER LE GÉNÉRATEUR BRUYANT' };
      }
      if (state.phase === 'surface' && !state.route) {
        if (near(actor, props.industrial)) return { action: 'industrial', prop: 'industrial', prompt: 'MAINTENIR E · RÉTABLIR L’ÉCHELLE INDUSTRIELLE · 6 S' };
        if (near(actor, props.cooling)) return { action: 'cooling', prop: 'cooling', prompt: 'MAINTENIR E · OUVRIR LA VANNE DE REFROIDISSEMENT · 3 S' };
      }
      if (state.phase === 'delta' && near(actor, props.delta, 145)) return { action: 'delta', prop: 'delta', prompt: 'E · FAIRE ÉVALUER LE POINT DELTA' };
      if (state.phase === 'beacons') {
        for (const [index, key] of ['beacon1', 'beacon2'].entries()) {
          if (!state.beacons[index] && near(actor, props[key])) return { action: key, prop: key, prompt: `MAINTENIR E · ARMER BALISE KAPPA ${index + 1} · 2 S` };
        }
      }
      if (state.phase === 'board' && near(actor, props.ramp, 135)) return { action: 'board', prop: 'ramp', prompt: this.blackCocoonRampThreatV121() ? 'RAMPE CONTESTÉE · REPOUSSER LE CONTACT / V · PURGE UNIQUE' : 'E · EMBARQUER POUR LE TANTALUS' };
      if (state.phase === 'quarantine') {
        if (!state.weaponsDeposited && near(actor, props.deposit)) return { action: 'deposit', prop: 'deposit', prompt: 'E · DÉPOSER LES ARMES AU RÂTELIER' };
        if (state.weaponsDeposited && near(actor, props.scanner)) return { action: 'scan', prop: 'scanner', prompt: 'MAINTENIR E · SCAN BIOLOGIQUE · 4 S' };
      }
      return null;
    }

    interact(actor = this.player) {
      if (!this.isBlackCocoonV121()) return super.interact(actor);
      if (!this.canBlackCocoonActV121(actor)) return false;
      const target = this.blackCocoonInteractionV121(actor);
      if (!target) return false;
      const state = this.blackCocoonV121;
      if (['cut', 'industrial', 'cooling', 'beacon1', 'beacon2', 'scan'].includes(target.action)) return this.beginBlackCocoonActionV121(target.action, target.prop);
      if (target.action === 'equipment') {
        state.equipmentRecovered = true;
        // Restore access, not a new magazine, reserve, loadout or inventory grant.
        this.blackCocoonMilestoneV121('equipment', 'Le sac est récupéré. Le relais est à l’est ; une batterie subsiste sur la passerelle ouest.');
      } else if (target.action === 'battery') {
        state.battery = true; this.blackCocoonMilestoneV121('battery', 'Batterie sécurisée. Le démarrage du générateur ne sera pas nécessaire.');
      } else if (target.action === 'relay') {
        state.power = state.battery ? 'battery' : 'generator'; state.relayContact = true;
        this.blackCocoonNoiseV121(state.power === 'generator' ? 85 : 12);
        this.blackCocoonMilestoneV121('contact', 'Tantalus vous reçoit. Sortez par le moteur industriel ou la passerelle de refroidissement.');
      } else if (target.action === 'delta') {
        state.deltaAbandoned = true;
        this.blackCocoonMilestoneV121('delta', 'Delta refusé : le sol ne permet pas de poser le transport. Déplacez les balises vers Kappa.');
      } else if (target.action === 'board') {
        if (this.blackCocoonRampThreatV121()) return this.locked?.('CONTACT TROP PROCHE DE LA RAMPE') || false;
        state.boarded = true;
        cancelTacticalReloadV77(actor, 'boarding');
        this.enterBlackCocoonQuarantineV121(true);
        this.blackCocoonMilestoneV121('boarded', 'Transport revenu au Tantalus. Déposez les armes et présentez-vous au scanner.');
      } else if (target.action === 'deposit') {
        state.weaponsDeposited = true; cancelTacticalReloadV77(actor, 'quarantine');
        this.blackCocoonMilestoneV121('deposited', 'Râtelier verrouillé. Le contrôle biologique peut commencer.');
      }
      this.syncBlackCocoonWorldV121();
      return true;
    }

    beginBlackCocoonActionV121(kind, propKey) {
      if (!this.canBlackCocoonActV121() || this.blackCocoonV121.action) return false;
      this.blackCocoonV121.action = { kind, propKey };
      this.player.vx = 0; this.player.vy = 0;
      return true;
    }

    advanceBlackCocoonActionV121(delta) {
      const state = this.blackCocoonV121, action = state.action;
      if (!action) return;
      const forced = action.kind === 'force';
      if (!this.keys.has(forced ? 'KeyF' : 'KeyE') || !near(this.player, this.blackCocoonPropsV121[action.propKey], 110)) { state.action = null; return; }
      let done = false, milestone = null, message = null;
      if (action.kind === 'cut' || forced) {
        state.cocoonProgress = Math.min(4, state.cocoonProgress + delta * (forced ? 2 : 1));
        if (forced) this.blackCocoonNoiseV121(delta * 20);
        if (state.cocoonProgress >= 4) { state.freed = true; done = true; milestone = 'freed'; message = 'Résine sectionnée. Le sac est plus loin dans la galerie. Évitez les patrouilles.'; }
      } else if (action.kind === 'industrial') {
        state.liftProgress = Math.min(6, state.liftProgress + delta);
        this.blackCocoonNoiseV121(delta * 6);
        if (state.liftProgress >= 6) { state.route = 'industrial'; done = true; milestone = 'industrial'; message = 'Échelle industrielle rétablie. W pour monter vers la surface.'; }
      } else if (action.kind === 'cooling') {
        state.valveProgress = Math.min(3, state.valveProgress + delta);
        if (state.valveProgress >= 3) { state.route = 'cooling'; done = true; milestone = 'cooling'; message = 'Vanne ouverte. Descendez l’échelle de sécurité vers la surface.'; }
      } else if (action.kind.startsWith('beacon')) {
        action.progress = (action.progress || 0) + delta;
        if (action.progress >= 2) { state.beacons[action.kind === 'beacon1' ? 0 : 1] = true; done = true;
          if (state.beacons.every(Boolean)) { milestone = 'beacons'; message = 'Kappa confirmé. Le transport est en approche : tenir la zone pendant 90 secondes.'; } }
      } else if (action.kind === 'scan') {
        state.scanProgress = Math.min(4, state.scanProgress + delta);
        if (state.scanProgress >= 4) { done = true; milestone = 'scanned'; message = 'Contrôle terminé. Retour enregistré dans le journal du Tantalus.'; }
      }
      if (done) {
        state.action = null;
        if (milestone) this.blackCocoonMilestoneV121(milestone, message);
        this.syncBlackCocoonWorldV121();
        if (action.kind === 'scan') this.completeMission(this.player);
      }
    }

    blackCocoonMilestoneV121(id, text) {
      const state = this.blackCocoonV121;
      if (!state.journal.includes(id)) {
        state.journal.push(id);
        this.onEvent({ type: 'black-cocoon-radio', operationId: BLACK_COCOON_OPERATION_V121, id, text });
      }
      this.syncBlackCocoonWorldV121();
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      if (id !== 'scanned') this.blackCocoonCheckpointV121 = this.captureBlackCocoonCheckpointV121();
      this.onEvent({ type: 'checkpoint', checkpoint: `black-cocoon-${id}`, operationId: BLACK_COCOON_OPERATION_V121 });
    }

    fire(actor = this.player) {
      if (!this.isBlackCocoonV121()) return super.fire(actor);
      if (!this.canBlackCocoonActV121(actor) || !this.blackCocoonV121.equipmentRecovered || this.blackCocoonV121.boarded || this.blackCocoonV121.action) return false;
      const fired = super.fire(actor);
      if (fired) this.blackCocoonNoiseV121(22);
      return fired;
    }
    reload(actor = this.player) {
      if (!this.isBlackCocoonV121()) return super.reload(actor);
      return this.canBlackCocoonActV121(actor) && this.blackCocoonV121.equipmentRecovered && !this.blackCocoonV121.boarded && !this.blackCocoonV121.action ? super.reload(actor) : false;
    }
    useMedkit(actor = this.player) {
      if (!this.isBlackCocoonV121()) return super.useMedkit(actor);
      return this.canBlackCocoonActV121(actor) && this.blackCocoonV121.equipmentRecovered && !this.blackCocoonV121.boarded ? super.useMedkit(actor) : false;
    }
    activateTracker(actor = this.player) {
      if (!this.isBlackCocoonV121()) return super.activateTracker(actor);
      if (!this.canBlackCocoonActV121(actor) || !this.blackCocoonV121.equipmentRecovered || this.blackCocoonV121.boarded) return false;
      const result = super.activateTracker(actor);
      if (result) this.blackCocoonNoiseV121(9);
      return result;
    }
    useEquipment(id, actor = this.player) {
      if (!this.isBlackCocoonV121()) return super.useEquipment(id, actor);
      return this.canBlackCocoonActV121(actor) && this.blackCocoonV121.equipmentRecovered && !this.blackCocoonV121.boarded && !this.blackCocoonV121.action ? super.useEquipment(id, actor) : false;
    }

    toggleVehicle(actor = this.player) {
      if (!this.isBlackCocoonV121()) return super.toggleVehicle(actor);
      const state = this.blackCocoonV121;
      if (!this.canBlackCocoonActV121(actor) || state.phase !== 'board' || state.purgeUsed || !near(actor, this.blackCocoonPropsV121.ramp, 190)) return false;
      state.purgeUsed = true;
      for (const enemy of this.enemies.filter(enemy => enemy.alive && Math.abs(centerX(enemy) - this.blackCocoonPropsV121.ramp.x) < 280)) {
        this.applyEnemyDamage(enemy, 90, { owner: actor, kind: 'ramp-purge', x: enemy.x, y: enemy.y });
        if (enemy.alive) { enemy.staggerClock = Math.max(2, enemy.staggerClock || 0); enemy.x -= 230; }
      }
      this.blackCocoonNoiseV121(45);
      this.onEvent({ type: 'black-cocoon-ramp-purge', operationId: BLACK_COCOON_OPERATION_V121 });
      return true;
    }
    blackCocoonRampThreatV121() {
      const ramp = this.blackCocoonPropsV121.ramp;
      return this.enemies.some(enemy => enemy.alive && near(enemy, ramp, 210));
    }

    blackCocoonSpawnV121(profileId, x, groundY, role = 'guard', alert = false, descriptor = null) {
      const profile = this.blackCocoonCatalogV121.find(candidate => candidate.id === profileId);
      if (!profile) return null;
      const state = this.blackCocoonV121;
      if (!descriptor && state.enemySequence >= 32) return null;
      const entry = descriptor || { id: `bc121-${++state.enemySequence}`, profileId, role, spawnX: x, groundY };
      const enemy = this.createEnemy(profile, Number(entry.id.split('-')[1]), entry.spawnX, entry.groundY, { boss: false, keyCarrier: false });
      enemy.id = entry.id; enemy.blackCocoonRoleV121 = entry.role; enemy.blackCocoonProfileV121 = profileId;
      enemy.alert = alert; enemy.dormant = false; enemy.attackClock = Math.max(0.5, enemy.attackClock || 0);
      this.enemies.push(enemy);
      this.initializeEnemyMissionNavigation?.(enemy);
      if (!descriptor) state.enemies.push(entry);
      return enemy;
    }
    spawnBlackCocoonWaveV121() {
      const active = this.enemies.filter(enemy => enemy.alive).length;
      if (active >= 6) return 0;
      let spawned = 0;
      for (let index = 0; index < Math.min(2, 6 - active); index += 1) {
        if (this.blackCocoonSpawnV121(index ? 'enemy-006-runner' : 'enemy-005-warrior',
          this.blackCocoonPropsV121.beacon1.x - 600 - index * 90, 470, 'guard', true)) spawned += 1;
      }
      this.onEvent({ type: 'black-cocoon-wave', wave: this.blackCocoonV121.wavesSpawned, spawned });
      return spawned;
    }
    updateEnemy(enemy, delta) {
      if (!this.isBlackCocoonV121() || !enemy.blackCocoonRoleV121) return super.updateEnemy(enemy, delta);
      if (!enemy.alive || this.blackCocoonV121.boarded) return;
      const state = this.blackCocoonV121;
      const horizontal = Math.abs(centerX(enemy) - centerX(this.player));
      const sameDeck = Math.abs(footY(enemy) - footY(this.player)) < 80;
      const sight = (this.player.crouching ? 65 : 165) + state.alert * 0.8 + state.noise * 2;
      if (!enemy.alert && sameDeck && horizontal < sight && state.freed) {
        enemy.alert = true; this.blackCocoonNoiseV121(20);
      }
      if (!enemy.alert) {
        enemy.facing = Math.sin(this.animationTime * 0.35 + enemy.animationPhase) >= 0 ? 1 : -1;
        const next = clamp(enemy.x + enemy.facing * 18 * delta, enemy.spawnX - 65, enemy.spawnX + 65);
        if (typeof this.moveEnemyOnMissionSurface === 'function') this.moveEnemyOnMissionSurface(enemy, next, delta);
        else enemy.x = next;
        return;
      }
      return super.updateEnemy(enemy, delta);
    }

    enterBlackCocoonQuarantineV121(reposition = true) {
      this.blackCocoonQuarantineWorldV121 = true;
      this.enemies = []; this.bullets = []; this.hostileProjectiles = []; this.drops = [];
      this.platforms = [{ id: 'bc121-quarantine-deck', x: 0, y: 470, w: 1280, h: 40, art: 'floor', floor: true }];
      this.ladders = []; this.lifts = []; this.walls = []; this.doors = []; this.covers = []; this.hazards = [];
      this.missionLevelBounds = { width: 1280, height: 620, voidY: 720 };
      this.blackCocoonPropsV121.deposit = { id: 'deposit', x: 420, groundY: 470, w: 80, h: 94 };
      this.blackCocoonPropsV121.scanner = { id: 'scanner', x: 850, groundY: 470, w: 90, h: 130 };
      if (reposition) {
        this.player.x = 180; this.player.y = 470 - this.player.h; this.player.vx = 0; this.player.vy = 0;
        this.player.climbing = false; this.player.ladderId = null; this.player.inVehicle = false;
      }
      this.camera.x = 0; this.camera.y = 0;
      this.objective.x = 850; this.objective.y = 380;
    }

    completeMission(actor = this.player) {
      if (!this.isBlackCocoonV121()) return super.completeMission(actor);
      const state = this.blackCocoonV121;
      if (!this.canBlackCocoonActV121(actor) || state.complete || state.rewardClaimed || this.missingBlackCocoonRequirementV121()) return false;
      const rewards = {
        credits: 550 + (Number(actor.kills) || 0) * 12 + (state.power === 'battery' ? 80 : 0),
        salvage: this.inventory.salvage, intel: this.inventory.intel, retries: this.mission.retries,
        elapsedSeconds: Math.round(this.mission.elapsed), noCasualty: this.mission.casualties === 0,
        vehicleRecovered: false, operationId: BLACK_COCOON_OPERATION_V121, route: state.route,
        quietPower: state.power === 'battery', quarantineComplete: true
      };
      state.complete = true; state.rewardClaimed = true; state.rewards = rewards;
      this.syncBlackCocoonWorldV121();
      const eventSink = this.onEvent;
      this.onEvent = event => {
        if (event.type === 'mission-complete') {
          this.mission.rewards = clone(rewards);
          eventSink({ ...event, rewards: clone(rewards), operationId: BLACK_COCOON_OPERATION_V121 });
        } else eventSink(event);
      };
      let completed = false;
      try { completed = super.completeMission(actor); } finally { this.onEvent = eventSink; }
      if (!completed) { state.complete = false; state.rewardClaimed = false; state.rewards = null; this.syncBlackCocoonWorldV121(); }
      return completed;
    }

    captureBlackCocoonCheckpointV121() {
      const snapshot = this.captureResumeState();
      if (snapshot.specialOperation) delete snapshot.specialOperation.blackCocoonCheckpointV121;
      return clone(snapshot);
    }
    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isBlackCocoonV121()) return base;
      return { ...base, specialOperation: { ...(base.specialOperation || {}), operationId: BLACK_COCOON_OPERATION_V121,
        blackCocoonV121: sanitizeBlackCocoonStateV121(this.blackCocoonV121),
        blackCocoonCheckpointV121: this.blackCocoonCheckpointV121 ? clone(this.blackCocoonCheckpointV121) : null } };
    }
    validateBlackCocoonResumeV121(raw) {
      const checked = validateBlackCocoonStateV121(raw?.specialOperation?.blackCocoonV121);
      if (!checked.valid) return checked;
      const identity = raw?.identity;
      if (raw.schema !== 1 || raw.specialOperation.operationId !== BLACK_COCOON_OPERATION_V121 || !identity
        || identity.campaignId !== this.campaign?.id || Number(identity.seed) !== Number(this.resumeIdentity?.seed)
        || identity.worldId !== this.resumeIdentity?.worldId || identity.levelSeedId !== this.resumeIdentity?.levelSeedId
        || identity.objectiveId !== this.resumeIdentity?.objectiveId || identity.editorProjectKind !== this.resumeIdentity?.editorProjectKind
        || raw.missionLevel?.signature !== this.missionLevelRuntime?.signature
        || checked.state.enemies.some(enemy => !safeProfiles.has(enemy.profileId))
        || (raw.mission?.state === 'complete') !== checked.state.complete
        || !['active', 'failed', 'complete'].includes(raw.mission?.state)) return { valid: false, reason: 'cocoon-identity-mismatch' };
      return checked;
    }
    applyResumeState(raw) {
      if (!this.isBlackCocoonV121()) return super.applyResumeState(raw);
      const checked = this.validateBlackCocoonResumeV121(raw);
      if (!checked.valid) return { applied: false, restored: 0, reason: checked.reason, specialOperationRestored: false };
      const previous = this.blackCocoonV121;
      this.blackCocoonV121 = checked.state;
      this.blackCocoonQuarantineWorldV121 = false;
      this.enemies = [];
      for (const descriptor of checked.state.enemies) this.blackCocoonSpawnV121(descriptor.profileId, descriptor.spawnX, descriptor.groundY, descriptor.role, false, descriptor);
      this.syncBlackCocoonWorldV121();
      const result = super.applyResumeState(raw);
      if (!result?.applied) { this.blackCocoonV121 = previous; this.syncBlackCocoonWorldV121(); return result; }
      this.blackCocoonV121.action = null; this.coopEnabled = false;
      this.player.climbing = false; this.player.ladderId = null; this.player.jumpBuffer = 0;
      this.missionLevelTimers?.clear(); this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear();
      const checkpoint = raw.specialOperation.blackCocoonCheckpointV121;
      if (checkpoint && this.validateBlackCocoonResumeV121(checkpoint).valid) {
        this.blackCocoonCheckpointV121 = clone(checkpoint);
        delete this.blackCocoonCheckpointV121.specialOperation.blackCocoonCheckpointV121;
      }
      this.syncBlackCocoonWorldV121();
      return { ...result, restored: (result.restored || 0) + 1, specialOperationRestored: true };
    }
    restartFromCheckpoint() {
      if (!this.isBlackCocoonV121()) return super.restartFromCheckpoint();
      if (this.mission?.state !== 'failed' || !this.blackCocoonCheckpointV121) return false;
      const retries = this.mission.retries + 1;
      const snapshot = clone(this.blackCocoonCheckpointV121);
      snapshot.mission.state = 'active'; snapshot.mission.failureReason = null;
      snapshot.mission.retries = retries;
      // Retry restores a captured transaction, not free ammunition or duplicate loot.
      snapshot.inventory.salvage = Math.max(0, Math.min(snapshot.inventory.salvage, this.inventory.salvage) - 20);
      const result = this.applyResumeState(snapshot);
      if (!result.applied) return false;
      this.clearGameplayInput?.();
      this.onEvent({ type: 'mission-restarted', operationId: BLACK_COCOON_OPERATION_V121, checkpoint: this.blackCocoonV121.phase, salvagePenalty: 20 });
      return true;
    }

    phaseLabel() { return this.isBlackCocoonV121() ? blackCocoonDossierV121(this.blackCocoonV121).title : super.phaseLabel(); }
    objectiveProgressText() {
      return this.isBlackCocoonV121() ? blackCocoonDossierV121(this.blackCocoonV121).instruction : super.objectiveProgressText();
    }
    getInteractionPrompt() {
      if (!this.isBlackCocoonV121()) return super.getInteractionPrompt();
      if (!this.player?.alive) return '';
      return this.blackCocoonInteractionV121()?.prompt || (this.blackCocoonV121.phase === 'hold' && !near(this.player, this.blackCocoonPropsV121.beacon2, 610) ? 'REVENIR À KAPPA · APPROCHE EN ATTENTE' : '');
    }
    getBlackCocoonSnapshotV121() {
      if (!this.isBlackCocoonV121()) return { blackCocoonV121: null };
      return { blackCocoonV121: { ...sanitizeBlackCocoonStateV121(this.blackCocoonV121),
        dossier: blackCocoonDossierV121(this.blackCocoonV121), localPlayers: 1,
        assets: { ...BLACK_COCOON_ASSETS_V121 }, props: clone(this.blackCocoonPropsV121 || {}),
        approachPaused: this.blackCocoonV121.phase === 'hold' && !near(this.player, this.blackCocoonPropsV121.beacon2, 610) } };
    }
    getSnapshot() { return { ...super.getSnapshot(), ...this.getBlackCocoonSnapshotV121() }; }
    getGameplayReport() { return { ...super.getGameplayReport(), ...this.getBlackCocoonSnapshotV121() }; }

    drawBackdrop(ctx) {
      if (!this.isBlackCocoonV121() || !this.blackCocoonV121.boarded) return super.drawBackdrop(ctx);
      ctx.fillStyle = '#0c1519'; ctx.fillRect(0, 0, 1280, 720);
      const image = this.images.get('bc121-quarantine');
      if (ready(image)) ctx.drawImage(image, 0, 80, 1280, 540);
    }
    drawBlackCocoonPropV121(ctx, prop, label, color = '#9bbda9', sheetKey = null, readyCell = false) {
      ctx.save(); ctx.fillStyle = '#10191bcc'; ctx.fillRect(prop.x - prop.w / 2, prop.groundY - prop.h, prop.w, prop.h);
      ctx.strokeStyle = color; ctx.strokeRect(prop.x - prop.w / 2, prop.groundY - prop.h, prop.w, prop.h);
      const image = sheetKey && this.images.get(`bc121-${sheetKey}`);
      // Existing reviewed equipment sheets are 2×2 at 512×512. Packed and
      // ready are authored poses, not a fabricated animation sequence.
      if (ready(image)) ctx.drawImage(image, readyCell ? 256 : 0, 0, 256, 256,
        prop.x - 36, prop.groundY - 72, 72, 72);
      ctx.font = '700 11px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = color;
      ctx.fillText(label, prop.x, prop.groundY - prop.h - 12); ctx.restore();
    }
    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isBlackCocoonV121()) return;
      const state = this.blackCocoonV121, props = this.blackCocoonPropsV121;
      if (state.boarded) {
        this.drawBlackCocoonPropV121(ctx, props.deposit, state.weaponsDeposited ? 'ARMES DÉPOSÉES' : 'RÂTELIER');
        this.drawBlackCocoonPropV121(ctx, props.scanner, 'SCAN BIOLOGIQUE', '#80c9dd');
        return;
      }
      // Resin silhouettes are environmental overlays, not fabricated animation art.
      ctx.save(); ctx.strokeStyle = '#6b756dcc'; ctx.lineWidth = 3;
      for (let x = 480; x < 3620; x += 190) {
        ctx.beginPath(); ctx.moveTo(x - 42, 603); ctx.bezierCurveTo(x + 10, 560, x - 20, 495, x + 45, 430); ctx.stroke();
      }
      ctx.restore();
      if (!state.freed) {
        const image = this.images.get('bc121-cocoon');
        if (ready(image)) ctx.drawImage(image, props.cocoon.x - 64, props.cocoon.groundY - 170, 128, 170);
        else this.drawBlackCocoonPropV121(ctx, { ...props.cocoon, h: 144, w: 90 }, 'COCON');
      }
      if (!state.equipmentRecovered) this.drawBlackCocoonPropV121(ctx, props.equipment, 'SAC');
      if (!state.battery) this.drawBlackCocoonPropV121(ctx, props.battery, 'BATTERIE', '#9bbda9', 'battery');
      this.drawBlackCocoonPropV121(ctx, props.relay, state.relayContact ? 'TANTALUS · LIAISON' : 'RELAIS');
      if (state.relayContact && !state.surfaceReached) {
        this.drawBlackCocoonPropV121(ctx, props.industrial, 'MOTEUR · 6 S', '#d4b087');
        this.drawBlackCocoonPropV121(ctx, props.cooling, 'VANNE · 3 S', '#80c9dd');
      }
      if (state.surfaceReached && !state.deltaAbandoned) this.drawBlackCocoonPropV121(ctx, props.delta, 'DELTA');
      if (state.deltaAbandoned) {
        this.drawBlackCocoonPropV121(ctx, props.beacon1, state.beacons[0] ? 'KAPPA 1 · ACTIVE' : 'KAPPA 1', '#80c9dd', 'beacon', state.beacons[0]);
        this.drawBlackCocoonPropV121(ctx, props.beacon2, state.beacons[1] ? 'KAPPA 2 · ACTIVE' : 'KAPPA 2', '#80c9dd', 'beacon', state.beacons[1]);
      }
      if (state.phase === 'board') {
        const image = this.images.get('bc121-transport');
        // Reviewed first-cell hull bounds also used by the Tantalus hangar.
        if (ready(image)) ctx.drawImage(image, 21, 153, 213, 87, props.ramp.x - 170, props.ramp.groundY - 210, 320, 131);
        this.drawBlackCocoonPropV121(ctx, props.ramp, 'RAMPE · TANTALUS');
      }
    }
    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isBlackCocoonV121()) return;
      const state = this.blackCocoonV121, dossier = blackCocoonDossierV121(state);
      ctx.save(); ctx.fillStyle = '#091318ed'; ctx.fillRect(18, 113, 850, 74);
      ctx.font = '700 13px monospace'; ctx.fillStyle = '#c7ddd5';
      ctx.fillText(`COCON NOIR · ${dossier.title} · ALERTE ${dossier.alertLevel}/5`, 32, 133);
      ctx.font = '12px monospace'; ctx.fillStyle = '#a9bec0';
      const words = dossier.instruction.split(' '); let line = '', y = 152;
      for (const word of words) {
        if (ctx.measureText(`${line} ${word}`).width > 815) { ctx.fillText(line, 32, y); y += 16; line = word; }
        else line += `${line ? ' ' : ''}${word}`;
      }
      ctx.fillText(line, 32, y);
      if (state.action) {
        const progress = state.action.kind === 'scan' ? state.scanProgress / 4 : state.action.kind === 'industrial' ? state.liftProgress / 6
          : state.action.kind === 'cooling' ? state.valveProgress / 3 : state.action.kind.startsWith('beacon') ? (state.action.progress || 0) / 2 : state.cocoonProgress / 4;
        ctx.fillStyle = '#23343b'; ctx.fillRect(392, 616, 496, 8); ctx.fillStyle = '#8fcdba'; ctx.fillRect(392, 616, 496 * clamp(progress, 0, 1), 8);
      }
      ctx.restore();
    }
  };
}
