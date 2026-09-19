const ROOT = '/assets/openai/refuge/v87';
const finite = value => typeof value === 'number' && Number.isFinite(value);
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

// Measured connected alpha>16 silhouettes + two guard pixels. The generated
// 1774x887 sheet is NOT a regular 4x2 grid; distant alpha specks are excluded.
export const REFUGE_PROP_RECTS_V87 = freeze({
  library: [47,75,411,393], portrait: [498,61,833,369],
  terminal: [990,46,1242,417], light: [1478,116,1623,405],
  cushion: [46,607,407,774], bench: [452,527,880,799],
  porthole: [933,504,1322,791], door: [1397,464,1709,836]
});
export const REFUGE_APERTURES_V87 = freeze({ portrait: [550,146,782,322], porthole: [982,555,1271,737] });
// Absolute silhouette boxes followed by measured front-paw anchor. Tail poses
// cross nominal cells; paw registration, never per-frame resizing, avoids jitter.
const hologramSources = [
  [42,16,197,205,137,202],[264,16,417,205,359,201],[485,16,642,206,580,201],[707,16,864,206,801,202],
  [928,16,1084,206,1023.5,201],[1150,16,1305,207,1245,201],[1372,16,1529,206,1467,201],[1594,16,1751,206,1689,201],
  [41,237,197,427,138,422],[249,237,418,425,360,422],[434,237,641,424,583,422],[653,237,864,424,803,422],
  [878,237,1081,424,1025,422],[1094,237,1305,424,1246.5,422],[1320,237,1528,424,1468,422],[1594,237,1751,427,1690,422],
  [42,459,197,648,136,645],[263,459,419,649,358,645],[485,459,641,648,580,645],[707,459,864,649,801.5,645],
  [928,459,1083,648,1023,645],[1148,459,1305,648,1244.5,645],[1372,459,1527,648,1466,645],[1594,459,1748,648,1688,645],
  [42,680,198,871,135.5,867],[262,678,424,871,358,867],[485,677,641,871,580,867],[707,677,868,871,800,867],
  [928,676,1091,871,1023,867],[1148,676,1312,871,1243,867],[1371,678,1531,871,1466,867],[1594,680,1751,871,1689,867]
];
const clip = (start, fps, loop = true) => ({ frames: Array.from({ length: 8 }, (_, i) => start + i), fps, loop });
export const REFUGE_GREETING_SECONDS_V87 = 2;
export const REFUGE_ART_V87 = freeze({
  prop: { path: ROOT + '/refuge-props-atlas.png', width: 1774, height: 887,
    sha256: 'f6c43df454f3bb9d6e1477acadfd479e5675d69c35dab6be6d2fbf4217958bc6', rects: REFUGE_PROP_RECTS_V87 },
  door: { path: ROOT + '/refuge-props-atlas.png', width: 1774, height: 887 },
  hologram: { path: ROOT + '/refuge-hologram-atlas.png', width: 1774, height: 887,
    sha256: '70068a4751b4ce5662168d48b88662fe17756165df9177ed038a23ef8a2d91a5',
    identity: 'generic-feline-simulation', personalLikeness: false, worldScale: .16,
    frames: hologramSources.map(([l,t,r,b,px,py], index) => ({ index, x: l-2, y: t-2, w: r-l+4, h: b-t+4,
      pivotX: px-l+2, pivotY: py-t+2, safe: true })),
    clips: { idle: clip(0,2), tail: clip(8,4), blink: clip(16,4), greet: clip(24,4,false) },
    coverage: { authoredPoses: 32, runtimePoses: 32, fluidityCertified: false, review: 'alpha-and-poses-inspected-motion-unverified' } },
  far: { path: '/assets/openai/ship-animals/v87/habitat-wall.png', width: 1536, height: 1024 },
  stars: { path: '/assets/openai/ui/title/v79/stars/stars-01-distant-field.png', width: 1600, height: 900 },
  planet: { path: '/assets/openai/ui/title/v79/planet/planet-02-ceto-basin.png', width: 1024, height: 1024,
    use: 'decorative-simulated-view-not-current-world-location' },
  overhead: { path: '/assets/openai/hub/layers/habitat-quarters-overhead.png', width: 1774, height: 887 },
  foreground: { path: '/assets/openai/hub/layers/habitat-quarters-foreground.png', width: 1774, height: 887 }
});

