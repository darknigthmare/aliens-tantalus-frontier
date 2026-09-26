import {
  DEPTH_LAB_ZONES_V97, DEPTH_LAB_ACTORS_V97, DEPTH_LAB_ASSETS_V97,
  createDepthLabStateV97, getDepthLabZoneV97, projectDepthLabV97, unprojectDepthLabV97,
  stepDepthLabV97, sortDepthLabV97, depthLabParallaxV97
} from './depth-lab-model-v97.js';

const $ = id => document.getElementById(id);
let state = createDepthLabStateV97();
const images = new Map(), heldKeys = new Set(), heldPointers = new Map();
const stages = [[$('flat-stage'), '2d'], [$('depth-stage'), '2.5d']];
let frame = 0, previousTime = 0, disposed = false, dragging = null;
const lifetime = new AbortController(), listen = (target, event, fn) => target.addEventListener(event, fn, { signal: lifetime.signal });
const options = (select, records) => records.forEach(record => {
  const option = document.createElement('option'); option.value = record.id; option.textContent = record.name; select.append(option);
});
options($('zone-select'), DEPTH_LAB_ZONES_V97); options($('actor-select'), DEPTH_LAB_ACTORS_V97);

function syncControls() {
  const zone = getDepthLabZoneV97(state.zoneId);
  document.documentElement.style.setProperty('--accent', zone.accent);
  $('zone-select').value = state.zoneId; $('actor-select').value = state.actorId;
  $('zone-source').textContent = `SOURCE : ${zone.operationId} · ${zone.operationTitle}`;
  $('zone-note').textContent = zone.note;
  $('x-range').value = Math.round(state.x); $('x-value').textContent = Math.round(state.x);
  $('depth-range').value = Math.round(state.depth * 100); $('depth-value').textContent = `${Math.round(state.depth * 100)}%`;
  $('parallax-range').value = state.parallax * 100; $('parallax-value').textContent = `${Math.round(state.parallax * 100)}%`;
  $('grid-check').checked = state.grid; $('occlusion-check').checked = state.occlusion; $('follow-check').checked = state.follow;
  $('demo-button').setAttribute('aria-pressed', String(state.demo));
  $('pause-button').setAttribute('aria-pressed', String(state.paused)); $('pause-button').textContent = state.paused ? 'Reprendre' : 'Pause';
  $('position-readout').textContent = `X ${Math.round(state.x)} · profondeur ${Math.round(state.depth * 100)}% · ${state.paused ? 'pause' : 'pose fixe'}`;
  document.querySelector('.stages').dataset.layout = state.mode === 'compare' ? 'compare' : 'single';
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
  document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = state.mode !== 'compare' && p.dataset.panel !== state.mode; });
}

