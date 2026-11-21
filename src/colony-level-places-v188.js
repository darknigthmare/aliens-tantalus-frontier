// V188 — places of the dedicated colony levels C1-C4, measured on the generated
// level (mission-levels-v52.js): the colony template (C1, C3, C4) and the ship
// template (C2, the atmosphere processor). Pure: reads platforms, anchors, doors,
// ladders and rear doorways; never moves geometry. Every interaction point stands
// on the rail of a real floor and away from ladders (1 m ≈ 51 px).
// Distances below are [PROPOSÉ] placements; the template geometry is existing.

const list = value => Array.isArray(value) ? value : [];
const round = value => Math.round(Number(value) || 0);

function nodeCentre(engine, id, fallback) {
  const platform = list(engine?.platforms).find(entry => entry.id === `node-platform-${id}`);
  return platform ? round(platform.x + platform.w / 2) : fallback;
}
const door = (engine, id) => list(engine?.doors).find(entry => entry.id === id) || null;
const ladder = (engine, id) => list(engine?.ladders).find(entry => entry.id === id) || null;
const rear = (engine, id) => list(engine?.rearEntrancesV130).find(entry => entry.id === id) || null;

/** The main street of the colony template (C1, C3, C4). */
export function colonyStreetPlacesV188(engine) {
  const anchors = engine?.missionLevelRuntime?.anchors || {}, floorY = round(anchors.spawn?.y ?? 636);
  const warehouse = nodeCentre(engine, 'colony-street-a', 1250), doorway = rear(engine, 'colony-street-a-rear-v130');
  return Object.freeze({
    template: 'colony-multiroute', floorY,
    drop: round(anchors.spawn?.x ?? 180), quay: nodeCentre(engine, 'colony-gate', 640),
    warehouse, warehouseDoorway: doorway ? Object.freeze({ x: round(doorway.x), y: round(doorway.y), w: round(doorway.w || 76), h: floorY - round(doorway.y) })
      : Object.freeze({ x: warehouse - 38, y: floorY - 116, w: 76, h: 116 }),
    plaza: nodeCentre(engine, 'colony-plaza', 1944), streetB: nodeCentre(engine, 'colony-street-b', 2700),
    security: round(anchors.boss?.x ?? 3511), pad: nodeCentre(engine, 'colony-pad', 4200), extraction: round(anchors.extraction?.x ?? 4920),
    mainGate: door(engine, 'colony-main-gate'), securityGate: door(engine, 'security-gate'),
    roofY: round(list(engine?.platforms).find(entry => entry.id === 'node-platform-colony-med-high')?.y ?? 160)
  });
}

/** C1 « Tenir le port »: the V2 depth corridor, from the quay to the landing platform. */
export function colonyC1PlacesV188(engine) {
  const s = colonyStreetPlacesV188(engine), gate = s.securityGate;
  const airlockA = gate ? round(gate.x + gate.w / 2) : round((s.streetB + s.security) / 2);
  return Object.freeze({ ...s,
    corridor: Object.freeze({ x0: s.drop + 140, x1: s.extraction - 150 }),
    container: s.warehouseDoorway.x + s.warehouseDoorway.w + 50, // QZ17-04, beside the warehouse doorway (clear of the colony gate)
    shutter: s.warehouseDoorway, // the warehouse doorway takes the roller shutter
    infirmary: s.streetB, lucia: s.streetB + 130,
    patients: Object.freeze([s.streetB - 70, s.streetB - 20, s.streetB + 30]),
    airlockA, airlockB: round((s.security + s.pad) / 2 + 40),
    platform: Object.freeze({ x0: s.pad - 130, x1: s.pad + 130 }),
    kits: Object.freeze([s.pad + 70, s.pad + 115])
  });
}

