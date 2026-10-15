import { WEAPONS } from './content.js';
import { firstProjectileObstacleV83, collectProjectileCollisionsV83 } from './projectile-collision-v83.js';
import { FIELD_ACTIONS_V124, fieldActorAvailableV124, resolveFieldTargetV124 } from './player-field-actions-v124.js';
import { resolveHeldWeaponProfileV125 } from './held-weapon-profiles-v125.js';
import { weaponImageReadyV125 } from './weapon-image-cache-v125.js';
import { consumeTacticalReloadBonusV77 } from './tactical-reload-v77.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const list = value => Array.isArray(value) ? value : [];
const center = box => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
const nearest = (point, box) => ({ x: clamp(point.x, box.x, box.x + box.w), y: clamp(point.y, box.y, box.y + box.h) });
const validBox = box => box && [box.x, box.y, box.w, box.h].every(Number.isFinite) && box.w > 0 && box.h > 0;
const activePlane = actor => !actor?.dormant && !actor?.ventTransit
  && (!actor?.rearEntryV130 || actor.rearEntryV130.phase === 'active')
  && (actor?.planeV130 || actor?.plane || 'gameplay') === 'gameplay';
const MAX_PROJECTILES = 32;
const STEP = 1 / 120;

/** Original gameplay tuning, not source specifications. Only exact admitted
 * catalogue IDs enable these actions; a name/family on an unknown item cannot
 * turn another weapon or V95 reference into a knife, tool or thrown grenade.
 * The M94 remains its reviewed drum launcher, not a standalone hand grenade.
 */
export const WEAPON_ACTION_PROFILES_V130 = Object.freeze(WEAPONS.flatMap(weapon => {
  const name = weapon.name.split(' — ')[0];
  let action;
  if (name === 'M40 HEDP Grenade') action = { kind: 'grenade', resource: 'grenades', cooldown: .75,
    size: 10, speed: 380, lift: 160, gravity: 900, fuse: 1.6, radius: 150 };
  else if (name === 'Smart Disc') action = { kind: 'disc', resource: null, cooldown: .6,
    size: 12, speed: 460, returnSpeed: 600, outwardTime: .42, lifetime: 2.4 };
  else if (name === 'Stun Baton') action = { kind: 'stun', resource: null, cooldown: .65, range: 55, stun: 1.1 };
  else if (name === 'Cutting Torch') action = { kind: 'torch', resource: 'fuel', cooldown: .65, range: 48 };
  else if (weapon.family === 'melee') action = { kind: 'melee', resource: null, cooldown: .48,
    range: name === 'Combi-Stick' ? 90 : name === 'Fire Axe' ? 72 : name === 'Maintenance Jack' ? 62
      : name === 'Wrist Blades' ? 42 : 50 };
  return action ? [Object.freeze({ schema: 130, weaponId: weapon.id, name: weapon.name,
    damage: weapon.damage, ...action })] : [];
}));
const profiles = new Map(WEAPON_ACTION_PROFILES_V130.map(profile => [profile.weaponId, profile]));
export const resolveWeaponActionProfileV130 = weapon => profiles.get(typeof weapon === 'string' ? weapon : weapon?.id) || null;

const actorId = (engine, actor) => actor === engine.player ? 'player' : actor === engine.coop ? 'coop'
  : actor?.squadMember && actor.crewId ? `squad:${actor.crewId}` : null;
const actors = engine => [engine.player, engine.coop, ...list(engine.squadActors)].filter(Boolean);
const activeActors = engine => [engine.player, engine.coopEnabled ? engine.coop : null,
  ...(engine.activeSquadActors?.() || list(engine.squadActors))].filter(Boolean);
const actorById = (engine, id) => actors(engine).find(actor => actorId(engine, actor) === id) || null;
const world = engine => ({ walls: [...list(engine.walls), ...list(engine.covers)],
  doors: engine.closedDoorColliders?.() || engine.doors || [],
  platforms: [...new Set([...list(engine.platforms), ...list(engine.lifts)])],
  bounds: engine.missionLevelBounds || { width: 6200, height: 1080 } });
