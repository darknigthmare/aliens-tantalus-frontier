// Presentation for the opening, the first Tantalus briefing and Port-Méridien.
// The script, physical set, clocks, messages, names and player belong to
// story-cinematics-v188.js. This module only samples reviewed source images.
import { ACT5_ART_SOURCE_RECTS_V188, ACT5_ART_ANCHORS_V188 } from './act5-slots-v188.js';
import { STATION_CINEMATIC_ART_SOURCE_RECTS_V188, STATION_CINEMATIC_ART_ANCHORS_V188 } from './station-cinematics-v188.js';
import { ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188 } from './asphodele-hub-slots-v188.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const art = path => ({ path });
export const PROLOGUE_NEW_ART_IDS_V188 = freeze(['tomas-wren-standing', 'lucia-ferro-standing', 'adele-sarrazin-standing',
  'resident-child-standing', 'north-quay-patient', 'medical-stretcher', 'port-meridien-night-approach', 'relay-access-badge', 'relay-reaching-hand',
  'cryo-supply-shelf', 'cryo-service-trolley']);
export const PROLOGUE_ART_V188 = freeze({
  ...Object.fromEntries(PROLOGUE_NEW_ART_IDS_V188.map(id => [id, art(`/assets/prologue/v188/${id}.png`)])),
  'relay': art('/assets/content/v188/colony/colony-beacon.png'),
  'crt-bezel': art('/assets/insertion/v188/crt-bezel.png'),
  'asph-ring': art('/assets/asphodele/v188/cinematics/asph-cin-ring.png'),
  'asph-hub': art('/assets/asphodele/v188/cinematics/asph-cin-hub.png'),
  'space': art('/assets/openai/ui/title/v79/space/space-01-deep-frontier.png'),
  'stars': art('/assets/openai/ui/title/v79/stars/stars-01-distant-field.png'),
  'planet': art('/assets/openai/ui/title/v79/planet/planet-02-ceto-basin.png'),
  'tantalus': art('/assets/openai/ui/title/v79/orbitals/orbitals-01-tantalus-transport.png'),
  'dropship': art('/assets/openai/mission/insertion/tantalus-dropship-approach-v62.png'),
  'troop-bay': art('/assets/insertion/v188/ud4l-troop-bay.png'),
  'cryo-bulkhead': art('/assets/openai/metroidvania/zones/ship-cargo-far.png'),
  'cryo-overhead': art('/assets/openai/hub/layers/command-cryo-overhead.png'),
  'container-skin': art('/assets/openai/hub/layers/v138/interior-wall-atlas.png'),
  'quay-airlock': art('/assets/openai/metroidvania/props/open-bulkhead.png'),
  'cryopod': art('/assets/openai/hub/props/cryopod.png'),
  'echo8-locker': art('/assets/act5/v188/echo8-locker-epilogue.png'),
  'escape-bay-door': art('/assets/openai/hub/annexes/v71/escape-pods/door.webp'),
  'briefing-room': art('/assets/openai/hub/rooms/command-briefing.png'),
  'tactical-table': art('/assets/openai/hub/props/operations-table-v61.png'),
  'range': art('/assets/content/v188/colony/quest-range.png'),
  'quay': art('/assets/act5/v188/quay-standoff.png'),
  'medical-room': art('/assets/openai/hub/rooms/habitat-medical.png'),
  'quarters': art('/assets/asphodele/v188/cinematics/asph-cin-rook-quarters.png'),
  'north-wall': art('/assets/content/v188/colony/colony-walls.png'),
  ...Object.fromEntries(['docker', 'merchant'].map(role => [`resident-${role}`, art(`/assets/asphodele/v188/asph-npc-${role}.png`)])),
  ...Object.fromEntries([['vega', 'mara-vega'], ['inez', 'inez-harlow'], ['velez', 'tamsin-velez'], ['david', 'david-8r'], ['asha', 'asha-mbaye']]
    .map(([id, slug]) => [id, art(`/assets/openai/sprites/normalized/npcs/${slug}-locomotion-sheet.png`)])),
  'echo9-idle': art('/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png')
});
export const PROLOGUE_CINEMATIC_ART_BY_ID_V188 = freeze({
  'cin-00': ['relay', 'crt-bezel', 'relay-access-badge', 'relay-reaching-hand', 'asph-ring', 'asph-hub', 'space', 'stars', 'planet', 'tantalus'],
  'cin-01': ['cryo-bulkhead', 'cryo-overhead', 'cryopod', 'echo8-locker', 'escape-bay-door', 'david', 'cryo-supply-shelf', 'cryo-service-trolley'],
  'cin-p2': ['range', 'vega'],
  'cin-02': ['briefing-room', 'tactical-table', 'inez', 'vega', 'velez', 'echo9-idle'],
  'cin-03': ['dropship', 'troop-bay', 'port-meridien-night-approach'],
  'cin-p3-wren': ['quay', 'container-skin', 'quay-airlock', 'tomas-wren-standing', 'resident-docker', 'resident-merchant', 'resident-child-standing'],
  'cin-p3-ferro': ['medical-room', 'lucia-ferro-standing', 'medical-stretcher', 'north-quay-patient'],
  'cin-20': ['quarters'],
  'cin-10': ['dropship', 'troop-bay'],
  'cin-doyenne': ['quay', 'container-skin', 'quay-airlock', 'asha', 'adele-sarrazin-standing', 'medical-room', 'port-meridien-night-approach', 'north-wall'],
  'cin-20-rook': ['quarters']
});
export function prologueCinematicSourcesV188(id) {
  const ids = PROLOGUE_CINEMATIC_ART_BY_ID_V188[id];
  return ids ? ids.map(key => PROLOGUE_ART_V188[key].path) : null;
}
const get = (images, path) => images instanceof Map ? images.get(path) : images?.[path];
const imageAt = (images, id) => { const image = get(images, PROLOGUE_ART_V188[id]?.path);
  return image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null; };

