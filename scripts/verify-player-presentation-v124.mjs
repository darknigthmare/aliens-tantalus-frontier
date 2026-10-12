import assert from 'node:assert/strict';
import { SpriteAnimationController, resolvePlayerAnimation, resolveSpriteSheet, resolveSpriteClip, SPRITE_PIVOTS,
  SPRITE_CLIP_SETS } from '../src/sprite-animation-runtime.js';
import { drawPlayerSpriteV81, getEcho9StandingMuzzleOptionsV124 } from '../src/player-visual-contract-v81.js';
import { resolveCombatMuzzleV83 } from '../src/combat-aim-v83.js';
import { getPlayerSourceCropV124, PLAYER_STANDING_HEIGHTS_V124, playerAtlasScaleV124 } from '../src/player-presentation-v124.js';
import { PLAYER_COSTUME_ASSETS_V119 } from '../src/player-costume-skins-v119.js';
import { USER_EQUIPMENT_V95, getUserWeaponTransformV95, drawUserArmorV95, drawUserWeaponV95 } from '../src/user-equipment-v95.js';

const actor = overrides => ({ alive: true, grounded: true, downed: false, x: 100, y: 200, w: 42, h: 92,
  vx: 0, vy: 0, facing: 1, shots: 0, v52FireClock: 0, ...overrides });
const sample = (controller, body, time, options = {}) => controller.sample('player', resolvePlayerAnimation(body), time,
  { physicalActor: body, physicalContext: 'mission:a', ...options });
const image = { complete: true, naturalWidth: 1024, naturalHeight: 1024 };
const approx = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const context = () => ({ globalAlpha: 1, calls: [],
  save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, scale() {},
  translate(...args) { this.calls.push(['translate', ...args]); },
  transform(...args) { this.calls.push(['transform', ...args]); },
  rotate(...args) { this.calls.push(['rotate', ...args]); },
  drawImage(...args) { this.calls.push(['image', ...args]); }
});
const render = (body, sheetId, frame, extra = {}) => {
  const sheet = resolveSpriteSheet(sheetId);
  const ctx = context();
  return { ctx, result: drawPlayerSpriteV81(ctx, { sheet, image, sample: { frame, column: frame % 4, row: Math.floor(frame / 4) },
    pivot: SPRITE_PIVOTS[sheet.pivot], entity: body, surface: 'mission', ...extra }) };
};

let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log(`PASS ${name}`); };

check('aim is explicit and held, keyboard movement alone is not an aiming stance', () => {
  const a = actor({ combatAimV83: { active: true, x: 1, y: 0 } });
  assert.equal(resolvePlayerAnimation(a).clipId, 'idle');
  a.aimingV124 = true;
  const c = new SpriteAnimationController();
  for (let index = 0; index <= 20; index++) {
    const result = sample(c, a, index * .1);
    assert.equal(result.clip.id, 'aim-ready');
    if (index >= 2) assert.equal(result.frame, 3);
  }
});

check('crouch rest, crouch locomotion and backpedal select distinct existing poses', () => {
  assert.equal(resolvePlayerAnimation(actor({ crouching: true })).clipId, 'crouch');
  assert.deepEqual(resolveSpriteClip('player.echo9-marine.locomotion', 'crouch').frames, [12]);
  assert.equal(resolvePlayerAnimation(actor({ crouching: true, aimingV124: true })).clipId, 'crouch-aim');
  assert.equal(resolvePlayerAnimation(actor({ crouching: true, vx: 100 })).clipId, 'crouch-move');
  assert.equal(resolvePlayerAnimation(actor({ vx: -120, facing: 1 })).clipId, 'backpedal');
  assert.deepEqual(resolveSpriteClip('player.echo9-marine.locomotion', 'backpedal').frames, [7, 6, 5, 4]);
});

