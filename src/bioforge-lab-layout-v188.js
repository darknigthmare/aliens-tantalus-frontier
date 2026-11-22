// V188 — Bioforge containment-lab layout (spec 013). Pure data and rules, no
// engine dependency. The historical V80 ribbon (2880×720, 1 m = 51 px, arena,
// doors, spawn slots and room ids) is unchanged: it is reorganised into eight
// named zones that follow the flow of a specimen, each inside one existing room.
// Visual props are named slots drawn as Canvas placeholders until art exists.
// Nothing here writes a save: interactions only read the existing V80 state.
import { BIOFORGE_WORLD_V80, BIOFORGE_ROOM_IDS_V80 } from './bioforge-level-v80.js';
import { getBioforgeRosterEntryV80 } from './bioforge-session-v80.js';
import { ENEMIES } from './content-core-v50.js';

const specimenNameV188 = (profileId) => getBioforgeRosterEntryV80(profileId)?.name
  || ENEMIES.find(enemy => enemy.id === profileId)?.name || 'SPÉCIMEN';

export const BIOFORGE_LAB_SCHEMA_V188 = 188;
export const BIOFORGE_LAB_INTERACTION_RANGE_V188 = 56;
// Kept equal to the V80 runtime constant (its module imports the engine chain).
export const BIOFORGE_LAB_STAGE_RADIUS_V188 = 142;
export const BIOFORGE_EXIT_DECON_SECONDS_V188 = 2.4; // [PROPOSÉ]
export const BIOFORGE_ENTRY_MIST_SECONDS_V188 = 1.6;
export const BIOFORGE_LAB_TANK_COUNT_V188 = 2;
export const BIOFORGE_LAB_PHASE_LABELS_V188 = Object.freeze({ configuration: 'CONFIGURATION', sealing: 'SCELLEMENT', printing: 'IMPRESSION',
  combat: 'COMBAT', result: 'RÉSULTAT', purging: 'PURGE', return: 'RETOUR' });

const freezeDeep = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freezeDeep(child);
  return value;
};

// ceilingY: visual ceiling of an enclosed room (human scale); null = open hall.
export const BIOFORGE_LAB_ZONES_V188 = freezeDeep([
  { id: 'cold-storage', roomId: 'control-room', x: 0, w: 170, ceilingY: 330, light: '#9fd4ff',
    label: 'STOCKAGE FROID', detail: '−80 °C · ÉCHANTILLONS', purpose: 'Tiroirs cryogéniques des échantillons conservés.' },
  { id: 'control', roomId: 'control-room', x: 170, w: 270, ceilingY: 330, light: '#cfe8d6',
    label: 'SALLE DE CONTRÔLE', detail: 'TERMINAL · BAIE D’OBSERVATION', purpose: 'Console opérateur et baie vitrée sur le laboratoire.' },
  { id: 'airlock-decon', roomId: 'airlock-inner', x: 440, w: 230, ceilingY: 360, light: '#7fd8d0',
    label: 'SAS BIOLOGIQUE', detail: 'DÉCONTAMINATION · DOUBLE PORTE', purpose: 'Chambre entre deux portes : brume au cycle de l’interlock.' },
  { id: 'admission-prep', roomId: 'airlock-outer', x: 670, w: 250, ceilingY: 360, light: '#e0b060',
    label: 'ADMISSION', detail: 'FILE DES SPÉCIMENS', purpose: 'Tableau de la file réelle, ouvert sur le hall des cuves.' },
  { id: 'tank-hall', roomId: 'printer-bay', x: 920, w: 360, ceilingY: null, light: '#86d49a',
    label: 'HALL DES CUVES', detail: 'STASE · IMPRIMANTE TISSULAIRE', purpose: 'Cuves de stase de la file et imprimante tissulaire.' },
  { id: 'containment-cell', roomId: 'containment-arena', x: 1280, w: 1180, ceilingY: null, light: '#d8e0d0',
    label: 'CELLULE DE CONFINEMENT', detail: 'GALERIE D’OBSERVATION · VERRE BLINDÉ', purpose: 'Cellule d’essai sous observation.' },
  { id: 'analysis-incinerator', roomId: 'return-lock', x: 2460, w: 208, ceilingY: 330, light: '#ffd2a0',
    label: 'BAIE D’ANALYSE', detail: 'DISSECTION · INCINÉRATEUR', purpose: 'Table de dissection et contrôle de l’incinérateur.' },
  { id: 'exit-decon', roomId: 'return-lock', x: 2668, w: 212, ceilingY: 360, light: '#7fd8d0',
    label: 'SAS DE SORTIE', detail: 'DÉCONTAMINATION OBLIGATOIRE', purpose: 'Douche de décontamination avant le retour au Tantalus.' }
]);

