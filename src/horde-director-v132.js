import { stableMissionHashV52 } from './mission-levels-v52.js';

// Occasional bounded pressure in ordinary missions. Campaign controllers own
// their own populations; no new canonical caste or dedicated artwork is claimed.
export const HORDE_DIRECTOR_V132 = Object.freeze({ schema: 132, firstWave: 45, firstWaveRange: Object.freeze([45, 80]), interval: 54, warning: 4,
  emissionInterval: .55, waveSize: 10, maxWaves: 3, maxTotal: 30, maxLive: 12,
  maxGlobalLive: 48, maxStored: 96, maxPool: 12, duration: 240, impactInterval: .85,
  profiles: Object.freeze(['enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner']) });
const list = value => Array.isArray(value) ? value : [];
const clone = value => structuredClone(value);
const finite = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
const box = value => value && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(value[key])) && value.w > 0 && value.h > 0;
const center = actor => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 });
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const own = enemy => enemy?.hordeV132 === true;
const pending = enemy => enemy?.rearEntryV130 && enemy.rearEntryV130.phase !== 'active';
const phaseNames = ['waiting', 'warning', 'emitting', 'cooldown', 'exhausted'];
const identityKeys = ['campaignId', 'worldId', 'levelSeedId', 'objectiveId', 'editorProjectKind', 'seed'];
const sameIdentity = (a, b) => a && b && identityKeys.every(key => key === 'seed' ? Number(a[key]) === Number(b[key]) : a[key] === b[key]);
const stamp = (signature, identity) => stableMissionHashV52(`${signature}:${identityKeys.map(key => identity[key] ?? '').join(':')}`).toString(16);

export function hordeDirectorEligibleV132(options = {}, engine = null) {
  const campaign = options.campaign || engine?.campaign || {};
  const scene = String(options.scene || options.mode || engine?.scene || '');
  return options.hordeDirectorV132 !== false && !options.editorProject && !options.editorMode && !options.qaMode && !options.testMode
    // The V88 flag installs contextual enemies in ordinary human missions.
    // Only an actual player Neuro transformation excludes this director.
    && !engine?.editorMode && !options.neuroProfile && !options.neuroMode && !engine?.neuro?.active
    && !campaign.specialOperationId && Boolean(campaign.id) && !/^(special-|qa-|editor-|custom-)/i.test(campaign.id)
    && !/hub|dojo|bioforge|arena|preview|sandbox/i.test(`${scene}:${campaign.id}:${campaign.mode || ''}`)
    && !['isHiveMissionV131', 'isMechaMissionV131', 'isEcosystemMissionV131', 'isLegacyMissionV131',
      'isC12HordeV121', 'isApcConvoyV121', 'isBlackCocoonV121', 'isArchiveRelayV122', 'isCargoBrutalV67']
      .some(method => engine?.[method]?.());
}

function initial(signature, identity) {
  const token = stamp(signature, identity), hash = Number.parseInt(token, 16), firstWarningAt = 45 + hash % 36, eventSelected = hash % 5 !== 0;
  return { schema: 132, signature, identity: { ...identity }, stamp: token, elapsed: 0, firstWarningAt, eventSelected,
    nextWave: firstWarningAt, phase: eventSelected ? 'waiting' : 'exhausted', wave: 0, waveEmitted: 0, emitted: 0,
    killed: 0, retired: 0, cancelled: 0, warningRemaining: 0, emissionClock: 0, impactCooldown: 0,
    entrances: [], actors: [], peakLive: 0, peakStored: 0, checks: 0, blocked: 0, impacts: 0, recycled: 0 };
}

