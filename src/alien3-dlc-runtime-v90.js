import {
  ALIEN3_CAMPAIGN_ID_V90,
  ALIEN3_CHALLENGES_V90,
  ALIEN3_CODEX_V90,
  ALIEN3_DLC_SCHEMA_V90,
  ALIEN3_FIRE_MANIFOLDS_V90,
  ALIEN3_FIRE_SEGMENTS_V90,
  ALIEN3_PRISONER_TASKS_V90,
  ALIEN3_V90_EVIDENCE_IDS,
  ALIEN3_V90_STATIONS,
  alien3V90Challenge,
  alien3V90CodexEntry,
  alien3V90Grade,
  createAlien3StateV90,
  sanitizeAlien3StateV90
} from './alien3-dlc-v90.js';

const INTERACT_RANGE = 170;
const WORLD_WIDTH = 6200;
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
const overlaps = (a, b) => Boolean(a && b
  && Number(a.x) < Number(b.x) + Number(b.w)
  && Number(a.x) + Number(a.w) > Number(b.x)
  && Number(a.y) < Number(b.y) + Number(b.h)
  && Number(a.y) + Number(a.h) > Number(b.y));

const PHASE_ORDER_V90 = Object.freeze([
  'wreckage', 'infirmary', 'first-blood', 'bishop', 'trap-prep', 'fire-maze',
  'leadworks', 'molten-lead', 'thermal-shock', 'company', 'finale'
]);
const phaseIndex = (phase) => Math.max(0, PHASE_ORDER_V90.indexOf(phase));

const CHAPTER_PRESENTATION_V90 = Object.freeze({
  wreckage: ['CH. 01 · LE CHOC', 'Explorer l’épave et fixer le montage de la reconstruction.'],
  infirmary: ['CH. 02 · LES ABSENTS', 'Reconstituer l’infirmerie sans anticiper le diagnostic royal.'],
  'first-blood': ['CH. 03 · LE DRAGON', 'Survivre au premier contact et rejoindre les galeries.'],
  bishop: ['CH. 04 · MÉMOIRE BRISÉE', 'Extraire les fragments de Bishop.'],
  'trap-prep': ['CH. 05 · LES SECTIONS', 'Répartir le quinitricetyline et armer les galeries.'],
  'fire-maze': ['CH. 06 · FEU CROISÉ', 'Traverser la propagation, puis retourner à l’EEV pour le diagnostic.'],
  leadworks: ['CH. 07 · LE MOULE', 'Préparer plomb et eau avant de rabattre le Runner.'],
  'molten-lead': ['CH. 08 · MÉTAL VIVANT', 'Gagner la commande d’extinction pendant que le Runner brûle.'],
  'thermal-shock': ['CH. 09 · CHOC THERMIQUE', 'Confirmer la destruction de la créature.'],
  company: ['CH. 10 · RÉCUPÉRATION', 'Affronter l’équipe Patna et refuser la récupération.'],
  finale: ['CH. 11 · DERNIER TÉMOIN', 'Sceller l’archive depuis la plateforme du four.']
});

export const ALIEN3_PERSISTENT_EVENT_TYPES_V90 = Object.freeze(new Set([
  'alien3-v90-fire-manifold', 'alien3-v90-fire-propagation', 'alien3-v90-fire-accident',
  'alien3-v90-medical-scan', 'alien3-v90-lead-prep', 'alien3-v90-sensory',
  'alien3-v90-prisoner-plan', 'alien3-v90-challenge', 'alien3-v90-presentation',
  'alien3-v90-evidence', 'alien3-v90-achievement'
]));

function nearestPlatformY(engine, x, fallback = 510) {
  const platforms = Array.isArray(engine?.platforms) ? engine.platforms : [];
  const candidates = platforms.filter((entry) => {
    const start = Number(entry?.x) || 0;
    const end = start + (Number(entry?.w) || 0);
    return x >= start - 28 && x <= end + 28 && Number.isFinite(Number(entry?.y));
  });
  if (!candidates.length) return fallback;
  return candidates.sort((a, b) => Math.abs(Number(a.y) - fallback) - Math.abs(Number(b.y) - fallback))[0].y;
}

