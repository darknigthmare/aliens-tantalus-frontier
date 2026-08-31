import {
  ENEMY_VISUAL_OVERRIDE_ARCHETYPES_V64,
  ENEMY_VISUAL_OVERRIDE_BASE_PROFILE_IDS_V64,
  resolveEnemyVisualOverrideV64
} from './enemy-visual-overrides-v64.js';
import { resolveEnemyVisualOverrideV56 } from './enemy-visual-overrides-v56.js';
import { resolveEnemyVisualOverrideV55 } from './enemy-visual-overrides-v55.js';
import { resolveEnemyProfileVisualV65 } from './enemy-profile-registry-v65.js';
import { resolveEnemyProfileVisualV66 } from './enemy-profile-registry-v66.js';

const MODIFIER_PREFIXES = Object.freeze([
  'Acid-Blooded', 'Cryo-Adapted', 'Vacuum-Adapted', 'Neuro-Linked',
  'Hive Guard', 'Standard', 'Albino', 'Armored', 'Apex', 'Juvenile', 'Elder'
]);

export const ENEMY_VISUAL_IDENTITY = Object.freeze({
  exact: 'exact',
  family: 'authored-family',
  missing: 'missing-dedicated-art'
});

const profile = ({
  spriteKey,
  imageKey = null,
  row = null,
  sheetId = null,
  identityStatus,
  artSubject,
  fallbackReason = null,
  legacy = false,
  sourceFacing = 1
}) => Object.freeze({
  spriteKey,
  imageKey,
  row,
  sheetId,
  identityStatus,
  artSubject,
  fallbackReason,
  legacy,
  sourceFacing
});

const modern = (spriteKey, sheetId, identityStatus, artSubject, fallbackReason = null) => profile({
  spriteKey, sheetId, identityStatus, artSubject, fallbackReason
});

const legacy = (imageKey, row, identityStatus, artSubject, fallbackReason = null) => profile({
  spriteKey: 'legacy', imageKey, row, identityStatus, artSubject, fallbackReason, legacy: true
});

const familyReason = (subject, family) => `La planche ${family} couvre la famille de ${subject}, sans identité animée dédiée à cette variante.`;
const missingReason = (subject, fallback) => `Aucune planche dédiée validée pour ${subject}; ${fallback} reste un fallback explicitement signalé.`;
const missingXeno = (subject) => modern(
  'xenoDrone',
  'enemy.xenomorph-drone.locomotion',
  ENEMY_VISUAL_IDENTITY.missing,
  subject,
  missingReason(subject, 'la silhouette Drone')
);

