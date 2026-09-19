/** Presentation only: the caller must provide a validated delivery sample. */
export const SHIP_CARRIER_PRESENTATION_V87 = Object.freeze({
  stepSeconds: .2, maxDeltaSeconds: .25,
  horizontalSpeedLimit: 800, verticalSpeedLimit: 1800, tolerance: 12,
  width: 48, sideOffset: 36, lift: 24
});
export const SHIP_BONDED_CARRIER_PRESENTATION_V87 = Object.freeze({ width: 76, sideOffset: 44, lift: 24 });

const finite = value => typeof value === 'number' && Number.isFinite(value);
const boundedDelta = (value, maximum) => finite(value) ? Math.max(0, Math.min(maximum, value)) : 0;
const sameRoom = (first, second) => first?.roomId === second?.roomId && first?.deckId === second?.deckId;
const sameAnchor = (first, second) => first?.animalId === second?.animalId
  && first?.unitId === second?.unitId && JSON.stringify(first?.animalIds) === JSON.stringify(second?.animalIds)
  && sameRoom(first, second) && first?.x === second?.x && first?.y === second?.y;
const validPose = value => value && typeof value.roomId === 'string' && value.roomId.length > 0
  && typeof value.deckId === 'string' && value.deckId.length > 0
  && finite(value.x) && finite(value.y) && value.x >= 0 && value.y >= 0;

function result(anchor, position, facing) {
  const bonded = anchor.animalIds?.length === 2;
  const { width, sideOffset, lift } = bonded ? SHIP_BONDED_CARRIER_PRESENTATION_V87 : SHIP_CARRIER_PRESENTATION_V87;
  const unit = bonded ? { unitId: anchor.unitId, animalIds: Object.freeze([...anchor.animalIds]) } : {};
  return Object.freeze({
    animalId: anchor.animalId, ...unit, roomId: anchor.roomId, deckId: anchor.deckId,
    x: position.x, y: position.y, facing,
    anchor: Object.freeze({ animalId: anchor.animalId, ...unit, roomId: anchor.roomId, deckId: anchor.deckId,
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
  if (delivery?.animalIds !== undefined && (!Array.isArray(delivery.animalIds) || delivery.animalIds.length !== 2
    || delivery.animalIds[0] !== delivery.animalId || new Set(delivery.animalIds).size !== 2
    || !delivery.animalIds.every(id => typeof id === 'string' && id) || typeof delivery.unitId !== 'string' || !delivery.unitId)) return null;
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
