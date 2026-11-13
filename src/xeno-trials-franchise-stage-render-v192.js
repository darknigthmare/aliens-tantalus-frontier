import { getXenoTrialsFranchiseStageV192, getXenoTrialsFranchiseStageSceneV192, getXenoTrialsFranchiseStageViewV192,
  getXenoTrialsFranchiseStageAtlasPlanesV192 } from './xeno-trials-franchise-stage-scenes-v192.js';

const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const clip = (ctx, box) => { ctx.beginPath(); ctx.rect(box.x, box.y, box.width, box.height); ctx.clip(); };

/** Bounded two-tile submission preserves each band's aspect. All camera
 * translation is visual; the physical arena and fighter positions are shared. */
export function getXenoTrialsFranchiseStageAtlasLayoutV192(plane, camera = {}) {
  if (!plane || ![plane.sw, plane.sh, plane.parallax].every(Number.isFinite) || !(plane.sw > 0) || !(plane.sh > 0)) return null;
  const floor = clamp(finite(camera.floor, 450), 180, 530);
  const factor = Math.max(1160 / plane.sw, (plane.id === 'foreground' ? 128 : floor) / plane.sh);
  const width = plane.sw * factor, height = plane.sh * factor;
  const origin = (1000 - width) / 2 - (clamp(finite(camera.center, 500), -1e9, 1e9) - 500) * plane.parallax;
  const start = ((origin % width) + width) % width - width;
  const tiles = []; for (let x = start; x < 1000; x += width) tiles.push(x);
  return Object.freeze({ width, height, y: plane.id === 'foreground' ? 560 - height : floor - height, tiles: Object.freeze(tiles) });
}
function paintAtlas(ctx, stage, images, camera, front, renderTick) {
  if (stage.backdrop !== getXenoTrialsFranchiseStageV192(stage.id)?.backdrop) return Object.freeze([]);
  const image = images?.get?.(stage.backdrop), planes = getXenoTrialsFranchiseStageAtlasPlanesV192(stage.id, image), receipts = [];
  for (const plane of planes) {
    if ((plane.plane === 'below-feet') !== front) continue;
    const layout = getXenoTrialsFranchiseStageAtlasLayoutV192(plane, camera); if (!layout) continue;
    ctx.globalAlpha = plane.opacity;
    for (const x of layout.tiles) ctx.drawImage(image, plane.sx, plane.sy, plane.sw, plane.sh, x, layout.y, layout.width, layout.height);
    // A receipt is appended only after the corresponding Canvas submissions.
    // The expected source hash comes from admission; HTTP byte identity is
    // independently checked by the browser pilot, not inferred from Image.
    receipts.push(Object.freeze({ id: plane.id, stageId: stage.id, path: stage.backdrop,
      expectedSourceSha256: plane.expectedSourceSha256, sourceIdentity: 'admitted-registry-expected-sha256',
      sourceRect: Object.freeze([plane.sx, plane.sy, plane.sw, plane.sh]), renderTick, drawn: true,
      destination: Object.freeze({ width: layout.width, height: layout.height, y: layout.y, xPositions: layout.tiles }), tiles: layout.tiles.length }));
  }
  return Object.freeze(receipts);
}
function fixtures(ctx, profile, view) {
  const exterior = /exterior|outlook|surface|ridge|sea|ocean|forest|jungle|street|mountain|desert|planet/.test(profile.architecture);
  ctx.globalAlpha = exterior ? .11 : .17; ctx.lineWidth = 1.3; ctx.strokeStyle = profile.accent; ctx.fillStyle = '#071116';
  for (const anchor of profile.anchors) {
    const x = anchor * 1000 + view.fixtureOffsetX, y = view.floor * .12;
    if (exterior) {
      ctx.beginPath(); ctx.moveTo(x, y + 22); ctx.lineTo(x, view.floor * .38); ctx.stroke();
      ctx.fillRect(x - 3, y + 20, 6, 3);
    } else {
      const width = 91 + profile.seed % 4 * 17, height = view.floor * (.26 + profile.seed % 3 * .025);
      ctx.strokeRect(x - width / 2, y, width, height);
      ctx.strokeRect(x - width / 2 + 5, y + 5, width - 10, height - 10);
      ctx.fillRect(x - width / 2 - 3, y + height + 4, width + 6, 3);
      if (/hive|biomech|engineer/.test(profile.architecture)) {
        for (let n = 0; n < 4; n++) { ctx.beginPath(); ctx.ellipse(x - width * .35 + n * width * .23, y + height / 2, 7, height * .43, .15, 0, Math.PI * 2); ctx.stroke(); }
      }
    }
  }
}
function eventDraw(ctx, event, profile, view) {
  if (!event.active) return null;
  const p = event.progress, x = event.x, y = event.y, s = event.scale, ax = event.anchorX;
  const envelope = Math.min(1, p * 7, (1 - p) * 7);
  ctx.globalAlpha = .3 * envelope; ctx.strokeStyle = profile.accent; ctx.fillStyle = profile.accent; ctx.lineWidth = 1.3;
  switch (event.kind) {
    case 'airlock-cycle': {
      const w = 94 * s, h = 91 * s, gap = Math.sin(p * Math.PI);
      ctx.fillStyle = '#071014'; ctx.fillRect(ax - w / 2, y, w, h);
      ctx.fillStyle = profile.accent; ctx.fillRect(ax - w / 2, y, w / 2 * (1 - gap), h);
      ctx.fillRect(ax + w / 2 * gap, y, w / 2 * (1 - gap), h); ctx.strokeRect(ax - w / 2, y, w, h); break;
    }
    case 'coolant-plume':
      for (let i = 0; i < 5; i++) { ctx.globalAlpha = .035 * envelope; ctx.beginPath(); ctx.ellipse(ax + i * 19 + p * 28, y - i * 7, 35 + i * 8, 7 + i * 2, -.1, 0, Math.PI * 2); ctx.fill(); } break;
    case 'reactor-conduit':
      ctx.strokeRect(ax - 11, y, 22, 107 * s);
      for (let i = 0; i < 6; i++) { ctx.globalAlpha = (.12 + .1 * Math.sin(p * Math.PI + i * .4)) * envelope; ctx.fillRect(ax - 7, y + i * 15 * s + 7, 14, 4); } break;
    case 'freight-transit':
    case 'rail-transit': {
      const w = (event.kind === 'rail-transit' ? 155 : 95) * s, h = 42 * s;
      ctx.fillStyle = '#091217'; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
      for (let i = 1; i < 5; i++) ctx.strokeRect(x + i * w / 5, y + 4, 1, h - 8);
      ctx.beginPath(); ctx.moveTo(x - 20, y + h + 4); ctx.lineTo(x + w + 20, y + h + 4); ctx.stroke(); break;
    }
    case 'containment-scan':
    case 'archive-scan': {
      const w = event.kind === 'containment-scan' ? 78 : 48, h = 74;
      ctx.strokeRect(ax - w / 2, y, w, h); ctx.globalAlpha = .15 * envelope; ctx.fillRect(ax - w / 2 + 3, y + p * (h - 7), w - 6, 3);
      if (event.kind === 'archive-scan') for (let n = 0; n < 5; n++) ctx.strokeRect(ax - w / 2 + 5, y + 6 + n * 12, w - 10, 5); break;
    }
    case 'shuttle-approach':
      ctx.fillStyle = '#0a151b'; ctx.beginPath(); ctx.moveTo(x - 22 * s, y + 25 * s); ctx.lineTo(x + 13 * s, y - 9 * s);
      ctx.lineTo(x + 91 * s, y - 9 * s); ctx.lineTo(x + 125 * s, y + 25 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = profile.accent; ctx.fillRect(x + 15 * s, y, 25 * s, 3 * s); break;
    case 'orbital-transit':
      ctx.beginPath(); ctx.moveTo(x - 9 * s, y); ctx.lineTo(x + 54 * s, y - 5 * s); ctx.lineTo(x + 83 * s, y + 3 * s); ctx.lineTo(x + 54 * s, y + 11 * s); ctx.closePath(); ctx.stroke();
      ctx.fillRect(x + 11 * s, y + 2 * s, 34 * s, 2); break;
    case 'storm-front':
    case 'sand-drift':
      for (let i = 0; i < 6; i++) { ctx.globalAlpha = .07 * envelope; ctx.fillRect(x + i * 99, y + (i * 31 % 93), 37 + i * 5, event.kind === 'sand-drift' ? 2 : 1); } break;
    case 'rain-curtain':
      for (let i = 0; i < 13; i++) { const xx = ax - 95 + i * 17, yy = y + ((p + i * .11) % 1) * view.floor * .3; ctx.globalAlpha = .14 * envelope; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - 4, yy + 16); ctx.stroke(); } break;
    case 'ash-drift':
    case 'spore-drift':
    case 'snow-drift':
      for (let i = 0; i < 9; i++) {
        const xx = ax - 96 + i * 25 + Math.sin(p * Math.PI + i) * 17, yy = y + ((p + i * .13) % 1) * view.floor * .33;
        ctx.globalAlpha = .13 * envelope; ctx.beginPath(); ctx.ellipse(xx, yy, event.kind === 'spore-drift' ? 2.5 : 1.5, event.kind === 'ash-drift' ? 1 : 2, 0, 0, Math.PI * 2); ctx.fill();
      } break;
    case 'hive-movement':
      ctx.fillStyle = '#081015'; ctx.beginPath(); ctx.ellipse(x + 28 * s, y, 23 * s, 8 * s, -.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 43 * s, y + 8 * s); ctx.lineTo(x + 52 * s, y + 39 * s); ctx.lineTo(x + 28 * s, y + 48 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 28 * s, y + 48 * s); ctx.quadraticCurveTo(x - 52 * s, y + 38 * s, x - 63 * s, y - 2 * s); ctx.stroke(); break;
    case 'bioluminescent-pulse':
      for (let i = 0; i < 5; i++) { ctx.globalAlpha = (.06 + .04 * Math.sin(p * Math.PI + i)) * envelope; ctx.beginPath(); ctx.ellipse(ax - 42 + i * 22, y + i % 2 * 17, 6 + i % 3, 12, .18, 0, Math.PI * 2); ctx.fill(); } break;
    case 'furnace-embers':
      for (let i = 0; i < 9; i++) { ctx.globalAlpha = .22 * envelope; const xx = ax - 50 + i * 13 + Math.sin(p * Math.PI + i) * 8, yy = y + 90 - ((p + i * .17) % 1) * 85; ctx.fillRect(xx, yy, 2, 3); } break;
    case 'ocean-swell':
      for (let i = 0; i < 4; i++) { ctx.globalAlpha = .1 * envelope; ctx.beginPath(); ctx.moveTo(ax - 95, y + i * 11); ctx.quadraticCurveTo(ax + 7, y + i * 11 - Math.sin(p * Math.PI) * 12, ax + 105, y + i * 11); ctx.stroke(); } break;
    case 'searchlight-sweep': {
      const sweep = Math.sin(p * Math.PI * 2) * 61;
      ctx.globalAlpha = .06 * envelope; ctx.beginPath(); ctx.moveTo(ax, y); ctx.lineTo(ax - 32 + sweep, y + 126); ctx.lineTo(ax + 32 + sweep, y + 126); ctx.closePath(); ctx.fill(); break;
    }
    case 'water-drip':
      for (let i = 0; i < 4; i++) { ctx.globalAlpha = .17 * envelope; const yy = y + ((p + i * .19) % 1) * view.floor * .3; ctx.beginPath(); ctx.ellipse(ax + i * 18, yy, 1, 3, 0, 0, Math.PI * 2); ctx.fill(); } break;
    default: return null;
  }
  return Object.freeze({ id: event.id, kind: event.kind, renderTick: event.renderTick,
    progress: p, drawn: true, source: 'cosmetic-procedural-stage-event-v192', affectsCombat: false });
}

