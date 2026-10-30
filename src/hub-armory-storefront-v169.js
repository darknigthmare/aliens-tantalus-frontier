/**
 * Open-front armory storefront, V169: three authored visual adaptations.
 *
 * This is an OPTIONAL visual layer on the existing hub geometry. It does not
 * add a door, collider, NPC AI, inventory mutation, save schema or gameplay
 * interaction. Only an admitted physical contact may open the existing shop.
 *
 * Source sheets are in the companion art pack:
 *   ARMURERIES_TANTALUS_3_VARIANTES_SPRITES_V169.zip
 * and are not canon/film captures. The game falls back to the original native
 * room art if full-resolution, reviewed sheets have not been installed.
 */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const v of Object.values(value)) freeze(v);
    Object.freeze(value);
  }
  return value;
};
const valid = number => Number.isFinite(number);
const rect = (x, y, w, h) => freeze({ x, y, w, h });
export const ARMORY_ART_CANVAS_V169 = freeze({ w: 1448, h: 1086 });
export const ARMORY_STOREFRONT_SOURCE_V169 = freeze({
  tantalus: '/assets/openai/hub/armory-v169/tantalus_source_1448x1086.png',
  colony: '/assets/openai/hub/armory-v169/colony_source_1448x1086.png',
  station: '/assets/openai/hub/armory-v169/station_source_1448x1086.png'
});
export const ARMORY_STOREFRONT_SOURCE_SHA256_V169 = freeze({
  tantalus: 'ce5d979dc84c4b8d34c0f8b5403abd6b3ec706e0cd50c819222be9cf323c1767',
  colony: 'de220600940eec4471ac93e09a5a2d023f8c64f2b40c1fb6c1a8a969010f33c8',
  station: '93d3d1c56463f8379ce063fa2721bddf2bba58fe435de4161c25b66d29bbb987'
});

const crop = (id, group, source) => ({ id, group, source: rect(...source) });
export const ARMORY_SPRITE_CROPS_V169 = freeze([
  crop('storefront-open-reference', 'reference', [0, 0, 1218, 430]),
  crop('vendor-standing', 'npc-concept', [1234, 70, 164, 274]),
  crop('vendor-counter', 'npc-concept', [1228, 333, 220, 95]),
  crop('main-sign', 'facade', [5, 433, 695, 112]),
  crop('canopy', 'facade', [694, 433, 426, 116]),
  crop('shutter', 'facade', [721, 503, 377, 157]),
  crop('rear-wall', 'architecture', [16, 546, 582, 101]),
  crop('right-pillar', 'facade', [1120, 435, 146, 273]),
  crop('vertical-banner', 'facade', [1270, 432, 178, 258]),
  crop('floor-a', 'floor', [6, 653, 211, 69]),
  crop('floor-b', 'floor', [218, 653, 203, 69]),
  crop('floor-c', 'floor', [422, 653, 201, 69]),
  crop('floor-d', 'floor', [626, 653, 198, 69]),
  crop('floor-e', 'floor', [827, 653, 195, 69]),
  crop('floor-f', 'floor', [1025, 653, 170, 69]),
  crop('glass-counter', 'fixtures', [8, 722, 361, 134]),
  crop('checkout-terminal', 'fixtures', [365, 710, 110, 154]),
  crop('weapon-rack-a', 'fixtures', [477, 715, 170, 144]),
  crop('weapon-rack-b', 'fixtures', [644, 715, 174, 145]),
  crop('ammo-wall', 'fixtures', [814, 716, 231, 144]),
  crop('locker-cluster', 'fixtures', [1041, 715, 397, 156]),
  crop('supply-monitor', 'fixtures', [7, 878, 91, 115]),
  crop('vendor-chair', 'fixtures', [94, 869, 77, 107]),
  crop('hanging-light', 'fixture-light', [166, 856, 160, 79]),
  crop('pipe-elbows', 'architecture', [386, 859, 119, 128]),
  crop('service-vent', 'architecture', [503, 862, 160, 94]),
  crop('utility-cases', 'fixtures', [706, 870, 359, 103]),
  crop('equipment-cases', 'fixtures', [8, 982, 322, 102]),
  crop('armor-dummy', 'fixtures', [317, 861, 93, 222]),
  crop('small-accessories', 'fixtures', [610, 976, 396, 109]),
  crop('supply-packs', 'fixtures', [1009, 970, 223, 115]),
  crop('service-decals', 'facade', [1228, 970, 219, 115])
]);

