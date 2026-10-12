import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from './player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, drawPlayerModularRigV126 } from './player-modular-rig-v126.js';
import { WeaponImageCacheV125 } from './weapon-image-cache-v125.js';

/** The armory previews the same parts and attachment solver as gameplay. Its
 * actor is a local presentation value: there is no save, inventory or engine
 * mutation. The owning view must dispose it before replacing/leaving the UI. */
export function createPlayerAppearancePreviewV126(canvas, {
  appearance, reducedMotion = false, onStatus = () => {}
} = {}) {
  const ctx = canvas?.getContext?.('2d');
  if (!ctx) return { dispose() {}, ready: Promise.resolve(false), setFacing() {} };
  const selected = normalizePlayerAppearanceV126(appearance);
  const images = new Map();
  const cache = new WeaponImageCacheV125({ imageStore: images, maxImages: 12 });
  const assets = [...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126];
  let disposed = false, frame = null, lastFrame = -Infinity, ready = false;
  const actor = { x: 0, y: 0, w: 44, h: 92, vx: 0, vy: 0, grounded: true,
    facing: 1, alive: true, weaponMode: 'unarmed', appearanceV126: selected };
  const beganAt = globalThis.performance?.now?.() || 0;
  const width = canvas.width || 320, height = canvas.height || 360;

  function draw(timeSeconds = 0) {
    if (disposed) return false;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0c1719';
    ctx.fillRect(0, 0, width, height);
    const floor = height - 32;
    ctx.strokeStyle = '#28423e';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(24, floor + .5); ctx.lineTo(width - 24, floor + .5); ctx.stroke();
    const bodyRig = resolvePlayerBodyRigV125({ actor, images, surface: 'mission',
      timeSeconds, reducedMotion });
    const scale = Math.min((height - 72) / 125, (width - 72) / 100);
    ctx.translate(width / 2 - (actor.x + actor.w / 2) * scale, floor - (actor.y + actor.h) * scale);
    ctx.scale(scale, scale);
    const render = drawPlayerModularRigV126(ctx, { bodyRig, appearance: selected, images });
    ctx.restore();
    canvas.dataset.appearanceReadyV126 = String(Boolean(render.drawn));
    return Boolean(render.drawn);
  }

  function animate(now) {
    if (disposed || !ready) return;
    if (now - lastFrame >= 1000 / 30) {
      draw(Math.max(0, (now - beganAt) / 1000));
      lastFrame = now;
    }
    frame = globalThis.requestAnimationFrame?.(animate) ?? null;
  }

  onStatus({ ready: false, reason: 'loading', message: 'Chargement de la tenue…' });
  draw();
  cache.retain(assets);
  const loaded = Promise.allSettled(assets.map(async asset => {
    const image = cache.ensure(asset);
    if (!image) return false;
    if (typeof image.decode === 'function') await image.decode();
    else if (!image.complete) await new Promise(resolve => {
      image.addEventListener?.('load', resolve, { once: true });
      image.addEventListener?.('error', resolve, { once: true });
    });
    return true;
  })).then(() => {
    if (disposed) return false;
    ready = draw();
    onStatus({ ready, reason: ready ? null : 'appearance-images-unavailable',
      message: ready ? 'Aperçu de la tenue préparée.' : 'Aperçu indisponible. Vos choix de tenue sont conservés.' });
    if (ready && !reducedMotion && typeof globalThis.requestAnimationFrame === 'function') {
      frame = globalThis.requestAnimationFrame(animate);
    }
    return ready;
  });

  return { ready: loaded,
    setFacing(facing) {
      actor.facing = Number(facing) < 0 ? -1 : 1;
      if (ready) draw(reducedMotion ? 0 : Math.max(0, ((globalThis.performance?.now?.() || beganAt) - beganAt) / 1000));
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame !== null) globalThis.cancelAnimationFrame?.(frame);
      frame = null;
      cache.clear();
      images.clear();
    } };
}