export function validateHordeDirectorV132(raw, context = {}) {
  const limits = HORDE_DIRECTOR_V132, entrances = new Map(list(context.entrances).map(entry => [entry.id, entry]));
  if (!raw || raw.schema !== 132 || typeof raw.signature !== 'string' || !raw.identity
    || !finite(raw.identity.seed, 0, 4294967295) || !Number.isInteger(raw.identity.seed)
    || identityKeys.filter(key => key !== 'seed').some(key => typeof raw.identity[key] !== 'string' || raw.identity[key].length > 160)
    || raw.stamp !== stamp(raw.signature, raw.identity) || context.signature && raw.signature !== context.signature
    || context.identity && !sameIdentity(raw.identity, context.identity)) return { valid: false, reason: 'horde-signature-mismatch-v132' };
  const fields = { elapsed: [0, limits.duration], nextWave: [0, 604800], wave: [0, limits.maxWaves], waveEmitted: [0, limits.waveSize],
    emitted: [0, limits.maxTotal], killed: [0, limits.maxTotal], retired: [0, limits.maxTotal], cancelled: [0, limits.maxTotal],
    warningRemaining: [0, limits.warning], emissionClock: [0, limits.emissionInterval], impactCooldown: [0, limits.impactInterval],
    peakLive: [0, limits.maxLive], peakStored: [0, limits.maxStored], checks: [0, 1e9], blocked: [0, 1e9], impacts: [0, 1e9], recycled: [0, limits.maxTotal] };
  if (!phaseNames.includes(raw.phase) || Object.entries(fields).some(([key, range]) => !finite(raw[key], ...range))
    || raw.firstWarningAt !== 45 + Number.parseInt(raw.stamp, 16) % 36 || raw.eventSelected !== (Number.parseInt(raw.stamp, 16) % 5 !== 0)
    || !raw.eventSelected && (raw.phase !== 'exhausted' || raw.emitted || raw.wave || raw.actors?.length)
    || ['wave', 'waveEmitted', 'emitted', 'killed', 'retired', 'cancelled', 'peakLive', 'peakStored', 'checks', 'blocked', 'impacts', 'recycled'].some(key => !Number.isInteger(raw[key]))
    || !Array.isArray(raw.entrances) || raw.entrances.length > 2 || new Set(raw.entrances).size !== raw.entrances.length
    || raw.entrances.some(id => typeof id !== 'string' || context.entrances && !entrances.has(id))
    || !Array.isArray(raw.actors) || raw.actors.length > limits.maxTotal || new Set(raw.actors.map(actor => actor.id)).size !== raw.actors.length
    || raw.retired > raw.killed || raw.cancelled + raw.killed > raw.emitted
    || raw.actors.length + raw.retired + raw.cancelled !== raw.emitted
    || raw.actors.filter(actor => !actor.alive).length + raw.retired !== raw.killed
    || raw.actors.filter(actor => actor.alive).length > limits.maxLive
    || raw.wave === 0 && (raw.emitted || raw.entrances.length || !['waiting', 'exhausted'].includes(raw.phase))
    || raw.wave > 0 && !raw.entrances.length || raw.emitted > raw.wave * limits.waveSize
    || raw.waveEmitted > raw.emitted || raw.emitted !== Math.max(0, raw.wave - 1) * limits.waveSize + raw.waveEmitted
    || raw.wave > 0 && raw.elapsed < raw.firstWarningAt
    || raw.elapsed === limits.duration && raw.phase !== 'exhausted'
    || raw.phase === 'warning' && (raw.warningRemaining <= 0 || raw.waveEmitted !== 0)
    || raw.phase === 'emitting' && (raw.warningRemaining !== 0 || raw.waveEmitted >= limits.waveSize)
    || raw.phase === 'waiting' && raw.wave !== 0 || raw.phase === 'cooldown' && (raw.warningRemaining !== 0 || raw.waveEmitted !== limits.waveSize)
    || raw.phase === 'exhausted' && raw.eventSelected && raw.elapsed < limits.duration
      && (raw.wave !== limits.maxWaves || raw.waveEmitted !== limits.waveSize))
    return { valid: false, reason: 'horde-progress-inconsistent-v132' };
  const bounds = context.bounds || { width: 6200, height: 1200 }, descriptors = list(context.enemies);
  for (const actor of raw.actors) {
    const id = new RegExp(`^horde-v132-${raw.stamp}-([1-9][0-9]?)$`).exec(actor?.id || '');
    const rear = actor?.rearEntry, entrance = entrances.get(rear?.entranceId);
    if (!id || Number(id[1]) > raw.emitted || !limits.profiles.includes(actor.profileId)
      || context.profiles && !context.profiles.includes(actor.profileId) || typeof actor.alive !== 'boolean'
      || actor.health !== (actor.alive ? 1 : 0) || !finite(actor.x, 0, bounds.width) || !finite(actor.y, 0, bounds.height)
      || !finite(actor.deathClock, 0, 1.2) || !finite(actor.groundY, 0, bounds.height)
      || !rear || !['waiting', 'warning', 'approach', 'active'].includes(rear.phase)
      || context.entrances && !entrance || !finite(rear.elapsed, 0, 30) || !finite(rear.delay, 0, 30)
      || !finite(rear.progress, 0, 1) || typeof rear.blocked !== 'boolean'
      || rear.phase !== 'active' && (!actor.alive || rear.progress >= 1)
      || rear.phase === 'active' && rear.progress !== 1) return { valid: false, reason: 'horde-actor-invalid-v132' };
    const body = context.bodies?.[actor.profileId];
    if (body && (actor.x + body.w > bounds.width || actor.y + body.h > bounds.height
      || rear.phase !== 'active' && (Math.abs(actor.x - entrance.x - entrance.w / 2 + body.w / 2) > .001
        || Math.abs(actor.y + body.h - entrance.floorY) > .001 || actor.groundY !== entrance.floorY)))
      return { valid: false, reason: 'horde-placement-invalid-v132' };
    if (context.enemies) {
      const saved = descriptors.find(enemy => enemy.id === actor.id);
      if (!saved || saved.alive !== actor.alive || saved.health !== actor.health
        || Math.abs(saved.x - actor.x) > .001 || Math.abs(saved.y - actor.y) > .001) return { valid: false, reason: 'horde-actor-mismatch-v132' };
    }
  }
  if (context.enemies && descriptors.filter(enemy => /^horde-v132-/.test(enemy.id)).length !== raw.actors.length)
    return { valid: false, reason: 'horde-actor-mismatch-v132' };
  if (list(context.drops).some(drop => /^(salvage|ammo|key)-horde-v132-/.test(drop.id))) return { valid: false, reason: 'horde-loot-invalid-v132' };
  return { valid: true, state: clone(raw) };
}

