import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsPhysicalScaleV119 } from './xeno-trials-physical-scale-v119.js';
import { XENO_PRESENTATION_V97 } from './xeno-trials-presentation-v97.js';
import {
  getXenoTrialsRigV154, projectXenoTrialsMeshPointV157, sampleXenoTrialsSequenceAnglesV197
} from './xeno-trials-rig-v154.js';
import { XENO_TRIALS_SEQUENCE_TIMING_V155, XENO_TRIALS_SEQUENCE_TIMING_V156 } from './xeno-trials-sequences-v155.js';

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);
const neutral = Object.freeze({});

// Support outlines sampled on the admitted plates at alpha >= 128. The keys
// are original Trials poses. Source plates, collision and damage stay native.
const styles = {
  'import-game-afe2-warden': {
    rigId: 'rig-v165-import-game-afe2-warden',
    approach: 'inspect', prepare: 'brace', recovery: 'retract', repose: 'close-guard',
    scan: { spine: -.9, head: 2.2 }, seize: { spine: 1.3, head: -2.9 },
    recoil: { spine: -2.3, head: 3 }, release: { spine: .7, head: -.8 },
    cueAt: .43, impactAt: .69, terminalMode: 'warden-armored-recline', angle: 1.02, compression: .92,
    outline: [[1518, 567], [1515, 606], [1477, 692], [1178, 998], [1177, 999], [1123, 1010],
      [59, 963], [19, 950], [19, 943], [124, 209], [125, 207], [127, 205], [311, 49], [337, 38],
      [348, 36], [738, 69], [1410, 370], [1438, 389], [1484, 449], [1514, 525]]
  },
  'import-game-afe2-exploder': {
    rigId: 'rig-v165-import-game-afe2-exploder',
    approach: 'contract', prepare: 'widen-support', recovery: 'settle-mass', repose: 'fold-body',
    scan: { bodyMass: -.65, oralRim: 1.9 }, seize: { bodyMass: .93, oralRim: -2.3 },
    recoil: { bodyMass: -1.6, oralRim: 2.5 }, release: { bodyMass: -.34, oralRim: .6 },
    cueAt: .33, impactAt: .51, terminalMode: 'exploder-weighted-collapse', angle: -.23, compression: .54,
    outline: [[1656, 257], [1646, 337], [1620, 400], [1316, 866], [1295, 883], [1200, 883],
      [46, 877], [43, 874], [39, 868], [35, 857], [34, 843], [82, 378], [93, 353], [109, 335],
      [354, 117], [427, 81], [433, 80], [1594, 140], [1598, 144], [1648, 217], [1654, 238]]
  },
  'import-game-afe2-harbinger': {
    rigId: 'rig-v165-import-game-afe2-harbinger',
    approach: 'survey', prepare: 'open-claws', recovery: 'gather-claws', repose: 'lower-claws',
    scan: { thorax: -.5, mouth: 2.2, clawUpperFar: -1.4 },
    seize: { thorax: 1.2, mouth: -2.7, clawUpperFar: 2.2, clawUpperNear: -2.4 },
    recoil: { thorax: -1.9, mouth: 2.8, clawUpperFar: -2.6, clawUpperNear: 1.9, clawLowerNear: 1.5 },
    release: { mouth: -.8, clawUpperNear: .8, clawLowerNear: .6 },
    cueAt: .56, impactAt: .64, terminalMode: 'harbinger-claw-fold', angle: -.61, compression: .72,
    outline: [[1442, 880], [1186, 1067], [1153, 1073], [309, 1043], [57, 429], [54, 399], [67, 102],
      [79, 72], [99, 49], [105, 45], [114, 42], [200, 23], [1032, 74], [1106, 95], [1109, 97], [1129, 121]]
  },
  'drive-v123-fte-pathogen-brute-profile-v13': {
    rigId: 'rig-v163-drive-v123-fte-pathogen-brute-profile-v13',
    approach: 'raise-shoulders', prepare: 'plant-forelimbs', recovery: 'brace-forelimbs', repose: 'drop-shoulder',
    scan: { spine: -.7, head: 1.5, upper0: 2, tail0: -1.4 },
    seize: { spine: 1.4, head: -2.7, fore0: 2.5, fore1: 1.8, tail1: 1.1 },
    recoil: { spine: -2.4, head: 3.3, upper0: -2.8, fore1: -1.5, tail0: -2 },
    release: { head: -.7, fore0: .8, fore1: .65, tail1: -.7 },
    cueAt: .49, impactAt: .82, terminalMode: 'brute-shoulder-fall', angle: -1.12, compression: .81,
    outline: [[1483, 438], [1482, 455], [1324, 911], [1315, 922], [1281, 945], [1274, 948], [1097, 982],
      [970, 977], [134, 593], [74, 546], [63, 531], [54, 511], [51, 494], [54, 470], [61, 455], [83, 430],
      [98, 419], [903, 33], [1092, 25], [1110, 28], [1155, 48], [1215, 95], [1475, 419], [1482, 434]]
  },
  'drive-v123-fte-pathogen-queen-right-v13': {
    rigId: 'rig-v165-drive-v123-fte-pathogen-queen-right-v13',
    approach: 'lift-crown', prepare: 'survey-arena', recovery: 'withdraw-crown', repose: 'lower-crown',
    scan: { spine: -.72, head: -2.15 }, seize: { spine: -.95, head: 2.75 },
    recoil: { spine: 1.45, head: -3.2 }, release: { spine: -.55, head: 1.15 },
    cueAt: .61, impactAt: .76, terminalMode: 'queen-crown-settle', angle: .58, compression: .74,
    outline: [[1503, 703], [1503, 708], [1501, 713], [1327, 1007], [1326, 1008], [1269, 1010], [791, 953],
      [227, 800], [24, 590], [74, 486], [640, 56], [672, 44], [901, 17], [1101, 34], [1180, 68], [1299, 144],
      [1328, 180], [1500, 657]]
  }
};

