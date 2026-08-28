import {
  HubGame as HubGameV50,
  HUB_DECKS,
  HUB_MODULAR_ASSETS as HUB_MODULAR_ASSETS_V50,
  HUB_MODULAR_PROP_FILES,
  HUB_ROOM_PROFILES,
  HUB_ROOM_COUNT,
  getHubDoorBounds,
  HUB_WORLD
} from './hub-game.js';
import { DROPSHIP_HANGAR_ART_V55 } from './hub-art-runtime-v55.js';

export const HUB_TRAVERSAL_ART_FILES = Object.freeze({
  catwalk: '/assets/openai/metroidvania/props/overhead-catwalk.png',
  drop: '/assets/openai/metroidvania/props/drop-platform.png',
  ledge: '/assets/openai/metroidvania/props/short-ledge.png',
  ladder: '/assets/openai/metroidvania/props/wall-ladder.png',
  vent: '/assets/openai/metroidvania/props/vent-entrance.png',
  maintenancePipe: '/assets/openai/metroidvania/props/maintenance-pipe.png',
  ceilingCables: '/assets/openai/metroidvania/props/ceiling-cables.png',
  foregroundPipes: '/assets/openai/metroidvania/props/foreground-pipes.png'
});

export const HUB_MODULAR_ASSETS = Object.freeze([...new Set([
  ...HUB_MODULAR_ASSETS_V50,
  ...Object.values(HUB_TRAVERSAL_ART_FILES)
])]);

