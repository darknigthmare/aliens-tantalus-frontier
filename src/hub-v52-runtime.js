import {
  HubGame as HubGameV51,
  HUB_DECKS,
  HUB_MODULAR_ASSETS,
  HUB_MODULAR_PROP_FILES,
  HUB_ROOM_COUNT,
  HUB_WORLD,
  compileShipProject
} from './hub-v51-runtime.js';
import {
  CREW_SPRITE_IDS,
  SPRITE_GRID,
  SpriteAnimationController,
  resolveNpcAnimation,
  resolveSpriteSheet
} from './sprite-animation-runtime.js';

export { HUB_DECKS, HUB_MODULAR_ASSETS, HUB_MODULAR_PROP_FILES, HUB_ROOM_COUNT, HUB_WORLD, compileShipProject };

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const imageReady = (image) => Boolean(image?.complete && (image.naturalWidth || image.width));

export const HUB_NPC_INTERACTION_KINDS = Object.freeze(['care', 'repair', 'intel', 'loadout', 'piloting']);

const INTERACTION_EFFECTS = Object.freeze({
  care: Object.freeze({ target: 'crew-health', operation: 'restore', amount: 14 }),
  repair: Object.freeze({ target: 'hub-systems', operation: 'repair', amount: 12 }),
  intel: Object.freeze({ target: 'strategic-intel', operation: 'brief', amount: 1 }),
  loadout: Object.freeze({ target: 'strategic-loadout', operation: 'review', amount: 1 }),
  piloting: Object.freeze({ target: 'vehicle-readiness', operation: 'assign', amount: 1 })
});

function profile(crewId, name, role, specialty, deck, roomId, interactionKind, action, label) {
  const spriteId = CREW_SPRITE_IDS[crewId];
  const sprite = resolveSpriteSheet(spriteId);
  return Object.freeze({
    crewId,
    name,
    role,
    specialty,
    deck,
    roomId,
    spriteId,
    spritePath: sprite?.path || '',
    interaction: Object.freeze({
      kind: interactionKind,
      action,
      label,
      consequence: INTERACTION_EFFECTS[interactionKind]
    })
  });
}

/**
 * Affectation physique canonique : un membre d'Echo-9 par salle du Tantalus.
 * Les spécialités pilotent le type d'interaction au lieu d'un bouton générique.
 */
export const HUB_NPC_ROSTER = Object.freeze([
  profile('crew-01-mara-vega', 'Mara Vega', 'Commander', 'command', 0, 'bridge', 'intel', 'navigate:command', 'Recevoir le point de commandement'),
  profile('crew-02-tamsin-velez', 'Tamsin Velez', 'Sergeant', 'assault', 0, 'briefing', 'loadout', 'navigate:armory', 'Réviser la dotation d’assaut'),
  profile('crew-14-echo-a', 'ECHO-A', 'Tactical Synthetic', 'assault', 0, 'combat-information', 'loadout', 'navigate:armory', 'Configurer le paquet tactique'),
  profile('crew-10-david-8r', 'DAVID-8R', 'Recovered Synthetic', 'infiltration', 0, 'cryo-bay', 'intel', 'navigate:command', 'Extraire le renseignement synthétique'),
  profile('crew-12-asha-mbaye', 'Asha Mbaye', 'Colonial Liaison', 'diplomacy', 1, 'crew-quarters', 'intel', 'navigate:galaxy', 'Consulter les relais coloniaux'),
  profile('crew-15-leila-s-rensen', 'Leila Sørensen', 'Pathfinder', 'survival', 1, 'mess', 'intel', 'navigate:operations', 'Préparer une route de survie'),
  profile('crew-04-noor-okafor', 'Noor Okafor', 'Corpsman', 'medical', 1, 'medical', 'care', 'service:medical', 'Recevoir les soins de campagne'),
  profile('crew-05-bishop-9', 'BISHOP-9', 'Synthetic Science Officer', 'science', 1, 'science-lab', 'intel', 'navigate:bestiary', 'Analyser les signatures biologiques'),
  profile('crew-09-inez-harlow', 'Inez Harlow', 'Xenobiologist', 'science', 2, 'quarantine', 'intel', 'navigate:bestiary', 'Évaluer le risque xénobiologique'),
  profile('crew-07-sanaa-doyle', 'Sanaa Doyle', 'Smartgunner', 'heavy', 2, 'armory', 'loadout', 'navigate:armory', 'Calibrer la dotation lourde'),
  profile('crew-13-pablo-reyes', 'Pablo Reyes', 'Demolitions', 'demolition', 2, 'workshop', 'loadout', 'navigate:armory', 'Configurer les charges de brèche'),
  profile('crew-16-cal-mercer', 'Cal Mercer', 'Vehicle Chief', 'vehicle', 2, 'vehicle-bay', 'piloting', 'navigate:vehicles', 'Affecter un équipage véhicule'),
  profile('crew-08-maksim-orlov', 'Maksim Orlov', 'Pilot', 'pilot', 3, 'dropship-hangar', 'piloting', 'navigate:vehicles', 'Planifier l’embarquement dropship'),
  profile('crew-03-idris-kwan', 'Idris Kwan', 'Engineer', 'engineering', 3, 'reactor', 'repair', 'service:power', 'Réparer le réseau du réacteur'),
  profile('crew-11-jun-park', 'Jun Park', 'Technician', 'engineering', 3, 'life-support', 'repair', 'service:oxygen', 'Réparer le support-vie'),
  profile('crew-06-rook', 'Rook', 'Recon Marine', 'recon', 3, 'sensor-array', 'intel', 'navigate:galaxy', 'Télécharger le balayage de reconnaissance')
]);

