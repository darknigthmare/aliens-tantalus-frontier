import { WEAPONS } from './content-core-v50.js';
import { resolveWeaponMechanicsV122 } from './weapon-mechanics-weapons-v122.js';

const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
};
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const normalized = value => typeof value === 'string' ? value.trim().toLowerCase() : '';

/** Sources establish ammunition/mechanism only. All colors, dimensions, light
 * radii and times in this module are original world-pixel/second game tuning.
 * No firing rates, capacities, damage or reload inventory rules are changed. */
export const WEAPON_PRESENTATION_SOURCES_V124 = freeze({
  'm41a-manual': {
    title: 'Alien vs. Predator — Atari Jaguar game manual (1994), Marine Arsenal',
    url: 'https://atariage.com/manual_html_page.php?SoftwareID=2538',
    authority: 'licensed-game-manual', access: 'archived-primary-document-transcription',
    scope: 'M41A uses 10 × 24 mm caseless ammunition; no claim about other models.',
    checkedAt: '2026-10-12'
  },
  'm56-report': {
    title: 'S. D. Perry — Alien: The Weyland-Yutani Report, M56A Smartgun diagram',
    url: 'https://insighteditions.com/collections/film-tv/products/alien-the-weyland-yutani-report-2',
    excerptUrl: 'https://waynesbooks.games/2021/05/08/aliens-1986-why-is-the-m56a-called-the-smartgun/',
    imageUrl: 'https://i0.wp.com/waynesbooks.games/wp-content/uploads/2021/05/m56a-smartgun-1.jpg?resize=600%2C800&ssl=1',
    authority: 'licensed-reference-book', access: 'primary-page-photograph-viewed-on-third-party-site',
    scope: 'The photographed diagram identifies M250 10 × 28 mm caseless rounds for the M56A.',
    checkedAt: '2026-10-12'
  },
  'fireball-developer': {
    title: 'Cold Iron Studios — Aliens: Fireteam Elite, Season 3 Deep Dive',
    url: 'https://www.aliensfireteamelite.com/en/community/afe-season-3-deep-dive/',
    authority: 'official-developer', access: 'primary-page',
    scope: 'X1 Fireball launches D17 gel that explodes on impact; not a continuous fuel jet.',
    checkedAt: '2026-10-12'
  }
});

const muzzle = (kind, color, radius, intensity, duration) => freeze({
  kind, color, radius, intensity, duration,
  reducedMotionIntensity: Math.min(intensity, 0.18)
});
const LIGHT = freeze({
  none: muzzle('none', '#000000', 0, 0, 0),
  pistol: muzzle('flash', '#ffc67b', 96, 0.48, 0.055),
  rifle: muzzle('flash', '#ffd398', 128, 0.64, 0.065),
  shotgun: muzzle('flash', '#ffbd72', 158, 0.74, 0.075),
  heavy: muzzle('flash', '#ffdbaa', 172, 0.78, 0.075),
  launcher: muzzle('flash', '#ffb16c', 142, 0.68, 0.09),
  gel: muzzle('flash', '#ffb363', 116, 0.56, 0.09),
  flame: muzzle('flame', '#ff9c4c', 166, 0.56, 0.11),
  torch: muzzle('flame', '#87dfff', 62, 0.28, 0.09),
  energy: muzzle('energy', '#87dcff', 128, 0.55, 0.08),
  plasma: muzzle('energy', '#80efce', 146, 0.62, 0.095),
  laser: muzzle('energy', '#ff8079', 100, 0.44, 0.06),
  electric: muzzle('energy', '#b1cfff', 108, 0.48, 0.07)
});

