import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { resolvePlayerBodyRigV125 } from './player-body-rig-v125.js';
import { resolvePlayerModularRigV126, drawPlayerModularRigV126 } from './player-modular-rig-v126.js';
import { WeaponImageCacheV125 } from './weapon-image-cache-v125.js';
import { playerAppearanceStatusV126, playerAppearanceVisualIsCurrentV129,
  playerAppearanceGroundSupportV129, PLAYER_APPEARANCE_IMAGE_LIMIT_V129 } from './player-appearance-runtime-v126.js';
import { resolvePlayerActionRigV127, drawPlayerActionRigV127 } from './player-action-rig-v127.js';
import { advancePlayerTransitStateV128, resolvePlayerTransitRigV128, drawPlayerTransitRigV128 } from './player-transit-rig-v128.js';
import { advancePlayerLocomotionStateV129, resolvePlayerLocomotionRigV129 } from './player-locomotion-rig-v129.js';
import { PLAYER_COLONIAL_LEG_DEFINITIONS_V129, getPlayerColonialTorsoV129 } from './player-colonial-art-v129.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

function bodyOptions(hub, sample = null) {
  return { actor: hub.player, images: hub.playerSheets, surface: 'hub', sample,
    timeSeconds: finite(hub.animationTime), reducedMotion: Boolean(hub.reducedMotion) };
}

function hubAppearanceContext(hub) {
  return `hub:${hub.state?.deck ?? ''}:${hub.currentAnnexV71?.()?.id || 'deck'}`;
}

function hubGroundSupport(hub) {
  const annex = hub.currentAnnexV71?.();
  if (annex) return playerAppearanceGroundSupportV129(hub.player, [...(annex.platforms || []), ...(annex.colliders || [])]);
  // The regular hub's global floor spans the whole playable world. Its
  // platforms, obstacle tops and editor floors still require finite support.
  if (hub.useGlobalFloor && Math.abs(hub.player?.y + hub.player?.h - hub.floorY) < .01) return null;
  return playerAppearanceGroundSupportV129(hub.player,
    [...(hub.v51Platforms || []), ...(hub.obstacles || []), ...(hub.v51Walls || [])]);
}

function observeHubLocomotion(hub) {
  return advancePlayerLocomotionStateV129(hub.player?.playerLocomotionStateV129, hub.player,
    finite(hub.animationTime), { context: hubAppearanceContext(hub), surface: 'hub' });
}

function decorateHubBody(hub, bodyRig) {
  return resolvePlayerLocomotionRigV129({ actor: hub.player, bodyRig, appearance: hub.player?.appearanceV126,
    images: hub.playerSheets, locomotionState: hub.player?.playerLocomotionStateV129,
    legDefinitions: PLAYER_COLONIAL_LEG_DEFINITIONS_V129, groundSupport: hubGroundSupport(hub) }).bodyRig;
}

function hubTransitOptions(hub, sample = null) {
  const actor = hub.player;
  const annex = actor?.climbing ? hub.currentAnnexV71?.() : null;
  // Annex physics selects a rectangle by overlap and stores no ladderId.
  // Match stepAnnexPhysicsV72, then convert its left edge to the rig's axis.
  const source = annex ? annex.ladders?.find(entry => {
    const center = actor.x + actor.w / 2;
    return center >= entry.x - 28 && center <= entry.x + entry.w + 28
      && actor.y + actor.h >= entry.top - 18 && actor.y <= entry.bottom + 18;
  }) : actor?.climbing ? hub.nearestTraversalLadder?.(actor)
    || hub.ladders?.find(entry => entry.id === actor.ladderId) : null;
  const ladder = source ? {
    id: source.id || (annex ? `${annex.id}:ladder:${source.x}:${source.top}:${source.bottom}:${source.w}` : null),
    x: source.x + (annex ? source.w / 2 : 0), top: source.top, bottom: source.bottom, w: source.w,
    rungSpacing: source.rungSpacing, firstRung: source.firstRung } : null;
  return { ...bodyOptions(hub, sample), appearance: actor?.appearanceV126, ladder,
    legDefinitions: PLAYER_COLONIAL_LEG_DEFINITIONS_V129,
    transitState: advancePlayerTransitStateV128(actor?.playerTransitStateV128, actor,
      finite(hub.animationTime), { context: hubAppearanceContext(hub), ladder }) };
}

function resolveHubAppearance(hub, sample = null) {
  const options = bodyOptions(hub, sample);
  const transit = resolvePlayerTransitRigV128(hubTransitOptions(hub, sample));
  const action = transit.eligible ? null : resolvePlayerActionRigV127({ ...options,
    decorateBodyRigV129: bodyRig => decorateHubBody(hub, bodyRig) });
  const bodyRig = transit.eligible ? transit.bodyRig : action?.eligible ? action.bodyRig
    : decorateHubBody(hub, resolvePlayerBodyRigV125(options));
  return { transit, action, bodyRig };
}