export const BIOFORGE_LAB_ZONE_IDS_V188 = Object.freeze(BIOFORGE_LAB_ZONES_V188.map(zone => zone.id));

// Depth band behind armoured glass: seen, never walked (documented limit).
export const BIOFORGE_OBSERVATION_GALLERY_V188 = freezeDeep({
  id: 'observation-gallery', zoneId: 'containment-cell', x: 1320, y: 124, w: 1100, h: 150,
  walkable: false, slot: 'bioforge-lab-observation-gallery'
});

// Named art slots (Canvas placeholders). layer: back (behind actors) or front.
export const BIOFORGE_LAB_PROPS_V188 = freezeDeep([
  { id: 'cryo-drawers', zoneId: 'cold-storage', slot: 'bioforge-lab-cryo-drawers', x: 14, y: 398, w: 140, h: 222, layer: 'back' },
  { id: 'monitor-wall', zoneId: 'control', slot: 'bioforge-lab-monitor-wall', x: 184, y: 372, w: 112, h: 74, layer: 'back' },
  { id: 'observation-window', zoneId: 'control', slot: 'bioforge-lab-observation-window', x: 304, y: 362, w: 120, h: 70, layer: 'back' },
  { id: 'control-console', zoneId: 'control', slot: 'bioforge-lab-control-console', x: 200, y: 548, w: 76, h: 72, layer: 'back', stationId: 'bioforge-control' },
  { id: 'pressure-gauge', zoneId: 'airlock-decon', slot: 'bioforge-lab-pressure-gauge', x: 524, y: 400, w: 64, h: 76, layer: 'back' },
  { id: 'decon-nozzles', zoneId: 'airlock-decon', slot: 'bioforge-lab-decon-nozzles', x: 460, y: 360, w: 190, h: 22, layer: 'back' },
  { id: 'admission-board', zoneId: 'admission-prep', slot: 'bioforge-lab-admission-board', x: 756, y: 378, w: 150, h: 96, layer: 'back' },
  { id: 'stasis-tank-1', zoneId: 'tank-hall', slot: 'bioforge-lab-stasis-tank', x: 932, y: 456, w: 56, h: 164, layer: 'back', tankIndex: 0 },
  { id: 'stasis-tank-2', zoneId: 'tank-hall', slot: 'bioforge-lab-stasis-tank', x: 996, y: 456, w: 56, h: 164, layer: 'back', tankIndex: 1 },
  { id: 'purge-vents', zoneId: 'containment-cell', slot: 'bioforge-lab-purge-vents', x: 1320, y: 92, w: 1100, h: 26, layer: 'back' },
  { id: 'incinerator-hatch', zoneId: 'analysis-incinerator', slot: 'bioforge-lab-incinerator', x: 2530, y: 344, w: 72, h: 86, layer: 'back' },
  { id: 'purge-console', zoneId: 'analysis-incinerator', slot: 'bioforge-lab-purge-console', x: 2540, y: 548, w: 50, h: 72, layer: 'back', stationId: 'bioforge-purge' },
  { id: 'dissection-table', zoneId: 'analysis-incinerator', slot: 'bioforge-lab-dissection-table', x: 2600, y: 556, w: 62, h: 64, layer: 'back' },
  { id: 'scanner-arm', zoneId: 'analysis-incinerator', slot: 'bioforge-lab-scanner-arm', x: 2617, y: 330, w: 28, h: 190, layer: 'back' },
  { id: 'exit-shower', zoneId: 'exit-decon', slot: 'bioforge-lab-exit-shower', x: 2672, y: 360, w: 92, h: 260, layer: 'back' },
  { id: 'return-console', zoneId: 'exit-decon', slot: 'bioforge-lab-return-console', x: 2700, y: 488, w: 40, h: 56, layer: 'back', stationId: 'bioforge-return' }
]);

