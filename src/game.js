import { shouldFlipSprite } from './sprite-animation-runtime.js';

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const WORLD_WIDTH = 6200;
const WORLD_HEIGHT = 1080;
const FLOOR_Y = 930;
const GRAVITY = 1900;
const CELL_SIZE = 256;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const ready = (image) => Boolean(image?.complete && image.naturalWidth);

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
  rifle: '/assets/openai/sprites/normalized/weapons/m41a-pulse-rifle-action-sheet.png',
  apc: '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png',
  human: '/assets/openai/human-factions-animation-sheet.png',
  synthetic: '/assets/openai/synthetic-android-animation-sheet.png',
  pathogen: '/assets/openai/pathogen-fauna-animation-sheet.png',
  vfx: '/assets/openai/combat-vfx-animation-sheet.png',
  floor: '/assets/openai/metroidvania/props/floor-segment.png',
  catwalk: '/assets/openai/metroidvania/props/overhead-catwalk.png',
  ledge: '/assets/openai/metroidvania/props/short-ledge.png',
  drop: '/assets/openai/metroidvania/props/drop-platform.png',
  ladder: '/assets/openai/metroidvania/props/wall-ladder.png',
  vent: '/assets/openai/metroidvania/props/vent-entrance.png',
  breakable: '/assets/openai/metroidvania/props/breakable-panel.png',
  lockedDoor: '/assets/openai/metroidvania/props/locked-bulkhead.png',
  openDoor: '/assets/openai/metroidvania/props/open-bulkhead.png',
  cover: '/assets/openai/metroidvania/props/cargo-cover.png',
  crates: '/assets/openai/metroidvania/props/supply-crates.png',
  lamp: '/assets/openai/metroidvania/props/warning-lamp.png',
  acid: '/assets/openai/metroidvania/props/acid-floor-hazard.png'
});

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

function selectEnemySprite(source) {
  const name = String(source.name || '').toLowerCase();
  if (name.includes('pale crucible hunter')) return 'paleCrucibleHunter';
  if (name.includes('pathogen mimic')) return 'pathogenMimic';
  if (name.includes('ripper queen')) return 'ripperQueen';
  if (source.caste === 'royal' || name.includes('queen') || name.includes('reine')) return 'xenoQueen';
  if (name === 'runner' || name.includes('dust runner')) return 'xenoRunner';
  if (name.includes('facehugger')) return 'facehugger';
  if (name.includes('neomorph')) return 'neomorph';
  if (source.biology === 'synthetic') return 'workingJoe';
  if (name.includes('warrior') || name.includes('guerrier')) return 'xenoWarrior';
  if (source.biology === 'xenomorph') return 'xenoDrone';
  return 'legacy';
}

