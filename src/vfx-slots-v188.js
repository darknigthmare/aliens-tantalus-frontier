// V188 — named art slots for the mission visual effects (fire, impacts, acid,
// explosions, weather and alarms). Image generation is deferred (owner decision
// 2026-11-15): every effect is drawn with Canvas primitives as a PLACEHOLDER and
// routed through one of these slots. When an image is later produced for a slot,
// commit it at the slot's path AND add the slot id to VFX_SLOT_FILES_PRESENT_V188:
// only listed slots are ever requested, so the game never asks the network for a
// file that is not in the repository. Sizes follow the project scale (1 m ≈ 51 px,
// marine 44×92). Briefs name documented Aliens (1986) looks where one exists; a
// generated image would not certify any franchise fidelity (docs/development/VFX_V188.md).
// Shape cues are part of each fallback (star, streak, diamond, round drop, ring),
// so the effects stay distinct in the colour-blind modes.

export const VFX_SLOT_ROOT_V188 = '/assets/vfx/v188/';
export const VFX_SLOT_LAYERS_V188 = Object.freeze(['decal', 'world-fx', 'overlay']);

const slot = (id, layer, width, height, purpose, brief) => Object.freeze({
  id, purpose, width, height, layer, brief, path: `${VFX_SLOT_ROOT_V188}${id}.png`
});

export const VFX_SLOTS_V188 = Object.freeze([
  slot('muzzle-star', 'world-fx', 34, 22, 'Rifle / SMG / sentry muzzle flash, two frames per accepted shot.',
    'Four-pronged star-shaped muzzle flash as seen on the M41A pulse rifle in Aliens (1986): bright white-yellow core, long forward prong, short side prongs; additive on black; side view, muzzle at the left edge.'),
  slot('muzzle-flame', 'world-fx', 60, 26, 'Flamethrower / incinerator tongue at the nozzle.',
    'Short rolling tongue of orange-yellow flame leaving a nozzle, darker red edges and soot at the tip, side view; transparent background.'),
  slot('muzzle-arc', 'world-fx', 20, 20, 'Electric or energy weapon discharge at the emitter.',
    'Small branching blue-white electric arc burst, additive on black.'),
  slot('muzzle-smoke', 'world-fx', 24, 24, 'Thin smoke wisp left at the muzzle after a string of shots.',
    'Thin grey-blue gun smoke wisp, soft, semi-transparent; transparent background.'),
  slot('impact-spark', 'world-fx', 20, 20, 'Bullet hitting metal: short spark streaks and a white pinpoint.',
    'Hot yellow-white sparks spraying from a ricochet point on steel plating, additive streaks; transparent background.'),
  slot('impact-acid', 'world-fx', 24, 24, 'Xenomorph hit: yellow-green acid blood droplets.',
    'Droplets of glowing yellow-green acid blood spraying from a wound, as the xenomorph acid blood of Alien (1979) and Aliens (1986); transparent background.'),
  slot('impact-blood', 'world-fx', 16, 16, 'Organic hit: dark red droplets.',
    'Small dark red blood droplets, round, side view; transparent background.'),
  slot('impact-synthetic', 'world-fx', 16, 16, 'Synthetic hit: milky white fluid droplets.',
    'Milky white synthetic fluid droplets, as the android fluid of Alien (1979) and Aliens (1986); transparent background.'),
  slot('acid-burn', 'decal', 48, 12, 'Floor burn left where acid blood lands; smokes, then cools and fades.',
    'Top-down-ish strip of deck plate eaten through by acid: blackened pitted hole with a yellow-green bubbling rim, as acid blood burning through deck plates in Alien (1979) and Aliens (1986); transparent background.'),
  slot('acid-smoke', 'world-fx', 22, 22, 'Acrid smoke rising from an acid burn.',
    'Pale yellow-grey acrid smoke puff, soft; transparent background.'),
  slot('explosion-fireball', 'world-fx', 120, 120, 'Grenade / explosive / incinerator gel impact fireball.',
    'Compact orange fireball with a white core and dark smoke edges, side view; transparent background.'),
  slot('explosion-smoke', 'world-fx', 64, 64, 'Dark smoke left after an explosion.',
    'Rolling dark grey smoke cloud, soft edges; transparent background.'),
  slot('debris-chunk', 'world-fx', 6, 6, 'Small chunk of plating or rock thrown by an explosion.',
    'Tiny dark metal fragment, a few pixels; transparent background.'),
  slot('ember', 'world-fx', 4, 4, 'Ember rising from fire.', 'Single orange glowing ember, additive.'),
  slot('panel-spark', 'world-fx', 12, 12, 'Sparks falling from a damaged wall panel.',
    'Small shower of yellow sparks dropping from a broken electrical panel; transparent background.'),
  slot('steam-puff', 'world-fx', 32, 32, 'Steam venting from a duct grille.',
    'White steam puff, soft and semi-transparent; transparent background.'),
  slot('footstep-dust', 'world-fx', 20, 10, 'Dust kicked by a boot on concrete, dirt or a storm-swept plateau.',
    'Low brownish dust puff at ground level, side view; transparent background.'),
  slot('footstep-splash', 'world-fx', 20, 12, 'Splash of a boot in water or slime.',
    'Small water splash crown at ground level, side view; transparent background.'),
  slot('tracker-ping', 'world-fx', 160, 160, 'World ring of the motion-tracker pulse leaving the operator.',
    'Thin expanding ring in pale cyan-green, echoing the M314 motion tracker display of Aliens (1986); additive, transparent background.'),
  slot('damage-vignette', 'overlay', 1280, 720, 'Screen edge tint when the marine is hurt.',
    'Dark red vignette around the screen edges, transparent centre; no text.'),
  slot('alarm-strobe', 'overlay', 1280, 720, 'Rotating amber emergency beacon sweep at peak tension.',
    'Amber rotating-beacon light sweep across the top edge of the screen, soft; transparent centre; no text.')
]);
export const VFX_SLOT_IDS_V188 = Object.freeze(VFX_SLOTS_V188.map(entry => entry.id));
// Slots whose PNG is committed under VFX_SLOT_ROOT_V188. Empty until the art is produced.
export const VFX_SLOT_FILES_PRESENT_V188 = Object.freeze([]);

