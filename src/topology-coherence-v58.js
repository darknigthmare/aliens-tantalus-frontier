const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

const unique = (values) => new Set(values).size === values.length;

const addUnique = (values, message) => {
  if (!values.includes(message)) values.push(message);
};

const HUB_LAYOUT = Object.freeze([
  Object.freeze({ id: 'hub-west-bulkhead', xRatio: 1, kind: 'bulkhead', roomBoundary: 1, bidirectional: true }),
  Object.freeze({ id: 'hub-central-bulkhead', xRatio: 2, kind: 'bulkhead', roomBoundary: 2, bidirectional: true }),
  Object.freeze({ id: 'hub-east-bulkhead', xRatio: 3, kind: 'bulkhead', roomBoundary: 3, bidirectional: true }),
  Object.freeze({ id: 'hub-midship-lift', roomIndex: 1, insetFromRoomEnd: 188, kind: 'lift', lift: true, bidirectional: true }),
  Object.freeze({ id: 'hub-aft-lift', roomIndex: 3, insetFromEnd: 184, kind: 'lift', lift: true, bidirectional: true })
]);

export const HUB_DOOR_LAYOUT_V58 = HUB_LAYOUT;

export const MISSION_DOOR_LOCKS_V58 = Object.freeze({
  'cargo-bulkhead': Object.freeze({
    type: 'power',
    reason: 'CIRCUIT DU SAS HORS LIGNE',
    unlockHint: 'RÉTABLIR LE COURANT AU RÉACTEUR',
    unlockEventId: 'ship-power-cascade'
  }),
  'aft-bulkhead': Object.freeze({
    type: 'boss',
    reason: 'CONFINEMENT DU SAS ARRIÈRE',
    unlockHint: 'NEUTRALISER LA SIGNATURE ALPHA',
    unlockEventId: 'boss-defeated'
  }),
  'colony-main-gate': Object.freeze({
    type: 'power',
    reason: 'PORTE PRINCIPALE SANS ALIMENTATION',
    unlockHint: 'PASSER PAR LES TOITS OU LES GALERIES ET RELANCER LE GÉNÉRATEUR',
    unlockEventId: 'colony-generator-online'
  }),
  'security-gate': Object.freeze({
    type: 'power',
    reason: 'VOLET DE SÉCURITÉ EN MODE BLACKOUT',
    unlockHint: 'RELANCER LE GÉNÉRATEUR DES GALERIES',
    unlockEventId: 'colony-generator-online'
  })
});

function doorEdgeMap(plan) {
  return new Map(asList(plan?.graph?.edges)
    .filter((edge) => edge.kind === 'airlock' || edge.kind === 'gate')
    .map((edge) => [edge.gateId || edge.id, edge]));
}

export function compileMissionDoorTopologyV58(plan = {}) {
  const nodes = new Map(asList(plan?.graph?.nodes).map((node) => [node.id, node]));
  const edges = doorEdgeMap(plan);
  return Object.freeze(asList(plan?.geometry?.doors).map((door) => {
    const edge = edges.get(door.id);
    const from = nodes.get(door.from);
    const to = nodes.get(door.to);
    const lock = door.lock || MISSION_DOOR_LOCKS_V58[door.id] || null;
    return Object.freeze({
      ...door,
      fromZoneId: door.fromZoneId || from?.zoneId || null,
      toZoneId: door.toZoneId || to?.zoneId || null,
      bidirectional: door.bidirectional ?? !edge?.oneWay,
      destinations: Object.freeze({
        [door.from]: Object.freeze({ nodeId: door.to, zoneId: to?.zoneId || null }),
        [door.to]: Object.freeze({ nodeId: door.from, zoneId: from?.zoneId || null })
      }),
      lock: lock ? Object.freeze({ ...lock }) : null,
      lockedBy: lock?.type || null,
      lockReason: lock?.reason || '',
      unlockHint: lock?.unlockHint || '',
      unlockEventId: lock?.unlockEventId || null
    });
  }));
}

export function describeMissionDoorRequirementV58(door, fallback = '') {
  if (!door) return String(fallback || '');
  const reason = String(door.lockReason || door.lock?.reason || '').trim();
  const hint = String(door.unlockHint || door.lock?.unlockHint || '').trim();
  if ((door.levelLocked || fallback) && reason && hint) return `${reason} — ${hint}`;
  if ((door.levelLocked || fallback) && reason) return reason;
  if ((door.levelLocked || fallback) && hint) return `VERROUILLAGE DE SECTEUR — ${hint}`;
  return String(fallback || '');
}

