import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AUTHORED_VENT_NETWORKS_V62,
  HUB_VENT_NETWORK_V62,
  MISSION_VENT_NETWORKS_V62,
  VENT_PORTAL_TYPES_V62,
  advancePlannedVentTraversalV62,
  advanceVentTransitionV62,
  createVentContactOutputV62,
  enterVentNetworkV62,
  exitVentNetworkV62,
  findVentRouteV62,
  getVentBranchesV62,
  getVentTransitPositionV62,
  moveVentTransitV62,
  planAllyVentTraversalV62,
  planEnemyVentTraversalV62,
  selectVentBranchV62,
  selectVentExitV62,
  validateVentNetworkV62
} from '../src/vent-network-v62.js';

const clone = (value) => structuredClone(value);

function fixtureNetwork() {
  return {
    schema: 62,
    id: 'fixture-vent-network',
    nodes: [
      { id: 'node-a', position: { x: 0, y: 0, depth: 1 } },
      { id: 'node-b', position: { x: 100, y: 0, depth: 1 } }
    ],
    edges: [
      { id: 'edge-a-b', from: 'node-a', to: 'node-b', length: 100, bidirectional: true }
    ],
    entrances: [
      { id: 'entrance-a', nodeId: 'node-a', type: 'wall', worldPosition: { x: -20, y: 0, depth: 0 }, transitionMs: 400 }
    ],
    exits: [
      { id: 'exit-b', nodeId: 'node-b', type: 'floor', worldPosition: { x: 120, y: 20, depth: 0 }, transitionMs: 400 }
    ]
  };
}

function advanceEntry(network, actor) {
  return advanceVentTransitionV62(network, actor, actor.ventTransit.transitionMs);
}

function traversePlan(network, actor, plan) {
  let current = actor;
  for (let index = 0; index < plan.edgeIds.length; index += 1) {
    current = selectVentBranchV62(network, current, plan.edgeIds[index], plan.nodeIds[index + 1]);
    const branch = getVentBranchesV62(network, {
      ...current,
      ventTransit: { ...current.ventTransit, phase: 'at-node', currentNodeId: plan.nodeIds[index], edgeId: null, fromNodeId: null, toNodeId: null }
    }).find((entry) => entry.edgeId === plan.edgeIds[index] && entry.toNodeId === plan.nodeIds[index + 1]);
    current = moveVentTransitV62(network, current, branch.length);
  }
  return current;
}

test('les réseaux auteur V62 couvrent le hub, trois archétypes mission et les quatre types de bouche', () => {
  assert.equal(AUTHORED_VENT_NETWORKS_V62.hub, HUB_VENT_NETWORK_V62);
  assert.equal(Object.keys(MISSION_VENT_NETWORKS_V62).length, 3);
  assert.equal(HUB_VENT_NETWORK_V62.nodes.length, 16, 'une section physique par salle du Tantalus');
  assert.equal(HUB_VENT_NETWORK_V62.entrances.length, 16);
  assert.equal(HUB_VENT_NETWORK_V62.exits.length, 16);

  const networks = [HUB_VENT_NETWORK_V62, ...Object.values(MISSION_VENT_NETWORKS_V62)];
  const types = new Set();
  for (const network of networks) {
    const validation = validateVentNetworkV62(network);
    assert.equal(validation.valid, true, `${network.id}: ${validation.errors.join('; ')}`);
    for (const portal of [...network.entrances, ...network.exits]) types.add(portal.type);
  }
  assert.deepEqual([...types].sort(), [...VENT_PORTAL_TYPES_V62].sort());
  assert.equal(Object.isFrozen(HUB_VENT_NETWORK_V62.nodes[0].position), true, 'les specs auteur sont profondément immuables');
});

test('le validateur rejette les nœuds orphelins, références pendantes, sorties inaccessibles et sorties inutilisables', () => {
  const valid = validateVentNetworkV62(fixtureNetwork());
  assert.equal(valid.valid, true, valid.errors.join('; '));

  const orphan = fixtureNetwork();
  orphan.nodes.push({ id: 'node-orphan', position: { x: 50, y: 50, depth: 1 } });
  assert.match(validateVentNetworkV62(orphan).errors.join('; '), /orphan node node-orphan/);

  const dangling = fixtureNetwork();
  dangling.edges[0].to = 'node-missing';
  assert.match(validateVentNetworkV62(dangling).errors.join('; '), /references an unknown node/);

  const unreachable = fixtureNetwork();
  unreachable.edges[0] = { ...unreachable.edges[0], from: 'node-b', to: 'node-a', bidirectional: false };
  assert.match(validateVentNetworkV62(unreachable).errors.join('; '), /exit exit-b is unreachable/);

  const blocked = fixtureNetwork();
  blocked.exits[0].blocked = true;
  assert.match(validateVentNetworkV62(blocked).errors.join('; '), /exit exit-b is unusable/);

  const invalidSurface = fixtureNetwork();
  invalidSurface.exits[0].type = 'ladder';
  assert.match(validateVentNetworkV62(invalidSurface).errors.join('; '), /unsupported type ladder/);
});

