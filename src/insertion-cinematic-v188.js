// V188 — cinematic mission insertion and extraction: Tantalus ↔ UD-4L ↔ ground.
// Owner decisions 2026-11-15 (spec specs/003-insertion-extraction-cinematiques):
// - full sequence (≈45–60 s) the first time on a world, short one (≈12–15 s)
//   afterwards, unless the "always full" option is set; Escape/Enter/button skip;
// - the place type comes from the world data: atmospheric entry, powered descent
//   on an airless body, or approach and docking for a ship or station;
// - exterior shots, cockpit and troop-bay shots with live CRT screens driven by
//   one flight state, then a handover to the level (engine side, other agent);
// - the M577 rides under the belly when the mission deploys it.
// Everything is drawn with Canvas primitives as PLACEHOLDERS routed through the
// named slots of insertion-asset-slots-v188.js. Look based on documented
// references from Aliens (1986); not presented as 1:1 or franchise-certified.
// Values marked [PROPOSÉ] are project choices (bible, insertion fidelity table).
import { INSERTION_ASSET_SLOT_IDS_V188, InsertionAssetLoaderV188 } from './insertion-asset-slots-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const clamp01 = value => Math.max(0, Math.min(1, value));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = value => value < .5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
function hash(text) {
  let value = 2166136261;
  for (const char of String(text)) { value ^= char.codePointAt(0); value = Math.imul(value, 16777619) >>> 0; }
  return value >>> 0;
}

export const INSERTION_PLACE_TYPES_V188 = Object.freeze(['atmosphere', 'airless', 'space']);
export const INSERTION_MODES_V188 = Object.freeze(['foot', 'apc']);
export const INSERTION_DROPSHIP_ID_V188 = 'ud4l';
export const INSERTION_BOARDING_EVENT_V188 = 'extraction-boarding-complete-v188';
export const M577_VEHICLE_IDS_V188 = Object.freeze(['vehicle-001-m577-armored-personnel-carrier', 'vehicle-002-m577-command-apc']);
// Mirror of APC_MISSION_TEMPLATE_IDS_V188 (game-v52-level-runtime.js, engine-owned): the
// level templates where an M577 can physically roll out. A test keeps both lists equal.
export const INSERTION_APC_TEMPLATE_IDS_V188 = Object.freeze(['colony-multiroute', 'planet-exterior']);

// [PROPOSÉ] Worlds whose data carry no clear flag for the place type. Ships and
// stations named by the franchise are approached and docked; Cocyte (id
// world-05-lethe) has rain and a 2 000 m turbulence layer in CIN-00/CIN-03,
// although its generated atmosphere says vacuum.
export const INSERTION_PLACE_OVERRIDES_V188 = Object.freeze({
  'world-04-sevastopol': 'space', 'world-07-katanga': 'space', 'world-13-renaissance-station': 'space',
  'world-14-usm-auriga': 'space', 'world-15-uscss-nostromo': 'space', 'world-16-sulaco-drift': 'space',
  'world-17-gateway-station': 'space', 'world-05-lethe': 'atmosphere'
});
// Weather and local time: documented where noted, [PROPOSÉ] otherwise.
// Acheron: the film's landing at Hadley's Hope in high wind and rain, at night.
export const INSERTION_WEATHER_OVERRIDES_V188 = Object.freeze({
  'world-01-acheron-lv-426': Object.freeze({ weather: 'storm', timeOfDay: 'night' }),
  'world-05-lethe': Object.freeze({ weather: 'rain', timeOfDay: 'dusk' }),
  'world-12-jackson-s-star': Object.freeze({ weather: 'rain', timeOfDay: 'night' })
});

/** Pure: 'atmosphere' | 'airless' | 'space', from the world and campaign data. */
export function deriveInsertionPlaceTypeV188({ world = {}, campaign = null } = {}) {
  const override = INSERTION_PLACE_OVERRIDES_V188[world?.id];
  if (override) return override;
  const primary = String(world?.biomes?.[0] || '');
  if (primary === 'orbital' || primary === 'shipyard') return 'space';
  // A boarding operation meets a vessel in space whatever world it is listed under.
  if (/\bboard\b|drifting|derelict/i.test(String(campaign?.objective || ''))) return 'space';
  return world?.atmosphere === 'vacuum' ? 'airless' : 'atmosphere';
}

const WEATHER_BY_ATMOSPHERE = Object.freeze({ storm: 'storm', toxic: 'haze', corrosive: 'acid-rain', thin: 'dust', vacuum: 'none' });
function weatherFor(world, placeType) {
  if (placeType !== 'atmosphere') return 'none';
  const listed = WEATHER_BY_ATMOSPHERE[world?.atmosphere];
  if (listed && listed !== 'none') return listed;
  const biome = String(world?.biomes?.[0] || '');
  if (biome === 'cryogenic') return 'snow';
  if (biome === 'badlands' || biome === 'foundry') return 'dust';
  if (['oceanic', 'jungle', 'colony', 'industrial'].includes(biome)) return 'rain';
  return 'overcast';
}
const SKY = Object.freeze({
  storm: ['#0b1118', '#2c3944'], haze: ['#0d140a', '#45522a'], 'acid-rain': ['#171108', '#5c4619'], dust: ['#140d0a', '#5a3c2a'],
  rain: ['#0c1620', '#3d5562'], snow: ['#121a22', '#7d93a0'], overcast: ['#10181f', '#4c5d66'], none: ['#000000', '#05070a']
});
const TERRAIN = Object.freeze({
  industrial: ['#25292b', '#121516'], colony: ['#2c2822', '#141210'], orbital: ['#202326', '#0e1012'], badlands: ['#4a3324', '#21160f'],
  oceanic: ['#132a33', '#081419'], jungle: ['#17281b', '#0a140c'], cryogenic: ['#8ea3ad', '#46565e'], foundry: ['#3a2519', '#1a100b'],
  shipyard: ['#23272a', '#101214']
});
const TIME_LIGHT = Object.freeze({ night: .45, dusk: .75, dawn: .85, day: 1.1 });
function shade(hex, factor) {
  const value = parseInt(hex.slice(1), 16);
  const channel = shift => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * factor)));
  return `#${[16, 8, 0].map(channel).map(entry => entry.toString(16).padStart(2, '0')).join('')}`;
}
function coordinates(id) {
  const h = hash(`${id}:lz`), lat = (h % 7000) / 100, lon = ((h >>> 12) % 17900) / 100;
  const dms = value => `${Math.floor(value)}°${String(Math.floor((value % 1) * 60)).padStart(2, '0')}′`;
  return `${dms(lat)}${h & 1 ? 'S' : 'N'} ${dms(lon)}${h & 2 ? 'W' : 'E'}`;
}

/** Pure: what the cinematic shows of a world — sky, terrain, weather, time, coordinates. */
export function insertionWorldProfileV188(world = {}, { campaign = null } = {}) {
  const placeType = deriveInsertionPlaceTypeV188({ world, campaign });
  const override = INSERTION_WEATHER_OVERRIDES_V188[world?.id] || {};
  const weather = placeType === 'atmosphere' ? override.weather || weatherFor(world, placeType) : 'none';
  const h = hash(world?.id || 'unknown');
  const timeOfDay = override.timeOfDay || ['night', 'dusk', 'day', 'dawn'][h % 4]; // [PROPOSÉ] no world data
  const light = TIME_LIGHT[timeOfDay];
  const sky = (SKY[weather] || SKY.overcast).map((entry, index) => placeType === 'atmosphere' ? shade(entry, index ? light : Math.min(1, light + .2)) : entry);
  const terrain = (TERRAIN[world?.biomes?.[0]] || TERRAIN.colony).map(entry => shade(entry, placeType === 'airless' ? .9 : light));
  const hour = { night: 1, dusk: 19, day: 12, dawn: 6 }[timeOfDay] + (h >>> 8) % 3;
  return Object.freeze({
    worldId: world?.id || null, name: String(world?.name || '—'), sector: String(world?.sector || ''), placeType, weather, timeOfDay,
    sky: Object.freeze(sky), terrain: Object.freeze(terrain), coordinates: coordinates(world?.id || ''),
    localTime: `${String(hour % 24).padStart(2, '0')}:${String((h >>> 4) % 60).padStart(2, '0')}`,
    headingBase: h % 360, atmosphere: String(world?.atmosphere || '')
  });
}

/** Pure: the M577 rides under the belly only when the mission really deploys it. */
export function resolveInsertionModeV188({ vehicle = null, templateId = null, placeType = 'atmosphere' } = {}) {
  if (placeType === 'space' || !vehicle || !M577_VEHICLE_IDS_V188.includes(vehicle.id)) return 'foot';
  if (vehicle.deploymentReady === false || vehicle.deployable === false) return 'foot';
  return !templateId || INSERTION_APC_TEMPLATE_IDS_V188.includes(templateId) ? 'apc' : 'foot';
}

const SEEN_FIELDS = Object.freeze({ insertion: 'insertionSeenWorldIdsV188', extraction: 'extractionSeenWorldIdsV188' });
export function normalizeSeenWorldIdsV188(value) {
  return Array.isArray(value) ? [...new Set(value.filter(entry => typeof entry === 'string' && /^[a-z0-9-]{1,120}$/.test(entry)))].slice(-256) : [];
}
export function insertionSeenWorldIdsV188(save, direction = 'insertion') {
  return normalizeSeenWorldIdsV188(save?.strategy?.[SEEN_FIELDS[direction] || SEEN_FIELDS.insertion]);
}
/** Pure: full the first time on a world (or always, with the option), short afterwards. */
export function selectInsertionLengthV188({ worldId = null, seenWorldIds = [], alwaysFull = false } = {}) {
  const seen = Boolean(worldId) && normalizeSeenWorldIdsV188(seenWorldIds).includes(worldId);
  return Object.freeze({ short: Boolean(seen && !alwaysFull), firstVisit: !seen });
}
/** Records the world in the additive save field; returns true when the save changed. */
export function markInsertionWorldSeenV188(save, worldId, direction = 'insertion') {
  if (!save?.strategy || typeof worldId !== 'string') return false;
  const field = SEEN_FIELDS[direction] || SEEN_FIELDS.insertion, list = normalizeSeenWorldIdsV188(save.strategy[field]);
  if (list.includes(worldId)) { save.strategy[field] = list; return false; }
  save.strategy[field] = [...list, worldId].slice(-256);
  return true;
}

/** The additive option passed to engine.start() (contract with the engine side). */
export function buildInsertionHandoverV188({ world = {}, campaign = null, templateId = null, vehicle = null, short = false } = {}) {
  const placeType = deriveInsertionPlaceTypeV188({ world, campaign });
  return { mode: resolveInsertionModeV188({ vehicle, templateId, placeType }), placeType, dropshipId: INSERTION_DROPSHIP_ID_V188, short: Boolean(short) };
}
/** Pure: does an engine event close the in-level boarding (and carry a usable payload)? */
export function readBoardingEventV188(event) {
  if (event?.type !== INSERTION_BOARDING_EVENT_V188) return null;
  return { mode: INSERTION_MODES_V188.includes(event.mode) ? event.mode : 'foot',
    placeType: INSERTION_PLACE_TYPES_V188.includes(event.placeType) ? event.placeType : null };
}

