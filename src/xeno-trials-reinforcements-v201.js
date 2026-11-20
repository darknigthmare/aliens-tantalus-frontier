import { getXenoTrialsHordeProtocolV180, XENO_TRIALS_HORDE_LIMITS_V180 } from './xeno-trials-horde-v180.js';

// The director's delays are the engine's fixed 120 Hz ticks. Keep this view
// independent of the engine module, which itself imports the horde director.
const tickRate = 120;
const waveArrivalTicks = 48;
const replacementArrivalTicks = 30;

/** Telemetry from the director's saved clocks. The scene does not schedule
 * enemies, assume an entry flank or add any state to a checkpoint. */
export function getXenoTrialsReinforcementV201(match) {
  const state = match?.hordeV180;
  const tick = match?.tick;
  if (!state || match.phase !== 'active' || match.result || match.presentation?.blocksSimulation
    || !Number.isSafeInteger(tick) || tick < 0) return null;

  const { intermissionTicks, reinforcementTicks } = XENO_TRIALS_HORDE_LIMITS_V180;
  if (state.phase === 'intermission' && state.nextWaveTick > tick
    && state.nextWaveTick <= tick + intermissionTicks) {
    return waveCue(state, tick, state.wave + 1, 'incoming');
  }
  if (state.phase !== 'active') return null;
  if (state.wave > 1 && state.nextWaveTick > 0 && tick >= state.nextWaveTick
    && tick < state.nextWaveTick + waveArrivalTicks) {
    return waveCue(state, tick, state.wave, 'arrived');
  }

  // Population slots can reopen between waves. Only show a pending contact
  // while both the reserve and the concurrent slot actually exist.
  const lastSpawnTick = state.nextSpawnTick - reinforcementTicks;
  if (state.waveSpawned > state.concurrent && tick >= lastSpawnTick
    && tick < lastSpawnTick + replacementArrivalTicks) {
    return cue('replacement', 'arrived', state.wave, state.waveCount, tick, lastSpawnTick, 1);
  }
  if (state.remaining > 0 && state.alive < state.concurrent && state.nextSpawnTick > tick
    && state.nextSpawnTick <= tick + reinforcementTicks) {
    return cue('replacement', 'incoming', state.wave, state.waveCount, tick, state.nextSpawnTick, 1);
  }
  return null;
}

function waveCue(state, tick, wave, phase) {
  const protocol = getXenoTrialsHordeProtocolV180(state.protocolId);
  const entry = protocol?.waves[wave - 1];
  if (!entry) return null;
  return cue('wave', phase, wave, state.waveCount, tick, state.nextWaveTick,
    Math.min(entry.total, entry.concurrent), protocol.bossFinaleV186?.wave === wave);
}

function cue(kind, phase, wave, waveCount, tick, arrivalTick, contacts, major = false) {
  const incoming = phase === 'incoming';
  const remainingTicks = Math.max(0, arrivalTick - tick);
  const seconds = Math.ceil(remainingTicks * 10 / tickRate) / 10;
  const signal = major ? incoming ? 'CONTACT MAJEUR EN APPROCHE' : 'CONTACT MAJEUR ACTIF'
    : incoming ? 'RENFORTS EN APPROCHE' : 'CONTACTS HOSTILES';
  const label = [signal, kind === 'wave' && `VAGUE ${wave} / ${waveCount}`, incoming && `${seconds} s`]
    .filter(Boolean).join(' · ');
  return Object.freeze({ kind, phase, wave, arrivalTick, remainingTicks, contacts, major, label });
}

/** Twin confinement instruments on the rear plane. The lenses use a slower
 * parallax than their housings, and the clip ends above the combat floor. */
export function drawXenoTrialsReinforcementV201(ctx, match, camera, reducedMotion = false) {
  const view = getXenoTrialsReinforcementV201(match);
  if (!view) return null;
  const incoming = view.phase === 'incoming';
  const floor = camera.floor;
  const cameraOffset = camera.center - 500;
  const elapsed = match.tick - view.arrivalTick;
  const duration = view.kind === 'wave' ? waveArrivalTicks : replacementArrivalTicks;
  const warning = view.kind === 'wave' ? XENO_TRIALS_HORDE_LIMITS_V180.intermissionTicks
    : XENO_TRIALS_HORDE_LIMITS_V180.reinforcementTicks;
  const opening = reducedMotion ? incoming ? .34 : .85 : incoming
    ? .18 + Math.pow(1 - view.remainingTicks / warning, 2) * .62
    : .85 - .50 * elapsed / duration;
  const intensity = incoming || reducedMotion ? 1 : 1 - .4 * elapsed / duration;
  const color = view.major ? '#f08a62' : '#f5c078';
  const clipBottom = Math.round(floor * .76);
  const y = Math.round(floor * .31);
  const fixtures = Object.freeze([136, 864].map(anchor => anchor - cameraOffset * .24));
  const windows = Object.freeze([136, 864].map(anchor => anchor - cameraOffset * .12));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1000, clipBottom); ctx.clip();
  for (const [index, x] of fixtures.entries()) {
    const rearX = windows[index];
    ctx.fillStyle = color; ctx.globalAlpha = .11 * intensity;
    ctx.beginPath(); ctx.moveTo(rearX - 12, y + 20); ctx.lineTo(rearX + 12, y + 20);
    ctx.lineTo(rearX + 57, y + 117); ctx.lineTo(rearX - 57, y + 117); ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#101d23'; ctx.strokeStyle = '#76888b'; ctx.lineWidth = 1.5;
    ctx.globalAlpha = .78 * intensity; ctx.fillRect(x - 38, y, 76, 42); ctx.strokeRect(x - 38, y, 76, 42);
    ctx.fillStyle = color; ctx.globalAlpha = .92 * intensity; ctx.fillRect(x - 30, y + 8, 60, 13);
    const shutter = 30 * (1 - opening);
    ctx.fillStyle = '#203036'; ctx.globalAlpha = .91 * intensity;
    ctx.fillRect(x - 30, y + 8, shutter, 13); ctx.fillRect(x + 30 - shutter, y + 8, shutter, 13);
    ctx.fillStyle = color; ctx.globalAlpha = .72 * intensity;
    for (let i = 0; i < view.contacts; i++) ctx.fillRect(x - (view.contacts * 7 - 2) / 2 + i * 7, y + 29, 5, 4);
  }
  ctx.restore();
  return Object.freeze({ ...view, clipBottom, fixtures, windows, opening, reducedMotion });
}
