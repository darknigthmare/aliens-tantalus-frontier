import { PLACEABLE_CATALOG_V86, PLACEABLE_EXTENSION_CATALOG_V132, getPlaceableDefinitionV86,
  validatePlaceablePlacementV86 } from './placeables-state-v86.js';
import { firstProjectileObstacleV83, sweepProjectileAabbV83, collectProjectileCollisionsV83 } from './projectile-collision-v83.js';
import { cancelTacticalReloadV77 } from './tactical-reload-v77.js';
import { resolveWeaponActionProfileV131 } from './weapon-actions-v131.js';

const list = value => Array.isArray(value) ? value : [];
const finite = value => typeof value === 'number' && Number.isFinite(value);
const number = value => finite(value) ? value : 0;
const actorId = actor => String(actor?.crewId || actor?.operatorId || (actor ? actor.coop ? 'coop' : 'player' : ''));
const center = box => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
const nearest = (point, box) => ({ x: Math.max(box.x, Math.min(box.x + box.w, point.x)), y: Math.max(box.y, Math.min(box.y + box.h, point.y)) });
const distance = (a, b) => { const p = center(a), q = center(b); return Math.hypot(p.x - q.x, p.y - q.y); };
const live = item => item && item.onGround === true && ['deployed', 'spent'].includes(item.status) && item.health > 0;
const gameplay = actor => !actor?.dormant && !actor?.ventTransit && (!actor?.rearEntryV130 || actor.rearEntryV130.phase === 'active')
  && ['gameplay', 'playable'].includes(actor?.planeV130 || actor?.plane || 'gameplay');
const admitted = new Map([...PLACEABLE_CATALOG_V86, ...PLACEABLE_EXTENSION_CATALOG_V132].map(item => [item.catalogId, item]));
const frozen = engine => !engine.running || engine.paused || engine.enemyAtlasLoadingPausedV65 || engine.userCasteLoadingV88 || engine.mission?.state !== 'active';
const family = kind => ({ sentry: 'T', 'cryo-trap': 'M', 'shock-trap': 'M', containment: 'B', jammer: 'S', 'ammo-cache': 'R', battery: 'R', beacon: 'U' }[kind]);
const obstacleWorld = engine => ({ walls: [...list(engine.walls), ...list(engine.covers).filter(item => !item.destroyed)], doors: engine.doors, platforms: engine.platforms, bounds: engine.missionLevelBounds });
const sameContact = (projectile, contact) => Math.abs(number(projectile.x) - contact.x) < 0.01 && Math.abs(number(projectile.y) - contact.y) < 0.01;

export const PLACEABLE_EXTENSION_RULES_V132 = Object.freeze({ schema: 132, pushStep: 24, handReach: 140, supplySeconds: 1.3, switchSeconds: 1.2,
  barrierStatus: 'project-functional-adaptation-of-portable-quarantine', artStatus: 'existing-eight-exact-tool-sheets-plus-original-barrier-frame-overlay' });

// Physical/resource values live in the authoritative V86 instances. This extra
// record certifies the admission policy, not a second bag or collision save.
export function validatePlaceablesExtensionStateV132(raw, instances = []) {
  return Boolean(raw && raw.schema === 132 && raw.admission === 'exact-personal-material'
    && Array.isArray(raw.instanceIds) && raw.instanceIds.length <= 64
    && new Set(raw.instanceIds).size === raw.instanceIds.length
    && raw.instanceIds.length === instances.length
    && raw.instanceIds.every(id => typeof id === 'string' && instances.some(item => item.instanceId === id)));
}

