import { firstProjectileObstacleV83, sweepProjectileAabbV83 } from './projectile-collision-v83.js';

const list = value => Array.isArray(value) ? value : [];
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const center = box => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
const overlaps = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const plane = object => object?.rearEntryV130 && object.rearEntryV130.phase !== 'active'
  ? 'background' : object?.planeV130 || object?.plane || 'gameplay';
const live = object => object?.sceneryV130 === true && !object.destroyed && object.hp > 0;
const sameContact = (a, b) => Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001;
const signature = plan => String(plan?.signature || plan?.id || plan?.templateId || '');

export const DESTRUCTIBLE_SCENERY_MATERIALS_V130 = Object.freeze({
  glass: Object.freeze({ hp: 32, tint: '#afd8d7', opaque: false, fragments: 18 }),
  panel: Object.freeze({ hp: 80, tint: '#83a092', opaque: true, fragments: 12 }),
  crate: Object.freeze({ hp: 52, tint: '#96957a', opaque: true, fragments: 10 })
});
export const DESTRUCTIBLE_SCENERY_LIMITS_V130 = Object.freeze({ objects: 96, fragments: 128, fragmentLife: 2.4 });

/** Explicit level extension only. Old generated levels, editor imports and QA
 * geometry receive no automatic obstacles. Geometry always comes from the
 * validated level, never from a save or a remote reward declaration. */
export function buildDestructibleSceneryV130(plan, { bounds = plan?.dimensions, protectedObjects = [] } = {}) {
  const ids = new Set();
  const result = [];
  for (const source of list(plan?.destructibleSceneryV130).slice(0, DESTRUCTIBLE_SCENERY_LIMITS_V130.objects)) {
    const material = DESTRUCTIBLE_SCENERY_MATERIALS_V130[source?.material];
    if (!material || typeof source.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9:_.-]{0,95}$/.test(source.id)
      || ids.has(source.id) || !['x', 'y', 'w', 'h'].every(key => Number.isFinite(source[key]))
      || source.w < 8 || source.h < 8 || source.w > 384 || source.h > 384 || source.x < 0 || source.y < 0
      || source.loadBearing || source.objectiveCritical || source.objectiveId || source.supportsObjective
      || source.indestructible || (bounds && (source.x + source.w > bounds.width || source.y + source.h > bounds.height))) continue;
    const sourcePlane = source.plane || 'gameplay';
    if (!['gameplay', 'background', 'foreground'].includes(sourcePlane)) continue;
    if (sourcePlane === 'gameplay' && protectedObjects.some(object => overlaps(source, object))) continue;
    const hp = clamp(finite(source.hp, material.hp), 1, 500);
    ids.add(source.id);
    result.push({ id: source.id, x: source.x, y: source.y, w: source.w, h: source.h,
      material: source.material, plane: sourcePlane, hp, maxHp: hp, health: hp, destroyed: false,
      sceneryV130: true, opaque: material.opaque, impactCount: 0, flashClockV130: 0, lastImpactV130: null });
  }
  return result;
}

