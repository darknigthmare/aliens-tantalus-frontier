import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from './player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, drawPlayerModularRigV126 } from './player-modular-rig-v126.js';
import { resolveHeldWeaponProfileV125 } from './held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125, drawHeldWeaponV125 } from './held-weapon-renderer-v125.js';
import { WeaponImageCacheV125, weaponImageReadyV125 } from './weapon-image-cache-v125.js';
import { resolvePlayerActionRigV127, drawPlayerActionRigV127 } from './player-action-rig-v127.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const now = () => finite(globalThis.performance?.now?.());
const facingOf = value => Number(value) < 0 ? -1 : 1;
const RELOAD_SECONDS = 2.4;
const RELOAD_REST_SECONDS = .7;

export const PLAYER_APPEARANCE_PREVIEW_MODES_V127 = Object.freeze([
  Object.freeze({ id: 'idle', label: 'Au repos', fixedTime: .4 }),
  Object.freeze({ id: 'walk', label: 'Marche', fixedTime: .3 }),
  Object.freeze({ id: 'crouch', label: 'Accroupi', fixedTime: .4 }),
  Object.freeze({ id: 'aim', label: 'Visée', fixedTime: .7, armed: true }),
  Object.freeze({ id: 'reload', label: 'Rechargement', fixedTime: 1.4, armed: true }),
  Object.freeze({ id: 'medical', label: 'Soins', fixedTime: 1.2, action: true }),
  Object.freeze({ id: 'deploy', label: 'Déploiement', fixedTime: 1.4, action: true }),
  Object.freeze({ id: 'interact', label: 'Interaction', fixedTime: 1.3, action: true }),
  Object.freeze({ id: 'melee', label: 'Mêlée', fixedTime: .18, action: true })
]);

export function getPlayerAppearancePreviewModesV127(weaponDescriptor = null) {
  const profile = resolveHeldWeaponProfileV125(weaponDescriptor);
  return PLAYER_APPEARANCE_PREVIEW_MODES_V127.map(mode => ({ ...mode,
    available: !mode.armed || Boolean(profile?.portable && (mode.id !== 'reload' || profile.reload.feed !== 'none')),
    unavailableLabel: profile?.portable && mode.id === 'reload' ? 'non rechargeable' : 'arme requise'
  }));
}

export function normalizePlayerAppearancePreviewAnimationV127(animation, weaponDescriptor = null) {
  return getPlayerAppearancePreviewModesV127(weaponDescriptor)
    .find(mode => mode.id === animation && mode.available)?.id || 'idle';
}

/** A presentation-only actor samples the same geometry as gameplay. Its
 * timeline has no inventory, input, save, firing or reload transaction. The
 * admitted descriptor comes from the operator's actual equipment; the preview
 * never creates a replacement weapon when that descriptor is unavailable.
 */
