const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const WORLD_WIDTH = 2560;
const ROOM_WIDTH = WORLD_WIDTH / 4;
const FLOOR_Y = 624;
const GRAVITY = 1900;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const makeRoom = (id, name, action, description, index, npcRow) => Object.freeze({
  id,
  name,
  action,
  description,
  index,
  npcRow,
  x: index * ROOM_WIDTH + ROOM_WIDTH * 0.69
});

export const HUB_DECKS = Object.freeze([
  Object.freeze({
    id: 'command',
    name: 'PONT COMMANDEMENT',
    shortName: 'COMMANDEMENT',
    background: '/assets/openai/tantalus-hub-command-deck.png',
    rooms: Object.freeze([
      makeRoom('bridge', 'Passerelle', 'navigate:galaxy', 'Tracer une route sur la Frontière.', 0, 0),
      makeRoom('briefing', 'Salle de briefing', 'navigate:operations', 'Préparer une opération avec Echo-9.', 1, 0),
      makeRoom('combat-information', 'Centre d’information tactique', 'navigate:command', 'Consulter l’état du théâtre et les alertes.', 2, 0),
      makeRoom('cryo-bay', 'Baie cryogénique', 'navigate:crew', 'Réveiller, relever et inspecter l’équipage.', 3, 3)
    ])
  }),
  Object.freeze({
    id: 'habitat',
    name: 'PONT HABITAT',
    shortName: 'HABITAT',
    background: '/assets/openai/tantalus-hub-habitat-deck.png',
    rooms: Object.freeze([
      makeRoom('crew-quarters', 'Quartiers équipage', 'navigate:crew', 'Inspecter l’état d’Echo-9 et ses dotations.', 0, 0),
      makeRoom('mess', 'Mess', 'service:rest', 'Partager une relève et réduire le stress.', 1, 1),
      makeRoom('medical', 'Bloc médical', 'service:medical', 'Soigner les opérateurs avec les réserves médicales.', 2, 2),
      makeRoom('science-lab', 'Laboratoire scientifique', 'navigate:bestiary', 'Analyser les spécimens et profils Neuro-Xeno.', 3, 2)
    ])
  }),
  Object.freeze({
    id: 'industrial',
    name: 'PONT INDUSTRIEL',
    shortName: 'INDUSTRIEL',
    background: '/assets/openai/tantalus-hub-industrial-deck.png',
    rooms: Object.freeze([
      makeRoom('quarantine', 'Quarantaine', 'service:quarantine', 'Renforcer le confinement biologique.', 0, 3),
      makeRoom('armory', 'Armurerie', 'navigate:armory', 'Modifier armes, munitions et équipements.', 1, 0),
      makeRoom('workshop', 'Atelier', 'navigate:editor', 'Ouvrir Frontier Forge et les plans du vaisseau.', 2, 1),
      makeRoom('vehicle-bay', 'Baie véhicules', 'navigate:vehicles', 'Inspecter les châssis et rôles par siège.', 3, 1)
    ])
  }),
  Object.freeze({
    id: 'engineering',
    name: 'PONT INGÉNIERIE',
    shortName: 'INGÉNIERIE',
    background: '/assets/openai/tantalus-hub-engineering-deck.png',
    rooms: Object.freeze([
      makeRoom('dropship-hangar', 'Hangar dropship', 'navigate:operations', 'Embarquer pour la prochaine opération.', 0, 1),
      makeRoom('reactor', 'Réacteur', 'service:power', 'Réaffecter du carburant au réseau principal.', 1, 1),
      makeRoom('life-support', 'Support-vie', 'service:oxygen', 'Purger les filtres et restaurer l’oxygène.', 2, 2),
      makeRoom('sensor-array', 'Réseau de capteurs', 'navigate:galaxy', 'Balayer les mondes et anomalies de la Frontière.', 3, 0)
    ])
  })
]);

