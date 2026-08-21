import { GameEngine as CatalogGameEngine } from './game-runtime.js';

export * from './game-runtime.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const near = (a, b, range = 120) => Boolean(a && b && Math.hypot((a.x + a.w / 2) - (b.x + b.w / 2), (a.y + a.h / 2) - (b.y + b.h / 2)) <= range);

const OBJECTIVE_DEFINITIONS = Object.freeze([
  ['rescue-survivors', /rescue survivors/i, { action: 'rescue', requirements: ['route', 'rescue'], nodeCount: 2 }],
  ['restore-atmosphere', /restore atmospheric processing/i, { action: 'restore', requirements: ['power'] }],
  ['seal-hive', /seal the hive/i, { action: 'seal', requirements: ['route', 'boss', 'nodes'], nodeCount: 3 }],
  ['recover-black-box', /recover black-box data/i, { action: 'recover-data', requirements: ['power', 'archive'] }],
  ['escort-convoy', /escort a colony convoy/i, { action: 'escort', requirements: ['route', 'vehicle'] }],
  ['purge-reactor', /purge a reactor nest/i, { action: 'purge', requirements: ['power', 'purge'] }],
  ['board-vessel', /board a drifting vessel/i, { action: 'board', requirements: ['power', 'doors'] }],
  ['hold-extraction', /hold the extraction zone/i, { action: 'hold', requirements: ['route', 'hold'], holdSeconds: 12 }],
  ['track-apex', /track an apex specimen/i, { action: 'track', requirements: ['tracker', 'boss'], trackerPulses: 2 }],
  ['recover-synthetic', /recover a synthetic/i, { action: 'recover-synthetic', requirements: ['power', 'rescue'], nodeCount: 1 }],
  ['capture-organism', /capture a live organism/i, { action: 'capture', requirements: ['route', 'capture'] }],
  ['destroy-neuro-relay', /destroy a neuro-link relay/i, { action: 'destroy-relay', requirements: ['power', 'relay'], nodeCount: 1 }],
  ['defend-colony', /defend the colony/i, { action: 'defend', requirements: ['defend'], holdSeconds: 18 }],
  ['navigate-vents', /navigate the vent network/i, { action: 'navigate', requirements: ['vent'] }],
  ['secure-loader', /secure the power loader/i, { action: 'secure-vehicle', requirements: ['power', 'vehicle'] }],
  ['escape-quarantine', /escape the quarantine/i, { action: 'escape', requirements: ['route', 'escape'], timeLimit: 105 }]
]);

export function buildObjectiveRuntime(objective = '', { mode = 'FRONTIER', routes = 3, enemyCount = 16, doorCount = 4, ventCount = 1 } = {}) {
  const text = String(objective || '').trim();
  const [id, , definition] = OBJECTIVE_DEFINITIONS.find(([, matcher]) => matcher.test(text)) || ['secure-frontier', /.*/, { action: 'secure', requirements: ['power', 'route', 'boss', 'archive'] }];
  const survivalBonus = mode === 'SURVIVAL' ? 4 : 0;
  const crucibleWaves = mode === 'CRUCIBLE' ? 1 : 0;
  const routeBudget = clamp(Math.round(Number(routes) || 3), 1, 12);
  return Object.freeze({
    id,
    sourceText: text,
    action: definition.action,
    requirements: Object.freeze([...definition.requirements]),
    nodeCount: definition.nodeCount || 0,
    holdSeconds: (definition.holdSeconds || 0) + survivalBonus,
    timeLimit: definition.timeLimit || 0,
    trackerPulses: definition.trackerPulses || 0,
    purgeTarget: definition.action === 'purge' ? Math.max(4, Math.ceil(enemyCount * 0.75)) : 0,
    doorTarget: definition.action === 'board' ? Math.min(doorCount, Math.max(1, routeBudget - 2)) : 0,
    ventTarget: definition.action === 'navigate' ? Math.min(Math.max(1, ventCount), Math.max(1, routeBudget - 4)) : 0,
    waveCount: definition.action === 'hold' || definition.action === 'defend' ? 2 + crucibleWaves : 0,
    mode,
    routeBudget
  });
}