// —— Sequences ——
// d = descent progress: 0 in the Tantalus bay, 1 on the ground (or docked).
// Each shot kind covers a fixed span of d, so the short version reads the same
// flight as the full one. Extraction runs the same profile backwards.
const SPAN = Object.freeze({
  atmosphere: { bay: [0, 0], 'cockpit-release': [0, 0], release: [0, .06], orbit: [.06, .22], entry: [.22, .55], 'troop-bay': [.55, .66],
    'cockpit-descent': [.66, .9], approach: [.9, 1], liftoff: [1, .94], 'cockpit-climb': [.92, .6], climb: [.6, .3], 'exit-atmosphere': [.3, .14],
    'orbit-return': [.14, .03], 'cockpit-rendezvous': [.05, .01], 'bay-return': [.01, 0] },
  airless: { bay: [0, 0], 'cockpit-release': [0, 0], release: [0, .06], orbit: [.06, .3], 'powered-descent': [.3, .62], 'troop-bay': [.62, .72],
    'cockpit-descent': [.72, .92], approach: [.92, 1], liftoff: [1, .94], 'cockpit-climb': [.92, .55], ascent: [.55, .18],
    'orbit-return': [.18, .03], 'cockpit-rendezvous': [.05, .01], 'bay-return': [.01, 0] },
  space: { bay: [0, 0], 'cockpit-release': [0, 0], release: [0, .08], transit: [.08, .45], 'troop-bay': [.45, .55], 'cockpit-dock': [.55, .9],
    docking: [.9, 1], undock: [1, .92], 'cockpit-undock': [.92, .8], 'transit-return': [.8, .3], 'orbit-return': [.3, .05],
    'cockpit-rendezvous': [.05, .01], 'bay-return': [.01, 0] }
});
const shot = (kind, seconds, line = null) => Object.freeze({ kind, seconds, line });
const SHOTS_V188 = Object.freeze({
  insertion: Object.freeze({
    atmosphere: Object.freeze({
      full: [shot('bay', 7, 'bay-ops'), shot('cockpit-release', 6, 'pilot-release'), shot('release', 6), shot('orbit', 6, 'pilot-orbit'),
        shot('entry', 9, 'pilot-entry'), shot('troop-bay', 7, 'sarge-insert'), shot('cockpit-descent', 8, 'pilot-descent'), shot('approach', 7, 'pilot-final')],
      short: [shot('release', 3), shot('entry', 4, 'pilot-entry'), shot('cockpit-descent', 3), shot('approach', 3, 'pilot-final')] }),
    airless: Object.freeze({
      full: [shot('bay', 7, 'bay-ops'), shot('cockpit-release', 6, 'pilot-release'), shot('release', 6), shot('orbit', 6, 'pilot-orbit'),
        shot('powered-descent', 8, 'pilot-burn'), shot('troop-bay', 6, 'sarge-insert'), shot('cockpit-descent', 7, 'pilot-descent'), shot('approach', 6, 'pilot-final')],
      short: [shot('release', 3), shot('powered-descent', 4, 'pilot-burn'), shot('cockpit-descent', 3), shot('approach', 3, 'pilot-final')] }),
    space: Object.freeze({
      full: [shot('bay', 7, 'bay-ops'), shot('cockpit-release', 6, 'pilot-release'), shot('release', 6), shot('transit', 7, 'pilot-orbit'),
        shot('troop-bay', 6, 'sarge-insert'), shot('cockpit-dock', 8, 'pilot-dock'), shot('docking', 7, 'pilot-docked')],
      short: [shot('release', 3), shot('transit', 3, 'pilot-orbit'), shot('cockpit-dock', 3), shot('docking', 4, 'pilot-docked')] })
  }),
  extraction: Object.freeze({
    atmosphere: Object.freeze({
      full: [shot('liftoff', 7, 'pilot-liftoff'), shot('troop-bay', 6, 'sarge-extract'), shot('cockpit-climb', 7, 'pilot-climb'), shot('climb', 7),
        shot('exit-atmosphere', 6), shot('orbit-return', 7, 'pilot-rendezvous'), shot('cockpit-rendezvous', 6), shot('bay-return', 7, 'bay-return')],
      short: [shot('liftoff', 3, 'pilot-liftoff'), shot('climb', 3), shot('orbit-return', 3, 'pilot-rendezvous'), shot('bay-return', 4, 'bay-return')] }),
    airless: Object.freeze({
      full: [shot('liftoff', 7, 'pilot-liftoff'), shot('troop-bay', 6, 'sarge-extract'), shot('cockpit-climb', 7, 'pilot-climb'), shot('ascent', 7),
        shot('orbit-return', 7, 'pilot-rendezvous'), shot('cockpit-rendezvous', 6), shot('bay-return', 7, 'bay-return')],
      short: [shot('liftoff', 3, 'pilot-liftoff'), shot('ascent', 3), shot('orbit-return', 3, 'pilot-rendezvous'), shot('bay-return', 4, 'bay-return')] }),
    space: Object.freeze({
      full: [shot('undock', 7, 'pilot-undock'), shot('troop-bay', 6, 'sarge-extract'), shot('cockpit-undock', 6), shot('transit-return', 7, 'pilot-climb'),
        shot('orbit-return', 7, 'pilot-rendezvous'), shot('cockpit-rendezvous', 6), shot('bay-return', 7, 'bay-return')],
      short: [shot('undock', 3, 'pilot-undock'), shot('transit-return', 3), shot('orbit-return', 3, 'pilot-rendezvous'), shot('bay-return', 4, 'bay-return')] })
  })
});
export const INSERTION_SHOT_KINDS_V188 = Object.freeze([...new Set(Object.values(SHOTS_V188).flatMap(byPlace => Object.values(byPlace)
  .flatMap(lengths => [...lengths.full, ...lengths.short].map(entry => entry.kind))))]);
const COCKPIT_KINDS = new Set(['cockpit-release', 'cockpit-descent', 'cockpit-climb', 'cockpit-dock', 'cockpit-undock', 'cockpit-rendezvous']);
export const insertionShotIsCockpitV188 = kind => COCKPIT_KINDS.has(kind);

// [PROPOSÉ] Radio lines (bible, insertion fidelity table). Pilot: Maksim Orlov (CIN-03).
const PILOT = t('MAKSIM ORLOV · PILOTE', 'MAKSIM ORLOV · PILOT'), OPS = t('TANTALUS · OPS', 'TANTALUS · OPS'), SARGE = t('TAMSIN VELEZ', 'TAMSIN VELEZ');
const say = (speaker, fr, en, radio = true) => Object.freeze({ speaker, text: t(fr, en), radio });
const LINES_V188 = Object.freeze({
  'bay-ops': () => say(OPS, 'Echo-9, baie deux dépressurisée. Portes ouvertes. Largage à mon top.', 'Echo-9, bay two depressurised. Doors open. Release on my mark.'),
  'pilot-release': () => say(PILOT, 'Pince de largage armée. Cinq secondes. Accrochez-vous.', 'Release clamp armed. Five seconds. Hang on.'),
  'pilot-orbit': p => p.placeType === 'space'
    ? say(PILOT, `Contact visuel sur ${p.name}. Aucune réponse de leur contrôle.`, `Visual on ${p.name}. No answer from their control.`)
    : p.placeType === 'airless'
      ? say(PILOT, `Cap sur ${p.name}. Pas d’atmosphère : descente propulsée jusqu’au sol.`, `Heading for ${p.name}. No atmosphere: powered descent all the way down.`)
      : say(PILOT, `On quitte le Tantalus. Cap sur ${p.name}. Fenêtre d’entrée dans quatre minutes.`, `Clear of the Tantalus. Heading for ${p.name}. Entry window in four minutes.`),
  'pilot-entry': () => say(PILOT, 'Interface d’entrée. On va perdre la radio quelques secondes.', 'Entry interface. We’ll lose comms for a few seconds.'),
  'pilot-burn': () => say(PILOT, 'Rétrofusées. Poussée à soixante pour cent.', 'Retro burn. Thrust at sixty percent.'),
  'sarge-insert': (p, mode) => mode === 'apc'
    ? say(SARGE, 'Équipage du M577 en place. Il touche le sol avant vous.', 'M577 crew in place. It hits the ground before you do.', false)
    : say(SARGE, 'Harnais verrouillés. Armes au repos jusqu’à la rampe.', 'Harnesses locked. Weapons safe until the ramp.', false),
  'pilot-descent': p => ({
    storm: say(PILOT, 'Vent de travers à quarante nœuds. Ça va secouer.', 'Crosswind at forty knots. It’ll get rough.'),
    rain: say(PILOT, 'Pluie sur la zone. Visibilité réduite, je passe aux instruments.', 'Rain over the zone. Low visibility, going to instruments.'),
    dust: say(PILOT, 'Poussière en suspension. Je pose au radar.', 'Dust in the air. Landing on radar.'),
    'acid-rain': say(PILOT, 'Pluie corrosive. Gardez les visières baissées.', 'Corrosive rain. Keep your visors down.'),
    snow: say(PILOT, 'Neige sur la zone. Je descends sous la couche.', 'Snow over the zone. Going below the layer.'),
    none: say(PILOT, 'Altimètre radar en ligne. La poussière du souffle va masquer le sol.', 'Radar altimeter online. Our blast will kick up dust.')
  }[p.weather] || say(PILOT, 'Plafond bas. Je descends sous la couche.', 'Low ceiling. Going below the layer.')),
  'pilot-final': (p, mode) => mode === 'apc'
    ? say(PILOT, 'Zone en vue. Je largue le M577 au toucher.', 'LZ in sight. Dropping the M577 at touchdown.')
    : say(PILOT, 'Zone en vue. Train sorti. Rampe dans trente secondes.', 'LZ in sight. Gear down. Ramp in thirty seconds.'),
  'pilot-dock': () => say(PILOT, 'Approche du collier d’amarrage. Vitesse relative un mètre seconde.', 'Approaching the docking collar. Closing at one metre per second.'),
  'pilot-docked': () => say(PILOT, 'Amarrage. Pression égalisée. Le sas est à vous.', 'Hard dock. Pressure equalised. The airlock is yours.'),
  'pilot-liftoff': (p, mode) => mode === 'apc'
    ? say(PILOT, 'M577 arrimé sous le ventre. On décolle.', 'M577 locked under the belly. Lifting off.')
    : say(PILOT, 'Tout le monde est à bord ? Rampe fermée. On décolle.', 'Everyone aboard? Ramp closed. Lifting off.'),
  'pilot-undock': () => say(PILOT, 'Désamarrage. On s’écarte du collier.', 'Undocking. Backing off the collar.'),
  'sarge-extract': () => say(SARGE, 'Comptez-vous. Personne ne reste en bas.', 'Sound off. Nobody stays down there.', false),
  'pilot-climb': p => say(PILOT, `Pleine poussée. On quitte ${p.name}.`, `Full thrust. Leaving ${p.name}.`),
  'pilot-rendezvous': () => say(PILOT, 'Tantalus, ici Echo-9, en approche de la baie deux.', 'Tantalus, Echo-9, on approach to bay two.'),
  'bay-return': () => say(OPS, 'Echo-9, pince en position. Bienvenue à bord.', 'Echo-9, clamp in position. Welcome aboard.')
});
export const INSERTION_LINE_IDS_V188 = Object.freeze(Object.keys(LINES_V188));