export const HUB_NPC_SPRITE_FILES = Object.freeze(HUB_NPC_ROSTER.map((entry) => entry.spritePath));

const PROFILE_BY_ROOM = new Map(HUB_NPC_ROSTER.map((entry, sheetIndex) => [entry.roomId, Object.freeze({ ...entry, sheetIndex })]));
const PROFILE_BY_CREW = new Map(HUB_NPC_ROSTER.map((entry) => [entry.crewId, entry]));

function createImage(source) {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  return image;
}

function normalizeInteractionLedger(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([crewId, raw]) => {
    const member = PROFILE_BY_CREW.get(crewId);
    if (!member || !raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
    const count = clamp(Math.floor(Number(raw.count)) || 0, 0, 999999);
    return [[crewId, {
      count,
      interactionKind: member.interaction.kind,
      lastAction: typeof raw.lastAction === 'string' ? raw.lastAction.slice(0, 80) : member.interaction.action,
      lastRoomId: typeof raw.lastRoomId === 'string' ? raw.lastRoomId.slice(0, 40) : member.roomId,
      sequence: clamp(Math.floor(Number(raw.sequence)) || count, 0, 999999)
    }]];
  }));
}

function cloneLedger(ledger) {
  return Object.fromEntries(Object.entries(ledger).map(([crewId, record]) => [crewId, { ...record }]));
}

export function buildHubNpcInteractionEvent(npc, { deck = 0, roomId = npc?.roomId, count = 1, sequence = count } = {}) {
  const member = PROFILE_BY_CREW.get(npc?.crewId) || npc;
  if (!member?.crewId || !HUB_NPC_INTERACTION_KINDS.includes(member.interaction?.kind)) return null;
  const safeCount = clamp(Math.floor(Number(count)) || 1, 1, 999999);
  const safeSequence = clamp(Math.floor(Number(sequence)) || 1, 1, 999999);
  const record = Object.freeze({
    count: safeCount,
    interactionKind: member.interaction.kind,
    lastAction: member.interaction.action,
    lastRoomId: roomId,
    sequence: safeSequence
  });
  return Object.freeze({
    type: 'hub:npc-interaction',
    action: member.interaction.action,
    crewId: member.crewId,
    npcId: member.crewId,
    name: member.name,
    role: member.role,
    specialty: member.specialty,
    interactionKind: member.interaction.kind,
    label: member.interaction.label,
    deck,
    roomId,
    consequence: member.interaction.consequence,
    persistence: Object.freeze({
      target: 'hub.npcInteractions',
      operation: 'upsert',
      key: member.crewId,
      value: record
    })
  });
}

export class HubGame extends HubGameV51 {
  constructor(canvas, options = {}) {
    super(canvas, options);
    this.npcSheets = HUB_NPC_SPRITE_FILES.map(createImage);
    this.crewSheet = this.npcSheets[0];
    this.npcImageCrewIds = new Map(this.npcSheets.map((image, index) => [image, HUB_NPC_ROSTER[index].crewId]));
    this.hubNpcInteractions = {};
    this.hubNpcSequence = 0;
    this.hubNpcAnimation = new SpriteAnimationController({
      onEvent: (payload) => {
        const npc = this.npcs?.find((entry) => entry.crewId === payload.entityId);
        if (npc) npc.lastAnimationEvent = payload.event;
      }
    });
  }