test('entrer est une transition progressive et ne téléporte jamais le joueur', () => {
  const network = fixtureNetwork();
  const source = { id: 'player', ventActorKind: 'player', position: { x: -20, y: 0, depth: 0 } };
  let actor = enterVentNetworkV62(network, source, 'entrance-a', { maximumDistance: 8 });

  assert.equal(source.ventTransit, undefined, 'la fonction ne mute pas l’acteur source');
  assert.equal(actor.ventTransit.phase, 'entering');
  assert.deepEqual(actor.position, source.position);
  assert.deepEqual(getVentTransitPositionV62(network, actor), { x: -20, y: 0, depth: 0 });
  assert.throws(() => selectVentBranchV62(network, actor, 'edge-a-b'), /does not allow this action/);

  actor = advanceVentTransitionV62(network, actor, 200);
  assert.equal(actor.ventTransit.phase, 'entering');
  assert.equal(actor.ventTransit.progress, 0.5);
  assert.deepEqual(actor.position, source.position, 'la position monde reste devant la grille pendant l’animation');
  assert.deepEqual(getVentTransitPositionV62(network, actor), { x: -10, y: 0, depth: 0.5 });

  actor = advanceVentTransitionV62(network, actor, 200);
  assert.equal(actor.ventTransit.phase, 'at-node');
  assert.equal(actor.ventTransit.currentNodeId, 'node-a');
  assert.deepEqual(actor.ventTransit.routeNodeIds, ['node-a']);
  assert.throws(() => selectVentExitV62(network, actor, 'exit-b'), /not usable at node node-a/);
});

test('déplacement, choix de branche, sélection de sortie et sortie restent des étapes physiques distinctes', () => {
  const network = HUB_VENT_NETWORK_V62;
  const entrance = network.entrances.find((entry) => entry.id === 'hub-bridge-entrance');
  const exit = network.exits.find((entry) => entry.id === 'hub-mess-exit');
  const startPosition = clone(entrance.worldPosition);
  let actor = { id: 'marine-ripley', ventActorKind: 'player', position: startPosition };
  const plan = findVentRouteV62(network, { startNodeId: entrance.nodeId, targetNodeId: exit.nodeId, actorKind: 'player' });

  assert.deepEqual(plan.nodeIds, ['hub-bridge', 'hub-briefing', 'hub-mess']);
  actor = advanceEntry(network, enterVentNetworkV62(network, actor, entrance.id));

  actor = selectVentBranchV62(network, actor, plan.edgeIds[0], plan.nodeIds[1]);
  const firstBranch = network.edges.find((entry) => entry.id === plan.edgeIds[0]);
  actor = moveVentTransitV62(network, actor, firstBranch.length / 2);
  assert.equal(actor.ventTransit.phase, 'moving');
  assert.equal(actor.ventTransit.progress, 0.5);
  actor = moveVentTransitV62(network, actor, firstBranch.length);
  assert.equal(actor.ventTransit.currentNodeId, plan.nodeIds[1], 'le surplus ne saute pas le prochain embranchement');

  actor = selectVentBranchV62(network, actor, plan.edgeIds[1], plan.nodeIds[2]);
  const secondBranch = network.edges.find((entry) => entry.id === plan.edgeIds[1]);
  actor = moveVentTransitV62(network, actor, secondBranch.length);
  assert.equal(actor.ventTransit.currentNodeId, exit.nodeId);

  actor = selectVentExitV62(network, actor, exit.id);
  actor = exitVentNetworkV62(network, actor);
  assert.equal(actor.ventTransit.phase, 'exiting');
  assert.deepEqual(actor.position, startPosition, 'déclencher la sortie ne déplace pas encore l’acteur');
  actor = advanceVentTransitionV62(network, actor, actor.ventTransit.transitionMs / 2);
  assert.equal(actor.ventTransit.phase, 'exiting');
  assert.deepEqual(actor.position, startPosition);
  actor = advanceVentTransitionV62(network, actor, actor.ventTransit.transitionMs / 2);
  assert.equal(actor.ventTransit, null);
  assert.deepEqual(actor.position, exit.worldPosition, 'la position monde change seulement après la fin de sortie');
});

