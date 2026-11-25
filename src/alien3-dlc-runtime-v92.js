import {
  ALIEN3_CAMPAIGN_ID_V92,
  ALIEN3_CODEX_V92,
  ALIEN3_DLC_SCHEMA_V92,
  ALIEN3_PRISONER_COMMANDS_V92,
  ALIEN3_SHUTTERS_V92,
  ALIEN3_STEAM_VALVES_V92,
  ALIEN3_V92_EVIDENCE_IDS,
  ALIEN3_V92_STATIONS,
  alien3V92CodexEntry,
  alien3V92Grade,
  createAlien3StateV92,
  sanitizeAlien3StateV92
} from './alien3-dlc-v92.js';
import { ALIEN3_RUNNER_AMBUSH_ANCHORS_V89, ALIEN3_V89_EVIDENCE_IDS } from './alien3-dlc-v89.js';
import { ALIEN3_V90_EVIDENCE_IDS } from './alien3-dlc-v90.js';
import { ALIEN3_V91_EVIDENCE_IDS } from './alien3-dlc-v91.js';

const WORLD_WIDTH = 6200;
const INTERACT_RANGE = 176;
const PHASE_ORDER = Object.freeze(['wreckage', 'infirmary', 'first-blood', 'bishop', 'trap-prep', 'fire-maze', 'leadworks', 'molten-lead', 'thermal-shock', 'company', 'finale']);
const PHASE_TITLES = Object.freeze({
  wreckage: ['CHAPITRE I · ÉPAVE', 'Fiorina 161 · côte et EEV'],
  infirmary: ['CHAPITRE II · MORGUE', 'Le complexe pénitentiaire se referme'],
  'first-blood': ['CHAPITRE III · PREMIER SANG', 'Un prédateur dans les galeries'],
  bishop: ['CHAPITRE IV · BISHOP', 'La mémoire d’un désastre précédent'],
  'trap-prep': ['CHAPITRE V · LE PLAN', 'Pas d’armes. Seulement le complexe.'],
  'fire-maze': ['CHAPITRE VI · FEU', 'Quinitricetyline et panique'],
  leadworks: ['CHAPITRE VII · FONDERIE', 'Rabattre le Runner vers le moule'],
  'molten-lead': ['CHAPITRE VIII · PLOMB', 'Le piège se referme'],
  'thermal-shock': ['CHAPITRE IX · CHOC THERMIQUE', 'Une seule fenêtre létale'],
  company: ['CHAPITRE X · PATNA', 'La Compagnie arrive trop tard'],
  finale: ['CHAPITRE XI · FOUR', 'Dernière décision sur Fiorina 161']
});
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const center = (entity = {}) => ({ x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2, y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2 });
const distance = (a, b) => {
  if (!a || !b) return Infinity;
  const left = center(a); const right = center(b);
  return Math.hypot(left.x - right.x, left.y - right.y);
};
const phaseIndex = (phase) => Math.max(0, PHASE_ORDER.indexOf(phase));

export const ALIEN3_PERSISTENT_EVENT_TYPES_V92 = Object.freeze(new Set([
  'alien3-v92-archive', 'alien3-v92-shutter', 'alien3-v92-steam', 'alien3-v92-prisoner-command',
  'alien3-v92-checkpoint', 'alien3-v92-evidence', 'alien3-v92-achievement', 'alien3-v92-perfect-archive'
]));

function activePrisoners(engine) {
  return (Array.isArray(engine?.alien3PrisonersV89) ? engine.alien3PrisonersV89 : [])
    .filter((entry) => ['active', 'wounded'].includes(entry.status));
}

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

function evidenceCodex(id) {
  const map = {
    'master-archive': ['f161-master-archive'],
    'emergency-shutters': ['f161-emergency-shutters'],
    'steam-masking': ['f161-steam-masking'],
    'lure-team': ['f161-lure-team'],
    'seal-team': ['f161-seal-team'],
    'rescue-team': ['f161-rescue-team'],
    'runner-adaptation': ['f161-runner-adaptation'],
    'no-safe-zone': ['f161-no-safe-zone'],
    'prisoner-cohesion': ['f161-prisoner-cohesion'],
    'company-biosecurity': ['f161-company-biosecurity'],
    'final-telemetry': ['f161-final-telemetry'],
    'perfect-archive': ['f161-perfect-archive']
  };
  return map[id] || [];
}