export function hordeDirectorMetricsV132(engine) {
  const state = engine?.hordeDirectorV132;
  if (!state) return { enabled: false, reason: engine?.hordeDirectorReasonV132 || 'no-authored-plan' };
  const actors = list(engine.enemies), live = actors.filter(enemy => own(enemy) && enemy.alive).length;
  return { enabled: true, eventSelected: state.eventSelected, firstWarningAt: state.firstWarningAt, phase: state.phase, elapsed: state.elapsed, waves: state.wave, emitted: state.emitted,
    killed: state.killed, retired: state.retired, cancelled: state.cancelled, live, stored: actors.length,
    globalLive: actors.filter(enemy => enemy.alive).length, pooled: list(engine.hordePoolV132).length,
    peakLive: state.peakLive, peakStored: state.peakStored, blocked: state.blocked, checks: state.checks,
    impacts: state.impacts, recycled: state.recycled, updateCalls: engine.hordePerformanceV132?.calls || 0,
    updateTotalMs: engine.hordePerformanceV132?.totalMs || 0, updateMaxMs: engine.hordePerformanceV132?.maxMs || 0,
    updateMeanMs: (engine.hordePerformanceV132?.totalMs || 0) / Math.max(1, engine.hordePerformanceV132?.calls || 0) };
}

