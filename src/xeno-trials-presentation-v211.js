import { getXenoTrialsArtV96, getXenoTrialsFighterV96, XENO_TRIALS_FIGHTERS_V96 } from './xeno-trials-data-v96.js';
import { XENO_PRESENTATION_V97 } from './xeno-trials-presentation-v97.js';
import {
  getXenoTrialsRigV154, getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig,
  sampleXenoTrialsSequenceAnglesV211, XENO_TRIALS_RIGS_V154
} from './xeno-trials-rig-v154.js';

const historical = new Set(XENO_TRIALS_RIGS_V154.map(rig => rig.fighterId));
const pilots = new Set([
  'import-game-afe2-warden', 'import-game-afe2-exploder', 'import-game-afe2-harbinger',
  'drive-v123-fte-pathogen-brute-profile-v13', 'drive-v123-fte-pathogen-queen-right-v13',
]);
const oldPilotClips = new Set(['intro', 'win-r1', 'lose-r1', 'win-final', 'lose-final', 'outro']);
const marks = Object.freeze({
  intro: 'Entrée en vigilance', 'intro-rival': 'Observation du contact', 'win-r1': 'Avantage de manche',
  'lose-r1': 'Récupération de manche', 'win-final': 'Évaluation remportée', 'lose-final': 'Évaluation perdue',
  draw: 'Récupération à égalité', outro: 'Retour à la vigilance', taunt: 'Défi de simulation', rematch: 'Appuis de reprise',
});
const familyGain = Object.freeze({ human: .7, synthetic: .82, xenomorph: 1, pathogen: 1.12, engineer: .91, hybrid: 1.05 });
const roundMs = 1800;
const neutral = Object.freeze({});
const clamp = value => Math.max(0, Math.min(1, value));
const ease = x => x * x * (3 - 2 * x);

function admittedRig(definition, art) {
  return getXenoTrialsRuntimeArticulatedRig(definition, art)
    || getXenoTrialsRuntimeDefenseRig(definition, art)
    || getXenoTrialsRigV154(definition, art);
}

function scaled(angles, factor) {
  return Object.fromEntries(Object.entries(angles).map(([joint, angle]) => [joint, angle * factor]));
}

function posesFor(rig, definition) {
  const { poses } = rig;
  const approach = poses.intro ?? poses.guard;
  const victory = poses['round-win'] ?? scaled(poses.guard, -1);
  const absorb = poses['round-loss'] ?? poses.hurt;
  const recover = poses.recovery ?? poses.release ?? poses.recover;
  const assess = poses.struggle ?? poses['guard-break'] ?? approach;
  const key = (at, beat, angles = neutral) => ({ at, beat, angles });
  const plant = definition.role === 'agile' ? .36 : definition.role === 'tank' ? .62 : .52;
  const setback = definition.family === 'synthetic' ? .63 : .48;
  return {
    intro: [key(0, 'approach'), key(.18, 'observe', scaled(approach, -.45)), key(plant, 'plant', approach),
      key(.81, 'brace', scaled(recover, .32)), key(1, 'ready')],
    'intro-rival': [key(0, 'ready'), key(.27, 'notice', scaled(approach, .52)),
      key(.56, 'assess', scaled(assess, .65)), key(1, 'ready')],
    'win-r1': [key(0, 'stop'), key(.22, 'verify', victory), key(.52, 'guard', scaled(approach, .66)),
      key(.78, 'reset-support', scaled(recover, .35)), key(1, 'ready')],
    'lose-r1': [key(0, 'stop'), key(.16, 'absorb', absorb), key(setback, 'recover', scaled(recover, .55)),
      key(.81, 'brace', scaled(approach, .42)), key(1, 'ready')],
    'win-final': [key(0, 'stop'), key(.25, 'confirm', scaled(victory, .65)), key(.55, 'survey', approach),
      key(.79, 'hold', victory), key(1, 'vigilance', scaled(victory, .48))],
    'lose-final': [key(0, 'stop'), key(.19, 'absorb', absorb), key(setback, 'lower', scaled(absorb, .82)),
      key(.82, 'settle', scaled(recover, .42)), key(1, 'rest', scaled(absorb, .42))],
    draw: [key(0, 'stop'), key(.2, 'breathe', scaled(absorb, .67)), key(.53, 'check', scaled(recover, .49)),
      key(.79, 'balance', scaled(approach, .29)), key(1, 'rest')],
    taunt: [key(0, 'ready'), key(.2, 'gather', scaled(approach, -.64)), key(.53, 'signal', scaled(assess, .85)),
      key(.77, 'watch', scaled(victory, .48)), key(1, 'ready')],
    rematch: [key(0, 'set'), key(.19, 'recheck', scaled(recover, .56)), key(.47, 'plant', scaled(approach, .73)),
      key(.76, 'brace', scaled(victory, .35)), key(1, 'ready')],
    outro: [key(0, 'settled'), key(.29, 'watch', scaled(approach, .42)), key(.68, 'recenter', scaled(recover, .25)),
      key(1, 'ready')],
  };
}

