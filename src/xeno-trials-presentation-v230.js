import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_SEQUENCE_TIMING_V155 } from './xeno-trials-sequences-v155.js';

const tracks = {
  hunter:    { motif: 'closing-sweep', color: '#a6d772', lean: .021, spread: .90, beats: ['listen', 'track', 'hold'] },
  quadruped: { motif: 'low-sweep', color: '#b1df8d', lean: .026, spread: 1.22, beats: ['lower', 'survey', 'brace'] },
  crown:     { motif: 'crown-lock', color: '#e3bf79', lean: -.014, spread: 1.16, beats: ['rise', 'fix', 'hold'] },
  shell:     { motif: 'planted-brace', color: '#b9c1a2', lean: -.012, spread: 1.05, beats: ['set', 'brace', 'release'] },
  ranged:    { motif: 'forward-range', color: '#bdcf77', lean: .020, spread: .96, beats: ['aim-low', 'check-range', 'hold'] },
  hybrid:    { motif: 'split-lock', color: '#e7a18f', lean: -.022, spread: 1.02, beats: ['turn', 'challenge', 'hold'] },
  pathogen:  { motif: 'irregular-pulse', color: '#eab58c', lean: .027, spread: .93, beats: ['recoil', 'lunge', 'settle'] },
  crew:      { motif: 'sector-check', color: '#91c9e9', lean: .010, spread: .72, beats: ['ready', 'check-sector', 'hold'] },
  engineer:  { motif: 'measured-lock', color: '#aaa7e2', lean: -.009, spread: .95, beats: ['square', 'inspect', 'hold'] },
  android:   { motif: 'servo-check', color: '#8ddfd8', lean: .007, spread: .78, beats: ['align', 'calibrate', 'lock'] },
  chassis:   { motif: 'chassis-lock', color: '#e6c184', lean: 0, spread: 1.20, beats: ['arm', 'seat-actuators', 'lock'] },
  parasite:  { motif: 'contact-trace', color: '#dbbc9e', lean: .032, spread: .60, beats: ['uncoil', 'test-contact', 'brace'] }
};

const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const sideIds = ['player', 'opponent'];
const isDuel = match => match?.fighters?.length === 2 && !match.hordeV180 && !match.operationV188;
const grounded = fighter => fighter?.hp > 0 && fighter.y === 0 && Number.isFinite(fighter.x) && [-1, 1].includes(fighter.facing);
export const XENO_TRIALS_PAINTED_INTRO_V230 = Object.freeze({ walkDuration: .69, stanceStarts: .63 });

function anatomy(fighter) {
  const { id, family, role } = fighter;
  if (/(facehugger|chestburster)/.test(id)) return 'parasite';
  if (/(?:^|-)(?:queen|king|kingrogue|praetorian|royal-guard|ultramorph)(?:-|$)/.test(id)) return 'crown';
  if (/(predalien|offspring|newborn|engineer-hybrid)/.test(id) || family === 'hybrid') return 'hybrid';
  if (family === 'human') return 'crew';
  if (family === 'engineer') return 'engineer';
  if (family === 'synthetic') return /(^mecha|powerloader|spider|huntsman|good-boy)/.test(id) ? 'chassis' : 'android';
  if (family === 'pathogen' && !/(runner|stalker)/.test(id)) return 'pathogen';
  if (/(runner|prowler|panther|quadruped|bulbous|rhino|stalker)/.test(id)) return 'quadruped';
  if (role === 'tank') return 'shell';
  return role === 'ranged' ? 'ranged' : 'hunter';
}

function identitySignature(value) {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
  return (hash >>> 0) / 4294967296;
}

/** Every combat appearance uses its own source identity, including both
 * Arachnoid costumes and every available MIRE evaluation subject. */
export function getXenoTrialsPresentationProfileV230(fighter) {
  const definition = getXenoTrialsFighterV96(fighter?.id);
  if (!definition || (definition.variants.length ? !definition.variants.includes(fighter.variant) : fighter.variant != null)) return null;
  const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
  if (!art?.profileId || !art.path) return null;
  const identity = `${definition.id}/${fighter.variant ?? 'base'}`;
  const anatomyId = anatomy(definition);
  return { fighterId: definition.id, profileId: art.profileId, variant: fighter.variant ?? null,
    identity, anatomy: anatomyId, artPath: art.path, signature: identitySignature(`${identity}/${art.profileId}`) };
}

