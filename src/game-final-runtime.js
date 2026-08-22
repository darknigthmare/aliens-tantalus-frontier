import { GameEngine as CompleteGameEngine } from './game-complete.js';

export * from './game-complete.js';

const WORLD_WIDTH = 6200;
const WORLD_HEIGHT = 1080;
const FLOOR_Y = 930;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const list = (value) => Array.isArray(value) ? [...value] : [];
const overlaps = (a, b) => Boolean(a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
const entityDistance = (a, b) => Math.hypot((a.x + a.w / 2) - (b.x + b.w / 2), (a.y + a.h / 2) - (b.y + b.h / 2));

function hash(value) {
  let result = 2166136261;
  for (const character of String(value || '')) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function seeded(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

const FAMILY_ALIASES = Object.freeze({
  ground: 'ground', land: 'ground', rover: 'ground', tank: 'ground', apc: 'ground',
  air: 'air', aerial: 'air', dropship: 'air', aircraft: 'air',
  space: 'space', orbital: 'space', spacecraft: 'space', shuttle: 'space',
  maritime: 'maritime', marine: 'maritime', aquatic: 'maritime', naval: 'maritime', submersible: 'maritime',
  rail: 'rail', tram: 'rail', maglev: 'rail', train: 'rail',
  exosuit: 'exosuit', loader: 'exosuit', walker: 'exosuit', mech: 'exosuit'
});

const VEHICLE_HANDLING = Object.freeze({
  ground: Object.freeze({ locomotion: 'traction', axes: ['horizontal'], speedScale: 1, acceleration: 9, drag: 10, fuelRate: 1.9, collision: true, ram: true, gravity: false, altitude: false, environmentalImmunity: [] }),
  air: Object.freeze({ locomotion: 'vectored-flight', axes: ['horizontal', 'vertical'], speedScale: 0.92, acceleration: 7, drag: 6, fuelRate: 3.2, collision: false, ram: true, gravity: false, altitude: true, environmentalImmunity: ['flood'] }),
  space: Object.freeze({ locomotion: 'inertial-flight', axes: ['horizontal', 'vertical'], speedScale: 1.12, acceleration: 2.4, drag: 0.55, fuelRate: 2.5, collision: false, ram: true, gravity: false, altitude: true, environmentalImmunity: ['vacuum', 'flood'] }),
  maritime: Object.freeze({ locomotion: 'buoyant-thrust', axes: ['horizontal', 'depth'], speedScale: 0.72, acceleration: 5, drag: 4.5, fuelRate: 2.1, collision: false, ram: true, gravity: false, altitude: true, environmentalImmunity: ['flood'] }),
  rail: Object.freeze({ locomotion: 'guided-rail', axes: ['horizontal'], speedScale: 1.08, acceleration: 12, drag: 13, fuelRate: 1.35, collision: false, ram: true, gravity: false, altitude: false, environmentalImmunity: ['flood'] }),
  exosuit: Object.freeze({ locomotion: 'powered-walker', axes: ['horizontal', 'jump'], speedScale: 0.5, acceleration: 13, drag: 12, fuelRate: 1.6, collision: true, ram: true, gravity: true, altitude: true, environmentalImmunity: [] })
});

export function normalizeVehicleFamily(family = 'ground') {
  const normalized = String(family || 'ground').toLowerCase().trim();
  return FAMILY_ALIASES[normalized] || 'ground';
}

export function buildVehicleHandlingProfile(vehicle = {}) {
  const family = normalizeVehicleFamily(vehicle.family);
  const base = VEHICLE_HANDLING[family];
  const actions = new Set(list(vehicle.actions));
  const seats = list(vehicle.seats);
  const roles = seats.map((seat) => String(seat.role || 'passenger'));
  const canDrive = actions.has('drive') || roles.includes('driver') || actions.size === 0;
  const canBoost = actions.has('boost');
  const canFire = actions.has('fire') || roles.includes('gunner');
  const baseSpeed = clamp(Number(vehicle.runtimeSpeed) || 150 + (Number(vehicle.speed) || 105) * 1.85, 170, 620);
  return Object.freeze({
    family,
    locomotion: base.locomotion,
    axes: Object.freeze([...base.axes]),
    maxSpeed: Math.round(baseSpeed * base.speedScale),
    acceleration: base.acceleration,
    drag: base.drag,
    fuelRate: base.fuelRate,
    collision: base.collision,
    canRam: base.ram,
    gravity: base.gravity,
    altitudeControl: base.altitude,
    environmentalImmunity: Object.freeze([...base.environmentalImmunity]),
    canDrive,
    canBoost,
    canFire,
    roles: Object.freeze(roles),
    passengerCapacity: Math.max(0, seats.length - 1)
  });
}

const BIOME_PALETTES = Object.freeze({
  oceanic: Object.freeze({ sky: '#07171d', haze: '#155263', accent: '#58a9b7', light: 0.48, prop: 'reef' }),
  cryogenic: Object.freeze({ sky: '#101923', haze: '#7c9daf', accent: '#c2eff4', light: 0.78, prop: 'ice' }),
  jungle: Object.freeze({ sky: '#06130c', haze: '#284f32', accent: '#75aa68', light: 0.42, prop: 'canopy' }),
  badlands: Object.freeze({ sky: '#1b0d09', haze: '#7b402b', accent: '#d58a55', light: 0.7, prop: 'mesa' }),
  foundry: Object.freeze({ sky: '#120806', haze: '#68281b', accent: '#ef7847', light: 0.62, prop: 'furnace' }),
  orbital: Object.freeze({ sky: '#01040a', haze: '#17254d', accent: '#7291d2', light: 0.55, prop: 'stars' }),
  hive: Object.freeze({ sky: '#070807', haze: '#242d1d', accent: '#9bac55', light: 0.28, prop: 'resin' }),
  industrial: Object.freeze({ sky: '#05090a', haze: '#293a38', accent: '#79a28f', light: 0.56, prop: 'gantry' }),
  colony: Object.freeze({ sky: '#07100f', haze: '#31463e', accent: '#8faf91', light: 0.62, prop: 'habitat' }),
  laboratory: Object.freeze({ sky: '#081116', haze: '#304f5d', accent: '#91d5dc', light: 0.72, prop: 'lab' }),
  mines: Object.freeze({ sky: '#090806', haze: '#3d3325', accent: '#b69255', light: 0.36, prop: 'strata' }),
  default: Object.freeze({ sky: '#04090a', haze: '#243b36', accent: '#78a990', light: 0.55, prop: 'frontier' })
});

function paletteForBiomes(biomes) {
  for (const biome of list(biomes).map((entry) => String(entry).toLowerCase())) {
    if (BIOME_PALETTES[biome]) return { id: biome, ...BIOME_PALETTES[biome] };
  }
  return { id: String(list(biomes)[0] || 'frontier'), ...BIOME_PALETTES.default };
}

function hazardContract(type = 'industrial', danger = 5) {
  const id = String(type || 'industrial').toLowerCase();
  const contracts = {
    acid: { effect: 'corrosion', damage: 14, armorDrain: 8, slow: 0 },
    vacuum: { effect: 'decompression', damage: 8, oxygenDrain: 22, slow: 0 },
    fire: { effect: 'burn', damage: 22, armorDrain: 3, slow: 0 },
    steam: { effect: 'scald-knockback', damage: 12, knockback: 280, slow: 0.4 },
    electrical: { effect: 'shock', damage: 22, stun: 1.25, impulse: 80, slow: 0 },
    radiation: { effect: 'irradiation', damage: 7, trackerDrain: 18, slow: 0 },
    flood: { effect: 'drag', damage: 0, trackerDrain: 5, slow: 0.58 },
    darkness: { effect: 'obscurity', damage: 0, trackerDrain: 10, slow: 0 },
    toxic: { effect: 'toxicity', damage: 10, oxygenDrain: 12, slow: 0.2 },
    corrosive: { effect: 'corrosion', damage: 16, armorDrain: 10, slow: 0 },
    industrial: { effect: 'machinery', damage: 13, knockback: 180, slow: 0 }
  };
  const contract = contracts[id] || contracts.industrial;
  const scale = 0.8 + clamp(Number(danger) || 5, 0, 20) * 0.045;
  return Object.freeze({ kind: id, ...contract, damage: Math.round(contract.damage * scale) });
}

export function buildLevelRouteRuntime(plan = {}) {
  const level = plan.level || plan.levelSeed || {};
  const campaign = plan.campaign || {};
  const world = plan.world || {};
  const widthCells = clamp(Math.round(Number(level.width) || 6), 1, 64);
  const heightCells = clamp(Math.round(Number(level.height) || 4), 1, 36);
  const routes = clamp(Math.round(Number(level.routes ?? campaign.routes) || 3), 1, 12);
  const seedValue = (Number(level.seed) || hash(`${campaign.id}:${world.id}`)) >>> 0;
  const random = seeded(seedValue);
  const maxTier = clamp(Math.ceil(heightCells / 2), 1, 5);
  const platformCount = clamp(4 + Math.ceil(widthCells * 0.85) + routes * 2, 7, 36);
  const routeSpan = clamp(3100 + widthCells * 250, 3350, WORLD_WIDTH - 420);
  const startX = 260;
  const step = routeSpan / Math.max(1, platformCount);
  const platforms = [];
  const ladders = [];
  const routeNodes = [];
  for (let index = 0; index < platformCount; index += 1) {
    const lane = index % routes;
    const tier = 1 + ((index * 3 + lane + Math.floor(random() * maxTier)) % maxTier);
    const width = clamp(step * (0.75 + random() * 0.65), 180, 560);
    const x = clamp(startX + index * step + (random() - 0.5) * step * 0.34, 80, WORLD_WIDTH - width - 90);
    const y = clamp(FLOOR_Y - tier * (112 + Math.min(20, heightCells * 2)) - random() * 28, 210, FLOOR_Y - 105);
    const id = `route-${lane + 1}-platform-${index + 1}`;
    platforms.push({ id, route: lane + 1, tier, x, y, w: width, h: 24, art: index % 3 === 0 ? 'ledge' : 'catwalk' });
    routeNodes.push({ id: `node-${lane + 1}-${index + 1}`, route: lane + 1, x: Math.round(x + width / 2), y: Math.round(y), tier });
    if (index % 2 === 0 || tier > 2) ladders.push({ id: `route-ladder-${index + 1}`, route: lane + 1, x: x + Math.min(width - 36, 48 + random() * Math.max(20, width - 100)), top: y, bottom: FLOOR_Y, w: 52 });
  }
  const declaredHazards = list(level.hazards).length ? list(level.hazards) : [world.atmosphere === 'vacuum' ? 'vacuum' : world.atmosphere === 'corrosive' ? 'acid' : 'industrial'];
  const hazardCount = clamp(declaredHazards.length + Math.floor((Number(world.danger) || 5) / 3) + (campaign.mode === 'SURVIVAL' ? 2 : 0), declaredHazards.length, 12);
  const hazards = Array.from({ length: hazardCount }, (_, index) => {
    const contract = hazardContract(declaredHazards[index % declaredHazards.length], world.danger);
    const w = 86 + Math.round(random() * 92);
    return { id: `route-hazard-${index + 1}`, ...contract, x: clamp(850 + index * (routeSpan / Math.max(1, hazardCount)) + random() * 130, 480, WORLD_WIDTH - w - 160), y: FLOOR_Y - 20, w, h: 20, active: true };
  });
  const palette = paletteForBiomes(world.biomes);
  const biomeZones = Array.from({ length: Math.max(3, routes) }, (_, index) => ({
    id: `biome-zone-${index + 1}`,
    x: Math.round(index * WORLD_WIDTH / Math.max(3, routes)),
    w: Math.ceil(WORLD_WIDTH / Math.max(3, routes)) + 2,
    biome: list(world.biomes)[index % Math.max(1, list(world.biomes).length)] || palette.id,
    prop: index % 2 ? palette.prop : campaign.mode === 'MIRE' ? 'archive' : palette.prop
  }));
  const signature = `${String(level.id || 'runtime')}:${seedValue.toString(36)}:${widthCells}x${heightCells}:r${routes}:${palette.id}:${declaredHazards.join('+')}`;
  return Object.freeze({
    signature,
    seed: seedValue,
    source: 'procedural-contract',
    widthCells,
    heightCells,
    horizontalMeters: widthCells * 48,
    verticalMeters: heightCells * 18,
    routes,
    maxTier,
    routeSpan: Math.round(routeSpan),
    palette: Object.freeze(palette),
    declaredHazards: Object.freeze([...declaredHazards]),
    platforms: Object.freeze(platforms.map(Object.freeze)),
    ladders: Object.freeze(ladders.map(Object.freeze)),
    hazards: Object.freeze(hazards.map(Object.freeze)),
    routeNodes: Object.freeze(routeNodes.map(Object.freeze)),
    biomeZones: Object.freeze(biomeZones.map(Object.freeze))
  });
}

const EQUIPMENT_RULES = Object.freeze([
  [/motion tracker/i, 'motion-pulse'], [/access tuner/i, 'access-bypass'], [/maintenance jack/i, 'field-repair'], [/cutting torch/i, 'breach'],
  [/flashlight/i, 'illumination'], [/medkit|trauma kit/i, 'medical'], [/rebreather/i, 'oxygen-reserve'],
  [/m3 personnel armor|ape suit|pressure suit|hazmat suit|ripper xenoarmor/i, 'protective-layer'], [/welding kit/i, 'field-repair'],
  [/portable battery/i, 'power-transfer'], [/seismic surveyor|pathogen scanner/i, 'deep-scan'], [/neuro-link helmet|atarax control rig/i, 'neuro-stabilize'],
  [/portable sentry/i, 'deploy-sentry'], [/ammo satchel/i, 'ammo-resupply'], [/drone controller/i, 'drone-recon'], [/signal jammer/i, 'signal-jam'],
  [/cryo mine/i, 'cryo-trap'], [/incinerator fuel pack/i, 'incendiary-load'], [/electroshock trap/i, 'shock-trap'], [/catch pole/i, 'live-restraint'],
  [/portable quarantine/i, 'containment-field'], [/synthetic repair kit/i, 'synthetic-repair'], [/colony beacon/i, 'checkpoint-beacon']
]);

export function buildEquipmentActionRuntime(item = {}, index = 0) {
  const name = String(item.name || `Field Equipment ${index + 1}`);
  const utility = String(item.utility || 'survival');
  const matched = EQUIPMENT_RULES.find(([matcher]) => matcher.test(name));
  const utilityFallback = { recon: 'deep-scan', survival: 'protective-layer', engineering: 'field-repair', medical: 'medical', control: 'signal-jam', defense: 'containment-field' };
  const action = matched?.[1] || utilityFallback[utility] || 'field-support';
  const gradeScale = { Civilian: 0.85, Field: 1, Military: 1.2, Research: 1.35 }[item.grade] || 1;
  const charges = clamp(Math.round(Number(item.charges) || 1), 0, 99);
  return Object.freeze({
    id: String(item.id || `equipment-runtime-${index + 1}`),
    name,
    utility,
    grade: String(item.grade || 'Field'),
    rarity: String(item.rarity || 'standard'),
    action,
    charges,
    maxCharges: charges,
    magnitude: Math.round((12 + charges * 3) * gradeScale),
    mass: Math.max(0, Number(item.mass) || 0),
    provenance: String(item.provenance || 'runtime-default')
  });
}

const COSTUME_COLORS = Object.freeze({
  'Hadley olive': ['#718665', '#b9c58e'], 'Nostromo ivory': ['#cbc7b5', '#ecdfb2'], 'Sevastopol orange': ['#b75b35', '#f2a45d'],
  'UPP red': ['#853936', '#d56a60'], 'Tantalus green': ['#4f8a6a', '#8ed0a4'], 'Renaissance white': ['#d5e1df', '#7eb9c4'], 'Fury soot': ['#3e4240', '#8d958e']
});

function inferFaction(palette, name) {
  const text = `${palette} ${name}`.toLowerCase();
  if (text.includes('upp')) return 'upp';
  if (text.includes('hadley') || text.includes('m3')) return 'uscm';
  if (text.includes('nostromo')) return 'commercial-fleet';
  if (text.includes('sevastopol')) return 'seegson';
  if (text.includes('renaissance')) return 'weyland-yutani';
  if (text.includes('tantalus')) return 'echo-9';
  return 'frontier';
}

export function buildCostumeRuntime(costume = null) {
  if (!costume) return Object.freeze({ active: false, id: null, armor: 0, mobility: 1, stealth: 0, faction: 'echo-9', provenance: 'none', visual: Object.freeze({ primary: '#92d6a6', accent: '#d7ead6' }), resistances: Object.freeze([]) });
  const part = String(costume.part || 'field uniform');
  const palette = String(costume.palette || 'Tantalus green');
  const wear = String(costume.wear || 'field');
  const armor = /ape suit/i.test(part) ? 42 : /m3 armor/i.test(part) ? 34 : /pressure|hazmat/i.test(part) ? 24 : /miner rig/i.test(part) ? 20 : /synthetic shell/i.test(part) ? 28 : 10;
  const mobility = clamp((/ape suit|miner rig/i.test(part) ? 0.88 : /flight suit|corporate uniform/i.test(part) ? 1.08 : 1) - (wear === 'damaged' ? 0.06 : 0), 0.75, 1.12);
  const stealth = clamp(18 + (/soot|olive/i.test(palette) ? 24 : /white|ivory/i.test(palette) ? -8 : 8) + (/flight suit|corporate uniform/i.test(part) ? 8 : 0) + (wear === 'acid-scarred' ? 5 : 0), 0, 80);
  const resistances = [];
  if (/pressure|ape suit/i.test(part)) resistances.push('vacuum');
  if (/hazmat|ape suit/i.test(part)) resistances.push('radiation', 'toxic');
  if (/m3 armor|synthetic shell|ape suit/i.test(part)) resistances.push('industrial');
  if (/miner rig|ape suit/i.test(part)) resistances.push('fire');
  const colors = COSTUME_COLORS[palette] || [`#${(hash(palette) & 0xffffff).toString(16).padStart(6, '0')}`, '#c4d6c8'];
  return Object.freeze({
    active: true,
    id: String(costume.id || `costume-${hash(`${part}:${palette}`)}`),
    name: String(costume.name || `${part} — ${palette}`),
    body: String(costume.body || 'human-a'),
    part,
    palette,
    wear,
    armor,
    mobility,
    stealth,
    faction: inferFaction(palette, costume.name),
    provenance: String(costume.provenance || 'runtime-default'),
    resistances: Object.freeze([...new Set(resistances)]),
    visual: Object.freeze({ primary: colors[0], accent: colors[1], marking: `${inferFaction(palette, costume.name)}:${wear}` })
  });
}

export function shouldSpawnApex({ dossier = null, world = {}, campaign = {}, levelSeed = {} } = {}) {
  if (!dossier) return Object.freeze({ requested: false, eligible: false, reason: 'no-dossier', roll: null, chance: 0, checks: Object.freeze([]) });
  const restrictions = list(dossier.restrictions).map((entry) => String(entry).toLowerCase());
  const dangerRule = restrictions.find((rule) => /^danger-\d+$/.test(rule));
  const minimumDanger = dangerRule ? Number(dangerRule.split('-')[1]) : 0;
  const danger = Number(world.danger) || 0;
  const habitatRules = restrictions.filter((rule) => rule !== dangerRule);
  const contextTokens = [
    ...list(world.biomes), world.atmosphere, world.name, world.description, world.kit,
    ...list(levelSeed.hazards), levelSeed.kit, levelSeed.name, levelSeed.objective,
    campaign.mode, campaign.name, campaign.objective, campaign.source
  ].filter(Boolean).join(' ').toLowerCase();
  const habitatEligible = habitatRules.length === 0 || habitatRules.some((rule) => contextTokens.includes(rule));
  const dangerEligible = danger >= minimumDanger;
  const chance = clamp(Number(dossier.spawnChance) || 0, 0, 100);
  const seedValue = hash(`${dossier.id}:${levelSeed.seed ?? 0}:${world.id}:${campaign.id}`);
  const roll = (seedValue % 10000) / 100;
  const chanceEligible = roll < chance;
  const checks = Object.freeze([
    Object.freeze({ id: 'habitat', passed: habitatEligible, expected: habitatRules }),
    Object.freeze({ id: 'danger', passed: dangerEligible, expected: minimumDanger, actual: danger }),
    Object.freeze({ id: 'spawn-roll', passed: chanceEligible, expected: chance, actual: roll })
  ]);
  const eligible = habitatEligible && dangerEligible && chanceEligible;
  const reason = eligible ? 'eligible' : !habitatEligible ? 'habitat-blocked' : !dangerEligible ? 'danger-blocked' : 'spawn-roll-blocked';
  return Object.freeze({ requested: true, dossierId: String(dossier.id || ''), eligible, reason, roll, chance, checks });
}

export class GameEngine extends CompleteGameEngine {
  start(options = {}) {
    this.requestedCostumeRuntime = buildCostumeRuntime(options.costume);
    this.apexEligibility = shouldSpawnApex({ dossier: options.apexDossier, world: options.world, campaign: options.campaign, levelSeed: options.levelSeed });
    const effectiveOptions = { ...options, apexDossier: this.apexEligibility.eligible ? options.apexDossier : null };
    super.start(effectiveOptions);
    this.configureFinalRuntime(effectiveOptions);
    this.onEvent({ type: 'apex-eligibility', ...this.apexEligibility });
    return this.getSnapshot();
  }

  configureFinalRuntime(options) {
    this.costumeRuntime = this.requestedCostumeRuntime;
    this.applyCostumeRuntime();
    this.equipmentActions = new Map(this.missionPlan.equipment.map((item, index) => {
      const runtime = buildEquipmentActionRuntime(item, index);
      return [runtime.id, { ...runtime, remaining: runtime.charges, uses: 0, lastResult: null }];
    }));
    this.equipmentUseLog = [];
    this.supportDeployments = [];
    this.fieldEffects = { scans: 0, repairs: 0, breaches: 0, illumination: 0, protection: 0, weaponBoostShots: 0, restraints: 0, containment: 0, jammerUntil: 0 };
    this.environmentStatus = { oxygen: 100, maxOxygen: 100, slowUntil: 0, slowFactor: 1, lastHazard: null, protectedHits: 0 };
    this.stealthRuntime = { visibility: 50, noise: 0, ambientLight: 0.55, detectionRadius: 420, spottedBy: new Set(), lastEvent: null, lightBoost: 0, noiseBurstUntil: 0 };
    this.vehicleHandling = buildVehicleHandlingProfile(this.selectedVehicleRuntime);
    this.configureVehicleRuntime();
    this.routeRuntime = this.editorMode ? this.buildForgeRouteReport() : buildLevelRouteRuntime(this.missionPlan);
    if (!this.editorMode) this.applyGeneratedRouteRuntime();
    this.refreshStealth(this.player);
    this.onEvent({
      type: 'level-runtime-compiled',
      signature: this.routeRuntime.signature,
      routes: this.routeRuntime.routes,
      dimensions: [this.routeRuntime.widthCells, this.routeRuntime.heightCells],
      hazards: [...this.routeRuntime.declaredHazards]
    });
    this.onEvent({ type: 'vehicle-mode-ready', vehicleId: this.selectedVehicleRuntime.id, family: this.vehicleHandling.family, locomotion: this.vehicleHandling.locomotion, seats: this.vehicle?.seatAssignments || [] });
    this.onEvent({ type: 'costume-runtime-ready', costumeId: this.costumeRuntime.id, active: this.costumeRuntime.active, faction: this.costumeRuntime.faction });
    return options;
  }

  applyCostumeRuntime() {
    if (!this.costumeRuntime.active || !this.player) return;
    this.player.maxArmor = Math.max(this.player.maxArmor, 50 + this.costumeRuntime.armor);
    this.player.armor = clamp(this.player.armor + this.costumeRuntime.armor, 0, this.player.maxArmor);
    this.player.costumeId = this.costumeRuntime.id;
    this.player.costumeMobility = this.costumeRuntime.mobility;
    this.player.stealthRating = this.costumeRuntime.stealth;
    this.player.factionMarking = this.costumeRuntime.faction;
  }

  buildForgeRouteReport() {
    const level = this.missionPlan.level;
    const palette = paletteForBiomes(this.missionPlan.world.biomes);
    return Object.freeze({
      signature: `forge:${level.id}:${this.editorTileCount}`,
      seed: level.seed,
      source: 'frontier-forge',
      widthCells: level.width,
      heightCells: level.height,
      horizontalMeters: level.width * 48,
      verticalMeters: level.height * 18,
      routes: level.routes,
      maxTier: Math.max(1, this.ladders.length),
      routeSpan: WORLD_WIDTH,
      palette: Object.freeze(palette),
      declaredHazards: Object.freeze([...this.environmentRuntime.hazardTypes]),
      platforms: Object.freeze([]),
      ladders: Object.freeze([]),
      hazards: Object.freeze([]),
      routeNodes: Object.freeze([]),
      biomeZones: Object.freeze([])
    });
  }

  applyGeneratedRouteRuntime() {
    this.platforms.push(...this.routeRuntime.platforms.map((platform) => ({ ...platform })));
    this.ladders.push(...this.routeRuntime.ladders.map((ladder) => ({ ...ladder })));
    const declared = this.routeRuntime.declaredHazards;
    for (const [index, hazard] of this.hazards.entries()) Object.assign(hazard, hazardContract(declared[index % declared.length], this.missionPlan.world.danger));
    this.hazards.push(...this.routeRuntime.hazards.map((hazard) => ({ ...hazard })));
    for (const [index, enemy] of this.enemies.filter((candidate) => !candidate.isBoss).entries()) {
      if (index % 3 !== 1 || !this.routeRuntime.platforms.length) continue;
      const platform = this.routeRuntime.platforms[(index * 5) % this.routeRuntime.platforms.length];
      enemy.x = clamp(platform.x + 24 + index % 3 * 42, 100, WORLD_WIDTH - enemy.w - 100);
      enemy.spawnX = enemy.x;
      enemy.groundY = platform.y;
      enemy.y = platform.y - enemy.h;
    }
  }

  configureVehicleRuntime() {
    if (!this.vehicle?.active) return;
    const profile = this.vehicleHandling;
    this.vehicle.mode = profile.locomotion;
    this.vehicle.family = profile.family;
    this.vehicle.vx = 0;
    this.vehicle.vy = 0;
    this.vehicle.groundY = this.vehicle.y;
    this.vehicle.flightCeiling = 170;
    this.vehicle.waterLine = FLOOR_Y - this.vehicle.h - 18;
    this.vehicle.depth = 0;
    const crew = [...(this.crewRuntime || [])];
    this.vehicle.seatAssignments = this.selectedVehicleRuntime.seats.map((seat, index) => {
      const preferred = crew.find((member) => !member.assignedSeat && (
        seat.role === 'driver' && ['pilot', 'vehicle'].includes(member.specialty) ||
        seat.role === 'gunner' && ['heavy', 'assault'].includes(member.specialty) ||
        seat.role === 'commander' && member.specialty === 'command'
      )) || crew.find((member) => !member.assignedSeat) || null;
      if (preferred) preferred.assignedSeat = seat.id;
      return { seatId: seat.id, role: seat.role, actions: [...seat.actions], operatorId: preferred?.id || null };
    });
    this.vehicle.crewHandlingBonus = this.vehicle.seatAssignments.some((seat) => seat.role === 'driver' && seat.operatorId) ? 1.08 : 1;
    this.vehicle.gunnerBonus = this.vehicle.seatAssignments.some((seat) => seat.role === 'gunner' && seat.operatorId) ? 1.15 : 1;
    if (profile.family === 'air' || profile.family === 'space') this.vehicle.y = FLOOR_Y - this.vehicle.h - 120;
    if (profile.family === 'maritime') this.vehicle.y = this.vehicle.waterLine;
  }

  update(delta) {
    super.update(delta);
    if (this.mission?.state !== 'active') return;
    this.updateEquipmentDeployments(delta);
    this.updateEnvironmentStatus(delta);
    this.refreshStealth(this.player);
  }

  updatePlayer(player, delta, controls) {
    const beforeX = player?.x || 0;
    super.updatePlayer(player, delta, controls);
    if (!player?.alive || player.inVehicle) return;
    const slow = this.environmentStatus && this.animationTime < this.environmentStatus.slowUntil ? this.environmentStatus.slowFactor : 1;
    const mobility = player === this.player ? this.costumeRuntime?.mobility || 1 : 1;
    const travelled = player.x - beforeX;
    player.x = clamp(beforeX + travelled * mobility * slow, 0, WORLD_WIDTH - player.w);
    player.vx *= mobility * slow;
    if (player === this.player) this.refreshStealth(player);
  }

  refreshStealth(actor = this.player) {
    if (!actor || !this.stealthRuntime) return null;
    const paletteLight = this.routeRuntime?.palette?.light ?? 0.55;
    const crouchFactor = actor.crouching ? 0.34 : 1;
    const coverFactor = actor.inCover ? 0.55 : 1;
    const movement = clamp(Math.abs(actor.vx || 0) / 245, 0, 1.5);
    const firing = this.animationTime < this.stealthRuntime.noiseBurstUntil || actor.actionClock > 0.08;
    const stealthFactor = 1 - (this.costumeRuntime?.stealth || 0) / 140;
    const illumination = clamp(paletteLight + this.stealthRuntime.lightBoost, 0.12, 1);
    const visibility = clamp((28 + illumination * 62) * crouchFactor * coverFactor * stealthFactor + (firing ? 34 : 0), 3, 100);
    const noise = clamp((8 + movement * 48) * (actor.crouching ? 0.25 : 1) + (firing ? 65 : 0), 0, 100);
    const detectionRadius = clamp(95 + visibility * 4.2 + noise * 2.5, 105, 920);
    Object.assign(this.stealthRuntime, { visibility, noise, ambientLight: illumination, detectionRadius });
    return { visibility, noise, detectionRadius };
  }

  fire(player) {
    const fired = super.fire(player);
    if (!fired || !this.stealthRuntime) return fired;
    if (player === this.player) {
      this.stealthRuntime.noiseBurstUntil = this.animationTime + 0.85;
      this.refreshStealth(player);
      if (this.fieldEffects?.weaponBoostShots > 0) this.fieldEffects.weaponBoostShots -= 1;
    }
    return fired;
  }

  updateEnemy(enemy, delta) {
    if (!enemy?.alive || !this.stealthRuntime) return super.updateEnemy(enemy, delta);
    const actors = [this.player, this.coopEnabled ? this.coop : null].filter((actor) => actor?.alive);
    const distance = actors.length ? Math.min(...actors.map((actor) => entityDistance(actor.inVehicle && this.vehicle?.active ? this.vehicle : actor, enemy))) : Infinity;
    const wasAlert = enemy.alert;
    const radius = this.stealthRuntime.detectionRadius * (enemy.isBoss ? 1.18 : enemy.behavior === 'stalker' ? 1.08 : 1);
    if (!wasAlert && distance <= radius) enemy.revealed = Math.max(enemy.revealed || 0, 0.12);
    if (enemy.jammedClock > 0) {
      enemy.jammedClock = Math.max(0, enemy.jammedClock - delta);
      enemy.alert = false;
      enemy.speed *= 0.985;
    }
    super.updateEnemy(enemy, delta);
    if (!wasAlert && enemy.alert && distance > radius && (enemy.revealed || 0) <= 0.01) enemy.alert = false;
    if (enemy.alert && distance > radius * 1.65 && (enemy.revealed || 0) <= 0.01) {
      enemy.searchClock = (enemy.searchClock || 0) + delta;
      if (enemy.searchClock >= 2.4) enemy.alert = false;
    } else enemy.searchClock = 0;
    if (!wasAlert && enemy.alert) {
      this.stealthRuntime.spottedBy.add(enemy.id);
      this.stealthRuntime.lastEvent = 'spotted';
      this.onEvent({ type: 'spotted', enemyId: enemy.id, radius: Math.round(radius), visibility: Math.round(this.stealthRuntime.visibility), noise: Math.round(this.stealthRuntime.noise) });
    } else if (wasAlert && !enemy.alert) {
      this.stealthRuntime.spottedBy.delete(enemy.id);
      this.stealthRuntime.lastEvent = 'lost';
      this.onEvent({ type: 'lost', enemyId: enemy.id, radius: Math.round(radius) });
    }
  }

  updateVehicleDriver(player, delta, controls) {
    if (!this.vehicle?.active || this.vehicle.destroyed) { player.inVehicle = false; return; }
    if (this.vehicle.driver !== player) {
      player.x = this.vehicle.x + 52;
      player.y = this.vehicle.y + 12;
      return;
    }
    const profile = this.vehicleHandling;
    if (!profile.canDrive) { this.vehicle.vx = 0; this.vehicle.vy = 0; return; }
    const left = this.keys.has(controls.left) || (!player.coop && this.keys.has('ArrowLeft'));
    const right = this.keys.has(controls.right) || (!player.coop && this.keys.has('ArrowRight'));
    const up = this.keys.has(controls.up) || (!player.coop && this.keys.has('ArrowUp'));
    const down = this.keys.has(controls.down) || (!player.coop && this.keys.has('ArrowDown'));
    const boostKey = this.keys.has(controls.jump) || (!player.coop && this.keys.has('Space'));
    const horizontal = Number(right) - Number(left);
    const vertical = Number(down) - Number(up);
    const fuelled = this.vehicle.fuel > 0;
    const boost = fuelled && profile.canBoost && (profile.altitudeControl ? boostKey : up);
    const maxSpeed = profile.maxSpeed * (boost ? 1.32 : 1) * (this.vehicle.crewHandlingBonus || 1);
    const previousX = this.vehicle.x;
    const previousY = this.vehicle.y;
    if (profile.family === 'space') {
      this.vehicle.vx += horizontal * maxSpeed * profile.acceleration * delta;
      this.vehicle.vy += vertical * maxSpeed * profile.acceleration * delta;
      const drag = Math.max(0, 1 - profile.drag * delta);
      if (!horizontal) this.vehicle.vx *= drag;
      if (!vertical) this.vehicle.vy *= drag;
      this.vehicle.vx = clamp(this.vehicle.vx, -maxSpeed, maxSpeed);
      this.vehicle.vy = clamp(this.vehicle.vy, -maxSpeed * 0.72, maxSpeed * 0.72);
    } else if (profile.family === 'air') {
      this.vehicle.vx += (horizontal * maxSpeed - this.vehicle.vx) * Math.min(1, profile.acceleration * delta);
      this.vehicle.vy += (vertical * maxSpeed * 0.62 - this.vehicle.vy) * Math.min(1, profile.acceleration * delta);
    } else if (profile.family === 'maritime') {
      this.vehicle.vx += (horizontal * maxSpeed - this.vehicle.vx) * Math.min(1, profile.acceleration * delta);
      this.vehicle.vy += (vertical * maxSpeed * 0.28 - this.vehicle.vy) * Math.min(1, profile.acceleration * delta);
      this.vehicle.depth = clamp(this.vehicle.depth + vertical * 55 * delta, 0, 145);
      this.vehicle.vy += (this.vehicle.waterLine + this.vehicle.depth - this.vehicle.y) * delta * 3;
    } else if (profile.family === 'exosuit') {
      this.vehicle.vx += (horizontal * maxSpeed - this.vehicle.vx) * Math.min(1, profile.acceleration * delta);
      const grounded = this.vehicle.y >= this.vehicle.groundY - 2;
      if ((up || boostKey) && grounded && fuelled) this.vehicle.vy = -470;
      this.vehicle.vy += 1450 * delta;
    } else {
      const braking = down;
      const target = braking ? 0 : horizontal * maxSpeed;
      this.vehicle.vx += (target - this.vehicle.vx) * Math.min(1, (braking ? profile.drag * 1.8 : profile.acceleration) * delta);
      this.vehicle.vy = 0;
      this.vehicle.y = this.vehicle.groundY;
    }
    this.vehicle.x = clamp(this.vehicle.x + this.vehicle.vx * delta, 0, WORLD_WIDTH - this.vehicle.w);
    if (profile.altitudeControl) this.vehicle.y = clamp(this.vehicle.y + this.vehicle.vy * delta, profile.family === 'maritime' ? FLOOR_Y - this.vehicle.h - 30 : this.vehicle.flightCeiling, this.vehicle.groundY);
    if (profile.family === 'exosuit' && this.vehicle.y >= this.vehicle.groundY) { this.vehicle.y = this.vehicle.groundY; this.vehicle.vy = 0; }
    if (profile.collision) this.resolveVehicleHorizontal(previousX);
    const moved = Math.abs(this.vehicle.x - previousX) + Math.abs(this.vehicle.y - previousY);
    if (moved > 0.25) this.vehicle.fuel = Math.max(0, this.vehicle.fuel - delta * profile.fuelRate * (boost ? 1.7 : 1));
    this.vehicle.ramClock = Math.max(0, this.vehicle.ramClock - delta);
    this.resolveVehicleImpacts(player);
    for (const rider of [this.player, this.coop]) {
      if (!rider?.inVehicle) continue;
      rider.x = this.vehicle.x + (rider === this.vehicle.driver ? 48 : 96);
      rider.y = this.vehicle.y + 10;
      rider.vx = this.vehicle.vx;
      rider.vy = this.vehicle.vy;
    }
  }

  resolveVehicleImpacts(player) {
    if (!this.vehicleHandling.canRam) return;
    if (this.vehicleHandling.collision) {
      for (const cover of this.covers) {
        if (!cover.destroyed && overlaps(this.vehicle, cover)) {
          cover.health = 0;
          cover.destroyed = true;
          this.onEvent({ type: 'cover-destroyed', coverId: cover.id, vehicleFamily: this.vehicleHandling.family });
        }
      }
    }
    const speed = Math.hypot(this.vehicle.vx || 0, this.vehicle.vy || 0);
    for (const enemy of this.enemies) {
      if (!enemy.alive || this.vehicle.ramClock > 0 || !overlaps(this.vehicle, enemy) || speed < 110) continue;
      const damage = this.vehicleHandling.family === 'exosuit' ? 125 : this.vehicleHandling.family === 'rail' ? 145 : 95;
      this.applyEnemyDamage(enemy, damage, { owner: player, kind: `${this.vehicleHandling.family}-impact` });
      this.damageVehicle(this.vehicleHandling.family === 'space' ? 14 : 8, 'impact');
      this.vehicle.ramClock = 0.35;
    }
  }

  weaponProfile(player) {
    const profile = super.weaponProfile(player);
    if (profile.mode === 'apc-turret') return { ...profile, damage: profile.damage * (this.vehicle?.gunnerBonus || 1) };
    if (player === this.player && this.fieldEffects?.weaponBoostShots > 0) return { ...profile, damage: profile.damage * 1.28, penetration: Math.min(100, (profile.penetration || 0) + 12) };
    return profile;
  }

  applyHazards(player) {
    if (!player?.alive || player.hazardClock > 0) return;
    const target = player.inVehicle && this.vehicle?.active ? this.vehicle : { x: player.x + 6, y: player.y + player.h - 14, w: player.w - 12, h: 14 };
    const hazard = this.hazards.find((candidate) => candidate.active && overlaps(target, candidate));
    if (!hazard) return;
    const contract = { ...hazardContract(hazard.kind, this.missionPlan.world.danger), ...hazard };
    const immuneVehicle = player.inVehicle && this.vehicleHandling.environmentalImmunity.includes(contract.kind);
    const costumeProtected = !player.inVehicle && this.costumeRuntime?.resistances.includes(contract.kind);
    const equipmentProtection = !player.inVehicle && this.fieldEffects.protection > 0;
    const reduction = immuneVehicle ? 0 : costumeProtected ? 0.35 : equipmentProtection ? 0.5 : 1;
    if (immuneVehicle) this.onEvent({ type: 'hazard-resisted', kind: contract.kind, source: 'vehicle', family: this.vehicleHandling.family });
    else if (player.inVehicle && contract.damage > 0) this.damageVehicle(contract.damage * reduction, contract.kind);
    else if (contract.damage > 0) this.damagePlayer(player, contract.damage * reduction, { bypassCover: true, source: contract.kind });
    if (reduction < 1 && !immuneVehicle) this.environmentStatus.protectedHits += 1;
    if (contract.armorDrain && !player.inVehicle) player.armor = Math.max(0, player.armor - contract.armorDrain * reduction);
    if (contract.oxygenDrain && !player.inVehicle) this.environmentStatus.oxygen = Math.max(0, this.environmentStatus.oxygen - contract.oxygenDrain * reduction);
    if (contract.trackerDrain) this.tracker.energy = Math.max(0, this.tracker.energy - contract.trackerDrain * reduction);
    if (contract.slow) { this.environmentStatus.slowUntil = this.animationTime + 1.25; this.environmentStatus.slowFactor = 1 - contract.slow; }
    const impulse = Math.max(0, Number(contract.impulse ?? contract.knockback) || 0);
    if (impulse && !player.inVehicle) player.vy = -impulse;
    if (contract.kind === 'electrical' && !player.inVehicle) {
      player.vx = 0;
      player.actionClock = Math.max(player.actionClock || 0, Number(contract.stun) || 0);
    }
    this.environmentStatus.lastHazard = contract.kind;
    player.hazardKind = contract.kind;
    player.hazardClock = Math.max(0.72, Number(contract.stun) || 0);
    this.onEvent({ type: 'hazard-effect', kind: contract.kind, effect: contract.effect, reduction, player: player.coop ? 'coop' : 'primary' });
  }

  updateEnvironmentStatus(delta) {
    if (!this.environmentStatus) return;
    if (this.environmentStatus.oxygen < this.environmentStatus.maxOxygen && this.environmentStatus.lastHazard !== 'vacuum') this.environmentStatus.oxygen = Math.min(this.environmentStatus.maxOxygen, this.environmentStatus.oxygen + delta * 2);
    if (this.environmentStatus.oxygen === 0 && this.player.alive && this.player.hazardClock <= 0) {
      this.damagePlayer(this.player, 8, { bypassCover: true, source: 'vacuum' });
      this.player.hazardClock = 0.72;
    }
  }

  useEquipment(equipmentId, actor = this.player) {
    const state = equipmentId ? this.equipmentActions.get(equipmentId) : [...this.equipmentActions.values()].find((item) => item.remaining > 0);
    if (!state || state.remaining <= 0 || !actor?.alive || this.mission?.state !== 'active') return false;
    const magnitude = state.magnitude;
    let result = state.action;
    if (state.action === 'motion-pulse' || state.action === 'deep-scan' || state.action === 'drone-recon') {
      this.tracker.energy = Math.min(100, this.tracker.energy + magnitude);
      this.tracker.contacts = this.enemies.filter((enemy) => enemy.alive).slice(0, 12).map((enemy) => ({ id: enemy.id, x: enemy.x, y: enemy.y, distance: Math.round(entityDistance(actor, enemy)) }));
      for (const enemy of this.enemies.filter((enemy) => enemy.alive)) enemy.revealed = Math.max(enemy.revealed, state.action === 'drone-recon' ? 12 : 7);
      this.fieldEffects.scans += 1;
    } else if (state.action === 'access-bypass') {
      const door = this.doors.find((candidate) => !candidate.open);
      if (door) { door.open = true; door.lockedBy = null; result = `door:${door.id}`; } else this.inventory.securityKeys += 1;
    } else if (state.action === 'field-repair' || state.action === 'synthetic-repair') {
      if (this.vehicle?.active && this.vehicle.hull < this.vehicle.maxHull) this.vehicle.hull = Math.min(this.vehicle.maxHull, this.vehicle.hull + magnitude);
      else actor.armor = Math.min(actor.maxArmor, actor.armor + magnitude);
      if (state.action === 'synthetic-repair' && this.coop?.alive) this.coop.health = Math.min(this.coop.maxHealth, this.coop.health + magnitude);
      this.fieldEffects.repairs += 1;
    } else if (state.action === 'breach') {
      const wall = this.walls.find((candidate) => !candidate.destroyed);
      if (wall) wall.destroyed = true;
      else { this.inventory.cutter = true; const door = this.doors.find((candidate) => !candidate.open); if (door) door.open = true; }
      this.fieldEffects.breaches += 1;
    } else if (state.action === 'illumination') {
      this.stealthRuntime.lightBoost = this.stealthRuntime.lightBoost > 0 ? 0 : 0.38;
      this.fieldEffects.illumination += 1;
    } else if (state.action === 'medical') {
      actor.health = Math.min(actor.maxHealth, actor.health + magnitude);
      actor.downed = false;
    } else if (state.action === 'oxygen-reserve') {
      this.environmentStatus.oxygen = Math.min(this.environmentStatus.maxOxygen, this.environmentStatus.oxygen + magnitude * 2);
    } else if (state.action === 'protective-layer') {
      actor.armor = Math.min(actor.maxArmor, actor.armor + magnitude);
      this.fieldEffects.protection += magnitude;
    } else if (state.action === 'power-transfer') {
      this.tracker.energy = 100;
      if (this.vehicle?.active) this.vehicle.fuel = Math.min(100, this.vehicle.fuel + magnitude);
      if (this.powerNode) this.powerNode.active = true;
    } else if (state.action === 'neuro-stabilize') {
      if (this.neuro?.active) { this.neuro.signal = Math.min(100, this.neuro.signal + magnitude * 2); this.neuro.state = 'linked'; }
      else this.tracker.energy = Math.min(100, this.tracker.energy + magnitude);
    } else if (state.action === 'ammo-resupply') {
      actor.ammoReserve += magnitude * 2;
    } else if (state.action === 'signal-jam') {
      this.fieldEffects.jammerUntil = this.animationTime + 4 + magnitude / 10;
      for (const enemy of this.enemies.filter((enemy) => enemy.alive)) { enemy.jammedClock = 4; enemy.alert = false; }
    } else if (state.action === 'incendiary-load') {
      this.fieldEffects.weaponBoostShots += Math.max(2, Math.floor(magnitude / 5));
    } else if (state.action === 'live-restraint') {
      const target = this.enemies.filter((enemy) => enemy.alive).sort((a, b) => entityDistance(actor, a) - entityDistance(actor, b))[0];
      if (target) { target.speed *= 0.55; target.restrainedClock = 8; }
      this.fieldEffects.restraints += 1;
    } else if (state.action === 'checkpoint-beacon') {
      this.setCheckpoint(`beacon-${state.uses + 1}`, actor.x, actor.y);
    } else if (state.action === 'deploy-sentry') {
      this.supportDeployments.push({ id: `${state.id}:${state.uses + 1}`, kind: 'sentry', x: actor.x + actor.facing * 60, y: actor.y + actor.h - 42, w: 38, h: 42, ammo: 12 + Math.floor(magnitude / 2), damage: 8 + magnitude * 0.45, range: 620, cooldown: 0 });
    } else if (state.action === 'cryo-trap' || state.action === 'shock-trap') {
      this.supportDeployments.push({ id: `${state.id}:${state.uses + 1}`, kind: state.action, x: actor.x + actor.facing * 70, y: actor.y + actor.h - 18, w: 58, h: 18, damage: state.action === 'shock-trap' ? magnitude : 0, slow: state.action === 'cryo-trap' ? 0.38 : 0.65, armed: true });
    } else if (state.action === 'containment-field') {
      this.supportDeployments.push({ id: `${state.id}:${state.uses + 1}`, kind: 'containment', x: actor.x - 70, y: actor.y - 30, w: 180, h: actor.h + 60, duration: 8 + magnitude / 4 });
      this.fieldEffects.containment += 1;
    } else {
      actor.armor = Math.min(actor.maxArmor, actor.armor + Math.max(1, magnitude / 2));
    }
    state.remaining -= 1;
    state.uses += 1;
    state.lastResult = result;
    const log = { equipmentId: state.id, action: state.action, result, remaining: state.remaining, at: Math.round(this.mission.elapsed * 10) / 10 };
    this.equipmentUseLog.push(log);
    this.onEvent({ type: 'equipment-used', ...log });
    return true;
  }

  updateEquipmentDeployments(delta) {
    for (const deployment of this.supportDeployments) {
      if (deployment.kind === 'sentry') {
        deployment.cooldown = Math.max(0, deployment.cooldown - delta);
        const target = this.enemies.filter((enemy) => enemy.alive && Math.abs(enemy.x - deployment.x) <= deployment.range).sort((a, b) => Math.abs(a.x - deployment.x) - Math.abs(b.x - deployment.x))[0];
        if (target && deployment.ammo > 0 && deployment.cooldown === 0) {
          this.applyEnemyDamage(target, deployment.damage, { owner: this.player, kind: 'portable-sentry' });
          deployment.ammo -= 1;
          deployment.cooldown = 0.32;
        }
      } else if (deployment.kind === 'containment') {
        deployment.duration -= delta;
        for (const enemy of this.enemies.filter((candidate) => candidate.alive && overlaps(candidate, deployment))) enemy.speed *= 0.99;
      } else if (deployment.armed) {
        const target = this.enemies.find((enemy) => enemy.alive && overlaps(enemy, deployment));
        if (target) {
          if (deployment.damage) this.applyEnemyDamage(target, deployment.damage, { owner: this.player, kind: deployment.kind });
          target.speed *= deployment.slow;
          target.staggerClock = 1.5;
          deployment.armed = false;
        }
      }
    }
    this.supportDeployments = this.supportDeployments.filter((deployment) => deployment.kind !== 'containment' || deployment.duration > 0);
  }

  damagePlayer(player, amount, options = {}) {
    if (player === this.player && this.costumeRuntime?.resistances.includes(options.source)) amount *= 0.7;
    return super.damagePlayer(player, amount, options);
  }

  drawBackdrop(ctx) {
    super.drawBackdrop(ctx);
    if (!this.routeRuntime?.palette) return;
    const palette = this.routeRuntime.palette;
    ctx.save();
    const tint = ctx.createLinearGradient(0, 0, 0, 720);
    tint.addColorStop(0, `${palette.sky}b8`);
    tint.addColorStop(0.65, `${palette.haze}34`);
    tint.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, 1280, 720);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = palette.accent;
    for (let index = 0; index < 18; index += 1) {
      const x = (index * 181 - this.camera.x * (0.12 + index % 3 * 0.04)) % 1450;
      const height = 40 + (index * 47) % 170;
      ctx.fillRect(x, 600 - height, 28 + index % 4 * 16, height);
    }
    ctx.restore();
  }

  drawWorld(ctx) {
    super.drawWorld(ctx);
    if (!this.routeRuntime) return;
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.font = 'bold 10px monospace';
    for (const node of this.routeRuntime.routeNodes.filter((entry, index) => index % 3 === 0)) {
      ctx.fillStyle = this.routeRuntime.palette.accent;
      ctx.fillRect(node.x - 2, node.y - 24, 4, 24);
      ctx.fillText(`R${node.route}`, node.x + 7, node.y - 10);
    }
    for (const deployment of this.supportDeployments) {
      ctx.strokeStyle = deployment.kind === 'sentry' ? '#8bbfc0' : deployment.kind === 'containment' ? '#8d79c9' : '#8fbad6';
      ctx.strokeRect(deployment.x, deployment.y, deployment.w, deployment.h);
    }
    ctx.restore();
  }

  drawActor(ctx, actor) {
    super.drawActor(ctx, actor);
    if (actor !== this.player || !this.costumeRuntime?.active || actor.inVehicle) return;
    ctx.save();
    ctx.fillStyle = this.costumeRuntime.visual.primary;
    ctx.fillRect(actor.x + actor.w * 0.18, actor.y + actor.h * 0.42, actor.w * 0.64, 8);
    ctx.fillStyle = this.costumeRuntime.visual.accent;
    ctx.fillRect(actor.x + (actor.facing > 0 ? actor.w * 0.68 : actor.w * 0.18), actor.y + actor.h * 0.22, 6, 14);
    ctx.restore();
  }

  drawVehicle(ctx) {
    if (!this.vehicle?.active || this.vehicleHandling?.family === 'ground') return super.drawVehicle(ctx);
    const vehicle = this.vehicle;
    const profile = this.vehicleHandling;
    ctx.save();
    ctx.translate(vehicle.x, vehicle.y);
    ctx.fillStyle = vehicle.destroyed ? '#342b29' : '#536d68';
    ctx.strokeStyle = '#a7c5b7';
    ctx.lineWidth = 3;
    if (profile.family === 'air' || profile.family === 'space') {
      ctx.beginPath();
      ctx.moveTo(8, vehicle.h * 0.58); ctx.lineTo(vehicle.w * 0.28, 12); ctx.lineTo(vehicle.w * 0.78, 18); ctx.lineTo(vehicle.w - 5, vehicle.h * 0.58); ctx.lineTo(vehicle.w * 0.67, vehicle.h - 12); ctx.lineTo(vehicle.w * 0.2, vehicle.h - 8); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = profile.family === 'space' ? '#7398d1' : '#d58250';
      ctx.fillRect(vehicle.w * 0.32, 28, vehicle.w * 0.36, 12);
    } else if (profile.family === 'maritime') {
      ctx.beginPath(); ctx.moveTo(2, 42); ctx.lineTo(vehicle.w - 4, 34); ctx.lineTo(vehicle.w * 0.8, vehicle.h - 12); ctx.lineTo(vehicle.w * 0.18, vehicle.h - 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#418a9d'; ctx.fillRect(vehicle.w * 0.34, 15, vehicle.w * 0.32, 24);
    } else if (profile.family === 'rail') {
      ctx.fillRect(2, 14, vehicle.w - 4, vehicle.h - 30); ctx.strokeRect(2, 14, vehicle.w - 4, vehicle.h - 30);
      ctx.fillStyle = '#9dbbb4'; for (let x = 18; x < vehicle.w - 26; x += 42) ctx.fillRect(x, 28, 25, 22);
      ctx.fillStyle = '#202a29'; ctx.fillRect(0, vehicle.h - 18, vehicle.w, 12);
    } else {
      ctx.fillRect(vehicle.w * 0.32, 10, vehicle.w * 0.36, 50); ctx.strokeRect(vehicle.w * 0.32, 10, vehicle.w * 0.36, 50);
      ctx.fillRect(25, 53, 46, 16); ctx.fillRect(vehicle.w - 71, 53, 46, 16);
      ctx.fillRect(42, 66, 25, vehicle.h - 66); ctx.fillRect(vehicle.w - 67, 66, 25, vehicle.h - 66);
    }
    if (vehicle.occupied && vehicle.fuel > 0) {
      ctx.fillStyle = '#d88c55';
      ctx.fillRect(profile.family === 'space' || profile.family === 'air' ? 2 : vehicle.w * 0.45, vehicle.h - 10, profile.family === 'space' || profile.family === 'air' ? 18 : 24, 7);
    }
    ctx.restore();
  }

  getInteractionPrompt(actor = this.player) {
    if (this.vehicle?.active && !this.vehicle.destroyed && entityDistance(actor, this.vehicle) < 210) return actor.inVehicle ? `V  QUITTER ${this.selectedVehicleRuntime.name}` : `V  PILOTER ${this.selectedVehicleRuntime.name} · ${this.vehicleHandling.locomotion.toUpperCase()}`;
    return super.getInteractionPrompt(actor);
  }

  getGameplayReport() {
    const report = super.getGameplayReport();
    return {
      ...report,
      finalRuntime: {
        levelGeometry: Boolean(this.routeRuntime),
        distinctVehicleFamily: this.vehicleHandling?.family || null,
        equipmentActions: this.equipmentActions?.size || 0,
        costume: this.costumeRuntime?.id || null,
        dynamicStealth: true,
        apexEligibility: this.apexEligibility?.reason || 'no-dossier'
      }
    };
  }

  getSnapshot() {
    const snapshot = super.getSnapshot();
    return {
      ...snapshot,
      routeRuntime: this.routeRuntime ? {
        signature: this.routeRuntime.signature,
        source: this.routeRuntime.source,
        dimensions: [this.routeRuntime.widthCells, this.routeRuntime.heightCells],
        meters: [this.routeRuntime.horizontalMeters, this.routeRuntime.verticalMeters],
        routes: this.routeRuntime.routes,
        maxTier: this.routeRuntime.maxTier,
        generatedPlatforms: this.routeRuntime.platforms.length,
        generatedLadders: this.routeRuntime.ladders.length,
        declaredHazards: [...this.routeRuntime.declaredHazards],
        generatedHazards: this.routeRuntime.hazards.length,
        biome: this.routeRuntime.palette.id,
        palette: { ...this.routeRuntime.palette }
      } : null,
      vehicleHandling: this.vehicleHandling ? {
        family: this.vehicleHandling.family,
        locomotion: this.vehicleHandling.locomotion,
        axes: [...this.vehicleHandling.axes],
        maxSpeed: this.vehicleHandling.maxSpeed,
        canBoost: this.vehicleHandling.canBoost,
        canFire: this.vehicleHandling.canFire,
        altitude: this.vehicle ? Math.round(FLOOR_Y - this.vehicle.y) : 0,
        depth: this.vehicle ? Math.round(this.vehicle.depth || 0) : 0,
        seats: this.vehicle?.seatAssignments?.map((seat) => ({ ...seat, actions: [...seat.actions] })) || []
      } : null,
      equipmentRuntime: this.equipmentActions ? [...this.equipmentActions.values()].map((item) => ({ id: item.id, name: item.name, utility: item.utility, action: item.action, remaining: item.remaining, maxCharges: item.maxCharges, uses: item.uses, magnitude: item.magnitude, provenance: item.provenance })) : [],
      equipmentDeployments: this.supportDeployments?.map((deployment) => ({ id: deployment.id, kind: deployment.kind, ammo: deployment.ammo ?? null, armed: deployment.armed ?? null })) || [],
      fieldEffects: this.fieldEffects ? { ...this.fieldEffects } : null,
      environmentStatus: this.environmentStatus ? { ...this.environmentStatus } : null,
      costumeRuntime: this.costumeRuntime ? { ...this.costumeRuntime, visual: { ...this.costumeRuntime.visual }, resistances: [...this.costumeRuntime.resistances] } : null,
      stealth: this.stealthRuntime ? { visibility: Math.round(this.stealthRuntime.visibility), noise: Math.round(this.stealthRuntime.noise), ambientLight: this.stealthRuntime.ambientLight, detectionRadius: Math.round(this.stealthRuntime.detectionRadius), spottedBy: [...this.stealthRuntime.spottedBy], lastEvent: this.stealthRuntime.lastEvent } : null,
      apexEligibility: this.apexEligibility ? { ...this.apexEligibility, checks: this.apexEligibility.checks.map((check) => ({ ...check, expected: Array.isArray(check.expected) ? [...check.expected] : check.expected })) } : null
    };
  }
}
