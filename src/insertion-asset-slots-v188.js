// V188 — named art slots for the mission insertion / extraction cinematics.
// Raster production resumes at the owner's request (2026-11-16). Unproduced
// slots keep their Canvas primitive fallback. When an image is produced, commit it at
// the slot's path AND add the slot id to INSERTION_ASSET_FILES_PRESENT_V188: only
// listed slots are ever requested, so the game never asks the network for a
// file that is not in the repository. Briefs describe documented references
// from Aliens (1986) and the project's adaptations; a generated image would not
// certify any franchise fidelity. Slot list: docs/development/INSERTION_ART_SLOTS_V188.md.

import { TITLE_SHIP_ASSETS_V87 } from './title-scene-assets-v79.js';
import { getNpcDialoguePortraitV168 } from './npc-dialogue-portraits-v168.js';
import { resolveHumanSpriteDrawableV164 } from './npc-matte-apertures-v164.js';

export const INSERTION_ASSET_ROOT_V188 = '/assets/insertion/v188/';
export const INSERTION_ASSET_LAYERS_V188 = Object.freeze(['background', 'parallax', 'midground', 'actor', 'fx', 'foreground', 'overlay']);

// Existing art is addressed at its original path, never copied to a second PNG.
// Keep Orlov's reviewed portrait framing shared with the dialogue system.
const cheyenneReference = TITLE_SHIP_ASSETS_V87.find(asset => asset.shipId === 'ud4l-cheyenne');
const pilotPortrait = getNpcDialoguePortraitV168('crew-08-maksim-orlov');
export const INSERTION_ASSET_REUSED_V188 = Object.freeze({
  'ud4l-front': Object.freeze({ path: cheyenneReference.src, kind: 'ship-reference' }),
  'comms-pilot': Object.freeze({ path: pilotPortrait.source, kind: 'crew-portrait', crewId: pilotPortrait.crewId,
    width: pilotPortrait.sourceWidth, height: pilotPortrait.sourceHeight,
    rect: Object.freeze([pilotPortrait.crop.x, pilotPortrait.crop.y, pilotPortrait.crop.w, pilotPortrait.crop.h]) })
});

// Measured alpha-content bounds of the delivered square discs, in source pixels.
// Keep their transparent export margins out of the orbital radius calculation.
// The PNG bytes stay intact. A different native size ignores this crop contract.
export const INSERTION_DISC_SOURCE_RECTS_V188 = Object.freeze({
  'planet-limb': Object.freeze({ width: 1254, height: 1254, rect: Object.freeze([13, 21, 1222, 1210]) }),
  'moon-limb': Object.freeze({ width: 1254, height: 1254, rect: Object.freeze([11, 12, 1226, 1228]) })
});

const slot = (id, layer, width, height, purpose, brief) => Object.freeze({
  id, layer, width, height, purpose, brief, path: INSERTION_ASSET_REUSED_V188[id]?.path || `${INSERTION_ASSET_ROOT_V188}${id}.png`
});

