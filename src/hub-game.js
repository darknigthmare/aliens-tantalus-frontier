import { HUB_DOOR_PROFILES, HUB_ROOM_PROFILES, getHubDoorBounds } from './hub-profiles-v53.js';
import {
  DROPSHIP_HANGAR_ART_V55,
  ELECTRICAL_HAZARD_ART_V55,
  HUB_ART_ASSETS_V55
} from './hub-art-runtime-v55.js';

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const WORLD_WIDTH = 5120;
const ROOM_WIDTH = WORLD_WIDTH / 4;
const FLOOR_Y = 624;
const GRAVITY = 1900;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const assetReady = (image) => Boolean(image?.complete && image.naturalWidth);
const HUB_FOREGROUND = '/assets/openai/metroidvania/tantalus-mission-foreground.png';
const NPC_SPRITE_FILES = Object.freeze([
  '/assets/openai/sprites/normalized/npcs/mara-vega-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/idris-kwan-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/noor-okafor-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/bishop-9-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/tamsin-velez-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/sanaa-doyle-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/maksim-orlov-locomotion-sheet.png'
]);
const PLAYER_SPRITE_FILE = '/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png';

export const HUB_WORLD = Object.freeze({ width: WORLD_WIDTH, roomWidth: ROOM_WIDTH, floorY: FLOOR_Y });
export { HUB_DOOR_PROFILES, HUB_ROOM_PROFILES, getHubDoorBounds };

const GEOMETRY_TEMPLATES = Object.freeze([
  Object.freeze([{ dx: 238, w: 76, h: 38, style: 0 }, { dx: 488, w: 112, h: 27, style: 1 }, { dx: 822, w: 58, h: 48, style: 2 }]),
  Object.freeze([{ dx: 188, w: 92, h: 29, style: 1 }, { dx: 454, w: 64, h: 52, style: 2 }, { dx: 804, w: 104, h: 35, style: 0 }]),
  Object.freeze([{ dx: 246, w: 58, h: 54, style: 2 }, { dx: 526, w: 96, h: 31, style: 0 }, { dx: 824, w: 72, h: 42, style: 1 }]),
  Object.freeze([{ dx: 198, w: 108, h: 34, style: 0 }, { dx: 470, w: 72, h: 45, style: 2 }, { dx: 790, w: 86, h: 28, style: 1 }])
]);

const makeRoom = (id, name, action, description, index, npcRow, art, prop, geometryVariant, viewport, propHeight = 138) => {
  const xStart = index * ROOM_WIDTH;
  const profile = HUB_ROOM_PROFILES[id];
  const worldWidth = profile?.worldWidth || ROOM_WIDTH;
  const propX = xStart + worldWidth * 0.7;
  const profileGeometry = profile?.authoredCollision && profile.propCollider
    ? [Object.freeze({
        x: propX - profile.propCollider.width / 2,
        y: FLOOR_Y - profile.propCollider.height,
        w: profile.propCollider.width,
        h: profile.propCollider.height,
        role: 'interaction-prop',
        collisionOnly: true
      })]
    : null;
  return Object.freeze({
    id,
    name,
    action,
    description,
    index,
    npcRow,
    xStart,
    xEnd: xStart + worldWidth,
    x: propX,
    profile,
    collisionSource: profileGeometry ? 'room-profile' : 'fallback',
    background: `/assets/openai/hub/rooms/${art}.png`,
    prop: `/assets/openai/hub/props/${prop}.png`,
    propHeight,
    viewport: Object.freeze({ x: xStart + viewport.x, y: viewport.y, w: viewport.w, h: viewport.h }),
    geometry: Object.freeze(profileGeometry || GEOMETRY_TEMPLATES[geometryVariant].map((item) => Object.freeze({
      x: xStart + item.dx,
      y: FLOOR_Y - item.h,
      w: item.w,
      h: item.h,
      style: item.style
    })))
  });
};

export const HUB_MODULAR_PROP_FILES = Object.freeze([
  '/assets/openai/hub/props/bulkhead-door.png',
  '/assets/openai/hub/props/lift-door.png',
  '/assets/openai/hub/props/bridge-terminal.png',
  '/assets/openai/hub/props/briefing-table.png',
  '/assets/openai/hub/props/cryopod.png',
  '/assets/openai/hub/props/bunk-module.png',
  '/assets/openai/hub/props/mess-table.png',
  '/assets/openai/hub/props/medical-bed.png',
  '/assets/openai/hub/props/lab-console.png',
  '/assets/openai/hub/props/quarantine-unit.png',
  '/assets/openai/hub/props/armory-rack.png',
  '/assets/openai/hub/props/workbench.png',
  '/assets/openai/hub/props/vehicle-lift.png',
  '/assets/openai/hub/props/reactor-column.png',
  '/assets/openai/hub/props/life-support-scrubber.png',
  '/assets/openai/hub/props/sensor-console.png'
]);

