import { isPlaceableEquipmentV86 } from './placeables-state-v86.js';
import { firstProjectileObstacleV83 } from './projectile-collision-v83.js';
import { cancelTacticalReloadV77 } from './tactical-reload-v77.js';

const list = value => Array.isArray(value) ? value : [];
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const center = box => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
const overlaps = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const distance = (a, b) => { const p = center(a), q = center(b); return Math.hypot(p.x - q.x, p.y - q.y); };
const gap = (a, b) => Math.hypot(Math.max(0, a.x - b.x - b.w, b.x - a.x - a.w), Math.max(0, a.y - b.y - b.h, b.y - a.y - a.h));
const synthetic = actor => actor?.biology === 'synthetic' || actor?.crewV85?.biology === 'synthetic' || actor?.synthetic === true;
const actorKey = actor => actor?.crewId || actor?.operatorId || (actor?.coop ? 'coop' : 'player');
const supportValue = value => Math.max(0, Math.min(99999, Math.floor(number(value))));

// Durations are gameplay tuning, shared by the animation, UI and the commit clock.
export const FIELD_ACTIONS_V124 = Object.freeze(Object.fromEntries(Object.entries({
  medical: ['SOINS', 2.2, 'ground-interact'],
  'access-bypass': ['DÉVERROUILLAGE', 2.4, 'control-use', 'access-tuner'],
  'field-repair': ['RÉPARATION', 2.1, 'ground-interact', 'maintenance-jack'],
  'synthetic-repair': ['RÉPARATION SYNTHÉTIQUE', 2.5, 'ground-interact', 'maintenance-jack'],
  breach: ['DÉCOUPE', 2.7, 'force-interact', 'cutting-torch'],
  illumination: ['LAMPE', 0, 'control-use'],
  'oxygen-reserve': ['RÉSERVE D’OXYGÈNE', 1.1, 'control-use'],
  'protective-layer': ['PROTECTION', 1.4, 'ground-interact'],
  'power-transfer': ['TRANSFERT D’ÉNERGIE', 1.5, 'control-use'],
  'ammo-resupply': ['RAVITAILLEMENT', 1.3, 'ground-interact'],
  'incendiary-load': ['CHARGEMENT INCENDIAIRE', 1.2, 'control-use'],
  'live-restraint': ['CONTENTION', 0.9, 'force-interact'],
  'checkpoint-beacon': ['BALISE', 1.7, 'ground-interact'],
  'motion-pulse': ['DÉTECTION', 0.65, 'control-use', 'motion-tracker'],
  'deep-scan': ['ANALYSE', 0.9, 'control-use', 'motion-tracker'],
  'drone-recon': ['RECONNAISSANCE', 1, 'control-use', 'motion-tracker'],
  'signal-jam': ['BROUILLAGE', 0.8, 'control-use'],
  'neuro-stabilize': ['STABILISATION', 0.8, 'control-use'],
  'field-support': ['ENTRETIEN', 1.2, 'ground-interact']
}).map(([kind, [label, duration, animation, toolId = null]]) => [kind, Object.freeze({ kind, label, duration, animation, toolId })])));

const reasons = Object.freeze({
  unavailable: 'Opérateur indisponible.', busy: 'Terminez ou annulez la manipulation en cours.',
  grounded: 'Rejoignez un sol stable pour utiliser cet équipement.', empty: 'Aucune charge disponible.',
  target: 'Aucune cible compatible à portée.', full: 'Cette ressource est déjà au maximum.',
  blocked: 'Un obstacle empêche de manipuler la cible.', changed: 'La cible n’est plus disponible.',
  movement: 'Manipulation interrompue par le déplacement.', impact: 'Manipulation interrompue par un impact.',
  cancelled: 'Manipulation annulée. Le matériel est conservé.', unsupported: 'Cet équipement ne possède pas d’action utilisable.'
});
const refused = reason => ({ ok: false, reason, message: reasons[reason] || reasons.unavailable });