const PLACE_CAPTIONS = Object.freeze({
  bay: t('USS TANTALUS · BAIE DE LARGAGE 2', 'USS TANTALUS · DROP BAY 2'),
  release: t('LARGAGE · ORBITE HAUTE', 'RELEASE · HIGH ORBIT'),
  orbit: t('TRANSFERT ORBITAL', 'ORBITAL TRANSFER'),
  entry: t('ENTRÉE ATMOSPHÉRIQUE', 'ATMOSPHERIC ENTRY'),
  'powered-descent': t('DESCENTE PROPULSÉE · SANS ATMOSPHÈRE', 'POWERED DESCENT · NO ATMOSPHERE'),
  transit: t('APPROCHE · CIBLE EN DÉRIVE', 'APPROACH · TARGET ADRIFT'),
  docking: t('AMARRAGE', 'DOCKING'),
  approach: t('ZONE D’ATTERRISSAGE', 'LANDING ZONE'),
  'troop-bay': t('SOUTE DE TROUPE · UD-4L', 'TROOP BAY · UD-4L'),
  liftoff: t('DÉCOLLAGE', 'LIFT-OFF'), climb: t('MONTÉE', 'CLIMB'), 'exit-atmosphere': t('SORTIE D’ATMOSPHÈRE', 'ATMOSPHERE EXIT'),
  ascent: t('MONTÉE PROPULSÉE', 'POWERED ASCENT'), undock: t('DÉSAMARRAGE', 'UNDOCKING'), 'transit-return': t('RETOUR · TRANSIT', 'RETURN · TRANSIT'),
  'orbit-return': t('RENDEZ-VOUS · USS TANTALUS', 'RENDEZVOUS · USS TANTALUS'), 'bay-return': t('USS TANTALUS · BAIE DE LARGAGE 2', 'USS TANTALUS · DROP BAY 2')
});

/** Pure: the shots of one sequence and its total duration. */
export function buildInsertionSequenceV188({ direction = 'insertion', profile, mode = 'foot', short = false } = {}) {
  const place = INSERTION_PLACE_TYPES_V188.includes(profile?.placeType) ? profile.placeType : 'atmosphere';
  const way = direction === 'extraction' ? 'extraction' : 'insertion';
  const list = SHOTS_V188[way][place][short ? 'short' : 'full'];
  let start = 0;
  const shots = list.map(entry => {
    const span = SPAN[place][entry.kind] || [0, 0];
    const built = Object.freeze({ ...entry, start, span: Object.freeze(span), line: entry.line ? LINES_V188[entry.line](profile, mode) : null,
      lineId: entry.line, caption: PLACE_CAPTIONS[entry.kind] || null });
    start += entry.seconds; return built;
  });
  return Object.freeze({ direction: way, placeType: place, mode: place === 'space' ? 'foot' : mode, short: Boolean(short), profile,
    shots: Object.freeze(shots), duration: start });
}
export function insertionSequenceDurationV188(options) { return buildInsertionSequenceV188(options).duration; }

/** Pure: the shot playing at a time, with its local progress. */
export function insertionShotAtV188(sequence, time) {
  for (let index = 0; index < sequence.shots.length; index++) {
    const entry = sequence.shots[index];
    if (time < entry.start + entry.seconds) {
      const local = Math.max(0, time - entry.start);
      return { index, shot: entry, local, progress: clamp01(local / entry.seconds) };
    }
  }
  return null;
}

// —— Flight state, shared by every exterior view and every screen ——
function keyframes(points, d) {
  for (let index = 1; index < points.length; index++) {
    const [d0, v0] = points[index - 1], [d1, v1] = points[index];
    if (d <= d1) return lerp(v0, v1, d1 === d0 ? 1 : clamp01((d - d0) / (d1 - d0)));
  }
  return points.at(-1)[1];
}
const PROFILES = Object.freeze({
  atmosphere: { altitude: [[0, 300000], [.06, 290000], [.22, 122000], [.55, 28000], [.66, 9000], [.9, 1100], [.98, 40], [1, 0]],
    speed: [[0, 7700], [.22, 7650], [.55, 1700], [.66, 420], [.9, 120], [.98, 8], [1, 0]], pitch: [[0, 0], [.22, -38], [.55, -18], [.9, -6], [.97, 8], [1, 0]],
    countdown: 840 },
  airless: { altitude: [[0, 140000], [.06, 138000], [.3, 92000], [.62, 24000], [.72, 9000], [.92, 380], [.98, 15], [1, 0]],
    speed: [[0, 1680], [.3, 1500], [.62, 420], [.72, 180], [.92, 26], [.98, 2], [1, 0]], pitch: [[0, 0], [.3, -62], [.62, -40], [.92, -4], [1, 0]],
    countdown: 600 },
  space: { range: [[0, 26000], [.08, 25000], [.45, 6200], [.55, 3600], [.9, 40], [.97, 3], [1, 0]],
    speed: [[0, 60], [.45, 42], [.55, 26], [.9, 1.2], [.97, .3], [1, 0]], pitch: [[0, 0], [1, 0]], countdown: 480 }
});
const WEATHER_TURBULENCE = Object.freeze({ storm: 1, rain: .7, 'acid-rain': .65, dust: .6, snow: .55, haze: .5, overcast: .4, none: 0 });

/** Pure: the flight state at a time of a sequence. Drives views and screens. */
export function insertionFlightStateV188(sequence, time) {
  const at = insertionShotAtV188(sequence, Math.min(time, sequence.duration - 1e-6)) || { shot: sequence.shots.at(-1), progress: 1, local: 0 };
  const [from, to] = at.shot.span, d = clamp01(lerp(from, to, at.progress));
  const place = sequence.placeType, profile = PROFILES[place], extraction = sequence.direction === 'extraction';
  const weatherFactor = WEATHER_TURBULENCE[sequence.profile?.weather] ?? .4;
  let heat = 0, turbulence = 0;
  if (place === 'atmosphere') {
    heat = clamp01(1 - Math.abs(d - .4) / (extraction ? .26 : .17)) * (extraction ? .35 : 1);
    turbulence = Math.max(clamp01(1 - Math.abs(d - .42) / .16) * .75, d > .52 && d < .97 ? weatherFactor * .85 * Math.sin(Math.PI * (d - .52) / .45) : 0);
  } else if (place === 'airless') {
    turbulence = d > .28 && d < .98 ? .16 : 0; // engine vibration, no air
  } else turbulence = d > .05 && d < .97 ? .05 : 0;
  if (at.shot.kind === 'liftoff' || at.shot.kind === 'approach') turbulence = Math.max(turbulence, place === 'atmosphere' ? weatherFactor * .45 : .14);
  // Release countdown: to the end of the cockpit shot that arms the clamp.
  const releaseShot = sequence.direction === 'insertion' ? sequence.shots.find(entry => entry.kind === 'cockpit-release') : null;
  const releaseIn = releaseShot && time < releaseShot.start + releaseShot.seconds ? Math.max(0, releaseShot.start + releaseShot.seconds - time) : null;
  const heading = Math.round((sequence.profile?.headingBase ?? 0) + (extraction ? 180 : 0) + 14 * Math.sin(d * 5.2) + 360) % 360;
  const state = {
    d, direction: sequence.direction, placeType: place, shotKind: at.shot.kind,
    altitude: place === 'space' ? null : Math.round(keyframes(profile.altitude, d)),
    range: place === 'space' ? Math.round(keyframes(profile.range, d)) : null,
    speed: Math.round(keyframes(profile.speed, d) * 10) / 10,
    pitch: Math.round(keyframes(profile.pitch, d) * (extraction ? -1 : 1)),
    roll: Math.round(Math.sin(time * 1.3) * 6 * turbulence + (place === 'space' ? 0 : Math.sin(d * 9) * 4)),
    heading, heat: Math.round(heat * 100) / 100, turbulence: Math.round(turbulence * 100) / 100,
    countdown: Math.round((extraction ? d : 1 - d) * profile.countdown), releaseIn: releaseIn === null ? null : Math.ceil(releaseIn),
    alignment: place === 'space' ? Math.round(9 * Math.pow(1 - d, 1.4) * 10) / 10 : null,
    apcAttached: sequence.mode === 'apc' && (extraction ? d < .995 || at.shot.kind !== 'liftoff' || at.progress > .35 : d < .999),
    gearDown: place !== 'space' && d > .88, rampOpen: false
  };
  if (!extraction && (at.shot.kind === 'approach' || at.shot.kind === 'docking')) state.rampOpen = at.progress > .82;
  if (extraction && (at.shot.kind === 'liftoff' || at.shot.kind === 'undock')) state.rampOpen = at.progress < .25;
  state.warnings = insertionWarningsV188(state, sequence);
  return state;
}

const WARN = Object.freeze({
  'hull-temp': t('TEMP. COQUE', 'HULL TEMP'), 'comms-blackout': t('COMMS COUPÉES', 'COMMS BLACKOUT'), turbulence: t('TURBULENCES', 'TURBULENCE'),
  'wind-shear': t('CISAILLEMENT', 'WIND SHEAR'), 'gear-down': t('TRAIN SORTI', 'GEAR DOWN'), 'apc-clamps': t('M577 ARRIMÉ', 'M577 LOCKED'),
  'apc-release': t('M577 LARGUÉ', 'M577 RELEASED'), 'retro-burn': t('RÉTROFUSÉES', 'RETRO BURN'), proximity: t('PROXIMITÉ', 'PROXIMITY'),
  alignment: t('ALIGNEMENT', 'ALIGNMENT'), 'ramp-open': t('RAMPE OUVERTE', 'RAMP OPEN'), 'sink-rate': t('TAUX DE CHUTE', 'SINK RATE'),
  'systems-nominal': t('SYSTÈMES NOMINAUX', 'SYSTEMS NOMINAL')
});
export const INSERTION_WARNING_IDS_V188 = Object.freeze(Object.keys(WARN));
/** Pure: warnings from the flight state. level: nominal | caution | warning. */
export function insertionWarningsV188(state, sequence) {
  const list = [], add = (id, level) => list.push(Object.freeze({ id, level, label: WARN[id] }));
  if (state.heat > .55) add('hull-temp', 'warning');
  if (state.heat > .7) add('comms-blackout', 'caution');
  if (state.turbulence > .45) add('turbulence', 'caution');
  if (sequence.profile?.weather === 'storm' && state.d > .6 && state.d < .97) add('wind-shear', 'warning');
  if (state.placeType === 'airless' && state.d > .3 && state.d < .98) add('retro-burn', 'caution');
  if (state.altitude !== null && state.altitude > 0 && state.altitude < 2500 && state.speed > 90 && state.direction === 'insertion') add('sink-rate', 'caution');
  if (state.placeType === 'space' && state.range !== null && state.range < 600 && state.range > 0) add('proximity', 'caution');
  if (state.placeType === 'space' && state.alignment !== null && state.d > .5) add('alignment', state.alignment > 1 ? 'caution' : 'nominal');
  if (state.gearDown) add('gear-down', 'nominal');
  if (sequence.mode === 'apc') add(state.apcAttached ? 'apc-clamps' : 'apc-release', 'nominal');
  if (state.rampOpen) add('ramp-open', 'caution');
  if (!list.length) add('systems-nominal', 'nominal');
  return list;
}