test('actor.ventTransit survit à un aller-retour JSON au milieu d’un segment', () => {
  const network = MISSION_VENT_NETWORKS_V62['ship-interior-vertical'];
  const entranceId = 'ship-engineering-floor-entrance';
  const exitId = 'ship-airlock-wall-exit';
  const entrance = network.entrances.find((entry) => entry.id === entranceId);
  const plan = planEnemyVentTraversalV62({ network, actor: { id: 'xeno-17' }, entranceId, exitId });
  let actor = { id: 'xeno-17', isEnemy: true, x: entrance.worldPosition.x, y: entrance.worldPosition.y, depth: entrance.worldPosition.depth };
  actor = advanceEntry(network, enterVentNetworkV62(network, actor, entranceId));
  actor = selectVentBranchV62(network, actor, plan.edgeIds[0], plan.nodeIds[1]);
  const branch = getVentBranchesV62(network, {
    ...actor,
    ventTransit: { ...actor.ventTransit, phase: 'at-node', currentNodeId: plan.nodeIds[0], edgeId: null, fromNodeId: null, toNodeId: null }
  }).find((entry) => entry.edgeId === plan.edgeIds[0] && entry.toNodeId === plan.nodeIds[1]);
  actor = moveVentTransitV62(network, actor, branch.length * 0.37);
  const positionBefore = getVentTransitPositionV62(network, actor);

  const restored = JSON.parse(JSON.stringify(actor));
  assert.deepEqual(restored.ventTransit, actor.ventTransit);
  assert.deepEqual(getVentTransitPositionV62(network, restored), positionBefore);
  assert.equal(restored.ventTransit.actorId, 'xeno-17');

  const resumed = moveVentTransitV62(network, restored, branch.length);
  assert.equal(resumed.ventTransit.phase, 'at-node');
  assert.equal(resumed.ventTransit.currentNodeId, plan.nodeIds[1]);
  assert.equal(resumed.id, 'xeno-17', 'la reprise conserve la même entité, sans recréation ni disparition');
});

test('les routes IA sont déterministes et les politiques allié/ennemi respectent les accès physiques', () => {
  const diamond = {
    schema: 62,
    id: 'deterministic-diamond',
    nodes: [
      { id: 'start', position: { x: 0, y: 0 } },
      { id: 'alpha', position: { x: 50, y: -20 } },
      { id: 'beta', position: { x: 50, y: 20 } },
      { id: 'target', position: { x: 100, y: 0 } }
    ],
    edges: [
      { id: 'z-start-beta', from: 'start', to: 'beta', length: 50, bidirectional: true },
      { id: 'z-beta-target', from: 'beta', to: 'target', length: 50, bidirectional: true },
      { id: 'a-start-alpha', from: 'start', to: 'alpha', length: 50, bidirectional: true },
      { id: 'a-alpha-target', from: 'alpha', to: 'target', length: 50, bidirectional: true }
    ],
    entrances: [{ id: 'diamond-in', nodeId: 'start', type: 'floor', worldPosition: { x: -10, y: 0 } }],
    exits: [{ id: 'diamond-out', nodeId: 'target', type: 'wall', worldPosition: { x: 110, y: 0 } }]
  };
  const route = findVentRouteV62(diamond, { startNodeId: 'start', targetNodeId: 'target', actorKind: 'enemy' });
  const reversed = findVentRouteV62({ ...diamond, edges: [...diamond.edges].reverse() }, { startNodeId: 'start', targetNodeId: 'target', actorKind: 'enemy' });
  assert.deepEqual(route.edgeIds, ['a-start-alpha', 'a-alpha-target']);
  assert.deepEqual(reversed, route, 'l’ordre source des segments ne modifie pas la décision IA');

  const enemyOnly = fixtureNetwork();
  enemyOnly.id = 'enemy-only-network';
  enemyOnly.edges[0].allowedKinds = ['enemy'];
  enemyOnly.entrances[0].allowedKinds = ['enemy'];
  enemyOnly.exits[0].allowedKinds = ['enemy'];
  assert.equal(validateVentNetworkV62(enemyOnly).valid, true);
  assert.equal(planAllyVentTraversalV62({ network: enemyOnly, actor: { id: 'ally-1' }, entranceId: 'entrance-a', exitId: 'exit-b' }), null);
  assert.deepEqual(
    planEnemyVentTraversalV62({ network: enemyOnly, actor: { id: 'enemy-1' }, entranceId: 'entrance-a', exitId: 'exit-b' }).edgeIds,
    ['edge-a-b']
  );
});