const makeKey = (time, beat, angles = neutral) => ({ time, beat, angles });
function makeClips(style) {
  return {
    intro: [makeKey(0, 'neutral'), makeKey(.19, style.approach, style.scan),
      makeKey(style.cueAt, style.prepare, style.seize), makeKey(.82, 'readiness', style.release), makeKey(1, 'ready')],
    'round-win': [makeKey(0, 'neutral'), makeKey(.23, style.prepare, style.seize),
      makeKey(.5, 'verify-distance', style.scan), makeKey(.76, 'reset-support', style.release), makeKey(1, 'ready')],
    'round-loss': [makeKey(0, 'neutral'), makeKey(.21, 'absorb', style.recoil),
      makeKey(.5, style.recovery, style.scan), makeKey(.78, 'reset-support', style.release), makeKey(1, 'ready')],
    'outro-win': [makeKey(0, 'neutral'), makeKey(.28, 'observe-verdict', style.scan),
      makeKey(style.impactAt, style.prepare, style.seize), makeKey(1, 'vigilance', style.release)],
    'outro-loss': [makeKey(0, 'neutral'), makeKey(.28, 'acknowledge-verdict', style.recoil),
      makeKey(.64, style.recovery, style.scan), makeKey(1, 'vigilance', style.release)],
    'outro-ko': [makeKey(0, 'neutral'), makeKey(.16, 'lose-support', style.recoil),
      makeKey(style.impactAt, style.repose, style.scan), makeKey(1, 'remain-down', style.release)]
  };
}

const pilots = new Map(Object.entries(styles).map(([id, style]) => {
  const rig = getXenoTrialsRigV154(getXenoTrialsFighterV96(id), getXenoTrialsArtV96(id));
  const scale = getXenoTrialsPhysicalScaleV119(id);
  return [id, { ...style, clips: makeClips(style), rig: rig?.id === style.rigId ? rig : null,
    baseX: scale.pivotX * rig?.sourceWidth, baseY: scale.bottom * rig?.sourceHeight,
    pixelsPerWorldUnit: rig?.sourceHeight / scale.height }];
}));

export const XENO_TRIALS_PILOT_RETURNS_V212 = Object.freeze([...pilots].flatMap(([fighterId, { rig }]) => rig ? [Object.freeze({
  id: `${fighterId}::outro`, fighterId, profileId: rig.profileId, rigId: rig.id,
  sourcePath: rig.path, sourceSha256: rig.sourceSha256, canonExact: false,
})] : []));

