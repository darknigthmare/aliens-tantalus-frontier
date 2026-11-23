// V188 — places of the dedicated Asphodèle station levels S1-S4 (spec 009), measured on
// the generated `ship-interior-vertical` level (mission-levels-v52.js) the four missions
// already use. Pure: reads platforms, anchors, doors and ladders; never moves geometry.
// Every interaction point stands on a real floor of the template, clear of its ladders
// (1 m ≈ 51 px). Offsets are [PROPOSÉ] placements; the template geometry is existing.
//
// The template, read as the station (bible §7.2, §42.1) [PROPOSÉ]:
// - low deck (y ≈ 868): docking collar and airlock 1 (spawn, dock bulkhead) → outer ring
//   section (cargo zone) → cargo bulkhead → reactor deck (engineering) → aft service
//   section → aft bulkhead → outer airlock → the Tantalus dropship (extraction);
// - mid deck (y ≈ 504): ring service gallery, habitation, junction (ladder e13 down);
// - top deck (y ≈ 140): hull walkway and the control deck (the template « bridge »).

const list = value => Array.isArray(value) ? value : [];
const round = value => Math.round(Number(value) || 0);
const platform = (engine, id) => list(engine?.platforms).find(entry => entry.id === `node-platform-${id}`) || null;
const centreOf = (engine, id, fallback) => { const p = platform(engine, id); return p ? round(p.x + p.w / 2) : fallback; };
const door = (engine, id) => list(engine?.doors).find(entry => entry.id === id) || null;
const ladder = (engine, id) => list(engine?.ladders).find(entry => entry.id === id) || null;
const doorX = (entry, fallback) => entry ? round(entry.x + entry.w / 2) : fallback;

/** Shared places of the station on the ship template. */
export function stationPlacesV188(engine) {
  const anchors = engine?.missionLevelRuntime?.anchors || {};
  const deckY = (id, fallback) => round(platform(engine, id)?.y ?? fallback);
  const decks = Object.freeze({ top: deckY('ship-hull', 140), mid: deckY('ship-crew', 504), low: deckY('ship-reactor', 868) });
  const doors = Object.freeze({ dock: door(engine, 'dock-bulkhead'), cargo: door(engine, 'cargo-bulkhead'), aft: door(engine, 'aft-bulkhead'), outer: door(engine, 'outer-airlock') });
  const x = Object.freeze({
    drop: round(anchors.spawn?.x ?? 180), dockDoor: doorX(doors.dock, 921), cargoDoor: doorX(doors.cargo, 1549), aftDoor: doorX(doors.aft, 3820), outerDoor: doorX(doors.outer, 4531),
    cargo: centreOf(engine, 'ship-cargo', 1210), service: centreOf(engine, 'ship-service', 1221), hull: centreOf(engine, 'ship-hull', 1218),
    reactor: round(engine?.powerNode ? engine.powerNode.x + engine.powerNode.w / 2 : anchors.power?.x ?? 2560), crew: centreOf(engine, 'ship-crew', 2560),
    bridge: centreOf(engine, 'ship-bridge', 2903), aftLow: centreOf(engine, 'ship-aft-low', 3498), junction: centreOf(engine, 'ship-junction', 3512),
    extraction: round(anchors.extraction?.x ?? 4920)
  });
  const ladders = Object.freeze({ dock: round(ladder(engine, 'ship-e08')?.x ?? 513), reactor: round(ladder(engine, 'ship-e21')?.x ?? 2560),
    bridge: round(ladder(engine, 'ship-e18')?.x ?? 3208), junction: round(ladder(engine, 'ship-e13')?.x ?? 3827), shaft: round(ladder(engine, 'ship-e19')?.x ?? 1772) });
  return Object.freeze({ template: 'ship-interior-vertical', decks, doors, x, ladders });
}

