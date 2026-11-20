// Shared presentation for the QZ17 evidence, biological checks and human resin
// captivity. The three new images are empty scenery. People, evidence text,
// counters, recording noise and the nine cuttable resin bonds remain native.
import { drawAsphodeleActorV188, ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188 } from './asphodele-hub-slots-v188.js';
import { ACT5_ART_SOURCE_RECTS_V188, ACT5_CONVOY_PROFILES_V188 } from './act5-slots-v188.js';
import { STATION_CINEMATIC_ART_SOURCE_RECTS_V188, STATION_CINEMATIC_ART_ANCHORS_V188 } from './station-cinematics-v188.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const art = path => ({ path });
const root = '/assets/biological/v188/';
export const BIOLOGICAL_NEW_ART_IDS_V188 = freeze(['qz17-cradle-breached', 'depot-resin-helmet-corridor', 'human-resin-support']);
export const BIOLOGICAL_CIVILIAN_ART_IDS_V188 = freeze(['asph-npc-docker', 'asph-npc-merchant', 'asph-npc-technician']);
export const BIOLOGICAL_ART_V188 = freeze({
  ...Object.fromEntries(BIOLOGICAL_NEW_ART_IDS_V188.map(id => [id, art(`${root}${id}.png`)])),
  'ship-cargo-wall': art('/assets/openai/metroidvania/zones/ship-cargo-far.png'),
  'echo9-idle': art('/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png'),
  'ceiling-drone': art('/assets/asphodele/v188/cinematics/asph-cin-ceiling-drone.png'),
  'quay': art('/assets/content/v188/colony/colony-quay-warehouse.png'),
  'm577-side-corrected': art('/assets/act5/v188/m577-side-corrected.png'),
  ...Object.fromEntries(BIOLOGICAL_CIVILIAN_ART_IDS_V188.map(id => [id, art(`/assets/asphodele/v188/${id}.png`)])),
  'quarantine-crate': art('/assets/depth-holds/v188/quarantine-crate.png'),
  'crt-bezel': art('/assets/insertion/v188/crt-bezel.png'),
  'life-support': art('/assets/openai/hub/rooms/engineering-life-support.png'),
  'lab': art('/assets/openai/hub/rooms/habitat-lab.png'),
  'inez': art('/assets/openai/sprites/normalized/npcs/inez-harlow-locomotion-sheet.png'),
  'bishop': art('/assets/openai/sprites/normalized/npcs/bishop-9-locomotion-sheet.png'),
  'noor': art('/assets/openai/sprites/normalized/npcs/noor-okafor-locomotion-sheet.png')
});
export const BIOLOGICAL_CINEMATIC_ART_BY_ID_V188 = freeze({
  'cin-11': ['ship-cargo-wall', 'qz17-cradle-breached', 'echo9-idle'],
  'cin-31': ['quay', 'm577-side-corrected', ...BIOLOGICAL_CIVILIAN_ART_IDS_V188, 'quarantine-crate', 'crt-bezel'],
  'cin-40': ['life-support'],
  'cin-41': ['crt-bezel', 'lab', 'bishop', 'inez'],
  'cin-50': ['depot-resin-helmet-corridor', 'ceiling-drone'],
  'cin-51': ['crt-bezel', 'lab', 'noor'],
  'cin-qz17-retour': ['lab', 'inez']
});
export const BIOLOGICAL_ART_BY_CONSUMER_V188 = freeze({ ...BIOLOGICAL_CINEMATIC_ART_BY_ID_V188,
  'qz17-cradle': ['qz17-cradle-breached'], 'black-cocoon': ['human-resin-support'] });
export function biologicalCinematicSourcesV188(id) {
  const ids = BIOLOGICAL_CINEMATIC_ART_BY_ID_V188[id];
  return ids ? ids.map(key => BIOLOGICAL_ART_V188[key].path) : null;
}
export function biologicalConsumerSourcesV188(consumer) {
  return (BIOLOGICAL_ART_BY_CONSUMER_V188[consumer] || []).map(id => BIOLOGICAL_ART_V188[id].path);
}
const get = (images, path) => images instanceof Map ? images.get(path) : images?.[path];
const set = (images, path, image) => images instanceof Map ? images.set(path, image) : (images[path] = image);
const ready = image => image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
const imageAt = (images, id) => { const image = get(images, BIOLOGICAL_ART_V188[id]?.path); return ready(image) ? image : null; };
/** Called once on entry/preload, never from drawing. Both native loops repaint
 * even while paused/reduced-motion, so a late image cannot replay an event.
 * A new entry retries a failed request; an in-flight request stays shared. */