// Face-on V80 bulkhead leaves (180 px atlas cell) cover this half-width at floor level.
export const BIOFORGE_DOOR_LEAF_HALF_WIDTH_V188 = 75;
export const BIOFORGE_DOOR_LEAF_TOP_V188 = 440;

export const BIOFORGE_LAB_PROP_SLOTS_V188 = Object.freeze([...new Set([
  ...BIOFORGE_LAB_PROPS_V188.map(prop => prop.slot), BIOFORGE_OBSERVATION_GALLERY_V188.slot,
  'bioforge-lab-partition', 'bioforge-lab-catwalk', 'bioforge-lab-ladder', 'bioforge-lab-zone-sign', 'bioforge-lab-tank-specimen'
])]);

// Laboratory interactions (E). Each reads state; none writes the save.
// mode: where it is physically reachable ('lab' before the cell, 'egress' after a purge).
export const BIOFORGE_LAB_INTERACTIONS_V188 = freezeDeep([
  { id: 'cold-storage-drawers', kind: 'cold-storage', zoneId: 'cold-storage', x: 84, mode: 'lab', prompt: 'E — CONSULTER LE STOCKAGE FROID' },
  { id: 'control-console', kind: 'terminal', zoneId: 'control', x: 238, stationId: 'bioforge-control', mode: 'lab', prompt: 'E — TERMINAL DE CONTRÔLE' },
  { id: 'incinerator-console', kind: 'incinerator', zoneId: 'analysis-incinerator', x: 2565, stationId: 'bioforge-purge', mode: 'egress', prompt: 'E — RAPPORT DE L’INCINÉRATEUR' },
  { id: 'dissection-table', kind: 'analysis', zoneId: 'analysis-incinerator', x: 2631, mode: 'egress', prompt: 'E — ANALYSE DE LA DERNIÈRE SESSION' },
  { id: 'exit-decon-console', kind: 'exit-decon', zoneId: 'exit-decon', x: 2720, stationId: 'bioforge-return', mode: 'egress', prompt: 'E — LANCER LA DÉCONTAMINATION' }
]);

const centerX = (entity) => Number(entity?.x || 0) + Number(entity?.w || 0) / 2;

export function getBioforgeLabZoneV188(x) {
  const value = Number(x);
  if (!Number.isFinite(value)) return null;
  return BIOFORGE_LAB_ZONES_V188.find(zone => value >= zone.x && value < zone.x + zone.w)
    || (value === BIOFORGE_WORLD_V80.width ? BIOFORGE_LAB_ZONES_V188.at(-1) : null);
}

