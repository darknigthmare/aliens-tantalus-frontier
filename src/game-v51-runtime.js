import { SPRITE_SHEETS, SPRITE_HITBOXES, SpriteAnimationController, resolveEnemyAnimation, resolveSpriteSheet, resolveVehicleAnimation, shouldFlipSprite } from './sprite-animation-runtime.js';
import { resolveEnemyVisualProfile, resolveLegacyEnemyCell } from './enemy-visual-runtime-v53.js';
import {
  advanceEnemyMeleeAttackV64,
  armEnemyMeleeAttackV64,
  cancelEnemyMeleeAttackV64,
  finishEnemyMeleeAttackV64,
  isEnemyMeleeTargetValidV64,
  resolveEnemyMeleeTargetIdV64
} from './enemy-combat-runtime-v64.js';
import {
  MISSION_INTERACTIVE_ART_ASSET_COUNT_V56,
  MISSION_INTERACTIVE_ART_FILES_V56,
  resolveMissionArchiveArtV56,
  resolveMissionDropArtV56,
  resolveMissionHazardArtV56
} from './mission-interactive-art-v56.js';
import {
  WEAPON_VISUAL_ASSETS_ALL_V63,
  WEAPON_VISUAL_BASE_COUNT_V63,
  resolveWeaponVisualProfileV63
} from './weapon-visual-runtime-v63.js';
import { resolveEquipmentVisualProfileV56 } from './equipment-visual-runtime-v56.js';
import { MISSION_DOOR_ATLAS_V58, resolveMissionDoorArtV58 } from './mission-door-art-v58.js';
import { EnemyAtlasLRUV65 } from './enemy-atlas-loader-v65.js';
import { updateFacehuggerCombatV65 } from './enemy-facehugger-combat-v65.js';
import { updateEnemyBatchCombatV66 } from './enemy-batch-combat-v66.js';
import { updateOvomorphCycleV66 } from './enemy-ovomorph-cycle-v66.js';

