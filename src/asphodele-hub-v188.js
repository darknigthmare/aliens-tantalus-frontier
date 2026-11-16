// V188 — the Asphodèle second hub, first reachable version (bible §7.3, §42;
// owner Q22 (A): built directly in the hub engine; Q23 (A): the ring and the
// spoke are depth corridors (V2), the modules are profile rooms (V1), every
// module is walked to and entered through a door). Spec: specs/007-hub-asphodele/.
// Pure data and rules, no DOM. The runtime is `hub-asphodele-v188.js`.
//
// Travel (justified in spec 007 research): the station orbits Cocyte, the
// Tantalus's own system, so it is reached by the existing dropship flow from the
// Tantalus hangar (the UD-4L boarding dialog), not by a 14-day hyperspace jump
// (`galaxy-travel-v188.js`, §13.2). The UD-4L docks at the station's docking
// collar; the same collar takes it back to the hangar.
//
// Scale: 1 m ≈ 51 px (the marine is 44 × 92 px). Floor at y = 624 in every room.
// Save: the additive field `asphodeleHubV188` (location, room, pose, contract
// counters, relay room online, Kessler's tag, Grue's pact). Mission completion
// is still read from `galaxy.completedCampaignIds`.
import { asphodeleRetakenV188, kesslerTagRecoveredV188, normalizeStationV188 } from './station-asphodele-v188.js';
import { normalizeContractCountsV188, contractCountV188, RELAY_DRIFT_KEY_V188, RELAY_DRIFT_REQUIRED_V188, ASPHODELE_WORLD_ID_V188, ASPHODELE_CONTRACT_EFFECTS_V188 } from './asphodele-missions-v188.js';
import { normalizeColonyV188, colonyTierV188 } from './colony-reconstruction-v188.js';
import { normalizeAsphodeleMarketV188, normalizeCheyenneLevelV188 } from './asphodele-economy-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const has = (list, id) => Array.isArray(list) && list.includes(id);
const completed = save => Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : [];
const pick = (pair, language) => pair?.[language === 'en' ? 'en' : 'fr'] || '';

export const ASPHODELE_METRE_PX_V188 = 51;
export const ASPHODELE_FLOOR_Y_V188 = 624;
export const ASPHODELE_DOOR_V188 = Object.freeze({ w: 96, h: 132 }); // 1.9 × 2.6 m bulkhead door
export const ASPHODELE_DOOR_REACH_V188 = 60; // px from the door centre to the marine's centre
export const ASPHODELE_STATION_REACH_V188 = 64;

// —— Rooms ——
// kind 'depth' (V2: W/S walk the floor towards the camera, z ∈ [−80, 0], as in
// spec 001) or 'profile' (V1). Doors, consoles and wall posts stand on the rail (z = 0).
// `to` names the target room and the door the marine arrives at.
const door = (id, x, label, to = null, extra = {}) => Object.freeze({ id, x, label, to, ...extra });
const post = (id, x, action, label, extra = {}) => Object.freeze({ id, x, action, label, ...extra });
const prop = (id, kind, x, w, h, z, z0, z1) => Object.freeze({ id, kind, x, w, h, z, footprint: Object.freeze({ id, x0: x, x1: x + w, z0, z1 }) });

