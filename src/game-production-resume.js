import { GameEngine as ProductionBaseEngine } from './game-production-base.js';
import { FACEHUGGER_COMBAT_V65, isFacehuggerCombatV65 } from './enemy-facehugger-combat-v65.js';
import { captureEnemyBatchCombatResumeV66, restoreEnemyBatchCombatResumeV66 } from './enemy-batch-combat-v66.js';
import { captureOvomorphCycleResumeV66, prepareOvomorphResumeChildrenV66, restoreOvomorphCycleResumeV66 } from './enemy-ovomorph-cycle-v66.js';
import { captureCetoResumeV75, restoreCetoResumeV75 } from './enemy-ceto-v75.js';

export * from './game-production-base.js';

export const RESUME_STATE_SCHEMA = 1;

const WORLD_WIDTH = 6200;
const WORLD_HEIGHT = 1080;
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const asList = (value) => Array.isArray(value) ? value : [];
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const bounded = (value, fallback, minimum, maximum) => {
  const parsed = Number(value);
  return clamp(Number.isFinite(parsed) ? parsed : fallback, minimum, maximum);
};
const integer = (value, fallback, minimum, maximum) => Math.round(bounded(value, fallback, minimum, maximum));
const safeId = (value, fallback = '') => typeof value === 'string' && value.length > 0 ? value.slice(0, 160) : fallback;
const safeText = (value, fallback = '') => typeof value === 'string' ? value.slice(0, 160) : fallback;
const actorWeapons = new Set(['sidearm', 'rifle', 'neuro-melee']);
const missionStates = new Set(['active', 'failed', 'complete']);
const neuroStates = new Set(['inactive', 'linked', 'failed']);
const counterStates = new Set(['inactive', 'jammed', 'counter-pulse', 'neutralized']);

function captureActor(actor, enabled = true) {
  if (!actor) return null;
  return {
    enabled: Boolean(enabled),
    x: bounded(actor.x, 0, 0, WORLD_WIDTH),
    y: bounded(actor.y, 0, 0, WORLD_HEIGHT),
    health: bounded(actor.health, 0, 0, Math.max(1, Number(actor.maxHealth) || 100)),
    armor: bounded(actor.armor, 0, 0, Math.max(0, Number(actor.maxArmor) || 100)),
    ammo: integer(actor.ammo, 0, 0, Math.max(1, Number(actor.magazineSize) || 999)),
    ammoReserve: integer(actor.ammoReserve, 0, 0, 99999),
    weapon: actorWeapons.has(actor.weaponMode) ? actor.weaponMode : 'sidearm',
    alive: Boolean(actor.alive),
    downed: Boolean(actor.downed),
    bleedOut: bounded(actor.bleedOut, 0, 0, 120),
    kills: integer(actor.kills, 0, 0, 999999),
    facing: Number(actor.facing) < 0 ? -1 : 1
  };
}

function restoreActor(actor, source, weaponRuntime) {
  if (!actor || !isRecord(source)) return false;
  actor.x = bounded(source.x, actor.x, 0, WORLD_WIDTH - Math.max(1, actor.w || 1));
  actor.y = bounded(source.y, actor.y, 0, WORLD_HEIGHT);
  actor.armor = bounded(source.armor, actor.armor, 0, Math.max(0, Number(actor.maxArmor) || 100));
  // The actor is initially spawned with a sidearm. Restore the equipped magazine before its rounds.
  if (actorWeapons.has(source.weapon)) actor.weaponMode = source.weapon;
  actor.magazineSize = actor.weaponMode === 'rifle' ? integer(weaponRuntime?.magazine, 30, 1, 200) : 12;
  actor.ammo = integer(source.ammo, actor.ammo, 0, actor.magazineSize);
  actor.ammoReserve = integer(source.ammoReserve, actor.ammoReserve, 0, 99999);
  actor.kills = integer(source.kills, actor.kills, 0, 999999);
  actor.weaponMode = actorWeapons.has(source.weapon) ? source.weapon : actorWeapons.has(source.weaponMode) ? source.weaponMode : actor.weaponMode;
  actor.facing = Number(source.facing) < 0 ? -1 : 1;
  actor.downed = Boolean(source.downed);
  actor.alive = actor.downed ? false : source.alive !== false;
  actor.health = actor.alive
    ? bounded(source.health, actor.health, 1, Math.max(1, Number(actor.maxHealth) || 100))
    : 0;
  actor.bleedOut = actor.downed ? bounded(source.bleedOut, actor.bleedOut || 18, 0, 120) : 0;
  actor.vx = 0;
  actor.vy = 0;
  actor.reloading = false;
  actor.reloadClock = 0;
  actor.inVehicle = false;
  return true;
}