export class GameEngine extends CatalogGameEngine {
  start(options = {}) {
    this.objectiveEnemyCatalog = options.enemyCatalog || [];
    super.start(options);
    if (!this.neuro?.active) {
      this.player.weaponMode = 'rifle';
      this.player.magazineSize = this.weaponRuntime.magazine;
      this.player.ammo = this.weaponRuntime.magazine;
      this.player.ammoReserve = Math.max(this.player.ammoReserve, this.weaponRuntime.magazine * 2);
      this.weaponPickup.taken = true;
    }
    this.configureObjectiveRuntime();
    this.applyLevelDimensions();
    this.onEvent({
      type: 'objective-started',
      objectiveId: this.objectiveRuntime.id,
      action: this.objectiveRuntime.action,
      requirements: [...this.objectiveRuntime.requirements]
    });
    return this.getSnapshot();
  }

  configureObjectiveRuntime() {
    const plan = this.missionPlan;
    this.objectiveRuntime = buildObjectiveRuntime(plan.campaign.objective || plan.level.objective, {
      mode: plan.campaign.mode,
      routes: plan.level.routes || plan.campaign.routes,
      enemyCount: this.enemies.length,
      doorCount: this.doors.length,
      ventCount: this.vents.length
    });
    this.objectiveState = {
      started: false,
      complete: false,
      holdRemaining: this.objectiveRuntime.holdSeconds,
      holdElapsed: 0,
      nextWave: 0,
      wavesSpawned: 0,
      rescued: 0,
      nodesActivated: 0,
      trackerPulses: 0,
      captured: false,
      relayDestroyed: false,
      escaped: false,
      failed: false
    };
    this.objectiveInitialEnemyCount = this.enemies.length;
    const requirements = new Set(this.objectiveRuntime.requirements);
    this.mission.objectives.power = !requirements.has('power') || Boolean(this.powerNode?.active || !this.powerNode);
    this.mission.objectives.route = !requirements.has('route');
    this.mission.objectives.boss = !requirements.has('boss');
    this.mission.objectives.archive = !requirements.has('archive');
    this.objectiveNodes = this.createObjectiveNodes();
  }

  createObjectiveNodes() {
    const { action, nodeCount } = this.objectiveRuntime;
    if (!nodeCount) return [];
    const positions = action === 'seal'
      ? [{ x: 3900, y: 858 }, { x: 4380, y: 620 }, { x: 4740, y: 858 }]
      : action === 'rescue'
        ? [{ x: 2820, y: 850 }, { x: 4100, y: 728 }]
        : action === 'recover-synthetic'
          ? [{ x: 5480, y: 850 }]
          : [{ x: 4310, y: 850 }];
    return positions.slice(0, nodeCount).map((position, index) => ({
      id: `${this.objectiveRuntime.id}-node-${index + 1}`,
      x: position.x,
      y: position.y,
      w: 54,
      h: 72,
      active: false,
      kind: action
    }));
  }

  applyLevelDimensions() {
    const { width, height } = this.missionPlan.level;
    const area = width * height;
    this.levelScaleRuntime = {
      widthCells: width,
      heightCells: height,
      area,
      threatTarget: clamp(Math.round(this.missionPlan.threatBudget + area / 8), 4, 40),
      verticality: clamp(height / 7, 0.25, 1)
    };
    if (this.editorMode || this.enemies.length >= this.levelScaleRuntime.threatTarget) return;
    const sources = this.objectiveEnemyCatalog.length ? this.objectiveEnemyCatalog : [{ name: 'Xenomorph Warrior', biology: 'xenomorph', health: 80, damage: 12, speed: 1.2 }];
    while (this.enemies.length < this.levelScaleRuntime.threatTarget) {
      const index = this.enemies.length;
      const source = sources[index % sources.length];
      const tierY = index % 3 === 0 && this.platforms[index % this.platforms.length] ? this.platforms[index % this.platforms.length].y : 930;
      this.enemies.push(this.createEnemy(source, index, 620 + (index * 277) % 5000, tierY, { boss: false, keyCarrier: false }));
    }
  }

