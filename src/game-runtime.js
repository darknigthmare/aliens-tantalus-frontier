import { GameEngine as MissionEngine } from './game-v51-runtime.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot((a.x + a.w / 2) - (b.x + b.w / 2), (a.y + a.h / 2) - (b.y + b.h / 2));

const DIFFICULTIES = Object.freeze({
  story: Object.freeze({ id: 'story', enemyHealth: 0.72, enemyDamage: 0.65, enemySpeed: 0.9, spawnMultiplier: 0.75, rewardMultiplier: 0.85 }),
  standard: Object.freeze({ id: 'standard', enemyHealth: 1, enemyDamage: 1, enemySpeed: 1, spawnMultiplier: 1, rewardMultiplier: 1 }),
  nightmare: Object.freeze({ id: 'nightmare', enemyHealth: 1.35, enemyDamage: 1.45, enemySpeed: 1.16, spawnMultiplier: 1.5, rewardMultiplier: 1.35 })
});

const finite = (value, fallback, min = -Infinity, max = Infinity) => clamp(Number.isFinite(Number(value)) ? Number(value) : fallback, min, max);
const list = (value) => Array.isArray(value) ? [...value] : [];

export function buildWeaponRuntime(weapon = {}) {
  return Object.freeze({
    id: String(weapon.id || 'weapon-runtime-default'),
    name: String(weapon.name || 'M41A Pulse Rifle'),
    family: String(weapon.family || 'ballistic'),
    source: String(weapon.source || 'Frontier'),
    mark: String(weapon.mark || 'Standard'),
    damage: finite(weapon.damage, 26, 1, 500),
    fireRate: finite(weapon.fireRate, 7.7, 0.2, 30),
    magazine: Math.round(finite(weapon.magazine, 30, 1, 200)),
    reload: finite(weapon.reload, 1.45, 0.15, 10),
    penetration: finite(weapon.penetration, 20, 0, 100),
    rarity: String(weapon.rarity || 'standard'),
    provenance: String(weapon.provenance || 'runtime-default'),
    tags: list(weapon.tags)
  });
}

export function buildEnemyRuntime(enemy = {}, difficulty = 'standard') {
  const tuning = DIFFICULTIES[difficulty] || DIFFICULTIES.standard;
  const behavior = String(enemy.behavior || 'stalk');
  const behaviorMap = { stalk: 'stalker', rush: 'hunter', flank: 'hunter', ambush: 'pouncer', guard: 'bruiser', control: 'shooter', siege: 'bruiser', swarm: 'pouncer' };
  const caste = String(enemy.caste || 'stalker');
  const acid = finite(enemy.acid, 0, 0, 100);
  return Object.freeze({
    id: String(enemy.id || 'enemy-runtime-default'),
    name: String(enemy.name || 'Xenomorph Warrior'),
    biology: String(enemy.biology || 'xenomorph'),
    caste,
    modifier: String(enemy.modifier || 'Standard'),
    health: Math.round(finite(enemy.health, 80, 1, 5000) * tuning.enemyHealth),
    damage: finite(enemy.damage, 12, 1, 200) * tuning.enemyDamage,
    speed: finite(enemy.speed, 1.2, 0.1, 10) * tuning.enemySpeed,
    armor: finite(enemy.armor, 0, 0, 100),
    acid,
    frequency: String(enemy.frequency || 'common'),
    encounterWorldIds: list(enemy.encounterWorldIds),
    habitats: list(enemy.habitats),
    sourceBehavior: behavior,
    runtimeBehavior: caste === 'royal' ? 'boss' : acid > 60 || /spitter|ranged/i.test(caste) ? 'spitter' : behaviorMap[behavior] || 'stalker',
    provenance: String(enemy.provenance || 'runtime-default')
  });
}

