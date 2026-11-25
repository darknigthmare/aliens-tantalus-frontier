// V188 — dedicated levels of the Port-Méridien main missions C1-C4 (bible §6.2,
// §6.4, §43.1). A layer on top of the generated templates: C1, C3 and C4 keep the
// `colony-multiroute` geometry, C2 keeps `ship-interior-vertical`. Ids, titles,
// campaign objectives, rewards, the `colonyMissionsV188` save field, the C4
// decision (`colonyC4DecisionPendingV188`) and the reconstruction rules are not
// touched: the layer only replaces the generic encounter (template roster, boss,
// generator loop) with authored phases, then fulfils the existing objective
// runtime (defend / restore / rescue / navigate) the way its phases say.
//
// Rules shared by the four levels [PROPOSÉ] (1 m ≈ 51 px, marine 44 × 92 px):
// - every hostile spawn appears behind a 900 px safe zone (never closer to a
//   marine on the same deck) and waits 4 s before acting (grace);
// - each phase writes one checkpoint when it starts; a resume or a retry lands
//   there with the phase as it began (snapshot `colonyLevelV188`);
// - interactions stand on the rail (|z| ≤ 24 in the C1 depth corridor); a held
//   interaction (weld, purge, resin) advances while E is held in reach, a hit
//   pauses it without resetting it.
//
// Fidelity (no 1:1 claim; documented / adapted / to define):
// - documented: welded airlock doors and UA 571-C sentry guns with ammunition
//   counters (Aliens, 1986, and its Special Edition, 1991); the hive built in
//   the heat of the atmosphere processor, colonists cocooned on its walls
//   (Aliens, 1986); an embryo revealed by a medical scanner (Alien 3, 1992);
//   the motion tracker (Aliens, 1986);
// - adapted by the project: QZ17-04 container, Port-Méridien layout, two sentry
//   guns placed by the player, panic meter, hatch countdown, the Children of the
//   Perfected Host converts and their « élus » (bible §1.5), non-lethal handling;
// - to define: final art of every slot (colony-level-art-v188.js), voices.
//
// Owner decisions of 2026-11-22: in C3 Noor Okafor is the infirmary figure, not a squad
// teammate (removed from the squad for this mission only, a line says why); the player's
// M577 is stowed in C1, C3 and C4 (no APC in the colony streets, on foot at insertion);
// in C4 a welded service grate closes the utility gallery and a welded roof door closes
// the comms roof, so the ducts are the only way to the gathering (logical and physical
// checks: colonyC4AccessV188 and the walls themselves).
import { depthToScreenOffsetV188 } from './hub-depth-rooms-v188.js';
import { colonyC1PlacesV188, colonyC2PlacesV188, colonyC3PlacesV188, colonyC4PlacesV188 } from './colony-level-places-v188.js';
import { drawColonyLevelSlotV188, drawColonyCivilianV188, drawColonyM577V188, drawWeldSparksV188, drawGuideLightV188 } from './colony-level-art-v188.js';
import { COLONY_WORLD_ID_V188 } from './colony-reconstruction-v188.js';

export const COLONY_LEVEL_IDS_V188 = Object.freeze(['colony-c1', 'colony-c2', 'colony-c3', 'colony-c4']);
export const isColonyLevelCampaignV188 = id => COLONY_LEVEL_IDS_V188.includes(typeof id === 'string' ? id : id?.id);
/** Street missions where the player's M577 stays aboard (owner decision 2026-11-22). */
export const COLONY_STREET_NO_APC_IDS_V188 = Object.freeze(['colony-c1', 'colony-c3', 'colony-c4']);
export const COLONY_C3_NOOR_ID_V188 = 'crew-04-noor-okafor';
/** C3: Noor Okafor holds the infirmary; she is not deployed with the squad for this mission (restored afterwards). */
export function colonyC3SquadV188(crew, campaignId) {
  const list = Array.isArray(crew) ? crew : [];
  return campaignId === 'colony-c3' ? list.filter(member => (member?.id || member) !== COLONY_C3_NOOR_ID_V188) : list;
}
/** C3 mission preparation (owner decision 2026-11-22, round 2): Noor stays listed, marked unavailable, with the reason. */
export const COLONY_C3_NOOR_PREP_V188 = Object.freeze({
  status: Object.freeze({ fr: 'Noor Okafor · À L’INFIRMERIE', en: 'Noor Okafor · AT THE INFIRMARY' }),
  reason: Object.freeze({ fr: 'Indisponible pour C3 : elle tient l’infirmerie de Port-Méridien pour le contrôle biologique des rescapés du M577.',
    en: 'Unavailable for C3: she holds the Port-Méridien infirmary for the biological screening of the M577 survivors.' })
});
/** The squad of the preparation screen: names deployed, and the members posted elsewhere for this mission. */
export function colonyPreparationCrewV188(campaignId, crewIds = []) {
  const ids = Array.isArray(crewIds) ? crewIds : [];
  const posted = campaignId === 'colony-c3' && ids.includes(COLONY_C3_NOOR_ID_V188) ? [COLONY_C3_NOOR_ID_V188] : [];
  return Object.freeze({ deployed: Object.freeze(ids.filter(id => !posted.includes(id))), unavailable: Object.freeze(posted.map(id => Object.freeze({ id, ...COLONY_C3_NOOR_PREP_V188 }))) });
}
export const COLONY_C3_NOOR_LINE_V188 = Object.freeze({ fr: 'Noor Okafor reste à l’infirmerie pour le contrôle biologique : elle ne suit pas l’escouade dans cette mission.',
  en: 'Noor Okafor stays at the infirmary for the biological screening: she does not follow the squad on this mission.' });
/** C4: the two walks around the ducts, closed by welded architecture (bible §6.4). Edge ids of the colony template graph. */
export const COLONY_C4_BARRIERS_V188 = Object.freeze([
  Object.freeze({ id: 'colony-c4-utility-grate-v188', slot: 'colony-utility-grate-sealed', edgeId: 'colony-e18', deck: 'low', requirement: 'GRILLE DE SERVICE SOUDÉE · PASSER PAR LES CONDUITS' }),
  Object.freeze({ id: 'colony-c4-roof-hatch-v188', slot: 'colony-roof-hatch-sealed', edgeId: 'colony-e12', deck: 'roof', requirement: 'PORTE DU TOIT SOUDÉE · PASSER PAR LES CONDUITS' })
]);
/** Logical access in C4: which template nodes the marine reaches from the drop, on foot only or with the ducts. */
export function colonyC4AccessV188(engine, { ducts = true } = {}) {
  const graph = engine?.missionLevelRuntime?.graph, level = engine?.colonyLevelV188;
  if (!graph) return null;
  const closedDoors = new Set((engine.doors || []).filter(door => !door.open && door.levelLocked).map(door => door.edgeId));
  const barred = new Set((level?.barriers || []).map(entry => entry.edgeId));
  const links = new Map(graph.nodes.map(node => [node.id, []]));
  const link = (a, b) => { links.get(a)?.push(b); links.get(b)?.push(a); };
  for (const edge of graph.edges) if (!closedDoors.has(edge.id) && !barred.has(edge.id) && edge.kind !== 'vent') link(edge.from, edge.to);
  // The V62 duct network: each portal stands by the template node nearest to it; the duct graph is connected
  // (vent-network-v62.js), so any two portals of the network join.
  const network = engine.missionVentNetworkV62;
  if (ducts && network) {
    const nodeAt = (x, y) => [...graph.nodes].sort((a, b) => Math.hypot(a.x - x, (a.y - y) * 2) - Math.hypot(b.x - x, (b.y - y) * 2))[0] || null;
    const portals = (engine.vents || []).filter(vent => vent.portalId).map(vent => nodeAt(vent.x + (vent.w || 0) / 2, vent.y + (vent.h || 0))).filter(Boolean);
    for (let i = 0; i < portals.length; i++) for (let j = i + 1; j < portals.length; j++) link(portals[i].id, portals[j].id);
  }
  const start = graph.nodes.find(node => node.anchor === 'spawn' || node.id.endsWith('-spawn'))?.id;
  const seen = new Set(start ? [start] : []), queue = [...seen];
  while (queue.length) for (const next of links.get(queue.shift()) || []) if (!seen.has(next)) { seen.add(next); queue.push(next); }
  return Object.freeze({ reached: Object.freeze([...seen]), gathering: seen.has('colony-security') });
}
/** [PROPOSÉ] timings, counts and distances of the dedicated colony levels. */
export const COLONY_LEVEL_RULES_V188 = Object.freeze({
  pxPerMetre: 51, marine: Object.freeze({ w: 44, h: 92 }), safeZonePx: 900, graceSeconds: 4,
  reach: 76, band: 24, damagePause: .9, walkSpeed: 95, runSpeed: 230, followGap: 52, sightPx: 460,
  holds: Object.freeze({ shutter: 2, weld: 6, purge: 5, resin: 4 }), scanSeconds: 2.5, hatchSeconds: 240,
  panic: Object.freeze({ aim: 35, run: 25, decay: 12, threshold: 100, afterScatter: 40, aimRange: 360, runRange: 150, runSpeed: 300 }),
  turret: Object.freeze({ count: 2, range: 520, damage: 9, interval: .18, ammo: 220, halfAngle: Math.PI / 3, minGap: 90 }),
  cult: Object.freeze({ count: 3, sight: 240, subdueReach: 70, patrol: 90, stabilityPerKill: -1, stabilityCostMax: -3 })
});
const R = COLONY_LEVEL_RULES_V188;
const SOURCES = Object.freeze({ drone: 'enemy-004-drone-big-chap', warrior: 'enemy-005-warrior', cult: 'enemy-048-cult-host' });
const t = (fr, en) => Object.freeze({ fr, en });

