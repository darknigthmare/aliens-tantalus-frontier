export const VENT_NETWORK_SCHEMA_V62 = 62;
export const VENT_TRANSIT_SCHEMA_V62 = 62;

export const VENT_PORTAL_TYPES_V62 = Object.freeze(['floor', 'wall', 'ceiling', 'depth']);
export const VENT_ACTOR_KINDS_V62 = Object.freeze(['player', 'ally', 'enemy']);
export const VENT_TRANSIT_PHASES_V62 = Object.freeze(['entering', 'at-node', 'moving', 'exiting']);

const DEFAULT_TRANSITION_MS = 480;
const EPSILON = 1e-9;

const asList = (value) => Array.isArray(value) ? value : [];
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));
const safeId = (value) => String(value || '').trim();
const finite = (value) => Number.isFinite(Number(value));
const unique = (values) => new Set(values).size === values.length;

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freezeDeep(child);
  return value;
}

function point(value = {}) {
  return {
    x: Number(value.x) || 0,
    y: Number(value.y) || 0,
    depth: Number(value.depth) || 0
  };
}

function pointIsFinite(value) {
  return value && finite(value.x) && finite(value.y) && (value.depth === undefined || finite(value.depth));
}

function distanceBetween(left, right) {
  const a = point(left);
  const b = point(right);
  return Math.hypot(b.x - a.x, b.y - a.y, b.depth - a.depth);
}

function interpolate(left, right, progress) {
  const a = point(left);
  const b = point(right);
  const amount = clamp(progress, 0, 1);
  return Object.freeze({
    x: a.x + (b.x - a.x) * amount,
    y: a.y + (b.y - a.y) * amount,
    depth: a.depth + (b.depth - a.depth) * amount
  });
}

function allowedKinds(entry) {
  const declared = asList(entry?.allowedKinds).map(safeId).filter((kind) => VENT_ACTOR_KINDS_V62.includes(kind));
  return declared.length ? declared : VENT_ACTOR_KINDS_V62;
}

function actorKindOf(actor, override) {
  const requested = safeId(override
    || actor?.ventActorKind
    || actor?.actorKind
    || (actor?.isEnemy ? 'enemy' : actor?.isAlly ? 'ally' : actor?.team === 'enemy' ? 'enemy' : actor?.team === 'ally' ? 'ally' : 'player'));
  if (!VENT_ACTOR_KINDS_V62.includes(requested)) throw new RangeError(`unsupported vent actor kind: ${requested || '(empty)'}`);
  return requested;
}

function networkIndexes(network) {
  return {
    nodes: new Map(asList(network?.nodes).map((entry) => [entry.id, entry])),
    edges: new Map(asList(network?.edges).map((entry) => [entry.id, entry])),
    entrances: new Map(asList(network?.entrances).map((entry) => [entry.id, entry])),
    exits: new Map(asList(network?.exits).map((entry) => [entry.id, entry]))
  };
}

function edgeLength(edge, indexes) {
  const explicit = Number(edge?.length);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  return distanceBetween(indexes.nodes.get(edge?.from)?.position, indexes.nodes.get(edge?.to)?.position);
}

function outgoingEdges(network, nodeId, kind, indexes = networkIndexes(network)) {
  const output = [];
  for (const edge of asList(network?.edges)) {
    if (!allowedKinds(edge).includes(kind) || edge.enabled === false) continue;
    if (edge.from === nodeId) output.push({ edge, toNodeId: edge.to, length: edgeLength(edge, indexes) });
    if (edge.bidirectional !== false && edge.to === nodeId) output.push({ edge, toNodeId: edge.from, length: edgeLength(edge, indexes) });
  }
  return output.sort((left, right) => left.edge.id.localeCompare(right.edge.id) || left.toNodeId.localeCompare(right.toNodeId));
}

function reachableNodes(network, startNodeIds, kind, indexes) {
  const reached = new Set(startNodeIds);
  const pending = [...reached].sort();
  while (pending.length) {
    const current = pending.shift();
    for (const branch of outgoingEdges(network, current, kind, indexes)) {
      if (reached.has(branch.toNodeId)) continue;
      reached.add(branch.toNodeId);
      pending.push(branch.toNodeId);
      pending.sort();
    }
  }
  return reached;
}

