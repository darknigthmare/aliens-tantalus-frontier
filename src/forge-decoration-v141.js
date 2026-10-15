import { HUB_FURNITURE_ATLAS_V139 } from './hub-furniture-atlas-v139.js';
import { HUB_PROP_ATLAS_V136 } from './hub-prop-atlas-v136.js';
import { HUB_FURNISHING_ATLAS_V137 } from './hub-furnishing-atlas-v137.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
/** Reviewed frontal elevations, at the admitted native human scale (96.5 px).
 * No grid-density scaling and no obsolete oblique furniture cutouts.
 */
const asset = (atlas, id, label) => {
  const cell = atlas.cells[id];
  return Object.freeze({ id, label, src: atlas.asset,
    source: cell.source, sourceWidth: cell.source.w, sourceHeight: cell.source.h,
    imageWidth: atlas.width, imageHeight: atlas.height,
    worldSize: Object.freeze({ w: cell.width, h: cell.height }), footSourceY: cell.footSourceY,
    anchor: 'measured-foot-center', projection: cell.projection, humanReferenceHeight: 96.5,
    alphaPolicy: atlas.alphaPolicy });
};
export const FORGE_DECORATION_ASSETS_V141 = Object.freeze([
  asset(HUB_FURNITURE_ATLAS_V139, 'medical-bed-side', 'Lit médical'),
  asset(HUB_FURNITURE_ATLAS_V139, 'dining-table-side', 'Table de réfectoire'),
  asset(HUB_FURNITURE_ATLAS_V139, 'workbench-side', 'Établi de maintenance'),
  asset(HUB_FURNITURE_ATLAS_V139, 'seat-side', 'Siège'),
  asset(HUB_FURNITURE_ATLAS_V139, 'wall-handwash', 'Lavabo mural'),
  asset(HUB_FURNITURE_ATLAS_V139, 'service-sink', 'Évier de service'),
  asset(HUB_PROP_ATLAS_V136, 'sterile-cabinet', 'Armoire stérile'),
  asset(HUB_PROP_ATLAS_V136, 'medical-trolley', 'Chariot médical'),
  asset(HUB_PROP_ATLAS_V136, 'tool-board', 'Panneau d’outils'),
  asset(HUB_FURNISHING_ATLAS_V137, 'crew-berth', 'Couchette d’équipage'),
  asset(HUB_FURNISHING_ATLAS_V137, 'engine-pump', 'Pompe technique'),
  asset(HUB_FURNISHING_ATLAS_V137, 'filtration-skid', 'Module de filtration'),
  asset(HUB_FURNISHING_ATLAS_V137, 'service-conduits', 'Conduites de service')
]);
const assets = new Map(FORGE_DECORATION_ASSETS_V141.map(entry => [entry.id, entry]));
const defaults = Object.freeze({ floor: 'service-conduits', platform: 'dining-table-side', wall: 'filtration-skid',
  door: 'sterile-cabinet', vent: 'service-conduits', ladder: 'tool-board', lift: 'engine-pump',
  spawn: 'crew-berth', objective: 'medical-trolley', enemy: 'sterile-cabinet', vehicle: 'engine-pump',
  terminal: 'workbench-side', hazard: 'service-conduits' });
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const record = raw => raw !== null && typeof raw === 'object' && !Array.isArray(raw);
export const forgeDecorationAssetV141 = id => assets.get(id) || null;
export const defaultForgeDecorationV141 = cell => ({ assetId: defaults[cell.type] || 'sterile-cabinet', opacity: 1, flipX: false, parallax: 0 });

/** Reject paths, URLs, extra properties and coercion at the JSON boundary. */
export function parseForgeDecorationV141(raw, layer) {
  if (raw === undefined) return undefined;
  const fail = () => { throw new Error('Décor invalide : ressource locale, opacité 0–1, miroir et parallaxe −0,15–0,15 requis.'); };
  if (!['background', 'foreground'].includes(layer) || !record(raw)
    || Object.keys(raw).some(key => !['assetId', 'opacity', 'flipX', 'parallax'].includes(key))
    || typeof raw.assetId !== 'string' || !assets.has(raw.assetId)) fail();
  const opacity = raw.opacity === undefined ? 1 : raw.opacity;
  const flipX = raw.flipX === undefined ? false : raw.flipX;
  const parallax = raw.parallax === undefined ? 0 : raw.parallax;
  if (typeof opacity !== 'number' || !Number.isFinite(opacity) || opacity < 0 || opacity > 1
    || typeof flipX !== 'boolean' || typeof parallax !== 'number' || !Number.isFinite(parallax)
    || parallax < -.15 || parallax > .15) fail();
  return { assetId: raw.assetId, opacity, flipX, parallax };
}