const recipes = new Map();
for (const definition of XENO_TRIALS_FIGHTERS_V96) {
  if (historical.has(definition.id)) continue;
  const rig = admittedRig(definition, getXenoTrialsArtV96(definition.id));
  if (!rig) continue;
  const clips = posesFor(rig, definition);
  if (pilots.has(definition.id)) for (const kind of oldPilotClips) delete clips[kind];
  recipes.set(rig, Object.freeze(clips));
}

/** Public receipts only describe authored render beats, independently of match input and scores. */
export const XENO_TRIALS_PRESENTATIONS_V211 = Object.freeze([...recipes].flatMap(([rig, clips]) =>
  Object.keys(clips).map(kind => Object.freeze({
    id: `${rig.fighterId}::${kind}`, fighterId: rig.fighterId, profileId: rig.profileId, rigId: rig.id,
    sourcePath: rig.path, sourceSha256: rig.sourceSha256, kind, label: marks[kind], canonExact: false,
  }))));

export function getXenoTrialsPresentationRigV211(definition, art) {
  const rig = admittedRig(definition, art);
  return recipes.has(rig) ? rig : null;
}
export function canDrawXenoTrialsPresentationV211(rig, image) {
  return recipes.has(rig) && Boolean(image && image.complete !== false && image.naturalWidth === rig.sourceWidth
    && image.naturalHeight === rig.sourceHeight);
}

function rigFor(fighter) {
  return getXenoTrialsPresentationRigV211(getXenoTrialsFighterV96(fighter?.id),
    fighter && getXenoTrialsArtV96(fighter.id, fighter.variant));
}

function isDuel(match) {
  return match?.fighters?.length === 2 && !match.hordeV180 && !match.operationV188;
}

function hasVerdict(match) {
  return isDuel(match) && match.phase === 'match-over' && match.result?.completed === true
    && match.result.matchId === match.config?.matchId && match.result.durationTicks === match.tick;
}

function grounded(fighter) {
  return fighter?.y === 0 && Number.isFinite(fighter.x) && [-1, 1].includes(fighter.facing);
}

const internalKinds = Object.freeze({ 'win-final': 'outro-win', 'lose-final': 'outro-loss' });

function participant(fighter, rig, kind, previousKind) {
  return {
    side: fighter.side, fighterId: fighter.id, rigId: rig.id,
    sequenceId: `${fighter.id}::${kind}`, kind: internalKinds[kind] || kind,
    presentationKindV211: kind, revision: 211, ...(previousKind && { previousKind }),
  };
}

