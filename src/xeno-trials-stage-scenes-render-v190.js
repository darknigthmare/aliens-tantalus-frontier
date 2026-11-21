import { getXenoTrialsStageSceneV190, getXenoTrialsStageViewV190, getXenoTrialsStageAtlasPlanesV190 } from './xeno-trials-stage-scenes-v190.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const clip = (ctx, box) => { ctx.beginPath(); ctx.rect(box.x, box.y, box.width, box.height); ctx.clip(); };

/** At most two tiles per plane, even after an extreme camera pan. Source
 * rectangles preserve the aspect of each band, not the whole atlas square. */
export function getXenoTrialsStageAtlasLayoutV190(plane, camera = {}) {
  if (!plane || !(plane.sw > 0) || !(plane.sh > 0) || !Number.isFinite(plane.sw) || !Number.isFinite(plane.sh)) return null;
  const floor = clamp(finite(camera.floor, 450), 180, 530);
  const factor = Math.max(1160 / plane.sw, (plane.id === 'foreground' ? 128 : floor) / plane.sh);
  const width = plane.sw * factor, height = plane.sh * factor;
  const origin = (1000 - width) / 2 - (finite(camera.center, 500) - 500) * plane.parallax;
  const start = ((origin % width) + width) % width - width;
  const tiles = [];
  for (let x = start; x < 1000; x += width) tiles.push(x);
  return Object.freeze({ width, height, y: plane.id === 'foreground' ? 560 - height : floor - height, tiles: Object.freeze(tiles) });
}
function paintAtlas(ctx, stage, images, camera, front) {
  const image = images?.get?.(stage.backdrop), planes = getXenoTrialsStageAtlasPlanesV190(stage.id, image), receipts = [];
  for (const plane of planes) {
    if ((plane.plane === 'below-feet') !== front) continue;
    const layout = getXenoTrialsStageAtlasLayoutV190(plane, camera);
    if (!layout) continue;
    ctx.globalAlpha = plane.opacity;
    for (const x of layout.tiles) ctx.drawImage(image, plane.sx, plane.sy, plane.sw, plane.sh, x, layout.y, layout.width, layout.height);
    receipts.push(Object.freeze({ id: plane.id, path: stage.backdrop,
      sourceRect: Object.freeze([plane.sx, plane.sy, plane.sw, plane.sh]),
      destination: Object.freeze({ width: layout.width, height: layout.height, y: layout.y, xPositions: layout.tiles }), tiles: layout.tiles.length }));
  }
  return Object.freeze(receipts);
}