/** Fixed native dimensions define size; one uniform scale preserves crop ratio.
 * The complete sprite stays inside the room, including maximum parallax drift.
 */
export function forgeDecorationPlanV141(room, bounds, { phase, camera = {}, reducedMotion = false, unitScale = 1 } = {}) {
  if (!room || !Array.isArray(room.size) || !Array.isArray(room.cells)
    || !Number.isFinite(bounds?.width) || !Number.isFinite(bounds?.height)
    || bounds.width <= 0 || bounds.height <= 0) return [];
  const cw = bounds.width / room.size[0], ch = bounds.height / room.size[1];
  if (!Number.isFinite(unitScale) || unitScale <= 0) return [];
  return room.cells.filter(cell => ['background', 'foreground'].includes(cell.layer) && (!phase || cell.layer === phase)).map(cell => {
    const decoration = cell.decoration || defaultForgeDecorationV141(cell);
    const source = assets.get(decoration.assetId);
    if (!source) return null;
    const scale = Math.min(source.worldSize.h * unitScale / source.sourceHeight,
      bounds.width / source.sourceWidth, bounds.height / source.sourceHeight);
    const w = source.sourceWidth * scale, h = source.sourceHeight * scale;
    const anchorX = (cell.x + .5) * cw, anchorY = (cell.y + 1) * ch;
    const maxDrift = Math.min(32, cw * .4);
    const cameraX = Number.isFinite(camera.x) ? camera.x : 0;
    const drift = reducedMotion ? 0 : clamp((cameraX - anchorX) * decoration.parallax, -maxDrift, maxDrift);
    return { cellId: cell.id, layer: cell.layer, assetId: source.id, src: source.src,
      x: clamp(anchorX - w / 2 + drift, 0, bounds.width - w), y: clamp(anchorY - source.footSourceY * scale, 0, bounds.height - h),
      w, h, opacity: decoration.opacity, flipX: decoration.flipX,
      anchor: source.anchor, parallax: decoration.parallax, drift, source: source.source,
      sourceWidth: source.sourceWidth, sourceHeight: source.sourceHeight,
      footSourceY: source.footSourceY, worldSize: source.worldSize, projection: source.projection,
      humanReferenceHeight: source.humanReferenceHeight, alphaPolicy: source.alphaPolicy };
  }).filter(Boolean);
}

const imageCaches = new WeakMap();
function imageFor(owner, entry) {
  let cache = imageCaches.get(owner);
  if (!cache) { cache = new Map(); imageCaches.set(owner, cache); }
  if (cache.has(entry.src)) return cache.get(entry.src);
  if (typeof Image !== 'function') return null;
  const image = new Image();
  cache.set(entry.src, image);
  image.addEventListener?.('load', () => { if (!owner.disposed && !owner.destroyed) owner.draw?.(); }, { once: true });
  // entry.src can only originate from the immutable local catalog above.
  image.src = assets.get(entry.assetId).src;
  return image;
}

export function drawForgeDecorationPlanV141(ctx, owner, plan) {
  const drawn = [];
  for (const entry of plan) {
    const image = imageFor(owner, entry);
    if (!image?.complete || !(image.naturalWidth > 0 && image.naturalHeight > 0)) continue;
    ctx.save();
    ctx.globalAlpha = entry.opacity;
    const drawable = resolveSpriteDrawableV134(image), source = entry.source;
    if (entry.flipX) { ctx.translate(entry.x + entry.w, entry.y); ctx.scale(-1, 1); ctx.drawImage(drawable, source.x, source.y, source.w, source.h, 0, 0, entry.w, entry.h); }
    else ctx.drawImage(drawable, source.x, source.y, source.w, source.h, entry.x, entry.y, entry.w, entry.h);
    ctx.restore();
    drawn.push(entry);
  }
  return drawn;
}

export function drawForgeDecorationsV141(ctx, engine, phase) {
  const project = engine.forgeProjectV141;
  if (!(engine.editorMode || engine.editorPlaytest) || !project?.rooms) return [];
  const room = project.rooms.find(entry => entry.id === (engine.forgeActiveRoomIdV141 || project.activeRoomId));
  const bounds = project.kind === 'ship' ? engine.editorShipBoundsV141
    : engine.missionLevelBounds || engine.editorGrid || { width: 6200, height: 1080 };
  const plan = forgeDecorationPlanV141(room, bounds, { phase, camera: engine.camera,
    reducedMotion: Boolean(engine.reducedMotion || engine.accessibilityRuntime?.reducedMotion) });
  const drawn = drawForgeDecorationPlanV141(ctx, engine, plan);
  engine.forgeDecorationDrawsV141 ||= {};
  engine.forgeDecorationDrawsV141[phase] = { roomId: room?.id, planned: plan.length, drawn: drawn.length,
    cells: drawn.map(entry => entry.cellId), entries: plan };
  return drawn;
}