/** The three historical entry stages, phrased as in-world prompts (same tests as interact()). */
export function resolveBioforgeStagePromptV188(level, actor, stage) {
  if (!level || !actor) return null;
  const actorCenter = { x: centerX(actor), y: Number(actor.y || 0) + Number(actor.h || 0) / 2 };
  const door = (id) => level.doors.find(entry => entry.id === id);
  const control = door('control-seal'), inner = door('inner-interlock');
  const printer = level.stations.find(({ type }) => type === 'printer');
  const doorDistance = (target) => target ? Math.abs(actorCenter.x - centerX(target)) : Infinity;
  const printerDistance = printer ? Math.hypot(actorCenter.x - centerX(printer), actorCenter.y - (printer.y + printer.h / 2)) : Infinity;
  if (stage === 0 && doorDistance(control) <= BIOFORGE_LAB_STAGE_RADIUS_V188)
    return { id: 'stage-control-seal', kind: 'stage', x: centerX(control), distance: doorDistance(control), prompt: 'E — OUVRIR LE SAS A' };
  if (stage === 1 && actorCenter.x > control.x && doorDistance(inner) <= BIOFORGE_LAB_STAGE_RADIUS_V188)
    return { id: 'stage-inner-interlock', kind: 'stage', x: centerX(inner), distance: doorDistance(inner), prompt: 'E — CYCLE D’INTERLOCK' };
  if (stage === 2 && actorCenter.x > inner.x && printerDistance <= BIOFORGE_LAB_STAGE_RADIUS_V188)
    return { id: 'stage-printer', kind: 'stage', x: centerX(printer), distance: Math.abs(actorCenter.x - centerX(printer)), prompt: 'E — ARMER L’IMPRIMANTE' };
  return null;
}

/**
 * Nearest interaction the operator can use now. `mode` is 'standby' (no
 * session), 'session' (configuration phase of a session) or 'egress'.
 */
export function resolveBioforgeLabInteractionV188(level, actor, { mode = null, stage = 0 } = {}) {
  if (!actor || actor.alive === false || !mode) return null;
  const candidates = [];
  if (mode === 'session') {
    const stagePrompt = resolveBioforgeStagePromptV188(level, actor, stage);
    if (stagePrompt) candidates.push(stagePrompt);
  }
  const reachable = mode === 'egress' ? 'egress' : 'lab';
  const x = centerX(actor);
  for (const interaction of BIOFORGE_LAB_INTERACTIONS_V188) {
    if (interaction.mode !== reachable) continue;
    const distance = Math.abs(x - interaction.x);
    if (distance <= BIOFORGE_LAB_INTERACTION_RANGE_V188) candidates.push({ ...interaction, distance });
  }
  candidates.sort((left, right) => left.distance - right.distance);
  return candidates[0] || null;
}

/** All composition lines of the session (or of the saved configuration) for the admission board. */
export function getBioforgeAdmissionBoardV188(root) {
  const session = root?.activeSession || null;
  const lines = Array.isArray(session?.composition) ? session.composition
    : Array.isArray(root?.configuration?.composition) ? root.configuration.composition : [];
  const queue = Array.isArray(session?.queue) ? session.queue : [];
  return Object.freeze(lines.map(line => {
    const entries = queue.filter(entry => entry.lineId === line.lineId);
    const waiting = session ? entries.filter(entry => entry.status === 'queued').length : Number(line.quantity) || 0;
    const printed = entries.filter(entry => entry.printedAt != null).length;
    return Object.freeze({ lineId: line.lineId, profileId: line.profileId, name: specimenNameV188(line.profileId),
      waiting, printed, state: session ? (waiting > 0 ? 'stasis' : 'drained') : 'configured' });
  }));
}

/** Up to two stasis tanks show the next composition lines that still wait. */
export function getBioforgeTankDisplayV188(root) {
  const rows = getBioforgeAdmissionBoardV188(root);
  const pending = rows.filter(row => row.state !== 'drained');
  const shown = (pending.length ? pending : rows.slice(-BIOFORGE_LAB_TANK_COUNT_V188)).slice(0, BIOFORGE_LAB_TANK_COUNT_V188);
  return Object.freeze(Array.from({ length: BIOFORGE_LAB_TANK_COUNT_V188 }, (_, index) => Object.freeze(shown[index]
    ? { ...shown[index] } : { lineId: null, profileId: null, name: null, waiting: 0, printed: 0, state: 'empty' })));
}