function supportsAt(platforms, x, y, tolerance = 26) {
  return platforms.some((platform) => (
    Math.abs(Number(platform.y) - y) <= tolerance
      && x >= Number(platform.x) - tolerance
      && x <= Number(platform.x) + Number(platform.w) + tolerance
  ));
}

export function validateMissionTopologyV58(plan = {}) {
  const errors = [];
  const nodes = asList(plan?.graph?.nodes);
  const edges = asList(plan?.graph?.edges);
  const zones = asList(plan?.biomeZones);
  const platforms = asList(plan?.geometry?.platforms);
  const connectors = asList(plan?.geometry?.ladders);
  const vents = asList(plan?.geometry?.vents);
  const events = asList(plan?.events);
  const doors = compileMissionDoorTopologyV58(plan);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const zoneMap = new Map(zones.map((zone) => [zone.id, zone]));
  const eventMap = new Map(events.map((event) => [event.id, event]));
  const doorMap = new Map(doors.map((door) => [door.id, door]));
  const gatedEdges = edges.filter((edge) => edge.kind === 'airlock' || edge.kind === 'gate');
  const gatedEdgeMap = new Map(gatedEdges.map((edge) => [edge.gateId || edge.id, edge]));
  const nodePlatformIds = new Set(platforms.filter((platform) => platform.nodeId).map((platform) => platform.nodeId));

  if (!unique(nodes.map((node) => node.id))) addUnique(errors, 'duplicate graph node id');
  if (!unique(edges.map((edge) => edge.id))) addUnique(errors, 'duplicate graph edge id');
  if (!unique(doors.map((door) => door.id))) addUnique(errors, 'duplicate physical door id');
  if (!unique(gatedEdges.map((edge) => edge.gateId || edge.id))) addUnique(errors, 'duplicate gate destination id');

  for (const node of nodes) {
    const zone = zoneMap.get(node.zoneId);
    if (!zone) continue;
    if (node.x < zone.x - 32 || node.x > zone.x + zone.w + 32) addUnique(errors, `node ${node.id} is outside zone ${node.zoneId}`);
    if (!nodePlatformIds.has(node.id)) addUnique(errors, `node ${node.id} has no authored platform`);
  }

  for (const door of doors) {
    const edge = gatedEdgeMap.get(door.id);
    const from = nodeMap.get(door.from);
    const to = nodeMap.get(door.to);
    if (!edge) addUnique(errors, `door ${door.id} has no graph destination`);
    if (!from || !to || door.from === door.to) {
      addUnique(errors, `door ${door.id} has an invalid destination pair`);
      continue;
    }
    if (edge && (edge.from !== door.from || edge.to !== door.to)) addUnique(errors, `door ${door.id} destination disagrees with edge ${edge.id}`);
    const centerX = door.x + door.w / 2;
    const bottomY = door.y + door.h;
    if (centerX < Math.min(from.x, to.x) - 24 || centerX > Math.max(from.x, to.x) + 24) addUnique(errors, `door ${door.id} is outside its transition span`);
    if (Math.abs(bottomY - Math.max(from.y, to.y)) > 2) addUnique(errors, `door ${door.id} is vertically detached from its rooms`);
    if (!supportsAt(platforms, centerX, bottomY)) addUnique(errors, `door ${door.id} is outside every playable platform`);
    if (door.fromZoneId !== from.zoneId || door.toZoneId !== to.zoneId) addUnique(errors, `door ${door.id} has incoherent zone destinations`);
    if (!door.bidirectional && !edge?.oneWay) addUnique(errors, `door ${door.id} is not reciprocal`);
    if (door.destinations?.[from.id]?.nodeId !== to.id || door.destinations?.[to.id]?.nodeId !== from.id) addUnique(errors, `door ${door.id} is missing a reciprocal destination`);

    const lock = door.lock;
    if (!lock) continue;
    if (!['power', 'security', 'boss'].includes(lock.type)) addUnique(errors, `door ${door.id} has an unsupported lock type`);
    if (!lock.reason || !lock.unlockHint) addUnique(errors, `door ${door.id} lock has no player feedback`);
    if (lock.unlockEventId === 'boss-defeated') {
      if (!plan?.anchors?.boss) addUnique(errors, `door ${door.id} waits for a missing boss anchor`);
    } else {
      const unlockEvent = eventMap.get(lock.unlockEventId);
      if (!unlockEvent) addUnique(errors, `door ${door.id} references unknown unlock event ${lock.unlockEventId}`);
      else {
        const actions = new Set(asList(unlockEvent.actions).map(String));
        const directlyOpens = actions.has(`open:${door.id}`);
        const restoresRequirement = lock.type === 'power' && actions.has('power:restore');
        if (!directlyOpens && !restoresRequirement) addUnique(errors, `door ${door.id} unlock event cannot clear its lock`);
      }
    }
  }

  for (const edge of gatedEdges) {
    const gateId = edge.gateId || edge.id;
    if (!doorMap.has(gateId)) addUnique(errors, `edge ${edge.id} has no physical door`);
  }

  for (const event of events) {
    for (const action of asList(event.actions).map(String)) {
      const separator = action.indexOf(':');
      if (separator < 0) continue;
      const kind = action.slice(0, separator);
      const value = action.slice(separator + 1);
      if (['open', 'close', 'lock'].includes(kind) && !doorMap.has(value)) addUnique(errors, `event ${event.id} references unknown door ${value}`);
      if (kind === 'lock' && doorMap.has(value) && !doorMap.get(value).lock) addUnique(errors, `door ${value} can lock without an unlock contract`);
    }
  }

  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  let reciprocalConnectionCount = 0;
  for (const edge of edges) {
    const from = nodeMap.get(edge.from);
    const to = nodeMap.get(edge.to);
    if (!from || !to) continue;
    let artifactValid = false;
    if (['walk', 'slope', 'airlock', 'gate'].includes(edge.kind)) {
      const hasBridge = platforms.some((platform) => platform.edgeId === edge.id);
      const endpointReach = Math.abs(to.x - from.x) <= (from.width + to.width) / 2 + 56;
      artifactValid = nodePlatformIds.has(from.id) && nodePlatformIds.has(to.id) && (hasBridge || endpointReach);
      if (edge.kind === 'walk' && Math.abs(from.y - to.y) > 72) addUnique(errors, `walk edge ${edge.id} hides inaccessible verticality`);
      if ((edge.kind === 'airlock' || edge.kind === 'gate') && !doorMap.has(edge.gateId || edge.id)) artifactValid = false;
    } else if (edge.kind === 'ladder' || edge.kind === 'lift') {
      const connector = connectors.find((candidate) => candidate.id === edge.id);
      artifactValid = Boolean(connector
        && connector.from === from.id
        && connector.to === to.id
        && supportsAt(platforms, connector.x + connector.w / 2, from.y)
        && supportsAt(platforms, connector.x + connector.w / 2, to.y));
      if (Math.abs(from.y - to.y) < 48) addUnique(errors, `${edge.kind} ${edge.id} has no meaningful vertical span`);
    } else if (edge.kind === 'vent') {
      const vent = vents.find((candidate) => candidate.id === (edge.ventId || edge.id));
      artifactValid = Boolean(vent?.from?.nodeId === from.id && vent?.to?.nodeId === to.id);
    }
    if (!artifactValid) {
      addUnique(errors, `edge ${edge.id} has no coherent physical transition`);
      continue;
    }
    adjacency.get(from.id).push(to.id);
    if (!edge.oneWay) {
      adjacency.get(to.id).push(from.id);
      reciprocalConnectionCount += 1;
    }
  }

  const spawnId = plan?.anchors?.spawn?.nodeId;
  const reached = new Set(spawnId && nodeMap.has(spawnId) ? [spawnId] : []);
  const queue = [...reached];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacency.get(current) || []) {
      if (reached.has(next)) continue;
      reached.add(next);
      queue.push(next);
    }
  }
  if (reached.size !== nodes.length) addUnique(errors, `physical graph disconnected: ${reached.size}/${nodes.length} nodes reachable`);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    doorCount: doors.length,
    reciprocalConnectionCount,
    physicallyReachableNodes: reached.size,
    totalNodes: nodes.length
  });
}