export function samplePlayerAppearancePreviewV127({ animation = 'idle', timeSeconds = 0,
  facing = 1, weaponDescriptor = null, reducedMotion = false, appearance } = {}) {
  const selectedMode = normalizePlayerAppearancePreviewAnimationV127(animation, weaponDescriptor);
  const mode = PLAYER_APPEARANCE_PREVIEW_MODES_V127.find(entry => entry.id === selectedMode);
  const profile = mode.armed ? resolveHeldWeaponProfileV125(weaponDescriptor) : null;
  const time = reducedMotion ? mode.fixedTime : Math.max(0, finite(timeSeconds));
  const direction = facingOf(facing);
  const actor = { x: 0, y: 0, w: 44, h: 92, vx: 0, vy: 0, grounded: true,
    facing: direction, alive: true, weaponMode: profile ? 'primary' : 'unarmed',
    appearanceV126: normalizePlayerAppearanceV126(appearance),
    weaponRigMotionV125: { distance: 0, shotAt: -Infinity, time, weaponId: profile?.weaponId || null } };
  if (selectedMode === 'walk') {
    actor.vx = direction * 70;
    actor.weaponRigMotionV125.distance = time * 70;
  } else if (selectedMode === 'crouch') {
    actor.crouching = true;
  } else if (selectedMode === 'aim') {
    actor.aimingV124 = true;
    // A restrained diagonal makes shoulder, collar and arm joins visible.
    actor.combatAimV83 = { x: direction, y: -.2, facing: direction };
  } else if (selectedMode === 'reload') {
    const elapsed = time % (RELOAD_SECONDS + RELOAD_REST_SECONDS);
    actor.reloading = elapsed < RELOAD_SECONDS;
    actor.aimingV124 = true;
    actor.combatAimV83 = { x: direction, y: 0, facing: direction };
    actor.magazineSize = 4;
    actor.ammo = 1;
    actor.tacticalReload = { phase: actor.reloading ? 'reloading' : 'ready',
      elapsed: Math.min(elapsed, RELOAD_SECONDS), completeAt: RELOAD_SECONDS,
      weaponKey: profile.weaponId, result: 'normal' };
  } else if (selectedMode === 'medical') {
    actor.fieldActionV124 = { kind: 'medical', phase: 'working', duration: 2.2, elapsed: time % 2.2, serial: 1 };
  } else if (selectedMode === 'deploy') {
    actor.placeableActionV124 = { kind: 'deploy', duration: 2.5, elapsed: time % 2.5, serial: 1 };
  } else if (selectedMode === 'interact') {
    actor.fieldActionV124 = { kind: 'access-bypass', phase: 'working', duration: 2.4,
      elapsed: time % 2.4, toolId: 'access-tuner', serial: 1 };
  } else if (selectedMode === 'melee') {
    actor.meleeClock = .42 - (time % .42);
    actor.meleeKind = 'knife-attack';
  }
  return { actor, animation: selectedMode, profile, action: Boolean(mode.action), timeSeconds: time,
    reducedMotion: Boolean(reducedMotion) };
}

/** The owning view disposes this preview before replacing/leaving the UI.
 * All image requests, completion listeners and the single RAF belong to this
 * instance. Disposing also settles `ready` if an image never completes.
 */