check('gait follows distance, independent of frame rate and nominal speed', () => {
  const run = (delta, velocity) => {
    const a = actor({ vx: velocity }); const c = new SpriteAnimationController();
    sample(c, a, 0);
    const seconds = 43 / velocity;
    let time = 0; let result;
    while (time < seconds - 1e-9) { const dt = Math.min(delta, seconds - time); time += dt; a.x += velocity * dt; result = sample(c, a, time); }
    return result;
  };
  const slow = run(1 / 30, 86), fast = run(1 / 120, 344);
  assert.equal(slow.frame, fast.frame);
  assert.equal(slow.frame, 6);
  const a = actor({ vx: 220 }); const c = new SpriteAnimationController();
  sample(c, a, 0);
  assert.equal(sample(c, a, .2).frame, 4, 'no walking in place against a wall');
});

check('climb pose and contact markers stop when the ladder movement stops', () => {
  const a = actor({ climbing: true, grounded: false }); const c = new SpriteAnimationController();
  for (let i = 0; i < 12; i++) assert.equal(sample(c, a, i * .1).frame, 14);
  a.vy = -110; a.y -= 22;
  const moving = sample(c, a, 1.2);
  assert.equal(moving.frame, 15);
  assert.equal(moving.events.filter(e => e.event === 'movement:climb-contact').length, 1);
});

check('accepted automatic shots start from a flash-free aim pose and retain recoil/recovery', () => {
  const a = actor(); const c = new SpriteAnimationController(); sample(c, a, 0);
  a.shots = 1; a.v52FireClock = .34;
  const first = sample(c, a, .1); assert.equal(first.frame, 3);
  assert.equal(first.presentationV124.recoil, 1);
  assert.equal(first.events.filter(e => e.event === 'weapon:shot').length, 1);
  a.v52FireClock = .25; assert.equal(sample(c, a, .19).frame, 5);
  a.shots = 2; a.v52FireClock = .34;
  const second = sample(c, a, .2); assert.equal(second.frame, 3);
  assert.equal(second.events.filter(e => e.event === 'weapon:shot').length, 1);
  a.v52FireClock = .1;
  const settled = sample(c, a, .4); assert.equal(settled.frame, 6);
  assert.equal(settled.events.filter(e => e.event === 'weapon:shot').length, 0);
  assert.deepEqual(resolveSpriteClip('player.echo9-marine.combat', 'primary-fire').frames, [3, 5, 6]);
});

check('movement, crouch and flight keep physical posture during a shot', () => {
  for (const [overrides, expected] of [[{ vx: 180 }, 'walk-run'], [{ crouching: true }, 'crouch-aim'], [{ grounded: false, vy: 90 }, 'fall']]) {
    const a = actor(overrides); const c = new SpriteAnimationController(); sample(c, a, 0);
    a.shots++; a.v52FireClock = .34;
    const result = sample(c, a, .1);
    assert.equal(result.clip.id, expected);
    assert.equal(result.presentationV124.recoil, 1);
    assert.equal(result.events.filter(e => e.event === 'weapon:shot').length, 1);
  }
});

check('melee cooldown does not manufacture a firearm discharge', () => {
  const a = actor({ shots: 40, fireClock: .2, meleeClock: 0, v52FireClock: 0 });
  assert.equal(resolvePlayerAnimation(a).clipId, 'idle');
  a.meleeClock = .2; a.meleeKind = 'rifle-bash';
  assert.equal(resolvePlayerAnimation(a).clipId, 'rifle-bash');
});

check('render-before-update retains one physical shot and one set of clip events', () => {
  const a = actor(); const c = new SpriteAnimationController(); sample(c, a, 0);
  a.shots++; a.v52FireClock = .34;
  assert.equal(sample(c, a, .1, { emit: false }).events.length, 0);
  assert.equal(sample(c, a, .1).events.filter(e => e.event === 'weapon:shot').length, 1);
  assert.equal(sample(c, a, .1).events.length, 0);
  const generic = new SpriteAnimationController();
  const request = { sheetId: 'player.echo9-marine.combat', clipId: 'primary-fire' };
  generic.sample('inspection', request, 0, { emit: false });
  const emitted = generic.sample('inspection', request, .08);
  assert.equal(emitted.events.filter(e => e.event === 'weapon:shot').length, 1);
  assert.equal(emitted.events.filter(e => e.event === 'weapon:recoil').length, 1);
});

