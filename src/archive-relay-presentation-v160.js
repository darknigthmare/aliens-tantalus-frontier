import { ARCHIVE_RELAY_PROPS_V122, archiveRelayGeometryV122 } from './archive-relay-runtime-v122.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122 } from './archive-relay-state-v122.js';
import { HUB_INTERIOR_WALL_ATLAS_V138 } from './hub-interior-wall-atlas-v138.js';
import { HUB_ANNEX_STATION_ATLAS_V139 } from './hub-annex-station-atlas-v139.js';
import { HUB_FURNITURE_ATLAS_V139 } from './hub-furniture-atlas-v139.js';
import { HUB_PROP_ATLAS_V136 } from './hub-prop-atlas-v136.js';
import { HUB_SURFACE_DETAILS_ATLAS_V139 } from './hub-surface-details-atlas-v139.js';

const ART = Object.freeze({ wall: HUB_INTERIOR_WALL_ATLAS_V138, station: HUB_ANNEX_STATION_ATLAS_V139,
  furniture: HUB_FURNITURE_ATLAS_V139, prop: HUB_PROP_ATLAS_V136, detail: HUB_SURFACE_DETAILS_ATLAS_V139 });
export const ARCHIVE_RELAY_ART_V160 = Object.freeze(Object.fromEntries(Object.entries(ART)
  .map(([key, atlas]) => [key, Object.freeze({ path: atlas.asset, width: atlas.width, height: atlas.height, sha256: atlas.sha256 })])));
const bundles = new WeakMap();
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

/** Five existing admitted RGBA atlases. No source pixels or alpha are edited. */
export function loadArchiveRelayArtV160(ImageType = globalThis.Image) {
  if (typeof ImageType !== 'function') return { images: {}, ready: false, missing: Object.keys(ART), promise: Promise.resolve(false) };
  if (bundles.has(ImageType)) return bundles.get(ImageType);
  const bundle = { images: {}, ready: false, missing: [], promise: null };
  bundle.promise = Promise.all(Object.entries(ARCHIVE_RELAY_ART_V160).map(([key, art]) => new Promise(resolve => {
    const image = new ImageType(); bundle.images[key] = image;
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      const valid = image.complete && image.naturalWidth === art.width && image.naturalHeight === art.height;
      if (!valid) bundle.missing.push(key);
      resolve(valid);
    };
    image.onload = done; image.onerror = done; image.src = art.path;
    if (image.complete && image.naturalWidth > 0) done();
  }))).then(results => (bundle.ready = results.every(Boolean)));
  bundles.set(ImageType, bundle);
  return bundle;
}

const placement = (atlasKey, cellId, centerX, groundY, width, role) => {
  const cell = ART[atlasKey].cells[cellId], scale = width / cell.source.w;
  return { atlasKey, cellId, role, plane: 'rear', collidable: false,
    source: { ...cell.source }, contactY: groundY, x: centerX - width / 2,
    y: groundY - cell.footSourceY * scale, w: width, h: cell.source.h * scale };
};

/** All primary stations inherit the actual interactable's measured foot point.
 * These are rear props, never extra colliders, prompts or walkable furniture. */
export function archiveRelayPresentationLayoutV160(anchors = ARCHIVE_RELAY_PROPS_V122) {
  const at = (atlas, cell, id, width) => placement(atlas, cell, anchors[id].x, anchors[id].groundY, width, id);
  const pdaBench = at('furniture', 'workbench-side', 'pda', 110);
  const benchCell = HUB_FURNITURE_ATLAS_V139.cells['workbench-side'];
  const worktop = pdaBench.y + benchCell.usefulSurfaceSource.y * pdaBench.w / benchCell.source.w;
  const primary = [pdaBench, at('station', 'arrival-airlock', 'relay', 92),
    at('station', 'logistics', 'engineering', 112), at('station', 'cctv', 'security', 106),
    at('station', 'logistics', 'freight', 112), at('station', 'mire-archives', 'analysis', 120)];
  return { projection: 'whole-room-2d', mixedProjectionAllowed: false, primary,
    pdaScreen: { x: anchors.pda.x - 11, y: worktop - 18, w: 22, h: 18, contactY: worktop },
    dressing: [placement('prop', 'data-cabinet', 1240, 570, 76, 'archive-storage'),
      placement('prop', 'tool-board', 698, 466, 76, 'wall-tools'),
      placement('detail', 'document-binders', 158, worktop, 24, 'pda-binders'),
      placement('prop', 'data-cabinet', 740, 355, 76, 'upper-archive-storage')],
    interactables: Object.entries(anchors).map(([id, value]) => ({ id, ...value })) };
}

