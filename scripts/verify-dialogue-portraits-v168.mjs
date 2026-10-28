import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUB_NPC_ROSTER } from '../src/hub-v52-runtime.js';
import { NPC_DIALOGUE_PORTRAITS_V168, getNpcDialoguePortraitV168,
  drawNpcDialoguePortraitV168, setDialogueSpeakerPortraitV168 } from '../src/npc-dialogue-portraits-v168.js';

function recorder() {
  return { draws: [], clears: [], clearRect(...args) { this.clears.push(args); },
    drawImage(...args) { this.draws.push(args); } };
}
function portraitDom() {
  const ctx = recorder(), attributes = {}, classes = new Set(['is-sprite-cell-v62']), events = new Map();
  const canvas = { width: 0, height: 0, hidden: true, dataset: {},
    setAttribute(name, value) { attributes['canvas:' + name] = value; }, getContext() { return ctx; } };
  const container = { dataset: {}, classList: { add: value => classes.add(value) },
    setAttribute(name, value) { attributes[name] = value; },
    querySelector() { return this.child || null; }, appendChild(child) { this.child = child; } };
  const image = { style: {}, complete: false, naturalWidth: 0, naturalHeight: 0, currentSrc: '', hidden: false,
    parentElement: container, ownerDocument: { createElement: () => canvas },
    classList: { remove: value => classes.delete(value) },
    setAttribute(name, value) { attributes['image:' + name] = value; },
    addEventListener(name, fn) { if (!events.has(name)) events.set(name, new Set()); events.get(name).add(fn); },
    removeEventListener(name, fn) { events.get(name)?.delete(fn); },
    get src() { return this._src || ''; },
    set src(value) { this._src = value; this.complete = false; this.currentSrc = ''; },
    load(width = 1024, height = 1024) {
      this.complete = true; this.naturalWidth = width; this.naturalHeight = height; this.currentSrc = this.src;
      for (const fn of [...events.get('load') || []]) fn();
    },
    fail() { for (const fn of [...events.get('error') || []]) fn(); },
    listeners(name) { return [...events.get(name) || []]; }
  };
  return { image, canvas, container, ctx, attributes, classes };
}

test('every actual crew speaker has its own bounded head/shoulder window in its real unchanged PNG', () => {
  assert.equal(NPC_DIALOGUE_PORTRAITS_V168.length, 16);
  assert.equal(new Set(NPC_DIALOGUE_PORTRAITS_V168.map(profile => profile.crewId)).size, 16);
  for (const member of HUB_NPC_ROSTER) {
    const profile = getNpcDialoguePortraitV168(member.crewId); assert.ok(profile, member.crewId);
    assert.equal(profile.source, member.spritePath); assert.equal(profile.framing, 'head-and-shoulders');
    const png = readFileSync(new URL('..' + profile.source, import.meta.url));
    assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    assert.equal(png.readUInt32BE(16), profile.sourceWidth); assert.equal(png.readUInt32BE(20), profile.sourceHeight);
    const { x, y, w, h } = profile.crop;
    assert.ok(x >= 0 && y >= 0 && x + w <= 256 && y + h <= 118);
    assert.ok(w >= 64 && h >= 64 && w <= 100 && h <= 100);
    assert.equal(profile.sourcePixelsChanged, false); assert.ok(Object.isFrozen(profile.crop));
  }
  assert.equal(getNpcDialoguePortraitV168('unknown-crew'), null);
});

