import {
  ALIEN3_CAMPAIGN_ID_V89,
  ALIEN3_CODEX_V89,
  ALIEN3_DLC_SCHEMA_V89,
  ALIEN3_PRISONER_ROSTER_V89,
  ALIEN3_RUNNER_AMBUSH_ANCHORS_V89,
  ALIEN3_V89_EVIDENCE_IDS,
  ALIEN3_V89_STATIONS,
  alien3V89CodexEntry,
  alien3V89Cut,
  alien3V89Grade,
  createAlien3StateV89,
  sanitizeAlien3StateV89
} from './alien3-dlc-v89.js';

const WORLD_WIDTH = 6200;
const INTERACT_RANGE = 165;
const WASTE_TRAP_RANGE = 470;
const FLARE_LIFE = 7.5;
const FLARE_LURE_RANGE = 1200;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const center = (entity = {}) => ({
  x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2,
  y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2
});
const distance = (a, b) => {
  if (!a || !b) return Infinity;
  const left = center(a);
  const right = center(b);
  return Math.hypot(left.x - right.x, left.y - right.y);
};

export const ALIEN3_PERSISTENT_EVENT_TYPES_V89 = Object.freeze(new Set([
  'alien3-v89-cut', 'alien3-v89-evidence', 'alien3-v89-runner-director',
  'alien3-v89-runner-spared-host', 'alien3-v89-waste-trap', 'alien3-v89-golic-release',
  'alien3-v89-casualty', 'alien3-v89-company-stage', 'alien3-v89-finale-stage',
  'alien3-v89-achievement'
]));

const evidenceCodex = Object.freeze({
  'prison-roster': ['f161-prison-roster'],
  patna: ['f161-patna'],
  morse: ['f161-morse-witness']
});

const phaseOrder = Object.freeze([
  'wreckage', 'infirmary', 'first-blood', 'bishop', 'trap-prep', 'fire-maze',
  'leadworks', 'molten-lead', 'thermal-shock', 'company', 'finale'
]);
const phaseIndex = (phase) => Math.max(0, phaseOrder.indexOf(phase));

function nearestPlatformY(engine, x, fallback = 510) {
  const platforms = Array.isArray(engine?.platforms) ? engine.platforms : [];
  const candidates = platforms.filter((entry) => {
    const start = Number(entry?.x) || 0;
    const end = start + (Number(entry?.w) || 0);
    return x >= start - 24 && x <= end + 24 && Number.isFinite(Number(entry?.y));
  });
  if (!candidates.length) return fallback;
  return candidates.sort((a, b) => Math.abs(Number(a.y) - fallback) - Math.abs(Number(b.y) - fallback))[0].y;
}

function cutCodex(cutId) {
  return cutId === 'assembly' ? ['f161-cut-assembly', 'f161-host-babe'] : ['f161-cut-theatrical', 'f161-host-spike'];
}