export const ASPHODELE_ROOMS_V188 = Object.freeze({
  'asph-docks': Object.freeze({ id: 'asph-docks', kind: 'depth', width: 2048, module: 'docks', view: 'V2',
    name: t('Quais d’arrimage', 'Docking quays'), unlock: 'S1',
    doors: Object.freeze([
      door('docks-tantalus', 150, t('SAS 1 · UD-4L DU TANTALUS', 'AIRLOCK 1 · TANTALUS UD-4L'), null, { shuttle: true }),
      door('docks-echo8', 560, t('SAS 2 · UD-4L D’ECHO-8', 'AIRLOCK 2 · ECHO-8 UD-4L'), null, { lock: 'echo8-dropship' }),
      door('docks-grue', 980, t('SAS 3 · NAVETTE CRUCIBLE', 'AIRLOCK 3 · CRUCIBLE SHUTTLE'), null, { lock: 'grue-shuttle' }),
      door('docks-repair', 1480, t('HANGAR DE RÉPARATION', 'REPAIR HANGAR'), Object.freeze({ room: 'asph-repair', door: 'repair-docks' }), { lock: 'repair-hangar' }),
      door('docks-ring', 1900, t('ANNEAU EXTÉRIEUR', 'OUTER RING'), Object.freeze({ room: 'asph-ring', door: 'ring-docks' }))
    ]),
    posts: Object.freeze([post('docks-grue-npc', 1200, 'asphodele:grue', t('PARLER À GRUE', 'TALK TO GRUE'), { z: -34, npc: 'grue' })]),
    // ≈ 1.2 m cargo crates and a 1.5 m cart, clear of every door (rail band z > −20 stays free).
    props: Object.freeze([
      prop('docks-crates-a', 'crate', 330, 61, 58, -62, -72, -50),
      prop('docks-cart', 'cart', 760, 76, 40, -48, -56, -40),
      prop('docks-crates-b', 'crate', 1650, 61, 58, -58, -68, -46)
    ]) }),
  'asph-ring': Object.freeze({ id: 'asph-ring', kind: 'depth', width: 2560, module: 'plan', view: 'V2',
    name: t('Anneau extérieur', 'Outer ring'), unlock: 'S4',
    doors: Object.freeze([
      door('ring-docks', 130, t('QUAIS D’ARRIMAGE', 'DOCKING QUAYS'), Object.freeze({ room: 'asph-docks', door: 'docks-ring' })),
      door('ring-market', 560, t('MARCHÉ DE L’ANNEAU', 'RING MARKET'), Object.freeze({ room: 'asph-market', door: 'market-ring' }), { lock: 'market' }),
      door('ring-greenhouse', 1000, t('SERRE', 'GREENHOUSE'), Object.freeze({ room: 'asph-greenhouse', door: 'greenhouse-ring' }), { lock: 'greenhouse' }),
      door('ring-memorial', 1440, t('MÉMORIAL', 'MEMORIAL'), Object.freeze({ room: 'asph-memorial', door: 'memorial-ring' }), { lock: 'memorial' }),
      door('ring-quarters', 1880, t('QUARTIERS', 'QUARTERS'), Object.freeze({ room: 'asph-quarters', door: 'quarters-ring' }), { lock: 'quarters' }),
      door('ring-spoke', 2380, t('RAYON A · MOYEU', 'SPOKE A · HUB'), Object.freeze({ room: 'asph-spoke', door: 'spoke-ring' }))
    ]),
    posts: Object.freeze([post('ring-plan', 1660, 'asphodele:plan', t('PLAN DE LA STATION', 'STATION PLAN'))]),
    props: Object.freeze([
      prop('ring-planter', 'crate', 780, 61, 44, -60, -70, -50),
      prop('ring-drums', 'drum', 2120, 96, 52, -50, -60, -40)
    ]) }),
  'asph-spoke': Object.freeze({ id: 'asph-spoke', kind: 'depth', width: 1536, module: 'plan', view: 'V2',
    name: t('Rayon A', 'Spoke A'), unlock: 'S4',
    doors: Object.freeze([
      door('spoke-ring', 130, t('ANNEAU EXTÉRIEUR', 'OUTER RING'), Object.freeze({ room: 'asph-ring', door: 'ring-spoke' })),
      door('spoke-hub', 1380, t('MOYEU · PONT DE CONTRÔLE', 'HUB · CONTROL DECK'), Object.freeze({ room: 'asph-control', door: 'control-spoke' }))
    ]),
    posts: Object.freeze([]),
    props: Object.freeze([prop('spoke-cart', 'cart', 700, 76, 40, -52, -60, -44)]) }),
  'asph-control': Object.freeze({ id: 'asph-control', kind: 'profile', width: 2048, module: 'control', view: 'V1',
    name: t('Pont de contrôle', 'Control deck'), unlock: 'S4',
    doors: Object.freeze([
      door('control-spoke', 130, t('RAYON A', 'SPOKE A'), Object.freeze({ room: 'asph-spoke', door: 'spoke-hub' })),
      door('control-relay', 1160, t('SALLE DES RELAIS', 'RELAY ROOM'), Object.freeze({ room: 'asph-relay', door: 'relay-control' }), { lock: 'relay' }),
      door('control-lab', 1420, t('LABORATOIRE DE TRANSIT', 'TRANSIT LABORATORY'), Object.freeze({ room: 'asph-lab', door: 'lab-control' }), { lock: 'lab' }),
      door('control-medbay', 1680, t('INFIRMERIE DE STATION', 'STATION MEDBAY'), Object.freeze({ room: 'asph-medbay', door: 'medbay-control' }), { lock: 'medbay' }),
      door('control-lower', 1920, t('PONTS INFÉRIEURS', 'LOWER DECKS'), Object.freeze({ room: 'asph-lower', door: 'lower-control' }), { lock: 'lower-decks' })
    ]),
    posts: Object.freeze([
      post('control-board', 420, 'asphodele:board', t('CARTE DU RÉSEAU QZ · CONTRATS', 'QZ NETWORK MAP · CONTRACTS')),
      post('control-cassius', 760, 'asphodele:cassius', t('NOYAU DE CASSIUS', 'CASSIUS CORE'))
    ]),
    props: Object.freeze([]) }),
  'asph-relay': Object.freeze({ id: 'asph-relay', kind: 'profile', width: 1280, module: 'relay', view: 'V1',
    name: t('Salle des relais', 'Relay room'), unlock: 'relay-drift×3',
    doors: Object.freeze([door('relay-control', 130, t('PONT DE CONTRÔLE', 'CONTROL DECK'), Object.freeze({ room: 'asph-control', door: 'control-relay' }))]),
    posts: Object.freeze([post('relay-bays', 760, 'asphodele:relay', t('BAIES DE TRANSMISSION', 'TRANSMISSION BAYS'))]),
    props: Object.freeze([]) }),
  'asph-lab': Object.freeze({ id: 'asph-lab', kind: 'profile', width: 1280, module: 'lab', view: 'V1',
    name: t('Laboratoire de transit', 'Transit laboratory'), unlock: 'S3',
    doors: Object.freeze([door('lab-control', 130, t('PONT DE CONTRÔLE', 'CONTROL DECK'), Object.freeze({ room: 'asph-control', door: 'control-lab' }))]),
    posts: Object.freeze([post('lab-archives', 980, 'asphodele:archives', t('ARCHIVES DES LIVRAISONS', 'DELIVERY ARCHIVES'))]),
    props: Object.freeze([]) }),
  'asph-memorial': Object.freeze({ id: 'asph-memorial', kind: 'profile', width: 1280, module: 'memorial', view: 'V1',
    name: t('Mémorial', 'Memorial'), unlock: 'station-a-journaux',
    doors: Object.freeze([door('memorial-ring', 130, t('ANNEAU EXTÉRIEUR', 'OUTER RING'), Object.freeze({ room: 'asph-ring', door: 'ring-memorial' }))]),
    posts: Object.freeze([post('memorial-plaques', 760, 'asphodele:memorial', t('LIRE LES NOMS', 'READ THE NAMES'))]),
    props: Object.freeze([]) }),
  'asph-greenhouse': Object.freeze({ id: 'asph-greenhouse', kind: 'profile', width: 1280, module: 'greenhouse', view: 'V1',
    name: t('Serre', 'Greenhouse'), unlock: 'station-a-hydro',
    doors: Object.freeze([door('greenhouse-ring', 130, t('ANNEAU EXTÉRIEUR', 'OUTER RING'), Object.freeze({ room: 'asph-ring', door: 'ring-greenhouse' }))]),
    posts: Object.freeze([post('greenhouse-bays', 760, 'asphodele:greenhouse', t('BAIES HYDROPONIQUES', 'HYDROPONIC BAYS'))]),
    props: Object.freeze([]) }),
  'asph-market': Object.freeze({ id: 'asph-market', kind: 'profile', width: 1280, module: 'market', view: 'V1',
    name: t('Marché de l’anneau', 'Ring market'), unlock: 'station-a-grue+pact',
    doors: Object.freeze([door('market-ring', 130, t('ANNEAU EXTÉRIEUR', 'OUTER RING'), Object.freeze({ room: 'asph-ring', door: 'ring-market' }))]),
    posts: Object.freeze([post('market-counter', 700, 'asphodele:market', t('COMPTOIR CRUCIBLE', 'CRUCIBLE COUNTER'))]),
    props: Object.freeze([]) }),
  // —— The four §42.2 modules reopened by the spec 007 follow-up (bible §7.6) ——
  'asph-quarters': Object.freeze({ id: 'asph-quarters', kind: 'profile', width: 1280, module: 'quarters', view: 'V1',
    name: t('Quartiers', 'Quarters'), unlock: 'colony-autonomous',
    doors: Object.freeze([door('quarters-ring', 130, t('ANNEAU EXTÉRIEUR', 'OUTER RING'), Object.freeze({ room: 'asph-ring', door: 'ring-quarters' }))]),
    posts: Object.freeze([post('quarters-register', 760, 'asphodele:quarters', t('REGISTRE DES CABINES', 'CABIN REGISTER'))]),
    props: Object.freeze([]) }),
  'asph-medbay': Object.freeze({ id: 'asph-medbay', kind: 'profile', width: 1280, module: 'medbay', view: 'V1',
    name: t('Infirmerie de station', 'Station medbay'), unlock: 'S4',
    doors: Object.freeze([door('medbay-control', 130, t('PONT DE CONTRÔLE', 'CONTROL DECK'), Object.freeze({ room: 'asph-control', door: 'control-medbay' }))]),
    posts: Object.freeze([
      post('medbay-beds', 600, 'asphodele:medbay', t('LITS · SOINS DE L’ÉQUIPE', 'BEDS · CREW CARE')),
      post('medbay-scanner', 1000, 'asphodele:scanner', t('SCANNER DE QUARANTAINE', 'QUARANTINE SCANNER'))
    ]),
    props: Object.freeze([]) }),
  'asph-lower': Object.freeze({ id: 'asph-lower', kind: 'profile', width: 1280, module: 'lower', view: 'V1',
    name: t('Ponts inférieurs', 'Lower decks'), unlock: 'S3',
    doors: Object.freeze([door('lower-control', 130, t('PONT DE CONTRÔLE', 'CONTROL DECK'), Object.freeze({ room: 'asph-control', door: 'control-lower' }))]),
    posts: Object.freeze([
      post('lower-barricade', 560, 'asphodele:barricade', t('BARRICADES D’ECHO-8', 'ECHO-8 BARRICADES')),
      post('lower-night', 980, 'asphodele:night', t('RONDE DE NUIT', 'NIGHT ROUND'))
    ]),
    props: Object.freeze([]) }),
  'asph-repair': Object.freeze({ id: 'asph-repair', kind: 'depth', width: 1536, module: 'repair', view: 'V2',
    name: t('Hangar de réparation', 'Repair hangar'), unlock: 'S4+module',
    doors: Object.freeze([door('repair-docks', 130, t('QUAIS D’ARRIMAGE', 'DOCKING QUAYS'), Object.freeze({ room: 'asph-docks', door: 'docks-repair' }))]),
    posts: Object.freeze([post('repair-bench', 820, 'asphodele:repair', t('ATELIER DU CHEYENNE', 'CHEYENNE WORKSHOP'))]),
    // ≈ 1.2 m spare-part crates and a drum rack, in the depth band, clear of the rail.
    props: Object.freeze([
      prop('repair-crates', 'crate', 440, 61, 58, -60, -70, -48),
      prop('repair-drums', 'drum', 1180, 96, 52, -50, -60, -40)
    ]) })
});
export const ASPHODELE_ROOM_IDS_V188 = Object.freeze(Object.keys(ASPHODELE_ROOMS_V188));
export const ASPHODELE_ARRIVAL_V188 = Object.freeze({ room: 'asph-docks', door: 'docks-tantalus' });
// The bible §42.2 modules still not built: none since the spec 007 follow-up (the V3 plan stays Q23 A).
export const ASPHODELE_DEFERRED_MODULES_V188 = Object.freeze([]);
/** The four modules reopened by the follow-up, by lock id, with their room. */
export const ASPHODELE_REOPENED_MODULES_V188 = Object.freeze({ quarters: 'asph-quarters', medbay: 'asph-medbay', 'lower-decks': 'asph-lower', 'repair-hangar': 'asph-repair' });