export const HUB_DECKS = Object.freeze([
  Object.freeze({
    id: 'command',
    name: 'PONT COMMANDEMENT',
    shortName: 'COMMANDEMENT',
    farBackground: '/assets/openai/hub/parallax/command-far.png',
    rooms: Object.freeze([
      makeRoom('bridge', 'Passerelle', 'navigate:galaxy', 'Tracer une route sur la Frontière.', 0, 0, 'command-bridge', 'bridge-terminal', 0, { x: 334, y: 248, w: 294, h: 118 }, 142),
      makeRoom('briefing', 'Salle de briefing', 'navigate:operations', 'Préparer une opération avec Echo-9.', 1, 0, 'command-briefing', 'briefing-table', 1, { x: 108, y: 234, w: 240, h: 104 }, 126),
      makeRoom('combat-information', 'Centre d’information tactique', 'navigate:command', 'Consulter l’état du théâtre et les alertes.', 2, 0, 'command-cic', 'sensor-console', 2, { x: 354, y: 226, w: 254, h: 110 }, 136),
      makeRoom('cryo-bay', 'Baie cryogénique', 'navigate:crew', 'Réveiller, relever et inspecter l’équipage.', 3, 3, 'command-cryo', 'cryopod', 3, { x: 116, y: 244, w: 220, h: 96 }, 112)
    ])
  }),
  Object.freeze({
    id: 'habitat',
    name: 'PONT HABITAT',
    shortName: 'HABITAT',
    farBackground: '/assets/openai/hub/parallax/habitat-far.png',
    rooms: Object.freeze([
      makeRoom('crew-quarters', 'Quartiers équipage', 'navigate:crew', 'Inspecter l’état d’Echo-9 et ses dotations.', 0, 0, 'habitat-quarters', 'bunk-module', 1, { x: 128, y: 238, w: 218, h: 102 }, 138),
      makeRoom('mess', 'Mess', 'service:rest', 'Partager une relève et réduire le stress.', 1, 1, 'habitat-mess', 'mess-table', 2, { x: 350, y: 236, w: 246, h: 102 }, 118),
      makeRoom('medical', 'Bloc médical', 'service:medical', 'Soigner les opérateurs avec les réserves médicales.', 2, 2, 'habitat-medical', 'medical-bed', 3, { x: 122, y: 226, w: 238, h: 108 }, 112),
      makeRoom('science-lab', 'Laboratoire scientifique', 'navigate:bestiary', 'Analyser les spécimens et profils Neuro-Xeno.', 3, 2, 'habitat-lab', 'lab-console', 0, { x: 356, y: 232, w: 232, h: 102 }, 132)
    ])
  }),
  Object.freeze({
    id: 'industrial',
    name: 'PONT INDUSTRIEL',
    shortName: 'INDUSTRIEL',
    farBackground: '/assets/openai/hub/parallax/industrial-far.png',
    rooms: Object.freeze([
      makeRoom('quarantine', 'Quarantaine', 'service:quarantine', 'Renforcer le confinement biologique.', 0, 3, 'industrial-quarantine', 'quarantine-unit', 2, { x: 338, y: 220, w: 266, h: 118 }, 140),
      makeRoom('armory', 'Armurerie', 'navigate:armory', 'Modifier armes, munitions et équipements.', 1, 0, 'industrial-armory', 'armory-rack', 3, { x: 116, y: 240, w: 224, h: 98 }, 138),
      makeRoom('workshop', 'Atelier', 'navigate:editor', 'Ouvrir Frontier Forge et les plans du vaisseau.', 2, 1, 'industrial-workshop', 'workbench', 0, { x: 354, y: 232, w: 238, h: 106 }, 128),
      makeRoom('vehicle-bay', 'Baie véhicules', 'navigate:vehicles', 'Inspecter les châssis et rôles par siège.', 3, 1, 'industrial-vehicle-bay', 'vehicle-lift', 1, { x: 112, y: 220, w: 248, h: 118 }, 110)
    ])
  }),
  Object.freeze({
    id: 'engineering',
    name: 'PONT INGÉNIERIE',
    shortName: 'INGÉNIERIE',
    farBackground: '/assets/openai/hub/parallax/engineering-far.png',
    rooms: Object.freeze([
      makeRoom('dropship-hangar', 'Hangar dropship', 'navigate:operations', 'Embarquer pour la prochaine opération.', 0, 1, 'engineering-hangar', 'vehicle-lift', 3, { x: 344, y: 216, w: 272, h: 122 }, 108),
      makeRoom('reactor', 'Réacteur', 'service:power', 'Réaffecter du carburant au réseau principal.', 1, 1, 'engineering-reactor', 'reactor-column', 0, { x: 112, y: 226, w: 232, h: 110 }, 148),
      makeRoom('life-support', 'Support-vie', 'service:oxygen', 'Purger les filtres et restaurer l’oxygène.', 2, 2, 'engineering-life-support', 'life-support-scrubber', 1, { x: 352, y: 228, w: 244, h: 106 }, 136),
      makeRoom('sensor-array', 'Réseau de capteurs', 'navigate:galaxy', 'Balayer les mondes et anomalies de la Frontière.', 3, 0, 'engineering-sensors', 'sensor-console', 2, { x: 118, y: 222, w: 246, h: 114 }, 134)
    ])
  })
]);

export const HUB_ROOM_COUNT = HUB_DECKS.reduce((total, deck) => total + deck.rooms.length, 0);
export const HUB_MODULAR_ASSETS = Object.freeze([...new Set([
  ...HUB_DECKS.flatMap((deck) => [deck.farBackground, ...deck.rooms.flatMap((room) => (
    room.id === DROPSHIP_HANGAR_ART_V55.roomId ? [] : [room.background, room.prop]
  ))]),
  ...HUB_MODULAR_PROP_FILES,
  ...HUB_ART_ASSETS_V55
])]);

function createImage(source) {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  return image;
}

export class HubGame {
  constructor(canvas, { audio, onAction = () => {}, onPersist = () => {}, onStatus = () => {} } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio;
    this.onAction = onAction;
    this.onPersist = onPersist;
    this.onStatus = onStatus;
    this.roomImages = new Map(HUB_DECKS.flatMap((deck) => deck.rooms).filter((room) => room.id !== DROPSHIP_HANGAR_ART_V55.roomId).map((room) => [room.background, createImage(room.background)]));
    this.farLayers = new Map(HUB_DECKS.map((deck) => [deck.farBackground, createImage(deck.farBackground)]));
    this.propImages = new Map(HUB_MODULAR_PROP_FILES.map((source) => [source, createImage(source)]));
    this.hubArtImages = new Map(HUB_ART_ASSETS_V55.map((source) => [source, createImage(source)]));
    this.playerSheet = createImage(PLAYER_SPRITE_FILE);
    this.npcSheets = NPC_SPRITE_FILES.map(createImage);
    this.crewSheet = this.npcSheets[0];
    this.foregroundLayer = createImage(HUB_FOREGROUND);
    this.keys = new Set();
    this.running = false;
    this.last = 0;
    this.animationTime = 0;
    this.statusKey = '';
    this.reducedMotion = false;
    this.jumpQueued = 0;
    this.coyoteTime = 0;
    this.roomChangePulse = 0;
    this.doorStates = [
      { x: ROOM_WIDTH, lift: false, progress: 0 },
      { x: ROOM_WIDTH * 2, lift: true, progress: 0 },
      { x: ROOM_WIDTH * 3, lift: false, progress: 0 },
      { x: WORLD_WIDTH - 118, lift: true, progress: 0 }
    ];
    this.bind();
  }

