import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsPresentationRigV211 } from './xeno-trials-presentation-v211.js';
import { getXenoTrialsRenderMetricsV110 } from './xeno-trials-scale-v110.js';
import { drawXenoTrialsSpriteAtlasV188, getXenoTrialsSpriteAtlasV188 } from './xeno-trials-sprite-atlas-v188.js';
import { drawXenoTrialsSpriteAtlasV189, getXenoTrialsSpriteAtlasV189, getXenoTrialsSpriteLayoutV189 } from './xeno-trials-sprite-atlas-v189.js';

const walkDistancesV221 = Object.freeze({ warrior: 58, runner: 62, spitter: 48 });

function walkPlates(fighter) {
  if (!Object.hasOwn(walkDistancesV221, fighter.id) || fighter.y !== 0 || !(fighter.hp > 0)
    || !Number.isFinite(fighter.x) || ![-1, 1].includes(fighter.facing)) return null;
  const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
  const motion = getXenoTrialsSpriteAtlasV189(fighter, art);
  const idle = getXenoTrialsSpriteAtlasV188(fighter, art);
  if (!idle || motion?.kind !== 'motion') return null;
  return { art, motion, idle };
}

function winnerPlates(match, fighter) {
  if (match.phase !== 'match-over' || match.result?.completed !== true
    || match.result.reason === 'double-ko' || fighter.side !== match.result.winner
    || match.result.matchId !== match.config.matchId || match.result.durationTicks !== match.tick
    || match.result[`${fighter.side}Id`] !== fighter.id || match.fighters.length !== 2
    || match.hordeV180 || match.operationV188) return null;
  return walkPlates(fighter);
}

function loaded(images, atlas) {
  const image = images?.get(atlas.texture.path);
  return image && image.complete !== false && image.naturalWidth === atlas.texture.width
    && image.naturalHeight === atlas.texture.height;
}

/** The two entries share the frozen presentation clock. Waiting at the outer
 * mark from the first frame keeps the second competitor's entry continuous. */
export function getXenoTrialsArrivalViewV221(match, fighter, presentation, images, reducedMotion = false) {
  const slot = match.fighters.indexOf(fighter), current = presentation.fighterSlot;
  if (reducedMotion || match.hordeV180 || match.operationV188 || match.phase !== 'active' || match.round !== 1
    || match.tick !== 0 || !presentation.blocksSimulation || ![0, 1].includes(current) || slot < current
    || !Number.isFinite(presentation.elapsedMs) || !(presentation.durationMs > 0)) return null;
  const plates = walkPlates(fighter);
  if (!plates || !loaded(images, plates.motion) || !loaded(images, plates.idle)) return null;
  const total = walkDistancesV221[fighter.id], mark = fighter.x - fighter.facing * total;
  const progress = slot === current ? Math.min(1, Math.max(0, (presentation.elapsedMs / presentation.durationMs - .08) / .82)) : 0;
  const eased = progress * progress * (3 - 2 * progress);
  const distance = total * eased;
  return { mark, x: progress === 1 ? fighter.x : mark + fighter.facing * distance, distance,
    waiting: slot !== current, moving: progress > 0 && progress < 1, fighterSlot: slot, atlasPath: plates.motion.texture.path };
}

export function drawXenoTrialsArrivalV221(context, fighter, art, images, view, metrics) {
  const options = { metrics, x: view.x, y: 450, facing: fighter.facing };
  const drawn = view.moving ? drawXenoTrialsSpriteAtlasV189(context, fighter, art, images,
    { ...options, moving: true, distance: view.distance }) : drawXenoTrialsSpriteAtlasV188(context, fighter, art, images, options);
  return drawn && { ...drawn, arrivalV221: view };
}

export function createXenoTrialsDrawnExitV220(match, fighter, terminal, camera, images, direction, maxTravelMs) {
  const plates = terminal?.kind === 'outro' && terminal.elapsedMs === terminal.durationMs && winnerPlates(match, fighter);
  if (!plates || !loaded(images, plates.motion) || !loaded(images, plates.idle)) return null;
  const definition = getXenoTrialsFighterV96(fighter.id);
  const rig = getXenoTrialsPresentationRigV211(definition, plates.art);
  if (!rig || !terminal.participants?.some(p => p.side === fighter.side && p.fighterId === fighter.id
    && p.rigId === rig.id && p.revision === 211 && p.presentationKindV211 === 'outro'
    && p.previousKind === 'outro-win')) return null;

  const metrics = getXenoTrialsRenderMetricsV110(fighter.id, fighter.variant);
  const walkBounds = plates.motion.frames.filter(frame => frame.id.startsWith('walk-')).map(frame =>
    getXenoTrialsSpriteLayoutV189(plates.motion, frame, metrics, { x: 0, y: 450, facing: direction }).bounds);
  const trailingExtent = Math.max(0, ...walkBounds.map(bounds => direction === -1 ? bounds.right : -bounds.left));
  const offscreenMargin = trailingExtent * camera.zoom + 12;
  const edge = direction === -1 ? -offscreenMargin : 1000 + offscreenMargin;
  const endX = (edge - camera.translateX) / camera.zoom;
  const distance = (endX - fighter.x) * direction;
  const speed = definition.speed * .7;
  if (distance <= 0 || (distance / speed) * 1000 > maxTravelMs) return null;
  return { side: fighter.side, fighterId: fighter.id, rigId: rig.id, startX: fighter.x, endX, direction,
    fromFacing: fighter.facing, travelMs: Math.max(600, distance / speed * 1000), ground: 450,
    offscreenMargin, kind: 'winner', atlasPathV220: plates.motion.texture.path, idlePathV220: plates.idle.texture.path };
}

export function matchesXenoTrialsDrawnExitV220(match, fighter, participant) {
  const plates = winnerPlates(match, fighter);
  return Boolean(plates && participant.kind === 'winner' && participant.startX === fighter.x
    && participant.fromFacing === fighter.facing && participant.atlasPathV220 === plates.motion.texture.path
    && participant.idlePathV220 === plates.idle.texture.path
    && participant.rigId === getXenoTrialsPresentationRigV211(getXenoTrialsFighterV96(fighter.id), plates.art)?.id
    && (participant.endX - participant.startX) * participant.direction > 0);
}

export function drawXenoTrialsSpatialOutroV220(context, match, fighter, images, view, metrics) {
  if (!matchesXenoTrialsDrawnExitV220(match, fighter, view) || !view.visible) return null;
  const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
  // Clear terminal hit and attack flags in the render copy. The engine snapshot
  // stays frozen at the verdict, including physical position and remaining HP.
  const visual = { ...fighter, attack: null, hitFlash: 0, guard: false, stun: 0 };
  const options = { metrics, x: view.x, y: view.ground, facing: view.direction };
  let drawn;
  if (view.turn < 1) {
    if (view.fromFacing === view.direction) drawn = drawXenoTrialsSpriteAtlasV188(context, visual, art, images, options);
    else {
      context.save(); context.globalAlpha *= 1 - view.turn;
      const previous = drawXenoTrialsSpriteAtlasV188(context, visual, art, images, { ...options, facing: view.fromFacing });
      context.restore();
      context.save(); context.globalAlpha *= view.turn;
      drawn = drawXenoTrialsSpriteAtlasV188(context, visual, art, images, options) || previous;
      context.restore();
    }
  } else {
    drawn = drawXenoTrialsSpriteAtlasV189(context, visual, art, images,
      { ...options, moving: true, distance: view.distance });
  }
  return drawn && { ...drawn, exitV157: { ...view, stepped: Boolean(drawn.spriteAtlasV189), pose: null } };
}
