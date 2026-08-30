import {
  ENEMIES,
  EQUIPMENT,
  VEHICLES,
  WEAPONS
} from './content-core-v50.js';
import { resolveEnemyVisualProfile } from './enemy-visual-runtime-v53.js';
import {
  resolveEquipmentVisualProfileV56,
  resolveEquipmentVisualStateV56
} from './equipment-visual-runtime-v56.js';
import {
  resolveSpriteClip,
  resolveSpriteSheet,
  resolveEnemyAnimation
} from './sprite-animation-runtime.js';
import {
  resolveVehicleVisualAnimation,
  resolveVehicleVisualProfile
} from './vehicle-visual-runtime-v55.js';
import {
  resolveVehicleVisualAnimationV56,
  resolveVehicleVisualProfileV56
} from './vehicle-visual-overrides-v56.js';
import {
  resolveWeaponVisualAnimationV61,
  resolveWeaponVisualProfileV61
} from './weapon-visual-runtime-v61.js';

export const CATALOG_UNKNOWN_V62 = 'unknown';

export const CATALOG_KINDS_V62 = Object.freeze({
  weapons: 'weapons',
  equipment: 'equipment',
  enemies: 'enemies',
  vehicles: 'vehicles'
});

export const CATALOG_LABELS_V62 = Object.freeze({
  weapons: 'Armes',
  equipment: 'Équipement',
  enemies: 'Bestiaire',
  vehicles: 'Véhicules'
});

// The content catalogs currently contain no sourced physical heights. Keeping
// this registry empty is deliberate: sprite pixels and hitboxes are not metres.
export const VERIFIED_DIMENSIONS_V62 = Object.freeze({});

export const HUMAN_COMPARISON_REFERENCE_V62 = Object.freeze({
  label: 'Référence humaine UI',
  heightMeters: 1.75,
  status: 'comparison-reference-not-canon'
});

const CATALOGS = Object.freeze({
  weapons: WEAPONS,
  equipment: EQUIPMENT,
  enemies: ENEMIES,
  vehicles: VEHICLES
});

const freezeArray = (values = []) => Object.freeze([...values]);
const freezeObject = (value = {}) => Object.freeze({ ...value });
const knownString = (value) => typeof value === 'string' && value.trim()
  ? value.trim()
  : CATALOG_UNKNOWN_V62;
const optionalString = (value) => typeof value === 'string' && value.trim()
  ? value.trim()
  : null;

