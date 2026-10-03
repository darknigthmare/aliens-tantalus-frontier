/** Append-only V122 vehicle. Source facts are separate from simulation tuning.
 * No content-core import: the catalogue owns concatenation and save IDs stay stable. */
const freeze = Object.freeze;
const sourceUrl = 'https://www.tonydrew.com.au/film';

export const VEHICLE_CATALOG_ADDITIONS_V122 = freeze([
  freeze({
    id: 'vehicle-282-covenant-terraforming-truck', shortId: 282,
    name: 'Covenant Terraforming Truck', canonicalName: 'Covenant Terraforming Truck',
    nameStatus: 'descriptive-production-design-label-not-official-model-designation',
    family: 'ground', fit: 'Standard', source: 'Weyland-Yutani',
    controlMode: 'piloted-industrial-vehicle',
    seats: freeze([
      freeze({ id: 'seat-1', role: 'driver', actions: freeze(['drive', 'brake']) }),
      freeze({ id: 'seat-2', role: 'operator', actions: freeze(['observe', 'support', 'disembark']) })
    ]),
    actions: freeze(['drive', 'brake', 'observe', 'support', 'disembark']),
    hull: 95, speed: 11, cargo: 18, armor: 4,
    statsPolicy: 'v122-original-project-tuning-not-source-statistics',
    seatPolicy: 'v122-simulation-stations-not-source-certified-crew-count',
    legacyCatalogName: null, canonicalVariant: null,
    provenance: 'production-design-reference', referenceStatus: 'PRODUCTION_DESIGN_REFERENCE',
    sourceWork: 'Alien: Covenant (2017)', sourceUrl,
    appearances: freeze(['Alien: Covenant — production design']),
    referenceFigure: 'Tony Drew — truckfront / truckrear, not Earlier Concepts',
    productionDesignFacts: freeze({
      designer: 'Tony Drew', productionDesigner: 'Chris Seagers', artDirector: 'Charlie Revai',
      intendedWork: 'Alien: Covenant', wheelsVisibleByCombinedViews: 6,
      frontAttachment: 'industrial-rake-pusher-not-weapon',
      sourceUrl, filmExactFinalGeometryAttested: false,
      crewCountAndPerformanceNotAttested: true
    }),
    referenceNote: 'Camion de terraformation dessiné pour Covenant par Tony Drew. Plaque adaptée de ses vues complètes avant et arrière ; ni désignation de modèle officielle inventée, ni certification de la géométrie finale filmée. Les postes, le blindage, la vitesse et la capacité sont des réglages Tantalus.',
    visualStatus: 'static-pose-action-animation-missing', animationStatus: 'missing',
    missionAtlasStatus: 'not-created', identityVerified: false, canonExact: false,
    physicalDimensionsMeters: null,
    description: 'Camion industriel à six roues, cabine protégée par des rails, benne couverte et outil frontal de terrassement. Transport et soutien de chantier pilotés ; aucun canon ajouté. Adaptation fixe du concept de production, paramètres propres à la simulation.'
  })
]);

const byId = new Map(VEHICLE_CATALOG_ADDITIONS_V122.map(vehicle => [vehicle.id, vehicle]));
export function getVehicleCatalogAdditionV122(value) {
  const id = typeof value === 'string' ? value : value && typeof value === 'object' && !Array.isArray(value)
    ? value.id || value.catalogId || value.vehicleId : null;
  return typeof id === 'string' ? byId.get(id) || null : null;
}