  bind() {
    globalThis.addEventListener('keydown', (event) => {
      if (!this.running) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
      this.keys.add(event.code);
      if (event.repeat) return;
      if (event.code === 'Space') this.jumpQueued = 0.14;
      if (event.code === 'KeyE') this.interact();
      if (event.code === 'KeyW' || event.code === 'ArrowUp') this.useLift(-1);
      if (event.code === 'KeyS' || event.code === 'ArrowDown') this.useLift(1);
    });
    globalThis.addEventListener('keyup', (event) => this.keys.delete(event.code));
    globalThis.addEventListener('blur', () => this.keys.clear());
    this.canvas.addEventListener('pointerdown', () => this.audio?.unlock());
  }

  start(hubState = {}) {
    const deck = clamp(Number(hubState.deck) || 0, 0, HUB_DECKS.length - 1);
    const savedRoom = HUB_DECKS[deck].rooms.find((room) => room.id === hubState.roomId);
    const roomIndex = savedRoom?.index ?? 0;
    const defaultX = roomIndex * ROOM_WIDTH + 180;
    this.state = {
      deck,
      roomId: savedRoom?.id || HUB_DECKS[deck].rooms[0].id,
      positionX: clamp(Number(hubState.positionX) || defaultX, 40, WORLD_WIDTH - 90),
      visited: Array.isArray(hubState.visited) ? [...new Set(hubState.visited)] : []
    };
    this.player = { x: this.state.positionX, y: FLOOR_Y - 92, w: 44, h: 92, vx: 0, vy: 0, grounded: true, facing: 1, health: 100, maxHealth: 100, shockClock: 0, shockHits: 0 };
    this.hangarHazardCooldown = 0;
    this.camera = { x: clamp(this.player.x - LOGICAL_WIDTH / 2, 0, WORLD_WIDTH - LOGICAL_WIDTH) };
    this.npcs = this.createNpcs(deck);
    this.obstacles = this.createObstacles(deck);
    this.jumpQueued = 0;
    this.coyoteTime = 0.1;
    this.doorStates.forEach((door) => { door.progress = 0; });
    this.loopToken = (this.loopToken || 0) + 1;
    const token = this.loopToken;
    this.running = true;
    this.last = performance.now();
    this.animationTime = 0;
    this.enterCurrentRoom(true);
    this.draw();
    requestAnimationFrame((time) => this.loop(time, token));
  }

  stop(persist = true) {
    if (!this.running) return;
    if (persist) this.persist();
    this.running = false;
    this.loopToken = (this.loopToken || 0) + 1;
    this.keys.clear();
  }

  setReducedMotion(enabled) { this.reducedMotion = Boolean(enabled); }

  setControl(control, active) {
    const codes = { left: 'KeyA', right: 'KeyD', jump: 'Space' };
    if (control === 'interact' && active) { this.interact(); return; }
    const code = codes[control];
    if (!code) return;
    if (control === 'jump' && active) this.jumpQueued = 0.14;
    active ? this.keys.add(code) : this.keys.delete(code);
  }

  loop(time, token) {
    if (!this.running || token !== this.loopToken) return;
    const delta = Math.min(0.034, (time - this.last) / 1000 || 0);
    this.last = time;
    this.update(delta);
    this.draw();
    requestAnimationFrame((next) => this.loop(next, token));
  }

  update(delta) {
    this.animationTime += delta;
    this.jumpQueued = Math.max(0, this.jumpQueued - delta);
    this.roomChangePulse = Math.max(0, this.roomChangePulse - delta);
    this.player.shockClock = Math.max(0, (this.player.shockClock || 0) - delta);
    this.hangarHazardCooldown = Math.max(0, (this.hangarHazardCooldown || 0) - delta);
    const left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    const right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    const sprinting = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const stunned = this.player.shockClock > 0;
    const targetVelocity = stunned ? 0 : (Number(right) - Number(left)) * (sprinting ? 370 : 270);
    const acceleration = this.player.grounded ? 15 : 8;
    this.player.vx += (targetVelocity - this.player.vx) * Math.min(1, delta * acceleration);
    if (Math.abs(this.player.vx) < 0.4 && !left && !right) this.player.vx = 0;
    if (this.player.vx) this.player.facing = Math.sign(this.player.vx);

    if (this.player.grounded) this.coyoteTime = 0.1;
    else this.coyoteTime = Math.max(0, this.coyoteTime - delta);
    if (!stunned && this.jumpQueued > 0 && this.coyoteTime > 0) {
      this.player.vy = -665;
      this.player.grounded = false;
      this.jumpQueued = 0;
      this.coyoteTime = 0;
    }

    this.player.vy += GRAVITY * delta;
    const previousX = this.player.x;
    const previousBottom = this.player.y + this.player.h;
    this.player.x = clamp(this.player.x + this.player.vx * delta, 24, WORLD_WIDTH - this.player.w - 24);
    this.resolveHorizontal(previousX);
    this.player.y += this.player.vy * delta;
    this.player.grounded = false;
    this.resolveVertical(previousBottom);
    this.applyHangarHazard();

    const targetCamera = clamp(this.player.x - LOGICAL_WIDTH * 0.5, 0, WORLD_WIDTH - LOGICAL_WIDTH);
    this.camera.x += (targetCamera - this.camera.x) * Math.min(1, delta * (this.reducedMotion ? 12 : 5.5));
    for (const npc of this.npcs) {
      npc.x += npc.vx * delta;
      if (npc.x <= npc.min || npc.x >= npc.max) {
        npc.x = clamp(npc.x, npc.min, npc.max);
        npc.vx *= -1;
      }
    }
    const playerCenter = this.player.x + this.player.w / 2;
    for (const door of this.doorStates) {
      const target = Math.abs(playerCenter - door.x) < 182 ? 1 : 0;
      door.progress += (target - door.progress) * Math.min(1, delta * (this.reducedMotion ? 14 : 7));
    }
    this.state.positionX = Math.round(this.player.x);
    this.enterCurrentRoom(false);
    this.emitStatus();
  }

