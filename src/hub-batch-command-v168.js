/** Twenty-five authored command-department installations, each counted as one
 * complete wall-mounted assembly. Local room coordinates preserve the native
 * observation windows, physical approaches, room scale and frontal projection.
 * The batch renderer owns their art; these are not another collision registry.
 */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

export const HUB_COMMAND_DETAILS_V168 = freeze([
  {
    "id": "T168-C01",
    "roomId": "bridge",
    "kind": "patch-bay",
    "purpose": "bridge-wing-intercom-patch",
    "bounds": {
      "x": 800,
      "y": 254,
      "w": 88,
      "h": 40
    },
    "mount": "rear-wall",
    "note": "Starboard wall above the navigation reference position; the observation window and watch desks remain clear."
  },
  {
    "id": "T168-C02",
    "roomId": "bridge",
    "kind": "map-case",
    "purpose": "manual-navigation-chart-drawer",
    "bounds": {
      "x": 512,
      "y": 392,
      "w": 80,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "Paper chart case below the navigation window, to the left of the cockpit entrance, paired with the existing reference counter."
  },
  {
    "id": "T168-C03",
    "roomId": "bridge",
    "kind": "camera-dome",
    "purpose": "bridge-threshold-security-camera",
    "bounds": {
      "x": 1080,
      "y": 284,
      "w": 48,
      "h": 40
    },
    "mount": "rear-wall",
    "note": "Small camera on the outboard return wall, aimed at the bridge threshold without occupying the navigation view."
  },
  {
    "id": "T168-C04",
    "roomId": "briefing",
    "kind": "map-case",
    "purpose": "landing-party-map-sleeves",
    "bounds": {
      "x": 448,
      "y": 250,
      "w": 64,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "Wall chart sleeves beside the existing briefing supplies, outside the display and meeting circulation."
  },
  {
    "id": "T168-C05",
    "roomId": "briefing",
    "kind": "comms-rack",
    "purpose": "briefing-audio-recording-amplifier",
    "bounds": {
      "x": 992,
      "y": 250,
      "w": 96,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "Upper side-wall audio amplifier above the intercom service assembly, separated from the meeting seats."
  },
  {
    "id": "T168-C06",
    "roomId": "briefing",
    "kind": "reel-recorder",
    "purpose": "mission-briefing-audio-archive",
    "bounds": {
      "x": 160,
      "y": 360,
      "w": 80,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "A compact recorder in the wall strip below the viewport and above the entrance header; no floor obstruction."
  },
  {
    "id": "T168-C07",
    "roomId": "combat-information",
    "kind": "reel-recorder",
    "purpose": "tactical-watch-radio-backup",
    "bounds": {
      "x": 480,
      "y": 370,
      "w": 88,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Radio backup recorder below the tactical viewport, outside the CCTV entrance and receiver cabinet envelopes."
  },
  {
    "id": "T168-C08",
    "roomId": "combat-information",
    "kind": "patch-bay",
    "purpose": "encrypted-signal-test-patch",
    "bounds": {
      "x": 1040,
      "y": 250,
      "w": 88,
      "h": 44
    },
    "mount": "rear-wall",
    "note": "Signal patch beneath the routing trunk and above the receiver bay; no overlap with the tactical view."
  },
  {
    "id": "T168-C09",
    "roomId": "combat-information",
    "kind": "hazard-monitor",
    "purpose": "isolated-network-status-monitor",
    "bounds": {
      "x": 160,
      "y": 330,
      "w": 64,
      "h": 50
    },
    "mount": "rear-wall",
    "note": "Small network-isolation status monitor on the west return wall, below chronometers and clear of the CCTV approach."
  },
  {
    "id": "T168-C10",
    "roomId": "cryo-bay",
    "kind": "pressure-gauges",
    "purpose": "stasis-clean-gas-analogue-check",
    "bounds": {
      "x": 384,
      "y": 260,
      "w": 80,
      "h": 44
    },
    "mount": "rear-wall",
    "note": "Mechanical gas reference gauges on the wall between the viewport and the cryo service assembly."
  },
  {
    "id": "T168-C11",
    "roomId": "cryo-bay",
    "kind": "sterile-cabinet",
    "purpose": "sealed-stasis-resupply-locker",
    "bounds": {
      "x": 968,
      "y": 240,
      "w": 64,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Dedicated sealed resupply cabinet above the outboard oxygen service area, clear of pod access."
  },
  {
    "id": "T168-C12",
    "roomId": "cryo-bay",
    "kind": "hygiene-dispenser",
    "purpose": "stasis-hand-preparation-point",
    "bounds": {
      "x": 928,
      "y": 394,
      "w": 64,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "Wall-fixed preparation dispenser between the rear equipment bay and oxygen lines, above the human lane."
  },
  {
    "id": "T168-C13",
    "roomId": "cctv",
    "kind": "camera-dome",
    "purpose": "bench-camera-optical-calibration",
    "bounds": {
      "x": 1040,
      "y": 266,
      "w": 64,
      "h": 40
    },
    "mount": "rear-wall",
    "note": "Test camera head above the watch-records cabinet, beside the monitor group and outside its service approach."
  },
  {
    "id": "T168-C14",
    "roomId": "cctv",
    "kind": "reel-recorder",
    "purpose": "redundant-security-tape-recorder",
    "bounds": {
      "x": 1440,
      "y": 390,
      "w": 80,
      "h": 56
    },
    "mount": "rear-wall",
    "note": "Separate evidence recorder below the native monitor group, between the watch desk and camera spares."
  },
  {
    "id": "T168-C15",
    "roomId": "cctv",
    "kind": "battery-charger",
    "purpose": "portable-camera-battery-charging",
    "bounds": {
      "x": 288,
      "y": 340,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Charging sockets above the security equipment locker, clear of the exit and structural pipe."
  },
  {
    "id": "T168-C16",
    "roomId": "mire-archives",
    "kind": "data-cabinet",
    "purpose": "indexed-evidence-media-locker",
    "bounds": {
      "x": 256,
      "y": 256,
      "w": 80,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Lockable index-media cabinet beside the archives entry-side wall services; preserves the sorting station."
  },
  {
    "id": "T168-C17",
    "roomId": "mire-archives",
    "kind": "map-case",
    "purpose": "evidence-chain-paper-records",
    "bounds": {
      "x": 672,
      "y": 304,
      "w": 80,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "Chain-of-custody paper sleeves beside the archive display, before the evidence-reference shelf."
  },
  {
    "id": "T168-C18",
    "roomId": "mire-archives",
    "kind": "hazard-monitor",
    "purpose": "conditioned-evidence-storage-monitor",
    "bounds": {
      "x": 1536,
      "y": 264,
      "w": 80,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "Evidence humidity and seal monitor on the outboard wall, outside the structural pipe and return entrance."
  },
  {
    "id": "T168-C19",
    "roomId": "synthetic-bay",
    "kind": "battery-charger",
    "purpose": "isolated-diagnostic-battery-bank",
    "bounds": {
      "x": 288,
      "y": 268,
      "w": 88,
      "h": 56
    },
    "mount": "rear-wall",
    "note": "Isolated battery charging bay above the clean component preparation area, separated from the structural pipe."
  },
  {
    "id": "T168-C20",
    "roomId": "synthetic-bay",
    "kind": "parts-bins",
    "purpose": "clean-synthetic-connector-stock",
    "bounds": {
      "x": 1088,
      "y": 328,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Small connector bins on the free wall between the diagnostic equipment bay and native service display."
  },
  {
    "id": "T168-C21",
    "roomId": "synthetic-bay",
    "kind": "electrical-isolator",
    "purpose": "diagnostic-bench-electrical-isolation",
    "bounds": {
      "x": 1536,
      "y": 270,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Dedicated bench isolation switch adjacent to the native diagnostic display, above the service feed."
  },
  {
    "id": "T168-C22",
    "roomId": "durandal",
    "kind": "coolant-loop",
    "purpose": "processor-cooling-branch-inspection",
    "bounds": {
      "x": 352,
      "y": 362,
      "w": 80,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Visible closed coolant loop above the existing core-service cabinet and beside the structural riser."
  },
  {
    "id": "T168-C23",
    "roomId": "durandal",
    "kind": "patch-bay",
    "purpose": "redundant-processor-io-test-bus",
    "bounds": {
      "x": 1520,
      "y": 282,
      "w": 88,
      "h": 52
    },
    "mount": "rear-wall",
    "note": "Processor I/O patch on the right-hand service wall, clear of the native display and cooling-filter assembly."
  },
  {
    "id": "T168-C24",
    "roomId": "flight-control-cockpit",
    "kind": "flight-kit",
    "purpose": "pilot-preflight-reference-kit",
    "bounds": {
      "x": 248,
      "y": 338,
      "w": 72,
      "h": 48
    },
    "mount": "rear-wall",
    "note": "Preflight kit on the left perimeter wall beside the return approach; the central forward observation cone stays empty."
  },
  {
    "id": "T168-C25",
    "roomId": "flight-control-cockpit",
    "kind": "comms-rack",
    "purpose": "flight-frequency-backup-radio",
    "bounds": {
      "x": 1040,
      "y": 294,
      "w": 72,
      "h": 64
    },
    "mount": "rear-wall",
    "note": "Backup flight radio on the right perimeter above the native instrument fixture; no new item in the central observation cone."
  }
]);