// Position is room-local; doors, ladders, contacts and all native colliders
// remain owned by their respective existing world/annex runtimes.
export const ARMORY_STOREFRONT_VARIANTS_V169 = freeze({
  tantalus: {
    roomId: 'armory', worldWidth: 1280, floorY: 930,
    vendorIdentity: 'sanaa-doyle-existing-native-npc',
    vendorStatus: 'native-present-no-duplicate-sprite',
    sourceStatus: 'project-visual-adaptation-not-1to1',
    shopContact: null,
    layout: [
      ['rear-wall', 370, 620, 530, 115],
      ['main-sign', 365, 486, 570, 94],
      ['canopy', 918, 492, 180, 94],
      ['weapon-rack-a', 380, 714, 153, 132],
      ['weapon-rack-b', 566, 718, 145, 126],
      ['ammo-wall', 770, 714, 165, 126],
      ['locker-cluster', 962, 712, 144, 140],
      ['glass-counter', 590, 825, 286, 98],
      ['checkout-terminal', 882, 797, 72, 115],
      ['hanging-light', 592, 670, 152, 38]
    ]
  },
  colony: {
    roomId: 'port-meridien-quay', worldWidth: 2560, floorY: 624,
    vendorIdentity: 'frontier-supply-concept',
    vendorStatus: 'concept-only-needs-native-NPC-rig',
    sourceStatus: 'project-visual-adaptation-not-1to1',
    // Plot is beyond the existing port gate. No opening/escort phase override.
    shopContact: rect(2240, 540, 110, 84),
    layout: [
      ['rear-wall', 1995, 352, 510, 114],
      ['main-sign', 1985, 317, 520, 69],
      ['weapon-rack-a', 2030, 427, 130, 101],
      ['ammo-wall', 2159, 425, 130, 104],
      ['locker-cluster', 2394, 413, 102, 137],
      ['glass-counter', 2240, 523, 210, 94],
      ['checkout-terminal', 2318, 464, 63, 75],
      ['vendor-standing', 2262, 432, 60, 125]
    ]
  },
  station: {
    roomId: 'frontier-civil-counter', worldWidth: 1920, floorY: 624,
    vendorIdentity: 'nexus-armorer-concept',
    vendorStatus: 'concept-only-needs-native-NPC-rig',
    sourceStatus: 'project-visual-adaptation-not-1to1',
    // This is a visual/shop proposal within the existing civil service bay;
    // no interaction is admitted until the native annex geometry is reviewed.
    shopContact: null,
    layout: [
      ['rear-wall', 716, 354, 508, 113],
      ['main-sign', 722, 308, 512, 71],
      ['weapon-rack-a', 755, 437, 132, 102],
      ['ammo-wall', 913, 435, 133, 102],
      ['locker-cluster', 1094, 424, 127, 136],
      ['glass-counter', 920, 521, 213, 95],
      ['checkout-terminal', 1030, 470, 62, 72],
      ['vendor-standing', 975, 435, 59, 119]
    ]
  }
});

const cropById = freeze(Object.fromEntries(ARMORY_SPRITE_CROPS_V169.map(entry => [entry.id, entry])));
const inBounds = (v, dim) => valid(v.x) && valid(v.y) && valid(v.w) && valid(v.h)
  && v.x >= 0 && v.y >= 0 && v.w > 0 && v.h > 0
  && v.x + v.w <= dim.w && v.y + v.h <= dim.h;