export function withAlien3DlcRuntimeV92(BaseEngine) {
  return class Alien3DlcRuntimeV92 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV92 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V92;
      this.alien3V92 = this.alien3ActiveV92 ? createAlien3StateV92() : null;
      this.pendingAlien3ResumeV92 = null;
      this.alien3StationsV92 = [];
      this.alien3V92OverlayClock = 0;
      this.alien3V92OverlayId = null;
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV92()) return snapshot;
      if (this.pendingAlien3ResumeV92) this.alien3V92 = sanitizeAlien3StateV92(this.pendingAlien3ResumeV92);
      this.configureAlien3WorldV92();
      return { ...snapshot, ...this.getAlien3SnapshotV92() };
    }

    isAlien3MissionV92() {
      return Boolean(this.alien3ActiveV92 || this.isAlien3MissionV91?.());
    }

    configureAlien3WorldV92() {
      this.alien3V92 ||= createAlien3StateV92();
      this.alien3StationsV92 = ALIEN3_V92_STATIONS.map((entry) => ({ ...entry }));
      const phase = this.alien3V88?.phase || 'wreckage';
      this.alien3V92.checkpointLedger.lastPhase = phase;
      if (!this.alien3V92.checkpointLedger.receipts.includes(phase)) this.alien3V92.checkpointLedger.receipts.push(phase);
      this.updateAlien3MasterArchiveV92();
      this.onEvent({ type: 'alien3-v92-archive', action: 'runtime-ready', stations: this.alien3StationsV92.length, evidence: ALIEN3_V92_EVIDENCE_IDS.length });
      return this.alien3V92;
    }

    alien3StationV92(id) {
      return this.alien3StationsV92.find((entry) => entry.id === id) || null;
    }

    unlockAlien3CodexV92(ids = []) {
      const state = this.alien3V92;
      if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3V92CodexEntry(id) || state.codexUnlocked.includes(id)) continue;
        state.codexUnlocked.push(id);
        unlocked.push(id);
        this.onEvent({ type: 'alien3-v92-evidence', action: 'codex-unlocked', codexId: id });
      }
      return unlocked;
    }

    recoverAlien3EvidenceV92(id, { silent = false } = {}) {
      const state = this.alien3V92;
      if (!state || !ALIEN3_V92_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      this.unlockAlien3CodexV92(evidenceCodex(id));
      if (!silent) {
        this.onEvent({ type: 'alien3-v92-evidence', evidenceId: id, total: state.evidenceRecovered.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v92:evidence:${id}` });
      }
      return true;
    }

    showAlien3OverlayV92(id, seconds = 6) {
      const entry = alien3V92CodexEntry(id);
      if (!entry) return false;
      this.alien3V92OverlayId = id;
      this.alien3V92OverlayClock = seconds;
      return true;
    }

    registerAlien3ToolV92(tool) {
      const state = this.alien3V92;
      if (!state) return;
      const adaptation = state.adaptation;
      if (adaptation.lastTool === tool) adaptation.toolRepeat += 1;
      else adaptation.toolRepeat = 0;
      adaptation.lastTool = tool;
      if (adaptation.toolRepeat > 0) state.telemetry.toolAdaptations += 1;
      if (tool === 'shutter') adaptation.shutterAggression = clamp(adaptation.shutterAggression + 0.28 + adaptation.toolRepeat * 0.08, 0, 5);
      if (tool === 'steam') adaptation.steamTolerance = clamp(adaptation.steamTolerance + 0.24 + adaptation.toolRepeat * 0.07, 0, 5);
      if (tool === 'flare') adaptation.flareResistance = clamp(adaptation.flareResistance + 0.18 + adaptation.toolRepeat * 0.05, 0, 5);
      if (tool === 'lure') adaptation.pressureMemory = clamp(adaptation.pressureMemory + 9 + adaptation.toolRepeat * 4, 0, 100);
      if ((adaptation.flareResistance + adaptation.shutterAggression + adaptation.steamTolerance) >= 1) this.recoverAlien3EvidenceV92('runner-adaptation', { silent: true });
    }

    alien3V92StationVisible(station) {
      const phase = this.alien3V88?.phase || 'wreckage';
      const state = this.alien3V92;
      if (!state || !station) return false;
      if (station.kind === 'archive') return phaseIndex(phase) >= phaseIndex('infirmary') && !state.evidenceRecovered.includes('master-archive');
      if (station.kind === 'shutter') {
        if (station.id === 'f161-shutter-foundry') return ['molten-lead', 'thermal-shock'].includes(phase);
        return ['first-blood', 'bishop', 'fire-maze', 'leadworks', 'molten-lead', 'thermal-shock'].includes(phase);
      }
      if (station.kind === 'steam') {
        if (station.id === 'f161-steam-lead') return ['molten-lead', 'thermal-shock'].includes(phase);
        if (station.id === 'f161-steam-furnace') return ['molten-lead', 'thermal-shock', 'company'].includes(phase);
        return ['first-blood', 'bishop', 'fire-maze', 'leadworks'].includes(phase);
      }
      if (station.kind === 'lure' || station.kind === 'seal') {
        if (this.alien3V89?.cut === 'assembly' && phase === 'fire-maze') {
          if (!this.alien3V89?.assembly?.wasteTankTrapped) return false;
          if (!this.alien3V91?.companyDirective?.messageSent) return false;
        }
        return ['fire-maze', 'leadworks'].includes(phase);
      }
      if (station.kind === 'rescue') return ['fire-maze', 'leadworks', 'company'].includes(phase) && activePrisoners(this).some((entry) => entry.status === 'wounded');
      return false;
    }

    alien3NearestStationV92(actor = this.player) {
      if (!actor || !this.alien3V92) return null;
      return this.alien3StationsV92
        .filter((station) => this.alien3V92StationVisible(station))
        .map((station) => ({ station, range: distance(actor, station) }))
        .filter((entry) => entry.range <= INTERACT_RANGE)
        .sort((a, b) => a.range - b.range)[0]?.station || null;
    }

    activateAlien3ShutterV92(station, { remote = false } = {}) {
      const state = this.alien3V92;
      const shutter = state?.shutters?.[station.id];
      if (!state || !shutter || shutter.cooldown > 0 || shutter.closedClock > 0) return false;
      const runner = this.alien3RunnerV88;
      shutter.uses += 1;
      shutter.contactClock = 0;
      shutter.runnerSide = runner ? (Number(runner.x) + Number(runner.w || 0) / 2 < station.x ? -1 : 1) : 0;
      const hold = Math.max(2.4, Number(station.baseHold || 5) - state.adaptation.shutterAggression * 0.48);
      shutter.closedClock = hold;
      shutter.holdPeak = Math.max(shutter.holdPeak, hold);
      shutter.cooldown = Number(station.cooldown) || 16;
      state.telemetry.shuttersUsed += 1;
      this.registerAlien3ToolV92('shutter');
      this.recoverAlien3EvidenceV92('emergency-shutters');
      this.bumpAlien3NoiseV90?.(12, remote ? 'remote-shutter' : 'shutter');
      this.onEvent({ type: 'alien3-v92-shutter', action: 'closed', shutterId: station.id, holdSeconds: hold, remote });
      return true;
    }

    activateAlien3SteamV92(station) {
      const state = this.alien3V92;
      const steam = state?.steam?.[station.id];
      if (!state || !steam || steam.cooldown > 0 || steam.activeClock > 0) return false;
      steam.uses += 1;
      const duration = Math.max(3.4, Number(station.baseDuration || 7) - state.adaptation.steamTolerance * 0.72);
      steam.activeClock = duration;
      steam.cooldown = Number(station.cooldown) || 20;
      state.telemetry.steamPurges += 1;
      this.registerAlien3ToolV92('steam');
      this.recoverAlien3EvidenceV92('steam-masking');
      if (this.alien3V90?.sensory) this.alien3V90.sensory.noise = Math.max(0, this.alien3V90.sensory.noise - 18);
      this.onEvent({ type: 'alien3-v92-steam', action: 'purge', valveId: station.id, duration });
      return true;
    }

    issueAlien3PrisonerCommandV92(station) {
      const state = this.alien3V92;
      const commands = state?.prisonerCommands;
      if (!state || !commands) return false;
      const available = activePrisoners(this);
      if (available.length < 2) return this.locked?.('EFFECTIF INSUFFISANT POUR UN ORDRE COLLECTIF') ?? false;
      if (station.kind === 'lure') {
        if (commands.lureCooldown > 0) return false;
        const playerX = Number(this.player?.x) || 0;
        const anchor = [...ALIEN3_RUNNER_AMBUSH_ANCHORS_V89].sort((a, b) => Math.abs(b.x - playerX) - Math.abs(a.x - playerX))[0];
        commands.lureX = anchor?.x || (playerX < WORLD_WIDTH / 2 ? 5200 : 900);
        commands.lureClock = Math.max(3.5, 7 - state.adaptation.pressureMemory * 0.025);
        commands.lureCooldown = 22;
        commands.lureOrders += 1;
        commands.teamwork = clamp(commands.teamwork + 9, 0, 100);
        this.registerAlien3ToolV92('lure');
        this.recoverAlien3EvidenceV92('lure-team');
        this.onEvent({ type: 'alien3-v92-prisoner-command', action: 'lure', targetX: Math.round(commands.lureX), count: commands.lureOrders });
      } else if (station.kind === 'seal') {
        if (commands.sealCooldown > 0) return false;
        const runnerX = Number(this.alien3RunnerV88?.x) || Number(this.player?.x) || 0;
        const target = ALIEN3_SHUTTERS_V92
          .map((entry) => this.alien3StationV92(entry.id))
          .filter(Boolean)
          .sort((a, b) => Math.abs(a.x - runnerX) - Math.abs(b.x - runnerX))
          .find((entry) => (state.shutters[entry.id]?.cooldown || 0) <= 0 && (state.shutters[entry.id]?.closedClock || 0) <= 0);
        if (!target || !this.activateAlien3ShutterV92(target, { remote: true })) return this.locked?.('AUCUN VOLET DISPONIBLE') ?? false;
        commands.sealCooldown = 26;
        commands.sealOrders += 1;
        commands.teamwork = clamp(commands.teamwork + 7, 0, 100);
        this.recoverAlien3EvidenceV92('seal-team');
        this.onEvent({ type: 'alien3-v92-prisoner-command', action: 'seal', shutterId: target.id, count: commands.sealOrders });
      } else if (station.kind === 'rescue') {
        if (commands.rescueCooldown > 0) return false;
        const wounded = available.find((entry) => entry.status === 'wounded' && !commands.woundedEvacuated.includes(entry.id));
        if (!wounded) return this.locked?.('AUCUN BLESSÉ ÉVACUABLE') ?? false;
        wounded.x = 3330;
        wounded.y = 422;
        wounded.patrolOrigin = wounded.x;
        commands.woundedEvacuated.push(wounded.id);
        commands.rescueCooldown = 18;
        commands.rescueOrders += 1;
        commands.teamwork = clamp(commands.teamwork + 12, 0, 100);
        if (this.alien3V91?.prisonerAI) this.alien3V91.prisonerAI.rescueCount += 1;
        this.recoverAlien3EvidenceV92('rescue-team');
        this.onEvent({ type: 'alien3-v92-prisoner-command', action: 'rescue', prisonerId: wounded.id, count: commands.rescueOrders });
      } else return false;
      state.telemetry.prisonerOrders += 1;
      state.telemetry.maxTeamwork = Math.max(state.telemetry.maxTeamwork, commands.teamwork);
      this.recoverAlien3EvidenceV92('prisoner-cohesion', { silent: true });
      return true;
    }

    inspectAlien3MasterArchiveV92() {
      const state = this.alien3V92;
      if (!state) return false;
      state.masterArchive.inspected = true;
      this.updateAlien3MasterArchiveV92();
      this.recoverAlien3EvidenceV92('master-archive');
      this.showAlien3OverlayV92('f161-master-archive');
      this.onEvent({ type: 'alien3-v92-archive', action: 'inspected', integratedEvidence: state.masterArchive.integratedEvidence });
      return true;
    }

    interactAlien3V92(actor = this.player) {
      const station = this.alien3NearestStationV92(actor);
      if (!station) return false;
      actor.actionClock = Math.max(Number(actor.actionClock) || 0, 0.55);
      if (station.kind === 'archive') return this.inspectAlien3MasterArchiveV92();
      if (station.kind === 'shutter') return this.activateAlien3ShutterV92(station);
      if (station.kind === 'steam') return this.activateAlien3SteamV92(station);
      if (['lure', 'seal', 'rescue'].includes(station.kind)) return this.issueAlien3PrisonerCommandV92(station);
      return false;
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV92() || !this.alien3V92) return super.interact(actor);
      if (this.interactAlien3V92(actor)) return true;
      return super.interact(actor);
    }

    fire(actor = this.player) {
      const before = this.alien3V89?.flares?.length || 0;
      const result = super.fire(actor);
      if (!this.isAlien3MissionV92() || !this.alien3V92 || !result) return result;
      const flares = this.alien3V89?.flares || [];
      if (flares.length > before) {
        const flare = flares.at(-1);
        const resistance = this.alien3V92.adaptation.flareResistance;
        const scale = Math.max(0.45, 1 - resistance * 0.1);
        if (flare) {
          flare.life *= scale;
          flare.maxLife *= scale;
        }
        this.registerAlien3ToolV92('flare');
      }
      return result;
    }

    updateEnemy(enemy, delta) {
      if (!this.isAlien3MissionV92() || enemy !== this.alien3RunnerV88 || !this.alien3V92) return super.updateEnemy(enemy, delta);
      const state = this.alien3V92;
      const seconds = clamp(delta, 0, 0.08);

      const activeSteam = ALIEN3_STEAM_VALVES_V92
        .map((entry) => ({ station: this.alien3StationV92(entry.id), state: state.steam[entry.id] }))
        .filter((entry) => entry.station && entry.state?.activeClock > 0 && distance(enemy, entry.station) <= 250);
      if (activeSteam.length) {
        enemy.alert = false;
        enemy.staggerClock = Math.max(Number(enemy.staggerClock) || 0, 0.2);
        activeSteam[0].state.disorientations += seconds;
        if (this.alien3V91?.hunter) this.alien3V91.hunter.heat = Math.max(0, this.alien3V91.hunter.heat - seconds * 22);
        return;
      }

      if (state.prisonerCommands.lureClock > 0 && Number.isFinite(state.prisonerCommands.lureX)) {
        const targetX = state.prisonerCommands.lureX;
        const speed = Math.max(95, (Number(enemy.alien3BaseSpeedV88) || Number(enemy.speed) || 1.9) * 104);
        enemy.x = clamp(Number(enemy.x || 0) + Math.sign(targetX - Number(enemy.x || 0)) * Math.min(Math.abs(targetX - Number(enemy.x || 0)), speed * seconds), 0, WORLD_WIDTH - (Number(enemy.w) || 90));
        enemy.facing = Math.sign(targetX - enemy.x) || enemy.facing || 1;
        enemy.alert = true;
        if (Math.abs((enemy.x + (enemy.w || 90) / 2) - targetX) < 100) state.prisonerCommands.lureClock = Math.min(state.prisonerCommands.lureClock, 0.5);
        return;
      }

      const result = super.updateEnemy(enemy, delta);
      for (const definition of ALIEN3_SHUTTERS_V92) {
        const shutter = state.shutters[definition.id];
        if (!shutter || shutter.closedClock <= 0) continue;
        const station = this.alien3StationV92(definition.id);
        if (!station) continue;
        const runnerCenter = Number(enemy.x || 0) + Number(enemy.w || 90) / 2;
        if (Math.abs(runnerCenter - station.x) > 115) continue;
        if (!shutter.runnerSide) shutter.runnerSide = runnerCenter < station.x ? -1 : 1;
        const width = Number(enemy.w) || 90;
        enemy.x = shutter.runnerSide < 0 ? Math.min(enemy.x, station.x - width - 24) : Math.max(enemy.x, station.x + station.w + 24);
        enemy.alert = true;
        shutter.contactClock += seconds;
        const threshold = Math.max(1.15, 3.8 - state.adaptation.shutterAggression * 0.42);
        if (shutter.contactClock >= threshold) {
          shutter.closedClock = 0;
          shutter.contactClock = 0;
          shutter.breaches += 1;
          state.telemetry.shuttersBreached += 1;
          state.adaptation.shutterAggression = clamp(state.adaptation.shutterAggression + 0.45, 0, 5);
          this.onEvent({ type: 'alien3-v92-shutter', action: 'breached', shutterId: definition.id, breaches: shutter.breaches });
        }
      }
      return result;
    }

    updateAlien3SystemsV92(seconds) {
      const state = this.alien3V92;
      if (!state) return;
      for (const definition of ALIEN3_SHUTTERS_V92) {
        const shutter = state.shutters[definition.id];
        shutter.closedClock = Math.max(0, shutter.closedClock - seconds);
        shutter.cooldown = Math.max(0, shutter.cooldown - seconds);
        if (shutter.closedClock <= 0) shutter.contactClock = 0;
      }
      for (const definition of ALIEN3_STEAM_VALVES_V92) {
        const steam = state.steam[definition.id];
        steam.activeClock = Math.max(0, steam.activeClock - seconds);
        steam.cooldown = Math.max(0, steam.cooldown - seconds);
        if (steam.activeClock > 0 && this.alien3V90?.sensory) {
          this.alien3V90.sensory.noise = Math.max(0, this.alien3V90.sensory.noise - seconds * 8);
          this.alien3V90.sensory.repeatedRoutePressure = Math.max(0, this.alien3V90.sensory.repeatedRoutePressure - seconds * 0.8);
        }
      }
      const commands = state.prisonerCommands;
      commands.lureCooldown = Math.max(0, commands.lureCooldown - seconds);
      commands.sealCooldown = Math.max(0, commands.sealCooldown - seconds);
      commands.rescueCooldown = Math.max(0, commands.rescueCooldown - seconds);
      commands.lureClock = Math.max(0, commands.lureClock - seconds);
      commands.teamwork = clamp(commands.teamwork - seconds * 0.35, 0, 100);
      state.telemetry.maxTeamwork = Math.max(state.telemetry.maxTeamwork, commands.teamwork);
      state.adaptation.feintCooldown = Math.max(0, state.adaptation.feintCooldown - seconds);
    }

    updateAlien3FlareAdaptationV92() {
      const state = this.alien3V92;
      const consumed = Number(this.alien3V89?.director?.flaresConsumed) || 0;
      if (!state || consumed <= state.adaptation.flareConsumedSeen) return;
      const delta = consumed - state.adaptation.flareConsumedSeen;
      state.adaptation.flareConsumedSeen = consumed;
      state.adaptation.flareResistance = clamp(state.adaptation.flareResistance + delta * 0.55, 0, 5);
      state.telemetry.toolAdaptations += delta;
      this.recoverAlien3EvidenceV92('runner-adaptation', { silent: true });
      this.onEvent({ type: 'alien3-v92-archive', action: 'runner-adapted-flare', resistance: state.adaptation.flareResistance });
    }

    updateAlien3FeintsV92(seconds) {
      const state = this.alien3V92;
      const runner = this.alien3RunnerV88;
      if (!state || !runner?.alive || !this.player || !this.alien3V88?.runner?.active || this.alien3V88?.runnerDefeated) return;
      const hunterHeat = Number(this.alien3V91?.hunter?.heat) || 0;
      state.adaptation.pressureMemory = clamp(Math.max(state.adaptation.pressureMemory - seconds * 1.3, hunterHeat * 0.55), 0, 100);
      const zone = this.missionLevelVisualState?.activeZoneId || 'unknown';
      const memory = state.adaptation.routeMemory;
      if (memory.at(-1) !== zone) {
        memory.push(zone);
        if (memory.length > 12) memory.shift();
      }
      const repeated = memory.slice(-4).filter((entry) => entry === zone).length;
      if (repeated >= 3) state.adaptation.pressureMemory = clamp(state.adaptation.pressureMemory + seconds * 6, 0, 100);
      const runnerRange = distance(this.player, runner);
      if (state.adaptation.feintCooldown > 0 || runnerRange < 1100 || hunterHeat < 18 || hunterHeat > 62) return;
      if (state.prisonerCommands.lureClock > 0 || Object.values(state.steam).some((entry) => entry.activeClock > 0)) return;
      const cameraX = Number(this.camera?.x) || Math.max(0, Number(this.player.x) - 430);
      const cameraRight = cameraX + 1280;
      const candidates = ALIEN3_RUNNER_AMBUSH_ANCHORS_V89.filter((entry) => entry.x < cameraX - 160 || entry.x > cameraRight + 160);
      const anchor = candidates.sort((a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x))[0];
      if (!anchor) return;
      runner.x = clamp(anchor.x, 20, WORLD_WIDTH - (Number(runner.w) || 90) - 20);
      runner.y = nearestPlatformY(this, anchor.x, anchor.y + (Number(runner.h) || 90)) - (Number(runner.h) || 90);
      runner.spawnX = runner.x;
      runner.alert = false;
      state.adaptation.feints += 1;
      state.telemetry.runnerFeints += 1;
      state.adaptation.feintCooldown = 14;
      this.recoverAlien3EvidenceV92('no-safe-zone', { silent: true });
      this.onEvent({ type: 'alien3-v92-archive', action: 'runner-feint', anchorId: anchor.id, count: state.adaptation.feints });
    }

    updateAlien3CheckpointLedgerV92(previousPhase, nextPhase) {
      const state = this.alien3V92;
      if (!state || previousPhase === nextPhase || !nextPhase) return;
      state.checkpointLedger.lastPhase = nextPhase;
      if (!state.checkpointLedger.receipts.includes(nextPhase)) state.checkpointLedger.receipts.push(nextPhase);
      state.checkpointLedger.phaseChanges += 1;
      const title = PHASE_TITLES[nextPhase];
      if (title && typeof this.showAlien3BeatV91 === 'function') this.showAlien3BeatV91(title[0], title[1], `v92-phase-${nextPhase}`);
      this.onEvent({ type: 'alien3-v92-checkpoint', phase: nextPhase, count: state.checkpointLedger.phaseChanges });
    }

    updateAlien3MasterArchiveV92() {
      const state = this.alien3V92;
      if (!state) return;
      const inherited = (this.alien3V89?.evidenceRecovered?.length || 0)
        + (this.alien3V90?.evidenceRecovered?.length || 0)
        + (this.alien3V91?.evidenceRecovered?.length || 0);
      const current = state.evidenceRecovered.filter((id) => id !== 'perfect-archive').length;
      state.masterArchive.integratedEvidence = inherited + current;
      const inheritedComplete = (this.alien3V89?.evidenceRecovered?.length || 0) >= ALIEN3_V89_EVIDENCE_IDS.length
        && (this.alien3V90?.evidenceRecovered?.length || 0) >= ALIEN3_V90_EVIDENCE_IDS.length
        && (this.alien3V91?.evidenceRecovered?.length || 0) >= ALIEN3_V91_EVIDENCE_IDS.length;
      const v92Complete = ALIEN3_V92_EVIDENCE_IDS.filter((id) => id !== 'perfect-archive').every((id) => state.evidenceRecovered.includes(id));
      const finaleReady = Boolean(this.alien3V88?.runnerDefeated) && phaseIndex(this.alien3V88?.phase) >= phaseIndex('company');
      if (!state.masterArchive.perfect && inheritedComplete && v92Complete && finaleReady) {
        state.masterArchive.perfect = true;
        this.recoverAlien3EvidenceV92('perfect-archive');
        this.onEvent({ type: 'alien3-v92-perfect-archive', integratedEvidence: state.masterArchive.integratedEvidence + 1 });
      }
      if (phaseIndex(this.alien3V88?.phase) >= phaseIndex('company') && !state.evidenceRecovered.includes('company-biosecurity')) {
        this.recoverAlien3EvidenceV92('company-biosecurity', { silent: true });
      }
      if (this.alien3V88?.runnerDefeated && !state.evidenceRecovered.includes('final-telemetry')) {
        this.recoverAlien3EvidenceV92('final-telemetry', { silent: true });
      }
    }

    update(delta) {
      const previousPhase = this.alien3V88?.phase || 'wreckage';
      const result = super.update(delta);
      if (!this.isAlien3MissionV92() || !this.alien3V92 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 0.25);
      this.alien3V92OverlayClock = Math.max(0, this.alien3V92OverlayClock - seconds);
      this.updateAlien3SystemsV92(seconds);
      this.updateAlien3FlareAdaptationV92();
      this.updateAlien3FeintsV92(seconds);
      this.updateAlien3CheckpointLedgerV92(previousPhase, this.alien3V88?.phase || previousPhase);
      this.updateAlien3MasterArchiveV92();
      return result;
    }

    computeAlien3AchievementsV92() {
      const state = this.alien3V92;
      if (!state) return [];
      const ids = [];
      if (state.evidenceRecovered.length === ALIEN3_V92_EVIDENCE_IDS.length) ids.push('v92-perfect-dossier');
      if (state.telemetry.shuttersBreached === 0 && state.telemetry.shuttersUsed >= 2) ids.push('v92-door-discipline');
      if (state.telemetry.steamPurges >= 2 && state.adaptation.steamTolerance < 2.5) ids.push('v92-white-noise');
      if (state.prisonerCommands.lureOrders && state.prisonerCommands.sealOrders) ids.push('v92-two-team-doctrine');
      if (state.prisonerCommands.rescueOrders) ids.push('v92-no-one-left-in-the-corridor');
      if (state.adaptation.feints >= 1) ids.push('v92-never-safe');
      if (state.masterArchive.perfect) ids.push('v92-fiorina-complete');
      return [...new Set(ids)];
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV92() || !this.alien3V92) return super.completeAlien3MissionV89(actor);
      const emit = this.onEvent;
      let completionEvent = null;
      this.onEvent = (event) => {
        if (event?.type === 'mission-complete') { completionEvent = event; return; }
        emit(event);
      };
      let completed = false;
      try { completed = super.completeAlien3MissionV89(actor); }
      finally { this.onEvent = emit; }
      if (!completed) return false;
      this.updateAlien3MasterArchiveV92();
      const state = this.alien3V92;
      state.achievementIds = this.computeAlien3AchievementsV92();
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      const wrongTools = Math.floor(state.telemetry.toolAdaptations / 4) + Math.floor(state.telemetry.shuttersBreached / 2);
      const grade = alien3V92Grade({
        gradeV91: baseRewards.mireGradeV91 || 'D',
        evidence: state.evidenceRecovered.length,
        wrongTools,
        teamwork: state.telemetry.maxTeamwork,
        perfect: state.masterArchive.perfect
      });
      const gradeBonus = { 'S+++': 720, 'S++': 520, 'S+': 390, S: 280, A: 190, B: 100, C: 40, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + 150 + gradeBonus,
        alien3V92: true,
        mireGradeV92: grade,
        v92EvidenceRecovered: [...state.evidenceRecovered],
        v92CodexUnlocked: [...state.codexUnlocked],
        v92Achievements: [...state.achievementIds],
        directorCutV92: {
          flareResistance: state.adaptation.flareResistance,
          shutterAggression: state.adaptation.shutterAggression,
          steamTolerance: state.adaptation.steamTolerance,
          feints: state.adaptation.feints
        },
        tacticalSystemsV92: {
          shuttersUsed: state.telemetry.shuttersUsed,
          shuttersBreached: state.telemetry.shuttersBreached,
          steamPurges: state.telemetry.steamPurges,
          prisonerOrders: state.telemetry.prisonerOrders,
          maxTeamwork: Math.round(state.telemetry.maxTeamwork)
        },
        archiveMasterV92: {
          integratedEvidence: state.masterArchive.integratedEvidence,
          perfect: state.masterArchive.perfect,
          checkpointReceipts: [...state.checkpointLedger.receipts]
        }
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v92-achievement', achievementId });
      emit(completionEvent
        ? { ...completionEvent, rewards: this.mission.rewards }
        : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV92() || !this.alien3V92) return super.getInteractionPrompt(actor);
      const station = this.alien3NearestStationV92(actor);
      if (station) {
        if (station.kind === 'shutter') {
          const state = this.alien3V92.shutters[station.id];
          return state.closedClock > 0 ? `${station.label} · FERMÉ ${state.closedClock.toFixed(1)} S` : state.cooldown > 0 ? `${station.label} · RECHARGE ${Math.ceil(state.cooldown)} S` : `E  ${station.label}`;
        }
        if (station.kind === 'steam') {
          const state = this.alien3V92.steam[station.id];
          return state.activeClock > 0 ? `${station.label} · ACTIVE ${state.activeClock.toFixed(1)} S` : state.cooldown > 0 ? `${station.label} · RECHARGE ${Math.ceil(state.cooldown)} S` : `E  ${station.label}`;
        }
        return `E  ${station.label}`;
      }
      return super.getInteractionPrompt(actor);
    }

    drawAlien3StationV92(ctx, station) {
      if (!ctx || !station) return;
      ctx.save();
      const state = this.alien3V92;
      if (station.kind === 'shutter') {
        const shutter = state.shutters[station.id];
        if (shutter.closedClock > 0) {
          ctx.fillStyle = 'rgba(48,48,43,.98)';
          ctx.strokeStyle = '#b19059';
          ctx.lineWidth = 3;
          ctx.fillRect(station.x, station.y, station.w, station.h);
          ctx.strokeRect(station.x + 1.5, station.y + 1.5, station.w - 3, station.h - 3);
          for (let y = station.y + 10; y < station.y + station.h; y += 15) { ctx.beginPath(); ctx.moveTo(station.x + 5, y); ctx.lineTo(station.x + station.w - 5, y); ctx.stroke(); }
        } else {
          ctx.fillStyle = 'rgba(61,54,42,.88)'; ctx.fillRect(station.x, station.y, station.w, station.h);
          ctx.fillStyle = shutter.cooldown > 0 ? '#5f4f3e' : '#b9a06b'; ctx.fillRect(station.x + 12, station.y + 12, station.w - 24, 9);
        }
      } else if (station.kind === 'steam') {
        const steam = state.steam[station.id];
        ctx.fillStyle = 'rgba(56,59,54,.9)'; ctx.fillRect(station.x, station.y, station.w, station.h);
        ctx.strokeStyle = '#9eae9d'; ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
        if (steam.activeClock > 0) {
          ctx.globalAlpha = 0.42;
          for (let i = 0; i < 5; i += 1) { ctx.beginPath(); ctx.arc(station.x + station.w / 2 + Math.sin((this.animationTime || 0) * 3 + i) * 32, station.y - 8 - i * 13, 18 + i * 4, 0, Math.PI * 2); ctx.stroke(); }
        }
      } else {
        ctx.fillStyle = station.kind === 'archive' ? 'rgba(34,43,42,.94)' : 'rgba(57,48,37,.94)';
        ctx.strokeStyle = station.kind === 'archive' ? '#8ba7a0' : '#a58856';
        ctx.fillRect(station.x, station.y, station.w, station.h); ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
        ctx.fillStyle = '#d6bf83'; ctx.fillRect(station.x + 10, station.y + 11, Math.max(8, station.w - 20), 8);
      }
      ctx.restore();
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV92() || !this.alien3V92 || !ctx) return;
      for (const station of this.alien3StationsV92) if (this.alien3V92StationVisible(station)) this.drawAlien3StationV92(ctx, station);
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV92() || !this.alien3V92 || !ctx) return;
      const state = this.alien3V92;
      ctx.save();
      ctx.fillStyle = 'rgba(4,5,4,.93)';
      ctx.fillRect(902, 396, 360, 82);
      ctx.strokeStyle = '#725c3c';
      ctx.strokeRect(902.5, 396.5, 359, 81);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#ddc58b';
      ctx.fillText(`V92 · ADAPT F${state.adaptation.flareResistance.toFixed(1)} / V${state.adaptation.shutterAggression.toFixed(1)} / S${state.adaptation.steamTolerance.toFixed(1)}`, 914, 416);
      ctx.fillStyle = '#aaa083';
      ctx.fillText(`VOLETS ${state.telemetry.shuttersUsed} · PURGES ${state.telemetry.steamPurges} · ORDRES ${state.telemetry.prisonerOrders} · FEINTES ${state.adaptation.feints}`, 914, 434);
      ctx.fillText(`COHÉSION ${Math.round(state.prisonerCommands.teamwork)}% · PREUVES ${state.evidenceRecovered.length}/${ALIEN3_V92_EVIDENCE_IDS.length} · PHASES ${state.checkpointLedger.receipts.length}/${PHASE_ORDER.length}`, 914, 452);
      ctx.fillText(`ARCHIVE ${state.masterArchive.integratedEvidence} · ${state.masterArchive.perfect ? 'RECONSTRUCTION INTÉGRALE' : 'DOSSIER EN COURS'}`, 914, 470);
      ctx.restore();

      if (this.alien3V92OverlayClock > 0 && this.alien3V92OverlayId) {
        const entry = alien3V92CodexEntry(this.alien3V92OverlayId);
        if (entry) {
          ctx.save();
          ctx.fillStyle = 'rgba(4,5,4,.97)';
          ctx.fillRect(92, 474, 790, 134);
          ctx.strokeStyle = '#715d3f';
          ctx.strokeRect(92.5, 474.5, 789, 133);
          ctx.fillStyle = '#d7bd7d';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`MIRE V92 · ${entry.category} · ${entry.title}`.slice(0, 92), 112, 498);
          ctx.fillStyle = '#c8cbc2';
          ctx.font = '10px monospace';
          const words = entry.body.split(/\s+/); const lines = []; let line = '';
          for (const word of words) { const candidate = line ? `${line} ${word}` : word; if (candidate.length > 105) { if (line) lines.push(line); line = word; } else line = candidate; }
          if (line) lines.push(line);
          lines.slice(0, 5).forEach((value, index) => ctx.fillText(value, 112, 522 + index * 17));
          ctx.restore();
        }
      }
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV92() || !this.alien3V92) return base;
      return {
        ...base,
        specialOperation: {
          ...(isRecord(base.specialOperation) ? base.specialOperation : {}),
          alien3V92: sanitizeAlien3StateV92(this.alien3V92)
        }
      };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V92 || rawState?.alien3V92;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV92() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V92) return result;
      this.alien3V92 = sanitizeAlien3StateV92(source);
      this.pendingAlien3ResumeV92 = this.alien3V92;
      this.updateAlien3MasterArchiveV92();
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV92: true };
    }

    getAlien3SnapshotV92() {
      if (!this.isAlien3MissionV92() || !this.alien3V92) return { alien3V92: null };
      return {
        alien3V92: {
          ...sanitizeAlien3StateV92(this.alien3V92),
          codexTotal: ALIEN3_CODEX_V92.length,
          evidenceTotal: ALIEN3_V92_EVIDENCE_IDS.length,
          shutterTotal: ALIEN3_SHUTTERS_V92.length,
          steamTotal: ALIEN3_STEAM_VALVES_V92.length,
          commandTotal: ALIEN3_PRISONER_COMMANDS_V92.length,
          physicalStations: this.alien3StationsV92.length
        }
      };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isAlien3MissionV92() ? { ...report, alien3V92: this.getAlien3SnapshotV92().alien3V92 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getAlien3SnapshotV92() };
    }
  };
}