function drawScenery(ctx, object) {
  const { x, y, w, h } = object;
  const material = DESTRUCTIBLE_SCENERY_MATERIALS_V130[object.material];
  ctx.save();
  ctx.globalAlpha = object.plane === 'gameplay' ? 1 : 0.45;
  ctx.fillStyle = '#1b2828';
  ctx.fillRect(x - 3, y - 3, w + 6, 3); ctx.fillRect(x - 3, y + h, w + 6, 3);
  ctx.fillRect(x - 3, y, 3, h); ctx.fillRect(x + w, y, 3, h);
  if (!object.destroyed) {
    if (object.material === 'glass') {
      // The pane retains the scene behind it; it never paints a black rectangle.
      ctx.fillStyle = 'rgba(105,190,202,0.19)'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#79a5aa'; ctx.lineWidth = 1; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.fillStyle = 'rgba(205,248,247,0.22)'; ctx.fillRect(x + w * 0.22, y + 4, Math.max(2, w * 0.12), h - 8);
    } else {
      ctx.fillStyle = object.material === 'crate' ? '#474d3d' : '#334646'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = material.tint; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
      ctx.beginPath(); ctx.moveTo(x + 6, y + 6); ctx.lineTo(x + w - 6, y + h - 6);
      if (object.material === 'crate') { ctx.moveTo(x + w - 6, y + 6); ctx.lineTo(x + 6, y + h - 6); }
      ctx.stroke();
      ctx.fillStyle = '#b2a267'; ctx.fillRect(x + 7, y + 8, Math.max(3, w * 0.25), 3);
    }
    if (object.hp < object.maxHp) {
      const impact = object.lastImpactV130 || center(object);
      const ix = clamp(impact.x, x + 2, x + w - 2), iy = clamp(impact.y, y + 2, y + h - 2);
      ctx.strokeStyle = object.material === 'glass' ? '#d6f0ed' : '#1a2423'; ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(x + w * 0.16, y + h * 0.12);
      ctx.moveTo(ix, iy); ctx.lineTo(x + w * 0.78, y + h * 0.32);
      ctx.moveTo(ix, iy); ctx.lineTo(x + w * 0.35, y + h * 0.86);
      if (object.hp < object.maxHp * 0.5) { ctx.moveTo(ix, iy); ctx.lineTo(x + w * 0.94, y + h * 0.88); }
      ctx.stroke();
    }
    if (object.flashClockV130 > 0) {
      ctx.fillStyle = `rgba(224,244,225,${clamp(object.flashClockV130 * 2, 0, 0.32)})`; ctx.fillRect(x, y, w, h);
    }
  } else if (object.material === 'glass') {
    // Small edge shards are visual only: the broken opening is fully traversable.
    ctx.fillStyle = 'rgba(159,209,211,0.45)';
    for (let i = 0; i < 3; i++) ctx.fillRect(x + w * (i + 0.2) / 3, y + h - 3, Math.max(2, w * 0.045), 3);
  }
  ctx.restore();
}