// Measured source windows, never rewritten/cropped files. Standing bodies use
// their foot pivot, not the padded canvas or a portrait stretched to full height.
export const PROLOGUE_ART_SOURCE_RECTS_V188 = freeze({
  'tomas-wren-standing': [243, 12, 497, 1515], 'lucia-ferro-standing': [289, 12, 449, 1510],
  'adele-sarrazin-standing': [247, 12, 521, 1515], 'resident-child-standing': [267, 9, 422, 1516],
  'north-quay-patient': [16, 199, 2139, 388], 'medical-stretcher': [10, 85, 1905, 730],
  'relay-access-badge': [24, 61, 1528, 889], 'relay-reaching-hand': [45, 7, 2119, 697],
  'cryo-supply-shelf': [105, 107, 1121, 975], 'cryo-service-trolley': [198, 112, 926, 996],
  'cryopod': ACT5_ART_SOURCE_RECTS_V188.cryopod, 'echo8-locker': ACT5_ART_SOURCE_RECTS_V188['echo8-locker-epilogue'],
  'escape-bay-door': [24, 133, 338, 349], 'tactical-table': ACT5_ART_SOURCE_RECTS_V188['tactical-table'],
  'container-skin': [27, 545, 462, 414],
  'quay-airlock': [2, 2, 156, 174],
  'asph-ring': STATION_CINEMATIC_ART_SOURCE_RECTS_V188['asph-cin-ring'],
  'asph-hub': STATION_CINEMATIC_ART_SOURCE_RECTS_V188['asph-cin-hub'],
  'medical-room': [0, 74, 1672, 666], 'briefing-room': [0, 74, 1672, 666],
  'vega': [92, 21, 71, 221], 'inez': [93, 14, 69, 228], 'velez': [79, 15, 97, 227],
  'david': [93, 15, 70, 227], 'asha': [90, 14, 75, 228],
  'echo9-idle': STATION_CINEMATIC_ART_SOURCE_RECTS_V188['echo9-idle'],
  ...Object.fromEntries(['docker', 'merchant'].map(role => [`resident-${role}`, ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188[`asph-npc-${role}`].frames[0].rect]))
});
export const PROLOGUE_ART_ANCHORS_V188 = freeze({
  'tomas-wren-standing': { foot: [493, 1524] }, 'lucia-ferro-standing': { foot: [514, 1519] },
  'adele-sarrazin-standing': { foot: [507, 1524] }, 'resident-child-standing': { foot: [478, 1522] },
  'north-quay-patient': { support: [1110, 573], chest: [1200, 199, 640, 388], head: [2010, 395], heel: [90, 576] },
  'medical-stretcher': { ground: [961, 812], mattress: [96, 87, 1733, 88], support: [962, 170] },
  'relay-access-badge': { body: [26, 63, 1524, 885] }, 'relay-reaching-hand': { fingertips: [54, 453] },
  'port-meridien-night-approach': { pad: [290, 636, 950, 124], processor: [1110, 80, 474, 485] },
  'relay': { lamp: [600, 40, 27, 30] },
  'cryo-supply-shelf': { mount: [665, 1079] }, 'cryo-service-trolley': { ground: [662, 1105] },
  'echo8-locker': ACT5_ART_ANCHORS_V188['echo8-locker-epilogue'],
  'cryopod': ACT5_ART_ANCHORS_V188.cryopod,
  'crt-bezel': STATION_CINEMATIC_ART_ANCHORS_V188['crt-bezel'],
  'asph-ring': STATION_CINEMATIC_ART_ANCHORS_V188['asph-cin-ring'],
  'asph-hub': STATION_CINEMATIC_ART_ANCHORS_V188['asph-cin-hub'],
  ...Object.fromEntries(['vega', 'inez', 'velez', 'david', 'asha', 'echo9-idle'].map(id => [id, { foot: [128, 240] }])),
  ...Object.fromEntries(['docker', 'merchant'].map(role => [`resident-${role}`, { foot: ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188[`asph-npc-${role}`].frames[0].foot }]))
});

