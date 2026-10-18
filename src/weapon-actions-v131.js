import { WEAPONS } from './content.js';
import { resolveWeaponMechanicsV122 } from './weapon-mechanics-weapons-v122.js';
import { resolveWeaponActionProfileV130 } from './weapon-actions-v130.js';
import { resolveWeaponReferenceCoverageV122 } from './weapon-reference-coverage-v122.js';
import { collectProjectileCollisionsV83, firstProjectileObstacleV83 } from './projectile-collision-v83.js';
import { consumeTacticalReloadBonusV77 } from './tactical-reload-v77.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const list = value => Array.isArray(value) ? value : [];
const center = box => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
const active = actor => actor?.alive && !actor.dormant && !actor.ventTransit
  && (!actor.rearEntryV130 || actor.rearEntryV130.phase === 'active')
  && (actor.planeV130 || actor.plane || 'gameplay') === 'gameplay';
const running = engine => engine.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65
  && !engine.userCasteLoadingV88 && engine.mission?.state === 'active';
const actors = engine => [engine.player, engine.coop, ...list(engine.squadActors)].filter(Boolean);
const ownerId = (engine, actor) => actor === engine.player ? 'player' : actor === engine.coop ? 'coop'
  : actor?.squadMember && actor.crewId ? `squad:${actor.crewId}` : null;
const ownerById = (engine, id) => actors(engine).find(actor => ownerId(engine, actor) === id) || null;
const world = engine => ({ walls: [...list(engine.walls), ...list(engine.covers)],
  doors: engine.closedDoorColliders?.() || engine.doors || [], platforms: [...new Set([...list(engine.platforms), ...list(engine.lifts)])],
  bounds: engine.missionLevelBounds || { width: 6200, height: 1080 } });
const STEP = 1 / 120;
const LIMIT = 192;
const STATUS = Object.freeze({ burn: { duration: 2.5, damage: .12 }, corroded: { duration: 3, damage: .08 },
  contaminated: { duration: 3, damage: .07, slow: .7 }, frozen: { duration: 1.8, slow: .45 },
  stun: { duration: 1.1, stagger: 1.1 }, disoriented: { duration: 1.4, stagger: .45, slow: .65 },
  ionized: { duration: 1.2 } });

/** Exact released IDs only. Counts, cadence, range, heat and status tuning are
 * original Tantalus gameplay, never certified franchise specifications. The
 * reference receipt distinguishes documented mechanisms from category-based
 * adaptation. Existing Fireball V122 and contact/thrown V130 actions opt out.
 */
export const WEAPON_ACTION_PROFILES_V131 = Object.freeze(WEAPONS.flatMap(weapon => {
  if (resolveWeaponMechanicsV122(weapon) || resolveWeaponActionProfileV130(weapon)) return [];
  const name = weapon.name.split(' — ')[0], tags = Number(weapon.id.match(/^weapon-(\d+)/)?.[1]) > 146 ? weapon.tags || [] : [];
  let action;
  if (name === 'M37A2 Pump Shotgun' || /shotgun|scattergun/i.test(name) || tags.includes('shotgun')) action = {
    kind: 'scatter', pellets: 6, spread: .15, speed: 860, range: 620, life: .8,
    interval: Math.max(1 / weapon.fireRate, name === 'M37A2 Pump Shotgun' || name === 'M51 Breaching Scattergun' ? .45 : .2) };
  else if (weapon.sourceMechanism === 'four-piece-splintering-sabot') action = {
    kind: 'scatter', pellets: 4, spread: .065, speed: 900, range: 800, life: 1, interval: 1 / weapon.fireRate };
  else if (weapon.family === 'flame') action = { kind: 'stream', range: 190, spread: .12, interval: .1,
    heat: .11, cooling: .25, status: 'burn', resource: 'fuel' };
  else if (weapon.family === 'explosive') action = /rocket|rpg|sadar/i.test(name)
    ? { kind: 'rocket', speed: 650, gravity: 0, range: 1700, life: 3, radius: 150, interval: Math.max(.55, 1 / weapon.fireRate) }
    : { kind: 'launcher', speed: 470, gravity: 260, range: 1500, life: 3.5,
      radius: weapon.sourceMechanism === 'small-area-impact-grenades' ? 90 : 130, interval: Math.max(.3, 1 / weapon.fireRate) };
  else if (name === 'Compound Bow') action = { kind: 'arrow', speed: 560, gravity: 280, range: 1300, life: 3,
    charge: .35, interval: .4, recoverable: true, resource: 'arrows' };
  else if (['Bolt Gun', 'Harpoon Gun', 'Foundry Nailgun', 'Sonic Harpoon'].includes(name)) action = {
    kind: 'bolt', speed: name === 'Foundry Nailgun' ? 760 : 580, gravity: name === 'Sonic Harpoon' ? 0 : 100,
    range: 1400, life: 2.7, interval: Math.max(.25, 1 / weapon.fireRate), recoverable: name === 'Harpoon Gun',
    resource: name === 'Harpoon Gun' ? 'harpoons' : 'bolts', status: name === 'Sonic Harpoon' ? 'disoriented' : null };
  else if (weapon.family === 'energy') action = tags.includes('laser') || /laser/i.test(name)
    ? { kind: 'laser', range: 1000, interval: 1 / weapon.fireRate, heat: .22, cooling: .28, status: 'ionized', resource: 'cells' }
    : { kind: 'plasma', speed: 620, gravity: 0, range: 1400, life: 2.4, interval: 1 / weapon.fireRate,
      heat: tags.includes('charged') ? .38 : .13, cooling: .28, charge: tags.includes('charged') ? .55 : 0,
      status: 'ionized', resource: 'cells' };
  else if (weapon.family === 'electric') action = { kind: 'electric', speed: 720, gravity: 0, range: 950, life: 1.4,
    interval: Math.max(.2, 1 / weapon.fireRate), heat: .13, cooling: .3, status: 'stun', resource: 'cells' };
  else if (['acid', 'cryo', 'chemical'].includes(weapon.family)) action = { kind: 'fluid', speed: 350, gravity: 120,
    range: 440, life: 1.3, interval: Math.max(.16, 1 / weapon.fireRate), resource: 'canister',
    status: { acid: 'corroded', cryo: 'frozen', chemical: 'contaminated' }[weapon.family] };
  else if (tags.includes('burst') || weapon.sourceMechanism === 'repeating-three-round-burst') action = {
    kind: 'burst', speed: 890, gravity: 0, range: 1500, life: 1.8, rounds: 3, spacing: .07,
    interval: Math.max(.32, 1 / weapon.fireRate) };
  else if (tags.includes('rotary')) action = { kind: 'rotary', speed: 950, gravity: 0, range: 1500, life: 1.7,
    charge: .22, interval: 1 / weapon.fireRate, heat: .055, cooling: .22 };
  else if (tags.includes('flechette')) action = { kind: 'flechette', speed: 1100, gravity: 0, range: 1800, life: 1.7,
    interval: 1 / weapon.fireRate, maxHits: 3 };
  if (!action) return [];
  const receipt = resolveWeaponReferenceCoverageV122(weapon)?.geometry?.reference;
  return [Object.freeze({ schema: 131, weaponId: weapon.id, name: weapon.name, family: weapon.family, damage: weapon.damage,
    resource: 'cartridges', gravity: 0, maxHits: 1, ...action,
    evidence: Object.freeze({ mechanism: weapon.sourceMechanism || 'catalogue-category-game-adaptation',
      status: weapon.sourceMechanism ? 'documented-mechanism-original-game-tuning' : receipt?.status === 'project-original'
        ? 'project-original-game-mechanism' : 'category-adaptation-not-certified-canon',
      url: weapon.sourceMechanismUrl || weapon.sourceUrl || receipt?.url || null, canonExact: false }) })];
}));
const profiles = new Map(WEAPON_ACTION_PROFILES_V131.map(profile => [profile.weaponId, profile]));
export const resolveWeaponActionProfileV131 = descriptor => profiles.get(typeof descriptor === 'string' ? descriptor : descriptor?.id) || null;