export const INSERTION_ASSET_SLOTS_V188 = Object.freeze([
  slot('starfield-deep', 'parallax', 2048, 1024, 'Far star layer behind every space shot; scrolled slowly for parallax.',
    'Deep-space star field, sparse cold white and pale blue points, no nebula colours, no galaxies; tileable horizontally; black background.'),
  slot('tantalus-drop-bay', 'background', 1280, 720, 'Bay shot: the USS Tantalus drop bay seen from the gantry, dropship hanging from its clamp.',
    'Project adaptation of the orbital drop-bay idea in Aliens (1986), NOT the Sulaco: industrial hangar, ribbed bulkheads, red work lights, yellow-black hazard edges, overhead rail and clamp; open bay doors at the bottom show stars; leave the dropship out (drawn on its own slot).'),
  slot('tantalus-hull-exterior', 'midground', 1600, 500, 'Release and return shots: the underside of the Tantalus with the bay doors open.',
    'Conestoga-class project transport matching the active Tantalus/Sulaco reference, elongated hull, large left engine, long right bow antennae and a lit ventral drop bay; broadside with slight underside view, transparent background.'),
  slot('ud4l-side', 'actor', 640, 240, 'The UD-4L Cheyenne in side profile (release, approach, landing, lift-off).',
    'UD-4L Cheyenne dropship side profile as seen in Aliens (1986): angular hull, chin turret under the cockpit, stub wings with weapon pods, twin tail booms with twin fins, rear ramp; olive-drab with worn markings; transparent background; ramp closed; no APC.'),
  slot('ud4l-front', 'actor', 480, 320, 'Atmospheric entry shot: the dropship nose-on, the heat sheath drawn separately.',
    'UD-4L Cheyenne seen three-quarter front, slightly from below, chin turret, cockpit glazing, stub wings; dark hull; transparent background.'),
  slot('m577-side', 'actor', 360, 150, 'The M577 APC carried under the dropship belly, then released at landing.',
    'M577 armoured personnel carrier right-facing side profile matching the project reference: long low wedge hull, two large road wheels visible on the near side, roof turret at the rear, side door; olive-drab; transparent background.'),
  slot('ud4l-cockpit', 'foreground', 1280, 720, 'Cockpit frame over the live screens and the canopy view.',
    'UD-4L cockpit interior seen from behind the pilots: canopy struts, dark consoles, two seats, a central pedestal; window areas and the four screen bays fully transparent so live data shows through.'),
  slot('crt-bezel', 'overlay', 420, 300, 'Bezel drawn around each live CRT display.',
    'Military CRT monitor bezel, chunky black-grey plastic, rounded screen corners, small push buttons under the glass; the screen area is transparent.'),
  slot('ud4l-troop-bay', 'background', 1280, 720, 'Troop bay shot: harness seats along the hull, red cabin light.',
    'Project dropship troop compartment, side wall with six right-facing empty harness seats, red lighting, hull ribs and stowed equipment. The marines and status monitor are drawn separately.'),
  slot('marine-seated', 'actor', 52, 80, 'One marine strapped in a harness seat, repeated along the bay (1 m ≈ 51 px).',
    'Colonial marine in armour seated with the harness bar down, side view, helmet on, rifle upright; scale matches a 44×92 px standing marine; transparent background.'),
  slot('planet-limb', 'background', 1600, 1600, 'Orbit shot over a planet with an atmosphere; tinted per world.',
    'Complete circular planet disc centred in a square canvas, thin atmosphere limb and cloud bands; neutral grey tones for world tinting; transparent outside the disc. The runtime crops the orbital horizon from the full disc.'),
  slot('moon-limb', 'background', 1600, 1600, 'Orbit shot over an airless moon or asteroid; tinted per world.',
    'Complete circular airless rocky body centred in a square canvas, sharp edge with no atmosphere glow, craters and ridges, hard shadows; neutral grey; transparent outside the disc.'),
  slot('target-vessel', 'midground', 1600, 700, 'Docking target: the ship or station of a space mission.',
    'Large derelict-looking ship or station hull in side view, docking collar with guide lights, dark windows, scorched plating; transparent background.'),
  slot('entry-plasma', 'fx', 1280, 720, 'Additive plasma sheath and streaks during atmospheric entry.',
    'Orange-white re-entry plasma streaks converging behind a shape at the centre, additive on black; no hull drawn.'),
  slot('cloud-far', 'parallax', 2048, 512, 'Far cloud deck, tinted per world; scrolled slowly.',
    'Soft cloud deck seen from above at dusk, neutral grey, tileable horizontally, transparent gaps.'),
  slot('cloud-near', 'parallax', 2048, 512, 'Near cloud wisps crossing the frame fast during the descent.',
    'Torn cloud wisps, neutral grey, motion-blurred horizontally, tileable, transparent background.'),
  slot('terrain-far', 'parallax', 2048, 400, 'Far terrain silhouette of the landing zone, tinted per world.',
    'Far horizon silhouette of a frontier colony world: ridges, an atmosphere processor tower, pylons; neutral dark grey; tileable; transparent sky.'),
  slot('terrain-near', 'parallax', 2048, 400, 'Near terrain and landing pad of the landing zone, tinted per world.',
    'Near ground silhouette: landing pad with lights, fences, crates and rocks; neutral dark grey; tileable; transparent sky.'),
  slot('comms-pilot', 'overlay', 96, 96, 'Pilot portrait in the comms box of the cockpit screens.',
    'Reuse the reviewed head-and-shoulders portrait of Maksim Orlov from the active crew atlas, tinted for CRT rendering; preserve the identity of the named pilot.')
]);
export const INSERTION_ASSET_SLOT_IDS_V188 = Object.freeze(INSERTION_ASSET_SLOTS_V188.map(entry => entry.id));