const group = value => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const pad = value => String(value).padStart(2, '0');
/** Pure: the exact strings the live screens show for a flight state. */
export function insertionScreenModelV188(state, sequence, language = 'fr') {
  const en = language === 'en', profile = sequence.profile || {};
  const altitude = state.altitude === null ? null : state.altitude >= 10000 ? `${(state.altitude / 1000).toFixed(1)} KM` : `${group(state.altitude)} M`;
  const range = state.range === null ? null : state.range >= 10000 ? `${(state.range / 1000).toFixed(1)} KM` : `${group(state.range)} M`;
  const countdown = state.releaseIn !== null
    ? `${en ? 'RELEASE' : 'LARGAGE'} T−${pad(state.releaseIn)}`
    : `${state.direction === 'extraction' ? (en ? 'BAY' : 'BAIE') : (sequence.placeType === 'space' ? (en ? 'DOCK' : 'AMARRAGE') : (en ? 'TOUCHDOWN' : 'CONTACT'))} T−${pad(Math.floor(state.countdown / 60))}:${pad(state.countdown % 60)}`;
  return Object.freeze({
    world: profile.name || '—', sector: profile.sector || '',
    coordinates: sequence.placeType === 'space' ? `${en ? 'TARGET' : 'CIBLE'} ${profile.coordinates || ''}` : `LZ ${profile.coordinates || ''}`,
    localTime: `${en ? 'LOCAL' : 'LOCALE'} ${profile.localTime || '--:--'}`,
    heading: `${en ? 'HDG' : 'CAP'} ${String(state.heading).padStart(3, '0')}`,
    altitude: altitude === null ? null : `ALT ${altitude}`, range: range === null ? null : `${en ? 'RNG' : 'DIST'} ${range}`,
    speed: `${en ? 'SPD' : 'VIT'} ${state.speed >= 100 ? group(state.speed) : state.speed.toFixed(1)} M/S`,
    pitch: `${en ? 'PITCH' : 'TANGAGE'} ${state.pitch > 0 ? '+' : ''}${state.pitch}°`, roll: `${en ? 'ROLL' : 'ROULIS'} ${state.roll > 0 ? '+' : ''}${state.roll}°`,
    heat: `${en ? 'HULL' : 'COQUE'} ${Math.round(400 + state.heat * 1250)} K`, countdown,
    weather: weatherLabel(profile.weather, en),
    warnings: state.warnings.map(entry => Object.freeze({ id: entry.id, level: entry.level, text: entry.label[en ? 'en' : 'fr'] }))
  });
}
function weatherLabel(weather, en) {
  return ({ storm: ['TEMPÊTE', 'STORM'], rain: ['PLUIE', 'RAIN'], 'acid-rain': ['PLUIE CORROSIVE', 'CORROSIVE RAIN'], dust: ['POUSSIÈRE', 'DUST'],
    snow: ['NEIGE', 'SNOW'], haze: ['BRUME TOXIQUE', 'TOXIC HAZE'], overcast: ['COUVERT', 'OVERCAST'], none: ['VIDE', 'VACUUM'] }[weather] || ['—', '—'])[en ? 1 : 0];
}

// —— Drawing (Canvas primitives; each visual goes through an art slot) ——
const W = 1280, H = 720;
export const INSERTION_LETTERBOX_V188 = Math.round((H - W / 2.39) / 2);
const CRT = '#8df0b0', AMBER = '#e9d07a';
// Warning colours: shape + colour; colour-blind safe (Okabe–Ito) when the mode is on.
const LEVEL_COLOURS = Object.freeze({ nominal: ['#8df0b0', '#56b4e9'], caution: ['#e9d07a', '#f0e442'], warning: ['#e0564a', '#d55e00'] });
export const insertionLevelColourV188 = (level, colorblind = false) => (LEVEL_COLOURS[level] || LEVEL_COLOURS.nominal)[colorblind ? 1 : 0];
export const INSERTION_LEVEL_SHAPES_V188 = Object.freeze({ nominal: 'circle', caution: 'triangle', warning: 'diamond' });

const STARS = Array.from({ length: 240 }, (_, i) => {
  const h = hash(`star:${i}`);
  return [(h % 2048) / 2048, ((h >>> 11) % 1024) / 1024, 1 + (h >>> 21) % 3, .25 + ((h >>> 24) % 70) / 100];
});
function stars(ctx, assets, drift, alpha = 1) {
  assets.draw(ctx, 'starfield-deep', 0, 0, W, H, () => {
    ctx.fillStyle = '#e8f0f4';
    for (const [x, y, layer, a] of STARS) {
      const px = ((x * W * 1.6 - drift * layer * .5) % W + W) % W;
      ctx.globalAlpha = a * alpha; ctx.fillRect(px, y * H, layer > 2 ? 2 : 1.4, layer > 2 ? 2 : 1.4);
    }
    ctx.globalAlpha = 1;
  });
}
function letterbox(ctx) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, INSERTION_LETTERBOX_V188); ctx.fillRect(0, H - INSERTION_LETTERBOX_V188, W, INSERTION_LETTERBOX_V188); }

