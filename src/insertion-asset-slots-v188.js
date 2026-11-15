// V188 — named art slots for the mission insertion / extraction cinematics.
// Image generation is deferred (owner decision 2026-11-15): every visual of the
// sequence is drawn with Canvas primitives as a PLACEHOLDER and routed through
// one of these slots. When an image is later produced for a slot, commit it at
// the slot's path AND add the slot id to INSERTION_ASSET_FILES_PRESENT_V188: only
// listed slots are ever requested, so the game never asks the network for a
// file that is not in the repository. Briefs describe documented references
// from Aliens (1986) and the project's adaptations; a generated image would not
// certify any franchise fidelity. Slot list: docs/development/INSERTION_ART_SLOTS_V188.md.

export const INSERTION_ASSET_ROOT_V188 = '/assets/insertion/v188/';
export const INSERTION_ASSET_LAYERS_V188 = Object.freeze(['background', 'parallax', 'midground', 'actor', 'fx', 'foreground', 'overlay']);

const slot = (id, layer, width, height, purpose, brief) => Object.freeze({
  id, layer, width, height, purpose, brief, path: `${INSERTION_ASSET_ROOT_V188}${id}.png`
});

export const INSERTION_ASSET_SLOTS_V188 = Object.freeze([
  slot('starfield-deep', 'parallax', 2048, 1024, 'Far star layer behind every space shot; scrolled slowly for parallax.',
    'Deep-space star field, sparse cold white and pale blue points, no nebula colours, no galaxies; tileable horizontally; black background.'),
  slot('tantalus-drop-bay', 'background', 1280, 720, 'Bay shot: the USS Tantalus drop bay seen from the gantry, dropship hanging from its clamp.',
    'Project adaptation of the orbital drop-bay idea in Aliens (1986), NOT the Sulaco: industrial hangar, ribbed bulkheads, red work lights, yellow-black hazard edges, overhead rail and clamp; open bay doors at the bottom show stars; leave the dropship out (drawn on its own slot).'),
  slot('tantalus-hull-exterior', 'midground', 1600, 500, 'Release and return shots: the underside of the Tantalus with the bay doors open.',
    'Long blocky military transport hull seen from below, grey-olive plating, antenna masts, a lit rectangular drop-bay opening near the bow; side view, transparent background.'),
  slot('ud4l-side', 'actor', 640, 240, 'The UD-4L Cheyenne in side profile (release, approach, landing, lift-off).',
    'UD-4L Cheyenne dropship side profile as seen in Aliens (1986): angular hull, chin turret under the cockpit, stub wings with weapon pods, twin tail booms with twin fins, rear ramp; olive-drab with worn markings; transparent background; ramp closed; no APC.'),
  slot('ud4l-front', 'actor', 480, 320, 'Atmospheric entry shot: the dropship nose-on, the heat sheath drawn separately.',
    'UD-4L Cheyenne seen three-quarter front, slightly from below, chin turret, cockpit glazing, stub wings; dark hull; transparent background.'),
  slot('m577-side', 'actor', 360, 150, 'The M577 APC carried under the dropship belly, then released at landing.',
    'M577 armoured personnel carrier side profile as seen in Aliens (1986): long low wedge hull, four large road wheels per side, roof turret at the rear, side door; olive-drab; transparent background.'),
  slot('ud4l-cockpit', 'foreground', 1280, 720, 'Cockpit frame over the live screens and the canopy view.',
    'UD-4L cockpit interior seen from behind the pilots: canopy struts, dark consoles, two seats, a central pedestal; window areas and the four screen bays fully transparent so live data shows through.'),
  slot('crt-bezel', 'overlay', 420, 300, 'Bezel drawn around each live CRT display.',
    'Military CRT monitor bezel, chunky black-grey plastic, rounded screen corners, small push buttons under the glass; the screen area is transparent.'),
  slot('ud4l-troop-bay', 'background', 1280, 720, 'Troop bay shot: harness seats along the hull, red cabin light.',
    'Cramped dropship troop compartment as in Aliens (1986): two rows of facing seats with drop-down harness bars, red lighting, hull ribs, stowed rifles, a small status monitor; empty seats (marines drawn separately).'),
  slot('marine-seated', 'actor', 52, 80, 'One marine strapped in a harness seat, repeated along the bay (1 m ≈ 51 px).',
    'Colonial marine in armour seated with the harness bar down, side view, helmet on, rifle upright; scale matches a 44×92 px standing marine; transparent background.'),
  slot('planet-limb', 'background', 1600, 900, 'Orbit shot over a planet with an atmosphere; tinted per world.',
    'Planet curvature seen from low orbit, thin glowing atmosphere limb, cloud bands; neutral grey tones so the game can tint it per world; black space above.'),
  slot('moon-limb', 'background', 1600, 900, 'Orbit shot over an airless moon or asteroid; tinted per world.',
    'Airless rocky body seen from low orbit, sharp horizon with no atmosphere glow, craters and ridges, hard shadows; neutral grey.'),
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
    'Dropship pilot in a flight helmet with the visor up and a boom microphone, monochrome green CRT rendering, head and shoulders.')
]);
export const INSERTION_ASSET_SLOT_IDS_V188 = Object.freeze(INSERTION_ASSET_SLOTS_V188.map(entry => entry.id));

// Slots whose PNG is committed under INSERTION_ASSET_ROOT_V188. Empty until the
// art is produced; a test checks that every listed file exists in the repository.
export const INSERTION_ASSET_FILES_PRESENT_V188 = Object.freeze([]);

export function getInsertionAssetSlotV188(id) {
  return INSERTION_ASSET_SLOTS_V188.find(entry => entry.id === id) || null;
}

/** Real image when one is committed for the slot, the primitive drawing otherwise. */
export class InsertionAssetLoaderV188 {
  constructor({ ImageCtor = globalThis.Image, present = INSERTION_ASSET_FILES_PRESENT_V188 } = {}) {
    this.ImageCtor = ImageCtor; this.present = new Set(present); this.images = new Map(); this.requested = [];
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
  image(id) {
    const image = this.images.get(id);
    return image?.complete && image.naturalWidth > 0 ? image : null;
  }
  /** Draw the slot into the box; returns 'image' or 'primitive'. */
  draw(ctx, id, x, y, width, height, fallback) {
    if (!getInsertionAssetSlotV188(id)) throw new Error(`Unknown insertion art slot: ${id}`);
    const image = this.image(id);
    let source = 'primitive';
    if (image) { ctx.drawImage(image, x, y, width, height); source = 'image'; }
    else fallback?.(ctx, x, y, width, height);
    this.usage[id] = source;
    return source;
  }
}
