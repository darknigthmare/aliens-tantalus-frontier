import {
  CREW_SPRITE_IDS,
  SPRITE_GRID,
  SPRITE_HITBOXES,
  SPRITE_PIVOTS,
  SPRITE_SHEETS,
  SpriteAnimationController,
  enforceHumanoidAnimationIdentity,
  resolveEnemyAnimation,
  resolveNpcAnimation,
  resolvePlayerAnimation,
  resolveSpriteSheet,
  resolveVehicleAnimation,
  shouldFlipSprite,
  spriteRuntimeReport
} from './sprite-animation-runtime.js';
import { resolveEnemyVisualProfile } from './enemy-visual-runtime-v53.js';
import {
  VEHICLE_ACCESS_SECURE_DURATION_V59,
  createVehicleAccessTransitionV59,
  resolveVehicleAccessContractV59,
  resolveVehicleAccessFallbackV59
} from './vehicle-access-runtime-v59.js';


const WORLD_WIDTH = 6200;
const WORLD_HEIGHT = 1080;
const FLOOR_Y = 930;
const GRAVITY = 1900;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const asList = (value) => Array.isArray(value) ? value : [];
const distance = (a, b) => Math.hypot((a.x + a.w / 2) - (b.x + b.w / 2), (a.y + a.h / 2) - (b.y + b.h / 2));
const overlaps = (a, b) => {
  const first = getEntitySpriteCollisionBounds(a);
  const second = getEntitySpriteCollisionBounds(b);
  return Boolean(first && second && first.x < second.x + second.w && first.x + first.w > second.x && first.y < second.y + second.h && first.y + first.h > second.y);
};
const imageReady = (image) => Boolean(image?.complete && (image.naturalWidth || image.width) > 0);

export function getAnimationEntityKeyV57(role, entity = {}, fallback = 'unknown') {
  const identity = role === 'npc'
    ? entity.crewId
    : role === 'player' || role === 'coop'
      ? entity.operatorId
      : entity.id;
  return `${role}:${String(identity || fallback)}`;
}

export function buildNeuroPlayerVisualContractV57(neuroProfile = null, enemyCatalog = []) {
  if (!neuroProfile?.playerClassCompatible || !neuroProfile.enemyId) return null;
  const sourceEnemy = asList(enemyCatalog).find((enemy) => enemy?.id === neuroProfile.enemyId);
  if (!sourceEnemy) return null;
  const visual = resolveEnemyVisualProfile(sourceEnemy);
  const sheet = resolveSpriteSheet(visual?.sheetId);
  if (!sheet || sheet.family !== 'enemy') return null;
  return Object.freeze({
    schema: 57,
    profileId: String(neuroProfile.id || ''),
    enemyId: String(sourceEnemy.id),
    enemyName: String(sourceEnemy.name || visual.archetype || sourceEnemy.id),
    biology: String(sourceEnemy.biology || 'xenomorph'),
    caste: String(sourceEnemy.caste || ''),
    spriteKey: String(visual.spriteKey || ''),
    sheetId: sheet.id,
    clipSet: sheet.clipSet,
    identityStatus: String(visual.identityStatus || 'missing'),
    exact: visual.identityStatus === 'exact',
    sourceFacing: Number(visual.sourceFacing) < 0 ? -1 : 1,
    source: 'neuro-profile-enemy-catalog'
  });
}

export function resolveNeuroPlayerAnimationV57(actor = {}) {
  const contract = actor.neuroVisualContract;
  if (!contract?.sheetId || !contract.spriteKey) return null;
  const attacking = Boolean(
    actor.attacking
    || (actor.v52FireClock || 0) > 0
    || (actor.fireClock || 0) > 0
    || (actor.actionClock || 0) > 0
    || (actor.meleeClock || 0) > 0
    || actor.grounded === false
  );
  return resolveEnemyAnimation({
    alive: actor.alive,
    v52HurtClock: actor.v52HurtClock,
    attacking,
    vx: actor.vx,
    alert: actor.alert || Math.abs(actor.vx || 0) > 8,
    spriteKey: contract.spriteKey,
    visualSheetId: contract.sheetId,
    biology: contract.biology
  });
}

export function resolveIdentitySafePlayerAnimationV57(actor = {}, neuroActive = false) {
  const request = neuroActive && actor.neuroVisualContract?.sheetId
    ? resolveNeuroPlayerAnimationV57(actor)
    : resolvePlayerAnimation(actor, neuroActive);
  return enforceHumanoidAnimationIdentity(actor, request, { role: 'player', neuroActive });
}

export function resolveIdentitySafeNpcAnimationV57(actor = {}) {
  const request = resolveNpcAnimation(actor);
  return enforceHumanoidAnimationIdentity(actor, request, { role: 'npc', neuroActive: false });
}

const V55_VEHICLE_SHEETS = new Set([
  'vehicle.m577-command-apc.action',
  'vehicle.m22a3-jackson-tank.action',
  'vehicle.p5000-powered-work-loader.action',
  'vehicle.ud4l-cheyenne-dropship.action',
  'vehicle.m40-ridgeway-heavy-tank.action.v56',
  'vehicle.ud4b-cheyenne-dropship.action.v56',
  'vehicle.narcissus-lifeboat.action.v56',
  'vehicle.lander-one-class-e.action.v56',
  'vehicle.rt01-group-transport.action.v56',
  'vehicle.nr9-euv01-atv.action.v56',
  'vehicle.daihotai-tractor.action.v56',
  'vehicle.eva7c-pressure-pod.action.v56',
  'vehicle.combat-power-loader.action.v56',
  'vehicle.ua571-remote-sentry-carrier.action.v56',
  'vehicle.seegson-maintenance-tram.action.v56',
  'vehicle.crucible-caravan-crawler.action.v56',
  'vehicle.uscm-assault-gunship.action.v56',
  'vehicle.orbital-lifeboat.action.v56',
  'vehicle.colony-cargo-lifter.action.v56',
  'vehicle.weyland-yutani-executive-shuttle.action.v56',
  'vehicle.upp-combat-aerodyne.action.v56',
  'vehicle.hyperdyne-synthetic-carrier.action.v56',
  'vehicle.atmospheric-processor-elevator.action.v56',
  'vehicle.maglev-personnel-car.action.v56',
  'vehicle.ripper-siege-loader.action.v56',
  'vehicle.ceto-patrol-boat.action.v56',
  'vehicle.tantalus-command-skiff.action.v56',
  'vehicle.echo-9-recon-bike.action.v56',
  'vehicle.neuro-xeno-transport-rig.action.v56',
  'vehicle.mining-bore-crawler.action.v56',
  'vehicle.ice-driller.action.v56',
  'vehicle.reef-hydrofoil.action.v56'
]);

export function buildSpriteHitboxRuntime(entity = {}, sheetOrId = null) {
  const sheet = typeof sheetOrId === 'string' ? resolveSpriteSheet(sheetOrId) : sheetOrId;
  const pivot = sheet && SPRITE_PIVOTS[sheet.pivot];
  const hitbox = sheet && SPRITE_HITBOXES[sheet.hitbox];
  const entityX = Number(entity.x);
  const entityY = Number(entity.y);
  const entityWidth = Number(entity.w);
  const entityHeight = Number(entity.h);
  if (!sheet || !pivot || !hitbox || ![entityX, entityY, entityWidth, entityHeight].every(Number.isFinite)) return null;
  const width = Number(sheet.renderWidth);
  const height = Number(sheet.renderHeight);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const scaleX = width / SPRITE_GRID.cellWidth;
  const scaleY = height / SPRITE_GRID.cellHeight;
  const flip = shouldFlipSprite(sheet, entity.facing);
  const anchorX = entityX + entityWidth / 2;
  const anchorY = entityY + entityHeight;
  const pivotX = flip ? SPRITE_GRID.cellWidth - pivot.x : pivot.x;
  const spriteX = anchorX - pivotX * scaleX;
  const spriteY = anchorY - pivot.y * scaleY;
  const hitboxX = flip ? SPRITE_GRID.cellWidth - hitbox.x - hitbox.width : hitbox.x;
  const world = {
    x: spriteX + hitboxX * scaleX,
    y: spriteY + hitbox.y * scaleY,
    w: hitbox.width * scaleX,
    h: hitbox.height * scaleY
  };
  return {
    id: sheet.hitbox,
    sheetId: sheet.id,
    source: hitbox,
    flip,
    world,
    local: { x: world.x - entityX, y: world.y - entityY, w: world.w, h: world.h },
    sprite: { x: spriteX, y: spriteY, width, height, scaleX, scaleY },
    pivot: { id: sheet.pivot, source: pivot, world: { x: anchorX, y: anchorY } }
  };
}

export function getEntitySpriteCollisionBounds(entity) {
  if (!entity) return null;
  const local = entity.spriteHitbox?.local;
  if (!local) return entity;
  const values = [entity.x, entity.y, local.x, local.y, local.w, local.h].map(Number);
  if (!values.every(Number.isFinite) || values[4] <= 0 || values[5] <= 0) return entity;
  return { x: values[0] + values[2], y: values[1] + values[3], w: values[4], h: values[5] };
}

export function getV55VehiclePhysicalProfile(vehicle = {}) {
  const request = resolveVehicleAnimation(vehicle);
  if (!request || !V55_VEHICLE_SHEETS.has(request.sheetId)) return null;
  const sheet = resolveSpriteSheet(request.sheetId);
  const hitbox = sheet && SPRITE_HITBOXES[sheet.hitbox];
  if (!sheet || !hitbox) return null;
  return {
    sheetId: sheet.id,
    hitboxId: sheet.hitbox,
    width: hitbox.width * sheet.renderWidth / SPRITE_GRID.cellWidth,
    height: hitbox.height * sheet.renderHeight / SPRITE_GRID.cellHeight
  };
}

export const SQUAD_FORMATION_GAP = 12;
export const DEFAULT_SQUAD_RENDER_WIDTH = 92;

export function getSquadVisualWidth(actor = {}) {
  const sheet = resolveSpriteSheet(actor.spriteId || actor.sheetId);
  const playerWidth = SPRITE_SHEETS['player.echo9-marine.locomotion']?.renderWidth || 110;
  const familyWidth = actor.squadMember || actor.crewId
    ? DEFAULT_SQUAD_RENDER_WIDTH
    : actor.coop !== undefined || actor.operatorId
      ? playerWidth
      : DEFAULT_SQUAD_RENDER_WIDTH;
  return Math.max(
    Number(actor.w) || 0,
    Number(actor.visualWidth) || 0,
    Number(sheet?.renderWidth) || 0,
    familyWidth
  );
}