export function validateVentNetworkV62(network) {
  const errors = [];
  const add = (message) => { if (!errors.includes(message)) errors.push(message); };
  const networkId = safeId(network?.id);
  const nodes = asList(network?.nodes);
  const edges = asList(network?.edges);
  const entrances = asList(network?.entrances);
  const exits = asList(network?.exits);
  const indexes = networkIndexes(network);

  if (!networkId) add('network id is required');
  if (!nodes.length) add('network requires at least one node');
  if (!edges.length) add('network requires at least one edge');
  if (!entrances.length) add('network requires at least one entrance');
  if (!exits.length) add('network requires at least one exit');

  for (const [label, entries] of [['node', nodes], ['edge', edges], ['entrance', entrances], ['exit', exits]]) {
    const ids = entries.map((entry) => safeId(entry?.id));
    if (ids.some((id) => !id)) add(`${label} id is required`);
    if (!unique(ids)) add(`duplicate ${label} id`);
  }

  for (const node of nodes) {
    if (!pointIsFinite(node.position)) add(`node ${node.id} has no finite physical position`);
    const incident = edges.some((edge) => edge.from === node.id || edge.to === node.id);
    if (!incident) add(`orphan node ${node.id}`);
  }

  for (const edge of edges) {
    if (!indexes.nodes.has(edge.from) || !indexes.nodes.has(edge.to)) add(`edge ${edge.id} references an unknown node`);
    if (edge.from === edge.to) add(`edge ${edge.id} cannot connect a node to itself`);
    if (indexes.nodes.has(edge.from) && indexes.nodes.has(edge.to) && !(edgeLength(edge, indexes) > 0)) add(`edge ${edge.id} has no usable physical length`);
    const declaredKinds = asList(edge.allowedKinds);
    if (declaredKinds.length && declaredKinds.some((kind) => !VENT_ACTOR_KINDS_V62.includes(kind))) add(`edge ${edge.id} declares an unsupported actor kind`);
  }

  const validatePortal = (portal, label) => {
    if (!indexes.nodes.has(portal.nodeId)) add(`${label} ${portal.id} references an unknown node`);
    if (!VENT_PORTAL_TYPES_V62.includes(portal.type)) add(`${label} ${portal.id} has unsupported type ${safeId(portal.type) || '(empty)'}`);
    if (!pointIsFinite(portal.worldPosition)) add(`${label} ${portal.id} has no finite world position`);
    if (portal.enabled === false || portal.usable === false || portal.blocked === true) add(`${label} ${portal.id} is unusable`);
    if (portal.transitionMs !== undefined && (!finite(portal.transitionMs) || Number(portal.transitionMs) <= 0)) add(`${label} ${portal.id} has an invalid transition duration`);
    if (portal.clearance && (!finite(portal.clearance.width) || !finite(portal.clearance.height)
      || Number(portal.clearance.width) <= 0 || Number(portal.clearance.height) <= 0)) add(`${label} ${portal.id} has unusable clearance`);
    const declaredKinds = asList(portal.allowedKinds);
    if (declaredKinds.length && declaredKinds.some((kind) => !VENT_ACTOR_KINDS_V62.includes(kind))) add(`${label} ${portal.id} declares an unsupported actor kind`);
  };
  for (const entrance of entrances) validatePortal(entrance, 'entrance');
  for (const exit of exits) validatePortal(exit, 'exit');

  const reachedByKind = new Map();
  for (const kind of VENT_ACTOR_KINDS_V62) {
    const starts = entrances.filter((entry) => entry.enabled !== false && allowedKinds(entry).includes(kind)).map((entry) => entry.nodeId).filter((id) => indexes.nodes.has(id));
    reachedByKind.set(kind, reachableNodes(network, starts, kind, indexes));
  }

  for (const exit of exits) {
    if (!indexes.nodes.has(exit.nodeId)) continue;
    const compatibleKinds = allowedKinds(exit);
    const unreachableKinds = compatibleKinds.filter((kind) => !reachedByKind.get(kind)?.has(exit.nodeId));
    if (unreachableKinds.length) add(`exit ${exit.id} is unreachable for ${unreachableKinds.join(', ')}`);
  }

  const allReached = new Set([...reachedByKind.values()].flatMap((entries) => [...entries]));
  for (const node of nodes) if (!allReached.has(node.id)) add(`node ${node.id} is unreachable from every entrance`);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    networkId,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    entranceCount: entrances.length,
    exitCount: exits.length,
    portalTypes: Object.freeze([...new Set([...entrances, ...exits].map((entry) => entry.type).filter(Boolean))].sort())
  });
}

function assertNetwork(network) {
  const validation = validateVentNetworkV62(network);
  if (!validation.valid) throw new TypeError(`invalid vent network ${validation.networkId || '(unnamed)'}: ${validation.errors.join('; ')}`);
  return networkIndexes(network);
}

function cloneTransit(transit, patch = {}) {
  return {
    ...transit,
    routeNodeIds: [...asList(transit?.routeNodeIds)],
    ...patch
  };
}

function withTransit(actor, transit, patch = {}) {
  return {
    ...actor,
    ...patch,
    ventTransit: transit ? cloneTransit(transit) : null
  };
}

function actorWorldPosition(actor) {
  if (pointIsFinite(actor?.position)) return point(actor.position);
  return point({ x: actor?.x, y: actor?.y, depth: actor?.depth });
}