export const getAsphodeleRoomV188 = id => ASPHODELE_ROOMS_V188[id] || null;
export const getAsphodeleDoorV188 = (roomId, doorId) => getAsphodeleRoomV188(roomId)?.doors.find(entry => entry.id === doorId) || null;

/** The depth descriptor of a V2 room, in the format of `hub-depth-rooms-v188.js` (spec 001). */
export function asphodeleDepthRoomV188(roomId) {
  const room = getAsphodeleRoomV188(roomId);
  if (!room || room.kind !== 'depth') return null;
  return { roomId: room.id, deck: null, x0: 0, x1: room.width, zMin: -80, zMax: 0, doorBand: 20, interactBand: 24, speed: 150,
    dropship: null, props: room.props, npcLane: { x0: 0, x1: 0, z: 0 }, npcDepths: {} };
}

// —— Save field ——
export function createAsphodeleHubV188() {
  return { schema: 188, location: 'tantalus', roomId: ASPHODELE_ARRIVAL_V188.room, x: arrivalX(ASPHODELE_ARRIVAL_V188), z: 0, facing: 1,
    visited: [], relayOnline: false, kesslerTag: null, grue: null, contracts: normalizeContractCountsV188(null),
    quartersSettled: false, cheyenne: 0, market: normalizeAsphodeleMarketV188(null), lastContractOpV188: null };
}
function arrivalX({ room, door: doorId }) {
  const entry = getAsphodeleDoorV188(room, doorId);
  // The marine (44 px) stands centred on the door, which is clear of every prop.
  return entry ? entry.x - 22 : 120;
}
export function normalizeAsphodeleHubV188(raw) {
  const state = createAsphodeleHubV188();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return state;
  state.location = raw.location === 'station' ? 'station' : 'tantalus';
  const room = getAsphodeleRoomV188(raw.roomId);
  if (room) {
    state.roomId = room.id;
    state.x = Number.isFinite(Number(raw.x)) ? Math.round(Math.max(24, Math.min(room.width - 68, Number(raw.x)))) : arrivalX({ room: room.id, door: room.doors[0].id });
    state.z = room.kind === 'depth' && Number.isFinite(Number(raw.z)) ? Math.round(Math.max(-80, Math.min(0, Number(raw.z))) * 10) / 10 : 0;
  }
  state.facing = raw.facing === -1 ? -1 : 1;
  state.visited = Array.isArray(raw.visited) ? [...new Set(raw.visited.filter(id => ASPHODELE_ROOM_IDS_V188.includes(id)))] : [];
  state.relayOnline = raw.relayOnline === true;
  state.kesslerTag = raw.kesslerTag === 'locker' ? 'locker' : null;
  state.grue = ['accept', 'expel'].includes(raw.grue) ? raw.grue : null;
  state.contracts = normalizeContractCountsV188(raw.contracts);
  // Spec 007 follow-up (additive): quarters settled, Cheyenne overhaul level, market cycle, last counted operation.
  state.quartersSettled = raw.quartersSettled === true;
  state.cheyenne = normalizeCheyenneLevelV188(raw.cheyenne);
  state.market = normalizeAsphodeleMarketV188(raw.market);
  state.lastContractOpV188 = typeof raw.lastContractOpV188 === 'string' && /^[\w-]{1,160}$/.test(raw.lastContractOpV188) ? raw.lastContractOpV188 : null;
  return state;
}
/** The station location is kept only while it is legitimately open (an edited or older save returns aboard the Tantalus). */
export function resolveAsphodeleHubV188(save) {
  const state = normalizeAsphodeleHubV188(save?.asphodeleHubV188);
  if (state.location === 'station' && !asphodeleHubOpenV188(save)) state.location = 'tantalus';
  if (state.location === 'station' && doorLockV188(save, state.roomId, null) === 'room-locked') {
    state.roomId = ASPHODELE_ARRIVAL_V188.room; state.x = arrivalX(ASPHODELE_ARRIVAL_V188); state.z = 0;
  }
  return state;
}