function dropship(ctx, assets, x, y, scale, { apc = false, ramp = 0, engine = 0, gear = false, heat = 0, lights = true, time = 0, tilt = 0, steady = false } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(scale, scale);
  if (apc) assets.draw(ctx, 'm577-side', -150, 18, 300, 125, () => apcShape(ctx, -150, 30, 1));
  assets.draw(ctx, 'ud4l-side', -320, -120, 640, 240, () => {
    // UD-4L side profile (placeholder): angular hull, chin turret, stub wing, twin booms/fins, rear ramp.
    if (engine > 0) {
      const flare = steady ? 1 : .85 + .15 * Math.sin(time * 40);
      const glow = ctx.createRadialGradient(-300, -10, 4, -300, -10, 110 * engine * flare);
      glow.addColorStop(0, 'rgba(190,230,255,.9)'); glow.addColorStop(.35, 'rgba(120,170,255,.35)'); glow.addColorStop(1, 'rgba(80,120,255,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(-300, -10, 110 * engine * flare, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#2b3128';
    ctx.beginPath(); ctx.moveTo(250, -6); ctx.lineTo(200, -46); ctx.lineTo(90, -60); ctx.lineTo(-170, -56); ctx.lineTo(-250, -40);
    ctx.lineTo(-300, -30); ctx.lineTo(-300, 4); ctx.lineTo(-170, 14); ctx.lineTo(-170, 30); ctx.lineTo(150, 30); ctx.lineTo(230, 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a4135'; ctx.fillRect(-150, -56, 250, 10); // dorsal spine
    ctx.fillStyle = '#20251f'; ctx.beginPath(); ctx.moveTo(-250, -40); ctx.lineTo(-312, -108); ctx.lineTo(-286, -108); ctx.lineTo(-220, -44); ctx.fill(); // fin (twin fins overlap in profile)
    ctx.fillStyle = '#262b23'; ctx.fillRect(-312, -60, 168, 14); // tail boom
    ctx.fillStyle = '#1b1f1a'; ctx.beginPath(); ctx.moveTo(-60, -20); ctx.lineTo(70, -14); ctx.lineTo(90, 0); ctx.lineTo(-70, 0); ctx.fill(); // stub wing
    ctx.fillStyle = '#30352c'; ctx.fillRect(10, -2, 70, 16); // weapon pod
    ctx.fillStyle = '#7d9aa1'; ctx.beginPath(); ctx.moveTo(240, -10); ctx.lineTo(196, -42); ctx.lineTo(150, -44); ctx.lineTo(160, -14); ctx.fill(); // canopy
    ctx.fillStyle = '#161915'; ctx.beginPath(); ctx.arc(205, 30, 15, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(205, 26, 42, 5); // chin turret and barrel
    ctx.fillStyle = AMBER; ctx.globalAlpha = .55; ctx.fillRect(-120, -44, 60, 4); ctx.fillRect(-40, -44, 14, 4); ctx.globalAlpha = 1; // hull markings
    ctx.fillStyle = '#1a1e19'; // rear ramp, hinged at the bottom of the tail
    ctx.save(); ctx.translate(-170, 30); ctx.rotate(ramp * .9); ctx.fillRect(-90, -6, 90, 8); ctx.restore();
    if (ramp > .1) { ctx.fillStyle = 'rgba(220,60,50,.55)'; ctx.fillRect(-176, -30, 8, 56); }
    if (gear) { ctx.fillStyle = '#121411'; for (const gx of [-140, 120]) { ctx.fillRect(gx, 30, 6, 32); ctx.fillRect(gx - 12, 60, 30, 6); } }
    if (lights) {
      const on = steady || Math.sin(time * 6) > 0;
      ctx.fillStyle = on ? '#ff5a4a' : '#5a1a16'; ctx.fillRect(-306, -112, 6, 6);
      ctx.fillStyle = on ? '#8dff9a' : '#1e4a24'; ctx.fillRect(84, -6, 6, 6);
    }
    if (heat > 0) {
      const sheath = ctx.createRadialGradient(240, 4, 4, 240, 4, 140);
      sheath.addColorStop(0, `rgba(255,236,190,${.9 * heat})`); sheath.addColorStop(.4, `rgba(255,140,60,${.55 * heat})`); sheath.addColorStop(1, 'rgba(255,80,30,0)');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = sheath; ctx.beginPath(); ctx.arc(240, 4, 140, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  });
  ctx.restore();
}
function apcShape(ctx, x, y, scale) {
  // M577 side silhouette (placeholder): long low wedge hull, four road wheels, rear roof turret.
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = '#2d3229'; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(28, 8); ctx.lineTo(250, 4); ctx.lineTo(296, 22); ctx.lineTo(300, 70); ctx.lineTo(10, 72); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#23271f'; ctx.fillRect(200, -10, 64, 16); ctx.fillRect(210, -16, 70, 6); // turret and twin barrels
  ctx.fillStyle = '#121411'; for (const wx of [50, 115, 180, 245]) { ctx.beginPath(); ctx.arc(wx, 76, 20, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#4a4f44'; for (const wx of [50, 115, 180, 245]) { ctx.beginPath(); ctx.arc(wx, 76, 7, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = 'rgba(233,208,122,.5)'; ctx.lineWidth = 2; ctx.strokeRect(120, 22, 46, 36); // side door
  ctx.restore();
}
function tantalusHull(ctx, assets, x, y, scale, bayOpen = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  assets.draw(ctx, 'tantalus-hull-exterior', -800, -250, 1600, 500, () => {
    // USS Tantalus underside (project adaptation, not the Sulaco): long blocky hull, masts, lit drop bay.
    ctx.fillStyle = '#2a2e31'; ctx.fillRect(-780, -120, 1500, 150);
    ctx.fillStyle = '#353a3e'; ctx.fillRect(-700, -170, 900, 60); ctx.fillRect(320, -150, 300, 40);
    ctx.fillStyle = '#1d2023'; for (let i = -760; i < 700; i += 64) ctx.fillRect(i, -116, 4, 140);
    ctx.fillStyle = '#3f454a'; ctx.beginPath(); ctx.moveTo(720, -120); ctx.lineTo(800, -60); ctx.lineTo(720, 30); ctx.fill();
    ctx.fillStyle = '#25292c'; ctx.fillRect(-60, -230, 6, 70); ctx.fillRect(140, -210, 4, 60); // masts
    ctx.fillStyle = `rgba(255,120,80,${.35 + .45 * bayOpen})`; ctx.fillRect(140, 24, 260, 10 + 14 * bayOpen); // drop-bay opening
    ctx.fillStyle = '#e9d07a'; for (let i = 140; i < 400; i += 26) ctx.fillRect(i, 22, 12, 3);
    for (const lx of [-700, -300, 100, 600]) { ctx.fillStyle = 'rgba(255,90,70,.8)'; ctx.fillRect(lx, 30, 5, 5); }
  });
  ctx.restore();
}
function planetBody(ctx, assets, profile, cx, cy, r, { airless = false, time = 0 } = {}) {
  assets.draw(ctx, airless ? 'moon-limb' : 'planet-limb', 0, 0, W, H, () => {
    const [near, far] = profile.terrain, sky = profile.sky;
    const body = ctx.createRadialGradient(cx - r * .3, cy - r * .5, r * .2, cx, cy, r);
    body.addColorStop(0, shade(near, 1.6)); body.addColorStop(1, shade(far, .6));
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    if (airless) {
      // craters seen at a grazing angle: flattened dark bowls with a lit rim
      for (let i = 0; i < 34; i++) {
        const h = hash(`crater:${profile.worldId}:${i}`), px = cx - r * .9 + (h % 1000) / 1000 * r * 1.8, py = cy - r + 20 + ((h >>> 10) % 1000) / 1000 * r * .5;
        const rx = 5 + (h >>> 20) % 26, depth = clamp01((py - (cy - r)) / (r * .5));
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(px, py, rx * (.6 + depth), rx * (.18 + depth * .25), 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(px, py + 1, rx * (.6 + depth), rx * (.18 + depth * .25), 0, 0, Math.PI); ctx.stroke();
      }
      const terminator = ctx.createLinearGradient(cx - r, 0, cx + r * .4, 0); terminator.addColorStop(0, 'rgba(0,0,0,0)'); terminator.addColorStop(1, 'rgba(0,0,0,.55)');
      ctx.fillStyle = terminator; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = shade(sky[1], 1.4); ctx.globalAlpha = .35;
      for (let i = 0; i < 9; i++) { const bandY = cy - r + 30 + i * 38; ctx.fillRect(cx - r + ((time * 4 + i * 90) % 200) - 100, bandY, r * 2.2, 10 + (i % 3) * 6); }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (!airless) { ctx.strokeStyle = shade(sky[1], 2.2); ctx.globalAlpha = .7; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, r + 4, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.globalAlpha = 1; }
  });
}
function vessel(ctx, assets, x, y, scale, time, steady) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  assets.draw(ctx, 'target-vessel', -800, -350, 1600, 700, () => {
    ctx.fillStyle = '#25282b'; ctx.fillRect(-760, -160, 1400, 300); ctx.fillStyle = '#1b1d20'; ctx.fillRect(-600, -260, 500, 110); ctx.fillRect(200, 130, 380, 90);
    ctx.fillStyle = '#303438'; for (let i = -740; i < 620; i += 80) ctx.fillRect(i, -150, 40, 6);
    ctx.fillStyle = 'rgba(160,200,210,.25)'; for (let i = -700; i < 600; i += 46) ctx.fillRect(i, -40, 14, 8);
    ctx.fillStyle = '#3a3f44'; ctx.fillRect(560, -60, 120, 120); ctx.fillStyle = '#111'; ctx.fillRect(640, -40, 40, 80); // docking collar
    const on = steady || Math.sin(time * 4) > 0; ctx.fillStyle = on ? '#8dff9a' : '#244a2a';
    for (const ly of [-56, 52]) ctx.fillRect(676, ly, 8, 8);
    ctx.fillStyle = 'rgba(30,10,8,.6)'; ctx.beginPath(); ctx.ellipse(-200, 40, 160, 60, .2, 0, Math.PI * 2); ctx.fill(); // scorched plating
  });
  ctx.restore();
}
function clouds(ctx, assets, profile, scroll, y, height, alpha, slotId = 'cloud-far') {
  assets.draw(ctx, slotId, 0, y - height, W, height * 2, () => {
    ctx.fillStyle = shade(profile.sky[1], 1.25); ctx.globalAlpha = alpha;
    for (let i = 0; i < 14; i++) {
      const h = hash(`${slotId}:${i}`), cx = (((h % 1600) - scroll) % (W + 400) + W + 400) % (W + 400) - 200;
      ctx.beginPath(); ctx.ellipse(cx, y + ((h >>> 12) % 60) - 30, 140 + (h >>> 18) % 160, height * (.35 + ((h >>> 8) % 40) / 100), 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}
function terrainHeight(seed, x) { return Math.sin(x * .004 + seed) * 40 + Math.sin(x * .011 + seed * 2) * 18 + Math.sin(x * .031 + seed * 3) * 6; }
function terrain(ctx, assets, profile, scroll, horizon, slotId = 'terrain-far', near = false) {
  assets.draw(ctx, slotId, 0, horizon - 120, W, H - horizon + 120, () => {
    const seed = (hash(profile.worldId || 'x') % 100) / 10 + (near ? 4 : 0), scale = near ? 2.2 : 1;
    ctx.fillStyle = profile.terrain[near ? 1 : 0]; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, horizon - terrainHeight(seed, x + scroll) * scale);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    if (!near) { // an atmosphere-processor-like tower on the far ridge [PROPOSÉ]
      const tx = ((640 - scroll * .5) % (W + 200) + W + 200) % (W + 200) - 100;
      ctx.fillRect(tx, horizon - 120, 26, 90); ctx.fillRect(tx - 14, horizon - 70, 54, 16);
      ctx.fillStyle = 'rgba(255,90,70,.8)'; ctx.fillRect(tx + 10, horizon - 126, 6, 6);
    }
  });
}
function weather(ctx, profile, time, reducedMotion, intensity = 1) {
  const kind = profile.weather;
  if (kind === 'none' || kind === 'overcast') return;
  const count = Math.round((kind === 'storm' ? 220 : 140) * intensity);
  const colour = { storm: 'rgba(170,200,215,.4)', rain: 'rgba(160,190,205,.35)', 'acid-rain': 'rgba(210,190,90,.35)', dust: 'rgba(200,150,100,.28)',
    snow: 'rgba(230,240,245,.6)', haze: 'rgba(150,180,90,.18)' }[kind];
  ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const speed = kind === 'snow' ? 60 : kind === 'dust' || kind === 'haze' ? 90 : 700;
    const x = ((i * 97 + (kind === 'dust' || kind === 'haze' ? time * 300 : time * 120)) % W + W) % W;
    const y = ((i * 53 + time * speed) % (H + 40)) - 20;
    if (kind === 'snow' || kind === 'dust' || kind === 'haze') ctx.rect(x, y, 2, 2); else { ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 18); }
  }
  if (kind === 'snow' || kind === 'dust' || kind === 'haze') ctx.fill(); else ctx.stroke();
  if (kind === 'haze' || kind === 'dust') { ctx.fillStyle = kind === 'haze' ? 'rgba(110,140,60,.16)' : 'rgba(150,100,60,.16)'; ctx.fillRect(0, 0, W, H); }
  // Lightning: a flash, so never with reduced motion.
  if (kind === 'storm' && !reducedMotion && Math.sin(time * 1.7) > .985) { ctx.fillStyle = 'rgba(220,235,255,.22)'; ctx.fillRect(0, 0, W, H); }
}
function plasma(ctx, assets, cx, cy, heat, time, steady) {
  if (heat <= 0) return;
  assets.draw(ctx, 'entry-plasma', 0, 0, W, H, () => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const h = hash(`plasma:${i}`), angle = (i / 26) * Math.PI * 2 + ((h % 100) / 100 - .5) * .3;
      const len = (220 + (h >>> 10) % 360) * heat, phase = steady ? .5 : ((time * 2.4 + i * .13) % 1);
      const r0 = 90 + phase * 90;
      ctx.strokeStyle = `rgba(255,${150 + (h >>> 20) % 80},80,${.45 * heat * (1 - phase * .6)})`; ctx.lineWidth = 2 + (h >>> 24) % 4;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(angle) * r0, cy + Math.sin(angle) * r0 * .7);
      ctx.lineTo(cx + Math.cos(angle) * (r0 + len), cy + Math.sin(angle) * (r0 + len) * .7); ctx.stroke();
    }
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 260 * heat + 40);
    glow.addColorStop(0, `rgba(255,240,200,${.85 * heat})`); glow.addColorStop(.3, `rgba(255,140,50,${.5 * heat})`); glow.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 260 * heat + 40, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}
function skyFor(ctx, profile, state) {
  if (profile.placeType !== 'atmosphere') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return 1; }
  const thick = clamp01((120000 - (state.altitude ?? 0)) / 100000); // 0 in space, 1 under 20 km
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, shade(profile.sky[0], thick)); gradient.addColorStop(1, shade(profile.sky[1], .2 + thick * .8));
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
  return 1 - thick; // star visibility
}

// —— Live CRT screens ——
function crt(ctx, assets, x, y, w, h, title, colour, body) {
  ctx.fillStyle = '#020604'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.font = '700 12px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = .9; ctx.fillText(title, x + 8, y + 15); ctx.globalAlpha = 1;
  body(x, y + 20, w, h - 20);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; for (let sy = y; sy < y + h; sy += 3) ctx.fillRect(x, sy, w, 1); // scanlines
  ctx.restore();
  assets.draw(ctx, 'crt-bezel', x - 8, y - 8, w + 16, h + 16, () => { ctx.strokeStyle = '#2a2e2b'; ctx.lineWidth = 8; ctx.strokeRect(x - 4, y - 4, w + 8, h + 8); ctx.lineWidth = 1; });
}
function levelShape(ctx, level, x, y, size, colour) {
  ctx.fillStyle = colour; ctx.beginPath();
  if (level === 'warning') { ctx.moveTo(x, y - size); ctx.lineTo(x + size, y); ctx.lineTo(x, y + size); ctx.lineTo(x - size, y); }
  else if (level === 'caution') { ctx.moveTo(x, y - size); ctx.lineTo(x + size, y + size * .8); ctx.lineTo(x - size, y + size * .8); }
  else ctx.arc(x, y, size * .8, 0, Math.PI * 2);
  ctx.closePath(); ctx.fill();
}
function navDisplay(ctx, assets, x, y, w, h, model, state, sequence, colour, time) {
  crt(ctx, assets, x, y, w, h, 'NAV', colour, (bx, by, bw, bh) => {
    ctx.font = '700 15px monospace'; ctx.fillText(model.world.toUpperCase().slice(0, 26), bx + 8, by + 14);
    ctx.font = '12px monospace'; ctx.fillText(model.coordinates, bx + 8, by + 30); ctx.fillText(`${model.heading}  ${model.localTime}`, bx + 8, by + 45);
    ctx.fillText(model.weather, bx + 8, by + 60);
    // compass rose with the heading tape
    const cx = bx + bw - 62, cy = by + 58, r = 46; ctx.globalAlpha = .8; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    for (let a = 0; a < 360; a += 30) { const ang = (a - state.heading) * Math.PI / 180; ctx.beginPath(); ctx.moveTo(cx + Math.sin(ang) * (r - 6), cy - Math.cos(ang) * (r - 6)); ctx.lineTo(cx + Math.sin(ang) * r, cy - Math.cos(ang) * r); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx, cy - r + 8); ctx.lineTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    // trajectory: a dot moving along the descent arc
    ctx.beginPath(); ctx.moveTo(bx + 10, by + bh - 14); ctx.quadraticCurveTo(bx + bw * .4, by + 70, bx + bw - 16, by + bh - 20); ctx.globalAlpha = .45; ctx.stroke(); ctx.globalAlpha = 1;
    const k = state.d, px = lerp(lerp(bx + 10, bx + bw * .4, k), lerp(bx + bw * .4, bx + bw - 16, k), k), py = lerp(lerp(by + bh - 14, by + 70, k), lerp(by + 70, by + bh - 20, k), k);
    ctx.fillRect(px - 3, py - 3, 6, 6);
    if (Math.floor(time * 2) % 2) ctx.strokeRect(bx + bw - 22, by + bh - 26, 12, 12); // target box blinks (no flash)
  });
}
function terrainRadar(ctx, assets, x, y, w, h, profile, state, colour, sequence) {
  const title = sequence.placeType === 'space' ? (state.direction === 'extraction' ? 'TRANSIT' : 'DOCK') : 'TERRAIN';
  crt(ctx, assets, x, y, w, h, title, colour, (bx, by, bw, bh) => {
    const horizon = by + 26, seed = (hash(profile.worldId || 'x') % 100) / 10;
    ctx.lineWidth = 1; ctx.globalAlpha = .55;
    if (sequence.placeType === 'space') {
      // docking reticle: the collar box closes in while the alignment error shrinks
      const cx = bx + bw / 2, cy = by + bh / 2, size = 18 + (1 - clamp01((state.range ?? 0) / 26000)) * 70, off = (state.alignment ?? 0) * 3;
      ctx.globalAlpha = 1; ctx.strokeRect(cx - size + off, cy - size * .7 - off * .5, size * 2, size * 1.4);
      ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20); ctx.stroke();
      ctx.globalAlpha = .4; for (let i = 1; i < 5; i++) ctx.strokeRect(cx - i * 30, cy - i * 20, i * 60, i * 40);
      ctx.globalAlpha = 1; return;
    }
    // perspective grid (horizontal rows scroll toward the viewer with speed)
    const scroll = (state.d * 4000) % 1;
    for (let i = 0; i < 9; i++) { const k = (i + scroll) / 9, yy = horizon + Math.pow(k, 2) * (bh - 26); ctx.beginPath(); ctx.moveTo(bx, yy); ctx.lineTo(bx + bw, yy); ctx.stroke(); }
    for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(bx + bw / 2 + i * 8, horizon); ctx.lineTo(bx + bw / 2 + i * 70, by + bh); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // vector terrain contours: height grows as the altitude falls; they scroll with the descent
    const agl = clamp01(1 - (state.altitude ?? 0) / 30000);
    for (let row = 0; row < 5; row++) {
      const k = (row + scroll) / 5, base = horizon + Math.pow(k, 1.6) * (bh - 30), amp = (8 + k * 26) * (.25 + agl);
      ctx.beginPath();
      for (let i = 0; i <= 32; i++) { const px = bx + (i / 32) * bw, wx = (i - 16) * (30 / (k + .2)) + state.d * 9000 + row * 400; const py = base - Math.max(0, terrainHeight(seed, wx)) / 60 * amp; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke();
    }
    // landing zone marker once below 12 km
    if ((state.altitude ?? 1e9) < 12000) { const s = 8 + agl * 18; ctx.strokeRect(bx + bw / 2 - s, by + bh * .62 - s / 2, s * 2, s); ctx.font = '11px monospace'; ctx.fillText('LZ', bx + bw / 2 + s + 4, by + bh * .62 + 4); }
  });
}
function telemetry(ctx, assets, x, y, w, h, model, state, colour) {
  crt(ctx, assets, x, y, w, h, 'TELEMETRY', colour, (bx, by, bw, bh) => {
    // attitude indicator: horizon line rotated by roll, shifted by pitch
    const cx = bx + 70, cy = by + bh / 2, r = Math.min(60, bh / 2 - 6);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip(); ctx.translate(cx, cy); ctx.rotate(-state.roll * Math.PI / 180);
    ctx.globalAlpha = .25; ctx.fillRect(-r, state.pitch * 1.2, r * 2, r * 2); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(-r, state.pitch * 1.2); ctx.lineTo(r, state.pitch * 1.2); ctx.stroke();
    for (let p = -30; p <= 30; p += 10) if (p) { ctx.beginPath(); ctx.moveTo(-14, state.pitch * 1.2 - p * 1.2); ctx.lineTo(14, state.pitch * 1.2 - p * 1.2); ctx.stroke(); }
    ctx.restore(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 24, cy); ctx.lineTo(cx - 8, cy); ctx.lineTo(cx, cy + 6); ctx.lineTo(cx + 8, cy); ctx.lineTo(cx + 24, cy); ctx.stroke();
    ctx.font = '700 15px monospace'; const tx = bx + 150;
    ctx.fillText(model.altitude || model.range, tx, by + 18); ctx.fillText(model.speed, tx, by + 38);
    ctx.font = '12px monospace'; ctx.fillText(model.pitch, tx, by + 58); ctx.fillText(model.roll, tx, by + 74);
    if (state.placeType === 'atmosphere') ctx.fillText(model.heat, tx, by + 90);
    // altitude tape bar
    const fill = state.placeType === 'space' ? clamp01((state.range ?? 0) / 26000) : clamp01((state.altitude ?? 0) / 300000);
    ctx.strokeRect(bx + bw - 22, by + 4, 10, bh - 12); ctx.fillRect(bx + bw - 22, by + 4 + (bh - 12) * (1 - fill), 10, (bh - 12) * fill);
  });
}
function systems(ctx, assets, x, y, w, h, model, colorblind) {
  crt(ctx, assets, x, y, w, h, 'SYSTEMS', CRT, (bx, by) => {
    ctx.font = '700 13px monospace';
    model.warnings.slice(0, 5).forEach((entry, index) => {
      const colour = insertionLevelColourV188(entry.level, colorblind), ly = by + 14 + index * 20;
      levelShape(ctx, entry.level, bx + 16, ly - 4, 6, colour); ctx.fillStyle = colour; ctx.fillText(entry.text, bx + 30, ly);
    });
    ctx.fillStyle = AMBER; ctx.font = '700 15px monospace'; ctx.fillText(model.countdown, bx + 8, by + h - 30);
  });
}
function commsBox(ctx, assets, x, y, w, h, line, language, time, steady) {
  crt(ctx, assets, x, y, w, h, 'COMMS', AMBER, (bx, by, bw, bh) => {
    assets.draw(ctx, 'comms-pilot', bx + 6, by + 4, 56, 56, () => {
      ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(bx + 34, by + 26, 16, Math.PI, 0); ctx.fill(); ctx.fillRect(bx + 18, by + 26, 32, 22);
      ctx.globalAlpha = 1; ctx.fillStyle = '#020604'; ctx.fillRect(bx + 24, by + 22, 20, 8); ctx.fillStyle = AMBER;
    });
    const level = line && !steady ? .4 + .6 * Math.abs(Math.sin(time * 11)) : line ? .7 : .05;
    for (let i = 0; i < 18; i++) { const bar = (Math.abs(Math.sin(i * 1.7 + time * (steady ? 0 : 9))) * .8 + .2) * level * (bh - 18); ctx.fillRect(bx + 72 + i * 7, by + bh - 6 - bar * .8, 4, bar * .8); }
    ctx.font = '11px monospace'; ctx.fillStyle = AMBER; ctx.fillText(line ? line.speaker[language === 'en' ? 'en' : 'fr'] : (language === 'en' ? 'CHANNEL OPEN' : 'CANAL OUVERT'), bx + 72, by + 12);
  });
}

function cockpit(ctx, assets, sequence, state, local, time, options) {
  const { profile } = sequence, lang = options.language, model = insertionScreenModelV188(state, sequence, lang);
  // canopy view
  ctx.save(); ctx.beginPath(); ctx.moveTo(120, 100); ctx.lineTo(1160, 100); ctx.lineTo(1060, 330); ctx.lineTo(220, 330); ctx.closePath(); ctx.clip();
  const starAlpha = skyFor(ctx, profile, state);
  if (starAlpha > .05) stars(ctx, assets, time * 30, starAlpha);
  if (sequence.placeType === 'space') {
    if (state.shotKind === 'cockpit-rendezvous' || state.shotKind === 'cockpit-release') tantalusHull(ctx, assets, 640, 220, .4 + (1 - state.d) * .2);
    else vessel(ctx, assets, 640, 220, .12 + (1 - clamp01((state.range ?? 0) / 26000)) * .45, time, options.reducedMotion);
  } else if (state.shotKind === 'cockpit-release' || state.shotKind === 'cockpit-rendezvous') {
    tantalusHull(ctx, assets, 640, state.shotKind === 'cockpit-release' ? 190 : 230, .5);
  } else {
    const horizon = 330 - clamp01(1 - (state.altitude ?? 0) / 30000) * 120 + state.pitch * 1.2;
    if ((state.altitude ?? 0) > 20000 && sequence.placeType === 'atmosphere') clouds(ctx, assets, profile, time * 120, horizon - 10, 30, .5);
    terrain(ctx, assets, profile, time * (40 + state.speed * .05), horizon + 30, 'terrain-far');
    if (sequence.placeType === 'atmosphere') clouds(ctx, assets, profile, time * 400, 160, 40, clamp01(state.turbulence) * .6, 'cloud-near');
    weather(ctx, profile, time, options.reducedMotion, .7);
    if (state.heat > .1) { ctx.fillStyle = `rgba(255,120,40,${state.heat * .5})`; ctx.fillRect(0, 0, W, H); }
  }
  ctx.restore();
  // cockpit frame
  assets.draw(ctx, 'ud4l-cockpit', 0, 0, W, H, () => {
    ctx.fillStyle = '#0a0c0b'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.moveTo(120, 100); ctx.lineTo(220, 330); ctx.lineTo(1060, 330); ctx.lineTo(1160, 100); ctx.closePath(); ctx.fill('evenodd');
    ctx.fillStyle = '#151816'; ctx.fillRect(0, 330, W, H - 330); ctx.fillRect(626, 100, 28, 230); // centre strut and console
    ctx.fillStyle = '#1d211e'; ctx.beginPath(); ctx.moveTo(0, 330); ctx.lineTo(W, 330); ctx.lineTo(W, 352); ctx.lineTo(0, 352); ctx.fill();
    ctx.fillStyle = '#0e100f'; ctx.beginPath(); ctx.ellipse(250, 640, 150, 120, 0, 0, Math.PI * 2); ctx.ellipse(1030, 640, 150, 120, 0, 0, Math.PI * 2); ctx.fill(); // seat backs
  });
  const colour = sequence.placeType === 'airless' || state.heat > .55 ? AMBER : CRT;
  navDisplay(ctx, assets, 70, 370, 300, 150, model, state, sequence, colour, time);
  terrainRadar(ctx, assets, 390, 370, 250, 150, profile, state, colour, sequence);
  telemetry(ctx, assets, 660, 370, 300, 150, model, state, colour);
  systems(ctx, assets, 980, 370, 230, 150, model, options.colorblind);
  commsBox(ctx, assets, 390, 538, 250, 84, options.subtitle, lang, time, options.reducedMotion);
}

function troopBay(ctx, assets, sequence, state, local, time, options) {
  assets.draw(ctx, 'ud4l-troop-bay', 0, 0, W, H, () => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0807'); g.addColorStop(1, '#2a0d0b');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#120605'; for (let x = 0; x < W; x += 110) ctx.fillRect(x, 0, 18, H); // hull ribs
    ctx.fillStyle = '#331310'; ctx.fillRect(0, 470, W, 30); ctx.fillRect(0, 230, W, 16); // seat rail and rack
    const lamp = options.reducedMotion ? .7 : .6 + .4 * Math.abs(Math.sin(time * 1.8));
    ctx.fillStyle = `rgba(255,60,40,${.25 * lamp})`; ctx.fillRect(0, 100, W, 20);
    for (let x = 160; x < W; x += 320) { const glow = ctx.createRadialGradient(x, 110, 4, x, 110, 120); glow.addColorStop(0, `rgba(255,70,50,${.45 * lamp})`); glow.addColorStop(1, 'rgba(255,70,50,0)'); ctx.fillStyle = glow; ctx.fillRect(x - 120, 0, 240, 240); }
  });
  // marines in harness seats (1 m ≈ 51 px: seated 52×80)
  const crew = sequence.mode === 'apc' ? 4 : 6;
  for (let i = 0; i < crew; i++) {
    const sway = options.reducedMotion ? 0 : Math.sin(time * 3 + i) * 2 * state.turbulence;
    assets.draw(ctx, 'marine-seated', 140 + i * 170 + sway, 392, 52, 80, (c, x, y) => {
      c.fillStyle = '#0b0605'; c.fillRect(x + 10, y + 18, 32, 44); c.beginPath(); c.arc(x + 26, y + 12, 13, 0, Math.PI * 2); c.fill();
      c.fillRect(x + 36, y + 40, 22, 12); c.fillRect(x + 48, y + 52, 10, 30); // thighs and shins
      c.strokeStyle = '#5e5a4c'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 4, y + 10); c.lineTo(x + 4, y + 50); c.lineTo(x + 44, y + 50); c.stroke(); c.lineWidth = 1; // harness bar
      c.fillStyle = '#20100e'; c.fillRect(x - 6, y - 10, 5, 64); // rifle upright
    });
  }
  // small status monitor (same flight state as the cockpit)
  const model = insertionScreenModelV188(state, sequence, options.language);
  crt(ctx, assets, 980, 170, 220, 90, 'STATUS', AMBER, (bx, by) => {
    ctx.font = '700 14px monospace'; ctx.fillText(model.altitude || model.range, bx + 8, by + 16); ctx.fillText(model.countdown, bx + 8, by + 36);
    const top = model.warnings[0]; if (top) { const colour = insertionLevelColourV188(top.level, options.colorblind); levelShape(ctx, top.level, bx + 14, by + 52, 6, colour); ctx.fillStyle = colour; ctx.fillText(top.text, bx + 28, by + 57); }
  });
  if (sequence.mode === 'apc') { // the belly bay below: the M577 visible through the floor grating
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 560, W, 70);
    assets.draw(ctx, 'm577-side', 420, 566, 300, 60, () => apcShape(ctx, 430, 562, .7));
    ctx.fillStyle = AMBER; ctx.font = '700 12px monospace'; ctx.textAlign = 'left'; ctx.fillText(options.language === 'en' ? 'BELLY BAY · M577' : 'SOUTE VENTRALE · M577', 740, 600);
  }
}

function bayInterior(ctx, assets, sequence, state, local, progress, time, options) {
  const returning = sequence.direction === 'extraction';
  assets.draw(ctx, 'tantalus-drop-bay', 0, 0, W, H, () => {
    ctx.fillStyle = '#0e1012'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1a1d20'; for (let x = 0; x < W; x += 140) ctx.fillRect(x, 0, 30, 500); // ribbed bulkheads
    ctx.fillStyle = '#25292d'; ctx.fillRect(0, 120, W, 26); // overhead rail
    // open bay doors at the bottom: space below
    ctx.fillStyle = '#000'; ctx.fillRect(160, 520, 960, 200);
    ctx.save(); ctx.beginPath(); ctx.rect(160, 520, 960, 200); ctx.clip(); stars(ctx, assets, time * 6, 1);
    if (sequence.placeType !== 'space') planetBody(ctx, assets, sequence.profile, 640, 1500, 900, { airless: sequence.placeType === 'airless', time });
    ctx.restore();
    ctx.fillStyle = '#e9d07a'; for (let x = 160; x < 1120; x += 40) { ctx.fillRect(x, 512, 20, 8); } // hazard edge
    ctx.fillStyle = '#16191b'; ctx.fillRect(0, 500, 160, 220); ctx.fillRect(1120, 500, 160, 220);
    const alarm = options.reducedMotion ? .6 : .5 + .5 * Math.sin(time * 5);
    for (const lx of [60, 1220]) { const glow = ctx.createRadialGradient(lx, 200, 4, lx, 200, 160); glow.addColorStop(0, `rgba(255,60,40,${.6 * alarm})`); glow.addColorStop(1, 'rgba(255,60,40,0)'); ctx.fillStyle = glow; ctx.fillRect(lx - 160, 40, 320, 320); }
  });
  // the clamp holds the UD-4L; at the end of the insertion bay shot it releases
  // insertion: the rail lowers the UD-4L toward the open doors; return: it rises into the clamp
  const drop = returning ? (1 - ease(progress)) * 260 : ease(progress) * 70;
  ctx.fillStyle = '#30353a'; ctx.fillRect(600, 146, 80, 70 + (returning ? 0 : Math.min(drop, 20))); ctx.fillRect(560, 210, 160, 14);
  dropship(ctx, assets, 640, 330 + drop, .9, { apc: state.apcAttached, engine: returning ? .5 : 0, gear: false, time, steady: options.reducedMotion });
}

function drawShot(ctx, assets, sequence, at, state, time, options) {
  const { shot: entry, local, progress } = at, profile = sequence.profile, steady = options.reducedMotion;
  switch (entry.kind) {
    case 'bay': case 'bay-return': bayInterior(ctx, assets, sequence, state, local, progress, time, options); break;
    case 'release': case 'orbit-return': {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); stars(ctx, assets, time * 10);
      if (sequence.placeType !== 'space') planetBody(ctx, assets, profile, 640, 1700, 1100, { airless: sequence.placeType === 'airless', time });
      const returning = entry.kind === 'orbit-return', k = ease(progress);
      tantalusHull(ctx, assets, returning ? 640 - (1 - k) * 200 : 640 + k * 120, returning ? 200 + (1 - k) * 60 : 200 - k * 40, returning ? .5 + k * .3 : .8 - k * .2);
      const dy = returning ? lerp(520, 260, k) : lerp(250, 560, k), dx = returning ? lerp(220, 720, k) : lerp(760, 520, k);
      dropship(ctx, assets, dx, dy, returning ? lerp(.25, .4, k) : lerp(.45, .3, k), { apc: state.apcAttached, engine: returning ? .8 : progress > .45 ? .7 : 0, time, tilt: returning ? -.08 : .12, steady });
      break;
    }
    case 'orbit': case 'exit-atmosphere': case 'ascent': case 'transit': case 'transit-return': {
      const starAlpha = skyFor(ctx, profile, state); stars(ctx, assets, time * 40, Math.max(starAlpha, sequence.placeType === 'atmosphere' ? 0 : 1));
      if (sequence.placeType === 'space') {
        const k = ease(progress), returning = entry.kind === 'transit-return';
        vessel(ctx, assets, returning ? lerp(900, 1400, k) : lerp(1300, 900, k), 380, returning ? lerp(.5, .2, k) : lerp(.2, .5, k), time, steady);
        dropship(ctx, assets, returning ? lerp(700, 300, k) : lerp(200, 520, k), 420, .3, { engine: .7, time, steady });
      } else {
        const rise = entry.kind === 'orbit' ? 0 : 200 * ease(progress);
        planetBody(ctx, assets, profile, 640, 1350 + rise, 900 - (entry.kind === 'orbit' ? progress * 80 : 0), { airless: sequence.placeType === 'airless', time });
        dropship(ctx, assets, lerp(300, 900, progress), lerp(260, 300, progress), .32, { apc: state.apcAttached, engine: entry.kind === 'orbit' ? .3 : 1, time, tilt: entry.kind === 'orbit' ? .25 : -.35, heat: state.heat, steady });
      }
      break;
    }
    case 'entry': {
      skyFor(ctx, profile, state); stars(ctx, assets, time * 20, clamp01(1 - progress * 1.4));
      planetBody(ctx, assets, profile, 640, 1250 - progress * 200, 1000 + progress * 300, { time });
      clouds(ctx, assets, profile, time * 300, 560, 40, progress * .6);
      plasma(ctx, assets, 640, 330, state.heat, time, steady);
      assets.draw(ctx, 'ud4l-front', 520, 250, 240, 160, () => {
        ctx.fillStyle = '#1a1d18'; ctx.beginPath(); ctx.moveTo(640, 270); ctx.lineTo(735, 330); ctx.lineTo(700, 360); ctx.lineTo(580, 360); ctx.lineTo(545, 330); ctx.closePath(); ctx.fill();
        ctx.fillRect(520, 330, 240, 10); ctx.fillStyle = '#7d9aa1'; ctx.fillRect(612, 296, 56, 16); ctx.fillStyle = '#0d0f0c'; ctx.beginPath(); ctx.arc(640, 368, 12, 0, Math.PI * 2); ctx.fill();
      });
      if (state.heat > .2) { ctx.fillStyle = `rgba(255,110,40,${state.heat * .18})`; ctx.fillRect(0, 0, W, H); }
      break;
    }
    case 'powered-descent': {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); stars(ctx, assets, time * 8);
      const k = ease(progress); planetBody(ctx, assets, profile, 640, lerp(1500, 1250, k), lerp(900, 1000, k), { airless: true, time });
      dropship(ctx, assets, 640, 300, .45, { apc: state.apcAttached, engine: 1, time, tilt: -1.2 + k * .9, steady });
      break;
    }
    case 'approach': case 'liftoff': {
      const starAlpha = skyFor(ctx, profile, state); if (starAlpha > .05) stars(ctx, assets, time * 4, starAlpha);
      const k = ease(progress), landing = entry.kind === 'approach';
      const horizon = 470;
      if (sequence.placeType === 'atmosphere') clouds(ctx, assets, profile, time * 60, 150, 50, .55);
      terrain(ctx, assets, profile, time * 30, horizon, 'terrain-far');
      terrain(ctx, assets, profile, time * 90, 600, 'terrain-near', true);
      // landing pad with lights
      ctx.fillStyle = '#141616'; ctx.fillRect(420, 600, 440, 18);
      for (let i = 0; i < 6; i++) { const on = steady || Math.floor(time * 4 + i) % 2 === 0; ctx.fillStyle = on ? AMBER : '#3a3420'; ctx.fillRect(430 + i * 84, 596, 10, 5); }
      const lift = Math.max(0, (progress - .25) / .75), groundY = 560, alt = landing ? lerp(-140, groundY, Math.min(1, k * 1.15)) : lerp(groundY, 120, lift * lift);
      const x = landing ? lerp(160, 640, Math.min(1, k * 1.2)) : lerp(640, 1060, lift * lift); // nose first, never tail first
      // engine dust / spray near the ground
      const nearGround = clamp01(1 - Math.abs(alt - groundY) / 160);
      if (nearGround > 0) { ctx.fillStyle = sequence.placeType === 'airless' ? 'rgba(170,170,160,.35)' : 'rgba(180,170,150,.25)'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.ellipse(x + (i - 6) * 40 * (1 + nearGround), 610 - i % 3 * 6, 60 * nearGround, 18 * nearGround, 0, 0, Math.PI * 2); ctx.fill(); } }
      const apcOnGround = sequence.mode === 'apc' && !state.apcAttached;
      if (apcOnGround) { const roll = landing ? (progress - .9) / .1 : 0; assets.draw(ctx, 'm577-side', x - 150 - roll * 160, groundY + 8, 300, 60, () => apcShape(ctx, x - 150 - Math.max(0, roll) * 160, groundY - 8, .62)); }
      dropship(ctx, assets, x, alt - 70, .5, { apc: state.apcAttached, ramp: state.rampOpen ? 1 : 0, engine: 1, gear: state.gearDown, time, tilt: landing ? -.06 * (1 - k) : -.1 * progress, steady });
      if (state.rampOpen && sequence.mode === 'foot') { // marines down the ramp (1 m ≈ 51 px; 44×92 standing, here at the shot's 0.5 scale)
        ctx.fillStyle = '#060807'; const out = landing ? (progress - .82) / .18 : 1 - progress / .25;
        for (let i = 0; i < 4; i++) { const mx = x - 130 - i * 26 - out * 90; ctx.fillRect(mx, groundY - 40, 11, 23); ctx.beginPath(); ctx.arc(mx + 5.5, groundY - 44, 5, 0, Math.PI * 2); ctx.fill(); }
      }
      weather(ctx, profile, time, steady, 1);
      break;
    }
    case 'docking': case 'undock': {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); stars(ctx, assets, time * 3);
      vessel(ctx, assets, 520, 360, .75, time, steady);
      const k = ease(progress), docking = entry.kind === 'docking';
      const gap = docking ? lerp(420, 0, k) : lerp(0, 420, k);
      dropship(ctx, assets, 1040 + gap, 330, .5, { engine: .35, time, tilt: 0, steady, ramp: state.rampOpen ? .2 : 0 });
      ctx.fillStyle = 'rgba(141,240,176,.5)'; for (let i = 0; i < 5; i++) ctx.fillRect(1040 + i * 26 - (docking ? 0 : 0), 300, 8, 2); // guide lights
      break;
    }
    case 'troop-bay': troopBay(ctx, assets, sequence, state, local, time, options); break;
    default: cockpit(ctx, assets, sequence, state, local, time, options);
  }
}