export function buildVehicleRuntime(vehicle = {}) {
  const seats = list(vehicle.seats).map((seat, index) => Object.freeze({
    id: String(seat.id || `seat-${index + 1}`),
    role: String(seat.role || (index ? 'passenger' : 'driver')),
    actions: list(seat.actions)
  }));
  const actions = [...new Set([...list(vehicle.actions), ...seats.flatMap((seat) => seat.actions)])];
  return Object.freeze({
    id: String(vehicle.id || 'vehicle-runtime-m577'),
    name: String(vehicle.name || 'M577 Armored Personnel Carrier'),
    family: String(vehicle.family || 'ground'),
    fit: String(vehicle.fit || 'Standard'),
    seats,
    actions,
    hull: Math.round(finite(vehicle.hull, 340, 20, 2000)),
    speed: finite(vehicle.speed, 105, 1, 500),
    runtimeSpeed: clamp(150 + finite(vehicle.speed, 105, 1, 500) * 1.85, 170, 620),
    cargo: Math.round(finite(vehicle.cargo, 20, 0, 500)),
    armor: finite(vehicle.armor, 35, 0, 100),
    provenance: String(vehicle.provenance || 'runtime-default'),
    canDrive: actions.includes('drive'),
    canBoost: actions.includes('boost'),
    canFire: actions.includes('fire') || seats.some((seat) => seat.role === 'gunner')
  });
}

export function buildEquipmentRuntime(equipment = []) {
  return Object.freeze(list(equipment).map((item) => Object.freeze({
    id: String(item.id || 'equipment-runtime'),
    name: String(item.name || 'Field Equipment'),
    grade: String(item.grade || 'Field'),
    rarity: String(item.rarity || 'standard'),
    utility: String(item.utility || 'survival'),
    charges: Math.round(finite(item.charges, 1, 0, 99)),
    mass: finite(item.mass, 1, 0, 100),
    description: String(item.description || ''),
    provenance: String(item.provenance || 'runtime-default')
  })));
}

export function buildCrewRuntime(crew = []) {
  return Object.freeze(list(crew).map((member) => Object.freeze({
    id: String(member.id || 'crew-runtime'),
    name: String(member.name || 'Echo-9 Marine'),
    role: String(member.role || 'Marine'),
    species: String(member.species || 'human'),
    specialty: String(member.specialty || 'assault'),
    health: finite(member.health, 100, 1, 300),
    stress: finite(member.stress, 0, 0, 100),
    fatigue: finite(member.fatigue, 0, 0, 100),
    loyalty: finite(member.loyalty, 50, 0, 100),
    status: String(member.status || 'active'),
    injuries: list(member.injuries),
    missions: Math.round(finite(member.missions, 0, 0)),
    kills: Math.round(finite(member.kills, 0, 0))
  })));
}

export function buildNeuroRuntime(profile = null) {
  if (!profile) return Object.freeze({ active: false, compatible: false });
  const compatible = Boolean(profile.playerClassCompatible);
  const controlDifficulty = finite(profile.controlDifficulty, 50, 0, 100);
  const signalRange = finite(profile.signalRange, 80, 5, 500);
  return Object.freeze({
    active: compatible,
    compatible,
    id: String(profile.id || 'neuro-runtime'),
    enemyId: String(profile.enemyId || ''),
    harness: String(profile.harness || 'ATARAX'),
    controlDifficulty,
    signalRange,
    worldRange: signalRange * 12,
    failureMode: String(profile.failureMode || 'signal-loss'),
    signalDrain: 0.22 + controlDifficulty / 42,
    meleeDamage: 30 + Math.round((100 - controlDifficulty) * 0.16)
  });
}

