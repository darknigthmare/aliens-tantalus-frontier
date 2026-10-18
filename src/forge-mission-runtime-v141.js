import { showForgeNarrativeV156 } from './forge-narrative-ui-v156.js';
import { forgeNarrativeViewV156 } from './forge-narrative-v156.js';
import { decorative } from './forge-model-v130.js';
import { inspectForgeJourneyV141 } from './forge-journey-admission-v141.js';
import { buildForgeObjectiveV136, EDITOR_MISSION_WORLD_V136 } from './editor-spatial-v136.js';
import { createForgeSessionV141, forgeRoomProjectV141, outgoingForgeLinksV141,
  captureForgeRoomV141, restoreForgeRoomV141, commitForgeTransitionV141, findForgeArrivalV141,
  forgeInteractionClearV141 } from './forge-journey-v141.js';
import { blockedForgeObjectivesV141 } from './forge-journey-v141.js';

const clone = value => structuredClone(value);
const list = value => Array.isArray(value) ? value : [];
const interactionDistance = (a, b) => Math.hypot(a.x + a.w / 2 - b.x - b.w / 2, a.y + a.h / 2 - b.y - b.h / 2);
const near = (a, b, range = 125) => a && b && interactionDistance(a, b) < range;
const ROOM_FIELDS = ['platforms', 'walls', 'lifts', 'ladders', 'covers', 'doors', 'powerNode', 'vents', 'ventShortcut',
  'vehicle', 'weaponPickup', 'toolPickup', 'supplies', 'hazards', 'drops', 'bullets', 'hostileProjectiles', 'particles',
  'enemies', 'objective', 'editorMode', 'editorProjectKind', 'editorGridV136', 'editorTileCount', 'editorTileCounts',
  'editorSpawn', 'objectiveRuntime', 'objectiveState', 'objectiveNodes', 'checkpoint', 'enemyTacticsV130'];
ROOM_FIELDS.push('supportDeployments', 'weaponProjectilesV130', 'weaponProjectilesV131', 'weaponBeamsV131',
  'recoverableWeaponsV131', 'weaponStatusesV131', 'placeableAttackTasksV86');

function partyReferences(engine) {
  return new Map([[engine.player, 'player'], [engine.coop, 'coop'],
    ...list(engine.squadActors).map(member => [member, `crew:${member.crewId || member.operatorId}`])].filter(([actor]) => actor));
}

/** Projectiles/status maps refer to the live operators. A room snapshot must
 * preserve those identities rather than creating cloned Marines on return. */
function mapRoomGraph(value, resolve, seen = new Map()) {
  const replacement = resolve(value);
  if (replacement !== undefined) return replacement;
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  if (value instanceof Date) return new Date(value);
  const output = value instanceof Map ? new Map() : value instanceof Set ? new Set() : Array.isArray(value) ? [] : {};
  seen.set(value, output);
  if (value instanceof Map) for (const [key, item] of value) output.set(mapRoomGraph(key, resolve, seen), mapRoomGraph(item, resolve, seen));
  else if (value instanceof Set) for (const item of value) output.add(mapRoomGraph(item, resolve, seen));
  else for (const key of Object.keys(value)) output[key] = mapRoomGraph(value[key], resolve, seen);
  return output;
}

function attachCells(engine, room) {
  const cells = room.cells.filter(cell => !decorative(cell)), of = type => cells.filter(cell => cell.type === type);
  for (const [type, field] of [['door', 'doors'], ['enemy', 'enemies'], ['vent', 'vents'], ['hazard', 'hazards']]) {
    for (const [index, entity] of list(engine[field]).entries()) {
      entity.forgeCellIdV141 = of(type)[index]?.id || null;
      if (type === 'enemy') entity.id = `forge:${entity.forgeCellIdV141}`;
    }
  }
  for (const [type, field, index] of [['objective', 'objective', 0], ['terminal', 'powerNode', 0], ['terminal', 'archiveTerminal', 1]]) {
    if (engine[field]) engine[field].forgeCellIdV141 = of(type)[index]?.id || null;
  }
}

// Archive data is deliberately in the same room transaction as power and loot.
ROOM_FIELDS.push('archiveTerminal');