export function prepareBiologicalArtV188(images, consumer, ImageCtor = globalThis.Image) {
  const sources = biologicalConsumerSourcesV188(consumer);
  if (!images || typeof ImageCtor !== 'function') return sources;
  for (const path of sources) {
    const old = get(images, path); if (old && (!old.complete || old.naturalWidth > 0)) continue;
    const image = new ImageCtor(); image.decoding = 'async'; set(images, path, image); image.src = path;
  }
  return sources;
}

// Native source windows preserve the reviewed files. These bounds retain the
// final alpha fringes at draw time; no selected PNG is altered.
export const BIOLOGICAL_ART_SOURCE_RECTS_V188 = freeze({
  'qz17-cradle-breached': [47, 101, 1443, 828], 'human-resin-support': [35, 58, 948, 1421],
  'echo9-idle': STATION_CINEMATIC_ART_SOURCE_RECTS_V188['echo9-idle'],
  'ceiling-drone': STATION_CINEMATIC_ART_SOURCE_RECTS_V188['asph-cin-ceiling-drone'],
  'm577-side-corrected': ACT5_ART_SOURCE_RECTS_V188['m577-side-corrected'],
  'quarantine-crate': [15, 37, 1504, 950],
  'lab': [0, 74, 1672, 666], 'life-support': [0, 74, 1672, 666],
  'inez': [93, 14, 69, 228], 'bishop': [93, 29, 69, 213], 'noor': [84, 15, 88, 227]
});
export const BIOLOGICAL_ART_ANCHORS_V188 = freeze({
  'qz17-cradle-breached': { ground: [768, 926], body: [93, 400, 1350, 469], label: [614, 705, 303, 81],
    restraint0: [260, 510, 240, 120], restraint1: [690, 510, 210, 120], restraint2: [1085, 510, 205, 120] },
  'human-resin-support': { ground: [512, 1476] },
  'depot-resin-helmet-corridor': { ceilingBeam: [600, 120, 1000, 129] },
  'echo9-idle': STATION_CINEMATIC_ART_ANCHORS_V188['echo9-idle'],
  'ceiling-drone': STATION_CINEMATIC_ART_ANCHORS_V188['asph-cin-ceiling-drone'],
  'crt-bezel': STATION_CINEMATIC_ART_ANCHORS_V188['crt-bezel'],
  'm577-side-corrected': { ground: ACT5_CONVOY_PROFILES_V188['m577-side-corrected'].ground },
  'inez': { foot: [128, 240] }, 'bishop': { foot: [128, 240] }, 'noor': { foot: [128, 240] }
});
export const BIOLOGICAL_ACTOR_LAYOUTS_V188 = freeze(Object.fromEntries(BIOLOGICAL_CIVILIAN_ART_IDS_V188.map(id => [id, ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188[id]])));
export const BIOLOGICAL_HELMET_V188 = freeze({ revealAfter: .55, threat: [520, 237, 350, 146], rec: [40, 124] });
const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, Number.isFinite(n) ? n : low));
export function biologicalManifestCountV188(value, max) { return clamp(Math.floor(Number(value)), 0, max); }