function isDuel(match) {
  return Array.isArray(match?.fighters) && match.fighters.length === 2 && !match.hordeV180 && !match.operationV188;
}

function hasTerminalVerdict(match) {
  return isDuel(match) && match.phase === 'match-over' && match.result?.completed === true
    && ['player', 'opponent'].includes(match.result.winner) && match.result.reason !== 'double-ko'
    && match.result.matchId === match.config?.matchId && match.result.durationTicks === match.tick;
}

function terminalClip(match, fighter) {
  if (match.result.winner === fighter.side) return fighter.hp > 0 ? 'outro-win' : null;
  if (fighter.hp > 0) return 'outro-loss';
  return fighter.hp === 0 && match.result.reason === 'ko'
    && match.fighters.some(other => other.side === match.result.winner && other.hp > 0) ? 'outro-ko' : null;
}

const canPoseAtHeight = fighter => Number.isFinite(fighter.y) && fighter.y >= 0 && fighter.y <= 1000;

/** Uses the existing terminal presentation clock. This helper can only add
 * render participants after the engine has already emitted its result. */
export function createXenoTrialsPilotOutroV197(match, historicalOutro = null, reducedMotion = false) {
  if (!hasTerminalVerdict(match)) return historicalOutro;
  const participants = match.fighters.flatMap(fighter => {
    const style = pilots.get(fighter.id);
    const kind = style?.rig && canPoseAtHeight(fighter) ? terminalClip(match, fighter) : null;
    return kind ? [{ side: fighter.side, fighterId: fighter.id, rigId: style.rigId,
      sequenceId: `${fighter.id}::${kind}::v197`, kind, revision: 197 }] : [];
  });
  if (!participants.length) return historicalOutro;
  const durationMs = XENO_TRIALS_SEQUENCE_TIMING_V155.outroMs;
  return {
    matchId: match.config.matchId, terminalTick: match.tick, winner: match.result.winner,
    participants: [...(historicalOutro?.participants || []), ...participants],
    phase: reducedMotion ? 'complete' : 'playing', elapsedMs: reducedMotion ? durationMs : 0, durationMs,
    paused: false, skipped: false, reducedMotion
  };
}

/** A living pilot releases the pose which actually ended its signed verdict. */
export function createXenoTrialsPilotReturnV212(match, terminal, previousOutro, images, reducedMotion = false) {
  if (reducedMotion || !hasTerminalVerdict(match) || previousOutro?.phase !== 'complete'
    || previousOutro.skipped || previousOutro.reducedMotion || previousOutro.matchId !== match.config.matchId
    || previousOutro.terminalTick !== match.tick) return terminal;
  if (terminal && (terminal.kind !== 'outro' || terminal.matchId !== match.config.matchId
    || terminal.terminalTick !== match.tick || terminal.skipped || terminal.reducedMotion)) return terminal;
  const additions = match.fighters.flatMap(fighter => {
    const rig = pilots.get(fighter.id)?.rig;
    const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
    const kind = terminalClip(match, fighter);
    if (!rig || kind === 'outro-ko' || !kind || !canPoseAtHeight(fighter)
      || getXenoTrialsRigV154(getXenoTrialsFighterV96(fighter.id), art) !== rig) return [];
    const plate = images?.get(rig.path);
    if (images && (!plate || plate.complete === false || plate.naturalWidth !== rig.sourceWidth
      || plate.naturalHeight !== rig.sourceHeight)) return [];
    const previous = previousOutro.participants?.find(entry => entry.revision === 197 && entry.side === fighter.side
      && entry.fighterId === fighter.id && entry.rigId === rig.id && entry.kind === kind
      && entry.sequenceId === `${fighter.id}::${kind}::v197`);
    return previous ? [{ side: fighter.side, fighterId: fighter.id, rigId: rig.id, kind: 'outro',
      sequenceId: `${fighter.id}::outro`, previousKind: kind, revision: 212 }] : [];
  });
  if (!additions.length) return terminal;
  return {
    kind: 'outro', matchId: match.config.matchId, terminalTick: match.tick,
    phase: 'playing', elapsedMs: 0, durationMs: XENO_TRIALS_SEQUENCE_TIMING_V156.exitMs,
    paused: false, skipped: false, reducedMotion: false, ...terminal,
    participants: [...(terminal?.participants || []), ...additions],
  };
}

