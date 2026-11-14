// V188 — depth section in a mission (specs/002-cales-qz17-profondeur-combat):
// the lower deck of the QZ-17 cargo holds (zone ship-cargo). As in the hub
// (spec 001), the rail physics are unchanged and z (0 = the back wall, < 0
// towards the camera) is an extra coordinate for floor footprints, combat and
// drawing. Owner decisions: W/S move in depth, horizontal shots hit within a
// nearby depth band and settle the shooter, sprites are never scaled.
import { blockedByFootprintV188, stepDepthMoveV188, freeDepthV188, depthShotHitsV188, depthShotSettleV188,
  depthToScreenOffsetV188, depthAnnouncementV188, DEPTH_SHOT_BAND_V188 } from './hub-depth-rooms-v188.js';
import { drawDepthPropV188, drawDepthHoldFloorV188 } from './depth-props-v188.js';
import { qz17HoldLayoutV188 } from './qz17-level-dressing-v188.js';

export const QZ17_CAMPAIGN_ID_V188 = 'special-narrative-qz17';
export const MISSION_ATTACK_BAND_V188 = 24;
const P1_DEPTH_KEYS = { back: ['KeyW', 'ArrowUp'], front: ['KeyS', 'ArrowDown'] };
const P2_DEPTH_KEYS = { back: ['KeyI'], front: ['KeyK'] };
const footprint = (id, x0, x1, z0, z1) => Object.freeze({ id, x0, x1, z0, z1 });
const prop = (id, kind, x, w, h, z, z0, z1, extra = {}) => Object.freeze({ id, kind, x, w, h, z, ...extra, footprint: footprint(id, x, x + w, z0, z1) });

/** The section, measured on the generated level: between the two cargo airlocks, on the lowest cargo deck. */
export function buildCargoHoldSectionV188(engine) {
  const doors = engine?.doors || [], dock = doors.find(door => door.id === 'dock-bulkhead'), cargo = doors.find(door => door.id === 'cargo-bulkhead');
  const decks = (engine?.platforms || []).filter(entry => entry.zoneId === 'ship-cargo' && Number.isFinite(entry.y));
  if (!dock || !cargo || !decks.length) return null;
  const floorY = Math.max(...decks.map(entry => entry.y)), x0 = dock.x + dock.w, x1 = cargo.x;
  if (!(x1 - x0 > 300)) return null;
  // The QZ17 series at 10-ft ISO scale (qz17-level-dressing-v188.js): a sealed container by the cargo
  // bulkhead, a pallet of crates in the middle band by the dock bulkhead, the empty bay of QZ17-04 in
  // front of the duct and the doorway. A lane stays free along the wall.
  const layout = qz17HoldLayoutV188(x0, x1);
  const props = layout.blocking.map(entry => prop(entry.id, entry.kind, entry.x, entry.w, entry.h, entry.z, entry.z0, entry.z1,
    entry.labels ? { stack: entry.stack, labels: entry.labels } : {}));
  // A rail crates cover left in the hold (QZ-17 dressing removes it) stays a wall-side object.
  const covers = (engine.covers || []).filter(cover => cover.zoneId === 'ship-cargo' && cover.x >= x0 && cover.x + cover.w <= x1)
    .map(cover => prop(`cover:${cover.id}`, 'cover', cover.x, cover.w, cover.h, -2, -34, 1));
  return Object.freeze({ id: 'qz17-cargo-hold', roomId: 'qz17-cargo-hold', zoneId: 'ship-cargo', x0, x1, floorY,
    zMin: -80, zMax: 0, doorBand: 20, interactBand: 24, speed: 150, dropship: null, bay: layout.bay,
    props: Object.freeze([...props, ...covers]), containers: Object.freeze(props), coverIds: Object.freeze(covers.map(entry => entry.id.slice(6))) });
}