/** S1 « L’arrimage »: collar and manual airlock → dark ring (fans, Echo-8 traces, salvagers) → control deck. */
export function stationS1PlacesV188(engine) {
  const s = stationPlacesV188(engine), { x, decks } = s;
  // Owner decision 2026-11-23 (S9-1): the docking collar, from the west end of its floor to the dock bulkhead, is a
  // 2.5D depth corridor (depth-hold-sections-v188.js, `station-s1-docking-collar`); the rest of S1 stays side view.
  const collarFloor = list(engine?.platforms).filter(entry => entry.zoneId === 'ship-docking' && Math.abs(Number(entry.y) - decks.low) < 1);
  const floorStart = collarFloor.length ? Math.min(...collarFloor.map(entry => Number(entry.x))) : 55;
  return Object.freeze({ ...s,
    corridor: Object.freeze({ x0: round(floorStart + 2), x1: round(s.doors.dock ? s.doors.dock.x : x.dockDoor - 22) }),
    collar: Object.freeze({ x: Math.max(20, x.drop - 160), y: decks.low }), // Echo-8’s dropship behind the collar window, at the west end
    crank: Object.freeze({ x: x.dockDoor - 70, y: decks.low }),
    fans: Object.freeze([Object.freeze({ x: x.cargo - 51, y: decks.low }), Object.freeze({ x: x.service + 80, y: decks.mid })]),
    ring: Object.freeze({ x0: x.dockDoor, x1: x.cargoDoor }), // the fan-saturated stretch of the ring
    traces: Object.freeze([Object.freeze({ id: 'barricade', x: x.dockDoor + 140, y: decks.low, text: 'E-8 · 05:52' }),
      Object.freeze({ id: 'chalk', x: x.service - 40, y: decks.mid, text: 'IIIIII' })]),
    salvagers: Object.freeze({ x: x.cargoDoor - 110, y: decks.low }),
    console: Object.freeze({ x: x.bridge - 130, y: decks.top }) // clear of the control deck's rear doorway
  });
}

/** S2 « La voix de CASSIUS »: three sector breakers → reactor → CASSIUS on the control deck. */
export function stationS2PlacesV188(engine) {
  const s = stationPlacesV188(engine), { x, decks } = s;
  return Object.freeze({ ...s,
    breakers: Object.freeze([Object.freeze({ id: 'dock', x: x.dockDoor - 150, y: decks.low }), Object.freeze({ id: 'ring', x: x.service + 60, y: decks.mid }),
      Object.freeze({ id: 'hull', x: x.hull + 40, y: decks.top })]),
    reactor: Object.freeze({ x: x.reactor, y: decks.low }),
    cassius: Object.freeze({ x: x.bridge - 130, y: decks.top }) // clear of the control deck's rear doorway
  });
}

/** S3 « Les ponts scellés »: airlock 3 → transit laboratory (cradles, eggs, log) → power routing → aft escape. */
export function stationS3PlacesV188(engine) {
  const s = stationPlacesV188(engine), { x, decks } = s;
  return Object.freeze({ ...s,
    airlock3: Object.freeze({ x: x.dockDoor - 60, y: decks.low }),
    lab: Object.freeze({ x0: x.dockDoor + 40, x1: x.cargoDoor - 40 }),
    cradles: Object.freeze({ x: x.cargoDoor - 297, y: decks.low, w: 270 }), // east of the lab's rear doorway
    eggs: Object.freeze([x.dockDoor + 190, x.dockDoor + 295].map(value => round(value))), // across the lab, between airlock 3 and the cradles
    log: Object.freeze({ x: x.dockDoor + 50, y: decks.low }),
    router: Object.freeze({ x: x.reactor - 110, y: decks.low }),
    tag: Object.freeze({ x: x.aftLow + 90, y: decks.low })
  });
}

/** S4 « Le hub Asphodèle »: last nest (junction) → three valves → hold the dock until the team docks. */
export function stationS4PlacesV188(engine) {
  const s = stationPlacesV188(engine), { x, decks } = s;
  const dockFloor = Object.freeze({ x0: x.drop + 20, x1: x.dockDoor - 30 });
  return Object.freeze({ ...s,
    nest: Object.freeze({ x: x.junction + 40, y: decks.mid }),
    valves: Object.freeze([Object.freeze({ id: 'junction', x: x.junction - 200, y: decks.mid }), Object.freeze({ id: 'habitation', x: x.crew - 110, y: decks.mid }),
      Object.freeze({ id: 'ring', x: x.service - 20, y: decks.mid })]),
    dock: dockFloor, hold: Object.freeze({ x: round((dockFloor.x0 + dockFloor.x1) / 2), y: decks.low, radius: 300 }),
    arrival: Object.freeze({ x: dockFloor.x0 + 40, y: decks.low }),
    // Owner decisions 2026-11-23 [PROPOSÉ placements]: Grue's people by the dock bulkhead (S9-2); the volunteer
    // colonists of Port-Méridien behind the technical team, walking in from the collar (S9-5).
    grue: Object.freeze({ x: x.dockDoor - 150, y: decks.low }),
    volunteers: Object.freeze({ x: dockFloor.x0 + 330, step: 44, y: decks.low })
  });
}

export function stationLevelPlacesV188(engine, campaignId) {
  return { 'station-s1': stationS1PlacesV188, 'station-s2': stationS2PlacesV188, 'station-s3': stationS3PlacesV188, 'station-s4': stationS4PlacesV188 }[campaignId]?.(engine) || null;
}