/** C3 « Le convoi des rescapés »: M577 quay → triage corridor → scanner post → infirmary. */
export function colonyC3PlacesV188(engine) {
  const s = colonyStreetPlacesV188(engine);
  return Object.freeze({ ...s,
    m577: s.quay - 330, arrivals: Object.freeze([s.quay - 150, s.quay - 110, s.quay - 70, s.quay - 30, s.quay + 10]),
    scanner: s.plaza + 120, queue: Object.freeze([s.plaza - 40, s.plaza - 85, s.plaza - 130, s.plaza - 175, s.plaza - 220]),
    noor: s.streetB + 100, ward: Object.freeze([s.streetB - 150, s.streetB - 110, s.streetB - 70, s.streetB - 30, s.streetB + 10]),
    sideRooms: Object.freeze([s.warehouseDoorway.x + 38, s.plaza - 360, s.plaza + 380, s.streetB - 300])
  });
}

/** C4 « Le culte du port »: dormitories at night, duct network, cult gathering. */
export function colonyC4PlacesV188(engine) {
  const s = colonyStreetPlacesV188(engine), gate = s.mainGate;
  const vent = list(engine?.vents).find(entry => entry.id === 'colony-utility-depth-entrance' || entry.portalId === 'colony-utility-depth-entrance');
  const exit = list(engine?.vents).find(entry => entry.id === 'colony-medical-ceiling-exit' || entry.portalId === 'colony-medical-ceiling-exit');
  const ventEntry = vent ? round(vent.x + (vent.w || 0) / 2) : 1630;
  return Object.freeze({ ...s,
    dormitories: Object.freeze({ x0: s.drop + 200, x1: s.plaza + 200 }),
    clues: Object.freeze({ log: gate ? round(gate.x - 70) : s.quay + 200, sign: s.warehouse + 150, seal: ventEntry - 90 }),
    ventEntry, cache: Object.freeze({ x: exit ? round(exit.x + (exit.w || 0) + 70) : 2540, y: s.roofY }),
    gathering: Object.freeze({ x0: s.security - 120, x1: s.pad + 220 }),
    cultists: Object.freeze([s.security + 60, s.pad - 260, s.pad + 40]),
    cocoon: s.pad - 120
  });
}

/** C2 « L’air du port »: the processor's four levels on the ship template's decks. */
export function colonyC2PlacesV188(engine) {
  const anchors = engine?.missionLevelRuntime?.anchors || {};
  const deckY = id => round(list(engine?.platforms).find(entry => entry.id === `node-platform-${id}`)?.y);
  const top = deckY('ship-hull') || 140, mid = deckY('ship-crew') || 504, low = deckY('ship-reactor') || 868;
  const hull = nodeCentre(engine, 'ship-hull', 1213), crew = nodeCentre(engine, 'ship-crew', 2547), reactor = nodeCentre(engine, 'ship-reactor', 2541);
  const aft = nodeCentre(engine, 'ship-aft-low', 3498), bridge = nodeCentre(engine, 'ship-bridge', 2889);
  const up = ladder(engine, 'ship-e21'), toTop = ladder(engine, 'ship-e18');
  const climbX = up ? round(up.x) : 2544, topX = toTop ? round(toTop.x) : 3197;
  return Object.freeze({ template: 'ship-interior-vertical', decks: Object.freeze({ top, mid, low }),
    drop: round(anchors.spawn?.x ?? 180),
    gantry: Object.freeze({ x: hull, y: top }),
    ducts: Object.freeze({ x: crew, y: mid, x0: 2094, x1: 2860 }),
    exchangers: Object.freeze({ x: reactor + 60, y: low }), nest: Object.freeze({ x: reactor + 230, y: low }),
    breakers: Object.freeze([aft - 160, aft - 80, aft]), console: Object.freeze({ x: aft + 90, y: low }),
    route: Object.freeze([[aft, low], [climbX, low], [climbX, mid], [topX, mid], [topX, top], [Math.max(bridge + 200, topX - 90), top]].map(point => Object.freeze(point))),
    steam: Object.freeze([Object.freeze({ x: round((climbX + topX) / 2) - 60, y: mid }), Object.freeze({ x: topX - 150, y: mid })]),
    extraction: Object.freeze({ x: Math.max(bridge + 200, topX - 90), y: top })
  });
}