  update(delta) {
    super.update(delta);
    if (this.mission?.state === 'active') this.updateObjectiveRuntime(delta);
  }

  updateObjectiveRuntime(delta) {
    const state = this.objectiveState;
    const runtime = this.objectiveRuntime;
    if (runtime.requirements.includes('power') && this.powerNode?.active) this.mission.objectives.power = true;
    if (runtime.requirements.includes('route') && (this.inventory.securityKeys > 0 || this.vents.some((vent) => vent.open))) this.mission.objectives.route = true;
    if (runtime.requirements.includes('boss') && !this.enemies.some((enemy) => enemy.isBoss && enemy.alive)) this.mission.objectives.boss = true;
    if (runtime.requirements.includes('archive') && this.archiveTerminal?.recovered) this.mission.objectives.archive = true;
    if (runtime.action === 'purge') {
      const kills = this.player.kills + this.coop.kills;
      if (kills >= runtime.purgeTarget && !state.complete) this.markObjectiveAction('purge-complete', { kills });
    }
    if (runtime.action === 'board') {
      const opened = this.doors.filter((door) => door.open).length;
      if (opened >= runtime.doorTarget && !state.complete) this.markObjectiveAction('boarding-route-open', { opened });
    }
    if (runtime.action === 'track') state.trackerPulses = this.tracker.pulses;
    if (runtime.action === 'navigate') {
      const opened = this.vents.filter((vent) => vent.open).length;
      if (opened >= runtime.ventTarget && !state.complete) this.markObjectiveAction('vent-route-mapped', { opened });
    }
    if ((runtime.action === 'hold' || runtime.action === 'defend') && state.started && !state.complete) this.updateHoldObjective(delta);
    if (runtime.action === 'escape' && this.mission.elapsed > runtime.timeLimit && !state.escaped) {
      state.failed = true;
      this.onEvent({ type: 'objective-failed', objectiveId: runtime.id, reason: 'time-expired' });
      this.failMission('quarantine-time-expired');
    }
  }

  updateHoldObjective(delta) {
    const state = this.objectiveState;
    const inZone = near(this.player, this.objective, 190) || this.coopEnabled && near(this.coop, this.objective, 190);
    if (!inZone) return;
    state.holdRemaining = Math.max(0, state.holdRemaining - delta);
    state.holdElapsed += delta;
    const waveInterval = this.objectiveRuntime.holdSeconds / Math.max(1, this.objectiveRuntime.waveCount);
    if (state.wavesSpawned < this.objectiveRuntime.waveCount && state.holdElapsed >= state.nextWave) {
      this.spawnObjectiveWave(2 + state.wavesSpawned, `hold-${state.wavesSpawned + 1}`);
      state.wavesSpawned += 1;
      state.nextWave += waveInterval;
    }
    if (state.holdRemaining === 0) {
      state.complete = true;
      this.onEvent({ type: 'objective-action', objectiveId: this.objectiveRuntime.id, action: 'hold-complete', waves: state.wavesSpawned });
      this.completeMission(this.player.alive ? this.player : this.coop);
    }
  }

  spawnObjectiveWave(count, tag) {
    const sources = this.objectiveEnemyCatalog.filter((source) => source.caste !== 'royal');
    const catalog = sources.length ? sources : [{ name: 'Xenomorph Warrior', biology: 'xenomorph', health: 80, damage: 12, speed: 1.2 }];
    for (let index = 0; index < count; index += 1) {
      const source = catalog[(this.enemies.length + index) % catalog.length];
      const side = index % 2 ? 1 : -1;
      const x = clamp(this.objective.x + side * (460 + index * 90), 80, 6000);
      const enemy = this.createEnemy(source, this.enemies.length, x, 930, { boss: false, keyCarrier: false });
      enemy.alert = true;
      enemy.waveTag = tag;
      this.enemies.push(enemy);
    }
    this.onEvent({ type: 'objective-wave', objectiveId: this.objectiveRuntime.id, wave: tag, count });
  }