const casing = (kind, length, radius, color, shape = 'cylinder', ejectOn = 'shot', delay = 0) => freeze({
  kind, size: { length, radius }, color, shape, ejectOn, delay
});
const CASE = freeze({
  pistol: casing('pistol', 3.6, 0.8, '#cba568'),
  rifle: casing('rifle', 5.1, 0.85, '#c6a164'),
  shotgun: casing('shotgun', 6.1, 1.15, '#ba5543', 'shell'),
  pump: casing('shotgun', 6.1, 1.15, '#ba5543', 'shell', 'cycle', 0.18),
  revolver: casing('pistol', 4.2, 0.85, '#cba568', 'cylinder', 'reload'),
  heavy: casing('heavy', 6.8, 1.15, '#b89963'),
  grenade: casing('heavy', 5.5, 1.6, '#a68c62', 'stub')
});

/** Discarding an empty container is cosmetic. A revolver keeps spent cases
 * until reload; a tube-fed shotgun has no detachable magazine to discard.
 * The caller supplies actual spent rounds and emits only after this phase. */
const reload = (feed, discard = 'none', ejectCount = discard === 'none' ? 0 : 1) => freeze({
  feed, discard, ejectCount, emptyOnly: true, discardAt: 0.35
});
const RELOAD = freeze({
  none: reload('none'), box: reload('box', 'magazine'), drum: reload('drum', 'magazine'),
  tube: reload('tube'), cylinder: reload('cylinder', 'shell', 'spent'),
  cell: reload('cell', 'cell'), tank: reload('tank'), single: reload('single')
});

const visual = (mechanism, ammunition, shell, light, loading, extra = {}) => ({
  mechanism, ammunition, caliber: null, casing: shell, muzzle: light, reload: loading, ...extra
});
const STYLE = freeze({
  none: visual('none', 'none', null, LIGHT.none, RELOAD.none),
  melee: visual('melee', 'none', null, LIGHT.none, RELOAD.none),
  tool: visual('tool', 'none', null, LIGHT.none, RELOAD.none),
  torch: visual('cutting-torch', 'fuel', null, LIGHT.torch, RELOAD.tank),
  mechanical: visual('mechanical-projectile', 'projectile', null, LIGHT.none, RELOAD.single),
  pistol: visual('cased-ballistic', 'cased', CASE.pistol, LIGHT.pistol, RELOAD.box),
  rifle: visual('cased-ballistic', 'cased', CASE.rifle, LIGHT.rifle, RELOAD.box),
  heavy: visual('cased-ballistic', 'cased', CASE.heavy, LIGHT.heavy, RELOAD.drum),
  revolver: visual('revolver', 'cased', CASE.revolver, LIGHT.pistol, RELOAD.cylinder),
  pump: visual('pump-shotgun', 'cased', CASE.pump, LIGHT.shotgun, RELOAD.tube),
  shotgun: visual('cased-shotgun', 'cased', CASE.shotgun, LIGHT.shotgun, RELOAD.box),
  autoShotgun: visual('automatic-shotgun', 'cased', CASE.shotgun, LIGHT.shotgun, RELOAD.box),
  caseless: visual('caseless-ballistic', 'caseless', null, LIGHT.rifle, RELOAD.box),
  smartgun: visual('caseless-ballistic', 'caseless', null, LIGHT.heavy, RELOAD.drum),
  noEjectRifle: visual('ballistic-no-ejection', 'unspecified', null, LIGHT.rifle, RELOAD.box),
  sentry: visual('ballistic-no-ejection', 'unspecified', null, LIGHT.heavy, RELOAD.none),
  turret: visual('vehicle-weapon', 'unspecified', null, LIGHT.heavy, RELOAD.none),
  rocket: visual('rocket-launcher', 'projectile', null, LIGHT.launcher, RELOAD.single),
  grenade: visual('grenade-launcher', 'cased', CASE.grenade, LIGHT.launcher, RELOAD.drum),
  gel: visual('gel-projectile', 'gel', null, LIGHT.gel, RELOAD.tank),
  flame: visual('flamethrower', 'fuel', null, LIGHT.flame, RELOAD.tank),
  energy: visual('energy', 'energy', null, LIGHT.energy, RELOAD.cell),
  plasma: visual('plasma', 'energy', null, LIGHT.plasma, RELOAD.cell),
  laser: visual('laser', 'energy', null, LIGHT.laser, RELOAD.cell),
  electric: visual('electric', 'energy', null, LIGHT.electric, RELOAD.cell),
  fluid: visual('fluid-projector', 'fluid', null, LIGHT.none, RELOAD.tank)
});