const REGISTRY = Object.freeze({
  Ovomorph: missingXeno('Ovomorph'),
  Facehugger: modern('facehugger', 'enemy.facehugger.locomotion', ENEMY_VISUAL_IDENTITY.exact, 'Facehugger'),
  Chestburster: missingXeno('Chestburster'),
  'Drone / Big Chap': modern(
    'xenoDrone',
    'enemy.xenomorph-drone.locomotion',
    ENEMY_VISUAL_IDENTITY.family,
    'Drone / Big Chap',
    familyReason('Drone / Big Chap', 'Drone')
  ),
  Warrior: modern(
    'xenoWarrior',
    'enemy.xenomorph-warrior.combat',
    ENEMY_VISUAL_IDENTITY.family,
    'Warrior',
    'La planche Warrior couvre le combat; la locomotion réutilise encore la planche Drone.'
  ),
  Runner: modern('xenoRunner', 'enemy.xenomorph-runner.action', ENEMY_VISUAL_IDENTITY.exact, 'Runner'),
  Praetorian: missingXeno('Praetorian'),
  Queen: modern(
    'xenoQueen',
    'enemy.xenomorph-queen.combat',
    ENEMY_VISUAL_IDENTITY.family,
    'Queen',
    'La Queen possède une planche de combat, mais pas encore une locomotion complète validée.'
  ),
  Crusher: missingXeno('Crusher'),
  Spitter: missingXeno('Spitter'),
  Lurker: missingXeno('Lurker'),
  Carrier: missingXeno('Carrier'),
  Ravager: missingXeno('Ravager'),
  Boiler: missingXeno('Boiler'),
  Prowler: missingXeno('Prowler'),
  Burster: missingXeno('Burster'),
  'Monica Line': missingXeno('Monica Line'),
  'Specimen Six Line': missingXeno('Specimen Six Line'),

  'Red Xenomorph': legacy('neuroXeno', 0, ENEMY_VISUAL_IDENTITY.exact, 'Red Xenomorph'),
  'K-Series Yellow Xenomorph': legacy('neuroXeno', 1, ENEMY_VISUAL_IDENTITY.exact, 'K-Series Yellow Xenomorph'),
  'Neuro-Xeno Drone': legacy(
    'neuroXeno', 3, ENEMY_VISUAL_IDENTITY.family, 'Neuro-Xeno Drone', familyReason('Neuro-Xeno Drone', 'ATARAX/neuro-liée')
  ),
  Xenoborg: legacy('neuroXeno', 2, ENEMY_VISUAL_IDENTITY.family, 'Xenoborg', familyReason('Xenoborg', 'Xenoborg/Ripper')),
  'ATARAX Ripper': legacy('neuroXeno', 2, ENEMY_VISUAL_IDENTITY.family, 'ATARAX Ripper', familyReason('ATARAX Ripper', 'Xenoborg/Ripper')),
  'Ripper Queen': modern('ripperQueen', 'enemy.ripper-queen.action', ENEMY_VISUAL_IDENTITY.exact, 'Ripper Queen'),
  'Foundry Drone': missingXeno('Foundry Drone'),
  'Foundry Crusher': missingXeno('Foundry Crusher'),
  'Reef Stalker': missingXeno('Reef Stalker'),
  'Reef Spitter': missingXeno('Reef Spitter'),
  'Siege Royal': missingXeno('Siege Royal'),
  'Pale Crucible Hunter': modern(
    'paleCrucibleHunter',
    'enemy.pale-crucible-hunter.action',
    ENEMY_VISUAL_IDENTITY.exact,
    'Pale Crucible Hunter'
  ),
  'Dust Runner': modern(
    'xenoRunner',
    'enemy.xenomorph-runner.action',
    ENEMY_VISUAL_IDENTITY.family,
    'Dust Runner',
    familyReason('Dust Runner', 'Runner')
  ),
  'Salvage Hive Brute': missingXeno('Salvage Hive Brute'),
  'Arcology Lurker': missingXeno('Arcology Lurker'),
  'Caravan Stalker': missingXeno('Caravan Stalker'),

  'Trilobite Echo': legacy('pathogen', 2, ENEMY_VISUAL_IDENTITY.family, 'Trilobite Echo', familyReason('Trilobite Echo', 'Trilobite/Abomination')),
  'Deacon Line': legacy('pathogen', 1, ENEMY_VISUAL_IDENTITY.family, 'Deacon Line', familyReason('Deacon Line', 'Deacon/Protomorph')),
  Neomorph: modern('neomorph', 'enemy.neomorph.locomotion', ENEMY_VISUAL_IDENTITY.exact, 'Neomorph'),
  Protomorph: legacy('pathogen', 1, ENEMY_VISUAL_IDENTITY.family, 'Protomorph', familyReason('Protomorph', 'Deacon/Protomorph')),
  Abomination: legacy('pathogen', 2, ENEMY_VISUAL_IDENTITY.family, 'Abomination', familyReason('Abomination', 'Trilobite/Abomination')),
  'Pathogen Mimic': modern(
    'pathogenMimic',
    'enemy.pathogen-mimic.action',
    ENEMY_VISUAL_IDENTITY.exact,
    'Pathogen Mimic'
  ),

  'Working Joe': modern('workingJoe', 'enemy.working-joe.combat', ENEMY_VISUAL_IDENTITY.exact, 'Working Joe'),
  'Combat Synthetic': legacy('synthetic', 2, ENEMY_VISUAL_IDENTITY.exact, 'Combat Synthetic'),
  'Weyland-Yutani Commando': legacy('human', 1, ENEMY_VISUAL_IDENTITY.family, 'Weyland-Yutani Commando', familyReason('Weyland-Yutani Commando', 'corporate commando')),
  'UPP Vanguard': legacy('human', 2, ENEMY_VISUAL_IDENTITY.family, 'UPP Vanguard', familyReason('UPP Vanguard', 'sécurité UPP/Seegson')),
  'Seegson Security': legacy('human', 2, ENEMY_VISUAL_IDENTITY.family, 'Seegson Security', familyReason('Seegson Security', 'sécurité UPP/Seegson')),
  'Colonial Raider': legacy('human', 3, ENEMY_VISUAL_IDENTITY.family, 'Colonial Raider', familyReason('Colonial Raider', 'raider/ATARAX')),
  'ATARAX Controller': legacy('human', 3, ENEMY_VISUAL_IDENTITY.family, 'ATARAX Controller', familyReason('ATARAX Controller', 'raider/ATARAX')),
  'Cult Host': legacy('human', 3, ENEMY_VISUAL_IDENTITY.missing, 'Cult Host', missingReason('Cult Host', 'la ligne raider/ATARAX')),

  'Wild Boar Host': legacy('pathogen', 3, ENEMY_VISUAL_IDENTITY.family, 'Wild Boar Host', familyReason('Wild Boar Host', 'faune de frontière')),
  'Korari Stalker': legacy('pathogen', 3, ENEMY_VISUAL_IDENTITY.family, 'Korari Stalker', familyReason('Korari Stalker', 'faune de frontière')),
  'Ceto Reef Predator': legacy('pathogen', 3, ENEMY_VISUAL_IDENTITY.family, 'Ceto Reef Predator', familyReason('Ceto Reef Predator', 'faune de frontière')),
  'Tantalus Tunnel Vermin': legacy('pathogen', 3, ENEMY_VISUAL_IDENTITY.family, 'Tantalus Tunnel Vermin', familyReason('Tantalus Tunnel Vermin', 'faune de frontière'))
});