export { HUB_DECKS, HUB_MODULAR_PROP_FILES, HUB_ROOM_PROFILES, HUB_ROOM_COUNT, HUB_WORLD, getHubDoorBounds };

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const PLAYER_HEIGHT = 92;
const GRAVITY = 1900;
const SUPPORTED_SHIP_TILES = new Set([
  'floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift',
  'spawn', 'objective', 'enemy', 'terminal', 'hazard'
]);
const CRISIS_SPRITES = Object.freeze({
  xenomorph: '/assets/openai/sprites/normalized/enemies/xenomorph-drone-combat-sheet.png',
  synthetic: '/assets/openai/sprites/normalized/enemies/working-joe-combat-sheet.png',
  pathogen: '/assets/openai/sprites/normalized/enemies/neomorph-locomotion-sheet.png'
});
export const HUB_CRISIS_SOURCE_FACING = Object.freeze({
  xenomorph: -1,
  synthetic: 1,
  pathogen: 1
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const imageReady = (image) => Boolean(image?.complete && image.naturalWidth);

function createImage(source) {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  return image;
}

function parsePosition(position) {
  if (Array.isArray(position) && position.length >= 2) return position.slice(0, 2).map(Number);
  if (typeof position !== 'string') return null;
  const parts = position.split(':').map(Number);
  return parts.length === 2 && parts.every(Number.isFinite) ? parts : null;
}

function verticalRuns(tiles, type, cellWidth, cellHeight) {
  const columns = new Map();
  for (const tile of tiles.filter((entry) => entry.type === type)) {
    if (!columns.has(tile.col)) columns.set(tile.col, []);
    columns.get(tile.col).push(tile.row);
  }
  const runs = [];
  for (const [col, rows] of columns) {
    rows.sort((a, b) => a - b);
    let start = rows[0];
    let end = rows[0];
    const flush = () => {
      if (!Number.isFinite(start)) return;
      runs.push({
        x: col * cellWidth + cellWidth / 2,
        top: start * cellHeight,
        bottom: (end + 1) * cellHeight,
        w: type === 'lift' ? Math.min(82, cellWidth * 0.66) : Math.min(54, cellWidth * 0.46),
        type
      });
    };
    for (const row of rows.slice(1)) {
      if (row === end + 1) end = row;
      else { flush(); start = row; end = row; }
    }
    flush();
  }
  return runs;
}

/**
 * Compile le format grille de Frontier Forge en géométrie de hub directement
 * consommable. La fonction est pure pour pouvoir valider un plan avant playtest.
 */
export function compileShipProject(project) {
  if (!project || project.kind !== 'ship' || !Array.isArray(project.tiles)) return null;
  const rawSize = Array.isArray(project.size) ? project.size : [32, 18];
  const cols = clamp(Math.floor(Number(rawSize[0])) || 32, 4, 128);
  const rows = clamp(Math.floor(Number(rawSize[1])) || 18, 4, 72);
  const cellWidth = HUB_WORLD.width / cols;
  const cellHeight = VIEW_HEIGHT / rows;
  const tiles = project.tiles.flatMap((tile, index) => {
    const position = parsePosition(tile?.position);
    const type = String(tile?.type || '').toLowerCase();
    if (!position || !SUPPORTED_SHIP_TILES.has(type)) return [];
    const [col, row] = position.map(Math.floor);
    if (col < 0 || col >= cols || row < 0 || row >= rows) return [];
    return [{ ...tile, index, type, col, row }];
  });
  const byType = (type) => tiles.filter((tile) => tile.type === type);
  const rect = (tile, height = cellHeight, yOffset = 0) => ({
    x: tile.col * cellWidth,
    y: tile.row * cellHeight + yOffset,
    w: cellWidth,
    h: height,
    type: tile.type,
    tile: `${tile.col}:${tile.row}`
  });
  const floors = byType('floor').map((tile) => rect(tile));
  const platforms = byType('platform').map((tile, index) => ({
    ...rect(tile, Math.max(14, cellHeight * 0.28)),
    art: index % 2 ? 'drop' : 'catwalk'
  }));
  const walls = byType('wall').map((tile) => rect(tile));
  const doors = byType('door').map((tile, index) => {
    const height = Math.max(116, cellHeight * 2.5);
    return {
      id: `editor-door-${index + 1}`,
      x: tile.col * cellWidth + cellWidth / 2 - Math.min(34, cellWidth * 0.22),
      y: (tile.row + 1) * cellHeight - height,
      w: Math.min(68, cellWidth * 0.44), h: height, open: false, progress: 0
    };
  });
  const vents = byType('vent').map((tile, index) => ({
    id: `editor-vent-${index + 1}`,
    x: tile.col * cellWidth,
    y: tile.row * cellHeight + cellHeight * 0.36,
    w: cellWidth,
    h: cellHeight * 0.64,
    type: 'vent'
  }));
  const ladders = verticalRuns(tiles, 'ladder', cellWidth, cellHeight);
  const lifts = verticalRuns(tiles, 'lift', cellWidth, cellHeight);
  const spawnTile = byType('spawn')[0];
  const fallbackFloor = floors.slice().sort((a, b) => a.y - b.y)[0];
  const spawn = spawnTile ? {
    x: spawnTile.col * cellWidth + cellWidth / 2 - 22,
    y: (spawnTile.row + 1) * cellHeight - PLAYER_HEIGHT
  } : fallbackFloor ? { x: fallbackFloor.x + 40, y: fallbackFloor.y - PLAYER_HEIGHT } : null;
  const objectives = byType('objective').map((tile, index) => ({
    id: `editor-objective-${index + 1}`,
    x: tile.col * cellWidth + cellWidth * 0.25,
    y: tile.row * cellHeight,
    w: cellWidth * 0.5,
    h: cellHeight,
    complete: false
  }));
  const enemyKinds = ['xenomorph', 'synthetic', 'pathogen'];
  const enemies = byType('enemy').map((tile, index) => {
    const requested = String(tile.enemyType || tile.variant || '').toLowerCase();
    const kind = enemyKinds.includes(requested) ? requested : enemyKinds[index % enemyKinds.length];
    const dimensions = kind === 'synthetic' ? [42, 88] : kind === 'pathogen' ? [50, 72] : [52, 76];
    return {
      id: `editor-enemy-${index + 1}`, kind,
      x: tile.col * cellWidth + cellWidth / 2 - dimensions[0] / 2,
      y: (tile.row + 1) * cellHeight - dimensions[1],
      w: dimensions[0], h: dimensions[1]
    };
  });
  const terminals = byType('terminal').map((tile, index) => ({
    id: `editor-terminal-${index + 1}`,
    x: tile.col * cellWidth + cellWidth * 0.2,
    y: tile.row * cellHeight,
    w: cellWidth * 0.6,
    h: cellHeight,
    activated: false
  }));
  const hazards = byType('hazard').map((tile, index) => ({
    id: `editor-hazard-${index + 1}`,
    x: tile.col * cellWidth,
    y: tile.row * cellHeight + cellHeight * 0.58,
    w: cellWidth,
    h: cellHeight * 0.42,
    damage: 12
  }));
  const floorY = floors.length ? Math.min(...floors.map((floor) => floor.y)) : HUB_WORLD.floorY;
  return {
    schema: 1,
    source: 'frontier-forge',
    editorPlaytest: true,
    grid: { cols, rows, cellWidth, cellHeight },
    floors, platforms, walls, doors, vents, ladders, lifts, spawn,
    objectives, enemies, terminals, hazards, floorY,
    route: {
      id: 'editor-ship-route', source: 'editor',
      nodeCount: floors.length + platforms.length + objectives.length + terminals.length,
      verticalLinks: ladders.length + lifts.length,
      crawlLinks: vents.length,
      doorCount: doors.length,
      objectiveCount: objectives.length,
      hazardCount: hazards.length
    }
  };
}

const platform = (id, x, y, w, art) => Object.freeze({ id, x, y, w, h: 20, type: 'platform', art });
const ladder = (id, x, top, bottom, w = 52) => Object.freeze({ id, x, top, bottom, w, type: 'ladder' });
const vent = (id, x, y, w = 132, h = 58) => Object.freeze({ id, x, y, w, h, type: 'vent', art: 'vent' });
const occluder = (id, art, x, y, w, h, alpha = 0.42, phase = 'front') => Object.freeze({
  id, art, x, y, w, h, alpha, phase, collidable: false, type: 'occluder'
});
const traversalProfile = (archetype, platforms, ladders, vents, occluders = []) => Object.freeze({
  archetype,
  platforms: Object.freeze(platforms),
  ladders: Object.freeze(ladders),
  vents: Object.freeze(vents),
  occluders: Object.freeze(occluders)
});

export const HUB_TRAVERSAL_PROFILES_V60 = Object.freeze({
  bridge: traversalProfile('command-gantry',
    [platform('bridge-low', 100, 506, 500, 'catwalk'), platform('bridge-high', 550, 382, 500, 'ledge')],
    [ladder('bridge-floor', 180, 506, 624), ladder('bridge-tier', 590, 382, 506)],
    [vent('bridge-vent', 914, 324)],
    [occluder('bridge-cables', 'ceilingCables', 60, -12, 520, 126, 0.44)]),
  briefing: traversalProfile('command-amphitheatre',
    [platform('briefing-low', 250, 496, 510, 'ledge'), platform('briefing-high', 110, 378, 450, 'catwalk'), platform('briefing-side', 790, 430, 160, 'drop')],
    [ladder('briefing-floor', 330, 496, 624), ladder('briefing-tier', 520, 378, 496), ladder('briefing-side-link', 850, 430, 624, 46)],
    [vent('briefing-vent', 126, 320)],
    [occluder('briefing-pipe', 'maintenancePipe', 810, 182, 184, 250, 0.5)]),
  'combat-information': traversalProfile('command-data-spine',
    [platform('cic-low', 650, 494, 450, 'catwalk'), platform('cic-high', 280, 374, 520, 'drop'), platform('cic-side', 120, 506, 170, 'ledge')],
    [ladder('cic-floor', 1010, 494, 624), ladder('cic-tier', 720, 374, 494), ladder('cic-side-link', 200, 506, 624, 46)],
    [vent('cic-upper-vent', 298, 316), vent('cic-service-vent', 850, 436, 120, 58)],
    [occluder('cic-cables', 'ceilingCables', 650, -8, 420, 118, 0.4)]),
  'cryo-bay': traversalProfile('command-cryo-service',
    [platform('cryo-low', 160, 500, 480, 'ledge'), platform('cryo-high', 620, 386, 300, 'drop')],
    [ladder('cryo-floor', 260, 500, 624), ladder('cryo-tier', 630, 386, 500)],
    [vent('cryo-vent', 780, 328)],
    [occluder('cryo-foreground', 'foregroundPipes', 10, 506, 260, 190, 0.28)]),
  'crew-quarters': traversalProfile('habitat-bunk-stacks',
    [platform('quarters-low', 110, 500, 520, 'ledge'), platform('quarters-high', 580, 390, 360, 'catwalk'), platform('quarters-side', 970, 470, 180, 'drop')],
    [ladder('quarters-floor', 210, 500, 624), ladder('quarters-tier', 610, 390, 500), ladder('quarters-side-link', 1050, 470, 624, 46)],
    [vent('quarters-vent', 888, 332)],
    [occluder('quarters-pipes', 'maintenancePipe', 860, 188, 168, 230, 0.42)]),
  mess: traversalProfile('habitat-galley-loop',
    [platform('mess-low', 390, 492, 500, 'catwalk'), platform('mess-high', 120, 376, 430, 'ledge')],
    [ladder('mess-floor', 820, 492, 624), ladder('mess-tier', 430, 376, 492)],
    [vent('mess-vent', 136, 318)],
    [occluder('mess-cables', 'ceilingCables', 120, -10, 380, 116, 0.34)]),
  medical: traversalProfile('habitat-clinical-service',
    [platform('medical-low', 160, 502, 500, 'ledge'), platform('medical-high', 650, 388, 300, 'drop')],
    [ladder('medical-floor', 260, 502, 624), ladder('medical-tier', 655, 388, 502)],
    [vent('medical-vent', 810, 330)],
    [occluder('medical-pipe', 'maintenancePipe', 910, 190, 150, 220, 0.36)]),
  'science-lab': traversalProfile('habitat-lab-bridge',
    [platform('lab-low', 580, 498, 330, 'catwalk'), platform('lab-high', 190, 380, 470, 'ledge')],
    [ladder('lab-floor', 850, 498, 624), ladder('lab-tier', 620, 380, 498)],
    [vent('lab-vent', 206, 322)],
    [occluder('lab-cables', 'ceilingCables', 560, -12, 350, 116, 0.36)]),
  quarantine: traversalProfile('industrial-decon-frame',
    [platform('quarantine-low', 120, 500, 520, 'ledge'), platform('quarantine-high', 570, 382, 480, 'drop')],
    [ladder('quarantine-floor', 220, 500, 624), ladder('quarantine-tier', 600, 382, 500)],
    [vent('quarantine-vent', 916, 324)],
    [occluder('quarantine-pipes', 'foregroundPipes', 0, 512, 300, 184, 0.3)]),
  armory: traversalProfile('industrial-secure-rack',
    [platform('armory-low', 520, 490, 380, 'catwalk'), platform('armory-high', 160, 374, 440, 'ledge')],
    [ladder('armory-floor', 800, 490, 624), ladder('armory-tier', 560, 374, 490)],
    [vent('armory-vent', 176, 316)],
    [occluder('armory-pipe', 'maintenancePipe', 720, 174, 180, 248, 0.46)]),
  workshop: traversalProfile('industrial-fabrication',
    [platform('workshop-low', 160, 500, 530, 'ledge'), platform('workshop-high', 650, 384, 440, 'catwalk')],
    [ladder('workshop-floor', 250, 500, 624), ladder('workshop-tier', 680, 384, 500)],
    [vent('workshop-vent', 932, 326)],
    [occluder('workshop-cables', 'ceilingCables', 90, -10, 430, 124, 0.44), occluder('workshop-pipes', 'foregroundPipes', 920, 510, 280, 188, 0.26)]),
  'vehicle-bay': traversalProfile('industrial-service-split',
    [platform('vehicle-service', 700, 466, 250, 'drop'), platform('vehicle-observation', 90, 370, 230, 'ledge')],
    [ladder('vehicle-service-link', 900, 466, 624), ladder('vehicle-observation-link', 180, 370, 624, 46)],
    [vent('vehicle-vent', 110, 312)],
    [occluder('vehicle-cables', 'ceilingCables', 710, -8, 390, 118, 0.38)]),
  'dropship-hangar': traversalProfile('engineering-flightline',
    [platform('hangar-observation', 70, 360, 260, 'catwalk')],
    [ladder('hangar-observation-link', 160, 360, 624, 48)],
    [vent('hangar-vent', 90, 302)],
    [occluder('hangar-cables', 'ceilingCables', 40, -16, 420, 124, 0.38)]),
  reactor: traversalProfile('engineering-reactor-ring',
    [platform('reactor-low', 500, 492, 380, 'drop'), platform('reactor-high', 130, 372, 420, 'catwalk')],
    [ladder('reactor-floor', 760, 492, 624), ladder('reactor-tier', 540, 372, 492)],
    [vent('reactor-vent', 146, 314)],
    [occluder('reactor-pipes', 'foregroundPipes', 0, 500, 270, 198, 0.32)]),
  'life-support': traversalProfile('engineering-filtration-stack',
    [platform('life-low', 150, 500, 500, 'ledge'), platform('life-high', 620, 386, 350, 'catwalk'), platform('life-side', 990, 470, 160, 'drop')],
    [ladder('life-floor', 250, 500, 624), ladder('life-tier', 640, 386, 500), ladder('life-side-link', 1060, 470, 624, 46)],
    [vent('life-upper-vent', 810, 328), vent('life-side-vent', 1010, 412, 120, 58)],
    [occluder('life-pipes', 'foregroundPipes', 0, 506, 320, 192, 0.34)]),
  'sensor-array': traversalProfile('engineering-sensor-spine',
    [platform('sensor-low', 590, 494, 330, 'catwalk'), platform('sensor-high', 160, 376, 470, 'ledge')],
    [ladder('sensor-floor', 850, 494, 624), ladder('sensor-tier', 620, 376, 494)],
    [vent('sensor-vent', 176, 318)],
    [occluder('sensor-cables', 'ceilingCables', 580, -10, 350, 118, 0.42)] )
});

function fallbackTraversal(deck) {
  const platforms = [];
  const ladders = [];
  const vents = [];
  const occluders = [];
  const archetypes = [];
  for (let room = 0; room < 4; room += 1) {
    const start = room * HUB_WORLD.roomWidth;
    const roomId = HUB_DECKS[deck]?.rooms[room]?.id || `room-${room + 1}`;
    const profile = HUB_TRAVERSAL_PROFILES_V60[roomId] || HUB_TRAVERSAL_PROFILES_V60.bridge;
    archetypes.push(profile.archetype);
    platforms.push(...profile.platforms.map((entry) => ({ ...entry, x: start + entry.x, roomId, archetype: profile.archetype })));
    ladders.push(...profile.ladders.map((entry) => ({ ...entry, x: start + entry.x, roomId, archetype: profile.archetype })));
    vents.push(...profile.vents.map((entry) => ({ ...entry, x: start + entry.x, roomId, archetype: profile.archetype })));
    occluders.push(...profile.occluders.map((entry) => ({ ...entry, x: start + entry.x, roomId, archetype: profile.archetype })));
  }
  return {
    platforms, ladders, vents, occluders, archetypes,
    route: {
      id: `deck-${deck + 1}-vertical-route`, source: 'authored-v60',
      nodeCount: platforms.length + 4,
      verticalLinks: ladders.length,
      crawlLinks: vents.length,
      doorCount: 5,
      objectiveCount: 0,
      hazardCount: 0
    }
  };
}

function crisisKind(value) {
  const label = String(value?.kind || value?.type || value?.enemyType || value?.id || value || '').toLowerCase();
  if (label.includes('synth') || label.includes('joe') || label.includes('android')) return 'synthetic';
  if (label.includes('pathogen') || label.includes('neo') || label.includes('deacon')) return 'pathogen';
  return 'xenomorph';
}

export class HubGame extends HubGameV50 {
  constructor(canvas, options = {}) {
    super(canvas, options);
    this.editorPlaytest = false;
    this.compiledProject = null;
    this.v51Platforms = [];
    this.v51Ladders = [];
    this.v51Vents = [];
    this.v51Occluders = [];
    this.traversalArchetypes = [];
    this.v51Walls = [];
    this.v51Doors = [];
    this.v51Floors = [];
    this.v51Objectives = [];
    this.v51Terminals = [];
    this.v51Hazards = [];
    this.enemies = [];
    this.projectiles = [];
    this.route = null;
    this.crisis = null;
    this.useGlobalFloor = true;
    this.floorY = HUB_WORLD.floorY;
    this.spawnPoint = { x: 180, y: HUB_WORLD.floorY - PLAYER_HEIGHT };
    this.crisisSheets = new Map(Object.entries(CRISIS_SPRITES).map(([kind, source]) => [kind, createImage(source)]));
    this.traversalImages = new Map(Object.entries(HUB_TRAVERSAL_ART_FILES).map(([kind, source]) => [kind, createImage(source)]));
    this.v51Initialized = false;
    globalThis.addEventListener?.('keydown', (event) => {
      if (!this.running || event.repeat) return;
      if (event.code === 'KeyF' || event.code === 'Enter') {
        event.preventDefault?.();
        this.fire();
      }
    });
  }

  start(hubState = {}, { editorProject = null } = {}) {
    this.v51Initialized = false;
    this.compiledProject = compileShipProject(editorProject);
    this.editorPlaytest = Boolean(this.compiledProject);
    super.start(hubState);
    this.state.activeCrisis = hubState.activeCrisis ?? null;
    this.player.maxHealth = 100;
    this.player.health = clamp(Number(hubState.playerHealth ?? hubState.health ?? 100) || 100, 0, 100);
    this.player.alive = this.player.health > 0;
    this.player.crouching = false;
    this.player.climbing = false;
    this.player.fireClock = 0;
    this.player.invulnerability = 0;
    this.projectiles = [];
    this.configureTraversal();
    this.configureEditorEntities();
    this.configureCrisis(hubState.activeCrisis);
    if (this.compiledProject?.spawn) {
      this.player.x = this.compiledProject.spawn.x;
      this.player.y = this.compiledProject.spawn.y;
    }
    this.spawnPoint = { x: this.player.x, y: this.player.y };
    this.state.positionX = Math.round(this.player.x);
    this.camera.x = clamp(this.player.x - VIEW_WIDTH / 2, 0, HUB_WORLD.width - VIEW_WIDTH);
    this.v51Initialized = true;
    this.statusKey = '';
    this.emitStatus();
    this.draw();
  }

  configureTraversal() {
    if (this.compiledProject) {
      const project = this.compiledProject;
      this.v51Floors = project.floors.map((entry) => ({ ...entry }));
      this.v51Platforms = [...project.floors, ...project.platforms].map((entry) => ({ ...entry }));
      this.v51Ladders = [...project.ladders, ...project.lifts].map((entry) => ({ ...entry }));
      this.v51Vents = project.vents.map((entry) => ({ ...entry }));
      this.v51Occluders = [];
      this.traversalArchetypes = ['frontier-forge'];
      this.v51Walls = project.walls.map((entry) => ({ ...entry }));
      this.v51Doors = project.doors.map((entry) => ({ ...entry }));
      this.route = { ...project.route };
      this.floorY = project.floorY;
      this.useGlobalFloor = project.floors.length === 0;
      this.obstacles = [];
      this.npcs.forEach((npc) => { npc.y = this.floorY - npc.h; });
      return;
    }
    const traversal = fallbackTraversal(this.state.deck);
    this.v51Floors = [];
    this.v51Platforms = traversal.platforms;
    this.v51Ladders = traversal.ladders;
    this.v51Vents = traversal.vents;
    this.v51Occluders = traversal.occluders;
    this.traversalArchetypes = [...new Set(traversal.archetypes)];
    this.v51Walls = [];
    this.v51Doors = [];
    this.route = traversal.route;
    this.floorY = HUB_WORLD.floorY;
    this.useGlobalFloor = true;
  }

  configureEditorEntities() {
    const project = this.compiledProject;
    this.v51Objectives = project?.objectives.map((entry) => ({ ...entry })) || [];
    this.v51Terminals = project?.terminals.map((entry) => ({ ...entry })) || [];
    this.v51Hazards = project?.hazards.map((entry) => ({ ...entry })) || [];
    this.enemies = (project?.enemies || []).map((entry, index) => this.createEnemy(entry, index, 'editor'));
  }

  configureCrisis(rawCrisis) {
    if (!rawCrisis || rawCrisis.resolved) { this.crisis = null; return; }
    const kind = crisisKind(rawCrisis);
    const crisis = typeof rawCrisis === 'object' ? rawCrisis : { id: String(rawCrisis), kind };
    const count = clamp(Math.floor(Number(crisis.count ?? crisis.threats ?? 4)) || 4, 1, 12);
    this.crisis = {
      id: String(crisis.id || `crisis-${kind}`), kind, active: true,
      resolved: false, initialThreats: count
    };
    for (let index = 0; index < count; index += 1) {
      const width = kind === 'synthetic' ? 42 : kind === 'pathogen' ? 50 : 52;
      const height = kind === 'synthetic' ? 88 : kind === 'pathogen' ? 72 : 76;
      this.enemies.push(this.createEnemy({
        id: `${this.crisis.id}-enemy-${index + 1}`, kind,
        x: 720 + index * Math.max(280, (HUB_WORLD.width - 1100) / count),
        y: this.floorY - height, w: width, h: height
      }, index, 'crisis'));
    }
  }

  createEnemy(spec, index, source) {
    const kind = crisisKind(spec.kind);
    return {
      id: spec.id || `${source}-enemy-${index + 1}`, source, kind,
      x: spec.x, y: spec.y, w: spec.w || 50, h: spec.h || 76,
      health: kind === 'synthetic' ? 90 : kind === 'pathogen' ? 68 : 80,
      maxHealth: kind === 'synthetic' ? 90 : kind === 'pathogen' ? 68 : 80,
      damage: kind === 'pathogen' ? 13 : 11,
      speed: kind === 'synthetic' ? 72 : kind === 'pathogen' ? 112 : 92,
      facing: -1,
      sourceFacing: HUB_CRISIS_SOURCE_FACING[kind],
      attackClock: index * 0.11,
      alive: true, attacking: false
    };
  }

  setControl(control, active) {
    if (control === 'fire') { if (active) this.fire(); return; }
    if (control === 'crouch') {
      active ? this.keys.add('KeyC') : this.keys.delete('KeyC');
      return;
    }
    if (control === 'up' || control === 'down') {
      const code = control === 'up' ? 'KeyW' : 'KeyS';
      active ? this.keys.add(code) : this.keys.delete(code);
      return;
    }
    super.setControl(control, active);
  }

  nearestTraversalLadder(entity = this.player) {
    if (!entity) return null;
    const center = entity.x + entity.w / 2;
    return this.v51Ladders.find((ladder) => Math.abs(center - ladder.x) < Math.max(46, ladder.w) && entity.y + entity.h > ladder.top - 28 && entity.y < ladder.bottom + 24) || null;
  }

  nearestVent(entity = this.player) {
    return entity ? this.v51Vents.find((vent) => overlap(entity, vent)) || null : null;
  }

  nearestLift() {
    if (this.editorPlaytest || this.nearestTraversalLadder()) return undefined;
    return super.nearestLift();
  }

  useLift(direction, wrap = false) {
    const previousDeck = this.state?.deck;
    super.useLift(direction, wrap);
    if (!this.editorPlaytest && this.state?.deck !== previousDeck) {
      this.configureTraversal();
      this.statusKey = '';
      this.emitStatus();
    }
  }

  update(delta) {
    this.animationTime += delta;
    this.jumpQueued = Math.max(0, this.jumpQueued - delta);
    this.roomChangePulse = Math.max(0, this.roomChangePulse - delta);
    this.player.fireClock = Math.max(0, this.player.fireClock - delta);
    this.player.invulnerability = Math.max(0, this.player.invulnerability - delta);
    this.player.shockClock = Math.max(0, (this.player.shockClock || 0) - delta);
    this.hangarHazardCooldown = Math.max(0, (this.hangarHazardCooldown || 0) - delta);
    const controlsLocked = this.player.shockClock > 0;
    const left = !controlsLocked && (this.keys.has('KeyA') || this.keys.has('ArrowLeft'));
    const right = !controlsLocked && (this.keys.has('KeyD') || this.keys.has('ArrowRight'));
    const up = !controlsLocked && (this.keys.has('KeyW') || this.keys.has('ArrowUp'));
    const down = !controlsLocked && (this.keys.has('KeyS') || this.keys.has('ArrowDown'));
    const ladder = this.nearestTraversalLadder();
    if (this.player.alive) {
      if (ladder && (up || down)) this.player.climbing = true;
      if (this.player.climbing && !ladder) this.player.climbing = false;
      this.player.crouching = !controlsLocked && this.keys.has('KeyC') && this.player.grounded && !this.player.climbing;
      const sprinting = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
      const speed = this.player.crouching ? 105 : sprinting ? 370 : 270;
      const targetVelocity = (Number(right) - Number(left)) * speed;
      this.player.vx += (targetVelocity - this.player.vx) * Math.min(1, delta * (this.player.grounded ? 15 : 8));
      if (!left && !right && Math.abs(this.player.vx) < 0.4) this.player.vx = 0;
      if (this.player.vx) this.player.facing = Math.sign(this.player.vx);
      if (this.player.climbing && ladder) {
        this.player.x += (ladder.x - this.player.w / 2 - this.player.x) * Math.min(1, delta * 12);
        this.player.vy = (Number(down) - Number(up)) * 185;
        this.player.y = clamp(this.player.y + this.player.vy * delta, ladder.top - this.player.h + 10, ladder.bottom - this.player.h);
        this.player.grounded = false;
        if (this.jumpQueued > 0) {
          this.player.climbing = false;
          this.player.vy = -470;
          this.jumpQueued = 0;
        }
      } else {
        if (this.player.grounded) this.coyoteTime = 0.1;
        else this.coyoteTime = Math.max(0, this.coyoteTime - delta);
        if (this.jumpQueued > 0 && this.coyoteTime > 0) {
          this.player.vy = -665;
          this.player.grounded = false;
          this.coyoteTime = 0;
          this.jumpQueued = 0;
        }
        this.player.vy += GRAVITY * delta;
        const previousBottom = this.player.y + this.player.h;
        this.player.y += this.player.vy * delta;
        this.player.grounded = false;
        this.resolveVertical(previousBottom);
      }
      const previousX = this.player.x;
      this.player.x = clamp(this.player.x + this.player.vx * delta, 24, HUB_WORLD.width - this.player.w - 24);
      this.resolveHorizontal(previousX);
      if (!this.editorPlaytest) this.applyHangarHazard();
    } else {
      this.player.vx = 0;
    }

    for (const npc of this.npcs) {
      npc.x += npc.vx * delta;
      if (npc.x <= npc.min || npc.x >= npc.max) { npc.x = clamp(npc.x, npc.min, npc.max); npc.vx *= -1; }
    }
    if (!this.editorPlaytest) {
      const playerCenter = this.player.x + this.player.w / 2;
      for (const door of this.doorStates) {
        const target = Math.abs(playerCenter - door.x) < 182 ? 1 : 0;
        door.progress += (target - door.progress) * Math.min(1, delta * (this.reducedMotion ? 14 : 7));
      }
    }
    for (const door of this.v51Doors) {
      const target = door.open ? 1 : 0;
      door.progress += (target - door.progress) * Math.min(1, delta * 8);
    }
    this.updateCombat(delta);
    this.updateEditorGameplay(delta);
    if (this.player.y > VIEW_HEIGHT + 120) {
      this.damagePlayer(20);
      Object.assign(this.player, { x: this.spawnPoint.x, y: this.spawnPoint.y, vx: 0, vy: 0 });
    }
    const targetCamera = clamp(this.player.x - VIEW_WIDTH * 0.5, 0, HUB_WORLD.width - VIEW_WIDTH);
    this.camera.x += (targetCamera - this.camera.x) * Math.min(1, delta * (this.reducedMotion ? 12 : 5.5));
    this.state.positionX = Math.round(this.player.x);
    this.enterCurrentRoom(false);
    this.emitStatus();
  }

  resolveHorizontal(previousX) {
    const colliders = [];
    if (!this.editorPlaytest) {
      for (const door of this.doorStates) {
        if (door.blocking === false || door.lift) continue;
        if (door.progress < 0.82) colliders.push(getHubDoorBounds(door));
      }
    }
    for (const door of this.v51Doors) if (door.progress < 0.82) colliders.push(door);
    colliders.push(...this.obstacles, ...this.v51Walls);
    if (!this.player.crouching) colliders.push(...this.v51Vents);
    for (const collider of colliders) {
      if (!overlap(this.player, collider)) continue;
      if (this.player.vx > 0 && previousX + this.player.w <= collider.x + 9) this.player.x = collider.x - this.player.w;
      else if (this.player.vx < 0 && previousX >= collider.x + collider.w - 9) this.player.x = collider.x + collider.w;
      this.player.vx = 0;
    }
  }

  resolveVertical(previousBottom) {
    const landingSurfaces = [...this.v51Platforms, ...this.obstacles, ...this.v51Walls];
    for (const platform of landingSurfaces) {
      const horizontal = this.player.x + this.player.w > platform.x + 4 && this.player.x < platform.x + platform.w - 4;
      if (horizontal && this.player.vy >= 0 && previousBottom <= platform.y + 12 && this.player.y + this.player.h >= platform.y) {
        this.player.y = platform.y - this.player.h;
        this.player.vy = 0;
        this.player.grounded = true;
        return;
      }
    }
    if (this.useGlobalFloor && this.player.y + this.player.h >= HUB_WORLD.floorY) {
      this.player.y = HUB_WORLD.floorY - this.player.h;
      this.player.vy = 0;
      this.player.grounded = true;
    }
  }

  fire() {
    if (!this.running || !this.player?.alive || this.player.fireClock > 0) return;
    this.player.fireClock = 0.18;
    this.projectiles.push({
      x: this.player.x + this.player.w / 2 + this.player.facing * 24,
      y: this.player.y + 36,
      w: 18, h: 5, vx: this.player.facing * 820, damage: 28, life: 1.15
    });
    this.audio?.shot?.();
  }

  updateCombat(delta) {
    for (const projectile of this.projectiles) {
      projectile.x += projectile.vx * delta;
      projectile.life -= delta;
      for (const enemy of this.enemies) {
        if (!enemy.alive || projectile.hit || !overlap(projectile, enemy)) continue;
        enemy.health -= projectile.damage;
        projectile.hit = true;
        if (enemy.health <= 0) enemy.alive = false;
      }
    }
    this.projectiles = this.projectiles.filter((projectile) => !projectile.hit && projectile.life > 0 && projectile.x > -100 && projectile.x < HUB_WORLD.width + 100);
    for (const enemy of this.enemies) {
      if (!enemy.alive || !this.player.alive) continue;
      const distance = this.player.x - enemy.x;
      enemy.facing = Math.sign(distance) || enemy.facing;
      enemy.attackClock -= delta;
      enemy.attacking = Math.abs(distance) < 82;
      if (Math.abs(distance) < 560 && Math.abs(distance) > 54) {
        const previous = enemy.x;
        enemy.x = clamp(enemy.x + enemy.facing * enemy.speed * delta, 10, HUB_WORLD.width - enemy.w - 10);
        const blockers = [...this.v51Walls, ...this.obstacles, ...this.v51Doors.filter((door) => door.progress < 0.82)];
        if (blockers.some((blocker) => overlap(enemy, blocker))) enemy.x = previous;
      }
      if (overlap(enemy, this.player) && enemy.attackClock <= 0) {
        this.damagePlayer(enemy.damage);
        enemy.attackClock = 0.75;
      }
    }
    if (this.crisis?.active && !this.enemies.some((enemy) => enemy.source === 'crisis' && enemy.alive)) {
      this.crisis.active = false;
      this.crisis.resolved = true;
      this.state.activeCrisis = null;
      this.persist();
      this.onAction({ action: 'crisis:resolved', crisisId: this.crisis.id, kind: this.crisis.kind });
    }
  }

  updateEditorGameplay(delta) {
    this.hazardClock = Math.max(0, (this.hazardClock || 0) - delta);
    const hazard = this.v51Hazards.find((entry) => overlap(this.player, entry));
    if (hazard && this.hazardClock <= 0) {
      this.hazardClock = 0.55;
      this.damagePlayer(hazard.damage);
    }
    for (const objective of this.v51Objectives) {
      if (objective.complete || !overlap(this.player, objective)) continue;
      objective.complete = true;
      this.onAction({ action: 'editor:objective-complete', objectiveId: objective.id });
    }
  }

  damagePlayer(amount) {
    if (!this.player?.alive || this.player.invulnerability > 0) return;
    this.player.health = Math.max(0, this.player.health - Math.max(0, Number(amount) || 0));
    this.player.invulnerability = 0.48;
    if (this.player.health <= 0) {
      this.player.alive = false;
      this.player.vx = 0;
      this.onAction({
        action: this.crisis?.active ? 'crisis:player-down' : 'editor:player-down',
        crisisId: this.crisis?.id || null,
        health: 0
      });
    }
    this.persist();
  }

  interact() {
    if (!this.running) return;
    const center = this.player.x + this.player.w / 2;
    const door = this.v51Doors.find((entry) => Math.abs(center - (entry.x + entry.w / 2)) < 112);
    if (door) {
      door.open = !door.open;
      this.audio?.ui?.();
      return;
    }
    const terminal = this.v51Terminals.find((entry) => Math.abs(center - (entry.x + entry.w / 2)) < 130 && Math.abs(this.player.y - entry.y) < 130);
    if (terminal) {
      terminal.activated = true;
      this.audio?.ui?.();
      this.onAction({ action: 'editor:terminal', terminalId: terminal.id });
      return;
    }
    if (this.editorPlaytest) return;
    super.interact();
  }

  persist() {
    const patch = {
      deck: this.state.deck,
      roomId: this.state.roomId,
      positionX: Math.round(this.player.x),
      visited: [...new Set(this.state.visited)]
    };
    if (this.v51Initialized) {
      patch.playerHealth = Math.round(this.player.health);
      patch.activeCrisis = this.state.activeCrisis ?? null;
    }
    this.onPersist(patch);
  }

  statusPrompt() {
    if (!this.player?.alive) return 'MARINE À TERRE — EXTRACTION MÉDICALE REQUISE';
    const threats = this.enemies.filter((enemy) => enemy.alive).length;
    if (threats) return `F / ENTRÉE — TIRER · ${threats} MENACE${threats > 1 ? 'S' : ''}`;
    const terminal = this.v51Terminals.find((entry) => Math.abs(this.player.x - entry.x) < 130);
    if (terminal) return 'E — ACTIVER LE TERMINAL';
    const door = this.v51Doors.find((entry) => Math.abs(this.player.x - entry.x) < 112);
    if (door) return 'E — ACTIONNER LE SAS';
    if (this.nearestTraversalLadder()) return 'W / S — GRIMPER · ESPACE — SAUTER';
    if (this.nearestVent()) return 'C — RAMper DANS LE CONDUIT';
    return '';
  }

  emitStatus() {
    if (!this.state || !this.player) return;
    const room = this.currentRoom();
    const inheritedInteraction = this.editorPlaytest ? null : this.nearestInteraction();
    const inheritedLift = this.nearestLift();
    const prompt = this.statusPrompt() || (inheritedInteraction
      ? `E — ${inheritedInteraction.description}`
      : inheritedLift !== undefined ? 'W / S — choisir un pont · E — pont suivant' : 'A / D — marcher · C — ramper · F — tirer');
    const payload = {
      deck: this.state.deck,
      deckName: HUB_DECKS[this.state.deck].name,
      roomId: room.id,
      roomName: room.name,
      prompt,
      visited: this.state.visited.length,
      health: Math.round(this.player.health),
      threats: this.enemies.filter((enemy) => enemy.alive).length,
      route: this.route,
      editorPlaytest: this.editorPlaytest
    };
    const key = JSON.stringify(payload);
    if (key === this.statusKey) return;
    this.statusKey = key;
    this.onStatus(payload);
  }

  getAssetReport() {
    const report = super.getAssetReport();
    const traversalArtReady = [...this.traversalImages.values()].filter(imageReady).length;
    return {
      ...report,
      modularAssetCount: HUB_MODULAR_ASSETS.length,
      readyAssetCount: report.readyAssetCount + traversalArtReady,
      totalReadyAssetCount: report.totalReadyAssetCount + traversalArtReady,
      traversalArtReady,
      traversalArtCount: this.traversalImages.size,
      crisisArtReady: [...this.crisisSheets.values()].filter(imageReady).length,
      crisisArtCount: this.crisisSheets.size
    };
  }

  getSnapshot() {
    const snapshot = super.getSnapshot();
    const assetReport = this.getAssetReport();
    return {
      ...snapshot,
      health: Math.round(this.player?.health ?? 0),
      maxHealth: this.player?.maxHealth ?? 100,
      threats: this.enemies.filter((enemy) => enemy.alive).length,
      crisisActive: Boolean(this.crisis?.active),
      route: this.route,
      editorPlaytest: this.editorPlaytest,
      platformCount: this.v51Platforms.length,
      ladderCount: this.v51Ladders.length,
      ventCount: this.v51Vents.length,
      occluderCount: this.v51Occluders.length,
      traversalArchetypes: [...this.traversalArchetypes],
      traversalArtReady: assetReport.traversalArtReady,
      traversalArtCount: assetReport.traversalArtCount,
      wallCount: this.v51Walls.length,
      runtimeDoorCount: this.v51Doors.length,
      hazardCount: this.v51Hazards.length,
      objectiveCount: this.v51Objectives.length,
      projectiles: this.projectiles.length,
      crouching: Boolean(this.player?.crouching),
      climbing: Boolean(this.player?.climbing)
    };
  }

  drawWorld(ctx) {
    const deck = HUB_DECKS[this.state.deck];
    const farImage = this.farLayers.get(deck.farBackground);
    for (const room of deck.rooms) this.drawRoomModule(ctx, room, farImage);
    if (this.useGlobalFloor) {
      ctx.fillStyle = 'rgba(5, 10, 9, .84)';
      ctx.fillRect(0, HUB_WORLD.floorY, HUB_WORLD.width, VIEW_HEIGHT - HUB_WORLD.floorY);
      ctx.fillStyle = '#829789';
      ctx.fillRect(0, HUB_WORLD.floorY, HUB_WORLD.width, 4);
    }
    this.drawTraversal(ctx);
    for (const room of deck.rooms) {
      this.drawRoomMarker(ctx, room);
      if (room.id !== DROPSHIP_HANGAR_ART_V55.roomId) this.drawInteractionProp(ctx, room);
    }
    for (const obstacle of this.obstacles) this.drawObstacle(ctx, obstacle);
    for (const npc of this.npcs) {
      const frame = this.reducedMotion ? 0 : Math.floor(this.animationTime * 8 + npc.sheet) % 4;
      const image = this.npcSheets[npc.sheet] || this.crewSheet;
      const renderWidth = 92;
      const renderHeight = 140;
      const renderY = npc.y + npc.h - renderHeight * (240 / 256);
      this.drawSheetCell(ctx, image, frame, 1, npc.x + npc.w / 2 - renderWidth / 2, renderY, renderWidth, renderHeight, npc.vx < 0, 4, 4);
    }
    for (const enemy of this.enemies) if (enemy.alive) this.drawEnemy(ctx, enemy);
    this.drawPlayer(ctx);
    for (const projectile of this.projectiles) {
      ctx.fillStyle = '#f4d477';
      ctx.fillRect(projectile.x, projectile.y, projectile.w, projectile.h);
    }
    if (!this.editorPlaytest) for (const door of this.doorStates) this.drawDoor(ctx, door);
    for (const door of this.v51Doors) this.drawRuntimeDoor(ctx, door);
    this.drawTraversalOcclusions(ctx, 'front');
    if (!this.editorPlaytest) {
      for (const room of deck.rooms) {
        if (room.id === DROPSHIP_HANGAR_ART_V55.roomId) this.drawModularHangar(ctx, room, 'front');
        else this.drawModularRoomV56(ctx, room, 'front');
      }
    }
  }

  drawTraversal(ctx) {
    for (const floor of this.v51Floors) {
      ctx.fillStyle = '#19231f';
      ctx.fillRect(floor.x, floor.y, floor.w, floor.h);
      ctx.fillStyle = '#7f9987';
      ctx.fillRect(floor.x, floor.y, floor.w, 4);
    }
    for (const platform of this.v51Platforms.filter((entry) => entry.type !== 'floor')) {
      this.drawTraversalPlatform(ctx, platform);
    }
    for (const wall of this.v51Walls) {
      ctx.fillStyle = '#293630';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#657a6c';
      ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.w - 1, wall.h - 1);
    }
    for (const ladder of this.v51Ladders) {
      this.drawTraversalLadder(ctx, ladder);
    }
    for (const vent of this.v51Vents) {
      this.drawTraversalVent(ctx, vent);
    }
    for (const hazard of this.v51Hazards) {
      ctx.fillStyle = `rgba(151, 190, 71, ${0.62 + Math.sin(this.animationTime * 5) * 0.12})`;
      ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
    }
    for (const terminal of this.v51Terminals) {
      ctx.fillStyle = terminal.activated ? '#79d99a' : '#56a9a5';
      ctx.fillRect(terminal.x, terminal.y, terminal.w, terminal.h);
    }
    for (const objective of this.v51Objectives) {
      ctx.strokeStyle = objective.complete ? '#83d99e' : '#d7bd67';
      ctx.lineWidth = 4;
      ctx.strokeRect(objective.x, objective.y, objective.w, objective.h);
    }
  }

  drawTraversalPlatform(ctx, platform) {
    const art = ['catwalk', 'drop', 'ledge'].includes(platform.art) ? platform.art : 'catwalk';
    const image = this.traversalImages.get(art);
    if (!imageReady(image)) return;
    const profiles = {
      catwalk: { cropHeight: 92, renderHeight: 90, surfaceOffset: 55 },
      drop: { cropHeight: image.naturalHeight, renderHeight: 84, surfaceOffset: 18 },
      ledge: { cropHeight: image.naturalHeight, renderHeight: 72, surfaceOffset: 18 }
    };
    const profile = profiles[art];
    const crop = { x: 0, y: 0, w: image.naturalWidth, h: Math.min(profile.cropHeight, image.naturalHeight), ...profile };
    const renderHeight = crop.renderHeight;
    const surfaceOffset = crop.surfaceOffset;
    const renderY = platform.y - surfaceOffset;
    const unitWidth = crop.w * (renderHeight / crop.h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(platform.x, renderY, platform.w, renderHeight);
    ctx.clip();
    for (let x = platform.x; x < platform.x + platform.w + unitWidth; x += Math.max(24, unitWidth - 8)) {
      ctx.drawImage(
        image,
        crop.x, crop.y, crop.w, crop.h,
        x, renderY, unitWidth, renderHeight
      );
    }
    ctx.restore();
  }

  drawTraversalLadder(ctx, ladder) {
    const image = this.traversalImages.get('ladder');
    if (!imageReady(image)) return;
    const width = Math.min(58, Math.max(42, ladder.w || 52));
    const cropHeight = Math.min(180, image.naturalHeight);
    const unitHeight = cropHeight * (width / image.naturalWidth);
    const height = ladder.bottom - ladder.top;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ladder.x - width / 2, ladder.top, width, height);
    ctx.clip();
    for (let y = ladder.top; y < ladder.bottom + unitHeight; y += Math.max(18, unitHeight - 8)) {
      ctx.drawImage(
        image, 0, 0, image.naturalWidth, cropHeight,
        ladder.x - width / 2, y, width, unitHeight
      );
    }
    ctx.restore();
  }

  drawTraversalVent(ctx, vent) {
    const image = this.traversalImages.get('vent');
    if (!imageReady(image)) return;
    ctx.drawImage(image, vent.x, vent.y, vent.w, vent.h);
  }

  drawTraversalOcclusions(ctx, phase = 'front') {
    for (const occlusion of this.v51Occluders.filter((entry) => entry.phase === phase)) {
      const image = this.traversalImages.get(occlusion.art);
      if (!imageReady(image)) continue;
      const unitWidth = image.naturalWidth * (occlusion.h / image.naturalHeight);
      ctx.save();
      ctx.beginPath();
      ctx.rect(occlusion.x, occlusion.y, occlusion.w, occlusion.h);
      ctx.clip();
      ctx.globalAlpha = clamp(occlusion.alpha, 0, 1);
      for (let x = occlusion.x; x < occlusion.x + occlusion.w + unitWidth; x += Math.max(28, unitWidth - 8)) {
        ctx.drawImage(image, x, occlusion.y, unitWidth, occlusion.h);
      }
      ctx.restore();
    }
  }

  drawEnemy(ctx, enemy) {
    const image = this.crisisSheets.get(enemy.kind);
    const frame = this.reducedMotion ? 0 : Math.floor(this.animationTime * (enemy.attacking ? 11 : 7) + enemy.x * 0.01) % 4;
    const row = enemy.attacking ? 2 : 1;
    const renderWidth = enemy.kind === 'synthetic' ? 88 : enemy.kind === 'pathogen' ? 126 : 136;
    const renderHeight = enemy.kind === 'synthetic' ? 116 : enemy.kind === 'pathogen' ? 104 : 106;
    const x = enemy.x + enemy.w / 2 - renderWidth / 2;
    const y = enemy.y + enemy.h - renderHeight * (240 / 256);
    const sourceFacing = enemy.sourceFacing ?? HUB_CRISIS_SOURCE_FACING[enemy.kind] ?? -1;
    this.drawSheetCell(ctx, image, frame, row, x, y, renderWidth, renderHeight, enemy.facing !== sourceFacing, 4, 4);
    ctx.fillStyle = '#b94f4b';
    ctx.fillRect(enemy.x, enemy.y - 8, enemy.w * Math.max(0, enemy.health / enemy.maxHealth), 3);
  }

  drawRuntimeDoor(ctx, door) {
    const visibleHeight = door.h * (1 - door.progress * 0.86);
    ctx.fillStyle = '#27342f';
    ctx.fillRect(door.x, door.y, door.w, visibleHeight);
    ctx.strokeStyle = door.open ? '#7ed49a' : '#d2a957';
    ctx.strokeRect(door.x + 0.5, door.y + 0.5, door.w - 1, Math.max(2, visibleHeight - 1));
  }

  drawPlayer(ctx) {
    if (this.player?.crouching) {
      const grounded = this.player.grounded;
      this.player.grounded = true;
      const vx = this.player.vx;
      this.player.vx = 0;
      super.drawPlayer(ctx);
      this.player.vx = vx;
      this.player.grounded = grounded;
      return;
    }
    super.drawPlayer(ctx);
  }

  drawHud(ctx) {
    super.drawHud(ctx);
    const threats = this.enemies.filter((enemy) => enemy.alive).length;
    ctx.fillStyle = 'rgba(2, 8, 7, .86)';
    ctx.fillRect(450, 18, 294, 66);
    ctx.strokeStyle = this.player.health < 30 ? '#c95a55' : '#6fa482';
    ctx.strokeRect(450.5, 18.5, 294, 66);
    ctx.fillStyle = '#d3e1d6';
    ctx.font = '700 13px ui-monospace, monospace';
    ctx.fillText(`SANTÉ ${Math.round(this.player.health)}%`, 468, 45);
    ctx.fillStyle = threats ? '#d17367' : '#8bd2a0';
    ctx.fillText(`MENACES ${threats} · ${this.editorPlaytest ? 'FORGE' : 'TANTALUS'}`, 468, 68);
    const prompt = this.statusPrompt();
    if (prompt) {
      ctx.font = '700 13px ui-monospace, monospace';
      const width = Math.min(720, ctx.measureText(prompt).width + 46);
      const x = (VIEW_WIDTH - width) / 2;
      ctx.fillStyle = 'rgba(2, 8, 7, .9)';
      ctx.fillRect(x, 604, width, 40);
      ctx.strokeStyle = '#93d2a3';
      ctx.strokeRect(x + 0.5, 604.5, width, 40);
      ctx.fillStyle = '#c8e8d0';
      ctx.textAlign = 'center';
      ctx.fillText(prompt.toUpperCase(), VIEW_WIDTH / 2, 629);
      ctx.textAlign = 'left';
    }
  }
}