export function drawXenoTrialsFranchiseStageRearV192(ctx, stage, images, camera = {}, tick = 0, options = {}) {
  const profile = getXenoTrialsFranchiseStageSceneV192(stage?.id), view = getXenoTrialsFranchiseStageViewV192(stage?.id, camera, tick, options);
  if (!profile || !view) return null;
  ctx.save(); ctx.fillStyle = stage.background; ctx.fillRect(0, 0, 1000, 560);
  ctx.save(); clip(ctx, view.rearClip);
  const drawnPlanes = paintAtlas(ctx, stage, images, camera, false, view.renderTick);
  fixtures(ctx, profile, view);
  const eventReceipts = [];
  for (const event of view.events) { const receipt = eventDraw(ctx, event, profile, view); if (receipt) eventReceipts.push(receipt); }
  ctx.restore();
  ctx.globalAlpha = 1; ctx.fillStyle = stage.floor; ctx.fillRect(0, view.floor, 1000, 560 - view.floor);
  ctx.globalAlpha = .5; ctx.fillStyle = stage.accent; ctx.fillRect(0, view.floor, 1000, 2);
  ctx.globalAlpha = .1; ctx.strokeStyle = stage.accent;
  const start = -120 - ((clamp(finite(camera.center, 500), -1e9, 1e9) - 500) % 100);
  for (let x = start; x < 1120; x += 100) { ctx.beginPath(); ctx.moveTo(x, view.floor + 3); ctx.lineTo(x - 70, 560); ctx.stroke(); }
  ctx.restore();
  return Object.freeze({ ...view, drawnPlanes, drawnEvents: Object.freeze(eventReceipts.map(event => event.id)),
    eventReceipts: Object.freeze(eventReceipts), proceduralFallback: drawnPlanes.length === 0 });
}

/** The near image and its faster rail stay strictly below the common feet
 * plane; neither can hide a standing/prone body or a low projectile. */
export function drawXenoTrialsFranchiseStageFrontV192(ctx, stage, images, camera = {}, tick = 0, options = {}) {
  const profile = getXenoTrialsFranchiseStageSceneV192(stage?.id), view = getXenoTrialsFranchiseStageViewV192(stage?.id, camera, tick, options);
  if (!profile || !view) return null;
  ctx.save(); clip(ctx, view.frontClip);
  const drawnPlanes = paintAtlas(ctx, stage, images, camera, true, view.renderTick);
  ctx.globalAlpha = .22; ctx.fillStyle = '#050d13'; ctx.strokeStyle = profile.accent; ctx.lineWidth = 1;
  const spacing = 228 + profile.seed % 3 * 23, start = -spacing + ((view.foregroundOffsetX % spacing) + spacing) % spacing;
  for (let x = start; x < 1000; x += spacing) { ctx.fillRect(x, 544, 117, 16); ctx.strokeRect(x + 8, 549, 72, 2); }
  ctx.restore();
  return Object.freeze({ ...view, drawnPlanes, proceduralFallback: drawnPlanes.length === 0 });
}