/** Phases of each level, in order (labels FR + EN; the HUD draws FR through the reviewed catalog). */
export const COLONY_LEVEL_PHASES_V188 = Object.freeze({
  'colony-c1': Object.freeze([
    Object.freeze({ id: 'contain', label: t('Contenir l’entrepôt QZ17-04', 'Contain the QZ17-04 warehouse') }),
    Object.freeze({ id: 'evacuate', label: t('Évacuer les patients vers la plate-forme', 'Evacuate the patients to the platform') }),
    Object.freeze({ id: 'weld', label: t('Souder les sas A et B', 'Weld airlocks A and B') }),
    Object.freeze({ id: 'extract', label: t('Rejoindre l’extraction', 'Reach extraction') })
  ]),
  'colony-c2': Object.freeze([
    Object.freeze({ id: 'gantry', label: t('Rejoindre la passerelle du processeur', 'Reach the processor gantry') }),
    Object.freeze({ id: 'ducts', label: t('Traverser les conduits', 'Cross the ducts') }),
    Object.freeze({ id: 'nest', label: t('Purger le nid des échangeurs', 'Purge the exchanger nest') }),
    Object.freeze({ id: 'control', label: t('Relancer le processeur', 'Restart the processor') }),
    Object.freeze({ id: 'extract', label: t('Remonter vers l’extraction', 'Climb back to extraction') })
  ]),
  'colony-c3': Object.freeze([
    Object.freeze({ id: 'arrivals', label: t('Accueillir les rescapés du M577', 'Receive the M577 survivors') }),
    Object.freeze({ id: 'scan', label: t('Contrôler chaque rescapé', 'Scan every survivor') }),
    Object.freeze({ id: 'carrier', label: t('Conduire le porteur à Noor', 'Lead the carrier to Noor') }),
    Object.freeze({ id: 'extract', label: t('Rejoindre l’extraction', 'Reach extraction') })
  ]),
  'colony-c4': Object.freeze([
    Object.freeze({ id: 'dormitories', label: t('Relever les indices des dortoirs', 'Find the clues in the dormitories') }),
    Object.freeze({ id: 'vents', label: t('Suivre les conduits jusqu’au rassemblement', 'Follow the ducts to the gathering') }),
    Object.freeze({ id: 'gathering', label: t('Libérer l’élu du cocon', 'Free the chosen one from the cocoon') }),
    Object.freeze({ id: 'extract', label: t('Ramener l’élu à l’extraction', 'Bring the chosen one to extraction') })
  ])
});
export const colonyLevelPhaseIdsV188 = campaignId => (COLONY_LEVEL_PHASES_V188[campaignId] || []).map(entry => entry.id);

// —— Pure rules ——
/** Deterministic carrier of C3 (0-4), from the mission seed and the save's operation; stored in the checkpoint. */
export function colonyC3CarrierIndexV188(seed = 0, salt = '') {
  let state = 2166136261;
  for (const character of `${Number(seed) >>> 0}:${salt}:colony-c3-carrier`) { state ^= character.codePointAt(0); state = Math.imul(state, 16777619); }
  return (state >>> 0) % 5;
}
/** One step of a held interaction: advances only while held, in reach and not hit recently; never resets. */
export function stepHeldInteractionV188(progress, { held = false, inReach = false, sinceHit = Infinity, dt = 0, seconds = 1 } = {}) {
  const value = Math.max(0, Math.min(1, Number(progress) || 0));
  const paused = !held || !inReach || sinceHit < R.damagePause;
  return { progress: paused ? value : Math.min(1, value + Math.max(0, dt) / Math.max(.1, seconds)), paused };
}
/** Panic meter step (C3): aiming at or running near civilians raises it; it decays otherwise. */
export function stepPanicV188(panic, { aimingAtCivilian = false, runningNearCivilian = false, dt = 0 } = {}) {
  const rules = R.panic, rise = (aimingAtCivilian ? rules.aim : 0) + (runningNearCivilian ? rules.run : 0);
  const next = Math.max(0, Math.min(rules.threshold, (Number(panic) || 0) + (rise ? rise : -rules.decay) * Math.max(0, dt)));
  return { panic: next, scatter: next >= rules.threshold };
}
/** A spawn x on a deck: at least the safe zone away from every marine on that deck, on the preferred side first. */
export function colonySpawnXV188({ marines = [], side = 'east', deck = { x0: 0, x1: 5200 }, offset = 0, blocked = () => false } = {}) {
  const centres = marines.map(entry => entry.x), anchor = centres.length ? (side === 'west' ? Math.min(...centres) : Math.max(...centres)) : (deck.x0 + deck.x1) / 2;
  const tries = side === 'west' ? ['west', 'east'] : side === 'east' ? ['east', 'west'] : [side, 'east', 'west'];
  for (const direction of tries) {
    const base = direction === 'west' ? Math.min(...(centres.length ? centres : [anchor])) : Math.max(...(centres.length ? centres : [anchor]));
    const x = Math.round(base + (direction === 'west' ? -1 : 1) * (R.safeZonePx + 40 + offset));
    if (x < deck.x0 || x > deck.x1) continue;
    if (centres.some(centre => Math.abs(centre - x) < R.safeZonePx)) continue;
    if (blocked(x)) continue;
    return x;
  }
  return null;
}
/** [PROPOSÉ] C4: lethal handling of converts costs Port-Méridien stability (−1 per convert killed, at most −3). */
export function colonyCultStabilityCostV188(killed) {
  const count = Math.max(0, Math.floor(Number(killed) || 0));
  return count ? Math.max(R.cult.stabilityCostMax, count * R.cult.stabilityPerKill) : 0;
}
/** Applied once with the operation result (app finalize): only C4, only on success, only if converts were killed. */
export function applyColonyLevelResultV188(save, { success = false, campaignId = null, result = null } = {}) {
  if (!success || campaignId !== 'colony-c4' || !result || result.campaignId !== 'colony-c4') return null;
  const cost = colonyCultStabilityCostV188(result.cultKilled);
  const world = save?.galaxy?.worldState?.[COLONY_WORLD_ID_V188];
  if (!cost || !world || !Number.isFinite(world.stability)) return null;
  world.stability = Math.max(0, Math.min(100, world.stability + cost));
  return Object.freeze({ campaignId, stability: cost, cultKilled: result.cultKilled, cultSubdued: result.cultSubdued || 0 });
}

const clone = value => JSON.parse(JSON.stringify(value));
const centre = actor => actor.x + (actor.w || 0) / 2;
const feet = actor => actor.y + (actor.h || 0);
const LANG = () => globalThis.document?.documentElement?.lang === 'en' ? 'en' : 'fr';

/** Initial progress of a level (all fields are JSON; a snapshot of it is the phase checkpoint). */
function initialProgress(campaignId, places, engine) {
  if (campaignId === 'colony-c1') return {
    shutter: 0, weldA: 0, weldB: 0, kits: places.kits.map((x, index) => ({ id: `sentry-${index + 1}`, x, taken: false })), carried: 0, turrets: [],
    civilians: places.patients.map((x, index) => ({ id: `patient-${index + 1}`, row: index % 3, x, z: -10 - index * 6, state: 'wait' }))
  };
  if (campaignId === 'colony-c2') return { gantry: false, ambush: false, purge: 0, breakers: [false, false, false], restarted: false };
  if (campaignId === 'colony-c3') {
    const seed = Number(engine?.resumeIdentity?.seed) || Number(engine?.missionLevelRuntime?.levelSeed?.seed) || 0;
    return { carrier: colonyC3CarrierIndexV188(seed, engine?.missionLevelRuntime?.signature || ''), revealedAt: null, hatchRemaining: null,
      scanned: 0, scanning: null, panic: 0, scatters: 0, delivered: false,
      civilians: places.arrivals.map((x, index) => ({ id: `survivor-${index + 1}`, row: index % 3, x, z: 0, state: 'wait', result: null })) };
  }
  return { clues: { log: false, sign: false, seal: false }, lore: false, resin: 0, freed: false, cultKilled: 0, cultSubdued: 0,
    cultists: places.cultists.map((x, index) => ({ id: `convert-${index + 1}`, x, home: x, state: 'absent' })),
    civilians: [{ id: 'elu', row: 2, x: places.cocoon, z: 0, state: 'cocoon' }] };
}