export function buildMissionPlan({ campaign = {}, world = {}, levelSeed = {}, difficulty = 'standard', equipment = [], crew = [], vehicle = null, apexDossier = null, neuroProfile = null } = {}) {
  const tuning = DIFFICULTIES[difficulty] || DIFFICULTIES.standard;
  const danger = finite(world.danger, 5, 0, 20);
  const infestation = finite(world.infestation, 50, 0, 100);
  const routes = Math.round(finite(levelSeed.routes ?? campaign.routes, 3, 1, 12));
  return Object.freeze({
    campaign: Object.freeze({
      id: String(campaign.id || 'campaign-runtime'), pairId: campaign.pairId ?? null, mode: String(campaign.mode || 'FRONTIER'),
      name: String(campaign.name || 'Tantalus Operation'), source: String(campaign.source || 'Tantalus Frontier'), worldId: String(campaign.worldId || world.id || ''),
      objective: String(campaign.objective || levelSeed.objective || 'secure the frontier'), year: campaign.year ?? null,
      canon: String(campaign.canon || 'project-continuity'), routes: Math.round(finite(campaign.routes, routes, 1, 12)), summary: String(campaign.summary || '')
    }),
    world: Object.freeze({
      id: String(world.id || 'world-runtime'), name: String(world.name || 'Frontier'), sector: String(world.sector || ''), description: String(world.description || ''),
      provenance: String(world.provenance || 'runtime-default'), danger, biomes: list(world.biomes), atmosphere: String(world.atmosphere || 'breathable'),
      infestation, stability: finite(world.stability, 50, 0, 100), faction: String(world.faction || ''), kit: String(world.kit || levelSeed.kit || '')
    }),
    level: Object.freeze({
      id: String(levelSeed.id || 'level-runtime'), name: String(levelSeed.name || 'Runtime Mission'), worldId: String(levelSeed.worldId || campaign.worldId || world.id || ''),
      kit: String(levelSeed.kit || world.kit || 'kit-01'), width: Math.round(finite(levelSeed.width, 6, 1, 64)), height: Math.round(finite(levelSeed.height, 4, 1, 36)),
      seed: Math.round(finite(levelSeed.seed, 426, 0)), objective: String(levelSeed.objective || campaign.objective || 'secure the frontier'), hazards: list(levelSeed.hazards), routes
    }),
    difficulty: tuning,
    equipment: buildEquipmentRuntime(equipment),
    crew: buildCrewRuntime(crew),
    vehicle: buildVehicleRuntime(vehicle || {}),
    apex: apexDossier ? Object.freeze({
      id: String(apexDossier.id || 'apex-runtime'), enemyId: String(apexDossier.enemyId || ''), name: String(apexDossier.name || 'Apex Target'),
      origin: String(apexDossier.origin || ''), spawnChance: finite(apexDossier.spawnChance, 1, 0, 100), restrictions: list(apexDossier.restrictions), reward: Math.round(finite(apexDossier.reward, 140, 0))
    }) : null,
    neuro: buildNeuroRuntime(neuroProfile),
    threatBudget: Math.round((8 + danger * 1.4 + infestation * 0.12) * tuning.spawnMultiplier),
    rewardMultiplier: tuning.rewardMultiplier * (campaign.mode === 'MIRE' ? 1.08 : campaign.mode === 'CRUCIBLE' ? 1.18 : 1),
    routeBudget: routes
  });
}

export class GameEngine extends MissionEngine {
  start(options = {}) {
    const difficulty = DIFFICULTIES[options.difficulty] ? options.difficulty : 'standard';
    this.difficultyRuntime = DIFFICULTIES[difficulty];
    this.weaponRuntime = buildWeaponRuntime(options.weapon);
    this.selectedVehicleRuntime = buildVehicleRuntime(options.vehicle || {});
    this.neuroRuntime = buildNeuroRuntime(options.neuroProfile);
    this.missionPlan = buildMissionPlan({ ...options, difficulty });
    this.sourceEnemyRuntimes = new Map((options.enemyCatalog || []).map((enemy) => [enemy.id, buildEnemyRuntime(enemy, difficulty)]));
    const runtimeSeed = options.levelSeed?.seed ?? options.seed ?? 426;
    super.start({ ...options, seed: runtimeSeed, weapon: this.weaponRuntime });
    this.applyCatalogRuntime(options);
    return this.getSnapshot();
  }

  createEnemy(source = {}, index = 0, x, groundY, flags) {
    const runtime = buildEnemyRuntime(source, this.difficultyRuntime?.id || 'standard');
    const enemy = super.createEnemy({ ...source, health: runtime.health, damage: runtime.damage, speed: runtime.speed, armor: runtime.armor }, index, x, groundY, flags);
    enemy.behavior = runtime.runtimeBehavior;
    enemy.sourceBehavior = runtime.sourceBehavior;
    enemy.caste = runtime.caste;
    enemy.acid = runtime.acid;
    enemy.frequency = runtime.frequency;
    enemy.habitats = runtime.habitats;
    enemy.encounterWorldIds = runtime.encounterWorldIds;
    enemy.modifier = runtime.modifier;
    enemy.provenance = runtime.provenance;
    return enemy;
  }