export function withAlien3DlcRuntimeV90(BaseEngine) {
  return class Alien3DlcRuntimeV90 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV90 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V90;
      const challengeFlag = String(options?.strategicBriefing?.flags?.['alien3-v90-challenge'] || 'archive');
      this.alien3V90 = this.alien3ActiveV90 ? createAlien3StateV90({ challengeId: challengeFlag }) : null;
      this.pendingAlien3ResumeV90 = null;
      this.alien3StationsV90 = [];
      this.alien3V90OverlayClock = 0;
      this.alien3V90OverlayId = null;
      this.alien3V90LastFireSegmentCount = 0;
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV90()) return snapshot;
      if (this.pendingAlien3ResumeV90) this.alien3V90 = sanitizeAlien3StateV90(this.pendingAlien3ResumeV90);
      this.configureAlien3WorldV90();
      this.showAlien3PresentationV90('chapter', ...(CHAPTER_PRESENTATION_V90[this.alien3V88?.phase] || CHAPTER_PRESENTATION_V90.wreckage), 'mission-start');
      return { ...snapshot, ...this.getAlien3SnapshotV90() };
    }

    isAlien3MissionV90() {
      return Boolean(this.alien3ActiveV90 || this.isAlien3MissionV89?.());
    }

    configureAlien3WorldV90() {
      const state = this.alien3V90 || createAlien3StateV90();
      this.alien3V90 = state;
      this.alien3StationsV90 = ALIEN3_V90_STATIONS.map((entry) => ({ ...entry }));
      this.applyAlien3ChallengeV90();
      this.deferPrematureQueenCodexV90();
      this.updateAlien3PrisonerTaskSetV90(true);
      if (state.firePlan.ignited) this.syncAlien3FireHazardsV90();
      this.onEvent({
        type: 'alien3-v90-presentation', action: 'runtime-ready', challengeId: state.challengeId,
        manifolds: ALIEN3_FIRE_MANIFOLDS_V90.length, codex: ALIEN3_CODEX_V90.length
      });
      return state;
    }

    applyAlien3ChallengeV90() {
      if (!this.alien3V90) return null;
      const challenge = alien3V90Challenge(this.alien3V90.challengeId);
      const runner = this.alien3RunnerV88;
      if (runner) {
        if (!Number.isFinite(Number(runner.alien3BaseSpeedV90))) runner.alien3BaseSpeedV90 = Number(runner.alien3BaseSpeedV88) || Number(runner.speed) || 1.9;
        if (!Number.isFinite(Number(runner.alien3BaseDamageV90))) runner.alien3BaseDamageV90 = Number(runner.alien3BaseDamageV88) || Number(runner.damage) || 29;
        runner.alien3BaseSpeedV88 = runner.alien3BaseSpeedV90 * challenge.runnerSpeed;
        runner.alien3BaseDamageV88 = runner.alien3BaseDamageV90 * challenge.damageScale;
        runner.damage = runner.alien3BaseDamageV88;
      }
      return challenge;
    }

    deferPrematureQueenCodexV90() {
      if (!this.alien3V90 || !this.alien3V88 || this.alien3V90.diagnosis.scanComplete) return false;
      const before = this.alien3V88.codexUnlocked?.length || 0;
      this.alien3V88.codexUnlocked = (this.alien3V88.codexUnlocked || []).filter((id) => id !== 'queen-embryo');
      if (this.alien3V88.currentCodexId === 'queen-embryo') this.alien3V88.currentCodexId = null;
      if (before !== this.alien3V88.codexUnlocked.length) this.alien3V90.diagnosis.queenCodexDeferred = true;
      return before !== this.alien3V88.codexUnlocked.length;
    }

    alien3StationV90(id) {
      return this.alien3StationsV90.find((entry) => entry.id === id) || null;
    }

    unlockAlien3CodexV90(ids = []) {
      const state = this.alien3V90;
      if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3V90CodexEntry(id) || state.codexUnlocked.includes(id)) continue;
        state.codexUnlocked.push(id);
        unlocked.push(id);
        this.onEvent({ type: 'alien3-v90-evidence', action: 'codex-unlocked', codexId: id });
      }
      return unlocked;
    }

    recoverAlien3EvidenceV90(id, { silent = false } = {}) {
      const state = this.alien3V90;
      if (!state || !ALIEN3_V90_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      if (!silent) {
        this.onEvent({ type: 'alien3-v90-evidence', evidenceId: id, total: state.evidenceRecovered.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v90:evidence:${id}` });
      }
      return true;
    }

    showAlien3PresentationV90(kind, title, subtitle, beatId = null) {
      if (!this.alien3V90) return false;
      Object.assign(this.alien3V90.presentation, {
        cardClock: kind === 'chapter' ? 3.8 : 2.6,
        cardKind: kind,
        title: String(title || '').slice(0, 100),
        subtitle: String(subtitle || '').slice(0, 220),
        beatId: beatId ? String(beatId).slice(0, 100) : null
      });
      this.onEvent({ type: 'alien3-v90-presentation', action: 'card', kind, title, beatId });
      return true;
    }

    bumpAlien3NoiseV90(amount, reason = 'action') {
      if (!this.alien3V90) return 0;
      const sensory = this.alien3V90.sensory;
      sensory.noise = clamp(sensory.noise + Number(amount || 0), 0, 100);
      sensory.noisePeak = Math.max(sensory.noisePeak, sensory.noise);
      if (Number(amount) >= 8) sensory.loudActions += 1;
      if (this.alien3V89?.director) this.alien3V89.director.tension = clamp(this.alien3V89.director.tension + Number(amount || 0) * 0.24, 0, 100);
      if (Number(amount) >= 18) this.onEvent({ type: 'alien3-v90-sensory', action: 'noise-spike', reason, noise: Math.round(sensory.noise) });
      return sensory.noise;
    }

    setAlien3ChallengeV90(nextId, actor = this.player) {
      const state = this.alien3V90;
      if (!state || state.challengeLocked || this.alien3V88?.phase !== 'wreckage') return false;
      const next = alien3V90Challenge(nextId);
      state.challengeId = next.id;
      state.stats.challengeChanges += 1;
      this.applyAlien3ChallengeV90();
      this.unlockAlien3CodexV90(['f161-mire-challenges']);
      this.recoverAlien3EvidenceV90('mire-challenge', { silent: true });
      if (actor) actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.4);
      this.showAlien3PresentationV90('challenge', next.label, next.description, `challenge:${next.id}`);
      this.onEvent({ type: 'alien3-v90-challenge', challengeId: next.id, label: next.label });
      this.audio?.ui?.();
      return true;
    }

    cycleAlien3ChallengeV90(actor = this.player) {
      const ids = ALIEN3_CHALLENGES_V90.map((entry) => entry.id);
      const current = Math.max(0, ids.indexOf(this.alien3V90?.challengeId));
      return this.setAlien3ChallengeV90(ids[(current + 1) % ids.length], actor);
    }

    alien3NearestStationV90(actor = this.player) {
      if (!actor || !this.alien3V90 || !this.alien3V88) return null;
      const state = this.alien3V90;
      const phase = this.alien3V88.phase;
      const candidates = this.alien3StationsV90.filter((station) => {
        if (station.kind === 'challenge') return phase === 'wreckage' && !state.challengeLocked;
        if (station.kind === 'fuel-manifold') return phase === 'trap-prep' && !state.firePlan.manifolds[station.id];
        if (station.kind === 'medical-scan') return phase === 'fire-maze' && state.diagnosis.scanAvailable && !state.diagnosis.scanComplete;
        if (station.kind === 'lead-primer') return phase === 'leadworks' && !state.leadworks.vatPrimed;
        if (station.kind === 'water-header') return phase === 'leadworks' && !state.leadworks.waterPressurized;
        return false;
      });
      return candidates.map((station) => ({ station, range: distance(actor, station) }))
        .filter((entry) => entry.range <= INTERACT_RANGE)
        .sort((a, b) => a.range - b.range)[0]?.station || null;
    }

    interactAlien3V90(actor = this.player) {
      const state = this.alien3V90;
      if (!state || !actor) return false;
      const station = this.alien3NearestStationV90(actor);
      if (!station) return false;
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.55);
      this.bumpAlien3NoiseV90(station.kind === 'fuel-manifold' ? 12 : 7, station.kind);

      if (station.kind === 'challenge') return this.cycleAlien3ChallengeV90(actor);
      if (station.kind === 'fuel-manifold') {
        state.firePlan.manifolds[station.id] = true;
        state.stats.manifoldsArmed = Object.values(state.firePlan.manifolds).filter(Boolean).length;
        state.firePlan.prepared = state.stats.manifoldsArmed === ALIEN3_FIRE_MANIFOLDS_V90.length;
        if (!state.prisonerPlan.assignmentsIssued) {
          state.prisonerPlan.assignmentsIssued = true;
          this.unlockAlien3CodexV90(['f161-fire-assignments', 'f161-quinitricetyline']);
          this.recoverAlien3EvidenceV90('fire-assignments');
          this.recoverAlien3EvidenceV90('quinitricetyline');
        }
        state.prisonerPlan.taskCompletions.push(`manifold:${station.section}`);
        this.onEvent({ type: 'alien3-v90-fire-manifold', manifoldId: station.id, section: station.section, armed: state.stats.manifoldsArmed, total: ALIEN3_FIRE_MANIFOLDS_V90.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v90:manifold:${station.section}` });
        this.audio?.ui?.();
        return true;
      }
      if (station.kind === 'medical-scan') {
        state.diagnosis.scanComplete = true;
        state.diagnosis.returnedToEev = true;
        state.diagnosis.queenCodexDeferred = false;
        state.stats.scanTrips += 1;
        this.unlockAlien3CodexV90(['f161-eev-medical-scan', 'f161-royal-host-signal']);
        this.recoverAlien3EvidenceV90('eev-medical-scan');
        if (this.alien3V89?.director?.sparingUsed) this.recoverAlien3EvidenceV90('royal-host-signal');
        this.unlockAlien3CodexV88?.(['queen-embryo']);
        this.showAlien3PresentationV90('evidence', 'DIAGNOSTIC EEV', 'Le signal royal est maintenant confirmé. Retournez vers la fonderie.', 'medical-scan');
        this.onEvent({ type: 'alien3-v90-medical-scan', queenConfirmed: true, phase: this.alien3V88.phase });
        this.audio?.ui?.();
        return true;
      }
      if (station.kind === 'lead-primer') {
        state.leadworks.vatPrimed = true;
        state.leadworks.dillonCommitted = true;
        state.stats.leadPrepActions += 1;
        this.unlockAlien3CodexV90(['f161-lead-primer', 'f161-dillon-last-stand']);
        this.recoverAlien3EvidenceV90('lead-primer');
        this.recoverAlien3EvidenceV90('dillon-last-stand', { silent: true });
        this.onEvent({ type: 'alien3-v90-lead-prep', action: 'vat-primed' });
        this.audio?.ui?.();
      } else if (station.kind === 'water-header') {
        state.leadworks.waterPressurized = true;
        state.leadworks.morseAtLeadControl = true;
        state.stats.leadPrepActions += 1;
        this.unlockAlien3CodexV90(['f161-water-header', 'f161-morse-lead-control']);
        this.recoverAlien3EvidenceV90('water-header');
        this.recoverAlien3EvidenceV90('morse-lead-control', { silent: true });
        this.onEvent({ type: 'alien3-v90-lead-prep', action: 'water-pressurized' });
        this.audio?.ui?.();
      }
      state.leadworks.moldReady = state.leadworks.vatPrimed && state.leadworks.waterPressurized;
      return true;
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV90() || !this.alien3V90 || !this.alien3V88) return super.interact(actor);
      const legacyStation = this.alien3NearestActiveStationV88?.(actor);
      // Existing V88 cache pickups take priority when a new V90 manifold is
      // physically nearby; once collected, the manifold becomes the nearest
      // active authored station on the next interaction.
      if (legacyStation?.kind === 'cache') {
        const result = super.interact(actor);
        if (result) this.bumpAlien3NoiseV90(5, 'cache');
        return result;
      }
      if (this.interactAlien3V90(actor)) return true;

      if (legacyStation?.kind === 'igniter' && this.alien3V88.phase === 'trap-prep' && !this.alien3V90.firePlan.prepared) {
        const armed = Object.values(this.alien3V90.firePlan.manifolds).filter(Boolean).length;
        return this.locked?.(`MANIFOLDS QUINITRICETYLINE ${armed}/${ALIEN3_FIRE_MANIFOLDS_V90.length}`) ?? false;
      }
      if (legacyStation?.kind === 'mold' && this.alien3V88.phase === 'leadworks' && !this.alien3V90.leadworks.moldReady) {
        return this.locked?.('PRÉPARER LA CUVE DE PLOMB ET LE COLLECTEUR D’EAU') ?? false;
      }
      if (legacyStation?.kind === 'sprinkler' && this.alien3V88.phase === 'molten-lead' && !this.alien3V90.leadworks.waterPressurized) {
        return this.locked?.('COLLECTEUR D’EAU NON PRESSURISÉ') ?? false;
      }

      const beforePhase = this.alien3V88.phase;
      const beforeAutopsy = this.alien3V88.autopsyComplete;
      const beforeIgnited = this.alien3V88.fireMazeIgnited;
      const result = super.interact(actor);
      if (!result) return result;
      this.bumpAlien3NoiseV90(legacyStation?.kind === 'igniter' ? 24 : legacyStation?.kind === 'mold' ? 22 : 5, legacyStation?.kind || 'interact');

      if (!beforeAutopsy && this.alien3V88.autopsyComplete) this.deferPrematureQueenCodexV90();
      if (!beforeIgnited && this.alien3V88.fireMazeIgnited) {
        this.alien3V90.firePlan.ignited = true;
        this.alien3V90.firePlan.accidentClock = 0;
        this.alien3V90.challengeLocked = true;
        this.onEvent({ type: 'alien3-v90-fire-propagation', action: 'ignited', manifolds: this.alien3V90.stats.manifoldsArmed });
      }
      if (beforePhase !== this.alien3V88.phase) this.updateAlien3PrisonerTaskSetV90(true);
      return result;
    }

    fire(actor = this.player) {
      if (!this.isAlien3MissionV90() || !this.alien3V90) return super.fire(actor);
      const challenge = alien3V90Challenge(this.alien3V90.challengeId);
      if (!challenge.flaresAllowed) {
        this.bumpAlien3NoiseV90(5, 'empty-flare-action');
        return this.locked?.('PROTOCOLE MIRE PURISTE · FLARES DÉSACTIVÉS') ?? false;
      }
      const fired = super.fire(actor);
      if (fired) this.bumpAlien3NoiseV90(18, 'flare');
      return fired;
    }

    advanceAlien3PhaseV88(nextPhase, reason = 'objective') {
      if (this.isAlien3MissionV90() && this.alien3V90 && this.alien3V88?.phase === 'fire-maze' && nextPhase === 'leadworks') {
        if (!this.alien3V90.firePlan.accidentResolved) return false;
        if (!this.alien3V90.diagnosis.scanComplete) {
          if (!this.alien3V90.diagnosis.scanAvailable) this.alien3V90.diagnosis.scanAvailable = true;
          return false;
        }
      }
      const changed = super.advanceAlien3PhaseV88(nextPhase, reason);
      if (!changed || !this.isAlien3MissionV90() || !this.alien3V90) return changed;
      this.alien3V90.challengeLocked = nextPhase !== 'wreckage';
      const card = CHAPTER_PRESENTATION_V90[nextPhase];
      if (card) this.showAlien3PresentationV90('chapter', card[0], card[1], `phase:${nextPhase}`);
      this.updateAlien3PrisonerTaskSetV90(true);
      if (nextPhase === 'leadworks') {
        this.alien3V90.prisonerPlan.morale = Math.max(32, this.alien3V90.prisonerPlan.morale - 12);
        this.unlockAlien3CodexV90(['f161-fire-accident']);
      }
      return changed;
    }

    updateAlien3FirePlanV90(seconds) {
      const state = this.alien3V90;
      if (!state?.firePlan.ignited || !this.alien3V88 || this.alien3V88.phase !== 'fire-maze') return;
      const fire = state.firePlan;
      fire.accidentClock += seconds;
      fire.burnCooldown = Math.max(0, fire.burnCooldown - seconds);
      const active = ALIEN3_FIRE_SEGMENTS_V90.filter((segment) => fire.accidentClock >= segment.delay).map((segment) => segment.id);
      fire.activeSegments = active;
      if (active.length !== this.alien3V90LastFireSegmentCount) {
        this.alien3V90LastFireSegmentCount = active.length;
        this.onEvent({ type: 'alien3-v90-fire-propagation', activeSegments: active.length, total: ALIEN3_FIRE_SEGMENTS_V90.length });
      }
      if (!fire.casualtiesLogged && fire.accidentClock >= 2.2) {
        fire.casualtiesLogged = true;
        for (const id of ['frank', 'eric']) if (!state.prisonerPlan.casualtyEvents.includes(id)) state.prisonerPlan.casualtyEvents.push(id);
        state.prisonerPlan.panic = Math.max(state.prisonerPlan.panic, 66);
        state.prisonerPlan.morale = Math.min(state.prisonerPlan.morale, 42);
        this.onEvent({ type: 'alien3-v90-prisoner-plan', action: 'fire-casualties', casualties: ['frank', 'eric'] });
      }
      if (!fire.accidentResolved && fire.accidentClock >= 3.2) {
        fire.accidentResolved = true;
        state.diagnosis.scanAvailable = true;
        this.unlockAlien3CodexV90(['f161-fire-accident']);
        this.recoverAlien3EvidenceV90('fire-accident');
        this.showAlien3PresentationV90('event', 'PLAN INCENDIAIRE ROMPU', 'La propagation a échoué. Revenez à l’EEV et utilisez le scanner médical.', 'fire-accident');
        this.onEvent({ type: 'alien3-v90-fire-accident', resolved: true, returnToEev: true });
      }
      const playerFeet = this.player ? { x: this.player.x + 8, y: this.player.y + this.player.h - 18, w: Math.max(8, this.player.w - 16), h: 18 } : null;
      const hazard = ALIEN3_FIRE_SEGMENTS_V90.find((segment) => active.includes(segment.id) && overlaps(playerFeet, segment));
      if (hazard && fire.burnCooldown <= 0 && this.player?.alive) {
        fire.burnCooldown = 0.8;
        state.stats.fireBurnsTaken += 1;
        super.damagePlayer(this.player, 10, { bypassCover: true, source: 'fiorina-fire-plan' });
      }
    }

    syncAlien3FireHazardsV90() {
      this.alien3V90LastFireSegmentCount = this.alien3V90?.firePlan?.activeSegments?.length || 0;
      return this.alien3V90LastFireSegmentCount;
    }

    updateAlien3SensoryV90(seconds) {
      const state = this.alien3V90;
      const legacy = this.alien3V88;
      if (!state || !legacy || !this.player) return;
      const sensory = state.sensory;
      const speed = Math.abs(Number(this.player.vx) || 0);
      const crouched = Boolean(this.player.crouching);
      const movementNoise = crouched ? Math.min(13, speed * 0.018) : Math.min(34, speed * 0.052);
      const environmental = legacy.phase === 'fire-maze' && state.firePlan.ignited ? 7 : legacy.phase === 'leadworks' ? 3 : 0;
      sensory.noise = clamp(Math.max(sensory.noise - seconds * 14, movementNoise + environmental), 0, 100);
      sensory.noisePeak = Math.max(sensory.noisePeak, sensory.noise);
      if (crouched && sensory.noise < 14 && legacy.runner.active) {
        sensory.silentSeconds += seconds;
        state.stats.stealthSeconds += seconds;
      } else sensory.silentSeconds = Math.max(0, sensory.silentSeconds - seconds * 0.5);

      const zoneId = this.missionLevelVisualState?.activeZoneId || null;
      if (zoneId && zoneId !== sensory.currentZoneId) {
        sensory.lastZoneId = sensory.currentZoneId;
        sensory.currentZoneId = zoneId;
        sensory.routeMemory[zoneId] = Math.min(99, (Number(sensory.routeMemory[zoneId]) || 0) + 1);
        if (sensory.routeMemory[zoneId] >= 3) {
          sensory.repeatedRoutePressure = clamp(sensory.repeatedRoutePressure + 1.5, 0, 30);
          state.stats.routeRepetitions += 1;
        }
      }
      if (this.alien3V89?.director && legacy.runner.active) {
        const pressure = sensory.noise * 0.055 + sensory.repeatedRoutePressure * 0.12;
        this.alien3V89.director.tension = clamp(this.alien3V89.director.tension + seconds * pressure, 0, 100);
      }
    }

    updateEnemy(enemy, delta) {
      if (this.isAlien3MissionV90() && enemy === this.alien3RunnerV88 && this.alien3V90 && this.alien3V88) {
        const sensory = this.alien3V90.sensory;
        const range = distance(enemy, this.player);
        if (this.player?.crouching && sensory.noise < 12 && range > 720 && this.alien3V89?.director?.mode === 'shadow') {
          sensory.stealthWindows += 1;
          enemy.alert = false;
          return;
        }
      }
      return super.updateEnemy(enemy, delta);
    }

    updateAlien3PrisonerTaskSetV90(force = false) {
      const state = this.alien3V90;
      const phase = this.alien3V88?.phase;
      if (!state || !phase) return 'none';
      const next = phase === 'trap-prep' ? 'trapPrep'
        : phase === 'fire-maze' ? 'fireMaze'
          : ['leadworks', 'molten-lead', 'thermal-shock'].includes(phase) ? 'leadworks'
            : ['company', 'finale'].includes(phase) ? 'finale' : 'none';
      if (force || state.prisonerPlan.activeTaskSet !== next) {
        state.prisonerPlan.activeTaskSet = next;
        this.onEvent({ type: 'alien3-v90-prisoner-plan', action: 'task-set', taskSet: next });
      }
      return next;
    }

    updateAlien3PrisonerPlanV90(seconds) {
      const state = this.alien3V90;
      if (!state || !Array.isArray(this.alien3PrisonersV89)) return;
      const taskSet = this.updateAlien3PrisonerTaskSetV90();
      const targets = ALIEN3_PRISONER_TASKS_V90[taskSet] || {};
      for (const actor of this.alien3PrisonersV89) {
        if (!['active', 'wounded'].includes(actor.status)) continue;
        const targetX = Number(targets[actor.id]);
        if (!Number.isFinite(targetX)) continue;
        const dx = targetX - Number(actor.x || 0);
        const speed = actor.status === 'wounded' ? 34 : Math.max(45, 78 - state.prisonerPlan.panic * 0.2);
        const step = Math.sign(dx) * Math.min(Math.abs(dx), speed * seconds);
        actor.x = clamp(Number(actor.x || 0) + step, 30, WORLD_WIDTH - 30);
        actor.facing = Math.sign(dx) || actor.facing || 1;
        actor.patrolOrigin = actor.x;
      }
      if (state.firePlan.accidentResolved) state.prisonerPlan.panic = Math.max(18, state.prisonerPlan.panic - seconds * 1.4);
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlien3MissionV90() || !this.alien3V90 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 0.25);
      this.alien3V90.presentation.cardClock = Math.max(0, this.alien3V90.presentation.cardClock - seconds);
      this.alien3V90OverlayClock = Math.max(0, this.alien3V90OverlayClock - seconds);
      this.alien3V90.atmosphere.ashSeed = (this.alien3V90.atmosphere.ashSeed + seconds * 13) % 100000;
      this.alien3V90.atmosphere.steamPulse += seconds;
      this.alien3V90.atmosphere.sparkPulse += seconds;
      this.alien3V90.atmosphere.rainPulse += seconds;
      this.updateAlien3FirePlanV90(seconds);
      this.updateAlien3SensoryV90(seconds);
      this.updateAlien3PrisonerPlanV90(seconds);
      this.deferPrematureQueenCodexV90();
      return result;
    }

    activateTracker(actor = this.player) {
      if (!this.isAlien3MissionV90() || !this.alien3V90 || !this.alien3V90.codexUnlocked.length) return super.activateTracker(actor);
      const baseResult = super.activateTracker(actor);
      const ids = this.alien3V90.codexUnlocked;
      const current = ids.indexOf(this.alien3V90.currentCodexId);
      const id = ids[(current + 1 + ids.length) % ids.length];
      this.alien3V90.currentCodexId = id;
      if (!this.alien3V90.codexViewed.includes(id)) this.alien3V90.codexViewed.push(id);
      this.alien3V90OverlayId = id;
      this.alien3V90OverlayClock = 6;
      this.onEvent({ type: 'alien3-v90-evidence', action: 'codex-viewed', codexId: id });
      return baseResult || true;
    }

    computeAlien3AchievementsV90() {
      const state = this.alien3V90;
      if (!state) return [];
      const ids = [];
      if (state.firePlan.prepared && state.firePlan.accidentResolved) ids.push('fiorina-fire-chief');
      if (state.diagnosis.scanComplete) ids.push('truth-in-the-eev');
      if (state.leadworks.moldReady) ids.push('foundry-ready');
      if (state.stats.fireBurnsTaken === 0) ids.push('through-the-flames');
      if (state.stats.stealthSeconds >= 8) ids.push('silent-on-fury');
      if (state.evidenceRecovered.length === ALIEN3_V90_EVIDENCE_IDS.length) ids.push('mire-archive-90');
      if (state.challengeId === 'mire-purist') ids.push('mire-purist');
      if (state.challengeId === 'fury-nightmare') ids.push('fury-nightmare');
      return ids;
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV90() || !this.alien3V90) return super.completeAlien3MissionV89(actor);
      const emit = this.onEvent;
      let completionEvent = null;
      this.onEvent = (event) => {
        if (event?.type === 'mission-complete') { completionEvent = event; return; }
        emit(event);
      };
      let completed = false;
      try {
        completed = super.completeAlien3MissionV89(actor);
      } finally {
        this.onEvent = emit;
      }
      if (!completed) return false;
      const state = this.alien3V90;
      state.achievementIds = this.computeAlien3AchievementsV90();
      const grade = alien3V90Grade({
        synchronization: this.alien3V88?.synchronization,
        evidenceV89: this.alien3V89?.evidenceRecovered?.length || 0,
        totalV89: 10,
        evidenceV90: state.evidenceRecovered.length,
        totalV90: ALIEN3_V90_EVIDENCE_IDS.length,
        damageTaken: this.alien3V89?.stats?.damageTaken || 0,
        stealthSeconds: state.stats.stealthSeconds
      });
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      const challengeBonus = state.challengeId === 'fury-nightmare' ? 260 : state.challengeId === 'mire-purist' ? 180 : 80;
      const gradeBonus = { 'S+': 420, S: 300, A: 200, B: 110, C: 45, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + challengeBonus + gradeBonus,
        alien3V90: true,
        challengeId: state.challengeId,
        mireGradeV90: grade,
        firePlan: {
          manifoldsArmed: state.stats.manifoldsArmed,
          accidentResolved: state.firePlan.accidentResolved,
          burnsTaken: state.stats.fireBurnsTaken
        },
        medicalScanConfirmed: state.diagnosis.scanComplete,
        leadworksPrepared: state.leadworks.moldReady,
        sensory: {
          noisePeak: Math.round(state.sensory.noisePeak),
          routeRepetitions: state.stats.routeRepetitions,
          stealthSeconds: Math.round(state.stats.stealthSeconds)
        },
        v90EvidenceRecovered: [...state.evidenceRecovered],
        v90CodexUnlocked: [...state.codexUnlocked],
        v90Achievements: [...state.achievementIds]
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v90-achievement', achievementId });
      emit(completionEvent
        ? { ...completionEvent, rewards: this.mission.rewards }
        : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV90() || !this.alien3V90 || !this.alien3V88) return super.getInteractionPrompt(actor);
      const station = this.alien3NearestStationV90(actor);
      if (station) {
        if (station.kind === 'challenge') return `E  ${station.label} · ${alien3V90Challenge(this.alien3V90.challengeId).label}`;
        if (station.kind === 'fuel-manifold') return `E  ${station.label} · ${this.alien3V90.stats.manifoldsArmed}/${ALIEN3_FIRE_MANIFOLDS_V90.length}`;
        return `E  ${station.label}`;
      }
      if (this.alien3V88.phase === 'trap-prep' && !this.alien3V90.firePlan.prepared) return `ARMER LES MANIFOLDS · ${this.alien3V90.stats.manifoldsArmed}/${ALIEN3_FIRE_MANIFOLDS_V90.length}`;
      if (this.alien3V88.phase === 'fire-maze' && this.alien3V90.firePlan.accidentResolved && !this.alien3V90.diagnosis.scanComplete) return 'RETOURNER À L’EEV · SCANNER MÉDICAL';
      if (this.alien3V88.phase === 'leadworks' && !this.alien3V90.leadworks.moldReady) return `PRÉPARATION FONDERIE · PLOMB ${this.alien3V90.leadworks.vatPrimed ? 'OK' : 'NON'} · EAU ${this.alien3V90.leadworks.waterPressurized ? 'OK' : 'NON'}`;
      return super.getInteractionPrompt(actor);
    }

    drawAlien3V90Station(ctx, station) {
      if (!ctx || !station) return;
      ctx.save();
      ctx.fillStyle = station.kind === 'fuel-manifold' ? 'rgba(74,45,28,.9)' : station.kind === 'medical-scan' ? 'rgba(31,43,42,.9)' : 'rgba(46,42,33,.9)';
      ctx.strokeStyle = station.kind === 'fuel-manifold' ? '#d17c3f' : station.kind === 'medical-scan' ? '#7ba9a3' : '#aa8b54';
      ctx.lineWidth = 2;
      ctx.fillRect(station.x, station.y, station.w, station.h);
      ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
      ctx.fillStyle = '#d8c391';
      ctx.fillRect(station.x + 8, station.y + 10, Math.max(10, station.w - 16), 6);
      ctx.restore();
    }

    drawAlien3FirePlanV90(ctx) {
      if (!ctx || !this.alien3V90?.firePlan.ignited || this.alien3V88?.phase !== 'fire-maze') return;
      const active = new Set(this.alien3V90.firePlan.activeSegments);
      const time = Number(this.animationTime) || 0;
      for (const segment of ALIEN3_FIRE_SEGMENTS_V90) {
        if (!active.has(segment.id)) continue;
        ctx.save();
        const pulse = 0.72 + Math.sin(time * 11 + segment.x * 0.01) * 0.18;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#d86f2c';
        ctx.fillRect(segment.x, segment.y - 34, segment.w, segment.h + 34);
        ctx.globalAlpha = 0.26;
        ctx.fillStyle = '#f0b04f';
        ctx.fillRect(segment.x - 18, segment.y - 76, segment.w + 36, 74);
        ctx.restore();
      }
    }

    drawAlien3AtmosphereV90(ctx) {
      if (!ctx || !this.alien3V90 || !this.missionLevelVisualState) return;
      const zone = this.missionLevelVisualState.activeZoneId;
      const time = Number(this.animationTime) || 0;
      ctx.save();
      if (zone === 'f161-coast') {
        ctx.strokeStyle = 'rgba(190,202,197,.22)';
        ctx.lineWidth = 1;
        for (let index = 0; index < 22; index += 1) {
          const x = ((index * 61 + time * 170) % 1320) - 20;
          const y = (index * 37 + time * 210) % 720;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 13, y + 34); ctx.stroke();
        }
      }
      if (zone === 'f161-service' || zone === 'f161-leadworks') {
        ctx.fillStyle = 'rgba(199,202,190,.08)';
        for (let index = 0; index < 7; index += 1) {
          const x = 2890 + index * 310 + Math.sin(time * 0.8 + index) * 28;
          const y = 430 - ((time * 28 + index * 31) % 180);
          ctx.beginPath(); ctx.arc(x, y, 26 + index * 2, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (zone === 'f161-furnace' || zone === 'f161-leadworks') {
        ctx.fillStyle = 'rgba(238,126,51,.55)';
        for (let index = 0; index < 18; index += 1) {
          const x = 4040 + ((index * 137 + time * 53) % 2080);
          const y = 520 - ((time * (22 + index % 5) + index * 29) % 270);
          ctx.fillRect(x, y, 2 + index % 2, 2 + index % 3);
        }
      }
      ctx.restore();
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV90() || !this.alien3V90 || !ctx) return;
      for (const station of this.alien3StationsV90) {
        const visible = station.kind === 'challenge' ? this.alien3V88?.phase === 'wreckage' && !this.alien3V90.challengeLocked
          : station.kind === 'fuel-manifold' ? this.alien3V88?.phase === 'trap-prep'
            : station.kind === 'medical-scan' ? this.alien3V88?.phase === 'fire-maze' && this.alien3V90.diagnosis.scanAvailable
              : ['lead-primer', 'water-header'].includes(station.kind) ? this.alien3V88?.phase === 'leadworks' : false;
        if (visible) this.drawAlien3V90Station(ctx, station);
      }
      this.drawAlien3FirePlanV90(ctx);
      this.drawAlien3AtmosphereV90(ctx);
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV90() || !this.alien3V90 || !ctx) return;
      const state = this.alien3V90;
      ctx.save();
      ctx.fillStyle = 'rgba(6,7,6,.9)';
      ctx.fillRect(902, 250, 360, 66);
      ctx.strokeStyle = '#715b39';
      ctx.strokeRect(902.5, 250.5, 359, 65);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#d3bd82';
      ctx.fillText(`V90 · ${alien3V90Challenge(state.challengeId).label} · BRUIT ${Math.round(state.sensory.noise)}%`, 914, 270);
      ctx.fillStyle = '#9f9274';
      ctx.fillText(`MANIFOLDS ${state.stats.manifoldsArmed}/${ALIEN3_FIRE_MANIFOLDS_V90.length} · SCAN ${state.diagnosis.scanComplete ? 'OK' : '—'} · PLOMB/EAU ${state.leadworks.vatPrimed ? '1' : '0'}/${state.leadworks.waterPressurized ? '1' : '0'}`, 914, 288);
      ctx.fillText(`PREUVES V90 ${state.evidenceRecovered.length}/${ALIEN3_V90_EVIDENCE_IDS.length} · SILENCE ${Math.floor(state.stats.stealthSeconds)}s`, 914, 305);
      ctx.restore();

      if (state.presentation.cardClock > 0 && state.presentation.title) {
        const alpha = clamp(state.presentation.cardClock / 0.45, 0, 1);
        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = 'rgba(3,4,3,.93)';
        ctx.fillRect(160, 84, 960, 92);
        ctx.strokeStyle = '#816b43';
        ctx.strokeRect(160.5, 84.5, 959, 91);
        ctx.fillStyle = '#ddc486';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(state.presentation.title.slice(0, 86), 184, 116);
        ctx.fillStyle = '#b6b7ad';
        ctx.font = '11px monospace';
        ctx.fillText(state.presentation.subtitle.slice(0, 128), 184, 144);
        ctx.restore();
      }

      if (this.alien3V90OverlayClock > 0 && this.alien3V90OverlayId) {
        const entry = alien3V90CodexEntry(this.alien3V90OverlayId);
        if (entry) {
          ctx.save();
          ctx.fillStyle = 'rgba(4,6,5,.97)';
          ctx.fillRect(94, 330, 770, 150);
          ctx.strokeStyle = '#7c6741';
          ctx.strokeRect(94.5, 330.5, 769, 149);
          ctx.fillStyle = '#d6ba76';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`MIRE V90 · ${entry.category} · ${entry.title}`.slice(0, 86), 114, 356);
          ctx.fillStyle = '#d0d1c8';
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
          lines.slice(0, 5).forEach((value, index) => ctx.fillText(value, 114, 382 + index * 18));
          ctx.restore();
        }
      }
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV90() || !this.alien3V90) return base;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base.specialOperation) ? base.specialOperation : {}),
          alien3V90: sanitizeAlien3StateV90(this.alien3V90)
        }
      };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V90 || rawState?.alien3V90;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV90() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V90) return result;
      this.alien3V90 = sanitizeAlien3StateV90(source);
      this.pendingAlien3ResumeV90 = this.alien3V90;
      if (this.alien3StationsV90?.length) {
        this.applyAlien3ChallengeV90();
        this.syncAlien3FireHazardsV90();
        this.updateAlien3PrisonerTaskSetV90(true);
        this.deferPrematureQueenCodexV90();
      }
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV90: true };
    }

    getAlien3SnapshotV90() {
      if (!this.isAlien3MissionV90() || !this.alien3V90) return { alien3V90: null };
      const state = sanitizeAlien3StateV90(this.alien3V90);
      return {
        alien3V90: {
          ...state,
          challenge: alien3V90Challenge(state.challengeId),
          grade: alien3V90Grade({
            synchronization: this.alien3V88?.synchronization,
            evidenceV89: this.alien3V89?.evidenceRecovered?.length || 0,
            totalV89: 10,
            evidenceV90: state.evidenceRecovered.length,
            totalV90: ALIEN3_V90_EVIDENCE_IDS.length,
            damageTaken: this.alien3V89?.stats?.damageTaken || 0,
            stealthSeconds: state.stats.stealthSeconds
          }),
          codexTotalV90: ALIEN3_CODEX_V90.length,
          fireSegmentsActive: state.firePlan.activeSegments.length,
          foundryReady: state.leadworks.moldReady
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlien3MissionV90() ? { ...report, alien3DlcV90: this.getAlien3SnapshotV90().alien3V90 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlien3SnapshotV90() };
    }
  };
}