export function buildHubTopologyV58(decks = [], world = {}) {
  const roomWidth = Number(world.roomWidth) || 1280;
  const width = Number(world.width) || roomWidth * 4;
  const nodes = decks.flatMap((deck, deckIndex) => asList(deck.rooms).map((room, roomIndex) => Object.freeze({
    id: room.id,
    deckId: deck.id,
    deckIndex,
    roomIndex,
    xStart: Number(room.xStart),
    xEnd: Number(room.xEnd)
  })));
  const edges = [];
  for (const [deckIndex, deck] of decks.entries()) {
    for (const connection of HUB_LAYOUT.filter((entry) => Number.isFinite(entry.roomBoundary))) {
      const from = deck.rooms[connection.roomBoundary - 1];
      const to = deck.rooms[connection.roomBoundary];
      if (!from || !to) continue;
      edges.push(Object.freeze({
        id: `${deck.id}:${connection.id}`,
        kind: connection.kind,
        from: from.id,
        to: to.id,
        x: connection.xRatio * roomWidth,
        deckIndex,
        bidirectional: connection.bidirectional
      }));
    }
  }
  for (const connection of HUB_LAYOUT.filter((entry) => entry.lift)) {
    const roomIndex = connection.roomIndex;
    const x = Number.isFinite(connection.insetFromEnd)
      ? width - connection.insetFromEnd
      : (roomIndex + 1) * roomWidth - connection.insetFromRoomEnd;
    for (let deckIndex = 0; deckIndex < decks.length - 1; deckIndex += 1) {
      const from = decks[deckIndex]?.rooms?.[roomIndex];
      const to = decks[deckIndex + 1]?.rooms?.[roomIndex];
      if (!from || !to) continue;
      edges.push(Object.freeze({
        id: `${connection.id}:${deckIndex}-${deckIndex + 1}:r${roomIndex}`,
        shaftId: connection.id,
        kind: 'lift',
        from: from.id,
        to: to.id,
        x,
        fromDeck: deckIndex,
        toDeck: deckIndex + 1,
        roomIndex,
        bidirectional: connection.bidirectional
      }));
    }
  }
  return Object.freeze({
    schema: 58,
    source: 'hub-topology-v58',
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
    doorLayout: HUB_LAYOUT
  });
}

