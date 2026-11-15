// V188 — PLACEHOLDER portraits for the three Port-Méridien residents who had
// only initials (owner decisions Q78 / Q79, bible §2.3 and §56.12).
//
// These are project adaptations drawn with Canvas 2D primitives. They are NOT
// franchise-accurate likenesses and no generated image is used. Each one carries
// a distinctive sign that reads by SHAPE first, colour second, so it survives
// the colour-blind modes and small frames (80 px in the cinematic lower third):
//   - Tomas Wren, chef de quai: high-visibility vest — two horizontal
//     retro-reflective bands plus two shoulder braces (an "H" over the chest).
//   - Lucia Ferro, médecin: armband on her right upper arm with a cross.
//   - Adèle Sarrazin, doyenne élue: an elder's scarf wrapped at the neck, two
//     striped tails with a fringe.
// Documented vs [PROPOSÉ] choices are recorded in the bible next to §2.3.
//
// Framing matches the reviewed crew crops (npc-dialogue-portraits-v168.js):
// head-and-shoulders, transparent background (the frame owns its backdrop),
// key light from the upper right, a faint cool rim on the left as in the
// cinematic silhouettes. Fills only (no strokes), so no outline artefact; every
// coordinate is computed in a unit square mapped to the frame and stays inside.

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const normalizeName = name => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/gu, '')
  .toUpperCase().replace(/[^A-Z]+/gu, ' ').trim();

/** Placeholder profiles. `palette` is the default; `safe` overrides sign
 * colours when a colour-blind mode is on (the shape never changes). */
export const PLACEHOLDER_PORTRAITS_V188 = freeze([
  { id: 'placeholder-tomas-wren', name: 'TOMAS WREN', role: 'chef de quai', sign: 'hi-vis-vest', placeholder: true,
    // [PROPOSÉ] ~45 years, short greying hair, stubble, charcoal work jacket.
    palette: { skin: '#b98a6a', skinLit: '#d2a382', skinShade: '#7e5a44', hair: '#4a4038', hairLit: '#6d6156',
      garment: '#2b3236', garmentShade: '#1a1f22', collar: '#384147',
      sign: '#c95f24', signShade: '#94441a', mark: '#eef0e8' },
    safe: { sign: '#d55e00', signShade: '#8f3f00', mark: '#f4f4ee' } },
  { id: 'placeholder-lucia-ferro', name: 'LUCIA FERRO', role: 'médecin de la colonie', sign: 'cross-armband', placeholder: true,
    // [PROPOSÉ] ~38 years, dark hair tied back, olive field jacket over pale scrubs.
    palette: { skin: '#b07c58', skinLit: '#c99572', skinShade: '#76503a', hair: '#1f1814', hairLit: '#3a2e26',
      garment: '#3e4a3c', garmentShade: '#262e25', collar: '#c9d3cd',
      sign: '#e6e8e2', signShade: '#b9bcb4', mark: '#c23a30' },
    safe: { sign: '#f4f4ee', signShade: '#c4c4bc', mark: '#d55e00' } },
  { id: 'placeholder-adele-sarrazin', name: 'ADELE SARRAZIN', role: 'doyenne élue', sign: 'elder-scarf', placeholder: true,
    // [PROPOSÉ] ~68 years, silver hair in a low knot, lined face, dark wool coat.
    palette: { skin: '#cfa68a', skinLit: '#e0bba0', skinShade: '#8d6a55', hair: '#a9aaa4', hairLit: '#d3d4ce',
      garment: '#34302d', garmentShade: '#1e1b19', collar: '#46403b',
      sign: '#b0632f', signShade: '#7a4420', mark: '#e4d6ae' },
    safe: {} } // the rust/cream scarf already passes every simulated deficiency (see the verify script)
]);
export const PLACEHOLDER_PORTRAIT_SIGNS_V188 = freeze(Object.fromEntries(PLACEHOLDER_PORTRAITS_V188.map(entry => [entry.id, entry.sign])));
const byName = new Map(PLACEHOLDER_PORTRAITS_V188.map(entry => [entry.name, entry]));
const byId = new Map(PLACEHOLDER_PORTRAITS_V188.map(entry => [entry.id, entry]));