// —— Access ——
/** The hub opens after S4: the station has been retaken (bible §7.2, §42.2 « Plan … S4 »). */
export const asphodeleHubOpenV188 = save => asphodeleRetakenV188(save);
export const asphodeleAtStationV188 = save => resolveAsphodeleHubV188(save).location === 'station';
/** The Tantalus must be in Cocyte's system (`galaxy.shipWorldIdV116`, as the jump system reads it). */
export function asphodeleShuttleStatusV188(save) {
  if (!asphodeleHubOpenV188(save)) return 'hub-closed';
  if (save?.galaxy?.jumpV116?.phase === 'charging') return 'jumping';
  const shipWorld = save?.galaxy?.shipWorldIdV116 ?? save?.worldId;
  if (shipWorld && shipWorld !== ASPHODELE_WORLD_ID_V188) return 'away';
  if (save?.strategy?.currentOperation) return 'operation';
  return 'ready';
}
export const relayRoomOpenV188 = save => asphodeleHubOpenV188(save) && contractCountV188(save, RELAY_DRIFT_KEY_V188) >= RELAY_DRIFT_REQUIRED_V188;
/**
 * Predicate for Act V (spec 006): « Transmettre » needs a channel the company does
 * not hold. True once the station is retaken, three « Relais en dérive » contracts
 * are done (the relay room opens) and the transmission bays have been brought
 * online in that room. The final choice and the endings are NOT decided here.
 */