export function buildHubDoorNetworkV58(decks = [], world = {}, deckIndex = 0) {
  const roomWidth = Number(world.roomWidth) || 1280;
  const width = Number(world.width) || roomWidth * 4;
  const currentDeck = decks[deckIndex];
  if (!currentDeck) return Object.freeze([]);
  const bulkheads = HUB_LAYOUT.filter((entry) => Number.isFinite(entry.roomBoundary)).flatMap((connection) => {
    const from = currentDeck.rooms?.[connection.roomBoundary - 1];
    const to = currentDeck.rooms?.[connection.roomBoundary];
    if (!from || !to) return [];
    return [Object.freeze({
      id: `${currentDeck.id}:${connection.id}`,
      kind: 'bulkhead',
      lift: false,
      blocking: true,
      x: connection.xRatio * roomWidth,
      deckIndex,
      fromRoomId: from.id,
      toRoomId: to.id,
      fromLabel: from.name,
      toLabel: to.name,
      destinationLabel: `${from.name} ↔ ${to.name}`,
      progress: 0
    })];
  });
  const lifts = HUB_LAYOUT.filter((entry) => entry.lift).flatMap((connection) => {
    const roomIndex = connection.roomIndex;
    const room = currentDeck.rooms?.[roomIndex];
    if (!room) return [];
    const x = Number.isFinite(connection.insetFromEnd)
      ? width - connection.insetFromEnd
      : (roomIndex + 1) * roomWidth - connection.insetFromRoomEnd;
    const destinations = decks.map((deck, targetDeckIndex) => Object.freeze({
      deckIndex: targetDeckIndex,
      deckId: deck.id,
      deckName: deck.name,
      roomIndex,
      roomId: deck.rooms?.[roomIndex]?.id || null,
      roomName: deck.rooms?.[roomIndex]?.name || '',
      destinationCenterX: x,
      destinationX: x - 22
    }));
    return [Object.freeze({
      id: `${currentDeck.id}:${connection.id}`,
      shaftId: connection.id,
      kind: 'lift',
      lift: true,
      blocking: false,
      x,
      deckIndex,
      roomIndex,
      roomId: room.id,
      shaftLabel: connection.id === 'hub-midship-lift' ? 'ASCENSEUR MÉDIAN' : 'ASCENSEUR ARRIÈRE',
      destinations: Object.freeze(destinations),
      progress: 0
    })];
  });
  return Object.freeze([...bulkheads, ...lifts]);
}