function placeActor(actor, worldPosition) {
  const destination = point(worldPosition);
  const patch = { position: destination };
  if ('x' in actor || 'y' in actor) {
    patch.x = destination.x;
    patch.y = destination.y;
  }
  if ('depth' in actor) patch.depth = destination.depth;
  return patch;
}

function requireTransit(network, actor, phases) {
  const indexes = assertNetwork(network);
  const transit = actor?.ventTransit;
  if (!transit || transit.networkId !== network.id || transit.schema !== VENT_TRANSIT_SCHEMA_V62) throw new TypeError('actor has no compatible vent transit state');
  if (phases && !phases.includes(transit.phase)) throw new RangeError(`vent transit phase ${transit.phase} does not allow this action`);
  return { indexes, transit };
}

export function enterVentNetworkV62(network, actor, entranceId, options = {}) {
  const indexes = assertNetwork(network);
  if (actor?.ventTransit) throw new RangeError('actor is already inside a vent network');
  const entrance = indexes.entrances.get(entranceId);
  if (!entrance) throw new RangeError(`unknown vent entrance: ${entranceId}`);
  const actorKind = actorKindOf(actor, options.actorKind);
  if (!allowedKinds(entrance).includes(actorKind) || entrance.enabled === false) throw new RangeError(`entrance ${entranceId} does not admit ${actorKind}`);
  const maximumDistance = Number(options.maximumDistance);
  if (Number.isFinite(maximumDistance) && distanceBetween(actorWorldPosition(actor), entrance.worldPosition) > maximumDistance) {
    throw new RangeError(`actor is too far from vent entrance ${entranceId}`);
  }
  const transitionMs = Number(entrance.transitionMs) > 0 ? Number(entrance.transitionMs) : DEFAULT_TRANSITION_MS;
  const transit = {
    schema: VENT_TRANSIT_SCHEMA_V62,
    networkId: network.id,
    actorId: safeId(actor?.id),
    actorKind,
    phase: 'entering',
    entryId: entrance.id,
    entryNodeId: entrance.nodeId,
    currentNodeId: null,
    edgeId: null,
    fromNodeId: null,
    toNodeId: entrance.nodeId,
    selectedExitId: null,
    progress: 0,
    elapsedMs: 0,
    transitionMs,
    travelledDistance: 0,
    routeNodeIds: []
  };
  return withTransit(actor, transit);
}

export function advanceVentTransitionV62(network, actor, deltaMs) {
  const { indexes, transit } = requireTransit(network, actor, ['entering', 'exiting']);
  const elapsedMs = Math.max(0, Number(deltaMs) || 0) + transit.elapsedMs;
  const transitionMs = Math.max(1, Number(transit.transitionMs) || DEFAULT_TRANSITION_MS);
  const progress = clamp(elapsedMs / transitionMs, 0, 1);

  if (progress < 1) return withTransit(actor, cloneTransit(transit, { elapsedMs, progress }));
  if (transit.phase === 'entering') {
    return withTransit(actor, cloneTransit(transit, {
      phase: 'at-node',
      currentNodeId: transit.entryNodeId,
      fromNodeId: null,
      toNodeId: null,
      progress: 0,
      elapsedMs: 0,
      routeNodeIds: [transit.entryNodeId]
    }));
  }

  const exit = indexes.exits.get(transit.selectedExitId);
  if (!exit) throw new RangeError(`unknown selected vent exit: ${transit.selectedExitId}`);
  return withTransit(actor, null, placeActor(actor, exit.worldPosition));
}

export function getVentBranchesV62(network, actor) {
  const { indexes, transit } = requireTransit(network, actor, ['at-node']);
  return Object.freeze(outgoingEdges(network, transit.currentNodeId, transit.actorKind, indexes).map((branch) => Object.freeze({
    edgeId: branch.edge.id,
    fromNodeId: transit.currentNodeId,
    toNodeId: branch.toNodeId,
    length: branch.length
  })));
}

export function selectVentBranchV62(network, actor, edgeId, toNodeId) {
  const { transit } = requireTransit(network, actor, ['at-node']);
  const branch = getVentBranchesV62(network, actor).find((entry) => entry.edgeId === edgeId && (!toNodeId || entry.toNodeId === toNodeId));
  if (!branch) throw new RangeError(`edge ${edgeId} is not a usable branch from ${transit.currentNodeId}`);
  return withTransit(actor, cloneTransit(transit, {
    phase: 'moving',
    edgeId: branch.edgeId,
    fromNodeId: branch.fromNodeId,
    toNodeId: branch.toNodeId,
    selectedExitId: null,
    progress: 0,
    elapsedMs: 0
  }));
}