// All nineteen slots have art: seventeen generated PNGs and two original-path
// references. A load failure still retains the primitive fallback.
export const INSERTION_ASSET_FILES_PRESENT_V188 = Object.freeze([
  'starfield-deep', 'ud4l-side', 'ud4l-front', 'm577-side', 'ud4l-cockpit',
  'crt-bezel', 'ud4l-troop-bay', 'marine-seated', 'entry-plasma', 'terrain-near', 'comms-pilot',
  'tantalus-drop-bay', 'tantalus-hull-exterior', 'planet-limb', 'moon-limb',
  'target-vessel', 'terrain-far', 'cloud-far', 'cloud-near'
]);

export function getInsertionAssetSlotV188(id) {
  return INSERTION_ASSET_SLOTS_V188.find(entry => entry.id === id) || null;
}

// Reuse the already-admitted title references for named franchise ships. The new
// original vessel belongs only to identified original locations, never to an
// unrecognised world or a named station whose own art is still missing.
export const INSERTION_TARGET_SHIPS_BY_WORLD_V188 = Object.freeze({
  'world-14-usm-auriga': 'usm-auriga',
  'world-15-uscss-nostromo': 'uscss-nostromo',
  'world-16-sulaco-drift': 'uss-sulaco',
  'world-47-uscss-nostromo-depths': 'uscss-nostromo'
});
export const INSERTION_ORIGINAL_TARGET_WORLD_IDS_V188 = Object.freeze(['world-31-nacre-7', 'world-63-nacre-7-depths']);
export function insertionTargetArtV188(worldId) {
  const shipId = INSERTION_TARGET_SHIPS_BY_WORLD_V188[worldId];
  const reference = shipId && TITLE_SHIP_ASSETS_V87.find(asset => asset.shipId === shipId);
  if (reference) return { kind: 'reference', path: reference.src, assetId: reference.id };
  if (INSERTION_ORIGINAL_TARGET_WORLD_IDS_V188.includes(worldId)) return { kind: 'original', path: getInsertionAssetSlotV188('target-vessel').path };
  return { kind: 'placeholder', path: null };
}

/** A separate surface keeps world tinting away from the scene behind an alpha sprite. */
function createTintCanvas(width, height) {
  if (typeof globalThis.OffscreenCanvas === 'function') return new globalThis.OffscreenCanvas(width, height);
  const canvas = globalThis.document?.createElement?.('canvas');
  if (!canvas) return null;
  canvas.width = width; canvas.height = height;
  return canvas;
}