const authoredShip = engine => engine.editorPlaytest && engine.forgeProjectV141?.kind === 'ship';
const authoredMission = engine => engine.editorMode && engine.forgeProjectV141?.kind === 'mission';

/** Same native traversal and actors, without Tantalus campaign room dressing. */
function drawAuthoredShipWorld(ctx, engine) {
  engine.drawTraversal(ctx);
  engine.drawDepthFloorV116?.(ctx);
  for (const enemy of engine.enemies || []) if (enemy.alive) engine.drawEnemy(ctx, enemy);
  engine.drawPlayer(ctx);
  for (const projectile of engine.projectiles || []) {
    ctx.fillStyle = '#f4d477';
    ctx.fillRect(projectile.x, projectile.y, projectile.w, projectile.h);
  }
  for (const door of engine.v51Doors || []) engine.drawRuntimeDoor(ctx, door);
  engine.drawTraversalOcclusions(ctx, 'front');
}

/** The caller has already applied the native camera transform. */
export function withForgeDecorationV141(Base) {
  return class ForgeDecorationV141 extends Base {
    drawBackdrop(ctx) {
      if (!authoredShip(this) && !authoredMission(this)) return super.drawBackdrop(ctx);
      // Reference mission art depicts structural bays absent from the authored
      // grid. Keep an ambient plane; placed layers supply the actual scenery.
      const gradient = ctx.createLinearGradient(0, 0, 0, 720);
      gradient.addColorStop(0, '#060d10'); gradient.addColorStop(1, '#152323');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);
    }
    drawMaintenancePipes(ctx) {
      if (authoredMission(this)) return 0;
      return super.drawMaintenancePipes?.(ctx);
    }
    drawCeilingCables(ctx) {
      if (authoredMission(this)) return 0;
      return super.drawCeilingCables?.(ctx);
    }
    drawForegroundPipes(ctx) {
      if (authoredMission(this)) return 0;
      return super.drawForegroundPipes?.(ctx);
    }
    drawForeground(ctx) {
      if (authoredMission(this)) return;
      return super.drawForeground?.(ctx);
    }
    drawWorld(ctx) {
      drawForgeDecorationsV141(ctx, this, 'background');
      const result = authoredShip(this) ? drawAuthoredShipWorld(ctx, this) : super.drawWorld(ctx);
      drawForgeDecorationsV141(ctx, this, 'foreground');
      return result;
    }
    drawForegroundParallax(ctx) {
      if (!authoredShip(this)) return super.drawForegroundParallax?.(ctx);
    }
    drawHud(ctx) {
      if (!authoredShip(this)) return super.drawHud(ctx);
      const project = this.forgeProjectV141;
      const room = project.rooms.find(entry => entry.id === this.forgeActiveRoomIdV141);
      ctx.save();
      ctx.fillStyle = 'rgba(2, 8, 7, .9)'; ctx.fillRect(18, 18, 720, 76);
      ctx.strokeStyle = '#6fa482'; ctx.strokeRect(18.5, 18.5, 720, 76);
      ctx.font = '700 14px ui-monospace, monospace'; ctx.textAlign = 'left';
      ctx.fillStyle = '#d3e1d6'; ctx.fillText(`FORGE · ${room?.name || project.name}`, 34, 45, 680);
      ctx.fillStyle = this.player.health < 30 ? '#e88980' : '#8bd2a0';
      ctx.fillText(`SANTÉ ${Math.max(0, Math.round(this.player.health))}% · MENACES ${(this.enemies || []).filter(enemy => enemy.alive).length}`, 34, 74);
      const prompt = this.statusPrompt?.();
      if (prompt) {
        ctx.fillStyle = 'rgba(2, 8, 7, .92)'; ctx.fillRect(170, 652, 940, 46);
        ctx.fillStyle = '#c8e8d0'; ctx.textAlign = 'center'; ctx.fillText(prompt, 640, 681, 900);
      }
      if (this.paused) { ctx.fillStyle = '#edce83'; ctx.fillText('PAUSE', 1010, 45); }
      ctx.restore();
    }
  };
}
