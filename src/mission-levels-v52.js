const WORLD_WIDTH = 5200;
const FLOOR_Y = 510;

export const HAZARD_KINDS_V52 = Object.freeze([
  'acid',
  'vacuum',
  'fire',
  'steam',
  'electrical',
  'radiation',
  'flood',
  'darkness'
]);

export const MISSION_TEMPLATE_IDS_V52 = Object.freeze([
  'ship-interior-vertical',
  'colony-multiroute',
  'planet-exterior'
]);

const HAZARD_CONTRACTS = Object.freeze({
  acid: Object.freeze({ effect: 'corrosion', damage: 14, armorDrain: 8 }),
  vacuum: Object.freeze({ effect: 'decompression', damage: 8, oxygenDrain: 22 }),
  fire: Object.freeze({ effect: 'burn', damage: 22, armorDrain: 3 }),
  steam: Object.freeze({ effect: 'scald', damage: 18, impulse: 120 }),
  electrical: Object.freeze({ effect: 'shock', damage: 22, stun: 1.25, impulse: 80 }),
  radiation: Object.freeze({ effect: 'irradiation', damage: 10, exposure: 16 }),
  flood: Object.freeze({ effect: 'drag', damage: 6, slow: 0.48 }),
  darkness: Object.freeze({ effect: 'visibility', damage: 0, visibility: 0.28 })
});

const TEMPLATE_PALETTES = Object.freeze({
  'ship-interior-vertical': Object.freeze({
    id: 'derelict-interior', sky: '#02060b', haze: '#162c3d', accent: '#80b6c9', light: 0.38, prop: 'pressure-hull'
  }),
  'colony-multiroute': Object.freeze({
    id: 'frontier-colony', sky: '#07100f', haze: '#31463e', accent: '#8faf91', light: 0.58, prop: 'habitat'
  }),
  'planet-exterior': Object.freeze({
    id: 'hostile-exterior', sky: '#160b09', haze: '#74402d', accent: '#d19a64', light: 0.64, prop: 'terrain'
  })
});