export function prologueArtFitV188(images, id, [x, y, w, h], { cover = false, alignX = .5, alignY = .5, sourceRect = null } = {}) {
  const image = imageAt(images, id); if (!image || ![x, y, w, h, alignX, alignY].every(Number.isFinite) || w <= 0 || h <= 0) return null;
  let [sx, sy, sw, sh] = sourceRect || PROLOGUE_ART_SOURCE_RECTS_V188[id] || [0, 0, image.naturalWidth, image.naturalHeight];
  if (sx < 0 || sy < 0 || sw <= 0 || sh <= 0 || sx + sw > image.naturalWidth || sy + sh > image.naturalHeight) return null;
  const scale = (cover ? Math.max : Math.min)(w / sw, h / sh);
  if (cover) { sx += (sw - w / scale) * alignX; sy += (sh - h / scale) * alignY; sw = w / scale; sh = h / scale; }
  else { x += (w - sw * scale) * alignX; y += (h - sh * scale) * alignY; w = sw * scale; h = sh * scale; }
  return { id, sx, sy, sw, sh, x, y, w, h, scale };
}
export function prologueArtAnchorV188(fit, key) {
  const a = fit && PROLOGUE_ART_ANCHORS_V188[fit.id]?.[key]; if (!a) return null;
  return [fit.x + (a[0] - fit.sx) * fit.scale, fit.y + (a[1] - fit.sy) * fit.scale, ...a.slice(2).map(v => v * fit.scale)];
}
function paintFit(ctx, images, fit) {
  if (!fit || !ctx.drawImage) return null;
  ctx.drawImage(imageAt(images, fit.id), fit.sx, fit.sy, fit.sw, fit.sh, fit.x, fit.y, fit.w, fit.h); return fit;
}
function paint(ctx, images, id, box, options) { return paintFit(ctx, images, prologueArtFitV188(images, id, box, options)); }
function flat(ctx, color = '#081014') { ctx.fillStyle = color; ctx.fillRect(0, 0, 1280, 720); }
function text(ctx, value, x, y, size = 18, color = '#d9e4d9', width) {
  ctx.font = `600 ${size}px monospace`; ctx.fillStyle = color; ctx.fillText(String(value), x, y, width);
}
function actor(ctx, images, id, x, floor, height, facing = 1) {
  const image = imageAt(images, id), rect = PROLOGUE_ART_SOURCE_RECTS_V188[id], foot = PROLOGUE_ART_ANCHORS_V188[id]?.foot;
  if (!image || !rect || !foot) return false;
  const scale = height / (foot[1] - rect[1]); ctx.save(); ctx.translate(x, floor); ctx.scale(scale * facing, scale);
  ctx.drawImage(image, ...rect, rect[0] - foot[0], rect[1] - foot[1], rect[2], rect[3]); ctx.restore(); return true;
}