/** One proportional source transform for art, label apertures and QA. */
export function biologicalArtFitV188(images, id, [x, y, w, h], { cover = false, alignY = .5 } = {}) {
  const image = imageAt(images, id); if (!image || ![x, y, w, h, alignY].every(Number.isFinite) || w <= 0 || h <= 0) return null;
  let [sx, sy, sw, sh] = BIOLOGICAL_ART_SOURCE_RECTS_V188[id] || [0, 0, image.naturalWidth, image.naturalHeight];
  if (sx < 0 || sy < 0 || sw <= 0 || sh <= 0 || sx + sw > image.naturalWidth || sy + sh > image.naturalHeight) return null;
  const scale = (cover ? Math.max : Math.min)(w / sw, h / sh);
  if (cover) { sx += (sw - w / scale) / 2; sy += (sh - h / scale) * alignY; sw = w / scale; sh = h / scale; }
  else { x += (w - sw * scale) / 2; y += (h - sh * scale) * alignY; w = sw * scale; h = sh * scale; }
  return { id, sx, sy, sw, sh, x, y, w, h, scale };
}
export function biologicalArtAnchorV188(fit, key) {
  const a = fit && BIOLOGICAL_ART_ANCHORS_V188[fit.id]?.[key]; if (!a) return null;
  return [fit.x + (a[0] - fit.sx) * fit.scale, fit.y + (a[1] - fit.sy) * fit.scale, ...a.slice(2).map(v => v * fit.scale)];
}
function paintFit(ctx, images, fit) {
  if (!fit || !ctx.drawImage) return null;
  ctx.drawImage(imageAt(images, fit.id), fit.sx, fit.sy, fit.sw, fit.sh, fit.x, fit.y, fit.w, fit.h); return fit;
}
function paint(ctx, images, id, box, options) { return paintFit(ctx, images, biologicalArtFitV188(images, id, box, options)); }
function groundedFit(images, id, x, groundY, width, maxHeight = Infinity) {
  const image = imageAt(images, id); if (!image) return null;
  const [sx, sy, sw, sh] = BIOLOGICAL_ART_SOURCE_RECTS_V188[id] || [0, 0, image.naturalWidth, image.naturalHeight];
  const ground = BIOLOGICAL_ART_ANCHORS_V188[id]?.ground || [sx + sw / 2, sy + sh];
  const scale = Math.min(width / sw, maxHeight / sh);
  return { id, sx, sy, sw, sh, x: x + width / 2 - (ground[0] - sx) * scale,
    y: groundY - (ground[1] - sy) * scale, w: sw * scale, h: sh * scale, scale };
}
function text(ctx, value, x, y, size = 18, color = '#d9e4d9', maxWidth) {
  ctx.fillStyle = color; ctx.font = `600 ${size}px monospace`; ctx.fillText(String(value), x, y, maxWidth);
}
function person(ctx, x, groundY, height) {
  ctx.fillStyle = '#28342e'; ctx.beginPath(); ctx.arc(x, groundY - height * .9, height * .08, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x - height * .1, groundY - height * .8, height * .2, height * .5);
  ctx.fillRect(x - height * .095, groundY - height * .3, height * .075, height * .3); ctx.fillRect(x + height * .02, groundY - height * .3, height * .075, height * .3);
}
function actor(ctx, images, id, x, groundY, height) {
  const image = imageAt(images, id), rect = BIOLOGICAL_ART_SOURCE_RECTS_V188[id], foot = BIOLOGICAL_ART_ANCHORS_V188[id]?.foot;
  if (!image || !rect || !foot) { person(ctx, x, groundY, height); return; }
  const scale = height / (foot[1] - rect[1]); ctx.save(); ctx.translate(x, groundY); ctx.scale(scale, scale);
  ctx.drawImage(image, ...rect, rect[0] - foot[0], rect[1] - foot[1], rect[2], rect[3]); ctx.restore();
}
function flat(ctx, color = '#0a1013') { ctx.fillStyle = color; ctx.fillRect(0, 0, 1280, 720); }
function backdrop(ctx, images, id, color) {
  flat(ctx, color); const fit = paint(ctx, images, id, [0, 92, 1280, 536], { cover: true });
  if (!fit) { ctx.fillStyle = '#1c272d'; for (let x = 0; x < 1280; x += 160) ctx.fillRect(x, 112, 6, 460); ctx.fillStyle = '#10191e'; ctx.fillRect(0, 540, 1280, 180); }
  return fit;
}