/**
 * Projette le réseau physique des portes dans l'espace local de chaque salle.
 * Ces sockets sont la seule source autorisée pour aligner l'art et les portes :
 * un détail peint ne peut donc plus créer un passage intérieur inexistant.
 */
export function buildHubRoomDoorSocketsV60(decks = [], world = {}, deckIndex = 0) {
  const roomWidth = Number(world.roomWidth) || 1280;
  const deck = decks[deckIndex];
  if (!deck) return Object.freeze({});
  const network = buildHubDoorNetworkV58(decks, world, deckIndex);
  return Object.freeze(Object.fromEntries(deck.rooms.map((room) => {
    const sockets = network.flatMap((door) => {
      const belongs = door.lift
        ? door.roomId === room.id
        : door.fromRoomId === room.id || door.toRoomId === room.id;
      if (!belongs) return [];
      const localX = Number(door.x) - Number(room.xStart);
      const side = localX <= 2 ? 'west' : localX >= roomWidth - 2 ? 'east' : 'interior';
      return [Object.freeze({
        id: `${door.id}:${room.id}`,
        doorId: door.id,
        roomId: room.id,
        kind: door.kind,
        lift: Boolean(door.lift),
        worldX: Number(door.x),
        localX,
        side,
        interior: side === 'interior'
      })];
    });
    return [room.id, Object.freeze(sockets)];
  })));
}

export function validateHubRoomDoorSocketsV60({ decks = [], world = {}, deckIndex = 0, sockets = null } = {}) {
  const errors = [];
  const deck = decks[deckIndex];
  if (!deck) return Object.freeze({ valid: false, errors: Object.freeze(['unknown hub deck']), socketCount: 0 });
  const network = buildHubDoorNetworkV58(decks, world, deckIndex);
  const resolved = sockets || buildHubRoomDoorSocketsV60(decks, world, deckIndex);
  const flattened = deck.rooms.flatMap((room) => asList(resolved[room.id]));
  for (const socket of flattened) {
    const door = network.find((entry) => entry.id === socket.doorId);
    if (!door) addUnique(errors, `socket ${socket.id} has no runtime door`);
    if (door && Number(door.x) !== Number(socket.worldX)) addUnique(errors, `socket ${socket.id} disagrees with runtime door x`);
  }
  for (const door of network) {
    const expected = door.lift ? 1 : 2;
    const count = flattened.filter((socket) => socket.doorId === door.id).length;
    if (count !== expected) addUnique(errors, `door ${door.id} exposes ${count}/${expected} room sockets`);
  }
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    socketCount: flattened.length,
    interiorSocketCount: flattened.filter((socket) => socket.interior).length
  });
}

export function validateHubTopologyV58({ decks = [], world = {}, topology = null } = {}) {
  const errors = [];
  const roomWidth = Number(world.roomWidth) || 1280;
  const width = Number(world.width) || roomWidth * 4;
  const graph = topology || buildHubTopologyV58(decks, world);
  const roomMap = new Map(graph.nodes.map((room) => [room.id, room]));

  if (!unique(graph.nodes.map((room) => room.id))) addUnique(errors, 'duplicate hub room id');
  if (!unique(graph.edges.map((edge) => edge.id))) addUnique(errors, 'duplicate hub connection id');
  for (const room of graph.nodes) {
    if (room.xStart !== room.roomIndex * roomWidth || room.xEnd !== (room.roomIndex + 1) * roomWidth) addUnique(errors, `room ${room.id} has incoherent world bounds`);
  }
  for (const edge of graph.edges) {
    const from = roomMap.get(edge.from);
    const to = roomMap.get(edge.to);
    if (!from || !to || edge.from === edge.to) {
      addUnique(errors, `hub connection ${edge.id} has an invalid destination`);
      continue;
    }
    if (!edge.bidirectional) addUnique(errors, `hub connection ${edge.id} is not reciprocal`);
    if (edge.x < 0 || edge.x > width) addUnique(errors, `hub connection ${edge.id} is outside world bounds`);
    if (edge.kind === 'lift') {
      if (Math.abs(from.deckIndex - to.deckIndex) !== 1) addUnique(errors, `lift ${edge.id} skips a deck`);
      if (from.roomIndex !== to.roomIndex || from.roomIndex !== edge.roomIndex) addUnique(errors, `lift ${edge.id} changes to an incoherent room`);
    } else {
      if (from.deckIndex !== to.deckIndex) addUnique(errors, `door ${edge.id} crosses decks without a lift`);
      if (to.roomIndex !== from.roomIndex + 1) addUnique(errors, `door ${edge.id} does not connect adjacent rooms`);
      const expectedBoundary = to.roomIndex * roomWidth;
      if (Math.abs(edge.x - expectedBoundary) > 2) addUnique(errors, `door ${edge.id} is outside its room boundary`);
    }
  }

  const adjacency = new Map(graph.nodes.map((room) => [room.id, []]));
  for (const edge of graph.edges) {
    if (!adjacency.has(edge.from) || !adjacency.has(edge.to)) continue;
    adjacency.get(edge.from).push(edge.to);
    if (edge.bidirectional) adjacency.get(edge.to).push(edge.from);
  }
  const firstId = graph.nodes[0]?.id;
  const reached = new Set(firstId ? [firstId] : []);
  const queue = [...reached];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacency.get(current) || []) {
      if (reached.has(next)) continue;
      reached.add(next);
      queue.push(next);
    }
  }
  if (reached.size !== graph.nodes.length) addUnique(errors, `hub graph disconnected: ${reached.size}/${graph.nodes.length} rooms reachable`);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    roomCount: graph.nodes.length,
    connectionCount: graph.edges.length,
    reachableRooms: reached.size,
    reciprocalConnectionCount: graph.edges.filter((edge) => edge.bidirectional).length
  });
}