export function moveVentTransitV62(network, actor, distance) {
  const { indexes, transit } = requireTransit(network, actor, ['moving']);
  const edge = indexes.edges.get(transit.edgeId);
  if (!edge) throw new RangeError(`unknown active vent edge: ${transit.edgeId}`);
  const length = edgeLength(edge, indexes);
  const requestedDistance = Math.max(0, Number(distance) || 0);
  const remainingDistance = length * (1 - clamp(transit.progress, 0, 1));
  const appliedDistance = Math.min(requestedDistance, remainingDistance);
  const progress = clamp(transit.progress + appliedDistance / length, 0, 1);
  const travelledDistance = transit.travelledDistance + appliedDistance;
  if (progress < 1 - EPSILON) return withTransit(actor, cloneTransit(transit, { progress, travelledDistance }));
  return withTransit(actor, cloneTransit(transit, {
    phase: 'at-node',
    currentNodeId: transit.toNodeId,
    edgeId: null,
    fromNodeId: null,
    toNodeId: null,
    selectedExitId: null,
    progress: 0,
    travelledDistance,
    routeNodeIds: [...transit.routeNodeIds, transit.toNodeId]
  }));
}

export function getVentExitsAtActorV62(network, actor) {
  const { indexes, transit } = requireTransit(network, actor, ['at-node']);
  return Object.freeze([...indexes.exits.values()]
    .filter((entry) => entry.nodeId === transit.currentNodeId && entry.enabled !== false && allowedKinds(entry).includes(transit.actorKind))
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((entry) => Object.freeze({ id: entry.id, type: entry.type, nodeId: entry.nodeId, destination: entry.destination || null })));
}

export function selectVentExitV62(network, actor, exitId) {
  const { transit } = requireTransit(network, actor, ['at-node']);
  const available = getVentExitsAtActorV62(network, actor).find((entry) => entry.id === exitId);
  if (!available) throw new RangeError(`exit ${exitId} is not usable at node ${transit.currentNodeId}`);
  return withTransit(actor, cloneTransit(transit, { selectedExitId: exitId }));
}

export function exitVentNetworkV62(network, actor) {
  const { indexes, transit } = requireTransit(network, actor, ['at-node']);
  if (!transit.selectedExitId) throw new RangeError('select a physical vent exit before starting exit');
  const exit = indexes.exits.get(transit.selectedExitId);
  if (!exit || exit.nodeId !== transit.currentNodeId || !allowedKinds(exit).includes(transit.actorKind)) throw new RangeError('selected vent exit is no longer usable');
  return withTransit(actor, cloneTransit(transit, {
    phase: 'exiting',
    progress: 0,
    elapsedMs: 0,
    transitionMs: Number(exit.transitionMs) > 0 ? Number(exit.transitionMs) : DEFAULT_TRANSITION_MS
  }));
}

export function getVentTransitPositionV62(network, actorOrTransit) {
  const indexes = assertNetwork(network);
  const transit = actorOrTransit?.ventTransit || actorOrTransit;
  if (!transit || transit.networkId !== network.id) return null;
  if (transit.phase === 'entering') {
    const entrance = indexes.entrances.get(transit.entryId);
    const node = indexes.nodes.get(transit.entryNodeId);
    return interpolate(entrance?.worldPosition, node?.position, transit.progress);
  }
  if (transit.phase === 'moving') {
    const from = indexes.nodes.get(transit.fromNodeId);
    const to = indexes.nodes.get(transit.toNodeId);
    return interpolate(from?.position, to?.position, transit.progress);
  }
  if (transit.phase === 'exiting') {
    const node = indexes.nodes.get(transit.currentNodeId);
    const exit = indexes.exits.get(transit.selectedExitId);
    return interpolate(node?.position, exit?.worldPosition, transit.progress);
  }
  return Object.freeze(point(indexes.nodes.get(transit.currentNodeId)?.position));
}

export function findVentRouteV62(network, { startNodeId, targetNodeId, actorKind = 'player' } = {}) {
  const indexes = assertNetwork(network);
  const kind = actorKindOf(null, actorKind);
  if (!indexes.nodes.has(startNodeId) || !indexes.nodes.has(targetNodeId)) return null;
  const records = new Map([[startNodeId, { distance: 0, signature: startNodeId, nodeIds: [startNodeId], edgeIds: [] }]]);
  const pending = new Set([startNodeId]);

  while (pending.size) {
    const current = [...pending].sort((left, right) => {
      const a = records.get(left);
      const b = records.get(right);
      return a.distance - b.distance || a.signature.localeCompare(b.signature);
    })[0];
    pending.delete(current);
    const currentRecord = records.get(current);
    if (current === targetNodeId) break;
    for (const branch of outgoingEdges(network, current, kind, indexes)) {
      const distance = currentRecord.distance + branch.length;
      const signature = `${currentRecord.signature}>${branch.edge.id}>${branch.toNodeId}`;
      const known = records.get(branch.toNodeId);
      if (known && (known.distance < distance - EPSILON || (Math.abs(known.distance - distance) <= EPSILON && known.signature.localeCompare(signature) <= 0))) continue;
      records.set(branch.toNodeId, {
        distance,
        signature,
        nodeIds: [...currentRecord.nodeIds, branch.toNodeId],
        edgeIds: [...currentRecord.edgeIds, branch.edge.id]
      });
      pending.add(branch.toNodeId);
    }
  }

  const route = records.get(targetNodeId);
  return route ? Object.freeze({
    actorKind: kind,
    startNodeId,
    targetNodeId,
    distance: route.distance,
    nodeIds: Object.freeze(route.nodeIds),
    edgeIds: Object.freeze(route.edgeIds)
  }) : null;
}

