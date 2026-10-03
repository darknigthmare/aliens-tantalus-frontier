import { VEHICLES } from './content-core-v50.js';
import { VEHICLE_CATALOG_ADDITIONS_V121 } from './vehicle-catalog-additions-v121.js';

// Only independently reviewed static inspection plates are admitted here.
// Their mission atlases, gameplay dimensions, statistics and fits are untouched.

const freeze = Object.freeze;
// Additive source correction; the historical V120 audit remains unchanged.
export const VEHICLE_SOURCE_CORRECTIONS_V121 = freeze({
  'vehicle-019-submersible-survey-skiff': freeze({
    sourceWork: 'Alien: The Roleplaying Game — Building Better Worlds',
    previousSourceWork: 'Prometheus', status: 'licensed-source-title-verified-visual-still-required',
    referenceUrl: 'https://d1vzi28wh99zvq.cloudfront.net/pdf_previews/453785-sample.pdf',
    evidence: 'Public licensed sample: printed contents page 3 (PDF page 5), equipment chapter entry points to page 70.',
    exactVisualAttested: false
  })
});
const correctedVehicleIds = new Map(VEHICLES.filter(vehicle =>
  vehicle.name.split(' — ')[0] === 'Weyland EVA-7C Series Pressure Pod'
).map(vehicle => [vehicle.id, VEHICLE_SOURCE_CORRECTIONS_V121['vehicle-019-submersible-survey-skiff']]));
/** Source metadata only, strictly bound to existing EVA-7C IDs and fits. */
export function getVehicleSourceCorrectionV121(source) {
  const id = typeof source === 'string' ? source : source && typeof source === 'object' && !Array.isArray(source)
    ? source.id || source.catalogId || source.vehicleId : null;
  return typeof id === 'string' ? correctedVehicleIds.get(id) || null : null;
}
const native = (profile) => freeze({
  canonicalName: profile.catalogName, visualLabel: profile.catalogName + ' — adaptation du design projet',
  sourceWork: 'Tantalus Frontier', release: 'v121', newlyGenerated: true,
  rawPath: profile.path, sheetId: null, grid: null, idleClip: null,
  visualMode: 'static-pose', animationStatus: 'missing', usage: 'catalog-inspection-only',
  reviewStatus: 'accepted-static-adaptation', reviewMethod: 'independent-browser-compositing-four-backgrounds',
  sourceFacing: 1, alphaBoundsThreshold: 16,
  groundAnchorStatus: 'measured-image-contact-band-not-gameplay-pivot',
  identityStatus: 'project-original-reference-adaptation', sourceProvenance: 'existing-project-action-atlas',
  referenceStatus: 'PROJECT_ORIGINAL', identityVerified: false, canonExact: false, approximate: true,
  catalogVariantMismatch: false, exactReferenceStillMissing: false,
  geometryStatus: 'authored-project-design-no-canon-certificate',
  physicalDimensionsMeters: null, physicalSizeStatus: 'project-scale-not-attested-by-external-reference',
  controlMode: 'vehicle-or-transport-system',
  fallbackReason: 'Illustration fixe adaptée de l’atlas propre au projet, sans origine cinématographique revendiquée. Cadrage et alpha relus indépendamment sur quatre fonds. Finitions partagées ; statistiques, emplacements et atlas de mission inchangés. Géométrie non certifiée 1:1 et aucune animation produite.',
  ...profile,
  alphaBounds: freeze([...profile.alphaBounds]),
  groundAnchorPixels: freeze([...profile.groundAnchorPixels]),
  groundAnchorNormalized: freeze([...profile.groundAnchorNormalized]),
  legacyAnimation: profile.legacyAnimation ? freeze({...profile.legacyAnimation}) : null
});
export const VEHICLE_NATIVE_POSES_V121 = freeze({
  audiLunarQuattroReference: native({
    "catalogBaseId": "vehicle-281-audi-lunar-quattro",
    "catalogName": "Audi lunar quattro",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/audi-lunar-quattro-reference-native-v121.png",
    "imageKey": "audiLunarQuattroReferenceNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
        115,
        14,
        1393,
        992
    ],
    "groundAnchorPixels": [
        483.5,
        992
    ],
    "groundAnchorNormalized": [
        0.3147786458333333,
        0.96875
    ],
    "renderWidth": 180,
    "renderHeight": 120,
    "sha256": "d82c4af0c7a164e7e904e61140148ca36c9a88e6e75cbe279b57c78c9fabb2cd",
    "sourceAtlasSha256": null,
    "configuration": "Rover d’exploration non habité de la photo officielle Audi 2302 : quatre roues à maillage métallique et bras indépendants, coque aluminium légère, panneau solaire rectangulaire et mât central portant trois apertures de caméra. Vue presque frontale de trois quarts conservée ; aucune cabine, siège humain ni arme ajoutés.",
    "legacyAnimation": null,
    "sourceFacing": 1,
    "canonicalName": "Audi lunar quattro",
    "visualLabel": "Audi lunar quattro — adaptation fixe de la photo constructeur Covenant",
    "sourceWork": "Alien: Covenant (2017)",
    "referenceStatus": "LICENSED_MODEL_REFERENCE",
    "identityStatus": "licensed-model-reference-adaptation",
    "sourceProvenance": "primary-manufacturer-film-photo",
    "geometryStatus": "manufacturer-photo-static-adaptation-no-certificate",
    "catalogVariantMismatch": false,
    "exactReferenceStillMissing": false,
    "physicalSizeStatus": "fictional-dimensions-unattested-real-prototype-data-separate",
    "missionAtlasStatus": "not-created",
    "actionAnimationStatus": "missing",
    "controlMode": "teleoperated-uncrewed-rover",
    "referenceImageSha256": "f2ca37fefa54c4041031de97b48b6eaf87e8beff2b8bf137dc39baa41ef766bf",
    "referenceUrl": "https://media.audifrance.fr/le-rover-lunaire-audi-lunar-quattro-a-lecran-dans-le-film-alien-covenant/",
    "referenceImageUrl": "https://media.audifrance.fr/wp-content/uploads/2019/11/dd8b6859424492cd4a4e77b458490ced-2000x1333.jpg",
    "fallbackReason": "Illustration fixe adaptée de la photo constructeur Audi 2302 du rover de Covenant et relue indépendamment sur quatre fonds. Rover téléopéré sans siège humain, pas un transport piloté ni un automate de combat. Statistiques réglées pour la simulation Tantalus ; les 30 kg du prototype réel ne définissent aucune mesure canonique fictionnelle. Géométrie non certifiée 1:1 et aucune animation produite ; aucun atlas d’un autre rover attribué par défaut."
}),
  m40ERidgewayReference: native({
    "catalogBaseId": "vehicle-005-m40-ridgeway-tank",
    "catalogName": "M40 Ridgeway Heavy Tank",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/m40-e-ridgeway-reference-native-v121.png",
    "imageKey": "m40ERidgewayReferenceNativeV121",
    "sourceWidth": 1774,
    "sourceHeight": 887,
    "alphaBounds": [
      43,
      189,
      1738,
      739
    ],
    "groundAnchorPixels": [
      988.5,
      738
    ],
    "groundAnchorNormalized": [
      0.5572153325817362,
      0.8320180383314544
    ],
    "renderWidth": 292,
    "renderHeight": 146,
    "sha256": "49918202f9e0b8398ad9262b6dced92a170bf3adfbd6217cb6168055f77cd28b",
    "sourceAtlasSha256": "e63aeb61fc4703e7955c1855136589bfe107a33beba53a25be815df138eaf061",
    "configuration": "M40-E du manuel licencié : sept galets visibles, coque basse verte à lame avant, canon long à gauche, tourelle angulaire sur la moitié arrière, parabole et bloc moteur élevé avec échelle arrière. Le M40 de base du catalogue n’est pas attesté par cette illustration M40-E.",
    "legacyAnimation": {
      "sheetId": "vehicle.m40-ridgeway-heavy-tank.action.v56",
      "imageKey": "m40RidgewayV56",
      "path": "/assets/openai/sprites/normalized/vehicles/m40-ridgeway-heavy-tank-action-sheet.png"
    },
    "sourceFacing": -1,
    "canonicalName": "M40-E Ridgeway Heavy Tank",
    "visualLabel": "M40-E Ridgeway — référence de famille, M40 de base non certifié",
    "sourceWork": "Alien: The Roleplaying Game — Colonial Marines Operations Manual",
    "referenceStatus": "LICENSED_FAMILY_REFERENCE",
    "identityStatus": "licensed-family-reference-adaptation",
    "sourceProvenance": "licensed-manual-figure-secondary-image-host",
    "geometryStatus": "m40-e-reference-base-m40-unattested",
    "catalogVariantMismatch": true,
    "exactReferenceStillMissing": true,
    "physicalSizeStatus": "not-attested-by-this-illustration",
    "referenceImageSha256": "b1a6f56202a6ceccbedc5abc2b1e4c62788a2652306578ad93d727ec82d6e62b",
    "referenceUrl": "https://app.demiplane.com/nexus/alienrpg/gear/m40-e-ridgeway-heavy-tank",
    "referenceImageUrl": "https://www.avpcentral.com/images/colonial-marine-vehicles/m40-e-ridgeway-heavy-tank.webp",
    "fallbackReason": "Illustration fixe adaptée du M40-E du manuel licencié. La référence atteste le M40-E, pas le M40 de base du catalogue ; aucune substitution d’identité canonique. Cadrage et alpha relus indépendamment sur quatre fonds. Finitions partagées ; statistiques, emplacements et atlas de mission inchangés. Géométrie non certifiée 1:1 et aucune animation produite."
  }),
  m579DaisycutterReference: native({
    "catalogBaseId": "vehicle-280-m579-daisycutter",
    "catalogName": "M579 Daisycutter",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/m579-daisycutter-reference-native-v121.png",
    "imageKey": "m579DaisycutterReferenceNativeV121",
    "sourceWidth": 1774,
    "sourceHeight": 887,
    "alphaBounds": [
      40,
      151,
      1756,
      755
    ],
    "groundAnchorPixels": [
      745.5,
      755
    ],
    "groundAnchorNormalized": [
      0.4202367531003382,
      0.8511837655016911
    ],
    "renderWidth": 280,
    "renderHeight": 140,
    "sha256": "dd9bddc52691131bf7ba9b20b47c024d6ef7a18280544bc5d81a0f3e71b2d93e",
    "sourceAtlasSha256": null,
    "configuration": "M579 « Daisycutter », Fig. 4.10 : coque à quatre roues (deux roues latérales visibles), porte centrale, affût arrière quad 20 mm à canons courts vers la droite et quatre bacs SIM-118 intégrés bas au pont avant. Correction ciblée des bacs trop élevés du premier essai.",
    "legacyAnimation": null,
    "sourceFacing": 1,
    "canonicalName": "M579 Daisycutter",
    "visualLabel": "M579 Daisycutter — adaptation fixe de la Fig. 4.10",
    "sourceWork": "Aliens: Colonial Marines Technical Manual",
    "referenceStatus": "LICENSED_MODEL_REFERENCE",
    "identityStatus": "licensed-model-reference-adaptation",
    "sourceProvenance": "licensed-manual-figure-secondary-image-host",
    "geometryStatus": "licensed-model-static-adaptation-no-certificate",
    "catalogVariantMismatch": false,
    "exactReferenceStillMissing": false,
    "physicalSizeStatus": "not-attested-by-this-illustration",
    "missionAtlasStatus": "not-created",
    "actionAnimationStatus": "missing",
    "referenceImageSha256": "747f4c935ba26280a36323b3eb9e979ffb49131f75eae901238e7807439b567c",
    "referenceUrl": "https://www.penguinrandomhouse.com/books/218640/aliens-colonial-marines-technical-manual-by-lee-brimmicombe-wood/",
    "referenceImageUrl": "https://www.avpcentral.com/images/colonial-marine-vehicles/m579-apc.webp",
    "fallbackReason": "Illustration fixe adaptée de la Fig. 4.10 M579 du manuel licencié et relue indépendamment sur quatre fonds. Modèle distinct de la série M570, pas une finition M577 ni un remplacement du M570. Bacs SIM-118 corrigés vers le profil abaissé de la figure. Statistiques et postes d’équipage issus du réglage Tantalus. Géométrie non certifiée 1:1 et aucune animation produite ; aucun atlas M577 attribué par défaut."
  }),
  m22JacksonReference: native({
    "catalogBaseId": "vehicle-004-m22a3-jackson-tank",
    "catalogName": "M22A3 Jackson Tank",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/m22-jackson-reference-native-v121.png",
    "imageKey": "m22JacksonReferenceNativeV121",
    "sourceWidth": 1774,
    "sourceHeight": 887,
    "alphaBounds": [
      36,
      37,
      1744,
      819
    ],
    "groundAnchorPixels": [
      948,
      818
    ],
    "groundAnchorNormalized": [
      0.5343855693348365,
      0.9222096956031567
    ],
    "renderWidth": 292,
    "renderHeight": 146,
    "sha256": "357c0d1f1107b032ac57a450985fe6cc07e633d3d8cbc9ba01ca68fbc9650a65",
    "sourceAtlasSha256": "be5d37d94f34cbe946dad7a3fa1e003763a0750d9207830dd0394e1781f4a096",
    "configuration": "Famille M22 Jackson montrée dans la Fig. 4.5 « Killer Clown » : coque basse, six galets visibles, canon long à gauche avec quatre marques jaunes, motif de requin rouge, antennes et parabole. A3 du catalogue non attesté par cette illustration.",
    "legacyAnimation": {
      "sheetId": "vehicle.m22a3-jackson-tank.action",
      "imageKey": "m22a3Jackson",
      "path": "/assets/openai/sprites/normalized/vehicles/m22a3-jackson-tank-action-sheet.png"
    },
    "sourceFacing": -1,
    "canonicalName": "M22 Jackson family",
    "visualLabel": "M22 Jackson — référence de famille, A3 non certifiée",
    "sourceWork": "Aliens: Colonial Marines Technical Manual",
    "referenceStatus": "LICENSED_FAMILY_REFERENCE",
    "identityStatus": "licensed-family-reference-adaptation",
    "sourceProvenance": "licensed-manual-figure-secondary-image-host",
    "geometryStatus": "m22-family-only-a3-subvariant-unattested",
    "catalogVariantMismatch": true,
    "exactReferenceStillMissing": true,
    "physicalSizeStatus": "not-attested-by-this-illustration",
    "referenceImageSha256": "f7373bcb7d26f85abef6e74931032f7cae8dc51b138647293c5b94e96ac92b2e",
    "referenceUrl": "https://www.penguinrandomhouse.com/books/218640/aliens-colonial-marines-technical-manual-by-lee-brimmicombe-wood/",
    "referenceImageUrl": "https://www.avpcentral.com/images/colonial-marine-vehicles/m22-jackson-tank.webp",
    "fallbackReason": "Illustration fixe adaptée de la Fig. 4.5 M22 Jackson du manuel licencié. La référence montre la famille M22, sans preuve de la sous-variante A3 du catalogue. Cadrage et alpha relus indépendamment sur quatre fonds. Finitions partagées ; statistiques, emplacements et atlas de mission inchangés. Géométrie non certifiée 1:1 et aucune animation produite."
  }),
  cetoPatrolBoat: native({
    "catalogBaseId": "vehicle-020-ceto-patrol-boat",
    "catalogName": "Ceto Patrol Boat",
    "category": "maritime",
    "path": "/assets/openai/equipment/v121-vehicles/ceto-patrol-boat-native-v121.png",
    "imageKey": "cetoPatrolBoatNativeV121",
    "sourceWidth": 1774,
    "sourceHeight": 887,
    "alphaBounds": [
      192,
      39,
      1582,
      855
    ],
    "groundAnchorPixels": [
      277.5,
      854
    ],
    "groundAnchorNormalized": [
      0.1564261555806088,
      0.9627959413754228
    ],
    "renderWidth": 300,
    "renderHeight": 150,
    "sha256": "21aaeef1ee664b08a1c2c087404808e0d275b23786ea1e38d6752a93083fb920",
    "sourceAtlasSha256": "fa159af3b263eeaba9a0a3cd383a30ecd24ab05411b44f6962e6734db0eb0760",
    "configuration": "Cabine vitrée avant à droite, coque de travail bleu-gris, pont arrière avec garde-corps et défenses ; bateau du projet sans eau ni équipage.",
    "legacyAnimation": {
      "sheetId": "vehicle.ceto-patrol-boat.action.v56",
      "imageKey": "cetoPatrolBoatV56",
      "path": "/assets/openai/sprites/normalized/vehicles/ceto-patrol-boat-action-sheet.png"
    }
  }),
  echo9ReconBike: native({
    "catalogBaseId": "vehicle-022-echo-9-recon-bike",
    "catalogName": "Echo-9 Recon Bike",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/echo-9-recon-bike-native-v121.png",
    "imageKey": "echo9ReconBikeNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      32,
      179,
      1515,
      912
    ],
    "groundAnchorPixels": [
      1300,
      911
    ],
    "groundAnchorNormalized": [
      0.8463541666666666,
      0.8896484375
    ],
    "renderWidth": 250,
    "renderHeight": 166.66666666666666,
    "sha256": "75d642b316d6097b83ba48e6a86f71a2b45510ce2c1e95a3df7afc988dc94f08",
    "sourceAtlasSha256": "d222d1927cef0d993368393bbfc15b665027a3465149799fa913891455a3b80c",
    "configuration": "Moto de reconnaissance vide olive-brun, deux roues à rayons complètes, moteur apparent, selle et coffre arrière ; profil droit.",
    "legacyAnimation": {
      "sheetId": "vehicle.echo-9-recon-bike.action.v56",
      "imageKey": "echo9ReconBikeV56",
      "path": "/assets/openai/sprites/normalized/vehicles/echo-9-recon-bike-action-sheet.png"
    }
  }),
  tantalusCommandSkiff: native({
    "catalogBaseId": "vehicle-021-tantalus-command-skiff",
    "catalogName": "Tantalus Command Skiff",
    "category": "hover",
    "path": "/assets/openai/equipment/v121-vehicles/tantalus-command-skiff-native-v121.png",
    "imageKey": "tantalusCommandSkiffNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      53,
      190,
      1482,
      871
    ],
    "groundAnchorPixels": [
      744.5,
      870
    ],
    "groundAnchorNormalized": [
      0.4847005208333333,
      0.849609375
    ],
    "renderWidth": 286,
    "renderHeight": 190.66666666666666,
    "sha256": "bec296139632afd53898c85ef60d7d85277e5ad7812d97d158dfa14969c1d02d",
    "sourceAtlasSha256": "e19732bcac94e8fb8dad425ee8b10cc300334cb7c0bc11af0fd3cf76263649c9",
    "configuration": "Compact olive-gray command hover utility van with slanted dark-glazed cab at right, tall rear equipment housing at left, two large circular ducted lift units along the visible side, skids beneath, central rectangular passenger door, subtle orange service indicators. Preserve its hovervan identity, not an ordinary wheeled van. No added extended antenna mast.",
    "referenceStatus": "PROJECT_ORIGINAL",
    "identityStatus": "project-original-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.tantalus-command-skiff.action.v56",
      "imageKey": "tantalusCommandSkiffV56",
      "path": "/assets/openai/sprites/normalized/vehicles/tantalus-command-skiff-action-sheet.png"
    }
  }),
  neuroXenoTransportRig: native({
    "catalogBaseId": "vehicle-024-neuro-xeno-transport-rig",
    "catalogName": "Neuro-Xeno Transport Rig",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/neuro-xeno-transport-rig-native-v121.png",
    "imageKey": "neuroXenoTransportRigNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      84,
      131,
      1472,
      952
    ],
    "groundAnchorPixels": [
      746.5,
      951
    ],
    "groundAnchorNormalized": [
      0.4860026041666667,
      0.9287109375
    ],
    "renderWidth": 270,
    "renderHeight": 180,
    "sha256": "585d90ba30d64750a61bae597b49d341c5f6647b10506ebb0f92e30ea9585730",
    "sourceAtlasSha256": "316a65649c375460a50911bad147155ce9754808c02c5b3fdc1e3ffd9ae5d4aa",
    "configuration": "White and dark-gray industrial containment transport crawler, cab at right with three dark rectangular windows, tall single sealed rounded rectangular cyan-tinted containment pod at center, scientific machinery and equipment housings at left rear, black-yellow warning stripes, exactly two separate short track assemblies along the visible side. Preserve the closed pod; no creature inside, no ladder deployed.",
    "referenceStatus": "PROJECT_ORIGINAL",
    "identityStatus": "project-original-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.neuro-xeno-transport-rig.action.v56",
      "imageKey": "neuroXenoTransportRigV56",
      "path": "/assets/openai/sprites/normalized/vehicles/neuro-xeno-transport-rig-action-sheet.png"
    }
  }),
  miningBoreCrawler: native({
    "catalogBaseId": "vehicle-031-mining-bore-crawler",
    "catalogName": "Mining Bore Crawler",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/mining-bore-crawler-native-v121.png",
    "imageKey": "miningBoreCrawlerNativeV121",
    "sourceWidth": 1774,
    "sourceHeight": 887,
    "alphaBounds": [
      143,
      161,
      1650,
      788
    ],
    "groundAnchorPixels": [
      842.5,
      787
    ],
    "groundAnchorNormalized": [
      0.4749154453213078,
      0.887260428410372
    ],
    "renderWidth": 294,
    "renderHeight": 147,
    "sha256": "32b2338287cccc9bdba197d517ac2da85328f5049b57db5e0b7b134969a20e3c",
    "sourceAtlasSha256": "d218ecc2dab9ddaa290d706a96238955f5252fa3a74e705c81aa77aef341bb9e",
    "configuration": "Ochre yellow and charcoal industrial tunnel boring crawler, cab at right with row of four rectangular cyan-gray windows and yellow side door, large circular boring cutter drum at far right nose with studded edge, slanted structural maintenance conveyor/support across rear body on left, rear radiator housing, exactly three distinct short track assemblies along visible side. Keep large front cutter, not a drill spike.",
    "referenceStatus": "PROJECT_ORIGINAL",
    "identityStatus": "project-original-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.mining-bore-crawler.action.v56",
      "imageKey": "miningBoreCrawlerV56",
      "path": "/assets/openai/sprites/normalized/vehicles/mining-bore-crawler-action-sheet.png"
    }
  }),
  iceDriller: native({
    "catalogBaseId": "vehicle-034-ice-driller",
    "catalogName": "Ice Driller",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/ice-driller-native-v121.png",
    "imageKey": "iceDrillerNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      82,
      222,
      1511,
      864
    ],
    "groundAnchorPixels": [
      703,
      864
    ],
    "groundAnchorNormalized": [
      0.4576822916666667,
      0.84375
    ],
    "renderWidth": 288,
    "renderHeight": 192,
    "sha256": "05b0709df1dd6c5f73cc834efa7639ba100c2215039fa66112195b4e331c28fb",
    "sourceAtlasSha256": "a9e43362067958644795d91d1052081c9d7be8d3ef86351e54e3746a3cc83ad7",
    "configuration": "Dirty off-white industrial ice drilling crawler, tall boxy cab at right with three dark side windows and forward slanted windshield, rear radiator housing at left, short horizontal conical spiral drill projecting from right nose with orange base collar, exactly two separate short track assemblies along visible side, roof cargo rails and one amber warning beacon. Preserve short cone drill, not a giant mining drum.",
    "referenceStatus": "PROJECT_ORIGINAL",
    "identityStatus": "project-original-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.ice-driller.action.v56",
      "imageKey": "iceDrillerV56",
      "path": "/assets/openai/sprites/normalized/vehicles/ice-driller-action-sheet.png"
    }
  }),
  reefHydrofoil: native({
    "catalogBaseId": "vehicle-035-reef-hydrofoil",
    "catalogName": "Reef Hydrofoil",
    "category": "marine",
    "path": "/assets/openai/equipment/v121-vehicles/reef-hydrofoil-native-v121.png",
    "imageKey": "reefHydrofoilNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      158,
      280,
      1381,
      868
    ],
    "groundAnchorPixels": [
      746.5,
      867
    ],
    "groundAnchorNormalized": [
      0.4860026041666667,
      0.8466796875
    ],
    "renderWidth": 286,
    "renderHeight": 190.66666666666666,
    "sha256": "cab9a1a9e546661919938fd09c91923a9c59b49274a8b4caab02d810ebf94766",
    "sourceAtlasSha256": "da27de8f14bfcc2f73a37a648d041518ccf350b14b1dac5b5d8eb96b37e53afd",
    "configuration": "Pale teal-gray small industrial hydrofoil workboat: raised pointed bow at right, forward angular glazed cabin with three square side windows, aft open railed working deck carrying a stack of hard cargo crates, exactly two visible long vertical hydrofoil struts under the hull each terminating in a short horizontal foil. The struts are integral vehicle foils, NOT a studio display stand, must retain both completely.",
    "referenceStatus": "PROJECT_ORIGINAL",
    "identityStatus": "project-original-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.reef-hydrofoil.action.v56",
      "imageKey": "reefHydrofoilV56",
      "path": "/assets/openai/sprites/normalized/vehicles/reef-hydrofoil-action-sheet.png"
    }
  }),
  orbitalLifeboat: native({
    "catalogBaseId": "vehicle-026-orbital-lifeboat",
    "catalogName": "Orbital Lifeboat",
    "category": "space",
    "path": "/assets/openai/equipment/v121-vehicles/orbital-lifeboat-native-v121.png",
    "imageKey": "orbitalLifeboatNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      137,
      214,
      1408,
      848
    ],
    "groundAnchorPixels": [
      794.5,
      847
    ],
    "groundAnchorNormalized": [
      0.5172526041666666,
      0.8271484375
    ],
    "renderWidth": 280,
    "renderHeight": 186.66666666666666,
    "sha256": "e6073496145e4967cc056f1a2eba18f91dcee9e5597c6bd9045af305eabd77c3",
    "sourceAtlasSha256": "07fb43aad9fb61ad1dc5de177366137be07ba28d40852ad2c2650874860908b9",
    "configuration": "Off-white rounded rectangular orbital escape capsule with dark charcoal belly, three tall service panel bays along side, small rounded black cockpit window in right forward section, small closed orange-edged passenger door below it, large circular rear cylindrical propulsion housing at left, exactly two extended articulated landing feet beneath. Keep its rounded capsule hull and small window, not a winged dropship.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.orbital-lifeboat.action.v56",
      "imageKey": "orbitalLifeboatV56",
      "path": "/assets/openai/sprites/normalized/vehicles/orbital-lifeboat-action-sheet.png"
    }
  }),
  colonyCargoLifter: native({
    "catalogBaseId": "vehicle-027-colony-cargo-lifter",
    "catalogName": "Colony Cargo Lifter",
    "category": "air",
    "path": "/assets/openai/equipment/v121-vehicles/colony-cargo-lifter-native-v121.png",
    "imageKey": "colonyCargoLifterNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      89,
      178,
      1448,
      799
    ],
    "groundAnchorPixels": [
      764.5,
      798
    ],
    "groundAnchorNormalized": [
      0.4977213541666667,
      0.779296875
    ],
    "renderWidth": 270,
    "renderHeight": 180,
    "sha256": "169fd30715f09321795a36d3df5472836c0f0460eecd7b8fbb656043bf56e742",
    "sourceAtlasSha256": "e0694651021efa71d115c32ae8534319a8c4c296aa27b9f7a30a2c8308b90f69",
    "configuration": "Long dark-gray industrial hovering cargo flatbed with empty low railed cargo bed covering left three-quarters, tall narrow box cabin at right forward end, exactly two large rectangular lift engine nacelles along visible underside with ochre service bands, compact landing pads attached beneath nacelles. No wheels. No cargo crane extended, no ramp extended. Preserve cargo deck distinct from passenger shuttle.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.colony-cargo-lifter.action.v56",
      "imageKey": "colonyCargoLifterV56",
      "path": "/assets/openai/sprites/normalized/vehicles/colony-cargo-lifter-action-sheet.png"
    }
  }),
  executiveShuttle: native({
    "catalogBaseId": "vehicle-028-weyland-yutani-executive-shuttle",
    "catalogName": "Weyland-Yutani Executive Shuttle",
    "category": "space",
    "path": "/assets/openai/equipment/v121-vehicles/weyland-yutani-executive-shuttle-native-v121.png",
    "imageKey": "executiveShuttleNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      155,
      187,
      1369,
      897
    ],
    "groundAnchorPixels": [
      777.5,
      897
    ],
    "groundAnchorNormalized": [
      0.5061848958333334,
      0.8759765625
    ],
    "renderWidth": 286,
    "renderHeight": 190.66666666666666,
    "sha256": "4a91a70d7f040e65a220b76700603cdf1d3b98f317e9a4d44ff2795b10a66edf",
    "sourceAtlasSha256": "a904d9d12b7a43d7cc11af5e0bc86f875b4a41afd5cfbf1a09a709fa3f9c92b2",
    "configuration": "Cream-white and burgundy corporate passenger shuttle with long row of about eight tall dark gold-tinted rectangular cabin windows, blunt angled cab/nose at right, one small closed dark burgundy-edged door below forward windows, two large stacked cylindrical propulsion housings at left rear, dark belly and exactly two articulated landing feet. Keep this project's passenger design; do not replace it with an unrelated film ship or logos.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.weyland-yutani-executive-shuttle.action.v56",
      "imageKey": "executiveShuttleV56",
      "path": "/assets/openai/sprites/normalized/vehicles/weyland-yutani-executive-shuttle-action-sheet.png"
    }
  }),
  uscmAssaultGunship: native({
    "catalogBaseId": "vehicle-025-uscm-assault-gunship",
    "catalogName": "USCM Assault Gunship",
    "category": "air",
    "path": "/assets/openai/equipment/v121-vehicles/uscm-assault-gunship-native-v121.png",
    "imageKey": "uscmAssaultGunshipNativeV121",
    "sourceWidth": 1430,
    "sourceHeight": 1100,
    "alphaBounds": [
      99,
      232,
      1372,
      902
    ],
    "groundAnchorPixels": [
      678,
      901
    ],
    "groundAnchorNormalized": [
      0.47412587412587415,
      0.8190909090909091
    ],
    "renderWidth": 290,
    "renderHeight": 223.07692307692307,
    "sha256": "1d5653c7707c8e84d207df056c4ef08431e43be420dc56079f9bba799ca4d62d",
    "sourceAtlasSha256": "f8def9a53f2984d0b3c3c42daa8fe586c715587153e54f6e666b7edffba9835c",
    "configuration": "Compact olive military VTOL: blunt armored fuselage with closed rectangular side troop door, angled cockpit at right with dark multi-pane glazing, rear circular cylindrical engine at left, small swept vertical fin on upper rear, exactly two visible large horizontal lift fans projecting from lower near side (open upward-facing fan discs), small lower forward gun barrel. Keep project's compact two-fan gunship, no unrelated movie aircraft.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.uscm-assault-gunship.action.v56",
      "imageKey": "uscmAssaultGunshipV56",
      "path": "/assets/openai/sprites/normalized/vehicles/uscm-assault-gunship-action-sheet.png"
    }
  }),
  uppCombatAerodyne: native({
    "catalogBaseId": "vehicle-029-upp-combat-aerodyne",
    "catalogName": "UPP Combat Aerodyne",
    "category": "air",
    "path": "/assets/openai/equipment/v121-vehicles/upp-combat-aerodyne-native-v121.png",
    "imageKey": "uppCombatAerodyneNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      127,
      281,
      1415,
      808
    ],
    "groundAnchorPixels": [
      753,
      808
    ],
    "groundAnchorNormalized": [
      0.490234375,
      0.7890625
    ],
    "renderWidth": 286,
    "renderHeight": 190.66666666666666,
    "sha256": "6dc425b545c5d04d854dbd08083c89f0d4e9560de6f11cc07256e4f27ec8379d",
    "sourceAtlasSha256": "a4c567ae241e77c7cd3c51e4837e2ce2c1baf7e14db9979262d45752a827289b",
    "configuration": "Gray-green utilitarian hover personnel carrier: long box cabin with five square dark-blue passenger windows and forward windshield at right, central closed door, small rectangular red service panels, rear box radiator equipment at left, exactly two visible horizontal lift fan discs beneath visible side, short skids underneath. No added tail fin, distinguish this elongated passenger hovercraft from the compact USCM gunship.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.upp-combat-aerodyne.action.v56",
      "imageKey": "uppCombatAerodyneV56",
      "path": "/assets/openai/sprites/normalized/vehicles/upp-combat-aerodyne-action-sheet.png"
    }
  }),
  crucibleCrawler: native({
    "catalogBaseId": "vehicle-023-crucible-caravan-crawler",
    "catalogName": "Crucible Caravan Crawler",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/crucible-caravan-crawler-native-v121.png",
    "imageKey": "crucibleCrawlerNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      95,
      157,
      1410,
      924
    ],
    "groundAnchorPixels": [
      709,
      923
    ],
    "groundAnchorNormalized": [
      0.4615885416666667,
      0.9013671875
    ],
    "renderWidth": 300,
    "renderHeight": 200,
    "sha256": "39de8e5c8c7fa787ed40dd023ae5944b06fb011b6ee6c5a8e5c330842f43cc9b",
    "sourceAtlasSha256": "628277c9435920ca7c480d2b67701b9858d50d1460eabc7f7be4540edd12d146",
    "configuration": "Large brown-beige frontier caravan crawler: boxy habitable rear cabin at left with narrow panel seams, one small square lit service window rear, closed central passenger door, right forward slanted glazed driving cab, exactly three separated small track units along near side, roof rails and strapped cargo rolls with narrow antenna at rear. Intact doors closed, no deployed ladder or satellite dish.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.crucible-caravan-crawler.action.v56",
      "imageKey": "crucibleCrawlerV56",
      "path": "/assets/openai/sprites/normalized/vehicles/crucible-caravan-crawler-action-sheet.png"
    }
  }),
  hyperdyneCarrier: native({
    "catalogBaseId": "vehicle-030-hyperdyne-synthetic-carrier",
    "catalogName": "Hyperdyne Synthetic Carrier",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/hyperdyne-synthetic-carrier-native-v121.png",
    "imageKey": "hyperdyneCarrierNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      165,
      295,
      1398,
      817
    ],
    "groundAnchorPixels": [
      816,
      817
    ],
    "groundAnchorNormalized": [
      0.53125,
      0.7978515625
    ],
    "renderWidth": 280,
    "renderHeight": 186.66666666666666,
    "sha256": "3fe31271048a395296d2e7843a835a3dbd2c8ebdbf7f3dafb0bbb1c817f6eac8",
    "sourceAtlasSha256": "f066dfa75496cd92030e3bad17bd6452d8d224cda143cd7e18793187755b135a",
    "configuration": "Dark-gray long industrial transport truck: high rectangular armored cargo body at left with repeated tall vertical sealed storage panel bays, very low compact cab at right forward end, exactly three visible full road wheels under side, small folded manipulator crane stowed lengthwise on roof. Preserve straight cargo housing for synthetic transport, not a humanoid robot or tracked tank; no passengers or cargo doors open.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.hyperdyne-synthetic-carrier.action.v56",
      "imageKey": "hyperdyneCarrierV56",
      "path": "/assets/openai/sprites/normalized/vehicles/hyperdyne-synthetic-carrier-action-sheet.png"
    }
  }),
  seegsonTram: native({
    "catalogBaseId": "vehicle-017-seegson-maintenance-tram",
    "catalogName": "Seegson Maintenance Tram",
    "category": "rail",
    "path": "/assets/openai/equipment/v121-vehicles/seegson-maintenance-tram-native-v121.png",
    "imageKey": "seegsonTramNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      141,
      196,
      1359,
      858
    ],
    "groundAnchorPixels": [
      778.5,
      857
    ],
    "groundAnchorNormalized": [
      0.5068359375,
      0.8369140625
    ],
    "renderWidth": 268,
    "renderHeight": 178.66666666666666,
    "sha256": "eb0786b5f6de8225bca565c8c48f522c8e082084c9f1a40842a9153f3d7654d1",
    "sourceAtlasSha256": "b6cd5a331a599957b082422c41a38e135876add3849d0cb5842bc5d7df093bff",
    "configuration": "Cream off-white compact rail maintenance cab with orange service hatches on near side, rectangular closed central utility compartment/door, slanted dark glazed driving cab at right, vents and small service modules at left, two short bogies with exactly four small visible rail wheels in total. Preserve source rail vehicle shape, no ground tires, no crane deployed, no rail track drawn.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.seegson-maintenance-tram.action.v56",
      "imageKey": "seegsonTramV56",
      "path": "/assets/openai/sprites/normalized/vehicles/seegson-maintenance-tram-action-sheet.png"
    }
  }),
  maglevPersonnelCar: native({
    "catalogBaseId": "vehicle-033-maglev-personnel-car",
    "catalogName": "Maglev Personnel Car",
    "category": "rail",
    "path": "/assets/openai/equipment/v121-vehicles/maglev-personnel-car-native-v121.png",
    "imageKey": "maglevPersonnelCarNativeV121",
    "sourceWidth": 1956,
    "sourceHeight": 804,
    "alphaBounds": [
      173,
      162,
      1784,
      647
    ],
    "groundAnchorPixels": [
      978,
      646
    ],
    "groundAnchorNormalized": [
      0.5,
      0.8034825870646766
    ],
    "renderWidth": 288,
    "renderHeight": 118.38036809815951,
    "sha256": "1cb9fe1dbdc54f95d0b7bfe9e064f51233ad07d1c5901f4cc261a659757eec6b",
    "sourceAtlasSha256": "15040e678415d529d51bc6e70e6a031df0ca8d6cb0455cff7946df2269541eba",
    "configuration": "Cream off-white and orange single maglev passenger carriage, elongated rounded rectangular body, exactly three large central dark rectangular passenger windows, a closed double door near each end with narrow black glass panes, orange horizontal stripe at window-sill level, small symmetric dark low underframe propulsion/guide pods near both ends, subtle roof service panels. Preserve one intact carriage, not locomotive or bus; no rail or station drawn.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.maglev-personnel-car.action.v56",
      "imageKey": "maglevPersonnelCarV56",
      "path": "/assets/openai/sprites/normalized/vehicles/maglev-personnel-car-action-sheet.png"
    }
  }),
  processorElevator: native({
    "catalogBaseId": "vehicle-032-atmospheric-processor-elevator",
    "catalogName": "Atmospheric Processor Elevator",
    "category": "rail",
    "path": "/assets/openai/equipment/v121-vehicles/atmospheric-processor-elevator-native-v121.png",
    "imageKey": "processorElevatorNativeV121",
    "sourceWidth": 1380,
    "sourceHeight": 1140,
    "alphaBounds": [
      250,
      98,
      1114,
      1030
    ],
    "groundAnchorPixels": [
      675.5,
      1029
    ],
    "groundAnchorNormalized": [
      0.4894927536231884,
      0.9026315789473685
    ],
    "renderWidth": 190,
    "renderHeight": 156.95652173913044,
    "sha256": "e191d6690c5854b7a100d4f1edd8d3e6d545e35f208cb5b10920c7282d72fa97",
    "sourceAtlasSha256": "1095a94d4884b5ff47bc177d410dd52913a5e47cba4a335afad285415745c574",
    "configuration": "Dark industrial elevator cabin viewed from front: square framed chamber with two central closed sliding metal doors bearing narrow orange-black caution stripe at lower third, small vertical control box at right edge, a vertical guide/rack structure with five exposed guide rollers down left side, compact hoist mechanism and two short vertical cable/guide rods above center. All guide hardware integral and entirely visible. Preserve front elevation with machinery at LEFT. Do not transform into a driving vehicle.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.atmospheric-processor-elevator.action.v56",
      "imageKey": "processorElevatorV56",
      "path": "/assets/openai/sprites/normalized/vehicles/atmospheric-processor-elevator-action-sheet.png"
    },
    "viewpoint": "front-elevation",
    "transportContext": "vertical-shaft",
    "configurationStatus": "integral-guide-machinery-not-driving-vehicle"
  }),
  ua571Carrier: native({
    "catalogBaseId": "vehicle-012-ua-571-remote-sentry-carrier",
    "catalogName": "UA-571 Remote Sentry Carrier",
    "category": "ground",
    "path": "/assets/openai/equipment/v121-vehicles/ua-571-remote-sentry-carrier-native-v121.png",
    "imageKey": "ua571CarrierNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      159,
      158,
      1370,
      900
    ],
    "groundAnchorPixels": [
      710,
      899
    ],
    "groundAnchorNormalized": [
      0.4622395833333333,
      0.8779296875
    ],
    "renderWidth": 214,
    "renderHeight": 142.66666666666666,
    "sha256": "e5ce75aa923c151a85f4e8d7e32c0be322d4b5a3ebe834951f107021f3dc31af",
    "sourceAtlasSha256": "163132a4c5bb7dc081c0f6a2042ad79812a4211ab9cfecf5e315a9328be0b239",
    "configuration": "Olive military utility pickup truck with cab at right, exactly two full visible off-road rubber wheels along near side, empty open rear cargo bed at left carrying a boxy folded robotic sentry cannon mount with short barrel facing right and cable looping around rear. Neutral intact frame row1col1 folded mount, no muzzle flash and no tripod deployed. This is a transport design authored by project, not an officially sourced canon vehicle.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.ua571-remote-sentry-carrier.action.v56",
      "imageKey": "ua571CarrierV56",
      "path": "/assets/openai/sprites/normalized/vehicles/ua-571-remote-sentry-carrier-action-sheet.png"
    },
    "referenceCaveat": "UA-571 names the gun system; this wheeled carrier is an authored project design, not a documented film vehicle."
  }),
  combatPowerLoader: native({
    "catalogBaseId": "vehicle-008-combat-power-loader",
    "catalogName": "Combat Power Loader",
    "category": "exosuit",
    "path": "/assets/openai/equipment/v121-vehicles/combat-power-loader-native-v121.png",
    "imageKey": "combatPowerLoaderNativeV121",
    "sourceWidth": 1290,
    "sourceHeight": 1219,
    "alphaBounds": [
      117,
      28,
      1241,
      1171
    ],
    "groundAnchorPixels": [
      380,
      1171
    ],
    "groundAnchorNormalized": [
      0.29457364341085274,
      0.9606234618539786
    ],
    "renderWidth": 156,
    "renderHeight": 147.4139534883721,
    "sha256": "0acbd3e93117aeadb4d78b97e998a5ac94326c7672208526db6b3d9e15bbf1a9",
    "sourceAtlasSha256": "9da8381e8848ae6ef37d113bf1fb190e5836b0768e94333b819b693558569927",
    "configuration": "Yellow-ochre human-piloted industrial combat power loader as in row1col1. Tall OPEN roll cage surrounding an empty human-sized pilot seat, shoulder restraint and manual two handles/pedals. Rear backpack at left. Two articulated hydraulic biped legs with broad flat feet. Long near arm projects lower-right ending in a large horizontal two-finger rectangular industrial clamp; far arm shorter forward pincer. Preserve the hydraulic geometry, cab access and human controls from source. Remove only the actual person from seat; NEVER close cockpit or turn into robot/Automated Powerloader.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.combat-power-loader.action.v56",
      "imageKey": "combatPowerLoaderV56",
      "path": "/assets/openai/sprites/normalized/vehicles/combat-power-loader-action-sheet.png"
    },
    "controlMode": "piloted-exoskeleton",
    "distinctAutomatonId": "synth-automated-powerloader"
  }),
  ripperSiegeLoader: native({
    "catalogBaseId": "vehicle-036-ripper-siege-loader",
    "catalogName": "Ripper Siege Loader",
    "category": "exosuit",
    "path": "/assets/openai/equipment/v121-vehicles/ripper-siege-loader-native-v121.png",
    "imageKey": "ripperSiegeLoaderNativeV121",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      194,
      38,
      1338,
      972
    ],
    "groundAnchorPixels": [
      607,
      971
    ],
    "groundAnchorNormalized": [
      0.3951822916666667,
      0.9482421875
    ],
    "renderWidth": 170,
    "renderHeight": 113.33333333333333,
    "sha256": "000381f1877579717ea70f6e0254bb514cee523f427aed649632c66bc99372b3",
    "sourceAtlasSha256": "485a452f5355b96ee804d70307ba8bdd5faff1f67ddd77f21efe45a224f4fd9e",
    "configuration": "Orange and charcoal heavy HUMAN-PILOTED biped industrial siege loader exactly shaped as intact row1col1. Open rectangular roll cage and empty human-sized seat with harness/manual handles/pedals, orange rear backpack on left, two heavy articulated hydraulic legs and broad feet. Large orange armored upper arm extends right ending in heavy opposing industrial clamp; second lower arm extends front-right ending in a vertical downward-pointing drill/jackhammer. All tools, feet and back module intact. Remove only actual person; preserve cockpit, no closed robot body or Automated Powerloader redesign.",
    "referenceStatus": "PROJECT_ADAPTATION",
    "identityStatus": "project-adaptation-reference-adaptation",
    "legacyAnimation": {
      "sheetId": "vehicle.ripper-siege-loader.action.v56",
      "imageKey": "ripperSiegeLoaderV56",
      "path": "/assets/openai/sprites/normalized/vehicles/ripper-siege-loader-action-sheet.png"
    },
    "controlMode": "piloted-exoskeleton",
    "distinctAutomatonId": "synth-automated-powerloader"
  })
});
export const VEHICLE_NATIVE_ASSETS_V121 = Object.freeze(Object.fromEntries(
  Object.values(VEHICLE_NATIVE_POSES_V121).map(pose => [pose.imageKey, pose.path])
));
const poseByBaseName = new Map(Object.entries(VEHICLE_NATIVE_POSES_V121).map(([key, pose]) => [pose.catalogName, key]));
const catalogVehicles = [...new Map([...VEHICLES, ...VEHICLE_CATALOG_ADDITIONS_V121].map(vehicle => [vehicle.id, vehicle])).values()];
export const VEHICLE_NATIVE_CATALOG_BINDINGS_V121 = Object.freeze(Object.fromEntries(catalogVehicles.flatMap(vehicle => {
  const key = poseByBaseName.get(vehicle.name.split(' — ')[0]);
  return key ? [[vehicle.id, Object.freeze({ key, catalogId: vehicle.id, fit: vehicle.fit, isVariant: vehicle.fit !== 'Standard' })]] : [];
})));

/** Strict historical and append-only catalog IDs: no guessed chassis fallback. */
export function resolveNativeVehicleCatalogVisualV121(source = {}) {
  const id = typeof source === 'string' ? source : source && typeof source === 'object' && !Array.isArray(source)
    ? source.id || source.catalogId || source.vehicleId : null;
  if (typeof id !== 'string' || !Object.hasOwn(VEHICLE_NATIVE_CATALOG_BINDINGS_V121, id)) return null;
  const binding = VEHICLE_NATIVE_CATALOG_BINDINGS_V121[id], pose = VEHICLE_NATIVE_POSES_V121[binding.key];
  return Object.freeze({ ...pose, catalogId: binding.catalogId, fit: binding.fit,
    isVariant: binding.isVariant, authoredFamily: binding.isVariant,
    catalogVariantMismatch: binding.isVariant || pose.catalogVariantMismatch === true,
    identity: Object.freeze({ status: pose.identityStatus, referenceStatus: pose.referenceStatus,
      exact: false, canonExact: false, approximate: true, identityVerified: false, fallbackReason: pose.fallbackReason })
  });
}
