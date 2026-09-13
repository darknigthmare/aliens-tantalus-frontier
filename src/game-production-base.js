import { GameEngine as FinalGameEngine } from './game-final-runtime.js';
import { firstProjectileObstacleV83 } from './projectile-collision-v83.js';
import { collectProjectileCollisionsV83 } from './projectile-collision-v83.js';
import { CombatCaptionDirectorV84 } from './combat-captions-v84.js';

export * from './game-final-runtime.js';

const WORLD_WIDTH = 6200;
const FLOOR_Y = 930;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const list = (value) => Array.isArray(value) ? [...value] : [];
const overlaps = (a, b) => Boolean(a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
const distance = (a, b) => Math.hypot((a.x + a.w / 2) - (b.x + b.w / 2), (a.y + a.h / 2) - (b.y + b.h / 2));

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

const FREQUENCY_WEIGHTS = Object.freeze({ common: 100, uncommon: 62, rare: 28, apex: 9, scripted: 5 });

const isRoyalEnemy = (enemy = {}) => enemy.caste === 'royal' || /queen|reine/i.test(enemy.name || '');
const isWorldBoundDefaultEncounter = (enemy = {}) => Boolean(enemy.defaultEncounter && list(enemy.encounterWorldIds).length);

function campaignRequiresRoyal({ campaign = {}, levelSeed = {} } = {}) {
  const campaignContract = [campaign.id, campaign.name, campaign.objective, levelSeed.objective]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return /(?:^|\W)(?:queen|reine|hive|ruche)(?:$|\W)/.test(campaignContract);
}

export function buildEnemyEncounterEligibility(enemy = {}, { world = {}, levelSeed = {}, campaign = {} } = {}) {
  const worldIds = list(enemy.encounterWorldIds).map(String);
  const habitats = list(enemy.habitats).map((value) => String(value).toLowerCase());
  const context = [
    ...list(world.biomes), ...list(levelSeed.hazards), world.atmosphere, world.name, world.description,
    levelSeed.name, levelSeed.objective, campaign.name, campaign.objective, campaign.mode
  ].filter(Boolean).join(' ').toLowerCase();
  const worldMatch = worldIds.length === 0 || worldIds.includes(String(world.id || ''));
  const habitatMatch = habitats.length === 0 || habitats.some((habitat) => context.includes(habitat));
  const modifier = String(enemy.modifier || 'Standard').toLowerCase();
  let modifierMatch = true;
  if (modifier.includes('vacuum-adapted')) modifierMatch = context.includes('vacuum') || context.includes('orbital');
  if (modifier.includes('cryo-adapted')) modifierMatch = /cryo|ice|frozen|cryogenic/.test(context);
  const scripted = String(enemy.frequency || '').toLowerCase() === 'scripted';
  const scriptedMatch = !scripted || String(campaign.mode || '').toUpperCase() === 'MIRE' || context.includes(String(enemy.caste || '').toLowerCase());
  const frequency = String(enemy.frequency || 'common').toLowerCase();
  const baseWeight = FREQUENCY_WEIGHTS[frequency] || 35;
  const weight = Math.max(0.01, baseWeight * (worldMatch ? 1 : 0.13) * (habitatMatch ? 1 : 0.28) * (modifierMatch ? 1 : 0.15) * (scriptedMatch ? 1 : 0.08));
  const encounterMatch = isWorldBoundDefaultEncounter(enemy) ? worldMatch : (worldMatch || habitatMatch);
  const eligible = encounterMatch && modifierMatch && scriptedMatch;
  const reasons = [];
  if (!worldMatch) reasons.push('world-mismatch');
  if (!habitatMatch) reasons.push('habitat-mismatch');
  if (!modifierMatch) reasons.push('modifier-mismatch');
  if (!scriptedMatch) reasons.push('script-gated');
  return Object.freeze({ id: String(enemy.id || ''), eligible, weight, frequency, worldMatch, habitatMatch, modifierMatch, scriptedMatch, reasons: Object.freeze(reasons) });
}

export function selectEnemyEncounterCatalog(catalog = [], context = {}, targetCount = 32) {
  const entries = list(catalog).map((enemy) => ({ enemy, eligibility: buildEnemyEncounterEligibility(enemy, context) }));
  const eligible = entries.filter((entry) => entry.eligibility.eligible);
  const worldId = String(context.world?.id || '');
  const contextualDefaults = entries
    .filter((entry) => Number.isInteger(entry.enemy?.defaultEncounter?.slot))
    .filter((entry) => worldId && list(entry.enemy?.encounterWorldIds).map(String).includes(worldId))
    .sort((left, right) => left.enemy.defaultEncounter.slot - right.enemy.defaultEncounter.slot);
  const contextualDefaultEntries = new Set(contextualDefaults);
  const contextualDefaultIds = new Set(contextualDefaults.map((entry) => String(entry.enemy?.id || '')));
  const royalRequired = campaignRequiresRoyal(context);
  const royalEntries = entries.filter((entry) => (
    isRoyalEnemy(entry.enemy)
    && (!isWorldBoundDefaultEncounter(entry.enemy) || entry.eligibility.worldMatch)
  ));
  const requiredRoyal = royalRequired
    ? [...royalEntries].sort((a, b) => Number(b.eligibility.eligible) - Number(a.eligibility.eligible) || b.eligibility.weight - a.eligibility.weight)[0] || null
    : null;
  const allowed = entries.filter((entry) => entry.eligibility.eligible || contextualDefaultEntries.has(entry) || entry === requiredRoyal);
  const fallback = entries.filter((entry) => (
    (!isWorldBoundDefaultEncounter(entry.enemy) || entry.eligibility.worldMatch)
    && (!isRoyalEnemy(entry.enemy) || entry === requiredRoyal)
  ));
  const pool = allowed.length ? allowed : fallback;
  const available = pool.filter((entry) => !contextualDefaultEntries.has(entry));
  const random = seeded((Number(context.levelSeed?.seed) || 1) ^ hash(`${context.world?.id}:${context.campaign?.id}`));
  const selected = [...contextualDefaults];
  const requiredRoyalId = String(requiredRoyal?.enemy?.id || '');
  const minimumRequiredCount = contextualDefaults.length + Number(Boolean(requiredRoyal && !contextualDefaultIds.has(requiredRoyalId)));
  const limit = clamp(Math.max(Math.round(Number(targetCount) || 32), minimumRequiredCount), 1, Math.max(1, pool.length));
  while (available.length && selected.length < limit) {
    const total = available.reduce((sum, entry) => sum + entry.eligibility.weight, 0);
    let cursor = random() * total;
    let selectedIndex = available.length - 1;
    for (let index = 0; index < available.length; index += 1) {
      cursor -= available[index].eligibility.weight;
      if (cursor <= 0) { selectedIndex = index; break; }
    }
    selected.push(available.splice(selectedIndex, 1)[0]);
  }
  if (requiredRoyal && !selected.some((entry) => entry.enemy.id === requiredRoyal.enemy.id)) {
    if (selected.length >= limit && selected.length) {
      let replaceIndex = selected.length - 1;
      while (replaceIndex >= 0 && contextualDefaultEntries.has(selected[replaceIndex])) replaceIndex -= 1;
      if (replaceIndex >= 0) selected[replaceIndex] = requiredRoyal;
      else selected.push(requiredRoyal);
    }
    else selected.push(requiredRoyal);
  }
  return Object.freeze({
    selected: Object.freeze(selected.map((entry) => entry.enemy)),
    selectedIds: Object.freeze(selected.map((entry) => String(entry.enemy.id || ''))),
    eligibleCount: eligible.length,
    totalCount: entries.length,
    fallbackUsed: eligible.length === 0,
    royalRequired,
    royalSelected: selected.some((entry) => isRoyalEnemy(entry.enemy)),
    evaluations: Object.freeze(entries.map((entry) => entry.eligibility))
  });
}

const FAMILY_RULES = Object.freeze({
  ballistic: Object.freeze({ armorBypass: 0.1, penetrationScale: 1, maxHits: 5, status: null, noise: 1 }),
  smart: Object.freeze({ armorBypass: 0.18, penetrationScale: 1.05, maxHits: 5, status: 'tracked', noise: 0.9 }),
  flame: Object.freeze({ armorBypass: 0.3, penetrationScale: 0.35, maxHits: 2, status: 'burn', noise: 1.15 }),
  explosive: Object.freeze({ armorBypass: 0.4, penetrationScale: 0, maxHits: 1, status: 'blast', noise: 1.35, splash: 150 }),
  electric: Object.freeze({ armorBypass: 0.22, penetrationScale: 0.7, maxHits: 3, status: 'stun', noise: 0.75 }),
  silent: Object.freeze({ armorBypass: 0.12, penetrationScale: 0.85, maxHits: 4, status: null, noise: 0.22 }),
  energy: Object.freeze({ armorBypass: 0.55, penetrationScale: 1.35, maxHits: 7, status: 'ionized', noise: 0.82 }),
  melee: Object.freeze({ armorBypass: 0.3, penetrationScale: 0, maxHits: 1, status: 'stagger', noise: 0.18 }),
  tool: Object.freeze({ armorBypass: 0.5, penetrationScale: 0.2, maxHits: 1, status: 'breach', noise: 0.45 }),
  sonic: Object.freeze({ armorBypass: 0.2, penetrationScale: 0.9, maxHits: 4, status: 'disoriented', noise: 1.25 }),
  acid: Object.freeze({ armorBypass: 0.72, penetrationScale: 0.8, maxHits: 4, status: 'corroded', noise: 0.65 }),
  cryo: Object.freeze({ armorBypass: 0.2, penetrationScale: 0.75, maxHits: 3, status: 'frozen', noise: 0.55 }),
  chemical: Object.freeze({ armorBypass: 0.6, penetrationScale: 0.65, maxHits: 3, status: 'contaminated', noise: 0.5 }),
  sentry: Object.freeze({ armorBypass: 0.16, penetrationScale: 1.05, maxHits: 5, status: 'tracked', noise: 1 })
});

export function buildWeaponBallisticsRuntime(weapon = {}) {
  const family = String(weapon.family || 'ballistic').toLowerCase();
  const rule = FAMILY_RULES[family] || FAMILY_RULES.ballistic;
  const penetration = clamp(Number(weapon.penetration) || 0, 0, 100);
  return Object.freeze({
    family,
    penetration,
    penetrationBudget: Math.round(12 + penetration * 1.45 * rule.penetrationScale),
    armorBypass: rule.armorBypass,
    maxHits: rule.maxHits,
    status: rule.status,
    noise: rule.noise,
    splash: rule.splash || 0
  });
}

export function buildAccessibilityRuntime(options = {}) {
  const source = options.accessibility || options;
  const reducedMotion = Boolean(source.reducedMotion);
  const subtitles = source.subtitles !== false;
  const aimAssist = source.aimAssist === true || source.aimAssist === 'high' ? 'high' : source.aimAssist === false || source.aimAssist === 'off' ? 'off' : 'standard';
  const screenShake = reducedMotion || source.screenShake === false ? 0 : Number.isFinite(Number(source.screenShake)) ? clamp(Number(source.screenShake), 0, 1) : 0.65;
  return Object.freeze({ reducedMotion, subtitles, aimAssist, aimAssistStrength: aimAssist === 'high' ? 1 : aimAssist === 'standard' ? 0.62 : 0, screenShake });
}

export class GameEngine extends FinalGameEngine {
  bind() {
    super.bind();
    globalThis.addEventListener('keydown', (event) => {
      if (!this.running || !this.canRouteGameplayKey(event) || event.repeat || event.code !== 'KeyX') return;
      if (this.activateNeuroCountermeasure(this.player)) event.preventDefault();
    });
  }

  start(options = {}) {
    this.accessibilityRuntime = buildAccessibilityRuntime(options);
    this.captions = [];
    this.captionDirectorV84 = new CombatCaptionDirectorV84();
    this.cameraShake = 0;
    this.penetrationTelemetry = { shots: 0, hits: 0, passThroughs: 0, familyEffects: {} };
    this.encounterSelection = selectEnemyEncounterCatalog(options.enemyCatalog, { world: options.world, campaign: options.campaign, levelSeed: options.levelSeed }, 18 + (Number(options.world?.danger) || 5) * 2);
    const snapshot = super.start({ ...options, enemyCatalog: [...this.encounterSelection.selected] });
    this.weaponBallistics = buildWeaponBallisticsRuntime(this.weaponRuntime);
    this.configureNeuroCounterplay();
    this.pushCaption('mission', `Insertion: ${this.missionPlan.campaign.objective}`);
    return { ...snapshot, ...this.getProductionSnapshot() };
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
    const assigned = new Set();
    this.vehicle.seatAssignments = this.selectedVehicleRuntime.seats.map((seat) => {
      const preferred = crew.find((member) => !assigned.has(member.id) && (
        seat.role === 'driver' && ['pilot', 'vehicle'].includes(member.specialty) ||
        seat.role === 'gunner' && ['heavy', 'assault'].includes(member.specialty) ||
        seat.role === 'commander' && member.specialty === 'command'
      )) || crew.find((member) => !assigned.has(member.id)) || null;
      if (preferred) assigned.add(preferred.id);
      return { seatId: seat.id, role: seat.role, actions: [...seat.actions], operatorId: preferred?.id || null };
    });
    this.vehicle.crewHandlingBonus = this.vehicle.seatAssignments.some((seat) => seat.role === 'driver' && seat.operatorId) ? 1.08 : 1;
    this.vehicle.gunnerBonus = this.vehicle.seatAssignments.some((seat) => seat.role === 'gunner' && seat.operatorId) ? 1.15 : 1;
    this.vehicle.observeBonus = this.vehicle.seatAssignments.some((seat) => seat.actions.includes('observe') && seat.operatorId) ? 420 : 0;
    this.vehicle.supportRepairRate = this.vehicle.seatAssignments.some((seat) => seat.actions.includes('support') && seat.operatorId) ? 0.8 : 0;
    this.vehicle.maxTurretAmmo = Math.max(this.vehicle.turretAmmo, 50 + this.selectedVehicleRuntime.cargo);
    this.vehicle.turretReserve = Math.max(0, this.selectedVehicleRuntime.cargo * 2);
    if (profile.family === 'air' || profile.family === 'space') this.vehicle.y = FLOOR_Y - this.vehicle.h - 120;
    if (profile.family === 'maritime') this.vehicle.y = this.vehicle.waterLine;
  }

  configureNeuroCounterplay() {
    if (!this.neuro?.active) {
      this.neuroCounterplay = { active: false, state: 'inactive', pulses: 0, relay: null, adversaryId: null };
      return;
    }
    const adversary = this.enemies.find((enemy) => !enemy.isBoss && enemy.alive) || null;
    if (adversary) {
      adversary.neuroDisruptor = true;
      adversary.jammerStrength = 1 + this.neuro.controlDifficulty / 65;
      adversary.name = `${adversary.name} / Neuro-Disruptor`;
    }
    const relayX = adversary ? clamp(adversary.x - 130, 900, 5150) : 3150;
    this.neuroCounterplay = {
      active: true,
      state: 'jammed',
      pulses: 2,
      pulseCooldown: 0,
      drainApplied: 0,
      relay: { id: 'neuro-counter-relay', x: relayX, y: FLOOR_Y - 76, w: 54, h: 76, active: true },
      adversaryId: adversary?.id || null,
      neutralized: false
    };
    this.pushCaption('neuro', 'Brouillage Neuro-Link détecté. Neutralisez le relais.');
    this.onEvent({ type: 'neuro-counterplay-started', adversaryId: adversary?.id || null, relayId: this.neuroCounterplay.relay.id, pulses: this.neuroCounterplay.pulses });
  }

  update(delta) {
    super.update(delta);
    if (this.accessibilityRuntime?.reducedMotion) {
      this.particles = this.particles.slice(-4);
      this.cameraShake = 0;
    } else this.cameraShake = Math.max(0, this.cameraShake - delta * 2.8);
    if (this.vehicle?.occupied && this.vehicle.supportRepairRate > 0 && !this.vehicle.destroyed) this.vehicle.hull = Math.min(this.vehicle.maxHull, this.vehicle.hull + this.vehicle.supportRepairRate * delta);
    if (this.neuroCounterplay?.pulseCooldown > 0) this.neuroCounterplay.pulseCooldown = Math.max(0, this.neuroCounterplay.pulseCooldown - delta);
    this.checkNeuroAdversary();
  }

  updateNeuroControl(delta) {
    super.updateNeuroControl(delta);
    if (!this.neuro?.active || this.neuro.state !== 'linked' || !this.neuroCounterplay?.active || !this.neuroCounterplay.relay?.active) return;
    const adversary = this.enemies.find((enemy) => enemy.id === this.neuroCounterplay.adversaryId && enemy.alive && enemy.neuroDisruptor);
    if (!adversary) return;
    const range = 1250 + this.neuro.controlDifficulty * 7;
    const proximity = clamp(1 - Math.abs(this.player.x - adversary.x) / range, 0, 1);
    if (proximity <= 0) return;
    const drained = delta * adversary.jammerStrength * (0.8 + proximity * 2.4);
    this.neuro.signal = Math.max(0, this.neuro.signal - drained);
    this.neuroCounterplay.drainApplied += drained;
    adversary.revealed = Math.max(adversary.revealed, 0.2);
    if (this.neuro.signal === 0) this.triggerNeuroFailure();
  }

  checkNeuroAdversary() {
    if (!this.neuroCounterplay?.active || this.neuroCounterplay.neutralized) return;
    const adversary = this.enemies.find((enemy) => enemy.id === this.neuroCounterplay.adversaryId);
    if (adversary && !adversary.alive) this.neutralizeNeuroDisruption('adversary-killed');
  }

  activateNeuroCountermeasure(actor = this.player) {
    const counter = this.neuroCounterplay;
    if (!counter?.active || counter.neutralized || counter.pulses <= 0 || counter.pulseCooldown > 0 || !actor?.alive || this.neuro?.state !== 'linked') return false;
    counter.pulses -= 1;
    counter.pulseCooldown = 4;
    this.neuro.signal = Math.min(100, this.neuro.signal + 24);
    const adversary = this.enemies.find((enemy) => enemy.id === counter.adversaryId && enemy.alive);
    if (adversary) { adversary.jammedClock = 4; adversary.staggerClock = 2; adversary.neuroDisruptor = false; }
    counter.state = 'counter-pulse';
    this.pushCaption('neuro', 'Contre-impulsion ATARAX active. Fenêtre de contrôle stabilisée.');
    this.onEvent({ type: 'neuro-counter-pulse', pulses: counter.pulses, signal: this.neuro.signal, adversaryId: counter.adversaryId });
    return true;
  }

  neutralizeNeuroDisruption(reason = 'relay-disabled') {
    const counter = this.neuroCounterplay;
    if (!counter?.active || counter.neutralized) return false;
    counter.neutralized = true;
    counter.state = 'neutralized';
    if (counter.relay) counter.relay.active = false;
    const adversary = this.enemies.find((enemy) => enemy.id === counter.adversaryId);
    if (adversary) adversary.neuroDisruptor = false;
    this.neuro.signal = Math.min(100, this.neuro.signal + 38);
    this.neuro.relayX = this.player.x;
    this.pushCaption('neuro', 'Brouillage neutralisé. Liaison Neuro-Xeno restaurée.');
    this.onEvent({ type: 'neuro-disruption-neutralized', reason, signal: this.neuro.signal, adversaryId: counter.adversaryId });
    return true;
  }

  interact(actor = this.player) {
    const relay = this.neuroCounterplay?.relay;
    if (relay?.active && actor?.alive && distance(actor, relay) < 125) return this.neutralizeNeuroDisruption('relay-disabled');
    return super.interact(actor);
  }

  activateTracker(player) {
    const activated = super.activateTracker(player);
    if (!activated || !this.vehicle?.occupied || !this.vehicle.observeBonus) return activated;
    const extra = this.enemies.filter((enemy) => enemy.alive && distance(player.inVehicle ? this.vehicle : player, enemy) < 900 + this.vehicle.observeBonus);
    for (const enemy of extra) enemy.revealed = Math.max(enemy.revealed, 4);
    this.tracker.contacts = [...new Map([...this.tracker.contacts, ...extra.map((enemy) => ({ id: enemy.id, x: Math.round(enemy.x), y: Math.round(enemy.y), threat: enemy.isBoss ? 'boss' : enemy.behavior }))].map((contact) => [contact.id, contact])).values()];
    return true;
  }

  reload(player) {
    if (player?.inVehicle && this.vehicle?.driver === player && this.vehicle.canFire && this.vehicle.turretAmmo < this.vehicle.maxTurretAmmo && this.vehicle.turretReserve > 0) {
      const loaded = Math.min(this.vehicle.maxTurretAmmo - this.vehicle.turretAmmo, this.vehicle.turretReserve);
      this.vehicle.turretAmmo += loaded;
      this.vehicle.turretReserve -= loaded;
      this.onEvent({ type: 'vehicle-reload', amount: loaded, reserve: this.vehicle.turretReserve });
      this.pushCaption('vehicle', `Tourelle rechargée: ${loaded} coups.`);
      return true;
    }
    return super.reload(player);
  }

  fire(player) {
    const bulletStart = this.bullets?.length || 0;
    const fired = super.fire(player);
    if (!fired) return false;
    const ballistics = player?.inVehicle ? { ...this.weaponBallistics, family: 'sentry', ...FAMILY_RULES.sentry, penetrationBudget: 90, penetration: 55 } : this.weaponBallistics;
    for (const bullet of this.bullets.slice(bulletStart)) {
      Object.assign(bullet, {
        family: ballistics.family,
        penetration: ballistics.penetration,
        remainingPenetration: ballistics.penetrationBudget,
        armorBypass: ballistics.armorBypass,
        maxHits: ballistics.maxHits,
        status: ballistics.status,
        splash: ballistics.splash,
        hitCount: 0,
        hitEnemyIds: new Set()
      });
      this.applyAimAssist(bullet, player);
    }
    this.penetrationTelemetry.shots += 1;
    this.penetrationTelemetry.familyEffects[ballistics.family] = (this.penetrationTelemetry.familyEffects[ballistics.family] || 0) + 1;
    if (this.stealthRuntime) this.stealthRuntime.noiseBurstUntil = this.animationTime + 0.85 * ballistics.noise;
    this.pushCaption('weapon', `${this.weaponRuntime.name}: tir ${ballistics.family}.`);
    return true;
  }

  applyAimAssist(bullet, player) {
    const strength = this.accessibilityRuntime?.aimAssistStrength || 0;
    if (!strength || !bullet || !player || bullet.aimExplicitV83) return false;
    const speed = Math.hypot(bullet.vx, bullet.vy || 0);
    if (!speed) return false;
    const angle = Math.atan2(bullet.vy || 0, bullet.vx);
    const origin = { x: bullet.x, y: bullet.y, w: 0, h: 0 };
    const world = { walls: this.walls, doors: this.doors, platforms: this.platforms };
    const targets = (this.enemies || []).filter((enemy) => enemy.alive).map((enemy) => {
      const dx = enemy.x + enemy.w / 2 - origin.x, dy = enemy.y + enemy.h / 2 - origin.y;
      const offset = Math.atan2(Math.sin(Math.atan2(dy, dx) - angle), Math.cos(Math.atan2(dy, dx) - angle));
      return { enemy, dx, dy, offset, distance: Math.hypot(dx, dy) };
    }).filter((entry) => entry.distance > 0 && entry.distance <= 950 && Math.abs(entry.offset) <= Math.PI / 15)
      .filter((entry) => !firstProjectileObstacleV83(origin, { x: entry.dx, y: entry.dy }, world))
      .sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset) || a.distance - b.distance);
    const target = targets[0];
    if (!target) return false;
    const corrected = angle + target.offset * clamp(strength, 0, 1);
    bullet.vx = Math.cos(corrected) * speed;
    bullet.vy = Math.sin(corrected) * speed;
    bullet.angleRadians = corrected;
    bullet.aimAssistTargetId = target.enemy.id;
    return true;
  }

  updateBullets(delta) {
    const frameDelta = Number.isFinite(delta) ? Math.max(0, delta) : 0;
    const bounds = this.missionLevelBounds || { width: WORLD_WIDTH, height: 1080 };
    for (const bullet of this.bullets) {
      if (bullet.hit || !(bullet.life > 0)) continue;
      // Do not travel (or damage a target) beyond this projectile's remaining lifetime.
      const travelDelta = Math.min(frameDelta, bullet.life);
      const displacement = { x: (Number(bullet.vx) || 0) * travelDelta, y: (Number(bullet.vy) || 0) * travelDelta };
      const destination = { x: bullet.x + displacement.x, y: bullet.y + displacement.y };
      bullet.life -= frameDelta;
      if (!(bullet.hitEnemyIds instanceof Set)) bullet.hitEnemyIds = new Set();
      if (!Number.isFinite(bullet.remainingPenetration)) bullet.remainingPenetration = 0;
      if (!Number.isFinite(bullet.maxHits)) bullet.maxHits = 1;
      const collisions = collectProjectileCollisionsV83(bullet, displacement, {
        walls: this.walls, doors: this.doors, platforms: this.platforms, enemies: this.enemies, bounds
      });
      for (const collision of collisions) {
        if (bullet.hit) break;
        if (collision.kind !== 'enemy') {
          bullet.x = collision.x;
          bullet.y = collision.y;
          bullet.hit = true;
          break;
        }
        const enemy = collision.target;
        const enemyKey = enemy.id ?? enemy;
        if (!enemy.alive || bullet.hitEnemyIds.has(enemyKey)) continue;
        bullet.x = collision.x;
        bullet.y = collision.y;
        const armorBypass = clamp(Number(bullet.armorBypass) || 0, 0, 1);
        const compensatedDamage = bullet.damage + enemy.armor * 0.35 * armorBypass;
        this.applyEnemyDamage(enemy, compensatedDamage, bullet);
        this.applyProjectileStatus(enemy, bullet);
        bullet.hitEnemyIds.add(enemyKey);
        bullet.hitCount = (bullet.hitCount || 0) + 1;
        this.penetrationTelemetry.hits += 1;
        if (bullet.splash > 0) {
          const splashHitIds = new Set([enemyKey]);
          for (const secondary of this.enemies) {
            const secondaryKey = secondary.id ?? secondary;
            if (!secondary.alive || splashHitIds.has(secondaryKey) || distance(enemy, secondary) > bullet.splash) continue;
            splashHitIds.add(secondaryKey);
            this.applyEnemyDamage(secondary, bullet.damage * 0.48, { ...bullet, kind: 'explosive-splash' });
          }
          bullet.hit = true;
          continue;
        }
        const armorCost = 20 + enemy.armor * (0.7 - armorBypass * 0.5);
        bullet.remainingPenetration -= armorCost;
        if (bullet.remainingPenetration > 0 && bullet.hitCount < bullet.maxHits) this.penetrationTelemetry.passThroughs += 1;
        else bullet.hit = true;
      }
      if (!bullet.hit) Object.assign(bullet, destination);
    }
    this.bullets = this.bullets.filter((bullet) => !bullet.hit && bullet.life > 0
      && Number.isFinite(bullet.x) && Number.isFinite(bullet.y)
      && bullet.x >= 0 && bullet.x + bullet.w <= bounds.width && bullet.y >= 0 && bullet.y + bullet.h <= bounds.height);
  }

  applyProjectileStatus(enemy, bullet) {
    const status = bullet.status;
    if (!status) return;
    enemy.statusEffect = status;
    enemy.statusClock = status === 'burn' || status === 'corroded' || status === 'contaminated' ? 5 : 2.5;
    if (status === 'stun' || status === 'frozen' || status === 'disoriented') {
      enemy.staggerClock = Math.max(enemy.staggerClock, status === 'frozen' ? 1.8 : 1.1);
      enemy.speed *= status === 'frozen' ? 0.72 : 0.86;
    }
    if (status === 'tracked') enemy.revealed = Math.max(enemy.revealed, 8);
    if (bullet.family === 'electric' && enemy.biology === 'synthetic') enemy.health -= bullet.damage * 0.35;
  }

  damagePlayer(player, amount, options = {}) {
    const before = player?.health || 0;
    const result = super.damagePlayer(player, amount, options);
    if (player && player.health < before) {
      this.cameraShake = Math.max(this.cameraShake, this.accessibilityRuntime.screenShake * clamp(amount / 24, 0.2, 1));
      this.pushCaption('danger', `Impact: ${String(options.source || 'menace')}.`);
    }
    return result;
  }

  applyHazards(player) {
    const previous = this.environmentStatus?.lastHazard;
    super.applyHazards(player);
    if (this.environmentStatus?.lastHazard && this.environmentStatus.lastHazard !== previous) this.pushCaption('environment', `Danger: ${this.environmentStatus.lastHazard}.`);
  }

  pushCaption(channel, text) {
    if (!this.accessibilityRuntime?.subtitles || !text) return false;
    this.captionDirectorV84 ||= new CombatCaptionDirectorV84();
    const caption = this.captionDirectorV84.offer(channel, text, this.mission?.elapsed || 0);
    if (!caption) return false;
    this.captions.push(caption);
    if (this.captions.length > 12) this.captions.shift();
    this.onEvent({ type: 'caption', ...caption });
    return true;
  }

  drawWorld(ctx) {
    ctx.save();
    if (this.cameraShake > 0 && !this.accessibilityRuntime.reducedMotion) {
      const amplitude = this.cameraShake * 7;
      ctx.translate(Math.sin(this.animationTime * 71) * amplitude, Math.cos(this.animationTime * 53) * amplitude * 0.55);
    }
    super.drawWorld(ctx);
    const relay = this.neuroCounterplay?.relay;
    if (relay?.active) {
      ctx.fillStyle = '#8d3d70';
      ctx.fillRect(relay.x, relay.y, relay.w, relay.h);
      ctx.strokeStyle = '#e09dcc';
      ctx.strokeRect(relay.x + 0.5, relay.y + 0.5, relay.w - 1, relay.h - 1);
      ctx.fillStyle = '#f1b4df';
      ctx.fillRect(relay.x + 12, relay.y + 12, relay.w - 24, 8);
    }
    ctx.restore();
  }

  getProductionSnapshot() {
    return {
      accessibility: this.accessibilityRuntime ? { ...this.accessibilityRuntime, captionCount: this.captions?.length || 0 } : null,
      encounterRuntime: this.encounterSelection ? { selectedIds: [...this.encounterSelection.selectedIds], eligibleCount: this.encounterSelection.eligibleCount, totalCount: this.encounterSelection.totalCount, fallbackUsed: this.encounterSelection.fallbackUsed } : null,
      ballistics: this.weaponBallistics ? { ...this.weaponBallistics, telemetry: { ...this.penetrationTelemetry, familyEffects: { ...this.penetrationTelemetry.familyEffects } } } : null,
      neuroCounterplay: this.neuroCounterplay ? {
        active: this.neuroCounterplay.active,
        state: this.neuroCounterplay.state,
        pulses: this.neuroCounterplay.pulses,
        pulseCooldown: this.neuroCounterplay.pulseCooldown,
        drainApplied: Math.round((this.neuroCounterplay.drainApplied || 0) * 10) / 10,
        adversaryId: this.neuroCounterplay.adversaryId,
        neutralized: Boolean(this.neuroCounterplay.neutralized),
        relay: this.neuroCounterplay.relay ? { id: this.neuroCounterplay.relay.id, active: this.neuroCounterplay.relay.active, x: Math.round(this.neuroCounterplay.relay.x), y: Math.round(this.neuroCounterplay.relay.y) } : null
      } : null,
      captions: this.captions ? this.captions.map((caption) => ({ ...caption })) : []
    };
  }

  getSnapshot() {
    return { ...super.getSnapshot(), ...this.getProductionSnapshot() };
  }
}