  interact(actor = this.player) {
    if (!actor?.alive || this.mission?.state !== 'active') return false;
    const node = this.objectiveNodes.find((candidate) => !candidate.active && near(actor, candidate, 115));
    if (node) return this.activateObjectiveNode(actor, node);
    if (this.objectiveRuntime.action === 'capture') {
      const boss = this.enemies.find((enemy) => enemy.isBoss && enemy.alive);
      if (boss && near(actor, boss, 135)) {
        if (boss.health > boss.maxHealth * 0.25) return this.locked('AFFAIBLIR LE SPÉCIMEN SOUS 25%');
        boss.alive = false;
        boss.captured = true;
        boss.deathClock = 0;
        this.objectiveState.captured = true;
        this.objectiveState.complete = true;
        this.mission.objectives.boss = true;
        this.onEvent({ type: 'objective-action', objectiveId: this.objectiveRuntime.id, action: 'specimen-captured', enemyId: boss.id });
        return true;
      }
    }
    if ((this.objectiveRuntime.action === 'hold' || this.objectiveRuntime.action === 'defend') && near(actor, this.objective, 150) && !this.objectiveState.started) {
      const missing = this.missingObjectiveRequirement({ ignoreAction: true });
      if (missing) return this.locked(missing);
      this.objectiveState.started = true;
      this.objectiveState.nextWave = 0;
      this.onEvent({ type: 'objective-action', objectiveId: this.objectiveRuntime.id, action: 'hold-started', seconds: this.objectiveRuntime.holdSeconds });
      return true;
    }
    return super.interact(actor);
  }

  activateObjectiveNode(actor, node) {
    if (node.kind === 'seal' && this.enemies.some((enemy) => enemy.isBoss && enemy.alive)) return this.locked('NEUTRALISER LA MENACE ALPHA AVANT LE SCELLAGE');
    node.active = true;
    this.objectiveState.nodesActivated += 1;
    if (node.kind === 'rescue' || node.kind === 'recover-synthetic') this.objectiveState.rescued += 1;
    if (node.kind === 'destroy-relay') this.objectiveState.relayDestroyed = true;
    const allActive = this.objectiveNodes.every((candidate) => candidate.active);
    if (allActive) this.objectiveState.complete = true;
    this.onEvent({
      type: 'objective-action',
      objectiveId: this.objectiveRuntime.id,
      action: node.kind === 'seal' ? 'charge-armed' : node.kind === 'destroy-relay' ? 'relay-destroyed' : 'target-secured',
      nodeId: node.id,
      progress: this.objectiveState.nodesActivated,
      total: this.objectiveNodes.length,
      coop: actor.coop
    });
    return true;
  }

  activateTracker(player) {
    const activated = super.activateTracker(player);
    if (activated && this.objectiveRuntime?.action === 'track') {
      this.objectiveState.trackerPulses = this.tracker.pulses;
      this.onEvent({ type: 'objective-action', objectiveId: this.objectiveRuntime.id, action: 'apex-trace', pulses: this.tracker.pulses, contacts: this.tracker.contacts.length });
    }
    return activated;
  }

  defeatEnemy(enemy, owner) {
    const captureTargetKilled = this.objectiveRuntime?.action === 'capture' && enemy.isBoss && !enemy.captured;
    super.defeatEnemy(enemy, owner);
    if (captureTargetKilled) {
      this.objectiveState.failed = true;
      this.onEvent({ type: 'objective-failed', objectiveId: this.objectiveRuntime.id, reason: 'specimen-killed' });
      this.failMission('capture-target-killed');
    }
  }

  markObjectiveAction(action, detail = {}) {
    if (this.objectiveState.complete) return;
    this.objectiveState.complete = true;
    this.onEvent({ type: 'objective-action', objectiveId: this.objectiveRuntime.id, action, ...detail });
  }