function drawPlacement(ctx, item, art) {
  const image = art?.images?.[item.atlasKey], source = item.source;
  if (!image?.complete || image.naturalWidth !== ART[item.atlasKey].width
    || image.naturalHeight !== ART[item.atlasKey].height) return false;
  ctx.drawImage(image, source.x, source.y, source.w, source.h, item.x, item.y, item.w, item.h);
  return true;
}

function wallMaterial(ctx, art, kind, bounds) {
  const cell = HUB_INTERIOR_WALL_ATLAS_V138.cells[kind], source = cell.source;
  ctx.fillStyle = cell.backing; ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  const image = art?.images?.wall;
  if (!image?.complete || image.naturalWidth !== HUB_INTERIOR_WALL_ATLAS_V138.width) return;
  // Tile measured inner faces at source scale. Neither transparent gutters nor
  // an enlarged single room illustration become this level's wall.
  for (let x = 0; x < bounds.w; x += source.w) for (let y = 0; y < bounds.h; y += source.h) {
    const width = Math.min(source.w, bounds.w - x), height = Math.min(source.h, bounds.h - y);
    ctx.drawImage(image, source.x, source.y, width, height, bounds.x + x, bounds.y + y, width, height);
  }
}

function sign(ctx, text, x, y, width) {
  ctx.fillStyle = '#142524'; ctx.fillRect(x, y, width, 24);
  ctx.strokeStyle = '#72867b'; ctx.strokeRect(x, y, width, 24);
  ctx.fillStyle = '#cfdbc8'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left';
  ctx.fillText(text, x + 8, y + 16, width - 16);
}