/** An image arrives independently of its neighbours; absent props continue
 * through the native set renderer, with identical labels and physical sizes. */
export function drawPrologueSetArtV188(ctx, entry, { images, cinematicId, scene, layout, time = 0, reducedMotion = false } = {}) {
  if (!PROLOGUE_CINEMATIC_ART_BY_ID_V188[cinematicId]) return false;
  const { x, w, h } = entry.px, floor = layout.floor + entry.px.drop;
  if (entry.kind === 'person' || entry.kind === 'resident') {
    const who = { 'DAVID-8R': 'david', 'INEZ HARLOW': 'inez', 'LT. MARA VEGA': 'vega', 'TAMSIN VELEZ': 'velez', 'ECHO-9': 'echo9-idle',
      'TOMAS WREN': 'tomas-wren-standing', 'LUCIA FERRO': 'lucia-ferro-standing', 'ASHA MBAYE': 'asha', 'ADÈLE SARRAZIN': 'adele-sarrazin-standing',
      'HABITANT 1': 'resident-docker', 'HABITANT 2': 'resident-merchant', 'HABITANT 3': 'resident-child-standing' }[entry.who];
    return !!who && actor(ctx, images, who, x, floor, h, entry.who === 'ADÈLE SARRAZIN' ? -1 : 1);
  }
  if (entry.kind === 'locker') {
    const fit = paint(ctx, images, 'echo8-locker', [x, floor - h, w, h], { alignY: 1 }); if (!fit) return false;
    const plate = prologueArtAnchorV188(fit, 'label'); ctx.save(); ctx.textAlign = 'center';
    text(ctx, entry.label, plate[0] + plate[2] / 2, plate[1] + plate[3] * .78, Math.max(10, plate[3] * .64), '#d8e6d8', plate[2]); ctx.restore();
    if (entry.sealed) { ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = Math.max(4, fit.w * .05); ctx.beginPath();
      ctx.moveTo(fit.x + fit.w * .16, fit.y + fit.h * .45); ctx.lineTo(fit.x + fit.w * .84, fit.y + fit.h * .78);
      ctx.moveTo(fit.x + fit.w * .84, fit.y + fit.h * .45); ctx.lineTo(fit.x + fit.w * .16, fit.y + fit.h * .78); ctx.stroke(); }
    return true;
  }
  if (entry.kind === 'bay-door') {
    if (!paint(ctx, images, 'escape-bay-door', [x, floor - h, w, h], { alignY: 1 })) return false;
    text(ctx, entry.label, x, floor - h - 12, 14, '#9fe7cf', w); return true;
  }
  if (entry.kind === 'capsule') {
    const fit = paint(ctx, images, 'cryopod', [x, floor - h, w, h], { alignY: 1 }); if (!fit) return false;
    if (entry.open) openCanopy(ctx, images, fit);
    ctx.fillStyle = '#0c1416'; ctx.fillRect(x + w * .2, floor - h * .36, w * .6, 20);
    text(ctx, `CAPSULE ${entry.number}${entry.open ? ' · OUVERTE' : ''}`, x + w * .22, floor - h * .36 + 15, 13, entry.open ? '#e9d07a' : '#9fe7cf', w * .58); return true;
  }
  if (entry.kind === 'table') return !!paint(ctx, images, 'tactical-table', [x, floor - h - 90, w, h + 90], { alignY: 1 });
  if (entry.kind === 'shelf' || entry.kind === 'trolley') {
    const id = entry.kind === 'shelf' ? 'cryo-supply-shelf' : 'cryo-service-trolley', key = entry.kind === 'shelf' ? 'mount' : 'ground';
    const bottom = floor - (entry.mount || 0) * layout.scale, fit = prologueArtFitV188(images, id, [x, bottom - h, w, h], { alignY: 1 });
    if (!fit) return false;
    const anchor = prologueArtAnchorV188(fit, key); fit.x += x + w / 2 - anchor[0]; fit.y += bottom - anchor[1];
    return !!paintFit(ctx, images, fit);
  }
  if (entry.kind === 'airlock' && imageAt(images, 'quay-airlock')) {
    ctx.fillStyle = '#0b1013'; ctx.fillRect(x, floor - h, w, h);
    paint(ctx, images, 'quay-airlock', [x - 10, floor - h - 10, w + 20, h + 10], { alignY: 1 });
    if (entry.lit) { ctx.fillStyle = '#e9d07a'; ctx.fillRect(x + w * .3, floor - h - 18, w * .4, 6); }
    return true;
  }
  if (entry.kind === 'container' && imageAt(images, 'container-skin')) {
    for (let level = 0; level < entry.stack; level++) {
      const top = floor - h * (level + 1); paint(ctx, images, 'container-skin', [x, top, w, h - 2], { cover: true });
      ctx.strokeStyle = '#465054'; ctx.lineWidth = 5; ctx.strokeRect(x + 2.5, top + 2.5, w - 5, h - 7);
      ctx.strokeStyle = 'rgba(10,15,18,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w / 2, top + 5); ctx.lineTo(x + w / 2, top + h - 7); ctx.stroke();
      if (entry.label && level === 0) { ctx.fillStyle = '#22281f'; ctx.fillRect(x + w * .28, top + h * .35, w * .44, h * .22);
        ctx.strokeStyle = '#e9d07a'; ctx.lineWidth = 2; ctx.strokeRect(x + w * .28, top + h * .35, w * .44, h * .22);
        text(ctx, entry.label, x + w * .34, top + h * .51, 13, '#e9d07a'); }
    }
    return true;
  }
  if (entry.kind === 'stretcher') return !!paintFit(ctx, images, stretcherFit(images, entry, layout));
  if (entry.kind === 'patient') return patient(ctx, images, entry, layout, time, reducedMotion);
  return false;
}
function openCanopy(ctx, images, fit) {
  const hood = [[44, 60], [48, 28], [59, 18], [168, 18], [178, 31], [178, 62], [165, 69], [54, 69]], hinge = [174, 66], angle = .72;
  const path = () => { ctx.beginPath(); ctx.moveTo(...hood[0]); for (const p of hood.slice(1)) ctx.lineTo(...p); ctx.closePath(); };
  ctx.save(); ctx.translate(fit.x - fit.sx * fit.scale, fit.y - fit.sy * fit.scale); ctx.scale(fit.scale, fit.scale);
  path(); ctx.fillStyle = '#101c22'; ctx.fill(); ctx.strokeStyle = '#5b7780'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#304a50'; ctx.fillRect(64, 34, 88, 25); ctx.fillStyle = '#698386'; ctx.fillRect(142, 36, 16, 21);
  const dx = 52 - hinge[0], dy = 58 - hinge[1]; ctx.strokeStyle = '#829797'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(49, 75);
  ctx.lineTo(hinge[0] + dx * Math.cos(angle) - dy * Math.sin(angle), hinge[1] + dx * Math.sin(angle) + dy * Math.cos(angle)); ctx.stroke();
  ctx.save(); ctx.translate(...hinge); ctx.rotate(angle); ctx.translate(-hinge[0], -hinge[1]); path(); ctx.clip();
  ctx.drawImage(imageAt(images, 'cryopod'), 44, 15, 136, 56, 44, 15, 136, 56); ctx.restore(); ctx.restore();
}
function stretcherFit(images, entry, layout) {
  if (!imageAt(images, 'medical-stretcher')) return null;
  const [sx, sy, sw, sh] = PROLOGUE_ART_SOURCE_RECTS_V188['medical-stretcher'];
  const anchor = PROLOGUE_ART_ANCHORS_V188['medical-stretcher'], scale = entry.px.w / anchor.mattress[2];
  return { id: 'medical-stretcher', sx, sy, sw, sh, x: entry.px.x + (sx - anchor.mattress[0]) * scale,
    y: layout.floor - (anchor.ground[1] - sy) * scale, w: sw * scale, h: sh * scale, scale };
}
function patient(ctx, images, entry, layout, time, reducedMotion) {
  const image = imageAt(images, 'north-quay-patient'); if (!image) return false;
  const deck = layout.items.find(item => item.kind === 'stretcher'), bed = deck && stretcherFit(images, deck, layout);
  const bedSupport = bed && prologueArtAnchorV188(bed, 'support');
  const [sx, sy, sw, sh] = PROLOGUE_ART_SOURCE_RECTS_V188['north-quay-patient'], scale = entry.px.w / sw;
  const supportY = bedSupport?.[1] ?? layout.floor - (deck?.px.h || 0);
  const y = supportY - (PROLOGUE_ART_ANCHORS_V188['north-quay-patient'].support[1] - sy) * scale;
  const breath = reducedMotion ? 0 : Math.sin(time * 2.2) * 2;
  // Only the thorax changes height. The head, legs, hand and support plane do
  // not bob, and the stretcher is a separate, immobile image. Narrow strips
  // keep the photographed silhouette continuous through the breathing cycle.
  const edges = [sx, 1200, 1280, 1360, 1440, 1520, 1600, 1680, 1760, 1840, sx + sw], lower = 448;
  for (let i = 0; i < edges.length - 1; i++) {
    const left = edges[i], width = edges[i + 1] - left;
    const weight = i === 0 || i === edges.length - 2 ? 0 : Math.sin((left + width / 2 - 1200) / 640 * Math.PI);
    const lift = breath * Math.max(0, weight);
    ctx.drawImage(image, left, sy, width, lower - sy, entry.px.x + (left - sx) * scale, y - lift, width * scale, (lower - sy) * scale + lift);
  }
  ctx.drawImage(image, sx, lower, sw, sy + sh - lower, entry.px.x, y + (lower - sy) * scale, sw * scale, (sy + sh - lower) * scale);
  return true;
}

