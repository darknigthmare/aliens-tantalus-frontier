// Authored wall fittings for habitat rooms; coordinates are final room-local sockets.
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const HUB_HABITAT_DETAILS_V177 = freeze([
  {
    "id": "T177-H01",
    "roomId": "crew-quarters",
    "kind": "intercom",
    "purpose": "berth-upper-watch-intercom",
    "bounds": {
      "x": 296,
      "y": 366,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "Voice panel for the west upper berth walkway, above its actual deck and clear of the ladder."
  },
  {
    "id": "T177-H02",
    "roomId": "crew-quarters",
    "kind": "emergency-lamp",
    "purpose": "berth-night-watch-light",
    "bounds": {
      "x": 368,
      "y": 202,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Caged night-watch light above the west berth group, with no fixture over a pillow or doorway."
  },
  {
    "id": "T177-H03",
    "roomId": "crew-quarters",
    "kind": "oxygen-readout",
    "purpose": "berth-return-air-indicator",
    "bounds": {
      "x": 944,
      "y": 210,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "Return-air indicator in the upper east service bay, separate from the linen cabinet and redirected pipes."
  },
  {
    "id": "T177-H04",
    "roomId": "mess",
    "kind": "sanitation-unit",
    "purpose": "mess-clean-hand-station",
    "bounds": {
      "x": 688,
      "y": 396,
      "w": 48,
      "h": 40
    },
    "mount": "rear-wall",
    "note": "A wall-mounted sanitation unit serving the central mess service bay. Its operating face is at the height of the actual raised service walkway; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-H05",
    "roomId": "mess",
    "kind": "vent-return",
    "purpose": "mess-galley-return-grille",
    "bounds": {
      "x": 240,
      "y": 238,
      "w": 64,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Bolted extraction grille on the west food-service wall; it is a closed return, never a traversable vent."
  },
  {
    "id": "T177-H06",
    "roomId": "mess",
    "kind": "pressure-station",
    "purpose": "mess-potable-water-pressure-pair",
    "bounds": {
      "x": 672,
      "y": 290,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Paired potable-water gauges above the galley service circuit, leaving the table, chairs and food worktop visible."
  },
  {
    "id": "T177-H07",
    "roomId": "medical",
    "kind": "vent-return",
    "purpose": "medical-low-return-air-grille",
    "bounds": {
      "x": 960,
      "y": 466,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Closed low return-air grille beside the clinical service bay. The native handwash already serves the crew; this addition does not create a second unreachable manual dispenser."
  },
  {
    "id": "T177-H08",
    "roomId": "medical",
    "kind": "oxygen-readout",
    "purpose": "medical-clinical-air-monitor",
    "bounds": {
      "x": 480,
      "y": 258,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "Local clinical-air monitor above the west service zone; the treatment table and patient access stay clear."
  },
  {
    "id": "T177-H09",
    "roomId": "medical",
    "kind": "emergency-lamp",
    "purpose": "medical-standby-task-light",
    "bounds": {
      "x": 416,
      "y": 202,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Caged standby light attached to the washable upper wall, away from the room header and clinical display."
  },
  {
    "id": "T177-H10",
    "roomId": "morgue",
    "kind": "sealed-record",
    "purpose": "morgue-protected-identification-copy",
    "bounds": {
      "x": 352,
      "y": 474,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "A sealed identification-copy case beside the west intake area, leaving the forensic working surfaces clear."
  },
  {
    "id": "T177-H11",
    "roomId": "morgue",
    "kind": "vent-return",
    "purpose": "morgue-controlled-air-return",
    "bounds": {
      "x": 1464,
      "y": 246,
      "w": 64,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Closed return-air grille over the east cold-storage service bay, outside the native refrigeration equipment."
  },
  {
    "id": "T177-H12",
    "roomId": "morgue",
    "kind": "oxygen-readout",
    "purpose": "morgue-extraction-circuit-readout",
    "bounds": {
      "x": 1728,
      "y": 214,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "A compact extraction-circuit readout at the far technical bay, separated from the room signage."
  },
  {
    "id": "T177-H13",
    "roomId": "personal-refuge",
    "kind": "emergency-lamp",
    "purpose": "refuge-low-power-reading-standby",
    "bounds": {
      "x": 304,
      "y": 342,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Small caged standby light above the west personal-effects shelf and below the real overhead casing, clear of the authored porthole and room sign."
  },
  {
    "id": "T177-H14",
    "roomId": "personal-refuge",
    "kind": "intercom",
    "purpose": "refuge-private-voice-return",
    "bounds": {
      "x": 304,
      "y": 516,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "A wall-mounted intercom serving the west personal refuge service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-H15",
    "roomId": "galley-service",
    "kind": "sanitation-unit",
    "purpose": "galley-preparation-clean-hand-unit",
    "bounds": {
      "x": 400,
      "y": 524,
      "w": 48,
      "h": 40
    },
    "mount": "rear-wall",
    "note": "A wall-mounted sanitation unit serving the west galley service service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-H16",
    "roomId": "galley-service",
    "kind": "vent-return",
    "purpose": "galley-extraction-return-grille",
    "bounds": {
      "x": 928,
      "y": 238,
      "w": 80,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A closed extraction return above the east preparation bay, visibly bolted to the washable wall."
  },
  {
    "id": "T177-H17",
    "roomId": "galley-service",
    "kind": "inspection-hatch",
    "purpose": "galley-cold-circuit-access-cover",
    "bounds": {
      "x": 1072,
      "y": 326,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Closed cold-circuit inspection cover on the east wall pier, preserving cupboards, terminals and return access."
  },
  {
    "id": "T177-H18",
    "roomId": "sanitary-bay",
    "kind": "sanitation-unit",
    "purpose": "sanitary-clean-hand-dispensing-unit",
    "bounds": {
      "x": 280,
      "y": 524,
      "w": 48,
      "h": 40
    },
    "mount": "rear-wall",
    "note": "A wall-mounted sanitation unit serving the west sanitary bay service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-H19",
    "roomId": "sanitary-bay",
    "kind": "vent-return",
    "purpose": "sanitary-humidity-return-grille",
    "bounds": {
      "x": 928,
      "y": 238,
      "w": 64,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Closed humidity-extraction grille over the east service wall, separate from the existing water-feed pipe."
  },
  {
    "id": "T177-H20",
    "roomId": "sanitary-bay",
    "kind": "pressure-station",
    "purpose": "sanitary-water-service-gauges",
    "bounds": {
      "x": 1072,
      "y": 290,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Paired water-service gauges in the outer technical bay, leaving the washing fixtures and entrance usable."
  },
  {
    "id": "T177-H21",
    "roomId": "animal-care",
    "kind": "oxygen-readout",
    "purpose": "animal-care-west-air-readout",
    "bounds": {
      "x": 288,
      "y": 438,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "A passive air-quality readout above the west preparation bay, clear of animal pens and the visitor front."
  },
  {
    "id": "T177-H22",
    "roomId": "animal-care",
    "kind": "sanitation-unit",
    "purpose": "animal-care-clean-hand-station",
    "bounds": {
      "x": 1384,
      "y": 524,
      "w": 48,
      "h": 40
    },
    "mount": "rear-wall",
    "note": "A wall-mounted sanitation unit serving the central animal care service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-H23",
    "roomId": "animal-care",
    "kind": "vent-return",
    "purpose": "animal-care-east-climate-return",
    "bounds": {
      "x": 2208,
      "y": 254,
      "w": 80,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Closed climate-return grille above the east habitat service bay, keeping the welfare records and pens clear."
  },
  {
    "id": "T177-H24",
    "roomId": "frontier-civil-counter",
    "kind": "intercom",
    "purpose": "civil-counter-west-visitor-intercom",
    "bounds": {
      "x": 352,
      "y": 516,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "A wall-mounted intercom serving the west frontier civil counter service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-H25",
    "roomId": "frontier-civil-counter",
    "kind": "status-beacon",
    "purpose": "civil-counter-service-circuit-status",
    "bounds": {
      "x": 2016,
      "y": 194,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Small service-circuit beacon above the east office bay, with the public counter, display and room header unobscured."
  }
]);