export function withForgeMissionRuntimeV141(BaseEngine) {
  return class ForgeMissionRuntimeV141 extends BaseEngine {
    start(options = {}) {
      let session = null;
      if (options.forgeJourneyV141 === true && options.editorProject?.kind === 'mission') {
        session = createForgeSessionV141(options.editorProject, { kind: 'mission' });
        const report = inspectForgeJourneyV141(session.project);
        if (!report.ok) throw new Error(`Test Forge refusé : ${report.errors.join(' ')}`);
        options = { ...options, editorProject: forgeRoomProjectV141(session.project), resumeState: null,
          narrativeArchiveSave: clone(options.narrativeArchiveSave || {}),
          narrativeArchives: clone(options.narrativeArchives || {}),
          narrativeEvidenceV132: clone(options.narrativeEvidenceV132 || {}),
          onNarrativeArchivesChange: null };
      }
      this.closeForgeNarrativeV156?.({ focus: false });
      this.forgeSessionV141 = null;
      this.forgeProjectV141 = null;
      this.forgeActiveRoomIdV141 = null;
      const result = super.start(options);
      if (!session) return result;
      this.forgeSessionV141 = session;
      this.forgeProjectV141 = session.project;
      this.forgeActiveRoomIdV141 = session.currentRoomId;
      this.forgeMissionCatalogV141 = list(options.enemyCatalog);
      const room = session.project.rooms.find(entry => entry.id === session.currentRoomId);
      attachCells(this, room);
      if (!room.cells.some(cell => cell.type === 'objective' && !decorative(cell))) this.objective = null;
      // The authoring format has no supply/weapon pickup markers. Reference
      // campaign pickups must not appear at unrelated coordinates in this map.
      this.supplies = [];
      if (this.weaponPickup) this.weaponPickup.taken = true;
      if (this.toolPickup) this.toolPickup.taken = true;
      this.forgeRequiredObjectivesV141 = session.project.rooms.filter(entry => session.reachableRoomIds.includes(entry.id))
        .flatMap(entry => entry.cells.filter(cell => cell.type === 'objective' && !decorative(cell)).map(cell => cell.id));
      return { ...result, forgeJourneyV141: this.getForgeJourneySnapshotV141() };
    }

    captureForgeMissionRoomV141() {
      const fields = Object.fromEntries(ROOM_FIELDS.map(key => [key, this[key] ?? null]));
      const references = partyReferences(this);
      return mapRoomGraph({ ...fields, missionObjectives: this.mission.objectives, missionPhase: this.mission.phase,
        roomPlaceablesV141: list(this.placeablesV86?.instances).filter(instance => instance.onGround) },
      value => references.has(value) ? { forgeOperatorRefV141: references.get(value) } : undefined);
    }

    prepareForgeMissionRoomV141(roomId) {
      const session = this.forgeSessionV141, saved = restoreForgeRoomV141(session, roomId);
      if (saved) return saved;
      const room = session.project.rooms.find(entry => entry.id === roomId);
      const temporary = Object.create(this);
      // Compilation may create enemies, but may not advance the live RNG or
      // mutate an inherited pickup while a destination is only being examined.
      temporary.random = () => .5;
      temporary.toolPickup = { ...this.toolPickup, taken: true };
      temporary.weaponPickup = { ...this.weaponPickup, taken: true };
      temporary.objective = null;
      temporary.applyEditorProject(forgeRoomProjectV141(session.project, roomId), this.forgeMissionCatalogV141);
      attachCells(temporary, room);
      temporary.supplies = [];
      temporary.drops = []; temporary.bullets = []; temporary.hostileProjectiles = []; temporary.particles = [];
      temporary.supportDeployments = []; temporary.weaponProjectilesV130 = []; temporary.weaponProjectilesV131 = [];
      temporary.weaponBeamsV131 = []; temporary.recoverableWeaponsV131 = [];
      temporary.weaponStatusesV131 = new Map(); temporary.placeableAttackTasksV86 = new Map();
      temporary.placeablesV86 = { instances: [] };
      temporary.objectiveRuntime = buildForgeObjectiveV136(temporary);
      temporary.objectiveState = { ...clone(this.objectiveState), started: false, complete: false, failed: false };
      temporary.objectiveNodes = [];
      temporary.checkpoint = null;
      temporary.enemyTacticsV130 = { schema: 130, time: 0, noiseSerial: 0, noises: [], entries: 0, transitions: 0 };
      temporary.mission = { ...this.mission, phase: 'extract', objectives: {
        power: !temporary.powerNode, route: true, boss: !temporary.enemies.some(enemy => enemy.isBoss && enemy.alive),
        archive: !temporary.archiveTerminal, extract: false
      } };
      return temporary.captureForgeMissionRoomV141();
    }

    forgeLinkedDoorV141(actor = this.player) {
      const session = this.forgeSessionV141;
      if (!session || !actor) return null;
      const choices = outgoingForgeLinksV141(session.project, session.currentRoomId).flatMap(link => {
        const door = this.doors.find(entry => entry.forgeCellIdV141 === link.from.cellId);
        if (!door || Math.abs(actor.x + actor.w / 2 - door.x - door.w / 2) >= 118
          || actor.y + actor.h <= door.y || actor.y >= door.y + door.h) return [];
        return [{ link, door, distance: Math.abs(actor.x + actor.w / 2 - door.x - door.w / 2) }];
      });
      return choices.sort((a, b) => a.distance - b.distance)[0] || null;
    }

    travelForgeMissionV141(link, actor = this.player) {
      const session = this.forgeSessionV141, nearest = this.forgeLinkedDoorV141(actor);
      if (this.forgeNarrativeOpenV156 || !session || nearest?.link.id !== link?.id || !this.canPerformGameplayAction(actor, { allowSquadTask: true })) return false;
      if (!this.forgeInteractionClearV141(actor, nearest.door)) return this.locked('SAS INACCESSIBLE DERRIÈRE UNE CLOISON');
      const requirement = this.doorRequirement(nearest.door);
      if (requirement || nearest.door.levelLocked) return this.locked(requirement || 'SAS VERROUILLÉ');
      if (blockedForgeObjectivesV141(session, nearest.link.to.roomId).length) return this.locked('VALIDER LES OBJECTIFS RESTANTS AVANT CE SAS SANS RETOUR');
      const party = [...new Set([this.player, this.coopEnabled ? this.coop : null,
        ...list(this.activeSquadActors?.())].filter(member => member && (member.alive || member.downed)))];
      if (party.some(member => member.inVehicle || member.ventTransit || member.climbing)) return this.locked('REGROUPER L’ÉQUIPE À PIED AVANT LE SAS');
      if (party.some(member => this.isPlaceableBusyV86?.(member) || this.isFieldActionBusyV124?.(member)
        || this.isVehicleAccessLockedV59?.(member))) return this.locked('TERMINER LES ACTIONS DE L’ÉQUIPE AVANT LE SAS');
      let target;
      try { target = this.prepareForgeMissionRoomV141(nearest.link.to.roomId); }
      catch { return this.locked('SALLE DE DESTINATION INVALIDE'); }
      const door = list(target.doors).find(entry => entry.forgeCellIdV141 === nearest.link.to.cellId);
      const solids = [...list(target.walls), ...list(target.platforms), ...list(target.covers).filter(entry => !entry.destroyed),
        ...list(target.doors).filter(entry => !entry.open || Number(entry.progress) < .82),
        ...(target.vehicle?.active && !target.vehicle.destroyed ? [target.vehicle] : [])];
      const occupied = [...list(target.enemies).filter(enemy => enemy.alive && !enemy.dormant),
        ...list(target.roomPlaceablesV141).filter(instance => instance.onGround && instance.health > 0)], arrivals = [];
      for (const member of party) {
        const arrival = findForgeArrivalV141({ door, actor: member, bounds: EDITOR_MISSION_WORLD_V136,
          surfaces: list(target.platforms), solids, hazards: list(target.hazards), occupied: [...occupied, ...arrivals] });
        if (!arrival.ok) return this.locked('ARRIVÉE DU SAS OBSTRUÉE OU SANS SOL');
        arrivals.push({ ...arrival, w: member.w, h: member.h });
      }
      const source = this.captureForgeMissionRoomV141();
      const sourceDoor = source.doors.find(entry => entry.forgeCellIdV141 === nearest.link.from.cellId);
      Object.assign(sourceDoor, { open: true, progress: 1 });
      Object.assign(door, { open: true, progress: 1 });
      captureForgeRoomV141(session, session.currentRoomId, source);
      commitForgeTransitionV141(session, nearest.link);
      const references = new Map([...partyReferences(this)].map(([operator, id]) => [id, operator]));
      target = mapRoomGraph(target, value => value?.forgeOperatorRefV141 ? references.get(value.forgeOperatorRefV141) || null : undefined);
      for (const key of ROOM_FIELDS) this[key] = target[key];
      if (this.placeablesV86) this.placeablesV86.instances = [
        ...list(this.placeablesV86.instances).filter(instance => !instance.onGround), ...list(target.roomPlaceablesV141)
      ];
      this.placeablePreviewsV86?.clear();
      this.syncPlaceableBarriersV132?.();
      this.mission.objectives = target.missionObjectives;
      this.mission.phase = target.missionPhase;
      if (this.objective && session.completedObjectives.includes(this.objective.forgeCellIdV141)) {
        this.objective.complete = true; this.objectiveState.complete = true;
      }
      for (const [index, member] of party.entries()) Object.assign(member, {
        x: arrivals[index].x, y: arrivals[index].y, vx: 0, vy: 0, grounded: true, climbing: false, inCover: false,
        ladderId: null, jumpBuffer: 0, coyoteTime: .1
      });
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      this.camera.x = Math.max(0, Math.min(4920, this.player.x - 320));
      this.camera.y = Math.max(0, Math.min(360, this.player.y - 360));
      this.forgeActiveRoomIdV141 = session.currentRoomId;
      this.tracker.contacts = [];
      this.clearGameplayInput();
      this.onEvent({ type: 'forge-room-transition', ...clone(session.lastTransition), roomId: session.currentRoomId });
      return true;
    }

    stop(...args) {
      this.closeForgeNarrativeV156?.({ focus: false });
      return super.stop(...args);
    }

    update(delta) {
      if (this.forgeNarrativeOpenV156) return;
      return super.update(delta);
    }

    forgePreferredUseV156(actor = this.player) {
      const session = this.forgeSessionV141;
      const room = session?.project.rooms.find(entry => entry.id === session.currentRoomId);
      const hasStory = terminal => room?.cells.some(cell => cell.id === terminal?.forgeCellIdV141 && cell.narrative);
      const candidates = [this.powerNode, this.archiveTerminal].filter(Boolean).filter(candidate =>
        hasStory(candidate) && near(actor, candidate, 130) && this.forgeInteractionClearV141(actor, candidate)
        && (candidate !== this.archiveTerminal || this.mission.objectives.boss))
        .map(target => ({ kind: 'narrative', target, distance: interactionDistance(actor, target) }));
      // Delegate only the pending terminal that the inherited V51 dispatcher
      // would actually use (power before archive), without bypassing its story.
      const pending = this.forgePendingTerminalV156(actor);
      if (pending && !hasStory(pending) && this.forgeInteractionClearV141(actor, pending)
        && (pending !== this.archiveTerminal || this.mission.objectives.boss)) {
        candidates.push({ kind: 'native-terminal', target: pending, distance: interactionDistance(actor, pending) });
      }
      const terminal = candidates.sort((a, b) => a.distance - b.distance
        || Number(b.kind === 'native-terminal') - Number(a.kind === 'native-terminal'))[0] || null;
      // A finished local objective cannot hide a story that may unlock remote
      // objectives. Only validation or actual extraction can take precedence.
      const objectiveActionable = session && this.objective && (!session.completedObjectives.includes(this.objective.forgeCellIdV141)
        || list(this.forgeRequiredObjectivesV141).every(id => session.completedObjectives.includes(id)));
      if (objectiveActionable && near(actor, this.objective) && this.forgeInteractionClearV141(actor, this.objective)
        && !super.missingExtractionRequirement() && (!terminal || interactionDistance(actor, this.objective) <= terminal.distance)) {
        return { kind: 'objective', target: this.objective };
      }
      return terminal;
    }

    forgeNarrativeTerminalV156(actor = this.player) {
      const preferred = this.forgePreferredUseV156(actor);
      return preferred?.kind === 'narrative' ? preferred.target : null;
    }

    forgeUrgentNativeUseV156(actor = this.player) {
      const ally = actor === this.player ? this.coop : this.player;
      // Match the V51 native revive/key reaches; the inherited interaction owns
      // the rescue, inventory, checkpoint and event effects in both cases.
      if (this.coopEnabled && actor?.alive && ally?.downed && interactionDistance(actor, ally) <= 86) return 'revive';
      if (list(this.drops).some(drop => !drop.taken && drop.type === 'security-key' && near(actor, drop, 100))) return 'security-key';
      // Recovery is an inherited fallback: preserve actionable Forge validation
      // and do not let V51 extract through a partition while reaching a pickup.
      const objectiveBlocksRecovery = near(actor, this.objective);
      const door = list(this.doors).find(candidate => Math.abs(actor.x + actor.w / 2 - candidate.x - candidate.w / 2) < 118
        && Math.abs(actor.y - candidate.y) < candidate.h + 60);
      const doorBlocksRecovery = door && !this.forgeInteractionClearV141(actor, door);
      if (!objectiveBlocksRecovery && !doorBlocksRecovery && !this.forgePendingTerminalV156(actor)
        && this.recoverableWeaponIndexV131?.(actor) >= 0) return 'recoverable-weapon';
      return null;
    }

    forgeBlockedNarrativeArchiveV156(actor = this.player) {
      const archive = this.archiveTerminal;
      const room = this.forgeSessionV141?.project.rooms.find(entry => entry.id === this.forgeSessionV141.currentRoomId);
      return Boolean(archive && !this.mission.objectives.boss && near(actor, archive, 130)
        && this.forgeInteractionClearV141(actor, archive)
        && room?.cells.some(cell => cell.id === archive.forgeCellIdV141 && cell.narrative));
    }

    admitNativeTerminalInteractionV156(actor, terminal) {
      // Native dispatch and its prompt share this pure admission hook. Outside
      // a Forge session the historical campaign conditions remain unchanged.
      if (!this.forgeSessionV141) return true;
      return this.forgeInteractionClearV141(actor, terminal)
        && (terminal !== this.archiveTerminal || Boolean(this.mission.objectives.boss));
    }

    forgePendingTerminalV156(actor = this.player, { includeBlocked = false } = {}) {
      // Match inherited power → archive order after admission. Blocked terminals
      // remain available only to the final refusal message, never to dispatch.
      return [this.powerNode, this.archiveTerminal].find(terminal => terminal
        && !(terminal === this.powerNode ? terminal.active : terminal.recovered)
        && near(actor, terminal, 130)
        && (includeBlocked || this.admitNativeTerminalInteractionV156(actor, terminal))) || null;
    }

    syncForgeNarrativeRewardsV156(result) {
      const session = this.forgeSessionV141;
      if (this.objective && session.completedObjectives.includes(this.objective.forgeCellIdV141)) {
        this.objective.complete = true; this.objectiveState.complete = true;
      }
      this.onEvent({ type: 'forge-narrative-choice', roomId: session.currentRoomId, ...result });
    }

    interact(actor = this.player) {
      const session = this.forgeSessionV141;
      if (!session) return super.interact(actor);
      if (this.forgeNarrativeOpenV156 || !this.canPerformGameplayAction(actor, { allowVent: true, allowSquadTask: true })) return false;
      const urgent = this.forgeUrgentNativeUseV156(actor);
      if (urgent === 'revive' || urgent === 'security-key') return super.interact(actor);
      const linked = this.forgeLinkedDoorV141(actor);
      if (linked) return this.travelForgeMissionV141(linked.link, actor);
      if (urgent === 'recoverable-weapon') return super.interact(actor);
      const preferred = this.forgePreferredUseV156(actor);
      if (preferred?.kind === 'native-terminal') return super.interact(actor);
      const storyTerminal = preferred?.kind === 'narrative' ? preferred.target : null;
      if (storyTerminal) {
        if (storyTerminal === this.archiveTerminal && !this.mission.objectives.boss) return this.locked('NEUTRALISER LA MENACE ALPHA');
        const shown = showForgeNarrativeV156(this, storyTerminal.forgeCellIdV141, result => this.syncForgeNarrativeRewardsV156(result));
        if (shown) {
          if (storyTerminal === this.powerNode) { storyTerminal.active = true; this.mission.objectives.power = true; }
          else { storyTerminal.recovered = true; this.mission.objectives.archive = true; }
          this.onEvent({ type: 'forge-narrative-open', roomId: session.currentRoomId, cellId: storyTerminal.forgeCellIdV141 });
        }
        return shown;
      }
      if (near(actor, this.objective)) {
        if (!this.forgeInteractionClearV141(actor, this.objective)) return this.locked('OBJECTIF INACCESSIBLE DERRIÈRE UNE CLOISON');
        const missing = super.missingExtractionRequirement();
        if (missing) return this.locked(missing);
        const id = this.objective.forgeCellIdV141;
        if (!session.completedObjectives.includes(id)) {
          session.completedObjectives.push(id);
          this.objective.complete = true;
          this.objectiveState.complete = true;
          this.setInteractionAnimation(actor, 'control-use', .7);
          this.onEvent({ type: 'forge-objective-complete', roomId: session.currentRoomId, cellId: id,
            completed: session.completedObjectives.length, required: this.forgeRequiredObjectivesV141.length });
          return true;
        }
        const remaining = this.forgeRequiredObjectivesV141.filter(id => !session.completedObjectives.includes(id));
        if (remaining.length) return this.locked(`OBJECTIFS FORGE ${session.completedObjectives.length}/${this.forgeRequiredObjectivesV141.length}`);
        return this.completeMission(actor);
      }
      const terminal = this.forgePendingTerminalV156(actor, { includeBlocked: true });
      if (terminal && !this.forgeInteractionClearV141(actor, terminal)) return this.locked('TERMINAL INACCESSIBLE DERRIÈRE UNE CLOISON');
      if ((terminal === this.archiveTerminal && terminal && !this.mission.objectives.boss)
        || (!terminal && this.forgeBlockedNarrativeArchiveV156(actor))) return this.locked('NEUTRALISER LA MENACE ALPHA');
      const door = list(this.doors).find(candidate => Math.abs(actor.x + actor.w / 2 - candidate.x - candidate.w / 2) < 118
        && Math.abs(actor.y - candidate.y) < candidate.h + 60);
      if (door && !this.forgeInteractionClearV141(actor, door)) return this.locked('SAS INACCESSIBLE DERRIÈRE UNE CLOISON');
      return super.interact(actor);
    }

    forgeInteractionClearV141(actor, target) {
      return forgeInteractionClearV141({ actor, target, solids: [...list(this.walls), ...list(this.platforms),
        ...list(this.covers), ...list(this.doors).filter(door => !door.open || Number(door.progress) < .82)] });
    }

    missingExtractionRequirement() {
      const inherited = super.missingExtractionRequirement();
      if (inherited || !this.forgeSessionV141) return inherited;
      const session = this.forgeSessionV141, remaining = list(this.forgeRequiredObjectivesV141).filter(id => !session.completedObjectives.includes(id));
      return remaining.length ? `OBJECTIFS FORGE ${session.completedObjectives.length}/${this.forgeRequiredObjectivesV141.length}` : '';
    }

    completeMission(actor = this.player) {
      if (this.forgeSessionV141 && (!this.objective || this.missingExtractionRequirement())) return false;
      return super.completeMission(actor);
    }

    getInteractionPrompt(actor = this.player) {
      const session = this.forgeSessionV141;
      if (!session || !actor?.alive) return super.getInteractionPrompt(actor);
      const urgent = this.forgeUrgentNativeUseV156(actor);
      if (urgent === 'revive') return 'E  RÉANIMER LE COÉQUIPIER';
      if (urgent === 'security-key') return 'E  RÉCUPÉRER LE BADGE DE SÉCURITÉ';
      const linked = this.forgeLinkedDoorV141(actor);
      if (linked) return this.forgeInteractionClearV141(actor, linked.door)
        ? `E  SAS → ${session.project.rooms.find(room => room.id === linked.link.to.roomId)?.name || 'SALLE'}` : 'E  SAS BLOQUÉ PAR UNE CLOISON';
      if (urgent === 'recoverable-weapon') return super.getInteractionPrompt(actor);
      const preferred = this.forgePreferredUseV156(actor);
      if (preferred?.kind === 'narrative') return 'E  LIRE LE RÉCIT DU TERMINAL';
      if (preferred?.kind === 'native-terminal') return preferred.target === this.powerNode
        ? 'E  RÉTABLIR LE CIRCUIT AUXILIAIRE' : 'E  EXTRAIRE LES ARCHIVES';
      if (near(actor, this.objective)) {
        if (!this.forgeInteractionClearV141(actor, this.objective)) return 'E  OBJECTIF BLOQUÉ PAR UNE CLOISON';
        const physicalRequirement = super.missingExtractionRequirement();
        if (physicalRequirement) return `E  ${physicalRequirement}`;
        if (!session.completedObjectives.includes(this.objective.forgeCellIdV141)) return 'E  VALIDER L’OBJECTIF DE CETTE SALLE';
        const missing = this.missingExtractionRequirement();
        return missing ? `E  ${missing}` : 'E  CONFIRMER L’EXTRACTION FORGE';
      }
      const terminal = this.forgePendingTerminalV156(actor, { includeBlocked: true });
      if (terminal && !this.forgeInteractionClearV141(actor, terminal)) return 'E  TERMINAL BLOQUÉ PAR UNE CLOISON';
      if ((terminal === this.archiveTerminal && terminal && !this.mission.objectives.boss)
        || (!terminal && this.forgeBlockedNarrativeArchiveV156(actor))) return 'E  NEUTRALISER LA MENACE ALPHA';
      const door = list(this.doors).find(candidate => Math.abs(actor.x + actor.w / 2 - candidate.x - candidate.w / 2) < 118
        && Math.abs(actor.y - candidate.y) < candidate.h + 60);
      if (door && !this.forgeInteractionClearV141(actor, door)) return 'E  SAS BLOQUÉ PAR UNE CLOISON';
      return super.getInteractionPrompt(actor);
    }

    getForgeMissionHudV141() {
      const session = this.forgeSessionV141;
      if (!session) return null;
      const room = session.project.rooms.find(entry => entry.id === session.currentRoomId);
      const total = list(this.forgeRequiredObjectivesV141).length, completed = session.completedObjectives.length;
      return { location: `SALLE · ${room.name.slice(0, 42)}`, objectives: `OBJECTIFS GLOBAUX ${completed}/${total}`,
        context: 'PARCOURS FORGE · SESSION', progress: total ? completed / total : 0 };
    }

    phaseLabel() {
      return this.getForgeMissionHudV141()?.context || super.phaseLabel();
    }

    objectiveProgressText() {
      return this.getForgeMissionHudV141()?.objectives || super.objectiveProgressText();
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      const hud = this.getForgeMissionHudV141();
      if (!hud) return;
      // Replace only the old horizontal sector line/bar. The native health,
      // ammunition, inventory, reload and cooperative HUD stay authoritative.
      ctx.save();
      ctx.fillStyle = '#030a08'; ctx.fillRect(20, 68, 436, 20);
      ctx.fillStyle = '#8ea898'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
      ctx.fillText(hud.location, 34, 81, 410);
      ctx.fillStyle = '#030a08'; ctx.fillRect(474, 20, 332, 20);
      ctx.fillStyle = '#26372e'; ctx.fillRect(486, 28, 308, 4);
      ctx.fillStyle = '#8bd6a0'; ctx.fillRect(486, 28, 308 * hud.progress, 4);
      ctx.restore();
    }

    getForgeJourneySnapshotV141() {
      const session = this.forgeSessionV141;
      if (!session) return null;
      return { schema: 141, kind: 'mission', roomId: session.currentRoomId, entryRoomId: session.entryRoomId,
        roomName: session.project.rooms.find(room => room.id === session.currentRoomId)?.name,
        reachableRoomIds: [...session.reachableRoomIds], visitedRoomIds: [...new Set([session.currentRoomId, ...Object.keys(session.roomStates)])],
        transitions: session.transitions, completedObjectives: [...session.completedObjectives],
        requiredObjectives: [...list(this.forgeRequiredObjectivesV141)], narrativeV156: clone(session.narrativeV156 || []),
        narrativeDialogV156: this.forgeNarrativeOpenV156 ? forgeNarrativeViewV156(session, this.forgeNarrativeOpenV156) : null, scope: 'session' };
    }

    getSnapshot() {
      return { ...super.getSnapshot(), forgeJourneyV141: this.getForgeJourneySnapshotV141() };
    }
  };
}