export const ENEMY_VISUAL_ARCHETYPES = Object.freeze([
  ...Object.keys(REGISTRY),
  ...ENEMY_VISUAL_OVERRIDE_ARCHETYPES_V64
]);
export const ENEMY_VISUAL_PROFILE_COUNT = ENEMY_VISUAL_ARCHETYPES.length;
export const ENEMY_VISUAL_PROFILES = REGISTRY;

export function resolveEnemyArchetype(source = {}) {
  const rawName = typeof source === 'string'
    ? source.trim()
    : String(source.name ?? source.archetype ?? '').trim();
  if (!rawName) return '';
  if (REGISTRY[rawName]) return rawName;

  const requestedModifier = String(source.modifier ?? '').trim();
  const prefixes = requestedModifier
    ? [requestedModifier, ...MODIFIER_PREFIXES.filter((prefix) => prefix !== requestedModifier)]
    : MODIFIER_PREFIXES;
  for (const prefix of prefixes) {
    const marker = `${prefix} `;
    if (!rawName.startsWith(marker)) continue;
    const candidate = rawName.slice(marker.length).trim();
    if (REGISTRY[candidate]) return candidate;
  }

  return ENEMY_VISUAL_ARCHETYPES
    .filter((archetype) => rawName.startsWith(`${archetype} `))
    .sort((a, b) => b.length - a.length)[0] ?? rawName;
}

const unknownFamilyProfile = (source, archetype) => {
  const biology = String(source.biology ?? '').toLowerCase();
  const subject = archetype || `inconnu:${biology || 'xenomorph'}`;
  if (source.caste === 'royal' || /queen|reine/i.test(subject)) {
    return modern(
      'xenoQueen',
      'enemy.xenomorph-queen.combat',
      ENEMY_VISUAL_IDENTITY.missing,
      subject,
      `Archétype royal inconnu (${subject}); fallback Queen explicitement signalé.`
    );
  }
  if (biology === 'xenomorph' && /warrior|guerrier/i.test(subject)) {
    return modern(
      'xenoWarrior',
      'enemy.xenomorph-warrior.combat',
      ENEMY_VISUAL_IDENTITY.missing,
      subject,
      `Archétype Warrior inconnu (${subject}); fallback Warrior explicitement signalé.`
    );
  }
  if (biology === 'synthetic') return legacy('synthetic', 2, ENEMY_VISUAL_IDENTITY.missing, subject, missingReason(subject, 'la ligne Combat Synthetic'));
  if (biology === 'human') return legacy('human', 0, ENEMY_VISUAL_IDENTITY.missing, subject, missingReason(subject, 'la ligne Marine specialist'));
  if (biology === 'pathogen') return legacy('pathogen', 2, ENEMY_VISUAL_IDENTITY.missing, subject, missingReason(subject, 'la ligne Pathogen'));
  if (biology === 'fauna') return legacy('pathogen', 3, ENEMY_VISUAL_IDENTITY.missing, subject, missingReason(subject, 'la ligne faune de frontière'));
  return missingXeno(subject);
};

const sourceName = (source) => typeof source === 'string'
  ? source.trim()
  : String(source?.name ?? source?.archetype ?? '').trim();

const isBaseEnemyIdentity = (source, archetype) => {
  const id = typeof source === 'object' && source !== null ? String(source.id ?? '') : '';
  const ordinal = Number(id.match(/^enemy-(\d+)-/)?.[1]);
  if (Number.isFinite(ordinal) && ordinal > 0) {
    return ordinal <= 52 || ENEMY_VISUAL_OVERRIDE_BASE_PROFILE_IDS_V64.includes(id);
  }
  if (source?.provenance === 'systemic-variant') return false;
  const rawName = sourceName(source);
  if (rawName && rawName !== archetype) return false;
  const modifier = typeof source === 'object' && source !== null ? String(source.modifier ?? '') : '';
  return !modifier || modifier === 'Standard';
};