export function fieldActorAvailableV124(engine, actor, { stable = true, ignoreBusy = false } = {}) {
  if (!engine.running || engine.paused || engine.enemyAtlasLoadingPausedV65 || engine.userCasteLoadingV88
    || engine.mission?.state !== 'active' || !actor?.alive || actor.downed || actor.inVehicle || actor.climbing || actor.ventTransit
    || actor.grappledClock > 0 || actor.stunClock > 0 || actor.hazardKind === 'electrical' && actor.hazardClock > 0
    || engine.isVehicleAccessLockedV59?.(actor) || actor === engine.coop && !engine.coopEnabled) return refused('unavailable');
  if (!ignoreBusy && (engine.isFieldActionBusyV124?.(actor) || engine.isPlaceableBusyV86?.(actor) || actor.meleeClock > 0)) return refused('busy');
  if (stable && actor.grounded !== true) return refused('grounded');
  return { ok: true };
}

export function fieldLineClearV124(engine, actor, target) {
  if (actor === target) return true;
  const from = center(actor), to = center(target);
  return !firstProjectileObstacleV83({ ...from, w: 0, h: 0 }, { x: to.x - from.x, y: to.y - from.y }, {
    walls: [...list(engine.walls), ...list(engine.covers), ...list(engine.platforms)].filter(item => item !== target && !item.destroyed),
    doors: list(engine.doors).filter(item => item !== target), platforms: []
  });
}

const reachable = (engine, actor, target, range = 96) => target && gap(actor, target) <= range && fieldLineClearV124(engine, actor, target);
const accessDoor = door => !door.open && !door.destroyed && !door.levelLocked && !door.survivalWeldedV70 && (!door.lockedBy || ['security', 'access', 'key'].includes(door.lockedBy));
const cuttable = wall => !wall.destroyed && (wall.art === 'breakable' || wall.breakable === true || wall.destructible === true);
const contacts = (engine, actor, range) => list(engine.enemies).filter(enemy => enemy.alive && !enemy.dormant && !enemy.ventTransit && distance(actor, enemy) <= range);

/** Resolve one physical target, retained throughout the action. A tool never
 * silently substitutes another door/vehicle/person when its target changes. */
export function resolveFieldTargetV124(engine, kind, actor, preferred = null) {
  let candidates = [], valid = () => true;
  if (kind === 'access-bypass') { candidates = list(engine.doors); valid = accessDoor; }
  else if (kind === 'breach') {
    candidates = [...list(engine.walls).filter(cuttable), ...list(engine.vents).filter(vent => vent.requiresTool && !vent.open),
      ...list(engine.doors).filter(door => door.breachable === true && accessDoor(door))];
    valid = target => candidates.includes(target);
  } else if (kind === 'field-repair') {
    candidates = [engine.vehicle, actor].filter(Boolean);
    valid = target => target === actor ? number(actor.armor) < number(actor.maxArmor) : target.active && !target.destroyed && target.hull < target.maxHull;
  } else if (kind === 'synthetic-repair') {
    candidates = [actor, engine.player, engine.coopEnabled ? engine.coop : null, ...(engine.activeSquadActors?.() || [])].filter(Boolean);
    valid = target => target.alive && !target.downed && synthetic(target) && target.health < target.maxHealth;
  } else if (kind === 'power-transfer') {
    candidates = [engine.powerNode, engine.vehicle, actor].filter(Boolean);
    valid = target => target === actor ? engine.tracker?.energy < 100 : target === engine.powerNode
      ? !target.active && !target.levelLocked : target.active && !target.destroyed && target.fuel < 100;
  } else if (kind === 'live-restraint') {
    candidates = list(engine.enemies);
    valid = target => target.alive && !target.dormant && !target.ventTransit && !target.isBoss && !target.isRoyal
      && target.w <= actor.w * 1.6 && target.h <= actor.h * 1.6 && !(target.restrainedClock > 0);
  } else return { ok: true, target: actor };
  const inRange = candidates.filter(valid).filter(target => target === actor || gap(actor, target) <= 96);
  if (['access-bypass', 'breach', 'live-restraint'].includes(kind)) inRange.sort((a, b) => distance(actor, a) - distance(actor, b));
  const target = preferred ? inRange.find(item => item === preferred) : inRange.find(item => fieldLineClearV124(engine, actor, item));
  if (!target) return refused(preferred ? 'changed' : inRange.length ? 'blocked' : 'target');
  if (!fieldLineClearV124(engine, actor, target)) return refused('blocked');
  return { ok: true, target };
}

