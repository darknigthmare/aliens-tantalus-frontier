import { VEHICLES } from './content-core-v50.js';

/** Hangar context is presentation only. It never changes the historic vehicle
 * IDs, access conditions, seats, actions or in-mission animation resolver. */
export const VEHICLE_SHOWROOM_CONTEXTS_V119 = Object.freeze(Object.fromEntries([
  ['ground', 'BAIE VÉHICULES', 'Atelier sec · ligne de maintenance', 'dry-workshop'],
  ['exosuit', 'ATELIER EXOSQUELETTES', 'Support de maintenance · circuit hydraulique', 'maintenance-rig'],
  ['air', 'HANGAR AÉRIEN', 'Aire d’embarquement · baie de vol', 'flight-hangar'],
  ['space', 'DOCK ORBITAL', 'Vue extérieure · amarrage', 'orbital-dock'],
  ['maritime', 'DOCK DE SURFACE', 'Bassin · quai humide', 'surface-water'],
  ['submersible', 'SAS SUBMERSIBLE', 'Bassin profond · maintenance sous pression', 'deep-water'],
  ['rail', 'ATELIER TRANSIT', 'Voie dédiée · plateforme technique', 'rail-platform'],
  ['lift', 'PUITS DE TRANSFERT', 'Structure verticale · quai de chargement', 'vertical-shaft'],
  ['unknown', 'ZONE À DÉFINIR', 'Contexte technique non documenté', 'unreviewed']
].map(([id, label, description, environment]) => [id, Object.freeze({ id, label, description, environment,
  wet: ['maritime', 'submersible'].includes(id), floor: !['space', 'submersible'].includes(id) })])));

const byId = new Map(VEHICLES.map(entry => [entry.id, entry]));
const baseByName = new Map(VEHICLES.filter(entry => entry.fit === 'Standard').map(entry => [entry.name, entry]));
const visibleBaseName = name => String(name || '').split(' — ')[0];
const positive = number => Number.isFinite(number) && number > 0;

export function vehicleShowroomGeometryV119(visual) {
  if (!visual?.path) return null;
  const bounds = visual.alphaBounds;
  const crop = visual.visualMode === 'static-pose' && Array.isArray(bounds) && bounds.length === 4
    && positive(visual.sourceWidth) && positive(visual.sourceHeight)
    && bounds.every(Number.isFinite) && bounds[0] >= 0 && bounds[1] >= 0
    && bounds[2] > bounds[0] && bounds[3] > bounds[1]
    && bounds[2] <= visual.sourceWidth && bounds[3] <= visual.sourceHeight;
  const width = crop ? bounds[2] - bounds[0] : visual.renderWidth || visual.grid?.cellWidth || 1;
  const height = crop ? bounds[3] - bounds[1] : visual.renderHeight || visual.grid?.cellHeight || 1;
  return Object.freeze({ aspectRatio: width / height, cropped: crop === true,
    ...(crop ? { widthPercent: 100 * visual.sourceWidth / width, heightPercent: 100 * visual.sourceHeight / height,
      translateXPercent: -100 * bounds[0] / visual.sourceWidth, translateYPercent: -100 * bounds[1] / visual.sourceHeight } : {}) });
}

export function getVehicleShowroomV119(record) {
  if (!record || record.catalog !== 'vehicles') return null;
  const vehicle = byId.get(record.id);
  if (!vehicle) return null;
  const base = baseByName.get(visibleBaseName(vehicle.name)) || vehicle;
  // This historical elevator is classified as rail for access/gameplay. Its
  // vertical showroom does not rewrite that saved family or make it a tram.
  const contextId = base.id === 'vehicle-032-atmospheric-processor-elevator' ? 'lift' : vehicle.family;
  const context = VEHICLE_SHOWROOM_CONTEXTS_V119[contextId] || VEHICLE_SHOWROOM_CONTEXTS_V119.unknown;
  const visual = record.visual;
  const familyReuse = visual?.identity?.status === 'authored-family' || visual?.catalogVariantMismatch === true;
  const animationAvailable = visual?.visualMode !== 'static-pose' && (visual?.idleClip?.clip?.frames?.length || 0) > 1;
  return Object.freeze({ vehicleId: vehicle.id, chassisId: base.id, chassisName: base.name, context,
    nativeVisual: visual?.visualMode === 'static-pose', animationAvailable,
    visualStatus: !visual ? 'missing-dedicated-art' : familyReuse ? 'authored-family' : 'available-adaptation',
    visualLabel: !visual ? 'VISUEL DÉDIÉ À DÉFINIR' : familyReuse ? 'PLAQUE DE FAMILLE · ÉQUIPEMENTS DE VARIANTE NON DÉDIÉS'
      : visual.visualMode === 'static-pose' ? 'VUE D’INSPECTION FIXE · ADAPTATION SUR RÉFÉRENCE' : 'PLAQUETTE DE CHÂSSIS · ANIMATION EXISTANTE',
    sourceWork: record.canonFacts.source?.work || 'unknown', referenceStatus: visual?.identity?.referenceStatus || vehicle.referenceStatus || 'unknown',
    canonExact: visual?.identity?.canonExact === true,
    geometry: vehicleShowroomGeometryV119(visual),
    seats: Object.freeze(vehicle.seats.map(seat => Object.freeze({ ...seat, actions: Object.freeze([...seat.actions]) }))),
    variants: Object.freeze(VEHICLES.filter(entry => visibleBaseName(entry.name) === base.name).map(entry => Object.freeze({ id: entry.id, name: entry.name, fit: entry.fit })))
  });
}

export function vehicleShowroomReportV119(records) {
  const models = records.filter(record => record.catalog === 'vehicles').map(getVehicleShowroomV119);
  return Object.freeze({ configurations: models.length, chassis: new Set(models.filter(Boolean).map(model => model.chassisId)).size,
    byContext: Object.freeze(Object.fromEntries(Object.keys(VEHICLE_SHOWROOM_CONTEXTS_V119).map(id => [id, models.filter(model => model?.context.id === id).length]))),
    missingVisuals: models.filter(model => model?.visualStatus === 'missing-dedicated-art').length,
    unresolvedIds: Object.freeze(records.filter(record => record.catalog === 'vehicles' && !getVehicleShowroomV119(record)).map(record => record.id)) });
}
