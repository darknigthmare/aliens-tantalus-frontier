import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from './player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, drawPlayerModularRigV126 } from './player-modular-rig-v126.js';
import { WeaponImageCacheV125 } from './weapon-image-cache-v125.js';
import { playerAppearanceStatusV126 } from './player-appearance-runtime-v126.js';
import { resolvePlayerActionRigV127, drawPlayerActionRigV127 } from './player-action-rig-v127.js';
import { advancePlayerTransitStateV128, resolvePlayerTransitRigV128, drawPlayerTransitRigV128 } from './player-transit-rig-v128.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

function bodyOptions(hub, sample = null) {
  return { actor: hub.player, images: hub.playerSheets, surface: 'hub', sample,
    timeSeconds: finite(hub.animationTime), reducedMotion: Boolean(hub.reducedMotion) };
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
  }) : actor?.climbing && actor.ladderId
    ? hub.ladders?.find(entry => entry.id === actor.ladderId) : null;
  const ladder = source ? {
    id: source.id || (annex ? `${annex.id}:ladder:${source.x}:${source.top}:${source.bottom}:${source.w}` : null),
    x: source.x + (annex ? source.w / 2 : 0), top: source.top, bottom: source.bottom, w: source.w,
    rungSpacing: source.rungSpacing, firstRung: source.firstRung } : null;
  return { ...bodyOptions(hub, sample), appearance: actor?.appearanceV126, ladder,
    transitState: advancePlayerTransitStateV128(actor?.playerTransitStateV128, actor,
      finite(hub.animationTime), { context: 'hub', ladder }) };
}

export function prepareHubPlayerAppearanceV126(hub) {
  if (!hub.player || !hub.playerSheets) return null;
  hub.player.appearanceV126 = normalizePlayerAppearanceV126(hub.playerAppearanceV126);
  hub.player.costumeId = hub.playerCostumeIdV119 || null;
  hub.player.playerAppearanceVisualV126 = null;
  hub.player.playerActionVisualV127 = null;
  hub.player.playerTransitVisualV128 = null;
  delete hub.player.playerTransitStateV128;
  hub.player.playerTransitStateV128 = hubTransitOptions(hub).transitState;
  delete hub.player.weaponRigMotionV125;
  hub.playerAppearanceCacheV126 ||= new WeaponImageCacheV125({ imageStore: hub.playerSheets, maxImages: 12 });
  hub.playerAppearanceCacheV126.clear();
  if (resolvePlayerBodyRigV125(bodyOptions(hub)).eligible) {
    hub.playerAppearanceCacheV126.retain([...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126]);
  }
  return hub.playerAppearanceCacheV126.snapshot();
}

/** Called after the hub's physical update, including annex-specific updates.
 * Drawing, pausing and moving platforms cannot advance the walking cycle. */
export function advanceHubPlayerAppearanceV126(hub) {
  const actor = hub.player;
  if (!hub.running || !actor) return;
  actor.playerTransitStateV128 = hubTransitOptions(hub).transitState;
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
  const options = bodyOptions(hub, sample);
  let transit = resolvePlayerTransitRigV128(hubTransitOptions(hub, sample));
  let action = resolvePlayerActionRigV127(options);
  if ((action.eligible || transit.eligible) && hub.running) {
    hub.playerAppearanceCacheV126?.retain([...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126,
      ...(transit.eligible ? transit.requiredAssets : action.requiredAssets)]);
    transit = resolvePlayerTransitRigV128(hubTransitOptions(hub, sample));
    action = resolvePlayerActionRigV127(options);
  }
  const bodyRig = transit.eligible ? transit.bodyRig : action.eligible ? action.bodyRig : resolvePlayerBodyRigV125(options);
  const render = transit.eligible
    ? drawPlayerTransitRigV128(ctx, { transitRig: transit, appearance: hub.player.appearanceV126, images: hub.playerSheets })
    : action.eligible
    ? drawPlayerActionRigV127(ctx, { actionRig: action, appearance: hub.player.appearanceV126, images: hub.playerSheets })
    : drawPlayerModularRigV126(ctx, { bodyRig, appearance: hub.player.appearanceV126, images: hub.playerSheets });
  hub.player.playerAppearanceVisualV126 = playerAppearanceStatusV126({ actor: hub.player,
    bodyRig, images: hub.playerSheets, render, actionRig: transit.eligible ? null : action, transitRig: transit });
  hub.player.playerActionVisualV127 = hub.player.playerAppearanceVisualV126.action;
  hub.player.playerTransitVisualV128 = hub.player.playerAppearanceVisualV126.transit;
  return render.drawn ? render : null;
}

export function hubPlayerAppearanceSnapshotV126(hub) {
  const actor = hub.player;
  const options = bodyOptions(hub), action = resolvePlayerActionRigV127(options);
  const transit = resolvePlayerTransitRigV128(hubTransitOptions(hub));
  const bodyRig = transit.eligible ? transit.bodyRig : action.eligible ? action.bodyRig : actor ? resolvePlayerBodyRigV125(options) : null;
  const status = playerAppearanceStatusV126({ actor, bodyRig, images: hub.playerSheets,
    actionRig: transit.eligible ? null : action, transitRig: transit });
  const last = actor?.playerAppearanceVisualV126;
  const current = last && status.supported && status.ready && last.bodyFrame === status.bodyFrame
    && last.bodyAtlas === status.bodyAtlas && JSON.stringify(last.selected) === JSON.stringify(status.selected)
    && last.action?.kind === status.action?.kind && last.action?.serial === status.action?.serial
    && last.transit?.kind === status.transit?.kind && last.transit?.phase === status.transit?.phase
    && (!(status.action || status.transit) || last.sampledAt === status.sampledAt);
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
    delete hub.player.playerTransitStateV128;
  }
}