export function planVentTraversalV62({ network, actor, entranceId, exitId, actorKind } = {}) {
  const indexes = assertNetwork(network);
  const entrance = indexes.entrances.get(entranceId);
  const exit = indexes.exits.get(exitId);
  if (!entrance || !exit) return null;
  const kind = actorKindOf(actor, actorKind);
  if (!allowedKinds(entrance).includes(kind) || !allowedKinds(exit).includes(kind)) return null;
  const route = findVentRouteV62(network, { startNodeId: entrance.nodeId, targetNodeId: exit.nodeId, actorKind: kind });
  return route ? Object.freeze({ ...route, networkId: network.id, entranceId, exitId }) : null;
}

export function planAllyVentTraversalV62({ network, actor, entranceId, exitId, candidateExitIds, targetPosition } = {}) {
  if (exitId) return planVentTraversalV62({ network, actor, entranceId, exitId, actorKind: 'ally' });
  const indexes = assertNetwork(network);
  const candidates = (asList(candidateExitIds).length ? candidateExitIds : [...indexes.exits.keys()]).map((candidateId) => {
    const plan = planVentTraversalV62({ network, actor, entranceId, exitId: candidateId, actorKind: 'ally' });
    const exit = indexes.exits.get(candidateId);
    if (!plan || !exit) return null;
    return { plan, targetDistance: targetPosition ? distanceBetween(exit.worldPosition, targetPosition) : 0 };
  }).filter(Boolean).sort((left, right) => left.targetDistance - right.targetDistance
    || left.plan.distance - right.plan.distance
    || left.plan.exitId.localeCompare(right.plan.exitId));
  return candidates[0]?.plan || null;
}

export function planEnemyVentTraversalV62({ network, actor, entranceId, exitId, candidateExitIds, targetPosition } = {}) {
  if (exitId) return planVentTraversalV62({ network, actor, entranceId, exitId, actorKind: 'enemy' });
  const indexes = assertNetwork(network);
  const candidates = (asList(candidateExitIds).length ? candidateExitIds : [...indexes.exits.keys()]).map((candidateId) => {
    const plan = planVentTraversalV62({ network, actor, entranceId, exitId: candidateId, actorKind: 'enemy' });
    const exit = indexes.exits.get(candidateId);
    if (!plan || !exit) return null;
    return { plan, targetDistance: targetPosition ? distanceBetween(exit.worldPosition, targetPosition) : 0 };
  }).filter(Boolean).sort((left, right) => left.targetDistance - right.targetDistance
    || left.plan.distance - right.plan.distance
    || left.plan.exitId.localeCompare(right.plan.exitId));
  return candidates[0]?.plan || null;
}

export function advancePlannedVentTraversalV62({ network, actor, plan, deltaMs, distancePerSecond = 560 } = {}) {
  if (!actor?.ventTransit || !plan || plan.networkId !== network?.id || actor.ventTransit.networkId !== network.id) {
    throw new TypeError('actor and plan must belong to the same active vent network');
  }
  const before = actor.ventTransit;
  let next = actor;
  const safeDeltaMs = Math.max(0, Number(deltaMs) || 0);

  if (before.phase === 'entering' || before.phase === 'exiting') {
    next = advanceVentTransitionV62(network, actor, safeDeltaMs);
  } else if (before.phase === 'at-node') {
    if (before.currentNodeId === plan.targetNodeId) {
      next = selectVentExitV62(network, actor, plan.exitId);
      next = exitVentNetworkV62(network, next);
    } else {
      const index = asList(plan.nodeIds).indexOf(before.currentNodeId);
      const edgeId = asList(plan.edgeIds)[index];
      const toNodeId = asList(plan.nodeIds)[index + 1];
      if (index < 0 || !edgeId || !toNodeId) throw new RangeError(`planned vent route cannot continue from ${before.currentNodeId}`);
      next = selectVentBranchV62(network, actor, edgeId, toNodeId);
    }
  } else if (before.phase === 'moving') {
    next = moveVentTransitV62(network, actor, Math.max(0, Number(distancePerSecond) || 0) * safeDeltaMs / 1000);
  }

  const after = next.ventTransit;
  return Object.freeze({
    actor: next,
    completed: !after,
    phaseChanged: (after?.phase || null) !== before.phase,
    reachedNode: after?.phase === 'at-node'
      && (before.phase !== 'at-node' || after.currentNodeId !== before.currentNodeId),
    nodeId: after?.currentNodeId || plan.targetNodeId,
    exitId: plan.exitId
  });
}