function subtitle(ctx, line, language, local, reducedMotion) {
  if (!line) return;
  const lang = language === 'en' ? 'en' : 'fr', text = line.text[lang], speaker = line.speaker[lang];
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '700 14px monospace'; ctx.fillStyle = line.radio ? AMBER : '#cfd8d2'; ctx.fillText(speaker, W / 2, H - INSERTION_LETTERBOX_V188 + 26);
  ctx.font = '20px sans-serif'; ctx.fillStyle = '#f1f4f2';
  const words = text.split(/\s+/), lines = []; let current = '';
  for (const word of words) { const next = current ? `${current} ${word}` : word; if (current && (ctx.measureText?.(next)?.width ?? next.length * 10) > 1040) { lines.push(current); current = word; } else current = next; }
  if (current) lines.push(current);
  lines.slice(0, 2).forEach((entry, index) => ctx.fillText(entry, W / 2, H - INSERTION_LETTERBOX_V188 + 52 + index * 24));
  if (line.radio && !reducedMotion) { ctx.fillStyle = 'rgba(233,208,122,.12)'; const seed = Math.floor(local * 18); for (let i = 0; i < 30; i++) ctx.fillRect((i * 97 + seed * 31) % W, H - INSERTION_LETTERBOX_V188 + 4 + (i * 13) % 80, 2, 2); }
}