export function getVfxSlotV188(id) { return VFX_SLOTS_V188.find(entry => entry.id === id) || null; }

const images = new Map();
export function vfxSlotImageV188(id, { present = VFX_SLOT_FILES_PRESENT_V188, ImageCtor = globalThis.Image } = {}) {
  if (!present.includes(id) || !ImageCtor) return null;
  let image = images.get(id);
  if (!image) { image = new ImageCtor(); image.src = getVfxSlotV188(id).path; images.set(id, image); }
  return image.complete && image.naturalWidth > 0 ? image : null;
}

const TAU = Math.PI * 2;
// Primitive fallbacks. Each draws one effect instance centred on (0, 0) after the caller
// translated (and rotated for oriented effects); `t` is the normalised age 0 → 1, `s` the size.
export const VFX_FALLBACKS_V188 = Object.freeze({
  'muzzle-star'(ctx, t, s) {
    const k = 1 - t * .5;
    ctx.fillStyle = '#fff4c9'; ctx.beginPath();
    ctx.moveTo(-2, 0); ctx.lineTo(s * .22, -s * .1); ctx.lineTo(s * 1.05 * k, 0); ctx.lineTo(s * .22, s * .1); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * .16, 0); ctx.lineTo(s * .26, -s * .48 * k); ctx.lineTo(s * .36, 0); ctx.lineTo(s * .26, s * .48 * k); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.arc(s * .14, 0, s * .16, 0, TAU); ctx.fill();
  },
  'muzzle-flame'(ctx, t, s) {
    ctx.fillStyle = '#ff9a2e'; ctx.beginPath(); ctx.moveTo(0, -s * .12); ctx.quadraticCurveTo(s * .6, -s * .34, s * (1 - t * .3), 0);
    ctx.quadraticCurveTo(s * .6, s * .34, 0, s * .12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe28a'; ctx.beginPath(); ctx.ellipse(s * .22, 0, s * .22, s * .08, 0, 0, TAU); ctx.fill();
  },
  'muzzle-arc'(ctx, t, s) {
    ctx.strokeStyle = '#bfe8ff'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + t * 3; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * s * .3, Math.sin(a) * s * .3 + 2); ctx.lineTo(Math.cos(a) * s * .5, Math.sin(a) * s * .5); }
    ctx.stroke();
  },
  'muzzle-smoke'(ctx, t, s) { ctx.fillStyle = '#9aa6ad'; ctx.beginPath(); ctx.arc(0, 0, s * (.3 + t * .7), 0, TAU); ctx.fill(); },
  'impact-spark'(ctx, t, s) { ctx.strokeStyle = t < .35 ? '#fff6d0' : '#ffc14d'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s, 0); ctx.stroke(); },
  'impact-acid'(ctx, t, s) { ctx.fillStyle = '#c4e04a'; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * .7, 0); ctx.lineTo(0, s); ctx.lineTo(-s * .7, 0); ctx.closePath(); ctx.fill(); },
  'impact-blood'(ctx, t, s) { ctx.fillStyle = '#7d1a16'; ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill(); },
  'impact-synthetic'(ctx, t, s) { ctx.fillStyle = '#ece8da'; ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8b8a80'; ctx.lineWidth = .8; ctx.stroke(); },
  'acid-burn'(ctx, t, s, p) {
    const w = s, glow = Math.max(0, 1 - t * 2.2);
    ctx.fillStyle = '#121310'; ctx.beginPath(); ctx.ellipse(0, 0, w / 2, 3.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a2a1c'; ctx.beginPath(); ctx.ellipse(0, -1, w / 2 + 3, 2, 0, Math.PI, TAU); ctx.fill();
    if (glow > 0) {
      ctx.strokeStyle = `rgba(196,224,74,${(.85 * glow).toFixed(3)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, w / 2, 3.2, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = `rgba(214,240,96,${(.9 * glow).toFixed(3)})`;
      for (let i = 0; i < 3; i++) { const bx = ((p?.seed || 0) * 7 + i * 11) % w - w / 2; ctx.beginPath(); ctx.arc(bx, -1, 1.2 + (i % 2), 0, TAU); ctx.fill(); }
    }
  },
  'acid-smoke'(ctx, t, s) { ctx.fillStyle = '#c9cba0'; ctx.beginPath(); ctx.arc(0, 0, s * (.35 + t * .65), 0, TAU); ctx.fill(); },
  'explosion-fireball'(ctx, t, s) {
    const r = s * (.35 + t * .65);
    const g = ctx.createRadialGradient ? ctx.createRadialGradient(0, 0, 0, 0, 0, r) : null;
    if (g) { g.addColorStop(0, '#fff3c4'); g.addColorStop(.35, '#ffad3b'); g.addColorStop(.75, '#c4421c'); g.addColorStop(1, 'rgba(60,20,10,0)'); ctx.fillStyle = g; }
    else ctx.fillStyle = '#ff9a2e';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  },
  'explosion-smoke'(ctx, t, s) { ctx.fillStyle = '#2b2b2b'; ctx.beginPath(); ctx.arc(0, 0, s * (.4 + t * .6), 0, TAU); ctx.fill(); },
  'debris-chunk'(ctx, t, s) { ctx.fillStyle = '#3a3d3c'; ctx.fillRect(-s / 2, -s / 2, s, s); },
  ember(ctx, t, s) { ctx.fillStyle = t < .5 ? '#ffd27a' : '#ff7a2a'; ctx.fillRect(-s / 2, -s / 2, s, s); },
  'panel-spark'(ctx, t, s) { ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s * .5, -s); ctx.stroke(); },
  'steam-puff'(ctx, t, s) { ctx.fillStyle = '#dfe6e8'; ctx.beginPath(); ctx.arc(0, 0, s * (.35 + t * .65), 0, TAU); ctx.fill(); },
  'footstep-dust'(ctx, t, s) { ctx.fillStyle = '#8a7a62'; ctx.beginPath(); ctx.ellipse(0, 0, s * (.4 + t * .6), s * (.2 + t * .25), 0, 0, TAU); ctx.fill(); },
  'footstep-splash'(ctx, t, s) {
    ctx.strokeStyle = '#a9c4cc'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (const d of [-1, -.4, .4, 1]) { ctx.moveTo(d * 3, 0); ctx.lineTo(d * s * (.3 + t * .4), -s * (.6 - t * .4)); }
    ctx.stroke();
  },
  'tracker-ping'(ctx, t, s) { ctx.strokeStyle = '#8fe3c2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, Math.max(1, s * t), 0, TAU); ctx.stroke(); },
  'damage-vignette'(ctx, t, s, p) {
    const { width = 1280, height = 720 } = p || {};
    const edge = 46 + 30 * s;
    ctx.fillStyle = '#9b1410';
    ctx.fillRect(0, 0, width, edge * .45); ctx.fillRect(0, height - edge * .45, width, edge * .45);
    ctx.fillRect(0, 0, edge * .6, height); ctx.fillRect(width - edge * .6, 0, edge * .6, height);
  },
  'alarm-strobe'(ctx, t, s, p) {
    const { width = 1280 } = p || {}, x = (t % 1) * (width + 400) - 200;
    const g = ctx.createLinearGradient ? ctx.createLinearGradient(x - 200, 0, x + 200, 0) : null;
    if (g) { g.addColorStop(0, 'rgba(255,150,30,0)'); g.addColorStop(.5, 'rgba(255,150,30,1)'); g.addColorStop(1, 'rgba(255,150,30,0)'); ctx.fillStyle = g; }
    else ctx.fillStyle = '#ff961e';
    ctx.fillRect(Math.max(0, x - 200), 0, 400, 10 + s * 18);
  }
});

/** Draws one effect instance at the current transform: the committed image when there is one, the primitive fallback otherwise. */
export function drawVfxSlotV188(ctx, id, t, size, extra, options) {
  const fallback = VFX_FALLBACKS_V188[id];
  if (!fallback) throw new Error(`Unknown VFX slot: ${id}`);
  const present = options?.present ?? VFX_SLOT_FILES_PRESENT_V188;
  const image = present.length ? vfxSlotImageV188(id, { ...options, present }) : null;
  if (image) { const slotInfo = getVfxSlotV188(id), k = size / Math.max(1, slotInfo.width); ctx.drawImage(image, -slotInfo.width * k / 2, -slotInfo.height * k / 2, slotInfo.width * k, slotInfo.height * k); return 'image'; }
  fallback(ctx, t, size, extra); return 'primitive';
}
