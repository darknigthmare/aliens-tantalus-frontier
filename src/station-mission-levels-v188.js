// V188 — dedicated levels of the Asphodèle station missions S1-S4 (bible §7.2, §7.4,
// §42; spec 009). A layer on top of the generated `ship-interior-vertical` template the
// four missions already use, built like the colony levels (colony-mission-levels-v188.js).
// Ids, titles, campaign objectives, rewards, the `stationV188` save field, the access
// chain (intro → S1 → S2 → CASSIUS decision → S3 → S4), the CASSIUS decision itself
// (`chooseCassiusV188`, taken once at the Command table after S2), the return scenes and
// the dossier pieces are not touched: the layer only replaces the generic encounter
// (template roster, generator loop, archive terminal) with authored phases, then fulfils
// the existing objective runtime the way its phases say (board / restore / escape / hold).
//
// The intro « Six heures de silence » (`station-intro-silence`) is not a mission: it is the
// end of Rook's quest and CIN-70, played aboard the Tantalus. It has no level.
//
// Rules shared by the four levels [PROPOSÉ] (1 m ≈ 51 px, marine 44 × 92 px), the same as
// the colony levels: every hostile spawn appears behind a 900 px safe zone (never closer
// to a marine on the same deck) and waits 4 s (grace); each phase writes one checkpoint
// when it starts, and a resume or a retry lands there with the phase as it began (resume
// field `stationLevelV188`); a held interaction (E) advances while held in reach, a hit
// pauses it without resetting it.
//
// Level checklist (AGENTS.md): the station ducts are sealed (no V62 traversal), and two
// sealed frames continue the bulkheads on the upper decks — the hull seal above the cargo
// bulkhead (top deck) and the welded grate over the junction ladder (mid deck) — so that
// every bulkhead of the low deck is the one way through its section, for the marine and
// for creatures (logical check: stationAccessV188; physical check: the walls themselves).
//
// Fidelity (no 1:1 claim; documented / adapted / to define):
// - documented: Seegson stations and their obedient management system, manual airlock
//   cycling, motion tracker fooled by moving air, the riveted corridors (Alien: Isolation,
//   2014, Sevastopol; environment art direction published by Paul Abbott); the motion
//   tracker, helmet cameras and a lost team (Aliens, 1986); eggs and a facehugger leap
//   (Alien, 1979; Aliens, 1986); resin nests over the walls (Aliens, 1986);
// - adapted by the project: Asphodèle, CASSIUS, Echo-8, Sergeant Kessler, Grue and the
//   Crucible salvagers (project creations), the QZ17 transit laboratory and its cradles,
//   the power routing (two feeds for three circuits), the seal countdown of S3;
// - to define: final art of the placeholder slots (station-level-art-v188.js), voices of
//   CASSIUS and Idris Kwan.
import { stationLevelPlacesV188 } from './station-level-places-v188.js';
import { drawStationLevelSlotV188, STATION_LEVEL_REUSED_PNGS_V188 } from './station-level-art-v188.js';
import { normalizeStationV188 } from './station-asphodele-v188.js';
import { asphodeleMissionLayoutV188, drawAsphodeleMissionSlotV188, drawAsphodeleHazardBandV188, ASPHODELE_MISSION_SLOT_IDS_V188 } from './asphodele-mission-dressing-v188.js';
import { AsphodeleHubAssetLoaderV188 } from './asphodele-hub-slots-v188.js';
import { CASSIUS_INTERROGATION_V188 } from './confrontation-entries-v188.js';

export const STATION_LEVEL_IDS_V188 = Object.freeze(['station-s1', 'station-s2', 'station-s3', 'station-s4']);
/** Spec 010 hearing played in S2, after the reactor restart and before the existing CASSIUS decision. */
export const STATION_CASSIUS_HEARING_ID_V188 = CASSIUS_INTERROGATION_V188.id;
export const isStationLevelCampaignV188 = id => STATION_LEVEL_IDS_V188.includes(typeof id === 'string' ? id : id?.id);

/** [PROPOSÉ] timings, counts and distances of the dedicated station levels. */
export const STATION_LEVEL_RULES_V188 = Object.freeze({
  pxPerMetre: 51, marine: Object.freeze({ w: 44, h: 92 }), safeZonePx: 900, graceSeconds: 4,
  reach: 76, damagePause: .9,
  holds: Object.freeze({ crank: 4, force: 5, reactor: 5, orders: 3, code: 3, forceAirlock: 6, burn: 2, purge: 5, valve: 3 }),
  egg: Object.freeze({ trigger: 100, opening: 1.5, damage: 22 }),
  sealSeconds: 150, holdSeconds: 60,
  darkness: Object.freeze({ s1: .62, s1Power: .4, s3: .58, s3Lights: .2 })
});
const R = STATION_LEVEL_RULES_V188;
const SOURCES = Object.freeze({ drone: 'enemy-004-drone-big-chap', warrior: 'enemy-005-warrior', salvager: 'enemy-046-colonial-raider' });
const t = (fr, en) => Object.freeze({ fr, en });

/** Phases of each level, in order (labels FR + EN; the HUD draws FR through the reviewed catalog). */
export const STATION_LEVEL_PHASES_V188 = Object.freeze({
  'station-s1': Object.freeze([
    Object.freeze({ id: 'dock', label: t('Cycler le sas d’arrimage à la main', 'Cycle the docking airlock by hand') }),
    Object.freeze({ id: 'ring', label: t('Traverser l’anneau éteint', 'Cross the dark ring') }),
    Object.freeze({ id: 'control', label: t('Atteindre le pont de contrôle', 'Reach the control deck') }),
    Object.freeze({ id: 'extract', label: t('Rejoindre le dropship du Tantalus', 'Reach the Tantalus dropship') })
  ]),
  'station-s2': Object.freeze([
    Object.freeze({ id: 'sectors', label: t('Réarmer les trois disjoncteurs de secteur', 'Reset the three sector breakers') }),
    Object.freeze({ id: 'reactor', label: t('Relancer le réacteur auxiliaire', 'Restart the auxiliary reactor') }),
    Object.freeze({ id: 'cassius', label: t('Interroger CASSIUS', 'Question CASSIUS') }),
    Object.freeze({ id: 'extract', label: t('Rejoindre le dropship du Tantalus', 'Reach the Tantalus dropship') })
  ]),
  'station-s3': Object.freeze([
    Object.freeze({ id: 'airlock3', label: t('Ouvrir le sas 3 des ponts inférieurs', 'Open airlock 3 of the lower decks') }),
    Object.freeze({ id: 'lab', label: t('Fouiller le laboratoire de transit', 'Search the transit laboratory') }),
    Object.freeze({ id: 'routing', label: t('Router l’énergie vers les sas', 'Route power to the airlocks') }),
    Object.freeze({ id: 'escape', label: t('Retrouver la trace d’Echo-8', 'Find Echo-8’s last trace') }),
    Object.freeze({ id: 'extract', label: t('Sortir avant la fermeture de la quarantaine', 'Get out before the quarantine closes') })
  ]),
  'station-s4': Object.freeze([
    Object.freeze({ id: 'nest', label: t('Purger le dernier nid', 'Purge the last nest') }),
    Object.freeze({ id: 'pressure', label: t('Remettre la station en pression', 'Repressurise the station') }),
    Object.freeze({ id: 'hold', label: t('Tenir le quai jusqu’à l’équipe technique', 'Hold the dock until the technical team') }),
    Object.freeze({ id: 'extract', label: t('Rejoindre la navette au quai', 'Reach the shuttle at the dock') })
  ])
});
export const stationLevelPhaseIdsV188 = campaignId => (STATION_LEVEL_PHASES_V188[campaignId] || []).map(entry => entry.id);

/** The sealed frames of the upper decks (same for the four levels). Edge ids of the ship template graph. */
export const STATION_BARRIERS_V188 = Object.freeze([
  Object.freeze({ id: 'station-hull-seal-v188', slot: 'station-airlock3-seal', edgeId: 'ship-e16', deck: 'top', requirement: 'CLOISON DE COQUE SCELLÉE · PASSER PAR LE PONT INFÉRIEUR' }),
  Object.freeze({ id: 'station-junction-grate-v188', slot: 'station-airlock3-seal', edgeId: 'ship-e13', deck: 'mid', requirement: 'GRILLE DU PUITS SOUDÉE · PASSER PAR LA CLOISON ARRIÈRE' })
]);
const VENT_SEALED = 'CONDUIT SCELLÉ · QUARANTAINE DE LA STATION';