export function buildBioforgeColdStorageReportV188(root) {
  const records = root?.records && typeof root.records === 'object' ? Object.values(root.records) : [];
  const kept = records.filter(record => Number(record?.kills) > 0);
  const samples = kept.reduce((sum, record) => sum + Number(record.kills || 0), 0);
  return Object.freeze({ samples, profiles: kept.length,
    text: samples ? `STOCKAGE FROID · ${samples} ÉCHANTILLON(S) · ${kept.length} PROFIL(S)` : 'STOCKAGE FROID · AUCUN ÉCHANTILLON CONSERVÉ' });
}

export function buildBioforgeAnalysisReportV188(root) {
  const history = Array.isArray(root?.history) ? root.history : [];
  const last = history.at(-1) || null;
  if (!last) return Object.freeze({ sessionId: null, text: 'ANALYSE · AUCUNE SESSION ENREGISTRÉE' });
  const outcome = { cleared: 'CONFINEMENT TENU', failed: 'OPÉRATEUR NEUTRALISÉ', aborted: 'SESSION INTERROMPUE' }[last.outcome] || 'SESSION CLOSE';
  return Object.freeze({ sessionId: last.sessionId, outcome: last.outcome, printed: Number(last.printed) || 0, kills: Number(last.kills) || 0,
    text: `ANALYSE · ${outcome} · ${Number(last.printed) || 0} IMPRIMÉ(S) · ${Number(last.kills) || 0} NEUTRALISÉ(S)` });
}

export function buildBioforgeIncineratorReportV188(lastPurge) {
  if (!lastPurge?.completed) return Object.freeze({ completed: false, text: 'INCINÉRATEUR · AUCUN CYCLE CONFIRMÉ' });
  const report = lastPurge.report || {};
  const destroyed = Number(report.enemies ?? report.specimens ?? 0) || 0;
  return Object.freeze({ completed: true, destroyed,
    text: `INCINÉRATEUR · CYCLE CONFIRMÉ · CELLULE STÉRILE` });
}

/** Exit decontamination: a short timed cycle inside the shower booth. */
export function createBioforgeExitDeconV188() {
  return { schema: BIOFORGE_LAB_SCHEMA_V188, active: false, clock: 0, complete: false, interrupted: 0 };
}

export function stepBioforgeExitDeconV188(state, { dt = 0, inside = false } = {}) {
  if (!state || state.complete) return state;
  if (state.active && !inside) { state.active = false; state.clock = 0; state.interrupted += 1; return state; }
  if (!state.active) return state;
  state.clock = Math.min(BIOFORGE_EXIT_DECON_SECONDS_V188, state.clock + Math.max(0, Number(dt) || 0));
  if (state.clock >= BIOFORGE_EXIT_DECON_SECONDS_V188) { state.active = false; state.complete = true; }
  return state;
}

export function isInsideBioforgeExitBoothV188(level, actor) {
  const trigger = level?.returnTrigger;
  if (!trigger || !actor) return false;
  const x = centerX(actor);
  return x >= trigger.x && x <= trigger.x + trigger.w;
}