function identityMatches(expected, supplied) {
  if (!isRecord(supplied)) return true;
  if (supplied.seed !== undefined && Number(supplied.seed) !== Number(expected.seed)) return false;
  for (const key of ['worldId', 'campaignId', 'levelSeedId', 'objectiveId', 'editorProjectKind']) {
    if (supplied[key] && expected[key] && String(supplied[key]) !== String(expected[key])) return false;
  }
  return true;
}

function restoreBooleanMap(target, source) {
  if (!isRecord(target) || !isRecord(source)) return;
  for (const key of Object.keys(target)) if (typeof source[key] === 'boolean') target[key] = source[key];
}

export class GameEngine extends ProductionBaseEngine {
  start(options = {}) {
    this.resumeIdentity = {
      seed: Number(options.seed) || Number(options.levelSeed?.seed) || 0,
      worldId: safeId(options.world?.id),
      campaignId: safeId(options.campaign?.id),
      levelSeedId: safeId(options.levelSeed?.id),
      editorProjectKind: safeId(options.editorProject?.kind)
    };
    super.start(options);
    this.resumeIdentity.objectiveId = safeId(this.objectiveRuntime?.id);
    this.lastResumeResult = options.resumeState
      ? this.applyResumeState(options.resumeState)
      : { applied: false, reason: 'not-requested', restored: 0 };
    return this.getSnapshot();
  }

