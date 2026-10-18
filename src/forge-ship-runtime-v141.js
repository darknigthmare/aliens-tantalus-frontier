import { showForgeNarrativeV156 } from './forge-narrative-ui-v156.js';
import { forgeNarrativeViewV156, advanceForgeNarrativeTimeV157 } from './forge-narrative-v156.js';
/** Forge ship sessions reuse the native actor, collision and combat systems.
 * Room changes replace their local geometry; they never restart the hub loop or
 * run campaign routines, companions, commercial stations or native crises. */
import { HubGame as PhysicalHubV51, compileShipProject, HUB_WORLD } from './hub-v51-runtime.js';
import { decorative } from './forge-model-v130.js';
import { inspectForgeJourneyV141 } from './forge-journey-admission-v141.js';
import { createForgeSessionV141, forgeRoomProjectV141, outgoingForgeLinksV141,
  captureForgeRoomV141, restoreForgeRoomV141, commitForgeTransitionV141,
  findForgeArrivalV141, blockedForgeObjectivesV141, forgeInteractionClearV141 } from './forge-journey-v141.js';

export const FORGE_SHIP_BOUNDS_V141 = Object.freeze({ width: HUB_WORLD.width, height: 720 });
const clone = value => structuredClone(value);
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const roomOf = session => session.project.rooms.find(room => room.id === session.currentRoomId);
const physicalCells = (room, type) => room.cells.filter(cell => cell.type === type && !decorative(cell));
const distance = (actor, item) => {
  const dx = Math.max(item.x - actor.x - actor.w, actor.x - item.x - item.w, 0);
  const dy = Math.max(item.y - actor.y - actor.h, actor.y - item.y - item.h, 0);
  return { dx, dy, value: Math.hypot(dx, dy) };
};