check('render-before-update retains physical landing event exactly once', () => {
  const a = actor({ grounded: false, vy: 80 }); const c = new SpriteAnimationController(); sample(c, a, 0);
  a.grounded = true; a.vy = 0;
  sample(c, a, .1, { emit: false });
  const result = sample(c, a, .1);
  assert.equal(result.clip.id, 'land');
  assert.equal(result.events.filter(e => e.event === 'ground:contact').length, 1);
  assert.equal(sample(c, a, .1).events.length, 0);
});

check('tactical reload poses use the real reload duration and do not rewind on failure', () => {
  const a = actor({ reloading: true, reloadClock: 3,
    tacticalReload: { phase: 'reloading', weaponKey: 'm41a', elapsed: 0, completeAt: 3 } });
  const c = new SpriteAnimationController();
  assert.equal(sample(c, a, 0).frame, 8);
  let result;
  for (let i = 1; i <= 20; i++) { a.tacticalReload.elapsed = i * .1; a.reloadClock = 3 - i * .1; result = sample(c, a, i * .1); }
  assert.equal(result.frame, 10);
  assert.equal(result.complete, false);
  a.tacticalReload.completeAt = 4;
  a.tacticalReload.elapsed = 2.1; a.reloadClock = 1.9;
  assert.equal(sample(c, a, 2.1).frame, 10, 'failed active reload must not eject its magazine again');
});

check('ground task keeps its work pose until commit and restarts for a fresh action', () => {
  const a = actor({ interactionClock: 4, interactionKind: 'ground-interact',
    placeableActionV124: { kind: 'deploy', serial: 1, elapsed: 0, duration: 4 } });
  const c = new SpriteAnimationController();
  assert.equal(sample(c, a, 0).frame, 8);
  for (let i = 1; i <= 39; i++) {
    a.placeableActionV124.elapsed = i * .1; a.interactionClock = 4 - i * .1;
    const result = sample(c, a, i * .1);
    assert.notEqual(result.frame, 11, 'the standing-up cell is reserved for after the task');
  }
  a.placeableActionV124 = { kind: 'deploy', serial: 2, elapsed: 0, duration: 4 }; a.interactionClock = 4;
  assert.equal(sample(c, a, 4).frame, 8);
  a.placeableActionV124 = null; a.interactionClock = 0;
  const cancelled = sample(c, a, 4.1);
  assert.equal(cancelled.clip.id, 'idle');
  assert.equal(cancelled.presentationV124.action, null);
});

check('downed support and terminal corpse remain distinct across resume and revive', () => {
  const c = new SpriteAnimationController(); const a = actor(); sample(c, a, 0);
  a.alive = false; a.downed = true; a.bleedOut = 12;
  const downed = sample(c, a, .1); assert.equal(downed.clip.id, 'downed'); assert.equal(downed.frame, 14);
  a.downed = false; a.bleedOut = 0;
  assert.equal(sample(c, a, .2).frame, 15);
  c.reset();
  const corpse = sample(c, a, .2); assert.equal(corpse.frame, 15); assert.equal(corpse.events.length, 0);
  a.alive = true; assert.equal(sample(c, a, .3).clip.id, 'idle');
});

check('pause and context reseed cannot advance motion or replay an old shot', () => {
  const c = new SpriteAnimationController(); const a = actor({ aimingV124: true }); sample(c, a, 0);
  const result = sample(c, a, .1);
  assert.deepEqual(sample(c, a, .1).presentationV124, result.presentationV124);
  a.shots = 50;
  const changed = sample(c, a, .1, { physicalContext: 'mission:b' });
  assert.equal(changed.clip.id, 'aim-ready');
  assert.equal(changed.events.filter(e => e.event === 'weapon:shot').length, 0);
  c.reset('player');
  assert.equal(c.snapshot().length, 0);
  assert.equal(c.playerPresentationStatesV124.size, 0);
  assert.equal(c.playerPendingEventsV124.size, 0);
});