  createVehicle(x, y) {
    const vehicle = super.createVehicle(x, y);
    const runtime = this.selectedVehicleRuntime || buildVehicleRuntime();
    vehicle.id = runtime.id;
    vehicle.name = runtime.name;
    vehicle.family = runtime.family;
    vehicle.hull = runtime.hull;
    vehicle.maxHull = runtime.hull;
    vehicle.runtimeSpeed = runtime.runtimeSpeed;
    vehicle.fuel = clamp(55 + runtime.cargo, 55, 100);
    vehicle.turretAmmo = runtime.canFire ? 50 + runtime.cargo : 0;
    vehicle.seatCount = Math.max(1, runtime.seats.length);
    vehicle.actions = runtime.actions;
    vehicle.canDrive = runtime.canDrive || runtime.actions.length === 0;
    vehicle.canBoost = runtime.canBoost;
    vehicle.canFire = runtime.canFire || runtime.actions.length === 0;
    vehicle.armor = runtime.armor;
    return vehicle;
  }

  applyCatalogRuntime(options) {
    const plan = this.missionPlan;
    this.difficulty = this.difficultyRuntime.id;
    this.levelSeedRuntime = plan.level;
    this.environmentRuntime = {
      danger: plan.world.danger,
      infestation: plan.world.infestation,
      atmosphere: plan.world.atmosphere,
      biomes: plan.world.biomes,
      hazardTypes: plan.level.hazards.length ? plan.level.hazards : [plan.world.atmosphere === 'corrosive' ? 'acid' : 'industrial']
    };
    for (const [index, hazard] of this.hazards.entries()) {
      hazard.kind = this.environmentRuntime.hazardTypes[index % this.environmentRuntime.hazardTypes.length];
      hazard.damage = Math.round(hazard.damage * (0.75 + plan.world.danger * 0.055) * this.difficultyRuntime.enemyDamage);
    }
    const targetCount = this.editorMode ? this.enemies.length : Math.max(4, Math.round(16 * this.difficultyRuntime.spawnMultiplier));
    if (!this.editorMode && targetCount < this.enemies.length) this.enemies = this.enemies.slice(0, targetCount - 1).concat(this.enemies.slice(-1));
    if (!this.editorMode && targetCount > this.enemies.length) {
      const sources = options.enemyCatalog?.length ? options.enemyCatalog : [{ name: 'Xenomorph Warrior', biology: 'xenomorph', health: 80, damage: 12, speed: 1.2 }];
      while (this.enemies.length < targetCount) {
        const index = this.enemies.length;
        const source = sources[index % sources.length];
        this.enemies.push(this.createEnemy(source, index, 700 + (index * 241) % 4700, 930, { boss: false, keyCarrier: false }));
      }
    }
    const equipment = plan.equipment;
    const medCharges = equipment.filter((item) => item.utility === 'medical' || /medkit|trauma/i.test(item.name)).reduce((sum, item) => sum + item.charges, 0);
    const armorBonus = equipment.filter((item) => item.utility === 'defense' || /armor|suit/i.test(item.name)).reduce((sum, item) => sum + 4 + item.charges * 2, 0);
    const ammoBonus = equipment.filter((item) => /ammo|sentry/i.test(item.name)).reduce((sum, item) => sum + item.charges * 8, 0);
    this.inventory.medkits += medCharges;
    this.player.armor = clamp(this.player.armor + armorBonus, 0, this.player.maxArmor);
    this.player.ammoReserve += ammoBonus;
    if (equipment.some((item) => /cutting torch|maintenance jack/i.test(item.name))) { this.inventory.cutter = true; this.toolPickup.taken = true; }
    if (equipment.some((item) => /motion tracker|scanner/i.test(item.name))) this.tracker.energy = 100;
    const activeCrew = plan.crew.filter((member) => member.status === 'active');
    this.crewRuntime = activeCrew;
    const medic = activeCrew.some((member) => member.specialty === 'medical');
    const engineer = activeCrew.some((member) => member.specialty === 'engineering');
    const vehicleChief = activeCrew.some((member) => member.specialty === 'vehicle');
    if (medic) this.inventory.medkits += 1;
    if (engineer && this.vehicle?.active) this.vehicle.hull = Math.min(this.vehicle.maxHull, this.vehicle.hull + 30);
    if (vehicleChief && this.vehicle?.active) this.vehicle.fuel = 100;
    if (activeCrew[0]) this.player.operatorId = activeCrew[0].id;
    if (activeCrew[1]) this.coop.operatorId = activeCrew[1].id;
    if (plan.apex) {
      const boss = this.enemies.find((enemy) => enemy.isBoss);
      if (boss) {
        boss.apexDossierId = plan.apex.id;
        boss.name = plan.apex.name;
        boss.maxHealth = Math.round(boss.maxHealth * 1.22);
        boss.health = boss.maxHealth;
        boss.reward += Math.round(plan.apex.reward / 20);
        boss.apexRestrictions = plan.apex.restrictions;
      }
    }
    this.neuro = {
      ...this.neuroRuntime,
      signal: this.neuroRuntime.active ? 100 : 0,
      maxSignal: 100,
      state: this.neuroRuntime.active ? 'linked' : 'inactive',
      relayX: this.checkpoint.x,
      failureTriggered: false
    };
    if (this.neuro.active) {
      const baseline = this.player.y + this.player.h;
      this.player.playerClass = 'neuro-xeno';
      this.player.weaponMode = 'neuro-melee';
      this.player.w = 52;
      this.player.h = 74;
      this.player.y = baseline - this.player.h;
      this.player.armor = Math.max(this.player.armor, 24);
      this.onEvent({ type: 'neuro-link', profileId: this.neuro.id, harness: this.neuro.harness, signal: this.neuro.signal });
    } else this.player.playerClass = 'marine';
    this.mission.contract = {
      campaignId: plan.campaign.id,
      objective: plan.campaign.objective,
      mode: plan.campaign.mode,
      canon: plan.campaign.canon,
      source: plan.campaign.source,
      levelSeedId: plan.level.id,
      routeBudget: plan.routeBudget,
      danger: plan.world.danger,
      infestation: plan.world.infestation
    };
  }