export function inDepthSectionV188(section, actor) {
  if (!section || !actor || actor.inVehicle || actor.ventTransit || actor.alive === false) return false;
  const centre = actor.x + (actor.w || 0) / 2;
  return centre >= section.x0 && centre <= section.x1 && Math.abs(actor.y + (actor.h || 0) - section.floorY) < 8;
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
      const result = super.start(options);
      this.missionDepthSectionV188 = (options.campaign?.id || this.campaign?.id) === QZ17_CAMPAIGN_ID_V188 ? buildCargoHoldSectionV188(this) : null;
      this.placeQz17HoldSleepersV188?.(this.missionDepthSectionV188);
      for (const actor of [this.player, this.coop]) if (actor) actor.depthZ = 0;
      this.missionDepthEnteredAtV188 = null;
      // The base applies options.resumeState before the section exists: the saved depths are restored here.
      if (this.missionDepthSectionV188 && this.lastResumeResult?.applied) this.restoreMissionDepthV188(options.resumeState?.depthV188);
      return result;
    }

    depthActorsV188() {
      const section = this.missionDepthSectionV188;
      if (!section) return [];
      return [this.player, this.coopEnabled ? this.coop : null, ...(this.enemies || [])].filter(actor => inDepthSectionV188(section, actor));
    }

    // —— Movement, enemies, tracker ——
    update(delta) {
      const section = this.missionDepthSectionV188;
      if (!section || !this.player) return super.update(delta);
      const p1 = inDepthSectionV188(section, this.player) && !this.player.climbing;
      const p2 = this.coopEnabled && inDepthSectionV188(section, this.coop) && !this.coop?.climbing;
      const held = this.keys || new Set();
      const pressed = keys => keys.some(code => held.has(code));
      const axis = map => (pressed(map.back) ? 1 : 0) - (pressed(map.front) ? 1 : 0);
      const dz1 = p1 ? axis(P1_DEPTH_KEYS) : 0, dz2 = p2 ? axis(P2_DEPTH_KEYS) : 0;
      const strip = new Set([...(p1 ? [...P1_DEPTH_KEYS.back, ...P1_DEPTH_KEYS.front] : []), ...(p2 ? [...P2_DEPTH_KEYS.back, ...P2_DEPTH_KEYS.front] : [])]);
      const filtered = strip.size ? new Set([...held].filter(code => !strip.has(code))) : held;
      const before = [this.player, this.coop].map(actor => actor ? { x: actor.x + actor.w / 2, z: Number(actor.depthZ) || 0 } : null);
      // The wall-side crates cover is jumped near the wall only; further out it is walked around.
      const covers = this.covers;
      if (p1 && (Number(this.player.depthZ) || 0) < -34) this.covers = (covers || []).filter(cover => !section.coverIds.includes(cover.id));
      // The motion tracker (V160) already counts actor.depth: lend it the depth of the hold's actors.
      const lent = this.depthActorsV188().map(actor => ({ actor, depth: actor.depth, lent: Number(actor.depthZ) || 0 }));
      for (const entry of lent) entry.actor.depth = entry.lent;
      this.keys = filtered;
      let result;
      try { result = super.update(delta); } finally {
        if (filtered !== held) for (const code of [...held]) if (!strip.has(code) && !filtered.has(code)) held.delete(code);
        this.keys = held; this.covers = covers;
        for (const entry of lent) if (entry.actor.depth === entry.lent) entry.actor.depth = entry.depth;
      }
      const dt = Math.min(.1, Math.max(0, Number(delta) || 0));
      [[this.player, dz1, before[0]], [this.coop, dz2, before[1]]].forEach(([actor, dz, from]) => {
        if (!actor || !from) return;
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
      if (inDepthSectionV188(section, this.player) && this.missionDepthEnteredAtV188 === null) this.missionDepthEnteredAtV188 = this.mission?.elapsed || 0;
      if (!inDepthSectionV188(section, this.player)) this.missionDepthEnteredAtV188 = null;
      for (const enemy of this.enemies || []) {
        // A dormant sleeper (alive: false until it wakes) keeps the depth it waits at, behind its row.
        if (enemy.dormant) continue;
        if (!inDepthSectionV188(section, enemy)) { enemy.depthZ = 0; continue; }
        const marines = [this.player, this.coopEnabled ? this.coop : null].filter(actor => actor?.alive !== false && inDepthSectionV188(section, actor));
        const target = marines.sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];
        enemy.depthZ = stepEnemyDepthV188(section, enemy, target ? Number(target.depthZ) || 0 : Number(enemy.depthZ) || 0, dt);
      }
      return result;
    }

    /** Evidence, supplies and the airlocks stand against the wall: reached from the wall lane only. */
    interact(actor = this.player) {
      const section = this.missionDepthSectionV188;
      if (section && inDepthSectionV188(section, actor) && Math.abs(Number(actor.depthZ) || 0) > section.interactBand) return false;
      return super.interact(actor);
    }

    // The same rule for the prompt: no "E" offered for what the front lanes cannot reach.
    getInteractionPrompt(actor = this.player) {
      const section = this.missionDepthSectionV188;
      if (section && actor?.alive !== false && inDepthSectionV188(section, actor) && Math.abs(Number(actor.depthZ) || 0) > section.interactBand) return '';
      return super.getInteractionPrompt(actor);
    }

    // An attack lands only inside the attack band (FR-006, FR-007).
    updateEnemy(enemy, delta) {
      const previous = this.depthAttackerV188; this.depthAttackerV188 = enemy;
      try { return super.updateEnemy(enemy, delta); } finally { this.depthAttackerV188 = previous; }
    }
    spawnEnemyProjectile(enemy, target) {
      const count = this.hostileProjectiles?.length || 0, result = super.spawnEnemyProjectile(enemy, target);
      for (const projectile of (this.hostileProjectiles || []).slice(count)) projectile.depthZ = Number(enemy?.depthZ) || 0;
      return result;
    }
    updateHostileProjectiles(delta) {
      this.depthProjectilePhaseV188 = true;
      try { return super.updateHostileProjectiles(delta); } finally { this.depthProjectilePhaseV188 = false; }
    }
    damagePlayer(player, amount, options = {}) {
      const section = this.missionDepthSectionV188;
      if (section && inDepthSectionV188(section, player)) {
        const z = Number(player.depthZ) || 0;
        const attacker = this.depthProjectilePhaseV188
          ? (this.hostileProjectiles || []).filter(entry => Number.isFinite(entry.depthZ))
            .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0]
          : this.depthAttackerV188;
        const counted = this.depthProjectilePhaseV188 ? Boolean(attacker) : inDepthSectionV188(section, attacker);
        if (counted && Math.abs((Number(attacker.depthZ) || 0) - z) > MISSION_ATTACK_BAND_V188) return 0;
      }
      return super.damagePlayer(player, amount, options);
    }

    // —— Shots: the band, the containers, the settle (FR-004, FR-005) ——
    depthTargetsV188(z, run) {
      const section = this.missionDepthSectionV188, enemies = this.enemies;
      if (!section) return run();
      this.enemies = (enemies || []).filter(enemy => !inDepthSectionV188(section, enemy) || depthShotHitsV188(z, Number(enemy.depthZ) || 0));
      try { return run(); } finally { this.enemies = enemies; }
    }
    fire(player) {
      const count = this.bullets?.length || 0;
      const result = this.depthTargetsV188(this.depthOfShooterV188(player), () => super.fire(player));
      for (const bullet of (this.bullets || []).slice(count)) bullet.depthZ = this.depthOfShooterV188(player);
      return result;
    }
    depthOfShooterV188(actor) { return inDepthSectionV188(this.missionDepthSectionV188, actor) ? Number(actor.depthZ) || 0 : 0; }
    performContextualMelee(player) { return this.depthTargetsV188(this.depthOfShooterV188(player), () => super.performContextualMelee(player)); }
    updateBullets(delta) {
      const section = this.missionDepthSectionV188;
      if (!section || !(this.bullets || []).some(bullet => Number.isFinite(bullet.depthZ) && bullet.depthZ !== 0)) return super.updateBullets(delta);
      const z = this.bullets.find(bullet => Number.isFinite(bullet.depthZ))?.depthZ || 0, walls = this.walls;
      // Containers whose footprint covers the salvo's lane stop it like a wall.
      this.walls = [...(walls || []), ...section.containers.filter(entry => entry.footprint.z0 < z && entry.footprint.z1 > z)
        .map(entry => ({ id: `depth:${entry.id}`, x: entry.x, y: section.floorY - 150, w: entry.w, h: 150, art: 'depth-container' }))];
      const health = new Map((this.enemies || []).map(enemy => [enemy, enemy.health]));
      try { return this.depthTargetsV188(z, () => super.updateBullets(delta)); } finally {
        this.walls = walls;
        const hit = (this.enemies || []).find(enemy => inDepthSectionV188(section, enemy) && health.has(enemy) && enemy.health < health.get(enemy));
        if (hit && inDepthSectionV188(section, this.player)) this.player.depthZ = depthShotSettleV188(Number(this.player.depthZ) || 0, Number(hit.depthZ) || 0);
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
      const { section } = frame, shade = ctx.createLinearGradient?.(0, section.floorY, 0, section.floorY + 80);
      if (shade) { shade.addColorStop(0, 'rgba(0,0,0,.22)'); shade.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = shade; ctx.fillRect(section.x0, section.floorY, section.x1 - section.x0, 80); }
      drawDepthHoldFloorV188(ctx, section);
      for (const entry of [...section.containers].sort((a, b) => b.z - a.z)) drawDepthPropV188(ctx, entry, this.depthBoxV188(entry));
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
        g.save(); g.translate(-box.x + 2, -box.y + 2); drawDepthPropV188(g, entry, box);
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

    // —— Resume (FR-009) ——
    captureResumeState() {
      const state = super.captureResumeState(), section = this.missionDepthSectionV188;
      if (state && section) state.depthV188 = { section: section.id, player: Math.round((Number(this.player?.depthZ) || 0) * 10) / 10,
        coop: Math.round((Number(this.coop?.depthZ) || 0) * 10) / 10,
        enemies: (this.enemies || []).filter(enemy => Number(enemy.depthZ)).map(enemy => ({ id: String(enemy.id), z: Math.round(enemy.depthZ * 10) / 10 })) };
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
      const byId = new Map((Array.isArray(saved.enemies) ? saved.enemies : []).map(entry => [String(entry.id), clampZ(entry.z)]));
      for (const enemy of this.enemies || []) if (byId.has(String(enemy.id))) enemy.depthZ = byId.get(String(enemy.id));
      return true;
    }
  };
}

const spriteBox = actor => ({ x: actor.x - 22, y: actor.y - 34, w: (actor.w || 40) + 44, h: (actor.h || 80) + 36 });
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export { DEPTH_SHOT_BAND_V188 };