/** Real image when one is committed for the slot, the primitive drawing otherwise. */
export class InsertionAssetLoaderV188 {
  constructor({ ImageCtor = globalThis.Image, present = INSERTION_ASSET_FILES_PRESENT_V188, createCanvas = createTintCanvas } = {}) {
    this.ImageCtor = ImageCtor; this.present = new Set(present); this.images = new Map(); this.requested = [];
    this.createCanvas = createCanvas; this.tinted = new Map(); this.repeating = new Map(); this.worldImages = new Map();
    this.usage = Object.create(null);
  }
  preload(ids = INSERTION_ASSET_SLOT_IDS_V188) {
    for (const id of ids) {
      const entry = getInsertionAssetSlotV188(id);
      if (!entry || !this.present.has(id) || this.images.has(id) || !this.ImageCtor) continue;
      const image = new this.ImageCtor(); image.src = entry.path; this.images.set(id, image); this.requested.push(entry.path);
    }
    return this.requested.slice();
  }
  preloadWorld(worldId) {
    const target = insertionTargetArtV188(worldId);
    if (target.kind !== 'reference' || !this.ImageCtor || this.worldImages.has(target.path)) return;
    const image = new this.ImageCtor(); image.src = target.path; this.worldImages.set(target.path, image); this.requested.push(target.path);
  }
  image(id, worldId = null) {
    const target = id === 'target-vessel' && worldId !== null ? insertionTargetArtV188(worldId) : null;
    const image = target?.kind === 'reference' ? this.worldImages.get(target.path)
      : target?.kind === 'placeholder' ? null : this.images.get(id);
    return image?.complete && image.naturalWidth > 0 ? image : null;
  }
  /** One cached tint per slot: changing worlds replaces it instead of accumulating bitmaps. */
  tintedImage(id, image, tint) {
    const source = id === 'comms-pilot' ? resolveHumanSpriteDrawableV164(image) : image;
    if (!tint) return source;
    const cached = this.tinted.get(id);
    if (cached?.image === image && cached.tint === tint) return cached.canvas;
    const width = image.naturalWidth, height = image.naturalHeight;
    if (!(width > 0 && height > 0)) return image;
    const canvas = this.createCanvas?.(width, height), ctx = canvas?.getContext?.('2d');
    if (!ctx) return image;
    ctx.drawImage(source, 0, 0);
    // Preserve texture luminance; restore the original alpha after colour blending.
    ctx.globalCompositeOperation = 'color'; ctx.fillStyle = tint; ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(source, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    this.tinted.set(id, { image, tint, canvas });
    return canvas;
  }
  /** Complementary edge fades make authored cloud strips periodic in memory. */
  repeatingImage(id, image, width, height) {
    const cached = this.repeating.get(id);
    if (cached?.image === image) return cached.canvas;
    if (!(width > 1 && height > 0)) return null;
    const overlap = Math.max(1, Math.min(Math.round(width * .16), Math.floor(width / 2))), period = width - overlap;
    const faded = this.createCanvas?.(width, height), fade = faded?.getContext?.('2d');
    const canvas = this.createCanvas?.(period, height), ctx = canvas?.getContext?.('2d');
    if (!fade || !ctx) return null;
    fade.drawImage(image, 0, 0);
    const mask = fade.createLinearGradient(0, 0, width, 0);
    mask.addColorStop(0, 'rgba(0,0,0,0)'); mask.addColorStop(overlap / width, '#000');
    mask.addColorStop(period / width, '#000'); mask.addColorStop(1, 'rgba(0,0,0,0)');
    fade.globalCompositeOperation = 'destination-in'; fade.fillStyle = mask; fade.fillRect(0, 0, width, height);
    // Add complementary premultiplied samples; source-over would darken the
    // semi-transparent overlap. Only one period is retained for this slot.
    ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(faded, 0, 0); ctx.drawImage(faded, -period, 0);
    this.repeating.set(id, { image, canvas });
    return canvas;
  }
  /** Draw the slot; repeatWidth tiles inside a clipped strip with world-space scroll. */
  draw(ctx, id, x, y, width, height, fallback, { tint = null, alpha = 1, scroll = 0, repeatWidth = 0, seamlessRepeat = false, fit = 'stretch', worldId = null } = {}) {
    if (!getInsertionAssetSlotV188(id)) throw new Error(`Unknown insertion art slot: ${id}`);
    const image = this.image(id, worldId);
    let source = 'primitive';
    if (image) {
      const drawable = this.tintedImage(id, image, tint), frame = INSERTION_DISC_SOURCE_RECTS_V188[id] || INSERTION_ASSET_REUSED_V188[id];
      const crop = frame && image.naturalWidth === frame.width && image.naturalHeight === frame.height ? frame.rect : null;
      const paint = (dx, dy, dw, dh) => crop ? ctx.drawImage(drawable, ...crop, dx, dy, dw, dh) : ctx.drawImage(drawable, dx, dy, dw, dh);
      ctx.save();
      try {
        ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
        if (repeatWidth > 0 && width > 0) {
          ctx.beginPath(); ctx.rect(x, y, repeatWidth, height); ctx.clip();
          const repeating = seamlessRepeat ? this.repeatingImage(id, drawable, image.naturalWidth, image.naturalHeight) : null;
          const pattern = repeating && ctx.createPattern?.(repeating, 'repeat-x');
          if (pattern) {
            const scaleX = width / image.naturalWidth, scaleY = height / image.naturalHeight, period = repeating.width * scaleX;
            const offset = ((scroll % period) + period) % period;
            ctx.translate(x - offset, y); ctx.scale(scaleX, scaleY); ctx.fillStyle = pattern;
            // One fill avoids antialias cracks at fractional tile boundaries.
            ctx.fillRect(offset / scaleX, 0, repeatWidth / scaleX, image.naturalHeight);
          } else {
            const offset = ((scroll % width) + width) % width;
            for (let tileX = x - offset; tileX < x + repeatWidth; tileX += width) paint(tileX, y, width, height);
          }
        } else if (fit === 'contain' && image.naturalHeight > 0) {
          const sourceWidth = crop?.[2] || image.naturalWidth, sourceHeight = crop?.[3] || image.naturalHeight;
          const scale = Math.min(width / sourceWidth, height / sourceHeight), dw = sourceWidth * scale, dh = sourceHeight * scale;
          paint(x + (width - dw) / 2, y + (height - dh) / 2, dw, dh);
        } else paint(x, y, width, height);
      } finally { ctx.restore(); }
      source = 'image';
    } else fallback?.(ctx, x, y, width, height);
    this.usage[id] = source;
    return source;
  }
}
