/** Twenty-five complete rear-wall installations for the industrial sector.
 * Explicit room-local positions follow the measured native architecture,
 * existing equipment and the first100 batch. They add no interaction,
 * collider or navigation plane; the owning room supplies its projection. */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

export const HUB_INDUSTRIAL_DETAILS_V177 = freeze([
  {
    "id": "T177-I01",
    "roomId": "science-lab",
    "kind": "intercom",
    "purpose": "laboratory-contained-handling-voice-link",
    "bounds": {
      "x": 688,
      "y": 380,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted intercom serving the central science lab service bay. Its operating face is at the height of the actual raised service walkway; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-I02",
    "roomId": "science-lab",
    "kind": "oxygen-readout",
    "purpose": "laboratory-air-quality-and-extraction-status",
    "bounds": {
      "x": 848,
      "y": 258,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Automatic air-quality display above the east analysis equipment; it monitors extraction without adding an interactive control over the bench."
  },
  {
    "id": "T177-I03",
    "roomId": "science-lab",
    "kind": "sanitation-unit",
    "purpose": "laboratory-sampling-glove-disposal-unit",
    "bounds": {
      "x": 248,
      "y": 268,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted sanitation unit serving the west science lab service bay. Its operating face is at the height of the actual raised service walkway; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-I04",
    "roomId": "quarantine",
    "kind": "pressure-station",
    "purpose": "quarantine-isolation-differential-readout",
    "bounds": {
      "x": 800,
      "y": 258,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Differential-pressure instruments occupy the clean east observation pier; the negative-pressure plant and vent approach remain distinct."
  },
  {
    "id": "T177-I05",
    "roomId": "quarantine",
    "kind": "intercom",
    "purpose": "quarantine-clean-dirty-voice-link",
    "bounds": {
      "x": 288,
      "y": 372,
      "w": 40,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "A wall-mounted intercom serving the west quarantine service bay. Its operating face is at the height of the actual raised service walkway; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-I06",
    "roomId": "quarantine",
    "kind": "spill-kit",
    "purpose": "quarantine-sealed-spill-response-pack",
    "bounds": {
      "x": 1032,
      "y": 492,
      "w": 64,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted spill kit serving the east quarantine service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-I07",
    "roomId": "armory",
    "kind": "status-beacon",
    "purpose": "armory-isolation-circuit-status",
    "bounds": {
      "x": 144,
      "y": 450,
      "w": 40,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Automatic issue-circuit beacon on the west wall pier, outside the new shop facade and storage fixtures. It adds no unreachable manual callpoint."
  },
  {
    "id": "T177-I08",
    "roomId": "armory",
    "kind": "cable-tray",
    "purpose": "armory-west-service-feed-distribution",
    "bounds": {
      "x": 224,
      "y": 450,
      "w": 64,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Short enclosed feed tray belongs to the west wall service group beside the callpoint, clear of the canopy, lockers, weapon racks and old observation bay."
  },
  {
    "id": "T177-I09",
    "roomId": "armory",
    "kind": "sealed-record",
    "purpose": "armory-clearing-and-test-procedure-wallet",
    "bounds": {
      "x": 624,
      "y": 290,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Closed clearing-procedure wallet on the narrow central wall pier above the existing test-power isolation panel, outside the vent route."
  },
  {
    "id": "T177-I10",
    "roomId": "workshop",
    "kind": "tool-shadowboard",
    "purpose": "workshop-fine-tool-return-board",
    "bounds": {
      "x": 580,
      "y": 376,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "The fine-tool return board is mounted above the relocated workshop service landing, between its floor and tier ladders. Its operating face stays within reach of that real support and outside the complete DURANDAL door bay."
  },
  {
    "id": "T177-I11",
    "roomId": "workshop",
    "kind": "power-socket",
    "purpose": "workshop-fixed-service-outlet",
    "bounds": {
      "x": 928,
      "y": 272,
      "w": 40,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "A wall-mounted power socket serving the east workshop service bay. Its operating face is at the height of the actual raised service walkway; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-I12",
    "roomId": "workshop",
    "kind": "emergency-lamp",
    "purpose": "workshop-service-egress-light",
    "bounds": {
      "x": 1040,
      "y": 194,
      "w": 64,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "A complete caged emergency light sits on the upper east service wall, above the real vent and clear of the room header."
  },
  {
    "id": "T177-I13",
    "roomId": "vehicle-bay",
    "kind": "status-beacon",
    "purpose": "vehicle-maintenance-clearance-status",
    "bounds": {
      "x": 1008,
      "y": 194,
      "w": 64,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Automatic clearance beacon on the upper starboard bay above the parked hull and fixed service equipment; vehicle clearances stay untouched."
  },
  {
    "id": "T177-I14",
    "roomId": "vehicle-bay",
    "kind": "inspection-hatch",
    "purpose": "vehicle-upper-service-connection-inspection",
    "bounds": {
      "x": 720,
      "y": 258,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Closed access cover in the upper service distribution bay, separate from the existing pressure instruments and above the hull envelope."
  },
  {
    "id": "T177-I15",
    "roomId": "vehicle-bay",
    "kind": "sensor-head",
    "purpose": "vehicle-upper-bay-exhaust-sensor",
    "bounds": {
      "x": 400,
      "y": 226,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Fixed exhaust sensor in the upper west equipment bay, outside the viewport and gantry approach; no manual dispenser is placed over the vehicle."
  },
  {
    "id": "T177-I16",
    "roomId": "logistics",
    "kind": "sealed-record",
    "purpose": "logistics-handling-seal-and-hazard-record-wallet",
    "bounds": {
      "x": 1536,
      "y": 418,
      "w": 64,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "Sealed handling and hazard records occupy the east freight service pier above the response callpoint, outside the complete storefront facade, vendor and checkout equipment."
  },
  {
    "id": "T177-I17",
    "roomId": "logistics",
    "kind": "safety-callpoint",
    "purpose": "logistics-east-handling-response-callpoint",
    "bounds": {
      "x": 1552,
      "y": 504,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted safety callpoint serving the east logistics service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-I18",
    "roomId": "logistics",
    "kind": "status-beacon",
    "purpose": "logistics-transfer-bay-occupancy-status",
    "bounds": {
      "x": 672,
      "y": 194,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Automatic transfer-status beacon high on the central wall; its fixed bracket occupies no cargo or ladder approach."
  },
  {
    "id": "T177-I19",
    "roomId": "logistics",
    "kind": "cable-tray",
    "purpose": "logistics-manifest-and-transfer-feed-tray",
    "bounds": {
      "x": 1200,
      "y": 194,
      "w": 80,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Enclosed upper service distribution links the freight record zone, keeping all runs on the rear wall and away from actual cargo."
  },
  {
    "id": "T177-I20",
    "roomId": "bioforge",
    "kind": "sanitation-unit",
    "purpose": "bioforge-entry-sampling-waste-unit",
    "bounds": {
      "x": 1184,
      "y": 532,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted sanitation unit serving the central bioforge service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-I21",
    "roomId": "bioforge",
    "kind": "oxygen-readout",
    "purpose": "bioforge-entry-airflow-and-oxygen-status",
    "bounds": {
      "x": 848,
      "y": 258,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Entry-airflow readout above the central service stock, separate from the right containment indicator and outside every transfer approach."
  },
  {
    "id": "T177-I22",
    "roomId": "bioforge",
    "kind": "sensor-head",
    "purpose": "bioforge-contained-transfer-observation-sensor",
    "bounds": {
      "x": 336,
      "y": 290,
      "w": 40,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Compact fixed sensor on the west entry wall pier, clear of the viewing panel, pipework and clean-transfer doorway."
  },
  {
    "id": "T177-I23",
    "roomId": "proving-ground",
    "kind": "safety-callpoint",
    "purpose": "range-preparation-emergency-callpoint",
    "bounds": {
      "x": 376,
      "y": 516,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted safety callpoint serving the west proving ground service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-I24",
    "roomId": "proving-ground",
    "kind": "tool-shadowboard",
    "purpose": "range-unloaded-service-tool-return",
    "bounds": {
      "x": 312,
      "y": 516,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted tool shadowboard serving the west proving ground service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-I25",
    "roomId": "proving-ground",
    "kind": "emergency-lamp",
    "purpose": "range-preparation-egress-light",
    "bounds": {
      "x": 416,
      "y": 194,
      "w": 64,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Caged preparation-area escape light sits above the wall equipment, wholly behind the firing line and separate from every target suspension."
  }
]);