const TUNING_NOTE = 'World-pixel sizes, case finishes, flash colors, intensity and timings are original Tantalus presentation tuning, not measured or certified source specifications.';
const inferred = (style, notes) => ({ style, status: 'gameplay-approximation', notes, sourceKeys: [] });
const derived = (style, notes) => ({ style, status: 'catalogue-derived', notes, sourceKeys: [] });
const conservative = (style, notes) => ({ style, status: 'conservative-fallback', notes, sourceKeys: [] });

function classifyCatalogue(weapon) {
  const baseName = normalized(weapon.name.split(' — ')[0]);
  if (baseName === 'm41a pulse rifle') return {
    style: 'caseless', status: 'documented-ammunition', sourceKeys: ['m41a-manual'], caliber: '10×24 mm',
    notes: 'Caseless primary rifle ammunition produces no spent case. This does not describe the separate underslung grenade launcher.'
  };
  if (baseName === 'm56 smartgun') return {
    style: 'smartgun', status: 'documented-ammunition', sourceKeys: ['m56-report'], caliber: '10×28 mm',
    notes: 'M250 caseless ammunition: no brass ejection. Live blank-firing production props do not determine in-world ammunition.'
  };
  if (resolveWeaponMechanicsV122(weapon)) return {
    style: 'gel', status: 'documented-mechanism', sourceKeys: ['fireball-developer'],
    notes: 'D17 gel projectile: a brief launch light, no continuous flame jet and no invented brass case.'
  };
  if (/pulse rifle/.test(baseName)) return inferred('caseless',
    'Pulse-family presentation follows the M41A caseless convention. This adaptation does not establish this model’s exact ammunition or caliber.');
  if (['m39 submachine gun', 'm42a scope rifle'].includes(baseName)) return conservative('noEjectRifle',
    'The catalogue does not specify a metallic case. Ejection is omitted without asserting a verified cartridge type.');
  if (weapon.family === 'sentry') return conservative('sentry',
    'The catalogue identifies a sentry, but does not document case ejection. No portable magazine is discarded.');
  if (baseName.includes('revolver')) return {
    ...derived('revolver', 'Revolver identity is explicit in the catalogue. Spent cases remain in the cylinder until an accepted reload.'),
    ...(baseName === '.357 magnum revolver' ? { caliber: '.357 Magnum' } : {})
  };
  if (baseName === 'm37a2 pump shotgun' || baseName === 'm51 breaching scattergun') return derived('pump',
    'Pump identity is in the name or catalogue description. One spent hull is emitted at the cycle event; 0.18 seconds is a presentation delay, not a certified mechanism measurement.');
  if (baseName === 'type 76 auto shotgun') return derived('autoShotgun',
    'Automatic shotgun identity is explicit in the catalogue. One hull per accepted shot, not per pellet; case finish, size and magazine presentation remain game tuning.');
  if (weapon.family === 'melee' || baseName === 'stun baton' || baseName === 'smart disc') return derived('melee',
    'A melee/throwing implement has neither a firearm muzzle flash nor a spent firearm cartridge.');
  if (baseName === 'cutting torch') return derived('torch', 'Fuel-fed cutting tool; blue working light is a game color choice.');
  if (weapon.family === 'tool') return derived('tool', 'Tool identity has no firearm cartridge.');
  if (['compound bow', 'harpoon gun', 'bolt gun', 'foundry nailgun'].includes(baseName)) return conservative('mechanical',
    'Bolt, arrow, harpoon or industrial fastener presentation. No metallic cartridge case or combustion flash is documented.');
  if (weapon.family === 'flame') return derived('flame', 'Fuel weapon: orange burner light, no brass and no disposable firearm magazine.');
  if (['acid', 'chemical', 'cryo'].includes(weapon.family)) return derived('fluid',
    'Fluid/cryo projector: no cartridge case. A colored projectile alone does not establish a luminous muzzle.');
  if (weapon.family === 'energy') return derived(baseName.includes('laser') ? 'laser' : baseName.includes('plasma') ? 'plasma' : 'energy',
    'Energy identity is explicit in the catalogue; no brass. Cell exchange and light appearance are presentation adaptations.');
  if (['electric', 'sonic'].includes(weapon.family)) return derived(weapon.family === 'electric' ? 'electric' : 'energy',
    'Electric/sonic catalogue family has no ballistic case. Local light and cell exchange are game presentation choices.');
  if (weapon.family === 'silent') return derived('mechanical', 'Silent projectile presentation, without a combustion flash or firearm case.');
  if (weapon.family === 'explosive') {
    if (/rpg|rocket|sadar/.test(baseName)) return derived('rocket', 'Rocket/projectile launcher identity: no rifle case or discarded box magazine.');
    if (baseName === 'm40 hedp grenade') return derived('none', 'The standalone grenade has no weapon muzzle or spent case.');
    if (baseName === 'm94 impact grenade') return conservative('rocket',
      'Historical saved name is ambiguous between grenade and launcher; preserve its projectile behavior without inventing case ejection.');
    return inferred('grenade', 'Grenade-launcher catalogue family. The short heavy spent case is an original visual approximation; caliber and cartridge construction are unverified.');
  }
  // Only explicit, reviewed addition tags carry weapon category. The historical
  // modulo-generated "heavy" tag is not evidence of a caliber or feed system.
  const tags = Number(weapon.id.match(/^weapon-(\d{3})-/)?.[1]) > 146 ? weapon.tags || [] : [];
  if (/shotgun|scattergun/.test(baseName) || tags.includes('shotgun')) return inferred('shotgun',
    'Shotgun catalogue identity: one colored hull per accepted shot, not one per pellet. Auto-feed timing and detachable magazine are presentation approximations where the feed is unspecified.');
  if (/pistol|sidearm/.test(baseName) || tags.includes('sidearm')) return inferred('pistol',
    'Pistol catalogue identity; a short metallic case is a visual approximation. No numeric caliber is claimed.');
  if (/minigun|autocannon|heavy assault/.test(baseName) || tags.includes('heavy')) return inferred('heavy',
    'Heavy ballistic catalogue identity; larger case and drum visuals are game approximations, not verified cartridge dimensions.');
  if (/submachine/.test(baseName) || tags.includes('smg')) return inferred('pistol',
    'Compact automatic-weapon identity; short case presentation does not establish a pistol-caliber chambering.');
  return inferred('rifle', 'Ballistic catalogue family; conventional rifle-case presentation where the cartridge is unspecified.');
}

