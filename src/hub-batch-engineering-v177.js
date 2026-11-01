/** Twenty-five complete rear-wall installations for the engineering sector.
 * Explicit room-local positions follow the measured native architecture,
 * existing equipment and the first100 batch. They add no interaction,
 * collider or navigation plane; the owning room supplies its projection. */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

export const HUB_ENGINEERING_DETAILS_V177 = freeze([
  {
    "id": "T177-E01",
    "roomId": "dropship-hangar",
    "kind": "status-beacon",
    "purpose": "hangar-overhead-bay-clearance-status",
    "bounds": {
      "x": 800,
      "y": 194,
      "w": 40,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Small automatic bay-clearance beacon occupies the free upper starboard service pier; no manual equipment hangs over the aircraft or access route."
  },
  {
    "id": "T177-E02",
    "roomId": "dropship-hangar",
    "kind": "sensor-head",
    "purpose": "hangar-upper-exhaust-and-smoke-sensor",
    "bounds": {
      "x": 872,
      "y": 194,
      "w": 40,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Compact fixed exhaust and smoke sensor shares the upper wall bay at a deliberate separation from the clearance beacon, above all vessel envelopes."
  },
  {
    "id": "T177-E03",
    "roomId": "reactor",
    "kind": "pressure-station",
    "purpose": "reactor-secondary-loop-isolation-feedback",
    "bounds": {
      "x": 640,
      "y": 258,
      "w": 64,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Secondary-loop instruments use the upper central distribution wall, distinct from the old primary-loop gauges and outside the viewport and ladder."
  },
  {
    "id": "T177-E04",
    "roomId": "reactor",
    "kind": "vent-return",
    "purpose": "reactor-electrical-bay-return-air",
    "bounds": {
      "x": 896,
      "y": 226,
      "w": 64,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Passive return grille in the upper east electrical service wall, leaving the reactor containment bay and native service ducts uncovered."
  },
  {
    "id": "T177-E05",
    "roomId": "reactor",
    "kind": "status-beacon",
    "purpose": "reactor-west-isolation-interlock-status",
    "bounds": {
      "x": 240,
      "y": 450,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Automatic isolation-status beacon on the lower west service wall above the actual reactor control equipment; this bay adds no unreachable manual callpoint or floor obstruction."
  },
  {
    "id": "T177-E06",
    "roomId": "life-support",
    "kind": "oxygen-readout",
    "purpose": "life-support-supply-air-composition-readout",
    "bounds": {
      "x": 720,
      "y": 258,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Supply-air composition is read automatically above the central plant equipment, separate from filtration stock and vent access."
  },
  {
    "id": "T177-E07",
    "roomId": "life-support",
    "kind": "inspection-hatch",
    "purpose": "life-support-west-filter-service-access",
    "bounds": {
      "x": 320,
      "y": 354,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Closed access hatch occupies the west service wall bay beside the actual filter assembly, outside the real support and circulation volumes."
  },
  {
    "id": "T177-E08",
    "roomId": "life-support",
    "kind": "pressure-station",
    "purpose": "life-support-return-plant-pressure-readout",
    "bounds": {
      "x": 848,
      "y": 450,
      "w": 40,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Automatic return-plant pressure readout occupies the lower right wall just above the real service equipment; it is not a manual socket suspended over the console."
  },
  {
    "id": "T177-E09",
    "roomId": "sensor-array",
    "kind": "sensor-head",
    "purpose": "sensor-array-watch-reference-detector",
    "bounds": {
      "x": 400,
      "y": 226,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Fixed reference detector is mounted in the upper west electronics bay, leaving the navigation glass and watchkeeper service route clear."
  },
  {
    "id": "T177-E10",
    "roomId": "sensor-array",
    "kind": "cable-tray",
    "purpose": "sensor-array-calibration-feed-tray",
    "bounds": {
      "x": 720,
      "y": 258,
      "w": 80,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Short enclosed calibration feed tray sits on the clear upper central wall, separate from the old instruments and reserved vent approach."
  },
  {
    "id": "T177-E11",
    "roomId": "sensor-array",
    "kind": "sealed-record",
    "purpose": "sensor-array-watch-reference-docket",
    "bounds": {
      "x": 144,
      "y": 450,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Sealed reference docket is mounted above the lower west watch equipment, separate from the voice link and below the clear navigation service pier."
  },
  {
    "id": "T177-E12",
    "roomId": "arrival-airlock",
    "kind": "sanitation-unit",
    "purpose": "arrival-vestibule-glove-and-waste-unit",
    "bounds": {
      "x": 312,
      "y": 516,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted sanitation unit serving the west arrival airlock service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-E13",
    "roomId": "arrival-airlock",
    "kind": "pressure-station",
    "purpose": "arrival-airlock-equalisation-pressure-readout",
    "bounds": {
      "x": 800,
      "y": 258,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Automatic equalisation instruments sit above the centre service equipment; the paired entry leaves and their labels remain uncovered."
  },
  {
    "id": "T177-E14",
    "roomId": "arrival-airlock",
    "kind": "emergency-lamp",
    "purpose": "arrival-airlock-aft-egress-light",
    "bounds": {
      "x": 1680,
      "y": 194,
      "w": 64,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "A complete caged egress light sits high on the aft vestibule wall, distinct from the exit sign and clear of the actual opening."
  },
  {
    "id": "T177-E15",
    "roomId": "escape-pods",
    "kind": "sealed-record",
    "purpose": "escape-pod-launch-and-muster-procedure-wallet",
    "bounds": {
      "x": 1344,
      "y": 450,
      "w": 64,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "Sealed launch and muster procedures are mounted on the lower east service pier, separate from the response locker and actual pod openings."
  },
  {
    "id": "T177-E16",
    "roomId": "escape-pods",
    "kind": "status-beacon",
    "purpose": "escape-pod-bank-availability-status",
    "bounds": {
      "x": 1120,
      "y": 194,
      "w": 48,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Fixed pod-bank status beacon belongs to the upper central services, without inventing another pod or hiding an existing release panel."
  },
  {
    "id": "T177-E17",
    "roomId": "escape-pods",
    "kind": "oxygen-readout",
    "purpose": "escape-pod-reserve-breathing-supply-status",
    "bounds": {
      "x": 672,
      "y": 258,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Reserve breathing-supply readout occupies a free upper bay above the established evacuation stock and away from both exit routes."
  },
  {
    "id": "T177-E18",
    "roomId": "engine-room",
    "kind": "hose-reel",
    "purpose": "engine-room-restrained-service-air-reel",
    "bounds": {
      "x": 240,
      "y": 508,
      "w": 48,
      "h": 40
    },
    "mount": "rear-wall",
    "note": "A wall-mounted hose reel serving the west engine room service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-E19",
    "roomId": "engine-room",
    "kind": "pressure-station",
    "purpose": "engine-room-secondary-cooling-pressure-readout",
    "bounds": {
      "x": 672,
      "y": 290,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Secondary cooling instruments sit on the clear central wall beside the true propulsion service distribution, not over a console worktop."
  },
  {
    "id": "T177-E20",
    "roomId": "engine-room",
    "kind": "emergency-lamp",
    "purpose": "engine-room-east-service-egress-light",
    "bounds": {
      "x": 1648,
      "y": 194,
      "w": 64,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Caged escape light on the upper east drive-space wall marks the service end without covering a console, pipe or real maintenance entrance."
  },
  {
    "id": "T177-E21",
    "roomId": "water-recycling",
    "kind": "sanitation-unit",
    "purpose": "water-recycling-sealed-sampling-waste-unit",
    "bounds": {
      "x": 1016,
      "y": 532,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted sanitation unit serving the east water recycling service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-E22",
    "roomId": "water-recycling",
    "kind": "vent-return",
    "purpose": "water-recycling-dry-service-return-grille",
    "bounds": {
      "x": 832,
      "y": 226,
      "w": 64,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A passive return grille serves the dry upper electrical bay above the water plant, preserving tanks, valves and labelled flow routes."
  },
  {
    "id": "T177-E23",
    "roomId": "water-recycling",
    "kind": "pressure-station",
    "purpose": "water-recycling-clean-return-differential-readout",
    "bounds": {
      "x": 672,
      "y": 322,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Clean and return loop instruments fill the clear central service pier, away from the existing isolation valves and maintenance approach."
  },
  {
    "id": "T177-E24",
    "roomId": "maintenance-spine",
    "kind": "power-socket",
    "purpose": "maintenance-spine-isolated-service-outlet",
    "bounds": {
      "x": 1000,
      "y": 528,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted power socket serving the central maintenance spine service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-E25",
    "roomId": "maintenance-spine",
    "kind": "inspection-hatch",
    "purpose": "maintenance-spine-starboard-feed-inspection",
    "bounds": {
      "x": 1792,
      "y": 290,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Closed feed-inspection cover sits on the upper starboard service pier and inherits the whole corridor parallel projection, outside every ladder and duct approach."
  }
]);