/** Speaker name (any case or accents) or placeholder id → profile, else null. */
export function getPlaceholderPortraitV188(nameOrId) {
  return byId.get(nameOrId) || byName.get(normalizeName(nameOrId)) || null;
}

// —— unit-square drawing helpers (u, v in [0, 1]) ——
function painter(ctx, x, y, size) {
  const px = u => x + u * size, py = v => y + v * size;
  return {
    poly(points, fill) {
      ctx.fillStyle = fill; ctx.beginPath();
      points.forEach(([u, v], index) => index ? ctx.lineTo(px(u), py(v)) : ctx.moveTo(px(u), py(v)));
      ctx.closePath(); ctx.fill();
    },
    rect(u, v, w, h, fill) { ctx.fillStyle = fill; ctx.fillRect(px(u), py(v), w * size, h * size); },
    ellipse(u, v, ru, rv, fill, start = 0, end = Math.PI * 2) {
      ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(px(u), py(v), ru * size, rv * size, 0, start, end); ctx.closePath(); ctx.fill();
    }
  };
}

// Shared bust, three-quarter view toward the right. The near (viewer-left)
// shoulder and upper arm are slightly larger: that is where Ferro's band sits.
const TORSO = [[0.04, 1], [0.06, 0.82], [0.14, 0.71], [0.30, 0.655], [0.44, 0.635], [0.60, 0.64], [0.76, 0.675], [0.88, 0.75], [0.94, 0.86], [0.95, 1]];
const NEAR_ARM = [[0.04, 1], [0.06, 0.82], [0.14, 0.71], [0.22, 0.70], [0.26, 0.80], [0.27, 1]];
const FAR_ARM = [[0.80, 1], [0.82, 0.78], [0.88, 0.75], [0.94, 0.86], [0.95, 1]];

function drawBust(p, c, elder) {
  // Garment, then its shaded back half and the arm separations.
  p.poly(TORSO, c.garment);
  p.poly([[0.04, 1], [0.06, 0.82], [0.14, 0.71], [0.30, 0.655], [0.32, 1]], c.garmentShade);
  p.poly(NEAR_ARM, c.garment);
  p.poly([[0.04, 1], [0.06, 0.82], [0.10, 0.76], [0.12, 1]], c.garmentShade);
  p.poly(FAR_ARM, c.garmentShade);
  // Neck (shaded under the jaw) and collar.
  const dx = elder ? 0.02 : 0, dy = elder ? 0.02 : 0;
  p.poly([[0.43 + dx, 0.47 + dy], [0.59 + dx, 0.47 + dy], [0.60, 0.65], [0.42, 0.66]], c.skinShade);
  p.poly([[0.36, 0.66], [0.44, 0.58], [0.51, 0.66], [0.58, 0.58], [0.66, 0.655], [0.58, 0.72], [0.51, 0.67], [0.44, 0.72]], c.collar);
}

function drawHead(p, c, { elder = false, hair }) {
  const cx = elder ? 0.52 : 0.50, cy = elder ? 0.35 : 0.33, rx = 0.155, ry = 0.195;
  p.ellipse(cx - 0.004, cy, rx + 0.004, ry, 'rgba(120,200,180,.42)'); // cool rim, left
  p.ellipse(cx, cy, rx, ry, c.skinShade);
  p.ellipse(cx + 0.035, cy - 0.005, rx - 0.035, ry - 0.012, c.skin);
  p.ellipse(cx + 0.075, cy - 0.01, rx - 0.085, ry - 0.06, c.skinLit); // key light on the cheek
  // Ear (far side of the face, viewer-left).
  p.ellipse(cx - 0.135, cy + 0.01, 0.028, 0.045, c.skinShade);
  // Nose, brow, eyes, mouth: three-quarter view, features right of centre.
  p.poly([[cx + 0.075, cy - 0.01], [cx + 0.125, cy + 0.07], [cx + 0.07, cy + 0.08]], c.skinLit);
  p.poly([[cx + 0.07, cy + 0.07], [cx + 0.12, cy + 0.07], [cx + 0.07, cy + 0.085]], c.skinShade);
  p.rect(cx - 0.035, cy - 0.045, 0.07, 0.016, c.hair); p.rect(cx + 0.075, cy - 0.045, 0.055, 0.016, c.hair);
  p.ellipse(cx + 0.0, cy + 0.0, 0.017, 0.011, '#141414'); p.ellipse(cx + 0.1, cy + 0.0, 0.014, 0.011, '#141414');
  p.rect(cx + 0.02, cy + 0.115, 0.075, 0.012, c.skinShade);
  hair(p, c, cx, cy, rx, ry);
}