test('the real portrait draw only spends its source head window and keeps isotropic scale in tall or wide frames', () => {
  for (const profile of NPC_DIALOGUE_PORTRAITS_V168) for (const [width, height] of [[384, 384], [220, 540], [640, 180]]) {
    const ctx = recorder(), image = { complete: true, naturalWidth: 1024, naturalHeight: 1024, src: profile.source };
    const result = drawNpcDialoguePortraitV168(ctx, image, profile, { width, height });
    assert.ok(result); assert.equal(ctx.draws.length, 1); assert.equal(ctx.draws[0].length, 9);
    assert.deepEqual(ctx.draws[0].slice(1, 5), [profile.crop.x, profile.crop.y, profile.crop.w, profile.crop.h]);
    assert.equal(result.scaleX, result.scaleY); assert.equal(result.fullSpriteShown, false);
    assert.ok(result.target.x >= 0 && result.target.y >= 0);
    assert.ok(result.target.x + result.target.w <= width + 1e-8);
    assert.ok(result.target.y + result.target.h <= height + 1e-8);
  }
  const profile = NPC_DIALOGUE_PORTRAITS_V168[0], ctx = recorder();
  assert.equal(drawNpcDialoguePortraitV168(ctx, { complete: false }, profile), null);
  assert.equal(drawNpcDialoguePortraitV168(ctx, { complete: true, naturalWidth: 1024, naturalHeight: 1024,
    src: NPC_DIALOGUE_PORTRAITS_V168[1].source }, profile), null);
  assert.deepEqual(ctx.draws, []);
});

test('loading or failed crew art never exposes the full sprite and presents the correct accessible speaker fallback', () => {
  const d = portraitDom(), result = setDialogueSpeakerPortraitV168(d.image,
    { crewId: 'crew-06-rook', name: 'Rook' });
  assert.equal(result.kind, 'head-and-shoulders'); assert.equal(d.image.hidden, true); assert.equal(d.canvas.hidden, true);
  assert.equal(d.container.dataset.dialoguePortraitStateV168, 'loading');
  assert.equal(d.container.dataset.dialoguePortraitInitialsV168, 'R');
  assert.equal(d.attributes['aria-label'], 'Portrait de Rook');
  d.image.fail(); assert.equal(d.container.dataset.dialoguePortraitStateV168, 'fallback');
  assert.equal(d.image.hidden, true); assert.equal(d.canvas.hidden, true); assert.equal(d.ctx.draws.length, 0);
  setDialogueSpeakerPortraitV168(d.image, { crewId: 'not-a-crew-member', name: 'Contact inconnu' });
  assert.equal(d.container.dataset.dialoguePortraitKindV168, 'initials');
  assert.equal(d.container.dataset.dialoguePortraitInitialsV168, 'CI'); assert.equal(d.image.hidden, true);
});

test('a late previous speaker cannot paint the next avatar, and painted station portraits retain their source', () => {
  const d = portraitDom();
  setDialogueSpeakerPortraitV168(d.image, { crewId: 'crew-06-rook', name: 'Rook' });
  const stale = d.image.listeners('load');
  setDialogueSpeakerPortraitV168(d.image, { crewId: 'crew-02-tamsin-velez', name: 'Tamsin Velez' });
  for (const fn of stale) fn(); assert.equal(d.ctx.draws.length, 0);
  d.image.load(); assert.equal(d.container.dataset.dialoguePortraitCrewV168, 'crew-02-tamsin-velez');
  assert.equal(d.container.dataset.dialoguePortraitStateV168, 'ready');
  assert.equal(d.canvas.hidden, false); assert.equal(d.image.hidden, true);
  assert.deepEqual(JSON.parse(d.canvas.dataset.portraitSourceRectV168), getNpcDialoguePortraitV168('crew-02-tamsin-velez').crop);
  const painted = '/assets/openai/ui/dialogue/mara-vega-operations-v61.png';
  setDialogueSpeakerPortraitV168(d.image, { name: 'Mara Vega', paintedSource: painted });
  assert.equal(d.canvas.hidden, true); assert.equal(d.image.hidden, true); d.image.load(1086, 1448);
  assert.equal(d.image.src, painted); assert.equal(d.image.hidden, false); assert.equal(d.canvas.hidden, true);
  assert.equal(d.container.dataset.dialoguePortraitKindV168, 'painted-portrait');
});