/** Pure camera: zoom and pan per shot; reduced motion keeps a gentler move and no shake. */
export function insertionCameraV188(kind, progress, state, { reducedMotion = false, shake = 1, time = 0 } = {}) {
  const k = ease(clamp01(progress)), moves = {
    bay: [1.08, 0, -20, 1, 0, 10], release: [1, 0, 0, 1.08, -20, 30], orbit: [1, 40, 0, 1.1, -40, 0], entry: [1.05, 0, 0, 1.12, 0, 10],
    'powered-descent': [1, 0, -20, 1.1, 0, 20], approach: [1.12, 60, -30, 1, 0, 0], liftoff: [1, 0, 0, 1.12, -40, -30], climb: [1.05, 0, 20, 1.1, 0, -20],
    transit: [1, 0, 0, 1.08, 30, 0], docking: [1, 0, 0, 1.15, -80, 0], undock: [1.15, -80, 0, 1, 0, 0], 'orbit-return': [1, 0, 0, 1.1, 40, 20],
    'bay-return': [1, 0, 20, 1.08, 0, -10], 'troop-bay': [1.04, -20, 0, 1.08, 20, 0]
  }[kind] || [1, 0, 0, 1.02, 0, 0];
  const amount = reducedMotion ? .3 : 1;
  const zoom = 1 + (lerp(moves[0], moves[3], k) - 1) * amount, x = lerp(moves[1], moves[4], k) * amount, y = lerp(moves[2], moves[5], k) * amount;
  const interior = kind === 'troop-bay' || COCKPIT_KINDS.has(kind), magnitude = reducedMotion ? 0 : (state?.turbulence || 0) * (interior ? 5 : 7) * Math.max(0, Math.min(1, shake));
  const shakeX = magnitude ? magnitude * (Math.sin(time * 37) + .6 * Math.sin(time * 13)) : 0, shakeY = magnitude ? magnitude * .7 * Math.cos(time * 29) : 0;
  return { zoom, x, y, shakeX, shakeY, magnitude };
}