function contactCue(transit) {
  if (transit.phase === 'entering') return transit.actorKind === 'enemy' ? 'vent-grate-impact' : 'vent-grate-open';
  if (transit.phase === 'exiting') return transit.actorKind === 'enemy' ? 'vent-grate-breach' : 'vent-grate-rattle';
  if (transit.phase === 'moving') return transit.actorKind === 'enemy' ? 'vent-claw-scrape' : 'vent-crawl-metal';
  return transit.actorKind === 'enemy' ? 'vent-junction-chitter' : 'vent-junction-shift';
}

export function createVentTrackerContactV62({ network, actor, observerPosition, trackerRange = 1800 } = {}) {
  const transit = actor?.ventTransit;
  const position = getVentTransitPositionV62(network, actor);
  if (!transit || !position) return null;
  const distance = distanceBetween(position, observerPosition);
  const phaseFactor = transit.phase === 'moving' ? 1 : transit.phase === 'at-node' ? 0.62 : 0.82;
  return Object.freeze({
    id: `vent:${safeId(actor.id) || transit.actorId}`,
    actorId: safeId(actor.id) || transit.actorId,
    actorKind: transit.actorKind,
    networkId: network.id,
    source: 'vent-motion',
    position,
    distance,
    strength: clamp((1 - distance / Math.max(1, Number(trackerRange) || 1800)) * phaseFactor, 0, 1),
    certainty: transit.phase === 'moving' ? 0.68 : 0.42,
    nodeId: transit.currentNodeId,
    edgeId: transit.edgeId,
    transitProgress: transit.progress,
    concealed: true
  });
}

export function createVentAudioContactV62({ network, actor, observerPosition, hearingRadius = 1100 } = {}) {
  const transit = actor?.ventTransit;
  const position = getVentTransitPositionV62(network, actor);
  if (!transit || !position) return null;
  const distance = distanceBetween(position, observerPosition);
  const gain = clamp(1 - distance / Math.max(1, Number(hearingRadius) || 1100), 0, 1);
  return Object.freeze({
    id: `vent-audio:${safeId(actor.id) || transit.actorId}`,
    actorId: safeId(actor.id) || transit.actorId,
    actorKind: transit.actorKind,
    networkId: network.id,
    source: 'vent-physical-contact',
    cue: contactCue(transit),
    caption: transit.actorKind === 'enemy' ? 'Griffes dans le conduit' : 'Mouvement dans le conduit',
    position,
    distance,
    gain,
    audible: gain > 0,
    occluded: true,
    nodeId: transit.currentNodeId,
    edgeId: transit.edgeId,
    transitProgress: transit.progress
  });
}

export function createVentContactOutputV62(options = {}) {
  const tracker = createVentTrackerContactV62(options);
  const audio = createVentAudioContactV62(options);
  if (!tracker || !audio) return null;
  return Object.freeze({ position: tracker.position, tracker, audio });
}

const node = (id, x, y, depth = 1, metadata = {}) => ({ id, position: { x, y, depth }, ...metadata });
const edge = (id, from, to, length, metadata = {}) => ({ id, from, to, length, bidirectional: true, ...metadata });
const portal = (id, nodeId, type, x, y, depth, destination, metadata = {}) => ({
  id,
  nodeId,
  type,
  worldPosition: { x, y, depth },
  transitionMs: DEFAULT_TRANSITION_MS,
  clearance: { width: 48, height: 42 },
  destination,
  ...metadata
});

const HUB_ROOMS = Object.freeze([
  ['command', 'bridge'], ['command', 'briefing'], ['command', 'combat-information'], ['command', 'cryo-bay'],
  ['habitat', 'crew-quarters'], ['habitat', 'mess'], ['habitat', 'medical'], ['habitat', 'science-lab'],
  ['industrial', 'quarantine'], ['industrial', 'armory'], ['industrial', 'workshop'], ['industrial', 'vehicle-bay'],
  ['engineering', 'dropship-hangar'], ['engineering', 'reactor'], ['engineering', 'life-support'], ['engineering', 'sensor-array']
]);