export const HUB_ROOM_COUNT = HUB_DECKS.reduce((total, deck) => total + deck.rooms.length, 0);

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
    this.backgrounds = HUB_DECKS.map((deck) => createImage(deck.background));
    this.playerSheet = createImage('/assets/openai/echo9-sprite-sheet.png');
    this.crewSheet = createImage('/assets/openai/tantalus-hub-crew-animation-sheet.png');
    this.propsSheet = createImage('/assets/openai/interactive-props-animation-sheet.png');
    this.keys = new Set();
    this.running = false;
    this.last = 0;
    this.animationTime = 0;
    this.statusKey = '';
    this.reducedMotion = false;
    this.bind();
  }

  bind() {
    globalThis.addEventListener('keydown', (event) => {
      if (!this.running) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
      this.keys.add(event.code);
      if (event.repeat) return;
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
    const savedRoom = HUB_DECKS.flatMap((entry) => entry.rooms).find((room) => room.id === hubState.roomId);
    const roomIndex = savedRoom?.index ?? 0;
    const defaultX = roomIndex * ROOM_WIDTH + 180;
    this.state = {
      deck,
      roomId: savedRoom?.id || HUB_DECKS[deck].rooms[0].id,
      positionX: clamp(Number(hubState.positionX) || defaultX, 40, WORLD_WIDTH - 90),
      visited: Array.isArray(hubState.visited) ? [...new Set(hubState.visited)] : []
    };
    this.player = { x: this.state.positionX, y: FLOOR_Y - 104, w: 58, h: 104, vx: 0, vy: 0, grounded: true, facing: 1 };
    this.camera = { x: clamp(this.player.x - LOGICAL_WIDTH / 2, 0, WORLD_WIDTH - LOGICAL_WIDTH) };
    this.npcs = this.createNpcs(deck);
    this.obstacles = this.createObstacles(deck);
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
    const left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    const right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    this.player.vx = (Number(right) - Number(left)) * 245;
    if (this.player.vx) this.player.facing = Math.sign(this.player.vx);
    if (this.keys.has('Space') && this.player.grounded) {
      this.player.vy = -650;
      this.player.grounded = false;
      this.keys.delete('Space');
    }
    this.player.vy += GRAVITY * delta;
    const previousX = this.player.x;
    const previousBottom = this.player.y + this.player.h;
    this.player.x = clamp(this.player.x + this.player.vx * delta, 24, WORLD_WIDTH - this.player.w - 24);
    this.resolveHorizontal(previousX);
    this.player.y += this.player.vy * delta;
    this.player.grounded = false;
    this.resolveVertical(previousBottom);

    const targetCamera = clamp(this.player.x - LOGICAL_WIDTH * 0.5, 0, WORLD_WIDTH - LOGICAL_WIDTH);
    this.camera.x += (targetCamera - this.camera.x) * Math.min(1, delta * (this.reducedMotion ? 12 : 5.5));
    for (const npc of this.npcs) {
      npc.x += npc.vx * delta;
      if (npc.x <= npc.min || npc.x >= npc.max) {
        npc.x = clamp(npc.x, npc.min, npc.max);
        npc.vx *= -1;
      }
    }
    this.state.positionX = Math.round(this.player.x);
    this.enterCurrentRoom(false);
    this.emitStatus();
  }

  createNpcs(deckIndex) {
    return HUB_DECKS[deckIndex].rooms.map((room, index) => ({
      row: room.npcRow,
      x: room.index * ROOM_WIDTH + 310,
      y: FLOOR_Y - 118,
      w: 72,
      h: 118,
      vx: index % 2 ? -25 : 22,
      min: room.index * ROOM_WIDTH + 275,
      max: (room.index + 1) * ROOM_WIDTH - 110
    }));
  }

  createObstacles(deckIndex) {
    const heightShift = deckIndex * 3;
    return [
      { x: 560, y: FLOOR_Y - 36 - heightShift, w: 76, h: 36 + heightShift },
      { x: 1510, y: FLOOR_Y - 44 + heightShift, w: 92, h: 44 - heightShift },
      { x: 2180, y: FLOOR_Y - 31 - heightShift, w: 70, h: 31 + heightShift }
    ];
  }

  resolveHorizontal(previousX) {
    for (const obstacle of this.obstacles) {
      if (!overlap(this.player, obstacle)) continue;
      if (this.player.vx > 0 && previousX + this.player.w <= obstacle.x + 6) this.player.x = obstacle.x - this.player.w;
      if (this.player.vx < 0 && previousX >= obstacle.x + obstacle.w - 6) this.player.x = obstacle.x + obstacle.w;
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
    if (!this.state.visited.includes(room.id)) this.state.visited.push(room.id);
    this.persist();
  }

  nearestLift() {
    return [1274, 2490].find((x) => Math.abs((this.player.x + this.player.w / 2) - x) < 105);
  }

  nearestInteraction() {
    const room = this.currentRoom();
    return Math.abs((this.player.x + this.player.w / 2) - room.x) < 145 ? room : null;
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
    this.state.deck = next;
    this.state.roomId = HUB_DECKS[next].rooms[this.currentRoom().index]?.id || HUB_DECKS[next].rooms[0].id;
    if (!this.state.visited.includes(this.state.roomId)) this.state.visited.push(this.state.roomId);
    this.npcs = this.createNpcs(next);
    this.obstacles = this.createObstacles(next);
    this.statusKey = '';
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
    const prompt = interaction
      ? `E — ${interaction.description}`
      : lift !== undefined
        ? 'W / S — choisir un pont · E — pont suivant'
        : 'A / D — marcher · ESPACE — franchir · E — utiliser';
    const payload = {
      deck: this.state.deck,
      deckName: HUB_DECKS[this.state.deck].name,
      roomId: room.id,
      roomName: room.name,
      prompt,
      visited: this.state.visited.length
    };
    const key = JSON.stringify(payload);
    if (key === this.statusKey) return;
    this.statusKey = key;
    this.onStatus(payload);
  }

  getSnapshot() {
    const room = this.player ? this.currentRoom() : HUB_DECKS[0].rooms[0];
    return {
      running: this.running,
      deck: this.state?.deck ?? 0,
      roomId: room.id,
      x: Math.round(this.player?.x || 0),
      y: Math.round(this.player?.y || 0),
      cameraX: Math.round(this.camera?.x || 0),
      visited: this.state?.visited?.length || 0,
      npcCount: this.npcs?.length || 0,
      backgroundReady: Boolean(this.backgrounds[this.state?.deck ?? 0]?.naturalWidth)
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
    this.drawHud(ctx);
    ctx.restore();
  }

  drawBackdrop(ctx) {
    const image = this.backgrounds[this.state.deck];
    const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    gradient.addColorStop(0, '#050b0b');
    gradient.addColorStop(1, '#101713');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    if (!image.complete || !image.naturalWidth) return;
    const drawHeight = WORLD_WIDTH * (image.naturalHeight / image.naturalWidth);
    const floorInImage = drawHeight * 0.78;
    const y = FLOOR_Y - floorInImage;
    ctx.save();
    ctx.translate(-this.camera.x, 0);
    ctx.drawImage(image, 0, y, WORLD_WIDTH, drawHeight);
    ctx.restore();
    const shade = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    shade.addColorStop(0, 'rgba(0, 7, 7, .28)');
    shade.addColorStop(0.62, 'rgba(0, 4, 4, .04)');
    shade.addColorStop(1, 'rgba(0, 4, 3, .48)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  drawWorld(ctx) {
    ctx.fillStyle = 'rgba(8, 13, 12, .78)';
    ctx.fillRect(0, FLOOR_Y, WORLD_WIDTH, LOGICAL_HEIGHT - FLOOR_Y);
    ctx.fillStyle = '#80978a';
    ctx.fillRect(0, FLOOR_Y, WORLD_WIDTH, 4);
    ctx.fillStyle = 'rgba(3, 8, 7, .56)';
    for (let x = 12; x < WORLD_WIDTH; x += 48) ctx.fillRect(x, FLOOR_Y + 16, 30, 8);

    for (const boundary of [ROOM_WIDTH, ROOM_WIDTH * 2, ROOM_WIDTH * 3]) {
      this.drawSheetCell(ctx, this.propsSheet, 3, 0, boundary - 45, FLOOR_Y - 126, 90, 126, false, 4, 4);
    }
    for (const lift of [1274, 2490]) {
      ctx.fillStyle = 'rgba(7, 13, 12, .68)';
      ctx.fillRect(lift - 52, FLOOR_Y - 170, 104, 170);
      ctx.strokeStyle = '#b7a65e';
      ctx.lineWidth = 3;
      ctx.strokeRect(lift - 48, FLOOR_Y - 166, 96, 164);
      ctx.fillStyle = '#d7b55a';
      ctx.fillRect(lift - 4, FLOOR_Y - 151, 8, 8);
    }

    const deck = HUB_DECKS[this.state.deck];
    for (const room of deck.rooms) {
      const active = this.nearestInteraction()?.id === room.id;
      this.drawSheetCell(ctx, this.propsSheet, active ? 2 : 1, 2, room.x - 36, FLOOR_Y - 88, 72, 88, false, 4, 4);
      ctx.fillStyle = active ? 'rgba(132, 224, 167, .22)' : 'rgba(4, 10, 9, .56)';
      ctx.fillRect(room.index * ROOM_WIDTH + 16, 130, 210, 30);
      ctx.fillStyle = active ? '#a6e5b8' : '#a8b9ae';
      ctx.font = '700 13px ui-monospace, monospace';
      ctx.fillText(`${String(room.index + 1).padStart(2, '0')} · ${room.name.toUpperCase()}`, room.index * ROOM_WIDTH + 28, 151);
    }

    for (const obstacle of this.obstacles) {
      ctx.fillStyle = '#28342e';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      ctx.strokeStyle = '#7a8b7e';
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.x + 1, obstacle.y + 1, obstacle.w - 2, obstacle.h - 2);
      ctx.fillStyle = '#b5a45a';
      ctx.fillRect(obstacle.x + 8, obstacle.y + 7, obstacle.w - 16, 4);
      ctx.fillStyle = 'rgba(6, 12, 10, .7)';
      ctx.fillRect(obstacle.x + 10, obstacle.y + 17, obstacle.w - 20, Math.max(6, obstacle.h - 24));
    }

    for (const npc of this.npcs) {
      const frame = this.reducedMotion ? 0 : Math.floor(this.animationTime * 7 + npc.row) % 4;
      this.drawSheetCell(ctx, this.crewSheet, frame, npc.row, npc.x, npc.y, npc.w, npc.h, npc.vx < 0, 4, 4);
    }
    this.drawPlayer(ctx);
  }

  drawPlayer(ctx) {
    const moving = Math.abs(this.player.vx) > 1;
    const frame = moving && !this.reducedMotion ? Math.floor(this.animationTime * 9) % 4 : 0;
    if (this.playerSheet.complete && this.playerSheet.naturalWidth) {
      this.drawSheetCell(ctx, this.playerSheet, frame, 0, this.player.x - 36, this.player.y - 28, 130, 154, this.player.facing < 0, 8, 8);
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
    if (!image.complete || !image.naturalWidth) return;
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

  drawHud(ctx) {
    const deck = HUB_DECKS[this.state.deck];
    const room = this.currentRoom();
    const interaction = this.nearestInteraction();
    const lift = this.nearestLift();
    ctx.fillStyle = 'rgba(2, 8, 7, .86)';
    ctx.fillRect(18, 18, 500, 84);
    ctx.strokeStyle = '#648270';
    ctx.strokeRect(18.5, 18.5, 500, 84);
    ctx.fillStyle = '#9adbac';
    ctx.font = '700 15px ui-monospace, monospace';
    ctx.fillText(`USS TANTALUS // ${deck.shortName}`, 36, 46);
    ctx.fillStyle = '#d3ddd5';
    ctx.font = '700 20px ui-monospace, monospace';
    ctx.fillText(room.name.toUpperCase(), 36, 75);
    ctx.fillStyle = '#8fa398';
    ctx.font = '12px ui-monospace, monospace';
    ctx.fillText(`PONT ${this.state.deck + 1}/4 · ${this.state.visited.length}/${HUB_ROOM_COUNT} COMPARTIMENTS VISITÉS`, 282, 75);

    ctx.fillStyle = 'rgba(2, 8, 7, .88)';
    ctx.fillRect(18, 656, 1244, 46);
    ctx.strokeStyle = interaction || lift !== undefined ? '#98d7a8' : '#536b5d';
    ctx.strokeRect(18.5, 656.5, 1244, 46);
    ctx.fillStyle = interaction || lift !== undefined ? '#b4edc1' : '#a9b9af';
    ctx.font = '700 14px ui-monospace, monospace';
    const prompt = interaction
      ? `E  ${interaction.description.toUpperCase()}`
      : lift !== undefined
        ? 'W / S  CHANGER DE PONT     E  PONT SUIVANT'
        : 'A / D  MARCHER     ESPACE  FRANCHIR     E  UTILISER';
    ctx.fillText(prompt, 38, 685);

    if (!this.state.visited.includes('briefing')) {
      ctx.fillStyle = 'rgba(6, 15, 11, .88)';
      ctx.fillRect(550, 18, 320, 62);
      ctx.strokeStyle = '#8fa95f';
      ctx.strokeRect(550.5, 18.5, 320, 62);
      ctx.fillStyle = '#d2c978';
      ctx.font = '700 11px ui-monospace, monospace';
      ctx.fillText('OBJECTIF DE RELÈVE', 568, 42);
      ctx.fillStyle = '#d4dfd6';
      ctx.font = '700 13px ui-monospace, monospace';
      ctx.fillText('REJOINDRE LA SALLE DE BRIEFING  →', 568, 64);
    }

    const mapX = 910;
    for (let index = 0; index < 4; index += 1) {
      ctx.fillStyle = index === this.state.deck ? '#9bdcac' : '#25352c';
      ctx.fillRect(mapX + index * 72, 34, 58, 12);
      ctx.fillStyle = '#a7b6ad';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText(`P${index + 1}`, mapX + index * 72 + 20, 64);
    }
  }
}
