import { buildCrewDeploymentV85, crewMovementV85, crewSupportProfileV85, crewToolChargesV85, spendCrewToolV85 } from './crew-runtime-v85.js';
import { fieldActorAvailableV124, fieldLineClearV124 } from './player-field-actions-v124.js';
import { sweepProjectileAabbV83 } from './projectile-collision-v83.js';

export const SQUAD_DOCTRINE_SCHEMA_V132 = 132;
export const SQUAD_ORDERS_V132 = Object.freeze([
  { id: 'follow', label: 'Suivre' }, { id: 'hold', label: 'Tenir la position' },
  { id: 'move', label: 'Avancer au repère' }, { id: 'rally', label: 'Se regrouper' }
]);
export const SQUAD_FORMATIONS_V132 = Object.freeze([
  { id: 'column', label: 'Colonne' }, { id: 'pairs', label: 'Binômes' }, { id: 'spread', label: 'Étalée' }
]);
export const SQUAD_DOCTRINES_V132 = Object.freeze([
  { id: 'support', label: 'Secours et couverture' }, { id: 'discreet', label: 'Discipline de feu' },
  { id: 'defensive', label: 'Défense et repli' }
]);
const list = value => Array.isArray(value) ? value : [];
const clone = value => structuredClone(value);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const distance = (a, b) => Math.hypot(a.x + a.w / 2 - b.x - b.w / 2, a.y + a.h / 2 - b.y - b.h / 2);
const human = actor => actor && actor.species !== 'synthetic' && actor.biology !== 'synthetic'
  && !actor.synthetic && !actor.profile?.synthetic;
const squadMapKeyV132 = id => id.startsWith('crew:') ? id.slice(5) : id;
const actorId = (engine, actor) => actor === engine.player ? 'player' : actor === engine.coop ? 'coop' : `crew:${actor?.crewId || ''}`;
const reasons = {
  unavailable: 'Mission ou opérateur indisponible.', busy: 'Terminez la manipulation en cours.',
  target: 'Choisissez un humain disponible.', local: 'Approchez avec un passage dégagé.',
  grounded: 'Rejoignez un sol stable.', reserved: 'Cette personne est déjà prise en charge.',
  kit: 'Aucun matériel médical compatible disponible.', empty: 'Réserve insuffisante.',
  incompatible: 'Munitions ou kit incompatibles.', full: 'La dotation du destinataire est pleine.',
  marker: 'Placez un repère sur un sol accessible.', carry: 'Posez le blessé avant cette action.',
  drop: 'Aucun sol sûr ne permet de poser le blessé ici.', unknown: 'Commande inconnue.'
};
export const squadCommandReasonV132 = reason => reasons[reason] || reasons.unavailable;
const refusal = reason => ({ applied: false, reason, message: squadCommandReasonV132(reason) });
const normalMission = options => options.missionLevel?.schemaVersion === 52 && options.missionLevel?.validation?.valid === true
  && list(options.crew).filter(member => member.status === 'active').length >= (options.playerIdentityV84?.id === 'player-echo9' ? 1 : 2)
  && list(options.crew).some(member => member.status === 'active' && human(member)) && options.squadDoctrineV132 !== false && !options.qaMode && !options.editorProject
  && !options.neuroMode && !options.neuroProfile && !options.campaign?.specialOperationId
  && !String(options.campaign?.id || '').startsWith('special-');
const identity = options => JSON.stringify([options.world?.id || '', options.campaign?.id || '',
  Number(options.seed) || Number(options.levelSeed?.seed) || 0, options.missionLevel?.signature || '']);
const defaults = (token, roster) => ({ schema: 132, token, roster, selectedTeam: 'all',
  formation: 'pairs', doctrine: 'support', teams: { alpha: { order: 'follow', marker: null }, bravo: { order: 'follow', marker: null } },
  holds: {}, assignments: Object.fromEntries(roster.map((id, index) => [squadMapKeyV132(id), index < 2 ? 'alpha' : 'bravo'])),
  tasks: [], carries: [], telemetry: { orders: 0, transfers: 0, roundsTransferred: 0, medicalTransferred: 0,
    rescues: 0, pickups: 0, drops: 0, distanceCarried: 0, interrupted: 0, traversals: 0 } });
const weaponId = (engine, actor) => actor?.crewV85?.personalEquipment ? actor.crewV85.weaponRuntime?.id
  : actor?.weaponMode === 'rifle' ? engine.weaponRuntime?.id || engine.weapon?.id : actor?.weaponMode === 'sidearm' ? 'weapon-003-m4a3-service-pistol' : null;
const medicalItems = actor => list(actor?.crewV85?.gear).filter(item => item.function === 'medical');

/** Transverse adaptation of the project's Alpha/Bravo doctrine. Reserved actions
 * commit finite resources only after their original physical prerequisites hold. */
