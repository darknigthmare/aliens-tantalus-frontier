/** Explicit local Forge checkpoints. This module never imports campaign saves.
 * The graph codec preserves operator identities, Maps and shared projectile
 * targets through JSON; it never serializes a second copy of an operator.
 */
import { parseProject, decorative } from './forge-model-v130.js';
import { createForgeSessionV141, forgeBoxesOverlapV141 } from './forge-journey-v141.js';

export const FORGE_CHECKPOINT_LIMITS_V157 = Object.freeze({ bytes: 4 * 1024 * 1024, nodes: 60000,
  entries: 250000, depth: 80, rooms: 32, history: 8, playSeconds: 3600 });
export const FORGE_CHECKPOINT_STORAGE_KEY_V157 = 'atf:forge-playtest-checkpoint:v157';
const scope = 'forge-local-playtest';
const dangerous = new Set(['__proto__', 'prototype', 'constructor']);
const list = value => Array.isArray(value) ? value : [];
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const fail = message => { throw new Error(`Checkpoint Forge : ${message}`); };
const bytes = value => new TextEncoder().encode(value).length;
const finite = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const canonical = value => JSON.stringify(value, (_, item) => record(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const digest = async value => [...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))]
  .map(value => value.toString(16).padStart(2, '0')).join('');
const party = engine => new Map([[engine.player, 'player'], [engine.coop, 'coop'],
  ...list(engine.squadActors).map(actor => [actor, `crew:${actor.crewId || actor.operatorId}`])].filter(([actor]) => actor));
const activeParty = engine => [...party(engine)].filter(([actor, id]) => id !== 'coop' || engine.coopEnabled);
const actorFields = ['x', 'y', 'w', 'h', 'facing', 'health', 'maxHealth', 'armor', 'maxArmor', 'ammo',
  'ammoReserve', 'magazineSize', 'weaponMode', 'kills', 'damageTaken', 'damageBlocked', 'shots', 'fireClock',
  'meleeClock', 'toolUseClock', 'interactionClock', 'actionClock', 'hazardClock', 'fieldLightV124',
  'fieldProtectionV124', 'fieldWeaponBoostShotsV124', 'supportClock', 'workClock', 'alertClock',
  'stuckClock', 'rallyClock', 'supportCharges', 'actions', 'shockClock', 'shockHits', 'invulnerability'];
const globalFields = ['inventory', 'equipmentActions', 'tracker', 'neuro', 'neuroCounterplay',
  'weaponActionSerialV130', 'weaponSerialV131', 'weaponCyclesV131', 'weaponThermalV131',
  'fieldActionSerialV124', 'placeableActionSerialV124', 'squadTelemetry', 'squadDoctrineV132'];
const pick = (source, keys) => Object.fromEntries(keys.filter(key => source[key] !== undefined).map(key => [key, source[key]]));
const actorIdentity = actor => pick(actor, ['w', 'h', 'maxHealth', 'maxArmor', 'playerClass', 'spriteKey', 'crewId', 'operatorId']);
const loadout = engine => ({ kind: engine.forgeSessionV141?.kind, coopEnabled: Boolean(engine.coopEnabled),
  actors: [...party(engine)].map(([actor, id]) => [id, actorIdentity(actor)]),
  weapon: pick(engine.weaponRuntime || {}, ['id', 'magazine', 'damage']),
  equipment: [...(engine.equipmentActions || new Map())].map(([id, item]) => [id, item.maxCharges ?? item.charges ?? null]) });

/** JSON-safe graph, including cycles. Operators use a distinct tag rather than
 * an attacker-controlled object property. Bounded traversal fails closed. */
export function encodeForgeCheckpointGraphV157(root, operators = new Map()) {
  const nodes = [], seen = new Map(); let entries = 0;
  const encode = (value, depth = 0) => {
    if (depth > FORGE_CHECKPOINT_LIMITS_V157.depth || ++entries > FORGE_CHECKPOINT_LIMITS_V157.entries) fail('graphe trop complexe.');
    if (value === undefined) return ['undefined'];
    if (value === null || typeof value === 'boolean' || typeof value === 'string') return ['value', value];
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('nombre non fini.'); return ['value', value]; }
    if (operators.has(value)) return ['operator', operators.get(value)];
    if (record(value) && Object.keys(value).length === 1 && typeof value.forgeOperatorRefV141 === 'string') {
      if (![...operators.values()].includes(value.forgeOperatorRefV141)) fail('référence opérateur inconnue.');
      return ['operator', value.forgeOperatorRefV141];
    }
    if (typeof value !== 'object') fail('valeur exécutable interdite.');
    if (seen.has(value)) return ['ref', seen.get(value)];
    if (nodes.length >= FORGE_CHECKPOINT_LIMITS_V157.nodes) fail('graphe trop volumineux.');
    const index = nodes.length; seen.set(value, index); nodes.push(null);
    if (Array.isArray(value)) nodes[index] = ['array', value.map(item => encode(item, depth + 1))];
    else if (value instanceof Map) nodes[index] = ['map', [...value].map(([key, item]) => [encode(key, depth + 1), encode(item, depth + 1)])];
    else if (value instanceof Set) nodes[index] = ['set', [...value].map(item => encode(item, depth + 1))];
    else {
      if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) fail('objet non pris en charge.');
      nodes[index] = ['object', Object.entries(value).map(([key, item]) => {
        if (dangerous.has(key)) fail('propriété interdite.'); return [key, encode(item, depth + 1)];
      })];
    }
    return ['ref', index];
  };
  const value = encode(root); return { value, nodes };
}