  start(hubState = {}, options = {}) {
    this.hubNpcInteractions = normalizeInteractionLedger(hubState.npcInteractions);
    this.hubNpcSequence = Math.max(0, ...Object.values(this.hubNpcInteractions).map((record) => record.sequence || record.count || 0));
    this.hubNpcAnimation.reset();
    super.start(hubState, options);
    this.setNpcCrisisAlert(Boolean(this.crisis?.active));
    this.draw();
  }

  createNpcs(deckIndex) {
    const deck = HUB_DECKS[deckIndex];
    return deck.rooms.map((room, roomIndex) => {
      const member = PROFILE_BY_ROOM.get(room.id);
      const mobile = !['care', 'repair'].includes(member.interaction.kind);
      const patrolSpeed = mobile ? (member.sheetIndex % 2 ? -24 : 22) : 0;
      const x = room.xStart + 420 + ((member.sheetIndex * 37 + roomIndex * 19) % 150);
      return {
        id: `hub-npc-${member.crewId}`,
        crewId: member.crewId,
        name: member.name,
        role: member.role,
        specialty: member.specialty,
        roomId: room.id,
        interaction: member.interaction,
        spriteId: member.spriteId,
        sheet: member.sheetIndex,
        x,
        y: HUB_WORLD.floorY - 92,
        w: 44,
        h: 92,
        vx: patrolSpeed,
        patrolSpeed,
        resumeVx: patrolSpeed,
        mobile,
        min: room.xStart + 390,
        max: room.xEnd - 210,
        alive: true,
        workClock: 0,
        alertClock: 0,
        supportClock: 0,
        alerted: false
      };
    });
  }

  setNpcCrisisAlert(active) {
    for (const npc of this.npcs || []) {
      const next = Boolean(active);
      if (npc.alerted === next) continue;
      npc.alerted = next;
      if (next && npc.vx) npc.resumeVx = npc.vx;
      if (next) npc.vx = 0;
      else if (npc.mobile && npc.workClock <= 0) npc.vx = npc.resumeVx || npc.patrolSpeed;
      this.hubNpcAnimation.reset(npc.crewId);
    }
  }

  configureCrisis(rawCrisis) {
    super.configureCrisis(rawCrisis);
    this.setNpcCrisisAlert(Boolean(this.crisis?.active));
  }

  useLift(direction, wrap = false) {
    const previousDeck = this.state?.deck;
    super.useLift(direction, wrap);
    if (this.state?.deck !== previousDeck) this.setNpcCrisisAlert(Boolean(this.crisis?.active));
  }

  update(delta) {
    for (const npc of this.npcs || []) {
      npc.workClock = Math.max(0, npc.workClock - delta);
      npc.alertClock = Math.max(0, npc.alertClock - delta);
      npc.supportClock = Math.max(0, npc.supportClock - delta);
      const paused = npc.alerted || npc.workClock > 0;
      if (paused && npc.vx) npc.resumeVx = npc.vx;
      if (paused) npc.vx = 0;
      else if (npc.mobile && !npc.vx) npc.vx = npc.resumeVx || npc.patrolSpeed;
    }
    super.update(delta);
    for (const npc of this.npcs || []) if (!npc.alerted && npc.workClock <= 0 && npc.vx) npc.resumeVx = npc.vx;
  }

  updateCombat(delta) {
    const crisisWasActive = Boolean(this.crisis?.active);
    super.updateCombat(delta);
    if (crisisWasActive && !this.crisis?.active) this.setNpcCrisisAlert(false);
  }

  nearestHubNpc() {
    if (!this.player || this.editorPlaytest) return null;
    const playerCenter = this.player.x + this.player.w / 2;
    const playerFeet = this.player.y + this.player.h;
    return (this.npcs || [])
      .filter((npc) => Math.abs(playerFeet - (npc.y + npc.h)) < 112)
      .map((npc) => ({ npc, distance: Math.abs(playerCenter - (npc.x + npc.w / 2)) }))
      .filter((entry) => entry.distance < 118)
      .sort((a, b) => a.distance - b.distance)[0]?.npc || null;
  }

  interactWithNpc(npc) {
    if (!npc) return null;
    if (npc.vx) npc.resumeVx = npc.vx;
    npc.vx = 0;
    npc.workClock = 2.4;
    this.hubNpcAnimation.reset(npc.crewId);
    const previous = this.hubNpcInteractions[npc.crewId];
    const count = (previous?.count || 0) + 1;
    const sequence = Math.max(this.hubNpcSequence + 1, count);
    this.hubNpcSequence = sequence;
    const event = buildHubNpcInteractionEvent(npc, {
      deck: this.state.deck,
      roomId: this.currentRoom().id,
      count,
      sequence
    });
    this.hubNpcInteractions[npc.crewId] = { ...event.persistence.value };
    this.audio?.ui?.();
    this.persist();
    this.onAction(event);
    this.statusKey = '';
    this.emitStatus();
    return event;
  }