function winningActor(match) {
  const { config, result } = match ?? {};
  if (!isDuel(match) || match.phase !== 'match-over' || result?.completed !== true || !sideIds.includes(result.winner)
    || result.matchId !== config?.matchId || result.durationTicks !== match.tick || result.stageId !== config.stageId
    || result.reason === 'double-ko' || config.rulesV119?.goal === 'survive'
    || !match.fighters.every((actor, slot) => actor.side === sideIds[slot] && result[`${actor.side}Id`] === actor.id
      && result[`${actor.side}Variant`] === actor.variant)) return null;
  const fighter = match.fighters.find(actor => actor.side === result.winner);
  return grounded(fighter) ? fighter : null;
}

function plateIsLoaded(art, images) {
  const image = images?.get(art.path);
  if (!image || image.complete === false) return false;
  if (!art.sourceRectV209) return image.naturalWidth === art.sourceWidth && image.naturalHeight === art.sourceHeight;
  const [left, top, width, height] = art.sourceRectV209;
  return image.naturalWidth >= left + width && image.naturalHeight >= top + height;
}

/** Use the existing verdict clock and its skip, pause and result ownership.
 * A static winner gets the standard display interval only when renderable. */
export function createXenoTrialsVictoryClockV230(match, previousOutro = null, images, reducedMotion = false) {
  if (previousOutro || reducedMotion) return previousOutro;
  const winner = winningActor(match);
  const profile = getXenoTrialsPresentationProfileV230(winner);
  if (!profile || !plateIsLoaded(getXenoTrialsArtV96(winner.id, winner.variant), images)) return previousOutro;
  return { matchId: match.config.matchId, terminalTick: match.tick, winner: winner.side,
    participants: [{ side: winner.side, fighterId: winner.id, variant: winner.variant, profileId: profile.profileId,
      sequenceId: `${profile.identity}::win-final::v230`, kind: 'outro-win', revision: 230 }],
    phase: 'playing', elapsedMs: 0, durationMs: XENO_TRIALS_SEQUENCE_TIMING_V155.outroMs,
    paused: false, skipped: false, reducedMotion: false };
}

function sequenceProgress(match, fighter, presentation, outro) {
  if (match.phase === 'active' && match.round === 1 && match.tick === 0 && presentation?.blocksSimulation
    && presentation.phase === `intro-${fighter.side}` && match.fighters[presentation.fighterSlot] === fighter)
    return ['intro', presentation.elapsedMs / presentation.durationMs];
  if (match.phase === 'round-over' && match.roundWinner === fighter.side) {
    const duration = XENO_TRIALS_SEQUENCE_TIMING_V155.roundMs;
    return ['round-win', 1 - match.phaseTime * 1000 / duration];
  }
  if (outro?.phase !== 'playing' || outro.skipped || outro.reducedMotion || outro.winner !== fighter.side
    || outro.matchId !== match.config.matchId || outro.terminalTick !== match.tick || winningActor(match) !== fighter) return [];
  const source = outro.participants?.find(actor => actor.side === fighter.side && actor.revision === 230);
  if (source && (source.fighterId !== fighter.id || source.variant !== fighter.variant)) return [];
  return ['win-final', outro.elapsedMs / outro.durationMs];
}