export function decodeForgeCheckpointGraphV157(graph, operators = new Map()) {
  if (!record(graph) || !Array.isArray(graph.nodes) || graph.nodes.length > FORGE_CHECKPOINT_LIMITS_V157.nodes) fail('graphe invalide.');
  const shells = graph.nodes.map(node => {
    if (!Array.isArray(node) || node.length !== 2 || !Array.isArray(node[1])) fail('nœud invalide.');
    if (node[0] === 'array') return [];
    if (node[0] === 'object') return {};
    if (node[0] === 'map') return new Map();
    if (node[0] === 'set') return new Set();
    fail('type de nœud invalide.');
  });
  let entries = 0;
  const decode = token => {
    if (++entries > FORGE_CHECKPOINT_LIMITS_V157.entries || !Array.isArray(token)) fail('référence invalide.');
    if (token[0] === 'undefined' && token.length === 1) return undefined;
    if (token.length !== 2) fail('référence invalide.');
    const [tag, value] = token;
    if (tag === 'value' && (value === null || ['boolean', 'string'].includes(typeof value) || typeof value === 'number' && Number.isFinite(value))) return value;
    if (tag === 'ref' && Number.isInteger(value) && value >= 0 && value < shells.length) return shells[value];
    if (tag === 'operator' && operators.has(value)) return operators.get(value);
    fail('référence inconnue.');
  };
  graph.nodes.forEach(([kind, values], index) => {
    const shell = shells[index], keys = new Set();
    for (const entry of values) {
      if (kind === 'array') shell.push(decode(entry));
      else if (kind === 'set') shell.add(decode(entry));
      else {
        if (!Array.isArray(entry) || entry.length !== 2) fail('entrée invalide.');
        if (kind === 'map') shell.set(decode(entry[0]), decode(entry[1]));
        else {
          if (typeof entry[0] !== 'string' || dangerous.has(entry[0]) || keys.has(entry[0])) fail('propriété invalide ou dupliquée.');
          keys.add(entry[0]); shell[entry[0]] = decode(entry[1]);
        }
      }
    }
  });
  return decode(graph.value);
}

function stable(engine) {
  const session = engine?.forgeSessionV141;
  if (!session || !engine.running || !['mission', 'ship'].includes(session.kind)) fail('aucun playtest actif.');
  if (engine.forgeNarrativeOpenV156 || engine.forgeShipStartingV141 || engine.mission?.state && engine.mission.state !== 'active') fail('fermez le récit et reprenez un test actif.');
  for (const [actor] of activeParty(engine)) {
    if (!actor.alive || actor.downed || actor.health <= 0 || !actor.grounded || Math.abs(actor.vy || 0) > .1
      || actor.climbing || actor.inVehicle || actor.ventTransit || actor.vehicleAccessPhase || actor.reloading
      || actor.fieldActionV124 || actor.grappledClock > 0 || actor.stunClock > 0
      || engine.isPlaceableBusyV86?.(actor) || engine.isFieldActionBusyV124?.(actor) || engine.isVehicleAccessLockedV59?.(actor)) {
      fail('regroupez les opérateurs vivants au sol et terminez leurs actions.');
    }
  }
  if (engine.placeablePreviewsV86?.size || engine.placeableTasksV86?.size || engine.placeableExtensionTasksV132?.size) fail('terminez la préparation de l’équipement.');
  if (engine.squadDoctrineV132?.tasks?.length || engine.squadDoctrineV132?.carries?.length) fail('terminez les tâches et portages de l’escouade.');
  return session;
}