export function validateArmoryStorefrontV169() {
  const failures = [];
  if (new Set(ARMORY_SPRITE_CROPS_V169.map(c => c.id)).size !== ARMORY_SPRITE_CROPS_V169.length)
    failures.push('duplicate-crop');
  for (const c of ARMORY_SPRITE_CROPS_V169) if (!inBounds(c.source, ARMORY_ART_CANVAS_V169))
    failures.push('crop-out-of-bounds:' + c.id);
  for (const [variant, definition] of Object.entries(ARMORY_STOREFRONT_VARIANTS_V169)) {
    if (!ARMORY_STOREFRONT_SOURCE_SHA256_V169[variant] || definition.sourceStatus.includes('1to1-approved'))
      failures.push('unreviewed-source-status:' + variant);
    for (const [id, x, y, width, height] of definition.layout) {
      if (!cropById[id]) failures.push('unknown-crop:' + variant + ':' + id);
      if (!inBounds({ x, y, w: width, h: height }, { w: definition.worldWidth, h: definition.floorY }))
        failures.push('layout-out-of-bounds:' + variant + ':' + id);
    }
    if (variant === 'tantalus' && definition.layout.some(entry => entry[0].startsWith('vendor')))
      failures.push('duplicate-native-vendor');
  }
  return { valid: failures.length === 0, failures,
    variants: Object.keys(ARMORY_STOREFRONT_VARIANTS_V169).length,
    crops: ARMORY_SPRITE_CROPS_V169.length };
}

/** Does not allocate an Image or modify state. Caller controls loading/lifecycle. */
export function getArmoryStorefrontPlanV169(roomId) {
  const variant = Object.keys(ARMORY_STOREFRONT_VARIANTS_V169)
    .find(key => ARMORY_STOREFRONT_VARIANTS_V169[key].roomId === roomId);
  if (!variant) return null;
  const definition = ARMORY_STOREFRONT_VARIANTS_V169[variant];
  return { schema: 169, variant, roomId, atlas: ARMORY_STOREFRONT_SOURCE_V169[variant],
    atlasSha256: ARMORY_STOREFRONT_SOURCE_SHA256_V169[variant],
    assets: definition.layout.map(([id, x, y, w, h]) => ({ id, layer: cropById[id].group,
      src: cropById[id].source, dest: rect(x, y, w, h) })),
    vendorIdentity: definition.vendorIdentity, vendorStatus: definition.vendorStatus,
    sourceStatus: definition.sourceStatus, collision: 'none', gameplayChanges: false };
}

/** Render only reviewed-size artwork. Missing/unready atlases NEVER create a
 * procedural stand-in and the existing room/interaction draws normally. */
export function drawArmoryStorefrontV169(ctx, image, plan, { originX = 0, phase = 'back' } = {}) {
  if (!ctx || !plan || !image || image.naturalWidth !== ARMORY_ART_CANVAS_V169.w
    || image.naturalHeight !== ARMORY_ART_CANVAS_V169.h || !image.complete
    || !valid(originX)) return { drawn: 0, reason: 'unavailable-or-unverified-atlas' };
  let drawn = 0;
  ctx.save();
  for (const item of plan.assets) {
    if (phase === 'front' && item.layer !== 'facade') continue;
    if (phase !== 'front' && item.layer === 'facade') continue;
    const a = item.src, b = item.dest;
    ctx.drawImage(image, a.x, a.y, a.w, a.h, originX + b.x, b.y, b.w, b.h);
    drawn++;
  }
  ctx.restore();
  return { drawn, reason: null };
}

export function getArmoryStoreContactV169({ roomId, x, y, alive, missionPhase, gameplayBlocked = false } = {}) {
  const plan = getArmoryStorefrontPlanV169(roomId);
  if (!plan || !alive || gameplayBlocked || !valid(x) || !valid(y)) return null;
  const vendor = ARMORY_STOREFRONT_VARIANTS_V169[plan.variant];
  const bounds = vendor.shopContact;
  if (!bounds || plan.variant === 'colony' && missionPhase !== 'complete') return null;
  if (Math.abs(x - (bounds.x + bounds.w / 2)) > 82
    || Math.abs(y - (bounds.y + bounds.h)) > 100) return null;
  return { action: 'armory:open-shop-v169', variant: plan.variant,
    roomId, contactId: 'armory-shopfront-' + plan.variant,
    prompt: 'E — CONSULTER LE COMPTOIR', source: 'native-contact-v169' };
}