/** Decorative only: the physical alcove and its route gate own visibility. */
export function drawBiologicalCradleV188(ctx, images, { x, groundY, width = 122, maxHeight = 122, label = 'QZ17-04' } = {}) {
  // `width` is the 2.4 m metal body, not the larger envelope of lid and handles.
  const artWidth = width * BIOLOGICAL_ART_SOURCE_RECTS_V188['qz17-cradle-breached'][2] / BIOLOGICAL_ART_ANCHORS_V188['qz17-cradle-breached'].body[2];
  const fit = paintFit(ctx, images, groundedFit(images, 'qz17-cradle-breached', x + (width - artWidth) / 2, groundY, artWidth, maxHeight)); if (!fit) return null;
  const plate = biologicalArtAnchorV188(fit, 'label') || [fit.x + fit.w * .31, fit.y + fit.h * .78, fit.w * .38, fit.h * .08];
  ctx.save(); ctx.textAlign = 'center'; text(ctx, label, plate[0] + plate[2] / 2, plate[1] + plate[3] * .78, Math.max(7, Math.min(18, plate[3] * .75)), '#e9d07a', plate[2]); ctx.restore();
  return fit;
}
/** Back layer only. The caller still draws the real operator and all nine
 * time-driven front strands, including their severed and released forms. */