function effectAvailable(engine, kind, actor, magnitude) {
  if (kind === 'medical' && actor.health >= actor.maxHealth || kind === 'oxygen-reserve' && engine.environmentStatus?.oxygen >= engine.environmentStatus?.maxOxygen
    || kind === 'ammo-resupply' && actor.ammoReserve >= 99999 || kind === 'field-support' && actor.armor >= actor.maxArmor
    || kind === 'protective-layer' && actor.armor >= actor.maxArmor && number(actor.fieldProtectionV124) >= magnitude
    || kind === 'neuro-stabilize' && (engine.neuro?.active ? engine.neuro.signal >= 100 : engine.tracker?.energy >= 100)) return refused('full');
  if (kind === 'checkpoint-beacon' && list(engine.hazards).some(hazard => hazard.active !== false && hazard.kind !== 'darkness' && overlaps(actor, hazard))) return refused('target');
  return { ok: true };
}

function movementRequested(engine, actor, controls = {}) {
  const keys = actor.coop ? ['KeyJ', 'KeyL', 'KeyI', 'KeyU'] : ['KeyA', 'KeyD', 'KeyW', 'Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp'];
  keys.push(controls.left, controls.right, controls.up, controls.jump);
  // Holding an existing crouch is a stable working stance.
  if (!actor.crouching) keys.push(controls.down, actor.coop ? 'KeyK' : 'KeyS', actor.coop ? null : 'ArrowDown');
  return keys.filter(Boolean).some(key => engine.keys?.has(key));
}