  missingObjectiveRequirement({ ignoreAction = false } = {}) {
    const runtime = this.objectiveRuntime;
    const state = this.objectiveState;
    const requirements = new Set(runtime.requirements);
    if (requirements.has('power') && !this.mission.objectives.power) return 'ALIMENTATION AUXILIAIRE MANQUANTE';
    if (requirements.has('route') && !this.mission.objectives.route) return 'ROUTE DE SÉCURITÉ NON VALIDÉE';
    if (requirements.has('boss') && this.enemies.some((enemy) => enemy.isBoss && enemy.alive)) return 'MENACE ALPHA ENCORE ACTIVE';
    if (requirements.has('archive') && !this.archiveTerminal?.recovered) return 'DONNÉES NON RÉCUPÉRÉES';
    if (requirements.has('rescue') && state.rescued < runtime.nodeCount) return `${runtime.nodeCount - state.rescued} CIBLE(S) À RÉCUPÉRER`;
    if (requirements.has('nodes') && state.nodesActivated < runtime.nodeCount) return `${runtime.nodeCount - state.nodesActivated} CHARGE(S) À ARMER`;
    if (requirements.has('relay') && !state.relayDestroyed) return 'RELAIS NEURO-LINK ENCORE ACTIF';
    if (requirements.has('purge') && this.player.kills + this.coop.kills < runtime.purgeTarget) return `PURGE ${this.player.kills + this.coop.kills}/${runtime.purgeTarget}`;
    if (requirements.has('doors') && this.doors.filter((door) => door.open).length < runtime.doorTarget) return `SAS OUVERTS ${this.doors.filter((door) => door.open).length}/${runtime.doorTarget}`;
    if (requirements.has('tracker') && this.tracker.pulses < runtime.trackerPulses) return `TRACES APEX ${this.tracker.pulses}/${runtime.trackerPulses}`;
    if (requirements.has('capture') && !state.captured) return 'SPÉCIMEN VIVANT NON CAPTURÉ';
    if (requirements.has('vent') && this.vents.filter((vent) => vent.open).length < runtime.ventTarget) return `CONDUITS CARTOGRAPHIÉS ${this.vents.filter((vent) => vent.open).length}/${runtime.ventTarget}`;
    if (requirements.has('vehicle')) {
      const recovered = this.vehicle?.active && !this.vehicle.destroyed && Math.abs(this.vehicle.x - this.objective.x) < 520;
      if (!recovered) return runtime.action === 'escort' ? 'CONVOI HORS DE LA ZONE' : 'VÉHICULE NON SÉCURISÉ';
    }
    if (!ignoreAction && requirements.has('hold') && !state.complete) return 'TENUE DE ZONE NON TERMINÉE';
    if (!ignoreAction && requirements.has('defend') && !state.complete) return 'DÉFENSE DE COLONIE NON TERMINÉE';
    return '';
  }

  missingExtractionRequirement() {
    return this.missingObjectiveRequirement();
  }

  completeMission(actor = this.player) {
    if (this.mission.state !== 'active') return false;
    const missing = this.missingObjectiveRequirement();
    if (missing) return false;
    if (this.objectiveRuntime.action === 'escape') {
      this.objectiveState.escaped = true;
      this.objectiveState.complete = true;
    }
    if (this.objective) this.objective.complete = true;
    this.mission.objectives.extract = true;
    this.mission.state = 'complete';
    const kills = this.player.kills + this.coop.kills;
    const vehicleRecovered = Boolean(this.vehicle?.active && !this.vehicle.destroyed && Math.abs(this.vehicle.x - this.objective.x) < 520);
    const noCasualty = this.mission.casualties === 0;
    const baseCredits = 480 + kills * 12 + (vehicleRecovered ? 100 : 0) + (noCasualty ? 120 : 0);
    const rewards = {
      credits: Math.round(baseCredits * this.missionPlan.rewardMultiplier),
      salvage: this.inventory.salvage + (vehicleRecovered ? 20 : 0),
      intel: this.inventory.intel,
      apex: this.missionPlan.apex?.reward || 0,
      cargo: vehicleRecovered ? this.selectedVehicleRuntime.cargo : 0,
      vehicleRecovered,
      noCasualty,
      retries: this.mission.retries,
      elapsedSeconds: Math.round(this.mission.elapsed),
      objectiveId: this.objectiveRuntime.id,
      action: this.objectiveRuntime.action,
      canon: this.missionPlan.campaign.canon,
      source: this.missionPlan.campaign.source
    };
    this.mission.rewards = rewards;
    this.onEvent({ type: 'mission-complete', kills, rewards, objectiveId: this.objectiveRuntime.id, extractedBy: actor?.coop ? 'coop' : 'primary' });
    return true;
  }