/** Contain bottom-centered or fit a declared width; never distort an object. */
export function getRefugePropBoundsV87(kind, bounds) {
  if (!Object.hasOwn(REFUGE_PROP_RECTS_V87, kind) || !bounds || !finite(bounds.x)) return null;
  const [l,t,r,b] = REFUGE_PROP_RECTS_V87[kind], sw = r-l, sh = b-t;
  if (Object.hasOwn(bounds, 'width') || Object.hasOwn(bounds, 'bottom')) {
    if (!finite(bounds.width) || bounds.width <= 0 || !finite(bounds.bottom)) return null;
    const h = bounds.width * sh / sw, y = bounds.bottom-h;
    return [h,y].every(finite) ? { x: bounds.x, y, w: bounds.width, h } : null;
  }
  if (![bounds.y,bounds.w,bounds.h].every(finite) || bounds.w <= 0 || bounds.h <= 0) return null;
  const scale = Math.min(bounds.w/sw,bounds.h/sh), w = sw*scale, h = sh*scale;
  const x = bounds.x+(bounds.w-w)/2, y = bounds.y+bounds.h-h;
  return [x,y,w,h].every(finite) ? { x,y,w,h } : null;
}
export const REFUGE_PROPS_LAYOUT_V87 = freeze([
  { id: 'refuge-portrait', kind: 'portrait', x: 390, width: 108, bottom: 595 },
  { id: 'refuge-library', kind: 'library', x: 585, width: 110, bottom: 594 },
  { id: 'refuge-terminal', kind: 'terminal', x: 830, width: 60, bottom: 624 },
  { id: 'refuge-light', kind: 'light', x: 1070, width: 24, bottom: 624 },
  { id: 'refuge-cushion', kind: 'cushion', x: 1293, width: 64, bottom: 624 },
  { id: 'refuge-bench', kind: 'bench', x: 1580, width: 94, bottom: 624 },
  { id: 'refuge-porthole-small', kind: 'porthole', x: 975, width: 210, bottom: 510 },
  { id: 'refuge-porthole-view', kind: 'porthole', x: 1500, width: 280, bottom: 550 }
].map(value => ({ ...value, ...getRefugePropBoundsV87(value.kind,value), collidable: false, asset: REFUGE_ART_V87.prop.path })));
export const REFUGE_HOLOGRAM_ANCHOR_V87 = freeze({ x: 1325, y: 614 });
// Caption sits above the frame and above the grounded Marine, not at his feet.
export const REFUGE_PORTRAIT_LABEL_V87 = freeze({ x: 444, y: 485, size: 11, maxWidth: 176 });
// Reuse actual wall/ceiling pixels at architectural scale, not one giant room
// picture. The 96.5px Marine stands in a 290px-high visible compartment.
// Overhead alpha after row248 is only dangling wires: do not count those as
// structural ceiling thickness. The solid caisson is 207 source pixels high.
export const REFUGE_ARCHITECTURE_V87 = freeze({
  ceiling: { source: [20,42,1750,249], scale: .35, area: { x: 0,y: 261.55,w: 1920,h: 72.45 }, bottom: 334 },
  service: { source: [0,675,1536,1005], scale: .375, area: { x: 0,y: 0,w: 1920,h: 261.55 } },
  upperWall: { source: [0,290,1536,660], scale: .375, area: { x: 0,y: 261.55,w: 1920,h: 238.7 } },
  lowerWall: { source: [0,675,1536,1005], scale: .375, area: { x: 0,y: 500.25,w: 1920,h: 123.75 } }
});