function validateSession(session, project) {
  const rooms = new Set(project.rooms.map(room => room.id));
  const expected = createForgeSessionV141(project);
  if (!record(session) || session.schema !== 141 || session.kind !== project.kind || !rooms.has(session.currentRoomId)
    || !expected.reachableRoomIds.includes(session.currentRoomId) || session.entryRoomId !== expected.entryRoomId
    || !Number.isInteger(session.transitions) || session.transitions < 0 || session.transitions > 100000
    || !record(session.roomStates) || Object.keys(session.roomStates).some(id => !rooms.has(id))
    || !Object.hasOwn(session.roomStates, session.currentRoomId)
    || Object.keys(session).some(key => !['schema', 'kind', 'entryRoomId', 'currentRoomId', 'reachableRoomIds', 'roomStates',
      'completedObjectives', 'transitions', 'lastTransition', 'complete', 'narrativeV156', 'narrativeInventoryV157', 'narrativePlaySecondsV157'].includes(key))) fail('parcours enregistré invalide.');
  const objectiveIds = new Set(project.rooms.filter(room => expected.reachableRoomIds.includes(room.id))
    .flatMap(room => room.cells.filter(cell => cell.type === 'objective' && !decorative(cell)).map(cell => cell.id)));
  if (!Array.isArray(session.completedObjectives) || new Set(session.completedObjectives).size !== session.completedObjectives.length
    || session.completedObjectives.some(id => !objectiveIds.has(id))) fail('objectifs enregistrés invalides.');
  const stories = new Map(project.rooms.flatMap(room => room.cells.filter(cell => cell.narrative).map(cell => [cell.id, cell.narrative])));
  if (session.narrativeV156 !== undefined && !Array.isArray(session.narrativeV156)
    || session.complete !== undefined && typeof session.complete !== 'boolean'
    || !Array.isArray(session.reachableRoomIds) || canonical(session.reachableRoomIds) !== canonical(expected.reachableRoomIds)
    || Object.values(session.roomStates).some(state => !record(state))) fail('champs de parcours invalides.');
  const states = list(session.narrativeV156);
  if (states.length > stories.size || new Set(states.map(state => state?.cellId)).size !== states.length) fail('récits enregistrés invalides.');
  for (const state of states) {
    const story = stories.get(state?.cellId);
    if (!story || !Array.isArray(state.history) || state.history.length > 8) fail('récit enregistré invalide.');
    let cursor = story.start;
    for (const entry of state.history) {
      const node = story.nodes.find(node => node.id === cursor), choice = node?.choices.find(choice => choice.id === entry.choiceId);
      if (!choice || entry.nodeId !== cursor) fail('historique de récit invalide.');
      cursor = choice.next;
    }
    if (state.nodeId !== cursor) fail('page de récit invalide.');
  }
  const itemIds = new Set([...stories.values()].flatMap(story => list(story.items).map(item => item.id)));
  const inventory = session.narrativeInventoryV157 ?? [];
  if (!Array.isArray(inventory) || inventory.length > 32 || new Set(inventory).size !== inventory.length || inventory.some(id => !itemIds.has(id))
    || !finite(session.narrativePlaySecondsV157 ?? 0, 0, 3600)) fail('inventaire ou horloge narrative invalide.');
  return { ...expected, ...session, project, reachableRoomIds: expected.reachableRoomIds };
}

function validateRoomState(runtime, kind, fields = null) {
  const arrays = kind === 'ship' ? ['doors', 'terminals', 'objectives', 'enemies', 'projectiles']
    : ['platforms', 'walls', 'lifts', 'ladders', 'covers', 'doors', 'vents', 'supplies', 'hazards', 'drops', 'bullets',
      'hostileProjectiles', 'particles', 'enemies', 'objectiveNodes', 'supportDeployments', 'weaponProjectilesV130',
      'weaponProjectilesV131', 'weaponBeamsV131', 'recoverableWeaponsV131', 'roomPlaceablesV141'];
  const allowed = kind === 'ship' ? [...arrays, 'hazardClock'] : [...fields, 'missionObjectives', 'missionPhase', 'roomPlaceablesV141'];
  if (!record(runtime) || Object.keys(runtime).some(key => !allowed.includes(key))
    || arrays.some(key => !Array.isArray(runtime[key]) || runtime[key].length > 10000)) fail('structure de salle invalide.');
  const boxes = kind === 'ship' ? ['doors', 'terminals', 'objectives', 'enemies'] : ['platforms', 'walls', 'covers', 'doors', 'hazards', 'enemies'];
  for (const key of boxes) for (const item of runtime[key]) {
    if (!record(item) || !finite(item.x, -1000, 8000) || !finite(item.y, -1000, 2000)
      || !finite(item.w, .01, 10000) || !finite(item.h, .01, 2000)) fail(`géométrie ${key} invalide.`);
  }
  for (const enemy of runtime.enemies) if (typeof enemy.alive !== 'boolean' || !finite(enemy.health, 0, 10000000)) fail('état ennemi invalide.');
  for (const door of runtime.doors) if (typeof door.open !== 'boolean' || !finite(door.progress, 0, 1)) fail('état de sas invalide.');
  if (kind === 'mission') {
    if (!record(runtime.missionObjectives) || Object.values(runtime.missionObjectives).some(value => typeof value !== 'boolean')
      || typeof runtime.missionPhase !== 'string' || runtime.missionPhase.length > 120
      || !(runtime.weaponStatusesV131 instanceof Map) || !(runtime.placeableAttackTasksV86 instanceof Map)
      || runtime.placeableAttackTasksV86.size) fail('état de mission local invalide.');
  } else if (!finite(runtime.hazardClock, 0, 10000)) fail('horloge de danger invalide.');
}

