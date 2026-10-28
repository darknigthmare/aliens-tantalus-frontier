/** Twenty-five authored habitat installations. Bounds are local to each
 * room and reserve the complete rear-wall assembly, never a loose floor prop.
 * Existing furniture, doors, clinical surfaces and animal enclosures own their
 * original silhouettes. No source image or collision geometry is modified. */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

export const HUB_HABITAT_DETAILS_V168 = freeze([
  {
    "id": "T168-H01",
    "roomId": "crew-quarters",
    "kind": "coat-hooks",
    "purpose": "upper-berth-personal-coat-hangers",
    "bounds": {
      "x": 384,
      "y": 256,
      "w": 72,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Flush hooks occupy the small pier beside the west viewport, above the berth approach; no object is placed on the mattress or ladder."
  },
  {
    "id": "T168-H02",
    "roomId": "crew-quarters",
    "kind": "personal-shelf",
    "purpose": "crew-personal-reading-shelf",
    "bounds": {
      "x": 544,
      "y": 322,
      "w": 88,
      "h": 44
    },
    "mount": "rear-wall",
    "note": "A compact wall shelf fills the bay beyond the upper berth, away from the service doorway and the existing bedside surfaces."
  },
  {
    "id": "T168-H03",
    "roomId": "crew-quarters",
    "kind": "linen-cabinet",
    "purpose": "aft-berth-clean-linen-storage",
    "bounds": {
      "x": 960,
      "y": 300,
      "w": 80,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "A closed linen cabinet serves the aft berth group; its footprint stops above the existing personal-effects shelf and below the wall crown."
  },
  {
    "id": "T168-H04",
    "roomId": "mess",
    "kind": "ration-shelf",
    "purpose": "mess-sealed-ration-distribution",
    "bounds": {
      "x": 384,
      "y": 388,
      "w": 96,
      "h": 56
    },
    "mount": "rear-wall",
    "note": "A restrained ration shelf belongs over the tray-return side of the mess, below the viewport rather than across its glazing."
  },
  {
    "id": "T168-H05",
    "roomId": "mess",
    "kind": "utensil-rail",
    "purpose": "mess-tray-and-cup-storage",
    "bounds": {
      "x": 544,
      "y": 388,
      "w": 96,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "A short utensil rail sits beside the ration stock, distinct from the serving counter and the native seating."
  },
  {
    "id": "T168-H06",
    "roomId": "mess",
    "kind": "hygiene-dispenser",
    "purpose": "mess-cleaning-refill-reservoir",
    "bounds": {
      "x": 640,
      "y": 454,
      "w": 48,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "A small sealed cleaning refill dispenser is wall-mounted above the serving approach, clear of chairs and the equipment bank."
  },
  {
    "id": "T168-H07",
    "roomId": "medical",
    "kind": "medical-stock",
    "purpose": "clinical-sealed-dressing-stock",
    "bounds": {
      "x": 384,
      "y": 278,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Sealed dressings occupy the narrow wall pier between the west viewport and the technical bay, outside every bed and annex entrance."
  },
  {
    "id": "T168-H08",
    "roomId": "medical",
    "kind": "sterile-cabinet",
    "purpose": "clinical-clean-ppe-wall-cabinet",
    "bounds": {
      "x": 928,
      "y": 344,
      "w": 80,
      "h": 60
    },
    "mount": "rear-wall",
    "note": "A closed PPE cabinet is mounted beside the clinical service bay, above the existing handwash zone with the medical bed envelope clear."
  },
  {
    "id": "T168-H09",
    "roomId": "medical",
    "kind": "lab-sample-rack",
    "purpose": "clinical-labeled-specimen-rack",
    "bounds": {
      "x": 1056,
      "y": 264,
      "w": 80,
      "h": 44
    },
    "mount": "rear-wall",
    "note": "A compact rack for closed sample tubes stays high in the east wall bay, separated from the clean-gas manifold and all patient surfaces."
  },
  {
    "id": "T168-H10",
    "roomId": "morgue",
    "kind": "hazard-monitor",
    "purpose": "forensic-temperature-and-air-quality-monitor",
    "bounds": {
      "x": 224,
      "y": 278,
      "w": 80,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "The forensic monitor is mounted beyond the west structural pipe and below the wall crown; it does not cover the autopsy counter."
  },
  {
    "id": "T168-H11",
    "roomId": "morgue",
    "kind": "sterile-cabinet",
    "purpose": "forensic-clean-protective-stock",
    "bounds": {
      "x": 1472,
      "y": 388,
      "w": 80,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "A clean protective-stock cabinet sits in the east cold-storage bay, above its floor cabinet and away from the return doorway."
  },
  {
    "id": "T168-H12",
    "roomId": "morgue",
    "kind": "medical-stock",
    "purpose": "forensic-sealed-identification-consumables",
    "bounds": {
      "x": 704,
      "y": 278,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "A separate sealed identification kit is mounted above the existing forensic consumables, with both worktop and gantry clear."
  },
  {
    "id": "T168-H13",
    "roomId": "personal-refuge",
    "kind": "personal-shelf",
    "purpose": "private-small-personal-effects-shelf",
    "bounds": {
      "x": 288,
      "y": 388,
      "w": 66,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "One small shelf fills the west wall pier beside the personal-effects zone, leaving the room photo, reading place and native furniture unchanged."
  },
  {
    "id": "T168-H14",
    "roomId": "personal-refuge",
    "kind": "coat-hooks",
    "purpose": "private-rest-area-garment-hooks",
    "bounds": {
      "x": 736,
      "y": 432,
      "w": 72,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A quiet garment-hook rail occupies the empty interior pier; it remains outside the personal photo, berth and editing stations."
  },
  {
    "id": "T168-H15",
    "roomId": "galley-service",
    "kind": "ration-shelf",
    "purpose": "galley-reserve-dry-ration-storage",
    "bounds": {
      "x": 512,
      "y": 388,
      "w": 88,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "A compact reserve shelf sits above the cold-storage side of the galley, outside the worktop and existing tableware stock."
  },
  {
    "id": "T168-H16",
    "roomId": "galley-service",
    "kind": "utensil-rail",
    "purpose": "galley-cooking-utensil-rail",
    "bounds": {
      "x": 768,
      "y": 432,
      "w": 96,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "The preparation wall gains a short utensil rail above the working zone; it does not overlap the native service console or the preparation supplies."
  },
  {
    "id": "T168-H17",
    "roomId": "galley-service",
    "kind": "air-filter",
    "purpose": "galley-cooking-air-return-filter",
    "bounds": {
      "x": 1024,
      "y": 256,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "The galley air-return filter belongs in the upper east wall bay, away from food stock and fire-safety access."
  },
  {
    "id": "T168-H18",
    "roomId": "sanitary-bay",
    "kind": "linen-cabinet",
    "purpose": "sanitary-reserve-clean-linen-cabinet",
    "bounds": {
      "x": 512,
      "y": 388,
      "w": 80,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Reserve linen stays in a closed wall cabinet between the personal-locker zone and the clean-linen counter, with its existing stock unobstructed."
  },
  {
    "id": "T168-H19",
    "roomId": "sanitary-bay",
    "kind": "hygiene-dispenser",
    "purpose": "sanitary-sealed-hygiene-refill",
    "bounds": {
      "x": 704,
      "y": 432,
      "w": 48,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "A narrow sealed hygiene-refill dispenser sits beside the linen zone, clear of the wash fixtures and the floor hamper."
  },
  {
    "id": "T168-H20",
    "roomId": "sanitary-bay",
    "kind": "valve-box",
    "purpose": "sanitary-local-water-isolation-box",
    "bounds": {
      "x": 1056,
      "y": 344,
      "w": 64,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "A separate water-isolation box serves the east plumbing bay; it leaves the authored water feed, emergency kit and sanitary station untouched."
  },
  {
    "id": "T168-H21",
    "roomId": "animal-care",
    "kind": "animal-supply",
    "purpose": "animal-feed-and-enrichment-reserve",
    "bounds": {
      "x": 352,
      "y": 388,
      "w": 88,
      "h": 56
    },
    "mount": "rear-wall",
    "note": "A wall rack of reserve feed and enrichment stock serves the west habitats, entirely above the habitat labels and feed preparation surface."
  },
  {
    "id": "T168-H22",
    "roomId": "animal-care",
    "kind": "hygiene-dispenser",
    "purpose": "animal-isolated-hygiene-refill",
    "bounds": {
      "x": 1504,
      "y": 388,
      "w": 56,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "A narrow isolated hygiene refill is mounted beside the established hygiene store, outside enclosure silhouettes and animal identification plaques."
  },
  {
    "id": "T168-H23",
    "roomId": "animal-care",
    "kind": "clock-bank",
    "purpose": "animal-welfare-feeding-clock-bank",
    "bounds": {
      "x": 2112,
      "y": 256,
      "w": 80,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "A small pair of feeding-interval clocks sits in the east care bay, below the service plaque and away from recording and treatment stations."
  },
  {
    "id": "T168-H24",
    "roomId": "frontier-civil-counter",
    "kind": "map-case",
    "purpose": "civil-public-route-map-case",
    "bounds": {
      "x": 256,
      "y": 344,
      "w": 80,
      "h": 56
    },
    "mount": "rear-wall",
    "note": "The public route map is a bounded wall case on the west reception pier, near the forms area but clear of its entrance and counter."
  },
  {
    "id": "T168-H25",
    "roomId": "frontier-civil-counter",
    "kind": "cargo-manifest",
    "purpose": "civil-processed-manifest-wall-file",
    "bounds": {
      "x": 1600,
      "y": 388,
      "w": 88,
      "h": 44
    },
    "mount": "rear-wall",
    "note": "A separate processed-manifest file occupies the middle wall bay below the native system fixture, outside the seated visitor labels and meeting furniture."
  }
]);
