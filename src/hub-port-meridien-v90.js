import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { HubGame as PhysicalHub } from './hub-v71-runtime.js';
import { HubGame as PlayerRenderer } from './hub-game.js';
import { CARGO_BRUTAL_SURVIVORS_SHEET_V67 } from './cargo-brutal-visuals-v67.js';
import { PORT_WORLD_V90, PORT_POSTS_V90, PORT_CIVILIANS_SAFE_V188, stepPortCivilianV188, portCivilianWalkingV188, normalizePortMeridienV90, portPhysicalContactV90, portTaskSecondsV90, getPortMeridienObjectiveV90 } from './port-meridien-v90.js';
import { hubPlayerAppearanceSnapshotV126 } from './player-appearance-hub-v126.js';
import { currentLanguageV185 } from './i18n-v185.js';
import { PORT_DEPTH_ROOM_V188, depthToScreenOffsetV188 } from './hub-depth-rooms-v188.js';
import { drawDepthPropV188 } from './hub-depth-runtime-v188.js';
import { ARMORY_STOREFRONT_SOURCE_V169, getArmoryStorefrontPlanV169,
  drawArmoryStorefrontV169, getArmoryStoreContactV169, isArmoryArtAdmittedV171,
  isArmoryStorefrontImageReadyV172 } from './hub-armory-storefront-v169.js';

export const PORT_ASSETS_V90 = Object.freeze({
  far: '/assets/openai/metroidvania/colony-multiroute-far.png',
  mid: '/assets/openai/metroidvania/colony-multiroute-mid.png',
  floor: '/assets/openai/metroidvania/props/floor-segment.png',
  catwalk: '/assets/openai/metroidvania/props/overhead-catwalk.png',
  ladder: '/assets/openai/metroidvania/props/wall-ladder.png',
  crate: '/assets/openai/metroidvania/props/supply-crates.png',
  console: '/assets/openai/hub/props/sensor-console.png',
  medical: '/assets/openai/hub/props/medical-bed.png',
  door: '/assets/openai/hub/props/bulkhead-door.png',
  civilians: CARGO_BRUTAL_SURVIVORS_SHEET_V67.path
});
const ready = image => Boolean(image?.complete && image.naturalWidth);
const gateClosed = state => ['unload', 'carry', 'triage', 'power'].includes(state?.phase);

// V188 coherence pass (bible §4 P-3, §56.12). Scale: the marine (92 px) is about 1.80 m, so 1 m ≈ 51 px.
// Everything placed here is a project adaptation drawn in primitives or from existing props (no new image):
// the people of §4 P-3 whose sprites are [À CRÉER] stand on the quay as placeholders.
export const PORT_METRE_PX_V188 = 51;
export const PORT_SCENE_V188 = Object.freeze({
  // The UD-4L stern at the west edge (its hull leaves the world); the lowered ramp ends where the marine starts.
  dropship: Object.freeze({ sternX: 84, hullTop: 466, belly: 586, rampTipX: 188, finTop: 400 }),
  unloadLot: Object.freeze({ x: 193, y: 574, w: 54, h: 50 }), // ≈ 1.06 × 0.98 m, at the foot of the ramp
  carriedLot: Object.freeze({ w: 40, h: 36 }),
  deliveredLot: Object.freeze({ x: 636, y: 590, w: 36, h: 34 }), // set down at the doctor's side once carried
  railCrate: Object.freeze({ x: 420, y: 574, w: 100, h: 50 }), // two 0.98 m freight crates on a pallet strip
  bed: Object.freeze({ x: 712, y: 537, w: 112, h: 87 }), // stretcher ≈ 2.2 m with its monitor arm
  relayConsole: Object.freeze({ x: 1360, y: 362, w: 80, h: 70 }), // ≈ 1.4 m high, on the catwalk
  reportConsole: Object.freeze({ x: 2270, y: 554, w: 80, h: 70 }),
  // The airlock: a 2.6 m door (132 px) in a bulkhead that rises to the top of the gate collider.
  gate: Object.freeze({ x: 1810, w: 108, wallTop: 356, doorH: 132, collider: Object.freeze({ x: 1824, w: 82 }) }),
  people: Object.freeze([
    Object.freeze({ id: 'tomas-wren', role: 'quay-master', x: 330, z: -4, h: 91, facing: -1 }), // 1.78 m, meets the ramp
    Object.freeze({ id: 'lucia-ferro', role: 'colony-doctor', x: 690, z: -2, h: 86, facing: 1 }) // 1.69 m, at the stretcher
  ]),
  patient: Object.freeze({ id: 'north-quay-patient', bandagedChest: true }), // lying on the stretcher
  floodlights: Object.freeze([
    Object.freeze({ x: 58, y: 476, reach: Object.freeze([92, 250]), mast: false }),
    Object.freeze({ x: 292, y: 418, reach: Object.freeze([170, 372]), mast: true })
  ]),
  emergencyLight: Object.freeze({ x: 1864, y: 348 }),
  signs: Object.freeze([
    Object.freeze({ id: 'ramp', fr: 'RAMPE · FRET', en: 'RAMP · FREIGHT', x: 85, y: 500 }),
    Object.freeze({ id: 'triage', fr: 'TRIAGE · HABITANTS', en: 'TRIAGE · RESIDENTS', x: 675, y: 493 }),
    Object.freeze({ id: 'relay', fr: 'RELAIS DU SAS', en: 'AIRLOCK RELAY', x: 1310, y: 325 }),
    Object.freeze({ id: 'normal-sector', fr: 'SECTEUR NORMAL ?', en: 'NORMAL SECTOR?', x: 2262, y: 538, color: '#e8ba77' })
  ])
});
export const portSignTextV188 = (sign, language = currentLanguageV185()) => language === 'en' ? sign.en : sign.fr;

