// V188 — CIN-70 to CIN-72, the Asphodèle station cinematics (bible §10, §7.2;
// spec 007). They join `CINEMATICS_V188` in `story-cinematics-v188.js` and play
// through the same player (skippable, replayable, no reward). Shots reuse the
// existing kinds (`dialogue`, `helmet-cam`, `signal-lost`, `terminal`); two new
// kinds (`station-exterior`, `station-waveform`) and two staged sets (`control`,
// `lowerdeck`, sized in metres through `cinematicSetLayoutV188`) compose the
// selected cinematic layers and existing hub/insertion art. Missing images keep
// their primitive fallback. Asphodèle, CASSIUS, Echo-8 and Kessler are project
// creations; lines are [PROPOSÉ] (bible §7.6). No story-player import here.
import { asphodeleImageFitV188, ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188, ASPHODELE_HUB_IMAGE_ANCHORS_V188 } from './asphodele-hub-slots-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const shot = (seconds, kind, data = {}) => Object.freeze({ seconds, kind, ...data });
const line = (speaker, crewId, fr, en) => Object.freeze({ speaker, crewId, text: t(fr, en) });

export const STATION_CINEMATICS_V188 = Object.freeze({
  // CIN-70 · Six heures de silence (40 s), at the end of Rook's quest "Six heures" (§7.2 intro, §8.4).
  'cin-70': Object.freeze({ id: 'cin-70', title: t('Six heures de silence', 'Six hours of silence'), music: null, shots: Object.freeze([
    shot(9, 'dialogue', { scene: 'quarters', line: line('ROOK', 'crew-06-rook',
      'Six heures d’enregistrement casque. Rien, puis un bruit dans les conduits. Écoutez la fin.',
      'Six hours of helmet recording. Nothing, then a noise in the ducts. Listen to the end.') }),
    shot(9, 'station-waveform', { caption: t('ECHO-8 · CASQUE · 05:58 → 06:00', 'ECHO-8 · HELMET · 05:58 → 06:00') }),
    shot(14, 'station-exterior', { caption: t('COCYTE · STATION ASPHODÈLE · FEUX ÉTEINTS', 'COCYTE · ASPHODÈLE STATION · LIGHTS OUT') }),
    shot(8, 'dialogue', { scene: 'dropship', line: line('MAKSIM ORLOV', 'crew-08-maksim-orlov',
      'Je nous rapproche. Leur dropship est toujours au sas, et une navette Crucible tient l’anneau.',
      'Bringing us in. Their dropship is still at the airlock, and a Crucible shuttle holds the ring.') })
  ]) }),
  // CIN-71 · La voix de CASSIUS (40 s), after S2, before the decision (§7.2).
  'cin-71': Object.freeze({ id: 'cin-71', title: t('La voix de CASSIUS', 'The voice of CASSIUS'), music: null, shots: Object.freeze([
    shot(8, 'dialogue', { scene: 'control', radio: true, line: line('IDRIS KWAN · RADIO', 'crew-03-idris-kwan',
      'Énergie rétablie au pont de contrôle. Il se réveille. Parlez-lui.',
      'Power restored on the control deck. It is waking up. Talk to it.') }),
    shot(13, 'dialogue', { scene: 'control', line: line('CASSIUS', null,
      'Consignes actives : quarantaine de la station et de Cocyte. Priorité cargaison. Préservation des actifs. Aucune consigne ne m’autorise à lever la quarantaine sans accord de la compagnie.',
      'Active directives: quarantine of the station and of Cocyte. Cargo priority. Preservation of assets. No directive allows me to lift the quarantine without company approval.') }),
    shot(9, 'terminal', { clock: 'S2', lines: Object.freeze([
      t('ORDRES DE LIVRAISON QZ17 · ARCHIVÉS', 'QZ17 DELIVERY ORDERS · ARCHIVED'),
      t('PRIORITÉ CARGAISON · MAINTENUE PENDANT LA QUARANTAINE', 'CARGO PRIORITY · KEPT DURING THE QUARANTINE')]), status: t('COPIÉS AU DOSSIER', 'COPIED TO THE FILE') }),
    shot(10, 'dialogue', { scene: 'control', line: line('CASSIUS', null,
      'J’attends une décision.', 'I await a decision.') })
  ]) }),
  // CIN-72 · Le dernier enregistrement d'Echo-8 (30 s), after S3 (§7.4).
  'cin-72': Object.freeze({ id: 'cin-72', title: t('Le dernier enregistrement d’Echo-8', 'Echo-8’s last recording'), music: null, shots: Object.freeze([
    shot(12, 'helmet-cam', { caption: t('CAMÉRA CASQUE · SGT D. KESSLER · ECHO-8 · H+5:58', 'HELMET CAM · SGT D. KESSLER · ECHO-8 · H+5:58') }),
    shot(10, 'dialogue', { scene: 'lowerdeck', radio: true, line: line('SGT DARIO KESSLER · ENREGISTREMENT', null,
      'Les survivants sont barricadés au pont inférieur, l’administratrice avec eux. On sort chercher une issue. Si quelqu’un écoute : la station ne nous laissera pas partir.',
      'The survivors are barricaded on the lower deck, the administrator with them. We’re going out to find a way. If anyone is listening: the station won’t let us leave.') }),
    shot(8, 'signal-lost', { caption: t('FIN DE L’ENREGISTREMENT · 06:00:05', 'END OF RECORDING · 06:00:05') })
  ]) })
});
export const STATION_CINEMATIC_IDS_V188 = Object.freeze(Object.keys(STATION_CINEMATICS_V188));