function enemyBehavior(spriteKey) {
  if (spriteKey === 'paleCrucibleHunter') return 'pouncer';
  if (spriteKey === 'pathogenMimic') return 'hunter';
  return 'stalker';
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
    this.last = 0;
    this.animationTime = 0;
    this.room = 0;
    this.trackerPulse = 0;
    this.images = new Map(Object.entries(ASSETS).map(([name, source]) => [name, createImage(source)]));
    this.fallbackBackground = createImage('/assets/openai/tantalus-base-environment.png');
    this.bind();
  }

  bind() {
    globalThis.addEventListener('keydown', (event) => {
      if (!this.running) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
      this.keys.add(event.code);
      if (event.repeat) return;
      if (event.code === 'KeyP' || event.code === 'Escape') this.togglePause();
      if (event.code === 'KeyQ') { this.trackerPulse = 1; this.audio?.tracker(); }
      if (event.code === 'KeyV') this.toggleVehicle();
      if (event.code === 'KeyE') this.interact();
      if (event.code === 'Space') this.queueJump = 0.13;
    });
    globalThis.addEventListener('keyup', (event) => this.keys.delete(event.code));
    globalThis.addEventListener('blur', () => this.keys.clear());
    this.canvas.addEventListener('pointerdown', () => { this.audio?.unlock(); this.fire(this.player); });
  }

  start({ seed = 426, world, campaign, enemyCatalog = [], weapon } = {}) {
    const random = seeded(seed);
    this.world = world;
    this.campaign = campaign;
    this.weapon = weapon;
    this.room = 0;
    this.camera = { x: 0, y: 250 };
    this.player = this.createPlayer(160, FLOOR_Y - 92, '#92d6a6', false);
    this.coop = this.createPlayer(105, FLOOR_Y - 92, '#e0bc6b', true);
    this.platforms = [
      { x: -300, y: FLOOR_Y, w: WORLD_WIDTH + 600, h: WORLD_HEIGHT - FLOOR_Y + 120, art: 'floor', floor: true },
      ...PLATFORM_LAYOUT.map((platform) => ({ ...platform }))
    ];
    this.ladders = LADDER_LAYOUT.map((ladder) => ({ ...ladder, w: 52 }));
    this.covers = COVER_LAYOUT.map((cover) => ({ ...cover }));
    this.doors = [
      { x: 1210, y: FLOOR_Y - 176, w: 70, h: 176, open: false, progress: 0 },
      { x: 2390, y: FLOOR_Y - 176, w: 70, h: 176, open: false, progress: 0, lockedBy: 'power' },
      { x: 3590, y: FLOOR_Y - 176, w: 70, h: 176, open: false, progress: 0 },
      { x: 4810, y: FLOOR_Y - 176, w: 70, h: 176, open: false, progress: 0 }
    ];
    this.powerNode = { x: 1900, y: 630, w: 52, h: 62, active: false };
    this.ventShortcut = { x: 3340, y: 512, w: 90, h: 80, open: false };
    this.vehicle = { x: 4210, y: FLOOR_Y - 104, w: 190, h: 104, occupied: false, hull: 340 };
    this.weaponPickup = { x: 1080, y: FLOOR_Y - 54, w: 126, h: 54, taken: false };
    this.bullets = [];
    this.particles = [];
    this.enemies = Array.from({ length: 16 }, (_, index) => {
      const source = enemyCatalog[(index * 11 + seed) % Math.max(1, enemyCatalog.length)] || { name: 'Xenomorph Warrior', health: 80, damage: 12, speed: 1.2, biology: 'xenomorph' };
      const spriteKey = selectEnemySprite(source);
      const royal = source.caste === 'royal';
      const platform = index % 4 === 2 ? PLATFORM_LAYOUT[(index * 3) % PLATFORM_LAYOUT.length] : null;
      const height = royal ? 112 : source.biology === 'xenomorph' ? 74 : 88;
      const groundY = platform?.y ?? FLOOR_Y;
      return {
        id: `${source.id || 'enemy'}:${index}`,
        name: source.name,
        biology: source.biology,
        spriteKey,
        behavior: enemyBehavior(spriteKey),
        row: index % 4,
        x: 660 + index * 325 + random() * 90,
        y: groundY - height,
        groundY,
        w: royal ? 72 : source.biology === 'xenomorph' ? 52 : 42,
        h: height,
        health: Math.min(240, source.health),
        maxHealth: Math.min(240, source.health),
        damage: Math.min(25, source.damage),
        speed: 55 + source.speed * 35,
        facing: -1,
        alert: false,
        attacking: false,
        alive: true,
        attackClock: random()
      };
    });
    this.objective = { x: 5900, y: FLOOR_Y - 90, w: 66, h: 90, complete: false };
    this.queueJump = 0;
    this.coyoteTime = 0.1;
    this.running = true;
    this.paused = false;
    this.last = performance.now();
    this.animationTime = 0;
    requestAnimationFrame((time) => this.loop(time));
  }

  createPlayer(x, y, color, coop) {
    return {
      x, y, w: 42, h: 92, vx: 0, vy: 0, facing: 1, grounded: false, climbing: false, crouching: false,
      health: 100, armor: 50, ammo: 99, color, coop, alive: true, fireClock: 0, actionClock: 0, kills: 0
    };
  }

  stop() { this.running = false; }
  togglePause() { if (this.running) this.paused = !this.paused; }
  setCoop(enabled) { this.coopEnabled = Boolean(enabled); }

  loop(time) {
    if (!this.running) return;
    const delta = Math.min(0.034, (time - this.last) / 1000 || 0);
    this.last = time;
    if (!this.paused) this.update(delta);
    this.draw();
    requestAnimationFrame((next) => this.loop(next));
  }

  update(delta) {
    this.animationTime += delta;
    this.queueJump = Math.max(0, this.queueJump - delta);
    this.updatePlayer(this.player, delta, { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' });
    if (this.coopEnabled) this.updatePlayer(this.coop, delta, { left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', jump: 'KeyU', fire: 'KeyO' });

    for (const bullet of this.bullets) bullet.x += bullet.vx * delta;
    this.bullets = this.bullets.filter((bullet) => bullet.x > -100 && bullet.x < WORLD_WIDTH + 100 && bullet.life-- > 0);

    for (const door of this.doors) {
      const target = door.open ? 1 : 0;
      door.progress += (target - door.progress) * Math.min(1, delta * 8);
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const target = this.coopEnabled && Math.abs(this.coop.x - enemy.x) < Math.abs(this.player.x - enemy.x) ? this.coop : this.player;
      const distance = target.x - enemy.x;
      if (Math.abs(distance) < 520) enemy.alert = true;
      if (enemy.alert && Math.abs(distance) > enemy.w * 0.7) {
        enemy.facing = Math.sign(distance) || enemy.facing;
        const speedMultiplier = enemy.behavior === 'hunter' ? 1.28 : enemy.behavior === 'pouncer' ? 1.38 : 1;
        enemy.x += enemy.facing * enemy.speed * speedMultiplier * delta;
      }
      enemy.attackClock -= delta;
      enemy.attacking = Math.abs(distance) < 90 && enemy.attackClock < 0.28;
      if (overlap(enemy, target) && enemy.attackClock <= 0) {
        this.damagePlayer(target, enemy.damage);
        enemy.attackClock = enemy.behavior === 'pouncer' ? 1.1 : 0.8;
      }
      for (const bullet of this.bullets) {
        if (!bullet.hit && overlap(bullet, enemy)) {
          enemy.health -= bullet.damage;
          bullet.hit = true;
          this.spawnImpact(bullet.x, bullet.y, enemy.biology === 'xenomorph' ? '#a7c742' : '#dc8a62');
          this.audio?.hit();
          if (enemy.health <= 0) {
            enemy.alive = false;
            bullet.owner.kills += 1;
            this.onEvent({ type: 'kill', enemy });
          }
        }
      }
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.hit);
    if (overlap(this.player, this.objective) && !this.objective.complete) {
      this.objective.complete = true;
      this.onEvent({ type: 'mission-complete', kills: this.player.kills + this.coop.kills });
    }

    const lookAhead = clamp(this.player.vx * 0.48, -150, 190);
    const targetX = clamp(this.player.x - 430 + lookAhead, 0, WORLD_WIDTH - LOGICAL_WIDTH);
    const targetY = clamp(this.player.y - 420 + this.player.vy * 0.08, 0, WORLD_HEIGHT - LOGICAL_HEIGHT);
    this.camera.x += (targetX - this.camera.x) * Math.min(1, delta * 5.2);
    this.camera.y += (targetY - this.camera.y) * Math.min(1, delta * 4.4);
    this.room = Math.floor((this.player.x + 200) / 1200);
    this.trackerPulse = Math.max(0, this.trackerPulse - delta * 0.55);
    for (const particle of this.particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.life -= delta;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  updatePlayer(player, delta, controls) {
    if (!player.alive) return;
    const left = this.keys.has(controls.left) || (!player.coop && this.keys.has('ArrowLeft'));
    const right = this.keys.has(controls.right) || (!player.coop && this.keys.has('ArrowRight'));
    const up = this.keys.has(controls.up) || (!player.coop && this.keys.has('ArrowUp'));
    const down = this.keys.has(controls.down) || (!player.coop && this.keys.has('ArrowDown'));
    const ladder = this.nearestLadder(player);
    if (ladder && (up || down)) player.climbing = true;
    if (player.climbing && !ladder) player.climbing = false;

    player.crouching = down && !player.climbing && player.grounded;
    const speed = this.vehicle.occupied && !player.coop ? 390 : player.crouching ? 105 : 245;
    const targetVelocity = (Number(right) - Number(left)) * speed;
    player.vx += (targetVelocity - player.vx) * Math.min(1, delta * (player.grounded ? 16 : 8));
    if (!left && !right && Math.abs(player.vx) < 0.5) player.vx = 0;
    if (player.vx) player.facing = Math.sign(player.vx);

    if (player.climbing && ladder) {
      player.x += (ladder.x - player.w / 2 - player.x) * Math.min(1, delta * 12);
      player.vy = (Number(down) - Number(up)) * 185;
      player.y = clamp(player.y + player.vy * delta, ladder.top - player.h + 12, ladder.bottom - player.h);
      player.grounded = false;
      if (this.queueJump > 0 || this.keys.has(controls.jump)) {
        player.climbing = false;
        player.vy = -470;
        this.queueJump = 0;
      }
    } else {
      if (player.grounded) this.coyoteTime = 0.1;
      else this.coyoteTime = Math.max(0, this.coyoteTime - delta);
      if ((this.queueJump > 0 || this.keys.has(controls.jump)) && this.coyoteTime > 0) {
        player.vy = -665;
        player.grounded = false;
        this.coyoteTime = 0;
        this.queueJump = 0;
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
    player.fireClock = Math.max(0, player.fireClock - delta);
    player.actionClock = Math.max(0, player.actionClock - delta);
    if (this.keys.has(controls.fire)) this.fire(player);
    if (player.y > WORLD_HEIGHT + 100) {
      player.x = Math.max(80, player.x - 180);
      player.y = FLOOR_Y - player.h;
      player.health -= 20;
    }
  }

  nearestLadder(entity) {
    const center = entity.x + entity.w / 2;
    return this.ladders.find((ladder) => Math.abs(center - ladder.x) < 46 && entity.y + entity.h > ladder.top - 25 && entity.y < ladder.bottom + 20);
  }

  resolveHorizontal(entity, previousX) {
    for (const door of this.doors) {
      if (door.progress >= 0.82 || !overlap(entity, door)) continue;
      if (entity.vx > 0 && previousX + entity.w <= door.x + 8) entity.x = door.x - entity.w;
      else if (entity.vx < 0 && previousX >= door.x + door.w - 8) entity.x = door.x + door.w;
      entity.vx = 0;
    }
    for (const cover of this.covers) {
      if (!overlap(entity, cover)) continue;
      if (entity.vx > 0 && previousX + entity.w <= cover.x + 7) entity.x = cover.x - entity.w;
      else if (entity.vx < 0 && previousX >= cover.x + cover.w - 7) entity.x = cover.x + cover.w;
    }
  }

  resolveVertical(entity, previousBottom) {
    for (const platform of this.platforms) {
      const horizontal = entity.x + entity.w > platform.x + 4 && entity.x < platform.x + platform.w - 4;
      if (horizontal && entity.vy >= 0 && previousBottom <= platform.y + 12 && entity.y + entity.h >= platform.y) {
        entity.y = platform.y - entity.h;
        entity.vy = 0;
        entity.grounded = true;
      }
    }
  }

  fire(player) {
    if (!player?.alive || player.fireClock > 0 || player.ammo <= 0 || this.paused) return;
    player.fireClock = 0.13;
    player.actionClock = 0.22;
    player.ammo -= 1;
    this.bullets.push({
      x: player.x + player.w / 2 + player.facing * 24,
      y: player.y + 37,
      w: 18,
      h: 5,
      vx: player.facing * 890,
      damage: this.weapon?.damage || 26,
      owner: player,
      life: 260,
      hit: false
    });
    this.audio?.shot();
    this.onEvent({ type: 'shot' });
  }

  spawnImpact(x, y, color) {
    for (let index = 0; index < 8; index += 1) {
      this.particles.push({ x, y, vx: (index - 3.5) * 38, vy: -45 - (index % 3) * 28, life: 0.3 + index * 0.02, color });
    }
  }

  damagePlayer(player, amount) {
    const absorbed = Math.min(player.armor, amount * 0.55);
    player.armor -= absorbed;
    player.health -= amount - absorbed;
    player.actionClock = 0.35;
    if (player.health <= 0) {
      player.health = 0;
      player.alive = false;
      this.onEvent({ type: 'player-down', coop: player.coop });
    }
  }

  interact() {
    const playerCenter = this.player.x + this.player.w / 2;
    const door = this.doors.find((candidate) => Math.abs(playerCenter - (candidate.x + candidate.w / 2)) < 118);
    if (door) {
      if (door.lockedBy === 'power' && !this.powerNode.active) {
        this.onEvent({ type: 'locked', requirement: 'RÉTABLIR LE CIRCUIT AUXILIAIRE' });
        this.audio?.alarm();
        return;
      }
      door.open = !door.open;
      this.audio?.ui();
      return;
    }
    if (Math.abs(playerCenter - this.powerNode.x) < 120 && Math.abs(this.player.y - this.powerNode.y) < 130) {
      this.powerNode.active = true;
      this.onEvent({ type: 'power-restored' });
      this.audio?.ui();
      return;
    }
    if (Math.abs(playerCenter - this.ventShortcut.x) < 120 && Math.abs(this.player.y - this.ventShortcut.y) < 130) {
      this.ventShortcut.open = true;
      this.player.x = 3740;
      this.player.y = 704 - this.player.h;
      this.onEvent({ type: 'shortcut' });
      this.audio?.ui();
      return;
    }
    if (!this.weaponPickup.taken && Math.abs(playerCenter - (this.weaponPickup.x + this.weaponPickup.w / 2)) < 118) {
      this.weaponPickup.taken = true;
      this.player.ammo += 60;
      this.onEvent({ type: 'supply', item: 'M41A' });
      this.audio?.ui();
      return;
    }
    if (Math.abs(this.player.x - this.vehicle.x) < 190) this.toggleVehicle();
  }

  toggleVehicle() {
    if (Math.abs(this.player.x - this.vehicle.x) > 200 && !this.vehicle.occupied) return;
    this.vehicle.occupied = !this.vehicle.occupied;
    this.audio?.ui();
    this.onEvent({ type: 'vehicle', occupied: this.vehicle.occupied });
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
    if (this.paused) {
      ctx.fillStyle = 'rgba(2, 7, 6, .78)';
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.fillStyle = '#d8e6d8';
      ctx.font = '700 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OPÉRATION EN PAUSE', LOGICAL_WIDTH / 2, 330);
      ctx.font = '18px monospace';
      ctx.fillStyle = '#83d5a1';
      ctx.fillText('P / ÉCHAP pour reprendre', LOGICAL_WIDTH / 2, 372);
      ctx.textAlign = 'left';
    }
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
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,3,4,.62)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  drawWorld(ctx) {
    this.drawFloor(ctx);
    for (const platform of this.platforms.filter((item) => !item.floor)) this.drawPlatform(ctx, platform);
    for (const ladder of this.ladders) this.drawLadder(ctx, ladder);
    for (const cover of this.covers) this.drawWorldProp(ctx, cover.art, cover.x, cover.y + cover.h, cover.h, cover.w);
    this.drawWorldProp(ctx, 'vent', this.ventShortcut.x, this.ventShortcut.y + this.ventShortcut.h, this.ventShortcut.h, this.ventShortcut.w);
    this.drawPowerNode(ctx);
    for (const door of this.doors) this.drawDoor(ctx, door);
    this.drawVehicle(ctx);
    this.drawWeaponPickup(ctx);
    this.drawActor(ctx, this.player);
    if (this.coopEnabled) this.drawActor(ctx, this.coop);
    for (const enemy of this.enemies) if (enemy.alive) this.drawEnemy(ctx, enemy);
    for (const bullet of this.bullets) this.drawBullet(ctx, bullet);
    for (const particle of this.particles) {
      ctx.globalAlpha = clamp(particle.life * 3, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, 4, 4);
    }
    ctx.globalAlpha = 1;
    this.drawObjective(ctx);
  }

  drawFloor(ctx) {
    const image = this.images.get('floor');
    ctx.fillStyle = '#121a18';
    ctx.fillRect(-200, FLOOR_Y, WORLD_WIDTH + 400, WORLD_HEIGHT - FLOOR_Y + 120);
    if (!ready(image)) return;
    const height = 92;
    const width = image.naturalWidth * (height / image.naturalHeight);
    for (let x = -40; x < WORLD_WIDTH + width; x += width - 4) ctx.drawImage(image, x, FLOOR_Y - 28, width, height);
  }

  drawPlatform(ctx, platform) {
    const image = this.images.get(platform.art);
    ctx.fillStyle = '#19231f';
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    if (!ready(image)) return;
    const height = platform.art === 'ledge' ? 72 : 64;
    const width = image.naturalWidth * (height / image.naturalHeight);
    ctx.save();
    ctx.beginPath();
    ctx.rect(platform.x, platform.y - height + 22, platform.w, height + 12);
    ctx.clip();
    for (let x = platform.x; x < platform.x + platform.w + width; x += Math.max(24, width - 8)) {
      ctx.drawImage(image, x, platform.y - height + 22, width, height);
    }
    ctx.restore();
  }

  drawLadder(ctx, ladder) {
    const image = this.images.get('ladder');
    if (!ready(image)) {
      ctx.strokeStyle = '#7f8f84';
      ctx.strokeRect(ladder.x - 20, ladder.top, 40, ladder.bottom - ladder.top);
      return;
    }
    const width = 50;
    const height = image.naturalHeight * (width / image.naturalWidth);
    ctx.save();
    ctx.beginPath();
    ctx.rect(ladder.x - width / 2, ladder.top, width, ladder.bottom - ladder.top);
    ctx.clip();
    for (let y = ladder.top; y < ladder.bottom + height; y += height - 6) ctx.drawImage(image, ladder.x - width / 2, y, width, height);
    ctx.restore();
  }

  drawWorldProp(ctx, art, x, footY, maxHeight, maxWidth) {
    const image = this.images.get(art);
    if (!ready(image)) return;
    const scale = Math.min(maxHeight / image.naturalHeight, maxWidth / image.naturalWidth);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    ctx.drawImage(image, x + (maxWidth - width) / 2, footY - height, width, height);
  }

  drawPowerNode(ctx) {
    const image = this.images.get(this.powerNode.active ? 'lamp' : 'breakable');
    if (ready(image)) {
      const height = 74;
      const width = image.naturalWidth * (height / image.naturalHeight);
      ctx.drawImage(image, this.powerNode.x - width / 2, this.powerNode.y + this.powerNode.h - height, width, height);
    }
    ctx.fillStyle = this.powerNode.active ? '#87e3a4' : '#d99b55';
    ctx.beginPath();
    ctx.arc(this.powerNode.x, this.powerNode.y - 10, 4 + Math.sin(this.animationTime * 5) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawDoor(ctx, door) {
    const image = this.images.get(door.progress >= 0.82 ? 'openDoor' : 'lockedDoor');
    if (!ready(image)) return;
    const height = 198;
    const width = image.naturalWidth * (height / image.naturalHeight);
    const x = door.x + door.w / 2 - width / 2;
    const y = FLOOR_Y - height;
    ctx.globalAlpha = door.progress >= 0.82 ? 0.82 : 1;
    ctx.drawImage(image, x, y, width, height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = door.lockedBy === 'power' && !this.powerNode.active ? '#d04f47' : door.open ? '#83d99e' : '#d6ac59';
    ctx.fillRect(door.x + door.w + 8, y + 30, 7, 13);
  }

  drawWeaponPickup(ctx) {
    if (this.weaponPickup.taken) return;
    const image = this.images.get('rifle');
    if (!ready(image)) return;
    const frame = Math.floor(this.animationTime * 4) % 4;
    const width = 126;
    const height = 72;
    const x = this.weaponPickup.x + this.weaponPickup.w / 2 - width / 2;
    const y = this.weaponPickup.y + this.weaponPickup.h - height * (240 / CELL_SIZE);
    this.drawSheetCell(ctx, image, frame, 0, x, y, width, height, false);
  }

  drawVehicle(ctx) {
    const image = this.images.get('apc');
    if (!ready(image)) return;
    const row = this.vehicle.occupied ? 1 : this.vehicle.hull < 200 ? 3 : 0;
    const frame = Math.floor(this.animationTime * (this.vehicle.occupied ? 9 : 2)) % 4;
    const width = 250;
    const height = 140;
    const x = this.vehicle.x + this.vehicle.w / 2 - width / 2;
    const y = this.vehicle.y + this.vehicle.h - height * (240 / CELL_SIZE);
    this.drawSheetCell(ctx, image, frame, row, x, y, width, height, false);
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
  }

  drawEnemy(ctx, enemy) {
    let image;
    let row = enemy.row;
    let sheetId = null;
    const frame = Math.floor(this.animationTime * (enemy.alert ? 9 : 4) + enemy.row) % 4;
    let renderWidth = 84;
    let renderHeight = 112;
    if (enemy.spriteKey === 'ripperQueen') {
      image = this.images.get('ripperQueen'); sheetId = 'enemy.ripper-queen.action'; row = enemy.attacking ? 2 : enemy.alert ? 1 : 0; renderWidth = 224; renderHeight = 170;
    } else if (enemy.spriteKey === 'xenoQueen') {
      image = this.images.get('xenoQueen'); sheetId = 'enemy.xenomorph-queen.combat'; row = enemy.attacking ? 2 : enemy.alert ? 1 : 0; renderWidth = 224; renderHeight = 170;
    } else if (enemy.spriteKey === 'xenoRunner') {
      image = this.images.get('xenoRunner'); sheetId = 'enemy.xenomorph-runner.action'; row = enemy.attacking ? 2 : enemy.alert ? 1 : 0; renderWidth = 168; renderHeight = 100;
    } else if (enemy.spriteKey === 'paleCrucibleHunter') {
      image = this.images.get('paleCrucibleHunter'); sheetId = 'enemy.pale-crucible-hunter.action'; row = enemy.attacking ? 2 : enemy.alert ? 1 : 0; renderWidth = 142; renderHeight = 106;
    } else if (enemy.spriteKey === 'pathogenMimic') {
      image = this.images.get('pathogenMimic'); sheetId = 'enemy.pathogen-mimic.action'; row = enemy.attacking ? 2 : enemy.alert ? 1 : 0; renderWidth = 132; renderHeight = 96;
    } else if (enemy.spriteKey === 'xenoWarrior') {
      image = this.images.get('xenoWarrior'); sheetId = 'enemy.xenomorph-warrior.combat'; row = enemy.attacking ? 2 : enemy.alert ? 1 : 0; renderWidth = 158; renderHeight = 120;
    } else if (enemy.spriteKey === 'facehugger') {
      image = this.images.get('facehugger'); sheetId = 'enemy.facehugger.locomotion'; row = enemy.attacking ? 2 : enemy.alert ? 1 : 0; renderWidth = 112; renderHeight = 72;
    } else if (enemy.spriteKey === 'neomorph') {
      image = this.images.get('neomorph'); sheetId = 'enemy.neomorph.locomotion'; row = enemy.attacking ? 2 : enemy.alert ? 1 : 0; renderWidth = 146; renderHeight = 112;
    } else if (enemy.spriteKey === 'workingJoe') {
      image = this.images.get('workingJoe'); sheetId = 'enemy.working-joe.combat'; row = enemy.attacking ? 1 : 0; renderWidth = 88; renderHeight = 116;
    } else if (enemy.spriteKey === 'xenoDrone') {
      image = this.images.get(enemy.attacking ? 'xenoCombat' : 'xenoLocomotion');
      sheetId = enemy.attacking ? 'enemy.xenomorph-drone.combat' : 'enemy.xenomorph-drone.locomotion';
      row = enemy.attacking ? 1 : enemy.alert ? 1 : 0; renderWidth = 142; renderHeight = 106;
    } else if (enemy.biology === 'human') {
      image = this.images.get('human');
    } else if (enemy.biology === 'synthetic') {
      image = this.images.get('synthetic');
    } else {
      image = this.images.get('pathogen'); renderWidth = 132; renderHeight = 96;
    }
    const x = enemy.x + enemy.w / 2 - renderWidth / 2;
    const y = enemy.y + enemy.h - renderHeight * (240 / CELL_SIZE);
    const flip = sheetId ? shouldFlipSprite(sheetId, enemy.facing) : enemy.facing > 0;
    this.drawSheetCell(ctx, image, frame, row, x, y, renderWidth, renderHeight, flip);
    if (enemy.alert) {
      ctx.fillStyle = '#be5551';
      ctx.fillRect(enemy.x, enemy.y - 10, enemy.w * (enemy.health / enemy.maxHealth), 3);
    }
  }

  drawBullet(ctx, bullet) {
    const image = this.images.get('vfx');
    if (ready(image)) {
      const frame = 1 + (Math.floor(this.animationTime * 24) % 3);
      this.drawSheetCell(ctx, image, frame, 0, bullet.x - 8, bullet.y - 8, 34, 18, bullet.vx < 0);
      return;
    }
    ctx.fillStyle = '#f5d87a';
    ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
  }

  drawObjective(ctx) {
    const image = this.images.get(this.objective.complete ? 'lamp' : 'crates');
    if (ready(image)) {
      const height = this.objective.complete ? 92 : 86;
      const width = image.naturalWidth * (height / image.naturalHeight);
      ctx.drawImage(image, this.objective.x - width / 2, FLOOR_Y - height, width, height);
    }
    ctx.fillStyle = this.objective.complete ? '#79d69a' : '#d5b562';
    ctx.beginPath();
    ctx.arc(this.objective.x, FLOOR_Y - 104, 5 + Math.sin(this.animationTime * 4) * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSheetCell(ctx, image, column, row, x, y, width, height, flip) {
    if (!ready(image)) return;
    const cellWidth = image.naturalWidth / 4;
    const cellHeight = image.naturalHeight / 4;
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

  drawForeground(ctx) {
    const image = this.images.get('foreground');
    if (!ready(image)) return;
    const height = 220;
    const width = image.naturalWidth * (height / image.naturalHeight);
    const offset = -((this.camera.x * 1.12) % width);
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let x = offset - width; x < LOGICAL_WIDTH + width; x += width - 12) ctx.drawImage(image, x, LOGICAL_HEIGHT - height, width, height);
    ctx.restore();
  }

  drawHud(ctx) {
    ctx.fillStyle = 'rgba(3, 10, 8, .78)';
    ctx.fillRect(18, 16, 390, 72);
    ctx.strokeStyle = '#668b71';
    ctx.strokeRect(18.5, 16.5, 390, 72);
    ctx.fillStyle = '#9be0ae';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(this.campaign?.name?.toUpperCase() || 'OPÉRATION TANTALUS', 34, 39);
    ctx.fillStyle = '#ccd9cc';
    ctx.font = '12px monospace';
    ctx.fillText(`PV ${Math.ceil(this.player.health)}  ARM ${Math.ceil(this.player.armor)}  MUN ${this.player.ammo}`, 34, 62);
    ctx.fillStyle = '#8ea898';
    ctx.fillText(`SECTEUR ${this.room + 1}/6 · ${this.powerNode.active ? 'CIRCUIT OK' : 'CIRCUIT HORS-LIGNE'}`, 34, 80);

    const progress = clamp(this.player.x / (WORLD_WIDTH - 200), 0, 1);
    ctx.fillStyle = 'rgba(3, 10, 8, .74)';
    ctx.fillRect(474, 20, 332, 20);
    ctx.fillStyle = '#26372e';
    ctx.fillRect(486, 28, 308, 4);
    ctx.fillStyle = '#8bd6a0';
    ctx.fillRect(486, 28, 308 * progress, 4);

    const door = this.doors.find((candidate) => Math.abs(this.player.x - candidate.x) < 118);
    const nearPower = Math.abs(this.player.x - this.powerNode.x) < 120 && Math.abs(this.player.y - this.powerNode.y) < 130;
    const prompt = door
      ? door.lockedBy === 'power' && !this.powerNode.active ? 'E  VERROUILLÉ — RÉTABLIR LE CIRCUIT' : 'E  ACTIONNER LA PORTE'
      : nearPower ? 'E  RÉTABLIR LE CIRCUIT AUXILIAIRE'
        : this.nearestLadder(this.player) ? 'W / S  GRIMPER     ESPACE  SAUTER'
          : '';
    if (prompt) {
      ctx.font = '700 13px monospace';
      const width = Math.min(620, ctx.measureText(prompt).width + 44);
      ctx.fillStyle = 'rgba(3, 10, 8, .84)';
      ctx.fillRect((LOGICAL_WIDTH - width) / 2, 654, width, 38);
      ctx.strokeStyle = '#86c797';
      ctx.strokeRect((LOGICAL_WIDTH - width) / 2 + 0.5, 654.5, width, 38);
      ctx.fillStyle = '#c7e7ce';
      ctx.textAlign = 'center';
      ctx.fillText(prompt, LOGICAL_WIDTH / 2, 678);
      ctx.textAlign = 'left';
    }

    if (this.trackerPulse > 0) {
      ctx.fillStyle = 'rgba(4, 18, 12, .82)';
      ctx.fillRect(1072, 18, 170, 152);
      ctx.strokeStyle = '#689177';
      ctx.strokeRect(1072.5, 18.5, 170, 152);
      ctx.strokeStyle = `rgba(140, 232, 163, ${this.trackerPulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(1157, 94, 76 * (1 - this.trackerPulse) + 16, 0, Math.PI * 2);
      ctx.stroke();
      for (const enemy of this.enemies.filter((item) => item.alive && Math.abs(item.x - this.player.x) < 650).slice(0, 12)) {
        ctx.fillStyle = '#a8e4ad';
        ctx.fillRect(1157 + (enemy.x - this.player.x) * 0.1, 94 + (enemy.y - this.player.y) * 0.08, 5, 5);
      }
    }
    if (this.objective.complete) {
      ctx.fillStyle = '#8fe0a7';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OBJECTIF ACCOMPLI — EXTRACTION AUTORISÉE', LOGICAL_WIDTH / 2, 620);
      ctx.textAlign = 'left';
    }
  }

  getAssetReport() {
    const entries = [...this.images.entries()];
    return {
      ready: entries.filter(([, image]) => ready(image)).length,
      total: entries.length,
      missing: entries.filter(([, image]) => !ready(image)).map(([name]) => name)
    };
  }

  getSnapshot() {
    const assets = this.getAssetReport();
    return {
      running: this.running,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      platformCount: this.platforms?.length || 0,
      ladderCount: this.ladders?.length || 0,
      doorCount: this.doors?.length || 0,
      player: this.player ? { x: Math.round(this.player.x), y: Math.round(this.player.y), w: this.player.w, h: this.player.h, climbing: this.player.climbing } : null,
      camera: this.camera ? { x: Math.round(this.camera.x), y: Math.round(this.camera.y) } : null,
      powerRestored: Boolean(this.powerNode?.active),
      assets
    };
  }
}
