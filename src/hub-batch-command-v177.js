// Authored wall fittings for command rooms; coordinates are final room-local sockets.
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const HUB_COMMAND_DETAILS_V177 = freeze([
  {
    "id": "T177-C01",
    "roomId": "bridge",
    "kind": "intercom",
    "purpose": "port-watch-voice-panel",
    "bounds": {
      "x": 320,
      "y": 414,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "Comms panel beside the port raised watch walkway, clear of the chart window and ladder."
  },
  {
    "id": "T177-C02",
    "roomId": "bridge",
    "kind": "status-beacon",
    "purpose": "bridge-threshold-circuit-status",
    "bounds": {
      "x": 1096,
      "y": 210,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Small threshold status beacon on the outboard wall, away from the flight instruments."
  },
  {
    "id": "T177-C03",
    "roomId": "bridge",
    "kind": "cable-tray",
    "purpose": "navigation-backup-signal-tray",
    "bounds": {
      "x": 792,
      "y": 194,
      "w": 80,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Closed signal tray above the navigation patch bay; its three straps explain the wall attachment."
  },
  {
    "id": "T177-C04",
    "roomId": "briefing",
    "kind": "emergency-lamp",
    "purpose": "briefing-upper-exit-light",
    "bounds": {
      "x": 368,
      "y": 218,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Caged standby lamp over the upper briefing bay, preserving the display, door signs and rail."
  },
  {
    "id": "T177-C05",
    "roomId": "briefing",
    "kind": "status-beacon",
    "purpose": "briefing-recording-status-beacon",
    "bounds": {
      "x": 704,
      "y": 258,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A recording-status beacon beside the briefing reference bay; it is readable from the meeting area without an unreachable manual control."
  },
  {
    "id": "T177-C06",
    "roomId": "combat-information",
    "kind": "intercom",
    "purpose": "cic-side-watch-intercom",
    "bounds": {
      "x": 152,
      "y": 516,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "A wall-mounted intercom serving the west combat information service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-C07",
    "roomId": "combat-information",
    "kind": "sensor-head",
    "purpose": "cic-secure-threshold-sensor",
    "bounds": {
      "x": 1096,
      "y": 206,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A fixed security head looks toward the east threshold without occupying the tactical display."
  },
  {
    "id": "T177-C08",
    "roomId": "combat-information",
    "kind": "cable-tray",
    "purpose": "cic-redundant-data-bus",
    "bounds": {
      "x": 248,
      "y": 194,
      "w": 80,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "A closed upper data bus follows the west ceiling bay and stays separate from the tactical consoles."
  },
  {
    "id": "T177-C09",
    "roomId": "cryo-bay",
    "kind": "oxygen-readout",
    "purpose": "cryo-return-air-readout",
    "bounds": {
      "x": 1048,
      "y": 298,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "Local return-air monitor beside the recovery-pod wall; no new control blocks a capsule."
  },
  {
    "id": "T177-C10",
    "roomId": "cryo-bay",
    "kind": "emergency-lamp",
    "purpose": "cryo-backup-watch-light",
    "bounds": {
      "x": 320,
      "y": 194,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Caged low-power recovery light over the west pod group, attached to its wall service strip."
  },
  {
    "id": "T177-C11",
    "roomId": "cryo-bay",
    "kind": "cable-tray",
    "purpose": "cryo-pod-instrument-harness",
    "bounds": {
      "x": 1056,
      "y": 222,
      "w": 80,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "Short closed loom above the east capsule instrumentation, clear of the real circulation steel."
  },
  {
    "id": "T177-C12",
    "roomId": "cctv",
    "kind": "intercom",
    "purpose": "security-observer-voice-panel",
    "bounds": {
      "x": 400,
      "y": 516,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "A wall-mounted intercom serving the west cctv service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-C13",
    "roomId": "cctv",
    "kind": "inspection-hatch",
    "purpose": "security-camera-feed-inspection",
    "bounds": {
      "x": 1512,
      "y": 282,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Closed camera-feed inspection cover on the east equipment wall, separate from the display and returns."
  },
  {
    "id": "T177-C14",
    "roomId": "cctv",
    "kind": "status-beacon",
    "purpose": "security-feed-isolation-status",
    "bounds": {
      "x": 1664,
      "y": 214,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A small feed-isolation beacon finishes the far equipment bay without adding a false usable console."
  },
  {
    "id": "T177-C15",
    "roomId": "mire-archives",
    "kind": "sealed-record",
    "purpose": "archive-physical-custody-copy",
    "bounds": {
      "x": 344,
      "y": 474,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "A sealed custody-copy case beside the west sorting position, leaving the evidence terminal clear."
  },
  {
    "id": "T177-C16",
    "roomId": "mire-archives",
    "kind": "inspection-hatch",
    "purpose": "archive-humidity-service-cover",
    "bounds": {
      "x": 1304,
      "y": 262,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Closed climate-service access over the east records bay; the working sorter remains unobstructed."
  },
  {
    "id": "T177-C17",
    "roomId": "mire-archives",
    "kind": "status-beacon",
    "purpose": "archive-environmental-status",
    "bounds": {
      "x": 1736,
      "y": 214,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A local environmental beacon for the physical archive, clear of the room header and ladder."
  },
  {
    "id": "T177-C18",
    "roomId": "synthetic-bay",
    "kind": "pressure-station",
    "purpose": "synthetic-cooling-pressure-pair",
    "bounds": {
      "x": 392,
      "y": 286,
      "w": 64,
      "h": 36
    },
    "mount": "rear-wall",
    "note": "Paired coolant gauges above the west maintenance bay, physically mounted beside its service lines."
  },
  {
    "id": "T177-C19",
    "roomId": "synthetic-bay",
    "kind": "power-socket",
    "purpose": "synthetic-isolated-service-outlets",
    "bounds": {
      "x": 1248,
      "y": 492,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A wall-mounted power socket serving the central synthetic bay service bay. Its operating face is at the height of the existing floor; the equipment, rail and door silhouettes stay clear."
  },
  {
    "id": "T177-C20",
    "roomId": "synthetic-bay",
    "kind": "status-beacon",
    "purpose": "synthetic-room-environment-beacon",
    "bounds": {
      "x": 1664,
      "y": 218,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "A small environmental beacon on the far technical wall, separated from the diagnostic instrumentation."
  },
  {
    "id": "T177-C21",
    "roomId": "durandal",
    "kind": "cable-tray",
    "purpose": "computer-west-service-harness",
    "bounds": {
      "x": 368,
      "y": 238,
      "w": 80,
      "h": 24
    },
    "mount": "rear-wall",
    "note": "A closed power-and-signal tray on the west rack wall; no loose cable crosses the circulation route."
  },
  {
    "id": "T177-C22",
    "roomId": "durandal",
    "kind": "oxygen-readout",
    "purpose": "computer-cooling-room-monitor",
    "bounds": {
      "x": 1512,
      "y": 350,
      "w": 48,
      "h": 32
    },
    "mount": "rear-wall",
    "note": "Cooling-room environmental readout beside the east rack service bay, outside the workstation footprint."
  },
  {
    "id": "T177-C23",
    "roomId": "durandal",
    "kind": "status-beacon",
    "purpose": "computer-standby-circuit-beacon",
    "bounds": {
      "x": 1664,
      "y": 218,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Standby circuit beacon at the outer rack bay, preserving the diagnostic station and room signage."
  },
  {
    "id": "T177-C24",
    "roomId": "flight-control-cockpit",
    "kind": "sensor-head",
    "purpose": "cockpit-starboard-instrument-sensor",
    "bounds": {
      "x": 1096,
      "y": 222,
      "w": 40,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Fixed instrument-check head on the starboard perimeter wall; the central forward observation cone stays empty."
  },
  {
    "id": "T177-C25",
    "roomId": "flight-control-cockpit",
    "kind": "emergency-lamp",
    "purpose": "cockpit-port-standby-light",
    "bounds": {
      "x": 160,
      "y": 214,
      "w": 48,
      "h": 28
    },
    "mount": "rear-wall",
    "note": "Caged standby light on the port perimeter lintel, leaving the forward window and flight instruments open."
  }
]);