const art = (path, purpose) => Object.freeze({ path, purpose });
const CIN_ROOT = '/assets/asphodele/v188/cinematics/';
// A dedicated catalogue keeps these six cinematic images distinct from the 42
// playable hub/mission slots. Existing art is referenced at its original path.
export const STATION_CINEMATIC_ART_V188 = Object.freeze({
  'asph-cin-ring': art(`${CIN_ROOT}asph-cin-ring.png`, 'Four-spoke rotating annulus; transparent central hole.'),
  'asph-cin-hub': art(`${CIN_ROOT}asph-cin-hub.png`, 'Stationary central hub; native quarantine light.'),
  'asph-cin-rook-quarters': art(`${CIN_ROOT}asph-cin-rook-quarters.png`, 'Rook’s unoccupied personal terminal; the existing portrait supplies identity.'),
  'asph-cin-helmet-corridor': art(`${CIN_ROOT}asph-cin-helmet-corridor.png`, 'Echo-8 helmet camera corridor; threat and recording UI are separate.'),
  'asph-cin-ceiling-drone': art(`${CIN_ROOT}asph-cin-ceiling-drone.png`, 'Ceiling-clinging alien, revealed after 55 percent of the existing shot.'),
  'asph-cin-bent-door': art(`${CIN_ROOT}asph-cin-bent-door.png`, 'Deformed lower-deck door, at the existing 1.9 by 2.6 metre scale.'),
  'asph-wall-control': art('/assets/asphodele/v188/asph-wall-control.png', 'Control-deck wall, shared with the playable hub.'),
  'asph-wall-lower': art('/assets/asphodele/v188/asph-wall-lower.png', 'Lower-deck wall, shared with the playable hub.'),
  'asph-cassius-core': art('/assets/asphodele/v188/asph-cassius-core.png', 'CASSIUS shell with six live native screens.'),
  'asph-qz-map': art('/assets/asphodele/v188/asph-qz-map.png', 'Analogue console shells, native screen content.'),
  'asph-echo8-barricade': art('/assets/asphodele/v188/asph-echo8-barricade.png', 'Echo-8 barricade with native evidence markings.'),
  'asph-ud4l-docked': art('/assets/asphodele/v188/asph-ud4l-docked.png', 'Echo-8 dropship, attached to the rotating rim.'),
  'asph-crucible-shuttle': art('/assets/asphodele/v188/asph-crucible-shuttle.png', 'Crucible shuttle, attached to the rotating rim.'),
  'starfield-deep': art('/assets/insertion/v188/starfield-deep.png', 'Existing orbital star field.'),
  'planet-limb': art('/assets/insertion/v188/planet-limb.png', 'Existing planet disc used as Cocyte’s limb.'),
  'crt-bezel': art('/assets/insertion/v188/crt-bezel.png', 'Existing transparent monitor surround; waveform and orders remain native.'),
  'ud4l-troop-bay': art('/assets/insertion/v188/ud4l-troop-bay.png', 'Existing dry troop compartment, without atmospheric rain.'),
  'echo9-idle': art('/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png', 'Existing reviewed marine idle cell, with a fixed foot pivot.')
});
export const STATION_CINEMATIC_NEW_ART_IDS_V188 = Object.freeze(Object.keys(STATION_CINEMATIC_ART_V188).filter(id => id.startsWith('asph-cin-')));
export const STATION_CINEMATIC_ART_BY_ID_V188 = Object.freeze({
  'cin-70': Object.freeze(['asph-cin-rook-quarters', 'crt-bezel', 'starfield-deep', 'planet-limb', 'asph-cin-ring', 'asph-cin-hub', 'asph-ud4l-docked', 'asph-crucible-shuttle', 'ud4l-troop-bay']),
  'cin-71': Object.freeze(['asph-wall-control', 'asph-cassius-core', 'asph-qz-map', 'echo9-idle', 'crt-bezel']),
  'cin-72': Object.freeze(['asph-cin-helmet-corridor', 'asph-cin-ceiling-drone', 'asph-wall-lower', 'asph-echo8-barricade', 'asph-cin-bent-door'])
});
/** Null means this is not a station cinematic; the original player policy applies. */
export function stationCinematicSourcesV188(id) {
  const ids = STATION_CINEMATIC_ART_BY_ID_V188[id];
  return ids ? ids.map(key => STATION_CINEMATIC_ART_V188[key].path) : null;
}