function buildHubNetwork() {
  const types = VENT_PORTAL_TYPES_V62;
  const nodes = HUB_ROOMS.map(([deckId, roomId], index) => {
    const deckIndex = Math.floor(index / 4);
    const roomIndex = index % 4;
    return node(`hub-${roomId}`, roomIndex * 2048 + 1024, deckIndex * 760 + 280, 2, { deckId, roomId, kind: roomIndex === 1 ? 'junction' : 'crawl' });
  });
  const edges = [];
  for (let deckIndex = 0; deckIndex < 4; deckIndex += 1) {
    for (let roomIndex = 0; roomIndex < 3; roomIndex += 1) {
      const from = HUB_ROOMS[deckIndex * 4 + roomIndex][1];
      const to = HUB_ROOMS[deckIndex * 4 + roomIndex + 1][1];
      edges.push(edge(`hub-${from}-${to}`, `hub-${from}`, `hub-${to}`, 2048, { kind: 'horizontal-duct' }));
    }
  }
  for (let deckIndex = 0; deckIndex < 3; deckIndex += 1) {
    const from = HUB_ROOMS[deckIndex * 4 + 1][1];
    const to = HUB_ROOMS[(deckIndex + 1) * 4 + 1][1];
    edges.push(edge(`hub-riser-${deckIndex + 1}-${deckIndex + 2}`, `hub-${from}`, `hub-${to}`, 760, { kind: 'vertical-riser' }));
  }
  const entrances = [];
  const exits = [];
  for (const [index, [deckId, roomId]] of HUB_ROOMS.entries()) {
    const deckIndex = Math.floor(index / 4);
    const roomIndex = index % 4;
    const type = types[index % types.length];
    const x = roomIndex * 2048 + 360 + (index % 2) * 1050;
    const y = deckIndex * 760 + (type === 'floor' ? 624 : type === 'ceiling' ? 88 : 348);
    const destination = { scope: 'hub', deckId, roomId };
    entrances.push(portal(`hub-${roomId}-entrance`, `hub-${roomId}`, type, x, y, type === 'depth' ? 3 : 0, destination));
    exits.push(portal(`hub-${roomId}-exit`, `hub-${roomId}`, type, x, y, type === 'depth' ? 3 : 0, destination));
  }
  return freezeDeep({
    schema: VENT_NETWORK_SCHEMA_V62,
    id: 'hub-uss-tantalus-v62',
    label: 'USS Tantalus physical duct network',
    scope: { kind: 'hub', id: 'uss-tantalus' },
    nodes,
    edges,
    entrances,
    exits
  });
}

export const HUB_VENT_NETWORK_V62 = buildHubNetwork();

const SHIP_MISSION_VENT_NETWORK_V62 = freezeDeep({
  schema: VENT_NETWORK_SCHEMA_V62,
  id: 'mission-ship-interior-vertical-v62',
  label: 'Ship service and pressure duct network',
  scope: { kind: 'mission', templateId: 'ship-interior-vertical' },
  nodes: [
    node('ship-duct-service', 1180, 520, 2, { zoneId: 'ship-docking' }),
    node('ship-duct-junction', 1840, 420, 3, { zoneId: 'ship-engineering', kind: 'junction' }),
    node('ship-duct-crew', 2520, 370, 2, { zoneId: 'ship-habitation' }),
    node('ship-duct-command', 3260, 300, 3, { zoneId: 'ship-command' }),
    node('ship-duct-airlock', 4010, 470, 2, { zoneId: 'ship-extraction' })
  ],
  edges: [
    edge('ship-duct-e01', 'ship-duct-service', 'ship-duct-junction', 680, { kind: 'crawl' }),
    edge('ship-duct-e02', 'ship-duct-junction', 'ship-duct-crew', 700, { kind: 'crawl' }),
    edge('ship-duct-e03', 'ship-duct-junction', 'ship-duct-command', 1460, { kind: 'depth-bypass' }),
    edge('ship-duct-e04', 'ship-duct-crew', 'ship-duct-command', 760, { kind: 'crawl' }),
    edge('ship-duct-e05', 'ship-duct-command', 'ship-duct-airlock', 780, { kind: 'pressure-duct' })
  ],
  entrances: [
    portal('ship-service-wall-entrance', 'ship-duct-service', 'wall', 1130, 540, 0, { scope: 'mission', zoneId: 'ship-docking' }),
    portal('ship-engineering-floor-entrance', 'ship-duct-junction', 'floor', 1900, 714, 0, { scope: 'mission', zoneId: 'ship-engineering' }),
    portal('ship-command-depth-entrance', 'ship-duct-command', 'depth', 3310, 410, 4, { scope: 'mission', zoneId: 'ship-command' })
  ],
  exits: [
    portal('ship-crew-ceiling-exit', 'ship-duct-crew', 'ceiling', 2580, 128, 0, { scope: 'mission', zoneId: 'ship-habitation' }),
    portal('ship-command-depth-exit', 'ship-duct-command', 'depth', 3310, 410, 4, { scope: 'mission', zoneId: 'ship-command' }),
    portal('ship-airlock-wall-exit', 'ship-duct-airlock', 'wall', 4080, 520, 0, { scope: 'mission', zoneId: 'ship-extraction' })
  ]
});