check('reduced motion keeps readable action progress while removing cosmetic movement', () => {
  const c = new SpriteAnimationController(); const a = actor(); sample(c, a, 0, { reducedMotion: true });
  a.shots = 1; a.v52FireClock = .34;
  const result = sample(c, a, .1, { reducedMotion: true });
  assert.equal(result.frame, 3);
  assert.equal(result.presentationV124.transform.shearX, 0);
  assert.equal(result.presentationV124.transform.scaleY, 1);
});

check('safe crop removes known stray pixels and puts airborne/landing support on actor feet', () => {
  const body = actor();
  for (const frame of [4, 5, 6, 7, 10, 11]) {
    const { result } = render(body, 'player.echo9-marine.locomotion', frame);
    assert.equal(result.fallback, false);
    const crop = getPlayerSourceCropV124('player.echo9-marine.locomotion', frame);
    const target = result.samplingV124.sprite;
    approx(target.y + (crop.supportY - crop.y) * target.height / crop.height, body.y + body.h);
    if (frame < 8) assert.ok(crop.y > 20);
    if (frame === 10 || frame === 11) assert.ok(crop.y + crop.height < 229);
  }
  assert.ok(getPlayerSourceCropV124('player.echo9-marine.combat', 14).x + getPlayerSourceCropV124('player.echo9-marine.combat', 14).width < 226);
});

check('tool, melee and interaction art preserve the same standing stature', () => {
  for (const [sheetId, height] of Object.entries(PLAYER_STANDING_HEIGHTS_V124)) {
    approx(height * playerAtlasScaleV124(sheetId), 193);
    const { result } = render(actor(), sheetId, 0);
    assert.equal(result.fallback, false);
  }
});

check('cover rises around the foot support and leaves physics unchanged', () => {
  const a = actor({ crouching: true, coverV124: { peeking: true, peekRise: 26 } });
  const before = structuredClone(a); const c = new SpriteAnimationController(); const pose = sample(c, a, 0);
  const { ctx, result } = render(a, pose.sheet.id, pose.frame, { sample: pose });
  assert.equal(result.presentationV124.peekRise, 26);
  assert.ok(result.presentationV124.visualScaleY > 1);
  const translations = ctx.calls.filter(call => call[0] === 'translate');
  assert.deepEqual(translations[0], ['translate', a.x + a.w / 2, a.y + a.h]);
  assert.deepEqual(a, before);
  a.coverV124.peeking = false;
  let lowered;
  for (let index = 1; index <= 10; index++) lowered = sample(c, a, index * .1);
  assert.equal(lowered.clip.id, 'crouch');
  assert.ok(lowered.presentationV124.peekRise < .001);
});

check('dedicated costume rectangles are not treated as a generic 256px grid', () => {
  const costumeImages = new Map(PLAYER_COSTUME_ASSETS_V119.map(asset => [asset.imageKey,
    { complete: true, naturalWidth: asset.sourceWidth, naturalHeight: asset.sourceHeight }]));
  const { result } = render(actor(), 'player.echo9-marine.locomotion', 10,
    { costumeId: 'franchise-nostromo-crew', costumeImages });
  assert.equal(result.skinId, 'player.nostromo-crew-v119');
  assert.equal(result.samplingV124, null);
  assert.notEqual(result.source.width, 256);
});

check('standing shot muzzle agrees with the rendered shouldered barrel in both scene scales and facings', () => {
  for (const surface of ['mission', 'bioforge']) for (const facing of [-1, 1]) {
    const a = actor({ facing });
    const { result } = render(a, 'player.echo9-marine.combat', 3, { surface });
    const muzzle = resolveCombatMuzzleV83(a, { x: facing, y: 0 }, getEcho9StandingMuzzleOptionsV124(a, { surface }));
    const sourceX = facing < 0 ? 256 - 194 : 194;
    const rawX = result.sprite.x + sourceX * result.sprite.width / 256;
    const rawY = result.sprite.y + 96 * result.sprite.height / 256;
    const scale = playerAtlasScaleV124('player.echo9-marine.combat');
    approx(muzzle.x, result.pivot.x + (rawX - result.pivot.x) * scale);
    approx(muzzle.y, result.pivot.y + (rawY - result.pivot.y) * scale);
    if (surface === 'mission') assert.ok(a.y + 37 - muzzle.y > 24, 'the former physical-hitbox shoulder was below the visible barrel');
    else assert.ok(Math.abs(a.y + 37 - muzzle.y) < 3, 'Bioforge must use its own 98px artwork scale');
  }
});

