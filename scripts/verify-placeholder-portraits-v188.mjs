// V188 (Q78 / Q79) — placeholder primitive portraits for Tomas Wren, Lucia Ferro
// and Adèle Sarrazin: resolution in every surface, frame bounds, determinism,
// distinctive sign, colour-blind readability and integration contracts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PLACEHOLDER_PORTRAITS_V188, getPlaceholderPortraitV188, drawPlaceholderPortraitV188,
  drawPlaceholderSignV188 } from '../src/placeholder-portraits-v188.js';
import { CINEMATICS_V188, cinematicSpeakerPortraitKindV188, drawCinematicFrameV188, cinematicShotAtV188 } from '../src/story-cinematics-v188.js';
import { setDialogueSpeakerPortraitV168 } from '../src/npc-dialogue-portraits-v168.js';
import { COLORBLIND_MATRICES_V188 } from '../src/accessibility-v188.js';

const NAMES = ['TOMAS WREN', 'LUCIA FERRO', 'ADÈLE SARRAZIN'];
const SIGNS = { 'TOMAS WREN': 'hi-vis-vest', 'LUCIA FERRO': 'cross-armband', 'ADÈLE SARRAZIN': 'elder-scarf' };

/** Records every call with its arguments and tracks every painted coordinate. */
function recorder() {
  const calls = [], points = [];
  const ctx = new Proxy({ fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left', imageSmoothingEnabled: true }, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'calls') return calls; if (key === 'points') return points;
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (key === 'measureText') return text => ({ width: String(text).length * 10 });
      return (...args) => {
        calls.push([key, ...args.map(value => typeof value === 'number' ? Math.round(value * 1e6) / 1e6 : value)]);
        if (key === 'moveTo' || key === 'lineTo') points.push([args[0], args[1]]);
        if (key === 'rect' || key === 'fillRect') points.push([args[0], args[1]], [args[0] + args[2], args[1] + args[3]]);
        if (key === 'ellipse') points.push([args[0] - args[2], args[1] - args[3]], [args[0] + args[2], args[1] + args[3]]);
        if (key === 'fill' || key === 'fillRect') calls.push(['fillStyle', target.fillStyle]);
      };
    },
    set(target, key, value) { target[key] = value; calls.push(['set', key, value]); return true; }
  });
  return ctx;
}

test('the three residents retain their drawn placeholder fallback, never initials', () => {
  assert.equal(PLACEHOLDER_PORTRAITS_V188.length, 3);
  for (const name of NAMES) {
    const profile = getPlaceholderPortraitV188(name);
    assert.ok(profile, name); assert.equal(profile.placeholder, true); assert.equal(profile.sign, SIGNS[name]);
    assert.equal(getPlaceholderPortraitV188(name.toLowerCase()), profile, 'case and accents do not matter');
    assert.equal(getPlaceholderPortraitV188(profile.id), profile);
    assert.equal(cinematicSpeakerPortraitKindV188({ speaker: name, crewId: null }), 'colony-portrait');
    const ctx = recorder(), result = drawPlaceholderPortraitV188(ctx, profile, { x: 74, y: 500, size: 80 });
    assert.equal(result.kind, 'placeholder-portrait'); assert.equal(result.placeholder, true);
    assert.ok(ctx.calls.filter(([key]) => key === 'fill' || key === 'fillRect').length > 24, `${name} is a drawing`);
    assert.equal(ctx.calls.some(([key]) => key === 'fillText' || key === 'stroke' || key === 'strokeRect'), false, 'no text, no outline');
  }
  // Everyone else keeps their existing path.
  assert.equal(getPlaceholderPortraitV188('ASHA MBAYE'), null); assert.equal(getPlaceholderPortraitV188('Contact inconnu'), null);
  assert.equal(cinematicSpeakerPortraitKindV188({ speaker: 'ASHA MBAYE', crewId: 'crew-12-asha-mbaye' }), 'crew-crop');
  assert.equal(cinematicSpeakerPortraitKindV188({ speaker: 'CASSIUS', crewId: null }), 'initials');
});

