import { SHIP_REFUGE_ANNEX_V87 } from './refuge-room-v87.js';

const aliases = ['hubCommercialV71', 'hubExpansionV71', 'commercialV71'];
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const finite = value => typeof value === 'number' && Number.isFinite(value);
const future = state => Number(state?.schema) > 71 || Number(state?.registryVersion) > 87;

/**
 * Serialize a visit as its parent-door return pose. This is a save-boundary
 * projection, never the sanitizer of the live annex registry or a teleport.
 * Historical annex evidence and personal tribute data are not rewritten here.
 */
export function projectRefugeHubSaveV87(hubState = {}) {
  const result = structuredClone(hubState);
  if (!record(hubState)) return result;
  const source = aliases.map(key => hubState[key]).find(record);
  if (!source || future(source) || source.activeAnnexId !== SHIP_REFUGE_ANNEX_V87.id) return result;

  const door = SHIP_REFUGE_ANNEX_V87.parentDoorBounds;
  const context = record(source.returnContext) ? source.returnContext : {};
  const requestedX = finite(context.x) ? context.x : door.x + door.w / 2 - 22;
  result.deck = 1;
  result.roomId = SHIP_REFUGE_ANNEX_V87.parentRoomId;
  result.positionX = Math.round(Math.max(door.x, Math.min(door.x + door.w, requestedX)));
  result.facing = context.facing === -1 || context.facing === 1
    ? context.facing : hubState.facing === -1 ? -1 : 1;

  for (const key of aliases) {
    const state = result[key];
    if (!record(state) || future(state) || state.activeAnnexId !== SHIP_REFUGE_ANNEX_V87.id) continue;
    Object.assign(state, { activeAnnexId: null, annexPositionX: null, annexPositionY: null,
      annexClimbing: false, returnContext: null });
  }
  return result;
}

// Older local saves may still contain an active REFUGE. Apply the same pure
// boundary projection before starting the hub, not while the player visits it.
export const normalizeRefugeHubResumeV87 = projectRefugeHubSaveV87;
