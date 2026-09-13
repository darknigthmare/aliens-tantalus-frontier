import { createPlaceablesStateV86, restorePlaceablesStateV86, capturePlaceablesStateV86,
  validatePlaceablePlacementV86, deployPlaceableV86, recoverPlaceableV86 as recoverInstanceV86,
  isPlaceableEquipmentV86, getPlaceableDefinitionV86 } from './placeables-state-v86.js';
import { drawPlaceablesV86 } from './placeables-visual-v86.js';
import { sweepProjectileAabbV83, firstProjectileObstacleV83 } from './projectile-collision-v83.js';
import { cancelTacticalReloadV77 } from './tactical-reload-v77.js';

const list = value => Array.isArray(value) ? value : [];
const actorId = actor => String(actor?.crewId || actor?.operatorId || '');
const center = box => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
const overlaps = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const distance = (a, b) => { const p = center(a), q = center(b); return Math.hypot(p.x - q.x, p.y - q.y); };
const live = item => item && item.onGround === true && (item.status === 'deployed' || item.status === 'spent') && item.health > 0;
// Explicit four existing catalogue families. This is not a barricade or a UA571-C art claim.
const knownCatalog = id => isPlaceableEquipmentV86(id);
const movementRequested = (engine, actor, controls = {}) => [controls.left, controls.right, controls.up, controls.down, controls.jump,
  ...(actor?.coop ? ['KeyJ', 'KeyL', 'KeyI', 'KeyK', 'KeyU'] : ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])]
  .filter(Boolean).some(key => engine.keys?.has(key));

export const PLACEABLE_TASK_SECONDS_V86 = Object.freeze({ deploy: 2.5, recover: 2 });
export const PLACEABLE_SENTRY_RUNTIME_V86 = Object.freeze({ range: 620, halfAngleRadians: Math.PI / 3, interval: 0.2 });