  applyHangarHazard() {
    if (HUB_DECKS[this.state.deck]?.id !== 'engineering' || this.hangarHazardCooldown > 0) return false;
    const room = HUB_DECKS[this.state.deck].rooms.find((entry) => entry.id === DROPSHIP_HANGAR_ART_V55.roomId);
    if (!room) return false;
    const bounds = ELECTRICAL_HAZARD_ART_V55.collisionBounds;
    const collider = { x: room.xStart + bounds.x, y: bounds.y, w: bounds.w, h: bounds.h };
    const feet = { x: this.player.x + 5, y: this.player.y + this.player.h - 14, w: this.player.w - 10, h: 14 };
    if (!overlap(feet, collider)) return false;
    this.player.health = Math.max(0, this.player.health - ELECTRICAL_HAZARD_ART_V55.damage);
    this.player.shockHits += 1;
    this.player.shockClock = ELECTRICAL_HAZARD_ART_V55.stunSeconds;
    this.hangarHazardCooldown = ELECTRICAL_HAZARD_ART_V55.damageIntervalSeconds;
    this.player.vx = 0;
    this.player.vy = -145;
    this.player.grounded = false;
    this.roomChangePulse = Math.max(this.roomChangePulse, 0.55);
    if (this.player.health <= 0) {
      this.player.health = this.player.maxHealth;
      this.player.x = room.xStart + 96;
      this.player.y = FLOOR_Y - this.player.h;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.shockClock = 0.45;
    }
    this.statusKey = '';
    return true;
  }

  createNpcs(deckIndex) {
    return HUB_DECKS[deckIndex].rooms.map((room, index) => ({
      sheet: (room.npcRow + index + deckIndex * 2) % NPC_SPRITE_FILES.length,
      row: 1,
      x: room.xStart + 420 + index * 34,
      y: FLOOR_Y - 92,
      w: 44,
      h: 92,
      vx: index % 2 ? -25 : 22,
      min: room.xStart + 390,
      max: room.xEnd - 210
    }));
  }

  createObstacles(deckIndex) {
    const deck = HUB_DECKS[deckIndex];
    const geometry = deck.rooms.flatMap((room) => room.geometry
      .filter(() => room.id !== DROPSHIP_HANGAR_ART_V55.roomId)
      .map((item) => ({ ...item, roomId: room.id })));
    const hangar = deck.rooms.find((room) => room.id === DROPSHIP_HANGAR_ART_V55.roomId);
    if (hangar) {
      const bounds = DROPSHIP_HANGAR_ART_V55.dropship.collisionBounds;
      geometry.push({
        x: hangar.xStart + bounds.x, y: bounds.y, w: bounds.w, h: bounds.h,
        roomId: hangar.id, role: 'dropship-hull', collisionOnly: true
      });
    }
    return geometry;
  }

  resolveHorizontal(previousX) {
    for (const door of this.doorStates) {
      const collider = getHubDoorBounds(door);
      if (door.progress >= 0.82 || !overlap(this.player, collider)) continue;
      if (this.player.vx > 0 && previousX + this.player.w <= collider.x + 8) {
        this.player.x = collider.x - this.player.w;
      } else if (this.player.vx < 0 && previousX >= collider.x + collider.w - 8) {
        this.player.x = collider.x + collider.w;
      }
      this.player.vx = 0;
    }
    for (const obstacle of this.obstacles) {
      if (!overlap(this.player, obstacle)) continue;
      if (this.player.vx > 0 && previousX + this.player.w <= obstacle.x + 7) {
        this.player.x = obstacle.x - this.player.w;
        this.player.vx = 0;
      }
      if (this.player.vx < 0 && previousX >= obstacle.x + obstacle.w - 7) {
        this.player.x = obstacle.x + obstacle.w;
        this.player.vx = 0;
      }
    }
  }

  resolveVertical(previousBottom) {
    for (const obstacle of this.obstacles) {
      const horizontal = this.player.x + this.player.w > obstacle.x + 4 && this.player.x < obstacle.x + obstacle.w - 4;
      if (horizontal && this.player.vy >= 0 && previousBottom <= obstacle.y + 8 && this.player.y + this.player.h >= obstacle.y) {
        this.player.y = obstacle.y - this.player.h;
        this.player.vy = 0;
        this.player.grounded = true;
      }
    }
    if (this.player.y + this.player.h >= FLOOR_Y) {
      this.player.y = FLOOR_Y - this.player.h;
      this.player.vy = 0;
      this.player.grounded = true;
    }
  }

  currentRoom() {
    const index = clamp(Math.floor((this.player.x + this.player.w / 2) / ROOM_WIDTH), 0, 3);
    return HUB_DECKS[this.state.deck].rooms[index];
  }

  enterCurrentRoom(force) {
    const room = this.currentRoom();
    if (!force && room.id === this.state.roomId) return;
    this.state.roomId = room.id;
    this.roomChangePulse = this.reducedMotion ? 0.35 : 1.25;
    if (!this.state.visited.includes(room.id)) this.state.visited.push(room.id);
    this.persist();
  }

  nearestLift() {
    const playerCenter = this.player.x + this.player.w / 2;
    return this.doorStates.filter((door) => door.lift).map((door) => door.x).find((x) => Math.abs(playerCenter - x) < 128);
  }

  nearestInteraction() {
    const room = this.currentRoom();
    return Math.abs((this.player.x + this.player.w / 2) - room.x) < 150 ? room : null;
  }

  interact() {
    if (!this.running) return;
    const interaction = this.nearestInteraction();
    if (interaction) {
      this.audio?.ui();
      this.onAction({ ...interaction, deck: this.state.deck });
      this.persist();
      return;
    }
    if (this.nearestLift() !== undefined) this.useLift(1, true);
  }