function list(value) {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function slug(value) {
  return String(value || 'mission')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'mission';
}

export function stableMissionHashV52(value) {
  let state = 2166136261;
  for (const character of String(value ?? '')) {
    state ^= character.codePointAt(0);
    state = Math.imul(state, 16777619);
  }
  return state >>> 0;
}

function makeRandom(seed) {
  let state = (Number(seed) >>> 0) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function node(id, x, y, zoneId, anchor = null, width = 250) {
  return Object.freeze({ id, x, y, zoneId, anchor, width });
}

function edge(id, from, to, kind, routeIds, options = {}) {
  return Object.freeze({ id, from, to, kind, routeIds: Object.freeze([...routeIds]), ...options });
}

function zone(id, label, x, w, biomeRole, layers, visual) {
  return Object.freeze({
    id,
    label,
    x,
    w,
    biomeRole,
    layers: Object.freeze({ ...layers }),
    visual: Object.freeze({ ...visual })
  });
}

function route(id, role, nodeIds) {
  return Object.freeze({ id, role, nodeIds: Object.freeze([...nodeIds]) });
}

const SHIP_TEMPLATE = Object.freeze({
  id: 'ship-interior-vertical',
  label: 'Intérieur de vaisseau vertical',
  family: 'derelict',
  dimensions: Object.freeze({ width: WORLD_WIDTH, height: 620 }),
  artLayers: Object.freeze({
    far: 'mission.ship.derelict-space',
    mid: 'mission.ship.pressure-hull',
    foreground: 'mission.ship.pipes-and-cables',
    overlay: 'mission.ship.emergency-lights'
  }),
  nodes: Object.freeze([
    node('ship-spawn', 180, 470, 'ship-docking', 'spawn'),
    node('ship-dock', 620, 470, 'ship-docking'),
    node('ship-dock-mid', 620, 330, 'ship-docking'),
    node('ship-dock-high', 620, 190, 'ship-docking'),
    node('ship-cargo', 1220, 470, 'ship-cargo'),
    node('ship-service', 1220, 330, 'ship-cargo'),
    node('ship-hull', 1220, 190, 'ship-cargo'),
    node('ship-shaft-low', 1880, 470, 'ship-engineering'),
    node('ship-shaft-mid', 1880, 330, 'ship-engineering'),
    node('ship-shaft-high', 1880, 190, 'ship-engineering'),
    node('ship-reactor', 2550, 470, 'ship-engineering', 'power'),
    node('ship-crew', 2550, 330, 'ship-habitation', 'objective-primary'),
    node('ship-bridge', 2900, 190, 'ship-command', 'archive'),
    node('ship-aft-low', 3500, 470, 'ship-command'),
    node('ship-junction', 3500, 330, 'ship-command', 'boss'),
    node('ship-airlock', 4140, 470, 'ship-extraction'),
    node('ship-extraction', 4920, 470, 'ship-extraction', 'extraction')
  ]),
  edges: Object.freeze([
    edge('ship-e01', 'ship-spawn', 'ship-dock', 'walk', ['ship-spine', 'ship-service-route', 'ship-hull-route']),
    edge('ship-e02', 'ship-dock', 'ship-cargo', 'walk', ['ship-spine']),
    edge('ship-e03', 'ship-cargo', 'ship-shaft-low', 'airlock', ['ship-spine'], { gateId: 'cargo-bulkhead' }),
    edge('ship-e04', 'ship-shaft-low', 'ship-reactor', 'walk', ['ship-spine']),
    edge('ship-e05', 'ship-reactor', 'ship-aft-low', 'walk', ['ship-spine']),
    edge('ship-e06', 'ship-aft-low', 'ship-airlock', 'airlock', ['ship-spine'], { gateId: 'aft-bulkhead' }),
    edge('ship-e07', 'ship-airlock', 'ship-extraction', 'walk', ['ship-spine', 'ship-service-route', 'ship-hull-route']),
    edge('ship-e08', 'ship-dock', 'ship-dock-mid', 'ladder', ['ship-service-route']),
    edge('ship-e09', 'ship-dock-mid', 'ship-service', 'walk', ['ship-service-route']),
    edge('ship-e10', 'ship-service', 'ship-shaft-mid', 'vent', ['ship-service-route'], { ventId: 'service-duct' }),
    edge('ship-e11', 'ship-shaft-mid', 'ship-crew', 'walk', ['ship-service-route']),
    edge('ship-e12', 'ship-crew', 'ship-junction', 'walk', ['ship-service-route']),
    edge('ship-e13', 'ship-junction', 'ship-airlock', 'ladder', ['ship-service-route', 'ship-hull-route']),
    edge('ship-e14', 'ship-dock', 'ship-dock-high', 'lift', ['ship-hull-route']),
    edge('ship-e15', 'ship-dock-high', 'ship-hull', 'walk', ['ship-hull-route']),
    edge('ship-e16', 'ship-hull', 'ship-shaft-high', 'walk', ['ship-hull-route']),
    edge('ship-e17', 'ship-shaft-high', 'ship-bridge', 'walk', ['ship-hull-route']),
    edge('ship-e18', 'ship-bridge', 'ship-junction', 'ladder', ['ship-hull-route']),
    edge('ship-e19', 'ship-shaft-low', 'ship-shaft-mid', 'ladder', []),
    edge('ship-e20', 'ship-shaft-mid', 'ship-shaft-high', 'ladder', []),
    edge('ship-e21', 'ship-reactor', 'ship-crew', 'ladder', [])
  ]),
  routes: Object.freeze([
    route('ship-spine', 'pressurised-spine', ['ship-spawn', 'ship-dock', 'ship-cargo', 'ship-shaft-low', 'ship-reactor', 'ship-aft-low', 'ship-airlock', 'ship-extraction']),
    route('ship-service-route', 'service-ducts', ['ship-spawn', 'ship-dock', 'ship-dock-mid', 'ship-service', 'ship-shaft-mid', 'ship-crew', 'ship-junction', 'ship-airlock', 'ship-extraction']),
    route('ship-hull-route', 'upper-hull', ['ship-spawn', 'ship-dock', 'ship-dock-high', 'ship-hull', 'ship-shaft-high', 'ship-bridge', 'ship-junction', 'ship-airlock', 'ship-extraction'])
  ]),
  zones: Object.freeze([
    zone('ship-docking', 'Tube d’amarrage', 0, 900, 'orbital', { far: 'space', mid: 'dock', foreground: 'cables' }, { tint: '#10263a', fog: 0.12 }),
    zone('ship-cargo', 'Soutes dépressurisées', 900, 720, 'industrial', { far: 'hull', mid: 'cargo', foreground: 'chains' }, { tint: '#24343b', fog: 0.2 }),
    zone('ship-engineering', 'Puits d’ingénierie', 1620, 1180, 'reactor', { far: 'machinery', mid: 'reactor', foreground: 'steam' }, { tint: '#58301f', fog: 0.3 }),
    zone('ship-habitation', 'Pont d’habitation', 2200, 650, 'habitation', { far: 'bulkhead', mid: 'crew', foreground: 'glass' }, { tint: '#233c43', fog: 0.16 }),
    zone('ship-command', 'Passerelle', 2800, 1100, 'laboratory', { far: 'stars', mid: 'command', foreground: 'displays' }, { tint: '#1a3445', fog: 0.1 }),
    zone('ship-extraction', 'Sas arrière', 3900, 1300, 'vacuum', { far: 'space', mid: 'airlock', foreground: 'frost' }, { tint: '#14213b', fog: 0.24 })
  ]),
  hazards: Object.freeze([
    Object.freeze({ id: 'ship-hazard-vacuum', kind: 'vacuum', zoneId: 'ship-cargo', x: 1320, y: FLOOR_Y - 20, w: 260, h: 20, eventId: 'ship-decompression' }),
    Object.freeze({ id: 'ship-hazard-electrical', kind: 'electrical', zoneId: 'ship-engineering', x: 2320, y: FLOOR_Y - 20, w: 180, h: 20, eventId: 'ship-power-cascade' }),
    Object.freeze({ id: 'ship-hazard-seed', kind: '$seed-primary', zoneId: 'ship-extraction', x: 4300, y: FLOOR_Y - 20, w: 160, h: 20 })
  ]),
  events: Object.freeze([
    Object.freeze({ id: 'ship-decompression', trigger: Object.freeze({ type: 'enter-zone', zoneId: 'ship-cargo' }), actions: Object.freeze(['activate:ship-hazard-vacuum', 'close:cargo-bulkhead', 'art:emergency']) }),
    Object.freeze({ id: 'ship-power-cascade', trigger: Object.freeze({ type: 'interact-anchor', anchorId: 'power' }), actions: Object.freeze(['toggle:ship-hazard-electrical', 'open:cargo-bulkhead', 'power:restore']) }),
    Object.freeze({ id: 'ship-bridge-ambush', trigger: Object.freeze({ type: 'enter-zone', zoneId: 'ship-command' }), actions: Object.freeze(['spawn:ship-command-wave', 'lock:aft-bulkhead']) })
  ]),
  spawns: Object.freeze([
    Object.freeze({ id: 'ship-dock-patrol', zoneId: 'ship-docking', triggerEventId: null, rosterTag: 'synthetic-security', baseCount: 2 }),
    Object.freeze({ id: 'ship-cargo-stalkers', zoneId: 'ship-cargo', triggerEventId: 'ship-decompression', rosterTag: 'vent-stalker', baseCount: 3 }),
    Object.freeze({ id: 'ship-command-wave', zoneId: 'ship-command', triggerEventId: 'ship-bridge-ambush', rosterTag: 'command-guardian', baseCount: 4 })
  ])
});

const COLONY_TEMPLATE = Object.freeze({
  id: 'colony-multiroute',
  label: 'Colonie à routes multiples',
  family: 'settlement',
  dimensions: Object.freeze({ width: WORLD_WIDTH, height: 640 }),
  artLayers: Object.freeze({
    far: 'mission.colony.storm-skyline',
    mid: 'mission.colony.hab-blocks',
    foreground: 'mission.colony.fences-and-rain',
    overlay: 'mission.colony.blackout'
  }),
  nodes: Object.freeze([
    node('colony-spawn', 180, 470, 'colony-approach', 'spawn'),
    node('colony-gate', 650, 470, 'colony-approach'),
    node('colony-street-a', 1250, 470, 'colony-habitat'),
    node('colony-plaza', 1950, 470, 'colony-habitat', 'objective-primary'),
    node('colony-street-b', 2700, 470, 'colony-civic'),
    node('colony-security', 3500, 470, 'colony-security', 'boss'),
    node('colony-pad', 4200, 470, 'colony-landing'),
    node('colony-extraction', 4920, 470, 'colony-landing', 'extraction'),
    node('colony-gate-high', 650, 300, 'colony-approach'),
    node('colony-hab-high', 1300, 300, 'colony-habitat'),
    node('colony-med-high', 2050, 300, 'colony-habitat', 'archive'),
    node('colony-comms-high', 2800, 300, 'colony-civic'),
    node('colony-security-high', 3500, 300, 'colony-security'),
    node('colony-gate-low', 650, 570, 'colony-utility'),
    node('colony-utility-a', 1350, 570, 'colony-utility'),
    node('colony-tunnels', 2200, 570, 'colony-utility'),
    node('colony-generator', 3050, 570, 'colony-utility', 'power'),
    node('colony-security-low', 3500, 570, 'colony-security')
  ]),
  edges: Object.freeze([
    edge('colony-e01', 'colony-spawn', 'colony-gate', 'walk', ['colony-street', 'colony-rooftops', 'colony-utility-route']),
    edge('colony-e02', 'colony-gate', 'colony-street-a', 'gate', ['colony-street'], { gateId: 'colony-main-gate' }),
    edge('colony-e03', 'colony-street-a', 'colony-plaza', 'walk', ['colony-street']),
    edge('colony-e04', 'colony-plaza', 'colony-street-b', 'walk', ['colony-street']),
    edge('colony-e05', 'colony-street-b', 'colony-security', 'gate', ['colony-street'], { gateId: 'security-gate' }),
    edge('colony-e06', 'colony-security', 'colony-pad', 'walk', ['colony-street', 'colony-rooftops', 'colony-utility-route']),
    edge('colony-e07', 'colony-pad', 'colony-extraction', 'walk', ['colony-street', 'colony-rooftops', 'colony-utility-route']),
    edge('colony-e08', 'colony-gate', 'colony-gate-high', 'ladder', ['colony-rooftops']),
    edge('colony-e09', 'colony-gate-high', 'colony-hab-high', 'walk', ['colony-rooftops']),
    edge('colony-e10', 'colony-hab-high', 'colony-med-high', 'walk', ['colony-rooftops']),
    edge('colony-e11', 'colony-med-high', 'colony-comms-high', 'walk', ['colony-rooftops']),
    edge('colony-e12', 'colony-comms-high', 'colony-security-high', 'walk', ['colony-rooftops']),
    edge('colony-e13', 'colony-security-high', 'colony-security', 'ladder', ['colony-rooftops']),
    edge('colony-e14', 'colony-gate', 'colony-gate-low', 'ladder', ['colony-utility-route']),
    edge('colony-e15', 'colony-gate-low', 'colony-utility-a', 'walk', ['colony-utility-route']),
    edge('colony-e16', 'colony-utility-a', 'colony-tunnels', 'vent', ['colony-utility-route'], { ventId: 'colony-service-duct' }),
    edge('colony-e17', 'colony-tunnels', 'colony-generator', 'walk', ['colony-utility-route']),
    edge('colony-e18', 'colony-generator', 'colony-security-low', 'walk', ['colony-utility-route']),
    edge('colony-e19', 'colony-security-low', 'colony-security', 'ladder', ['colony-utility-route']),
    edge('colony-e20', 'colony-plaza', 'colony-med-high', 'ladder', []),
    edge('colony-e21', 'colony-street-b', 'colony-generator', 'ladder', [])
  ]),
  routes: Object.freeze([
    route('colony-street', 'main-street', ['colony-spawn', 'colony-gate', 'colony-street-a', 'colony-plaza', 'colony-street-b', 'colony-security', 'colony-pad', 'colony-extraction']),
    route('colony-rooftops', 'roofline', ['colony-spawn', 'colony-gate', 'colony-gate-high', 'colony-hab-high', 'colony-med-high', 'colony-comms-high', 'colony-security-high', 'colony-security', 'colony-pad', 'colony-extraction']),
    route('colony-utility-route', 'utility-tunnels', ['colony-spawn', 'colony-gate', 'colony-gate-low', 'colony-utility-a', 'colony-tunnels', 'colony-generator', 'colony-security-low', 'colony-security', 'colony-pad', 'colony-extraction'])
  ]),
  zones: Object.freeze([
    zone('colony-approach', 'Périmètre', 0, 900, 'badlands', { far: 'storm', mid: 'gate', foreground: 'wire' }, { tint: '#3d2f29', rain: 0.5 }),
    zone('colony-habitat', 'Habitations', 900, 1350, 'colony', { far: 'hab-blocks', mid: 'street', foreground: 'rain' }, { tint: '#29433d', rain: 0.7 }),
    zone('colony-civic', 'Centre civique', 2250, 850, 'habitation', { far: 'tower', mid: 'plaza', foreground: 'smoke' }, { tint: '#34443e', rain: 0.62 }),
    zone('colony-utility', 'Galeries techniques', 500, 3000, 'industrial', { far: 'concrete', mid: 'pipes', foreground: 'steam' }, { tint: '#24302d', fog: 0.35 }),
    zone('colony-security', 'Sécurité', 3100, 850, 'laboratory', { far: 'bunker', mid: 'checkpoint', foreground: 'shutters' }, { tint: '#304247', rain: 0.25 }),
    zone('colony-landing', 'Aire d’évacuation', 3950, 1250, 'colony', { far: 'dropship', mid: 'landing-pad', foreground: 'beacons' }, { tint: '#425548', rain: 0.8 })
  ]),
  hazards: Object.freeze([
    Object.freeze({ id: 'colony-hazard-fire', kind: 'fire', zoneId: 'colony-habitat', x: 1760, y: FLOOR_Y - 20, w: 190, h: 20, eventId: 'colony-plaza-attack' }),
    Object.freeze({ id: 'colony-hazard-dark', kind: 'darkness', zoneId: 'colony-utility', x: 2460, y: 550, w: 400, h: 20, eventId: 'colony-blackout' }),
    Object.freeze({ id: 'colony-hazard-seed', kind: '$seed-primary', zoneId: 'colony-security', x: 3620, y: FLOOR_Y - 20, w: 170, h: 20 })
  ]),
  events: Object.freeze([
    Object.freeze({ id: 'colony-blackout', trigger: Object.freeze({ type: 'mission-start', zoneId: 'colony-approach' }), actions: Object.freeze(['power:disable', 'close:security-gate', 'art:blackout']) }),
    Object.freeze({ id: 'colony-generator-online', trigger: Object.freeze({ type: 'interact-anchor', anchorId: 'power' }), actions: Object.freeze(['power:restore', 'open:security-gate', 'art:emergency']) }),
    Object.freeze({ id: 'colony-plaza-attack', trigger: Object.freeze({ type: 'enter-zone', zoneId: 'colony-habitat' }), actions: Object.freeze(['spawn:colony-plaza-wave', 'activate:colony-hazard-fire']) })
  ]),
  spawns: Object.freeze([
    Object.freeze({ id: 'colony-gate-patrol', zoneId: 'colony-approach', triggerEventId: null, rosterTag: 'colony-raiders', baseCount: 3 }),
    Object.freeze({ id: 'colony-plaza-wave', zoneId: 'colony-habitat', triggerEventId: 'colony-plaza-attack', rosterTag: 'hive-runners', baseCount: 5 }),
    Object.freeze({ id: 'colony-security-guard', zoneId: 'colony-security', triggerEventId: 'colony-generator-online', rosterTag: 'security-synthetic', baseCount: 3 })
  ])
});

const PLANET_TEMPLATE = Object.freeze({
  id: 'planet-exterior',
  label: 'Extérieur planétaire',
  family: 'surface-expedition',
  dimensions: Object.freeze({ width: WORLD_WIDTH, height: 650 }),
  artLayers: Object.freeze({
    far: 'mission.planet.horizon-and-weather',
    mid: 'mission.planet.terrain-and-ruins',
    foreground: 'mission.planet.dust-and-flora',
    overlay: 'mission.planet.storm-front'
  }),
  nodes: Object.freeze([
    node('planet-spawn', 180, 480, 'planet-approach', 'spawn'),
    node('planet-valley', 650, 480, 'planet-approach'),
    node('planet-surface-a', 1250, 430, 'planet-surface'),
    node('planet-surface-b', 1950, 390, 'planet-surface'),
    node('planet-ruin', 2700, 430, 'planet-ruins', 'objective-primary'),
    node('planet-surface-c', 3500, 380, 'planet-surface'),
    node('planet-beacon', 4200, 450, 'planet-evac', 'archive'),
    node('planet-extraction', 4920, 470, 'planet-evac', 'extraction'),
    node('planet-ridge-entry', 650, 300, 'planet-ridge'),
    node('planet-ridge-a', 1300, 250, 'planet-ridge'),
    node('planet-ridge-b', 2200, 220, 'planet-ridge'),
    node('planet-ridge-c', 3200, 260, 'planet-ridge', 'boss'),
    node('planet-cave-entry', 1250, 540, 'planet-caves'),
    node('planet-cave-a', 1900, 570, 'planet-caves'),
    node('planet-cave-b', 2700, 550, 'planet-caves', 'power'),
    node('planet-cave-c', 3500, 570, 'planet-caves')
  ]),
  edges: Object.freeze([
    edge('planet-e01', 'planet-spawn', 'planet-valley', 'walk', ['planet-surface-route', 'planet-ridge-route', 'planet-cave-route']),
    edge('planet-e02', 'planet-valley', 'planet-surface-a', 'slope', ['planet-surface-route', 'planet-cave-route']),
    edge('planet-e03', 'planet-surface-a', 'planet-surface-b', 'slope', ['planet-surface-route']),
    edge('planet-e04', 'planet-surface-b', 'planet-ruin', 'slope', ['planet-surface-route']),
    edge('planet-e05', 'planet-ruin', 'planet-surface-c', 'slope', ['planet-surface-route']),
    edge('planet-e06', 'planet-surface-c', 'planet-beacon', 'slope', ['planet-surface-route']),
    edge('planet-e07', 'planet-beacon', 'planet-extraction', 'walk', ['planet-surface-route', 'planet-ridge-route', 'planet-cave-route']),
    edge('planet-e08', 'planet-valley', 'planet-ridge-entry', 'ladder', ['planet-ridge-route']),
    edge('planet-e09', 'planet-ridge-entry', 'planet-ridge-a', 'slope', ['planet-ridge-route']),
    edge('planet-e10', 'planet-ridge-a', 'planet-ridge-b', 'slope', ['planet-ridge-route']),
    edge('planet-e11', 'planet-ridge-b', 'planet-ridge-c', 'slope', ['planet-ridge-route']),
    edge('planet-e12', 'planet-ridge-c', 'planet-beacon', 'slope', ['planet-ridge-route']),
    edge('planet-e13', 'planet-surface-a', 'planet-cave-entry', 'ladder', ['planet-cave-route']),
    edge('planet-e14', 'planet-cave-entry', 'planet-cave-a', 'walk', ['planet-cave-route']),
    edge('planet-e15', 'planet-cave-a', 'planet-cave-b', 'walk', ['planet-cave-route']),
    edge('planet-e16', 'planet-cave-b', 'planet-cave-c', 'walk', ['planet-cave-route']),
    edge('planet-e17', 'planet-cave-c', 'planet-beacon', 'slope', ['planet-cave-route']),
    edge('planet-e18', 'planet-ruin', 'planet-cave-b', 'ladder', []),
    edge('planet-e19', 'planet-surface-b', 'planet-ridge-b', 'ladder', [])
  ]),
  routes: Object.freeze([
    route('planet-surface-route', 'surface', ['planet-spawn', 'planet-valley', 'planet-surface-a', 'planet-surface-b', 'planet-ruin', 'planet-surface-c', 'planet-beacon', 'planet-extraction']),
    route('planet-ridge-route', 'ridge', ['planet-spawn', 'planet-valley', 'planet-ridge-entry', 'planet-ridge-a', 'planet-ridge-b', 'planet-ridge-c', 'planet-beacon', 'planet-extraction']),
    route('planet-cave-route', 'caves', ['planet-spawn', 'planet-valley', 'planet-surface-a', 'planet-cave-entry', 'planet-cave-a', 'planet-cave-b', 'planet-cave-c', 'planet-beacon', 'planet-extraction'])
  ]),
  zones: Object.freeze([
    zone('planet-approach', 'Vallée d’insertion', 0, 900, 'badlands', { far: 'horizon', mid: 'valley', foreground: 'dust' }, { tint: '#573626', wind: 0.45 }),
    zone('planet-surface', 'Plateau exposé', 900, 2800, 'world-primary', { far: 'weather', mid: 'terrain', foreground: 'debris' }, { tint: '#68412d', wind: 0.82 }),
    zone('planet-ridge', 'Crête', 500, 3000, 'world-secondary', { far: 'clouds', mid: 'ridge', foreground: 'spores' }, { tint: '#4d3d34', wind: 0.95 }),
    zone('planet-caves', 'Réseau souterrain', 1000, 2800, 'caverns', { far: 'rock', mid: 'caves', foreground: 'drips' }, { tint: '#29251f', fog: 0.42 }),
    zone('planet-ruins', 'Ruines', 2350, 750, 'ruins', { far: 'monoliths', mid: 'ruins', foreground: 'ash' }, { tint: '#51473c', wind: 0.3 }),
    zone('planet-evac', 'Balise d’évacuation', 3800, 1400, 'world-primary', { far: 'storm-break', mid: 'beacon', foreground: 'grass' }, { tint: '#75533d', wind: 0.65 })
  ]),
  hazards: Object.freeze([
    Object.freeze({ id: 'planet-hazard-radiation', kind: 'radiation', zoneId: 'planet-surface', x: 2200, y: FLOOR_Y - 20, w: 260, h: 20, eventId: 'planet-storm-front' }),
    Object.freeze({ id: 'planet-hazard-dark', kind: 'darkness', zoneId: 'planet-caves', x: 2880, y: 550, w: 360, h: 20, eventId: 'planet-cave-ambush' }),
    Object.freeze({ id: 'planet-hazard-seed', kind: '$seed-primary', zoneId: 'planet-ruins', x: 2760, y: FLOOR_Y - 20, w: 180, h: 20 })
  ]),
  events: Object.freeze([
    Object.freeze({ id: 'planet-storm-front', trigger: Object.freeze({ type: 'enter-zone', zoneId: 'planet-surface' }), actions: Object.freeze(['weather:storm', 'activate:planet-hazard-radiation', 'art:low-visibility']) }),
    Object.freeze({ id: 'planet-cave-ambush', trigger: Object.freeze({ type: 'enter-zone', zoneId: 'planet-caves' }), actions: Object.freeze(['spawn:planet-cave-pack', 'art:bioluminescence']) }),
    Object.freeze({ id: 'planet-beacon-defense', trigger: Object.freeze({ type: 'interact-anchor', anchorId: 'archive' }), actions: Object.freeze(['spawn:planet-evac-wave', 'timer:extraction', 'weather:break']) })
  ]),
  spawns: Object.freeze([
    Object.freeze({ id: 'planet-surface-fauna', zoneId: 'planet-surface', triggerEventId: 'planet-storm-front', rosterTag: 'surface-stalker', baseCount: 4 }),
    Object.freeze({ id: 'planet-cave-pack', zoneId: 'planet-caves', triggerEventId: 'planet-cave-ambush', rosterTag: 'cave-hive', baseCount: 5 }),
    Object.freeze({ id: 'planet-evac-wave', zoneId: 'planet-evac', triggerEventId: 'planet-beacon-defense', rosterTag: 'apex-pursuit', baseCount: 4 })
  ])
});

export const MISSION_LEVEL_TEMPLATES_V52 = Object.freeze({
  [SHIP_TEMPLATE.id]: SHIP_TEMPLATE,
  [COLONY_TEMPLATE.id]: COLONY_TEMPLATE,
  [PLANET_TEMPLATE.id]: PLANET_TEMPLATE
});

export function upgradeLevelSeedsV52(levelSeeds = []) {
  const source = list(levelSeeds);
  if (source.length && source.every((seed) => seed?.schemaVersion === 52)) return Object.freeze([...source]);
  return Object.freeze(source.map((seed, index) => {
    const primary = HAZARD_KINDS_V52[index % HAZARD_KINDS_V52.length];
    const secondary = (index + Math.max(0, Number(seed?.width) || 0)) % 5 === 0
      ? HAZARD_KINDS_V52[(index + 3) % HAZARD_KINDS_V52.length]
      : null;
    return Object.freeze({
      ...seed,
      schemaVersion: 52,
      catalogIndex: index,
      sourceSeedId: String(seed?.sourceSeedId || seed?.id || `legacy-seed-${index + 1}`),
      legacyHazards: Object.freeze(list(seed?.legacyHazards || seed?.hazards).map(String)),
      hazards: Object.freeze([primary, ...(secondary && secondary !== primary ? [secondary] : [])])
    });
  }));
}

export function selectMissionLevelSeedV52(campaign = {}, levelSeeds = [], variant = 0) {
  const upgraded = upgradeLevelSeedsV52(levelSeeds);
  if (!upgraded.length) throw new Error('selectMissionLevelSeedV52 requires at least one level seed');
  const worldId = String(campaign.worldId || 'world-unassigned');
  const objective = String(campaign.objective || 'secure the mission area');
  const exact = upgraded.filter((seed) => seed.worldId === worldId && seed.objective === objective);
  const sameWorld = upgraded.filter((seed) => seed.worldId === worldId);
  const sameObjective = upgraded.filter((seed) => seed.objective === objective);
  const candidates = exact.length ? exact : sameWorld.length ? sameWorld : sameObjective.length ? sameObjective : upgraded;
  const offset = Math.max(0, Math.trunc(Number(variant) || 0));
  const selected = candidates[(stableMissionHashV52(`${campaign.id || worldId}:${objective}`) + offset) % candidates.length];
  const mapping = exact.length ? 'exact-catalog-match' : sameWorld.length ? 'world-derived-objective' : sameObjective.length ? 'objective-derived-world' : 'fully-derived';
  return Object.freeze({
    ...selected,
    id: `${selected.sourceSeedId}--${slug(campaign.id || worldId)}--v${offset + 1}`,
    sourceSeedId: selected.sourceSeedId,
    worldId,
    objective,
    mapping,
    variant: offset,
    hazards: Object.freeze([...selected.hazards])
  });
}

export function selectMissionTemplateV52({ campaign = {}, world = {}, templateId = null } = {}) {
  const explicit = String(templateId || campaign.templateId || '');
  if (MISSION_LEVEL_TEMPLATES_V52[explicit]) return explicit;
  const text = [campaign.objective, campaign.name, world.name, world.atmosphere, ...list(world.biomes)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (/board|black[- ]box|vessel|ship|orbital|vacuum|derelict/.test(text)) return SHIP_TEMPLATE.id;
  if (/colony|colon|rescue|survivor|convoy|atmospher|habitation|defend/.test(text)) return COLONY_TEMPLATE.id;
  if (/badlands|jungle|oceanic|cavern|ruin|storm|toxic|corrosive|apex|track/.test(text)) return PLANET_TEMPLATE.id;
  return MISSION_TEMPLATE_IDS_V52[stableMissionHashV52(`${campaign.id || ''}:${world.id || campaign.worldId || ''}`) % MISSION_TEMPLATE_IDS_V52.length];
}

function resolveBiome(role, world) {
  const biomes = list(world?.biomes).map(String);
  if (role === 'world-primary') return biomes[0] || 'badlands';
  if (role === 'world-secondary') return biomes[1] || biomes[0] || 'caverns';
  return role;
}

function compileNodes(template, random) {
  return Object.freeze(template.nodes.map((entry) => {
    const fixed = entry.anchor === 'spawn' || entry.anchor === 'extraction';
    const jitterX = fixed ? 0 : Math.round((random() - 0.5) * 24);
    const jitterY = fixed ? 0 : Math.round((random() - 0.5) * 10);
    return Object.freeze({ ...entry, x: entry.x + jitterX, y: entry.y + jitterY });
  }));
}

function compileGraph(template, nodes) {
  const nodeMap = new Map(nodes.map((entry) => [entry.id, entry]));
  const edges = Object.freeze(template.edges.map((entry) => Object.freeze({ ...entry, routeIds: Object.freeze([...entry.routeIds]) })));
  const edgeMap = new Map(edges.map((entry) => [`${entry.from}>${entry.to}`, entry]));
  const routes = Object.freeze(template.routes.map((entry) => {
    const edgeIds = [];
    for (let index = 1; index < entry.nodeIds.length; index += 1) {
      const from = entry.nodeIds[index - 1];
      const to = entry.nodeIds[index];
      const linked = edgeMap.get(`${from}>${to}`) || edgeMap.get(`${to}>${from}`);
      if (linked) edgeIds.push(linked.id);
    }
    return Object.freeze({ ...entry, nodeIds: Object.freeze([...entry.nodeIds]), edgeIds: Object.freeze(edgeIds) });
  }));
  return Object.freeze({ nodes, edges, routes, nodeMap });
}

function compileGeometry(graph) {
  const platforms = [];
  const ladders = [];
  const doors = [];
  const vents = [];
  for (const entry of graph.nodes) {
    platforms.push(Object.freeze({
      id: `node-platform-${entry.id}`,
      x: Math.round(entry.x - entry.width / 2),
      y: Math.round(entry.y),
      w: entry.width,
      h: 22,
      zoneId: entry.zoneId,
      nodeId: entry.id,
      kind: 'template-node'
    }));
  }
  for (const link of graph.edges) {
    const from = graph.nodeMap.get(link.from);
    const to = graph.nodeMap.get(link.to);
    if (!from || !to) continue;
    if (['walk', 'slope', 'airlock', 'gate'].includes(link.kind)) {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.ceil(distance / 210));
      for (let step = 1; step < steps; step += 1) {
        const progress = step / steps;
        platforms.push(Object.freeze({
          id: `${link.id}-step-${step}`,
          x: Math.round(from.x + (to.x - from.x) * progress - 120),
          y: Math.round(from.y + (to.y - from.y) * progress),
          w: 240,
          h: 20,
          zoneId: progress < 0.5 ? from.zoneId : to.zoneId,
          edgeId: link.id,
          kind: link.kind === 'slope' ? 'terrain-step' : 'route-bridge'
        }));
      }
    }
    if (link.kind === 'ladder' || link.kind === 'lift') {
      ladders.push(Object.freeze({
        id: link.id,
        x: Math.round((from.x + to.x) / 2 - 18),
        y: Math.round(Math.min(from.y, to.y)),
        w: 36,
        h: Math.round(Math.abs(from.y - to.y) + 22),
        from: from.id,
        to: to.id,
        kind: link.kind
      }));
    }
    if (link.kind === 'airlock' || link.kind === 'gate') {
      doors.push(Object.freeze({
        id: link.gateId || link.id,
        x: Math.round((from.x + to.x) / 2 - 22),
        y: Math.round(Math.max(from.y, to.y) - 132),
        w: 44,
        h: 132,
        from: from.id,
        to: to.id,
        open: false
      }));
    }
    if (link.kind === 'vent') {
      vents.push(Object.freeze({
        id: link.ventId || link.id,
        from: Object.freeze({ nodeId: from.id, x: from.x, y: from.y - 44 }),
        to: Object.freeze({ nodeId: to.id, x: to.x, y: to.y - 44 }),
        open: false
      }));
    }
  }
  return Object.freeze({
    platforms: Object.freeze(platforms),
    ladders: Object.freeze(ladders),
    doors: Object.freeze(doors),
    vents: Object.freeze(vents)
  });
}

function compileRouteNodes(graph) {
  return Object.freeze(graph.nodes.map((entry) => Object.freeze({
    id: entry.id,
    x: entry.x,
    y: entry.y,
    zoneId: entry.zoneId,
    anchor: entry.anchor,
    routeIds: Object.freeze(graph.routes.filter((routeEntry) => routeEntry.nodeIds.includes(entry.id)).map((routeEntry) => routeEntry.id))
  })));
}

function compileBiomeZones(template, world) {
  return Object.freeze(template.zones.map((entry) => Object.freeze({
    ...entry,
    biome: resolveBiome(entry.biomeRole, world),
    layers: Object.freeze({ ...entry.layers }),
    visual: Object.freeze({ ...entry.visual })
  })));
}

function compileHazards(template, levelSeed, world, random) {
  const dangerScale = 0.8 + clamp(Number(world?.danger) || 5, 0, 20) * 0.045;
  const primary = levelSeed.hazards[0] || 'acid';
  return Object.freeze(template.hazards.map((entry) => {
    const kind = entry.kind === '$seed-primary' ? primary : entry.kind;
    const contract = HAZARD_CONTRACTS[kind] || HAZARD_CONTRACTS.acid;
    return Object.freeze({
      ...entry,
      kind,
      ...contract,
      x: Math.round(entry.x + (random() - 0.5) * 24),
      damage: Math.round((Number(contract.damage) || 0) * dangerScale),
      active: !entry.eventId
    });
  }));
}

function compileEvents(template, campaign) {
  const events = template.events.map((entry) => Object.freeze({
    ...entry,
    trigger: Object.freeze({ ...entry.trigger }),
    actions: Object.freeze([...entry.actions])
  }));
  events.push(Object.freeze({
    id: `${template.id}-campaign-objective`,
    trigger: Object.freeze({ type: 'objective-complete', anchorId: 'objective-primary', objective: String(campaign.objective || 'secure the mission area') }),
    actions: Object.freeze(['unlock:extraction', `consequence:${slug(campaign.mode || 'frontier')}`])
  }));
  return Object.freeze(events);
}

function compileSpawns(template, world, campaign) {
  const danger = clamp(Number(world?.danger) || 5, 1, 20);
  const modeBonus = campaign.mode === 'SURVIVAL' ? 2 : campaign.mode === 'CRUCIBLE' ? 1 : 0;
  return Object.freeze(template.spawns.map((entry) => Object.freeze({
    ...entry,
    count: clamp(entry.baseCount + Math.floor(danger / 4) + modeBonus, 1, 12),
    context: Object.freeze({ templateId: template.id, zoneId: entry.zoneId, mode: String(campaign.mode || 'FRONTIER') })
  })));
}

function topologySignature(template) {
  const edges = template.edges.map((entry) => `${entry.from}>${entry.to}:${entry.kind}`).sort().join('|');
  const routes = template.routes.map((entry) => entry.nodeIds.join('>')).sort().join('|');
  return `${template.id}:${stableMissionHashV52(`${edges}::${routes}`).toString(36)}`;
}

export function buildMissionLevelV52({
  campaign = {},
  world = {},
  levelSeeds = [],
  levelSeed = null,
  templateId = null,
  variant = 0
} = {}) {
  const selectedSeed = levelSeed
    ? selectMissionLevelSeedV52(campaign, upgradeLevelSeedsV52([levelSeed]), variant)
    : selectMissionLevelSeedV52(campaign, levelSeeds, variant);
  const selectedTemplateId = selectMissionTemplateV52({ campaign, world, templateId });
  const template = MISSION_LEVEL_TEMPLATES_V52[selectedTemplateId];
  const random = makeRandom(stableMissionHashV52(`${selectedSeed.seed}:${selectedSeed.id}:${selectedTemplateId}`));
  const nodes = compileNodes(template, random);
  const graph = compileGraph(template, nodes);
  const geometry = compileGeometry(graph);
  const routeNodes = compileRouteNodes(graph);
  const biomeZones = compileBiomeZones(template, world);
  const hazards = compileHazards(template, selectedSeed, world, random);
  const events = compileEvents(template, campaign);
  const spawns = compileSpawns(template, world, campaign);
  const anchors = Object.freeze(Object.fromEntries(nodes.filter((entry) => entry.anchor).map((entry) => [entry.anchor, Object.freeze({ nodeId: entry.id, x: entry.x, y: entry.y, zoneId: entry.zoneId })])));
  const palette = TEMPLATE_PALETTES[selectedTemplateId];
  const verticalValues = nodes.map((entry) => entry.y);
  const routeRuntime = Object.freeze({
    signature: `${selectedTemplateId}:${selectedSeed.id}`,
    topologySignature: topologySignature(template),
    source: 'mission-template-v52',
    seed: selectedSeed.seed,
    widthCells: selectedSeed.width,
    heightCells: selectedSeed.height,
    horizontalMeters: selectedSeed.width * 48,
    verticalMeters: selectedSeed.height * 18,
    routes: graph.routes.length,
    verticalSpan: Math.max(...verticalValues) - Math.min(...verticalValues),
    maxTier: Math.max(1, Math.ceil((Math.max(...verticalValues) - Math.min(...verticalValues)) / 112)),
    routeSpan: template.dimensions.width,
    palette,
    declaredHazards: Object.freeze([...new Set(hazards.map((hazard) => hazard.kind))]),
    artLayers: template.artLayers,
    platforms: geometry.platforms,
    ladders: geometry.ladders,
    hazards,
    routeNodes,
    biomeZones
  });
  const plan = {
    schemaVersion: 52,
    templateId: selectedTemplateId,
    templateLabel: template.label,
    topologySignature: routeRuntime.topologySignature,
    signature: routeRuntime.signature,
    dimensions: template.dimensions,
    campaign: Object.freeze({ id: String(campaign.id || ''), mode: String(campaign.mode || 'FRONTIER'), objective: selectedSeed.objective, worldId: selectedSeed.worldId }),
    world: Object.freeze({ id: String(world.id || campaign.worldId || ''), danger: Number(world.danger) || 5, biomes: Object.freeze(list(world.biomes).map(String)) }),
    levelSeed: selectedSeed,
    graph: Object.freeze({ nodes: graph.nodes, edges: graph.edges, routes: graph.routes }),
    geometry,
    anchors,
    hazards,
    events,
    spawns,
    biomeZones,
    artLayers: template.artLayers,
    palette,
    routeRuntime
  };
  const validation = validateMissionTopologyV52(plan);
  if (!validation.valid) throw new Error(`Invalid mission template ${selectedTemplateId}: ${validation.errors.join('; ')}`);
  return Object.freeze({ ...plan, validation });
}

export function validateMissionTopologyV52(plan = {}) {
  const errors = [];
  const nodes = list(plan.graph?.nodes);
  const edges = list(plan.graph?.edges);
  const routes = list(plan.graph?.routes);
  const zones = list(plan.biomeZones);
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const zoneIds = new Set(zones.map((entry) => entry.id));
  if (!MISSION_TEMPLATE_IDS_V52.includes(plan.templateId)) errors.push('unsupported templateId');
  if (nodeIds.size !== nodes.length) errors.push('duplicate graph node id');
  if (zones.some((entry) => !entry.layers?.far || !entry.layers?.mid || !entry.layers?.foreground)) errors.push('biome zone missing art layers');
  for (const entry of nodes) if (!zoneIds.has(entry.zoneId)) errors.push(`node ${entry.id} references unknown zone ${entry.zoneId}`);
  for (const entry of edges) {
    if (!nodeIds.has(entry.from) || !nodeIds.has(entry.to)) errors.push(`edge ${entry.id} has missing endpoint`);
  }
  const spawnId = plan.anchors?.spawn?.nodeId;
  const extractionId = plan.anchors?.extraction?.nodeId;
  if (!spawnId || !nodeIds.has(spawnId)) errors.push('spawn anchor missing');
  if (!extractionId || !nodeIds.has(extractionId)) errors.push('extraction anchor missing');
  const adjacency = new Map(nodes.map((entry) => [entry.id, []]));
  for (const entry of edges) {
    adjacency.get(entry.from)?.push(entry.to);
    if (!entry.oneWay) adjacency.get(entry.to)?.push(entry.from);
  }
  const reached = new Set(spawnId ? [spawnId] : []);
  const queue = spawnId ? [spawnId] : [];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacency.get(current) || []) {
      if (reached.has(next)) continue;
      reached.add(next);
      queue.push(next);
    }
  }
  if (extractionId && !reached.has(extractionId)) errors.push('extraction is unreachable');
  if (reached.size !== nodes.length) errors.push(`graph disconnected: ${reached.size}/${nodes.length} nodes reachable`);
  const edgePairs = new Set(edges.flatMap((entry) => [`${entry.from}>${entry.to}`, `${entry.to}>${entry.from}`]));
  const routeSignatures = new Set();
  for (const entry of routes) {
    if (entry.nodeIds[0] !== spawnId || entry.nodeIds.at(-1) !== extractionId) errors.push(`route ${entry.id} does not connect spawn to extraction`);
    for (let index = 1; index < entry.nodeIds.length; index += 1) {
      if (!edgePairs.has(`${entry.nodeIds[index - 1]}>${entry.nodeIds[index]}`)) errors.push(`route ${entry.id} has a broken segment`);
    }
    routeSignatures.add(entry.nodeIds.join('>'));
  }
  if (routes.length < 2 || routeSignatures.size < 2) errors.push('at least two genuinely distinct routes are required');
  const eventIds = new Set(list(plan.events).map((entry) => entry.id));
  for (const entry of list(plan.events)) {
    if (entry.trigger?.zoneId && !zoneIds.has(entry.trigger.zoneId)) errors.push(`event ${entry.id} references unknown zone`);
    if (entry.trigger?.anchorId && !plan.anchors?.[entry.trigger.anchorId]) errors.push(`event ${entry.id} references unknown anchor`);
  }
  for (const entry of list(plan.spawns)) {
    if (!zoneIds.has(entry.zoneId)) errors.push(`spawn ${entry.id} references unknown zone`);
    if (entry.triggerEventId && !eventIds.has(entry.triggerEventId)) errors.push(`spawn ${entry.id} references unknown event`);
  }
  for (const entry of list(plan.hazards)) if (!zoneIds.has(entry.zoneId)) errors.push(`hazard ${entry.id} references unknown zone`);
  if (!plan.artLayers?.far || !plan.artLayers?.mid || !plan.artLayers?.foreground) errors.push('mission art layers incomplete');
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    connectedNodes: reached.size,
    totalNodes: nodes.length,
    routeCount: routes.length,
    zoneCount: zones.length,
    contextualEventCount: list(plan.events).length,
    contextualSpawnCount: list(plan.spawns).length
  });
}