export function withColonyMissionLevelsV188(Base) {
  if (Base.colonyMissionLevelsV188) return Base;
  return class ColonyMissionLevelsV188 extends Base {
    static colonyMissionLevelsV188 = true;

    start(options = {}) {
      this.colonyLevelV188 = null;
      const campaignId = options.campaign?.id || null;
      // C3: Noor Okafor is the infirmary figure of the level; she is not a squad teammate in it.
      const squad = isColonyLevelCampaignV188(campaignId) && !options.editorProject ? colonyC3SquadV188(options.crew, campaignId) : options.crew;
      const noorPosted = Array.isArray(options.crew) && squad.length !== options.crew.length;
      const result = super.start(noorPosted ? { ...options, crew: squad } : options);
      if (!isColonyLevelCampaignV188(campaignId) || !this.missionLevelRuntime || this.editorMode) return result;
      const places = campaignId === 'colony-c1' ? colonyC1PlacesV188(this) : campaignId === 'colony-c2' ? colonyC2PlacesV188(this)
        : campaignId === 'colony-c3' ? colonyC3PlacesV188(this) : colonyC4PlacesV188(this);
      const progress = initialProgress(campaignId, places, this);
      this.colonyLevelV188 = { schema: 188, campaignId, places, phase: 0, progress, snapshot: null, checkpointId: null,
        runtime: this.colonyFreshRuntimeV188(), message: null, lastHitAt: -Infinity, sparks: 0 };
      this.prepareColonyLevelV188(campaignId, places);
      const saved = this.lastResumeResult?.applied ? options.resumeState?.colonyLevelV188 : null;
      if (saved && saved.campaignId === campaignId && saved.schema === 188 && Number.isInteger(saved.phase) && saved.progress) {
        this.restoreColonyPhaseV188(saved, { reposition: true });
      } else {
        this.colonyLevelV188.snapshot = { phase: 0, progress: clone(progress) };
        this.materializeColonyLevelV188();
      }
      if (noorPosted) { this.colonyLevelV188.noorPosted = true; this.colonyMessageV188(COLONY_C3_NOOR_LINE_V188.fr, 6); this.onEvent?.({ type: 'colony-noor-posted-v188', crewId: COLONY_C3_NOOR_ID_V188 }); }
      this.onEvent?.({ type: 'colony-level-ready-v188', campaignId, phase: this.colonyPhaseIdV188() });
      return result;
    }

    colonyFreshRuntimeV188() { return { spawnKey: null, spawned: 0, nextSpawnAt: 0, phaseElapsed: 0, ambushAt: null, surgeClock: 0, scanClock: 0 }; }
    colonyPhaseIdV188() { const level = this.colonyLevelV188; return level ? colonyLevelPhaseIdsV188(level.campaignId)[level.phase] || null : null; }

    /** The template's generic encounter gives way to the authored phases (geometry, supplies and art stay). */
    prepareColonyLevelV188(campaignId, places) {
      this.enemies = [];
      if (this.mission?.objectives) this.mission.objectives.boss = true;
      // Template events (blackout, generator, plaza wave, decompression, cascade, ambush) are consumed:
      // their actions would reopen the generic loop. The blackout already ran (colony night).
      for (const event of this.missionLevelEvents?.values?.() || []) event.triggered = true;
      for (const spawn of this.missionLevelSpawns?.values?.() || []) spawn.active = true;
      for (const node of this.objectiveNodes || []) { node.active = true; node.hiddenV188 = true; }
      if (places.template === 'colony-multiroute') {
        // A continuous street: the two lift cabins rest at street level for the whole mission (ladders remain).
        for (const lift of this.lifts || []) { lift.y = places.floorY; lift.controlledV130 = false; lift.stateV130 = 'idle'; lift.dwellV130 = 0; }
        if (places.mainGate) Object.assign(places.mainGate, { open: true, levelLocked: false, lockedBy: null });
        if (places.securityGate && campaignId !== 'colony-c4') Object.assign(places.securityGate, { open: true, levelLocked: false, lockedBy: null });
        if (places.securityGate && campaignId === 'colony-c4') Object.assign(places.securityGate, { open: false, progress: 0, levelLocked: true, colonySealedV188: true });
      }
      if (COLONY_STREET_NO_APC_IDS_V188.includes(campaignId) && this.vehicle?.active) {
        // The player's M577 stays aboard: no APC in the colony streets (same stowing as the ship templates).
        this.vehicle.active = false; this.vehicle.occupied = false; this.vehicle.driver = null; this.vehicle.passengers = [];
        this.vehicle.deploymentStatus = 'colony-street-v188';
        for (const actor of [this.player, this.coop]) if (actor) actor.inVehicle = false;
      }
      if (campaignId === 'colony-c4') this.colonyLevelV188.barriers = this.buildColonyC4BarriersV188(places);
      if (campaignId === 'colony-c2') {
        // The restart console takes the auxiliary power node; the extraction moves to the top deck (« extraction en haut »).
        if (this.powerNode) Object.assign(this.powerNode, { x: places.console.x, y: places.console.y - 64, active: false });
        if (this.objective) Object.assign(this.objective, { x: places.extraction.x - 34, y: places.extraction.y - 90 });
      }
    }

    /** C4: the welded grate of the utility gallery and the welded roof door, as walls (they block marines, creatures and shots). */
    buildColonyC4BarriersV188(places) {
      const platforms = this.platforms || [], ladders = this.ladders || [];
      const at = id => platforms.find(entry => entry.id === `node-platform-${id}`);
      const low = at('colony-security-low')?.y ?? at('colony-generator')?.y, roof = at('colony-security-high')?.y ?? places.roofY;
      const down = ladders.find(entry => entry.id === 'colony-e21'), up = ladders.find(entry => entry.id === 'colony-e19');
      const street = platforms.filter(entry => Math.abs(entry.y - places.floorY) < 1);
      // The grate fills the gallery from its floor up to the underside of the street deck above it.
      const under = x => Math.max(places.floorY, ...street.filter(entry => x + 40 >= entry.x && x <= entry.x + entry.w).map(entry => entry.y + (entry.h || 20))) + 2;
      // The roof door stands against the comms block's roof structure (an existing wall of the template).
      const roofWall = (this.walls || []).find(entry => entry.y < roof && entry.y + entry.h >= roof - 2 && entry.x > (places.cache?.x ?? 0) && entry.x < places.security);
      const out = [];
      for (const spec of COLONY_C4_BARRIERS_V188) {
        let x, top, bottom;
        if (spec.deck === 'low') {
          if (!Number.isFinite(low) || !down || !up) continue;
          x = Math.round((down.x + (down.w || 42) + up.x) / 2) - 20; top = under(x); bottom = low;
        } else {
          if (!Number.isFinite(roof)) continue;
          x = roofWall ? Math.round(roofWall.x - 40) : Math.round((places.streetB + places.security) / 2); top = 0; bottom = roof;
        }
        const wall = { id: spec.id, x, y: top, w: 40, h: bottom - top, colonyBarrierV188: spec.id, edgeId: spec.edgeId, zoneId: spec.deck === 'low' ? 'colony-utility' : 'colony-civic' };
        this.walls = [...(this.walls || []).filter(entry => entry.id !== spec.id), wall];
        out.push(Object.freeze({ ...spec, x, y: top, w: 40, h: bottom - top, floorY: bottom }));
      }
      return Object.freeze(out);
    }

    // —— Phases, checkpoints, resume ——
    colonyCheckpointPlaceV188(phaseId) {
      const level = this.colonyLevelV188, p = level.places;
      switch (`${level.campaignId}:${phaseId}`) {
        case 'colony-c1:evacuate': return [p.shutter.x + p.shutter.w + 70, p.floorY];
        case 'colony-c1:weld': return [p.platform.x0 + 40, p.floorY];
        case 'colony-c1:extract': return [p.airlockB + 70, p.floorY];
        case 'colony-c2:ducts': return [p.gantry.x, p.gantry.y];
        case 'colony-c2:nest': return [p.ducts.x, p.ducts.y];
        case 'colony-c2:control': return [p.nest.x - 160, p.nest.y];
        case 'colony-c2:extract': return [p.console.x - 70, p.console.y];
        case 'colony-c3:scan': return [p.queue.at(-1) - 70, p.floorY];
        case 'colony-c3:carrier': return [p.scanner - 70, p.floorY];
        case 'colony-c3:extract': return [p.noor - 90, p.floorY];
        case 'colony-c4:vents': return [p.clues.seal - 50, p.floorY];
        case 'colony-c4:gathering': return [p.gathering.x0 - 30, p.floorY];
        case 'colony-c4:extract': return [p.cocoon - 70, p.floorY];
        default: return null;
      }
    }
    advanceColonyPhaseV188() {
      const level = this.colonyLevelV188, ids = colonyLevelPhaseIdsV188(level.campaignId);
      if (level.phase >= ids.length - 1) return false;
      level.phase += 1; level.runtime = this.colonyFreshRuntimeV188();
      const phaseId = ids[level.phase];
      this.enterColonyPhaseV188(phaseId);
      // The snapshot is taken before the checkpoint event: the save written for it holds the phase as it starts.
      level.snapshot = { phase: level.phase, progress: clone(level.progress) };
      const place = this.colonyCheckpointPlaceV188(phaseId);
      if (place) {
        level.checkpointId = `${level.campaignId}-${phaseId}`;
        this.setCheckpoint(level.checkpointId, place[0] - (this.player?.w || 42) / 2, place[1] - (this.player?.h || 92));
      }
      this.colonyMessageV188(COLONY_LEVEL_PHASES_V188[level.campaignId][level.phase].label.fr, 4);
      this.onEvent?.({ type: 'colony-level-phase-v188', campaignId: level.campaignId, phase: phaseId, checkpoint: level.checkpointId });
      return true;
    }
    /** Side effects owned by a phase start (objective runtime fulfilment, NPC setup). */
    enterColonyPhaseV188(phaseId) {
      const level = this.colonyLevelV188, id = level.campaignId, progress = level.progress;
      if (phaseId === 'extract') {
        // The port held: the defend objective is fulfilled by the welds (its generic zone hold is not offered).
        if (id === 'colony-c1') { if (this.objectiveState) { this.objectiveState.started = true; this.objectiveState.holdRemaining = 0; } this.markObjectiveAction?.('colony-port-held', { welded: 2 }); }
        if (id === 'colony-c3') {
          if (this.mission?.objectives) this.mission.objectives.route = true;
          if (this.objectiveState) this.objectiveState.rescued = Math.max(this.objectiveState.rescued || 0, this.objectiveRuntime?.nodeCount || 0);
        }
      }
      if (id === 'colony-c4' && phaseId === 'vents') for (const cultist of progress.cultists) if (cultist.state === 'absent') cultist.state = 'patrol';
      if (id === 'colony-c4' && phaseId === 'extract') this.markObjectiveAction?.('colony-cult-found', { freed: true });
      if (id === 'colony-c3' && phaseId === 'carrier') for (const entry of progress.civilians) if (entry.result === 'clear' && entry.state !== 'scatter') entry.state = 'ward';
      this.materializeColonyLevelV188({ clearSpawns: false });
    }
    restoreColonyPhaseV188(saved, { reposition = false } = {}) {
      const level = this.colonyLevelV188, ids = colonyLevelPhaseIdsV188(level.campaignId);
      level.phase = Math.max(0, Math.min(ids.length - 1, saved.phase));
      level.progress = { ...initialProgress(level.campaignId, level.places, this), ...clone(saved.progress) };
      level.snapshot = { phase: level.phase, progress: clone(level.progress) };
      level.runtime = this.colonyFreshRuntimeV188();
      const place = this.colonyCheckpointPlaceV188(ids[level.phase]);
      if (place) {
        level.checkpointId = `${level.campaignId}-${ids[level.phase]}`;
        this.checkpoint = { id: level.checkpointId, x: place[0] - (this.player?.w || 42) / 2, y: place[1] - (this.player?.h || 92) };
        if (reposition) for (const [index, actor] of [this.player, this.coop].entries()) if (actor) {
          actor.x = this.checkpoint.x - index * 52; actor.y = this.checkpoint.y; actor.vx = 0; actor.vy = 0; actor.depthZ = 0;
        }
      }
      // Objective fulfilment of the phases already passed.
      for (let index = 1; index <= level.phase; index += 1) if (ids[index] === 'extract') this.enterColonyPhaseV188('extract');
      if (level.campaignId === 'colony-c2' && level.progress.restarted && this.powerNode) { this.powerNode.active = true; if (this.mission?.objectives) this.mission.objectives.power = true; }
      if (level.campaignId === 'colony-c4' && level.phase >= 2 && this.objectiveState && !this.objectiveState.complete) this.markObjectiveAction?.('colony-cult-route', { restored: true });
      this.materializeColonyLevelV188();
      return true;
    }
    /** Rebuilds what the progress implies: no live spawn survives a phase restore. */
    materializeColonyLevelV188({ clearSpawns = true } = {}) {
      const level = this.colonyLevelV188, progress = level.progress, p = level.places;
      if (clearSpawns) this.enemies = (this.enemies || []).filter(enemy => !enemy.colonyLevelSpawnV188 && !enemy.colonyCultistV188);
      if (level.campaignId === 'colony-c1' && p.securityGate) {
        if (progress.weldA > 0) Object.assign(p.securityGate, { open: false, levelLocked: true, colonyWeldV188: progress.weldA });
        else Object.assign(p.securityGate, { open: true, levelLocked: false, colonyWeldV188: 0 });
      }
      if (level.campaignId === 'colony-c4') {
        progress.cultists.forEach((entry, index) => {
          if (entry.state !== 'patrol' && entry.state !== 'hostile') return;
          if ((this.enemies || []).some(enemy => enemy.colonyCultistV188 === entry.id && enemy.alive)) return;
          const enemy = this.spawnColonyEnemyV188('cult', entry.x, p.floorY, { index, cultist: entry });
          if (enemy && entry.state === 'hostile') enemy.alert = true;
        });
      }
      this.syncColonyHazardsV188();
    }
    captureResumeState() {
      const state = super.captureResumeState(), level = this.colonyLevelV188;
      if (!level?.snapshot) return state;
      return { ...state, colonyLevelV188: { schema: 188, campaignId: level.campaignId, phase: level.snapshot.phase, progress: clone(level.snapshot.progress), checkpoint: level.checkpointId } };
    }
    restartFromCheckpoint() {
      const restarted = super.restartFromCheckpoint();
      const level = this.colonyLevelV188;
      if (restarted && level?.snapshot) this.restoreColonyPhaseV188(level.snapshot);
      return restarted;
    }

    // —— Spawns ——
    colonyEnemySourceV188(kind) {
      const catalog = this.v52EnemyCatalog?.length ? this.v52EnemyCatalog : this.objectiveEnemyCatalog || [];
      return catalog.find(entry => entry.id === SOURCES[kind]) || catalog.find(entry => entry.caste !== 'royal' && (kind === 'cult' ? entry.biology === 'human' : entry.biology === 'xenomorph'))
        || { id: SOURCES[kind], name: kind === 'cult' ? 'Cult Host' : 'Drone', biology: kind === 'cult' ? 'human' : 'xenomorph', health: 80, damage: 12, speed: 1.2 };
    }
    spawnColonyEnemyV188(kind, x, floorY, { index = 0, cultist = null } = {}) {
      const level = this.colonyLevelV188, serial = (level.runtime.serial = (level.runtime.serial || 0) + 1);
      const enemy = this.createEnemy(this.colonyEnemySourceV188(kind), 900 + serial, x, floorY, { boss: false, keyCarrier: false });
      Object.assign(enemy, { alert: !cultist, depthZ: 0, colonyGraceV188: R.graceSeconds, colonyLevelSpawnV188: cultist ? null : this.colonyPhaseIdV188() });
      if (cultist) Object.assign(enemy, { colonyCultistV188: cultist.id, facing: index % 2 ? 1 : -1, colonyPatrolHomeV188: cultist.home ?? x });
      this.initializeEnemyMissionNavigation?.(enemy);
      this.enemies.push(enemy);
      this.onEvent?.({ type: 'colony-level-spawn-v188', kind, enemyId: enemy.id, x: Math.round(x), phase: this.colonyPhaseIdV188() });
      return enemy;
    }
    colonyMarinesV188() { return [this.player, this.coopEnabled ? this.coop : null].filter(actor => actor?.alive && !actor.downed); }
    /** A deck of the level at a floor y: its x extent and whether a closed door stands between two points. */
    colonyDeckV188(floorY) {
      const surfaces = (this.platforms || []).filter(entry => Math.abs(entry.y - floorY) < 2 && entry.w > 0);
      if (!surfaces.length) return null;
      // A spawn may stand beyond the depth corridor: it walks in on the rail.
      const x0 = Math.min(...surfaces.map(entry => entry.x)) + 40, x1 = Math.max(...surfaces.map(entry => entry.x + entry.w)) - 40;
      const supported = x => surfaces.some(entry => x >= entry.x + 24 && x <= entry.x + entry.w - 24);
      const closedBetween = (a, b) => (this.doors || []).some(door => !door.open && door.y < floorY && door.y + door.h >= floorY - 4
        && door.x + door.w / 2 > Math.min(a, b) && door.x + door.w / 2 < Math.max(a, b));
      return { x0, x1, supported, closedBetween };
    }
    updateColonySpawnsV188(plan, dt) {
      const level = this.colonyLevelV188, runtime = level.runtime;
      if (!plan) return;
      if (runtime.spawnKey !== plan.key) { runtime.spawnKey = plan.key; runtime.spawned = 0; runtime.nextSpawnAt = runtime.phaseElapsed + (plan.first ?? 3); }
      const alive = (this.enemies || []).filter(enemy => enemy.alive && enemy.colonyLevelSpawnV188 === this.colonyPhaseIdV188()).length;
      if (runtime.spawned >= plan.total || alive >= plan.maxAlive || runtime.phaseElapsed < runtime.nextSpawnAt) return;
      const deck = this.colonyDeckV188(plan.y), marines = this.colonyMarinesV188().filter(actor => Math.abs(feet(actor) - plan.y) < 40).map(actor => ({ x: centre(actor) }));
      if (!deck) return;
      const reference = marines.length ? marines : this.colonyMarinesV188().map(actor => ({ x: centre(actor) }));
      const x = colonySpawnXV188({ marines: reference, side: plan.side, deck, offset: (runtime.spawned % 3) * 60,
        blocked: candidate => !deck.supported(candidate) || reference.some(entry => deck.closedBetween(candidate, entry.x)) });
      if (!Number.isFinite(x)) { runtime.nextSpawnAt = runtime.phaseElapsed + 1; return; }
      this.spawnColonyEnemyV188(plan.pool || 'drone', x, plan.y, { index: runtime.spawned });
      runtime.spawned += 1; runtime.nextSpawnAt = runtime.phaseElapsed + plan.interval;
    }
    colonySpawnPlanV188() {
      const level = this.colonyLevelV188, phase = this.colonyPhaseIdV188(), pr = level.progress, p = level.places, id = level.campaignId;
      const street = p.floorY;
      if (id === 'colony-c1') {
        if (phase === 'contain') return { key: 'contain', total: 4, maxAlive: 2, interval: 9, first: 6, side: 'east', y: street };
        if (phase === 'evacuate') return pr.civilians.some(entry => entry.state === 'follow') ? { key: 'evacuate', total: 6, maxAlive: 3, interval: 7, first: 4, side: 'west', y: street } : null;
        if (phase === 'weld') return pr.weldA < 1 ? { key: 'weld-a', total: 4, maxAlive: 3, interval: 6, first: 8, side: 'west', y: street }
          : { key: 'weld-b-peak', total: 8, maxAlive: 5, interval: 2.2, first: 1.5, side: 'east', y: street, pool: 'drone' };
        return null; // a quiet run to extraction
      }
      if (id === 'colony-c2') {
        if (phase === 'ducts' && pr.ambush) return { key: 'ducts-ambush', total: 3, maxAlive: 3, interval: 1.2, first: .5, side: 'east', y: p.decks.mid };
        if (phase === 'nest' && pr.purge >= 1) return { key: 'nest-wake', total: 3, maxAlive: 3, interval: 1.5, first: .5, side: 'west', y: p.decks.low };
        if (phase === 'extract') return { key: 'surge', total: 4, maxAlive: 3, interval: 5, first: 3, side: 'west', y: p.decks.low };
        return null;
      }
      if (id === 'colony-c3') {
        if ((phase === 'scan' && pr.revealedAt !== null) || phase === 'carrier') return { key: `${phase}-stalk`, total: 2, maxAlive: 1, interval: 22, first: 14, side: 'west', y: street };
        return null;
      }
      return null; // C4: converts and the cocoon, no wave
    }

    // —— Update ——
    update(delta) {
      const level = this.colonyLevelV188;
      if (!level) return super.update(delta);
      const result = super.update(delta);
      if (this.mission?.state !== 'active') return result;
      const dt = Math.min(.1, Math.max(0, Number(delta) || 0));
      level.runtime.phaseElapsed += dt; level.sparks = Math.max(0, level.sparks - dt);
      if (level.message && (level.message.until -= dt) <= 0) level.message = null;
      const id = level.campaignId;
      if (id === 'colony-c1') this.updateColonyC1V188(dt);
      else if (id === 'colony-c2') this.updateColonyC2V188(dt);
      else if (id === 'colony-c3') this.updateColonyC3V188(dt);
      else this.updateColonyC4V188(dt);
      this.updateColonySpawnsV188(this.colonySpawnPlanV188(), dt);
      return result;
    }
    updateEnemy(enemy, delta) {
      if (enemy?.colonyGraceV188 > 0) { enemy.colonyGraceV188 = Math.max(0, enemy.colonyGraceV188 - Math.max(0, Number(delta) || 0)); enemy.vx = 0; return; }
      if (enemy?.colonyCultistV188 && !enemy.alert && enemy.alive) return this.patrolColonyCultistV188(enemy, delta);
      return super.updateEnemy(enemy, delta);
    }
    damagePlayer(actor, amount, options = {}) {
      const before = actor ? (Number(actor.health) || 0) + (Number(actor.armor) || 0) : 0;
      const result = super.damagePlayer(actor, amount, options);
      if (this.colonyLevelV188 && actor && (Number(actor.health) || 0) + (Number(actor.armor) || 0) < before) this.colonyLevelV188.lastHitAt = this.mission?.elapsed || 0;
      return result;
    }
    defeatEnemy(enemy, owner) {
      const level = this.colonyLevelV188;
      if (level && enemy?.alive && enemy.colonyCultistV188) {
        const entry = level.progress.cultists?.find(item => item.id === enemy.colonyCultistV188);
        if (entry && entry.state !== 'dead') { entry.state = 'dead'; level.progress.cultKilled += 1; this.onEvent?.({ type: 'colony-cult-killed-v188', convert: entry.id, killed: level.progress.cultKilled }); }
      }
      return super.defeatEnemy(enemy, owner);
    }
    colonyHeldV188(actor = this.player) { return Boolean(this.keys?.has(actor?.coop ? 'KeyY' : 'KeyE')); }
    colonyOnRailV188(actor) { return !this.missionDepthSectionV188 || Math.abs(Number(actor?.depthZ) || 0) <= R.band; }
    colonyInReachV188(actor, x, y, reach = R.reach) {
      return Boolean(actor?.alive && !actor.downed && !actor.ventTransit && Math.abs(centre(actor) - x) <= reach && Math.abs(feet(actor) - y) < 40 && this.colonyOnRailV188(actor));
    }
    /** Advances the held interaction `key` of the progress (0 → 1); returns true the frame it completes. */
    stepColonyHoldV188(key, x, y, seconds, dt) {
      const level = this.colonyLevelV188, holding = level.runtime.holding;
      if (!holding || holding.key !== key || level.progress[key] >= 1) return false;
      const actor = holding.actor, inReach = this.colonyInReachV188(actor, x, y, R.reach + 10);
      const step = stepHeldInteractionV188(level.progress[key], { held: this.colonyHeldV188(actor), inReach, sinceHit: (this.mission?.elapsed || 0) - level.lastHitAt, dt, seconds });
      level.progress[key] = step.progress; holding.paused = step.paused;
      if (!step.paused) { level.sparks = .2; holding.x = x; holding.y = y; }
      if (!inReach && !this.colonyHeldV188(actor)) level.runtime.holding = null;
      if (level.progress[key] >= 1) { level.runtime.holding = null; return true; }
      return false;
    }
    colonyMessageV188(text, seconds = 4) { if (this.colonyLevelV188) this.colonyLevelV188.message = { text, until: seconds }; this.pushCaption?.('mission', text); }

    /** Civilians: follow the marine within sight, at walking pace, on the street floor. */
    stepColonyCiviliansV188(dt, { follow = entry => entry.state === 'follow', targets = new Map() } = {}) {
      const level = this.colonyLevelV188, actor = this.player, floorY = level.places.floorY;
      const following = level.progress.civilians.filter(follow);
      level.progress.civilians.forEach(entry => {
        let goal = targets.get(entry.id);
        const k = following.indexOf(entry);
        if (!Number.isFinite(goal) && k >= 0 && actor?.alive && Math.abs(feet(actor) - floorY) < 40 && Math.abs(centre(actor) - entry.x) < R.sightPx)
          goal = centre(actor) - (actor.facing >= 0 ? 1 : -1) * R.followGap * (k + 1);
        const speed = entry.state === 'scatter' ? R.runSpeed : R.walkSpeed;
        if (Number.isFinite(goal) && Math.abs(goal - entry.x) > 6) {
          const step = Math.sign(goal - entry.x) * Math.min(Math.abs(goal - entry.x), speed * dt);
          entry.x += step; entry.facing = Math.sign(step) || entry.facing || 1; entry.moving = true;
        } else entry.moving = false;
      });
    }

    // —— C1 « Tenir le port » ——
    updateColonyC1V188(dt) {
      const level = this.colonyLevelV188, pr = level.progress, p = level.places, phase = this.colonyPhaseIdV188(), floorY = p.floorY;
      if (phase === 'contain' && this.stepColonyHoldV188('shutter', p.shutter.x + p.shutter.w / 2, floorY, R.holds.shutter, dt)) {
        this.colonyMessageV188('Rideau de l’entrepôt baissé. Infirmerie de Lucia Ferro : trois patients à évacuer.', 5);
        this.advanceColonyPhaseV188();
      }
      if (phase === 'evacuate') {
        const targets = new Map();
        pr.civilians.forEach((entry, index) => {
          if (entry.state === 'follow' && entry.x >= p.platform.x0) entry.state = 'safe';
          if (entry.state === 'safe') targets.set(entry.id, p.platform.x0 + 50 + index * 55);
        });
        this.stepColonyCiviliansV188(dt, { targets });
        if (pr.civilians.every(entry => entry.state === 'safe')) {
          this.colonyMessageV188('Patients sur la plate-forme. Souder les sas : A sur la rue, B dans le mur nord.', 5);
          this.advanceColonyPhaseV188();
        }
      }
      if (phase === 'weld') {
        if (this.stepColonyHoldV188('weldA', p.airlockA, floorY, R.holds.weld, dt)) this.colonyMessageV188('Sas A soudé. Ils remontent par le mur nord : sas B !', 4);
        if (this.stepColonyHoldV188('weldB', p.airlockB, floorY, R.holds.weld, dt)) {
          this.colonyMessageV188('Sas B soudé. Le port tient. Rejoindre l’extraction.', 5);
          this.advanceColonyPhaseV188();
        }
        if (p.securityGate && pr.weldA > 0) Object.assign(p.securityGate, { open: false, levelLocked: true, colonyWeldV188: pr.weldA });
      }
      if (phase === 'weld' || phase === 'extract') this.updateColonyTurretsV188(dt);
    }
    updateColonyTurretsV188(dt) {
      const pr = this.colonyLevelV188.progress, rules = R.turret, floorY = this.colonyLevelV188.places.floorY;
      for (const turret of pr.turrets) {
        turret.clock = Math.max(0, (turret.clock || 0) - dt);
        if (turret.ammo <= 0 || turret.clock > 0) continue;
        const target = (this.enemies || []).filter(enemy => enemy.alive && !enemy.dormant && !(enemy.colonyGraceV188 > 0) && Math.abs(feet(enemy) - floorY) < 60)
          .map(enemy => ({ enemy, dx: centre(enemy) - turret.x })).filter(({ dx }) => Math.sign(dx) === turret.facing && Math.abs(dx) <= rules.range)
          .sort((a, b) => Math.abs(a.dx) - Math.abs(b.dx))[0];
        if (!target) continue;
        turret.clock = rules.interval; turret.ammo -= 1; turret.firing = .08;
        this.applyEnemyDamage(target.enemy, rules.damage, { kind: 'sentry', owner: this.player, x: centre(target.enemy), y: target.enemy.y + target.enemy.h * .45 });
      }
      for (const turret of pr.turrets) turret.firing = Math.max(0, (turret.firing || 0) - dt);
    }

    // —— C2 « L’air du port » ——
    updateColonyC2V188(dt) {
      const level = this.colonyLevelV188, pr = level.progress, p = level.places, phase = this.colonyPhaseIdV188(), actor = this.player;
      const on = (y, x0, x1) => actor?.alive && Math.abs(feet(actor) - y) < 30 && centre(actor) >= x0 && centre(actor) <= x1;
      if (phase === 'gantry' && on(p.gantry.y, p.gantry.x - 160, p.gantry.x + 160)) {
        pr.gantry = true;
        this.colonyMessageV188('Jun Park (radio) : « Passerelle atteinte. Souffle une minute : en dessous, ce sont les conduits. »', 6);
        this.advanceColonyPhaseV188();
      }
      if (phase === 'ducts') {
        if (!pr.ambush && on(p.ducts.y, p.ducts.x0, p.ducts.x1)) {
          pr.ambush = true; level.runtime.ambushAt = level.runtime.phaseElapsed;
          this.colonyMessageV188('Jun Park : « Le détecteur de mouvement s’affole… ils sont dans les conduits ! » (Q : détecteur)', 5);
        }
        const plan = this.colonySpawnPlanV188(), cleared = plan && level.runtime.spawnKey === plan.key && level.runtime.spawned >= plan.total
          && !(this.enemies || []).some(enemy => enemy.alive && enemy.colonyLevelSpawnV188 === 'ducts');
        if (pr.ambush && (cleared || level.runtime.phaseElapsed - level.runtime.ambushAt > 45)) this.advanceColonyPhaseV188();
      }
      if (phase === 'nest' && this.stepColonyHoldV188('purge', p.nest.x, p.nest.y, R.holds.purge, dt)) {
        this.colonyMessageV188('Nid purgé. La salle de contrôle est au fond du pont : trois disjoncteurs, puis la console.', 5);
        this.advanceColonyPhaseV188();
      }
      if (phase === 'extract') this.syncColonyHazardsV188(dt);
    }
    /** C2 pressure surge: two steam vents of the return route pulse (1.2 s every 3 s). */
    syncColonyHazardsV188(dt = 0) {
      const level = this.colonyLevelV188;
      if (level?.campaignId !== 'colony-c2') return;
      const active = this.colonyPhaseIdV188() === 'extract';
      level.runtime.surgeClock = (level.runtime.surgeClock + dt) % 3;
      this.hazards = (this.hazards || []).filter(hazard => !hazard.colonySurgeV188);
      if (!active) return;
      level.places.steam.forEach((entry, index) => this.hazards.push({ id: `colony-surge-${index + 1}`, kind: 'steam', x: entry.x, y: entry.y - 20, w: 120, h: 20,
        active: (level.runtime.surgeClock + index * 1.5) % 3 < 1.2, colonySurgeV188: true, zoneId: 'ship-habitation' }));
    }

    // —— C3 « Le convoi des rescapés » ——
    updateColonyC3V188(dt) {
      const level = this.colonyLevelV188, pr = level.progress, p = level.places, phase = this.colonyPhaseIdV188(), actor = this.player;
      const targets = new Map();
      // Countdown from the reveal.
      if (pr.hatchRemaining !== null && !pr.delivered) {
        pr.hatchRemaining = Math.max(0, pr.hatchRemaining - dt);
        if (pr.hatchRemaining <= 0) { this.colonyMessageV188('L’embryon a éclos.', 4); this.failMission('embryo-hatched'); return; }
      }
      if (phase === 'arrivals') {
        if (pr.civilians.every(entry => entry.state === 'follow' && entry.x >= p.queue.at(-1) - 60)) {
          pr.civilians.forEach(entry => { entry.state = 'queue'; });
          this.colonyMessageV188('File du contrôle biologique. Un rescapé à la fois, sans arme pointée.', 5);
          this.advanceColonyPhaseV188();
          return;
        }
      }
      if (phase === 'scan') {
        const queued = pr.civilians.filter(entry => entry.state === 'queue');
        queued.forEach((entry, index) => targets.set(entry.id, p.queue[index] ?? p.queue.at(-1)));
        const scanning = pr.civilians.find(entry => entry.state === 'scan');
        if (scanning) {
          targets.set(scanning.id, p.scanner);
          if (Math.abs(scanning.x - p.scanner) < 10) {
            level.runtime.scanClock += dt;
            if (level.runtime.scanClock >= R.scanSeconds) {
              level.runtime.scanClock = 0; pr.scanned += 1;
              const index = pr.civilians.indexOf(scanning), carrier = index === pr.carrier;
              scanning.result = carrier ? 'carrier' : 'clear'; scanning.state = carrier ? 'hold' : 'ward';
              if (carrier) {
                pr.revealedAt = this.mission?.elapsed || 0; pr.hatchRemaining = R.hatchSeconds;
                this.colonyMessageV188('Scanner : masse thoracique en croissance. Porteur identifié — rester calme.', 6);
                this.onEvent?.({ type: 'colony-carrier-revealed-v188', index });
              } else this.colonyMessageV188('Scanner : négatif.', 2);
            }
          }
        }
        pr.civilians.forEach(entry => { if (entry.state === 'hold') targets.set(entry.id, p.scanner + 60); });
        if (pr.scanned >= pr.civilians.length && !pr.civilians.some(entry => entry.state === 'scatter')) { this.advanceColonyPhaseV188(); return; }
      }
      if (phase === 'carrier') {
        const carrier = pr.civilians[pr.carrier];
        if (carrier && carrier.state === 'hold') carrier.state = 'follow';
      }
      pr.civilians.forEach((entry, index) => {
        if (entry.state === 'ward') targets.set(entry.id, p.ward[index]);
        if (entry.state === 'scatter') targets.set(entry.id, entry.room);
        if (entry.state === 'noor') targets.set(entry.id, p.noor - 40);
      });
      this.stepColonyCiviliansV188(dt, { targets });
      // Panic (aiming at civilians, running near them).
      const civilians = pr.civilians.filter(entry => !['noor', 'ward'].includes(entry.state));
      const near = (range, frontOnly) => actor?.alive && civilians.some(entry => {
        const dx = entry.x - centre(actor);
        return Math.abs(dx) <= range && (!frontOnly || Math.sign(dx) === (actor.facing >= 0 ? 1 : -1)) && Math.abs(feet(actor) - p.floorY) < 60;
      });
      // Aiming at someone: the aim lock held (Shift) or a shot just fired, towards them; a mouse cursor alone is not a threat.
      const aiming = Boolean(actor && (this.keys?.has(actor.coop ? 'ShiftRight' : 'ShiftLeft') || actor.aimLockedV124 || actor.fireClock > 0 || this.keys?.has(actor.coop ? 'KeyO' : 'KeyF')));
      const step = stepPanicV188(pr.panic, { aimingAtCivilian: aiming && near(R.panic.aimRange, true), runningNearCivilian: Math.abs(Number(actor?.vx) || 0) > R.panic.runSpeed && near(R.panic.runRange, false), dt });
      pr.panic = step.panic;
      if (step.scatter) {
        pr.panic = R.panic.afterScatter; pr.scatters += 1;
        pr.civilians.forEach(entry => {
          if (!['follow', 'queue', 'hold', 'wait'].includes(entry.state)) return;
          entry.resume = entry.state; entry.state = 'scatter';
          entry.room = [...p.sideRooms].sort((a, b) => Math.abs(a - entry.x) - Math.abs(b - entry.x))[0];
        });
        this.colonyMessageV188('Panique ! Les rescapés se dispersent dans les salles voisines. Les rassurer un par un.', 5);
        this.onEvent?.({ type: 'colony-panic-scatter-v188', scatters: pr.scatters });
      }
    }

    // —— C4 « Le culte du port » ——
    updateColonyC4V188(dt) {
      const level = this.colonyLevelV188, pr = level.progress, p = level.places, phase = this.colonyPhaseIdV188(), actor = this.player;
      if (phase === 'dormitories' && pr.clues.log && pr.clues.sign && pr.clues.seal) {
        this.colonyMessageV188('Trois indices : les sas s’ouvrent de l’intérieur. Les conduits mènent au rassemblement.', 5);
        this.advanceColonyPhaseV188();
      }
      if (phase === 'vents' && actor?.alive && !actor.ventTransit && Math.abs(feet(actor) - p.floorY) < 30 && centre(actor) >= p.gathering.x0) {
        this.markObjectiveAction?.('colony-cult-route', { reached: true });
        this.colonyMessageV188('Le rassemblement. Un élu est pris dans la résine. Les convertis ne vous ont pas vu.', 5);
        this.advanceColonyPhaseV188();
      }
      if (phase === 'gathering' && this.stepColonyHoldV188('resin', p.cocoon, p.floorY, R.holds.resin, dt)) {
        pr.freed = true; pr.civilians[0].state = 'follow';
        this.colonyMessageV188('Élu libéré. Le ramener à l’extraction.', 4);
        this.advanceColonyPhaseV188();
      }
      // A convert who sees the marine raises the others nearby.
      for (const enemy of this.enemies || []) {
        if (!enemy.colonyCultistV188 || !enemy.alive) continue;
        const entry = pr.cultists.find(item => item.id === enemy.colonyCultistV188);
        if (entry && entry.state === 'patrol') entry.x = Math.round(enemy.x + enemy.w / 2);
        if (enemy.alert && entry && entry.state === 'patrol') {
          entry.state = 'hostile';
          for (const other of this.enemies) if (other.colonyCultistV188 && other.alive && Math.abs(other.x - enemy.x) < 420) other.alert = true;
          this.onEvent?.({ type: 'colony-cult-spotted-v188', convert: entry.id });
        }
      }
      this.stepColonyCiviliansV188(dt);
    }
    patrolColonyCultistV188(enemy, delta) {
      const dt = Math.max(0, Number(delta) || 0), home = enemy.colonyPatrolHomeV188 ?? enemy.x, actor = this.player;
      const next = enemy.x + (enemy.facing || 1) * 38 * dt;
      if (Math.abs(next + enemy.w / 2 - home) > R.cult.patrol) enemy.facing = -(enemy.facing || 1); else enemy.x = next;
      enemy.vx = 0; enemy.attacking = false;
      if (actor?.alive && !actor.ventTransit) {
        const dx = centre(actor) - (enemy.x + enemy.w / 2);
        if (Math.abs(dx) <= R.cult.sight && Math.sign(dx) === (enemy.facing || 1) && Math.abs(feet(actor) - feet(enemy)) < 60) enemy.alert = true;
      }
    }

    // —— Interactions ——
    colonyCandidatesV188(actor) {
      const level = this.colonyLevelV188;
      if (!level || !actor?.alive || actor.downed || actor.ventTransit) return [];
      const pr = level.progress, p = level.places, phase = this.colonyPhaseIdV188(), id = level.campaignId, list = [];
      const add = (key, x, y, prompt, extra = {}) => {
        if (!this.colonyInReachV188(actor, x, y, extra.reach)) return;
        list.push({ kind: 'colony-level-v188', category: 'action', key, target: { x: x - 20, y: y - 60, w: 40, h: 60 }, distance: Math.abs(centre(actor) - x), prompt, ...extra });
      };
      const hold = (key, x, y, verb) => {
        const value = pr[key] || 0, holding = level.runtime.holding?.key === key;
        add(key, x, y, holding && level.runtime.holding.paused ? `E  ${verb} · INTERROMPU ${Math.round(value * 100)} %` : value > 0 ? `E (MAINTENIR)  ${verb} · ${Math.round(value * 100)} %` : `E (MAINTENIR)  ${verb}`, { hold: true });
      };
      if (id === 'colony-c1') {
        if (phase === 'contain') hold('shutter', p.shutter.x + p.shutter.w / 2, p.floorY, 'BAISSER LE RIDEAU DE L’ENTREPÔT');
        if (phase === 'evacuate' && pr.civilians.some(entry => entry.state === 'wait')) add('escort', p.infirmary, p.floorY, 'E  ESCORTER LES PATIENTS VERS LA PLATE-FORME', { reach: 150 });
        if (phase === 'weld') {
          if (pr.weldA < 1) {
            const east = centre(actor) > p.airlockA;
            if (east) hold('weldA', p.airlockA, p.floorY, 'SOUDER LE SAS A');
            else add('weldA-side', p.airlockA, p.floorY, 'SOUDER DEPUIS LE CÔTÉ PLATE-FORME (EST)');
          } else if (pr.weldB < 1) hold('weldB', p.airlockB, p.floorY, 'SOUDER LE SAS B');
          for (const kit of pr.kits) if (!kit.taken) add(`kit:${kit.id}`, kit.x, p.floorY, 'E  PRENDRE UNE SENTINELLE UA 571-C', { reach: 60 });
        }
        if ((phase === 'weld' || phase === 'extract') && pr.carried > 0 && this.colonyOnRailV188(actor) && Math.abs(feet(actor) - p.floorY) < 6
          && !pr.turrets.some(turret => Math.abs(turret.x - centre(actor)) < R.turret.minGap)
          && Math.abs(centre(actor) - p.airlockA) > 110 && Math.abs(centre(actor) - p.airlockB) > 110 && !list.length) {
          list.push({ kind: 'colony-level-v188', category: 'action', key: 'deploy', target: { x: centre(actor) - 20, y: feet(actor) - 60, w: 40, h: 60 }, distance: 999, prompt: 'E  DÉPLOYER LA SENTINELLE ICI' });
        }
      }
      if (id === 'colony-c2') {
        if (phase === 'nest') hold('purge', p.nest.x, p.nest.y, 'ARMER LA PURGE THERMIQUE');
        if (phase === 'control') {
          pr.breakers.forEach((done, index) => { if (!done) add(`breaker:${index}`, p.breakers[index], p.decks.low, `E  RÉARMER LE DISJONCTEUR ${index + 1}/3`, { reach: 50 }); });
          if (pr.breakers.every(Boolean) && !pr.restarted) add('restart', p.console.x, p.console.y, 'E  RELANCER LE PROCESSEUR ATMOSPHÉRIQUE');
          else if (!pr.restarted) add('restart-locked', p.console.x, p.console.y, `CONSOLE · DISJONCTEURS ${pr.breakers.filter(Boolean).length}/3`);
        }
      }
      if (id === 'colony-c3') {
        if (phase === 'arrivals' && pr.civilians.some(entry => entry.state === 'wait')) add('welcome', p.arrivals[2], p.floorY, 'E  ACCUEILLIR LES RESCAPÉS DU M577', { reach: 170 });
        if (phase === 'scan' && !pr.civilians.some(entry => entry.state === 'scan') && pr.civilians.some(entry => entry.state === 'queue')) add('scan', p.scanner, p.floorY, 'E  CONTRÔLE BIOLOGIQUE · RESCAPÉ SUIVANT', { reach: 140 });
        for (const entry of pr.civilians) if (entry.state === 'scatter') add(`calm:${entry.id}`, entry.x, p.floorY, 'E  RASSURER LE RESCAPÉ', { reach: 70 });
        if (phase === 'carrier' && !pr.delivered) {
          const carrier = pr.civilians[pr.carrier];
          if (carrier?.state === 'follow' && Math.abs(carrier.x - p.noor) < 150) add('deliver', p.noor, p.floorY, 'E  CONFIER LE PORTEUR À NOOR OKAFOR', { reach: 120 });
        }
      }
      if (id === 'colony-c4') {
        if (phase === 'dormitories') {
          if (!pr.clues.log) add('clue:log', p.clues.log, p.floorY, 'E  LIRE LE JOURNAL DU SAS', { reach: 60 });
          if (!pr.clues.sign) add('clue:sign', p.clues.sign, p.floorY, 'E  EXAMINER L’INSCRIPTION', { reach: 70 });
          if (!pr.clues.seal) add('clue:seal', p.clues.seal, p.floorY, 'E  EXAMINER LE SCELLÉ DU CONDUIT', { reach: 60 });
        }
        if (!pr.lore && phase !== 'dormitories') add('lore', p.cache.x, p.cache.y, 'E  FOUILLER LE SAC CACHÉ', { reach: 60 });
        // Information only: why the walk ends here (the welded architecture), and where to go.
        for (const barrier of level.barriers || []) add(`barrier:${barrier.id}`, barrier.x + barrier.w / 2, barrier.floorY, barrier.requirement, { reach: 90 });
        if (phase === 'gathering') hold('resin', p.cocoon, p.floorY, 'DÉCOUPER LA RÉSINE DU COCON');
        for (const enemy of this.enemies || []) if (enemy.colonyCultistV188 && enemy.alive && (!enemy.alert || enemy.staggerClock > 0))
          add(`subdue:${enemy.colonyCultistV188}`, centre(enemy), feet(enemy), 'E  MAÎTRISER LE CONVERTI (NON LÉTAL)', { reach: R.cult.subdueReach });
      }
      return list;
    }
    interactionCandidatesV188(actor = this.player) {
      const list = super.interactionCandidatesV188(actor), mine = this.colonyCandidatesV188(actor);
      const ranked = mine.filter(entry => entry.key !== 'deploy').sort((a, b) => a.distance - b.distance);
      // A door the level owns (welded airlock, sealed gate) is not offered as a generic door action.
      const filtered = this.colonyLevelV188 ? list.filter(entry => !(entry.kind === 'door' && (entry.target?.colonyWeldV188 || entry.target?.colonySealedV188))
        && !(entry.kind === 'power' && this.colonyLevelV188.campaignId === 'colony-c2')) : list;
      return [...ranked, ...filtered, ...mine.filter(entry => entry.key === 'deploy')];
    }
    interact(actor = this.player) {
      const choice = this.colonyLevelV188 && this.mission?.state === 'active' ? this.selectInteractionTargetV188?.(actor) : null;
      if (choice?.kind === 'colony-level-v188') return this.performColonyInteractionV188(actor, choice);
      return super.interact(actor);
    }
    getInteractionPrompt(actor = this.player) {
      const choice = this.colonyLevelV188 && actor?.alive ? this.selectInteractionTargetV188?.(actor) : null;
      if (choice?.kind === 'colony-level-v188') return choice.prompt;
      return super.getInteractionPrompt(actor);
    }
    performColonyInteractionV188(actor, choice) {
      const level = this.colonyLevelV188, pr = level.progress, p = level.places, key = choice.key;
      const done = (message, seconds = 3) => { if (message) this.colonyMessageV188(message, seconds); this.setInteractionAnimation?.(actor, 'control-use', .6); this.audio?.ui?.(); return true; };
      if (choice.hold) {
        level.runtime.holding = { key, actor, paused: false };
        if (key === 'weldA' && p.securityGate) Object.assign(p.securityGate, { open: false, levelLocked: true, colonyWeldV188: Math.max(.001, pr.weldA) });
        if (key === 'weldA') pr.weldA = Math.max(.001, pr.weldA);
        this.setInteractionAnimation?.(actor, 'control-use', .6);
        return true;
      }
      if (key === 'escort') { pr.civilians.forEach(entry => { if (entry.state === 'wait') entry.state = 'follow'; }); return done('Lucia Ferro : « Ils peuvent marcher. Restez devant eux, pas trop vite. »', 5); }
      if (key.startsWith('kit:')) { const kit = pr.kits.find(entry => `kit:${entry.id}` === key); if (kit) { kit.taken = true; pr.carried += 1; } return done(`Sentinelle UA 571-C prise (${pr.carried}). E sur le rail pour la déployer.`); }
      if (key === 'deploy') {
        pr.carried -= 1;
        pr.turrets.push({ id: `turret-${pr.turrets.length + 1}`, x: Math.round(centre(actor) + (actor.facing >= 0 ? 30 : -30)), facing: actor.facing >= 0 ? 1 : -1, ammo: R.turret.ammo, clock: 0 });
        this.onEvent?.({ type: 'colony-sentry-deployed-v188', count: pr.turrets.length });
        return done('Sentinelle déployée.', 2);
      }
      if (key === 'weldA-side') return done('Souder le sas A depuis la plate-forme : passer à l’est de la porte.', 3);
      if (key.startsWith('barrier:')) return done('Soudé de l’autre côté. Les conduits mènent au rassemblement.', 3);
      if (key.startsWith('breaker:')) { pr.breakers[Number(key.split(':')[1])] = true; return done(`Disjoncteur réarmé (${pr.breakers.filter(Boolean).length}/3).`, 2); }
      if (key === 'restart') {
        pr.restarted = true;
        if (this.powerNode) this.powerNode.active = true;
        if (this.mission?.objectives) this.mission.objectives.power = true;
        this.onEvent?.({ type: 'power-restored' });
        this.colonyMessageV188('Processeur relancé. Surpression dans les conduits : remonter par la route éclairée !', 6);
        this.advanceColonyPhaseV188();
        return true;
      }
      if (key === 'restart-locked') return done('Réarmer d’abord les trois disjoncteurs.', 2);
      if (key === 'welcome') { pr.civilians.forEach(entry => { if (entry.state === 'wait') entry.state = 'follow'; }); return done('Les rescapés vous suivent jusqu’au poste de contrôle.', 4); }
      if (key === 'scan') { const next = pr.civilians.find(entry => entry.state === 'queue'); if (next) { next.state = 'scan'; level.runtime.scanClock = 0; } return done('Contrôle biologique en cours…', 2); }
      if (key.startsWith('calm:')) {
        const entry = pr.civilians.find(item => `calm:${item.id}` === key);
        // A screened survivor never goes back in the queue: the carrier waits (or follows), the others go to the ward.
        const phase = this.colonyPhaseIdV188();
        if (entry) entry.state = entry.result === 'carrier' ? (phase === 'carrier' ? 'follow' : 'hold') : entry.result === 'clear' ? 'ward'
          : entry.resume === 'wait' ? 'wait' : phase === 'arrivals' ? 'follow' : 'queue';
        return done('Rescapé rassuré.', 2);
      }
      if (key === 'deliver') {
        pr.delivered = true; pr.civilians[pr.carrier].state = 'noor';
        this.colonyMessageV188('Noor Okafor : « Je le prends. Bloc stérile, maintenant. » Rejoindre l’extraction.', 6);
        this.advanceColonyPhaseV188();
        return true;
      }
      if (key.startsWith('clue:')) {
        const clue = key.split(':')[1]; pr.clues[clue] = true;
        const text = { log: 'Journal du sas : ouvert de l’intérieur, 02 h 14, badge d’un colon.', sign: 'Peint à la main : « LES ÉLUS NE CRAIGNENT RIEN ».',
          seal: 'Scellé du conduit forcé à la main, résine fraîche sur la grille.' }[clue];
        return done(text, 5);
      }
      if (key === 'lore') { pr.lore = true; if (this.inventory) this.inventory.intel = (Number(this.inventory.intel) || 0) + 1; return done('Carnet d’un converti : « L’Hôte Parfait nous attend sous le port. » Le conduit s’arrête ici.', 6); }
      if (key.startsWith('subdue:')) {
        const name = key.split(':')[1], enemy = this.enemies.find(item => item.colonyCultistV188 === name), entry = pr.cultists.find(item => item.id === name);
        if (enemy) this.enemies = this.enemies.filter(item => item !== enemy);
        if (entry) { entry.state = 'subdued'; entry.x = Math.round(enemy ? centre(enemy) : entry.x); pr.cultSubdued += 1; }
        this.onEvent?.({ type: 'colony-cult-subdued-v188', convert: name });
        return done('Converti maîtrisé et menotté.', 2);
      }
      return false;
    }

    // —— Objectives and extraction ——
    colonyMissingV188() {
      const level = this.colonyLevelV188;
      if (!level) return '';
      const phase = this.colonyPhaseIdV188(), pr = level.progress;
      if (phase === 'extract') return level.campaignId === 'colony-c4' && !pr.freed ? 'ÉLU ENCORE PRISONNIER' : '';
      return {
        'colony-c1': { contain: 'ENTREPÔT NON CONFINÉ', evacuate: 'PATIENTS NON ÉVACUÉS', weld: 'SAS NON SOUDÉS' },
        'colony-c2': { gantry: 'PROCESSEUR NON ATTEINT', ducts: 'CONDUITS NON SÉCURISÉS', nest: 'NID NON PURGÉ', control: 'PROCESSEUR À L’ARRÊT' },
        'colony-c3': { arrivals: 'RESCAPÉS NON ACCUEILLIS', scan: 'CONTRÔLE BIOLOGIQUE INCOMPLET', carrier: 'PORTEUR NON CONFIÉ À NOOR' },
        'colony-c4': { dormitories: 'ENQUÊTE INCOMPLÈTE', vents: 'RASSEMBLEMENT NON TROUVÉ', gathering: 'ÉLU ENCORE PRISONNIER' }
      }[level.campaignId]?.[phase] || '';
    }
    missingObjectiveRequirement(options) { return this.colonyMissingV188() || super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.colonyMissingV188() || super.missingExtractionRequirement(); }
    doorRequirement(door) {
      if (door?.colonyWeldV188 >= 1) return 'SAS SOUDÉ';
      if (door?.colonyWeldV188 > 0) return 'SOUDURE EN COURS';
      if (door?.colonySealedV188) return 'SCELLÉ DE L’INTÉRIEUR';
      return super.doorRequirement(door);
    }
    admitNativeTerminalInteractionV156(actor, target) {
      if (this.colonyLevelV188?.campaignId === 'colony-c2' && target && target === this.powerNode) return false;
      return super.admitNativeTerminalInteractionV156 ? super.admitNativeTerminalInteractionV156(actor, target) : true;
    }
    admitMissionLevelHazardChangeV188(hazard, kind) {
      if (this.colonyLevelV188) return false;
      return super.admitMissionLevelHazardChangeV188 ? super.admitMissionLevelHazardChangeV188(hazard, kind) : true;
    }
    phaseLabel() {
      const level = this.colonyLevelV188;
      if (!level) return super.phaseLabel();
      return COLONY_LEVEL_PHASES_V188[level.campaignId][level.phase].label.fr.toUpperCase();
    }
    objectivePanelContentV188(language) {
      const level = this.colonyLevelV188;
      if (!level) return super.objectivePanelContentV188?.(language) || null;
      const lang = language === 'en' ? 'en' : 'fr';
      return { steps: COLONY_LEVEL_PHASES_V188[level.campaignId].map((entry, index) => ({ key: entry.id, label: entry.label[lang],
        done: index < level.phase || (entry.id === 'extract' && Boolean(this.mission?.objectives?.extract)) })) };
    }
    /** Read by the app when the operation is resolved (C4 stability cost). */
    colonyLevelResultV188() {
      const level = this.colonyLevelV188;
      if (!level) return null;
      const pr = level.progress;
      return Object.freeze({ campaignId: level.campaignId, phase: this.colonyPhaseIdV188(), cultKilled: pr.cultKilled || 0, cultSubdued: pr.cultSubdued || 0,
        lore: Boolean(pr.lore), scatters: pr.scatters || 0, turrets: pr.turrets?.length || 0 });
    }
    getSnapshot() {
      const snapshot = super.getSnapshot(), level = this.colonyLevelV188;
      if (!level) return snapshot;
      return { ...snapshot, colonyLevelV188: { campaignId: level.campaignId, phase: this.colonyPhaseIdV188(), checkpoint: level.checkpointId,
        progress: clone(level.progress), missing: this.colonyMissingV188(), corridor: this.missionDepthSectionV188?.id || null,
        noorPosted: Boolean(level.noorPosted), vehicleStowed: COLONY_STREET_NO_APC_IDS_V188.includes(level.campaignId) ? !this.vehicle?.active : null,
        barriers: (level.barriers || []).map(entry => ({ id: entry.id, x: entry.x, y: entry.y, w: entry.w, h: entry.h })) } };
    }

    // —— Drawing ——
    drawWorld(ctx) {
      const level = this.colonyLevelV188;
      if (level && ctx) { ctx.save(); try { this.drawColonyWallArtV188(ctx); } finally { ctx.restore(); } }
      return super.drawWorld(ctx);
    }
    /** Back-wall art, before platforms, doors and actors. */
    drawColonyWallArtV188(ctx) {
      const level = this.colonyLevelV188, p = level.places, pr = level.progress, id = level.campaignId, time = this.mission?.elapsed || 0;
      if (id === 'colony-c1') {
        drawColonyLevelSlotV188(ctx, 'colony-qz17-04-container', p.container, p.floorY);
        drawColonyLevelSlotV188(ctx, 'colony-warehouse-shutter', p.shutter.x, p.floorY, { w: p.shutter.w, h: p.shutter.h, progress: pr.shutter });
        drawColonyLevelSlotV188(ctx, 'colony-infirmary-front', p.infirmary - 110, p.floorY - 6);
        drawColonyLevelSlotV188(ctx, 'colony-north-airlock', p.airlockB - 46, p.floorY);
        if (pr.weldB > 0) drawColonyLevelSlotV188(ctx, 'colony-airlock-weld', p.airlockB - 32, p.floorY, { progress: pr.weldB });
      }
      if (id === 'colony-c2') {
        drawColonyLevelSlotV188(ctx, 'colony-heat-exchanger', p.exchangers.x - 90, p.exchangers.y);
        drawColonyLevelSlotV188(ctx, 'colony-nest-resin', p.nest.x - 102, p.nest.y, { burnt: pr.purge >= 1 });
        p.breakers.forEach((x, index) => drawColonyLevelSlotV188(ctx, 'colony-breaker', x - 15, p.decks.low - 40, { done: pr.breakers[index] }));
        if (this.colonyPhaseIdV188() === 'extract') p.route.forEach(([x, y], index) => drawGuideLightV188(ctx, x, y - 120, time, index));
      }
      if (id === 'colony-c3') {
        // The M577 that brought the survivors, to scale, parked on the quay apron behind the marines' lane (scenery, no collider):
        // drawn before the dropship and the actors, so the UD-4L landing in front of it never intersects it.
        drawColonyM577V188(ctx, p.m577, p.floorY, -1);
        drawColonyLevelSlotV188(ctx, 'colony-scanner-arch', p.scanner - 51, p.floorY, { tone: pr.civilians.some(entry => entry.state === 'scan') ? 'scan' : pr.revealedAt !== null ? 'alarm' : 'idle' });
        drawColonyLevelSlotV188(ctx, 'colony-infirmary-front', p.streetB - 110, p.floorY - 6);
      }
      if (id === 'colony-c4') {
        drawColonyLevelSlotV188(ctx, 'colony-airlock-log', p.clues.log - 20, p.floorY - 70, { text: '02:14' });
        drawColonyLevelSlotV188(ctx, 'colony-cult-sign', p.clues.sign - 51, p.floorY - 120);
        drawColonyLevelSlotV188(ctx, 'colony-tampered-seal', p.clues.seal - 25, p.floorY - 50);
        if (!pr.lore) drawColonyLevelSlotV188(ctx, 'colony-lore-cache', p.cache.x - 23, p.cache.y);
        drawColonyLevelSlotV188(ctx, 'colony-cocoon-elu', p.cocoon - 30, p.floorY - 6, { freed: pr.freed });
        for (const barrier of level.barriers || []) drawColonyLevelSlotV188(ctx, barrier.slot, barrier.x, barrier.floorY, { w: barrier.w, h: barrier.h });
      }
    }
    /** People and door-attached art, after doors and before the marines (the native authored-people hook). */
    drawForgeNpcsV158(ctx) {
      super.drawForgeNpcsV158?.(ctx);
      const level = this.colonyLevelV188;
      if (!level || !ctx) return;
      const p = level.places, pr = level.progress, id = level.campaignId, time = this.mission?.elapsed || 0;
      ctx.save();
      try {
        if (id === 'colony-c1') {
          drawColonyLevelSlotV188(ctx, 'colony-npc-lucia', p.lucia - 21, p.floorY);
          if (p.securityGate && pr.weldA > 0) drawColonyLevelSlotV188(ctx, 'colony-airlock-weld', p.securityGate.x + p.securityGate.w / 2 - 32, p.floorY, { progress: pr.weldA });
          for (const kit of pr.kits) if (!kit.taken) drawColonyLevelSlotV188(ctx, 'colony-sentry-ua571c', kit.x - 20, p.floorY, { w: 40, h: 40, facing: 1 });
          for (const turret of pr.turrets) drawColonyLevelSlotV188(ctx, 'colony-sentry-ua571c', turret.x - 28, p.floorY, { facing: turret.facing, ammo: turret.ammo });
          for (const turret of pr.turrets) if (turret.firing > 0) { ctx.fillStyle = '#ffe2a0'; ctx.fillRect(turret.x + turret.facing * 34, p.floorY - 46, turret.facing * 12, 3); }
        }
        if (id === 'colony-c2' && level.runtime.holding?.key === 'purge' && !level.runtime.holding.paused) drawWeldSparksV188(ctx, p.nest.x, p.nest.y - 50, time, 1.5);
        if (id === 'colony-c3') {
          drawColonyLevelSlotV188(ctx, 'colony-npc-noor', p.noor - 21, p.floorY);
        }
        if (id === 'colony-c4') for (const entry of pr.cultists) if (entry.state === 'subdued') {
          ctx.fillStyle = '#5a4d44'; ctx.fillRect(entry.x - 14, p.floorY - 34, 28, 34); ctx.fillStyle = '#c9a54a'; ctx.fillRect(entry.x - 10, p.floorY - 20, 20, 3);
        }
        for (const entry of pr.civilians || []) {
          if (id === 'colony-c4' && entry.state === 'cocoon') continue;
          const pose = entry.state === 'scatter' ? 'run' : entry.state === 'hold' || (entry.state === 'scan' && entry.result === null && level.runtime.scanClock > 0) ? 'cower' : entry.moving ? 'walk' : 'idle';
          const z = this.missionDepthSectionV188 ? entry.z : 0, feetY = p.floorY + depthToScreenOffsetV188(z);
          drawColonyCivilianV188(ctx, { x: entry.x, feetY, row: entry.row, pose: entry.state === 'scatter' && !entry.moving ? 'cower' : pose, facing: entry.facing || 1,
            tint: entry.result === 'carrier' ? '#e15b4f' : null });
        }
        const holding = level.runtime.holding;
        if (holding && !holding.paused && Number.isFinite(holding.x) && level.sparks > 0 && ['weldA', 'weldB', 'resin', 'shutter'].includes(holding.key))
          drawWeldSparksV188(ctx, holding.x, p.floorY - 60, time, holding.key === 'shutter' ? .4 : 1);
      } finally { ctx.restore(); }
    }
    drawPowerNode(ctx) {
      const level = this.colonyLevelV188;
      if (level?.campaignId !== 'colony-c2') return super.drawPowerNode(ctx);
      const p = level.places;
      drawColonyLevelSlotV188(ctx, 'colony-restart-console', p.console.x - 38, p.console.y, { ready: level.progress.breakers.every(Boolean), done: level.progress.restarted });
    }
    drawForeground(ctx) {
      super.drawForeground(ctx);
      const level = this.colonyLevelV188;
      if (level?.campaignId !== 'colony-c4' || !ctx || !this.player) return;
      // Night in the habitat: the marine's lamp, darker in the dormitories (screen space).
      const p = level.places, dark = centre(this.player) >= p.dormitories.x0 && centre(this.player) <= p.dormitories.x1 ? .72 : .5;
      const sx = centre(this.player) - (this.camera?.x || 0), sy = this.player.y + 30 - (this.camera?.y || 0);
      ctx.save();
      const gradient = ctx.createRadialGradient?.(sx, sy, 60, sx, sy, 320);
      if (gradient) { gradient.addColorStop(0, 'rgba(2,4,6,0)'); gradient.addColorStop(1, `rgba(2,4,6,${dark})`); ctx.fillStyle = gradient; }
      else ctx.fillStyle = `rgba(2,4,6,${dark * .6})`;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }
    /** HUD lines of the level: the first one is the objective box's progress line. */
    colonyHudLinesV188() {
      const level = this.colonyLevelV188, pr = level.progress, id = level.campaignId, phase = this.colonyPhaseIdV188(), lines = [];
      if (id === 'colony-c1') {
        if (phase === 'contain') lines.push(`RIDEAU ${Math.round(pr.shutter * 100)} %`);
        if (phase === 'evacuate') lines.push(`PATIENTS SUR LA PLATE-FORME ${pr.civilians.filter(entry => entry.state === 'safe').length}/3`);
        if (phase === 'weld') lines.push(`SAS A ${Math.round(pr.weldA * 100)} % · SAS B ${Math.round(pr.weldB * 100)} %`);
        if (pr.carried > 0) lines.push(`SENTINELLES À DÉPLOYER ${pr.carried}`);
        for (const turret of pr.turrets) if (turret.ammo <= 40) lines.push(`SENTINELLE ${turret.id.split('-')[1]} · MUNITIONS ${Math.max(0, turret.ammo)}`);
      }
      if (id === 'colony-c2' && phase === 'control') lines.push(`DISJONCTEURS ${pr.breakers.filter(Boolean).length}/3`);
      if (id === 'colony-c2' && phase === 'nest') lines.push(`PURGE ${Math.round(pr.purge * 100)} %`);
      if (id === 'colony-c3') {
        if (phase === 'scan') lines.push(`CONTRÔLÉS ${pr.scanned}/5`);
        if (pr.hatchRemaining !== null && !pr.delivered) lines.push(`ÉCLOSION ESTIMÉE ${Math.floor(pr.hatchRemaining / 60)}:${String(Math.floor(pr.hatchRemaining % 60)).padStart(2, '0')}`);
      }
      if (id === 'colony-c4') {
        if (phase === 'dormitories') lines.push(`INDICES ${Object.values(pr.clues).filter(Boolean).length}/3`);
        if (phase === 'gathering') lines.push(`COCON ${Math.round(pr.resin * 100)} %`);
        if (pr.cultKilled) lines.push(`CONVERTIS TUÉS ${pr.cultKilled} · STABILITÉ ${colonyCultStabilityCostV188(pr.cultKilled)}`);
      }
      if (!lines.length) lines.push(this.colonyMissingV188() || 'EXTRACTION DISPONIBLE');
      return lines;
    }
    objectiveProgressText() {
      return this.colonyLevelV188 ? this.colonyHudLinesV188()[0] : super.objectiveProgressText();
    }
    drawHud(ctx) {
      super.drawHud(ctx);
      const level = this.colonyLevelV188;
      if (!level || !ctx || this.mission?.state !== 'active') return;
      const pr = level.progress, id = level.campaignId;
      ctx.save();
      try {
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        const lines = this.colonyHudLinesV188().slice(1);
        if (id === 'colony-c3') {
          ctx.fillStyle = 'rgba(4,12,9,.75)'; ctx.fillRect(540, 160, 200, 10);
          ctx.fillStyle = pr.panic > 70 ? '#e15b4f' : '#d5b562'; ctx.fillRect(540, 160, 200 * pr.panic / R.panic.threshold, 10);
          ctx.font = '700 10px monospace'; ctx.fillStyle = '#d8e6d8'; ctx.fillText('PANIQUE', 640, 157);
        }
        const holding = level.runtime.holding;
        if (holding) {
          const value = pr[holding.key] || 0;
          ctx.fillStyle = 'rgba(4,12,9,.85)'; ctx.fillRect(490, 560, 300, 14);
          ctx.fillStyle = holding.paused ? '#e15b4f' : '#e0a33a'; ctx.fillRect(490, 560, 300 * value, 14);
          ctx.font = '700 11px monospace'; ctx.fillStyle = '#d8e6d8';
          ctx.fillText(holding.paused ? `INTERROMPU · ${Math.round(value * 100)} %` : `${Math.round(value * 100)} %`, 640, 554);
        }
        ctx.font = '700 12px monospace';
        lines.forEach((line, index) => { ctx.fillStyle = '#e2d6a8'; ctx.fillText(line, 640, 190 + index * 16); });
        if (level.message) {
          ctx.font = '14px sans-serif'; const width = Math.min(1100, (ctx.measureText?.(level.message.text)?.width || level.message.text.length * 7) + 40);
          ctx.fillStyle = 'rgba(4,12,9,.82)'; ctx.fillRect(640 - width / 2, 600, width, 28);
          ctx.fillStyle = '#d8e6d8'; ctx.fillText(level.message.text, 640, 619);
        }
      } finally { ctx.restore(); }
    }
  };
}