/** Player text of the levels (FR drawn, EN through the reviewed catalog). */
export const STATION_LEVEL_TEXT_V188 = Object.freeze({
  // S1
  s1Start: t('Le sas d’Echo-8 est sans courant. Le cycler à la main, puis entrer dans l’anneau.', 'Echo-8’s airlock has no power. Cycle it by hand, then enter the ring.'),
  crankDone: t('Sas cyclé. Derrière, l’anneau extérieur est éteint ; les ventilateurs tournent encore.', 'Airlock cycled. Beyond it the outer ring is dark; the fans still run.'),
  traceBarricade: t('Barricade d’Echo-8 : « E-8 · 05:52 » à la craie, munitions vides au pied.', 'Echo-8 barricade: « E-8 · 05:52 » in chalk, empty magazines at its foot.'),
  traceChalk: t('Six traits de craie sur la cloison : six heures, puis plus rien.', 'Six chalk strokes on the bulkhead: six hours, then nothing.'),
  negotiate: t('Grue (radio) : « Passez, marines. L’anneau est à nous, la station est à vous. » Les récupérateurs ouvrent la cloison.', 'Grue (radio): "Go through, marines. The ring is ours, the station is yours." The salvagers open the bulkhead.'),
  forced: t('Cloison forcée. Les récupérateurs se replient vers l’arrière… et reviennent armés.', 'Bulkhead forced. The salvagers fall back aft… and come back armed.'),
  salvagersNeed: t('Les récupérateurs gardent la cloison : négocier ou la forcer.', 'The salvagers guard the bulkhead: negotiate or force it.'),
  emergency: t('Alimentation de secours du pont rétablie. Le reste de la station reste éteint : Idris Kwan prépare la relance.', 'Control deck emergency power restored. The rest of the station stays dark: Idris Kwan prepares the restart.'),
  // S2
  s2Start: t('Idris Kwan (radio) : « Trois disjoncteurs de secteur, puis le réacteur. Je vous guide. »', 'Idris Kwan (radio): "Three sector breakers, then the reactor. I’ll guide you."'),
  breakerOne: t('Kwan : « Un secteur en ligne. Les deux autres : galerie de l’anneau et passerelle de coque, au-dessus des quais. »', 'Kwan: "One sector online. The other two: the ring gallery and the hull walkway, above the docks."'),
  breakerTwo: t('Kwan : « Deux secteurs en ligne. Plus qu’un. »', 'Kwan: "Two sectors online. One left."'),
  breakersDone: t('Kwan : « Trois secteurs en ligne. La cloison de l’anneau est déverrouillée : direction le réacteur. »', 'Kwan: "Three sectors online. The ring bulkhead is unlocked: head for the reactor."'),
  reactorDone: t('Réacteur relancé, air en circulation. CASSIUS se réveille au pont de contrôle.', 'Reactor restarted, air circulating. CASSIUS wakes on the control deck.'),
  hearingOpen: t('L’interrogatoire de CASSIUS commence : lui opposer les pièces du dossier QZ17, ou se taire.', 'The interrogation of CASSIUS begins: confront it with the pieces of the QZ17 file, or stay silent.'),
  hearingPaused: t('Interrogatoire suspendu. Il reprendra à la consigne suivante.', 'Interrogation suspended. It will resume at the next directive.'),
  orders: t('Ordres de livraison QZ17 archivés copiés au dossier. La décision sur CASSIUS se prendra au Commandement.', 'Archived QZ17 delivery orders copied to the file. The decision on CASSIUS will be taken at Command.'),
  // S3
  airlockRewrite: t('CASSIUS : « Les vivants d’abord. J’ouvre le sas 3. »', 'CASSIUS: "The living first. Opening airlock 3."'),
  airlockRestrain: t('Code manuel accepté. Le sas 3 s’ouvre sur les ponts inférieurs.', 'Manual code accepted. Airlock 3 opens onto the lower decks.'),
  airlockForced: t('Sas 3 forcé à la main. Sans CASSIUS, plus rien ne retient ce qui est en bas.', 'Airlock 3 forced by hand. Without CASSIUS nothing holds back what is below.'),
  log: t('Journaux des survivants : Solène Ivarsson tient le compte des rations. Les entrées s’arrêtent au quatrième jour.', 'Survivors’ logs: Solène Ivarsson counts the rations. The entries stop on the fourth day.'),
  cradles: t('Berceaux QZ17 ouverts de l’intérieur, sangles coupées. Le conteneur endommagé est passé par ici.', 'QZ17 cradles opened from inside, restraints cut. The damaged container came through here.'),
  labDone: t('Le laboratoire est fouillé. La cloison arrière s’ouvre : il faut de l’énergie pour les sas.', 'The laboratory is searched. The aft bulkhead opens: the airlocks need power.'),
  eggWarning: t('Un œuf s’ouvre. Reculer !', 'An egg is opening. Back off!'),
  eggHit: t('Un parasite jaillit de l’œuf : le casque l’arrête de justesse.', 'A parasite leaps from the egg: the helmet stops it just in time.'),
  eggBurnt: t('Œuf brûlé.', 'Egg burnt.'),
  routedLights: t('Énergie routée : sas et éclairage. La ventilation reste coupée ; le compte à rebours de CASSIUS démarre.', 'Power routed: airlocks and lights. Ventilation stays off; CASSIUS’s countdown starts.'),
  routedVents: t('Énergie routée : sas et ventilation. Les conduits sont fermés, l’éclairage reste coupé ; le compte à rebours démarre.', 'Power routed: airlocks and ventilation. The ducts are closed, the lights stay off; the countdown starts.'),
  tag: t('La plaque du sergent Dario Kessler et le dernier enregistrement d’Echo-8. Sortir, vite.', 'Sergeant Dario Kessler’s tag and Echo-8’s last recording. Get out, fast.'),
  resealed: t('La quarantaine se referme sur les ponts inférieurs.', 'The quarantine closes over the lower decks.'),
  // S4
  s4Start: t('Dernière purge : le nid du puits de jonction. Ensuite, remise en pression et quai.', 'Last purge: the nest of the junction shaft. Then repressurisation and the dock.'),
  nestDone: t('Nid purgé. Trois vannes de secteur à ouvrir pour remettre la station en pression.', 'Nest purged. Three sector valves to open to repressurise the station.'),
  valve: t('Vanne ouverte, le secteur se remet en pression.', 'Valve open, the sector repressurises.'),
  pressureDone: t('Station en pression. Tenir le quai : la navette de l’équipe technique s’arrime.', 'Station pressurised. Hold the dock: the technical team’s shuttle is docking.'),
  arrived: t('L’équipe technique du Tantalus est à bord. Asphodèle est reprise.', 'The Tantalus technical team is aboard. Asphodèle is retaken.'),
  arrivedGrue: t('L’équipe technique du Tantalus et les récupérateurs de Grue sont à bord. Asphodèle est reprise.', 'The Tantalus technical team and Grue’s salvagers are aboard. Asphodèle is retaken.'),
  dockOpen: t('CLOISON DU QUAI MAINTENUE OUVERTE POUR L’ARRIMAGE', 'DOCK BULKHEAD HELD OPEN FOR DOCKING'),
  // Shared
  sealedFrame: t('Scellé de l’autre côté. Le chemin passe par le pont inférieur.', 'Sealed from the other side. The way goes through the lower deck.'),
  ventSealed: t(VENT_SEALED, 'DUCT SEALED · STATION QUARANTINE')
});
const TX = key => STATION_LEVEL_TEXT_V188[key].fr;

// —— Pure rules ——
/** One step of a held interaction: advances only while held, in reach and not hit recently; never resets. */
export function stepStationHoldV188(progress, { held = false, inReach = false, sinceHit = Infinity, dt = 0, seconds = 1 } = {}) {
  const value = Math.max(0, Math.min(1, Number(progress) || 0));
  const paused = !held || !inReach || sinceHit < R.damagePause;
  return { progress: paused ? value : Math.min(1, value + Math.max(0, dt) / Math.max(.1, seconds)), paused };
}
/** A spawn x on a deck: at least the safe zone away from every marine on that deck, on the preferred side first. */
export function stationSpawnXV188({ marines = [], side = 'east', deck = { x0: 0, x1: 5200 }, offset = 0, blocked = () => false } = {}) {
  const centres = marines.map(entry => entry.x);
  const tries = side === 'west' ? ['west', 'east'] : ['east', 'west'];
  for (const direction of tries) {
    const base = centres.length ? (direction === 'west' ? Math.min(...centres) : Math.max(...centres)) : (deck.x0 + deck.x1) / 2;
    const x = Math.round(base + (direction === 'west' ? -1 : 1) * (R.safeZonePx + 40 + offset));
    if (x < deck.x0 || x > deck.x1) continue;
    if (centres.some(entry => Math.abs(entry - x) < R.safeZonePx)) continue;
    if (blocked(x)) continue;
    return x;
  }
  return null;
}
/** S3: how airlock 3 opens, from the CASSIUS decision recorded after S2 (bible §7.2: erased → forced, more dangerous). */
export function stationAirlock3ModeV188(cassius) {
  return cassius === 'rewrite' ? 'ask' : cassius === 'restrain' ? 'code' : 'force';
}
/** S3: one step of an egg (closed → opening while a marine is near → spent after the leap; burnt by a held E). */
export function stepStationEggV188(egg, { near = false, dt = 0 } = {}) {
  const next = { ...egg };
  if (next.state === 'spent' || next.state === 'burnt') return { egg: next, leap: false };
  if (near) { next.state = 'opening'; next.clock = (Number(next.clock) || 0) + Math.max(0, dt); }
  const leap = next.state === 'opening' && near && next.clock >= R.egg.opening;
  if (leap) { next.state = 'spent'; next.clock = 0; }
  return { egg: next, leap };
}

const clone = value => JSON.parse(JSON.stringify(value));
const centre = actor => actor.x + (actor.w || 0) / 2;
const feet = actor => actor.y + (actor.h || 0);

/** Logical access: which template nodes the marine reaches from the drop (sealed ducts, locked bulkheads and the sealed frames removed). */
export function stationAccessV188(engine) {
  const graph = engine?.missionLevelRuntime?.graph, level = engine?.stationLevelV188;
  if (!graph) return null;
  const closed = new Set((engine.doors || []).filter(door => door.stationLockV188).map(door => door.edgeId));
  const barred = new Set((level?.barriers || []).map(entry => entry.edgeId));
  const links = new Map(graph.nodes.map(node => [node.id, []]));
  for (const edge of graph.edges) if (!closed.has(edge.id) && !barred.has(edge.id) && edge.kind !== 'vent') { links.get(edge.from)?.push(edge.to); links.get(edge.to)?.push(edge.from); }
  const start = graph.nodes.find(node => node.anchor === 'spawn')?.id;
  const seen = new Set(start ? [start] : []), queue = [...seen];
  while (queue.length) for (const next of links.get(queue.shift()) || []) if (!seen.has(next)) { seen.add(next); queue.push(next); }
  return Object.freeze({ reached: Object.freeze([...seen]), control: seen.has('ship-bridge'), extraction: seen.has('ship-extraction') });
}