/** Geometry and access checks of the layout against an authored V80 level. */
export function validateBioforgeLabLayoutV188(level) {
  const errors = [];
  const rooms = new Map((level?.rooms || []).map(room => [room.id, room]));
  let cursor = 0;
  for (const zone of BIOFORGE_LAB_ZONES_V188) {
    if (zone.x !== cursor) errors.push(`zone-gap:${zone.id}`);
    cursor = zone.x + zone.w;
    const room = rooms.get(zone.roomId);
    if (!room || !BIOFORGE_ROOM_IDS_V80.includes(zone.roomId)) errors.push(`zone-room-missing:${zone.id}`);
    else if (zone.x < room.x || zone.x + zone.w > room.x + room.w) errors.push(`zone-outside-room:${zone.id}`);
    if (zone.ceilingY != null && (zone.ceilingY <= level.world.ceilingY || level.world.floorY - zone.ceilingY < 230))
      errors.push(`zone-ceiling:${zone.id}`);
  }
  if (cursor !== level?.world?.width) errors.push('zones-do-not-cover-world');
  const zones = new Map(BIOFORGE_LAB_ZONES_V188.map(zone => [zone.id, zone]));
  const doors = level?.doors || [];
  for (const prop of BIOFORGE_LAB_PROPS_V188) {
    const zone = zones.get(prop.zoneId);
    if (!zone || prop.x < zone.x || prop.x + prop.w > zone.x + zone.w) errors.push(`prop-outside-zone:${prop.id}`);
    if (prop.y + prop.h > level.world.floorY) errors.push(`prop-below-floor:${prop.id}`);
    if (prop.y + prop.h === level.world.floorY && doors.some(door => prop.x < door.x + door.w && prop.x + prop.w > door.x))
      errors.push(`prop-blocks-door:${prop.id}`);
    if (prop.y + prop.h > BIOFORGE_DOOR_LEAF_TOP_V188 && prop.y < level.world.floorY && doors.some(door =>
      prop.x < door.x + door.w / 2 + BIOFORGE_DOOR_LEAF_HALF_WIDTH_V188 && prop.x + prop.w > door.x + door.w / 2 - BIOFORGE_DOOR_LEAF_HALF_WIDTH_V188))
      errors.push(`prop-behind-door-leaf:${prop.id}`);
    if (prop.stationId) {
      const station = level.stations.find(entry => entry.id === prop.stationId);
      if (!station || Math.abs(centerX(station) - centerX(prop)) > 8) errors.push(`prop-station-mismatch:${prop.id}`);
    }
  }
  for (const interaction of BIOFORGE_LAB_INTERACTIONS_V188) {
    const zone = zones.get(interaction.zoneId);
    if (!zone || interaction.x < zone.x || interaction.x > zone.x + zone.w) errors.push(`interaction-outside-zone:${interaction.id}`);
    if (doors.some(door => Math.abs(interaction.x - centerX(door)) < BIOFORGE_DOOR_LEAF_HALF_WIDTH_V188)) errors.push(`interaction-at-door:${interaction.id}`);
    if (interaction.stationId) {
      const station = level.stations.find(entry => entry.id === interaction.stationId);
      if (!station || Math.abs(centerX(station) - interaction.x) > BIOFORGE_LAB_INTERACTION_RANGE_V188) errors.push(`interaction-station-mismatch:${interaction.id}`);
    }
    // 'lab' interactions lie before the first containment door; 'egress' ones after the cell exit.
    const arenaDoor = doors.find(door => door.id === 'arena-containment');
    const exitDoor = doors.find(door => door.id === 'arena-return');
    if (interaction.mode === 'lab' && interaction.x >= (doors.find(door => door.id === 'control-seal')?.x ?? 0)) errors.push(`lab-interaction-behind-airlock:${interaction.id}`);
    if (interaction.mode === 'egress' && (!exitDoor || interaction.x <= exitDoor.x + exitDoor.w)) errors.push(`egress-interaction-in-cell:${interaction.id}`);
    if (!arenaDoor) errors.push('missing-arena-door');
  }
  const gallery = BIOFORGE_OBSERVATION_GALLERY_V188;
  const arena = level?.arenaBounds;
  if (!arena || gallery.x < arena.x || gallery.x + gallery.w > arena.x + arena.w) errors.push('gallery-outside-cell');
  for (const platform of level?.platforms || []) {
    if (!platform.floor && gallery.y + gallery.h > platform.y) errors.push(`gallery-overlaps-catwalk:${platform.id}`);
  }
  const booth = level?.returnTrigger;
  const exitConsole = BIOFORGE_LAB_INTERACTIONS_V188.find(entry => entry.kind === 'exit-decon');
  if (!booth || exitConsole.x < booth.x || exitConsole.x > booth.x + booth.w) errors.push('exit-console-outside-booth');
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), zones: BIOFORGE_LAB_ZONES_V188.length });
}