  captureResumeState() {
    const objectives = this.mission?.objectives
      ? Object.fromEntries(Object.entries(this.mission.objectives).map(([key, value]) => [key, Boolean(value)]))
      : {};
    const supplies = (this.supplies || []).map((supply) => ({ id: safeId(supply.id), used: Boolean(supply.used) }));
    const weaponPickup = this.weaponPickup ? { id: safeId(this.weaponPickup.id), taken: Boolean(this.weaponPickup.taken) } : null;
    const toolPickup = this.toolPickup ? { id: safeId(this.toolPickup.id), taken: Boolean(this.toolPickup.taken) } : null;
    const enemyIds = new Set((this.enemies || []).map((enemy) => enemy.id));
    const trackerContacts = asList(this.tracker?.contacts).filter((contact) => enemyIds.has(contact?.id)).map((contact) => ({
      id: contact.id,
      x: bounded(contact.x, 0, 0, WORLD_WIDTH),
      y: bounded(contact.y, 0, 0, WORLD_HEIGHT),
      distance: integer(contact.distance, 0, 0, 99999),
      threat: safeText(contact.threat)
    }));
    const equipment = this.equipmentActions ? [...this.equipmentActions.values()].map((item) => ({
      id: safeId(item.id),
      remaining: integer(item.remaining, 0, 0, Math.max(0, Number(item.maxCharges ?? item.charges ?? item.remaining) || 0)),
      uses: integer(item.uses, 0, 0, 999999)
    })) : [];
    const vehicleDriver = this.vehicle?.driver === this.player ? 'player' : this.vehicle?.driver === this.coop ? 'coop' : null;
    const passengers = asList(this.vehicle?.passengers).map((actor) => actor === this.player ? 'player' : actor === this.coop ? 'coop' : null).filter(Boolean);
    return {
      schema: RESUME_STATE_SCHEMA,
      identity: { ...this.resumeIdentity, objectiveId: safeId(this.objectiveRuntime?.id) },
      checkpoint: this.checkpoint ? {
        id: safeId(this.checkpoint.id, 'insertion'),
        x: bounded(this.checkpoint.x, 0, 0, WORLD_WIDTH),
        y: bounded(this.checkpoint.y, 0, 0, WORLD_HEIGHT)
      } : null,
      player: captureActor(this.player),
      coop: captureActor(this.coop, this.coopEnabled),
      mission: this.mission ? {
        state: missionStates.has(this.mission.state) ? this.mission.state : 'active',
        phase: safeText(this.mission.phase, 'restore-power'),
        elapsed: bounded(this.mission.elapsed, 0, 0, 604800),
        retries: integer(this.mission.retries, 0, 0, 9999),
        casualties: integer(this.mission.casualties, 0, 0, 9999),
        failureReason: safeText(this.mission.failureReason),
        objectives
      } : null,
      objectives,
      objective: this.objective ? { id: safeId(this.objective.id), complete: Boolean(this.objective.complete) } : null,
      objectiveState: this.objectiveState ? {
        started: Boolean(this.objectiveState.started),
        complete: Boolean(this.objectiveState.complete),
        holdRemaining: bounded(this.objectiveState.holdRemaining, 0, 0, 604800),
        holdElapsed: bounded(this.objectiveState.holdElapsed, 0, 0, 604800),
        nextWave: bounded(this.objectiveState.nextWave, 0, 0, 604800),
        wavesSpawned: integer(this.objectiveState.wavesSpawned, 0, 0, 9999),
        rescued: integer(this.objectiveState.rescued, 0, 0, 9999),
        nodesActivated: integer(this.objectiveState.nodesActivated, 0, 0, 9999),
        trackerPulses: integer(this.objectiveState.trackerPulses, 0, 0, 9999),
        captured: Boolean(this.objectiveState.captured),
        relayDestroyed: Boolean(this.objectiveState.relayDestroyed),
        escaped: Boolean(this.objectiveState.escaped),
        failed: Boolean(this.objectiveState.failed),
        trackedBossId: enemyIds.has(this.objectiveState.trackedBossId) ? this.objectiveState.trackedBossId : null
      } : null,
      objectiveNodes: asList(this.objectiveNodes).map((node) => ({ id: safeId(node.id), active: Boolean(node.active) })),
      inventory: this.inventory ? {
        medkits: integer(this.inventory.medkits, 0, 0, 99),
        salvage: integer(this.inventory.salvage, 0, 0, 99999999),
        intel: integer(this.inventory.intel, 0, 0, 99999999),
        securityKeys: integer(this.inventory.securityKeys, 0, 0, 99),
        cutter: Boolean(this.inventory.cutter)
      } : null,
      tracker: this.tracker ? {
        energy: bounded(this.tracker.energy, 0, 0, 100),
        cooldown: bounded(this.tracker.cooldown, 0, 0, 120),
        pulses: integer(this.tracker.pulses, 0, 0, 9999),
        contacts: trackerContacts
      } : null,
      doors: asList(this.doors).map((door) => ({ id: safeId(door.id), open: Boolean(door.open), progress: bounded(door.progress, 0, 0, 1) })),
      vents: asList(this.vents).map((vent) => ({ id: safeId(vent.id), open: Boolean(vent.open) })),
      supplies,
      weaponPickup,
      toolPickup,
      pickups: {
        weaponTaken: Boolean(weaponPickup?.taken),
        toolTaken: Boolean(toolPickup?.taken),
        powerActive: Boolean(this.powerNode?.active),
        archiveRecovered: Boolean(this.archiveTerminal?.recovered),
        weapon: weaponPickup,
        tool: toolPickup,
        supplies
      },
      powerNode: this.powerNode ? { id: safeId(this.powerNode.id), active: Boolean(this.powerNode.active) } : null,
      archiveTerminal: this.archiveTerminal ? { id: safeId(this.archiveTerminal.id), recovered: Boolean(this.archiveTerminal.recovered) } : null,
      enemies: asList(this.enemies).map((enemy) => ({
        id: safeId(enemy.id),
        ...(enemy.royalScaleV72 ? { bodyHeight: enemy.h } : {}),
        alive: Boolean(enemy.alive),
        health: bounded(enemy.health, 0, 0, Math.max(1, Number(enemy.maxHealth) || 1)),
        x: bounded(enemy.x, 0, 0, WORLD_WIDTH),
        y: bounded(enemy.y, 0, 0, WORLD_HEIGHT),
        facing: Number(enemy.facing) < 0 ? -1 : 1,
        alert: Boolean(enemy.alert),
        revealed: bounded(enemy.revealed, 0, 0, 120),
        captured: Boolean(enemy.captured),
        deathClock: bounded(enemy.deathClock, 0, 0, 30),
        ...captureEnemyBatchCombatResumeV66(enemy),
        ...captureOvomorphCycleResumeV66(enemy),
        ...captureCetoResumeV75(enemy),
        ...(isFacehuggerCombatV65(enemy) ? {
          attackClock: bounded(enemy.attackClock, 0, 0, FACEHUGGER_COMBAT_V65.cooldown),
          facehuggerAttackActiveV65: Boolean(enemy.facehuggerAttackV65)
        } : {})
      })),
      drops: asList(this.drops).map((drop) => ({
        id: safeId(drop.id), type: safeId(drop.type), amount: bounded(drop.amount, 0, 0, 999999),
        x: bounded(drop.x, 0, 0, WORLD_WIDTH), y: bounded(drop.y, 0, 0, WORLD_HEIGHT), taken: Boolean(drop.taken)
      })),
      vehicle: this.vehicle ? {
        id: safeId(this.vehicle.id), active: Boolean(this.vehicle.active), occupied: Boolean(this.vehicle.occupied), driver: vehicleDriver, passengers,
        x: bounded(this.vehicle.x, 0, -1000, WORLD_WIDTH), y: bounded(this.vehicle.y, 0, 0, WORLD_HEIGHT),
        hull: bounded(this.vehicle.hull, 0, 0, Math.max(0, Number(this.vehicle.maxHull) || 0)),
        fuel: bounded(this.vehicle.fuel, 0, 0, 100), turretAmmo: integer(this.vehicle.turretAmmo, 0, 0, 99999),
        turretReserve: integer(this.vehicle.turretReserve, 0, 0, 99999), destroyed: Boolean(this.vehicle.destroyed),
        depth: bounded(this.vehicle.depth, 0, 0, 1000)
      } : null,
      equipment,
      neuro: this.neuro ? {
        profileId: safeId(this.neuro.id), signal: bounded(this.neuro.signal, 0, 0, Math.max(0, Number(this.neuro.maxSignal) || 100)),
        state: neuroStates.has(this.neuro.state) ? this.neuro.state : 'inactive', relayX: bounded(this.neuro.relayX, 0, 0, WORLD_WIDTH),
        failureTriggered: Boolean(this.neuro.failureTriggered),
        counterplay: this.neuroCounterplay ? {
          state: counterStates.has(this.neuroCounterplay.state) ? this.neuroCounterplay.state : 'inactive',
          pulses: integer(this.neuroCounterplay.pulses, 0, 0, 99), pulseCooldown: bounded(this.neuroCounterplay.pulseCooldown, 0, 0, 120),
          drainApplied: bounded(this.neuroCounterplay.drainApplied, 0, 0, 999999), adversaryId: enemyIds.has(this.neuroCounterplay.adversaryId) ? this.neuroCounterplay.adversaryId : null,
          neutralized: Boolean(this.neuroCounterplay.neutralized),
          relay: this.neuroCounterplay.relay ? {
            id: safeId(this.neuroCounterplay.relay.id), active: Boolean(this.neuroCounterplay.relay.active),
            x: bounded(this.neuroCounterplay.relay.x, 0, 0, WORLD_WIDTH), y: bounded(this.neuroCounterplay.relay.y, 0, 0, WORLD_HEIGHT)
          } : null
        } : null
      } : null
    };
  }

