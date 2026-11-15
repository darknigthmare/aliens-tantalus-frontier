// V188 — player-facing words for mission-log and squad HUD values that the
// runtime carries as identifiers (squad support actions, zone biomes). French
// labels; English comes from the reviewed V185 catalog through the live
// canvas/DOM translation layer. Unknown identifiers never reach the screen raw.
export const SQUAD_ACTION_LABELS_V188 = Object.freeze({
  'cohesion-aura': 'cohésion', 'combat-medicine': 'soins de combat', 'command-aura': 'commandement',
  'demolition-round': 'charge de démolition', 'field-repair': 'réparation', 'hazard-guard': 'protection environnementale',
  'recon-pulse': 'impulsion de reconnaissance', 'signal-disruption': 'brouillage', 'smartgun-burst': 'rafale smartgun',
  'suppressive-fire': 'tir de suppression', 'threat-analysis': 'analyse de menace', 'vehicle-gunnery': 'tourelle du véhicule',
  'vehicle-repair': 'réparation du véhicule', support: 'soutien'
});
export const BIOME_LABELS_V188 = Object.freeze({
  industrial: 'industriel', industriel: 'industriel', ruins: 'ruines', jungle: 'jungle', foundry: 'fonderie', caverns: 'cavernes',
  orbital: 'orbital', oceanic: 'océanique', mines: 'mines', colony: 'colonie', shipyard: 'chantier naval', habitation: 'habitat',
  cryogenic: 'cryogénie', reactor: 'réacteur', laboratory: 'laboratoire', badlands: 'terres arides', hive: 'ruche', ruche: 'ruche',
  vacuum: 'vide spatial', quarantaine: 'quarantaine'
});
const ID_SHAPE_V188 = /^[a-z0-9]+([-_][a-z0-9]+)*$/u;

export function squadActionLabelV188(action) {
  const raw = String(action ?? '').trim();
  if (Object.hasOwn(SQUAD_ACTION_LABELS_V188, raw)) return SQUAD_ACTION_LABELS_V188[raw];
  return !raw || ID_SHAPE_V188.test(raw) ? 'soutien' : raw;
}

export function biomeLabelV188(biome) {
  const raw = String(biome ?? '').trim();
  if (Object.hasOwn(BIOME_LABELS_V188, raw.toLowerCase())) return BIOME_LABELS_V188[raw.toLowerCase()];
  return !raw || ID_SHAPE_V188.test(raw) ? 'secteur' : raw;
}

// Failure reasons: some runtimes pass an authored French sentence, others an id
// (failMission('escouade-neutralisee')). The id stays in the save and the
// operation flags; only the displayed reason is replaced.
export const FAILURE_REASON_LABELS_V188 = Object.freeze({
  'escouade-neutralisee': 'escouade neutralisée', 'marine-a-terre': 'marine à terre',
  'quarantine-time-expired': 'délai de quarantaine écoulé', 'capture-target-killed': 'spécimen à capturer abattu',
  'time-expired': 'délai écoulé', 'specimen-killed': 'spécimen abattu'
});
export function missionFailureLabelV188(reason) {
  const raw = String(reason ?? '').trim();
  if (Object.hasOwn(FAILURE_REASON_LABELS_V188, raw)) return FAILURE_REASON_LABELS_V188[raw];
  return !raw || ID_SHAPE_V188.test(raw) ? 'échec' : raw;
}

// Checkpoint ids (insertion, power, apc-convoy-queen-cleared, mecha-mounted…)
// stay in the flags; the log names the generic ones and calls the others
// "d’opération".
export const CHECKPOINT_LABELS_V188 = Object.freeze({
  insertion: 'd’insertion', power: 'énergie', archive: 'archives', security: 'sécurité', vent: 'conduit',
  containment: 'confinement', extract: 'extraction', extraction: 'extraction',
  // V188 phase checkpoints (owner decision, 2026-11-15).
  'cargo-loader': 'chargeur P-5000', 'cargo-escort': 'escorte du convoi', 'cargo-matriarch': 'matriarche',
  'extraction-walkway': 'passerelle d’extraction'
});
export function checkpointLabelV188(id) {
  const raw = String(id ?? '').trim();
  if (Object.hasOwn(CHECKPOINT_LABELS_V188, raw)) return CHECKPOINT_LABELS_V188[raw];
  const beacon = /^beacon-(\d+)$/u.exec(raw);
  if (beacon) return `balise ${beacon[1]}`;
  return 'd’opération';
}

// Mission-log names for level content (text bug hunt, 2026-11-14). The log used
// to print template, event, archive, route and timer ids. Content names come
// first (template label, archive title, route label); the field events have no
// authored name, so their wording below is [PROPOSÉ]. Fallbacks are generic words.
export const LEVEL_TEMPLATE_LABELS_V188 = Object.freeze({
  'ship-interior-vertical': 'Intérieur de vaisseau vertical',
  'colony-multiroute': 'Colonie à routes multiples',
  'planet-exterior': 'Extérieur planétaire'
});
// [PROPOSÉ] names for the authored mission-level events of mission-levels-v52.
export const LEVEL_EVENT_LABELS_V188 = Object.freeze({
  'ship-decompression': 'décompression de la soute',
  'ship-power-cascade': 'surtension en cascade',
  'ship-bridge-ambush': 'embuscade au poste de commandement',
  'colony-blackout': 'panne de courant de la colonie',
  'colony-generator-online': 'générateur de la colonie relancé',
  'colony-plaza-attack': 'attaque de l’habitat',
  'planet-storm-front': 'front de tempête',
  'planet-cave-ambush': 'embuscade dans les grottes',
  'planet-beacon-defense': 'défense de la balise'
});
export const LEVEL_TIMER_LABELS_V188 = Object.freeze({ extraction: 'extraction' });