/** A backdrop is accepted only for the scoped scene. Physical set drawing
 * follows in the caller so a missing/late image cannot remove an actor. */
export function drawPrologueBackgroundV188(ctx, images, id, scene, { time = 0, reducedMotion = false } = {}) {
  const selected = { 'cin-01': { cryo: 'cryo-bulkhead' }, 'cin-p2': { range: 'range' }, 'cin-02': { hologram: 'briefing-room' },
    'cin-03': { dropship: 'troop-bay' }, 'cin-p3-wren': { quay: 'quay' }, 'cin-p3-ferro': { triage: 'medical-room' },
    'cin-20': { quarters: 'quarters' }, 'cin-10': { dropship: 'troop-bay' }, 'cin-doyenne': { quay: 'quay' }, 'cin-20-rook': { quarters: 'quarters' } }[id]?.[scene];
  if (!selected || !imageAt(images, selected)) return false;
  const dx = scene === 'dropship' && !reducedMotion ? (Math.sin(time * 37) + Math.sin(time * 13) * .6) * 2.4 : 0,
    dy = scene === 'dropship' && !reducedMotion ? Math.cos(time * 29) * 2.4 * .7 : 0;
  paint(ctx, images, selected, [-8 + dx, 84 + dy, 1296, 552], { cover: true });
  if (scene === 'cryo') paint(ctx, images, 'cryo-overhead', [0, 70, 1280, 640]);
  if (scene === 'range') actor(ctx, images, 'vega', 500, 510, 280);
  if (scene === 'hologram') { ctx.fillStyle = 'rgba(1,9,7,.52)'; ctx.fillRect(0, 92, 1280, 536); }
  return true;
}

