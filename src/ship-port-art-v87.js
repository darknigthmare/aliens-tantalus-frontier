const ROOT = '/assets/openai/ship-animals/v87';
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value); Object.values(value).forEach(freeze);
  }
  return value;
};
const finite = value => typeof value === 'number' && Number.isFinite(value);
const own = (value, key) => Object.hasOwn(value, key);

// Measured alpha>=8 body extents, with two transparent pixels of padding.
// The atlas contains distant alpha<8 specks: nominal 384x256 cells are unsafe.
// Entries are x, y, exclusive right/bottom, absolute visible foot anchor.
const vendorSources = [
  [165,10,229,244,197,241], [547,10,612,244,579.5,241],
  [931,10,996,244,964.5,241], [1315,10,1380,244,1348.5,241],
  [160,264,259,503,186,500], [544,264,647,502,570.5,500],
  [928,264,1013,502,954.5,500], [1312,264,1417,503,1338.5,500],
  [118,521,265,757,192,754], [499,520,632,756,577.5,753],
  [880,520,1042,757,956,754], [1275,519,1435,757,1348.5,754],
  [116,776,270,1012,187.5,1009], [518,776,623,1012,593,1009],
  [882,777,1038,1011,1006,1008], [1300,777,1394,1013,1330.5,1010]
];
const clip = (frames, fps, runtimeEnabled) => ({ frames, fps, loop: true, runtimeEnabled,
  review: runtimeEnabled ? 'poses-inspected-motion-unverified' : 'authored-locomotion-not-runtime-certified' });

// Exclusive-right/bottom rectangles, not a 4x2 grid: several props cross cells.
export const PORT_PROP_RECTS_V87 = freeze({
  door: [23,98,398,453], terminal: [485,194,591,453],
  counter: [653,297,1040,453], gate: [1065,257,1512,460],
  shelf: [51,532,337,952], carrier: [408,664,675,926],
  dockingClamp: [721,574,1061,940], lamp: [1082,683,1513,778]
});

export const PORT_ART_V87 = freeze({
  vendor: {
    path: ROOT + '/port-vendor-atlas.png', width: 1536, height: 1024,
    sha256: '82b1d2eba940a87ddc68e00b9868432ff4a88d97b09aee3f7148b3ae2b9ca9a7',
    sourceFacing: 1, worldScale: .4, referenceHeight: 92,
    frames: vendorSources.map(([x,y,right,bottom,footX,footY], index) => ({
      index, x, y, w: right - x, h: bottom - y, pivotX: footX - x, pivotY: footY - y, safe: true
    })),
    clips: { idle: clip([0,1,2,3], 2, true), talk: clip([4,5,6,7], 3, true), walk: clip([8,9,10,11,12,13,14,15], 8, false) },
    coverage: { authoredPoses: 16, runtimePoses: 8, fluidityCertified: false, walkRuntimeEnabled: false }
  },
  props: {
    path: ROOT + '/port-props.png', width: 1536, height: 1024,
    sha256: '260a29bfa4ac456ae1d32e31e7c7665f6ed0e27b1f94a08f89cf1d83687cf167',
    rects: PORT_PROP_RECTS_V87
  }
});

export function isPortArtReadyV87(kind, image) {
  const asset = own(PORT_ART_V87, kind) ? PORT_ART_V87[kind] : null;
  if (!asset || image?.complete !== true || image.naturalWidth !== asset.width || image.naturalHeight !== asset.height) return false;
  const path = String(image.currentSrc || image.src || '').split(/[?#]/)[0];
  // Distinct identities: the props, animals and vendor share dimensions.
  return path.endsWith(asset.path);
}

export function resolvePortVendorFrameV87({ time = 0, talking = false, reducedMotion = false } = {}) {
  if (!finite(time) || time < 0 || ![true, false].includes(talking) || ![true, false].includes(reducedMotion)) return null;
  const clipId = talking ? 'talk' : 'idle', selectedClip = PORT_ART_V87.vendor.clips[clipId];
  if (time * selectedClip.fps > Number.MAX_SAFE_INTEGER) return null;
  const index = selectedClip.frames[reducedMotion ? 0 : Math.floor(time * selectedClip.fps) % selectedClip.frames.length];
  return { clipId, index, frame: PORT_ART_V87.vendor.frames[index] };
}

/** x is the physical foot anchor, not the left edge. All poses keep one scale. */
export function drawPortVendorV87(ctx, image, options = {}) {
  if (!options || !finite(options.x) || !finite(options.feetY) || ![1, -1].includes(options.facing ?? 1)
    || !['save', 'restore', 'translate', 'scale', 'drawImage'].every(name => typeof ctx?.[name] === 'function')
    || !isPortArtReadyV87('vendor', image)) return false;
  const sample = resolvePortVendorFrameV87(options);
  if (!sample) return false;
  const { frame } = sample, scale = PORT_ART_V87.vendor.worldScale;
  ctx.save();
  try {
    ctx.translate(options.x, options.feetY);
    ctx.scale((options.facing ?? 1) === PORT_ART_V87.vendor.sourceFacing ? 1 : -1, 1);
    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h,
      -frame.pivotX * scale, -frame.pivotY * scale, frame.w * scale, frame.h * scale);
  } finally { ctx.restore(); }
  return true;
}

/** Fit to x/width/bottom, or contain bottom-centered inside x/y/w/h. Never stretch. */
export function getPortPropBoundsV87(kind, bounds) {
  if (!own(PORT_PROP_RECTS_V87, kind) || !bounds || !finite(bounds.x)) return null;
  const [sx,sy,right,bottom] = PORT_PROP_RECTS_V87[kind], sourceWidth = right - sx, sourceHeight = bottom - sy;
  if (own(bounds, 'width') || own(bounds, 'bottom')) {
    if (!finite(bounds.width) || bounds.width <= 0 || !finite(bounds.bottom)) return null;
    const h = bounds.width * sourceHeight / sourceWidth, y = bounds.bottom - h;
    return finite(h) && finite(y) ? { x: bounds.x, y, w: bounds.width, h } : null;
  }
  if (!finite(bounds.y) || !finite(bounds.w) || !finite(bounds.h) || bounds.w <= 0 || bounds.h <= 0) return null;
  const scale = Math.min(bounds.w / sourceWidth, bounds.h / sourceHeight);
  const w = sourceWidth * scale, h = sourceHeight * scale;
  const x = bounds.x + (bounds.w - w) / 2, y = bounds.y + bounds.h - h;
  return [x,y,w,h].every(finite) ? { x, y, w, h } : null;
}

export function drawPortPropV87(ctx, image, kind, bounds) {
  if (typeof ctx?.drawImage !== 'function' || !isPortArtReadyV87('props', image)) return false;
  const target = getPortPropBoundsV87(kind, bounds);
  if (!target) return false;
  const [x,y,right,bottom] = PORT_PROP_RECTS_V87[kind];
  ctx.drawImage(image, x, y, right - x, bottom - y, target.x, target.y, target.w, target.h);
  return true;
}