// Source windows alter sampling only. The selected PNG files are never edited.
// Bounds and anchors below were measured on the six inspected final outputs.
export const STATION_CINEMATIC_ART_SOURCE_RECTS_V188 = Object.freeze({
  ...ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188,
  'asph-cin-ring': Object.freeze([31, 31, 1192, 1192]),
  'asph-cin-hub': Object.freeze([72, 72, 1110, 1110]),
  'asph-cin-ceiling-drone': Object.freeze([50, 8, 1836, 772]),
  'asph-cin-bent-door': Object.freeze([14, 14, 1040, 1440]),
  'planet-limb': Object.freeze([13, 21, 1222, 1210]),
  'echo9-idle': Object.freeze([70, 47, 115, 193])
});
export const STATION_CINEMATIC_ART_ANCHORS_V188 = Object.freeze({
  ...ASPHODELE_HUB_IMAGE_ANCHORS_V188,
  'asph-cin-ring': Object.freeze({ pivot: Object.freeze([627, 627]) }),
  'asph-cin-hub': Object.freeze({ pivot: Object.freeze([627, 627]), quarantine: Object.freeze([616, 616, 23, 23]) }),
  'asph-cin-rook-quarters': Object.freeze({ screen: Object.freeze([1168, 238, 207, 144]) }),
  'asph-cin-helmet-corridor': Object.freeze({ ceilingBeam: Object.freeze([600, 142, 1020, 75]) }),
  'asph-cin-ceiling-drone': Object.freeze({
    rearFoot: Object.freeze([474, 46]), frontFoot: Object.freeze([811, 43]),
    rearHand: Object.freeze([1505, 26]), frontHand: Object.freeze([1571, 18])
  }),
  'crt-bezel': Object.freeze({ screen: Object.freeze([106, 110, 1270, 790]) }),
  'echo9-idle': Object.freeze({ foot: Object.freeze([128, 240]) })
});
export const STATION_CINEMATIC_ORBIT_V188 = Object.freeze({
  center: Object.freeze([560, 336]), ringDiameter: 440, hubDiameter: 96, radiansPerSecond: .05,
  docks: Object.freeze([
    Object.freeze({ id: 'asph-crucible-shuttle', angle: .6, radius: 242, width: 60, height: 32 }),
    Object.freeze({ id: 'asph-ud4l-docked', angle: 2.4, radius: 242, width: 54, height: 28 })
  ])
});
export const STATION_CINEMATIC_HELMET_V188 = Object.freeze({ revealAfter: .55, threat: Object.freeze([520, 229, 350, 146]), rec: Object.freeze([40, 124]) });