export function getSquadSeparationDistance(first = {}, second = {}) {
  return (getSquadVisualWidth(first) + getSquadVisualWidth(second)) / 2 + SQUAD_FORMATION_GAP;
}

export function getSquadFormationX(
  anchor = {},
  member = {},
  index = 0,
  worldWidth = WORLD_WIDTH,
  preferredDirection = null
) {
  const bodyWidth = Math.max(1, Number(member.w) || 1);
  const maximumX = Math.max(0, (Number(worldWidth) || WORLD_WIDTH) - bodyWidth);
  const anchorCenter = (Number(anchor.x) || 0) + (Number(anchor.w) || 0) / 2;
  const slotIndex = Math.max(0, Math.floor(Number(index) || 0));
  const slotWidth = getSquadVisualWidth(member) + SQUAD_FORMATION_GAP;
  const offset = getSquadSeparationDistance(anchor, member) + slotIndex * slotWidth;
  const facing = Math.sign(Number(anchor.facing) || 1) || 1;
  const direction = Math.sign(Number(preferredDirection)) || -facing;
  const targetFor = (side) => anchorCenter + side * offset - bodyWidth / 2;
  const preferred = targetFor(direction);
  const opposite = targetFor(-direction);
  const preferredFits = preferred >= 0 && preferred <= maximumX;
  const oppositeFits = opposite >= 0 && opposite <= maximumX;
  return clamp(preferredFits || !oppositeFits ? preferred : opposite, 0, maximumX);
}

const ROLE_PROFILES = Object.freeze({
  command: Object.freeze({ action: 'command-aura', damage: 15, interval: 0.72, range: 610, armor: 34, supportCharges: 2 }),
  assault: Object.freeze({ action: 'suppressive-fire', damage: 19, interval: 0.46, range: 560, armor: 46, supportCharges: 1 }),
  engineering: Object.freeze({ action: 'field-repair', damage: 13, interval: 0.78, range: 540, armor: 30, supportCharges: 3 }),
  medical: Object.freeze({ action: 'combat-medicine', damage: 11, interval: 0.86, range: 520, armor: 28, supportCharges: 4 }),
  science: Object.freeze({ action: 'threat-analysis', damage: 12, interval: 0.82, range: 590, armor: 26, supportCharges: 3 }),
  recon: Object.freeze({ action: 'recon-pulse', damage: 17, interval: 0.64, range: 760, armor: 28, supportCharges: 3 }),
  heavy: Object.freeze({ action: 'smartgun-burst', damage: 23, interval: 0.38, range: 650, armor: 54, supportCharges: 1 }),
  pilot: Object.freeze({ action: 'vehicle-gunnery', damage: 15, interval: 0.62, range: 620, armor: 32, supportCharges: 2 }),
  infiltration: Object.freeze({ action: 'signal-disruption', damage: 16, interval: 0.58, range: 640, armor: 30, supportCharges: 3 }),
  diplomacy: Object.freeze({ action: 'cohesion-aura', damage: 12, interval: 0.82, range: 540, armor: 26, supportCharges: 2 }),
  demolition: Object.freeze({ action: 'demolition-round', damage: 36, interval: 1.2, range: 620, armor: 40, supportCharges: 3, splash: 115 }),
  survival: Object.freeze({ action: 'hazard-guard', damage: 16, interval: 0.7, range: 600, armor: 36, supportCharges: 3 }),
  vehicle: Object.freeze({ action: 'vehicle-repair', damage: 14, interval: 0.72, range: 580, armor: 42, supportCharges: 4 })
});

export function buildSquadRoleRuntime(member = {}) {
  const specialty = String(member.specialty || 'assault').toLowerCase();
  const base = ROLE_PROFILES[specialty] || ROLE_PROFILES.assault;
  const stress = clamp(Number(member.stress) || 0, 0, 100);
  const fatigue = clamp(Number(member.fatigue) || 0, 0, 100);
  const health = clamp(Number(member.health) || 100, 1, 100);
  const effectiveness = clamp(1 - stress * 0.0025 - fatigue * 0.002, 0.62, 1);
  return Object.freeze({
    ...base,
    specialty,
    damage: Math.max(6, Math.round(base.damage * effectiveness)),
    interval: Math.round((base.interval / effectiveness) * 100) / 100,
    maxHealth: health,
    synthetic: member.species === 'synthetic'
  });
}

function createSquadActor(member, index, leader) {
  const profile = buildSquadRoleRuntime(member);
  const spriteId = CREW_SPRITE_IDS[member.id] || CREW_SPRITE_IDS['crew-01-mara-vega'];
  const actor = {
    id: `squad:${member.id}`,
    crewId: member.id,
    name: member.name,
    role: member.role,
    species: member.species,
    specialty: profile.specialty,
    action: profile.action,
    profile,
    spriteId,
    x: clamp((leader?.x || 160) - 72 - index * 58, 24, WORLD_WIDTH - 50),
    y: leader?.y || FLOOR_Y - 90,
    w: 40,
    h: 90,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: false,
    climbing: false,
    crouching: false,
    inCover: false,
    inVehicle: false,
    alive: true,
    downed: false,
    bleedOut: 0,
    health: profile.maxHealth,
    maxHealth: profile.maxHealth,
    armor: profile.armor,
    maxArmor: Math.max(60, profile.armor),
    fireClock: 0.2 + index * 0.12,
    supportClock: 0.5 + index * 0.25,
    workClock: 0,
    alertClock: 0,
    hazardClock: 0,
    stuckClock: 0,
    rallyClock: 0,
    supportCharges: profile.supportCharges,
    kills: 0,
    shots: 0,
    actions: 0,
    damageTaken: 0,
    squadMember: true,
    formationIndex: index
  };
  actor.visualWidth = getSquadVisualWidth(actor);
  actor.formationSlot = actor.visualWidth + SQUAD_FORMATION_GAP;
  return actor;
}