/** World-coordinate rear scene, shared by the playable level and its shots. */
export function drawArchiveRelayEnvironmentV160(ctx, { art, state = {}, geometry = archiveRelayGeometryV122(),
  anchors = ARCHIVE_RELAY_PROPS_V122 } = {}) {
  if (!geometry?.platforms?.some(item => item.floor) || !geometry.missionLevelBounds) geometry = archiveRelayGeometryV122();
  const layout = archiveRelayPresentationLayoutV160(anchors), floor = geometry.platforms.find(item => item.floor);
  ctx.save();
  ctx.fillStyle = '#0a1215'; ctx.fillRect(0, 0, geometry.missionLevelBounds.width, 720);
  wallMaterial(ctx, art, 'cargo', { x: 0, y: 0, w: 350, h: floor.y });
  wallMaterial(ctx, art, 'archive', { x: 350, y: 0, w: 1040, h: floor.y });
  wallMaterial(ctx, art, 'industrial', { x: 1390, y: 0, w: 410, h: floor.y });
  ctx.fillStyle = '#0b1715c9'; ctx.fillRect(0, 0, 1800, 155);
  ctx.fillStyle = '#101d1ccc'; ctx.fillRect(350, 376, 750, 194);
  // Rear cable trays and brackets follow the actual gallery, leaving the
  // ladder opening and the pedestrian rail visually clear.
  ctx.fillStyle = '#263b39'; ctx.fillRect(20, 168, 1740, 9);
  ctx.fillStyle = '#60716a'; ctx.fillRect(20, 168, 1740, 2);
  for (const x of [22, 349, 1098, 1350, 1760]) {
    ctx.fillStyle = '#182b2b'; ctx.fillRect(x, 178, 14, floor.y - 178);
    ctx.fillStyle = '#52635b'; ctx.fillRect(x, 178, 2, floor.y - 178);
  }
  for (const platform of geometry.platforms.filter(item => !item.floor)) {
    ctx.fillStyle = '#1f3331'; ctx.fillRect(platform.x, platform.y + platform.h, platform.w, 12);
    for (const x of [platform.x + 5, platform.x + platform.w - 18]) {
      ctx.fillStyle = '#293c36'; ctx.fillRect(x, platform.y + platform.h, 10, floor.y - platform.y - platform.h);
    }
    ctx.strokeStyle = '#70817a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(platform.x, platform.y - 44); ctx.lineTo(410, platform.y - 44);
    ctx.moveTo(472, platform.y - 44); ctx.lineTo(platform.x + platform.w, platform.y - 44); ctx.stroke();
    for (const x of [350, 530, 720, 910, 1096]) { ctx.beginPath(); ctx.moveTo(x, platform.y - 44); ctx.lineTo(x, platform.y); ctx.stroke(); }
  }
  sign(ctx, 'QZ-18 / RELAIS LOCAL', 46, 199, 245);
  sign(ctx, 'INGÉNIERIE', anchors.engineering.x - 68, anchors.engineering.groundY - 116, 136);
  sign(ctx, 'SÉCURITÉ', anchors.security.x - 58, anchors.security.groundY - 116, 116);
  sign(ctx, 'QUAI / FRET', 910, 414, 130);
  sign(ctx, 'CONFRONTATION', 1094, 414, 144);
  sign(ctx, 'RETOUR TANTALUS  →', 1496, 392, 220);
  for (const item of [...layout.dressing, ...layout.primary]) {
    if (!drawPlacement(ctx, item, art)) {
      ctx.fillStyle = '#233936'; ctx.fillRect(item.x, item.y, item.w, item.h);
      ctx.strokeStyle = '#718178'; ctx.strokeRect(item.x, item.y, item.w, item.h);
    }
  }
  const screen = layout.pdaScreen;
  ctx.fillStyle = '#121a17'; ctx.fillRect(screen.x, screen.y, screen.w, screen.h);
  ctx.fillStyle = '#a6c5a3'; ctx.fillRect(screen.x + 3, screen.y + 3, screen.w - 6, 2);
  ctx.fillRect(screen.x + 3, screen.y + 8, screen.w - 9, 1);
  for (const item of layout.primary) {
    const lit = item.role === 'pda' || item.role === 'relay' ? state.badge === true : state.power === true;
    ctx.fillStyle = lit ? '#b7d6a6' : '#9e773b'; ctx.fillRect(item.x + item.w / 2 - 3, item.y - 8, 6, 4);
  }
  const extraction = anchors.extraction;
  ctx.fillStyle = '#1b2d29'; ctx.fillRect(extraction.x - 34, extraction.groundY - 122, 68, 122);
  ctx.strokeStyle = '#678276'; ctx.strokeRect(extraction.x - 34, extraction.groundY - 122, 68, 122);
  ctx.fillStyle = state.verdict ? '#b9e3ad' : '#9d7137'; ctx.fillRect(extraction.x - 21, extraction.groundY - 104, 42, 31);
  ctx.fillStyle = '#13201b'; ctx.font = 'bold 9px monospace'; ctx.fillText('RETOUR', extraction.x - 17, extraction.groundY - 84);
  ctx.restore();
  return layout;
}

/** The full-height collider is a mobile bulkhead, composed of frontal panels;
 * no domestic door sprite is stretched over its entire structural height. */
export function drawArchiveRelayGateV160(ctx, door) {
  const progress = Math.max(0, Math.min(1, finite(door.progress, door.open ? 1 : 0)));
  const leafWidth = door.w * (1 - progress) / 2;
  ctx.save();
  ctx.fillStyle = '#101b19'; ctx.fillRect(door.x - 18, door.y, 18, door.h); ctx.fillRect(door.x + door.w, door.y, 18, door.h);
  ctx.fillStyle = '#65706a'; ctx.fillRect(door.x - 6, door.y, 4, door.h); ctx.fillRect(door.x + door.w + 2, door.y, 4, door.h);
  for (const x of [door.x, door.x + door.w - leafWidth]) {
    ctx.fillStyle = '#34443f'; ctx.fillRect(x, door.y, leafWidth, door.h);
    ctx.strokeStyle = '#7b8676'; ctx.lineWidth = 1;
    for (let y = door.y + 24; y < door.y + door.h; y += 72) {
      ctx.strokeRect(x + 2, y, Math.max(0, leafWidth - 4), Math.min(62, door.y + door.h - y));
    }
  }
  ctx.fillStyle = door.open ? '#b9d5a5' : '#d1a358'; ctx.fillRect(door.x - 11, door.y + door.h - 156, 5, 28);
  ctx.restore();
  return { x: door.x, y: door.y, w: door.w, h: door.h, progress };
}

