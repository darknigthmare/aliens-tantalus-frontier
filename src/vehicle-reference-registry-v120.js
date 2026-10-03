import { VEHICLES } from './content-core-v50.js';
import { VEHICLE_CATALOG_ADDITIONS_V122 } from './vehicle-catalog-additions-v122.js';

/** Nominal references and actual authored chassis are separate. No artwork,
 * paint fit, book/model measurement or catalogue name certifies 1:1 geometry.
 * Bindings are made from the existing immutable inventory, never guessed IDs. */
const freeze = value => Object.freeze(value);
const source = (work, url, kind, note = '') => freeze({ work, url, kind, note });
const hcg = source('Aliens (1986)', 'https://www.hottoys.jp/item/view/100002854.php', 'licensed-replica',
  'La longueur de 52 cm est celle de la réplique ; aucun véhicule fictionnel n’est mesuré ici.');
const neca = source('Aliens (1986)', 'https://www.necaonline.com.au/products/aliens-40th-anniversary-power-loader-p-5000-deluxe-vehicle', 'licensed-replica',
  'P-5000 avec poste de pilotage humain ; hauteur de 11 pouces de la figurine non convertie en taille canonique.');
const manual = source('Aliens: Colonial Marines Technical Manual', 'https://www.penguinrandomhouse.com/books/218640/aliens-colonial-marines-technical-manual-by-lee-brimmicombe-wood/', 'licensed-book',
  'Provenance nominale à confronter à un plan du modèle exact avant une nouvelle reconstruction.');
const operations = source('ALIEN RPG: Colonial Marines Operations Manual', 'https://freeleaguepublishing.com/shop/alien-rpg-2/colonial-marines-operations-manual/', 'licensed-book',
  'Famille C/D documentée ; cabine et équipement exacts du D restent non individualisés.');
const cheyenne = source('Aliens (1986)', 'https://propstore.com/product/aliens-1986/lot-17-bug-stomper-smart-ass-dropship-model-miniature/', 'production-miniature',
  'Configuration nacelles repliées suivie par la plaque V112, pas toutes les configurations du dropship.');
const narcissus = source('Alien (1979)', 'https://us.zavvi.com/p/merch-figures/eaglemoss-alien-shuttle-narcissus-ship-limited-edition-die-cast-replica-20cm/12578873/', 'licensed-replica',
  'Les 20 cm sont une mesure de collectible ; la navette n’est pas le remorqueur Nostromo.');
const rt = source('Prometheus (2012)', 'https://www.linkedin.com/posts/vyleart_prometheus-rover-sketches-and-build-shown-activity-6473591156264431616-avS8', 'production-designer',
  'Véhicule pratique à huit roues ; plaque de maintenance ouverte, numéro RT01 non certifié.');
const daihotai = source('Aliens (1986)', 'https://entertainment.ha.com/itm/movie-tv-memorabilia/props/aliens-tcf-1986-hadley-s-hope-daihotai-tractor-filming-miniature/a/7356-89585.s', 'production-miniature',
  'Huit roues du véhicule filmé ; le concept six roues de Ron Cobb n’est pas un substitut. Galerie HTTP 403 non contournée.');
const filmNominal = work => source(work, null, 'nominal-work-only',
  'Nom/provenance nominale conservés ; référence visuelle exacte non encore validée.');

// Exact historic base numbers, not an invented catalogue of 279 new hulls.
const referenceByBaseNumber = new Map([
  [1, hcg], [3, manual], [4, manual], [5, manual], [6, manual], [7, neca],
  [9, cheyenne], [10, filmNominal('Aliens: Fireteam Elite')], [11, operations],
  [13, narcissus], [14, filmNominal('Alien: Covenant (2017)')], [15, rt],
  [16, filmNominal('Prometheus (2012)')], [18, daihotai],
  [19, filmNominal('Prometheus (2012)')]
]);
const originals = new Set([20, 21, 22, 24, 31, 34, 35]);
// V120 is a historical 279-configuration snapshot, not the current append-only
// catalogue. Later distinct models are referenced by their own release registry.
const historicalVehicles = VEHICLES.filter(entry => Number(entry.id.match(/^vehicle-(\d{3})-/)?.[1]) <= 279);
const postSnapshotIds = new Set(VEHICLES.filter(entry => !historicalVehicles.includes(entry)).map(entry => entry.id));
const baseEntries = historicalVehicles.filter(entry => entry.fit === 'Standard');
const baseIdByName = new Map(baseEntries.map(entry => [entry.name, entry.id]));

export const VEHICLE_CHASSIS_REFERENCES_V120 = freeze(Object.fromEntries(baseEntries.map(entry => {
  const number = Number(entry.id.match(/^vehicle-(\d{3})-/)?.[1]), reference = referenceByBaseNumber.get(number);
  const provenance = reference ? 'licensed-reference' : originals.has(number) ? 'project-original' : 'project-adaptation';
  return [entry.id, freeze({ chassisId: entry.id, chassisName: entry.name, category: entry.family,
    provenance, referenceStatus: reference ? 'DOCUMENTED_NOMINAL_MODEL' : provenance === 'project-original' ? 'PROJECT_ORIGINAL' : 'PROJECT_ADAPTATION',
    sourceWork: reference?.work || 'Tantalus Frontier',
    references: freeze(reference ? [reference] : []),
    visualReferenceStatus: reference?.url ? 'source-to-compare' : reference ? 'exact-visual-reference-missing' : 'authored-project-design',
    canonExact: false, physicalDimensionsMeters: null,
    controlMode: entry.family === 'exosuit' ? 'piloted-exoskeleton' : 'vehicle-or-transport-system',
    ...(number === 7 ? { distinctAutomatonId: 'synth-automated-powerloader',
      controlNote: 'P-5000 pilotable : cockpit, harnais et commandes humains. L’Automated Power Loader du bestiaire est un automate distinct, jamais une finition pilotable.' } : {}),
    note: reference?.note || 'Création/adaptation du projet : aucun modèle externe 1:1 n’est revendiqué.'
  })];
})));