export function createPlayerAppearancePreviewV126(canvas, {
  appearance, animation = 'idle', weaponDescriptor = null, facing = 1,
  reducedMotion = false, onStatus = () => {}
} = {}) {
  const ctx = canvas?.getContext?.('2d');
  if (!ctx) return { dispose() {}, ready: Promise.resolve(false), setFacing() {},
    setAnimation() { return 'idle'; }, getSnapshot() { return { ready: false, reason: 'canvas-unavailable' }; } };
  const selected = normalizePlayerAppearanceV126(appearance);
  const profile = resolveHeldWeaponProfileV125(weaponDescriptor);
  const images = new Map();
  const cache = new WeaponImageCacheV125({ imageStore: images, maxImages: 12 });
  const baseAssets = [...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126,
    ...(profile?.portable ? [profile] : [])];
  let disposed = false, frame = null, lastFrame = -Infinity, ready = false, loadEpoch = 0, pendingLoad = null;
  let currentAnimation = normalizePlayerAppearancePreviewAnimationV127(animation, weaponDescriptor);
  let currentFacing = facingOf(facing), beganAt = now();
  let snapshot = { ready: false, reason: 'loading', animation: currentAnimation, facing: currentFacing };
  const width = canvas.width || 320, height = canvas.height || 360;

  function sampleAt(timestamp) {
    return samplePlayerAppearancePreviewV127({ appearance: selected, animation: currentAnimation,
      timeSeconds: Math.max(0, (finite(timestamp, beganAt) - beganAt) / 1000),
      weaponDescriptor, facing: currentFacing, reducedMotion });
  }

  function draw(timestamp = now()) {
    if (disposed) return false;
    const sample = sampleAt(timestamp), { actor } = sample;
    const actionRig = sample.action ? resolvePlayerActionRigV127({ actor, images, surface: 'mission',
      timeSeconds: sample.timeSeconds, reducedMotion }) : null;
    const bodyRig = actionRig?.bodyRig || resolvePlayerBodyRigV125({ actor, images, surface: 'mission',
      timeSeconds: sample.timeSeconds, reducedMotion });
    const weaponImage = sample.profile ? images.get(sample.profile.imageKey) : null;
    const weaponReady = !sample.profile || weaponImageReadyV125(weaponImage, sample.profile);
    const weaponPose = sample.profile && weaponReady ? getHeldWeaponPoseV125({ actor,
      descriptor: weaponDescriptor, bodyRig, surface: 'mission',
      timeSeconds: sample.timeSeconds, reducedMotion }) : null;
    ctx.save();
    let render = { drawn: false, reason: 'appearance-images-unavailable' };
    try {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0c1719';
      ctx.fillRect(0, 0, width, height);
      const floor = height - 32;
      ctx.strokeStyle = '#28423e';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(24, floor + .5); ctx.lineTo(width - 24, floor + .5); ctx.stroke();
      // Fixed framing keeps all poses and control positions stable. Every
      // admitted long gun fits inside this body-relative stage in both views.
      const scale = Math.min((height - 72) / 125, (width - 72) / 150);
      ctx.translate(width / 2 - (actor.x + actor.w / 2) * scale,
        floor - (actor.y + actor.h) * scale);
      ctx.scale(scale, scale);
      if (actionRig) {
        render = drawPlayerActionRigV127(ctx, { actionRig, appearance: selected, images });
      } else if (weaponReady && (!sample.profile || weaponPose)) {
        render = drawPlayerModularRigV126(ctx, { bodyRig, appearance: selected, images,
          ...(weaponPose ? { weaponPose, drawWeapon: () => drawHeldWeaponV125(ctx, weaponImage, weaponPose) } : {}) });
      } else {
        render.reason = 'weapon-image-unavailable';
      }
    } finally { ctx.restore(); }
    const drawn = Boolean(render.drawn);
    canvas.dataset.appearanceReadyV126 = String(drawn);
    canvas.dataset.appearanceAnimationV127 = currentAnimation;
    snapshot = { ready: drawn, reason: drawn ? null : render.reason, animation: currentAnimation,
      facing: currentFacing, timeSeconds: sample.timeSeconds, bodyFrame: bodyRig.frame,
      bodyAtlas: bodyRig.atlas, gait: bodyRig.gait, stance: bodyRig.stance,
      weaponId: sample.profile?.weaponId || null, weaponPath: sample.profile?.path || null,
      reloadPhase: weaponPose?.reloadPhase || null, reloadProgress: weaponPose?.reloadProgress || 0,
      actionKind: actionRig?.kind || null, actionPhase: actionRig?.phase || null,
      actionProgress: actionRig?.progress || 0,
      arms: render.arms ? { near: { hand: render.arms.near.hand, reachError: render.arms.near.reachError },
        far: { hand: render.arms.far.hand, reachError: render.arms.far.reachError } } : null,
      effectiveSlots: render.effectiveSlots || null, reducedMotion: Boolean(reducedMotion) };
    return drawn;
  }

  function report() {
    if (disposed) return;
    const mode = PLAYER_APPEARANCE_PREVIEW_MODES_V127.find(entry => entry.id === currentAnimation);
    const unavailable = snapshot.reason === 'weapon-image-unavailable';
    const weaponName = mode.armed && profile ? ` · ${profile.name}` : '';
    onStatus({ ready: snapshot.ready, reason: snapshot.reason,
      message: snapshot.ready ? `${mode.label}${weaponName}${reducedMotion ? ' · Pose fixe' : ''}.`
        : unavailable ? 'Aperçu de l’arme indisponible. Les autres postures restent accessibles.'
          : 'Aperçu indisponible. Vos choix de tenue sont conservés.' });
  }

  function animate(timestamp) {
    frame = null;
    if (disposed || !ready) return;
    if (timestamp - lastFrame >= 1000 / 30) {
      draw(timestamp);
      lastFrame = timestamp;
    }
    frame = globalThis.requestAnimationFrame?.(animate) ?? null;
  }

  function waitForImage(asset, loading) {
    const image = cache.ensure(asset);
    if (!image) return Promise.resolve(false);
    if (weaponImageReadyV125(image, asset)) return Promise.resolve(true);
    if (typeof image.decode === 'function') {
      return Promise.race([Promise.resolve().then(() => image.decode()).then(
        () => weaponImageReadyV125(image, asset), () => false), loading.released.then(() => false)]);
    }
    if (image.complete) return Promise.resolve(false);
    return new Promise(resolve => {
      const finish = () => {
        image.removeEventListener?.('load', finish);
        image.removeEventListener?.('error', finish);
        loading.listeners.delete(finish);
        resolve(!disposed && !loading.cancelled && weaponImageReadyV125(image, asset));
      };
      loading.listeners.add(finish);
      image.addEventListener?.('load', finish, { once: true });
      image.addEventListener?.('error', finish, { once: true });
      // Image states may change between the first check and listener binding.
      if (image.complete) finish();
    });
  }

  function cancelPendingLoad() {
    if (!pendingLoad) return;
    pendingLoad.cancelled = true;
    for (const finish of [...pendingLoad.listeners]) finish();
    pendingLoad.release();
    pendingLoad = null;
  }

  function loadSelection() {
    cancelPendingLoad();
    const epoch = ++loadEpoch;
    const loading = { listeners: new Set(), cancelled: false, released: null, release: null };
    loading.released = new Promise(resolve => { loading.release = resolve; });
    pendingLoad = loading;
    ready = false;
    if (frame !== null) globalThis.cancelAnimationFrame?.(frame);
    frame = null;
    const sample = sampleAt(beganAt);
    const actionRig = sample.action ? resolvePlayerActionRigV127({ actor: sample.actor, surface: 'mission',
      timeSeconds: sample.timeSeconds, reducedMotion }) : null;
    const assets = [...new Map([...baseAssets, ...(actionRig?.requiredAssets || [])]
      .map(asset => [asset.imageKey, asset])).values()];
    const retained = new Set(assets.map(asset => asset.imageKey));
    for (const asset of cache.snapshot().assets) if (!retained.has(asset.imageKey)) cache.release(asset.imageKey);
    onStatus({ ready: false, reason: 'loading', message: 'Chargement de la tenue…' });
    draw(beganAt);
    cache.retain(assets);
    return Promise.allSettled(assets.map(asset => waitForImage(asset, loading))).then(() => {
      if (disposed || loading.cancelled || epoch !== loadEpoch) return false;
      pendingLoad = null;
      beganAt = now();
      ready = true;
      const drawn = draw(beganAt);
      report();
      if (drawn && !reducedMotion && typeof globalThis.requestAnimationFrame === 'function') {
        frame = globalThis.requestAnimationFrame(animate);
      }
      return drawn;
    });
  }

  const loaded = loadSelection();

  return { ready: loaded,
    setAnimation(value) {
      if (disposed) return currentAnimation;
      const normalized = normalizePlayerAppearancePreviewAnimationV127(value, weaponDescriptor);
      if (normalized === currentAnimation) return currentAnimation;
      currentAnimation = normalized;
      beganAt = now();
      lastFrame = -Infinity;
      loadSelection();
      return currentAnimation;
    },
    setFacing(value) {
      if (disposed) return currentFacing;
      currentFacing = facingOf(value);
      if (ready) draw();
      return currentFacing;
    },
    getSnapshot() { return clone({ ...snapshot, disposed, images: cache.snapshot() }); },
    dispose() {
      if (disposed) return;
      disposed = true;
      ready = false;
      snapshot = { ...snapshot, ready: false, reason: 'disposed' };
      if (frame !== null) globalThis.cancelAnimationFrame?.(frame);
      frame = null;
      cancelPendingLoad();
      cache.clear();
      images.clear();
    }
  };
}