  applyResumeState(rawState) {
    if (!isRecord(rawState)) return { applied: false, reason: 'invalid-state', restored: 0 };
    if (rawState.schema !== undefined && Number(rawState.schema) !== RESUME_STATE_SCHEMA) return { applied: false, reason: 'schema-mismatch', restored: 0 };
    if (!identityMatches(this.resumeIdentity || {}, rawState.identity)) return { applied: false, reason: 'identity-mismatch', restored: 0 };
    let restored = 0;

    if (restoreActor(this.player, rawState.player, this.weaponRuntime)) restored += 1;
    if (restoreActor(this.coop, rawState.coop, this.weaponRuntime)) restored += 1;
    if (isRecord(rawState.coop) && typeof rawState.coop.enabled === 'boolean') this.coopEnabled = rawState.coop.enabled;

    if (isRecord(rawState.checkpoint)) {
      const checkpointIds = new Set(['insertion', 'vent', 'security', 'containment', this.checkpoint?.id].filter(Boolean));
      const checkpointId = safeId(rawState.checkpoint.id);
      if (checkpointIds.has(checkpointId)) {
        this.checkpoint = {
          id: checkpointId,
          x: bounded(rawState.checkpoint.x, this.checkpoint.x, 0, WORLD_WIDTH),
          y: bounded(rawState.checkpoint.y, this.checkpoint.y, 0, WORLD_HEIGHT)
        };
        restored += 1;
      }
    }

    const missionSource = isRecord(rawState.mission) ? rawState.mission : null;
    if (missionSource && this.mission) {
      if (missionStates.has(missionSource.state)) this.mission.state = missionSource.state;
      this.mission.phase = safeText(missionSource.phase, this.mission.phase);
      this.mission.elapsed = bounded(missionSource.elapsed, this.mission.elapsed, 0, 604800);
      this.mission.retries = integer(missionSource.retries, this.mission.retries, 0, 9999);
      this.mission.casualties = integer(missionSource.casualties, this.mission.casualties, 0, 9999);
      this.mission.failureReason = safeText(missionSource.failureReason) || null;
      restoreBooleanMap(this.mission.objectives, missionSource.objectives || rawState.objectives);
      restored += 1;
    } else restoreBooleanMap(this.mission?.objectives, rawState.objectives);

    if (isRecord(rawState.inventory) && this.inventory) {
      this.inventory.medkits = integer(rawState.inventory.medkits, this.inventory.medkits, 0, 99);
      this.inventory.salvage = integer(rawState.inventory.salvage, this.inventory.salvage, 0, 99999999);
      this.inventory.intel = integer(rawState.inventory.intel, this.inventory.intel, 0, 99999999);
      this.inventory.securityKeys = integer(rawState.inventory.securityKeys, this.inventory.securityKeys, 0, 99);
      this.inventory.cutter = Boolean(rawState.inventory.cutter);
      restored += 1;
    }

    prepareOvomorphResumeChildrenV66(this, asList(rawState.enemies));
    const enemiesById = new Map(asList(this.enemies).map((enemy) => [enemy.id, enemy]));
    for (const source of asList(rawState.enemies)) {
      const enemy = enemiesById.get(source?.id);
      if (!enemy || !isRecord(source)) continue;
      enemy.x = bounded(source.x, enemy.x, 0, WORLD_WIDTH - Math.max(1, enemy.w || 1));
      enemy.y = bounded(source.y, enemy.y, 0, WORLD_HEIGHT);
      if (enemy.royalScaleV72) {
        // V71 royal actors used a 112px body. Migrate their feet, not their old top-left corner.
        const savedHeight = bounded(source.bodyHeight, 112, 1, WORLD_HEIGHT);
        enemy.y = clamp(enemy.y + savedHeight - enemy.h, 0, WORLD_HEIGHT - enemy.h);
      }
      enemy.facing = Number(source.facing) < 0 ? -1 : 1;
      enemy.alert = Boolean(source.alert);
      enemy.revealed = bounded(source.revealed, enemy.revealed || 0, 0, 120);
      enemy.captured = Boolean(source.captured);
      enemy.alive = source.alive !== false && !enemy.captured;
      enemy.health = enemy.alive ? bounded(source.health, enemy.health, 1, enemy.maxHealth) : 0;
      enemy.deathClock = enemy.alive ? 0 : bounded(source.deathClock, enemy.deathClock || 0, 0, 30);
      restoreEnemyBatchCombatResumeV66(enemy, source);
      restoreOvomorphCycleResumeV66(enemy, source);
      restoreCetoResumeV75(enemy, source);
      if (isFacehuggerCombatV65(enemy)) {
        // A saved leap resumes at rest: never replay its target lock or impact.
        const existingCooldown = bounded(enemy.attackClock, 0, 0, FACEHUGGER_COMBAT_V65.cooldown);
        enemy.attackClock = Math.max(
          bounded(source.attackClock, existingCooldown, 0, FACEHUGGER_COMBAT_V65.cooldown),
          source.facehuggerAttackActiveV65 === true ? FACEHUGGER_COMBAT_V65.duration : 0
        );
        enemy.facehuggerAttackV65 = null;
        enemy.attacking = false;
        enemy.attackAnimationClock = 0;
        enemy.attackWindupClock = 0;
      }
      restored += 1;
    }

    if (isRecord(rawState.tracker) && this.tracker) {
      this.tracker.energy = bounded(rawState.tracker.energy, this.tracker.energy, 0, 100);
      this.tracker.cooldown = bounded(rawState.tracker.cooldown, this.tracker.cooldown, 0, 120);
      this.tracker.pulses = integer(rawState.tracker.pulses, this.tracker.pulses, 0, 9999);
      this.tracker.contacts = asList(rawState.tracker.contacts).flatMap((contact) => {
        const enemy = enemiesById.get(contact?.id);
        if (!enemy) return [];
        return [{
          id: enemy.id,
          x: bounded(contact.x, enemy.x, 0, WORLD_WIDTH),
          y: bounded(contact.y, enemy.y, 0, WORLD_HEIGHT),
          distance: integer(contact.distance, 0, 0, 99999),
          threat: safeText(contact.threat)
        }];
      });
      restored += 1;
    }

    const restoreMatched = (targets, sources, apply) => {
      const byId = new Map(asList(targets).map((entry) => [entry.id, entry]));
      for (const source of asList(sources)) {
        const target = byId.get(source?.id);
        if (!target || !isRecord(source)) continue;
        apply(target, source);
        restored += 1;
      }
    };
    restoreMatched(this.doors, rawState.doors, (door, source) => {
      door.open = Boolean(source.open);
      door.progress = bounded(source.progress, door.open ? 1 : 0, 0, 1);
    });
    restoreMatched(this.vents, rawState.vents, (vent, source) => { vent.open = Boolean(source.open); });
    this.ventShortcut = this.vents?.[0] || this.ventShortcut;

    const pickups = isRecord(rawState.pickups) ? rawState.pickups : {};
    const supplySource = rawState.supplies || pickups.supplies;
    restoreMatched(this.supplies, supplySource, (supply, source) => { supply.used = Boolean(source.used); });
    const weaponSource = isRecord(rawState.weaponPickup) ? rawState.weaponPickup : isRecord(pickups.weapon) ? pickups.weapon : null;
    if (this.weaponPickup && (!weaponSource || !weaponSource.id || weaponSource.id === this.weaponPickup.id)) {
      if (weaponSource || typeof pickups.weaponTaken === 'boolean') this.weaponPickup.taken = Boolean(weaponSource?.taken ?? pickups.weaponTaken);
    }
    const toolSource = isRecord(rawState.toolPickup) ? rawState.toolPickup : isRecord(pickups.tool) ? pickups.tool : null;
    if (this.toolPickup && (!toolSource || !toolSource.id || toolSource.id === this.toolPickup.id)) {
      if (toolSource || typeof pickups.toolTaken === 'boolean') this.toolPickup.taken = Boolean(toolSource?.taken ?? pickups.toolTaken);
    }
    const powerSource = isRecord(rawState.powerNode) ? rawState.powerNode : null;
    if (this.powerNode && (!powerSource || !powerSource.id || powerSource.id === this.powerNode.id)) {
      if (powerSource || typeof pickups.powerActive === 'boolean') this.powerNode.active = Boolean(powerSource?.active ?? pickups.powerActive);
    }
    const archiveSource = isRecord(rawState.archiveTerminal) ? rawState.archiveTerminal : null;
    if (this.archiveTerminal && (!archiveSource || !archiveSource.id || archiveSource.id === this.archiveTerminal.id)) {
      if (archiveSource || typeof pickups.archiveRecovered === 'boolean') this.archiveTerminal.recovered = Boolean(archiveSource?.recovered ?? pickups.archiveRecovered);
    }
    if (this.objective && isRecord(rawState.objective) && rawState.objective.id === this.objective.id) this.objective.complete = Boolean(rawState.objective.complete);

    if (this.objectiveState && isRecord(rawState.objectiveState)) {
      const source = rawState.objectiveState;
      for (const key of ['started', 'complete', 'captured', 'relayDestroyed', 'escaped', 'failed']) if (typeof source[key] === 'boolean') this.objectiveState[key] = source[key];
      this.objectiveState.holdRemaining = bounded(source.holdRemaining, this.objectiveState.holdRemaining, 0, Math.max(0, this.objectiveRuntime?.holdSeconds || 604800));
      this.objectiveState.holdElapsed = bounded(source.holdElapsed, this.objectiveState.holdElapsed, 0, 604800);
      this.objectiveState.nextWave = bounded(source.nextWave, this.objectiveState.nextWave, 0, 604800);
      this.objectiveState.wavesSpawned = integer(source.wavesSpawned, this.objectiveState.wavesSpawned, 0, Math.max(0, this.objectiveRuntime?.waveCount || 9999));
      this.objectiveState.rescued = integer(source.rescued, this.objectiveState.rescued, 0, Math.max(0, this.objectiveRuntime?.nodeCount || 9999));
      this.objectiveState.nodesActivated = integer(source.nodesActivated, this.objectiveState.nodesActivated, 0, Math.max(0, this.objectiveRuntime?.nodeCount || 9999));
      this.objectiveState.trackerPulses = integer(source.trackerPulses, this.objectiveState.trackerPulses, 0, 9999);
      this.objectiveState.trackedBossId = enemiesById.has(source.trackedBossId) ? source.trackedBossId : null;
      restored += 1;
    }
    restoreMatched(this.objectiveNodes, rawState.objectiveNodes, (node, source) => { node.active = Boolean(source.active); });
    if (this.objectiveState && this.objectiveNodes?.length) {
      const activeNodes = this.objectiveNodes.filter((node) => node.active);
      this.objectiveState.nodesActivated = activeNodes.length;
      if (['rescue', 'recover-synthetic'].includes(this.objectiveRuntime?.action)) this.objectiveState.rescued = activeNodes.length;
      if (this.objectiveRuntime?.action === 'destroy-relay' && activeNodes.length) this.objectiveState.relayDestroyed = true;
    }

    const allowedDrops = new Map();
    for (const enemy of enemiesById.values()) {
      allowedDrops.set(`salvage-${enemy.id}`, 'salvage');
      allowedDrops.set(`key-${enemy.id}`, 'security-key');
      allowedDrops.set(`ammo-${enemy.id}`, 'ammo');
    }
    this.drops = asList(rawState.drops).flatMap((source) => {
      const expectedType = allowedDrops.get(source?.id);
      if (!expectedType || !isRecord(source) || source.type !== expectedType) return [];
      return [{
        id: source.id, type: expectedType, amount: bounded(source.amount, expectedType === 'security-key' ? 1 : 0, 0, 999999),
        x: bounded(source.x, 0, 0, WORLD_WIDTH), y: bounded(source.y, 0, 0, WORLD_HEIGHT),
        w: expectedType === 'security-key' ? 32 : 24, h: expectedType === 'security-key' ? 30 : 20, taken: Boolean(source.taken)
      }];
    });

    if (this.vehicle && isRecord(rawState.vehicle) && rawState.vehicle.id === this.vehicle.id) {
      const source = rawState.vehicle;
      this.vehicle.active = this.vehicle.active && source.active !== false;
      this.vehicle.x = bounded(source.x, this.vehicle.x, -1000, WORLD_WIDTH - Math.max(1, this.vehicle.w || 1));
      this.vehicle.y = bounded(source.y, this.vehicle.y, 0, WORLD_HEIGHT);
      this.vehicle.hull = bounded(source.hull, this.vehicle.hull, 0, this.vehicle.maxHull);
      this.vehicle.fuel = bounded(source.fuel, this.vehicle.fuel, 0, 100);
      this.vehicle.turretAmmo = integer(source.turretAmmo, this.vehicle.turretAmmo, 0, this.vehicle.maxTurretAmmo || 99999);
      this.vehicle.turretReserve = integer(source.turretReserve, this.vehicle.turretReserve || 0, 0, 99999);
      this.vehicle.depth = bounded(source.depth, this.vehicle.depth || 0, 0, 1000);
      this.vehicle.destroyed = Boolean(source.destroyed) || this.vehicle.hull === 0;
      this.vehicle.driver = null;
      this.vehicle.passengers = [];
      this.vehicle.occupied = false;
      this.player.inVehicle = false;
      this.coop.inVehicle = false;
      if (source.occupied && this.vehicle.active && !this.vehicle.destroyed) {
        const driver = source.driver === 'coop' ? this.coop : source.driver === 'player' ? this.player : null;
        if (driver?.alive && (!driver.coop || this.coopEnabled)) {
          this.vehicle.driver = driver;
          this.vehicle.occupied = true;
          driver.inVehicle = true;
          for (const role of asList(source.passengers)) {
            const passenger = role === 'coop' ? this.coop : role === 'player' ? this.player : null;
            if (passenger?.alive && passenger !== driver && (!passenger.coop || this.coopEnabled)) {
              passenger.inVehicle = true;
              this.vehicle.passengers.push(passenger);
            }
          }
        }
      }
      restored += 1;
    }

    const equipmentSource = rawState.equipment || rawState.equipmentRuntime;
    for (const source of asList(equipmentSource)) {
      const equipment = this.equipmentActions?.get(source?.id);
      if (!equipment || !isRecord(source)) continue;
      const maximum = Math.max(0, Number(equipment.maxCharges ?? equipment.charges ?? equipment.remaining) || 0);
      equipment.remaining = integer(source.remaining, equipment.remaining, 0, maximum);
      equipment.uses = integer(source.uses, equipment.uses, 0, 999999);
      restored += 1;
    }

    if (this.neuro && isRecord(rawState.neuro) && (!rawState.neuro.profileId || rawState.neuro.profileId === this.neuro.id)) {
      const source = rawState.neuro;
      this.neuro.signal = bounded(source.signal, this.neuro.signal, 0, this.neuro.maxSignal || 100);
      if (neuroStates.has(source.state)) this.neuro.state = source.state;
      this.neuro.relayX = bounded(source.relayX, this.neuro.relayX, 0, WORLD_WIDTH);
      this.neuro.failureTriggered = Boolean(source.failureTriggered);
      const counterSource = source.counterplay;
      if (this.neuroCounterplay && isRecord(counterSource)) {
        if (counterStates.has(counterSource.state)) this.neuroCounterplay.state = counterSource.state;
        this.neuroCounterplay.pulses = integer(counterSource.pulses, this.neuroCounterplay.pulses, 0, Math.max(0, this.neuroCounterplay.pulses || 2));
        this.neuroCounterplay.pulseCooldown = bounded(counterSource.pulseCooldown, this.neuroCounterplay.pulseCooldown, 0, 120);
        this.neuroCounterplay.drainApplied = bounded(counterSource.drainApplied, this.neuroCounterplay.drainApplied, 0, 999999);
        if (enemiesById.has(counterSource.adversaryId)) this.neuroCounterplay.adversaryId = counterSource.adversaryId;
        this.neuroCounterplay.neutralized = Boolean(counterSource.neutralized);
        if (this.neuroCounterplay.relay && isRecord(counterSource.relay) && counterSource.relay.id === this.neuroCounterplay.relay.id) {
          this.neuroCounterplay.relay.active = Boolean(counterSource.relay.active) && !this.neuroCounterplay.neutralized;
          this.neuroCounterplay.relay.x = bounded(counterSource.relay.x, this.neuroCounterplay.relay.x, 0, WORLD_WIDTH);
          this.neuroCounterplay.relay.y = bounded(counterSource.relay.y, this.neuroCounterplay.relay.y, 0, WORLD_HEIGHT);
        }
        const adversary = enemiesById.get(this.neuroCounterplay.adversaryId);
        if (adversary) adversary.neuroDisruptor = Boolean(adversary.alive && !this.neuroCounterplay.neutralized && this.neuroCounterplay.relay?.active);
      }
      restored += 1;
    }

    this.bullets = [];
    this.hostileProjectiles = [];
    this.particles = [];
    this.keys?.clear?.();
    if (this.camera && this.player) {
      this.camera.x = bounded(this.player.x - 320, 0, 0, WORLD_WIDTH - 1280);
      this.camera.y = bounded(this.player.y - 360, this.camera.y || 0, 0, WORLD_HEIGHT - 720);
    }
    const result = { applied: true, reason: 'restored', restored };
    this.onEvent?.({ type: 'mission-resumed', restored, checkpoint: this.checkpoint?.id || null });
    return result;
  }
}
