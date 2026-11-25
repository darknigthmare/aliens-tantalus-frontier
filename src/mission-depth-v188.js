// V188 — depth section in a mission (specs/002-cales-qz17-profondeur-combat):
// the lower deck of the QZ-17 cargo holds (zone ship-cargo). As in the hub
// (spec 001), the rail physics are unchanged and z (0 = the back wall, < 0
// towards the camera) is an extra coordinate for floor footprints, combat and
// drawing. Owner decisions: W/S move in depth, horizontal shots hit within a
// nearby depth band and settle the shooter, sprites are never scaled.
import { blockedByFootprintV188, stepDepthMoveV188, freeDepthV188, depthShotHitsV188, depthShotSettleV188,
  depthToScreenOffsetV188, depthAnnouncementV188, DEPTH_SHOT_BAND_V188 } from './hub-depth-rooms-v188.js';
import { drawDepthPropV188, drawDepthHoldFloorV188 } from './depth-props-v188.js';
import { buildDepthHoldSectionV188, resolveDepthHoldDefinitionV188, depthHoldDefinitionV188, spansHoldDepthV188, holdSleeperSlotsV188 } from './depth-hold-sections-v188.js';
import { drawDepthHoldSlotV188 } from './depth-hold-slots-v188.js';
import { sweepProjectileAabbV83, firstProjectileObstacleV83 } from './projectile-collision-v83.js';
import { drawDepthHoldDeckV188, drawFootprintShadowV188, isHoldFloorPlatformV188 } from './depth-hold-deck-v188.js';

export const QZ17_CAMPAIGN_ID_V188 = 'special-narrative-qz17';
export const MISSION_ATTACK_BAND_V188 = 24;
const P1_DEPTH_KEYS = { back: ['KeyW', 'ArrowUp'], front: ['KeyS', 'ArrowDown'] };
const P2_DEPTH_KEYS = { back: ['KeyI'], front: ['KeyK'] };
/** [PROPOSÉ] Squad marines in a hold: their lane around the leader's, by squad index (gameplay gaps V188). */
export const SQUAD_DEPTH_LANES_V188 = Object.freeze([-14, 14, -26, 26]);
/**
 * [PROPOSÉ] Enemy lanes in a hold (gameplay gaps V188): the enemies chasing one marine are ranked by distance;
 * each takes a small lane offset around the marine's lane (all inside the attack band of 24), and only
 * `engaged` of them close in to melee at once; the others hold `holdDistance` px away, in their flanking
 * lane, until a place frees up (a closer one dies or is staggered, or they become closer by `hysteresis`).
 * Ranged castes, bosses, castes filling the depth and the caste behaviours with their own timing
 * (ambusher, runner) are never held.
 */
export const ENEMY_DEPTH_SPREAD_V188 = Object.freeze({ offsets: Object.freeze([0, 10, -10, 16, -16]), engaged: 1, holdDistance: 150, hysteresis: 40 });
const rangedCaste = enemy => Boolean(enemy?.isBoss || ['spitter', 'shooter'].includes(enemy?.behavior));
const ownTiming = enemy => ['ambusher', 'runner'].includes(enemy?.behaviorProfileV119?.id);
const centreOf = actor => actor.x + (actor.w || 0) / 2;

/**
 * The QZ-17 section, measured on the generated level: between the two cargo airlocks, on the lowest cargo
 * deck. The QZ17 series at 10-ft ISO scale (qz17-level-dressing-v188.js): a sealed container by the cargo
 * bulkhead, a pallet of crates in the middle band by the dock bulkhead, the empty bay of QZ17-04 in front of
 * the duct and the doorway. Since spec 004 it is the first definition of the data-driven hold builder
 * (depth-hold-sections-v188.js), which builds the same section as before.
 */
export function buildCargoHoldSectionV188(engine) {
  return buildDepthHoldSectionV188(engine, depthHoldDefinitionV188('qz17-cargo-hold'));
}

export function inDepthSectionV188(section, actor) {
  if (!section || !actor || actor.inVehicle || actor.ventTransit || actor.alive === false) return false;
  const centre = actor.x + (actor.w || 0) / 2;
  return centre >= section.x0 && centre <= section.x1 && Math.abs(actor.y + (actor.h || 0) - section.floorY) < 8;
}
/** Above the hold floor, on the ground or airborne (a jump, a leap): the actor keeps its depth for combat and drawing. */
export const DEPTH_HOLD_HEADROOM_V188 = 300;
export function overDepthSectionV188(section, actor) {
  if (!section || !actor || actor.inVehicle || actor.ventTransit || actor.alive === false || actor.climbing) return false;
  const centre = actor.x + (actor.w || 0) / 2, feet = actor.y + (actor.h || 0);
  return centre >= section.x0 && centre <= section.x1 && feet < section.floorY + 8 && feet > section.floorY - DEPTH_HOLD_HEADROOM_V188;
}
/** Where a waking xenomorph heads in depth: its target's band, around the containers. */
export function stepEnemyDepthV188(section, enemy, targetZ, dt) {
  // Xenomorphs deal with the wall-side crates cover through the rail physics, as before; only containers steer them.
  section = section.containers ? { ...section, props: section.containers } : section;
  const z = Number(enemy.depthZ) || 0, rate = Math.min(120, Math.max(40, (Number(enemy.speed) || 100) * .6));
  const step = Math.max(-rate * dt, Math.min(rate * dt, targetZ - z)), centre = enemy.x + (enemy.w || 0) / 2, half = (enemy.w || 40) / 2;
  const next = Math.max(section.zMin, Math.min(section.zMax, z + step));
  if (blockedByFootprintV188(section, centre, z, half)) return freeDepthV188(section, centre, z, half); // walked into a container: step around
  return blockedByFootprintV188(section, centre, next, half) ? z : next;
}