check('standing muzzle calibration leaves other postures, unknown art, and custom anchors alone', () => {
  for (const overrides of [{ vx: 13 }, { crouching: true }, { grounded: false }, { climbing: true },
    { inVehicle: true }, { downed: true }, { reloading: true }, { costumeId: 'franchise-nostromo-crew' },
    { playerVisualV81: { skinId: 'dedicated' } }, { playerVisualV81: { fallback: true } },
    { playerVisualV81: { sheetId: 'player.future-art' } }, { userEquipmentV95: { armorId: 'custom' } },
    { userEquipmentV95: { weaponId: 'custom' } }]) assert.equal(getEcho9StandingMuzzleOptionsV124(actor(overrides)), null);
  assert.equal(getEcho9StandingMuzzleOptionsV124(actor(), { surface: 'hub' }), null);
});

check('a fresh-save costume-001 uniform keeps Echo9 muzzle calibration after the real renderer resolves it', () => {
  const a = actor({ costumeId: 'costume-001' });
  const expected = getEcho9StandingMuzzleOptionsV124(actor());
  assert.deepEqual(getEcho9StandingMuzzleOptionsV124(a), expected, 'a saved appearance ID is not proof of a dedicated atlas');
  const { result } = render(a, 'player.echo9-marine.combat', 3);
  assert.equal(result.fallback, false, 'the actual Echo9 atlas remains available');
  assert.equal(result.sheetId, 'player.echo9-marine.combat');
  assert.ok(result.costumeDegraded);
  assert.equal(result.skinId, undefined);
  a.playerVisualV81 = { sheetId: result.sheetId, fallback: result.fallback, skinId: result.skinId || null,
    costumeId: result.costumeId || null, costumeDegraded: result.costumeDegraded || null };
  assert.deepEqual(getEcho9StandingMuzzleOptionsV124(a), expected);
});

check('optional equipment respects custom grip, one cover offset, and free hands for tools', () => {
  const armor = USER_EQUIPMENT_V95.find(item => item.kind === 'armor');
  const weapon = USER_EQUIPMENT_V95.find(item => item.kind === 'weapon');
  assert.ok(armor && weapon);
  const a = actor({ combatAimV83: { x: 1, y: 0, facing: 1 }, userEquipmentV95: { armorId: armor.id, weaponId: weapon.id } });
  const normal = getUserWeaponTransformV95(a, a.combatAimV83, weapon, armor);
  a.coverV124 = { peeking: true, peekRise: 26 };
  const peek = getUserWeaponTransformV95(a, a.combatAimV83, weapon, armor);
  approx(normal.pivotY - peek.pivotY, 26);
  approx(normal.muzzle.y - peek.muzzle.y, 26);
  const ctx = context();
  assert.equal(drawUserArmorV95(ctx, a, image, armor, { timeSeconds: 1, reducedMotion: true }), true);
  assert.equal(a.playerVisualV95.animationStatus, 'missing', 'static references must not claim authored animation');
  assert.equal(drawUserWeaponV95(ctx, a, image, weapon, armor), true);
  a.toolUseClock = 1;
  assert.equal(drawUserWeaponV95(ctx, a, image, weapon, armor), false);
  assert.equal(a.heldWeaponVisualV95, null);
});

check('all added player clips stay inside their admitted 4x4 atlas', () => {
  for (const set of ['player-locomotion', 'player-combat', 'player-melee-v56', 'player-interaction-v56', 'player-tool-use-v56'])
    for (const clip of SPRITE_CLIP_SETS[set]) assert.ok(clip.frames.every(frame => Number.isInteger(frame) && frame >= 0 && frame < 16));
});

console.log(`Player presentation V124: ${checks} scenario checks passed.`);