test('every resident cinematic retains its primitive when the authored image is unavailable', () => {
  const seen = new Set();
  for (const [id, cinematic] of Object.entries(CINEMATICS_V188)) for (const shot of cinematic.shots) {
    if (!shot.line || !getPlaceholderPortraitV188(shot.line.speaker)) continue;
    seen.add(shot.line.speaker); assert.equal(cinematicSpeakerPortraitKindV188(shot.line), 'colony-portrait', id);
  }
  assert.deepEqual([...seen].sort(), [...NAMES].sort());
  // Real frames: the subtitle portrait paints the bust, no initials text.
  for (const id of ['cin-p3-wren', 'cin-p3-ferro', 'cin-doyenne']) {
    const shots = CINEMATICS_V188[id].shots; let start = 0;
    shots.forEach(shot => {
      const time = start + shot.seconds * .9; start += shot.seconds;
      if (!shot.line || !getPlaceholderPortraitV188(shot.line.speaker)) return;
      assert.equal(cinematicShotAtV188(id, time).shot, shot);
      const ctx = recorder(); drawCinematicFrameV188(ctx, id, time, { language: 'fr' });
      const initials = shot.line.speaker.split(/\s+/).map(part => part[0]).join('');
      assert.equal(ctx.calls.some(([key, text]) => key === 'fillText' && text === initials), false, `${id}: no initials`);
      assert.ok(ctx.calls.some(([key, x, y, w, h]) => key === 'rect' && x === 74 && w === 80 && h === 80), `${id}: portrait clip in frame`);
    });
  }
});

test('all drawing stays inside the frame at every size and offset', () => {
  for (const profile of PLACEHOLDER_PORTRAITS_V188) for (const [x, y, size] of [[0, 0, 384], [74, 500, 80], [13.5, 7.25, 44], [0, 0, 24]])
    for (const colorblind of [false, true]) {
      const ctx = recorder(); drawPlaceholderPortraitV188(ctx, profile, { x, y, size, colorblind });
      assert.ok(ctx.points.length > 40);
      for (const [px, py] of ctx.points) {
        assert.ok(px >= x - 1e-9 && px <= x + size + 1e-9, `${profile.id} x ${px} in [${x}, ${x + size}]`);
        assert.ok(py >= y - 1e-9 && py <= y + size + 1e-9, `${profile.id} y ${py} in [${y}, ${y + size}]`);
      }
      // save/clip/restore balanced; the frame clip is the first path.
      const keys = ctx.calls.map(([key]) => key);
      assert.equal(keys.filter(key => key === 'save').length, keys.filter(key => key === 'restore').length);
      assert.deepEqual(ctx.calls.find(([key]) => key === 'rect').slice(1), [x, y, size, size].map(v => Math.round(v * 1e6) / 1e6));
      assert.equal(keys.includes('clearRect'), false, 'transparent: the caller owns the backdrop');
    }
});

test('the output is deterministic and scale-invariant', () => {
  for (const profile of PLACEHOLDER_PORTRAITS_V188) {
    const a = recorder(), b = recorder();
    drawPlaceholderPortraitV188(a, profile, { x: 4, y: 4, size: 80 }); drawPlaceholderPortraitV188(b, profile, { x: 4, y: 4, size: 80 });
    assert.deepEqual(a.calls, b.calls);
    // The same picture at another size: every point scales with the frame.
    const small = recorder(), large = recorder();
    drawPlaceholderPortraitV188(small, profile, { size: 100 }); drawPlaceholderPortraitV188(large, profile, { size: 400 });
    assert.equal(small.points.length, large.points.length);
    small.points.forEach(([px, py], index) => {
      assert.ok(Math.abs(px * 4 - large.points[index][0]) < 1e-6 && Math.abs(py * 4 - large.points[index][1]) < 1e-6);
    });
  }
});

test('proportions: head-and-shoulders framing comparable to the crew crops', () => {
  // Head ≈ 0.39 of the frame high, shoulders ≈ 0.9 wide (≈ 2.3 head heights),
  // head width/height ≈ 0.8, chin above the collar: a human bust, not a mascot.
  for (const profile of PLACEHOLDER_PORTRAITS_V188) {
    const ctx = recorder(); drawPlaceholderPortraitV188(ctx, profile, { size: 1000 });
    const ellipses = ctx.calls.filter(([key]) => key === 'ellipse');
    const head = ellipses.find(([, , , rx, ry]) => rx > 140 && rx < 170 && ry > 180);
    assert.ok(head, `${profile.id} has a head`);
    const [, , cy, rx, ry] = head, shoulders = ctx.points.filter(([, py]) => py >= 990).map(([px]) => px);
    const width = Math.max(...shoulders) - Math.min(...shoulders);
    assert.ok(width / (2 * ry) > 2.0 && width / (2 * ry) < 2.6, `${profile.id} shoulders ${width} vs head ${2 * ry}`);
    assert.ok(rx / ry > .7 && rx / ry < .9); assert.ok(cy + ry < 600 && cy - ry > 100, 'head inside the upper part');
  }
});