  useLift(direction, wrap = false) {
    if (!this.running || this.nearestLift() === undefined) return;
    let next = this.state.deck + direction;
    if (wrap) next = (this.state.deck + 1) % HUB_DECKS.length;
    if (next < 0 || next >= HUB_DECKS.length || next === this.state.deck) return;
    const roomIndex = this.currentRoom().index;
    this.state.deck = next;
    this.state.roomId = HUB_DECKS[next].rooms[roomIndex]?.id || HUB_DECKS[next].rooms[0].id;
    if (!this.state.visited.includes(this.state.roomId)) this.state.visited.push(this.state.roomId);
    this.npcs = this.createNpcs(next);
    this.obstacles = this.createObstacles(next);
    this.statusKey = '';
    this.roomChangePulse = this.reducedMotion ? 0.35 : 1.25;
    this.audio?.ui();
    this.persist();
    this.emitStatus();
  }

  persist() {
    this.onPersist({
      deck: this.state.deck,
      roomId: this.state.roomId,
      positionX: Math.round(this.player.x),
      visited: [...new Set(this.state.visited)]
    });
  }

  emitStatus() {
    const room = this.currentRoom();
    const interaction = this.nearestInteraction();
    const lift = this.nearestLift();
    const prompt = this.player.shockClock > 0
      ? `SURCHARGE ÉLECTRIQUE · INTÉGRITÉ ${Math.ceil(this.player.health)}%`
      : interaction
      ? `E — ${interaction.description}`
      : lift !== undefined
        ? 'W / S — choisir un pont · E — pont suivant'
        : 'A / D — marcher · MAJ — courir · ESPACE — franchir · E — utiliser';
    const payload = {
      deck: this.state.deck,
      deckName: HUB_DECKS[this.state.deck].name,
      roomId: room.id,
      roomName: room.name,
      prompt,
      visited: this.state.visited.length,
      hubIntegrity: Math.ceil(this.player.health),
      electricalShock: Number(this.player.shockClock.toFixed(2))
    };
    const key = JSON.stringify(payload);
    if (key === this.statusKey) return;
    this.statusKey = key;
    this.onStatus(payload);
  }

  getAssetReport() {
    const roomAssetsReady = [...this.roomImages.values()].filter(assetReady).length;
    const parallaxAssetsReady = [...this.farLayers.values()].filter(assetReady).length;
    const propAssetsReady = [...this.propImages.values()].filter(assetReady).length;
    const hubArtAssetsReady = [...this.hubArtImages.values()].filter(assetReady).length;
    const runtimeArtReady = [this.playerSheet, this.foregroundLayer, ...this.npcSheets].filter(assetReady).length;
    return {
      roomAssetsReady,
      roomAssetCount: this.roomImages.size,
      parallaxAssetsReady,
      parallaxAssetCount: this.farLayers.size,
      propAssetsReady,
      propAssetCount: this.propImages.size,
      hubArtAssetsReady,
      hubArtAssetCount: this.hubArtImages.size,
      readyAssetCount: roomAssetsReady + parallaxAssetsReady + propAssetsReady + hubArtAssetsReady,
      modularAssetCount: HUB_MODULAR_ASSETS.length,
      runtimeArtReady,
      runtimeArtCount: this.npcSheets.length + 2,
      totalReadyAssetCount: roomAssetsReady + parallaxAssetsReady + propAssetsReady + hubArtAssetsReady + runtimeArtReady
    };
  }

  getSnapshot() {
    const room = this.player ? this.currentRoom() : HUB_DECKS[0].rooms[0];
    const assetReport = this.getAssetReport();
    const playerCenter = (this.player?.x || 0) + (this.player?.w || 0) / 2;
    const activeDoor = this.doorStates.reduce((nearest, door) => Math.abs(playerCenter - door.x) < Math.abs(playerCenter - nearest.x) ? door : nearest, this.doorStates[0]);
    return {
      running: this.running,
      deck: this.state?.deck ?? 0,
      roomId: room.id,
      roomBackground: room.id === DROPSHIP_HANGAR_ART_V55.roomId ? null : room.background,
      roomComposition: room.id === DROPSHIP_HANGAR_ART_V55.roomId ? 'modular-v55' : 'room-bitmap',
      x: Math.round(this.player?.x || 0),
      y: Math.round(this.player?.y || 0),
      cameraX: Math.round(this.camera?.x || 0),
      visited: this.state?.visited?.length || 0,
      npcCount: this.npcs?.length || 0,
      obstacleCount: this.obstacles?.length || 0,
      roomSceneScale: room.profile?.sceneScale || 1,
      roomFloorRatio: room.profile?.floorRatio || 0.82,
      roomCollisionSource: room.collisionSource || 'fallback',
      activeDoorState: Number((activeDoor?.progress || 0).toFixed(2)),
      roomAssetsReady: assetReport.roomAssetsReady,
      parallaxAssetsReady: assetReport.parallaxAssetsReady,
      propAssetsReady: assetReport.propAssetsReady,
      hubArtAssetsReady: assetReport.hubArtAssetsReady,
      hubArtAssetCount: assetReport.hubArtAssetCount,
      hubIntegrity: Math.ceil(this.player?.health || 0),
      shockHits: this.player?.shockHits || 0,
      modularAssetCount: assetReport.modularAssetCount,
      readyAssetCount: assetReport.readyAssetCount,
      runtimeArtReady: assetReport.runtimeArtReady,
      totalReadyAssetCount: assetReport.totalReadyAssetCount
    };
  }

  draw() {
    if (!this.player) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    this.drawBackdrop(ctx);
    ctx.save();
    ctx.translate(-this.camera.x, 0);
    this.drawWorld(ctx);
    ctx.restore();
    this.drawForegroundParallax(ctx);
    this.drawHud(ctx);
    ctx.restore();
  }