/** Participants join the existing guarded timestamp. They cannot start or settle a combat transaction. */
export function getXenoTrialsPresentationParticipantsV211(match, phase, previousOutro, images) {
  if (!hasVerdict(match)) return [];
  if (phase === 'draw' ? match.result.winner !== 'draw' : !['player', 'opponent'].includes(match.result.winner)) return [];
  return match.fighters.flatMap(fighter => {
    const rig = grounded(fighter) && rigFor(fighter);
    if (!rig || images && !canDrawXenoTrialsPresentationV211(rig, images.get(rig.path))) return [];
    const wins = fighter.side === match.result.winner;
    const kind = phase === 'verdict' ? wins ? 'win-final' : 'lose-final' : phase;
    if (!recipes.get(rig)?.[kind] || wins && fighter.hp <= 0) return [];
    if (phase === 'outro') {
      const previous = previousOutro?.participants?.find(entry => entry.revision === 211 && entry.side === fighter.side
        && entry.fighterId === fighter.id && entry.rigId === rig.id);
      return fighter.hp > 0 && previous ? [participant(fighter, rig, kind, previous.kind)] : [];
    }
    return [participant(fighter, rig, kind)];
  });
}

export function getXenoTrialsTauntRigV211(match, fighter, images) {
  const rig = isDuel(match) && rigFor(fighter);
  return recipes.get(rig)?.taunt && (!images || canDrawXenoTrialsPresentationV211(rig, images.get(rig.path))) ? rig : null;
}

function signedParticipant(match, fighter, rig, clock) {
  if (!hasVerdict(match) || clock?.matchId !== match.config.matchId || clock.terminalTick !== match.tick
    || !['playing', 'complete'].includes(clock.phase) || !Number.isFinite(clock.durationMs) || clock.durationMs <= 0
    || !Number.isFinite(clock.elapsedMs) || clock.elapsedMs < 0) return null;
  const winner = match.result.winner;
  const wins = winner === fighter.side;
  const verdictKind = wins ? 'win-final' : 'lose-final';
  const kind = clock.kind ?? 'verdict';
  if (!['verdict', 'outro', 'draw'].includes(kind)) return null;
  const expected = kind === 'verdict' ? verdictKind : kind;
  if (kind === 'draw' ? winner !== 'draw' : !['player', 'opponent'].includes(winner)) return null;
  if (kind === 'outro' && fighter.hp <= 0 || kind === 'verdict' && wins && fighter.hp <= 0) return null;
  return clock.participants?.find(entry => entry.revision === 211 && entry.side === fighter.side
    && entry.fighterId === fighter.id && entry.rigId === rig.id && entry.presentationKindV211 === expected
    && entry.sequenceId === `${fighter.id}::${expected}`
    && (kind !== 'outro' || entry.previousKind === internalKinds[verdictKind]));
}

function selectCue(match, fighter, rig, { presentation, outro, terminal, taunt }) {
  if (match.phase === 'match-over') {
    for (const clock of [terminal, outro]) {
      const entry = signedParticipant(match, fighter, rig, clock);
      if (entry) return { kind: entry.presentationKindV211, elapsedMs: clock.elapsedMs, durationMs: clock.durationMs,
        previousKind: entry.previousKind, fixed: clock.skipped || clock.reducedMotion };
    }
    return null;
  }
  if (match.phase === 'round-over') {
    const elapsedMs = roundMs - match.phaseTime * 1000;
    if (match.roundWinner === 'draw') return { kind: 'draw', elapsedMs, durationMs: roundMs };
    if (!['player', 'opponent'].includes(match.roundWinner)) return null;
    return { kind: fighter.side === match.roundWinner ? 'win-r1' : 'lose-r1', elapsedMs, durationMs: roundMs };
  }
  if (match.phase !== 'active' || fighter.hp <= 0) return null;
  if (presentation?.blocksSimulation && [0, 1].includes(presentation.fighterSlot)) {
    const selected = presentation.fighterSlot === match.fighters.indexOf(fighter);
    const opponent = getXenoTrialsFighterV96(match.fighters[presentation.fighterSlot].id);
    return { kind: selected ? 'intro' : 'intro-rival', elapsedMs: presentation.elapsedMs,
      durationMs: XENO_PRESENTATION_V97.introMs, gain: selected ? 1 : familyGain[opponent?.family] ?? 1 };
  }
  if (presentation?.phase === 'countdown' && match.round > 1)
    return { kind: 'rematch', elapsedMs: presentation.elapsedMs, durationMs: XENO_PRESENTATION_V97.countdownMs };
  if (!presentation?.blocksSimulation && taunt?.phase === 'playing' && fighter.side === 'player'
    && taunt.matchId === match.config.matchId && taunt.round === match.round && taunt.fighterId === fighter.id && taunt.rigId === rig.id)
    return { kind: 'taunt', elapsedMs: taunt.elapsedMs, durationMs: taunt.durationMs };
  return null;
}

