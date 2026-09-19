/** Presentation only: the caller must provide a validated delivery sample. */
export const SHIP_CARRIER_PRESENTATION_V87 = Object.freeze({
  stepSeconds: .2, maxDeltaSeconds: .25,
  horizontalSpeedLimit: 800, verticalSpeedLimit: 1800, tolerance: 12,
  width: 48, sideOffset: 36, lift: 24
});

const finite = value => typeof value === 'number' && Number.isFinite(value);
const boundedDelta = (value, maximum) => finite(value) ? Math.max(0, Math.min(maximum, value)) : 0;
const sameRoom = (first, second) => first?.roomId === second?.roomId && first?.deckId === second?.deckId;
const sameAnchor = (first, second) => first?.animalId === second?.animalId
  && sameRoom(first, second) && first?.x === second?.x && first?.y === second?.y;
const validPose = value => value && typeof value.roomId === 'string' && value.roomId.length > 0
  && typeof value.deckId === 'string' && value.deckId.length > 0
  && finite(value.x) && finite(value.y) && value.x >= 0 && value.y >= 0;

function result(anchor, position, facing) {
  const { width, sideOffset, lift } = SHIP_CARRIER_PRESENTATION_V87;
  return Object.freeze({
    animalId: anchor.animalId, roomId: anchor.roomId, deckId: anchor.deckId,
    x: position.x, y: position.y, facing,
    anchor: Object.freeze({ animalId: anchor.animalId, roomId: anchor.roomId, deckId: anchor.deckId,
      x: anchor.x, y: anchor.y }),
    bounds: Object.freeze({ x: position.x + facing * sideOffset - width / 2,
      width, bottom: position.y - lift })
  });
}

/**
 * Follow actual feet between delivery commits, never extrapolate or cross rooms.
 * The allowance matches delivery continuity and covers the one physics frame
 * performed after the controller tick. It never grants route progress.
 * Pauses keep the last approved presentation (or the durable anchor on reload).
 */
export function sampleShipCarrierPresentationV87(delivery, player, {
  remainder = 0, frameDelta = 0, facing = 1, paused = false, transitioning = false, previous = null
} = {}) {
  if (delivery?.phase !== 'carried' || delivery.carried !== true
    || typeof delivery.animalId !== 'string' || !delivery.animalId
    || !validPose(delivery) || !validPose(player) || player.alive !== true
    || !sameRoom(delivery, player) || ![1, -1].includes(facing) || transitioning) return null;
  if (paused) {
    if (previous && sameAnchor(previous.anchor, delivery) && validPose(previous)
      && sameRoom(previous, delivery) && previous.animalId === delivery.animalId
      && [1, -1].includes(previous.facing)) return result(delivery, previous, previous.facing);
    return result(delivery, delivery, facing);
  }
  const limits = SHIP_CARRIER_PRESENTATION_V87;
  const delta = Math.min(limits.maxDeltaSeconds,
    boundedDelta(remainder, limits.stepSeconds) + boundedDelta(frameDelta, limits.maxDeltaSeconds));
  if (Math.abs(player.x - delivery.x) > limits.horizontalSpeedLimit * delta + limits.tolerance
    || Math.abs(player.y - delivery.y) > limits.verticalSpeedLimit * delta + limits.tolerance) return null;
  return result(delivery, player, facing);
}