const imageFor = (images, id) => {
  const image = images?.[STATION_CINEMATIC_ART_V188[id]?.path];
  return image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null;
};
/** Proportional fit and optional visible source crop, reusable by native QA. */
export function stationArtFitV188(images, id, box, { alignX = .5, alignY = .5 } = {}) {
  const image = imageFor(images, id);
  return image ? asphodeleImageFitV188(image, ...box, { sourceRect: STATION_CINEMATIC_ART_SOURCE_RECTS_V188[id] || null, alignX, alignY }) : null;
}
function drawArt(ctx, images, id, box, options) {
  const fit = stationArtFitV188(images, id, box, options), image = imageFor(images, id);
  if (!fit || !ctx.drawImage) return null;
  ctx.drawImage(image, fit.sx, fit.sy, fit.sw, fit.sh, fit.x, fit.y, fit.w, fit.h);
  return { ...fit, id };
}
function coverArt(ctx, images, id, [x, y, w, h]) {
  const image = imageFor(images, id); if (!image || !ctx.drawImage) return null;
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight), sw = w / scale, sh = h / scale;
  const sx = (image.naturalWidth - sw) / 2, sy = (image.naturalHeight - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h); return { id, sx, sy, sw, sh, x, y, w, h, scale };
}
export function stationArtAnchorV188(fit, key) {
  const anchor = fit && STATION_CINEMATIC_ART_ANCHORS_V188[fit.id]?.[key];
  return anchor?.length === 4 ? [fit.x + (anchor[0] - fit.sx) * fit.scale, fit.y + (anchor[1] - fit.sy) * fit.scale, anchor[2] * fit.scale, anchor[3] * fit.scale] : null;
}
function screen(ctx, rect, color, draw) {
  if (!rect) return;
  const [x, y, w, h] = rect;
  ctx.save(); ctx.fillStyle = color; ctx.fillRect(x, y, w, h); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); draw?.(x, y, w, h); ctx.restore();
}