test('tracker et audio suivent la position interpolée réelle de l’acteur dans le conduit', () => {
  const network = fixtureNetwork();
  let actor = { id: 'xeno-contact', isEnemy: true, position: { x: -20, y: 0, depth: 0 } };
  actor = advanceEntry(network, enterVentNetworkV62(network, actor, 'entrance-a'));
  actor = selectVentBranchV62(network, actor, 'edge-a-b', 'node-b');
  actor = moveVentTransitV62(network, actor, 25);

  const first = createVentContactOutputV62({ network, actor, observerPosition: { x: 0, y: 100, depth: 1 }, trackerRange: 1000, hearingRadius: 1000 });
  assert.deepEqual(first.position, { x: 25, y: 0, depth: 1 });
  assert.equal(first.tracker.edgeId, 'edge-a-b');
  assert.equal(first.tracker.source, 'vent-motion');
  assert.equal(first.audio.cue, 'vent-claw-scrape');
  assert.equal(first.audio.occluded, true);
  assert.ok(first.audio.gain > 0);

  actor = moveVentTransitV62(network, actor, 50);
  const second = createVentContactOutputV62({ network, actor, observerPosition: { x: 0, y: 100, depth: 1 }, trackerRange: 1000, hearingRadius: 1000 });
  assert.deepEqual(second.position, { x: 75, y: 0, depth: 1 });
  assert.notEqual(second.tracker.distance, first.tracker.distance);
  assert.equal(createVentContactOutputV62({ network, actor: { id: 'outside', position: { x: 0, y: 0 } }, observerPosition: { x: 0, y: 0 } }), null);
});

test('le helper de parcours complet peut exécuter chaque segment planifié sans mutation externe', () => {
  const network = fixtureNetwork();
  const source = { id: 'ally-complete', isAlly: true, position: { x: -20, y: 0, depth: 0 } };
  const plan = planAllyVentTraversalV62({ network, actor: source, entranceId: 'entrance-a', exitId: 'exit-b' });
  const entered = advanceEntry(network, enterVentNetworkV62(network, source, 'entrance-a'));
  const arrivedAtNode = traversePlan(network, entered, plan);
  assert.equal(arrivedAtNode.ventTransit.currentNodeId, 'node-b');
  assert.equal(source.ventTransit, undefined);
});

test('le plan IA avance phase par phase dans le même graphe physique sans saut de nœud', () => {
  const network = fixtureNetwork();
  const entrance = network.entrances[0];
  const source = { id: 'enemy-planned', isEnemy: true, position: { ...entrance.worldPosition } };
  const plan = planEnemyVentTraversalV62({ network, actor: source, entranceId: 'entrance-a', exitId: 'exit-b' });
  let actor = enterVentNetworkV62(network, source, 'entrance-a');

  let step = advancePlannedVentTraversalV62({ network, actor, plan, deltaMs: 200, distancePerSecond: 100 });
  actor = step.actor;
  assert.equal(actor.ventTransit.phase, 'entering');
  assert.equal(actor.ventTransit.progress, 0.5);
  step = advancePlannedVentTraversalV62({ network, actor, plan, deltaMs: 200, distancePerSecond: 100 });
  actor = step.actor;
  assert.equal(actor.ventTransit.phase, 'at-node');
  assert.equal(actor.ventTransit.currentNodeId, 'node-a');
  step = advancePlannedVentTraversalV62({ network, actor, plan, deltaMs: 100, distancePerSecond: 100 });
  actor = step.actor;
  assert.equal(actor.ventTransit.phase, 'moving');
  assert.equal(actor.ventTransit.progress, 0, 'le choix d’embranchement ne consomme pas une distance fictive');
  step = advancePlannedVentTraversalV62({ network, actor, plan, deltaMs: 500, distancePerSecond: 100 });
  actor = step.actor;
  assert.equal(actor.ventTransit.progress, 0.5);
  step = advancePlannedVentTraversalV62({ network, actor, plan, deltaMs: 500, distancePerSecond: 100 });
  actor = step.actor;
  assert.equal(actor.ventTransit.currentNodeId, 'node-b');
  step = advancePlannedVentTraversalV62({ network, actor, plan, deltaMs: 1, distancePerSecond: 100 });
  actor = step.actor;
  assert.equal(actor.ventTransit.phase, 'exiting');
  step = advancePlannedVentTraversalV62({ network, actor, plan, deltaMs: 400, distancePerSecond: 100 });
  assert.equal(step.completed, true);
  assert.equal(step.actor.ventTransit, null);
  assert.deepEqual(step.actor.position, network.exits[0].worldPosition);
});
