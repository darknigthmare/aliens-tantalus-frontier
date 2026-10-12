import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from './player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, drawPlayerModularRigV126 } from './player-modular-rig-v126.js';
import { WeaponImageCacheV125 } from './weapon-image-cache-v125.js';
import { playerAppearanceStatusV126 } from './player-appearance-runtime-v126.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

function bodyOptions(hub, sample = null) {
  return { actor: hub.player, images: hub.playerSheets, surface: 'hub', sample,
    timeSeconds: finite(hub.animationTime), reducedMotion: Boolean(hub.reducedMotion) };
}

export function prepareHubPlayerAppearanceV126(hub) {
  if (!hub.player || !hub.playerSheets) return null;
  hub.player.appearanceV126 = normalizePlayerAppearanceV126(hub.playerAppearanceV126);
  hub.player.costumeId = hub.playerCostumeIdV119 || null;
  hub.player.playerAppearanceVisualV126 = null;
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
  const bodyRig = resolvePlayerBodyRigV125(bodyOptions(hub, sample));
  const render = drawPlayerModularRigV126(ctx, { bodyRig, appearance: hub.player.appearanceV126,
    images: hub.playerSheets });
  hub.player.playerAppearanceVisualV126 = playerAppearanceStatusV126({ actor: hub.player,
    bodyRig, images: hub.playerSheets, render });
  return render.drawn ? render : null;
}

export function hubPlayerAppearanceSnapshotV126(hub) {
  const actor = hub.player;
  const bodyRig = actor ? resolvePlayerBodyRigV125(bodyOptions(hub)) : null;
  const status = playerAppearanceStatusV126({ actor, bodyRig, images: hub.playerSheets });
  const last = actor?.playerAppearanceVisualV126;
  const current = last && status.supported && status.ready && last.bodyFrame === status.bodyFrame
    && last.bodyAtlas === status.bodyAtlas && JSON.stringify(last.selected) === JSON.stringify(status.selected);
  return { schema: 126, images: hub.playerAppearanceCacheV126?.snapshot() || null,
    selected: status.selected, visual: current ? { ...last, ready: status.ready } : status };
}

export function releaseHubPlayerAppearanceV126(hub) {
  hub.playerAppearanceCacheV126?.clear();
  if (hub.player) {
    delete hub.player.weaponRigMotionV125;
    hub.player.playerAppearanceVisualV126 = null;
  }
}