export function getXenoTrialsPresentationViewV230(match, fighter, { presentation, outro } = {}, reducedMotion = false) {
  if (reducedMotion || !isDuel(match) || !match.fighters.includes(fighter) || !grounded(fighter)) return null;
  const [kind, progress] = sequenceProgress(match, fighter, presentation, outro);
  if (!kind || !Number.isFinite(progress) || progress < 0 || progress >= 1) return null;
  const profile = getXenoTrialsPresentationProfileV230(fighter);
  if (!profile) return null;
  const { fighterId, profileId, variant, identity, anatomy: anatomyId, signature } = profile;
  const { motif, color, lean, spread, beats } = tracks[anatomyId];
  const center = .38 + .24 * signature;
  const hold = progress < center ? progress / center : (1 - progress) / (1 - center);
  const focus = hold * hold * (3 - 2 * hold);
  const roundPoint = kind === 'round-win', finalPoint = kind === 'win-final';
  const stanceLean = lean * focus * (roundPoint ? -.54 : finalPoint ? -.83 : 1);
  const beat = progress < center * .68 ? beats[0] : progress < (center + 1) / 2 ? beats[1] : beats[2];
  return { fighterId, profileId, variant, sequenceId: `${identity}::${kind}::v230`, anatomy: anatomyId,
    motif, beat, kind, color, progress, stanceLean, focus, spread, sweep: (2 * progress - 1) * (.70 + .30 * signature) };
}

/** MIRE presentation illumination follows the floor mark in camera space. */
export function drawXenoTrialsPresentationMarksV230(context, view, x, ground, width, facing) {
  if (!view || view.focus <= 0) return;
  const radius = clamp(width * view.spread, 12, 102), edge = view.sweep * radius * facing;
  const full = view.kind === 'win-final', point = view.kind === 'round-win';
  context.save();
  context.globalAlpha *= view.focus * (full ? .55 : point ? .33 : .43);
  context.strokeStyle = view.color;
  context.lineWidth = full ? 2.4 : 1.6;
  context.beginPath();
  context.ellipse(x, ground + 2, radius, full ? 9 : 6, 0, 0, 2 * Math.PI);
  context.stroke();
  context.beginPath();
  if (['planted-brace', 'chassis-lock', 'servo-check'].includes(view.motif)) {
    context.moveTo(x - radius, ground - 1); context.lineTo(x - radius, ground + 8);
    context.moveTo(x + radius, ground - 1); context.lineTo(x + radius, ground + 8);
  } else {
    const length = radius * (view.motif === 'forward-range' ? .46 : .24) * facing;
    context.moveTo(x + edge - length, ground + 9); context.lineTo(x + edge, ground + 4);
    context.lineTo(x + edge + length, ground + 9);
    if (full) { context.moveTo(x - radius * .52, ground + 12); context.lineTo(x + radius * .52, ground + 12); }
  }
  context.stroke();
  context.restore();
}

/** New portrait art shares the neutral image's world stature and foot pivot. */
export function getXenoTrialsPresentationPlateLayoutV230(plate, fighter, metrics, kind) {
  if (!plate || plate.kind !== kind || plate.fighterId !== fighter.id || plate.variant !== fighter.variant || !metrics) return null;
  const { sourceWidth, sourceHeight, sourceFacing, rootX, rootY, statureHeight, alphaBounds = [] } = plate;
  const [left, top, right, bottom] = alphaBounds;
  if (![left, top, right, bottom, rootX, rootY, statureHeight, sourceWidth, sourceHeight, metrics.visibleHeight].every(Number.isFinite)
    || ![-1, 1].includes(sourceFacing) || left < 0 || left > rootX || rootX > right || right > sourceWidth
    || !(top >= 0 && top < rootY && rootY >= bottom - 3 && rootY <= bottom && bottom <= sourceHeight
      && statureHeight > 0 && metrics.visibleHeight > 0)) return null;
  const scale = metrics.visibleHeight / statureHeight, flip = fighter.facing === sourceFacing ? 1 : -1;
  return { scale, flip, sourceWidth, sourceHeight, rootX, rootY,
    left: Math.min((left - rootX) * scale * flip, (right - rootX) * scale * flip),
    right: Math.max((left - rootX) * scale * flip, (right - rootX) * scale * flip), top: (rootY - top) * scale };
}

export function drawXenoTrialsPresentationPlateV230(context, image, layout, x, ground) {
  if (!layout || image?.complete === false || image?.naturalWidth !== layout.sourceWidth || image?.naturalHeight !== layout.sourceHeight) return false;
  const { scale, flip, sourceWidth, sourceHeight, rootX, rootY } = layout;
  context.save(); context.translate(x, ground); context.scale(flip, 1);
  context.drawImage(image, -rootX * scale, -rootY * scale, sourceWidth * scale, sourceHeight * scale);
  context.restore();
  return true;
}