function selectCue(match, fighter, presentation, outro, reducedMotion) {
  const durationMs = XENO_TRIALS_SEQUENCE_TIMING_V155.roundMs;
  if (!reducedMotion && match.phase === 'active' && presentation?.blocksSimulation
    && presentation.fighterSlot === match.fighters.indexOf(fighter)) {
    return { clip: 'intro', progress: clamp(presentation.elapsedMs / XENO_PRESENTATION_V97.introMs),
      elapsed: presentation.elapsedMs / 1000 };
  }
  if (match.phase === 'round-over' && ['player', 'opponent'].includes(match.roundWinner) && (!reducedMotion || fighter.y > 0)) {
    const progress = reducedMotion ? 1 : clamp(1 - match.phaseTime * 1000 / durationMs);
    return { clip: match.roundWinner === fighter.side ? 'round-win' : 'round-loss',
      progress, elapsed: progress * durationMs / 1000 };
  }
  if (!hasTerminalVerdict(match) || outro?.matchId !== match.config.matchId || outro.terminalTick !== match.tick
    || !['playing', 'complete'].includes(outro.phase) || !Array.isArray(outro.participants)) return null;
  const participant = outro.participants.find(participant => participant.revision === 197
    && participant.side === fighter.side && participant.fighterId === fighter.id);
  const kind = terminalClip(match, fighter);
  if (!kind || participant?.kind !== kind) return null;
  const fixed = reducedMotion || outro.reducedMotion || outro.skipped;
  if (fixed && kind !== 'outro-ko') return null;
  return { clip: kind, progress: fixed ? 1 : clamp(outro.elapsedMs / outro.durationMs), elapsed: outro.elapsedMs / 1000 };
}

function sampleKeys(keys, progress) {
  const right = keys.findIndex(key => key.time >= progress);
  const a = keys[Math.max(0, right - 1)], b = keys[Math.max(1, right)];
  const t = ease((progress - a.time) / (b.time - a.time));
  const bones = new Set([...Object.keys(a.angles), ...Object.keys(b.angles)]);
  const angles = Object.fromEntries([...bones].map(bone => {
    const first = a.angles[bone] ?? 0, second = b.angles[bone] ?? 0;
    return [bone, first + (second - first) * t];
  }));
  return { angles, beat: progress === b.time ? b.beat : a.beat };
}

// Rotate the admitted, articulated mesh into its own silhouette's support.
// Measured alpha points define the floor contact. The transform is visual and
// positive-determinant. Living opponents, hitboxes and events never use it.
function settleKo(frame, style, progress) {
  const fall = ease(clamp((progress - .12) / (style.impactAt - .12)));
  if (fall === 0) return frame;
  const angle = style.angle * fall, sin = Math.sin(angle), cos = Math.cos(angle);
  const compression = 1 + (style.compression - 1) * fall;
  const transform = ([x, y]) => {
    const dx = x - style.baseX, dy = (y - style.baseY) * compression;
    return [style.baseX + dx * cos - dy * sin, style.baseY + dx * sin + dy * cos];
  };
  const outline = style.outline.map(point => projectXenoTrialsMeshPointV157(style.rig, frame, point)).filter(Boolean);
  if (!outline.length) return null;
  const lowest = outline.map(transform).reduce((lower, point) => point[1] > lower[1] ? point : lower);
  const shift = style.baseY - lowest[1];
  const place = point => {
    const [x, y] = transform(point);
    return [x, y + shift];
  };
  return { ...frame, active: true, vertices: frame.vertices.map(place),
    contacts: Object.fromEntries(Object.entries(frame.contacts).map(([key, point]) => [key, place(point)])),
    contactV197: { sourcePoint: [lowest[0], style.baseY], phase: fall === 1 ? 'settled' : 'falling', visualOnly: true } };
}