  interact() {
    if (!this.running) return;
    const center = this.player.x + this.player.w / 2;
    const door = this.v51Doors.find((entry) => Math.abs(center - (entry.x + entry.w / 2)) < 112);
    const terminal = this.v51Terminals.find((entry) => Math.abs(center - (entry.x + entry.w / 2)) < 130 && Math.abs(this.player.y - entry.y) < 130);
    const threats = this.enemies.filter((enemy) => enemy.alive).length;
    if (!door && !terminal && !threats) {
      const npc = this.nearestHubNpc();
      if (npc) { this.interactWithNpc(npc); return; }
    }
    super.interact();
  }

  npcAnimationRequest(npc) {
    if (!npc) return null;
    return resolveNpcAnimation(npc.alerted && npc.alertClock <= 0 ? { ...npc, alertClock: 1 } : npc);
  }

  sampleNpcAnimation(npc, { emit = false } = {}) {
    const request = this.npcAnimationRequest(npc);
    if (!request) return null;
    const sample = this.hubNpcAnimation.sample(npc.crewId, request, this.animationTime, {
      emit,
      reducedMotion: Boolean(this.reducedMotion)
    });
    if (sample) npc.v52Animation = { sheetId: request.sheetId, clipId: request.clipId, frame: sample.frame, row: sample.row, column: sample.column };
    return sample;
  }

  drawSheetCell(ctx, image, column, row, x, y, width, height, flip, columns, rows) {
    const crewId = this.npcImageCrewIds?.get(image);
    if (crewId) {
      const npc = this.npcs?.find((entry) => entry.crewId === crewId);
      const sample = this.sampleNpcAnimation(npc, { emit: true });
      if (sample) return super.drawSheetCell(ctx, image, sample.column, sample.row, x, y, width, height, flip, SPRITE_GRID.columns, SPRITE_GRID.rows);
    }
    return super.drawSheetCell(ctx, image, column, row, x, y, width, height, flip, columns, rows);
  }

  statusPrompt() {
    const inherited = super.statusPrompt();
    if (!this.player?.alive || this.enemies.some((enemy) => enemy.alive)) return inherited;
    const npc = this.nearestHubNpc();
    return npc ? `E — ${npc.interaction.label} · ${npc.name}` : inherited;
  }

  persist() {
    if (!this.state || !this.player) return;
    const patch = {
      deck: this.state.deck,
      roomId: this.state.roomId,
      positionX: Math.round(this.player.x),
      visited: [...new Set(this.state.visited)],
      npcInteractions: cloneLedger(this.hubNpcInteractions || {})
    };
    if (this.v51Initialized) {
      patch.playerHealth = Math.round(this.player.health);
      patch.activeCrisis = this.state.activeCrisis ?? null;
    }
    this.onPersist(patch);
  }

  getAssetReport() {
    const report = super.getAssetReport();
    return {
      ...report,
      npcRosterCount: HUB_NPC_ROSTER.length,
      npcUniqueSpriteCount: new Set(HUB_NPC_SPRITE_FILES).size,
      npcSpriteAssetsReady: this.npcSheets.filter(imageReady).length
    };
  }

  getSnapshot() {
    const snapshot = super.getSnapshot();
    const npcAnimations = (this.npcs || []).map((npc) => {
      const request = this.npcAnimationRequest(npc);
      return {
        crewId: npc.crewId,
        roomId: npc.roomId,
        interactionKind: npc.interaction.kind,
        sheetId: request?.sheetId || null,
        clipId: request?.clipId || null,
        frame: npc.v52Animation?.frame ?? null,
        row: npc.v52Animation?.row ?? null,
        alerted: Boolean(npc.alerted)
      };
    });
    return {
      ...snapshot,
      npcRosterCount: HUB_NPC_ROSTER.length,
      npcUniqueSpriteCount: new Set(HUB_NPC_SPRITE_FILES).size,
      npcInteractionCount: Object.values(this.hubNpcInteractions || {}).reduce((total, record) => total + record.count, 0),
      npcInteractions: cloneLedger(this.hubNpcInteractions || {}),
      npcAnimations
    };
  }
}