export function withPlayerFieldActionsV124(Base) {
  return class PlayerFieldActionsV124 extends Base {
    start(options = {}) {
      this.fieldActionsV124 = new Map(); this.fieldActionSerialV124 = 0;
      const result = super.start(options);
      for (const actor of [this.player, this.coop].filter(Boolean)) {
        actor.fieldActionV124 = null; actor.fieldLightV124 ??= false;
        actor.fieldProtectionV124 ??= 0; actor.fieldWeaponBoostShotsV124 ??= 0;
      }
      this.syncFieldLightsV124();
      this.syncFieldSupportV124();
      return { ...result, playerFieldActionsV124: this.getFieldActionsSnapshotV124() };
    }

    isFieldActionBusyV124(actor = this.player) { return Boolean(this.fieldActionsV124?.has(actor)); }
    getFieldActionSnapshotV124(actor = this.player) { return actor?.fieldActionV124 ? { ...actor.fieldActionV124 } : null; }
    getFieldActionsSnapshotV124() {
      return { player: this.getFieldActionSnapshotV124(this.player), coop: this.coopEnabled ? this.getFieldActionSnapshotV124(this.coop) : null,
        lights: { player: Boolean(this.player?.fieldLightV124), coop: Boolean(this.coopEnabled && this.coop?.fieldLightV124) },
        support: Object.fromEntries(['player', 'coop'].map(role => [role, {
          protection: supportValue(this[role]?.fieldProtectionV124), weaponBoostShots: supportValue(this[role]?.fieldWeaponBoostShotsV124)
        }])) };
    }

    getFieldEquipmentAvailabilityV124(equipmentId, actor = this.player) {
      const state = this.equipmentActions?.get(equipmentId);
      const base = fieldActorAvailableV124(this, actor, { stable: state?.action !== 'illumination' });
      if (!base.ok) return base;
      if (actor?.crewV85?.personalEquipment) {
        const item = actor.crewV85.gear.find(entry => entry.instanceId === equipmentId || entry.catalogId === equipmentId);
        return item && ['medical', 'repair', 'scan'].includes(item.function) && !(actor.supportClock > 0)
          && actor.crewV85.charges?.[item.instanceId] > 0 && this.crewCanSupportV85?.(actor, item.function)
          ? { ok: true, personal: true } : refused('empty');
      }
      if (!state) return refused('empty');
      if (isPlaceableEquipmentV86(equipmentId)) return { ok: true, placeable: true };
      const rule = FIELD_ACTIONS_V124[state.action];
      if (!rule) return refused('unsupported');
      const reusable = state.action === 'illumination';
      const reserved = [...(this.fieldActionsV124?.values() || [])].filter(task => task.equipmentId === equipmentId).length;
      if (!reusable && number(state.remaining) <= reserved) return refused('empty');
      if (reusable && !(state.maxCharges > 0 || state.charges > 0)) return refused('empty');
      if (state.action === 'medical' && !(this.inventory?.medkits > this.reservedMedkitsV124())) return refused('empty');
      const available = effectAvailable(this, state.action, actor, state.magnitude);
      if (!available.ok) return available;
      const target = resolveFieldTargetV124(this, state.action, actor);
      return target.ok ? { ...target, reusable, active: reusable && Boolean(actor.fieldLightV124), duration: rule.duration } : target;
    }

    useEquipment(equipmentId, actor = this.player) {
      const id = equipmentId || [...(this.equipmentActions?.values() || [])].find(item => item.remaining > 0)?.id;
      const availability = this.getFieldEquipmentAvailabilityV124(id, actor);
      if (!availability.ok) return this.rejectFieldActionV124(actor, availability);
      if (availability.personal) {
        const item = actor.crewV85.gear.find(entry => entry.instanceId === id || entry.catalogId === id);
        return this.beginCrewFieldActionV124(actor, item.function, id);
      }
      if (availability.placeable) return super.useEquipment(id, actor);
      const state = this.equipmentActions.get(id), rule = FIELD_ACTIONS_V124[state.action];
      if (availability.reusable) {
        actor.fieldLightV124 = !actor.fieldLightV124;
        this.syncFieldLightsV124();
        this.recordFieldEquipmentV124(state, actor, actor.fieldLightV124 ? 'light-on' : 'light-off', false);
        return true;
      }
      return this.beginFieldActionV124(actor, { ...rule, source: 'equipment', equipmentId: id, equipment: state, target: availability.target });
    }

    useMedkit(actor = this.player) {
      const available = fieldActorAvailableV124(this, actor);
      if (!available.ok) return this.rejectFieldActionV124(actor, available);
      if (actor?.crewV85?.personalEquipment) return this.beginCrewFieldActionV124(actor, 'medical');
      if (actor.health >= actor.maxHealth) return this.rejectFieldActionV124(actor, refused('full'));
      if (!(this.inventory?.medkits > this.reservedMedkitsV124())) return this.rejectFieldActionV124(actor, refused('empty'));
      const pending = [...(this.fieldActionsV124?.values() || [])];
      const equipment = [...(this.equipmentActions?.values() || [])].find(item => item.action === 'medical'
        && item.remaining > pending.filter(task => task.equipmentId === item.id).length);
      return this.beginFieldActionV124(actor, { ...FIELD_ACTIONS_V124.medical, source: 'medkit', target: actor,
        equipment, equipmentId: equipment?.id || null });
    }

    reservedMedkitsV124() {
      return [...(this.fieldActionsV124?.values() || [])].filter(task => task.kind === 'medical' && task.source !== 'crew').length;
    }

    beginCrewFieldActionV124(actor, kind, equipmentId = null) {
      const rule = FIELD_ACTIONS_V124[({ medical: 'medical', repair: 'field-repair', scan: 'deep-scan' })[kind]];
      if (!rule || actor.supportClock > 0 || !this.crewCanSupportV85?.(actor, kind)) return this.rejectFieldActionV124(actor, refused('empty'));
      const item = actor.crewV85.gear.find(entry => entry.function === kind && actor.crewV85.charges?.[entry.instanceId] > 0
        && (!equipmentId || entry.instanceId === equipmentId || entry.catalogId === equipmentId));
      if (!item) return this.rejectFieldActionV124(actor, refused('empty'));
      const target = kind === 'repair' ? this.vehicle : actor;
      if (kind === 'medical' && actor.health >= actor.maxHealth) return this.rejectFieldActionV124(actor, refused('full'));
      if (kind === 'repair' && (!target?.active || target.destroyed || !(target.hull < target.maxHull) || !reachable(this, actor, target))) return this.rejectFieldActionV124(actor, refused('target'));
      return this.beginFieldActionV124(actor, { ...rule, source: 'crew', crewFunction: kind, equipmentId: item.instanceId, target });
    }

    beginFieldActionV124(actor, plan) {
      this.fieldActionsV124 ||= new Map();
      if (this.isFieldActionBusyV124(actor)) return false;
      this.cancelPlaceableV86?.(actor, 'equipment');
      cancelTacticalReloadV77(actor, 'field-action');
      const task = { ...plan, serial: ++this.fieldActionSerialV124, elapsed: 0, startedX: actor.x, startedFeet: actor.y + actor.h,
        startedHealth: actor.health, startedArmor: actor.armor, mission: this.mission, level: this.missionLevelRuntime };
      this.fieldActionsV124.set(actor, task); actor.jumpBuffer = 0; actor.vx = 0;
      if (task.target && task.target !== actor) actor.facing = Math.sign(center(task.target).x - center(actor).x) || actor.facing;
      this.setInteractionAnimation?.(actor, task.animation, task.duration);
      if (task.toolId) this.setToolAnimation?.(actor, task.toolId, task.duration);
      this.publishFieldActionV124(actor, task);
      this.onEvent?.({ type: 'field-action-started', action: task.kind, equipmentId: task.equipmentId || null, crewId: actorKey(actor), duration: task.duration, message: `${task.label} · restez en position.` });
      return true;
    }

    publishFieldActionV124(actor, task) {
      actor.fieldActionV124 = { kind: task.kind, label: task.label, phase: 'working', serial: task.serial, elapsed: task.elapsed,
        duration: task.duration, progress: Math.min(1, task.elapsed / task.duration), toolId: task.toolId, targetId: task.target?.id || null };
    }

    rejectFieldActionV124(actor, result) {
      this.onEvent?.({ type: 'field-action-refused', crewId: actorKey(actor), reason: result.reason, message: result.message });
      return false;
    }

    clearFieldActionV124(actor) {
      const task = this.fieldActionsV124?.get(actor);
      this.fieldActionsV124?.delete(actor);
      if (actor) {
        actor.fieldActionV124 = null;
        if (task && actor.interactionKind === task.animation) { actor.interactionClock = 0; actor.actionClock = 0; }
        if (task?.toolId && actor.toolId === task.toolId) actor.toolUseClock = 0;
      }
      return task;
    }

    cancelFieldActionV124(actor = this.player, reason = 'cancelled') {
      const task = this.clearFieldActionV124(actor);
      if (!task) return false;
      this.onEvent?.({ type: 'field-action-cancelled', action: task.kind, crewId: actorKey(actor), reason, message: reasons[reason] || reasons.cancelled });
      return true;
    }

    updatePlayer(actor, delta, controls) {
      if (!this.isFieldActionBusyV124(actor)) return super.updatePlayer(actor, delta, controls);
      if (movementRequested(this, actor, controls)) { this.cancelFieldActionV124(actor, 'movement'); return super.updatePlayer(actor, delta, controls); }
      // Keep the real crouch binding while stationary. Dropping controls.down
      // would stand a held-S operator up, then cancel their task next frame.
      const result = super.updatePlayer(actor, delta, controls);
      this.advanceFieldActionV124(actor, delta);
      return result;
    }

    advanceFieldActionV124(actor, delta) {
      const task = this.fieldActionsV124?.get(actor);
      if (!task || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88) return false;
      const available = fieldActorAvailableV124(this, actor, { ignoreBusy: true });
      if (!available.ok || this.mission !== task.mission || this.missionLevelRuntime !== task.level) return this.cancelFieldActionV124(actor, 'unavailable');
      if (actor.health < task.startedHealth || actor.armor < task.startedArmor) return this.cancelFieldActionV124(actor, 'impact');
      if (Math.hypot(actor.x - task.startedX, actor.y + actor.h - task.startedFeet) > 8) return this.cancelFieldActionV124(actor, 'movement');
      const target = resolveFieldTargetV124(this, task.kind, actor, task.target);
      if (!target.ok || task.source === 'crew' && task.crewFunction === 'repair' && target.target !== this.vehicle) return this.cancelFieldActionV124(actor, target.reason || 'changed');
      task.elapsed = Math.min(task.duration, task.elapsed + Math.max(0, number(delta)));
      this.publishFieldActionV124(actor, task);
      if (task.elapsed + 1e-8 < task.duration) return false;
      // Clear before committing: completion may synchronously trigger a save/event.
      this.clearFieldActionV124(actor);
      const applied = this.commitFieldActionV124(actor, task);
      this.onEvent?.({ type: applied ? 'field-action-complete' : 'field-action-cancelled', action: task.kind, crewId: actorKey(actor),
        reason: applied ? null : 'changed', message: applied ? `${task.label} terminé.` : reasons.changed });
      return applied;
    }

    commitFieldActionV124(actor, task) {
      if (task.source === 'medkit') {
        if (!(this.inventory.medkits > 0) || !(actor.health < actor.maxHealth)) return false;
        const equipment = task.equipmentId && this.equipmentActions?.get(task.equipmentId);
        if (task.equipmentId && (equipment !== task.equipment || !(equipment.remaining > 0))) return false;
        this.inventory.medkits -= 1; actor.health = Math.min(actor.maxHealth, actor.health + 48);
        if (equipment) this.recordFieldEquipmentV124(equipment, actor, 'medical');
        this.onEvent?.({ type: 'resource-used', resource: 'medkit', coop: actor.coop }); return true;
      }
      if (task.source === 'crew') {
        const gear = actor.crewV85?.gear, selected = gear?.find(item => item.instanceId === task.equipmentId);
        if (!selected || !(actor.crewV85.charges?.[selected.instanceId] > 0)) return false;
        // The legacy support action spends its first compatible personal tool.
        // Present the explicitly selected instance first only during the commit.
        actor.crewV85.gear = [selected, ...gear.filter(item => item !== selected)];
        try { return this.useCrewToolV85(actor, task.crewFunction); } finally { actor.crewV85.gear = gear; }
      }
      const state = this.equipmentActions?.get(task.equipmentId);
      if (state !== task.equipment || !(state.remaining > 0) || !effectAvailable(this, task.kind, actor, state.magnitude).ok) return false;
      const target = task.target, magnitude = Math.max(0, number(state.magnitude));
      const effects = this.fieldEffects;
      let result = task.kind;
      switch (task.kind) {
        case 'medical':
          if (!(this.inventory?.medkits > 0)) return false;
          this.inventory.medkits -= 1; actor.health = Math.min(actor.maxHealth, actor.health + magnitude); break;
        case 'access-bypass': {
          if (!accessDoor(target) || !reachable(this, actor, target)) return false;
          if (target.lockedBy === 'security' && this.mission.objectives) this.mission.objectives.route = true;
          target.open = true; target.lockedBy = null; result = `door:${target.id}`;
          this.onEvent?.({ type: 'door', doorId: target.id, open: true }); break;
        }
        case 'field-repair':
          if (target === actor) actor.armor = Math.min(actor.maxArmor, actor.armor + magnitude);
          else target.hull = Math.min(target.maxHull, target.hull + magnitude);
          effects.repairs += 1; break;
        case 'synthetic-repair': target.health = Math.min(target.maxHealth, target.health + magnitude); effects.repairs += 1; break;
        case 'breach':
          if (list(this.walls).includes(target)) target.destroyed = true;
          else { target.open = true; if (list(this.vents).includes(target)) this.inventory.cutter = true; }
          effects.breaches += 1; result = `breach:${target.id}`; break;
        case 'oxygen-reserve': this.environmentStatus.oxygen = Math.min(this.environmentStatus.maxOxygen, this.environmentStatus.oxygen + magnitude * 2); break;
        case 'protective-layer': actor.armor = Math.min(actor.maxArmor, actor.armor + magnitude); actor.fieldProtectionV124 = Math.max(number(actor.fieldProtectionV124), magnitude); break;
        case 'power-transfer':
          if (target === actor) this.tracker.energy = 100;
          else if (target === this.powerNode) { target.active = true; if (this.mission.objectives) this.mission.objectives.power = true; this.onEvent?.({ type: 'power-restored' }); }
          else target.fuel = Math.min(100, target.fuel + magnitude); break;
        case 'ammo-resupply': actor.ammoReserve = Math.min(99999, number(actor.ammoReserve) + magnitude * 2); break;
        case 'incendiary-load': actor.fieldWeaponBoostShotsV124 = supportValue(number(actor.fieldWeaponBoostShotsV124) + Math.max(2, Math.floor(magnitude / 5))); break;
        case 'live-restraint': target.restrainedClock = Math.max(number(target.restrainedClock), 8); effects.restraints += 1; break;
        case 'checkpoint-beacon': this.setCheckpoint(`beacon-${state.uses + 1}`, actor.x, actor.y); break;
        case 'motion-pulse': case 'deep-scan': case 'drone-recon': {
          const detected = contacts(this, actor, task.kind === 'drone-recon' ? 900 : 650);
          this.tracker.energy = Math.min(100, this.tracker.energy + magnitude);
          this.tracker.contacts = detected.slice(0, 12).map(enemy => ({ id: enemy.id, x: enemy.x, y: enemy.y, distance: Math.round(distance(actor, enemy)) }));
          for (const enemy of detected) enemy.revealed = Math.max(number(enemy.revealed), task.kind === 'drone-recon' ? 12 : 7);
          this.trackerPulse = 1; effects.scans += 1; break;
        }
        case 'signal-jam':
          effects.jammerUntil = this.animationTime + 4 + magnitude / 10;
          for (const enemy of contacts(this, actor, 550)) { enemy.jammedClock = 4; enemy.alert = false; } break;
        case 'neuro-stabilize':
          if (this.neuro?.active) { this.neuro.signal = Math.min(100, this.neuro.signal + magnitude * 2); this.neuro.state = 'linked'; }
          else this.tracker.energy = Math.min(100, this.tracker.energy + magnitude); break;
        case 'field-support': actor.armor = Math.min(actor.maxArmor, actor.armor + Math.max(1, magnitude / 2)); break;
        default: return false;
      }
      this.recordFieldEquipmentV124(state, actor, result); return true;
    }

    recordFieldEquipmentV124(state, actor, result, consume = true) {
      if (consume) state.remaining -= 1;
      this.syncFieldSupportV124();
      state.uses = number(state.uses) + 1; state.lastResult = result;
      if (state.action === 'illumination') this.fieldEffects.illumination += 1;
      const log = { equipmentId: state.id, action: state.action, result, remaining: state.remaining, crewId: actorKey(actor), at: Math.round(number(this.mission.elapsed) * 10) / 10 };
      this.equipmentUseLog ||= []; this.equipmentUseLog.push(log);
      if (this.equipmentUseLog.length > 256) this.equipmentUseLog.splice(0, this.equipmentUseLog.length - 256);
      this.onEvent?.({ type: 'equipment-used', ...log });
    }

    syncFieldLightsV124() {
      if (this.stealthRuntime) this.stealthRuntime.lightBoost = this.player?.alive && this.player.fieldLightV124 ? 0.38 : 0;
    }

    syncFieldSupportV124() {
      if (!this.fieldEffects) return;
      this.fieldEffects.protection = supportValue(this.player?.fieldProtectionV124);
      this.fieldEffects.weaponBoostShots = supportValue(this.player?.fieldWeaponBoostShotsV124);
    }

    updateEquipmentDeployments(delta) {
      for (const actor of this.fieldActionsV124?.keys() || []) if (!actor.alive || actor.downed || actor === this.coop && !this.coopEnabled
        || ![this.player, this.coop, ...(this.activeSquadActors?.() || [])].includes(actor)) this.cancelFieldActionV124(actor, 'unavailable');
      this.syncFieldLightsV124();
      return super.updateEquipmentDeployments(delta);
    }

    damagePlayer(actor, amount, options) {
      const health = actor?.health, armor = actor?.armor;
      const result = super.damagePlayer(actor, amount, options);
      if (actor?.health < health || actor?.armor < armor) this.cancelFieldActionV124(actor, 'impact');
      return result;
    }

    setCoop(enabled) {
      if (!enabled && this.coop) this.cancelFieldActionV124(this.coop, 'unavailable');
      return super.setCoop(enabled);
    }

    stop(...args) {
      for (const actor of this.fieldActionsV124?.keys() || []) this.cancelFieldActionV124(actor, 'unavailable');
      return super.stop(...args);
    }

    captureResumeState() {
      this.syncFieldSupportV124();
      const snapshot = this.getFieldActionsSnapshotV124();
      return { ...super.captureResumeState(), playerFieldActionsV124: { schema: 1, lights: snapshot.lights, support: snapshot.support } };
    }

    applyResumeState(raw) {
      for (const actor of this.fieldActionsV124?.keys() || []) this.cancelFieldActionV124(actor, 'cancelled');
      const result = super.applyResumeState(raw);
      if (result?.applied) {
        const lamps = [...(this.equipmentActions?.values() || [])].filter(item => item.action === 'illumination' && item.maxCharges > 0);
        const saved = raw?.playerFieldActionsV124;
        for (const role of ['player', 'coop']) if (this[role]) {
          const hasLamp = this[role].crewV85?.personalEquipment
            ? this[role].crewV85.gear.some(item => lamps.some(lamp => lamp.id === item.catalogId)) : lamps.length > 0;
          this[role].fieldLightV124 = Boolean(hasLamp && saved?.schema === 1 && saved.lights?.[role] === true);
          const support = saved?.schema === 1 && saved.support?.[role];
          // Old V72 support was shared; retain it for J1 on migration, without
          // granting that same consumed equipment to every cooperative actor.
          const legacy = role === 'player' && raw?.gameplaySupportV72?.schema === 1 ? raw.gameplaySupportV72.fieldEffects : null;
          this[role].fieldProtectionV124 = supportValue(support ? support.protection : legacy?.protection);
          this[role].fieldWeaponBoostShotsV124 = supportValue(support ? support.weaponBoostShots : legacy?.weaponBoostShots);
        }
        this.syncFieldLightsV124();
        this.syncFieldSupportV124();
      }
      return result;
    }

    getSnapshot() { return { ...super.getSnapshot(), playerFieldActionsV124: this.getFieldActionsSnapshotV124() }; }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      for (const actor of [this.player, this.coopEnabled ? this.coop : null].filter(actor => actor?.alive && !actor.inVehicle)) {
        if (actor.fieldLightV124) this.drawFieldLightV124(ctx, actor);
        const task = actor.fieldActionV124;
        if (!task) continue;
        const x = actor.x + actor.w / 2, y = actor.y - 20;
        ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold 10px monospace'; ctx.fillStyle = '#d9eadf';
        ctx.fillText(`${task.label} · ${Math.max(0, task.duration - task.elapsed).toFixed(1)} s`, x, y - 7);
        ctx.fillStyle = '#13241c'; ctx.fillRect(x - 35, y, 70, 4); ctx.fillStyle = '#9fd8b1'; ctx.fillRect(x - 35, y, 70 * task.progress, 4); ctx.restore();
      }
    }

    drawFieldLightV124(ctx, actor) {
      const aim = actor.combatAimV83, angle = aim?.active && Number.isFinite(aim.angleRadians) ? aim.angleRadians : actor.facing < 0 ? Math.PI : 0;
      const from = { x: actor.x + actor.w / 2, y: actor.y + actor.h * 0.4, w: 0, h: 0 }, range = 420;
      const world = { walls: [...list(this.walls), ...list(this.covers), ...list(this.platforms)].filter(item => !item.destroyed), doors: this.doors, platforms: [] };
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const light = ctx.createRadialGradient(from.x, from.y, 0, from.x, from.y, range);
      light.addColorStop(0, 'rgba(247,245,213,.23)'); light.addColorStop(1, 'rgba(247,245,213,0)');
      ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(from.x, from.y);
      for (let index = 0; index <= 16; index += 1) {
        const rayAngle = angle - 0.25 + index / 16 * 0.5;
        const ray = { x: Math.cos(rayAngle) * range, y: Math.sin(rayAngle) * range };
        const hit = firstProjectileObstacleV83(from, ray, world);
        ctx.lineTo(from.x + ray.x * (hit?.t ?? 1), from.y + ray.y * (hit?.t ?? 1));
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
  };
}