function drawLayer(ctx, path, viewport, offset, opacity = 1) {
  const img = images.get(path); if (!img) return;
  // Modest overscan retains authored edge consoles. Clamp at the painted extent,
  // rather than revealing blank pixels when the study camera reaches an end.
  const factor = Math.max(viewport.width / img.naturalWidth, viewport.height / img.naturalHeight) * 1.14;
  const w = img.naturalWidth * factor, h = img.naturalHeight * factor;
  const travel = Math.max(0, (w - viewport.width) / 2), boundedOffset = Math.max(-travel, Math.min(travel, offset));
  ctx.save(); ctx.globalAlpha = opacity; ctx.filter = 'brightness(1.35)';
  ctx.drawImage(img, (viewport.width - w) / 2 + boundedOffset, (viewport.height - h) / 2, w, h); ctx.restore();
}
function floor(ctx, viewport, mode, zone) {
  const { width: w, height: h } = viewport;
  const top = mode === '2d' ? h * .79 : h * .55;
  const fill = ctx.createLinearGradient(0, top, 0, h); fill.addColorStop(0, 'rgba(9,19,22,.25)'); fill.addColorStop(1, '#15212a');
  ctx.fillStyle = fill; ctx.fillRect(0, top, w, h - top);
  ctx.lineWidth = 1; ctx.strokeStyle = zone.accent + '32';
  if (state.grid) {
    for (let x = -800; x <= 3200; x += 160) {
      const a = projectDepthLabV97({ x, depth: 1 }, viewport, mode, state.camera);
      const b = projectDepthLabV97({ x, depth: 0 }, viewport, mode, state.camera);
      ctx.beginPath(); ctx.moveTo(a.x, mode === '2d' ? top : a.y); ctx.lineTo(b.x, mode === '2d' ? h : b.y); ctx.stroke();
    }
    for (const depth of [0, .2, .4, .6, .8, 1]) {
      const p = projectDepthLabV97({ x: 0, depth }, viewport, mode, state.camera);
      ctx.beginPath(); ctx.moveTo(0, p.y); ctx.lineTo(w, p.y); ctx.stroke();
    }
  }
  ctx.fillStyle = zone.accent + '99'; ctx.font = '10px system-ui';
  ctx.fillText(mode === '2d' ? 'UN SEUL PLAN DE JEU' : 'FOND  /  Z = 100%', 14, top - 8);
  if (mode !== '2d') ctx.fillText('AVANT-PLAN  /  Z = 0%', 14, h - 12);
}
function volume(ctx, item, viewport, mode, zone) {
  const p = projectDepthLabV97(item, viewport, mode, state.camera);
  const unit = viewport.height / 620 * p.scale;
  const w = item.width * unit, h = item.height * unit, edge = mode === '2d' ? 0 : w * .16;
  ctx.save(); ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 2, w * .63, w * .13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#293941'; ctx.strokeStyle = zone.accent + '8a'; ctx.lineWidth = 1;
  ctx.fillRect(-w / 2, -h, w, h); ctx.strokeRect(-w / 2, -h, w, h);
  if (edge) {
    ctx.fillStyle = '#40535b'; ctx.beginPath(); ctx.moveTo(-w / 2, -h); ctx.lineTo(-w / 2 + edge, -h - edge); ctx.lineTo(w / 2 + edge, -h - edge); ctx.lineTo(w / 2, -h); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1b2b33'; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2 + edge, -edge); ctx.lineTo(w / 2 + edge, -h - edge); ctx.lineTo(w / 2, -h); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.strokeStyle = zone.accent + '55'; ctx.strokeRect(-w * .40, -h * .87, w * .8, h * .74);
  ctx.fillStyle = zone.accent; ctx.fillRect(-w * .36, -h * .75, w * .13, Math.max(2, unit * 3));
  ctx.fillStyle = '#b5c9cf'; ctx.font = `${Math.max(8, 9 * unit)}px system-ui`; ctx.fillText('VOLUME TEST', -w * .36, -h * .48);
  ctx.restore();
}
function actor(ctx, item, viewport, mode, zone, ghost = false) {
  const spec = DEPTH_LAB_ACTORS_V97.find(a => a.id === item.actorId) || DEPTH_LAB_ACTORS_V97[0];
  const img = images.get(spec.path); if (!img) return;
  const p = projectDepthLabV97(item, viewport, mode, state.camera);
  const opaqueHeight = viewport.height * .34 * p.scale * spec.relativeHeight;
  const ratio = opaqueHeight / (spec.bounds[3] - spec.bounds[1]);
  ctx.save(); ctx.translate(p.x, p.y);
  ctx.fillStyle = ghost ? 'rgba(7,15,17,.25)' : 'rgba(0,0,0,.48)';
  ctx.beginPath(); ctx.ellipse(0, 0, opaqueHeight * .22, opaqueHeight * .048, 0, 0, Math.PI * 2); ctx.fill();
  if (!ghost) { ctx.strokeStyle = zone.accent; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 1, opaqueHeight * .25, opaqueHeight * .062, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.globalAlpha = ghost ? .48 : 1;
  ctx.scale(item.facing || 1, 1);
  ctx.drawImage(img, -spec.pivotX * spec.width * ratio, -spec.bounds[3] * ratio, spec.width * ratio, spec.height * ratio);
  ctx.restore();
  if (!ghost) { ctx.fillStyle = zone.accent; ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('TÉMOIN', p.x, p.y + 17); ctx.textAlign = 'left'; }
}
function render(canvas, mode) {
  if (canvas.closest('figure').hidden) return;
  const rect = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  if (!rect.width || !rect.height) return;
  const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const viewport = { width: rect.width, height: rect.height }, zone = getDepthLabZoneV97(state.zoneId);
  ctx.fillStyle = '#080e13'; ctx.fillRect(0, 0, viewport.width, viewport.height);
  drawLayer(ctx, zone.layers[0], viewport, depthLabParallaxV97(state.camera, 'far', viewport.width, state.parallax, mode));
  drawLayer(ctx, zone.layers[1], viewport, depthLabParallaxV97(state.camera, 'mid', viewport.width, state.parallax, mode), .70);
  floor(ctx, viewport, mode, zone);
  const objects = [...zone.props.map(p => ({ ...p, kind: 'prop' })),
    { id: 'reference', kind: 'ghost', x: 1340, depth: .8, actorId: state.actorId, facing: -1 },
    { id: 'player', kind: 'actor', x: state.x, depth: state.depth, actorId: state.actorId, facing: state.facing }];
  for (const item of sortDepthLabV97(objects, mode, state.occlusion)) {
    if (item.kind === 'prop') volume(ctx, item, viewport, mode, zone); else actor(ctx, item, viewport, mode, zone, item.kind === 'ghost');
  }
  drawLayer(ctx, zone.layers[2], viewport, depthLabParallaxV97(state.camera, 'foreground', viewport.width, state.parallax, mode), .60);
  const shade = ctx.createLinearGradient(0, 0, 0, viewport.height * .25); shade.addColorStop(0, 'rgba(0,0,0,.45)'); shade.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = shade; ctx.fillRect(0, 0, viewport.width, viewport.height * .25);
  ctx.fillStyle = '#b9d0d8'; ctx.font = '10px system-ui'; ctx.fillText(zone.name.toUpperCase(), 14, 22);
  ctx.fillStyle = '#8ca6b0'; ctx.fillText('POSES FIXES · VOLUMES NON COLLIDANTS', 14, 39);
}
const draw = () => stages.forEach(([canvas, mode]) => render(canvas, mode));
const clearInput = () => { heldKeys.clear(); heldPointers.clear(); dragging = null; };
function frameLoop(time) {
  if (disposed) return;
  const dt = previousTime ? (time - previousTime) / 1000 : 0; previousTime = time;
  const on = (...codes) => codes.some(code => heldKeys.has(code));
  const touch = value => [...heldPointers.values()].includes(value);
  const input = { x: Number(on('ArrowRight', 'KeyD') || touch('right')) - Number(on('ArrowLeft', 'KeyA', 'KeyQ') || touch('left')),
    depth: Number(on('ArrowUp', 'KeyW', 'KeyZ') || touch('far')) - Number(on('ArrowDown', 'KeyS') || touch('near')) };
  state = stepDepthLabV97(state, input, dt); syncControls(); draw(); frame = requestAnimationFrame(frameLoop);
}
function change(fn) { fn(); syncControls(); draw(); }
listen($('zone-select'), 'change', e => change(() => { state.zoneId = getDepthLabZoneV97(e.target.value).id; }));
listen($('actor-select'), 'change', e => change(() => { state.actorId = e.target.value; }));
for (const [id, key, divisor] of [['x-range', 'x', 1], ['depth-range', 'depth', 100], ['parallax-range', 'parallax', 100]])
  listen($(id), 'input', e => change(() => { state[key] = Number(e.target.value) / divisor; state.demo = false; }));
for (const [id, key] of [['grid-check', 'grid'], ['occlusion-check', 'occlusion'], ['follow-check', 'follow']])
  listen($(id), 'change', e => change(() => { state[key] = e.target.checked; }));
document.querySelectorAll('[data-mode]').forEach(b => listen(b, 'click', () => change(() => { state.mode = b.dataset.mode; clearInput(); })));
listen($('demo-button'), 'click', () => change(() => { state.demo = !state.demo; state.paused = false; }));
listen($('pause-button'), 'click', () => change(() => { state.paused = !state.paused; clearInput(); }));
listen($('reset-button'), 'click', () => change(() => { state = createDepthLabStateV97(); clearInput(); }));
const movementCodes = new Set(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyQ']);
listen(window, 'keydown', e => {
  if (!stages.some(([canvas]) => canvas === document.activeElement)) return;
  if (movementCodes.has(e.code)) { e.preventDefault(); heldKeys.add(e.code); }
  if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) change(() => { state.paused = !state.paused; }); }
});
listen(window, 'keyup', e => heldKeys.delete(e.code));
listen(window, 'blur', clearInput);
listen(document, 'focusin', e => { if (!stages.some(([c]) => c === e.target)) heldKeys.clear(); });
listen(document, 'visibilitychange', () => { if (document.hidden) { clearInput(); cancelAnimationFrame(frame); previousTime = 0; } else if (!disposed) { cancelAnimationFrame(frame); frame = requestAnimationFrame(frameLoop); } });
function place(event, canvas, mode) {
  if (state.paused) return;
  const r = canvas.getBoundingClientRect();
  const next = unprojectDepthLabV97({ x: event.clientX - r.left, y: event.clientY - r.top }, r, mode, state.camera, state.depth);
  if (next.x !== state.x) state.facing = next.x < state.x ? -1 : 1;
  state.x = next.x; state.depth = next.depth; state.demo = false; syncControls(); draw();
}
for (const [canvas, mode] of stages) {
  listen(canvas, 'pointerdown', e => { canvas.focus({ preventScroll: true }); canvas.setPointerCapture(e.pointerId); dragging = { id: e.pointerId, canvas }; place(e, canvas, mode); });
  listen(canvas, 'pointermove', e => { if (dragging?.id === e.pointerId && dragging.canvas === canvas) place(e, canvas, mode); });
}
document.querySelectorAll('[data-move]').forEach(b => {
  listen(b, 'pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); heldPointers.set(e.pointerId, b.dataset.move); });
  // Keyboard activation performs a bounded nudge; pointer holds are frame-driven.
  listen(b, 'click', e => { if (e.detail !== 0 || state.paused) return; change(() => {
    const direction = b.dataset.move; state = stepDepthLabV97(state, { x: direction === 'right' ? 1 : direction === 'left' ? -1 : 0, depth: direction === 'far' ? 1 : direction === 'near' ? -1 : 0 }, .05);
  }); });
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(window, event, e => { heldPointers.delete(e.pointerId); if (dragging?.id === e.pointerId) dragging = null; });
listen(window, 'resize', draw);
function dispose() { disposed = true; cancelAnimationFrame(frame); clearInput(); lifetime.abort(); }
listen(window, 'pagehide', e => { if (!e.persisted) dispose(); else { clearInput(); cancelAnimationFrame(frame); previousTime = 0; } });
listen(window, 'pageshow', e => { if (e.persisted && !disposed) { cancelAnimationFrame(frame); frame = requestAnimationFrame(frameLoop); } });

// Diagnostic snapshot is read-only and detached: no state injection or save access.
window.__ATF_DEPTH_LAB_V97__ = Object.freeze({ snapshot: () => ({ ...state, loaded: images.size, expected: DEPTH_LAB_ASSETS_V97.length, disposed,
  projection2d: projectDepthLabV97(state, { width: 900, height: 620 }, '2d', state.camera),
  projection25d: projectDepthLabV97(state, { width: 900, height: 620 }, '2.5d', state.camera) }) });
syncControls(); draw();
let loaded = 0;
Promise.allSettled(DEPTH_LAB_ASSETS_V97.map(path => new Promise((resolve, reject) => {
  const img = new Image(); img.onload = () => { images.set(path, img); loaded++; $('asset-status').textContent = `${loaded}/${DEPTH_LAB_ASSETS_V97.length} ressources`; resolve(path); };
  img.onerror = () => reject(new Error(path)); img.src = path;
}))).then(results => {
  if (disposed) return;
  const failures = results.filter(r => r.status === 'rejected');
  $('asset-status').textContent = failures.length ? `${failures.length} ressource(s) indisponible(s)` : `${loaded} ressources prêtes · état temporaire`;
  if (failures.length) { $('load-error').hidden = false; $('load-error').textContent = `Chargement incomplet : ${failures.map(r => r.reason.message).join(', ')}. Aucun substitut graphique n’est généré.`; }
  draw();
});
frame = requestAnimationFrame(frameLoop);