function makeProfile(weapon, definition, identified = true) {
  return freeze({
    schema: 1, weaponId: weapon.id || null, name: weapon.name || '', family: weapon.family || '',
    ...STYLE[definition.style], ...(definition.caliber ? { caliber: definition.caliber } : {}),
    evidence: {
      status: definition.status, catalogueMatch: identified, sourceKeys: definition.sourceKeys,
      notes: definition.notes, tuning: TUNING_NOTE, canonExact: false,
      ...(weapon.mark && weapon.mark !== 'Standard' ? { finishVariant: 'Shares the base weapon mechanism; no separate ammunition specification.' } : {})
    }
  });
}

export const WEAPON_PRESENTATION_PROFILES_V124 = freeze(WEAPONS.map(weapon => makeProfile(weapon, classifyCatalogue(weapon))));
const byId = new Map();
const byName = new Map();
for (let index = 0; index < WEAPONS.length; index += 1) {
  const weapon = WEAPONS[index], profile = WEAPON_PRESENTATION_PROFILES_V124[index];
  byId.set(normalized(weapon.id), profile);
  byId.set(weapon.id.match(/^weapon-\d{3}/)[0], profile);
  byName.set(normalized(weapon.name), profile);
  if (weapon.canonicalName) byName.set(normalized(weapon.canonicalName), profile);
}