export function validateHubRuntimeTopologyV58({ deck, world = {}, platforms = [], ladders = [], vents = [], doors = [] } = {}) {
  const errors = [];
  const floorY = Number(world.floorY) || 624;
  const rooms = asList(deck?.rooms);
  for (const room of rooms) {
    const roomPlatforms = platforms.filter((entry) => entry.roomId === room.id);
    const roomLadders = ladders.filter((entry) => entry.roomId === room.id);
    const roomVents = vents.filter((entry) => entry.roomId === room.id);
    if (!roomPlatforms.length) {
      addUnique(errors, `room ${room.id} has no authored traversal surface`);
      continue;
    }
    const supports = (x, y) => Math.abs(y - floorY) <= 2 || roomPlatforms.some((platform) => (
      Math.abs(platform.y - y) <= 2 && x >= platform.x - 4 && x <= platform.x + platform.w + 4
    ));
    for (const ladder of roomLadders) {
      if (!supports(ladder.x, ladder.top) || !supports(ladder.x, ladder.bottom)) {
        addUnique(errors, `room ${room.id} ladder ${ladder.id || ladder.x} has a detached endpoint`);
      }
    }
    const reachableHeights = new Set([floorY]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const ladder of roomLadders) {
        const topReachable = [...reachableHeights].some((height) => Math.abs(height - ladder.top) <= 2);
        const bottomReachable = [...reachableHeights].some((height) => Math.abs(height - ladder.bottom) <= 2);
        if (bottomReachable && supports(ladder.x, ladder.top) && !topReachable) {
          reachableHeights.add(ladder.top);
          changed = true;
        }
        if (topReachable && supports(ladder.x, ladder.bottom) && !bottomReachable) {
          reachableHeights.add(ladder.bottom);
          changed = true;
        }
      }
    }
    for (const platform of roomPlatforms) {
      if (![...reachableHeights].some((height) => Math.abs(height - platform.y) <= 2)) {
        addUnique(errors, `room ${room.id} platform ${platform.id || platform.x} is inaccessible`);
      }
    }
    for (const roomVent of roomVents) {
      const bottom = roomVent.y + roomVent.h;
      const attached = roomPlatforms.some((platform) => Math.abs(platform.y - bottom) <= 2
        && roomVent.x + roomVent.w > platform.x && roomVent.x < platform.x + platform.w);
      if (!attached) addUnique(errors, `room ${room.id} vent ${roomVent.id || roomVent.x} is detached from a reachable surface`);
    }
  }
  for (const door of doors) {
    const x = Number(door.x);
    if (!Number.isFinite(x) || x < 0 || x > Number(world.width || 0)) addUnique(errors, `hub door ${door.id || x} is outside world bounds`);
  }
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    roomCount: rooms.length,
    platformCount: platforms.length,
    ladderCount: ladders.length,
    ventCount: vents.length,
    doorCount: doors.length
  });
}