export function withHordeDirectorV132(Base) {
  if (Base.hordeDirectorRuntimeV132) return Base;
  return class HordeDirectorV132 extends Base {
    static hordeDirectorRuntimeV132 = true;
    start(options = {}) {
      this.hordeOptionsV132 = options; this.hordeDirectorV132 = null; this.hordePoolV132 = [];
      this.hordeDirectorReasonV132 = 'excluded-controller'; this.hordePerformanceV132 = { calls: 0, totalMs: 0, maxMs: 0 };
      this.hordeCombatEnemyV132 = null; this.hordeStartingV132 = true;
      const candidate = hordeDirectorEligibleV132(options), resume = options.resumeState;
      const result = super.start(candidate ? { ...options, resumeState: undefined } : options);
      this.hordeStartingV132 = false;
      if (!candidate) return result;
      this.configureHordeDirectorV132();
      if (resume) this.lastResumeResult = this.applyResumeState(resume);
      return this.getSnapshot();
    }
    applyMissionLevelV52(plan) {
      const result = super.applyMissionLevelV52(plan);
      if (!this.hordeStartingV132 && this.hordeOptionsV132) this.configureHordeDirectorV132();
      return result;
    }
    configureHordeDirectorV132() {
      const plan = this.missionLevelRuntime;
      if (!hordeDirectorEligibleV132(this.hordeOptionsV132 || {}, this)) { this.hordeDirectorV132 = null; this.hordeDirectorReasonV132 = 'excluded-controller'; return false; }
      if (!plan?.validation?.valid || !plan.signature || !this.resumeIdentity || !this.queueRearEntranceV130
        || !['ship-interior-vertical', 'colony-multiroute', 'planet-exterior'].includes(plan.templateId)) {
        this.hordeDirectorReasonV132 = 'no-authored-plan'; return false;
      }
      this.hordeProfilesV132 = new Map(list(this.v52EnemyCatalog || this.hordeOptionsV132.enemyCatalog)
        .filter(profile => HORDE_DIRECTOR_V132.profiles.includes(profile.id)).map(profile => [profile.id, profile]));
      if (!this.hordeProfilesV132.size) { this.hordeDirectorReasonV132 = 'no-admitted-profile'; return false; }
      this.hordeTemplatesV132 = Object.fromEntries([...this.hordeProfilesV132].map(([id, profile]) => [id, this.createEnemy(profile, 1320, 0, 0)]));
      this.hordeBodiesV132 = Object.fromEntries(Object.entries(this.hordeTemplatesV132).map(([id, body]) => [id, { w: body.w, h: body.h }]));
      this.rearEntrancesV130 ||= [];
      // Exterior templates lack V130 rear doors. Derive service thresholds only
      // from validated graph nodes that stand on the actual authored floor.
      if (!this.rearEntrancesV130.length) {
        const candidates = list(plan.graph?.nodes).filter(node => !node.anchor && list(this.platforms).some(surface =>
          !surface.lift && Math.abs(surface.y - node.y) < 2 && node.x > surface.x + 60 && node.x < surface.x + surface.w - 60));
        this.rearEntrancesV130.push(...candidates.slice(0, 8).map(node => ({ id: `horde-v132-${node.id}`, nodeId: node.id,
          zoneId: node.zoneId, x: node.x - 38, y: node.y - 116, w: 76, h: 116, floorY: node.y, hordeAuthoredV132: true })));
      }
      if (!this.rearEntrancesV130.length) { this.hordeDirectorReasonV132 = 'no-physical-entrance'; return false; }
      if (this.hordeDirectorV132?.signature === plan.signature) return true;
      this.hordeDirectorV132 = initial(plan.signature, this.resumeIdentity); this.hordeDirectorReasonV132 = null;
      return true;
    }
    hordeSimulationActiveV132() {
      return Boolean(this.hordeDirectorV132 && this.running && !this.paused && !this.enemyAtlasLoadingPausedV65
        && !this.userCasteLoadingV88 && this.mission?.state === 'active');
    }
    hordeContextV132(raw) {
      return { signature: this.missionLevelRuntime?.signature, identity: this.resumeIdentity,
        entrances: this.rearEntrancesForTacticsV130?.() || [], profiles: [...(this.hordeProfilesV132?.keys() || [])],
        bounds: this.missionLevelBounds, bodies: this.hordeBodiesV132, ...(raw ? { enemies: raw.enemies, drops: raw.drops } : {}) };
    }
    selectHordeEntrancesV132() {
      const state = this.hordeDirectorV132;
      const probes = Object.values(this.hordeTemplatesV132);
      const targets = this.tacticsTargetsV130().filter(box), camera = this.camera || { x: 0, y: 0 };
      return this.rearEntrancesForTacticsV130().filter(entrance => {
        state.checks++;
        return probes.some(probe => this.rearThresholdValidV130(probe, entrance, { occupied: true })) && targets.some(actor => {
          const p = center(actor); return Math.hypot(p.x - entrance.x - entrance.w / 2, actor.y + actor.h - entrance.floorY) < 850;
        });
      }).sort((a, b) => {
        const rank = entrance => Math.min(...targets.map(actor => Math.abs(actor.y + actor.h - entrance.floorY) * 2 + Math.abs(center(actor).x - entrance.x)))
          + (entrance.floorY < camera.y || entrance.y > camera.y + 720 ? 220 : 0);
        return rank(a) - rank(b) || a.id.localeCompare(b.id);
      }).slice(0, 2).map(entrance => entrance.id);
    }
    beginHordeWarningV132() {
      const state = this.hordeDirectorV132, limits = HORDE_DIRECTOR_V132;
      if (state.wave >= limits.maxWaves || state.emitted >= limits.maxTotal) { state.phase = 'exhausted'; return false; }
      const entrances = this.selectHordeEntrancesV132();
      if (!entrances.length) { state.blocked++; state.nextWave = state.elapsed + 2; return false; }
      state.wave++; state.waveEmitted = 0; state.entrances = entrances; state.phase = 'warning'; state.warningRemaining = limits.warning;
      this.pushCaption?.('warning', 'HORDE ANNONCÉE · PORTES ARRIÈRE · 4 S'); this.audio?.tracker?.();
      this.onEvent?.({ type: 'horde-warning-v132', wave: state.wave, seconds: limits.warning,
        entrances: entrances.map(id => ({ ...this.rearEntrancesForTacticsV130().find(entry => entry.id === id) })) }); return true;
    }
    createHordeActorV132(profileId, id, entrance, saved = null) {
      const fresh = clone(this.hordeTemplatesV132[profileId]);
      Object.assign(fresh, { animationPhase: Number(id.split('-').at(-1)) % 4, x: entrance.x, y: entrance.floorY - fresh.h,
        groundY: entrance.floorY, spawnX: entrance.x });
      const pooled = saved ? null : this.hordePoolV132.pop();
      const actor = pooled || fresh;
      if (pooled) { for (const key of Object.keys(actor)) delete actor[key]; Object.assign(actor, fresh); this.hordeDirectorV132.recycled++; }
      Object.assign(actor, { id, profileId, hordeV132: true, health: 1, maxHealth: 1, armor: 0,
        reward: 0, acid: 0, isBoss: false, keyCarrier: false, hordeEntranceV132: entrance.id });
      if (saved) {
        Object.assign(actor, { x: saved.x, y: saved.y, groundY: saved.groundY, spawnX: saved.x,
          alive: saved.alive, health: saved.health, deathClock: saved.deathClock, dormant: saved.rearEntry.phase !== 'active',
          rearEntryV130: { ...saved.rearEntry }, attacking: false, pendingMelee: false, attackClock: .3, rangedClock: .3 });
        this.enemies.push(actor); return actor;
      }
      return this.queueRearEntranceV130(actor, entrance.id) ? actor : null;
    }
    emitHordeActorV132() {
      const state = this.hordeDirectorV132, limits = HORDE_DIRECTOR_V132;
      const live = this.enemies.filter(enemy => enemy.alive).length;
      if (state.emitted >= limits.maxTotal || this.enemies.filter(enemy => own(enemy) && enemy.alive).length >= limits.maxLive
        || live >= limits.maxGlobalLive || this.enemies.length >= limits.maxStored) { state.blocked++; return false; }
      const entrances = state.entrances.map(id => this.rearEntrancesForTacticsV130().find(entry => entry.id === id)).filter(Boolean);
      const sources = [...this.hordeProfilesV132.keys()];
      const entrance = entrances[state.waveEmitted % Math.max(1, entrances.length)];
      if (!entrance) { state.blocked++; return false; }
      const profileId = [...sources.slice(state.emitted % sources.length), ...sources.slice(0, state.emitted % sources.length)].find(id => {
        return this.rearThresholdValidV130(this.hordeTemplatesV132[id], entrance, { occupied: true });
      });
      if (!profileId) { state.blocked++; return false; }
      const id = `horde-v132-${state.stamp}-${state.emitted + 1}`;
      const actor = this.createHordeActorV132(profileId, id, entrance); if (!actor) { state.blocked++; return false; }
      state.emitted++; state.waveEmitted++; state.emissionClock = limits.emissionInterval;
      if (state.waveEmitted === limits.waveSize) { state.phase = state.wave >= limits.maxWaves ? 'exhausted' : 'cooldown'; state.nextWave = state.elapsed + limits.interval; }
      this.syncHordeActorsV132();
      this.onEvent?.({ type: 'horde-delivery-v132', wave: state.wave, enemyId: id, entranceId: entrance.id });
      return true;
    }
    retireHordeActorsV132() {
      const state = this.hordeDirectorV132;
      const retired = this.enemies.filter(enemy => own(enemy) && !enemy.alive && !(enemy.deathClock > 0));
      if (!retired.length) return;
      const ids = new Set(retired.map(enemy => enemy.id));
      this.enemies = this.enemies.filter(enemy => !ids.has(enemy.id));
      state.retired += retired.length;
      this.hordePoolV132.push(...retired.slice(0, Math.max(0, HORDE_DIRECTOR_V132.maxPool - this.hordePoolV132.length)));
      this.tracker.contacts = list(this.tracker.contacts).filter(contact => !ids.has(contact.id));
    }
    syncHordeActorsV132() {
      const state = this.hordeDirectorV132; if (!state) return;
      state.actors = this.enemies.filter(own).map(enemy => ({ id: enemy.id, profileId: enemy.profileId, x: enemy.x, y: enemy.y,
        groundY: enemy.groundY, alive: Boolean(enemy.alive), health: enemy.alive ? 1 : 0, deathClock: Math.min(1.2, Math.max(0, enemy.deathClock || 0)),
        rearEntry: { ...enemy.rearEntryV130 } }));
      state.peakLive = Math.max(state.peakLive, state.actors.filter(actor => actor.alive).length);
      state.peakStored = Math.max(state.peakStored, Math.min(HORDE_DIRECTOR_V132.maxStored, this.enemies.length));
    }
    advanceHordeDirectorV132(delta) {
      const state = this.hordeDirectorV132, limits = HORDE_DIRECTOR_V132;
      state.elapsed = Math.min(limits.duration, state.elapsed + delta); state.impactCooldown = Math.max(0, state.impactCooldown - delta);
      this.retireHordeActorsV132();
      if (state.elapsed >= limits.duration) {
        state.phase = 'exhausted'; state.warningRemaining = 0;
        const waiting = this.enemies.filter(enemy => own(enemy) && pending(enemy)), ids = new Set(waiting.map(enemy => enemy.id));
        state.cancelled += waiting.length; this.enemies = this.enemies.filter(enemy => !ids.has(enemy.id));
      } else if (['waiting', 'cooldown'].includes(state.phase) && state.elapsed >= state.nextWave) this.beginHordeWarningV132();
      else if (state.phase === 'warning') {
        state.warningRemaining = Math.max(0, state.warningRemaining - delta);
        if (state.warningRemaining === 0) { state.phase = 'emitting'; state.emissionClock = 0; }
      } else if (state.phase === 'emitting') {
        state.emissionClock = Math.max(0, state.emissionClock - delta);
        if (state.emissionClock === 0) this.emitHordeActorV132();
      }
      this.syncHordeActorsV132();
    }
    update(delta) {
      if (!this.hordeDirectorV132) return super.update(delta);
      if (!this.hordeSimulationActiveV132() || !Number.isFinite(delta) || delta <= 0) return;
      const begin = globalThis.performance?.now?.() || 0;
      this.advanceHordeDirectorV132(delta);
      const end = globalThis.performance?.now?.() || begin, cost = Math.max(0, end - begin), metrics = this.hordePerformanceV132;
      metrics.calls++; metrics.totalMs += cost; metrics.maxMs = Math.max(metrics.maxMs, cost);
      const result = super.update(delta); this.syncHordeActorsV132(); return result;
    }
    updateEnemy(enemy, delta) {
      if (!own(enemy)) return super.updateEnemy(enemy, delta);
      const previous = this.hordeCombatEnemyV132; this.hordeCombatEnemyV132 = enemy;
      try { return super.updateEnemy(enemy, delta); } finally { this.hordeCombatEnemyV132 = previous; }
    }
    commitHordeImpactV132(target, callback, field = 'health') {
      if (!this.hordeCombatEnemyV132) return callback();
      const state = this.hordeDirectorV132;
      if (!state || state.impactCooldown > 0 || pending(this.hordeCombatEnemyV132) || !this.hordeSimulationActiveV132()) return 0;
      const before = target?.[field], armor = target?.armor, result = callback();
      if (target?.[field] < before || target?.armor < armor) { state.impactCooldown = HORDE_DIRECTOR_V132.impactInterval; state.impacts++; }
      return result;
    }
    damagePlayer(actor, amount, options) { return this.commitHordeImpactV132(actor, () => super.damagePlayer(actor, Math.min(amount, this.hordeCombatEnemyV132 ? 12 : amount), options)); }
    damageVehicle(amount, source) { return this.commitHordeImpactV132(this.vehicle, () => super.damageVehicle(Math.min(amount, this.hordeCombatEnemyV132 ? 12 : amount), source), 'hull'); }
    damageSquadMember(actor, amount, options) { return this.commitHordeImpactV132(actor, () => super.damageSquadMember(actor, Math.min(amount, this.hordeCombatEnemyV132 ? 12 : amount), options)); }
    applyEnemyDamage(enemy, amount, source) {
      if (own(enemy) && (!Number.isFinite(amount) || amount <= 0 || !this.hordeSimulationActiveV132())) return 0;
      return super.applyEnemyDamage(enemy, amount, source);
    }
    defeatEnemy(enemy, owner) {
      if (!own(enemy)) return super.defeatEnemy(enemy, owner);
      if (!enemy.alive || pending(enemy) || !this.hordeSimulationActiveV132()) return false;
      this.hordeDirectorV132.killed++;
      const dropIds = new Set([`salvage-${enemy.id}`, `ammo-${enemy.id}`, `key-${enemy.id}`]), sink = this.onEvent;
      const removeLoot = () => { this.drops = this.drops.filter(drop => !dropIds.has(drop.id)); };
      // A synchronous kill observer may save immediately. Remove even the
      // legacy ammo roll before publishing that event, not only afterwards.
      this.onEvent = event => { if (event.type === 'kill' && event.enemy === enemy) removeLoot(); sink?.(event); };
      let result; try { result = super.defeatEnemy(enemy, owner); } finally { this.onEvent = sink; }
      removeLoot(); enemy.deathClock = Math.min(1.2, enemy.deathClock); this.syncHordeActorsV132(); return result;
    }
    captureResumeState() {
      const raw = super.captureResumeState(); if (!this.hordeDirectorV132) return raw;
      this.syncHordeActorsV132(); return { ...raw, hordeDirectorV132: clone(this.hordeDirectorV132) };
    }
    applyResumeState(raw) {
      if (!this.hordeDirectorV132) {
        if (raw?.hordeDirectorV132) return { applied: false, reason: 'horde-no-authored-plan-v132', restored: 0 };
        return super.applyResumeState(raw);
      }
      if (!raw?.hordeDirectorV132) {
        if (list(raw?.enemies).some(enemy => /^horde-v132-/.test(enemy.id))) return { applied: false, reason: 'horde-checkpoint-missing-v132', restored: 0 };
        const previousEnemies = this.enemies;
        this.enemies = this.enemies.filter(enemy => !own(enemy));
        const result = super.applyResumeState(raw);
        if (result?.applied) { this.hordeDirectorV132 = initial(this.missionLevelRuntime.signature, this.resumeIdentity);
          this.hordeDirectorV132.nextWave = Math.max(this.hordeDirectorV132.firstWarningAt, (Number(raw.mission?.elapsed) || 0) + 10);
          this.hordeDirectorV132.elapsed = Math.min(HORDE_DIRECTOR_V132.duration, Number(raw.mission?.elapsed) || 0);
          if (this.hordeDirectorV132.elapsed === HORDE_DIRECTOR_V132.duration) this.hordeDirectorV132.phase = 'exhausted';
          this.hordePoolV132 = []; }
        else this.enemies = previousEnemies;
        return result;
      }
      const checked = validateHordeDirectorV132(raw.hordeDirectorV132, this.hordeContextV132(raw));
      if (!checked.valid || raw.schema !== 1 || !sameIdentity(raw.identity, this.resumeIdentity)
        || raw.missionLevel?.signature !== this.missionLevelRuntime.signature) return { applied: false, reason: checked.reason || 'horde-identity-mismatch-v132', restored: 0 };
      const previous = this.hordeDirectorV132, previousEnemies = this.enemies;
      this.hordeDirectorV132 = checked.state; this.enemies = this.enemies.filter(enemy => !own(enemy));
      for (const saved of checked.state.actors) {
        const entrance = this.rearEntrancesForTacticsV130().find(entry => entry.id === saved.rearEntry.entranceId);
        this.createHordeActorV132(saved.profileId, saved.id, entrance, saved);
      }
      const result = super.applyResumeState(raw);
      if (!result?.applied) { this.hordeDirectorV132 = previous; this.enemies = previousEnemies; return result; }
      this.hordePoolV132 = []; this.hordeCombatEnemyV132 = null;
      for (const saved of checked.state.actors) {
        const actor = this.enemies.find(enemy => enemy.id === saved.id);
        actor.rearEntryV130 = { ...saved.rearEntry }; actor.dormant = saved.rearEntry.phase !== 'active';
        actor.deathClock = saved.deathClock; actor.attacking = false; actor.pendingMelee = false; actor.attackClock = Math.max(.3, actor.attackClock || 0);
      }
      this.syncHordeActorsV132(); return { ...result, hordeDirectorRestoredV132: true };
    }
    getSnapshot() { return { ...super.getSnapshot(), hordeDirectorV132: hordeDirectorMetricsV132(this) }; }
    getGameplayReport() { return { ...super.getGameplayReport(), hordeDirectorV132: hordeDirectorMetricsV132(this) }; }
    drawRearEntranceLayerV130(ctx) {
      if (this.hordeDirectorV132) for (const entrance of this.rearEntrancesForTacticsV130().filter(entry => entry.hordeAuthoredV132)) {
        ctx.save(); ctx.strokeStyle = '#517d81'; ctx.lineWidth = 4; ctx.strokeRect(entrance.x, entrance.y, entrance.w, entrance.h);
        ctx.fillStyle = '#263f45'; ctx.fillRect(entrance.x + 4, entrance.y + 4, entrance.w - 8, 8); ctx.restore();
      }
      return super.drawRearEntranceLayerV130(ctx);
    }
    drawHud(ctx) {
      super.drawHud(ctx); const state = this.hordeDirectorV132; if (!state || !['warning', 'emitting'].includes(state.phase)) return;
      const floors = state.entrances.map(id => this.rearEntrancesForTacticsV130().find(entry => entry.id === id)).filter(Boolean)
        .map(entry => `${entry.floorY < this.camera.y ? 'HAUT ↑' : entry.floorY > this.camera.y + 720 ? 'BAS ↓' : 'ÉTAGE VISIBLE'} · X${Math.round(entry.x + entry.w / 2)} Y${Math.round(entry.floorY)}`);
      ctx.save(); ctx.fillStyle = '#231b13eb'; ctx.fillRect(18, 113, 1195, 49); ctx.fillStyle = '#f3d18d'; ctx.font = 'bold 13px monospace';
      ctx.fillText(`HORDE ${state.wave}/${HORDE_DIRECTOR_V132.maxWaves} · ${state.phase === 'warning' ? `ARRIVÉE DANS ${Math.ceil(state.warningRemaining)} S` : 'PORTES ARRIÈRE · CONTACTS EN APPROCHE'}`, 31, 133);
      ctx.font = '11px monospace'; ctx.fillText(floors.join(' / '), 31, 152, 1160); ctx.restore();
    }
  };
}