export function asphodeleRelayReadyV188(save) {
  return relayRoomOpenV188(save) && normalizeAsphodeleHubV188(save?.asphodeleHubV188).relayOnline === true;
}

/** Why a door does not open, or null. `doorId` null checks the room itself. */
export function doorLockV188(save, roomId, doorId) {
  const room = getAsphodeleRoomV188(roomId); if (!room) return 'unknown';
  if (doorId === null) {
    const unlock = { 'asph-relay': 'relay', 'asph-lab': 'lab', 'asph-memorial': 'memorial', 'asph-greenhouse': 'greenhouse', 'asph-market': 'market',
      'asph-quarters': 'quarters', 'asph-medbay': 'medbay', 'asph-lower': 'lower-decks', 'asph-repair': 'repair-hangar' }[roomId];
    return unlock && lockFor(save, unlock) ? 'room-locked' : null;
  }
  const entry = room.doors.find(item => item.id === doorId); if (!entry) return 'unknown';
  return entry.lock ? lockFor(save, entry.lock) : null;
}
function lockFor(save, lock) {
  const done = completed(save), hub = normalizeAsphodeleHubV188(save?.asphodeleHubV188);
  switch (lock) {
    case 'relay': return relayRoomOpenV188(save) ? null : 'relay';
    case 'lab': return has(done, 'station-s3') ? null : 'lab';
    case 'memorial': return has(done, 'station-a-journaux') ? null : 'memorial';
    case 'greenhouse': return has(done, 'station-a-hydro') ? null : 'greenhouse';
    case 'market': return has(done, 'station-a-grue') && hub.grue === 'accept' ? null : hub.grue === 'expel' ? 'market-expelled' : 'market';
    // Bible §7.3 / §42.2: the quarters with the colony tier « Autonome » (or beyond), the medbay with S4, the lower decks with S3.
    case 'quarters': return ['autonomous', 'free'].includes(colonyTierV188(normalizeColonyV188(save?.colonyV188))) ? null : 'quarters';
    case 'medbay': return asphodeleHubOpenV188(save) ? null : 'medbay';
    case 'lower-decks': return has(done, 'station-s3') && asphodeleHubOpenV188(save) ? null : 'lower-decks';
    // [PROPOSÉ] §42.2 gives S4; §7.2 « Remise en pression d'un module · Ouvre un module du hub » names the module: the hangar.
    case 'repair-hangar': return asphodeleHubOpenV188(save) && hub.contracts.module >= ASPHODELE_CONTRACT_EFFECTS_V188.module.opensRepairHangarAt ? null : 'repair-hangar';
    default: return lock; // 'echo8-dropship', 'grue-shuttle', 'deferred': never open
  }
}
const LOCKS = Object.freeze({
  relay: t('Scellée : ramenez trois boîtes noires (contrat « Relais en dérive »).', 'Sealed: bring back three black boxes (contract "Drifting relay").'),
  lab: t('Scellé : les ponts scellés (S3) ne sont pas franchis.', 'Sealed: the sealed decks (S3) are not cleared.'),
  memorial: t('Fermé : rassemblez d’abord les journaux de l’équipage (Asha Mbaye).', 'Closed: first gather the crew logs (Asha Mbaye).'),
  greenhouse: t('Hors pression : remettez d’abord la serre en route (Jun Park).', 'Unpressurised: first restart the greenhouse (Jun Park).'),
  market: t('Fermé : le pacte de l’anneau avec Grue n’est pas conclu.', 'Closed: the ring pact with Grue is not settled.'),
  'market-expelled': t('Fermé : les récupérateurs de Grue ont été expulsés.', 'Closed: Grue’s salvagers were expelled.'),
  'echo8-dropship': t('Scellé : le dropship d’Echo-8 reste amarré tel qu’il a été trouvé.', 'Sealed: Echo-8’s dropship stays docked as it was found.'),
  'grue-shuttle': t('Navette Crucible : accès réservé à l’équipage de Grue.', 'Crucible shuttle: access reserved to Grue’s crew.'),
  deferred: t('Module scellé : il n’est pas encore rouvert.', 'Sealed module: not reopened yet.'),
  quarters: t('Scellés : les quartiers rouvrent quand Port-Méridien atteint le palier « Autonome ».', 'Sealed: the quarters reopen once Port-Méridien reaches the "Autonomous" tier.'),
  'lower-decks': t('Scellés : les ponts scellés (S3) ne sont pas franchis.', 'Sealed: the sealed decks (S3) are not cleared.'),
  medbay: t('Fermée : la station n’est pas reprise (S4).', 'Closed: the station is not retaken (S4).'),
  'repair-hangar': t('Hors pression : remettez un module en pression (contrat « Remise en pression d’un module »).', 'Unpressurised: repressurise a module (contract "Repressurise a module").'),
  'room-locked': t('Module fermé.', 'Module closed.'),
  unknown: t('Passage inconnu.', 'Unknown passage.')
});
export const asphodeleLockTextV188 = (reason, language = 'fr') => pick(LOCKS[reason], language);