const running = engine => Boolean(engine.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65
  && !engine.userCasteLoadingV88 && engine.mission?.state === 'active');

/** Catalogue actions observe the same actor, damage, collision, field-work and
 * resume systems as gunfire. They never enter the generic rifle-bullet path.
 * Ordinary firearms, mounted weapons, Neuro and Fireball V122 keep that path.
 */
export function withWeaponActionsV130(Base) {
  return class WeaponActionsRuntimeV130 extends Base {
    start(options = {}) {
      this.weaponProjectilesV130 = [];
      this.weaponActionSerialV130 = 0;
      return super.start(options);
    }

    weaponActionProfileV130(actor = this.player) {
      if (!actor || actor.inVehicle || this.neuro?.active && actor === this.player) return null;
      return resolveWeaponActionProfileV130(this.weaponDescriptorV124?.(actor));
    }

    weaponActionAllowedV130(actor) {
      return Boolean(running(this) && activePlane(actor) && this.canPerformGameplayAction(actor) && !actor.climbing && !actor.inVehicle
        && !this.isVehicleAccessLockedV59?.(actor) && !actor.vehicleAccessPhase && !actor.reloading
        && !(actor.fireClock > 0) && !(actor.meleeClock > 0) && !(actor.toolUseClock > 0)
        && !(actor.interactionClock > 0) && !(actor.grappledClock > 0) && !(actor.stunClock > 0));
    }

    fire(actor = this.player) {
      const profile = this.weaponActionProfileV130(actor);
      if (!profile) return super.fire(actor);
      if (!this.weaponActionAllowedV130(actor)) return false;
      const aim = this.resolvePlayerCombatAimV83(actor);
      return this.performWeaponActionV130(actor, profile, aim);
    }

    melee(actor = this.player) {
      const profile = this.weaponActionProfileV130(actor);
      return profile && ['melee', 'stun'].includes(profile.kind) ? this.fire(actor) : super.melee(actor);
    }

    reloadWeaponV77(actor) {
      const descriptor = super.reloadWeaponV77(actor);
      // A carried torch swaps its fuel tank using the existing reload
      // transaction; the item ID and actor's fuel/reserve ownership stay intact.
      return resolveWeaponActionProfileV130(descriptor)?.kind === 'torch' ? { ...descriptor, family: 'flame' } : descriptor;
    }

    reload(actor = this.player) {
      const profile = this.weaponActionProfileV130(actor);
      if (profile && profile.kind !== 'torch') return false;
      return super.reload(actor);
    }

    weaponActionOriginV130(actor, aim) {
      const muzzle = this.resolvePlayerMuzzleV124(actor, aim);
      return { muzzle, x: finite(muzzle?.pivotX, actor.x + actor.w / 2),
        y: finite(muzzle?.pivotY, actor.y + actor.h * .45), w: 0, h: 0 };
    }

    weaponContactTargetV130(actor, profile, aim) {
      const origin = this.weaponActionOriginV130(actor, aim);
      const targets = [...list(this.enemies).filter(enemy => enemy.alive && activePlane(enemy)),
        ...list(this.destructibleSceneryV130?.objects).filter(object => object.plane === 'gameplay' && object.hp > 0 && !object.destroyed)];
      return targets.filter(validBox)
        .map(enemy => {
          const point = nearest(origin, enemy), dx = point.x - origin.x, dy = point.y - origin.y;
          const distance = Math.hypot(dx, dy);
          return { enemy, point, dx, dy, distance };
        }).filter(hit => {
          if (hit.distance > profile.range || hit.distance && (hit.dx * aim.x + hit.dy * aim.y) / hit.distance < .45) return false;
          const obstruction = firstProjectileObstacleV83(origin, { x: hit.dx, y: hit.dy }, world(this));
          return !obstruction || obstruction.target === hit.enemy;
        })
        .sort((a, b) => a.distance - b.distance)[0] || null;
    }

    performWeaponActionV130(actor, profile, aim) {
      if (profile.kind === 'grenade' || profile.kind === 'disc') return this.throwWeaponV130(actor, profile, aim);
      if (profile.kind === 'torch' && actor.grounded !== true) return false;
      const hit = this.weaponContactTargetV130(actor, profile, aim);
      if (profile.kind === 'torch' && !hit) {
        const available = fieldActorAvailableV124(this, actor);
        const target = available.ok && resolveFieldTargetV124(this, 'breach', actor);
        if (!target?.ok || !(actor.ammo > 0)) return false;
        // Reserve the actual carried fuel, not a fabricated equipment charge.
        // Native field work owns duration, movement/impact cancellation and
        // target revalidation; consumption occurs only at its successful commit.
        return this.beginFieldActionV124(actor, { ...FIELD_ACTIONS_V124.breach,
          source: 'weapon-v130', weaponId: profile.weaponId, target: target.target });
      }
      if (profile.kind === 'torch' && !(actor.ammo > 0)) { this.reload(actor); return false; }
      actor.fireClock = profile.cooldown;
      actor.actionClock = profile.kind === 'torch' ? .4 : .42;
      if (profile.kind === 'torch') this.setToolAnimation(actor, 'cutting-torch', .4);
      else { actor.meleeKind = 'knife-attack'; actor.meleeClock = .42; }
      if (actor.squadMember) actor.actions = finite(actor.actions) + 1;
      if (hit) {
        const bonus = profile.kind === 'torch' ? consumeTacticalReloadBonusV77(actor, this.reloadWeaponV77(actor)) : 1;
        if (profile.kind === 'torch') actor.ammo -= 1;
        const source = { owner: actor, kind: profile.kind === 'torch' ? 'cutting-torch' : profile.kind === 'stun' ? 'stun-baton' : 'knife-attack',
          family: profile.kind === 'torch' ? 'flame' : 'melee', weaponId: profile.weaponId,
          status: profile.kind === 'stun' ? 'stun' : profile.kind === 'torch' ? 'burn' : null,
          x: hit.point.x, y: hit.point.y, damage: profile.damage * bonus };
        const damaged = hit.enemy.sceneryV130
          ? this.damageDestructibleSceneryV130(hit.enemy.id, source.damage, source, hit.point)
          : this.applyEnemyDamage(hit.enemy, source.damage, source);
        if (damaged > 0 && hit.enemy.alive && source.status) {
          const speed = hit.enemy.speed;
          this.applyProjectileStatus(hit.enemy, source);
          // The native stun clock prevents attacks; its incidental speed
          // multiplier must not permanently compound on every baton contact.
          hit.enemy.speed = speed;
          if (profile.kind === 'stun') hit.enemy.staggerClock = Math.max(finite(hit.enemy.staggerClock), profile.stun);
          hit.enemy.weaponStatusV130 = profile.weaponId;
        }
      }
      this.onEvent?.({ type: 'melee', attack: profile.kind, weaponId: profile.weaponId,
        target: hit?.enemy.id || null, damage: hit ? profile.damage : 0, coop: Boolean(actor.coop) });
      if (hit) this.emitEnemyNoiseV130?.(actor, profile.kind === 'torch' ? 280 : 160, profile.kind);
      this.refreshStealth?.(actor);
      return true;
    }

    commitFieldActionV124(actor, task) {
      if (task.source !== 'weapon-v130') return super.commitFieldActionV124(actor, task);
      const profile = this.weaponActionProfileV130(actor);
      const target = resolveFieldTargetV124(this, 'breach', actor, task.target);
      if (profile?.kind !== 'torch' || profile.weaponId !== task.weaponId || !(actor.ammo > 0) || !target.ok) return false;
      actor.ammo -= 1;
      if (list(this.walls).includes(target.target)) target.target.destroyed = true;
      else {
        target.target.open = true;
        if (list(this.vents).includes(target.target)) this.inventory.cutter = true;
      }
      if (this.fieldEffects) this.fieldEffects.breaches += 1;
      this.onEvent?.({ type: 'weapon-tool-v130', weaponId: profile.weaponId, targetId: target.target.id, fuel: actor.ammo });
      return true;
    }

    fireCrewWeaponV85(actor) {
      const profile = resolveWeaponActionProfileV130(actor?.crewV85?.weaponRuntime);
      if (!profile) return super.fireCrewWeaponV85(actor);
      if (!this.weaponActionAllowedV130(actor)) return false;
      const target = this.closestEnemy(actor, profile.range || 500);
      if (!target) return false;
      const origin = center(actor), destination = center(target);
      const dx = destination.x - origin.x, dy = destination.y - origin.y, length = Math.hypot(dx, dy) || 1;
      const aim = { x: dx / length, y: dy / length, facing: dx < 0 ? -1 : 1, active: true };
      actor.facing = aim.facing;
      return this.performWeaponActionV130(actor, profile, aim);
    }

    throwWeaponV130(actor, profile, aim) {
      this.weaponProjectilesV130 ||= [];
      if (this.weaponProjectilesV130.length >= MAX_PROJECTILES
        || profile.kind === 'disc' && this.weaponProjectilesV130.some(projectile => projectile.owner === actor && projectile.kind === 'disc')) return false;
      if (profile.kind === 'grenade' && !(actor.ammo > 0 || actor.ammoReserve > 0)) return false;
      const { muzzle, x, y } = this.weaponActionOriginV130(actor, aim);
      const half = profile.size / 2;
      const from = { x: x - half, y: y - half, w: profile.size, h: profile.size };
      const displacement = { x: muzzle.x - x, y: muzzle.y - y };
      const contact = firstProjectileObstacleV83(from, displacement, world(this));
      if (contact && !contact.normalX && !contact.normalY) return false;
      const position = contact ? { x: contact.x + contact.normalX * .01, y: contact.y + contact.normalY * .01 }
        : { x: muzzle.x - half, y: muzzle.y - half };
      if (profile.kind === 'grenade') {
        if (actor.ammo > 0) actor.ammo -= 1; else actor.ammoReserve -= 1;
      }
      actor.fireClock = profile.cooldown;
      actor.actionClock = actor.meleeClock = .42;
      actor.meleeKind = 'throw-grenade';
      actor.shots = finite(actor.shots) + 1;
      if (actor.squadMember) actor.actions = finite(actor.actions) + 1;
      const projectile = { schema: 130, id: `weapon-action-v130:${++this.weaponActionSerialV130}`, kind: profile.kind,
        weaponId: profile.weaponId, owner: actor, ...position, w: profile.size, h: profile.size,
        vx: aim.x * profile.speed, vy: aim.y * profile.speed - finite(profile.lift),
        age: 0, remaining: profile.fuse || profile.lifetime, damage: profile.damage,
        returning: false, hitEnemyIds: new Set(), resting: false, supportId: null };
      this.weaponProjectilesV130.push(projectile);
      this.onEvent?.({ type: 'weapon-thrown-v130', kind: profile.kind, weaponId: profile.weaponId,
        projectileId: projectile.id, coop: Boolean(actor.coop) });
      return true;
    }

    updateBullets(delta) {
      if (!running(this)) return;
      const result = super.updateBullets(delta);
      const advance = () => this.advanceWeaponProjectilesV130(delta);
      if (this.withEnemySpriteCollisionGeometry) this.withEnemySpriteCollisionGeometry(advance); else advance();
      return result;
    }

    advanceWeaponProjectilesV130(delta) {
      if (!running(this)) return;
      for (const projectile of this.weaponProjectilesV130 || []) {
        const profile = resolveWeaponActionProfileV130(projectile.weaponId);
        if (!profile || projectile.resolved) continue;
        let remaining = Math.max(0, finite(delta));
        while (remaining > 1e-9 && !projectile.resolved) {
          const step = Math.min(STEP, remaining, projectile.remaining);
          if (!(step > 1e-9)) {
            if (profile.kind === 'grenade') this.explodeGrenadeV130(projectile, profile);
            else projectile.resolved = true;
            break;
          }
          if (profile.kind === 'disc') this.advanceDiscV130(projectile, profile, step);
          else this.advanceGrenadeV130(projectile, profile, step);
          projectile.age += step; projectile.remaining -= step; remaining -= step;
          if (projectile.remaining <= 1e-9 && !projectile.resolved) {
            if (profile.kind === 'grenade') this.explodeGrenadeV130(projectile, profile);
            else projectile.resolved = true;
          }
        }
      }
      this.weaponProjectilesV130 = (this.weaponProjectilesV130 || []).filter(projectile => !projectile.resolved);
    }

    advanceGrenadeV130(projectile, profile, delta) {
      if (projectile.resting) {
        const support = world(this).platforms.find(surface => surface.id === projectile.supportId && !surface.destroyed);
        if (support && projectile.x + projectile.w > support.x && projectile.x < support.x + support.w) {
          projectile.y = support.y - projectile.h;
          return;
        }
        projectile.resting = false;
      }
      const displacement = { x: projectile.vx * delta, y: projectile.vy * delta + profile.gravity * delta * delta / 2 };
      const contact = firstProjectileObstacleV83(projectile, displacement, world(this));
      projectile.vy += profile.gravity * delta;
      if (!contact) { projectile.x += displacement.x; projectile.y += displacement.y; return; }
      projectile.x = contact.x + contact.normalX * .01; projectile.y = contact.y + contact.normalY * .01;
      if (contact.normalX) projectile.vx *= -.35;
      if (contact.normalY) { projectile.vy *= -.35; projectile.vx *= .72; }
      if (contact.normalY < 0 && Math.abs(projectile.vy) < 28 && contact.kind === 'platform') {
        projectile.vx = projectile.vy = 0; projectile.resting = true;
        projectile.supportId = contact.target.id || null;
        projectile.y = contact.target.y - projectile.h;
      }
    }

    advanceDiscV130(projectile, profile, delta) {
      if (projectile.age >= profile.outwardTime) projectile.returning = true;
      if (projectile.returning) {
        const owner = projectile.owner;
        if (!owner?.alive || owner === this.coop && !this.coopEnabled) { projectile.resolved = true; return; }
        const origin = center(projectile), hand = center(owner), dx = hand.x - origin.x, dy = hand.y - origin.y;
        const distance = Math.hypot(dx, dy);
        if (distance <= profile.returnSpeed * delta + owner.w / 2) { projectile.resolved = true; return; }
        projectile.vx = dx / distance * profile.returnSpeed; projectile.vy = dy / distance * profile.returnSpeed;
      }
      const displacement = { x: projectile.vx * delta, y: projectile.vy * delta };
      const collisions = collectProjectileCollisionsV83(projectile, displacement, {
        ...world(this), enemies: list(this.enemies).filter(activePlane) });
      for (const hit of collisions) {
        if (hit.kind !== 'enemy') {
          if (hit.target?.sceneryV130) this.damageDestructibleSceneryV130(hit.target.id, projectile.damage,
            { owner: projectile.owner, kind: 'smart-disc', weaponId: projectile.weaponId }, hit);
          projectile.x = hit.x + hit.normalX * .01; projectile.y = hit.y + hit.normalY * .01;
          if (projectile.returning) projectile.resolved = true; else projectile.returning = true;
          return;
        }
        projectile.hitEnemyIds.add(hit.target.id);
        this.applyEnemyDamage(hit.target, projectile.damage, { owner: projectile.owner, kind: 'smart-disc', family: 'melee',
          weaponId: projectile.weaponId, x: hit.x, y: hit.y });
      }
      projectile.x += displacement.x; projectile.y += displacement.y;
    }

    explodeGrenadeV130(projectile, profile) {
      if (projectile.resolved) return false;
      projectile.resolved = true;
      const origin = { ...center(projectile), w: 0, h: 0 };
      let affected = 0;
      const damageAt = target => {
        if (!validBox(target)) return 0;
        const point = nearest(origin, target), displacement = { x: point.x - origin.x, y: point.y - origin.y };
        const distance = Math.hypot(displacement.x, displacement.y);
        const obstruction = firstProjectileObstacleV83(origin, displacement, world(this));
        if (distance >= profile.radius || obstruction && obstruction.target !== target) return 0;
        return projectile.damage * (1 - .65 * distance / profile.radius);
      };
      for (const enemy of new Set(list(this.enemies))) {
        const damage = enemy.alive && activePlane(enemy) && damageAt(enemy);
        if (!damage) continue;
        const applied = this.applyEnemyDamage(enemy, damage, { owner: projectile.owner, kind: 'explosive-splash', family: 'explosive',
          status: 'blast', weaponId: profile.weaponId, x: origin.x, y: origin.y });
        if (applied > 0) affected++;
      }
      for (const actor of new Set(activeActors(this))) {
        const damage = actor.alive && activePlane(actor) && !actor.inVehicle && damageAt(actor);
        if (damage) this.damagePlayer(actor, damage, { source: 'grenade', attackKind: 'explosion', bypassCover: true,
          sourceX: origin.x, sourceY: origin.y });
      }
      const vehicleDamage = this.vehicle?.active && !this.vehicle.destroyed && damageAt(this.vehicle);
      if (vehicleDamage) this.damageVehicle(vehicleDamage, 'grenade');
      // Resolve every scenery contact against the intact scene before breaking
      // its first pane: that same blast must not pass through the new opening.
      const sceneryHits = list(this.destructibleSceneryV130?.objects)
        .filter(object => object.plane === 'gameplay' && !object.destroyed && object.hp > 0)
        .map(object => ({ object, damage: damageAt(object), point: nearest(origin, object) }));
      for (const hit of sceneryHits) if (hit.damage > 0) this.damageDestructibleSceneryV130(hit.object.id, hit.damage,
        { owner: projectile.owner, kind: 'grenade', weaponId: profile.weaponId }, hit.point);
      this.spawnImpact(origin.x, origin.y, '#edb56a');
      this.emitEnemyNoiseV130?.(projectile, 1100, 'explosion');
      if (this.stealthRuntime) this.stealthRuntime.noiseBurstUntil = finite(this.animationTime) + .85;
      this.onEvent?.({ type: 'grenade-exploded-v130', weaponId: profile.weaponId, projectileId: projectile.id,
        x: origin.x, y: origin.y, affected });
      return true;
    }

    drawWorld(ctx) {
      const result = super.drawWorld(ctx);
      for (const projectile of this.weaponProjectilesV130 || []) {
        const profile = resolveHeldWeaponProfileV125(projectile.weaponId), image = profile && this.images?.get(profile.imageKey);
        ctx.save();
        ctx.translate(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2);
        ctx.rotate(projectile.age * (projectile.kind === 'disc' ? 18 : 6));
        if (profile && weaponImageReadyV125(image, profile)) {
          const [left, top, right, bottom] = profile.alphaBounds;
          const scale = projectile.w / Math.max(right - left, bottom - top);
          ctx.drawImage(image, -((left + right) / 2) * scale, -((top + bottom) / 2) * scale,
            profile.sourceWidth * scale, profile.sourceHeight * scale);
        } else {
          ctx.fillStyle = projectile.kind === 'disc' ? '#c8d8d3' : '#798365';
          ctx.beginPath(); ctx.arc(0, 0, projectile.w / 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
      return result;
    }

    captureResumeState() {
      return { ...super.captureResumeState(), weaponActionsV130: { schema: 130,
        serial: finite(this.weaponActionSerialV130),
        operators: actors(this).flatMap(actor => {
          const profile = this.weaponActionProfileV130(actor);
          return profile ? [{ id: actorId(this, actor), weaponId: profile.weaponId, fireClock: finite(actor.fireClock),
            meleeClock: finite(actor.meleeClock), meleeKind: actor.meleeKind, shots: finite(actor.shots) }] : [];
        }),
        statuses: list(this.enemies).filter(enemy => enemy.alive && profiles.has(enemy.weaponStatusV130)).map(enemy => ({
          id: enemy.id, weaponId: enemy.weaponStatusV130, staggerClock: finite(enemy.staggerClock),
          statusClock: finite(enemy.statusClock), statusEffect: enemy.statusEffect })),
        projectiles: (this.weaponProjectilesV130 || []).filter(projectile => !projectile.resolved).map(projectile => ({
          id: projectile.id, weaponId: projectile.weaponId, ownerId: actorId(this, projectile.owner),
          x: projectile.x, y: projectile.y, vx: projectile.vx, vy: projectile.vy,
          age: projectile.age, remaining: projectile.remaining, returning: projectile.returning,
          hitEnemyIds: [...projectile.hitEnemyIds], resting: projectile.resting, supportId: projectile.supportId })) } };
    }

    applyResumeState(raw) {
      const result = super.applyResumeState(raw);
      if (!result?.applied) return result;
      this.weaponProjectilesV130 = [];
      const saved = raw?.weaponActionsV130;
      if (saved?.schema !== 130) return result;
      this.weaponActionSerialV130 = clamp(Math.floor(finite(saved.serial)), 0, 999999);
      for (const record of list(saved.operators)) {
        const actor = actorById(this, record.id), profile = actor && this.weaponActionProfileV130(actor);
        if (!profile || profile.weaponId !== record.weaponId) continue;
        actor.fireClock = clamp(finite(record.fireClock), 0, profile.cooldown);
        actor.meleeClock = clamp(finite(record.meleeClock), 0, .42);
        actor.meleeKind = record.meleeKind === 'throw-grenade' ? 'throw-grenade' : 'knife-attack';
        actor.shots = clamp(Math.floor(finite(record.shots)), 0, 999999);
      }
      for (const record of list(saved.statuses)) {
        const profile = resolveWeaponActionProfileV130(record.weaponId), enemy = this.enemies?.find(enemy => enemy.id === record.id);
        if (!enemy?.alive || !['stun', 'torch'].includes(profile?.kind)) continue;
        enemy.weaponStatusV130 = profile.weaponId;
        enemy.staggerClock = clamp(finite(record.staggerClock), 0, profile.stun || .12);
        enemy.statusEffect = profile.kind === 'stun' ? 'stun' : 'burn';
        enemy.statusClock = clamp(finite(record.statusClock), 0, profile.kind === 'stun' ? 2.5 : 5);
      }
      const seen = new Set(), bounds = world(this).bounds;
      for (const record of list(saved.projectiles).slice(0, MAX_PROJECTILES)) {
        const profile = resolveWeaponActionProfileV130(record.weaponId), owner = actorById(this, record.ownerId);
        if (!owner || !['grenade', 'disc'].includes(profile?.kind) || typeof record.id !== 'string'
          || !/^weapon-action-v130:\d{1,7}$/.test(record.id) || seen.has(record.id)
          || ![record.x, record.y, record.vx, record.vy, record.age, record.remaining].every(Number.isFinite)
          || record.x < 0 || record.y < 0 || record.x + profile.size > bounds.width || record.y + profile.size > bounds.height
          || record.remaining < 0 || record.remaining > (profile.fuse || profile.lifetime)
          || record.age < 0 || record.age > (profile.fuse || profile.lifetime)
          || Math.abs(record.vx) > 1200 || Math.abs(record.vy) > 2400) continue;
        seen.add(record.id);
        this.weaponProjectilesV130.push({ schema: 130, id: record.id, weaponId: profile.weaponId, kind: profile.kind,
          owner, x: record.x, y: record.y, vx: record.vx, vy: record.vy, w: profile.size, h: profile.size,
          age: record.age, remaining: record.remaining, damage: profile.damage,
          returning: record.returning === true, resting: record.resting === true,
          supportId: typeof record.supportId === 'string' ? record.supportId : null,
          hitEnemyIds: new Set(list(record.hitEnemyIds).filter(id => this.enemies?.some(enemy => enemy.id === id))) });
      }
      return { ...result, weaponProjectilesRestoredV130: this.weaponProjectilesV130.length };
    }

    restartFromCheckpoint() {
      const supplies = actors(this).filter(actor => ['grenade', 'torch'].includes(this.weaponActionProfileV130(actor)?.kind))
        .map(actor => ({ actor, ammo: actor.ammo, reserve: actor.ammoReserve }));
      const result = super.restartFromCheckpoint();
      if (result) {
        this.weaponProjectilesV130 = [];
        // The legacy checkpoint grants firearm rounds. It cannot mint six
        // hand grenades or refill a carried fuel tank after its charges were used.
        for (const supply of supplies) { supply.actor.ammo = supply.ammo; supply.actor.ammoReserve = supply.reserve; }
      }
      return result;
    }

    stop(...args) {
      const result = super.stop(...args);
      this.weaponProjectilesV130 = [];
      return result;
    }

    weaponActionsSnapshotV130() {
      return { schema: 130, projectiles: (this.weaponProjectilesV130 || []).map(projectile => ({
        id: projectile.id, weaponId: projectile.weaponId, ownerId: actorId(this, projectile.owner), kind: projectile.kind,
        x: projectile.x, y: projectile.y, vx: projectile.vx, vy: projectile.vy, remaining: projectile.remaining,
        returning: projectile.returning, resting: projectile.resting })),
        operators: actors(this).flatMap(actor => {
          const profile = this.weaponActionProfileV130(actor);
          return profile ? [{ id: actorId(this, actor), weaponId: profile.weaponId, kind: profile.kind,
            resource: profile.resource, available: profile.resource ? finite(actor.ammo) + finite(actor.ammoReserve) : null }] : [];
        }) };
    }

    weaponActionHudLabelV130(actor = this.player) {
      const profile = this.weaponActionProfileV130(actor);
      if (!profile) return null;
      if (profile.kind === 'grenade') return `GREN ${finite(actor.ammo) + finite(actor.ammoReserve)}`;
      if (profile.kind === 'torch') return `CARB ${finite(actor.ammo)}/${finite(actor.ammoReserve)}`;
      if (profile.kind === 'disc') return `DISQUE ${(this.weaponProjectilesV130 || []).some(projectile => projectile.owner === actor && projectile.kind === 'disc') ? 'EN VOL' : 'PRÊT'}`;
      return profile.kind === 'stun' ? 'BÂTON ÉLECTR' : 'CONTACT';
    }

    getInteractionPrompt(actor = this.player) {
      const prompt = super.getInteractionPrompt(actor), profile = this.weaponActionProfileV130(actor);
      if (!profile || !actor?.alive || actor.downed || this.isFieldActionBusyV124?.(actor)) return prompt;
      if (prompt === 'CHALUMEAU REQUIS' && profile.kind === 'torch') return 'F  DÉCOUPER LE CONDUIT';
      if (prompt && prompt !== 'S  COUVERTURE · F  TIR · R  RECHARGER') return prompt;
      const action = profile.kind === 'grenade' ? 'F  LANCER UNE GRENADE' : profile.kind === 'disc' ? 'F  LANCER LE DISQUE'
        : profile.kind === 'torch' ? 'F  CHALUMEAU À PORTÉE · R  CHANGER LE RÉSERVOIR'
          : profile.kind === 'stun' ? 'F  FRAPPER ET ÉTOURDIR' : 'F  FRAPPER AU CONTACT';
      return prompt ? `S  COUVERTURE · ${action}` : action;
    }

    getSnapshot() { return { ...super.getSnapshot(), weaponActionsV130: this.weaponActionsSnapshotV130() }; }
  };
}