export function withPlaceablesRuntimeV86(Base) {
  return class PlaceablesRuntimeV86 extends Base {
    start(options = {}) {
      this.placeablesStartingV86 = true;
      this.placeablesV86 = null;
      this.pendingPlaceablesResumeV86 = null;
      this.placeablePreviewsV86 = new Map();
      this.placeableTasksV86 = new Map();
      this.placeableAttackTasksV86 = new Map();
      const result = super.start(options);
      const migration = { legacyDeployables: list(this.supportDeployments), legacyV72: options.resumeState?.gameplaySupportV72,
        bounds: this.missionLevelBounds };
      const raw = this.pendingPlaceablesResumeV86;
      this.placeablesV86 = raw
        ? restorePlaceablesStateV86(raw, this.equipmentActions, migration)
        : createPlaceablesStateV86(this.equipmentActions, migration);
      this.placeablesStartingV86 = false;
      this.pendingPlaceablesResumeV86 = null;
      this.removeLegacyPlaceableProjectionsV86();
      return { ...result, placeablesV86: this.getPlaceablesSnapshotV86() };
    }

    removeLegacyPlaceableProjectionsV86() {
      this.supportDeployments = list(this.supportDeployments).filter(item => !knownCatalog(String(item.id || '').split(':')[0]));
    }

    placeableActorsV86() {
      return [this.player, this.coopEnabled ? this.coop : null, ...(this.activeSquadActors?.() || [])].filter(actor => actor?.alive);
    }

    placeableActorV86(id) { return this.placeableActorsV86().find(actor => actorId(actor) === id) || null; }
    placeableInstanceV86(id) { return this.placeablesV86?.instances?.find(item => item.instanceId === id) || null; }
    isPlaceableBusyV86(actor) { return Boolean(this.placeableTasksV86?.has(actorId(actor))); }

    placeableWorldV86() {
      return { platforms: list(this.platforms), walls: list(this.walls).filter(item => !item.destroyed),
        covers: list(this.covers).filter(item => !item.destroyed), doors: list(this.doors),
        actors: [...this.placeableActorsV86(), ...list(this.enemies).filter(enemy => enemy.alive && !enemy.ventTransit),
          ...(this.vehicle?.active && !this.vehicle.destroyed ? [this.vehicle] : [])],
        placeables: list(this.placeablesV86?.instances).filter(live), bounds: this.missionLevelBounds || { width: 6200, height: 1080 },
        // Runtime ladders store centreX/top/bottom; reserve the full shaft of a moving lift, not just its current deck.
        ladders: list(this.ladders).map(item => Number.isFinite(item.top) && Number.isFinite(item.bottom)
          ? { ...item, x: item.x - (item.w || 42) / 2, y: item.top, w: item.w || 42, h: item.bottom - item.top + 22 } : item),
        vents: list(this.vents), lifts: list(this.lifts).map(item => {
          const top = Math.min(item.y, Number.isFinite(item.topY) ? item.topY : item.y);
          const bottom = Math.max(item.y, Number.isFinite(item.baseY) ? item.baseY : item.y) + item.h;
          return { ...item, y: top, h: bottom - top };
        }), elevators: list(this.elevators),
        objectives: [this.objective, this.powerNode, this.archiveTerminal].filter(Boolean) };
    }

    canManipulatePlaceableV86(actor) {
      return Boolean(this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && this.mission?.state === 'active'
        && actor?.alive && !actor.downed && !actor.inVehicle && !actor.ventTransit && !actor.climbing
        && !(actor.hazardKind === 'electrical' && actor.hazardClock > 0) && !(actor.grappledClock > 0)
        && actorId(actor) && (actor !== this.coop || this.coopEnabled));
    }

    useEquipment(catalogId, actor = this.player) {
      if (!knownCatalog(catalogId)) return super.useEquipment(catalogId, actor);
      if (!this.canManipulatePlaceableV86(actor) || this.isPlaceableBusyV86(actor)) return false;
      const reserved = new Set([...this.placeablePreviewsV86.values(), ...this.placeableTasksV86.values()].map(item => item.instanceId));
      const existing = this.placeablePreviewsV86.get(actorId(actor));
      const instance = this.placeablesV86?.instances.find(item => item.catalogId === catalogId && item.status === 'carried'
        && (!reserved.has(item.instanceId) || item.instanceId === existing?.instanceId));
      if (!instance) return false;
      this.placeablePreviewsV86.set(actorId(actor), { instanceId: instance.instanceId, actorCrewId: actorId(actor), catalogId, kind: instance.kind });
      this.refreshPlaceablePreviewV86(actor);
      this.onEvent?.({ type: 'placeable-preview', catalogId, instanceId: instance.instanceId, crewId: actorId(actor), message: 'Aperçu de pose : confirmer sur un sol dégagé.' });
      return true;
    }

    refreshPlaceablePreviewV86(actor) {
      const preview = this.placeablePreviewsV86?.get(actorId(actor));
      const instance = preview && this.placeableInstanceV86(preview.instanceId);
      if (!instance || instance.status !== 'carried') return null;
      const facing = actor.facing < 0 ? -1 : 1;
      const x = facing > 0 ? actor.x + actor.w + 18 : actor.x - instance.w - 18;
      const y = actor.y + actor.h - instance.h;
      const placement = validatePlaceablePlacementV86({ instance, actor, x, y, facing, world: this.placeableWorldV86() });
      Object.assign(preview, placement, { x: placement.x ?? x, y: placement.y ?? y, w: instance.w, h: instance.h, facing,
        valid: placement.ok, range: instance.kind === 'sentry' ? PLACEABLE_SENTRY_RUNTIME_V86.range : 0,
        halfAngleRadians: instance.kind === 'sentry' ? PLACEABLE_SENTRY_RUNTIME_V86.halfAngleRadians : 0,
        muzzleX: x + instance.w * (facing < 0 ? 0.12 : 0.88), muzzleY: y + instance.h * 0.24 });
      return preview;
    }

    confirmPlaceableV86(actor = this.player) {
      if (!this.canManipulatePlaceableV86(actor) || this.isPlaceableBusyV86(actor)) return false;
      const preview = this.refreshPlaceablePreviewV86(actor);
      if (!preview?.valid) return false;
      const instance = this.placeableInstanceV86(preview.instanceId);
      if (!instance || instance.status !== 'carried') return false;
      const task = { ...preview, type: 'deploy', elapsed: 0, duration: getPlaceableDefinitionV86(instance.catalogId).installSeconds,
        actorCrewId: actorId(actor), startedX: actor.x, startedY: actor.y, startedHealth: actor.health, startedArmor: actor.armor };
      this.placeableTasksV86.set(actorId(actor), task);
      this.placeablePreviewsV86.delete(actorId(actor));
      cancelTacticalReloadV77(actor, 'placeable-deploy'); actor.jumpBuffer = 0;
      this.onEvent?.({ type: 'placeable-task-started', action: 'deploy', instanceId: instance.instanceId, catalogId: instance.catalogId, crewId: actorId(actor), duration: task.duration, message: 'Installation en cours ; mouvement ou impact interrompent la pose.' });
      return true;
    }

    cancelPlaceableV86(actor = this.player, reason = 'user-cancelled') {
      const id = actorId(actor), task = this.placeableTasksV86?.get(id), preview = this.placeablePreviewsV86?.get(id);
      if (!task && !preview) return false;
      this.placeableTasksV86.delete(id); this.placeablePreviewsV86.delete(id);
      if (actor?.interactionKind === 'ground-interact') { actor.interactionClock = 0; actor.actionClock = 0; }
      this.onEvent?.({ type: 'placeable-task-cancelled', action: task?.type || 'preview', instanceId: task?.instanceId || preview?.instanceId, crewId: id, reason, message: 'Manipulation interrompue ; matériel conservé dans son état actuel.' });
      return true;
    }

    recoverPlaceableV86(instanceId, actor = this.player) {
      const instance = this.placeableInstanceV86(instanceId);
      if (!this.canManipulatePlaceableV86(actor) || this.isPlaceableBusyV86(actor) || !live(instance) || distance(actor, instance) > 140) return false;
      if ([...this.placeableTasksV86.values()].some(task => task.instanceId === instanceId)) return false;
      if (!this.placeableLineClearV86(center(actor), center(instance))) return false;
      this.placeablePreviewsV86.delete(actorId(actor));
      this.placeableTasksV86.set(actorId(actor), { instanceId, catalogId: instance.catalogId, kind: instance.kind, type: 'recover',
        actorCrewId: actorId(actor), elapsed: 0, duration: getPlaceableDefinitionV86(instance.catalogId).foldSeconds, x: instance.x, y: instance.y,
        w: instance.w, h: instance.h, facing: instance.facing, startedX: actor.x, startedY: actor.y, startedHealth: actor.health, startedArmor: actor.armor });
      cancelTacticalReloadV77(actor, 'placeable-recover'); actor.jumpBuffer = 0;
      this.onEvent?.({ type: 'placeable-task-started', action: 'recover', instanceId, catalogId: instance.catalogId, crewId: actorId(actor), duration: getPlaceableDefinitionV86(instance.catalogId).foldSeconds, message: 'Repli en cours ; munitions et dégâts restent attachés à cet objet.' });
      return true;
    }

    updatePlayer(actor, delta, controls) {
      if (this.isPlaceableBusyV86(actor)) {
        if (movementRequested(this, actor, controls)) this.cancelPlaceableV86(actor, 'movement');
        else { actor.vx = 0; return super.updatePlayer(actor, delta, {}); }
      }
      return super.updatePlayer(actor, delta, controls);
    }

    updatePlaceableTasksV86(delta) {
      for (const id of [...this.placeablePreviewsV86.keys()]) {
        const actor = this.placeableActorV86(id);
        if (!actor || actor.inVehicle || actor.downed) { this.placeablePreviewsV86.delete(id); continue; }
        this.refreshPlaceablePreviewV86(actor);
      }
      for (const [id, task] of [...this.placeableTasksV86]) {
        const actor = this.placeableActorV86(id), instance = this.placeableInstanceV86(task.instanceId);
        const cancel = reason => actor ? this.cancelPlaceableV86(actor, reason) : this.placeableTasksV86.delete(id);
        if (!actor || !instance || actor.inVehicle || actor.ventTransit || actor.downed || actor.climbing
          || actor.hazardKind === 'electrical' && actor.hazardClock > 0 || actor.grappledClock > 0) { cancel('actor-unavailable'); continue; }
        if (actor.health < task.startedHealth || actor.armor < task.startedArmor) { cancel('impact'); continue; }
        if (Math.hypot(actor.x - task.startedX, actor.y - task.startedY) > 12) { cancel('movement'); continue; }
        const placement = task.type === 'deploy'
          ? validatePlaceablePlacementV86({ instance, actor, x: task.x, y: task.y, facing: task.facing, world: this.placeableWorldV86() }) : null;
        if (task.type === 'deploy' ? !placement.ok : !live(instance) || distance(actor, instance) > 140 || !this.placeableLineClearV86(center(actor), center(instance))) { cancel(placement?.reason || 'target-unavailable'); continue; }
        actor.vx = 0;
        task.elapsed = Math.min(task.duration, task.elapsed + Math.max(0, delta));
        this.setInteractionAnimation?.(actor, 'ground-interact', Math.max(0.1, task.duration - task.elapsed));
        if (task.elapsed + 1e-8 < task.duration) continue;
        const result = task.type === 'deploy' ? deployPlaceableV86(this.placeablesV86, task.instanceId, placement, { ownerCrewId: id })
          : recoverInstanceV86(this.placeablesV86, task.instanceId);
        this.placeableTasksV86.delete(id);
        if (!result.ok) { this.onEvent?.({ type: 'placeable-task-cancelled', instanceId: task.instanceId, crewId: id, reason: result.reason, message: result.reason }); continue; }
        if (result.firstDeployment) {
          const equipment = this.equipmentActions.get(instance.catalogId);
          if (equipment) { equipment.remaining = Math.max(0, equipment.remaining - 1); equipment.uses += 1; }
        }
        this.onEvent?.({ type: task.type === 'deploy' ? 'placeable-deployed' : 'placeable-recovered', instanceId: task.instanceId,
          catalogId: instance.catalogId, crewId: id, health: instance.health, ammo: instance.ammo,
          message: task.type === 'deploy' ? `${instance.name} installé.` : `${instance.name} récupéré sans réparation ni recharge.` });
      }
    }

    updateEquipmentDeployments(delta) {
      this.removeLegacyPlaceableProjectionsV86();
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.mission?.state !== 'active') return;
      super.updateEquipmentDeployments(delta);
      if (!this.placeablesV86) return;
      this.updatePlaceableTasksV86(delta);
      for (const instance of this.placeablesV86.instances) {
        if (!live(instance)) continue;
        instance.firingClockV86 = Math.max(0, (instance.firingClockV86 || 0) - delta);
        if (instance.kind === 'sentry') this.updatePlaceableSentryV86(instance, delta);
        else if (instance.kind === 'containment') {
          if (instance.status === 'spent') continue;
          instance.duration = Math.max(0, (instance.duration || 0) - delta);
          for (const enemy of list(this.enemies).filter(enemy => enemy.alive && overlaps(enemy, instance))) {
            enemy.supportSlowFactorV72 = Math.min(enemy.supportSlowClockV72 > 0 ? enemy.supportSlowFactorV72 || 1 : 1, 0.45);
            enemy.supportSlowClockV72 = Math.max(enemy.supportSlowClockV72 || 0, 0.12);
          }
          if (instance.duration <= 0) { instance.status = 'spent'; this.onEvent?.({ type: 'placeable-spent', instanceId: instance.instanceId, catalogId: instance.catalogId, message: `${instance.name} épuisé ; le boîtier reste au sol.` }); }
        } else if (instance.armed && instance.status !== 'spent') {
          const enemy = list(this.enemies).find(enemy => enemy.alive && !enemy.dormant && !enemy.ventTransit && overlaps(enemy, instance));
          if (!enemy) continue;
          if (instance.damage > 0) this.applyEnemyDamage(enemy, instance.damage, { owner: this.placeableActorV86(instance.ownerCrewId), ownerCrewId: instance.ownerCrewId, kind: instance.kind });
          enemy.supportSlowFactorV72 = Math.min(enemy.supportSlowClockV72 > 0 ? enemy.supportSlowFactorV72 || 1 : 1, instance.kind === 'cryo-trap' ? 0.38 : 0.65);
          enemy.supportSlowClockV72 = Math.max(enemy.supportSlowClockV72 || 0, instance.kind === 'cryo-trap' ? 6 : 3);
          enemy.staggerClock = Math.max(enemy.staggerClock || 0, 1.5);
          instance.armed = false; instance.status = 'spent';
          this.onEvent?.({ type: 'placeable-spent', instanceId: instance.instanceId, catalogId: instance.catalogId, targetId: enemy.id, message: `${instance.name} déclenché ; aucune recharge automatique.` });
        }
      }
    }

    placeableLineClearV86(from, to) {
      return !firstProjectileObstacleV83({ ...from, w: 0, h: 0 }, { x: to.x - from.x, y: to.y - from.y }, {
        // A one-way walking platform remains opaque for targeting and hand reach from either side.
        walls: [...list(this.walls), ...list(this.covers), ...list(this.platforms)].filter(item => !item.destroyed),
        doors: list(this.doors), platforms: [] });
    }

    updatePlaceableSentryV86(instance, delta) {
      instance.cooldown = instance.cooldown > 0 ? instance.cooldown - Math.max(0, delta) : 0;
      if (!(instance.ammo > 0) || instance.cooldown > 1e-8) { instance.cooldown = Math.max(0, instance.cooldown); return; }
      const muzzle = { x: instance.x + instance.w * (instance.facing < 0 ? 0.12 : 0.88), y: instance.y + instance.h * 0.24 };
      const target = list(this.enemies).filter(enemy => enemy.alive && !enemy.dormant && !enemy.ventTransit).map(enemy => {
        const point = center(enemy), dx = point.x - muzzle.x, dy = point.y - muzzle.y;
        const angle = Math.atan2(dy, dx), offset = Math.atan2(Math.sin(angle - (instance.facing < 0 ? Math.PI : 0)), Math.cos(angle - (instance.facing < 0 ? Math.PI : 0)));
        return { enemy, point, angle, offset, distance: Math.hypot(dx, dy) };
      }).filter(item => item.distance <= PLACEABLE_SENTRY_RUNTIME_V86.range && Math.abs(item.offset) <= PLACEABLE_SENTRY_RUNTIME_V86.halfAngleRadians
        && this.placeableLineClearV86(muzzle, item.point)).sort((a, b) => a.distance - b.distance)[0];
      if (!target) { instance.cooldown = 0; return; }
      // Preserve sub-frame remainder: five rounds/second at30/60/120Hz, without banking idle shots.
      instance.ammo -= 1; instance.cooldown = Math.max(0, instance.cooldown + PLACEABLE_SENTRY_RUNTIME_V86.interval); instance.firingClockV86 = 0.12;
      this.bullets.push({ ...muzzle, w: 8, h: 4, vx: Math.cos(target.angle) * 890, vy: Math.sin(target.angle) * 890,
        angleRadians: target.angle, aimExplicitV83: true, damage: instance.damage, owner: this.placeableActorV86(instance.ownerCrewId),
        ownerCrewId: instance.ownerCrewId, placeableInstanceIdV86: instance.instanceId, kind: 'portable-sentry', family: 'sentry',
        life: 1.25, hit: false, remainingPenetration: 0, maxHits: 1 });
      this.onEvent?.({ type: 'placeable-shot', instanceId: instance.instanceId, catalogId: instance.catalogId, crewId: instance.ownerCrewId, ammo: instance.ammo, targetId: target.enemy.id });
      this.audio?.shot?.();
      // Local gunfire alerts nearby enemies at the weapon's position, not at the commander's remote position.
      for (const enemy of list(this.enemies)) if (enemy.alive && !enemy.dormant && distance(enemy, instance) <= 700) {
        enemy.alert = true; enemy.revealed = Math.max(enemy.revealed || 0, 0.35);
      }
      if (instance.ammo === 30 || instance.ammo === 0) this.onEvent?.({ type: 'placeable-ammo-warning', instanceId: instance.instanceId,
        catalogId: instance.catalogId, ammo: instance.ammo, message: instance.ammo ? 'Sentinelle : 30 cartouches restantes.' : 'Sentinelle à sec : aucune recharge automatique.' });
    }

    damagePlaceableV86(instanceId, amount, source = {}) {
      const instance = this.placeableInstanceV86(instanceId);
      if (!live(instance) || !(Number(amount) > 0)) return 0;
      const damage = Math.min(instance.health, Number(amount)); instance.health -= damage;
      if (instance.health <= 0) { instance.status = 'destroyed'; instance.armed = false; }
      for (const task of this.placeableTasksV86?.values() || []) if (task.instanceId === instanceId) {
        const actor = this.placeableActorV86(task.actorCrewId); if (actor) this.cancelPlaceableV86(actor, 'object-impact');
      }
      this.onEvent?.({ type: instance.health > 0 ? 'placeable-damaged' : 'placeable-destroyed', instanceId, catalogId: instance.catalogId,
        damage, health: instance.health, enemyId: source.enemyId || source.ownerId || null,
        message: instance.health > 0 ? `${instance.name} endommagé : ${Math.ceil(instance.health)} PV.` : `${instance.name} détruit.` });
      return damage;
    }

    updateHostileProjectiles(delta) {
      const objects = list(this.placeablesV86?.instances).filter(live);
      if (!objects.length) return super.updateHostileProjectiles(delta);
      for (const projectile of list(this.hostileProjectiles)) {
        if (projectile.hit || !(projectile.life > 0)) continue;
        const dt = Math.min(Math.max(0, delta), projectile.life);
        const displacement = { x: (projectile.vx || 0) * dt, y: (projectile.vy || 0) * dt };
        const hit = objects.map(instance => ({ instance, contact: sweepProjectileAabbV83(projectile, displacement, instance) }))
          .filter(item => item.contact && live(item.instance)).sort((a, b) => a.contact.t - b.contact.t)[0];
        if (!hit) continue;
        const blocker = firstProjectileObstacleV83(projectile, displacement, { walls: [...list(this.walls).filter(item => !item.destroyed), ...list(this.covers).filter(item => !item.destroyed)], doors: this.doors, platforms: this.platforms });
        const actors = this.placeableActorsV86().filter(actor => !actor.inVehicle).map(actor => ({ kind: 'actor', actor,
          contact: sweepProjectileAabbV83(projectile, displacement, actor) })).filter(item => item.contact);
        const vehicleContact = this.vehicle?.occupied && !this.vehicle.destroyed ? sweepProjectileAabbV83(projectile, displacement, this.vehicle) : null;
        const impacts = [{ kind: 'placeable', instance: hit.instance, contact: hit.contact }, ...actors,
          ...(blocker ? [{ kind: 'terrain', contact: blocker }] : []), ...(vehicleContact ? [{ kind: 'vehicle', contact: vehicleContact }] : [])]
          .sort((a, b) => a.contact.t - b.contact.t || Number(a.kind !== 'terrain') - Number(b.kind !== 'terrain'));
        const first = impacts[0];
        // Resolve the earliest contact now: delegating a swept blocker to a discrete step would allow tunnelling next frame.
        if (first.kind === 'placeable') this.damagePlaceableV86(first.instance.instanceId, projectile.damage, projectile);
        else if (first.kind === 'actor') {
          if (first.actor === this.player || first.actor === this.coop) this.damagePlayer(first.actor, projectile.damage, { source: projectile.acid ? 'acid' : 'projectile' });
          else this.damageSquadMember(first.actor, projectile.damage, { source: projectile.acid ? 'acid-projectile' : 'projectile' });
        } else if (first.kind === 'vehicle') this.damageVehicle(projectile.damage, projectile.acid ? 'acid' : 'projectile');
        projectile.hit = true; projectile.x = first.contact.x; projectile.y = first.contact.y;
        this.spawnImpact?.(projectile.x, projectile.y, projectile.acid ? '#a7c742' : '#e3b86c');
      }
      this.hostileProjectiles = list(this.hostileProjectiles).filter(projectile => !projectile.hit);
      return super.updateHostileProjectiles(delta);
    }

    updateEnemy(enemy, delta) {
      if (!this.placeablesV86 || !enemy?.alive || enemy.dormant || enemy.ventTransit || enemy.behavior === 'egg' || /ovomorph|facehugger|ceto/i.test(enemy.visualSheetId || '')) {
        if (this.placeableAttackTasksV86?.delete(enemy?.id) && enemy) enemy.attacking = false;
        return super.updateEnemy(enemy, delta);
      }
      const current = this.placeableAttackTasksV86.get(enemy.id);
      const target = current ? this.placeableInstanceV86(current.instanceId) : list(this.placeablesV86.instances).filter(live)
        .filter(item => distance(enemy, item) < Math.max(64, enemy.w / 2 + item.w / 2 + 24) && this.placeableLineClearV86(center(enemy), center(item)))
        .sort((a, b) => distance(enemy, a) - distance(enemy, b))[0];
      const incapacitated = ['staggerClock', 'hurtClock', 'jammedClock', 'v52HurtClock', 'stunClock'].some(key => Number(enemy[key]) > 0);
      if (!target || !live(target) || incapacitated || distance(enemy, target) > Math.max(64, enemy.w / 2 + target.w / 2 + 30)
        || !this.placeableLineClearV86(center(enemy), center(target))) {
        if (this.placeableAttackTasksV86.delete(enemy.id)) {
          enemy.attacking = false;
          // An interrupted object windup cannot turn into an immediate legacy hit against a Marine in the same frame.
          const recovery = Math.max(0.82, Number(enemy.staggerClock) || 0, Number(enemy.hurtClock) || 0);
          enemy.attackClock = Math.max(enemy.attackClock || 0, recovery);
          enemy.rangedClock = Math.max(enemy.rangedClock || 0, recovery);
        }
        const result = super.updateEnemy(enemy, delta);
        if (current && incapacitated) enemy.attacking = false;
        return result;
      }
      // A distinct, telegraphed object strike. Do not impersonate a Marine or
      // interrupt a currently committed character attack to redirect its impact.
      if (!current && (enemy.pendingMelee || enemy.batchAttackV66 || enemy.attacking || enemy.attackClock > 0)) return super.updateEnemy(enemy, delta);
      const attack = current || { instanceId: target.instanceId, elapsed: 0, duration: 0.35 };
      if (!current) { this.placeableAttackTasksV86.set(enemy.id, attack); this.onEvent?.({ type: 'placeable-attack-started', instanceId: target.instanceId, enemyId: enemy.id, duration: attack.duration }); }
      enemy.facing = Math.sign(center(target).x - center(enemy).x) || enemy.facing || 1;
      enemy.attacking = true; enemy.vx = 0; attack.elapsed += Math.max(0, delta);
      if (attack.elapsed + 1e-8 >= attack.duration) {
        this.damagePlaceableV86(target.instanceId, Math.max(1, Number(enemy.damage) || 1), { enemyId: enemy.id });
        this.placeableAttackTasksV86.delete(enemy.id); enemy.attacking = false; enemy.attackClock = Math.max(enemy.attackClock || 0, 0.82);
      }
    }

    damagePlayer(actor, amount, options) {
      const health = actor?.health, armor = actor?.armor;
      const result = super.damagePlayer(actor, amount, options);
      if (result > 0 || actor?.health < health || actor?.armor < armor) this.cancelPlaceableV86(actor, 'impact');
      return result;
    }

    damageSquadMember(actor, amount, options) {
      const health = actor?.health, armor = actor?.armor;
      const result = super.damageSquadMember(actor, amount, options);
      if (result > 0 || actor?.health < health || actor?.armor < armor) this.cancelPlaceableV86(actor, 'impact');
      return result;
    }

    setCoop(enabled) {
      if (Boolean(enabled) !== Boolean(this.coopEnabled) && this.coop) this.cancelPlaceableV86(this.coop, 'role-change');
      return super.setCoop(enabled);
    }

    stop(...args) {
      for (const actor of this.placeableActorsV86()) this.cancelPlaceableV86(actor, 'runtime-stopped');
      this.placeableTasksV86?.clear(); this.placeablePreviewsV86?.clear(); this.placeableAttackTasksV86?.clear();
      return super.stop(...args);
    }

    captureResumeState() { return { ...super.captureResumeState(), ...(this.placeablesV86 ? { placeablesV86: capturePlaceablesStateV86(this.placeablesV86) } : {}) }; }

    restorePlaceablesAfterSupportV86(raw) {
      if (this.placeablesStartingV86 || !this.placeablesV86) this.pendingPlaceablesResumeV86 = raw?.placeablesV86 || null;
      else {
        this.placeablesV86 = restorePlaceablesStateV86(raw?.placeablesV86, this.equipmentActions, { legacyDeployables: raw?.gameplaySupportV72?.deployments, legacyV72: raw?.gameplaySupportV72, bounds: this.missionLevelBounds });
        this.placeableTasksV86.clear(); this.placeablePreviewsV86.clear(); this.placeableAttackTasksV86.clear();
        this.removeLegacyPlaceableProjectionsV86();
      }
      return Boolean(raw?.placeablesV86);
    }

    getPlaceablesSnapshotV86() {
      const instances = this.placeablesV86 ? capturePlaceablesStateV86(this.placeablesV86).instances : [];
      const availableByCatalog = {};
      for (const item of instances) if (item.status === 'carried') availableByCatalog[item.catalogId] = (availableByCatalog[item.catalogId] || 0) + 1;
      return { schema: 86, instances, availableByCatalog,
        previews: [...(this.placeablePreviewsV86?.values() || [])].map(item => ({ ...item })),
        tasks: [...(this.placeableTasksV86?.values() || [])].map(item => ({ ...item })) };
    }

    getSnapshot() { return { ...super.getSnapshot(), placeablesV86: this.getPlaceablesSnapshotV86() }; }

    drawWorld(ctx) {
      this.removeLegacyPlaceableProjectionsV86();
      super.drawWorld(ctx);
      if (this.placeablesV86) drawPlaceablesV86(this, ctx);
    }
  };
}