const SIGNS = {
  // Hi-vis vest: two panels over the jacket, a V opening, two shoulder braces
  // and two horizontal retro-reflective bands — an "H" readable without colour.
  'hi-vis-vest'(p, c) {
    p.poly([[0.265, 1], [0.235, 0.715], [0.30, 0.665], [0.40, 0.66], [0.47, 0.80], [0.47, 1]], c.sign);
    p.poly([[0.55, 1], [0.55, 0.80], [0.62, 0.665], [0.76, 0.685], [0.83, 0.75], [0.81, 1]], c.signShade);
    p.poly([[0.55, 1], [0.55, 0.80], [0.62, 0.665], [0.70, 0.675], [0.70, 1]], c.sign);
    p.rect(0.30, 0.665, 0.06, 0.195, c.mark); p.rect(0.65, 0.672, 0.06, 0.188, c.mark); // braces
    p.rect(0.255, 0.85, 0.215, 0.045, c.mark); p.rect(0.55, 0.85, 0.27, 0.045, c.mark); // band 1
    p.rect(0.26, 0.935, 0.21, 0.045, c.mark); p.rect(0.55, 0.935, 0.265, 0.045, c.mark); // band 2
  },
  // Armband on the near upper arm, with a plain cross (a medic sign, not the
  // protected Red Cross emblem proportions).
  'cross-armband'(p, c) {
    p.poly([[0.045, 0.80], [0.235, 0.795], [0.25, 0.935], [0.04, 0.94]], c.sign);
    p.poly([[0.045, 0.80], [0.09, 0.80], [0.085, 0.94], [0.04, 0.94]], c.signShade);
    p.rect(0.125, 0.81, 0.04, 0.115, c.mark); p.rect(0.088, 0.848, 0.114, 0.04, c.mark);
  },
  // Elder's scarf: a wrapped band at the neck, two tails down the front with
  // woven stripes and a fringe.
  'elder-scarf'(p, c) {
    p.poly([[0.34, 0.63], [0.44, 0.56], [0.62, 0.56], [0.70, 0.63], [0.62, 0.71], [0.42, 0.71]], c.sign);
    p.poly([[0.34, 0.63], [0.44, 0.56], [0.46, 0.71], [0.42, 0.71]], c.signShade);
    p.poly([[0.44, 0.68], [0.55, 0.68], [0.53, 0.93], [0.42, 0.93]], c.sign); // near tail
    p.poly([[0.55, 0.68], [0.64, 0.66], [0.66, 0.89], [0.56, 0.90]], c.signShade); // far tail
    for (const v of [0.75, 0.82]) { p.rect(0.43, v, 0.11, 0.02, c.mark); p.rect(0.56, v - 0.01, 0.095, 0.02, c.mark); }
    for (let i = 0; i < 4; i++) p.rect(0.425 + i * 0.03, 0.93, 0.016, 0.045, c.mark); // fringe
    for (let i = 0; i < 3; i++) p.rect(0.565 + i * 0.03, 0.90, 0.016, 0.04, c.mark);
  }
};