export function withMissionDepthRoomsV188(Base) {
  if (Base.missionDepthRoomsV188) return Base;
  return class MissionDepthRoomsV188 extends Base {
    static missionDepthRoomsV188 = true;

    start(options = {}) {
      this.missionDepthSectionV188 = null; // never the previous mission's section while the base starts
      this.missionDepthDefinitionV188 = null; this.depthAcidV188 = new Map();
      const result = super.start(options);
      const definition = resolveDepthHoldDefinitionV188({ campaign: options.campaign || this.campaign, world: options.world || this.world });
      this.missionDepthSectionV188 = definition ? buildDepthHoldSectionV188(this, definition) : null;
      this.missionDepthDefinitionV188 = this.missionDepthSectionV188 ? definition : null;
      if (definition?.id === 'qz17-cargo-hold') this.placeQz17HoldSleepersV188?.(this.missionDepthSectionV188);
      else this.placeDepthHoldSleepersV188(this.missionDepthSectionV188, definition);
      this.tagInitialDepthAcidV188();
      for (const actor of [this.player, this.coop]) if (actor) actor.depthZ = 0;
      this.missionDepthEnteredAtV188 = null;
      if (this.depthControlsShownV188) { this.depthControlsShownV188 = false; this.onEvent?.({ type: 'depth-section-controls-v188', active: false, sectionId: null }); }
      // The base applies options.resumeState before the section exists: the saved depths are restored here.
      if (this.missionDepthSectionV188 && this.lastResumeResult?.applied) this.restoreMissionDepthV188(options.resumeState?.depthV188);
      return result;
    }

    depthActorsV188() {
      const section = this.missionDepthSectionV188;
      if (!section) return [];
      return [this.player, this.coopEnabled ? this.coop : null, ...this.depthSquadV188(), ...(this.enemies || [])].filter(actor => overDepthSectionV188(section, actor));
    }
    /** Squad marines (AI) over the hold floor. */
    depthSquadV188() {
      const section = this.missionDepthSectionV188, squad = typeof this.activeSquadActors === 'function' ? this.activeSquadActors() : [];
      return section && Array.isArray(squad) ? squad.filter(member => member && overDepthSectionV188(section, member)) : [];
    }
    /** The hold's wall-side crates covers stop an actor only in their own lane (the rule Echo-9 already had). */
    coversForDepthV188(covers, z) {
      const section = this.missionDepthSectionV188;
      if (!section?.coverIds?.length) return covers;
      const lanes = new Map(section.props.filter(entry => entry.kind === 'cover').map(entry => [entry.id.slice(6), entry.footprint]));
      return (covers || []).filter(cover => !lanes.has(cover.id) || (z > lanes.get(cover.id).z0 && z < lanes.get(cover.id).z1));
    }
    withActorCoversV188(actor, run) {
      const section = this.missionDepthSectionV188, covers = this.depthAllCoversV188 || this.covers;
      if (!section || !overDepthSectionV188(section, actor) || this.spansDepthV188(actor)) return run();
      const kept = this.covers; this.covers = this.coversForDepthV188(covers, Number(actor.depthZ) || 0);
      try { return run(); } finally { this.covers = kept; }
    }
    /** An enemy too big to steer between the objects fills the whole depth of the hold (spec 004, FR-008). */
    spansDepthV188(enemy) { return spansHoldDepthV188(this.missionDepthDefinitionV188, enemy); }

    /** Sleepers of a spec-004 hold wait at its definition's spots, spread along x (QZ-17 uses its dressing). */
    placeDepthHoldSleepersV188(section, definition) {
      if (!section || !definition) return [];
      const slots = holdSleeperSlotsV188(section, definition);
      if (!slots.length) return [];
      const sleepers = (this.enemies || []).filter(enemy => enemy.levelSpawnId === 'ship-cargo-stalkers' && enemy.dormant && !this.spansDepthV188(enemy)
        && Math.abs(enemy.y + enemy.h - section.floorY) < 2 && enemy.x + enemy.w / 2 >= section.x0 && enemy.x + enemy.w / 2 <= section.x1);
      sleepers.forEach((enemy, index) => {
        const slot = slots[index % slots.length], shift = Math.floor(index / slots.length) * 30;
        enemy.x = Math.round(Math.max(section.x0 + 2, Math.min(section.x1 - enemy.w - 2, slot.x - enemy.w / 2 + shift)));
        enemy.spawnX = enemy.x; enemy.depthZ = slot.z;
        this.initializeEnemyMissionNavigation?.(enemy);
      });
      return sleepers;
    }

    // —— Movement, enemies, tracker ——
    update(delta) {
      const section = this.missionDepthSectionV188;
      if (!section || !this.player) return super.update(delta);
      // Keys are taken over the whole hold floor, airborne too (no crouch or aim change mid-jump); depth steps on the ground only.
      const p1 = overDepthSectionV188(section, this.player);
      const p2 = this.coopEnabled && overDepthSectionV188(section, this.coop);
      const held = this.keys || new Set();
      const pressed = keys => keys.some(code => held.has(code));
      const axis = map => (pressed(map.back) ? 1 : 0) - (pressed(map.front) ? 1 : 0);
      const dz1 = p1 ? axis(P1_DEPTH_KEYS) : 0, dz2 = p2 ? axis(P2_DEPTH_KEYS) : 0;
      const strip = new Set([...(p1 ? [...P1_DEPTH_KEYS.back, ...P1_DEPTH_KEYS.front] : []), ...(p2 ? [...P2_DEPTH_KEYS.back, ...P2_DEPTH_KEYS.front] : [])]);
      const filtered = strip.size ? new Set([...held].filter(code => !strip.has(code))) : held;
      const before = [this.player, this.coop].map(actor => actor ? { x: actor.x + actor.w / 2, z: Number(actor.depthZ) || 0 } : null);
      // The wall-side crates cover is jumped near the wall only; further out it is walked around.
      const covers = this.covers; this.depthAllCoversV188 = covers;
      const squadBefore = new Map(this.depthSquadV188().map(member => [member, { x: member.x + member.w / 2, z: Number(member.depthZ) || 0 }]));
      if (p1 && (Number(this.player.depthZ) || 0) < -34) this.covers = (covers || []).filter(cover => !section.coverIds.includes(cover.id));
      // The motion tracker (V160) already counts actor.depth: lend it the depth of the hold's actors.
      const lent = this.depthActorsV188().map(actor => ({ actor, depth: actor.depth, lent: Number(actor.depthZ) || 0 }));
      for (const entry of lent) entry.actor.depth = entry.lent;
      this.keys = filtered;
      let result;
      try { result = super.update(delta); } finally {
        if (filtered !== held) for (const code of [...held]) if (!strip.has(code) && !filtered.has(code)) held.delete(code);
        this.keys = held; this.covers = covers; this.depthAllCoversV188 = null;
        for (const entry of lent) if (entry.actor.depth === entry.lent) entry.actor.depth = entry.depth;
      }
      const dt = Math.min(.1, Math.max(0, Number(delta) || 0));
      [[this.player, dz1, before[0]], [this.coop, dz2, before[1]]].forEach(([actor, dz, from]) => {
        if (!actor || !from) return;
        if (!inDepthSectionV188(section, actor) && overDepthSectionV188(section, actor)) return; // airborne over the floor: keeps its depth
        if (!inDepthSectionV188(section, actor)) {
          if (Math.abs(from.z) > section.doorBand && from.x >= section.x0 && from.x <= section.x1) { // the airlocks stand on the rail
            actor.x = Math.max(section.x0 + 2, Math.min(section.x1 - actor.w - 2, actor.x)); actor.vx = 0;
          } else if (!actor.climbing && !actor.ventTransit) actor.depthZ = 0;
          return;
        }
        const step = stepDepthMoveV188(section, from, { x: actor.x + actor.w / 2 }, { dz, dt, halfWidth: actor.w / 2 - 4 });
        actor.depthZ = step.z;
        if (step.x !== actor.x + actor.w / 2) { actor.x = step.x - actor.w / 2; actor.vx = 0; }
      });
      // The page's control help follows the hold: W/S step in depth there, they do not aim (app.js swaps the text).
      const controls = Boolean(overDepthSectionV188(section, this.player) && this.mission?.state === 'active');
      if (controls !== Boolean(this.depthControlsShownV188)) {
        this.depthControlsShownV188 = controls;
        this.onEvent?.({ type: 'depth-section-controls-v188', active: controls, sectionId: section.id });
      }
      if (inDepthSectionV188(section, this.player) && this.missionDepthEnteredAtV188 === null) this.missionDepthEnteredAtV188 = this.mission?.elapsed || 0;
      if (!inDepthSectionV188(section, this.player)) this.missionDepthEnteredAtV188 = null;
      this.stepSquadDepthV188(section, squadBefore, dt);
      this.assignEnemyDepthSpreadV188(section);
      for (const enemy of this.enemies || []) {
        // A dormant sleeper (alive: false until it wakes) keeps the depth it waits at, behind its row.
        if (enemy.dormant) continue;
        if (this.spansDepthV188(enemy)) { enemy.depthZ = 0; continue; }
        if (!inDepthSectionV188(section, enemy)) { if (!overDepthSectionV188(section, enemy)) enemy.depthZ = 0; continue; }
        const marines = [this.player, this.coopEnabled ? this.coop : null].filter(actor => actor?.alive !== false && inDepthSectionV188(section, actor));
        const target = marines.sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];
        const offset = target && enemy.depthSpreadV188?.target === target ? enemy.depthSpreadV188.offset : 0;
        const lane = target ? Math.max(section.zMin, Math.min(section.zMax, (Number(target.depthZ) || 0) + offset)) : Number(enemy.depthZ) || 0;
        enemy.depthZ = stepEnemyDepthV188(section, enemy, lane, dt);
      }
      return result;
    }

    /** Ranks the enemies chasing each marine of the hold: lane offset and melee place (ENEMY_DEPTH_SPREAD_V188). */
    assignEnemyDepthSpreadV188(section) {
      const rules = ENEMY_DEPTH_SPREAD_V188;
      const marines = [this.player, this.coopEnabled ? this.coop : null].filter(actor => actor?.alive !== false && inDepthSectionV188(section, actor));
      const groups = new Map(marines.map(marine => [marine, []]));
      for (const enemy of this.enemies || []) {
        if (!marines.length || !enemy.alive || enemy.dormant || this.spansDepthV188(enemy) || !inDepthSectionV188(section, enemy)) { enemy.depthSpreadV188 = null; continue; }
        const target = [...marines].sort((a, b) => Math.abs(centreOf(a) - centreOf(enemy)) - Math.abs(centreOf(b) - centreOf(enemy)))[0];
        groups.get(target).push(enemy);
      }
      for (const [marine, list] of groups) {
        // Hysteresis: an engaged enemy keeps its place unless another is clearly closer.
        const key = enemy => Math.abs(centreOf(enemy) - centreOf(marine)) - (enemy.depthSpreadV188?.engaged ? rules.hysteresis : 0);
        list.sort((a, b) => key(a) - key(b) || String(a.id).localeCompare(String(b.id)));
        let engaged = 0;
        list.forEach((enemy, rank) => {
          const free = rangedCaste(enemy) || ownTiming(enemy) || enemy.staggerClock > 0;
          const engage = free || engaged < rules.engaged;
          if (engage && !free) engaged++;
          enemy.depthSpreadV188 = { target: marine, rank, offset: rules.offsets[rank % rules.offsets.length], engaged: engage, hold: !engage };
        });
      }
    }
    /** A waiting enemy may turn and snarl but does not close in under the hold distance. */
    holdEnemyDepthSpreadV188(enemy, beforeX) {
      const spread = enemy?.depthSpreadV188, section = this.missionDepthSectionV188;
      if (!spread?.hold || !enemy.alive || !section || !Number.isFinite(beforeX) || !inDepthSectionV188(section, enemy)) return;
      const gapBefore = Math.abs(beforeX + enemy.w / 2 - centreOf(spread.target)), gapAfter = Math.abs(centreOf(enemy) - centreOf(spread.target));
      if (gapAfter < ENEMY_DEPTH_SPREAD_V188.holdDistance && gapAfter < gapBefore) { enemy.x = beforeX; enemy.vx = 0; }
    }

    /** Squad marines in a hold: formation lane around the leader, the lane of the enemy they engage, never inside an object. */
    squadDepthLaneV188(section, member, index) {
      const z = Number(member.depthZ) || 0, range = Number(member.profile?.range) || 620;
      const enemies = (this.enemies || []).filter(enemy => enemy.alive && !enemy.dormant && inDepthSectionV188(section, enemy) && Math.abs(centreOf(enemy) - centreOf(member)) <= range);
      if (enemies.some(enemy => this.spansDepthV188(enemy) || depthShotHitsV188(z, Number(enemy.depthZ) || 0))) return z; // a target in its band: hold the lane and fire
      const nearest = enemies.sort((a, b) => Math.abs(centreOf(a) - centreOf(member)) - Math.abs(centreOf(b) - centreOf(member)))[0];
      if (nearest) return Number(nearest.depthZ) || 0;
      const leader = this.player, leaderZ = inDepthSectionV188(section, leader) ? Number(leader.depthZ) || 0 : 0;
      let lane = leaderZ + SQUAD_DEPTH_LANES_V188[index % SQUAD_DEPTH_LANES_V188.length];
      if (Math.abs(leaderZ) <= section.doorBand) lane = Math.max(-section.doorBand + 2, lane); // leader on the rail: ready for the airlocks
      return Math.max(section.zMin, Math.min(section.zMax, lane));
    }
    stepSquadDepthV188(section, before, dt) {
      [...before.keys()].forEach((member, index) => {
        const from = before.get(member);
        if (!member.alive || member.inVehicle) return;
        if (!inDepthSectionV188(section, member)) {
          if (overDepthSectionV188(section, member)) return; // airborne: keeps its depth
          if (Math.abs(from.z) > section.doorBand && from.x >= section.x0 && from.x <= section.x1) { member.x = Math.max(section.x0 + 2, Math.min(section.x1 - member.w - 2, member.x)); member.vx = 0; }
          else if (!member.climbing) member.depthZ = 0;
          return;
        }
        const half = member.w / 2 - 4, lane = member.downed ? from.z : this.squadDepthLaneV188(section, member, index);
        const rate = section.speed * dt, next = Math.max(section.zMin, Math.min(section.zMax, from.z + Math.max(-rate, Math.min(rate, lane - from.z))));
        let z = from.z;
        if (!blockedByFootprintV188(section, from.x, next, half)) z = next;
        else if (blockedByFootprintV188(section, from.x, from.z, half)) z = freeDepthV188(section, from.x, from.z, half);
        member.depthZ = z;
        if (blockedByFootprintV188(section, member.x + member.w / 2, z, half)) { member.x = from.x - member.w / 2; member.vx = 0; }
      });
    }
    updateSquadMovement(member, index, leader, delta) { return this.withActorCoversV188(member, () => super.updateSquadMovement(member, index, leader, delta)); }
    /** Squad fire in a hold: the player's rules (shot band, containers, settle). */
    updateSquadCombat(member) {
      const section = this.missionDepthSectionV188;
      if (!section || !overDepthSectionV188(section, member)) return super.updateSquadCombat(member);
      const z = Number(member.depthZ) || 0, count = this.bullets?.length || 0;
      // The hold's wall-side covers block its line of fire only in their own lane, as for Echo-9.
      const result = this.withActorCoversV188(member, () => this.depthTargetsV188(z, () => super.updateSquadCombat(member)));
      for (const bullet of (this.bullets || []).slice(count)) bullet.depthZ = z;
      return result;
    }
    damageSquadMember(member, amount, options = {}) {
      const section = this.missionDepthSectionV188, attacker = this.depthAttackerV188;
      if (section && !this.depthProjectileHitV188 && overDepthSectionV188(section, member) && overDepthSectionV188(section, attacker) && !this.spansDepthV188(attacker)
        && Math.abs((Number(attacker.depthZ) || 0) - (Number(member.depthZ) || 0)) > MISSION_ATTACK_BAND_V188) return 0;
      return super.damageSquadMember(member, amount, options);
    }
    drawSquadActor(ctx, member) {
      return this.depthFrameV188 ? this.drawShiftedV188(ctx, member, () => super.drawSquadActor?.(ctx, member)) : super.drawSquadActor?.(ctx, member);
    }

    /** Evidence, supplies and the airlocks stand against the wall: reached from the wall lane only. */
    interact(actor = this.player) {
      const section = this.missionDepthSectionV188;
      if (section && overDepthSectionV188(section, actor) && Math.abs(Number(actor.depthZ) || 0) > section.interactBand) return false;
      return super.interact(actor);
    }

    // The same rule for the prompt: no "E" offered for what the front lanes cannot reach.
    getInteractionPrompt(actor = this.player) {
      const section = this.missionDepthSectionV188;
      if (section && actor?.alive !== false && overDepthSectionV188(section, actor) && Math.abs(Number(actor.depthZ) || 0) > section.interactBand) return '';
      return super.getInteractionPrompt(actor);
    }

    // An attack lands only inside the attack band (FR-006, FR-007).
    updateEnemy(enemy, delta) {
      const previous = this.depthAttackerV188, beforeX = enemy?.x; this.depthAttackerV188 = enemy;
      try { return this.withActorCoversV188(enemy, () => super.updateEnemy(enemy, delta)); } finally {
        this.depthAttackerV188 = previous;
        this.holdEnemyDepthSpreadV188(enemy, beforeX);
      }
    }
    spawnEnemyProjectile(enemy, target) {
      const count = this.hostileProjectiles?.length || 0, result = super.spawnEnemyProjectile(enemy, target);
      for (const projectile of (this.hostileProjectiles || []).slice(count)) projectile.depthZ = Number(enemy?.depthZ) || 0;
      return result;
    }
    /**
     * Enemy projectiles inside a hold travel in the lane they were spat in: the hold's objects (floor objects
     * and wall-side covers) stop them in that lane, as they stop the marines' salvos, and they reach a marine
     * (player, co-op, squad) or a placeable only inside the attack band. They are resolved here, swept; the
     * other projectiles go through the base unchanged. Presentation hook (no rule depends on it):
     * onEvent({ type: 'depth-projectile-blocked-v188', propId, x, y, acid }).
     */
    updateHostileProjectiles(delta) {
      const section = this.missionDepthSectionV188, all = this.hostileProjectiles || [];
      const held = this.paused || this.mission?.state !== 'active' || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88;
      const mine = section && !held ? all.filter(projectile => !projectile.hit && projectile.life > 0 && Number.isFinite(projectile.depthZ) && this.projectileInHoldV188(projectile)) : [];
      if (mine.length) { this.hostileProjectiles = all.filter(projectile => !mine.includes(projectile)); this.stepDepthProjectilesV188(section, mine, delta); }
      this.depthProjectilePhaseV188 = true;
      try { return super.updateHostileProjectiles(delta); } finally {
        this.depthProjectilePhaseV188 = false;
        if (mine.length) this.hostileProjectiles = [...(this.hostileProjectiles || []), ...mine.filter(projectile => !projectile.hit && projectile.life > 0)];
      }
    }
    projectileInHoldV188(projectile) {
      const section = this.missionDepthSectionV188, x = projectile.x + (projectile.w || 0) / 2;
      return x >= section.x0 && x <= section.x1 && projectile.y < section.floorY && projectile.y > section.floorY - DEPTH_HOLD_HEADROOM_V188;
    }
    depthPropBoxesV188(section, z) {
      return section.props.filter(entry => entry.footprint.z0 < z && entry.footprint.z1 > z).map(entry => {
        const cover = entry.kind === 'cover' ? (this.depthAllCoversV188 || this.covers || []).find(item => `cover:${item.id}` === entry.id) : null;
        if (entry.kind === 'cover' && (!cover || cover.destroyed)) return null;
        return cover ? { id: entry.id, x: cover.x, y: cover.y, w: cover.w, h: cover.h } : { id: entry.id, x: entry.x, y: section.floorY - 150, w: entry.w, h: 150 };
      }).filter(Boolean);
    }
    stepDepthProjectilesV188(section, projectiles, delta) {
      const depthOf = actor => overDepthSectionV188(section, actor) ? Number(actor.depthZ) || 0 : 0;
      const marines = [this.player, this.coopEnabled ? this.coop : null, ...(typeof this.activeSquadActors === 'function' ? this.activeSquadActors() : [])]
        .filter(actor => actor?.alive && !actor.inVehicle && !actor.downed);
      const placeables = (this.placeablesV86?.instances || []).filter(item => item.onGround && item.health > 0 && ['deployed', 'spent'].includes(item.status));
      for (const projectile of projectiles) {
        projectile.sourceX = Number.isFinite(projectile.sourceX) ? projectile.sourceX : projectile.x;
        projectile.sourceY = Number.isFinite(projectile.sourceY) ? projectile.sourceY : projectile.y;
        const z = projectile.depthZ, dt = Math.min(Math.max(0, Number(delta) || 0), projectile.life);
        const displacement = { x: (Number(projectile.vx) || 0) * dt, y: (Number(projectile.vy) || 0) * dt };
        const props = this.depthPropBoxesV188(section, z);
        const terrain = firstProjectileObstacleV83(projectile, displacement, { walls: [...(this.walls || []), ...props], doors: this.doors, platforms: this.platforms, bounds: this.missionLevelBounds });
        const impacts = [
          ...(terrain ? [{ kind: 'terrain', contact: terrain, prop: props.find(entry => entry === terrain.target) }] : []),
          ...marines.filter(actor => Math.abs(depthOf(actor) - z) <= MISSION_ATTACK_BAND_V188).map(actor => ({ kind: 'actor', target: actor, contact: sweepProjectileAabbV83(projectile, displacement, actor) })),
          ...(Math.abs(z) <= MISSION_ATTACK_BAND_V188 ? placeables.map(item => ({ kind: 'placeable', target: item, contact: sweepProjectileAabbV83(projectile, displacement, item) })) : [])
        ].filter(entry => entry.contact).sort((a, b) => a.contact.t - b.contact.t || Number(a.kind !== 'terrain') - Number(b.kind !== 'terrain'));
        const first = impacts[0];
        if (!first) { projectile.x += displacement.x; projectile.y += displacement.y; projectile.life -= delta; continue; }
        projectile.hit = true; projectile.x = first.contact.x; projectile.y = first.contact.y;
        if (first.kind === 'actor') {
          this.depthProjectileHitV188 = projectile;
          try {
            if (first.target === this.player || first.target === this.coop) this.damagePlayer(first.target, projectile.damage, { source: projectile.acid ? 'acid' : 'projectile', attackKind: 'projectile',
              sourceX: projectile.sourceX, sourceY: projectile.sourceY, projectileV124: { vx: projectile.vx, vy: Number(projectile.vy) || 0 } });
            else this.damageSquadMember(first.target, projectile.damage, { source: projectile.acid ? 'acid-projectile' : 'projectile' });
          } finally { this.depthProjectileHitV188 = null; }
        } else if (first.kind === 'placeable') this.damagePlaceableV86?.(first.target.instanceId, projectile.damage, projectile);
        else if (first.prop) this.onEvent?.({ type: 'depth-projectile-blocked-v188', propId: first.prop.id, x: projectile.x, y: projectile.y, acid: Boolean(projectile.acid) });
        this.spawnImpact?.(projectile.x, projectile.y, projectile.acid ? '#a7c742' : '#e3b86c');
      }
    }
    damagePlayer(player, amount, options = {}) {
      const section = this.missionDepthSectionV188;
      if (section && overDepthSectionV188(section, player) && !this.depthProjectileHitV188) {
        const z = Number(player.depthZ) || 0;
        const attacker = this.depthProjectilePhaseV188
          ? (this.hostileProjectiles || []).filter(entry => Number.isFinite(entry.depthZ))
            .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0]
          : this.depthAttackerV188;
        const counted = this.depthProjectilePhaseV188 ? Boolean(attacker) : overDepthSectionV188(section, attacker) && !this.spansDepthV188(attacker);
        if (counted && Math.abs((Number(attacker.depthZ) || 0) - z) > MISSION_ATTACK_BAND_V188) return 0;
      }
      return super.damagePlayer(player, amount, options);
    }

    // —— Shots: the band, the containers, the settle (FR-004, FR-005) ——
    depthTargetsV188(z, run) {
      const section = this.missionDepthSectionV188, enemies = this.enemies;
      if (!section) return run();
      this.enemies = (enemies || []).filter(enemy => !overDepthSectionV188(section, enemy) || this.spansDepthV188(enemy) || depthShotHitsV188(z, Number(enemy.depthZ) || 0));
      try { return run(); } finally { this.enemies = enemies; }
    }
    fire(player) {
      const count = this.bullets?.length || 0;
      const result = this.depthTargetsV188(this.depthOfShooterV188(player), () => super.fire(player));
      for (const bullet of (this.bullets || []).slice(count)) bullet.depthZ = this.depthOfShooterV188(player);
      return result;
    }
    depthOfShooterV188(actor) { return overDepthSectionV188(this.missionDepthSectionV188, actor) ? Number(actor.depthZ) || 0 : 0; }
    performContextualMelee(player) { return this.depthTargetsV188(this.depthOfShooterV188(player), () => super.performContextualMelee(player)); }
    updateBullets(delta) {
      const section = this.missionDepthSectionV188;
      if (!section || !(this.bullets || []).some(bullet => Number.isFinite(bullet.depthZ) && bullet.depthZ !== 0)) return super.updateBullets(delta);
      const depths = [...new Set(this.bullets.filter(bullet => Number.isFinite(bullet.depthZ)).map(bullet => bullet.depthZ))];
      if (depths.length <= 1) return this.updateDepthSalvoV188(delta, depths[0] || 0);
      // Two marines firing from different depths (co-op): one pass per depth, each salvo with its own band and containers.
      const all = this.bullets, kept = []; let result;
      try {
        depths.forEach((z, index) => {
          this.bullets = all.filter(bullet => bullet.depthZ === z || (!index && !Number.isFinite(bullet.depthZ)));
          result = this.updateDepthSalvoV188(delta, z); kept.push(...(this.bullets || []));
        });
      } finally { this.bullets = kept; }
      return result;
    }
    updateDepthSalvoV188(delta, z) {
      const section = this.missionDepthSectionV188, walls = this.walls;
      const owners = new Set((this.bullets || []).map(bullet => bullet.owner).filter(Boolean));
      // Containers whose footprint covers the salvo's lane stop it like a wall.
      this.walls = [...(walls || []), ...section.containers.filter(entry => entry.footprint.z0 < z && entry.footprint.z1 > z)
        .map(entry => ({ id: `depth:${entry.id}`, x: entry.x, y: section.floorY - 150, w: entry.w, h: 150, art: 'depth-container' }))];
      const health = new Map((this.enemies || []).map(enemy => [enemy, enemy.health])), covers = this.covers;
      this.covers = this.coversForDepthV188(covers, z); // a wall-side cover stops a salvo in its own lane only
      try { return this.depthTargetsV188(z, () => super.updateBullets(delta)); } finally {
        this.walls = walls; this.covers = covers;
        const hit = (this.enemies || []).find(enemy => inDepthSectionV188(section, enemy) && health.has(enemy) && enemy.health < health.get(enemy));
        // The shooter settles towards the band it hit (the marine whose salvo it was; Echo-9 when the owner is unknown).
        const shooters = [this.player, this.coop, ...this.depthSquadV188()].filter(actor => actor && (owners.has(actor) || (!owners.size && actor === this.player)));
        if (hit) for (const actor of shooters) if (inDepthSectionV188(section, actor)) actor.depthZ = depthShotSettleV188(Number(actor.depthZ) || 0, Number(hit.depthZ) || 0);
      }
    }

    // —— Drawing ——
    // Actors are drawn through a canvas translation, never by moving actor.y: the mission's weapon pose
    // (arm reach, withdrawal near obstacles) is computed from the real position.
    draw() {
      const section = this.missionDepthSectionV188;
      if (!section) return super.draw();
      this.depthFrameV188 = { section, propsDrawn: false, early: new Set(), inside: new Set(this.depthActorsV188()) };
      try { return super.draw(); } finally { this.depthFrameV188 = null; }
    }
    depthOffsetOfV188(actor) { return this.depthFrameV188?.inside.has(actor) ? depthToScreenOffsetV188(actor.depthZ) : 0; }
    depthBoxOfV188(actor) { const box = spriteBox(actor); box.y += this.depthOffsetOfV188(actor); return box; }
    drawDepthPropsV188(ctx) {
      const frame = this.depthFrameV188; if (!frame || frame.propsDrawn) return; frame.propsDrawn = true;
      const { section } = frame;
      // The deck itself is drawn with the hold floor platform (drawPlatform); a frame without it still gets one here.
      if (!frame.deckDrawn) { frame.deckDrawn = true; drawDepthHoldDeckV188(ctx, section); }
      drawDepthHoldFloorV188(ctx, section);
      // Contact shadows on the deck, over each object's whole footprint depth.
      for (const entry of section.containers) drawFootprintShadowV188(ctx, section, entry);
      for (const entry of [...section.containers].sort((a, b) => b.z - a.z)) drawHoldPropV188(ctx, entry, this.depthBoxV188(entry));
    }
    // The hold floor is a deck in depth: drawn right after its platform, under hazards, objects and actors.
    drawPlatform(ctx, platform) {
      const result = super.drawPlatform(ctx, platform), frame = this.depthFrameV188;
      if (frame && isHoldFloorPlatformV188(frame.section, platform)) {
        frame.deckDrawn = true;
        drawDepthHoldDeckV188(ctx, frame.section, { clipX0: platform.x, clipX1: platform.x + platform.w });
      }
      return result;
    }
    depthBoxV188(entry) { const section = this.depthFrameV188.section; return { x: entry.x, y: section.floorY + depthToScreenOffsetV188(entry.z) - entry.h, w: entry.w, h: entry.h }; }
    drawActor(ctx, actor) {
      const frame = this.depthFrameV188;
      if (frame && actor === this.player) {
        this.drawDepthPropsV188(ctx);
        // Xenomorphs nearer the wall than Echo-9 and overlapping him are drawn before him.
        const box = this.depthBoxOfV188(actor), z = Number(actor.depthZ) || 0;
        for (const enemy of frame.inside) {
          if (enemy === this.player || enemy === this.coop || frame.early.has(enemy)) continue;
          if ((Number(enemy.depthZ) || 0) > z + 4 && overlaps(this.depthBoxOfV188(enemy), box)) { frame.early.add(enemy); this.drawShiftedV188(ctx, enemy, () => super.drawEnemy(ctx, enemy)); }
        }
      }
      return frame ? this.drawShiftedV188(ctx, actor, () => super.drawActor(ctx, actor)) : super.drawActor(ctx, actor);
    }
    drawEnemy(ctx, enemy) {
      const frame = this.depthFrameV188;
      if (!frame) return super.drawEnemy(ctx, enemy);
      if (frame.early.has(enemy)) return undefined;
      return this.drawShiftedV188(ctx, enemy, () => super.drawEnemy(ctx, enemy));
    }
    drawShiftedV188(ctx, actor, draw) {
      const offset = this.depthOffsetOfV188(actor);
      if (!offset) return draw();
      ctx.save(); ctx.translate(0, offset);
      try { return draw(); } finally { ctx.restore(); }
    }
    drawObjective(ctx) {
      const frame = this.depthFrameV188;
      if (frame) { this.drawDepthPropsV188(ctx); this.drawDepthOcclusionV188(ctx, frame); }
      return super.drawObjective(ctx);
    }
    drawDepthOcclusionV188(ctx, frame) {
      const people = this.depthActorsV188();
      for (const entry of frame.section.containers) {
        const box = this.depthBoxV188(entry);
        const behind = people.filter(actor => (Number(actor.depthZ) || 0) > entry.footprint.z1 && overlaps(this.depthBoxOfV188(actor), box));
        if (!behind.length) continue;
        const front = people.filter(actor => (Number(actor.depthZ) || 0) < entry.footprint.z0 && overlaps(this.depthBoxOfV188(actor), box));
        const layer = this.depthLayerV188 ||= globalThis.document?.createElement?.('canvas');
        if (!layer?.getContext) continue;
        const width = Math.ceil(box.w + 4), height = Math.ceil(box.h + 4);
        if (layer.width < width || layer.height < height) { layer.width = Math.max(layer.width, width); layer.height = Math.max(layer.height, height); }
        const g = layer.getContext('2d'); g.clearRect(0, 0, layer.width, layer.height);
        g.save(); g.translate(-box.x + 2, -box.y + 2); drawHoldPropV188(g, entry, box);
        g.globalCompositeOperation = 'destination-in'; g.fillStyle = '#000'; g.beginPath();
        for (const actor of behind) { const b = this.depthBoxOfV188(actor); g.rect(b.x, b.y, b.w, b.h); } g.fill();
        g.globalCompositeOperation = 'destination-out'; for (const actor of front) { const b = this.depthBoxOfV188(actor); g.fillRect(b.x, b.y, b.w, b.h); }
        g.restore(); ctx.drawImage(layer, 0, 0, width, height, box.x - 2, box.y - 2, width, height);
        if (behind.includes(this.player)) {
          const p = this.player, y = p.y + this.depthOffsetOfV188(p); ctx.save(); ctx.strokeStyle = 'rgba(131,213,161,.55)'; ctx.setLineDash?.([4, 4]); ctx.lineWidth = 1.5;
          ctx.strokeRect(p.x - 4, y - 6, p.w + 8, p.h + 8); ctx.restore();
        }
      }
    }
    drawHud(ctx) {
      const result = super.drawHud(ctx), section = this.missionDepthSectionV188, player = this.player;
      if (!section || !player || this.mission?.state !== 'active') return result;
      const centre = player.x + player.w / 2, onDeck = Math.abs(player.y + player.h - section.floorY) < 8;
      const approaching = onDeck && ((centre > section.x0 - 220 && centre < section.x0) || (centre > section.x1 && centre < section.x1 + 220));
      const fresh = this.missionDepthEnteredAtV188 !== null && (this.mission?.elapsed || 0) - this.missionDepthEnteredAtV188 < 5;
      if (approaching || fresh) {
        const text = depthAnnouncementV188(globalThis.document?.documentElement?.lang === 'en' ? 'en' : 'fr');
        ctx.save(); ctx.font = '700 13px ui-monospace, monospace'; const w = ctx.measureText(text).width + 40, x = (1280 - w) / 2;
        ctx.fillStyle = 'rgba(2,8,7,.9)'; ctx.fillRect(x, 120, w, 36); ctx.strokeStyle = '#93d2a3'; ctx.strokeRect(x + .5, 120.5, w, 35);
        ctx.fillStyle = '#c8e8d0'; ctx.textAlign = 'center'; ctx.fillText(text, 640, 143); ctx.restore();
      }
      return result;
    }

    // —— Acid in the Lethe quarantine hold (spec 004): a pool lies at a depth, it burns within the acid band ——
    depthPoolInHoldV188(pool) {
      const section = this.missionDepthSectionV188;
      if (!section || !pool) return false;
      const centre = Number(pool.x) + (Number(pool.w) || 0) / 2;
      return centre >= section.x0 && centre <= section.x1 && Math.abs(Number(pool.y) + (Number(pool.h) || 0) - section.floorY) < 8;
    }
    tagInitialDepthAcidV188() {
      const definition = this.missionDepthDefinitionV188;
      if (!definition?.acidBand) return;
      for (const pool of this.alienSurvivalV70?.acidPools || []) {
        if (pool.id === 'acid-pool:initial-cargo' && this.depthPoolInHoldV188(pool) && !this.depthAcidV188.has(pool.id)) this.depthAcidV188.set(pool.id, definition.initialAcidZ);
      }
    }
    createAlienSurvivalAcidFromEnemyV70(enemy) {
      const previous = this.depthAcidSourceV188; this.depthAcidSourceV188 = enemy;
      try { return super.createAlienSurvivalAcidFromEnemyV70(enemy); } finally { this.depthAcidSourceV188 = previous; }
    }
    createAlienSurvivalAcidPoolV70(spec) {
      const pool = super.createAlienSurvivalAcidPoolV70(spec), definition = this.missionDepthDefinitionV188, source = this.depthAcidSourceV188;
      if (pool && definition?.acidBand && this.depthPoolInHoldV188(pool)) {
        // A creature's acid falls where it died; the scripted first pool lies in the middle band.
        const z = source ? (this.spansDepthV188(source) ? null : Number(source.depthZ) || 0) : pool.id === 'acid-pool:initial-cargo' ? definition.initialAcidZ : null;
        if (Number.isFinite(z)) this.depthAcidV188.set(pool.id, z);
      }
      return pool;
    }
    updateAlienSurvivalAcidV70(seconds) {
      if (!this.depthAcidV188?.size || !this.missionDepthSectionV188) return super.updateAlienSurvivalAcidV70(seconds);
      // The base walks the active pools in order and asks for the exposed actors once per pool.
      this.depthAcidQueueV188 = (this.alienSurvivalV70?.acidPools || []).filter(pool => pool.active);
      try { return super.updateAlienSurvivalAcidV70(seconds); } finally { this.depthAcidQueueV188 = null; }
    }
    alienSurvivalActorsV70() {
      const actors = super.alienSurvivalActorsV70(), queue = this.depthAcidQueueV188;
      if (!queue) return actors;
      const pool = queue.shift(), z = pool ? this.depthAcidV188.get(pool.id) : undefined, band = this.missionDepthDefinitionV188?.acidBand;
      if (!Number.isFinite(z) || !band) return actors;
      return actors.filter(actor => !overDepthSectionV188(this.missionDepthSectionV188, actor) || Math.abs((Number(actor.depthZ) || 0) - z) <= band);
    }
    /** A hazard laid at a depth (acid blood of a xenomorph killed in the hold) burns within the attack band only. */
    applyHazards(player) {
      const section = this.missionDepthSectionV188, hazards = this.hazards;
      if (!section || !overDepthSectionV188(section, player) || !(hazards || []).some(hazard => Number.isFinite(hazard.depthZ))) return super.applyHazards(player);
      const z = Number(player.depthZ) || 0;
      this.hazards = hazards.filter(hazard => !Number.isFinite(hazard.depthZ) || Math.abs(hazard.depthZ - z) <= MISSION_ATTACK_BAND_V188);
      try { return super.applyHazards(player); } finally { this.hazards = hazards; }
    }
    drawHazard(ctx, hazard) {
      const z = hazard?.kind === 'acid' && this.depthFrameV188 ? (Number.isFinite(hazard.depthZ) ? hazard.depthZ : this.depthAcidV188?.get(hazard.id)) : undefined;
      if (!Number.isFinite(z) || !z) return super.drawHazard(ctx, hazard);
      ctx.save(); ctx.translate(0, depthToScreenOffsetV188(z));
      try { return super.drawHazard(ctx, hazard); } finally { ctx.restore(); }
    }

    // —— Resume (FR-009) ——
    captureResumeState() {
      const state = super.captureResumeState(), section = this.missionDepthSectionV188;
      if (state && section) state.depthV188 = { section: section.id, player: Math.round((Number(this.player?.depthZ) || 0) * 10) / 10,
        coop: Math.round((Number(this.coop?.depthZ) || 0) * 10) / 10,
        enemies: (this.enemies || []).filter(enemy => Number(enemy.depthZ)).map(enemy => ({ id: String(enemy.id), z: Math.round(enemy.depthZ * 10) / 10 })) };
      // Additive (spec 004): the depth of the acid pools of the quarantine hold.
      // Additive (gameplay gaps V188): the lanes of the squad marines.
      if (state?.depthV188) { const squad = this.depthSquadV188().filter(member => Number(member.depthZ) && member.crewId);
        if (squad.length) state.depthV188.squad = squad.map(member => ({ id: String(member.crewId), z: Math.round(member.depthZ * 10) / 10 })); }
      if (state?.depthV188 && this.depthAcidV188?.size) state.depthV188.acid = [...this.depthAcidV188].map(([id, z]) => ({ id, z: Math.round(z * 10) / 10 }));
      return state;
    }
    applyResumeState(rawState) {
      const result = super.applyResumeState(rawState);
      if (result?.applied !== false) this.restoreMissionDepthV188(rawState?.depthV188);
      return result;
    }
    restoreMissionDepthV188(saved) {
      const section = this.missionDepthSectionV188;
      if (!section || !saved || saved.section !== section.id) return false;
      const clampZ = value => Math.max(section.zMin, Math.min(section.zMax, Number(value) || 0));
      if (this.player) this.player.depthZ = clampZ(saved.player);
      if (this.coop) this.coop.depthZ = clampZ(saved.coop);
      // A damaged resume record may hold non-object entries: they are ignored, never read.
      const byId = new Map((Array.isArray(saved.enemies) ? saved.enemies : []).filter(entry => entry && typeof entry === 'object')
        .map(entry => [String(entry.id), clampZ(entry.z)]));
      for (const enemy of this.enemies || []) if (byId.has(String(enemy.id))) enemy.depthZ = byId.get(String(enemy.id));
      const squad = new Map((Array.isArray(saved.squad) ? saved.squad : []).filter(entry => entry && typeof entry === 'object').map(entry => [String(entry.id), clampZ(entry.z)]));
      for (const member of (typeof this.activeSquadActors === 'function' ? this.activeSquadActors() : []) || []) if (squad.has(String(member.crewId))) member.depthZ = squad.get(String(member.crewId));
      if (Array.isArray(saved.acid) && this.missionDepthDefinitionV188?.acidBand) {
        for (const entry of saved.acid) if (entry && typeof entry === 'object' && typeof entry.id === 'string' && Number.isFinite(Number(entry.z))) this.depthAcidV188.set(entry.id, clampZ(entry.z));
      }
      return true;
    }
  };
}

/** QZ-17 objects keep their spec-002 drawing; spec-004 objects go through their named art slot. */
const drawHoldPropV188 = (ctx, entry, box) => entry.slot ? drawDepthHoldSlotV188(ctx, entry, box) : drawDepthPropV188(ctx, entry, box);
const spriteBox = actor => ({ x: actor.x - 22, y: actor.y - 34, w: (actor.w || 40) + 44, h: (actor.h || 80) + 36 });
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export { DEPTH_SHOT_BAND_V188 };