/** Station-only scene backgrounds. Other cinematics retain their original path. */
export function drawStationBackgroundV188(ctx, images, id, scene, { time = 0, reducedMotion = false, W = 1280, H = 720 } = {}) {
  if (id === 'cin-70' && scene === 'quarters') {
    const fit = coverArt(ctx, images, 'asph-cin-rook-quarters', [0, 92, W, H - 184]); if (!fit) return false;
    const [x, y, w, h] = stationArtAnchorV188(fit, 'screen'), clock = reducedMotion ? 0 : time;
    // Keep the curved glass from the source; only the signal is native.
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.strokeStyle = 'rgba(125,255,154,.8)'; ctx.lineWidth = 1.3; ctx.beginPath();
    for (let px = 0; px <= w; px += 2) { const dy = Math.sin(px * .19 + clock * 3) * Math.sin(px * .05) * h * .12; px ? ctx.lineTo(x + px, y + h * .48 + dy) : ctx.moveTo(x + px, y + h * .48 + dy); }
    ctx.stroke(); ctx.fillStyle = 'rgba(125,255,154,.3)';
    for (let i = 0; i < 3; i++) ctx.fillRect(x + 8, y + h * (.75 + i * .06), w * (.24 + i * .08), 1);
    ctx.restore();
    return true;
  }
  if (id === 'cin-70' && scene === 'dropship') {
    ctx.fillStyle = '#080807'; ctx.fillRect(0, 0, W, H);
    const dx = reducedMotion ? 0 : Math.sin(time * 37) * 1.8, dy = reducedMotion ? 0 : Math.cos(time * 29) * 1.4;
    ctx.save(); ctx.translate(dx, dy);
    if (!coverArt(ctx, images, 'ud4l-troop-bay', [-8, 84, W + 16, H - 168])) {
      ctx.fillStyle = '#1b1210'; ctx.fillRect(0, 92, W, H - 184);
      for (let i = 0; i < 6; i++) {
        const x = 90 + i * 190; ctx.fillStyle = '#2c1a17'; ctx.fillRect(x, 285, 120, 215);
        ctx.strokeStyle = '#654c37'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 20, 290); ctx.lineTo(x + 60, 430); ctx.lineTo(x + 100, 290); ctx.stroke();
      }
      ctx.fillStyle = '#0a1012'; for (const x of [300, 980]) { ctx.beginPath(); ctx.arc(x, 180, 34, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore(); return true;
  }
  const wall = id === 'cin-71' && scene === 'control' ? 'asph-wall-control' : id === 'cin-72' && scene === 'lowerdeck' ? 'asph-wall-lower' : null;
  if (!wall) return false;
  ctx.fillStyle = STATION_CINEMATIC_PALETTES_V188[scene][0]; ctx.fillRect(0, 0, W, H);
  coverArt(ctx, images, wall, [0, 92, W, 468]);
  ctx.fillStyle = scene === 'control' ? 'rgba(0,12,4,.25)' : 'rgba(8,3,0,.22)'; ctx.fillRect(0, 92, W, 468);
  ctx.fillStyle = '#0a0f0c'; ctx.fillRect(0, 560, W, H - 560); return true;
}

/** Art for the existing metre-sized set items; false retains that item's fallback. */
export function drawStationSetArtV188(ctx, entry, { images = {}, x, w, h, top, floor, time = 0, reducedMotion = false } = {}) {
  const clock = reducedMotion ? 0 : time;
  if (entry.kind === 'core') {
    const placement = stationArtFitV188(images, 'asph-cassius-core', [x, top, w, h], { alignY: 0 }); if (!placement) return false;
    // The native service plinth fills the remaining height of the declared
    // 1.6 × 2.4 m assembly without distorting the six-screen image.
    ctx.fillStyle = '#1d2826'; ctx.fillRect(placement.x, placement.y + placement.h, placement.w, Math.max(0, floor - placement.y - placement.h));
    const fit = drawArt(ctx, images, 'asph-cassius-core', [x, top, w, h], { alignY: 0 });
    for (let row = 0; row < 3; row++) for (let column = 0; column < 2; column++) screen(ctx, stationArtAnchorV188(fit, `screen${row * 2 + column}`), '#06200f', (sx, sy, sw, sh) => {
      if (row !== 1) return;
      ctx.strokeStyle = '#7dff9a'; ctx.lineWidth = 2; ctx.beginPath();
      for (let p = 0; p <= sw; p += 3) { const y = sy + sh * .5 + Math.sin(p * .12 + clock * 7) * sh * .13; p ? ctx.lineTo(sx + p, y) : ctx.moveTo(sx + p, y); } ctx.stroke();
    });
    ctx.fillStyle = '#7dff9a'; ctx.font = '700 16px monospace'; ctx.fillText(entry.label, fit.x + fit.w * .3, fit.y - 10); return true;
  }
  if (entry.kind === 'console') {
    const fit = drawArt(ctx, images, 'asph-qz-map', [x, top - h * .45, w, h * .95], { alignY: 1 }); if (!fit) return false;
    ctx.fillStyle = '#1b2622'; ctx.fillRect(x + w * .12, top + h * .5, w * .76, h * .5);
    screen(ctx, stationArtAnchorV188(fit, 'screen'), '#06200f', (sx, sy, sw, sh) => { ctx.fillStyle = 'rgba(125,255,154,.45)'; for (let i = 0; i < 5; i++) ctx.fillRect(sx + sw * .08, sy + sh * (.16 + i * .14), sw * (.3 + i % 3 * .15), Math.max(2, sh * .018)); });
    return true;
  }
  if (entry.kind === 'barricade') {
    const fit = drawArt(ctx, images, 'asph-echo8-barricade', [x, top, w, h], { alignY: 1 }); if (!fit) return false;
    const marks = stationArtAnchorV188(fit, 'markings');
    if (marks) { const [sx, sy, sw, sh] = marks; ctx.fillStyle = '#e9e4d8'; for (let i = 0; i < 6; i++) ctx.fillRect(sx + sw * (.1 + i * .1), sy + sh * .2, Math.max(2, sw * .018), sh * .5); }
    return true;
  }
  if (entry.kind === 'bent-door') {
    const fit = stationArtFitV188(images, 'asph-cin-bent-door', [x, top, w, h], { alignY: 1 }); if (!fit) return false;
    drawArt(ctx, images, 'asph-cin-bent-door', [x, top, w, h], { alignY: 1 }); return true;
  }
  if (entry.kind === 'person' && entry.who === 'ECHO-9') {
    const image = imageFor(images, 'echo9-idle'); if (!image || !ctx.drawImage) return false;
    const rect = STATION_CINEMATIC_ART_SOURCE_RECTS_V188['echo9-idle'], scale = h / rect[3], pivot = STATION_CINEMATIC_ART_ANCHORS_V188['echo9-idle'].foot;
    ctx.save(); ctx.translate(x, floor); ctx.scale(-scale, scale); ctx.drawImage(image, ...rect, rect[0] - pivot[0], rect[1] - pivot[1], rect[2], rect[3]); ctx.restore(); return true;
  }
  return false;
}

/** The reused bezel keeps its shape; all evidence is drawn in its measured clear aperture. */
export function stationMonitorRectV188(ctx, images, { W = 1280, H = 720 } = {}) {
  ctx.fillStyle = '#030705'; ctx.fillRect(0, 0, W, H);
  const fit = drawArt(ctx, images, 'crt-bezel', [100, 96, W - 200, H - 192]);
  const rect = fit ? stationArtAnchorV188(fit, 'screen') : [200, 140, 880, 400];
  ctx.fillStyle = '#071009'; ctx.fillRect(...rect); return rect;
}
export function drawStationTerminalV188(ctx, current, { images = {}, local = 0, progress = 0, lang = 'fr', reducedMotion = false } = {}) {
  const rect = stationMonitorRectV188(ctx, images), [x, y, w, h] = rect;
  screen(ctx, rect, '#071009', () => {
    ctx.fillStyle = '#8df0b0'; ctx.font = '700 15px monospace';
    ctx.fillText(`ASPHODÈLE · ${lang === 'en' ? 'QZ17 ARCHIVES' : 'ARCHIVES QZ17'} · ${current.clock}`, x + 22, y + 34);
    const rows = current.lines.map(entry => entry[lang]), total = rows.join('').length;
    let budget = Math.ceil(total * Math.min(1, progress * 2.2)), rowY = y + 96;
    ctx.font = '17px monospace';
    for (const row of rows) {
      const visible = row.slice(0, Math.max(0, budget)); budget -= row.length;
      if (visible) { const words = visible.split(/\s+/); let line = '';
        for (const word of words) { const next = line ? `${line} ${word}` : word;
          if (line && (ctx.measureText?.(next)?.width || next.length * 10) > w - 44) { ctx.fillText(line, x + 22, rowY); rowY += 25; line = word; } else line = next; }
        if (line) ctx.fillText(line, x + 22, rowY); rowY += 34;
      }
    }
    if (progress > .5) { ctx.fillStyle = reducedMotion || Math.floor(local * 2) % 2 ? '#e9d07a' : '#7c6c38'; ctx.font = '700 25px monospace'; ctx.fillText(current.status[lang], x + 22, y + h - 50); }
  });
  return true;
}

export function drawStationHelmetV188(ctx, current, { images = {}, local = 0, progress = 0, lang = 'fr', reducedMotion = false, caption = () => {}, W = 1280, H = 720 } = {}) {
  ctx.fillStyle = '#070a08'; ctx.fillRect(0, 0, W, H);
  if (!coverArt(ctx, images, 'asph-cin-helmet-corridor', [0, 92, W, H - 184])) {
    ctx.fillStyle = '#121a16'; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(560, 300); ctx.lineTo(720, 300); ctx.lineTo(W, H); ctx.fill();
  }
  if (progress > STATION_CINEMATIC_HELMET_V188.revealAfter) {
    if (!drawArt(ctx, images, 'asph-cin-ceiling-drone', STATION_CINEMATIC_HELMET_V188.threat)) {
      const [x, y, w, h] = STATION_CINEMATIC_HELMET_V188.threat;
      ctx.fillStyle = '#020302'; ctx.beginPath(); ctx.ellipse(x + w * .56, y + h * .7, w * .34, h * .2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + w * .4, y, 10, h * .7); ctx.fillRect(x + w * .74, y + 8, 8, h * .65);
    }
  }
  const seed = reducedMotion ? 3 : Math.floor(local * 20); ctx.fillStyle = 'rgba(200,220,210,.08)';
  for (let i = 0; i < (reducedMotion ? 40 : 260); i++) ctx.fillRect((i * 7919 + seed * 104729) % W, (i * 6271 + seed * 1299709) % H, 2, 2);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 92; y < H - 92; y += 4) ctx.fillRect(0, y, W, 1);
  caption(current.caption?.[lang]); return true;
}
/** Helmet recording UI is screen-space, outside the scene's push-in and crop. */
export function drawStationHelmetHudV188(ctx) {
  ctx.fillStyle = '#e15b4f'; ctx.font = '700 14px monospace'; ctx.fillText('● REC', ...STATION_CINEMATIC_HELMET_V188.rec);
}

// Staged sets in metres (same contract as the sets of story-cinematics-v188.js).
const item = (kind, x, w, h, extra = {}) => Object.freeze({ kind, x, w, h, ...extra });
export const STATION_CINEMATIC_SETS_V188 = Object.freeze({
  // The control deck: a bank of Seegson consoles (0.9 m desks), CASSIUS's core (1.6 × 2.4 m), Echo-9.
  control: Object.freeze({ scale: 150, floor: 560, items: Object.freeze([
    item('console', 120, 1.6, .95), item('console', 400, 1.6, .95),
    item('core', 760, 1.6, 2.4, { label: 'CASSIUS' }),
    item('person', 1120, .5, 1.8, { who: 'ECHO-9', torch: false })
  ]) }),
  // The lower deck barricade of Echo-8: stacked crates and a bent door (2.6 m), the tag on the floor.
  lowerdeck: Object.freeze({ scale: 150, floor: 560, items: Object.freeze([
    item('barricade', 200, 3.2, 1.6), item('bent-door', 760, 1.9, 2.6),
    item('tag', 640, .06, .03, { label: 'KESSLER D.' })
  ]) })
});
export const STATION_CINEMATIC_PALETTES_V188 = Object.freeze({ control: ['#061008', '#0f1d15'], lowerdeck: ['#0a0806', '#1a120d'] });

/** Set items of the station scenes. Returns true when it drew the item. */
export function drawStationSetItemV188(ctx, entry, { x, w, h, top, floor, time = 0, reducedMotion = false } = {}) {
  switch (entry.kind) {
    case 'console': {
      ctx.fillStyle = '#1b2622'; ctx.fillRect(x, top, w, h); ctx.fillStyle = '#06200f'; ctx.fillRect(x + w * .1, top - h * .55, w * .8, h * .5);
      ctx.fillStyle = 'rgba(125,255,154,.45)'; for (let i = 0; i < 5; i++) ctx.fillRect(x + w * .14, top - h * .5 + i * h * .08, w * (.3 + (i % 3) * .15), 3);
      return true;
    }
    case 'core': {
      ctx.fillStyle = '#0a120d'; ctx.fillRect(x, top, w, h);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { ctx.fillStyle = '#06200f'; ctx.fillRect(x + w * (.06 + c * .48), top + h * (.06 + r * .3), w * .42, h * .24); }
      ctx.strokeStyle = 'rgba(125,255,154,.9)'; ctx.lineWidth = 3; ctx.beginPath();
      for (let px = 0; px <= w * .88; px += 6) ctx.lineTo(x + w * .06 + px, top + h * .5 + Math.sin(px * .08 + (reducedMotion ? 0 : time * 7)) * h * .05);
      ctx.stroke(); ctx.fillStyle = '#7dff9a'; ctx.font = '700 16px monospace'; ctx.fillText(entry.label, x + w * .3, top - 10);
      return true;
    }
    case 'barricade': {
      for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#3a3226' : '#2c2a22'; ctx.fillRect(x + (i % 3) * w * .3, floor - h * (i < 3 ? .5 : 1), w * .32, h * .48); }
      ctx.fillStyle = '#e9e4d8'; for (let i = 0; i < 6; i++) ctx.fillRect(x + w * .1 + i * 14, floor - h * .8, 3, 18); // chalk marks counting the hours
      return true;
    }
    case 'bent-door': {
      ctx.fillStyle = '#1d2328'; ctx.fillRect(x - 10, top - 10, w + 20, h + 10); ctx.fillStyle = '#2b333a';
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + w * .45, top); ctx.lineTo(x + w * .55, top + h * .6); ctx.lineTo(x + w * .4, floor); ctx.lineTo(x, floor); ctx.fill();
      ctx.fillStyle = '#05080a'; ctx.beginPath(); ctx.moveTo(x + w * .55, top + h * .6); ctx.lineTo(x + w, top); ctx.lineTo(x + w, floor); ctx.lineTo(x + w * .4, floor); ctx.fill();
      return true;
    }
    case 'tag': {
      const glint = reducedMotion ? .7 : .5 + .5 * Math.abs(Math.sin(time * 2));
      ctx.fillStyle = `rgba(220,225,215,${glint})`; ctx.fillRect(x, floor - 8, 24, 12); ctx.strokeStyle = 'rgba(220,225,215,.6)'; ctx.beginPath(); ctx.moveTo(x + 12, floor - 8); ctx.lineTo(x + 30, floor - 30); ctx.stroke();
      return true;
    }
    default: return false;
  }
}