function settleHeight(pose, style, height, progress) {
  if (height === 0 || progress === 0) return pose;
  const shift = height * style.pixelsPerWorldUnit * ease(progress);
  const place = ([x, y]) => [x, y + shift];
  return { ...pose, active: true, vertices: pose.vertices.map(place),
    contacts: Object.fromEntries(Object.entries(pose.contacts).map(([key, point]) => [key, place(point)])),
    ...(pose.contactV197 && { contactV197: { ...pose.contactV197, sourcePoint: place(pose.contactV197.sourcePoint) } }) };
}

function pilotReturn(match, fighter, style, terminal, reducedMotion) {
  if (!hasTerminalVerdict(match) || terminal?.kind !== 'outro' || terminal.matchId !== match.config.matchId
    || terminal.terminalTick !== match.tick || !['playing', 'complete'].includes(terminal.phase)
    || !Number.isFinite(terminal.elapsedMs) || terminal.elapsedMs < 0 || !Number.isFinite(terminal.durationMs)
    || terminal.durationMs <= 0 || fighter.hp <= 0) return null;
  const kind = terminalClip(match, fighter);
  const returnId = `${fighter.id}::outro`;
  const entry = terminal.participants?.find(participant => participant.revision === 212
    && participant.side === fighter.side && participant.fighterId === fighter.id && participant.rigId === style.rigId
    && participant.kind === 'outro' && participant.sequenceId === returnId && participant.previousKind === kind);
  if (!entry) return null;
  const fixed = reducedMotion || terminal.reducedMotion || terminal.skipped;
  const progress = fixed ? 1 : clamp(terminal.elapsedMs / terminal.durationMs);
  const initial = sampleKeys(style.clips[kind], 1).angles;
  const keys = [makeKey(0, 'last-verdict-pose', initial),
    makeKey(.38, style.recovery, Object.fromEntries(Object.entries(style.release).map(([bone, angle]) => [bone, angle * .55]))),
    makeKey(.72, 'settle-support', Object.fromEntries(Object.entries(style.scan).map(([bone, angle]) => [bone, angle * .19]))),
    makeKey(1, 'vigilance')];
  const sample = sampleKeys(keys, progress);
  const frame = sampleXenoTrialsSequenceAnglesV197(style.rig, { clip: 'outro', progress, elapsed: terminal.elapsedMs / 1000 }, sample.angles);
  if (!frame) return null;
  // The verdict can end with a fighter still airborne in the physical snapshot.
  // Preserve the settled presentation height while returning to the neutral pose.
  const placed = settleHeight(frame, style, fighter.y, 1);
  return { ...placed, reducedMotion, sequenceIdV212: returnId, beatV212: sample.beat };
}

export function getXenoTrialsPilotSequenceV197(rig, match, fighter, presentation, outro, reducedMotion = false, terminal = null) {
  const style = pilots.get(fighter?.id);
  if (!style?.rig || rig !== style.rig || !isDuel(match) || !match.fighters.includes(fighter) || !canPoseAtHeight(fighter)) return null;
  const returning = pilotReturn(match, fighter, style, terminal, reducedMotion);
  if (returning) return returning;
  const cue = selectCue(match, fighter, presentation, outro, reducedMotion);
  if (!cue || !Number.isFinite(cue.progress) || !Number.isFinite(cue.elapsed) || cue.elapsed < 0) return null;
  const { angles, beat } = sampleKeys(style.clips[cue.clip], cue.progress);
  // Ellipsis and reduced motion both use the same held final pose.
  const frame = sampleXenoTrialsSequenceAnglesV197(rig, cue, angles);
  if (!frame) return null;
  const isKo = cue.clip === 'outro-ko';
  const groundedPose = isKo ? settleKo(frame, style, cue.progress) : frame;
  if (!groundedPose) return null;
  const landing = cue.clip === 'intro' ? 0 : clamp(cue.progress / (isKo ? style.impactAt : .62));
  const pose = settleHeight(groundedPose, style, fighter.y, landing);
  if (!pose?.active) return null;
  return { ...pose, reducedMotion: reducedMotion === true, sequenceIdV197: `${fighter.id}::${cue.clip}::v197`, beatV197: beat,
    ...(isKo ? { terminalModeV197: style.terminalMode } : {}) };
}