function sampleKeys(keys, progress, gain = 1) {
  const index = Math.max(1, keys.findIndex(key => key.at >= progress));
  const a = keys[index - 1], b = keys[index];
  const time = ease((progress - a.at) / (b.at - a.at));
  const joints = new Set([...Object.keys(a.angles), ...Object.keys(b.angles)]);
  return {
    beat: progress === b.at ? b.beat : a.beat,
    angles: Object.fromEntries([...joints].map(joint => [joint,
      ((a.angles[joint] ?? 0) * (1 - time) + (b.angles[joint] ?? 0) * time) * gain])),
  };
}

function lowerBody(frame, rig, progress) {
  // Contract the articulated silhouette above the measured pin line. Feet and
  // weapons remain attached to their owners' mesh, and world collision is untouched.
  const pin = rig.pinned[1];
  const compression = 1 - .36 * ease(clamp((progress - .16) / .52));
  const place = ([x, y]) => [x, y < pin ? pin + (y - pin) * compression : y];
  return { ...frame, active: true, vertices: frame.vertices.map(place),
    contacts: Object.fromEntries(Object.entries(frame.contacts).map(([name, point]) => [name, place(point)])) };
}

export function getXenoTrialsPresentationPoseV211(rig, match, fighter, clocks = {}, reducedMotion = false) {
  const clips = recipes.get(rig);
  if (!clips || !isDuel(match) || !grounded(fighter) || !match.fighters.includes(fighter) || rigFor(fighter) !== rig) return null;
  const cue = selectCue(match, fighter, rig, clocks);
  let keys = cue && clips[cue.kind];
  if (!keys || !Number.isFinite(cue.elapsedMs) || !Number.isFinite(cue.durationMs) || cue.durationMs <= 0) return null;
  const restingKo = match.phase === 'match-over' && fighter.hp <= 0 && ['lose-final', 'draw'].includes(cue.kind);
  if ((reducedMotion || cue.fixed) && !restingKo) return null;
  if (cue.kind === 'outro') {
    const previous = cue.previousKind === 'outro-win' ? clips['win-final'] : clips['lose-final'];
    keys = [{ ...keys[0], angles: previous.at(-1).angles }, ...keys.slice(1)];
  }
  const elapsed = Math.max(0, cue.elapsedMs) / 1000;
  const progress = reducedMotion || cue.fixed ? 1 : clamp(cue.elapsedMs / cue.durationMs);
  const { beat, angles } = sampleKeys(keys, progress, cue.gain);
  const frame = sampleXenoTrialsSequenceAnglesV211(rig, { clip: cue.kind, progress, elapsed }, angles);
  if (!frame) return null;
  const pose = restingKo ? lowerBody(frame, rig, progress) : frame;
  return { ...pose, reducedMotion, sequenceIdV211: `${fighter.id}::${cue.kind}`, beatV211: beat,
    ...(restingKo && { settledV211: progress >= .68, presentationDownV211: true }) };
}