export function normalizeCatalogSearchV62(value = '') {
  return String(value)
    .replace(/œ/giu, 'oe')
    .replace(/æ/giu, 'ae')
    .replace(/ß/giu, 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const slug = (value) => normalizeCatalogSearchV62(value).replace(/\s+/g, '-') || CATALOG_UNKNOWN_V62;

const catalogueNumber = (entry = {}) => {
  const match = String(entry.id || '').match(/^(?:weapon|equipment|enemy|vehicle)-(\d{3})-/);
  return match ? Number(match[1]) : null;
};

const baseIdentityName = (entry = {}, fallback = CATALOG_UNKNOWN_V62) => {
  const name = knownString(entry.name);
  const withoutVariant = name.split(/\s+—\s+/u)[0].trim();
  return withoutVariant || fallback;
};

const idleCell = (sheet, clip) => {
  const index = Number.isInteger(clip?.frames?.[0]) ? clip.frames[0] : null;
  if (!sheet || index === null) return null;
  return freezeObject({
    index,
    column: index % sheet.columns,
    row: Math.floor(index / sheet.columns),
    cellWidth: sheet.cellWidth,
    cellHeight: sheet.cellHeight
  });
};

const clipDescriptor = (animation, fallbackFrame = null) => {
  if (!animation?.sheetId || !animation?.clipId) return null;
  const sheet = resolveSpriteSheet(animation.sheetId);
  const clip = resolveSpriteClip(animation.sheetId, animation.clipId);
  if (!sheet) return null;
  const frames = clip?.frames?.length
    ? clip.frames
    : Number.isInteger(fallbackFrame) ? [fallbackFrame] : [];
  if (!frames.length) return null;
  const descriptorClip = freezeObject({
    id: animation.clipId,
    frames: freezeArray(frames),
    fps: Number.isFinite(clip?.fps) ? clip.fps : 1,
    loop: clip?.loop === true
  });
  return freezeObject({
    sheetId: sheet.id,
    clip: descriptorClip,
    firstCell: idleCell(sheet, descriptorClip)
  });
};

const visualIdentity = (profile) => freezeObject({
  status: knownString(profile?.identityStatus),
  referenceStatus: knownString(profile?.referenceStatus),
  exact: profile?.exact === true || profile?.identityVerified === true || profile?.profileIdentityVerified === true,
  canonExact: profile?.canonExact === true,
  approximate: profile?.approximate === true,
  fallbackReason: optionalString(profile?.fallbackReason)
});

const selectVisualFields = (profile, idle, extra = {}) => {
  if (!profile) return null;
  const sheet = resolveSpriteSheet(idle?.sheetId || profile.sheetId || profile.imageKey);
  return freezeObject({
    sheetId: optionalString(sheet?.id || profile.sheetId),
    imageKey: optionalString(sheet?.imageKey || profile.imageKey || profile.spriteKey),
    path: optionalString(sheet?.path || profile.path),
    rawPath: optionalString(profile.rawPath || profile.masterPath),
    grid: sheet ? freezeObject({
      columns: sheet.columns,
      rows: sheet.rows,
      cellWidth: sheet.cellWidth,
      cellHeight: sheet.cellHeight
    }) : null,
    idleClip: idle,
    identity: visualIdentity(profile),
    ...extra
  });
};

function weaponVisual(entry) {
  const profile = resolveWeaponVisualProfileV61(entry);
  if (!profile) return null;
  const idle = clipDescriptor(resolveWeaponVisualAnimationV61(entry));
  return selectVisualFields(profile, idle, {
    category: knownString(profile.category),
    renderWidth: Number.isFinite(profile.width) ? profile.width : null,
    renderHeight: Number.isFinite(profile.height) ? profile.height : null
  });
}

function equipmentVisual(entry) {
  const profile = resolveEquipmentVisualProfileV56(entry);
  if (!profile) return null;
  const state = resolveEquipmentVisualStateV56(entry);
  const stateFrame = Number.isInteger(state?.frame?.frame)
    ? state.frame.frame
    : Number.isInteger(state?.frame?.column) && Number.isInteger(state?.frame?.row)
      ? state.frame.row * profile.columns + state.frame.column
      : null;
  const idle = clipDescriptor(
    state ? { sheetId: state.sheetId, clipId: state.stateId } : null,
    stateFrame
  );
  return selectVisualFields(profile, idle, {
    category: 'equipment',
    renderWidth: Number.isFinite(profile.renderWidth) ? profile.renderWidth : null,
    renderHeight: Number.isFinite(profile.renderHeight) ? profile.renderHeight : null
  });
}

function enemyVisual(entry) {
  const profile = resolveEnemyVisualProfile(entry);
  if (!profile) return null;
  const animation = resolveEnemyAnimation({
    ...entry,
    ...profile,
    visualSheetId: profile.sheetId || null,
    alive: true,
    alert: false,
    attacking: false,
    vx: 0,
    vy: 0
  });
  const idle = clipDescriptor(animation);
  return selectVisualFields(profile, idle, {
    archetype: knownString(profile.archetype),
    spriteKey: optionalString(profile.spriteKey),
    legacyImageKey: profile.legacy ? optionalString(profile.imageKey) : null,
    legacyRow: profile.legacy && Number.isInteger(profile.row) ? profile.row : null,
    renderWidth: Number.isFinite(profile.width) ? profile.width : null,
    renderHeight: Number.isFinite(profile.height) ? profile.height : null
  });
}

function vehicleVisual(entry) {
  const v56Profile = resolveVehicleVisualProfileV56(entry);
  const profile = v56Profile || resolveVehicleVisualProfile(entry);
  if (!profile) return null;
  const animation = v56Profile
    ? resolveVehicleVisualAnimationV56(entry)
    : resolveVehicleVisualAnimation(entry);
  const idle = clipDescriptor(animation);
  return selectVisualFields(profile, idle, {
    category: knownString(profile.family || entry.family),
    renderWidth: Number.isFinite(profile.renderWidth) ? profile.renderWidth : null,
    renderHeight: Number.isFinite(profile.renderHeight) ? profile.renderHeight : null
  });
}

const VISUAL_RESOLVERS = Object.freeze({
  weapons: weaponVisual,
  equipment: equipmentVisual,
  enemies: enemyVisual,
  vehicles: vehicleVisual
});

const catalogProvenance = (entry, visual) => freezeObject({
  provenance: knownString(entry.provenance),
  referenceStatus: knownString(visual?.identity?.referenceStatus),
  canonExact: visual?.identity?.canonExact === true
});

const canonClaimsFor = (kind, entry, visual) => {
  const isLicensedBase = entry.provenance === 'licensed-reference'
    && !String(entry.name || '').includes('—');
  if (!isLicensedBase) return freezeObject({});

  if (kind === 'weapons' && visual?.identity?.canonExact) return freezeObject({
    name: knownString(entry.name),
    family: knownString(entry.family),
    source: knownString(entry.source)
  });
  if (kind === 'equipment' && visual?.identity?.canonExact) return freezeObject({
    name: knownString(entry.name),
    canonicalName: knownString(resolveEquipmentVisualProfileV56(entry)?.canonicalName)
  });
  if (kind === 'enemies') return freezeObject({
    name: knownString(entry.name),
    biology: knownString(entry.biology),
    caste: knownString(entry.caste)
  });
  if (kind === 'vehicles' && entry.referenceStatus === 'CANON_REFERENCE') return freezeObject({
    name: knownString(entry.name),
    family: knownString(entry.family),
    canonicalVariant: optionalString(entry.canonicalVariant)
  });
  return freezeObject({});
};

const gameplayStatsFor = (kind, entry) => {
  if (kind === 'weapons') return freezeObject({
    damage: entry.damage,
    fireRate: entry.fireRate,
    magazine: entry.magazine,
    reload: entry.reload,
    penetration: entry.penetration,
    rarity: knownString(entry.rarity),
    tags: freezeArray(entry.tags || [])
  });
  if (kind === 'equipment') return freezeObject({
    grade: knownString(entry.grade),
    rarity: knownString(entry.rarity),
    utility: knownString(entry.utility),
    charges: entry.charges,
    mass: entry.mass,
    description: knownString(entry.description)
  });
  if (kind === 'enemies') return freezeObject({
    health: entry.health,
    damage: entry.damage,
    speed: entry.speed,
    armor: entry.armor,
    acid: entry.acid,
    frequency: knownString(entry.frequency),
    encounterWorldIds: freezeArray(entry.encounterWorldIds || []),
    habitats: freezeArray(entry.habitats || []),
    behavior: knownString(entry.behavior)
  });
  return freezeObject({
    hull: entry.hull,
    speed: entry.speed,
    cargo: entry.cargo,
    armor: entry.armor,
    fit: knownString(entry.fit),
    seats: freezeArray((entry.seats || []).map((seat) => freezeObject({
      id: knownString(seat.id),
      role: knownString(seat.role),
      actions: freezeArray(seat.actions || [])
    }))),
    actions: freezeArray(entry.actions || [])
  });
};

const enemyStage = (entry) => ['egg', 'parasite', 'juvenile'].includes(entry.caste)
  ? entry.caste
  : CATALOG_UNKNOWN_V62;

const taxonomyFor = (kind, entry, visual) => {
  if (kind === 'weapons') return freezeObject({
    family: knownString(entry.family),
    category: knownString(visual?.category),
    species: CATALOG_UNKNOWN_V62,
    subspecies: CATALOG_UNKNOWN_V62,
    caste: CATALOG_UNKNOWN_V62,
    stage: CATALOG_UNKNOWN_V62,
    type: knownString(resolveWeaponVisualProfileV61(entry)?.name || baseIdentityName(entry))
  });
  if (kind === 'equipment') return freezeObject({
    family: 'equipment',
    category: knownString(entry.utility),
    species: CATALOG_UNKNOWN_V62,
    subspecies: CATALOG_UNKNOWN_V62,
    caste: CATALOG_UNKNOWN_V62,
    stage: CATALOG_UNKNOWN_V62,
    type: knownString(entry.grade)
  });
  if (kind === 'enemies') return freezeObject({
    family: knownString(entry.biology),
    category: 'organism',
    // The source catalog does not make a formal species/subspecies claim.
    species: CATALOG_UNKNOWN_V62,
    subspecies: CATALOG_UNKNOWN_V62,
    caste: knownString(entry.caste),
    stage: enemyStage(entry),
    type: knownString(visual?.archetype || baseIdentityName(entry))
  });
  return freezeObject({
    family: knownString(entry.family),
    category: 'vehicle',
    species: CATALOG_UNKNOWN_V62,
    subspecies: CATALOG_UNKNOWN_V62,
    caste: CATALOG_UNKNOWN_V62,
    stage: CATALOG_UNKNOWN_V62,
    type: knownString(profileTypeName(entry, visual))
  });
};

function profileTypeName(entry, visual) {
  return visual?.identity?.exact
    ? baseIdentityName(entry)
    : baseIdentityName(entry, knownString(entry.family));
}

const hierarchySegmentsFor = (kind, taxonomy) => {
  if (kind === 'weapons') return [
    ['family', taxonomy.family],
    ['category', taxonomy.category],
    ['type', taxonomy.type]
  ];
  if (kind === 'equipment') return [
    ['family', taxonomy.family],
    ['category', taxonomy.category],
    ['type', taxonomy.type]
  ];
  if (kind === 'enemies') return [
    ['family', taxonomy.family],
    ['species', taxonomy.species],
    ['subspecies', taxonomy.subspecies],
    ['stage', taxonomy.stage],
    ['caste', taxonomy.caste],
    ['type', taxonomy.type]
  ];
  return [
    ['family', taxonomy.family],
    ['category', taxonomy.category],
    ['type', taxonomy.type]
  ];
};

const recordSearchFields = (record, entry) => freezeArray([
  record.id,
  record.name,
  record.catalog,
  CATALOG_LABELS_V62[record.catalog],
  ...Object.values(record.taxonomy),
  entry.source,
  entry.grade,
  entry.modifier,
  entry.fit,
  entry.referenceStatus,
  entry.provenance,
  ...(entry.tags || []),
  ...(entry.habitats || [])
].filter((value) => value !== undefined && value !== null));

const buildRecord = (kind, entry) => {
  const visual = VISUAL_RESOLVERS[kind](entry);
  const taxonomy = taxonomyFor(kind, entry, visual);
  const segments = hierarchySegmentsFor(kind, taxonomy);
  const record = {
    id: entry.id,
    catalog: kind,
    catalogNumber: catalogueNumber(entry),
    name: knownString(entry.name),
    taxonomy,
    hierarchySegments: freezeArray(segments.map(([nodeKind, label]) => freezeObject({
      kind: nodeKind,
      label: knownString(label)
    }))),
    canonFacts: freezeObject({
      source: catalogProvenance(entry, visual),
      claims: canonClaimsFor(kind, entry, visual)
    }),
    gameplayStats: gameplayStatsFor(kind, entry),
    visual,
    dimensions: null,
    biologicalRelationIds: freezeArray([])
  };
  return record;
};

const mutableRecords = Object.entries(CATALOGS).flatMap(([kind, entries]) =>
  entries.map((entry) => buildRecord(kind, entry))
);

const recordById = new Map(mutableRecords.map((record) => [record.id, record]));

const enemyIdByName = new Map(ENEMIES.slice(0, 52).map((entry) => [entry.name, entry.id]));
const biologicalRelationSeeds = Object.freeze([
  Object.freeze({ fromName: 'Queen', toName: 'Ovomorph', type: 'produces' }),
  Object.freeze({ fromName: 'Ovomorph', toName: 'Facehugger', type: 'contains' }),
  Object.freeze({ fromName: 'Facehugger', toName: 'Chestburster', type: 'precedes' }),
  Object.freeze({ fromName: 'Chestburster', toName: 'Drone / Big Chap', type: 'matures-into' })
]);

export const BIOLOGICAL_RELATIONS_V62 = Object.freeze(biologicalRelationSeeds.flatMap((seed) => {
  const fromId = enemyIdByName.get(seed.fromName);
  const toId = enemyIdByName.get(seed.toName);
  return fromId && toId ? [freezeObject({
    id: `biology:${slug(seed.fromName)}:${seed.type}:${slug(seed.toName)}`,
    fromId,
    toId,
    type: seed.type,
    status: 'licensed-reference'
  })] : [];
}));

const biologicalRelationsByEntry = new Map();
for (const relation of BIOLOGICAL_RELATIONS_V62) {
  for (const entryId of [relation.fromId, relation.toId]) {
    if (!biologicalRelationsByEntry.has(entryId)) biologicalRelationsByEntry.set(entryId, []);
    biologicalRelationsByEntry.get(entryId).push(relation.id);
  }
}

for (const record of mutableRecords) {
  record.biologicalRelationIds = freezeArray(biologicalRelationsByEntry.get(record.id) || []);
}

const nodeById = new Map();
const rootBuilders = new Map();

const createNodeBuilder = ({ id, kind, label, catalog, parentId = null }) => ({
  id,
  kind,
  label,
  catalog,
  parentId,
  childNodes: new Map(),
  entryIds: []
});

for (const kind of Object.keys(CATALOGS)) {
  const root = createNodeBuilder({
    id: `catalog:${kind}`,
    kind: 'catalog',
    label: CATALOG_LABELS_V62[kind],
    catalog: kind
  });
  rootBuilders.set(kind, root);
}

for (const record of mutableRecords) {
  let node = rootBuilders.get(record.catalog);
  const ancestryIds = [node.id];
  for (const segment of record.hierarchySegments) {
    const id = `${node.id}/${segment.kind}:${slug(segment.label)}`;
    if (!node.childNodes.has(id)) node.childNodes.set(id, createNodeBuilder({
      id,
      kind: segment.kind,
      label: segment.label,
      catalog: record.catalog,
      parentId: node.id
    }));
    node = node.childNodes.get(id);
    ancestryIds.push(node.id);
  }
  node.entryIds.push(record.id);
  record.ancestryIds = freezeArray(ancestryIds);
}

const compareLabels = (left, right) => normalizeCatalogSearchV62(left.label)
  .localeCompare(normalizeCatalogSearchV62(right.label), 'en');

const finalizeNode = (builder) => {
  const children = [...builder.childNodes.values()].map(finalizeNode).sort(compareLabels);
  const descendantEntryIds = [
    ...builder.entryIds,
    ...children.flatMap((child) => child.descendantEntryIds)
  ];
  const node = freezeObject({
    id: builder.id,
    kind: builder.kind,
    label: builder.label,
    catalog: builder.catalog,
    parentId: builder.parentId,
    count: descendantEntryIds.length,
    children: freezeArray(children),
    entryIds: freezeArray([...builder.entryIds].sort()),
    descendantEntryIds: freezeArray(descendantEntryIds)
  });
  nodeById.set(node.id, node);
  return node;
};

export const CATALOG_TREE_V62 = Object.freeze(
  [...rootBuilders.values()].map(finalizeNode)
);

export const CATALOG_RECORDS_V62 = Object.freeze(mutableRecords.map((record) => {
  const frozen = Object.freeze(record);
  recordById.set(frozen.id, frozen);
  return frozen;
}));

export const CATALOG_COUNTS_V62 = Object.freeze({
  total: CATALOG_RECORDS_V62.length,
  weapons: WEAPONS.length,
  equipment: EQUIPMENT.length,
  enemies: ENEMIES.length,
  vehicles: VEHICLES.length
});

const searchIndex = CATALOG_RECORDS_V62.map((record) => {
  const source = CATALOGS[record.catalog].find((entry) => entry.id === record.id) || {};
  const fields = recordSearchFields(record, source);
  return Object.freeze({
    record,
    fields,
    normalizedFields: freezeArray(fields.map(normalizeCatalogSearchV62)),
    haystack: normalizeCatalogSearchV62(fields.join(' '))
  });
});

export function getCatalogEntryV62(entryOrId) {
  const id = typeof entryOrId === 'string' ? entryOrId : entryOrId?.id;
  return id ? recordById.get(id) || null : null;
}

export function getCatalogNodeV62(nodeId) {
  return typeof nodeId === 'string' ? nodeById.get(nodeId) || null : null;
}

export function getCatalogChildrenV62(nodeId) {
  const node = getCatalogNodeV62(nodeId);
  return node ? node.children : freezeArray([]);
}

export function getCatalogPathV62(entryOrId) {
  const record = getCatalogEntryV62(entryOrId);
  if (!record) return null;
  const ancestry = record.ancestryIds.map((nodeId) => nodeById.get(nodeId)).filter(Boolean);
  return freezeArray([
    ...ancestry.map((node) => freezeObject({
      id: node.id,
      kind: node.kind,
      label: node.label,
      catalog: node.catalog
    })),
    freezeObject({
      id: record.id,
      kind: 'entry',
      label: record.name,
      catalog: record.catalog
    })
  ]);
}

const scoreSearchMatch = (indexed, normalizedQuery, terms) => {
  const name = normalizeCatalogSearchV62(indexed.record.name);
  const id = normalizeCatalogSearchV62(indexed.record.id);
  if (id === normalizedQuery || name === normalizedQuery) return 1000;
  let score = name.startsWith(normalizedQuery) ? 700 : name.includes(normalizedQuery) ? 500 : 0;
  score += terms.reduce((total, term) => total + (
    name.startsWith(term) ? 80
      : name.includes(term) ? 50
        : indexed.normalizedFields.some((field) => field === term) ? 30
          : 10
  ), 0);
  return score;
};

export function searchCatalogV62(query, options = {}) {
  const normalizedQuery = normalizeCatalogSearchV62(query);
  if (!normalizedQuery) return freezeArray([]);
  const terms = normalizedQuery.split(' ');
  const requestedCatalog = typeof options.catalog === 'string'
    ? options.catalog.trim().toLowerCase()
    : null;
  const limit = Number.isFinite(Number(options.limit))
    ? Math.max(1, Math.min(250, Math.trunc(Number(options.limit))))
    : 24;
  const matches = searchIndex
    .filter((indexed) => (!requestedCatalog || indexed.record.catalog === requestedCatalog)
      && terms.every((term) => indexed.haystack.includes(term)))
    .map((indexed) => ({
      indexed,
      score: scoreSearchMatch(indexed, normalizedQuery, terms)
    }))
    .sort((left, right) => right.score - left.score
      || normalizeCatalogSearchV62(left.indexed.record.name)
        .localeCompare(normalizeCatalogSearchV62(right.indexed.record.name), 'en'))
    .slice(0, limit)
    .map(({ indexed, score }) => freezeObject({
      entry: indexed.record,
      path: getCatalogPathV62(indexed.record.id),
      score
    }));
  return freezeArray(matches);
}

export function getBiologicalRelationsV62(entryOrId) {
  const record = getCatalogEntryV62(entryOrId);
  if (!record || record.catalog !== 'enemies') return freezeArray([]);
  const relations = BIOLOGICAL_RELATIONS_V62
    .filter((relation) => relation.fromId === record.id || relation.toId === record.id)
    .map((relation) => {
      const outgoing = relation.fromId === record.id;
      const relatedId = outgoing ? relation.toId : relation.fromId;
      return freezeObject({
        id: relation.id,
        type: relation.type,
        direction: outgoing ? 'outgoing' : 'incoming',
        status: relation.status,
        relatedEntry: getCatalogEntryV62(relatedId),
        relatedPath: getCatalogPathV62(relatedId)
      });
    });
  return freezeArray(relations);
}

const verifiedDimension = (dimension) => dimension
  && dimension.verification === 'verified'
  && Number.isFinite(Number(dimension.heightMeters))
  && Number(dimension.heightMeters) > 0
  && typeof dimension.source === 'string'
  && dimension.source.trim();

export function getHumanSizeComparisonV62(entryOrId, options = {}) {
  const record = getCatalogEntryV62(entryOrId);
  if (!record) return null;
  const dimensions = options.dimensions || VERIFIED_DIMENSIONS_V62;
  const dimension = dimensions?.[record.id];
  if (!verifiedDimension(dimension)) return null;
  const reference = options.humanReference || HUMAN_COMPARISON_REFERENCE_V62;
  if (!Number.isFinite(Number(reference?.heightMeters)) || Number(reference.heightMeters) <= 0) return null;
  const heightMeters = Number(dimension.heightMeters);
  const humanHeightMeters = Number(reference.heightMeters);
  return freezeObject({
    entryId: record.id,
    heightMeters,
    humanHeightMeters,
    ratioToHuman: Number((heightMeters / humanHeightMeters).toFixed(3)),
    source: dimension.source.trim(),
    verification: 'verified',
    referenceStatus: knownString(reference.status)
  });
}