export const MISSION_TOOL_PICKUP_VISUAL_V56 = resolveEquipmentVisualProfileV56({
  id: 'equipment-004-cutting-torch',
  name: 'Cutting Torch'
});

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const WORLD_WIDTH = 6200;
const WORLD_HEIGHT = 1080;
const FLOOR_Y = 930;
const GRAVITY = 1900;
const CELL_SIZE = 256;
const MAGAZINE_SIZE = 30;
const TRACKER_COST = 24;
const REVIVE_RANGE = 86;
const EDITOR_TILE_TYPES = new Set(['floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift', 'spawn', 'objective', 'enemy', 'vehicle', 'terminal', 'hazard']);
const DEDICATED_ENEMY_ACTION_CLIP_SETS = new Set([
  'enemy-action-v54',
  'enemy-action-v56',
  'facehugger-action-v65',
  'enemy-action-v66',
  'ovomorph-cycle-v66',
  'ovomorph-cycle-v55',
  'newborn-action-v64',
  'offspring-action-v64',
  'predalien-action-v64'
]);
const ENEMY_SPRITE_ASSETS = Object.freeze(Object.fromEntries(
  Object.values(SPRITE_SHEETS)
    .filter((sheet) => sheet.family === 'enemy')
    .map((sheet) => [sheet.imageKey, sheet.path])
));

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlap = (a, b) => Boolean(a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
export function getEntityCollisionBounds(entity) {
  if (!entity) return null;
  const local = entity.spriteHitbox?.local;
  if (!local) return entity;
  const values = [entity.x, entity.y, local.x, local.y, local.w, local.h].map(Number);
  if (!values.every(Number.isFinite) || values[4] <= 0 || values[5] <= 0) return entity;
  return {
    x: values[0] + values[2],
    y: values[1] + values[3],
    w: values[4],
    h: values[5]
  };
}
export const combatOverlap = (a, b) => overlap(getEntityCollisionBounds(a), getEntityCollisionBounds(b));
const ready = (image) => Boolean(image?.complete && image.naturalWidth);
const distanceBetween = (a, b) => Math.hypot((a.x + a.w / 2) - (b.x + b.w / 2), (a.y + a.h / 2) - (b.y + b.h / 2));
export const MISSION_STRUCTURAL_PROP_FILES = Object.freeze({
  maintenancePipe: '/assets/openai/metroidvania/props/maintenance-pipe.png',
  ceilingCables: '/assets/openai/metroidvania/props/ceiling-cables.png',
  foregroundPipes: '/assets/openai/metroidvania/props/foreground-pipes.png'
});

export const MISSION_SURFACE_PROFILES = Object.freeze({
  floor: Object.freeze({ renderHeight: 92, surfaceOffset: 0 }),
  catwalk: Object.freeze({ renderHeight: 64, surfaceOffset: 42 }),
  ledge: Object.freeze({ renderHeight: 72, surfaceOffset: 0 }),
  drop: Object.freeze({ renderHeight: 64, surfaceOffset: 0 })
});

export function getMissionSurfaceMetrics(platform = {}) {
  const key = platform.floor ? 'floor' : platform.art;
  const profile = MISSION_SURFACE_PROFILES[key] || MISSION_SURFACE_PROFILES.catwalk;
  const renderHeight = Number.isFinite(platform.renderHeight) ? platform.renderHeight : profile.renderHeight;
  const scaledOffset = profile.surfaceOffset * (renderHeight / profile.renderHeight);
  const surfaceOffset = Number.isFinite(platform.surfaceOffset) ? platform.surfaceOffset : scaledOffset;
  const surfaceY = Number(platform.y) || 0;
  return Object.freeze({ renderHeight, surfaceOffset, surfaceY, renderY: surfaceY - surfaceOffset });
}


export const MISSION_WORLD_PROP_FILES_V58 = Object.freeze({
  floor: '/assets/openai/metroidvania/props/floor-segment.png',
  catwalk: '/assets/openai/metroidvania/props/overhead-catwalk.png',
  ledge: '/assets/openai/metroidvania/props/short-ledge.png',
  drop: '/assets/openai/metroidvania/props/drop-platform.png',
  ladder: '/assets/openai/metroidvania/props/wall-ladder.png',
  vent: '/assets/openai/metroidvania/props/vent-entrance.png',
  breakable: '/assets/openai/metroidvania/props/breakable-panel.png',
  cover: '/assets/openai/metroidvania/props/cargo-cover.png',
  crates: '/assets/openai/metroidvania/props/supply-crates.png',
  lamp: '/assets/openai/metroidvania/props/warning-lamp.png',
  acid: '/assets/openai/metroidvania/props/acid-floor-hazard.png',
  electricalArc: '/assets/openai/metroidvania/props/electrical-arc-hazard.png'
});

const ASSETS = Object.freeze({
  far: '/assets/openai/metroidvania/tantalus-mission-far.png',
  mid: '/assets/openai/metroidvania/tantalus-mission-mid.png',
  foreground: '/assets/openai/metroidvania/tantalus-mission-foreground.png',
  playerLocomotion: '/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png',
  playerCombat: '/assets/openai/sprites/normalized/player/echo9-marine-combat-sheet.png',
  xenoLocomotion: '/assets/openai/sprites/normalized/enemies/xenomorph-drone-locomotion-sheet.png',
  xenoCombat: '/assets/openai/sprites/normalized/enemies/xenomorph-drone-combat-sheet.png',
  facehugger: '/assets/openai/sprites/normalized/enemies/facehugger-locomotion-sheet.png',
  neomorph: '/assets/openai/sprites/normalized/enemies/neomorph-locomotion-sheet.png',
  workingJoe: '/assets/openai/sprites/normalized/enemies/working-joe-combat-sheet.png',
  xenoWarrior: '/assets/openai/sprites/normalized/enemies/xenomorph-warrior-combat-sheet.png',
  xenoRunner: '/assets/openai/sprites/normalized/enemies/xenomorph-runner-action-sheet.png',
  xenoQueen: '/assets/openai/sprites/normalized/enemies/xenomorph-queen-combat-sheet.png',
  ripperQueen: '/assets/openai/sprites/normalized/enemies/ripper-queen-action-sheet.png',
  paleCrucibleHunter: '/assets/openai/sprites/normalized/enemies/pale-crucible-hunter-action-sheet.png',
  pathogenMimic: '/assets/openai/sprites/normalized/enemies/pathogen-mimic-action-sheet.png',
  ...ENEMY_SPRITE_ASSETS,
  ...WEAPON_VISUAL_ASSETS_ALL_V63,
  rifle: '/assets/openai/sprites/normalized/weapons/m41a-pulse-rifle-action-sheet.png',
  apc: '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png',
  human: '/assets/openai/human-factions-animation-sheet.png',
  synthetic: '/assets/openai/synthetic-android-animation-sheet.png',
  pathogen: '/assets/openai/pathogen-fauna-animation-sheet.png',
  neuroXeno: '/assets/openai/neuro-xeno-animation-sheet.png',
  vfx: '/assets/openai/combat-vfx-animation-sheet.png',
  ...MISSION_WORLD_PROP_FILES_V58,
  missionDoorStatesV58: MISSION_DOOR_ATLAS_V58,
  ...MISSION_INTERACTIVE_ART_FILES_V56,
  ...MISSION_STRUCTURAL_PROP_FILES
});
const ENEMY_SPRITE_PATHS = new Set(Object.values(SPRITE_SHEETS)
  .filter((entry) => entry.family === 'enemy')
  .map((entry) => entry.path));
const EAGER_ASSETS = Object.freeze(Object.fromEntries(
  Object.entries(ASSETS).filter(([, source]) => !ENEMY_SPRITE_PATHS.has(source))
));

const PLATFORM_LAYOUT = Object.freeze([
  { x: 340, y: 816, w: 290, h: 24, art: 'catwalk' },
  { x: 690, y: 704, w: 300, h: 24, art: 'drop' },
  { x: 1015, y: 816, w: 210, h: 24, art: 'ledge' },
  { x: 1360, y: 804, w: 330, h: 24, art: 'catwalk' },
  { x: 1750, y: 692, w: 310, h: 24, art: 'drop' },
  { x: 2080, y: 804, w: 250, h: 24, art: 'ledge' },
  { x: 2540, y: 810, w: 280, h: 24, art: 'catwalk' },
  { x: 2860, y: 698, w: 330, h: 24, art: 'drop' },
  { x: 3260, y: 592, w: 260, h: 24, art: 'ledge' },
  { x: 3530, y: 704, w: 320, h: 24, art: 'catwalk' },
  { x: 4020, y: 806, w: 300, h: 24, art: 'drop' },
  { x: 4460, y: 692, w: 320, h: 24, art: 'catwalk' },
  { x: 4830, y: 806, w: 250, h: 24, art: 'ledge' },
  { x: 5260, y: 808, w: 320, h: 24, art: 'catwalk' },
  { x: 5650, y: 696, w: 300, h: 24, art: 'drop' }
]);

const LADDER_LAYOUT = Object.freeze([
  { x: 472, top: 704, bottom: FLOOR_Y },
  { x: 1840, top: 692, bottom: FLOOR_Y },
  { x: 3000, top: 592, bottom: FLOOR_Y },
  { x: 3650, top: 704, bottom: FLOOR_Y },
  { x: 4560, top: 692, bottom: FLOOR_Y },
  { x: 5380, top: 696, bottom: FLOOR_Y }
]);

const COVER_LAYOUT = Object.freeze([
  { x: 760, y: FLOOR_Y - 58, w: 96, h: 58, art: 'cover' },
  { x: 1510, y: FLOOR_Y - 72, w: 108, h: 72, art: 'crates' },
  { x: 2670, y: FLOOR_Y - 58, w: 96, h: 58, art: 'cover' },
  { x: 3760, y: FLOOR_Y - 72, w: 108, h: 72, art: 'crates' },
  { x: 5020, y: FLOOR_Y - 58, w: 96, h: 58, art: 'cover' }
]);

const HAZARD_LAYOUT = Object.freeze([
  { x: 1298, y: FLOOR_Y - 20, w: 126, h: 20, damage: 14 },
  { x: 2458, y: FLOOR_Y - 20, w: 118, h: 20, damage: 14 },
  { x: 3928, y: FLOOR_Y - 20, w: 142, h: 20, damage: 18 },
  { x: 5118, y: FLOOR_Y - 20, w: 132, h: 20, damage: 18 }
]);

const SUPPLY_LAYOUT = Object.freeze([
  { id: 'med-01', type: 'medkit', x: 1480, y: FLOOR_Y - 52, w: 58, h: 52, amount: 1 },
  { id: 'armor-01', type: 'armor', x: 2725, y: FLOOR_Y - 52, w: 58, h: 52, amount: 35 },
  { id: 'ammo-01', type: 'ammo', x: 3880, y: FLOOR_Y - 52, w: 58, h: 52, amount: 45 },
  { id: 'med-02', type: 'medkit', x: 5180, y: FLOOR_Y - 52, w: 58, h: 52, amount: 1 }
]);

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createImage(source) {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  return image;
}


function enemyBehavior(spriteKey, biology) {
  if (spriteKey === 'newbornV64') return 'grappler';
  if (spriteKey === 'offspringV64') return 'reach-hunter';
  if (spriteKey === 'predalienV64') return 'hybrid-boss';
  if (spriteKey === 'facehugger') return 'pouncer';
  if (spriteKey === 'xenoRunner') return 'pouncer';
  if (spriteKey === 'korariStalkerV56' || spriteKey === 'tantalusTunnelVerminV56') return 'pouncer';
  if (spriteKey === 'xenoProwlerV56') return 'pouncer';
  if (spriteKey === 'dustRunnerV56' || spriteKey === 'reefStalkerV56' || spriteKey === 'caravanStalkerV56') return 'pouncer';
  if (spriteKey === 'xenoBoilerV56' || spriteKey === 'xenoBursterV56') return 'exploder';
  if (spriteKey === 'ataraxRipperV56') return 'bruiser';
  if (spriteKey === 'xenoborgV56') return 'bruiser';
  if (spriteKey === 'pathogenAbominationV56' || spriteKey === 'trilobiteEchoV56' || spriteKey === 'wildBoarHostV56' || spriteKey === 'foundryCrusherV56' || spriteKey === 'salvageHiveBruteV56') return 'bruiser';
  if (spriteKey === 'xenoQueenV56' || spriteKey === 'siegeRoyalV56') return 'boss';
  if (spriteKey === 'paleCrucibleHunter') return 'pouncer';
  if (spriteKey === 'deaconLineV56' || spriteKey === 'protomorphV56' || spriteKey === 'arcologyLurkerV56') return 'hunter';
  if (spriteKey === 'neuroXenoDroneV56' || spriteKey === 'cetoReefPredatorV56') return 'hunter';
  if (spriteKey === 'pathogenMimic') return 'hunter';
  if (spriteKey === 'xenoQueen' || spriteKey === 'ripperQueen') return 'boss';
  if (spriteKey === 'workingJoe') return 'bruiser';
  if (biology === 'synthetic') return 'bruiser';
  if (spriteKey === 'neomorph') return 'hunter';
  if (spriteKey === 'colonialRaiderV56' || spriteKey === 'ataraxControllerV56') return 'shooter';
  if (biology === 'pathogen') return 'spitter';
  if (biology === 'human') return 'shooter';
  return 'stalker';
}

const isRoyalEnemyProfile = (source = {}) => source.caste === 'royal' || /queen|reine|royal/i.test(source.name || '');
const V64_ENEMY_PHYSICS = Object.freeze({
  newbornV64: Object.freeze({ width: 58, height: 118 }),
  offspringV64: Object.freeze({ width: 52, height: 124 }),
  predalienV64: Object.freeze({ width: 96, height: 126 })
});

function bossProfileScore(source = {}, index = 0) {
  const frequencyScore = { common: 0, uncommon: 24, rare: 52, apex: 88, scripted: 76 }[String(source.frequency || 'common').toLowerCase()] || 0;
  return frequencyScore
    + (isRoyalEnemyProfile(source) ? 110 : 0)
    + (Number(source.health) || 80) * 1.2
    + (Number(source.damage) || 12) * 3.5
    + (Number(source.armor) || 0) * 0.7
    + (Number(source.acid) || 0) * 0.15
    - index * 0.001;
}

function selectBossEnemyProfile(catalog = []) {
  return catalog.reduce((selected, source, index) => {
    if (!selected || bossProfileScore(source, index) > selected.score) return { source, score: bossProfileScore(source, index) };
    return selected;
  }, null)?.source || null;
}

function parseEditorPosition(position) {
  const [column, row] = String(position || '').split(':').map(Number);
  return Number.isInteger(column) && Number.isInteger(row) ? { column, row } : null;
}

export class GameEngine {
  constructor(canvas, { audio, onEvent = () => {} } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio;
    this.onEvent = onEvent;
    this.keys = new Set();
    this.running = false;
    this.paused = false;
    this.enemyAtlasLoadingPausedV65 = false;
    this.last = 0;
    this.animationTime = 0;
    this.room = 0;
    this.trackerPulse = 0;
    this.coopEnabled = false;
    this.images = new Map(Object.entries(EAGER_ASSETS).map(([name, source]) => [name, createImage(source)]));
    this.enemyAtlasLRUV65 = new EnemyAtlasLRUV65({ imageStore: this.images });
    this.fallbackBackground = createImage('/assets/openai/tantalus-base-environment.png');
    this.bind();
  }

  ensureEnemyAtlas(sheetOrId) {
    const sheet = typeof sheetOrId === 'string' ? resolveSpriteSheet(sheetOrId) : sheetOrId;
    if (!sheet || sheet.family !== 'enemy') return Promise.resolve(null);
    return this.enemyAtlasLRUV65.ensure(sheet);
  }

  bind() {
    globalThis.addEventListener('keydown', (event) => {
      if (!this.running || !this.canRouteGameplayKey(event)) return;
      if (!event.repeat && (event.code === 'KeyP' || event.code === 'Escape')) {
        this.togglePause();
        return;
      }
      if (!event.repeat && event.code === 'Enter' && this.mission?.state === 'failed' && !this.paused) {
        this.restartFromCheckpoint();
        return;
      }
      if (this.paused || this.enemyAtlasLoadingPausedV65 || this.mission?.state !== 'active') return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
      this.keys.add(event.code);
      if (event.repeat) return;
      if (event.code === 'KeyQ') this.activateTracker(this.player);
      if (event.code === 'KeyV') this.toggleVehicle(this.player);
      if (event.code === 'KeyE') this.interact(this.player);
      if (event.code === 'KeyR') this.reload(this.player);
      if (event.code === 'KeyH') this.useMedkit(this.player);
      if (event.code === 'Space' && this.player) this.player.jumpBuffer = 0.14;
      if (event.code === 'KeyU' && this.coop) this.coop.jumpBuffer = 0.14;
      if (event.code === 'KeyY') this.interact(this.coop);
      if (event.code === 'KeyT') this.reload(this.coop);
      if (event.code === 'KeyG') this.useMedkit(this.coop);
    });
    globalThis.addEventListener('keyup', (event) => this.keys.delete(event.code));
    globalThis.addEventListener('blur', () => this.suspendForFocusLoss());
    globalThis.document?.addEventListener?.('visibilitychange', () => {
      if (globalThis.document.hidden) this.suspendForFocusLoss();
    });
    this.canvas.addEventListener('pointerdown', () => { this.audio?.unlock(); this.fire(this.player); });
  }

  canRouteGameplayKey(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return false;
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [event.target];
    return !path.some((target) => target?.isContentEditable || target?.closest?.('input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="button"], [role="slider"], [role="dialog"], [aria-modal="true"]'));
  }

  clearGameplayInput() {
    this.keys?.clear?.();
    for (const actor of [this.player, this.coop]) {
      if (!actor) continue;
      actor.jumpBuffer = 0;
      actor.vx = 0;
    }
  }

  suspendForFocusLoss() {
    this.clearGameplayInput();
    if (this.running) {
      this.focusLossVersionV72 = (this.focusLossVersionV72 || 0) + 1;
      this.paused = true;
    }
  }

  start({ seed = 426, world, campaign, enemyCatalog = [], weapon, editorProject = null } = {}) {
    this.random = seeded(seed);
    this.world = world;
    this.campaign = campaign;
    this.weapon = weapon || { name: 'M41A', damage: 26 };
    this.weaponVisual = resolveWeaponVisualProfileV63(this.weapon);
    this.room = 0;
    this.camera = { x: 0, y: 250 };
    this.player = this.createPlayer(160, FLOOR_Y - 92, '#92d6a6', false);
    this.coop = this.createPlayer(105, FLOOR_Y - 92, '#e0bc6b', true);
    this.platforms = [
      { x: -300, y: FLOOR_Y, w: WORLD_WIDTH + 600, h: WORLD_HEIGHT - FLOOR_Y + 120, art: 'floor', floor: true },
      ...PLATFORM_LAYOUT.map((platform) => ({ ...platform }))
    ];
    this.walls = [];
    this.lifts = [];
    this.ladders = LADDER_LAYOUT.map((ladder) => ({ ...ladder, w: 52 }));
    this.covers = COVER_LAYOUT.map((cover, index) => ({ ...cover, id: `cover-${index}`, health: 100, destroyed: false }));
    this.doors = [
      { id: 'entry', x: 1210, y: FLOOR_Y - 176, w: 70, h: 176, open: false, progress: 0 },
      { id: 'power-gate', x: 2390, y: FLOOR_Y - 176, w: 70, h: 176, open: false, progress: 0, lockedBy: 'power' },
      { id: 'security-gate', x: 3590, y: FLOOR_Y - 176, w: 70, h: 176, open: false, progress: 0, lockedBy: 'security' },
      { id: 'containment-gate', x: 4810, y: FLOOR_Y - 176, w: 70, h: 176, open: false, progress: 0, lockedBy: 'boss' }
    ];
    this.powerNode = { id: 'aux-power', x: 1900, y: 630, w: 52, h: 62, active: false };
    this.vents = [{ id: 'maintenance-shortcut', x: 3340, y: 512, w: 90, h: 80, open: false, requiresTool: true, targetX: 3740, targetY: 704 - 92 }];
    this.ventShortcut = this.vents[0];
    this.vehicle = this.createVehicle(4210, FLOOR_Y - 104);
    this.weaponPickup = { id: 'm41a', x: 1080, y: FLOOR_Y - 54, w: 126, h: 54, taken: false };
    if (this.weaponVisual) Object.assign(this.weaponPickup, {
      id: this.weaponVisual.sheetId,
      visualSheetId: this.weaponVisual.sheetId,
      imageKey: this.weaponVisual.imageKey,
      w: Math.max(54, this.weaponVisual.width),
      h: Math.max(42, this.weaponVisual.height)
    });
    this.toolPickup = {
      id: 'cutter',
      visualSheetId: MISSION_TOOL_PICKUP_VISUAL_V56?.sheetId || null,
      imageKey: MISSION_TOOL_PICKUP_VISUAL_V56?.imageKey || null,
      x: 3030,
      y: FLOOR_Y - 48,
      w: Math.max(54, MISSION_TOOL_PICKUP_VISUAL_V56?.renderWidth || 0),
      h: Math.max(48, MISSION_TOOL_PICKUP_VISUAL_V56?.renderHeight || 0),
      taken: false
    };
    this.supplies = SUPPLY_LAYOUT.map((supply) => ({ ...supply, used: false }));
    this.hazards = HAZARD_LAYOUT.map((hazard, index) => ({ ...hazard, id: `acid-${index}`, active: true }));
    this.drops = [];
    this.bullets = [];
    this.hostileProjectiles = [];
    this.particles = [];
    this.enemies = this.buildDefaultEnemies(enemyCatalog);
    this.objective = { id: 'extraction', x: 5900, y: FLOOR_Y - 90, w: 66, h: 90, complete: false };
    this.archiveTerminal = { id: 'archive', x: 5480, y: FLOOR_Y - 76, w: 58, h: 76, recovered: false };
    this.inventory = { medkits: 1, salvage: 0, intel: 0, securityKeys: 0, cutter: false };
    this.tracker = { energy: 100, cooldown: 0, contacts: [], pulses: 0 };
    this.editorMode = false;
    this.editorTileCounts = {};
    this.editorTileCount = 0;
    this.editorProjectKind = null;
    if (editorProject?.kind === 'mission' && Array.isArray(editorProject.tiles) && editorProject.tiles.length) {
      this.applyEditorProject(editorProject, enemyCatalog);
    }
    const spawn = this.editorSpawn || { x: this.player.x, y: this.player.y };
    Object.assign(this.player, spawn);
    Object.assign(this.coop, { x: Math.max(20, spawn.x - 55), y: spawn.y });
    this.checkpoint = { id: 'insertion', x: spawn.x, y: spawn.y };
    const hasBoss = this.enemies.some((enemy) => enemy.isBoss && enemy.alive);
    const hasSecurityGate = this.doors.some((door) => door.lockedBy === 'security');
    this.mission = {
      state: 'active',
      phase: this.powerNode ? 'restore-power' : hasSecurityGate ? 'secure-route' : hasBoss ? 'neutralize-boss' : this.archiveTerminal ? 'recover-archive' : 'extract',
      elapsed: 0,
      retries: 0,
      casualties: 0,
      objectives: {
        power: !this.powerNode,
        route: !hasSecurityGate,
        boss: !hasBoss,
        archive: !this.archiveTerminal,
        extract: false
      },
      rewards: null
    };
    this.running = true;
    this.paused = false;
    this.enemyAtlasLoadingPausedV65 = false;
    this.last = performance.now();
    this.animationTime = 0;
    this.clearGameplayInput();
    // A stopped/restarted mission must invalidate RAF callbacks already queued by its predecessor.
    const generation = this.loopGeneration = (this.loopGeneration || 0) + 1;
    requestAnimationFrame((time) => this.loop(time, generation));
  }

  createPlayer(x, y, color, coop) {
    return {
      x, y, w: 42, h: 92, vx: 0, vy: 0, facing: 1, grounded: false, climbing: false, crouching: false,
      health: 100, maxHealth: 100, armor: 50, maxArmor: 100, ammo: 12, ammoReserve: 72, magazineSize: 12,
      weaponMode: 'sidearm', color, coop, alive: true, downed: false, bleedOut: 0, inVehicle: false,
      fireClock: 0, reloadClock: 0, reloading: false, actionClock: 0, hazardClock: 0, jumpBuffer: 0,
      meleeClock: 0, meleeKind: 'knife-attack', toolUseClock: 0, toolId: null, interactionClock: 0, interactionKind: null,
      coyoteTime: 0.1, kills: 0, damageTaken: 0, damageBlocked: 0, shots: 0, inCover: false
    };
  }

  createVehicle(x, y) {
    return {
      id: 'vehicle-001-m577-armored-personnel-carrier', name: 'M577 Armored Personnel Carrier', fit: 'Standard',
      x, y, w: 190, h: 104, vx: 0, vy: 0, facing: 1,
      active: true, occupied: false, driver: null, passengers: [],
      hull: 340, maxHull: 340, fuel: 100, turretAmmo: 80, ramClock: 0, destroyed: false
    };
  }

  createEnemy(source = {}, index = 0, x = 660, groundY = FLOOR_Y, { boss = false, keyCarrier = false } = {}) {
    const visual = resolveEnemyVisualProfile(source);
    const spriteKey = visual.spriteKey;
    const royal = isRoyalEnemyProfile(source) || spriteKey === 'xenoQueen';
    const isBoss = Boolean(boss);
    const biology = source.biology || 'xenomorph';
    const resolvedSheet = resolveSpriteSheet(visual.sheetId);
    const profileSheet = visual.wave === 'v66' || visual.sheetId === 'enemy.profile.enemy-002-facehugger.v65' || resolvedSheet?.hitbox === 'queen-standing'
      ? resolvedSheet : null;
    const profileBody = profileSheet && SPRITE_HITBOXES[profileSheet.hitbox];
    const physical = profileBody ? {
      width: profileBody.width * profileSheet.renderWidth / profileSheet.cellWidth,
      height: profileBody.height * profileSheet.renderHeight / profileSheet.cellHeight
    } : V64_ENEMY_PHYSICS[spriteKey];
    const height = physical?.height ?? (royal ? 112 : biology === 'xenomorph' ? 74 : 88);
    const width = physical?.width ?? (royal ? 82 : biology === 'xenomorph' ? 52 : 42);
    const baseHealth = Number(source.health) || 80;
    const apex = source.caste === 'apex';
    const maxHealth = isBoss
      ? Math.max(320, Math.round(baseHealth * 1.65))
      : royal
        ? Math.max(280, baseHealth)
        : apex
          ? Math.max(260, Math.round(baseHealth * 0.82))
          : Math.min(240, baseHealth);
    const baseDamage = Number(source.damage) || (royal ? 24 : 12);
    return {
      id: `${source.id || 'enemy'}:${index}`,
      name: source.name || (royal ? 'Xenomorph Queen' : 'Xenomorph Warrior'),
      biology,
      visualArchetype: visual.archetype,
      visualImageKey: visual.imageKey,
      visualSheetId: visual.sheetId,
      visualRow: visual.row,
      visualIdentityStatus: visual.identityStatus,
      visualApproximation: visual.approximate,
      visualFallbackReason: visual.fallbackReason,
      spriteKey,
      behavior: enemyBehavior(spriteKey, biology),
      animationPhase: index % 4,
      row: visual.row ?? 0,
      x, spawnX: x, y: groundY - height, groundY,
      w: width, h: height,
      health: maxHealth, maxHealth, armor: Math.max(0, Math.min(isBoss ? 35 : 26, Number(source.armor) || (royal ? 14 : 0))),
      damage: Math.min(isBoss ? 52 : apex ? 38 : 30, isBoss ? Math.max(18, baseDamage * 1.25) : baseDamage),
      speed: 55 + (Number(source.speed) || 1.2) * 35,
      facing: -1, alert: false, attacking: false, alive: true, attackClock: this.random(),
      attackWindupClock: 0, attackAnimationClock: 0, pendingMelee: false, pendingMeleeTargetId: null,
      rangedClock: this.random() * 0.7, staggerClock: 0, hurtClock: 0, pounceClock: 0, revealed: 0, deathClock: 0,
      isBoss, isRoyal: royal, royalScaleV72: profileSheet?.hitbox === 'queen-standing', keyCarrier, reward: isBoss ? 36 : royal ? 18 : 4 + (index % 4)
    };
  }

  buildDefaultEnemies(enemyCatalog) {
    const catalog = enemyCatalog.length ? enemyCatalog : [{ id: 'warrior', name: 'Xenomorph Warrior', health: 80, damage: 12, speed: 1.2, biology: 'xenomorph' }];
    const worldId = String(this.world?.id || '').trim();
    const contextSafeCatalog = catalog.filter((source) => !source.defaultEncounter
      || (worldId && Array.isArray(source.encounterWorldIds) && source.encounterWorldIds.includes(worldId)));
    const contextual = worldId
      ? contextSafeCatalog.filter((source) => Array.isArray(source.encounterWorldIds) && source.encounterWorldIds.includes(worldId))
      : [];
    const encounterCatalog = contextual.length
      ? contextual
      : contextSafeCatalog.length
        ? contextSafeCatalog
        : [{ id: 'warrior', name: 'Xenomorph Warrior', health: 80, damage: 12, speed: 1.2, biology: 'xenomorph' }];
    const featuredBySlot = new Map(worldId
      ? encounterCatalog
        .filter((source) => Number.isInteger(source.defaultEncounter?.slot))
        .map((source) => [source.defaultEncounter.slot, source])
      : []);
    const forcedBoss = [...featuredBySlot.values()].find((source) => source.defaultEncounter?.boss) || null;
    const featuredSources = new Set(featuredBySlot.values());
    const bossPool = encounterCatalog.filter((source) => !featuredSources.has(source) || source.defaultEncounter?.boss);
    const bossSource = forcedBoss || selectBossEnemyProfile(bossPool) || bossPool[0] || encounterCatalog[0];
    const standardCatalog = encounterCatalog.filter((source) => source !== bossSource && !featuredSources.has(source));
    const encounterPool = standardCatalog.length ? standardCatalog : encounterCatalog;
    return Array.from({ length: 16 }, (_, index) => {
      const source = index === 15
        ? bossSource
        : featuredBySlot.get(index) || encounterPool[(index * 11 + 426) % encounterPool.length];
      const platform = index % 4 === 2 ? PLATFORM_LAYOUT[(index * 3) % PLATFORM_LAYOUT.length] : null;
      let x = 660 + index * 325 + this.random() * 90;
      let groundY = platform?.y ?? FLOOR_Y;
      if (index === 7) { x = 3220; groundY = FLOOR_Y; }
      if (index === 15) { x = 4560; groundY = FLOOR_Y; }
      return this.createEnemy(source, index, x, groundY, { boss: index === 15, keyCarrier: index === 7 });
    });
  }

  applyEditorProject(project, enemyCatalog) {
    const [colsRaw, rowsRaw] = Array.isArray(project.size) ? project.size : [32, 18];
    const cols = clamp(Number(colsRaw) || 32, 4, 64);
    const rows = clamp(Number(rowsRaw) || 18, 4, 36);
    const tileWidth = WORLD_WIDTH / cols;
    const tileHeight = WORLD_HEIGHT / rows;
    const tiles = project.tiles.flatMap((tile) => {
      const position = parseEditorPosition(tile.position);
      if (!position || !EDITOR_TILE_TYPES.has(tile.type) || position.column < 0 || position.column >= cols || position.row < 0 || position.row >= rows) return [];
      return [{ ...tile, ...position, x: position.column * tileWidth, y: position.row * tileHeight }];
    });
    if (!tiles.length) return;
    this.editorMode = true;
    this.editorProjectKind = project.kind;
    this.editorTileCount = tiles.length;
    this.editorTileCounts = Object.fromEntries([...EDITOR_TILE_TYPES].map((type) => [type, tiles.filter((tile) => tile.type === type).length]));
    const byType = (type) => tiles.filter((tile) => tile.type === type);
    const floorTiles = byType('floor').map((tile, index) => ({ id: `editor-floor-${index}`, x: tile.x, y: tile.y, w: tileWidth + 1, h: Math.max(24, tileHeight), art: 'floor', floor: true }));
    const platformTiles = byType('platform').map((tile, index) => ({ id: `editor-platform-${index}`, x: tile.x, y: tile.y + tileHeight * 0.5, w: tileWidth + 1, h: 24, art: index % 2 ? 'ledge' : 'catwalk' }));
    this.platforms = [...floorTiles, ...platformTiles];
    if (!this.platforms.length) this.platforms.push({ x: -300, y: FLOOR_Y, w: WORLD_WIDTH + 600, h: 180, art: 'floor', floor: true });
    this.walls = byType('wall').map((tile, index) => ({ id: `editor-wall-${index}`, x: tile.x, y: tile.y, w: tileWidth, h: tileHeight, art: 'breakable' }));
    this.doors = byType('door').map((tile, index) => {
      const height = Math.max(132, tileHeight * 2.6);
      return { id: `editor-door-${index}`, x: tile.x + tileWidth * 0.34, y: tile.y + tileHeight - height, w: Math.max(48, tileWidth * 0.32), h: height, open: false, progress: 0 };
    });
    this.ladders = byType('ladder').map((tile, index) => ({ id: `editor-ladder-${index}`, x: tile.x + tileWidth * 0.5, top: tile.y, bottom: Math.min(WORLD_HEIGHT - 20, tile.y + tileHeight * 4), w: 52 }));
    this.lifts = byType('lift').map((tile, index) => ({
      id: `editor-lift-${index}`, x: tile.x, y: tile.y, baseY: tile.y, topY: Math.max(80, tile.y - tileHeight * 4),
      w: tileWidth, h: 24, art: 'drop', phase: index * 0.9, previousY: tile.y
    }));
    this.platforms.push(...this.lifts);
    const vents = byType('vent');
    this.vents = vents.map((tile, index) => {
      const target = vents[(index + 1) % vents.length];
      return {
        id: `editor-vent-${index}`, x: tile.x + tileWidth * 0.25, y: tile.y, w: tileWidth * 0.5, h: tileHeight,
        open: false, requiresTool: false, targetX: target ? target.x + tileWidth * 0.25 : clamp(tile.x + tileWidth * 3, 0, WORLD_WIDTH - 80),
        targetY: target ? target.y - this.player.h : clamp(tile.y - this.player.h, 0, WORLD_HEIGHT - this.player.h)
      };
    });
    this.ventShortcut = this.vents[0] || { x: -1000, y: -1000, w: 0, h: 0, open: false };
    const spawns = byType('spawn');
    if (spawns[0]) this.editorSpawn = { x: spawns[0].x + tileWidth * 0.35, y: Math.max(0, spawns[0].y + tileHeight - this.player.h) };
    const objectives = byType('objective');
    if (objectives[0]) this.objective = { id: 'editor-objective', x: objectives[0].x + tileWidth * 0.35, y: objectives[0].y, w: Math.max(52, tileWidth * 0.3), h: tileHeight, complete: false };
    const enemyTiles = byType('enemy');
    const catalog = enemyCatalog.length ? enemyCatalog : [{ name: 'Xenomorph Warrior', biology: 'xenomorph', health: 80, damage: 12, speed: 1.2 }];
    this.enemies = enemyTiles.map((tile, index) => {
      const source = catalog[index % catalog.length];
      const boss = source.caste === 'royal' || /queen|reine/i.test(source.name || '');
      return this.createEnemy(source, index, tile.x + tileWidth * 0.35, tile.y + tileHeight, { boss, keyCarrier: index === 0 && enemyTiles.length > 2 });
    });
    const vehicles = byType('vehicle');
    this.vehicle = vehicles[0] ? this.createVehicle(vehicles[0].x, Math.max(0, vehicles[0].y + tileHeight - 104)) : { ...this.createVehicle(-1000, FLOOR_Y - 104), active: false };
    const terminals = byType('terminal');
    this.powerNode = terminals[0] ? { id: 'editor-power', x: terminals[0].x + tileWidth * 0.4, y: terminals[0].y, w: 52, h: tileHeight, active: false } : null;
    this.archiveTerminal = terminals[1] ? { id: 'editor-archive', x: terminals[1].x + tileWidth * 0.4, y: terminals[1].y, w: 58, h: tileHeight, recovered: false } : null;
    this.hazards = byType('hazard').map((tile, index) => ({ id: `editor-hazard-${index}`, x: tile.x, y: tile.y + tileHeight * 0.65, w: tileWidth, h: tileHeight * 0.35, damage: 16, active: true }));
    this.covers = [];
    this.toolPickup.taken = this.vents.every((vent) => !vent.requiresTool);
  }

  stop() {
    this.running = false;
    this.loopGeneration = (this.loopGeneration || 0) + 1;
    this.clearGameplayInput();
    this.enemyAtlasLoadingPausedV65 = false;
    this.enemyAtlasLRUV65?.setWorkingSet([]);
  }
  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
    this.clearGameplayInput();
    if (!this.paused) this.canvas?.focus?.({ preventScroll: true });
  }
  setCoop(enabled) { this.coopEnabled = Boolean(enabled); }

  loop(time, generation = this.loopGeneration) {
    if (!this.running || generation !== this.loopGeneration) return;
    const delta = Math.min(0.034, (time - this.last) / 1000 || 0);
    this.last = time;
    this.refreshEnemyAtlasAvailabilityV65();
    if (!this.paused && !this.enemyAtlasLoadingPausedV65) this.update(delta);
    this.draw();
    if (this.running && generation === this.loopGeneration) requestAnimationFrame((next) => this.loop(next, generation));
  }

  update(delta) {
    this.animationTime += delta;
    if (!this.mission || this.mission.state !== 'active') return;
    this.mission.elapsed += delta;
    this.updateLifts(delta);
    this.updatePlayer(this.player, delta, { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' });
    if (this.coopEnabled) this.updatePlayer(this.coop, delta, { left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', jump: 'KeyU', fire: 'KeyO' });
    this.updateBullets(delta);
    for (const door of this.doors) {
      const target = door.open ? 1 : 0;
      door.progress += (target - door.progress) * Math.min(1, delta * 8);
    }
    for (const enemy of this.enemies) this.updateEnemy(enemy, delta);
    this.updateHostileProjectiles(delta);
    this.updatePickups();
    this.updateMissionPhase();
    const focus = this.player.alive ? this.player : this.coopEnabled && this.coop.alive ? this.coop : this.player;
    const focusX = focus.inVehicle && this.vehicle?.active ? this.vehicle.x : focus.x;
    const focusY = focus.inVehicle && this.vehicle?.active ? this.vehicle.y : focus.y;
    const focusVx = focus.inVehicle && this.vehicle?.active ? this.vehicle.vx || 0 : focus.vx;
    const lookAhead = clamp(focusVx * 0.48, -150, 190);
    const targetX = clamp(focusX - 430 + lookAhead, 0, WORLD_WIDTH - LOGICAL_WIDTH);
    const targetY = clamp(focusY - 420 + focus.vy * 0.08, 0, WORLD_HEIGHT - LOGICAL_HEIGHT);
    this.camera.x += (targetX - this.camera.x) * Math.min(1, delta * 5.2);
    this.camera.y += (targetY - this.camera.y) * Math.min(1, delta * 4.4);
    this.room = Math.floor((focusX + 200) / 1200);
    this.trackerPulse = Math.max(0, this.trackerPulse - delta * 0.7);
    this.tracker.cooldown = Math.max(0, this.tracker.cooldown - delta);
    if (this.tracker.cooldown === 0) this.tracker.energy = Math.min(100, this.tracker.energy + delta * 5);
    for (const enemy of this.enemies) {
      enemy.revealed = Math.max(0, enemy.revealed - delta);
      enemy.deathClock = Math.max(0, enemy.deathClock - delta);
    }
    for (const particle of this.particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.life -= delta;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
    if (!this.player.alive && (!this.coopEnabled || !this.coop.alive)) this.failMission('escouade-neutralisee');
  }

  updateLifts(delta) {
    for (const lift of this.lifts) {
      lift.previousY = lift.y;
      const blend = (Math.sin(this.animationTime * 0.7 + lift.phase) + 1) / 2;
      lift.y = lift.topY + (lift.baseY - lift.topY) * blend;
      const offset = lift.y - lift.previousY;
      for (const actor of [this.player, this.coop]) {
        if (!actor?.alive || actor.inVehicle) continue;
        const standing = actor.x + actor.w > lift.x && actor.x < lift.x + lift.w && Math.abs(actor.y + actor.h - lift.previousY) < 9;
        if (standing) { actor.y += offset; actor.grounded = true; }
      }
    }
  }

  updatePlayer(player, delta, controls) {
    if (!player) return;
    player.jumpBuffer = Math.max(0, player.jumpBuffer - delta);
    player.fireClock = Math.max(0, player.fireClock - delta);
    player.actionClock = Math.max(0, player.actionClock - delta);
    player.hazardClock = Math.max(0, player.hazardClock - delta);
    player.meleeClock = Math.max(0, Number(player.meleeClock) - delta || 0);
    player.toolUseClock = Math.max(0, Number(player.toolUseClock) - delta || 0);
    player.interactionClock = Math.max(0, Number(player.interactionClock) - delta || 0);
    player.grappledClock = Math.max(0, Number(player.grappledClock) - delta || 0);
    if (player.reloading) {
      player.reloadClock -= delta;
      if (player.reloadClock <= 0) this.finishReload(player);
    }
    if (!player.alive) { this.updateDowned(player, delta); return; }
    if (player.inVehicle) {
      this.updateVehicleDriver(player, delta, controls);
      if (this.keys.has(controls.fire)) this.fire(player);
      return;
    }
    const stunned = player.hazardKind === 'electrical' && player.hazardClock > 0;
    const left = !stunned && (this.keys.has(controls.left) || (!player.coop && this.keys.has('ArrowLeft')));
    const right = !stunned && (this.keys.has(controls.right) || (!player.coop && this.keys.has('ArrowRight')));
    const up = !stunned && (this.keys.has(controls.up) || (!player.coop && this.keys.has('ArrowUp')));
    const down = !stunned && (this.keys.has(controls.down) || (!player.coop && this.keys.has('ArrowDown')));
    const ladder = this.nearestLadder(player);
    if (stunned) player.climbing = false;
    if (ladder && (up || down)) player.climbing = true;
    if (player.climbing && !ladder) player.climbing = false;
    player.crouching = down && !player.climbing && player.grounded;
    const grappleScale = player.grappledClock > 0 ? 0.42 : 1;
    const speed = (player.crouching ? 105 : 245) * grappleScale;
    const targetVelocity = (Number(right) - Number(left)) * speed;
    player.vx += (targetVelocity - player.vx) * Math.min(1, delta * (player.grounded ? 16 : 8));
    if (!left && !right && Math.abs(player.vx) < 0.5) player.vx = 0;
    if (player.vx) player.facing = Math.sign(player.vx);
    if (player.climbing && ladder) {
      player.x += (ladder.x - player.w / 2 - player.x) * Math.min(1, delta * 12);
      player.vy = (Number(down) - Number(up)) * 185;
      player.y = clamp(player.y + player.vy * delta, ladder.top - player.h + 12, ladder.bottom - player.h);
      player.grounded = false;
      if (player.jumpBuffer > 0 || this.keys.has(controls.jump)) {
        player.climbing = false;
        player.vy = -470;
        player.jumpBuffer = 0;
      }
    } else {
      if (player.grounded) player.coyoteTime = 0.1;
      else player.coyoteTime = Math.max(0, player.coyoteTime - delta);
      if (!stunned && (player.jumpBuffer > 0 || this.keys.has(controls.jump)) && player.coyoteTime > 0) {
        player.vy = -665;
        player.grounded = false;
        player.coyoteTime = 0;
        player.jumpBuffer = 0;
      }
      player.vy += GRAVITY * delta;
      const previousBottom = player.y + player.h;
      player.y += player.vy * delta;
      player.grounded = false;
      this.resolveVertical(player, previousBottom);
    }
    const previousX = player.x;
    player.x = clamp(player.x + player.vx * delta, 0, WORLD_WIDTH - player.w);
    this.resolveHorizontal(player, previousX);
    player.inCover = Boolean(player.crouching && this.findCover(player));
    if (!stunned && this.keys.has(controls.fire)) this.fire(player);
    this.applyHazards(player);
    if (player.y > WORLD_HEIGHT + 100) {
      this.damagePlayer(player, 35, { bypassCover: true, source: 'fall' });
      player.x = this.checkpoint.x;
      player.y = this.checkpoint.y;
      player.vy = 0;
    }
  }

  updateVehicleDriver(player, delta, controls) {
    if (!this.vehicle?.active || this.vehicle.destroyed) { player.inVehicle = false; return; }
    if (this.vehicle.driver !== player) {
      player.x = this.vehicle.x + 52;
      player.y = this.vehicle.y + 12;
      return;
    }
    const left = this.keys.has(controls.left) || (!player.coop && this.keys.has('ArrowLeft'));
    const right = this.keys.has(controls.right) || (!player.coop && this.keys.has('ArrowRight'));
    const direction = Number(right) - Number(left);
    const previousX = this.vehicle.x;
    const baseSpeed = Math.max(90, Number(this.vehicle.runtimeSpeed) || 390);
    const speed = this.vehicle.fuel > 0 ? baseSpeed : Math.min(90, baseSpeed);
    this.vehicle.vx = direction * speed;
    if (Math.abs(this.vehicle.vx) > 0.5) this.vehicle.facing = Math.sign(this.vehicle.vx);
    this.vehicle.x = clamp(this.vehicle.x + this.vehicle.vx * delta, 0, WORLD_WIDTH - this.vehicle.w);
    if (this.vehicle.family === 'air') {
      const up = this.keys.has(controls.up) || (!player.coop && this.keys.has('ArrowUp'));
      const down = this.keys.has(controls.down) || (!player.coop && this.keys.has('ArrowDown'));
      const vertical = Number(down) - Number(up);
      this.vehicle.vy = vertical * speed * 0.72;
      this.vehicle.y = clamp(this.vehicle.y + this.vehicle.vy * delta, 150, FLOOR_Y - this.vehicle.h);
      if (direction || vertical) this.vehicle.fuel = Math.max(0, this.vehicle.fuel - delta * 2.4);
    } else {
      this.vehicle.vy = 0;
      if (direction) this.vehicle.fuel = Math.max(0, this.vehicle.fuel - delta * 1.9);
    }
    this.resolveVehicleHorizontal(previousX);
    this.vehicle.ramClock = Math.max(0, this.vehicle.ramClock - delta);
    for (const cover of this.covers) {
      if (!cover.destroyed && overlap(this.vehicle, cover)) {
        cover.health = 0;
        cover.destroyed = true;
        this.onEvent({ type: 'cover-destroyed', coverId: cover.id });
      }
    }
    for (const enemy of this.enemies) {
      if (!enemy.alive || this.vehicle.ramClock > 0 || !combatOverlap(this.vehicle, enemy) || Math.abs(this.vehicle.vx) < 120) continue;
      this.applyEnemyDamage(enemy, 95, { owner: player, kind: 'ram' });
      this.damageVehicle(8, 'ram');
      this.vehicle.ramClock = 0.35;
    }
    for (const rider of [this.player, this.coop]) {
      if (!rider?.inVehicle) continue;
      rider.x = this.vehicle.x + (rider === this.vehicle.driver ? 48 : 96);
      rider.y = this.vehicle.y + 10;
      rider.vx = this.vehicle.vx;
    }
  }

  updateBullets(delta) {
    for (const bullet of this.bullets) {
      bullet.x += bullet.vx * delta;
      bullet.life -= delta;
      for (const wall of this.walls) if (!bullet.hit && overlap(bullet, wall)) bullet.hit = true;
      for (const door of this.closedDoorColliders()) if (!bullet.hit && overlap(bullet, door)) bullet.hit = true;
      for (const enemy of this.enemies) {
        if (bullet.hit || !enemy.alive || !combatOverlap(bullet, enemy)) continue;
        this.applyEnemyDamage(enemy, bullet.damage, bullet);
        bullet.hit = true;
      }
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.hit && bullet.life > 0 && bullet.x > -100 && bullet.x < WORLD_WIDTH + 100);
  }
  detonateEnemy(enemy, target) {
    if (!enemy?.alive || !target) return false;
    const blastDamage = Math.max(20, Math.round((Number(enemy.damage) || 16) * 1.35));
    enemy.attacking = true;
    enemy.attackClock = 99;
    if (target.inVehicle) this.damageVehicle(blastDamage, `${enemy.name}:detonation`);
    else this.damagePlayer(target, blastDamage, { bypassCover: true, source: `${enemy.name}:detonation` });
    for (let index = 0; index < 3; index += 1) {
      this.spawnImpact(enemy.x + enemy.w / 2, enemy.y + enemy.h * (0.32 + index * 0.16), '#b7cf4c');
    }
    this.applyEnemyDamage(enemy, enemy.maxHealth + enemy.armor + 1, {
      owner: null,
      kind: 'self-detonation',
      x: enemy.x + enemy.w / 2,
      y: enemy.y + enemy.h / 2
    });
    this.onEvent({ type: 'enemy-detonation', enemyId: enemy.id, targetId: target.id || null, damage: blastDamage });
    return true;
  }

  updateEnemy(enemy, delta) {
    if (updateOvomorphCycleV66(this, enemy, delta)) return;
    if (updateEnemyBatchCombatV66(this, enemy, delta)) return;
    if (updateFacehuggerCombatV65(this, enemy, delta)) return;
    if (!enemy.alive) return;
    enemy.attackClock -= delta;
    enemy.rangedClock -= delta;
    enemy.staggerClock = Math.max(0, enemy.staggerClock - delta);
    enemy.hurtClock = Math.max(0, (enemy.hurtClock || 0) - delta);
    const v64MeleeState = advanceEnemyMeleeAttackV64(enemy, delta);
    const v64Melee = v64MeleeState.contract;
    const candidatePool = [this.player, this.coopEnabled ? this.coop : null].filter(Boolean);
    const candidates = candidatePool.filter(isEnemyMeleeTargetValidV64);
    let target = null;
    if (v64Melee && enemy.pendingMelee) {
      target = candidatePool.find((actor) => resolveEnemyMeleeTargetIdV64(actor) === enemy.pendingMeleeTargetId) || null;
      if (!isEnemyMeleeTargetValidV64(target)) {
        this.cancelPendingEnemyMeleeV64(enemy, 'target-invalid');
        return;
      }
    }
    if (!target) target = candidates.sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0] || null;
    if (!target) return;
    const targetEntity = target.inVehicle && this.vehicle?.active ? this.vehicle : target;
    const distance = targetEntity.x - enemy.x + (enemy.royalScaleV72 ? (targetEntity.w - enemy.w) / 2 : 0);
    const verticalDistance = Math.abs((targetEntity.y + targetEntity.h) - (enemy.y + enemy.h));
    if (Math.abs(distance) < 620 || enemy.revealed > 0) enemy.alert = true;
    if (!enemy.alert) {
      if (v64Melee && enemy.pendingMelee) {
        this.cancelPendingEnemyMeleeV64(enemy, 'lost-target');
      }
      enemy.facing = Math.sin(this.animationTime * 0.6 + enemy.animationPhase) > 0 ? 1 : -1;
      enemy.x = clamp(enemy.x + enemy.facing * enemy.speed * 0.18 * delta, enemy.spawnX - 70, enemy.spawnX + 70);
      return;
    }
    enemy.facing = Math.sign(distance) || enemy.facing || 1;
    const ranged = !v64Melee && (enemy.behavior === 'spitter'
      || enemy.behavior === 'shooter'
      || enemy.isBoss);
    if (ranged && Math.abs(distance) < (enemy.isBoss ? 640 : 500) && Math.abs(distance) > 115 && verticalDistance < 180 && enemy.rangedClock <= 0) {
      this.spawnEnemyProjectile(enemy, targetEntity);
      enemy.rangedClock = enemy.isBoss ? 1.2 : enemy.behavior === 'spitter' ? 1.55 : 1.15;
      enemy.attacking = true;
    } else if (!v64Melee) enemy.attacking = enemy.attackClock < 0.25 && Math.abs(distance) < 115;
    const stopRange = v64Melee?.stopRange ?? (enemy.royalScaleV72 ? (enemy.w + targetEntity.w) / 2 + 28 : enemy.isBoss
            ? 94
            : enemy.behavior === 'pouncer'
              ? 42
              : 58);
    if (enemy.staggerClock <= 0 && Math.abs(distance) > stopRange && verticalDistance < 160) {
      const speedMultiplier = v64Melee?.speedMultiplier ?? (enemy.behavior === 'hunter'
        ? 1.28
        : enemy.behavior === 'pouncer'
          ? 1.38
          : enemy.isBoss
              ? 0.75
              : 1);
      const previousX = enemy.x;
      enemy.x += enemy.facing * enemy.speed * speedMultiplier * delta;
      this.resolveEnemyHorizontal(enemy, previousX);
    }
    if (enemy.behavior === 'pouncer' && Math.abs(distance) < 210 && enemy.attackClock <= 0) {
      enemy.x += Math.sign(distance) * 92;
      enemy.attackClock = 1.3;
      enemy.attacking = true;
    }
    const meleeRange = v64Melee?.meleeRange ?? stopRange + 28;
    const rawMeleeContact = () => {
      const currentDistance = targetEntity.x - enemy.x + (enemy.royalScaleV72 ? (targetEntity.w - enemy.w) / 2 : 0);
      const currentVertical = Math.abs((targetEntity.y + targetEntity.h) - (enemy.y + enemy.h));
      return combatOverlap(enemy, targetEntity) || (Math.abs(currentDistance) < meleeRange && currentVertical < 110);
    };
    const meleePathClear = () => this.enemyMeleePathClearV64(enemy, targetEntity);
    const meleeContact = () => rawMeleeContact() && meleePathClear();
    if (v64Melee && v64MeleeState.impactReady) {
      const hit = meleeContact();
      const targetId = enemy.pendingMeleeTargetId;
      const reason = hit ? null : rawMeleeContact() ? 'path-blocked' : 'target-out-of-range';
      if (hit) {
        if (target.inVehicle) this.damageVehicle(enemy.damage, enemy.name);
        else {
          this.damagePlayer(target, enemy.damage, { source: enemy.name });
          if (enemy.behavior === 'grappler') target.grappledClock = Math.max(target.grappledClock || 0, 0.8);
        }
      }
      finishEnemyMeleeAttackV64(enemy);
      this.onEvent({ type: 'enemy-attack-impact', enemyId: enemy.id, behavior: enemy.behavior, targetId, hit, reason });
    }
    if (v64Melee && !enemy.pendingMelee && enemy.attackClock <= 0 && meleeContact()) {
      if (v64Melee.lungeDistance > 0) {
        const currentDistance = targetEntity.x - enemy.x;
        const previousX = enemy.x;
        enemy.x += Math.sign(currentDistance) * Math.min(v64Melee.lungeDistance, Math.max(0, Math.abs(currentDistance) - v64Melee.lungeStop));
        this.resolveEnemyHorizontal(enemy, previousX);
      }
      if (meleeContact() && armEnemyMeleeAttackV64(enemy, target)) {
        this.onEvent({
          type: 'enemy-attack-telegraph',
          enemyId: enemy.id,
          behavior: enemy.behavior,
          targetId: enemy.pendingMeleeTargetId,
          windup: v64Melee.windup
        });
      }
    }
    if (!v64Melee && meleeContact() && enemy.attackClock <= 0) {
      if (enemy.behavior === 'exploder') return void this.detonateEnemy(enemy, target);
      if (target.inVehicle) this.damageVehicle(enemy.damage, enemy.name);
      else {
        this.damagePlayer(target, enemy.damage, { source: enemy.name });
        if (enemy.behavior === 'grappler') target.grappledClock = Math.max(target.grappledClock || 0, 0.8);
      }
      enemy.attackClock = enemy.isBoss
          ? 0.65
          : enemy.behavior === 'pouncer'
            ? 1.1
              : 0.82;
      enemy.attacking = true;
    }
  }

  spawnEnemyProjectile(enemy, target) {
    const direction = Math.sign(target.x - enemy.x) || enemy.facing;
    this.hostileProjectiles.push({
      x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h * 0.42, w: enemy.isBoss ? 24 : 14, h: enemy.isBoss ? 14 : 10,
      vx: direction * (enemy.behavior === 'shooter' ? 520 : 340), damage: enemy.isBoss ? 22 : enemy.behavior === 'spitter' ? 16 : 13,
      life: 2.2, acid: enemy.behavior !== 'shooter', ownerId: enemy.id, hit: false
    });
  }

  updateHostileProjectiles(delta) {
    for (const projectile of this.hostileProjectiles) {
      projectile.x += projectile.vx * delta;
      projectile.life -= delta;
      for (const cover of this.covers) if (!cover.destroyed && overlap(projectile, cover)) projectile.hit = true;
      for (const wall of this.walls) if (!projectile.hit && overlap(projectile, wall)) projectile.hit = true;
      for (const door of this.closedDoorColliders()) if (!projectile.hit && overlap(projectile, door)) projectile.hit = true;
      if (!projectile.hit && this.vehicle?.occupied && overlap(projectile, this.vehicle)) {
        this.damageVehicle(projectile.damage, projectile.acid ? 'acid' : 'projectile');
        projectile.hit = true;
      }
      for (const actor of [this.player, this.coopEnabled ? this.coop : null]) {
        if (projectile.hit || !actor?.alive || actor.inVehicle || !overlap(projectile, actor)) continue;
        this.damagePlayer(actor, projectile.damage, { source: projectile.acid ? 'acid' : 'projectile' });
        projectile.hit = true;
      }
      if (projectile.hit) this.spawnImpact(projectile.x, projectile.y, projectile.acid ? '#a7c742' : '#e3b86c');
    }
    this.hostileProjectiles = this.hostileProjectiles.filter((projectile) => !projectile.hit && projectile.life > 0);
  }

  updatePickups() {
    for (const drop of this.drops) {
      if (drop.taken) continue;
      const actor = [this.player, this.coopEnabled ? this.coop : null].find((candidate) => candidate?.alive && distanceBetween(candidate, drop) < 52);
      if (!actor || drop.type === 'security-key') continue;
      drop.taken = true;
      if (drop.type === 'salvage') this.inventory.salvage += drop.amount;
      if (drop.type === 'ammo') actor.ammoReserve += drop.amount;
      this.onEvent({ type: 'resource', resource: drop.type, amount: drop.amount });
    }
  }

  updateMissionPhase() {
    if (this.powerNode?.active) this.mission.objectives.power = true;
    if (this.inventory.securityKeys > 0 || this.vents.some((vent) => vent.open) || !this.doors.some((door) => door.lockedBy === 'security')) this.mission.objectives.route = true;
    if (!this.enemies.some((enemy) => enemy.isBoss && enemy.alive)) this.mission.objectives.boss = true;
    if (this.archiveTerminal?.recovered || !this.archiveTerminal) this.mission.objectives.archive = true;
    const objectives = this.mission.objectives;
    this.mission.phase = !objectives.power ? 'restore-power'
      : !objectives.route ? 'secure-route'
        : !objectives.boss ? 'neutralize-boss'
          : !objectives.archive ? 'recover-archive'
            : 'extract';
  }

  updateDowned(player, delta) {
    if (!player.downed) return;
    player.bleedOut = Math.max(0, player.bleedOut - delta);
    if (player.bleedOut === 0) {
      player.downed = false;
      this.onEvent({ type: 'marine-lost', coop: player.coop });
    }
  }

  nearestLadder(entity) {
    const center = entity.x + entity.w / 2;
    return this.ladders.find((ladder) => Math.abs(center - ladder.x) < 46 && entity.y + entity.h > ladder.top - 25 && entity.y < ladder.bottom + 20);
  }

  findCover(entity) {
    const center = entity.x + entity.w / 2;
    return this.covers.find((cover) => !cover.destroyed && center > cover.x - 28 && center < cover.x + cover.w + 28 && entity.y + entity.h > cover.y + 12);
  }
  getDoorRenderState(door, { open = door?.progress >= 0.82 } = {}) {
    const art = resolveMissionDoorArtV58({ ...door, open, progress: open ? 1 : 0 });
    const image = this.images.get(art.imageKey);
    const height = Math.max(1, Number(door?.h || 0) + 28);
    const ratio = art.source.w / art.source.h;
    const width = Math.max(82, height * ratio);
    return {
      image,
      open,
      visualRole: art.visualRole,
      source: art.source,
      x: Number(door?.x || 0) + Number(door?.w || 0) / 2 - width / 2,
      y: Number(door?.y || 0) + Number(door?.h || 0) - height,
      w: width,
      h: height
    };
  }

  closedDoorColliders() {
    return this.doors
      .filter((door) => door.progress < 0.82)
      .map((door) => this.getDoorRenderState(door, { open: false }));
  }

  cancelPendingEnemyMeleeV64(enemy, reason = 'target-invalid') {
    if (!enemy?.pendingMelee) return false;
    const targetId = enemy.pendingMeleeTargetId || null;
    const contract = cancelEnemyMeleeAttackV64(enemy);
    if (!contract) return false;
    this.onEvent({
      type: 'enemy-attack-cancelled',
      enemyId: enemy.id,
      behavior: enemy.behavior,
      targetId,
      reason
    });
    return true;
  }

  enemyMeleePathClearV64(enemy, target) {
    const source = getEntityCollisionBounds(enemy);
    const destination = getEntityCollisionBounds(target);
    if (!source || !destination) return false;
    const sourceCenterX = source.x + source.w / 2;
    const destinationCenterX = destination.x + destination.w / 2;
    const movingRight = destinationCenterX >= sourceCenterX;
    const gapStart = movingRight ? source.x + source.w : destination.x + destination.w;
    const gapEnd = movingRight ? destination.x : source.x;
    if (gapEnd <= gapStart) return true;
    const sharedTop = Math.max(source.y, destination.y);
    const sharedBottom = Math.min(source.y + source.h, destination.y + destination.h);
    const strikeY = sharedBottom > sharedTop
      ? (sharedTop + sharedBottom) / 2
      : ((source.y + source.h / 2) + (destination.y + destination.h / 2)) / 2;
    return ![...this.closedDoorColliders(), ...this.walls].some((obstacle) => {
      const bounds = getEntityCollisionBounds(obstacle);
      return bounds
        && bounds.x < gapEnd
        && bounds.x + bounds.w > gapStart
        && strikeY > bounds.y
        && strikeY < bounds.y + bounds.h;
    });
  }


  resolveHorizontal(entity, previousX) {
    for (const obstacle of [...this.closedDoorColliders(), ...this.walls]) {
      if (!overlap(entity, obstacle)) continue;
      if (entity.vx > 0 && previousX + entity.w <= obstacle.x + 8) entity.x = obstacle.x - entity.w;
      else if (entity.vx < 0 && previousX >= obstacle.x + obstacle.w - 8) entity.x = obstacle.x + obstacle.w;
      entity.vx = 0;
    }
    for (const cover of this.covers) {
      if (cover.destroyed || !overlap(entity, cover)) continue;
      if (entity.vx > 0 && previousX + entity.w <= cover.x + 7) entity.x = cover.x - entity.w;
      else if (entity.vx < 0 && previousX >= cover.x + cover.w - 7) entity.x = cover.x + cover.w;
    }
  }

  resolveEnemyHorizontal(enemy, previousX) {
    const previousVelocity = enemy.facing * enemy.speed;
    enemy.vx = previousVelocity;
    this.resolveHorizontal(enemy, previousX);
    enemy.vx = 0;
  }

  resolveVehicleHorizontal(previousX) {
    for (const obstacle of [...this.closedDoorColliders(), ...this.walls]) {
      if (!overlap(this.vehicle, obstacle)) continue;
      if (this.vehicle.vx > 0 && previousX + this.vehicle.w <= obstacle.x + 12) this.vehicle.x = obstacle.x - this.vehicle.w;
      else if (this.vehicle.vx < 0 && previousX >= obstacle.x + obstacle.w - 12) this.vehicle.x = obstacle.x + obstacle.w;
      this.vehicle.vx = 0;
    }
  }

  resolveVertical(entity, previousBottom) {
    for (const platform of this.platforms) {
      const { surfaceY } = getMissionSurfaceMetrics(platform);
      const horizontal = entity.x + entity.w > platform.x + 4 && entity.x < platform.x + platform.w - 4;
      if (horizontal && entity.vy >= 0 && previousBottom <= surfaceY + 12 && entity.y + entity.h >= surfaceY) {
        entity.y = surfaceY - entity.h;
        entity.vy = 0;
        entity.grounded = true;
      }
    }
  }

  weaponProfile(player) {
    if (player.inVehicle && this.vehicle?.occupied) return { mode: 'apc-turret', damage: 58, interval: 0.17, spread: 0, ammo: this.vehicle.turretAmmo };
    if (player.weaponMode === 'rifle') return { mode: 'rifle', damage: Math.max(24, Number(this.weapon?.damage) || 26), interval: 0.13, spread: 0, ammo: player.ammo };
    return { mode: 'sidearm', damage: 16, interval: 0.28, spread: 0, ammo: player.ammo };
  }
  setInteractionAnimation(actor, kind = 'control-use', duration = 0.65) {
    if (!actor) return false;
    actor.interactionKind = kind;
    actor.interactionClock = Math.max(Number(actor.interactionClock) || 0, duration);
    actor.actionClock = Math.max(Number(actor.actionClock) || 0, duration);
    return true;
  }

  setToolAnimation(actor, toolId = 'motion-tracker', duration = 0.7) {
    if (!actor) return false;
    actor.toolId = toolId;
    actor.toolUseClock = Math.max(Number(actor.toolUseClock) || 0, duration);
    actor.actionClock = Math.max(Number(actor.actionClock) || 0, duration);
    return true;
  }

  performContextualMelee(player) {
    if (!player || player.inVehicle || (player.meleeClock || 0) > 0) return false;
    const playerCenterX = player.x + player.w / 2;
    const playerCenterY = player.y + player.h / 2;
    const target = this.enemies
      .filter((enemy) => enemy.alive
        && Math.abs((enemy.x + enemy.w / 2) - playerCenterX) <= 92
        && Math.abs((enemy.y + enemy.h / 2) - playerCenterY) <= 96)
      .sort((left, right) => distanceBetween(player, left) - distanceBetween(player, right))[0];
    if (!target) return false;
    player.facing = Math.sign((target.x + target.w / 2) - playerCenterX) || player.facing || 1;
    player.meleeKind = player.weaponMode === 'rifle' ? 'rifle-bash' : 'knife-attack';
    player.meleeClock = player.meleeKind === 'rifle-bash' ? 0.48 : 0.42;
    player.fireClock = player.meleeClock;
    player.actionClock = player.meleeClock;
    const damage = player.meleeKind === 'rifle-bash' ? 34 : 22;
    this.applyEnemyDamage(target, damage, {
      owner: player,
      kind: player.meleeKind,
      x: target.x + target.w / 2,
      y: target.y + target.h * 0.48
    });
    this.onEvent({ type: 'melee', attack: player.meleeKind, target: target.id, damage });
    return true;
  }

  fire(player) {
    if (!player?.alive || player.fireClock > 0 || player.reloading || this.paused || this.mission?.state !== 'active') return false;
    if (this.performContextualMelee(player)) return true;
    const profile = this.weaponProfile(player);
    if (profile.ammo <= 0) { this.reload(player); return false; }
    player.fireClock = profile.interval;
    player.actionClock = 0.22;
    player.shots += 1;
    if (profile.mode === 'apc-turret') this.vehicle.turretAmmo -= 1;
    else player.ammo -= 1;
    const origin = profile.mode === 'apc-turret'
      ? { x: this.vehicle.x + this.vehicle.w / 2 + player.facing * 62, y: this.vehicle.y + 28 }
      : { x: player.x + player.w / 2 + player.facing * 24, y: player.y + (player.crouching ? 51 : 37) };
    this.bullets.push({
      ...origin, w: profile.mode === 'apc-turret' ? 26 : 18, h: profile.mode === 'apc-turret' ? 7 : 5,
      vx: player.facing * (profile.mode === 'apc-turret' ? 1100 : 890), damage: profile.damage,
      owner: player, kind: profile.mode, life: 1.25, hit: false
    });
    for (const enemy of this.enemies) if (enemy.alive && Math.abs(enemy.x - origin.x) < 760) enemy.alert = true;
    this.audio?.shot();
    this.onEvent({ type: 'shot', weapon: profile.mode });
    return true;
  }

  reload(player) {
    if (!player?.alive || player.inVehicle || player.reloading || player.ammo >= player.magazineSize || player.ammoReserve <= 0) return false;
    player.reloading = true;
    player.reloadClock = player.weaponMode === 'rifle' ? 1.45 : 1.1;
    player.actionClock = player.reloadClock;
    this.onEvent({ type: 'reload', coop: player.coop });
    return true;
  }

  finishReload(player) {
    const needed = player.magazineSize - player.ammo;
    const loaded = Math.min(needed, player.ammoReserve);
    player.ammo += loaded;
    player.ammoReserve -= loaded;
    player.reloadClock = 0;
    player.reloading = false;
  }

  useMedkit(player) {
    if (!player?.alive || this.inventory.medkits <= 0 || player.health >= player.maxHealth) return false;
    this.inventory.medkits -= 1;
    player.health = Math.min(player.maxHealth, player.health + 48);
    player.actionClock = 0.65;
    this.setInteractionAnimation(player, 'ground-interact', 0.65);
    this.onEvent({ type: 'resource-used', resource: 'medkit', coop: player.coop });
    return true;
  }

  activateTracker(player) {
    if (!player?.alive || this.tracker.cooldown > 0 || this.tracker.energy < TRACKER_COST || this.mission?.state !== 'active') return false;
    this.tracker.energy -= TRACKER_COST;
    this.tracker.cooldown = 2.1;
    this.tracker.pulses += 1;
    this.trackerPulse = 1;
    this.setToolAnimation(player, 'motion-tracker', 0.7);
    const contacts = this.enemies.filter((enemy) => enemy.alive && distanceBetween(player, enemy) < 900);
    for (const enemy of contacts) {
      enemy.revealed = 4;
      if (distanceBetween(player, enemy) < 360) enemy.alert = true;
    }
    this.tracker.contacts = contacts.map((enemy) => ({ id: enemy.id, x: Math.round(enemy.x), y: Math.round(enemy.y), threat: enemy.isBoss ? 'boss' : enemy.behavior }));
    this.audio?.tracker();
    this.onEvent({ type: 'tracker', contacts: this.tracker.contacts.length, energy: this.tracker.energy });
    return true;
  }

  applyEnemyDamage(enemy, rawDamage, source = {}) {
    if (!enemy?.alive) return 0;
    const damage = Math.max(1, rawDamage - enemy.armor * 0.35);
    enemy.health -= damage;
    enemy.alert = true;
    enemy.revealed = Math.max(enemy.revealed, 0.45);
    enemy.staggerClock = source.kind === 'ram' ? 0.7 : 0.12;
    enemy.hurtClock = Math.max(enemy.hurtClock || 0, 0.24);
    this.spawnImpact(source.x || enemy.x, source.y || enemy.y + enemy.h * 0.45, enemy.biology === 'xenomorph' ? '#a7c742' : '#dc8a62');
    this.audio?.hit();
    if (enemy.health <= 0) this.defeatEnemy(enemy, source.owner);
    return damage;
  }

  defeatEnemy(enemy, owner = this.player) {
    if (!enemy.alive) return;
    enemy.health = 0;
    enemy.alive = false;
    enemy.deathClock = 2.8;
    if (owner) owner.kills += 1;
    this.drops.push({ id: `salvage-${enemy.id}`, type: 'salvage', amount: enemy.reward, x: enemy.x, y: enemy.y + enemy.h - 20, w: 24, h: 20, taken: false });
    if (enemy.keyCarrier) this.drops.push({ id: `key-${enemy.id}`, type: 'security-key', amount: 1, x: enemy.x + 18, y: enemy.y + enemy.h - 30, w: 32, h: 30, taken: false });
    if (!enemy.isBoss && this.random() < 0.22) this.drops.push({ id: `ammo-${enemy.id}`, type: 'ammo', amount: 8, x: enemy.x + 8, y: enemy.y + enemy.h - 20, w: 24, h: 20, taken: false });
    if (enemy.isBoss) {
      this.mission.objectives.boss = true;
      this.setCheckpoint('containment', enemy.x - 140, FLOOR_Y - this.player.h);
      this.onEvent({ type: 'boss-defeated', enemy });
    }
    this.onEvent({ type: 'kill', enemy });
  }

  spawnImpact(x, y, color) {
    for (let index = 0; index < 8; index += 1) this.particles.push({ x, y, vx: (index - 3.5) * 38, vy: -45 - (index % 3) * 28, life: 0.3 + index * 0.02, color });
  }

  damagePlayer(player, amount, { bypassCover = false, source = 'enemy' } = {}) {
    if (!player?.alive) return 0;
    if (player.inVehicle && this.vehicle?.active) return this.damageVehicle(amount, source);
    const covered = player.inCover && !bypassCover;
    const adjusted = covered ? amount * 0.35 : amount;
    if (covered) player.damageBlocked += amount - adjusted;
    const absorbed = Math.min(player.armor, adjusted * 0.55);
    player.armor -= absorbed;
    const healthDamage = adjusted - absorbed;
    player.health -= healthDamage;
    player.damageTaken += healthDamage;
    player.actionClock = 0.35;
    if (player.health <= 0) this.downPlayer(player, source);
    return healthDamage;
  }

  downPlayer(player, source) {
    player.health = 0;
    player.alive = false;
    player.downed = true;
    player.bleedOut = 18;
    player.inVehicle = false;
    if (this.vehicle?.driver === player) this.ejectVehicleOccupants();
    this.mission.casualties += 1;
    this.onEvent({ type: 'player-down', coop: player.coop, source, revivable: this.coopEnabled });
    if (!this.coopEnabled || ![this.player, this.coop].some((actor) => actor.alive)) this.failMission('marine-a-terre');
  }

  revive(actor, target) {
    if (!actor?.alive || !target?.downed || distanceBetween(actor, target) > REVIVE_RANGE) return false;
    target.alive = true;
    target.downed = false;
    target.bleedOut = 0;
    target.health = 38;
    target.armor = 0;
    target.actionClock = 0.8;
    this.onEvent({ type: 'marine-revived', coop: target.coop });
    return true;
  }

  damageVehicle(amount, source = 'enemy') {
    if (!this.vehicle?.active || this.vehicle.destroyed) return 0;
    this.vehicle.hull = Math.max(0, this.vehicle.hull - amount);
    this.onEvent({ type: 'vehicle-damaged', amount, hull: this.vehicle.hull, source });
    if (this.vehicle.hull === 0) {
      this.vehicle.destroyed = true;
      const riders = [this.player, this.coop].filter((actor) => actor?.inVehicle);
      this.ejectVehicleOccupants();
      for (const rider of riders) this.damagePlayer(rider, 35, { bypassCover: true, source: 'vehicle-destroyed' });
      this.onEvent({ type: 'vehicle-destroyed' });
    }
    return amount;
  }

  applyHazards(player) {
    if (!player.alive || player.inVehicle || player.hazardClock > 0) return;
    const feet = { x: player.x + 6, y: player.y + player.h - 14, w: player.w - 12, h: 14 };
    const hazard = this.hazards.find((candidate) => candidate.active && overlap(feet, candidate));
    if (!hazard) return;
    const kind = hazard.kind || 'acid';
    player.hazardKind = kind;
    if ((Number(hazard.damage) || 0) > 0) this.damagePlayer(player, hazard.damage, { bypassCover: true, source: kind });
    player.hazardClock = Math.max(0.72, Number(hazard.stun) || Number(hazard.stunSeconds) || 0);
    if (kind === 'electrical') {
      player.vx = 0;
      player.actionClock = Math.max(player.actionClock || 0, player.hazardClock);
      player.vy = -120;
    } else if (kind === 'steam') player.vy = -240;
    else if (kind === 'flood') player.vx *= 0.45;
    else if (kind === 'vacuum') player.vx *= 1.35;
  }

  interact(actor = this.player) {
    if (!actor || (actor.coop && !this.coopEnabled) || this.mission?.state !== 'active') return false;
    const ally = actor === this.player ? this.coop : this.player;
    if (this.coopEnabled && this.revive(actor, ally)) return true;
    const playerCenter = actor.x + actor.w / 2;
    const keyDrop = this.drops.find((drop) => !drop.taken && drop.type === 'security-key' && distanceBetween(actor, drop) < 100);
    if (keyDrop) {
      keyDrop.taken = true;
      this.inventory.securityKeys += 1;
      this.mission.objectives.route = true;
      this.setCheckpoint('security', actor.x, actor.y);
      this.onEvent({ type: 'resource', resource: 'security-key', amount: 1 });
      this.audio?.ui();
      this.setInteractionAnimation(actor, 'ground-interact', 0.55);
      return true;
    }
    const supply = this.supplies.find((candidate) => !candidate.used && distanceBetween(actor, candidate) < 105);
    if (supply) return this.collectSupply(actor, supply);
    if (!this.weaponPickup.taken && distanceBetween(actor, this.weaponPickup) < 118) {
      this.weaponPickup.taken = true;
      actor.weaponMode = 'rifle';
      actor.magazineSize = MAGAZINE_SIZE;
      actor.ammo = MAGAZINE_SIZE;
      actor.ammoReserve += 60;
      this.setInteractionAnimation(actor, 'ground-interact', 0.65);
      this.onEvent({ type: 'supply', item: 'M41A', amount: 60 });
      this.audio?.ui();
      return true;
    }
    if (!this.toolPickup.taken && distanceBetween(actor, this.toolPickup) < 105) {
      this.toolPickup.taken = true;
      this.inventory.cutter = true;
      this.setInteractionAnimation(actor, 'ground-interact', 0.65);
      this.onEvent({ type: 'supply', item: 'CHALUMEAU', amount: 1 });
      this.audio?.ui();
      return true;
    }
    if (this.powerNode && !this.powerNode.active && distanceBetween(actor, this.powerNode) < 130) {
      this.powerNode.active = true;
      this.mission.objectives.power = true;
      this.setCheckpoint('power', actor.x, actor.y);
      this.setInteractionAnimation(actor, 'control-use', 0.8);
      this.onEvent({ type: 'power-restored' });
      this.audio?.ui();
      return true;
    }
    if (this.archiveTerminal && !this.archiveTerminal.recovered && distanceBetween(actor, this.archiveTerminal) < 130) {
      if (!this.mission.objectives.boss) return this.locked('NEUTRALISER LA MENACE ALPHA');
      this.archiveTerminal.recovered = true;
      this.mission.objectives.archive = true;
      this.inventory.intel += 3;
      this.setCheckpoint('archive', actor.x, actor.y);
      this.setInteractionAnimation(actor, 'control-use', 0.85);
      this.onEvent({ type: 'archive-recovered', intel: 3 });
      this.audio?.ui();
      return true;
    }
    const vent = this.vents.find((candidate) => distanceBetween(actor, candidate) < 125);
    if (vent) {
      if (vent.requiresTool && !this.inventory.cutter) return this.locked('CHALUMEAU DE MAINTENANCE REQUIS');
      this.setToolAnimation(actor, 'cutting-torch', 0.95);
      vent.open = true;
      actor.x = vent.targetX;
      actor.y = vent.targetY;
      this.mission.objectives.route = true;
      this.setCheckpoint('vent', actor.x, actor.y);
      this.onEvent({ type: 'shortcut' });
      this.audio?.ui();
      return true;
    }
    const door = this.doors.find((candidate) => Math.abs(playerCenter - (candidate.x + candidate.w / 2)) < 118 && Math.abs(actor.y - candidate.y) < candidate.h + 60);
    if (door) {
      const requirement = this.doorRequirement(door);
      if (requirement) return this.locked(requirement);
      door.open = !door.open;
      if (door.lockedBy) this.setToolAnimation(actor, 'access-tuner', 0.7);
      else this.setInteractionAnimation(actor, 'force-interact', 0.7);
      this.onEvent({ type: 'door', doorId: door.id, open: door.open });
      this.audio?.ui();
      return true;
    }
    if (this.objective && distanceBetween(actor, this.objective) < 125) {
      const missing = this.missingExtractionRequirement();
      if (missing) return this.locked(missing);
      this.setInteractionAnimation(actor, 'control-use', 0.7);
      this.completeMission(actor);
      return true;
    }
    if (this.vehicle?.active && distanceBetween(actor, this.vehicle) < 210) return this.toggleVehicle(actor);
    return false;
  }

  locked(requirement) {
    this.onEvent({ type: 'locked', requirement });
    this.audio?.alarm();
    return false;
  }

  collectSupply(actor, supply) {
    supply.used = true;
    this.setInteractionAnimation(actor, 'ground-interact', 0.55);
    if (supply.type === 'medkit') this.inventory.medkits += supply.amount;
    if (supply.type === 'armor') actor.armor = Math.min(actor.maxArmor, actor.armor + supply.amount);
    if (supply.type === 'ammo') actor.ammoReserve += supply.amount;
    this.onEvent({ type: 'resource', resource: supply.type, amount: supply.amount });
    this.audio?.ui();
    return true;
  }

  doorRequirement(door) {
    if (door.lockedBy === 'power' && !this.mission.objectives.power) return 'RÉTABLIR LE CIRCUIT AUXILIAIRE';
    if (door.lockedBy === 'security' && !this.mission.objectives.route) return 'BADGE DE SÉCURITÉ OU CONDUIT REQUIS';
    if (door.lockedBy === 'boss' && !this.mission.objectives.boss) return 'SIGNATURE ALPHA ENCORE ACTIVE';
    return '';
  }

  missingExtractionRequirement() {
    const objectives = this.mission.objectives;
    if (!objectives.power) return 'ALIMENTATION AUXILIAIRE MANQUANTE';
    if (!objectives.route) return 'ROUTE DE SÉCURITÉ NON VALIDÉE';
    if (!objectives.boss) return 'MENACE ALPHA ENCORE ACTIVE';
    if (!objectives.archive) return 'ARCHIVE DE RECHERCHE NON RÉCUPÉRÉE';
    return '';
  }

  toggleVehicle(actor = this.player) {
    if (!actor?.alive || !this.vehicle?.active || this.vehicle.destroyed) return false;
    this.setInteractionAnimation(actor, 'force-interact', 0.55);
    if (actor.inVehicle) {
      actor.inVehicle = false;
      actor.x = clamp(this.vehicle.x + this.vehicle.w + 18, 0, WORLD_WIDTH - actor.w);
      actor.y = this.vehicle.y + this.vehicle.h - actor.h;
      if (this.vehicle.driver === actor) {
        this.vehicle.driver = null;
        const replacement = [this.player, this.coop].find((rider) => rider?.inVehicle);
        if (replacement) this.vehicle.driver = replacement;
      }
      this.vehicle.passengers = this.vehicle.passengers.filter((rider) => rider !== actor);
    } else {
      if (distanceBetween(actor, this.vehicle) > 220) return false;
      actor.inVehicle = true;
      if (!this.vehicle.driver) this.vehicle.driver = actor;
      else this.vehicle.passengers.push(actor);
    }
    this.vehicle.occupied = Boolean(this.vehicle.driver);
    this.audio?.ui();
    this.onEvent({ type: 'vehicle', occupied: this.vehicle.occupied, coop: actor.coop });
    return true;
  }

  ejectVehicleOccupants() {
    for (const actor of [this.player, this.coop]) {
      if (!actor?.inVehicle) continue;
      actor.inVehicle = false;
      actor.x = clamp(this.vehicle.x + this.vehicle.w + (actor.coop ? 54 : 12), 0, WORLD_WIDTH - actor.w);
      actor.y = this.vehicle.y + this.vehicle.h - actor.h;
    }
    this.vehicle.driver = null;
    this.vehicle.passengers = [];
    this.vehicle.occupied = false;
  }

  setCheckpoint(id, x, y) {
    this.checkpoint = { id, x: clamp(x, 20, WORLD_WIDTH - 80), y: clamp(y, 0, WORLD_HEIGHT - this.player.h) };
    this.onEvent({ type: 'checkpoint', checkpoint: id });
  }

  failMission(reason) {
    if (this.mission.state !== 'active') return;
    this.mission.state = 'failed';
    this.mission.failureReason = reason;
    this.hostileProjectiles = [];
    this.onEvent({ type: 'mission-failed', reason, checkpoint: this.checkpoint.id });
  }

  restartFromCheckpoint() {
    if (this.mission?.state !== 'failed') return false;
    this.mission.state = 'active';
    this.mission.failureReason = null;
    this.mission.retries += 1;
    this.inventory.salvage = Math.max(0, this.inventory.salvage - 20);
    for (const [index, actor] of [this.player, this.coop].entries()) {
      actor.alive = true;
      actor.downed = false;
      actor.bleedOut = 0;
      actor.health = index === 0 ? 55 : 45;
      actor.armor = 0;
      actor.ammo = Math.max(6, Math.min(actor.magazineSize, actor.ammo));
      actor.x = this.checkpoint.x - index * 52;
      actor.y = this.checkpoint.y;
      actor.vx = 0;
      actor.vy = 0;
      actor.inVehicle = false;
    }
    if (this.vehicle?.active) this.ejectVehicleOccupants();
    this.hostileProjectiles = [];
    this.onEvent({ type: 'mission-restarted', checkpoint: this.checkpoint.id, salvagePenalty: 20 });
    return true;
  }

  completeMission(actor) {
    if (this.mission.state !== 'active' || this.missingExtractionRequirement()) return false;
    this.objective.complete = true;
    this.mission.objectives.extract = true;
    this.mission.state = 'complete';
    const kills = this.player.kills + this.coop.kills;
    const vehicleRecovered = Boolean(this.vehicle?.active && !this.vehicle.destroyed && Math.abs(this.vehicle.x - this.objective.x) < 520);
    const noCasualty = this.mission.casualties === 0;
    const rewards = {
      credits: 480 + kills * 12 + (vehicleRecovered ? 100 : 0) + (noCasualty ? 120 : 0),
      salvage: this.inventory.salvage + (vehicleRecovered ? 20 : 0),
      intel: this.inventory.intel,
      vehicleRecovered,
      noCasualty,
      retries: this.mission.retries,
      elapsedSeconds: Math.round(this.mission.elapsed)
    };
    this.mission.rewards = rewards;
    this.onEvent({ type: 'mission-complete', kills, rewards, extractedBy: actor.coop ? 'coop' : 'primary' });
    return true;
  }

  draw() {
    const ctx = this.ctx;
    const scaleX = this.canvas.width / LOGICAL_WIDTH;
    const scaleY = this.canvas.height / LOGICAL_HEIGHT;
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    this.drawBackdrop(ctx);
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    this.drawWorld(ctx);
    ctx.restore();
    this.drawForeground(ctx);
    this.drawHud(ctx);
    if (this.paused || this.enemyAtlasLoadingPausedV65 || this.mission?.state === 'failed' || this.mission?.state === 'complete') this.drawStateOverlay(ctx);
    ctx.restore();
  }

  drawCoverLayer(ctx, image, factorX, factorY, alpha, overscan = 1.08, yOffset = 0) {
    if (!ready(image)) return;
    const height = LOGICAL_HEIGHT * overscan;
    const width = image.naturalWidth * (height / image.naturalHeight);
    const offsetX = -((this.camera.x * factorX) % width);
    const offsetY = -this.camera.y * factorY - (height - LOGICAL_HEIGHT) * 0.5 + yOffset;
    ctx.globalAlpha = alpha;
    for (let x = offsetX - width; x < LOGICAL_WIDTH + width; x += width) ctx.drawImage(image, x, offsetY, width, height);
    ctx.globalAlpha = 1;
  }

  usesShipStructuralProps() {
    return !this.missionLevelRuntime || this.missionLevelRuntime.templateId === 'ship-interior-vertical';
  }

  drawRepeatedMissionProp(ctx, key, { height, y, factor, alpha, gap = 72 }) {
    if (!this.usesShipStructuralProps()) return 0;
    const image = this.images.get(key);
    if (!ready(image)) return 0;
    const width = image.naturalWidth * (height / image.naturalHeight);
    const spacing = Math.max(40, width + gap);
    const offset = -(((this.camera?.x || 0) * factor) % spacing);
    let draws = 0;
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let x = offset - spacing; x < LOGICAL_WIDTH + spacing; x += spacing) {
      ctx.drawImage(image, x, y, width, height);
      draws += 1;
    }
    ctx.restore();
    return draws;
  }

  drawCeilingCables(ctx) {
    return this.drawRepeatedMissionProp(ctx, 'ceilingCables', {
      height: 132, y: -18, factor: 0.64, alpha: 0.56, gap: 72
    });
  }

  drawForegroundPipes(ctx) {
    return this.drawRepeatedMissionProp(ctx, 'foregroundPipes', {
      height: 205, y: LOGICAL_HEIGHT - 190, factor: 1.18, alpha: 0.4, gap: 112
    });
  }

  drawMaintenancePipes(ctx) {
    if (!this.usesShipStructuralProps()) return 0;
    const image = this.images.get('maintenancePipe');
    if (!ready(image)) return 0;
    const anchors = this.platforms
      .filter((platform) => !platform.floor)
      .filter((_, index) => index % 4 === 1)
      .slice(0, 10);
    const height = 176;
    const width = image.naturalWidth * (height / image.naturalHeight);
    ctx.save();
    ctx.globalAlpha = 0.78;
    for (const platform of anchors) {
      const x = platform.x + Math.max(8, (platform.w - width) * 0.5);
      const { surfaceY } = getMissionSurfaceMetrics(platform);
      const baseline = surfaceY + Math.min(18, platform.h || 0);
      ctx.drawImage(image, x, baseline - height, width, height);
    }
    ctx.restore();
    return anchors.length;
  }

  drawBackdrop(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    gradient.addColorStop(0, '#020608');
    gradient.addColorStop(0.62, '#07100f');
    gradient.addColorStop(1, '#111612');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    const far = this.images.get('far');
    const mid = this.images.get('mid');
    if (ready(far)) this.drawCoverLayer(ctx, far, 0.09, 0.04, 0.9, 1.12);
    else if (ready(this.fallbackBackground)) this.drawCoverLayer(ctx, this.fallbackBackground, 0.08, 0.04, 0.28, 1.08);
    this.drawCoverLayer(ctx, mid, 0.42, 0.18, 0.78, 1.14, 90);
    const vignette = ctx.createRadialGradient(640, 350, 190, 640, 350, 760);
    this.drawCeilingCables(ctx);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,3,4,.62)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  getVisibleEnemiesV65() {
    return this.enemies.filter((enemy) => {
      if (enemy.dormant || (!enemy.alive && !(enemy.deathClock > 0))) return false;
      if (!this.camera) return true;
      const request = resolveEnemyAnimation(enemy);
      const sheet = resolveSpriteSheet(request?.sheetId || enemy.visualSheetId);
      const width = Math.max(Number(enemy.w) || 0, sheet?.renderWidth || 224);
      const height = Math.max(Number(enemy.h) || 0, sheet?.renderHeight || 170);
      const left = enemy.x + enemy.w / 2 - width / 2;
      const top = enemy.y + enemy.h - height;
      return left + width >= this.camera.x - 64 && left <= this.camera.x + LOGICAL_WIDTH + 64
        && top + height >= this.camera.y - 64 && top <= this.camera.y + LOGICAL_HEIGHT + 64;
    });
  }

  getVisibleEnemyAtlasSheetsV65(visibleEnemies = this.getVisibleEnemiesV65()) {
    return [
      ...visibleEnemies.map((enemy) => resolveSpriteSheet(resolveEnemyAnimation(enemy)?.sheetId || enemy.visualSheetId)),
      ...[this.player, this.coopEnabled ? this.coop : null]
        .filter((actor) => actor?.neuroVisualContract?.sheetId)
        .map((actor) => resolveSpriteSheet(actor.neuroVisualContract.sheetId))
    ].filter((sheet) => sheet?.family === 'enemy');
  }

  refreshEnemyAtlasAvailabilityV65() {
    const loader = this.enemyAtlasLRUV65;
    if (!loader) return;
    const sheets = this.getVisibleEnemyAtlasSheetsV65();
    loader.setWorkingSet(sheets);
    const unavailable = sheets.filter((sheet) => {
      const record = loader.recordStatus(sheet);
      return record && record.status !== 'ready' && record.consecutiveFailures > 0;
    });
    // Continuer les essais pendant la pause réseau, indépendamment de P/Échap.
    // La simulation ne redémarre qu'après chargement, sans retirer la pause utilisateur.
    for (const sheet of unavailable) void this.ensureEnemyAtlas(sheet);
    this.enemyAtlasLoadingPausedV65 = unavailable.length > 0;
  }

  drawWorld(ctx) {
    const visibleEnemies = this.getVisibleEnemiesV65();
    this.enemyAtlasLRUV65?.setWorkingSet(this.getVisibleEnemyAtlasSheetsV65(visibleEnemies));
    this.drawFloors(ctx);
    this.drawMaintenancePipes(ctx);
    for (const platform of this.platforms.filter((item) => !item.floor)) this.drawPlatform(ctx, platform);
    for (const wall of this.walls) this.drawWall(ctx, wall);
    for (const ladder of this.ladders) this.drawLadder(ctx, ladder);
    for (const cover of this.covers) if (!cover.destroyed) this.drawWorldProp(ctx, cover.art, cover.x, cover.y + cover.h, cover.h, cover.w);
    for (const hazard of this.hazards) this.drawHazard(ctx, hazard);
    for (const vent of this.vents) this.drawWorldProp(ctx, 'vent', vent.x, vent.y + vent.h, vent.h, vent.w);
    for (const supply of this.supplies) if (!supply.used) this.drawResource(ctx, supply);
    for (const drop of this.drops) if (!drop.taken) this.drawDrop(ctx, drop);
    this.drawPowerNode(ctx);
    this.drawArchiveTerminal(ctx);
    for (const door of this.doors) this.drawDoor(ctx, door);
    this.drawVehicle(ctx);
    this.drawWeaponPickup(ctx);
    this.drawToolPickup(ctx);
    if (!this.player.inVehicle) this.drawActor(ctx, this.player);
    if (this.coopEnabled && !this.coop.inVehicle) this.drawActor(ctx, this.coop);
    for (const enemy of visibleEnemies) this.drawEnemy(ctx, enemy);
    for (const bullet of this.bullets) this.drawBullet(ctx, bullet);
    for (const projectile of this.hostileProjectiles) this.drawHostileProjectile(ctx, projectile);
    for (const particle of this.particles) {
      ctx.globalAlpha = clamp(particle.life * 3, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, 4, 4);
    }
    ctx.globalAlpha = 1;
    this.drawObjective(ctx);
  }

  drawFloors(ctx) {
    const image = this.images.get('floor');
    for (const floor of this.platforms.filter((platform) => platform.floor)) {
      const metrics = getMissionSurfaceMetrics(floor);
      ctx.fillStyle = '#121a18';
      ctx.fillRect(floor.x, metrics.surfaceY, floor.w, Math.max(floor.h, 52));
      if (!ready(image)) continue;
      const width = image.naturalWidth * (metrics.renderHeight / image.naturalHeight);
      ctx.save();
      ctx.beginPath();
      ctx.rect(floor.x, metrics.renderY, floor.w, metrics.renderHeight);
      ctx.clip();
      for (let x = floor.x; x < floor.x + floor.w + width; x += width - 4) {
        ctx.drawImage(image, x, metrics.renderY, width, metrics.renderHeight);
      }
      ctx.restore();
    }
  }

  drawPlatform(ctx, platform) {
    const image = this.images.get(platform.art);
    const metrics = getMissionSurfaceMetrics(platform);
    ctx.fillStyle = '#19231f';
    ctx.fillRect(platform.x, metrics.surfaceY, platform.w, platform.h);
    if (!ready(image)) return;
    const width = image.naturalWidth * (metrics.renderHeight / image.naturalHeight);
    ctx.save();
    ctx.beginPath();
    ctx.rect(platform.x, metrics.renderY, platform.w, metrics.renderHeight + 12);
    ctx.clip();
    for (let x = platform.x; x < platform.x + platform.w + width; x += Math.max(24, width - 8)) ctx.drawImage(image, x, metrics.renderY, width, metrics.renderHeight);
    ctx.restore();
  }

  drawWall(ctx, wall) {
    ctx.fillStyle = '#18201e';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    this.drawWorldProp(ctx, wall.art || 'breakable', wall.x, wall.y + wall.h, wall.h, wall.w);
  }

  drawLadder(ctx, ladder) {
    const image = this.images.get('ladder');
    const height = ladder.bottom - ladder.top;
    if (!ready(image)) { ctx.fillStyle = '#786a51'; ctx.fillRect(ladder.x - 18, ladder.top, 36, height); return; }
    const width = 58;
    const unitHeight = image.naturalHeight * (width / image.naturalWidth);
    ctx.save();
    ctx.beginPath();
    ctx.rect(ladder.x - width / 2, ladder.top, width, height);
    ctx.clip();
    for (let y = ladder.top; y < ladder.bottom; y += unitHeight - 8) ctx.drawImage(image, ladder.x - width / 2, y, width, unitHeight);
    ctx.restore();
  }

  drawWorldProp(ctx, key, x, baseline, maxHeight, fallbackWidth) {
    const image = this.images.get(key);
    if (!ready(image)) return;
    const height = maxHeight;
    const naturalWidth = image.naturalWidth * (height / image.naturalHeight);
    const width = Math.min(fallbackWidth || naturalWidth, naturalWidth);
    ctx.drawImage(image, x + ((fallbackWidth || width) - width) / 2, baseline - height, width, height);
  }

  drawAtlasFrame(ctx, descriptor, frame, x, y, width, height) {
    const image = descriptor && this.images.get(descriptor.key);
    if (!descriptor || !ready(image)) return false;
    const columns = Math.max(1, descriptor.columns || 1);
    const rows = Math.max(1, descriptor.rows || 1);
    const safeFrame = Math.abs(Math.floor(frame || 0)) % Math.max(1, descriptor.frameCount || columns * rows);
    const cellWidth = image.naturalWidth / columns;
    const cellHeight = image.naturalHeight / rows;
    const column = safeFrame % columns;
    const row = Math.floor(safeFrame / columns);
    ctx.drawImage(
      image,
      column * cellWidth, row * cellHeight, cellWidth, cellHeight,
      x, y, width, height
    );
    return true;
  }

  drawHazard(ctx, hazard) {
    if (!hazard.active) return;
    const profile = resolveMissionHazardArtV56(hazard.kind);
    if (profile) {
      const frame = this.reducedMotion
        ? 0
        : Math.floor(this.animationTime * profile.fps + Math.abs(hazard.x) * 0.01);
      const height = Math.max(hazard.h + 34, profile.renderHeight);
      const y = hazard.y + hazard.h - height;
      ctx.save();
      if (hazard.kind === 'darkness') ctx.globalAlpha = 0.72;
      const drawn = this.drawAtlasFrame(ctx, profile.world, frame, hazard.x, y, hazard.w, height);
      if (drawn && profile.accent) {
        const accentHeight = Math.max(48, height * 0.62);
        this.drawAtlasFrame(ctx, profile.accent, frame, hazard.x, hazard.y + hazard.h - accentHeight, hazard.w, accentHeight);
      }
      ctx.restore();
      if (drawn) return;
    }
    const electrical = hazard.kind === 'electrical';
    const image = this.images.get(electrical ? 'electricalArc' : 'acid');
    if (ready(image)) ctx.drawImage(image, hazard.x, hazard.y - 22, hazard.w, hazard.h + 34);
    else { ctx.fillStyle = electrical ? '#65bddd' : '#7e9b37'; ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h); }
  }

  drawHazardForegroundOverlays(ctx) {
    const actor = this.player;
    const vacuum = this.hazards?.find((hazard) => {
      if (!hazard.active || hazard.kind !== 'vacuum') return false;
      if (!actor) return true;
      const actorCenter = actor.x + actor.w / 2;
      const hazardCenter = hazard.x + hazard.w / 2;
      return Math.abs(actorCenter - hazardCenter) < Math.max(900, hazard.w * 3);
    });
    const profile = vacuum && resolveMissionHazardArtV56('vacuum');
    const image = profile?.foreground && this.images.get(profile.foreground.key);
    if (!vacuum || !ready(image)) return 0;
    ctx.save();
    ctx.globalAlpha = this.reducedMotion ? 0.34 : 0.42 + Math.sin(this.animationTime * 2.4) * 0.08;
    ctx.drawImage(image, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.restore();
    return 1;
  }

  drawResource(ctx, supply) {
    const descriptor = resolveMissionDropArtV56(supply.type);
    const frame = this.reducedMotion ? 0 : Math.floor(this.animationTime * 4 + supply.x * 0.01) % 4;
    const width = Math.max(supply.w, supply.type === 'armor' ? 60 : 54);
    const height = Math.max(supply.h, supply.type === 'armor' ? 58 : 52);
    const x = supply.x + supply.w / 2 - width / 2;
    const y = supply.y + supply.h - height + (this.reducedMotion ? 0 : Math.sin(this.animationTime * 4 + supply.x) * 2);
    if (this.drawAtlasFrame(ctx, descriptor, frame, x, y, width, height)) return;
    this.drawWorldProp(ctx, 'crates', supply.x, supply.y + supply.h, supply.h, supply.w);
  }

  drawDrop(ctx, drop) {
    const descriptor = resolveMissionDropArtV56(drop.type);
    const frame = this.reducedMotion ? 0 : Math.floor(this.animationTime * 5 + drop.x * 0.02) % 4;
    const width = Math.max(drop.w, drop.type === 'security-key' ? 44 : 38);
    const height = Math.max(drop.h, drop.type === 'security-key' ? 42 : 34);
    const x = drop.x + drop.w / 2 - width / 2;
    const y = drop.y + drop.h - height + (this.reducedMotion ? 0 : Math.sin(this.animationTime * 5 + drop.x) * 3);
    if (this.drawAtlasFrame(ctx, descriptor, frame, x, y, width, height)) return;
    ctx.fillStyle = drop.type === 'security-key' ? '#e6bf55' : drop.type === 'ammo' ? '#c98d5b' : '#72c293';
    ctx.fillRect(drop.x, drop.y, drop.w, drop.h);
  }

  drawPowerNode(ctx) {
    if (!this.powerNode) return;
    this.drawWorldProp(ctx, 'lamp', this.powerNode.x, this.powerNode.y + this.powerNode.h, this.powerNode.h, this.powerNode.w);
    ctx.fillStyle = this.powerNode.active ? '#77d795' : '#d25b4d';
    ctx.fillRect(this.powerNode.x + 21, this.powerNode.y + 13, 10, 10);
  }

  drawArchiveTerminal(ctx) {
    if (!this.archiveTerminal) return;
    const descriptor = resolveMissionArchiveArtV56(this.missionLevelRuntime?.templateId);
    const frame = this.archiveTerminal.recovered
      ? 3
      : this.reducedMotion ? 0 : Math.floor(this.animationTime * 3) % 3;
    const width = Math.max(this.archiveTerminal.w, 70);
    const height = Math.max(this.archiveTerminal.h, 92);
    const x = this.archiveTerminal.x + this.archiveTerminal.w / 2 - width / 2;
    const y = this.archiveTerminal.y + this.archiveTerminal.h - height;
    if (this.drawAtlasFrame(ctx, descriptor, frame, x, y, width, height)) return;
    this.drawWorldProp(ctx, this.archiveTerminal.recovered ? 'lamp' : 'crates', this.archiveTerminal.x, this.archiveTerminal.y + this.archiveTerminal.h, this.archiveTerminal.h, this.archiveTerminal.w);
  }

  drawDoor(ctx, door) {
    const { image, open, source, x, y, w: width, h: height } = this.getDoorRenderState(door);
    ctx.globalAlpha = open ? 0.82 : 1;
    if (ready(image)) ctx.drawImage(image, source.x, source.y, source.w, source.h, x, y, width, height);
    else { ctx.fillStyle = '#353c38'; ctx.fillRect(x, y, width, height); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.doorRequirement(door) ? '#d04f47' : door.open ? '#83d99e' : '#d6ac59';
    ctx.fillRect(x + width + 8, y + 30, 7, 13);
  }

  drawWeaponPickup(ctx) {
    if (this.weaponPickup.taken) return;
    const visual = this.weaponVisual || resolveWeaponVisualProfileV63(this.weapon);
    const image = this.images.get(visual?.imageKey || 'rifle');
    if (!ready(image)) return;
    const frame = Math.floor(this.animationTime * 4) % 4;
    const width = visual?.width || 126;
    const height = visual?.height || 72;
    const x = this.weaponPickup.x + this.weaponPickup.w / 2 - width / 2;
    const y = this.weaponPickup.y + this.weaponPickup.h - height * (240 / CELL_SIZE);
    this.drawSheetCell(ctx, image, frame, 0, x, y, width, height, false);
  }
  drawToolPickup(ctx) {
    if (this.toolPickup.taken) return;
    const visual = MISSION_TOOL_PICKUP_VISUAL_V56;
    const image = this.images.get(this.toolPickup.imageKey || visual?.imageKey);
    if (!visual || !ready(image)) return;
    const frame = this.reducedMotion ? 0 : Math.floor(this.animationTime * 4) % 4;
    const width = visual.renderWidth;
    const height = visual.renderHeight;
    const x = this.toolPickup.x + this.toolPickup.w / 2 - width / 2;
    const y = this.toolPickup.y + this.toolPickup.h - height * (240 / CELL_SIZE);
    this.drawSheetCell(ctx, image, frame, 0, x, y, width, height, false);
  }

  drawVehicle(ctx) {
    if (!this.vehicle?.active) return;
    const request = resolveVehicleAnimation(this.vehicle);
    if (request?.sheetId !== 'vehicle.m577-apc.action') return;
    const image = this.images.get('apc');
    if (!ready(image)) return;
    const row = request.clipId === 'damage' ? 3 : request.clipId === 'turret' ? 2 : request.clipId === 'roll' ? 1 : 0;
    const frame = Math.floor(this.animationTime * (request.clipId === 'roll' ? 9 : request.clipId === 'idle' ? 2 : 6)) % 4;
    const width = 250;
    const height = 140;
    const x = this.vehicle.x + this.vehicle.w / 2 - width / 2;
    const y = this.vehicle.y + this.vehicle.h - height * (240 / CELL_SIZE);
    this.drawSheetCell(ctx, image, frame, row, x, y, width, height, shouldFlipSprite(resolveSpriteSheet(request.sheetId), this.vehicle.facing));
  }

  drawActor(ctx, actor) {
    if (!actor.alive) {
      const image = this.images.get('playerCombat');
      this.drawSheetCell(ctx, image, 3, 3, actor.x - 28, actor.y + actor.h - 58, 112, 58, actor.facing < 0);
      return;
    }
    const moving = Math.abs(actor.vx) > 12;
    const image = this.images.get(actor.actionClock > 0 ? 'playerCombat' : 'playerLocomotion');
    let row = 0;
    let fps = 4;
    if (actor.actionClock > 0) { row = actor.health < 30 ? 3 : 1; fps = 13; }
    else if (actor.climbing || actor.crouching) { row = 3; fps = actor.climbing ? 8 : 5; }
    else if (!actor.grounded) { row = 2; fps = 8; }
    else if (moving) { row = 1; fps = Math.abs(actor.vx) > 280 ? 12 : 9; }
    const frame = Math.floor(this.animationTime * fps) % 4;
    const renderHeight = 148;
    const renderWidth = 110;
    const x = actor.x + actor.w / 2 - renderWidth / 2;
    const y = actor.y + actor.h - renderHeight * (240 / CELL_SIZE);
    this.drawSheetCell(ctx, image, frame, row, x, y, renderWidth, renderHeight, actor.facing < 0);
    if (actor.inCover) { ctx.strokeStyle = '#79c895'; ctx.strokeRect(actor.x - 3, actor.y + 32, actor.w + 6, actor.h - 29); }
  }

  drawEnemy(ctx, enemy) {
    let image;
    let sheetId = null;
    const requestedEnemySheet = resolveSpriteSheet(enemy.visualSheetId);
    const dedicatedEnemySheet = requestedEnemySheet?.family === 'enemy'
      && DEDICATED_ENEMY_ACTION_CLIP_SETS.has(requestedEnemySheet.clipSet)
      ? requestedEnemySheet
      : null;
    const legacyCell = resolveLegacyEnemyCell(enemy, this.animationTime);
    let row = legacyCell.row;
    let frame = legacyCell.frame;
    let renderWidth = 84;
    let renderHeight = 112;
    if (dedicatedEnemySheet) {
      image = this.images.get(dedicatedEnemySheet.imageKey);
      sheetId = dedicatedEnemySheet.id;
      row = enemy.alive ? enemy.hurtClock > 0 ? 0 : enemy.attacking ? 2 : enemy.alert ? 1 : 0 : 3;
      const fps = row === 0 ? 4 : row === 3 ? 7 : 10;
      frame = Math.floor(this.animationTime * fps) % 4;
      if (['facehugger-action-v65', 'enemy-action-v66', 'ovomorph-cycle-v66'].includes(dedicatedEnemySheet.clipSet)) {
        this.enemyFallbackAnimationV65 ||= new SpriteAnimationController();
        const sample = this.enemyFallbackAnimationV65.sample(
          enemy.id, resolveEnemyAnimation(enemy), this.animationTime, { emit: false }
        );
        frame = sample.column;
        row = sample.row;
      }
      renderWidth = dedicatedEnemySheet.renderWidth;
      renderHeight = dedicatedEnemySheet.renderHeight;
    }
    else if (enemy.spriteKey === 'ripperQueen') { image = this.images.get('ripperQueen'); sheetId = 'enemy.ripper-queen.action'; row = enemy.alive ? enemy.attacking ? 2 : enemy.alert ? 1 : 0 : 3; renderWidth = 224; renderHeight = 170; }
    else if (enemy.spriteKey === 'xenoQueen') { image = this.images.get('xenoQueen'); sheetId = 'enemy.xenomorph-queen.combat'; row = enemy.alive ? enemy.attacking ? 2 : enemy.alert ? 1 : 0 : 3; renderWidth = 224; renderHeight = 170; }
    else if (enemy.spriteKey === 'xenoRunner') { image = this.images.get('xenoRunner'); sheetId = 'enemy.xenomorph-runner.action'; row = enemy.alive ? enemy.attacking ? 2 : enemy.alert ? 1 : 0 : 3; renderWidth = 168; renderHeight = 100; }
    else if (enemy.spriteKey === 'paleCrucibleHunter') { image = this.images.get('paleCrucibleHunter'); sheetId = 'enemy.pale-crucible-hunter.action'; row = enemy.alive ? enemy.attacking ? 2 : enemy.alert ? 1 : 0 : 3; renderWidth = 142; renderHeight = 106; }
    else if (enemy.spriteKey === 'pathogenMimic') { image = this.images.get('pathogenMimic'); sheetId = 'enemy.pathogen-mimic.action'; row = enemy.alive ? enemy.attacking ? 2 : enemy.alert ? 1 : 0 : 3; renderWidth = 132; renderHeight = 96; }
    else if (enemy.spriteKey === 'xenoWarrior') { image = this.images.get('xenoWarrior'); sheetId = 'enemy.xenomorph-warrior.combat'; row = enemy.alive ? enemy.attacking ? 2 : enemy.alert ? 1 : 0 : 3; renderWidth = 158; renderHeight = 120; }
    else if (enemy.spriteKey === 'facehugger') { image = this.images.get('facehugger'); sheetId = 'enemy.facehugger.locomotion'; row = enemy.alive ? enemy.attacking ? 2 : enemy.alert ? 1 : 0 : 3; renderWidth = 112; renderHeight = 72; }
    else if (enemy.spriteKey === 'neomorph') { image = this.images.get('neomorph'); sheetId = 'enemy.neomorph.locomotion'; row = enemy.alive ? enemy.attacking ? 2 : enemy.alert ? 1 : 0 : 3; renderWidth = 146; renderHeight = 112; }
    else if (enemy.spriteKey === 'workingJoe') { image = this.images.get('workingJoe'); sheetId = 'enemy.working-joe.combat'; row = enemy.alive ? enemy.attacking ? 1 : 0 : 3; renderWidth = 88; renderHeight = 116; }
    else if (enemy.spriteKey === 'xenoDrone') { image = this.images.get(enemy.attacking ? 'xenoCombat' : 'xenoLocomotion'); sheetId = enemy.attacking ? 'enemy.xenomorph-drone.combat' : 'enemy.xenomorph-drone.locomotion'; row = enemy.alive ? enemy.attacking ? 1 : enemy.alert ? 1 : 0 : 3; renderWidth = 142; renderHeight = 106; }
    else if (enemy.visualImageKey) {
      image = this.images.get(enemy.visualImageKey);
      if (enemy.visualImageKey === 'pathogen') { renderWidth = 132; renderHeight = 96; }
      else if (enemy.visualImageKey === 'neuroXeno') { renderWidth = 142; renderHeight = 106; }
    }
    else if (enemy.biology === 'human') image = this.images.get('human');
    else if (enemy.biology === 'synthetic') image = this.images.get('synthetic');
    else { image = this.images.get('pathogen'); renderWidth = 132; renderHeight = 96; }
    if (sheetId && this.enemyAtlasLRUV65) image = this.enemyAtlasLRUV65.get(resolveSpriteSheet(sheetId)) || image;
    if (!ready(image) && sheetId) {
      const enemySheet = resolveSpriteSheet(sheetId);
      if (enemySheet?.family === 'enemy') {
        void this.ensureEnemyAtlas(enemySheet);
        return;
      }
    }
    const x = enemy.x + enemy.w / 2 - renderWidth / 2;
    const y = enemy.y + enemy.h - renderHeight * (240 / CELL_SIZE);
    ctx.save();
    if (!enemy.alive) ctx.globalAlpha = clamp(enemy.deathClock / 1.2, 0.25, 1);
    if (enemy.revealed > 0) { ctx.shadowColor = '#8fe7a8'; ctx.shadowBlur = 16; }
    this.drawSheetCell(ctx, image, frame, row, x, y, renderWidth, renderHeight, shouldFlipSprite(sheetId, enemy.facing), dedicatedEnemySheet);
    ctx.restore();
    if (enemy.alive && (enemy.alert || enemy.isBoss)) {
      ctx.fillStyle = '#2b1616'; ctx.fillRect(enemy.x, enemy.y - 10, enemy.w, 4);
      ctx.fillStyle = enemy.isBoss ? '#d27662' : '#be5551';
      ctx.fillRect(enemy.x, enemy.y - 10, enemy.w * (enemy.health / enemy.maxHealth), 4);
    }
  }

  drawBullet(ctx, bullet) {
    const image = this.images.get('vfx');
    if (ready(image)) {
      const frame = 1 + (Math.floor(this.animationTime * 24) % 3);
      this.drawSheetCell(ctx, image, frame, 0, bullet.x - 8, bullet.y - 8, bullet.kind === 'apc-turret' ? 44 : 34, bullet.kind === 'apc-turret' ? 22 : 18, bullet.vx < 0);
      return;
    }
    ctx.fillStyle = '#f5d87a'; ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
  }

  drawHostileProjectile(ctx, projectile) {
    ctx.fillStyle = projectile.acid ? '#a8c64d' : '#e4a35e';
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.w / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawObjective(ctx) {
    if (!this.objective) return;
    const image = this.images.get(this.objective.complete ? 'lamp' : 'crates');
    if (ready(image)) {
      const height = this.objective.complete ? 92 : 86;
      const width = image.naturalWidth * (height / image.naturalHeight);
      ctx.drawImage(image, this.objective.x - width / 2, this.objective.y + this.objective.h - height, width, height);
    }
    ctx.fillStyle = this.objective.complete ? '#79d69a' : '#d5b562';
    ctx.beginPath(); ctx.arc(this.objective.x, this.objective.y - 14, 5 + Math.sin(this.animationTime * 4) * 2, 0, Math.PI * 2); ctx.fill();
  }

  drawSheetCell(ctx, image, column, row, x, y, width, height, flip, grid = null) {
    if (!ready(image)) return;
    const cellWidth = image.naturalWidth / (grid?.columns || 4);
    const cellHeight = image.naturalHeight / (grid?.rows || 4);
    ctx.save();
    if (flip) {
      ctx.translate(x + width, y); ctx.scale(-1, 1);
      ctx.drawImage(image, column * cellWidth, row * cellHeight, cellWidth, cellHeight, 0, 0, width, height);
    } else ctx.drawImage(image, column * cellWidth, row * cellHeight, cellWidth, cellHeight, x, y, width, height);
    ctx.restore();
  }

  drawForeground(ctx) {
    const image = this.images.get('foreground');
    if (ready(image)) {
      const height = 220;
      const width = image.naturalWidth * (height / image.naturalHeight);
      const offset = -((this.camera.x * 1.12) % width);
      ctx.save();
      ctx.globalAlpha = 0.3;
      for (let x = offset - width; x < LOGICAL_WIDTH + width; x += width - 12) ctx.drawImage(image, x, LOGICAL_HEIGHT - height, width, height);
      ctx.restore();
    }
    this.drawHazardForegroundOverlays(ctx);
    this.drawForegroundPipes(ctx);
  }

  phaseLabel() {
    return {
      'restore-power': 'RÉTABLIR LE CIRCUIT', 'secure-route': 'SÉCURISER UNE ROUTE', 'neutralize-boss': 'NEUTRALISER LA MENACE ALPHA',
      'recover-archive': 'RÉCUPÉRER LES ARCHIVES', extract: 'REJOINDRE L’EXTRACTION'
    }[this.mission?.phase] || 'OPÉRATION EN COURS';
  }

  getInteractionPrompt(actor = this.player) {
    if (!actor?.alive) return this.mission?.state === 'failed' ? 'ENTRÉE  REPRENDRE AU CHECKPOINT' : '';
    const ally = actor === this.player ? this.coop : this.player;
    if (this.coopEnabled && ally?.downed && distanceBetween(actor, ally) < REVIVE_RANGE) return 'E  RÉANIMER LE COÉQUIPIER';
    const actorCenter = actor.x + actor.w / 2;
    const door = this.doors.find((candidate) => Math.abs(actorCenter - (candidate.x + candidate.w / 2)) < 118);
    if (door) return this.doorRequirement(door) ? `E  VERROUILLÉ — ${this.doorRequirement(door)}` : 'E  ACTIONNER LA PORTE';
    if (this.powerNode && !this.powerNode.active && distanceBetween(actor, this.powerNode) < 130) return 'E  RÉTABLIR LE CIRCUIT AUXILIAIRE';
    if (this.archiveTerminal && !this.archiveTerminal.recovered && distanceBetween(actor, this.archiveTerminal) < 130) return 'E  EXTRAIRE LES ARCHIVES';
    if (this.vents.some((vent) => distanceBetween(actor, vent) < 125)) return this.inventory.cutter || this.vents.every((vent) => !vent.requiresTool) ? 'E  OUVRIR / EMPRUNTER LE CONDUIT' : 'CHALUMEAU REQUIS';
    if (this.objective && distanceBetween(actor, this.objective) < 125) return this.missingExtractionRequirement() ? `E  EXTRACTION BLOQUÉE — ${this.missingExtractionRequirement()}` : 'E  CONFIRMER L’EXTRACTION';
    if (this.vehicle?.active && distanceBetween(actor, this.vehicle) < 210) return actor.inVehicle ? `V  QUITTER ${this.vehicle.name || 'LE VÉHICULE'}` : `V  PILOTER ${this.vehicle.name || 'LE VÉHICULE'}`;
    if (this.findCover(actor)) return 'S  COUVERTURE · F  TIR · R  RECHARGER';
    if (this.nearestLadder(actor)) return 'W / S  GRIMPER · ESPACE  SAUTER';
    return '';
  }

  drawHud(ctx) {
    ctx.fillStyle = 'rgba(3, 10, 8, .82)'; ctx.fillRect(18, 16, 440, 92);
    ctx.strokeStyle = '#668b71'; ctx.strokeRect(18.5, 16.5, 440, 92);
    ctx.fillStyle = '#9be0ae'; ctx.font = 'bold 13px monospace';
    ctx.fillText(this.campaign?.name?.toUpperCase() || 'OPÉRATION TANTALUS', 34, 38);
    ctx.fillStyle = '#ccd9cc'; ctx.font = '12px monospace';
    ctx.fillText(`PV ${Math.ceil(this.player.health)}  ARM ${Math.ceil(this.player.armor)}  MUN ${this.player.ammo}/${this.player.ammoReserve}`, 34, 60);
    ctx.fillStyle = '#8ea898';
    ctx.fillText(`SECTEUR ${this.room + 1}/6 · ${this.phaseLabel()}`, 34, 81);
    ctx.fillText(`MÉD ${this.inventory.medkits} · RÉCUP ${this.inventory.salvage} · TRACK ${Math.round(this.tracker.energy)}%`, 34, 99);
    const progress = clamp(this.player.x / (WORLD_WIDTH - 200), 0, 1);
    ctx.fillStyle = 'rgba(3, 10, 8, .74)'; ctx.fillRect(474, 20, 332, 20);
    ctx.fillStyle = '#26372e'; ctx.fillRect(486, 28, 308, 4);
    ctx.fillStyle = '#8bd6a0'; ctx.fillRect(486, 28, 308 * progress, 4);
    if (this.coopEnabled) {
      ctx.fillStyle = 'rgba(3, 10, 8, .74)'; ctx.fillRect(474, 48, 332, 38);
      ctx.fillStyle = this.coop.alive ? '#d8c485' : '#c75b55';
      ctx.fillText(`COOP ${this.coop.alive ? `PV ${Math.ceil(this.coop.health)} ARM ${Math.ceil(this.coop.armor)}` : `À TERRE ${Math.ceil(this.coop.bleedOut)}s`}`, 488, 72);
    }
    if (this.vehicle?.occupied) {
      ctx.fillStyle = 'rgba(3, 10, 8, .8)'; ctx.fillRect(822, 18, 232, 58);
      ctx.fillStyle = '#8bb2c8'; ctx.fillText(`${String(this.vehicle.name || 'VÉHICULE').slice(0, 22)} · ${Math.ceil(this.vehicle.hull)}/${this.vehicle.maxHull}`, 838, 41);
      ctx.fillText(`CARB ${Math.ceil(this.vehicle.fuel)} · ARMEMENT ${this.vehicle.turretAmmo}`, 838, 62);
    }
    const prompt = this.getInteractionPrompt();
    if (prompt) {
      ctx.font = '700 13px monospace';
      const width = Math.min(760, ctx.measureText(prompt).width + 44);
      ctx.fillStyle = 'rgba(3, 10, 8, .86)'; ctx.fillRect((LOGICAL_WIDTH - width) / 2, 654, width, 38);
      ctx.strokeStyle = '#86c797'; ctx.strokeRect((LOGICAL_WIDTH - width) / 2 + 0.5, 654.5, width, 38);
      ctx.fillStyle = '#c7e7ce'; ctx.textAlign = 'center'; ctx.fillText(prompt, LOGICAL_WIDTH / 2, 678); ctx.textAlign = 'left';
    }
    if (this.trackerPulse > 0) {
      ctx.fillStyle = 'rgba(4, 18, 12, .88)'; ctx.fillRect(1072, 18, 170, 152);
      ctx.strokeStyle = '#689177'; ctx.strokeRect(1072.5, 18.5, 170, 152);
      ctx.strokeStyle = `rgba(140, 232, 163, ${this.trackerPulse})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(1157, 94, 76 * (1 - this.trackerPulse) + 16, 0, Math.PI * 2); ctx.stroke();
      for (const enemy of this.enemies.filter((item) => item.alive && Math.abs(item.x - this.player.x) < 900).slice(0, 16)) {
        ctx.fillStyle = enemy.isBoss ? '#e18467' : '#a8e4ad';
        ctx.fillRect(clamp(1157 + (enemy.x - this.player.x) * 0.075, 1078, 1235), clamp(94 + (enemy.y - this.player.y) * 0.06, 25, 163), enemy.isBoss ? 8 : 5, enemy.isBoss ? 8 : 5);
      }
    }
  }

  drawStateOverlay(ctx) {
    ctx.fillStyle = 'rgba(2, 7, 6, .8)'; ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.fillStyle = this.mission?.state === 'failed' ? '#d66b60' : '#d8e6d8';
    ctx.font = '700 38px sans-serif'; ctx.textAlign = 'center';
    const title = this.enemyAtlasLoadingPausedV65 ? 'Sprite indisponible — nouvelle tentative…'
      : this.paused ? 'OPÉRATION EN PAUSE' : this.mission?.state === 'failed' ? 'ESCOUADE HORS COMBAT' : 'EXTRACTION CONFIRMÉE';
    ctx.fillText(title, LOGICAL_WIDTH / 2, 318);
    ctx.font = '18px monospace'; ctx.fillStyle = '#83d5a1';
    const subtitle = this.enemyAtlasLoadingPausedV65
      ? this.paused ? 'PAUSE UTILISATEUR ACTIVE · chargement en cours' : 'Simulation suspendue · reprise après chargement du sprite'
      : this.paused ? 'P / ÉCHAP pour reprendre' : this.mission?.state === 'failed' ? `ENTRÉE · reprendre au checkpoint ${this.checkpoint.id}` : `${this.mission.rewards?.credits || 0} CR · ${this.mission.rewards?.salvage || 0} récupération · ${this.mission.rewards?.intel || 0} données`;
    ctx.fillText(subtitle, LOGICAL_WIDTH / 2, 365); ctx.textAlign = 'left';
  }

  getAssetReport() {
    const entries = [...this.images.entries()];
    const interactiveKeys = Object.keys(MISSION_INTERACTIVE_ART_FILES_V56);
    return {
      ready: entries.filter(([, image]) => ready(image)).length,
      total: entries.length,
      missing: entries.filter(([, image]) => !ready(image)).map(([name]) => name),
      interactiveArtCount: MISSION_INTERACTIVE_ART_ASSET_COUNT_V56,
      interactiveArtReady: interactiveKeys.filter((key) => ready(this.images.get(key))).length
    };
  }
  getWeaponAssetReport() {
    return {
      weaponVisualCount: WEAPON_VISUAL_BASE_COUNT_V63,
      weaponVisualReady: Object.keys(WEAPON_VISUAL_ASSETS_ALL_V63).filter((key) => ready(this.images.get(key))).length,
    };
  }

  getGameplayReport() {
    return {
      combat: { magazineReload: true, enemyArmor: true, rangedAttacks: true, boss: this.enemies.some((enemy) => enemy.isBoss), hostileProjectiles: true },
      survival: { healthArmor: true, medkits: true, ammoReserve: true, acidHazards: this.hazards.length, checkpointPenalty: true },
      traversal: { platforms: this.platforms.length, ladders: this.ladders.length, lifts: this.lifts.length, doors: this.doors.length, vents: this.vents.length },
      tactics: { physicalCover: this.covers.length, coverMitigation: true, motionTracker: true, localCoopRevive: true },
      vehicle: { active: Boolean(this.vehicle?.active), hull: Boolean(this.vehicle?.active), fuel: Boolean(this.vehicle?.active), turret: Boolean(this.vehicle?.active), ramming: Boolean(this.vehicle?.active) },
      mission: { gatedObjectives: true, defeatAndRetry: true, extractionRewards: true, state: this.mission?.state, phase: this.mission?.phase },
      editor: { active: this.editorMode, tileCount: this.editorTileCount, tileCounts: { ...this.editorTileCounts } }
    };
  }

  debugStep(seconds, slices = 1) {
    const step = seconds / Math.max(1, slices);
    for (let index = 0; index < Math.max(1, slices); index += 1) this.update(step);
    return this.getSnapshot();
  }

  getSnapshot() {
    const assets = this.getAssetReport();
    const actorSnapshot = (actor) => actor ? {
      x: Math.round(actor.x), y: Math.round(actor.y), w: actor.w, h: actor.h, health: Math.round(actor.health), armor: Math.round(actor.armor),
      ammo: actor.ammo, ammoReserve: actor.ammoReserve, weapon: actor.weaponMode, alive: actor.alive, downed: actor.downed,
      climbing: actor.climbing, inCover: Boolean(actor.inCover), inVehicle: actor.inVehicle, kills: actor.kills
    } : null;
    return {
      running: this.running,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      platformCount: this.platforms?.length || 0,
      ladderCount: this.ladders?.length || 0,
      liftCount: this.lifts?.length || 0,
      wallCount: this.walls?.length || 0,
      doorCount: this.doors?.length || 0,
      hazardCount: this.hazards?.length || 0,
      player: actorSnapshot(this.player),
      coop: this.coopEnabled ? actorSnapshot(this.coop) : null,
      camera: this.camera ? { x: Math.round(this.camera.x), y: Math.round(this.camera.y) } : null,
      powerRestored: Boolean(this.powerNode?.active || !this.powerNode),
      missionState: this.mission?.state,
      missionPhase: this.mission?.phase,
      objectives: this.mission ? { ...this.mission.objectives } : null,
      inventory: this.inventory ? { ...this.inventory } : null,
      tracker: this.tracker ? { energy: Math.round(this.tracker.energy), cooldown: Number(this.tracker.cooldown.toFixed(2)), contacts: this.tracker.contacts.length, pulses: this.tracker.pulses } : null,
      enemiesAlive: this.enemies?.filter((enemy) => enemy.alive).length || 0,
      bossAlive: Boolean(this.enemies?.some((enemy) => enemy.isBoss && enemy.alive)),
      bullets: this.bullets?.length || 0,
      hostileProjectiles: this.hostileProjectiles?.length || 0,
      vehicle: this.vehicle ? { active: this.vehicle.active, occupied: this.vehicle.occupied, hull: Math.round(this.vehicle.hull), fuel: Math.round(this.vehicle.fuel), turretAmmo: this.vehicle.turretAmmo, destroyed: this.vehicle.destroyed, x: Math.round(this.vehicle.x) } : null,
      checkpoint: this.checkpoint ? { ...this.checkpoint } : null,
      rewards: this.mission?.rewards ? { ...this.mission.rewards } : null,
      editorMode: this.editorMode,
      editorTileCount: this.editorTileCount,
      editorTileCounts: { ...this.editorTileCounts },
      assets
    };
  }
}