const COLONY_MISSION_VENT_NETWORK_V62 = freezeDeep({
  schema: VENT_NETWORK_SCHEMA_V62,
  id: 'mission-colony-multiroute-v62',
  label: 'Colony utility duct network',
  scope: { kind: 'mission', templateId: 'colony-multiroute' },
  nodes: [
    node('colony-duct-gate', 820, 520, 1, { zoneId: 'colony-approach' }),
    node('colony-duct-utility', 1560, 590, 3, { zoneId: 'colony-utility', kind: 'junction' }),
    node('colony-duct-medical', 2400, 360, 2, { zoneId: 'colony-civic' }),
    node('colony-duct-security', 3300, 500, 2, { zoneId: 'colony-security' })
  ],
  edges: [
    edge('colony-duct-e01', 'colony-duct-gate', 'colony-duct-utility', 760, { kind: 'service-tunnel' }),
    edge('colony-duct-e02', 'colony-duct-utility', 'colony-duct-medical', 880, { kind: 'utility-riser' }),
    edge('colony-duct-e03', 'colony-duct-utility', 'colony-duct-security', 1780, { kind: 'depth-bypass' }),
    edge('colony-duct-e04', 'colony-duct-medical', 'colony-duct-security', 920, { kind: 'service-tunnel' })
  ],
  entrances: [
    portal('colony-gate-floor-entrance', 'colony-duct-gate', 'floor', 760, 714, 0, { scope: 'mission', zoneId: 'colony-approach' }),
    portal('colony-utility-depth-entrance', 'colony-duct-utility', 'depth', 1630, 610, 4, { scope: 'mission', zoneId: 'colony-utility' })
  ],
  exits: [
    portal('colony-medical-ceiling-exit', 'colony-duct-medical', 'ceiling', 2460, 122, 0, { scope: 'mission', zoneId: 'colony-civic' }),
    portal('colony-security-wall-exit', 'colony-duct-security', 'wall', 3370, 520, 0, { scope: 'mission', zoneId: 'colony-security' })
  ]
});

const PLANET_MISSION_VENT_NETWORK_V62 = freezeDeep({
  schema: VENT_NETWORK_SCHEMA_V62,
  id: 'mission-planet-exterior-v62',
  label: 'Planet ruin and burrow access network',
  scope: { kind: 'mission', templateId: 'planet-exterior' },
  nodes: [
    node('planet-burrow-surface', 1240, 650, 1, { zoneId: 'planet-surface' }),
    node('planet-burrow-caves', 2050, 760, 4, { zoneId: 'planet-caves', kind: 'junction' }),
    node('planet-burrow-ruins', 2860, 480, 3, { zoneId: 'planet-ruins' }),
    node('planet-burrow-evac', 3980, 620, 2, { zoneId: 'planet-evac' })
  ],
  edges: [
    edge('planet-burrow-e01', 'planet-burrow-surface', 'planet-burrow-caves', 840, { kind: 'burrow' }),
    edge('planet-burrow-e02', 'planet-burrow-caves', 'planet-burrow-ruins', 860, { kind: 'ruin-conduit' }),
    edge('planet-burrow-e03', 'planet-burrow-caves', 'planet-burrow-evac', 1960, { kind: 'deep-burrow' }),
    edge('planet-burrow-e04', 'planet-burrow-ruins', 'planet-burrow-evac', 1140, { kind: 'ruin-conduit' })
  ],
  entrances: [
    portal('planet-surface-floor-entrance', 'planet-burrow-surface', 'floor', 1180, 714, 0, { scope: 'mission', zoneId: 'planet-surface' }),
    portal('planet-caves-depth-entrance', 'planet-burrow-caves', 'depth', 2100, 650, 5, { scope: 'mission', zoneId: 'planet-caves' })
  ],
  exits: [
    portal('planet-ruins-wall-exit', 'planet-burrow-ruins', 'wall', 2920, 520, 0, { scope: 'mission', zoneId: 'planet-ruins' }),
    portal('planet-evac-ceiling-exit', 'planet-burrow-evac', 'ceiling', 4040, 190, 0, { scope: 'mission', zoneId: 'planet-evac' })
  ]
});

export const MISSION_VENT_NETWORKS_V62 = freezeDeep({
  'ship-interior-vertical': SHIP_MISSION_VENT_NETWORK_V62,
  'colony-multiroute': COLONY_MISSION_VENT_NETWORK_V62,
  'planet-exterior': PLANET_MISSION_VENT_NETWORK_V62
});

export const AUTHORED_VENT_NETWORKS_V62 = freezeDeep({
  hub: HUB_VENT_NETWORK_V62,
  missions: MISSION_VENT_NETWORKS_V62
});