  restartFromCheckpoint() {
    const restarted = super.restartFromCheckpoint();
    if (!restarted) return false;
    if (this.objectiveRuntime.action === 'hold' || this.objectiveRuntime.action === 'defend') {
      this.objectiveState.started = false;
      this.objectiveState.complete = false;
      this.objectiveState.holdRemaining = this.objectiveRuntime.holdSeconds;
      this.objectiveState.holdElapsed = 0;
      this.objectiveState.nextWave = 0;
      this.objectiveState.wavesSpawned = 0;
    }
    return true;
  }

  getInteractionPrompt(actor = this.player) {
    const node = this.objectiveNodes?.find((candidate) => !candidate.active && near(actor, candidate, 115));
    if (node) return node.kind === 'seal' ? 'E  ARMER LA CHARGE DE SCELLAGE' : node.kind === 'destroy-relay' ? 'E  SABOTER LE RELAIS NEURO-LINK' : 'E  SÉCURISER LA CIBLE';
    if (this.objectiveRuntime?.action === 'capture') {
      const boss = this.enemies.find((enemy) => enemy.isBoss && enemy.alive);
      if (boss && near(actor, boss, 135)) return boss.health <= boss.maxHealth * 0.25 ? 'E  CAPTURER LE SPÉCIMEN VIVANT' : 'AFFAIBLIR LE SPÉCIMEN SOUS 25%';
    }
    if ((this.objectiveRuntime?.action === 'hold' || this.objectiveRuntime?.action === 'defend') && near(actor, this.objective, 150) && !this.objectiveState.started) return 'E  COMMENCER LA TENUE DE ZONE';
    return super.getInteractionPrompt(actor);
  }

  phaseLabel() {
    if (!this.objectiveRuntime) return super.phaseLabel();
    const labels = {
      rescue: 'RÉCUPÉRER LES SURVIVANTS', restore: 'RÉTABLIR L’ATMOSPHÈRE', seal: 'SCELLER LA RUCHE', 'recover-data': 'RÉCUPÉRER LA BOÎTE NOIRE',
      escort: 'ESCORTER LE CONVOI', purge: 'PURGER LE RÉACTEUR', board: 'OUVRIR LES SAS D’ABORDAGE', hold: 'TENIR L’EXTRACTION', track: 'PISTER L’APEX',
      'recover-synthetic': 'RÉCUPÉRER LE SYNTHÉTIQUE', capture: 'CAPTURER LE SPÉCIMEN', 'destroy-relay': 'DÉTRUIRE LE RELAIS', defend: 'DÉFENDRE LA COLONIE',
      navigate: 'CARTOGRAPHIER LES CONDUITS', 'secure-vehicle': 'SÉCURISER LE POWER LOADER', escape: 'ÉCHAPPER À LA QUARANTAINE', secure: 'SÉCURISER LA FRONTIÈRE'
    };
    return labels[this.objectiveRuntime.action] || super.phaseLabel();
  }