/**
 * Resolves a door: { ok, roomId, doorId, x, z } at the arrival door, or { ok:false, reason }.
 * The marine arrives centred on the target door, on the rail (z = 0), clear of the props.
 */
export function asphodeleDoorTargetV188(save, roomId, doorId) {
  const entry = getAsphodeleDoorV188(roomId, doorId);
  if (!entry) return { ok: false, reason: 'unknown' };
  if (entry.shuttle) return { ok: true, shuttle: true };
  const lock = doorLockV188(save, roomId, doorId);
  if (lock) return { ok: false, reason: lock };
  if (!entry.to) return { ok: false, reason: 'deferred' };
  const target = getAsphodeleDoorV188(entry.to.room, entry.to.door);
  if (!target) return { ok: false, reason: 'unknown' };
  return { ok: true, roomId: entry.to.room, doorId: target.id, x: target.x - 22, z: 0 };
}

/** Pure travel transitions on a candidate save. Each returns true when it changed something. */
export function boardAsphodeleV188(save) {
  if (asphodeleShuttleStatusV188(save) !== 'ready') return false;
  const state = resolveAsphodeleHubV188(save);
  if (state.location === 'station') return false;
  Object.assign(state, { location: 'station', roomId: ASPHODELE_ARRIVAL_V188.room, x: arrivalX(ASPHODELE_ARRIVAL_V188), z: 0, facing: 1 });
  state.visited = [...new Set([...state.visited, state.roomId])];
  save.asphodeleHubV188 = state; return true;
}
export function returnToTantalusV188(save) {
  const state = resolveAsphodeleHubV188(save);
  if (state.location !== 'station') return false;
  Object.assign(state, { location: 'tantalus', roomId: ASPHODELE_ARRIVAL_V188.room, x: arrivalX(ASPHODELE_ARRIVAL_V188), z: 0, facing: 1 });
  save.asphodeleHubV188 = state; return true;
}
/** Operations always leave from the Tantalus drop bay [PROPOSÉ]: deploying from the station returns the UD-4L first. */
export const leaveAsphodeleForOperationV188 = save => returnToTantalusV188(save);

export function bringRelayOnlineV188(save) {
  if (!relayRoomOpenV188(save)) return false;
  const state = normalizeAsphodeleHubV188(save.asphodeleHubV188);
  if (state.relayOnline) return false;
  state.relayOnline = true; save.asphodeleHubV188 = { ...save.asphodeleHubV188, ...state }; return true;
}
export const gruePactPendingV188 = save => has(completed(save), 'station-a-grue') && !normalizeAsphodeleHubV188(save?.asphodeleHubV188).grue;
export function chooseGruePactV188(save, choice) {
  if (!['accept', 'expel'].includes(choice) || !gruePactPendingV188(save)) return false;
  const state = normalizeAsphodeleHubV188(save.asphodeleHubV188);
  state.grue = choice; save.asphodeleHubV188 = { ...save.asphodeleHubV188, ...state }; return true;
}
/** Kessler's tag (bible §7.4): recovered in S3, deposited in Echo-8's empty locker aboard the Tantalus. */
export const kesslerTagPendingV188 = save => kesslerTagRecoveredV188(save) && normalizeAsphodeleHubV188(save?.asphodeleHubV188).kesslerTag !== 'locker';
export const kesslerTagInLockerV188 = save => normalizeAsphodeleHubV188(save?.asphodeleHubV188).kesslerTag === 'locker';
export function depositKesslerTagV188(save) {
  if (!kesslerTagPendingV188(save)) return false;
  const state = normalizeAsphodeleHubV188(save.asphodeleHubV188);
  state.kesslerTag = 'locker'; save.asphodeleHubV188 = { ...save.asphodeleHubV188, ...state }; return true;
}

/** The minimal save view the runtime keeps to resolve locks without holding the live save. */
export function asphodeleSaveViewV188(save) {
  return { galaxy: { completedCampaignIds: [...completed(save)] }, stationV188: normalizeStationV188(save?.stationV188),
    asphodeleHubV188: normalizeAsphodeleHubV188(save?.asphodeleHubV188), colonyV188: normalizeColonyV188(save?.colonyV188) };
}