function validateActors(states, engine) {
  const operators = new Map([...party(engine)].map(([actor, id]) => [id, actor]));
  if (!Array.isArray(states) || states.length !== operators.size || new Set(states.map(entry => entry?.id)).size !== states.length) fail('équipe enregistrée invalide.');
  for (const { id, state } of states) {
    const actor = operators.get(id);
    if (!actor || !record(state) || Object.keys(state).some(key => !actorFields.includes(key))) fail('opérateur enregistré invalide.');
    for (const key of ['w', 'h', 'maxHealth', 'maxArmor']) if (state[key] !== actor[key]) fail('gabarit d’opérateur modifié.');
    for (const [key, value] of Object.entries(state)) {
      if (key === 'weaponMode') continue;
      if (key === 'fieldLightV124') { if (typeof value !== 'boolean') fail('éclairage d’opérateur invalide.'); }
      else if (!finite(value, key === 'facing' ? -1 : 0, 1000000000000)) fail('compteur d’opérateur invalide.');
    }
    const ship = engine.forgeSessionV141.kind === 'ship', armedOperator = !ship && !id.startsWith('crew:');
    for (const [key, maximum] of [['health', actor.maxHealth || 100], ['x', (ship ? 5120 : 6200) - actor.w],
      ['y', (ship ? 720 : 1080) - actor.h], ...(!ship ? [['armor', actor.maxArmor || 100]] : []),
      ...(armedOperator ? [['ammo', state.magazineSize], ['ammoReserve', 99999]] : [])]) {
      if (!finite(state[key], 0, maximum)) fail(`ressource ${key} invalide.`);
    }
    const nativeMagazine = state.weaponMode === 'rifle' ? engine.weaponRuntime?.magazine : 12;
    if ((armedOperator && (state.magazineSize !== nativeMagazine || !['sidearm', 'rifle', 'neuro-melee'].includes(state.weaponMode)))
      || ![1, -1].includes(state.facing)) fail('arme enregistrée invalide.');
  }
  return operators;
}

function assertSupported(actor, runtime, kind) {
  const surfaces = kind === 'ship' ? [...runtime.compiled.floors, ...runtime.compiled.platforms] : list(runtime.platforms);
  const solids = kind === 'ship' ? [...runtime.compiled.walls, ...runtime.compiled.vents, ...list(runtime.doors).filter(door => door.progress < .82)]
    : [...list(runtime.walls), ...list(runtime.covers), ...list(runtime.doors).filter(door => !door.open || door.progress < .82)];
  const hazards = kind === 'ship' ? runtime.compiled.hazards : list(runtime.hazards);
  const bottom = actor.y + actor.h;
  const spans = surfaces.filter(surface => !surface.destroyed && surface.kind !== 'lift' && !surface.dynamic && !surface.controlledV130
    && Math.abs(surface.y - bottom) < 1).map(surface => [surface.x, surface.x + surface.w]).sort((a, b) => a[0] - b[0]);
  let right = actor.x;
  for (const [left, edge] of spans) if (left <= right + .1 && edge > right) right = edge;
  if (right < actor.x + actor.w - .1 || solids.some(solid => !solid.destroyed && forgeBoxesOverlapV141(actor, solid))
    || hazards.some(hazard => hazard.active !== false && !hazard.destroyed && forgeBoxesOverlapV141(actor, hazard))) fail('position sans appui sûr ou obstruée.');
}