test('the distinctive sign is present, has a shape, and stays readable in colour-blind modes', () => {
  const lum = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lin = c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; return .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b); };
  const simulate = (hex, matrix) => { const m = matrix.trim().split(/\s+/).map(Number), c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    return '#' + [0, 1, 2].map(row => Math.max(0, Math.min(255, Math.round(m[row * 5] * c[0] + m[row * 5 + 1] * c[1] + m[row * 5 + 2] * c[2])))).map(v => v.toString(16).padStart(2, '0')).join(''); };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
  for (const profile of PLACEHOLDER_PORTRAITS_V188) {
    const plain = recorder(), safe = recorder();
    assert.equal(drawPlaceholderSignV188(plain, profile), true); drawPlaceholderSignV188(safe, profile, { colorblind: true });
    const geometry = ctx => ctx.calls.filter(([key]) => !['set', 'fillStyle'].includes(key));
    assert.ok(geometry(plain).length >= 6, `${profile.id} sign has several shapes`);
    assert.deepEqual(geometry(plain), geometry(safe), 'same shape with or without the colour-blind palette');
    // The sign is part of the full portrait, drawn in its own colours.
    const full = recorder(); drawPlaceholderPortraitV188(full, profile, { size: 384 });
    const fills = new Set(full.calls.filter(([key]) => key === 'fillStyle').map(([, v]) => v));
    assert.ok(fills.has(profile.palette.sign) && fills.has(profile.palette.mark));
    // Mark vs sign, and sign vs garment, differ in brightness for every deficiency (not only in hue).
    for (const colours of [profile.palette, { ...profile.palette, ...profile.safe }])
      for (const matrix of [null, ...Object.values(COLORBLIND_MATRICES_V188)]) {
        const see = hex => matrix ? simulate(hex, matrix) : hex;
        assert.ok(contrast(see(colours.mark), see(colours.sign)) >= 1.8, `${profile.id} mark/sign`);
        assert.ok(contrast(see(colours.sign), see(colours.garment)) >= 2.2, `${profile.id} sign/garment`);
      }
  }
});

test('hub dialogue frame: pending colony art shows its transparent 384 primitive; others unchanged', () => {
  const dom = () => {
    const ctx = recorder(), canvas = { width: 0, height: 0, hidden: true, dataset: {}, setAttribute() {}, getContext: () => ctx };
    const container = { dataset: {}, classList: { add() {} }, setAttribute() {}, querySelector() { return this.child || null; }, appendChild(child) { this.child = child; } };
    const image = { complete: false, hidden: false, parentElement: container, ownerDocument: { createElement: () => canvas },
      classList: { remove() {} }, setAttribute() {}, addEventListener() {}, removeEventListener() {}, src: '' };
    return { ctx, canvas, container, image };
  };
  for (const name of ['Tomas Wren', 'Lucia Ferro', 'Adèle Sarrazin']) {
    const d = dom(), result = setDialogueSpeakerPortraitV168(d.image, { name });
    assert.equal(result.kind, 'colony-portrait'); assert.equal(d.canvas.width, 384); assert.equal(d.canvas.hidden, false);
    assert.equal(d.container.dataset.dialoguePortraitKindV168, 'colony-portrait');
    assert.equal(d.container.dataset.dialoguePortraitStateV168, 'loading');
    assert.equal(d.container.dataset.dialoguePortraitFallbackV188, 'placeholder-portrait');
    assert.ok(d.ctx.points.every(([x, y]) => x >= 0 && y >= 0 && x <= 384 && y <= 384));
  }
  const d = dom(); setDialogueSpeakerPortraitV168(d.image, { name: 'Contact inconnu' });
  assert.equal(d.container.dataset.dialoguePortraitKindV168, 'initials'); assert.equal(d.canvas.hidden, true);
});

test('the preserved primitive fallback remains offline, labelled and independent of images', () => {
  assert.ok(readFileSync(new URL('../sw.js', import.meta.url), 'utf8').includes("'/src/placeholder-portraits-v188.js'"));
  const source = readFileSync(new URL('../src/placeholder-portraits-v188.js', import.meta.url), 'utf8');
  assert.match(source, /PLACEHOLDER/); assert.match(source, /NOT\s+(\/\/\s*)?franchise-accurate/);
  assert.doesNotMatch(source, /drawImage|new Image|\.png/);
  for (const profile of PLACEHOLDER_PORTRAITS_V188) assert.ok(Object.isFrozen(profile) && Object.isFrozen(profile.palette));
});