export function withAlien3DlcRuntimeV89(BaseEngine) {
  return class Alien3DlcRuntimeV89 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV89 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V89;
      const requestedCut = options?.strategicBriefing?.flags?.['alien3-assembly-cut'] ? 'assembly' : 'theatrical';
      this.alien3V89 = this.alien3ActiveV89 ? createAlien3StateV89({ cut: requestedCut }) : null;
      this.pendingAlien3ResumeV89 = null;
      this.alien3StationsV89 = [];
      this.alien3PrisonersV89 = [];
      this.alien3CompanyTeamV89 = [];
      this.alien3CodexOverlayClockV89 = 0;
      this.alien3CodexOverlayIdV89 = null;
      this.alien3TrackerPageV89 = 0;
      this.alien3DirectorEventThrottleV89 = 0;
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV89()) return snapshot;
      if (this.pendingAlien3ResumeV89) this.alien3V89 = sanitizeAlien3StateV89(this.pendingAlien3ResumeV89);
      this.configureAlien3WorldV89();
      this.onEvent({
        type: 'alien3-v89-runner-director',
        state: 'ready',
        cut: this.alien3V89.cut,
        routes: 4,
        prisonerRoster: ALIEN3_PRISONER_ROSTER_V89.length
      });
      return { ...snapshot, ...this.getAlien3SnapshotV89() };
    }

    isAlien3MissionV89() {
      return Boolean(this.alien3ActiveV89 || this.isAlien3MissionV88?.());
    }

    configureAlien3WorldV89() {
      const state = this.alien3V89 || createAlien3StateV89();
      this.alien3V89 = state;
      this.alien3StationsV89 = ALIEN3_V89_STATIONS.map((entry) => ({ ...entry }));
      this.alien3PrisonersV89 = ALIEN3_PRISONER_ROSTER_V89.map((entry, index) => ({
        ...entry,
        status: state.prisoners[entry.id] || 'active',
        facing: index % 2 ? -1 : 1,
        patrolOrigin: entry.x,
        patrolRadius: 30 + index % 4 * 9,
        phase: index * 0.61
      }));
      this.alien3CompanyTeamV89 = [
        { id: 'bishop-ii', label: 'BISHOP II', x: 5690, y: 422, role: 'science' },
        { id: 'patna-science', label: 'SCIENCE', x: 5750, y: 422, role: 'science' },
        { id: 'patna-cmd-1', label: 'CMD', x: 5810, y: 422, role: 'commando' },
        { id: 'patna-cmd-2', label: 'CMD', x: 5870, y: 422, role: 'commando' }
      ];
      this.unlockAlien3CodexV89(cutCodex(state.cut));
      this.recoverAlien3EvidenceV89('host-variant', { silent: true });
      this.recoverAlien3EvidenceV89('runner-director', { silent: true });
      state.cutLocked = Boolean(this.alien3V88?.crashRecorderRead || phaseIndex(this.alien3V88?.phase) > 0);
      this.syncAlien3PrisonerRosterV89();
      return state;
    }

    alien3StationV89(id) {
      return this.alien3StationsV89.find((entry) => entry.id === id) || null;
    }

    unlockAlien3CodexV89(ids = []) {
      const state = this.alien3V89;
      if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3V89CodexEntry(id) || state.codexUnlocked.includes(id)) continue;
        state.codexUnlocked.push(id);
        unlocked.push(id);
        this.onEvent({ type: 'alien3-v89-evidence', action: 'codex-unlocked', codexId: id });
      }
      return unlocked;
    }

    recoverAlien3EvidenceV89(id, { silent = false } = {}) {
      const state = this.alien3V89;
      if (!state || !ALIEN3_V89_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      state.stats.evidence = state.evidenceRecovered.length;
      if (!silent) {
        this.onEvent({ type: 'alien3-v89-evidence', evidenceId: id, total: state.stats.evidence });
        this.onEvent({ type: 'objective-action', action: `alien3-v89:evidence:${id}` });
      }
      return true;
    }

    setAlien3ArchiveCutV89(cutId, actor = this.player) {
      const state = this.alien3V89;
      const cut = alien3V89Cut(cutId);
      if (!state || state.cutLocked || this.alien3V88?.crashRecorderRead) return false;
      state.cut = cut.id;
      state.codexUnlocked = state.codexUnlocked.filter((id) => !['f161-cut-theatrical', 'f161-cut-assembly', 'f161-host-spike', 'f161-host-babe'].includes(id));
      this.unlockAlien3CodexV89(cutCodex(cut.id));
      this.recoverAlien3EvidenceV89('cut-selected');
      this.recoverAlien3EvidenceV89('host-variant');
      if (actor) actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.45);
      this.onEvent({ type: 'alien3-v89-cut', cut: cut.id, label: cut.label, host: cut.host });
      this.onEvent({ type: 'objective-action', action: `alien3-v89:cut:${cut.id}` });
      this.audio?.ui?.();
      return true;
    }

    syncAlien3PrisonerRosterV89() {
      const state = this.alien3V89;
      const legacy = this.alien3V88;
      if (!state || !legacy) return;
      const p = state.prisoners;
      p.murphy = 'deceased';
      p.boggs = 'deceased';
      p.rains = 'deceased';
      if (phaseIndex(legacy.phase) >= phaseIndex('fire-maze')) {
        p.frank = 'deceased';
        p.eric = 'deceased';
      }
      if (phaseIndex(legacy.phase) >= phaseIndex('leadworks')) {
        for (const id of ['david', 'kevin', 'jude', 'troy', 'william', 'gregor']) p[id] = 'deceased';
      }
      if (!legacy.survivors?.dillon) p.dillon = 'deceased';
      if (state.cut === 'assembly' && state.assembly.juniorSacrifice) p.junior = 'deceased';
      if (state.cut === 'assembly' && state.assembly.golicReleased) p.golic = 'deceased';
      if (state.cut === 'assembly' && state.assembly.arthurKilled) p.arthur = 'deceased';
      p.morse = state.company.morseWounded ? 'wounded' : 'active';
      for (const actor of this.alien3PrisonersV89) actor.status = p[actor.id] || 'active';
    }

    alien3NearestStationV89(actor = this.player) {
      if (!actor || !this.alien3V89 || !this.alien3V88) return null;
      const v89 = this.alien3V89;
      const v88 = this.alien3V88;
      const candidates = this.alien3StationsV89.filter((station) => {
        if (station.kind === 'cut') return v88.phase === 'wreckage' && !v89.cutLocked;
        if (station.kind === 'waste-tank') return v89.cut === 'assembly' && v88.phase === 'fire-maze' && !v89.assembly.wasteTankTrapped;
        if (station.evidenceId === 'prison-roster') return phaseIndex(v88.phase) >= phaseIndex('trap-prep') && !v89.evidenceRecovered.includes('prison-roster');
        if (station.evidenceId === 'patna') return phaseIndex(v88.phase) >= phaseIndex('company') && !v89.evidenceRecovered.includes('patna');
        if (station.evidenceId === 'morse') return v88.phase === 'finale' && !v89.evidenceRecovered.includes('morse');
        return false;
      });
      return candidates
        .map((station) => ({ station, distance: distance(actor, station) }))
        .filter((entry) => entry.distance <= INTERACT_RANGE)
        .sort((a, b) => a.distance - b.distance)[0]?.station || null;
    }

    interactAlien3V89(actor = this.player) {
      const state = this.alien3V89;
      if (!state || !actor) return false;
      const station = this.alien3NearestStationV89(actor);
      if (!station) return false;
      if (station.kind === 'cut') return this.setAlien3ArchiveCutV89(station.cutId, actor);
      if (station.kind === 'evidence') {
        if (station.evidenceId === 'prison-roster') this.unlockAlien3CodexV89(evidenceCodex['prison-roster']);
        if (station.evidenceId === 'patna') this.unlockAlien3CodexV89(evidenceCodex.patna);
        if (station.evidenceId === 'morse') this.unlockAlien3CodexV89(evidenceCodex.morse);
        this.recoverAlien3EvidenceV89(station.evidenceId);
        actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.5);
        this.alien3CodexOverlayIdV89 = (evidenceCodex[station.evidenceId] || [])[0] || null;
        this.alien3CodexOverlayClockV89 = 6;
        this.audio?.ui?.();
        return true;
      }
      if (station.kind === 'waste-tank') {
        const runner = this.alien3RunnerV88;
        if (!runner?.alive || !this.alien3V88?.runner?.active) return this.locked?.('RUNNER HORS DE LA ZONE DE CONFINEMENT') ?? false;
        if (distance(runner, station) > WASTE_TRAP_RANGE) return this.locked?.('ATTIRER LE RUNNER DANS LA CUVE') ?? false;
        state.assembly.wasteTankTrapped = true;
        state.assembly.juniorSacrifice = true;
        state.assembly.releaseClock = 0;
        state.director.mode = 'contained';
        state.prisoners.junior = 'deceased';
        this.alien3V88.runner.active = false;
        runner.alien3DormantV88 = true;
        runner.alert = false;
        this.unlockAlien3CodexV89(['f161-waste-tank', 'f161-junior-redemption']);
        this.recoverAlien3EvidenceV89('waste-tank');
        this.recoverAlien3EvidenceV89('junior-sacrifice');
        this.onEvent({ type: 'alien3-v89-waste-trap', trapped: true, juniorSacrifice: true });
        this.onEvent({ type: 'alien3-v89-casualty', characterId: 'junior', cause: 'waste-tank-bait' });
        this.onEvent({ type: 'objective-action', action: 'alien3-v89:waste-tank-trapped' });
        this.audio?.alarm?.();
        return true;
      }
      return false;
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV89() || !this.alien3V89) return super.interact(actor);
      if (this.interactAlien3V89(actor)) return true;
      if (this.alien3V88?.phase === 'finale') {
        const finalStation = this.alien3StationV88?.('f161-final-ledge');
        if (finalStation && distance(actor, finalStation) <= INTERACT_RANGE) {
          if (this.alien3V89.finale.completed) return false;
          if (!this.alien3V89.finale.started) {
            this.alien3V89.finale.started = true;
            this.alien3V89.finale.clock = 0;
            this.alien3V89.finale.stage = 'platform';
            actor.actionClock = Math.max(Number(actor.actionClock) || 0, 3.4);
            this.onEvent({ type: 'alien3-v89-finale-stage', stage: 'platform', cut: this.alien3V89.cut });
            this.onEvent({ type: 'objective-action', action: 'alien3-v89:finale-started' });
            return true;
          }
          return this.locked?.('PLATEFORME EN MOUVEMENT · SÉQUENCE MIRE EN COURS') ?? false;
        }
      }
      return super.interact(actor);
    }

    advanceAlien3PhaseV88(nextPhase, reason = 'objective') {
      if (this.isAlien3MissionV89() && this.alien3V89?.cut === 'assembly'
          && this.alien3V88?.phase === 'fire-maze' && nextPhase === 'leadworks'
          && !this.alien3V89.assembly.golicReleased) {
        if (this.alien3DirectorEventThrottleV89 <= 0) {
          this.alien3DirectorEventThrottleV89 = 1.2;
          this.onEvent({ type: 'alien3-v89-runner-director', state: this.alien3V89.assembly.wasteTankTrapped ? 'contained' : 'waste-tank-required' });
        }
        return false;
      }
      const changed = super.advanceAlien3PhaseV88(nextPhase, reason);
      if (!changed || !this.isAlien3MissionV89()) return changed;
      if (nextPhase !== 'wreckage') this.alien3V89.cutLocked = true;
      if (nextPhase === 'company') {
        this.alien3V89.company.visible = true;
        this.onEvent({ type: 'alien3-v89-company-stage', stage: 'patna-arrival' });
      }
      this.syncAlien3PrisonerRosterV89();
      return changed;
    }

    fire(actor = this.player) {
      if (!this.isAlien3MissionV89() || !this.alien3V89) return super.fire(actor);
      const before = Number(this.alien3V88?.flares) || 0;
      const fired = super.fire(actor);
      if (!fired) return fired;
      const after = Number(this.alien3V88?.flares) || 0;
      if (after >= before) return fired;
      const facing = Number(actor?.facing) < 0 ? -1 : 1;
      const flare = {
        id: `f161-flare-v89-${Math.round((Number(this.alien3V88?.totalClock) || 0) * 1000)}-${this.alien3V89.stats.flaresUsed + 1}`,
        x: clamp((Number(actor?.x) || 0) + (Number(actor?.w) || 0) / 2 + facing * 170, 20, WORLD_WIDTH - 20),
        y: Math.max(40, (Number(actor?.y) || 0) + (Number(actor?.h) || 0) * 0.62),
        life: FLARE_LIFE,
        maxLife: FLARE_LIFE,
        consumed: false
      };
      this.alien3V89.flares = [...this.alien3V89.flares.filter((entry) => entry.life > 0 && !entry.consumed), flare].slice(-6);
      this.alien3V89.stats.flaresUsed += 1;
      this.alien3V89.director.mode = 'lure';
      this.alien3V89.director.modeClock = 0;
      this.onEvent({ type: 'alien3-v89-runner-director', state: 'flare-lure', flareId: flare.id, x: Math.round(flare.x) });
      return fired;
    }

    applyEnemyDamage(enemy, amount, source = {}) {
      if (this.isAlien3MissionV89() && enemy === this.alien3RunnerV88 && !String(source?.kind || '').startsWith('alien3-trap')) {
        this.alien3V89.director.conventionalHitsResisted += 1;
      }
      return super.applyEnemyDamage(enemy, amount, source);
    }

    useEquipment(equipmentId, actor = this.player) {
      if (this.isAlien3MissionV89() && /sentry|turret|mine|explosive|drone|rocket|grenade/i.test(String(equipmentId || ''))) {
        if (this.alien3V89) this.alien3V89.stats.blockedMilitaryActions += 1;
      }
      return super.useEquipment(equipmentId, actor);
    }

    damagePlayer(actor, amount, options = {}) {
      if (!this.isAlien3MissionV89() || !this.alien3V89 || !this.alien3V88) return super.damagePlayer(actor, amount, options);
      const runnerHit = /runner.*fiorina|fiorina.*runner/i.test(String(options?.source || ''));
      const canSpare = runnerHit
        && actor === this.player
        && ['first-blood', 'bishop'].includes(this.alien3V88.phase)
        && !this.alien3V89.director.sparingUsed
        && (Number(actor?.health) || 0) - Number(amount || 0) <= 0;
      if (canSpare) {
        const safeDamage = Math.max(0, (Number(actor.health) || 1) - 8);
        const dealt = safeDamage > 0 ? super.damagePlayer(actor, safeDamage, options) : 0;
        this.alien3V89.director.sparingUsed = true;
        this.alien3V89.director.sparingClock = 2.4;
        this.alien3V89.director.mode = 'cooldown';
        this.unlockAlien3CodexV89(['f161-queen-sparing']);
        this.recoverAlien3EvidenceV89('queen-sparing');
        if (this.alien3RunnerV88) {
          this.alien3RunnerV88.alert = false;
          this.alien3RunnerV88.staggerClock = Math.max(Number(this.alien3RunnerV88.staggerClock) || 0, 1.2);
        }
        this.onEvent({ type: 'alien3-v89-runner-spared-host', health: Math.round(actor.health), phase: this.alien3V88.phase });
        this.onEvent({ type: 'objective-action', action: 'alien3-v89:runner-spared-host' });
        return dealt;
      }
      const beforeHealth = Number(actor?.health) || 0;
      const dealt = super.damagePlayer(actor, amount, options);
      const delta = Math.max(0, beforeHealth - (Number(actor?.health) || 0));
      this.alien3V89.stats.damageTaken += delta;
      return dealt;
    }

    updateEnemy(enemy, delta) {
      if (!this.isAlien3MissionV89() || enemy !== this.alien3RunnerV88 || !this.alien3V89 || !this.alien3V88) return super.updateEnemy(enemy, delta);
      if (this.alien3V89.director.sparingClock > 0 || this.alien3V89.director.mode === 'contained') return;
      const lure = this.alien3V89.flares
        .filter((entry) => entry.life > 0 && !entry.consumed)
        .sort((a, b) => distance(enemy, a) - distance(enemy, b))[0] || null;
      if (lure && distance(enemy, lure) <= FLARE_LURE_RANGE && this.alien3V88.runner.active) {
        enemy.alert = true;
        enemy.alien3DirectorModeV89 = 'lure';
        const move = Math.sign(lure.x - enemy.x) * Math.max(75, (Number(enemy.alien3BaseSpeedV88) || 1.9) * 118) * clamp(delta, 0, 0.05);
        enemy.x = clamp(enemy.x + move, 0, WORLD_WIDTH - (Number(enemy.w) || 90));
        enemy.facing = Math.sign(lure.x - enemy.x) || enemy.facing || 1;
        if (distance(enemy, lure) <= 82) {
          lure.consumed = true;
          lure.life = 0;
          this.alien3V89.director.flaresConsumed += 1;
          enemy.staggerClock = Math.max(Number(enemy.staggerClock) || 0, 0.32);
          this.onEvent({ type: 'alien3-v89-runner-director', state: 'flare-consumed', flareId: lure.id });
        }
        return;
      }
      enemy.alien3DirectorModeV89 = this.alien3V89.director.mode;
      const base = Number(enemy.alien3BaseSpeedV88) || Number(enemy.speed) || 1.9;
      const multiplier = this.alien3V89.director.mode === 'shadow' ? 0.86
        : this.alien3V89.director.mode === 'ambush' ? 1.16
          : this.alien3V89.director.mode === 'hunt' ? 1.04 : 1;
      if (!this.alien3V88.moltenLeadApplied) enemy.speed = base * multiplier;
      return super.updateEnemy(enemy, delta);
    }

    updateAlien3DirectorV89(seconds) {
      const state = this.alien3V89;
      const legacy = this.alien3V88;
      const runner = this.alien3RunnerV88;
      if (!state || !legacy || !runner?.alive) return;
      const director = state.director;
      director.modeClock += seconds;
      director.relocationCooldown = Math.max(0, director.relocationCooldown - seconds);
      director.sparingClock = Math.max(0, director.sparingClock - seconds);
      if (!legacy.runner.active || legacy.runnerDefeated) {
        director.mode = state.assembly.wasteTankTrapped && !state.assembly.golicReleased ? 'contained' : 'dormant';
        director.tension = Math.max(0, director.tension - seconds * 18);
        return;
      }
      if (director.sparingClock > 0) return;
      const nearestFlare = state.flares.find((entry) => entry.life > 0 && !entry.consumed && distance(runner, entry) <= FLARE_LURE_RANGE);
      if (nearestFlare) director.mode = 'lure';
      else {
        const range = distance(this.player, runner);
        const motion = Math.min(20, Math.abs(Number(this.player?.vx) || 0) * 0.035);
        const proximity = range < 360 ? 22 : range < 700 ? 12 : -4;
        director.tension = clamp(director.tension + seconds * (4 + motion + proximity), 0, 100);
        const nextMode = director.tension >= 72 ? 'ambush' : director.tension >= 34 ? 'hunt' : 'shadow';
        if (nextMode !== director.mode) {
          director.mode = nextMode;
          director.modeClock = 0;
          this.onEvent({ type: 'alien3-v89-runner-director', state: nextMode, tension: Math.round(director.tension) });
        }
      }

      const range = distance(this.player, runner);
      if (director.mode === 'ambush' && director.relocationCooldown <= 0 && range > 1250) {
        const cameraX = Number(this.camera?.x) || Math.max(0, (Number(this.player?.x) || 0) - 430);
        const cameraRight = cameraX + 1280;
        const anchors = ALIEN3_RUNNER_AMBUSH_ANCHORS_V89
          .filter((entry) => Math.abs(entry.x - (Number(this.player?.x) || 0)) >= 420)
          .filter((entry) => entry.x < cameraX - 100 || entry.x > cameraRight + 100)
          .sort((a, b) => Math.abs(a.x - (Number(this.player?.x) || 0)) - Math.abs(b.x - (Number(this.player?.x) || 0)));
        const anchor = anchors[0];
        if (anchor) {
          runner.x = clamp(anchor.x, 20, WORLD_WIDTH - (Number(runner.w) || 90) - 20);
          const floorY = nearestPlatformY(this, anchor.x, anchor.y + (Number(runner.h) || 90));
          runner.y = floorY - (Number(runner.h) || 90);
          runner.spawnX = runner.x;
          runner.alert = true;
          director.relocationCooldown = 9;
          director.ambushes += 1;
          director.lastAnchorId = anchor.id;
          state.stats.routeAmbushes += 1;
          if (typeof this.initializeEnemyMissionNavigation === 'function') this.initializeEnemyMissionNavigation(runner);
          this.onEvent({ type: 'alien3-v89-runner-director', state: 'ambush-relocation', anchorId: anchor.id });
        }
      }
    }

    updateAlien3AssemblyV89(seconds) {
      const state = this.alien3V89;
      if (!state || state.cut !== 'assembly' || !state.assembly.wasteTankTrapped || state.assembly.golicReleased) return;
      state.assembly.releaseClock += seconds;
      if (state.assembly.releaseClock < 4.6) return;
      state.assembly.golicReleased = true;
      state.assembly.arthurKilled = true;
      state.director.mode = 'hunt';
      state.director.tension = Math.max(68, state.director.tension);
      state.prisoners.golic = 'deceased';
      state.prisoners.arthur = 'deceased';
      if (this.alien3V88) this.alien3V88.runner.active = true;
      if (this.alien3RunnerV88?.alive) {
        this.alien3RunnerV88.alien3DormantV88 = false;
        this.alien3RunnerV88.alert = true;
        this.alien3RunnerV88.x = 4140;
        this.alien3RunnerV88.y = nearestPlatformY(this, 4140, 630) - (Number(this.alien3RunnerV88.h) || 90);
      }
      this.unlockAlien3CodexV89(['f161-golic-release']);
      this.recoverAlien3EvidenceV89('golic-release');
      this.onEvent({ type: 'alien3-v89-golic-release', released: true, casualties: ['arthur', 'golic'] });
      this.onEvent({ type: 'alien3-v89-casualty', characterId: 'arthur', cause: 'golic-release' });
      this.onEvent({ type: 'alien3-v89-casualty', characterId: 'golic', cause: 'runner' });
      this.onEvent({ type: 'objective-action', action: 'alien3-v89:golic-release' });
      this.syncAlien3PrisonerRosterV89();
      this.audio?.alarm?.();
    }

    updateAlien3FinaleV89(seconds) {
      const state = this.alien3V89;
      if (!state?.finale.started || state.finale.completed || this.mission?.state !== 'active') return;
      state.finale.clock += seconds;
      const clock = state.finale.clock;
      if (clock >= 0.8 && state.finale.stage === 'platform') {
        state.finale.stage = 'morse-shot';
        state.company.morseWounded = true;
        state.prisoners.morse = 'wounded';
        this.onEvent({ type: 'alien3-v89-finale-stage', stage: 'morse-shot' });
      }
      if (clock >= 1.55 && state.finale.stage === 'morse-shot') {
        state.finale.stage = 'aaron-last-stand';
        state.company.aaronDefiant = true;
        this.onEvent({ type: 'alien3-v89-finale-stage', stage: 'aaron-last-stand' });
      }
      if (clock >= 2.35 && state.finale.stage === 'aaron-last-stand') {
        state.finale.stage = 'furnace';
        state.finale.queenEmerges = state.cut === 'theatrical';
        this.onEvent({ type: 'alien3-v89-finale-stage', stage: 'furnace', queenEmerges: state.finale.queenEmerges, cut: state.cut });
      }
      if (clock >= 3.25 && state.finale.stage === 'furnace') {
        state.finale.stage = 'complete';
        state.finale.completed = true;
        if (this.alien3V88) this.alien3V88.finaleCommitted = true;
        this.recoverAlien3EvidenceV89('morse', { silent: true });
        this.unlockAlien3CodexV89(['f161-morse-witness']);
        this.onEvent({ type: 'objective-action', action: 'alien3-v89:finale-complete' });
        this.completeAlien3MissionV89(this.player);
      }
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlien3MissionV89() || !this.alien3V89 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 0.25);
      this.alien3DirectorEventThrottleV89 = Math.max(0, this.alien3DirectorEventThrottleV89 - seconds);
      this.alien3CodexOverlayClockV89 = Math.max(0, this.alien3CodexOverlayClockV89 - seconds);
      for (const flare of this.alien3V89.flares) flare.life = Math.max(0, flare.life - seconds);
      this.alien3V89.flares = this.alien3V89.flares.filter((entry) => entry.life > 0 && !entry.consumed);
      this.updateAlien3DirectorV89(seconds);
      this.updateAlien3AssemblyV89(seconds);
      this.updateAlien3FinaleV89(seconds);
      this.updateAlien3PrisonersV89(seconds);
      this.syncAlien3PrisonerRosterV89();
      return result;
    }

    updateAlien3PrisonersV89(seconds) {
      if (!this.alien3PrisonersV89?.length || !this.alien3V88) return;
      const activeLate = phaseIndex(this.alien3V88.phase) >= phaseIndex('trap-prep');
      for (const actor of this.alien3PrisonersV89) {
        if (actor.status !== 'active' || !activeLate) continue;
        actor.phase += seconds * 1.4;
        actor.x = actor.patrolOrigin + Math.sin(actor.phase) * actor.patrolRadius;
        actor.facing = Math.cos(actor.phase) < 0 ? -1 : 1;
      }
    }

    activateTracker(actor = this.player) {
      if (!this.isAlien3MissionV89() || !this.alien3V89) return super.activateTracker(actor);
      // Alternate between the original V88 archive bank and the V89 extension
      // so the new evidence never hides the thirteen base dossiers.
      const useExtended = this.alien3V89.codexUnlocked.length > 0 && this.alien3TrackerPageV89 % 2 === 0;
      this.alien3TrackerPageV89 += 1;
      if (!useExtended) return super.activateTracker(actor);
      const ids = this.alien3V89.codexUnlocked;
      const current = ids.indexOf(this.alien3V89.currentCodexId);
      const id = ids[(current + 1 + ids.length) % ids.length];
      this.alien3V89.currentCodexId = id;
      if (!this.alien3V89.codexViewed.includes(id)) this.alien3V89.codexViewed.push(id);
      this.alien3CodexOverlayIdV89 = id;
      this.alien3CodexOverlayClockV89 = 6;
      this.onEvent({ type: 'alien3-v89-evidence', action: 'codex-viewed', codexId: id });
      this.audio?.ui?.();
      return true;
    }

    computeAlien3AchievementsV89() {
      const state = this.alien3V89;
      const legacy = this.alien3V88;
      if (!state || !legacy) return [];
      const ids = [];
      if (state.cut === 'assembly' && state.assembly.golicReleased) ids.push('assembly-complete');
      if (state.director.sparingUsed) ids.push('perfect-organism-recognition');
      if (state.director.conventionalHitsResisted === 0) ids.push('no-wasted-fire');
      if (state.stats.damageTaken < 35) ids.push('fury-survivor');
      if (state.evidenceRecovered.length >= ALIEN3_V89_EVIDENCE_IDS.length - 1) ids.push('mire-archivist-161');
      if (legacy.survivors?.morse && !legacy.survivors?.dillon && !legacy.survivors?.aaron) ids.push('morse-witness');
      return ids;
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV89() || !this.alien3V89) return super.completeAlien3MissionV88(actor);
      const emit = this.onEvent;
      let completionEvent = null;
      this.onEvent = (event) => {
        if (event?.type === 'mission-complete') { completionEvent = event; return; }
        emit(event);
      };
      let completed = false;
      try {
        completed = super.completeAlien3MissionV88(actor);
      } finally {
        this.onEvent = emit;
      }
      if (!completed) return false;
      const state = this.alien3V89;
      const legacy = this.alien3V88;
      state.achievementIds = this.computeAlien3AchievementsV89();
      const grade = alien3V89Grade({
        synchronization: legacy?.synchronization,
        evidence: state.evidenceRecovered.length,
        totalEvidence: ALIEN3_V89_EVIDENCE_IDS.length,
        damageTaken: state.stats.damageTaken
      });
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      const gradeBonus = { S: 300, A: 200, B: 120, C: 60, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + gradeBonus,
        alien3V89: true,
        archiveCut: state.cut,
        mireGrade: grade,
        evidenceRecovered: [...state.evidenceRecovered],
        extendedCodexUnlocked: [...state.codexUnlocked],
        runnerDirector: {
          ambushes: state.director.ambushes,
          flaresConsumed: state.director.flaresConsumed,
          conventionalHitsResisted: state.director.conventionalHitsResisted,
          sparingUsed: state.director.sparingUsed
        },
        assemblySequence: { ...state.assembly },
        finaleVariant: state.finale.queenEmerges ? 'theatrical-queen-emergence' : 'assembly-no-emergence',
        achievements: [...state.achievementIds]
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v89-achievement', achievementId });
      emit(completionEvent
        ? { ...completionEvent, rewards: this.mission.rewards }
        : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    completeMission(actor = this.player) {
      if (this.isAlien3MissionV89()) return this.completeAlien3MissionV89(actor);
      return super.completeMission(actor);
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV89() || !this.alien3V89) return super.getInteractionPrompt(actor);
      const station = this.alien3NearestStationV89(actor);
      if (station) {
        if (station.kind === 'cut') return `E  ${station.label}${this.alien3V89.cut === station.cutId ? ' · ACTIF' : ''}`;
        if (station.kind === 'waste-tank') {
          const range = Math.round(distance(this.alien3RunnerV88, station));
          return `E  FERMER LA CUVE · RUNNER ${range}/${WASTE_TRAP_RANGE}`;
        }
        return `E  ${station.label}`;
      }
      if (this.alien3V88?.phase === 'finale' && this.alien3V89.finale.started && !this.alien3V89.finale.completed) {
        return 'PLATEFORME DU FOUR · SÉQUENCE MIRE EN COURS';
      }
      return super.getInteractionPrompt(actor);
    }

    drawAlien3V89Station(ctx, station) {
      if (!ctx || !station) return;
      ctx.save();
      ctx.fillStyle = station.kind === 'cut' ? 'rgba(28,35,31,.9)' : 'rgba(48,43,34,.9)';
      ctx.strokeStyle = station.kind === 'waste-tank' ? '#b76f37' : '#8d7952';
      ctx.lineWidth = 2;
      ctx.fillRect(station.x, station.y, station.w, station.h);
      ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
      ctx.fillStyle = '#cbb684';
      ctx.fillRect(station.x + 8, station.y + 10, Math.max(8, station.w - 16), 7);
      ctx.restore();
    }

    drawAlien3PrisonersV89(ctx) {
      if (!ctx || !this.alien3V88) return;
      for (const actor of this.alien3PrisonersV89 || []) {
        if (actor.status === 'deceased' || phaseIndex(this.alien3V88.phase) < phaseIndex('trap-prep')) continue;
        ctx.save();
        ctx.globalAlpha = actor.status === 'wounded' ? 0.52 : 0.72;
        ctx.strokeStyle = actor.status === 'wounded' ? '#8e5d4a' : '#776b56';
        ctx.fillStyle = '#25231f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(actor.x, actor.y + 10, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(actor.x, actor.y + 18);
        ctx.lineTo(actor.x, actor.y + 58);
        ctx.moveTo(actor.x, actor.y + 32);
        ctx.lineTo(actor.x + actor.facing * 14, actor.y + 43);
        ctx.moveTo(actor.x, actor.y + 58);
        ctx.lineTo(actor.x - 10, actor.y + 76);
        ctx.moveTo(actor.x, actor.y + 58);
        ctx.lineTo(actor.x + 10, actor.y + 76);
        ctx.stroke();
        ctx.restore();
      }
    }

    drawAlien3FlaresV89(ctx) {
      if (!ctx || !this.alien3V89) return;
      for (const flare of this.alien3V89.flares) {
        if (flare.life <= 0 || flare.consumed) continue;
        const pulse = 0.65 + Math.sin((Number(this.animationTime) || 0) * 15 + flare.x) * 0.2;
        ctx.save();
        ctx.globalAlpha = clamp(flare.life / Math.max(0.1, flare.maxLife), 0.25, 1);
        ctx.fillStyle = '#f09a4d';
        ctx.beginPath();
        ctx.arc(flare.x, flare.y, 6 + pulse * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha *= 0.16;
        ctx.beginPath();
        ctx.arc(flare.x, flare.y, 72 + pulse * 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawAlien3CompanyV89(ctx) {
      if (!ctx || !this.alien3V89?.company.visible) return;
      for (const actor of this.alien3CompanyTeamV89 || []) {
        ctx.save();
        ctx.fillStyle = actor.role === 'commando' ? '#394348' : '#d5d7cf';
        ctx.strokeStyle = '#1b1f20';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(actor.x, actor.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(actor.x, actor.y + 18);
        ctx.lineTo(actor.x, actor.y + 66);
        ctx.moveTo(actor.x, actor.y + 34);
        ctx.lineTo(actor.x - 15, actor.y + 48);
        ctx.moveTo(actor.x, actor.y + 34);
        ctx.lineTo(actor.x + 15, actor.y + 48);
        ctx.stroke();
        ctx.restore();
      }
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV89() || !this.alien3V89 || !ctx) return;
      for (const station of this.alien3StationsV89) {
        const visible = station.kind === 'cut' ? this.alien3V88?.phase === 'wreckage' && !this.alien3V89.cutLocked
          : station.kind === 'waste-tank' ? this.alien3V89.cut === 'assembly' && this.alien3V88?.phase === 'fire-maze'
            : true;
        if (visible) this.drawAlien3V89Station(ctx, station);
      }
      this.drawAlien3PrisonersV89(ctx);
      this.drawAlien3FlaresV89(ctx);
      this.drawAlien3CompanyV89(ctx);
      if (this.alien3V89.cut === 'assembly' && this.alien3V89.assembly.wasteTankTrapped && !this.alien3V89.assembly.golicReleased) {
        ctx.save();
        ctx.fillStyle = 'rgba(49,43,35,.82)';
        ctx.strokeStyle = '#aa7b46';
        ctx.lineWidth = 3;
        ctx.fillRect(3970, 520, 250, 110);
        ctx.strokeRect(3971.5, 521.5, 247, 107);
        ctx.restore();
      }
      if (this.alien3V89.finale.started && !this.alien3V89.finale.completed) {
        ctx.save();
        ctx.globalAlpha = 0.1 + Math.min(0.18, this.alien3V89.finale.clock * 0.03);
        ctx.fillStyle = '#d2672d';
        ctx.fillRect(5650, 470, 520, 160);
        ctx.restore();
      }
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV89() || !this.alien3V89 || !ctx) return;
      const state = this.alien3V89;
      ctx.save();
      ctx.fillStyle = 'rgba(7,8,7,.88)';
      ctx.fillRect(902, 190, 360, 54);
      ctx.strokeStyle = '#69573d';
      ctx.strokeRect(902.5, 190.5, 359, 53);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#c7b88f';
      ctx.fillText(`CUT ${state.cut.toUpperCase()} · DIRECTEUR ${state.director.mode.toUpperCase()} · TENSION ${Math.round(state.director.tension)}%`, 914, 210);
      ctx.fillStyle = '#8f846b';
      ctx.fillText(`PREUVES ${state.evidenceRecovered.length}/${ALIEN3_V89_EVIDENCE_IDS.length} · AMBUSH ${state.director.ambushes} · FLARE→RUNNER ${state.director.flaresConsumed}`, 914, 229);
      ctx.restore();

      if (this.alien3CodexOverlayClockV89 > 0 && this.alien3CodexOverlayIdV89) {
        const entry = alien3V89CodexEntry(this.alien3CodexOverlayIdV89);
        if (entry) {
          ctx.save();
          ctx.fillStyle = 'rgba(4,7,6,.96)';
          ctx.fillRect(84, 300, 760, 156);
          ctx.strokeStyle = '#756545';
          ctx.strokeRect(84.5, 300.5, 759, 155);
          ctx.fillStyle = '#cfb777';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`MIRE V89 · ${entry.category} · ${entry.title}`.slice(0, 82), 104, 326);
          ctx.fillStyle = '#d0d3ca';
          ctx.font = '11px monospace';
          const words = entry.body.split(/\s+/);
          const lines = [];
          let line = '';
          for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (candidate.length > 94) { if (line) lines.push(line); line = word; }
            else line = candidate;
          }
          if (line) lines.push(line);
          lines.slice(0, 6).forEach((value, index) => ctx.fillText(value, 104, 350 + index * 18));
          ctx.restore();
        }
      }
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV89() || !this.alien3V89) return base;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base.specialOperation) ? base.specialOperation : {}),
          alien3V89: sanitizeAlien3StateV89(this.alien3V89)
        }
      };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V89 || rawState?.alien3V89;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV89() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V89) return result;
      this.alien3V89 = sanitizeAlien3StateV89(source);
      this.pendingAlien3ResumeV89 = this.alien3V89;
      if (this.alien3StationsV89?.length) {
        this.syncAlien3PrisonerRosterV89();
        this.unlockAlien3CodexV89(cutCodex(this.alien3V89.cut));
      }
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV89: true };
    }

    getAlien3SnapshotV89() {
      if (!this.isAlien3MissionV89() || !this.alien3V89) return { alien3V89: null };
      const state = sanitizeAlien3StateV89(this.alien3V89);
      const grade = alien3V89Grade({
        synchronization: this.alien3V88?.synchronization,
        evidence: state.evidenceRecovered.length,
        totalEvidence: ALIEN3_V89_EVIDENCE_IDS.length,
        damageTaken: state.stats.damageTaken
      });
      return {
        alien3V89: {
          ...state,
          cutDefinition: alien3V89Cut(state.cut),
          grade,
          codexTotalV89: ALIEN3_CODEX_V89.length,
          prisonerTotal: ALIEN3_PRISONER_ROSTER_V89.length,
          prisonerActive: Object.values(state.prisoners).filter((value) => value === 'active' || value === 'wounded').length
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlien3MissionV89() ? { ...report, alien3DlcV89: this.getAlien3SnapshotV89().alien3V89 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlien3SnapshotV89() };
    }
  };
}