const HAIR = {
  'placeholder-tomas-wren'(p, c, cx, cy, rx, ry) { // short cropped, greying, stubble
    p.ellipse(cx - 0.01, cy - 0.06, rx + 0.004, ry - 0.06, c.hair, Math.PI, Math.PI * 2);
    p.poly([[cx - rx - 0.004, cy - 0.06], [cx - 0.08, cy - 0.06], [cx - 0.10, cy + 0.06], [cx - rx + 0.01, cy + 0.04]], c.hair);
    p.ellipse(cx + 0.01, cy - 0.15, 0.06, 0.014, c.hairLit);
    p.ellipse(cx + 0.03, cy + 0.10, 0.095, 0.07, 'rgba(60,50,44,.45)', 0, Math.PI); // stubble, inside the jaw
  },
  'placeholder-lucia-ferro'(p, c, cx, cy, rx, ry) { // dark hair, tied back in a bun
    p.ellipse(cx - 0.17, cy - 0.04, 0.05, 0.055, c.hair);
    p.ellipse(cx - 0.015, cy - 0.065, rx + 0.006, ry - 0.07, c.hair, Math.PI, Math.PI * 2);
    p.poly([[cx - rx - 0.006, cy - 0.065], [cx - 0.06, cy - 0.065], [cx - 0.10, cy + 0.08], [cx - rx + 0.01, cy + 0.06]], c.hair);
    p.ellipse(cx + 0.01, cy - 0.15, 0.06, 0.012, c.hairLit);
  },
  'placeholder-adele-sarrazin'(p, c, cx, cy, rx, ry) { // silver, low knot, lined face
    p.ellipse(cx - 0.155, cy + 0.10, 0.055, 0.05, c.hair);
    p.ellipse(cx - 0.01, cy - 0.055, rx + 0.012, ry - 0.055, c.hair, Math.PI, Math.PI * 2);
    p.poly([[cx - rx - 0.012, cy - 0.055], [cx - 0.05, cy - 0.055], [cx - 0.09, cy + 0.10], [cx - rx + 0.005, cy + 0.10]], c.hair);
    p.ellipse(cx + 0.01, cy - 0.15, 0.07, 0.014, c.hairLit);
    p.rect(cx - 0.03, cy - 0.075, 0.13, 0.008, c.skinShade); // forehead line
    p.rect(cx + 0.085, cy + 0.10, 0.008, 0.05, c.skinShade); p.rect(cx + 0.0, cy + 0.03, 0.03, 0.008, c.skinShade); // nasolabial, under-eye
  }
};

/**
 * Draw a placeholder portrait in the square frame (x, y, size). The caller owns
 * the backdrop; this only paints the bust. Returns null for an unknown profile.
 */
export function drawPlaceholderPortraitV188(ctx, profileOrName, { x = 0, y = 0, size = 384, colorblind = false } = {}) {
  const profile = typeof profileOrName === 'string' ? getPlaceholderPortraitV188(profileOrName) : profileOrName;
  if (!ctx || !profile || byId.get(profile.id) !== profile || !(size > 0)) return null;
  const colours = colorblind ? { ...profile.palette, ...profile.safe } : profile.palette;
  const p = painter(ctx, x, y, size), elder = profile.sign === 'elder-scarf';
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip(); // belt and braces: nothing escapes the frame
  drawBust(p, colours, elder);
  if (profile.sign !== 'elder-scarf') SIGNS[profile.sign](p, colours);
  drawHead(p, colours, { elder, hair: HAIR[profile.id] });
  if (profile.sign === 'elder-scarf') SIGNS[profile.sign](p, colours); // over the collar and chin shadow
  ctx.restore();
  return { kind: 'placeholder-portrait', id: profile.id, name: profile.name, sign: profile.sign,
    placeholder: true, colorblind: Boolean(colorblind), frame: { x, y, w: size, h: size } };
}

/** The sign's own geometry, exposed for tests and QA overlays. */
export function drawPlaceholderSignV188(ctx, profile, { x = 0, y = 0, size = 384, colorblind = false } = {}) {
  if (!ctx || !profile || byId.get(profile.id) !== profile) return false;
  SIGNS[profile.sign](painter(ctx, x, y, size), colorblind ? { ...profile.palette, ...profile.safe } : profile.palette);
  return true;
}