export function withForgeShipRuntimeV141(Base) {
  return class ForgeShipRuntimeV141 extends Base {
    get forgeProjectV141() { return this.forgeSessionV141?.project || null; }
    get forgeActiveRoomIdV141() { return this.forgeSessionV141?.currentRoomId || null; }
    get editorShipBoundsV141() { return this.forgeSessionV141 ? FORGE_SHIP_BOUNDS_V141 : null; }

    start(hubState = {}, options = {}) {
      if (options.editorProject?.kind !== 'ship' || options.forgeJourneyV141 !== true) {
        this.closeForgeNarrativeV156?.({ focus: false });
        this.forgeSessionV141 = null;
        this.forgeShipStartingV141 = false;
        this.forgeTransitionRefusalV141 = null;
        return super.start(hubState, options);
      }
      // Admission and compilation precede any mutation of the running engine.
      const session = createForgeSessionV141(options.editorProject, { kind: 'ship' });
      const entry = forgeRoomProjectV141(session.project);
      const audit = inspectForgeJourneyV141(session.project);
      if (!audit.ok) throw new Error(`Test Forge refusé : ${audit.errors.join(' ')}`);
      const health = clamp(Number.isFinite(Number(hubState.playerHealth ?? hubState.health))
        ? Number(hubState.playerHealth ?? hubState.health) : 100, 0, 100);
      this.closeForgeNarrativeV156?.({ focus: false });
      this.forgeSessionV141 = session;
      this.forgeShipStartingV141 = true;
      this.forgeTransitionRefusalV141 = null;
      try {
        super.start({ deck: 0, roomId: 'bridge', visited: [], facing: hubState.facing,
          playerHealth: health, activeCrisis: null }, { ...options, editorProject: entry,
          routineContextV62: {}, onboardingV84: null, openingV88: null,
          openingExerciseV89: null, portMeridienV90: null });
        const runtime = this.buildForgeShipRoomV141(session.currentRoomId);
        this.applyForgeShipRoomV141(runtime);
        Object.assign(this.player, { health, alive: health > 0, w: 44, h: 92,
          x: runtime.compiled.spawn.x, y: runtime.compiled.spawn.y, vx: 0, vy: 0,
          grounded: true, climbing: false, crouching: false });
        this.spawnPoint = { x: this.player.x, y: this.player.y };
        this.state.roomId = session.currentRoomId;
        this.state.positionX = Math.round(this.player.x);
        this.state.visited = [session.currentRoomId];
        this.camera.x = clamp(this.player.x - 640, 0, HUB_WORLD.width - 1280);
        this.keys.clear();
        this.jumpQueued = 0;
      } finally { this.forgeShipStartingV141 = false; }
      this.persist();
      this.statusKey = '';
      this.emitStatus();
      this.draw();
    }

    initializeNpcRoutinesV62(...args) {
      if (!this.forgeSessionV141) return super.initializeNpcRoutinesV62(...args);
      this.npcRoutineContextV62 = {};
      this.npcRoutineResolutionsV62 = new Map();
      this.npcRoutineHubStateV62 = {};
      return this.npcRoutineResolutionsV62;
    }
    setNpcRoutineContextV62(...args) {
      return this.forgeSessionV141 ? [] : super.setNpcRoutineContextV62(...args);
    }
    createNpcs(...args) { return this.forgeSessionV141 ? [] : super.createNpcs(...args); }
    createObstacles(...args) { return this.forgeSessionV141 ? [] : super.createObstacles(...args); }
    configureCrisis(...args) {
      if (!this.forgeSessionV141) return super.configureCrisis(...args);
      this.crisis = null;
      if (this.state) this.state.activeCrisis = null;
    }

    buildForgeShipRoomV141(roomId) {
      const session = this.forgeSessionV141;
      const room = session.project.rooms.find(entry => entry.id === roomId);
      const compiled = compileShipProject(forgeRoomProjectV141(session.project, roomId));
      const bind = (entries, type) => {
        const cells = physicalCells(room, type);
        return entries.map((entry, index) => ({ ...entry, id: cells[index].id, cellId: cells[index].id }));
      };
      const runtime = { compiled,
        doors: bind(compiled.doors, 'door'), terminals: bind(compiled.terminals, 'terminal'),
        objectives: bind(compiled.objectives, 'objective'),
        enemies: bind(compiled.enemies, 'enemy').map((entry, index) => ({
          ...this.createEnemy(entry, index, 'editor'), cellId: entry.cellId })),
        projectiles: [], hazardClock: 0 };
      const restored = restoreForgeRoomV141(session, roomId);
      if (restored) for (const key of ['doors', 'terminals', 'objectives', 'enemies', 'projectiles', 'hazardClock']) {
        if (restored[key] !== undefined) runtime[key] = restored[key];
      }
      for (const objective of runtime.objectives) if (session.completedObjectives.includes(objective.cellId)) objective.complete = true;
      return runtime;
    }

    applyForgeShipRoomV141(runtime) {
      this.compiledProject = runtime.compiled;
      PhysicalHubV51.prototype.configureTraversal.call(this);
      this.v51Doors = runtime.doors;
      this.v51Terminals = runtime.terminals;
      this.v51Objectives = runtime.objectives;
      this.v51Hazards = runtime.compiled.hazards.map(entry => ({ ...entry }));
      this.enemies = runtime.enemies;
      this.projectiles = runtime.projectiles;
      this.hazardClock = runtime.hazardClock;
      this.npcs = [];
      this.obstacles = [];
      this.doorStates = [];
      this.useGlobalFloor = false;
      this.crisis = null;
      this.state.activeCrisis = null;
      this.route = { ...runtime.compiled.route, source: 'forge-journey-v141',
        roomId: this.forgeSessionV141.currentRoomId,
        roomCount: this.forgeSessionV141.project.rooms.length,
        linkedExits: outgoingForgeLinksV141(this.forgeSessionV141.project, this.forgeSessionV141.currentRoomId).length };
    }

    captureForgeShipRoomV141() {
      const session = this.forgeSessionV141;
      return captureForgeRoomV141(session, session.currentRoomId, {
        doors: this.v51Doors, terminals: this.v51Terminals, objectives: this.v51Objectives,
        enemies: this.enemies, projectiles: this.projectiles, hazardClock: this.hazardClock || 0
      });
    }

    currentRoom() {
      if (!this.forgeSessionV141) return super.currentRoom();
      const room = roomOf(this.forgeSessionV141);
      return { id: room.id, name: room.name, index: 0, xStart: 0, xEnd: HUB_WORLD.width,
        x: HUB_WORLD.width / 2, profile: { worldWidth: HUB_WORLD.width },
        collisionSource: 'forge-journey-v141' };
    }
    enterCurrentRoom(force) {
      if (!this.forgeSessionV141) return super.enterCurrentRoom(force);
      // The authored room owns the full native width, including x > 1280.
      this.state.roomId = this.forgeSessionV141.currentRoomId;
    }
    nearestInteraction(...args) { return this.forgeSessionV141 ? null : super.nearestInteraction(...args); }
    nearestLift(...args) { return this.forgeSessionV141 ? undefined : super.nearestLift(...args); }
    useLift(...args) { return this.forgeSessionV141 ? false : super.useLift(...args); }
    stop(...args) {
      this.closeForgeNarrativeV156?.({ focus: false });
      return super.stop(...args);
    }
    fire(...args) {
      if (this.forgeNarrativeOpenV156) return false;
      return this.forgeSessionV141 ? PhysicalHubV51.prototype.fire.apply(this, args) : super.fire(...args);
    }

    update(delta) {
      if (!this.forgeSessionV141) return super.update(delta);
      if (!this.running || this.forgeShipStartingV141 || this.forgeNarrativeOpenV156 || this.paused) return;
      // Keep native physics/combat while excluding every campaign tick wrapper.
      const step = Number.isFinite(delta) ? clamp(delta, 0, .05) : 0;
      const active = this.player?.alive && !this.forgeSessionV141.complete;
      const result = PhysicalHubV51.prototype.update.call(this, step);
      if (active) advanceForgeNarrativeTimeV157(this.forgeSessionV141, step);
      return result;
    }
    updateCombat(delta) {
      return this.forgeSessionV141
        ? PhysicalHubV51.prototype.updateCombat.call(this, delta) : super.updateCombat(delta);
    }
    updateEditorGameplay(delta) {
      if (!this.forgeSessionV141) return super.updateEditorGameplay(delta);
      this.hazardClock = Math.max(0, (this.hazardClock || 0) - delta);
      const hazard = this.v51Hazards.find(entry => this.player.x < entry.x + entry.w
        && this.player.x + this.player.w > entry.x && this.player.y < entry.y + entry.h
        && this.player.y + this.player.h > entry.y);
      if (hazard && this.hazardClock <= 0) {
        this.hazardClock = .55;
        this.damagePlayer(hazard.damage);
      }
      // Objectives are explicit E interactions, never incidental contacts.
    }

    nearestForgeInteractionV141() {
      if (!this.forgeSessionV141 || !this.player?.alive) return null;
      const candidates = [];
      for (const [type, entries] of [['door', this.v51Doors], ['terminal', this.v51Terminals], ['objective', this.v51Objectives]]) {
        for (const entity of entries || []) {
          const narrative = type === 'terminal' && roomOf(this.forgeSessionV141).cells.some(cell => cell.id === entity.cellId && cell.narrative);
          if (type === 'objective' && entity.complete || type === 'terminal' && entity.activated && !narrative) continue;
          const gap = distance(this.player, entity);
          if (gap.dx <= (type === 'door' ? 90 : 72) && gap.dy <= 36
            && this.forgeShipInteractionClearV141(entity)) candidates.push({ type, entity, distance: gap.value });
        }
      }
      return candidates.sort((a, b) => a.distance - b.distance)[0] || null;
    }

    forgeShipInteractionClearV141(target) {
      return forgeInteractionClearV141({ actor: this.player, target,
        solids: [...this.v51Walls, ...this.v51Doors.filter(door => door.progress < .82)] });
    }

    travelForgeShipLinkV141(link) {
      const session = this.forgeSessionV141;
      const allowed = session && outgoingForgeLinksV141(session.project, session.currentRoomId)
        .find(entry => entry.id === link?.id && entry.from.cellId === link?.from?.cellId);
      if (this.forgeNarrativeOpenV156 || !allowed || !this.running || !this.player?.alive) return false;
      const sourceDoor = this.v51Doors.find(entry => entry.cellId === allowed.from.cellId);
      const gap = sourceDoor && distance(this.player, sourceDoor);
      if (!gap || gap.dx > 90 || gap.dy > 36 || !this.forgeShipInteractionClearV141(sourceDoor)) return false;
      const stranded = blockedForgeObjectivesV141(session, allowed.to.roomId);
      if (stranded.length) {
        this.forgeTransitionRefusalV141 = { linkId: allowed.id, roomId: allowed.to.roomId,
          reason: 'unfinished-objectives-behind-one-way-link', objectiveIds: stranded };
        this.statusKey = '';
        this.emitStatus();
        this.onAction({ action: 'editor:room-transition-refused', ...clone(this.forgeTransitionRefusalV141) });
        return false;
      }
      const target = this.buildForgeShipRoomV141(allowed.to.roomId);
      const targetDoor = target.doors.find(entry => entry.cellId === allowed.to.cellId);
      const arrival = findForgeArrivalV141({ door: targetDoor, actor: this.player,
        bounds: FORGE_SHIP_BOUNDS_V141, surfaces: [...target.compiled.floors, ...target.compiled.platforms],
        solids: [...target.compiled.floors, ...target.compiled.platforms, ...target.compiled.walls,
          ...target.compiled.vents, ...target.doors.filter(entry => !entry.open || entry.progress < .82),
          // Native movement keeps the full body 24px from either world edge.
          { x: 0, y: 0, w: 24, h: FORGE_SHIP_BOUNDS_V141.height },
          { x: HUB_WORLD.width - 24, y: 0, w: 24, h: FORGE_SHIP_BOUNDS_V141.height }],
        hazards: target.compiled.hazards, occupied: target.enemies.filter(enemy => enemy.alive) });
      if (!arrival.ok || arrival.x < 24 || arrival.x + this.player.w > HUB_WORLD.width - 24) {
        this.forgeTransitionRefusalV141 = { linkId: allowed.id,
          roomId: allowed.to.roomId, reason: arrival.ok ? 'destination-outside-actor-margin' : arrival.reason };
        this.statusKey = '';
        this.emitStatus();
        this.onAction({ action: 'editor:room-transition-refused', ...this.forgeTransitionRefusalV141 });
        return false;
      }
      // Nothing above mutates the source, destination, player or room ledger.
      sourceDoor.open = true;
      sourceDoor.progress = 1;
      this.captureForgeShipRoomV141();
      targetDoor.open = true;
      targetDoor.progress = 1;
      commitForgeTransitionV141(session, allowed);
      this.applyForgeShipRoomV141(target);
      Object.assign(this.player, { x: arrival.x, y: arrival.y, vx: 0, vy: 0,
        grounded: true, climbing: false, crouching: false });
      this.spawnPoint = { x: arrival.x, y: arrival.y };
      this.state.roomId = session.currentRoomId;
      this.state.positionX = Math.round(this.player.x);
      if (!this.state.visited.includes(session.currentRoomId)) this.state.visited.push(session.currentRoomId);
      this.camera.x = clamp(this.player.x - 640, 0, HUB_WORLD.width - 1280);
      this.keys.clear();
      this.jumpQueued = 0;
      this.coyoteTime = .1;
      this.forgeTransitionRefusalV141 = null;
      this.roomChangePulse = this.reducedMotion ? .35 : 1.25;
      this.persist();
      this.statusKey = '';
      this.emitStatus();
      this.draw();
      this.audio?.ui?.();
      this.onAction({ action: 'editor:room-transition', ...clone(session.lastTransition), roomId: session.currentRoomId });
      return true;
    }

    interact() {
      if (!this.forgeSessionV141) return super.interact();
      if (this.forgeNarrativeOpenV156 || !this.running || this.forgeShipStartingV141 || !this.player.alive) return false;
      const interaction = this.nearestForgeInteractionV141();
      if (!interaction) return false;
      const { type, entity } = interaction;
      if (type === 'door') {
        const link = outgoingForgeLinksV141(this.forgeSessionV141.project, this.forgeSessionV141.currentRoomId)
          .find(entry => entry.from.cellId === entity.cellId);
        if (link) return this.travelForgeShipLinkV141(link);
        entity.open = !entity.open;
      } else if (type === 'terminal') {
        const cell = roomOf(this.forgeSessionV141).cells.find(cell => cell.id === entity.cellId);
        if (cell?.narrative) {
          const owner = this.forgeSessionV141, roomId = owner.currentRoomId;
          const shown = showForgeNarrativeV156(this, entity.cellId, result => {
            for (const objective of this.v51Objectives) if (this.forgeSessionV141.completedObjectives.includes(objective.cellId)) objective.complete = true;
            const required = this.forgeSessionV141.project.rooms.filter(room => this.forgeSessionV141.reachableRoomIds.includes(room.id)).flatMap(room => physicalCells(room, 'objective'));
            if (!this.forgeSessionV141.complete && required.length && required.every(cell => this.forgeSessionV141.completedObjectives.includes(cell.id))) {
              this.forgeSessionV141.complete = true; this.onAction({ action: 'editor:project-complete', objectives: required.length });
            }
            if (!this.running || this.forgeSessionV141 !== owner) return;
            this.onAction({ action: 'editor:narrative-choice', terminalId: entity.cellId, roomId, ...result });
            if (!this.running || this.forgeSessionV141 !== owner) return;
            this.persist(); this.statusKey = ''; this.emitStatus();
          });
          if (shown) { entity.activated = true; this.persist(); this.statusKey = ''; this.emitStatus(); }
          return shown;
        }
        entity.activated = true;
        this.onAction({ action: 'editor:terminal', terminalId: entity.cellId, roomId: this.forgeActiveRoomIdV141 });
      } else {
        const pendingTerminals = this.v51Terminals.filter(terminal => !terminal.activated);
        if (pendingTerminals.length) {
          this.onAction({ action: 'editor:objective-locked', objectiveId: entity.cellId,
            roomId: this.forgeActiveRoomIdV141, terminalIds: pendingTerminals.map(terminal => terminal.cellId) });
          this.statusKey = '';
          this.emitStatus();
          return false;
        }
        entity.complete = true;
        this.forgeSessionV141.completedObjectives.push(entity.cellId);
        this.onAction({ action: 'editor:objective-complete', objectiveId: entity.cellId, roomId: this.forgeActiveRoomIdV141 });
        const required = this.forgeSessionV141.project.rooms
          .filter(room => this.forgeSessionV141.reachableRoomIds.includes(room.id))
          .flatMap(room => physicalCells(room, 'objective'));
        if (required.length && required.every(cell => this.forgeSessionV141.completedObjectives.includes(cell.id))) {
          this.forgeSessionV141.complete = true;
          this.onAction({ action: 'editor:project-complete', objectives: required.length });
        }
      }
      this.forgeTransitionRefusalV141 = null;
      this.persist();
      this.statusKey = '';
      this.emitStatus();
      this.audio?.ui?.();
      return true;
    }

    persist() {
      if (!this.forgeSessionV141) return super.persist();
      if (this.forgeShipStartingV141 || !this.player || !this.state) return;
      this.captureForgeShipRoomV141();
      this.onPersist({ playerHealth: this.player.health,
        forgeSessionV141: { schema: 141, currentRoomId: this.forgeActiveRoomIdV141,
          completedObjectives: clone(this.forgeSessionV141.completedObjectives),
          transitions: this.forgeSessionV141.transitions,
          narrativeV156: clone(this.forgeSessionV141.narrativeV156 || []),
          narrativeInventoryV157: clone(this.forgeSessionV141.narrativeInventoryV157 || []),
          narrativePlaySecondsV157: this.forgeSessionV141.narrativePlaySecondsV157 || 0,
          roomStates: clone(this.forgeSessionV141.roomStates) } });
    }

    statusPrompt() {
      if (!this.forgeSessionV141) return super.statusPrompt();
      if (!this.player?.alive) return 'MARINE À TERRE · RETOUR FRONTIER FORGE';
      if (this.forgeTransitionRefusalV141) return this.forgeTransitionRefusalV141.reason === 'unfinished-objectives-behind-one-way-link'
        ? 'SAS À SENS UNIQUE · VALIDEZ LES OBJECTIFS AVANT DE QUITTER LA ZONE'
        : 'SAS REFUSÉ · ARRIVÉE OBSTRUÉE OU SANS SOL SÛR';
      const interaction = this.nearestForgeInteractionV141();
      if (interaction?.type === 'door') {
        const link = outgoingForgeLinksV141(this.forgeSessionV141.project, this.forgeActiveRoomIdV141)
          .find(entry => entry.from.cellId === interaction.entity.cellId);
        const target = link && this.forgeSessionV141.project.rooms.find(room => room.id === link.to.roomId);
        return target ? `E — REJOINDRE ${target.name.toUpperCase()}` : 'E — ACTIONNER LE SAS';
      }
      if (interaction?.type === 'terminal') return roomOf(this.forgeSessionV141).cells.some(cell => cell.id === interaction.entity.cellId && cell.narrative)
        ? 'E — LIRE LE RÉCIT DU TERMINAL' : 'E — ACTIVER LE TERMINAL';
      if (interaction?.type === 'objective') return this.v51Terminals.some(terminal => !terminal.activated)
        ? 'OBJECTIF VERROUILLÉ · ACTIVEZ TOUS LES TERMINAUX DE CETTE SALLE'
        : 'E — VALIDER L’OBJECTIF';
      // Interaction prompts use the same physical reach check as E. The old
      // native fallback advertises nearby doors/terminals through partitions.
      const threats = this.enemies.filter(enemy => enemy.alive).length;
      if (threats) return `F / ENTRÉE — TIRER · ${threats} MENACE${threats > 1 ? 'S' : ''}`;
      if (this.nearestTraversalLadder()) return 'W / S — GRIMPER · ESPACE — SAUTER';
      if (this.nearbyCrawlVentV138()) return 'C — MAINTENIR POUR RAMPER SOUS LA GRILLE';
      return 'A / D — MARCHER · ESPACE — SAUTER · E — UTILISER';
    }
    emitStatus() {
      if (!this.forgeSessionV141) return super.emitStatus();
      if (!this.state || !this.player || this.forgeShipStartingV141) return;
      const payload = { deck: 0, deckName: 'FRONTIER FORGE', roomId: this.forgeActiveRoomIdV141,
        roomName: roomOf(this.forgeSessionV141).name, prompt: this.statusPrompt(),
        health: Math.round(this.player.health), threats: this.enemies.filter(enemy => enemy.alive).length,
        visited: this.state.visited.length, route: this.route, editorPlaytest: true,
        forgeJourneyV141: { transitions: this.forgeSessionV141.transitions,
          objectives: this.forgeSessionV141.completedObjectives.length } };
      const key = JSON.stringify(payload);
      if (key === this.statusKey) return;
      this.statusKey = key;
      this.onStatus(payload);
    }
    getSnapshot() {
      const snapshot = super.getSnapshot();
      if (!this.forgeSessionV141) return snapshot;
      const session = clone(this.forgeSessionV141);
      if (this.player && !this.forgeShipStartingV141) session.roomStates[session.currentRoomId] = clone({
        doors: this.v51Doors, terminals: this.v51Terminals, objectives: this.v51Objectives,
        enemies: this.enemies, projectiles: this.projectiles, hazardClock: this.hazardClock || 0 });
      return { ...snapshot, roomComposition: 'forge-authored-room-v141', roomBackground: null,
        forgeJourneyV141: session, forgeTransitionRefusalV141: clone(this.forgeTransitionRefusalV141),
        narrativeDialogV156: this.forgeNarrativeOpenV156 ? forgeNarrativeViewV156(this.forgeSessionV141, this.forgeNarrativeOpenV156) : null,
        editorShipBoundsV141: FORGE_SHIP_BOUNDS_V141 };
    }
  };
}