function terminal(ctx, images, current, { local, progress, lang }) {
  const fit = paint(ctx, images, 'crt-bezel', [150, 106, 980, 500]); if (!fit) return false;
  const [x, y, w, h] = prologueArtAnchorV188(fit, 'screen');
  ctx.save(); ctx.fillStyle = '#071009'; ctx.fillRect(x, y, w, h); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  text(ctx, `QZ-18 · FILE DE DÉTRESSE · ${current.clock}`, x + 24, y + 45, 22, '#8df0b0', w - 48);
  const rows = current.lines.map(entry => entry[lang]), total = rows.join('').length; let budget = Math.ceil(total * Math.min(1, progress * 2.2));
  rows.forEach((row, index) => { const visible = row.slice(0, Math.max(0, budget)); budget -= row.length;
    if (visible) text(ctx, visible, x + 24, y + 115 + index * 34, 22, '#8df0b0', w - 48); });
  if (progress > .5) text(ctx, current.status[lang], x + 24, y + Math.min(h - 30, 245), 34, Math.floor(local * 2) % 2 ? '#e9d07a' : '#7c6c38', w - 48);
  ctx.restore(); return true;
}
function badge(ctx, images, progress) {
  flat(ctx, '#070c0c'); ctx.fillStyle = '#121414'; ctx.fillRect(0, 380, 1280, 340);
  if (!paint(ctx, images, 'relay-access-badge', [560, 430, 160, 100])) {
    ctx.fillStyle = '#c8c3b2'; ctx.fillRect(560, 430, 160, 100); ctx.fillStyle = '#6f6a5d'; ctx.fillRect(580, 450, 50, 60);
    ctx.fillStyle = '#9a958a'; for (let i = 0; i < 3; i++) ctx.fillRect(645, 455 + i * 18, 60, 7);
  }
  if (progress > .45) {
    const reach = Math.min(1, (progress - .45) / .4), x = 1280 - reach * 620;
    const image = imageAt(images, 'relay-reaching-hand');
    if (image) {
      const [sx, sy, sw, sh] = PROLOGUE_ART_SOURCE_RECTS_V188['relay-reaching-hand'], scale = 680 / sw;
      const [tipX, tipY] = PROLOGUE_ART_ANCHORS_V188['relay-reaching-hand'].fingertips;
      ctx.drawImage(image, sx, sy, sw, sh, x - (tipX - sx) * scale, 490 - (tipY - sy) * scale, sw * scale, sh * scale);
    } else { ctx.fillStyle = '#2a2622'; ctx.fillRect(x, 470, 620, 70); }
  }
}
function orbit(ctx, images, local, reducedMotion) {
  if (!imageAt(images, 'asph-ring') && !imageAt(images, 'asph-hub')) return false;
  flat(ctx, '#030609'); paint(ctx, images, 'space', [0, 0, 1280, 720], { cover: true });
  const planet = imageAt(images, 'planet');
  if (planet) { const width = 980, height = width * planet.naturalHeight / planet.naturalWidth;
    // A transparent globe keeps its full source and curved limb. Expand the
    // old viewport about the same centre instead of cutting the sphere.
    paint(ctx, images, 'planet', [430, 290 + (620 - height) / 2, width, height]); }
  const x = 510 - (reducedMotion ? 0 : local * 6), y = 310, angle = reducedMotion ? 0 : local * .035;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  if (!paint(ctx, images, 'asph-ring', [-170, -170, 340, 340])) { ctx.strokeStyle = '#55636a'; ctx.lineWidth = 18; ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
  if (!paint(ctx, images, 'asph-hub', [x - 42, y - 42, 84, 84])) { ctx.fillStyle = '#465158'; ctx.fillRect(x - 20, y - 20, 40, 40); }
  ctx.fillStyle = reducedMotion || Math.floor(local * 1.2) % 2 ? '#e15b4f' : '#6a1d18'; ctx.fillRect(x - 4, y - 4, 8, 8); return true;
}
export function drawPrologueShotV188(ctx, id, current, { images = {}, local = 0, progress = 0, lang = 'fr', reducedMotion = false,
  caption = () => {}, rain = () => {}, drawSet = () => {} } = {}) {
  if (!PROLOGUE_CINEMATIC_ART_BY_ID_V188[id]) return false;
  if (id === 'cin-00') {
    if (current.kind === 'relay-rain') { const fit = paint(ctx, images, 'relay', [0, 92, 1280, 536], { cover: true, alignY: 0 }); if (!fit) return false;
      const [x, y, w, h] = prologueArtAnchorV188(fit, 'lamp'), on = reducedMotion || Math.floor(local * 1.5) % 2;
      ctx.fillStyle = on ? 'rgba(255,92,48,.6)' : 'rgba(6,13,17,.92)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
      rain(local, reducedMotion); caption(current.caption?.[lang]); return true; }
    if (current.kind === 'terminal') { if (!terminal(ctx, images, current, { local, progress, lang })) return false; caption(current.caption?.[lang]); return true; }
    if (current.kind === 'badge') { badge(ctx, images, progress); return true; }
    if (current.kind === 'orbit-station') { if (!orbit(ctx, images, local, reducedMotion)) return false; caption(current.caption?.[lang], 120); return true; }
  }
  if (id === 'cin-01' && current.kind === 'locker') {
    if (!paint(ctx, images, 'cryo-bulkhead', [0, 92, 1280, 536], { cover: true })) return false;
    paint(ctx, images, 'cryo-overhead', [0, 70, 1280, 640]);
    drawSet('locker'); caption(current.caption?.[lang]); return true;
  }
  if (id === 'cin-03' && current.kind === 'port-approach') {
    const fit = paint(ctx, images, 'port-meridien-night-approach', [0, 92, 1280, 536], { cover: true }); if (!fit) return false;
    const [px, py, pw, ph] = prologueArtAnchorV188(fit, 'pad');
    for (let i = 0; i < 8; i++) { const on = reducedMotion || (Math.floor(local * 3) + i) % 2 === 0, a = i / 8 * Math.PI * 2;
      const dx = Math.cos(a) * pw / 2, dy = Math.sin(a) * ph / 2;
      ctx.fillStyle = on ? '#e15b4f' : '#4a1612'; ctx.fillRect(px + pw / 2 + dx - 3, py + ph / 2 + dy - dx * .018 - 3, 6, 6); }
    rain(local, reducedMotion, 'rgba(170,200,210,.3)'); caption(current.caption?.[lang]); return true;
  }
  if (id === 'cin-doyenne' && current.kind === 'port-tour') {
    const source = { docks: 'quay', infirmary: 'medical-room', processor: 'port-meridien-night-approach', wall: 'north-wall' }[current.place];
    if (!source || !imageAt(images, source)) return false;
    const pan = reducedMotion ? 0 : progress * 60;
    const box = current.place === 'processor' ? [-370 - pan, 36, 1740, 756] : [-pan, 92, 1340, 536];
    paint(ctx, images, source, box, { cover: true });
    if (current.place === 'wall') rain(local, reducedMotion, 'rgba(160,190,200,.15)');
    caption(current.caption?.[lang]); return true;
  }
  return false;
}