export function isRefugeArtReadyV87(role, image) {
  const art = Object.hasOwn(REFUGE_ART_V87,role) ? REFUGE_ART_V87[role] : null;
  if (!art || image?.complete !== true || image.naturalWidth !== art.width || image.naturalHeight !== art.height) return false;
  return String(image.currentSrc || image.src || '').split(/[?#]/)[0].endsWith(art.path);
}
export function drawRefugePropV87(ctx,image,kind,bounds) {
  const target = getRefugePropBoundsV87(kind,bounds);
  if (!target || typeof ctx?.drawImage !== 'function' || !isRefugeArtReadyV87('prop',image)) return false;
  const [l,t,r,b] = REFUGE_PROP_RECTS_V87[kind];
  ctx.drawImage(image,l,t,r-l,b-t,target.x,target.y,target.w,target.h); return true;
}
export function resolveRefugeHologramFrameV87({ time = 0, greetingRemaining = 0, reducedMotion = false } = {}) {
  if (![time,greetingRemaining].every(finite) || time < 0 || greetingRemaining < 0 || time > Number.MAX_SAFE_INTEGER/4
    || typeof reducedMotion !== 'boolean') return null;
  let clipId = 'idle', elapsed = reducedMotion ? 0 : time;
  if (!reducedMotion && greetingRemaining > 0) { clipId = 'greet'; elapsed = Math.max(0,REFUGE_GREETING_SECONDS_V87-greetingRemaining); }
  else if (!reducedMotion) {
    const cycle = time % 12;
    if (cycle >= 6 && cycle < 8) { clipId = 'tail'; elapsed = cycle-6; }
    else if (cycle >= 8 && cycle < 10) { clipId = 'blink'; elapsed = cycle-8; }
  }
  const selected = REFUGE_ART_V87.hologram.clips[clipId], step = Math.floor(elapsed*selected.fps);
  const index = selected.frames[selected.loop ? step%8 : Math.min(step,7)];
  return { clipId,index,frame: REFUGE_ART_V87.hologram.frames[index] };
}
export function drawRefugeHologramV87(ctx,image,options = {}) {
  const { x = REFUGE_HOLOGRAM_ANCHOR_V87.x, y = REFUGE_HOLOGRAM_ANCHOR_V87.y } = options;
  if (![x,y].every(finite) || !['save','restore','translate','drawImage'].every(key => typeof ctx?.[key] === 'function')
    || !isRefugeArtReadyV87('hologram',image)) return false;
  const sample = resolveRefugeHologramFrameV87(options); if (!sample) return false;
  const f = sample.frame, scale = REFUGE_ART_V87.hologram.worldScale;
  ctx.save();
  try { ctx.translate(x,y); ctx.globalAlpha = .85;
    ctx.drawImage(image,f.x,f.y,f.w,f.h,-f.pivotX*scale,-f.pivotY*scale,f.w*scale,f.h*scale);
  } finally { ctx.restore(); }
  return true;
}
export function getRefugeApertureV87(kind,bounds) {
  const target = getRefugePropBoundsV87(kind,bounds);
  if (!target || !Object.hasOwn(REFUGE_APERTURES_V87,kind)) return null;
  const [l,t,r] = REFUGE_PROP_RECTS_V87[kind], [x,y,right,bottom] = REFUGE_APERTURES_V87[kind], scale = target.w/(r-l);
  return { x: target.x+(x-l)*scale, y: target.y+(y-t)*scale, w: (right-x)*scale, h: (bottom-y)*scale };
}
function cover(ctx,image,box,offset = 0) {
  const scale = Math.max(box.w/image.naturalWidth,box.h/image.naturalHeight);
  const w = image.naturalWidth*scale, h = image.naturalHeight*scale;
  ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,box.x+(box.w-w)/2+offset,box.y+(box.h-h)/2,w,h);
}
function tiledBitmap(ctx,image,{ source,scale,area }) {
  const [sx,sy,right,bottom] = source, tileW = (right-sx)*scale, tileH = (bottom-sy)*scale;
  for (let y = area.y; y < area.y+area.h-.001; y += tileH) for (let x = area.x; x < area.x+area.w-.001; x += tileW) {
    const w = Math.min(tileW,area.x+area.w-x), h = Math.min(tileH,area.y+area.h-y);
    // Crop partial edge tiles in source space instead of stretching the panel.
    ctx.drawImage(image,sx,sy,w/scale,h/scale,x,y,w,h);
  }
}
function localPhotoReady(image) {
  return image?.complete === true && [image.naturalWidth,image.naturalHeight].every(v => finite(v) && v > 0 && v <= 4096)
    && /^data:image\/(?:png|jpeg|webp);base64,/i.test(String(image.currentSrc || image.src || ''));
}
function label(ctx,text,x,y,size = 11,color = '#d7c4a0',maxWidth = null) {
  if (typeof ctx.fillText !== 'function') return;
  ctx.font = size+'px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = color;
  let shown = String(text);
  if (finite(maxWidth) && maxWidth > 0) {
    const width = value => typeof ctx.measureText === 'function' ? ctx.measureText(value).width : Array.from(value).length*size*.7;
    const letters = Array.from(shown);
    while (letters.length && width(shown) > maxWidth) { letters.pop(); shown = letters.join('')+'…'; }
    ctx.fillText(shown,x,y,maxWidth);
  } else ctx.fillText(shown,x,y);
}

/** far: screen-space context, applies -cameraX itself. decor/front: world-space
 * context already translated by the caller. Call far -> decor -> player -> front.
 * This renderer owns no storage, clock, gameplay rewards, photo upload or identity.
 * Missing bitmap roles return false/are omitted, never fabricated as CSS props. */
export function drawRefugeLayerV87(ctx,images,options = {}) {
  const { layer, cameraX = 0, time = 0, reducedMotion = false, personal = {}, greetingRemaining = 0 } = options;
  if (!['far','decor','front'].includes(layer) || ![cameraX,time].every(finite) || time < 0 || typeof reducedMotion !== 'boolean'
    || !['save','restore','translate','drawImage'].every(key => typeof ctx?.[key] === 'function')) return false;
  const get = role => typeof images?.get === 'function' ? images.get(role) : images?.[role];
  ctx.save();
  try {
    if (layer === 'far') {
      ctx.translate(-cameraX,0);
      if (isRefugeArtReadyV87('far',get('far'))) {
        // Dark, inaccessible service space above the caisson: real technical
        // panels, not a flat empty area or an enormous second living room.
        ctx.save(); ctx.filter = 'brightness(0.23) saturate(0.6)';
        tiledBitmap(ctx,get('far'),REFUGE_ARCHITECTURE_V87.service); ctx.restore();
        // The crops omit the source's baked windows. Actual panel bays now
        // measure roughly180..220px rather than500+px beside a96.5px Marine.
        tiledBitmap(ctx,get('far'),REFUGE_ARCHITECTURE_V87.upperWall);
        tiledBitmap(ctx,get('far'),REFUGE_ARCHITECTURE_V87.lowerWall);
      }
      for (const prop of REFUGE_PROPS_LAYOUT_V87.filter(value => value.kind === 'porthole')) {
        const box = getRefugeApertureV87('porthole',prop);
        if (!['beginPath','rect','clip','fillRect'].every(key => typeof ctx[key] === 'function')) continue;
        ctx.save(); ctx.beginPath(); ctx.rect(box.x,box.y,box.w,box.h); ctx.clip();
        ctx.fillStyle = '#07131c'; ctx.fillRect(box.x,box.y,box.w,box.h);
        if (isRefugeArtReadyV87('stars',get('stars'))) {
          // Overscan keeps parallax clipped inside the hardware even at x640.
          cover(ctx,get('stars'),{ x: box.x-110, y: box.y-15, w: box.w+220, h: box.h+30 },reducedMotion ? 0 : -cameraX*.08);
        }
        if (isRefugeArtReadyV87('planet',get('planet'))) {
          const size = box.h*.72, drift = reducedMotion ? 0 : -cameraX*.025;
          ctx.globalAlpha = .48; ctx.drawImage(get('planet'),0,0,1024,1024,box.x+box.w*.5+drift,box.y+box.h*.1,size,size);
        }
        ctx.restore();
      }
      return true;
    }
    if (layer === 'front') {
      if (!isRefugeArtReadyV87('foreground',get('foreground'))) return false;
      // Bitmap corner trims sit BELOW the playable feet, never over the marine.
      ctx.drawImage(get('foreground'),20,642,470,182,0,636,350,350*182/470);
      ctx.drawImage(get('foreground'),1276,642,484,182,1570,636,350,350*182/484);
      return true;
    }
    if (isRefugeArtReadyV87('overhead',get('overhead'))) {
      tiledBitmap(ctx,get('overhead'),REFUGE_ARCHITECTURE_V87.ceiling);
    }
    for (const prop of REFUGE_PROPS_LAYOUT_V87) {
      if (prop.kind === 'portrait' && localPhotoReady(personal?.photoImage) && isRefugeArtReadyV87('prop',get('prop'))) {
        const box = getRefugeApertureV87('portrait',prop), photo = personal.photoImage;
        const scale = Math.min(box.w/photo.naturalWidth,box.h/photo.naturalHeight), w = photo.naturalWidth*scale,h = photo.naturalHeight*scale;
        ctx.drawImage(photo,0,0,photo.naturalWidth,photo.naturalHeight,box.x+(box.w-w)/2,box.y+(box.h-h)/2,w,h);
      }
      ctx.save();
      if (prop.kind === 'light') { ctx.filter = personal?.lightOn === false ? 'brightness(0.25) saturate(0.25)' : 'none'; }
      drawRefugePropV87(ctx,get('prop'),prop.kind,prop); ctx.restore();
    }
    drawRefugeHologramV87(ctx,get('hologram'),{ time,reducedMotion,greetingRemaining });
    const caption = REFUGE_PORTRAIT_LABEL_V87;
    label(ctx,String(personal?.name || 'PORTRAIT PERSONNALISABLE').slice(0,40),caption.x,caption.y,caption.size,'#d7c4a0',caption.maxWidth);
    label(ctx,'SIMULATION FÉLINE GÉNÉRIQUE',1325,512,10,'#9acbd4');
    return isRefugeArtReadyV87('prop',get('prop'));
  } finally { ctx.restore(); }
}
