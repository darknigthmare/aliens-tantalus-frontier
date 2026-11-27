import { getMirroredXenoTrialsInputV208 } from './xeno-trials-practice-v208.js';

export const XENO_TRIALS_PRACTICE_RECORDING_LIMIT_V209 = 960;
const MIN_RECORDING_TICKS = 24;
// Bit positions are part of the persisted schema. Add new controls only at the end.
const RECORDED_ACTIONS = Object.freeze(['left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super',
  'crouch', 'evade', 'antiAir', 'parry', 'signature2', 'signature3']);
const MAX_MASK = 2 ** RECORDED_ACTIONS.length - 1;
const maskFor = input => RECORDED_ACTIONS.reduce((mask, action, index) => mask + (input?.[action] === true ? 2 ** index : 0), 0);
const inputFor = mask => Object.fromEntries(RECORDED_ACTIONS.filter((_, index) => (mask & (2 ** index)) !== 0).map(action => [action, true]));

export function normalizeXenoTrialsRecordingV209(value) {
  if (value?.version !== 209 || !Array.isArray(value.runs) || value.runs.length > XENO_TRIALS_PRACTICE_RECORDING_LIMIT_V209) return null;
  let duration = 0;
  const runs = [];
  for (const run of value.runs) {
    if (!Array.isArray(run) || run.length !== 2) return null;
    const [ticks, mask] = run;
    if (!Number.isSafeInteger(ticks) || ticks <= 0 || !Number.isSafeInteger(mask) || mask < 0 || mask > MAX_MASK) return null;
    duration += ticks;
    if (duration > XENO_TRIALS_PRACTICE_RECORDING_LIMIT_V209) return null;
    const previous = runs.at(-1);
    if (previous?.[1] === mask) previous[0] += ticks;
    else runs.push([ticks, mask]);
  }
  if (duration < MIN_RECORDING_TICKS) return null;
  return { version: 209, duration, runs };
}

const CONTACT_TYPES = Object.freeze({ hit: 'impact', block: 'block', 'guard-break': 'rupture', 'parry-v208': 'parry' });
const emptyTotals = () => ({ impacts: 0, damage: 0, blocks: 0, ruptures: 0, parries: 0 });

export function createXenoTrialsPracticeObserverV209(savedRecording) {
  let recording = normalizeXenoTrialsRecordingV209(savedRecording), captured = null, duration = 0;
  let recorded = null, lastEvent = 0, lastContact = null, recordingError = false;
  let playbackRound = 0, firstPlaybackTick = 0;
  const totals = { player: emptyTotals(), opponent: emptyTotals() };
  const expanded = recording?.runs.flatMap(([ticks, mask]) => Array(ticks).fill(mask)) || [];

  function startRecording() {
    if (captured || recorded) return false;
    captured = []; duration = 0; recordingError = false; return true;
  }
  function stopRecording() {
    if (!captured) return false;
    recorded = normalizeXenoTrialsRecordingV209({ version: 209, runs: captured });
    captured = null; recordingError = !recorded;
    return Boolean(recorded);
  }
  function sample(input) {
    if (!captured) return;
    const mask = maskFor(input), last = captured.at(-1);
    if (last?.[1] === mask) last[0]++;
    else captured.push([1, mask]);
    if (++duration === XENO_TRIALS_PRACTICE_RECORDING_LIMIT_V209) stopRecording();
  }
  function playingInput(tick, round) {
    if (!expanded.length) return {};
    if (playbackRound !== round) { firstPlaybackTick = tick; playbackRound = round; }
    const index = (tick - firstPlaybackTick) % (expanded.length + 1);
    // Each loop and each round begins with a release tick for the native edge gate.
    return index === 0 ? {} : getMirroredXenoTrialsInputV208(inputFor(expanded[index - 1]));
  }
  function observe(events) {
    for (const event of events) {
      if (event.id <= lastEvent) continue;
      lastEvent = event.id;
      const kind = Object.hasOwn(CONTACT_TYPES, event.type) ? CONTACT_TYPES[event.type] : null;
      if (!kind || !Object.hasOwn(totals, event.side) || !Object.hasOwn(totals, event.attacker)) continue;
      const source = totals[event.attacker], target = totals[event.side];
      if (kind === 'impact') source.impacts++;
      if (kind === 'rupture') source.ruptures++;
      if (kind === 'parry') target.parries++;
      if (kind === 'block') target.blocks++;
      source.damage += event.damage;
      lastContact = { id: event.id, tick: event.tick, kind, source: event.attacker, target: event.side, damage: event.damage };
    }
  }
  function view() {
    return { player: { ...totals.player }, opponent: { ...totals.opponent }, lastContact: lastContact ? { ...lastContact } : null,
      recording: { active: Boolean(captured), duration, available: recording?.duration ?? 0, ready: Boolean(recorded), error: recordingError } };
  }
  function acknowledgeRecording() { if (recorded) recording = recorded; recorded = null; }
  return { startRecording, stopRecording, sample, playingInput, observe, view, acknowledgeRecording,
    pendingRecording: () => recorded && normalizeXenoTrialsRecordingV209(recorded) };
}

const drill = (id, title, briefing, objectives, options) => Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
export const XENO_TRIALS_NEW_DRILLS_V209 = Object.freeze([
  drill('acid-floor', 'Évacuation acide', 'La Reine projette de l’acide. Après le premier contact avec une flaque, quittez la zone au sol pour éviter la pulsation suivante.',
    ['Repérer une flaque acide', 'Subir le premier contact au sol', 'Sortir de la flaque et éviter la pulsation suivante'],
    { playerId: 'runner', opponentId: 'drive-v123-fte-pathogen-queen-right-v13', pressure: 'special', stationary: true }),
  drill('legal-counter', 'Riposte sans spécial', 'Les techniques spéciales sont verrouillées. Bloquez une attaque légale du Spitter, puis touchez-le avec une frappe légère.',
    ['Bloquer une frappe de l’IA', 'Toucher avec une frappe légère'],
    { opponentId: 'spitter', behavior: 'cpu', noSpecial: true, difficulty: 'hard' })
]);
