const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const GRAVITY = 1900;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
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
    this.room = 0;
    this.trackerPulse = 0;
    this.background = new Image();
    this.background.src = '/assets/openai/tantalus-base-environment.png';
    this.bind();
  }

  bind() {
    globalThis.addEventListener('keydown', (event) => {
      if (!this.running) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
      this.keys.add(event.code);
      if (event.code === 'KeyP' || event.code === 'Escape') this.togglePause();
      if (event.code === 'KeyQ') { this.trackerPulse = 1; this.audio?.tracker(); }
      if (event.code === 'KeyV') this.toggleVehicle();
      if (event.code === 'KeyE') this.interact();
    });
    globalThis.addEventListener('keyup', (event) => this.keys.delete(event.code));
    this.canvas.addEventListener('pointerdown', () => { this.audio?.unlock(); this.fire(this.player); });
  }

  start({ seed = 426, world, campaign, enemyCatalog = [], weapon } = {}) {
    const random = seeded(seed);
    this.world = world;
    this.campaign = campaign;
    this.weapon = weapon;
    this.room = 0;
    this.camera = { x: 0, y: 0 };
    this.player = this.createPlayer(160, 510, '#92d6a6', false);
    this.coop = this.createPlayer(110, 510, '#e0bc6b', true);
    this.platforms = [
      { x: -300, y: 650, w: 3500, h: 90 }, { x: 420, y: 535, w: 300, h: 28 },
      { x: 820, y: 430, w: 280, h: 28 }, { x: 1220, y: 570, w: 420, h: 28 },
      { x: 1760, y: 465, w: 320, h: 28 }, { x: 2200, y: 380, w: 420, h: 28 }
    ];
    this.doors = [{ x: 1170, y: 505, w: 40, h: 145, open: false }, { x: 2145, y: 505, w: 42, h: 145, open: false }];
    this.vehicle = { x: 1450, y: 570, w: 160, h: 80, occupied: false, hull: 340 };
    this.bullets = [];
    this.particles = [];
    this.enemies = Array.from({ length: 15 }, (_, index) => {
      const source = enemyCatalog[(index * 11 + seed) % Math.max(1, enemyCatalog.length)] || { name: 'Xenomorph Warrior', health: 80, damage: 12, speed: 1.2, biology: 'xenomorph' };
      return {
        id: `${source.id || 'enemy'}:${index}`, name: source.name, biology: source.biology,
        x: 640 + index * 165 + random() * 140, y: 585 - random() * 80,
        w: source.caste === 'royal' ? 92 : 46, h: source.caste === 'royal' ? 118 : 64,
        health: Math.min(240, source.health), maxHealth: Math.min(240, source.health), damage: Math.min(25, source.damage),
        speed: 55 + source.speed * 35, alert: false, alive: true, attackClock: random()
      };
    });
    this.objective = { x: 2760, y: 565, w: 62, h: 85, complete: false };
    this.running = true;
    this.paused = false;
    this.last = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  createPlayer(x, y, color, coop) {
    return { x, y, w: 38, h: 64, vx: 0, vy: 0, facing: 1, grounded: false, health: 100, armor: 50, ammo: 99, color, coop, alive: true, fireClock: 0, kills: 0 };
  }

  stop() { this.running = false; }
  togglePause() { if (this.running) this.paused = !this.paused; }

  loop(time) {
    if (!this.running) return;
    const delta = Math.min(0.034, (time - this.last) / 1000 || 0);
    this.last = time;
    if (!this.paused) this.update(delta);
    this.draw();
    requestAnimationFrame((next) => this.loop(next));
  }

  update(delta) {
    this.updatePlayer(this.player, delta, { left: 'KeyA', right: 'KeyD', jump: 'Space', fire: 'KeyF' });
    if (this.coopEnabled) this.updatePlayer(this.coop, delta, { left: 'KeyJ', right: 'KeyL', jump: 'KeyI', fire: 'KeyO' });
    for (const bullet of this.bullets) bullet.x += bullet.vx * delta;
    this.bullets = this.bullets.filter((bullet) => bullet.x > -100 && bullet.x < 3300 && bullet.life-- > 0);

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const target = this.coopEnabled && Math.abs(this.coop.x - enemy.x) < Math.abs(this.player.x - enemy.x) ? this.coop : this.player;
      const distance = target.x - enemy.x;
      if (Math.abs(distance) < 480) enemy.alert = true;
      if (enemy.alert) enemy.x += Math.sign(distance) * enemy.speed * delta;
      enemy.attackClock -= delta;
      if (overlap(enemy, target) && enemy.attackClock <= 0) {
        this.damagePlayer(target, enemy.damage);
        enemy.attackClock = 0.8;
      }
      for (const bullet of this.bullets) {
        if (!bullet.hit && overlap(bullet, enemy)) {
          enemy.health -= bullet.damage;
          bullet.hit = true;
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
    this.camera.x += ((this.player.x - 420) - this.camera.x) * Math.min(1, delta * 5);
    this.camera.x = clamp(this.camera.x, 0, 1900);
    this.room = Math.floor((this.player.x + 200) / 600);
    this.trackerPulse = Math.max(0, this.trackerPulse - delta * 0.55);
    for (const particle of this.particles) { particle.x += particle.vx * delta; particle.y += particle.vy * delta; particle.life -= delta; }
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  updatePlayer(player, delta, controls) {
    if (!player.alive) return;
    const speed = this.vehicle.occupied && !player.coop ? 390 : 230;
    const left = this.keys.has(controls.left) || (!player.coop && this.keys.has('ArrowLeft'));
    const right = this.keys.has(controls.right) || (!player.coop && this.keys.has('ArrowRight'));
    player.vx = (Number(right) - Number(left)) * speed;
    if (player.vx) player.facing = Math.sign(player.vx);
    if ((this.keys.has(controls.jump) || (!player.coop && this.keys.has('ArrowUp'))) && player.grounded) {
      player.vy = -650;
      player.grounded = false;
    }
    player.vy += GRAVITY * delta;
    player.x += player.vx * delta;
    this.resolveHorizontal(player);
    player.y += player.vy * delta;
    player.grounded = false;
    this.resolveVertical(player);
    player.x = clamp(player.x, 0, 3020);
    player.fireClock = Math.max(0, player.fireClock - delta);
    if (this.keys.has(controls.fire)) this.fire(player);
    if (player.y > 800) { player.y = 300; player.health -= 20; }
  }

  resolveHorizontal(entity) {
    for (const door of this.doors) {
      if (!door.open && overlap(entity, door)) entity.x = entity.vx > 0 ? door.x - entity.w : door.x + door.w;
    }
  }

  resolveVertical(entity) {
    for (const platform of this.platforms) {
      if (overlap(entity, platform) && entity.vy >= 0 && entity.y + entity.h - entity.vy * 0.03 <= platform.y + 14) {
        entity.y = platform.y - entity.h;
        entity.vy = 0;
        entity.grounded = true;
      }
    }
  }

  fire(player) {
    if (!player?.alive || player.fireClock > 0 || player.ammo <= 0 || this.paused) return;
    player.fireClock = 0.13;
    player.ammo -= 1;
    this.bullets.push({ x: player.x + player.w / 2, y: player.y + 25, w: 16, h: 4, vx: player.facing * 870, damage: this.weapon?.damage || 26, owner: player, life: 260, hit: false });
    this.audio?.shot();
    this.onEvent({ type: 'shot' });
  }

  damagePlayer(player, amount) {
    const absorbed = Math.min(player.armor, amount * 0.55);
    player.armor -= absorbed;
    player.health -= amount - absorbed;
    if (player.health <= 0) {
      player.health = 0;
      player.alive = false;
      this.onEvent({ type: 'player-down', coop: player.coop });
    }
  }

  interact() {
    const door = this.doors.find((candidate) => Math.abs(this.player.x - candidate.x) < 110);
    if (door) { door.open = !door.open; this.audio?.ui(); return; }
    if (Math.abs(this.player.x - this.vehicle.x) < 180) this.toggleVehicle();
  }

  toggleVehicle() {
    if (Math.abs(this.player.x - this.vehicle.x) > 190 && !this.vehicle.occupied) return;
    this.vehicle.occupied = !this.vehicle.occupied;
    this.audio?.ui();
    this.onEvent({ type: 'vehicle', occupied: this.vehicle.occupied });
  }

  setCoop(enabled) { this.coopEnabled = Boolean(enabled); }

  draw() {
    const ctx = this.ctx;
    const scaleX = this.canvas.width / LOGICAL_WIDTH;
    const scaleY = this.canvas.height / LOGICAL_HEIGHT;
    ctx.save();
    ctx.scale(scaleX, scaleY);
    this.drawBackdrop(ctx);
    ctx.save();
    ctx.translate(-this.camera.x, 0);
    this.drawWorld(ctx);
    ctx.restore();
    this.drawHud(ctx);
    if (this.paused) {
      ctx.fillStyle = 'rgba(2, 7, 6, .78)'; ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.fillStyle = '#d8e6d8'; ctx.font = '700 38px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('OPÉRATION EN PAUSE', LOGICAL_WIDTH / 2, 330);
      ctx.font = '18px monospace'; ctx.fillStyle = '#83d5a1'; ctx.fillText('P / ÉCHAP pour reprendre', LOGICAL_WIDTH / 2, 372); ctx.textAlign = 'left';
    }
    ctx.restore();
  }

  drawBackdrop(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    gradient.addColorStop(0, '#06100e'); gradient.addColorStop(1, '#121815');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    if (this.background.complete && this.background.naturalWidth) {
      ctx.globalAlpha = 0.23;
      const shift = -(this.camera.x * 0.08) % LOGICAL_WIDTH;
      ctx.drawImage(this.background, shift, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.drawImage(this.background, shift + LOGICAL_WIDTH, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 24; i += 1) {
      const x = ((i * 167 - this.camera.x * 0.18) % 1500 + 1500) % 1500 - 100;
      ctx.fillStyle = i % 4 === 0 ? 'rgba(194, 102, 55, .16)' : 'rgba(100, 144, 119, .08)';
      ctx.fillRect(x, 80 + (i % 5) * 95, 85, 4);
    }
  }

  drawWorld(ctx) {
    for (const platform of this.platforms) {
      ctx.fillStyle = '#303a34'; ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
      ctx.fillStyle = '#6f826f'; ctx.fillRect(platform.x, platform.y, platform.w, 5);
      for (let x = platform.x + 12; x < platform.x + platform.w; x += 42) { ctx.fillStyle = '#202722'; ctx.fillRect(x, platform.y + 14, 22, 7); }
    }
    for (const door of this.doors) {
      if (door.open) continue;
      ctx.fillStyle = '#5d655e'; ctx.fillRect(door.x, door.y, door.w, door.h);
      ctx.strokeStyle = '#c4a85f'; ctx.lineWidth = 3; ctx.strokeRect(door.x + 4, door.y + 5, door.w - 8, door.h - 10);
    }
    ctx.fillStyle = '#536b60'; ctx.fillRect(this.vehicle.x, this.vehicle.y, this.vehicle.w, this.vehicle.h);
    ctx.fillStyle = '#151a17'; ctx.beginPath(); ctx.arc(this.vehicle.x + 35, this.vehicle.y + 82, 24, 0, Math.PI * 2); ctx.arc(this.vehicle.x + 128, this.vehicle.y + 82, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this.vehicle.occupied ? '#9ae2ab' : '#d5b45e'; ctx.fillRect(this.vehicle.x + 50, this.vehicle.y + 16, 45, 20);
    this.drawActor(ctx, this.player);
    if (this.coopEnabled) this.drawActor(ctx, this.coop);
    for (const enemy of this.enemies) if (enemy.alive) this.drawEnemy(ctx, enemy);
    for (const bullet of this.bullets) { ctx.fillStyle = '#f5d87a'; ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h); }
    ctx.fillStyle = this.objective.complete ? '#79d69a' : '#d5b562'; ctx.fillRect(this.objective.x, this.objective.y, this.objective.w, this.objective.h);
    ctx.fillStyle = '#08110d'; ctx.font = 'bold 13px monospace'; ctx.fillText(this.objective.complete ? 'OK' : 'OBJ', this.objective.x + 17, this.objective.y + 46);
  }

  drawActor(ctx, actor) {
    if (!actor.alive) { ctx.fillStyle = '#6b3d3d'; ctx.fillRect(actor.x, actor.y + actor.h - 14, actor.h, 14); return; }
    ctx.save(); ctx.translate(actor.x + actor.w / 2, actor.y); ctx.scale(actor.facing, 1);
    ctx.fillStyle = actor.color; ctx.fillRect(-12, 15, 24, 36); ctx.fillRect(-17, 23, 10, 30);
    ctx.fillStyle = '#c5aa82'; ctx.fillRect(-9, 2, 18, 16);
    ctx.fillStyle = '#27362d'; ctx.fillRect(-12, 51, 9, 13); ctx.fillRect(3, 51, 9, 13);
    ctx.fillStyle = '#a8b4aa'; ctx.fillRect(7, 28, 32, 7); ctx.restore();
  }

  drawEnemy(ctx, enemy) {
    const royal = enemy.w > 60;
    ctx.fillStyle = enemy.biology === 'pathogen' ? '#deddd1' : enemy.biology === 'human' ? '#934e4e' : enemy.biology === 'synthetic' ? '#d7c4a1' : '#202826';
    ctx.beginPath(); ctx.ellipse(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.w / 2, enemy.h / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7c9a88'; ctx.lineWidth = royal ? 8 : 4; ctx.beginPath(); ctx.moveTo(enemy.x + 5, enemy.y + enemy.h * 0.5); ctx.quadraticCurveTo(enemy.x - 45, enemy.y + enemy.h, enemy.x - 70, enemy.y + enemy.h - 9); ctx.stroke();
    if (enemy.alert) { ctx.fillStyle = '#be5551'; ctx.fillRect(enemy.x, enemy.y - 9, enemy.w * (enemy.health / enemy.maxHealth), 3); }
  }

  drawHud(ctx) {
    ctx.fillStyle = 'rgba(3, 10, 8, .84)'; ctx.fillRect(20, 18, 420, 87);
    ctx.strokeStyle = '#668b71'; ctx.strokeRect(20.5, 18.5, 420, 87);
    ctx.fillStyle = '#9be0ae'; ctx.font = 'bold 14px monospace'; ctx.fillText(this.campaign?.name?.toUpperCase() || 'OPÉRATION TANTALUS', 38, 43);
    ctx.fillStyle = '#ccd9cc'; ctx.font = '13px monospace'; ctx.fillText(`PV ${Math.ceil(this.player.health)}  ARM ${Math.ceil(this.player.armor)}  MUN ${this.player.ammo}`, 38, 70);
    ctx.fillStyle = '#8ea898'; ctx.fillText(`SECTEUR ${this.room + 1} · ${this.world?.name || 'LETHe'} · ${this.vehicle.occupied ? 'APC ACTIF' : 'À PIED'}`, 38, 91);
    if (this.trackerPulse > 0) {
      ctx.strokeStyle = `rgba(140, 232, 163, ${this.trackerPulse})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(1115, 94, 76 * (1 - this.trackerPulse) + 16, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(4, 18, 12, .8)'; ctx.fillRect(1030, 18, 170, 152); ctx.strokeStyle = '#689177'; ctx.strokeRect(1030, 18, 170, 152);
      for (const enemy of this.enemies.filter((item) => item.alive && Math.abs(item.x - this.player.x) < 600).slice(0, 12)) {
        ctx.fillStyle = '#a8e4ad'; ctx.fillRect(1115 + (enemy.x - this.player.x) * 0.11, 94 + ((enemy.y - this.player.y) * 0.1), 5, 5);
      }
    }
    if (this.objective.complete) { ctx.fillStyle = '#8fe0a7'; ctx.font = 'bold 24px monospace'; ctx.fillText('OBJECTIF ACCOMPLI — EXTRACTION AUTORISÉE', 650, 680); }
  }
}