function retainHubAppearance(hub, { transit, action, bodyRig }) {
  const modular = bodyRig?.eligible
    ? resolvePlayerModularRigV126({ bodyRig, appearance: hub.player?.appearanceV126, images: hub.playerSheets }) : null;
  // Both authored torso views belong to the selected outfit. Load them before
  // the first turn so a cold opposite page cannot replace it with the old suit.
  const torsoAssets = bodyRig?.eligible ? [-1, 1].map(facing =>
    getPlayerColonialTorsoV129(hub.player?.appearanceV126?.slots?.torso, facing)?.asset).filter(Boolean) : [];
  return hub.playerAppearanceCacheV126?.retain([
    ...(bodyRig?.requiredAssets || []), ...(modular?.requiredAssets || []), ...torsoAssets,
    ...(transit?.eligible ? transit.requiredAssets : action?.eligible ? action.requiredAssets : [])
  ]);
}

export function prepareHubPlayerAppearanceV126(hub) {
  if (!hub.player || !hub.playerSheets) return null;
  hub.player.appearanceV126 = normalizePlayerAppearanceV126(hub.playerAppearanceV126);
  hub.player.costumeId = hub.playerCostumeIdV119 || null;
  hub.player.playerAppearanceVisualV126 = null;
  hub.player.playerActionVisualV127 = null;
  hub.player.playerTransitVisualV128 = null;
  hub.player.playerLocomotionVisualV129 = null;
  delete hub.player.playerTransitStateV128;
  delete hub.player.playerLocomotionStateV129;
  hub.player.playerTransitStateV128 = hubTransitOptions(hub).transitState;
  hub.player.playerLocomotionStateV129 = observeHubLocomotion(hub);
  delete hub.player.weaponRigMotionV125;
  hub.playerAppearanceCacheV126 ||= new WeaponImageCacheV125({ imageStore: hub.playerSheets,
    maxImages: PLAYER_APPEARANCE_IMAGE_LIMIT_V129 });
  hub.playerAppearanceCacheV126.clear();
  retainHubAppearance(hub, resolveHubAppearance(hub));
  return hub.playerAppearanceCacheV126.snapshot();
}

/** Called after the hub's physical update, including annex-specific updates.
 * Drawing, pausing and moving platforms cannot advance the walking cycle. */
export function advanceHubPlayerAppearanceV126(hub) {
  const actor = hub.player;
  if (!hub.running || !actor) return;
  actor.playerTransitStateV128 = hubTransitOptions(hub).transitState;
  actor.playerLocomotionStateV129 = observeHubLocomotion(hub);
  const x = finite(actor.x), y = finite(actor.y), time = finite(hub.animationTime);
  let motion = actor.weaponRigMotionV125;
  if (!motion || time < motion.time || Math.hypot(x - motion.x, y - motion.y) > 160) {
    motion = { schema: 125, distance: 0, shotAt: -Infinity, time, x, y };
    actor.weaponRigMotionV125 = motion;
    return;
  }
  if (actor.grounded && !actor.climbing && !actor.ventTransit && !actor.inVehicle
    && Math.abs(finite(actor.vx)) > (actor.crouching ? 8 : 12)) motion.distance += Math.abs(x - motion.x);
  Object.assign(motion, { x, y, time });
}

export function drawHubPlayerAppearanceV126(hub, ctx, sample = null) {
  if (!hub.player) return null;
  let resolved = resolveHubAppearance(hub, sample);
  if (hub.running) {
    retainHubAppearance(hub, resolved);
    resolved = resolveHubAppearance(hub, sample);
  }
  const { transit, action, bodyRig } = resolved;
  const render = transit.eligible
    ? drawPlayerTransitRigV128(ctx, { transitRig: transit, appearance: hub.player.appearanceV126, images: hub.playerSheets })
    : action?.eligible
    ? drawPlayerActionRigV127(ctx, { actionRig: action, appearance: hub.player.appearanceV126, images: hub.playerSheets })
    : drawPlayerModularRigV126(ctx, { bodyRig, appearance: hub.player.appearanceV126, images: hub.playerSheets });
  hub.player.playerAppearanceVisualV126 = playerAppearanceStatusV126({ actor: hub.player,
    bodyRig, images: hub.playerSheets, render, actionRig: transit.eligible ? null : action, transitRig: transit });
  hub.player.playerActionVisualV127 = hub.player.playerAppearanceVisualV126.action;
  hub.player.playerTransitVisualV128 = hub.player.playerAppearanceVisualV126.transit;
  hub.player.playerLocomotionVisualV129 = hub.player.playerAppearanceVisualV126.locomotion;
  return render.drawn ? render : null;
}

export function hubPlayerAppearanceSnapshotV126(hub) {
  const actor = hub.player;
  const { action, transit, bodyRig } = resolveHubAppearance(hub);
  const status = playerAppearanceStatusV126({ actor, bodyRig, images: hub.playerSheets,
    actionRig: transit.eligible ? null : action, transitRig: transit });
  const last = actor?.playerAppearanceVisualV126;
  const current = playerAppearanceVisualIsCurrentV129(last, status);
  return { schema: 126, images: hub.playerAppearanceCacheV126?.snapshot() || null,
    selected: status.selected, visual: current ? { ...last, ready: status.ready } : status };
}

export function releaseHubPlayerAppearanceV126(hub) {
  hub.playerAppearanceCacheV126?.clear();
  if (hub.player) {
    delete hub.player.weaponRigMotionV125;
    hub.player.playerAppearanceVisualV126 = null;
    hub.player.playerActionVisualV127 = null;
    hub.player.playerTransitVisualV128 = null;
    hub.player.playerLocomotionVisualV129 = null;
    delete hub.player.playerTransitStateV128;
    delete hub.player.playerLocomotionStateV129;
  }
}