/** An actual scene shot, without invented occupants, discoveries or a victory.
 * Static structural layers come from the very same physical geometry. */
export function drawArchiveRelayInsertionShotV160(ctx, { art, cameraX = 0, width = 1280, height = 720 } = {}) {
  const geometry = archiveRelayGeometryV122();
  ctx.save(); ctx.clearRect(0, 0, width, height); ctx.translate(-cameraX, 0);
  drawArchiveRelayEnvironmentV160(ctx, { art, geometry });
  for (const platform of geometry.platforms) {
    ctx.fillStyle = '#324740'; ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = '#a0afa0'; ctx.fillRect(platform.x, platform.y, platform.w, 3);
  }
  for (const ladder of geometry.ladders) {
    ctx.strokeStyle = '#7e8c7e'; ctx.lineWidth = 4;
    for (const x of [ladder.x + 7, ladder.x + ladder.w - 7]) { ctx.beginPath(); ctx.moveTo(x, ladder.top); ctx.lineTo(x, ladder.bottom); ctx.stroke(); }
    for (let y = ladder.top + 12; y < ladder.bottom; y += 19) { ctx.beginPath(); ctx.moveTo(ladder.x + 7, y); ctx.lineTo(ladder.x + ladder.w - 7, y); ctx.stroke(); }
  }
  drawArchiveRelayGateV160(ctx, geometry.doors[0]); ctx.restore();
  return { cameraX, width, height, geometry, projection: 'whole-room-2d', occupantsInvented: false };
}

export function withArchiveRelayPresentationV160(Base) {
  if (Base.archiveRelayPresentationV160 === true) return Base;
  return class ArchiveRelayPresentationV160 extends Base {
    static archiveRelayPresentationV160 = true;
    start(options = {}) {
      this.archiveRelayArtV160 = options.campaign?.id === ARCHIVE_RELAY_CAMPAIGN_V122.id ? loadArchiveRelayArtV160() : null;
      return super.start(options);
    }
    drawBackdrop(ctx) {
      if (!this.isArchiveRelayV122?.()) return super.drawBackdrop(ctx);
      // The old QZ-18 backdrop drew every console in screen coordinates while
      // the actor and colliders scrolled. Rear props now follow the same camera.
      ctx.save(); ctx.translate(-finite(this.camera?.x), -finite(this.camera?.y));
      drawArchiveRelayEnvironmentV160(ctx, { art: this.archiveRelayArtV160, state: this.archiveRelayV122,
        geometry: { platforms: this.platforms, ladders: this.ladders, doors: this.doors, missionLevelBounds: this.missionLevelBounds } });
      ctx.restore();
    }
    drawDoor(ctx, door) {
      if (!this.isArchiveRelayV122?.() || door.id !== 'qz18-return-gate') return super.drawDoor(ctx, door);
      return drawArchiveRelayGateV160(ctx, door);
    }
    getDoorRenderState(door, options) {
      const result = super.getDoorRenderState(door, options);
      return !this.isArchiveRelayV122?.() || door.id !== 'qz18-return-gate' ? result
        : { ...result, image: null, x: door.x - 18, y: door.y, w: door.w + 36, h: door.h,
          visualMode: 'modular-mobile-bulkhead', physicalOpening: { x: door.x, y: door.y, w: door.w, h: door.h } };
    }
    getSnapshot() {
      const snapshot = super.getSnapshot();
      if (!this.isArchiveRelayV122?.()) return snapshot;
      return { ...snapshot, archiveRelayPresentationV160: { ready: this.archiveRelayArtV160?.ready === true,
        missing: [...(this.archiveRelayArtV160?.missing || [])], sourceStatus: 'reused-original-project-assets',
        projection: 'whole-room-2d', canonicalArtCertified: false,
        layout: archiveRelayPresentationLayoutV160() } };
    }
  };
}