const nameOrFallbackV188 = (value, fallback) => {
  const raw = String(value ?? '').trim();
  return !raw || ID_SHAPE_V188.test(raw) ? fallback : raw;
};

/** Level name for "mission-level-ready": the plan's templateLabel, then the map. */
export function levelTemplateLabelV188(event = {}) {
  const authored = nameOrFallbackV188(event?.templateLabel, '');
  if (authored) return authored;
  const id = String(event?.templateId ?? '').trim();
  return Object.hasOwn(LEVEL_TEMPLATE_LABELS_V188, id) ? LEVEL_TEMPLATE_LABELS_V188[id] : 'terrain d’opération';
}
export function levelEventLabelV188(eventId) {
  const id = String(eventId ?? '').trim();
  return Object.hasOwn(LEVEL_EVENT_LABELS_V188, id) ? LEVEL_EVENT_LABELS_V188[id] : nameOrFallbackV188(id, 'alerte terrain');
}
export function levelTimerLabelV188(timerId) {
  const id = String(timerId ?? '').trim();
  return Object.hasOwn(LEVEL_TIMER_LABELS_V188, id) ? LEVEL_TIMER_LABELS_V188[id] : nameOrFallbackV188(id, 'extraction');
}
/** Archive title from the collectable catalog ({id, title} records). */
export function collectableLabelV188(collectableId, records = []) {
  const id = String(collectableId ?? '').trim();
  const record = (Array.isArray(records) ? records : []).find(entry => entry?.id === id);
  return nameOrFallbackV188(record?.title, 'archive de terrain');
}
/** Route name from the route consequences ({flag, routeId, label} records). */
export function routeUnlockLabelV188(event = {}, consequences = {}) {
  const flag = String(event?.flag ?? '').trim();
  const match = Object.values(consequences || {}).find(entry => entry?.flag === flag || (event?.routeId && entry?.routeId === event.routeId));
  return nameOrFallbackV188(match?.label, 'route d’accès');
}

// "OBJECTIF · …" used to print the objective action id (PHASE-COMPLETE,
// HOLD-STARTED…). Ids come from game-complete-core and cargo-brutal-runtime-v67;
// the wording is [PROPOSÉ].
export const OBJECTIVE_ACTION_LABELS_V188 = Object.freeze({
  'apex-trace': 'trace apex relevée', 'hold-started': 'tenir la position', 'hold-complete': 'position tenue',
  'specimen-captured': 'spécimen capturé', 'charge-armed': 'charge armée', 'relay-destroyed': 'relais détruit',
  'target-secured': 'cible sécurisée', 'purge-complete': 'purge terminée', 'boarding-route-open': 'route d’abordage ouverte',
  'vent-route-mapped': 'conduits cartographiés', 'phase-complete': 'étape terminée', 'cargo-complete': 'opération cargo terminée',
  'cargo-failed': 'opération cargo compromise', 'cargo-door-opened': 'porte de soute ouverte', 'cargo-obstacle-struck': 'obstacle touché',
  'cargo-obstacle-cleared': 'obstacle dégagé', 'convoy-started': 'escorte lancée', 'convoy-secured': 'convoi sécurisé',
  'convoy-casualty': 'perte dans le convoi', 'matriarch-phase': 'la matriarche change de phase'
});
export function objectiveActionLabelV188(action) {
  const id = String(action ?? '').trim();
  return Object.hasOwn(OBJECTIVE_ACTION_LABELS_V188, id) ? OBJECTIVE_ACTION_LABELS_V188[id] : nameOrFallbackV188(id, 'progression');
}
/** Insertion phase for "INSERTION · …": the insertion UI labels, never the phase id. */
export function insertionPhaseLabelV188(phase, labels = {}) {
  const id = String(phase ?? '').trim();
  return Object.hasOwn(labels || {}, id) ? labels[id] : nameOrFallbackV188(id, 'insertion');
}

/** French mission-log line for a level event, or null when the event is not one of them. */
export function missionLevelLogLineV188(event = {}, { collectables = [], routes = {} } = {}) {
  const up = text => String(text).toUpperCase();
  const seconds = Math.ceil(Number(event?.duration) || 0);
  switch (event?.type) {
    case 'mission-level-ready':
      return `NIVEAU ${up(levelTemplateLabelV188(event))} · ${event.routes} routes · ${event.zones} zones · ${event.events} événements`;
    case 'narrative-collectable-discovered':
      return `ARCHIVE RÉCUPÉRÉE · ${up(collectableLabelV188(event.collectableId, collectables))} · preuve persistée`;
    case 'narrative-route-unlocked':
      return event.accessKind === 'vent' || event.physicalVentOpen
        ? `ROUTE DÉBLOQUÉE · ${up(routeUnlockLabelV188(event, routes))} · conduit physique ouvert`
        : `ROUTE DÉBLOQUÉE · ${up(routeUnlockLabelV188(event, routes))} · porte physique confirmée`;
    case 'mission-level-event':
      return `ÉVÉNEMENT TERRAIN · ${up(levelEventLabelV188(event.eventId))}`;
    case 'mission-timer-started':
      return `HOLDOUT · ${up(levelTimerLabelV188(event.timerId))} · ${seconds} S`;
    case 'mission-timer-complete':
      return `HOLDOUT TERMINÉ · ${up(levelTimerLabelV188(event.timerId))} DÉVERROUILLÉE`;
    default: return null;
  }
}