function validateAuthoredGeometry(runtime, baseline, kind) {
  const fixed = ['id', 'cellId', 'forgeCellIdV141', 'x', 'y', 'w', 'h', 'type', 'kind', 'floor', 'solid', 'plane'];
  const matched = (actual, expected, keys = fixed) => {
    if (!Array.isArray(actual) || actual.length !== expected.length) fail('géométrie du plan modifiée.');
    for (let index = 0; index < expected.length; index++) if (canonical(pick(actual[index], keys)) !== canonical(pick(expected[index], keys))) fail('géométrie du plan modifiée.');
  };
  if (kind === 'ship') {
    for (const key of ['doors', 'terminals', 'objectives']) matched(runtime[key], baseline[key]);
    return;
  }
  matched(runtime.platforms.filter(item => item.kind !== 'lift'), baseline.platforms.filter(item => item.kind !== 'lift'), [...fixed, 'destroyed']);
  matched(runtime.walls.filter(item => !item.placeableBarrierV132), baseline.walls, [...fixed, 'destroyed', 'sceneryV130']);
  for (const wall of runtime.walls.filter(item => item.placeableBarrierV132)) {
    const instance = runtime.roomPlaceablesV141.find(item => item.instanceId === wall.placeableInstanceIdV132
      && item.modeV132 === 'barrier' && item.onGround && item.health > 0);
    if (!instance || ['x', 'y', 'w', 'h'].some(key => wall[key] !== instance[key])) fail('barrière déployée sans propriétaire valide.');
  }
  for (const key of ['doors', 'covers', 'vents']) matched(runtime[key], baseline[key]);
  matched(runtime.hazards, baseline.hazards, [...fixed, 'damage', 'active', 'destroyed']);
  matched(runtime.ladders, baseline.ladders, ['id', 'x', 'top', 'bottom', 'w']);
  matched(runtime.lifts, baseline.lifts, ['id', 'kind', 'x', 'baseY', 'topY', 'w', 'h']);
  for (const lift of runtime.lifts) if (!finite(lift.y, lift.topY, lift.baseY)) fail('position d’ascenseur invalide.');
  for (const key of ['powerNode', 'archiveTerminal', 'objective']) {
    if (Boolean(runtime[key]) !== Boolean(baseline[key]) || runtime[key]
      && canonical(pick(runtime[key], fixed)) !== canonical(pick(baseline[key], fixed))) fail('interaction déplacée dans le plan.');
  }
}

function validateActorReferences(data, operators) {
  const liveOperators = new Set(operators.values());
  const actors = new Set([...liveOperators, ...Object.values(data.session.roomStates).flatMap(room => list(room.enemies))]);
  const seen = new Set();
  const visit = value => {
    if (!value || typeof value !== 'object' || seen.has(value) || liveOperators.has(value)) return;
    seen.add(value);
    if (Object.hasOwn(value, 'owner') && value.owner && typeof value.owner === 'object' && !actors.has(value.owner)) fail('propriétaire copié ou inconnu.');
    if (Object.hasOwn(value, 'alive') && Object.hasOwn(value, 'health') && !actors.has(value)) fail('copie d’acteur interdite.');
    if (value instanceof Map) for (const [key, item] of value) {
      if (key && typeof key === 'object' && !actors.has(key)) fail('clé d’acteur copiée ou inconnue.');
      visit(key); visit(item);
    }
    else if (value instanceof Set) for (const item of value) visit(item);
    else for (const item of Object.values(value)) visit(item);
  };
  visit(data);
}

/** LCG checkpoint without changing the native sequence: peek one value and
 * replay that buffered value on the next call. V51's generator is an unsigned
 * 32-bit LCG; subsequent calls are exactly its existing recurrence. */