export function withDestructibleSceneryV130(Base) {
  return class DestructibleSceneryV130 extends Base {
    start(options = {}) {
      this.destructibleSceneryStartingV130 = true;
      this.destructibleSceneryEnabledV130 = options.destructibleSceneryV130 !== false;
      this.destructibleSceneryV130 = null;
      this.destructibleSceneryFragmentsV130 = [];
      this.pendingDestructibleSceneryResumeV130 = null;
      const result = super.start(options);
      this.destructibleSceneryStartingV130 = false;
      if (this.pendingDestructibleSceneryResumeV130) this.restoreDestructibleSceneryV130(this.pendingDestructibleSceneryResumeV130);
      this.pendingDestructibleSceneryResumeV130 = null;
      return { ...result, destructibleSceneryV130: this.getDestructibleScenerySnapshotV130() };
    }

    applyMissionLevelV52(plan) {
      const result = super.applyMissionLevelV52(plan);
      this.configureDestructibleSceneryV130(this.missionLevelRuntime);
      return result;
    }

    configureDestructibleSceneryV130(plan = this.missionLevelRuntime) {
      // A repeated readiness/configuration query must not repair an already broken pane.
      if (this.destructibleSceneryV130?.plan === plan) {
        this.walls ||= [];
        for (const object of this.destructibleSceneryV130.objects)
          if (live(object) && object.plane === 'gameplay' && !this.walls.includes(object)) this.walls.push(object);
        return this.getDestructibleScenerySnapshotV130();
      }
      this.walls = list(this.walls).filter(object => !object.sceneryV130);
      this.destructibleSceneryFragmentsV130 = [];
      const objects = this.destructibleSceneryEnabledV130 !== false && !this.editorMode
        ? buildDestructibleSceneryV130(plan, { bounds: this.missionLevelBounds,
          protectedObjects: [this.objective, this.powerNode, this.archiveTerminal, ...list(this.objectiveNodes)].filter(Boolean) }) : [];
      this.destructibleSceneryV130 = { schema: 130, signature: signature(plan), plan, objects, hits: 0, destroyed: 0 };
      this.walls.push(...objects.filter(object => object.plane === 'gameplay'));
      return this.getDestructibleScenerySnapshotV130();
    }

    damageDestructibleSceneryV130(id, amount, source = {}, contact = {}) {
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88 || this.mission?.state !== 'active'
        || plane(source.owner || source) !== 'gameplay' || !(Number.isFinite(amount) && amount > 0)) return 0;
      const object = this.destructibleSceneryV130?.objects.find(item => item.id === id);
      if (!live(object) || object.plane !== 'gameplay') return 0;
      const damage = Math.min(object.hp, amount);
      object.hp -= damage; object.health = object.hp; object.impactCount++;
      object.flashClockV130 = 0.16;
      object.lastImpactV130 = { x: finite(contact.x, object.x + object.w / 2), y: finite(contact.y, object.y + object.h / 2) };
      this.destructibleSceneryV130.hits++;
      if (object.hp <= 0) {
        object.destroyed = true; this.destructibleSceneryV130.destroyed++;
        this.walls = list(this.walls).filter(item => item !== object);
      }
      this.emitSceneryFragmentsV130(object, source);
      this.onEvent?.({ type: object.destroyed ? 'scenery-destroyed-v130' : 'scenery-impact-v130', id: object.id,
        material: object.material, hp: object.hp, damage, x: object.lastImpactV130.x, y: object.lastImpactV130.y,
        message: object.destroyed ? (object.material === 'glass' ? 'Vitre brisée : passage dégagé.' : 'Obstacle détruit : passage dégagé.') : undefined });
      // Decorations do not spawn inventory, credits, objective progress or loot.
      return damage;
    }

    emitSceneryFragmentsV130(object, source) {
      this.destructibleSceneryFragmentsV130 ||= [];
      const material = DESTRUCTIBLE_SCENERY_MATERIALS_V130[object.material];
      const count = object.destroyed ? material.fragments : object.material === 'glass' ? 4 : 2;
      const reduced = this.accessibilityRuntime?.reducedMotion;
      const impact = object.lastImpactV130;
      const forward = Math.sign(finite(source.vx, source.owner?.facing || 1)) || 1;
      for (let i = 0; i < (reduced ? Math.min(count, 3) : count); i++) {
        const phase = i * 2.399 + object.impactCount * 1.17;
        const speed = 35 + (i * 23 % 120);
        const life = reduced ? 0.35 : object.destroyed ? 2.4 : 0.65;
        this.destructibleSceneryFragmentsV130.push({ x: clamp(impact.x, object.x, object.x + object.w),
          y: clamp(impact.y, object.y, object.y + object.h), vx: Math.cos(phase) * speed + forward * 28,
          vy: -40 - Math.abs(Math.sin(phase) * speed), life, maxLife: life, size: 2 + (i % 3), tint: material.tint });
      }
      if (this.destructibleSceneryFragmentsV130.length > DESTRUCTIBLE_SCENERY_LIMITS_V130.fragments)
        this.destructibleSceneryFragmentsV130.splice(0, this.destructibleSceneryFragmentsV130.length - DESTRUCTIBLE_SCENERY_LIMITS_V130.fragments);
    }

    updateBullets(delta) {
      if (!this.destructibleSceneryV130?.objects.some(live)) return super.updateBullets(delta);
      if (this.paused || !this.running || this.mission?.state !== 'active' || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88) return;
      const contacts = [];
      for (const bullet of list(this.bullets)) {
        if (bullet.hit || !(bullet.life > 0) || plane(bullet.owner || bullet) !== 'gameplay') continue;
        const dt = Math.min(Math.max(0, finite(delta)), bullet.life);
        const contact = firstProjectileObstacleV83(bullet, { x: finite(bullet.vx) * dt, y: finite(bullet.vy) * dt }, {
          walls: this.walls, doors: this.doors, platforms: this.platforms, bounds: this.missionLevelBounds });
        if (contact?.target?.sceneryV130) contacts.push({ bullet, contact });
      }
      // Production resolves enemies, armor, penetration, statuses and Fireball
      // effects against the intact pane. Only a committed terrain contact below
      // damages scenery; a bullet spent on an earlier enemy cannot damage it.
      const result = super.updateBullets(delta);
      for (const { bullet, contact } of contacts) if (bullet.hit && sameContact(bullet, contact))
        this.damageDestructibleSceneryV130(contact.target.id, finite(bullet.damage), bullet, contact);
      return result;
    }

    updateHostileProjectiles(delta) {
      if (!this.destructibleSceneryV130?.objects.some(object => live(object) && object.plane === 'gameplay')) return super.updateHostileProjectiles(delta);
      if (this.paused || !this.running || this.mission?.state !== 'active' || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88) return;
      for (const projectile of list(this.hostileProjectiles)) {
        if (projectile.hit || !(projectile.life > 0) || plane(projectile) !== 'gameplay') continue;
        const dt = Math.min(Math.max(0, finite(delta)), projectile.life);
        const displacement = { x: finite(projectile.vx) * dt, y: finite(projectile.vy) * dt };
        const sceneryContact = list(this.destructibleSceneryV130.objects).some(object => live(object) && object.plane === 'gameplay'
          && sweepProjectileAabbV83(projectile, displacement, object));
        if (!sceneryContact) continue;
        const obstacle = firstProjectileObstacleV83(projectile, displacement, {
          walls: [...list(this.walls), ...list(this.covers).filter(item => !item.destroyed)], doors: this.doors,
          platforms: this.platforms, bounds: this.missionLevelBounds });
        const actors = [this.player, this.coopEnabled ? this.coop : null, ...(this.activeSquadActors?.() || [])]
          .filter(actor => actor?.alive && !actor.inVehicle && !actor.downed && plane(actor) === 'gameplay');
        const placeables = list(this.placeablesV86?.instances).filter(item => item.onGround && item.health > 0 && ['deployed', 'spent'].includes(item.status));
        const impacts = [
          ...(obstacle ? [{ kind: 'terrain', target: obstacle.target, contact: obstacle }] : []),
          ...actors.map(actor => ({ kind: 'actor', target: actor, contact: sweepProjectileAabbV83(projectile, displacement, actor) })),
          ...placeables.map(item => ({ kind: 'placeable', target: item, contact: sweepProjectileAabbV83(projectile, displacement, item) })),
          ...(this.vehicle?.occupied && !this.vehicle.destroyed ? [{ kind: 'vehicle', target: this.vehicle,
            contact: sweepProjectileAabbV83(projectile, displacement, this.vehicle) }] : [])
        ].filter(item => item.contact).sort((a, b) => a.contact.t - b.contact.t || Number(a.kind !== 'terrain') - Number(b.kind !== 'terrain'));
        const first = impacts[0];
        if (!first) continue;
        projectile.sourceX = finite(projectile.sourceX, projectile.x); projectile.sourceY = finite(projectile.sourceY, projectile.y);
        projectile.hit = true; projectile.x = first.contact.x; projectile.y = first.contact.y;
        if (first.kind === 'terrain' && first.target?.sceneryV130)
          this.damageDestructibleSceneryV130(first.target.id, finite(projectile.damage), projectile, first.contact);
        else if (first.kind === 'actor') {
          if (first.target === this.player || first.target === this.coop) this.damagePlayer(first.target, projectile.damage, {
            source: projectile.acid ? 'acid' : 'projectile', attackKind: 'projectile', sourceX: projectile.sourceX, sourceY: projectile.sourceY,
            projectileV124: { vx: projectile.vx, vy: finite(projectile.vy) }
          });
          else this.damageSquadMember(first.target, projectile.damage, { source: projectile.acid ? 'acid-projectile' : 'projectile' });
        } else if (first.kind === 'placeable') this.damagePlaceableV86?.(first.target.instanceId, projectile.damage, projectile);
        else if (first.kind === 'vehicle') this.damageVehicle(projectile.damage, projectile.acid ? 'acid' : 'projectile');
        this.spawnImpact?.(projectile.x, projectile.y, projectile.acid ? '#a7c742' : '#e3b86c');
      }
      this.hostileProjectiles = list(this.hostileProjectiles).filter(projectile => !projectile.hit);
      return super.updateHostileProjectiles(delta);
    }

    sceneryMeleeTargetV130(actor, range = 92) {
      if (!actor || plane(actor) !== 'gameplay') return null;
      const origin = center(actor), facing = actor.facing < 0 ? -1 : 1;
      return list(this.destructibleSceneryV130?.objects).filter(object => live(object) && object.plane === 'gameplay')
        .map(object => {
          const point = { x: clamp(origin.x, object.x, object.x + object.w), y: clamp(origin.y, object.y, object.y + object.h) };
          const dx = point.x - origin.x, dy = point.y - origin.y;
          const contact = firstProjectileObstacleV83({ ...origin, w: 0, h: 0 }, { x: dx + facing * 0.01, y: dy }, {
            walls: [...list(this.walls), ...list(this.covers).filter(item => !item.destroyed)], doors: this.doors, platforms: this.platforms });
          return { object, point, dx, dy, distance: Math.hypot(dx, dy), contact };
        }).filter(item => item.dx * facing >= 0 && item.distance <= actor.w / 2 + range && Math.abs(item.dy) <= 48
          && item.contact?.target === item.object)
        .sort((a, b) => a.distance - b.distance)[0] || null;
    }

    performContextualMelee(actor) {
      if (!this.destructibleSceneryV130?.objects.some(live)) return super.performContextualMelee(actor);
      if (!actor?.alive || actor.downed || actor.inVehicle || actor.reloading || actor.meleeClock > 0 || this.paused
        || !this.running || this.mission?.state !== 'active' || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88) return false;
      const target = this.sceneryMeleeTargetV130(actor);
      if (!target) return super.performContextualMelee(actor);
      const origin = center(actor);
      const nearerEnemy = list(this.enemies).some(enemy => enemy.alive && plane(enemy) === plane(actor)
        && Math.abs(center(enemy).x - origin.x) <= 92 && Math.abs(center(enemy).y - origin.y) <= 96
        && Math.hypot(center(enemy).x - origin.x, center(enemy).y - origin.y) < target.distance
        && this.enemyMeleePathClearV64(actor, enemy));
      if (nearerEnemy) return super.performContextualMelee(actor);
      actor.meleeKind = actor.weaponMode === 'rifle' ? 'rifle-bash' : 'knife-attack';
      actor.meleeClock = actor.meleeKind === 'rifle-bash' ? 0.48 : 0.42;
      actor.fireClock = actor.meleeClock; actor.actionClock = actor.meleeClock;
      const damage = actor.meleeKind === 'rifle-bash' ? 34 : 22;
      this.damageDestructibleSceneryV130(target.object.id, damage, { owner: actor, kind: actor.meleeKind }, target.point);
      this.onEvent?.({ type: 'melee', attack: actor.meleeKind, target: target.object.id, damage, sceneryV130: true });
      return true;
    }

    meleeAttack(actor) {
      if (!this.destructibleSceneryV130?.objects.some(live)) return super.meleeAttack(actor);
      if (this.neuro?.active && actor === this.player && actor?.alive && actor.fireClock <= 0 && this.neuro.signal >= 4
        && this.running && !this.paused && this.mission?.state === 'active') {
        const target = this.sceneryMeleeTargetV130(actor, 94 + Math.min(50, this.neuro.signalRange * 0.2));
        if (target) {
          actor.fireClock = 0.48; actor.actionClock = 0.34; this.neuro.signal = Math.max(0, this.neuro.signal - 4);
          this.damageDestructibleSceneryV130(target.object.id, finite(this.neuro.meleeDamage, 22), { owner: actor, kind: 'neuro-melee' }, target.point);
          this.onEvent?.({ type: 'neuro-attack', hits: 1, signal: this.neuro.signal, sceneryV130: true });
          return true;
        }
      }
      // The legacy Neuro strike is an area melee. Preserve its cost/timing, but
      // keep hidden actors behind intact glass, panels and walls out of its list.
      const enemies = this.enemies;
      this.enemies = list(enemies).filter(enemy => plane(enemy) === plane(actor) && this.enemyMeleePathClearV64(actor, enemy));
      try { return super.meleeAttack(actor); } finally { this.enemies = enemies; }
    }

    enemyMeleePathClearV64(actor, target) {
      if (plane(actor) !== plane(target)) return false;
      return super.enemyMeleePathClearV64(actor, target);
    }

    applyEnemyDamage(enemy, amount, source = {}) {
      if (this.destructibleSceneryV130?.objects.length) {
        if (plane(enemy) !== plane(source.owner || source)) return 0;
        if (source.kind === 'explosive-splash' && Number.isFinite(source.x) && Number.isFinite(source.y)) {
          const origin = { x: source.x + finite(source.w) / 2, y: source.y + finite(source.h) / 2, w: 0, h: 0 };
          const destination = { x: clamp(origin.x, enemy.x, enemy.x + enemy.w), y: clamp(origin.y, enemy.y, enemy.y + enemy.h) };
          if (firstProjectileObstacleV83(origin, { x: destination.x - origin.x, y: destination.y - origin.y }, {
            walls: [...list(this.walls), ...list(this.covers).filter(item => !item.destroyed)], doors: this.doors, platforms: this.platforms })) return 0;
        }
      }
      return super.applyEnemyDamage(enemy, amount, source);
    }

    resolveSceneryHorizontalV130(entity, previousX) {
      if (!entity || plane(entity) !== 'gameplay' || !Number.isFinite(previousX)) return;
      const displacement = { x: entity.x - previousX, y: 0 };
      if (!displacement.x) return;
      const first = list(this.destructibleSceneryV130?.objects).filter(object => live(object) && object.plane === 'gameplay')
        .map(object => sweepProjectileAabbV83({ ...entity, x: previousX }, displacement, object)).filter(Boolean)
        .sort((a, b) => a.t - b.t)[0];
      if (first && first.normalX) { entity.x = first.x; entity.vx = 0; }
    }

    resolveHorizontal(entity, previousX) {
      const result = super.resolveHorizontal(entity, previousX);
      this.resolveSceneryHorizontalV130(entity, previousX);
      return result;
    }

    resolveVehicleHorizontal(previousX) {
      const result = super.resolveVehicleHorizontal(previousX);
      this.resolveSceneryHorizontalV130(this.vehicle, previousX);
      return result;
    }

    resolveVertical(entity, previousBottom) {
      const result = super.resolveVertical(entity, previousBottom);
      if (!entity || plane(entity) !== 'gameplay' || !Number.isFinite(previousBottom)) return result;
      const previousY = previousBottom - entity.h, displacement = { x: 0, y: entity.y - previousY };
      if (!displacement.y) return result;
      const first = list(this.destructibleSceneryV130?.objects).filter(object => live(object) && object.plane === 'gameplay')
        .map(object => sweepProjectileAabbV83({ ...entity, y: previousY }, displacement, object)).filter(Boolean)
        .sort((a, b) => a.t - b.t)[0];
      if (first?.normalY) { entity.y = first.y; entity.vy = 0; if (first.normalY < 0) entity.grounded = true; }
      return result;
    }

    advanceDestructibleSceneryV130(delta) {
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88 || this.mission?.state !== 'active') return;
      const dt = clamp(finite(delta), 0, 0.1);
      for (const object of list(this.destructibleSceneryV130?.objects)) object.flashClockV130 = Math.max(0, object.flashClockV130 - dt);
      for (const fragment of list(this.destructibleSceneryFragmentsV130)) {
        fragment.life -= dt; fragment.vy += 380 * dt; fragment.x += fragment.vx * dt; fragment.y += fragment.vy * dt;
      }
      this.destructibleSceneryFragmentsV130 = list(this.destructibleSceneryFragmentsV130).filter(fragment => fragment.life > 0);
    }

    update(delta) {
      const result = super.update(delta);
      this.advanceDestructibleSceneryV130(delta);
      return result;
    }

    drawWall(ctx, wall) {
      if (wall?.sceneryV130) return drawScenery(ctx, wall);
      return super.drawWall(ctx, wall);
    }

    drawWorld(ctx) {
      for (const object of list(this.destructibleSceneryV130?.objects)) if (object.plane !== 'gameplay') drawScenery(ctx, object);
      super.drawWorld(ctx);
      for (const object of list(this.destructibleSceneryV130?.objects)) if (object.destroyed && object.plane === 'gameplay') drawScenery(ctx, object);
      ctx.save();
      for (const fragment of list(this.destructibleSceneryFragmentsV130)) {
        ctx.globalAlpha = clamp(fragment.life / Math.min(0.4, fragment.maxLife), 0, 1);
        ctx.fillStyle = fragment.tint; ctx.fillRect(fragment.x, fragment.y, fragment.size, Math.max(1, fragment.size / 2));
      }
      ctx.restore();
    }

    captureResumeState() {
      const result = super.captureResumeState();
      const state = this.destructibleSceneryV130;
      if (!state?.objects.length) return result;
      return { ...result, destructibleSceneryV130: { schema: 130, signature: state.signature,
        objects: state.objects.map(object => ({ id: object.id, hp: object.hp, destroyed: object.destroyed, impactCount: object.impactCount })) } };
    }

    restoreDestructibleSceneryV130(raw) {
      const state = this.destructibleSceneryV130;
      if (!state || raw?.schema !== 130 || raw.signature !== state.signature || !Array.isArray(raw.objects)) return false;
      const saved = new Map(raw.objects.slice(0, DESTRUCTIBLE_SCENERY_LIMITS_V130.objects).filter(object => object && typeof object.id === 'string').map(object => [object.id, object]));
      for (const object of state.objects) {
        const source = saved.get(object.id);
        if (!source || !Number.isFinite(source.hp)) continue;
        object.hp = source.destroyed === true ? 0 : clamp(source.hp, 0, object.maxHp);
        object.health = object.hp; object.destroyed = object.hp <= 0;
        object.impactCount = clamp(Math.floor(finite(source.impactCount)), 0, 999999);
        object.flashClockV130 = 0; object.lastImpactV130 = null;
      }
      state.hits = state.objects.reduce((sum, object) => sum + object.impactCount, 0);
      state.destroyed = state.objects.filter(object => object.destroyed).length;
      this.walls = list(this.walls).filter(object => !object.sceneryV130);
      this.walls.push(...state.objects.filter(object => live(object) && object.plane === 'gameplay'));
      this.destructibleSceneryFragmentsV130 = [];
      return true;
    }

    applyResumeState(raw) {
      const result = super.applyResumeState(raw);
      if (!result?.applied) return result;
      if (this.destructibleSceneryStartingV130) {
        this.pendingDestructibleSceneryResumeV130 = raw?.destructibleSceneryV130;
        return result;
      }
      return { ...result, destructibleSceneryRestoredV130: this.restoreDestructibleSceneryV130(raw?.destructibleSceneryV130) };
    }

    restartFromCheckpoint() {
      const result = super.restartFromCheckpoint();
      if (result) this.destructibleSceneryFragmentsV130 = [];
      return result;
    }

    stop(...args) {
      const result = super.stop(...args);
      this.destructibleSceneryFragmentsV130 = [];
      return result;
    }

    getDestructibleScenerySnapshotV130() {
      const state = this.destructibleSceneryV130;
      const objects = list(state?.objects);
      return { schema: 130, ready: Boolean(state && objects.length), enabled: objects.length > 0,
        signature: state?.signature || null, counts: { objects: objects.length, intact: objects.filter(live).length,
          destroyed: objects.filter(object => object.destroyed).length, fragments: list(this.destructibleSceneryFragmentsV130).length },
        hits: finite(state?.hits), materials: [...new Set(objects.map(object => object.material))],
        objects: objects.map(object => ({ id: object.id, x: object.x, y: object.y, w: object.w, h: object.h,
          material: object.material, plane: object.plane, hp: object.hp, maxHp: object.maxHp,
          destroyed: object.destroyed, opaque: object.opaque, impactCount: object.impactCount })) };
    }

    getSnapshot() { return { ...super.getSnapshot(), destructibleSceneryV130: this.getDestructibleScenerySnapshotV130() }; }
  };
}