// —— Player-facing texts (FR/EN); [PROPOSÉ] lines are recorded in bible §7.6 ——
export const ASPHODELE_TEXT_V188 = Object.freeze({
  deck: t('ASPHODÈLE · STATION', 'ASPHODÈLE · STATION'),
  breadcrumb: t('ASPHODÈLE // SECOND HUB', 'ASPHODÈLE // SECOND HUB'),
  shuttle: t('NAVETTE · STATION ASPHODÈLE', 'SHUTTLE · ASPHODÈLE STATION'),
  shuttleAway: t('Navette indisponible : le Tantalus doit être en orbite de Cocyte.', 'Shuttle unavailable: the Tantalus must be in orbit of Cocyte.'),
  shuttleJumping: t('Navette indisponible pendant le saut.', 'Shuttle unavailable during the jump.'),
  shuttleOperation: t('Navette indisponible : une opération est en cours.', 'Shuttle unavailable: an operation is under way.'),
  arrived: t('Asphodèle · l’UD-4L est arrimé au sas 1. L’anneau extérieur est à l’est.', 'Asphodèle · the UD-4L is docked at airlock 1. The outer ring is to the east.'),
  returned: t('Retour à bord du Tantalus : l’UD-4L est dans son hangar.', 'Back aboard the Tantalus: the UD-4L is in its hangar.'),
  returnPrompt: t('RETOURNER AU TANTALUS', 'RETURN TO THE TANTALUS'),
  enter: t('ENTRER', 'ENTER'),
  moveHint: t('A/D marcher · W/S avancer / reculer · ESPACE sauter · E utiliser', 'A/D walk · W/S step forward/back · SPACE jump · E use'),
  moveHintFlat: t('A/D marcher · ESPACE sauter · E utiliser', 'A/D walk · SPACE jump · E use'),
  saveBlocked: t('SAUVEGARDE BLOQUÉE · E pour réessayer', 'SAVE BLOCKED · E to retry'),
  relayOnline: t('Les baies de transmission sont alignées. Le relais d’Asphodèle peut parler sans passer par la compagnie : « Transmettre » devient possible au conseil de guerre.', 'The transmission bays are aligned. Asphodèle’s relay can speak without going through the company: "Transmit" becomes possible at the war council.'),
  relayAlready: t('Les baies sont en ligne. La file des messages retenus se vide vers Port-Méridien.', 'The bays are online. The queue of held messages drains towards Port-Méridien.'),
  relayClosed: t('Les baies restent hors ligne.', 'The bays stay offline.'),
  archives: t('Archives des livraisons : chaque conteneur QZ17 passait ici pour contrôle avant de descendre au dépôt de Cocyte. Le dernier contrôle est daté de la nuit de la quarantaine ; la case « résultat » est vide.', 'Delivery archives: every QZ17 container came through here for inspection before going down to the Cocyte depot. The last inspection is dated the night of the quarantine; the "result" box is empty.'),
  greenhouse: t('Les baies hydroponiques sont en culture. Les premières caisses partiront pour Port-Méridien au prochain cycle.', 'The hydroponic bays are growing. The first crates will leave for Port-Méridien next cycle.'),
  market: t('Comptoir Crucible : les récupérateurs de Grue tiennent l’étal.', 'Crucible counter: Grue’s salvagers keep the stall.'),
  plan: t('Plan de la station : anneau extérieur (quais, hangar de réparation, marché, serre, mémorial, quartiers), rayon A, moyeu (pont de contrôle, salle des relais, laboratoire, infirmerie, ponts inférieurs). L’anneau tourne lentement ; le moyeu ne tourne pas.', 'Station plan: outer ring (quays, repair hangar, market, greenhouse, memorial, quarters), spoke A, hub (control deck, relay room, laboratory, medbay, lower decks). The ring turns slowly; the hub does not.'),
  grueNone: t('Grue surveille ses dockers. « L’anneau est à nous depuis trois semaines. On en reparlera quand tu viendras à bord. »', 'Grue watches her dockers. "The ring has been ours for three weeks. We’ll talk when you come aboard."'),
  grueAsk: t('Grue attend la réponse. « Tu nous laisses l’anneau, on fait tourner le marché. Tu nous fais partir, on part. »', 'Grue awaits the answer. "You leave us the ring, we run the market. You make us leave, we leave."'),
  grueAccept: t('ACCEPTER LE PACTE', 'ACCEPT THE PACT'), grueExpel: t('LES EXPULSER', 'EXPEL THEM'),
  grueAccepted: t('Le pacte est conclu : le marché de l’anneau ouvre.', 'The pact is settled: the ring market opens.'),
  grueExpelled: t('Les récupérateurs quittent l’anneau. Le marché reste fermé.', 'The salvagers leave the ring. The market stays closed.'),
  grueAfter: t('Grue hoche la tête. « Le marché tourne. »', 'Grue nods. "The market is running."'),
  memorialTitle: t('Mémorial', 'Memorial'),
  boardTitle: t('Carte du réseau QZ', 'QZ network map'),
  boardOpen: t('PLANIFIER', 'PLAN'), boardLocked: t('VERROUILLÉ', 'LOCKED'), boardDone: t('ACCOMPLIE', 'DONE'),
  boardPlanned: t('Mission planifiée : elle part du hangar du Tantalus.', 'Mission planned: it leaves from the Tantalus hangar.'),
  relayCount: t('Relais en dérive : {n}/3', 'Drifting relays: {n}/3'),
  close: t('FERMER', 'CLOSE'), continue: t('CONTINUER', 'CONTINUE'),
  tagDeposit: t('DÉPOSER LA PLAQUE DE KESSLER', 'PLACE KESSLER’S TAG'),
  tagDeposited: t('La plaque du sergent Dario Kessler est accrochée dans le casier d’Echo-8.', 'Sergeant Dario Kessler’s tag hangs in Echo-8’s locker.')
});
export const asphodeleTextV188 = (key, language = 'fr', values = {}) => pick(ASPHODELE_TEXT_V188[key], language).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));