/** Draw one frame of a sequence at a time (seconds). */
export function drawInsertionFrameV188(ctx, sequence, time, { assets = new InsertionAssetLoaderV188({ ImageCtor: null }), language = 'fr', reducedMotion = false,
  colorblind = false, shake = 1 } = {}) {
  const at = insertionShotAtV188(sequence, Math.min(time, sequence.duration - 1e-6));
  if (!at) return null;
  const state = insertionFlightStateV188(sequence, time);
  const camera = insertionCameraV188(at.shot.kind, at.progress, state, { reducedMotion, shake, time });
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2 + camera.x + camera.shakeX, H / 2 + camera.y + camera.shakeY); ctx.scale(camera.zoom, camera.zoom); ctx.translate(-W / 2, -H / 2);
  const line = at.shot.line && at.progress > .08 ? at.shot.line : null;
  drawShot(ctx, assets, sequence, at, state, time, { language, reducedMotion, colorblind, subtitle: line });
  ctx.restore();
  // shot fades (a dip to black, never a white flash)
  const edge = Math.min(at.local, at.shot.seconds - at.local);
  if (edge < .35) { ctx.fillStyle = `rgba(0,0,0,${1 - edge / .35})`; ctx.fillRect(0, 0, W, H); }
  letterbox(ctx);
  if (at.shot.caption) {
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = '700 13px monospace'; ctx.fillStyle = AMBER;
    const lang = language === 'en' ? 'en' : 'fr';
    ctx.fillText(at.shot.caption[lang], 32, INSERTION_LETTERBOX_V188 - 38);
    ctx.fillStyle = '#9fb0a6'; ctx.font = '12px monospace';
    ctx.fillText(`${sequence.profile.name.toUpperCase()} · ${sequence.profile.coordinates}${sequence.short ? '' : ` · ${sequence.profile.localTime}`}`, 32, INSERTION_LETTERBOX_V188 - 20);
  }
  subtitle(ctx, line, language, at.local, reducedMotion);
  return { shot: at.shot.kind, index: at.index, state, camera };
}

/** Fullscreen DOM player. Escape, Enter or the button skip; Space goes to the next shot. */
export class InsertionCinematicPlayerV188 {
  constructor({ document = globalThis.document, now = () => globalThis.performance?.now?.() ?? Date.now(),
    requestFrame = globalThis.requestAnimationFrame?.bind(globalThis), ImageCtor = globalThis.Image, assets = null } = {}) {
    Object.assign(this, { document, now, requestFrame }); this.assets = assets || new InsertionAssetLoaderV188({ ImageCtor });
    this.active = null; this.lastStats = null;
  }
  play(sequence, { language = 'fr', reducedMotion = false, colorblind = false, shake = 1, onCue = null } = {}) {
    if (!sequence?.shots?.length || !this.document?.body) return Promise.resolve('unavailable');
    this.stop('replaced'); this.assets.preload(INSERTION_ASSET_SLOT_IDS_V188);
    const en = language === 'en', overlay = this.document.createElement('div');
    overlay.className = 'cinematic-v188 insertion-cinematic-v188'; overlay.setAttribute('role', 'dialog');
    overlay.dataset.placeType = sequence.placeType; overlay.dataset.direction = sequence.direction; overlay.dataset.length = sequence.short ? 'short' : 'full';
    overlay.setAttribute('aria-label', sequence.direction === 'extraction' ? (en ? 'Extraction' : 'Extraction') : (en ? 'Insertion' : 'Insertion'));
    const canvas = this.document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const skip = this.document.createElement('button'); skip.type = 'button'; skip.className = 'button cinematic-skip-v188 insertion-skip-v188';
    skip.textContent = en ? 'SKIP (ESC)' : 'PASSER (ÉCHAP)';
    overlay.append(canvas, skip); this.document.body.append(overlay);
    const ctx = canvas.getContext('2d');
    return new Promise(resolve => {
      const stats = { frames: 0, drawMs: [], intervals: [], lastFrameAt: null };
      const state = { start: this.now(), offset: 0, done: false, shotIndex: -1, warned: new Set() };
      const finish = reason => {
        if (state.done) return; state.done = true;
        this.document.removeEventListener?.('keydown', onKey, true); overlay.remove(); this.active = null;
        this.lastStats = summarizeFrameStatsV188(stats, sequence); onCue?.(reason === 'complete' ? 'insertion-end' : 'insertion-skip'); resolve(reason);
      };
      const elapsed = () => (this.now() - state.start) / 1000 + state.offset;
      const next = () => { const at = insertionShotAtV188(sequence, elapsed()); if (!at) return finish('complete'); state.offset += at.shot.seconds - at.local; };
      const onKey = event => {
        if (event.code === 'Escape' || event.code === 'Enter' || event.code === 'NumpadEnter') { event.preventDefault(); event.stopImmediatePropagation(); finish('skipped'); }
        else if (event.code === 'Space') { event.preventDefault(); event.stopImmediatePropagation(); next(); }
      };
      skip.onclick = () => finish('skipped'); canvas.onclick = () => next();
      this.document.addEventListener?.('keydown', onKey, true);
      state.finish = finish; this.active = state;
      const frame = () => {
        if (state.done) return;
        const time = elapsed();
        if (time >= sequence.duration) return finish('complete');
        const begin = this.now();
        if (stats.lastFrameAt !== null) stats.intervals.push(begin - stats.lastFrameAt);
        stats.lastFrameAt = begin;
        const drawn = drawInsertionFrameV188(ctx, sequence, time, { assets: this.assets, language, reducedMotion, colorblind, shake });
        stats.drawMs.push(this.now() - begin); stats.frames += 1;
        if (drawn && drawn.index !== state.shotIndex) { state.shotIndex = drawn.index; onCue?.(`shot:${drawn.shot}`); if (sequence.shots[drawn.index].line) onCue?.('insertion-radio'); }
        for (const entry of drawn?.state?.warnings || []) if (entry.level === 'warning' && !state.warned.has(entry.id)) { state.warned.add(entry.id); onCue?.('insertion-warning'); }
        this.requestFrame?.(frame);
      };
      onCue?.('insertion-start');
      frame();
    });
  }
  stop(reason = 'stopped') { this.active?.finish?.(reason); }
}

export function summarizeFrameStatsV188(stats, sequence) {
  const sorted = list => [...list].sort((a, b) => a - b), pct = (list, p) => list.length ? list[Math.min(list.length - 1, Math.floor(list.length * p))] : 0;
  const draw = sorted(stats.drawMs || []), gap = sorted(stats.intervals || []);
  const mean = list => list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 0;
  const round = value => Math.round(value * 100) / 100;
  return Object.freeze({ placeType: sequence?.placeType, direction: sequence?.direction, short: sequence?.short, frames: stats.frames || 0,
    drawMeanMs: round(mean(draw)), drawP95Ms: round(pct(draw, .95)), drawMaxMs: round(draw.at(-1) || 0),
    intervalMeanMs: round(mean(gap)), intervalP95Ms: round(pct(gap, .95)), intervalMaxMs: round(gap.at(-1) || 0) });
}

// —— Extraction hand-back (app side) ——
/** Pure state machine: the engine's boarding event arms the ascent cinematic;
 * without it, the mission-complete flow runs exactly as before. */
export function createExtractionFlowV188() {
  return { boarding: null, played: false };
}
export function extractionFlowOnEventV188(flow, event) {
  const boarding = readBoardingEventV188(event);
  if (boarding) { flow.boarding = boarding; return { action: flow.played ? 'none' : 'play-extraction', boarding }; }
  if (event?.type === 'mission-complete') return { action: flow.boarding ? 'debrief-after-cinematic' : 'debrief-now' };
  return { action: 'none' };
}