  drawWorld(ctx) {
    super.drawWorld(ctx);
    for (const node of this.objectiveNodes || []) {
      ctx.fillStyle = node.active ? '#76d69b' : node.kind === 'seal' ? '#e2a45f' : '#65c8bf';
      ctx.fillRect(node.x, node.y, node.w, node.h);
      ctx.fillStyle = 'rgba(4, 12, 10, .72)';
      ctx.fillRect(node.x + 9, node.y + 13, node.w - 18, 8);
    }
  }

  drawHud(ctx) {
    super.drawHud(ctx);
    if (!this.objectiveRuntime) return;
    ctx.fillStyle = 'rgba(3, 10, 8, .84)';
    ctx.fillRect(474, 94, 332, 52);
    ctx.strokeStyle = '#668b71';
    ctx.strokeRect(474.5, 94.5, 332, 52);
    ctx.fillStyle = '#9be0ae';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(this.phaseLabel(), 488, 114);
    ctx.fillStyle = '#a9bbae';
    const progress = this.objectiveProgressText();
    ctx.fillText(progress, 488, 135);
  }

  objectiveProgressText() {
    const runtime = this.objectiveRuntime;
    const state = this.objectiveState;
    if (runtime.action === 'hold' || runtime.action === 'defend') return state.started ? `ZONE ${Math.ceil(state.holdRemaining)}s · VAGUES ${state.wavesSpawned}/${runtime.waveCount}` : 'TENUE DE ZONE EN ATTENTE';
    if (runtime.action === 'purge') return `ÉLIMINATIONS ${this.player.kills + this.coop.kills}/${runtime.purgeTarget}`;
    if (runtime.action === 'track') return `PULSES TRACKER ${this.tracker.pulses}/${runtime.trackerPulses}`;
    if (runtime.nodeCount) return `ACTIONS ${state.nodesActivated}/${runtime.nodeCount}`;
    if (runtime.action === 'board') return `SAS ${this.doors.filter((door) => door.open).length}/${runtime.doorTarget}`;
    if (runtime.action === 'navigate') return `CONDUITS ${this.vents.filter((vent) => vent.open).length}/${runtime.ventTarget}`;
    if (runtime.action === 'escape') return `QUARANTAINE ${Math.max(0, Math.ceil(runtime.timeLimit - this.mission.elapsed))}s`;
    return this.missingObjectiveRequirement() || 'EXTRACTION DISPONIBLE';
  }

  getGameplayReport() {
    return {
      ...super.getGameplayReport(),
      objectiveRuntime: this.objectiveRuntime ? {
        id: this.objectiveRuntime.id,
        action: this.objectiveRuntime.action,
        requirements: [...this.objectiveRuntime.requirements],
        waveCount: this.objectiveRuntime.waveCount,
        routeBudget: this.objectiveRuntime.routeBudget
      } : null,
      levelScale: this.levelScaleRuntime ? { ...this.levelScaleRuntime } : null
    };
  }

  getSnapshot() {
    const snapshot = super.getSnapshot();
    return {
      ...snapshot,
      objectiveRuntime: this.objectiveRuntime ? {
        id: this.objectiveRuntime.id,
        sourceText: this.objectiveRuntime.sourceText,
        action: this.objectiveRuntime.action,
        requirements: [...this.objectiveRuntime.requirements],
        nodeCount: this.objectiveRuntime.nodeCount,
        holdSeconds: this.objectiveRuntime.holdSeconds,
        timeLimit: this.objectiveRuntime.timeLimit,
        trackerPulses: this.objectiveRuntime.trackerPulses,
        purgeTarget: this.objectiveRuntime.purgeTarget,
        doorTarget: this.objectiveRuntime.doorTarget,
        ventTarget: this.objectiveRuntime.ventTarget,
        waveCount: this.objectiveRuntime.waveCount,
        routeBudget: this.objectiveRuntime.routeBudget
      } : null,
      objectiveState: this.objectiveState ? { ...this.objectiveState } : null,
      objectiveNodes: this.objectiveNodes?.map((node) => ({ id: node.id, active: node.active, kind: node.kind })) || [],
      levelScale: this.levelScaleRuntime ? { ...this.levelScaleRuntime } : null
    };
  }
}