const fallbackStyles = freeze({
  sidearm: 'pistol', pistol: 'pistol', rifle: 'rifle', ballistic: 'rifle', 'generic-ballistic': 'rifle', heavy: 'heavy',
  shotgun: 'shotgun', revolver: 'revolver', 'pump-shotgun': 'pump',
  // Generic smart/sentry/turret descriptors do not certify a named weapon.
  smartgun: 'noEjectRifle', smart: 'noEjectRifle', sentry: 'sentry', 'apc-turret': 'turret',
  flame: 'flame', incinerator: 'flame', flamethrower: 'flame', energy: 'energy', electric: 'electric', sonic: 'energy',
  explosive: 'rocket', launcher: 'rocket', acid: 'fluid', cryo: 'fluid', chemical: 'fluid',
  melee: 'melee', 'neuro-melee': 'melee', unarmed: 'none', tool: 'tool', silent: 'mechanical'
});
export const WEAPON_PRESENTATION_FALLBACKS_V124 = freeze(Object.fromEntries(Object.entries(fallbackStyles).map(([name, style]) => [name,
  makeProfile({ name, family: name }, conservative(style,
    'Generic runtime descriptor only. Casing and light treatment are game defaults; no named model, caliber or source is inferred.'), false)
])));
const UNKNOWN = makeProfile({}, conservative('none', 'No recognized weapon identity or family; no speculative effect.'), false);

/** Accept a saved catalogue ID, exact catalogue name, equipped descriptor or
 * weaponProfile() result (weaponId/family/mode). Unknown numbered IDs NEVER wrap
 * modulo 40, and a mismatching ID cannot acquire a known model’s source receipt.
 * Returned profiles are immutable and never read or change actor ammunition. */
export function getWeaponPresentationProfileV124(weaponOrProfile = null) {
  const descriptor = record(weaponOrProfile) ? weaponOrProfile : null;
  if (descriptor && normalized(descriptor.mode) === 'apc-turret') return WEAPON_PRESENTATION_FALLBACKS_V124['apc-turret'];
  const id = normalized(descriptor ? descriptor.id || descriptor.weaponId || descriptor.catalogId : weaponOrProfile);
  if (byId.has(id)) return byId.get(id);
  const hasUnrecognizedId = descriptor ? Boolean(id) : /^weapon-/.test(id);
  if (!hasUnrecognizedId) {
    const name = normalized(descriptor ? descriptor.name || descriptor.canonicalName : weaponOrProfile);
    if (byName.has(name)) return byName.get(name);
  }
  const key = [id, descriptor?.family, descriptor?.mode, descriptor?.name].map(normalized)
    .find(candidate => Object.hasOwn(WEAPON_PRESENTATION_FALLBACKS_V124, candidate));
  const fallback = WEAPON_PRESENTATION_FALLBACKS_V124[key] || UNKNOWN;
  if (descriptor && (descriptor.caseless === true || descriptor.ammunition === 'caseless')) {
    const ballistic = ['rifle', 'ballistic', 'generic-ballistic', 'sidearm', 'pistol', 'heavy', 'smart', 'smartgun'].includes(key);
    if (ballistic) return freeze({ ...fallback, casing: null, caliber: null, mechanism: 'caseless-ballistic', ammunition: 'caseless',
      evidence: { ...fallback.evidence, status: 'descriptor-declared', notes: 'Explicit caseless runtime descriptor; no numeric caliber or external source inferred.' } });
  }
  if (descriptor?.noEject === true || descriptor?.ejectsCasings === false) return freeze({ ...fallback, casing: null });
  return fallback;
}
