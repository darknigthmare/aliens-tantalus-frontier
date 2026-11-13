// V188 — procedural VFX over the title scene (no new bitmaps). Everything is
// read from the scene the title already shows:
// - lightning inside the storm clouds, only when the planet carries a storm layer;
// - rare debris burning up on entry along the lit limb of the planet;
// - dust drifting in front of the camera (parallax);
// - analogue grain (the vignette and scanlines are a static CSS layer).
// Planet effects draw on a canvas placed inside the scene, between the cloud
// deck (z 39) and the ship (z 47), so the ship always stays in front of them.
// Reduced motion: no flashes, no streaks, still dust, no grain refresh.
// Low quality: half the dust, no grain. Paused while the title is hidden.

export const TITLE_VFX_V188 = Object.freeze({
  fps: 30,
  dust: Object.freeze({ high: 46, low: 22 }),
  lightning: Object.freeze({ minGap: 4.5, maxGap: 11, flashes: Object.freeze([2, 4]) }),
  entry: Object.freeze({ minGap: 9, maxGap: 19, duration: 1.15 }),
  grain: Object.freeze({ tile: 96, refresh: 1 / 12, alpha: 0.05 })
});

/** Deterministic PRNG so tests (and screenshots) can replay a sequence. */
export function createRandomV188(seed = 0x9e3779b9) {
  let state = seed >>> 0;
  return () => { state = (state + 0x6d2b79f5) >>> 0; let t = state; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const between = (random, min, max) => min + (max - min) * random();

export function createDustV188(count, random) {
  return Array.from({ length: count }, () => ({
    x: random(), y: random(), depth: between(random, 0.25, 1),
    size: between(random, 0.5, 1.7), alpha: between(random, 0.12, 0.42), phase: random() * Math.PI * 2
  }));
}
/** Drift right-to-left (the camera tracks the ship), wrapping around. */
export function stepDustV188(dust, dt) {
  for (const mote of dust) {
    mote.x -= dt * 0.006 * mote.depth; mote.y += dt * 0.0022 * mote.depth; mote.phase += dt * 0.8;
    if (mote.x < -0.02) mote.x += 1.04; if (mote.y > 1.02) mote.y -= 1.04;
  }
  return dust;
}

/** A storm: a burst of 2–4 flashes inside the cloud deck, at one point of the disc. */
export function scheduleLightningV188(now, random) {
  const { minGap, maxGap, flashes } = TITLE_VFX_V188.lightning;
  const count = Math.round(between(random, flashes[0], flashes[1]));
  const angle = random() * Math.PI * 2, reach = Math.sqrt(random()) * 0.72;
  let at = now + between(random, minGap, maxGap);
  const pulses = Array.from({ length: count }, (_, index) => { const pulse = { at, length: between(random, 0.05, 0.13), strength: between(random, 0.45, 1) * (index ? 0.8 : 1) }; at += pulse.length + between(random, 0.04, 0.22); return pulse; });
  return { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach, radius: between(random, 0.16, 0.3), pulses, end: at };
}
export function lightningIntensityV188(storm, now) {
  if (!storm) return 0;
  let value = 0;
  for (const pulse of storm.pulses) {
    const t = now - pulse.at; if (t < 0 || t > pulse.length + 0.35) continue;
    value = Math.max(value, t <= pulse.length ? pulse.strength : pulse.strength * Math.exp(-(t - pulse.length) * 9));
  }
  return value;
}

/** Debris entering the atmosphere: a short streak just inside the limb. */
export function scheduleEntryV188(now, random) {
  const { minGap, maxGap, duration } = TITLE_VFX_V188.entry;
  const start = between(random, -2.4, -0.8);
  return { at: now + between(random, minGap, maxGap), duration, from: start, sweep: between(random, 0.22, 0.4) * (random() < 0.5 ? -1 : 1), depth: between(random, 0.9, 0.98) };
}

export function titleVfxPlanetV188(scene) {
  const planet = scene?.querySelector?.('[data-role="planet"]:not([hidden])');
  if (!planet) return null;
  const rect = planet.getBoundingClientRect?.(); if (!rect || rect.width < 40) return null;
  const ids = [...(scene.querySelectorAll?.('[data-role="atmosphere"]:not([hidden]), [data-role="clouds"]:not([hidden])') || [])].map(node => node.dataset?.assetId || '');
  return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2, r: Math.min(rect.width, rect.height) * 0.47, storm: ids.some(id => /storm/.test(id)) };
}

export class TitleVfxV188 {
  constructor({ screen, scene, canvas, matchMedia = globalThis.matchMedia?.bind(globalThis), getQuality = () => 'high',
    requestFrame = globalThis.requestAnimationFrame?.bind(globalThis), cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis),
    random = createRandomV188((Date.now() & 0xffff) ^ 0x5a17), document: documentRef = globalThis.document } = {}) {
    Object.assign(this, { screen, scene, canvas, getQuality, requestFrame, cancelFrame, random, documentRef });
    this.motionQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.frame = null; this.last = 0; this.time = 0; this.dust = []; this.storm = null; this.entry = null; this.grainTimer = 0;
    this.planet = null; this.planetCheck = 0; this.grainPattern = null;
    this.backCanvas = documentRef?.createElement?.('canvas') || null;
    if (this.backCanvas) { this.backCanvas.className = 'title-vfx-v188 title-vfx-v188--planet'; this.backCanvas.setAttribute?.('aria-hidden', 'true'); }
    this.tick = (stamp) => this.step(stamp);
    this.observer = typeof MutationObserver === 'function' && screen ? new MutationObserver(() => this.sync()) : null;
    this.observer?.observe(screen, { attributes: true, attributeFilter: ['hidden'] });
    this.onVisibility = () => this.sync();
    documentRef?.addEventListener?.('visibilitychange', this.onVisibility);
    this.sync();
  }

  get reducedMotion() {
    return Boolean(this.motionQuery?.matches || this.documentRef?.documentElement?.classList?.contains('reduced-motion'));
  }

  sync() {
    const visible = this.screen && !this.screen.hidden && !this.documentRef?.hidden;
    if (visible) this.start(); else this.stop();
  }

  start() {
    if (this.frame !== null || !this.canvas || typeof this.requestFrame !== 'function') return;
    const quality = this.getQuality() === 'low' ? 'low' : 'high';
    this.quality = quality;
    this.dust = createDustV188(TITLE_VFX_V188.dust[quality], this.random);
    this.storm = scheduleLightningV188(this.time, this.random); this.entry = scheduleEntryV188(this.time, this.random);
    this.last = 0; this.frame = this.requestFrame(this.tick);
  }

  stop() {
    if (this.frame !== null) this.cancelFrame?.(this.frame);
    this.frame = null;
    for (const canvas of [this.canvas, this.backCanvas]) canvas?.getContext?.('2d')?.clearRect?.(0, 0, canvas.width, canvas.height);
  }

  resize(canvas = this.canvas) {
    const ratio = Math.min(2, globalThis.devicePixelRatio || 1), width = Math.round((canvas.clientWidth || 1280) * ratio), height = Math.round((canvas.clientHeight || 720) * ratio);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    return ratio;
  }

  step(stamp) {
    this.frame = this.requestFrame(this.tick);
    const elapsed = this.last ? (stamp - this.last) / 1000 : 0;
    if (this.last && elapsed < 1 / TITLE_VFX_V188.fps) return;
    this.last = stamp;
    const dt = Math.min(0.1, elapsed);
    this.time += dt;
    const ctx = this.canvas.getContext('2d'); if (!ctx) return;
    const ratio = this.resize(), width = this.canvas.width, height = this.canvas.height, still = this.reducedMotion;
    if ((this.planetCheck -= dt) <= 0) { this.planet = titleVfxPlanetV188(this.scene); this.planetCheck = 1; }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, width, height);
    if (!still) stepDustV188(this.dust, dt);
    // The scene re-renders its layers with replaceChildren(): put the planet canvas back when needed.
    const back = this.backCanvas;
    if (back && this.scene && back.parentNode !== this.scene) this.scene.appendChild?.(back);
    const backCtx = back?.parentNode ? back.getContext('2d') : null;
    if (backCtx) {
      const backRatio = this.resize(back); backCtx.setTransform(1, 0, 0, 1, 0, 0); backCtx.clearRect(0, 0, back.width, back.height);
      this.drawPlanetEffects(backCtx, backRatio, back.getBoundingClientRect?.() || { left: 0, top: 0 }, still);
    }
    this.drawDust(ctx, width, height, ratio);
    if (this.quality === 'high') this.drawGrain(ctx, width, height, dt, still);
  }

  drawPlanetEffects(ctx, ratio, sceneRect, still) {
    const planet = this.planet; if (!planet || still) return;
    const cx = (planet.cx - sceneRect.left) * ratio, cy = (planet.cy - sceneRect.top) * ratio, r = planet.r * ratio;
    if (planet.storm) {
      if (this.time > this.storm.end + 0.5) this.storm = scheduleLightningV188(this.time, this.random);
      const glow = lightningIntensityV188(this.storm, this.time);
      if (glow > 0.01) {
        const x = cx + this.storm.x * r, y = cy + this.storm.y * r, radius = this.storm.radius * r;
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
        // The cloud deck lit from inside: a wide dim sheet, then the bright core.
        const sheet = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.4);
        sheet.addColorStop(0, `rgba(176, 200, 240, ${0.26 * glow})`); sheet.addColorStop(1, 'rgba(120, 150, 210, 0)');
        ctx.fillStyle = sheet; ctx.fillRect(x - radius * 2.4, y - radius * 2.4, radius * 4.8, radius * 4.8);
        const core = ctx.createRadialGradient(x, y, 0, x, y, radius);
        core.addColorStop(0, `rgba(236, 244, 255, ${0.8 * glow})`); core.addColorStop(0.3, `rgba(190, 210, 245, ${0.4 * glow})`); core.addColorStop(1, 'rgba(120, 150, 210, 0)');
        ctx.fillStyle = core; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); ctx.restore();
      }
    }
    if (this.time > this.entry.at + this.entry.duration) this.entry = scheduleEntryV188(this.time, this.random);
    const t = (this.time - this.entry.at) / this.entry.duration;
    if (t >= 0 && t <= 1) {
      const head = this.entry.from + this.entry.sweep * t, tail = head - this.entry.sweep * 0.6, orbit = r * this.entry.depth;
      const fade = Math.sin(Math.PI * t);
      ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255, 170, 96, .9)'; ctx.shadowBlur = 10 * ratio;
      ctx.strokeStyle = `rgba(255, 196, 132, ${0.7 * fade})`; ctx.lineWidth = 2.2 * ratio;
      ctx.beginPath(); ctx.arc(cx, cy, orbit, Math.min(head, tail), Math.max(head, tail)); ctx.stroke();
      ctx.fillStyle = `rgba(255, 236, 205, ${0.85 * fade})`; ctx.beginPath(); ctx.arc(cx + Math.cos(head) * orbit, cy + Math.sin(head) * orbit, 1.8 * ratio, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  drawDust(ctx, width, height, ratio) {
    for (const mote of this.dust) {
      const flicker = 0.75 + 0.25 * Math.sin(mote.phase);
      ctx.fillStyle = `rgba(214, 232, 226, ${mote.alpha * flicker})`;
      ctx.beginPath(); ctx.arc(mote.x * width, mote.y * height, mote.size * mote.depth * ratio, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawGrain(ctx, width, height, dt, still) {
    const { tile, refresh, alpha } = TITLE_VFX_V188.grain;
    if (!this.grainCanvas) { this.grainCanvas = this.documentRef?.createElement?.('canvas'); if (!this.grainCanvas) return; this.grainCanvas.width = tile; this.grainCanvas.height = tile; this.grainTimer = 0; }
    if (!still && (this.grainTimer -= dt) <= 0 || !this.grainPattern) {
      const g = this.grainCanvas.getContext('2d'), image = g.createImageData(tile, tile);
      for (let index = 0; index < image.data.length; index += 4) { const v = Math.floor(this.random() * 255); image.data[index] = image.data[index + 1] = image.data[index + 2] = v; image.data[index + 3] = 255; }
      g.putImageData(image, 0, 0); this.grainPattern = ctx.createPattern(this.grainCanvas, 'repeat'); this.grainTimer = refresh;
    }
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = this.grainPattern; ctx.fillRect(0, 0, width, height); ctx.restore();
  }

  destroy() { this.stop(); this.backCanvas?.remove?.(); this.observer?.disconnect(); this.documentRef?.removeEventListener?.('visibilitychange', this.onVisibility); }
}