function drawFixtures(ctx, profile, view) {
  ctx.lineWidth = 1.5; ctx.strokeStyle = profile.accent; ctx.fillStyle = profile.accent;
  const exterior = /outlook|perimeter|apron|overlook/.test(profile.architecture);
  ctx.globalAlpha = exterior ? .12 : .20;
  for (const anchor of profile.anchors) {
    const x = anchor * 1000 + view.fixtureOffsetX, y = view.floor * .18;
    if (exterior) {
      ctx.beginPath(); ctx.moveTo(x, y + 50); ctx.lineTo(x, y + 120); ctx.stroke();
      ctx.fillRect(x - 5, y + 46, 10, 4);
    } else {
      const width = 108 + profile.seed % 4 * 17, height = view.floor * (.18 + profile.seed % 3 * .025);
      ctx.strokeRect(x - width / 2, y, width, height);
      ctx.strokeRect(x - width / 2 + 6, y + 6, width - 12, height - 12);
      const bars = /rail|sealed|specimen/.test(profile.architecture) ? 5 : 2;
      for (let i = 1; i <= bars; i++) ctx.fillRect(x - width / 2 + width * i / (bars + 1), y + 7, 2, height - 14);
      ctx.fillRect(x - width / 2, y + height + 8, width, 3);
    }
  }
}
function drawEvent(ctx, event, profile, view) {
  if (!event.active) return false;
  const p = event.progress, x = event.x, y = event.y, s = event.scale;
  // All action stays in a rear-plane window. Brightness is local, low and
  // slowly varying; there is no strobe, full-screen blackout or new hazard.
  const envelope = Math.min(1, p * 8, (1 - p) * 8);
  ctx.globalAlpha = .34 * envelope; ctx.fillStyle = profile.accent;
  ctx.strokeStyle = profile.accent; ctx.lineWidth = 1.5;
  switch (event.kind) {
    case 'containment-transit': {
      const w = 104 * s, h = 58 * s;
      ctx.fillStyle = '#101b20'; ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      for (let i = 1; i < 6; i++) ctx.strokeRect(x + w * i / 6, y + 5, 1, h - 10);
      ctx.beginPath(); ctx.moveTo(x + 12, y); ctx.lineTo(x + 12, y - 25 * s); ctx.lineTo(x + w - 12, y - 25 * s); ctx.lineTo(x + w - 12, y); ctx.stroke();
      ctx.fillStyle = profile.accent; ctx.fillRect(x + 7, y + h - 7, w - 14, 3);
      break;
    }
    case 'inspection-drone':
      ctx.fillRect(x, y, 34 * s, 12 * s); ctx.strokeRect(x - 10 * s, y - 4 * s, 54 * s, 20 * s);
      ctx.beginPath(); ctx.moveTo(x + 17 * s, y + 14 * s); ctx.lineTo(x - 10 * s, y + 54 * s); ctx.lineTo(x + 44 * s, y + 54 * s); ctx.closePath(); ctx.stroke();
      break;
    case 'gallery-shutters': {
      const ax = event.anchorX, w = 112, h = view.floor * .20, opening = Math.sin(p * Math.PI);
      ctx.fillStyle = '#071116'; ctx.fillRect(ax - w / 2, y, w, h);
      ctx.fillStyle = profile.accent; ctx.fillRect(ax - w / 2, y, w * .5 * (1 - opening), h); ctx.fillRect(ax + w / 2 * opening, y, w * .5 * (1 - opening), h);
      ctx.strokeRect(ax - w / 2, y, w, h); break;
    }
    case 'cargo-shuttle':
      ctx.fillStyle = '#111d23'; ctx.fillRect(x, y, 160 * s, 35 * s);
      ctx.beginPath(); ctx.moveTo(x - 22 * s, y + 35 * s); ctx.lineTo(x + 20 * s, y - 12 * s); ctx.lineTo(x + 136 * s, y - 12 * s); ctx.lineTo(x + 182 * s, y + 35 * s); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = profile.accent; ctx.fillRect(x + 18 * s, y + 3 * s, 30 * s, 5 * s); ctx.fillRect(x + 120 * s, y + 22 * s, 22 * s, 3 * s); break;
    case 'service-gantry':
      ctx.strokeRect(x, y, 96 * s, 32 * s); ctx.strokeRect(x + 6 * s, y + 32 * s, 84 * s, 10 * s);
      ctx.beginPath(); ctx.moveTo(x + 48 * s, y); ctx.lineTo(x + 48 * s, Math.max(0, y - 90)); ctx.stroke();
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + i * 24 * s, y); ctx.lineTo(x + (i - 1) * 24 * s, y + 32 * s); ctx.stroke(); } break;
    case 'archival-pulse': {
      const ax = event.anchorX;
      ctx.strokeRect(ax - 24, y, 48, 70);
      for (let i = 0; i < 5; i++) { ctx.globalAlpha = (.12 + .12 * Math.sin(p * Math.PI + i * .6)) * envelope; ctx.fillRect(ax - 16, y + 9 + i * 11, 17 + i % 3 * 5, 3); }
      break;
    }
    case 'coolant-vent': {
      const ax = event.anchorX;
      for (let i = 0; i < 4; i++) { ctx.globalAlpha = .045 * envelope; ctx.beginPath(); ctx.ellipse(ax + i * 23 + p * 25, y - i * 8, 42 + i * 8, 8 + i * 2, -.12, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'witness-transfer':
      ctx.fillStyle = '#071014';
      for (let i = 0; i < 3; i++) {
        const xx = x + i * 26 * s;
        ctx.beginPath(); ctx.ellipse(xx, y, 5 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(xx - 6 * s, y + 7 * s, 12 * s, 22 * s); ctx.fillRect(xx - 6 * s, y + 29 * s, 4 * s, 12 * s); ctx.fillRect(xx + 2 * s, y + 29 * s, 4 * s, 12 * s);
      } break;
    case 'storm-sweep':
      for (let i = 0; i < 7; i++) { const xx = x + i * 79, yy = y + (i * 37 % 117); ctx.globalAlpha = .09 * envelope; ctx.fillRect(xx, yy, 30 + i * 2, 1); } break;
    case 'distant-traffic':
      ctx.fillRect(x, y, 28 * s, 3 * s); ctx.fillRect(x + 38 * s, y + 7 * s, 18 * s, 2 * s); break;
    case 'resin-fall':
      for (let i = 0; i < 5; i++) {
        const xx = event.anchorX + i * 19, yy = view.floor * .13 + ((p + i * .13) % 1) * view.floor * .38;
        ctx.globalAlpha = .16 * envelope; ctx.beginPath(); ctx.ellipse(xx, yy, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
      } break;
  }
  return true;
}

/** Existing forty settings: call after V119's rear image planes. Corporate
 * four: call INSTEAD of V119's arena, because the selected backdrop is an atlas.
 * Returned receipts describe actual submitted Canvas crop draws, not decoding. */
export function drawXenoTrialsStageRearV190(ctx, stage, images, camera = {}, tick = 0, options = {}) {
  const profile = getXenoTrialsStageSceneV190(stage?.id), view = getXenoTrialsStageViewV190(stage?.id, camera, tick, options);
  if (!profile || !view) return null;
  let drawnPlanes = Object.freeze([]); const drawnEvents = [];
  ctx.save();
  if (profile.replacesArena) { ctx.fillStyle = stage.background; ctx.fillRect(0, 0, 1000, 560); }
  ctx.save(); clip(ctx, view.rearClip);
  if (profile.replacesArena) drawnPlanes = paintAtlas(ctx, stage, images, camera, false);
  drawFixtures(ctx, profile, view);
  for (const event of view.events) if (drawEvent(ctx, event, profile, view)) drawnEvents.push(event.id);
  ctx.restore();
  if (profile.replacesArena) {
    ctx.globalAlpha = 1; ctx.fillStyle = stage.floor; ctx.fillRect(0, view.floor, 1000, 560 - view.floor);
    ctx.fillStyle = stage.accent; ctx.globalAlpha = .55; ctx.fillRect(0, view.floor, 1000, 2);
    ctx.globalAlpha = .12;
    const start = -120 - ((finite(camera.center, 500) - 500) % 100);
    for (let x = start; x < 1120; x += 100) { ctx.beginPath(); ctx.moveTo(x, view.floor + 3); ctx.lineTo(x - 70, 560); ctx.stroke(); }
  }
  ctx.restore();
  return Object.freeze({ ...view, drawnPlanes, drawnEvents: Object.freeze(drawnEvents),
    proceduralFallback: profile.replacesArena && drawnPlanes.length === 0 });
}

/** Fast foreground plane stays beneath every grounded body/low projectile.
 * No independent clock, animation frame, sound, collider or reward is created. */
export function drawXenoTrialsStageFrontV190(ctx, stage, images, camera = {}, tick = 0, options = {}) {
  const profile = getXenoTrialsStageSceneV190(stage?.id), view = getXenoTrialsStageViewV190(stage?.id, camera, tick, options);
  if (!profile || !view) return null;
  ctx.save(); clip(ctx, view.frontClip);
  const drawnPlanes = profile.replacesArena ? paintAtlas(ctx, stage, images, camera, true) : Object.freeze([]);
  ctx.globalAlpha = .26; ctx.fillStyle = '#050d13'; ctx.strokeStyle = profile.accent; ctx.lineWidth = 1;
  const spacing = 210 + profile.seed % 3 * 29, start = -spacing + ((view.foregroundOffsetX % spacing) + spacing) % spacing;
  for (let x = start; x < 1000; x += spacing) {
    ctx.fillRect(x, 544, 132, 16); ctx.strokeRect(x + 8, 549, 78, 2);
  }
  ctx.restore();
  return Object.freeze({ ...view, drawnPlanes });
}