const asAuthoredFamilyVariant = (source, archetype, baseProfile) => {
  const label = sourceName(source) || archetype;
  return Object.freeze({
    archetype,
    ...baseProfile,
    identityStatus: ENEMY_VISUAL_IDENTITY.family,
    approximate: true,
    fallbackReason: `La plaque exacte de ${baseProfile.artSubject} est réemployée pour ${label}; son modifier systémique n'est pas dessiné séparément.`
  });
};

export function resolveEnemyVisualProfile(source = {}) {
  const dedicatedV66 = resolveEnemyProfileVisualV66(source);
  if (dedicatedV66) return dedicatedV66;
  const dedicatedV65 = resolveEnemyProfileVisualV65(source);
  if (dedicatedV65) return dedicatedV65;
  const dedicatedV64 = resolveEnemyVisualOverrideV64(source);
  if (dedicatedV64) return Object.freeze({
    ...dedicatedV64,
    imageKey: null,
    row: null,
    artSubject: dedicatedV64.archetype,
    legacy: false
  });
  const dedicatedV56 = resolveEnemyVisualOverrideV56(source);
  if (dedicatedV56) return Object.freeze({
    ...dedicatedV56,
    imageKey: null,
    row: null,
    artSubject: dedicatedV56.archetype,
    legacy: false
  });
  const dedicatedV55 = resolveEnemyVisualOverrideV55(source);
  if (dedicatedV55) return Object.freeze({
    ...dedicatedV55,
    imageKey: null,
    row: null,
    artSubject: dedicatedV55.archetype,
    legacy: false
  });
  const archetype = resolveEnemyArchetype(source);
  const baseProfile = REGISTRY[archetype] ?? unknownFamilyProfile(source, archetype);
  if (baseProfile.identityStatus === ENEMY_VISUAL_IDENTITY.exact && !isBaseEnemyIdentity(source, archetype)) {
    return asAuthoredFamilyVariant(source, archetype, baseProfile);
  }
  return Object.freeze({
    archetype,
    ...baseProfile,
    approximate: baseProfile.identityStatus !== ENEMY_VISUAL_IDENTITY.exact
  });
}

export function resolveLegacyEnemyCell(enemy = {}, animationTime = 0) {
  const requestedRow = Number(enemy.visualRow ?? enemy.row ?? 0);
  const row = Math.max(0, Math.min(3, Number.isFinite(requestedRow) ? Math.trunc(requestedRow) : 0));
  const phaseValue = Number(enemy.animationPhase ?? 0);
  const phase = Number.isFinite(phaseValue) ? Math.trunc(phaseValue) : 0;
  const fps = enemy.alert ? 9 : 4;
  const timeValue = Number(animationTime);
  const time = Number.isFinite(timeValue) ? Math.max(0, timeValue) : 0;
  const rawFrame = Math.floor(time * fps) + phase;
  return Object.freeze({
    row,
    frame: enemy.alive === false ? 3 : ((rawFrame % 4) + 4) % 4
  });
}

const increment = (record, key) => { record[key] = (record[key] ?? 0) + 1; };

export function enemyVisualCoverageReport(catalog = []) {
  const bySpriteKey = {};
  const byImageKey = {};
  const byIdentityStatus = {};
  const archetypes = new Set();
  const approximatedArchetypes = new Set();
  let legacyCount = 0;
  for (const source of catalog) {
    const resolved = resolveEnemyVisualProfile(source);
    archetypes.add(resolved.archetype);
    increment(bySpriteKey, resolved.spriteKey);
    increment(byIdentityStatus, resolved.identityStatus);
    if (resolved.imageKey) increment(byImageKey, resolved.imageKey);
    if (resolved.legacy) legacyCount += 1;
    if (resolved.approximate) approximatedArchetypes.add(resolved.archetype);
  }
  return Object.freeze({
    total: catalog.length,
    modern: catalog.length - legacyCount,
    legacy: legacyCount,
    uniqueArchetypes: archetypes.size,
    bySpriteKey: Object.freeze(bySpriteKey),
    byImageKey: Object.freeze(byImageKey),
    byIdentityStatus: Object.freeze(byIdentityStatus),
    approximatedArchetypes: Object.freeze([...approximatedArchetypes].sort())
  });
}
