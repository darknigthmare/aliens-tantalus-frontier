/** Twenty-five authored rear-wall installations for the engineering spaces.
 * Each record is one complete functional set, not a count of bolts or lamps.
 * Bounds are room-local; the renderer owns the existing room projection.
 * These fixtures add neither a collider nor a new navigation surface. */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

export const HUB_ENGINEERING_DETAILS_V168 = freeze([
  {
    "id": "T168-E01",
    "roomId": "dropship-hangar",
    "kind": "flight-kit",
    "purpose": "ground-crew-flight-harness-and-inspection-kit",
    "bounds": {
      "x": 160,
      "y": 234,
      "w": 80,
      "h": 60
    },
    "mount": "rear-wall",
    "note": "Baie murale ouest avant la zone vitrée, au-dessus des portes et hors de la coque du dropship."
  },
  {
    "id": "T168-E02",
    "roomId": "dropship-hangar",
    "kind": "hydraulic-accumulator",
    "purpose": "landing-gear-ground-hydraulics-isolation",
    "bounds": {
      "x": 640,
      "y": 344,
      "w": 80,
      "h": 60
    },
    "mount": "rear-wall",
    "note": "Module de support au train entre les outils hauts et la silhouette du véhicule ; aucune pièce posée sur sa trajectoire."
  },
  {
    "id": "T168-E03",
    "roomId": "dropship-hangar",
    "kind": "battery-charger",
    "purpose": "ground-support-battery-charging-and-retention",
    "bounds": {
      "x": 832,
      "y": 344,
      "w": 80,
      "h": 56
    },
    "mount": "rear-wall",
    "note": "Recharge des batteries de piste dans la baie droite, sous les outils de passerelle et avant le coffret électrique natif."
  },
  {
    "id": "T168-E04",
    "roomId": "reactor",
    "kind": "pressure-gauges",
    "purpose": "reactor-primary-loop-pressure-and-service-readout",
    "bounds": {
      "x": 384,
      "y": 256,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Petit banc de mesures entre le hublot et l’équipement arrière, sans recouvrir le sas de service."
  },
  {
    "id": "T168-E05",
    "roomId": "reactor",
    "kind": "electrical-isolator",
    "purpose": "reactor-maintenance-lockout-and-test-points",
    "bounds": {
      "x": 800,
      "y": 234,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Consignation électrique au-dessus de la baie centrale, distincte de ses conduites et de la plaque de salle."
  },
  {
    "id": "T168-E06",
    "roomId": "reactor",
    "kind": "coolant-loop",
    "purpose": "closed-reactor-coolant-sampling-and-bypass",
    "bounds": {
      "x": 992,
      "y": 432,
      "w": 96,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Circuit fermé de prélèvement sous les raccords natifs, fixé au mur et au-dessus des coffres de maintenance."
  },
  {
    "id": "T168-E07",
    "roomId": "life-support",
    "kind": "oxygen-locker",
    "purpose": "sealed-reserve-oxygen-service-cartridges",
    "bounds": {
      "x": 160,
      "y": 212,
      "w": 64,
      "h": 72
    },
    "mount": "rear-wall",
    "note": "Cartouches fermées dans la baie murale gauche, au-dessus du traitement d’air et hors du hublot."
  },
  {
    "id": "T168-E08",
    "roomId": "life-support",
    "kind": "valve-box",
    "purpose": "air-loop-isolation-and-maintenance-bypass",
    "bounds": {
      "x": 672,
      "y": 278,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Vannes de dérivation au-dessus de l’entrée vers les services, sans traverser son volume de porte."
  },
  {
    "id": "T168-E09",
    "roomId": "life-support",
    "kind": "air-filter",
    "purpose": "removable-clean-filter-inspection-housing",
    "bounds": {
      "x": 880,
      "y": 366,
      "w": 72,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Cartouche de filtration sous le retour haut, près des stocks d’air mais séparée du terminal au sol."
  },
  {
    "id": "T168-E10",
    "roomId": "sensor-array",
    "kind": "clock-bank",
    "purpose": "receiver-timing-reference-and-sync-status",
    "bounds": {
      "x": 1024,
      "y": 190,
      "w": 80,
      "h": 40
    },
    "mount": "rear-wall",
    "note": "Horloges de synchronisation sur une baie haute à droite des lignes de signal, sans agrandir la console de balayage."
  },
  {
    "id": "T168-E11",
    "roomId": "sensor-array",
    "kind": "sensor-calibration",
    "purpose": "receiver-reference-and-calibration-standard",
    "bounds": {
      "x": 160,
      "y": 388,
      "w": 80,
      "h": 56
    },
    "mount": "rear-wall",
    "note": "Étalon de réception sous le hublot gauche et au-dessus du terminal ; le passage d’échelle reste libre."
  },
  {
    "id": "T168-E12",
    "roomId": "sensor-array",
    "kind": "patch-bay",
    "purpose": "sensor-array-line-patching-and-receiver-routing",
    "bounds": {
      "x": 928,
      "y": 322,
      "w": 64,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Terminaisons entre la baie de réception arrière et le casier de registres, hors des gaines natives."
  },
  {
    "id": "T168-E13",
    "roomId": "arrival-airlock",
    "kind": "hygiene-dispenser",
    "purpose": "sealed-entry-hand-and-equipment-decontamination",
    "bounds": {
      "x": 224,
      "y": 256,
      "w": 64,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Distributeur fermé à côté du montant gauche, avant la station de décontamination et hors des canalisations."
  },
  {
    "id": "T168-E14",
    "roomId": "arrival-airlock",
    "kind": "pressure-gauges",
    "purpose": "inner-and-outer-airlock-pressure-reference",
    "bounds": {
      "x": 672,
      "y": 212,
      "w": 80,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "Deux pressions de sas dans une petite baie à gauche de son identification, près des commandes et hors de la baie de traitement native."
  },
  {
    "id": "T168-E15",
    "roomId": "arrival-airlock",
    "kind": "oxygen-locker",
    "purpose": "sealed-emergency-breathing-set-at-return-zone",
    "bounds": {
      "x": 1632,
      "y": 278,
      "w": 80,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Réserve respiratoire sur le mur du retour équipage, en amont et au-dessus de l’ouverture de porte."
  },
  {
    "id": "T168-E16",
    "roomId": "escape-pods",
    "kind": "muster-kit",
    "purpose": "evacuation-manifest-and-muster-equipment",
    "bounds": {
      "x": 288,
      "y": 256,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Trousse de rassemblement proche de l’accès de retour, fixée dans la baie disponible avant la colonne technique."
  },
  {
    "id": "T168-E17",
    "roomId": "escape-pods",
    "kind": "oxygen-locker",
    "purpose": "escape-capsule-reserve-breathing-cartridges",
    "bounds": {
      "x": 1536,
      "y": 256,
      "w": 64,
      "h": 72
    },
    "mount": "rear-wall",
    "note": "Réserve respiratoire accolée aux équipements d’évacuation à droite, sans recouvrir le pupitre ou le tuyau."
  },
  {
    "id": "T168-E18",
    "roomId": "escape-pods",
    "kind": "emergency-cabinet",
    "purpose": "sealed-escape-service-and-first-response-stock",
    "bounds": {
      "x": 1216,
      "y": 410,
      "w": 72,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Armoire murale de secours entre la fin de passerelle et le terminal d’évacuation ; aucun support inventé au sol."
  },
  {
    "id": "T168-E19",
    "roomId": "engine-room",
    "kind": "hydraulic-accumulator",
    "purpose": "drive-service-pressure-accumulator-and-isolation",
    "bounds": {
      "x": 800,
      "y": 344,
      "w": 80,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Accumulateur fixé dans la baie de service centrale, avant le départ de coursive et au-dessus des coffres."
  },
  {
    "id": "T168-E20",
    "roomId": "engine-room",
    "kind": "coolant-loop",
    "purpose": "engine-cooling-return-and-balanced-bypass",
    "bounds": {
      "x": 1536,
      "y": 256,
      "w": 96,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Retour de refroidissement à droite de la conduite native haute, avec une baie dédiée au-dessus de la coursive."
  },
  {
    "id": "T168-E21",
    "roomId": "engine-room",
    "kind": "tool-board",
    "purpose": "drive-inspection-and-belt-service-tools",
    "bounds": {
      "x": 352,
      "y": 388,
      "w": 80,
      "h": 60
    },
    "mount": "rear-wall",
    "note": "Outillage d’inspection près du contrôleur de propulsion, sous la baie technique et hors de la porte de retour."
  },
  {
    "id": "T168-E22",
    "roomId": "water-recycling",
    "kind": "valve-box",
    "purpose": "clean-and-return-water-isolation-and-test-valves",
    "bounds": {
      "x": 576,
      "y": 300,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Vannes de séparation au milieu du mur de traitement, distinctes des réservoirs et du pupitre bas."
  },
  {
    "id": "T168-E23",
    "roomId": "water-recycling",
    "kind": "air-filter",
    "purpose": "recycling-filter-breather-and-vent-cartridge",
    "bounds": {
      "x": 1024,
      "y": 322,
      "w": 80,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Reniflard filtré dans la baie droite du recyclage, au-dessus de l’accès de maintenance et à l’écart des commandes."
  },
  {
    "id": "T168-E24",
    "roomId": "maintenance-spine",
    "kind": "service-conduits",
    "purpose": "segregated-service-distribution-and-labelled-feed",
    "bounds": {
      "x": 1440,
      "y": 256,
      "w": 112,
      "h": 44
    },
    "mount": "rear-wall",
    "note": "Tronçon fermé de distribution fixé au mur de la coursive, entre deux alimentations existantes ; pas de plancher ajouté."
  },
  {
    "id": "T168-E25",
    "roomId": "maintenance-spine",
    "kind": "electrical-isolator",
    "purpose": "central-service-lockout-and-test-isolation",
    "bounds": {
      "x": 1856,
      "y": 344,
      "w": 80,
      "h": 56
    },
    "mount": "rear-wall",
    "note": "Consignation de la dérivation centrale avant les réserves est, au-dessus de la coursive oblique et hors de ses supports."
  }
]);
