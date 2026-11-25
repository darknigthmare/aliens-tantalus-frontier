import {
  ALIEN3_AUDIO_CUES_V96,
  ALIEN3_CAMPAIGN_ID_V96,
  ALIEN3_CODEX_V96,
  ALIEN3_DLC_SCHEMA_V96,
  ALIEN3_ENVIRONMENT_ZONES_V96,
  ALIEN3_FIORINA_TEMPLATE_V96,
  ALIEN3_V96_EVIDENCE_IDS,
  ALIEN3_V96_STATIONS,
  alien3V96AudioCue,
  alien3V96CodexEntry,
  alien3V96Grade,
  alien3V96Zone,
  createAlien3StateV96,
  sanitizeAlien3StateV96
} from './alien3-dlc-v96.js';

const INTERACT_RANGE = 178;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const center = (entity = {}) => ({ x: (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2, y: (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2 });
const distance = (a, b) => { if (!a || !b) return Infinity; const x = center(a); const y = center(b); return Math.hypot(x.x - y.x, x.y - y.y); };
const zoneByX = (x) => ALIEN3_FIORINA_TEMPLATE_V96.zones.find((entry) => x >= entry.x && x < entry.x + entry.w)
  || ALIEN3_FIORINA_TEMPLATE_V96.zones.at(-1);

export const ALIEN3_PERSISTENT_EVENT_TYPES_V96 = Object.freeze(new Set([
  'alien3-v96-atmosphere', 'alien3-v96-audio', 'alien3-v96-caption', 'alien3-v96-utility',
  'alien3-v96-diagnostic', 'alien3-v96-achievement', 'alien3-v96-perfect'
]));

const EVIDENCE_CODEX = Object.freeze({
  'atmosphere-ready': ['f161-v96-atmosphere', 'f161-v96-optional-audio'],
  'storm-telemetry': ['f161-v96-storm'],
  'cold-wet-exposure': ['f161-v96-storm'],
  'infirmary-light': ['f161-v96-infirmary-light'],
  'prison-pa': ['f161-v96-prison-pa'],
  'service-light': ['f161-v96-service-light'],
  'steam-baffle': ['f161-v96-steam-baffle'],
  'foundry-light': ['f161-v96-foundry-light'],
  'furnace-extractor': ['f161-v96-furnace-extractor'],
  'six-zones-visited': ['f161-v96-zone-cycle'],
  'audio-fallback-safe': ['f161-v96-audio-fallback'],
  'runner-acoustic-near': ['f161-v96-heartbeat', 'f161-v96-threat-caption'],
  'runner-bearing-left': ['f161-v96-threat-caption'],
  'runner-bearing-right': ['f161-v96-threat-caption'],
  'prisoner-climate-stable': ['f161-v96-climate-prisoners'],
  'visibility-tradeoff': ['f161-v96-visibility-tradeoff'],
  'acoustic-diagnostic': ['f161-v96-diagnostic', 'f161-v96-atmosphere-telemetry'],
  'perfect-atmosphere': ['f161-v96-perfect']
});

const breakerKey = Object.freeze({ 'f161-infirmary': 'infirmary', 'f161-service': 'service', 'f161-leadworks': 'leadworks' });
const breakerEvidence = Object.freeze({ 'f161-infirmary': 'infirmary-light', 'f161-service': 'service-light', 'f161-leadworks': 'foundry-light' });
const requiredCueIds = new Set(ALIEN3_AUDIO_CUES_V96.map((entry) => entry.id));

function fallbackTone(audio, cueId) {
  if (!audio?.tone) return false;
  if (cueId === 'alien3-wind') { audio.tone(48, 0.16, 'triangle', 0.025, -6); return true; }
  if (cueId === 'alien3-runner') { audio.tone(62, 0.09, 'sawtooth', 0.10, -18); audio.tone(132, 0.06, 'square', 0.05, 35); return true; }
  if (cueId === 'alien3-steam') { audio.tone(82, 0.13, 'triangle', 0.055, 42); return true; }
  if (cueId === 'alien3-mire') { audio.tone(640, 0.045, 'sine', 0.06, 120); return true; }
  if (cueId === 'alien3-foundry') { audio.tone(74, 0.12, 'square', 0.055, -12); return true; }
  if (cueId === 'alien3-prison') { audio.tone(116, 0.14, 'triangle', 0.035, -8); return true; }
  if (cueId === 'alien3-company') { audio.tone(310, 0.08, 'square', 0.055, 90); return true; }
  if (cueId === 'alien3-heartbeat') { audio.tone(54, 0.07, 'sine', 0.11, -3); return true; }
  return false;
}

export function withAlien3DlcRuntimeV96(BaseEngine) {
  return class Alien3DlcRuntimeV96 extends BaseEngine {
    start(options = {}) {
      this.alien3ActiveV96 = String(options.campaign?.id || '') === ALIEN3_CAMPAIGN_ID_V96;
      this.alien3V96 = this.alien3ActiveV96 ? createAlien3StateV96() : null;
      this.pendingAlien3ResumeV96 = null;
      this.alien3StationsV96 = [];
      const snapshot = super.start(options);
      if (!this.isAlien3MissionV96()) return snapshot;
      if (this.pendingAlien3ResumeV96) this.alien3V96 = sanitizeAlien3StateV96(this.pendingAlien3ResumeV96);
      this.configureAlien3WorldV96();
      return { ...snapshot, ...this.getAlien3SnapshotV96() };
    }

    isAlien3MissionV96() { return Boolean(this.alien3ActiveV96 || this.isAlien3MissionV95?.()); }

    configureAlien3WorldV96() {
      this.alien3V96 ||= createAlien3StateV96();
      this.alien3StationsV96 = ALIEN3_V96_STATIONS.map((entry) => ({ ...entry }));
      this.recoverAlien3EvidenceV96('atmosphere-ready', { silent: true });
      this.syncAlien3EnvironmentV96(0);
      this.onEvent({ type: 'alien3-v96-atmosphere', action: 'runtime-ready', zones: ALIEN3_ENVIRONMENT_ZONES_V96.length, audioCues: ALIEN3_AUDIO_CUES_V96.length });
      return this.alien3V96;
    }

    alien3StationV96(id) { return this.alien3StationsV96.find((entry) => entry.id === id) || null; }

    unlockAlien3CodexV96(ids = []) {
      const state = this.alien3V96; if (!state) return [];
      const unlocked = [];
      for (const id of ids) {
        if (!alien3V96CodexEntry(id) || state.codexUnlocked.includes(id)) continue;
        state.codexUnlocked.push(id); unlocked.push(id);
        this.onEvent({ type: 'alien3-v96-atmosphere', action: 'codex-unlocked', codexId: id });
      }
      return unlocked;
    }

    recoverAlien3EvidenceV96(id, { silent = false } = {}) {
      const state = this.alien3V96;
      if (!state || !ALIEN3_V96_EVIDENCE_IDS.includes(id) || state.evidenceRecovered.includes(id)) return false;
      state.evidenceRecovered.push(id);
      this.unlockAlien3CodexV96(EVIDENCE_CODEX[id] || []);
      if (!silent) {
        this.onEvent({ type: 'alien3-v96-atmosphere', action: 'evidence', evidenceId: id, total: state.evidenceRecovered.length });
        this.onEvent({ type: 'objective-action', action: `alien3-v96:evidence:${id}` });
      }
      return true;
    }

    playAlien3CueV96(cueId, { caption = null, force = false } = {}) {
      const state = this.alien3V96; const cue = alien3V96AudioCue(cueId);
      if (!state || !cue) return false;
      if (!force && cueId === state.acoustics.lastCueId && state.acoustics.ambientCueCooldown > 0 && cue.category === 'environment') return false;
      state.telemetry.audioAttempts += 1;
      let fallbackCalled = false;
      const fallback = () => {
        fallbackCalled = true;
        state.telemetry.fallbackAttempts += 1;
        fallbackTone(this.audio, cueId);
      };
      let realPlayed = false;
      if (this.audio?.playEffect) {
        try { realPlayed = Boolean(this.audio.playEffect(cueId, fallback)); }
        catch { fallback(); }
      } else fallback();
      state.acoustics.fallbackSafe = true;
      state.acoustics.cueCounts[cueId] = (Number(state.acoustics.cueCounts[cueId]) || 0) + 1;
      if (!state.acoustics.uniqueCues.includes(cueId)) state.acoustics.uniqueCues.push(cueId);
      state.acoustics.lastCueId = cueId;
      if (fallbackCalled) this.recoverAlien3EvidenceV96('audio-fallback-safe', { silent: true });
      const label = caption || cue.label;
      state.acoustics.lastCaption = label;
      state.acoustics.captionClock = 2.4;
      state.acoustics.captions += 1;
      this.onEvent({ type: 'alien3-v96-audio', cueId, label, realPlayed, fallback: fallbackCalled });
      this.onEvent({ type: 'alien3-v96-caption', cueId, caption: label, bearing: state.acoustics.bearing, threatBand: state.acoustics.threatBand });
      return true;
    }

    environmentZoneV96() {
      const x = center(this.player).x;
      return alien3V96Zone(zoneByX(x)?.id);
    }

    powerForZoneV96(zone) {
      const state = this.alien3V96;
      let power = zone.power;
      const key = breakerKey[zone.id];
      if (key && state.environment.breakers[key]) power += 0.38;
      if (zone.id === 'f161-cellblock' && state.environment.prisonPa) power += 0.08;
      return clamp(power, 0, 1);
    }

    visibilityForZoneV96(zone) {
      const state = this.alien3V96;
      let value = zone.baseVisibility + this.powerForZoneV96(zone) * 0.14 - zone.steam * 0.18;
      if (state.environment.steamBaffle && ['f161-service', 'f161-leadworks'].includes(zone.id)) value += 0.11;
      if (state.environment.furnaceExtractor && zone.id === 'f161-furnace') value += 0.04;
      return clamp(value, 0.28, 0.98);
    }

    syncAlien3EnvironmentV96(seconds = 0.016) {
      const state = this.alien3V96; if (!state || !this.player) return null;
      const zone = this.environmentZoneV96();
      if (state.environment.currentZoneId !== zone.id) {
        state.environment.currentZoneId = zone.id;
        state.telemetry.zoneTransitions += 1;
        this.onEvent({ type: 'alien3-v96-atmosphere', action: 'zone', zoneId: zone.id, label: zone.label });
      }
      if (!state.environment.zoneVisits.includes(zone.id)) state.environment.zoneVisits.push(zone.id);
      if (state.environment.zoneVisits.length === ALIEN3_ENVIRONMENT_ZONES_V96.length) this.recoverAlien3EvidenceV96('six-zones-visited', { silent: true });

      const power = this.powerForZoneV96(zone);
      const visibility = this.visibilityForZoneV96(zone);
      const targetTemp = zone.id === 'f161-furnace' && state.environment.furnaceExtractor ? 23 : zone.temperature;
      const steam = zone.steam * (state.environment.steamBaffle && ['f161-service', 'f161-leadworks'].includes(zone.id) ? 0.42 : 1);
      const blend = clamp(seconds * 3, 0, 1);
      state.environment.temperature += (targetTemp - state.environment.temperature) * blend;
      state.environment.powerLevel += (power - state.environment.powerLevel) * blend;
      state.environment.visibility += (visibility - state.environment.visibility) * blend;
      state.environment.steamMask += (steam - state.environment.steamMask) * blend;

      if (zone.id === 'f161-coast') state.environment.wetness = clamp(state.environment.wetness + seconds * 8.5, 0, 100);
      else state.environment.wetness = clamp(state.environment.wetness - seconds * (targetTemp >= 18 ? 7 : 3.2), 0, 100);
      const coldLoad = clamp((11 - targetTemp) / 11, 0, 1) * (0.55 + zone.wind * 0.45) * (0.5 + state.environment.wetness / 120);
      const hotLoad = clamp((targetTemp - 24) / 12, 0, 1) * (state.environment.furnaceExtractor ? 0.45 : 1);
      state.environment.exposure = clamp(state.environment.exposure + seconds * (coldLoad * 2.8 - (coldLoad ? 0 : 3.5)), 0, 100);
      state.environment.thermalStrain = clamp(state.environment.thermalStrain + seconds * (hotLoad * 3.0 - (hotLoad ? 0 : 3.8)), 0, 100);
      state.environment.exposurePeak = Math.max(state.environment.exposurePeak, state.environment.exposure);
      state.environment.thermalPeak = Math.max(state.environment.thermalPeak, state.environment.thermalStrain);
      state.environment.visibilityMin = Math.min(state.environment.visibilityMin, state.environment.visibility);
      state.telemetry.minVisibility = Math.min(state.telemetry.minVisibility, state.environment.visibility);
      if (state.environment.exposure >= 28 && state.environment.wetness >= 25) this.recoverAlien3EvidenceV96('cold-wet-exposure', { silent: true });

      const minds = this.alien3V95?.autonomy?.minds || {};
      const strain = Math.max(state.environment.exposure, state.environment.thermalStrain);
      const stable = strain < 55 && state.environment.visibility > 0.48;
      for (const mind of Object.values(minds)) {
        if (!mind || mind.state === 'triage') continue;
        const before = Number(mind.stress) || 0;
        const delta = stable ? -seconds * (0.8 + power * 0.5) : seconds * (strain > 80 ? 1.8 : 0.35);
        mind.stress = clamp(before + delta, 0, 100);
        if (mind.stress < before) state.climate.stressRelief += before - mind.stress;
      }
      if (stable) state.climate.stableTicks += Math.round(seconds * 10);
      if (state.climate.stressRelief >= 1.5) this.recoverAlien3EvidenceV96('prisoner-climate-stable', { silent: true });

      if (this.alien3V91?.hunter) {
        const lightHeat = Math.max(0, power - 0.45) * 0.55;
        const maskCool = steam * 0.45;
        this.alien3V91.hunter.heat = clamp((Number(this.alien3V91.hunter.heat) || 0) + seconds * (lightHeat - maskCool), 0, 100);
      }
      if (power >= 0.65 || state.environment.steamBaffle) this.recoverAlien3EvidenceV96('visibility-tradeoff', { silent: true });

      state.environment.ambienceClock = Math.max(0, state.environment.ambienceClock - seconds);
      state.acoustics.ambientCueCooldown = Math.max(0, state.acoustics.ambientCueCooldown - seconds);
      if (state.environment.ambienceClock <= 0) {
        this.playAlien3CueV96(zone.cue, { caption: zone.label });
        state.environment.ambienceClock = 6.2;
        state.acoustics.ambientCueCooldown = 2.8;
      }
      return zone;
    }

    updateAlien3ThreatAudioV96(seconds = 0.016) {
      const state = this.alien3V96; const runner = this.alien3RunnerV88;
      if (!state || !runner?.alive || this.alien3V88?.runnerDefeated) return;
      state.acoustics.runnerCueCooldown = Math.max(0, state.acoustics.runnerCueCooldown - seconds);
      state.acoustics.captionClock = Math.max(0, state.acoustics.captionClock - seconds);
      const range = distance(this.player, runner);
      const dx = center(runner).x - center(this.player).x;
      const bearing = Math.abs(dx) < 80 ? 'CENTRE' : dx < 0 ? 'GAUCHE' : 'DROITE';
      const band = range < 320 ? 'critique' : range < 720 ? 'proche' : range < 1200 ? 'lointain' : 'calme';
      const changed = band !== state.acoustics.threatBand || bearing !== state.acoustics.bearing;
      state.acoustics.threatBand = band; state.acoustics.bearing = band === 'calme' ? '—' : bearing;
      if (band === 'calme' || (!changed && state.acoustics.runnerCueCooldown > 0)) return;
      if (bearing === 'GAUCHE') { state.telemetry.leftCaptions += 1; this.recoverAlien3EvidenceV96('runner-bearing-left', { silent: true }); }
      if (bearing === 'DROITE') { state.telemetry.rightCaptions += 1; this.recoverAlien3EvidenceV96('runner-bearing-right', { silent: true }); }
      const caption = `MENACE ${band.toUpperCase()} · ${state.acoustics.bearing}`;
      if (band === 'critique') {
        this.playAlien3CueV96('alien3-runner', { caption, force: true });
        state.telemetry.runnerNearCues += 1;
        this.recoverAlien3EvidenceV96('runner-acoustic-near', { silent: true });
      } else this.playAlien3CueV96('alien3-heartbeat', { caption, force: true });
      state.acoustics.runnerCueCooldown = band === 'critique' ? 1.7 : 2.8;
    }

    alien3V96StationVisible(station) {
      const state = this.alien3V96; if (!state || !station) return false;
      if (station.kind === 'weather') return !state.environment.weatherRead;
      if (station.kind === 'breaker') return !state.environment.breakers[breakerKey[station.zoneId]];
      if (station.kind === 'pa') return !state.environment.prisonPa;
      if (station.kind === 'steam-baffle') return !state.environment.steamBaffle;
      if (station.kind === 'extractor') return !state.environment.furnaceExtractor;
      if (station.kind === 'diagnostic') return !state.acoustics.diagnostic && state.environment.zoneVisits.length >= 6;
      return false;
    }

    alien3NearestStationV96(actor = this.player) {
      if (!actor || !this.alien3V96) return null;
      return this.alien3StationsV96.filter((station) => this.alien3V96StationVisible(station))
        .map((station) => ({ station, range: distance(actor, station) })).filter((entry) => entry.range <= INTERACT_RANGE)
        .sort((a, b) => a.range - b.range)[0]?.station || null;
    }

    activateAlien3UtilityV96(station) {
      const state = this.alien3V96; if (!state || !station) return false;
      if (station.kind === 'weather') {
        state.environment.weatherRead = true; this.recoverAlien3EvidenceV96('storm-telemetry'); this.playAlien3CueV96('alien3-wind', { force: true });
      } else if (station.kind === 'breaker') {
        const key = breakerKey[station.zoneId]; if (!key) return false;
        state.environment.breakers[key] = true; state.telemetry.powerActions += 1;
        this.recoverAlien3EvidenceV96(breakerEvidence[station.zoneId]);
        this.recoverAlien3EvidenceV96('visibility-tradeoff', { silent: true });
        if (this.alien3V91?.hunter) this.alien3V91.hunter.heat = clamp((Number(this.alien3V91.hunter.heat) || 0) + 3, 0, 100);
        this.alien3V95?.resources && this.addAlien3ResourcePressureV95?.(2, `v96-breaker-${key}`);
        this.playAlien3CueV96(station.zoneId === 'f161-leadworks' ? 'alien3-foundry' : 'alien3-mire', { force: true });
      } else if (station.kind === 'pa') {
        state.environment.prisonPa = true;
        for (const mind of Object.values(this.alien3V95?.autonomy?.minds || {})) if (mind) mind.stress = clamp((Number(mind.stress) || 0) - 10, 0, 100);
        if (this.alien3V91?.hunter) this.alien3V91.hunter.heat = clamp((Number(this.alien3V91.hunter.heat) || 0) + 7, 0, 100);
        this.alien3V95?.resources && this.addAlien3ResourcePressureV95?.(3, 'v96-prison-pa');
        this.recoverAlien3EvidenceV96('prison-pa'); this.playAlien3CueV96('alien3-prison', { force: true });
      } else if (station.kind === 'steam-baffle') {
        state.environment.steamBaffle = true; this.recoverAlien3EvidenceV96('steam-baffle'); this.recoverAlien3EvidenceV96('visibility-tradeoff', { silent: true });
        this.playAlien3CueV96('alien3-steam', { force: true });
      } else if (station.kind === 'extractor') {
        state.environment.furnaceExtractor = true; this.recoverAlien3EvidenceV96('furnace-extractor');
        if (this.alien3V91?.hunter) this.alien3V91.hunter.heat = clamp((Number(this.alien3V91.hunter.heat) || 0) + 4, 0, 100);
        this.playAlien3CueV96('alien3-foundry', { force: true });
      } else if (station.kind === 'diagnostic') {
        const enoughCues = state.acoustics.uniqueCues.length >= 6;
        const bearings = state.evidenceRecovered.includes('runner-bearing-left') && state.evidenceRecovered.includes('runner-bearing-right');
        if (!enoughCues || !bearings || !state.acoustics.fallbackSafe) return this.locked?.('6 CUES + CAPTIONS GAUCHE/DROITE REQUIS') ?? false;
        state.acoustics.diagnostic = true; this.recoverAlien3EvidenceV96('acoustic-diagnostic'); this.playAlien3CueV96('alien3-mire', { caption: 'DIAGNOSTIC ACOUSTIQUE VALIDÉ', force: true });
        this.onEvent({ type: 'alien3-v96-diagnostic', cues: state.acoustics.uniqueCues.length, captions: state.acoustics.captions });
      } else return false;
      this.onEvent({ type: 'alien3-v96-utility', stationId: station.id, kind: station.kind });
      this.updateAlien3PerfectV96();
      return true;
    }

    interact(actor = this.player) {
      if (!this.isAlien3MissionV96() || !this.alien3V96) return super.interact(actor);
      const station = this.alien3NearestStationV96(actor);
      if (station && this.activateAlien3UtilityV96(station)) return true;
      return super.interact(actor);
    }

    missingExtractionRequirement(...args) {
      const inherited = super.missingExtractionRequirement?.(...args) || '';
      if (inherited || !this.isAlien3MissionV96() || !this.alien3V96) return inherited;
      if (this.alien3V88?.phase === 'finale' && !this.alien3V96.acoustics.diagnostic) return 'DIAGNOSTIC ACOUSTIQUE V96 NON VALIDÉ';
      return '';
    }

    updateAlien3PerfectV96() {
      const state = this.alien3V96; if (!state) return;
      state.perfectArchive.inheritedV95 = Boolean(this.alien3V95?.perfectArchive?.perfect);
      state.perfectArchive.zonesComplete = state.environment.zoneVisits.length === ALIEN3_ENVIRONMENT_ZONES_V96.length;
      state.perfectArchive.utilitiesComplete = state.environment.weatherRead
        && Object.values(state.environment.breakers).every(Boolean)
        && state.environment.prisonPa && state.environment.steamBaffle && state.environment.furnaceExtractor;
      state.perfectArchive.acousticComplete = state.acoustics.uniqueCues.length === ALIEN3_AUDIO_CUES_V96.length
        && state.evidenceRecovered.includes('runner-bearing-left') && state.evidenceRecovered.includes('runner-bearing-right');
      state.perfectArchive.climateComplete = state.environment.exposurePeak < 90 && state.environment.thermalPeak < 90 && state.climate.exposureBreaks === 0;
      state.perfectArchive.diagnosticComplete = state.acoustics.diagnostic;
      const required = ALIEN3_V96_EVIDENCE_IDS.filter((id) => id !== 'perfect-atmosphere');
      const ready = Object.entries(state.perfectArchive).filter(([key]) => !['perfect'].includes(key)).every(([, value]) => value === true)
        && required.every((id) => state.evidenceRecovered.includes(id));
      if (!state.perfectArchive.perfect && ready) {
        state.perfectArchive.perfect = true; this.recoverAlien3EvidenceV96('perfect-atmosphere');
        this.onEvent({ type: 'alien3-v96-perfect', evidence: state.evidenceRecovered.length, cues: state.acoustics.uniqueCues.length });
      }
    }

    update(delta) {
      const result = super.update(delta);
      if (!this.isAlien3MissionV96() || !this.alien3V96 || this.mission?.state !== 'active') return result;
      const seconds = clamp(delta, 0, 0.25);
      this.syncAlien3EnvironmentV96(seconds);
      this.updateAlien3ThreatAudioV96(seconds);
      this.updateAlien3PerfectV96();
      return result;
    }

    computeAlien3AchievementsV96() {
      const state = this.alien3V96; if (!state) return [];
      const ids = [];
      if (state.environment.zoneVisits.length === 6) ids.push('v96-six-microclimates');
      if (Object.values(state.environment.breakers).every(Boolean)) ids.push('v96-emergency-power');
      if (state.acoustics.uniqueCues.length === 8) ids.push('v96-full-soundscape');
      if (state.telemetry.leftCaptions > 0 && state.telemetry.rightCaptions > 0) ids.push('v96-heard-both-sides');
      if (state.environment.exposurePeak < 70 && state.environment.thermalPeak < 70) ids.push('v96-climate-disciplined');
      if (state.acoustics.diagnostic) ids.push('v96-acoustic-certified');
      if (state.perfectArchive.perfect) ids.push('v96-atmosphere-perfect');
      return [...new Set(ids)];
    }

    completeAlien3MissionV89(actor = this.player) {
      if (!this.isAlien3MissionV96() || !this.alien3V96) return super.completeAlien3MissionV89(actor);
      const emit = this.onEvent; let completionEvent = null;
      this.onEvent = (event) => { if (event?.type === 'mission-complete') { completionEvent = event; return; } emit(event); };
      let completed = false;
      try { completed = super.completeAlien3MissionV89(actor); } finally { this.onEvent = emit; }
      if (!completed) return false;
      this.updateAlien3PerfectV96();
      const state = this.alien3V96; state.achievementIds = this.computeAlien3AchievementsV96();
      const baseRewards = isRecord(this.mission.rewards) ? this.mission.rewards : {};
      const utilityCount = Number(state.environment.weatherRead) + Object.values(state.environment.breakers).filter(Boolean).length
        + Number(state.environment.prisonPa) + Number(state.environment.steamBaffle) + Number(state.environment.furnaceExtractor);
      const grade = alien3V96Grade({
        gradeV95: baseRewards.mireGradeV95 || 'D', evidence: state.evidenceRecovered.length,
        zones: state.environment.zoneVisits.length, cues: state.acoustics.uniqueCues.length, utilities: Math.min(6, utilityCount),
        exposurePeak: state.environment.exposurePeak, thermalPeak: state.environment.thermalPeak,
        diagnostic: state.acoustics.diagnostic, perfect: state.perfectArchive.perfect
      });
      const gradeBonus = { 'S+++++++': 1820, 'S++++++': 1560, 'S+++++': 1320, 'S++++': 1080, 'S+++': 850, 'S++': 650, 'S+': 480, S: 330, A: 220, B: 120, C: 50, D: 0 }[grade] || 0;
      this.mission.rewards = {
        ...baseRewards,
        credits: (Number(baseRewards.credits) || 0) + 280 + gradeBonus,
        alien3V96: true, mireGradeV96: grade,
        v96EvidenceRecovered: [...state.evidenceRecovered], v96CodexUnlocked: [...state.codexUnlocked], v96Achievements: [...state.achievementIds],
        atmosphereV96: {
          zonesVisited: [...state.environment.zoneVisits], exposurePeak: Math.round(state.environment.exposurePeak), thermalPeak: Math.round(state.environment.thermalPeak),
          visibilityMin: Number(state.environment.visibilityMin.toFixed(2)), powerActions: state.telemetry.powerActions
        },
        acousticsV96: { cues: [...state.acoustics.uniqueCues], captions: state.acoustics.captions, diagnostic: state.acoustics.diagnostic, fallbackSafe: state.acoustics.fallbackSafe },
        perfectArchiveV96: { ...state.perfectArchive }
      };
      for (const achievementId of state.achievementIds) emit({ type: 'alien3-v96-achievement', achievementId });
      emit(completionEvent ? { ...completionEvent, rewards: this.mission.rewards }
        : { type: 'mission-complete', kills: Number(this.player?.kills) || 0, rewards: this.mission.rewards, extractedBy: 'primary' });
      return true;
    }

    getInteractionPrompt(actor = this.player) {
      if (!this.isAlien3MissionV96() || !this.alien3V96) return super.getInteractionPrompt(actor);
      const station = this.alien3NearestStationV96(actor);
      if (station) return `E  ${station.label}`;
      if (this.alien3V96.acoustics.threatBand !== 'calme') return `AUDIO · ${this.alien3V96.acoustics.threatBand.toUpperCase()} · ${this.alien3V96.acoustics.bearing}`;
      return super.getInteractionPrompt(actor);
    }

    drawAlien3StationV96(ctx, station) {
      ctx.save();
      ctx.fillStyle = station.kind === 'diagnostic' ? 'rgba(24,43,46,.94)' : station.kind === 'breaker' ? 'rgba(57,49,30,.94)' : 'rgba(42,44,38,.94)';
      ctx.strokeStyle = station.kind === 'diagnostic' ? '#80aeb5' : station.kind === 'breaker' ? '#b6a166' : '#87947e';
      ctx.lineWidth = 2; ctx.fillRect(station.x, station.y, station.w, station.h); ctx.strokeRect(station.x + 1, station.y + 1, station.w - 2, station.h - 2);
      ctx.fillStyle = '#d8d2ac'; ctx.fillRect(station.x + 9, station.y + 10, Math.max(8, station.w - 18), 7); ctx.restore();
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (!this.isAlien3MissionV96() || !this.alien3V96 || !ctx) return;
      for (const station of this.alien3StationsV96) if (this.alien3V96StationVisible(station)) this.drawAlien3StationV96(ctx, station);
      const zone = alien3V96Zone(this.alien3V96.environment.currentZoneId);
      const t = Number(this.animationTime) || 0;
      ctx.save();
      if (zone.id === 'f161-coast') {
        ctx.strokeStyle = 'rgba(190,205,200,.18)'; ctx.lineWidth = 1;
        for (let i = 0; i < 10; i += 1) { const x = zone.id.length * 13 + ((i * 73 + t * 110) % 760); const y = 80 + ((i * 49 + t * 80) % 520); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 34); ctx.stroke(); }
      } else if (['f161-service', 'f161-leadworks'].includes(zone.id)) {
        ctx.fillStyle = `rgba(220,214,194,${0.035 + this.alien3V96.environment.steamMask * 0.04})`;
        for (let i = 0; i < 6; i += 1) ctx.fillRect((center(this.player).x - 220) + i * 82, 370 + ((i * 31 + t * 15) % 120), 42, 10);
      } else if (zone.id === 'f161-furnace') {
        ctx.fillStyle = 'rgba(225,124,67,.18)';
        for (let i = 0; i < 8; i += 1) ctx.fillRect((center(this.player).x - 180) + ((i * 47 + t * 34) % 360), 520 - ((i * 29 + t * 26) % 160), 3, 3);
      }
      ctx.restore();
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isAlien3MissionV96() || !this.alien3V96 || !ctx) return;
      const state = this.alien3V96; const zone = alien3V96Zone(state.environment.currentZoneId);
      ctx.save(); ctx.fillStyle = 'rgba(3,5,5,.94)'; ctx.fillRect(902, 570, 360, 92); ctx.strokeStyle = '#526863'; ctx.strokeRect(902.5, 570.5, 359, 91);
      ctx.font = '10px monospace'; ctx.fillStyle = '#d5d9b1';
      ctx.fillText(`V96 · ${zone.label} · ${Math.round(state.environment.temperature)}°C · VIS ${Math.round(state.environment.visibility * 100)}% · PWR ${Math.round(state.environment.powerLevel * 100)}%`, 914, 589);
      ctx.fillStyle = '#aeb9a6'; ctx.fillText(`EXPO ${Math.round(state.environment.exposure)} · HUM ${Math.round(state.environment.wetness)} · THERM ${Math.round(state.environment.thermalStrain)} · VAPEUR ${Math.round(state.environment.steamMask * 100)}%`, 914, 608);
      const caption = state.acoustics.captionClock > 0 ? state.acoustics.lastCaption : `${state.acoustics.threatBand.toUpperCase()} · ${state.acoustics.bearing}`;
      ctx.fillText(`AUDIO ${state.acoustics.uniqueCues.length}/${ALIEN3_AUDIO_CUES_V96.length} · ${caption}`, 914, 627);
      ctx.fillText(state.perfectArchive.perfect ? 'ARCHIVE ATMOSPHÈRE PARFAITE' : `PREUVES ${state.evidenceRecovered.length}/${ALIEN3_V96_EVIDENCE_IDS.length} · DIAG ${state.acoustics.diagnostic ? 'OK' : '—'}`, 914, 646);
      ctx.restore();
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isAlien3MissionV96() || !this.alien3V96) return base;
      return { ...base, specialOperation: { ...(isRecord(base.specialOperation) ? base.specialOperation : {}), alien3V96: sanitizeAlien3StateV96(this.alien3V96) } };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.alien3V96 || rawState?.alien3V96;
      const result = super.applyResumeState(rawState);
      if (!this.isAlien3MissionV96() || !result?.applied) return result;
      if (!isRecord(source) || Number(source.schema) !== ALIEN3_DLC_SCHEMA_V96) return result;
      this.alien3V96 = sanitizeAlien3StateV96(source); this.pendingAlien3ResumeV96 = this.alien3V96; this.updateAlien3PerfectV96();
      return { ...result, restored: (Number(result.restored) || 0) + 1, alien3DlcRestoredV96: true };
    }

    getAlien3SnapshotV96() {
      if (!this.isAlien3MissionV96() || !this.alien3V96) return { alien3V96: null };
      return { alien3V96: { ...sanitizeAlien3StateV96(this.alien3V96), codexTotal: ALIEN3_CODEX_V96.length, evidenceTotal: ALIEN3_V96_EVIDENCE_IDS.length, zoneTotal: ALIEN3_ENVIRONMENT_ZONES_V96.length, audioCueTotal: ALIEN3_AUDIO_CUES_V96.length, stationTotal: ALIEN3_V96_STATIONS.length } };
    }

    getGameplayReport() { const report = super.getGameplayReport(); return this.isAlien3MissionV96() ? { ...report, alien3V96: this.getAlien3SnapshotV96().alien3V96 } : report; }
    getSnapshot() { return { ...super.getSnapshot(), ...this.getAlien3SnapshotV96() }; }
  };
}
