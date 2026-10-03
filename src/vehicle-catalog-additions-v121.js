/** Append-only distinct referenced vehicle. No import from the content catalogue:
 * the catalogue owns concatenation and existing IDs/saves remain unchanged. */
const freeze = Object.freeze;
const seat = (id, role, actions) => freeze({ id, role, actions: freeze(actions) });
const manualUrl = 'https://www.penguinrandomhouse.com/books/218640/aliens-colonial-marines-technical-manual-by-lee-brimmicombe-wood/';

export const VEHICLE_CATALOG_ADDITIONS_V121 = freeze([
  freeze({
    id: 'vehicle-280-m579-daisycutter', shortId: 280,
    name: 'M579 Daisycutter', canonicalName: 'M579 Daisycutter',
    family: 'ground', fit: 'Standard', source: 'USCM',
    seats: freeze([
      seat('seat-1', 'driver', ['drive', 'boost', 'brake']),
      seat('seat-2', 'gunner', ['aim', 'fire', 'reload']),
      seat('seat-3', 'commander', ['observe', 'support', 'disembark'])
    ]),
    actions: freeze(['drive', 'boost', 'brake', 'aim', 'fire', 'reload', 'observe', 'support', 'disembark']),
    hull: 110, speed: 16, cargo: 0, armor: 12,
    statsPolicy: 'v121-original-project-tuning-not-source-statistics',
    seatPolicy: 'v121-simulation-crew-stations-not-source-certified-crew-count',
    legacyCatalogName: null, canonicalVariant: null,
    provenance: 'licensed-reference', referenceStatus: 'LICENSED_MODEL_REFERENCE',
    sourceWork: 'Aliens: Colonial Marines Technical Manual', sourceUrl: manualUrl,
    referenceImageUrl: 'https://www.avpcentral.com/images/colonial-marine-vehicles/m579-apc.webp',
    appearances: freeze(['Aliens: Colonial Marines Technical Manual']),
    referenceFigure: '4.10 M579 Daisycutter',
    licensedFamilyFacts: freeze({
      platformFamily: 'M570', model: 'M579', wheels: 4,
      gunSystem: 'quad 20mm gatlings', gunCaliberMillimeters: 20, gunBarrels: 4,
      missileSystem: 'SIM-118 Hornet', missileLaunchBins: 4,
      sourceFigure: '4.10', sourceUrl: manualUrl,
      performanceAndCrewCountNotAttested: true
    }),
    referenceNote: 'M579 distinct, référencé par la Fig. 4.10 : châssis à quatre roues, affût quad 20 mm et bacs SIM-118 abaissés. Coque apparentée à la série M570 ; ni remplacement du M570, ni simple finition M577. Les chiffres et postes d’équipage sont des réglages Tantalus, pas des statistiques officielles.',
    visualStatus: 'static-pose-action-animation-missing',
    animationStatus: 'missing', missionAtlasStatus: 'not-created',
    identityVerified: false, canonExact: false, physicalDimensionsMeters: null,
    description: 'Véhicule de défense et d’appui doté d’un affût quadruple rotatif et de bacs de lancement verticaux intégrés au pont avant. Plaque fixe adaptée du manuel licencié ; comportement et équipage réglés pour la simulation Tantalus.'
  }),
  freeze({
    id: 'vehicle-281-audi-lunar-quattro', shortId: 281,
    name: 'Audi lunar quattro', canonicalName: 'Audi lunar quattro',
    family: 'ground', fit: 'Standard', source: 'Weyland-Yutani',
    controlMode: 'teleoperated-uncrewed-rover', seats: freeze([]),
    actions: freeze(['remote-drive', 'survey', 'scan', 'observe', 'support']),
    hull: 24, speed: 8, cargo: 1, armor: 1,
    statsPolicy: 'v121-original-project-tuning-not-source-statistics',
    seatPolicy: 'uncrewed-remote-operation-no-human-seats',
    legacyCatalogName: null, canonicalVariant: null,
    provenance: 'licensed-reference', referenceStatus: 'LICENSED_MODEL_REFERENCE',
    sourceWork: 'Alien: Covenant (2017)',
    sourceUrl: 'https://media.audifrance.fr/le-rover-lunaire-audi-lunar-quattro-a-lecran-dans-le-film-alien-covenant/',
    referenceImageUrl: 'https://media.audifrance.fr/wp-content/uploads/2019/11/dd8b6859424492cd4a4e77b458490ced-2000x1333.jpg',
    appearances: freeze(['Alien: Covenant (2017)']),
    referenceFigure: 'Audi-Lunar-quattro-Alien-Covenant_2302.jpg',
    licensedFamilyFacts: freeze({
      model: 'Audi lunar quattro', manufacturer: 'Audi / Part-Time Scientists',
      film: 'Alien: Covenant (2017)', wheels: 4, explorationSupport: true,
      solarPanel: 'tiltable', referencePhoto: '2302', humanCockpitVisible: false,
      physicalDimensionsOfFictionalUnitNotAttested: true
    }),
    realPrototypeFacts: freeze({
      massKilograms: 30, aluminiumPercent: 85,
      scope: 'real-manufacturer-prototype-only-not-fictional-canon-unit-size',
      sourceUrl: 'https://media.audifrance.fr/le-rover-lunaire-audi-lunar-quattro-a-lecran-dans-le-film-alien-covenant/'
    }),
    referenceNote: 'Rover Audi documenté par le constructeur dans Covenant : quatre roues, panneau solaire et mât de caméras. Téléopéré, aucun siège humain ni armement. Valeurs de jeu adaptées ; les données du prototype réel ne sont pas des dimensions canoniques de son unité fictionnelle.',
    visualStatus: 'static-pose-action-animation-missing',
    animationStatus: 'missing', missionAtlasStatus: 'not-created',
    identityVerified: false, canonExact: false, physicalDimensionsMeters: null,
    description: 'Rover léger non habité destiné à la reconnaissance et à l’évaluation du terrain. Commandé à distance ; ses caméras et son panneau solaire restent distincts d’une tourelle ou d’une cabine pilotée. Adaptation fixe proche de la référence constructeur.'
  })
]);

const byId = new Map(VEHICLE_CATALOG_ADDITIONS_V121.map(vehicle => [vehicle.id, vehicle]));
export function getVehicleCatalogAdditionV121(value) {
  const id = typeof value === 'string' ? value : value && typeof value === 'object' && !Array.isArray(value)
    ? value.id || value.catalogId || value.vehicleId : null;
  return typeof id === 'string' ? byId.get(id) || null : null;
}