export function withPlaceablesExtensionV132(Base) {
  if (Base.placeablesExtensionV132 === true) return Base;
  return class PlaceablesExtensionV132 extends Base {
    static placeablesExtensionV132 = true;

    placeablesStateOptionsV86() { return { ...super.placeablesStateOptionsV86(), extensionV132: true }; }
    isPlaceableEquipmentAdmittedV86(id) { return admitted.has(id); }

    start(options = {}) {
      this.placeableExtensionTasksV132 = new Map();
      this.placeablesExtensionStartingV132 = true;
      this.pendingPlaceablesExtensionResumeV132 = null;
      const result = super.start(options);
      this.placeablesExtensionStartingV132 = false;
      const raw = this.pendingPlaceablesExtensionResumeV132 || (this.lastResumeResult?.applied === true ? options.resumeState : null);
      this.initializePlaceableOwnershipV132(raw);
      this.pendingPlaceablesExtensionResumeV132 = null;
      this.syncPlaceableBarriersV132();
      return { ...result, placeablesV86: this.getPlaceablesSnapshotV86(), placeablesExtensionV132: this.getPlaceablesExtensionSnapshotV132() };
    }

    initializePlaceableOwnershipV132(raw) {
      const actors = [this.player, this.coop, ...this.placeableActorsV86()].filter(Boolean), ids = new Set(actors.map(actor => this.placeableCarrierIdV132(actor)));
      const valid = validatePlaceablesExtensionStateV132(raw?.placeablesExtensionV132, list(this.placeablesV86?.instances));
      for (const instance of list(this.placeablesV86?.instances)) {
        // Old checkpoints have a single commander's bag. A missing/foreign
        // carrier never authorizes a second operator to draw from that bag.
        const legacyCarrier = actors.find(actor => actorId(actor) === instance.carrierCrewIdV132);
        instance.carrierCrewIdV132 = valid && ids.has(instance.carrierCrewIdV132) ? instance.carrierCrewIdV132
          : valid && legacyCarrier ? this.placeableCarrierIdV132(legacyCarrier) : 'player';
        if (!valid && raw?.placeablesExtensionV132) {
          instance.resourceRemainingV132 = 0;
          if (['ammo-cache', 'battery', 'beacon', 'jammer'].includes(instance.kind)) {
            instance.duration = 0; if (instance.status === 'deployed') instance.status = 'spent';
          }
        }
        if (raw?.placeablesV86 && live(instance)) {
          // A save cannot turn a dynamic object into a wall inside a door,
          // shaft, objective or person. The actual level certifies support.
          const check = side => this.validateBarrierPositionV132(instance, {
            x: side < 0 ? instance.x - 60 : instance.x + instance.w + 18, y: instance.y + instance.h - 92,
            w: 42, h: 92, alive: true, grounded: true
          });
          if (!check(-1).ok && !check(1).ok) { instance.health = 0; instance.status = 'destroyed'; instance.onGround = false; instance.armed = false; }
        }
      }
    }

    placeableCarrierIdV132(actor) { return actor === this.player ? 'player' : actor === this.coop ? 'coop' : actorId(actor); }
    canCarryPlaceableV86(instance, actor) { return instance?.carrierCrewIdV132 === this.placeableCarrierIdV132(actor); }
    refreshPlaceablePreviewV86(actor) {
      const preview = super.refreshPlaceablePreviewV86(actor), instance = preview && this.placeableInstanceV86(preview.instanceId);
      if (preview && instance) preview.modeV132 = instance.modeV132;
      return preview;
    }
    canCommitPlaceableSourceV86(instance, actor) {
      if (!this.canCarryPlaceableV86(instance, actor)) return false;
      if (instance.sourceUseRecorded) return true;
      const state = this.equipmentActions?.get(instance.catalogId), def = admitted.get(instance.catalogId);
      return Boolean(state && def && state.name === def.name && state.action === def.action && state.remaining >= 1);
    }
    onPlaceableCommittedV86(instance, actor, type, result) {
      super.onPlaceableCommittedV86(instance, actor, type, result);
      instance.carrierCrewIdV132 = this.placeableCarrierIdV132(actor);
      this.syncPlaceableBarriersV132();
    }

    getFieldEquipmentAvailabilityV124(id, actor = this.player) {
      if (!admitted.has(id)) return super.getFieldEquipmentAvailabilityV124(id, actor);
      const reserved = new Set([...this.placeablePreviewsV86?.values() || [], ...this.placeableTasksV86?.values() || []]
        .filter(item => item.actorCrewId !== actorId(actor)).map(item => item.instanceId));
      const available = list(this.placeablesV86?.instances).some(item => item.catalogId === id && item.status === 'carried'
        && this.canCarryPlaceableV86(item, actor) && !reserved.has(item.instanceId));
      return this.canManipulatePlaceableV86(actor) && actor.grounded === true && !this.isPlaceableBusyV86(actor) && available
        ? { ok: true, placeable: true } : { ok: false, code: available ? 'busy' : 'empty', message: available ? 'Rejoignez un sol stable et terminez votre action.' : 'Aucun exemplaire personnel transporté ; repliez un objet à portée.' };
    }

    isPlaceableBusyV86(actor) { return super.isPlaceableBusyV86(actor) || Boolean(this.placeableExtensionTasksV132?.has(actorId(actor))); }

    placeableWorldV86() { const world = super.placeableWorldV86(); return { ...world, actors: world.actors.filter(gameplay) }; }

    placeableWorldWithoutV132(instanceId) {
      const world = this.placeableWorldV86();
      return { ...world, walls: list(world.walls).filter(item => item.placeableInstanceIdV132 !== instanceId),
        placeables: list(world.placeables).filter(item => item.instanceId !== instanceId) };
    }

    validateBarrierPositionV132(instance, actor, x = instance.x, y = instance.y) {
      return validatePlaceablePlacementV86({ instance: { ...instance, status: 'carried' }, actor, x, y, facing: instance.facing,
        world: this.placeableWorldWithoutV132(instance.instanceId) });
    }

    beginPlaceableExtensionTaskV132(instanceId, type, actor = this.player, extra = {}) {
      const instance = this.placeableInstanceV86(instanceId), id = actorId(actor);
      if (frozen(this) || !this.canManipulatePlaceableV86(actor) || actor.grounded !== true || this.isPlaceableBusyV86(actor)
        || !live(instance) || distance(actor, instance) > 140 || !this.placeableLineClearV86(center(actor), center(instance), { ignoreInstanceId: instanceId })) return false;
      if ([...this.placeableTasksV86.values(), ...this.placeableExtensionTasksV132.values()].some(task => task.instanceId === instanceId)) return false;
      const task = { instanceId, catalogId: instance.catalogId, actorCrewId: id, type, ...extra, elapsed: 0,
        duration: ['supply', 'activate'].includes(type) ? 1.3 : 1.2, serial: ++this.placeableActionSerialV124,
        startedX: actor.x, startedY: actor.y, startedHealth: actor.health, startedArmor: actor.armor,
        objectX: instance.x, objectY: instance.y, x: instance.x, y: instance.y, w: instance.w, h: instance.h };
      this.placeablePreviewsV86.delete(id); this.placeableExtensionTasksV132.set(id, task);
      actor.placeableActionV124 = { kind: type, serial: task.serial, progress: 0, duration: task.duration, elapsed: 0 };
      cancelTacticalReloadV77(actor, 'placeable-manipulation'); actor.jumpBuffer = 0;
      this.onEvent?.({ type: 'placeable-task-started', action: type, instanceId, crewId: id, duration: task.duration, message: 'Manipulation en cours ; restez immobile.' });
      return true;
    }

    setPlaceableModeV132(instanceId, mode, actor = this.player) {
      const instance = this.placeableInstanceV86(instanceId);
      if (frozen(this) || !this.canManipulatePlaceableV86(actor) || actor.grounded !== true || this.isPlaceableBusyV86(actor)
        || instance?.kind !== 'containment' || !['containment', 'barrier'].includes(mode) || instance.health <= 0) return false;
      if (mode === 'containment' && !(instance.duration > 0)) return false;
      if (instance.status === 'carried') {
        if (!this.canCarryPlaceableV86(instance, actor)) return false;
        instance.modeV132 = mode; instance.lockedV132 = false; this.refreshPlaceablePreviewV86(actor); return true;
      }
      if (mode === 'barrier' && !this.validateBarrierPositionV132(instance, actor).ok) return false;
      return this.beginPlaceableExtensionTaskV132(instanceId, 'mode', actor, { mode });
    }

    togglePlaceableLockV132(instanceId, actor = this.player) {
      const instance = this.placeableInstanceV86(instanceId);
      return instance?.modeV132 === 'barrier' && this.beginPlaceableExtensionTaskV132(instanceId, 'lock', actor, { locked: !instance.lockedV132 });
    }

    pushPlaceableV132(instanceId, direction, actor = this.player) {
      const instance = this.placeableInstanceV86(instanceId);
      if (instance?.modeV132 !== 'barrier' || instance.lockedV132 || ![-1, 1].includes(direction)) return false;
      const x = instance.x + direction * PLACEABLE_EXTENSION_RULES_V132.pushStep;
      if (!this.validateBarrierPushV132(instance, actor, x).ok) return false;
      return this.beginPlaceableExtensionTaskV132(instanceId, 'push', actor, { nextX: x });
    }

    validateBarrierPushV132(instance, actor, x) {
      const result = this.validateBarrierPositionV132(instance, actor, x);
      if (!result.ok) return result;
      const swept = { x: Math.min(instance.x, x), y: instance.y, w: instance.w + Math.abs(x - instance.x), h: instance.h };
      const world = this.placeableWorldWithoutV132(instance.instanceId);
      const overlap = item => item && [item.x, item.y, item.w, item.h].every(finite) && swept.x < item.x + item.w && swept.x + swept.w > item.x && swept.y < item.y + item.h && swept.y + swept.h > item.y;
      if ([...list(world.actors), ...list(world.doors), ...list(world.walls), ...list(world.covers), ...list(world.ladders), ...list(world.vents), ...list(world.lifts), ...list(world.elevators), ...list(world.objectives), ...list(world.placeables)].some(overlap)) return { ok: false, reason: 'Trajet de poussée occupé ; repliez le barrage pour le transporter.' };
      return result;
    }

    useDeployedPlaceableV132(instanceId, actor = this.player) {
      const instance = this.placeableInstanceV86(instanceId);
      if (!this.canUseDeployedPlaceableV132(instanceId, actor)) return false;
      return this.beginPlaceableExtensionTaskV132(instanceId, instance.kind === 'beacon' ? 'activate' : 'supply', actor);
    }

    canUseDeployedPlaceableV132(instanceId, actor = this.player) {
      const instance = this.placeableInstanceV86(instanceId);
      if (frozen(this) || !this.canManipulatePlaceableV86(actor) || actor.grounded !== true || this.isPlaceableBusyV86(actor)
        || !live(instance) || distance(actor, instance) > 140 || !this.placeableLineClearV86(center(actor), center(instance), { ignoreInstanceId: instanceId })) return false;
      if (!live(instance) || !(instance.resourceRemainingV132 > 0)) return false;
      if (instance.kind === 'ammo-cache' && !(number(actor?.ammoReserve) < 99999)) return false;
      if (instance.kind === 'battery' && (!this.tracker || !(number(this.tracker.energy) < 100))) return false;
      if (!['ammo-cache', 'battery', 'beacon'].includes(instance.kind)) return false;
      return ![...this.placeableTasksV86.values(), ...this.placeableExtensionTasksV132.values()].some(task => task.instanceId === instanceId);
    }

    cancelPlaceableV86(actor = this.player, reason = 'user-cancelled') {
      const task = this.placeableExtensionTasksV132?.get(actorId(actor));
      if (!task) return super.cancelPlaceableV86(actor, reason);
      this.placeableExtensionTasksV132.delete(actorId(actor)); actor.placeableActionV124 = null;
      if (actor.interactionKind === 'ground-interact') { actor.interactionClock = 0; actor.actionClock = 0; }
      this.onEvent?.({ type: 'placeable-task-cancelled', action: task.type, instanceId: task.instanceId, crewId: actorId(actor), reason,
        message: 'Manipulation interrompue ; aucune ressource transférée.' });
      return true;
    }

    updatePlaceableExtensionTasksV132(delta) {
      for (const [id, task] of [...this.placeableExtensionTasksV132]) {
        const actor = this.placeableActorV86(id), instance = this.placeableInstanceV86(task.instanceId);
        const invalid = !actor || !live(instance) || !this.canManipulatePlaceableV86(actor) || actor.grounded !== true
          || actor.health < task.startedHealth || actor.armor < task.startedArmor
          || Math.hypot(actor.x - task.startedX, actor.y - task.startedY) > 12 || distance(actor, instance) > 140
          || instance.x !== task.objectX || instance.y !== task.objectY
          || !this.placeableLineClearV86(center(actor), center(instance), { ignoreInstanceId: instance.instanceId });
        if (invalid) { actor ? this.cancelPlaceableV86(actor, 'target-unavailable') : this.placeableExtensionTasksV132.delete(id); continue; }
        const placement = task.type === 'push' ? this.validateBarrierPushV132(instance, actor, task.nextX)
          : task.type === 'mode' && task.mode === 'barrier' ? this.validateBarrierPositionV132(instance, actor) : null;
        if (placement && !placement.ok || task.type === 'push' && instance.lockedV132 || task.type === 'mode' && task.mode === 'containment' && instance.duration <= 0) { this.cancelPlaceableV86(actor, 'placement-changed'); continue; }
        actor.vx = 0; task.elapsed = Math.min(task.duration, task.elapsed + Math.max(0, number(delta)));
        actor.placeableActionV124 = { kind: task.type, serial: task.serial, duration: task.duration, elapsed: task.elapsed, progress: task.elapsed / task.duration };
        this.setInteractionAnimation?.(actor, 'ground-interact', Math.max(0.1, task.duration - task.elapsed));
        if (task.elapsed + 1e-8 < task.duration) continue;
        let amount = 0;
        if (task.type === 'mode') { instance.modeV132 = task.mode; instance.lockedV132 = false; if (task.mode === 'barrier') instance.status = 'deployed'; }
        else if (task.type === 'lock') instance.lockedV132 = task.locked;
        else if (task.type === 'push') { instance.x = placement.x; instance.y = placement.y; instance.supportSurface = placement.supportSurface; }
        else if (instance.kind === 'ammo-cache') {
          amount = Math.min(Math.floor(instance.resourceRemainingV132), Math.max(0, 99999 - Math.floor(number(actor.ammoReserve))));
          instance.resourceRemainingV132 -= amount; actor.ammoReserve = Math.floor(number(actor.ammoReserve)) + amount;
        } else if (instance.kind === 'battery') {
          amount = Math.min(instance.resourceRemainingV132, Math.max(0, 100 - number(this.tracker?.energy)));
          if (this.tracker) { instance.resourceRemainingV132 -= amount; this.tracker.energy = number(this.tracker.energy) + amount; }
        } else if (instance.kind === 'beacon' && instance.resourceRemainingV132 >= 1) {
          // Mark the relay spent before setCheckpoint emits a save-capable event.
          amount = 1; instance.resourceRemainingV132 = 0; instance.status = 'spent';
        }
        if (['ammo-cache', 'battery', 'beacon'].includes(instance.kind) && instance.resourceRemainingV132 <= 0) instance.status = 'spent';
        this.placeableExtensionTasksV132.delete(id); actor.placeableActionV124 = null;
        if (actor.interactionKind === 'ground-interact') { actor.interactionClock = 0; actor.actionClock = 0; }
        this.syncPlaceableBarriersV132();
        if (instance.kind === 'beacon' && task.type === 'activate' && amount === 1) this.setCheckpoint(`beacon-${this.equipmentActions.get(instance.catalogId)?.uses || 1}`, actor.x, actor.y);
        this.onEvent?.({ type: 'placeable-manipulated', action: task.type, instanceId: instance.instanceId, crewId: id, amount,
          message: task.type === 'push' ? 'Barrage déplacé ; trajet et accès vérifiés.' : task.type === 'mode' ? (instance.modeV132 === 'barrier' ? 'Armature mobile : passage bloqué, repli possible à portée.' : 'Champ de confinement actif.') : task.type === 'lock' ? (instance.lockedV132 ? 'Barrage verrouillé.' : 'Barrage déverrouillé.') : 'Ressources transférées depuis cet objet.' });
      }
    }

    updateEquipmentDeployments(delta) {
      if (frozen(this)) return;
      this.syncPlaceableBarriersV132();
      super.updateEquipmentDeployments(delta);
      this.updatePlaceableExtensionTasksV132(delta);
      const folding = new Set([...this.placeableTasksV86.values()].filter(task => task.type === 'recover').map(task => task.instanceId));
      for (const instance of list(this.placeablesV86?.instances)) if (live(instance) && instance.kind === 'jammer' && instance.duration > 0 && !folding.has(instance.instanceId)) {
        instance.duration = Math.max(0, instance.duration - Math.max(0, number(delta)));
        for (const enemy of list(this.enemies)) if (enemy.alive && gameplay(enemy) && (enemy.biology === 'synthetic' || enemy.species === 'synthetic')
          && distance(instance, enemy) <= 400 && this.placeableLineClearV86(center(instance), center(enemy))) enemy.jammedClock = Math.max(number(enemy.jammedClock), 0.15);
        if (instance.duration <= 0) { instance.status = 'spent'; this.onEvent?.({ type: 'placeable-spent', instanceId: instance.instanceId, catalogId: instance.catalogId, message: 'Brouilleur épuisé ; batterie conservée vide au repli.' }); }
      }
      this.syncPlaceableBarriersV132();
    }

    syncPlaceableBarriersV132() {
      this.walls = list(this.walls).filter(item => !item.placeableBarrierV132);
      for (const instance of list(this.placeablesV86?.instances)) if (live(instance) && instance.modeV132 === 'barrier') this.walls.push({
        id: `placeable-wall:${instance.instanceId}`, placeableInstanceIdV132: instance.instanceId, placeableBarrierV132: true,
        x: instance.x, y: instance.y, w: instance.w, h: instance.h, solid: true, plane: 'gameplay', destroyed: false });
    }

    damagePlaceableV86(instanceId, amount, source = {}) {
      if (frozen(this) || !gameplay(source.owner || source)) return 0;
      const result = super.damagePlaceableV86(instanceId, amount, source);
      if (result > 0) {
        for (const task of [...this.placeableExtensionTasksV132?.values() || []]) if (task.instanceId === instanceId) {
          const actor = this.placeableActorV86(task.actorCrewId); if (actor) this.cancelPlaceableV86(actor, 'object-impact');
        }
        this.syncPlaceableBarriersV132();
      }
      return result;
    }

    damageDestructibleSceneryV130(id, amount, source = {}, contact = {}) {
      const barrier = list(this.walls).find(item => item.placeableBarrierV132 && item.id === id);
      return barrier ? this.damagePlaceableV86(barrier.placeableInstanceIdV132, amount, source)
        : super.damageDestructibleSceneryV130(id, amount, source, contact);
    }

    weaponContactTargetV130(actor, profile, aim) {
      const original = super.weaponContactTargetV130(actor, profile, aim), origin = this.weaponActionOriginV130(actor, aim);
      const target = list(this.walls).filter(item => item.placeableBarrierV132).map(wall => {
        const point = nearest(origin, wall), dx = point.x - origin.x, dy = point.y - origin.y, distance = Math.hypot(dx, dy);
        const contact = firstProjectileObstacleV83(origin, { x: dx + aim.x * .01, y: dy + aim.y * .01 }, obstacleWorld(this));
        return { enemy: wall, point, dx, dy, distance, contact };
      }).filter(item => item.distance <= profile.range && (!item.distance || (item.dx * aim.x + item.dy * aim.y) / item.distance >= .45)
        && item.contact?.target === item.enemy).sort((a, b) => a.distance - b.distance)[0];
      return target && (!original || target.distance < original.distance) ? target : original;
    }

    applyEnemyDamage(target, amount, source) {
      // The contact-action API uses the legacy name `enemy` for its target.
      // Route an authenticated physical wall here without putting it in the
      // enemy roster, assigning creature fields, or issuing kill rewards.
      if (target?.placeableBarrierV132 && list(this.walls).includes(target)) return this.damagePlaceableV86(target.placeableInstanceIdV132, amount, source);
      return super.applyEnemyDamage(target, amount, source);
    }

    projectBeamV131(actor, profile, muzzle, aim, damage) {
      if (frozen(this) || !gameplay(actor)) return;
      const angle = Math.atan2(aim.y, aim.x), barrel = { x: muzzle.pivotX, y: muzzle.pivotY, w: 1, h: 1 };
      const obstacle = firstProjectileObstacleV83(barrel, { x: muzzle.x - muzzle.pivotX, y: muzzle.y - muzzle.pivotY }, obstacleWorld(this));
      const origin = obstacle ? { x: obstacle.x + obstacle.normalX * .01, y: obstacle.y + obstacle.normalY * .01, w: 1, h: 1 }
        : { x: muzzle.x, y: muzzle.y, w: 1, h: 1 };
      const contacts = new Map(), rays = profile.kind === 'stream' ? [-profile.spread, -profile.spread / 2, 0, profile.spread / 2, profile.spread] : [0];
      for (const offset of rays) {
        const displacement = { x: Math.cos(angle + offset) * profile.range, y: Math.sin(angle + offset) * profile.range };
        const first = collectProjectileCollisionsV83(origin, displacement, { ...obstacleWorld(this), enemies: list(this.enemies).filter(enemy => enemy.alive && gameplay(enemy)) })[0];
        if (first?.target?.placeableBarrierV132) contacts.set(first.target.placeableInstanceIdV132, first);
      }
      const result = super.projectBeamV131(actor, profile, muzzle, aim, damage);
      for (const [id, contact] of contacts) this.damagePlaceableV86(id, damage, { owner: actor, kind: profile.kind, weaponId: profile.weaponId, x: contact.x, y: contact.y });
      return result;
    }

    advanceProjectileV131(projectile, delta) {
      const profile = resolveWeaponActionProfileV131(projectile.weaponId);
      if (frozen(this)) return;
      if (!profile || !gameplay(projectile.owner || projectile)) return super.advanceProjectileV131(projectile, delta);
      const step = Math.min(delta, projectile.remaining), displacement = { x: projectile.vx * step,
        y: projectile.vy * step + profile.gravity * step * step / 2 };
      const contact = firstProjectileObstacleV83(projectile, displacement, obstacleWorld(this));
      const result = super.advanceProjectileV131(projectile, delta);
      if (!['rocket', 'launcher'].includes(profile.kind) && contact?.target?.placeableBarrierV132 && projectile.resolved && sameContact(projectile, contact))
        this.damagePlaceableV86(contact.target.placeableInstanceIdV132, projectile.damage, projectile);
      return result;
    }

    advanceDiscV130(projectile, profile, delta) {
      if (frozen(this)) return;
      const wasReturning = projectile.returning || projectile.age >= profile.outwardTime;
      let vx = projectile.vx, vy = projectile.vy;
      if (wasReturning && projectile.owner?.alive) {
        const hand = center(projectile.owner), origin = center(projectile), distance = Math.hypot(hand.x - origin.x, hand.y - origin.y);
        if (distance > profile.returnSpeed * delta + projectile.owner.w / 2) { vx = (hand.x - origin.x) / distance * profile.returnSpeed; vy = (hand.y - origin.y) / distance * profile.returnSpeed; }
      }
      const contact = firstProjectileObstacleV83(projectile, { x: vx * delta, y: vy * delta }, obstacleWorld(this));
      const result = super.advanceDiscV130(projectile, profile, delta);
      if (contact?.target?.placeableBarrierV132 && Math.abs(projectile.x - contact.x) <= .011 && Math.abs(projectile.y - contact.y) <= .011)
        this.damagePlaceableV86(contact.target.placeableInstanceIdV132, projectile.damage, projectile);
      return result;
    }

    explodeGrenadeV130(projectile, profile) {
      if (frozen(this) || projectile.resolved) return false;
      const origin = { ...center(projectile), w: 0, h: 0 };
      // Capture barrier exposure before any object is destroyed by this blast.
      const hits = list(this.walls).filter(item => item.placeableBarrierV132).map(wall => {
        const point = nearest(origin, wall), motion = { x: point.x - origin.x, y: point.y - origin.y };
        const distance = Math.hypot(motion.x, motion.y), obstruction = firstProjectileObstacleV83(origin, motion, obstacleWorld(this));
        return { wall, damage: distance < profile.radius && (!obstruction || obstruction.target === wall)
          ? projectile.damage * (1 - .65 * distance / profile.radius) : 0 };
      });
      const result = super.explodeGrenadeV130(projectile, profile);
      if (result) for (const { wall, damage } of hits) if (damage > 0) this.damagePlaceableV86(wall.placeableInstanceIdV132, damage, projectile);
      return result;
    }

    resolveHorizontal(entity, previousX) {
      const result = super.resolveHorizontal(entity, previousX);
      if (!entity || !gameplay(entity) || !finite(previousX)) return result;
      const previous = { x: previousX, y: entity.y, w: entity.w, h: entity.h }, motion = { x: entity.x - previousX, y: 0 };
      const hit = list(this.walls).filter(item => item.placeableBarrierV132).map(item => sweepProjectileAabbV83(previous, motion, item))
        .filter(Boolean).sort((a, b) => a.t - b.t)[0];
      if (hit) { entity.x = hit.x; entity.vx = 0; }
      return result;
    }

    resolveVertical(entity, previousBottom) {
      const result = super.resolveVertical(entity, previousBottom);
      if (!entity || !gameplay(entity) || !finite(previousBottom)) return result;
      for (const wall of list(this.walls).filter(item => item.placeableBarrierV132)) {
        if (entity.x + entity.w <= wall.x || entity.x >= wall.x + wall.w) continue;
        if (entity.vy >= 0 && previousBottom <= wall.y + 1 && entity.y + entity.h >= wall.y) {
          entity.y = wall.y - entity.h; entity.vy = 0; entity.grounded = true;
        } else if (entity.vy < 0 && previousBottom - entity.h >= wall.y + wall.h - 1 && entity.y < wall.y + wall.h) {
          entity.y = wall.y + wall.h; entity.vy = 0;
        }
      }
      return result;
    }

    performContextualMelee(actor = this.player) {
      if (frozen(this) || !actor?.alive || actor.downed || !gameplay(actor) || actor.inVehicle || actor.reloading || actor.meleeClock > 0 || this.isPlaceableBusyV86(actor)) return false;
      const origin = center(actor), facing = actor.facing < 0 ? -1 : 1;
      const candidates = list(this.walls).filter(item => item.placeableBarrierV132).map(wall => {
        const point = { x: Math.max(wall.x, Math.min(wall.x + wall.w, origin.x)), y: Math.max(wall.y, Math.min(wall.y + wall.h, origin.y)) };
        const dx = point.x - origin.x, dy = point.y - origin.y;
        const contact = firstProjectileObstacleV83({ ...origin, w: 0, h: 0 }, { x: dx + facing * 0.01, y: dy }, obstacleWorld(this));
        return { wall, point, dx, dy, distance: Math.hypot(dx, dy), contact };
      }).filter(item => item.dx * facing >= 0 && item.distance <= actor.w / 2 + 92 && Math.abs(item.dy) <= 48 && item.contact?.target === item.wall)
        .sort((a, b) => a.distance - b.distance);
      const target = candidates[0];
      if (!target || list(this.enemies).some(enemy => enemy.alive && gameplay(enemy) && distance(actor, enemy) < target.distance && this.enemyMeleePathClearV64(actor, enemy))) return super.performContextualMelee(actor);
      actor.meleeKind = actor.weaponMode === 'rifle' ? 'rifle-bash' : 'knife-attack';
      actor.meleeClock = actor.meleeKind === 'rifle-bash' ? 0.48 : 0.42; actor.fireClock = actor.meleeClock; actor.actionClock = actor.meleeClock;
      const damage = actor.meleeKind === 'rifle-bash' ? 34 : 22;
      this.damagePlaceableV86(target.wall.placeableInstanceIdV132, damage, { owner: actor, kind: actor.meleeKind });
      this.onEvent?.({ type: 'melee', attack: actor.meleeKind, target: target.wall.placeableInstanceIdV132, damage, placeableV132: true });
      return true;
    }

    updateBullets(delta) {
      if (frozen(this)) return;
      this.syncPlaceableBarriersV132();
      const contacts = list(this.bullets).filter(item => !item.hit && item.life > 0 && gameplay(item.owner || item)).flatMap(bullet => {
        const dt = Math.min(Math.max(0, number(delta)), bullet.life), motion = { x: number(bullet.vx) * dt, y: number(bullet.vy) * dt };
        const contact = firstProjectileObstacleV83(bullet, motion, obstacleWorld(this));
        return contact?.target?.placeableBarrierV132 ? [{ bullet, contact }] : [];
      });
      const result = super.updateBullets(delta);
      for (const { bullet, contact } of contacts) if (bullet.hit && sameContact(bullet, contact)) this.damagePlaceableV86(contact.target.placeableInstanceIdV132, number(bullet.damage), bullet);
      return result;
    }

    updateHostileProjectiles(delta) {
      if (frozen(this)) return;
      this.syncPlaceableBarriersV132();
      for (const projectile of list(this.hostileProjectiles)) {
        if (projectile.hit || !(projectile.life > 0) || !gameplay(projectile)) continue;
        const dt = Math.min(Math.max(0, number(delta)), projectile.life), motion = { x: number(projectile.vx) * dt, y: number(projectile.vy) * dt };
        const contact = firstProjectileObstacleV83(projectile, motion, obstacleWorld(this));
        if (!contact?.target?.placeableBarrierV132) continue;
        const prior = [...this.placeableActorsV86().filter(actor => !actor.inVehicle && gameplay(actor)),
          ...list(this.placeablesV86?.instances).filter(item => live(item) && item.instanceId !== contact.target.placeableInstanceIdV132),
          ...(this.vehicle?.occupied && !this.vehicle.destroyed ? [this.vehicle] : [])]
          .some(item => { const hit = sweepProjectileAabbV83(projectile, motion, item); return hit && hit.t < contact.t - 1e-8; });
        if (prior) continue;
        projectile.hit = true; projectile.x = contact.x; projectile.y = contact.y;
        this.damagePlaceableV86(contact.target.placeableInstanceIdV132, number(projectile.damage), projectile);
        this.spawnImpact?.(contact.x, contact.y, projectile.acid ? '#a7c742' : '#e3b86c');
      }
      this.hostileProjectiles = list(this.hostileProjectiles).filter(projectile => !projectile.hit);
      return super.updateHostileProjectiles(delta);
    }

    updateEnemy(enemy, delta) {
      if (frozen(this)) return;
      if (enemy?.alive && gameplay(enemy) && this.updateEnemyPlaceableAttackV86(enemy, delta, item => item?.modeV132 === 'barrier')) return;
      const previous = enemy && { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
      const result = super.updateEnemy(enemy, delta);
      if (!previous || !enemy.alive || !gameplay(enemy)) return result;
      const motion = { x: enemy.x - previous.x, y: enemy.y - previous.y };
      const hits = list(this.placeablesV86?.instances).filter(item => live(item) && item.armed && ['cryo-trap', 'shock-trap'].includes(item.kind))
        .map(instance => ({ instance, contact: sweepProjectileAabbV83(previous, motion, instance) })).filter(item => item.contact).sort((a, b) => a.contact.t - b.contact.t);
      for (const { instance, contact } of hits) {
        const blocked = firstProjectileObstacleV83(previous, motion, obstacleWorld(this));
        if (blocked && blocked.t <= contact.t + 1e-8 || !this.placeableLineClearV86(center(instance), { x: contact.x + enemy.w / 2, y: contact.y + enemy.h / 2 })) continue;
        // Commit the trigger before damage/events can capture a checkpoint.
        instance.armed = false; instance.status = 'spent';
        if (instance.damage > 0) this.applyEnemyDamage(enemy, instance.damage, { kind: instance.kind, ownerCrewId: instance.ownerCrewId, owner: this.placeableActorV86(instance.ownerCrewId) });
        enemy.supportSlowFactorV72 = instance.kind === 'cryo-trap' ? 0.38 : 0.65;
        enemy.supportSlowClockV72 = Math.max(number(enemy.supportSlowClockV72), instance.kind === 'cryo-trap' ? 6 : 3);
        enemy.staggerClock = Math.max(number(enemy.staggerClock), 1.5);
        this.onEvent?.({ type: 'placeable-spent', instanceId: instance.instanceId, targetId: enemy.id, catalogId: instance.catalogId, message: 'Mine déclenchée sur le trajet réel ; aucune réactivation au repli.' });
        if (!enemy.alive) break;
      }
      return result;
    }

    restorePlaceablesAfterSupportV86(raw) {
      const result = super.restorePlaceablesAfterSupportV86(raw);
      this.placeableExtensionTasksV132?.clear();
      if (this.placeablesExtensionStartingV132) this.pendingPlaceablesExtensionResumeV132 = raw;
      else { this.initializePlaceableOwnershipV132(raw); this.syncPlaceableBarriersV132(); }
      return result;
    }

    restartFromCheckpoint(...args) {
      if (this.mission?.state === 'failed') {
        for (const actor of [this.player, this.coop, ...this.placeableActorsV86()].filter(Boolean)) this.cancelPlaceableV86(actor, 'checkpoint-restart');
        this.placeableExtensionTasksV132?.clear(); this.placeableTasksV86?.clear(); this.placeablePreviewsV86?.clear(); this.placeableAttackTasksV86?.clear();
      }
      const result = super.restartFromCheckpoint(...args); this.syncPlaceableBarriersV132(); return result;
    }

    stop(...args) {
      for (const actor of [this.player, this.coop, ...this.placeableActorsV86()].filter(Boolean)) this.cancelPlaceableV86(actor, 'runtime-stopped');
      this.placeableExtensionTasksV132?.clear(); return super.stop(...args);
    }

    captureResumeState() {
      const raw = super.captureResumeState();
      return { ...raw, placeablesExtensionV132: { schema: 132, admission: 'exact-personal-material', instanceIds: list(raw.placeablesV86?.instances).map(item => item.instanceId) } };
    }

    getPlaceablesSnapshotV86() {
      const snapshot = super.getPlaceablesSnapshotV86();
      return { ...snapshot, extensionV132: true, tasks: [...snapshot.tasks, ...this.placeableExtensionTasksV132?.values() || []].map(item => ({ ...item })),
        instances: snapshot.instances.map(item => ({ ...item, familyV132: family(item.kind) })) };
    }

    getPlaceablesExtensionSnapshotV132() {
      const instances = list(this.placeablesV86?.instances), counts = Object.fromEntries(['T', 'M', 'B', 'S', 'R', 'U'].map(id => [id, instances.filter(item => family(item.kind) === id).length]));
      return { schema: 132, ready: Boolean(this.placeablesV86), counts, admittedCatalogs: admitted.size, rules: PLACEABLE_EXTENSION_RULES_V132,
        artRemaining: 'Orthographic deployment, transport, destruction animations and the full historical 40-item range remain unproduced.' };
    }

    getSnapshot() { return { ...super.getSnapshot(), placeablesExtensionV132: this.getPlaceablesExtensionSnapshotV132() }; }
    drawWall(ctx, wall) { if (!wall.placeableBarrierV132) return super.drawWall(ctx, wall); }
    drawWorld(ctx) {
      super.drawWorld(ctx);
      ctx.save();
      for (const instance of list(this.placeablesV86?.instances)) if (live(instance) && instance.modeV132 === 'barrier') {
        // Dedicated mechanical overlay, explicitly an original adaptation of
        // this exact quarantine frame; no borrowed turret/barricade identity.
        ctx.fillStyle = '#24322f'; ctx.fillRect(instance.x + 3, instance.y + 18, instance.w - 6, instance.h - 21);
        ctx.strokeStyle = instance.lockedV132 ? '#eac575' : '#91b8aa'; ctx.lineWidth = 3;
        ctx.strokeRect(instance.x + 2, instance.y + 16, instance.w - 4, instance.h - 19);
        ctx.beginPath(); ctx.moveTo(instance.x + 6, instance.y + 22); ctx.lineTo(instance.x + instance.w - 6, instance.y + instance.h - 6);
        ctx.moveTo(instance.x + instance.w - 6, instance.y + 22); ctx.lineTo(instance.x + 6, instance.y + instance.h - 6); ctx.stroke();
      }
      for (const task of this.placeableExtensionTasksV132?.values() || []) {
        const instance = this.placeableInstanceV86(task.instanceId); if (!instance) continue;
        const x = instance.x + instance.w / 2, progress = Math.max(0, Math.min(1, task.elapsed / task.duration));
        ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#c5ded0';
        ctx.fillText(`${({ mode: 'ARMATURE', push: 'POUSSÉE', lock: 'VERROU', supply: 'TRANSFERT', activate: 'RELAIS' }[task.type] || 'ACTION')} ${Math.round(progress * 100)} %`, x, instance.y - 12);
        ctx.fillStyle = '#263b32'; ctx.fillRect(x - 28, instance.y - 7, 56, 4); ctx.fillStyle = '#a3d5b1'; ctx.fillRect(x - 28, instance.y - 7, 56 * progress, 4);
      }
      ctx.restore();
    }
  };
}