function captureRandom(engine) {
  if (typeof engine.random !== 'function') return null;
  if (engine.random.forgeCheckpointNextV157) return engine.random.forgeCheckpointNextV157();
  const next = Math.round(engine.random() * 4294967296) >>> 0;
  engine.random = restoreRandom(next); return next;
}
function restoreRandom(next) {
  let pending = next >>> 0;
  const random = () => { const value = pending; pending = (Math.imul(pending, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
  random.forgeCheckpointNextV157 = () => pending; return random;
}

export async function captureForgePlaytestCheckpointV157(engine, { now = Date.now() } = {}) {
  const owner = stable(engine), project = parseProject(owner.project), operators = party(engine);
  const room = owner.kind === 'mission' ? engine.captureForgeMissionRoomV141() : {
    doors: engine.v51Doors, terminals: engine.v51Terminals, objectives: engine.v51Objectives,
    enemies: engine.enemies, projectiles: engine.projectiles, hazardClock: engine.hazardClock || 0 };
  const supportedRoom = owner.kind === 'ship' ? { ...room, compiled: engine.compiledProject } : room;
  for (const [actor] of activeParty(engine)) assertSupported(actor, supportedRoom, owner.kind);
  const session = { ...owner, project: undefined, roomStates: { ...owner.roomStates, [owner.currentRoomId]: room } };
  delete session.project;
  validateSession(session, project);
  const actors = [...operators].map(([actor, id]) => ({ id, state: pick(actor, actorFields) }));
  validateActors(actors, engine);
  const globals = owner.kind === 'mission' ? { ...pick(engine, globalFields), mission: engine.mission,
    placeablesV86: engine.placeablesV86 ? { ...engine.placeablesV86,
      instances: list(engine.placeablesV86.instances).filter(instance => !instance.onGround) } : null } : {};
  const graph = encodeForgeCheckpointGraphV157({ session, actors, globals }, operators);
  const nextRandom = owner.kind === 'mission' ? captureRandom(engine) : null;
  const payload = { kind: owner.kind, projectHash: await digest(canonical(project)),
    loadoutHash: await digest(canonical(loadout(engine))), savedAt: now, nextRandom, operatorIds: [...operators.values()], graph };
  const envelope = { schema: 157, scope, payload, integrity: await digest(canonical(payload)) };
  const output = JSON.stringify(envelope);
  if (bytes(output) > FORGE_CHECKPOINT_LIMITS_V157.bytes) fail('budget de 4 Mio dépassé.');
  if (engine.forgeSessionV141 !== owner || !engine.running) fail('le playtest a changé pendant l’enregistrement.');
  return output;
}

export async function inspectForgePlaytestCheckpointV157(raw, project) {
  if (typeof raw !== 'string' || bytes(raw) > FORGE_CHECKPOINT_LIMITS_V157.bytes) fail('fichier absent ou trop volumineux.');
  let envelope;
  try { envelope = JSON.parse(raw); } catch { fail('JSON illisible.'); }
  const normalized = parseProject(project), payload = envelope?.payload;
  if (envelope?.schema !== 157 || envelope?.scope !== scope || !record(payload) || !['ship', 'mission'].includes(payload.kind)
    || payload.kind !== normalized.kind || !finite(payload.savedAt, 0, 9007199254740991)
    || Object.keys(envelope).some(key => !['schema', 'scope', 'payload', 'integrity'].includes(key))
    || Object.keys(payload).some(key => !['kind', 'projectHash', 'loadoutHash', 'savedAt', 'nextRandom', 'operatorIds', 'graph'].includes(key))
    || !/^[a-f0-9]{64}$/.test(payload.loadoutHash || '')
    || !/^[a-f0-9]{64}$/.test(envelope.integrity || '') || envelope.integrity !== await digest(canonical(payload))) fail('version ou intégrité invalide.');
  if (payload.projectHash !== await digest(canonical(normalized))) fail('le projet a changé ; reprenez le document exact du checkpoint.');
  if (!Array.isArray(payload.operatorIds) || payload.operatorIds.length < 1 || payload.operatorIds.length > 18
    || new Set(payload.operatorIds).size !== payload.operatorIds.length || !payload.operatorIds.includes('player')
    || payload.operatorIds.some(id => !['player', 'coop'].includes(id) && !/^crew:[a-zA-Z0-9_-]{1,120}$/.test(id))) fail('identités d’opérateurs invalides.');
  const placeholders = new Map(payload.operatorIds.map(id => [id, Object.freeze({ checkpointOperator: id })]));
  const data = decodeForgeCheckpointGraphV157(payload.graph, placeholders);
  if (!record(data) || Object.keys(data).some(key => !['session', 'actors', 'globals'].includes(key))) fail('contenu de checkpoint invalide.');
  validateSession(data?.session, normalized);
  if (!Array.isArray(data.actors) || data.actors.length !== payload.operatorIds.length
    || new Set(data.actors.map(entry => entry?.id)).size !== data.actors.length
    || data.actors.some(entry => !placeholders.has(entry?.id) || !record(entry.state)
      || Object.keys(entry.state).some(key => !actorFields.includes(key)))) fail('équipe invalide.');
  return { envelope, project: normalized, data };
}

/** Admission is read-only. Geometry compilation runs on a preparation object;
 * a rejected checkpoint never replaces the active session or its resources. */
export async function prepareForgePlaytestCheckpointV157(engine, raw, project = engine?.forgeSessionV141?.project) {
  const owner = engine?.forgeSessionV141;
  if (!owner || !engine.running) fail('démarrez le parcours Forge correspondant.');
  if (engine.forgeNarrativeOpenV156) fail('fermez le récit avant de reprendre le checkpoint.');
  const { envelope, project: normalized } = await inspectForgePlaytestCheckpointV157(raw, project);
  if (envelope.payload.projectHash !== await digest(canonical(parseProject(owner.project)))
    || envelope.payload.loadoutHash !== await digest(canonical(loadout(engine)))) fail('équipe ou équipement de départ différent.');
  const operators = new Map([...party(engine)].map(([actor, id]) => [id, actor]));
  const data = decodeForgeCheckpointGraphV157(envelope.payload.graph, operators);
  const session = validateSession(data?.session, normalized);
  validateActorReferences(data, operators);
  validateActors(data.actors, engine);
  if (!record(data.globals)) fail('ressources de test invalides.');
  const temporary = Object.create(engine);
  temporary.random = () => .5;
  temporary.forgeSessionV141 = session;
  const runtime = session.kind === 'mission' ? session.roomStates[session.currentRoomId] : temporary.buildForgeShipRoomV141(session.currentRoomId);
  if (!record(runtime) || session.kind === 'mission' && (!record(data.globals.mission) || data.globals.mission.state !== 'active'
    || !finite(data.globals.mission.elapsed, 0, 604800) || !(data.globals.equipmentActions instanceof Map))) fail('état de mission invalide.');
  for (const entry of data.actors) {
    const actor = operators.get(entry.id);
    if (entry.id === 'coop' && !engine.coopEnabled) continue;
    if (entry.state.health <= 0) fail('opérateur hors combat.');
    assertSupported({ ...actor, ...entry.state }, runtime, session.kind);
  }
  if (session.kind === 'mission') {
    const fields = engine.getForgeCheckpointRoomFieldsV157?.();
    if (!Array.isArray(fields) || fields.some(key => !Object.hasOwn(runtime, key))
      || typeof engine.applyForgeCheckpointRoomV157 !== 'function') fail('contrat de salle non disponible.');
    temporary.forgeSessionV141 = { ...session, roomStates: {} };
    for (const [roomId, roomState] of Object.entries(session.roomStates)) {
      validateRoomState(roomState, 'mission', fields);
      validateAuthoredGeometry(roomState, temporary.prepareForgeMissionRoomV141(roomId), 'mission');
    }
    if (!Number.isInteger(envelope.payload.nextRandom) || envelope.payload.nextRandom < 0 || envelope.payload.nextRandom > 4294967295) fail('séquence aléatoire invalide.');
    if (Object.keys(data.globals).some(key => ![...globalFields, 'mission', 'placeablesV86'].includes(key))) fail('ressource inconnue.');
    if (globalFields.some(key => engine[key] !== undefined && !Object.hasOwn(data.globals, key))) fail('ressource enregistrée manquante.');
    for (const [id, equipment] of data.globals.equipmentActions) {
      const original = engine.equipmentActions.get(id), maximum = original?.maxCharges ?? original?.charges ?? 0;
      if (!original || !record(equipment) || !Number.isInteger(equipment.remaining) || !finite(equipment.remaining, 0, maximum)
        || !Number.isInteger(equipment.uses) || !finite(equipment.uses, 0, 999999)) fail('charges d’équipement invalides.');
      const immutable = Object.keys(original).filter(key => !['remaining', 'uses', 'lastResult'].includes(key));
      if (canonical(pick(equipment, immutable)) !== canonical(pick(original, immutable))) fail('définition d’équipement modifiée.');
    }
    if (data.globals.equipmentActions.size !== engine.equipmentActions.size) fail('équipement enregistré incomplet.');
    const inventory = data.globals.inventory;
    if (!record(inventory) || [['medkits', 99], ['salvage', 99999999], ['intel', 99999999], ['securityKeys', 99]]
      .some(([key, maximum]) => !Number.isInteger(inventory[key]) || !finite(inventory[key], 0, maximum))
      || typeof inventory.cutter !== 'boolean') fail('ressources d’inventaire invalides.');
    if (!record(data.globals.mission.objectives) || Object.values(data.globals.mission.objectives).some(value => typeof value !== 'boolean')
      || data.globals.mission.rewards !== null) fail('objectifs ou récompenses de mission invalides.');
    const doctrine = data.globals.squadDoctrineV132;
    if (engine.squadDoctrineV132 == null ? doctrine != null : !record(doctrine) || !Array.isArray(doctrine.tasks)
      || !Array.isArray(doctrine.carries) || doctrine.tasks.length || doctrine.carries.length) fail('doctrine ou tâche d’équipe non reprenable.');
    const tracker = data.globals.tracker;
    if (!record(tracker) || !finite(tracker.energy, 0, 100) || !finite(tracker.cooldown, 0, 120)
      || !Number.isInteger(tracker.pulses) || !finite(tracker.pulses, 0, 999999) || !Array.isArray(tracker.contacts)) fail('ressource de détecteur invalide.');
  } else {
    temporary.forgeSessionV141 = { ...session, roomStates: {} };
    for (const [roomId, roomState] of Object.entries(session.roomStates)) {
      validateRoomState(roomState, 'ship');
      validateAuthoredGeometry(roomState, temporary.buildForgeShipRoomV141(roomId), 'ship');
    }
  }
  if (engine.forgeSessionV141 !== owner || !engine.running) fail('le playtest a changé pendant la lecture.');
  return { engine, owner, session, actors: data.actors, globals: data.globals, runtime,
    nextRandom: envelope.payload.nextRandom, consumed: false };
}

function applyPrepared(engine, prepared) {
  if (prepared?.engine !== engine || prepared.consumed || engine.forgeSessionV141 !== prepared.owner || !engine.running) fail('reprise périmée.');
  const { session, globals, runtime } = prepared;
  // No storage, rewards, persist callback, narrative answer or campaign event is
  // dispatched here. Everything below was compiled/admitted before mutation.
  engine.closeForgeNarrativeV156?.({ focus: false });
  engine.forgeSessionV141 = session;
  if (session.kind === 'mission') {
    engine.forgeProjectV141 = session.project;
    engine.forgeActiveRoomIdV141 = session.currentRoomId;
    for (const key of globalFields) if (Object.hasOwn(globals, key)) engine[key] = globals[key];
    engine.mission = globals.mission;
    engine.placeablesV86 = globals.placeablesV86;
    engine.applyForgeCheckpointRoomV157(runtime);
    engine.random = restoreRandom(prepared.nextRandom);
  } else {
    engine.applyForgeShipRoomV141(runtime);
    engine.state.roomId = session.currentRoomId;
    engine.state.visited = [...new Set([...Object.keys(session.roomStates), session.currentRoomId])];
  }
  const operators = new Map([...party(engine)].map(([actor, id]) => [id, actor]));
  for (const { id, state } of prepared.actors) Object.assign(operators.get(id), state, {
    alive: state.health > 0, downed: false, bleedOut: 0, vx: 0, vy: 0, grounded: true, climbing: false,
    crouching: false, reloading: false, reloadClock: 0, inVehicle: false, inCover: false,
    ladderId: null, jumpBuffer: 0, coyoteTime: .1, fieldActionV124: null,
    pointerAimV83: null, gamepadAimV83: null, combatAimV83: null, aimingV124: false, aimLockedV124: false });
  if (session.kind === 'ship') {
    engine.state.positionX = Math.round(engine.player.x);
    engine.spawnPoint = { x: engine.player.x, y: engine.player.y };
  }
  engine.clearGameplayInput?.(); engine.keys?.clear();
  engine.jumpQueued = 0;
  if (engine.camera) {
    const maximum = session.kind === 'mission' ? 4920 : 3840;
    engine.camera.x = Math.max(0, Math.min(maximum, engine.player.x - (session.kind === 'mission' ? 320 : 640)));
    engine.camera.y = session.kind === 'mission' ? Math.max(0, Math.min(360, engine.player.y - 360)) : 0;
  }
  engine.forgeTransitionRefusalV141 = null;
  engine.statusKey = ''; engine.emitStatus?.(); engine.draw?.();
  prepared.consumed = true;
  return { applied: true, kind: session.kind, roomId: session.currentRoomId, scope: 'local-device',
    objectives: session.completedObjectives.length, narrativeItems: list(session.narrativeInventoryV157).length };
}

/** Keep the running playtest intact if a production adapter rejects while
 * installing an otherwise admitted graph. No caller-supplied callbacks run
 * before the data and geometry have passed preparation. */
export function applyForgePlaytestCheckpointV157(engine, prepared) {
  if (prepared?.engine !== engine || prepared.consumed || engine.forgeSessionV141 !== prepared.owner || !engine.running) fail('reprise périmée.');
  const descriptors = Object.getOwnPropertyDescriptors(engine);
  const records = [...party(engine).keys(), engine.state, engine.camera, engine.gamepadInputV77].filter(Boolean).map(value => [value, { ...value }]);
  const collections = [...new Set([...Object.values(engine), ...Object.values(engine.gamepadInputV77 || {})])]
    .filter(value => value instanceof Map || value instanceof Set)
    .map(value => [value, [...value]]);
  try { return applyPrepared(engine, prepared); }
  catch (error) {
    for (const key of Object.keys(engine)) if (!Object.hasOwn(descriptors, key)) delete engine[key];
    Object.defineProperties(engine, descriptors);
    for (const [target, original] of records) {
      for (const key of Object.keys(target)) if (!Object.hasOwn(original, key)) delete target[key];
      Object.assign(target, original);
    }
    for (const [target, original] of collections) {
      target.clear(); if (target instanceof Map) for (const [key, value] of original) target.set(key, value);
      else for (const value of original) target.add(value);
    }
    throw error;
  }
}

export class ForgePlaytestCheckpointStoreV157 {
  constructor(storage = globalThis.localStorage, { key = FORGE_CHECKPOINT_STORAGE_KEY_V157 } = {}) { this.storage = storage; this.key = key; }
  raw() { try { return this.storage?.getItem(this.key) ?? null; } catch { fail('stockage local inaccessible.'); } }
  async save(engine) {
    const raw = await captureForgePlaytestCheckpointV157(engine);
    try { this.storage.setItem(this.key, raw); if (this.storage.getItem(this.key) !== raw) fail('écriture non confirmée.'); }
    catch (error) { fail(`enregistrement local impossible (${error.message}).`); }
    return { saved: true, bytes: bytes(raw) };
  }
  async read(project) { const raw = this.raw(); await inspectForgePlaytestCheckpointV157(raw, project); return raw; }
  async resume(engine, project) { return applyForgePlaytestCheckpointV157(engine, await prepareForgePlaytestCheckpointV157(engine, await this.read(project), project)); }
  clear() {
    try { this.storage?.removeItem(this.key); if (this.raw() !== null) fail('effacement non confirmé.'); }
    catch { fail('effacement local impossible.'); }
    return { cleared: true };
  }
}