export function withSquadDoctrineV132(Base) {
  return class SquadDoctrineV132 extends Base {
    constructor(...args) {
      super(...args);
      const publish = this.onEvent;
      this.onEvent = event => {
        this.reconcileSquadReservationsV132();
        publish?.(event);
      };
    }
    reconcileSquadReservationsV132() {
      const state = this.squadDoctrineV132; if (!state) return;
      const invalid = item => {
        const actor = this.squadActorV132(item.actorId || item.carrierId), target = this.squadActorV132(item.targetId);
        return !actor?.alive || actor.downed || !target?.downed || !(target.bleedOut > 0)
          || item.helperId && !this.squadActorV132(item.helperId)?.alive;
      };
      const tasks = state.tasks.filter(invalid), carries = state.carries.filter(invalid);
      if (!tasks.length && !carries.length) return;
      state.tasks = state.tasks.filter(item => !tasks.includes(item)); state.carries = state.carries.filter(item => !carries.includes(item));
      state.telemetry.interrupted += tasks.length; state.telemetry.drops += carries.length;
      for (const carry of carries) { const target = this.squadActorV132(carry.targetId); if (target) { target.vx = 0; target.vy = 0; target.grounded = false; } }
      this.syncSquadDoctrineActorsV132();
    }
    start(options = {}) {
      this.squadDoctrineEnabledV132 = normalMission(options);
      this.squadDoctrineIdentityV132 = identity(options);
      this.squadManifestV132 = list(options.crew).filter(member => member.status === 'active');
      this.squadPlayerManifestIdV132 = options.playerIdentityV84?.id === 'player-echo9' ? null : this.squadManifestV132[0]?.id || null;
      this.squadDoctrineV132 = null; this.pendingSquadDoctrineV132 = null;
      const result = super.start(options);
      if (this.squadDoctrineEnabledV132) {
        const roster = list(this.squadActors).map(actor => actorId(this, actor));
        this.squadDoctrineV132 = this.pendingSquadDoctrineV132 || this.squadDoctrineV132 || defaults(this.squadDoctrineIdentityV132, roster);
        this.pendingSquadDoctrineV132 = null;
        this.syncSquadDoctrineActorsV132();
      }
      return result;
    }

    squadActorsV132() { return [this.player, this.coopEnabled ? this.coop : null, ...list(this.activeSquadActors?.())].filter(Boolean); }
    squadActorV132(id) { return this.squadActorsV132().find(actor => actorId(this, actor) === id) || null; }
    syncSquadDoctrineActorsV132() {
      for (const actor of this.squadActorsV132()) {
        actor.squadTeamV132 = this.squadDoctrineV132?.assignments[squadMapKeyV132(actorId(this, actor))] || null;
        actor.carriedByV132 = this.squadDoctrineV132?.carries.find(carry => carry.targetId === actorId(this, actor))?.carrierId || null;
        actor.carryingV132 = this.squadDoctrineV132?.carries.find(carry => carry.carrierId === actorId(this, actor))?.targetId || null;
      }
    }
    squadSimulationActiveV132() { return Boolean(this.squadDoctrineV132 && this.running && !this.paused
      && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88 && this.mission?.state === 'active'); }
    squadAdmissionV132(actor = this.player, { stable = true, ignoreTask = false, allowCarry = false } = {}) {
      if (!this.squadSimulationActiveV132() || !this.squadActorsV132().includes(actor)) return 'unavailable';
      const permission = fieldActorAvailableV124(this, actor, { stable });
      if (!permission.ok) return permission.reason === 'grounded' ? 'grounded' : permission.reason === 'busy' ? 'busy' : 'unavailable';
      if (actor.reloading || actor.toolUseClock > 0 || actor.interactionClock > 0 || actor.meleeClock > 0) return 'busy';
      if (!ignoreTask && this.squadDoctrineV132.tasks.some(task => task.actorId === actorId(this, actor) || task.helperId === actorId(this, actor))) return 'busy';
      if (!allowCarry && this.isSquadCarrierV132(actor)) return 'carry';
      return null;
    }
    isSquadCarrierV132(actor) { return Boolean(this.squadDoctrineV132?.carries.some(carry => carry.carrierId === actorId(this, actor))); }
    isSquadActionLockedV132(actor) { return this.isSquadCarrierV132(actor)
      || Boolean(this.squadDoctrineV132?.tasks.some(task => task.actorId === actorId(this, actor) || task.helperId === actorId(this, actor)))
        || Boolean(this.squadDoctrineV132?.carries.some(carry => carry.helperId === actorId(this, actor) && this.squadActorV132(carry.carrierId) && distance(actor, this.squadActorV132(carry.carrierId)) <= 115)); }
    squadCarrySpeedScaleV132(actor) {
      if (!this.squadDoctrineV132) return 1;
      if (this.squadDoctrineV132.tasks.some(task => task.actorId === actorId(this, actor))) return 0.05;
      const carry = this.squadDoctrineV132.carries.find(item => item.carrierId === actorId(this, actor));
      if (!carry) return 1;
      const helper = this.squadActorV132(carry.helperId);
      return helper?.alive && !helper.downed && distance(actor, helper) <= 115
        && Math.abs(actor.y + actor.h - helper.y - helper.h) <= 20 && fieldLineClearV124(this, actor, helper) ? 0.68 : 0.52;
    }
    squadLocalV132(actor, target, range = 104) {
      return target && this.squadActorsV132().includes(target) && actor !== target && distance(actor, target) <= range
        && Math.abs(actor.y + actor.h - target.y - target.h) <= 48 && fieldLineClearV124(this, actor, target);
    }
    squadTargetReasonV132(actor, target, mode) {
      const admission = this.squadAdmissionV132(actor); if (admission) return admission;
      if (!target || target === actor || !human(target) || !target.downed || target.bleedOut <= 0 || target.inVehicle || target.ventTransit) return 'target';
      if (this.squadDoctrineV132.tasks.some(task => task.targetId === actorId(this, target))
        || this.squadDoctrineV132.carries.some(carry => carry.targetId === actorId(this, target))) return 'reserved';
      if (!this.squadLocalV132(actor, target)) return 'local';
      if (mode === 'rescue' && !this.medicalChargeV132(actor)) return 'kit';
      return null;
    }
    medicalChargeV132(actor) {
      if (actor.crewV85?.personalEquipment) return crewToolChargesV85(actor, 'medical') > 0;
      if (actor.squadMember) return actor.specialty === 'medical' && actor.supportCharges > 0;
      return (this.inventory?.medkits || 0) > (this.reservedMedkitsV124?.() || 0);
    }
    medicalReservationV132(actor) {
      if (actor.crewV85?.personalEquipment) {
        const item = medicalItems(actor).find(item => actor.crewV85.charges[item.instanceId] > 0);
        return item ? { kind: 'personal', ownerId: actor.crewV85.crewId, instanceId: item.instanceId } : null;
      }
      return actor.squadMember ? { kind: 'legacy-medical', ownerId: actor.crewId } : { kind: 'shared', ownerId: 'inventory' };
    }
    spendMedicalV132(actor) {
      if (!this.medicalChargeV132(actor)) return false;
      if (actor.crewV85?.personalEquipment) return spendCrewToolV85(actor, 'medical');
      if (actor.squadMember) actor.supportCharges -= 1;
      else this.inventory.medkits -= 1;
      return true;
    }
    transferReasonV132(actor, target, resource) {
      const admission = this.squadAdmissionV132(actor); if (admission) return admission;
      if (!target?.alive || target.downed || !this.squadActorsV132().includes(target)) return 'target';
      if (!this.squadLocalV132(actor, target, 112)) return 'local';
      if (this.squadAdmissionV132(target)) return 'busy';
      if (resource === 'ammo') {
        const weapon = weaponId(this, actor);
        if (!weapon || weapon !== weaponId(this, target)) return 'incompatible';
        if (!(actor.ammoReserve > 0)) return 'empty';
        if ((target.ammoReserve || 0) >= (target.crewV85?.personalEquipment ? target.crewV85.initialReserve : 99999)) return 'full';
        return null;
      }
      if (resource !== 'medical' || !actor.crewV85?.personalEquipment || !target.crewV85?.personalEquipment) return 'incompatible';
      const source = medicalItems(actor).find(item => actor.crewV85.charges[item.instanceId] > 0);
      if (!source) return 'empty';
      const compatible = medicalItems(target).filter(item => item.catalogId === source.catalogId);
      if (!compatible.length) return 'incompatible';
      if (!compatible.some(item => target.crewV85.charges[item.instanceId] < item.charges)) return 'full';
      return null;
    }
    transferSquadResourceV132(actor, target, resource, requested = 12) {
      const reason = this.transferReasonV132(actor, target, resource); if (reason) return refusal(reason);
      let amount = 1;
      if (resource === 'ammo') {
        if (!Number.isInteger(requested) || requested <= 0 || requested > 200) return refusal('empty');
        const capacity = target.crewV85?.personalEquipment ? target.crewV85.initialReserve : 99999;
        amount = Math.min(requested, actor.ammoReserve, capacity - (target.ammoReserve || 0));
        actor.ammoReserve -= amount; target.ammoReserve = (target.ammoReserve || 0) + amount;
        this.squadDoctrineV132.telemetry.roundsTransferred += amount;
      } else {
        const source = medicalItems(actor).find(item => actor.crewV85.charges[item.instanceId] > 0);
        const destination = medicalItems(target).find(item => item.catalogId === source.catalogId && target.crewV85.charges[item.instanceId] < item.charges);
        actor.crewV85.charges[source.instanceId]--; target.crewV85.charges[destination.instanceId]++;
        for (const participant of [actor, target]) participant.supportCharges = Object.values(participant.crewV85.charges).reduce((a, b) => a + b, 0);
        this.squadDoctrineV132.telemetry.medicalTransferred++;
      }
      this.squadDoctrineV132.telemetry.transfers++;
      this.onEvent?.({ type: 'squad-resource-transferred-v132', fromId: actorId(this, actor), toId: actorId(this, target), resource, amount });
      return { applied: true, amount };
    }
    reserveSquadRescueV132(actor, target, kind = 'rescue', helperId = null) {
      const reason = this.squadTargetReasonV132(actor, target, kind); if (reason) return refusal(reason);
      if (!['rescue', 'carry'].includes(kind)) return refusal('unknown');
      const helper = helperId ? this.squadActorV132(helperId) : null;
      if (helperId && (!helper || helper === actor || helper === target || this.squadAdmissionV132(helper)
        || !this.squadLocalV132(actor, helper, 112))) return refusal('local');
      const task = { kind, actorId: actorId(this, actor), targetId: actorId(this, target), helperId: helper ? helperId : null,
        medicalSource: kind === 'rescue' ? this.medicalReservationV132(actor) : null, elapsed: 0, duration: kind === 'rescue' ? 2.4 : 0.8, x: actor.x, y: actor.y, damage: Number(actor.damageTaken) || 0 };
      this.squadDoctrineV132.tasks.push(task); actor.vx = 0;
      this.onEvent?.({ type: 'squad-task-reserved-v132', kind, actorId: task.actorId, targetId: task.targetId });
      return { applied: true, reserved: true };
    }
    updateSquadTasksV132(delta) {
      for (const task of [...this.squadDoctrineV132.tasks]) {
        const actor = this.squadActorV132(task.actorId), target = this.squadActorV132(task.targetId);
        const valid = actor && target?.downed && target.bleedOut > 0 && !this.squadAdmissionV132(actor, { ignoreTask: true })
          && this.squadLocalV132(actor, target) && Math.hypot(actor.x - task.x, actor.y - task.y) <= 12
          && (Number(actor.damageTaken) || 0) === task.damage && (task.kind !== 'rescue' || this.medicalChargeV132(actor))
          && (!task.helperId || this.squadActorV132(task.helperId)?.alive && this.squadLocalV132(actor, this.squadActorV132(task.helperId), 112));
        if (!valid) { this.squadDoctrineV132.tasks = this.squadDoctrineV132.tasks.filter(item => item !== task);
          this.squadDoctrineV132.telemetry.interrupted++; this.onEvent?.({ type: 'squad-task-cancelled-v132', targetId: task.targetId }); continue; }
        task.elapsed += delta;
        if (task.elapsed < task.duration) continue;
        this.squadDoctrineV132.tasks = this.squadDoctrineV132.tasks.filter(item => item !== task);
        if (task.kind === 'rescue') {
          if (!this.spendMedicalV132(actor)) continue;
          Object.assign(target, { alive: true, downed: false, bleedOut: 0, health: Math.min(target.maxHealth, actor.crewV85 ? crewSupportProfileV85(actor).heal : 34),
            v52HurtClock: 0.4, actionClock: 0.8, vx: 0, vy: 0 });
          actor.supportClock = 7; this.squadDoctrineV132.telemetry.rescues++;
          if (this.squadTelemetry) this.squadTelemetry.revives++;
          this.onEvent?.({ type: 'squad-revived', crewId: actor.crewId, targetId: target.crewId || target.operatorId || task.targetId, emergency: false });
        } else {
          this.squadDoctrineV132.carries.push({ carrierId: task.actorId, targetId: task.targetId, helperId: task.helperId,
            dx: target.x - actor.x, dy: target.y - actor.y, lifted: false });
          this.squadDoctrineV132.telemetry.pickups++; this.syncSquadDoctrineActorsV132();
          this.onEvent?.({ type: 'squad-carry-started-v132', actorId: task.actorId, targetId: task.targetId, helperId: task.helperId });
        }
      }
    }
    squadCarryObstaclesV132() {
      return [...list(this.walls), ...list(this.covers), ...(this.closedDoorColliders?.() || []),
        ...list(this.platforms), ...list(this.destructibleSceneryV130?.objects)].filter(item => !item.destroyed);
    }
    squadCarrySweepV132(body, displacement, { omit = null } = {}) {
      let fraction = 1;
      for (const obstacle of this.squadCarryObstaclesV132()) {
        if (obstacle === omit) continue;
        const hit = sweepProjectileAabbV83(body, displacement, obstacle);
        if (hit) fraction = Math.min(fraction, hit.t);
      }
      return fraction;
    }
    syncSquadCarriesV132(delta = 0) {
      for (const carry of [...this.squadDoctrineV132.carries]) {
        const actor = this.squadActorV132(carry.carrierId), target = this.squadActorV132(carry.targetId);
        if (!actor?.alive || actor.downed || !target?.downed || actor.inVehicle || actor.ventTransit) {
          this.releaseSquadCarryV132(carry, 'interrupted'); continue;
        }
        // Acquisition lifts the original body continuously; it never injects a
        // replacement actor or jumps a casualty to a hand/shoulder coordinate.
        const desiredDx = (actor.facing || 1) * 18, desiredDy = -24;
        const nextDx = carry.dx + clamp(desiredDx - carry.dx, -60 * delta, 60 * delta);
        const nextDy = carry.dy + clamp(desiredDy - carry.dy, -60 * delta, 60 * delta);
        const movement = { x: actor.x + nextDx - target.x, y: actor.y + nextDy - target.y };
        const fraction = this.squadCarrySweepV132(target, movement);
        const oldX = target.x, oldY = target.y;
        target.x += movement.x * fraction; target.y += movement.y * fraction;
        carry.dx = target.x - actor.x; carry.dy = target.y - actor.y;
        carry.lifted = Math.abs(carry.dx - desiredDx) < 1 && Math.abs(carry.dy - desiredDy) < 1;
        target.vx = actor.vx; target.vy = 0; target.grounded = false; target.climbing = false;
        this.squadDoctrineV132.telemetry.distanceCarried += Math.hypot(target.x - oldX, target.y - oldY);
        if (actor.crewV85) actor.crewV85.endurance = Math.max(0, actor.crewV85.endurance - delta * 2);
      }
    }
    releaseSquadCarryV132(carry, reason = 'drop') {
      this.squadDoctrineV132.carries = this.squadDoctrineV132.carries.filter(item => item !== carry);
      const target = this.squadActorV132(carry.targetId);
      if (target) { target.vx = 0; target.vy = 0; target.grounded = false; }
      this.squadDoctrineV132.telemetry.drops++; this.syncSquadDoctrineActorsV132();
      this.onEvent?.({ type: 'squad-carry-dropped-v132', actorId: carry.carrierId, targetId: carry.targetId, reason });
      return { applied: true };
    }
    squadDropReasonV132(actor) {
      const reason = this.squadAdmissionV132(actor, { allowCarry: true }); if (reason) return reason;
      const carry = this.squadDoctrineV132.carries.find(item => item.carrierId === actorId(this, actor));
      const target = carry && this.squadActorV132(carry.targetId);
      if (!carry || !target) return 'target';
      const support = this.missionLevelSurfaceNear?.(target, { verticalRange: 60 });
      const resting = support && { ...target, y: support.y - target.h };
      if (!resting || target.x < support.x || target.x + target.w > support.x + support.w
        || this.squadCarryObstaclesV132().some(box => box !== support && resting.x < box.x + box.w && resting.x + resting.w > box.x
          && resting.y < box.y + box.h && resting.y + resting.h > box.y)
        || list(this.hazards).some(box => box.active !== false && box.kind !== 'darkness' && resting.x < box.x + box.w
          && resting.x + resting.w > box.x && resting.y < box.y + box.h && resting.y + resting.h > box.y)) return 'drop';
      return null;
    }
    dropSquadCarryV132(actor) {
      const reason = this.squadDropReasonV132(actor);
      if (reason) return refusal(reason);
      return this.releaseSquadCarryV132(this.squadDoctrineV132.carries.find(item => item.carrierId === actorId(this, actor)));
    }

    performSquadActionV132(action, value = null, actor = this.player) {
      if (action && typeof action === 'object') { actor = value && typeof value === 'object' ? value : actor; value = action.value ?? action.targetId ?? null; action = action.action; }
      const reason = this.squadAdmissionV132(actor, { allowCarry: action === 'drop' || action === 'select-team', stable: action !== 'select-team', ignoreTask: action === 'cancel-task' });
      if (reason) return refusal(reason);
      const state = this.squadDoctrineV132;
      if (action === 'select-team' && ['all', 'alpha', 'bravo'].includes(value)) state.selectedTeam = value;
      else if (action === 'formation' && SQUAD_FORMATIONS_V132.some(item => item.id === value)) state.formation = value;
      else if (action === 'doctrine' && SQUAD_DOCTRINES_V132.some(item => item.id === value)) state.doctrine = value;
      else if (action === 'marker-platform') {
        const platform = list(this.platforms).find(item => item.id === value && item.w >= actor.w + 12 && item.kind !== 'lift');
        if (!platform) return refusal('marker');
        return this.performSquadActionV132('marker', { x: clamp(actor.x + (actor.facing || 1) * 240, platform.x + 6, platform.x + platform.w - actor.w - 6), y: platform.y - actor.h }, actor);
      } else if (action === 'marker') {
        const point = value && finite(value.x) && finite(value.y) && { x: value.x, y: value.y, w: actor.w, h: actor.h };
        const support = point && this.missionLevelSurfaceFor?.(point, { tolerance: 24 });
        if (!support || point.x < 0 || point.x + point.w > this.missionLevelBounds.width) return refusal('marker');
        for (const id of state.selectedTeam === 'all' ? ['alpha', 'bravo'] : [state.selectedTeam]) state.teams[id].marker = { x: point.x, y: support.y - actor.h };
      } else if (action === 'order' && SQUAD_ORDERS_V132.some(item => item.id === value)) {
        const teams = state.selectedTeam === 'all' ? ['alpha', 'bravo'] : [state.selectedTeam];
        if (value === 'move' && teams.some(id => !state.teams[id].marker)) return refusal('marker');
        for (const id of teams) { state.teams[id].order = value;
          if (value === 'hold') for (const member of this.squadActorsV132().filter(member => member.squadTeamV132 === id)) state.holds[squadMapKeyV132(actorId(this, member))] = { x: member.x, y: member.y }; }
        state.telemetry.orders++;
      } else if (action === 'assign' && value && state.roster.includes(value.actorId) && ['alpha', 'bravo'].includes(value.team)) {
        state.assignments[squadMapKeyV132(value.actorId)] = value.team; this.syncSquadDoctrineActorsV132();
      } else if (action === 'share-ammo' || action === 'share-medical') return this.transferSquadResourceV132(actor, this.squadActorV132(typeof value === 'string' ? value : value?.targetId),
        action === 'share-ammo' ? 'ammo' : 'medical', typeof value === 'object' ? value.amount ?? 12 : 12);
      else if (action === 'carry-assisted') {
        const target = this.squadActorV132(value), helper = this.squadActorsV132().find(member => member.squadMember && member !== target && member !== actor && !this.squadAdmissionV132(member) && this.squadLocalV132(actor, member, 112));
        if (!helper) return refusal('local');
        return this.reserveSquadRescueV132(actor, target, 'carry', actorId(this, helper));
      } else if (action === 'rescue' || action === 'carry') return this.reserveSquadRescueV132(actor, this.squadActorV132(typeof value === 'string' ? value : value?.targetId), action, typeof value === 'object' ? value.helperId : null);
      else if (action === 'drop') return this.dropSquadCarryV132(actor);
      else if (action === 'cancel-task') { state.tasks = state.tasks.filter(task => task.actorId !== actorId(this, actor)); }
      else return refusal('unknown');
      this.onEvent?.({ type: 'squad-command-v132', action, value: clone(value) }); return { applied: true };
    }
    getSquadCommandModelV132(actor = this.player) {
      const state = this.squadDoctrineV132; if (!state) return null;
      const reason = this.squadAdmissionV132(actor, { allowCarry: true, stable: false });
      const stableReason = this.squadAdmissionV132(actor);
      return { schema: 132, title: 'Escouade Alpha / Bravo', canAct: !reason, reason, selectedTeam: state.selectedTeam,
        formation: state.formation, doctrine: state.doctrine, teams: clone(state.teams),
        orders: SQUAD_ORDERS_V132.map(item => ({ ...item, canApply: !stableReason && (item.id !== 'move' || (state.selectedTeam === 'all' ? ['alpha', 'bravo'] : [state.selectedTeam]).every(id => state.teams[id].marker)), reason: stableReason || 'marker' })),
        formations: SQUAD_FORMATIONS_V132.map(item => ({ ...item, canApply: !stableReason, reason: stableReason })),
        doctrines: SQUAD_DOCTRINES_V132.map(item => ({ ...item, canApply: !stableReason, reason: stableReason })),
        actors: this.squadActorsV132().filter(member => member !== actor).map(member => {
          const rescueReason = this.squadTargetReasonV132(actor, member, 'rescue'), carryReason = this.squadTargetReasonV132(actor, member, 'carry');
          const ammoReason = this.transferReasonV132(actor, member, 'ammo'), medicalReason = this.transferReasonV132(actor, member, 'medical');
          return { id: actorId(this, member), label: member.name || (member.coop ? 'Opérateur J2' : 'Opérateur J1'),
            team: member.squadTeamV132, health: member.health, alive: Boolean(member.alive), downed: Boolean(member.downed),
            bleedOut: member.bleedOut, ammoReserve: member.ammoReserve || 0, canRescue: !rescueReason, rescueReason,
            canCarry: !carryReason, carryReason, canCarryAssisted: !carryReason && this.squadActorsV132().some(helper => helper.squadMember && helper !== member && helper !== actor && !this.squadAdmissionV132(helper) && this.squadLocalV132(actor, helper, 112)), canShareAmmo: !ammoReason, ammoReason, canShareMedical: !medicalReason, medicalReason };
        }), carryingId: actor.carryingV132, canDrop: !this.squadDropReasonV132(actor), dropReason: this.squadDropReasonV132(actor),
        canCancelTask: state.tasks.some(task => task.actorId === actorId(this, actor)),
        markerCandidates: list(this.platforms).filter(platform => platform.kind !== 'lift' && platform.w >= actor.w + 12 && Math.abs(platform.x - actor.x) < 950).map(platform => ({ id: platform.id, label: `Repère ${list(this.platforms).indexOf(platform) + 1} · palier ${[...new Set(list(this.platforms).map(item => item.y))].sort((a, b) => b - a).indexOf(platform.y) + 1}`, canApply: !stableReason, reason: stableReason })),
        tasks: clone(state.tasks), telemetry: clone(state.telemetry),
        instruction: 'Ordres C · secours réservés et ressources finies. Le portage occupe les mains ; utilisez les ascenseurs et posez le blessé avant une échelle.',
        artStatus: 'adapted-existing-casualty-art-no-dedicated-carry-animation' };
    }

    updateSquadMovement(member, index, leader, delta) {
      if (!this.squadDoctrineV132) return super.updateSquadMovement(member, index, leader, delta);
      if (!this.squadSimulationActiveV132()) return;
      const state = this.squadDoctrineV132, id = actorId(this, member), team = state.teams[state.assignments[squadMapKeyV132(id)] || 'alpha'];
      if (member.carriedByV132 || state.tasks.some(task => task.actorId === id || task.helperId === id)) { member.vx = 0; return; }
      const helping = state.carries.find(carry => carry.helperId === id), carrier = helping && this.squadActorV132(helping.carrierId);
      const peers = list(this.activeSquadActors()).filter(peer => peer.squadTeamV132 === member.squadTeamV132);
      const slot = Math.max(0, peers.indexOf(member));
      const spacing = state.formation === 'spread' ? 126 : state.formation === 'column' ? 64 : 72;
      const alphaSize = list(this.activeSquadActors()).filter(peer => peer.squadTeamV132 === 'alpha').length;
      const offset = member.squadTeamV132 === 'bravo' ? state.formation === 'pairs' ? Math.ceil(alphaSize / 2) : alphaSize : 0;
      const row = (state.formation === 'pairs' ? Math.floor(slot / 2) + 1 : slot + 1) + offset;
      let target = carrier ? { ...carrier, x: carrier.x - (carrier.facing || 1) * 70 }
        : team.order === 'move' ? { ...leader, ...team.marker }
          : team.order === 'hold' ? { ...member, ...(state.holds[squadMapKeyV132(id)] || { x: member.x, y: member.y }) }
            : { ...leader, x: leader.x - (leader.facing || 1) * row * spacing + (state.formation === 'pairs' && slot % 2 ? 38 : 0) };
      if (state.doctrine === 'defensive' && ['follow', 'rally'].includes(team.order)) {
        const threat = this.closestEnemy(member, 240);
        if (threat?.alert && member.health < member.maxHealth * .5) target.x = leader.x - (Math.sign(threat.x - leader.x) || 1) * (170 + row * 24);
      }
      const rescueTask = state.tasks.find(task => task.actorId === id);
      if (rescueTask) target = this.squadActorV132(rescueTask.targetId) || target;
      target.x = clamp(target.x, 4, Math.max(4, this.missionLevelBounds.width - member.w - 4));
      member.speed = 192 * crewMovementV85(member).speed * this.squadCarrySpeedScaleV132(member);
      member.levelNavigation ||= { mode: 'surface', surfaceId: null, connectorId: null, destinationY: null, riding: false,
        lastSafeX: member.x, lastSafeY: member.y };
      const ridingLift = list(this.lifts).find(lift => lift.controlledV130 && Math.abs(member.y + member.h - lift.y) < 8
        && member.x + member.w > lift.x + 4 && member.x < lift.x + lift.w - 4);
      const centeredSurface = this.missionLevelSurfaceFor?.(member, { tolerance: 8 });
      const edgeSurface = !centeredSurface && list(this.platforms).find(platform => Math.abs(member.y + member.h - platform.y) < 8
        && member.x + member.w > platform.x + 4 && member.x < platform.x + platform.w - 4);
      const surface = centeredSurface || ridingLift || edgeSurface;
      if (ridingLift && ['moving', 'blocked'].includes(ridingLift.stateV130) && member.levelNavigation.mode === 'lift') member.levelNavigation.destinationY = ridingLift.targetYV130;
      if (ridingLift && (member.x < ridingLift.x + 6 || member.x + member.w > ridingLift.x + ridingLift.w - 6)) {
        // A partial edge boarding must walk into the cabin before its body can
        // meet the next landing's underside. Preserve its physical feet.
        if (member.levelNavigation.mode !== 'lift') {
          Object.assign(member.levelNavigation, { mode: 'lift', connectorId: ridingLift.id, destinationY: ridingLift.targetYV130, riding: true }); state.telemetry.traversals++;
        }
        member.climbing = false;
        const destination = ridingLift.x + ridingLift.w / 2 - member.w / 2, before = member.x;
        member.vx = Math.sign(destination - member.x) * member.speed;
        member.x += Math.sign(destination - member.x) * Math.min(Math.abs(destination - member.x), member.speed * delta);
        this.resolveHorizontal(member, before);
        member.grounded = true; return;
      }
      if (edgeSurface && !ridingLift) {
        const destination = clamp(target.x, edgeSurface.x + 2, edgeSurface.x + edgeSurface.w - member.w - 2), before = member.x;
        member.vx = Math.sign(destination - member.x) * member.speed;
        member.x += Math.sign(destination - member.x) * Math.min(Math.abs(destination - member.x), member.speed * delta);
        this.resolveHorizontal(member, before); member.grounded = true; return;
      }
      const targetSurface = this.missionLevelSurfaceFor?.(target, { tolerance: 40 }) || this.missionLevelSurfaceNear?.(target);
      const modeBefore = member.levelNavigation.mode;
      if (surface || ['ladder', 'lift'].includes(modeBefore)) {
        if (this.advanceEnemyMissionNavigation?.(member, target, surface, targetSurface, delta)) {
          member.climbing = member.levelNavigation.mode === 'ladder';
          if (modeBefore !== member.levelNavigation.mode) state.telemetry.traversals++;
          return;
        }
        member.climbing = false;
        if (surface && Math.abs(target.x - member.x) > 12) this.moveEnemyOnMissionSurface(member, target.x, delta);
        else member.vx = 0;
        member.grounded = Boolean(surface); return;
      }
      member.climbing = false; member.vx = 0;
      const bottom = member.y + member.h; member.y += member.vy * delta + 950 * delta * delta;
      member.vy += 1900 * delta; member.grounded = false; this.resolveVertical(member, bottom);
    }
    moveEnemyOnMissionSurface(actor, destination, delta, scale = 1) {
      if (this.squadDoctrineV132 && actor?.squadMember) {
        const feet = actor.y + actor.h;
        for (const lift of list(this.lifts).filter(item => item.controlledV130)) {
          if (Math.abs(feet - lift.y) <= 8 || !lift.stops.some(stop => Math.abs(feet - stop.y) < 12)) continue;
          if (actor.x + actor.w / 2 < lift.x + lift.w / 2 && destination > lift.x - actor.w - 6)
            destination = lift.x - actor.w - 6;
          else if (actor.x + actor.w / 2 >= lift.x + lift.w / 2 && destination < lift.x + lift.w + 6)
            destination = lift.x + lift.w + 6;
        }
      }
      return super.moveEnemyOnMissionSurface(actor, destination, delta, scale);
    }
    requestLiftV130(lift, destination, source) {
      if (this.squadDoctrineV132 && ['enemy', 'squad'].includes(source) && lift?.stateV130 === 'blocked'
        && Math.abs(destination - lift.targetYV130) < 1) return false;
      return super.requestLiftV130(lift, destination, source);
    }
    advanceEnemyMissionNavigation(actor, target, surface, targetSurface, delta) {
      if (!this.squadDoctrineV132 || !actor?.squadMember || actor.levelNavigation?.mode !== 'lift')
        return super.advanceEnemyMissionNavigation(actor, target, surface, targetSurface, delta);
      const navigation = actor.levelNavigation, lift = list(this.lifts).find(item => item.id === navigation.connectorId && item.controlledV130);
      if (!lift) return super.advanceEnemyMissionNavigation(actor, target, surface, targetSurface, delta);
      const center = lift.x + lift.w / 2 - actor.w / 2, feet = actor.y + actor.h;
      if (navigation.riding && ['moving', 'blocked'].includes(lift.stateV130)) navigation.destinationY = lift.targetYV130;
      if (!navigation.riding) {
        const available = Math.abs(lift.y - feet) <= 1 && lift.stateV130 === 'idle';
        const humanAboard = [this.player, this.coopEnabled ? this.coop : null].some(operator => operator && Math.abs(operator.y + operator.h - lift.y) < 8 && operator.x + operator.w > lift.x && operator.x < lift.x + lift.w);
        if (!humanAboard) this.requestLiftV130(lift, surface?.y, 'squad');
        const approach = available ? center : actor.x + actor.w / 2 < lift.x + lift.w / 2 ? lift.x - actor.w - 6 : lift.x + lift.w + 6;
        this.moveEnemyOnMissionSurface(actor, approach, delta);
        if (available && Math.abs(actor.x - center) < .1) navigation.riding = true;
        return true;
      }
      if (Math.abs(actor.x - center) > .1 && !(lift.stateV130 === 'idle' && Math.abs(lift.y - navigation.destinationY) < 1)) {
        const before = actor.x; actor.vx = Math.sign(center - actor.x) * actor.speed;
        actor.x += Math.sign(center - actor.x) * Math.min(Math.abs(center - actor.x), actor.speed * delta);
        this.resolveHorizontal(actor, before); return true;
      }
      return super.advanceEnemyMissionNavigation(actor, target, surface, targetSurface, delta);
    }
    separateSquadFormation(members, fixedActors) {
      if (!this.squadDoctrineV132) return super.separateSquadFormation(members, fixedActors);
      // Slots are destinations, never separation teleports. A member waits at
      // a bottleneck while the leading pair physically clears it.
      return 0;
    }
    updateSquadCombat(member) {
      if (!this.squadDoctrineV132) return super.updateSquadCombat(member);
      if (this.isSquadActionLockedV132(member) || member.carriedByV132) return false;
      const target = this.closestEnemy(member, member.profile?.range || 620);
      if (this.squadDoctrineV132.doctrine === 'discreet' && target && !target.alert
        && distance(member, target) > 150 && !(member.v52HurtClock > 0)) return false;
      if (target && !fieldLineClearV124(this, member, target)) return false;
      return super.updateSquadCombat(member);
    }
    updateSquadSupport(member, active, leader) {
      if (!this.squadDoctrineV132) return super.updateSquadSupport(member, active, leader);
      if (this.squadDoctrineV132.doctrine !== 'support' || this.isSquadActionLockedV132(member)) return false;
      const target = this.squadActorsV132().find(actor => actor.downed && !this.squadTargetReasonV132(member, actor, 'rescue'));
      return target ? this.reserveSquadRescueV132(member, target).applied : false;
    }
    tryEmergencySquadRevive(target) { return this.squadDoctrineEnabledV132 ? false : super.tryEmergencySquadRevive(target); }
    reviveFromSquad(actor, target) { return this.squadDoctrineV132 ? this.reserveSquadRescueV132(actor, target).applied : super.reviveFromSquad(actor, target); }
    revive(actor, target) { return this.squadDoctrineV132 ? this.reserveSquadRescueV132(actor, target).applied : super.revive(actor, target); }
    failMission(reason) {
      // A downed commander still has a finite bleed-out window if a physical
      // living medic with remaining issue can reach them. No state is revived.
      if (this.squadDoctrineV132 && reason === 'marine-a-terre' && this.player?.downed
        && this.squadActorsV132().some(actor => actor.squadMember && actor.alive && this.medicalChargeV132(actor))) return false;
      return super.failMission(reason);
    }
    updatePlayer(actor, delta, controls) {
      if (!this.squadDoctrineV132) return super.updatePlayer(actor, delta, controls);
      if (!this.squadSimulationActiveV132() || !finite(delta) || delta <= 0) return;
      if (actor.carriedByV132) { this.updateDowned(actor, delta); return; }
      const carrying = this.isSquadCarrierV132(actor), working = this.squadDoctrineV132.tasks.some(task => task.actorId === actorId(this, actor));
      if (!carrying && !working) return super.updatePlayer(actor, delta, controls);
      // Suppress only this operator's traversal buttons for this synchronous
      // motion call. The real held-input set and J2 bindings remain intact.
      const savedKeys = this.keys;
      const suppressed = new Set([controls.jump, controls.up, controls.down]);
      if (!actor.coop) for (const code of ['ArrowUp', 'ArrowDown']) suppressed.add(code);
      this.keys = new Set([...savedKeys].filter(code => !suppressed.has(code)));
      const before = { x: actor.x, y: actor.y };
      actor.jumpBuffer = 0; actor.climbing = false; actor.ladderId = null;
      try { return super.updatePlayer(actor, delta, controls); }
      finally { this.keys = savedKeys;
        if (working) { actor.x = before.x; actor.y = before.y; actor.vx = 0; }
        if (carrying) this.syncSquadCarriesV132(delta);
      }
    }
    resolveHorizontal(actor, previousX) {
      const result = super.resolveHorizontal(actor, previousX);
      const carry = this.squadDoctrineV132?.carries.find(item => item.carrierId === actorId(this, actor));
      const target = carry && this.squadActorV132(carry.targetId);
      if (target) {
        const movement = { x: actor.x - previousX, y: 0 };
        const fraction = this.squadCarrySweepV132(target, movement);
        actor.x = previousX + movement.x * fraction;
        if (fraction < 1) actor.vx = 0;
      }
      return result;
    }
    resolveVertical(actor, previousBottom) {
      const result = super.resolveVertical(actor, previousBottom);
      const carry = this.squadDoctrineV132?.carries.find(item => item.carrierId === actorId(this, actor));
      const target = carry && this.squadActorV132(carry.targetId);
      if (target) {
        const previousY = previousBottom - actor.h, movement = { x: 0, y: actor.y - previousY };
        const fraction = this.squadCarrySweepV132(target, movement);
        actor.y = previousY + movement.y * fraction; if (fraction < 1) actor.vy = 0;
      }
      return result;
    }
    verticalActorsV130() {
      const original = super.verticalActorsV130();
      // Include the lifted original body as a rider by widening the carrier's
      // collision hull in updateLifts; do not let the cabin crush its passenger.
      return this.squadDoctrineV132 ? original.filter(actor => !actor.carriedByV132) : original;
    }
    updateLifts(delta) {
      if (!this.squadDoctrineV132?.carries.length || !this.squadSimulationActiveV132()) return super.updateLifts(delta);
      const saved = [], pendingEvents = [], originalEvent = this.onEvent;
      for (const lift of list(this.lifts).filter(item => item.controlledV130 && ['moving', 'blocked'].includes(item.stateV130))) {
        const requested = Math.sign(lift.targetYV130 - lift.y) * Math.min(Math.abs(lift.targetYV130 - lift.y), lift.speedV130 * delta);
        let fraction = 1, blocker = null;
        for (const carry of this.squadDoctrineV132.carries) {
          const actor = this.squadActorV132(carry.carrierId), target = this.squadActorV132(carry.targetId);
          if (!actor || !target || actor.x + actor.w <= lift.x || actor.x >= lift.x + lift.w
            || Math.abs(actor.y + actor.h - lift.y) >= 8) continue;
          for (const obstacle of this.squadCarryObstaclesV132()) {
            if (obstacle === lift) continue;
            const hit = sweepProjectileAabbV83(target, { x: 0, y: requested }, obstacle);
            if (hit && hit.t < fraction) { fraction = hit.t; blocker = obstacle.id || 'structure'; }
          }
        }
        if (fraction < 1) { saved.push({ lift, speed: lift.speedV130, blocker }); lift.speedV130 = Math.abs(requested) * fraction / delta; }
      }
      // Events may trigger synchronous save capture. Deliver them only after
      // original bodies and authored speeds represent the same completed step.
      this.onEvent = event => pendingEvents.push(event);
      let result;
      try { result = super.updateLifts(delta); }
      finally {
        for (const entry of saved) { entry.lift.speedV130 = entry.speed; entry.lift.stateV130 = 'blocked';
          entry.lift.blockedByV130 = entry.blocker;
          pendingEvents.push({ type: 'lift-blocked-v130', liftId: entry.lift.id, obstacleId: entry.blocker }); }
        this.syncSquadCarriesV132(0); this.onEvent = originalEvent;
        for (const event of pendingEvents) originalEvent?.(event);
      }
      return result;
    }
    updateMissionSquad(delta) {
      if (this.squadDoctrineV132 && (!this.squadSimulationActiveV132() || !finite(delta) || delta <= 0)) return;
      const result = super.updateMissionSquad(delta);
      if (!this.squadSimulationActiveV132()) return result;
      for (const actor of list(this.activeSquadActors()).filter(actor => !actor.alive && !actor.carriedByV132 && !actor.inVehicle)) {
        const bottom = actor.y + actor.h; actor.y += (Number(actor.vy) || 0) * delta + 950 * delta * delta;
        actor.vy = (Number(actor.vy) || 0) + 1900 * delta; actor.grounded = false; this.resolveVertical(actor, bottom);
      }
      this.updateSquadTasksV132(delta); this.syncSquadCarriesV132(delta);
      if (!this.player?.alive && !this.player?.downed && !(this.coopEnabled && this.coop?.alive)) super.failMission('marine-a-terre');
      return result;
    }
    setCoop(enabled) {
      if (this.squadDoctrineV132 && enabled !== this.coopEnabled && (this.squadDoctrineV132.tasks.length || this.squadDoctrineV132.carries.length)) return false;
      const result = super.setCoop(enabled); this.syncSquadDoctrineActorsV132(); return result;
    }
    drawWorld(ctx) {
      const result = super.drawWorld(ctx);
      for (const carry of list(this.squadDoctrineV132?.carries)) {
        const actor = this.squadActorV132(carry.carrierId), target = this.squadActorV132(carry.targetId); if (!actor || !target) continue;
        ctx.save(); ctx.strokeStyle = '#d0b66d'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(actor.x + actor.w / 2, actor.y + actor.h * 0.4);
        ctx.lineTo(target.x + target.w / 2, target.y + target.h * 0.5); ctx.stroke();
        ctx.fillStyle = '#ecdfb2'; ctx.font = '10px monospace'; ctx.fillText('PORTAGE · MAINS OCCUPÉES', actor.x - 48, Math.min(actor.y, target.y) - 22); ctx.restore();
      }
      return result;
    }
    openSquadCommandV132() {
      if (!this.getSquadCommandModelV132()) return false;
      this.clearGameplayInput?.('squad-command'); this.onEvent?.({ type: 'squad-command-open-v132' }); return true;
    }
    closeSquadCommandV132() { this.clearGameplayInput?.('squad-command-close'); return true; }
    getSquadDoctrineSnapshotV132() {
      return this.squadDoctrineV132 ? { active: true, ...clone(this.squadDoctrineV132),
        readiness: { finiteTransfer: true, reservedRescue: true, originalActorCarry: true, physicalTraversal: true,
          dedicatedCarryArt: false, casteSpecificCounters: false, environmentalMultiOperatorTasks: false } } : { active: false };
    }
    captureResumeState() {
      const state = super.captureResumeState();
      if (this.squadDoctrineV132) state.squadDoctrineV132 = clone(this.squadDoctrineV132);
      return state;
    }
    validateSquadResumeV132(raw) {
      const state = raw?.squadDoctrineV132; if (!state) return { valid: true, migrated: true };
      if (!this.squadDoctrineEnabledV132 || state.schema !== 132 || state.token !== this.squadDoctrineIdentityV132) return { valid: false, reason: 'squad-identity-mismatch' };
      if (!Array.isArray(state.roster) || state.roster.length > 4 || new Set(state.roster).size !== state.roster.length
        || !state.roster.every(id => typeof id === 'string' && id.startsWith('crew:') && id.length <= 160)
        || !['all', 'alpha', 'bravo'].includes(state.selectedTeam)
        || !SQUAD_FORMATIONS_V132.some(item => item.id === state.formation) || !SQUAD_DOCTRINES_V132.some(item => item.id === state.doctrine)
        || !state.teams || !state.assignments || !state.holds || !state.telemetry || !Array.isArray(state.tasks) || !Array.isArray(state.carries)) return { valid: false, reason: 'squad-state-invalid' };
      const known = new Set(['player', ...(raw.coop?.enabled ? ['coop'] : []), ...list(raw.squad?.members).map(actor => `crew:${actor.crewId}`)]);
      if (!state.roster.every(id => known.has(id) && this.squadManifestV132.some(member => id === `crew:${member.id}`)) || !Object.keys(state.assignments).every(id => state.roster.map(squadMapKeyV132).includes(id))
        || !state.roster.every(id => ['alpha', 'bravo'].includes(state.assignments[squadMapKeyV132(id)]))) return { valid: false, reason: 'squad-roster-mismatch' };
      for (const id of ['alpha', 'bravo']) {
        const team = state.teams[id]; if (!team || !SQUAD_ORDERS_V132.some(order => order.id === team.order)
          || team.marker && (!finite(team.marker.x) || !finite(team.marker.y) || team.marker.x < 0 || team.marker.y < 0)
          || team.order === 'move' && !team.marker) return { valid: false, reason: 'squad-state-invalid' };
      }
      if (Object.entries(state.holds).some(([id, point]) => !state.roster.map(squadMapKeyV132).includes(id) || !finite(point?.x) || !finite(point?.y) || point.x < 0 || point.y < 0)) return { valid: false, reason: 'squad-state-invalid' };
      const used = new Set(), source = id => id === 'player' ? raw.player : id === 'coop' ? raw.coop : list(raw.squad?.members).find(actor => `crew:${actor.crewId}` === id);
      if (state.tasks.length > 4 || state.carries.length > 2 || Object.values(state.telemetry).some(value => !finite(value) || value < 0 || value > 1e10)) return { valid: false, reason: 'squad-state-invalid' };
      for (const task of [...state.tasks, ...state.carries]) {
        const carrierId = task.actorId || task.carrierId, actor = source(carrierId), target = source(task.targetId);
        if (!known.has(carrierId) || !known.has(task.targetId) || carrierId === task.targetId || used.has(carrierId) || used.has(task.targetId)
          || !actor?.alive || actor.downed || !target?.downed || !(target.bleedOut > 0) || target.alive
          || task.helperId && (!known.has(task.helperId) || [carrierId, task.targetId].includes(task.helperId) || used.has(task.helperId) || !source(task.helperId)?.alive)) return { valid: false, reason: 'squad-reservation-invalid' };
        used.add(carrierId); used.add(task.targetId); if (task.helperId) used.add(task.helperId);
        const originalTarget = task.targetId.startsWith('crew:') && this.squadManifestV132.find(member => task.targetId === `crew:${member.id}`);
        if (originalTarget && !human(originalTarget)) return { valid: false, reason: 'squad-reservation-invalid' };
        if (task.carrierId) {
          if (!finite(task.dx) || !finite(task.dy) || Math.abs(task.dx) > 112 || Math.abs(task.dy) > 64
            || Math.abs(target.x - actor.x - task.dx) > 2 || Math.abs(target.y - actor.y - task.dy) > 2) return { valid: false, reason: 'squad-carry-invalid' };
        } else if (!['rescue', 'carry'].includes(task.kind) || !finite(task.elapsed) || !finite(task.duration)
          || task.duration !== (task.kind === 'rescue' ? 2.4 : 0.8) || task.elapsed < 0 || task.elapsed >= task.duration
          || !finite(task.x) || !finite(task.y) || !finite(task.damage)
          || Math.hypot(actor.x - task.x, actor.y - task.y) > 12) return { valid: false, reason: 'squad-reservation-invalid' };
        if (task.kind === 'rescue') {
          const issue = task.medicalSource;
          const owner = carrierId.startsWith('crew:') ? carrierId.slice(5) : carrierId === 'player'
            ? this.squadPlayerManifestIdV132 : this.coop?.operatorId || this.squadManifestV132[1]?.id;
          if (!issue || issue.kind === 'shared' && (carrierId.startsWith('crew:') || issue.ownerId !== 'inventory' || owner && buildCrewDeploymentV85(this.squadManifestV132.find(member => member.id === owner))?.personalEquipment || !(raw.inventory?.medkits > 0))) return { valid: false, reason: 'squad-medical-reservation-invalid' };
          if (issue.kind !== 'shared') {
            const member = this.squadManifestV132.find(member => member.id === owner), deployed = member && buildCrewDeploymentV85(member);
            const saved = carrierId === 'player' ? raw.squad?.playerV85?.crewRuntimeV85 : list(raw.squad?.members).find(actor => actor.crewId === owner);
            if (!member || issue.ownerId !== owner || !['personal', 'legacy-medical'].includes(issue.kind)) return { valid: false, reason: 'squad-medical-reservation-invalid' };
            if (issue.kind === 'personal' && (!deployed?.personalEquipment || !medicalItems({crewV85:deployed}).some(item => item.instanceId === issue.instanceId)
              || !((saved?.crewRuntimeV85 || saved)?.charges?.[issue.instanceId] > 0))) return { valid: false, reason: 'squad-medical-reservation-invalid' };
            if (issue.kind === 'legacy-medical' && (member.specialty !== 'medical' || deployed?.personalEquipment || !(saved?.supportCharges > 0))) return { valid: false, reason: 'squad-medical-reservation-invalid' };
          }
        }
      }
      return { valid: true };
    }
    applyResumeState(raw) {
      const validity = this.validateSquadResumeV132(raw);
      if (!validity.valid) return { applied: false, reason: validity.reason, squadRestoredV132: false };
      const result = super.applyResumeState(raw); if (!result?.applied) return result;
      if (this.squadDoctrineEnabledV132 && raw.squadDoctrineV132) {
        if (this.missionSquadConfiguredV85 === false) this.pendingSquadDoctrineV132 = clone(raw.squadDoctrineV132);
        else this.squadDoctrineV132 = clone(raw.squadDoctrineV132);
        this.syncSquadDoctrineActorsV132();
      } else if (this.squadDoctrineV132) this.squadDoctrineV132 = defaults(this.squadDoctrineIdentityV132, this.squadDoctrineV132.roster);
      return { ...result, squadRestoredV132: Boolean(raw?.squadDoctrineV132), squadMigratedV132: validity.migrated === true };
    }
  };
}