  update(delta) {
    super.update(delta);
    if (this.mission?.state === 'active') this.updateNeuroControl(delta);
  }

  updateNeuroControl(delta) {
    if (!this.neuro?.active || this.neuro.state !== 'linked' || !this.player.alive) return;
    const relayDistance = Math.abs(this.player.x - this.neuro.relayX);
    const outOfRange = Math.max(0, relayDistance - this.neuro.worldRange);
    const rangePenalty = outOfRange > 0 ? 1 + outOfRange / Math.max(200, this.neuro.worldRange) : 0;
    const combatPenalty = this.enemies.some((enemy) => enemy.alive && Math.abs(enemy.x - this.player.x) < 320) ? 0.65 : 0;
    this.neuro.signal = Math.max(0, this.neuro.signal - delta * (this.neuro.signalDrain + rangePenalty * 2.4 + combatPenalty));
    if (this.neuro.signal === 0) this.triggerNeuroFailure();
  }

  triggerNeuroFailure() {
    if (!this.neuro?.active || this.neuro.failureTriggered) return false;
    this.neuro.failureTriggered = true;
    this.neuro.state = 'failed';
    const mode = this.neuro.failureMode;
    if (mode === 'frenzy') {
      for (const enemy of this.enemies.filter((candidate) => candidate.alive).sort((a, b) => distance(this.player, a) - distance(this.player, b)).slice(0, 3)) this.applyEnemyDamage(enemy, this.neuro.meleeDamage * 1.5, { owner: this.player, kind: 'neuro-frenzy' });
    } else if (mode === 'feedback') {
      this.player.armor = 0;
      this.player.health = Math.min(this.player.health, 10);
    } else if (mode === 'hive-takeover') {
      for (const enemy of this.enemies) { enemy.alert = true; enemy.speed *= 1.2; }
    } else if (mode === 'acid-rupture') {
      this.hazards.push({ id: 'neuro-rupture', x: this.player.x - 50, y: this.player.y + this.player.h - 18, w: 150, h: 18, damage: 28, active: true, kind: 'acid' });
    }
    this.onEvent({ type: 'neuro-failure', profileId: this.neuro.id, failureMode: mode, signal: 0 });
    this.failMission(`neuro-${mode}`);
    return true;
  }