export function withV52MissionRuntime(BaseEngine) {
  return class V52MissionRuntime extends BaseEngine {
    start(options = {}) {
      this.pendingSquadResume = null;
      const snapshot = super.start(options);
      this.configureNeuroPlayerVisualContract(options);
      this.configureSpriteRuntime();
      this.configureV55VehiclePhysicalBounds();
      this.configureMissionSquad();
      this.refreshSpriteCollisionProfiles();
      const pendingSquad = this.pendingSquadResume;
      const squadRestored = pendingSquad && this.lastResumeResult?.applied ? this.restoreSquadState(pendingSquad) : 0;
      if (this.lastResumeResult?.applied) this.lastResumeResult = { ...this.lastResumeResult, squadRestored };
      this.pendingSquadResume = null;
      this.onEvent({
        type: 'squad-ready',
        members: this.activeSquadActors().map((member) => ({ crewId: member.crewId, name: member.name, action: member.action })),
        animationSheets: this.spriteRuntime?.report?.sheets || 0
      });
      return { ...snapshot, ...this.getV52Snapshot() };
    }

    configureNeuroPlayerVisualContract(options = {}) {
      const contract = buildNeuroPlayerVisualContractV57(options.neuroProfile, options.enemyCatalog);
      if (!this.player) return contract;
      this.player.neuroVisualContract = contract;
      this.player.neuroActive = Boolean(this.neuro?.active);
      this.player.neuroEnemyId = contract?.enemyId || null;
      if (contract) {
        this.player.spriteKey = contract.spriteKey;
        this.player.visualSheetId = contract.sheetId;
        this.player.biology = contract.biology;
      } else {
        this.player.spriteKey = null;
        this.player.visualSheetId = null;
      }
      return contract;
    }

    configureSpriteRuntime() {
      this.animationTelemetry = {
        samples: 0,
        events: 0,
        byEvent: {},
        activeClips: {},
        fallbackFamilies: new Set(),
        approximatedEnemyVisuals: new Set(asList(this.enemies)
          .filter((enemy) => enemy?.visualIdentityStatus && enemy.visualIdentityStatus !== 'exact')
          .map((enemy) => `${enemy.visualArchetype}:${enemy.visualIdentityStatus}`)),
        frameEffects: 0
      };
      this.spriteAnimation = new SpriteAnimationController({ onEvent: (payload) => this.handleSpriteFrameEvent(payload) });
      this.spriteRuntime = { report: spriteRuntimeReport() };
      if (!this.images || typeof globalThis.Image !== 'function') return;
      for (const entry of Object.values(SPRITE_SHEETS)) {
        if (this.images.has(entry.imageKey)) continue;
        const image = new globalThis.Image();
        image.decoding = 'async';
        image.src = entry.path;
        this.images.set(entry.imageKey, image);
      }
    }

    configureV55VehiclePhysicalBounds() {
      const profile = getV55VehiclePhysicalProfile(this.vehicle);
      if (!profile || !this.vehicle) return null;
      const previousWidth = Number(this.vehicle.w) || profile.width;
      const previousHeight = Number(this.vehicle.h) || profile.height;
      const centerX = (Number(this.vehicle.x) || 0) + previousWidth / 2;
      const bottom = (Number(this.vehicle.y) || 0) + previousHeight;
      const groundBottom = Number.isFinite(Number(this.vehicle.groundY))
        ? Number(this.vehicle.groundY) + previousHeight
        : null;
      this.vehicle.w = profile.width;
      this.vehicle.h = profile.height;
      this.vehicle.x = clamp(centerX - profile.width / 2, 0, WORLD_WIDTH - profile.width);
      this.vehicle.y = bottom - profile.height;
      if (groundBottom !== null) this.vehicle.groundY = groundBottom - profile.height;
      if (Number.isFinite(Number(this.vehicle.waterLine))) this.vehicle.waterLine = FLOOR_Y - profile.height - 18;
      this.vehicle.v55PhysicalProfile = { ...profile };
      const hitboxRuntime = buildSpriteHitboxRuntime(this.vehicle, profile.sheetId);
      if (hitboxRuntime) this.vehicle.spriteHitbox = hitboxRuntime;
      return profile;
    }

    refreshSpriteCollisionProfiles() {
      for (const enemy of asList(this.enemies)) {
        const request = resolveEnemyAnimation(enemy);
        const runtime = request && buildSpriteHitboxRuntime(enemy, request.sheetId);
        if (runtime) enemy.spriteHitbox = runtime;
      }
      if (this.vehicle?.active) {
        const request = resolveVehicleAnimation(this.vehicle);
        const runtime = request && buildSpriteHitboxRuntime(this.vehicle, request.sheetId);
        if (runtime) this.vehicle.spriteHitbox = runtime;
      }
    }

    withEnemySpriteCollisionGeometry(callback) {
      const restores = [];
      for (const enemy of asList(this.enemies)) {
        if (!enemy?.spriteHitbox?.local) continue;
        const bounds = getEntitySpriteCollisionBounds(enemy);
        if (!bounds || bounds === enemy) continue;
        restores.push({
          enemy,
          x: enemy.x,
          y: enemy.y,
          w: enemy.w,
          h: enemy.h,
          spriteHitbox: enemy.spriteHitbox
        });
        enemy.x = bounds.x;
        enemy.y = bounds.y;
        enemy.w = bounds.w;
        enemy.h = bounds.h;
        enemy.spriteHitbox = null;
      }
      try {
        return callback();
      } finally {
        for (const restore of restores) {
          restore.enemy.x = restore.x;
          restore.enemy.y = restore.y;
          restore.enemy.w = restore.w;
          restore.enemy.h = restore.h;
          restore.enemy.spriteHitbox = restore.spriteHitbox;
        }
      }
    }

    configureMissionSquad() {
      const activeCrew = asList(this.crewRuntime).filter((member) => member?.status === 'active');
      const operatorId = this.player?.operatorId || activeCrew[0]?.id;
      const companions = activeCrew.filter((member) => member.id !== operatorId).slice(0, 3);
      this.squadActors = companions.map((member, index) => createSquadActor(member, index, this.player));
      this.squadTelemetry = {
        configured: this.squadActors.length,
        spawned: this.squadActors.length,
        rendered: 0,
        shots: 0,
        hitsTaken: 0,
        revives: 0,
        heals: 0,
        repairs: 0,
        scans: 0,
        rallies: 0,
        separations: 0,
        boarded: 0,
        consequences: []
      };
      this.squadCommandMultiplier = this.squadActors.some((member) => member.specialty === 'command') ? 1.12 : 1;
      this.squadCohesionMultiplier = this.squadActors.some((member) => member.specialty === 'diplomacy') ? 1.1 : 1;
      if (this.squadCommandMultiplier > 1 && this.player) this.player.maxArmor += 6;
    }

    activeSquadActors() {
      const coopCrewId = this.coopEnabled ? this.coop?.operatorId : null;
      return asList(this.squadActors).filter((member) => member.crewId !== coopCrewId);
    }

    setCoop(enabled) {
      const next = Boolean(enabled);
      if (!next && this.vehicle?.accessTransition?.actorRole === 'coop') this.abortVehicleAccessV59('coop-disabled');
      if (!next && this.coop?.inVehicle) this.commitVehicleAccessV59(this.coop, 'exiting');
      const crewId = this.coop?.operatorId;
      const counterpart = asList(this.squadActors).find((member) => member.crewId === crewId);
      if (counterpart && next !== Boolean(this.coopEnabled)) {
        const from = next ? counterpart : this.coop;
        const to = next ? this.coop : counterpart;
        for (const key of ['x', 'y', 'health', 'armor', 'alive', 'downed', 'bleedOut', 'facing', 'kills']) if (from?.[key] !== undefined) to[key] = from[key];
        to.vx = 0;
        to.vy = 0;
      }
      return super.setCoop(next);
    }
    toggleVehicle(actor = this.player) {
      if (!actor?.alive || !this.vehicle?.active || this.vehicle.destroyed) return false;
      if (this.mission && this.mission.state !== 'active') return false;
      if (this.vehicle.accessTransition || Number(this.vehicle.accessSecureClock) > 0) return false;
      const actorRole = this.vehicleAccessActorRoleV59(actor);
      if (!actorRole) return false;
      const animation = resolveVehicleAnimation(this.vehicle);
      const accessContract = resolveVehicleAccessContractV59(animation?.sheetId);
      if (!accessContract) return super.toggleVehicle(actor);
      if (!actor.inVehicle && distance(actor, this.vehicle) > 220) return false;
      const phase = actor.inVehicle ? 'exiting' : 'entering';
      this.vehicle.vx = 0;
      this.vehicle.vy = 0;
      this.vehicle.accessSecureClock = 0;
      this.vehicle.accessTransition = createVehicleAccessTransitionV59(actorRole, phase);
      this.setInteractionAnimation(actor, 'force-interact', this.vehicle.accessTransition.duration);
      this.audio?.ui();
      this.onEvent({
        type: 'vehicle-access-start',
        phase,
        actorRole,
        vehicleId: this.vehicle.id,
        occupied: this.vehicle.occupied
      });
      return true;
    }

    vehicleAccessActorRoleV59(actor) {
      return actor === this.player ? 'player' : actor === this.coop ? 'coop' : null;
    }

    vehicleAccessActorV59(actorRole) {
      return actorRole === 'coop' ? this.coop : this.player;
    }

    isVehicleAccessLockedV59(actor, { includeSecure = true } = {}) {
      const actorRole = this.vehicleAccessActorRoleV59(actor);
      if (!actorRole || !this.vehicle) return false;
      if (this.vehicle.accessTransition?.actorRole === actorRole) return true;
      if (!includeSecure || Number(this.vehicle.accessSecureClock) <= 0 || !actor.inVehicle) return false;
      return this.vehicle.driver === actor || asList(this.vehicle.passengers).includes(actor);
    }

    abortVehicleAccessV59(reason) {
      if (!this.vehicle) return false;
      const transition = this.vehicle.accessTransition;
      this.vehicle.accessTransition = null;
      this.vehicle.accessSecureClock = 0;
      if (!transition) return false;
      this.onEvent({
        type: 'vehicle-access-abort',
        phase: transition.phase,
        actorRole: transition.actorRole,
        vehicleId: this.vehicle.id,
        reason
      });
      return true;
    }

    commitVehicleAccessV59(actor, phase) {
      if (!actor || !this.vehicle || !['entering', 'exiting'].includes(phase)) return false;
      if (phase === 'entering') {
        if (actor.inVehicle || distance(actor, this.vehicle) > 220) return false;
        actor.inVehicle = true;
        if (!this.vehicle.driver) this.vehicle.driver = actor;
        else if (!asList(this.vehicle.passengers).includes(actor)) this.vehicle.passengers.push(actor);
      } else {
        if (!actor.inVehicle) return false;
        actor.inVehicle = false;
        actor.x = clamp(this.vehicle.x + this.vehicle.w + 18, 0, WORLD_WIDTH - actor.w);
        actor.y = this.vehicle.y + this.vehicle.h - actor.h;
        if (this.vehicle.driver === actor) {
          this.vehicle.driver = null;
          const replacement = [this.player, this.coop].find((rider) => rider?.inVehicle);
          if (replacement) this.vehicle.driver = replacement;
        }
        this.vehicle.passengers = asList(this.vehicle.passengers).filter((rider) => rider !== actor);
      }
      this.vehicle.occupied = Boolean(this.vehicle.driver);
      this.onEvent({ type: 'vehicle', occupied: this.vehicle.occupied, coop: actor.coop });
      return true;
    }

    updateVehicleAccessTransitionV59(delta) {
      const transition = this.vehicle?.accessTransition;
      if (!transition) return false;
      if (this.mission && this.mission.state !== 'active') {
        this.abortVehicleAccessV59('mission-inactive');
        return false;
      }
      if (this.vehicle.destroyed) {
        this.abortVehicleAccessV59('vehicle-destroyed');
        return false;
      }
      const actor = this.vehicleAccessActorV59(transition.actorRole);
      if (!actor?.alive) {
        this.abortVehicleAccessV59('actor-unavailable');
        return false;
      }
      transition.elapsed = Math.min(transition.duration, transition.elapsed + Math.max(0, Number(delta) || 0));
      if (transition.elapsed < transition.duration) return false;

      const expectedInVehicle = transition.phase === 'exiting';
      if (Boolean(actor.inVehicle) !== expectedInVehicle) {
        this.abortVehicleAccessV59('state-desynchronized');
        return false;
      }
      const changed = this.commitVehicleAccessV59(actor, transition.phase);
      this.vehicle.accessTransition = null;
      if (!changed) {
        this.onEvent({
          type: 'vehicle-access-abort',
          phase: transition.phase,
          actorRole: transition.actorRole,
          vehicleId: this.vehicle.id,
          reason: 'commit-rejected'
        });
        return false;
      }
      this.vehicle.accessSecureClock = transition.phase === 'entering'
        ? VEHICLE_ACCESS_SECURE_DURATION_V59
        : 0;
      this.onEvent({
        type: 'vehicle-access-complete',
        phase: transition.phase,
        actorRole: transition.actorRole,
        vehicleId: this.vehicle.id,
        occupied: this.vehicle.occupied
      });
      return true;
    }


    update(delta) {
      for (const actor of [this.player, this.coop, ...this.activeSquadActors()]) {
        if (!actor) continue;
        actor.v52FireClock = Math.max(0, (actor.v52FireClock || 0) - delta);
        actor.v52HurtClock = Math.max(0, (actor.v52HurtClock || 0) - delta);
      }
      for (const enemy of asList(this.enemies)) enemy.v52HurtClock = Math.max(0, (enemy.v52HurtClock || 0) - delta);
      if (this.vehicle) {
        this.vehicle.v52HurtClock = Math.max(0, (this.vehicle.v52HurtClock || 0) - delta);
        this.vehicle.v52TurretClock = Math.max(0, (this.vehicle.v52TurretClock || 0) - delta);
        this.vehicle.accessSecureClock = Math.max(0, (this.vehicle.accessSecureClock || 0) - delta);
      }
      this.refreshSpriteCollisionProfiles();
      super.update(delta);
      this.updateVehicleAccessTransitionV59(delta);
      if (this.mission?.state === 'active') this.updateMissionSquad(delta);
      this.updateSpriteAnimationEvents();
      this.refreshSpriteCollisionProfiles();
    }

    updateBullets(delta) {
      this.refreshSpriteCollisionProfiles();
      return this.withEnemySpriteCollisionGeometry(() => super.updateBullets(delta));
    }

    updatePlayer(player, delta, controls) {
      if (this.vehicle?.accessTransition?.actorRole === this.vehicleAccessActorRoleV59(player)) {
        player.vx = 0;
        player.vy = 0;
        player.jumpBuffer = 0;
        return false;
      }
      return super.updatePlayer(player, delta, controls);
    }

    updateVehicleDriver(player, delta, controls) {
      const beforeX = Number(this.vehicle?.x) || 0;
      if (this.vehicle?.accessTransition || Number(this.vehicle?.accessSecureClock) > 0) {
        this.vehicle.vx = 0;
        this.vehicle.vy = 0;
        return false;
      }

      this.refreshSpriteCollisionProfiles();
      const result = this.withEnemySpriteCollisionGeometry(() => super.updateVehicleDriver(player, delta, controls));
      if (this.vehicle?.active && this.vehicle.driver === player) {
        const travelled = (Number(this.vehicle.x) || 0) - beforeX;
        const horizontalMotion = Math.abs(travelled) > 0.01 ? travelled : Number(this.vehicle.vx) || 0;
        if (Math.abs(horizontalMotion) > 0.5) this.vehicle.facing = Math.sign(horizontalMotion);
        const request = resolveVehicleAnimation(this.vehicle);
        const runtime = request && buildSpriteHitboxRuntime(this.vehicle, request.sheetId);
        if (runtime) this.vehicle.spriteHitbox = runtime;
      }
      return result;
    }

    interact(actor = this.player) {
      if (this.isVehicleAccessLockedV59(actor)) return false;
      return super.interact(actor);
    }

    reload(actor = this.player) {
      if (this.isVehicleAccessLockedV59(actor)) return false;
      return super.reload(actor);
    }

    useMedkit(actor = this.player) {
      if (this.isVehicleAccessLockedV59(actor)) return false;
      return super.useMedkit(actor);
    }

    activateTracker(actor = this.player) {
      if (this.isVehicleAccessLockedV59(actor)) return false;
      return super.activateTracker(actor);
    }

    useEquipment(equipmentId, actor = this.player) {
      if (this.isVehicleAccessLockedV59(actor)) return false;
      return super.useEquipment(equipmentId, actor);
    }

    activateNeuroCountermeasure(actor = this.player) {
      if (this.isVehicleAccessLockedV59(actor)) return false;
      return super.activateNeuroCountermeasure(actor);
    }

    fire(actor) {
      if (this.isVehicleAccessLockedV59(actor)) return false;
      const fired = super.fire(actor);
      if (fired && actor) {
        actor.v52FireClock = actor.inVehicle ? 0.48 : 0.34;
        if (actor.inVehicle && this.vehicle) this.vehicle.v52TurretClock = 0.52;
      }
      return fired;
    }

    damagePlayer(actor, amount, options = {}) {
      if (actor?.squadMember) return this.damageSquadMember(actor, amount, options);
      const result = super.damagePlayer(actor, amount, options);
      if (actor) actor.v52HurtClock = Math.max(actor.v52HurtClock || 0, 0.42);
      if (actor === this.player && actor.downed) this.tryEmergencySquadRevive(actor);
      return result;
    }

    damageVehicle(amount, source = 'enemy') {
      const result = super.damageVehicle(amount, source);
      if (this.vehicle && result > 0) this.vehicle.v52HurtClock = 0.6;
      if (this.vehicle?.destroyed && this.vehicle.accessTransition) this.abortVehicleAccessV59('vehicle-destroyed');
      return result;
    }

    applyEnemyDamage(enemy, amount, source = {}) {
      const result = super.applyEnemyDamage(enemy, amount, source);
      if (enemy && result > 0) enemy.v52HurtClock = Math.max(enemy.v52HurtClock || 0, 0.24);
      return result;
    }

    updateEnemy(enemy, delta) {
      const allies = this.activeSquadActors().filter((member) => member.alive && !member.inVehicle);
      const candidates = [this.player, this.coopEnabled ? this.coop : null, ...allies].filter((actor) => actor?.alive);
      if (!candidates.length) return super.updateEnemy(enemy, delta);
      const nearest = candidates.reduce((best, actor) => Math.abs(actor.x - enemy.x) < Math.abs(best.x - enemy.x) ? actor : best, candidates[0]);
      if (!nearest.squadMember) return super.updateEnemy(enemy, delta);
      if (!this.stealthRuntime) return this.updateEnemyAgainstSquad(enemy, nearest, delta);

      // Squad retargeting must preserve the production stealth lifecycle; the
      // companion changes the combat target, never the leader's detection state.
      const stealthActors = [this.player, this.coopEnabled ? this.coop : null].filter((actor) => actor?.alive);
      const detectionDistance = stealthActors.length
        ? Math.min(...stealthActors.map((actor) => distance(actor.inVehicle && this.vehicle?.active ? this.vehicle : actor, enemy)))
        : Infinity;
      const wasAlert = enemy.alert;
      const detectionRadius = this.stealthRuntime.detectionRadius * (enemy.isBoss ? 1.18 : enemy.behavior === 'stalker' ? 1.08 : 1);
      if (!wasAlert && detectionDistance <= detectionRadius) enemy.revealed = Math.max(enemy.revealed || 0, 0.12);
      if (enemy.jammedClock > 0) {
        enemy.jammedClock = Math.max(0, enemy.jammedClock - delta);
        enemy.alert = false;
        enemy.speed *= 0.985;
      }
      this.updateEnemyAgainstSquad(enemy, nearest, delta);
      if (!wasAlert && enemy.alert && detectionDistance > detectionRadius && (enemy.revealed || 0) <= 0.01) enemy.alert = false;
      if (enemy.alert && detectionDistance > detectionRadius * 1.65 && (enemy.revealed || 0) <= 0.01) {
        enemy.searchClock = (enemy.searchClock || 0) + delta;
        if (enemy.searchClock >= 2.4) enemy.alert = false;
      } else enemy.searchClock = 0;
      if (!wasAlert && enemy.alert) {
        this.stealthRuntime.spottedBy.add(enemy.id);
        this.stealthRuntime.lastEvent = 'spotted';
        this.onEvent({ type: 'spotted', enemyId: enemy.id, radius: Math.round(detectionRadius), visibility: Math.round(this.stealthRuntime.visibility), noise: Math.round(this.stealthRuntime.noise) });
      } else if (wasAlert && !enemy.alert) {
        this.stealthRuntime.spottedBy.delete(enemy.id);
        this.stealthRuntime.lastEvent = 'lost';
        this.onEvent({ type: 'lost', enemyId: enemy.id, radius: Math.round(detectionRadius) });
      }
    }

    updateEnemyAgainstSquad(enemy, target, delta) {
      if (!enemy?.alive || !target?.alive) return;
      enemy.attackClock -= delta;
      enemy.rangedClock -= delta;
      enemy.staggerClock = Math.max(0, enemy.staggerClock - delta);
      const targetEntity = target.inVehicle && this.vehicle?.active ? this.vehicle : target;
      const horizontal = targetEntity.x - enemy.x;
      const vertical = Math.abs((targetEntity.y + targetEntity.h) - (enemy.y + enemy.h));
      if (Math.abs(horizontal) < 620 || enemy.revealed > 0) enemy.alert = true;
      if (!enemy.alert) {
        enemy.facing = Math.sin(this.animationTime * 0.6 + enemy.row) > 0 ? 1 : -1;
        enemy.x = clamp(enemy.x + enemy.facing * enemy.speed * 0.18 * delta, enemy.spawnX - 70, enemy.spawnX + 70);
        return;
      }
      enemy.facing = Math.sign(horizontal) || enemy.facing || 1;
      const ranged = enemy.behavior === 'spitter' || enemy.behavior === 'shooter' || enemy.isBoss;
      if (ranged && Math.abs(horizontal) < (enemy.isBoss ? 640 : 500) && Math.abs(horizontal) > 115 && vertical < 180 && enemy.rangedClock <= 0) {
        this.spawnEnemyProjectile(enemy, targetEntity);
        enemy.rangedClock = enemy.isBoss ? 1.2 : enemy.behavior === 'spitter' ? 1.55 : 1.15;
        enemy.attacking = true;
      } else enemy.attacking = enemy.attackClock < 0.25 && Math.abs(horizontal) < 115;
      const stopRange = enemy.isBoss ? 94 : enemy.behavior === 'pouncer' ? 42 : 58;
      if (enemy.staggerClock <= 0 && Math.abs(horizontal) > stopRange && vertical < 160) {
        const speedMultiplier = enemy.behavior === 'hunter' ? 1.28 : enemy.behavior === 'pouncer' ? 1.38 : enemy.isBoss ? 0.75 : 1;
        const previousX = enemy.x;
        enemy.x += enemy.facing * enemy.speed * speedMultiplier * delta;
        this.resolveEnemyHorizontal(enemy, previousX);
      }
      if (enemy.behavior === 'pouncer' && Math.abs(horizontal) < 210 && enemy.attackClock <= 0) {
        enemy.x += Math.sign(horizontal) * 92;
        enemy.attackClock = 1.3;
        enemy.attacking = true;
      }
      if ((overlaps(enemy, targetEntity) || (Math.abs(horizontal) < stopRange + 28 && vertical < 95)) && enemy.attackClock <= 0) {
        if (enemy.behavior === 'exploder') return void this.detonateEnemy(enemy, target);
        if (target.inVehicle) this.damageVehicle(enemy.damage, enemy.name);
        else this.damageSquadMember(target, enemy.damage, { source: enemy.name });
        enemy.attackClock = enemy.isBoss ? 0.65 : enemy.behavior === 'pouncer' ? 1.1 : 0.82;
        enemy.attacking = true;
      }
    }

    updateHostileProjectiles(delta) {
      super.updateHostileProjectiles(delta);
      for (const projectile of asList(this.hostileProjectiles)) {
        if (projectile.hit) continue;
        const target = this.activeSquadActors().find((member) => member.alive && !member.inVehicle && overlaps(projectile, member));
        if (!target) continue;
        this.damageSquadMember(target, projectile.damage, { source: projectile.acid ? 'acid-projectile' : 'projectile' });
        projectile.hit = true;
        this.spawnImpact?.(projectile.x, projectile.y, projectile.acid ? '#a7c742' : '#e3b86c');
      }
      this.hostileProjectiles = asList(this.hostileProjectiles).filter((projectile) => !projectile.hit && projectile.life > 0);
    }

    updateMissionSquad(delta) {
      const leader = this.player?.alive ? this.player : this.coopEnabled && this.coop?.alive ? this.coop : this.player;
      if (!leader) return;
      const active = this.activeSquadActors();
      const fixedActors = [this.player, this.coopEnabled ? this.coop : null].filter((actor) => actor?.alive && !actor.inVehicle);
      for (const [index, member] of active.entries()) {
        member.fireClock = Math.max(0, member.fireClock - delta);
        member.supportClock = Math.max(0, member.supportClock - delta);
        member.workClock = Math.max(0, member.workClock - delta);
        member.alertClock = Math.max(0, member.alertClock - delta);
        member.hazardClock = Math.max(0, member.hazardClock - delta);
        member.rallyClock = Math.max(0, member.rallyClock - delta);
        if (!member.alive) {
          if (member.downed) {
            member.bleedOut = Math.max(0, member.bleedOut - delta);
            if (member.bleedOut === 0) this.finalizeSquadLoss(member);
          }
          continue;
        }
        if (member.hazardKind === 'electrical' && member.hazardClock > 0) {
          member.vx = 0;
          member.climbing = false;
          member.crouching = false;
          const previousBottom = member.y + member.h;
          member.vy += GRAVITY * delta;
          member.y += member.vy * delta;
          member.grounded = false;
          this.resolveVertical(member, previousBottom);
          continue;
        }
        if (this.updateSquadVehicleSeat(member, index, leader, delta)) continue;
        this.updateSquadMovement(member, index, leader, delta);
        this.updateSquadCombat(member);
        this.updateSquadSupport(member, active, leader);
        this.applySquadHazard(member);
      }
      this.squadTelemetry.separations += this.separateSquadFormation(active, fixedActors);
    }

    sameSquadSurface(first, second) {
      if (!first || !second) return false;
      const firstBottom = (Number(first.y) || 0) + (Number(first.h) || 0);
      const secondBottom = (Number(second.y) || 0) + (Number(second.h) || 0);
      return Math.abs(firstBottom - secondBottom) <= 44;
    }

    moveSquadMemberForSeparation(member, targetX) {
      const previousX = member.x;
      member.x = clamp(targetX, 0, WORLD_WIDTH - member.w);
      this.resolveHorizontal(member, previousX);
      return Math.abs(member.x - previousX) > 0.01;
    }

    separateSquadFormation(members = this.activeSquadActors(), fixedActors = null) {
      const mobile = asList(members).filter((member) => member?.alive && !member.inVehicle && !member.climbing
        && !(member.hazardKind === 'electrical' && member.hazardClock > 0));
      const anchors = asList(fixedActors || [this.player, this.coopEnabled ? this.coop : null])
        .filter((actor) => actor?.alive && !actor.inVehicle && !actor.climbing);
      if (!mobile.length || !anchors.length) return 0;
      let corrections = 0;

      const ensureDistance = (member, anchor, preferredDirection) => {
        if (!this.sameSquadSurface(member, anchor)) return false;
        const memberCenter = member.x + member.w / 2;
        const anchorCenter = anchor.x + anchor.w / 2;
        const minimum = getSquadSeparationDistance(member, anchor);
        const delta = memberCenter - anchorCenter;
        if (Math.abs(delta) >= minimum - 0.01) return false;
        let direction = Math.sign(delta) || Math.sign(preferredDirection) || -(Math.sign(anchor.facing) || 1);
        const maximumX = WORLD_WIDTH - member.w;
        const candidate = anchorCenter + direction * minimum - member.w / 2;
        const opposite = anchorCenter - direction * minimum - member.w / 2;
        if ((candidate < 0 || candidate > maximumX) && opposite >= 0 && opposite <= maximumX) direction *= -1;
        const moved = this.moveSquadMemberForSeparation(member, anchorCenter + direction * minimum - member.w / 2);
        if (moved) corrections += 1;
        return moved;
      };

      for (let pass = 0; pass < 6; pass += 1) {
        let changed = false;
        for (const member of mobile) {
          const slotDirection = -(Math.sign((anchors[0]?.facing) || 1) || 1);
          for (const anchor of anchors) changed = ensureDistance(member, anchor, slotDirection) || changed;
        }
        for (let firstIndex = 0; firstIndex < mobile.length; firstIndex += 1) {
          const first = mobile[firstIndex];
          for (let secondIndex = firstIndex + 1; secondIndex < mobile.length; secondIndex += 1) {
            const second = mobile[secondIndex];
            const delta = (second.x + second.w / 2) - (first.x + first.w / 2);
            const slotDirection = Math.sign(delta) || -(Math.sign((anchors[0]?.facing) || 1) || 1);
            changed = ensureDistance(second, first, slotDirection) || changed;
          }
        }
        if (!changed) break;
      }
      return corrections;
    }

    updateSquadVehicleSeat(member, index, leader, delta) {
      const vehicle = this.vehicle;
      if (!vehicle?.active || vehicle.destroyed || !vehicle.occupied) {
        if (member.inVehicle) {
          member.inVehicle = false;
          member.x = getSquadFormationX(leader, member, member.formationIndex ?? index);
          member.y = clamp((vehicle?.y || leader.y) + (vehicle?.h || 0) - member.h, 0, WORLD_HEIGHT - member.h);
          this.separateSquadFormation([member], [leader]);
        }
        return false;
      }
      const capacity = Math.max(0, Number(vehicle.seatCount || this.vehicleHandling?.passengerCapacity + 1 || 1) - 1);
      const boarded = this.activeSquadActors().filter((actor) => actor.inVehicle).length;
      if (!member.inVehicle && boarded < capacity && (distance(member, vehicle) < 260 || distance(member, leader) > 720)) {
        member.inVehicle = true;
        if (!vehicle.passengers.includes(member)) vehicle.passengers.push(member);
        this.squadTelemetry.boarded += 1;
        this.recordSquadConsequence(member, 'boarded', { vehicleId: vehicle.id });
      }
      if (!member.inVehicle) return false;
      member.x = vehicle.x + 42 + index * 26;
      member.y = vehicle.y + vehicle.h - member.h;
      member.vx = vehicle.vx || 0;
      member.vy = vehicle.vy || 0;
      if (member.specialty === 'pilot' || member.specialty === 'vehicle') {
        member.vehicleAmmoAccumulator = (member.vehicleAmmoAccumulator || 0) + delta * 0.25;
        if (member.vehicleAmmoAccumulator >= 1) {
          const rounds = Math.floor(member.vehicleAmmoAccumulator);
          vehicle.turretReserve = Math.min(999, Math.round(vehicle.turretReserve || 0) + rounds);
          member.vehicleAmmoAccumulator -= rounds;
        }
      }
      return true;
    }

    updateSquadMovement(member, index, leader, delta) {
      const targetEnemy = this.closestEnemy(member, member.profile.range);
      const formationIndex = member.formationIndex ?? index;
      const formationSlot = Math.max(
        Number(member.formationSlot) || 0,
        getSquadVisualWidth(member) + SQUAD_FORMATION_GAP
      );
      const enemyDirection = targetEnemy ? -(Math.sign(targetEnemy.x - member.x) || member.facing || 1) : 0;
      const formationX = targetEnemy
        ? clamp(targetEnemy.x + targetEnemy.w / 2 + enemyDirection * (170 + formationIndex * formationSlot) - member.w / 2, 0, WORLD_WIDTH - member.w)
        : getSquadFormationX(leader, member, formationIndex);
      const targetY = targetEnemy ? targetEnemy.y + targetEnemy.h : leader.y + leader.h;
      const gapX = formationX - member.x;
      const gapY = targetY - (member.y + member.h);
      if ((Math.abs(gapX) > 960 || Math.abs(gapY) > 470) && member.rallyClock <= 0) {
        member.x = getSquadFormationX(leader, member, formationIndex);
        member.y = clamp(leader.y + leader.h - member.h, 0, WORLD_HEIGHT - member.h);
        member.vx = 0;
        member.vy = 0;
        member.rallyClock = 2;
        this.squadTelemetry.rallies += 1;
        this.recordSquadConsequence(member, 'rally', { x: Math.round(member.x), y: Math.round(member.y) });
        return;
      }
      const ladder = this.findSquadLadder(member, formationX, targetY);
      if (ladder && Math.abs(gapY) > 80) {
        const ladderGap = ladder.x - (member.x + member.w / 2);
        if (Math.abs(ladderGap) < 34) {
          member.climbing = true;
          member.x += ladderGap * Math.min(1, delta * 10);
          member.vy = Math.sign(gapY) * 170;
          member.y = clamp(member.y + member.vy * delta, ladder.top - member.h + 8, ladder.bottom - member.h);
          member.vx = 0;
          member.grounded = false;
          return;
        }
      }
      member.climbing = false;
      const desiredVelocity = Math.abs(gapX) > 34 ? Math.sign(gapX) * (targetEnemy ? 165 : 215) : 0;
      member.vx += (desiredVelocity - member.vx) * Math.min(1, delta * (member.grounded ? 12 : 7));
      if (Math.abs(member.vx) > 4) member.facing = Math.sign(member.vx);
      const previousX = member.x;
      member.x = clamp(member.x + member.vx * delta, 0, WORLD_WIDTH - member.w);
      this.resolveHorizontal(member, previousX);
      const blocked = Math.abs(member.x - previousX) < Math.max(0.4, Math.abs(member.vx * delta) * 0.2) && Math.abs(gapX) > 70;
      member.stuckClock = blocked ? member.stuckClock + delta : Math.max(0, member.stuckClock - delta * 2);
      if (member.grounded && (member.stuckClock > 0.22 || gapY < -95)) {
        member.vy = -540;
        member.grounded = false;
        member.stuckClock = 0;
      }
      const previousBottom = member.y + member.h;
      member.vy += GRAVITY * delta;
      member.y += member.vy * delta;
      member.grounded = false;
      this.resolveVertical(member, previousBottom);
      if (member.y > WORLD_HEIGHT + 80) {
        member.x = getSquadFormationX(leader, member, formationIndex);
        member.y = clamp(leader.y + leader.h - member.h, 0, WORLD_HEIGHT - member.h);
        member.vy = 0;
      }
      member.inCover = Boolean(this.findCover?.(member) && targetEnemy && Math.abs(targetEnemy.x - member.x) < 440);
      member.crouching = member.inCover;
    }

    findSquadLadder(member, targetX, targetBottom) {
      const between = (value, a, b) => value >= Math.min(a, b) - 80 && value <= Math.max(a, b) + 80;
      return asList(this.ladders)
        .filter((ladder) => between(ladder.x, member.x, targetX) && targetBottom >= ladder.top - 80 && member.y + member.h >= ladder.top - 80)
        .sort((a, b) => Math.abs(a.x - member.x) - Math.abs(b.x - member.x))[0] || null;
    }

    closestEnemy(member, maximumRange = 620) {
      return asList(this.enemies)
        .filter((enemy) => enemy.alive
          && (!this.stealthRuntime || enemy.alert || (enemy.revealed || 0) > 0)
          && distance(member, enemy) <= maximumRange)
        .sort((a, b) => distance(member, a) - distance(member, b))[0] || null;
    }

    updateSquadCombat(member) {
      const target = this.closestEnemy(member, member.profile.range);
      if (!target || member.fireClock > 0 || member.downed) return false;
      const direction = Math.sign(target.x - member.x) || member.facing || 1;
      member.facing = direction;
      member.fireClock = member.profile.interval / this.squadCommandMultiplier;
      member.workClock = Math.max(member.workClock, 0.28);
      member.v52FireClock = 0.32;
      member.shots += 1;
      member.actions += 1;
      target.alert = true;
      const explosive = member.specialty === 'demolition';
      const bullet = {
        x: member.x + member.w / 2 + direction * 22,
        y: member.y + 36,
        w: explosive ? 16 : 12,
        h: explosive ? 8 : 4,
        vx: direction * (explosive ? 700 : 850),
        vy: 0,
        damage: member.profile.damage,
        owner: member,
        kind: `squad-${member.specialty}`,
        family: explosive ? 'explosive' : member.specialty === 'heavy' ? 'smartgun' : 'ballistic',
        penetration: member.specialty === 'heavy' ? 28 : 12,
        remainingPenetration: member.specialty === 'heavy' ? 54 : 20,
        armorBypass: member.specialty === 'recon' ? 0.22 : 0.08,
        maxHits: member.specialty === 'heavy' ? 2 : 1,
        status: member.specialty === 'infiltration' ? 'disoriented' : member.specialty === 'science' ? 'tracked' : null,
        splash: member.profile.splash || 0,
        hitCount: 0,
        hitEnemyIds: new Set(),
        life: 1.15,
        hit: false
      };
      this.bullets.push(bullet);
      this.squadTelemetry.shots += 1;
      this.onEvent({ type: 'squad-fire', crewId: member.crewId, specialty: member.specialty, targetId: target.id, damage: bullet.damage });
      return true;
    }

    updateSquadSupport(member, active, leader) {
      if (member.supportClock > 0 || member.supportCharges <= 0) return false;
      if (member.specialty === 'medical') {
        const downed = [leader, this.coopEnabled ? this.coop : null, ...active].find((actor) => actor?.downed && distance(member, actor) < 260);
        if (downed) return this.reviveFromSquad(member, downed);
        const injured = [leader, this.coopEnabled ? this.coop : null, ...active]
          .filter((actor) => actor?.alive && actor.health < actor.maxHealth * 0.62 && distance(member, actor) < 220)
          .sort((a, b) => a.health / a.maxHealth - b.health / b.maxHealth)[0];
        if (injured) {
          const amount = Math.min(28, injured.maxHealth - injured.health);
          injured.health += amount;
          member.supportCharges -= 1;
          member.supportClock = 5;
          member.workClock = 0.7;
          this.squadTelemetry.heals += 1;
          this.recordSquadConsequence(member, 'heal', { targetId: injured.crewId || injured.operatorId || 'player', amount });
          return true;
        }
      }
      if (['engineering', 'vehicle'].includes(member.specialty) && this.vehicle?.active && !this.vehicle.destroyed && this.vehicle.hull < this.vehicle.maxHull && distance(member, this.vehicle) < 300) {
        const amount = Math.min(member.specialty === 'vehicle' ? 36 : 26, this.vehicle.maxHull - this.vehicle.hull);
        this.vehicle.hull += amount;
        member.supportCharges -= 1;
        member.supportClock = 7;
        member.workClock = 0.8;
        this.squadTelemetry.repairs += 1;
        this.recordSquadConsequence(member, 'repair', { vehicleId: this.vehicle.id, amount });
        return true;
      }
      if (['science', 'recon', 'infiltration'].includes(member.specialty)) {
        const contacts = asList(this.enemies).filter((enemy) => enemy.alive && distance(member, enemy) < (member.specialty === 'recon' ? 820 : 620));
        if (contacts.length) {
          for (const enemy of contacts) {
            enemy.revealed = Math.max(enemy.revealed || 0, member.specialty === 'infiltration' ? 3 : 6);
            if (member.specialty === 'infiltration') enemy.jammedClock = Math.max(enemy.jammedClock || 0, 0.75);
          }
          member.supportCharges -= 1;
          member.supportClock = 6;
          member.workClock = 0.7;
          this.tracker.energy = Math.min(100, this.tracker.energy + 8);
          this.squadTelemetry.scans += 1;
          this.recordSquadConsequence(member, member.specialty === 'infiltration' ? 'jam' : 'scan', { contacts: contacts.length });
          return true;
        }
      }
      return false;
    }

    applySquadHazard(member) {
      if (!member.alive || member.inVehicle || member.hazardClock > 0) return;
      const feet = { x: member.x + 5, y: member.y + member.h - 12, w: member.w - 10, h: 12 };
      const hazard = asList(this.hazards).find((candidate) => candidate.active && overlaps(feet, candidate));
      if (!hazard) return;
      const kind = hazard.kind || 'hazard';
      const resistance = member.specialty === 'survival' ? 0.35 : member.species === 'synthetic' && ['toxic', 'vacuum'].includes(kind) ? 0.4 : 1;
      const damage = Number(hazard.damage ?? 12);
      const stun = Math.max(0, Number(hazard.stun ?? hazard.stunSeconds) || 0);
      const impulse = Math.max(0, Number(hazard.impulse ?? hazard.knockback) || 0);
      if (damage > 0) this.damageSquadMember(member, damage * resistance, { source: kind });
      member.hazardKind = kind;
      member.hazardClock = kind === 'electrical'
        ? Math.max(0.72, stun)
        : member.specialty === 'survival' ? Math.max(1.2, stun) : Math.max(0.75, stun);
      if (kind === 'electrical') member.vx = 0;
      if (impulse > 0) member.vy = -impulse;
      else if (damage > 0 || hazard.knockback) member.vy = -190;
    }

    damageSquadMember(member, amount, { source = 'enemy' } = {}) {
      if (!member?.alive || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return 0;
      const adjusted = Math.max(1, Number(amount) || 0) * (member.specialty === 'survival' ? 0.86 : 1) / this.squadCohesionMultiplier;
      const absorbed = Math.min(member.armor, adjusted * 0.5);
      member.armor -= absorbed;
      const damage = adjusted - absorbed;
      member.health -= damage;
      member.damageTaken += damage;
      member.v52HurtClock = 0.42;
      member.alertClock = 0.4;
      this.squadTelemetry.hitsTaken += 1;
      if (member.health <= 0) {
        member.health = 0;
        member.alive = false;
        member.downed = true;
        member.bleedOut = 18;
        member.inVehicle = false;
        if (this.vehicle?.passengers) this.vehicle.passengers = this.vehicle.passengers.filter((passenger) => passenger !== member);
        this.onEvent({ type: 'squad-down', crewId: member.crewId, source, revivable: this.activeSquadActors().some((ally) => ally.alive && ally.specialty === 'medical') });
      }
      return damage;
    }

    tryEmergencySquadRevive(target) {
      const medic = this.activeSquadActors().find((member) => member.alive && member.specialty === 'medical' && member.supportCharges > 0 && distance(member, target) <= 260);
      if (!medic) return false;
      target.alive = true;
      target.downed = false;
      target.bleedOut = 0;
      target.health = Math.min(Number(target.maxHealth) || 100, 32);
      target.armor = 0;
      target.actionClock = 0.9;
      target.v52HurtClock = 0.45;
      medic.supportCharges -= 1;
      medic.supportClock = 7;
      medic.workClock = 0.9;
      if (this.mission?.state === 'failed') {
        this.mission.state = 'active';
        this.mission.failureReason = null;
      }
      this.squadTelemetry.revives += 1;
      this.recordSquadConsequence(medic, 'revive', { targetId: target.operatorId || 'player', emergency: true });
      this.onEvent({ type: 'squad-revived', crewId: medic.crewId, targetId: target.operatorId || (target.coop ? 'coop' : 'player'), emergency: true });
      return true;
    }

    reviveFromSquad(medic, target) {
      target.alive = true;
      target.downed = false;
      target.bleedOut = 0;
      target.health = Math.min(target.maxHealth, Math.max(Math.min(34, target.maxHealth), target.health || 0));
      target.armor = Math.max(0, target.armor || 0);
      target.v52HurtClock = 0.4;
      medic.supportCharges -= 1;
      medic.supportClock = 7;
      medic.workClock = 0.9;
      this.squadTelemetry.revives += 1;
      this.recordSquadConsequence(medic, 'revive', { targetId: target.crewId || target.operatorId || 'player' });
      this.onEvent({ type: 'squad-revived', crewId: medic.crewId, targetId: target.crewId || target.operatorId || (target.coop ? 'coop' : 'player'), emergency: false });
      return true;
    }

    finalizeSquadLoss(member) {
      if (!member?.downed || member.lost) return false;
      member.downed = false;
      member.lost = true;
      member.alive = false;
      member.health = 0;
      this.mission.casualties = (Number(this.mission.casualties) || 0) + 1;
      if (this.vehicle?.passengers) this.vehicle.passengers = this.vehicle.passengers.filter((passenger) => passenger !== member);
      this.recordSquadConsequence(member, 'lost', { permanent: true });
      this.onEvent({ type: 'squad-lost', crewId: member.crewId, name: member.name });
      return true;
    }

    failMission(reason) {
      const result = super.failMission(reason);
      if (this.mission?.state === 'failed') this.abortVehicleAccessV59('mission-failed');
      return result;
    }

    restartFromCheckpoint() {
      if (this.mission?.state !== 'failed') return super.restartFromCheckpoint();
      this.abortVehicleAccessV59('mission-restarted');
      const restarted = super.restartFromCheckpoint();
      if (restarted && this.vehicle) this.vehicle.accessSecureClock = 0;
      return restarted;
    }

    completeMission(actor) {
      const squadKills = this.activeSquadActors().reduce((total, member) => total + (Number(member.kills) || 0), 0);
      if (!this.player || squadKills <= 0) {
        const completed = super.completeMission(actor);
        if (completed) this.abortVehicleAccessV59('mission-complete');
        return completed;
      }
      this.player.kills += squadKills;
      try {
        const completed = super.completeMission(actor);
        if (completed && this.mission) {
          this.mission.squadKills = squadKills;
          this.abortVehicleAccessV59('mission-complete');
        }
        return completed;
      } finally {
        this.player.kills -= squadKills;
      }
    }

    recordSquadConsequence(member, action, detail = {}) {
      member.actions += 1;
      const consequence = { crewId: member.crewId, action, at: Math.round((this.mission?.elapsed || 0) * 10) / 10, ...detail };
      this.squadTelemetry.consequences.push(consequence);
      if (this.squadTelemetry.consequences.length > 48) this.squadTelemetry.consequences.shift();
      this.onEvent({ type: 'squad-action', ...consequence });
      return consequence;
    }

    updateSpriteAnimationEvents() {
      if (!this.spriteAnimation) return;
      const playerNeuroActive = Boolean(this.neuro?.active);
      const samples = [
        [getAnimationEntityKeyV57('player', this.player, 'primary'), this.player, this.player ? resolveIdentitySafePlayerAnimationV57(this.player, playerNeuroActive) : null],
        [getAnimationEntityKeyV57('coop', this.coop, 'secondary'), this.coopEnabled ? this.coop : null, this.coopEnabled && this.coop ? resolveIdentitySafePlayerAnimationV57(this.coop, false) : null],
        ...this.activeSquadActors().map((member) => [getAnimationEntityKeyV57('npc', member, 'crew'), member, resolveIdentitySafeNpcAnimationV57(member)]),
        ...asList(this.enemies).map((enemy) => [getAnimationEntityKeyV57('enemy', enemy, 'hostile'), enemy, resolveEnemyAnimation(enemy)]),
        [getAnimationEntityKeyV57('vehicle', this.vehicle, 'mission'), this.vehicle?.active ? this.vehicle : null, this.vehicle?.active ? resolveVehicleAnimation(this.vehicle) : null]
      ];
      for (const [entityId, entity, request] of samples) {
        if (entity?.visualIdentityStatus && entity.visualIdentityStatus !== 'exact') {
          this.animationTelemetry.approximatedEnemyVisuals.add(`${entity.visualArchetype}:${entity.visualIdentityStatus}`);
        }
        if (!entity || !request) {
          if (entity?.biology) this.animationTelemetry.fallbackFamilies.add(entity.biology);
          continue;
        }
        const sample = this.spriteAnimation.sample(entityId, request, this.animationTime, { reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion) });
        if (!sample) continue;
        entity.v52Animation = { sheetId: request.sheetId, clipId: request.clipId, frame: sample.frame, complete: sample.complete };
        this.animationTelemetry.samples += 1;
        this.animationTelemetry.activeClips[entityId] = `${request.sheetId}:${request.clipId}`;
      }
    }

    handleSpriteFrameEvent(payload) {
      this.animationTelemetry.events += 1;
      this.animationTelemetry.byEvent[payload.event] = (this.animationTelemetry.byEvent[payload.event] || 0) + 1;
      const entity = [
        [this.player, 'player', 'primary'],
        [this.coop, 'coop', 'secondary'],
        ...this.activeSquadActors().map((candidate) => [candidate, 'npc', 'crew']),
        ...asList(this.enemies).map((candidate) => [candidate, 'enemy', 'hostile']),
        [this.vehicle, 'vehicle', 'mission']
      ]
        .find(([candidate, role, fallback]) => candidate && getAnimationEntityKeyV57(role, candidate, fallback) === payload.entityId)?.[0];
      if (entity) {
        entity.lastAnimationEvent = payload.event;
        if (payload.event === 'state:death-lock') entity.animationLocked = true;
        if (/weapon:shot|weapon:recoil|combat:/.test(payload.event)) {
          entity.frameEffectClock = 0.12;
          this.animationTelemetry.frameEffects += 1;
        }
      }
      if (/^(weapon:|combat:|state:death|interaction:work|vehicle:critical)/.test(payload.event)) this.onEvent({ type: 'animation-frame', ...payload });
    }

    drawWorld(ctx) {
      const objectiveNodes = asList(this.objectiveNodes);
      if (!objectiveNodes.length) return super.drawWorld(ctx);
      this.objectiveNodes = [];
      try {
        super.drawWorld(ctx);
      } finally {
        this.objectiveNodes = objectiveNodes;
      }
      for (const node of objectiveNodes) this.drawMissionObjectiveProp(ctx, node);
    }

    drawMissionObjectiveProp(ctx, node) {
      if (!ctx || !node) return;
      const art = node.kind === 'seal' || node.kind === 'destroy-relay'
        ? 'breakable'
        : node.kind === 'rescue' || node.kind === 'recover-synthetic'
          ? 'crates'
          : node.kind === 'secure-vehicle'
            ? 'cover'
            : 'lamp';
      const renderHeight = clamp((Number(node.h) || 62) * 0.94, 48, 84);
      const renderWidth = clamp((Number(node.w) || 48) + 20, 64, 106);
      const x = node.x - (renderWidth - node.w) / 2;
      this.drawWorldProp(ctx, art, x, node.y + node.h, renderHeight, renderWidth);

      const markerX = node.x + node.w / 2;
      const markerY = node.y - 9;
      const pulse = this.accessibilityRuntime?.reducedMotion ? 0 : Math.sin(this.animationTime * 4.5) * 2;
      const color = node.active ? '#76d69b' : node.kind === 'seal' ? '#e2a45f' : '#65c8bf';
      ctx.save();
      ctx.translate(markerX, markerY);
      ctx.rotate(Math.PI / 4);
      ctx.globalAlpha = node.active ? 0.78 : 0.92;
      ctx.shadowColor = color;
      ctx.shadowBlur = node.active ? 5 : 10 + pulse;
      ctx.fillStyle = color;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.globalAlpha = 0.46;
      ctx.strokeStyle = color;
      ctx.strokeRect(-8 - pulse / 2, -8 - pulse / 2, 16 + pulse, 16 + pulse);
      ctx.restore();
    }

    drawActor(ctx, actor) {
      const isCoop = actor === this.coop;
      const request = resolveIdentitySafePlayerAnimationV57(actor, Boolean(this.neuro?.active && actor === this.player));
      const entityId = getAnimationEntityKeyV57(isCoop ? 'coop' : 'player', actor, isCoop ? 'secondary' : 'primary');
      const sample = this.spriteAnimation?.sample(entityId, request, this.animationTime, { emit: false, reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion) });
      if (!this.drawSpriteSample(ctx, sample, actor)) return super.drawActor(ctx, actor);
      if (actor.inCover) {
        ctx.strokeStyle = '#79c895';
        ctx.strokeRect(actor.x - 3, actor.y + 32, actor.w + 6, actor.h - 29);
      }
      if (actor === this.player && this.costumeRuntime?.active) {
        ctx.fillStyle = this.costumeRuntime.visual.primary;
        ctx.globalAlpha = 0.34;
        ctx.fillRect(actor.x + 5, actor.y + 20, Math.max(8, actor.w - 10), 8);
        ctx.fillStyle = this.costumeRuntime.visual.accent;
        ctx.fillRect(actor.x + actor.w - 10, actor.y + 31, 5, 22);
        ctx.globalAlpha = 1;
      }
    }

    drawEnemy(ctx, enemy) {
      const request = resolveEnemyAnimation(enemy);
      if (!request) {
        this.animationTelemetry?.fallbackFamilies?.add(enemy.biology || 'unknown');
        return super.drawEnemy(ctx, enemy);
      }
      const sample = this.spriteAnimation?.sample(getAnimationEntityKeyV57('enemy', enemy, 'hostile'), request, this.animationTime, { emit: false, reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion) });
      ctx.save();
      if (!enemy.alive) ctx.globalAlpha = clamp(enemy.deathClock / 1.2, 0.25, 1);
      if (enemy.revealed > 0) { ctx.shadowColor = '#8fe7a8'; ctx.shadowBlur = 16; }
      const drawn = this.drawSpriteSample(ctx, sample, enemy);
      ctx.restore();
      if (!drawn) return super.drawEnemy(ctx, enemy);
      if (enemy.alive && (enemy.alert || enemy.isBoss)) {
        ctx.fillStyle = '#2b1616'; ctx.fillRect(enemy.x, enemy.y - 10, enemy.w, 4);
        ctx.fillStyle = enemy.isBoss ? '#d27662' : '#be5551';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.w * (enemy.health / enemy.maxHealth), 4);
      }
    }

    drawVehicle(ctx) {
      if (!this.vehicle?.active) return super.drawVehicle(ctx);
      const request = resolveVehicleAnimation(this.vehicle);
      const entityKey = getAnimationEntityKeyV57('vehicle', this.vehicle, 'mission');
      const animationOptions = { emit: false, reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion) };
      const sample = this.spriteAnimation?.sample(entityKey, request, this.animationTime, animationOptions);
      if (this.drawSpriteSample(ctx, sample, this.vehicle)) return;
      const fallbackRequest = resolveVehicleAccessFallbackV59(this.vehicle, request?.sheetId);
      const fallbackSample = fallbackRequest
        ? this.spriteAnimation?.sample(`${entityKey}:fallback-v59`, fallbackRequest, this.animationTime, animationOptions)
        : null;
      if (!this.drawSpriteSample(ctx, fallbackSample, this.vehicle)) super.drawVehicle(ctx);
    }

    drawWeaponPickup(ctx) {
      if (!this.weaponPickup?.taken) {
        const sample = this.spriteAnimation?.sample('weapon-pickup', { sheetId: 'weapon.m41a-pulse-rifle.action', clipId: 'idle' }, this.animationTime, { emit: false, reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion) });
        const anchor = this.weaponPickup ? { ...this.weaponPickup, x: this.weaponPickup.x, y: this.weaponPickup.y, w: this.weaponPickup.w, h: this.weaponPickup.h } : null;
        if (!this.drawSpriteSample(ctx, sample, anchor)) super.drawWeaponPickup(ctx);
      }
      this.drawAllies(ctx);
    }

    drawWeaponPickup(ctx) {
      if (!this.weaponPickup?.taken) {
        const request = { sheetId: this.weaponVisual?.sheetId || 'weapon.m41a-pulse-rifle.action', clipId: 'idle' };
        const sample = this.spriteAnimation?.sample('weapon-pickup', request, this.animationTime, { emit: false, reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion) });
        const anchor = this.weaponPickup ? { ...this.weaponPickup } : null;
        if (!this.drawSpriteSample(ctx, sample, anchor)) super.drawWeaponPickup(ctx);
      }
      this.drawAllies(ctx);
    }
    drawAllies(ctx) {
      for (const member of this.activeSquadActors()) if (!member.inVehicle) this.drawSquadActor(ctx, member);
    }

    drawSquadActor(ctx, member) {
      const request = resolveIdentitySafeNpcAnimationV57(member);
      const sample = this.spriteAnimation?.sample(getAnimationEntityKeyV57('npc', member, 'crew'), request, this.animationTime, { emit: false, reducedMotion: Boolean(this.accessibilityRuntime?.reducedMotion) });
      ctx.save();
      if (!member.alive) ctx.globalAlpha = member.downed ? 0.72 : 0.38;
      const drawn = this.drawSpriteSample(ctx, sample, member);
      ctx.restore();
      if (!drawn) {
        ctx.fillStyle = member.species === 'synthetic' ? '#c4d5d2' : '#7fa88a';
        ctx.fillRect(member.x, member.y, member.w, member.h);
      }
      if (member.alive) {
        ctx.fillStyle = 'rgba(2,8,6,.82)'; ctx.fillRect(member.x - 2, member.y - 17, member.w + 4, 5);
        ctx.fillStyle = member.health < member.maxHealth * 0.35 ? '#d06d62' : '#79c995';
        ctx.fillRect(member.x - 2, member.y - 17, (member.w + 4) * (member.health / member.maxHealth), 5);
      }
      this.squadTelemetry.rendered += 1;
    }

    drawSpriteSample(ctx, sample, entity) {
      if (!ctx || !sample || !entity) return false;
      const entry = sample.sheet;
      const image = this.images?.get(entry.imageKey);
      if (!imageReady(image)) return false;
      const runtime = buildSpriteHitboxRuntime(entity, entry);
      if (!runtime) return false;
      const { flip, sprite } = runtime;
      const sourceWidth = (image.naturalWidth || image.width) / SPRITE_GRID.columns;
      const sourceHeight = (image.naturalHeight || image.height) / SPRITE_GRID.rows;
      ctx.save();
      if (flip) {
        ctx.translate(sprite.x + sprite.width, sprite.y);
        ctx.scale(-1, 1);
        ctx.drawImage(image, sample.column * sourceWidth, sample.row * sourceHeight, sourceWidth, sourceHeight, 0, 0, sprite.width, sprite.height);
      } else ctx.drawImage(image, sample.column * sourceWidth, sample.row * sourceHeight, sourceWidth, sourceHeight, sprite.x, sprite.y, sprite.width, sprite.height);
      ctx.restore();
      entity.spriteHitbox = runtime;
      entity.spritePivot = runtime.pivot;
      return true;
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      const active = this.activeSquadActors();
      if (!active.length) return;
      const x = 18;
      const y = 118;
      const width = 244;
      const height = 22 + active.length * 24;
      ctx.fillStyle = 'rgba(3,10,8,.78)'; ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#668b71'; ctx.strokeRect(x + 0.5, y + 0.5, width, height);
      ctx.fillStyle = '#9be0ae'; ctx.font = 'bold 11px monospace'; ctx.fillText('ESCOUADE IA', x + 10, y + 15);
      for (const [index, member] of active.entries()) {
        const rowY = y + 31 + index * 24;
        ctx.fillStyle = member.alive ? '#c9d9ce' : '#c66d64';
        ctx.fillText(`${member.name.slice(0, 15)} · ${member.action}`, x + 10, rowY);
        ctx.fillStyle = '#26372e'; ctx.fillRect(x + 10, rowY + 5, 216, 3);
        ctx.fillStyle = member.alive ? '#79c995' : '#6c3434'; ctx.fillRect(x + 10, rowY + 5, 216 * clamp(member.health / member.maxHealth, 0, 1), 3);
      }
    }

    captureSquadState() {
      return {
        schema: 1,
        members: asList(this.squadActors).map((member) => ({
          crewId: member.crewId,
          x: clamp(member.x, 0, WORLD_WIDTH),
          y: clamp(member.y, 0, WORLD_HEIGHT),
          health: clamp(member.health, 0, member.maxHealth),
          armor: clamp(member.armor, 0, member.maxArmor),
          alive: Boolean(member.alive),
          downed: Boolean(member.downed),
          lost: Boolean(member.lost),
          bleedOut: clamp(member.bleedOut, 0, 120),
          facing: member.facing < 0 ? -1 : 1,
          inVehicle: Boolean(member.inVehicle),
          supportCharges: clamp(Math.round(member.supportCharges), 0, member.profile.supportCharges),
          kills: clamp(Math.round(member.kills), 0, 99999),
          shots: clamp(Math.round(member.shots), 0, 999999),
          actions: clamp(Math.round(member.actions), 0, 999999)
        }))
      };
    }

    restoreSquadState(rawSquad) {
      const sources = asList(rawSquad?.members);
      if (!this.squadActors?.length) {
        this.pendingSquadResume = rawSquad;
        return 0;
      }
      const byId = new Map(this.squadActors.map((member) => [member.crewId, member]));
      let restored = 0;
      for (const source of sources) {
        const member = byId.get(source?.crewId);
        if (!member) continue;
        const savedX = Number(source.x);
        const savedY = Number(source.y);
        const savedHealth = Number(source.health);
        const savedArmor = Number(source.armor);
        const savedBleedOut = Number(source.bleedOut);
        member.x = clamp(Number.isFinite(savedX) ? savedX : member.x, 0, WORLD_WIDTH - member.w);
        member.y = clamp(Number.isFinite(savedY) ? savedY : member.y, 0, WORLD_HEIGHT - member.h);
        member.health = clamp(Number.isFinite(savedHealth) ? savedHealth : member.health, 0, member.maxHealth);
        member.armor = clamp(Number.isFinite(savedArmor) ? savedArmor : member.armor, 0, member.maxArmor);
        member.lost = Boolean(source.lost);
        member.downed = Boolean(source.downed) && !member.lost;
        member.alive = source.alive !== false && !member.downed && !member.lost && member.health > 0;
        member.bleedOut = member.downed ? clamp(Number.isFinite(savedBleedOut) ? savedBleedOut : 18, 0, 120) : 0;
        member.facing = Number(source.facing) < 0 ? -1 : 1;
        member.inVehicle = Boolean(source.inVehicle && this.vehicle?.active && this.vehicle.occupied);
        member.supportCharges = clamp(Math.round(Number(source.supportCharges) || 0), 0, member.profile.supportCharges);
        member.kills = clamp(Math.round(Number(source.kills) || 0), 0, 99999);
        member.shots = clamp(Math.round(Number(source.shots) || 0), 0, 999999);
        member.actions = clamp(Math.round(Number(source.actions) || 0), 0, 999999);
        member.vx = 0;
        member.vy = 0;
        if (member.inVehicle && this.vehicle && !this.vehicle.passengers.includes(member)) this.vehicle.passengers.push(member);
        restored += 1;
      }
      return restored;
    }

    captureResumeState() {
      return { ...super.captureResumeState(), squad: this.captureSquadState() };
    }

    applyResumeState(rawState) {
      const result = super.applyResumeState(rawState);
      const validSquad = result.applied && rawState?.squad?.schema === 1;
      const squadRestored = validSquad ? this.restoreSquadState(rawState.squad) : 0;
      return { ...result, squadRestored };
    }

    getV52Snapshot() {
      const active = this.activeSquadActors();
      return {
        squadRuntime: {
          configured: this.squadActors?.length || 0,
          active: active.length,
          alive: active.filter((member) => member.alive).length,
          members: active.map((member) => ({
            crewId: member.crewId,
            name: member.name,
            role: member.role,
            specialty: member.specialty,
            action: member.action,
            spriteId: member.spriteId,
            alive: member.alive,
            downed: member.downed,
            health: Math.round(member.health),
            armor: Math.round(member.armor),
            supportCharges: member.supportCharges,
            kills: member.kills,
            shots: member.shots,
            actions: member.actions,
            inVehicle: member.inVehicle,
            x: Math.round(member.x),
            y: Math.round(member.y),
            animation: member.v52Animation || null
          })),
          telemetry: this.squadTelemetry ? {
            ...this.squadTelemetry,
            consequences: this.squadTelemetry.consequences.map((entry) => ({ ...entry }))
          } : null
        },
        vehicleAccessRuntime: this.vehicle ? {
          schema: 59,
          transition: this.vehicle.accessTransition ? { ...this.vehicle.accessTransition } : null,
          secureClock: Number((this.vehicle.accessSecureClock || 0).toFixed(3)),
          occupied: Boolean(this.vehicle.occupied),
          animation: resolveVehicleAnimation(this.vehicle)
        } : null,

        animationRuntime: this.animationTelemetry ? {
          ...this.spriteRuntime.report,
          samples: this.animationTelemetry.samples,
          events: this.animationTelemetry.events,
          byEvent: { ...this.animationTelemetry.byEvent },
          neuroPlayerContract: this.player?.neuroVisualContract ? { ...this.player.neuroVisualContract } : null,
          activeClips: { ...this.animationTelemetry.activeClips },
          fallbackFamilies: [...this.animationTelemetry.fallbackFamilies],
          frameEffects: this.animationTelemetry.frameEffects,
          approximatedEnemyVisuals: [...this.animationTelemetry.approximatedEnemyVisuals],
          controller: this.spriteAnimation?.snapshot() || []
        } : null
      };
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getV52Snapshot() };
    }
  };
}