export function portGeometryV90(state) {
  const gate = PORT_SCENE_V188.gate, doorY = PORT_WORLD_V90.floorY - gate.doorH;
  return { id: 'port-meridien-quay', name: 'Le quai des vivants', parentRoomId: 'briefing',
    entranceLocalX: 112, entranceSide: 'west', entrance: { w: 90 }, world: PORT_WORLD_V90,
    platforms: [{ x: 0, y: 624, w: 2560, h: 96 }, { x: 1180, y: 432, w: 500, h: 24 }],
    // Rungs are drawn at 439 + 24n, four pixels high: contact one pixel inside.
    ladders: [{ x: 1210, w: 44, y: 432, top: 432, bottom: 624, h: 192, rungSpacing: 24, firstRung: 8 }],
    colliders: [{ x: 420, y: 574, w: 100, h: 50 },
      // Closed: the whole gate bars the quay. Open: only the bulkhead above the 2.6 m doorway stays solid.
      gateClosed(state) ? { x: gate.collider.x, y: gate.wallTop, w: gate.collider.w, h: 268 }
        : { x: gate.collider.x, y: gate.wallTop, w: gate.collider.w, h: doorY - gate.wallTop }] };
}

// —— Local primitives (placeholders, no generated image) ——
const PEOPLE_LOOK_V188 = Object.freeze({
  'quay-master': { coat: '#3a3f35', legs: '#2c3238', skin: '#b88a6a', hair: '#23282a' },
  'colony-doctor': { coat: '#b9c0b8', legs: '#3e6a68', skin: '#8f5f45', hair: '#2a1d18' }
});
function drawPersonV188(ctx, person, feetY) {
  const look = PEOPLE_LOOK_V188[person.role], f = person.facing < 0 ? -1 : 1, x = person.x, h = person.h;
  const r = h * .068, top = feetY - h, shoulder = top + r * 2 + 3, hip = feetY - h * .47, torso = h * .27, leg = Math.max(5, h * .085);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, feetY + 1, torso * .75, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = look.legs; ctx.fillRect(x - leg - 1, hip, leg, feetY - hip - 5); ctx.fillRect(x + 1, hip, leg, feetY - hip - 5);
  ctx.fillStyle = '#1a1714'; ctx.fillRect(x - leg - 1 + (f > 0 ? 0 : -2), feetY - 6, leg + 2, 6); ctx.fillRect(x + 1 + (f > 0 ? 0 : -2), feetY - 6, leg + 2, 6);
  ctx.fillStyle = look.coat; ctx.fillRect(x - torso / 2, shoulder, torso, hip - shoulder + h * .14); // long coat, wet in the rain
  ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x - torso / 2, shoulder, torso, 3);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x - torso / 2 - 4, shoulder + 2, 5, h * .3); // far arm
  if (person.role === 'quay-master') {
    ctx.fillStyle = '#d39a2f'; ctx.fillRect(x - torso / 2 + 3, shoulder + 2, torso - 6, hip - shoulder - 2); // high-visibility vest
    ctx.fillStyle = '#e6e0c8'; for (const t of [.35, .7]) ctx.fillRect(x - torso / 2 + 3, shoulder + (hip - shoulder) * t, torso - 6, 2);
    ctx.fillStyle = '#0d1a1c'; ctx.fillRect(x + f * (torso / 2 - 1) - (f < 0 ? 8 : 0), shoulder + h * .2, 8, 10); // quay datapad
    ctx.fillStyle = '#6fd3c1'; ctx.fillRect(x + f * (torso / 2 - 1) - (f < 0 ? 8 : 0) + 1, shoulder + h * .2 + 1, 6, 5);
  } else {
    ctx.fillStyle = '#3e6a68'; ctx.fillRect(x - 4, shoulder, 8, 6); // scrubs at the collar
    ctx.fillStyle = '#ece9e1'; ctx.fillRect(x - torso / 2 - 4, shoulder + 8, 6, 7); // armband
    ctx.fillStyle = '#b8322c'; ctx.fillRect(x - torso / 2 - 2, shoulder + 9, 2, 5); ctx.fillRect(x - torso / 2 - 3, shoulder + 10, 4, 2);
  }
  ctx.fillStyle = look.coat; ctx.fillRect(x + f * (torso / 2 - 2) - (f < 0 ? 5 : 0), shoulder + 2, 5, h * .26); // near arm
  ctx.fillStyle = look.skin; ctx.beginPath(); ctx.arc(x + f, top + r, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = look.hair;
  if (person.role === 'quay-master') { ctx.fillRect(x - r, top - 1, r * 2 + 1, r * .8); ctx.fillRect(x + (f > 0 ? r - 1 : -r - 5), top + r * .55, 6, 2); } // cap and brim
  else { ctx.beginPath(); ctx.arc(x - f, top + r * .8, r, Math.PI, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(x - f * (r + 1), top + r, 3, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function drawPatientV188(ctx, bed, time, still) {
  // The north-quay patient lies on the stretcher, chest bandaged (§4 P-3). Breathing is a one-pixel rise.
  const breathe = still ? 0 : Math.max(0, Math.sin(time * 2.2)), x = bed.x, y = bed.y;
  ctx.save();
  ctx.fillStyle = '#6d6447'; ctx.fillRect(x + 18, y + 30, 42, 9); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x + 18, y + 30, 42, 2); // blanket over the legs
  ctx.fillStyle = '#8a705c'; ctx.fillRect(x + 58, y + 26 - breathe, 20, 11 + breathe); // bare torso
  ctx.fillStyle = '#e8e4da'; ctx.fillRect(x + 61, y + 27 - breathe, 12, 9 + breathe); // bandaged chest
  ctx.fillStyle = 'rgba(0,0,0,.16)'; for (const gy of [30, 33]) ctx.fillRect(x + 61, y + gy - breathe, 12, 1);
  ctx.fillStyle = '#8a705c'; ctx.fillRect(x + 60, y + 35, 14, 3); // arm along the side
  ctx.beginPath(); ctx.arc(x + 83, y + 24, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2b2622'; ctx.beginPath(); ctx.arc(x + 85, y + 23, 5.5, -Math.PI * .6, Math.PI * .5); ctx.fill();
  ctx.restore();
}
function drawLotMarkV188(ctx, x, y, w, h, freight) {
  // The relief lot shows the freight chosen at the briefing: a red cross (medical) or a battery bolt (energy).
  const s = Math.max(10, Math.min(w, h) * .42), cx = x + w / 2, cy = y + h * .55;
  ctx.save();
  if (freight === 'medical') {
    ctx.fillStyle = '#e9e4d8'; ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
    ctx.fillStyle = '#b8322c'; ctx.fillRect(cx - s * .12, cy - s * .38, s * .24, s * .76); ctx.fillRect(cx - s * .38, cy - s * .12, s * .76, s * .24);
  } else {
    ctx.fillStyle = '#1b1d1c'; ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
    ctx.fillStyle = '#e2b53a'; ctx.beginPath(); ctx.moveTo(cx + s * .08, cy - s * .42); ctx.lineTo(cx - s * .26, cy + s * .06); ctx.lineTo(cx - s * .02, cy + s * .06);
    ctx.lineTo(cx - s * .1, cy + s * .42); ctx.lineTo(cx + s * .26, cy - s * .08); ctx.lineTo(cx + s * .02, cy - s * .08); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function drawIsoContainerV188(ctx, x, y, w, h) {
  // 10 ft ISO container, long side: corrugated steel, corner posts and castings. Unmarked (no QZ17 stencil).
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 2, w * .55, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#34413f'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(0,0,0,.24)'; for (let rx = x + 10; rx < x + w - 10; rx += 9) ctx.fillRect(rx, y + 8, 3, h - 16);
  ctx.fillStyle = '#263130'; ctx.fillRect(x, y, w, 7); ctx.fillRect(x, y + h - 8, w, 8); ctx.fillRect(x, y, 7, h); ctx.fillRect(x + w - 7, y, 7, h);
  ctx.fillStyle = '#161c1b'; for (const [cx, cy] of [[x, y], [x + w - 7, y], [x, y + h - 8], [x + w - 7, y + h - 8]]) ctx.fillRect(cx + 1, cy + 1, 5, 6);
  ctx.fillStyle = 'rgba(190,210,215,.07)'; ctx.fillRect(x + 7, y + 7, w - 14, 5); // wet top edge
  ctx.fillStyle = 'rgba(0,0,0,.18)'; for (const sx of [x + 31, x + 77, x + 118]) ctx.fillRect(sx, y + 12, 2, h * .55); // rain streaks
  ctx.fillStyle = '#8b8f86'; ctx.fillRect(x + 16, y + 22, 24, 14); ctx.fillStyle = '#4c524c'; for (const ly of [26, 30]) ctx.fillRect(x + 19, y + ly, 18, 1);
  ctx.restore();
}
function drawDropshipSternV188(ctx, ship, time, still) {
  // UD-4L stern (project adaptation; the hangar drawing is 720 px ≈ 14 m, only its rear 1.6 m is in frame).
  ctx.save();
  ctx.fillStyle = '#262e2b'; ctx.beginPath(); ctx.moveTo(-40, ship.hullTop); ctx.lineTo(4, ship.finTop); ctx.lineTo(26, ship.finTop); ctx.lineTo(40, ship.hullTop); ctx.closePath(); ctx.fill(); // tail fin
  ctx.fillStyle = '#39433f'; ctx.beginPath(); ctx.moveTo(-240, ship.hullTop); ctx.lineTo(ship.sternX - 12, ship.hullTop); ctx.lineTo(ship.sternX, ship.hullTop + 22);
  ctx.lineTo(ship.sternX, ship.belly); ctx.lineTo(-240, ship.belly); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1; ctx.strokeRect(-20, ship.hullTop + 14, ship.sternX + 8, ship.belly - ship.hullTop - 26);
  ctx.fillStyle = 'rgba(190,210,215,.12)'; ctx.fillRect(-240, ship.hullTop, ship.sternX + 228, 3); // wet upper hull
  ctx.fillStyle = '#c9a54a'; ctx.fillRect(4, ship.hullTop + 40, 34, 4); ctx.fillStyle = '#20272a'; ctx.fillRect(8, ship.hullTop + 56, 22, 14); // hull stripe and hatch
  ctx.fillStyle = 'rgba(200,48,36,.5)'; ctx.fillRect(ship.sternX - 6, ship.hullTop + 26, 6, ship.belly - ship.hullTop - 30); // red hold light
  ctx.fillStyle = '#1b2120'; ctx.fillRect(12, ship.belly, 8, 618 - ship.belly); ctx.fillRect(-20, 618, 72, 6); // skid
  ctx.strokeStyle = '#8a9490'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ship.sternX - 8, ship.belly - 20); ctx.lineTo(ship.sternX + 30, ship.belly + 14); ctx.stroke(); // ramp actuator
  ctx.strokeStyle = '#3b4542'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ship.sternX - 2, ship.belly); ctx.lineTo(ship.rampTipX, 621); ctx.stroke(); // lowered ramp
  ctx.strokeStyle = '#c9a54a'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(ship.sternX, ship.belly - 4); ctx.lineTo(ship.rampTipX, 617); ctx.stroke(); ctx.setLineDash([]);
  const blink = still || Math.sin(time * 4) > 0;
  ctx.fillStyle = blink ? '#ff5a46' : '#5a1e18'; ctx.fillRect(ship.sternX - 14, ship.hullTop + 4, 4, 4); // nav light
  ctx.restore();
}
function drawFloodlightV188(ctx, light) {
  ctx.save();
  if (light.mast) { ctx.fillStyle = '#2f383a'; ctx.fillRect(light.x - 2, light.y, 4, 624 - light.y); ctx.fillRect(light.x - 9, light.y - 4, 18, 6); }
  const cone = ctx.createLinearGradient(0, light.y, 0, 624);
  cone.addColorStop(0, 'rgba(255,236,190,.2)'); cone.addColorStop(1, 'rgba(255,236,190,.04)');
  ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(light.x, light.y); ctx.lineTo(light.reach[1], 624); ctx.lineTo(light.reach[0], 624); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,236,190,.1)'; ctx.beginPath(); ctx.ellipse((light.reach[0] + light.reach[1]) / 2, 630, (light.reach[1] - light.reach[0]) / 2, 9, 0, 0, Math.PI * 2); ctx.fill();
  const halo = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 20);
  halo.addColorStop(0, 'rgba(255,244,214,.85)'); halo.addColorStop(1, 'rgba(255,244,214,0)');
  ctx.fillStyle = halo; ctx.fillRect(light.x - 20, light.y - 20, 40, 40);
  ctx.restore();
}
function drawAirlockV188(ctx, door, closed, time, still) {
  const gate = PORT_SCENE_V188.gate, doorY = 624 - gate.doorH, light = PORT_SCENE_V188.emergencyLight;
  ctx.save();
  // Bulkhead above the doorway (part of the gate collider in both states).
  ctx.fillStyle = '#1b2225'; ctx.fillRect(gate.x, gate.wallTop, gate.w, doorY - gate.wallTop);
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; ctx.strokeRect(gate.x + 6, gate.wallTop + 8, gate.w - 12, doorY - gate.wallTop - 26);
  ctx.fillStyle = '#11171a'; ctx.fillRect(gate.x + 10, gate.wallTop + 40, gate.w - 20, 2);
  ctx.fillStyle = '#2e383b'; ctx.fillRect(gate.x, gate.wallTop, 8, doorY - gate.wallTop); ctx.fillRect(gate.x + gate.w - 8, gate.wallTop, 8, doorY - gate.wallTop); // frame posts
  for (let i = 0; i < gate.w; i += 12) { ctx.fillStyle = (i / 12) % 2 ? '#1b1d1c' : '#c9a54a'; ctx.fillRect(gate.x + i, doorY - 10, 12, 10); } // hazard lintel
  if (ready(door)) {
    const src = resolveSpriteDrawableV134(door), w = door.naturalWidth, h = door.naturalHeight;
    if (closed) ctx.drawImage(src, gate.x, doorY, gate.w, gate.doorH);
    else { // the leaves are retracted: jambs and header only
      ctx.drawImage(src, 0, 0, w * .16, h, gate.x, doorY, 17, gate.doorH);
      ctx.drawImage(src, w * .84, 0, w * .16, h, gate.x + gate.w - 17, doorY, 17, gate.doorH);
      ctx.drawImage(src, 0, 0, w, h * .12, gate.x, doorY, gate.w, 16);
    }
  }
  ctx.fillStyle = closed ? '#d7a060' : '#87e6be'; ctx.fillRect(gate.x + 8, doorY - 18, gate.w - 16, 5); // door status strip
  // Emergency beacon on the bulkhead: amber and turning while closed, steady green once the relay is restored.
  const pulse = still ? .5 : .5 + .5 * Math.sin(time * 5), rgb = closed ? '232,150,60' : '120,230,180';
  const glow = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 130);
  glow.addColorStop(0, `rgba(${rgb},${closed ? (.22 + .26 * pulse).toFixed(3) : '.3'})`); glow.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = glow; ctx.fillRect(light.x - 130, light.y - 130, 260, 260);
  ctx.fillStyle = '#20282a'; ctx.fillRect(light.x - 7, light.y - 4, 14, 8);
  ctx.fillStyle = `rgb(${rgb})`; ctx.fillRect(light.x - 5, light.y - 9, 10, 6);
  if (!closed) { // the lit airlock the residents are guided to
    const spill = ctx.createRadialGradient(gate.x + gate.w / 2, 640, 0, gate.x + gate.w / 2, 640, 90);
    spill.addColorStop(0, 'rgba(120,230,180,.16)'); spill.addColorStop(1, 'rgba(120,230,180,0)');
    ctx.fillStyle = spill; ctx.fillRect(gate.x - 40, 560, gate.w + 80, 144);
  }
  ctx.restore();
}
function drawRelayConduitV188(ctx, powered) {
  // The relay console on the catwalk feeds the airlock: one conduit along the catwalk and up the bulkhead.
  const relay = PORT_SCENE_V188.relayConsole, gate = PORT_SCENE_V188.gate, points = [[relay.x + relay.w, 428], [1688, 428], [1760, 388], [gate.x, 388]];
  ctx.save(); ctx.strokeStyle = '#2c3537'; ctx.lineWidth = 5; ctx.beginPath(); points.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
  ctx.fillStyle = powered ? '#87e6be' : '#d7a060'; for (let px = relay.x + relay.w + 12; px < 1688; px += 40) ctx.fillRect(px, 426, 4, 3);
  ctx.restore();
}

/** A dedicated ground location, sharing the proven hub locomotion and player renderer only. */
export function withPortMeridienV90(Base) {
  return class PortMeridienHubV90 extends Base {
    start(state = {}, options = {}) {
      this.portActiveV90 = false;
      this.portStartingV90 = true;
      this.portStateV90 = normalizePortMeridienV90(options.portMeridienV90);
      this.portTaskV90 = null; this.portPersistClockV90 = 0; this.portCommitBlockedV90 = false;
      try { super.start(state, options); } finally { this.portStartingV90 = false; }
      this.portActiveV90 = Boolean(!options.editorProject && options.openingV88?.phase === 'ready'
        && options.onboardingV84?.phase === 'complete' && this.portStateV90 && this.portStateV90.phase !== 'pending');
      if (!this.portActiveV90) return;
      this.portImagesV90 ||= new Map();
      if (isArmoryArtAdmittedV171('colony') && !this.portArmoryImageV169 && typeof Image === 'function') {
        this.portArmoryImageV169 = new Image();
        this.portArmoryImageV169.decoding = 'async';
        this.portArmoryImageV169.src = ARMORY_STOREFRONT_SOURCE_V169.colony;
      }
      for (const [key, path] of Object.entries(PORT_ASSETS_V90)) if (!this.portImagesV90.has(key)) {
        const image = new Image(); image.decoding = 'async'; image.src = path; this.portImagesV90.set(key, image);
      }
      const pose = PhysicalHub.prototype.restoreAnnexPlayerPoseV71.call(this, this.currentAnnexV71(), {
        annexPositionX: this.portStateV90.x, annexPositionY: this.portStateV90.y, annexClimbing: this.portStateV90.climbing
      });
      Object.assign(this.player, pose, { facing: this.portStateV90.facing, vx: 0, vy: 0 });
      this.annexCameraV71.x = Math.max(0, Math.min(1280, this.player.x - 640));
      this.keys.clear(); this.jumpQueued = 0; this.statusKey = ''; this.emitStatus(); this.draw();
    }
    isPortMeridienV90() { return this.portActiveV90 === true; }
    isAnnexActiveV71() { return this.isPortMeridienV90() || super.isAnnexActiveV71(); }
    currentAnnexV71() { return this.isPortMeridienV90() ? portGeometryV90(this.portStateV90) : super.currentAnnexV71(); }
    currentRoom() { return this.isPortMeridienV90() ? { id: 'port-meridien-quay', name: 'Le quai des vivants' } : super.currentRoom(); }
    portContactV90() { return this.isPortMeridienV90() && portPhysicalContactV90(this.portStateV90, this.player); }
    portArmoryShopContactV169() {
      if (!isArmoryArtAdmittedV171('colony')
        || !isArmoryStorefrontImageReadyV172(this.portArmoryImageV169)
        || !this.isPortMeridienV90()
        || !this.running || this.paused || this.portCommitBlockedV90
        || this.portTaskV90 || this.portContactV90() || this.portStateV90?.phase !== 'complete'
        || !this.player?.grounded || this.player.inVehicle) return null;
      return getArmoryStoreContactV169({
        roomId: 'port-meridien-quay', x: this.player.x + this.player.w / 2,
        y: this.player.y + this.player.h, alive: this.player.alive && !this.player.downed,
        missionPhase: this.portStateV90.phase
      });
    }
    nearestInteraction() {
      if (!this.isPortMeridienV90()) return super.nearestInteraction();
      return this.portContactV90() ? { action: `port:${this.portStateV90.phase}`, description: PORT_POSTS_V90[this.portStateV90.phase].label } : null;
    }
    setPortMeridienV90(state) {
      this.portStateV90 = normalizePortMeridienV90(state);
      this.portTaskV90 = null; this.portCommitBlockedV90 = false;
      this.statusKey = ''; this.emitStatus(); this.draw();
    }
    capturePortMeridienV90() {
      return normalizePortMeridienV90({ ...this.portStateV90, x: this.player.x, y: this.player.y,
        facing: this.player.facing, climbing: this.player.climbing });
    }
    submitPortV90(action) {
      return this.onAction({ action: `port:${action}`, revision: this.portStateV90.revision }) === true;
    }
    persist() {
      if (this.portStartingV90) return;
      if (!this.isPortMeridienV90()) return super.persist();
      return this.submitPortV90('checkpoint');
    }
    interact() {
      if (!this.isPortMeridienV90()) return super.interact();
      if (!this.running || !this.player.alive) return false;
      if (this.portCommitBlockedV90) {
        if (!this.submitPortV90('checkpoint')) return false;
        this.portCommitBlockedV90 = false;
      }
      const armoryShop = this.portArmoryShopContactV169();
      if (armoryShop) { this.onAction?.(armoryShop); return true; }
      if (this.portStateV90.phase === 'escort' && this.portStateV90.following) {
        if (this.portStateV90.civiliansX.every((x, i) => x >= PORT_CIVILIANS_SAFE_V188[i])) return this.submitPortV90('escort');
        return false;
      }
      if (!this.portContactV90()) return false;
      if (['triage', 'power'].includes(this.portStateV90.phase)) {
        this.portTaskV90 ||= { x: this.player.x, y: this.player.y, elapsed: 0, complete: false };
        return true;
      }
      return this.submitPortV90(this.portStateV90.phase);
    }
    setControl(control, active) {
      if (this.isPortMeridienV90() && ['fire', 'reload', 'aim', 'depth'].includes(control)) return;
      return super.setControl(control, active);
    }
    fire() { return this.isPortMeridienV90() ? false : super.fire(); }
    useLift(direction, wrap = false) { return this.isPortMeridienV90() ? false : super.useLift(direction, wrap); }
    update(delta) {
      if (!this.isPortMeridienV90()) return super.update(delta);
      if (!this.running || this.portCommitBlockedV90) return;
      const elapsed = Math.max(0, Math.min(.1, Number(delta) || 0));
      PhysicalHub.prototype.updateAnnexPhysicsV71.call(this, elapsed);
      const state = this.portStateV90;
      const task = this.portTaskV90;
      if (task && !task.complete) {
        if (!this.portContactV90() || Math.abs(this.player.x - task.x) > 5 || Math.abs(this.player.y - task.y) > 5
          || ['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight', 'Space'].some(key => this.keys.has(key))) this.portTaskV90 = null;
        else {
          task.elapsed = Math.min(portTaskSecondsV90(state), task.elapsed + elapsed);
          this.player.interactionClock = .2;
          if (task.elapsed >= portTaskSecondsV90(state)) { task.complete = true; if (!this.submitPortV90(state.phase)) this.portTaskV90 = null; }
        }
      }
      if (state.phase === 'escort' && state.following) {
        // A civilian advances only within sight of the grounded player. They never teleport to the exit.
        // In file: each resident keeps its own gap behind the marine (no stacking).
        state.civiliansX = state.civiliansX.map((x, i) => stepPortCivilianV188(x, i, this.player.x, this.player.grounded, elapsed));
        if (state.civiliansX.every((x, i) => x >= PORT_CIVILIANS_SAFE_V188[i])) this.submitPortV90('escort');
      }
      this.portPersistClockV90 += elapsed;
      if (this.portPersistClockV90 >= 1) {
        this.portPersistClockV90 = 0;
        if (!this.submitPortV90('checkpoint')) this.portCommitBlockedV90 = true;
      }
      this.emitStatus();
    }
    statusPrompt() {
      if (!this.isPortMeridienV90()) return super.statusPrompt();
      if (this.portCommitBlockedV90) return 'SAUVEGARDE BLOQUÉE · E pour réessayer sans perdre le groupe';
      if (this.portTaskV90) return `IMMOBILE · ${Math.floor(this.portTaskV90.elapsed / portTaskSecondsV90(this.portStateV90) * 100)} % · bouger annule`;
      const armoryShop = this.portArmoryShopContactV169();
      if (armoryShop) return armoryShop.prompt;
      const contact = this.nearestInteraction();
      return contact ? `E · ${contact.description}` : 'A/D marcher · W/S échelle · ESPACE franchir · E utiliser';
    }
    emitStatus() {
      if (!this.isPortMeridienV90()) return super.emitStatus();
      if (!this.player) return;
      this.onStatus({ deck: this.state.deck, deckName: 'PORT-MÉRIDIEN · SOL', roomId: 'port-meridien-quay',
        roomName: 'Le quai des vivants', health: this.player.health, threats: 0, prompt: this.statusPrompt(),
        route: { source: 'QUAI CIVIL', nodeCount: 1 }, portMeridienV90: this.capturePortMeridienV90() });
    }
    getSnapshot() {
      if (!this.isPortMeridienV90()) return super.getSnapshot();
      return { running: this.running, x: this.player.x, y: this.player.y, health: this.player.health,
        playerAppearanceV126: hubPlayerAppearanceSnapshotV126(this),
        roomId: 'port-meridien-quay', prompt: this.statusPrompt(), portMeridienV90: this.capturePortMeridienV90(),
        portAssetsReadyV90: [...(this.portImagesV90?.values() || [])].filter(ready).length };
    }
    draw() {
      if (!this.isPortMeridienV90()) return super.draw();
      if (!this.ctx || !this.player) return;
      const ctx = this.ctx, state = this.portStateV90, camera = this.annexCameraV71.x;
      const bitmap = (key, x, y, w, h) => { const image = this.portImagesV90?.get(key); if (ready(image)) ctx.drawImage(resolveSpriteDrawableV134(image), x, y, w, h); };
      ctx.save(); ctx.clearRect(0, 0, 1280, 720); ctx.fillStyle = '#071015'; ctx.fillRect(0, 0, 1280, 720);
      for (let x = -camera * .2; x < 1280; x += 1536) bitmap('far', x, 0, 1536, 720);
      ctx.save(); ctx.translate(-camera, 0);
      // Distant industrial structures are scenery, not additional traversable platforms.
      ctx.globalAlpha = .3;
      for (let x = 0; x < 2560; x += 1280) bitmap('mid', x, 0, 1280, 624);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(2,9,12,.35)'; ctx.fillRect(0, 0, 2560, 624);
      const floor = this.portImagesV90?.get('floor');
      if (ready(floor)) for (let x = 0; x < 2560; x += 240) ctx.drawImage(floor, 4, 4, floor.naturalWidth - 4, 74, x, 624, 240, 96);
      const catwalk = this.portImagesV90?.get('catwalk');
      if (ready(catwalk)) ctx.drawImage(catwalk, 40, 43, 188, 27, 1180, 432, 500, 24);
      const ladder = this.portImagesV90?.get('ladder');
      if (ready(ladder)) {
        // Reuse the approved V82 independent metal regions; the source's white openings are not ladder art.
        ctx.drawImage(ladder, 53, 4, 9, 168, 1210, 432, 6, 192);
        ctx.drawImage(ladder, 100, 4, 9, 168, 1248, 432, 6, 192);
        for (let y = 439; y < 624; y += 24) ctx.drawImage(ladder, 62, 36, 38, 4, 1216, y, 32, 4);
      }
      // V188 depth floor (specs/001-salles-hybrides-2d-25d): darker near the wall, lane marks towards the camera.
      const shade = ctx.createLinearGradient(0, 624, 0, 704);
      shade.addColorStop(0, 'rgba(0,0,0,.22)'); shade.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = shade; ctx.fillRect(0, 624, 2560, 80);
      ctx.fillStyle = 'rgba(214,176,92,.2)'; for (const lane of [644, 664, 684]) for (let x = 24; x < 2536; x += 64) ctx.fillRect(x, lane, 34, 2);
      const scene = PORT_SCENE_V188, time = this.animationTime || 0, still = Boolean(this.reducedMotion);
      const lot = (box, x = box.x, y = box.y) => { bitmap('crate', x, y, box.w, box.h); drawLotMarkV188(ctx, x, y, box.w, box.h, state.freight); };
      // West: the UD-4L that brought Echo-9, ramp down under its floodlights (CIN-03, beat-port-arrival).
      drawDropshipSternV188(ctx, scene.dropship, time, still);
      for (const light of scene.floodlights) drawFloodlightV188(ctx, light);
      if (state.phase === 'unload') lot(scene.unloadLot);
      bitmap('medical', scene.bed.x, scene.bed.y, scene.bed.w, scene.bed.h);
      drawPatientV188(ctx, scene.bed, time, still);
      if (!['unload', 'carry'].includes(state.phase)) lot(scene.deliveredLot);
      bitmap('console', scene.relayConsole.x, scene.relayConsole.y, scene.relayConsole.w, scene.relayConsole.h);
      drawRelayConduitV188(ctx, !gateClosed(state));
      // East: the airlock to the "normal" sector. Its collider stays full height; the door itself is 2.6 m.
      drawAirlockV188(ctx, this.portImagesV90?.get('door'), gateClosed(state), time, still);
      if (gateClosed(state)) { // the closed airlock bars the whole quay, front to wall
        ctx.fillStyle = '#1a1f22'; ctx.fillRect(1818, 624, 92, 80);
        ctx.fillStyle = '#d7a060'; for (let y = 632; y < 704; y += 16) ctx.fillRect(1818, y, 92, 6);
      } else { // retracted barrier: only its floor guides remain across the quay
        ctx.fillStyle = 'rgba(10,14,16,.7)'; ctx.fillRect(1818, 624, 4, 80); ctx.fillRect(1906, 624, 4, 80);
      }
      // Colony supplier is visual-only, beyond the existing real mission gate.
      // No replacement of the actual report terminal, actors or colliders.
      const shopPlan = getArmoryStorefrontPlanV169('port-meridien-quay');
      if (shopPlan) {
        drawArmoryStorefrontV169(ctx, this.portArmoryImageV169, shopPlan, { phase: 'back' });
        drawArmoryStorefrontV169(ctx, this.portArmoryImageV169, shopPlan, { phase: 'front' });
      }
      bitmap('console', scene.reportConsole.x, scene.reportConsole.y, scene.reportConsole.w, scene.reportConsole.h); // never under the storefront
      // Depth-ordered pass: floor objects, the quay people, the three civilians and the marine, far (wall) first.
      const civilians = this.portImagesV90?.get('civilians'), civiliansZ = this.portCiviliansZV188 || [-6, -10, -14];
      const items = PORT_DEPTH_ROOM_V188.props.map(prop => {
        const box = { x: prop.x, y: 624 + depthToScreenOffsetV188(prop.z) - prop.h, w: prop.w, h: prop.h };
        return { z: prop.z, draw: () => prop.kind === 'rail-crate'
          ? [0, 1].forEach(i => { bitmap('crate', prop.x + i * 50, 574, 50, 46); ctx.fillStyle = '#2b2419'; ctx.fillRect(prop.x, 620, prop.w, 4); })
          : prop.kind === 'iso-container' ? drawIsoContainerV188(ctx, box.x, box.y, box.w, box.h) : drawDepthPropV188(ctx, prop, box) };
      });
      for (const person of scene.people) items.push({ z: person.z, draw: () => drawPersonV188(ctx, person, 624 + depthToScreenOffsetV188(person.z)) });
      if (ready(civilians)) state.civiliansX.forEach((x, row) => items.push({ z: civiliansZ[row] ?? 0, draw: () => {
        const column = row === 0 && ['unload', 'carry', 'triage'].includes(state.phase) ? 2
          : state.following && portCivilianWalkingV188(x, row, this.player.x, this.player.grounded) ? 1 : 0;
        this.drawSheetCell(ctx, civilians, column, row, x - 55, 515 + depthToScreenOffsetV188(civiliansZ[row] ?? 0), 116, 116, false, 4, 3);
      } }));
      items.push({ z: Number(this.player.depthZ) || 0, draw: () => {
        const offset = depthToScreenOffsetV188(this.player.depthZ); this.player.y += offset;
        try {
          PlayerRenderer.prototype.drawPlayer.call(this, ctx);
          if (state.phase === 'carry') lot(scene.carriedLot, this.player.x + (this.player.facing > 0 ? 22 : -18), this.player.y + 34);
        } finally { this.player.y -= offset; }
      } });
      for (const item of items.sort((a, b) => b.z - a.z)) item.draw();
      const label = (text, x, y, color = '#aac6c5') => { ctx.fillStyle = '#071015'; ctx.fillRect(x - 8, y - 17, ctx.measureText(text).width + 16, 24); ctx.fillStyle = color; ctx.fillText(text, x, y); };
      ctx.font = '700 12px ui-monospace, monospace';
      for (const sign of scene.signs) label(portSignTextV188(sign), sign.x, sign.y, sign.color);
      const target = PORT_POSTS_V90[state.phase];
      if (target && !(state.phase === 'escort' && state.following)) {
        ctx.strokeStyle = '#f3d995'; ctx.lineWidth = 2; ctx.strokeRect(target.x - 44, target.y - 114, 88, 116);
      }
      ctx.restore();
      // Light rain over the open quay (as in CIN-03); still under reduced motion.
      ctx.strokeStyle = 'rgba(170,200,215,.22)'; ctx.lineWidth = 1; const fall = this.reducedMotion ? 0 : (this.animationTime || 0) * 620;
      for (let i = 0; i < 90; i++) { const rx = (i * 97 + camera * .6) % 1280, ry = ((i * 53) + fall + i * 17) % 760 - 40;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 5, ry + 22); ctx.stroke(); }
      ctx.fillStyle = 'rgba(2,9,12,.94)'; ctx.fillRect(18, 18, 1244, 89);
      ctx.font = '700 18px ui-monospace, monospace'; ctx.fillStyle = '#dce9dd'; ctx.fillText('PORT-MÉRIDIEN // LE QUAI DES VIVANTS', 34, 45);
      ctx.font = '600 13px ui-monospace, monospace'; ctx.fillStyle = '#edcf92';
      const objective = getPortMeridienObjectiveV90(state, { phase: 'ready' }, { phase: 'complete' }).text;
      const words = objective.split(' '); let line = '', y = 69;
      for (const word of words) { if (ctx.measureText(`${line} ${word}`).width > 1190) { ctx.fillText(line, 34, y); line = word; y += 19; } else line += `${line ? ' ' : ''}${word}`; }
      ctx.fillText(line, 34, y);
      // The prompt plate rises to the top while the marine walks the front lane it would cover.
      const feet = this.player.y + this.player.h + depthToScreenOffsetV188(this.player.depthZ);
      ctx.save(); if (feet >= 650) ctx.translate(0, 126 - 662);
      PhysicalHub.prototype.drawSinglePromptV71.call(this, ctx, this.statusPrompt());
      ctx.restore();
      ctx.restore();
    }
  };
}