  meleeAttack(player) {
    if (!this.neuro?.active || player !== this.player || !player.alive || player.fireClock > 0 || this.neuro.signal < 4 || this.mission.state !== 'active') return false;
    player.fireClock = 0.48;
    player.actionClock = 0.34;
    this.neuro.signal = Math.max(0, this.neuro.signal - 4);
    const range = 94 + Math.min(50, this.neuro.signalRange * 0.2);
    const targets = this.enemies.filter((enemy) => enemy.alive && Math.abs((enemy.x + enemy.w / 2) - (player.x + player.w / 2)) <= range && Math.abs(enemy.y - player.y) < 110 && Math.sign(enemy.x - player.x) === player.facing);
    for (const enemy of targets.slice(0, 2)) this.applyEnemyDamage(enemy, this.neuro.meleeDamage, { owner: player, kind: 'neuro-melee' });
    this.onEvent({ type: 'neuro-attack', hits: Math.min(2, targets.length), signal: this.neuro.signal });
    return true;
  }

  fire(player) {
    if (this.neuro?.active && player === this.player) return this.meleeAttack(player);
    return super.fire(player);
  }

  weaponProfile(player) {
    const profile = super.weaponProfile(player);
    if (profile.mode === 'apc-turret' && !this.vehicle.canFire) return { ...profile, ammo: 0, damage: 0 };
    if (profile.mode !== 'rifle') return profile;
    return { ...profile, damage: this.weaponRuntime.damage, interval: 1 / this.weaponRuntime.fireRate, penetration: this.weaponRuntime.penetration };
  }

  reload(player) {
    const started = super.reload(player);
    if (started && player.weaponMode === 'rifle') player.reloadClock = this.weaponRuntime.reload;
    return started;
  }

  interact(actor = this.player) {
    const rifleWasTaken = this.weaponPickup?.taken;
    const result = super.interact(actor);
    if (!rifleWasTaken && this.weaponPickup?.taken && actor) {
      actor.magazineSize = this.weaponRuntime.magazine;
      actor.ammo = Math.min(actor.magazineSize, this.weaponRuntime.magazine);
    }
    return result;
  }

  updateVehicleDriver(player, delta, controls) {
    const before = this.vehicle?.x || 0;
    super.updateVehicleDriver(player, delta, controls);
    if (!this.vehicle?.active || this.vehicle.driver !== player || !this.vehicle.canDrive) return;
    const travelled = this.vehicle.x - before;
    if (!travelled) return;
    const targetTravel = Math.sign(travelled) * this.vehicle.runtimeSpeed * delta;
    const correction = targetTravel - travelled;
    const previousX = this.vehicle.x;
    this.vehicle.x = clamp(this.vehicle.x + correction, 0, 6200 - this.vehicle.w);
    this.resolveVehicleHorizontal(previousX);
    for (const rider of [this.player, this.coop]) if (rider?.inVehicle) rider.x += this.vehicle.x - previousX;
  }

  damagePlayer(player, amount, options = {}) {
    const environmental = ['acid', 'fall', 'vehicle-destroyed'].includes(options.source);
    const multiplier = environmental ? 0.85 + this.missionPlan.world.danger * 0.04 : 1;
    return super.damagePlayer(player, amount * multiplier, options);
  }

  restartFromCheckpoint() {
    const restarted = super.restartFromCheckpoint();
    if (restarted && this.neuro?.active) {
      this.neuro.signal = 45;
      this.neuro.state = 'linked';
      this.neuro.failureTriggered = false;
      this.neuro.relayX = this.checkpoint.x;
      this.onEvent({ type: 'neuro-relinked', profileId: this.neuro.id, signal: this.neuro.signal });
    }
    return restarted;
  }

  completeMission(actor) {
    const completed = super.completeMission(actor);
    if (!completed) return false;
    const rewards = this.mission.rewards;
    rewards.credits = Math.round(rewards.credits * this.missionPlan.rewardMultiplier);
    rewards.apex = this.missionPlan.apex?.reward || 0;
    rewards.cargo = this.vehicle?.active && !this.vehicle.destroyed ? this.selectedVehicleRuntime.cargo : 0;
    rewards.canon = this.missionPlan.campaign.canon;
    rewards.source = this.missionPlan.campaign.source;
    return true;
  }