export const VEHICLE_REFERENCE_BINDINGS_V120 = freeze(Object.fromEntries(historicalVehicles.map(entry => {
  const baseId = baseIdByName.get(entry.name.split(' — ')[0]);
  if (!baseId || !Object.hasOwn(VEHICLE_CHASSIS_REFERENCES_V120, baseId)) throw new Error(`Unbound vehicle chassis: ${entry.id}`);
  return [entry.id, freeze({ vehicleId: entry.id, chassisId: baseId, fit: entry.fit, isVariant: entry.fit !== 'Standard' })];
})));

/** Explicit foreign IDs, aliases and malformed objects receive no near-name
 * fallback. All callers may retain the record's existing mission resolver. */
export function getVehicleReferenceV120(value) {
  const id = typeof value === 'string' ? value : value && typeof value === 'object' && !Array.isArray(value) ? value.id || value.catalogId || value.vehicleId : null;
  if (typeof id !== 'string' || !Object.hasOwn(VEHICLE_REFERENCE_BINDINGS_V120, id)) return null;
  const binding = VEHICLE_REFERENCE_BINDINGS_V120[id], chassis = VEHICLE_CHASSIS_REFERENCES_V120[binding.chassisId];
  return freeze({ ...chassis, ...binding, fitReferenceStatus: binding.isVariant ? 'authored-fit-shared-chassis' : chassis.referenceStatus });
}

/** Input records are the real runtime consumers. Distinct paths certify files,
 * not canon; native poses and old action atlases are counted separately. */
export function vehicleReferenceCoverageV120(records = []) {
  const vehicles = Array.isArray(records) ? records.filter(record => record?.catalog === 'vehicles' && !postSnapshotIds.has(record.id)) : [];
  const bound = vehicles.map(record => ({ record, reference: getVehicleReferenceV120(record) }));
  const chassis = new Map(bound.filter(row => row.reference).map(row => [row.reference.chassisId, row.reference]));
  return freeze({ configurations: vehicles.length, chassis: chassis.size,
    distinctVisualFiles: new Set(vehicles.map(record => record.visual?.path).filter(Boolean)).size,
    nativeInspectionConfigurations: vehicles.filter(record => record.visual?.visualMode === 'static-pose').length,
    nativeInspectionChassis: new Set(bound.filter(row => row.reference && row.record.visual?.visualMode === 'static-pose').map(row => row.reference.chassisId)).size,
    animatedAtlasConfigurations: vehicles.filter(record => record.visual?.path && record.visual?.visualMode !== 'static-pose').length,
    missingVisuals: vehicles.filter(record => !record.visual?.path).length,
    certifiedGeometries: vehicles.filter(record => record.visual?.identity?.canonExact === true).length,
    byProvenance: freeze(Object.fromEntries(['licensed-reference', 'project-original', 'project-adaptation'].map(kind => [kind, [...chassis.values()].filter(reference => reference.provenance === kind).length]))),
    unresolvedIds: freeze(bound.filter(row => !row.reference).map(row => row.record.id))
  });
}

// Additive V122 references: the historical V120 exports above remain 279 IDs.
// A production concept verifies the intended work, not film-final geometry.
export const VEHICLE_CHASSIS_REFERENCES_V122 = freeze(Object.fromEntries(
  VEHICLE_CATALOG_ADDITIONS_V122.map(entry => [entry.id, freeze({
    chassisId: entry.id, chassisName: entry.name, category: entry.family,
    provenance: entry.provenance, referenceStatus: entry.referenceStatus,
    sourceWork: entry.sourceWork,
    references: freeze([source(entry.sourceWork, entry.sourceUrl, 'primary-production-designer', entry.referenceNote)]),
    visualReferenceStatus: 'production-design-front-rear-reviewed-film-final-unattested',
    canonExact: false, physicalDimensionsMeters: null,
    controlMode: entry.controlMode, nameStatus: entry.nameStatus,
    note: entry.referenceNote
  })])
));

/** V122 append-only identity; never broadens the historical V120 bindings. */
export function getVehicleReferenceV122(value) {
  const id = typeof value === 'string' ? value : value && typeof value === 'object' && !Array.isArray(value)
    ? value.id || value.catalogId || value.vehicleId : null;
  if (typeof id !== 'string' || !Object.hasOwn(VEHICLE_CHASSIS_REFERENCES_V122, id)) return null;
  return freeze({ ...VEHICLE_CHASSIS_REFERENCES_V122[id], vehicleId: id, fit: 'Standard',
    isVariant: false, fitReferenceStatus: VEHICLE_CHASSIS_REFERENCES_V122[id].referenceStatus });
}