/** CASSIUS at its core, according to the S2 decision. */
export function cassiusCoreLineV188(save, language = 'fr') {
  const choice = normalizeStationV188(save?.stationV188).cassius, sawIt = has(completed(save), 'station-a-cassius');
  const lines = {
    rewrite: t('CASSIUS : « Priorité : les vivants. Quarantaine de Cocyte levée. Trois relais hors ligne. »', 'CASSIUS: "Priority: the living. Cocyte quarantine lifted. Three relays offline."'),
    restrain: t('CASSIUS, bridé, ne répond qu’en codes d’état : ÉNERGIE NOMINALE · AIR NOMINAL · ARCHIVES FERMÉES.', 'CASSIUS, restrained, answers only in status codes: POWER NOMINAL · AIR NOMINAL · ARCHIVES CLOSED.'),
    erase: t('Le noyau est noir. La station tourne en mode manuel ; les techniciens du Tantalus relèvent les compteurs à la main.', 'The core is dark. The station runs on manual; the Tantalus technicians read the gauges by hand.')
  };
  const text = pick(lines[choice] || lines.erase, language);
  const camera = sawIt ? pick(t(' Les caméras de la nuit de la quarantaine sont rejouées en boucle sur l’écran voisin.', ' The cameras of the quarantine night loop on the next screen.'), language) : '';
  return text + camera;
}
/** Names on the memorial ([PROPOSÉ] except those of the bible: Solène Ivarsson, Dario Kessler). */
export const ASPHODELE_MEMORIAL_V188 = Object.freeze({
  station: Object.freeze(['Solène Ivarsson', 'R. Achterberg', 'M. Oyelaran', 'T. Vasquez-Brandt', 'H. Kowalczyk']),
  echo8: Object.freeze(['Sgt Dario Kessler', 'Cpl A. Nwosu', 'Pvt L. Sato', 'Pvt J. Merrow'])
});
export function memorialTextV188(save, language = 'fr') {
  const en = language === 'en';
  const head = en ? 'Asphodèle crew: ' : 'Équipage d’Asphodèle : ', team = en ? ' · Echo-8: ' : ' · Echo-8 : ';
  const tag = kesslerTagInLockerV188(save) ? (en ? ' · Kessler’s tag is aboard the Tantalus, in Echo-8’s locker.' : ' · La plaque de Kessler est à bord du Tantalus, dans le casier d’Echo-8.') : '';
  return `${head}${ASPHODELE_MEMORIAL_V188.station.join(', ')}${team}${ASPHODELE_MEMORIAL_V188.echo8.join(', ')}.${tag}`;
}
/** Short status for the Command panel. */
export function asphodeleHubSummaryV188(save, language = 'fr') {
  if (!asphodeleHubOpenV188(save)) return null;
  const en = language === 'en', count = Math.min(RELAY_DRIFT_REQUIRED_V188, contractCountV188(save, RELAY_DRIFT_KEY_V188));
  const relay = asphodeleRelayReadyV188(save) ? (en ? 'relay online' : 'relais en ligne') : relayRoomOpenV188(save) ? (en ? 'relay room open' : 'salle des relais ouverte') : `${en ? 'drifting relays' : 'relais en dérive'} ${count}/${RELAY_DRIFT_REQUIRED_V188}`;
  return `${en ? 'ASPHODÈLE HUB · shuttle from the hangar' : 'HUB ASPHODÈLE · navette depuis le hangar'} · ${relay}`;
}

/**
 * The station cinematic due now, or null (bible §10, spec 007): CIN-70 once the
 * station intro is heard and before S1; CIN-71 while the CASSIUS decision is
 * pending; CIN-72 after S3, before its return scene. An advanced save that has
 * passed these moments is not sent back to them.
 */
export function stationCinematicDueV188(save) {
  const seen = Array.isArray(save?.storyCampaignV188?.cinematicsSeen) ? save.storyCampaignV188.cinematicsSeen : [];
  const station = normalizeStationV188(save?.stationV188), done = completed(save);
  if (station.introHeard && !done.includes('station-s1') && !seen.includes('cin-70')) return 'cin-70';
  if (done.includes('station-s2') && !station.cassius && !seen.includes('cin-71')) return 'cin-71';
  if (done.includes('station-s3') && !station.scenesSeen.includes('s3') && !seen.includes('cin-72')) return 'cin-72';
  return null;
}