  drawActor(ctx, actor) {
    if (!this.neuro?.active || actor !== this.player) return super.drawActor(ctx, actor);
    const image = this.images.get(actor.actionClock > 0 ? 'xenoCombat' : 'xenoLocomotion');
    const moving = Math.abs(actor.vx) > 12;
    const row = actor.actionClock > 0 ? 1 : actor.climbing || actor.crouching ? 3 : !actor.grounded ? 2 : moving ? 1 : 0;
    const frame = Math.floor(this.animationTime * (moving ? 10 : 5)) % 4;
    const width = 142;
    const height = 106;
    const x = actor.x + actor.w / 2 - width / 2;
    const y = actor.y + actor.h - height * (240 / 256);
    this.drawSheetCell(ctx, image, frame, row, x, y, width, height, actor.facing < 0);
  }

  drawHud(ctx) {
    super.drawHud(ctx);
    if (!this.neuro?.active) return;
    ctx.fillStyle = 'rgba(12, 5, 10, .86)';
    ctx.fillRect(822, 84, 232, 52);
    ctx.strokeStyle = this.neuro.signal > 25 ? '#ba7eca' : '#db625c';
    ctx.strokeRect(822.5, 84.5, 232, 52);
    ctx.fillStyle = '#d9b3df';
    ctx.font = '12px monospace';
    ctx.fillText(`${this.neuro.harness} · SIGNAL ${Math.ceil(this.neuro.signal)}%`, 836, 106);
    ctx.fillStyle = '#4b263f';
    ctx.fillRect(836, 118, 202, 5);
    ctx.fillStyle = this.neuro.signal > 25 ? '#b873c7' : '#d55a56';
    ctx.fillRect(836, 118, 202 * this.neuro.signal / 100, 5);
  }

  getGameplayReport() {
    const report = super.getGameplayReport();
    return {
      ...report,
      catalogRuntime: {
        campaignId: this.missionPlan?.campaign.id,
        weaponId: this.weaponRuntime?.id,
        vehicleId: this.selectedVehicleRuntime?.id,
        enemyProfiles: this.sourceEnemyRuntimes?.size || 0,
        equipment: this.missionPlan?.equipment.length || 0,
        crew: this.crewRuntime?.length || 0,
        apex: this.missionPlan?.apex?.id || null,
        levelSeedId: this.missionPlan?.level.id,
        difficulty: this.difficulty
      },
      neuro: this.neuro ? { active: this.neuro.active, profileId: this.neuro.id, failureMode: this.neuro.failureMode } : { active: false }
    };
  }

  getSnapshot() {
    const snapshot = super.getSnapshot();
    return {
      ...snapshot,
      difficulty: this.difficulty,
      missionContract: this.mission?.contract ? { ...this.mission.contract } : null,
      environment: this.environmentRuntime ? { ...this.environmentRuntime, biomes: [...this.environmentRuntime.biomes], hazardTypes: [...this.environmentRuntime.hazardTypes] } : null,
      weaponRuntime: this.weaponRuntime ? { id: this.weaponRuntime.id, damage: this.weaponRuntime.damage, fireRate: this.weaponRuntime.fireRate, magazine: this.weaponRuntime.magazine, reload: this.weaponRuntime.reload, penetration: this.weaponRuntime.penetration } : null,
      selectedVehicle: this.selectedVehicleRuntime ? { id: this.selectedVehicleRuntime.id, family: this.selectedVehicleRuntime.family, seats: this.selectedVehicleRuntime.seats.length, actions: [...this.selectedVehicleRuntime.actions], cargo: this.selectedVehicleRuntime.cargo } : null,
      neuro: this.neuro ? { active: this.neuro.active, compatible: this.neuro.compatible, profileId: this.neuro.id, harness: this.neuro.harness, signal: Math.round(this.neuro.signal), range: this.neuro.signalRange, controlDifficulty: this.neuro.controlDifficulty, failureMode: this.neuro.failureMode, state: this.neuro.state } : { active: false },
      catalogRuntime: this.missionPlan ? { equipment: this.missionPlan.equipment.length, crew: this.crewRuntime.length, apex: this.missionPlan.apex?.id || null, enemyProfiles: this.sourceEnemyRuntimes.size } : null
    };
  }
}

export { DIFFICULTIES };