export function drawHumanResinSupportV188(ctx, images, geometry) {
  if (!geometry) return null;
  const { x, groundY, width, height } = geometry;
  // The bitmap has no round stroke: its measured roots touch the actual floor.
  // Front curves retain their separate stroke clearance in the V158 renderer.
  return paintFit(ctx, images, groundedFit(images, 'human-resin-support', x - width * .68, groundY, width * 1.36, height + 10));
}
function cradleScene(ctx, images) {
  backdrop(ctx, images, 'ship-cargo-wall', '#0b1113');
  const floor = 560; actor(ctx, images, 'echo9-idle', 218, floor, 340);
  ctx.fillStyle = 'rgba(214,233,218,.075)'; ctx.beginPath(); ctx.moveTo(246, 330); ctx.lineTo(1000, 400); ctx.lineTo(1000, 560); ctx.closePath(); ctx.fill();
  if (!drawBiologicalCradleV188(ctx, images, { x: 470, groundY: floor, width: 480, maxHeight: 410 })) {
    ctx.fillStyle = '#334149'; ctx.fillRect(470, 360, 480, 200); ctx.fillStyle = '#10181c'; ctx.fillRect(488, 380, 444, 140);
    ctx.save(); ctx.translate(950, 360); ctx.rotate(-.55); ctx.fillStyle = '#52616a'; ctx.fillRect(0, -14, 220, 14); ctx.restore();
    ctx.strokeStyle = '#a5afa9'; ctx.lineWidth = 7;
    for (let i = 0; i < 3; i++) { const x = 575 + i * 125; ctx.beginPath(); ctx.moveTo(x, 535); ctx.lineTo(x + 8, 470); ctx.moveTo(x + 58, 394); ctx.lineTo(x + 48, 433); ctx.stroke(); }
    text(ctx, 'QZ17-04', 492, 550, 16, '#e9d07a');
  }
}
function lifeSupport(ctx, images, time, reducedMotion) {
  backdrop(ctx, images, 'life-support', '#11090a');
  const pulse = reducedMotion ? .5 : .5 + .5 * Math.sin(time * 5);
  ctx.fillStyle = `rgba(200,40,30,${.1 + pulse * .16})`; ctx.fillRect(0, 92, 1280, 536);
  ctx.fillStyle = `rgba(255,80,60,${.4 + pulse * .6})`; for (const x of [90, 640, 1190]) ctx.fillRect(x - 24, 160, 48, 7);
}
export function drawBiologicalBackgroundV188(ctx, images, id, scene, { time = 0, reducedMotion = false, speakerId = null } = {}) {
  if (id === 'cin-11' && scene === 'cradle') { cradleScene(ctx, images); return true; }
  if (id === 'cin-40' && scene === 'alarm') { lifeSupport(ctx, images, time, reducedMotion); return true; }
  if (['cin-41', 'cin-51', 'cin-qz17-retour'].includes(id) && scene === 'lab') {
    backdrop(ctx, images, 'lab', '#0d1519');
    const who = { 'crew-09-inez-harlow': 'inez', 'crew-05-bishop-9': 'bishop', 'crew-04-noor-okafor': 'noor' }[speakerId];
    if (who) actor(ctx, images, who, 940, 588, 228);
    return true;
  }
  return false;
}
function monitor(ctx, images, draw) {
  flat(ctx, '#030706'); const fit = paint(ctx, images, 'crt-bezel', [160, 116, 960, 492]);
  const rect = biologicalArtAnchorV188(fit, 'screen') || [220, 160, 840, 400];
  ctx.save(); ctx.fillStyle = '#06110a'; ctx.fillRect(...rect); ctx.beginPath(); ctx.rect(...rect); ctx.clip(); draw(...rect); ctx.restore(); return rect;
}
function wrapped(ctx, value, width) {
  const lines = []; let line = '';
  for (const word of String(value).split(' ')) { const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines;
}
function biologicalScreen(ctx, images, current, { progress, local, lang, reducedMotion }) {
  monitor(ctx, images, (x, y, w, h) => {
    ctx.strokeStyle = 'rgba(141,240,176,.23)'; ctx.lineWidth = 1;
    for (let row = y + 48; row < y + h - 20; row += 22) { ctx.beginPath(); ctx.moveTo(x + 18, row); ctx.lineTo(x + w - 18, row); ctx.stroke(); }
    const scan = x + 14 + (reducedMotion ? .5 : progress) * (w - 36); ctx.fillStyle = 'rgba(141,240,176,.24)'; ctx.fillRect(scan, y + 14, 8, h - 28);
    if (progress > .45) {
      ctx.fillStyle = current.tone === 'alarm' ? (reducedMotion || Math.floor(local * 2) % 2 ? '#e15b4f' : '#8a2a24') : '#8df0b0';
      ctx.font = '700 30px monospace'; ctx.textAlign = 'center';
      const lines = wrapped(ctx, current.status[lang], w - 60);
      lines.forEach((line, index) => ctx.fillText(line, x + w / 2, y + h * .53 + (index - (lines.length - 1) / 2) * 38));
      ctx.textAlign = 'left';
    }
  });
}
function terminal(ctx, images, current, { progress, local, lang, reducedMotion }) {
  monitor(ctx, images, (x, y, w, h) => {
    text(ctx, `${lang === 'en' ? 'TANTALUS · QUARANTINE LOG' : 'TANTALUS · JOURNAL DE QUARANTAINE'} · ${current.clock}`, x + 22, y + 35, 16, '#8df0b0', w - 44);
    const rows = current.lines.map(entry => entry[lang]), total = rows.join('').length;
    let budget = Math.ceil(total * Math.min(1, progress * 2.2));
    rows.forEach((row, index) => { const visible = row.slice(0, Math.max(0, budget)); budget -= row.length;
      if (visible) text(ctx, visible, x + 22, y + 90 + index * 36, 17, '#8df0b0', w - 44); });
    if (progress > .5) text(ctx, current.status[lang], x + 22, y + h - 44, 25, reducedMotion || Math.floor(local * 2) % 2 ? '#e9d07a' : '#7c6c38', w - 44);
  });
}
function survivors(ctx, images, context, { progress, local, lang, reducedMotion }) {
  backdrop(ctx, images, 'quay', '#0b1115');
  const fit = groundedFit(images, 'm577-side-corrected', 164, 529, 930);
  if (!paintFit(ctx, images, fit)) {
    ctx.fillStyle = '#3d493c'; ctx.fillRect(164, 340, 930, 150); ctx.fillRect(240, 308, 210, 42);
    ctx.fillStyle = '#151b19'; for (const x of [320, 880]) { ctx.beginPath(); ctx.arc(x, 479, 50, 0, Math.PI * 2); ctx.fill(); }
  }
  const count = biologicalManifestCountV188(context?.m577?.colonists, 6), walk = reducedMotion ? .5 : clamp(progress * 1.3);
  // Already outside the central side door: no fictitious rear APC ramp and
  // nobody walks through the closed painted hull.
  const loader = { image: id => imageAt(images, id), usage: Object.create(null) };
  for (let i = 0; i < count; i++) {
    const x = 260 + i * 146 - walk * 50, height = 210 * (.96 + i % 3 * .02), scale = height / 89;
    ctx.save(); ctx.translate(x, 575); ctx.scale(scale, scale);
    drawAsphodeleActorV188(ctx, loader, BIOLOGICAL_CIVILIAN_ART_IDS_V188[i % 3], 0, 0, { facing: -1, phase: local * 6 + i, moving: true, still: reducedMotion }); ctx.restore();
  }
  ctx.save(); ctx.textAlign = 'center'; text(ctx, count ? `${count} / 6` : lang === 'en' ? 'NO SEAT GIVEN' : 'AUCUNE PLACE DONNÉE', 640, 608, 22); ctx.restore();
}
function sealedCrates(ctx, images, context, lang) {
  backdrop(ctx, images, 'quay', '#0b1115');
  const count = biologicalManifestCountV188(context?.m577?.containers, 3);
  for (let i = 0; i < count; i++) {
    const x = 640 - count * 160 + i * 320;
    if (!paint(ctx, images, 'quarantine-crate', [x + 20, 332, 280, 210], { alignY: 1 })) {
      ctx.fillStyle = '#526163'; ctx.fillRect(x + 20, 365, 280, 177); ctx.strokeStyle = '#bdc5ae'; ctx.lineWidth = 3; ctx.strokeRect(x + 26, 371, 268, 165);
    }
    ctx.save(); ctx.textAlign = 'center'; text(ctx, `QZ17 · ${i + 1}`, x + 160, 566, 16, '#e9d07a'); ctx.restore();
  }
  ctx.save(); ctx.textAlign = 'center'; text(ctx, count ? `${count} / 3` : lang === 'en' ? 'NO CONTAINER ABOARD' : 'AUCUN CONTENEUR À BORD', 640, 608, 22); ctx.restore();
}
function helmet(ctx, images, { progress, local, reducedMotion }) {
  backdrop(ctx, images, 'depot-resin-helmet-corridor', '#070a08');
  if (progress > BIOLOGICAL_HELMET_V188.revealAfter) {
    if (!paint(ctx, images, 'ceiling-drone', BIOLOGICAL_HELMET_V188.threat)) {
      const [x, y, w, h] = BIOLOGICAL_HELMET_V188.threat; ctx.fillStyle = '#020302';
      ctx.beginPath(); ctx.ellipse(x + w * .56, y + h * .7, w * .34, h * .2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + w * .4, y, 10, h * .7); ctx.fillRect(x + w * .74, y + 8, 8, h * .65);
    }
  }
  const seed = reducedMotion ? 3 : Math.floor(local * 20); ctx.fillStyle = 'rgba(200,220,210,.08)';
  for (let i = 0; i < (reducedMotion ? 40 : 260); i++) ctx.fillRect((i * 7919 + seed * 104729) % 1280, (i * 6271 + seed * 1299709) % 720, 2, 2);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 92; y < 628; y += 4) ctx.fillRect(0, y, 1280, 1);
}
export function drawBiologicalHelmetHudV188(ctx) { text(ctx, '● REC', ...BIOLOGICAL_HELMET_V188.rec, 14, '#e15b4f'); }