export function withWeaponActionsV131(Base) {
  if (Base.weaponActionsRuntimeV131) return Base;
  return class WeaponActionsRuntimeV131 extends Base {
    static weaponActionsRuntimeV131 = true;

    start(options = {}) {
      this.weaponProjectilesV131 = []; this.weaponBeamsV131 = []; this.recoverableWeaponsV131 = [];
      this.weaponCyclesV131 = new Map(); this.weaponThermalV131 = new Map(); this.weaponStatusesV131 = new Map();
      this.weaponSerialV131 = 0;
      return super.start(options);
    }

    weaponActionProfileV131(actor = this.player) {
      return !actor || actor.inVehicle || this.neuro?.active && actor === this.player ? null
        : resolveWeaponActionProfileV131(this.weaponDescriptorV124?.(actor));
    }

    allowedWeaponV131(actor, cycle = false) {
      return Boolean(running(this) && active(actor) && this.canPerformGameplayAction(actor) && !actor.climbing && !actor.inVehicle
        && !this.isVehicleAccessLockedV59?.(actor) && !actor.vehicleAccessPhase && !actor.reloading
        && !(actor.meleeClock > 0) && !(actor.toolUseClock > 0) && !(actor.interactionClock > 0)
        && !(actor.grappledClock > 0) && !(actor.stunClock > 0) && (cycle || !(actor.fireClock > 0)));
    }

    thermalWeaponV131(actor, profile) {
      this.weaponThermalV131 ||= new Map();
      let state = this.weaponThermalV131.get(actor);
      if (!state) { state = new Map(); this.weaponThermalV131.set(actor, state); }
      if (!state.has(profile.weaponId)) state.set(profile.weaponId, { heat: 0, overheated: false, warm: 0 });
      return state.get(profile.weaponId);
    }

    fire(actor = this.player) {
      const profile = this.weaponActionProfileV131(actor);
      if (!profile) return super.fire(actor);
      if (!this.allowedWeaponV131(actor) || this.weaponCyclesV131?.has(actor)) return false;
      const aim = this.resolvePlayerCombatAimV83(actor);
      // The native trigger becomes a close defensive strike only when the
      // operator has requested no explicit aim; it spends no firearm resource.
      if (!aim.active && !actor.aimingV124 && this.performContextualMelee(actor)) return true;
      const thermal = this.thermalWeaponV131(actor, profile);
      if (thermal.overheated) return false;
      if (!(actor.ammo > 0 || profile.resource === 'arrows' && actor.ammoReserve > 0
        || profile.resource === 'harpoons' && actor.ammoReserve > 0)) { this.reload(actor); return false; }
      if (profile.charge && (profile.kind !== 'rotary' || thermal.warm <= 0)) {
        actor.fireClock = profile.charge;
        this.weaponCyclesV131.set(actor, { weaponId: profile.weaponId, kind: 'charge', remaining: profile.charge,
          rounds: 1, aim: { x: aim.x, y: aim.y }, startingHealth: actor.health });
        this.onEvent?.({ type: 'weapon-charge-v131', weaponId: profile.weaponId, duration: profile.charge });
        return true;
      }
      const accepted = this.commitWeaponRoundV131(actor, profile, aim);
      if (accepted && profile.kind === 'burst') this.weaponCyclesV131.set(actor, {
        weaponId: profile.weaponId, kind: 'burst', remaining: profile.spacing, rounds: profile.rounds - 1,
        aim: { x: aim.x, y: aim.y }, startingHealth: actor.health });
      return accepted;
    }

    reload(actor = this.player) {
      const profile = this.weaponActionProfileV131(actor);
      if (profile?.resource === 'arrows' || profile?.resource === 'harpoons') return false;
      if (profile) this.weaponCyclesV131?.delete(actor);
      return super.reload(actor);
    }

    fireCrewWeaponV85(actor) {
      const profile = resolveWeaponActionProfileV131(actor?.crewV85?.weaponRuntime);
      if (!profile) return super.fireCrewWeaponV85(actor);
      if (!this.allowedWeaponV131(actor) || this.weaponCyclesV131?.has(actor)) return false;
      const target = this.closestEnemy(actor, profile.range);
      if (!target || !active(target)) return false;
      const from = center(actor), to = center(target), distance = Math.hypot(to.x - from.x, to.y - from.y) || 1;
      const aim = { x: (to.x - from.x) / distance, y: (to.y - from.y) / distance };
      actor.facing = aim.x < 0 ? -1 : 1;
      const thermal = this.thermalWeaponV131(actor, profile);
      const bag = ['arrows', 'harpoons'].includes(profile.resource);
      if (thermal.overheated || !(actor.ammo > 0 || bag && actor.ammoReserve > 0)) return false;
      if (profile.charge && (profile.kind !== 'rotary' || thermal.warm <= 0)) {
        actor.fireClock = profile.charge;
        this.weaponCyclesV131.set(actor, { weaponId: profile.weaponId, kind: 'charge', remaining: profile.charge,
          rounds: 1, aim, startingHealth: actor.health });
        return true;
      }
      const accepted = this.commitWeaponRoundV131(actor, profile, aim);
      if (accepted && profile.rounds) this.weaponCyclesV131.set(actor, { weaponId: profile.weaponId, kind: 'burst',
        remaining: profile.spacing, rounds: profile.rounds - 1, aim, startingHealth: actor.health });
      return accepted;
    }

    commitWeaponRoundV131(actor, profile, aim) {
      const bag = profile.resource === 'arrows' || profile.resource === 'harpoons';
      const count = profile.pellets || 1;
      if (!this.allowedWeaponV131(actor, true) || this.weaponProjectilesV131.length + count > LIMIT
        || !(actor.ammo > 0 || bag && actor.ammoReserve > 0)) return false;
      const thermal = this.thermalWeaponV131(actor, profile);
      if (thermal.overheated) return false;
      if (actor.ammo > 0) actor.ammo -= 1; else actor.ammoReserve -= 1;
      actor.shots = finite(actor.shots) + 1;
      actor.fireClock = profile.interval; actor.actionClock = .22; actor.v52FireClock = .34;
      if (actor.squadMember) actor.actions = finite(actor.actions) + 1;
      this.beginPlayerWeaponShotV125?.(actor);
      const muzzle = this.resolvePlayerMuzzleV124(actor, aim), angle = Math.atan2(aim.y, aim.x);
      const bonus = bag ? 1 : consumeTacticalReloadBonusV77(actor, this.reloadWeaponV77(actor));
      const boost = finite(actor.fieldWeaponBoostShotsV124) > 0 ? 1.28 : 1;
      const damage = profile.damage * bonus * boost;
      if (actor.fieldWeaponBoostShotsV124 > 0) {
        actor.fieldWeaponBoostShotsV124 -= 1; this.syncFieldSupportV124?.();
      }
      if (profile.heat) {
        thermal.heat = clamp(thermal.heat + profile.heat, 0, 1); thermal.overheated = thermal.heat >= 1;
        if (thermal.overheated) this.onEvent?.({ type: 'weapon-overheated-v131', weaponId: profile.weaponId });
      }
      if (profile.kind === 'rotary') thermal.warm = .8;
      let event;
      if (profile.kind === 'stream' || profile.kind === 'laser') {
        event = { x: muzzle.x, y: muzzle.y, sourceX: muzzle.x, sourceY: muzzle.y,
          vx: aim.x, vy: aim.y, angleRadians: angle, owner: actor, damage, weaponId: profile.weaponId };
        this.projectBeamV131(actor, profile, muzzle, aim, damage);
      } else {
        for (let index = 0; index < count; index++) {
          const offset = count > 1 ? (index / (count - 1) - .5) * profile.spread * 2 : 0;
          const direction = { x: Math.cos(angle + offset), y: Math.sin(angle + offset) };
          const width = ['rocket', 'launcher', 'plasma', 'fluid', 'electric'].includes(profile.kind) ? 10 : 14;
          const height = width === 10 ? 10 : 3;
          const origin = { x: muzzle.pivotX - width / 2, y: muzzle.pivotY - height / 2, w: width, h: height };
          const displacement = { x: muzzle.x - muzzle.pivotX, y: muzzle.y - muzzle.pivotY };
          const contact = firstProjectileObstacleV83(origin, displacement, world(this));
          const position = contact ? { x: contact.x + contact.normalX * .01, y: contact.y + contact.normalY * .01 }
            : { x: muzzle.x - width / 2, y: muzzle.y - height / 2 };
          const projectile = { schema: 131, id: `weapon-action-v131:${++this.weaponSerialV131}`, weaponId: profile.weaponId,
            kind: profile.kind, family: profile.family, status: profile.status || null,
            owner: actor, ...position, w: width, h: height, sourceX: muzzle.x, sourceY: muzzle.y,
            vx: direction.x * profile.speed, vy: direction.y * profile.speed, angleRadians: angle + offset,
            age: 0, remaining: profile.life, travelled: 0, damage: damage / count, multiplier: bonus * boost,
            hitEnemyIds: new Set(), hits: 0 };
          this.weaponProjectilesV131.push(projectile); event ||= projectile;
        }
      }
      this.emitCommittedWeaponShotV124?.(actor, event, this.weaponDescriptorV124(actor));
      this.emitEnemyNoiseV130?.(actor, profile.resource === 'arrows' ? 120 : profile.kind === 'stream' ? 400 : 780, profile.kind);
      if (this.penetrationTelemetry) {
        this.penetrationTelemetry.shots += 1;
        this.penetrationTelemetry.familyEffects[profile.family] = finite(this.penetrationTelemetry.familyEffects[profile.family]) + 1;
      }
      this.audio?.shot?.();
      this.onEvent?.({ type: 'shot', weapon: profile.kind, weaponId: profile.weaponId, pellets: count, coop: Boolean(actor.coop) });
      return true;
    }

    projectBeamV131(actor, profile, muzzle, aim, damage) {
      const angle = Math.atan2(aim.y, aim.x);
      const barrel = { x: muzzle.pivotX, y: muzzle.pivotY, w: 1, h: 1 };
      const obstruction = firstProjectileObstacleV83(barrel, { x: muzzle.x - muzzle.pivotX, y: muzzle.y - muzzle.pivotY }, world(this));
      const origin = obstruction ? { x: obstruction.x + obstruction.normalX * .01, y: obstruction.y + obstruction.normalY * .01, w: 1, h: 1 }
        : { x: muzzle.x, y: muzzle.y, w: 1, h: 1 };
      const rays = profile.kind === 'stream' ? [-profile.spread, -profile.spread / 2, 0, profile.spread / 2, profile.spread] : [0];
      const contacts = new Map(), segments = [];
      for (const offset of rays) {
        const direction = { x: Math.cos(angle + offset), y: Math.sin(angle + offset) };
        const displacement = { x: direction.x * profile.range, y: direction.y * profile.range };
        const hits = collectProjectileCollisionsV83(origin, displacement, { ...world(this), enemies: list(this.enemies).filter(active) });
        const first = hits[0];
        if (first?.kind === 'enemy' || first?.target?.sceneryV130) contacts.set(first.target, first);
        const travel = first ? first.t : 1;
        segments.push({ x: origin.x, y: origin.y, endX: origin.x + displacement.x * travel, endY: origin.y + displacement.y * travel });
      }
      // Resolve cone contacts against the intact scene before any pane breaks.
      for (const [target, contact] of contacts) {
        const source = { owner: actor, family: profile.family, kind: profile.kind, weaponId: profile.weaponId,
          x: contact.x, y: contact.y, damage };
        if (target.sceneryV130) this.damageDestructibleSceneryV130(target.id, damage, source, contact);
        else if (this.applyEnemyDamage(target, damage, source) > 0) this.applyWeaponStatusV131(target, profile, actor);
      }
      this.weaponBeamsV131.push({ weaponId: profile.weaponId, kind: profile.kind, segments, remaining: profile.kind === 'stream' ? .12 : .08 });
      this.weaponBeamsV131 = this.weaponBeamsV131.slice(-32);
    }

    updateBullets(delta) {
      if (!running(this)) return;
      const result = super.updateBullets(delta);
      const advance = () => this.advanceWeaponsV131(delta);
      if (this.withEnemySpriteCollisionGeometry) this.withEnemySpriteCollisionGeometry(advance); else advance();
      return result;
    }

    advanceWeaponsV131(delta) {
      if (!running(this)) return;
      let remaining = Math.max(0, finite(delta));
      while (remaining > 1e-9) {
        const step = Math.min(remaining, STEP); remaining -= step;
        for (const [actor, state] of this.weaponThermalV131 || []) for (const [id, thermal] of state) {
          const profile = profiles.get(id); if (!profile) continue;
          thermal.heat = Math.max(0, thermal.heat - finite(profile.cooling) * step);
          thermal.warm = Math.max(0, thermal.warm - step);
          if (thermal.overheated && thermal.heat <= .35) thermal.overheated = false;
        }
        for (const [actor, cycle] of this.weaponCyclesV131 || []) {
          const profile = this.weaponActionProfileV131(actor);
          if (profile?.weaponId !== cycle.weaponId || !this.allowedWeaponV131(actor, true) || actor.health < cycle.startingHealth) {
            this.weaponCyclesV131.delete(actor); continue;
          }
          cycle.remaining -= step;
          if (cycle.remaining > 1e-8) continue;
          if (!this.commitWeaponRoundV131(actor, profile, cycle.aim)) { this.weaponCyclesV131.delete(actor); continue; }
          if (--cycle.rounds <= 0) this.weaponCyclesV131.delete(actor); else cycle.remaining += profile.spacing;
        }
        for (const projectile of this.weaponProjectilesV131 || []) if (!projectile.resolved) this.advanceProjectileV131(projectile, step);
        for (const beam of this.weaponBeamsV131 || []) beam.remaining -= step;
        for (const recoverable of this.recoverableWeaponsV131 || []) recoverable.remaining -= step;
        this.advanceStatusesV131(step);
      }
      this.weaponProjectilesV131 = this.weaponProjectilesV131.filter(projectile => !projectile.resolved);
      this.weaponBeamsV131 = this.weaponBeamsV131.filter(beam => beam.remaining > 0);
      this.recoverableWeaponsV131 = this.recoverableWeaponsV131.filter(item => item.remaining > 0);
    }

    advanceProjectileV131(projectile, delta) {
      const profile = profiles.get(projectile.weaponId);
      if (!profile) { projectile.resolved = true; return; }
      const step = Math.min(delta, projectile.remaining);
      const displacement = { x: projectile.vx * step, y: projectile.vy * step + profile.gravity * step * step / 2 };
      const destination = { x: projectile.x + displacement.x, y: projectile.y + displacement.y };
      const collisions = collectProjectileCollisionsV83(projectile, displacement, { ...world(this), enemies: list(this.enemies).filter(active) });
      for (const contact of collisions) {
        if (projectile.resolved) break;
        projectile.x = contact.x; projectile.y = contact.y;
        if (profile.kind === 'rocket' || profile.kind === 'launcher') {
          this.explodeGrenadeV130(projectile, { ...profile, radius: profile.radius });
          this.onEvent?.({ type: 'launcher-impact-v131', weaponId: profile.weaponId, surface: contact.kind });
          break;
        }
        if (contact.kind !== 'enemy') {
          if (contact.target?.sceneryV130) this.damageDestructibleSceneryV130(contact.target.id, projectile.damage, projectile, contact);
          if (profile.recoverable && contact.kind !== 'bounds') {
            this.recoverableWeaponsV131.push({ id: projectile.id, weaponId: profile.weaponId, owner: projectile.owner,
              x: projectile.x, y: projectile.y, remaining: 30 });
            this.recoverableWeaponsV131 = this.recoverableWeaponsV131.slice(-32);
          }
          projectile.resolved = true; break;
        }
        const target = contact.target;
        if (!active(target) || projectile.hitEnemyIds.has(target.id)) continue;
        const falloff = profile.kind === 'scatter' ? 1 - .65 * clamp(projectile.travelled / profile.range, 0, 1) : 1;
        const bypass = ['plasma', 'laser', 'electric', 'fluid'].includes(profile.kind) ? .4 : .1;
        const damage = projectile.damage * falloff + finite(target.armor) * .35 * bypass;
        if (this.applyEnemyDamage(target, damage, projectile) > 0) this.applyWeaponStatusV131(target, profile, projectile.owner);
        projectile.hitEnemyIds.add(target.id); projectile.hits++;
        if (this.penetrationTelemetry) this.penetrationTelemetry.hits += 1;
        if (projectile.hits >= profile.maxHits) projectile.resolved = true;
      }
      if (!projectile.resolved) Object.assign(projectile, destination);
      projectile.vy += profile.gravity * step;
      projectile.travelled += Math.hypot(displacement.x, displacement.y); projectile.age += step; projectile.remaining -= step;
      if (projectile.remaining <= 1e-9 || projectile.travelled >= profile.range) projectile.resolved = true;
    }

    applyWeaponStatusV131(enemy, profile, owner) {
      const tuning = STATUS[profile.status];
      if (!tuning || !active(enemy)) return;
      const previous = this.weaponStatusesV131.get(enemy);
      this.weaponStatusesV131.set(enemy, { weaponId: profile.weaponId, owner, status: profile.status,
        remaining: tuning.duration, tick: previous?.status === profile.status ? previous.tick : .25 });
      enemy.statusEffect = profile.status; enemy.statusClock = tuning.duration;
      if (tuning.stagger || profile.status === 'frozen') enemy.staggerClock = Math.max(finite(enemy.staggerClock), tuning.stagger || .45);
      this.onEvent?.({ type: 'weapon-status-v131', weaponId: profile.weaponId, targetId: enemy.id, status: profile.status });
    }

    advanceStatusesV131(delta) {
      for (const [enemy, status] of this.weaponStatusesV131 || []) {
        const profile = profiles.get(status.weaponId), tuning = STATUS[status.status];
        if (!enemy.alive || !profile || !tuning) { this.weaponStatusesV131.delete(enemy); continue; }
        const step = Math.min(delta, status.remaining); status.remaining -= step; status.tick -= step;
        enemy.statusClock = status.remaining;
        if (tuning.damage && status.tick <= 1e-8 && active(enemy)) {
          status.tick += .25;
          this.applyEnemyDamage(enemy, profile.damage * tuning.damage / 4, { owner: status.owner, family: profile.family,
            kind: `weapon-status-${status.status}`, status: status.status, weaponId: profile.weaponId, x: enemy.x, y: enemy.y });
        }
        if (status.remaining <= 1e-9) {
          if (enemy.statusEffect === status.status) { enemy.statusEffect = null; enemy.statusClock = 0; }
          this.weaponStatusesV131.delete(enemy);
        }
      }
    }

    updateEnemy(enemy, delta) {
      const status = this.weaponStatusesV131?.get(enemy), tuning = status && STATUS[status.status], speed = enemy?.speed;
      const stagger = tuning?.stagger || (status?.status === 'frozen' ? .45 : 0);
      if (stagger) enemy.staggerClock = Math.max(finite(enemy.staggerClock), stagger - (tuning.duration - status.remaining));
      if (tuning?.slow) enemy.speed = finite(speed) * tuning.slow;
      try { return super.updateEnemy(enemy, delta); } finally { if (tuning?.slow) enemy.speed = speed; }
    }

    applyEnemyDamage(enemy, amount, source = {}) {
      const corroded = this.weaponStatusesV131?.get(enemy)?.status === 'corroded', armor = enemy?.armor;
      if (corroded) enemy.armor = finite(armor) * .6;
      try { return super.applyEnemyDamage(enemy, amount, source); } finally { if (corroded) enemy.armor = armor; }
    }

    // Read-only admission query shared with interaction layers above this one.
    // Recovery still happens only in interact(), after native priorities run.
    recoverableWeaponIndexV131(actor = this.player) {
      if (!this.canPerformGameplayAction(actor)) return -1;
      const profile = this.weaponActionProfileV131(actor);
      return (this.recoverableWeaponsV131 || []).findIndex(item => item.weaponId === profile?.weaponId && item.owner === actor
        && Math.hypot(item.x - actor.x - actor.w / 2, item.y - actor.y - actor.h / 2) <= 72
        && !firstProjectileObstacleV83({ ...center(actor), w: 0, h: 0 }, { x: item.x - actor.x - actor.w / 2,
          y: item.y - actor.y - actor.h / 2 }, world(this)));
    }

    interact(actor = this.player) {
      const result = super.interact(actor);
      if (result) return result;
      const index = this.recoverableWeaponIndexV131(actor);
      if (index < 0) return result;
      const [item] = this.recoverableWeaponsV131.splice(index, 1);
      actor.ammoReserve = finite(actor.ammoReserve) + 1;
      this.setInteractionAnimation(actor, 'ground-interact', .4);
      this.onEvent?.({ type: 'weapon-recovered-v131', weaponId: item.weaponId, projectileId: item.id });
      return true;
    }

    drawWorld(ctx) {
      const result = super.drawWorld(ctx);
      const colors = { stream: '#ff9d48', laser: '#ff7d79', plasma: '#92e5c5', electric: '#a7d5ff',
        fluid: '#a6c9a4', rocket: '#e6b46a', launcher: '#e6b46a', arrow: '#bfa97d', bolt: '#adb8b6' };
      for (const projectile of this.weaponProjectilesV131 || []) {
        ctx.save(); ctx.translate(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2);
        ctx.rotate(Math.atan2(projectile.vy, projectile.vx)); ctx.fillStyle = colors[projectile.kind] || '#e8d7a5';
        ctx.fillRect(-projectile.w / 2, -projectile.h / 2, projectile.w, projectile.h); ctx.restore();
      }
      for (const beam of this.weaponBeamsV131 || []) {
        ctx.save(); ctx.strokeStyle = colors[beam.kind]; ctx.globalAlpha = this.accessibilityRuntime?.reducedMotion ? .35 : .7;
        ctx.lineWidth = beam.kind === 'stream' ? 4 : 2;
        for (const segment of beam.segments) { ctx.beginPath(); ctx.moveTo(segment.x, segment.y); ctx.lineTo(segment.endX, segment.endY); ctx.stroke(); }
        ctx.restore();
      }
      ctx.save(); ctx.fillStyle = '#beae88';
      for (const item of this.recoverableWeaponsV131 || []) ctx.fillRect(item.x - 6, item.y, 12, 2);
      ctx.restore();
      return result;
    }

    weaponActionHudLabelV130(actor = this.player) {
      const profile = this.weaponActionProfileV131(actor);
      if (!profile) return super.weaponActionHudLabelV130(actor);
      const thermal = this.weaponThermalV131?.get(actor)?.get(profile.weaponId);
      if (thermal?.overheated) return 'SURCHAUFFE';
      if (this.weaponCyclesV131?.get(actor)?.kind === 'charge') return 'CHARGE EN COURS';
      if (profile.resource === 'arrows' || profile.resource === 'harpoons') return `${profile.resource === 'arrows' ? 'FLÈCHES' : 'HARPONS'} ${finite(actor.ammo) + finite(actor.ammoReserve)}`;
      const label = profile.resource === 'fuel' ? 'CARB' : profile.resource === 'cells' ? 'CELL' : profile.resource === 'canister' ? 'RÉSERV' : 'MUN';
      return `${label} ${finite(actor.ammo)}/${finite(actor.ammoReserve)}${profile.heat ? ` · ${Math.round(finite(thermal?.heat) * 100)}%` : ''}`;
    }

    getInteractionPrompt(actor = this.player) {
      const prompt = super.getInteractionPrompt(actor), profile = this.weaponActionProfileV131(actor);
      if (!profile || prompt && prompt !== 'S  COUVERTURE · F  TIR · R  RECHARGER') return prompt;
      const action = profile.kind === 'stream' ? 'F  PROJETER LA FLAMME · R  CHANGER LE RÉSERVOIR'
        : profile.resource === 'arrows' ? 'F  BANDER ET TIRER · E  RÉCUPÉRER UNE FLÈCHE'
          : profile.resource === 'harpoons' ? 'F  TIRER · E  RÉCUPÉRER UN HARPON'
            : profile.charge ? 'F  CHARGER ET TIRER · R  RECHARGER' : 'F  TIRER · R  RECHARGER';
      return prompt ? `S  COUVERTURE · ${action}` : action;
    }

    captureResumeState() {
      const snapshot = super.captureResumeState();
      return { ...snapshot, weaponActionsV131: { schema: 131, serial: this.weaponSerialV131,
        projectiles: this.weaponProjectilesV131.map(projectile => ({ id: projectile.id, weaponId: projectile.weaponId,
          ownerId: ownerId(this, projectile.owner), x: projectile.x, y: projectile.y, vx: projectile.vx, vy: projectile.vy,
          age: projectile.age, remaining: projectile.remaining, travelled: projectile.travelled, multiplier: projectile.multiplier,
          hitEnemyIds: [...projectile.hitEnemyIds], hits: projectile.hits })),
        recoverable: this.recoverableWeaponsV131.map(item => ({ id: item.id, weaponId: item.weaponId, ownerId: ownerId(this, item.owner),
          x: item.x, y: item.y, remaining: item.remaining })),
        thermal: [...this.weaponThermalV131].flatMap(([actor, state]) => [...state].map(([weaponId, thermal]) => ({
          ownerId: ownerId(this, actor), weaponId, ...thermal }))),
        cycles: [...this.weaponCyclesV131].map(([actor, cycle]) => ({ ownerId: ownerId(this, actor), ...cycle })),
        statuses: [...this.weaponStatusesV131].map(([enemy, status]) => ({ targetId: enemy.id, ownerId: ownerId(this, status.owner),
          weaponId: status.weaponId, status: status.status, remaining: status.remaining, tick: status.tick,
          staggerClock: finite(enemy.staggerClock) })),
        actors: actors(this).map(actor => ({ ownerId: ownerId(this, actor), shots: finite(actor.shots), fireClock: finite(actor.fireClock) })) } };
    }

    applyResumeState(raw) {
      const result = super.applyResumeState(raw);
      if (!result?.applied) return result;
      this.weaponProjectilesV131 = []; this.weaponBeamsV131 = []; this.recoverableWeaponsV131 = [];
      this.weaponCyclesV131 = new Map(); this.weaponThermalV131 = new Map(); this.weaponStatusesV131 = new Map();
      const saved = raw?.weaponActionsV131;
      if (saved?.schema !== 131) return result;
      this.weaponSerialV131 = clamp(Math.floor(finite(saved.serial)), 0, 999999);
      const bounds = world(this).bounds, seen = new Set();
      for (const record of list(saved.projectiles).slice(0, LIMIT)) {
        const profile = profiles.get(record.weaponId), owner = ownerById(this, record.ownerId);
        if (!profile || !Number.isFinite(profile.life) || !owner || !this.validSavedPointV131(record, bounds) || seen.has(record.id)
          || ![record.vx, record.vy, record.age, record.remaining, record.travelled].every(Number.isFinite)
          || record.remaining <= 0 || record.remaining > profile.life || record.age < 0 || record.age > profile.life
          || record.travelled < 0 || record.travelled >= profile.range || Math.abs(record.vx) > 1600 || Math.abs(record.vy) > 3000
          || finite(record.hits) >= profile.maxHits) continue;
        seen.add(record.id);
        this.weaponSerialV131 = Math.max(this.weaponSerialV131, Number(record.id.split(':')[1]));
        const count = profile.pellets || 1, multiplier = clamp(finite(record.multiplier, 1), 1, 1.472);
        const width = ['rocket', 'launcher', 'plasma', 'fluid', 'electric'].includes(profile.kind) ? 10 : 14;
        this.weaponProjectilesV131.push({ schema: 131, id: record.id, weaponId: profile.weaponId, kind: profile.kind,
          family: profile.family, status: profile.status || null, owner,
          x: record.x, y: record.y, w: width, h: width === 10 ? 10 : 3, vx: record.vx, vy: record.vy, age: record.age,
          remaining: record.remaining, travelled: record.travelled, damage: profile.damage * multiplier / count, multiplier,
          hits: clamp(Math.floor(finite(record.hits)), 0, profile.maxHits),
          hitEnemyIds: new Set(list(record.hitEnemyIds).filter(id => this.enemies?.some(enemy => enemy.id === id))) });
      }
      for (const record of list(saved.recoverable).slice(0, 32)) {
        const profile = profiles.get(record.weaponId), owner = ownerById(this, record.ownerId);
        if (!profile?.recoverable || !owner || !this.validSavedPointV131(record, bounds) || seen.has(record.id)) continue;
        seen.add(record.id);
        this.weaponSerialV131 = Math.max(this.weaponSerialV131, Number(record.id.split(':')[1]));
        this.recoverableWeaponsV131.push({ id: record.id, weaponId: profile.weaponId, owner,
          x: record.x, y: record.y, remaining: clamp(finite(record.remaining), 0, 30) });
      }
      for (const record of list(saved.thermal).slice(0, 128)) {
        const profile = profiles.get(record.weaponId), owner = ownerById(this, record.ownerId);
        if (!profile?.heat || !owner) continue;
        const thermal = this.thermalWeaponV131(owner, profile);
        thermal.heat = clamp(finite(record.heat), 0, 1);
        thermal.overheated = thermal.heat >= 1 || record.overheated === true && thermal.heat > .35;
        thermal.warm = clamp(finite(record.warm), 0, .8);
      }
      for (const record of list(saved.cycles).slice(0, 32)) {
        const owner = ownerById(this, record.ownerId), profile = owner && this.weaponActionProfileV131(owner);
        if (!profile || profile.weaponId !== record.weaponId || !['charge', 'burst'].includes(record.kind)
          || record.kind === 'charge' && !profile.charge || record.kind === 'burst' && !profile.rounds
          || ![record.aim?.x, record.aim?.y, record.remaining, record.startingHealth].every(Number.isFinite)
          || Math.abs(Math.hypot(record.aim.x, record.aim.y) - 1) > .01) continue;
        this.weaponCyclesV131.set(owner, { weaponId: profile.weaponId, kind: record.kind,
          remaining: clamp(record.remaining, 0, record.kind === 'charge' ? profile.charge : profile.spacing),
          rounds: clamp(Math.floor(finite(record.rounds, 1)), 1, record.kind === 'burst' ? profile.rounds - 1 : 1),
          aim: { ...record.aim }, startingHealth: clamp(record.startingHealth, 0, owner.maxHealth) });
      }
      for (const record of list(saved.statuses).slice(0, 128)) {
        const profile = profiles.get(record.weaponId), owner = ownerById(this, record.ownerId);
        const enemy = this.enemies?.find(enemy => enemy.id === record.targetId), tuning = STATUS[profile?.status];
        if (!owner || !active(enemy) || !tuning || record.status !== profile.status) continue;
        const status = { weaponId: profile.weaponId, owner, status: profile.status,
          remaining: clamp(finite(record.remaining), 0, tuning.duration), tick: clamp(finite(record.tick, .25), 0, .25) };
        if (status.remaining <= 0) continue;
        this.weaponStatusesV131.set(enemy, status); enemy.statusEffect = status.status; enemy.statusClock = status.remaining;
        if (tuning.stagger || status.status === 'frozen') enemy.staggerClock = clamp(finite(record.staggerClock), 0, tuning.stagger || .45);
      }
      for (const record of list(saved.actors)) {
        const owner = ownerById(this, record.ownerId), profile = owner && this.weaponActionProfileV131(owner);
        if (!profile) continue;
        owner.shots = clamp(Math.floor(finite(record.shots)), 0, 999999);
        owner.fireClock = clamp(finite(record.fireClock), 0, Math.max(profile.interval, profile.charge || 0));
      }
      return { ...result, weaponProjectilesRestoredV131: this.weaponProjectilesV131.length };
    }

    validSavedPointV131(record, bounds) {
      return typeof record?.id === 'string' && /^weapon-action-v131:\d{1,7}$/.test(record.id)
        && [record.x, record.y].every(Number.isFinite) && record.x >= 0 && record.y >= 0
        && record.x < bounds.width && record.y < bounds.height;
    }

    restartFromCheckpoint() {
      const supplies = actors(this).filter(actor => {
        const profile = this.weaponActionProfileV131(actor);
        return profile && (profile.resource !== 'cartridges' || ['rocket', 'launcher'].includes(profile.kind));
      }).map(actor => ({ actor, ammo: actor.ammo, reserve: actor.ammoReserve }));
      const result = super.restartFromCheckpoint();
      if (result) {
        this.weaponProjectilesV131 = []; this.weaponBeamsV131 = []; this.recoverableWeaponsV131 = [];
        this.weaponCyclesV131.clear(); this.weaponStatusesV131.clear();
        // Legacy retries provide ordinary firearm rounds, never replacement
        // arrows, canisters, cells, fuel or explosive launcher ammunition.
        for (const supply of supplies) { supply.actor.ammo = supply.ammo; supply.actor.ammoReserve = supply.reserve; }
      }
      return result;
    }

    stop(...args) {
      const result = super.stop(...args);
      this.weaponProjectilesV131 = []; this.weaponBeamsV131 = []; this.recoverableWeaponsV131 = [];
      this.weaponCyclesV131?.clear(); this.weaponStatusesV131?.clear(); this.weaponThermalV131?.clear();
      return result;
    }

    weaponActionsSnapshotV131() {
      return { schema: 131, projectiles: (this.weaponProjectilesV131 || []).map(projectile => ({ id: projectile.id,
        weaponId: projectile.weaponId, kind: projectile.kind, x: projectile.x, y: projectile.y, vx: projectile.vx,
        vy: projectile.vy, remaining: projectile.remaining })), cycles: this.weaponCyclesV131?.size || 0,
        beams: this.weaponBeamsV131?.length || 0, recoverable: this.recoverableWeaponsV131?.length || 0,
        statuses: this.weaponStatusesV131?.size || 0,
        operators: actors(this).flatMap(actor => {
          const profile = this.weaponActionProfileV131(actor); if (!profile) return [];
          const thermal = this.weaponThermalV131?.get(actor)?.get(profile.weaponId);
          return [{ id: ownerId(this, actor), weaponId: profile.weaponId, kind: profile.kind, resource: profile.resource,
            heat: finite(thermal?.heat), overheated: Boolean(thermal?.overheated) }];
        }) };
    }

    getSnapshot() { return { ...super.getSnapshot(), weaponActionsV131: this.weaponActionsSnapshotV131() }; }
  };
}