function initialProgress(campaignId, places) {
  if (campaignId === 'station-s1') return { crank: 0, traces: { barricade: false, chalk: false }, salvagers: null, force: 0, emergency: false };
  if (campaignId === 'station-s2') return { breakers: { dock: false, ring: false, hull: false }, reactor: 0, hearing: null, orders: 0 };
  if (campaignId === 'station-s3') return { airlock: 0, airlockOpen: false, log: false, cradles: false, eggs: places.eggs.map((x, index) => ({ id: `egg-${index + 1}`, x, state: 'closed', clock: 0, burn: 0 })),
    eggHits: 0, routes: [], sealRemaining: null, tag: false };
  return { purge: 0, valves: { junction: 0, habitation: 0, ring: 0 }, holdRemaining: R.holdSeconds, arrived: false };
}

export function withStationMissionLevelsV188(Base) {
  if (Base.stationMissionLevelsV188) return Base;
  return class StationMissionLevelsV188 extends Base {
    static stationMissionLevelsV188 = true;

    start(options = {}) {
      this.stationLevelV188 = null;
      const result = super.start(options);
      const campaignId = options.campaign?.id || null;
      if (!isStationLevelCampaignV188(campaignId) || !this.missionLevelRuntime || this.editorMode) return result;
      const places = stationLevelPlacesV188(this, campaignId);
      if (!places?.doors?.dock || !places.doors.cargo || !places.doors.aft) return result;
      const save = options.narrativeArchiveSave || null;
      const progress = initialProgress(campaignId, places);
      this.stationLevelV188 = { schema: 188, campaignId, places, phase: 0, progress, snapshot: null, checkpointId: null,
        cassius: normalizeStationV188(save?.stationV188).cassius, grueAllied: save?.colonyMissionsV188?.grue === 'accept',
        runtime: this.stationFreshRuntimeV188(), message: null, lastHitAt: -Infinity, barriers: [] };
      this.prepareStationLevelV188(campaignId, places);
      const saved = this.lastResumeResult?.applied ? options.resumeState?.stationLevelV188 : null;
      if (saved && saved.campaignId === campaignId && saved.schema === 188 && Number.isInteger(saved.phase) && saved.progress) {
        this.restoreStationPhaseV188(saved, { reposition: true });
      } else {
        this.stationLevelV188.snapshot = { phase: 0, progress: clone(progress) };
        this.syncStationDoorsV188();
        const first = { 'station-s1': 's1Start', 'station-s2': 's2Start', 'station-s4': 's4Start' }[campaignId];
        if (first) this.stationMessageV188(TX(first), 6);
      }
      this.onEvent?.({ type: 'station-level-ready-v188', campaignId, phase: this.stationPhaseIdV188() });
      return result;
    }

    stationFreshRuntimeV188() { return { spawnKey: null, spawned: 0, nextSpawnAt: 0, phaseElapsed: 0, holding: null, serial: 0 }; }
    stationPhaseIdV188() { const level = this.stationLevelV188; return level ? stationLevelPhaseIdsV188(level.campaignId)[level.phase] || null : null; }

    /** The template's generic encounter gives way to the authored phases (geometry, supplies and art stay). */
    prepareStationLevelV188(campaignId, places) {
      const level = this.stationLevelV188;
      this.enemies = [];
      if (this.mission?.objectives) this.mission.objectives.boss = true;
      for (const event of this.missionLevelEvents?.values?.() || []) event.triggered = true;
      for (const spawn of this.missionLevelSpawns?.values?.() || []) spawn.active = true;
      for (const node of this.objectiveNodes || []) { node.active = true; node.hiddenV188 = true; }
      // Every bulkhead the level owns drops its template lock: the level says why it is closed.
      for (const door of Object.values(places.doors)) if (door) { door.stationTemplateLockV188 = door.lockedBy || null; door.lockedBy = null; }
      level.barriers = this.buildStationBarriersV188(places);
      if (campaignId === 'station-s4' && this.objective) {
        // The technical team’s shuttle docks at the quay: the extraction moves to the dock floor.
        Object.assign(this.objective, { x: places.arrival.x - 34, y: places.decks.low - 90 });
      }
      this.stationDressingV188 = asphodeleMissionLayoutV188({ platforms: this.platforms, doors: this.doors, ladders: this.ladders, lifts: this.lifts, vents: this.vents }, null);
      this.stationDressingSectorV188 = { 'station-s1': 'ring', 'station-s2': 'hub', 'station-s3': 'lower', 'station-s4': 'hub' }[campaignId];
      this.stationLoaderV188 ||= new AsphodeleHubAssetLoaderV188();
      this.stationLoaderV188.preload([...ASPHODELE_MISSION_SLOT_IDS_V188, ...STATION_LEVEL_REUSED_PNGS_V188]);
    }

    /** The two sealed frames of the upper decks, as walls (they block marines, creatures and shots). */
    buildStationBarriersV188(places) {
      const out = [], { decks, x, ladders } = places;
      for (const spec of STATION_BARRIERS_V188) {
        const bx = spec.deck === 'top' ? x.cargoDoor - 20 : ladders.junction - 75;
        const floorY = spec.deck === 'top' ? decks.top : decks.mid;
        const top = spec.deck === 'top' ? floorY - 200 : decks.top + 24;
        const wall = { id: spec.id, x: bx, y: top, w: 40, h: floorY - top, stationBarrierV188: spec.id, edgeId: spec.edgeId };
        this.walls = [...(this.walls || []).filter(entry => entry.id !== spec.id), wall];
        out.push(Object.freeze({ ...spec, x: bx, y: top, w: 40, h: floorY - top, floorY }));
      }
      return Object.freeze(out);
    }

    /** Doors closed by the level, from its progress (the lock is the reason shown at the door). */
    stationDoorLocksV188() {
      const level = this.stationLevelV188, pr = level.progress, phase = level.phase, id = level.campaignId, ids = stationLevelPhaseIdsV188(id);
      const after = name => phase > ids.indexOf(name);
      if (id === 'station-s1') return { dock: pr.crank >= 1 ? null : 'SAS SANS COURANT · CYCLER À LA MAIN', cargo: pr.salvagers ? null : 'RÉCUPÉRATEURS DE GRUE · NÉGOCIER OU FORCER' };
      if (id === 'station-s2') return { cargo: after('sectors') ? null : 'SECTEURS HORS TENSION · DISJONCTEURS' };
      if (id === 'station-s3') return { dock: pr.airlockOpen ? null : 'SAS 3 SCELLÉ PAR CASSIUS', cargo: after('lab') ? null : 'LABORATOIRE NON FOUILLÉ', aft: after('routing') ? null : 'SAS SANS ÉNERGIE · ROUTAGE' };
      return { dock: id === 'station-s4' && this.stationPhaseIdV188() === 'hold' ? 'hold-open' : null };
    }
    syncStationDoorsV188() {
      const level = this.stationLevelV188, locks = this.stationDoorLocksV188();
      for (const [key, door] of Object.entries(level.places.doors)) {
        if (!door) continue;
        const lock = locks[key] || null;
        if (lock === 'hold-open') { Object.assign(door, { open: true, progress: 1, levelLocked: true, stationLockV188: null, stationHeldOpenV188: true }); continue; }
        door.stationHeldOpenV188 = false;
        if (lock) Object.assign(door, { open: false, progress: 0, levelLocked: true, stationLockV188: lock });
        else if (door.stationLockV188) Object.assign(door, { levelLocked: false, stationLockV188: null });
      }
    }

    /** A bulkhead the level opens itself (cycled, opened by the salvagers, by CASSIUS): it stands open. */
    openStationDoorV188(key) {
      const door = this.stationLevelV188?.places.doors[key];
      this.syncStationDoorsV188();
      if (door && !door.stationLockV188) { Object.assign(door, { open: true, progress: 1 }); this.onEvent?.({ type: 'station-door-opened-v188', doorId: door.id }); }
    }

    // —— Phases, checkpoints, resume ——
    stationCheckpointPlaceV188(phaseId) {
      const level = this.stationLevelV188, p = level.places, { x, decks } = p;
      switch (`${level.campaignId}:${phaseId}`) {
        case 'station-s1:ring': return [x.dockDoor + 80, decks.low];
        case 'station-s1:control': return [x.cargoDoor + 90, decks.low];
        case 'station-s1:extract': return [p.console.x - 70, decks.top];
        case 'station-s2:reactor': return [x.cargoDoor + 90, decks.low];
        case 'station-s2:cassius': return [p.reactor.x - 90, decks.low];
        case 'station-s2:extract': return [p.cassius.x - 90, decks.top];
        case 'station-s3:lab': return [x.dockDoor + 80, decks.low];
        case 'station-s3:routing': return [x.cargoDoor + 90, decks.low];
        case 'station-s3:escape': return [p.router.x + 60, decks.low];
        case 'station-s3:extract': return [p.tag.x - 60, decks.low];
        case 'station-s4:pressure': return [p.nest.x - 120, decks.mid];
        case 'station-s4:hold': return [p.hold.x, decks.low];
        case 'station-s4:extract': return [p.hold.x, decks.low];
        default: return null;
      }
    }
    advanceStationPhaseV188() {
      const level = this.stationLevelV188, ids = stationLevelPhaseIdsV188(level.campaignId);
      if (level.phase >= ids.length - 1) return false;
      level.phase += 1; level.runtime = this.stationFreshRuntimeV188();
      const phaseId = ids[level.phase];
      this.enterStationPhaseV188(phaseId);
      // The snapshot is taken before the checkpoint event: the save written for it holds the phase as it starts.
      level.snapshot = { phase: level.phase, progress: clone(level.progress) };
      const place = this.stationCheckpointPlaceV188(phaseId);
      if (place) {
        level.checkpointId = `${level.campaignId}-${phaseId}`;
        this.setCheckpoint(level.checkpointId, place[0] - (this.player?.w || 42) / 2, place[1] - (this.player?.h || 92));
      }
      this.onEvent?.({ type: 'station-level-phase-v188', campaignId: level.campaignId, phase: phaseId, checkpoint: level.checkpointId });
      return true;
    }
    /** Side effects owned by a phase start (objective runtime fulfilment, doors). */
    enterStationPhaseV188(phaseId) {
      const level = this.stationLevelV188, id = level.campaignId, pr = level.progress;
      if (id === 'station-s1' && (phaseId === 'extract' || pr.emergency)) { if (this.mission?.objectives) this.mission.objectives.power = true; }
      if (id === 'station-s2' && pr.reactor >= 1) { if (this.powerNode) this.powerNode.active = true; if (this.mission?.objectives) this.mission.objectives.power = true; }
      if (id === 'station-s3' && phaseId === 'escape' && pr.sealRemaining === null) pr.sealRemaining = R.sealSeconds;
      if (id === 'station-s3' && pr.routes.length && this.mission?.objectives) this.mission.objectives.power = true;
      if (id === 'station-s4' && phaseId === 'extract') this.markObjectiveAction?.('station-dock-held', { seconds: R.holdSeconds });
      this.syncStationDoorsV188();
    }
    restoreStationPhaseV188(saved, { reposition = false } = {}) {
      const level = this.stationLevelV188, ids = stationLevelPhaseIdsV188(level.campaignId);
      level.phase = Math.max(0, Math.min(ids.length - 1, saved.phase));
      level.progress = { ...initialProgress(level.campaignId, level.places), ...clone(saved.progress) };
      level.snapshot = { phase: level.phase, progress: clone(level.progress) };
      level.runtime = this.stationFreshRuntimeV188();
      this.enemies = (this.enemies || []).filter(enemy => !enemy.stationLevelSpawnV188);
      const place = this.stationCheckpointPlaceV188(ids[level.phase]);
      if (place) {
        level.checkpointId = `${level.campaignId}-${ids[level.phase]}`;
        this.checkpoint = { id: level.checkpointId, x: place[0] - (this.player?.w || 42) / 2, y: place[1] - (this.player?.h || 92) };
        if (reposition) for (const [index, actor] of [this.player, this.coop].entries()) if (actor) {
          actor.x = this.checkpoint.x - index * 52; actor.y = this.checkpoint.y; actor.vx = 0; actor.vy = 0; actor.depthZ = 0;
        }
      }
      if (level.campaignId === 'station-s4' && this.objectiveState && level.phase < ids.indexOf('extract')) this.objectiveState.complete = false;
      this.enterStationPhaseV188(ids[level.phase]);
      return true;
    }
    captureResumeState() {
      const state = super.captureResumeState(), level = this.stationLevelV188;
      if (!level?.snapshot) return state;
      return { ...state, stationLevelV188: { schema: 188, campaignId: level.campaignId, phase: level.snapshot.phase, progress: clone(level.snapshot.progress), checkpoint: level.checkpointId } };
    }
    restartFromCheckpoint() {
      const restarted = super.restartFromCheckpoint();
      const level = this.stationLevelV188;
      if (restarted && level?.snapshot) this.restoreStationPhaseV188(level.snapshot);
      return restarted;
    }

    // —— Spawns ——
    stationEnemySourceV188(kind) {
      const catalog = this.v52EnemyCatalog?.length ? this.v52EnemyCatalog : this.objectiveEnemyCatalog || [];
      const human = kind === 'salvager';
      return catalog.find(entry => entry.id === SOURCES[kind]) || catalog.find(entry => entry.caste !== 'royal' && (human ? entry.biology === 'human' : entry.biology === 'xenomorph'))
        || { id: SOURCES[kind], name: human ? 'Salvager' : 'Drone', biology: human ? 'human' : 'xenomorph', health: 80, damage: 12, speed: 1.2 };
    }
    spawnStationEnemyV188(kind, x, floorY) {
      const level = this.stationLevelV188, serial = (level.runtime.serial = (level.runtime.serial || 0) + 1);
      const enemy = this.createEnemy(this.stationEnemySourceV188(kind), 950 + level.phase * 40 + serial, x, floorY, { boss: false, keyCarrier: false });
      Object.assign(enemy, { alert: true, depthZ: 0, stationGraceV188: R.graceSeconds, stationLevelSpawnV188: this.stationPhaseIdV188() });
      this.initializeEnemyMissionNavigation?.(enemy);
      this.enemies.push(enemy);
      this.onEvent?.({ type: 'station-level-spawn-v188', kind, enemyId: enemy.id, x: Math.round(x), y: floorY, phase: this.stationPhaseIdV188() });
      return enemy;
    }
    stationMarinesV188() { return [this.player, this.coopEnabled ? this.coop : null].filter(actor => actor?.alive && !actor.downed); }
    stationDeckV188(floorY) {
      const surfaces = (this.platforms || []).filter(entry => Math.abs(entry.y - floorY) < 2 && entry.w > 0 && entry.kind !== 'lift');
      if (!surfaces.length) return null;
      const x0 = Math.min(...surfaces.map(entry => entry.x)) + 40, x1 = Math.max(...surfaces.map(entry => entry.x + entry.w)) - 40;
      const supported = x => surfaces.some(entry => x >= entry.x + 24 && x <= entry.x + entry.w - 24);
      const between = (a, b, item) => item.x + item.w / 2 > Math.min(a, b) && item.x + item.w / 2 < Math.max(a, b);
      // A closed door or a sealed frame between the spawn and the marine: the creature could not reach them.
      const closedBetween = (a, b) => (this.doors || []).some(door => !door.open && door.y < floorY && door.y + door.h >= floorY - 4 && between(a, b, door))
        || (this.walls || []).some(wall => wall.stationBarrierV188 && wall.y < floorY && wall.y + wall.h >= floorY - 4 && between(a, b, wall));
      return { x0, x1, supported, closedBetween };
    }
    updateStationSpawnsV188(plan) {
      const level = this.stationLevelV188, runtime = level.runtime;
      if (!plan) return;
      if (runtime.spawnKey !== plan.key) { runtime.spawnKey = plan.key; runtime.spawned = 0; runtime.nextSpawnAt = runtime.phaseElapsed + (plan.first ?? 3); }
      const alive = (this.enemies || []).filter(enemy => enemy.alive && enemy.stationLevelSpawnV188 === this.stationPhaseIdV188()).length;
      if (runtime.spawned >= plan.total || alive >= plan.maxAlive || runtime.phaseElapsed < runtime.nextSpawnAt) return;
      const deck = this.stationDeckV188(plan.y), marines = this.stationMarinesV188();
      if (!deck || !marines.length) return;
      const same = marines.filter(actor => Math.abs(feet(actor) - plan.y) < 40).map(actor => ({ x: centre(actor) }));
      const reference = same.length ? same : marines.map(actor => ({ x: centre(actor) }));
      const x = stationSpawnXV188({ marines: reference, side: plan.side, deck, offset: (runtime.spawned % 3) * 60,
        blocked: candidate => !deck.supported(candidate) || reference.some(entry => deck.closedBetween(candidate, entry.x)) });
      if (!Number.isFinite(x)) { runtime.nextSpawnAt = runtime.phaseElapsed + 1; return; }
      this.spawnStationEnemyV188(plan.pool || 'drone', x, plan.y);
      runtime.spawned += 1; runtime.nextSpawnAt = runtime.phaseElapsed + plan.interval;
    }
    /** [PROPOSÉ] encounter of each phase: few stalkers in the horror levels, waves in S4. */
    stationSpawnPlanV188() {
      const level = this.stationLevelV188, phase = this.stationPhaseIdV188(), pr = level.progress, { decks } = level.places, id = level.campaignId;
      if (id === 'station-s1') {
        if (phase === 'ring' && pr.salvagers === 'forced') return { key: 'salvagers', total: 3, maxAlive: 3, interval: 2, first: 2, side: 'east', y: decks.low, pool: 'salvager' };
        if (phase === 'ring') return { key: 'ring-stalker', total: 2, maxAlive: 1, interval: 25, first: 14, side: 'east', y: decks.low };
        if (phase === 'control') return { key: 'control', total: 3, maxAlive: 2, interval: 10, first: 6, side: 'west', y: decks.top };
        return phase === 'extract' ? { key: 'extract', total: 2, maxAlive: 2, interval: 12, first: 5, side: 'west', y: decks.low } : null;
      }
      if (id === 'station-s2') {
        if (phase === 'sectors') return { key: 'sectors', total: 2, maxAlive: 1, interval: 20, first: 15, side: 'east', y: decks.low };
        if (phase === 'cassius') return { key: 'wake', total: 3, maxAlive: 3, interval: 1.5, first: 1, side: 'east', y: decks.low };
        return phase === 'extract' ? { key: 'extract', total: 3, maxAlive: 2, interval: 8, first: 6, side: 'west', y: decks.low } : null;
      }
      if (id === 'station-s3') {
        const forced = stationAirlock3ModeV188(level.cassius) === 'force';
        if (phase === 'lab' && forced) return { key: 'lab-stalker', total: 1, maxAlive: 1, interval: 30, first: 18, side: 'west', y: decks.low };
        if (phase === 'routing') return { key: 'routing', total: 2, maxAlive: 2, interval: 10, first: 8, side: 'west', y: decks.low };
        if (phase === 'escape') return { key: 'confined', total: (pr.routes.includes('vents') ? 4 : 6) + (forced ? 2 : 0), maxAlive: 3, interval: 4, first: 2, side: 'west', y: decks.low };
        return phase === 'extract' ? { key: 'pursuit', total: 2, maxAlive: 2, interval: 6, first: 3, side: 'west', y: decks.low } : null;
      }
      if (phase === 'nest' && pr.purge > 0) return { key: 'nest-wake', total: 2, maxAlive: 2, interval: 3, first: 1, side: 'west', y: decks.mid };
      if (phase === 'pressure') return { key: 'pressure', total: 3, maxAlive: 2, interval: 14, first: 10, side: 'east', y: decks.mid };
      if (phase === 'hold') return { key: 'hold', total: 9, maxAlive: 4, interval: 5, first: 3, side: 'east', y: decks.low, pool: pr.holdRemaining < R.holdSeconds / 2 ? 'warrior' : 'drone' };
      return null;
    }

    // —— Update ——
    update(delta) {
      const level = this.stationLevelV188;
      if (!level) return super.update(delta);
      const result = super.update(delta);
      if (this.mission?.state !== 'active') return result;
      const dt = Math.min(.1, Math.max(0, Number(delta) || 0));
      level.runtime.phaseElapsed += dt;
      if (level.message && (level.message.until -= dt) <= 0) level.message = null;
      const id = level.campaignId;
      if (id === 'station-s1') this.updateStationS1V188(dt);
      else if (id === 'station-s2') this.updateStationS2V188(dt);
      else if (id === 'station-s3') this.updateStationS3V188(dt);
      else this.updateStationS4V188(dt);
      if (this.mission?.state === 'active') this.updateStationSpawnsV188(this.stationSpawnPlanV188());
      return result;
    }
    updateEnemy(enemy, delta) {
      if (enemy?.stationGraceV188 > 0) { enemy.stationGraceV188 = Math.max(0, enemy.stationGraceV188 - Math.max(0, Number(delta) || 0)); enemy.vx = 0; return; }
      return super.updateEnemy(enemy, delta);
    }
    damagePlayer(actor, amount, options = {}) {
      const before = actor ? (Number(actor.health) || 0) + (Number(actor.armor) || 0) : 0;
      const result = super.damagePlayer(actor, amount, options);
      if (this.stationLevelV188 && actor && (Number(actor.health) || 0) + (Number(actor.armor) || 0) < before) this.stationLevelV188.lastHitAt = this.mission?.elapsed || 0;
      return result;
    }
    /** S3: the generic 105 s quarantine timer gives way to the level’s own seal countdown. S4: the generic zone hold gives way to the dock hold. */
    updateObjectiveRuntime(delta) {
      const level = this.stationLevelV188, state = this.objectiveState;
      if (level?.campaignId === 'station-s3' && this.objectiveRuntime?.action === 'escape' && state && !state.escaped) {
        state.escaped = true;
        try { return super.updateObjectiveRuntime(delta); } finally { state.escaped = false; }
      }
      return super.updateObjectiveRuntime(delta);
    }
    updateHoldObjective(delta) { if (this.stationLevelV188) return undefined; return super.updateHoldObjective(delta); }
    objectiveInteractionV188(actor = this.player) { if (this.stationLevelV188) return null; return super.objectiveInteractionV188(actor); }
    stationHeldV188(actor = this.player) { return Boolean(this.keys?.has(actor?.coop ? 'KeyY' : 'KeyE')); }
    stationInReachV188(actor, x, y, reach = R.reach) {
      return Boolean(actor?.alive && !actor.downed && !actor.ventTransit && Math.abs(centre(actor) - x) <= reach && Math.abs(feet(actor) - y) < 40);
    }
    /** Advances the held interaction `key` (a progress path) 0 → 1; returns true the frame it completes. */
    stepStationHoldV188(key, x, y, seconds, dt) {
      const level = this.stationLevelV188, holding = level.runtime.holding;
      const get = () => key.split('.').reduce((value, part) => value?.[part], level.progress) || 0;
      const set = value => { const parts = key.split('.'), last = parts.pop(); parts.reduce((value, part) => value[part], level.progress)[last] = value; };
      if (!holding || holding.key !== key || get() >= 1) return false;
      const actor = holding.actor, inReach = this.stationInReachV188(actor, x, y, R.reach + 10);
      const step = stepStationHoldV188(get(), { held: this.stationHeldV188(actor), inReach, sinceHit: (this.mission?.elapsed || 0) - level.lastHitAt, dt, seconds });
      set(step.progress); holding.paused = step.paused; holding.value = step.progress;
      if (!inReach && !this.stationHeldV188(actor)) level.runtime.holding = null;
      if (step.progress >= 1) { level.runtime.holding = null; return true; }
      return false;
    }
    stationMessageV188(text, seconds = 4) { if (this.stationLevelV188) this.stationLevelV188.message = { text, until: seconds }; this.pushCaption?.('mission', text); }
    stationInRingV188(actor = this.player) {
      const p = this.stationLevelV188?.places;
      return Boolean(p?.ring && actor?.alive && centre(actor) >= p.ring.x0 && centre(actor) <= p.ring.x1 && [p.decks.low, p.decks.mid].some(y => Math.abs(feet(actor) - y) < 40));
    }

    // —— S1 « L’arrimage » ——
    updateStationS1V188(dt) {
      const level = this.stationLevelV188, pr = level.progress, p = level.places, phase = this.stationPhaseIdV188();
      if (phase === 'dock' && this.stepStationHoldV188('crank', p.crank.x, p.crank.y, R.holds.crank, dt)) {
        this.stationMessageV188(TX('crankDone'), 5); this.advanceStationPhaseV188(); this.openStationDoorV188('dock');
      }
      if (phase === 'ring') {
        if (this.stepStationHoldV188('force', p.x.cargoDoor - 40, p.decks.low, R.holds.force, dt)) {
          pr.salvagers = 'forced'; this.openStationDoorV188('cargo'); this.stationMessageV188(TX('forced'), 5);
          this.onEvent?.({ type: 'station-salvagers-v188', outcome: 'forced' });
        }
        const hostile = (this.enemies || []).some(enemy => enemy.alive && enemy.stationLevelSpawnV188 === 'ring' && level.runtime.spawnKey === 'salvagers');
        if (pr.traces.barricade && pr.traces.chalk && pr.salvagers && !hostile && centre(this.player) > p.x.cargoDoor + 30 && Math.abs(feet(this.player) - p.decks.low) < 40) this.advanceStationPhaseV188();
      }
    }
    // —— S2 « La voix de CASSIUS » ——
    updateStationS2V188(dt) {
      const level = this.stationLevelV188, pr = level.progress, p = level.places, phase = this.stationPhaseIdV188();
      if (phase === 'reactor' && this.stepStationHoldV188('reactor', p.reactor.x, p.reactor.y, R.holds.reactor, dt)) {
        if (this.powerNode) this.powerNode.active = true;
        if (this.mission?.objectives) this.mission.objectives.power = true;
        this.onEvent?.({ type: 'power-restored' });
        this.stationMessageV188(TX('reactorDone'), 6); this.advanceStationPhaseV188();
      }
      if (phase === 'cassius' && this.stepStationHoldV188('orders', p.cassius.x, p.cassius.y, R.holds.orders, dt)) {
        this.onEvent?.({ type: 'station-cassius-orders-copied-v188' });
        this.stationMessageV188(TX('orders'), 7); this.advanceStationPhaseV188();
      }
    }
    /**
     * Spec 010: the app reports the hearing's state when its dialog closes ('won' / 'lost' once concluded,
     * null when it was suspended before the last exchange). Only the level's own progress changes: the
     * outcome feeds the text of the existing CASSIUS decision at Command, nothing else.
     */
    resolveStationCassiusHearingV188(outcome = null) {
      const level = this.stationLevelV188;
      if (level?.campaignId !== 'station-s2' || this.stationPhaseIdV188() !== 'cassius') return false;
      const pr = level.progress, lang = globalThis.document?.documentElement?.lang === 'en' ? 'en' : 'fr';
      if (outcome !== 'won' && outcome !== 'lost') { pr.hearing = null; this.stationMessageV188(TX('hearingPaused'), 4); return false; }
      pr.hearing = outcome;
      this.stationMessageV188(CASSIUS_INTERROGATION_V188.endings[outcome][lang], 7);
      this.onEvent?.({ type: 'station-cassius-hearing-concluded-v188', outcome });
      return true;
    }

    // —— S3 « Les ponts scellés » ——
    updateStationS3V188(dt) {
      const level = this.stationLevelV188, pr = level.progress, p = level.places, phase = this.stationPhaseIdV188(), actor = this.player;
      const mode = stationAirlock3ModeV188(level.cassius);
      if (phase === 'airlock3' && mode !== 'ask' && this.stepStationHoldV188('airlock', p.airlock3.x, p.airlock3.y, mode === 'code' ? R.holds.code : R.holds.forceAirlock, dt)) this.openStationAirlock3V188(mode);
      if (phase === 'lab' || phase === 'routing') {
        for (const egg of pr.eggs) {
          if (egg.state === 'burnt' || egg.state === 'spent') continue;
          const near = Boolean(actor?.alive && !actor.downed && Math.abs(centre(actor) - egg.x) <= R.egg.trigger && Math.abs(feet(actor) - p.decks.low) < 40)
            && level.runtime.holding?.key !== `burn:${egg.id}`;
          const before = egg.state, step = stepStationEggV188(egg, { near, dt });
          Object.assign(egg, step.egg);
          if (before === 'closed' && egg.state === 'opening') this.stationMessageV188(TX('eggWarning'), 2);
          if (step.leap) { pr.eggHits += 1; this.damagePlayer(actor, R.egg.damage, { kind: 'facehugger', source: 'station-egg-v188' }); this.stationMessageV188(TX('eggHit'), 4); this.onEvent?.({ type: 'station-egg-leap-v188', egg: egg.id }); }
        }
        const holding = level.runtime.holding, burning = holding?.key?.startsWith('burn:') ? pr.eggs.find(egg => `burn:${egg.id}` === holding.key) : null;
        if (burning && burning.state !== 'burnt' && burning.state !== 'spent') {
          const inReach = this.stationInReachV188(holding.actor, burning.x, p.decks.low, 105);
          const step = stepStationHoldV188(burning.burn, { held: this.stationHeldV188(holding.actor), inReach, sinceHit: (this.mission?.elapsed || 0) - level.lastHitAt, dt, seconds: R.holds.burn });
          burning.burn = step.progress; holding.paused = step.paused; holding.value = step.progress;
          if (!inReach && !this.stationHeldV188(holding.actor)) level.runtime.holding = null;
          if (step.progress >= 1) { burning.state = 'burnt'; level.runtime.holding = null; this.stationMessageV188(TX('eggBurnt'), 2); this.onEvent?.({ type: 'station-egg-burnt-v188', egg: burning.id }); }
        } else if (burning) level.runtime.holding = null;
      }
      if (phase === 'lab' && pr.log && pr.cradles) { this.stationMessageV188(TX('labDone'), 5); this.advanceStationPhaseV188(); }
      if ((phase === 'escape' || phase === 'extract') && pr.sealRemaining !== null) {
        pr.sealRemaining = Math.max(0, pr.sealRemaining - dt);
        if (pr.sealRemaining <= 0) { this.stationMessageV188(TX('resealed'), 4); this.failMission('quarantine-resealed'); }
      }
    }
    openStationAirlock3V188(mode) {
      const pr = this.stationLevelV188.progress;
      pr.airlock = 1; pr.airlockOpen = true; this.openStationDoorV188('dock');
      this.stationMessageV188(TX(mode === 'ask' ? 'airlockRewrite' : mode === 'code' ? 'airlockRestrain' : 'airlockForced'), 5);
      this.onEvent?.({ type: 'station-airlock3-open-v188', mode });
      this.advanceStationPhaseV188();
    }
    // —— S4 « Le hub Asphodèle » ——
    updateStationS4V188(dt) {
      const level = this.stationLevelV188, pr = level.progress, p = level.places, phase = this.stationPhaseIdV188(), actor = this.player;
      if (phase === 'nest' && this.stepStationHoldV188('purge', p.nest.x, p.nest.y, R.holds.purge, dt)) {
        this.stationMessageV188(TX('nestDone'), 5);
        this.advanceStationPhaseV188();
      }
      if (phase === 'pressure') {
        for (const valve of p.valves) if (this.stepStationHoldV188(`valves.${valve.id}`, valve.x, valve.y, R.holds.valve, dt)) this.stationMessageV188(TX('valve'), 3);
        if (Object.values(pr.valves).every(value => value >= 1)) { this.stationMessageV188(TX('pressureDone'), 6); this.advanceStationPhaseV188(); }
      }
      if (phase === 'hold') {
        const inZone = actor?.alive && Math.abs(centre(actor) - p.hold.x) <= p.hold.radius && Math.abs(feet(actor) - p.decks.low) < 40;
        if (inZone) pr.holdRemaining = Math.max(0, pr.holdRemaining - dt);
        const left = (this.enemies || []).some(enemy => enemy.alive && enemy.stationLevelSpawnV188 === 'hold');
        if (pr.holdRemaining <= 0 && !left) {
          pr.arrived = true;
          this.stationMessageV188(TX(level.grueAllied ? 'arrivedGrue' : 'arrived'), 7);
          this.onEvent?.({ type: 'station-team-arrived-v188', grue: level.grueAllied });
          this.advanceStationPhaseV188();
        }
      }
    }

    // —— Interactions ——
    stationCandidatesV188(actor) {
      const level = this.stationLevelV188;
      if (!level || !actor?.alive || actor.downed || actor.ventTransit) return [];
      const pr = level.progress, p = level.places, phase = this.stationPhaseIdV188(), id = level.campaignId, list = [];
      const add = (key, x, y, prompt, extra = {}) => {
        if (!this.stationInReachV188(actor, x, y, extra.reach)) return;
        list.push({ kind: 'station-level-v188', category: 'action', key, target: { x: x - 20, y: y - 60, w: 40, h: 60 }, distance: Math.abs(centre(actor) - x), prompt, ...extra });
      };
      const hold = (key, x, y, verb, extra = {}) => add(key, x, y, `E (MAINTENIR)  ${verb}`, { hold: true, ...extra });
      if (id === 'station-s1') {
        if (phase === 'dock') hold('crank', p.crank.x, p.crank.y, 'CYCLER LE SAS À LA MANIVELLE');
        if (phase === 'ring') {
          for (const trace of p.traces) if (!pr.traces[trace.id]) add(`trace:${trace.id}`, trace.x, trace.y, trace.id === 'barricade' ? 'E  EXAMINER LA BARRICADE D’ECHO-8' : 'E  EXAMINER LES MARQUES À LA CRAIE', { reach: 70 });
          if (!pr.salvagers) {
            add('negotiate', p.salvagers.x, p.salvagers.y, 'E  NÉGOCIER LE PASSAGE AVEC LES RÉCUPÉRATEURS', { reach: 60 });
            hold('force', p.x.cargoDoor - 40, p.decks.low, 'FORCER LA CLOISON', { reach: 30 });
          }
        }
        if (phase === 'control' && !pr.emergency) add('emergency', p.console.x, p.console.y, 'E  RÉTABLIR L’ALIMENTATION DE SECOURS DU PONT', { reach: 90 });
      }
      if (id === 'station-s2') {
        if (phase === 'sectors') for (const breaker of p.breakers) if (!pr.breakers[breaker.id]) add(`breaker:${breaker.id}`, breaker.x, breaker.y, 'E  RÉARMER LE DISJONCTEUR DE SECTEUR', { reach: 55 });
        if (phase === 'reactor') hold('reactor', p.reactor.x, p.reactor.y, 'RELANCER LE RÉACTEUR AUXILIAIRE');
        if (phase === 'cassius') {
          // Spec 010 hearing (CASSIUS_INTERROGATION_V188): opened by the app over the paused level; concluded, the orders can be copied.
          if (pr.hearing !== 'won' && pr.hearing !== 'lost') { if (pr.hearing !== 'open') add('hearing', p.cassius.x, p.cassius.y, 'E  OUVRIR L’INTERROGATOIRE DE CASSIUS', { reach: 100 }); }
          else hold('orders', p.cassius.x, p.cassius.y, 'COPIER LES ORDRES DE LIVRAISON QZ17', { reach: 100 });
        }
      }
      if (id === 'station-s3') {
        if (phase === 'airlock3') {
          const mode = stationAirlock3ModeV188(level.cassius);
          if (mode === 'ask') add('airlock:ask', p.airlock3.x, p.airlock3.y, 'E  DEMANDER À CASSIUS D’OUVRIR LE SAS 3');
          else hold('airlock', p.airlock3.x, p.airlock3.y, mode === 'code' ? 'SAISIR LE CODE MANUEL DU SAS 3' : 'FORCER LE SAS 3 À LA MAIN');
        }
        if (phase === 'lab' || phase === 'routing') {
          if (!pr.log) add('log', p.log.x, p.log.y, 'E  LIRE LES JOURNAUX DES SURVIVANTS', { reach: 50 });
          if (!pr.cradles) add('cradles', p.cradles.x + p.cradles.w / 2, p.cradles.y, 'E  EXAMINER LES BERCEAUX QZ17', { reach: 60 });
          for (const egg of pr.eggs) if (egg.state === 'closed' || egg.state === 'opening') hold(`burn:${egg.id}`, egg.x, p.decks.low, 'BRÛLER L’ŒUF', { reach: 95 });
        }
        if (phase === 'routing') {
          add('route:lights', p.router.x - 30, p.router.y, 'E  ROUTER : SAS + ÉCLAIRAGE', { reach: 28 });
          add('route:vents', p.router.x + 30, p.router.y, 'E  ROUTER : SAS + VENTILATION', { reach: 28 });
        }
        if (phase === 'escape' && !pr.tag) add('tag', p.tag.x, p.tag.y, 'E  RAMASSER LA PLAQUE DE KESSLER', { reach: 60 });
      }
      if (id === 'station-s4') {
        if (phase === 'nest') hold('purge', p.nest.x, p.nest.y, 'ARMER LA PURGE THERMIQUE DU NID');
        if (phase === 'pressure') for (const valve of p.valves) if ((pr.valves[valve.id] || 0) < 1) hold(`valves.${valve.id}`, valve.x, valve.y, 'OUVRIR LA VANNE DE SECTEUR', { reach: 60 });
      }
      // Information only: why the walk ends here (the sealed frame), and where to go.
      for (const barrier of level.barriers || []) add(`barrier:${barrier.id}`, barrier.x + barrier.w / 2, barrier.floorY, barrier.requirement, { reach: 90 });
      return list;
    }
    interactionCandidatesV188(actor = this.player) {
      const list = super.interactionCandidatesV188(actor);
      if (!this.stationLevelV188) return list;
      const mine = this.stationCandidatesV188(actor).sort((a, b) => a.distance - b.distance);
      const filtered = list.filter(entry => !(entry.kind === 'power' || entry.kind === 'archive') && !(entry.kind === 'door' && entry.target?.stationHeldOpenV188));
      return [...mine.filter(entry => !entry.key.startsWith('barrier:')), ...filtered, ...mine.filter(entry => entry.key.startsWith('barrier:'))];
    }
    /** The station ducts are sealed: an entrance shows why, nobody enters (marines, allies, creatures). */
    missionVentCandidateV188(actor = this.player) {
      const entry = super.missionVentCandidateV188?.(actor) || null;
      if (!this.stationLevelV188 || !entry) return entry;
      return { ...entry, kind: 'station-level-v188', key: 'vent-sealed', prompt: VENT_SEALED };
    }
    beginMissionVentTraversalV62(actor, options = {}) {
      if (this.stationLevelV188) return null;
      return super.beginMissionVentTraversalV62(actor, options);
    }
    interact(actor = this.player) {
      const choice = this.stationLevelV188 && this.mission?.state === 'active' ? this.selectInteractionTargetV188?.(actor) : null;
      if (choice?.kind === 'station-level-v188') return this.performStationInteractionV188(actor, choice);
      return super.interact(actor);
    }
    getInteractionPrompt(actor = this.player) {
      const choice = this.stationLevelV188 && actor?.alive ? this.selectInteractionTargetV188?.(actor) : null;
      if (choice?.kind === 'station-level-v188') return choice.prompt;
      return super.getInteractionPrompt(actor);
    }
    performStationInteractionV188(actor, choice) {
      const level = this.stationLevelV188, pr = level.progress, key = choice.key;
      const done = (message, seconds = 3) => { if (message) this.stationMessageV188(message, seconds); this.setInteractionAnimation?.(actor, 'control-use', .6); this.audio?.ui?.(); return true; };
      if (choice.hold) {
        level.runtime.holding = { key, actor, paused: false, value: 0 };
        this.setInteractionAnimation?.(actor, 'control-use', .6);
        return true;
      }
      if (key === 'vent-sealed') return done(TX('ventSealed'), 2);
      if (key.startsWith('barrier:')) return done(TX('sealedFrame'), 3);
      if (key.startsWith('trace:')) { const id = key.split(':')[1]; pr.traces[id] = true; if (id === 'chalk' && this.inventory) this.inventory.intel = (Number(this.inventory.intel) || 0) + 1; return done(TX(id === 'barricade' ? 'traceBarricade' : 'traceChalk'), 5); }
      if (key === 'negotiate') { pr.salvagers = 'negotiated'; this.openStationDoorV188('cargo'); this.onEvent?.({ type: 'station-salvagers-v188', outcome: 'negotiated' }); return done(TX('negotiate'), 6); }
      if (key === 'emergency') { pr.emergency = true; if (this.mission?.objectives) this.mission.objectives.power = true; this.stationMessageV188(TX('emergency'), 6); this.advanceStationPhaseV188(); return true; }
      if (key.startsWith('breaker:')) {
        const id = key.split(':')[1]; pr.breakers[id] = true;
        const count = Object.values(pr.breakers).filter(Boolean).length;
        done(TX(['breakerOne', 'breakerTwo', 'breakersDone'][Math.min(3, count) - 1]), 5);
        if (count >= 3) this.advanceStationPhaseV188();
        return true;
      }
      if (key === 'hearing') {
        pr.hearing = 'open';
        this.stationMessageV188(TX('hearingOpen'), 6);
        this.onEvent?.({ type: 'station-cassius-hearing-v188', confrontationId: STATION_CASSIUS_HEARING_ID_V188, campaignId: level.campaignId });
        return done(null);
      }
      if (key === 'airlock:ask') { this.openStationAirlock3V188('ask'); return true; }
      if (key === 'log') { pr.log = true; if (this.inventory) this.inventory.intel = (Number(this.inventory.intel) || 0) + 1; return done(TX('log'), 6); }
      if (key === 'cradles') { pr.cradles = true; return done(TX('cradles'), 6); }
      if (key.startsWith('route:')) {
        const second = key.split(':')[1]; pr.routes = ['airlock', second];
        if (this.mission?.objectives) this.mission.objectives.power = true;
        this.stationMessageV188(TX(second === 'lights' ? 'routedLights' : 'routedVents'), 6);
        this.onEvent?.({ type: 'station-power-routed-v188', routes: [...pr.routes] });
        this.advanceStationPhaseV188();
        return true;
      }
      if (key === 'tag') { pr.tag = true; this.stationMessageV188(TX('tag'), 6); this.onEvent?.({ type: 'station-kessler-tag-v188' }); this.advanceStationPhaseV188(); return true; }
      return false;
    }

    // —— Objectives and extraction ——
    stationMissingV188() {
      const level = this.stationLevelV188;
      if (!level) return '';
      const phase = this.stationPhaseIdV188();
      if (phase === 'extract') return '';
      return {
        'station-s1': { dock: 'SAS D’ARRIMAGE NON CYCLÉ', ring: 'ANNEAU NON TRAVERSÉ', control: 'PONT DE CONTRÔLE SANS COURANT' },
        'station-s2': { sectors: 'SECTEURS HORS TENSION', reactor: 'RÉACTEUR À L’ARRÊT', cassius: 'CASSIUS NON INTERROGÉ' },
        'station-s3': { airlock3: 'SAS 3 FERMÉ', lab: 'LABORATOIRE NON FOUILLÉ', routing: 'ÉNERGIE NON ROUTÉE', escape: 'PLAQUE DE KESSLER NON RETROUVÉE' },
        'station-s4': { nest: 'NID NON PURGÉ', pressure: 'STATION NON PRESSURISÉE', hold: 'QUAI NON TENU' }
      }[level.campaignId]?.[phase] || '';
    }
    missingObjectiveRequirement(options) { return this.stationMissingV188() || super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.stationMissingV188() || super.missingExtractionRequirement(); }
    doorRequirement(door) {
      if (door?.stationHeldOpenV188) return TX('dockOpen');
      if (door?.stationLockV188) return door.stationLockV188;
      return super.doorRequirement(door);
    }
    admitNativeTerminalInteractionV156(actor, target) {
      if (this.stationLevelV188 && target && (target === this.powerNode || target === this.archiveTerminal)) return false;
      return super.admitNativeTerminalInteractionV156 ? super.admitNativeTerminalInteractionV156(actor, target) : true;
    }
    admitMissionLevelHazardChangeV188(hazard, kind) {
      if (this.stationLevelV188) return false;
      return super.admitMissionLevelHazardChangeV188 ? super.admitMissionLevelHazardChangeV188(hazard, kind) : true;
    }
    phaseLabel() {
      const level = this.stationLevelV188;
      if (!level) return super.phaseLabel();
      return STATION_LEVEL_PHASES_V188[level.campaignId][level.phase].label.fr.toUpperCase();
    }
    objectivePanelContentV188(language) {
      const level = this.stationLevelV188;
      if (!level) return super.objectivePanelContentV188?.(language) || null;
      const lang = language === 'en' ? 'en' : 'fr';
      return { steps: STATION_LEVEL_PHASES_V188[level.campaignId].map((entry, index) => ({ key: entry.id, label: entry.label[lang],
        done: index < level.phase || (entry.id === 'extract' && Boolean(this.mission?.objectives?.extract)) })) };
    }
    /** Read-only summary of what the level recorded (nothing is written to the campaign save). */
    stationLevelResultV188() {
      const level = this.stationLevelV188;
      if (!level) return null;
      const pr = level.progress;
      return Object.freeze({ campaignId: level.campaignId, phase: this.stationPhaseIdV188(), salvagers: pr.salvagers || null, routes: pr.routes ? [...pr.routes] : null,
        hearing: pr.hearing ?? null, eggsBurnt: pr.eggs ? pr.eggs.filter(egg => egg.state === 'burnt').length : null, eggHits: pr.eggHits ?? null, tag: pr.tag ?? null, cassius: level.cassius });
    }
    getSnapshot() {
      const snapshot = super.getSnapshot(), level = this.stationLevelV188;
      if (!level) return snapshot;
      return { ...snapshot, stationLevelV188: { campaignId: level.campaignId, phase: this.stationPhaseIdV188(), checkpoint: level.checkpointId,
        progress: clone(level.progress), missing: this.stationMissingV188(), cassius: level.cassius, corridor: this.missionDepthSectionV188?.id || null,
        barriers: (level.barriers || []).map(entry => ({ id: entry.id, x: entry.x, y: entry.y, w: entry.w, h: entry.h })),
        locks: Object.fromEntries(Object.entries(level.places.doors).filter(([, door]) => door).map(([key, door]) => [key, door.stationLockV188 || null])) } };
    }

    // —— Drawing ——
    drawWorld(ctx) {
      const level = this.stationLevelV188;
      if (level && ctx) { ctx.save(); try { this.drawStationWallArtV188(ctx); } finally { ctx.restore(); } }
      return super.drawWorld(ctx);
    }
    /** Back-wall art, before platforms, doors and actors: station dressing, then the level slots. */
    drawStationWallArtV188(ctx) {
      const level = this.stationLevelV188, p = level.places, pr = level.progress, id = level.campaignId, time = this.mission?.elapsed || 0, loader = this.stationLoaderV188;
      const dressing = this.stationDressingV188, left = (this.camera?.x || 0) - 64, right = left + 1280 + 128, english = globalThis.document?.documentElement?.lang === 'en';
      if (dressing) {
        for (const band of dressing.bands) if (band.x + band.w >= left && band.x <= right) drawAsphodeleHazardBandV188(ctx, band);
        for (const entry of dressing.props) if (entry.x + entry.w >= left && entry.x <= right) drawAsphodeleMissionSlotV188(ctx, loader, entry, { sector: this.stationDressingSectorV188, english, time });
      }
      const slot = (name, x, bottom, options) => drawStationLevelSlotV188(ctx, loader, name, x, bottom, options);
      const { decks, x } = p;
      if (id === 'station-s1') {
        slot('station-echo8-dropship', p.collar.x, decks.low - 6);
        slot('station-manual-crank', p.crank.x - 23, decks.low - 20, { progress: pr.crank });
        for (const fan of p.fans) slot('station-ventilation-fan', fan.x, fan.y - 110, { time });
        slot('station-echo8-barricade', p.traces[0].x - 110, decks.low, { w: 220, h: 103, text: p.traces[0].text });
        slot('station-chalk-marks', p.traces[1].x - 30, decks.mid - 60);
        slot('station-control-map', p.console.x - 120, decks.top - 30);
      }
      if (id === 'station-s2') {
        for (const breaker of p.breakers) slot('station-sector-breaker', breaker.x - 15, breaker.y - 40, { done: pr.breakers[breaker.id] });
        slot('station-reactor-restart', p.reactor.x - 38, decks.low - 10, { progress: pr.reactor, done: pr.reactor >= 1 });
        slot('station-cassius-core', p.cassius.x - 80, decks.top - 6, { awake: pr.reactor >= 1, time });
      }
      if (id === 'station-s3') {
        if (!pr.airlockOpen) slot('station-airlock3-seal', x.dockDoor - 32, decks.low, { text: 'SAS 3 · QUARANTAINE' });
        slot('station-qz17-cradles', p.cradles.x, decks.low, { w: p.cradles.w, h: 51 });
        slot('station-survivor-log', p.log.x - 20, decks.low - 60);
        slot('station-power-router', p.router.x - 38, decks.low - 30, { routes: pr.routes });
        slot('station-echo8-barricade', x.aftLow - 160, decks.low, { text: 'E-8' });
      }
      if (id === 'station-s4') {
        slot('station-nest-resin', p.nest.x - 76, decks.mid, { burnt: pr.purge >= 1 });
        for (const valve of p.valves) slot('station-pressure-valve', valve.x - 76, valve.y - 30, { done: (pr.valves[valve.id] || 0) >= 1 });
      }
      for (const barrier of level.barriers || []) {
        ctx.fillStyle = '#2b3236'; ctx.fillRect(barrier.x, barrier.y, barrier.w, barrier.h);
        ctx.fillStyle = '#c9a54a'; for (let yy = barrier.y; yy < barrier.y + barrier.h; yy += 24) ctx.fillRect(barrier.x, yy, barrier.w, 6);
        ctx.fillStyle = '#e15b4f'; ctx.fillRect(barrier.x + barrier.w / 2 - 4, barrier.floorY - 120, 8, 8);
      }
    }
    /** People and floor objects, after doors and before the marines (the native authored-people hook). */
    drawForgeNpcsV158(ctx) {
      super.drawForgeNpcsV158?.(ctx);
      const level = this.stationLevelV188;
      if (!level || !ctx) return;
      const p = level.places, pr = level.progress, id = level.campaignId, loader = this.stationLoaderV188, { decks } = p;
      ctx.save();
      try {
        if (id === 'station-s1' && pr.salvagers !== 'forced') for (let i = 0; i < 2; i++) drawStationLevelSlotV188(ctx, loader, 'station-salvager', p.salvagers.x - 22 + i * 48, decks.low);
        if (id === 'station-s3') {
          for (const egg of pr.eggs) drawStationLevelSlotV188(ctx, loader, 'station-xeno-egg', egg.x - 20, decks.low, { state: egg.state, burnt: egg.state === 'burnt' });
          if (!pr.tag) drawStationLevelSlotV188(ctx, loader, 'station-kessler-tag', p.tag.x - 10, decks.low);
        }
        if (id === 'station-s4' && pr.arrived) {
          for (let i = 0; i < 3; i++) drawStationLevelSlotV188(ctx, loader, 'station-technician', p.arrival.x + 60 + i * 52, decks.low);
          if (level.grueAllied) drawStationLevelSlotV188(ctx, loader, 'station-grue', p.arrival.x + 230, decks.low);
        }
      } finally { ctx.restore(); }
    }
    stationDarknessV188() {
      const level = this.stationLevelV188, pr = level?.progress;
      if (level?.campaignId === 'station-s1') return pr.emergency ? R.darkness.s1Power : R.darkness.s1;
      if (level?.campaignId === 'station-s3') return pr.routes.includes('lights') ? R.darkness.s3Lights : R.darkness.s3;
      return 0;
    }
    drawForeground(ctx) {
      super.drawForeground(ctx);
      const dark = this.stationLevelV188 ? this.stationDarknessV188() : 0;
      if (!dark || !ctx || !this.player) return;
      // A station without power: the marine's lamp (screen space).
      const sx = centre(this.player) - (this.camera?.x || 0), sy = this.player.y + 30 - (this.camera?.y || 0);
      ctx.save();
      const gradient = ctx.createRadialGradient?.(sx, sy, 60, sx, sy, 320);
      if (gradient) { gradient.addColorStop(0, 'rgba(2,4,6,0)'); gradient.addColorStop(1, `rgba(2,4,6,${dark})`); ctx.fillStyle = gradient; }
      else ctx.fillStyle = `rgba(2,4,6,${dark * .6})`;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }
    /** HUD lines of the level: the first one is the objective box's progress line. */
    stationHudLinesV188() {
      const level = this.stationLevelV188, pr = level.progress, id = level.campaignId, phase = this.stationPhaseIdV188(), lines = [];
      if (id === 'station-s1') {
        if (phase === 'ring') lines.push(`TRACES D’ECHO-8 ${Object.values(pr.traces).filter(Boolean).length}/2`);
        if (phase === 'ring' && !pr.salvagers) lines.push(TX('salvagersNeed'));
        if (this.stationInRingV188()) lines.push('DÉTECTEUR SATURÉ · VENTILATEURS');
      }
      if (id === 'station-s2') {
        if (phase === 'sectors') lines.push(`DISJONCTEURS ${Object.values(pr.breakers).filter(Boolean).length}/3`);
        if (phase === 'cassius' && pr.hearing === 'open') lines.push('INTERROGATOIRE DE CASSIUS EN COURS');
      }
      if (id === 'station-s3') {
        if (phase === 'lab') lines.push(`LABORATOIRE ${[pr.log, pr.cradles].filter(Boolean).length}/2`);
        if (pr.sealRemaining !== null) lines.push(`FERMETURE DE LA QUARANTAINE ${Math.floor(pr.sealRemaining / 60)}:${String(Math.floor(pr.sealRemaining % 60)).padStart(2, '0')}`);
      }
      if (id === 'station-s4') {
        if (phase === 'pressure') lines.push(`VANNES ${Object.values(pr.valves).filter(value => value >= 1).length}/3`);
        if (phase === 'hold') lines.push(`ARRIMAGE DE LA NAVETTE ${Math.ceil(pr.holdRemaining)} s`);
      }
      if (!lines.length) lines.push(this.stationMissingV188() || 'EXTRACTION DISPONIBLE');
      return lines;
    }
    objectiveProgressText() {
      return this.stationLevelV188 ? this.stationHudLinesV188()[0] : super.objectiveProgressText();
    }
    drawHud(ctx) {
      super.drawHud(ctx);
      const level = this.stationLevelV188;
      if (!level || !ctx || this.mission?.state !== 'active') return;
      ctx.save();
      try {
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        const holding = level.runtime.holding;
        if (holding) {
          const value = Number(holding.value) || 0;
          ctx.fillStyle = 'rgba(4,12,9,.85)'; ctx.fillRect(490, 560, 300, 14);
          ctx.fillStyle = holding.paused ? '#e15b4f' : '#e0a33a'; ctx.fillRect(490, 560, 300 * value, 14);
          ctx.font = '700 11px monospace'; ctx.fillStyle = '#d8e6d8';
          ctx.fillText(holding.paused ? `INTERROMPU · ${Math.round(value * 100)} %` : `${Math.round(value * 100)} %`, 640, 554);
        }
        ctx.font = '700 12px monospace';
        this.stationHudLinesV188().slice(1).forEach((line, index) => { ctx.fillStyle = '#e2d6a8'; ctx.fillText(line, 640, 190 + index * 16); });
        if (level.message) {
          ctx.font = '14px sans-serif'; const width = Math.min(1100, (ctx.measureText?.(level.message.text)?.width || level.message.text.length * 7) + 40);
          ctx.fillStyle = 'rgba(4,12,9,.82)'; ctx.fillRect(640 - width / 2, 600, width, 28);
          ctx.fillStyle = '#d8e6d8'; ctx.fillText(level.message.text, 640, 619);
        }
      } finally { ctx.restore(); }
    }
  };
}