/** New shot kinds. `caption(text, y)` is the player's caption queue. Returns true when it drew the shot. */
export function drawStationShotV188(ctx, current, { images = {}, local = 0, progress = 0, lang = 'fr', reducedMotion = false, caption = () => {}, W = 1280, H = 720 } = {}) {
  if (current.kind === 'station-exterior') {
    ctx.fillStyle = '#020305'; ctx.fillRect(0, 0, W, H);
    if (!coverArt(ctx, images, 'starfield-deep', [0, 0, W, H])) {
      ctx.fillStyle = 'rgba(230,240,255,.7)'; for (let i = 0; i < 160; i++) ctx.fillRect((i * 7919) % W, (i * 6271) % H, i % 7 ? 1 : 2, i % 7 ? 1 : 2);
    }
    if (!drawArt(ctx, images, 'planet-limb', [840, 380, 850, 850])) { ctx.fillStyle = '#3a3d34'; ctx.beginPath(); ctx.arc(1180, 900, 520, 0, Math.PI * 2); ctx.fill(); }
    const orbit = STATION_CINEMATIC_ORBIT_V188, [cx, cy] = orbit.center, r = orbit.ringDiameter / 2;
    const spin = reducedMotion ? 0 : local * orbit.radiansPerSecond;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(spin);
    if (!drawArt(ctx, images, 'asph-cin-ring', [-r, -r, r * 2, r * 2])) {
      ctx.strokeStyle = '#4a5054'; ctx.lineWidth = 26; ctx.beginPath(); ctx.ellipse(0, 0, r - 13, r - 13, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#353a3d'; ctx.lineWidth = 10; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 43, Math.sin(a) * 43); ctx.lineTo(Math.cos(a) * (r - 16), Math.sin(a) * (r - 16)); ctx.stroke(); }
    }
    for (const dock of orbit.docks) {
      ctx.save(); ctx.rotate(dock.angle); ctx.fillStyle = '#353a3d'; ctx.fillRect(r - 3, -5, dock.radius - r + 5, 10); ctx.translate(dock.radius, 0);
      if (!drawArt(ctx, images, dock.id, [-dock.width / 2, -dock.height / 2, dock.width, dock.height])) { ctx.fillStyle = dock.id === 'asph-crucible-shuttle' ? '#5c5245' : '#4a5440'; ctx.fillRect(-dock.width / 2, -dock.height / 2, dock.width, dock.height); }
      ctx.restore();
    }
    ctx.restore();
    const h = orbit.hubDiameter;
    const hub = drawArt(ctx, images, 'asph-cin-hub', [cx - h / 2, cy - h / 2, h, h]);
    if (!hub) { ctx.fillStyle = '#2b3236'; ctx.beginPath(); ctx.arc(cx, cy, h / 2, 0, Math.PI * 2); ctx.fill(); }
    const blink = reducedMotion ? 1 : Math.floor(local * 1.2) % 2; ctx.fillStyle = blink ? '#e15b4f' : '#5a1f1b';
    ctx.fillRect(...(stationArtAnchorV188(hub, 'quarantine') || [cx - 6, cy - 6, 12, 12]));
    caption(current.caption?.[lang], 640); return true;
  }
  if (current.kind === 'station-waveform') {
    const rect = stationMonitorRectV188(ctx, images, { W, H });
    screen(ctx, rect, '#050a07', (x, y, w, h) => {
      const left = x + 24, right = x + w - 24, span = right - left, baseline = y + h * .5, ticks = y + h - 52;
      ctx.strokeStyle = 'rgba(125,255,154,.35)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) { const tx = left + span * i / 10; ctx.beginPath(); ctx.moveTo(tx, ticks); ctx.lineTo(tx, ticks + 10); ctx.stroke(); }
      ctx.fillStyle = 'rgba(125,255,154,.7)'; ctx.font = '14px monospace'; ctx.fillText('05:58', left, ticks + 31); ctx.fillText('06:00', right - 42, ticks + 31);
      const reach = reducedMotion ? 1 : Math.min(1, progress * 1.2), cut = left + span * .92;
      ctx.strokeStyle = '#7dff9a'; ctx.lineWidth = 2; ctx.beginPath();
      for (let px = 0; px < Math.min(span * .92, reach * span); px += 2) { const sourceX = 140 + px / span * 1000, loud = sourceX > 900 ? 3 + (sourceX - 900) / 14 : 3;
        const dy = (Math.sin(sourceX * .37) * loud + Math.sin(sourceX * 1.3) * loud * .5) * h / 360;
        px ? ctx.lineTo(left + px, baseline + dy) : ctx.moveTo(left + px, baseline + dy);
      } ctx.stroke();
      if (reach >= .92) { ctx.fillStyle = '#e15b4f'; ctx.fillRect(cut, baseline - h * .16, 3, h * .32); ctx.font = '700 14px monospace'; ctx.textAlign = 'right'; ctx.fillText(lang === 'en' ? 'CUT' : 'COUPURE', right, baseline - h * .22); ctx.textAlign = 'left'; }
    });
    caption(current.caption?.[lang], 640); return true;
  }
  return false;
}