/** Only these cinematic IDs enter the new path. Captions are queued by the
 * existing player, so camera movement never changes their screen positions. */
export function drawBiologicalShotV188(ctx, id, current, { images = {}, local = 0, progress = 0, lang = 'fr', reducedMotion = false, context = {}, caption = () => {} } = {}) {
  const options = { local, progress, lang, reducedMotion };
  if (id === 'cin-11' && current.kind === 'cradle') cradleScene(ctx, images);
  else if (id === 'cin-31' && current.kind === 'ramp') survivors(ctx, images, context, options);
  else if (id === 'cin-31' && current.kind === 'sealed-crates') sealedCrates(ctx, images, context, lang);
  else if (['cin-31', 'cin-51'].includes(id) && current.kind === 'bio-screen') biologicalScreen(ctx, images, current, options);
  else if (id === 'cin-40' && current.kind === 'alarm-deck') lifeSupport(ctx, images, local, reducedMotion);
  else if (id === 'cin-41' && current.kind === 'terminal') terminal(ctx, images, current, options);
  else if (id === 'cin-50' && current.kind === 'helmet-cam') helmet(ctx, images, options);
  else return false;
  caption(current.caption?.[lang], ['ramp', 'sealed-crates'].includes(current.kind) ? 90 : undefined); return true;
}