  drawBackdrop(ctx) {
    const deck = HUB_DECKS[this.state.deck];
    const image = this.farLayers.get(deck.farBackground);
    const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    gradient.addColorStop(0, '#020607');
    gradient.addColorStop(0.58, '#081112');
    gradient.addColorStop(1, '#111712');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    if (assetReady(image)) {
      const height = LOGICAL_HEIGHT;
      const width = image.naturalWidth * (height / image.naturalHeight);
      const offset = -((this.camera.x * 0.14) % width);
      ctx.globalAlpha = 0.78;
      for (let x = offset - width; x < LOGICAL_WIDTH + width; x += width) ctx.drawImage(image, x, 0, width, height);
      ctx.globalAlpha = 1;
    }
    const shade = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    shade.addColorStop(0, 'rgba(0, 4, 7, .12)');
    shade.addColorStop(0.7, 'rgba(0, 5, 5, .05)');
    shade.addColorStop(1, 'rgba(0, 3, 3, .58)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  drawWorld(ctx) {
    const deck = HUB_DECKS[this.state.deck];
    const farImage = this.farLayers.get(deck.farBackground);
    for (const room of deck.rooms) this.drawRoomModule(ctx, room, farImage);

    ctx.fillStyle = 'rgba(5, 10, 9, .84)';
    ctx.fillRect(0, FLOOR_Y, WORLD_WIDTH, LOGICAL_HEIGHT - FLOOR_Y);
    ctx.fillStyle = '#829789';
    ctx.fillRect(0, FLOOR_Y, WORLD_WIDTH, 4);
    ctx.fillStyle = 'rgba(2, 7, 6, .68)';
    for (let x = 12; x < WORLD_WIDTH; x += 48) ctx.fillRect(x, FLOOR_Y + 16, 30, 8);

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
    this.drawPlayer(ctx);
    for (const door of this.doorStates) this.drawDoor(ctx, door);
    for (const room of deck.rooms) if (room.id === DROPSHIP_HANGAR_ART_V55.roomId) this.drawModularHangar(ctx, room, 'front');
  }

  drawRoomModule(ctx, room, farImage) {
    const image = this.roomImages.get(room.background);
    const roomWidth = room.profile?.worldWidth || ROOM_WIDTH;
    const modularHangar = room.id === DROPSHIP_HANGAR_ART_V55.roomId;
    ctx.fillStyle = room.index % 2 ? '#0a1111' : '#080e0f';
    ctx.fillRect(room.xStart, 0, roomWidth, FLOOR_Y);
    if (modularHangar) this.drawModularHangar(ctx, room, 'back');
    else if (assetReady(image)) {
      const width = roomWidth * (room.profile?.sceneScale || 1);
      const height = image.naturalHeight * (width / image.naturalWidth);
      const x = room.xStart + (roomWidth - width) / 2;
      const y = FLOOR_Y - height * (room.profile?.floorRatio || 0.82);
      ctx.save();
      ctx.beginPath();
      ctx.rect(room.xStart, 0, roomWidth, FLOOR_Y);
      ctx.clip();
      ctx.drawImage(image, x, y, width, height);
      ctx.restore();
    }
    this.drawViewportParallax(ctx, room.viewport, farImage);
    const edgeShade = ctx.createLinearGradient(room.xStart, 0, room.xEnd, 0);
    edgeShade.addColorStop(0, 'rgba(0, 3, 4, .42)');
    edgeShade.addColorStop(0.08, 'rgba(0, 3, 4, 0)');
    edgeShade.addColorStop(0.92, 'rgba(0, 3, 4, 0)');
    edgeShade.addColorStop(1, 'rgba(0, 3, 4, .42)');
    ctx.fillStyle = edgeShade;
    ctx.fillRect(room.xStart, 160, roomWidth, FLOOR_Y - 160);
  }

  drawModularHangar(ctx, room, phase) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(room.xStart, 0, room.profile?.worldWidth || ROOM_WIDTH, LOGICAL_HEIGHT);
    ctx.clip();
    for (const entry of DROPSHIP_HANGAR_ART_V55.renderStack) {
      if (entry.phase !== phase || !entry.asset) continue;
      const image = this.hubArtImages.get(entry.asset);
      if (!assetReady(image)) continue;
      const target = entry.renderBounds;
      const targetX = room.xStart + target.x;
      ctx.save();
      if (entry.kind === 'electrical') {
        const pulse = this.reducedMotion ? 0.78 : 0.64 + Math.sin(this.animationTime * 13) * 0.22;
        ctx.globalAlpha = clamp(pulse, 0.38, 0.94);
      }
      if (entry.kind === 'vehicle-sprite') {
        const source = entry.sourceOpaqueBounds;
        const cellX = entry.sourceCell.column * entry.sheet.cellWidth;
        const cellY = entry.sourceCell.row * entry.sheet.cellHeight;
        ctx.drawImage(
          image,
          cellX + source.x, cellY + source.y, source.w, source.h,
          targetX, target.y, target.w, target.h
        );
      } else {
        const source = entry.sourceCrop;
        ctx.drawImage(image, source.x, source.y, source.w, source.h, targetX, target.y, target.w, target.h);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawViewportParallax(ctx, viewport, image) {
    if (!assetReady(image)) return;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(viewport.x, viewport.y, viewport.w, viewport.h, 9);
    ctx.clip();
    ctx.fillStyle = '#020809';
    ctx.fillRect(viewport.x, viewport.y, viewport.w, viewport.h);
    const scale = Math.max(viewport.w / image.naturalWidth, viewport.h / image.naturalHeight) * 1.18;
    const height = image.naturalHeight * scale;
    const width = image.naturalWidth * scale;
    const maxDrift = Math.max(0, width - viewport.w);
    const drift = maxDrift ? (this.camera.x * 0.09) % maxDrift : 0;
    ctx.globalAlpha = 0.68;
    ctx.drawImage(image, viewport.x - drift, viewport.y - (height - viewport.h) / 2, width, height);
    ctx.globalAlpha = 1;
    const glass = ctx.createLinearGradient(viewport.x, viewport.y, viewport.x, viewport.y + viewport.h);
    glass.addColorStop(0, 'rgba(139, 200, 203, .16)');
    glass.addColorStop(0.45, 'rgba(10, 27, 30, .08)');
    glass.addColorStop(1, 'rgba(0, 5, 7, .32)');
    ctx.fillStyle = glass;
    ctx.fillRect(viewport.x, viewport.y, viewport.w, viewport.h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(115, 149, 144, .78)';
    ctx.lineWidth = 5;
    ctx.strokeRect(viewport.x - 3, viewport.y - 3, viewport.w + 6, viewport.h + 6);
    ctx.strokeStyle = 'rgba(6, 12, 12, .92)';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewport.x + 3, viewport.y + 3, viewport.w - 6, viewport.h - 6);
  }

  drawRoomMarker(ctx, room) {
    const current = this.currentRoom().id === room.id;
    if (!current || this.roomChangePulse <= 0) return;
    ctx.fillStyle = current ? 'rgba(9, 21, 17, .82)' : 'rgba(3, 9, 9, .66)';
    ctx.fillRect(room.xStart + 22, 176, 268, 34);
    ctx.strokeStyle = current ? '#8ac89b' : '#3e584d';
    ctx.strokeRect(room.xStart + 22.5, 176.5, 268, 34);
    ctx.fillStyle = current ? '#b9e8c5' : '#95a79d';
    ctx.font = '700 13px ui-monospace, monospace';
    ctx.fillText(`${String(room.index + 1).padStart(2, '0')} · ${room.name.toUpperCase()}`, room.xStart + 36, 198);
  }

  drawInteractionProp(ctx, room) {
    const image = this.propImages.get(room.prop);
    const active = this.nearestInteraction()?.id === room.id;
    const pulse = this.reducedMotion ? 0.45 : 0.45 + Math.sin(this.animationTime * 4) * 0.15;
    if (active) {
      const glow = ctx.createRadialGradient(room.x, FLOOR_Y - room.propHeight * 0.45, 8, room.x, FLOOR_Y - room.propHeight * 0.45, room.propHeight);
      glow.addColorStop(0, `rgba(127, 225, 159, ${pulse})`);
      glow.addColorStop(1, 'rgba(127, 225, 159, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(room.x - room.propHeight, FLOOR_Y - room.propHeight * 1.45, room.propHeight * 2, room.propHeight * 1.6);
    }
    if (assetReady(image)) {
      const height = room.propHeight * (active ? 1.04 : 1);
      const width = image.naturalWidth * (height / image.naturalHeight);
      ctx.drawImage(image, room.x - width / 2, FLOOR_Y - height, width, height);
    }
    ctx.fillStyle = active ? '#9be1ad' : '#d0a952';
    ctx.fillRect(room.x - 3, FLOOR_Y - room.propHeight - 14, 6, 6);
  }

  drawObstacle(ctx, obstacle) {
    if (obstacle.collisionOnly) return;
    const sources = [
      '/assets/openai/hub/props/vehicle-lift.png',
      '/assets/openai/hub/props/mess-table.png',
      '/assets/openai/hub/props/workbench.png'
    ];
    const image = this.propImages.get(sources[obstacle.style]);
    if (assetReady(image)) {
      const scale = Math.min((obstacle.w + 10) / image.naturalWidth, (obstacle.h + 10) / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      ctx.drawImage(image, obstacle.x + (obstacle.w - width) / 2, FLOOR_Y - height, width, height);
    } else {
      ctx.fillStyle = '#2b3732';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    }
  }

  drawDoor(ctx, door) {
    const source = door.lift ? '/assets/openai/hub/props/lift-door.png' : '/assets/openai/hub/props/bulkhead-door.png';
    const image = this.propImages.get(source);
    if (!assetReady(image)) return;
    const { x, y, w: width, h: height } = getHubDoorBounds(door);
    const halfSource = image.naturalWidth / 2;
    const halfTarget = width / 2;
    const slide = door.progress * halfTarget * 0.78;
    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.drawImage(image, 0, 0, halfSource, image.naturalHeight, x - slide, y, halfTarget, height);
    ctx.drawImage(image, halfSource, 0, halfSource, image.naturalHeight, x + halfTarget + slide, y, halfTarget, height);
    ctx.restore();
    ctx.fillStyle = door.progress > 0.5 ? '#89d99f' : '#d15a4d';
    ctx.fillRect(door.x - 3, y + 14, 6, 9);
  }

  drawPlayer(ctx) {
    const moving = Math.abs(this.player.vx) > 8;
    const airborne = !this.player.grounded;
    const row = airborne ? 2 : moving ? 1 : 0;
    const frame = this.reducedMotion ? 0 : Math.floor(this.animationTime * (airborne ? 8 : Math.abs(this.player.vx) > 300 ? 12 : moving ? 9 : 4)) % 4;
    if (assetReady(this.playerSheet)) {
      const width = 110;
      const height = 148;
      const x = this.player.x + this.player.w / 2 - width / 2;
      const y = this.player.y + this.player.h - height * (240 / 256);
      this.drawSheetCell(ctx, this.playerSheet, frame, row, x, y, width, height, this.player.facing < 0, 4, 4);
      return;
    }
    ctx.save();
    ctx.translate(this.player.x + this.player.w / 2, this.player.y);
    ctx.scale(this.player.facing, 1);
    ctx.fillStyle = '#8fbc91'; ctx.fillRect(-18, 26, 36, 54);
    ctx.fillStyle = '#c9b08d'; ctx.fillRect(-12, 5, 24, 22);
    ctx.fillStyle = '#27342e'; ctx.fillRect(-17, 80, 13, 24); ctx.fillRect(5, 80, 13, 24);
    ctx.fillStyle = '#b6c1b8'; ctx.fillRect(8, 42, 44, 9);
    ctx.restore();
  }

  drawSheetCell(ctx, image, column, row, x, y, width, height, flip, columns, rows) {
    if (!assetReady(image)) return;
    const cellWidth = image.naturalWidth / columns;
    const cellHeight = image.naturalHeight / rows;
    ctx.save();
    if (flip) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(image, column * cellWidth, row * cellHeight, cellWidth, cellHeight, 0, 0, width, height);
    } else {
      ctx.drawImage(image, column * cellWidth, row * cellHeight, cellWidth, cellHeight, x, y, width, height);
    }
    ctx.restore();
  }

  drawForegroundParallax(ctx) {
    if (this.currentRoom()?.id === DROPSHIP_HANGAR_ART_V55.roomId) return;
    const image = this.foregroundLayer;
    if (!assetReady(image)) return;
    const height = 220;
    const width = image.naturalWidth * (height / image.naturalHeight);
    const spacing = Math.max(320, width - 18);
    const offset = -((this.camera.x * 1.1) % spacing);
    ctx.save();
    ctx.globalAlpha = 0.25;
    for (let x = offset - spacing; x < LOGICAL_WIDTH + spacing; x += spacing) {
      ctx.drawImage(image, x, LOGICAL_HEIGHT - height, width, height);
    }
    ctx.restore();
  }

  drawHud(ctx) {
    const deck = HUB_DECKS[this.state.deck];
    const room = this.currentRoom();
    const interaction = this.nearestInteraction();
    const lift = this.nearestLift();
    ctx.fillStyle = 'rgba(2, 8, 7, .78)';
    ctx.fillRect(18, 18, 420, 66);
    ctx.strokeStyle = '#648270';
    ctx.strokeRect(18.5, 18.5, 420, 66);
    ctx.fillStyle = '#9adbac';
    ctx.font = '700 15px ui-monospace, monospace';
    ctx.fillText(`USS TANTALUS // ${deck.shortName}`, 36, 46);
    ctx.fillStyle = '#d3ddd5';
    ctx.font = '700 17px ui-monospace, monospace';
    ctx.fillText(room.name.toUpperCase(), 36, 70);
    ctx.fillStyle = '#8fa398';
    ctx.font = '11px ui-monospace, monospace';
    ctx.fillText(`P${this.state.deck + 1}/4 · ${this.state.visited.length}/${HUB_ROOM_COUNT}`, 322, 70);

    if (this.player.shockClock > 0 || interaction || lift !== undefined) {
      ctx.font = '700 14px ui-monospace, monospace';
      const prompt = this.player.shockClock > 0
        ? `CHOC ÉLECTRIQUE · INTÉGRITÉ ${Math.ceil(this.player.health)}% · COMMANDES BLOQUÉES ${this.player.shockClock.toFixed(1)}s`
        : interaction
        ? `E  ${interaction.description.toUpperCase()}`
        : lift !== undefined
          ? 'W / S  CHANGER DE PONT     E  PONT SUIVANT'
          : 'A / D  MARCHER     MAJ  COURIR     ESPACE  FRANCHIR     E  UTILISER';
      const promptWidth = Math.min(900, ctx.measureText(prompt).width + 48);
      const promptX = (LOGICAL_WIDTH - promptWidth) / 2;
      ctx.fillStyle = 'rgba(2, 8, 7, .82)';
      ctx.fillRect(promptX, 656, promptWidth, 46);
      ctx.strokeStyle = '#98d7a8';
      ctx.strokeRect(promptX + 0.5, 656.5, promptWidth, 46);
      ctx.fillStyle = '#b4edc1';
      ctx.fillText(prompt, promptX + 24, 685);
    }

    if (this.player.shockHits > 0 || room.id === DROPSHIP_HANGAR_ART_V55.roomId) {
      ctx.fillStyle = 'rgba(2, 8, 12, .82)';
      ctx.fillRect(18, 94, 238, 34);
      ctx.strokeStyle = this.player.shockClock > 0 ? '#6bd7ff' : '#547e8e';
      ctx.strokeRect(18.5, 94.5, 238, 34);
      ctx.fillStyle = '#20353a';
      ctx.fillRect(30, 115, 210, 5);
      ctx.fillStyle = this.player.shockClock > 0 ? '#6bd7ff' : '#80c6d0';
      ctx.fillRect(30, 115, 210 * this.player.health / this.player.maxHealth, 5);
      ctx.font = '700 11px ui-monospace, monospace';
      ctx.fillText(`INTÉGRITÉ HUB ${Math.ceil(this.player.health)}%`, 30, 108);
    }

    if (!this.state.visited.includes('briefing')) {
      ctx.fillStyle = 'rgba(6, 15, 11, .9)';
      ctx.fillRect(558, 18, 318, 62);
      ctx.strokeStyle = '#8fa95f';
      ctx.strokeRect(558.5, 18.5, 318, 62);
      ctx.fillStyle = '#d2c978';
      ctx.font = '700 11px ui-monospace, monospace';
      ctx.fillText('OBJECTIF DE RELÈVE', 576, 42);
      ctx.fillStyle = '#d4dfd6';
      ctx.font = '700 13px ui-monospace, monospace';
      ctx.fillText('TRAVERSER JUSQU’AU BRIEFING  →', 576, 64);
    }

    const mapX = 918;
    for (let index = 0; index < 4; index += 1) {
      ctx.fillStyle = index === this.state.deck ? '#9bdcac' : '#25352c';
      ctx.fillRect(mapX + index * 72, 34, 58, 12);
      ctx.fillStyle = '#a7b6ad';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText(`P${index + 1}`, mapX + index * 72 + 20, 64);
    }
    const roomMapX = 916;
    for (let index = 0; index < 4; index += 1) {
      ctx.fillStyle = index === room.index ? '#d3c267' : '#425348';
      ctx.fillRect(roomMapX + index * 72, 84, 58, 5);
    }

    if (this.roomChangePulse > 0) {
      const alpha = Math.min(1, this.roomChangePulse * 1.5);
      ctx.fillStyle = `rgba(3, 10, 9, ${0.62 * alpha})`;
      ctx.fillRect(438, 112, 404, 42);
      ctx.strokeStyle = `rgba(141, 204, 157, ${0.72 * alpha})`;
      ctx.strokeRect(438.5, 112.5, 404, 42);
      ctx.fillStyle = `rgba(205, 229, 212, ${alpha})`;
      ctx.font = '700 15px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(room.name.toUpperCase(), 640, 138);
      ctx.textAlign = 'left';
    }
  }
}
